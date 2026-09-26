// Hoja inferior modal con arrastre para cerrar.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode, PointerEvent as RPointerEvent } from 'react';
import { Icon } from './Icon';

const DURACION = 240;

export function Sheet({ onCerrar, children, etiqueta }: { onCerrar: () => void; children: ReactNode; etiqueta: string }) {
  const [saliendo, setSaliendo] = useState(false);
  const [dy, setDy] = useState(0);
  const inicio = useRef<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);

  const cerrar = useCallback(() => {
    setSaliendo(true);
    window.setTimeout(onCerrar, DURACION);
  }, [onCerrar]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', key);
    panel.current?.focus();
    return () => window.removeEventListener('keydown', key);
  }, [cerrar]);

  const down = (e: RPointerEvent) => {
    inicio.current = e.clientY;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const move = (e: RPointerEvent) => {
    if (inicio.current == null) return;
    setDy(Math.max(0, e.clientY - inicio.current));
  };
  const up = () => {
    if (inicio.current == null) return;
    inicio.current = null;
    if (dy > 110) cerrar();
    setDy(0);
  };

  return (
    <div className={`sheet-root${saliendo ? ' is-leaving' : ''}`}>
      <div className="sheet-backdrop" onClick={cerrar} />
      <div
        ref={panel}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        tabIndex={-1}
        style={dy ? { transform: `translateY(${dy}px)`, transition: 'none' } : undefined}
      >
        <div className="sheet__grip" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <span />
        </div>
        <button type="button" className="icon-btn sheet__close" onClick={cerrar} aria-label="Cerrar">
          <Icon name="close" size={18} />
        </button>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  );
}
