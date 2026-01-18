-- Agregar email del invitador a la vista de colaboradores
-- Esto permite mostrar nombre y email del usuario que invitó

DROP VIEW IF EXISTS vista_colaboradores_natillera;

CREATE VIEW vista_colaboradores_natillera AS
SELECT 
    nc.id,
    nc.natillera_id,
    nc.usuario_id,
    nc.permisos,
    nc.rol,
    nc.estado,
    nc.invitado_por,
    nc.email_invitado,
    nc.token_invitacion,
    nc.notas,
    nc.fecha_invitacion,
    nc.fecha_respuesta,
    nc.created_at,
    nc.updated_at,
    COALESCE(up.nombre, up.email, nc.email_invitado) as nombre_usuario,
    COALESCE(up.email, nc.email_invitado) as email_usuario,
    up.avatar_seed,
    up.avatar_style,
    -- Información de quien invitó: nombre (puede ser NULL si no tiene nombre)
    (SELECT nombre FROM user_profiles WHERE id = nc.invitado_por) as invitado_por_nombre,
    -- Información de quien invitó: email (siempre presente)
    (SELECT email FROM user_profiles WHERE id = nc.invitado_por) as invitado_por_email,
    n.nombre as natillera_nombre
FROM natillera_colaboradores nc
LEFT JOIN user_profiles up ON nc.usuario_id = up.id
LEFT JOIN natilleras n ON nc.natillera_id = n.id;

GRANT SELECT ON vista_colaboradores_natillera TO authenticated;
