import { describe, expect, it } from 'vitest';
import { aPesos, esPesosValido, formatearPesos } from './dinero';

describe('formatearPesos', () => {
  it('usa punto para miles y no muestra decimales', () => {
    expect(formatearPesos(1234567)).toBe('$ 1.234.567');
    expect(formatearPesos(0)).toBe('$ 0');
  });

  it('muestra los negativos (deudas) con signo menos', () => {
    expect(formatearPesos(-500000)).toBe('-$ 500.000');
  });
});

describe('aPesos', () => {
  it('redondea al peso más cercano', () => {
    expect(aPesos(1500.4)).toBe(1500);
    expect(aPesos(1500.5)).toBe(1501);
  });

  it('redondea los negativos igual que los positivos', () => {
    expect(aPesos(-1500.5)).toBe(-1501);
    expect(aPesos(-0.2)).toBe(0);
  });

  it('rechaza valores que no son números', () => {
    expect(() => aPesos(Number.NaN)).toThrow();
    expect(() => aPesos(Infinity)).toThrow();
  });
});

describe('esPesosValido', () => {
  it('solo acepta enteros', () => {
    expect(esPesosValido(100)).toBe(true);
    expect(esPesosValido(100.5)).toBe(false);
    expect(esPesosValido('100')).toBe(false);
  });
});
