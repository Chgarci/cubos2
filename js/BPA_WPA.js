// Constante para representar valores no numéricos en los cálculos matemáticos
const DNF = Infinity;

/**
 * Parsea el texto de entrada a un número flotante, retorna DNF, o null si está vacío/inválido.
 */
export function parsearTiempo(valor) {
    if (!valor) return null;
    const texto = valor.trim().toUpperCase().replace(',', '.'); // Normalizamos comas a puntos desde el inicio
    if (!texto) return null;
    if (texto === 'DNF' || texto === 'DNS') return DNF;

    // 1. Formato con minutos (ej: 1:05.30 o 02:14,15)
    if (texto.includes(':')) {
        const partes = texto.split(':');
        if (partes.length !== 2) return null; // Formato inválido si hay más de un ':'
        
        const minutos = parseInt(partes[0], 10);
        const segundos = parseFloat(partes[1]);
        
        if (isNaN(minutos) || isNaN(segundos)) return null;
        return minutos * 60 + segundos;
    }

    // 2. Formato solo segundos (ej: 8.50 o 12.3)
    const tiempoPuro = parseFloat(texto);
    return isNaN(tiempoPuro) ? null : tiempoPuro;
}

/**
 * Convierte un tiempo numérico en segundos a formato de texto WCA (ej: 101.77 -> 1:41.77)
 */
export function formatearTiempo(segundosTotales) {
    if (segundosTotales === '--' || segundosTotales === 'DNF') return segundosTotales;
    
    const tiempoNum = parseFloat(segundosTotales);
    if (isNaN(tiempoNum)) return '--';

    if (tiempoNum >= 60) {
        const minutos = Math.floor(tiempoNum / 60);
        const segundosRestantes = (tiempoNum % 60).toFixed(2);
        // Nos aseguramos de agregar un cero inicial si los segundos son menores a 10 (ej: 1:05.30)
        const segundosFormateados = segundosRestantes < 10 ? '0' + segundosRestantes : segundosRestantes;
        return `${minutos}:${segundosFormateados}`;
    }
    
    return tiempoNum.toFixed(2);
}

/**
 * Lógica pura del cálculo de promedio WCA aplicando truncamiento oficial (Regla 9f4).
 */
export function calcularPromedioWCA(tiempos, formato) {
    if (formato === 'mo3') {
        if (tiempos.includes(DNF)) return 'DNF';
        const suma = tiempos.reduce((a, b) => a + b, 0);
        // Truncamiento estricto de la WCA a dos decimales
        return (Math.floor((suma / 3) * 100) / 100).toFixed(2);
    } else {
        // Ao5: Regla estricta de cortes por DNF
        const dnfs = tiempos.filter(t => t === DNF).length;
        if (dnfs >= 2) return 'DNF';

        const ordenados = [...tiempos].sort((a, b) => a - b);
        // Se descartan de forma segura los extremos reales
        const computables = ordenados.slice(1, 4);
        
        const suma = computables.reduce((a, b) => a + b, 0);
        // Truncamiento estricto de la WCA a dos decimales
        return (Math.floor((suma / 3) * 100) / 100).toFixed(2);
    }
}

/**
 * Inicializa los listeners y la lógica de la calculadora BPA/WPA
 */
export function inicializarCalculadora() {
    const formatSelect = document.getElementById('formatSelect');
    if (!formatSelect) return;

    const inputs = Array.from({ length: 5 }, (_, i) => document.getElementById(`attempt${i + 1}`));
    const grupos = Array.from({ length: 5 }, (_, i) => document.getElementById(`group-attempt${i + 1}`));
    
    const bpaEl = document.getElementById('bpa-value');
    const wpaEl = document.getElementById('wpa-value');
    const actualEl = document.getElementById('current-avg-value');

    function procesarCalculos() {
        const formato = formatSelect.value;
        const maxTiempos = formato === 'mo3' ? 3 : 5;
        
        // Obtener los valores crudos escritos por el usuario (números, Infinity o null)
        const tiemposIngresados = inputs.slice(0, maxTiempos).map(input => parsearTiempo(input.value));

        // 1. Promedio Actual
        if (tiemposIngresados.every(t => t !== null)) {
            actualEl.textContent = formatearTiempo(calcularPromedioWCA(tiemposIngresados, formato));
        } else {
            actualEl.textContent = '--';
        }

        // 2. BPA (Mejor promedio posible: reemplaza vacíos por el escenario ideal puro de 0.01)
        const tiemposBPA = tiemposIngresados.map(t => t === null ? 0.01 : t);
        bpaEl.textContent = formatearTiempo(calcularPromedioWCA(tiemposBPA, formato));

        // 3. WPA (Peor promedio posible)
        const tiemposWPA = tiemposIngresados.map(t => t === null ? DNF : t);
        wpaEl.textContent = formatearTiempo(calcularPromedioWCA(tiemposWPA, formato));
    }

    function ajustarInterfazPorFormato() {
        const formato = formatSelect.value;
    
        if (formato === 'mo3') {
            grupos[3].style.display = 'none';
            grupos[4].style.display = 'none';
            inputs[3].value = '';
            inputs[4].value = '';
        } else {
            grupos[3].style.display = 'flex';
            grupos[4].style.display = 'flex';
        }
        procesarCalculos();
    }

    // Eventos
    formatSelect.addEventListener('change', ajustarInterfazPorFormato);
    inputs.forEach(input => input.addEventListener('input', procesarCalculos));

    // Inicialización limpia
    ajustarInterfazPorFormato();
}
