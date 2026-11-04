import { useState, type FormEvent } from 'react'
import { api } from './api'

export type Proveedor = {
  id: number
  nombre: string
  documento: string | null
  contacto: string | null
  email: string | null
  telefono: string | null
  direccion: string | null
  activo: boolean
}

type Props = {
  proveedor: Proveedor | null
  alGuardar: () => void
  alCancelar: () => void
}

export default function FormularioProveedor({ proveedor, alGuardar, alCancelar }: Props) {
  const [nombre, setNombre] = useState(proveedor?.nombre ?? '')
  const [documento, setDocumento] = useState(proveedor?.documento ?? '')
  const [contacto, setContacto] = useState(proveedor?.contacto ?? '')
  const [telefono, setTelefono] = useState(proveedor?.telefono ?? '')
  const [email, setEmail] = useState(proveedor?.email ?? '')
  const [direccion, setDireccion] = useState(proveedor?.direccion ?? '')
  const [activo, setActivo] = useState(proveedor?.activo ?? true)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      await api(proveedor ? `/proveedores/${proveedor.id}` : '/proveedores', {
        method: proveedor ? 'PUT' : 'POST',
        body: JSON.stringify({
          nombre,
          documento: documento || null,
          contacto: contacto || null,
          telefono: telefono || null,
          email: email || null,
          direccion: direccion || null,
          activo,
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
      <h2>{proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>

      <label>
        Nombre o razón social
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>

      <label>
        RUC o documento
        <input value={documento} onChange={(e) => setDocumento(e.target.value)} />
      </label>

      <label>
        Persona de contacto
        <input value={contacto} onChange={(e) => setContacto(e.target.value)} />
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

      <label className="casilla">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        Proveedor activo
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