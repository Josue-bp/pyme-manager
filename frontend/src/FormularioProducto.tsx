import { useState, type FormEvent } from 'react'
import { api } from './api'

export type Categoria = { id: number; nombre: string }

type Props = {
  categorias: Categoria[]
  alGuardar: () => void
  alCancelar: () => void
}

export default function FormularioProducto({ categorias, alGuardar, alCancelar }: Props) {
  const [sku, setSku] = useState('')
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stockMinimo, setStockMinimo] = useState('0')
  const [categoriaId, setCategoriaId] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      await api('/productos', {
        method: 'POST',
        body: JSON.stringify({
          sku,
          nombre,
          precio: Number(precio),
          stock_minimo: Number(stockMinimo),
          categoria_id: categoriaId ? Number(categoriaId) : null,
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
      <h2>Nuevo producto</h2>

      <label>
        SKU
        <input value={sku} onChange={(e) => setSku(e.target.value)} required />
      </label>

      <label>
        Nombre
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </label>

      <label>
        Precio
        <input type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} required />
      </label>

      <label>
        Stock mínimo
        <input type="number" min="0" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} required />
      </label>

      <label>
        Categoría
        <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          <option value="">Sin categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
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