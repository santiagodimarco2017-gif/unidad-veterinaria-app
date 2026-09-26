// Controles básicos: segmentado, interruptor, chip, fila de lista, skeleton.
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { haptic } from '../state/nativo';

interface SegOpcion<T extends string> { valor: T; etiqueta: ReactNode }

export function Segmented<T extends string>({ opciones, valor, onChange, etiqueta, compacto }: {
  opciones: SegOpcion<T>[];
  valor: T;
  onChange: (v: T) => void;
  etiqueta?: string;
  compacto?: boolean;
}) {
  const i = Math.max(0, opciones.findIndex((o) => o.valor === valor));
  return (
    <div
      className={`segmented${compacto ? ' segmented--compacto' : ''}`}
      role="radiogroup"
      aria-label={etiqueta}
      style={{ ['--n' as string]: opciones.length, ['--i' as string]: i }}
    >
      <span className="segmented__thumb" aria-hidden />
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={o.valor === valor}
          className={`segmented__opt${o.valor === valor ? ' is-on' : ''}`}
          onClick={() => { if (o.valor !== valor) { haptic(); onChange(o.valor); } }}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, etiqueta }: { on: boolean; onChange: (v: boolean) => void; etiqueta: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={etiqueta}
      className={`toggle${on ? ' is-on' : ''}`}
      onClick={() => { haptic(); onChange(!on); }}
    >
      <span className="toggle__knob" />
    </button>
  );
}

export function Chip({ activo, onClick, children, color, icono }: {
  activo?: boolean;
  onClick?: () => void;
  children: ReactNode;
  color?: string;
  icono?: IconName;
}) {
  return (
    <button
      type="button"
      className={`chip${activo ? ' is-on' : ''}`}
      aria-pressed={activo}
      onClick={() => { haptic(); onClick?.(); }}
      style={color ? { ['--chip-color' as string]: color } : undefined}
    >
      {color && <span className="chip__dot" aria-hidden />}
      {icono && <Icon name={icono} size={16} />}
      {children}
    </button>
  );
}

export function Fila({ icono, colorIcono, titulo, subtitulo, derecha, onClick, href, chevron = true }: {
  icono?: IconName;
  colorIcono?: string;
  titulo: ReactNode;
  subtitulo?: ReactNode;
  derecha?: ReactNode;
  onClick?: () => void;
  href?: string;
  chevron?: boolean;
}) {
  const contenido = (
    <>
      {icono && (
        <span className="fila__icono" style={colorIcono ? { background: colorIcono } : undefined}>
          <Icon name={icono} size={18} />
        </span>
      )}
      <span className="fila__texto">
        <span className="fila__titulo">{titulo}</span>
        {subtitulo && <span className="fila__sub">{subtitulo}</span>}
      </span>
      {derecha && <span className="fila__derecha">{derecha}</span>}
      {chevron && (onClick || href) && <Icon name="chevronRight" size={18} className="fila__chevron" />}
    </>
  );
  if (href) {
    return <a className="fila" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{contenido}</a>;
  }
  if (onClick) {
    return <button type="button" className="fila" onClick={() => { haptic(); onClick(); }}>{contenido}</button>;
  }
  return <div className="fila">{contenido}</div>;
}

export function Grupo({ titulo, children, pie }: { titulo?: ReactNode; children: ReactNode; pie?: ReactNode }) {
  return (
    <section className="grupo">
      {titulo && <h3 className="grupo__titulo">{titulo}</h3>}
      <div className="grupo__caja">{children}</div>
      {pie && <p className="grupo__pie">{pie}</p>}
    </section>
  );
}

export function Skeleton({ alto = 16, ancho = '100%', radio = 8, className = '' }: {
  alto?: number | string; ancho?: number | string; radio?: number; className?: string;
}) {
  return <span className={`skeleton ${className}`} style={{ height: alto, width: ancho, borderRadius: radio }} aria-hidden />;
}

export function Spinner({ size = 18 }: { size?: number }) {
  return <span className="spinner" style={{ width: size, height: size }} aria-label="Cargando" role="status" />;
}
