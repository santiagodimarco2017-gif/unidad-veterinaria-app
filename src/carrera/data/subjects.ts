import type { Subject, ViewMode, StudentProgress } from '../types';

export const COD_TO_CODE: Record<number, string> = {
  1: '1.1.1',
  2: '1.2.1',
  3: '1.3.1',
  4: '1.4.1',
  5: '1.5.2',
  6: '1.6.2',
  7: '1.7.2',
  8: '2.8.1',
  9: '2.9.1',
  10: '2.10.1',
  11: '2.11.1',
  12: '2.12',
  13: '2.13.2',
  14: '2.14.2',
  15: '2.15.2',
  16: '3.16.1',
  17: '3.17.1',
  18: '3.18.1',
  19: '3.19.1',
  20: '3.20.2',
  21: '3.21.2',
  22: '3.22.2',
  23: '3.23.2',
  24: '3.24.2',
  25: '4.25.1',
  26: '4.26.1',
  27: '4.27.1',
  28: '4.28.1',
  29: '4.29.1',
  30: '4.30.2',
  31: '4.31.2',
  32: '4.32.2',
  33: '4.33.2',
  34: '4.34.2',
  35: '5.35.1',
  36: '5.36.1',
  37: '5.37.1',
  38: '5.38.1',
  39: '5.39.1',
  40: '5.40.1',
  41: '5.41.2',
  42: '5.42.2',
  43: '5.43.2',
  44: '5.44.2',
  45: '5.45.2',
  46: '6.46.1',
  47: '6.47.1',
  48: '6.48.1',
};

// Converts numeric CODs into string codes (e.g. 1 -> '1.1.1')
const c = (...items: (number | number[])[]): string[] => {
  return items.flat().map((num) => COD_TO_CODE[num]);
};

// Generates numeric range [start, end]
const r = (start: number, end: number): number[] => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const SUBJECTS: Subject[] = [
  // --- 1er AÑO ---
  {
    code: '1.1.1',
    numCode: 1,
    name: 'Física Biológica',
    year: 1,
    cursarRegularPrereqs: [],
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: [],
    prerequisites: [],
    rawPrereqsText: 'Sin correlativas'
  },
  {
    code: '1.2.1',
    numCode: 2,
    name: 'Química Biológica I',
    year: 1,
    cursarRegularPrereqs: [],
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: [],
    prerequisites: [],
    rawPrereqsText: 'Sin correlativas'
  },
  {
    code: '1.3.1',
    numCode: 3,
    name: 'Biología y Ecología',
    year: 1,
    cursarRegularPrereqs: [],
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: [],
    prerequisites: [],
    rawPrereqsText: 'Sin correlativas'
  },
  {
    code: '1.4.1',
    numCode: 4,
    name: 'Metodología de la Investigación',
    year: 1,
    cursarRegularPrereqs: [],
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: [],
    prerequisites: [],
    rawPrereqsText: 'Sin correlativas'
  },
  {
    code: '1.5.2',
    numCode: 5,
    name: 'Anatomía Descriptiva y Comparada I',
    year: 1,
    cursarRegularPrereqs: [],
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: [],
    prerequisites: [],
    rawPrereqsText: 'Sin correlativas'
  },
  {
    code: '1.6.2',
    numCode: 6,
    name: 'Histología I y Embriología Básica',
    year: 1,
    cursarRegularPrereqs: c(2),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(1, 2, 3),
    prerequisites: c(1, 2, 3),
    rawPrereqsText: 'Cursar: 2 Reg. | Rendir: 1, 2, 3 Aprob.'
  },
  {
    code: '1.7.2',
    numCode: 7,
    name: 'Química Biológica II',
    year: 1,
    cursarRegularPrereqs: c(2),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(1, 2),
    prerequisites: c(1, 2),
    rawPrereqsText: 'Cursar: 2 Reg. | Rendir: 1 y 2 Aprob.'
  },

  // --- 2do AÑO ---
  {
    code: '2.8.1',
    numCode: 8,
    name: 'Anatomía Descriptiva y Comparada II',
    year: 2,
    cursarRegularPrereqs: c(5),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(3, 5, 6),
    prerequisites: c(3, 5, 6),
    rawPrereqsText: 'Cursar: 5 Reg. | Rendir: 3, 5, 6 Aprob.'
  },
  {
    code: '2.9.1',
    numCode: 9,
    name: 'Histología II y Embriología Especial',
    year: 2,
    cursarRegularPrereqs: c(6, 7),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(6, 7),
    prerequisites: c(6, 7),
    rawPrereqsText: 'Cursar: 6 y 7 Reg. | Rendir: 6 y 7 Aprob.'
  },
  {
    code: '2.10.1',
    numCode: 10,
    name: 'Zootecnia General',
    year: 2,
    cursarRegularPrereqs: c(1, 3, 5),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(3, 5),
    prerequisites: c(1, 3, 5),
    rawPrereqsText: 'Cursar: 1, 3, 5 Reg. | Rendir: 3, 5 Aprob.'
  },
  {
    code: '2.11.1',
    numCode: 11,
    name: 'Bioestadística',
    year: 2,
    cursarRegularPrereqs: c(3),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(3, 4),
    prerequisites: c(3, 4),
    rawPrereqsText: 'Cursar: 3 Reg. | Rendir: 3, 4 Aprob.'
  },
  {
    code: '2.12',
    numCode: 12,
    name: 'Fisiología',
    year: 2,
    cursarRegularPrereqs: c(r(1, 7)),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(8, 9),
    prerequisites: c(r(1, 7), 8, 9),
    rawPrereqsText: 'Cursar: 1º Año reg. (1 a 7) | Rendir: 8 y 9 Aprob.'
  },
  {
    code: '2.13.2',
    numCode: 13,
    name: 'Genética',
    year: 2,
    cursarRegularPrereqs: c(4, 6, 11),
    cursarAprobadaPrereqs: c(1, 2, 7),
    rendirAprobadaPrereqs: c(6, 11),
    prerequisites: c(1, 2, 4, 6, 7, 11),
    rawPrereqsText: 'Cursar: 4, 6, 11 Reg. y 1, 2, 7 Aprob. | Rendir: 6 y 11 Aprob.'
  },
  {
    code: '2.14.2',
    numCode: 14,
    name: 'Microbiología',
    year: 2,
    cursarRegularPrereqs: c(7, 9),
    cursarAprobadaPrereqs: c(1, 2),
    rendirAprobadaPrereqs: c(5, 9),
    prerequisites: c(1, 2, 5, 7, 9),
    rawPrereqsText: 'Cursar: 7, 9 Reg. y 1, 2 Aprob. | Rendir: 5 y 9 Aprob.'
  },
  {
    code: '2.15.2',
    numCode: 15,
    name: 'Parasitología Veterinaria',
    year: 2,
    cursarRegularPrereqs: c(8, 9),
    cursarAprobadaPrereqs: c(3),
    rendirAprobadaPrereqs: c(8, 9),
    prerequisites: c(3, 8, 9),
    rawPrereqsText: 'Cursar: 8, 9 Reg. y 3 Aprob. | Rendir: 8 y 9 Aprob.'
  },

  // --- 3er AÑO ---
  {
    code: '3.16.1',
    numCode: 16,
    name: 'Inmunología',
    year: 3,
    cursarRegularPrereqs: c(8, 9, r(12, 15)),
    cursarAprobadaPrereqs: c(r(1, 7)),
    rendirAprobadaPrereqs: c(r(12, 15)),
    prerequisites: c(r(1, 7), 8, 9, r(12, 15)),
    rawPrereqsText: 'Cursar: 8, 9, 12 a 15 Reg. y Todo 1º año Aprob. | Rendir: 12 a 15 Aprob.'
  },
  {
    code: '3.17.1',
    numCode: 17,
    name: 'Epidemiología',
    year: 3,
    cursarRegularPrereqs: c(14, 15),
    cursarAprobadaPrereqs: c(3, 4),
    rendirAprobadaPrereqs: c(10, 11, 14, 15),
    prerequisites: c(3, 4, 10, 11, 14, 15),
    rawPrereqsText: 'Cursar: 14, 15 Reg. y 3, 4 Aprob. | Rendir: 10, 11, 14, 15 Aprob.'
  },
  {
    code: '3.18.1',
    numCode: 18,
    name: 'Semiología y Análisis Clínicos',
    year: 3,
    cursarRegularPrereqs: c(12, 14, 15),
    cursarAprobadaPrereqs: c(r(1, 8)),
    rendirAprobadaPrereqs: c(4, 10, 12),
    prerequisites: c(r(1, 8), 10, 12, 14, 15),
    rawPrereqsText: 'Cursar: 12, 14, 15 Reg. y 1 a 8 Aprob. | Rendir: 4, 10, 12 Aprob.'
  },
  {
    code: '3.19.1',
    numCode: 19,
    name: 'Patología General Veterinaria',
    year: 3,
    cursarRegularPrereqs: c(12, 14, 15),
    cursarAprobadaPrereqs: c(r(1, 9)),
    rendirAprobadaPrereqs: c(12, 14, 15),
    prerequisites: c(r(1, 9), 12, 14, 15),
    rawPrereqsText: 'Cursar: 12, 14, 15 Reg. y 1 a 9 Aprob. | Rendir: 12, 14, 15 Aprob.'
  },
  {
    code: '3.20.2',
    numCode: 20,
    name: 'Farmacología y Terapéutica',
    year: 3,
    cursarRegularPrereqs: c(11, 14, 15),
    cursarAprobadaPrereqs: c(12),
    rendirAprobadaPrereqs: c(12, 14, 15),
    prerequisites: c(11, 12, 14, 15),
    rawPrereqsText: 'Cursar: 11, 14, 15 Reg. y 12 Aprob. | Rendir: 12, 14, 15 Aprob.'
  },
  {
    code: '3.21.2',
    numCode: 21,
    name: 'Sociología Rural, Agroecología y Extensión',
    year: 3,
    cursarRegularPrereqs: c(3, 4),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(3, 4),
    prerequisites: c(3, 4),
    rawPrereqsText: 'Cursar: 3, 4 Reg. | Rendir: 3, 4 Aprob.'
  },
  {
    code: '3.22.2',
    numCode: 22,
    name: 'Patología Especial Veterinaria',
    year: 3,
    cursarRegularPrereqs: c(14, 15, 16, 19),
    cursarAprobadaPrereqs: c(r(1, 9), 12),
    rendirAprobadaPrereqs: c(16, 19),
    prerequisites: c(r(1, 9), 12, 14, 15, 16, 19),
    rawPrereqsText: 'Cursar: 14 a 16, 19 Reg. y 1 a 9, 12 Aprob. | Rendir: 16, 19 Aprob.'
  },
  {
    code: '3.23.2',
    numCode: 23,
    name: 'Cirugía I',
    year: 3,
    cursarRegularPrereqs: c(12, 18),
    cursarAprobadaPrereqs: c(r(1, 8)),
    rendirAprobadaPrereqs: c(18),
    prerequisites: c(r(1, 8), 12, 18),
    rawPrereqsText: 'Cursar: 12, 18 Reg. y 1 a 8 Aprob. | Rendir: 18 Aprob.'
  },
  {
    code: '3.24.2',
    numCode: 24,
    name: 'Inglés I',
    year: 3,
    cursarRegularPrereqs: c(r(1, 15)),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: [],
    prerequisites: c(r(1, 15)),
    rawPrereqsText: 'Cursar: 1 a 15 Reg. | Rendir: Sin req.'
  },

  // --- 4to AÑO ---
  {
    code: '4.25.1',
    numCode: 25,
    name: 'Enfermedades Parasitarias',
    year: 4,
    cursarRegularPrereqs: c(r(16, 20), 22),
    cursarAprobadaPrereqs: c(r(1, 15)),
    rendirAprobadaPrereqs: c(17, 18, 20, 22),
    prerequisites: c(r(1, 15), r(16, 20), 22),
    rawPrereqsText: 'Cursar: 16 a 20, 22 Reg. y 1 a 15 Aprob. | Rendir: 17, 18, 20, 22 Aprob.'
  },
  {
    code: '4.26.1',
    numCode: 26,
    name: 'Enfermedades Infecciosas',
    year: 4,
    cursarRegularPrereqs: c(r(16, 20), 22),
    cursarAprobadaPrereqs: c(r(1, 15)),
    rendirAprobadaPrereqs: c(17, 20, 22),
    prerequisites: c(r(1, 15), r(16, 20), 22),
    rawPrereqsText: 'Cursar: 16 a 20, 22 Reg. y 1 a 15 Aprob. | Rendir: 17, 20, 22 Aprob.'
  },
  {
    code: '4.27.1',
    numCode: 27,
    name: 'Cirugía II',
    year: 4,
    cursarRegularPrereqs: c(20, 23),
    cursarAprobadaPrereqs: c(r(1, 15)),
    rendirAprobadaPrereqs: c(23),
    prerequisites: c(r(1, 15), 20, 23),
    rawPrereqsText: 'Cursar: 20, 23 Reg. y 1 a 15 Aprob. | Rendir: 23 Aprob.'
  },
  {
    code: '4.28.1',
    numCode: 28,
    name: 'Nutrición Animal',
    year: 4,
    cursarRegularPrereqs: c(19, 22),
    cursarAprobadaPrereqs: c(r(1, 15)),
    rendirAprobadaPrereqs: c(10, 19),
    prerequisites: c(r(1, 15), 10, 19, 22),
    rawPrereqsText: 'Cursar: 19, 22 Reg. y 1 a 15 Aprob. | Rendir: 10, 19 Aprob.'
  },
  {
    code: '4.29.1',
    numCode: 29,
    name: 'Inglés II',
    year: 4,
    cursarRegularPrereqs: c(24),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(24),
    prerequisites: c(24),
    rawPrereqsText: 'Cursar: 24 Reg. | Rendir: 24 Aprob.'
  },
  {
    code: '4.30.2',
    numCode: 30,
    name: 'Patología Médica',
    year: 4,
    cursarRegularPrereqs: c(16, 17, 19, 22, 25, 26),
    cursarAprobadaPrereqs: c(r(1, 15), 18, 20),
    rendirAprobadaPrereqs: c(25, 26),
    prerequisites: c(r(1, 15), 16, 17, 18, 19, 20, 22, 25, 26),
    rawPrereqsText: 'Cursar: 16, 17, 19, 22, 25, 26 Reg. y 1 a 15, 18, 20 Aprob. | Rendir: 25, 26 Aprob.'
  },
  {
    code: '4.31.2',
    numCode: 31,
    name: 'Patología Quirúrgica',
    year: 4,
    cursarRegularPrereqs: c(19, 22, 23, r(25, 27)),
    cursarAprobadaPrereqs: c(18, 20),
    rendirAprobadaPrereqs: c(25, 26, 27),
    prerequisites: c(18, 19, 20, 22, 23, r(25, 27)),
    rawPrereqsText: 'Cursar: 19, 22, 23, 25 a 27 Reg. y 18, 20 Aprob. | Rendir: 25, 26, 27 Aprob.'
  },
  {
    code: '4.32.2',
    numCode: 32,
    name: 'Obstetricia y Fisiopatología de la Reproducción',
    year: 4,
    cursarRegularPrereqs: c(22, 23, r(25, 28)),
    cursarAprobadaPrereqs: c(18, 20),
    rendirAprobadaPrereqs: c(r(25, 28)),
    prerequisites: c(18, 20, 22, 23, r(25, 28)),
    rawPrereqsText: 'Cursar: 22, 23, 25 a 28 Reg. y 18, 20 Aprob. | Rendir: 25 a 28 Aprob.'
  },
  {
    code: '4.33.2',
    numCode: 33,
    name: 'Ética y Legislación Veterinaria',
    year: 4,
    cursarRegularPrereqs: c(r(1, 15)),
    cursarAprobadaPrereqs: [],
    rendirAprobadaPrereqs: c(r(17, 19), 21),
    prerequisites: c(r(1, 15), r(17, 19), 21),
    rawPrereqsText: 'Cursar: 1 a 15 Reg. | Rendir: 17 a 19, 21 Aprob.'
  },
  {
    code: '4.34.2',
    numCode: 34,
    name: 'Sueros y Vacunas',
    year: 4,
    cursarRegularPrereqs: c(17, 22, 25, 26),
    cursarAprobadaPrereqs: c(r(1, 16)),
    rendirAprobadaPrereqs: c(26),
    prerequisites: c(r(1, 16), 17, 22, 25, 26),
    rawPrereqsText: 'Cursar: 17, 22, 25, 26 Reg. y 1 a 16 Aprob. | Rendir: 26 Aprob.'
  },

  // --- 5to AÑO ---
  {
    code: '5.35.1',
    numCode: 35,
    name: 'Agrostología',
    year: 5,
    cursarRegularPrereqs: c(28, 30),
    cursarAprobadaPrereqs: c(r(1, 15)),
    rendirAprobadaPrereqs: c(21, 28, 30),
    prerequisites: c(r(1, 15), 21, 28, 30),
    rawPrereqsText: 'Cursar: 28, 30 Reg. y 1 a 15 Aprob. | Rendir: 21, 28, 30 Aprob.'
  },
  {
    code: '5.36.1',
    numCode: 36,
    name: 'Economía Agraria y Administración Rural',
    year: 5,
    cursarRegularPrereqs: c(28, 33),
    cursarAprobadaPrereqs: c(r(1, 21)),
    rendirAprobadaPrereqs: c(33),
    prerequisites: c(r(1, 21), 28, 33),
    rawPrereqsText: 'Cursar: 28, 33 Reg. y 1 a 21 Aprob. | Rendir: 33 Aprob.'
  },
  {
    code: '5.37.1',
    numCode: 37,
    name: 'Producción de Porcinos y Pequeños Rumiantes',
    year: 5,
    cursarRegularPrereqs: c(r(25, 28), 30, r(32, 34)),
    cursarAprobadaPrereqs: c(r(1, 22)),
    rendirAprobadaPrereqs: c(28, 30, 32, 34),
    prerequisites: c(r(1, 22), r(25, 28), 30, r(32, 34)),
    rawPrereqsText: 'Cursar: 25 a 28, 30, 32 a 34 Reg. y 1 a 22 Aprob. | Rendir: 28, 30, 32, 34 Aprob.'
  },
  {
    code: '5.38.1',
    numCode: 38,
    name: 'Producción de Aves y Pilíferos',
    year: 5,
    cursarRegularPrereqs: c(r(25, 28), 30, r(32, 34)),
    cursarAprobadaPrereqs: c(r(1, 22)),
    rendirAprobadaPrereqs: c(28, 30, 33, 34),
    prerequisites: c(r(1, 22), r(25, 28), 30, r(32, 34)),
    rawPrereqsText: 'Cursar: 25 a 28, 30, 32 a 34 Reg. y 1 a 22 Aprob. | Rendir: 28, 30, 33, 34 Aprob.'
  },
  {
    code: '5.39.1',
    numCode: 39,
    name: 'Medicina Veterinaria, Manejo y Conservación de Fauna Silvestre',
    year: 5,
    cursarRegularPrereqs: c(28, r(30, 32)),
    cursarAprobadaPrereqs: c(r(1, 24)),
    rendirAprobadaPrereqs: c(28, 30, 31, 33, 34),
    prerequisites: c(r(1, 24), 28, r(30, 34)),
    rawPrereqsText: 'Cursar: 28, 30 a 32 Reg. y 1 a 24 Aprob. | Rendir: 28, 30, 31, 33, 34 Aprob.'
  },
  {
    code: '5.40.1',
    numCode: 40,
    name: 'Higiene y Microbiología de los Alimentos',
    year: 5,
    cursarRegularPrereqs: c(25, 26, r(30, 33)),
    cursarAprobadaPrereqs: c(r(1, 21)),
    rendirAprobadaPrereqs: c(25, 26),
    prerequisites: c(r(1, 21), 25, 26, r(30, 33)),
    rawPrereqsText: 'Cursar: 25, 26, 30 a 33 Reg. y 1 a 21 Aprob. | Rendir: 25, 26 Aprob.'
  },
  {
    code: '5.41.2',
    numCode: 41,
    name: 'Producción de Bovinos Lecheros',
    year: 5,
    cursarRegularPrereqs: c(r(25, 27), r(30, 36)),
    cursarAprobadaPrereqs: c(r(1, 22), 28),
    rendirAprobadaPrereqs: c(28, 30, r(32, 36)),
    prerequisites: c(r(1, 22), r(25, 27), 28, r(30, 36)),
    rawPrereqsText: 'Cursar: 25 a 27, 30 a 36 Reg. y 1 a 22, 28 Aprob. | Rendir: 28, 30, 32 a 36 Aprob.'
  },
  {
    code: '5.42.2',
    numCode: 42,
    name: 'Producción de Bovinos para Carne',
    year: 5,
    cursarRegularPrereqs: c(r(25, 27), r(29, 36)),
    cursarAprobadaPrereqs: c(r(1, 23), 28),
    rendirAprobadaPrereqs: c(28, 30, r(32, 36)),
    prerequisites: c(r(1, 23), r(25, 27), 28, r(29, 36)),
    rawPrereqsText: 'Cursar: 25 a 27, 29 a 36 Reg. y 1 a 23, 28 Aprob. | Rendir: 28, 30, 32 a 36 Aprob.'
  },
  {
    code: '5.43.2',
    numCode: 43,
    name: 'Salud Pública: Epidemiología, Saneamiento, Educación y Administración',
    year: 5,
    cursarRegularPrereqs: c(25, 26, 33, 34),
    cursarAprobadaPrereqs: c(r(1, 21)),
    rendirAprobadaPrereqs: c(25, 26, 33, 34),
    prerequisites: c(r(1, 21), 25, 26, 33, 34),
    rawPrereqsText: 'Cursar: 25, 26, 33, 34 Reg. y 1 a 21 Aprob. | Rendir: 25, 26, 33, 34 Aprob.'
  },
  {
    code: '5.44.2',
    numCode: 44,
    name: 'Tecnología de los Alimentos de Origen Animal',
    year: 5,
    cursarRegularPrereqs: c(25, 26, r(30, 33), 40),
    cursarAprobadaPrereqs: c(r(1, 22)),
    rendirAprobadaPrereqs: c(30, 31, 40),
    prerequisites: c(r(1, 22), 25, 26, r(30, 33), 40),
    rawPrereqsText: 'Cursar: 25, 26, 30 a 33, 40 Reg. y 1 a 22 Aprob. | Rendir: 30, 31, 40 Aprob.'
  },
  {
    code: '5.45.2',
    numCode: 45,
    name: 'Producción Equina',
    year: 5,
    cursarRegularPrereqs: c(r(25, 28), 30, r(32, 34)),
    cursarAprobadaPrereqs: c(r(1, 22)),
    rendirAprobadaPrereqs: c(28, 30, r(32, 34)),
    prerequisites: c(r(1, 22), r(25, 28), 30, r(32, 34)),
    rawPrereqsText: 'Cursar: 25 a 28, 30, 32 a 34 Reg. y 1 a 22 Aprob. | Rendir: 28, 30, 32 a 34 Aprob.'
  },

  // --- SEXTO AÑO ---
  {
    code: '6.46.1',
    numCode: 46,
    name: 'Clínica de Animales de Compañía',
    year: 6,
    cursarRegularPrereqs: c(29, 31, 33, 34, 43),
    cursarAprobadaPrereqs: c(r(1, 28), 30, 32),
    rendirAprobadaPrereqs: c(r(30, 34)),
    prerequisites: c(r(1, 28), 29, 30, 31, 32, 33, 34, 43),
    rawPrereqsText: 'Cursar: 29, 31, 33, 34, 43 Reg. y 1 a 28, 30, 32 Aprob. | Rendir: 30 a 34 Aprob.'
  },
  {
    code: '6.47.1',
    numCode: 47,
    name: 'Clínica Médica y Quirúrgica de Grandes Animales',
    year: 6,
    cursarRegularPrereqs: c(29, 31, r(33, 38), 45),
    cursarAprobadaPrereqs: c(r(1, 28), 30, 32),
    rendirAprobadaPrereqs: c(r(30, 37), 41, 42, 45),
    prerequisites: c(r(1, 28), 29, 30, 31, 32, r(33, 38), 41, 42, 45),
    rawPrereqsText: 'Cursar: 29, 31, 33 a 38, 45 Reg. y 1 a 28, 30, 32 Aprob. | Rendir: 30 a 37, 41, 42, 45 Aprob.'
  },
  {
    code: '6.48.1',
    numCode: 48,
    name: 'PIF (Práctica Integrada Final)',
    year: 6,
    cursarRegularPrereqs: c(29, 31, r(33, 43)),
    cursarAprobadaPrereqs: c(r(1, 28), 30, 32),
    rendirAprobadaPrereqs: c(r(1, 47)),
    prerequisites: c(r(1, 47)),
    rawPrereqsText: 'Cursar: 29, 31, 33 a 43 Reg. y 1 a 28, 30, 32 Aprob. | Rendir: 1 a 47 Aprob.'
  }
];

export const SUBJECT_MAP = new Map<string, Subject>(
  SUBJECTS.map((s) => [s.code, s])
);

export function getSubjectByCode(code: string): Subject | undefined {
  return SUBJECT_MAP.get(code);
}

export function isSubjectEnabled(
  subject: Subject,
  progress: StudentProgress,
  mode: ViewMode
): { isEnabled: boolean; missingPrereqs: Subject[]; completedPrereqs: Subject[]; effectivePrereqs: Subject[] } {
  const missingPrereqs: Subject[] = [];
  const completedPrereqs: Subject[] = [];
  const effectivePrereqs: Subject[] = [];
  const seenCodes = new Set<string>();

  if (mode === 'cursar') {
    // 1. Regularizada required
    const regCodes = subject.cursarRegularPrereqs ?? subject.prerequisites;
    for (const code of regCodes) {
      const reqSubject = SUBJECT_MAP.get(code);
      if (!reqSubject) continue;
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        effectivePrereqs.push(reqSubject);
      }
      const state = progress[code] || 'pendiente';
      const isMet = state === 'regular' || state === 'aprobada';
      if (isMet) {
        if (!completedPrereqs.includes(reqSubject)) completedPrereqs.push(reqSubject);
      } else {
        if (!missingPrereqs.includes(reqSubject)) missingPrereqs.push(reqSubject);
      }
    }

    // 2. Aprobada required for cursar
    const appCodes = subject.cursarAprobadaPrereqs ?? [];
    for (const code of appCodes) {
      const reqSubject = SUBJECT_MAP.get(code);
      if (!reqSubject) continue;
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        effectivePrereqs.push(reqSubject);
      }
      const state = progress[code] || 'pendiente';
      const isMet = state === 'aprobada';
      if (isMet) {
        if (!completedPrereqs.includes(reqSubject)) completedPrereqs.push(reqSubject);
      } else {
        if (!missingPrereqs.includes(reqSubject)) missingPrereqs.push(reqSubject);
      }
    }
  } else {
    // mode === 'rendir'
    const rendirCodes = subject.rendirAprobadaPrereqs ?? subject.prerequisites;
    for (const code of rendirCodes) {
      const reqSubject = SUBJECT_MAP.get(code);
      if (!reqSubject) continue;
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        effectivePrereqs.push(reqSubject);
      }
      const state = progress[code] || 'pendiente';
      const isMet = state === 'aprobada';
      if (isMet) {
        if (!completedPrereqs.includes(reqSubject)) completedPrereqs.push(reqSubject);
      } else {
        if (!missingPrereqs.includes(reqSubject)) missingPrereqs.push(reqSubject);
      }
    }
  }

  return {
    isEnabled: missingPrereqs.length === 0,
    missingPrereqs,
    completedPrereqs,
    effectivePrereqs,
  };
}

export function getUnlockedSubjects(subjectCode: string): Subject[] {
  return SUBJECTS.filter((s) => 
    s.prerequisites.includes(subjectCode) ||
    s.cursarRegularPrereqs?.includes(subjectCode) ||
    s.cursarAprobadaPrereqs?.includes(subjectCode) ||
    s.rendirAprobadaPrereqs?.includes(subjectCode)
  );
}

export function evaluateAllSubjects(
  progress: StudentProgress,
  mode: ViewMode
): Map<string, { subject: Subject; state: any; isEnabled: boolean; missingPrereqs: Subject[]; completedPrereqs: Subject[]; effectivePrereqs: Subject[]; unlocksSubjects: Subject[] }> {
  const result = new Map();

  for (const subject of SUBJECTS) {
    const state = progress[subject.code] || 'pendiente';
    const { isEnabled, missingPrereqs, completedPrereqs, effectivePrereqs } = isSubjectEnabled(subject, progress, mode);
    const unlocksSubjects = getUnlockedSubjects(subject.code);

    result.set(subject.code, {
      subject,
      state,
      isEnabled,
      missingPrereqs,
      completedPrereqs,
      effectivePrereqs,
      unlocksSubjects,
    });
  }

  return result;
}
