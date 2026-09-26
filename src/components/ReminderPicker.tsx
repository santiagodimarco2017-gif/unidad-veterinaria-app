// Configuración de recordatorio: minutos antes + días.
import { useState } from 'react';
import type { DiaKey, Favorito, Servicio } from '../lib/types';
import { Chip } from './controles';
import { DayPicker } from './DayChips';
import { DIAS } from '../state/util';

export const OPCIONES_AVISO = [5, 10, 15, 20, 30];

export function ReminderPicker({ servicio, favorito, onGuardar, onCancelar }: {
  servicio: Servicio;
  favorito?: Favorito;
  onGuardar: (avisoMin: number | null, dias: DiaKey[]) => void;
  onCancelar: () => void;
}) {
  const diasServicio = DIAS.filter((d) => servicio.dias[d]);
  const [min, setMin] = useState<number | null>(favorito?.avisoMin ?? 10);
  const [dias, setDias] = useState<DiaKey[]>(() => {
    const previos = favorito?.diasAviso?.filter((d) => servicio.dias[d]) ?? [];
    return previos.length ? previos : diasServicio;
  });

  return (
    <div className="reminder">
      <p className="reminder__label">¿Cuánto antes te avisamos?</p>
      <div className="chips-row">
        {OPCIONES_AVISO.map((m) => (
          <Chip key={m} activo={min === m} onClick={() => setMin(m)}>{m} min</Chip>
        ))}
        <Chip activo={min === null} onClick={() => setMin(null)}>Sin aviso</Chip>
      </div>
      {min !== null && (
        <>
          <p className="reminder__label">¿Qué días?</p>
          <DayPicker valor={dias} habilitados={servicio.dias} onChange={setDias} />
          {diasServicio.length === 0 && <p className="hint">Este servicio solo corre en feriados.</p>}
        </>
      )}
      <div className="reminder__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancelar}>Cancelar</button>
        <button
          type="button"
          className="btn btn--primary"
          disabled={min !== null && dias.length === 0}
          onClick={() => onGuardar(min, dias)}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
