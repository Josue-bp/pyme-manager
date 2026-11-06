import { useEffect, useState } from 'react'
import { api, MONEDA } from './api'
import { IconoAlerta, IconoCaja, IconoDinero } from './iconos'

type Resumen = {
  total_productos: number
  bajo_minimo: number
  valor_inventario: string
}

export default function TarjetasResumen({ recarga }: { recarga: number }) {
  const [resumen, setResumen] = useState<Resumen | null>(null)

  useEffect(() => {
    api<Resumen>('/resumen').then(setResumen).catch(() => {})
  }, [recarga])

  if (!resumen) return null

  const valor = Number(resumen.valor_inventario).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className="resumen">
      <div className="dato">
        <div className="dato-icono azul"><IconoCaja tam={22} /></div>
        <div className="dato-texto">
          <span>Productos</span>
          <strong>{resumen.total_productos}</strong>
          <small>Total en catálogo</small>
        </div>
      </div>

      <div className="dato">
        <div className="dato-icono rojo"><IconoAlerta tam={22} /></div>
        <div className="dato-texto">
          <span>Bajo mínimo</span>
          <strong className={resumen.bajo_minimo > 0 ? 'texto-rojo' : undefined}>{resumen.bajo_minimo}</strong>
          <small>Productos por reponer</small>
        </div>
      </div>

      <div className="dato">
        <div className="dato-icono verde"><IconoDinero tam={22} /></div>
        <div className="dato-texto">
          <span>Valor total</span>
          <strong>{MONEDA} {valor}</strong>
          <small>Valor del inventario</small>
        </div>
      </div>
    </div>
  )
}