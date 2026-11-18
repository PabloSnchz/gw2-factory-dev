# RESULT de PATCH-432

- Fecha: 2026-11-18T01:19:04.583Z
- Estado: APLICADO
- Resumen: BL-092 BV-6b: los paneles de los módulos como los de La Guarida — oscuros, color del módulo solo en el borde de arriba con luz leve; sin el tinte de fondo (universo.css 1.5.0, solo theme Gato Negro)

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `css/universo.css` | `96310dc95a6dd4e263f64e6e0a59ebd4a6408f6f` | `6af1e63ff0f585fb93e97bbb8de900e256d00b21` | 22135 |
| `index.html` | `c27ef6994611697f45bf497d05ede2fabba0df20` | `82c1c913229059079927890806e52a778153df9e` | 48548 |
| `tests/shv-escena.test.cjs` | `e18c7bcc13b78b1f0f7f5cb8e031fe239e69b1cc` | `f2e2567594a28f15f97664b37d850fc475127780` | 23279 |

- Suite de tests: ya estaba en rojo antes del parche (8 fallas: tests/bld-lib.test.cjs: criterio 1 (D3): las 36 élites con build en PvE y en WvW (72); las de un parche anterior quedan «para revisar», tests/bld-lib.test.cjs: vista completa: filtros con etiquetas, conteo y cobertura; dibuja rápido (< 2 s), tests/bld-lib.test.cjs: BENCH-1 cruce: las builds de PvE de Snow Crows encuentran su bench por la dirección; WvW, PvP y MetaBattle no, tests/bld-rows.test.cjs: fila: toda la fila es un enlace a su ficha; armas, modo y dificultad; etiquetas; DPS del bench o por qué no; escapado, tests/bld-view.test.cjs: BUI-4 cabecera: marco de Raids con 4 indicadores, píldora del parche y contadores en las pestañas, tests/universo-paneles.test.cjs: cada panel de módulo: borde de arriba en el color de su botón de la barra lateral, con luz leve y brillo suave, tests/universo-paneles.test.cjs: la base común: panel oscuro, borde fino de la línea del universo y 3 px arriba; sin tintes en las cabeceras, tests/universo-paneles.test.cjs: le gana al tinte de js/gn-shell.js (los paneles con un solo contenedor) sin !important); el parche no rompió ningún archivo nuevo y pasó node --check.
