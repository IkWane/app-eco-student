import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyTotal } from '../api/stats.ts'
import { formatEuro, formatMonth } from '../lib/format.ts'

type MonthlyChartProps = {
  data: MonthlyTotal[]
  // Mois mis en avant (YYYY-MM), en général celui choisi dans le sélecteur.
  selectedMonth: string
}

const shortMonth = new Intl.DateTimeFormat('fr-FR', { month: 'short' })

// « 2026-10 » → « oct. » (le 1er du mois en heure locale : pas de décalage de fuseau).
const monthTick = (month: string): string => {
  const [year, index] = month.split('-').map(Number)
  return shortMonth.format(new Date(year, index - 1, 1))
}

// Graphique en barres des derniers mois. Les couleurs viennent des tokens CSS,
// donc le thème clair / sombre s'applique aussi au SVG de Recharts.
export function MonthlyChart({ data, selectedMonth }: MonthlyChartProps) {
  const summary = data.map((item) => `${formatMonth(item.month)} : ${formatEuro(item.total)}`).join(', ')

  return (
    <section className="bu-card dash-chart" aria-labelledby="dash-chart-title">
      <h2 id="dash-chart-title" className="bu-card-title">
        Les {data.length} derniers mois
      </h2>
      <div role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="month"
              tickFormatter={monthTick}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--ink-muted)', fontSize: 13 }}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => `${value} €`}
              tick={{ fill: 'var(--ink-muted)', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              formatter={(value) => [formatEuro(Number(value)), 'Total']}
              labelFormatter={(label) => formatMonth(String(label))}
              contentStyle={{
                background: 'var(--surface-1)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                color: 'var(--ink)',
              }}
            />
            <Bar dataKey="total" radius={[6, 6, 2, 2]} maxBarSize={40}>
              {data.map((item) => (
                <Cell key={item.month} fill={item.month === selectedMonth ? 'var(--brand)' : 'var(--line-strong)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
