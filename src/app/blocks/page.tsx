'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Grade {
  id: string
  name: string
  participants: { id: string }[]
}

export default function BlocksPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadGrades()
  }, [])

  const loadGrades = async () => {
    const { data } = await supabase
      .from('grades')
      .select('*, participants(*)')
    
    setGrades(data?.map(g => ({ ...g, participants: g.participants || [] })) || [])
  }

  const calculateEquipos = (count: number) => Math.ceil(count / 3)

  const generateBlocks = () => {
    const selected = grades.filter(g => selectedGrades.includes(g.id))
    const allParticipants = selected.flatMap(g => 
      g.participants.map((p: any, i: number) => ({ 
        ...p, 
        gradeName: g.name,
        gradeId: g.id
      }))
    )

    const MAX_PER_BLOCK = 150
    const newBlocks = []
    let currentBlock: any = { numero: 1, participantes: 0, grados: [] }

    for (const grade of selected) {
      const gradeParticipants = grade.participants.length
      let remaining = gradeParticipants

      while (remaining > 0) {
        const space = MAX_PER_BLOCK - currentBlock.participantes

        if (space <= 0 && currentBlock.grados.length > 0) {
          newBlocks.push({ ...currentBlock })
          currentBlock = { numero: newBlocks.length + 1, participantes: 0, grados: [] }
          continue
        }

        const assign = Math.min(remaining, space)
        const existing = currentBlock.grados.find((g: any) => g.nombre === grade.name)
        
        if (existing) {
          existing.participantes += assign
          existing.equipos = calculateEquipos(existing.participantes)
        } else {
          currentBlock.grados.push({
            nombre: grade.name,
            participantes: assign,
            equipos: calculateEquipos(assign)
          })
        }

        currentBlock.participantes += assign
        remaining -= assign
      }
    }

    if (currentBlock.grados.length > 0) {
      newBlocks.push(currentBlock)
    }

    setBlocks(newBlocks)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Calculadora de Bloques</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Select Grades */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Seleccionar Grados</h2>
          <div className="grid grid-cols-4 gap-2">
            {grades.map(grade => (
              <label key={grade.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedGrades.includes(grade.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGrades([...selectedGrades, grade.id])
                    } else {
                      setSelectedGrades(selectedGrades.filter(id => id !== grade.id))
                    }
                  }}
                />
                {grade.name} ({grade.participants.length})
              </label>
            ))}
          </div>
          <button onClick={generateBlocks} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
            Generar Bloques
          </button>
        </div>

        {/* Blocks Display */}
        {blocks.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Bloques Generados</h2>
            {blocks.map(block => (
              <div key={block.numero} className="border rounded-lg p-4 mb-4">
                <h3 className="font-bold">Bloque {block.numero}</h3>
                <p>Participantes: {block.participantes} / 150</p>
                <div className="mt-2">
                  {block.grados.map((g: any) => (
                    <div key={g.nombre}>
                      {g.nombre}: {g.participantes} ({g.equipos} equipos)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
