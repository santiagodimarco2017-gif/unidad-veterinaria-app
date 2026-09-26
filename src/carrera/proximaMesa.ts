// Progreso guardado de Correlativas y próxima mesa relevante para el estudiante.
// Inicio lo importa de forma dinámica (no suma el calendario al paquete de arranque).
import { getAllExamDates2026 } from './data/calendar';
import type { ExamDate, StudentProgress } from './types';

/** Misma clave que usaba la app original (el avance guardado se conserva) */
export const STORAGE_KEY = 'fcv_unr_correlativas_simple_v2';

export function leerProgreso(): StudentProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as StudentProgress;
  } catch {
    /* sin almacenamiento */
  }
  return {};
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** "8.30 hs" → minutos (default 8:00 si no se entiende) */
function minutosMesa(t?: string): number {
  const m = t?.match(/(\d{1,2})(?:\s*[.:h]\s*(\d{2}))?/i);
  return m ? Number(m[1]) * 60 + (m[2] ? Number(m[2]) : 0) : 8 * 60;
}

/**
 * Próxima mesa (dentro de `dias` días) de una materia que el estudiante tiene REGULARIZADA
 * (es decir, que le queda rendir el final). null si no hay o no marcó materias.
 */
export function proximaMesaRegular(ahora: Date = new Date(), dias = 7): ExamDate | null {
  const progreso = leerProgreso();
  const regulares = new Set(Object.entries(progreso).filter(([, st]) => st === 'regular').map(([c]) => c));
  if (!regulares.size) return null;
  const desde = iso(ahora);
  const hasta = iso(new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + dias));
  const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const candidatas = getAllExamDates2026()
    .filter((e) => regulares.has(e.subjectCode) && e.dateStr >= desde && e.dateStr <= hasta)
    .filter((e) => e.dateStr !== desde || minutosMesa(e.timeStr) > minAhora)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr) || minutosMesa(a.timeStr) - minutosMesa(b.timeStr));
  return candidatas[0] ?? null;
}
