"use client"

import { useState, useRef, useEffect, Fragment } from "react"
import { Festival, Grado, Curso } from "@/types/festival"
import { distribuirCursosEnBloques, distribuirGradosEnBloques, ordenarTipoGrado, calcularGrupos } from "@/utils/festival"
import { supabase } from "@/lib/supabase"

interface NivelBloque {
  nivel: string
  color: string
}

interface BloqueInfo {
  id: string
  niveles: NivelBloque[]
}

interface GestionModalProps {
  festival: Festival
  onClose: () => void
  onUpdate: (festival: Festival, guardarBD?: boolean) => void
  juegosPorTipo: Record<string, string[]>
  sincronizarBloques: (festivalId: string, cursos: Curso[], grados?: Grado[]) => Promise<Map<string, string>>
  actualizarBloque: (festivalId: string, bloqueId: string, niveles: { nivel: string; color: string }[]) => Promise<void>
  refrescarFestival: (festivalId: string) => Promise<Festival | null>
  guardarEncargadosJuegos: (festivalId: string, juegosEncargados: Record<string, Array<{ juego: string; encargado: string; grado: string; ubicacion: string }>>) => Promise<void>
  guardarJefesExploracion: (festivalId: string, jefesExploracion: Record<string, string[]>) => Promise<void>
}

const NIVELES = ["a", "b", "c", "d", "e", "f"]
const MAX_NIVELES = 2
const TIPOS_GRADO = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°", "TR"] as const
const JORNADAS = ["mañana", "tarde"] as const
const DEFAULT_COLOR = "#ffffff"

export function GestionModal({ festival, onClose, onUpdate, juegosPorTipo, sincronizarBloques, actualizarBloque, refrescarFestival, guardarEncargadosJuegos, guardarJefesExploracion }: GestionModalProps) {
  const [festivalActivo, setFestivalActivo] = useState<Festival>(festival)
  const [modalGradoAbierto, setModalGradoAbierto] = useState(false)
  const [gradoEditarId, setGradoEditarId] = useState<string | null>(null)
  const [gradoForm, setGradoForm] = useState({ nombre: "", tipo: "1°" as Grado["tipo"], jornada: "mañana" as Grado["jornada"], participantes: 0, archivo: null as string | null, nombreArchivo: "" })
  const [tabActiva, setTabActiva] = useState<"grados" | "bloques" | "encargados" | "adicionales">("grados")
  const inputDriveRef = useRef<HTMLInputElement>(null)

  const [editandoDriveId, setEditandoDriveId] = useState<string | null>(null)

  const [bloquesConfig, setBloquesConfig] = useState<BloqueInfo[]>([])
  const [bloquesMap, setBloquesMap] = useState<Map<string, string>>(new Map())
  const bloquesConfigRef = useRef(bloquesConfig)
  const [guardandoBloques, setGuardandoBloques] = useState(false)
  const [guardandoEncargados, setGuardandoEncargados] = useState(false)
  const [guardandoJefes, setGuardandoJefes] = useState(false)
  const [guardandoAdicionales, setGuardandoAdicionales] = useState(false)
  const [capacidadBloque, setCapacidadBloque] = useState(180)
  const [juegosEncargados, setJuegosEncargados] = useState<Record<string, Array<{ juego: string; encargado: string; grado: string; ubicacion: string }>>>({})
  const [jefesExploracion, setJefesExploracion] = useState<Record<string, string[]>>({})

  useEffect(() => {
    bloquesConfigRef.current = bloquesConfig
  }, [bloquesConfig])

  useEffect(() => {
    if (festivalActivo.bloques && festivalActivo.bloques.length > 0) {
      const bloquesIniciales: BloqueInfo[] = festivalActivo.bloques.map(b => ({
        id: `${b.jornada}-${b.numero}`,
        niveles: [
          { nivel: b.nivel1 || "", color: b.color1 || DEFAULT_COLOR },
          { nivel: b.nivel2 || "", color: b.color2 || DEFAULT_COLOR },
        ],
      }))
      setBloquesConfig(bloquesIniciales)
    } else {
      setBloquesConfig([])
    }
  }, [festivalActivo.id, festivalActivo.bloques])

  useEffect(() => {
    if (!festivalActivo.id) return

    const cargarEncargados = async () => {
      try {
        const { data: bloquesBD } = await supabase
          .from("bloques")
          .select("id, numero, jornada")
          .eq("festival_id", festivalActivo.id)

        const idsBloques = (bloquesBD || []).map(b => b.id)
        const { data: encargadosBD } = await supabase
          .from("encargados_juegos")
          .select("*")
          .in("bloque_id", idsBloques.length > 0 ? idsBloques : [""])

        if (encargadosBD && encargadosBD.length > 0) {
          const { data: juegosBD } = await supabase
            .from("juegos")
            .select("id, nombre")
            .in("id", encargadosBD.map(e => e.juego_id).filter((id): id is string => Boolean(id)))

          const juegosMap = new Map((juegosBD || []).map(j => [j.id, j.nombre]))
          const bloquesMap = new Map((bloquesBD || []).map(b => [`${b.jornada}-${b.numero}`, b.id]))

          const encargadosMap: Record<string, Array<{ juego: string; encargado: string; grado: string; ubicacion: string }>> = {}
          for (const enc of encargadosBD) {
            const bloque = bloquesBD?.find(b => b.id === enc.bloque_id)
            if (!bloque) continue
            const bloqueId = `${bloque.jornada}-${bloque.numero}`
            if (!encargadosMap[bloqueId]) {
              encargadosMap[bloqueId] = []
            }
            encargadosMap[bloqueId].push({
              juego: juegosMap.get(enc.juego_id) || "",
              encargado: enc.encargado,
              grado: enc.grado || "",
              ubicacion: enc.ubicacion || "",
            })
          }
          setJuegosEncargados(encargadosMap)
        }

        const { data: gradosBD } = await supabase
          .from("grados")
          .select("id, nombre, tipo, jornada")
          .eq("festival_id", festivalActivo.id)

        const idsGrados = (gradosBD || []).map(g => g.id)
        const { data: jefesBD } = await supabase
          .from("jefes_exploracion")
          .select("*")
          .in("grado_id", idsGrados.length > 0 ? idsGrados : [""])

        if (jefesBD && jefesBD.length > 0) {
          const jefesMap: Record<string, string[]> = {}
          for (const jefe of jefesBD) {
            jefesMap[jefe.grado_id] = [jefe.jefe1 || "", jefe.jefe2 || ""]
          }
          setJefesExploracion(jefesMap)
        }
      } catch (err) {
        console.error("Error cargando encargados:", err)
      }
    }

    cargarEncargados()
  }, [festivalActivo.id])

  useEffect(() => {
    if (!festivalActivo.id) return

    let cancelled = false
    const cargar = async () => {
      try {
        const actualizado = await refrescarFestival(festivalActivo.id)
        if (cancelled) return
        if (actualizado) {
          setFestivalActivo(actualizado)
          const cursos = actualizado.cursos || []
          const grados = actualizado.grados || []
          if (cursos.length > 0 || grados.length > 0) {
            try {
              const mapaBloques = await sincronizarBloques(actualizado.id, actualizado.cursos, actualizado.grados)
              if (!cancelled) {
                setBloquesMap(mapaBloques)
                const recargado = await refrescarFestival(festivalActivo.id)
                if (recargado) setFestivalActivo(recargado)
              }
            } catch (err) {
              console.error("Error sincronizando bloques al cargar festival:", err)
            }
          }
        }
      } catch (err) {
        console.error("Error cargando datos iniciales del festival:", err)
      }
    }

    cargar()
    return () => { cancelled = true }
  }, [festivalActivo.id, festivalActivo.cursos?.length, festivalActivo.cursos?.map(c => c.id).join(","), festivalActivo.grados?.length, festivalActivo.grados?.map(g => g.id).join(",")])

  useEffect(() => {
    bloquesConfigRef.current = bloquesConfig
  }, [bloquesConfig])

  const handleActualizarBloque = async () => {
    if (!festivalActivo.id) return
    setGuardandoBloques(true)
    try {
      for (const bloque of bloquesConfig) {
        const bloqueRealId = bloquesMap.get(bloque.id)
        if (!bloqueRealId) continue
        await actualizarBloque(festivalActivo.id, bloqueRealId, bloque.niveles)
      }
      const recargado = await refrescarFestival(festivalActivo.id)
      if (recargado) setFestivalActivo(recargado)
      alert("Bloque actualizado correctamente")
    } catch (err: any) {
      console.error("Error actualizando bloque:", err)
      alert("Error al actualizar bloque: " + (err.message || JSON.stringify(err)))
    } finally {
      setGuardandoBloques(false)
    }
  }

  const handleGuardarEncargados = async () => {
    if (!festivalActivo.id) return
    setGuardandoEncargados(true)
    try {
      await guardarEncargadosJuegos(festivalActivo.id, juegosEncargados)
      alert("Encargados guardados correctamente")
    } catch (err: any) {
      console.error("Error guardando encargados:", err)
      alert("Error al guardar encargados: " + (err.message || JSON.stringify(err)))
    } finally {
      setGuardandoEncargados(false)
    }
  }

  const handleGuardarJefes = async () => {
    if (!festivalActivo.id) return
    setGuardandoJefes(true)
    try {
      await guardarJefesExploracion(festivalActivo.id, jefesExploracion)
      alert("Jefes de exploración guardados correctamente")
    } catch (err: any) {
      console.error("Error guardando jefes:", err)
      alert("Error al guardar jefes: " + (err.message || JSON.stringify(err)))
    } finally {
      setGuardandoJefes(false)
    }
  }

  const handleGuardarAdicionales = async () => {
    if (!festivalActivo.id) return
    setGuardandoAdicionales(true)
    try {
      const { error } = await supabase.from("festivales").update({
        diplomas_entregados: festivalActivo.diplomas_entregados,
        pruebas_presentadas: festivalActivo.pruebas_presentadas,
        calificaciones_entregadas: festivalActivo.calificaciones_entregadas,
      }).eq("id", festivalActivo.id)

      if (error) throw error
      alert("Datos adicionales guardados correctamente")
    } catch (err: any) {
      console.error("Error guardando adicionales:", err)
      alert("Error al guardar datos adicionales: " + (err.message || JSON.stringify(err)))
    } finally {
      setGuardandoAdicionales(false)
    }
  }

  const updateFestival = async (next: Festival, guardarBD: boolean = true) => {
    setFestivalActivo(next)
    if (guardarBD) {
      await onUpdate(next, guardarBD)
      try {
        const { data: actualizado } = await supabase
          .from("festivales")
          .select(`
            *,
            grados (*),
            cursos (*),
            tipos_festival (nombre),
            bloques (*)
          `)
          .eq("id", next.id)
          .single()

        if (actualizado) {
          const adaptado: Festival = {
            id: actualizado.id,
            nombre: actualizado.nombre,
            tipo: actualizado.tipos_festival?.nombre || actualizado.tipo_festival_id,
            colegio: actualizado.colegio,
            sede: actualizado.sede,
            fecha: actualizado.fecha,
            encargado: actualizado.encargado,
            telefono: actualizado.telefono,
            descripcion: actualizado.descripcion,
            estado: actualizado.estado,
            estado_pago: actualizado.estado_pago,
            fecha_capacitacion: actualizado.fecha_capacitacion,
            encargado_capacitacion: actualizado.encargado_capacitacion,
            diplomas_entregados: actualizado.diplomas_entregados,
            pruebas_presentadas: actualizado.pruebas_presentadas,
            calificaciones_entregadas: actualizado.calificaciones_entregadas,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            grados: (actualizado.grados || []).map((g: any) => ({
              id: g.id,
              nombre: g.nombre,
              tipo: g.tipo,
              jornada: g.jornada,
              participantes: g.participantes || 0,
              archivo: g.archivo,
              nombreArchivo: g.nombre_archivo,
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cursos: (actualizado.cursos || []).map((c: any) => ({
              id: c.id,
              nombre: c.nombre,
              grado: c.grado,
              tipo: c.tipo,
              jornada: c.jornada,
              participantes: c.participantes || 0,
              archivo: c.archivo,
              nombreArchivo: c.nombre_archivo,
            })),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bloques: (actualizado.bloques || []).map((b: any) => ({
              id: b.id,
              numero: b.numero,
              jornada: b.jornada,
              total_participantes: b.total_participantes,
              nivel1: b.nivel1,
              color1: b.color1,
              nivel2: b.nivel2,
              color2: b.color2,
            })),
            encargadosJuegos: {},
            jefesExploracion: {},
          }
          setFestivalActivo(adaptado)
          try {
            await sincronizarBloques(adaptado.id, adaptado.cursos, adaptado.grados)
          } catch (err) {
            console.error("Error sincronizando bloques:", err)
          }
        }
      } catch (err) {
        console.error("Error guardando bloques:", err)
      }
    } else {
      onUpdate(next, guardarBD)
    }
  }

  const abrirDrive = (grado: Grado) => {
    if (!grado.archivo) return
    window.open(grado.archivo, "_blank")
  }

  const eliminarLinkDrive = async (gradoId: string) => {
    updateFestival({
      ...festivalActivo,
      grados: festivalActivo.grados.map(g => g.id === gradoId ? { ...g, archivo: null, nombreArchivo: "" } : g),
    }, false)
  }

  const guardarDriveLink = (gradoId: string) => {
    const link = inputDriveRef.current?.value?.trim()
    if (!link) return
    updateFestival({
      ...festivalActivo,
      grados: festivalActivo.grados.map(g => g.id === gradoId ? { ...g, archivo: link, nombreArchivo: link.split("/").pop() || "drive" } : g),
    }, false)
    setEditandoDriveId(null)
    if (inputDriveRef.current) inputDriveRef.current.value = ""
  }

  const abrirModalGrado = (grado?: Grado) => {
    if (grado) {
      setGradoEditarId(grado.id)
      setGradoForm({ nombre: grado.nombre, tipo: grado.tipo, jornada: grado.jornada, participantes: grado.participantes, archivo: grado.archivo, nombreArchivo: grado.nombreArchivo })
    } else {
      setGradoEditarId(null)
      setGradoForm({ nombre: "", tipo: "1°", jornada: "mañana", participantes: 0, archivo: null, nombreArchivo: "" })
    }
    setModalGradoAbierto(true)
  }

  const guardarGrado = () => {
    if (!gradoForm.nombre.trim()) {
      alert("El nombre del grado es requerido")
      return
    }
    const gradosActualizados = festivalActivo.grados.map(g => {
      if (g.id === gradoEditarId) {
        return { ...g, ...gradoForm }
      }
      return g
    })
    if (gradoEditarId) {
      updateFestival({
        ...festivalActivo,
        grados: gradosActualizados,
      }, false)
    } else {
      const nuevoGrado = { id: `g${Date.now()}`, ...gradoForm }
      updateFestival({
        ...festivalActivo,
        grados: [...festivalActivo.grados, nuevoGrado],
      }, false)
    }
    setModalGradoAbierto(false)
  }

  const eliminarGrado = (gradoId: string) => {
    updateFestival({ ...festivalActivo, grados: festivalActivo.grados.filter(g => g.id !== gradoId) })
  }

  const totalParticipantes = festivalActivo.cursos.reduce((s, c) => s + c.participantes, 0)
  const cursosMañana = festivalActivo.cursos.filter(c => c.jornada === "mañana")
  const cursosTarde = festivalActivo.cursos.filter(c => c.jornada === "tarde")
  const bloquesMañana = cursosMañana.length > 0 ? distribuirCursosEnBloques(cursosMañana, capacidadBloque) : distribuirGradosEnBloques(festivalActivo.grados.filter(g => g.jornada === "mañana"), capacidadBloque)
  const bloquesTarde = cursosTarde.length > 0 ? distribuirCursosEnBloques(cursosTarde, capacidadBloque) : distribuirGradosEnBloques(festivalActivo.grados.filter(g => g.jornada === "tarde"), capacidadBloque)
  const cantidadBloques = bloquesMañana.length + bloquesTarde.length

  console.log("GestionModal - festival:", festivalActivo.id, "cursos:", festivalActivo.cursos.length, "grados:", festivalActivo.grados.length, "bloques mañana:", bloquesMañana.length, "bloques tarde:", bloquesTarde.length)

  const actualizarNivelBloque = (bloqueId: string, index: number, cambios: Partial<NivelBloque>) => {
    setBloquesConfig(prev => {
      const existe = prev.find(b => b.id === bloqueId)
      if (existe) {
        const nuevosNiveles = [...existe.niveles]
        nuevosNiveles[index] = { ...nuevosNiveles[index], ...cambios }
        return prev.map(b => b.id === bloqueId ? { ...b, niveles: nuevosNiveles } : b)
      }
      const nuevoBloque: BloqueInfo = {
        id: bloqueId,
        niveles: Array.from({ length: MAX_NIVELES }, (_, i) => ({
          nivel: i === index ? cambios.nivel ?? "" : "",
          color: i === index ? cambios.color ?? DEFAULT_COLOR : DEFAULT_COLOR,
        })),
      }
      return [...prev, nuevoBloque]
    })
  }

  const actualizarJuegoEncargado = (bloqueId: string, idx: number, campo: "juego" | "encargado" | "grado" | "ubicacion", valor: string) => {
    setJuegosEncargados(prev => {
      const filas = prev[bloqueId] ?? [createEmptyRow()]
      const nuevas = [...filas]
      nuevas[idx] = { ...nuevas[idx], [campo]: valor }
      return { ...prev, [bloqueId]: nuevas }
    })
  }

  const createEmptyRow = () => ({ juego: "", encargado: "", grado: "", ubicacion: "" })

  const agregarFilaEncargado = (bloqueId: string) => {
    setJuegosEncargados(prev => {
      const filas = prev[bloqueId] ?? [createEmptyRow()]
      return { ...prev, [bloqueId]: [...filas, createEmptyRow()] }
    })
  }

  const eliminarFilaEncargado = (bloqueId: string, idx: number) => {
    setJuegosEncargados(prev => {
      const filas = prev[bloqueId] ?? [createEmptyRow()]
      const nuevas = filas.filter((_, i) => i !== idx)
      return { ...prev, [bloqueId]: nuevas.length > 0 ? nuevas : [createEmptyRow()] }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestionar: {festivalActivo.nombre}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✕</button>
        </div>
        <div className="border-b">
          <button
            onClick={() => setTabActiva("grados")}
            className={`px-4 py-2 ${tabActiva === "grados" ? "border-b-2 border-purple-600" : ""}`}
          >
            Grados
          </button>
          <button
            onClick={() => setTabActiva("bloques")}
            className={`px-4 py-2 ${tabActiva === "bloques" ? "border-b-2 border-purple-600" : ""}`}
          >
            Bloques
          </button>
          <button
            onClick={() => setTabActiva("encargados")}
            className={`px-4 py-2 ${tabActiva === "encargados" ? "border-b-2 border-purple-600" : ""}`}
          >
            Encargados
          </button>
          <button
            onClick={() => setTabActiva("adicionales")}
            className={`px-4 py-2 ${tabActiva === "adicionales" ? "border-b-2 border-purple-600" : ""}`}
          >
            Adicionales
          </button>
        </div>
        <div className="p-6">
          {tabActiva === "grados" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Grados</h3>
              <button onClick={() => abrirModalGrado()} className="mb-4 px-3 py-1 bg-blue-600 text-white rounded">
                + Agregar Grado
              </button>
              <div className="grid gap-3">
                {[...festivalActivo.grados].sort((a, b) => ordenarTipoGrado(a.tipo) - ordenarTipoGrado(b.tipo)).map(grado => {
                  const grupos = calcularGrupos(grado.participantes)
                  return (
                    <div key={grado.id} className="border rounded p-3 flex justify-between items-center">
                      <div>
                        <strong>{grado.nombre}</strong>
                        <span className="text-gray-700 ml-2">({grado.tipo}) · {grado.jornada} · {grado.participantes} participantes</span>
                        <span className="text-gray-700 ml-2">· Grupos: {grupos.grupos3} de 3, {grupos.grupos2} de 2</span>
                      </div>
                      <div className="flex gap-2">
                         {grado.archivo && (
                           <>
                             <button onClick={() => abrirDrive(grado)} className="text-green-800 font-medium">Abrir archivo</button>
                             <button onClick={() => eliminarLinkDrive(grado.id)} className="text-red-800 font-medium">Eliminar</button>
                           </>
                         )}
                         <button onClick={() => { setEditandoDriveId(grado.id); if (inputDriveRef.current) inputDriveRef.current.focus() }} className="text-blue-800 font-medium">Link Drive</button>
                         <button onClick={() => abrirModalGrado(grado)} className="text-blue-800 font-medium">Editar</button>
                         <button onClick={() => eliminarGrado(grado.id)} className="text-red-800 font-medium">Eliminar</button>
                      </div>

                      {editandoDriveId === grado.id && (
                        <div className="flex gap-1 mt-1">
                          <input
                            ref={inputDriveRef}
                            type="text"
                            placeholder="Pegar link de Google Drive"
                            className="px-2 py-1 border rounded text-xs flex-1"
                            onKeyDown={(e) => { if (e.key === "Enter") guardarDriveLink(grado.id) }}
                          />
                          <button onClick={() => guardarDriveLink(grado.id)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Guardar</button>
                          <button onClick={() => { setEditandoDriveId(null); if (inputDriveRef.current) inputDriveRef.current.value = "" }} className="px-2 py-1 border rounded text-xs">Cancelar</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {tabActiva === "bloques" && (
            <div>
                <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Bloques del Festival</h3>
                  <p className="text-gray-600 text-sm">Total: {totalParticipantes} participantes · {cantidadBloques} bloques (máx. {capacidadBloque} por bloque) · Cursos: {festivalActivo.cursos.length} · Mañana: {bloquesMañana.length} · Tarde: {bloquesTarde.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={capacidadBloque}
                    onChange={(e) => setCapacidadBloque(Number(e.target.value))}
                    className="px-3 py-2 border rounded text-sm"
                  >
                    <option value="180">180 por bloque</option>
                    <option value="210">210 por bloque</option>
                  </select>
                  <button onClick={handleActualizarBloque} disabled={guardandoBloques} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                    {guardandoBloques ? "Actualizando..." : "Actualizar Bloque"}
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                 <div>
                    <h4 className="font-semibold mb-2">Mañana</h4>
                    {bloquesMañana.length === 0 ? (
                      <p className="text-sm text-gray-600 mb-3">Sin bloques</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                         {bloquesMañana.map(bloque => {
                           const bloqueId = `mañana-${bloque.numero}`
                           const config = bloquesConfig.find(b => b.id === bloqueId)
                           const niveles = config?.niveles ?? Array.from({ length: MAX_NIVELES }, () => ({ nivel: "", color: DEFAULT_COLOR }))
                           const items = (bloque as any).cursos || (bloque as any).grados || []
                           return (
                             <div key={bloqueId} className="border rounded-lg p-3">
                               <div className="flex justify-between items-center mb-2">
                                 <h4 className="font-semibold text-sm">Bloque {bloque.numero}</h4>
                                 <span className="text-xs text-gray-700">{bloque.total} participantes</span>
                               </div>
                               <div className="text-xs text-gray-700 mb-2">
                                 Grupos: {(() => { const g = calcularGrupos(bloque.total); return `${g.grupos3} de 3, ${g.grupos2} de 2`; })()}
                               </div>
                              <div className="grid gap-1 mb-2">
                                 {niveles.map((nivelInfo, idx) => {
                                   return (
                                     <div key={idx} className="flex gap-1 items-center p-1.5 rounded" style={{ backgroundColor: nivelInfo.color || "#f3f4f6" }}>
                                       <span className="text-xs font-medium w-14" style={{ color: nivelInfo.color ? "#111827" : "#6b7280" }}>Nivel {idx + 1}</span>
                                      <select
                                        value={nivelInfo.nivel}
                                        onChange={(e) => actualizarNivelBloque(bloqueId, idx, { nivel: e.target.value })}
                                        className="px-1 py-0.5 border rounded text-xs flex-1"
                                      >
                                        <option value="">Sin nivel</option>
                                        {NIVELES.map(n => (
                                          <option key={n} value={n}>{n.toUpperCase()}</option>
                                        ))}
                                      </select>
                                       <input
                                         type="color"
                                         value={nivelInfo.color || "#000000"}
                                         onChange={(e) => actualizarNivelBloque(bloqueId, idx, { color: e.target.value })}
                                         className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                                         title="Seleccionar color"
                                       />
                                    </div>
                                  )
                                })}
                              </div>
                               <div className="grid gap-0.5">
                                 {[...items].sort((a: any, b: any) => ordenarTipoGrado(a.tipo) - ordenarTipoGrado(b.tipo)).map((item: any) => (
                                   <div key={item.id} className="text-xs text-gray-700">
                                     {item.tipo} · {item.nombre} — {item.participantes} participantes
                                   </div>
                                 ))}
                               </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                 </div>
                 <div>
                    <h4 className="font-semibold mb-2">Tarde</h4>
                    {bloquesTarde.length === 0 ? (
                       <p className="text-sm text-gray-600 mb-3">Sin bloques</p>
                    ) : (
                     <div className="grid grid-cols-2 gap-3">
                         {bloquesTarde.map(bloque => {
                           const bloqueId = `tarde-${bloque.numero}`
                           const config = bloquesConfig.find(b => b.id === bloqueId)
                           const niveles = config?.niveles ?? Array.from({ length: MAX_NIVELES }, () => ({ nivel: "", color: DEFAULT_COLOR }))
                           const items = (bloque as any).cursos || (bloque as any).grados || []
                           return (
                             <div key={bloqueId} className="border rounded-lg p-3">
                               <div className="flex justify-between items-center mb-2">
                                 <h4 className="font-semibold text-sm">Bloque {bloque.numero}</h4>
                                 <span className="text-xs text-gray-700">{bloque.total} participantes</span>
                               </div>
                               <div className="text-xs text-gray-700 mb-2">
                                 Grupos: {(() => { const g = calcularGrupos(bloque.total); return `${g.grupos3} de 3, ${g.grupos2} de 2`; })()}
                               </div>
                              <div className="grid gap-1 mb-2">
                                 {niveles.map((nivelInfo, idx) => {
                                   return (
                                     <div key={idx} className="flex gap-1 items-center p-1.5 rounded" style={{ backgroundColor: nivelInfo.color || "#f3f4f6" }}>
                                       <span className="text-xs font-medium w-14" style={{ color: nivelInfo.color ? "#111827" : "#6b7280" }}>Nivel {idx + 1}</span>
                                      <select
                                        value={nivelInfo.nivel}
                                        onChange={(e) => actualizarNivelBloque(bloqueId, idx, { nivel: e.target.value })}
                                        className="px-1 py-0.5 border rounded text-xs flex-1"
                                      >
                                        <option value="">Sin nivel</option>
                                        {NIVELES.map(n => (
                                          <option key={n} value={n}>{n.toUpperCase()}</option>
                                        ))}
                                      </select>
                                       <input
                                         type="color"
                                         value={nivelInfo.color || "#000000"}
                                         onChange={(e) => actualizarNivelBloque(bloqueId, idx, { color: e.target.value })}
                                         className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
                                         title="Seleccionar color"
                                       />
                                    </div>
                                  )
                                })}
                              </div>
                               <div className="grid gap-0.5">
                                 {[...items].sort((a: any, b: any) => ordenarTipoGrado(a.tipo) - ordenarTipoGrado(b.tipo)).map((item: any) => (
                                   <div key={item.id} className="text-xs text-gray-700">
                                     {item.tipo} · {item.nombre} — {item.participantes} participantes
                                   </div>
                                 ))}
                               </div>
                            </div>
                          )
                        })}
                     </div>
                   )}
                 </div>
              </div>
            </div>
          )}
          {tabActiva === "encargados" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Encargados</h3>
                <button onClick={handleGuardarEncargados} disabled={guardandoEncargados} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                  {guardandoEncargados ? "Guardando..." : "Guardar Encargados"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm">
                   <thead>
                     <tr className="bg-gray-100">
                       <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">BLOQUE</th>
                       <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">JUEGO</th>
                       <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">ENCARGADO</th>
                       <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">GRADO</th>
                       <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">UBICACIÓN</th>
                       <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">ACCIONES</th>
                     </tr>
                   </thead>
                   <tbody>
                      {([...bloquesMañana.map(b => ({ ...b, jornada: "mañana" as const })), ...bloquesTarde.map(b => ({ ...b, jornada: "tarde" as const }))]).map((bloque) => {
                        const bloqueId = `${bloque.jornada}-${bloque.numero}`
                        const filasJuegos = juegosEncargados[bloqueId] ?? [createEmptyRow()]
                        return (
                          <Fragment key={bloqueId}>
                            {filasJuegos.map((fila, idx) => {
                              const isEven = idx % 2 === 0
                              return (
                                <tr key={`${bloqueId}-${idx}`} className={isEven ? "bg-white" : "bg-gray-50"}>
                                  {idx === 0 && (
                                     <td className="border border-gray-300 px-2 py-1 font-medium text-gray-800" rowSpan={filasJuegos.length}>{bloque.jornada === "mañana" ? `Bloque ${bloque.numero} (Mañana)` : `Bloque ${bloque.numero} (Tarde)`}</td>
                                  )}
                                  <td className="border border-gray-300 px-2 py-1">
                                    <select
                                      value={fila.juego}
                                      onChange={(e) => actualizarJuegoEncargado(bloqueId, idx, "juego", e.target.value)}
                                      className="w-full border-0 p-0 bg-transparent focus:ring-0 text-gray-900"
                                    >
                                      <option value="">-</option>
                                      {(juegosPorTipo[festival.tipo] ?? []).map(j => (
                                        <option key={j} value={j}>{j}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1">
                                    <input
                                      type="text"
                                      value={fila.encargado}
                                      onChange={(e) => actualizarJuegoEncargado(bloqueId, idx, "encargado", e.target.value)}
                                      className="w-full border-0 p-0 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400"
                                      placeholder="Encargado"
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1">
                                    <input
                                      type="text"
                                      value={fila.grado}
                                      onChange={(e) => actualizarJuegoEncargado(bloqueId, idx, "grado", e.target.value)}
                                      className="w-full border-0 p-0 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400"
                                      placeholder="Grado"
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1">
                                    <input
                                      type="text"
                                      value={fila.ubicacion}
                                      onChange={(e) => actualizarJuegoEncargado(bloqueId, idx, "ubicacion", e.target.value)}
                                      className="w-full border-0 p-0 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400"
                                      placeholder="Ubicación"
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1 text-center">
                                    <button onClick={() => eliminarFilaEncargado(bloqueId, idx)} className="text-red-800 font-medium hover:text-red-900">Eliminar</button>
                                  </td>
                                </tr>
                              )
                            })}
                            <tr key={`${bloqueId}-add`} className="bg-white">
                              <td colSpan={5} className="border border-gray-300 px-2 py-1 text-center">
                                 <button onClick={() => agregarFilaEncargado(bloqueId)} className="text-blue-800 font-medium hover:text-blue-900">+ Agregar fila</button>
                              </td>
                            </tr>
                          </Fragment>
                        )
                      })}
                   </tbody>
                 </table>
              </div>
               <div className="mt-6">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Jefes de Exploración por Grado</h4>
                   <button onClick={handleGuardarJefes} disabled={guardandoJefes} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                     {guardandoJefes ? "Guardando..." : "Guardar Jefes"}
                   </button>
                 </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm">
                     <thead>
                       <tr className="bg-gray-100">
                         <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">GRADO</th>
                         <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">JEFE 1</th>
                         <th className="border border-gray-300 px-2 py-1 text-left font-semibold text-gray-700">JEFE 2</th>
                       </tr>
                     </thead>
                    <tbody>
                       {[...festivalActivo.grados].sort((a, b) => ordenarTipoGrado(a.tipo) - ordenarTipoGrado(b.tipo)).map((grado, idx) => {
                         const isEven = idx % 2 === 0
                         const nombres = jefesExploracion[grado.id] ?? []
                         return (
                           <tr key={grado.id} className={isEven ? "bg-white" : "bg-gray-50"}>
                             <td className="border border-gray-300 px-2 py-1 font-medium text-gray-800">{grado.tipo} · {grado.nombre}</td>
                             <td className="border border-gray-300 px-2 py-1">
                               <input
                                 type="text"
                                 value={nombres[0] ?? ""}
                                 onChange={(e) => setJefesExploracion(prev => {
                                   const actual = prev[grado.id] ?? []
                                   const siguiente = [...actual]
                                   siguiente[0] = e.target.value
                                   return { ...prev, [grado.id]: siguiente }
                                 })}
                                 className="w-full border-0 p-0 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400"
                                 placeholder="Jefe 1"
                               />
                             </td>
                             <td className="border border-gray-300 px-2 py-1">
                               <input
                                 type="text"
                                 value={nombres[1] ?? ""}
                                 onChange={(e) => setJefesExploracion(prev => {
                                   const actual = prev[grado.id] ?? []
                                   const siguiente = [...actual]
                                   siguiente[1] = e.target.value
                                   return { ...prev, [grado.id]: siguiente }
                                 })}
                                 className="w-full border-0 p-0 focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400"
                                 placeholder="Jefe 2"
                               />
                             </td>
                           </tr>
                         )
                       })}
                    </tbody>
                  </table>
                </div>
              </div>
              </div>
            )}
            {tabActiva === "adicionales" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Datos Adicionales del Festival</h3>
                  <button onClick={handleGuardarAdicionales} disabled={guardandoAdicionales} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                    {guardandoAdicionales ? "Guardando..." : "Guardar Adicionales"}
                  </button>
                </div>
                <div className="grid gap-3 max-w-md">
                  <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={festivalActivo.diplomas_entregados}
                      onChange={(e) => setFestivalActivo({ ...festivalActivo, diplomas_entregados: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Diplomas entregados</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={festivalActivo.pruebas_presentadas}
                      onChange={(e) => setFestivalActivo({ ...festivalActivo, pruebas_presentadas: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Pruebas presentadas</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={festivalActivo.calificaciones_entregadas}
                      onChange={(e) => setFestivalActivo({ ...festivalActivo, calificaciones_entregadas: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Calificaciones entregadas</span>
                  </label>
                </div>
              </div>
            )}
          </div>
 
         {modalGradoAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{gradoEditarId ? "Editar" : "Agregar"} Grado</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={gradoForm.nombre}
              onChange={(e) => setGradoForm({ ...gradoForm, nombre: e.target.value })}
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <select
              value={gradoForm.tipo}
              onChange={(e) => setGradoForm({ ...gradoForm, tipo: e.target.value as typeof gradoForm.tipo })}
              className="w-full px-3 py-2 border rounded mb-3"
            >
              {TIPOS_GRADO.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={gradoForm.jornada}
              onChange={(e) => setGradoForm({ ...gradoForm, jornada: e.target.value as typeof gradoForm.jornada })}
              className="w-full px-3 py-2 border rounded mb-3"
            >
              {JORNADAS.map(j => (
                <option key={j} value={j}>{j === "mañana" ? "Mañana" : "Tarde"}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Participantes"
              value={gradoForm.participantes}
              onChange={(e) => setGradoForm({ ...gradoForm, participantes: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded mb-3"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setModalGradoAbierto(false)} className="px-3 py-1 border rounded">Cancelar</button>
              <button onClick={guardarGrado} className="px-3 py-1 bg-blue-600 text-white rounded">
                {gradoEditarId ? "Guardar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
       )}
     </div>
  </div>
  )
}
