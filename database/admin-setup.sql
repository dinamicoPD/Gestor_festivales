-- Script para crear el primer usuario administrador en Supabase
-- Ejecútalo en el SQL Editor de Supabase después de crear tu base de datos

-- PASO 1: Crear el usuario en Authentication > Users de Supabase
-- Usa el email y password que desees

-- PASO 2: Ejecuta este script con tu email:
-- Reemplaza 'tu-email@dominio.com' con el email del usuario admin

-- Actualiza el perfil existente o créalo si no existe
INSERT INTO perfiles (id, es_admin, activo)
SELECT id, true, true 
FROM auth.users 
WHERE email = 'tu-email@dominio.com'
ON CONFLICT (id) DO UPDATE 
SET es_admin = true, activo = true;

-- PASO 3: Verifica que se creó correctamente:
-- SELECT u.email, p.es_admin, p.activo FROM perfiles p JOIN auth.users u ON p.id = u.id WHERE p.es_admin = true;

-- NOTA: Si el usuario ya se registró vía /register, 
-- el trigger debería haber creado su perfil automáticamente con activo=false.
-- En ese caso solo necesitas actualizar:
-- UPDATE perfiles SET es_admin = true, activo = true WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-email@dominio.com');