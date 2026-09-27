// Genera la silueta blanca del logo de Unidad Veterinaria sobre fondo transparente
// (assets/logo-uv-silueta-blanca.png), para usar como marca de agua sobre el verde.
// No toca el original: lee assets/logo-uv-original.png y escribe un archivo nuevo.
// Uso: node assets/silueta.mjs

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const ORIGINAL = path.join(here, 'logo-uv-original.png');
const SALIDA = path.join(here, 'logo-uv-silueta-blanca.png');

// Verde del círculo del logo original. Cada píxel se mide por cuánto se aleja de ese verde
// hacia el blanco (canal rojo: 6 en el verde, 255 en el blanco): el círculo queda transparente
// y el dibujo (caballo, vaca y cerdo) queda blanco, con los bordes suavizados del original.
const ROJO_VERDE = 6;

const { data, info } = await sharp(ORIGINAL).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(data.length);
for (let i = 0; i < data.length; i += 4) {
  const blancura = Math.min(1, Math.max(0, (data[i] - ROJO_VERDE) / (255 - ROJO_VERDE)));
  out[i] = 255;
  out[i + 1] = 255;
  out[i + 2] = 255;
  out[i + 3] = Math.round(data[i + 3] * blancura);
}

await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(SALIDA);
console.log(`✓ ${path.relative(path.resolve(here, '..'), SALIDA)}`);
