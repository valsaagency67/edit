/**
 * Preferencias pequeñas de la pantalla (tema, pantalla de inicio).
 *
 * Se guardan en localStorage porque son comodidades: si se pierden, no pasa
 * nada grave. Tus movimientos y saldos NO van aquí; van en IndexedDB (etapa 1),
 * que es más robusto y entra en los respaldos.
 */

export type Tema = 'sistema' | 'claro' | 'oscuro';
export type PantallaInicial = 'inicio' | 'agregar';

const CLAVE_TEMA = 'registradora.tema';
const CLAVE_INICIAL = 'registradora.pantallaInicial';

// Safari en modo privado puede lanzar error al usar localStorage: por eso
// cada lectura/escritura va protegida y tiene un valor por defecto.
function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string): void {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento: la preferencia dura solo esta sesión */
  }
}

export function leerTema(): Tema {
  const v = leer(CLAVE_TEMA);
  return v === 'claro' || v === 'oscuro' ? v : 'sistema';
}

/** Guarda el tema y lo aplica de inmediato a toda la app. */
export function guardarTema(tema: Tema): void {
  escribir(CLAVE_TEMA, tema);
  aplicarTema(tema);
}

/** "sistema" sigue el modo claro/oscuro del celular; los otros lo fuerzan. */
export function aplicarTema(tema: Tema): void {
  const raiz = document.documentElement;
  if (tema === 'sistema') delete raiz.dataset.tema;
  else raiz.dataset.tema = tema;
}

export function leerPantallaInicial(): PantallaInicial {
  return leer(CLAVE_INICIAL) === 'agregar' ? 'agregar' : 'inicio';
}

export function guardarPantallaInicial(p: PantallaInicial): void {
  escribir(CLAVE_INICIAL, p);
}
