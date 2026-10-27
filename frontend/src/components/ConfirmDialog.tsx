import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon.tsx'

type ConfirmDialogProps = {
  title: string
  children: ReactNode
  confirmLabel: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Boîte de confirmation : focus sur « Annuler » à l'ouverture, Échap annule.
export function ConfirmDialog({ title, children, confirmLabel, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    cancelRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  return (
    <div className="bu-backdrop">
      <div className="bu-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 className="title-md" id="confirm-title">
          {title}
        </h2>
        <p className="bu-dialog-text">{children}</p>
        <div className="bu-dialog-actions">
          <button ref={cancelRef} type="button" className="bu-btn bu-btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="button" className="bu-btn bu-btn-danger" disabled={busy} onClick={onConfirm}>
            <Icon name="trash" size={18} />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
