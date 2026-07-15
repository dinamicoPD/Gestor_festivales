"use client"

import { useState } from "react"
import { Festival } from "@/types/festival"
import { GestionModal } from "@/components/GestionModal"
import { CrearFestivalForm } from "@/components/CrearFestivalForm"
import { generarBloques } from "@/utils/festival"
import { useFestivales } from "@/hooks/useFestivales"
import { useTiposFestival } from "@/hooks/useTiposFestival"
import { useJuegosPorTipo } from "@/hooks/useJuegosPorTipo"
import Link from "next/link"

export default function Home() {
  const { festivales, loading, agregarFestival, actualizarFestival, eliminarFestival: eliminarFestivalDB, sincronizarBloques, actualizarBloque, refrescarFestival, guardarEncargadosJuegos, guardarJefesExploracion } = useFestivales()
  const { tipos, loading: loadingTipos } = useTiposFestival()
  const { juegosPorTipo, loading: loadingJuegos } = useJuegosPorTipo(tipos)
  const [festivalActivo, setFestivalActivo] = useState<Festival | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [festivalEditar, setFestivalEditar] = useState<Festival | null>(null)

  const abrirGestionGrados = async (festival: Festival) => {
    const actualizado = await refrescarFestival(festival.id)
    if (actualizado) {
      setFestivalActivo(actualizado)
    } else {
      setFestivalActivo(festival)
    }
  }

  const cerrarGestionGrados = () => {
    setFestivalActivo(null)
  }

  const abrirEditarFestival = (festival: Festival) => {
    setFestivalEditar(festival)
    setModalEditarAbierto(true)
  }

  const guardarEdicion = async (festivalActualizado: Festival) => {
    await actualizarFestival(festivalActualizado)
    setModalEditarAbierto(false)
    setFestivalEditar(null)
    if (festivalActivo?.id === festivalActualizado.id) setFestivalActivo(festivalActualizado)
  }

  const eliminarFestival = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este festival?")) {
      await eliminarFestivalDB(id)
      if (festivalActivo?.id === id) setFestivalActivo(null)
    }
  }

  const festivalesFiltrados = festivales.filter(f =>
    f.nombre.toLowerCase().includes(busqueda.toLowerCase()) || f.colegio.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activo": return "bg-green-100 text-green-800"
      case "borrador": return "bg-gray-100 text-gray-800"
      case "completado": return "bg-blue-100 text-blue-800"
      case "cancelado": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || loadingTipos || loadingJuegos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/tipos-juegos" className="text-blue-600 hover:text-blue-800">
              Tipos y Juegos
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Festivales</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin" className="text-blue-600 hover:text-blue-800">Gestión de Organizadores</a>
            <a href="/register" className="text-blue-600 hover:text-blue-800">Registrar Organizador</a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Buscar festival..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full sm:w-64"
          />
          <button
            onClick={() => setModalCrearAbierto(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap"
          >
            + Nuevo Festival
          </button>
        </div>
        {festivalesFiltrados.length === 0 ? (
          <div className="text-center py-12">No se encontraron festivales</div>
        ) : (
          <div className="grid gap-4">
            {festivalesFiltrados.map((festival) => {
              const totalParticipantes = festival.grados.reduce((s, g) => s + g.participantes, 0)
              const totalBloques = generarBloques(totalParticipantes).length
              return (
                <div key={festival.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{festival.nombre}</h3>
                      <p className="text-gray-600">{festival.colegio}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        {festival.grados.length} grados · {totalParticipantes} participantes · {totalBloques} bloques
                      </div>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getEstadoColor(festival.estado)}`}>
                        {festival.estado}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditarFestival(festival)} className="px-3 py-1 bg-yellow-100 rounded">
                        Editar
                      </button>
                      <button onClick={() => abrirGestionGrados(festival)} className="px-3 py-1 bg-purple-100 rounded">
                        Gestionar
                      </button>
                      <button onClick={() => eliminarFestival(festival.id)} className="px-3 py-1 bg-red-100 rounded text-red-700">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {festivalActivo && (
        <GestionModal
          festival={festivalActivo}
          onClose={cerrarGestionGrados}
          onUpdate={async (updated) => {
            await actualizarFestival(updated)
            setFestivalActivo(updated)
          }}
          juegosPorTipo={juegosPorTipo}
          sincronizarBloques={sincronizarBloques}
          actualizarBloque={actualizarBloque}
          refrescarFestival={refrescarFestival}
          guardarEncargadosJuegos={guardarEncargadosJuegos}
          guardarJefesExploracion={guardarJefesExploracion}
        />
      )}

      {modalCrearAbierto && (
        <CrearFestivalForm
          onClose={() => setModalCrearAbierto(false)}
          onSave={async (festival) => {
            await agregarFestival(festival)
            setModalCrearAbierto(false)
          }}
          tipos={tipos}
        />
      )}

      {modalEditarAbierto && festivalEditar && (
        <CrearFestivalForm
          festival={festivalEditar}
          onClose={() => { setModalEditarAbierto(false); setFestivalEditar(null); }}
          onSave={guardarEdicion}
          tipos={tipos}
        />
      )}
    </div>
  )
}