import { useEffect, useState } from 'react'
import { api, borrarToken, obtenerToken, type Usuario } from './api'
import Login from './Login'
import './App.css'

function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(Boolean(obtenerToken()))

  // Si ya había un token guardado, comprueba que siga siendo válido
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

  if (cargando) return <main className="pantalla"><p>Cargando…</p></main>

  return (
    <main className="pantalla">
      {usuario ? (
        <section className="tarjeta">
          <h1>Hola, {usuario.name}</h1>
          <p>Rol: <strong>{usuario.role}</strong></p>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </section>
      ) : (
        <Login alIniciarSesion={setUsuario} />
      )}
    </main>
  )
}

export default App