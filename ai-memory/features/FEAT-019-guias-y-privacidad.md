# FEAT-019 — Guías de uso y privacidad al día

- **Estado:** VALIDADO por Pablo (2026-10-26 14:49Z), en DEV. Cierra BL-071.
- **Fecha:** 2026-10-26 05:59Z (GUI-0 entregada) → 2026-10-26 13:50Z (GUI-5).
- **Backlog:** BL-071 (guías de uso y privacidad al día).
- **Propuesta:** `docs/propuestas/propuesta-guias-bl071.html` (b71dc58), aprobada con D1 a D6 (2026-10-26 06:33Z).
- **Producción:** no. La promoción la decide Pablo.

## Qué cambió para el jugador

- **Privacidad** (`privacy.html`, enlazada desde el pie y la Bienvenida): dice lo que la Bóveda hace de verdad.
  - Adónde se conecta el navegador y qué recibe cada sitio. Analytics solo en la Bóveda pública.
  - Qué guarda cada módulo, con sus claves reales: 32 claves en 13 filas.
  - Las Keys van sin cifrar y el Llavero va cifrado (PBKDF2 con 600.000 iteraciones y AES-GCM).
  - La copia de ajustes lleva las Keys sin cifrar.
  - La Cámara reconoce cada cuenta por los 4 primeros y los 4 últimos caracteres de la Key.
  - Cómo borrar todo.
  - Antes prometía un interruptor de Analytics que no existe, nombraba claves inventadas y hablaba de Gist.
- **«Primeros pasos»** (`docs/user-guide.html`), para leer en 5 minutos.
  - Qué es la Bóveda y cómo crear la API Key.
  - La tabla de los 7 permisos. Los 7 son obligatorios: sin uno, la Key no se guarda.
  - Cómo cargarla y cómo moverte, con los 10 módulos.
  - Tu día y tu semana, y tus datos.
  - Comunidad: Discord primero, después GitHub, y el correo pablinnn@gmail.com.
- **«Guía por módulo»** (`docs/user-guide-avanzado.html`): Inicio, los 10 módulos en el orden de la barra lateral, Keys y Ajustes.
  - Cada uno con su placa de 56 px, su color y su ruta.
  - Cada uno responde lo mismo: para qué sirve, cómo se usa, qué permisos pide y qué guarda.
- **Los nombres son los mismos en todos lados.** La ventana «Guías», la Bienvenida y mi voz dicen «Primeros pasos» y «Guía por módulo».
  - Mi voz ya no nombra el botón «Backup» ni la «Gestión de API Keys», que ya no existen (`js/shiruvana-places.js` 1.3.1).
- **Sin restos:** se borraron `docs/user-guide-avanzado.md` (v6.5.1) y `docs/PRIVACIDAD.md`. Además, `docs/BRIEFING.md` ya no menciona Gist ni la privacidad vieja.
- **Las tres páginas** usan el theme que eligió el jugador, llevan el aviso legal de ArenaNet y no tienen emojis ni número de versión.

## Pasos

| Paso | Qué | Hecho | Validado | Evidencia |
|---|---|---|---|---|
| GUI-0 | Propuesta | 05:59Z | 06:33Z (D1 a D6) | `propuesta-guias-bl071.html` b71dc58, RUN-107 |
| GUI-1 | Privacidad verdadera, enlazada desde el pie | 06:41Z | 07:02Z | `privacy.html` afe4d8d, PATCH-159, `tests/privacy.test.cjs`, RUN-108 y 109 |
| GUI-2 | «Primeros pasos» | 07:07Z | 07:20Z | `docs/user-guide.html` d6c9680, `tests/guides-content.test.cjs`, RUN-110 |
| GUI-3 | «Guía por módulo», parte 1 | 07:30Z | 12:24Z | `docs/user-guide-avanzado.html` a30e215, RUN-111 a 113 |
| GUI-4 | Parte 2, el correo y los 7 permisos obligatorios | 12:36Z | 13:34Z | 9d345f6, PATCH-165, RUN-116 a 118 |
| GUI-5 | Claves reales, nombres en la app, limpieza, 19 themes y esta ficha | 13:50Z | 14:49Z | PATCH-168 (167 rechazado) y 169, RUN-119 a 122 |

## GUI-5 en detalle

- **Las claves, medidas en el código.** RUN-120 buscó quién lee o escribe cada clave que nombraban la privacidad y la guía. Buscó por el nombre de la clave, por su constante de `Storage.STORAGE_KEYS` y por su nombre viejo.
  - **Se fueron 8 claves** que ningún módulo usa: `gn:achievements` (es un evento), `gn:converter:state`, `gn:wallet:state`, `gn:wallet:snapshots`, `gn:meta:hecho_hoy`, `gn:activities:stones`, `gn:inventory:selected_items` y `gn:wv:season`.
  - **Se sumaron las que faltaban:**
    - Inicio: `gn:global:welcome`.
    - Cámara: `wv:season:current` y `wv:season:index`. La Cámara nunca usó el prefijo `gn:`.
    - Multicuenta: `inv_dashboard_*`.
    - Otras: `gn:wallet:hidezero`, `gn:wallet:dashboard:sort`, `gn:raids:strike:view` y `gn:theme:official`.
  - La frase «Todo con el prefijo gn:» era falsa y se fue.
- **Los guardianes nuevos:**
  - `tests/privacy.test.cjs` (8 tests):
    - Cada clave que nombra la tiene que usar un módulo, y no alcanza con `storage.js` ni con la copia de ajustes.
    - Todo lo que la guía dice que se guarda tiene que estar en la privacidad.
    - Las 8 claves viejas no pueden volver.
    - El correo tiene que ser el de la Bienvenida.
  - `tests/guides-content.test.cjs` (12 tests): las dos guías y la privacidad se leen en los 19 themes.
    - El texto tiene que llegar a 4,5:1 sobre la página, la tarjeta y el código.
    - El foco tiene que llegar a 3:1.
    - Cada página tiene que tener su diseño de celular.
- **Los nombres de la app.** PATCH-168 llevó los nuevos nombres a tres lugares:
  - la ventana «Guías» de `index.html`;
  - la tarjeta «Guías y ayuda» de la Bienvenida;
  - mi voz, en `js/shiruvana-places.js` 1.3.1, con un test que impide que vuelvan «Backup», «guía básica», «guía avanzada» y «Gestión de API Keys».
  - El 167 fue rechazado porque faltaba el `?v=` de `shiruvana-places.js` en `index.html` (index-versions, RSK-020).
- **Verificación:** PATCH-168 y 169 se aplicaron con la suite completa en verde antes y después. Además, RUN-122 dio verde: 9 archivos y 92 tests (guías, privacidad, identidad de las guías, Bienvenida, mi voz, versiones e identidad de `index.html`, presupuesto de tamaño y `ai-memory`). `index.html` quedó en 48.288 B.

## Revisión final

| Eje | Qué medí | Hallazgo |
|---|---|---|
| 19 themes | Texto `--tx-1` y `--tx-2` sobre `--bg-0`, `--bg-1` y `--bg-2`; foco `--acc-1` | Correcto. El texto más bajo es one-dark, con 5,52:1. El foco más bajo es notion, con 3,45:1. Lo vigila el test nuevo |
| Celular | Las tres páginas | Correcto. Tienen viewport, diseño de celular de 600 px, enlaces y botones de 44 px y tablas con desplazamiento propio |
| Teclado y lector | Las tres páginas | Correcto. El foco se ve. Los enlaces externos avisan «se abre en otra pestaña». El aviso en inglés lleva `lang="en"` |
| Verdad | Claves, permisos, módulos y correo | Correcto. Todo sale del código, de `MODULES` y `SCOPES` de la Bienvenida y de `LINKS.email` |

## Claves de almacenamiento

No se agregó ninguna clave nueva. Solo cambió lo que dicen las páginas.

## Cómo evaluarlo

1. Recargá con Ctrl+F5 en https://pablosnchz.github.io/gw2-factory-dev/ y abrí «Guías». Tiene que decir «Primeros pasos» y «Guía por módulo». En Inicio, «Guías y ayuda» tiene que decir lo mismo.
2. Abrí la privacidad desde el pie y mirá la tabla «Qué guarda la Bóveda en tu navegador».
3. En Inicio, con Keys cargadas, tocá «Preguntame» → «¿Cómo cambio de cuenta?». Tiene que decir «al lado de «Keys»».
4. Probá las tres páginas con un theme claro (notion), con uno oscuro y en el celular.

## Riesgos y deudas

- **BAJO:** la Cámara reconoce cada cuenta por los 4 primeros y los 4 últimos caracteres de la Key, mientras que Actividades usa una huella (FNV-1a) que no deja nada de la Key. Conviene que la Cámara use la misma huella. Candidato a DISC.
- **MEDIO (DISC pendiente desde GUI-1):** «Guardar copia de ajustes» baja las API Keys sin cifrar. Lo dicen la guía y la privacidad. Falta ofrecer una copia cifrada.
- **BAJO:** `docs/BRIEFING.md` sigue con el estado del 2026-10-22 (Raids y Strikes, `activities.js`). Hay que ponerlo al día en otro momento.
- **BAJO:** `js/storage.js` y `js/settings-manager.js` todavía conocen claves que ningún módulo usa, como `gn:wallet:snapshots` y `gn:meta:hecho_hoy`. Se limpian al promover, porque producción comparte el almacenamiento.
- **BAJO:** Actividades lee la cartera (`wallet`) para las piedras de Leivas, pero `SCOPES` de la Bienvenida no le asigna ese permiso. La guía lo aclara en el texto.
