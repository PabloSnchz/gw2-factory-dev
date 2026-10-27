# FEAT-021 — Shiruvana y tu legendaria («¿Cuánto me falta?»)

- Estado: EN DEV — SHV-3a/3b validados por Pablo (2026-10-27 04:34Z); SHV-3c hecho (04:39Z), espera validación. Producción: la decide Pablo.
- Backlog: BL-059 (nivel N4 de DEC-033) · Propuesta: docs/propuestas/propuesta-shiruvana-shv3.html (aprobada 04:00Z, D1 a D5) · Decisiones: DEC-033, DEC-038
- Archivos: js/shv-legendary.js 1.2.0 (por js/modules.json, después de shv-memory y shv-bubble), docs/user-guide-avanzado.html («Cola de crafteo»)
- Tests: tests/shv-legendary.test.cjs (24 tests, 46/46 mutaciones)

## Qué hace

- Al entrar a Armería → «Mi cola», hablo de la primera legendaria de la cola que todavía no tenés (D1): cuántos materiales te faltan, cuánto oro al precio de venta del Bazar (D3, solo por lo que se vende) y cuántos no se venden (D5, aparte, sin oro).
- Árbol completo (materiales base) si los precursores ya están cargados; si no, la receta directa y lo digo (D2). No fuerzo la descarga de 268 KB.
- Precios: una sola consulta a /v2/commerce/prices (GW2Api, con su caché) por los materiales que faltan; una a la vez. Sin respuesta del Bazar, no hablo de oro.
- SHV-3c (D4): si ese oro ya está en tu Cartera, te lo digo. Con 7 días o más de fotos diarias de la Cartera (js/shv-memory.js, por la huella de la Key), comparo con la foto más nueva de hace 7 a 14 días y te digo en cuántos días juntás lo que falta. Si el oro no subió, o la última foto es de antes de ayer, no doy plazo.
- Globo (FEAT-020): una vez por visita y por novedad (legendaria | árbol o receta | cuántos faltan). El ritmo cambia cada día pero no es novedad para el globo. Silenciada (o sin globo): escrito debajo de «Tu cola». «Ver qué me falta» abre la ficha.
- No guarda nada nuevo en el navegador.

## Pasos

- SHV-3 propuesta (PATCH-201 docs). SHV-3a cuenta pura e inerte (PATCH-202 docs). SHV-3b en «Mi cola» (PATCH-203, validado). SHV-3c el ritmo (PATCH-205).

## Aprendizajes

- La Armería no tiene precios de los materiales (state.prices del tracker nunca se llena; los de la cola son del catálogo): la propuesta decía «sin llamadas nuevas» y no era cierto. Leer el dato real antes de prometer.
- Un freno de concurrencia (busy) se pierde fácil al refactorizar: lo cubre un test que llama dos veces seguidas.
- El ritmo con poca historia miente: el mínimo de 7 días es la regla, no una preferencia.
