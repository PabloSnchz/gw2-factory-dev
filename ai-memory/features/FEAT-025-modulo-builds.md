# FEAT-025 — Módulo Builds (BL-082)

- Estado: EN DEV, completo (BLD-1 a BLD-15 y BUI-1 a BUI-5). Espera la validación final de Pablo (2026-10-29 18:15Z)
- Dónde: https://pablosnchz.github.io/gw2-factory-dev/#/builds (Sidebar → Builds, antes de Cuentas)
- Pedido: Pablo, 2026-10-28 03:41Z. Decisiones D1–D6 aprobadas 03:58Z («sí a todo»). Propuestas: docs/propuestas/propuesta-builds-bl082.html (módulo) y docs/propuestas/propuesta-builds-ui-bl082.html (interfaz BUI, U1 aprobado 2026-10-29 01:28Z)

## Qué hace

Marco común (js/bld-view.js 1.3.0), como Raids y Cuentas: cabecera con ícono, subtítulo, píldora del último parche de balance y 4 indicadores (builds curadas, élites cubiertas, para revisar, Mis builds); 4 pestañas con ícono elegido por Pablo (GNKit 1.4.0: Biblioteca 1228891, Editor 63127, Mis builds Cuentas/255373, Importar 155033) y contador; menú ⋯ común que se cierra tocando afuera o con Escape.

1. **Biblioteca** (js/bld-lib.js 1.3.0, BLD-7/8/10/15, BUI-2): 104 builds curadas (assets/data/builds/catalog.json).
   - Cobertura: PvE 36/36 élites, WvW 36/36 (29 vigentes + 7 «para revisar»), PvP 32/36.
   - Filtros: las 9 profesiones como íconos oficiales y, al elegir una, sus 4 élites con emblema; modo y rol como chips; «Más filtros» con arma, daño, vigencia y texto. Profesión + modo + rol = 3 toques.
   - Tarjeta: emblema de la élite, «Copiar código» (principal), «Ver ficha» (o tocar la tarjeta) y menú ⋯ con guardar, fuente y «Avisar que está vieja» (issue de GitHub ya escrito, A6 sin servidor).
   - Vigencia (D4): cada build guarda el parche para el que fue revisada; si es anterior al último parche de balance (catálogo o vigía), queda «para revisar».
2. **Editor** (js/bld-editor.js 1.3.0, BLD-5/12/13, BUI-3): profesiones con su emblema; cada línea con el fondo oficial de su especialización y los rasgos como íconos (el lector dice nombre y si está elegido); barra de 5 casilleros con ícono que abren un selector (tierra y agua; la del Retornado la ponen sus leyendas); mascotas del Guardabosques; código de plantilla en vivo; validación contra /v2 (D3); panel «Equipo y código AE2»: sugerencia de estadísticas, runa, reliquia y sigilos por reglas (D2, js/bld-gear.js), qué ya tenés en la Armería legendaria (si hay API key) y copiar el código AE2 (C3, js/bld-ae2.js).
3. **Mis builds** (js/bld-mine.js 1.1.0 + js/bld-store.js, BLD-6/B7, BUI-4): la misma tarjeta de la Biblioteca; menú ⋯ con editar en el Editor, duplicar y borrar (con confirmación a la vista). Guardadas en este navegador, viajan en el respaldo (settings-manager 1.1.0).
4. **Importar** (js/bld-import.js 1.0.0, BLD-4/C1): pega un código [&DQ…] o AE2:… (sanitizado), muestra la ficha con el emblema, guarda o abre en el Editor.

En toda ficha (js/bld-show.js 1.1.0): emblema grande de la élite, copiar código, enlace para compartir (#/builds/c/<código>, C4) y enlace a gw2skills.net (D5). Íconos y nombres oficiales desde la API (js/bld-ref.js 1.2.0, guardados en el navegador).

## Temas, teclado, lector, celular y rendimiento (BUI-5, DEC-040)

- Contraste WCAG AA en los 19 temas: texto 4.5:1, acento y foco 3:1. El acento, el verde, el rojo y el foco se mezclan con el texto de cada tema; lo elegido y el botón principal van sobre --bg-0 al 14 %. Guarda: tests/bld-ui.test.cjs (lee css/themes/ y el CSS real; falla si un tema nuevo o una mezcla no llega).
- Teclado: pestañas con flechas, Inicio y Fin; foco visible; todo lo que se toca es un botón nativo; Escape cierra menú y selector y devuelve el foco.
- Lector: grupos con nombre, aria-pressed en lo elegible, avisos con role=status/alert, «copiado» se lee.
- Celular: controles de 44 px a 720 px, indicadores en 2 columnas a 900 px, tarjetas en 1 columna a 560 px, sin animaciones si el sistema lo pide.
- Rendimiento: filtrar y dibujar las 104 builds ~2 ms (requisito: menos de 2 s; editor menos de 200 ms); catálogo 52 KB; los emblemas cargan a medida que se ven; los 11 módulos solo se cargan al entrar a #/builds.

## Vigía semanal y Discord (BLD-10/14, D4/D6)

- .github/workflows/builds-watch.yml: lunes 12:00 UTC, a mano o cuando cambia el catálogo.
- .github/scripts/bld-watch.cjs: lee el parche declarado en páginas públicas de MetaBattle y /v2/build; actualiza assets/data/builds/watch.json y republica DEV.
- Discord: solo si existe el secreto DISCORD_WEBHOOK_URL en el repo (opcional, lo configura Pablo). Sin @everyone.

## Archivos

js/bld-code.js, bld-ref.js, bld-show.js, bld-store.js, bld-ae2.js, bld-gear.js, bld-view.js, bld-lib.js, bld-import.js, bld-editor.js, bld-mine.js (ruta #/builds en js/modules.json, cargados solo al entrar: boot.js 1.2.0); gn-kit.js 1.4.0 (íconos de pestañas); router.js 2.22.0; sidebar-nav.js 2.3.0; settings-manager.js 1.1.0; assets/data/builds/catalog.json y watch.json. Tests: tests/bld-*.test.cjs (incluye bld-ui) y .github/scripts/bld-watch.test.cjs. Curación del catálogo (se corre a mano por diagnóstico): tests/bld-curate*.smoke.cjs y tests/bld-curate-lib.cjs.

## Para validar

1. Biblioteca: tocar Guardián, después WvW y Apoyo; copiar un código y pegarlo en el juego (panel de plantillas).
2. Editor: armar una build del Retornado y una del Guardabosques y probar el código en el juego.
3. Importar un código de Snow Crows/MetaBattle y uno AE2.
4. AE2: pegar el código del panel de equipo en el playground de Alter Ego.
5. Mis builds: guardar, duplicar, borrar; exportar el respaldo e importarlo.
6. Interfaz: cabecera con 4 indicadores, pestañas con sus íconos, menú ⋯ que se cierra tocando afuera; cambiar a un tema claro (Notion o macOS) y a uno oscuro: todo se lee.

## Límites conocidos

- D1 (comparador DPS/APM): Snow Crows no publica datos del simulador; queda como enlace a la fuente, sin números propios.
- 7 builds de WvW (MetaBattle) declaran un parche anterior: se muestran «para revisar» (DEC-039).
- En los temas claros el verde de «válida» se ve más oscuro que en los oscuros: es a propósito para que se lea (DEC-040).
