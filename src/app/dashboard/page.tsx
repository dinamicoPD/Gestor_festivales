'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Festival {
  id: string
  colegio: string
  ciudad: string
  fecha: string
  responsable: string
  telefono: string
  valor_esperado: number
  valor_real: number | null
  courses: Array<{ name: string; participants: number }>
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
  fecha: '',
  responsable: '',
  telefono: '',
  valor_esperado: '',
  courses: [{ name: '', participants: 0 }] // Start with one empty course
})
  const [valorRealInput, setValorRealInput] = useState<Record<string, string>>({})

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
           fecha: formData.fecha,
           responsable: formData.responsable,
           telefono: formData.telefono,
           valor_esperado: parseFloat(formData.valor_esperado) || 0,
           courses: formData.courses.filter(c => c.name.trim() !== '') // Filter out empty courses
         })
         .eq('id', editingFestival.id)
       
       if (!error) {
         setFestivals(festivals.map(f => 
           f.id === editingFestival.id 
             ? { 
                 ...f, 
                 colegio: formData.colegio,
                 ciudad: formData.ciudad,
                 fecha: formData.fecha,
                 responsable: formData.responsable,
                 telefono: formData.telefono,
                 valor_esperado: parseFloat(formData.valor_esperado) || 0,
                 courses: formData.courses.filter(c => c.name.trim() !== '')
               }
             : f
         ))
          setEditingFestival(null)
          setFormData({ 
            colegio: '', 
            ciudad: '', 
            fecha: '', 
            responsable: '', 
            telefono: '', 
            valor_esperado: '',
            courses: [{ name: '', participants: 0 }]
          })
         setShowForm(false)
       }
     } else {
       const { data, error } = await supabase
         .from('festivals')
         .insert([{
           colegio: formData.colegio,
           ciudad: formData.ciudad,
           fecha: formData.fecha,
           responsable: formData.responsable,
           telefono: formData.telefono,
           valor_esperado: parseFloat(formData.valor_esperado) || 0,
           valor_real: null,
           courses: formData.courses.filter(c => c.name.trim() !== '') // Filter out empty courses
         }])
         .select()
         .single()
       
        if (!error && data) {
          setFestivals([data, ...festivals])
          setFormData({ 
            colegio: '', 
            ciudad: '', 
            fecha: '', 
            responsable: '', 
            telefono: '', 
            valor_esperado: '',
            courses: [{ name: '', participants: 0 }]
          })
          setShowForm(false)
        }
     }
   }

   const handleEdit = (festival: Festival) => {
     setEditingFestival(festival)
     setFormData({
       colegio: festival.colegio,
       ciudad: festival.ciudad,
       fecha: festival.fecha,
       responsable: festival.responsable || '',
       telefono: festival.telefono || '',
       valor_esperado: festival.valor_esperado?.toString() || '',
       courses: festival.courses || [{ name: '', participants: 0 }]
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

  const handleUpdateValorReal = async (id: string, valor: string) => {
    const valorNum = parseFloat(valor)
    const { error } = await supabase
      .from('festivals')
      .update({ valor_real: valorNum })
      .eq('id', id)
    
    if (!error) {
      setFestivals(festivals.map(f => 
        f.id === id ? { ...f, valor_real: valorNum } : f
      ))
      setValorRealInput(prev => ({ ...prev, [id]: '' }))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
  }

   const handleCancel = () => {
     setShowForm(false)
     setEditingFestival(null)
     setFormData({ 
       colegio: '', 
       ciudad: '', 
       fecha: '', 
       responsable: '', 
       telefono: '', 
       valor_esperado: '',
       courses: [{ name: '', participants: 0 }]
     })
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
           <div className="flex gap-2">
             <button
               onClick={() => setShowForm(true)}
               className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
             >
               + Nuevo Festival
             </button>
             <button
               onClick={() => {
                 document.cookie = 'festival_auth_token=; path=/; max-age=0';
                 window.location.href = '/login';
               }}
               className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
             >
               Cerrar Sesión
             </button>
           </div>
         </div>
       </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingFestival ? 'Editar Festival' : 'Nuevo Festival'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="border px-4 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Responsable"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  className="border px-4 py-2 rounded"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<input
                   type="tel"
                   placeholder="Teléfono"
                   value={formData.telefono}
                   onChange={(e) => {
                     const formatted = formatPhone(e.target.value)
                     setFormData({ ...formData, telefono: formatted })
                   }}
                   className="border px-4 py-2 rounded"
                 />
                <input
                  type="number"
                  placeholder="Valor esperado"
                  value={formData.valor_esperado}
                  onChange={(e) => setFormData({ ...formData, valor_esperado: e.target.value })}
                  className="border px-4 py-2 rounded"
                  min="0"
                  step="1000"
                />
               </div>
               <div className="mb-4">
                 <h3 className="text-lg font-semibold mb-2">Cursos</h3>
                 <div className="space-y-3" id="courses-container">
                   {formData.courses.map((course, index) => (
                     <div key={index} className="flex gap-3">
                       <input
                         type="text"
                         placeholder="Nombre del curso"
                         value={course.name}
                         onChange={(e) => {
                           const newCourses = [...formData.courses];
                           newCourses[index] = { ...newCourses[index], name: e.target.value };
                           setFormData({ ...formData, courses: newCourses });
                         }}
                         className="flex-1 border px-4 py-2 rounded"
                       />
                       <input
                         type="number"
                         placeholder="Participantes"
                         value={course.participants}
                         onChange={(e) => {
                           const newCourses = [...formData.courses];
                           newCourses[index] = { ...newCourses[index], participants: parseInt(e.target.value) || 0 };
                           setFormData({ ...formData, courses: newCourses });
                         }}
                         className="w-24 border px-4 py-2 rounded"
                         min="0"
                       />
                       <button
                         type="button"
                         onClick={() => {
                           if (formData.courses.length > 1) {
                             const newCourses = [...formData.courses];
                             newCourses.splice(index, 1);
                             setFormData({ ...formData, courses: newCourses });
                           }
                         }}
                         className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                       >
                         Eliminar
                       </button>
                     </div>
                   ))}
                    <div className="flex mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, courses: [...formData.courses, { name: '', participants: 0 }] });
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        + Agregar Curso
                      </button>
                    </div>
                 </div>
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
                <div key={festival.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                    <p><span className="font-medium">Responsable:</span> {festival.responsable || 'N/A'}</p>
                    <p><span className="font-medium">Teléfono:</span> {formatPhone(festival.telefono || '') || 'N/A'}</p>
                    <p><span className="font-medium">Valor esperado:</span> {formatCurrency(festival.valor_esperado || 0)}</p>
                   </div>
                   <div className="border-t pt-2">
                     <div className="flex items-center gap-2">
                       <span className="font-medium text-sm">Valor real:</span>
                       {festival.valor_real !== null ? (
                         <span className="text-green-600 font-medium">{formatCurrency(festival.valor_real)}</span>
                       ) : (
                         <>
                           <input
                             type="number"
                             placeholder="Ingresar valor real"
                             value={valorRealInput[festival.id] || ''}
                             onChange={(e) => setValorRealInput(prev => ({ ...prev, [festival.id]: e.target.value }))}
                             className="border px-2 py-1 rounded text-sm w-32"
                             min="0"
                             step="1000"
                           />
                           <button
                             onClick={() => handleUpdateValorReal(festival.id, valorRealInput[festival.id] || '0')}
                             disabled={!valorRealInput[festival.id]}
                             className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                           >
                             Guardar
                           </button>
                         </>
                       )}
                     </div>
                   </div>
                   
                   {festival.courses && festival.courses.length > 0 && (
                     <div className="mt-4">
                       <h3 className="text-lg font-semibold mb-2">Cursos y Participantes:</h3>
                       <div className="space-y-2 text-sm">
                         {festival.courses.map((course, index) => (
                           <div key={index} className="bg-gray-50 p-3 rounded">
                             <span className="font-medium">{course.name}:</span> 
                             <span className="ml-2">{course.participants} participantes</span>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </div>
       </main>
     </div>
   )
 }