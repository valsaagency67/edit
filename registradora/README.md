# Registradora

Finanzas personales para independientes: registra en segundos lo que entra y sale,
mira tus saldos, controla deudas y cobros, y proyecta tus próximos meses.

- **Tus datos se quedan en tu celular.** No hay servidor, cuentas de usuario ni
  conexión con bancos. Nunca pide usuario ni clave del banco.
- **Funciona sin internet** y se instala en la pantalla de inicio (iPhone y Android).
- **Dinero siempre en pesos enteros** (sin decimales).

## Instalar en el celular

**iPhone (Safari):** abre la dirección de la app → botón **Compartir** (↑) →
**Agregar a inicio**. Usa siempre el ícono: en iPhone la app instalada y Safari
guardan los datos por separado.

**Android (Chrome):** menú **⋮** → **Instalar app**. Mantén presionado el ícono
para el atajo **Agregar gasto**.

## Cómo está hecho

| Parte | Qué es | Dónde |
|---|---|---|
| Reglas del dinero | Cálculos puros, con pruebas | `src/dominio/` |
| Pantallas | Preact (versión liviana de React) | `src/pantallas/`, `src/app.tsx` |
| Modo sin internet | Service worker | `src/sw-plantilla.js` |
| Publicación | GitHub Actions → GitHub Pages | `.github/workflows/publicar.yml` |

## Para desarrolladores

```bash
npm install
npm test        # pruebas automáticas
npm run dev     # servidor local
npm run build   # versión final en dist/
```

## Estado

- [x] Etapa 0: base instalable, sin internet, tema claro/oscuro
- [ ] Etapa 1: cuentas, movimientos y calculadora
- [ ] Etapa 2: respaldo JSON y exportar CSV
- [ ] Etapa 3: transferencias y tarjeta de crédito
- [ ] Etapas 4–10: resumen, programados, créditos, clientes, proyección, metas, Excel
