/**
 * Pantalla "Agregar movimiento". En la etapa 0 es solo un adelanto visual;
 * la calculadora y el guardado llegan en la etapa 1.
 */
import { formatearPesos } from '../dominio/dinero';

export function Agregar() {
  return (
    <>
      <header class="encabezado">
        <h1>Agregar</h1>
      </header>

      <section class="tarjeta">
        <p class="etiqueta">Monto</p>
        <p class="cifra-grande">{formatearPesos(0)}</p>
        <p class="nota">
          Próxima etapa: calculadora (por ejemplo <code>181.538+214.843+50k</code>), tipo, cuenta,
          categoría, nota y fecha.
        </p>
      </section>
    </>
  );
}
