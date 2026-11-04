import { useEffect, useState, type FormEvent } from 'react'
import { api, MONEDA } from './api'
import type { Proveedor } from './FormularioProveedor'
import type { Almacen } from './FormularioMovimiento'

type ProductoOpcion = { id: number; sku: string; nombre: string }
type Linea = { producto_id: string; cantidad: string; costo: string }

type Props = {
  alGuardar: () => void
  alCancelar: () => void
}

const lineaVacia: Linea = { producto_id: '', cantidad: '1', costo: '' }

export default function FormularioCompra({ alGuardar, alCancelar }: Props) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [productos, setProductos] = useState<ProductoOpcion[]>([])
  const [almacenes, setAlmacenes] = useState<Almacen[]>([])
  const [proveedorId, setProveedorId] = useState('')
  const [almacenId, setAlmacenId] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([lineaVacia])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    api<Proveedor[]>('/proveedores?todos=1')
      .then((lista) => {
        setProveedores(lista)
        setProveedorId((actual) => actual || (lista[0] ? String(lista[0].id) : ''))
      })
      .catch(() => {})
    api<ProductoOpcion[]>('/productos?todos=1').then(setProductos).catch(() => {})
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

  // Total en centavos para evitar errores de decimales
  const totalCentavos = lineas.reduce(
    (suma, l) => suma + Math.round((Number(l.costo) || 0) * 100) * (Number(l.cantidad) || 0),
    0,
  )

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')

    const items = lineas
      .filter((l) => l.producto_id)
      .map((l) => ({
        producto_id: Number(l.producto_id),
        cantidad: Number(l.cantidad),
        costo_unitario: Number(l.costo),
      }))

    if (items.length === 0) {
      setError('Agrega al menos un producto.')
      return
    }

    setGuardando(true)

    try {
      await api('/compras', {
        method: 'POST',
        body: JSON.stringify({
          proveedor_id: Number(proveedorId),
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
      <h2>Nueva compra</h2>

      <label>
        Proveedor
        <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} required>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </label>

      <label>
        Almacén de destino
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
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              title="Cantidad"
              value={linea.cantidad}
              onChange={(e) => cambiar(i, 'cantidad', e.target.value)}
            />

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Costo"
              title="Costo unitario"
              value={linea.costo}
              onChange={(e) => cambiar(i, 'costo', e.target.value)}
            />

            {lineas.length > 1 && (
              <button type="button" onClick={() => quitar(i)}>Quitar</button>
            )}
          </div>
        ))}

        <button type="button" onClick={() => setLineas([...lineas, lineaVacia])}>
          + Añadir producto
        </button>
      </div>

      <p className="total">
        Total: <strong>{MONEDA} {(totalCentavos / 100).toFixed(2)}</strong>
      </p>

      {error && <p className="error">{error}</p>}

      <div className="acciones">
        <button type="submit" className="boton" disabled={guardando}>
          {guardando ? 'Registrando…' : 'Registrar compra'}
        </button>
        <button type="button" onClick={alCancelar}>Cancelar</button>
      </div>
    </form>
  )
}