# RESP-004 — Aprobada: REQ-004

- Estado: PROCESADA
- Fecha: 2026-10-20T16:49Z
- Solicitud: REQ-004
- Respuesta: APPROVED
- Opción: B
- Issue: https://github.com/PabloSnchz/gw2-factory-dev/issues/5
- Autor: PabloSnchz

## Comentario

La Factory puede investigar y descubrir trabajo nuevo mientras:

- no existan riesgos CRÍTICOS;
- exista capacidad en READY;
- no esté bloqueada la propia tarea.

Las decisiones pendientes NO detienen Discovery salvo que bloqueen directamente la investigación.

Las acciones humanas NO detienen Discovery.

Las validaciones funcionales NO detienen Discovery.

Las decisiones estratégicas solo detienen el área afectada.

## Efecto

Procesada por la Factory el 2026-10-20T17:00Z, al inicio de FACTORY-GOVERNANCE-001.

- REQ-004 queda CERRADA con referencia a esta respuesta.
- DEC-015 §5 se reemplaza por las reglas de Pablo, tal como están escritas. Quedan habilitadas las rondas autónomas de discovery, con los topes de DEC-015 y DEC-016 (3 nuevas por ronda, 1 ronda por sesión, abiertas ≤ 15).
- Lectura de "capacidad en READY": READY < 5, es decir, que una oportunidad promovida pueda entrar sin pasar el límite. Con READY en 4 (hoy) hay capacidad y rige el modo restringido de DEC-016 (solo ALTA).
- Las reglas finas (qué es "bloquear directamente la investigación" y cuál es "el área afectada") se proponen en `missions/FACTORY-GOVERNANCE-001-propuesta.md` para que Pablo las valide.
