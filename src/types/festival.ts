export interface Grado {
  id: string
  nombre: string
  tipo: "1°" | "2°" | "3°" | "4°" | "5°" | "6°" | "7°" | "8°" | "9°" | "10°" | "11°" | "TR"
  jornada: "mañana" | "tarde"
  participantes: number
  archivo: string | null
  nombreArchivo: string
}

export interface Curso {
  id: string
  nombre: string
  grado: string
  tipo: Grado["tipo"]
  jornada: Grado["jornada"]
  participantes: number
  archivo: string | null
  nombreArchivo: string
}

export interface Festival {
  id: string
  nombre: string
  tipo: string
  colegio: string
  sede: string
  fecha: string
  encargado: string
  telefono: string
  descripcion: string
  estado: "borrador" | "activo" | "completado" | "cancelado"
  grados: Grado[]
  cursos: Curso[]
  bloques: Array<{
    id: string
    numero: number
    jornada: "mañana" | "tarde"
    total_participantes: number
    nivel1: string | null
    color1: string | null
    nivel2: string | null
    color2: string | null
  }>
  encargadosJuegos: Record<string, Array<{ juego: string; encargado: string; grado: string; ubicacion: string }>>
  jefesExploracion: Record<string, string[]>
}
