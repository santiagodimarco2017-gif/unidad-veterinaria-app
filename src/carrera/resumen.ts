// Resumen del Plan de Estudio para el menú de inicio. El menú lo importa de forma dinámica
// (no suma el plan ni el calendario al paquete de arranque).
import { SUBJECTS } from './data/subjects';
import { leerProgreso, proximaMesaRegular } from './proximaMesa';
import { proximaInscripcionCursado } from './inscripciones';
import { eventosVigentes } from './data/fcv';
import type { EventoFcv } from './data/fcv';

export interface ResumenPlan {
  aprobadas: number;
  regulares: number;
  total: number;
  /** 0–100 */
  porcentaje: number;
  /** Próxima novedad para el estudiante, en una línea (mesa, inscripción o evento de la facultad) */
  novedad: string | null;
  /** Próximo evento de la facultad (fveter) */
  evento: EventoFcv | null;
}

const fmtDia = new Intl.DateTimeFormat('es-AR', { weekday: 'long' });

/** "jueves 8/10" */
function fecha(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${fmtDia.format(new Date(y, m - 1, d))} ${d}/${m}`;
}

export function resumenPlan(ahora: Date = new Date()): ResumenPlan {
  const progreso = leerProgreso();
  const total = SUBJECTS.length;
  let aprobadas = 0;
  let regulares = 0;
  for (const s of SUBJECTS) {
    if (progreso[s.code] === 'aprobada') aprobadas++;
    else if (progreso[s.code] === 'regular') regulares++;
  }

  const evento = eventosVigentes(ahora)[0] ?? null;
  let novedad: string | null = null;
  const mesa = proximaMesaRegular(ahora, 14);
  if (mesa) {
    novedad = `Mesa de ${mesa.subjectName} el ${fecha(mesa.dateStr)}`;
  } else {
    const insc = proximaInscripcionCursado(ahora);
    if (insc) {
      const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
      novedad = insc.apertura.dateStr > hoy
        ? `Inscripción a cursado desde el ${fecha(insc.apertura.dateStr)}`
        : insc.cierre
          ? `Inscripción a cursado abierta hasta el ${fecha(insc.cierre.dateStr)}`
          : 'Inscripción a cursado abierta';
    } else if (evento) {
      novedad = evento.dateStr ? `${evento.titulo} · ${fecha(evento.dateStr)}` : evento.titulo;
    }
  }

  return {
    aprobadas,
    regulares,
    total,
    porcentaje: total ? Math.round((aprobadas / total) * 100) : 0,
    novedad,
    evento,
  };
}
