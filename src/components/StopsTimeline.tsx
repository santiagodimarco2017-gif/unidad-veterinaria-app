import type { Parada } from '../lib/types';
import { horaAMinutos } from '../lib/schedule';

/** Línea vertical de paradas con puntos y horarios. `pasadas` = minutos del día ya transcurridos (solo si hoy). */
export function StopsTimeline({ paradas, color, minutoActual }: { paradas: Parada[]; color: string; minutoActual?: number | null }) {
  return (
    <ol className="stops" style={{ ['--acc' as string]: color }}>
      {paradas.map((p, i) => {
        const extremo = i === 0 || i === paradas.length - 1;
        const pasada = minutoActual != null && horaAMinutos(p.hora) < minutoActual;
        return (
          <li key={`${p.nombre}-${i}`} className={`stops__item${extremo ? ' is-end' : ''}${pasada ? ' is-past' : ''}`}>
            <span className="stops__dot" aria-hidden />
            <span className="stops__name">{p.nombre}</span>
            <span className="stops__time tnum">{p.hora}</span>
          </li>
        );
      })}
    </ol>
  );
}
