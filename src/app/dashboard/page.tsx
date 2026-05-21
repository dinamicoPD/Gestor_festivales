'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Festival {
  id: string
  colegio: string
  ciudad: string
  fecha: string
}

const supabase = createClient()

export default function DashboardPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: festivalsData } = await supabase
        .from('festivals')
        .select('*')
        .order('fecha', { ascending: false })
      
      setFestivals(festivalsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestor de Festivales</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Festivales</h2>
          {festivals.length === 0 ? (
            <p className="text-gray-500">No hay festivales registrados</p>
          ) : (
            <div className="grid gap-4">
              {festivals.map(festival => (
                <div key={festival.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg">{festival.colegio}</h3>
                  <p className="text-gray-600">{festival.ciudad} - {festival.fecha}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}