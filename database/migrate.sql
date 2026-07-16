-- Migración para actualizar la base de datos del Gestor de Festivales
-- Ejecuta este script en el SQL Editor de Supabase si ya tienes tablas creadas
-- y necesitas agregar las columnas nuevas sin perder datos

-- ============================================
-- TABLA: festivales - Agregar columnas nuevas
-- ============================================

-- Agregar estado_pago si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'festivales' AND column_name = 'estado_pago') THEN 
        ALTER TABLE festivales ADD COLUMN estado_pago VARCHAR(20) CHECK (estado_pago IN ('pendiente', 'pagado')) DEFAULT 'pendiente'; 
    END IF; 
END $$;

-- Agregar fecha_capacitacion si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'festivales' AND column_name = 'fecha_capacitacion') THEN 
        ALTER TABLE festivales ADD COLUMN fecha_capacitacion DATE; 
    END IF; 
END $$;

-- Agregar encargado_capacitacion si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'festivales' AND column_name = 'encargado_capacitacion') THEN 
        ALTER TABLE festivales ADD COLUMN encargado_capacitacion VARCHAR(255); 
    END IF; 
END $$;

-- Agregar diplomas_entregados si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'festivales' AND column_name = 'diplomas_entregados') THEN 
        ALTER TABLE festivales ADD COLUMN diplomas_entregados BOOLEAN DEFAULT false; 
    END IF; 
END $$;

-- Agregar pruebas_presentadas si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'festivales' AND column_name = 'pruebas_presentadas') THEN 
        ALTER TABLE festivales ADD COLUMN pruebas_presentadas BOOLEAN DEFAULT false; 
    END IF; 
END $$;

-- Agregar calificaciones_entregadas si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'festivales' AND column_name = 'calificaciones_entregadas') THEN 
        ALTER TABLE festivales ADD COLUMN calificaciones_entregadas BOOLEAN DEFAULT false; 
    END IF; 
END $$;

-- ============================================
-- ÍNDICES para las nuevas columnas
-- ============================================

CREATE INDEX IF NOT EXISTS idx_festivales_estado_pago ON festivales(estado_pago);
CREATE INDEX IF NOT EXISTS idx_festivales_fecha_capacitacion ON festivales(fecha_capacitacion);

-- ============================================
-- Políticas RLS actualizadas (si existen, las reemplaza)
-- ============================================

-- Eliminar políticas viejas si existen
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

-- Políticas actualizadas - permitir todo
CREATE POLICY "Allow all on tipos_festival" ON tipos_festival FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on juegos" ON juegos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on festivales" ON festivales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on grados" ON grados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cursos" ON cursos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bloques" ON bloques FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bloque_grados" ON bloque_grados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on encargados_juegos" ON encargados_juegos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on jefes_exploracion" ON jefes_exploracion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);
