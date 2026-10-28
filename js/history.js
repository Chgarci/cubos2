/*
** File description:
** history.js
*/

import {
    obtenerNombreEvento,
    obtenerNombreTorneo,
    formatearTiempoWCA,
    aplicarColorResultado
} from "./format.js";

// Variables persistentes para guardar el estado actual
let historialGlobal = [];
let filtrosInicializados = false;

export function construirHistorial(data) {
    if (!data.results || Object.keys(data.results).length === 0) {
        const tablaHistorial = document.getElementById("tablaHistorial");
        tablaHistorial.replaceChildren();
        mostrarSinResultados(tablaHistorial);
        return;
    }

    // 1. Aplanar la estructura de datos una sola vez
    historialGlobal = [];
    Object.entries(data.results).forEach(([nombreTorneo, categorias]) => {
        Object.entries(categorias).forEach(([idCategoria, rondas]) => {
            rondas.forEach(ronda => {
                historialGlobal.push({
                    nombreTorneo,
                    idCategoria,
                    ronda: ronda.round || "-",
                    best: ronda.best,
                    average: ronda.average
                });
            });
        });
    });

    // 2. Escuchar los filtros del HTML (solo una vez para evitar duplicar eventos)
    if (!filtrosInicializados) {
        document.getElementById("filtroTorneo").addEventListener("input", aplicarFiltros);
        document.getElementById("filtroCategoria").addEventListener("change", aplicarFiltros);
        filtrosInicializados = true;
    }

    // 3. Renderizar por primera vez con todos los datos
    aplicarFiltros();
}

// ============================================================
// FUNCIÓN DE FILTRADO Y RENDERIZADO
// ============================================================
function aplicarFiltros() {
    const tablaHistorial = document.getElementById("tablaHistorial");
    tablaHistorial.replaceChildren();

    // Obtener los valores actuales de los inputs
    const busquedaTorneo = document.getElementById("filtroTorneo").value.toLowerCase();
    const categoriaSeleccionada = document.getElementById("filtroCategoria").value;

    const fragmento = document.createDocumentFragment();
    let filasContadas = 0;

    // Filtrar el array en memoria
    historialGlobal.forEach(item => {
        const nombreLegibleTorneo = obtenerNombreTorneo(item.nombreTorneo).toLowerCase();
        
        // Comprobar condiciones del filtro
        const coincideTorneo = nombreLegibleTorneo.includes(busquedaTorneo);
        const coincideCategoria = categoriaSeleccionada === "" || item.idCategoria === categoriaSeleccionada;

        if (coincideTorneo && coincideCategoria) {
            filasContadas++;
            
            const fila = document.createElement("tr");

            // Torneo
            const torneo = document.createElement("td");
            torneo.textContent = obtenerNombreTorneo(item.nombreTorneo);

            // Categoría
            const categoria = document.createElement("td");
            categoria.textContent = obtenerNombreEvento(item.idCategoria);

            // Ronda
            const rondaElemento = document.createElement("td");
            rondaElemento.textContent = item.ronda;

            // Mejor
            const mejor = document.createElement("td");
            mejor.textContent = formatearTiempoWCA(item.best, item.idCategoria, "single");
            aplicarColorResultado(mejor, item.best);

            // Media
            const media = document.createElement("td");
            media.textContent = formatearTiempoWCA(item.average, item.idCategoria, "average");
            aplicarColorResultado(media, item.average);

            fila.appendChild(torneo);
            fila.appendChild(categoria);
            fila.appendChild(rondaElemento);
            fila.appendChild(mejor);
            fila.appendChild(media);

            fragmento.appendChild(fila);
        }
    });

    // Si los filtros excluyen todo, mostrar mensaje de vacío
    if (filasContadas === 0) {
        mostrarSinResultados(tablaHistorial);
    } else {
        tablaHistorial.appendChild(fragmento);
    }
}

// ============================================================
// SIN RESULTADOS
// ============================================================
function mostrarSinResultados(tablaHistorial) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.textContent = "No hay resultados registrados.";
    fila.appendChild(celda);
    tablaHistorial.appendChild(fila);
}
