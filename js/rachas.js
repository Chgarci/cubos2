/*
** File description:
** rachas.js
*/

// ============================================================
// IMPORTS
// ============================================================

import { obtenerCompetidor, obtenerFechas } from "./api.js";
import { calcularRachas } from "./streak.js";
import { procesarBusqueda } from "./search.js";
import {
    obtenerNombreEvento,
    obtenerNombreTorneo,
    formatearTiempoWCA
} from "./format.js";
import { inicializarIdioma, obtenerIdiomaActual, t} from "./i18n.js";

inicializarIdioma();

// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const botonBuscar = document.getElementById("buscarBtn");
const campoWcaId = document.getElementById("wcaIdInput");

const mensaje = document.getElementById("mensaje");
const resultado = document.getElementById("resultado");
const sugerencias = document.getElementById("sugerencias");

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

    const texto = campoWcaId.value.trim();

    sugerencias.replaceChildren();

    if (!texto) {

        mensaje.textContent = "Por favor, escribe un WCA ID o un nombre.";
        resultado.hidden = true;

        return;
    }

    resultado.hidden = true;

    await procesarBusqueda(texto, {
        lista: sugerencias,
        mostrarMensaje: texto => { mensaje.textContent = texto; },
        cargar: cargarRachas
    });
}


// ============================================================
// CARGAR RACHAS (ya con WCA ID)
// ============================================================

async function cargarRachas(wcaId) {

    campoWcaId.value = wcaId;

    mensaje.textContent = t("buscando");
    resultado.hidden = true;

    try {

        const data = await obtenerCompetidor(wcaId);

        const ids = Object.keys(data.results || {});

        if (ids.length === 0) {

            mensaje.textContent = t("competidor_sin_resultados");

            return;
        }

        mensaje.textContent = t("cargando_fechas", { hechas: 0, total: ids.length });

        const fechas = await obtenerFechas(
            ids,
            hechas => {
                mensaje.textContent = t("cargando_fechas", { hechas, total: ids.length });
            }
        );

        const competiciones =
            ordenarCronologicamente(data.results, fechas);

        mostrarRachas(data, calcularRachas(competiciones));

        mensaje.textContent = "";

    } catch (error) {

        console.error(error);

        resultado.hidden = true;

        if (error.isI18n) {
            mensaje.textContent = t(error.message, error.context);
        } else {
            mensaje.textContent = t("error_cargar_competidor_fallback");
        }
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

    const idioma = obtenerIdiomaActual();
    // añadir idiomas al mapaLocales si es necesario
    const mapaLocales = {
        es: "es-ES",
        en: "en-US"
    }

    const locale = mapaLocales[idioma] || "es-ES";

    return new Date(fecha + "T00:00:00").toLocaleDateString(
        locale,
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
    return n === 1 ? t("competicion_singular") : t("competicion_plural");
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
            : t("sin_racha_activa");


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
            : t("nunca_pr");


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
                // Traducimos el texto indicativo de que no hubo récords
                crear("span", "sin-pr", t("sin_pr"))
            );
        } else {
            competicion.prs.forEach(pr => {
                // Traducimos los tipos de récord (Single / Average)
                const tipo = pr.tipo === "single" ? t("single_corto") : t("average_corto");
                
                // Traducimos el sufijo de empate si corresponde
                const sufijoEmpate = pr.empate ? t("pr_empate_sufijo") : "";

                const texto =
                    `${obtenerNombreEvento(pr.evento)} · ${tipo} ` +
                    formatearTiempoWCA(pr.valor, pr.evento, pr.tipo) +
                    sufijoEmpate;

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
