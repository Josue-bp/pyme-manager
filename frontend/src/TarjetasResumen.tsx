import { useEffect, useState } from 'react'
import { api, MONEDA } from './api'

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
        <span>Productos</span>
        <strong>{resumen.total_productos}</strong>
        <small>Total en catálogo</small>
      </div>

      <div className="dato">
        <span>Bajo mínimo</span>
        <strong className="texto-rojo">{resumen.bajo_minimo}</strong>
        <small>Productos</small>
      </div>

      <div className="dato">
        <span>Valor total</span>
        <strong className="texto-verde">{MONEDA} {valor}</strong>
        <small>Valor del inventario</small>
      </div>
    </div>
  )
}