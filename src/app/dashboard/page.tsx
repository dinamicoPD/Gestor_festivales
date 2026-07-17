"use client"

import { useState, useMemo } from "react"
import { Festival } from "@/types/festival"
import { useFestivales } from "@/hooks/useFestivales"
import Link from "next/link"

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export default function DashboardPage() {
  const { festivales, loading } = useFestivales()
  const [mesActual, setMesActual] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [diaSeleccionado, setDiaSeleccionado] = useState<{ year: number; month: number; day: number } | null>(null)

  const festivalesDelMes = useMemo(() => {
    return festivales.filter(f => {
      if (!f.fecha) return false
      const fecha = new Date(f.fecha + "T00:00:00")
      return fecha.getFullYear() === mesActual.year && fecha.getMonth() === mesActual.month
    })
  }, [festivales, mesActual])

  const festivalesPorDia = useMemo(() => {
    const mapa = new Map<number, Festival[]>()
    for (const f of festivalesDelMes) {
      if (!f.fecha) continue
      const dia = new Date(f.fecha + "T00:00:00").getDate()
      const lista = mapa.get(dia) || []
      lista.push(f)
      mapa.set(dia, lista)
    }
    return mapa
  }, [festivalesDelMes])

  const diasEnMes = new Date(mesActual.year, mesActual.month + 1, 0).getDate()
  const primerDiaSemana = new Date(mesActual.year, mesActual.month, 1).getDay()

  const mesAnterior = () => {
    setMesActual(prev => {
      let m = prev.month - 1
      let y = prev.year
      if (m < 0) { m = 11; y -= 1 }
      return { year: y, month: m }
    })
  }

  const mesSiguiente = () => {
    setMesActual(prev => {
      let m = prev.month + 1
      let y = prev.year
      if (m > 11) { m = 0; y += 1 }
      return { year: y, month: m }
    })
  }

  const irHoy = () => {
    const now = new Date()
    setMesActual({ year: now.getFullYear(), month: now.getMonth() })
    setDiaSeleccionado(null)
  }

  const festivalesDelDiaSeleccionado = useMemo(() => {
    if (!diaSeleccionado) return []
    const clave = `${diaSeleccionado.year}-${String(diaSeleccionado.month + 1).padStart(2, "0")}-${String(diaSeleccionado.day).padStart(2, "0")}`
    return festivales
      .filter(f => f.fecha === clave)
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
  }, [festivales, diaSeleccionado])

  const cerrarDia = () => setDiaSeleccionado(null)

  if (loading) {
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
            <Link href="/" className="text-blue-800 font-medium hover:text-blue-900">
              ← Festivales
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tipos-juegos" className="text-blue-800 font-medium hover:text-blue-900">
              Tipos y Juegos
            </Link>
            <Link href="/admin" className="text-blue-800 font-medium hover:text-blue-900">
              Gestión de Organizadores
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button onClick={mesAnterior} className="px-3 py-1 border rounded hover:bg-gray-50">
                ← Anterior
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {MESES[mesActual.month]} {mesActual.year}
              </h2>
              <button onClick={mesSiguiente} className="px-3 py-1 border rounded hover:bg-gray-50">
                Siguiente →
              </button>
              <button onClick={irHoy} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Hoy
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {festivalesDelMes.length} festival{festivalesDelMes.length !== 1 ? "es" : ""} este mes
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {DIAS_SEMANA.map(dia => (
              <div key={dia} className="bg-gray-100 p-2 text-center text-sm font-semibold text-gray-700">
                {dia}
              </div>
            ))}

            {Array.from({ length: primerDiaSemana }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50 p-2 min-h-[100px]" />
            ))}

            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = i + 1
              const festivalesDia = festivalesPorDia.get(dia) || []
              const esHoy = () => {
                const now = new Date()
                return dia === now.getDate() && mesActual.month === now.getMonth() && mesActual.year === now.getFullYear()
              }

              return (
                <button
                  key={dia}
                  onClick={() => setDiaSeleccionado({ year: mesActual.year, month: mesActual.month, day: dia })}
                  className={`bg-white p-2 min-h-[100px] text-left hover:bg-gray-50 transition-colors ${esHoy() ? "ring-2 ring-blue-500 ring-inset" : ""}`}
                >
                  <div className={`text-sm font-medium mb-1 ${esHoy() ? "text-blue-600" : "text-gray-700"}`}>
                    {dia}
                  </div>
                  <div className="space-y-1">
                    {festivalesDia.map(f => (
                      <div
                        key={f.id}
                        className="text-xs p-1 rounded bg-blue-50 text-blue-800 border border-blue-100 truncate"
                        title={`${f.nombre} - ${f.colegio}`}
                      >
                        {f.nombre}
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {diaSeleccionado && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    Festivales del {diaSeleccionado.day}/{diaSeleccionado.month + 1}/{diaSeleccionado.year}
                  </h3>
                  <button onClick={cerrarDia} className="text-gray-600 hover:text-gray-800 text-2xl">✕</button>
                </div>
                <div className="p-6">
                  {festivalesDelDiaSeleccionado.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No hay festivales programados para este día</p>
                  ) : (
                    <div className="grid gap-4">
                      {festivalesDelDiaSeleccionado.map(f => (
                        <div key={f.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{f.nombre}</h4>
                              <p className="text-sm text-gray-700">{f.colegio} · {f.sede}</p>
                              <p className="text-sm text-gray-700 mt-1">
                                Encargado: {f.encargado} · Tel: {f.telefono}
                              </p>
                              {f.descripcion && (
                                <p className="text-sm text-gray-600 mt-1">{f.descripcion}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                f.estado === "activo" ? "bg-green-100 text-green-800" :
                                f.estado === "borrador" ? "bg-gray-100 text-gray-800" :
                                f.estado === "completado" ? "bg-blue-100 text-blue-800" :
                                f.estado === "cancelado" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {f.estado}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                f.estado_pago === "pagado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {f.estado_pago}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            {f.fecha && new Date(f.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {festivalesDelMes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Festivales del mes</h3>
              <div className="grid gap-3">
                {festivalesDelMes
                  .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
                  .map(f => (
                    <div key={f.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                         <h4 className="font-semibold text-gray-900">{f.nombre}</h4>
                         <p className="text-sm text-gray-700">{f.colegio} · {f.sede}</p>
                         <p className="text-sm text-gray-700">
                          {f.fecha && new Date(f.fecha + "T00:00:00").toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          f.estado === "activo" ? "bg-green-100 text-green-800" :
                          f.estado === "borrador" ? "bg-gray-100 text-gray-800" :
                          f.estado === "completado" ? "bg-blue-100 text-blue-800" :
                          f.estado === "cancelado" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {f.estado}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          f.estado_pago === "pagado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {f.estado_pago}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {festivalesDelMes.length === 0 && (
            <div className="mt-6 text-center py-8 text-gray-700">
              No hay festivales programados para este mes
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
