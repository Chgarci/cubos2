

// ============================================================
// ELEMENTOS DEL HTML
// ============================================================

const botonBuscar = document.getElementById("buscarBtn");
const campoWcaId = document.getElementById("wcaIdInput");

const mensaje = document.getElementById("mensaje");
const perfil = document.getElementById("perfil");

const nombreElemento = document.getElementById("nombre");
const wcaIdElemento = document.getElementById("wcaId");
const paisElemento = document.getElementById("pais");
const competenciasElemento = document.getElementById("competencias");

const tablaPRs = document.getElementById("tablaPRs");
const tablaHistorial = document.getElementById("tablaHistorial");




// ============================================================
// FORMATEAR TIEMPOS WCA
// ============================================================




// ============================================================
// BOTÓN BUSCAR
// ============================================================

botonBuscar.addEventListener(
    "click",
    buscarCompetidor
);


// ============================================================
// ENTER PARA BUSCAR
// ============================================================

campoWcaId.addEventListener(
    "keydown",
    function (evento) {

        if (evento.key === "Enter") {

            buscarCompetidor();
        }
    }
);


// ============================================================
// BUSCAR COMPETIDOR
// ============================================================

async function buscarCompetidor() {

    const wcaId =
        campoWcaId.value
            .trim()
            .toUpperCase();


    // --------------------------------------------------------
    // ID VACÍO
    // --------------------------------------------------------

    if (!wcaId) {

        mostrarMensaje(
            "Por favor, escribe un WCA ID."
        );

        perfil.hidden = true;

        return;
    }


    // --------------------------------------------------------
    // BUSCANDO
    // --------------------------------------------------------

    mostrarMensaje("Buscando...");

    perfil.hidden = true;


    try {

        const respuesta =
            await fetch(
                `${API_BASE}${wcaId}.json`
            );


        if (!respuesta.ok) {

            throw new Error(
                `No se encontró el WCA ID ${wcaId}`
            );
        }


        const data =
            await respuesta.json();


        console.log(
            "Datos encontrados:",
            data
        );


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
// MOSTRAR PERFIL
// ============================================================

function mostrarPerfil(data) {

    const nombre =
        data.name || "Sin nombre";


    const pais =
        data.countryId ||
        data.country ||
        "No especificado";


    const competencias =
        data.numberOfCompetitions ?? 0;


    const id =
        data.id || "-";


    nombreElemento.textContent =
        nombre;


    wcaIdElemento.textContent =
        id;


    paisElemento.textContent =
        pais;


    competenciasElemento.textContent =
        competencias;


    construirPRs(data);

    construirHistorial(data);


    perfil.hidden = false;
}








// ============================================================
// MOSTRAR MENSAJE
// ============================================================

function mostrarMensaje(texto) {

    mensaje.textContent =
        texto;
}
