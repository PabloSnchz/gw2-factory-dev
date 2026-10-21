# Hechos de la API de Guild Wars 2

Datos de la API que La Bóveda necesita y que no son obvios desde la documentación. Cada hecho tiene su fuente y la fecha en que lo verifiqué.

- Origen: lo que aprendió el modelo anterior (gw2-wallet-agents), filtrado y vuelto a verificar en FACTORY-ASSET-001 (MIG-1, REQ-010).
- Regla: un hecho entra acá solo si lo verifiqué contra la fuente. Si cambia, se corrige la fila y se deja la fecha nueva (LES-026, LES-029).
- Última revisión: 2026-10-21.

## Límite de pedidos (429)

| Hecho | Fuente | Verificado |
|---|---|---|
| El límite es **por IP**, compartido por todas las apps y pestañas de esa red. | Wiki, API:Best practices · Blish HUD | 2026-10-21 |
| Funciona como un balde: **300 pedidos de ráfaga** y se recarga a **5 por segundo (300 por minuto)**. Pasado eso, la API responde 429. | Wiki, API:Best practices · GW2SDK | 2026-10-21 |
| El encabezado `X-Rate-Limit-Limit` dice 600, pero el límite real es 300 por minuto. No hay que confiar en el encabezado. | Blish HUD · GW2SDK | 2026-10-21 |
| Se pueden pedir **hasta 200 IDs** en un solo pedido con `?ids=1,2,3`. Siempre conviene agrupar. | Wiki, API:Best practices · GW2SDK | 2026-10-21 |
| Las claves válidas a veces responden "Invalid key" de forma aleatoria. Hay que reintentar más tarde antes de marcarlas como inválidas. | Wiki, API:Best practices | 2026-10-21 |

Qué significa para La Bóveda: con 27 cuentas, una vista que hace 12 pedidos por cuenta suma 324 pedidos y pasa la ráfaga de 300. Cualquier vista que recorra todas las cuentas tiene que agrupar IDs, usar caché o espaciar los pedidos.

## Raid Nexus of Eternity (Visions of Eternity)

| Logro | ID | Qué pide | Puntos | Verificado |
|---|---|---|---|---|
| Legendary Nexus of Eternity | **9472** | Vencer a Vloxx con el modo desafío activo | 15 | 2026-10-21 (gw2treasures, wiki) |
| Legendary Conqueror of Vloxx | **9478** | Vencer a Vloxx después de elegir un desafío legendario en el modo desafío. Da el título 649 | 0 | 2026-10-21 (gw2treasures en 3 idiomas, wiki) |

**Corrección al legado:** el modelo anterior registró que "el 9478 no existe" (ALERT-272). Era cierto cuando lo probó, pero el logro se agregó a la API después (build 208574). Hoy existe. Además, el 9472 lleva "Legendary" en el nombre pero corresponde al **modo desafío**, no al desafío legendario. Un seguimiento del "modo legendario" tiene que decidir cuál de los dos muestra, o mostrar los dos.

## Permisos de las API keys

| Endpoint | Permisos | Verificado |
|---|---|---|
| `/v2/account/buildstorage` (plantillas guardadas) | `account`. No pide `inventories` ni `builds` | 2026-10-21 (wiki) |
| `/v2/account/homestead/decorations` | `account`, `unlocks` | 2026-10-21 (wiki) |
| `/v2/account/homestead/glyphs` | `account`, `unlocks` | 2026-10-21 (wiki) |

## Homestead

| Hecho | Fuente | Verificado |
|---|---|---|
| `/v2/account/homestead/decorations` devuelve objetos `{ id, count }`. Si la cuenta no desbloqueó el Homestead, devuelve una lista vacía. | Wiki | 2026-10-21 |
| `/v2/account/homestead/glyphs` devuelve **una lista de textos** (por ejemplo `"volatility_harvesting"`), no objetos. Se resuelven contra `/v2/homestead/glyphs`. | Wiki · legado (commit `ca673ac`) | 2026-10-21 |
| `/v2/homestead/glyphs/{id}` devuelve `{ id (texto), item_id, slot }`. | Wiki | 2026-10-21 |
| Las categorías están en `/v2/homestead/decorations/categories`. El índice `/v2/homestead` anuncia `decorationcategories` (error de la API) y no anuncia `glyphs`. No hay que construir rutas desde ese índice. | Wiki (marcado como error de la API) | 2026-10-21 |

## Fractales

| Hecho | Fuente | Verificado |
|---|---|---|
| No hay endpoint para los LI de fractales ni para las inestabilidades del día. Solo se puede marcar el logro de cada nivel del modo desafío: 9423, 9412, 9373 y 9388. | Legado (DECISIONS_LOG C1–C3) | Heredado, sin volver a verificar. Verificarlo antes de usarlo |

## Eventos

| Hecho | Fuente | Verificado |
|---|---|---|
| `/v2/events` está retirado. Los horarios de metas salen de `assets/meta-events.json`, que se verifica a mano contra 3 fuentes (FEAT-005). | `js/meta.js` · LES-026 | 2026-10-21 |
