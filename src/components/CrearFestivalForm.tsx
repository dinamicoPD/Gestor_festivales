"use client"

import { useState } from "react"
import { Festival } from "@/types/festival"

interface CrearFestivalFormProps {
  onClose: () => void
  onSave: (festival: Festival) => void
  festival?: Festival | null
  tipos?: string[]
}

export function CrearFestivalForm({ onClose, onSave, festival, tipos = [] }: CrearFestivalFormProps) {
  const [formulario, setFormulario] = useState({
    nombre: festival?.nombre ?? "",
    tipo: festival?.tipo ?? "",
    colegio: festival?.colegio ?? "",
    sede: festival?.sede ?? "",
    fecha: festival?.fecha ?? "",
    encargado: festival?.encargado ?? "",
    telefono: festival?.telefono ?? "",
    descripcion: festival?.descripcion ?? "",
    estado: (festival?.estado ?? "borrador") as Festival["estado"],
    estado_pago: (festival?.estado_pago ?? "pendiente") as Festival["estado_pago"],
    fecha_capacitacion: festival?.fecha_capacitacion ?? "",
    encargado_capacitacion: festival?.encargado_capacitacion ?? "",
  })
  const [errorTelefono, setErrorTelefono] = useState("")

  const normalizarTelefono = (value: string) => value.replace(/\D/g, "").slice(0, 10)

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = normalizarTelefono(e.target.value)
    setFormulario({ ...formulario, telefono: value })
    if (errorTelefono && /^\d{10}$/.test(value)) {
      setErrorTelefono("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formulario.nombre || !formulario.tipo || !formulario.colegio || !formulario.sede || !formulario.fecha || !formulario.encargado || !formulario.telefono) {
      alert("Completa todos los campos obligatorios.")
      return
    }
    if (!/^\d{10}$/.test(formulario.telefono)) {
      setErrorTelefono("El teléfono debe tener exactamente 10 dígitos numéricos.")
      return
    }
    setErrorTelefono("")
    onSave({
      id: festival?.id ?? `${Date.now()}`,
      ...formulario,
      grados: festival?.grados ?? [],
      cursos: festival?.cursos ?? [],
      bloques: festival?.bloques ?? [],
      encargadosJuegos: festival?.encargadosJuegos ?? {},
      jefesExploracion: festival?.jefesExploracion ?? {},
      fecha_capacitacion: formulario.fecha_capacitacion || null,
      encargado_capacitacion: formulario.encargado_capacitacion || null,
      estado_pago: formulario.estado_pago,
      diplomas_entregados: festival?.diplomas_entregados ?? false,
      pruebas_presentadas: festival?.pruebas_presentadas ?? false,
      calificaciones_entregadas: festival?.calificaciones_entregadas ?? false,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md">
         <h3 className="text-lg font-bold text-gray-900 mb-4">{festival ? "Editar Festival" : "Nuevo Festival"}</h3>
        <input
          type="text"
          placeholder="Nombre *"
          value={formulario.nombre}
          onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        />
        <select
          value={formulario.tipo}
          onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        >
          <option value="">Selecciona un tipo</option>
          {tipos.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Colegio *"
          value={formulario.colegio}
          onChange={(e) => setFormulario({ ...formulario, colegio: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        />
        <input
          type="text"
          placeholder="Sede *"
          value={formulario.sede}
          onChange={(e) => setFormulario({ ...formulario, sede: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        />
        <input
          type="date"
          value={formulario.fecha}
          onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="date"
            placeholder="Fecha de capacitación"
            value={formulario.fecha_capacitacion}
            onChange={(e) => setFormulario({ ...formulario, fecha_capacitacion: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Encargado de capacitación"
            value={formulario.encargado_capacitacion}
            onChange={(e) => setFormulario({ ...formulario, encargado_capacitacion: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <input
          type="text"
          placeholder="Encargado *"
          value={formulario.encargado}
          onChange={(e) => setFormulario({ ...formulario, encargado: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
          required
        />
        <input
          type="text"
          placeholder="Teléfono *"
          value={formulario.telefono}
          onChange={handleTelefonoChange}
          className="w-full px-3 py-2 border rounded mb-3"
          required
          maxLength={10}
          minLength={10}
        />
        <div className="flex justify-between items-center mb-3">
          {errorTelefono && <p className="text-red-500 text-xs">{errorTelefono}</p>}
          <p className="text-xs text-gray-700 ml-auto">{formulario.telefono.replace(/\D/g, "").length}/10 dígitos</p>
        </div>
        <textarea
          placeholder="Descripción"
          value={formulario.descripcion}
          onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
          className="w-full px-3 py-2 border rounded mb-3"
        />
        <select
          value={formulario.estado}
          onChange={(e) => setFormulario({ ...formulario, estado: e.target.value as Festival["estado"] })}
          className="w-full px-3 py-2 border rounded mb-3"
        >
          <option value="borrador">Borrador</option>
          <option value="activo">Activo</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <div className="border-t pt-3 mb-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Información financiera</h4>
          <select
            value={formulario.estado_pago}
            onChange={(e) => setFormulario({ ...formulario, estado_pago: e.target.value as Festival["estado_pago"] })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded text-gray-800 font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
            {festival ? "Guardar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  )
}
