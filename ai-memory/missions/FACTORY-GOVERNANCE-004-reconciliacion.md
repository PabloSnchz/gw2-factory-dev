# FACTORY-GOVERNANCE-004 — Reconciliación con las instrucciones v2

- Estado: ANÁLISIS — esperando la validación de Pablo. No se implementó nada de lo que propone.
- Fecha: 2026-10-21
- Base: instrucciones consolidadas v2, `status.md`, `backlog.md`, `roadmap.md`, `risks.md`, `memory-index.md`, DEC-011, DEC-014 a DEC-021, LES-023 a LES-025
- Ya registrado en esta misión: DEC-021, LES-025 (G4-A), RESP-006 y cierre de REQ-006 (G4-B)

## 1. Qué cambió respecto de las reglas anteriores

Se comparó cada sección de las instrucciones v2 con la memoria oficial. Hay cinco grados de cambio:

- **igual**: v2 dice lo mismo que la memoria;
- **más estricto**: v2 agrega una exigencia;
- **nuevo**: la regla no existía;
- **cambia**: la regla anterior queda reemplazada;
- **diferencia**: v2 contradice una regla vigente.

| Área | Antes (memoria) | v2 | Grado |
|---|---|---|---|
| Prioridad | Producto > Dashboard > Documentación > Procesos > Infraestructura (DEC-014) | Producto > Dashboard > **Memoria** > Procesos > Infraestructura | Igual en la práctica; cambia el nombre |
| Autoconstrucción | La Factory mejora panel y memoria como trabajo de bajo riesgo (DEC-014) | Panel, memoria, documentación y procesos se mejoran **solo** si hay deuda técnica identificada, un bloqueo operativo o una mejora medible del producto | **Nuevo**: el trabajo de panel necesita justificación |
| Cuándo se detiene | DEC-014 y FACTORY-001B: decisión humana requerida, CRÍTICO, **o ALTO que no puede resolver**, producción, dependencia externa, **cambio arquitectónico mayor**, bloqueo | Decisión **estratégica** pendiente, riesgo crítico, producción, bloqueo operativo real, dependencia externa real | **Cambia**: ALTO ya no detiene; "decisión humana" pasa a "estratégica"; la arquitectura mayor sale de la lista |
| Soberanía | DEC-014: pasan por Pablo las DEC que reemplazan a otra y los cambios MAJOR del GDS | La Factory decide arquitectura menor, memoria, panel, GDS y organización interna. Pablo decide costos, proveedores, recursos externos, alcance funcional, UX, riesgos aceptables y estrategia | **Cambia**: el GDS y las DEC técnicas pasan a la Factory |
| Capacidad de respuesta | DEC-019 y LES-024: lo técnico es de la Factory | Igual, y agrega **logs** a la lista | Igual |
| Decisiones para Pablo | DEC-018: contexto, recomendación, impacto y motivo | Contexto, recomendación, impacto, **riesgo** y justificación. Opciones Aprobar, Rechazar y Posponer, y cada respuesta deja un artefacto | **Nuevo**: falta el campo "riesgo" |
| Pendientes | DEC-019: 8 categorías (incluye "validación técnica" y riesgo partido en dos) | 6 categorías. Los riesgos van por severidad: **Crítico** puede detener, **Alto debe mitigarse**, Medio se monitorea, Bajo se registra | **Más estricto**: un ALTO abierto exige mitigación. La validación técnica deja de ser categoría |
| Información | DEC-019: "cada aviso vence" (sin implementar) | "Expira automáticamente" | Igual, pero sigue sin implementarse |
| Discovery: capacidad | RESP-004 / DEC-015 §5: se investiga si READY < 5 | READY ≤ 3 activo; 4–5 restringido (solo ALTA); más de 5 detenido | **Diferencia**: con READY = 5, v2 permite discovery restringido y RESP-004 lo frena |
| Discovery: qué lo detiene | DEC-020 | Igual (decisión estratégica, CRÍTICO o restricción sobre el área) | Igual |
| Discovery: latido de 14 días | DEC-020 (RESP-005) | v2 no lo menciona | Sin conflicto; sigue vigente |
| Discovery: cola, archivo y promoción | DEC-016 y DEC-020 | Igual: ≤ 15 abiertas, archivo a 30 días, promoción sin automatismo | Igual |
| Vista de discovery | DEC-020: vista Ideas (GV-3) | "El dashboard **debe** mostrar" los 5 grupos | Pasa de aprobado a obligatorio |
| Micro-ciclos | DEC-021 | Igual: todos simultáneos, manifiesto, escrituras en serie | Igual. v2 no fija commits; DEC-021 los deriva (≤ 5) |
| Cierre de micro-ciclo | `status.md` | Actualizar status, backlog, decisiones, aprendizajes, riesgos y próximo paso | Tensión con "≤ 3 archivos"; resuelta en DEC-021 §4: solo lo que cambió, y cuenta en los 3 |
| Producción | No se propone ni se toca | Igual | Igual |

### Lecturas que hace la Factory

Si Pablo no las corrige al validar este análisis, la Factory aplica estas lecturas:

1. **Diferencia en discovery.** Manda v2, porque es la regla más reciente de Pablo. Con READY 4–5 hay discovery restringido (solo ALTA). Una promoción sigue necesitando lugar: después de promover, READY ≤ 5.
2. **Arquitectura mayor.** La Factory la decide, salvo que el cambio toque un tema de Pablo: costos, proveedores o recursos externos, alcance funcional, datos del usuario, producción o estrategia. En esos casos pasa a ser una decisión estratégica.
3. **Riesgo ALTO.** No detiene a la Factory. Cada ALTO abierto necesita una mitigación concreta (una tarea o una aceptación de Pablo). Hoy se cumple:
   - RSK-018 se mitiga con BL-013 y BL-034;
   - RSK-001 está aceptado por Pablo, con revisión el 2026-11-20.
4. **Decisión estratégica pendiente.** Detiene solo su área, no toda la Factory, como ya dice DEC-020.

## 2. Qué hay que ajustar

### Errores ya corregidos durante esta misión

- `status.md` (`b93e5a1`, publicado por la Factory en FACTORY-GOVERNANCE-003) volvía a pedirle a Pablo:
  - que mirara la consola del navegador para FEAT-002;
  - que avisara si veía `app-checks` en rojo en Actions.

  Las dos cosas contradicen DEC-019 y LES-024. Se reconstruyó `status.md` desde el remoto sin revisar esas líneas contra las reglas vigentes. Quedó corregido en el checkpoint `8d40203`.
- REQ-006 figuraba abierta aunque ya estaba aprobada. Quedó cerrada con RESP-006.

### Decisiones

| Qué | Cambio | Dónde |
|---|---|---|
| DEC 022 (nueva) | Reconciliación con v2: las 4 lecturas de §1 y el campo "riesgo" en los pedidos | 1 micro-ciclo: DEC e índice |
| DEC-014 | Anotar la nueva lista de cuándo se detiene, el GDS y las DEC técnicas como trabajo de la Factory, la prioridad con "Memoria" y la autoconstrucción limitada | Junto con DEC-015, en 1 micro-ciclo |
| DEC-015 §5 | Capacidad según v2: READY 4–5 restringido | Igual |
| DEC-018 | Agregar "riesgo" a lo que debe traer una decisión | En GV-1b, que ya toca DEC-018 |
| DEC-019 | Riesgos por severidad: ALTO exige mitigación. La validación técnica se describe como responsabilidad, no como categoría | Micro-ciclo posterior |
| DEC-011 (contrato) | Los pedidos de decisión nuevos traen `## Riesgo` | Lo cubre DEC 022; no se reescriben los REQ cerrados |

### Backlog

- READY hoy en el remoto: BL-013, BL-034, BL-004 y BL-005. Con 4 tareas, discovery queda restringido.
- **Panel**, con la regla de autoconstrucción limitada:
  - GV-3, vista Ideas: **justificada**, porque v2 la exige. Entra al backlog como una tarea MEDIO.
  - GV-2 se reduce a lo que v2 exige: el campo "riesgo" en la tarjeta de decisión y que la información venza. Otra tarea MEDIO.
  - "La Factory decidió…" no lo exige v2 y no tiene deuda que lo justifique: vuelve a discovery como idea BAJA.
  - "Bloqueos por dueño" ya funciona con el formato de texto actual: no hace falta código.
- **Para no superar READY 5**, las dos tareas de panel entran después de cerrar BL-013.
- **DISC-007** (ubicación canónica del GDS): ahora es una decisión de la Factory. Sigue en discovery y no genera pedido a Pablo. Se resuelve cuando tenga prioridad.

### Panel

Sin cambios hasta que el producto avance. Después, las dos tareas descritas en "Backlog". No hay cambios urgentes: el panel actual no muestra nada que contradiga v2, salvo REQ-005 abierta (ver §3).

## 3. Qué partes de GV-1 siguen siendo válidas

| Micro-ciclo | Archivos | Validez frente a v2 |
|---|---|---|
| GV-1a | RESP-005 y cierre de REQ-005 | **Válido tal cual.** Corrige información incorrecta que Pablo ve hoy |
| GV-1c | `backlog.md` y `discovery.md` | **Válido.** Bloqueos con dueño (v2: "Bloqueo tiene dueño") y área en cada idea, que v2 necesita para "restricción sobre el área". El latido queda en 2026-11-03 |
| GV-1d, propuesta | `missions/FACTORY-GOVERNANCE-001-propuesta.md` marcada APROBADA | **Válido** |
| Ya publicados | DEC-019, DEC-020, LES-023, LES-024 e índice | Válidos. DEC-019 recibe un ajuste menor (§2) |

## 4. Qué partes de GV-1 hay que modificar

| Micro-ciclo | Cambio |
|---|---|
| GV-1b | **No publicar el `status.md` local**: está desactualizado y sus correcciones ya están en el remoto. GV-1b queda en FEAT-002 y DEC-018, más el campo "riesgo" de v2 |
| GV-1c | `backlog.md` local movía BL-013 a IN_PROGRESS. Eso se publica cuando BL-013 empiece de verdad, no antes |
| GV-1d, test | Agregar el chequeo del manifiesto de DEC-021 (≤ 3 rutas). El chequeo de `## Riesgo` en pedidos nuevos entra con DEC 022, para no fallar sobre los pedidos viejos. Sigue yendo último (LES-022) |

## 5. Qué ejecutar primero

**Ranking**, según Producto > Panel > Memoria > Procesos > Infraestructura:

1. **GV-1a** (2 archivos, 1 micro-ciclo). Es memoria, pero procesa una respuesta de Pablo (DEC-011) y corrige información incorrecta que él ve hoy: REQ-005 abierta. Es prioridad ALTA por definición (DEC-016) y el costo es mínimo.
2. **BL-013, el PSNA del día equivocado** (producto, ALTO, RSK-018). Es el primer trabajo de producto: el usuario ve datos incorrectos todos los días. Va en 4 micro-ciclos:
   1. datos verificados contra la wiki;
   2. cálculo del día y su test;
   3. lectura del archivo propio y su test;
   4. documentación y cierre.
3. **DEC 022 y anotaciones** en DEC-014 y DEC-015 (2 micro-ciclos).
4. **GV-1b, GV-1c y GV-1d**, ajustados según §4.
5. **BL-034**, metas de las expansiones (producto, ALTO).
6. **Panel**: campo "riesgo" e información que vence; después, la vista Ideas.

**Discovery:** la primera ronda autónoma va después de BL-013, en modo restringido (DEC-020). El latido vence el 2026-11-03.

**Qué detendría a la Factory**, según v2:

- una decisión estratégica pendiente sobre el área en la que trabaja;
- un riesgo CRÍTICO;
- cualquier acción sobre producción;
- un bloqueo operativo real;
- una dependencia externa real.

Hoy no hay ninguno de esos casos activo.

## Recomendación

Validar este análisis y sus 4 lecturas (§1). Con la validación, la Factory ejecuta GV-1a y sigue con BL-013 en autonomía continua, sin esperar instrucciones entre micro-ciclos.
