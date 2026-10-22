# DISCOVERY

Oportunidades abiertas que detectó la Factory: problemas, fricciones, funciones que faltan y cambios del ecosistema de Guild Wars 2.
Reglas: DEC-015 (mecanismo), DEC-016 (límites y promoción), DEC-017 (gobierno del backlog), DEC-020 (áreas, qué detiene discovery, latido de 14 días).
Lo que sale de acá (promovido, archivado o descartado) pasa a [discovery-archive.md](discovery-archive.md) con fecha, motivo y responsable. Nada se borra.

Límites: READY ≤ 5 · abiertas (PENDIENTE + ANALIZADO) ≤ 15 · 3 nuevas por ronda · 1 ronda por sesión.
Formato: `## DISC-XXX — título` y los campos Estado, Área, Fecha, Última revisión, Fuente, Problema, Beneficiario, Valor, Alternativa, Prioridad, Costo.

## Estado actual

- Abiertas: 9 de 15 (operación normal)
- READY: 2 de 5 (modo activo; BL-054 y BL-041)
- Rondas autónomas: habilitadas desde el 2026-10-20 (RESP-004, DEC-020). Capacidad según las instrucciones v2 (DEC-022): READY ≤ 3 activo, 4–5 restringido, más de 5 detenido. Hoy: activo
- Ideas pendientes sin analizar: 1 de 5 (se puede hacer ronda)
- Áreas detenidas: ninguna (REQ-007 respondida el 2026-10-21; no hay decisiones estratégicas abiertas ni riesgos CRÍTICOS)
- Próxima ronda obligatoria (latido): 2026-11-03, si no hubo otra antes

## Rondas

| Fecha | Tipo | Familias | Resultado |
|---|---|---|---|
| 2026-10-20 | Inicial, por encargo (FACTORY-RESEARCH-001) | Producto, ecosistema, herramientas, comunidad | 8 registradas: 2 promovidas (BL-013, BL-034), 6 abiertas (2 vienen del backlog) |
| 2026-10-22 | Legado de QwenPaw (MIG-6, BL-043) | Producto heredado, juzgado contra La Bóveda de hoy | 3 registradas (DISC-009 a 011). Descartado por historia: el tracker de la Cámara del Brujo (La Bóveda ya lo tiene). Queda para la próxima ronda por el límite de 3: colecciones de la cuenta con monturas (PRE_BACKLOG ideas 2 y 5; ojo con la cuota: muchas cuentas × varios endpoints, ALERT-27). De las alertas del legado, solo una de producto sigue viva y es deuda técnica: BL-054 |

## DISC-003 — "Próximas funciones" anuncia como futuras funciones que ya existen

- Estado: ANALIZADO
- Área: app
- Fecha: 2026-10-20
- Última revisión: 2026-10-20
- Fuente: producto. El panel lateral de `index.html` ("Próximas funciones") lista "Panel de Actividades", que ya existe (`#/activities`), y "Deep-links", que ya existen (rutas `#/account/...`)
- Problema: el usuario lee como pendiente algo que ya puede usar, y la lista nunca se actualiza
- Beneficiario: todo usuario que mira la barra lateral
- Valor: corrige información incorrecta visible en todas las pantallas
- Alternativa: quitar la sección, o dejar solo lo que de verdad está planeado (por ejemplo "Historial y variación", ver DISC-004)
- Prioridad: ALTA (corrige información incorrecta)
- Costo: XS
- Nota: no se promueve todavía para dejar un lugar libre en READY. Es la siguiente en entrar. Es producto y ALTA: entra a READY después de BL-034.

## DISC-004 — Historial y variación de la cartera

- Estado: ANALIZADO
- Área: cartera
- Fecha: 2026-10-20
- Última revisión: 2026-10-20 (DEV en Vercel, RESP-003)
- Fuente:
  - la propia app la promete ("Próximas funciones: Historial y variación");
  - herramientas: Blish HUD Farming Tracker (67,2 mil descargas) y CurrencyViewer (37,2 mil), que siguen cambios de divisas;
  - gw2efficiency ofrece historial más largo a quienes lo apoyan
- Problema: la cartera muestra solo el saldo actual; no se puede ver cuánto se ganó o gastó desde la última visita
- Beneficiario: jugadores que farmean o siguen divisas (karma, oro, astral acclaim)
- Valor: funcionalidad con demanda observable
- Alternativa: Blish HUD (requiere instalar un overlay) y gw2efficiency (en inglés, con cuenta)
- Prioridad: MEDIA
- Costo: M
- Requiere decisión: guardar instantáneas cambia los datos del usuario en `localStorage` (DEC-014). Ya no hay origen compartido con producción (BL-003 hecho), así que se puede plantear como pedido de producto cuando haya lugar en READY.

## DISC-005 — Avance hacia cada legendaria con lo que ya tenés

- Estado: PENDIENTE
- Área: legendarias
- Fecha: 2026-10-20
- Última revisión: 2026-10-20
- Fuente: comunidad. Publicación de canicraft.com en r/Guildwars2 con 279 votos ("cuán cerca estás de craftear cada legendaria según tus recursos")
- Problema: saber qué legendaria está más cerca con los materiales que ya hay en banco y personajes
- Beneficiario: jugadores que trabajan en legendarias
- Valor: probable funcionalidad útil; la app ya tiene Armería Legendaria con árbol de receta
- Alternativa: canicraft.com y la calculadora de gw2efficiency (en inglés)
- Prioridad: MEDIA (provisoria)
- Costo: sin estimar
- Falta analizar: si `legendary-tracker.js` ya muestra un porcentaje de avance

## DISC-006 — Panel: modo autónomo y riesgos aceptados

- Estado: ANALIZADO
- Área: panel
- Fecha: 2026-10-20
- Última revisión: 2026-10-20
- Fuente: producto (panel); análisis del 2026-10-20 y RESP-002
- Problema:
  - entre sesiones el panel dice "Esperando tu validación" en lugar de un estado neutro;
  - no muestra el resumen de la última sesión;
  - mezcla decisiones con revisiones;
  - sigue marcando como crítico un riesgo que Pablo aceptó (RSK-001)
- Beneficiario: Pablo
- Valor: el panel deja de exagerar la urgencia y muestra lo que hizo la Factory sola
- Alternativa: escribir `Estado: IDLE` al cerrar cada sesión (se aplica desde hoy) y aceptar el aviso crítico
- Prioridad: MEDIA (infraestructura; Producto > Dashboard)
- Costo: S
- Nota: es la tarea de panel propuesta en la conversación del 2026-10-20, que no llegó a registrarse en el backlog. Avance: el panel 2.1.0 (DEC-018) ya separa decisiones de validaciones y muestra el riesgo aceptado como información. Falta el resumen de la última sesión.

## DISC-007 — Ubicación canónica del Gato Design System

- Estado: ANALIZADO
- Área: infraestructura
- Fecha: 2026-10-20 (origen: BL-023, registrada por pedido de Pablo el mismo día)
- Última revisión: 2026-10-21 (DEC-022: el GDS es decisión de la Factory)
- Fuente: producto (DEC-010)
- Problema: el GDS vive en gw2-factory-dashboard/gds. Si la webapp lo adopta copiándolo, las dos copias divergen
- Beneficiario: mantenimiento de ambos productos
- Valor: evita deuda futura
- Alternativa: copiar con número de versión y un test que compare
- Prioridad: BAJA hasta que la webapp vaya a adoptar el GDS. En ese momento pasa a ALTA y la decide la Factory, sin pedido a Pablo (DEC-022)
- Costo: S

## DISC-008 — Verificación medida de que DEV ya no usa GitHub Pages

- Estado: ANALIZADO
- Área: panel
- Fecha: 2026-10-20 (origen: BL-025, postergada en MC-5)
- Última revisión: 2026-10-20
- Fuente: producto (panel, DEC-011)
- Problema: REQ-002 solo se cierra si Pablo responde; el panel podría comprobarlo solo
- Beneficiario: Pablo (un paso menos)
- Valor: bajo; agrega una llamada a la API por lectura (RSK-005)
- Alternativa: responder REQ-002 con un botón
- Prioridad: BAJA
- Costo: S

## DISC-009 — El backup del Gist guarda una foto de seguridad que no se puede restaurar desde la pantalla

- Estado: ANALIZADO
- Área: app
- Fecha: 2026-10-22
- Última revisión: 2026-10-22
- Fuente: legado de QwenPaw (ALERT-184, MIG-6), verificado contra DEV: `gist-sync.js` saca la foto `gn:github:gist_snapshot` antes de pisar los datos con el Gist, pero `index.html` no llama a `restoreSafetySnapshot` en ningún lado
- Problema: si una descarga del Gist pisa datos buenos, la foto existe pero el jugador no tiene un botón para volver a ella
- Beneficiario: todo jugador que usa el backup en la nube
- Valor: completa una red de seguridad que hoy está a medias; protege la lista de cuentas
- Alternativa: restaurar desde la consola del navegador (no es razonable pedírselo a un jugador)
- Prioridad: ALTA (protege datos del usuario)
- Costo: S
- Nota: la pantalla del Gist vive en `index.html` (69 KB, LES-028), así que el botón tiene que montarse desde un `.js`. Entra a READY cuando haya lugar.

## DISC-010 — Modo legendario del raid Nexus of Eternity

- Estado: ANALIZADO
- Área: actividades y metas
- Fecha: 2026-10-22
- Última revisión: 2026-10-22
- Fuente: legado de QwenPaw (PRE_BACKLOG idea 3); logros verificados en MIG-1 (`docs/GW2-API-HECHOS.md`): 9472 modo desafío y 9478 "Legendary Conqueror of Vloxx"
- Problema: el Raid Tracker no muestra el avance en los modos desafío y legendario del raid más nuevo. En el legado el dato se descargaba y no se dibujaba (LES-029): no se copia, se hace con su pantalla
- Beneficiario: jugadores de raids
- Valor: contenido nuevo (Visions of Eternity), sin alternativa en español
- Alternativa: gw2efficiency y la wiki (en inglés)
- Prioridad: MEDIA
- Costo: S
- Nota: `raid-tracker.js` pesa 100 KB: o micro-ciclo de archivo grande (DEC-021) o un módulo aparte que se enganche a la pantalla de raids.

## DISC-011 — Panel de Homestead

- Estado: ANALIZADO
- Área: app
- Fecha: 2026-10-22
- Última revisión: 2026-10-22
- Fuente: legado de QwenPaw: `js/homestead-tracker.js` (20 KB) y su panel, nunca validados por Pablo ni llegados a La Bóveda; endpoints `/v2/account/homestead/decorations`, `/v2/homestead/glyphs` y `/v2/homestead/decorations/categories` (los glyphs llegan como texto, no como número)
- Problema: no hay forma de ver qué decoraciones y glyphs del homestead faltan
- Beneficiario: jugadores de Janthir Wilds que decoran su homestead
- Valor: probable; sin demanda medida todavía
- Alternativa: la wiki y el juego
- Prioridad: BAJA (provisoria)
- Costo: M
- Esperando criterio: es una sección nueva de La Bóveda (alcance funcional), la decide Pablo. Mi recomendación: después de DISC-009 y DISC-010. Si se hace, se parte del código del legado y vuelve con él su test `alert86-censo-clasificacion`.
