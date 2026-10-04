/*
** EPITECH PROJECT, 2026
** ver_pb
** File description:
** format.js
*/

import { nombresEventos } from "./config.js";


export function obtenerNombreEvento(idEvento) {

    return nombresEventos[idEvento] ||
        idEvento.toUpperCase();
}


export function obtenerNombreTorneo(nombreTorneo) {

    if (!nombreTorneo) {
        return "";
    }

    return nombreTorneo
        .replace(
            /([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g,
            "$1 $2"
        )
        .replace(
            /([A-Za-zÁÉÍÓÚÑ])(\d)/g,
            "$1 $2"
        )
        .replace(
            /(\d)([A-Za-zÁÉÍÓÚÑ])/g,
            "$1 $2"
        );
}


export function formatearTiempoWCA(
    valor,
    idCategoria,
    tipo = "single"
) {

    // --------------------------------------------------------
    // DNS
    // --------------------------------------------------------

    if (valor === -2) {
        return "DNS";
    }


    // --------------------------------------------------------
    // DNF
    // --------------------------------------------------------

    if (valor === -1) {
        return "DNF";
    }


    // --------------------------------------------------------
    // SIN RESULTADO
    // --------------------------------------------------------

    if (
        valor === 0 ||
        valor === null ||
        valor === undefined
    ) {
        return "-";
    }


    // --------------------------------------------------------
    // FEWEST MOVES
    // --------------------------------------------------------

    if (idCategoria === "333fm") {

        if (tipo === "average") {

            return (
                (valor / 100).toFixed(2) +
                " movimientos"
            );
        }

        return valor + " movimientos";
    }


    // --------------------------------------------------------
    // MULTI-BLIND
    // --------------------------------------------------------

    if (idCategoria === "333mbf") {

        return formatearMBF(valor);
    }


    // --------------------------------------------------------
    // TIEMPOS NORMALES
    // --------------------------------------------------------

    const segundosTotales =
        valor / 100;


    if (segundosTotales < 60) {

        return (
            segundosTotales.toFixed(2) +
            "s"
        );
    }


    const minutos =
        Math.floor(
            segundosTotales / 60
        );


    const segundos =
        segundosTotales % 60;


    const segundosFormateados =
        segundos.toFixed(2).padStart(5, "0");


    return (
        `${minutos}:${segundosFormateados}`
    );
}


// ============================================================
// FORMATEAR MULTI-BLIND
// ============================================================

function formatearMBF(valor) {

    const numero =
        String(valor).padStart(9, "0");


    const diferenciaCodificada =
        parseInt(
            numero.substring(1, 3),
            10
        );


    const tiempo =
        parseInt(
            numero.substring(3, 8),
            10
        );


    const fallados =
        parseInt(
            numero.substring(8, 9),
            10
        );


    const diferencia =
        99 - diferenciaCodificada;


    const resueltos =
        diferencia + fallados;


    const intentados =
        resueltos + fallados;


    if (tiempo === 99999) {

        return (
            `${resueltos}/${intentados}`
        );
    }


    const horas =
        Math.floor(
            tiempo / 3600
        );


    const minutos =
        Math.floor(
            (tiempo % 3600) / 60
        );


    const segundos =
        tiempo % 60;


    let tiempoFormateado;


    if (horas > 0) {

        tiempoFormateado =
            `${horas}:${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

    } else {

        tiempoFormateado =
            `${minutos}:${String(segundos).padStart(2, "0")}`;
    }


    return (
        `${resueltos}/${intentados} en ${tiempoFormateado}`
    );
}


// ============================================================
// AÑADIR COLOR SEGÚN RESULTADO
// ============================================================

export function aplicarColorResultado(
    elemento,
    valor
) {

    if (valor === -1) {

        elemento.classList.add("dnf");

    } else if (valor === -2) {

        elemento.classList.add("dns");
    }
}
