# RESULT de PATCH-246

- Fecha: 2026-10-28T01:40:00.552Z
- Estado: APLICADO
- Resumen: BL-079 (CRÍTICO, reportado por un usuario; reintento del 245): el formulario de API Keys rechazaba toda Key real de GW2. Se esperaban dos GUID unidos por guion (73 caracteres) y la Key real tiene 72 (8-4-4-4-20-4-4-4-12). Regla corregida, mensaje claro, espacios fuera al pegar; app.js 2.9.2 dentro de su techo de tamaño; hb75-permisos corrige la forma de prueba.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `js/app.js` | `d673de529c0c02cdb922151ab1f7e27d122326fd` | `29df2d849c70d1f80246f5c3f94872a91c97c4b1` | 66711 |
| `index.html` | `f956a5596549cf41b663d395077a80d8cfbc9244` | `d92e27c421c1edcf58e5e0a41bc11654a9c15251` | 48435 |
| `tests/hb75-permisos.test.js` | `14a2a09851660f2b211e3109a1faaa928f93ad58` | `20e71a608d5ef941ac9f88814f203c96d239ae70` | 13742 |

- Suite de tests: verde antes y después.
