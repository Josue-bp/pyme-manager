import { useEffect, useState } from 'react'
import { api, MONEDA } from './api'
import FormularioVenta from './FormularioVenta'

type Venta = {
  id: number
  numero: string
  total: string
  created_at: string
  cliente: { id: number; nombre: string } | null
  almacen: { id: number; nombre: string }
  usuario: { id: number; name: string }
}

type Pagina = {
  data: Venta[]
  current_page: number
  last_page: number
  total: number
}

export default function Ventas() {
  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [numero, setNumero] = useState(1)
  const [recarga, setRecarga] = useState(0)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Pagina>(`/ventas?page=${numero}`)
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
      <h1>Ventas</h1>

      <div className="barra">
        <button className="boton" onClick={() => setMostrarForm(true)}>
          + Nueva venta
        </button>
      </div>

      {mostrarForm && (
        <FormularioVenta alGuardar={guardado} alCancelar={() => setMostrarForm(false)} />
      )}

      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Comprobante</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Almacén</th>
            <th>Vendedor</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {pagina?.data.map((v) => (
            <tr key={v.id}>
              <td>{v.numero}</td>
              <td>{new Date(v.created_at).toLocaleString('es-PE')}</td>
              <td>{v.cliente?.nombre ?? 'Cliente general'}</td>
              <td>{v.almacen.nombre}</td>
              <td>{v.usuario.name}</td>
              <td>{MONEDA} {v.total}</td>
            </tr>
          ))}
          {pagina && pagina.data.length === 0 && (
            <tr><td colSpan={6}>Todavía no hay ventas.</td></tr>
          )}
        </tbody>
      </table>

      {pagina && (
        <div className="paginacion">
          <button disabled={numero <= 1} onClick={() => setNumero(numero - 1)}>Anterior</button>
          <span>Página {pagina.current_page} de {pagina.last_page} · {pagina.total} ventas</span>
          <button disabled={numero >= pagina.last_page} onClick={() => setNumero(numero + 1)}>Siguiente</button>
        </div>
      )}
    </>
  )
}