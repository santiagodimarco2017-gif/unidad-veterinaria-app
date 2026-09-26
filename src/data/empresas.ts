// Datos de las empresas que cubren el trayecto Rosario ⇄ Casilda.
// Teléfonos y web tomados de terminalrosario.gob.ar/wp-content/themes/terminal-rosario/popups/empresa.php?id=N
// (consultado 2026-09-26). No se inventan datos: si la empresa no publica teléfono, queda vacío.

import type { Empresa, EmpresaId } from '../lib/types';

export const EMPRESAS: Record<EmpresaId, Empresa> = {
  linea339: {
    id: 'linea339',
    nombre: '33/9 Azul América',
    color: '#1E88E5',
    telefonos: ['341-5821917'],
    terminalId: 134,
    notas:
      'Para en Godoy, Pérez (Esso), Zavalla, Pujato y Peaje de Casilda. Fuente preferida para el detalle de paradas: Municipio de Casilda.',
  },
  ranqueles: {
    id: 'ranqueles',
    nombre: 'Los Ranqueles',
    color: '#8E24AA',
    telefonos: ['341-6516502'],
    terminalId: 12,
    notas: 'Además de Casilda, cubre destinos como Arteaga, Los Molinos y Firmat.',
  },
  arito: {
    id: 'arito',
    nombre: 'Arito',
    color: '#F4511E',
    telefonos: [],
    terminalId: 10,
    notas:
      'En Casilda para en Casilda Universidad (no entra a la terminal, salvo el de las 15:00 que llega 16:00). Recorrido hacia Firmat / Venado Tuerto.',
  },
  laverde: {
    id: 'laverde',
    nombre: 'La Verde',
    color: '#43A047',
    telefonos: ['0341-4304202'],
    terminalId: 11,
    notas: 'Boletería 40 en la Terminal de Rosario.',
  },
  viatac: {
    id: 'viatac',
    nombre: 'VIA TAC',
    color: '#00897B',
    telefonos: [],
    whatsapp: '11-3320-4247',
    terminalId: 5121,
    notas: 'Atención sólo por WhatsApp. Boletería 26 en la Terminal de Rosario.',
  },
  nandu: {
    id: 'nandu',
    nombre: 'Ñandú del Sur',
    color: '#FB8C00',
    telefonos: ['0341-4372502'],
    terminalId: 75,
    notas: 'Boletería 24 en la Terminal de Rosario.',
  },
  flechabus: {
    id: 'flechabus',
    nombre: 'Flechabus',
    color: '#E53935',
    telefonos: ['0341-4309333', '0341-4361041'],
    whatsapp: '341-5790178',
    web: 'https://www.flechabus.com.ar',
    terminalId: 67,
    notas: 'Boleterías 1 y 2 en la Terminal de Rosario.',
  },
  otra: {
    id: 'otra',
    nombre: 'Otra empresa',
    color: '#757575',
    telefonos: [],
    notas: 'Empresa no identificada en las fuentes disponibles.',
  },
};
