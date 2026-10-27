# FEAT-020 — Shiruvana que aparece (mi globo)

- Estado: EN DEV — BL-075 cerrada por pedido de Pablo (2026-10-27 03:35Z). Producción: la decide Pablo.
- Backlog: BL-075 · Decisiones: DEC-038 (modifica DEC-034), DEC-024
- Archivos: js/shv-bubble.js 1.2.1, js/shv-wallet.js 1.3.1, ach-view, act-view, act-week, home-view, inv-view, raids-view y wv-view (una línea cada uno), js/modules.json, privacy.html, docs/user-guide-avanzado.html
- Tests: tests/shv-bubble.test.cjs, tests/shv-wallet.test.cjs, tests/shv-modules.test.cjs

## Qué hace

- Mis recomendaciones y novedades salen en un globo al lado de mi rincón (pie de la barra lateral; en el celular, sobre la barra de abajo), con «Lo sé por».
- Una vez por novedad (gn:shv:seen guarda solo huellas de 8 caracteres, como mucho 200, 60 días) y una por visita a cada pantalla.
- Nunca con una ventana abierta ni mientras escribís; no tapa nada ni saca el foco; se va a los 12 s (se queda si lo mirás o tenés el foco adentro).
- Lo que no leíste queda como punto en mi rincón y en «Más», con «Te dejé un mensaje».
- Ajustes → «Silenciar a Shiruvana» (gn:shv:quiet): te hablo dentro de cada módulo, como antes.
- Quedan escritos en el módulo: los avisos (advierte), Cuentas, la ficha de Raids, el conversor, la guía de Inicio, Metas y mi rincón.
- Cartera: lo crítico (permiso «billetera») queda escrito; «Ver la evolución de tu Cartera» abre los 30 días.

## Pasos

- SHE-0 propuesta (docs/propuestas/propuesta-shiruvana-emergente.html), D1 a D5 aprobados.
- SHE-1 globo inerte (PATCH-191 docs). SHE-2 Cartera, rincón, punto y Silenciar (PATCH-192, validado). SHE-3 los 7 módulos (PATCH-196).
- PATCH-198: arreglos de lo que vio Pablo: no aparecía fuera de la Cartera (la caja vacía tiene :empty{display:none}) y los íconos de la Cartera parpadeaban (bucle con wallet-theme.js).

## Aprendizajes

- Si varios módulos observan el mismo panel, cada uno escribe solo si algo cambió: si no, se disparan entre sí.
- La visibilidad se prueba con estilos como los reales: un DOM de prueba sin CSS no ve un :empty{display:none}.
