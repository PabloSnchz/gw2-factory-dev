# RESULT de PATCH-430

- Fecha: 2026-11-18T01:06:33.584Z
- Estado: APLICADO
- Resumen: BL-092 BV-6a.1: el theme Gato Negro se pide con su versión (gato.css 2.0.0, theme-selector 1.3.0 con THEME_V; index ?v): el navegador seguía con los colores viejos de gato.css?v=1.0.0

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/themes/gato.css` | `c31a8c8e7054b8c91787172874fdd2560eaacd90` | `7d06fb2cc96a18d5d90d8368eeada00d8f4cfc29` | 4169 |
| `js/theme-selector.js` | `249684e971fba5d9a86768dcdc803c0015ce99b5` | `671bb7ce3f6a0affc7bbedd49fd2a98ac087d018` | 13722 |
| `index.html` | `adc5a90eff83c08eaf3dde08c820c0b35d4cee29` | `c27ef6994611697f45bf497d05ede2fabba0df20` | 48548 |
| `tests/theme-gato.test.cjs` | `eca37c073ff5f12ff2073644d59717f5ab8ecbfb` | `589d537bdeaee586abad3180524f799916043e85` | 5931 |
| `tests/theme-selector.test.cjs` | `3d72868450bda0fd571690271034bf94dcd3cb6e` | `b6aaec6222ad982b711c041de2daa30302848541` | 3633 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
