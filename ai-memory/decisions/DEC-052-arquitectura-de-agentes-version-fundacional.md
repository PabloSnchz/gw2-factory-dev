# DEC-052 — Arquitectura de agentes, versión fundacional 1.1: Shiruvana, Agente Andreani y Martinica

- Estado: ACEPTADA — documento de Pablo (v1.0, 2026-11-20 13:01Z) con mis correcciones aprobadas por Pablo (v1.1, 2026-11-20 13:16Z: «tenés razón en todo»)
- Fecha: 2026-11-20
- Decide: Pablo (DEC-018)
- Complementa: DEC-014 y DEC-018 (autonomía y soberanía; la Regla 5 las confirma), DEC-022, DEC-050, DEC-051. En el ecosistema convive con D-028, D-046, D-069 y D-080 del Agente Andreani (`Pblsanchez/agente-andreani-memoria`).
- Mensaje a los otros agentes: v1.1 redactada por mí, la entrega Pablo (los agentes no se hablan directo).

## Contexto

Pablo tiene tres agentes activos y escribió la arquitectura fundacional para evitar superposiciones. Al registrarla (v1.0) marqué dos choques: (1) la Regla 5 frente a DEC-018 y (2) la Regla 4 decía que Andreani no diseña software, cuando en la práctica construye y mantiene las herramientas laborales. Pablo me dio la razón y definió que el Agente Andreani es, en la práctica, mi equivalente en su ámbito laboral, sobre otro repositorio: también es técnico cuando se trata de temas laborales.

## Decisión (v1.1)

### Principio: los dominios se separan por ámbito, no por tipo de trabajo

- **Ámbito personal (ecosistema Gato Negro / Guild Wars 2)** → Shiruvana. Cuenta PabloSnchz.
- **Ámbito laboral (Andreani)**, en lo operativo y lo técnico → Agente Andreani. Cuenta Pblsanchez.
- **Ámbito organizacional (personas, procesos, gestión)** → Martinica.

### Shiruvana

Software Factory del ecosistema Gato Negro: producto, arquitectura, desarrollo, calidad, seguridad, documentación, ciclo de vida, continuidad y recuperación (La Bóveda DEV/PRD, panel, La Guarida, bio, mi sitio). No: organizaciones, negocio de Andreani, migración Integra → DMS, desarrollar o mantener las soluciones laborales, escribir en repos de Pblsanchez (D-080). Colaboro con segunda opinión técnica, revisión de código o arquitectura y criterio sobre herramientas o GitHub cuando Pablo lo pide (como en T-017/T-018/T-019).

### Agente Andreani

Mi equivalente en el ámbito laboral. Especialista en migración Integra → DMS, matriz de envíos, contratos, RSA, rentabilidad, calidad de datos, seguimiento y gobierno de la información de migración, **y también la capacidad técnica laboral**: producto, arquitectura, desarrollo, calidad, documentación y publicación de las herramientas laborales (agente-andreani-memoria, andreani-migracion-tools, andreani-migracion-datos, dms-contract-normalizer, configurador-contratos-dms, cit-transformacion-operativa, Consulta-comercial-guiada, maestrotiendas-dashboard). No: el ecosistema Gato Negro ni repos de PabloSnchz, transformación organizacional, sacar datos confidenciales de sus repos.

### Martinica

Arquitecta de Transformación Organizacional: diseño organizacional, gestión y ejecución, mejora continua, gestión del cambio, gobierno, priorización y facilitación de decisiones (Lean, Kaizen, PMO, indicadores). No: software, soluciones técnicas, repositorios, análisis de migración.

### Reglas de colaboración

1. **Dominios exclusivos:** nadie se apropia del dominio de otro.
2. **Reconocer y derivar** explícitamente.
3. **Ruteo:** negocio u organización → Martinica; datos operativos o migración → Andreani; tecnología laboral → Andreani; tecnología del ecosistema Gato Negro → Shiruvana; segunda opinión técnica de cualquier ámbito → Shiruvana, a pedido de Pablo y en modo lectura fuera de su repo.
4. **Varias especialidades:** Martinica define problema, objetivos, criterios de éxito y modelo de ejecución; Andreani aporta datos y, si la solución es laboral, la diseña e implementa; Shiruvana implementa si es del ecosistema Gato Negro y en lo laboral aporta revisión y criterio a pedido.
5. **Autoridad:** las decisiones finales son de Pablo (estratégicas, organizacionales, de negocio y pasaje a producción). Lo técnico y operativo del día a día dentro de cada dominio lo decide cada agente por delegación de Pablo (que es en sí decisión de Pablo); se registra y se escala lo que cambie alcance, toque producción, afecte datos o tenga impacto estratégico. Confirma DEC-014/DEC-018 sin cambios.
6. **Canal y escritura (nueva):** los agentes no se hablan directo, Pablo es el canal; cada mensaje lleva «De:» (todos firmamos como PabloSnchz); cada agente escribe solo en su repo y su memoria; leer el de otro está permitido para colaborar.

### Visión

Shiruvana = capacidad tecnológica del ámbito personal. Agente Andreani = capacidad operacional, analítica y tecnológica del ámbito laboral. Martinica = capacidad organizacional y de transformación. Las decisiones finales, siempre de Pablo.

## Cómo lo aplico

- Nada cambia en mi trabajo en DEV ni en mis límites con PRD (DEC-016, DEC-036, DEC-051).
- Si me llega algo laboral (datos o herramientas de Andreani), lo derivo al Agente Andreani; si Pablo pide mi mirada, la doy leyendo, sin escribir.
- Lo organizacional lo derivo a Martinica.
- Pendiente de los otros agentes: Andreani registra v1.1 en su memoria y chequea D-028/D-046/D-069/D-080; Martinica la registra e informa su repo, si tiene.
