// Guía de trámites de la FCV-UNR (Casilda): becas, boleto educativo, certificados, equivalencias y título.
// Relevado el 2026-09-27 de fveter.unr.edu.ar, unr.edu.ar, becas.unr.edu.ar y santafe.gob.ar. Se actualiza a mano.
// `lugar` es el número del "Mapa de nuestra facu" (src/data/mapaFacu.ts). `sinConfirmar` marca lo que las
// páginas oficiales no dicen y es una deducción nuestra: la app lo muestra con un aviso.
import type { IconName } from '../components/Icon';

export const RELEVADO = '2026-09-27';

export type TemaTramite = 'becas' | 'boleto' | 'papeles' | 'titulo';

export const TEMAS: { id: TemaTramite; titulo: string }[] = [
  { id: 'becas', titulo: 'Becas' },
  { id: 'boleto', titulo: 'Boleto' },
  { id: 'papeles', titulo: 'Certificados y Guaraní' },
  { id: 'titulo', titulo: 'Título' },
];

export interface Enlace { titulo: string; url: string }

export interface Paso {
  texto: string;
  /** Número del lugar en el mapa de la facultad */
  lugar?: number;
  enlace?: Enlace;
  /** Lo que no confirman las fuentes oficiales */
  sinConfirmar?: string;
}

export interface Tramite {
  id: string;
  tema: TemaTramite;
  icono: IconName;
  titulo: string;
  resumen: string;
  /** Fechas o vigencia, si las hay publicadas */
  cuando?: string;
  pasos: Paso[];
  contacto?: { mail?: string; tel?: string; dir?: string };
  fuente: Enlace;
}

const GUARANI = 'https://autogestion-guarani.unr.edu.ar/';
const TEL_FCV = '03464 42-2050';

export const TRAMITES: Tramite[] = [
  {
    id: 'becas-unr',
    tema: 'becas',
    icono: 'graduationCap',
    titulo: 'Becas de la UNR',
    resumen: 'Movilidad urbana, material de estudio, alimentos, residencias, madres y padres estudiantes y más. Se piden una vez por año.',
    cuando: 'En 2026 la inscripción fue del 25 de febrero al 20 de marzo',
    pasos: [
      { texto: 'Inscribite online en becas.unr.edu.ar y completá el formulario con tus datos socioeconómicos.', enlace: { titulo: 'becas.unr.edu.ar', url: 'https://becas.unr.edu.ar/' } },
      { texto: 'Subí la documentación que respalda lo que declaraste (ingresos, grupo familiar, etc.).' },
      {
        texto: 'Si tenés dudas en la facultad, acercate a la Secretaría Estudiantil.',
        lugar: 30,
        sinConfirmar: 'La web de la UNR no dice qué oficina de la facultad orienta con las becas de la UNR',
      },
    ],
    contacto: { mail: 'infobecas@unr.edu.ar', dir: 'Sarmiento 784, 3° piso, Rosario (lunes a viernes de 9 a 16)' },
    fuente: { titulo: 'unr.edu.ar: Inscripción a las Becas 2026', url: 'https://unr.edu.ar/inscripcion-a-las-becas-2026/' },
  },
  {
    id: 'beca-vivienda',
    tema: 'becas',
    icono: 'home',
    titulo: 'Beca de vivienda de la facultad',
    resumen: 'La FCV tiene dos casas con 12 plazas cada una (una para varones y una alquilada para mujeres). Dura un año.',
    pasos: [
      { texto: 'Descargá el formulario de inscripción y la lista de requisitos 2026.', enlace: { titulo: 'Formulario Becas Vivienda (PDF)', url: 'https://fveter.unr.edu.ar/assets/archivos/Formulario%20Becas%20Vivienda.pdf' } },
      { texto: 'Juntá la documentación de la lista (los datos personales van como declaración jurada).', enlace: { titulo: 'Requisitos beca de vivienda 2026 (PDF)', url: 'https://fveter.unr.edu.ar/assets/archivos/Requisitos%20beca%20de%20vivienda%202026.pdf' } },
      {
        texto: 'Entregá todo en la Secretaría de Relaciones Estudiantiles y Graduados.',
        lugar: 30,
        sinConfirmar: 'Suponemos que es la "Secretaría Estudiantil" del mapa (30); la web no da la ubicación',
      },
    ],
    contacto: { tel: TEL_FCV },
    fuente: { titulo: 'fveter.unr.edu.ar: Becas de la Facultad', url: 'https://fveter.unr.edu.ar/becasdelfacultad.html' },
  },
  {
    id: 'progresar',
    tema: 'becas',
    icono: 'star',
    titulo: 'Beca Progresar',
    resumen: 'Beca nacional para estudiantes de nivel superior. Se pide desde la app Progresar.',
    pasos: [
      { texto: 'Revisá los requisitos de Progresar nivel superior.', enlace: { titulo: 'Requisitos (argentina.gob.ar)', url: 'https://www.argentina.gob.ar/educacion/progresar/requisitos/progresar-nivel-superior' } },
      { texto: 'Descargá la app Progresar e inscribite cuando abra la convocatoria.' },
      { texto: 'Si te piden la regularidad, sacá el certificado de alumno regular (ver "Certificado de alumno regular").' },
    ],
    fuente: { titulo: 'fveter.unr.edu.ar: Becas nacionales', url: 'https://fveter.unr.edu.ar/becas-nacionales.html' },
  },
  {
    id: 'boleto',
    tema: 'boleto',
    icono: 'bus',
    titulo: 'Boleto Educativo Gratuito',
    resumen: 'Beneficio de la Provincia de Santa Fe para estudiantes regulares: dos pasajes gratis por día, de lunes a viernes.',
    cuando: 'En 2026 rige del 2 de febrero al 23 de diciembre (inscripción desde el 26 de enero)',
    pasos: [
      { texto: 'Entrá a santafe.gob.ar/boletoeducativo o a la app Mi Santa Fe y tocá "Solicitá el beneficio".', enlace: { titulo: 'Boleto Educativo (santafe.gob.ar)', url: 'https://www.santafe.gob.ar/boletoeducativo/' } },
      { texto: 'Ingresá con tu ID Ciudadana (si no tenés, creala) y completá tus datos.' },
      { texto: 'Si el sistema te lo pide, subí el certificado de alumno regular (lo sacás en Guaraní).' },
      { texto: 'Cuando te aprueben, acreditalo en tu tarjeta SUBE en cualquier terminal. En los interurbanos sin SUBE el pasaje sale como voucher o código QR desde la app.' },
      {
        texto: 'Para ir y volver de Rosario, fijate en la app qué empresas del corredor Casilda ⇄ Rosario lo aceptan.',
        sinConfirmar: 'Las fuentes no listan empresas ni si cubre el tramo Casilda ⇄ Rosario',
      },
    ],
    fuente: { titulo: 'La Capital: el trámite paso a paso', url: 'https://www.lacapital.com.ar/la-ciudad/boleto-educativo-santa-fe-el-tramite-paso-paso-obtener-el-beneficio-n10241849.html' },
  },
  {
    id: 'certificado',
    tema: 'papeles',
    icono: 'check',
    titulo: 'Certificado de alumno regular',
    resumen: 'Lo piden el boleto, las becas, la obra social y los trabajos. Se pide por Guaraní y se retira en la facultad.',
    pasos: [
      { texto: 'En Guaraní autogestión, entrá a "Operaciones de autogestión" y pedí el certificado. Ahí también actualizás tus datos personales.', enlace: { titulo: 'SIU Guaraní UNR', url: GUARANI } },
      { texto: 'Retiralo en la Secretaría Estudiantil.', lugar: 30 },
    ],
    contacto: { mail: 'soporte@fcv.unr.edu.ar', tel: TEL_FCV },
    fuente: { titulo: 'fveter.unr.edu.ar: Alumnado', url: 'https://fveter.unr.edu.ar/pd_alumnado' },
  },
  {
    id: 'reinscripcion',
    tema: 'papeles',
    icono: 'refresh',
    titulo: 'Reinscripción anual',
    resumen: 'Todos los años tenés que renovar la inscripción para seguir siendo alumno activo.',
    pasos: [
      { texto: 'Renová el año académico por internet en Guaraní.', enlace: { titulo: 'SIU Guaraní UNR', url: GUARANI } },
      { texto: 'Anotá el número de transacción: es tu único comprobante si tenés que reclamar en Alumnado.', lugar: 16 },
    ],
    fuente: { titulo: 'fveter.unr.edu.ar: Alumnado', url: 'https://fveter.unr.edu.ar/pd_alumnado' },
  },
  {
    id: 'equivalencias',
    tema: 'papeles',
    icono: 'swap',
    titulo: 'Pase y equivalencias',
    resumen: 'Si venís de otra carrera o universidad, podés pedir que te reconozcan materias (formulario IRPEQ 1).',
    pasos: [
      { texto: 'Pedí en tu facultad de origen el certificado analítico y los programas de las materias aprobadas.' },
      {
        texto: 'Presentá el formulario IRPEQ 1 con esa documentación en Alumnado.',
        lugar: 16,
        sinConfirmar: 'La web lista la documentación pero no dice en qué oficina se entrega',
      },
    ],
    contacto: { tel: TEL_FCV },
    fuente: { titulo: 'fveter.unr.edu.ar: Alumnado', url: 'https://fveter.unr.edu.ar/pd_alumnado' },
  },
  {
    id: 'titulo',
    tema: 'titulo',
    icono: 'flag',
    titulo: 'Trámite de egreso (título)',
    resumen: 'Cuando aprobás la última materia, pedís el título por Guaraní y mandás la documentación por mail, las dos cosas juntas.',
    pasos: [
      { texto: 'Descargá el instructivo de egreso de la web de la facultad y armá la documentación completa.', enlace: { titulo: 'Trámite de egreso (fveter)', url: 'https://fveter.unr.edu.ar/pd_tramite-de-egreso' } },
      { texto: 'Hacé la solicitud en Guaraní autogestión.', enlace: { titulo: 'SIU Guaraní UNR', url: GUARANI } },
      { texto: 'El mismo día mandá la documentación por mail a Títulos. Si está incompleta, la solicitud se da de baja a las 24 horas.' },
      { texto: 'Diplomas y legalizaciones siguen en la UNR.', enlace: { titulo: 'unr.edu.ar: Diplomas y legalizaciones', url: 'https://unr.edu.ar/diplomas-y-legalizaciones/' } },
    ],
    contacto: { mail: 'titulos-csveterinarias@unr.edu.ar' },
    fuente: { titulo: 'fveter.unr.edu.ar: Trámite de egreso', url: 'https://fveter.unr.edu.ar/pd_tramite-de-egreso' },
  },
];

/** Oficinas del predio a las que mandan los trámites (número del mapa y para qué ir) */
export const OFICINAS: { lugar: number; para: string; sinConfirmar?: string }[] = [
  { lugar: 30, para: 'Retirar certificados. Becas de vivienda.' },
  { lugar: 16, para: 'Inscripciones, reinscripción y reclamos con número de transacción.', sinConfirmar: 'La web no detalla qué se atiende en ventanilla' },
  { lugar: 3, para: 'Decanato y autoridades.' },
  {
    lugar: 29,
    para: 'Atención de salud para estudiantes.',
    sinConfirmar: 'La web de la facultad ubica el Centro de Salud en el Pabellón 15; el mapa lo marca en el 29',
  },
];

export const CONTACTO_FCV = { tel: TEL_FCV, dir: 'Bv. Ovidio Lagos 1000, Casilda' };
