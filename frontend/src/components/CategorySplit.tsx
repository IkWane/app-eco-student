import type { CategoryTotal } from '../api/stats.ts'
import { formatEuro } from '../lib/format.ts'

type CategorySplitProps = {
  totals: CategoryTotal[]
}

// Répartition du mois : barre empilée + légende, avec la couleur de chaque catégorie.
// Seules les catégories dépensées sont affichées, de la plus grosse à la plus petite.
export function CategorySplit({ totals }: CategorySplitProps) {
  const spent = totals.filter((item) => item.total > 0).sort((a, b) => b.total - a.total)
  const sumCents = spent.reduce((sum, item) => sum + Math.round(item.total * 100), 0)

  return (
    <section className="bu-card" aria-labelledby="dash-split-title">
      <h2 id="dash-split-title" className="bu-card-title">
        Répartition par catégorie
      </h2>
      {spent.length === 0 ? (
        <p className="bu-muted body-sm">Aucune dépense ce mois-ci.</p>
      ) : (
        <>
          <div className="bu-split-bar" aria-hidden="true">
            {spent.map((item) => (
              <span
                key={item.categoryId}
                style={{ flexGrow: Math.round(item.total * 100), background: item.color }}
              />
            ))}
          </div>
          <ul className="bu-split-legend">
            {spent.map((item) => {
              const percent = Math.round((Math.round(item.total * 100) / sumCents) * 100)
              return (
                <li key={item.categoryId}>
                  <span className="bu-dot" style={{ background: item.color }} aria-hidden="true" />
                  <span>{item.name}</span>
                  <span className="bu-split-pct">{percent} %</span>
                  <span className="bu-split-amt">{formatEuro(item.total)}</span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}
