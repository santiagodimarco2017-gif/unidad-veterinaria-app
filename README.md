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

### Avisos de Instagram (@unidadvet)

Cuando Unidad Veterinaria publica en el feed de Instagram, llega una notificación a la app y a la web
(quien la active en **Más → Ajustes**). Si la descripción trae un link (inscripción a una charla, una
transmisión), tocar el aviso abre ese link; si no, abre el posteo.

Cómo funciona: `.github/workflows/instagram-avisos.yml` llama cada 15 min a `/api/instagram-avisos`, que lee
los últimos posteos con la API oficial de Instagram, detecta los nuevos y los manda por Firebase Cloud
Messaging. La app se suscribe con `/api/push-registro`. El estado (último posteo avisado y token renovado)
queda en Firestore, en `avisos_instagram/estado`. La primera corrida no avisa nada: solo marca lo que ya estaba.

Configuración (una sola vez):

1. **Instagram**: la cuenta @unidadvet tiene que ser *profesional* (Empresa o Creador de contenido):
   Instagram → Configuración → Tipo de cuenta. En [developers.facebook.com](https://developers.facebook.com/apps)
   crear una app → caso de uso "Administrar mensajes y contenido en Instagram" → *API setup with Instagram login* →
   agregar la cuenta @unidadvet y **generar token**. Ese token va en Vercel como `IG_ACCESS_TOKEN`
   (se renueva solo; si alguna vez vence, se genera otro y se reemplaza la variable).
2. **Firebase** (proyecto de la app): Configuración del proyecto →
   - *Cuentas de servicio* → "Generar nueva clave privada" → pegar el JSON entero en Vercel como `FIREBASE_SERVICE_ACCOUNT`.
   - *Cloud Messaging* → *Certificados push web* → "Generar par de claves" → la clave pública va como `VITE_FIREBASE_VAPID_KEY`.
   - *General* → agregar app Android con el `appId` de `capacitor.config.ts` → bajar `google-services.json` a `android/app/`.
3. **Vercel** → Settings → Environment Variables: las tres de arriba, más `CRON_SECRET` (cualquier texto largo
   al azar) y `VITE_API_BASE` con la URL de la web (p.ej. `https://tu-app.vercel.app`). Redeploy.
4. **GitHub** → Settings → Secrets and variables → Actions: `AVISOS_URL` (la misma URL) y `CRON_SECRET`
   (el mismo valor). Para probar: Actions → "Avisos de Instagram" → *Run workflow*.
5. **APK**: crear `.env.local` con `VITE_API_BASE=...` y `VITE_FIREBASE_VAPID_KEY=...` antes de `npm run build`.

En iPhone la web avisa solo si está agregada a la pantalla de inicio (iOS 16.4+). La app de iOS necesita
además la clave APNs de Apple cargada en Firebase y el SDK de Firebase Messaging (queda pendiente).

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
