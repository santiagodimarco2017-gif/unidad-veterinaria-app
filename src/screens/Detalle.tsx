// Hoja de detalle de un servicio.
import { useState } from 'react';
import type { DiaKey, DiasServicio, Salida } from '../lib/types';
import {
  corre, crearSalida, diaKey, fechaISO, formatearDuracion, formatearEspera, generarICS, proximaSalidaDeServicio,
} from '../lib/schedule';
import { EMPRESAS } from '../data';
import { pedirPermisoNotificaciones } from '../services/notifications';
import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import { Sheet } from '../components/Sheet';
import { EmpresaChip, colorEmpresa, nombreEmpresa } from '../components/EmpresaChip';
import { DayChips } from '../components/DayChips';
import { StopsTimeline } from '../components/StopsTimeline';
import { ReminderPicker } from '../components/ReminderPicker';
import { Icon } from '../components/Icon';
import { duracionServicio } from '../components/DepartureRow';
import { DIAS, SENTIDO, desdeISO, diaLargo, etiquetaDia, mismoDia, telHref } from '../state/util';
import { agregarAlCalendario, compartirTexto, haptic } from '../state/nativo';

const FUENTE_TXT = {
  terminal: 'Terminal de Ómnibus de Rosario',
  municipio: 'Municipalidad de Casilda',
  ambas: 'Terminal de Rosario y Municipalidad de Casilda',
} as const;

const DIA_PLURAL: Record<DiaKey, string> = {
  lun: 'lunes', mar: 'martes', mie: 'miércoles', jue: 'jueves', vie: 'viernes', sab: 'sábados', dom: 'domingos',
};

const lista = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);

/** "Corre de lunes a viernes, no los feriados" */
export function diasFrase(d: DiasServicio): string {
  const on = DIAS.filter((k) => d[k]);
  const fer = d.feriados ? 'también los feriados' : 'no los feriados';
  if (on.length === 0) return d.feriados ? 'Corre solo los feriados' : 'No tiene días cargados';
  let base: string;
  const es = (ks: DiaKey[]) => ks.length === on.length && ks.every((k) => d[k]);
  if (on.length === 7) base = 'todos los días';
  else if (es(['lun', 'mar', 'mie', 'jue', 'vie'])) base = 'de lunes a viernes';
  else if (es(['lun', 'mar', 'mie', 'jue', 'vie', 'sab'])) base = 'de lunes a sábado';
  else if (es(['sab', 'dom'])) base = 'sábados y domingos';
  else base = `los ${lista(on.map((k) => DIA_PLURAL[k]))}`;
  return `Corre ${base}, ${fer}`;
}

export function Detalle() {
  const nav = useNav();
  const app = useApp();
  const { detalle } = nav;
  if (!detalle) return null;
  const servicio = app.servicios.find((s) => s.id === detalle.servicioId);
  return (
    <Sheet onCerrar={nav.cerrarDetalle} etiqueta="Detalle del horario">
      {servicio ? <DetalleContenido key={servicio.id} servicioId={servicio.id} fecha={detalle.fecha} /> : (
        <div className="empty">
          <Icon name="info" size={36} />
          <p className="empty__t">Este horario ya no figura</p>
          <p className="empty__s">Puede que la empresa lo haya quitado. Revisá Horarios.</p>
        </div>
      )}
    </Sheet>
  );
}

function DetalleContenido({ servicioId, fecha }: { servicioId: string; fecha?: string }) {
  const app = useApp();
  const { ahora, feriados } = app;
  const s = app.servicios.find((x) => x.id === servicioId)!;
  const empresa = EMPRESAS[s.empresa];
  const color = colorEmpresa(s.empresa);
  const fav = app.favoritos.find((f) => f.servicioId === s.id);
  const [editandoAviso, setEditandoAviso] = useState(false);

  // Ocurrencia elegida (si es futura y corre ese día) o la próxima.
  let salida: Salida | null = null;
  if (fecha) {
    const d = desdeISO(fecha);
    if (corre(s, d, feriados)) {
      const c = crearSalida(s, d, ahora);
      if (c.minutos >= -1) salida = c;
    }
  }
  salida ??= proximaSalidaDeServicio(s, ahora, feriados);

  const esHoySalida = salida ? mismoDia(salida.salida, ahora) : false;
  const minutoActual = esHoySalida ? ahora.getHours() * 60 + ahora.getMinutes() : null;
  const nombre = nombreEmpresa(s.empresa);

  const textoCompartir = () => {
    const cuando = salida && !esHoySalida ? ` (${etiquetaDia(salida.salida, ahora).toLowerCase()})` : '';
    return `Tomo el ${nombre} de las ${s.sale} ${SENTIDO[s.direccion]}${cuando}, llego ${s.llega} 🚌`;
  };

  const compartir = async () => {
    haptic();
    const r = await compartirTexto(textoCompartir(), 'Mi colectivo');
    if (r === 'copiado') app.avisar('Copiado al portapapeles');
    if (r === 'fallo') app.avisar('No se pudo compartir');
  };

  const calendario = async () => {
    haptic();
    const sal = salida ?? crearSalida(s, ahora, ahora);
    const ics = generarICS(sal, nombre);
    const legible = `${nombre} · ${SENTIDO[s.direccion]}\n${diaLargo(sal.salida)}: sale ${s.sale}, llega ${s.llega}`;
    const ok = await agregarAlCalendario(ics, legible, `colectivo-${fechaISO(sal.salida)}-${s.sale.replace(':', '')}.ics`);
    app.avisar(ok ? 'Evento listo para tu calendario' : 'No se pudo crear el evento');
  };

  const alternarFav = () => {
    haptic('medio');
    const ahoraEs = app.alternarFavorito(s.id);
    if (!ahoraEs) setEditandoAviso(false);
    app.avisar(ahoraEs ? 'Guardado en Favoritos' : 'Quitado de Favoritos');
  };

  const guardarAviso = async (avisoMin: number | null, dias: DiaKey[]) => {
    app.guardarFavorito(s.id, { avisoMin, diasAviso: dias });
    setEditandoAviso(false);
    if (avisoMin == null) { app.avisar('Aviso desactivado'); return; }
    const ok = await pedirPermisoNotificaciones().catch(() => false);
    app.avisar(ok ? `Te avisamos ${avisoMin} min antes (quedó en Favoritos)` : 'Activá las notificaciones para recibir el aviso');
  };

  const telefono = empresa?.telefonos?.[0];
  const conAviso = fav?.avisoMin != null;

  return (
    <div className="detalle" style={{ ['--acc' as string]: color }}>
      <div className="detalle__head">
        <EmpresaChip empresa={s.empresa} variante="solido" />
        <span className="detalle__sentido">{SENTIDO[s.direccion]}</span>
      </div>

      <div className="detalle__times tnum">
        <div><small>Sale</small><b>{s.sale}</b></div>
        <div className="detalle__dur">
          <span className="detalle__dur-line" />
          <span>{formatearDuracion(duracionServicio(s))}</span>
          <span className="detalle__dur-line" />
        </div>
        <div className="ta-r"><small>Llega</small><b>{s.llega}</b></div>
      </div>

      <p className="detalle__next">
        <Icon name="clock" size={18} />
        {salida ? (
          <span>
            {esHoySalida ? 'Hoy' : etiquetaDia(salida.salida, ahora)}
            {' · '}
            <b>{salida.minutos < 1 ? 'sale ahora' : `sale ${formatearEspera(salida.minutos)}`}</b>
          </span>
        ) : <span>No corre en las próximas semanas</span>}
      </p>

      <div className="detalle__primary">
        <button type="button" className={`big-action${fav ? ' is-on' : ''}`} onClick={alternarFav} aria-pressed={!!fav}>
          <Icon name="star" size={22} fill={!!fav} />
          <span>{fav ? 'Guardado en favoritos' : 'Guardar en favoritos'}</span>
        </button>
        <button type="button" className={`big-action${conAviso ? ' is-on' : ''}`} onClick={() => { haptic(); setEditandoAviso((v) => !v); }} aria-expanded={editandoAviso}>
          <Icon name="bell" size={22} fill={conAviso} />
          <span>{conAviso ? `Aviso ${fav?.avisoMin} min antes` : 'Avisame antes'}</span>
        </button>
      </div>

      {editandoAviso && (
        <div className="card pad">
          <ReminderPicker servicio={s} favorito={fav} onGuardar={guardarAviso} onCancelar={() => setEditandoAviso(false)} />
        </div>
      )}

      <div className="detalle__secondary">
        <button type="button" className="mini-action" onClick={compartir}><Icon name="share" size={18} /> Compartir</button>
        <button type="button" className="mini-action" onClick={calendario}><Icon name="calendarPlus" size={18} /> Calendario</button>
        {telefono && (
          <a className="mini-action" href={telHref(telefono)} onClick={() => haptic()}><Icon name="phone" size={18} /> Llamar</a>
        )}
      </div>

      <section className="detalle__sec">
        <h3 className="section__h">Qué días corre</h3>
        <p className="detalle__dias">{diasFrase(s.dias)}.</p>
        <DayChips dias={s.dias} hoy={diaKey(ahora)} />
      </section>

      {s.paradas && s.paradas.length > 1 && (
        <section className="detalle__sec">
          <h3 className="section__h">Recorrido</h3>
          <StopsTimeline paradas={s.paradas} color={color} minutoActual={minutoActual} />
        </section>
      )}

      {(s.observaciones || empresa?.notas) && (
        <section className="detalle__sec">
          <h3 className="section__h">Para tener en cuenta</h3>
          {s.observaciones && <p className="nota"><Icon name="info" size={16} />{s.observaciones}</p>}
          {empresa?.notas && <p className="nota nota--acc"><Icon name="pin" size={16} />{empresa.notas}</p>}
        </section>
      )}

      <section className="detalle__sec">
        <h3 className="section__h">Empresa</h3>
        <p className="detalle__empresa">
          <b>{nombre}</b>
          {s.tipoServicio ? ` · ${s.tipoServicio}` : ''}
          <br />
          <span className="tnum">{empresa?.telefonos?.join(' · ') || 'Sin teléfono publicado'}</span>
        </p>
      </section>

      <p className="detalle__fuente">
        Fuente: {FUENTE_TXT[s.fuente] ?? s.fuente}. Los horarios pueden variar; confirmá con la empresa.
      </p>
    </div>
  );
}
