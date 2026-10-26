# FEAT-018 — El marco de la Bóveda: barra de arriba, ventanas, avisos y pie

- **Estado:** VALIDADO por Pablo (2026-10-26 05:43Z), en DEV. Cierra BL-070.
- **Fecha:** 2026-10-26 02:44Z (TOP-0 entregada) → 2026-10-26 05:31Z (TOP-6).
- **Backlog:** BL-070, paso 5 (el marco: barra de arriba, ventanas, avisos y pie).
- **Propuesta:** `docs/propuestas/propuesta-barra-bl070.html` (031efd9), aprobada con D1 a D8 (2026-10-26 02:54Z).
- **Producción:** no. La promoción la decide Pablo.

## Qué cambió para el usuario

- **Avisos** (TOP-1): cada tipo con su color y su ícono dibujado, sin emojis; los errores duran más y se anuncian como alerta. Las llamadas de siempre a `window.toast` no cambiaron.
- **Ventanas de la Bóveda** (TOP-2): renombrar o borrar una Key, restaurar una copia y liberar la caché ya no usan las ventanas del navegador (`prompt`, `confirm`, `alert`): usan la ventana común, con el theme, el teclado y el foco bien.
- **Una sola piel para las ventanas** (TOP-3): Keys, Guías, conversor y selector de themes se ven y se comportan igual: Escape cierra, Tab no se escapa, el foco entra y vuelve. Las Guías perdieron los `onmouseover` con color fijo; los 7 permisos de Keys son fichas en castellano llano.
- **Sin Gist** (TOP-4): se retiró la sincronización oculta que pedía un token de GitHub (`js/gist-sync.js`, su ventana, su script en línea y 3 tests). Nada visible cambia.
- **Barra de arriba** (TOP-5): tres zonas. A la izquierda, el logo (lleva a Inicio) con «Sitio de la comunidad · no oficial» y la marca DEV, que solo aparece en DEV. En el medio, la cuenta y Keys. A la derecha, Guías y los menús Enlaces y Ajustes, con teclado. Pasó de 14 controles a la vista a 6. En el celular entra en una fila, con «Opciones». La pestaña del navegador dice «sitio de la comunidad de Guild Wars 2 (no oficial)».
- **Pie** (TOP-6):
  - Quiénes somos, el distintivo «Link in Bio».
  - Dos columnas de atajos: La Bóveda (Inicio, Guías de uso, Gestión de Keys) y Guild Wars 2 (Wiki en español, Sitio oficial, Crear una API Key).
  - El aviso legal: «Sitio de la comunidad, no oficial…» y, tal cual lo publica ArenaNet en sus condiciones de uso de contenido, el aviso de copyright y marcas en inglés.
  - El distintivo conserva sus colores fijos (DEC-025). Su foto ahora se sirve desde `assets/brand/pablo-bio.svg` (2,7 KB) y ya no se pide a `raw.githubusercontent.com` en cada carga.

## Pasos

| Paso | Qué | Hecho | Validado | Evidencia |
|---|---|---|---|---|
| TOP-0 | Propuesta visual | 02:44Z | 02:54Z (D1 a D8) | `propuesta-barra-bl070.html` 031efd9, RUN-089 a 091 |
| TOP-1 | Tope del cargador a 40 y `js/gn-ui.js` (ventana común y avisos) | 03:12Z | 03:18Z | `js/gn-ui.js` 1.0.0, PATCH-144, RUN-093 |
| TOP-2 | Los diálogos del navegador a la ventana común | 03:35Z | 03:57Z | PATCH-147 (146 rechazado), RUN-094 a 097 |
| TOP-3 | Piel y conducta comunes en las 4 ventanas | 04:08Z | 04:14Z | `js/gn-ui.js` 1.1.0, PATCH-149, RUN-098 y 099 |
| TOP-4 | Retiro de Gist | 04:27Z | 04:45Z | PATCH-151, RUN-100 a 103 |
| TOP-5 | Barra de arriba nueva | 05:05Z | 05:21Z | `js/gn-topbar.js` 1.0.0, PATCH-153, RUN-104 a 106 |
| TOP-6 | Pie nuevo, revisión final y esta ficha | 05:31Z | 05:43Z | `js/gn-topbar.js` 1.1.0, `assets/brand/pablo-bio.svg`, PATCH-155 |

## TOP-6 en detalle

- `index.html` (48.223 B): el pie nuevo reemplaza al viejo (logo de 18 px, una línea y un distintivo con 1,1 KB de estilos en línea). Salen las 2 reglas del pie viejo del `<style>`.
- `js/gn-topbar.js` 1.1.0 (12.410 B): los estilos del pie y sus atajos. Los estilos van en el módulo porque `index.html` no puede pasar 48 KB, y el pie no se ve en el primer cuadro. «Guías de uso» y «Gestión de Keys» tocan los botones de siempre de la barra (`#guideLink`, `#keysMenuBtn`): la ventana abre igual que desde arriba y, al cerrarse, el foco vuelve al pie.
- `tests/gn-topbar.test.cjs`: 4 tests nuevos (12 en total), entre ellos el aviso de ArenaNet palabra por palabra, el distintivo y su foto, los estilos y los atajos con el pie real de `index.html` en un DOM mínimo. Mutaciones: 9 de 10 muertas; la viva es equivalente (la guarda `st.foot` ya impide enganchar el pie dos veces).
- `tests/index-identity.test.cjs`: los colores fijos del distintivo se buscan ahora en `js/gn-topbar.js`.
- PATCH-155 APLICADO con la suite verde antes y después. Probado antes en una copia local: 18 de 18.

## Revisión final del paso 5

| Eje | Qué medí | Hallazgo |
|---|---|---|
| 19 themes | Textos del pie y de la barra contra `--bg-0` | Correcto. Solo usan `--tx-1` y `--tx-2` sobre `--bg-0`, el mismo par que la barra validada. Medidos: notion 12,26:1 (el único claro), solarized-dark 12,25:1, gruvbox 10,75:1, glassmorphism 17,06:1. Distintivo: 13,26:1 y 6,72:1 |
| Teclado | Pie, barra, menús y ventanas | Correcto. El foco se ve en todo el pie (anillo `--acc-1`). Los atajos abren la ventana con el foco en el pie, que es adonde vuelve |
| Lector de pantalla | Pie | Correcto. Dos `nav` con nombre (La Bóveda, Guild Wars 2). El aviso en inglés lleva `lang="en"`. Los 4 enlaces externos avisan «se abre en otra pestaña». La foto es decorativa (`alt=""`): el nombre ya está en el texto |
| Celular | Pie | Correcto. Atajos de 44 px. El pie queda por encima de la barra fija de abajo (sidebar-nav ya reserva 68 px y la zona segura) |
| Tamaño | `index.html` | BAJO: 48.223 B, a 929 B del límite de 48 KB. Lo nuevo va a módulos por el manifiesto, como hasta ahora |
| Conducta | Carga | BAJO: antes de que cargue el módulo, el pie se ve un instante sin sus estilos. Está debajo del primer cuadro |

## Claves de almacenamiento

Ninguna nueva en TOP-6. Las de todo el paso 5 siguen igual: las claves `gn:github:*` quedan a propósito, porque DEV y producción comparten el origen del navegador.

## Cómo evaluarlo

1. En DEV, recargá con Ctrl+F5 en https://pablosnchz.github.io/gw2-factory-dev/ y bajá hasta el pie.
2. Revisá el aviso legal, el distintivo «Link in Bio» con tu foto y las dos columnas.
3. Tocá «Guías de uso» y «Gestión de Keys»: abren las ventanas de siempre; al cerrarlas, el foco vuelve al pie.
4. Con Tab, recorré el pie: el foco se tiene que ver en cada enlace.
5. Probalo en el celular: las columnas quedan de a dos y nada queda tapado por la barra de abajo.
6. Probalo con un theme claro (notion) y con uno oscuro.

## Riesgos y deudas

- **BAJO:** `index.html` está a 929 B de 48 KB.
- **BAJO:** `css/main.css` (congelado) conserva `.footer-inner` y `.footer-copy`, que ya no usa nadie. Salen cuando se achique `main.css`.
- **BAJO:** comentarios viejos que nombran Gist en `app.js`, `raid-tracker.js`, `acc-vault-edit.js` y `settings-manager.js`.
- **Pendiente (BL-071):** las guías de uso siguen viejas (Strike, Gist, sin Llavero).
- **Pendiente para la promoción:** las claves `gn:github:*` y `accounts:lastFile`.
