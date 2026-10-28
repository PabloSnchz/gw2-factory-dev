# FEAT-025 — Módulo Builds (BL-082)

- Estado: EN DEV, espera validación de Pablo (2026-10-28 11:45Z)
- Dónde: https://pablosnchz.github.io/gw2-factory-dev/#/builds (Sidebar → Builds, antes de Cuentas)
- Pedido: Pablo, 2026-10-28 03:41Z. Decisiones D1–D6 aprobadas 03:58Z («sí a todo»). Propuesta: docs/propuestas/propuesta-builds-bl082.html

## Qué hace

Cuatro pestañas en #/builds (js/bld-view.js 1.1.0):

1. **Biblioteca** (js/bld-lib.js 1.0.0, BLD-7/8/10/15): 104 builds curadas (assets/data/builds/catalog.json).
   - Cobertura: PvE 36/36 élites, WvW 36/36 (29 vigentes + 7 «para revisar»), PvP 32/36.
   - Filtros: profesión, élite, arma, texto, modo, rol (DPS, celeridad, alacridad, curación, apoyo, bendiciones, control), daño (poder, condición, híbrido) y vigencia. Profesión + modo + rol = 3 toques.
   - Cada tarjeta: copiar código, ver ficha (nombres e íconos de la API + validación D3), guardar en Mis builds, abrir la fuente, «Avisar que está vieja» (issue de GitHub ya escrito, A6 sin servidor).
   - Vigencia (D4): cada build guarda el parche para el que fue revisada; si es anterior al último parche de balance conocido (catálogo o vigía), queda «para revisar».
2. **Editor** (js/bld-editor.js 1.1.0, BLD-5/12/13): profesión, 3 especializaciones, 9 rasgos, 5 habilidades terrestres y acuáticas, leyendas del Retornado, mascotas del Guardabosques; código de plantilla en vivo; validación contra /v2 (D3); panel «Equipo y código AE2»: sugerencia de estadísticas, runa, reliquia y sigilos por reglas (D2, js/bld-gear.js), qué ya tenés en la Armería legendaria (si hay API key) y copiar el código AE2 (C3, js/bld-ae2.js).
3. **Mis builds** (js/bld-mine.js 1.0.0 + js/bld-store.js, BLD-6/B7): guardadas en este navegador, viajan en el respaldo (settings-manager 1.1.0). Copiar, ver, editar, duplicar, renombrar, notas, borrar con confirmación.
4. **Importar** (js/bld-import.js, BLD-4/C1): pega un código [&DQ…] o AE2:… (sanitizado), muestra la ficha, guarda o abre en el Editor.

En toda ficha: copiar código, enlace para compartir (#/builds/b/<código>, C4) y enlace a gw2skills.net (D5).

## Vigía semanal y Discord (BLD-10/14, D4/D6)

- .github/workflows/builds-watch.yml: lunes 12:00 UTC, a mano o cuando cambia el catálogo.
- .github/scripts/bld-watch.cjs: lee el parche declarado en páginas públicas de MetaBattle y /v2/build; actualiza assets/data/builds/watch.json y republica DEV.
- Discord: solo si existe el secreto DISCORD_WEBHOOK_URL en el repo (opcional, lo configura Pablo). Sin @everyone.

## Archivos

js/bld-code.js, bld-ref.js, bld-show.js, bld-store.js, bld-ae2.js, bld-gear.js, bld-view.js, bld-lib.js, bld-import.js, bld-editor.js, bld-mine.js (ruta #/builds en js/modules.json, cargados solo al entrar: boot.js 1.2.0); router.js 2.22.0; sidebar-nav.js 2.3.0; settings-manager.js 1.1.0; assets/data/builds/catalog.json y watch.json. Tests: tests/bld-*.test.cjs y .github/scripts/bld-watch.test.cjs.

## Para validar

1. Biblioteca: filtrar Guardián + WvW + Apoyo; copiar un código y pegarlo en el juego (panel de plantillas).
2. Editor: armar una build de cada profesión especial (Retornado, Guardabosques) y probar el código en el juego.
3. Importar un código de Snow Crows/MetaBattle y uno AE2.
4. AE2: pegar el código del panel de equipo en el playground de Alter Ego para confirmar compatibilidad.
5. Mis builds: guardar, editar, exportar respaldo e importarlo.

## Límites conocidos

- D1 (comparador DPS/APM): Snow Crows no publica datos del simulador; queda como enlace a la fuente, sin números propios.
- 7 builds de WvW (MetaBattle) declaran un parche anterior: se muestran «para revisar» (DEC-039).
- Sin íconos propios en las pestañas de Builds (usan los genéricos); se pueden elegir como en UNI-6/7.
