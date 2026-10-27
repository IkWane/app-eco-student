import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth.ts'

// Entoure les routes privées : sans token, on renvoie vers /login en retenant la page demandée.
export function ProtectedRoute() {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="bu-muted auth-loading">Chargement…</p>
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
