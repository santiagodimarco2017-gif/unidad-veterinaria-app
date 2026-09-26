# Casilda Bus — plan de producto y desarrollo

App Android + iPhone (Capacitor 8 + React 19 + Vite 8 + TypeScript) y PWA, para saber **cuándo sale el
colectivo Casilda ⇄ Rosario**, frecuencias, días en que corre, feriados, paros, cambios de horario,
favoritos con recordatorio y teléfonos de remises. Idioma: español rioplatense (voseo). Créditos: **Unidad Veterinaria**.

## Fuentes de datos (investigadas)

| Fuente | Qué da | Cómo se usa |
|---|---|---|
| `http://www.terminalrosario.gob.ar/buscador/2000/221/rosario-casilda/` y `/buscador/221/2000/casilda-rosario/` | Tabla HTML (no hay API JSON): empresa, sale, llega, Lun..Dom, Feriados, observaciones, tipo de servicio, id de viaje. 60 servicios R→C, 59 C→R, 7 empresas. | Snapshot incluido en `src/data/terminal-snapshot.json` (generado con `tools/scrape-terminal.mjs`) + actualización en vivo en el teléfono (CapacitorHttp evita CORS). Si cambia → alerta "cambio de horario". |
| `…/popups/empresa.php?id=N` | Datos de contacto de cada empresa | Teléfonos de empresas |
| `…/popups/viaje_detalle.php?id=N&origen=&destino=` | Detalle de recorrido | Opcional |
| Municipio de Casilda `tools/linea339.pdf` | 33/9 parada por parada (Terminal Rosario, Godoy P. Unidas, Pérez Esso, Zavalla, Pujato, Casilda Peaje, Terminal Casilda). L‑V desde 06/07/2026, Sáb desde 30/12/2023, Dom y Feriados desde 07/01/2024 | Paradas intermedias del 33/9; fuente preferida para el 33/9 |
| `tools/arito.pdf`, `tools/ranqueles.pdf` | Cuadros de Arito (para en **Casilda Universidad**, no en terminal salvo 15:00) y Los Ranqueles | Notas por empresa, verificación cruzada |
| `https://api.argentinadatos.com/v1/feriados/{año}` | Feriados nacionales | Resolver días feriados; fallback incluido |
| Google News RSS (`news.google.com/rss/search?q=...&hl=es-419&gl=AR&ceid=AR:es-419`) | Noticias de paros UTA / colectivos | Alertas de paro + notificación |
| Open‑Meteo | Clima en destino | Tarjeta de clima |

Contactos oficiales (sitio del municipio): Radio Taxi Alberdi 3464‑426600/426800/425803 y 3464‑537575;
Asociación de Radio Taxi Casilda 3464‑420200/425050 y 3464‑639339/555300; Remises Ovidio Lagos 3464‑425800 y 3464‑544544 (San Luis 2657).
Terminal Rosario: 0341‑437 3030 (Cafferata 702).

## Ideas tomadas de apps de referencia
- **Transit**: cuenta regresiva gigante del próximo, "GO"/recordatorio para salir.
- **Moovit**: alertas de servicio, avisos de paro, estado de línea.
- **Citymapper**: "Llevame a casa" → dirección automática según ubicación; clima.
- **DB Navigator / SBB**: viajes favoritos, recordatorios, exportar a calendario, compartir viaje.
- **Cuándo Llega (Rosario)**: simpleza, orientado a la parada.
- Offline‑first, modo oscuro, texto grande, compartir por WhatsApp.

## Funciones
1. **Inicio**: selector de sentido (R→C / C→R, animado, auto por GPS opcional), tarjeta héroe con el próximo (cuenta regresiva en vivo, empresa, duración, tipo), próximas 6 salidas, banner de estado (normal / hoy es feriado / posible paro / cambio de horario), clima en destino.
2. **Horarios**: lista del día elegido (Hoy / Mañana / fecha), filtros por empresa, pasadas atenuadas, "ahora" marcado.
3. **Frecuencia**: gráfico de salidas por hora, primero/último, espera promedio, comparación hábil/sábado/domingo‑feriado.
4. **Detalle de servicio**: línea de paradas (33/9), días en que corre (chips), comportamiento en feriados, contacto de la empresa, favorito, recordatorio, compartir, agregar al calendario (.ics).
5. **Favoritos**: servicios guardados con etiqueta y recordatorio X min antes en días elegidos (notificaciones locales semanales).
6. **Alertas**: paros detectados, cambios de horario, próximos feriados ("el lunes es feriado: rige horario de feriados, X servicios").
7. **Feriados**: calendario del año con cantidad de servicios ese día.
8. **Contactos**: remises / radio taxis, empresas, terminales → Llamar / WhatsApp.
9. **Ajustes y créditos**: tema, texto grande, notificaciones, empresas ocultas, fuente y fecha de datos, "Desarrollado por Unidad Veterinaria".

## Arquitectura y dueños de archivos (cada agente toca SOLO lo suyo)

Contrato compartido: `src/lib/types.ts` (solo cambios aditivos, avisar).

### Agente DATOS (Sonnet) — `src/data/empresas.ts`, `src/data/municipio339.ts`, `src/data/contactos.ts`, `src/data/feriados.ts`
- `export const EMPRESAS: Record<EmpresaId, Empresa>`
- `export const SERVICIOS_MUNICIPIO_339: Servicio[]` — transcripción EXACTA del PDF (3 tablas × 2 sentidos) con `paradas`, `fuente: 'municipio'`, `dias` según tabla (L‑V: feriados=false; Sáb; Dom y Feriados: dom=true, feriados=true). Si un mismo horario está en varias tablas, un solo Servicio con los días combinados.
- `export const CONTACTOS: Contacto[]`
- `export const FERIADOS_INCLUIDOS: Feriado[]` (2026 completo de ArgentinaDatos; 2027 si la API lo tiene)

### Agente MOTOR (Opus) — `src/lib/schedule.ts`, `src/lib/terminal-parser.ts`, `src/lib/merge.ts`, `src/data/index.ts`, `src/lib/*.test.ts`
- `terminal-parser.ts`: `parseResultados(html: string, direccion: Direccion): Servicio[]` (portar de `tools/scrape-terminal.mjs`, mapear nombre → EmpresaId, id estable) y `snapshotAServicios(json): Servicio[]`.
- `merge.ts`: `construirServicios(terminal: Servicio[], municipio: Servicio[]): Servicio[]` — 33/9: prevalece municipio (tiene paradas y es más nuevo); servicios 33/9 de la terminal que no coinciden se conservan (variantes). Dedupe por dirección+empresa+sale. `detectarCambios(antes: Servicio[], despues: Servicio[]): { agregados: Servicio[]; quitados: Servicio[]; modificados: Servicio[] }`.
- `schedule.ts`: `fechaISO`, `horaAMinutos`, `tipoDeDia(fecha, feriados)`, `corre(servicio, fecha, feriados)` (en feriado corre sii `dias.feriados`), `serviciosDelDia(servicios, dir, fecha, feriados)`, `proximasSalidas(servicios, dir, ahora, feriados, n = 10, empresas?)` (cruza a días siguientes, maneja llegada después de medianoche), `proximaSalidaDeServicio(servicio, ahora, feriados)`, `resumenDia(...)`, `diasTexto(dias)` ("Todos los días", "Lun a Vie", "Sáb, Dom y feriados", …), `formatearEspera(min)` ("ahora", "en 5 min", "en 1 h 20 min"), `generarICS(salida)`.
- `data/index.ts`: `SERVICIOS_INCLUIDOS`, `SNAPSHOT_FECHA`, re‑exporta EMPRESAS, CONTACTOS, FERIADOS_INCLUIDOS.
- Tests con vitest (`npm run test`).

### Agente SERVICIOS (Sonnet) — `src/services/*`, `capacitor.config.ts`, `vite.config.ts`, `public/*`, `assets/*`, `android/`, `ios/`
- `storage.ts` (Preferences): `cargar<T>(clave, def)`, `guardar(clave, valor)`.
- `feriados.ts`: `obtenerFeriados(): Promise<Feriado[]>` (API + cache + fallback).
- `liveTerminal.ts`: `actualizarDesdeTerminal(): Promise<Servicio[] | null>` (solo nativo; en web → null).
- `noticias.ts`: `buscarAlertasParo(): Promise<Alerta[]>`.
- `clima.ts`: `climaActual(ciudad: 'Rosario' | 'Casilda')`.
- `notifications.ts`: `pedirPermisoNotificaciones()`, `programarRecordatorios(favoritos, servicios)`, `notificarAlerta(alerta)`.
- `sync.ts`: `sincronizar(): Promise<ResultadoSync>` que orquesta todo, guarda cache, detecta cambios y notifica alertas nuevas (sin repetir).
- Capacitor (appId `ar.unidadveterinaria.casildabus`, nombre "Casilda Bus", CapacitorHttp habilitado, cleartext para terminalrosario.gob.ar), PWA (vite‑plugin‑pwa), ícono y splash, `npx cap add android` / `ios`.

### Agente UI (Opus) — `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/App.css`, `src/state/*`, `src/screens/*`, `src/components/*`, `index.html`
- Estado global en `src/state/` (contexto React) consumiendo las firmas de arriba.
- Diseño premium, mobile‑first, safe‑areas, claro/oscuro, tabs inferiores (Inicio · Horarios · Favoritos · Alertas · Más), sin librerías de UI, íconos SVG inline, fuente del sistema, offline.

### Integración, build e instalación — agente principal.
