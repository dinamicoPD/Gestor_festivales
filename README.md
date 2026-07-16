# Gestor de Festivales

Sistema de gestión integral para la organización y administración de festivales escolares. Permite crear festivales, gestionar grados y cursos, distribuir participantes en bloques, asignar encargados de juegos y jefes de exploración, todo sincronizado con Supabase.

## Características principales

- **Gestión de festivales**: CRUD completo con estados (borrador, activo, completado, cancelado)
- **Tipos y juegos**: Catálogo configurable de tipos de festival y juegos asociados
- **Grados y cursos**: Registro de grados y cursos con jornada (mañana/tarde), participantes y links a Google Drive
- **Distribución automática en bloques**: Algoritmo que distribuye participantes en bloques de hasta 150 personas, separados por jornada
- **Encargados de juegos**: Asignación de responsables por bloque y juego
- **Jefes de exploración**: Registro de 2 jefes por grado
- **Gestión de organizadores**: Panel administrativo para crear, activar/desactivar y eliminar usuarios

## Tech Stack

- [Next.js 16](https://nextjs.org/) — Framework React con App Router
- [React 19](https://react.dev/) — Biblioteca UI
- [TypeScript](https://www.typescriptlang.org/) — Tipado estático
- [Tailwind CSS 4](https://tailwindcss.com/) — Estilos utility-first
- [Supabase](https://supabase.com/) — Backend como servicio (PostgreSQL + Auth)
- [Google APIs](https://github.com/googleapis/google-api-nodejs-client) — Integración con Google Drive

## Requisitos previos

- Node.js >= 18
- npm o yarn
- Cuenta de Supabase
- (Opcional) Credenciales de Google Drive API

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/gestor-festivales.git
cd gestor-festivales

# Instalar dependencias
npm install
```

## Configuración

1. Crea un proyecto en [Supabase](https://supabase.com/)
2. Ejecuta el schema SQL ubicado en `database/schema.sql` en el SQL Editor de Supabase
3. Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. (Opcional) Configura credenciales de Google Drive API en Supabase si necesitas integración con Drive.

## Uso

```bash
# Desarrollo
npm run dev

# Abre http://localhost:3000
```

### Flujo de trabajo

1. **Configurar tipos y juegos**: Ve a `/tipos-juegos` para agregar tipos de festival y juegos por tipo.
2. **Crear festival**: Desde la página principal, crea un nuevo festival con su información básica.
3. **Gestionar festival**: Abre el modal de gestión para agregar grados/cursos y distribuir en bloques automáticamente.
4. **Asignar encargados**: En la pestaña "Encargados" del modal, asigna responsables a cada bloque/juego.
5. **Registrar organizadores**: Ve a `/admin` para gestionar usuarios con acceso al sistema.

## Estructura del proyecto

```
src/
├── app/
│   ├── admin/page.tsx          # Gestión de organizadores
│   ├── register/page.tsx       # Registro de organizadores
│   ├── tipos-juegos/page.tsx   # Catálogo de tipos y juegos
│   ├── page.tsx                # Página principal (listado de festivales)
│   └── layout.tsx              # Layout raíz
├── components/
│   ├── GestionModal.tsx        # Modal de gestión de festival
│   ├── CrearFestivalForm.tsx   # Formulario crear/editar festival
│   └── LoginForm.tsx           # Formulario de login
├── hooks/
│   ├── useFestivales.ts        # Lógica CRUD de festivales
│   ├── useTiposFestival.ts     # Lógica de tipos de festival
│   ├── useJuegosPorTipo.ts     # Lógica de juegos por tipo
│   ├── useAuth.tsx             # Autenticación
│   └── useUsuarios.tsx         # Gestión de usuarios
├── lib/
│   └── supabase.ts             # Cliente Supabase
├── types/
│   └── festival.ts             # Tipos TypeScript
└── utils/
    └── festival.ts             # Utilidades de cálculo de bloques y grupos
database/
├── schema.sql                  # Schema completo de Supabase
├── admin-setup.sql             # Setup inicial de admin
└── cleanup-residuals.sql        # Limpieza de datos residuales
```

## Base de datos

El schema incluye las siguientes tablas principales:

- `tipos_festival` — Categorías de festival
- `juegos` — Juegos asociados a cada tipo
- `festivales` — Información principal de cada festival, incluyendo estado de pago y datos de capacitación
- `grados` — Grados participantes con datos de asistencia y links
- `cursos` — Cursos participantes
- `bloques` — Bloques calculados automáticamente (máx. 150 participantes)
- `bloque_grados` — Relación bloques-grados
- `encargados_juegos` — Asignación de responsables por bloque
- `jefes_exploracion` — Jefes por grado
- `usuarios` — Organizadores del sistema

## Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter ESLint
```

## Deployment

### Vercel (recomendado)

1. Conecta el repositorio en [Vercel](https://vercel.com/new)
2. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático en cada push a main.

### Docker (opcional)

```bash
docker build -t gestor-festivales .
docker run -p 3000:3000 gestor-festivales
```

## Contribución

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## Licencia

MIT
