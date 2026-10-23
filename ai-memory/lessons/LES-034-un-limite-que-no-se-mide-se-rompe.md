# LES-034 — Un límite que no se mide se rompe en silencio

- Fecha de registro: 2026-10-23
- Origen: BL-065, FP-6 (cierre de DEC-035)

## Qué pasó

Los archivos de la Bóveda crecieron hasta pasar el tope de publicación de la Factory (~64 KB, LES-028) sin que nada avisara. No fue descuido de un cambio puntual: sumar un archivo nuevo costaba tocar `index.html`, que ya no se podía publicar, así que cada mejora se metía en un archivo que ya se cargaba. El camino fácil era el que agrandaba los archivos. Cuando lo vimos, 19 archivos de la app pasaban los 48 KB.

Durante semanas la regla «archivos chicos» existió solo como intención (DEC-021 ya hablaba de ≤ 40 KB por micro-ciclo). Una intención no frena a nadie un viernes a la noche.

## Lección

1. Un límite que importa se mide en CI, no se recuerda. Si no hay un test que falle, el límite ya está roto, solo que todavía no se ve.
2. La regla tiene que ir acompañada de un camino barato para cumplirla. El presupuesto de 40 KB recién es razonable ahora que un archivo nuevo cuesta una línea en `js/modules.json` (FP-5) y un archivo grande se cambia con un parche (FP-1 a FP-3). Sin eso, el test solo habría bloqueado el trabajo.
3. Un trinquete no exige arreglar todo hoy: congela lo que está mal y solo deja que mejore. La migración masiva no hace falta; cada renovación deja el archivo más chico.

## Cómo aplicar

- Zonas (DEC-035): saludable ≤ 40 KB; advertencia hasta 48 KB y registrada con motivo; congelado > 48 KB, no crece y su techo baja con él; excepción solo para datos generados.
- Antes de agregar código a un archivo congelado, extraer lo nuevo a un archivo aparte y cargarlo por `js/modules.json`.
- Cuando un archivo se achica, bajar su techo (o sacarlo de la lista) en el mismo cambio: el test lo pide.
- Estado en cualquier momento: `factory/diagnose/RUN-NNN.json` con `tests/size-budget.smoke.cjs`.
- Lo mismo vale para cualquier otra regla que queramos que se cumpla sola: medirla, hacer barato cumplirla y dejar que solo pueda mejorar.
