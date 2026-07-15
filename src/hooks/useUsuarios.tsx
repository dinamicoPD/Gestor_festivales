import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

type Usuario = {
  id: string
  username: string
  nombre_completo?: string
  email?: string
  telefono?: string
  es_admin: boolean
  activo: boolean
}

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const fetchUsuarios = async () => {
    setLoading(true)
    const { data } = await supabase.from("usuarios").select("*").eq("es_admin", false).eq("activo", true)
    setUsuarios(data || [])
    setLoading(false)
  }

  const agregarUsuario = async (nuevo: { username: string; password: string; nombre_completo?: string; email?: string; telefono?: string }) => {
    const { data } = await supabase.from("usuarios").insert({
      username: nuevo.username,
      password: nuevo.password,
      nombre_completo: nuevo.nombre_completo,
      email: nuevo.email,
      telefono: nuevo.telefono,
      es_admin: false,
      activo: true
    } as any)

    if (data) {
      await fetchUsuarios()
    }
  }

  const eliminarUsuario = async (id: string) => {
    await supabase.from("usuarios").delete().eq("id", id)
    await fetchUsuarios()
  }

  const toggleActivo = async (id: string) => {
    const usuario = usuarios.find(u => u.id === id)
    if (usuario) {
      await supabase.from("usuarios").update({ activo: !usuario.activo }).eq("id", id)
      await fetchUsuarios()
    }
  }

  return { usuarios, loading, agregarUsuario, eliminarUsuario, toggleActivo }
}