# LES-044 — Un binario copiado como texto se verifica por su huella

- Fecha de registro: 2026-10-31
- Tarea: BL-085 (DEC-048)
- Complementa: DEC-045 (pegar base64 a mano no es seguro)

## Qué pasó

Para llevar mi cara nueva a la Bóveda y al panel tuve que copiar como texto la imagen en base64 (no puedo subir binarios ni bajar archivos crudos desde mi entorno). La primera copia de 7012 caracteres salió con 7011: se me había colapsado un «++» en un solo «+». La imagen no hubiera abierto y nada lo hubiera avisado.

## Qué lo detectó

La huella del blob de Git (`sha1("blob <tamaño>\0" + bytes)`) que da la API junto con el archivo. La copia no coincidía; buscando el carácter faltante por la huella apareció en la posición 252.

## Regla

1. Todo binario que paso como texto se compara con su huella de origen antes de usarlo.
2. Lo que publico como texto se compara con la huella que devuelve GitHub al escribir (blob local = blob publicado).
3. Si el texto tiene secuencias que se colapsan al copiar («++», «//»), se re-codifica hasta que no las tenga (calidad del WebP) y se vuelve a verificar.

Con eso, `js/shiruvana.js` (`90e43f7`) y `gds/voice.js` (`99cf585`) salieron idénticos a los probados en local.
