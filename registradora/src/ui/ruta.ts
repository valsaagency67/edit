/**
 * Navegación mínima entre pantallas usando la parte "#/..." de la dirección.
 *
 * Por qué "#": funciona en GitHub Pages y sin internet sin configurar nada en
 * un servidor. Ejemplo: .../registradora/#/agregar abre la pantalla Agregar.
 */
import { useEffect, useState } from 'preact/hooks';

export type Ruta = 'inicio' | 'agregar' | 'ajustes';

const RUTAS: Ruta[] = ['inicio', 'agregar', 'ajustes'];

export function rutaDesdeHash(hash: string): Ruta {
  const nombre = hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  return (RUTAS as string[]).includes(nombre) ? (nombre as Ruta) : 'inicio';
}

export function irA(ruta: Ruta): void {
  window.location.hash = ruta === 'inicio' ? '#/' : `#/${ruta}`;
}

/** Hook: devuelve la pantalla actual y se actualiza al navegar. */
export function useRuta(): Ruta {
  const [ruta, setRuta] = useState<Ruta>(() => rutaDesdeHash(window.location.hash));
  useEffect(() => {
    const alCambiar = () => {
      setRuta(rutaDesdeHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  return ruta;
}
