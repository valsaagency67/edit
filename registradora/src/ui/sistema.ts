/**
 * Conexión con el celular: instalación, modo sin internet y almacenamiento.
 */

/** ¿La app se abrió desde el ícono de la pantalla de inicio (instalada)? */
export function estaInstalada(): boolean {
  const iphone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iphone || window.matchMedia('(display-mode: standalone)').matches;
}

/** ¿Es un iPhone o iPad? (para mostrar las instrucciones correctas). */
export function esIOS(): boolean {
  const ua = navigator.userAgent;
  // Los iPad modernos se presentan como "Macintosh" pero tienen pantalla táctil.
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

/**
 * Registra el service worker (lo que permite abrir sin internet).
 * `alHaberActualizacion` se llama cuando ya se descargó una versión nueva.
 */
export function registrarModoSinInternet(alHaberActualizacion: (aplicar: () => void) => void): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;

  navigator.serviceWorker.register('./sw.js').then((registro) => {
    const avisar = (trabajador: ServiceWorker) =>
      alHaberActualizacion(() => trabajador.postMessage('actualizar'));

    // Ya había una versión nueva esperando.
    if (registro.waiting && navigator.serviceWorker.controller) avisar(registro.waiting);

    registro.addEventListener('updatefound', () => {
      const nuevo = registro.installing;
      nuevo?.addEventListener('statechange', () => {
        // Solo avisamos si ya había una versión anterior funcionando.
        if (nuevo.state === 'installed' && navigator.serviceWorker.controller) avisar(nuevo);
      });
    });
  });

  // Cuando una versión nueva toma el control, recargamos una sola vez.
  // En la primera visita no había versión anterior: ahí no hace falta recargar.
  const habiaVersionAnterior = navigator.serviceWorker.controller !== null;
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando || !habiaVersionAnterior) return;
    recargando = true;
    window.location.reload();
  });
}

/** ¿El modo sin internet ya está activo en este celular? */
export function modoSinInternetActivo(): boolean {
  return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
}

/**
 * Pide al navegador que NO borre los datos de la app para liberar espacio.
 * Devuelve true si quedó protegido. Si no, igual funcionan los respaldos.
 */
export async function pedirAlmacenamientoPersistente(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
