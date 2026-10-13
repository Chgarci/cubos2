/*
** EPITECH PROJECT, 2026
** ver_pb
** File description:
** search.js
*/


import { esWcaId, buscarPersonas } from "./api.js";
import { obtenerNombrePais } from "./format.js";

const MAX_SUGERENCIAS = 10;


// ============================================================
// LISTA DE SUGERENCIAS
// ============================================================

function mostrarSugerencias(lista, personas, alElegir) {

    lista.replaceChildren();

    personas.slice(0, MAX_SUGERENCIAS).forEach(persona => {

        const item = document.createElement("li");
        const boton = document.createElement("button");

        boton.type = "button";

        const pais = obtenerNombrePais(persona.pais) || "No especificado";

        boton.textContent =
            `${persona.nombre} · ${persona.id}` +
            (persona.pais ? ` · ${pais}` : "");

        boton.addEventListener("click", () => {
            lista.replaceChildren();
            alElegir(persona.id);
        });

        item.appendChild(boton);
        lista.appendChild(item);
    });
}


// ============================================================
// PROCESAR LO QUE ESCRIBE EL USUARIO
// - WCA ID  -> se carga directamente
// - nombre  -> se busca en la API oficial y se pasa el WCA ID
//              a la función `cargar`
// ============================================================

export async function procesarBusqueda(
    texto,
    { lista, mostrarMensaje, cargar }
) {

    lista.replaceChildren();

    const entrada = texto.trim();
    const comoId = entrada.toUpperCase();

    if (esWcaId(comoId)) {
        return cargar(comoId);
    }

    mostrarMensaje("Buscando por nombre...");

    let personas;

    try {
        personas = await buscarPersonas(entrada);
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo buscar por nombre. Inténtalo de nuevo.");
        return;
    }

    if (personas.length === 0) {
        mostrarMensaje("No se encontró ningún competidor con ese nombre.");
        return;
    }

    if (personas.length === 1) {
        return cargar(personas[0].id);
    }

    mostrarMensaje("Hay varios resultados, elige uno:");
    mostrarSugerencias(lista, personas, cargar);
}