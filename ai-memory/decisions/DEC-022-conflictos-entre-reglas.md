# DEC-022 — Conflictos entre reglas: prevalece la aprobada más recientemente

- Estado: ACEPTADA — dictada por Pablo al aprobar FACTORY-GOVERNANCE-004 (conversación, 2026-10-21)
- Fecha: 2026-10-21
- Ámbito: Cómo resuelve la Factory instrucciones o decisiones que se contradicen
- Misión: FACTORY-GOVERNANCE-004 (reconciliación con las instrucciones v2)
- Relacionadas: DEC-014, DEC-015, DEC-018, DEC-019, DEC-020, DEC-021, LES-023

## Contexto

Las instrucciones de la Factory se consolidaron en una versión v2. Al compararlas con la memoria oficial aparecieron una diferencia y varias reglas cambiadas (`missions/FACTORY-GOVERNANCE-004-reconciliacion.md`, §1). La más visible: RESP-004 permitía discovery solo con READY < 5, y v2 permite discovery restringido con READY 4 o 5.

## Decisión

### 1. Regla de conflicto

Cuando dos instrucciones o decisiones se contradicen, **prevalece siempre la regla aprobada más recientemente**.

- "Aprobada" quiere decir dictada o aprobada por Pablo: instrucciones, respuestas (RESP) o aprobaciones en la conversación registradas en la memoria.
- La fecha que cuenta es la de la aprobación, no la de redacción.
- Una regla anterior solo pierde lo que la nueva contradice; el resto sigue vigente. Por ejemplo, v2 no menciona el latido de 14 días de DEC-020, así que el latido sigue.
- Si dos reglas tienen la misma fecha, o no se puede saber cuál es más reciente, y el conflicto toca un tema de Pablo, es una decisión estratégica. Si es técnico, lo resuelve la Factory y lo registra.
- Al aplicar esta regla, la Factory anota en la decisión vieja qué parte quedó reemplazada y por cuál. Ninguna regla cambia en silencio.

### 2. Primera aplicación: instrucciones v2 (aprobada por Pablo el 2026-10-21)

1. **Discovery por capacidad (manda v2):**
   - READY ≤ 3: activo;
   - READY 4–5: restringido, solo ALTA;
   - READY > 5: detenido.

   Una promoción sigue necesitando lugar: después de promover, READY ≤ 5. Reemplaza el "READY < 5" de RESP-004 y DEC-015 §5.
2. **Arquitectura mayor:** la decide la Factory, salvo que toque costos, proveedores o recursos externos, alcance funcional, datos del usuario, producción o estrategia. En ese caso es una decisión estratégica.
3. **Riesgo ALTO:** no detiene a la Factory. Cada ALTO abierto necesita una mitigación concreta: una tarea o una aceptación de Pablo.
4. **Decisión estratégica pendiente:** detiene solo su área (como DEC-020).
5. **Cuándo se detiene la Factory:** solo ante una decisión estratégica pendiente sobre su área, un riesgo CRÍTICO, producción, un bloqueo operativo real o una dependencia externa real. Reemplaza la lista de DEC-014.
6. **Soberanía:** el GDS, las decisiones técnicas (incluidas las que reemplazan a otra) y la organización interna son de la Factory. Reemplaza el punto 4 de "Qué pasa por un pedido a Pablo" de DEC-014.
7. **Autoconstrucción limitada:** el panel, la memoria, la documentación y los procesos se mejoran solo si hay deuda técnica identificada, un bloqueo operativo o una mejora medible del producto.
8. **Decisiones para Pablo:** además de contexto, recomendación, impacto y justificación, traen el **riesgo**. Los pedidos nuevos agregan una sección `## Riesgo`. Los pedidos cerrados no se reescriben.

## Consecuencias

- DEC-014, DEC-015 y DEC-018 reciben una anotación con lo que quedó reemplazado.
- El test de CI verifica `## Riesgo` solo en pedidos abiertos creados desde el 2026-10-21.
