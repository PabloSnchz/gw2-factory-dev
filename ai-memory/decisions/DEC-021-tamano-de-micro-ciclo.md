# DEC-021 — Gobernanza del tamaño de un micro-ciclo

- Estado: ACEPTADA — aprobada por Pablo con una modificación: los límites se cumplen todos a la vez (conversación, 2026-10-21; REQ-006). Excepción de archivo grande aprobada por Pablo (RESP-007, 2026-10-21)
- Fecha: 2026-10-21
- Ámbito: Tamaño, orden y publicación de cada micro-ciclo en gw2-factory-dev y gw2-factory-dashboard
- Misión: FACTORY-GOVERNANCE-003 (propuesta) y FACTORY-GOVERNANCE-004 (registro)
- Relacionadas: DEC-014, LES-012, LES-015, LES-017, LES-018, LES-022, LES-025, RSK-009, RSK-012

## Contexto

GV-1 se planificó como un solo micro-ciclo con 7 objetivos y 14 archivos. Una interrupción lo cortó con 6 publicados, y REQ-005 quedó abierta en el panel aunque Pablo ya la había aprobado. La regla anterior decía "cumplir al menos una" condición y nada la verificaba. Diagnóstico completo en `missions/FACTORY-GOVERNANCE-003-propuesta.md`.

## Decisión

### 1. Límites: se cumplen TODOS a la vez

| Límite | Valor |
|---|---|
| Objetivos | 1, que se pueda decir en una frase sin "y" |
| Archivos | ≤ 3 de contenido. `status.md` se escribe además al empezar (checkpoint con manifiesto) y al cerrar |
| Commits | ≤ 5: 3 de contenido + 2 de `status.md`. Reintentar una escritura fallida no cuenta |
| Repositorios | 1 |
| Decisiones nuevas | ≤ 1 DEC |
| Tiempo | ≤ 20 min del checkpoint de inicio al de cierre; publicación ≤ 3 min |
| Volumen enviado | ≤ 40 KB; un archivo de más de 20 KB va solo |

Si un límite no se cumple, el micro-ciclo se **divide antes de empezar**, nunca durante la publicación.

### 1 bis. Excepción: archivo grande indivisible (RESP-007, 2026-10-21)

Los límites siguen vigentes. Cuando **un único archivo supera por sí solo los 40 KB**:

- puede ocupar un micro-ciclo completo;
- debe ser el **único archivo funcional** modificado en ese micro-ciclo (ningún otro archivo de la app ni de tests; `status.md` se escribe igual, porque es el checkpoint);
- tiene **revisión dedicada**: se revisa el diff completo del archivo antes de publicar;
- tiene **validación dedicada**: sintaxis, comportamiento y regresión verificados en local sobre el archivo completo;
- tiene **publicación dedicada**: una sola escritura de contenido, verificada por SHA.

Su test va en el micro-ciclo inmediatamente siguiente: es la única excepción al par "código y test" de §2.4. La excepción aplica solo a archivos cuyo tamaño individual supera el límite; **no aplica a grupos de archivos**. Hoy alcanza a `js/activities.js` (59,6 KB) e `index.html` (68,9 KB).

### 2. Publicación

1. **Escrituras siempre en serie.** Un mensaje de la Factory nunca contiene dos llamadas de escritura (LES-018).
2. **Publicación incremental.** Se prepara un micro-ciclo, se publica y recién después se prepara el siguiente.
3. **Cada commit deja la memoria válida.** El orden es: archivos nuevos → índice → cambios de estado (pedido y respuesta) → `status.md`.
4. **Pares inseparables**, en el mismo micro-ciclo y en commits seguidos:
   - una respuesta y el cierre de su pedido;
   - un cambio de código y su test;
   - una entrada nueva y su línea en el índice.
5. **Lo que endurece una regla va último**, cuando la memoria ya la cumple (LES-022).

### 3. Manifiesto obligatorio

Antes de empezar, `status.md` declara en la sección "Micro-ciclo actual":

```
Micro-ciclo: <objetivo>
Archivos:
- ruta/1
- ruta/2
- ruta/3
```

Al recuperar una interrupción, se comparan por SHA solo los archivos del manifiesto.

### 4. Lectura de la regla de cierre

Al cerrar cada micro-ciclo se actualiza `status.md` con el próximo paso. Backlog, decisiones, aprendizajes y riesgos se actualizan **solo si el micro-ciclo los cambió**, y cuentan dentro de los 3 archivos. Si el cierre necesita más archivos, ese cierre es el micro-ciclo siguiente.

## Verificación

`tests/ai-memory.test.cjs` falla si el manifiesto lista más de 3 rutas (publicado en GV-1d, 2026-10-21). Un micro-ciclo de archivo grande lista una sola ruta, así que también lo cumple.

## Consecuencias

- GV-1 se termina en 4 micro-ciclos (GV-1a a GV-1d) y BL-013 se divide en 4.
- Una tarea puede necesitar varios micro-ciclos. La autonomía los encadena sin pedir permiso (DEC-014).
