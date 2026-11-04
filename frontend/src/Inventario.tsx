import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api, type Usuario } from './api'
import FormularioMovimiento, { type Almacen } from './FormularioMovimiento'
import FormularioProducto, { type Categoria } from './FormularioProducto'
import TarjetasResumen from './TarjetasResumen'

// ... types iguales ...

export default function Inventario() {
  const usuario = useOutletContext<Usuario>()
  const puedeEditar = usuario.role === 'administrador' || usuario.role === 'almacen'

  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [stock, setStock] = useState<FilaStock[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [almacenes, setAlmacenes] = useState<Almacen[]>([])
  const [buscar, setBuscar] = useState('')
  const [buscarDebounced, setBuscarDebounced] = useState('')
  const [numero, setNumero] = useState(1)
  const [recarga, setRecarga] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [productoMovimiento, setProductoMovimiento] = useState<Producto | null>(null)
  const [error, setError] = useState('')

  // --- Debounce de la búsqueda (300ms) ---
  useEffect(() => {
    const t = setTimeout(() => {
      setBuscarDebounced(buscar)
      setNumero(1)
    }, 300)
    return () => clearTimeout(t)
  }, [buscar])

  // --- Productos ---
  useEffect(() => {
    setCargando(true)
    api<Pagina>(`/productos?page=${numero}&buscar=${encodeURIComponent(buscarDebounced)}`)
      .then((p) => {
        setPagina(p)
        // si el backend devuelve otra página (ej. borramos la última), sincronizamos
        if (p.current_page !== numero) setNumero(p.current_page)
        setError('')
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error inesperado'))
      .finally(() => setCargando(false))
  }, [numero, buscarDebounced, recarga])

  // --- Stock / catálogos con error visible ---
  useEffect(() => {
    api<FilaStock[]>('/stock')
      .then(setStock)
      .catch(() => setError('No se pudo cargar el stock'))
  }, [recarga])

  useEffect(() => {
    api<Categoria[]>('/categorias')
      .then(setCategorias)
      .catch(() => setError('No se pudieron cargar las categorías'))
    api<Almacen[]>('/almacenes')
      .then(setAlmacenes)
      .catch(() => setError('No se pudieron cargar los almacenes'))
  }, [])

  // --- Stock total por producto, precalculado ---
  const stockPorProducto = useMemo(() => {
    const mapa = new Map<number, number>()
    for (const fila of stock) {
      mapa.set(fila.producto_id, (mapa.get(fila.producto_id) ?? 0) + fila.stock)
    }
    return mapa
  }, [stock])

  function stockTotal(productoId: number) {
    return stockPorProducto.get(productoId) ?? 0
  }

  function guardado() {
    setMostrarForm(false)
    setProductoMovimiento(null)
    setRecarga((n) => n + 1)
  }

  return (
    <>
      <h1>Inventario</h1>
      <TarjetasResumen recarga={recarga} />

      <div className="barra">
        <input
          placeholder="Buscar por nombre o SKU…"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        {puedeEditar && (
          <button
            className="boton"
            onClick={() => {
              setProductoMovimiento(null)
              setMostrarForm(true)
            }}
          >
            + Nuevo producto
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {mostrarForm && (
        <FormularioProducto
          categorias={categorias}
          alGuardar={guardado}
          alCancelar={() => setMostrarForm(false)}
        />
      )}

      {productoMovimiento && (
        <FormularioMovimiento
          producto={productoMovimiento}
          almacenes={almacenes}
          alGuardar={guardado}
          alCancelar={() => setProductoMovimiento(null)}
        />
      )}

      {cargando && <p className="cargando">Cargando productos…</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>SKU</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Mínimo</th>
            <th>Estado</th>
            {puedeEditar && <th></th>}
          </tr>
        </thead>
        <tbody>
          {pagina?.data.map((p) => {
            const total = stockTotal(p.id)
            const bajo = total < p.stock_minimo
            return (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.sku}</td>
                <td>{p.categoria?.nombre ?? '—'}</td>
                <td>{p.precio}</td>
                <td>{total}</td>
                <td>{p.stock_minimo}</td>
                <td>
                  <span className={bajo ? 'estado estado-bajo' : 'estado estado-ok'}>
                    {bajo ? 'Bajo mínimo' : 'OK'}
                  </span>
                </td>
                {puedeEditar && (
                  <td>
                    <button
                      onClick={() => {
                        setMostrarForm(false)
                        setProductoMovimiento(p)
                      }}
                    >
                      Movimiento
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
          {pagina && pagina.data.length === 0 && (
            <tr>
              <td colSpan={8}>No hay productos.</td>
            </tr>
          )}
        </tbody>
      </table>

      {pagina && (
        <div className="paginacion">
          <button disabled={numero <= 1} onClick={() => setNumero(numero - 1)}>
            Anterior
          </button>
          <span>
            Página {pagina.current_page} de {pagina.last_page} · {pagina.total} productos
          </span>
          <button
            disabled={numero >= pagina.last_page}
            onClick={() => setNumero(numero + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </>
  )
} 