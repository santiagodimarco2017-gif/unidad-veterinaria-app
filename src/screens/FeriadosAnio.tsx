import { useMemo } from 'react';
import type { Feriado } from '../lib/types';
import { fechaISO, serviciosDelDia } from '../lib/schedule';
import { useApp } from '../state/AppState';
import { Page } from '../components/Page';
import { desdeISO, diaCorto, nombreMes } from '../state/util';

export function FeriadosAnio() {
  const { feriados, visibles, ahora } = useApp();
  const anio = ahora.getFullYear();
  const hoyISO = fechaISO(ahora);

  const porMes = useMemo(() => {
    const m = new Map<number, Feriado[]>();
    for (const f of [...feriados].filter((f) => f.fecha.startsWith(String(anio))).sort((a, b) => a.fecha.localeCompare(b.fecha))) {
      const mes = Number(f.fecha.slice(5, 7)) - 1;
      m.set(mes, [...(m.get(mes) ?? []), f]);
    }
    return [...m.entries()];
  }, [feriados, anio]);

  const proximo = feriados.filter((f) => f.fecha >= hoyISO).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

  return (
    <Page titulo={`Feriados ${anio}`}>
      <div className="screen">
        <p className="lead">En feriado rige el horario de feriados: solo corren los servicios marcados para esos días.</p>
        {porMes.length === 0 && <p className="muted">No hay feriados cargados para este año.</p>}
        {porMes.map(([mes, lista]) => (
          <section className="section" key={mes}>
            <div className="section__head"><h2>{nombreMes(new Date(anio, mes, 1))}</h2></div>
            <div className="card-list">
              {lista.map((f) => {
                const d = desdeISO(f.fecha);
                const pasado = f.fecha < hoyISO;
                const n = serviciosDelDia(visibles, 'CR', d, feriados).length + serviciosDelDia(visibles, 'RC', d, feriados).length;
                return (
                  <div key={f.fecha} className={`feriado-row card${pasado ? ' is-past' : ''}${proximo?.fecha === f.fecha ? ' is-next' : ''}`}>
                    <span className="feriado-row__cal">
                      <small>{diaCorto(d).split(' ')[0]}</small>
                      <b className="tnum">{d.getDate()}</b>
                    </span>
                    <span className="feriado-row__txt">
                      <b>{f.nombre}</b>
                      <span className="muted">{f.tipo ? f.tipo[0].toUpperCase() + f.tipo.slice(1) : ''}{proximo?.fecha === f.fecha ? ' · Próximo' : ''}</span>
                      <span className="feriado-row__svc"><b className="tnum">{n}</b> servicios ese día (ambos sentidos)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
}
