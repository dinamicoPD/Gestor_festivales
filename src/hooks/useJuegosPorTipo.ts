import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

type JuegosPorTipo = Record<string, string[]>

export function useJuegosPorTipo(tipos: string[] = []) {
  const [juegosPorTipo, setJuegosPorTipo] = useState<JuegosPorTipo>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJuegos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipos])

  const fetchJuegos = async () => {
    setLoading(true)
    const { data } = await supabase.from("juegos").select(`
      nombre,
      tipo_festival_id
    `).order("nombre")
    
    // Obtener tipos por ID para mapear los IDs a nombres
    const { data: tiposData } = await supabase.from("tipos_festival").select("id, nombre")
    const idToNombre = new Map<string, string>()
    for (const t of (tiposData || [])) {
      idToNombre.set(t.id, t.nombre)
    }
    
    const grouped: JuegosPorTipo = {}
    for (const tipo of tipos) {
      grouped[tipo] = []
    }
    
    for (const juego of (data as any[]) || []) {
      const tipoNombre = idToNombre.get(juego.tipo_festival_id) || juego.tipo_festival_id
      if (!grouped[tipoNombre]) {
        grouped[tipoNombre] = []
      }
      grouped[tipoNombre].push(juego.nombre)
    }
    
    setJuegosPorTipo(grouped)
    setLoading(false)
  }

  const agregarJuego = async (tipo: string, nombre: string) => {
    const limpio = nombre.trim()
    if (!limpio) return
    
    const tipoId = await getTipoId(tipo)
    if (!tipoId) {
      console.error("Tipo no encontrado:", tipo)
      return
    }
    
    // Verificar si ya existe
    const { data: existe } = await supabase
      .from("juegos")
      .select("id")
      .eq("nombre", limpio)
      .eq("tipo_festival_id", tipoId)
      .single()
    
    if (existe) {
      console.log("El juego ya existe para este tipo")
      return
    }
    
    const { error } = await supabase.from("juegos").insert({
      nombre: limpio,
      tipo_festival_id: tipoId,
    })
    
    if (error) {
      console.error("Error agregando juego:", error.message || error.details || JSON.stringify(error))
    } else {
      await fetchJuegos()
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

  const eliminarJuego = async (tipo: string, nombre: string) => {
    const tipoId = await getTipoId(tipo)
    if (!tipoId) return
    
    await supabase.from("juegos").delete().eq("nombre", nombre).eq("tipo_festival_id", tipoId)
    await fetchJuegos()
  }

  return { juegosPorTipo, loading, agregarJuego, eliminarJuego, refetch: fetchJuegos }
}