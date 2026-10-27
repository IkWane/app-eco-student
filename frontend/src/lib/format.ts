const euroFormat = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const dayFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const monthFormat = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

// Montant en euros → « 12,50 € ».
export const formatEuro = (amount: number): string => euroFormat.format(amount)

const pad = (value: number): string => String(value).padStart(2, '0')

const toDate = (isoDay: string): Date => {
  const [year, month, day] = isoDay.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// « 2026-10-24 » → « 24 oct. ».
export const formatDay = (isoDay: string): string => dayFormat.format(toDate(isoDay))

// Date du jour au format YYYY-MM-DD (fuseau local, pas UTC).
export const todayIso = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Mois courant au format YYYY-MM.
export const currentMonth = (): string => todayIso().slice(0, 7)

// « 2026-10 » + 1 → « 2026-11 ».
export const shiftMonth = (month: string, delta: number): string => {
  const [year, index] = month.split('-').map(Number)
  const date = new Date(year, index - 1 + delta, 1)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

// « 2026-10 » → « Octobre 2026 ».
export const formatMonth = (month: string): string => {
  const [year, index] = month.split('-').map(Number)
  const label = monthFormat.format(new Date(year, index - 1, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

// Saisie libre (« 12,5 ») → nombre. Renvoie NaN si ce n'est pas un nombre.
export const parseAmount = (input: string): number => {
  const normalized = input.trim().replace(',', '.')
  return normalized === '' ? Number.NaN : Number(normalized)
}
