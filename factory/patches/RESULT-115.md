# RESULT de PATCH-115

- Fecha: 2026-10-25T20:28:23.907Z
- Estado: APLICADO
- Resumen: ACT-7b, parte 3 (reintento de PATCH-114, que rechazó hb106-t13 y t19c) (BL-070): router 2.21.0 sin Activities (no se precarga, activa ni desactiva; #activitiesPanel lo dibuja js/act-view.js) e index.html con su ?v; el presupuesto saca js/activities.js y js/activities-theme.js (borrados en la parte 2) y baja el techo del router; los tests heredados dejan de leer js/activities.js: idea49 (dos) ahora exigen que no exista y que la vista nueva no toque localStorage, idea61 saca sus dos lectores crudos y el censo del latch baja su piso a 1. hb106-t13 copia del router solo el bloque de WV (3 líneas) y t19c prueba su control con una entrada sintética.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/router.js` | `8525d160c97cd3540ae1c9f5dd127a0ec4bc478b` | `09b30dcf83e21b07a0b95d4d02ff76d53d1de637` | 63255 |
| `index.html` | `d5aecddb454b91d1760bb32068bcf8bbd03dcb95` | `5285796a57c32192d4f5497432da020a4deb3a4e` | 54923 |
| `tools/size-budget.json` | `559f37958b30a9725764ddb90cadc5c6ff9362c5` | `a766656d2773ed0809f2ee126bb5f940d2bbc835` | 1844 |
| `tests/hb106-censo-latch.test.js` | `f2314fb7cf185bfff3a7ba58b00804965537b571` | `86a92772f746628ba953cf78716afaf6513ba2a8` | 11481 |
| `tests/idea61-claves-congeladas.test.js` | `69ff40a30008cf19e65f5dc25a7cf8503e1b6a30` | `b1ae9f2020324fe6cbeff325dc5f7f673f7bb723` | 26881 |
| `tests/idea49.activities-cache-wipe.test.js` | `efb3d3203c84e4a4aad9125731a666cfbebbf24a` | `04dc5e88c33fdaff11a9fc2ee514bacaaa6fa30f` | 8734 |
| `tests/idea49.quotavisible.test.js` | `ef73fd5d6b237d9043a4b75f702db5aa1a8d50e3` | `d8f25299e69616ed0ebae97a84f3749a2a5a6148` | 6876 |
| `tests/hb106-t13-invariante.test.js` | `247cf64888dc92657755a9831d8939dad63836be` | `55a533cb0923aa79b80fcbe3005fad2a5e7dc482` | 13334 |
| `tests/t19c-lectores-legacy.test.js` | `c46e7086ea4ea13a3071a65ef906bb4ab9e1cbf7` | `8b1dd45ab54028a4644dc08631e3a25b2db7db15` | 9401 |

- Suite de tests: ya estaba en rojo antes del parche (4 fallas: tests/idea49.activities-cache-wipe.test.js, tests/idea49.quotavisible.test.js, tests/idea61-claves-congeladas.test.js, tests/size-budget.test.cjs: la Bóveda cumple su presupuesto de tamaño); el parche no rompió ningún archivo nuevo y pasó node --check.
