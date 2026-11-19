# FEAT-029 — Las guías de usuario en el universo de Shiruvana

- Estado: DISPONIBLE EN DEV — validada por Pablo paso a paso (GU-1 2026-11-19 01:08Z, GU-2 01:26Z, GU-3 06:10Z); BL-094 cerrada 2026-11-19. No está en producción: pasa solo si Pablo lo pide.
- Fecha: 2026-11-19
- Backlog: BL-094 · Decisiones: DEC-025, DEC-035 · Antes: FEAT-019, FEAT-028
- Repo: gw2-factory-dev (https://pablosnchz.github.io/gw2-factory-dev/docs/user-guide.html y docs/user-guide-avanzado.html)
- Archivos: css/guias.css 1.2.1, js/guias-escena.js 1.0.0, docs/user-guide.html, docs/user-guide-avanzado.html; reutiliza css/universo.css 1.6.0, js/escena-kit.js 1.0.0 (copia fija del kit) y assets/brand/shiruvana/
- Tests: tests/guias-universo.test.cjs (9), tests/guias-escena.test.cjs (7), tests/guides-identity.test.cjs (8), tests/guides-content.test.cjs (12)

## Qué hace (solo con el theme Gato Negro; los otros 18 quedan como estaban)

- «Primeros pasos» y «Guía por módulo» con el mismo fondo «Taller» y las chispas de La Bóveda: no hay copia, las guías cargan css/universo.css.
- Cabecera con el gato en aro ámbar y el antetítulo «Guía de la Bóveda».
- Primeros pasos: cada uno de los 7 capítulos es un panel de La Guarida con su color solo en el borde de arriba; números de capítulo y de paso, títulos chicos y encabezados de tabla en ámbar; las tarjetas de los 10 módulos con su color arriba.
- Guía por módulo: la intro en un panel ámbar, el índice como botones de 44 px, cada uno de los 13 módulos en su panel con el color de su botón de la barra lateral, «Cómo se usa» con una marca del color del módulo, los permisos como etiquetas y las claves del navegador en ámbar.
- Mis poses de cuerpo entero sin fondo, en momentos puntuales: saludo al empezar, pienso en «Tus datos» y me siento al cierre. En la compu voy al costado con mi propio lugar; en el celular, debajo del texto. Mientras el recorte no está listo no aparezco: nunca un rectángulo negro.
- Arreglo: las dos guías pedían todos los themes con ?v=1.0.0 fijo y Gato Negro se veía con los colores de antes de BV-6. Ahora piden la misma versión que js/theme-selector.js (THEME_V) y un test lo vigila.
- El contenido de las guías no cambió. No guarda nada nuevo en el navegador.

## Pasos

- GU-1 base compartida (css/guias.css) + Primeros pasos + versión real del theme en las dos guías.
- GU-2 Guía por módulo (css/guias.css 1.1.0).
- GU-3 mis poses (js/guias-escena.js 1.0.0, css/guias.css 1.2.0 → 1.2.1 por EYE-012).
- GU-4 cierre: esta ficha, backlog, status e índice.

## Revisión

- Suites verdes en cada paso (RUN-307, RUN-308, RUN-312 y RUN-313: 105 tests en el último). Mutaciones: 6/6 en GU-2 y 10/10 en GU-3.
- Capturas de antes y después con mis ojos en compu y celular (EYE-007 a EYE-013).
- Sin hallazgos CRÍTICO, ALTO ni MEDIO.

## Aprendizajes

- Un test que fija un valor (?v=1.0.0) también fija el error: antes de cambiar el valor, cambiar el test para que lo lea de la fuente (THEME_V). El canal de parches rechazó PATCH-449 por eso.
- Una pose al costado sirve en la compu pero en el celular angosta todo el panel: en pantallas chicas, la imagen va debajo del texto. Lo vi en la captura, no en el CSS.
- El canal de diagnóstico corre como máximo 10 archivos de tests por pedido: una suite más grande se parte en dos RUN.
- Reutilizar en vez de copiar: el fondo, el kit y el recorte salen de La Bóveda, así un cambio allá llega a las guías sin tocarlas.
