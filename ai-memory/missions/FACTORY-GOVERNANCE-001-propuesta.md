# FACTORY-GOVERNANCE-001 — Propuesta de gobernanza

- Estado: PROPUESTA — esperando la validación de Pablo. Nada de esto está implementado.
- Fecha: 2026-10-20
- Base: DEC-014 (autonomía), DEC-015/016/017 (discovery), DEC-018 (soberanía de decisiones), RESP-004 (reglas de Pablo para discovery)
- Antes de esta propuesta se procesó RESP-004: REQ-004 quedó cerrada y DEC-015 §5 tiene las reglas de Pablo, tal como las escribió.

## 1. Propuesta de gobernanza

### El filtro antes de escalar

La pregunta candidata, "¿Pablo posee la información, autoridad o criterio necesario?", tiene un problema: Pablo tiene autoridad sobre todo. Por eso la propuesta separa **qué hace falta** de **quién lo tiene**. La Factory recorre tres preguntas, en orden:

1. **¿Hace falta criterio de producto, usuario, negocio o estrategia, o una decisión sobre autonomía, producción o recursos externos?**
   - Sí: es una **decisión** de Pablo y se plantea como pedido con las cuatro piezas de DEC-018.
2. **¿Hace falta algo que solo tiene Pablo?** Por ejemplo, sus cuentas, sus permisos, su dispositivo o su mirada de usuario sobre la app funcionando.
   - Sí: es una **acción** o una **validación funcional**.
3. **Si no se cumple ninguna de las dos**, lo resuelve la Factory, aunque Pablo pudiera responderlo:
   - si puede hacerlo, lo hace y lo registra;
   - si no puede (el entorno no se lo permite), es un **bloqueo** con dueño "entorno" y no se le pregunta a Pablo.

### El contrapeso

Si la Factory decide más, tiene que mostrar lo que decidió. Las decisiones técnicas que tomó sola en los últimos 7 días aparecen como información ("La Factory decidió…"), con un enlace a su DEC. Pablo no tiene que aprobarlas, pero puede verlas y objetarlas. Así la soberanía no se vuelve opaca.

## 2. Clasificación definitiva

### Las ocho categorías

**Decisión estratégica**
- Qué entra: producto, experiencia de usuario, negocio, alcance, autonomía de la Factory, producción, costos y proveedores externos, y aceptar un riesgo.
- Quién la resuelve: Pablo.
- Qué bloquea: solo el área afectada, que el pedido nombra en un campo `Bloquea:`.
- Cómo se muestra: en "Necesita tu decisión", con Contexto, Impacto, Por qué te lo pregunto, Recomendación y botones. Como máximo 3 abiertas a la vez.

**Acción manual**
- Qué entra: algo que solo Pablo puede ejecutar (su cuenta de Vercel, la configuración de GitHub, un pago, borrar algo con sus permisos).
- Quién la resuelve: Pablo la ejecuta y la Factory la deja preparada paso a paso.
- Qué bloquea: solo las tareas que dependen de ella.
- Cómo se muestra: en "Necesita tu mano", con "Cómo hacerlo", tiempo estimado y "Ya lo hice". Si se puede medir, el panel lo verifica solo.

**Validación funcional**
- Qué entra: mirar o usar la app o el panel como usuario y decir si sirve (se entiende, funciona en el celular, se responde en 60 s).
- Quién la resuelve: Pablo.
- Qué bloquea: nada del trabajo de la Factory. La funcionalidad espera en DEV y la Factory sigue con otras cosas.
- Cómo se muestra: en "Necesita tu mano", sección "Para mirar", con un enlace directo y una lista corta de qué mirar.

**Validación técnica**
- Qué entra: tests, CI, código, contraste, datos contra la wiki, peticiones de red, consola del navegador.
- Quién la resuelve: la Factory, siempre.
- Qué bloquea: si la Factory no puede hacerla, se convierte en un bloqueo con dueño "entorno".
- Cómo se muestra: nunca como pendiente de Pablo. Aparece en Salud.

**Información**
- Qué entra: lo que conviene saber y no pide nada: riesgos aceptados con su fecha de revisión, límites de la Factory, decisiones técnicas recientes.
- Quién la resuelve: nadie, porque no hay nada que resolver.
- Qué bloquea: nada.
- Cómo se muestra: en "Para tu información", plegado si hay más de 3 avisos. Cada aviso vence (por fecha o cuando deja de ser cierto).

**Bloqueo**
- Qué entra: una tarea que no puede avanzar, con dueño explícito: Pablo, Factory o entorno.
- Quién lo resuelve:
  - si el dueño es Pablo, ya figura como acción o decisión;
  - si el dueño es la Factory, lo destraba ella;
  - si el dueño es el entorno, nadie puede destrabarlo ahora.
- Qué bloquea: la tarea misma.
- Cómo se muestra: en Hoy, solo los que dependen de Pablo. El resto va a Trabajo, con "qué lo destraba".

**Riesgo crítico**
- Qué entra: un riesgo del registro con severidad CRÍTICO, abierto y no aceptado.
- Quién lo resuelve: la Factory lo mitiga; si hace falta aceptarlo, se convierte en una decisión de Pablo.
- Qué bloquea: frena la autonomía y discovery, salvo el trabajo que lo mitiga.
- Cómo se muestra: arriba de todo en Hoy, en rojo, con ícono y texto.

**Riesgo alto u otro**
- Qué entra: el resto de los riesgos abiertos no aceptados.
- Quién lo resuelve: la Factory.
- Qué bloquea: nada, o solo el área que toca, si afecta datos del usuario o producción.
- Cómo se muestra: en "Qué debería preocuparte".

Diferencia clave con lo pedido: **"Bloqueos" y "Riesgos" no son pendientes de Pablo**. Son estados del trabajo y se muestran fuera de la cola. Un bloqueo o un riesgo solo le llega a Pablo si se convierte en una acción o en una decisión (por ejemplo, aceptar un riesgo).

### Aplicación a lo que hay hoy

| Ítem | Hoy | Propuesta | Por qué |
|---|---|---|---|
| FEAT-002 · DEV sin Analytics | Validación | **Se divide**: la parte técnica la hace la Factory; queda para Pablo "abrí DEV en Vercel y usala como siempre" | Pide abrir la pestaña Red y la consola del navegador: es una validación técnica. Los 5 tests y las 8 mutaciones ya la cubren. Lo que solo Pablo puede hacer es usar la app en el host nuevo |
| BL-016 · mirar el panel en el celular | Validación | Validación funcional (sin cambio) | Criterio de usuario: los 60 segundos |
| RSK-016 · la Factory no ve CI | Información | **Bloqueo con dueño entorno** (en Trabajo y Salud) | No le pide nada a Pablo y no es una novedad; es una limitación permanente |
| RSK-001 · producción sin protección | Información (aceptado) | Información hasta el 2026-11-20; ese día pasa a decisión | Aceptar riesgos es de Pablo, y la revisión ya está acordada |
| BL-031 · `node --check` | Bloqueado | Bloqueo, dueño entorno | No requiere nada de Pablo |
| BL-007 · SRI de las CDN | Bloqueado | Bloqueo, dueño entorno | No requiere nada de Pablo |
| BL-008 · email en commits viejos | Bloqueado | **La Factory lo cierra como obsoleto** | No tiene impacto en el producto y no vale un pedido |
| BL-017 · ramas sobrantes | Bloqueado | **La Factory lo cierra como "no vale el pedido"** | No afecta nada. Si Pablo un día quiere limpiar, son dos clics |

Resultado: en Hoy quedan **0 decisiones, 2 cosas para mirar y 1 aviso**. El chip "5 bloqueados" pasa a "0 bloqueados por vos".

## 3. Política de Discovery

La base son las reglas de Pablo (RESP-004, ya en DEC-015 §5). Lo que sigue define los dos términos que dejan abierta la interpretación y agrega dos controles.

**1. ¿Qué tipo de decisión bloquea Discovery?** Solo la que cambia **cómo** o **sobre qué** se investiga:
- las fuentes permitidas;
- el alcance del producto (por ejemplo, "la app no va a cubrir PvP");
- la autonomía de discovery;
- el formato de los datos del usuario, para ideas que lo tocan.

El pedido lo declara con `Bloquea: discovery` o `Bloquea: área X`.

**2. ¿Qué decisiones no bloquean Discovery?** Todas las demás:
- las decisiones de otras áreas;
- las de producción;
- las de recursos.

Una decisión estratégica abierta frena solo su **área**: no se registran ideas nuevas de esa área y las que ya existen quedan "esperando tu criterio".

Las áreas son los módulos de la app: cartera, actividades y metas, legendarias, personajes, comercio, panel de la Factory, infraestructura. Cada DISC y cada pedido llevan un campo `Área:`.

**3. ¿Qué acciones humanas no deben detener a la Factory?** Ninguna acción ni validación detiene el trabajo de la Factory. Lo mismo vale para:
- los bloqueos con dueño entorno;
- los riesgos aceptados;
- los pedidos pospuestos.

Solo se detiene la tarea concreta que depende de esa acción.

**4. ¿Qué riesgos sí deben detenerla?**
- Un riesgo **CRÍTICO** abierto y no aceptado: frena discovery y el trabajo autónomo, salvo la mitigación.
- Un riesgo **ALTO** no aceptado que afecta datos del usuario o producción: frena solo su área.
- El riesgo propio de discovery (RSK-017) frena las entradas nuevas, no el mantenimiento. Se activa si el límite se supera.

**5. ¿Cómo evitar colas enormes?**
- Límites que ya existen y verifica CI: READY ≤ 5, abiertas ≤ 15, 3 nuevas por ronda, 1 ronda por sesión, archivo a los 30 días.
- Límites nuevos:
  - **como máximo 3 decisiones abiertas para Pablo** (verificado en CI). Si ya hay 3, una idea que necesita su criterio queda "esperando turno" y no se le pregunta;
  - **no hay ronda nueva si hay más de 5 ideas PENDIENTES sin analizar**: primero se analiza lo que ya entró;
  - **como máximo 1 promoción a READY por ronda**.

**6. ¿Cómo evitar que Discovery quede apagado para siempre?**
- **Latido:** si pasan 7 días sin ronda y las condiciones lo permiten, la próxima sesión hace una ronda obligatoria.
- **Ronda omitida con motivo:** si una condición la frena, la tabla de rondas registra "omitida: motivo". Si el motivo es un riesgo, se lo nombra. Así nunca hay un apagado silencioso.
- **Aviso en el panel:** "Sin rondas hace 14 días" aparece en Salud si READY ≤ 3.
- **El mantenimiento nunca se frena:** archivar, fusionar y analizar ideas pendientes siempre está permitido, porque reduce carga.

## 4. Visibilidad de Discovery en el panel

Nueva sección **"Ideas"** en la navegación. Es de solo lectura y responde: "¿qué está dando vueltas en la cabeza de la Factory?".

**Arriba, en una línea:**
- el modo actual y por qué (por ejemplo, "Restringido: READY 4/5, solo ideas ALTA");
- cuándo fue la última ronda y cuándo puede ser la próxima;
- los contadores: 6/15 abiertas, 4/5 en READY.

**Cinco grupos, de izquierda a derecha:**

| Grupo | Qué contiene | De dónde sale |
|---|---|---|
| Investigando | Ideas recién detectadas, sin analizar | `discovery.md`, estado PENDIENTE |
| Madurando | Analizadas, con valor, costo y prioridad | `discovery.md`, estado ANALIZADO |
| Esperando tu criterio | Ideas que en algún momento van a necesitar una decisión tuya. No son pedidos todavía | `discovery.md`, con "Requiere decisión" |
| Promovidas | Pasaron al backlog en los últimos 30 días, con enlace a la tarea | `discovery-archive.md`, PROMOVIDO |
| Descartadas o archivadas | Últimos 30 días, con el motivo | `discovery-archive.md`, ARCHIVADO o DESCARTADO |

**Cada tarjeta muestra:**
- el título y el problema en una línea;
- el área, la prioridad (con ícono y texto) y el costo;
- la antigüedad y la familia de la fuente.

No hay botones de "promover": una idea no se convierte en backlog desde el panel.

**En Hoy:** una sola línea dentro de "¿Qué está haciendo la Factory?", por ejemplo "6 ideas en estudio · última ronda hace 2 h · Ver ideas". No compite con las decisiones.

**Costo técnico:**
- el panel ya lee esos dos archivos, así que no suma llamadas a la API;
- hace falta un parser de `discovery.md`, tests y el campo `Área:`.

**Para más adelante, no en esta versión:** una señal "me interesa / no me interesa" de Pablo que suba o baje la prioridad sin ser una decisión. No conviene arrancar con eso: invita a usar el panel como un segundo backlog.

## 5. REQ-004

Pablo ya la respondió: RESP-004, opción B con reglas propias, procesada. La recomendación es **no reabrirla**. Lo que queda por confirmar son tres lecturas de su comentario, que van incluidas en esta validación y no como pedido nuevo:

1. "Capacidad en READY" significa READY < 5. Se aplica así desde hoy.
2. "Bloquea directamente la investigación" y "área afectada" se definen como en el punto 3.
3. El latido de 7 días y los dos límites nuevos (3 decisiones abiertas, 5 pendientes sin analizar).

## 6. Decisiones y lecciones propuestas

Se registran solo si Pablo valida esta propuesta. Se escriben sin guion porque todavía no existen en la memoria.

- **DEC 019 — Taxonomía de pendientes, bloqueos y riesgos.** Extiende DEC-018 con:
  - el filtro de tres preguntas;
  - la validación técnica como trabajo exclusivo de la Factory;
  - bloqueos con dueño (Pablo, Factory o entorno);
  - riesgos fuera de la cola;
  - como máximo 3 decisiones abiertas;
  - el campo `Bloquea:`;
  - el registro visible de las decisiones técnicas recientes.
- **DEC 020 — Discovery v2: áreas, latido y visibilidad.** Define:
  - las áreas;
  - qué frena y qué no frena;
  - los límites nuevos;
  - el latido de 7 días y la ronda omitida con motivo;
  - la vista "Ideas" de solo lectura.
- **LES 023 — El comentario de una respuesta puede ser normativo.** Pablo eligió B, pero en el comentario escribió reglas más precisas que las opciones. La Factory las procesó como texto de la decisión, no como nota. Al plantear opciones, hay que esperar que la respuesta las refine.
- **LES 024 — Una validación que pide herramientas de desarrollador es técnica.** FEAT-002 le pedía a Pablo mirar la pestaña Red y la consola. Si la verificación necesita herramientas de desarrollo, le corresponde a la Factory o se resuelve con un test.

## 7. Implementación propuesta, si se aprueba

Orden según Producto > Dashboard:

1. **GV-1 — Memoria y CI (chico).**
   - DEC 019, DEC 020, LES 023 y LES 024.
   - Campos `Área:`, `Bloquea:` y `Bloqueado: entorno|Pablo|Factory`.
   - Reclasificar lo actual y cerrar BL-008 y BL-017.
   - Chequeos en CI: clase obligatoria, justificación y ≤ 3 decisiones abiertas.
   - Absorbe el SD-3 pendiente de BL-036.
2. **BL-013 — PSNA.** Producto primero: el usuario ve hoy el día equivocado.
3. **GV-2 — Panel.** Bloqueos por dueño, "Para mirar", avisos que vencen y "La Factory decidió…".
4. **GV-3 — Vista "Ideas".**
5. **Primera ronda autónoma de discovery** con las reglas nuevas (modo restringido).

Mientras tanto, discovery queda habilitado con las reglas de RESP-004 tal como están escritas.
