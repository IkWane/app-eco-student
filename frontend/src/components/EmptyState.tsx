import type { ReactNode } from 'react'
import { Icon } from './Icon.tsx'

type EmptyStateProps = {
  title: string
  children: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="bu-empty">
      <div className="bu-empty-icon">
        <Icon name="wallet" size={28} />
      </div>
      <p className="title-md">{title}</p>
      <p className="bu-empty-text">{children}</p>
      {action}
    </div>
  )
}
