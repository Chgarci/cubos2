/*
** EPITECH PROJECT, 2026
** ver_pb
** File description:
** history.js
*/

import {
    obtenerNombreEvento,
    obtenerNombreTorneo,
    formatearTiempoWCA,
    aplicarColorResultado
} from "./format.js";


export function construirHistorial(data) {

    const tablaHistorial =
        document.getElementById("tablaHistorial");

    tablaHistorial.replaceChildren();


    if (
        !data.results ||
        Object.keys(data.results).length === 0
    ) {

        mostrarSinResultados(
            tablaHistorial
        );

        return;
    }


    Object.entries(
        data.results
    ).forEach(
        ([nombreTorneo, categorias]) => {

            Object.entries(
                categorias
            ).forEach(
                ([idCategoria, rondas]) => {

                    rondas.forEach(
                        ronda => {

                            const fila =
                                document.createElement("tr");


                            // ------------------------------------------------
                            // TORNEO
                            // ------------------------------------------------

                            const torneo =
                                document.createElement("td");

                            torneo.textContent =
                                obtenerNombreTorneo(
                                    nombreTorneo
                                );


                            // ------------------------------------------------
                            // CATEGORÍA
                            // ------------------------------------------------

                            const categoria =
                                document.createElement("td");

                            categoria.textContent =
                                obtenerNombreEvento(
                                    idCategoria
                                );


                            // ------------------------------------------------
                            // RONDA
                            // ------------------------------------------------

                            const rondaElemento =
                                document.createElement("td");

                            rondaElemento.textContent =
                                ronda.round || "-";


                            // ------------------------------------------------
                            // MEJOR
                            // ------------------------------------------------

                            const mejor =
                                document.createElement("td");

                            mejor.textContent =
                                formatearTiempoWCA(
                                    ronda.best,
                                    idCategoria,
                                    "single"
                                );

                            aplicarColorResultado(
                                mejor,
                                ronda.best
                            );


                            // ------------------------------------------------
                            // MEDIA
                            // ------------------------------------------------

                            const media =
                                document.createElement("td");

                            media.textContent =
                                formatearTiempoWCA(
                                    ronda.average,
                                    idCategoria,
                                    "average"
                                );

                            aplicarColorResultado(
                                media,
                                ronda.average
                            );


                            // ------------------------------------------------
                            // AÑADIR FILA
                            // ------------------------------------------------

                            fila.appendChild(torneo);
                            fila.appendChild(categoria);
                            fila.appendChild(rondaElemento);
                            fila.appendChild(mejor);
                            fila.appendChild(media);

                            tablaHistorial.appendChild(fila);
                        }
                    );
                }
            );
        }
    );
}


// ============================================================
// SIN RESULTADOS
// ============================================================

function mostrarSinResultados(tablaHistorial) {

    const fila =
        document.createElement("tr");


    const celda =
        document.createElement("td");


    celda.colSpan = 5;


    celda.textContent =
        "No hay resultados registrados.";


    fila.appendChild(celda);


    tablaHistorial.appendChild(fila);
}
