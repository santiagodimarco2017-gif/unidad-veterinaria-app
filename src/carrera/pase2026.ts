// "¿Cómo quedarías en el Plan 2026?": aplica la matriz de equivalencias al avance del Plan 2009 que el
// estudiante marcó en la app, y revisa los plazos del plan de transición.
import { MATERIAS_2026, PLAZOS, equivalencias } from './data/plan2026';
import type { Plazo } from './data/plan2026';
import type { StudentProgress } from './types';

export type EstadoPase = 'aprobada' | 'aprobada-parcial' | 'regular' | 'regular-parcial';

const RANGO: Record<EstadoPase, number> = { aprobada: 4, 'aprobada-parcial': 3, regular: 2, 'regular-parcial': 1 };

export interface ResultadoPase {
  /** Estado que tendría cada materia (y curso de orientación) del Plan 2026, por código */
  porCodigo: Record<string, { estado: EstadoPase; desde: string[] }>;
  aprobadas: number;
  parciales: number;
  regulares: number;
  /** Horas del Plan 2026 cubiertas por equivalencias totales aprobadas */
  horas: number;
}

export function simularPase(progreso: StudentProgress): ResultadoPase {
  const porCodigo: ResultadoPase['porCodigo'] = {};
  for (const [c2009, st] of Object.entries(progreso)) {
    if (st !== 'regular' && st !== 'aprobada') continue;
    for (const d of equivalencias(c2009, st)) {
      const estado: EstadoPase = st === 'aprobada' ? (d.p ? 'aprobada-parcial' : 'aprobada') : (d.p ? 'regular-parcial' : 'regular');
      const prev = porCodigo[d.code];
      if (!prev) porCodigo[d.code] = { estado, desde: [c2009] };
      else {
        prev.desde.push(c2009);
        if (RANGO[estado] > RANGO[prev.estado]) prev.estado = estado;
      }
    }
  }
  let aprobadas = 0, parciales = 0, regulares = 0, horas = 0;
  for (const m of MATERIAS_2026) {
    const r = porCodigo[m.code];
    if (!r) continue;
    if (r.estado === 'aprobada') { aprobadas++; horas += m.horas; }
    else if (r.estado === 'aprobada-parcial') parciales++;
    else regulares++;
  }
  return { porCodigo, aprobadas, parciales, regulares, horas };
}

export interface PlazoEstado extends Plazo {
  cumple: boolean;
  /** Materias 2009 que faltan para cumplir */
  faltan: string[];
  dias: number;
  vencido: boolean;
}

const DIA = 86_400_000;

export function estadoPlazos(progreso: StudentProgress, ahora: Date = new Date()): PlazoEstado[] {
  return PLAZOS.map((p) => {
    const faltan = p.materias.filter((c) => {
      const st = progreso[c];
      return p.requisito === 'aprobada' ? st !== 'aprobada' : st !== 'regular' && st !== 'aprobada';
    });
    const [y, m, d] = p.fecha.split('-').map(Number);
    const fin = new Date(y, m - 1, d, 23, 59).getTime();
    return { ...p, faltan, cumple: faltan.length === 0, dias: Math.ceil((fin - ahora.getTime()) / DIA), vencido: fin < ahora.getTime() };
  });
}
