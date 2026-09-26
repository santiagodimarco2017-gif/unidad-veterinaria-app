// Transcripción EXACTA de tools/linea339.pdf (Municipio de Casilda), Línea 33/9 Rosario ⇄ Casilda.
// 3 tablas: "Lunes a Viernes a partir del 06/07/2026", "Sábados a partir del 30/12/2023",
// "Domingos y Feriados a partir del 07/01/2024". Cuando el mismo viaje (mismo sentido, misma hora
// de salida y mismas horas de parada) aparece en Sábados y en Domingos y Feriados, se emite UN solo
// Servicio con los días combinados (sab + dom + feriados). Si sólo coincide la hora de salida pero
// las paradas difieren, se mantienen como Servicios separados.
//
// NOTA (typo del PDF): en la tabla "Lunes a Viernes", sentido Casilda→Rosario, el viaje que sale de
// Terminal Casilda a las 11:25 figura con la parada siguiente "Casilda (Peaje)" en 11:17, es decir
// ANTES de la hora de salida. Todas sus paradas encajan con una salida 11:05, así que se corrige
// la salida a 11:05 (ver el viaje más abajo).

import type { Direccion, DiasServicio, Parada, Servicio } from '../lib/types';

const RC_PARADAS = [
  'Terminal Rosario',
  'Godoy P. Unidas',
  'Pérez (Esso)',
  'Zavalla (Entrada)',
  'Pujato (Entrada)',
  'Casilda (Peaje)',
  'Terminal Casilda',
] as const;

const CR_PARADAS = [
  'Terminal Casilda',
  'Casilda (Peaje)',
  'Pujato (Entrada)',
  'Zavalla (Entrada)',
  'Pérez (Esso)',
  'Godoy P. Unidas',
  'Terminal Rosario',
] as const;

const DIAS_LV: DiasServicio = {
  lun: true,
  mar: true,
  mie: true,
  jue: true,
  vie: true,
  sab: false,
  dom: false,
  feriados: false,
};

const DIAS_SAB: DiasServicio = {
  lun: false,
  mar: false,
  mie: false,
  jue: false,
  vie: false,
  sab: true,
  dom: false,
  feriados: false,
};

const DIAS_DOM_FERIADOS: DiasServicio = {
  lun: false,
  mar: false,
  mie: false,
  jue: false,
  vie: false,
  sab: false,
  dom: true,
  feriados: true,
};

const DIAS_SAB_DOM_FERIADOS: DiasServicio = {
  lun: false,
  mar: false,
  mie: false,
  jue: false,
  vie: false,
  sab: true,
  dom: true,
  feriados: true,
};

function mascara(d: DiasServicio): string {
  return [d.lun, d.mar, d.mie, d.jue, d.vie, d.sab, d.dom, d.feriados].map((b) => (b ? '1' : '0')).join('');
}

interface Viaje {
  numero: number;
  tiempos: string[];
  obs?: string;
}

function crear(direccion: Direccion, dias: DiasServicio, v: Viaje): Servicio {
  const nombres = direccion === 'RC' ? RC_PARADAS : CR_PARADAS;
  const paradas: Parada[] = nombres.map((nombre, i) => ({ nombre, hora: v.tiempos[i] }));
  const sale = v.tiempos[0];
  const llega = v.tiempos[v.tiempos.length - 1];
  const m = mascara(dias);
  return {
    id: `${direccion}-linea339-${sale}-${m}`,
    direccion,
    empresa: 'linea339',
    sale,
    llega,
    dias,
    tipoServicio: 'Aire acondicionado',
    observaciones: v.obs ?? `Servicio ${v.numero}`,
    paradas,
    fuente: 'municipio',
  };
}

// ---------------------------------------------------------------------------
// Lunes a Viernes a partir del 06/07/2026
// ---------------------------------------------------------------------------

const RC_LV: Viaje[] = [
  { numero: 252, tiempos: ['4:20', '4:32', '4:44', '4:54', '5:06', '5:15', '5:25'] },
  { numero: 250, tiempos: ['5:30', '5:46', '6:01', '6:12', '6:24', '6:34', '6:45'] },
  { numero: 251, tiempos: ['5:45', '6:01', '6:16', '6:27', '6:39', '6:49', '7:00'] },
  { numero: 252, tiempos: ['7:00', '7:18', '7:35', '7:46', '7:59', '8:08', '8:20'] },
  { numero: 251, tiempos: ['8:35', '8:53', '9:10', '9:21', '9:34', '9:43', '9:55'] },
  { numero: 250, tiempos: ['9:35', '9:53', '10:10', '10:21', '10:34', '10:43', '10:55'] },
  { numero: 252, tiempos: ['10:20', '10:38', '10:55', '11:06', '11:19', '11:28', '11:40'] },
  { numero: 251, tiempos: ['11:35', '11:53', '12:10', '12:21', '12:34', '12:43', '12:55'] },
  { numero: 253, tiempos: ['12:05', '12:23', '12:40', '12:51', '13:04', '13:13', '13:25'] },
  { numero: 250, tiempos: ['12:55', '13:13', '13:30', '13:41', '13:54', '14:03', '14:15'] },
  { numero: 251, tiempos: ['14:45', '15:03', '15:20', '15:31', '15:44', '15:53', '16:05'] },
  { numero: 253, tiempos: ['15:30', '15:48', '16:05', '16:16', '16:29', '16:38', '16:50'] },
  { numero: 250, tiempos: ['16:05', '16:23', '16:40', '16:51', '17:04', '17:13', '17:25'] },
  { numero: 254, tiempos: ['17:00', '17:18', '17:35', '17:46', '17:59', '18:08', '18:20'] },
  { numero: 251, tiempos: ['18:10', '18:28', '18:45', '18:56', '19:09', '19:18', '19:30'] },
  { numero: 250, tiempos: ['19:20', '19:36', '19:51', '20:02', '20:14', '20:24', '20:35'] },
  { numero: 254, tiempos: ['20:15', '20:28', '20:42', '20:53', '21:05', '21:14', '21:25'] },
  { numero: 251, tiempos: ['21:15', '21:28', '21:42', '21:53', '22:05', '22:14', '22:25'] },
];

const CR_LV: Viaje[] = [
  { numero: 252, tiempos: ['5:30', '5:41', '5:46', '6:03', '6:13', '6:28', '6:40'] },
  { numero: 251, tiempos: ['7:05', '7:17', '7:22', '7:40', '7:50', '8:08', '8:25'] },
  { numero: 250, tiempos: ['7:45', '7:57', '8:02', '8:20', '8:30', '8:48', '9:05'] },
  { numero: 252, tiempos: ['8:50', '9:02', '9:07', '9:25', '9:35', '9:53', '10:10'] },
  { numero: 251, tiempos: ['10:05', '10:17', '10:22', '10:40', '10:50', '11:08', '11:25'] },
  {
    numero: 250,
    // Typo del PDF: imprime salida 11:25, pero todas las paradas (11:17 … 12:25) corresponden a una
    // salida 11:05 (mismo patrón que el resto). Usamos 11:05: si en realidad fuera 11:25 el usuario
    // espera 20 min de más; al revés lo perdería.
    tiempos: ['11:05', '11:17', '11:22', '11:40', '11:50', '12:08', '12:25'],
    obs: 'Servicio 250 · El PDF municipal dice 11:25 pero sus paradas indican 11:05. Llegá temprano o confirmá con la empresa.',
  },
  { numero: 252, tiempos: ['12:00', '12:11', '12:16', '12:33', '12:43', '12:58', '13:10'] },
  { numero: 251, tiempos: ['13:15', '13:27', '13:32', '13:50', '14:00', '14:18', '14:35'] },
  { numero: 253, tiempos: ['14:00', '14:12', '14:17', '14:35', '14:45', '15:03', '15:20'] },
  { numero: 250, tiempos: ['14:30', '14:42', '14:47', '15:05', '15:15', '15:33', '15:50'] },
  { numero: 251, tiempos: ['16:30', '16:42', '16:47', '17:05', '17:15', '17:33', '17:50'] },
  { numero: 253, tiempos: ['17:05', '17:17', '17:22', '17:40', '17:50', '18:08', '18:25'] },
  { numero: 250, tiempos: ['17:50', '18:02', '18:07', '18:25', '18:35', '18:53', '19:10'] },
  { numero: 254, tiempos: ['18:30', '18:42', '18:47', '19:04', '19:14', '19:32', '19:48'] },
  { numero: 251, tiempos: ['19:40', '19:52', '19:57', '20:14', '20:24', '20:40', '20:54'] },
  { numero: 250, tiempos: ['20:45', '20:56', '21:01', '21:18', '21:28', '21:43', '21:55'] },
  { numero: 254, tiempos: ['22:00', '22:11', '22:16', '22:33', '22:43', '22:58', '23:10'] },
  { numero: 251, tiempos: ['22:30', '22:41', '22:46', '23:03', '23:13', '23:28', '23:40'] },
];

// ---------------------------------------------------------------------------
// Sábados a partir del 30/12/2023 + Domingos y Feriados a partir del 07/01/2024
// (ya combinados: sab+dom+feriados cuando el viaje es idéntico en ambas tablas)
// ---------------------------------------------------------------------------

const RC_SAB_DOM_FERIADOS: Viaje[] = [
  { numero: 250, tiempos: ['5:30', '5:41', '5:56', '6:04', '6:20', '6:28', '6:40'] },
  { numero: 251, tiempos: ['7:00', '7:16', '7:34', '7:42', '7:59', '8:07', '8:20'] },
  { numero: 252, tiempos: ['8:35', '8:51', '9:09', '9:17', '9:34', '9:42', '9:55'] },
  { numero: 250, tiempos: ['9:45', '10:01', '10:19', '10:27', '10:44', '10:52', '11:05'] },
  { numero: 251, tiempos: ['10:20', '10:36', '10:54', '11:02', '11:19', '11:27', '11:40'] },
  { numero: 252, tiempos: ['11:35', '11:51', '12:09', '12:17', '12:34', '12:42', '12:55'] },
  { numero: 253, tiempos: ['12:05', '12:21', '12:39', '12:47', '13:04', '13:12', '13:25'] },
  { numero: 250, tiempos: ['13:05', '13:21', '13:39', '13:47', '14:04', '14:12', '14:25'] },
  { numero: 253, tiempos: ['15:30', '15:46', '16:04', '16:12', '16:29', '16:37', '16:50'] },
  { numero: 250, tiempos: ['16:25', '16:41', '16:59', '17:07', '17:24', '17:32', '17:45'] },
  { numero: 254, tiempos: ['17:00', '17:16', '17:34', '17:42', '17:59', '18:07', '18:20'] },
  {
    numero: 255,
    tiempos: ['18:10', '18:26', '18:44', '18:52', '19:09', '19:17', '19:30'],
    obs: 'Servicio 255 (sáb) / 252 (dom y feriados)',
  },
  { numero: 250, tiempos: ['19:30', '19:44', '20:00', '20:08', '20:24', '20:32', '20:45'] },
  { numero: 254, tiempos: ['20:15', '20:28', '20:43', '20:50', '21:07', '21:14', '21:25'] },
  {
    numero: 255,
    tiempos: ['21:30', '21:43', '21:58', '22:05', '22:22', '22:29', '22:40'],
    obs: 'Servicio 255 (sáb) / 252 (dom y feriados)',
  },
];

// Sólo aparece en la tabla de Sábados (no coincide con ningún viaje de Domingos y Feriados).
const RC_SAB_SOLO: Viaje[] = [
  { numero: 253, tiempos: ['18:45', '19:00', '19:18', '19:25', '19:42', '19:50', '20:03'] },
];

// Sólo aparece en la tabla de Domingos y Feriados (no coincide con ningún viaje de Sábados).
const RC_DOM_FERIADOS_SOLO: Viaje[] = [
  { numero: 252, tiempos: ['14:45', '15:01', '15:19', '15:27', '15:44', '15:52', '16:05'] },
  { numero: 253, tiempos: ['18:50', '19:05', '19:23', '19:30', '19:47', '19:55', '20:08'] },
];

const CR_SAB_DOM_FERIADOS: Viaje[] = [
  { numero: 250, tiempos: ['7:45', '8:01', '8:06', '8:26', '8:33', '8:50', '9:05'] },
  { numero: 251, tiempos: ['8:50', '9:02', '9:07', '9:28', '9:35', '9:53', '10:10'] },
  { numero: 252, tiempos: ['10:05', '10:17', '10:22', '10:43', '10:50', '11:08', '11:25'] },
  { numero: 250, tiempos: ['11:25', '11:37', '11:42', '12:03', '12:10', '12:28', '12:45'] },
  { numero: 251, tiempos: ['12:00', '12:11', '12:16', '12:36', '12:43', '12:58', '13:10'] },
  { numero: 252, tiempos: ['13:15', '13:27', '13:32', '13:53', '14:00', '14:18', '14:35'] },
  { numero: 253, tiempos: ['14:00', '14:12', '14:17', '14:38', '14:45', '15:03', '15:20'] },
  { numero: 250, tiempos: ['15:00', '15:12', '15:17', '15:38', '15:45', '16:03', '16:20'] },
  { numero: 253, tiempos: ['17:20', '17:32', '17:37', '17:58', '18:05', '18:23', '18:40'] },
  { numero: 250, tiempos: ['17:55', '18:07', '18:12', '18:33', '18:40', '18:58', '19:15'] },
  { numero: 254, tiempos: ['18:30', '18:42', '18:47', '19:07', '19:14', '19:32', '19:48'] },
  {
    numero: 255,
    tiempos: ['19:40', '19:52', '19:57', '20:17', '20:24', '20:40', '20:54'],
    obs: 'Servicio 255 (sáb) / 252 (dom y feriados)',
  },
  { numero: 253, tiempos: ['20:40', '20:51', '20:56', '21:16', '21:23', '21:39', '21:52'] },
  { numero: 250, tiempos: ['21:00', '21:11', '21:16', '21:36', '21:43', '21:58', '22:10'] },
  { numero: 254, tiempos: ['22:00', '22:11', '22:16', '22:36', '22:43', '22:58', '23:10'] },
  {
    numero: 255,
    tiempos: ['22:45', '22:56', '23:01', '23:21', '23:28', '23:43', '23:55'],
    obs: 'Servicio 255 (sáb) / 252 (dom y feriados)',
  },
];

// Sólo aparece en la tabla de Domingos y Feriados (no coincide con ningún viaje de Sábados).
const CR_DOM_FERIADOS_SOLO: Viaje[] = [
  { numero: 252, tiempos: ['16:30', '16:42', '16:47', '17:08', '17:15', '17:33', '17:50'] },
];

export const SERVICIOS_MUNICIPIO_339: Servicio[] = [
  ...RC_LV.map((v) => crear('RC', DIAS_LV, v)),
  ...RC_SAB_DOM_FERIADOS.map((v) => crear('RC', DIAS_SAB_DOM_FERIADOS, v)),
  ...RC_SAB_SOLO.map((v) => crear('RC', DIAS_SAB, v)),
  ...RC_DOM_FERIADOS_SOLO.map((v) => crear('RC', DIAS_DOM_FERIADOS, v)),
  ...CR_LV.map((v) => crear('CR', DIAS_LV, v)),
  ...CR_SAB_DOM_FERIADOS.map((v) => crear('CR', DIAS_SAB_DOM_FERIADOS, v)),
  ...CR_DOM_FERIADOS_SOLO.map((v) => crear('CR', DIAS_DOM_FERIADOS, v)),
];
