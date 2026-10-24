# LES-037 — Para renovar lo congelado, primero un marco; reescribir es el último recurso

- Fecha de registro: 2026-10-24
- Origen: BL-067, pasos 4 a 8 (RUN-016, RUN-018, `js/gn-frame.js`)

## Qué pasó

Los pasos 4 a 8 del restyle tocaban siete archivos congelados de 53 a 100 KB (DEC-035). Reescribir cada uno eran decenas de parches sobre código heredado con comportamiento delicado (Home Nodes, PSNA, Raids, inventario). El inventario (RUN-016 y RUN-018) mostró que todos pintan con las mismas variables del theme y comparten `.panel` y `.panel__title`. Un solo módulo de 9 KB por manifiesto les dio superficies, cabecera común, guarda AA y accesibilidad sin tocar una línea de esos archivos ni su comportamiento.

## Lección

1. Antes de renovar un módulo congelado, buscar lo que comparte con los demás (variables, clases, estructura). Si existe, un marco por manifiesto renueva todo con riesgo mínimo y vuelta atrás trivial: se saca del manifiesto.
2. El marco no reemplaza la renovación profunda (datos, voz, estructura): la prepara. Lo que no alcanza (colores fijos en línea, voz sin datos publicados) queda anotado como deuda con su nivel.
3. Las sondas de diagnóstico tienen que ser chicas: la salida de RUN-016 llegó recortada a la mitad; RUN-018 preguntó solo lo necesario y alcanzó.

## Cómo aplicar

- Para cada módulo heredado, primero `GNFrame` (registro en `PANELS`) y después, si hace falta, una capa `xxx-view.js` propia como en la Cámara y Logros.
- Sondas: una pregunta por RUN, salida de menos de 10 KB.
