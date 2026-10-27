import { getToken } from './token.ts'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '')

// Détail d'une erreur de validation renvoyée par l'API : { path, message }.
export type ApiErrorDetail = { path: string; message: string }

// Erreur remontée par l'API au format { error: { message, details } }.
export class ApiError extends Error {
  status: number
  details: ApiErrorDetail[]

  constructor(status: number, message: string, details: ApiErrorDetail[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type QueryValue = string | number | undefined

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, QueryValue>
  signal?: AbortSignal
}

const buildUrl = (path: string, query?: Record<string, QueryValue>): string => {
  const url = `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
  if (!query) return url
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `${url}?${search}` : url
}

// Wrapper de fetch : ajoute le token, sérialise le JSON et convertit les erreurs en ApiError.
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, 'Impossible de joindre le serveur. Vérifie ta connexion.')
  }

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const error = payload?.error
    throw new ApiError(
      response.status,
      error?.message ?? 'Une erreur est survenue.',
      Array.isArray(error?.details) ? error.details : [],
    )
  }

  return payload as T
}
