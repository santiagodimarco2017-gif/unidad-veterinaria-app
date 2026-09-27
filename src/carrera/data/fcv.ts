// Datos de fveter.unr.edu.ar incluidos en la app (no se consultan en vivo).
// Mails: https://fveter.unr.edu.ar/catedras.html · Novedades: https://fveter.unr.edu.ar/Noticias.php
// Relevado el 27/09/2026. Se incluyen como datos fijos porque la web no tiene API ni RSS, carga los
// eventos con JavaScript y no habilita CORS; los mails de cátedra cambian muy poco.

export const URL_FCV = 'https://fveter.unr.edu.ar/';
export const URL_FCV_NOTICIAS = 'https://fveter.unr.edu.ar/Noticias.php';
export const URL_FCV_CATEDRAS = 'https://fveter.unr.edu.ar/catedras.html';

/** Mail de cada cátedra por código de materia del plan (las que la web no lista, no figuran). */
export const MAIL_CATEDRA: Record<string, string> = {
  '1.1.1': 'fisica@fcv.unr.edu.ar',
  '1.2.1': 'quimica1@fcv.unr.edu.ar',
  '1.3.1': 'biologia@fcv.unr.edu.ar',
  '1.4.1': 'metodologia@fcv.unr.edu.ar',
  '1.5.2': 'anatomia1@fcv.unr.edu.ar',
  '1.6.2': 'histologia1@fcv.unr.edu.ar',
  '1.7.2': 'quimica2@fcv.unr.edu.ar',
  '2.8.1': 'anatomia2@fcv.unr.edu.ar',
  '2.9.1': 'histologia2@fcv.unr.edu.ar',
  '2.10.1': 'zootecnia@fcv.unr.edu.ar',
  '2.11.1': 'bioestadistica@fcv.unr.edu.ar',
  '2.12': 'fisiologia@fcv.unr.edu.ar',
  '2.13.2': 'genetica@fcv.unr.edu.ar',
  '2.14.2': 'microbiologia@fcv.unr.edu.ar',
  '2.15.2': 'parasitologia@fcv.unr.edu.ar',
  '3.16.1': 'inmunologia@fcv.unr.edu.ar',
  '3.17.1': 'epidemiologia@fcv.unr.edu.ar',
  '3.18.1': 'semiologia@fcv.unr.edu.ar',
  '3.19.1': 'patologiagral@fcv.unr.edu.ar',
  '3.20.2': 'farmacologia@fcv.unr.edu.ar',
  '3.21.2': 'sociologia@fcv.unr.edu.ar',
  '3.22.2': 'patologiaesp@fcv.unr.edu.ar',
  '3.23.2': 'cirugia1@fcv.unr.edu.ar',
  '3.24.2': 'ingles1@fcv.unr.edu.ar',
  '4.25.1': 'enfparasitarias@fcv.unr.edu.ar',
  '4.26.1': 'enfinfecciosas@fcv.unr.edu.ar',
  '4.27.1': 'cirugia2@fcv.unr.edu.ar',
  '4.28.1': 'nutricion@fcv.unr.edu.ar',
  '4.29.1': 'ingles2@fcv.unr.edu.ar',
  '4.30.2': 'medica@fcv.unr.edu.ar',
  '4.31.2': 'quirurgica@fcv.unr.edu.ar',
  '4.32.2': 'obstetricia@fcv.unr.edu.ar',
  '4.33.2': 'etica@fcv.unr.edu.ar',
  '4.34.2': 'sueros@fcv.unr.edu.ar',
  '5.35.1': 'agrostologia@fcv.unr.edu.ar',
  '5.36.1': 'economia@fcv.unr.edu.ar',
  '5.37.1': 'porcinosypeqrum@fcv.unr.edu.ar',
  '5.38.1': 'avesypiliferos@fcv.unr.edu.ar',
  '5.39.1': 'fauna@fcv.unr.edu.ar',
  '5.40.1': 'higiene@fcv.unr.edu.ar',
  '5.41.2': 'bovlecheros@fcv.unr.edu.ar',
  '5.42.2': 'prodcarne@fcv.unr.edu.ar',
  '5.43.2': 'saludpublica@fcv.unr.edu.ar',
  '5.44.2': 'tecnologiaalimentos@fcv.unr.edu.ar',
  '5.45.2': 'prodequina@fcv.unr.edu.ar',
  '6.47.1': 'clinicagrandes@fcv.unr.edu.ar',
};

/** Optativas y cátedras libres (no están en el plan de correlativas). */
export const MAILS_OPTATIVAS: { nombre: string; mail: string }[] = [
  { nombre: 'Portugués', mail: 'portugues@fcv.unr.edu.ar' },
  { nombre: 'Protección y Bienestar Animal', mail: 'bienestaranimal@fcv.unr.edu.ar' },
  { nombre: 'Piscicultura', mail: 'piscicultura@fcv.unr.edu.ar' },
  { nombre: 'Intervenciones Asistidas con Animales', mail: 'iaca@fcv.unr.edu.ar' },
  { nombre: 'Salud Productiva Apícola', mail: 'saludproductivaapicola@fcv.unr.edu.ar' },
  { nombre: 'Dermatología Veterinaria', mail: 'dermatologiavet@fcv.unr.edu.ar' },
  { nombre: 'Terapéuticas Complementarias en Medicina Veterinaria', mail: 'terapeuticascomplementarias-mv@fcv.unr.edu.ar' },
  { nombre: 'Cátedra Libre de Fauna Silvestre', mail: 'catedra-libre-fauna-silvestre@fcv.unr.edu.ar' },
];

export interface EventoFcv {
  /** YYYY-MM-DD; sin fecha si la facultad todavía no la publicó. */
  dateStr?: string;
  titulo: string;
  detalle: string;
  url: string;
}

/** Eventos de la facultad pensados para estudiantes de grado (sin cursos de posgrado). */
export const EVENTOS_FCV: EventoFcv[] = [
  {
    titulo: 'XXVI Jornadas de Divulgación Técnico-Científicas 2026',
    detalle: 'Abiertas a estudiantes. La facultad publicará el cronograma.',
    url: 'https://fveter.unr.edu.ar/noticia.php?id=1725',
  },
];

/** Eventos sin fecha o de hoy en adelante, ordenados (los sin fecha al final). */
export function eventosVigentes(ahora: Date = new Date()): EventoFcv[] {
  const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
  return EVENTOS_FCV.filter((e) => !e.dateStr || e.dateStr >= hoy).sort((a, b) =>
    (a.dateStr ?? '9999').localeCompare(b.dateStr ?? '9999'),
  );
}
