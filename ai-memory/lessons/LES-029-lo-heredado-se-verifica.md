# LES-029 — Lo heredado no está terminado ni verificado hasta que yo lo compruebo

- Fecha de registro: 2026-10-21
- Origen: FACTORY-ASSET-001, MIG-1 (REQ-010)

## Qué pasó

Al llevar a DEV los hechos de la API que había reunido el modelo anterior, los volví a verificar uno por uno. Aparecieron dos problemas:

- **Un hecho había vencido.** El legado decía que el logro 9478 no existe (ALERT-272). Era cierto cuando se probó, pero el logro se agregó a la API después: hoy es "Legendary Conqueror of Vloxx". Además, el 9472 ("Legendary Nexus of Eternity") corresponde al modo desafío, no al desafío legendario. Si hubiera copiado el dato sin verificar, el seguimiento del modo legendario habría quedado mal desde el principio.
- **Una tarea marcada como terminada no lo estaba.** El seguimiento del 9472 figuraba como "COMPLETADO", pero `raid-tracker.js` solo guarda el dato y ninguna pantalla lo muestra (commit `267264c`). Lo mismo pasa con las conexiones nuevas de `inventory-dashboard.js`: gastan pedidos a la API y no muestran nada.

## Lección

- Un hecho heredado es una pista, no un dato: tiene fecha y puede vencer, sobre todo en una API que cambia con cada parche.
- Un "COMPLETADO" heredado no prueba nada. Una tarea que trae datos y no los muestra en pantalla no está terminada: cuesta pedidos a la API y no le da nada al usuario.

## Cómo aplicar

- Todo hecho que llega del legado se verifica contra la fuente antes de entrar a DEV, y se registra con la fecha de verificación (`docs/GW2-API-HECHOS.md`). Si no lo puedo verificar, queda marcado como "heredado, sin volver a verificar".
- Una funcionalidad se considera terminada solo cuando el usuario la ve en pantalla. Un dato que no se muestra no se descarga.
- Las conexiones nuevas del legado con la API no se migran tal cual: se rehacen junto con la pantalla que las usa.

## Repetición (2026-10-22, MIG-6)

- **Qué pasó:** registré BL-054 («el import del Gist repite las 7 escrituras de `applyImportData`») a partir de ALERT-179 del legado. Comprobé que `settings-manager.js` fuera idéntico en DEV, pero no leí la función. El arreglo ya estaba hecho: `importFromData` delega, y el comentario de ALERT-179 está en el código. Además, Pablo ya había decidido deprecar el Gist (DEC-030).
- **Por qué es la misma lección:** una alerta heredada también es una pista, no un dato. Que el archivo sea idéntico solo dice que el código de los dos lados es el mismo. No dice si la alerta sigue abierta en ese código.
- **Cómo aplicar, ahora más preciso:** antes de registrar algo que viene del legado, leo la función que nombra en el código de DEV de hoy y pregunto si la funcionalidad sigue viva para Pablo. Las dos cosas, no una.
