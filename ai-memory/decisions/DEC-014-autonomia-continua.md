# DEC-014 — Modo operativo después de FACTORY-001B: autonomía continua acotada

- Estado: ACEPTADA — opción B, decidida por Pablo el 2026-10-20 desde el panel (RESP-001)
- Fecha: 2026-10-20
- Ámbito: Forma de trabajo de la Factory en gw2-factory-dev y gw2-factory-dashboard
- Misión: cierre de FACTORY-001B (MC-6)
- Pedido: REQ-003

## Contexto

Hasta ahora la Factory trabajó por **misiones dictadas en la conversación** y **micro-ciclos aprobados de a uno**. Ese modelo fue correcto para construir la base: memoria oficial, panel, Gato Design System y el canal de decisiones. Tenía un costo: Pablo tenía que escribir cada misión y aprobar cada paso, aun los de bajo riesgo.

Con FACTORY-001B cerrada, la Factory ya tiene lo que faltaba para trabajar sin que Pablo la conduzca paso a paso:

- un **backlog priorizado** del que elegir trabajo (`backlog.md`);
- un **lugar para preguntar** que no depende de la conversación (`requests/`, DEC-011);
- un **canal para responder** con un botón (DEC-012);
- un **panel** que muestra en 60 segundos qué hizo, qué hace y qué necesita (DEC-013);
- **checkpoints y commits por ciclo** que hacen recuperable cualquier interrupción (LES-012).

Una restricción real: la Factory no corre sola. Cada sesión empieza cuando Pablo la abre. "Autonomía continua" significa que, al abrir una sesión, la Factory sabe qué hacer sin que Pablo se lo dicte; no significa trabajo nocturno sin supervisión.

## Propuesta (opción B de REQ-003)

### Qué puede hacer la Factory sin preguntar

1. **Elegir trabajo** del backlog READY por prioridad, de a una tarea por vez (WIP 1), con el ciclo completo PRODUCT → ARCHITECTURE → DEVELOPMENT → REVIEW → DOCUMENTATION.
2. **Encadenar ciclos** dentro de la misma sesión: checkpoint antes, commit y estado al terminar. El panel muestra el avance; no hace falta aprobar cada ciclo.
3. Trabajo de **bajo riesgo en DEV**: corregir errores, reducir deuda técnica, documentación, tests, CI, mejoras del panel y de la memoria.
4. **Funcionalidades nuevas de la app** en DEV, solo si están en el backlog con prioridad asignada y no cambian el formato de almacenamiento del usuario.

### Qué pasa por un pedido a Pablo (`requests/`)

1. Cualquier acción que toque **producción** (sin excepción).
2. **Cambios de alcance**: una funcionalidad que no esté en el backlog o que cambie su prioridad.
3. **Dependencias nuevas**, servicios externos o costos.
4. **Decisiones de arquitectura o de identidad** (una DEC nueva que reemplace a otra, un cambio MAJOR del GDS).
5. Cambios en el **formato de datos del usuario** (`localStorage`) mientras DEV comparta dominio con producción (RSK-002).
6. Acciones que **solo Pablo puede hacer** (cuentas, permisos, configuración de GitHub).

### Cuándo se detiene la Factory

- **Al terminar cada sesión**: deja `status.md` en "Esperando" con un resumen de la sesión, es decir, qué hizo, qué aprendió y qué sigue.
- **Si un pedido bloquea el trabajo siguiente**, o si no hay nada en READY que pueda hacer sin preguntar.
- **Si una revisión encuentra un problema CRÍTICO o ALTO** que no puede resolver: lo registra como riesgo y pregunta.
- **Si el panel en vivo queda roto**: lo restaura primero y después sigue.

### Cómo se mantiene Pablo informado

- **El panel es el canal principal**: frase de resumen, pedidos pendientes, actividad de hoy y de la semana.
- **Un informe por sesión** en `status.md`, con lo hecho, los commits y los riesgos nuevos.
- **Un informe por hito** al cerrar cada fase del roadmap, como el de esta misión.
- **Las respuestas de Pablo se procesan al iniciar cada sesión** (DEC-011, punto 5).

### Qué no cambia

- Producción sigue siendo exclusiva de Pablo: la Factory no propone ni sugiere promociones.
- La memoria oficial sigue siendo la única fuente de verdad.
- Pablo puede dar una misión explícita cuando quiera: tiene prioridad sobre el backlog.

## Alternativas

- **A — Seguir por misiones y micro-ciclos aprobados de a uno.** Máximo control, pero Pablo sigue siendo el cuello de botella para trabajo de bajo riesgo. Razonable si Pablo prefiere revisar todo.
- **C — Autonomía total en DEV.** La Factory también decide qué funcionalidades construir sin consulta. Se descarta por ahora: el producto es de Pablo y el alcance debe seguir siendo suyo.

## Resultado

- 2026-10-20T05:28Z — Pablo aprobó la opción B desde el Centro de Decisiones (issue #2 → RESP-001).
- Activación: Pablo pidió además no iniciar trabajo autónomo ni misiones nuevas hasta la validación final de FACTORY-001B. La autonomía queda aprobada pero en espera: la Factory empieza a tomar tareas del backlog solo cuando Pablo lo indique.
- 2026-10-20 (FACTORY-TRANSITION-001) — Pablo validó FACTORY-001B, activó la autonomía y aprobó esta interpretación:
  - una decisión pendiente frena la tarea afectada, no la sesión;
  - "riesgo crítico" es uno nuevo o causado por la Factory;
  - el panel se actualiza manteniendo la memoria;
  - la elección de trabajo respeta Producto > Dashboard > Documentación > Procesos > Infraestructura.
- 2026-10-20 (FACTORY-RESEARCH-001) — Cuando el backlog no alcanza, el trabajo nuevo sale de discovery (DEC-015).

## Consecuencias al activarse

- Primeras tareas del backlog READY en orden de prioridad:
  - BL-002 (DEV sin Analytics; toca código de la app con el ciclo completo);
  - BL-006 (validación automática en gw2-factory-dev);
  - BL-004 (documentación de producto sincronizada).
- `status.md` agrega un "Resumen de la sesión".
- Se agrega al panel un indicador de "modo" (misión explícita o autonomía), si resulta necesario.
- Se revisa este acuerdo después de las primeras 3 sesiones.
