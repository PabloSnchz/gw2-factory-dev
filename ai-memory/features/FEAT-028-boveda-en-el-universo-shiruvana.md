# FEAT-028 — La Bóveda en el universo de Shiruvana

- Estado: DISPONIBLE EN DEV — validada por Pablo paso a paso (BV-0 a BV-6b); BL-092 cerrada por Pablo el 2026-11-18 03:27Z («quedó muchísimo mejor»). Pasaje a PRD en curso: BL-093 (vía PowerShell, manifiesto factory/promote/BL-093.txt).
- Backlog: BL-092, BL-093 · Decisiones: DEC-025, DEC-034, DEC-035 · Antes: FEAT-020, FEAT-027
- Repo: gw2-factory-dev (https://pablosnchz.github.io/gw2-factory-dev/)
- Archivos: css/universo.css 1.5.0, css/themes/gato.css 2.0.0, js/theme-selector.js 1.3.0, js/shv-bubble.js 1.6.0, js/escena-kit.js y css/escena-kit.css (copia fija de shiruvana/kit 1.0.0), js/modules.json, index.html; imágenes assets/brand/gato/ y assets/brand/shiruvana/
- Tests: tests/universo.test.cjs (12), tests/shv-escena.test.cjs (12), tests/universo-paneles.test.cjs (4), tests/theme-gato.test.cjs (9), tests/theme-selector.test.cjs, tests/gn-surface.test.cjs

## Qué hace (solo con el theme Gato Negro; los otros 18 quedan como estaban)

- Fondo «Taller»: cuadrícula tenue, resplandores y chispas que suben despacio (menos en el celular, ninguna con «reducir movimiento»); barra de arriba y barra lateral con la paleta del universo.
- Cabeceras de los módulos con su antetítulo de grupo (Tu oro · Lo diario · Lo semanal · Tu progreso · Tu cuenta) en el color del módulo y las cifras en ámbar.
- Mi globo con el gato robot abajo a la derecha, en lugar del rincón de la barra lateral: arranca plegado, se abre con algo nuevo, el gato reacciona. Sin clave nueva en el navegador.
- Mis poses de cuerpo entero sin fondo: saludando en Inicio, pensando en la cola vacía de la Armería, en Cuentas sin cuentas y en Compras fijadas vacías.
- Celular: lugar abajo para el globo, botón de 44 px, me corro mientras escribís, mensajes largos con scroll, nada impreso.
- El theme Gato Negro con la obsidiana del universo (fondo #0B0B10, paneles #15151D, bordes #2A2A38) y los paneles de los módulos como los de La Guarida: oscuros, con el color del módulo solo en el borde de arriba y una luz leve.

## Pasos

- BV-0 maqueta (docs/propuestas/propuesta-boveda-bv0.html), D1 a D4 aprobados con las ★.
- BV-1 fondo, barras · BV-2 cabeceras · BV-3 globo con el gato · BV-4 poses · BV-5 celular y revisión final.
- BV-6a obsidiana del universo en gato.css; BV-6a.1 el theme se pide con su versión (caché); BV-6b paneles como La Guarida (capturas de Pablo).

## Aprendizajes

- Un CSS de theme que cambia tiene que cambiar de dirección (?v) como cualquier otro archivo: con ?v fijo el navegador siguió con los colores viejos.
- Antes de cambiar colores, buscar quién pinta: el tinte de los paneles no venía del theme sino de js/gn-shell.js y de las cabeceras de cada vista.
- En universo.css un @media que ya existe se amplía, no se repite (los tests leen el primero).
- La captura de Pablo vale más que mi descripción: «color solo en el borde» se entendió en una imagen.
