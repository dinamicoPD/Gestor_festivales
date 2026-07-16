import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Festival, Grado, Curso } from "@/types/festival"
import { distribuirCursosEnBloques, distribuirGradosEnBloques } from "@/utils/festival"

interface BloqueInfo {
  id: string
  niveles: Array<{ nivel: string; color: string }>
}

export function useFestivales() {
  const [festivales, setFestivales] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFestivales()
  }, [])

  const fetchFestivales = async () => {
    setLoading(true)
    const { data } = await supabase.from("festivales").select(`
      *,
      grados (*),
      cursos (*),
      tipos_festival (nombre),
      bloques (*)
    `).order("created_at", { ascending: false })

    const festivalesAdaptados: Festival[] = ((data || []) as any[]).map((f) => ({
      id: f.id,
      nombre: f.nombre,
      tipo: f.tipos_festival?.nombre || f.tipo_festival_id,
      colegio: f.colegio,
      sede: f.sede,
      fecha: f.fecha,
      encargado: f.encargado,
      telefono: f.telefono,
      descripcion: f.descripcion,
      estado: f.estado,
      estado_pago: f.estado_pago,
      fecha_capacitacion: f.fecha_capacitacion,
      encargado_capacitacion: f.encargado_capacitacion,
      diplomas_entregados: f.diplomas_entregados,
      pruebas_presentadas: f.pruebas_presentadas,
      calificaciones_entregadas: f.calificaciones_entregadas,
      grados: (f.grados || []).map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        tipo: g.tipo,
        jornada: g.jornada,
        participantes: g.participantes || 0,
        archivo: g.archivo,
        nombreArchivo: g.nombre_archivo,
      })),
      cursos: (f.cursos || []).map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        grado: c.grado,
        tipo: c.tipo,
        jornada: c.jornada,
        participantes: c.participantes || 0,
        archivo: c.archivo,
        nombreArchivo: c.nombre_archivo,
      })),
      bloques: (f.bloques || []).map((b: any) => ({
        id: b.id,
        numero: b.numero,
        jornada: b.jornada,
        total_participantes: b.total_participantes,
        nivel1: b.nivel1,
        color1: b.color1,
        nivel2: b.nivel2,
        color2: b.color2,
      })),
      encargadosJuegos: {},
      jefesExploracion: {},
    }))
    setFestivales(festivalesAdaptados)
    setLoading(false)
  }

  const refrescarFestival = async (festivalId: string): Promise<Festival | null> => {
    const { data } = await supabase.from("festivales").select(`
      *,
      grados (*),
      cursos (*),
      tipos_festival (nombre),
      bloques (*)
    `).eq("id", festivalId).single()

    const { data: cursosDirectos } = await supabase.from("cursos").select("*").eq("festival_id", festivalId)
    const cursos = (data?.cursos && data.cursos.length > 0) ? data.cursos : (cursosDirectos || [])
    const bloques = (data?.bloques && data.bloques.length > 0) ? data.bloques : []

    console.log("refrescarFestival - festivalId:", festivalId, "cursos_rel:", data?.cursos?.length ?? 0, "cursos_directos:", cursosDirectos?.length ?? 0, "cursos_final:", cursos.length, "bloques:", bloques.length)

    if (!data) return null

    return {
      id: data.id,
      nombre: data.nombre,
      tipo: data.tipos_festival?.nombre || data.tipo_festival_id,
      colegio: data.colegio,
      sede: data.sede,
      fecha: data.fecha,
      encargado: data.encargado,
      telefono: data.telefono,
      descripcion: data.descripcion,
      estado: data.estado,
      estado_pago: data.estado_pago,
      fecha_capacitacion: data.fecha_capacitacion,
      encargado_capacitacion: data.encargado_capacitacion,
      diplomas_entregados: data.diplomas_entregados,
      pruebas_presentadas: data.pruebas_presentadas,
      calificaciones_entregadas: data.calificaciones_entregadas,
      grados: (data.grados || []).map((g: any) => ({
        id: g.id,
        nombre: g.nombre,
        tipo: g.tipo,
        jornada: g.jornada,
        participantes: g.participantes || 0,
        archivo: g.archivo,
        nombreArchivo: g.nombre_archivo,
      })),
      cursos: cursos.map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        grado: c.grado,
        tipo: c.tipo,
        jornada: c.jornada,
        participantes: c.participantes || 0,
        archivo: c.archivo,
        nombreArchivo: c.nombre_archivo,
      })),
      bloques: bloques.map((b: any) => ({
        id: b.id,
        numero: b.numero,
        jornada: b.jornada,
        total_participantes: b.total_participantes,
        nivel1: b.nivel1,
        color1: b.color1,
        nivel2: b.nivel2,
        color2: b.color2,
      })),
      encargadosJuegos: {},
      jefesExploracion: {},
    }
  }

  const sincronizarBloques = async (festivalId: string, cursos: Curso[], grados: Grado[] = []): Promise<Map<string, string>> => {
    console.log("sincronizarBloques llamado con festivalId:", festivalId, "cursos:", cursos.length, "grados:", grados.length)

    const { data: festival } = await supabase.from("festivales").select("tipo_festival_id").eq("id", festivalId).single()
    if (!festival) {
      console.log("sincronizarBloques: festival no encontrado")
      return new Map()
    }
    console.log("sincronizarBloques: tipo_festival_id:", festival.tipo_festival_id)

    const { data: bloquesExistentes } = await supabase.from("bloques").select("*").eq("festival_id", festivalId)
    console.log("sincronizarBloques: bloques existentes:", bloquesExistentes?.length ?? 0)

    const cursosManana = cursos.filter(c => c.jornada === "mañana")
    const cursosTarde = cursos.filter(c => c.jornada === "tarde")
    const bloquesManana = cursosManana.length > 0 ? distribuirCursosEnBloques(cursosManana) : distribuirGradosEnBloques(grados.filter(g => g.jornada === "mañana"))
    const bloquesTarde = cursosTarde.length > 0 ? distribuirCursosEnBloques(cursosTarde) : distribuirGradosEnBloques(grados.filter(g => g.jornada === "tarde"))
    const todosBloques = [
      ...bloquesManana.map(b => ({ ...b, jornada: "mañana" as const })),
      ...bloquesTarde.map(b => ({ ...b, jornada: "tarde" as const }))
    ]
    console.log("sincronizarBloques: bloques calculados:", todosBloques.length, todosBloques)

    const existentesPorClave = new Map((bloquesExistentes || []).map(b => [b.jornada + "-" + b.numero, b.id]))

    const clavesEsperadas = new Set(todosBloques.map(b => b.jornada + "-" + b.numero))

    for (const bloque of (bloquesExistentes || [])) {
      const clave = bloque.jornada + "-" + bloque.numero
      if (!clavesEsperadas.has(clave)) {
        console.log("sincronizarBloques: eliminando bloque sobrante", clave)
        await supabase.from("bloques").delete().eq("id", bloque.id)
      }
    }

    const upserts = todosBloques.map(bloque => {
      const clave = bloque.jornada + "-" + bloque.numero
      const existenteId = existentesPorClave.get(clave)
      if (existenteId) {
        const existente = (bloquesExistentes || []).find(b => b.id === existenteId)
        if (existente && existente.total_participantes !== bloque.total) {
          console.log("sincronizarBloques: actualizando bloque existente", clave, "total:", bloque.total)
          return supabase.from("bloques").update({ total_participantes: bloque.total }).eq("id", existenteId)
        }
        console.log("sincronizarBloques: bloque sin cambios", clave)
        return Promise.resolve({ data: existente, error: null })
      }

      console.log("sincronizarBloques: creando bloque nuevo", clave, "total:", bloque.total)
      return supabase.from("bloques").upsert({
        festival_id: festivalId,
        numero: bloque.numero,
        jornada: bloque.jornada,
        total_participantes: bloque.total,
        nivel1: null,
        color1: null,
        nivel2: null,
        color2: null,
      }, { onConflict: "festival_id,numero,jornada" })
    })

    const resultados = await Promise.all(upserts)
    const upsertError = resultados.find(r => r.error)?.error
    if (upsertError) {
      console.error("Error sincronizando bloques:", JSON.stringify(upsertError, null, 2))
      throw upsertError
    }

    const { data: bloquesGuardados } = await supabase.from("bloques").select("id, numero, jornada").eq("festival_id", festivalId)
    const mapaFinal = new Map<string, string>()
    for (const b of bloquesGuardados || []) {
      mapaFinal.set(b.jornada + "-" + b.numero, b.id)
    }

    const creados = mapaFinal.size - existentesPorClave.size
    const actualizados = existentesPorClave.size
    console.log(`Bloques sincronizados: ${creados} creados, ${actualizados} actualizados`)
    return mapaFinal
  }

  const actualizarBloque = async (festivalId: string, bloqueId: string, niveles: { nivel: string; color: string }[]) => {
    const payload: any = {
      nivel1: niveles[0]?.nivel || null,
      color1: niveles[0]?.color || null,
      nivel2: niveles[1]?.nivel || null,
      color2: niveles[1]?.color || null,
    }

    const { error } = await supabase.from("bloques").update(payload).eq("id", bloqueId)
    if (error) {
      console.error("Error actualizando bloque:", JSON.stringify(error, null, 2))
      throw error
    }
  }

  const guardarEncargadosJuegos = async (festivalId: string, juegosEncargados: Record<string, Array<{ juego: string; encargado: string; grado: string; ubicacion: string }>>) => {
    const { data: festival } = await supabase.from("festivales").select("tipo_festival_id").eq("id", festivalId).single()
    if (!festival) return

    const { data: bloquesBD } = await supabase.from("bloques").select("id, numero, jornada").eq("festival_id", festivalId)
    const bloquesMap = new Map((bloquesBD || []).map(b => [b.jornada + "-" + b.numero, b.id]))

    const { data: juegosBD } = await supabase.from("juegos").select("id, nombre").eq("tipo_festival_id", festival.tipo_festival_id)
    const juegosMap = new Map((juegosBD || []).map((j: any) => [j.nombre, j.id]))

    const filas: Array<{ bloque_id: string; juego_id: string; encargado: string; grado: string; ubicacion: string }> = []
    for (const [bloqueId, filasJuego] of Object.entries(juegosEncargados)) {
      const bloqueIdReal = bloquesMap.get(bloqueId)
      if (!bloqueIdReal) continue

      for (const fila of filasJuego) {
        if (!fila.juego) continue
        const juegoId = juegosMap.get(fila.juego)
        if (!juegoId) continue

        filas.push({
          bloque_id: bloqueIdReal,
          juego_id: juegoId,
          encargado: fila.encargado,
          grado: fila.grado,
          ubicacion: fila.ubicacion,
        })
      }
    }

    if (filas.length === 0) return

    const idsBloques = (bloquesBD || []).map(b => b.id)
    if (idsBloques.length > 0) {
      await supabase.from("encargados_juegos").delete().in("bloque_id", idsBloques)
    }

    const inserts = filas.map(fila =>
      supabase.from("encargados_juegos").insert(fila)
    )
    const resultados = await Promise.all(inserts)
    const error = resultados.find(r => r.error)?.error
    if (error) {
      console.error("Error guardando encargados de juegos:", JSON.stringify(error, null, 2))
      throw error
    }
  }

  const guardarJefesExploracion = async (festivalId: string, jefesExploracion: Record<string, string[]>) => {
    const { data: gradosBD } = await supabase.from("grados").select("id").eq("festival_id", festivalId)
    const gradosIds = new Set((gradosBD || []).map((g: any) => g.id))

    const inserts = []
    for (const [gradoId, jefes] of Object.entries(jefesExploracion)) {
      if (!gradosIds.has(gradoId)) continue

      inserts.push(
        supabase.from("jefes_exploracion").upsert({
          festival_id: festivalId,
          grado_id: gradoId,
          jefe1: jefes[0] || null,
          jefe2: jefes[1] || null,
        }, { onConflict: "grado_id" })
      )
    }

    if (inserts.length > 0) {
      const resultados = await Promise.all(inserts)
      const error = resultados.find(r => r.error)?.error
      if (error) {
        console.error("Error guardando jefes de exploración:", JSON.stringify(error, null, 2))
        console.error("Resultados:", JSON.stringify(resultados.map(r => ({ data: r.data, error: r.error })), null, 2))
        throw error
      }
    }
  }

  const getTipoId = async (tipoNombre: string): Promise<string | null> => {
    const { data } = await supabase
      .from("tipos_festival")
      .select("id")
      .eq("nombre", tipoNombre)
      .single()
    return data?.id || null
  }

  const buildGradoPayload = async (grado: Grado, festivalId: string) => {
    const payload: Record<string, any> = {
      festival_id: festivalId,
      nombre: grado.nombre,
      tipo: grado.tipo,
      jornada: grado.jornada,
      participantes: grado.participantes || 0,
    }
    if (grado.archivo) payload.archivo = grado.archivo
    if (grado.nombreArchivo) payload.nombre_archivo = grado.nombreArchivo
    return payload
  }

  const buildCursoPayload = async (curso: any, festivalId: string) => {
    const payload: Record<string, any> = {
      festival_id: festivalId,
      nombre: curso.nombre,
      grado: curso.grado,
      tipo: curso.tipo,
      jornada: curso.jornada,
      participantes: curso.participantes || 0,
    }
    if (curso.archivo) payload.archivo = curso.archivo
    if (curso.nombreArchivo) payload.nombre_archivo = curso.nombreArchivo
    return payload
  }

  const agregarFestival = async (festival: Festival) => {
    const tipoId = await getTipoId(festival.tipo)
    if (!tipoId) return

    const { data, error } = await supabase.from("festivales").insert({
      nombre: festival.nombre,
      tipo_festival_id: tipoId,
      colegio: festival.colegio,
      sede: festival.sede,
      fecha: festival.fecha,
      encargado: festival.encargado,
      telefono: festival.telefono,
      descripcion: festival.descripcion,
      estado: festival.estado,
      estado_pago: festival.estado_pago || "pendiente",
      fecha_capacitacion: festival.fecha_capacitacion || null,
      encargado_capacitacion: festival.encargado_capacitacion || null,
      diplomas_entregados: festival.diplomas_entregados || false,
      pruebas_presentadas: festival.pruebas_presentadas || false,
      calificaciones_entregadas: festival.calificaciones_entregadas || false,
    }).select().single()

    if (error || !data) {
      console.error("Error creando festival:", error)
      return
    }

    for (const grado of festival.grados || []) {
      const payload = await buildGradoPayload(grado, data.id)
      const { error: eg } = await supabase.from("grados").insert(payload)
      if (eg) console.error("Error insertando grado:", eg.message, payload)
    }

    for (const curso of festival.cursos || []) {
      const payload = await buildCursoPayload(curso, data.id)
      const { error: ec } = await supabase.from("cursos").insert(payload)
      if (ec) console.error("Error insertando curso:", ec.message, payload)
    }

    try {
      await sincronizarBloques(data.id, festival.cursos || [], festival.grados || [])
    } catch (err) {
      console.error("Error sincronizando bloques después de crear festival:", err)
    }

    await fetchFestivales()
  }

  const actualizarFestival = async (festival: Festival, guardarEnBD: boolean = true) => {
    if (!guardarEnBD) {
      setFestivales(prev => prev.map(f => f.id === festival.id ? festival : f))
      return
    }

    const tipoId = await getTipoId(festival.tipo)
    if (!tipoId) {
      console.error("Tipo de festival no encontrado:", festival.tipo)
      return
    }

    const { error: errorFestival } = await supabase.from("festivales").update({
      nombre: festival.nombre,
      tipo_festival_id: tipoId,
      colegio: festival.colegio,
      sede: festival.sede,
      fecha: festival.fecha,
      encargado: festival.encargado,
      telefono: festival.telefono,
      descripcion: festival.descripcion,
      estado: festival.estado,
      estado_pago: festival.estado_pago || "pendiente",
      fecha_capacitacion: festival.fecha_capacitacion || null,
      encargado_capacitacion: festival.encargado_capacitacion || null,
      diplomas_entregados: festival.diplomas_entregados || false,
      pruebas_presentadas: festival.pruebas_presentadas || false,
      calificaciones_entregadas: festival.calificaciones_entregadas || false,
    }).eq("id", festival.id)

    if (errorFestival) {
      console.error("Error actualizando festival:", errorFestival)
      return
    }

    const { data: gradosExistentes } = await supabase.from("grados").select("id").eq("festival_id", festival.id)
    const idsFrontend = new Set(festival.grados.filter(g => !g.id.startsWith('g')).map(g => g.id))

    for (const g of (gradosExistentes || [])) {
      if (!idsFrontend.has(g.id)) {
        await supabase.from("grados").delete().eq("id", g.id)
      }
    }

    for (const grado of festival.grados) {
      const payload = await buildGradoPayload(grado, festival.id)
      
      if (grado.id.startsWith('g')) {
        const { error } = await supabase.from("grados").insert(payload)
        if (error) {
          console.error("Detalle del error en Supabase:", error.message, error.details, error.hint)
          console.error("Payload limpio enviado:", JSON.stringify(payload, null, 2))
        }
      } else {
        const { error } = await supabase.from("grados").update(payload).eq("id", grado.id)
        if (error) console.error("Error actualizando grado:", error.message, payload)
      }
    }

    for (const curso of festival.cursos) {
      const esNuevo = curso.id.startsWith('c')
      const payload = await buildCursoPayload(curso, festival.id)

      if (esNuevo) {
        const { error } = await supabase.from("cursos").insert(payload)
        if (error) console.error("Error insertando curso:", error.message, payload)
      } else {
        const { error } = await supabase.from("cursos").update(payload).eq("id", curso.id)
        if (error) console.error("Error actualizando curso:", error.message, payload)
      }
    }

    try {
      await sincronizarBloques(festival.id, festival.cursos, festival.grados)
    } catch (err) {
      console.error("Error sincronizando bloques después de actualizar festival:", err)
    }

    await fetchFestivales()
  }

  // --- NUEVA FUNCIÓN PARA GUARDAR BLOQUES, JUEGOS Y JEFES DESDE EL MODAL ---
  const guardarConfiguracionCompleta = async (
    festivalId: string,
    bloques: any[],
    juegos: any[],
    jefes: any[]
  ) => {
    setLoading(true)
    try {
      const { error: rpcError } = await supabase.rpc('guardar_configuracion_festival', {
        p_festival_id: festivalId,
        p_bloques: bloques,
        p_juegos: juegos,
        p_jefes: jefes
      })

      if (rpcError) throw rpcError

      await fetchFestivales() // Recargar datos locales actualizados
      return { success: true }
    } catch (err: any) {
      console.error("Error guardando bloques/configuración en Supabase:", err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const eliminarFestival = async (id: string) => {
    const { error } = await supabase.from("festivales").delete().eq("id", id)
    if (error) {
      console.error("Error eliminando festival:", error)
      return
    }

    await fetchFestivales()
  }

  return { 
    festivales, 
    loading, 
    agregarFestival, 
    actualizarFestival, 
    guardarConfiguracionCompleta,
    sincronizarBloques,
    actualizarBloque,
    guardarEncargadosJuegos,
    guardarJefesExploracion,
    refrescarFestival,
    eliminarFestival, 
    fetchFestivales 
  }
}