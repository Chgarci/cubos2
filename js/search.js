/*
** File description:
** search.js
*/

import { esWcaId, buscarPersonas } from "./api.js";
import { obtenerNombrePais } from "./format.js";
import { t } from "./i18n.js";

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

        const pais = obtenerNombrePais(persona.pais) || t("pais_no_especificado");

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

    mostrarMensaje(t("buscando_por_nombre"));

    let personas;

    try {
        personas = await buscarPersonas(entrada);
    } catch (error) {
        console.error(error);
        if (error.isI18n) {
            mostrarMensaje(t(error.message, error.context));
        } else {
            mostrarMensaje(t("error_buscar_personas_fallback"));
        }
        return;
    }

    if (personas.length === 0) {
        mostrarMensaje(t("sin_resultados_nombre"));
        return;
    }

    if (personas.length === 1) {
        return cargar(personas[0].id); // <-- CORREGIDO: personas[0].id
    }

    mostrarMensaje(t("multiples_resultados"));
    mostrarSugerencias(lista, personas, cargar);
}
