import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { api, borrarToken, obtenerToken, type Usuario } from './api'
import Layout from './Layout'
import Login from './Login'
import Pagina from './Pagina'
import './App.css'
import Inventario from './Inventario'
import Movimientos from './Movimientos'
import Clientes from './Clientes'
import Ventas from './Ventas'

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(Boolean(obtenerToken()))

  useEffect(() => {
    if (!obtenerToken()) return

    api<Usuario>('/me')
      .then(setUsuario)
      .catch(() => borrarToken())
      .finally(() => setCargando(false))
  }, [])

  async function cerrarSesion() {
    try {
      await api('/logout', { method: 'POST' })
    } finally {
      borrarToken()
      setUsuario(null)
    }
  }

  if (cargando) {
    return <main className="pantalla"><p>Cargando…</p></main>
  }

  if (!usuario) {
    return (
      <main className="pantalla">
        <Login alIniciarSesion={setUsuario} />
      </main>
    )
  }

return (
  <Routes>
    <Route element={<Layout usuario={usuario} alCerrarSesion={cerrarSesion} />}>
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/compras" element={<Pagina titulo="Compras" />} />
      <Route path="/rrhh" element={<Pagina titulo="RRHH" />} />
      <Route path="*" element={<Navigate to="/inventario" replace />} />
      <Route path="/movimientos" element={<Movimientos />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/ventas" element={<Ventas />} />
    </Route>
  </Routes>
)
}

export default App