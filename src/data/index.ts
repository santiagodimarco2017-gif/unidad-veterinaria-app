// Datos incluidos en la app (offline): snapshot de la Terminal Rosario + cuadro municipal del 33/9.
import type { Servicio } from '../lib/types';
import { snapshotAServicios } from '../lib/terminal-parser';
import { construirServicios } from '../lib/merge';
import snapshot from './terminal-snapshot.json';
import { SERVICIOS_MUNICIPIO_339 } from './municipio339';

export { EMPRESAS } from './empresas';
export { CONTACTOS } from './contactos';
export { FERIADOS_INCLUIDOS } from './feriados';
export { SERVICIOS_MUNICIPIO_339 };

/** Fecha ISO en que se generó el snapshot de la terminal */
export const SNAPSHOT_FECHA: string = snapshot.actualizado;

export const SERVICIOS_INCLUIDOS: Servicio[] = construirServicios(
  snapshotAServicios(snapshot),
  SERVICIOS_MUNICIPIO_339,
);
