import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api, type Usuario } from './api'
import FormularioProveedor, { type Proveedor } from './FormularioProveedor'

type Pagina = {
  data: Proveedor[]
  current_page: number
  last_page: number
  total: number
}

export default function Proveedores() {
  const usuario = useOutletContext<Usuario>()
  const puedeEditar = usuario.role === 'administrador' || usuario.role === 'almacen'

  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [buscar, setBuscar] = useState('')
  const [numero, setNumero] = useState(1)
  const [recarga, setRecarga] = useState(0)
  const [formulario, setFormulario] = useState<{ proveedor: Proveedor | null } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Pagina>(`/proveedores?page=${numero}&buscar=${encodeURIComponent(buscar)}`)
      .then(setPagina)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error inesperado'))
  }, [numero, buscar, recarga])

  function guardado() {
    setFormulario(null)
    setRecarga((n) => n + 1)
  }

  return (
    <>
      <h1>Proveedores</h1>

      <div className="barra">
        <input
          placeholder="Buscar por nombre o documento…"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value)
            setNumero(1)
          }}
        />
        {puedeEditar && (
          <button className="boton" onClick={() => setFormulario({ proveedor: null })}>
            + Nuevo proveedor
          </button>
        )}
      </div>

      {formulario && (
        <FormularioProveedor
          key={formulario.proveedor?.id ?? 'nuevo'}
          proveedor={formulario.proveedor}
          alGuardar={guardado}
          alCancelar={() => setFormulario(null)}
        />
      )}

      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Documento</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Estado</th>
            {puedeEditar && <th></th>}
          </tr>
        </thead>
        <tbody>
          {pagina?.data.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.documento ?? '—'}</td>
              <td>{p.contacto ?? '—'}</td>
              <td>{p.telefono ?? '—'}</td>
              <td>
                <span className={p.activo ? 'estado estado-ok' : 'estado estado-bajo'}>
                  {p.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              {puedeEditar && (
                <td>
                  <button onClick={() => setFormulario({ proveedor: p })}>Editar</button>
                </td>
              )}
            </tr>
          ))}
          {pagina && pagina.data.length === 0 && (
            <tr><td colSpan={6}>No hay proveedores.</td></tr>
          )}
        </tbody>
      </table>

      {pagina && (
        <div className="paginacion">
          <button disabled={numero <= 1} onClick={() => setNumero(numero - 1)}>Anterior</button>
          <span>Página {pagina.current_page} de {pagina.last_page} · {pagina.total} proveedores</span>
          <button disabled={numero >= pagina.last_page} onClick={() => setNumero(numero + 1)}>Siguiente</button>
        </div>
      )}
    </>
  )
}