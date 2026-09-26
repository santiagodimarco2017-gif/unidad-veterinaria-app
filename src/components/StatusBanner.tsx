// Aviso único en Inicio: aparece SOLO cuando hay algo para saber (paro, cambio de horario, feriado).
import type { Alerta, Feriado } from '../lib/types';
import { fechaISO } from '../lib/schedule';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { desdeISO, etiquetaDia, sumarDias } from '../state/util';

export type Estado =
  | { tipo: 'paro'; alerta: Alerta }
  | { tipo: 'feriado'; feriado: Feriado; cuando: string }
  | { tipo: 'cambio' };

/** Paros y cambios de horario de las últimas 72 h (insignia de la pestaña Más). */
export function avisosRecientes(alertas: Alerta[], ahora: Date): number {
  return alertas.filter((a) =>
    (a.tipo === 'paro' || a.tipo === 'cambio_horario') && ahora.getTime() - new Date(a.fecha).getTime() < 72 * 3600_000,
  ).length;
}

const fmtDiaSemana = new Intl.DateTimeFormat('es-AR', { weekday: 'long' });

/** Devuelve el aviso más importante para hoy, o null si no hay nada que avisar. */
export function calcularEstado(opts: {
  alertas: Alerta[];
  feriados: Feriado[];
  hayCambios: boolean;
  ahora: Date;
}): Estado | null {
  const { ahora } = opts;
  const paro = opts.alertas
    .filter((a) => a.tipo === 'paro' && ahora.getTime() - new Date(a.fecha).getTime() < 48 * 3600_000)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  if (paro) return { tipo: 'paro', alerta: paro };

  // Feriado hoy o en los próximos 2 días
  const hoy = fechaISO(ahora);
  const limite = fechaISO(sumarDias(ahora, 2));
  const fer = opts.feriados
    .filter((f) => f.fecha >= hoy && f.fecha <= limite)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
  if (fer) {
    const d = desdeISO(fer.fecha);
    const et = etiquetaDia(d, ahora);
    const cuando = et === 'Hoy' || et === 'Mañana' ? et.toLowerCase() : `el ${fmtDiaSemana.format(d)}`;
    return { tipo: 'feriado', feriado: fer, cuando };
  }

  const cambioReciente = opts.alertas.some((a) =>
    a.tipo === 'cambio_horario' && ahora.getTime() - new Date(a.fecha).getTime() < 7 * 86_400_000);
  if (opts.hayCambios || cambioReciente) return { tipo: 'cambio' };
  return null;
}

export function StatusBanner({ estado, onClick }: { estado: Estado | null; onClick: () => void }) {
  if (!estado) return null;
  let clase = 'info';
  let icono: IconName = 'info';
  let titulo = '';
  let sub = '';
  switch (estado.tipo) {
    case 'paro':
      clase = 'danger'; icono = 'bolt'; titulo = 'Posible paro de colectivos'; sub = estado.alerta.titulo;
      break;
    case 'feriado':
      clase = 'info'; icono = 'flag';
      titulo = estado.cuando === 'hoy' ? 'Hoy es feriado' : `Feriado ${estado.cuando}`;
      sub = `${estado.feriado.nombre} · rige horario de feriados`;
      break;
    case 'cambio':
      clase = 'warn'; icono = 'refresh'; titulo = 'Cambiaron los horarios'; sub = 'Tocá para ver el aviso';
      break;
  }
  return (
    <button type="button" onClick={onClick} className={`status status--${clase}`}>
      <span className="status__icon"><Icon name={icono} size={18} stroke={2.3} /></span>
      <span className="status__txt">
        <b>{titulo}</b>
        {sub && <span>{sub}</span>}
      </span>
      <span className="status__more">Ver <Icon name="chevronRight" size={16} /></span>
    </button>
  );
}
