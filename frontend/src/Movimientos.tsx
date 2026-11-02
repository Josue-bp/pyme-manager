import { useEffect, useState } from 'react'
import { api } from './api'
import type { Almacen } from './FormularioMovimiento'

type Movimiento = {
  id: number
  tipo: 'entrada' | 'salida'
  cantidad: number
  motivo: string | null
  created_at: string
  producto: { id: number; sku: string; nombre: string }
  almacen: { id: number; nombre: string }
  usuario: { id: number; name: string }
}

type Pagina = {
  data: Movimiento[]
  current_page: number
  last_page: number
  total: number
}

export default function Movimientos() {
  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [almacenes, setAlmacenes] = useState<Almacen[]>([])
  const [almacenId, setAlmacenId] = useState('')
  const [numero, setNumero] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Almacen[]>('/almacenes').then(setAlmacenes).catch(() => {})
  }, [])

  useEffect(() => {
    const filtro = almacenId ? `&almacen_id=${almacenId}` : ''

    api<Pagina>(`/movimientos?page=${numero}${filtro}`)
      .then(setPagina)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error inesperado'))
  }, [numero, almacenId])

  return (
    <>
      <h1>Movimientos</h1>

      <div className="barra">
        <select
          value={almacenId}
          onChange={(e) => {
            setAlmacenId(e.target.value)
            setNumero(1)
          }}
        >
          <option value="">Todos los almacenes</option>
          {almacenes.map((a) => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Almacén</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Motivo</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {pagina?.data.map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.created_at).toLocaleString('es-PE')}</td>
              <td>{m.producto.nombre}</td>
              <td>{m.almacen.nombre}</td>
              <td>
                <span className={m.tipo === 'entrada' ? 'estado estado-ok' : 'estado estado-bajo'}>
                  {m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                </span>
              </td>
              <td>{m.tipo === 'entrada' ? '+' : '−'}{m.cantidad}</td>
              <td>{m.motivo ?? '—'}</td>
              <td>{m.usuario.name}</td>
            </tr>
          ))}
          {pagina && pagina.data.length === 0 && (
            <tr><td colSpan={7}>No hay movimientos.</td></tr>
          )}
        </tbody>
      </table>

      {pagina && (
        <div className="paginacion">
          <button disabled={numero <= 1} onClick={() => setNumero(numero - 1)}>Anterior</button>
          <span>Página {pagina.current_page} de {pagina.last_page} · {pagina.total} movimientos</span>
          <button disabled={numero >= pagina.last_page} onClick={() => setNumero(numero + 1)}>Siguiente</button>
        </div>
      )}
    </>
  )
}