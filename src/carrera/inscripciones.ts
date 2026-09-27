// Avisos de inscripción en Guaraní (cursado y mesas) y materias sugeridas según las correlativas.
// Todo se calcula con los datos locales de la app: el calendario 2026 (hitos inscripcion_guarani y
// fechas de mesa) y el avance que el alumno marcó en Correlativas. No se consulta Guaraní.
import { ACADEMIC_MILESTONES_2026, getAllExamDates2026, DAY_NAMES } from './data/calendar';
import { SUBJECTS, isSubjectEnabled } from './data/subjects';
import type { AcademicMilestone, StudentProgress, Subject } from './types';

export const URL_GUARANI = 'https://autogestion-guarani.unr.edu.ar/inicio_alumno';

/** Hora del aviso (el día anterior a la apertura o cierre, o días antes de una mesa). */
const HORA_AVISO = 19;
/** Días antes de la mesa en que se avisa que hay que anotarse. La inscripción a examen cierra antes de la
 *  fecha y el calendario no trae ese cierre, así que se avisa con margen (cubre un fin de semana). */
export const DIAS_ANTES_MESA = 5;
/** Tope de avisos programados (iOS admite 64 pendientes por app y hay otros recordatorios). */
const MAX_AVISOS = 30;

export interface AvisoInscripcion {
  /** Clave estable (se usa para el id de la notificación). */
  clave: string;
  fecha: Date;
  titulo: string;
  cuerpo: string;
}

export interface InscripcionCursado {
  apertura: AcademicMilestone;
  cierre?: AcademicMilestone;
}

const porCodigo = (a: Subject, b: Subject) =>
  a.year - b.year || a.numCode - b.numCode;

/** Materias regularizadas que el alumno ya puede rendir (tiene aprobadas las correlativas para rendir). */
export function materiasParaRendir(progreso: StudentProgress): Subject[] {
  return SUBJECTS.filter(
    (s) => progreso[s.code] === 'regular' && isSubjectEnabled(s, progreso, 'rendir').isEnabled,
  ).sort(porCodigo);
}

/** Materias sin cursar que el alumno está habilitado a cursar. */
export function materiasParaCursar(progreso: StudentProgress): Subject[] {
  return SUBJECTS.filter(
    (s) => (progreso[s.code] ?? 'pendiente') === 'pendiente' && isSubjectEnabled(s, progreso, 'cursar').isEnabled,
  ).sort(porCodigo);
}

/** Aperturas de inscripción a cursado con su cierre (del calendario académico). */
export function inscripcionesCursado(): InscripcionCursado[] {
  const hitos = ACADEMIC_MILESTONES_2026.filter((m) => m.type === 'inscripcion_guarani');
  const cuatri = (m: AcademicMilestone) => m.title.split(' - ')[1] ?? '';
  return hitos
    .filter((m) => /^Inicio/i.test(m.title))
    .map((apertura) => ({
      apertura,
      cierre: hitos.find((m) => /^Cierre/i.test(m.title) && cuatri(m) === cuatri(apertura)),
    }));
}

function fechaLocal(iso: string, hora = 0): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, hora);
}

function mas(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias, fecha.getHours());
}

/** "Física Biológica, Genética y 3 más" */
export function listarMaterias(materias: Pick<Subject, 'name'>[], max = 3): string {
  const nombres = materias.map((m) => m.name);
  if (nombres.length <= max) {
    return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0] ?? '';
  }
  return `${nombres.slice(0, max).join(', ')} y ${nombres.length - max} más`;
}

/** "lunes 5/10" */
export function diaCorto(iso: string): string {
  const f = fechaLocal(iso);
  return `${DAY_NAMES[f.getDay()].toLowerCase()} ${f.getDate()}/${f.getMonth() + 1}`;
}

/**
 * Avisos a programar desde `ahora`:
 *  - Cursado: el día anterior a que abra y a que cierre la inscripción, con las materias que puede cursar.
 *  - Mesas: DIAS_ANTES_MESA días antes de cada fecha con mesas de materias que puede rendir.
 * Ordenados por fecha y limitados a MAX_AVISOS.
 */
export function avisosInscripcion(progreso: StudentProgress, ahora: Date = new Date()): AvisoInscripcion[] {
  const avisos: AvisoInscripcion[] = [];

  const cursables = materiasParaCursar(progreso);
  for (const { apertura, cierre } of inscripcionesCursado()) {
    const cuatri = apertura.title.split(' - ')[1] ?? 'cursado';
    const sugerencia = cursables.length
      ? `Podés cursar ${listarMaterias(cursables)}.`
      : 'Revisá en Correlativas qué materias podés cursar.';
    avisos.push({
      clave: `cursado-abre-${apertura.dateStr}`,
      fecha: mas(fechaLocal(apertura.dateStr, HORA_AVISO), -1),
      titulo: `Mañana abre la inscripción a cursado (${cuatri})`,
      cuerpo: `Anotate en Guaraní. ${sugerencia}`,
    });
    if (cierre) {
      avisos.push({
        clave: `cursado-cierra-${cierre.dateStr}`,
        fecha: mas(fechaLocal(cierre.dateStr, HORA_AVISO), -1),
        titulo: `Mañana cierra la inscripción a cursado (${cuatri})`,
        cuerpo: `Cierra a las 23:59 en Guaraní. ${sugerencia}`,
      });
    }
  }

  const rendibles = new Map(materiasParaRendir(progreso).map((s) => [s.code, s] as const));
  if (rendibles.size) {
    const porFecha = new Map<string, Subject[]>();
    for (const e of getAllExamDates2026()) {
      const s = rendibles.get(e.subjectCode);
      if (!s) continue;
      const lista = porFecha.get(e.dateStr) ?? [];
      if (!lista.includes(s)) lista.push(s);
      porFecha.set(e.dateStr, lista);
    }
    for (const [dateStr, materias] of porFecha) {
      materias.sort(porCodigo);
      avisos.push({
        clave: `mesa-${dateStr}`,
        fecha: mas(fechaLocal(dateStr, HORA_AVISO), -DIAS_ANTES_MESA),
        titulo: `Mesa el ${diaCorto(dateStr)}: anotate en Guaraní`,
        cuerpo: `Podés rendir ${listarMaterias(materias)}. Inscribite antes de que cierre la inscripción.`,
      });
    }
  }

  return avisos
    .filter((a) => a.fecha.getTime() > ahora.getTime())
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .slice(0, MAX_AVISOS);
}

/** Próxima inscripción a cursado que todavía no cerró (o null). */
export function proximaInscripcionCursado(ahora: Date = new Date()): InscripcionCursado | null {
  const hoy = fechaLocal(
    `${ahora.getFullYear()}-${ahora.getMonth() + 1}-${ahora.getDate()}`,
  ).getTime();
  return (
    inscripcionesCursado().find(({ apertura, cierre }) =>
      fechaLocal((cierre ?? apertura).dateStr).getTime() >= hoy,
    ) ?? null
  );
}
