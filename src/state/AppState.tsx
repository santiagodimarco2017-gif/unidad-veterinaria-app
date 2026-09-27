// Estado global de la app: datos, favoritos, ajustes, sentido, reloj y sincronización.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Ajustes, Alerta, Direccion, Favorito, Feriado, Servicio } from '../lib/types';
import { FERIADOS_INCLUIDOS, SERVICIOS_INCLUIDOS, SNAPSHOT_FECHA } from '../data';
import { cargarDatosIniciales, sincronizar } from '../services/sync';
import { CLAVES, cargar, guardar } from '../services/storage';
import { programarRecordatorios } from '../services/notifications';
import { climaActual } from '../services/clima';
import { direccionPorUbicacion } from './nativo';
import { DIAS } from './util';

export interface Clima {
  tempC: number;
  codigo: number;
  descripcion: string;
  lluviaProxHoras: boolean;
}

export interface Cambios {
  agregados: number;
  quitados: number;
  modificados: number;
}

export const AJUSTES_DEFECTO: Ajustes = {
  tema: 'sistema',
  direccionPorDefecto: 'auto',
  notifParos: true,
  notifCambios: true,
  notifFeriados: true,
  notifInscripciones: true,
  empresasOcultas: [],
  textoGrande: false,
};

const CLAVE_ONBOARDING = 'onboarding_visto';
const CLAVE_ULTIMA_DIR = 'ultima_direccion';
const TICK_MS = 15_000;

interface AppStateValor {
  cargando: boolean;
  servicios: Servicio[];
  /** servicios sin las empresas ocultas */
  visibles: Servicio[];
  feriados: Feriado[];
  alertas: Alerta[];
  actualizado: string;
  origen: 'incluido' | 'cache' | 'en-vivo';
  cambios: Cambios | null;
  sincronizando: boolean;
  actualizar: () => Promise<void>;
  /** re-sincroniza sin avisos (al volver del segundo plano) */
  sincronizarEnFondo: () => void;

  favoritos: Favorito[];
  esFavorito: (servicioId: string) => boolean;
  alternarFavorito: (servicioId: string) => boolean;
  guardarFavorito: (servicioId: string, parcial: Partial<Favorito>) => void;
  quitarFavorito: (servicioId: string) => void;

  ajustes: Ajustes;
  cambiarAjustes: (parcial: Partial<Ajustes>) => void;

  direccion: Direccion;
  setDireccion: (d: Direccion) => void;
  invertir: () => void;

  ahora: Date;
  clima: Partial<Record<'Rosario' | 'Casilda', Clima | null>>;

  onboardingVisto: boolean;
  terminarOnboarding: () => void;
  reiniciarOnboarding: () => void;

  toast: { id: number; texto: string } | null;
  avisar: (texto: string) => void;
}

const Ctx = createContext<AppStateValor | null>(null);

export function useApp(): AppStateValor {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp fuera de <AppStateProvider>');
  return v;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [servicios, setServicios] = useState<Servicio[]>(SERVICIOS_INCLUIDOS);
  const [feriados, setFeriados] = useState<Feriado[]>(FERIADOS_INCLUIDOS);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [actualizado, setActualizado] = useState<string>(SNAPSHOT_FECHA);
  const [origen, setOrigen] = useState<AppStateValor['origen']>('incluido');
  const [cambios, setCambios] = useState<Cambios | null>(null);
  const [sincronizando, setSincronizando] = useState(false);

  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES_DEFECTO);
  const [prefsListas, setPrefsListas] = useState(false);
  const [direccion, setDireccionState] = useState<Direccion>('CR');
  const [ahora, setAhora] = useState(() => new Date());
  const [clima, setClima] = useState<AppStateValor['clima']>({});
  const [onboardingVisto, setOnboardingVisto] = useState(true);
  const [toast, setToast] = useState<AppStateValor['toast']>(null);

  const aplicar = useCallback((r: {
    servicios: Servicio[]; actualizado: string; origen: AppStateValor['origen'];
    feriados: Feriado[]; alertas: Alerta[]; cambios: Cambios | null;
  }) => {
    if (r.servicios?.length) setServicios(r.servicios);
    if (r.feriados?.length) setFeriados(r.feriados);
    setAlertas(r.alertas ?? []);
    if (r.actualizado) setActualizado(r.actualizado);
    setOrigen(r.origen);
    if (r.cambios && r.cambios.agregados + r.cambios.quitados + r.cambios.modificados > 0) setCambios(r.cambios);
  }, []);

  // ---- toast ----
  const toastTimer = useRef<number | undefined>(undefined);
  const avisar = useCallback((texto: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), texto });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  // ---- sincronización ----
  const sincronizandoRef = useRef(false);
  const sync = useCallback(async (notificar: boolean, manual: boolean) => {
    if (sincronizandoRef.current) return;
    sincronizandoRef.current = true;
    setSincronizando(true);
    try {
      const r = await sincronizar({ notificar });
      aplicar(r);
      if (manual) avisar(r.origen === 'en-vivo' ? 'Horarios actualizados' : 'Sin conexión: usando datos guardados');
    } catch {
      if (manual) avisar('No se pudo actualizar. Probá de nuevo más tarde.');
    } finally {
      sincronizandoRef.current = false;
      setSincronizando(false);
    }
  }, [aplicar, avisar]);

  const actualizar = useCallback(() => sync(false, true), [sync]);
  const sincronizarEnFondo = useCallback(() => { setAhora(new Date()); void sync(true, false); }, [sync]);

  // ---- carga inicial ----
  useEffect(() => {
    let vivo = true;
    (async () => {
      const [favs, aj, onb, ultima] = await Promise.all([
        cargar<Favorito[]>(CLAVES.FAVORITOS, []),
        cargar<Ajustes>(CLAVES.AJUSTES, AJUSTES_DEFECTO),
        cargar<boolean>(CLAVE_ONBOARDING, false),
        cargar<Direccion | null>(CLAVE_ULTIMA_DIR, null),
      ]);
      if (!vivo) return;
      const ajustesOk = { ...AJUSTES_DEFECTO, ...aj };
      setFavoritos(Array.isArray(favs) ? favs : []);
      setAjustes(ajustesOk);
      setOnboardingVisto(onb);
      if (ajustesOk.direccionPorDefecto !== 'auto') setDireccionState(ajustesOk.direccionPorDefecto);
      else if (ultima) setDireccionState(ultima);
      setPrefsListas(true);

      try {
        const r = await cargarDatosIniciales();
        if (vivo) aplicar(r);
      } catch {
        // quedan los datos incluidos
      }
      if (!vivo) return;
      setCargando(false);

      // Sentido automático por ubicación (sin bloquear la UI)
      if (ajustesOk.direccionPorDefecto === 'auto') {
        direccionPorUbicacion(false).then((d) => { if (vivo && d) setDireccionState(d); });
      }
      // Sincronización en segundo plano
      void sync(true, false);
    })();
    return () => { vivo = false; };
  }, [aplicar, sync]);

  // ---- reloj ----
  useEffect(() => {
    const tick = () => setAhora(new Date());
    const id = window.setInterval(tick, TICK_MS);
    const vis = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', vis);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', vis); };
  }, []);

  // ---- persistencia ----
  useEffect(() => { if (prefsListas) void guardar(CLAVES.FAVORITOS, favoritos); }, [favoritos, prefsListas]);
  useEffect(() => { if (prefsListas) void guardar(CLAVES.AJUSTES, ajustes); }, [ajustes, prefsListas]);

  // ---- recordatorios ----
  useEffect(() => {
    if (!prefsListas || cargando) return;
    const id = window.setTimeout(() => { programarRecordatorios(favoritos, servicios).catch(() => {}); }, 600);
    return () => window.clearTimeout(id);
  }, [favoritos, servicios, prefsListas, cargando]);

  // Avisos de inscripción de Carrera (CarreraApp los vuelve a programar cuando cambia el avance).
  useEffect(() => {
    if (!prefsListas) return;
    import('../carrera/avisos')
      .then((m) => m.sincronizarAvisosInscripcion(ajustes.notifInscripciones))
      .catch(() => {});
  }, [ajustes.notifInscripciones, prefsListas]);

  // ---- tema y texto grande ----
  useEffect(() => {
    const root = document.documentElement;
    if (ajustes.tema === 'claro') root.dataset.theme = 'light';
    else if (ajustes.tema === 'oscuro') root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    if (ajustes.textoGrande) root.dataset.texto = 'grande';
    else delete root.dataset.texto;
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    if (meta && bg) meta.setAttribute('content', bg);
  }, [ajustes.tema, ajustes.textoGrande]);

  // ---- clima del destino ----
  const destino = direccion === 'CR' ? 'Rosario' : 'Casilda';
  useEffect(() => {
    let vivo = true;
    const pedir = () => climaActual(destino).then((c) => { if (vivo) setClima((p) => ({ ...p, [destino]: c })); }).catch(() => {});
    void pedir();
    const id = window.setInterval(pedir, 30 * 60_000);
    return () => { vivo = false; window.clearInterval(id); };
  }, [destino]);

  // ---- acciones ----
  const setDireccion = useCallback((d: Direccion) => {
    setDireccionState(d);
    void guardar(CLAVE_ULTIMA_DIR, d);
  }, []);
  const invertir = useCallback(() => {
    setDireccionState((d) => {
      const n: Direccion = d === 'CR' ? 'RC' : 'CR';
      void guardar(CLAVE_ULTIMA_DIR, n);
      return n;
    });
  }, []);

  const favIds = useMemo(() => new Set(favoritos.map((f) => f.servicioId)), [favoritos]);
  const esFavorito = useCallback((id: string) => favIds.has(id), [favIds]);

  const alternarFavorito = useCallback((servicioId: string): boolean => {
    const ahoraEs = !favIds.has(servicioId);
    setFavoritos((fs) => fs.some((f) => f.servicioId === servicioId)
      ? fs.filter((f) => f.servicioId !== servicioId)
      : [...fs, { servicioId, avisoMin: null, diasAviso: [...DIAS], creado: new Date().toISOString() }]);
    return ahoraEs;
  }, [favIds]);

  const guardarFavorito = useCallback((servicioId: string, parcial: Partial<Favorito>) => {
    setFavoritos((fs) => {
      const i = fs.findIndex((f) => f.servicioId === servicioId);
      if (i < 0) return [...fs, { servicioId, avisoMin: null, diasAviso: [...DIAS], creado: new Date().toISOString(), ...parcial }];
      const copia = fs.slice();
      copia[i] = { ...copia[i], ...parcial, servicioId };
      return copia;
    });
  }, []);

  const quitarFavorito = useCallback((servicioId: string) => {
    setFavoritos((fs) => fs.filter((f) => f.servicioId !== servicioId));
  }, []);

  const cambiarAjustes = useCallback((parcial: Partial<Ajustes>) => {
    setAjustes((a) => ({ ...a, ...parcial }));
    if (parcial.direccionPorDefecto && parcial.direccionPorDefecto !== 'auto') setDireccionState(parcial.direccionPorDefecto);
  }, []);

  const terminarOnboarding = useCallback(() => {
    setOnboardingVisto(true);
    void guardar(CLAVE_ONBOARDING, true);
  }, []);
  const reiniciarOnboarding = useCallback(() => setOnboardingVisto(false), []);

  const visibles = useMemo(() => {
    if (!ajustes.empresasOcultas.length) return servicios;
    const ocultas = new Set(ajustes.empresasOcultas);
    return servicios.filter((s) => !ocultas.has(s.empresa));
  }, [servicios, ajustes.empresasOcultas]);

  const valor: AppStateValor = {
    cargando, servicios, visibles, feriados, alertas, actualizado, origen, cambios, sincronizando, actualizar,
    sincronizarEnFondo, favoritos, esFavorito, alternarFavorito, guardarFavorito, quitarFavorito,
    ajustes, cambiarAjustes,
    direccion, setDireccion, invertir,
    ahora, clima,
    onboardingVisto: onboardingVisto || !prefsListas, terminarOnboarding, reiniciarOnboarding,
    toast, avisar,
  };

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
