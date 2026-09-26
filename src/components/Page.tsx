// Página apilada (entra desde la derecha) con barra superior y botón volver.
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { useNav } from '../state/Nav';

export function Page({ titulo, children, accion }: { titulo: string; children: ReactNode; accion?: ReactNode }) {
  const { volver } = useNav();
  return (
    <div className="page" role="region" aria-label={titulo}>
      <header className="page__bar">
        <button type="button" className="page__back" onClick={volver}>
          <Icon name="chevronLeft" size={22} />
          <span>Volver</span>
        </button>
        <h1 className="page__title">{titulo}</h1>
        <div className="page__accion">{accion}</div>
      </header>
      <div className="page__body screen-scroll">{children}</div>
    </div>
  );
}

/** Encabezado grande de pestaña, estilo iOS */
export function ScreenHeader({ titulo, sub, accion }: { titulo: string; sub?: ReactNode; accion?: ReactNode }) {
  return (
    <header className="screen-header">
      <div>
        {sub && <p className="screen-header__sub">{sub}</p>}
        <h1 className="screen-header__title">{titulo}</h1>
      </div>
      {accion && <div className="screen-header__accion">{accion}</div>}
    </header>
  );
}
