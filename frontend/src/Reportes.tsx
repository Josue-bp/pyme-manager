import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, MONEDA } from './api'

type Consumo = { producto: string; cantidad: number }
type VentaDia = { dia: string; total: number }

export default function Reportes() {
  const [dias, setDias] = useState('30')
  const [consumo, setConsumo] = useState<Consumo[]>([])
  const [ventas, setVentas] = useState<VentaDia[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api<Consumo[]>(`/reportes/consumo?dias=${dias}`)
      .then(setConsumo)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error inesperado'))

    api<VentaDia[]>(`/reportes/ventas-por-dia?dias=${dias}`)
      .then(setVentas)
      .catch(() => {})
  }, [dias])

  return (
    <>
      <h1>Reportes</h1>

      <div className="barra">
        <select value={dias} onChange={(e) => setDias(e.target.value)}>
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="graficos">
        <section className="tarjeta grafico">
          <h2>Productos más consumidos</h2>
          {consumo.length === 0 ? (
            <p>Sin datos en este período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="producto" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" name="Unidades" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        <section className="tarjeta grafico">
          <h2>Ventas por día</h2>
          {ventas.length === 0 ? (
            <p>Sin ventas en este período.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventas}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip formatter={(valor) => `${MONEDA} ${Number(valor).toFixed(2)}`} />
                <Bar dataKey="total" name="Ventas" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>
    </>
  )
}