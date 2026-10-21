# DEC-023 — Modelo operativo de largo plazo

- Estado: ACEPTADA — opción D de REQ-008, aprobada por Pablo desde el panel (issue #7) y en la conversación (RESP-008, 2026-10-21)
- Fecha: 2026-10-21
- Ámbito: Cómo despierta, elige trabajo, reparte el tiempo, se detiene y mide su productividad la Factory
- Misión: FACTORY-OPS-001 (propuesta completa en `missions/FACTORY-OPS-001-modelo-operativo.md`)
- Relacionadas: DEC-014, DEC-015, DEC-016, DEC-019, DEC-020, DEC-021, DEC-022, LES-027, RSK-016

## Contexto

La Factory ya tiene memoria, panel, Discovery, micro-ciclos y autonomía continua acotada. Faltaba definir cómo opera durante semanas sin supervisión constante, sabiendo que Shiruvana no se despierta sola (LES-027).

## Decisión

### 1. Scheduler: híbrido por etapas

1. **Etapa 1 (vigente):**
   - Shiruvana despierta cuando Pablo escribe; cualquier mensaje vale como sesión completa;
   - una **vigilia diaria en GitHub Actions**, sin el agente, corre los tests, revisa vencimientos de datos, el latido de Discovery y los pedidos sin respuesta, y deja el resultado en un archivo que la Factory lee al despertar.
2. **Etapa 2 (no habilitada):** 2 sesiones programadas por día, solo si la plataforma lo permite y Pablo acepta el costo. Requiere una decisión nueva de Pablo.

### 2. Arranque, en este orden

1. Leer `status.md`, `backlog.md` y `memory-index.md`.
2. Si `status.md` dice EN_CURSO, recuperar el micro-ciclo interrumpido por su manifiesto.
3. Procesar cada RESP en estado PENDIENTE y cerrar su REQ.
4. Revisar alertas: riesgos CRÍTICOS, riesgos ALTOS sin mitigación, producción y el resultado de la vigilia (si tiene más de 48 h, es alerta).
5. Calcular el modo de la sesión.
6. Elegir trabajo y escribir el checkpoint.

### 3. Elección de trabajo

La primera tarea elegible de esta lista:

1. recuperación y respuestas de Pablo;
2. lo roto que ve el usuario;
3. READY de producto, por prioridad y antigüedad;
4. deuda técnica que frena producto o reduce un riesgo ALTO;
5. Discovery, cuando le toca;
6. panel, memoria, documentación y procesos, solo con justificación escrita (deuda identificada, bloqueo operativo o mejora medible del producto).

### 4. Presupuesto semanal (sobre los micro-ciclos)

- producto: 60 % o más;
- deuda técnica: hasta 15 %;
- Discovery: hasta 10 %;
- soporte (panel, memoria, documentación, procesos): hasta 15 %.

Si el soporte supera el 15 %, la semana siguiente empieza con 3 micro-ciclos de producto. Las órdenes explícitas de Pablo no cuentan contra el presupuesto, pero se registran. Después de 3 micro-ciclos de soporte seguidos, el siguiente es de producto si hay producto elegible.

### 5. Discovery

- READY = 0: ronda obligatoria al empezar.
- READY 1 a 3: una ronda al cerrar una tarea de producto, como máximo una por sesión.
- READY 4 a 5: restringido, solo ideas ALTA.
- Latido de 14 días (DEC-020).
- Como máximo 1 promoción por ronda. Por cada idea promovida se cierra o archiva otra cosa en la misma semana.
- Se archiva lo que no se movió en 30 días y lo BAJO sin demanda nueva en 2 rondas seguidas.

### 6. Detención

- **Toda la Factory:** riesgo CRÍTICO, producción, decisión pendiente sobre la autonomía o las reglas, o bloqueo operativo general.
- **Solo un área:** decisión estratégica, dependencia externa o restricción de Pablo sobre esa área.
- **Nada:** validaciones funcionales, acciones manuales, riesgos aceptados, bloqueos de entorno de otras tareas, riesgos ALTOS con mitigación en curso.

### 7. Sesiones

- Hasta 60 minutos o 12 micro-ciclos; como máximo 2 micro-ciclos de archivo grande.
- Se cierran al terminar el alcance, al llegar al límite, sin trabajo elegible o ante un motivo de detención, siempre con `status.md` en IDLE y un resumen.
- Sin READY: Discovery → promover una idea → deuda con evidencia → pedido de producto para Pablo → cerrar en IDLE. La Factory no inventa trabajo de infraestructura.

### 8. Métricas

Calculadas desde el repositorio:

- tareas de producto cerradas por semana (sana ≥ 3);
- parte de commits de producto (≥ 60 %);
- errores o datos falsos visibles abiertos (bajando);
- días desde el último producto cerrado (≤ 3);
- de la respuesta de Pablo a su procesamiento (≤ 1 sesión);
- pedidos abiertos (≤ 3);
- funcionalidades esperando validación (≤ 3);
- READY (2 a 5);
- ideas abiertas (≤ 10);
- trabajo perdido por interrupciones (0);
- retrabajo (≤ 10 %).

## Implementación (después de BL-034)

1. La vigilia diaria: workflow y script.
2. El arranque fijo en "Lectura obligatoria" de `memory-index.md`.
3. Las métricas en el panel: 4 en Hoy y el resto en Salud.

## Consecuencias

- Mientras no haya sesiones programadas, el ritmo depende de cuándo escribe Pablo.
- Cambiar este modelo es una decisión de Pablo: afecta la autonomía (DEC-022 §2.6).
