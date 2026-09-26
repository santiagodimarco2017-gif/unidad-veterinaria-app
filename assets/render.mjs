// Renderiza el logo de Unidad Veterinaria (assets/logo-uv-original.png) a los PNG
// que necesitan @capacitor/assets (android/ios) y la PWA.
// Uso: node assets/render.mjs

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const LOGO = path.join(root, 'assets/logo-uv-original.png');

// Marca Unidad Veterinaria: círculo verde con cabezas de caballo/vaca/cerdo en blanco.
const GREEN = '#068136';
const GREEN_DARK = '#0b2a17';

function hexToRgba(hex, alpha = 1) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, alpha };
}

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** Redimensiona el logo original (cuadrado, con transparencia) a `width`x`width`. */
async function logoBuffer(width) {
  return sharp(LOGO)
    .resize(width, width, { fit: 'contain', background: TRANSPARENT })
    .png()
    .toBuffer();
}

/** Genera un SVG simple con texto centrado, usando una fuente del sistema. */
function textSvg(width, height, text, fontSize, color) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Arial, Helvetica, sans-serif" font-weight="600"
        font-size="${fontSize}" fill="${color}">${text}</text>
    </svg>
  `);
}

async function writePng(pipeline, outAbsPath, size) {
  await pipeline.png().toFile(outAbsPath);
  console.log(`✓ ${path.relative(root, outAbsPath)} (${size}x${size})`);
}

/**
 * Ícono "legacy" (mipmap ic_launcher / PWA): cuadrado verde a sangre completa con el
 * logo (círculo + siluetas) ocupando casi todo el cuadro, de forma que el círculo del
 * logo se funde visualmente con el fondo verde.
 */
async function iconOnly(outAbsPath, size = 1024) {
  const logoWidth = Math.round(size * 0.92);
  const logo = await logoBuffer(logoWidth);
  const pipeline = sharp({
    create: { width: size, height: size, channels: 4, background: hexToRgba(GREEN) },
  }).composite([{ input: logo, gravity: 'center' }]);
  await writePng(pipeline, outAbsPath, size);
}

/** Primer plano del ícono adaptativo de Android: logo sobre transparente, en la zona segura (~66%). */
async function iconForeground(outAbsPath, size = 1024) {
  const logoWidth = Math.round(size * 0.62);
  const logo = await logoBuffer(logoWidth);
  const pipeline = sharp({
    create: { width: size, height: size, channels: 4, background: TRANSPARENT },
  }).composite([{ input: logo, gravity: 'center' }]);
  await writePng(pipeline, outAbsPath, size);
}

/** Fondo del ícono adaptativo de Android: verde sólido. */
async function iconBackground(outAbsPath, size = 1024) {
  const pipeline = sharp({
    create: { width: size, height: size, channels: 4, background: hexToRgba(GREEN) },
  });
  await writePng(pipeline, outAbsPath, size);
}

/** Splash screen: fondo de color, logo centrado y texto "Unidad Veterinaria" debajo. */
async function splash(outAbsPath, size, bgColor) {
  const logoWidth = Math.round(size * 0.22);
  const logo = await logoBuffer(logoWidth);

  const gap = Math.round(size * 0.035);
  const textHeight = Math.round(size * 0.07);
  const fontSize = Math.round(size * 0.033);
  const blockHeight = logoWidth + gap + textHeight;
  const blockTop = Math.round((size - blockHeight) / 2);

  const logoLeft = Math.round((size - logoWidth) / 2);
  const logoTop = blockTop;
  const textTop = logoTop + logoWidth + gap;

  const text = textSvg(size, textHeight, 'Unidad Veterinaria', fontSize, '#ffffff');

  const pipeline = sharp({
    create: { width: size, height: size, channels: 4, background: hexToRgba(bgColor) },
  }).composite([
    { input: logo, left: logoLeft, top: logoTop },
    { input: text, left: 0, top: textTop },
  ]);
  await writePng(pipeline, outAbsPath, size);
}

/** Ícono cuadrado simple (sin texto) para PWA/favicon: logo al `scale` sobre fondo verde. */
async function simpleIcon(outAbsPath, size, scale, bg = GREEN) {
  const logoWidth = Math.round(size * scale);
  const logo = await logoBuffer(logoWidth);
  const pipeline = sharp({
    create: { width: size, height: size, channels: 4, background: hexToRgba(bg) },
  }).composite([{ input: logo, gravity: 'center' }]);
  await writePng(pipeline, outAbsPath, size);
}

async function main() {
  // Para @capacitor/assets (genera android/ios desde estos archivos).
  await iconOnly(path.join(root, 'assets/icon-only.png'), 1024);
  await iconForeground(path.join(root, 'assets/icon-foreground.png'), 1024);
  await iconBackground(path.join(root, 'assets/icon-background.png'), 1024);
  await splash(path.join(root, 'assets/splash.png'), 2732, GREEN);
  await splash(path.join(root, 'assets/splash-dark.png'), 2732, GREEN_DARK);

  // Para la PWA (public/).
  await simpleIcon(path.join(root, 'public/pwa-192.png'), 192, 0.7);
  await simpleIcon(path.join(root, 'public/pwa-512.png'), 512, 0.7);
  await simpleIcon(path.join(root, 'public/maskable-512.png'), 512, 0.7);
  await simpleIcon(path.join(root, 'public/apple-touch-icon.png'), 180, 0.7);
  await simpleIcon(path.join(root, 'public/favicon.png'), 64, 0.72);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
