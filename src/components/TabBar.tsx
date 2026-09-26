import { Icon } from './Icon';
import type { IconName } from './Icon';
import { useNav } from '../state/Nav';
import type { Tab } from '../state/Nav';
import { useApp } from '../state/AppState';
import { avisosRecientes } from './StatusBanner';

const TABS: { id: Tab; etiqueta: string; icono: IconName }[] = [
  { id: 'inicio', etiqueta: 'Inicio', icono: 'home' },
  { id: 'horarios', etiqueta: 'Horarios', icono: 'clock' },
  { id: 'favoritos', etiqueta: 'Favoritos', icono: 'star' },
  { id: 'carrera', etiqueta: 'Carrera', icono: 'graduationCap' },
  { id: 'mas', etiqueta: 'Más', icono: 'grid' },
];

export function TabBar() {
  const { tab, pila, irA } = useNav();
  const { alertas, ahora } = useApp();
  const recientes = avisosRecientes(alertas, ahora);

  return (
    <nav className="tabbar" aria-label="Secciones">
      {TABS.map((t) => {
        const on = tab === t.id;
        const activo = on && pila.length === 0;
        const badge = t.id === 'mas' && recientes > 0;
        return (
          <button
            key={t.id}
            type="button"
            className={`tabbar__btn${on ? ' is-on' : ''}`}
            aria-current={activo ? 'page' : undefined}
            aria-label={badge ? `${t.etiqueta} (${recientes} aviso${recientes > 1 ? 's' : ''} nuevo${recientes > 1 ? 's' : ''})` : undefined}
            onClick={() => irA(t.id)}
          >
            <span className="tabbar__icon">
              <Icon name={t.icono} size={24} stroke={on ? 2.2 : 1.9} fill={on && t.id === 'favoritos'} />
              {badge && <span className="tabbar__badge" aria-hidden>{recientes}</span>}
            </span>
            <span className="tabbar__label">{t.etiqueta}</span>
          </button>
        );
      })}
    </nav>
  );
}
