# FEAT-017 — Cuentas renovada: Mis cuentas en vivo y el Llavero con cifrado nuevo

- **Estado:** HECHO en DEV (2026-10-26 02:13Z). Espera la validación de Pablo del paso 4 completo.
- **Fecha:** 2026-10-25 23:22Z (CTA-0 entregada) → 2026-10-26 02:13Z (CTA-5).
- **Backlog:** BL-070, paso 4 (Cuentas).
- **Propuesta:** `docs/propuestas/propuesta-cuentas-bl070.html` (61a17a4), aprobada con D1 a D7 (2026-10-25 23:47Z) y 3 pedidos de Pablo: no perder ningún dato que existe hoy, tarjetas iconográficas y etiquetas con colores.
- **Producción:** no. La promoción la decide Pablo.

## Qué cambió para el usuario

- **Cuentas** (`#/account/accounts`): un solo contenedor con el degradado del módulo, cabecera con 4 indicadores y dos pestañas: **Mis cuentas** y **Llavero**.
- **Mis cuentas** (en vivo, desde la API con cada Key guardada):
  - Una tarjeta por cuenta, ordenadas main, alter, f2p y sin tipo, con filtro por tipo y búsqueda sin tildes.
  - **Solo las expansiones que tenés**, con su ícono en color; si no la tenés, no aparece (pedido de Pablo). Visions of Eternity se detecta por la maestría, porque la API no la informa en `access` (gw2-api #118).
  - **Un ícono por dato:** puntos de logro (los mismos que el juego, confirmado por Pablo), legendarias, fractales, McM, JcJ con su tramo, comandante y clan.
  - **Etiquetas con color** por tipo (main, alter, f2p) y las del Llavero cuando está abierto.
  - «Usar esta» cambia la cuenta activa con el selector de arriba. Estados honestos: «Sin permiso», «Sin datos» o Key muerta; nunca un 0 inventado. La Key nunca se muestra ni se guarda en lo leído.
- **Llavero** (las contraseñas):
  - Abre **tu archivo `.enc` de siempre** sin CryptoJS. Se probó con un archivo real hecho con CryptoJS 4.2.0 (RUN-079). Conserva **todos** los campos: contraseña de la cuenta, Gmail, Twitch (usuario, correo y contraseña), GeForce, notas, etiquetas, Key, y también los que no conozco.
  - Todo enmascarado: «Ver» muestra un dato 20 s, «Copiar» vacía el portapapeles a los 30 s. Se cierra a los 5 minutos sin uso, al salir de Cuentas y con «Cerrar ya».
  - **Editar, agregar y borrar** (con confirmación). Con cambios sin guardar no se cierra a los 5 minutos ni al salir; se cierra a los 15 y el navegador avisa.
  - **Guardar** baja `«nombre»-v2.enc` con el cifrado nuevo (PBKDF2 con 600.000 iteraciones + AES-GCM, contraseña de 8 caracteres o más) y verifica que abre igual antes de bajarlo. Tu archivo viejo no se toca.
  - **Importar desde Excel** con las columnas de la plantilla de siempre. Abre el Llavero sin guardar y se guarda solo cifrado: nada queda en claro, ni en disco ni en el navegador.
  - **Crear Llavero nuevo** desde cero.
  - Con el Llavero abierto, la cuenta que no tiene Key aparece en Mis cuentas como tarjeta gris (D7).

## Pasos

| Paso | Qué | Hecho | Validado | Evidencia |
|---|---|---|---|---|
| CTA-0 | Propuesta visual | 2026-10-25 23:22Z | 23:47Z (D1 a D7) | `propuesta-cuentas-bl070.html` 61a17a4 |
| CTA-1 | Datos verificados y modelo | 00:08Z | 00:21Z | `assets/data/accounts/catalog.json` 325f406, `js/acc-model.js` 1.0.0, RUN-075 |
| CTA-2 | Mis cuentas en vivo | 00:40Z | 00:51Z | `js/acc-view.js` 1.0.0, PATCH-130, RUN-076 |
| CTA-3 | Llavero: abrir el `.enc` viejo | 01:15Z | 01:15Z | `js/acc-vault.js` 1.0.0, `js/acc-vault-view.js` 1.0.0, PATCH-132, RUN-079 y 080 |
| CTA-4a | Editar, agregar, borrar y guardar v2 | 01:35Z | 01:41Z | `js/acc-vault-edit.js` 1.0.0, PATCH-134, RUN-081 |
| CTA-4b | Importar desde Excel | 01:55Z | 02:01Z | `js/acc-vault-edit.js` 1.1.0, PATCH-137 (PATCH-136 rechazado), RUN-082 |
| CTA-5 | Retiro del panel viejo, revisión final y esta ficha | 02:13Z | — | PATCH-139, 140 y 141, RUN-087 y 088 |

## Lo que se retiró (CTA-4b y CTA-5)

- `js/accounts-panel.js` (67.648 bytes): el panel viejo, con el asistente de 4 archivos que bajaba un JSON en claro y el cifrado de CryptoJS (MD5, 1 iteración).
- `tests/hb80-clic-cuenta.test.js`, que solo probaba ese panel. Otros 5 tests (idea55, idea61, idea64, hb111 y acc-vault-view) ya no lo leen.
- `index.html` (54.909 bytes) sin su script y `js/router.js` (63.097 bytes) sin los dos `Accounts.activate`. `tools/size-budget.json` sin su entrada y con los techos de los dos archivos más bajos.
- «Mostrar el panel anterior» del Llavero (acc-vault-view 1.2.0).
- `js/acc-vault-import.js` no llegó a cargarse: se fusionó en `acc-vault-edit.js` 1.1.0 porque `js/boot.js` carga como máximo 30 módulos.

## Revisión final (CTA-5)

| Eje | Qué medí | Hallazgo | Arreglo |
|---|---|---|---|
| 19 themes | Cada texto de Mis cuentas y del Llavero contra sus superficies | Correcto: 4.5:1 en los 19 (acc-view y acc-vault-view, RUN-088) | — |
| Teclado | Pestañas, botones y selectores de archivo | MEDIO: «Elegir archivo» e «Importar desde Excel» son inputs invisibles y el foco no se veía | acc-vault-view 1.2.1: anillo de foco en la etiqueta (PATCH-141) |
| Lector de pantalla | Estados, avisos e imágenes | Correcto: regiones `aria-live` o `role="status"` en las 3 vistas; 16 imágenes, 0 sin `alt` | — |
| Celular | Objetivos táctiles | BAJO: la contraseña del Llavero medía 32 px | acc-vault-view 1.2.1: 44 px (PATCH-141) |
| Movimiento reducido | `prefers-reduced-motion` | Correcto: acc-view lo respeta; el Llavero no tiene animaciones | — |
| Almacenamiento | Claves, Key y secretos | Correcto: ningún archivo nuevo toca `localStorage` directo; la Key no se guarda en lo leído; los secretos solo viven descifrados en memoria y se borran al cerrar | — |
| Cifrado | Archivo viejo y nuevo | Correcto: el `.enc` de CryptoJS 4.2.0 abre entero; el v2 hace ida y vuelta y detecta cambios y contraseña mala | — |

RUN-088: 8 archivos y 59 tests verdes (acc-vault-view 8, acc-view 13, acc-vault-edit 8, acc-vault-import 5, acc-vault 6, boot 7, size-budget 6 e index-identity 6).

## Claves de almacenamiento

- Nuevas: `gn:accounts:cards` (lo leído de cada cuenta, 6 h, sin la Key), `gn:accounts:achmeta` (definiciones de logros, 7 días) y `accounts:vault2` (la copia cifrada nueva, fuera de `gn:` para que no viaje en el respaldo).
- **Se conserva** `accounts:lastFile` (la copia vieja): DEV y producción comparten el origen del navegador, así que borrarla en DEV le borraría la copia a producción. Se borra cuando Pablo promueva Cuentas.

## Cómo evaluarlo

1. En DEV, recargá con Ctrl+F5 y abrí https://pablosnchz.github.io/gw2-factory-dev/#/account/accounts.
2. En Mis cuentas, revisá las tarjetas: expansiones, íconos, etiquetas y «Usar esta».
3. En Llavero, abrí tu `.enc`, editá algo, guardá el `-v2.enc` y abrilo de nuevo. Con Tab, fijate que el foco se vea en «Elegir archivo» e «Importar desde Excel».
4. Repetilo en el celular.

## Riesgos y deudas

- **MEDIO:** el manifiesto está en 30/30 módulos, el tope de `js/boot.js`. Cualquier módulo nuevo del paso 5 pide subir el tope o fusionar módulos.
- **BAJO:** el panel viejo pasaba las etiquetas main, alter y f2p a las etiquetas de la Key. Eso ya no pasa; Mis cuentas usa las etiquetas del Llavero.
- **BAJO:** `acc-view.js` conserva una nota de respaldo («Este es el Llavero de siempre…») para cuando falta `AccVaultView`. En la práctica no se ve nunca; un test la usa. Sale en el próximo cambio de `acc-view.js`.
- **BAJO:** comentarios en `js/app.js`, `js/wallet-dashboard.js` y `js/achievements.js` todavía nombran `accounts-panel.js`. Solo comentarios; se corrigen cuando se toquen esos archivos.
- **Pendiente para la promoción:** borrar `accounts:lastFile`.
