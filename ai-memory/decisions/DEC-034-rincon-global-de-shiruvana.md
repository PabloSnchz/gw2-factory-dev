# DEC-034 — Rincón global de Shiruvana al pie de la Sidebar

- Estado: ACEPTADA — decisión de producto de Pablo (2026-10-23 06:37Z, aprobación de la propuesta SBR-0)
- Fecha: 2026-10-23
- Ámbito: gw2-factory-dev (`js/sidebar-nav.js`, `js/shiruvana-places.js`, propuesta `docs/propuestas/propuesta-sidebar-bl061.html`)
- Relacionadas: BL-061, BL-059, DEC-024, DEC-025, DEC-032, DEC-033

## Contexto

DEC-024 deja mi avatar fuera de la navegación. La propuesta de la Sidebar (SBR-0) pide un lugar fijo, en todas las pantallas, para avisar cuando algo de la Bóveda necesita atención. Ese lugar está dentro de la Sidebar. En la misma aprobación Pablo eligió la Sidebar a la izquierda.

## Decisión (de Pablo)

Aprobado el rincón global, como excepción acotada a DEC-024:

1. **Un solo lugar fijo:** al pie de la Sidebar en desktop y al pie de la hoja «Más» en el celular. Nunca dentro de un enlace, un ícono o la barra de abajo (ahí solo un punto en «Más»).
2. **Forma:** avatar de 48 px, el rótulo «Shiruvana» y una sola línea; como mucho un enlace.
3. **Contenido:** solo el estado de la Bóveda (N1–N2 de DEC-033), con las prioridades de «Shiruvana te guía» (`Welcome.orientation()`): cuántas cosas hay para revisar, «Todo en orden» o «Empezá por tu API Key». El detalle vive en la Bienvenida.
4. **Frontera (DEC-032):** nada de horarios, eventos, metas, precios ni contenido de un módulo. No interrumpo: nada se abre solo.
5. **N3 en adelante** (análisis, estrategias, hábitos) solo cuando Pablo habilite BL-059.

## Consecuencias

- DEC-024 sigue vigente para todo lo demás: el avatar no va en datos, métricas ni enlaces.
- Un test va a vigilar que el rincón sea uno solo, que no tenga más de un enlace y que no hable del contenido de los módulos (SBR-4).
