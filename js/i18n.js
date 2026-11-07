/*
** File description:
** i18n.js
*/

import { traducciones } from "./config.js";


export class ErrorI18n extends Error {
    constructor(clave, context = {}) {
        super(clave);          // Guarda la clave en error.message
        this.context = context; // Guarda las variables dinámicas
        this.isI18n = true;     // Una marca para saber que es un error nuestro
    }
}



// Idioma por defecto (mira si hay uno guardado o usa el del navegador)
// 1. Define los idiomas que tu aplicación realmente tiene disponibles
const IDIOMAS_SOPORTADOS = ["es", "en"];

// 2. Detecta el idioma del navegador de forma limpia (ej: "fr-FR" -> "fr")
const idiomaNavegador = navigator.language.split("-")[0];

// 3. Selecciona el idioma por defecto
let idiomaActual = 
    localStorage.getItem("cubestats-idioma") || 
    (IDIOMAS_SOPORTADOS.includes(idiomaNavegador) ? idiomaNavegador : "es"); // "es" actúa como fallback si el navegador tiene un idioma no soportado (como alemán)


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


    // 3. Control de estado visual de los botones de idioma
    // Cuando añadas un nuevo idioma (ej. francés 'fr'), duplica una línea y cambia el ID y el código de idioma:
    // document.getElementById("btn-fr")?.classList.toggle("activo", nuevoIdioma === "fr");
    document.getElementById("btn-es")?.classList.toggle("activo", nuevoIdioma === "es");
    document.getElementById("btn-en")?.classList.toggle("activo", nuevoIdioma === "en");
}

// Devuelve el idioma activo para usarlo en tus otros scripts
export function obtenerIdiomaActual() {
    return idiomaActual;
}

// Inicializar los eventos de los botones

// Escucha el clic de cada botón para cambiar el idioma
// Cuando añadas un nuevo idioma (ej. francés 'fr'), duplica una línea cambiando el ID y el código:
// document.getElementById("btn-fr")?.addEventListener("click", () => cambiarIdioma("fr"));
export function inicializarIdioma() {
    document.getElementById("btn-es")?.addEventListener("click", () => cambiarIdioma("es"));
    document.getElementById("btn-en")?.addEventListener("click", () => cambiarIdioma("en"));
    
    // Aplicar el idioma guardado al cargar la web
    cambiarIdioma(idiomaActual);
}

export function t(clave, variables = {}) {
    const diccionario = traducciones[idiomaActual];
    if (!diccionario) return clave;

    // Permite buscar claves simples ("buscando") o rutas con punto ("rondas.Final")
    let texto = clave.split('.').reduce((obj, key) => obj?.[key], diccionario);

    // Si no encuentra la traducción, devuelve la clave original (quitando el prefijo si tiene punto)
    if (texto === undefined || texto === null) {
        return clave.includes('.') ? clave.split('.').pop() : clave;
    }

    // Reemplaza las variables {variables}
    Object.keys(variables).forEach(llave => {
        texto = texto.replace(`{${llave}}`, variables[llave]);
    });

    return texto;
}
