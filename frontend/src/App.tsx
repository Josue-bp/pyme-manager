import { useEffect, useState } from 'react'

type Ping = { mensaje: string; hora: string }

function App() {
  const [data, setData] = useState<Ping | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/ping')
      .then((res) => {
        if (!res.ok) throw new Error('Error de API')
        return res.json()
      })
      .then(setData)
      .catch(() => setError(true))
  }, [])

  return (
    <main>
      <h1>PyME Manager</h1>
      {error && <p>No se pudo conectar con la API</p>}
      {data && <p>{data.mensaje}</p>}
      {!error && !data && <p>Conectando…</p>}
    </main>
  )
}

export default App