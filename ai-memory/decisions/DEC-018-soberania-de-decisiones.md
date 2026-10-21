# DEC-018 — Soberanía de decisiones: la Factory decide lo técnico; a Pablo solo le llegan decisiones de producto, negocio o estrategia

- Estado: ACEPTADA — encargada por Pablo en FACTORY-DASHBOARD-REFINEMENT-001 (2026-10-20)
- Fecha: 2026-10-20
- Ámbito: Qué le llega a Pablo, con qué forma y cómo se muestra en el panel
- Relacionadas: DEC-011 (pedidos y respuestas), DEC-013 (Centro de decisiones), DEC-014 (autonomía), DEC-017

## Contexto

El 2026-10-20 "Necesita tu decisión" mostraba 6 ítems. Solo 1 era un pedido de decisión, y trataba de un proceso interno de la Factory sin explicar por qué Pablo tenía que decidirlo. Los otros 5 eran:

- 1 acción manual (crear el proyecto en Vercel);
- 2 validaciones (evaluar DEV sin Analytics, mirar el panel);
- 2 avisos informativos: confirmar CI, que la Factory no puede ver, y la fecha de revisión de un riesgo que Pablo ya aceptó.

Además, ese riesgo aceptado seguía apareciendo como "problema crítico".

Pablo recibía como decisiones cosas sobre las que no tenía contexto o que no le pedían criterio. Eso genera fricción y gasta su atención en lo que la Factory debía resolver sola.

## Decisión

### 1. Quién decide qué

| Decide la Factory, sin consultar | Decide Pablo |
|---|---|
| Implementación, estructura del código, refactorizaciones, APIs internas, testing | Visión del producto y experiencia de usuario |
| Arquitectura menor, organización de memoria y del panel, diseño dentro del GDS | Prioridades de negocio y alcance funcional |
| Prioridades técnicas, deuda técnica, observabilidad, procesos internos | Costos, recursos y proveedores externos |
| | Producción, riesgos aceptables, autonomía de la Factory, cambios estratégicos del ecosistema |

Antes de pedirle algo a Pablo, la Factory se pregunta: "¿esto requiere criterio humano o conocimiento del negocio?". Si la respuesta es no, decide ella y lo registra.

### 2. Cuatro clases de lo que le llega a Pablo

| Clase | Qué es | Cómo llega | Cuenta como pendiente |
|---|---|---|---|
| **Decisión** | Algo de la columna "Decide Pablo" | Solo como pedido `REQ` de tipo decisión | Sí: va en "Necesita tu decisión" |
| **Acción** | Algo que solo Pablo puede hacer (su cuenta, sus permisos) | Pedido `REQ` de tipo acción, línea `Acción:` en `status.md` o tarea BLOCKED | Sí: va en "Necesita tu mano" |
| **Validación** | Mirar o probar algo funcionando y confirmar que sirve | Línea `Validación:` en `status.md` o tarea BLOCKED "Bloqueado: validación de Pablo" | Sí: va en "Necesita tu mano" |
| **Información** | Algo que conviene saber y no pide nada | Línea `Info:` o sección `## Para tu información` en `status.md`; riesgos aceptados | No: va en "Para tu información" |

### 3. Un pedido de decisión tiene cuatro piezas obligatorias

- `## Qué pasó`: el contexto.
- `## Por qué importa`: el impacto.
- `## Por qué te lo pregunto`: por qué la Factory no puede decidirlo sola. Es la pieza nueva.
- `## Recomendación`: qué haría la Factory y por qué. Con opciones, también las consecuencias de cada una.

Un pedido de decisión sin "Por qué te lo pregunto" **no se muestra a Pablo**. El panel lo informa en Salud como tarea de la Factory: decidirlo o justificarlo.

Lo mismo vale para una DEC PROPUESTA sin pedido, o para una tarea bloqueada "por decisión de Pablo" sin pedido. Tampoco puede entrar disfrazada de línea de `status.md`.

### 4. Riesgos aceptados

Un riesgo con "ACEPTADO por Pablo" en su mitigación se sigue midiendo, pero deja de ser un problema:

- su chequeo medido baja a informativo;
- sale de "Qué debería preocuparte";
- aparece en "Para tu información" con su fecha de revisión.

### 5. Contrato de datos v4 (compatible con v3)

- `status.md`: cada línea de `## Esperando a Pablo` empieza con su clase después del ID: `- [ID] Acción: …`, `- [ID] Validación: …`, `- [ID] Decisión: …` (con pedido) o `- [ID] Info: …`.
- `status.md`: nueva sección opcional `## Para tu información`.
- `requests/`: nueva sección `## Por qué te lo pregunto`, obligatoria en los pedidos de tipo decisión.
- Una línea sin clase se muestra como acción y el panel avisa para que la Factory la clasifique.
- Una memoria sin pedidos (v2) conserva el comportamiento anterior.

## Consecuencias

- Pablo ve primero lo poco que necesita su criterio. Las tareas aparecen separadas y explicadas como tareas.
- La Factory asume más decisiones y debe registrarlas (DEC, LES o el motivo de la tarea).
- Una decisión mal planteada falla hacia la Factory, no hacia Pablo: queda como aviso en Salud hasta que se decida o se justifique.
- Panel: `js/decisions.js`, `js/model.js`, `js/parse.js`, `js/views.js` y `tests/sovereignty.test.mjs` en gw2-factory-dashboard.
- Memoria: `status.md` y REQ-004 adaptados.
- El workflow `decision-response` no cambia: solo lee Estado, Tipo y Opciones.

## Aplicación inicial (2026-10-20)

| Pendiente | Antes | Ahora |
|---|---|---|
| REQ-004 · cuándo investiga sola la Factory | Decisión sin justificar | Decisión: define la autonomía de la Factory, que es de Pablo; se agrega "Por qué te lo pregunto" |
| REQ-002 · Vercel | Acción en "Necesita tu decisión" | Cerrado por RESP-003 |
| FEAT-002 · DEV sin Analytics | "Pendiente tuyo" | Validación |
| BL-016 · mirar el panel | "Bloqueado por vos" | Validación |
| RSK-016 · confirmar CI | "Pendiente tuyo" | Información: la Factory no lo puede ver; avisar solo si está en rojo |
| RSK-001 · revisión 2026-11-20 | "Pendiente tuyo" y problema crítico | Información (riesgo aceptado) |

Resultado: de 6 "decisiones" a 1 decisión y 2 validaciones, más 2 avisos informativos que no piden nada.

## Ampliación

- 2026-10-20: DEC-019 amplía esta decisión con el filtro de tres preguntas, la validación técnica como trabajo exclusivo de la Factory, bloqueos con dueño, riesgos fuera de la cola y como máximo 3 decisiones abiertas (RESP-005).
- 2026-10-21: DEC-022 (instrucciones v2) agrega el **riesgo** a lo que debe traer cada decisión para Pablo: contexto, recomendación, impacto, riesgo y justificación. Los pedidos de decisión nuevos llevan una sección `## Riesgo`.
