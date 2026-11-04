    import { NavLink, Outlet } from 'react-router-dom'
import type { Usuario } from './api'

type Props = {
  usuario: Usuario
  alCerrarSesion: () => void
}

export default function Layout({ usuario, alCerrarSesion }: Props) {
  return (
    <div className="app">
      <aside className="menu">
        <div className="menu-logo">PyME Manager</div>

        <nav>
          <NavLink to="/inventario">Inventario</NavLink>
          <NavLink to="/compras">Compras</NavLink>
          <NavLink to="/movimientos">Movimientos</NavLink>
          <NavLink to="/clientes">Clientes</NavLink>
          {(usuario.role === 'administrador' || usuario.role === 'vendedor') && (
  <NavLink to="/ventas">Ventas</NavLink>
)}
          {usuario.role === 'administrador' && <NavLink to="/reportes">Reportes</NavLink>}
          {usuario.role === 'administrador' && <NavLink to="/rrhh">RRHH</NavLink>}
          {(usuario.role === 'administrador' || usuario.role === 'almacen') && (
            <NavLink to="/proveedores">Proveedores</NavLink>
          )}
          {(usuario.role === 'administrador' || usuario.role === 'almacen') && (
          <NavLink to="/compras">Compras</NavLink>
          )}
        </nav>

        <div className="menu-usuario">
          <strong>{usuario.name}</strong>
          <span>{usuario.role}</span>
          <button onClick={alCerrarSesion}>Cerrar sesión</button>
        </div>
      </aside>

      <section className="contenido">
      <Outlet context={usuario} />
      </section>
    </div>
  )
}