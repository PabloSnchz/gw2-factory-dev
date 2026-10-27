# FEAT-023 — «Lo sé por» en toda la Bóveda

- Estado: CERRADA EN DEV — SHV-5a a 5d validados por Pablo (2026-10-27 21:30Z). Producción: pedida por Pablo en el mismo mensaje, va en BL-077 (vía PowerShell).
- Backlog: BL-076 (sigue a BL-059, nivel N2 de DEC-033) · Propuesta: docs/propuestas/propuesta-shiruvana-shv5.html (D1 a D6 confirmadas por Pablo 12:42Z) · Decisiones: DEC-033, DEC-024, DEC-038
- Archivos: js/shv-bubble.js 1.4.0, js/raids-view.js 1.3.0, js/raids-sheet.js 1.3.0, js/ach-view.js 1.4.0, js/inv-view.js 1.6.0, js/home-view.js 1.2.0, js/act-view.js 1.5.0, js/act-week.js 1.2.0, js/acc-view.js 1.3.0, js/wv-view.js 1.3.0, js/meta-theme.js 2.2.0, js/converter-modal.js 2.2.0, index.html (?v 2.2.0), js/modules.json
- Tests: tests/shv-basis.test.cjs (guardián: lista de pendientes exacta que solo se achica, quedó en 0; las líneas fijas terminan en «en este navegador» y no tienen hora), más los tests de cada módulo.

## Qué hace

- Todo mensaje mío sobre tus datos dice de dónde lo sé, con la misma línea que ya tenía la Cartera: «Lo sé por: fuente · hora del dato» o «· en este navegador» si el módulo no tiene la hora real (D3: nunca una hora inventada).
- En el globo y escrito en el módulo (avisos o con Shiruvana silenciada) dice lo mismo (shv-bubble 1.4.0).
- Fuentes: Logros «tus logros (API oficial)», Inventario «tu banco (API oficial)», Heredad «tus nodos (API oficial) y lo que marcaste», Raids «tus raids de esta semana (API oficial)» y en la ficha «tu semana de raids (API oficial) y las recompensas de la wiki» o «lo que marcaste esta semana», Actividades «tus Actividades (API oficial) y los relojes del juego», Semana «tus personajes (API oficial) y lo que confirmaste», Cuentas según el aviso y con la hora real de la última lectura, Cámara «tu Cámara del Brujo (API oficial)», Metas «el horario de metas y lo que hiciste hoy (API oficial)» solo si la API respondió (si no, «el horario de metas del juego»), con el waypoint antes de esa línea, Conversor «el cambio de gemas (API oficial)».
- Raids habla con los 4 tipos de DEC-024 (saluda y explica en lugar de success y hint).

## Pasos

- Propuesta (PATCH-215, RUN-164). SHV-5a PATCH-216, SHV-5b PATCH-217, SHV-5c PATCH-218, SHV-5d PATCH-219, revisión PATCH-220, docs PATCH-223. Cierre PATCH-224.

## Revisión (abierta)

- BAJO: las vistas sin hora propia dicen «en este navegador» en lugar de la hora de su lectura.
- BAJO: en Cuentas, con cuentas del caché, la hora es la de la lectura más nueva.
- MEDIO: index.html mide 48.435 B y converter-modal.js 48.596 B, en zona de advertencia: cualquier cambio ahí tiene que ser de igual tamaño o achicar.

## Aprendizajes

- Un principio («explico con fundamento») se cumple en todos lados solo si un test lo exige en todos lados: el guardián con lista que solo se achica convirtió 11 excepciones en 0 sin migración masiva.
- Pablo validó con el globo silenciado: lo que ya vio en el globo no vuelve, así que para revisar conviene silenciarme y ver todo escrito.
