/*
** EPITECH PROJECT, 2026
** ver_pb
** File description:
** streak.js
*/

// ============================================================
// MEJOR SINGLE Y MEJOR AVERAGE DE CADA EVENTO EN UNA COMPETICIÓN
// (solo cuentan resultados válidos: > 0, así se ignoran DNF/DNS/vacíos)
// ============================================================

function mejoresDeCompeticion(categorias) {

    const mejores = {};

    Object.entries(categorias).forEach(
        ([evento, rondas]) => {

            let single = Infinity;
            let average = Infinity;

            rondas.forEach(ronda => {

                if (ronda.best > 0 && ronda.best < single) {
                    single = ronda.best;
                }

                if (ronda.average > 0 && ronda.average < average) {
                    average = ronda.average;
                }
            });

            mejores[evento] = { single, average };
        }
    );

    return mejores;
}


// ============================================================
// CALCULAR RACHAS
//
// competiciones: [{ id, fecha, categorias }] de la MÁS ANTIGUA
// a la MÁS RECIENTE.
//
// Una competición mantiene la racha si en al menos un evento se
// consigue o se IGUALA un PR (single o average).
// ============================================================

export function calcularRachas(competiciones) {

    const mejorSingle = {};
    const mejorAverage = {};

    const detalle = [];

    let actual = 0;
    let maxLongitud = 0;
    let maxFin = -1;


    competiciones.forEach((competicion, indice) => {

        const mejores =
            mejoresDeCompeticion(competicion.categorias);

        const prs = [];


        Object.entries(mejores).forEach(
            ([evento, resultado]) => {

                [
                    ["single", resultado.single, mejorSingle],
                    ["average", resultado.average, mejorAverage]
                ].forEach(([tipo, valor, historico]) => {

                    if (valor === Infinity) {
                        return;
                    }

                    const anterior =
                        historico[evento] ?? Infinity;

                    if (valor <= anterior) {

                        prs.push({
                            evento,
                            tipo,
                            valor,
                            empate: valor === anterior
                        });
                    }

                    if (valor < anterior) {
                        historico[evento] = valor;
                    }
                });
            }
        );


        actual = prs.length > 0 ? actual + 1 : 0;

        if (actual > 0 && actual >= maxLongitud) {
            maxLongitud = actual;
            maxFin = indice;
        }


        detalle.push({
            id: competicion.id,
            fecha: competicion.fecha,
            prs,
            racha: actual
        });
    });


    return {
        detalle,
        actual,
        maxima: {
            longitud: maxLongitud,
            inicio: maxFin - maxLongitud + 1,
            fin: maxFin
        }
    };
}
