// Service worker de los avisos de Instagram (Web Push de Firebase Cloud Messaging).
// Registrado con scope ./avisos-push/ para no pisar el service worker de la PWA.
// El servidor manda mensajes solo de datos: { titulo, cuerpo, link, imagen }.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    const payload = event.data ? event.data.json() : {};
    data = payload.data || payload;
  } catch {
    // Mensaje sin JSON: se muestra igual un aviso genérico.
  }
  const titulo = data.titulo || 'Unidad Veterinaria';
  const opciones = {
    body: data.cuerpo || 'Nueva publicación en Instagram',
    icon: new URL('../pwa-192.png', self.registration.scope).href,
    badge: new URL('../favicon.png', self.registration.scope).href,
    image: data.imagen || undefined,
    tag: data.posteoId ? `ig-${data.posteoId}` : undefined,
    data: { link: data.link },
  };
  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data && event.notification.data.link;
  const destino = typeof link === 'string' && /^https?:\/\//.test(link) ? link : new URL('../', self.registration.scope).href;
  event.waitUntil(self.clients.openWindow(destino));
});
