/**
 * Estructura general: contenido de la pantalla actual + barra inferior.
 * La barra va abajo para alcanzarla con el pulgar usando una sola mano.
 */
import { useEffect, useState } from 'preact/hooks';
import { irA, useRuta, type Ruta } from './ui/ruta';
import { registrarModoSinInternet } from './ui/sistema';
import { Inicio } from './pantallas/Inicio';
import { Agregar } from './pantallas/Agregar';
import { Ajustes } from './pantallas/Ajustes';

export function App() {
  const ruta = useRuta();
  const [aplicarActualizacion, setAplicarActualizacion] = useState<(() => void) | null>(null);

  useEffect(() => {
    registrarModoSinInternet((aplicar) => setAplicarActualizacion(() => aplicar));
  }, []);

  return (
    <div class="marco">
      {aplicarActualizacion && (
        <button class="aviso-actualizacion" onClick={aplicarActualizacion}>
          Hay una versión nueva. Toca para actualizar.
        </button>
      )}

      <main class="contenido">
        {ruta === 'inicio' && <Inicio />}
        {ruta === 'agregar' && <Agregar />}
        {ruta === 'ajustes' && <Ajustes />}
      </main>

      <BarraInferior ruta={ruta} />
    </div>
  );
}

function BarraInferior({ ruta }: { ruta: Ruta }) {
  return (
    <nav class="barra" aria-label="Navegación principal">
      <button class={`barra-item ${ruta === 'inicio' ? 'activo' : ''}`} onClick={() => irA('inicio')}>
        <span aria-hidden="true">⌂</span>
        Inicio
      </button>
      <button class="barra-agregar" onClick={() => irA('agregar')} aria-label="Agregar movimiento">
        +
      </button>
      <button class={`barra-item ${ruta === 'ajustes' ? 'activo' : ''}`} onClick={() => irA('ajustes')}>
        <span aria-hidden="true">⚙</span>
        Ajustes
      </button>
    </nav>
  );
}
