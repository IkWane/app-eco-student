import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getCategoryTotals, getMonthlyTotals } from '../api/stats.ts'
import type { CategoryTotal, MonthlyTotal } from '../api/stats.ts'
import { CategorySplit } from '../components/CategorySplit.tsx'
import { EmptyState } from '../components/EmptyState.tsx'
import { MonthlyChart } from '../components/MonthlyChart.tsx'
import { MonthPicker } from '../components/MonthPicker.tsx'
import { Notice } from '../components/Notice.tsx'
import { currentMonth, formatEuro, formatMonth } from '../lib/format.ts'

const MONTHS = 6

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

// Additionne en centimes pour éviter les erreurs d'arrondi (0,1 + 0,2).
const sumEuros = (values: number[]): number =>
  values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100

export function DashboardPage() {
  const [month, setMonth] = useState(currentMonth)
  const [monthly, setMonthly] = useState<MonthlyTotal[] | null>(null)
  const [byCategory, setByCategory] = useState<CategoryTotal[] | null>(null)
  // Mois de la dernière répartition reçue : tant qu'il diffère du mois choisi, on charge.
  const [loadedMonth, setLoadedMonth] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Les 6 derniers mois ne dépendent pas du mois choisi : un seul chargement.
  useEffect(() => {
    const controller = new AbortController()
    getMonthlyTotals(MONTHS, controller.signal)
      .then(setMonthly)
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(err, "Impossible de charger l'historique."))
      })
    return () => controller.abort()
  }, [])

  // La répartition suit le mois choisi.
  useEffect(() => {
    const controller = new AbortController()
    getCategoryTotals(month, controller.signal)
      .then((totals) => {
        setByCategory(totals)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(errorMessage(err, 'Impossible de charger la répartition.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedMonth(month)
      })
    return () => controller.abort()
  }, [month])

  const loading = monthly === null || byCategory === null || loadedMonth !== month
  const monthTotal = sumEuros((byCategory ?? []).map((item) => item.total))
  // Nouvel utilisateur : rien sur toute la période affichée, ni sur le mois choisi.
  const isEmpty = !loading && monthTotal === 0 && (monthly ?? []).every((item) => item.total === 0)

  return (
    <>
      <header className="page-head">
        <h1 className="title-lg">Tableau de bord</h1>
        <MonthPicker month={month} onChange={setMonth} />
      </header>

      {error ? (
        <Notice tone="danger" title="Données indisponibles">
          {error}
        </Notice>
      ) : null}

      {loading && !error ? (
        <p className="bu-muted dash-loading" role="status">
          Chargement du tableau de bord…
        </p>
      ) : null}

      {isEmpty ? (
        <EmptyState
          title="Ton tableau de bord est vide"
          action={
            <Link to="/expenses" className="bu-btn bu-btn-primary">
              Ajoute ta première dépense
            </Link>
          }
        >
          Dès ta première dépense, tu verras ici ton total du mois, sa répartition et l&apos;évolution sur 6 mois.
        </EmptyState>
      ) : null}

      {!loading && !isEmpty ? (
        <div className="dash-grid">
          <section className="bu-card" aria-labelledby="dash-total-title">
            <h2 id="dash-total-title" className="bu-total-label">
              Total du mois · {formatMonth(month)}
            </h2>
            <p className="amount-xl bu-total-amount">{formatEuro(monthTotal)}</p>
          </section>

          <CategorySplit totals={byCategory ?? []} />

          <MonthlyChart data={monthly ?? []} selectedMonth={month} />
        </div>
      ) : null}
    </>
  )
}
