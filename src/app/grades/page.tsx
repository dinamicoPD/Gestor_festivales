'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

interface Grade {
  id: string
  name: string
  studentCount: number
  participants: Participant[]
}

interface Participant {
  id: string
  name: string
  documentId: string
  team: number
}

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [newGradeName, setNewGradeName] = useState('')
  const [newGradeStudents, setNewGradeStudents] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadGrades()
  }, [])

  const loadGrades = async () => {
    const { data } = await supabase
      .from('grades')
      .select('*, participants(*)')
      .order('name')
    
    if (data) {
      const formatted = data.map(g => ({
        id: g.id,
        name: g.name,
        studentCount: g.student_count,
        participants: g.participants || []
      }))
      setGrades(formatted)
    }
  }

  const calculateTeams = (studentCount: number) => {
    if (!studentCount || studentCount <= 0) return { teamsOf3: 0, teamsOf2: 0, totalTeams: 0 }
    const teamsOf3 = Math.floor(studentCount / 3)
    const remainder = studentCount % 3
    return {
      teamsOf3,
      teamsOf2: remainder > 0 ? 1 : 0,
      totalTeams: teamsOf3 + (remainder > 0 ? 1 : 0)
    }
  }

  const addGrade = async () => {
    if (!newGradeName || !newGradeStudents) return
    
    const { data, error } = await supabase
      .from('grades')
      .insert([{
        name: newGradeName,
        student_count: parseInt(newGradeStudents)
      }])
      .select()
      .single()
    
    if (!error && data) {
      setGrades([...grades, {
        id: data.id,
        name: data.name,
        studentCount: data.student_count,
        participants: []
      }])
      setNewGradeName('')
      setNewGradeStudents('')
    }
  }

  const handleExcelImport = async () => {
    if (!selectedFile) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]
        if (row[0] && row[1]) {
          supabase.from('grades').upsert({
            name: row[0],
            student_count: parseInt(row[1])
          })
        }
      }
      loadGrades()
    }
    reader.readAsArrayBuffer(selectedFile)
  }

  const totals = grades.reduce((acc, g) => {
    const breakdown = calculateTeams(g.studentCount)
    return {
      students: acc.students + g.studentCount,
      teams3: acc.teams3 + breakdown.teamsOf3,
      teams2: acc.teams2 + breakdown.teamsOf2,
      teams: acc.teams + breakdown.totalTeams,
      participants: acc.participants + (g.participants?.length || 0)
    }
  }, { students: 0, teams3: 0, teams2: 0, teams: 0, participants: 0 })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Grados</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Grade Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Agregar Grado</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Grado (ej: TR01, 101)"
              value={newGradeName}
              onChange={(e) => setNewGradeName(e.target.value)}
              className="border px-4 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Estudiantes"
              value={newGradeStudents}
              onChange={(e) => setNewGradeStudents(e.target.value)}
              className="border px-4 py-2 rounded"
            />
            <button onClick={addGrade} className="bg-blue-600 text-white px-6 py-2 rounded">
              Agregar
            </button>
          </div>
        </div>

        {/* Import Excel */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Importar desde Excel</h2>
          <div className="flex gap-4">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="border px-4 py-2 rounded"
            />
            <button onClick={handleExcelImport} className="bg-green-600 text-white px-6 py-2 rounded">
              Importar
            </button>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">GRADO</th>
                <th className="px-4 py-2 text-left">ESTUDIANTES</th>
                <th className="px-4 py-2 text-left">GRUPOS DE 3</th>
                <th className="px-4 py-2 text-left">GRUPOS DE 2</th>
                <th className="px-4 py-2 text-left">TOTAL EQUIPOS</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(grade => {
                const breakdown = calculateTeams(grade.studentCount)
                return (
                  <tr key={grade.id} className="border-t">
                    <td className="px-4 py-2 font-bold">{grade.name}</td>
                    <td className="px-4 py-2">{grade.studentCount}</td>
                    <td className="px-4 py-2">{breakdown.teamsOf3}</td>
                    <td className="px-4 py-2">{breakdown.teamsOf2}</td>
                    <td className="px-4 py-2 font-bold">{breakdown.totalTeams}</td>
                  </tr>
                )
              })}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={6} className="px-4 py-2">TOTALES</td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-4 py-2">{totals.students}</td>
                <td className="px-4 py-2">{totals.teams3}</td>
                <td className="px-4 py-2">{totals.teams2}</td>
                <td className="px-4 py-2">{totals.teams}</td>
                <td className="px-4 py-2">{totals.participants}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
