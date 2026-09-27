// Comedores universitarios de la UNR. El sistema MORA (comedores.unr.edu.ar) pide DNI y clave
// para ver el menú y reservar, y no tiene API pública: acá va solo lo que la UNR publica abierto.
// Fuentes: unr.edu.ar/comedores y unr.edu.ar/abrieron-los-comedores-universitarios-3 (09/02/2026).
// Relevado el 27/09/2026; actualizar a mano cuando cambien precios u horarios.

export const COMEDORES_RELEVADO = '2026-09-27';

export const MORA_URL = 'https://comedores.unr.edu.ar/';
export const MORA_ALTA_URL = 'https://comedores-gestion.unr.edu.ar/';
export const COMEDORES_INFO_URL = 'https://unr.edu.ar/comedores/';
export const COMEDORES_INSTAGRAM_URL = 'https://www.instagram.com/comedores_unr/';

export interface SedeComedor {
  id: string;
  nombre: string;
  zona: string;
  direccion: string;
  /** Búsqueda para abrir en el mapa */
  mapa: string;
}

/** Casilda primero: es la sede de la Facultad de Ciencias Veterinarias. */
export const SEDES_COMEDOR: SedeComedor[] = [
  { id: 'casilda', nombre: 'Comedor Casilda', zona: 'Ciencias Veterinarias', direccion: 'Ovidio Lagos y Ruta 33, Casilda', mapa: 'Facultad de Ciencias Veterinarias UNR, Casilda' },
  { id: 'centro', nombre: 'Comedor Centro', zona: 'Área Centro', direccion: 'Córdoba 1917, Rosario', mapa: 'Córdoba 1917, Rosario' },
  { id: 'siberia', nombre: 'Comedor Siberia', zona: 'Ciudad Universitaria', direccion: 'Berutti y Riobamba, Rosario', mapa: 'Berutti y Riobamba, Rosario' },
  { id: 'salud', nombre: 'Comedor Salud', zona: 'Área Salud', direccion: 'Ricchieri 690 (Santa Fe y Ricchieri), Rosario', mapa: 'Ricchieri 690, Rosario' },
  { id: 'fceia', nombre: 'Comedor FCEIA', zona: 'Exactas, Ingeniería y Agrimensura', direccion: 'Av. Pellegrini 250, Rosario', mapa: 'Av. Pellegrini 250, Rosario' },
  { id: 'zavalla', nombre: 'Comedor Zavalla', zona: 'Ciencias Agrarias', direccion: 'Parque Villarino, Zavalla', mapa: 'Parque Villarino, Zavalla' },
];

export interface FranjaHoraria {
  periodo: string;
  horario: string;
  detalle: string;
}

export const HORARIOS_COMEDOR: FranjaHoraria[] = [
  { periodo: 'Marzo a noviembre', horario: '7:45 a 22:00', detalle: 'Desayuno, almuerzo, merienda y cena' },
  { periodo: 'Febrero', horario: '7:45 a 16:00', detalle: 'Desayuno, almuerzo y merienda (sin cena)' },
];

export interface PrecioComedor {
  quien: string;
  comida: string;
  precio: number;
}

export const PRECIOS_COMEDOR: PrecioComedor[] = [
  { quien: 'Estudiantes', comida: 'Almuerzo o cena', precio: 1800 },
  { quien: 'Estudiantes', comida: 'Desayuno o merienda', precio: 950 },
  { quien: 'Docentes y no docentes', comida: 'Menú completo', precio: 4200 },
];

export const SERVICIOS_COMEDOR: string[] = [
  'Menú que cambia todas las semanas, supervisado por nutricionistas de la UNR',
  'Opción vegetariana todos los días',
  'Opción sin TACC para celíacos',
  'Sopa gratis',
  'Abierto a toda la comunidad, no solo a estudiantes',
];

export const ALTA_COMEDOR: { quien: string; que: string }[] = [
  { quien: 'Ya tenés cuenta', que: 'Entrá a MORA con tu DNI y clave para ver el menú y reservar.' },
  { quien: 'Estudiantes', que: 'Certificado de alumno regular vigente y DNI, en cualquier comedor o en el alta de MORA.' },
  { quien: 'Ingresantes 2026', que: 'Constancia de inscripción definitiva (no la preinscripción) y DNI.' },
  { quien: 'Docentes y no docentes', que: 'Recibo de sueldo y DNI.' },
];

export const formatoPesos = (n: number): string => `$${n.toLocaleString('es-AR')}`;

export const mapaUrl = (s: SedeComedor): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapa)}`;
