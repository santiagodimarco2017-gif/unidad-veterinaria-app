// Contenedor desplazable con gesto "tirar para actualizar".
import { useRef, useState } from 'react';
import type { ReactNode, TouchEvent as RTouchEvent } from 'react';
import { Icon } from './Icon';
import { haptic } from '../state/nativo';

const UMBRAL = 72;

export function PullToRefresh({ onRefresh, cargando, children, className = '' }: {
  onRefresh: () => void | Promise<void>;
  cargando: boolean;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inicio = useRef<number | null>(null);
  const [tiro, setTiro] = useState(0);
  const disparo = useRef(false);

  const start = (e: RTouchEvent) => {
    if ((ref.current?.scrollTop ?? 0) <= 0) inicio.current = e.touches[0].clientY;
  };
  const move = (e: RTouchEvent) => {
    if (inicio.current == null) return;
    const d = e.touches[0].clientY - inicio.current;
    if (d <= 0) { setTiro(0); return; }
    const t = Math.min(120, d * 0.5);
    if (t >= UMBRAL && !disparo.current) { disparo.current = true; haptic('medio'); }
    if (t < UMBRAL) disparo.current = false;
    setTiro(t);
  };
  const end = () => {
    if (inicio.current == null) return;
    inicio.current = null;
    if (tiro >= UMBRAL && !cargando) void onRefresh();
    disparo.current = false;
    setTiro(0);
  };

  const visible = cargando ? 1 : Math.min(1, tiro / UMBRAL);
  return (
    <div
      ref={ref}
      className={`screen-scroll ptr ${className}`}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
      onTouchCancel={end}
    >
      <div
        className={`ptr__ind${cargando ? ' is-loading' : ''}`}
        style={{ opacity: visible, transform: `translateY(${cargando ? 14 : tiro * 0.5}px) rotate(${tiro * 3}deg)` }}
        aria-hidden
      >
        <Icon name="refresh" size={18} />
      </div>
      <div className="ptr__content" style={tiro ? { transform: `translateY(${tiro}px)`, transition: 'none' } : undefined}>
        {children}
      </div>
    </div>
  );
}
