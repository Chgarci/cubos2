// ============================================================
// CONFIGURACIÓN
// ============================================================

const API_BASE =
    "https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/refs/heads/v1/persons/";


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
// NOMBRES DE LAS CATEGORÍAS
// ============================================================

const nombresEventos = {

    "222": "2x2x2",
    "333": "3x3x3",
    "444": "4x4x4",
    "555": "5x5x5",
    "666": "6x6x6",
    "777": "7x7x7",

    "333oh": "3x3x3 OH",
    "333bf": "3x3x3 BLD",
    "333fm": "3x3x3 Fewest Moves",
    "333mbf": "3x3x3 Multi-Blind",

    "444bf": "4x4x4 BLD",
    "555bf": "5x5x5 BLD",

    "clock": "Clock",
    "minx": "Megaminx",
    "pyram": "Pyraminx",
    "skewb": "Skewb",
    "sq1": "Square-1",

    "magic": "Rubik's Magic",
    "mmagic": "Master Magic"
};


// ============================================================
// OBTENER NOMBRE DEL EVENTO
// ============================================================

function obtenerNombreEvento(idEvento) {

    return nombresEventos[idEvento] ||
        idEvento.toUpperCase();
}

function obtenerNombreTorneo(nombreTorneo) {

    if (!nombreTorneo) {
        return "";
    }

    return nombreTorneo
        .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2")
        .replace(/([A-Za-zÁÉÍÓÚÑ])(\d)/g, "$1 $2")
        .replace(/(\d)([A-Za-zÁÉÍÓÚÑ])/g, "$1 $2");
}



// ============================================================
// FORMATEAR TIEMPOS WCA
// ============================================================

function formatearTiempoWCA(
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


    // Menos de un minuto

    if (segundosTotales < 60) {

        return (
            segundosTotales.toFixed(2) +
            "s"
        );
    }


    // Minutos

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

    /*
        Formato WCA:

        0DDTTTTTMM

        DD = diferencia codificada
        TTTTT = tiempo
        MM = fallados
    */


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


    // Tiempo desconocido

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

function aplicarColorResultado(
    elemento,
    valor
) {

    if (valor === -1) {

        elemento.classList.add("dnf");

    } else if (valor === -2) {

        elemento.classList.add("dns");
    }
}


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
// CONSTRUIR TABLA DE PRs
// ============================================================

function construirPRs(data) {

    tablaPRs.replaceChildren();


    const mapaPRs = {};


    const singles =
        data.rank?.singles || [];


    const averages =
        data.rank?.averages || [];


    // ========================================================
    // SINGLES
    // ========================================================

    singles.forEach(item => {

        if (!mapaPRs[item.eventId]) {

            mapaPRs[item.eventId] = {

                eventId: item.eventId,

                single: 0,
                average: 0,

                torneoSingle: "",
                torneoAverage: ""
            };
        }


        mapaPRs[item.eventId].single =
            item.best;
    });


    // ========================================================
    // AVERAGES
    // ========================================================

    averages.forEach(item => {

        if (!mapaPRs[item.eventId]) {

            mapaPRs[item.eventId] = {

                eventId: item.eventId,

                single: 0,
                average: 0,

                torneoSingle: "",
                torneoAverage: ""
            };
        }


        mapaPRs[item.eventId].average =
            item.best;
    });


    // ========================================================
    // BUSCAR COMPETICIONES
    // ========================================================

    buscarTorneosPR(
        data,
        mapaPRs
    );


    const listaPRs =
        Object.values(mapaPRs);


    // ========================================================
    // CREAR FILAS
    // ========================================================

    listaPRs.forEach(pr => {

        const fila =
            document.createElement("tr");


        // ----------------------------------------------------
        // CATEGORÍA
        // ----------------------------------------------------

        const categoria =
            document.createElement("td");


        categoria.textContent =
            obtenerNombreEvento(
                pr.eventId
            );


        // ----------------------------------------------------
        // SINGLE
        // ----------------------------------------------------

        const single =
            document.createElement("td");


        if (
            pr.single > 0 ||
            pr.single === -1 ||
            pr.single === -2
        ) {

            const tiempoSingle =
                document.createElement("div");


            tiempoSingle.textContent =
                formatearTiempoWCA(
                    pr.single,
                    pr.eventId,
                    "single"
                );


            tiempoSingle.classList.add(
                "tiempo-single"
            );


            aplicarColorResultado(
                tiempoSingle,
                pr.single
            );


            const torneoSingle =
                document.createElement("div");


            torneoSingle.textContent = obtenerNombreTorneo(pr.torneoSingle) ||
                "Competición no encontrada";


            torneoSingle.classList.add(
                "torneo-pr"
            );


            single.appendChild(
                tiempoSingle
            );


            single.appendChild(
                torneoSingle
            );

        } else {

            single.textContent = "-";
        }


        // ----------------------------------------------------
        // AVERAGE
        // ----------------------------------------------------

        const average =
            document.createElement("td");


        if (
            pr.average > 0 ||
            pr.average === -1 ||
            pr.average === -2
        ) {

            const tiempoAverage =
                document.createElement("div");


            tiempoAverage.textContent =
                formatearTiempoWCA(
                    pr.average,
                    pr.eventId,
                    "average"
                );


            tiempoAverage.classList.add(
                "tiempo-average"
            );


            aplicarColorResultado(
                tiempoAverage,
                pr.average
            );


            const torneoAverage =
                document.createElement("div");


            torneoAverage.textContent = obtenerNombreTorneo(pr.torneoAverage) || 
                "Competición no encontrada";


            torneoAverage.classList.add(
                "torneo-pr"
            );


            average.appendChild(
                tiempoAverage
            );


            average.appendChild(
                torneoAverage
            );

        } else {

            average.textContent = "-";
        }


        // ----------------------------------------------------
        // AÑADIR LAS 3 COLUMNAS
        // ----------------------------------------------------

        fila.appendChild(categoria);

        fila.appendChild(single);

        fila.appendChild(average);


        tablaPRs.appendChild(fila);
    });


    // ========================================================
    // SIN PRs
    // ========================================================

    if (listaPRs.length === 0) {

        const fila =
            document.createElement("tr");


        const celda =
            document.createElement("td");


        celda.colSpan = 3;


        celda.textContent =
            "No hay récords registrados.";


        fila.appendChild(celda);


        tablaPRs.appendChild(fila);
    }
}


// ============================================================
// BUSCAR COMPETICIONES DE LOS PRs
// ============================================================

function buscarTorneosPR(
    data,
    mapaPRs
) {

    if (!data.results) {
        return;
    }


    Object.entries(
        data.results
    ).forEach(
        ([nombreTorneo, categorias]) => {


            Object.entries(
                categorias
            ).forEach(
                ([idCategoria, rondas]) => {


                    const pr =
                        mapaPRs[idCategoria];


                    if (!pr) {
                        return;
                    }


                    rondas.forEach(
                        ronda => {


                            // --------------------------------
                            // SINGLE
                            // --------------------------------

                            if (
                                pr.single !== 0 &&
                                ronda.best === pr.single &&
                                !pr.torneoSingle
                            ) {

                                pr.torneoSingle =
                                    nombreTorneo;
                            }


                            // --------------------------------
                            // AVERAGE
                            // --------------------------------

                            if (
                                pr.average !== 0 &&
                                ronda.average === pr.average &&
                                !pr.torneoAverage
                            ) {

                                pr.torneoAverage = nombreTorneo;
                            }

                        }
                    );
                }
            );
        }
    );
}


// ============================================================
// CONSTRUIR HISTORIAL
// ============================================================

function construirHistorial(data) {

    tablaHistorial.replaceChildren();


    if (
        !data.results ||
        Object.keys(data.results).length === 0
    ) {

        mostrarSinResultados();

        return;
    }


    Object.entries(
        data.results
    ).forEach(
        ([nombreTorneo, categorias]) => {


            Object.entries(
                categorias
            ).forEach(
                ([idCategoria, rondas]) => {


                    rondas.forEach(
                        ronda => {


                            const fila =
                                document.createElement("tr");


                            // ------------------------------------------------
                            // TORNEO
                            // ------------------------------------------------

                            const torneo =
                                document.createElement("td");


                            torneo.textContent = obtenerNombreTorneo(nombreTorneo);


                            // ------------------------------------------------
                            // CATEGORÍA
                            // ------------------------------------------------

                            const categoria =
                                document.createElement("td");


                            categoria.textContent =
                                obtenerNombreEvento(
                                    idCategoria
                                );


                            // ------------------------------------------------
                            // RONDA
                            // ------------------------------------------------

                            const rondaElemento =
                                document.createElement("td");


                            rondaElemento.textContent =
                                ronda.round || "-";


                            // ------------------------------------------------
                            // MEJOR
                            // ------------------------------------------------

                            const mejor =
                                document.createElement("td");


                            mejor.textContent =
                                formatearTiempoWCA(
                                    ronda.best,
                                    idCategoria,
                                    "single"
                                );


                            aplicarColorResultado(
                                mejor,
                                ronda.best
                            );


                            // ------------------------------------------------
                            // MEDIA
                            // ------------------------------------------------

                            const media =
                                document.createElement("td");


                            media.textContent =
                                formatearTiempoWCA(
                                    ronda.average,
                                    idCategoria,
                                    "average"
                                );


                            aplicarColorResultado(
                                media,
                                ronda.average
                            );


                            // ------------------------------------------------
                            // AÑADIR FILA
                            // ------------------------------------------------

                            fila.appendChild(
                                torneo
                            );


                            fila.appendChild(
                                categoria
                            );


                            fila.appendChild(
                                rondaElemento
                            );


                            fila.appendChild(
                                mejor
                            );


                            fila.appendChild(
                                media
                            );


                            tablaHistorial.appendChild(
                                fila
                            );

                        }
                    );
                }
            );
        }
    );
}


// ============================================================
// SIN RESULTADOS
// ============================================================

function mostrarSinResultados() {

    const fila =
        document.createElement("tr");


    const celda =
        document.createElement("td");


    celda.colSpan = 5;


    celda.textContent =
        "No hay resultados registrados.";


    fila.appendChild(celda);


    tablaHistorial.appendChild(fila);
}


// ============================================================
// MOSTRAR MENSAJE
// ============================================================

function mostrarMensaje(texto) {

    mensaje.textContent =
        texto;
}
