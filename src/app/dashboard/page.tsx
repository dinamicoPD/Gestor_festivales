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
  const [showForm, setShowForm] = useState(false)
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null)
  const [formData, setFormData] = useState({
    colegio: '',
    ciudad: '',
    fecha: ''
  })

  useEffect(() => {
    void (async () => {
      const { data: festivalsData } = await supabase
        .from('festivals')
        .select('*')
        .order('fecha', { ascending: false })
      
      setFestivals(festivalsData || [])
      setLoading(false)
    })()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingFestival) {
      const { error } = await supabase
        .from('festivals')
        .update({
          colegio: formData.colegio,
          ciudad: formData.ciudad,
          fecha: formData.fecha
        })
        .eq('id', editingFestival.id)
      
      if (!error) {
        setFestivals(festivals.map(f => 
          f.id === editingFestival.id 
            ? { ...f, colegio: formData.colegio, ciudad: formData.ciudad, fecha: formData.fecha }
            : f
        ))
        setEditingFestival(null)
        setFormData({ colegio: '', ciudad: '', fecha: '' })
        setShowForm(false)
      }
    } else {
      const { data, error } = await supabase
        .from('festivals')
        .insert([{
          colegio: formData.colegio,
          ciudad: formData.ciudad,
          fecha: formData.fecha
        }])
        .select()
        .single()
      
      if (!error && data) {
        setFestivals([data, ...festivals])
        setFormData({ colegio: '', ciudad: '', fecha: '' })
        setShowForm(false)
      }
    }
  }

  const handleEdit = (festival: Festival) => {
    setEditingFestival(festival)
    setFormData({
      colegio: festival.colegio,
      ciudad: festival.ciudad,
      fecha: festival.fecha
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este festival?')) {
      const { error } = await supabase
        .from('festivals')
        .delete()
        .eq('id', id)
      
      if (!error) {
        setFestivals(festivals.filter(f => f.id !== id))
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingFestival(null)
    setFormData({ colegio: '', ciudad: '', fecha: '' })
  }

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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Gestor de Festivales</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nuevo Festival
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingFestival ? 'Editar Festival' : 'Nuevo Festival'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Colegio"
                  value={formData.colegio}
                  onChange={(e) => setFormData({ ...formData, colegio: e.target.value })}
                  className="border px-4 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="border px-4 py-2 rounded"
                  required
                />
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="border px-4 py-2 rounded"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {editingFestival ? 'Guardar Cambios' : 'Crear Festival'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Festivales</h2>
          {festivals.length === 0 ? (
            <p className="text-gray-500">No hay festivales registrados</p>
          ) : (
            <div className="grid gap-4">
              {festivals.map(festival => (
                <div key={festival.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{festival.colegio}</h3>
                    <p className="text-gray-600">{festival.ciudad} - {festival.fecha}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(festival)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(festival.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}