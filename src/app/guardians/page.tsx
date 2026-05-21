'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function GuardiansPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [guardians, setGuardians] = useState<any[]>([])
  const [station, setStation] = useState('')
  const [game, setGame] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [location, setLocation] = useState('')
  const supabase = createClient()

  useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = async () => {
    const { data } = await supabase
      .from('blocks')
      .select('*, guardians(*), chiefs(*)')
    
    setBlocks(data || [])
  }

  const addGuardian = async () => {
    if (!selectedBlock || !station || !game || !guardianName || !location) return

    const { error } = await supabase
      .from('guardians')
      .insert([{
        block_id: selectedBlock,
        estacion: parseInt(station),
        juego: game,
        guardian: guardianName,
        ubicacion: location
      }])

    if (!error) {
      setStation('')
      setGame('')
      setGuardianName('')
      setLocation('')
      loadBlocks()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Guardianes de Estación</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Seleccionar Bloque</h2>
          <select 
            value={selectedBlock || ''} 
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="border px-4 py-2 rounded w-full mb-4"
          >
            <option value="">Selecciona un bloque</option>
            {blocks.map(block => (
              <option key={block.id} value={block.id}>
                Bloque {block.numero}
              </option>
            ))}
          </select>

          {selectedBlock && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="number"
                  placeholder="Estación (1-15)"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="border px-4 py-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Juego"
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="border px-4 py-2 rounded"
                />
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Nombre Guardian"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="border px-4 py-2 rounded w-full mb-2"
                />
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border px-4 py-2 rounded w-full"
                />
              </div>
              <button onClick={addGuardian} className="bg-green-600 text-white px-6 py-2 rounded">
                Agregar Guardián
              </button>
            </>
          )}
        </div>

        {/* Guardians List */}
        {selectedBlock && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Guardianes del Bloque</h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2">Estación</th>
                  <th className="px-4 py-2">Juego</th>
                  <th className="px-4 py-2">Guardian</th>
                  <th className="px-4 py-2">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {blocks.find(b => b.id === selectedBlock)?.guardians?.map((g: any) => (
                  <tr key={g.id} className="border-t">
                    <td className="px-4 py-2">{g.estacion}</td>
                    <td className="px-4 py-2">{g.juego}</td>
                    <td className="px-4 py-2">{g.guardian}</td>
                    <td className="px-4 py-2">{g.ubicacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
