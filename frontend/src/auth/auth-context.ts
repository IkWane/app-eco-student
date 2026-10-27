import { createContext } from 'react'
import type { z } from 'zod'
import type { loginSchema, registerSchema } from '@eco/shared'

export type AuthUser = { id: number; email: string }

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>

export type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  // true tant qu'on vérifie auprès de l'API le token retrouvé dans le localStorage.
  loading: boolean
  login: (values: LoginValues) => Promise<void>
  register: (values: RegisterValues) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
