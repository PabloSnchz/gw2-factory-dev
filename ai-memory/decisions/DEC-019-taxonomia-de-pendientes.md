# DEC-019 — Taxonomía de pendientes, bloqueos y riesgos

- Estado: ACEPTADA — aprobada por Pablo (RESP-005, 2026-10-20)
- Fecha: 2026-10-20
- Ámbito: Qué se le muestra a Pablo, con qué categoría y qué frena cada cosa
- Misión: FACTORY-GOVERNANCE-001 (propuesta) y FACTORY-GOVERNANCE-002 (registro)
- Relacionadas: DEC-018 (la amplía), DEC-011, DEC-014, DEC-020

## Contexto

DEC-018 separó decisiones, acciones, validaciones e información. Seguían mezcladas dos cosas:

- validaciones técnicas pedidas a Pablo (FEAT-002 le pedía mirar la pestaña Red y la consola del navegador);
- bloqueos y riesgos mostrados como si fueran tarea suya.

La propuesta completa está en `missions/FACTORY-GOVERNANCE-001-propuesta.md`.

## Decisión

### 1. Antes de mostrarle algo a Pablo

La Factory se pregunta: **"¿Pablo tiene realmente la información, la autoridad o el criterio necesarios para responder esto?"**. Para contestarlo recorre tres preguntas, en orden:

1. ¿Hace falta criterio de producto, usuario, negocio o estrategia, o una decisión sobre autonomía, producción o recursos externos? → **decisión estratégica** de Pablo.
2. ¿Hace falta algo que solo tiene Pablo (sus cuentas, sus permisos, su dispositivo, su mirada de usuario)? → **acción manual** o **validación funcional**.
3. Si no, lo resuelve la Factory. Si el entorno no se lo permite, es un **bloqueo** con dueño "entorno" y no se le pregunta a Pablo.

### 2. Categorías

| Categoría | Quién resuelve | Qué frena | Dónde se ve |
|---|---|---|---|
| Decisión estratégica | Pablo | Solo el área afectada (campo `Bloquea:` del pedido) | "Necesita tu decisión", como máximo 3 abiertas |
| Acción manual | Pablo; la Factory la deja preparada | Solo la tarea que depende de ella | "Necesita tu mano" |
| Validación funcional | Pablo | Nada del trabajo de la Factory | "Necesita tu mano", "Para mirar" |
| Validación técnica | La Factory, siempre | Si no puede hacerla, es un bloqueo con dueño entorno | Salud; nunca como pendiente de Pablo |
| Información | Nadie | Nada | "Para tu información"; cada aviso vence |
| Bloqueo | Su dueño: Pablo, Factory o entorno | La tarea misma | En Hoy solo los de Pablo; el resto en Trabajo |
| Riesgo crítico | La Factory mitiga; aceptarlo es de Pablo | La autonomía, salvo la mitigación | Arriba de todo |
| Riesgo alto u otro | La Factory | Nada, o solo su área si toca datos del usuario o producción | "Qué debería preocuparte" |

**Validación técnica:** CI, GitHub Actions, tests, contrastes, consola, network y herramientas de desarrollo del navegador son responsabilidad de la Factory. Nunca se escalan a Pablo.

**Bloqueos y riesgos** no son pendientes de Pablo. Solo le llegan si se convierten en una acción o en una decisión, por ejemplo aceptar un riesgo.

### 3. Formatos (contrato de datos v5)

- `backlog.md`, BLOCKED: cada ítem declara su dueño con `— Bloqueado por Pablo: …`, `— Bloqueado por Factory: …` o `— Bloqueado por entorno: …`. Un ítem bloqueado por el entorno no menciona a Pablo.
- `status.md`, "Esperando a Pablo": cada línea lleva su clase (`Decisión:`, `Acción:`, `Validación:`, `Info:`), como en DEC-018.
- `requests/`: un pedido de decisión puede declarar `- Bloquea: <área>|discovery|nada`. Sin el campo se entiende "nada". Como máximo 3 pedidos de decisión abiertos a la vez.
- La Factory registra lo que decidió sola. El panel muestra las decisiones técnicas de los últimos 7 días como información ("La Factory decidió…") cuando se implemente (GV-2).

### 4. Verificación automática

`tests/ai-memory.test.cjs` en gw2-factory-dev falla en CI si:

- una línea de "Esperando a Pablo" no tiene clase;
- un pedido de decisión abierto no tiene "Por qué te lo pregunto";
- hay más de 3 pedidos de decisión abiertos;
- un ítem BLOCKED no declara su dueño.

## Consecuencias

- Pablo ve solo lo que puede responder. Lo técnico que la Factory no puede hacer se ve en Trabajo y Salud, no en Hoy.
- Aplicación inicial (2026-10-20):
  - FEAT-002 pasa a "usá DEV como siempre"; la verificación de Analytics ya la cubren los tests (LES-024);
  - RSK-016 pasa a bloqueo de entorno;
  - BL-008 y BL-017 los cierra la Factory.
- El panel adopta las secciones nuevas en GV-2. Hasta entonces, la memoria ya es compatible con el panel 2.1.0.
