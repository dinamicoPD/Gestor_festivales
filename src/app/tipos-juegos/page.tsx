"use client"

import { useState, useEffect } from "react"
import { useTiposFestival } from "@/hooks/useTiposFestival"
import { useJuegosPorTipo } from "@/hooks/useJuegosPorTipo"
import Link from "next/link"

export default function TiposJuegosPage() {
  const { tipos, loading: loadingTipos, agregarTipo, eliminarTipo } = useTiposFestival()
  const { juegosPorTipo, loading: loadingJuegos, agregarJuego, eliminarJuego } = useJuegosPorTipo(tipos)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("")
  const [nuevoTipo, setNuevoTipo] = useState("")
  const [nuevoJuego, setNuevoJuego] = useState("")

  useEffect(() => {
    if (tipos.length > 0 && !tipoSeleccionado) {
      setTipoSeleccionado(tipos[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipos])

  const handleAgregarTipo = async () => {
    if (!nuevoTipo.trim()) return
    await agregarTipo(nuevoTipo)
    setNuevoTipo("")
  }

  const handleAgregarJuego = async () => {
    if (!nuevoJuego.trim() || !tipoSeleccionado) return
    await agregarJuego(tipoSeleccionado, nuevoJuego)
    setNuevoJuego("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
              Dashboard
            </Link>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Festivales
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Tipos y Juegos</h1>
          </div>
          <div>
            <Link href="/admin" className="px-3 py-1 bg-blue-600 text-white rounded">
              Gestión de Organizadores
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tipos de Festival</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nuevo tipo..."
              value={nuevoTipo}
              onChange={(e) => setNuevoTipo(e.target.value)}
              className="px-3 py-2 border rounded-lg flex-1"
            />
            <button onClick={handleAgregarTipo} className="px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap">
              + Agregar Tipo
            </button>
          </div>
          {loadingTipos ? (
            <p className="text-sm text-gray-600">Cargando tipos...</p>
          ) : tipos.length === 0 ? (
            <p className="text-sm text-gray-600">No hay tipos registrados</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6">
              {tipos.map((tipo) => (
                <span key={tipo} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-sm">
                  {tipo}
                  <button onClick={async () => { await eliminarTipo(tipo) }} className="text-red-800 font-medium hover:text-red-900">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Juegos por Tipo de Festival</h2>
          <div className="flex gap-2 mb-4 items-center">
            <select
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Selecciona un tipo</option>
              {tipos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nuevo juego..."
              value={nuevoJuego}
              onChange={(e) => setNuevoJuego(e.target.value)}
              className="px-3 py-2 border rounded-lg flex-1"
            />
            <button onClick={handleAgregarJuego} className="px-4 py-2 bg-green-600 text-white rounded-lg whitespace-nowrap">
              + Agregar Juego
            </button>
          </div>
          {loadingJuegos ? (
            <p className="text-sm text-gray-600">Cargando juegos...</p>
          ) : tipos.length === 0 ? (
            <p className="text-sm text-gray-600">Agrega tipos de festival primero</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tipos.map((tipo) => {
                const lista = juegosPorTipo[tipo] ?? []
                return (
                  <div key={tipo} className="border rounded-lg p-3">
                    <h4 className="font-semibold mb-2">{tipo}</h4>
                    {lista.length === 0 ? (
                      <p className="text-xs text-gray-700">Sin juegos</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {lista.map((juego) => (
                          <span key={juego} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                            {juego}
                            <button onClick={async () => { await eliminarJuego(tipo, juego) }} className="text-red-800 font-medium hover:text-red-900">✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}