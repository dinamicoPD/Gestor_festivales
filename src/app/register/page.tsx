"use client"

import { useState } from "react"
import Link from "next/link"
import { useUsuarios } from "@/hooks/useUsuarios"

export default function RegisterPage() {
  const { agregarUsuario } = useUsuarios()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nombre_completo: "",
    email: "",
    telefono: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError("Todos los campos son obligatorios")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    await agregarUsuario(formData)
    setSuccess(true)
    setFormData({ username: "", password: "", confirmPassword: "", nombre_completo: "", email: "", telefono: "" })
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Registro Exitoso</h2>
          <p className="text-gray-600 mb-4">El organizador ha sido creado correctamente.</p>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro de Organizador</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Usuario *"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        />
        <input
          type="password"
          placeholder="Contraseña *"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        />
        <input
          type="password"
          placeholder="Confirmar Contraseña *"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        />
        <input
          type="text"
          placeholder="Nombre completo"
          value={formData.nombre_completo}
          onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
        />
        <button type="submit" disabled={loading} className="w-full px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <p className="text-xs text-gray-500 mt-4 text-center">
          <Link href="/" className="text-blue-600 hover:underline">¿Ya tienes cuenta? Vuelve al inicio</Link>
        </p>
      </form>
    </div>
  )
}