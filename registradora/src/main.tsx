/**
 * Punto de entrada: aplica el tema, decide la pantalla inicial y dibuja la app.
 */
import { render } from 'preact';
import { App } from './app';
import { aplicarTema, leerPantallaInicial, leerTema } from './ui/preferencias';
import './estilos.css';

aplicarTema(leerTema());

// En iPhone no existen los atajos del ícono; por eso puedes elegir en Ajustes
// que la app abra directamente en "Agregar".
if ((window.location.hash === '' || window.location.hash === '#/') && leerPantallaInicial() === 'agregar') {
  window.location.replace('#/agregar');
}

render(<App />, document.getElementById('app')!);
