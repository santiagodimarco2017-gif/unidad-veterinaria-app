// Tarjeta héroe: cuenta regresiva grande al próximo colectivo.
import type { Salida } from '../lib/types';
import type { Clima } from '../state/AppState';
import { formatearDuracion } from '../lib/schedule';
import { EmpresaChip, nombreEmpresa } from './EmpresaChip';
import { Icon, iconoClima } from './Icon';
import { Skeleton } from './controles';
import { MarcaDeAgua } from './AppLogo';
import { etiquetaDia, hhmm } from '../state/util';

function partesEspera(min: number): { valor: string; unidad: string } {
  if (min < 1) return { valor: 'Ya', unidad: 'sale' };
  if (min < 60) return { valor: String(min), unidad: 'min' };
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h >= 24) return { valor: String(Math.round(h / 24)), unidad: h >= 48 ? 'días' : 'día' };
  return { valor: m ? `${h}:${String(m).padStart(2, '0')}` : String(h), unidad: 'h' };
}

export function HeroCard({ salida, ahora, onClick, favorito, clima, destino }: {
  salida: Salida | null;
  ahora: Date;
  onClick: () => void;
  favorito: boolean;
  clima?: Clima | null;
  destino?: string;
}) {
  if (!salida) {
    return (
      <div className="hero hero--vacio">
        <MarcaDeAgua className="hero__marca" />
        <Icon name="moon" size={30} />
        <p className="hero__vacio-t">No hay más colectivos por ahora</p>
        <p className="hero__vacio-s">No encontramos salidas en los próximos días. Mirá Horarios o los avisos en Más.</p>
      </div>
    );
  }
  const min = Math.max(0, Math.ceil((salida.salida.getTime() - ahora.getTime()) / 60_000));
  const { valor, unidad } = partesEspera(min);
  const dia = etiquetaDia(salida.salida, ahora);
  const s = salida.servicio;
  const urgente = min <= 5;
  const h = ahora.getHours();

  return (
    <button
      type="button"
      className={`hero${urgente ? ' is-urgent' : ''}`}
      onClick={onClick}
      aria-label={`Próximo colectivo: sale ${dia.toLowerCase()} a las ${s.sale}, en ${formatearDuracion(min)}. Llega ${hhmm(salida.llegada)}. ${nombreEmpresa(s.empresa)}. Tocá para ver el detalle.`}
    >
      <MarcaDeAgua className="hero__marca" />
      <span className="hero__top">
        <span className="hero__kicker">
          <span className="live-dot" aria-hidden />
          Próximo colectivo{dia !== 'Hoy' ? ` · ${dia}` : ''}
        </span>
        {favorito && <Icon name="star" size={18} fill className="hero__fav" />}
      </span>

      <span className="hero__count" aria-hidden>
        {min >= 1 && <span className="hero__sale-en">sale en</span>}
        <span className="hero__num tnum" key={valor}>{valor}</span>
        <span className="hero__unit">{unidad}</span>
      </span>

      <span className="hero__times tnum" aria-hidden>
        <span className="hero__t">
          <small>Sale</small>
          <b>{hhmm(salida.salida)}</b>
        </span>
        <span className="hero__route">
          <span className="hero__route-line" />
          <Icon name="bus" size={18} />
          <span className="hero__route-line" />
        </span>
        <span className="hero__t hero__t--end">
          <small>Llega</small>
          <b>{hhmm(salida.llegada)}</b>
        </span>
      </span>

      <span className="hero__foot" aria-hidden>
        <EmpresaChip empresa={s.empresa} variante="solido" />
        <span className="hero__meta">
          {formatearDuracion(salida.duracionMin)} de viaje
        </span>
        {clima && destino && (
          <span className="hero__clima" title={clima.descripcion}>
            <Icon name={iconoClima(clima.codigo, h < 7 || h >= 20)} size={16} />
            <span className="tnum">{clima.tempC}°</span>
          </span>
        )}
      </span>
      {clima?.lluviaProxHoras && destino && (
        <span className="hero__lluvia"><Icon name="rain" size={15} /> Puede llover en {destino}: llevá paraguas</span>
      )}
    </button>
  );
}

export function HeroSkeleton() {
  return (
    <div className="hero hero--skeleton" aria-busy="true">
      <Skeleton alto={14} ancho="45%" />
      <Skeleton alto={72} ancho="60%" radio={16} className="sep-16" />
      <Skeleton alto={40} className="sep-16" radio={12} />
    </div>
  );
}
