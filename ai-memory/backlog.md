# BACKLOG

Formato: `- [ID] [PRIORIDAD] Título — contexto · referencia` (ver DEC-009)
Prioridades: CRÍTICO · ALTO · MEDIO · BAJO
Gobierno: READY solo contiene trabajo ejecutable, máximo 5 tareas (DEC-016, DEC-017). Las ideas viven en [discovery.md](discovery.md).

## READY

- [BL-013] [ALTO] PSNA del día equivocado — el panel Actividades muestra, todos los días, los puntos de ruta del 2026-03-17 como si fueran de hoy: `assets/data/psna-schedule.json` cubre solo una semana de marzo y `js/activities.js` usa el primer día cuando no encuentra la fecha. Además, en cualquier sitio publicado lee el archivo del repo de producción. Hacer: calcular el día con la rotación de 7 días, con cambio a las 08:00 UTC; mostrar "sin datos" en lugar de un día equivocado; leer primero el archivo propio; corregir los códigos contra la wiki; agregar tests. Antes de publicar, confirmar qué conjunto corresponde a cada día de la semana. Ya hecho: BOM de `js/analytics.js` (`a3eea2d`). · DEC-015, RSK-018
- [BL-034] [ALTO] Metas de Janthir Wilds y Visions of Eternity — `assets/meta-events.json` no tiene metas de Janthir Wilds, tiene una sola de Visions of Eternity y etiqueta "Convergencia: Monte Balrior" como SotO. El filtro de expansión de `index.html` no ofrece las dos expansiones nuevas. Hacer: completar las metas con horarios verificados en la wiki, corregir la etiqueta, agregar las opciones al filtro y tests de datos. · DEC-015, RSK-018
- [BL-004] [MEDIO] Sincronizar documentación de producto con el código real — `docs/BRIEFING.md` y `docs/DESARROLLADORES.md` describen v6.6.2 (ej. `api-gw2.js` v2.15.0) pero `index.html` carga `api-gw2.js?v=2.33.0`; la Armería Legendaria no figura en `CHANGELOG.md`. · LES-003, DEC-003
- [BL-005] [BAJO] `js/characters-theme.js?v=1.0.1` se incluye dos veces en `index.html` (una con `defer`, otra sin). El archivo tiene guardas contra doble aplicación, así que el efecto es menor: duplica observadores y listeners. · FEAT-000

## IN_PROGRESS

- [BL-036] [ALTO] Soberanía de decisiones en el panel — FACTORY-DASHBOARD-REFINEMENT-001: "Necesita tu decisión" muestra 6 ítems y solo 1 es un pedido de decisión. Clasificar lo pendiente en decisión, acción, validación e información; exigir contexto, impacto, recomendación y justificación a cada decisión; la Factory resuelve lo técnico. · FEAT-001, DEC-011, DEC-013, DEC-014

## BLOCKED

- [BL-031] [MEDIO] `node --check` de `js/*.js` en `app-checks` — resto de BL-006. La Factory no tiene los 46 archivos en local ni puede leer CI; un archivo con sintaxis de módulo dejaría `main` en rojo sin que nadie lo note (RSK-016, LES-019). · BL-006, RSK-016 — Bloqueado: lectura de CI o PR.
- [BL-016] [ALTO] FEAT-001 Dashboard Factory: validación visual — el Centro de Decisiones 2.0.0 está publicado (`cfdd1fa`); falta que Pablo lo mire en un navegador real, también en el celular, y confirme el criterio de 60 segundos. · FEAT-001, DEC-013, RSK-015 — Bloqueado: validación de Pablo.
- [BL-007] [BAJO] Dependencias CDN sin Subresource Integrity — `crypto-js@4.2.0` (jsdelivr) y `xlsx-0.20.2` (sheetjs). · FEAT-000, DEC-017 — Bloqueado: las CDN responden 403 desde el entorno de la Factory (probado 2026-10-20) y un hash sin verificar rompería la carga de `crypto-js`.
- [BL-008] [BAJO] Email placeholder en commits heredados — varios usan "TU EMAIL DE LA CUENTA PRINCIPAL"; se corrige configurando `git user.email` en cada entorno que hace commits. · DEC-017 — Bloqueado: fuera del alcance de la Factory.
- [BL-017] [BAJO] Ramas sobrantes en gw2-factory-dev — `chore/init-ai-memory` (mismo contenido que `main` @ b9599d2) y `factory/bl-002-dev-sin-analytics` (mismo contenido que lo publicado en `main` para BL-002; no se pudo abrir PR). · DEC-017 — Bloqueado: la Factory no tiene herramienta para borrar ramas.

## DONE

- [BL-000] [ALTO] Inicializar la memoria fundacional de la Factory — estructura, roadmap, DEC-001..004, LES-001..008, FEAT-000, corrección de codificación. — 2026-10-19
- [BL-015] [MEDIO] Proponer estrategias de entorno DEV — publicación (DEC-005), GA (DEC-006), dashboard (DEC-007). — 2026-10-19
- [BL-009] [MEDIO] Reemplazado: extender la pestaña "Salud" del dashboard histórico — sustituido por un dashboard nuevo (FEAT-001, DEC-008). — 2026-10-20
- [BL-012] [MEDIO] Obsoleto: datos del dashboard histórico sin actualizar — el histórico queda como referencia; el nuevo panel no depende de scripts locales (RSK-004). — 2026-10-20
- [BL-014] [BAJO] Obsoleto: detalles de `js/config.js` del dashboard histórico — fuera de alcance, el histórico no se modifica (DEC-008). — 2026-10-20
- [BL-019] [ALTO] FEAT-001 Dashboard Factory: investigación, diseño, implementación, tests y documentación — gw2-factory-dashboard. · DEC-008, DEC-009 — 2026-10-20
- [BL-018] [MEDIO] CI del dashboard — `.github/workflows/test.yml` corre `node --test` en cada push y PR de gw2-factory-dashboard. · FEAT-001 — 2026-10-20
- [BL-001] [ALTO] Futuro de `gw2-wallet-agents` y `gw2-agents-dashboard` — decidido por Pablo: pasan a LEGACY y se mantienen activos como benchmark histórico. La Factory no los modifica ni los usa como fuente. · DEC-001, DEC-008, RSK-008 — 2026-10-20
- [BL-022] [ALTO] GDS 1.0.0 fundamentos — tokens en 3 niveles, 23 componentes, íconos, contraste calculado (57 pares AA), GDS_FOUNDATION.md y 12 tests en gw2-factory-dashboard/gds. · DEC-010, LES-013 — 2026-10-20
- [BL-026] [ALTO] Intercambio de decisiones (contrato v3) — js/decisions.js, integración en modelo y cola, 13 tests, docs/DECISIONS.md en gw2-factory-dashboard; requests/ y responses/ en ai-memory con REQ-001 y REQ-002. · DEC-011, LES-014, LES-015 — 2026-10-20
- [BL-027] [ALTO] Responder desde el panel — botones por pedido (js/respond.js, "Ya respondiste") en gw2-factory-dashboard `0775d5d`; workflow `decision-response` + script + 9 tests en gw2-factory-dev `cf5a533`; textos dorados espejo en ambos repos; 8/8 mutaciones detectadas; prueba real del camino de error (issue #1). · DEC-012, LES-016 — 2026-10-20
- [BL-021] [ALTO] Centro de Decisiones — contrato v3 (MC-3), respuesta con un botón (MC-4) e interfaz de decisión con GDS (MC-5). La cola ya no esconde un pendiente propio dentro de otro ítem que lo cita. · DEC-011, DEC-012, DEC-013, FEAT-001 — 2026-10-20
- [BL-028] [BAJO] Respuestas sin registrar visibles en el panel — "Registrando" o "no se pudo registrar" con enlace, en Hoy, en la tarjeta del pedido y en Salud (1 llamada más a la API). · DEC-013, RSK-014 — 2026-10-20
- [BL-029] [ALTO] Panel migrado al Gato Design System — Hoy ordenado por decisión, lenguaje sin códigos internos, foco y anuncios accesibles, `css/app.css` solo con tokens, GDS 1.0.1; 72 tests y 16 mutaciones; gw2-factory-dashboard @ `9c8726b`. · DEC-013, LES-017 — 2026-10-20
- [BL-024] [MEDIO] Documentación del panel consolidada — README, `docs/ARCHITECTURE.md`, `docs/DATA-CONTRACT.md` v3 y CHANGELOG 2.0.0 en gw2-factory-dashboard @ `cfdd1fa`. · DEC-011, DEC-013 — 2026-10-20
- [BL-020] [ALTO] FACTORY-001B cerrada — Gato Design System 1.0.1 y Centro de Decisiones 2.0.0 en 6 micro-ciclos; revisión final de accesibilidad y textos (74 tests, 20 mutaciones); informe en `missions/FACTORY-001B-informe-final.md`. · DEC-010, DEC-011, DEC-012, DEC-013, LES-018 — 2026-10-20
- [BL-030] [ALTO] Modo operativo después de FACTORY-001B — Pablo aprobó la opción B, autonomía continua acotada (RESP-001). Se activa cuando Pablo lo indique, después de la validación final. · DEC-014, REQ-003 — 2026-10-20
- [BL-002] [ALTO] DEV sin Analytics — GA4 solo en el host de producción, métricas GA4 solo en el repo de producción, 5 tests y workflow `app-checks`; 8/8 mutaciones detectadas. gw2-factory-dev `6d2f63e`…`2399afc`. · DEC-006, FEAT-002, RSK-003 — 2026-10-20
- [BL-006] [MEDIO] Validación automática de `ai-memory/` en CI — `tests/ai-memory.test.cjs` en `app-checks`: archivos obligatorios, UTF-8 sin BOM, enlaces del índice y claves de status; 4 tests, 5/5 mutaciones detectadas; gw2-factory-dev `3f63d54`. El `node --check` de `js/*.js` pasa a BL-031. · LES-008, RSK-006 — 2026-10-20
- [BL-010] [ALTO] Rechazado por Pablo: proteger `main` de producción — RESP-002 ("de momento no lo veo necesario"). El riesgo queda aceptado y se vuelve a conversar el 2026-11-20 (RSK-001). · REQ-001, RSK-001 — 2026-10-20
- [BL-023] [MEDIO] Devuelto a discovery: ubicación canónica del Gato Design System — consideración futura, no tarea ejecutable; sigue como DISC-007 en `discovery.md`. · DEC-010, DEC-017 — 2026-10-20
- [BL-025] [BAJO] Devuelto a discovery: verificación medida `dev_sin_pages` — postergada sin fecha desde MC-5; sigue como DISC-008 en `discovery.md`. · DEC-011, DEC-017 — 2026-10-20
- [BL-035] [ALTO] Discovery Engine (FACTORY-RESEARCH-001) — `discovery.md` y `discovery-archive.md`, límites verificados en CI (READY ≤ 5, abiertas ≤ 15; 13 tests, 8/8 mutaciones), backlog dentro del límite (READY 8 → 4), ronda inicial con 2 promovidas (BL-013, BL-034). Informe en `missions/FACTORY-RESEARCH-001-informe.md`. · DEC-015, DEC-016, DEC-017, LES-020, LES-021 — 2026-10-20
- [BL-003] [ALTO] DEV publicado en Vercel — Pablo creó el proyecto y apagó GitHub Pages en gw2-factory-dev (RESP-003): `https://gw2-factory-dev.vercel.app/`. · DEC-005, REQ-002, RSK-002 — 2026-10-20
- [BL-011] [ALTO] Origen compartido DEV/PROD resuelto — DEV tiene origen propio en Vercel y ya no comparte `localStorage` con producción; deja de hacer falta usar DEV en incógnito. Verificación medida de Pages apagado: DISC-008. · RSK-002, DEC-005, REQ-002 — 2026-10-20
