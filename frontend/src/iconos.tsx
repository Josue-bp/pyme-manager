import type { ReactNode } from 'react'

// Iconos de línea (24x24) dibujados a mano. Heredan el color del texto.
function Svg({ children, tam = 18 }: { children: ReactNode; tam?: number }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

type P = { tam?: number }

export const IconoCaja = (p: P) => (
  <Svg {...p}>
    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </Svg>
)

export const IconoMovimientos = (p: P) => (
  <Svg {...p}>
    <path d="M7 4v14" />
    <path d="M3 14l4 4 4-4" />
    <path d="M17 20V6" />
    <path d="M13 10l4-4 4 4" />
  </Svg>
)

export const IconoCompras = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h3l2.4 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6" />
  </Svg>
)

export const IconoProveedores = (p: P) => (
  <Svg {...p}>
    <path d="M3 7h11v9H3z" />
    <path d="M14 10h4l3 3v3h-7" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </Svg>
)

export const IconoVentas = (p: P) => (
  <Svg {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
  </Svg>
)

export const IconoClientes = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
    <path d="M18 14.3c1.8.8 3 2.6 3 4.7" />
  </Svg>
)

export const IconoReportes = (p: P) => (
  <Svg {...p}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </Svg>
)

export const IconoRRHH = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
    <path d="M3 13h18" />
  </Svg>
)

export const IconoSalir = (p: P) => (
  <Svg {...p}>
    <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
    <path d="M16 8l4 4-4 4" />
    <path d="M20 12H9" />
  </Svg>
)

export const IconoAlerta = (p: P) => (
  <Svg {...p}>
    <path d="M12 3l10 18H2L12 3z" />
    <path d="M12 10v5" />
    <path d="M12 18h.01" />
  </Svg>
)

export const IconoDinero = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.8 9.2c-.4-1-1.4-1.6-2.8-1.6-1.6 0-2.8.8-2.8 2s1 1.7 2.8 2.1c1.8.4 2.8 1 2.8 2.2s-1.2 2-2.8 2c-1.5 0-2.5-.7-2.9-1.8" />
    <path d="M12 6v1.6M12 16.4V18" />
  </Svg>
)

// Marca de PyME Manager: tres cajas apiladas
export function Marca({ tam = 32 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--primario)" />
      <rect x="7" y="7" width="18" height="5" rx="1.6" fill="var(--sobre-primario)" />
      <rect x="7" y="14" width="11" height="5" rx="1.6" fill="var(--sobre-primario)" opacity=".8" />
      <rect x="7" y="21" width="15" height="4" rx="1.6" fill="var(--sobre-primario)" opacity=".55" />
    </svg>
  )
}