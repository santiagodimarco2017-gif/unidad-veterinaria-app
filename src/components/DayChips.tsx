import type { DiaKey, DiasServicio } from '../lib/types';
import { DIAS, DIA_CORTO, DIA_LETRA } from '../state/util';
import { haptic } from '../state/nativo';

/** Chips L M M J V S D + Feriados (solo lectura) */
export function DayChips({ dias, hoy }: { dias: DiasServicio; hoy?: DiaKey }) {
  return (
    <div className="daychips" role="list" aria-label="Días en que corre">
      {DIAS.map((d) => (
        <span
          key={d}
          role="listitem"
          className={`daychip${dias[d] ? ' is-on' : ''}${hoy === d ? ' is-today' : ''}`}
          aria-label={`${DIA_CORTO[d]}: ${dias[d] ? 'corre' : 'no corre'}`}
        >
          {DIA_LETRA[d]}
        </span>
      ))}
      <span
        role="listitem"
        className={`daychip daychip--fer${dias.feriados ? ' is-on' : ''}`}
        aria-label={`Feriados: ${dias.feriados ? 'corre' : 'no corre'}`}
      >
        Feriados
      </span>
    </div>
  );
}

/** Selector de días (para recordatorios) */
export function DayPicker({ valor, habilitados, onChange }: {
  valor: DiaKey[];
  habilitados: DiasServicio;
  onChange: (v: DiaKey[]) => void;
}) {
  return (
    <div className="daychips daychips--pick" role="group" aria-label="Días de aviso">
      {DIAS.map((d) => {
        const on = valor.includes(d);
        const ok = habilitados[d];
        return (
          <button
            type="button"
            key={d}
            disabled={!ok}
            aria-pressed={on}
            aria-label={DIA_CORTO[d]}
            className={`daychip${on && ok ? ' is-on' : ''}`}
            onClick={() => { haptic(); onChange(on ? valor.filter((x) => x !== d) : DIAS.filter((x) => x === d || valor.includes(x))); }}
          >
            {DIA_LETRA[d]}
          </button>
        );
      })}
    </div>
  );
}
