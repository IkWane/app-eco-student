import { NavLink, Outlet, type NavLinkRenderProps } from 'react-router'
import { useAuth } from '../auth/useAuth.ts'
import { Icon, type IconName } from './Icon.tsx'

type NavItem = { to: string; label: string; icon: IconName; end?: boolean }

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Tableau de bord', icon: 'chart', end: true },
  { to: '/expenses', label: 'Dépenses', icon: 'receipt' },
  { to: '/categories', label: 'Catégories', icon: 'tag' },
]

export function Layout() {
  const { logout } = useAuth()

  return (
    <>
      <header className="app-header">
        <NavLink to="/" className="app-brand">
          <span className="app-brand-badge">
            <Icon name="wallet" size={18} />
          </span>
          Budget étudiant
        </NavLink>
        <nav className="app-nav" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className={({ isActive }: NavLinkRenderProps) => `app-nav-link${isActive ? ' is-active' : ''}`}
            >
              <Icon name={item.icon} />
              <span className="app-nav-label">{item.label}</span>
            </NavLink>
          ))}
          <button type="button" className="bu-btn bu-btn-ghost app-logout" onClick={logout} aria-label="Se déconnecter">
            <Icon name="logout" />
            <span className="app-nav-label">Déconnexion</span>
          </button>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  )
}
