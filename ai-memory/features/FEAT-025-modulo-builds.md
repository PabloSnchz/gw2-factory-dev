# FEAT-025 — Módulo Builds (BL-082)

- Estado: EN DEV, completo (BLD-1 a BLD-15, BUI-1 a BUI-6, BENCH-1/BENCH-2 y CUR-1). Espera que Pablo mire BENCH-2; la curación semanal corre sola desde el 2026-11-02 (2026-10-30 00:35Z)
- Dónde: https://pablosnchz.github.io/gw2-factory-dev/#/builds (Sidebar → Builds, antes de Cuentas)
- Pedido: Pablo, 2026-10-28 03:41Z. Decisiones D1–D6 aprobadas 03:58Z («sí a todo»). Propuestas: docs/propuestas/propuesta-builds-bl082.html (módulo), docs/propuestas/propuesta-builds-ui-bl082.html (interfaz BUI, U1 aprobado 2026-10-29 01:28Z) y docs/propuestas/bui6-maqueta.html (BUI-6). Orden BUI-6 → BENCH-1 → BENCH-2 → CUR-1 aprobado 2026-10-29 18:55Z.

## Qué hace

Marco común (js/bld-view.js 1.5.0), como Cuentas y la Heredad (BUI-6/6b): un solo marco con el gradiente del módulo en el panel, cabecera sin caja propia cerrada por una línea, con ícono, subtítulo, píldora del último parche de balance y 4 indicadores (builds curadas, élites cubiertas, para revisar, Mis builds); 4 pestañas debajo de la línea con ícono elegido por Pablo (GNKit 1.4.0: Biblioteca 1228891, Editor 63127, Mis builds Cuentas/255373, Importar 155033) y contador; menú ⋯ común que se cierra tocando afuera o con Escape. Cada tarjeta lleva arriba una franja de 56 px de borde a borde con el arte oficial de su élite y el color de su profesión.

1. **Biblioteca** (js/bld-lib.js 1.7.0, BLD-7/8/10/15, BUI-2, BENCH-1/2): 104 builds curadas (assets/data/builds/catalog.json).
   - Cobertura: PvE 36/36 élites, WvW 36/36 (29 vigentes + 7 «para revisar»), PvP 32/36.
   - Filtros: las 9 profesiones como íconos oficiales y, al elegir una, sus 4 élites con emblema; modo y rol como chips; «Más filtros» con arma, daño, vigencia y texto. Profesión + modo + rol = 3 toques. Orden opcional «Más DPS primero».
   - Tarjeta: emblema de la élite, bench de daño o referencia (ver abajo), «Copiar código» (principal), «Ver ficha» (o tocar la tarjeta) y menú ⋯ con guardar, fuente y «Avisar que está vieja» (issue de GitHub ya escrito, A6 sin servidor).
   - Vigencia (D4): cada build guarda el parche para el que fue revisada; si es anterior al último parche de balance (catálogo o vigía), queda «para revisar».
2. **Editor** (js/bld-editor.js 1.3.0, BLD-5/12/13, BUI-3): profesiones con su emblema; cada línea con el fondo oficial de su especialización y los rasgos como íconos (el lector dice nombre y si está elegido); barra de 5 casilleros con ícono que abren un selector (tierra y agua; la del Retornado la ponen sus leyendas); mascotas del Guardabosques; código de plantilla en vivo; validación contra /v2 (D3); panel «Equipo y código AE2»: sugerencia de estadísticas, runa, reliquia y sigilos por reglas (D2, js/bld-gear.js), qué ya tenés en la Armería legendaria (si hay API key) y copiar el código AE2 (C3, js/bld-ae2.js).
3. **Mis builds** (js/bld-mine.js 1.4.0 + js/bld-store.js, BLD-6/B7, BUI-4, BENCH-2): la misma tarjeta de la Biblioteca, con el bench de la build en que se basa o la referencia; menú ⋯ con editar en el Editor, duplicar y borrar (con confirmación a la vista). Guardadas en este navegador, viajan en el respaldo (settings-manager 1.1.0).
4. **Importar** (js/bld-import.js 1.0.0, BLD-4/C1): pega un código [&DQ…] o AE2:… (sanitizado), muestra la ficha con el emblema, guarda o abre en el Editor.

En toda ficha (js/bld-show.js 1.1.0): emblema grande de la élite, copiar código, enlace para compartir (#/builds/c/<código>, C4) y enlace a gw2skills.net (D5). Íconos y nombres oficiales desde la API (js/bld-ref.js 1.2.0, guardados en el navegador).

## Bench de daño (BENCH-1 y BENCH-2, DEC-042 y DEC-043)

- Datos: assets/data/builds/bench.json = los 188 benchmarks públicos de Snow Crows (DPS contra el golem, máximo y promedio, registro de dps.report), leídos el 2026-10-29. Es el techo ideal: en una pelea real se hace menos (lo dice el pie).
- **Bench exacto** (BENCH-1, bld-lib 1.6.0): la build de PvE de Snow Crows cuya dirección coincide muestra máximo, promedio, «% de la mejor», barra y registro. Hoy 20 de las 36 builds de PvE del catálogo.
- **Referencia por parecido** (BENCH-2, js/bld-bench.js 1.0.0): sin bench exacto no invento un número. Busco la build MEDIDA más parecida: misma profesión y élite (obligatorio), después tipo de daño (+4), rol de bendiciones (+2; «boon» genérico +1) y cada arma en común (+1); a igual puntaje, la de más DPS. Se muestra con la etiqueta «Referencia», barra rayada y la frase «No es el DPS de esta build: … es la medición más parecida (misma élite, mismo tipo de daño, …)».
  - Biblioteca: solo PvE y solo si la build hace daño; curación y tanque siguen diciendo por qué no hay número.
  - Mis builds: si el código o la fuente son de una build de la Biblioteca con bench, muestro ese bench («la build de la Biblioteca en que se basa»; si cambiaste el código, aviso que tu DPS puede ser otro). Si no, busco la build de la Biblioteca más parecida por líneas y rasgos (desde 50 %): si es de WvW/PvP o de curación lo digo sin número; si es de PvE, la referencia hereda su daño y rol y usa las armas de tu código. Si nada se parece, la referencia usa solo la élite (o el núcleo) y lo dice.
  - Mis builds no necesita pasar por la Biblioteca: pide el catálogo y el bench una sola vez (GNBldLib.preload) y vuelve a dibujar.

## Temas, teclado, lector, celular y rendimiento (BUI-5, DEC-040)

- Contraste WCAG AA en los 19 temas: texto 4.5:1, acento y foco 3:1. El acento, el verde, el rojo y el foco se mezclan con el texto de cada tema; lo elegido y el botón principal van sobre --bg-0 al 14 %. Guarda: tests/bld-ui.test.cjs (lee css/themes/ y el CSS real; falla si un tema nuevo o una mezcla no llega; desde BUI-6b también mide el tinte de las 9 profesiones y el gradiente de la cabecera).
- Teclado: pestañas con flechas, Inicio y Fin; foco visible; todo lo que se toca es un botón nativo; Escape cierra menú y selector y devuelve el foco.
- Lector: grupos con nombre, aria-pressed en lo elegible, avisos con role=status/alert, «copiado» se lee. Las barras del bench son adorno (aria-hidden): el número va en texto.
- Celular: controles de 44 px a 720 px, indicadores en 2 columnas a 900 px, tarjetas en 1 columna a 560 px, sin animaciones si el sistema lo pide.
- Rendimiento: filtrar y dibujar las 104 builds ~2 ms (requisito: menos de 2 s; editor menos de 200 ms); catálogo 52 KB y bench 22 KB; los códigos del catálogo se leen una vez para el parecido; los emblemas cargan a medida que se ven; los 12 módulos solo se cargan al entrar a #/builds.

## Vigía y curación semanal, y Discord (BLD-10/14, CUR-1, D4/D6, DEC-041, DEC-044)

- .github/workflows/builds-watch.yml: lunes 12:00 UTC (09:00 en Argentina) o a mano. Portátil: corre igual en DEV y en PRD (rama por defecto, se saltea en forks, republica con dev-pages.yml solo si existe; en PRD alcanza el push). Commitea solo watch.json, bench.json y catalog.json, y solo si cambiaron. Requisito en PRD: Actions con permiso de escritura.
- .github/scripts/bld-watch.cjs (vigía): lee el parche declarado en páginas públicas de MetaBattle (también partido por etiquetas, LES-042) y /v2/build; actualiza watch.json.
- .github/scripts/bld-curate.cjs (CUR-1, DEC-044): rehace bench.json desde los benchmarks de Snow Crows y relee la página de origen de cada build del catálogo. Cambia sola: código y armas (si la fuente muestra otro código válido de la misma élite), fecha de la fuente y parche (MetaBattle: el declarado; Snow Crows: el último solo si la fuente se actualizó después). Lo que no puede resolver (404, sin código, otra élite, varios códigos) queda igual y anotado en catalog.review. Nunca borra ni agrega builds. Frenos: no pisa el bench si trae menos de 20 filas o menos del 60 %; no toca el catálogo si responde menos del 70 % de las páginas. Resumen de cada corrida en Actions.
- Discord: solo si existe el secreto DISCORD_WEBHOOK_URL en el repo (opcional, lo configura Pablo). Sin @everyone.
- Probado en seco contra las fuentes reales (RUN-216): las 188 filas del bench leídas coinciden con las curadas a mano en BENCH-1; 25 fichas sin diferencias.

## Archivos

js/bld-code.js, bld-ref.js, bld-show.js, bld-store.js, bld-ae2.js, bld-gear.js, bld-view.js, bld-bench.js, bld-lib.js, bld-import.js, bld-editor.js, bld-mine.js (ruta #/builds en js/modules.json, cargados solo al entrar: boot.js 1.2.0); gn-kit.js 1.4.0 (íconos de pestañas); router.js 2.22.0; sidebar-nav.js 2.3.0; settings-manager.js 1.1.0; assets/data/builds/catalog.json, bench.json y watch.json. Tests: tests/bld-*.test.cjs (incluye bld-ui y bld-bench) y .github/scripts/bld-watch.test.cjs y bld-curate.test.cjs. Curación semanal: .github/scripts/bld-curate.cjs. Para sumar builds nuevas (curación con criterio, a mano por diagnóstico): tests/bld-curate*.smoke.cjs y tests/bld-curate-lib.cjs.

## Para validar

1. Biblioteca: tocar Guardián, después WvW y Apoyo; copiar un código y pegarlo en el juego (panel de plantillas).
2. Editor: armar una build del Retornado y una del Guardabosques y probar el código en el juego.
3. Importar un código de Snow Crows/MetaBattle y uno AE2.
4. AE2: pegar el código del panel de equipo en el playground de Alter Ego.
5. Mis builds: guardar, duplicar, borrar; exportar el respaldo e importarlo.
6. Interfaz: cabecera con 4 indicadores, pestañas con sus íconos, menú ⋯ que se cierra tocando afuera; cambiar a un tema claro (Notion o macOS) y a uno oscuro: todo se lee.
7. Bench: PvE + «Más DPS primero»; una build con bench exacto muestra su DPS; una de PvE sin bench muestra «Referencia» con su porqué; una de curación dice que no se mide.
8. Mis builds: guardar una build de la Biblioteca con bench (muestra ese bench), cambiarle algo en el Editor y guardarla (avisa que tu DPS puede ser otro), e importar un código propio (muestra la referencia más parecida).
9. Curación semanal (opcional, antes del lunes): GitHub → gw2-factory-dev → Actions → builds-watch → Run workflow; el resumen dice qué leyó y qué cambió.

## Límites conocidos

- D1 (comparador DPS/APM): el simulador de Snow Crows no tiene datos públicos; el bench sale de sus benchmarks publicados (DEC-042, corrige DEC-039). Mi referencia nunca es un DPS calculado de tu build.
- La referencia elige, a igual parecido, la medición de más DPS: es un techo de esa forma de jugar, no un promedio (DEC-043).
- 7 builds de WvW (MetaBattle) declaran un parche anterior: se muestran «para revisar» (DEC-039).
- La curación semanal no agrega builds nuevas ni élites que falten (PvP 32/36): eso sigue siendo curación con criterio. Si Snow Crows o MetaBattle cambian la forma de sus páginas, los frenos evitan pisar datos buenos y la corrida lo dice en su resumen.
- En los temas claros el verde de «válida» se ve más oscuro que en los oscuros: es a propósito para que se lea (DEC-040).
- Deuda BAJA: las reglas CSS de .bld-bench están en bld-lib y en bld-bench (Mis builds puede abrirse sola); bld-mine suma su oyente de clic en cada render (heredado de BLD-6).
