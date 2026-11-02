import { useEffect, useState, type FormEvent } from 'react'
import { api, MONEDA } from './api'
import type { Cliente } from './FormularioCliente'
import type { Almacen } from './FormularioMovimiento'

type ProductoVenta = { id: number; sku: string; nombre: string; precio: string }
type Linea = { producto_id: string; cantidad: string }

type Props = {
  alGuardar: () => void
  alCancelar: () => void
}

export default function FormularioVenta({ alGuardar, alCancelar }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<ProductoVenta[]>([])
  const [almacenes, setAlmacenes] = useState<Almacen[]>([])
  const [clienteId, setClienteId] = useState('')
  const [almacenId, setAlmacenId] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([{ producto_id: '', cantidad: '1' }])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    api<Cliente[]>('/clientes?todos=1').then(setClientes).catch(() => {})
    api<ProductoVenta[]>('/productos?todos=1').then(setProductos).catch(() => {})
    api<Almacen[]>('/almacenes')
      .then((lista) => {
        setAlmacenes(lista)
        setAlmacenId((actual) => actual || (lista[0] ? String(lista[0].id) : ''))
      })
      .catch(() => {})
  }, [])

  function cambiar(indice: number, campo: keyof Linea, valor: string) {
    setLineas((actuales) =>
      actuales.map((l, i) => (i === indice ? { ...l, [campo]: valor } : l)),
    )
  }

  function quitar(indice: number) {
    setLineas((actuales) => actuales.filter((_, i) => i !== indice))
  }

  // Total calculado en centavos para evitar errores de decimales
  const totalCentavos = lineas.reduce((suma, l) => {
    const producto = productos.find((p) => String(p.id) === l.producto_id)
    if (!producto) return suma
    return suma + Math.round(Number(producto.precio) * 100) * (Number(l.cantidad) || 0)
  }, 0)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')

    const items = lineas
      .filter((l) => l.producto_id)
      .map((l) => ({ producto_id: Number(l.producto_id), cantidad: Number(l.cantidad) }))

    if (items.length === 0) {
      setError('Agrega al menos un producto.')
      return
    }

    setGuardando(true)

    try {
      await api('/ventas', {
        method: 'POST',
        body: JSON.stringify({
          cliente_id: clienteId ? Number(clienteId) : null,
          almacen_id: Number(almacenId),
          items,
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
    <form className="tarjeta formulario venta" onSubmit={enviar}>
      <h2>Nueva venta</h2>

      <label>
        Cliente (opcional)
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">Cliente general</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}{c.documento ? ` · ${c.documento}` : ''}
            </option>
          ))}
        </select>
      </label>

      <label>
        Almacén
        <select value={almacenId} onChange={(e) => setAlmacenId(e.target.value)} required>
          {almacenes.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
      </label>

      <div>
        <strong>Productos</strong>
        {lineas.map((linea, i) => (
          <div className="linea" key={i}>
            <select
              value={linea.producto_id}
              onChange={(e) => cambiar(i, 'producto_id', e.target.value)}
            >
              <option value="">Selecciona un producto…</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {MONEDA} {p.precio}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={linea.cantidad}
              onChange={(e) => cambiar(i, 'cantidad', e.target.value)}
            />

            {lineas.length > 1 && (
              <button type="button" onClick={() => quitar(i)}>Quitar</button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setLineas([...lineas, { producto_id: '', cantidad: '1' }])}
        >
          + Añadir producto
        </button>
      </div>

      <p className="total">
        Total: <strong>{MONEDA} {(totalCentavos / 100).toFixed(2)}</strong>
      </p>

      {error && <p className="error">{error}</p>}

      <div className="acciones">
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Registrando…' : 'Registrar venta'}
        </button>
        <button type="button" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  )
}