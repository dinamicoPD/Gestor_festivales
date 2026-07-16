import { Curso, Grado } from "@/types/festival"

interface BloqueGrado {
  numero: number
  grados: Grado[]
  total: number
}

interface BloqueCurso {
  numero: number
  cursos: Curso[]
  total: number
}

export function generarBloques(participantes: number, capacidad = 180) {
  const bloques: { numero: number }[] = []
  let contadorBloque = 1
  let restantes = participantes

  while (restantes > 0) {
    bloques.push({ numero: contadorBloque++ })
    restantes -= capacidad
  }

  return bloques
}

export function distribuirCursosEnBloques(cursos: Curso[], capacidad = 180) {
  const ordenados = [...cursos].sort((a, b) => ordenarTipoGrado(a.tipo) - ordenarTipoGrado(b.tipo))
  const bloques: BloqueCurso[] = []
  let actual = { numero: 1, cursos: [] as Curso[], total: 0 }

  for (const curso of ordenados) {
    if (actual.total + curso.participantes > capacidad && actual.cursos.length > 0) {
      bloques.push(actual)
      actual = { numero: bloques.length + 1, cursos: [] as Curso[], total: 0 }
    }
    actual.cursos.push(curso)
    actual.total += curso.participantes
  }
  if (actual.cursos.length > 0) bloques.push(actual)

  for (let i = bloques.length - 1; i >= 0; i--) {
    const bloque = bloques[i]
    if (bloque.cursos.length < 2 && bloques.length > 1) {
      const curso = bloque.cursos[0]
      if (i > 0) {
        const anterior = bloques[i - 1]
        if (anterior.total + curso.participantes <= capacidad) {
          anterior.cursos.push(curso)
          anterior.total += curso.participantes
          bloques.splice(i, 1)
          continue
        }
      }
      if (i < bloques.length - 1) {
        const siguiente = bloques[i + 1]
        if (siguiente.total + curso.participantes <= capacidad) {
          siguiente.cursos.push(curso)
          siguiente.total += curso.participantes
          bloques.splice(i, 1)
        }
      }
    }
  }

  return bloques
}

export function distribuirGradosEnBloques(grados: Grado[], capacidad = 180) {
  const ordenados = [...grados].sort((a, b) => ordenarTipoGrado(a.tipo) - ordenarTipoGrado(b.tipo))
  const bloques: BloqueGrado[] = []
  let actual = { numero: 1, grados: [] as Grado[], total: 0 }

  for (const grado of ordenados) {
    if (actual.total + grado.participantes > capacidad && actual.grados.length > 0) {
      bloques.push(actual)
      actual = { numero: bloques.length + 1, grados: [] as Grado[], total: 0 }
    }
    actual.grados.push(grado)
    actual.total += grado.participantes
  }
  if (actual.grados.length > 0) bloques.push(actual)

  for (let i = bloques.length - 1; i >= 0; i--) {
    const bloque = bloques[i]
    if (bloque.grados.length < 2 && bloques.length > 1) {
      const grado = bloque.grados[0]
      if (i > 0) {
        const anterior = bloques[i - 1]
        if (anterior.total + grado.participantes <= capacidad) {
          anterior.grados.push(grado)
          anterior.total += grado.participantes
          bloques.splice(i, 1)
          continue
        }
      }
      if (i < bloques.length - 1) {
        const siguiente = bloques[i + 1]
        if (siguiente.total + grado.participantes <= capacidad) {
          siguiente.grados.push(grado)
          siguiente.total += grado.participantes
          bloques.splice(i, 1)
        }
      }
    }
  }

  return bloques
}

export function ordenarTipoGrado(tipo: Grado["tipo"]) {
  const orden: Record<Grado["tipo"], number> = {
    "TR": 0,
    "1°": 1, "2°": 2, "3°": 3, "4°": 4, "5°": 5, "6°": 6,
    "7°": 7, "8°": 8, "9°": 9, "10°": 10, "11°": 11,
  }
  return orden[tipo]
}

export function calcularGrupos(participantes: number) {
  if (participantes <= 0) return { grupos3: 0, grupos2: 0, total: 0 }
  const resto = participantes % 3
  if (resto === 0) return { grupos3: participantes / 3, grupos2: 0, total: participantes / 3 }
  if (resto === 1) {
    if (participantes >= 4) {
      const grupos3 = (participantes - 4) / 3
      return { grupos3, grupos2: 2, total: grupos3 + 2 }
    }
    return { grupos3: 0, grupos2: 0, total: 0 }
  }
  const grupos3 = Math.floor(participantes / 3)
  return { grupos3, grupos2: 1, total: grupos3 + 1 }
}
