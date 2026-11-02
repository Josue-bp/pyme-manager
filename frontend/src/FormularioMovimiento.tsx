    import { useState, type FormEvent } from 'react'
import { api } from './api'

export type Almacen = { id: number; nombre: string }

type Props = {
  producto: { id: number; nombre: string }
  almacenes: Almacen[]
  alGuardar: () => void
  alCancelar: () => void
}

export default function FormularioMovimiento({ producto, almacenes, alGuardar, alCancelar }: Props) {
  const [almacenId, setAlmacenId] = useState(almacenes[0] ? String(almacenes[0].id) : '')
  const [tipo, setTipo] = useState('entrada')
  const [cantidad, setCantidad] = useState('')
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      await api('/movimientos', {
        method: 'POST',
        body: JSON.stringify({
          producto_id: producto.id,
          almacen_id: Number(almacenId),
          tipo,
          cantidad: Number(cantidad),
          motivo: motivo || null,
        }),
      })
      alGuardar()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setGuardando(false)
    }
  }

  if (almacenes.length === 0) {
    return (
      <div className="tarjeta formulario">
        <h2>Movimiento: {producto.nombre}</h2>
        <p>Primero debe existir al menos un almacén.</p>
        <button onClick={alCancelar}>Cerrar</button>
      </div>
    )
  }

  return (
    <form className="tarjeta formulario" onSubmit={enviar}>
      <h2>Movimiento: {producto.nombre}</h2>

      <label>
        Almacén
        <select value={almacenId} onChange={(e) => setAlmacenId(e.target.value)}>
          {almacenes.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
      </label>

      <label>
        Tipo
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
      </label>

      <label>
        Cantidad
        <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
      </label>

      <label>
        Motivo (opcional)
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="acciones">
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Registrar'}
        </button>
        <button type="button" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  )
}