# FEAT-027 — El Centro de mando en el universo de Shiruvana

- Estado: DISPONIBLE — validado por Pablo en la computadora (CD-0 a CD-4) y en el teléfono (CD-5); BL-091 cerrada por Pablo el 2026-11-17 10:59Z. El panel no tiene PRD: main es lo publicado.
- Backlog: BL-091 · Decisiones: DEC-024, DEC-048, DEC-049 · Antes: FEAT-001
- Repo: gw2-factory-dashboard 3.0.1 (https://pablosnchz.github.io/gw2-factory-dashboard/)
- Archivos: css/universo.css 1.5.0, js/views.js, js/globo.js, js/app.js, index.html, .github/workflows/ci-report.yml; en el repo shiruvana: kit/escena-kit.js y kit/escena-kit.css 1.0.0, .github/workflows/kit-ci.yml
- Tests: tests/universo.test.mjs (17), tests/globo.test.mjs, tests/panel.test.mjs, tests/voice.test.mjs (127 en total en el panel); shiruvana: tests/kit.test.cjs y tests/sync.test.cjs (65 en total)

## Qué hace

- El panel se llama «Centro de mando» y usa la paleta, el fondo con chispas y las cabeceras numeradas del sitio de Shiruvana sobre el GDS (contraste AA calculado).
- Hoy es una Mesa de mando: 01 · Ahora con tres cifras; a la izquierda 02 · Te toca y 03 · Hoy y esta semana; a la derecha 04 · La Factory ahora y Qué debería preocuparte; abajo 05 · Entornos y 06 · En números.
- Mi globo con el gato robot, abajo a la derecha: digo lo más urgente y el gato reacciona cuando baja o sube lo pendiente. Se pliega y lo recuerda (gfd:globo:v1).
- Trabajo, Conocimiento, Riesgos, Actividad y Salud abren con «01 · …», título y cifras en ámbar; líneas de tiempo con puntos; colores por estado siempre con texto e ícono.
- Celular: una columna, etapas en línea vertical, sin desenfoque por tarjeta.
- 3.0.1: la tarea, el motivo y la próxima acción muestran su primera oración; el resto se pliega con scroll propio.

## Pasos

- CD-0 maqueta (docs/propuestas/propuesta-centro-cd0.html), D1 a D4 aprobados con las ★.
- CD-1 fondo y cabecera; CD-2 Mesa de mando; CD-3 globo y gato (kit al repo shiruvana); CD-4 las otras cinco vistas; CD-5 celular y revisión final (3.0.0).
- CD-3b redefinido: La Guarida conserva su escena; el kit tiene CI y un guardián que compara el código compartido con La Guarida.
- 3.0.1: arreglo de lo que vio Pablo en el teléfono (la tarjeta 04 se estiraba sin fin).

## Aprendizajes

- La memoria se escribe para que la lea una persona en un panel: «Tarea actual», «Motivo» y «Próxima acción» van en una o dos oraciones; el historial, en líneas aparte.
- Un panel que muestra texto de la memoria nunca confía en su largo: resume y pliega.
- Sin navegador, el CI que escribe su resultado en el repo (ci/ULTIMO.md) es la forma de ver si lo publicado anda.
