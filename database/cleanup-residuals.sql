-- Limpieza de residuos de migraciones anteriores
-- Ejecuta este script en el SQL Editor de Supabase si obtienes:
-- "stack depth limit exceeded" al insertar en festivales/grados/cursos/bloques

-- 1. Eliminar triggers residuales conocidos
DROP TRIGGER IF EXISTS trigger_sincronizar_usuario_auth ON auth.users;
DROP TRIGGER IF EXISTS trigger_sincronizar_usuarios ON usuarios;
DROP TRIGGER IF EXISTS trigger_sincronizar_festivales ON festivales;
DROP TRIGGER IF EXISTS trigger_sincronizar_grados ON grados;
DROP TRIGGER IF EXISTS trigger_sincronizar_cursos ON cursos;
DROP TRIGGER IF EXISTS trigger_sincronizar_bloques ON bloques;

-- 2. Eliminar funciones residuales conocidas
DROP FUNCTION IF EXISTS sincronizar_usuario_auth();
DROP FUNCTION IF EXISTS usuario_actual_es_admin();
DROP FUNCTION IF EXISTS guardar_configuracion_festival(UUID, JSONB, JSONB, JSONB);

-- 3. Eliminar políticas RLS residuales de migraciones anteriores
DROP POLICY IF EXISTS "Allow all on tipos_festival" ON tipos_festival;
DROP POLICY IF EXISTS "Allow all on juegos" ON juegos;
DROP POLICY IF EXISTS "Allow all on festivales" ON festivales;
DROP POLICY IF EXISTS "Allow all on grados" ON grados;
DROP POLICY IF EXISTS "Allow all on cursos" ON cursos;
DROP POLICY IF EXISTS "Allow all on bloques" ON bloques;
DROP POLICY IF EXISTS "Allow all on bloque_grados" ON bloque_grados;
DROP POLICY IF EXISTS "Allow all on encargados_juegos" ON encargados_juegos;
DROP POLICY IF EXISTS "Allow all on jefes_exploracion" ON jefes_exploracion;
DROP POLICY IF EXISTS "Allow all on usuarios" ON usuarios;

DROP POLICY IF EXISTS "tipos_festival_read_all" ON tipos_festival;
DROP POLICY IF EXISTS "tipos_festival_write_admin" ON tipos_festival;
DROP POLICY IF EXISTS "juegos_read_all" ON juegos;
DROP POLICY IF EXISTS "juegos_write_admin" ON juegos;
DROP POLICY IF EXISTS "festivales_read_all" ON festivales;
DROP POLICY IF EXISTS "festivales_write_admin" ON festivales;
DROP POLICY IF EXISTS "grados_read_all" ON grados;
DROP POLICY IF EXISTS "grados_write_admin" ON grados;
DROP POLICY IF EXISTS "cursos_read_all" ON cursos;
DROP POLICY IF EXISTS "cursos_write_admin" ON cursos;
DROP POLICY IF EXISTS "bloques_read_all" ON bloques;
DROP POLICY IF EXISTS "bloques_write_admin" ON bloques;
DROP POLICY IF EXISTS "bloque_grados_read_all" ON bloque_grados;
DROP POLICY IF EXISTS "bloque_grados_write_admin" ON bloque_grados;
DROP POLICY IF EXISTS "encargados_juegos_read_all" ON encargados_juegos;
DROP POLICY IF EXISTS "encargados_juegos_write_admin" ON encargados_juegos;
DROP POLICY IF EXISTS "jefes_exploracion_read_all" ON jefes_exploracion;
DROP POLICY IF EXISTS "jefes_exploracion_write_admin" ON jefes_exploracion;
DROP POLICY IF EXISTS "usuarios_read_own_or_admin" ON usuarios;
DROP POLICY IF EXISTS "usuarios_write_admin" ON usuarios;
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_own" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_own_or_admin" ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete_admin" ON usuarios;
DROP POLICY IF EXISTS "usuarios_admin_select_all" ON usuarios;

-- 4. Deshabilitar RLS temporalmente para confirmar si ese era el origen del error
ALTER TABLE tipos_festival DISABLE ROW LEVEL SECURITY;
ALTER TABLE juegos DISABLE ROW LEVEL SECURITY;
ALTER TABLE festivales DISABLE ROW LEVEL SECURITY;
ALTER TABLE grados DISABLE ROW LEVEL SECURITY;
ALTER TABLE cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE bloques DISABLE ROW LEVEL SECURITY;
ALTER TABLE bloque_grados DISABLE ROW LEVEL SECURITY;
ALTER TABLE encargados_juegos DISABLE ROW LEVEL SECURITY;
ALTER TABLE jefes_exploracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
