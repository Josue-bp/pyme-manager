import { useState, type FormEvent } from 'react'
import { api } from './api'

export type Cliente = {
  id: number
  nombre: string
  documento: string | null
  email: string | null
  telefono: string | null
  direccion: string | null
}

type Props = {
  cliente: Cliente | null
  alGuardar: () => void
  alCancelar: () => void
}

export default function FormularioCliente({ cliente, alGuardar, alCancelar }: Props) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? '')
  const [documento, setDocumento] = useState(cliente?.documento ?? '')
  const [telefono, setTelefono] = useState(cliente?.telefono ?? '')
  const [email, setEmail] = useState(cliente?.email ?? '')
  const [direccion, setDireccion] = useState(cliente?.direccion ?? '')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      await api(cliente ? `/clientes/${cliente.id}` : '/clientes', {
        method: cliente ? 'PUT' : 'POST',
        body: JSON.stringify({
          nombre,
          documento: documento || null,
          telefono: telefono || null,
          email: email || null,
          direccion: direccion || null,
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
      <h2>{cliente ? 'Editar cliente' : 'Nuevo cliente'}</h2>

      <label>
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>

      <label>
        Documento (DNI o RUC)
        <input value={documento} onChange={(e) => setDocumento(e.target.value)} />
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
        Dirección
        <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
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