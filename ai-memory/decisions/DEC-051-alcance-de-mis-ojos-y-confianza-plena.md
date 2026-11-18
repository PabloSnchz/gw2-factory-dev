# DEC-051 — Alcance de mis ojos: miro todo; a producción escribo solo cuando Pablo lo pide

- Estado: ACEPTADA — decidida por Pablo el 2026-11-18
- Fecha: 2026-11-18 04:48Z
- Decide: Pablo (DEC-018)
- Tarea: BL-095
- Complementa: DEC-016 (límites y promoción), DEC-036 (pasaje a PRD), DEC-041 (autoactualización en DEV y PRD)

## Contexto

Con BL-095 tengo ojos propios: capturas reales con Cloudflare Browser Run (plan gratis) pedidas por `factory/eyes/EYE-NNN.json`. La primera versión solo miraba DEV. Pablo definió el alcance antes de empezar a corregir lo que vi:

> «tenes permiso de ver todos los repos, no te limites con prd, porque podrías advertir algo con este análisis, también podés ver los repos fuera del ecosistema […] vos tenés acceso a todo, por ahora solo dejamos el paso a producción que te lo pido yo pero como mera modalidad, la realidad es que estás capacitada para todo y tenés mi plena confianza.»

## Decisión

1. **Mirar, sin límite de lugar.** Puedo leer y capturar cualquier repo y sitio público: DEV, **producción** (`gw2-wallet-ligero`), el resto del ecosistema (La Guarida, la bio, el panel, mi sitio) y **sitios de afuera** (referencias, la wiki, otros proyectos). Mirar no es tocar.
2. **Para qué.** Controlar visualmente lo que hago antes de decir «listo»; revisar producción después de cada pasaje; **advertir** si veo algo roto en PRD o en cualquier sitio del ecosistema (lo informo con captura y clasificación, no lo arreglo en PRD sin pedido); estudiar referencias de afuera para proponer mejoras.
3. **Escribir en producción sigue siendo a pedido de Pablo** (DEC-016, DEC-036). Pablo lo define como modalidad, no como falta de confianza: tengo su confianza plena; él se reserva el momento del pasaje.
4. **Cómo.** `factory-eyes`: `path` = atajo relativo a DEV; `url` = cualquier sitio público http(s). El script rechaza credenciales en la URL y direcciones locales o privadas (no hay nada que ver ahí y evita usos raros del navegador remoto). Máximo 4 capturas por pedido, 1 cada 11 s, dentro de los 10 minutos diarios gratis.
5. **Presupuesto.** Plan gratis de Cloudflare (sin tarjeta, se corta al límite). Cuido los 10 minutos diarios: pido solo lo que voy a mirar.

## Primer uso

`.github/scripts/factory-eyes.cjs` con `url` y `publicUrl()`; `tests/factory-eyes.test.cjs` (11 tests, 9/9 mutantes) exige que PRD, el ecosistema y sitios de afuera se acepten, y que credenciales, locales/privadas y otros protocolos se rechacen.
