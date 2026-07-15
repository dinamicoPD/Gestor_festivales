import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useTiposFestival() {
  const [tipos, setTipos] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTipos()
  }, [])

  const fetchTipos = async () => {
    setLoading(true)
    const { data } = await supabase.from("tipos_festival").select("nombre").order("nombre")
    setTipos(data?.map((t: { nombre: string }) => t.nombre) || [])
    setLoading(false)
  }

  const agregarTipo = async (nombre: string) => {
    const limpio = nombre.trim()
    if (!limpio) return
    
    const { error } = await supabase.from("tipos_festival").insert({ nombre: limpio })
    if (error) {
      console.error("Error agregando tipo:", error)
    } else {
      await fetchTipos()
    }
  }

  const eliminarTipo = async (nombre: string) => {
    await supabase.from("tipos_festival").delete().eq("nombre", nombre)
    await fetchTipos()
  }

  return { tipos, loading, agregarTipo, eliminarTipo }
}