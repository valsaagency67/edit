/**
 * Reglas básicas del dinero en Registradora.
 *
 * REGLA DE ORO: el dinero SIEMPRE es un número entero de pesos.
 * Nunca guardamos 1500.5; guardamos 1501 o 1500 según la regla de redondeo.
 * Así evitamos los errores de los decimales en computación (0.1 + 0.2 ≠ 0.3).
 */

/** Un monto en pesos: número entero (puede ser negativo, p. ej. una deuda). */
export type Pesos = number;

/** Devuelve true si el valor es un monto válido (entero y seguro de operar). */
export function esPesosValido(valor: unknown): valor is Pesos {
  return typeof valor === 'number' && Number.isSafeInteger(valor);
}

/**
 * Convierte cualquier número a pesos enteros.
 * Redondeo "comercial": 0,5 o más sube; menos de 0,5 baja. Los negativos se
 * redondean de forma simétrica (-2,5 → -3), para que una deuda y su pago
 * redondeen igual.
 */
export function aPesos(valor: number): Pesos {
  if (!Number.isFinite(valor)) throw new Error('Monto inválido');
  const redondeado = Math.sign(valor) * Math.round(Math.abs(valor));
  return redondeado === 0 ? 0 : redondeado; // evita el "-0"
}

// Formateador de pesos colombianos: $ 1.234.567 (punto para miles, sin decimales).
const formato = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Muestra un monto como texto: 1234567 → "$ 1.234.567". */
export function formatearPesos(valor: Pesos): string {
  // Intl usa un espacio especial (no separable); lo cambiamos por uno normal
  // para que el texto sea predecible en pruebas y al copiar/pegar.
  return formato.format(valor).replace(/\s/g, ' ');
}
