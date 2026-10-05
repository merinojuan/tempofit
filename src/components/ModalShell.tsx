import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface ModalShellProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function ModalShell({ open, onClose, children }: ModalShellProps) {
  if (!open) return null

  return createPortal(
    <div className="modal modal-open" role="dialog" aria-modal="true">
      <div className="modal-box max-w-sm">{children}</div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>,
    document.body,
  )
}
