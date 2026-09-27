// Lugares del "Mapa de nuestra facu" (imagen compartida por Unidad Veterinaria). El número es el de la
// referencia del mapa; x/y es el centro del círculo numerado, en % del ancho y alto de assets/mapa-facu.jpg.

export type Categoria = 'estudio' | 'servicios' | 'campo' | 'accesos';

export interface Lugar {
  n: number;
  nombre: string;
  cat: Categoria;
  x: number;
  y: number;
  /** Otros números del mapa que son el mismo tipo de lugar (los baños 7, 9 y 11) */
  grupo?: number[];
  nota?: string;
}

export const CATEGORIAS: { id: Categoria; titulo: string }[] = [
  { id: 'estudio', titulo: 'Estudio y trámites' },
  { id: 'servicios', titulo: 'Comida y servicios' },
  { id: 'campo', titulo: 'Campo y producción' },
  { id: 'accesos', titulo: 'Accesos' },
];

const BANOS = [7, 9, 11];

export const LUGARES: Lugar[] = [
  { n: 1, nombre: 'Entrada vehicular', cat: 'accesos', x: 94.8, y: 65.8 },
  { n: 2, nombre: 'Ingreso peatonal', cat: 'accesos', x: 74.1, y: 96.0, nota: 'Sobre la Ruta 33, mano a Rosario' },
  { n: 3, nombre: 'Casa Central (Decanato)', cat: 'estudio', x: 55.3, y: 67.9 },
  { n: 4, nombre: 'Biblioteca', cat: 'estudio', x: 22.7, y: 48.1 },
  { n: 5, nombre: 'Museo', cat: 'estudio', x: 31.5, y: 36.3 },
  { n: 6, nombre: 'Cantina', cat: 'servicios', x: 32.0, y: 51.4 },
  { n: 7, nombre: 'Baños', cat: 'servicios', x: 37.9, y: 47.2, grupo: BANOS },
  { n: 8, nombre: 'Anfiteatro', cat: 'estudio', x: 38.3, y: 24.2 },
  { n: 9, nombre: 'Baños', cat: 'servicios', x: 25.6, y: 23.9, grupo: BANOS },
  { n: 10, nombre: 'Pabellón 18', cat: 'estudio', x: 50.2, y: 30.5 },
  { n: 11, nombre: 'Baños', cat: 'servicios', x: 49.8, y: 21.4, grupo: BANOS },
  { n: 12, nombre: 'Escuela Agrotécnica', cat: 'estudio', x: 82.9, y: 48.8 },
  { n: 13, nombre: 'Industria', cat: 'campo', x: 64.7, y: 19.1 },
  { n: 14, nombre: 'Ganadería', cat: 'campo', x: 15.5, y: 5.1 },
  { n: 15, nombre: 'Centro de Salud (Pabellón 15)', cat: 'servicios', x: 28.2, y: 18.4, nota: 'No figura en la referencia original del mapa' },
  { n: 16, nombre: 'Alumnado', cat: 'estudio', x: 30.2, y: 44.7 },
  { n: 17, nombre: 'Laboratorios', cat: 'estudio', x: 35.0, y: 41.6 },
  { n: 18, nombre: 'Kiosco (El Honguito)', cat: 'servicios', x: 48.2, y: 54.6 },
  { n: 19, nombre: 'Casilla de Ganadería', cat: 'campo', x: 46.1, y: 13.2 },
  { n: 20, nombre: 'Porqueriza', cat: 'campo', x: 57.6, y: 3.5 },
  { n: 21, nombre: 'Hospital Escuela', cat: 'estudio', x: 21.4, y: 72.3 },
  { n: 22, nombre: 'Laboratorio Centralizado', cat: 'estudio', x: 16.1, y: 68.4 },
  { n: 23, nombre: 'Sala de Necropsia', cat: 'estudio', x: 5.9, y: 72.1 },
  { n: 24, nombre: 'Chacra', cat: 'campo', x: 46.2, y: 49.6 },
  { n: 25, nombre: 'Sala de Usos Múltiples (SUM)', cat: 'estudio', x: 36.7, y: 67.4 },
  { n: 26, nombre: 'Fotocopiadora', cat: 'servicios', x: 31.2, y: 59.5 },
  { n: 27, nombre: 'Piscicultura', cat: 'campo', x: 60.3, y: 30.4 },
  { n: 28, nombre: 'Casa 9', cat: 'campo', x: 3.9, y: 58.4 },
  { n: 29, nombre: 'Centro de Salud (según la referencia)', cat: 'servicios', x: 23.2, y: 42.3, nota: 'Está en el Pabellón 15 (el 15 del mapa)' },
  { n: 30, nombre: 'Secretaría Estudiantil', cat: 'estudio', x: 26.4, y: 38.6 },
  { n: 31, nombre: 'Comedor', cat: 'servicios', x: 25.5, y: 69.8 },
];

/** Relación de aspecto de la imagen del mapa (ancho / alto) */
export const MAPA_ASPECTO = 660 / 570;

export const COMO_LLEGAR = 'https://www.google.com/maps/search/?api=1&query=Facultad+de+Ciencias+Veterinarias+UNR+Casilda';
