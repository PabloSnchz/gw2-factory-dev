# DEC-016 — Límites de carga, prioridad y promoción de oportunidades

- Estado: ACEPTADA — límites fijados por Pablo en FACTORY-RESEARCH-001 (2026-10-20)
- Fecha: 2026-10-20
- Ámbito: Cuánto trabajo puede acumular la Factory y cómo entra una oportunidad al backlog
- Relacionadas: DEC-015, DEC-017

## Límites

### Backlog READY: máximo 5 tareas

| READY | Modo de discovery |
|---|---|
| 0 | Prioritario: buscar trabajo nuevo |
| 1–3 | Activo: se aceptan propuestas nuevas |
| 4–5 | Restringido: solo oportunidades de prioridad ALTA |
| > 5 | Detenido: no se generan ideas (y el backlog viola el límite; ver DEC-017) |

### Oportunidades abiertas: máximo 15

Cuentan como abiertas las que están en PENDIENTE o ANALIZADO.

| Abiertas | Acción |
|---|---|
| 0–10 | Operación normal |
| 11–15 | Depuración: fusionar, priorizar y archivar antes de agregar |
| > 15 | Prohibido agregar entradas |

**Verificación automática:** el test `tests/ai-memory.test.cjs` falla en CI si READY > 5 o si hay más de 15 oportunidades abiertas.

## Prioridad

- **ALTA** (al menos una):
  - corrige información incorrecta;
  - corrige errores visibles al usuario;
  - reduce deuda técnica relevante;
  - mejora el rendimiento de forma medible;
  - reduce riesgos altos o críticos.
- **MEDIA**: mejora la experiencia de usuario, simplifica el mantenimiento o agrega una funcionalidad útil con demanda observable.
- **BAJA**: cambios cosméticos, mejoras hipotéticas o funcionalidades sin demanda observable.

Costo estimado: **XS** (menos de 1 ciclo), **S** (1 ciclo), **M** (2–3 ciclos), **L** (más de 3; se parte antes de promover).

## Ciclo de vida de una oportunidad

```
PENDIENTE ──(se completan las 6 preguntas con evidencia)──► ANALIZADO
ANALIZADO ──(cumple la promoción)──► PROMOVIDO → BL-XXX, pasa al archivo
cualquiera ──(sin movimiento 30 días)──► ARCHIVADO, pasa al archivo
cualquiera ──(no aporta valor o es duplicada)──► DESCARTADO, pasa al archivo
```

### Promoción (todas las condiciones)

1. Valor identificado, con evidencia.
2. Descripción clara del problema.
3. No duplica una tarea ni otra oportunidad. Si se superpone, se fusiona con la existente.
4. Prioridad definida.
5. Hay lugar en READY: después de promover, READY sigue ≤ 5.
6. No requiere una decisión de Pablo según DEC-014 (alcance, dependencias, arquitectura o datos del usuario). Si la requiere, se promueve como pedido (`requests/`) y no como tarea.

### Archivo y descarte

- **Archivo automático:** sin movimiento durante 30 días, contados desde la fecha de "Última revisión". Se revisa al inicio de cada ronda.
- **Descarte:** se registra con motivo, fecha y responsable ("Factory" o "Pablo").
- **Nunca se elimina una entrada.** El archivo es de solo agregar.
- **Una archivada puede volver** como PENDIENTE si aparece evidencia nueva. Conserva su ID.
