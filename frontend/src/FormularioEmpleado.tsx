import { useEffect, useState, type FormEvent } from 'react'
import { api } from './api'

export type Empleado = {
  id: number
  nombre: string
  documento: string
  cargo: string
  email: string | null
  telefono: string | null
  fecha_ingreso: string
  activo: boolean
  user_id: number | null
  usuario: { id: number; name: string; email: string; role: string } | null
}

type UsuarioOpcion = { id: number; name: string; email: string; role: string }

type Props = {
  empleado: Empleado | null
  alGuardar: () => void
  alCancelar: () => void
}

export default function FormularioEmpleado({ empleado, alGuardar, alCancelar }: Props) {
  const [nombre, setNombre] = useState(empleado?.nombre ?? '')
  const [documento, setDocumento] = useState(empleado?.documento ?? '')
  const [cargo, setCargo] = useState(empleado?.cargo ?? '')
  const [email, setEmail] = useState(empleado?.email ?? '')
  const [telefono, setTelefono] = useState(empleado?.telefono ?? '')
  const [fechaIngreso, setFechaIngreso] = useState(empleado?.fecha_ingreso ?? '')
  const [activo, setActivo] = useState(empleado?.activo ?? true)
  const [usuarioId, setUsuarioId] = useState(empleado?.user_id ? String(empleado.user_id) : '')
  const [usuarios, setUsuarios] = useState<UsuarioOpcion[]>([])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    api<UsuarioOpcion[]>('/usuarios').then(setUsuarios).catch(() => {})
  }, [])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      await api(empleado ? `/empleados/${empleado.id}` : '/empleados', {
        method: empleado ? 'PUT' : 'POST',
        body: JSON.stringify({
          nombre,
          documento,
          cargo,
          email: email || null,
          telefono: telefono || null,
          fecha_ingreso: fechaIngreso,
          activo,
          user_id: usuarioId ? Number(usuarioId) : null,
        }),
      })
      alGuardar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form className="tarjeta formulario" onSubmit={enviar}>
      <h2>{empleado ? 'Editar empleado' : 'Nuevo empleado'}</h2>

      <label>
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>

      <label>
        Documento
        <input value={documento} onChange={(e) => setDocumento(e.target.value)} required />
      </label>

      <label>
        Cargo
        <input value={cargo} onChange={(e) => setCargo(e.target.value)} required />
      </label>

      <label>
        Fecha de ingreso
        <input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} required />
      </label>

      <label>
        Teléfono
        <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </label>

      <label>
        Correo
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label>
        Usuario del sistema
        <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
          <option value="">Sin usuario</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email}) · {u.role}
            </option>
          ))}
        </select>
      </label>

      <label className="casilla">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        Empleado activo
      </label>

      {error && <p className="error">{error}</p>}

      <div className="acciones">
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  )
}