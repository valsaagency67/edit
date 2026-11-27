/**
 * Service worker de Registradora (plantilla).
 *
 * Qué hace, en simple:
 * 1. La primera vez que abres la app, guarda en el celular una copia de todos
 *    sus archivos (no tus datos: los datos van aparte, en IndexedDB).
 * 2. Las siguientes veces abre esa copia al instante, con o sin internet.
 * 3. Cuando publicamos una versión nueva, la descarga en segundo plano y avisa
 *    a la app para que puedas recargar.
 *
 * Al construir, Vite reemplaza las marcas de versión y archivos (ver vite.config.ts).
 */
const VERSION = '@@VERSION@@';
const CACHE = `registradora-${VERSION}`;
const ARCHIVOS = /* @@ARCHIVOS@@ */ [];

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARCHIVOS)));
});

self.addEventListener('activate', (evento) => {
  // Borra las copias de versiones anteriores.
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(
          nombres.filter((n) => n.startsWith('registradora-') && n !== CACHE).map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// La app pide "actualizar ya" cuando tocas el aviso de nueva versión.
self.addEventListener('message', (evento) => {
  if (evento.data === 'actualizar') self.skipWaiting();
});

self.addEventListener('fetch', (evento) => {
  const solicitud = evento.request;
  if (solicitud.method !== 'GET' || new URL(solicitud.url).origin !== self.location.origin) return;

  // Abrir la app (navegación): siempre la página principal guardada.
  if (solicitud.mode === 'navigate') {
    evento.respondWith(caches.match('./', { ignoreVary: true }).then((r) => r || fetch(solicitud)));
    return;
  }

  // Demás archivos: primero la copia guardada; si no está, internet.
  // Buscamos solo por la dirección (ignoreVary): algunos servidores mandan
  // encabezados "Vary" que harían fallar la búsqueda sin internet.
  evento.respondWith(caches.match(solicitud.url, { ignoreVary: true }).then((r) => r || fetch(solicitud)));
});
