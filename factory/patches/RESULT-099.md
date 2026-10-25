# RESULT de PATCH-099

- Fecha: 2026-10-25T16:25:54.616Z
- Estado: APLICADO
- Resumen: BL-070 doble contenedor: tests/gn-shell.test.cjs compara la lista de módulos con JSON (vm usa otro realm; RUN-059).

| Archivo | Blob antes | Blob después | Bytes |
|---|---|---|---|
| `tests/gn-shell.test.cjs` | `791e078f9ff81acbbdda59ef776b51668ea60caf` | `f8944fb822d143fbece29cf4cd4a507ba7b003a1` | 5996 |

- Suite de tests: ya estaba en rojo antes del parche (1 fallas: tests/gn-shell.test.cjs: los 5 módulos renovados, cada uno con lo que su vista monta de verdad (si cambia, este test avisa)); el parche no rompió ningún archivo nuevo y pasó node --check.
