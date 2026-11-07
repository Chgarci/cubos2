/*
** File description:
** app.js
*/

// ============================================================
// IMPORTS
// ============================================================

import { obtenerCompetidor } from "./api.js";
import { mostrarPerfil } from "./profile.js";
import { procesarBusqueda } from "./search.js";
import { inicializarIdioma, t } from "./i18n.js";

inicializarIdioma();


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const botonBuscar = document.getElementById("buscarBtn");
const campoWcaId = document.getElementById("wcaIdInput");

const mensaje = document.getElementById("mensaje");
const perfil = document.getElementById("perfil");
const sugerencias = document.getElementById("sugerencias");


// ============================================================
// EVENTOS
// ============================================================

botonBuscar.addEventListener("click", buscarCompetidor);

campoWcaId.addEventListener("keydown", evento => {

    if (evento.key === "Enter") {
        buscarCompetidor();
    }

});


// ============================================================
// BUSCAR (WCA ID o nombre)
// ============================================================

async function buscarCompetidor() {

    const texto = campoWcaId.value.trim();

    sugerencias.replaceChildren();

    if (!texto) {

        mostrarMensaje(t("escribe_id_o_nombre"));

        perfil.hidden = true;

        return;
    }

    perfil.hidden = true;

    await procesarBusqueda(texto, {
        lista: sugerencias,
        mostrarMensaje,
        cargar: cargarCompetidor
    });
}


// ============================================================
// CARGAR COMPETIDOR (ya con WCA ID)
// ============================================================

async function cargarCompetidor(wcaId) {

    campoWcaId.value = wcaId;

    mostrarMensaje(t("buscando"));

    perfil.hidden = true;

    try {

        const data =
            await obtenerCompetidor(wcaId);

        mostrarPerfil(data);

        mensaje.textContent = "";

    } catch (error) {

        console.error(error);

        perfil.hidden = true;

        if (error.isI18n) {
            mostrarMensaje(t(error.message, error.context));
        } else {
            // Error genérico por si falla internet
            mostrarMensaje(t("error_cargar_competidor_fallback"));
        }
    }
}


// ============================================================
// MOSTRAR MENSAJE
// ============================================================

function mostrarMensaje(texto) {

    mensaje.textContent = texto;
}