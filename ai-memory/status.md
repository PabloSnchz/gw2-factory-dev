# STATUS

Estado: EN CURSO
Tarea actual: BL-043 migración del legado de QwenPaw, MIG-4: tests del legado a DEV por tandas, por CI (DEC-029). MIG-2 (generadores de la Armería) terminado.
Motivo: DEV tiene 22 archivos de tests; el legado tiene 88 que en su mayoría prueban el mismo código. Es la red de seguridad que le falta a La Bóveda para cambiar código sin miedo.
Fase: F1 — Visibilidad
Etapa actual: DEVELOPMENT
Inicio: 2026-10-21T20:30Z
Última actualización: 2026-10-22T13:58Z
Próxima acción: MIG-4c a 4g tandas → MIG-4h los 15 ROJO uno por uno → MIG-5 documentación (BL-004) → MIG-6 discovery → avisar a Pablo para archivar (pedido de Pablo 2026-10-22 13:27Z).
Recuperación (SHIRUVANA-RECOVERY-001, 04:22Z, interrupción MCS-4035 durante PRD-9): reconstruida desde commits y blobs; no se repitió nada. PRD-6 a PRD-8 ya estaban; PRD-9 y PRD-10 se hicieron después del checkpoint `8355803`.

Micro-ciclo:
MIG-4c a 4g — tandas de tests del legado (BL-043, DEC-029). Cada tanda es una edición de `tools/legacy/importar.txt`; CI copia, verifica y deja el resultado en `tools/legacy/IMPORTACION.txt`. 4c además hace que app-checks corra `tests/*.test.js` y `tests/*.smoke.js`. Tandas: 4c Armería (12), 4d caché y API (24), 4e cuentas, permisos y Gist (23), 4f raids y strikes (7), 4g cartera, Cámara del Brujo y skins (6). Fuera: hb90-t9-mutex (ROJO en el legado y VERDE en DEV: posible inestable).
Archivos:
.github/workflows/app-checks.yml
tools/legacy/importar.txt

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
- GUA-1 a GUA-3 La Guarida como el Centro de decisiones y mi voz (BL-051, DEC-027, repo la-guarida): `593474c` shiruvana.js + test, `fb3533c` index.html + styles.css 2.0.0, `871a44b` README. Hecho, blobs verificados.
- BL-052 (05:10Z): Pablo corrige la dirección de BL-051. Propuesta presentada (maqueta HTML): restyle GDS como launcher, sin datos de la Factory; Shiruvana anfitriona con portal Ctrl+K, «Lo de siempre» (uso local) y consejos de orden (1 por día). Espera aprobación.
- GUA-4 a GUA-7 La Guarida realineada (BL-052, DEC-028, repo la-guarida): `06b0baa` shiruvana.js 2.0.0 + test (13 tests, 22/22 mutaciones), `7a5ce60` ui.js 1.0.0 + test (5 tests), `98b9e5b` index.html + styles.css 2.1.0, `a620948` README. Hecho, blobs verificados; prueba de humo con DOM simulado, data.js y app.js reales (38 comprobaciones).
- Pablo validó en pantalla BL-050 (Bóveda en producción) y BL-052 (La Guarida) (06:15Z) y pidió seguir con MIG-2a.
- MIG-2 en 5 micro-ciclos (la API de GW2 no responde desde el entorno de la Factory: todo se prueba sin red, con cachés de prueba y contra los datos versionados): MIG-2a fetch del catálogo, MIG-2b precios + build de `legendary-data.js`, MIG-2c recetas, MIG-2d precursores, MIG-2e excluir `tools/` de la publicación de DEV.
- MIG-2a hecho (`f365882`): `tools/legendary/README.md`, `tools/legendary/fetch_legendary_items.py` (del legado, blob 6409c472, con `--offline` y la URL pedida en el error) y `tests/legendary-fetch.test.cjs` (7 tests sin red, 11/11 mutaciones). Blobs verificados.
- MIG-2b hecho (`89f2ca4`): `fetch_thematic_prices.py` (precios siempre frescos; ya no traga errores de red) y `build_legendary_data.py`; `tests/legendary-build-data.test.cjs` reconstruye la entrada desde `js/legendary-data.js` y el build devuelve las 206 legendarias idénticas (8 tests, 19/19 mutaciones). Expansiones nuevas: siguen en un solo lugar, `render-catologo.js`.
- Hallazgo MIG-2c: recetas y precursores salían de `tools/cl_recipes.json`, que el legado nunca versionó. Es el `data/CraftyLegend/recipes.json` de crafty_legend (PieOrCake, MIT) en el commit `a24d244` (2026-09-17): 634 recetas, blob 551cedfa, y reproduce las 206 entradas de `js/legendary-recipes.js` sin diferencias. Se fija ese commit y su blob; actualizar es cambiar el commit a propósito.
- MIG-2c hecho (`3f3e0ab`): `fetch_recipes_source.py` (baja crafty_legend fijado a commit y huella, valida la forma) y `build_legendary_recipes.py` (del legado, blob fb02a142); `tests/legendary-build-recipes.test.cjs` (6 tests, 17/17 mutaciones). Con el archivo real de crafty_legend: huella verificada y 0 diferencias en las 206 entradas. Los textos que ve el jugador ya no nombran archivos internos y "Forja Mystica" pasa a "Forja Mística" (se ven al regenerar). Blobs verificados.
- Pablo (13:27Z): seguir con MIG-2d, MIG-2e y MIG-4 a MIG-6, y avisarle al terminar para archivar los dos repos.
- MIG-2d hecho (`f9277e5`): `build_legendary_precursors.py` (del legado, blob 93eecdd0; sin la variable global y sin el chequeo de huérfanas, que nunca podía fallar), `tests/legendary-build-precursors.test.cjs` (4 tests, 15/15 mutaciones) y `tools/legendary/README.md` con los seis pasos y el crédito MIT a crafty_legend. Con el archivo real: 0 diferencias en las 907 entradas (recipe 467, material 436, vendor 4). Blobs verificados.
- MIG-2e hecho (`b1a5fe7`): `dev-pages.yml` ya no publica ni se dispara por `tools/`; `.gitignore` con `tools/legendary/.work/` y `__pycache__/`; `tests/dev-pages.test.cjs` (4 tests, uno arma el sitio con el rsync del workflow; 8/8 mutaciones). Blobs verificados. MIG-2 terminado.
- MIG-4: el legado tiene 88 tests (~1,1 MB), scripts con OK/FAIL, no `node:test`. Pasarlos a mano por la Factory es el límite de LES-027. DEC-029: se migran por CI (el legado es público, MIT; 34 de 47 archivos .js son idénticos a DEV).
- MIG-4a hecho (`da9b830`; publicado sin checkpoint previo: falta mía, registrada acá): `tools/legacy/census.cjs`, `.github/workflows/legacy-tests.yml`, `tests/legacy-census.test.cjs` (4 tests, 11/11 mutaciones). El censo de CI (`b34fc09`, `tools/legacy/CENSO.md`): en el legado 85 VERDE y 3 ROJO; contra DEV 73 VERDE y 15 ROJO; 0 mienten. ROJO: 6 dependen de archivos que solo están en el legado (homestead-tracker.js, tools/hb100-suite.mjs, hb116, los `_build_*.py`, idea84); 5 de la Armería cuya interfaz cambió (BL-047/049); hb114 usa rutas de Windows; para analizar: hb119-t19a (13 de 14 oyentes de `gn:tokenchange`), idea61 (9 FAIL) e idea50f (también ROJO en el legado).
- MIG-4b hecho (`e816d33`): `importTests()` en `census.cjs` (copia la lista desde el legado fijado, la corre en DEV y deshace todo si algo no queda en VERDE) y paso de importación en el workflow, con el resultado en `tools/legacy/IMPORTACION.txt` (RSK-016). 5 tests; 11/11 y 8/8 mutaciones. CI corrió de punta a punta (`bacb188`). Blobs verificados.

Plan FACTORY-ASSET-001, en pausa (los dos repos siguen en solo lectura; migrar es copiar a DEV):

- ASSET-1 — inventario de los dos repos (estructura, documentos, herramientas, workflows, actividad). Hecho.
- ASSET-2 — clasificación con motivo: conocimiento, documentación, herramientas, producto solo en agents, qué archivar. Hecho.
- ASSET-3 — informe y REQ-010. Hecho.
- MIG-1 hechos de la API. Hecho (`20d53ff`): `docs/GW2-API-HECHOS.md` y LES-029. Al verificar, corregí el legado: el logro 9478 sí existe (desafío legendario de Vloxx) y el 9472 es el modo desafío.
- Aprobado (RESP-010), sigue: MIG-2 generadores de la Armería → MIG-3 arreglo de totales → MIG-4 tests por tandas → MIG-5 documentación (BL-004) → MIG-6 discovery → archivo (acción de Pablo).

Hecho antes, BL-042: FEAT-005 en producción (gw2-wallet-ligero `36010ab`, `2bab20f`; vuelta atrás `4629e7e`).

## Resumen de la sesión

- Pablo validó la Bóveda en producción (BL-050: PSNA y Armería) y La Guarida (BL-052). Migración del legado: en DEV ya se puede volver a generar el catálogo de la Armería (MIG-2a y 2b), y encontré la fuente perdida de las recetas: el proyecto abierto crafty_legend.
- La Guarida realineada (BL-052): sigue siendo tu lanzador, con el lenguaje visual del Centro de decisiones y sin datos de la Factory. Yo soy su anfitriona: el portal «¿A dónde vamos?» (Ctrl+K o /), «Lo de siempre» y un consejo de orden como mucho por día (DEC-028).
- La Guarida tiene el aspecto del Centro de decisiones y arriba un resumen mío: qué te pide la Factory y en qué estoy, con un enlace al panel (BL-051, DEC-027). Los 19 themes siguen funcionando y widgets y lanzador ya no desaparecen en pantallas chicas.
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

## Para tu información

- [FEAT-002] Usaste DEV y lo que encontraste es de la Armería, no de Analytics: doy FEAT-002 por validada.
- [FACTORY-ASSET-001] Por un error mío quedó creada la rama `__never__` en gw2-wallet-agents. Es idéntica a `main` y no cambia nada. Se puede borrar desde GitHub o dejarla hasta archivar el repo (detalle en el informe).
- [BL-042] Metas en producción: si no ves Visions of Eternity en el filtro, recargá con Ctrl+F5.
- [BL-040] La Guarida: si no ves el cambio, recargá con Ctrl+F5. Tus favoritos, categorías y widgets no se tocaron.
- [RSK-016] La Factory no puede leer el resultado de CI. Lo compensa verificando todo en local antes de publicar. No necesitás hacer nada.

## Bloqueos

- BL-031: `node --check` de `js/*.js` — bloqueado por entorno: la Factory no puede leer CI ni abrir PR (RSK-016).
