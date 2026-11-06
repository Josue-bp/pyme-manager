import { Component, type ReactNode } from 'react'

type Estado = { error: Error | null }

export default class ErrorPantalla extends Component<{ children: ReactNode }, Estado> {
  state: Estado = { error: null }

  static getDerivedStateFromError(error: Error): Estado {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main style={{ maxWidth: 720, margin: '60px auto', padding: 16, fontFamily: 'system-ui', color: '#e8edf8' }}>
        <h1>Algo falló al mostrar la página</h1>
        <pre style={{ whiteSpace: 'pre-wrap', color: '#ff7b7b' }}>{this.state.error.message}</pre>
        <pre style={{ whiteSpace: 'pre-wrap', opacity: 0.7, fontSize: 12 }}>{this.state.error.stack}</pre>
      </main>
    )
  }
}