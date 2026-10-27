import type { ReactNode } from 'react'
import { Icon } from './Icon.tsx'

type NoticeProps = {
  tone?: 'info' | 'warn' | 'danger'
  title: string
  children?: ReactNode
}

// Bandeau d'information : toujours une icône et un titre.
export function Notice({ tone = 'info', title, children }: NoticeProps) {
  const toneClass = tone === 'info' ? '' : ` bu-notice-${tone}`
  return (
    <div className={`bu-notice${toneClass}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon name={tone === 'info' ? 'info' : 'alert'} />
      <div>
        <p className="bu-notice-title">{title}</p>
        {children ? <p className="bu-notice-text">{children}</p> : null}
      </div>
    </div>
  )
}
