# MEMORY INDEX

Índice de la memoria oficial de la Factory. Una línea por entrada. El detalle vive en cada archivo.
Convenciones: ver [DEC-002](decisions/DEC-002-convenciones-ai-memory.md) y contrato de datos [DEC-009](decisions/DEC-009-contrato-de-datos-ai-memory.md).

Lectura obligatoria antes de cualquier trabajo: `status.md` → `backlog.md` → `memory-index.md` → respuestas de Pablo pendientes en `responses/` (procesarlas primero, DEC-011).
Pedidos a Pablo: [requests/](requests/). Respuestas de Pablo: [responses/](responses/README.md).
Planificación: [roadmap.md](roadmap.md). Riesgos: [risks.md](risks.md). Informes de misión: [missions/](missions/FACTORY-001B-informe-final.md).
Oportunidades: [discovery.md](discovery.md) (abiertas) y [discovery-archive.md](discovery-archive.md) (historial). Reglas en DEC-015, DEC-016, DEC-017 y DEC-020.
Panel: https://pablosnchz.github.io/gw2-factory-dashboard/

## DECISIONS

- [DEC-001](decisions/DEC-001-rol-del-repositorio.md) — gw2-factory-dev es el entorno DEV de la Factory; base = copia de producción al 2026-10-03.
- [DEC-002](decisions/DEC-002-convenciones-ai-memory.md) — Estructura, IDs (DEC/LES/FEAT/BL), formato y codificación UTF-8 de ai-memory.
- [DEC-003](decisions/DEC-003-docs-vs-ai-memory.md) — `docs/` documenta el producto; `ai-memory/` es la memoria de la Factory. Se enlazan, no se duplican.
- [DEC-004](decisions/DEC-004-invariantes-de-arquitectura.md) — Invariantes técnicas: CSS 3 capas, router-first, `gn:tokenchange`, Storage API, IIFE + `window.*`.
- [DEC-005](decisions/DEC-005-entorno-dev-publicado.md) — REEMPLAZADA por DEC-026 (2026-10-21): DEV en Vercel con origen propio para no compartir `localStorage` con PROD.
- [DEC-006](decisions/DEC-006-desacople-google-analytics.md) — ACEPTADA (2026-10-20): DEV sin Analytics; GA solo en el host de producción + guard de repo en el workflow GA4.
- [DEC-007](decisions/DEC-007-dashboard-fuente-factory.md) — REEMPLAZADA por DEC-008: adaptar el dashboard histórico.
- [DEC-008](decisions/DEC-008-dashboard-factory.md) — Dashboard nuevo (gw2-factory-dashboard): observa el trabajo, no a los trabajadores; sin scripts locales.
- [DEC-009](decisions/DEC-009-contrato-de-datos-ai-memory.md) — Contrato de datos v2 de ai-memory: status.md por claves, risks.md, formatos de backlog y entradas.
- [DEC-010](decisions/DEC-010-gato-design-system.md) — Gato Design System 1.0: tokens en 3 niveles, paleta La Bóveda ajustada a AA, componentes y reglas verificadas en CI.
- [DEC-011](decisions/DEC-011-intercambio-de-decisiones.md) — Contrato v3: la Factory pide en requests/, Pablo responde en responses/, la Factory procesa al iniciar cada sesión.
- [DEC-012](decisions/DEC-012-canal-de-respuesta.md) — Pablo responde desde el panel: botón → issue prellenado → workflow escribe el RESP, comenta y cierra. Sin tokens en el navegador.
- [DEC-013](decisions/DEC-013-centro-de-decisiones-gds.md) — El panel es un Centro de decisiones sobre el GDS: lo que necesita a Pablo primero, IDs como referencia, errores del canal visibles.
- [DEC-014](decisions/DEC-014-autonomia-continua.md) — ACEPTADA (2026-10-20, RESP-001): autonomía continua acotada en DEV; pregunta por producción, alcance, dependencias, arquitectura y datos del usuario. Activada por Pablo el 2026-10-20.
- [DEC-015](decisions/DEC-015-discovery-engine.md) — Discovery Engine: la Factory descubre oportunidades en rondas acotadas, sin un agente nuevo; fuentes clasificadas, la de producto primero.
- [DEC-016](decisions/DEC-016-limites-y-promocion.md) — Límites: READY ≤ 5, oportunidades abiertas ≤ 15 (verificados en CI); prioridad ALTA/MEDIA/BAJA; promoción, archivo a 30 días y descarte con motivo.
- [DEC-017](decisions/DEC-017-gobierno-del-backlog.md) — READY contiene solo trabajo ejecutable; ideas y postergados vuelven a discovery; rechazos y devoluciones quedan en DONE con prefijo.
- [DEC-018](decisions/DEC-018-soberania-de-decisiones.md) — Soberanía de decisiones: la Factory decide lo técnico; a Pablo le llegan decisiones (con contexto, impacto, motivo y recomendación), acciones, validaciones e información, separadas.
- [DEC-019](decisions/DEC-019-taxonomia-de-pendientes.md) — Taxonomía: filtro de 3 preguntas; decisión, acción, validación funcional e información van a Pablo; validación técnica, bloqueos (con dueño) y riesgos no; máximo 3 decisiones abiertas.
- [DEC-020](decisions/DEC-020-discovery-v2.md) — Discovery v2: áreas; lo detienen solo una decisión estratégica del área, un riesgo CRÍTICO o una restricción explícita; latido de 14 días; vista Ideas sin promoción automática.
- [DEC-021](decisions/DEC-021-tamano-de-micro-ciclo.md) — Tamaño de micro-ciclo: 1 objetivo, ≤ 3 archivos, 1 repo, ≤ 1 DEC, ≤ 20 min y ≤ 40 KB, todos a la vez; escrituras en serie, publicación incremental y manifiesto en status.md.
- [DEC-022](decisions/DEC-022-conflictos-entre-reglas.md) — Conflictos entre reglas: prevalece la aprobada más recientemente; primera aplicación, la reconciliación con las instrucciones v2 (discovery restringido con READY 4–5, ALTO se mitiga pero no detiene, GDS y DEC técnicas de la Factory, riesgo en cada decisión).
- [DEC-023](decisions/DEC-023-modelo-operativo.md) — Modelo operativo de largo plazo: despierta cuando escribe Pablo + vigilia diaria en GitHub Actions; arranque fijo; producto ≥ 60 % y soporte ≤ 15 % por semana; sesiones de 60 min o 12 micro-ciclos; qué detiene la Factory o un área; métricas.
- [DEC-024](decisions/DEC-024-voz-de-shiruvana.md) — Identidad visual: el gato es la marca, Shiruvana la voz; avatar solo en recomendaciones, advertencias, decisiones, resúmenes y explicaciones (48/56 px, uno por sección); nunca en datos, métricas ni navegación.
- [DEC-025](decisions/DEC-025-identidad-en-la-boveda.md) — La Bóveda adopta la identidad Gato Negro: gato oficial como logo y favicon, theme oficial "Gato Negro" por defecto (Bóveda queda como opción) y mi voz donde le hablo al jugador; reemplaza la regla de DEC-024 que me dejaba fuera de La Bóveda.
- [DEC-026](decisions/DEC-026-dev-en-github-pages.md) — Decidida por Pablo: DEV vuelve a GitHub Pages (`pablosnchz.github.io/gw2-factory-dev/`) publicado con un workflow propio, sin límite diario; acepta compartir `localStorage` con producción en su navegador. Reemplaza DEC-005.
- [DEC-027](decisions/DEC-027-shiruvana-en-la-guarida.md) — REEMPLAZADA por DEC-028 (2026-10-22). La Guarida adopta el lenguaje visual del Centro de decisiones (sobre las variables de cada theme) y mi voz aparece en un solo lugar: el resumen de arriba, con lo que la Factory le pide a Pablo y en qué estoy; nunca en favoritos, categorías, lanzador ni widgets.
- [DEC-028](decisions/DEC-028-guarida-lanzador-shiruvana-anfitriona.md) — Aprobada por Pablo (BL-052): La Guarida comparte con el panel solo el lenguaje visual del GDS y nunca muestra datos de la Factory; yo soy su anfitriona: portal Ctrl+K, «Lo de siempre» por uso local y consejos de orden (uno por día). Reemplaza DEC-027.

## LESSONS

- [LES-001](lessons/LES-001-verificar-codigo-real.md) — Verificar contra el código real antes de proponer cambios.
- [LES-002](lessons/LES-002-diagnosticar-antes-de-iterar.md) — Diagnosticar la causa raíz; no entrar en bucles de prueba y error.
- [LES-003](lessons/LES-003-documentacion-puede-estar-desactualizada.md) — La documentación (ONBOARDING/BRIEFING) puede no reflejar el código.
- [LES-004](lessons/LES-004-revisar-clases-del-sistema-de-diseno.md) — Revisar qué estilos trae una clase antes de reutilizarla.
- [LES-005](lessons/LES-005-diagnostico-css-panel-styles.md) — Diagnosticar CSS con el panel Styles, no con mediciones.
- [LES-006](lessons/LES-006-no-forzar-features-sin-datos.md) — Si la API no provee los datos, no insistir: descartar o buscar alternativa.
- [LES-007](lessons/LES-007-cambios-quirurgicos.md) — Cambios quirúrgicos; no reescribir archivos completos.
- [LES-008](lessons/LES-008-ai-memory-en-utf8.md) — ai-memory debe guardarse en UTF-8 (status.md original era ilegible).
- [LES-009](lessons/LES-009-relevar-antes-de-proponer.md) — Relevar el código real del destino antes de proponer una funcionalidad.
- [LES-010](lessons/LES-010-observar-el-trabajo-no-a-los-trabajadores.md) — Un panel debe observar el trabajo y sus decisiones, no la coordinación entre trabajadores.
- [LES-011](lessons/LES-011-dato-medido-sin-infraestructura-local.md) — El dato medido no puede depender de una máquina local; leer por SHA da snapshots consistentes. Corregida 2026-10-20: el histórico sigue activo.
- [LES-012](lessons/LES-012-checkpoint-por-micro-ciclo.md) — Sin checkpoint persistido por micro-ciclo, una interrupción borra el trabajo; al recuperar, contrastar memoria con lo medido.
- [LES-013](lessons/LES-013-contraste-se-calcula.md) — El contraste se calcula para cada par real, incluidos los fondos translúcidos; la paleta propuesta falló AA en 7 usos.
- [LES-014](lessons/LES-014-base-publicada-verificada.md) — Trabajar sobre la versión publicada verificada por SHA; los borradores locales no son base.
- [LES-015](lessons/LES-015-commit-atomico.md) — Un cambio y sus tests van en el mismo commit; armar la lista de archivos comparando SHA.
- [LES-016](lessons/LES-016-probar-canal-por-el-error.md) — Un canal que actúa en nombre de Pablo se prueba en real por el camino de error; nunca con un pedido real.
- [LES-017](lessons/LES-017-publicacion-grande-por-dependencias.md) — Una publicación que no entra en un commit se parte por dependencias, de modo que cada commit deje el sitio funcionando.
- [LES-018](lessons/LES-018-escrituras-en-serie.md) — Las escrituras a una misma rama van en serie; paralelizar solo lecturas.
- [LES-019](lessons/LES-019-ci-no-observable.md) — Sin PR ni lectura de CI, todo se verifica en local antes de publicar; no publicar chequeos que solo CI puede correr.
- [LES-020](lessons/LES-020-ideas-mas-rapidas-que-cierres.md) — Un backlog crece sin control cuando generar ideas cuesta menos que cerrarlas; cada idea necesita salida y límites verificables por máquina.
- [LES-021](lessons/LES-021-datos-estaticos-envejecen.md) — Los datos estáticos del producto envejecen sin dar error; discovery empieza comparando el repo con fuentes vivas.
- [LES-022](lessons/LES-022-borrador-recuperado-se-revisa.md) — Un borrador que sobrevive a una interrupción se revisa antes de usarlo; si el panel endurece una regla, primero se publica la memoria que ya la cumple.
- [LES-023](lessons/LES-023-comentario-normativo.md) — El comentario de una respuesta es parte de la decisión; si refina la opción elegida, manda el comentario.
- [LES-024](lessons/LES-024-validacion-tecnica-es-de-la-factory.md) — Si una verificación necesita herramientas de desarrollador, es de la Factory; a Pablo solo se le pide su mirada de usuario.
- [LES-025](lessons/LES-025-tamano-se-decide-antes.md) — El tamaño de un micro-ciclo se decide antes de comenzar; dividir durante la publicación deja el repositorio a medias.
- [LES-026](lessons/LES-026-fuentes-en-desacuerdo.md) — Un dato de referencia se toma de al menos 3 fuentes; las páginas con caché pueden estar desfasadas; se valida lo publicado, no la copia local.
- [LES-027](lessons/LES-027-limite-fisico-de-la-autonomia.md) — La autonomía tiene un límite físico: Shiruvana solo trabaja cuando alguien la abre; lo que no necesita criterio se automatiza en GitHub.
- [LES-028](lessons/LES-028-archivos-grandes-y-publicacion.md) — Un archivo que no entra en una publicación se cambia desde otro lugar: lo que depende de datos se deriva de los datos, no del HTML.
- [LES-029](lessons/LES-029-lo-heredado-se-verifica.md) — Lo heredado no está terminado ni verificado hasta que lo compruebo: los hechos vencen (el 9478 sí existe) y un dato que no se muestra en pantalla no es una funcionalidad.

## FEATURES

- [FEAT-000](features/FEAT-000-inventario-inicial.md) — Inventario inicial del producto (línea base de DEV).
- [FEAT-001](features/FEAT-001-dashboard-factory.md) — Dashboard Factory: Centro de decisiones de la Factory (gw2-factory-dashboard).
- [FEAT-002](features/FEAT-002-dev-sin-analytics.md) — DEV sin Analytics: GA4 solo en el host de producción y métricas GA4 solo en el repo de producción (DEC-006).
- [FEAT-003](features/FEAT-003-psna-dia-correcto.md) — PSNA: el panel Actividades muestra el día correcto (rotación semanal, cambio a las 08:00 UTC, archivo propio).
- [FEAT-004](features/FEAT-004-identidad-gato-negro-en-la-boveda.md) — La Bóveda con la identidad de Gato Negro: gato oficial, theme oficial por defecto, guías y mi voz donde le hablo al jugador.
- [FEAT-005](features/FEAT-005-metas-janthir-y-visions.md) — Metas de Janthir Wilds y Visions of Eternity con horarios verificados, convergencias corregidas y filtro de expansión generado desde los datos.
