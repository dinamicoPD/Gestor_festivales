-- Script para crear el primer usuario administrador
-- Ejecútalo en el SQL Editor de Supabase después de crear tu base de datos

INSERT INTO usuarios (username, password, nombre_completo, email, telefono, es_admin, activo)
VALUES (
    'admin',
    'admin123',
    'Administrador',
    'admin@festivales.com',
    '3000000000',
    true,
    true
)
ON CONFLICT (username) DO UPDATE 
SET es_admin = true, activo = true;

-- Verifica que se creó correctamente:
-- SELECT username, nombre_completo, es_admin, activo FROM usuarios WHERE es_admin = true;
