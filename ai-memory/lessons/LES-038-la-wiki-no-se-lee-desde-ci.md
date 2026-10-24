# LES-038 — La wiki oficial no se lee desde CI: cada dato copiado lleva su página y su fecha

- Fecha de registro: 2026-10-24
- Origen: BL-070 RAI-3 (RUN-026, RUN-027, `assets/data/raids/rewards.json`)

## Qué pasó

Para las recompensas de los 46 encuentros de Raids armé una sonda que leía la wiki oficial desde CI con la API de MediaWiki. Todas las vías (`api.php`, `index.php?action=raw`, `Special:Export`, en `wiki.guildwars2.com` y `wiki-en.guildwars2.com`, con dos agentes distintos) devolvieron la misma página HTML de 6.792 bytes en lugar del contenido: la wiki filtra a los servidores de CI. La sonda «pasó» y no trajo nada (RUN-026: 46 «ERROR fetch»). La API oficial del juego sí responde desde CI, pero no tiene el contenido de los cofres.

Los 36 cofres semanales y 12 cofres magníficos salieron de las páginas de la wiki por búsqueda, una por una, con su id de la API. Una página oficial no apareció (Vloxx's Coffer) y usé una copia de la wiki que lo dice en la ficha. Dos cofres magníficos (Void y Decima) no los pude leer: la ficha lo dice y enlaza la wiki; no se inventan.

## Lección

1. Antes de construir una sonda grande contra un sitio externo, probar con un pedido chico que el sitio responde desde CI con el tipo de contenido esperado (RUN-027 lo hizo en un minuto).
2. Cuando la fuente no se puede leer en automático, cada dato copiado guarda su página y la fecha de consulta en el archivo de datos, y la pantalla la muestra («Fuente: wiki oficial, … consultada el …»).
3. Lo que no se pudo verificar se dice en pantalla con su enlace; no se completa por parecido con otro cofre (LES-030).
4. Dos fuentes que no coinciden se resuelven con la tabla general: la página de Keep Construct dice 15 fragmentos; la tabla de «Magnetite Shard» dice 12 (+10), igual que el catálogo. Gana la tabla (LES-026).

## Cómo aplicar

- Sondas a sitios de terceros: primero una sonda de acceso de un solo pedido.
- Datos copiados de la wiki: campo `page` por entrada, `verified` por archivo y un test que exija que cada `page` sea de `wiki.guildwars2.com`.
