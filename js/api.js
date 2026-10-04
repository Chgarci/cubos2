/*
** EPITECH PROJECT, 2026
** ver_pb
** File description:
** api.js
*/

import { API_BASE } from "./config.js";

export async function obtenerCompetidor(wcaId) {

    const respuesta = await fetch(
        `${API_BASE}${wcaId}.json`
    );

    if (!respuesta.ok) {
        throw new Error(
            `No se encontró el WCA ID ${wcaId}`
        );
    }

    return await respuesta.json();
}
