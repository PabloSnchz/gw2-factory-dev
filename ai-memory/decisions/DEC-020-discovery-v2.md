# DEC-020 — Discovery v2: áreas, latido de 14 días y vista Ideas

- Estado: ACEPTADA — aprobada por Pablo con un cambio, el latido de 14 días en lugar de 7 (RESP-005, 2026-10-20)
- Fecha: 2026-10-20
- Ámbito: Cuándo investiga la Factory, qué la frena y cómo ve Pablo las ideas
- Relacionadas: DEC-015 (mecanismo; su §5 sale de RESP-004), DEC-016 (límites), DEC-017, DEC-019

## Decisión

### 1. Áreas

Cada idea (DISC) y cada pedido de decisión pertenecen a un área, declarada en el campo `- Área:`. Las áreas son:

- `cartera`
- `actividades y metas`
- `legendarias`
- `personajes`
- `comercio`
- `app` (transversal: navegación, barra lateral, ajustes)
- `panel`
- `infraestructura`

La lista la mantiene la Factory. Agregar un área es una decisión técnica.

### 2. Qué detiene discovery

Discovery se detiene **solo** cuando hay:

1. una **decisión estratégica sin responder** sobre esa área. Detiene discovery en el área que afecta. Si la decisión es sobre discovery mismo o sobre la autonomía de la Factory, detiene todo discovery;
2. un **riesgo CRÍTICO** abierto y no aceptado. Detiene todo discovery, salvo la mitigación;
3. una **restricción explícita de Pablo** sobre esa misma área.

Además valen los límites de capacidad de RESP-004 y DEC-016: READY < 5 para promover y como máximo 15 ideas abiertas.

**No** lo detienen:

- las acciones manuales pendientes;
- las validaciones funcionales pendientes;
- los riesgos aceptados;
- los bloqueos externos;
- el trabajo pendiente en otras áreas.

### 3. Que no se acumule

Siguen vigentes los límites de DEC-016, verificados en CI: READY ≤ 5, abiertas ≤ 15, 3 nuevas por ronda, 1 ronda por sesión y archivo a los 30 días. Se suman tres:

- como máximo **3 pedidos de decisión abiertos** para Pablo (DEC-019). Una idea que necesita su criterio espera turno;
- **no hay ronda nueva si hay más de 5 ideas PENDIENTES** sin analizar: primero se analiza;
- como máximo **1 promoción a READY por ronda**.

### 4. Que no se apague

- **Latido:** si pasan **14 días** sin ronda y nada la detiene, la próxima sesión hace una ronda obligatoria.
- **Ronda omitida con motivo:** si algo la detiene, la tabla de rondas de `discovery.md` lo registra ("omitida: motivo"). Si el motivo es un riesgo, se lo nombra.
- **Aviso:** si pasan 14 días sin ronda y READY ≤ 3, el panel lo muestra en Salud.
- **El mantenimiento nunca se frena:** archivar, fusionar y analizar ideas reduce carga y siempre está permitido.

### 5. Etapas de una idea

Una idea **no** pasa sola al backlog. El camino es:

1. **Investigando** (PENDIENTE): registrada con fuente y problema.
2. **Madurando** (ANALIZADO): análisis explícito de las seis preguntas de DEC-015: problema, beneficiario, valor, alternativa, prioridad y costo.
3. Si necesita el criterio de Pablo, queda **"Esperando criterio"** (campo `- Requiere decisión:`) hasta que haya lugar para un pedido.
4. **Promoción**: un paso explícito de la Factory con los criterios de DEC-016 (valor, claridad, sin duplicado, prioridad, lugar en READY). Se registra en `discovery-archive.md` con el BL creado.
5. **Descarte o archivo**: con fecha, motivo y responsable.

### 6. Vista "Ideas" en el panel

Sección permanente, de solo lectura y sin botones de promoción. Muestra:

- arriba, el modo, la última ronda y los contadores;
- cinco grupos: Investigando, Madurando, Esperando criterio, Promovidas (últimos 30 días) y Descartadas (últimos 30 días, con motivo);
- en cada tarjeta, la descripción breve, la prioridad (con ícono y texto), la fuente, el estado y el área.

En Hoy aparece una sola línea con enlace. Se implementa en GV-3.

## Consecuencias

- La primera ronda autónoma se hace después de BL-013 (producto primero), en modo restringido.
- La regla vale tanto para la Factory como para el panel. CI verifica que cada idea abierta tenga `Área:`.
