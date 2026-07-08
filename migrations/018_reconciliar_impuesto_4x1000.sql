-- Migración: Reconciliar el 4×1000 (GMF) entre historial_pagos_cuota y la columna cuotas.impuesto_4x1000
--
-- Contexto: la columna cuotas.impuesto_4x1000 (migración 017) es la fuente SÍNCRONA confiable,
-- pero se agregó después de que muchos pagos ya existían. En esos pagos el GMF quedó solo en
-- historial_pagos_cuota. A la vez, el insert de historial es "fire-and-forget" y a veces falta,
-- por lo que hay cuotas cuyo GMF está solo en la columna. Resultado: las vistas divergían
-- (Cuadre de Caja leía historial; el reenvío leía la columna).
--
-- Solución de datos: dejar cuotas.impuesto_4x1000 como el total COMPLETO por cuota, tomando el
-- mayor entre lo que ya tiene la columna y la suma del GMF por transferencia registrado en el
-- historial. Nunca baja un valor (GREATEST), así que es idempotente y seguro de re-ejecutar.
--
-- Tras esta migración, la columna es autoritativa y completa; el Cuadre de Caja la usa como
-- respaldo (ver reconciliación de lectura en CuadreCaja.vue) y el reenvío ya la usaba.

WITH gmf_hist AS (
  SELECT
    cuota_id,
    SUM(impuesto_4x1000) AS total_gmf
  FROM historial_pagos_cuota
  WHERE impuesto_4x1000 > 0
    AND lower(coalesce(forma_pago, '')) = 'transferencia'
  GROUP BY cuota_id
)
UPDATE cuotas c
SET impuesto_4x1000 = GREATEST(COALESCE(c.impuesto_4x1000, 0), g.total_gmf)
FROM gmf_hist g
WHERE c.id = g.cuota_id
  AND g.total_gmf > COALESCE(c.impuesto_4x1000, 0);
