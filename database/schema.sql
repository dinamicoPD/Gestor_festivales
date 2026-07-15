-- Festival Management System Database Schema for Supabase
-- Supabase PostgreSQL compatible with public access policies

-- Festival types/categories
CREATE TABLE tipos_festival (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default festival types
INSERT INTO tipos_festival (nombre, descripcion) VALUES 
    ('Artes', 'Festival de artes integradas'),
    ('Deportes', 'Festival deportivo'),
    ('Ciencias', 'Festival de ciencias'),
    ('Literatura', 'Festival literario'),
    ('Música', 'Festival musical')
ON CONFLICT (nombre) DO NOTHING;

-- Festival games (organized by type)
CREATE TABLE juegos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    tipo_festival_id UUID NOT NULL REFERENCES tipos_festival(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nombre, tipo_festival_id)
);

-- Main festivals table
CREATE TABLE festivales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    tipo_festival_id UUID NOT NULL REFERENCES tipos_festival(id),
    colegio VARCHAR(255) NOT NULL,
    sede VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    encargado VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) CHECK (estado IN ('borrador', 'activo', 'completado', 'cancelado')) DEFAULT 'borrador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grade levels (grades)
CREATE TABLE grados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID NOT NULL REFERENCES festivales(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°', 'TR')) NOT NULL,
    jornada VARCHAR(10) CHECK (jornada IN ('mañana', 'tarde')) NOT NULL,
    participantes INTEGER NOT NULL DEFAULT 0 CHECK (participantes >= 0),
    archivo TEXT,
    nombre_archivo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course levels
CREATE TABLE cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID NOT NULL REFERENCES festivales(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    grado VARCHAR(255),
    tipo VARCHAR(10) CHECK (tipo IN ('1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°', 'TR')) NOT NULL,
    jornada VARCHAR(10) CHECK (jornada IN ('mañana', 'tarde')) NOT NULL,
    participantes INTEGER NOT NULL DEFAULT 0 CHECK (participantes >= 0),
    archivo TEXT,
    nombre_archivo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Festival blocks (calculated distribution)
CREATE TABLE bloques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID NOT NULL REFERENCES festivales(id) ON DELETE CASCADE,
    numero INTEGER NOT NULL,
    jornada TEXT NOT NULL,
    total_participantes INTEGER NOT NULL,
    nivel1 TEXT,
    color1 TEXT,
    nivel2 TEXT,
    color2 TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(festival_id, numero, jornada)
);

-- Block grades association
CREATE TABLE bloque_grados (
    bloque_id UUID NOT NULL REFERENCES bloques(id) ON DELETE CASCADE,
    grado_id UUID NOT NULL REFERENCES grados(id) ON DELETE CASCADE,
    PRIMARY KEY (bloque_id, grado_id)
);

-- Game supervisors assigned to blocks
CREATE TABLE encargados_juegos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID NOT NULL REFERENCES festivales(id) ON DELETE CASCADE,
    bloque_id UUID NOT NULL REFERENCES bloques(id) ON DELETE CASCADE,
    juego_id UUID NOT NULL REFERENCES juegos(id),
    encargado VARCHAR(255) NOT NULL,
    grado VARCHAR(255),
    ubicacion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exploration leaders by grade
CREATE TABLE jefes_exploracion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    festival_id UUID NOT NULL REFERENCES festivales(id) ON DELETE CASCADE,
    grado_id UUID NOT NULL REFERENCES grados(id) ON DELETE CASCADE,
    jefe1 VARCHAR(255),
    jefe2 VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(festival_id, grado_id)
);

-- Users table (organizers)
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(20),
    es_admin BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_festivales_tipo ON festivales(tipo_festival_id);
CREATE INDEX idx_festivales_estado ON festivales(estado);
CREATE INDEX idx_festivales_fecha ON festivales(fecha);
CREATE INDEX idx_grados_festival ON grados(festival_id);
CREATE INDEX idx_cursos_festival ON cursos(festival_id);
CREATE INDEX idx_bloques_festival ON bloques(festival_id);
CREATE INDEX idx_bloques_jornada ON bloques(jornada);
CREATE INDEX idx_juegos_tipo ON juegos(tipo_festival_id);
CREATE INDEX idx_encargados_juegos_bloque ON encargados_juegos(bloque_id);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Row Level Security - Allow all access for authenticated and anonymous users
ALTER TABLE tipos_festival ENABLE ROW LEVEL SECURITY;
ALTER TABLE juegos ENABLE ROW LEVEL SECURITY;
ALTER TABLE festivales ENABLE ROW LEVEL SECURITY;
ALTER TABLE grados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloques ENABLE ROW LEVEL SECURITY;
ALTER TABLE bloque_grados ENABLE ROW LEVEL SECURITY;
ALTER TABLE encargados_juegos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jefes_exploracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Policies for tipos_festival - allow all operations
CREATE POLICY "Allow all on tipos_festival" ON tipos_festival FOR ALL USING (true) WITH CHECK (true);

-- Policies for juegos - allow all operations  
CREATE POLICY "Allow all on juegos" ON juegos FOR ALL USING (true) WITH CHECK (true);

-- Policies for festivales - allow all operations
CREATE POLICY "Allow all on festivales" ON festivales FOR ALL USING (true) WITH CHECK (true);

-- Policies for grados - allow all operations
CREATE POLICY "Allow all on grados" ON grados FOR ALL USING (true) WITH CHECK (true);

-- Policies for cursos - allow all operations
CREATE POLICY "Allow all on cursos" ON cursos FOR ALL USING (true) WITH CHECK (true);

-- Policies for bloques - allow all operations
CREATE POLICY "Allow all on bloques" ON bloques FOR ALL USING (true) WITH CHECK (true);

-- Policies for bloque_grados - allow all operations
CREATE POLICY "Allow all on bloque_grados" ON bloque_grados FOR ALL USING (true) WITH CHECK (true);

-- Policies for encargados_juegos - allow all operations
CREATE POLICY "Allow all on encargados_juegos" ON encargados_juegos FOR ALL USING (true) WITH CHECK (true);

-- Policies for jefes_exploracion - allow all operations
CREATE POLICY "Allow all on jefes_exploracion" ON jefes_exploracion FOR ALL USING (true) WITH CHECK (true);

-- Policies for usuarios - allow all operations
CREATE POLICY "Allow all on usuarios" ON usuarios FOR ALL USING (true) WITH CHECK (true);