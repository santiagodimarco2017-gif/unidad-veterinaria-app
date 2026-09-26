// Selector de día: Hoy · Mañana · Elegir fecha (input nativo).
import { Icon } from './Icon';
import { diaCorto, mismoDia, sumarDias } from '../state/util';
import { fechaISO } from '../lib/schedule';
import { haptic } from '../state/nativo';

export function DaySelector({ fecha, hoy, onChange }: { fecha: Date; hoy: Date; onChange: (d: Date) => void }) {
  const manana = sumarDias(hoy, 1);
  const esHoy = mismoDia(fecha, hoy);
  const esManana = mismoDia(fecha, manana);
  const otra = !esHoy && !esManana;
  const elegir = (d: Date) => { haptic(); onChange(d); };
  return (
    <div className="dayseg" role="group" aria-label="Día">
      <button type="button" className={`dayseg__opt${esHoy ? ' is-on' : ''}`} aria-pressed={esHoy} onClick={() => elegir(sumarDias(hoy, 0))}>
        Hoy
      </button>
      <button type="button" className={`dayseg__opt${esManana ? ' is-on' : ''}`} aria-pressed={esManana} onClick={() => elegir(manana)}>
        Mañana
      </button>
      <label className={`dayseg__opt dayseg__opt--date${otra ? ' is-on' : ''}`}>
        <Icon name="calendar" size={16} />
        <span>{otra ? diaCorto(fecha) : 'Elegir fecha'}</span>
        <input
          type="date"
          value={fechaISO(fecha)}
          aria-label="Elegir fecha"
          onClick={(e) => {
            haptic();
            try { (e.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.(); } catch { /* sin showPicker */ }
          }}
          onChange={(e) => {
            const v = e.target.value;
            if (!v) return;
            const [y, m, d] = v.split('-').map(Number);
            onChange(new Date(y, m - 1, d));
          }}
        />
      </label>
    </div>
  );
}
