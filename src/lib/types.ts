// Contrato compartido entre datos, motor de horarios, servicios y UI.
// Cambiar este archivo solo de forma aditiva.

/** RC = Rosario → Casilda, CR = Casilda → Rosario */
export type Direccion = 'RC' | 'CR';
export type DiaKey = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';
export type DiasServicio = Record<DiaKey | 'feriados', boolean>;
/** "HH:MM" 24 h */
export type Hora = string;

export type EmpresaId =
  | 'linea339'
  | 'ranqueles'
  | 'arito'
  | 'laverde'
  | 'viatac'
  | 'nandu'
  | 'flechabus'
  | 'otra';

export interface Empresa {
  id: EmpresaId;
  nombre: string;
  /** color de marca para chips (hex) */
  color: string;
  telefonos: string[];
  whatsapp?: string;
  web?: string;
  /** id en terminalrosario.gob.ar (empresa.php?id=) */
  terminalId?: number;
  /** dónde para en Casilda, avisos útiles, etc. */
  notas?: string;
}

export interface Parada {
  nombre: string;
  hora: Hora;
}

export type FuenteDatos = 'terminal' | 'municipio' | 'ambas';

export interface Servicio {
  /** estable entre actualizaciones: `${direccion}-${empresa}-${sale}-${mascaraDias}` */
  id: string;
  direccion: Direccion;
  empresa: EmpresaId;
  sale: Hora;
  llega: Hora;
  dias: DiasServicio;
  tipoServicio: string;
  observaciones: string;
  /** paradas intermedias incluyendo origen y destino, si se conocen */
  paradas?: Parada[];
  fuente: FuenteDatos;
  /** id de viaje_detalle.php en la terminal */
  viajeId?: number;
}

export interface Feriado {
  fecha: string; // YYYY-MM-DD
  nombre: string;
  tipo: 'inamovible' | 'trasladable' | 'puente' | string;
}

/** Instancia concreta de un servicio en una fecha dada */
export interface Salida {
  servicio: Servicio;
  /** fecha/hora local de salida */
  salida: Date;
  llegada: Date;
  /** minutos hasta la salida respecto de "ahora" (negativo = ya salió) */
  minutos: number;
  duracionMin: number;
}

export type TipoDia = 'habil' | 'sabado' | 'domingo' | 'feriado';

export interface ResumenDia {
  fecha: string; // YYYY-MM-DD
  tipoDia: TipoDia;
  feriado?: Feriado;
  cantidad: number;
  primero?: Hora;
  ultimo?: Hora;
  /** espera promedio entre salidas, en minutos */
  frecuenciaPromedioMin: number | null;
  /** salidas por hora (0..23) */
  porHora: number[];
}

export type TipoAlerta = 'paro' | 'cambio_horario' | 'feriado' | 'info';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  detalle?: string;
  fecha: string; // ISO
  url?: string;
  fuente?: string;
  /** severidad visual */
  nivel: 'alta' | 'media' | 'baja';
}

export interface Favorito {
  servicioId: string;
  /** etiqueta del usuario, ej. "Facu", "Trabajo" */
  etiqueta?: string;
  /** recordatorio: minutos antes (null = sin aviso) */
  avisoMin: number | null;
  /** días en que avisar (subconjunto de los días del servicio) */
  diasAviso: DiaKey[];
  creado: string; // ISO
}

export interface Contacto {
  nombre: string;
  categoria: 'remis' | 'taxi' | 'empresa' | 'terminal' | 'emergencia' | 'municipio';
  telefonos: string[];
  whatsapp?: string;
  direccion?: string;
  nota?: string;
}

export interface Ajustes {
  tema: 'sistema' | 'claro' | 'oscuro';
  direccionPorDefecto: Direccion | 'auto';
  notifParos: boolean;
  notifCambios: boolean;
  notifFeriados: boolean;
  /** Avisos de inscripción a cursado y mesas en Guaraní (Carrera). */
  notifInscripciones: boolean;
  empresasOcultas: EmpresaId[];
  textoGrande: boolean;
}

export interface EstadoDatos {
  servicios: Servicio[];
  actualizado: string; // ISO de la última obtención válida
  origen: 'incluido' | 'cache' | 'en-vivo';
}
