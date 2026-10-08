// ============================================================
// IMPORTS
// ============================================================

import { obtenerCompetidor, obtenerFechas } from "./api.js";
import { calcularRachas } from "./streak.js";
import {
    obtenerNombreEvento,
    obtenerNombreTorneo,
    formatearTiempoWCA
} from "./format.js";


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const botonBuscar = document.getElementById("buscarBtn");
const campoWcaId = document.getElementById("wcaIdInput");

const mensaje = document.getElementById("mensaje");
const resultado = document.getElementById("resultado");

const tablaRachas = document.getElementById("tablaRachas");


// ============================================================
// EVENTOS
// ============================================================

botonBuscar.addEventListener("click", buscarRachas);

campoWcaId.addEventListener("keydown", evento => {

    if (evento.key === "Enter") {
        buscarRachas();
    }
});


// ============================================================
// BUSCAR RACHAS
// ============================================================

async function buscarRachas() {

    const wcaId = campoWcaId.value
        .trim()
        .toUpperCase();

    if (!wcaId) {

        mensaje.textContent = "Por favor, escribe un WCA ID.";
        resultado.hidden = true;

        return;
    }

    mensaje.textContent = "Buscando...";
    resultado.hidden = true;

    try {

        const data = await obtenerCompetidor(wcaId);

        const ids = Object.keys(data.results || {});

        if (ids.length === 0) {

            mensaje.textContent =
                "Este competidor todavía no tiene resultados.";

            return;
        }

        mensaje.textContent =
            `Cargando fechas (0/${ids.length})...`;

        const fechas = await obtenerFechas(
            ids,
            hechas => {
                mensaje.textContent =
                    `Cargando fechas (${hechas}/${ids.length})...`;
            }
        );

        const competiciones =
            ordenarCronologicamente(data.results, fechas);

        mostrarRachas(data, calcularRachas(competiciones));

        mensaje.textContent = "";

    } catch (error) {

        console.error(error);

        resultado.hidden = true;

        mensaje.textContent =
            "No se pudo encontrar el perfil. " +
            "Comprueba que el WCA ID sea correcto " +
            "y que tengas conexión a Internet.";
    }
}


// ============================================================
// ORDENAR DE MÁS ANTIGUA A MÁS RECIENTE
// El JSON viene de más reciente a más antigua: lo invertimos y,
// si tenemos todas las fechas, ordenamos por fecha (el orden
// previo desempata las competiciones del mismo día).
// ============================================================

function ordenarCronologicamente(results, fechas) {

    const lista = Object.keys(results)
        .reverse()
        .map(id => ({
            id,
            fecha: fechas[id] || "",
            categorias: results[id]
        }));

    if (lista.every(competicion => competicion.fecha)) {
        lista.sort((a, b) => a.fecha.localeCompare(b.fecha));
    }

    return lista;
}


// ============================================================
// FORMATO
// ============================================================

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }

    return new Date(fecha + "T00:00:00").toLocaleDateString(
        "es-ES",
        { year: "numeric", month: "short", day: "numeric" }
    );
}

function describirRango(primera, ultima) {

    if (primera.id === ultima.id) {
        return obtenerNombreTorneo(primera.id);
    }

    return `${obtenerNombreTorneo(primera.id)} → ` +
           obtenerNombreTorneo(ultima.id);
}

function textoCompeticiones(n) {

    return n === 1 ? "competición" : "competiciones";
}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarRachas(data, rachas) {

    const { detalle, actual, maxima } = rachas;
    const total = detalle.length;

    document.getElementById("nombre").textContent =
        data.name || "Sin nombre";

    document.getElementById("wcaId").textContent =
        data.id || "-";

    document.getElementById("totalCompeticiones").textContent =
        total;


    // ------------------------------------------------------
    // RACHA ACTUAL
    // ------------------------------------------------------

    document.getElementById("rachaActual").textContent =
        actual;

    document.getElementById("unidadActual").textContent =
        textoCompeticiones(actual);

    document.getElementById("detalleActual").textContent =
        actual > 0
            ? describirRango(detalle[total - actual], detalle[total - 1])
            : "No hay racha activa: en la última competición " +
              "no se consiguió ni igualó ningún PR.";


    // ------------------------------------------------------
    // RACHA MÁS LARGA
    // ------------------------------------------------------

    document.getElementById("rachaMaxima").textContent =
        maxima.longitud;

    document.getElementById("unidadMaxima").textContent =
        textoCompeticiones(maxima.longitud);

    document.getElementById("detalleMaxima").textContent =
        maxima.longitud > 0
            ? describirRango(detalle[maxima.inicio], detalle[maxima.fin])
            : "Nunca se ha conseguido un PR.";


    construirTabla(rachas);

    resultado.hidden = false;
}


// ============================================================
// TABLA (de la más reciente a la más antigua)
// ============================================================

function crear(etiqueta, clase, texto) {

    const elemento = document.createElement(etiqueta);

    if (clase) {
        elemento.className = clase;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}

function construirTabla({ detalle, actual, maxima }) {

    tablaRachas.replaceChildren();

    const total = detalle.length;

    for (let i = total - 1; i >= 0; i--) {

        const competicion = detalle[i];

        const fila = document.createElement("tr");

        if (i >= maxima.inicio && i <= maxima.fin) {
            fila.classList.add("fila-racha-max");
        }

        if (actual > 0 && i >= total - actual) {
            fila.classList.add("fila-racha-actual");
        }


        // Torneo
        fila.appendChild(
            crear("td", "", obtenerNombreTorneo(competicion.id))
        );

        // Fecha
        fila.appendChild(
            crear("td", "celda-fecha", formatearFecha(competicion.fecha))
        );

        // PRs conseguidos
        const celdaPRs = document.createElement("td");

        if (competicion.prs.length === 0) {

            celdaPRs.appendChild(
                crear("span", "sin-pr", "Sin PR")
            );

        } else {

            competicion.prs.forEach(pr => {

                const tipo = pr.tipo === "single" ? "Single" : "Average";

                const texto =
                    `${obtenerNombreEvento(pr.evento)} · ${tipo} ` +
                    formatearTiempoWCA(pr.valor, pr.evento, pr.tipo) +
                    (pr.empate ? " (empate)" : "");

                celdaPRs.appendChild(
                    crear(
                        "span",
                        `pr-etiqueta pr-${pr.tipo}` +
                            (pr.empate ? " pr-empate" : ""),
                        texto
                    )
                );
            });
        }

        fila.appendChild(celdaPRs);

        // Nº de PRs de single y de average en esta competición
        const totalSingles = competicion.prs.filter(
            pr => pr.tipo === "single"
        ).length;

        const totalAverages = competicion.prs.filter(
            pr => pr.tipo === "average"
        ).length;

        fila.appendChild(
            crear("td", "celda-numero numero-single", totalSingles || "-")
        );

        fila.appendChild(
            crear("td", "celda-numero numero-average", totalAverages || "-")
        );

        // Racha en ese momento
        fila.appendChild(
            crear("td", "celda-racha", competicion.racha || "-")
        );

        tablaRachas.appendChild(fila);
    }
}