-- ============================================================================
-- 023 — Realtime también para los cambios de estado de la conversación
--
-- La migración 022 solo publicaba `soporte_mensajes`, así que marcar una
-- conversación como resuelta (o en proceso, o archivada) no llegaba a la otra
-- parte: había que recargar la página para ver el cambio.
--
-- ⚠️  Se publica con LISTA DE COLUMNAS, no la tabla entera, y ese detalle es la
-- parte importante. El RLS de Realtime filtra FILAS, no columnas: publicando la
-- tabla completa, el dueño de la conversación —que sí puede leer su propia
-- fila— recibiría por el canal el registro íntegro, `nota_interna` incluida,
-- cada vez que el soporte guardase una nota. Eso rompería RN-11 y CA-07 por una
-- puerta que no se ve desde la API REST, donde la columna sí está protegida por
-- el GRANT columna a columna de la 022.
--
-- La lista debe incluir la identidad de réplica de la tabla (aquí, la clave
-- primaria `id`).
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE EXCEPTION 'No existe la publicación supabase_realtime';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'soporte_conversaciones'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.soporte_conversaciones;
  END IF;

  ALTER PUBLICATION supabase_realtime
    ADD TABLE public.soporte_conversaciones (id, numero, user_id, asunto, categoria, estado, ultimo_mensaje_at);
END $$;

-- ---------------------------------------------------------------------------
-- COMPROBACIÓN — `filtra_nota_interna` debe ser false en las dos filas.
-- ---------------------------------------------------------------------------
--   SELECT tablename,
--          array_to_string(attnames, ', ') AS columnas_publicadas,
--          ('nota_interna' = ANY(attnames)) AS filtra_nota_interna
--   FROM pg_publication_tables
--   WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
--     AND tablename LIKE 'soporte_%';
