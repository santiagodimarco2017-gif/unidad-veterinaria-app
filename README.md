# Unidad Veterinaria — app

App para Android, iPhone y web de **Unidad Veterinaria** (Casilda, Santa Fe). Reúne dos cosas:

- **Colectivos Casilda ⇄ Rosario**: próximo colectivo con cuenta regresiva, horarios completos por día,
  frecuencia por hora, qué días corre cada servicio y si corre los feriados, paradas del 33/9,
  favoritos con aviso antes de salir, avisos de paros y de cambios de horario, y teléfonos de remises
  y radio taxis de Casilda.
- **Carrera** (Correlativas FCV-UNR, Plan 2009 mod. 2026): materias y correlativas, calendario de mesas
  con "¿Cómo llego?" (sugiere el colectivo a Casilda), simulador, estadísticas y Flappy Unidad.

## Fuentes de datos

- Buscador de la [Terminal de Ómnibus de Rosario](http://www.terminalrosario.gob.ar) (no tiene API JSON;
  se parsea su tabla HTML — ver `src/lib/terminal-parser.ts` y `tools/scrape-terminal.mjs`).
- [Municipalidad de Casilda](https://www.casilda.gob.ar/web/horarios-de-colectivos-casilda/): PDFs de
  horarios (`tools/*.pdf`) y teléfonos de remises / radio taxis.
- Feriados: [ArgentinaDatos](https://api.argentinadatos.com/v1/feriados/2026). Clima: Open-Meteo.

Los horarios pueden variar: confirmá con la empresa.

## Desarrollo

Requiere Node 20+.

```bash
npm install
npm run dev        # servidor de desarrollo
npm run test       # tests del motor de horarios
npm run build      # build web / PWA en dist/
npm run scrape     # actualiza src/data/terminal-snapshot.json desde la terminal
```

### Web en Vercel

Importá el repo en Vercel: detecta Vite solo (build `npm run build`, salida `dist`). Las funciones de
`api/` (`/api/terminal` y `/api/noticias`) le dan a la versión web la actualización en vivo desde la
terminal y los avisos de paro, que el navegador no puede consultar directo por CORS. Solo aceptan las
URLs fijas de la app. La web se puede instalar en el celular (PWA): en iPhone, Safari → Compartir →
"Agregar a pantalla de inicio".

### Android

Requiere JDK 21 y Android SDK 36.

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug   # APK en android/app/build/outputs/apk/debug/
```

### iOS

`npx cap sync ios` y abrir `ios/App` en Xcode (requiere una Mac).

## Stack

React 19 · TypeScript · Vite · Capacitor 8 · vite-plugin-pwa · Tailwind 4 (solo en la sección Carrera) · Firebase (ranking del juego).

---

Desarrollado por **Unidad Veterinaria**.
