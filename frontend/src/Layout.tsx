import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import type { Usuario } from './api'
import {
  IconoCaja,
  IconoClientes,
  IconoCompras,
  IconoMovimientos,
  IconoProveedores,
  IconoReportes,
  IconoRRHH,
  IconoSalir,
  IconoVentas,
  Marca,
} from './iconos'

type Props = {
  usuario: Usuario
  alCerrarSesion: () => void
}

function Enlace({ a, icono, children }: { a: string; icono: ReactNode; children: string }) {
  return (
    <NavLink to={a} title={children}>
      {icono}
      <span>{children}</span>
    </NavLink>
  )
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export default function Layout({ usuario, alCerrarSesion }: Props) {
  const esAdmin = usuario.role === 'administrador'
  const puedeVender = esAdmin || usuario.role === 'vendedor'
  const puedeAbastecer = esAdmin || usuario.role === 'almacen'

  return (
    <div className="app">
      <aside className="menu">
        <div className="menu-logo">
          <Marca />
          <span>PyME Manager</span>
        </div>

        <nav>
          <div className="menu-seccion">Inventario</div>
          <Enlace a="/inventario" icono={<IconoCaja />}>Inventario</Enlace>
          <Enlace a="/movimientos" icono={<IconoMovimientos />}>Movimientos</Enlace>
          {puedeAbastecer && <Enlace a="/compras" icono={<IconoCompras />}>Compras</Enlace>}
          {puedeAbastecer && <Enlace a="/proveedores" icono={<IconoProveedores />}>Proveedores</Enlace>}

          <div className="menu-seccion">Comercial</div>
          {puedeVender && <Enlace a="/ventas" icono={<IconoVentas />}>Ventas</Enlace>}
          <Enlace a="/clientes" icono={<IconoClientes />}>Clientes</Enlace>

          {esAdmin && <div className="menu-seccion">Administración</div>}
          {esAdmin && <Enlace a="/reportes" icono={<IconoReportes />}>Reportes</Enlace>}
          {esAdmin && <Enlace a="/rrhh" icono={<IconoRRHH />}>RRHH</Enlace>}
        </nav>

        <div className="menu-usuario">
          <div className="menu-avatar">{iniciales(usuario.name)}</div>
          <div className="menu-datos">
            <strong>{usuario.name}</strong>
            <span>{usuario.role}</span>
          </div>
          <button onClick={alCerrarSesion} title="Cerrar sesión" aria-label="Cerrar sesión">
            <IconoSalir />
          </button>
        </div>
      </aside>

      <section className="contenido">
        <Outlet context={{ usuario }} />      </section>
    </div>
  )
}