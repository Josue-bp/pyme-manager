const TOKEN_KEY = 'token'

export type Usuario = {
  id: number
  name: string
  email: string
  role: string
}

export const guardarToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const obtenerToken = () => localStorage.getItem(TOKEN_KEY)
export const borrarToken = () => localStorage.removeItem(TOKEN_KEY)

export async function api<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = obtenerToken()

  const respuesta = await fetch(`/api${ruta}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  })

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    const primerError = datos.errors
      ? (Object.values(datos.errors)[0] as string[])[0]
      : undefined
    throw new Error(primerError ?? datos.message ?? 'Error de la API')
  }
  return datos as T
}