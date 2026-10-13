
/*
** EPITECH PROJECT, 2026
** ver_pb
** File description:
** profile.js
*/

import { construirPRs } from "./prs.js";
import { construirHistorial } from "./history.js";
import { obtenerNombrePais } from "./format.js";


export function mostrarPerfil(data) {

    const nombreElemento =
        document.getElementById("nombre");

    const wcaIdElemento =
        document.getElementById("wcaId");

    const paisElemento =
        document.getElementById("pais");

    const competenciasElemento =
        document.getElementById("competencias");

    const perfil =
        document.getElementById("perfil");


    const nombre =
        data.name || "Sin nombre";

    const pais = 
        obtenerNombrePais(data.countryId) || 
        obtenerNombrePais(data.country) ||
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
