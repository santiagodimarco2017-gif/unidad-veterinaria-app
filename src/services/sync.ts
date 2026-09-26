// Orquestador principal: combina cache, actualización en vivo, feriados y alertas (paro / cambio de
// horario / feriado próximo), guarda todo en storage y notifica solo las alertas nuevas que el usuario
// no vio todavía y que sus Ajustes permiten. Nunca lanza: cualquier falla degrada a los datos incluidos.

import type { Ajustes, Alerta, Feriado, Servicio } from '../lib/types';
import { SERVICIOS_INCLUIDOS, SNAPSHOT_FECHA } from '../data/index';
import { detectarCambios } from '../lib/merge';
import { obtenerFeriados, proximosFeriados } from './feriados';
import { actualizarDesdeTerminal } from './liveTerminal';
import { buscarAlertasParo } from './noticias';
import { notificarAlerta } from './notifications';
import { cargar, guardar, CLAVES } from './storage';

export interface ResultadoSync {
  servicios: Servicio[];
  actualizado: string;
  origen: 'incluido' | 'cache' | 'en-vivo';
  feriados: Feriado[];
  alertas: Alerta[];
  cambios: { agregados: number; quitados: number; modificados: number } | null;
}

interface CacheServicios {
  servicios: Servicio[];
  actualizado: string;
  origen: 'incluido' | 'cache' | 'en-vivo';
}

const ALERTAS_MAX_EDAD_DIAS = 30;
const ALERTAS_MAX_CANTIDAD = 50;
const FERIADO_AVISO_DIAS = 7;

const AJUSTES_POR_DEFECTO: Ajustes = {
  tema: 'sistema',
  direccionPorDefecto: 'auto',
  notifParos: true,
  notifCambios: true,
  notifFeriados: true,
  empresasOcultas: [],
  textoGrande: false,
};

const NOMBRES_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function formatearFechaCorta(fechaISO: string): string {
  const d = new Date(`${fechaISO}T00:00:00`);
  const dia = NOMBRES_DIA[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia} ${dd}/${mm}`;
}

async function cargarCacheOIncluidos(): Promise<CacheServicios> {
  const cache = await cargar<CacheServicios | null>(CLAVES.CACHE_SERVICIOS, null);
  if (cache && cache.servicios.length > 0) return cache;
  return { servicios: SERVICIOS_INCLUIDOS, actualizado: SNAPSHOT_FECHA, origen: 'incluido' };
}

/** Devuelve rápidamente los datos ya guardados (sin red), para pintar la UI apenas arranca la app. */
export async function cargarDatosIniciales(): Promise<ResultadoSync> {
  const base = await cargarCacheOIncluidos();
  const feriados = await cargar<Feriado[]>(CLAVES.CACHE_FERIADOS, []).then((c) =>
    Array.isArray(c) && c.length > 0 ? c : [],
  );
  const alertas = await cargar<Alerta[]>(CLAVES.ALERTAS, []);
  return {
    servicios: base.servicios,
    actualizado: base.actualizado,
    origen: base.origen,
    feriados,
    alertas,
    cambios: null,
  };
}

function dedupeYRecortarAlertas(alertas: Alerta[]): Alerta[] {
  const corte = Date.now() - ALERTAS_MAX_EDAD_DIAS * 24 * 60 * 60 * 1000;
  const vistos = new Set<string>();
  const filtradas: Alerta[] = [];
  // Más nuevas primero para priorizar cuáles quedan si hay que recortar a ALERTAS_MAX_CANTIDAD.
  const ordenadas = [...alertas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  for (const a of ordenadas) {
    if (vistos.has(a.id)) continue;
    const t = new Date(a.fecha).getTime();
    if (!Number.isNaN(t) && t < corte) continue;
    vistos.add(a.id);
    filtradas.push(a);
    if (filtradas.length >= ALERTAS_MAX_CANTIDAD) break;
  }
  return filtradas;
}

/** Ejecuta la sincronización completa. `opts.notificar = false` evita disparar notificaciones (p.ej. sync silenciosa en background). */
export async function sincronizar(opts?: { notificar?: boolean }): Promise<ResultadoSync> {
  const notificar = opts?.notificar ?? true;

  try {
    const cacheActual = await cargarCacheOIncluidos();
    let servicios = cacheActual.servicios;
    let origen = cacheActual.origen;
    let actualizado = cacheActual.actualizado;
    let cambios: { agregados: number; quitados: number; modificados: number } | null = null;
    const alertasNuevas: Alerta[] = [];

    // 1. Intentar actualización en vivo.
    try {
      const enVivo = await actualizarDesdeTerminal();
      if (enVivo && enVivo.length > 0) {
        try {
          const detectados = detectarCambios(cacheActual.servicios, enVivo);
          const totalCambios = detectados.agregados.length + detectados.quitados.length + detectados.modificados.length;
          if (totalCambios > 0) {
            cambios = {
              agregados: detectados.agregados.length,
              quitados: detectados.quitados.length,
              modificados: detectados.modificados.length,
            };
            const partes: string[] = [];
            if (detectados.agregados.length > 0) partes.push(`${detectados.agregados.length} servicios nuevos`);
            if (detectados.quitados.length > 0) partes.push(`${detectados.quitados.length} quitados`);
            if (detectados.modificados.length > 0) partes.push(`${detectados.modificados.length} modificados`);
            alertasNuevas.push({
              id: `cambio-${Date.now()}`,
              tipo: 'cambio_horario',
              titulo: 'Cambio de horario detectado',
              detalle: partes.join(', '),
              fecha: new Date().toISOString(),
              nivel: 'media',
            });
          }
        } catch {
          // Si detectarCambios falla igual usamos los datos en vivo.
        }
        servicios = enVivo;
        origen = 'en-vivo';
        actualizado = new Date().toISOString();
        await guardar<CacheServicios>(CLAVES.CACHE_SERVICIOS, { servicios, actualizado, origen });
      } else if (origen === 'en-vivo') {
        // No hubo respuesta en vivo esta vez pero la cache ya tenía datos: se mantiene como 'cache'.
        origen = 'cache';
      }
    } catch {
      // Degradar silenciosamente a lo que había en cache/incluido.
    }

    // 2. Feriados.
    const feriados = await obtenerFeriados();

    // 3. Alertas de paro.
    let alertasParo: Alerta[] = [];
    try {
      alertasParo = await buscarAlertasParo();
    } catch {
      alertasParo = [];
    }
    alertasNuevas.push(...alertasParo);

    // 4. Alertas de feriados próximos (dentro de FERIADO_AVISO_DIAS).
    try {
      const proximos = proximosFeriados(feriados, new Date(), FERIADO_AVISO_DIAS);
      for (const f of proximos) {
        alertasNuevas.push({
          id: `feriado-${f.fecha}`,
          tipo: 'feriado',
          titulo: `El ${formatearFechaCorta(f.fecha)} es feriado (${f.nombre})`,
          detalle: 'Rige horario de domingos y feriados.',
          fecha: new Date().toISOString(),
          nivel: 'baja',
        });
      }
    } catch {
      // no-op
    }

    // 5. Mezclar con alertas guardadas, dedupe y recorte.
    const alertasGuardadas = await cargar<Alerta[]>(CLAVES.ALERTAS, []);
    const alertas = dedupeYRecortarAlertas([...alertasNuevas, ...alertasGuardadas]);
    await guardar(CLAVES.ALERTAS, alertas);

    // 6. Notificar solo las nunca vistas y permitidas por Ajustes.
    if (notificar) {
      try {
        const ajustes = await cargar<Ajustes>(CLAVES.AJUSTES, AJUSTES_POR_DEFECTO);
        const vistas = await cargar<string[]>(CLAVES.ALERTAS_VISTAS, []);
        const vistasSet = new Set(vistas);
        const permiteTipo = (tipo: Alerta['tipo']): boolean => {
          if (tipo === 'paro') return ajustes.notifParos;
          if (tipo === 'cambio_horario') return ajustes.notifCambios;
          if (tipo === 'feriado') return ajustes.notifFeriados;
          return true;
        };
        const nuevasParaNotificar = alertasNuevas.filter((a) => !vistasSet.has(a.id) && permiteTipo(a.tipo));
        for (const a of nuevasParaNotificar) {
          await notificarAlerta(a);
          vistasSet.add(a.id);
        }
        if (nuevasParaNotificar.length > 0) {
          await guardar(CLAVES.ALERTAS_VISTAS, Array.from(vistasSet).slice(-500));
        }
      } catch {
        // no-op: fallo al notificar no debe romper la sync.
      }
    }

    await guardar(CLAVES.ULTIMA_SYNC, new Date().toISOString());

    return { servicios, actualizado, origen, feriados, alertas, cambios };
  } catch {
    // Degradación total: devolver lo incluido de fábrica.
    return {
      servicios: SERVICIOS_INCLUIDOS,
      actualizado: SNAPSHOT_FECHA,
      origen: 'incluido',
      feriados: [],
      alertas: [],
      cambios: null,
    };
  }
}
