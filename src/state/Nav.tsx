// Navegación interna sin router: pestañas + pila de páginas + hojas (detalle / "¿Cómo llego?").
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Direccion } from '../lib/types';
import { haptic } from './nativo';
import { TABS_COLECTIVOS } from './util';

/**
 * `inicio` es el menú con el logo; `colectivos` es el feed de colectivos (Horarios y Favoritos cuelgan
 * de él); `carrera` es el Plan de Estudio; `mails` los mails de cátedra.
 */
export type Tab = 'inicio' | 'colectivos' | 'horarios' | 'favoritos' | 'carrera' | 'mails' | 'mas';
export type Pagina = 'avisos' | 'remises' | 'empresas' | 'feriados' | 'ajustes' | 'acerca' | 'plan2026';

/** Vista de la pestaña Horarios: lista de salidas o gráfico de frecuencia */
export type VistaHorarios = 'lista' | 'grafico';

export interface DetalleAbierto {
  servicioId: string;
  /** YYYY-MM-DD de la ocurrencia elegida (opcional) */
  fecha?: string;
}

/** Pedido de "¿Cómo llego?" (Rosario → Casilda para llegar a una mesa de examen en la Facultad) */
export interface ComoLlegoPedido {
  /** YYYY-MM-DD */
  fecha: string;
  /** "HH:MM" de la mesa; sin hora → se muestran las salidas de la mañana */
  hora?: string;
  /** Materia / evento */
  titulo: string;
  /** Turno u otra aclaración */
  subtitulo?: string;
}

/** Apertura de Horarios en una fecha con salidas resaltadas */
export interface HorariosPedido {
  /** YYYY-MM-DD */
  fecha?: string;
  destacar?: string[];
  /**
   * Sentido a mostrar SOLO en esta visita a Horarios (no cambia el sentido global de la app;
   * al salir de la pestaña se vuelve al sentido que tenía el usuario).
   */
  direccion?: Direccion;
  vista?: VistaHorarios;
}

interface NavValor {
  tab: Tab;
  pila: Pagina[];
  detalle: DetalleAbierto | null;
  comoLlego: ComoLlegoPedido | null;
  horariosPedido: HorariosPedido | null;
  irA: (t: Tab) => void;
  abrir: (p: Pagina) => void;
  volver: () => void;
  abrirDetalle: (servicioId: string, fecha?: string) => void;
  cerrarDetalle: () => void;
  abrirComoLlego: (p: ComoLlegoPedido) => void;
  cerrarComoLlego: () => void;
  /** Va a Horarios (opcionalmente en una fecha / vista / sentido local, resaltando servicios) */
  verHorarios: (p?: HorariosPedido) => void;
  /**
   * Registra un manejador de "atrás" (p. ej. modales de Carrera). Debe devolver true si cerró algo.
   * Devuelve la función para desregistrarlo.
   */
  registrarAtras: (fn: () => boolean) => () => void;
  /** Maneja "atrás": true si hizo algo, false si ya no hay a dónde volver */
  atras: () => boolean;
}

const Ctx = createContext<NavValor | null>(null);

export function useNav(): NavValor {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav fuera de <NavProvider>');
  return v;
}

export function NavProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>('inicio');
  const [pila, setPila] = useState<Pagina[]>([]);
  const [detalle, setDetalle] = useState<DetalleAbierto | null>(null);
  const [comoLlego, setComoLlego] = useState<ComoLlegoPedido | null>(null);
  const [horariosPedido, setHorariosPedido] = useState<HorariosPedido | null>(null);
  const manejadores = useRef<(() => boolean)[]>([]);

  // Refs para que `atras` lea siempre el estado actual desde listeners nativos
  const estado = useRef({ tab, pila, detalle, comoLlego });
  estado.current = { tab, pila, detalle, comoLlego };

  const irA = useCallback((t: Tab) => {
    haptic();
    setPila([]);
    setHorariosPedido(null);
    setTab(t);
  }, []);
  const abrir = useCallback((p: Pagina) => { haptic(); setPila((s) => [...s, p]); }, []);
  const volver = useCallback(() => setPila((s) => s.slice(0, -1)), []);
  const abrirDetalle = useCallback((servicioId: string, fecha?: string) => {
    haptic();
    setDetalle({ servicioId, fecha });
  }, []);
  const cerrarDetalle = useCallback(() => setDetalle(null), []);
  const abrirComoLlego = useCallback((p: ComoLlegoPedido) => { haptic(); setComoLlego(p); }, []);
  const cerrarComoLlego = useCallback(() => setComoLlego(null), []);
  const verHorarios = useCallback((p?: HorariosPedido) => {
    haptic();
    setComoLlego(null);
    setDetalle(null);
    setPila([]);
    setHorariosPedido(p ?? null);
    setTab('horarios');
  }, []);
  const registrarAtras = useCallback((fn: () => boolean) => {
    manejadores.current.push(fn);
    return () => { manejadores.current = manejadores.current.filter((f) => f !== fn); };
  }, []);

  const atras = useCallback((): boolean => {
    const e = estado.current;
    if (e.detalle) { setDetalle(null); return true; }
    if (e.comoLlego) { setComoLlego(null); return true; }
    // Manejadores registrados (el más reciente primero): modales de Carrera, etc.
    for (let i = manejadores.current.length - 1; i >= 0; i--) {
      if (manejadores.current[i]()) return true;
    }
    if (e.pila.length) { setPila((s) => s.slice(0, -1)); return true; }
    if (e.tab !== 'inicio') {
      setHorariosPedido(null);
      setTab(e.tab !== 'colectivos' && TABS_COLECTIVOS.includes(e.tab) ? 'colectivos' : 'inicio');
      return true;
    }
    return false;
  }, []);

  const valor = useMemo<NavValor>(() => ({
    tab, pila, detalle, comoLlego, horariosPedido,
    irA, abrir, volver, abrirDetalle, cerrarDetalle, abrirComoLlego, cerrarComoLlego, verHorarios, registrarAtras, atras,
  }), [tab, pila, detalle, comoLlego, horariosPedido,
    irA, abrir, volver, abrirDetalle, cerrarDetalle, abrirComoLlego, cerrarComoLlego, verHorarios, registrarAtras, atras]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
