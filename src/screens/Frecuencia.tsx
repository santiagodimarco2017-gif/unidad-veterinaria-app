// Vista "Gráfico" de Horarios: salidas por hora del día elegido + comparación (plegada).
import { useMemo } from 'react';
import type { Direccion, Feriado, ResumenDia, Servicio, TipoDia } from '../lib/types';
import { resumenDia, tipoDeDia } from '../lib/schedule';
import { FrecuenciaChart } from '../components/FrecuenciaChart';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { diaCorto, mismoDia, sumarDias } from '../state/util';

function proximoDe(tipos: TipoDia[], desde: Date, feriados: Feriado[]): Date {
  for (let i = 0; i < 21; i++) {
    const d = sumarDias(desde, i);
    if (tipos.includes(tipoDeDia(d, feriados))) return d;
  }
  return desde;
}

function horaPico(r: ResumenDia): { hora: number; n: number } | null {
  let mejor = -1;
  let n = 0;
  r.porHora.forEach((c, h) => { if (c > n) { n = c; mejor = h; } });
  return mejor < 0 ? null : { hora: mejor, n };
}

export function FrecuenciaVista({ servicios, direccion, fecha, ahora, feriados }: {
  servicios: Servicio[];
  direccion: Direccion;
  fecha: Date;
  ahora: Date;
  feriados: Feriado[];
}) {
  const hoy = sumarDias(ahora, 0);
  const r = useMemo(() => resumenDia(servicios, direccion, fecha, feriados), [servicios, direccion, fecha, feriados]);
  const pico = horaPico(r);
  const esHoy = mismoDia(fecha, ahora);

  const comparacion = useMemo(() => {
    const grupos: { etiqueta: string; tipos: TipoDia[] }[] = [
      { etiqueta: 'Día hábil', tipos: ['habil'] },
      { etiqueta: 'Sábado', tipos: ['sabado'] },
      { etiqueta: 'Domingo y feriado', tipos: ['domingo', 'feriado'] },
    ];
    const filas = grupos.map((g) => {
      const d = proximoDe(g.tipos, hoy, feriados);
      return { ...g, fecha: d, resumen: resumenDia(servicios, direccion, d, feriados) };
    });
    const max = Math.max(1, ...filas.flatMap((f) => f.resumen.porHora));
    return { filas, max };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicios, direccion, feriados, hoy.getTime()]);

  return (
    <div className="frec">
      <div className="card chart-card">
        <div className="chart-card__head">
          <span>Salidas por hora</span>
          <b className="tnum">{r.cantidad} en el día</b>
        </div>
        <FrecuenciaChart porHora={r.porHora} horaActual={esHoy ? ahora.getHours() : null} etiqueta="Salidas por hora" />
      </div>

      <div className="stats">
        <Stat icono="sun" titulo="Primer colectivo" valor={r.primero ?? '—'} />
        <Stat icono="moon" titulo="Último colectivo" valor={r.ultimo ?? '—'} />
        <Stat icono="clock" titulo="Pasa cada" valor={r.frecuenciaPromedioMin != null ? `~${r.frecuenciaPromedioMin} min` : '—'} sub="en promedio" />
        <Stat icono="chart" titulo="Hora con más salidas" valor={pico ? `${String(pico.hora).padStart(2, '0')} h` : '—'} sub={pico ? `${pico.n} salidas` : undefined} />
      </div>

      <details className="plegable">
        <summary>
          <span>Comparar día hábil, sábado y domingo</span>
          <Icon name="chevronDown" size={18} />
        </summary>
        <div className="compare">
          {comparacion.filas.map((f) => (
            <div className="card compare__row" key={f.etiqueta}>
              <div className="compare__head">
                <b>{f.etiqueta}</b>
                <span className="muted tnum">{f.resumen.cantidad} salidas · {f.resumen.primero ?? '—'} a {f.resumen.ultimo ?? '—'}</span>
              </div>
              <FrecuenciaChart porHora={f.resumen.porHora} max={comparacion.max} alto={70} compacto etiqueta={`Salidas por hora, ${f.etiqueta}`} />
              <div className="compare__foot muted">
                <span>Ej.: {diaCorto(f.fecha)}</span>
                <span className="tnum">{f.resumen.frecuenciaPromedioMin != null ? `cada ~${f.resumen.frecuenciaPromedioMin} min` : ''}</span>
              </div>
            </div>
          ))}
          <div className="compare__axis tnum" aria-hidden><span>0 h</span><span>6</span><span>12</span><span>18</span><span>23</span></div>
        </div>
      </details>
    </div>
  );
}

function Stat({ icono, titulo, valor, sub }: { icono: IconName; titulo: string; valor: string; sub?: string }) {
  return (
    <div className="stat card">
      <span className="stat__icon"><Icon name={icono} size={18} /></span>
      <span className="stat__t">{titulo}</span>
      <b className="stat__v tnum">{valor}</b>
      {sub && <span className="stat__s">{sub}</span>}
    </div>
  );
}
