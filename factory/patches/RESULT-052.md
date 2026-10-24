# RESULT de PATCH-052

- Fecha: 2026-10-24T23:09:10.703Z
- Estado: APLICADO
- Resumen: BL-070 RAI-4 tanda 4b: índice de mecánicas con End of Dragons y Secrets of the Obscure; tests de la tanda (Visions of Eternity espera fuente del Nexo).

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `assets/data/raids/mechanics/index.json` | `4e9c0a74dc9b859031fb0bc060d9d8a3a34192d6` | `797d85a8f886b1b8d25d4c96f3829cafa4e24836` | 182 |
| `tests/raids-sheet.test.cjs` | `67d0653c5d84aec455987c1faf9a57b01ac7e9db` | `153c35cb4ca243b9a847bf1847a1cf89a277a1de` | 33881 |

- Suite de tests: ya estaba en rojo antes del parche (1 fallas: tests/wv-camara-a11y.test.cjs: la cabecera pinta mi línea con Shiruvana.voice, una sola vez, y lee fijados del almacén si la Tienda no cargó); el parche no rompió ningún archivo nuevo y pasó node --check.
