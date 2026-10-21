# DEC-024 — Identidad visual: la voz de Shiruvana

- Estado: ACEPTADA — opción A de REQ-009, aprobada por Pablo desde el panel (issue #8) y en la conversación, con reglas y tamaños adicionales (RESP-009, 2026-10-21)
- Fecha: 2026-10-21
- Ámbito: gw2-factory-dashboard (panel). No afecta a la app La Bóveda.
- Propuesta: `missions/FACTORY-DASHBOARD-IDENTITY-001-propuesta.md` (v2, con los tamaños aprobados)
- Relacionadas: DEC-010, DEC-013, DEC-018, DEC-019, DEC-022, DEC-023

## Contexto

Pablo pidió darle identidad visual a Shiruvana sin convertir el panel en un personaje ni perder el foco en los datos y las decisiones. Aprobó usar su imagen de referencia, sin retoques, como avatar oficial, y pidió un avatar más grande porque "se pierde en el banner del mensaje".

## Decisión

### 1. Jerarquía de identidad

- **Gato Negro Factory es la marca principal.** El ícono del gato sigue en la cabecera y representa al sistema.
- **Shiruvana es la voz operativa de la Factory.** No reemplaza la identidad visual del sistema ni usa los tokens de marca del gato.
- **La voz visible es Shiruvana; la marca visible es Gato Negro Factory.**

### 2. Regla de autoría

| Contenido | Avatar |
|---|---|
| Datos del sistema | No |
| Información medida | No |
| Recomendación de Shiruvana | Sí |
| Advertencia de Shiruvana | Sí |
| Decisión de Shiruvana | Sí |
| Resumen de Shiruvana | Sí |
| Explicación o análisis de Shiruvana | Sí |

**Prohibido:** decoración, navegación, métricas, tarjetas de datos e información objetiva del sistema.

### 3. Tamaños

| Mensaje | Escritorio | Pantalla ≤ 480 px |
|---|---|---|
| Advertencia | 48 px | 40 px |
| Recomendación | 48 px | 40 px |
| Explicación o análisis | 48 px | 40 px |
| Resumen de sesión | 56 px | 48 px |
| Decisión importante (DEC nueva, detención o reanudación de la Factory) | 56 px | 48 px |

En la columna del avatar, todos los tamaños llevan un anillo de 2 px del color del tipo de mensaje.

### 4. Densidad (decisión técnica de la Factory)

- **El avatar va en una columna a la izquierda del mensaje, alineado arriba**, no dentro de la línea del rótulo.
- **Un mensaje de Shiruvana mide como mínimo rótulo + 2 líneas:** 64 px con avatar de 48 y 88 px en el resumen con avatar de 56. Por eso el avatar más grande no agrega altura; solo usa 60–68 px de ancho.
- **En pantallas de 480 px o menos se baja un escalón**, para que el texto conserve al menos 260 px de ancho.
- **La imagen fuente permite 56 px a 2x** (recorte de 210 px). Se publica en 2 archivos, de 112 y 96 px, de menos de 15 KB entre los dos.

### 5. Un avatar por sección visible

- El primer mensaje de Shiruvana de una sección lleva el avatar.
- Los siguientes de la misma sección se muestran como mensajes de Shiruvana sin imagen: rótulo, ícono y borde del tipo.
- Las advertencias se agrupan en un solo bloque.
- El historial "Decidido por la Factory" muestra la última decisión importante con avatar y las demás en una lista sin avatar.

### 6. Diferenciación sin depender del color

Cada mensaje de Shiruvana tiene avatar, rótulo, ícono, borde izquierdo de 4 px, fecha y fuente:

| Tipo | Rótulo e ícono |
|---|---|
| Recomendación | ➜ Shiruvana recomienda |
| Decisión | ✓ Shiruvana decidió |
| Advertencia | ▲ / ■ Shiruvana advierte · nivel |
| Explicación | ◇ Shiruvana explica |
| Resumen | ◆ Shiruvana resume |

El avatar lleva `alt` vacío y `aria-hidden`, porque el rótulo visible ya dice quién habla.

## Implementación

- BL-037, en gw2-factory-dashboard, después de BL-034 (producto primero) y dentro del 15 % semanal de soporte (DEC-023).
- Tres micro-ciclos:
  1. componente y avatar;
  2. Hoy y pedidos;
  3. historial, Ideas y tests (contraste, regla de un avatar por sección y ausencia de avatar en tarjetas de datos).

## Consecuencias

- Pablo puede distinguir de un vistazo qué es dato y qué es criterio de Shiruvana.
- Agregar otro uso del avatar, o cambiar la imagen o la jerarquía de marca, es decisión de Pablo. Los tamaños y la disposición los ajusta la Factory dentro de estas reglas.
