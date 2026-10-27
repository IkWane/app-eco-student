import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, ApiError } from '../api/client.ts'
import { clearToken, getToken, setToken } from '../api/token.ts'
import {
  AuthContext,
  type AuthContextValue,
  type AuthUser,
  type LoginValues,
  type RegisterValues,
} from './auth-context.ts'

type AuthResponse = { token: string; user: AuthUser }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(() => getToken() !== null)

  // Au chargement : si un token est stocké, on récupère l'utilisateur correspondant.
  useEffect(() => {
    if (!getToken()) return
    const controller = new AbortController()

    api<{ user: AuthUser }>('/auth/me', { signal: controller.signal })
      .then((response) => setUser(response.user))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        // Token expiré ou compte supprimé : on repart d'une session vide.
        if (error instanceof ApiError && error.status === 401) {
          clearToken()
          setTokenState(null)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const startSession = useCallback((response: AuthResponse) => {
    setToken(response.token)
    setTokenState(response.token)
    setUser(response.user)
  }, [])

  const login = useCallback(
    async (values: LoginValues) => {
      startSession(await api<AuthResponse>('/auth/login', { method: 'POST', body: values }))
    },
    [startSession],
  )

  const register = useCallback(
    async (values: RegisterValues) => {
      startSession(await api<AuthResponse>('/auth/register', { method: 'POST', body: values }))
    },
    [startSession],
  )

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
