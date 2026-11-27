/**
 * Pantalla de inicio. En la etapa 0 solo muestra la estructura; los saldos
 * reales llegan en la etapa 1.
 */
import { formatearPesos } from '../dominio/dinero';
import { esIOS, estaInstalada } from '../ui/sistema';

export function Inicio() {
  return (
    <>
      <header class="encabezado">
        <h1>Registradora</h1>
      </header>

      {!estaInstalada() && <ComoInstalar />}

      <section class="tarjeta">
        <p class="etiqueta">Disponible</p>
        <p class="cifra-grande">{formatearPesos(0)}</p>
        <p class="nota">Aquí verás la suma de tus cuentas (Nu, Nequi, efectivo…).</p>
      </section>

      <section class="tarjeta vacia">
        <p>Aún no tienes cuentas.</p>
        <p class="nota">Próxima etapa: crear cuentas y registrar movimientos.</p>
      </section>
    </>
  );
}

/** Instrucciones para instalar, según el celular. */
function ComoInstalar() {
  return (
    <section class="tarjeta destacada">
      <p class="etiqueta">Instala la app</p>
      {esIOS() ? (
        <ol class="pasos">
          <li>
            Abre esta página en <b>Safari</b>.
          </li>
          <li>
            Toca <b>Compartir</b> (el cuadro con la flecha ↑).
          </li>
          <li>
            Elige <b>Agregar a inicio</b> y luego <b>Agregar</b>.
          </li>
          <li>
            Usa siempre el ícono <b>Registradora</b>: en iPhone, la app instalada y Safari guardan
            datos por separado.
          </li>
        </ol>
      ) : (
        <ol class="pasos">
          <li>
            Abre el menú <b>⋮</b> de Chrome.
          </li>
          <li>
            Toca <b>Instalar app</b> (o <b>Agregar a pantalla principal</b>).
          </li>
          <li>
            Mantén presionado el ícono para ver el atajo <b>Agregar gasto</b>.
          </li>
        </ol>
      )}
    </section>
  );
}
