/*
** File description:
** i18n.js
*/

import { traducciones } from "./config.js";

// Idioma por defecto (mira si hay uno guardado o usa el del navegador)
let idiomaActual = localStorage.getItem("cubestats-idioma") || 
                   (navigator.language.startsWith("en") ? "en" : "es");

export function cambiarIdioma(nuevoIdioma) {
    if (!traducciones[nuevoIdioma]) return;
    
    idiomaActual = nuevoIdioma;
    localStorage.setItem("cubestats-idioma", nuevoIdioma);
    document.documentElement.lang = nuevoIdioma; // Cambia el <html lang="...">

    // 1. Traducir textos normales (data-i18n)
    const elementosTexto = document.querySelectorAll("[data-i18n]");
    elementosTexto.forEach(el => {
        const clave = el.getAttribute("data-i18n");
        if (traducciones[idiomaActual][clave]) {
            // Si es un input de tipo botón cambiamos su value, si no su textContent
            if (el.type === "button" || el.type === "submit") {
                el.value = traducciones[idiomaActual][clave];
            } else {
                el.textContent = traducciones[idiomaActual][clave];
            }
        }
    });

    // 2. Traducir placeholders (data-i18n-placeholder)
    const elementosPlaceholder = document.querySelectorAll("[data-i18n-placeholder]");
    elementosPlaceholder.forEach(el => {
        const clave = el.getAttribute("data-i18n-placeholder");
        if (traducciones[idiomaActual][clave]) {
            el.placeholder = traducciones[idiomaActual][clave];
        }
    });

    document.getElementById("btn-es")?.classList.toggle("activo", nuevoIdioma === "es");
    document.getElementById("btn-en")?.classList.toggle("activo", nuevoIdioma === "en");
}

// Devuelve el idioma activo para usarlo en tus otros scripts
export function obtenerIdiomaActual() {
    return idiomaActual;
}

// Inicializar los eventos de los botones
export function inicializarIdioma() {
    document.getElementById("btn-es")?.addEventListener("click", () => cambiarIdioma("es"));
    document.getElementById("btn-en")?.addEventListener("click", () => cambiarIdioma("en"));
    
    // Aplicar el idioma guardado al cargar la web
    cambiarIdioma(idiomaActual);
}
