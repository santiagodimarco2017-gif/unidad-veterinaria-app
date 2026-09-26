// Motor de horarios: todo en hora LOCAL del dispositivo (America/Argentina/Buenos_Aires, sin DST).
import type {
  DiaKey,
  DiasServicio,
  Direccion,
  EmpresaId,
  Feriado,
  Hora,
  ResumenDia,
  Salida,
  Servicio,
  TipoDia,
} from './types';

/** Orden lun..dom (índice 0 = lunes) */
export const DIAS_ORDEN: readonly DiaKey[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
/** Orden de la máscara de días: lun..dom, feriados */
export const MASCARA_ORDEN: readonly (DiaKey | 'feriados')[] = [...DIAS_ORDEN, 'feriados'];

const MS_MIN = 60_000;
/** Días siguientes a hoy que se recorren buscando salidas */
const DIAS_BUSQUEDA = 7;

// ---------- utilidades de fecha/hora ----------

const pad2 = (n: number): string => String(n).padStart(2, '0');

/** YYYY-MM-DD en hora local */
export function fechaISO(fecha: Date): string {
  return `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`;
}

/** "HH:MM" → minutos desde medianoche */
export function horaAMinutos(hora: Hora): number {
  const [h, m] = hora.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** Medianoche local del día de `fecha` + `dias` días */
export function inicioDelDia(fecha: Date, dias = 0): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

/** Date local para `hora` en el día de `fecha` (+ `diasExtra`) */
function enHora(fecha: Date, hora: Hora, diasExtra = 0): Date {
  const min = horaAMinutos(hora);
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + diasExtra, Math.floor(min / 60), min % 60);
}

/** "5:3" / "05:03" → "05:03" */
export function normalizarHora(hora: string): Hora {
  const [h = '0', m = '0'] = hora.trim().split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
}

export function diaKey(fecha: Date): DiaKey {
  // getDay(): 0 = domingo
  return DIAS_ORDEN[(fecha.getDay() + 6) % 7];
}

/** "11111000" (lun..dom, feriados) */
export function mascaraDias(dias: DiasServicio): string {
  return MASCARA_ORDEN.map((k) => (dias[k] ? '1' : '0')).join('');
}

export function idServicio(s: Pick<Servicio, 'direccion' | 'empresa' | 'sale' | 'dias'>): string {
  return `${s.direccion}-${s.empresa}-${s.sale}-${mascaraDias(s.dias)}`;
}

// ---------- días y feriados ----------

export function buscarFeriado(fecha: Date, feriados: readonly Feriado[]): Feriado | undefined {
  const iso = fechaISO(fecha);
  return feriados.find((f) => f.fecha === iso);
}

export function tipoDeDia(fecha: Date, feriados: readonly Feriado[]): TipoDia {
  if (buscarFeriado(fecha, feriados)) return 'feriado';
  const k = diaKey(fecha);
  if (k === 'sab') return 'sabado';
  if (k === 'dom') return 'domingo';
  return 'habil';
}

/** ¿El servicio corre en esa fecha? En feriado corre sii `dias.feriados`. */
export function corre(servicio: Servicio, fecha: Date, feriados: readonly Feriado[]): boolean {
  if (buscarFeriado(fecha, feriados)) return servicio.dias.feriados;
  return servicio.dias[diaKey(fecha)];
}

export function correFeriados(dias: DiasServicio): boolean {
  return dias.feriados;
}

// ---------- salidas ----------

/** Instancia concreta del servicio el día `fecha`. Si llega < sale, la llegada es al día siguiente. */
export function crearSalida(servicio: Servicio, fecha: Date, ahora: Date): Salida {
  const salida = enHora(fecha, servicio.sale);
  const cruza = horaAMinutos(servicio.llega) < horaAMinutos(servicio.sale);
  const llegada = enHora(fecha, servicio.llega, cruza ? 1 : 0);
  return {
    servicio,
    salida,
    llegada,
    minutos: Math.floor((salida.getTime() - ahora.getTime()) / MS_MIN),
    duracionMin: Math.round((llegada.getTime() - salida.getTime()) / MS_MIN),
  };
}

const porHoraDeSalida = (a: Servicio, b: Servicio): number =>
  horaAMinutos(a.sale) - horaAMinutos(b.sale) || a.empresa.localeCompare(b.empresa) || a.id.localeCompare(b.id);

const filtraEmpresa = (empresas?: readonly EmpresaId[]) => (s: Servicio): boolean =>
  !empresas || empresas.includes(s.empresa);

/** Servicios que corren ese día en ese sentido, ordenados por hora de salida */
export function serviciosDelDia(
  servicios: readonly Servicio[],
  dir: Direccion,
  fecha: Date,
  feriados: readonly Feriado[],
  empresas?: readonly EmpresaId[],
): Servicio[] {
  return servicios
    .filter((s) => s.direccion === dir && filtraEmpresa(empresas)(s) && corre(s, fecha, feriados))
    .sort(porHoraDeSalida);
}

/** Igual que serviciosDelDia pero como Salidas (minutos respecto de `ahora`) */
export function salidasDelDia(
  servicios: readonly Servicio[],
  dir: Direccion,
  fecha: Date,
  feriados: readonly Feriado[],
  ahora: Date = new Date(),
  empresas?: readonly EmpresaId[],
): Salida[] {
  return serviciosDelDia(servicios, dir, fecha, feriados, empresas).map((s) => crearSalida(s, fecha, ahora));
}

/**
 * Próximas `n` salidas desde `ahora` (incluye las que salieron hace ≤ 1 min),
 * recorriendo hoy y hasta 7 días siguientes. `empresas` = ids a incluir (undefined = todas).
 */
export function proximasSalidas(
  servicios: readonly Servicio[],
  dir: Direccion,
  ahora: Date,
  feriados: readonly Feriado[],
  n = 10,
  empresas?: readonly EmpresaId[],
): Salida[] {
  const res: Salida[] = [];
  for (let d = 0; d <= DIAS_BUSQUEDA && res.length < n; d++) {
    const fecha = inicioDelDia(ahora, d);
    for (const s of salidasDelDia(servicios, dir, fecha, feriados, ahora, empresas)) {
      if (s.minutos >= -1) res.push(s);
      if (res.length >= n) break;
    }
  }
  return res;
}

/** Próxima salida de un servicio puntual (≤ 1 min de gracia), o null si no corre en el próximo mes */
export function proximaSalidaDeServicio(
  servicio: Servicio,
  ahora: Date,
  feriados: readonly Feriado[],
): Salida | null {
  for (let d = 0; d <= 31; d++) {
    const fecha = inicioDelDia(ahora, d);
    if (!corre(servicio, fecha, feriados)) continue;
    const s = crearSalida(servicio, fecha, ahora);
    if (s.minutos >= -1) return s;
  }
  return null;
}

export function resumenDia(
  servicios: readonly Servicio[],
  dir: Direccion,
  fecha: Date,
  feriados: readonly Feriado[],
  empresas?: readonly EmpresaId[],
): ResumenDia {
  const delDia = serviciosDelDia(servicios, dir, fecha, feriados, empresas);
  const minutos = delDia.map((s) => horaAMinutos(s.sale));
  const porHora = Array.from({ length: 24 }, () => 0);
  for (const m of minutos) porHora[Math.floor(m / 60) % 24]++;
  const frecuenciaPromedioMin =
    minutos.length < 2 ? null : Math.round((minutos[minutos.length - 1] - minutos[0]) / (minutos.length - 1));
  const feriado = buscarFeriado(fecha, feriados);
  return {
    fecha: fechaISO(fecha),
    tipoDia: tipoDeDia(fecha, feriados),
    ...(feriado ? { feriado } : {}),
    cantidad: delDia.length,
    primero: delDia[0]?.sale,
    ultimo: delDia[delDia.length - 1]?.sale,
    frecuenciaPromedioMin,
    porHora,
  };
}

// ---------- textos ----------

const CORTO: Record<DiaKey, string> = {
  lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb', dom: 'Dom',
};
const LARGO_PLURAL: Record<DiaKey, string> = {
  lun: 'lunes', mar: 'martes', mie: 'miércoles', jue: 'jueves', vie: 'viernes', sab: 'sábados', dom: 'domingos',
};

/** "a", "a y b", "a, b y c" */
function unirY(partes: string[]): string {
  if (partes.length <= 1) return partes.join('');
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

/** Texto natural: "Todos los días", "Lun a Vie", "Lun a Vie y feriados", "Sáb, Dom y feriados", "Solo lunes"… */
export function diasTexto(dias: DiasServicio): string {
  const activos = DIAS_ORDEN.map((k) => dias[k]);
  const cant = activos.filter(Boolean).length;
  const fer = dias.feriados;
  if (cant === 7) return fer ? 'Todos los días' : 'Todos los días, excepto feriados';
  if (cant === 0) return fer ? 'Solo feriados' : 'Sin días asignados';
  if (cant === 1 && !fer) return `Solo ${LARGO_PLURAL[DIAS_ORDEN[activos.indexOf(true)]]}`;

  // Tramos consecutivos: ≥3 días → "Lun a Vie"; si no, días sueltos.
  const partes: string[] = [];
  let i = 0;
  while (i < 7) {
    if (!activos[i]) { i++; continue; }
    let j = i;
    while (j + 1 < 7 && activos[j + 1]) j++;
    if (j - i >= 2) partes.push(`${CORTO[DIAS_ORDEN[i]]} a ${CORTO[DIAS_ORDEN[j]]}`);
    else for (let k = i; k <= j; k++) partes.push(CORTO[DIAS_ORDEN[k]]);
    i = j + 1;
  }
  if (fer) partes.push('feriados');
  return unirY(partes);
}

/** Minutos de espera → "ahora", "en 5 min", "en 1 h 20 min", "salió hace 3 min" */
export function formatearEspera(min: number): string {
  if (min <= -1) return `salió hace ${Math.floor(-min)} min`;
  if (min < 1) return 'ahora';
  return `en ${formatearDuracion(min)}`;
}

/** 80 → "1 h 20 min", 55 → "55 min", 120 → "2 h" */
export function formatearDuracion(min: number): string {
  const total = Math.max(0, Math.floor(min));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ---------- calendario (.ics) ----------

const NOMBRE_SENTIDO: Record<Direccion, string> = {
  RC: 'Rosario → Casilda',
  CR: 'Casilda → Rosario',
};

/** Hora flotante local: 20261012T063000 */
const icsLocal = (d: Date): string =>
  `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;

const icsUTC = (d: Date): string => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const icsTexto = (s: string): string => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

/** Evento iCalendar (VEVENT con alarma 15 min antes) para una salida concreta */
export function generarICS(salida: Salida, empresaNombre?: string, ahora: Date = new Date()): string {
  const s = salida.servicio;
  const titulo = `Colectivo ${NOMBRE_SENTIDO[s.direccion]}${empresaNombre ? ` (${empresaNombre})` : ''}`;
  const detalle = [
    `Sale ${s.sale} · llega ${s.llega} (${formatearDuracion(salida.duracionMin)})`,
    s.tipoServicio,
    s.observaciones,
  ].filter(Boolean).join('\n');
  const origen = s.direccion === 'RC' ? 'Terminal de Ómnibus Rosario' : 'Casilda';
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Unidad Veterinaria//Casilda Bus//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${s.id}-${fechaISO(salida.salida).replace(/-/g, '')}@casildabus`,
    `DTSTAMP:${icsUTC(ahora)}`,
    `DTSTART:${icsLocal(salida.salida)}`,
    `DTEND:${icsLocal(salida.llegada)}`,
    `SUMMARY:${icsTexto(titulo)}`,
    `DESCRIPTION:${icsTexto(detalle)}`,
    `LOCATION:${icsTexto(origen)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsTexto(titulo)}`,
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lineas.join('\r\n') + '\r\n';
}
