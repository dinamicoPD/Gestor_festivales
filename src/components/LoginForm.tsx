"use client"

import { useAuth } from "@/hooks/useAuth"

export function LoginForm() {
  const { login } = useAuth()

  const handleSubmit = () => {
    login()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Acceso al Sistema</h2>
        <p className="text-gray-600 mb-4">El sistema está en modo acceso directo.</p>
        <button onClick={handleSubmit} className="w-full px-3 py-2 bg-blue-600 text-white rounded">
          Entrar
        </button>
        <p className="text-xs text-gray-400 mt-4">
          <a href="/admin" className="text-blue-600 hover:underline">Gestión de Organizadores</a>
        </p>
      </div>
    </div>
  )
}