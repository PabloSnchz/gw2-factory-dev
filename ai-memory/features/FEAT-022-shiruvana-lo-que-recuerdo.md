# FEAT-022 — «Lo que recuerdo de vos» (tus datos, en tus manos)

- Estado: CERRADA EN DEV — SHV-4a/4b/4c validados por Pablo (2026-10-27 07:20Z). Producción: la decide Pablo.
- Backlog: BL-059 (nivel N5 de DEC-033) · Propuesta: docs/propuestas/propuesta-shiruvana-shv4.html (D1 a D6 como recomendé, confirmadas con el ok de Pablo 06:54Z) · Decisiones: DEC-033, DEC-038
- Archivos: js/shv-memory.js 1.1.0, js/shv-recall.js 1.1.0 (por js/modules.json, después de shv-memory y shv-bubble; manifiesto 38 de 40), js/shv-bubble.js 1.3.0, privacy.html, docs/user-guide-avanzado.html
- Tests: tests/shv-memory.test.cjs, tests/shv-bubble.test.cjs, tests/shv-recall.test.cjs (17 tests, 16/16 mutaciones en SHV-4c y 16/16 en SHV-4b)

## Qué hace

- Ajustes → «Lo que recuerdo de vos» (D1), en la ventana común (GNUI.dialog): qué guardo de tu Cartera (cuentas, desde y hasta, cuánto ocupa de mis 64 KB), cuántos mensajes ya viste (huellas de 8 caracteres, nunca el texto), si aparezco en globo y si sigo recordando.
- Medidor del navegador (D7 de SHV-0): cuánto ocupa todo y cuánto lo mío (gn:shv:*), contando clave + valor sin mostrar ningún valor; suma IndexedDB si el navegador lo informa. Barra roja desde el 85 %.
- «Descargar mi memoria» (D4): JSON con las fotos, cada cuenta por su huella, nunca la Key.
- «Dejar de recordar» / «Volver a recordar» (D3): pausa gn:shv:paused; en pausa no saco fotos ni pido nada, y lo que ya sé lo sigo usando hasta que lo borres.
- «Borrar todo» (D2): fotos de la Cartera y mensajes vistos. Pregunta antes con el detalle, foco en «Cancelar», ofrece «Descargar y borrar». No toca «Silenciar» ni la pausa. Avisa que se borra para el navegador entero (producción y DEV comparten origen).
- SHV-4c (D6): si el navegador pasa el 85 %, aviso escrito en Inicio (no en globo, prioridad alta), debajo de «Shiruvana te guía», con «Ver lo que ocupa». Debajo del 85 % no digo nada.
- D5: mi memoria todavía NO entra en «Guardar copia de ajustes» (ese archivo exige su versión 3.0 exacta); si Pablo lo pide, va como paso aparte.

## Pasos

- SHV-4 propuesta (PATCH-207). SHV-4a shv-memory 1.1.0: pausa, forget(), exportData() (PATCH-208, docs PATCH-209). SHV-4b la ventana en Ajustes (shv-recall 1.0.0 + PATCH-210, docs PATCH-211). SHV-4c el aviso del 85 % en Inicio (PATCH-212, docs PATCH-213). Cierre PATCH-214.

## Revisión (abierta, BAJO)

- La cuota de ~5 M caracteres es estimada: varía por navegador.
- forgetSeen no vacía el punto de mensajes sin leer de la visita actual.
- La hora de «Lo sé por» del aviso de Inicio queda la de la primera medición mientras el texto no cambie.
- Medir recorre todo el almacenamiento (con espera de 250 ms entre mediciones).

## Aprendizajes

- Borrar sin pausa no es control real: a la próxima lectura vuelvo a guardar. El control del jugador son tres cosas juntas: ver, pausar y borrar.
- Un aviso que vigila un panel que se redibuja necesita dos frenos: no reaccionar a sus propios cambios en el observador y no tocar el DOM si lo que dice no cambió. Los dos están cubiertos por tests (contando timers, no solo dibujos).
- El sandbox no tiene git ni red a GitHub: la base del parche se transcribe y se verifica por blob SHA antes de generar las operaciones.
