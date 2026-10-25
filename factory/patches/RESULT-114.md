# RESULT de PATCH-114

- Fecha: 2026-10-25T20:22:57.299Z
- Estado: RECHAZADO
- Resumen: ACT-7b, parte 3 (BL-070): router 2.21.0 sin Activities (no se precarga, activa ni desactiva; #activitiesPanel lo dibuja js/act-view.js) e index.html con su ?v; el presupuesto saca js/activities.js y js/activities-theme.js (borrados en la parte 2) y baja el techo del router; los tests heredados dejan de leer js/activities.js: idea49 (dos) ahora exigen que no exista y que la vista nueva no toque localStorage, idea61 saca sus dos lectores crudos y el censo del latch baja su piso a 1.

Ningún archivo cambió. Motivo:

- con el parche fallan archivos de tests que antes pasaban: tests/hb106-t13-invariante.test.js, tests/t19c-lectores-legacy.test.js
