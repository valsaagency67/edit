import { describe, expect, it } from 'vitest';
import { rutaDesdeHash } from './ruta';

describe('rutaDesdeHash', () => {
  it('reconoce las pantallas', () => {
    expect(rutaDesdeHash('#/agregar')).toBe('agregar');
    expect(rutaDesdeHash('#/ajustes')).toBe('ajustes');
  });

  it('va a Inicio si la dirección está vacía o no existe', () => {
    expect(rutaDesdeHash('')).toBe('inicio');
    expect(rutaDesdeHash('#/')).toBe('inicio');
    expect(rutaDesdeHash('#/no-existe')).toBe('inicio');
  });

  it('ignora parámetros extra (para el atajo de Android y futuros enlaces)', () => {
    expect(rutaDesdeHash('#/agregar?tipo=gasto')).toBe('agregar');
  });
});
