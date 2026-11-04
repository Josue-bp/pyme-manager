import { useEffect, useState } from 'react'
import { api, MONEDA } from './api'
import FormularioCompra from './FormularioCompra'

type Compra = {
  id: number
  numero: string
  total: string
  created_at: string
  proveedor: { id: number; nombre: string }
  almacen: { id: number; nombre: string }
  usuario: { id: number; name: string }
}

type Pagina = {
  data: Compra[]
  current_page: number
  last_page: number
  total: number
}

export default function Compras() {
  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [numero, setNumero] = useState(1)
  const [recarga, setRecarga] = useState(0)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Pagina>(`/compras?page=${numero}`)
      .then(setPagina)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error inesperado'))
  }, [numero, recarga])

  function guardado() {
    setMostrarForm(false)
    setNumero(1)
    setRecarga((n) => n + 1)
  }

  return (
    <>
      <h1>Compras</h1>

      <div className="barra">
        <button className="boton" onClick={() => setMostrarForm(true)}>
          + Nueva compra
        </button>
      </div>

      {mostrarForm && (
        <FormularioCompra alGuardar={guardado} alCancelar={() => setMostrarForm(false)} />
      )}

      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>N.º</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Almacén</th>
            <th>Registrada por</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {pagina?.data.map((c) => (
            <tr key={c.id}>
              <td>{c.numero}</td>
              <td>{new Date(c.created_at).toLocaleString('es-PE')}</td>
              <td>{c.proveedor.nombre}</td>
              <td>{c.almacen.nombre}</td>
              <td>{c.usuario.name}</td>
              <td>{MONEDA} {c.total}</td>
            </tr>
          ))}
          {pagina && pagina.data.length === 0 && (
            <tr><td colSpan={6}>Todavía no hay compras.</td></tr>
          )}
        </tbody>
      </table>

      {pagina && (
        <div className="paginacion">
          <button disabled={numero <= 1} onClick={() => setNumero(numero - 1)}>Anterior</button>
          <span>Página {pagina.current_page} de {pagina.last_page} · {pagina.total} compras</span>
          <button disabled={numero >= pagina.last_page} onClick={() => setNumero(numero + 1)}>Siguiente</button>
        </div>
      )}
    </>
  )
}