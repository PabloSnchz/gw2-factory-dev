# DISCOVERY ARCHIVE

Historial de oportunidades que salieron de [discovery.md](discovery.md): promovidas al backlog, archivadas por inactividad o descartadas.
Cada entrada conserva su contenido y agrega Fecha de salida, Motivo y Responsable (DEC-016). El archivo es de solo agregar: nunca se borra una entrada.
Una oportunidad archivada puede volver a discovery con su mismo ID si aparece evidencia nueva.

## DISC-001 — El PSNA muestra los puntos de ruta de otro día

- Estado: PROMOVIDO
- Fecha: 2026-10-20
- Fecha de salida: 2026-10-20
- Motivo: promovida a BL-013 (ampliada; DEC-017 punto 5). Cumple las seis condiciones de promoción
- Responsable: Factory
- Fuente:
  - producto: `js/activities.js` y `assets/data/psna-schedule.json`;
  - wiki "Pact Supply Network Agent", consultada el 2026-10-20;
  - doncpauli.com (guía con la rotación por día de semana);
  - gw2.app/psna
- Problema:
  - el archivo de rotación cubre solo del 2026-03-17 al 2026-03-24 y no se actualiza desde el 2026-03-19;
  - si no hay datos para hoy, la app muestra el primer día del archivo como si fuera hoy;
  - en cualquier sitio publicado lee siempre el archivo del repo de producción
- Hallazgos de la investigación:
  - **La rotación es de 7 días**, ligada al día de la semana. La wiki muestra el mismo conjunto el 19 y el 26 de octubre.
  - **Los vendedores cambian de lugar a las 08:00 UTC**, no a las 00:00. A las 00:00 cambian los objetos que venden.
  - **Hay códigos de punto de ruta distintos de la wiki.** Por ejemplo, Restoration Refuge `[&BIcHAAA=]` en la wiki contra `[&BIgHAAA=]` en el archivo, y Haymal Gore `[&BA8CAAA=]` contra `[&BB4CAAA=]`.
  - **El archivo tiene códigos repetidos**: Blue Oasis repite el de Camp Resolve, y Armada Harbor el de Fort Trinity.
  - **El día de la semana de cada conjunto no está confirmado.** Dos versiones en caché de la wiki difieren en un día. La guía de doncpauli y el archivo actual coinciden en lunes = Restoration Refuge. Hay que confirmarlo antes de publicar.
- Beneficiario: todo usuario del panel Actividades
- Valor: corrige información incorrecta que se ve todos los días
- Alternativa: gw2.app/psna (en inglés, sin el resto de la app)
- Prioridad: ALTA
- Costo: S

## DISC-002 — Metas de Janthir Wilds y Visions of Eternity faltan o están mal etiquetadas

- Estado: PROMOVIDO
- Fecha: 2026-10-20
- Fecha de salida: 2026-10-20
- Motivo: promovida a BL-034. Cumple las seis condiciones de promoción; quedaba lugar en READY
- Responsable: Factory
- Fuente:
  - producto: `assets/meta-events.json` y el filtro de expansión de `index.html`;
  - ecosistema: notas de actualización del 2026-09-15 ("Code of Creation", final de Visions of Eternity, con un mapa nuevo y el metaevento "Depths of Cruelty")
- Problema:
  - Visions of Eternity tiene una sola meta cargada ("Secretos del Bosque") y falta lo agregado en "Code of Creation";
  - Janthir Wilds no tiene ninguna;
  - "Convergencia: Monte Balrior", que es de Janthir Wilds, figura como SotO;
  - el filtro de expansión no ofrece Janthir Wilds ni Visions of Eternity, aunque `meta.js` ya tiene sus íconos
- Beneficiario: jugadores de las dos expansiones más recientes
- Valor: corrige información incorrecta y completa la función de metas
- Alternativa: GW2Timer, gw2.app, gw2.guildwars.games/es (temporizadores en español)
- Prioridad: ALTA
- Costo: S (horarios a verificar en la wiki)
