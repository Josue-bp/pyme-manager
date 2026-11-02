import { useState, type FormEvent } from 'react'
import { api, guardarToken, type Usuario } from './api'

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
    <form className="tarjeta" onSubmit={enviar}>
      <h1>PyME Manager</h1>
      <p>Inicia sesión para continuar</p>

      <label>
        Correo
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>

      <label>
        Contraseña
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={cargando}>
        {cargando ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}