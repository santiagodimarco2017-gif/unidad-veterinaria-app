// Horarios: sentido + día arriba; Lista | Gráfico; filtro de empresas escondido detrás de "Filtrar".
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { Direccion, EmpresaId, Servicio, TipoDia } from '../lib/types';
import { buscarFeriado, fechaISO, horaAMinutos, serviciosDelDia, tipoDeDia } from '../lib/schedule';
import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import type { VistaHorarios } from '../state/Nav';
import { ScreenHeader } from '../components/Page';
import { Chip, Segmented } from '../components/controles';
import { DaySelector } from '../components/DaySelector';
import { DirectionSwitch } from '../components/DirectionSwitch';
import { DepartureRow } from '../components/DepartureRow';
import { colorEmpresa, nombreEmpresa } from '../components/EmpresaChip';
import { Icon } from '../components/Icon';
import { haptic } from '../state/nativo';
import { desdeISO, diaLargo, hhmm, mismoDia, sumarDias } from '../state/util';
import { FrecuenciaVista } from './Frecuencia';

const TIPO_TXT: Record<TipoDia, string> = {
  habil: 'Día hábil',
  sabado: 'Sábado',
  domingo: 'Domingo',
  feriado: 'Feriado',
};

export function Horarios() {
  const app = useApp();
  const nav = useNav();
  const { ahora, visibles, feriados } = app;
  const hoy = sumarDias(ahora, 0);
  const pedido = nav.horariosPedido;

  // Sentido: si se llegó con un sentido pedido (p. ej. desde "¿Cómo llego?"), se usa uno LOCAL
  // que no toca el sentido global; al salir de la pestaña se vuelve al del usuario.
  const [dirLocal, setDirLocal] = useState<Direccion | null>(pedido?.direccion ?? null);
  const direccion = dirLocal ?? app.direccion;
  const cambiarDireccion = (d: Direccion) => { if (dirLocal) setDirLocal(d); else app.setDireccion(d); };

  const [fecha, setFecha] = useState<Date>(() => (pedido?.fecha ? desdeISO(pedido.fecha) : hoy));
  const [vista, setVista] = useState<VistaHorarios>(pedido?.vista ?? 'lista');
  const [filtro, setFiltro] = useState<EmpresaId[]>([]);
  const [verFiltro, setVerFiltro] = useState(false);
  const destacar = pedido?.destacar && pedido.fecha === fechaISO(fecha) ? pedido.destacar : [];
  const destacadaRef = useRef<HTMLDivElement>(null);
  const ahoraRef = useRef<HTMLDivElement>(null);
  const esHoy = mismoDia(fecha, ahora);

  const delDia = useMemo(() => serviciosDelDia(visibles, direccion, fecha, feriados), [visibles, direccion, fecha, feriados]);
  const empresasDelDia = useMemo(() => [...new Set(delDia.map((s) => s.empresa))], [delDia]);
  const filtroActivo = filtro.filter((e) => empresasDelDia.includes(e));
  const lista = filtroActivo.length ? delDia.filter((s) => filtroActivo.includes(s.empresa)) : delDia;
  const serviciosGrafico = useMemo(
    () => (filtro.length ? visibles.filter((s) => filtro.includes(s.empresa)) : visibles),
    [visibles, filtro],
  );

  const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const grupos = useMemo(() => {
    const m = new Map<number, Servicio[]>();
    for (const s of lista) {
      const h = Math.floor(horaAMinutos(s.sale) / 60);
      m.set(h, [...(m.get(h) ?? []), s]);
    }
    return [...m.entries()];
  }, [lista]);
  const idxProximo = esHoy ? lista.findIndex((s) => horaAMinutos(s.sale) >= minAhora) : -1;
  const idProximo = idxProximo >= 0 ? lista[idxProximo].id : null;

  const feriado = buscarFeriado(fecha, feriados);
  const tipo = tipoDeDia(fecha, feriados);

  useEffect(() => {
    if (vista !== 'lista') return;
    if (destacadaRef.current) { destacadaRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    if (esHoy) ahoraRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esHoy, direccion, fechaISO(fecha), vista]);

  const alternar = (e: EmpresaId) => setFiltro((f) => (f.includes(e) ? f.filter((x) => x !== e) : [...f, e]));

  const fila = (s: Servicio, i: number) => {
    const min = horaAMinutos(s.sale) - minAhora;
    const pasado = esHoy && min < 0;
    return (
      <DepartureRow
        indice={Math.min(i, 8)}
        servicio={s}
        pasado={pasado}
        minutos={esHoy && !pasado && min <= 90 ? min : null}
        favorito={app.esFavorito(s.id)}
        onClick={() => nav.abrirDetalle(s.id, fechaISO(fecha))}
      />
    );
  };

  return (
    <div className="screen-scroll">
      <div className="screen">
        <ScreenHeader titulo="Horarios" sub={diaLargo(fecha)} />

        <div className="sticky-tools">
          <DirectionSwitch direccion={direccion} onChange={cambiarDireccion} />
          <DaySelector fecha={fecha} hoy={hoy} onChange={setFecha} />
        </div>

        <div className="toolbar">
          <Segmented<VistaHorarios>
            etiqueta="Ver como"
            valor={vista}
            onChange={setVista}
            opciones={[
              { valor: 'lista', etiqueta: <span className="seg-ico"><Icon name="list" size={18} /> Lista</span> },
              { valor: 'grafico', etiqueta: <span className="seg-ico"><Icon name="chart" size={18} /> Gráfico</span> },
            ]}
          />
          <button
            type="button"
            className={`filter-btn${verFiltro ? ' is-open' : ''}${filtro.length ? ' is-active' : ''}`}
            aria-expanded={verFiltro}
            onClick={() => { haptic(); setVerFiltro((v) => !v); }}
          >
            <Icon name="filter" size={18} />
            Filtrar
            {filtro.length > 0 && <span className="filter-btn__n" aria-label={`${filtro.length} empresas elegidas`}>{filtro.length}</span>}
          </button>
        </div>

        {verFiltro && (
          <div className="filter-panel">
            <p className="filter-panel__t">Mostrar solo estas empresas</p>
            <div className="chips-row">
              <Chip activo={!filtro.length} onClick={() => setFiltro([])}>Todas</Chip>
              {empresasDelDia.map((e) => (
                <Chip key={e} activo={filtro.includes(e)} color={colorEmpresa(e)} onClick={() => alternar(e)}>
                  {nombreEmpresa(e)}
                </Chip>
              ))}
            </div>
            <button type="button" className="btn btn--primary btn--block sep-12" onClick={() => setVerFiltro(false)}>Listo</button>
          </div>
        )}
        {!verFiltro && filtro.length > 0 && (
          <p className="filter-note">
            <Icon name="filter" size={15} /> Solo: {filtro.map(nombreEmpresa).join(', ')}
            <button type="button" className="link-btn" onClick={() => setFiltro([])}>Quitar filtro</button>
          </p>
        )}

        <p className={`day-line${tipo === 'feriado' ? ' is-feriado' : ''}`}>
          <Icon name={tipo === 'feriado' ? 'flag' : 'calendar'} size={16} />
          <span>
            <b>{TIPO_TXT[tipo]}{feriado ? `: ${feriado.nombre}` : ''}</b>
            {' · '}
            <span className="tnum">{lista.length} salidas{lista.length ? `, de ${lista[0].sale} a ${lista[lista.length - 1].sale}` : ''}</span>
          </span>
        </p>
        {feriado && <p className="hint">Rige horario de feriados: solo corren los servicios marcados para feriados.</p>}
        {destacar.length > 0 && vista === 'lista' && <p className="hint">Resaltados: los que te dejan en Casilda al menos 30 min antes de tu mesa.</p>}

        {vista === 'grafico' ? (
          <FrecuenciaVista servicios={serviciosGrafico} direccion={direccion} fecha={fecha} ahora={ahora} feriados={feriados} />
        ) : lista.length === 0 ? (
          <div className="empty">
            <Icon name="bus" size={40} />
            <p className="empty__t">No hay salidas ese día</p>
            <p className="empty__s">Probá con otra fecha{filtro.length ? ' o quitá el filtro' : ''}.</p>
          </div>
        ) : (
          <div className="timeline-list" key={`${direccion}-${fechaISO(fecha)}`}>
            {grupos.map(([hora, servs]) => (
              <section key={hora} className="hour-group">
                <h3 className={`hour-group__h tnum${esHoy && hora < Math.floor(minAhora / 60) ? ' is-past' : ''}`}>
                  {String(hora).padStart(2, '0')}:00
                </h3>
                <div className="card-list">
                  {servs.map((s, i) => (
                    <Fragment key={s.id}>
                      {s.id === idProximo && (
                        <div className="now-line" ref={ahoraRef}>
                          <span className="now-line__pill tnum">Ahora · {hhmm(ahora)}</span>
                        </div>
                      )}
                      {destacar.includes(s.id) ? (
                        <div className="dep-destacada" ref={s.id === destacar.find((id) => lista.some((x) => x.id === id)) ? destacadaRef : undefined}>
                          {fila(s, i)}
                        </div>
                      ) : fila(s, i)}
                    </Fragment>
                  ))}
                </div>
              </section>
            ))}
            {esHoy && idxProximo === -1 && (
              <div className="now-line" ref={ahoraRef}>
                <span className="now-line__pill">No quedan más salidas hoy</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
