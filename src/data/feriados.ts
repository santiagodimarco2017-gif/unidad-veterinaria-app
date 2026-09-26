// Feriados nacionales incluidos como fallback offline (2026 y 2027 completos).
// Fuente: https://api.argentinadatos.com/v1/feriados/2026 y /2027 (consultado 2026-09-26).
// No se incluye un feriado local de Casilda: no se encontró la fecha del aniversario / día
// patronal confirmada en una fuente oficial verificable.

import type { Feriado } from '../lib/types';

export const FERIADOS_INCLUIDOS: Feriado[] = [
  // 2026
  { fecha: '2026-01-01', nombre: 'Año nuevo', tipo: 'inamovible' },
  { fecha: '2026-02-16', nombre: 'Carnaval', tipo: 'inamovible' },
  { fecha: '2026-02-17', nombre: 'Carnaval', tipo: 'inamovible' },
  { fecha: '2026-03-23', nombre: 'Puente turístico no laborable', tipo: 'puente' },
  { fecha: '2026-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'inamovible' },
  { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas', tipo: 'inamovible' },
  { fecha: '2026-04-03', nombre: 'Viernes Santo', tipo: 'inamovible' },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador', tipo: 'inamovible' },
  { fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo', tipo: 'inamovible' },
  { fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del General Martín Güemes (17/6)', tipo: 'trasladable' },
  { fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del General Manuel Belgrano', tipo: 'inamovible' },
  { fecha: '2026-07-09', nombre: 'Día de la Independencia', tipo: 'inamovible' },
  { fecha: '2026-07-10', nombre: 'Puente turístico no laborable', tipo: 'puente' },
  { fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'trasladable' },
  { fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'trasladable' },
  { fecha: '2026-11-23', nombre: 'Día de la Soberanía Nacional (20/11)', tipo: 'trasladable' },
  { fecha: '2026-12-07', nombre: 'Puente turístico no laborable', tipo: 'puente' },
  { fecha: '2026-12-08', nombre: 'Día de la Inmaculada Concepción de María', tipo: 'inamovible' },
  { fecha: '2026-12-25', nombre: 'Navidad', tipo: 'inamovible' },
  // 2027
  { fecha: '2027-01-01', nombre: 'Año nuevo', tipo: 'inamovible' },
  { fecha: '2027-02-08', nombre: 'Carnaval', tipo: 'inamovible' },
  { fecha: '2027-02-09', nombre: 'Carnaval', tipo: 'inamovible' },
  { fecha: '2027-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'inamovible' },
  { fecha: '2027-03-26', nombre: 'Viernes Santo', tipo: 'inamovible' },
  { fecha: '2027-04-02', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas', tipo: 'inamovible' },
  { fecha: '2027-05-01', nombre: 'Día del Trabajador', tipo: 'inamovible' },
  { fecha: '2027-05-25', nombre: 'Día de la Revolución de Mayo', tipo: 'inamovible' },
  { fecha: '2027-06-17', nombre: 'Paso a la Inmortalidad del General Martín Güemes', tipo: 'trasladable' },
  { fecha: '2027-06-20', nombre: 'Paso a la Inmortalidad del General Manuel Belgrano', tipo: 'inamovible' },
  { fecha: '2027-07-09', nombre: 'Día de la Independencia', tipo: 'inamovible' },
  { fecha: '2027-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'trasladable' },
  { fecha: '2027-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'trasladable' },
  { fecha: '2027-11-20', nombre: 'Día de la Soberanía Nacional', tipo: 'trasladable' },
  { fecha: '2027-12-08', nombre: 'Día de la Inmaculada Concepción de María', tipo: 'inamovible' },
  { fecha: '2027-12-25', nombre: 'Navidad', tipo: 'inamovible' },
];
