import type { Servicio } from '../lib/types';
import { formatearDuracion, horaAMinutos } from '../lib/schedule';
import { EmpresaChip, colorEmpresa } from './EmpresaChip';
import { Icon } from './Icon';

export function duracionServicio(s: Servicio): number {
  const d = horaAMinutos(s.llega) - horaAMinutos(s.sale);
  return d < 0 ? d + 24 * 60 : d;
}

/** "12 min", "1 h 5", "ahora" — versión compacta para insignias */
export function esperaCorta(min: number): string {
  if (min < 1) return 'ahora';
  if (min < 60) return `${Math.floor(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  return m ? `${h} h ${m}` : `${h} h`;
}

interface Props {
  servicio: Servicio;
  minutos?: number | null;
  etiquetaDia?: string;
  pasado?: boolean;
  favorito?: boolean;
  onClick: () => void;
  indice?: number;
}

export function DepartureRow({ servicio, minutos, etiquetaDia, pasado, favorito, onClick, indice = 0 }: Props) {
  const pronto = minutos != null && minutos >= 0 && minutos <= 15;
  return (
    <button
      type="button"
      className={`dep${pasado ? ' is-past' : ''}`}
      onClick={onClick}
      style={{ ['--acc' as string]: colorEmpresa(servicio.empresa), ['--i' as string]: indice }}
    >
      <span className="dep__bar" aria-hidden />
      <span className="dep__horas">
        <span className="dep__sale tnum">{servicio.sale}</span>
        <span className="dep__llega">llega <span className="tnum">{servicio.llega}</span></span>
      </span>
      <span className="dep__info">
        <span className="dep__top">
          <EmpresaChip empresa={servicio.empresa} />
          {favorito && <Icon name="star" size={14} fill className="dep__fav" title="Favorito" />}
        </span>
        <span className="dep__meta">
          {formatearDuracion(duracionServicio(servicio))} de viaje
        </span>
      </span>
      <span className="dep__right">
        {minutos != null && minutos >= -1 ? (
          <span className={`dep__wait tnum${pronto ? ' is-soon' : ''}`}>
            {etiquetaDia && etiquetaDia !== 'Hoy' ? etiquetaDia : esperaCorta(minutos)}
          </span>
        ) : (
          <Icon name="chevronRight" size={18} className="dep__chev" />
        )}
      </span>
    </button>
  );
}
