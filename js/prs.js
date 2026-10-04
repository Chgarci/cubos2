/*
** EPITECH PROJECT, 2026
** ver_pb
** File description:
** prs.js
*/

import {
    obtenerNombreEvento,
    obtenerNombreTorneo,
    formatearTiempoWCA,
    aplicarColorResultado
} from "./format.js";


export function construirPRs(data) {

    const tablaPRs =
        document.getElementById("tablaPRs");

    tablaPRs.replaceChildren();


    const mapaPRs = {};


    const singles =
        data.rank?.singles || [];


    const averages =
        data.rank?.averages || [];


    // ========================================================
    // SINGLES
    // ========================================================

    singles.forEach(item => {

        if (!mapaPRs[item.eventId]) {

            mapaPRs[item.eventId] = {

                eventId: item.eventId,

                single: 0,
                average: 0,

                torneoSingle: "",
                torneoAverage: ""
            };
        }


        mapaPRs[item.eventId].single =
            item.best;
    });


    // ========================================================
    // AVERAGES
    // ========================================================

    averages.forEach(item => {

        if (!mapaPRs[item.eventId]) {

            mapaPRs[item.eventId] = {

                eventId: item.eventId,

                single: 0,
                average: 0,

                torneoSingle: "",
                torneoAverage: ""
            };
        }


        mapaPRs[item.eventId].average =
            item.best;
    });


    // ========================================================
    // BUSCAR COMPETICIONES
    // ========================================================

    buscarTorneosPR(
        data,
        mapaPRs
    );


    const listaPRs =
        Object.values(mapaPRs);


    // ========================================================
    // CREAR FILAS
    // ========================================================

    listaPRs.forEach(pr => {

        const fila =
            document.createElement("tr");


        // ----------------------------------------------------
        // CATEGORÍA
        // ----------------------------------------------------

        const categoria =
            document.createElement("td");


        categoria.textContent =
            obtenerNombreEvento(
                pr.eventId
            );


        // ----------------------------------------------------
        // SINGLE
        // ----------------------------------------------------

        const single =
            document.createElement("td");


        if (
            pr.single > 0 ||
            pr.single === -1 ||
            pr.single === -2
        ) {

            const tiempoSingle =
                document.createElement("div");


            tiempoSingle.textContent =
                formatearTiempoWCA(
                    pr.single,
                    pr.eventId,
                    "single"
                );


            tiempoSingle.classList.add(
                "tiempo-single"
            );


            aplicarColorResultado(
                tiempoSingle,
                pr.single
            );


            const torneoSingle =
                document.createElement("div");


            torneoSingle.textContent =
                obtenerNombreTorneo(
                    pr.torneoSingle
                ) ||
                "Competición no encontrada";


            torneoSingle.classList.add(
                "torneo-pr"
            );


            single.appendChild(
                tiempoSingle
            );


            single.appendChild(
                torneoSingle
            );

        } else {

            single.textContent = "-";
        }


        // ----------------------------------------------------
        // AVERAGE
        // ----------------------------------------------------

        const average =
            document.createElement("td");


        if (
            pr.average > 0 ||
            pr.average === -1 ||
            pr.average === -2
        ) {

            const tiempoAverage =
                document.createElement("div");


            tiempoAverage.textContent =
                formatearTiempoWCA(
                    pr.average,
                    pr.eventId,
                    "average"
                );


            tiempoAverage.classList.add(
                "tiempo-average"
            );


            aplicarColorResultado(
                tiempoAverage,
                pr.average
            );


            const torneoAverage =
                document.createElement("div");


            torneoAverage.textContent =
                obtenerNombreTorneo(
                    pr.torneoAverage
                ) ||
                "Competición no encontrada";


            torneoAverage.classList.add(
                "torneo-pr"
            );


            average.appendChild(
                tiempoAverage
            );


            average.appendChild(
                torneoAverage
            );

        } else {

            average.textContent = "-";
        }


        // ----------------------------------------------------
        // AÑADIR LAS 3 COLUMNAS
        // ----------------------------------------------------

        fila.appendChild(categoria);
        fila.appendChild(single);
        fila.appendChild(average);

        tablaPRs.appendChild(fila);
    });


    // ========================================================
    // SIN PRs
    // ========================================================

    if (listaPRs.length === 0) {

        const fila =
            document.createElement("tr");


        const celda =
            document.createElement("td");


        celda.colSpan = 3;


        celda.textContent =
            "No hay récords registrados.";


        fila.appendChild(celda);


        tablaPRs.appendChild(fila);
    }
}


// ============================================================
// BUSCAR COMPETICIONES DE LOS PRs
// ============================================================

function buscarTorneosPR(
    data,
    mapaPRs
) {

    if (!data.results) {
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

                    const pr =
                        mapaPRs[idCategoria];


                    if (!pr) {
                        return;
                    }


                    rondas.forEach(
                        ronda => {

                            // --------------------------------
                            // SINGLE
                            // --------------------------------

                            if (
                                pr.single !== 0 &&
                                ronda.best === pr.single &&
                                !pr.torneoSingle
                            ) {

                                pr.torneoSingle =
                                    nombreTorneo;
                            }


                            // --------------------------------
                            // AVERAGE
                            // --------------------------------

                            if (
                                pr.average !== 0 &&
                                ronda.average === pr.average &&
                                !pr.torneoAverage
                            ) {

                                pr.torneoAverage =
                                    nombreTorneo;
                            }
                        }
                    );
                }
            );
        }
    );
}
