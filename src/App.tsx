import { Suspense, lazy, useEffect } from 'react';
import type { JSX } from 'react';
import type { PluginListenerHandle } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { AppStateProvider, useApp } from './state/AppState';
import { NavProvider, useNav } from './state/Nav';
import type { Pagina, Tab } from './state/Nav';
import { esNativo } from './services/plataforma';
import { TabBar } from './components/TabBar';
import { ErrorSeccion } from './components/ErrorSeccion';
import { Menu } from './screens/Menu';
import { Inicio } from './screens/Inicio';
import { Horarios } from './screens/Horarios';
import { Favoritos } from './screens/Favoritos';
import { Avisos } from './screens/Alertas';
import { Mas } from './screens/Mas';
import { Detalle } from './screens/Detalle';
import { ComoLlego } from './screens/ComoLlego';
import { Remises } from './screens/Remises';
import { Empresas } from './screens/Empresas';
import { FeriadosAnio } from './screens/FeriadosAnio';
import { Ajustes } from './screens/Ajustes';
import { Acerca } from './screens/Acerca';
import { Comedor } from './screens/Comedor';
import { Onboarding } from './screens/Onboarding';
import './App.css';

// Plan de Estudio (Correlativas FCV-UNR) se carga aparte: Tailwind, fuentes y Firebase no demoran el arranque.
const Carrera = lazy(() => import('./carrera/CarreraApp'));

function CarreraTab() {
  return (
    <Suspense fallback={<div className="carrera-cargando" role="status" aria-label="Cargando Plan de Estudio"><span className="spinner" /></div>}>
      <Carrera />
    </Suspense>
  );
}

// Mails de cátedra: incluye el plan de materias, también aparte.
const MailsLazy = lazy(() => import('./screens/Mails').then((m) => ({ default: m.Mails })));

function MailsTab() {
  return (
    <Suspense fallback={<div className="carrera-cargando" role="status" aria-label="Cargando mails"><span className="spinner" /></div>}>
      <MailsLazy />
    </Suspense>
  );
}

// Plan de Estudios 2026 (datos del documento de la facultad), también aparte.
const Plan2026Lazy = lazy(() => import('./screens/Plan2026').then((m) => ({ default: m.Plan2026 })));

function Plan2026Pagina() {
  return (
    <Suspense fallback={<div className="carrera-cargando" role="status" aria-label="Cargando Plan 2026"><span className="spinner" /></div>}>
      <Plan2026Lazy />
    </Suspense>
  );
}

// Mapa de la facultad (imagen con zoom), también aparte.
const MapaLazy = lazy(() => import('./screens/MapaFacu').then((m) => ({ default: m.MapaFacu })));

function MapaPagina() {
  return (
    <Suspense fallback={<div className="carrera-cargando" role="status" aria-label="Cargando mapa"><span className="spinner" /></div>}>
      <MapaLazy />
    </Suspense>
  );
}

// Guía de trámites (becas, boleto, certificados y título), también aparte.
const TramitesLazy = lazy(() => import('./screens/Tramites').then((m) => ({ default: m.Tramites })));

function TramitesPagina() {
  return (
    <Suspense fallback={<div className="carrera-cargando" role="status" aria-label="Cargando trámites"><span className="spinner" /></div>}>
      <TramitesLazy />
    </Suspense>
  );
}

const TABS: Record<Tab, () => JSX.Element> = {
  inicio: Menu,
  colectivos: Inicio,
  horarios: Horarios,
  favoritos: Favoritos,
  carrera: CarreraTab,
  mails: MailsTab,
  mas: Mas,
};

const PAGINAS: Record<Pagina, () => JSX.Element> = {
  avisos: Avisos,
  remises: Remises,
  empresas: Empresas,
  feriados: FeriadosAnio,
  ajustes: Ajustes,
  acerca: Acerca,
  plan2026: Plan2026Pagina,
  mapa: MapaPagina,
  tramites: TramitesPagina,
  comedor: Comedor,
};

function Shell() {
  const nav = useNav();
  const app = useApp();

  // Botón atrás de Android (hojas → páginas → Inicio → minimizar) y re-sincronización al volver.
  useEffect(() => {
    if (!esNativo()) return;
    const handles: Promise<PluginListenerHandle>[] = [
      CapApp.addListener('backButton', () => {
        if (!nav.atras()) void CapApp.minimizeApp();
      }),
      CapApp.addListener('resume', () => app.sincronizarEnFondo()),
    ];
    return () => { handles.forEach((h) => h.then((x) => x.remove()).catch(() => {})); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.atras, app.sincronizarEnFondo]);

  const TabActual = TABS[nav.tab];

  return (
    <div className="app">
      <main className="app__main" key={nav.tab}>
        <ErrorSeccion><TabActual /></ErrorSeccion>
      </main>
      {nav.pila.map((p, i) => {
        const P = PAGINAS[p];
        return <div className="page-layer" key={`${p}-${i}`} style={{ zIndex: 20 + i }}><P /></div>;
      })}
      <TabBar />
      <ComoLlego />
      <Detalle />
      {app.toast && (
        <div className="toast" key={app.toast.id} role="status" aria-live="polite">{app.toast.texto}</div>
      )}
      {!app.onboardingVisto && <Onboarding />}
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <NavProvider>
        <Shell />
      </NavProvider>
    </AppStateProvider>
  );
}
