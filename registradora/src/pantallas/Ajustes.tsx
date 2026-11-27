/**
 * Ajustes: tema, pantalla al abrir y estado técnico de la app
 * (para comprobar en el celular que todo quedó bien instalado).
 */
import { useEffect, useState } from 'preact/hooks';
import {
  guardarPantallaInicial,
  guardarTema,
  leerPantallaInicial,
  leerTema,
  type PantallaInicial,
  type Tema,
} from '../ui/preferencias';
import { estaInstalada, modoSinInternetActivo, pedirAlmacenamientoPersistente } from '../ui/sistema';

declare const __VERSION_APP__: string;

export function Ajustes() {
  const [tema, setTema] = useState<Tema>(leerTema);
  const [inicial, setInicial] = useState<PantallaInicial>(leerPantallaInicial);
  const [persistente, setPersistente] = useState<boolean | null>(null);

  useEffect(() => {
    pedirAlmacenamientoPersistente().then(setPersistente);
  }, []);

  return (
    <>
      <header class="encabezado">
        <h1>Ajustes</h1>
      </header>

      <section class="tarjeta">
        <p class="etiqueta">Tema</p>
        <Selector
          opciones={[
            ['sistema', 'Automático'],
            ['claro', 'Claro'],
            ['oscuro', 'Oscuro'],
          ]}
          valor={tema}
          alCambiar={(t) => {
            setTema(t);
            guardarTema(t);
          }}
        />
      </section>

      <section class="tarjeta">
        <p class="etiqueta">Al abrir la app, ir a</p>
        <Selector
          opciones={[
            ['inicio', 'Inicio'],
            ['agregar', 'Agregar'],
          ]}
          valor={inicial}
          alCambiar={(p) => {
            setInicial(p);
            guardarPantallaInicial(p);
          }}
        />
        <p class="nota">Útil en iPhone, donde el ícono no tiene atajos.</p>
      </section>

      <section class="tarjeta">
        <p class="etiqueta">Estado</p>
        <ul class="estado">
          <Estado ok={estaInstalada()} si="Instalada en la pantalla de inicio" no="Abierta en el navegador (no instalada)" />
          <Estado ok={modoSinInternetActivo()} si="Funciona sin internet" no="Modo sin internet: se activa al recargar" />
          <Estado
            ok={persistente}
            si="Datos protegidos contra borrado automático"
            no="Datos sin protección especial (usa respaldos)"
          />
        </ul>
        <p class="nota">Versión {__VERSION_APP__}</p>
      </section>
    </>
  );
}

function Estado({ ok, si, no }: { ok: boolean | null; si: string; no: string }) {
  if (ok === null) return <li>… comprobando</li>;
  return (
    <li class={ok ? 'ok' : 'pendiente'}>
      <span aria-hidden="true">{ok ? '✓' : '•'}</span> {ok ? si : no}
    </li>
  );
}

/** Botones tipo "segmentos" grandes, fáciles de tocar con el pulgar. */
function Selector<T extends string>({
  opciones,
  valor,
  alCambiar,
}: {
  opciones: [T, string][];
  valor: T;
  alCambiar: (v: T) => void;
}) {
  return (
    <div class="selector" role="radiogroup">
      {opciones.map(([v, texto]) => (
        <button role="radio" aria-checked={v === valor} class={v === valor ? 'elegido' : ''} onClick={() => alCambiar(v)}>
          {texto}
        </button>
      ))}
    </div>
  );
}
