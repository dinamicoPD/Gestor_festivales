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
  }

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
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Festivales
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tipos-juegos" className="text-blue-600 hover:text-blue-800">
              Tipos y Juegos
            </Link>
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
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
              <h2 className="text-xl font-semibold">
                {MESES[mesActual.month]} {mesActual.year}
              </h2>
              <button onClick={mesSiguiente} className="px-3 py-1 border rounded hover:bg-gray-50">
                Siguiente →
              </button>
              <button onClick={irHoy} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                Hoy
              </button>
            </div>
            <div className="text-sm text-gray-500">
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
                <div
                  key={dia}
                  className={`bg-white p-2 min-h-[100px] ${esHoy() ? "ring-2 ring-blue-500 ring-inset" : ""}`}
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
                </div>
              )
            })}
          </div>

          {festivalesDelMes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Festivales del mes</h3>
              <div className="grid gap-3">
                {festivalesDelMes
                  .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
                  .map(f => (
                    <div key={f.id} className="border rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{f.nombre}</h4>
                        <p className="text-sm text-gray-600">{f.colegio} · {f.sede}</p>
                        <p className="text-sm text-gray-500">
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
            <div className="mt-6 text-center py-8 text-gray-500">
              No hay festivales programados para este mes
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
