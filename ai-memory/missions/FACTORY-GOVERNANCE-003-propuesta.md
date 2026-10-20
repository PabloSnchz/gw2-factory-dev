# FACTORY-GOVERNANCE-003 — Límites de tamaño de un micro-ciclo

- Estado: PROPUESTA — esperando la validación de Pablo (REQ-006). Nada de esto está implementado.
- Fecha: 2026-10-20
- Base: reglas de micro-ciclo de las instrucciones de la Factory, LES-012, LES-015, LES-017, LES-018, LES-022, RSK-009, RSK-012

## 1. Qué pasó

GV-1 se planificó como **un** micro-ciclo con:

- **7 objetivos**:
  - procesar tu aprobación de REQ-005;
  - registrar 2 decisiones y 2 lecciones;
  - reclasificar pendientes;
  - asignar dueño a los bloqueos y cerrar 3 tareas;
  - asignar áreas a discovery;
  - agregar 4 chequeos de CI;
  - mover BL-013.
- **14 archivos**, 74 KB enviados y 14 commits.

Todo se preparó en local y después se publicó en ráfaga. La interrupción llegó con 6 de 14 publicados. En esa ráfaga, además, 3 escrituras se lanzaron en paralelo y dieron 409: es la tercera vez que se repite LES-018.

Resultado visible para Pablo:

- REQ-005 sigue abierta en el panel aunque ya la aprobó;
- dos entradas (DEC-019 y LES-023) citan una respuesta que todavía no está publicada;
- `status.md` quedó 5 horas sin actualizar.

No se perdió trabajo, porque las copias locales sobrevivieron. Pero eso fue suerte, no diseño.

### No fue un caso aislado

| Ciclo | Archivos | Commits | Objetivos | Qué pasó |
|---|---|---|---|---|
| FACTORY-001B, antes de MC-1 | — | 0 | — | ~1 h perdida sin checkpoint (RSK-009, LES-012) |
| MC-5 | 14 | 8 | varios | el panel publicado estuvo roto ~2 min (RSK-012) |
| FACTORY-RESEARCH-001, R2 y R3 | 16 | 16 | 4 | escrituras en paralelo → 409 (LES-018, 2.ª vez) |
| SD-2 | 9 del panel (144 KB) + 4 de memoria | 13 | 3 | interrupción antes de publicar; el borrador sobrevivió (LES-022) |
| GV-1 | 14 (74 KB) | 6 de 14 | 7 | interrupción a mitad de la publicación; 409 (3.ª vez) |

### Causa

La regla ya existía: "máximo 3 archivos, 1 decisión, 1 área, 1 objetivo", con checkpoint intermedio a partir de 3 archivos o 15 minutos. Falló por tres motivos:

1. **Está escrita como "cumplir al menos una".** Un ciclo de 14 archivos "cumplía" si tenía un solo objetivo declarado. Y el objetivo se declaraba al nivel de la misión ("registrar la gobernanza"), no del paso.
2. **Nada la verifica.** Como pasó con el backlog (LES-020), una regla que no controla una máquina se erosiona cuando el trabajo parece claro.
3. **Se prepara todo y se publica al final.** Eso maximiza lo que queda en riesgo y concentra la inconsistencia del repositorio en una ventana larga.

## 2. Qué se protege

Un micro-ciclo es **recuperable** si, ante una interrupción en cualquier momento:

1. lo que no se publicó es poco: unos minutos de trabajo, nunca horas;
2. el repositorio publicado nunca queda en un estado que engañe a Pablo, como una decisión ya respondida que sigue abierta o una referencia rota;
3. leyendo solo `status.md` se sabe exactamente qué archivos faltan.

Los límites de abajo se derivan de esas tres condiciones.

## 3. Límites propuestos

Se tienen que cumplir **todos** a la vez, no "al menos uno".

| Límite | Valor | Por qué |
|---|---|---|
| Objetivos | **1** | Un resultado verificable que se dice en una frase sin "y". Si hace falta "y", son dos micro-ciclos |
| Archivos de contenido | **≤ 3** por micro-ciclo, más `status.md` al empezar y al terminar | Con 1 archivo por commit, 3 escrituras tardan menos de 1 minuto: la ventana inconsistente es mínima |
| Commits | **≤ 5** (3 de contenido + 2 de `status.md`) | Sale del límite anterior. Reintentar una escritura que falló no cuenta |
| Repositorios | **1** por micro-ciclo | Si un cambio necesita dos repos, son dos micro-ciclos encadenados (por ejemplo, memoria y panel) |
| Volumen enviado | **≤ 40 KB** por micro-ciclo | Cada escritura manda el archivo completo. Un archivo de más de 20 KB (por ejemplo `views.js`, 45 KB) va solo, con su test en el micro-ciclo siguiente |
| Decisiones nuevas | **≤ 1** DEC por micro-ciclo | Ya estaba en las reglas; se mantiene |
| Tiempo | **≤ 20 min** desde el checkpoint de inicio hasta el de cierre; publicación **≤ 3 min** | Si el trabajo local pasa de 20 min, se publica lo que ya es coherente y el resto se divide |

Notas:

- **Volumen:** que las interrupciones estén ligadas a sesiones con mucho contenido es una hipótesis, no un hecho medido. El límite sirve igual, porque reduce lo que hay que volver a enviar si algo falla.
- **Tareas largas:** una tarea del backlog puede necesitar varios micro-ciclos. Los límites valen por micro-ciclo, no por tarea. La autonomía sigue encadenando micro-ciclos sin pedir permiso.

## 4. Reglas de orden y coherencia

1. **Cada commit deja la memoria válida:**
   - CI en verde;
   - sin referencias a IDs inexistentes;
   - el panel muestra la verdad.

   El orden es: archivos nuevos → referencias (índice) → cambios de estado (pedido y respuesta) → `status.md`.
2. **Pares inseparables, en el mismo micro-ciclo y en commits seguidos:**
   - una respuesta y el cierre de su pedido;
   - un cambio de código y su test (LES-015);
   - una entrada nueva y su línea en el índice.
3. **Lo que endurece una regla va al final de la cadena**, cuando la memoria ya la cumple (LES-022). Por ejemplo, un test nuevo de CI.
4. **Las escrituras van en serie, siempre.** Un mensaje de la Factory nunca contiene dos llamadas de escritura (LES-018). Es la regla que se rompió tres veces: pasa de recomendación a obligación.
5. **Trabajar y publicar de a poco:** preparar un micro-ciclo, publicarlo y recién después preparar el siguiente. Nada de preparar todo en local y publicar al final.

## 5. Manifiesto en `status.md`

Antes de empezar un micro-ciclo, `status.md` declara:

```
Micro-ciclo: <objetivo en una frase>
Archivos: ruta/a.md, ruta/b.md, ruta/c.md
```

- Si el manifiesto lista más de 3 archivos, el micro-ciclo se divide **antes** de empezar.
- Al recuperar, se comparan por SHA solo esos archivos y se sabe exactamente qué falta.
- **Verificación:** un test de `tests/ai-memory.test.cjs` falla si `Archivos:` lista más de 3 rutas. Cuesta un test.

## 6. Qué pasa con GV-1, si se aprueba

Quedan 8 archivos. Se publican en 4 micro-ciclos dentro de los límites, en este orden:

| Micro-ciclo | Objetivo | Archivos |
|---|---|---|
| GV-1a | Que el panel deje de pedirte REQ-005 | `responses/RESP-005.md`, `requests/REQ-005-gobernanza.md` |
| GV-1b | Reclasificar los pendientes según DEC-019 | `status.md`, `features/FEAT-002-dev-sin-analytics.md`, `decisions/DEC-018-soberania-de-decisiones.md` |
| GV-1c | Bloqueos con dueño y áreas en discovery | `backlog.md`, `discovery.md` |
| GV-1d | CI verifica la gobernanza nueva | `tests/ai-memory.test.cjs`, `missions/FACTORY-GOVERNANCE-001-propuesta.md` |

Las copias locales ya están verificadas (17 tests, 15/15 mutaciones), así que son cuatro publicaciones cortas.

Después sigue BL-013 (PSNA), también dividido en micro-ciclos:

1. datos verificados contra la wiki;
2. cálculo del día y su test;
3. lectura del archivo propio y su test;
4. documentación.

## 7. Lección propuesta

Se registra si Pablo aprueba. Se escribe sin guion porque todavía no existe en la memoria.

- **LES 025 — El tamaño de un micro-ciclo se decide antes de empezar, no al publicar.** Un límite de tamaño que nadie verifica se pierde en cuanto el trabajo parece claro. Preparar todo y publicar al final convierte cada interrupción en un repositorio a medias. Antes de tocar un archivo, se declara el manifiesto y se divide.
