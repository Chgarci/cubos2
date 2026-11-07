/*
** File description:
** format.js
*/

import { nombresEventos, traducciones } from "./config.js";
import { obtenerIdiomaActual } from "./i18n.js";

export function obtenerNombrePais(codigoPais) {

    if (!codigoPais) {
        return "";
    }

    const idioma = obtenerIdiomaActual();
    const codigo = codigoPais.toUpperCase();

    return traducciones[idioma].paises[codigo] || codigo
}

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

    // Los 2 primeros dígitos (posiciones 0 y 1)
    const diferenciaCodificada =
        parseInt(
            numero.substring(0, 2),
            10
        );

    // Los 5 dígitos centrales (posiciones 2, 3, 4, 5 y 6)
    const tiempo =
        parseInt(
            numero.substring(2, 7),
            10
        );

    // Los 2 últimos dígitos (posiciones 7 y 8)
    const fallados =
        parseInt(
            numero.substring(7, 9),
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
