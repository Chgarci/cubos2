/*
** EPITECH PROJECT, 2026
** ver_pb
** File description:
** api.js
*/

import { API_BASE } from "./config.js";

// Misma carpeta del repositorio, pero con las competiciones
const COMPETICIONES_BASE =
    API_BASE.replace("/persons/", "/competitions/");

// Cuántas competiciones se piden a la vez
const PETICIONES_SIMULTANEAS = 10;


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


// ============================================================
// FECHA DE UNA COMPETICIÓN (con caché en el navegador)
// ============================================================

async function obtenerFechaCompeticion(idCompeticion) {

    const clave = `cubestats-fecha-${idCompeticion}`;

    try {
        const guardada = localStorage.getItem(clave);

        if (guardada) {
            return guardada;
        }
    } catch {
        // localStorage no disponible: seguimos sin caché
    }

    const respuesta = await fetch(
        `${COMPETICIONES_BASE}${idCompeticion}.json`
    );

    if (!respuesta.ok) {
        throw new Error(
            `No se encontró la competición ${idCompeticion}`
        );
    }

    const competicion = await respuesta.json();
    const fecha = competicion.date?.from || "";

    try {
        if (fecha) {
            localStorage.setItem(clave, fecha);
        }
    } catch {
        // ignorar
    }

    return fecha;
}


// ============================================================
// FECHAS DE VARIAS COMPETICIONES
// Devuelve { idCompeticion: "AAAA-MM-DD" } ("" si falla)
// ============================================================

export async function obtenerFechas(ids, alProgreso = () => {}) {

    const fechas = {};
    let siguiente = 0;
    let completadas = 0;

    async function trabajador() {

        while (siguiente < ids.length) {

            const id = ids[siguiente++];

            try {
                fechas[id] = await obtenerFechaCompeticion(id);
            } catch {
                fechas[id] = "";
            }

            completadas++;
            alProgreso(completadas);
        }
    }

    const trabajadores = Array.from(
        { length: Math.min(PETICIONES_SIMULTANEAS, ids.length) },
        trabajador
    );

    await Promise.all(trabajadores);

    return fechas;
}