import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api, type Usuario } from './api'
import FormularioProducto, { type Categoria } from './FormularioProducto'

type Producto = {
  id: number
  sku: string
  nombre: string
  precio: string
  stock_minimo: number
  activo: boolean
  categoria: Categoria | null
}

type Pagina = {
  data: Producto[]
  current_page: number
  last_page: number
  total: number
}

export default function Inventario() {
  const usuario = useOutletContext<Usuario>()
  const puedeEditar = usuario.role === 'administrador' || usuario.role === 'almacen'

  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [buscar, setBuscar] = useState('')
  const [numero, setNumero] = useState(1)
  const [recarga, setRecarga] = useState(0)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Pagina>(`/productos?page=${numero}&buscar=${encodeURIComponent(buscar)}`)
      .then(setPagina)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error inesperado'))
  }, [numero, buscar, recarga])

  useEffect(() => {
    api<Categoria[]>('/categorias').then(setCategorias).catch(() => {})
  }, [])

  function guardado() {
    setMostrarForm(false)
    setRecarga((n) => n + 1)
  }

  return (
    <>
      <h1>Inventario</h1>

      <div className="barra">
        <input
          placeholder="Buscar por nombre o SKU…"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value)
            setNumero(1)
          }}
        />
        {puedeEditar && (
          <button className="boton" onClick={() => setMostrarForm(true)}>
            + Nuevo producto
          </button>
        )}
      </div>

      {mostrarForm && (
        <FormularioProducto
          categorias={categorias}
          alGuardar={guardado}
          alCancelar={() => setMostrarForm(false)}
        />
      )}

      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Mínimo</th>
          </tr>
        </thead>
        <tbody>
          {pagina?.data.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.sku}</td>
              <td>{p.categoria?.nombre ?? '—'}</td>
              <td>{p.precio}</td>
              <td>{p.stock_minimo}</td>
            </tr>
          ))}
          {pagina && pagina.data.length === 0 && (
            <tr><td colSpan={5}>No hay productos.</td></tr>
          )}
        </tbody>
      </table>

      {pagina && (
        <div className="paginacion">
          <button disabled={numero <= 1} onClick={() => setNumero(numero - 1)}>Anterior</button>
          <span>Página {pagina.current_page} de {pagina.last_page} · {pagina.total} productos</span>
          <button disabled={numero >= pagina.last_page} onClick={() => setNumero(numero + 1)}>Siguiente</button>
        </div>
      )}
    </>
  )
}