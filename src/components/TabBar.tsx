import { Icon } from './Icon';
import type { IconName } from './Icon';
import { useNav } from '../state/Nav';
import { TABS_COLECTIVOS } from '../state/util';
import type { Tab } from '../state/Nav';
import { PLAN_CORTO } from '../carrera/plan';
import { useApp } from '../state/AppState';
import { avisosRecientes } from './StatusBanner';

/** Horarios y Favoritos se abren desde Colectivos y la marcan como activa */
const TABS: { id: Tab; etiqueta: string; icono: IconName }[] = [
  { id: 'inicio', etiqueta: 'Inicio', icono: 'home' },
  { id: 'colectivos', etiqueta: 'Colectivos', icono: 'bus' },
  { id: 'carrera', etiqueta: PLAN_CORTO, icono: 'graduationCap' },
  { id: 'mails', etiqueta: 'Mails', icono: 'mail' },
  { id: 'mas', etiqueta: 'Más', icono: 'grid' },
];

export function TabBar() {
  const { tab, pila, irA } = useNav();
  const { alertas, ahora } = useApp();
  const recientes = avisosRecientes(alertas, ahora);

  return (
    <nav className="tabbar" aria-label="Secciones">
      {TABS.map((t) => {
        const on = tab === t.id || (t.id === 'colectivos' && TABS_COLECTIVOS.includes(tab));
        const activo = on && pila.length === 0;
        const badge = t.id === 'mas' && recientes > 0;
        return (
          <button
            key={t.id}
            type="button"
            className={`tabbar__btn${on ? ' is-on' : ''}`}
            aria-current={activo ? 'page' : undefined}
            aria-label={badge ? `${t.etiqueta} (${recientes} aviso${recientes > 1 ? 's' : ''} nuevo${recientes > 1 ? 's' : ''})` : t.id === 'carrera' ? 'Plan de Estudio' : undefined}
            onClick={() => irA(t.id)}
          >
            <span className="tabbar__icon">
              <Icon name={t.icono} size={24} stroke={on ? 2.2 : 1.9} />
              {badge && <span className="tabbar__badge" aria-hidden>{recientes}</span>}
            </span>
            <span className="tabbar__label">{t.etiqueta}</span>
          </button>
        );
      })}
    </nav>
  );
}
