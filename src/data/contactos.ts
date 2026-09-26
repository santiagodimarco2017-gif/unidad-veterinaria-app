// Contactos oficiales (remises/taxis de Casilda, terminales, emergencias).
// Teléfonos como strings "para mostrar"; la UI limpia no-dígitos y antepone +54 al llamar.
// Fuentes: sitio del municipio de Casilda (radio taxis y remis) y www.casilda.gob.ar/web
// (Municipalidad, consultado 2026-09-26). Terminal de Ómnibus de Casilda no se incluye: no se
// encontró un teléfono verificable en fuentes oficiales.

import type { Contacto } from '../lib/types';

export const CONTACTOS: Contacto[] = [
  {
    nombre: 'Radio Taxi Alberdi',
    categoria: 'taxi',
    telefonos: ['3464-426600', '3464-426800', '3464-425803', '3464-537575'],
  },
  {
    nombre: 'Asociación de Radio Taxi Casilda',
    categoria: 'taxi',
    telefonos: ['3464-420200', '3464-425050', '3464-639339', '3464-555300'],
  },
  {
    nombre: 'Remises Ovidio Lagos',
    categoria: 'remis',
    telefonos: ['3464-425800', '3464-544544'],
    direccion: 'San Luis 2657, Casilda',
  },
  {
    nombre: 'Terminal de Ómnibus Rosario "Mariano Moreno"',
    categoria: 'terminal',
    telefonos: ['0341-4373030'],
    direccion: 'Cafferata 702, Rosario',
  },
  {
    nombre: 'Municipalidad de Casilda',
    categoria: 'municipio',
    telefonos: ['03464-422211', '03464-422212'],
    whatsapp: '3464-620797',
    direccion: 'Casado 2090, Casilda',
  },
  {
    nombre: 'Policía / Emergencias',
    categoria: 'emergencia',
    telefonos: ['911'],
  },
  {
    nombre: 'SAME / Emergencias médicas',
    categoria: 'emergencia',
    telefonos: ['107'],
  },
  {
    nombre: 'Bomberos',
    categoria: 'emergencia',
    telefonos: ['100'],
  },
];
