// Combina datos de la Terminal Rosario con el cuadro municipal del 33/9 y detecta cambios entre versiones.
import type { Servicio } from './types';
import { horaAMinutos, idServicio, mascaraDias, normalizarHora } from './schedule';

export const NOTA_TERMINAL = 'Según Terminal Rosario';

const claveHorario = (s: Servicio): string => `${s.direccion}|${s.sale}`;
const claveServicio = (s: Servicio): string => `${s.direccion}|${s.empresa}|${s.sale}`;
const claveExacta = (s: Servicio): string => `${claveServicio(s)}|${mascaraDias(s.dias)}`;

const agregarNota = (obs: string, nota: string): string =>
  !obs ? nota : obs.includes(nota) ? obs : `${obs} · ${nota}`;

/** Horas a "HH:MM" (también en paradas) e id recalculado con el formato estable */
export function normalizarServicio(s: Servicio): Servicio {
  const base = { ...s, sale: normalizarHora(s.sale), llega: normalizarHora(s.llega) };
  return {
    ...base,
    id: idServicio(base),
    ...(s.paradas ? { paradas: s.paradas.map((p) => ({ ...p, hora: normalizarHora(p.hora) })) } : {}),
  };
}

export function ordenarServicios(servicios: Servicio[]): Servicio[] {
  return servicios.sort(
    (a, b) =>
      a.direccion.localeCompare(b.direccion) ||
      horaAMinutos(a.sale) - horaAMinutos(b.sale) ||
      a.empresa.localeCompare(b.empresa) ||
      mascaraDias(a.dias).localeCompare(mascaraDias(b.dias)),
  );
}

/**
 * 33/9: prevalece el cuadro municipal. Los 33/9 de la terminal con el mismo sentido+hora de salida
 * que algún servicio municipal se descartan (y el municipal pasa a fuente 'ambas');
 * el resto se conserva como variante con la nota "Según Terminal Rosario".
 * Otras empresas: tal cual la terminal. Duplicados exactos (sentido+empresa+sale+días) se eliminan.
 * Resultado ordenado por sentido y hora de salida.
 */
export function construirServicios(
  terminalCrudo: readonly Servicio[],
  municipioCrudo: readonly Servicio[],
): Servicio[] {
  const terminal = terminalCrudo.map(normalizarServicio);
  const municipio = municipioCrudo.map(normalizarServicio);
  const horariosMunicipio = new Set(municipio.map(claveHorario));
  const confirmados = new Map<string, Servicio>(); // claveHorario → servicio de terminal que coincide

  const deTerminal: Servicio[] = [];
  for (const s of terminal) {
    if (s.empresa !== 'linea339') {
      deTerminal.push(s);
    } else if (horariosMunicipio.has(claveHorario(s))) {
      if (!confirmados.has(claveHorario(s))) confirmados.set(claveHorario(s), s);
    } else {
      deTerminal.push({ ...s, observaciones: agregarNota(s.observaciones, NOTA_TERMINAL) });
    }
  }

  const deMunicipio = municipio.map((m): Servicio => {
    const t = confirmados.get(claveHorario(m));
    if (!t) return m;
    return {
      ...m,
      fuente: 'ambas',
      ...(m.viajeId === undefined && t.viajeId !== undefined ? { viajeId: t.viajeId } : {}),
    };
  });

  const vistos = new Set<string>();
  const res: Servicio[] = [];
  for (const s of [...deMunicipio, ...deTerminal]) {
    const k = claveExacta(s);
    if (vistos.has(k)) continue;
    vistos.add(k);
    res.push(s);
  }
  return ordenarServicios(res);
}

export interface CambiosServicios {
  agregados: Servicio[];
  quitados: Servicio[];
  modificados: Servicio[];
}

/**
 * Compara dos versiones. Primero por id; lo que no empareja se vuelve a emparejar por
 * sentido+empresa+sale. `modificados` = mismo servicio con distinta llegada o días (versión nueva).
 */
export function detectarCambios(antes: readonly Servicio[], despues: readonly Servicio[]): CambiosServicios {
  const modificados: Servicio[] = [];
  const antesPorId = new Map(antes.map((s) => [s.id, s]));
  const idsDespues = new Set(despues.map((s) => s.id));

  const restoDespues: Servicio[] = [];
  for (const d of despues) {
    const a = antesPorId.get(d.id);
    if (!a) restoDespues.push(d);
    else if (a.llega !== d.llega || mascaraDias(a.dias) !== mascaraDias(d.dias)) modificados.push(d);
  }

  // Sin coincidencia de id: agrupar por clave y emparejar en orden
  const restoAntes = new Map<string, Servicio[]>();
  for (const a of antes) {
    if (idsDespues.has(a.id)) continue;
    const k = claveServicio(a);
    restoAntes.set(k, [...(restoAntes.get(k) ?? []), a]);
  }

  const agregados: Servicio[] = [];
  for (const d of restoDespues) {
    const candidatos = restoAntes.get(claveServicio(d));
    const a = candidatos?.shift();
    if (!a) agregados.push(d);
    else if (a.llega !== d.llega || mascaraDias(a.dias) !== mascaraDias(d.dias)) modificados.push(d);
  }

  const quitados = [...restoAntes.values()].flat();
  return { agregados, quitados, modificados };
}
