import { describe, test, expect, vi } from 'vitest';

// Simulamos un entorno mínimo de DOM para evitar que falle al importar el archivo
global.document = {
    getElementById: vi.fn().mockReturnValue(null)
};

// Ahora importamos las funciones de forma segura
import { parsearTiempo, formatearTiempo, calcularPromedioWCA } from '../js/BPA_WPA.js';

describe('Pruebas de la Calculadora BPA y WPA (Reglas WCA)', () => {

    // ============================================================
    // TESTS: PARSEO DE TIEMPOS
    // ============================================================
    describe('parsearTiempo', () => {
        test('Debe parsear segundos estándar con punto o coma', () => {
            expect(parsearTiempo('8.50')).toBe(8.50);
            expect(parsearTiempo('8,50')).toBe(8.50);
        });

        test('Debe convertir formatos con minutos correctamente a segundos', () => {
            expect(parsearTiempo('1:20.20')).toBe(80.20);
            expect(parsearTiempo('2:10,50')).toBe(130.50);
        });

        test('Debe identificar penalizaciones estrictas (DNF/DNS)', () => {
            expect(parsearTiempo('DNF')).toBe(Infinity);
            expect(parsearTiempo('dns')).toBe(Infinity);
        });

        test('Debe retornar null para campos vacíos o inválidos', () => {
            expect(parsearTiempo('')).toBeNull();
            expect(parsearTiempo('abc')).toBeNull();
        });
    });

    // ============================================================
    // TESTS: FORMATEO VISUAL
    // ============================================================
    describe('formatearTiempo', () => {
        test('Debe mantener texto de estados intacto', () => {
            expect(formatearTiempo('--')).toBe('--');
            expect(formatearTiempo('DNF')).toBe('DNF');
        });

        test('Debe renderizar segundos con dos decimales', () => {
            expect(formatearTiempo(8.5)).toBe('8.50');
            expect(formatearTiempo(12.343)).toBe('12.34');
        });

        test('Debe convertir segundos grandes a formato MM:SS.hh añadiendo ceros si es necesario', () => {
            expect(formatearTiempo(80.20)).toBe('1:20.20');
            expect(formatearTiempo(65.05)).toBe('1:05.05');
        });
    });

    // ============================================================
    // TESTS: LÓGICA DE PROMEDIOS (Ao5 y Mo3)
    // ============================================================
    describe('calcularPromedioWCA', () => {
        test('[Ao5] Debe calcular el promedio quitando extremos y aplicando truncamiento oficial', () => {
            const tiempos = [5.60, 3.60, 6.70, 0.01, 0.01];
            expect(calcularPromedioWCA(tiempos, 'ao5')).toBe('3.07');
        });

        test('[Ao5] Un solo DNF debe tratarse como el peor tiempo y ser descartado', () => {
            const tiempos = [8.50, 9.00, 8.20, 7.90, Infinity];
            expect(calcularPromedioWCA(tiempos, 'ao5')).toBe('8.56');
        });

        test('[Ao5] Dos o más DNF deben resultar automáticamente en DNF', () => {
            const tiempos = [8.50, Infinity, 8.20, Infinity, 7.90];
            expect(calcularPromedioWCA(tiempos, 'ao5')).toBe('DNF');
        });

        test('[Mo3] Debe hacer la media aritmética pura de 3 tiempos con truncamiento', () => {
            const tiempos = [10.00, 10.00, 10.02];
            expect(calcularPromedioWCA(tiempos, 'mo3')).toBe('10.00');
        });

        test('[Mo3] Un solo DNF en Mo3 debe arruinar la media completa', () => {
            const tiempos = [9.50, Infinity, 10.20];
            expect(calcularPromedioWCA(tiempos, 'mo3')).toBe('DNF');
        });
    });
});
