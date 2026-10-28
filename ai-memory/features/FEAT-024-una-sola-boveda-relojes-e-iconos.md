# FEAT-024 — Una sola Bóveda: relojes, íconos y detalles

- Estado: CERRADA EN DEV — UNI-1 a UNI-7 validados por Pablo (cierre 2026-10-28 03:17Z, «ok, cerrá BL-078»). Producción: pedida por Pablo en el mismo mensaje, va en BL-081 (vía PowerShell).
- Backlog: BL-078 (sigue al restyle BL-070) · Propuesta: docs/propuestas/propuesta-unificacion-bl078.html (D1 a D6 aprobadas por Pablo 2026-10-27 22:53Z) · Selectores: docs/propuestas/uni4-iconos.html, uni6-enlaces.html, uni7-pestanas.html · Decisiones: DEC-024, DEC-031, DEC-035
- Archivos: js/gn-kit.js 1.3.0 (nuevo), js/meta-theme.js 2.3.0, js/raids-view.js 1.6.0, js/raids-sheet.js 1.4.0, js/act-view.js 1.7.0, js/wv-view.js 1.5.0, js/home-view.js 1.4.0, js/ach-view.js 1.5.0, js/inv-view.js 1.7.0, js/acc-view.js 1.4.0, js/gn-topbar.js 1.2.0, js/modules.json, assets/data/raids/catalog.json, index.html (?v 2.3.0)
- Tests: tests/gn-kit.test.cjs, tests/gn-kit-modules.test.cjs, tests/gn-kit-icons.test.cjs, tests/gn-kit-tabs.test.cjs (guardián: con GNKit toda pestaña role=tab de un módulo renovado lleva su ícono; sin GNKit, ninguna), más los tests de cada módulo.

## Qué hace

- Un solo reloj para toda la Bóveda (js/gn-kit.js), nacido del de Metas: ícono del juego, nombre arriba y valor abajo, dorado cuando está cerca (menos de 1 h el diario y el PSNA, menos de 24 h el semanal) y la hora fija al pasar el mouse. Grande en Metas; compacto en Actividades (diario, PSNA, semanal), Cámara del Brujo (diario y semanal), Heredad (diario) y Raids (solo el semanal, D2). Un solo temporizador que se apaga solo.
- Íconos del juego, elegidos por Pablo, en las 23 pestañas de los módulos renovados (Raids 2, Actividades 2, Heredad 3, Cámara 3, Logros 3, Inventario 6, Cuentas 2 y la ficha de Raids en el celular 2), en los indicadores de Actividades, Heredad, Cámara, Inventario y Logros, y en los 5 enlaces del menú Enlaces de la barra. Decorativos (alt vacío): el texto sigue siendo el nombre.
- Raids: la cabecera de cada ala o grupo se distingue de sus filas (tinte y franja del color del módulo, verde con «✓» si está completa, contador en píldora y barra de avance). Los 5 encuentros sin miniatura oficial muestran el emblema de su expansión en lugar del ícono genérico.
- Logros: el ícono AP de «Al alcance» es local (la wiki dejó de servirlo).
- Sin js/gn-kit.js, cada módulo se ve exactamente como antes.

## Pasos

- UNI-0 propuesta (PATCH-227). UNI-1 gn-kit inerte. UNI-2 Metas y Raids (PATCH-230). UNI-3 Actividades, Cámara y Heredad (PATCH-233). UNI-4 íconos de pestañas e indicadores (PATCH-237, PATCH-239). UNI-5 cabecera del ala y emblemas (PATCH-242, PATCH-243). UNI-6 menú Enlaces (PATCH-248, PATCH-250). UNI-7 revisión final y las 4 pestañas que faltaban (PATCH-253, RUN-179, RUN-180). Docs PATCH-252, PATCH-255 y el cierre.

## Revisión

- BAJO: el rótulo chico del reloj usa --tx-3, que en 9 themes no llega a 4.5:1 (ya medido en BL-060; no es deuda nueva).
- BAJO: Foros y Sitio oficial comparten ícono por decisión de Pablo.
- BAJO: Chak, Dragon's End y los retratos de los 5 jefes siguen sin imagen: BL-080, bloqueada por entorno (la wiki está en mantenimiento, RUN-178).
- MEDIO: acc-view.js mide 40.418 B, a 542 B del límite de 40 KB; index.html 48.435 B en zona de advertencia.

## Aprendizajes

- Cuando una lista de íconos depende del ojo de Pablo y yo no puedo ver imágenes, un selector con todos los íconos del repo y un texto para pegar (UNI4, UNI6, UNI7) resolvió en un mensaje lo que por descripción habría llevado varias idas y vueltas.
- Subir la versión de un módulo rompe los tests que la fijan en otros archivos (raids-sheet, act-psna, home-extra, acc-view): antes de cada parche, buscar la versión en tests/.
- El canal de parches tiene un tope de 50 operaciones, y en BLOCKED por entorno la línea no puede nombrar a Pablo (DEC-019).
