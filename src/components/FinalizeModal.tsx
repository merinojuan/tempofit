import { ModalShell } from './ModalShell'

interface FinalizeModalProps {
  open: boolean
  onKeepGoing: () => void
  onConfirm: () => void
}

export function FinalizeModal({ open, onKeepGoing, onConfirm }: FinalizeModalProps) {
  return (
    <ModalShell open={open} onClose={onKeepGoing}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-bold">¿Finalizar el entrenamiento?</h3>
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm"
          onClick={onKeepGoing}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
      <p className="py-4 text-sm opacity-80">Perderás el progreso de esta sesión.</p>
      <div className="modal-action">
        <button type="button" className="btn btn-soft" onClick={onKeepGoing}>
          Seguir
        </button>
        <button type="button" className="btn btn-error" onClick={onConfirm}>
          Finalizar
        </button>
      </div>
    </ModalShell>
  )
}
