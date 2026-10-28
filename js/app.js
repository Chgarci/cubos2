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

        mostrarMensaje(
            "Por favor, escribe un WCA ID o un nombre."
        );

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

    mostrarMensaje("Buscando...");

    perfil.hidden = true;

    try {

        const data =
            await obtenerCompetidor(wcaId);

        mostrarPerfil(data);

        mensaje.textContent = "";

    } catch (error) {

        console.error(error);

        perfil.hidden = true;

        mostrarMensaje(
            "No se pudo encontrar el perfil. " +
            "Comprueba que el WCA ID sea correcto " +
            "y que tengas conexión a Internet."
        );
    }
}


// ============================================================
// MOSTRAR MENSAJE
// ============================================================

function mostrarMensaje(texto) {

    mensaje.textContent = texto;
}