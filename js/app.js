// ============================================================
// IMPORTS
// ============================================================

import { obtenerCompetidor } from "./api.js";
import { mostrarPerfil } from "./profile.js";


// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const botonBuscar = document.getElementById("buscarBtn");
const campoWcaId = document.getElementById("wcaIdInput");

const mensaje = document.getElementById("mensaje");
const perfil = document.getElementById("perfil");


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
// BUSCAR COMPETIDOR
// ============================================================

async function buscarCompetidor() {

    const wcaId = campoWcaId.value
        .trim()
        .toUpperCase();


    if (!wcaId) {

        mostrarMensaje(
            "Por favor, escribe un WCA ID."
        );

        perfil.hidden = true;

        return;
    }


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
