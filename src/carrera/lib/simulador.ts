import type { StudentProgress, SubjectState, ViewMode } from '../types';
import { evaluateAllSubjects } from '../data/subjects';

/** Ciclo al tocar una materia en el simulador: pendiente → regular → aprobada → pendiente */
export const siguienteEstado = (actual: SubjectState | undefined): SubjectState => {
  if (!actual || actual === 'pendiente') return 'regular';
  if (actual === 'regular') return 'aprobada';
  return 'pendiente';
};

/** Compara la simulación con el progreso real: qué se aprobaría y qué materias se destrabarían */
export const compararSimulacion = (real: StudentProgress, simulado: StudentProgress, viewMode: ViewMode) => {
  const baseline = evaluateAllSubjects(real, viewMode);
  const simulacion = evaluateAllSubjects(simulado, viewMode);
  const nuevasAprobadas: string[] = [];
  const nuevasDestrabadas: string[] = [];

  for (const [code, simItem] of simulacion.entries()) {
    const baseItem = baseline.get(code);
    if (simulado[code] === 'aprobada' && real[code] !== 'aprobada') {
      nuevasAprobadas.push(code);
    }
    if (simItem.isEnabled && baseItem && !baseItem.isEnabled && simItem.state !== 'aprobada') {
      nuevasDestrabadas.push(code);
    }
  }

  return { nuevasAprobadas, nuevasDestrabadas };
};
