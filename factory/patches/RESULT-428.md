# RESULT de PATCH-428

- Fecha: 2026-11-18T00:48:14.277Z
- Estado: APLICADO
- Resumen: BL-092 BV-6a: el theme Gato Negro pasa a la obsidiana de mi universo (fondo #0B0B10, paneles #15151D, bordes #2A2A38; sin el gris azulado); textos y acentos iguales; tintes al 14 %

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/themes/gato.css` | `672c21b7fde192fa93566c04bfc8cc761e9b1ddb` | `c31a8c8e7054b8c91787172874fdd2560eaacd90` | 3979 |
| `js/theme-selector.js` | `8b8c8b7e827f4afbe86e39a74190ea39e4084feb` | `249684e971fba5d9a86768dcdc803c0015ce99b5` | 13353 |
| `index.html` | `7b306f9395846910e5321e129a868af49a7a8b29` | `adc5a90eff83c08eaf3dde08c820c0b35d4cee29` | 48548 |
| `tests/theme-gato.test.cjs` | `c1a5f279dbe46fc420ede4433a8355ea70ab4c77` | `eca37c073ff5f12ff2073644d59717f5ab8ecbfb` | 5196 |
| `tests/gn-surface.test.cjs` | `d9952fe315d3f9e7ab8651438c2864757f4d1e31` | `f99052e318d9367a3b9a75019c7c26bcb9668472` | 10584 |
| `tests/index-identity.test.cjs` | `598a69b4f2ca349c977394086fd80e2809d00b49` | `d789ac0caaf58771ed2786f04edaec6d68b2d4e5` | 4717 |

- Suite de tests: ya estaba en rojo antes del parche (5 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas); el parche no rompió ningún archivo nuevo y pasó node --check.
