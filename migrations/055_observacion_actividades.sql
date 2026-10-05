-- Observación libre de una actividad.
--
-- El administrador necesita dejar una nota en la actividad (quién aportó el premio, por qué
-- se corrigió un valor, etc.) y verla en la tarjeta sin abrirla. Es texto libre y opcional.

alter table public.actividades
  add column if not exists observacion text;

comment on column public.actividades.observacion is
  'Nota libre del administrador. Si tiene texto, se muestra en la tarjeta de la actividad.';
