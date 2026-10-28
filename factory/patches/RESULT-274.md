# RESULT de PATCH-274

- Fecha: 2026-10-28T21:29:28.811Z
- Estado: APLICADO
- Resumen: BL-082 arreglo: Builds mostraba 'Unexpected token <' (llegaba una página web en vez de datos de la API). bld-ref 1.1.0 reintenta sin caché del navegador y el error dice qué pedido falló; test nuevo; modules.json ?v.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/bld-ref.js` | `120d6cf7f378bc04c2fb62d94811ec290e567aba` | `8940b7249ee2705c3207fb1a43483ab9a8034cfc` | 16400 |
| `tests/bld-ref.test.cjs` | `2ebd420f29e5cc6a6ec7a143b02f782e1bc8432f` | `4a013435bb3ff3f1b49ccb03cc541470bed9e132` | 7692 |
| `js/modules.json` | `986452f8f88a8dea0770a8feeeec30d7a7d21cdd` | `b03eb4ceaa67aad239e9818aa686e2e9c2696681` | 2521 |

- Suite de tests: verde antes y después.
