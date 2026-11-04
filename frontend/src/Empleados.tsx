import { useEffect, useState } from 'react'
import { api } from './api'
import FormularioEmpleado, { type Empleado } from './FormularioEmpleado'

type Pagina = {
  data: Empleado[]
  current_page: number
  last_page: number
  total: number
}

export default function Empleados() {
  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [buscar, setBuscar] = useState('')
  const [numero, setNumero] = useState(1)
  const [recarga, setRecarga] = useState(0)
  // null = cerrado; { empleado: null } = nuevo; { empleado } = editar
  const [formulario, setFormulario] = useState<{ empleado: Empleado | null } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api<Pagina>(`/empleados?page=${numero}&buscar=${encodeURIComponent(buscar)}`)
      .then(setPagina)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error inesperado'))
  }, [numero, buscar, recarga])

  function guardado() {
    setFormulario(null)
    setRecarga((n) => n + 1)
  }

  return (
    <>
      <h1>Recursos humanos</h1>

      <div className="barra">
        <input
          placeholder="Buscar por nombre, documento o cargo…"
          value={buscar}
          onChange={(e) => {
            setBuscar(e.target.value)
            setNumero(1)
          }}
        />
        <button className="boton" onClick={() => setFormulario({ empleado: null })}>
          + Nuevo empleado
        </button>
      </div>

      {formulario && (
        <FormularioEmpleado
          key={formulario.empleado?.id ?? 'nuevo'}
          empleado={formulario.empleado}
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
            <th>Cargo</th>
            <th>Ingreso</th>
            <th>Usuario</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pagina?.data.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.nombre}</td>
              <td>{emp.documento}</td>
              <td>{emp.cargo}</td>
              <td>{new Date(`${emp.fecha_ingreso}T00:00:00`).toLocaleDateString('es-PE')}</td>
              <td>{emp.usuario ? `${emp.usuario.name} (${emp.usuario.role})` : '—'}</td>
              <td>
                <span className={emp.activo ? 'estado estado-ok' : 'estado estado-bajo'}>
                  {emp.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <button onClick={() => setFormulario({ empleado: emp })}>Editar</button>
              </td>
            </tr>
          ))}
          {pagina && pagina.data.length === 0 && (
            <tr><td colSpan={7}>No hay empleados.</td></tr>
          )}
        </tbody>
      </table>

      {pagina && (
        <div className="paginacion">
          <button disabled={numero <= 1} onClick={() => setNumero(numero - 1)}>Anterior</button>
          <span>Página {pagina.current_page} de {pagina.last_page} · {pagina.total} empleados</span>
          <button disabled={numero >= pagina.last_page} onClick={() => setNumero(numero + 1)}>Siguiente</button>
        </div>
      )}
    </>
  )
}