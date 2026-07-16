"use client"

import { useState } from "react"
import Link from "next/link"
import { useUsuarios } from "@/hooks/useUsuarios"

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const { usuarios, loading, agregarUsuario, eliminarUsuario, toggleActivo } = useUsuarios()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: "",
    password: "",
    nombre_completo: "",
    email: "",
    telefono: ""
  })

  const handleCreateUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoUsuario.username || !nuevoUsuario.password) {
      alert("Usuario y contraseña son obligatorios")
      return
    }
    await agregarUsuario(nuevoUsuario)
    setNuevoUsuario({
      username: "",
      password: "",
      nombre_completo: "",
      email: "",
      telefono: ""
    })
    setShowCreateForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Organizadores</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Nuevo Organizador
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Usuario</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Teléfono</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center">Cargando...</td></tr>
              ) : usuarios.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-600">No hay organizadores registrados</td></tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-2">{u.username}</td>
                    <td className="px-4 py-2">{u.nombre_completo || "-"}</td>
                    <td className="px-4 py-2">{u.email || "-"}</td>
                    <td className="px-4 py-2">{u.telefono || "-"}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded ${u.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => toggleActivo(u.id)}
                        className="text-xs mr-2 text-blue-600 hover:underline"
                      >
                        {u.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar este organizador?")) {
                            eliminarUsuario(u.id)
                          }
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleCreateUsuario} className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Crear Nuevo Organizador</h2>
            <input
              type="text"
              placeholder="Usuario *"
              value={nuevoUsuario.username}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, username: e.target.value })}
              className="w-full px-3 py-2 border rounded mb-3"
              required
            />
            <input
              type="password"
              placeholder="Contraseña *"
              value={nuevoUsuario.password}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
              className="w-full px-3 py-2 border rounded mb-3"
              required
            />
            <input
              type="text"
              placeholder="Nombre completo"
              value={nuevoUsuario.nombre_completo}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre_completo: e.target.value })}
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <input
              type="email"
              placeholder="Email"
              value={nuevoUsuario.email}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={nuevoUsuario.telefono}
              onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })}
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1 border rounded"
              >
                Cancelar
              </button>
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
                Crear
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}