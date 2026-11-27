/**
 * Configuración de construcción (Vite).
 *
 * - `base: './'` hace que la app funcione en cualquier carpeta, por ejemplo
 *   https://usuario.github.io/registradora/
 * - El plugin `servicioSinInternet` genera `sw.js` (el "service worker") con la
 *   lista exacta de archivos de esta versión, para que la app abra sin internet
 *   desde la primera visita.
 */
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

function servicioSinInternet(): Plugin {
  return {
    name: 'registradora-sw',
    apply: 'build',
    generateBundle(_opciones, paquete) {
      // Archivos generados por Vite (JS, CSS) + los de la carpeta public.
      const generados = Object.keys(paquete);
      const publicos = [
        'manifest.webmanifest',
        'iconos/icono.svg',
        'iconos/icono-192.png',
        'iconos/icono-512.png',
        'iconos/apple-touch-icon.png',
      ];
      const archivos = ['./', ...generados, ...publicos];

      // La versión cambia cada vez que cambia algún archivo: así el celular
      // sabe que hay una actualización.
      const version = createHash('sha256').update(generados.sort().join('|')).digest('hex').slice(0, 10);

      const plantilla = readFileSync(new URL('./src/sw-plantilla.js', import.meta.url), 'utf8');
      const codigo = plantilla
        .replace('@@VERSION@@', version)
        .replace('/* @@ARCHIVOS@@ */ []', JSON.stringify(archivos, null, 2));

      this.emitFile({ type: 'asset', fileName: 'sw.js', source: codigo });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [preact(), servicioSinInternet()],
  define: {
    __VERSION_APP__: JSON.stringify(process.env.npm_package_version ?? 'dev'),
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
