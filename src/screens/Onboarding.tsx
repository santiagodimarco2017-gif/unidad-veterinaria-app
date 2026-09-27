// Introducción de primer uso: 2 pasos cortos (sentido preferido, activar avisos) y "Saltar".
import { useState } from 'react';
import type { Ajustes } from '../lib/types';
import { pedirPermisoNotificaciones } from '../services/notifications';
import { useApp } from '../state/AppState';
import { AppLogo } from '../components/AppLogo';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { direccionPorUbicacion, haptic } from '../state/nativo';

type Pref = Ajustes['direccionPorDefecto'];

export function Onboarding() {
  const app = useApp();
  const [paso, setPaso] = useState(0);
  const [pref, setPref] = useState<Pref>(app.ajustes.direccionPorDefecto);
  const [pidiendo, setPidiendo] = useState(false);

  const elegir = (p: Pref) => {
    haptic();
    setPref(p);
    app.cambiarAjustes({ direccionPorDefecto: p });
    if (p === 'auto') direccionPorUbicacion(true).then((d) => { if (d) app.setDireccion(d); });
  };

  const terminar = () => { haptic('medio'); app.terminarOnboarding(); };

  const activar = async () => {
    haptic('medio');
    setPidiendo(true);
    const ok = await pedirPermisoNotificaciones().catch(() => false);
    setPidiendo(false);
    app.cambiarAjustes({ notifParos: ok, notifCambios: ok, notifFeriados: ok, notifInscripciones: ok });
    app.avisar(ok ? '¡Listo! Avisos activados' : 'Sin permiso: podés activarlos después en Más → Ajustes');
    app.terminarOnboarding();
  };

  return (
    <div className="onb" role="dialog" aria-modal="true" aria-label="Bienvenida">
      <div className="onb__top">
        <span className="onb__paso">Paso {paso + 1} de 2</span>
        <button type="button" className="btn btn--ghost" onClick={terminar}>Saltar</button>
      </div>

      <div className="onb__track" style={{ transform: `translateX(${-paso * 100}%)` }}>
        {/* 1. Sentido */}
        <section className="onb__slide" aria-hidden={paso !== 0}>
          <div className="onb__art"><AppLogo size={84} /></div>
          <h1 className="onb__t">¿Para dónde viajás más seguido?</h1>
          <p className="onb__s">Lo vas a ver primero al abrir la app. Podés cambiarlo cuando quieras.</p>
          <div className="onb__opts">
            <Opcion icono="arrowRight" titulo="Casilda → Rosario" sub="Vivo en Casilda" on={pref === 'CR'} onClick={() => elegir('CR')} />
            <Opcion icono="arrowRight" titulo="Rosario → Casilda" sub="Vivo o estudio en Rosario" on={pref === 'RC'} onClick={() => elegir('RC')} flip />
            <Opcion icono="locate" titulo="Automático" sub="Según dónde estés (usa tu ubicación)" on={pref === 'auto'} onClick={() => elegir('auto')} />
          </div>
        </section>

        {/* 2. Avisos */}
        <section className="onb__slide" aria-hidden={paso !== 1}>
          <div className="onb__art"><span className="onb__bell"><Icon name="bell" size={46} /></span></div>
          <h1 className="onb__t">¿Te avisamos?</h1>
          <p className="onb__s">Te mandamos un aviso si hay paro, si cambian los horarios o antes de que salga tu colectivo favorito.</p>
        </section>
      </div>

      <footer className="onb__foot">
        {paso === 0 ? (
          <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => { haptic(); setPaso(1); }}>
            Siguiente <Icon name="chevronRight" size={18} />
          </button>
        ) : (
          <>
            <button type="button" className="btn btn--primary btn--lg btn--block" onClick={activar} disabled={pidiendo}>
              <Icon name="bell" size={20} /> Sí, activar avisos
            </button>
            <button type="button" className="btn btn--ghost btn--lg btn--block" onClick={terminar}>Ahora no</button>
          </>
        )}
      </footer>
    </div>
  );
}

function Opcion({ icono, titulo, sub, on, onClick, flip }: {
  icono: IconName; titulo: string; sub: string; on: boolean; onClick: () => void; flip?: boolean;
}) {
  return (
    <button type="button" className={`onb__opt${on ? ' is-on' : ''}`} onClick={onClick} aria-pressed={on}>
      <span className="onb__opt-icon" style={flip ? { transform: 'scaleX(-1)' } : undefined}><Icon name={icono} size={20} /></span>
      <span className="onb__opt-txt"><b>{titulo}</b><small>{sub}</small></span>
      <span className="onb__radio" aria-hidden>{on && <Icon name="check" size={14} stroke={3} />}</span>
    </button>
  );
}
