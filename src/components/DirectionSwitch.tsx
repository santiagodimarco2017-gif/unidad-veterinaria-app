// Selector de sentido: dos botones grandes, el elegido bien marcado (relleno verde + tilde).
import type { Direccion } from '../lib/types';
import { Icon } from './Icon';
import { haptic } from '../state/nativo';

const OPCIONES: { valor: Direccion; desde: string; hacia: string }[] = [
  { valor: 'CR', desde: 'Casilda', hacia: 'Rosario' },
  { valor: 'RC', desde: 'Rosario', hacia: 'Casilda' },
];

export function DirectionSwitch({ direccion, onChange }: { direccion: Direccion; onChange: (d: Direccion) => void }) {
  return (
    <div className="dirpick" role="radiogroup" aria-label="¿Para dónde vas?">
      {OPCIONES.map((o) => {
        const on = o.valor === direccion;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={on}
            className={`dirpick__opt${on ? ' is-on' : ''}`}
            onClick={() => { if (!on) { haptic('medio'); onChange(o.valor); } }}
          >
            <span className="dirpick__check" aria-hidden>{on && <Icon name="check" size={14} stroke={3} />}</span>
            <span className="dirpick__txt">
              {o.desde} <span aria-label="a">→</span> {o.hacia}
            </span>
          </button>
        );
      })}
    </div>
  );
}
