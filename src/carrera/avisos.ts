// Programa (o cancela) los avisos de inscripción con el avance guardado en Correlativas.
// Se importa de forma dinámica desde AppState para no sumar el calendario al arranque.
import { programarAvisosInscripcion } from '../services/notifications';
import { avisosInscripcion } from './inscripciones';
import { leerProgreso } from './proximaMesa';

export function sincronizarAvisosInscripcion(activo: boolean): Promise<number> {
  return programarAvisosInscripcion(activo ? avisosInscripcion(leerProgreso()) : []);
}
