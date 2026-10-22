# STATUS

Estado: EN CURSO
Tarea actual: BL-050 hecho: PSNA y Armería en producción (5 archivos, blobs idénticos a DEV). Sigue BL-043 MIG-2a.
Motivo: Pablo validó en pantalla los arreglos de la Armería y aprobó la propuesta del árbol ("me encanta"). El producto va primero: lo que el jugador ve vale más que la migración.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-22T04:35Z
Próxima acción: MIG-2a — generadores de la Armería del legado a `tools/legendary/` (BL-043). Si Pablo manda lo que dice el aviso de íconos en producción, eso va primero.
Recuperación (SHIRUVANA-RECOVERY-001, 04:22Z, interrupción MCS-4035 durante PRD-9): reconstruida desde commits y blobs; no se repitió nada. PRD-6 a PRD-8 ya estaban; PRD-9 y PRD-10 se hicieron después del checkpoint `8355803`.

Micro-ciclo:
MIG-2a — generadores de datos de la Armería a tools/legendary/ (BL-043)
Archivos:
tools/legendary/README.md

Plan (orden por valor para el jugador):

- ARM-1 "Tengo" siempre en 0 (BL-045). Hecho (`52363f5`).
- ARM-2 chips "Abalorio" y "Espaldar" y expansión real de cada legendaria (BL-046, partes 1 y 2 juntas: mismo archivo). Hecho (`4db8e88`).
- PSN-1 el PSNA dice qué día muestra y cambia solo a las 08:00 UTC (BL-044). Hecho (`7cbf9c8`).
- PSN-2 PSNA renovado (BL-048): ícono local del waypoint, día y cuenta regresiva en grande, lugares como botones. Hecho (`8d03631`).
- ARM-4 árbol de receta y totales con el diseño aprobado (BL-047): `js/legendary-tree-ui.js` 2.0.0 y `tests/legendary-tree-ui.test.cjs` (9 tests, 12/12 mutaciones). Hecho.
- Pablo vio ARM-4 (23:18Z): el diseño gusta pero dentro del modal de 680 px queda comprimido, sin aire. Pidió ir a algo como la propuesta: una ficha grande de pantalla completa. Me dio vía libre para rediseñar sin consultarle; lo prueba al volver.
- ARM-5 ficha de pantalla completa en `legendary-tree-ui.js` 2.1.0 (BL-047). Hecho (`08021c9`).
- ARM-6 la ficha en el tracker 1.2.0: diálogo de 96vw × 94vh, cabecera grande, respaldo de ícono y nombre desde el catálogo. Hecho (`e4e2ede`); tests en el commit de cierre.
- Pablo probó la ficha (03:34Z): los íconos siguen sin cargar y el tamaño todavía no lo convence; pidió que sea directamente una pantalla, como la propuesta, sin consultarle ("resolvé con tu criterio").
- ARM-7 estilos de la pantalla en `legendary-tree-ui.js` 2.2.0 (BL-049). Hecho (`21800ad`).
- ARM-8 la legendaria como pantalla dentro de la Armería, íconos del árbol primero, respaldo directo y aviso con Reintentar, en `legendary-tracker.js` 1.3.0 (BL-049). Hecho (`3b96bf8`).
- PRD-6 a PRD-10 promoción a producción por orden de Pablo (BL-050): `aca6dd7` psna-schedule.json, `de1c34d` activities.js, `b57bc7b` render-catologo.js, `6277d33` legendary-tree-ui.js, `dd5c0c6` legendary-tracker.js. Hecho, blobs verificados.
- Después: sigue BL-043 en MIG-2a.

Plan FACTORY-ASSET-001, en pausa (los dos repos siguen en solo lectura; migrar es copiar a DEV):

- ASSET-1 — inventario de los dos repos (estructura, documentos, herramientas, workflows, actividad). Hecho.
- ASSET-2 — clasificación con motivo: conocimiento, documentación, herramientas, producto solo en agents, qué archivar. Hecho.
- ASSET-3 — informe y REQ-010. Hecho.
- MIG-1 hechos de la API. Hecho (`20d53ff`): `docs/GW2-API-HECHOS.md` y LES-029. Al verificar, corregí el legado: el logro 9478 sí existe (desafío legendario de Vloxx) y el 9472 es el modo desafío.
- Aprobado (RESP-010), sigue: MIG-2 generadores de la Armería → MIG-3 arreglo de totales → MIG-4 tests por tandas → MIG-5 documentación (BL-004) → MIG-6 discovery → archivo (acción de Pablo).

Hecho antes, BL-042: FEAT-005 en producción (gw2-wallet-ligero `36010ab`, `2bab20f`; vuelta atrás `4629e7e`).

## Resumen de la sesión

- En producción por orden de Pablo (BL-050): el PSNA renovado y la Armería nueva (la legendaria como pantalla, "Tengo" real, Abalorio y Espaldar, expansiones reales y respaldo de íconos). Vuelta atrás: `2bab20f`.
- Armería: la legendaria ahora se abre como pantalla dentro de la Armería (BL-049), con "← Volver", la receta a página completa y Materiales totales fijo al costado. Los íconos se piden primero para el árbol abierto, con un respaldo directo a la API, y si fallan la pantalla lo dice con "Reintentar".
- Pablo validó el PSNA renovado (23:18Z: "espectacular").
- PSNA renovado (BL-048): volvió el ícono del waypoint (el de la wiki dejó de cargar; ahora se sirve desde La Bóveda), el día y la cuenta regresiva se ven en grande y corren solos, y cada lugar es un botón grande que dice "Copiar" y confirma "✓ Copiado".
- Pablo validó en pantalla la Armería (BL-045 y BL-046) y aprobó la propuesta del árbol de receta (BL-047). PSNA: el panel ahora dice de qué día son los lugares y se actualiza solo a las 08:00 UTC (BL-044).
- Armería en DEV: la columna "Tengo" ya lee tu banco y tu almacén de materiales; los chips dicen Abalorio y Espaldar; cada legendaria tiene su expansión real (Klobjarne Geirr en Janthir Wilds, Verano Infinito en Visions of Eternity) y el catálogo se ordena por expansión.
- Pablo validó FEAT-004 en producción y encontró 5 problemas en DEV: 4 en la Armería y 1 en el PSNA. Los registré (BL-044 a BL-047) y los atiendo antes de seguir con la migración.
- Hechos de la API del legado en DEV, verificados de nuevo (MIG-1): el límite real es 300 pedidos por minuto por IP, y el modo legendario de Nexus tiene dos logros (9472 y 9478), no uno.
- Pablo aprobó la migración del legado de QwenPaw (REQ-010, opción A) y apagó el GitHub Pages de los dos repos: la copia vieja de La Bóveda ya no comparte datos con producción.
- FACTORY-ASSET-001: analicé el legado de QwenPaw. Lo más valioso: unos 90 archivos de tests del producto, los generadores de datos de la Armería y un panel de Homestead sin validar. Propuesta en REQ-010.
- FEAT-005 en producción por orden de Pablo (BL-042).
- Meta & Eventos en DEV: 5 metas nuevas de Janthir Wilds y Visions of Eternity, la Convergencia del Nexo de la Eternidad, Secretos del Bosque cada 2 h, Monte Balrior en Janthir y el filtro "Convergence" funcionando (FEAT-005, BL-034).
- Primer deploy a producción: La Bóveda tiene la marca Gato Negro, el theme oficial y mi voz (FEAT-004, BL-039).
- La Guarida (https://pablosnchz.github.io/la-guarida/) lleva el gato oficial, el theme Gato Negro por defecto (Bóveda queda como opción) y la bio con los colores oficiales; además, el theme guardado ahora se aplica al recargar.
- Encontré credenciales de Twitch y YouTube publicadas en el código de La Guarida (RSK-019): necesito que las revoques o restrinjas.

## Esperando a Pablo

- [RSK-019] Acción: Revocá el token de Twitch que está en `la-guarida/js/widgets.js` (dev.twitch.tv → Console) y restringí la API key de YouTube a `pablosnchz.github.io` en Google Cloud (o regenerala). Avisame cuando esté y saco los valores del código.
- [BL-050] Validación: abrí producción (https://pablosnchz.github.io/gw2-wallet-ligero/) con Ctrl+F5: Actividades (PSNA) y Armería (tocá una legendaria). Si los íconos no aparecen, mandame lo que dice el aviso amarillo ("N de M").

## Para tu información

- [FEAT-002] Usaste DEV y lo que encontraste es de la Armería, no de Analytics: doy FEAT-002 por validada.
- [FACTORY-ASSET-001] Por un error mío quedó creada la rama `__never__` en gw2-wallet-agents. Es idéntica a `main` y no cambia nada. Se puede borrar desde GitHub o dejarla hasta archivar el repo (detalle en el informe).
- [BL-042] Metas en producción: si no ves Visions of Eternity en el filtro, recargá con Ctrl+F5.
- [BL-040] La Guarida: si no ves el cambio, recargá con Ctrl+F5. Tus favoritos, categorías y widgets no se tocaron.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
