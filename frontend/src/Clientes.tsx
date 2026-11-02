import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { api, type Usuario } from './api'
import FormularioCliente, { type Cliente } from './FormularioCliente'

type Pagina = {
  data: Cliente[]
  current_page: number
  last_page: number
  total: number
}

export default function Clientes() {
  const usuario = useOutletContext<Usuario>()
  const puedeEditar = usuario.role === 'administrador' || usuario.role === 'vendedor'

  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [buscar, setBuscar] = useState('')
  const [numero, setNumero] = useState(1)
  const [recarga, setRecarga] = useState(0)
  // null = formulario cerrado; { cliente: null } = nuevo; { cliente } = editar
  const [formulario, setFormulario] = useState<{ cliente: Cliente | null } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Pagina>(`/clientes?page=${numero}&buscar=${encodeURIComponent(buscar)}`)
      .then(setPagina)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error inesperado'))
  }, [numero, buscar, recarga])

  function guardado() {
    setFormulario(null)
    setRecarga((n) => n + 1)
  }

  return (
    <>
      <h1>Clientes</h1>

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
          <button className="boton" onClick={() => setFormulario({ cliente: null })}>
            + Nuevo cliente
          </button>
        )}
      </div>

      {formulario && (
        <FormularioCliente
          key={formulario.cliente?.id ?? 'nuevo'}
          cliente={formulario.cliente}
          alGuardar={guardado}
          alCancelar={() => setFormulario(null)}
        />
      )}

      {error && <p className="error">{error}</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Teléfono</th>
            <th>Correo</th>
            {puedeEditar && <th></th>}
          </tr>
        </thead>
        <tbody>
          {pagina?.data.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.documento ?? '—'}</td>
              <td>{c.telefono ?? '—'}</td>
              <td>{c.email ?? '—'}</td>
              {puedeEditar && (
                <td>
                  <button onClick={() => setFormulario({ cliente: c })}>Editar</button>
                </td>
              )}
            </tr>
          ))}
          {pagina && pagina.data.length === 0 && (
            <tr><td colSpan={5}>No hay clientes.</td></tr>
          )}
        </tbody>
      </table>

      {pagina && (
        <div className="paginacion">
          <button disabled={numero <= 1} onClick={() => setNumero(numero - 1)}>Anterior</button>
          <span>Página {pagina.current_page} de {pagina.last_page} · {pagina.total} clientes</span>
          <button disabled={numero >= pagina.last_page} onClick={() => setNumero(numero + 1)}>Siguiente</button>
        </div>
      )}
    </>
  )
}