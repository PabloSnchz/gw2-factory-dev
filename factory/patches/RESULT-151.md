# RESULT de PATCH-151

- Fecha: 2026-10-26T04:25:25.178Z
- Estado: APLICADO
- Resumen: BL-070 TOP-4 (D3, DEC-030): retiro de Gist de index.html: el botón oculto «Sincronizar», la ventana #gistSyncModal, su script en línea y la carga de js/gist-sync.js; size-budget: index.html baja de 48 KB y pasa de congelados a advertencia; gn-ui.test comprueba que no vuelva.

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `index.html` | `846f51680fc0309f22c3ed23ec5387e135397303` | `b9738f9b01b2863639c8796b60de30ca8f9e7d87` | 41949 |
| `tests/gn-ui.test.cjs` | `b0fefd2f432b722de67cd5b06756ad87bef16f6e` | `459b77e4596066a20eac678775e1ec431011cca3` | 25237 |
| `tools/size-budget.json` | `05bb85d5f24fbf441a4de4a5ef00e27cdf3d6b00` | `7be0e965f032d1df2df6e05b3fc5e66a5e105941` | 1825 |

- Suite de tests: ya estaba en rojo antes del parche (1 fallas: tests/zz-probe-top4.test.cjs: sonda TOP-4: el borrador y los borrados en una copia, con toda la suite); el parche no rompió ningún archivo nuevo y pasó node --check.
