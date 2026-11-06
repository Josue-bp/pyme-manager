import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ErrorPantalla from './ErrorPantalla.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorPantalla>
        <App />
      </ErrorPantalla>
    </BrowserRouter>
  </StrictMode>,
)