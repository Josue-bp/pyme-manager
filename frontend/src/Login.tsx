import { useState, type FormEvent } from 'react'
import { api, guardarToken, type Usuario } from './api'
import { Marca } from './iconos'

type Props = { alIniciarSesion: (usuario: Usuario) => void }

export default function Login({ alIniciarSesion }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      const respuesta = await api<{ token: string; usuario: Usuario }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      guardarToken(respuesta.token)
      alIniciarSesion(respuesta.usuario)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login">
      <div className="login-marca">
        <div className="logo">
          <Marca />
          PyME Manager
        </div>
        <div>
          <h2>Tu negocio, en un solo lugar</h2>
          <p>Controla el stock, registra ventas y compras y conoce a tus clientes sin hojas de cálculo.</p>
        </div>
        <div className="login-modulos">
          <span>Inventario</span>
          <span>Ventas</span>
          <span>Compras</span>
          <span>Clientes</span>
          <span>RRHH</span>
        </div>
      </div>

      <form onSubmit={enviar}>
        <h1>Iniciar sesión</h1>
        <p>Ingresa con tu correo y contraseña.</p>

        <label>
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            placeholder="nombre@empresa.com"
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Entrando…' : 'Entrar'}
        </button>

        <div className="login-demo">
          <strong>Cuentas de demostración</strong>
          <br />
          admin@pyme.test · vendedor@pyme.test · almacen@pyme.test
          <br />
          Contraseña: password
        </div>
      </form>
    </div>
  )
}