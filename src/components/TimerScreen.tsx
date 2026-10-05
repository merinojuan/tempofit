import { useCallback, useEffect, useState } from 'react'
import { useSession } from '../hooks/useSession'
import type { TimerConfig } from '../types'
import type { Theme } from '../theme'
import { FinalizeModal } from './FinalizeModal'
import { ProgressRing } from './ProgressRing'

interface TimerScreenProps {
  config: TimerConfig
  onExit: () => void
  theme: Theme
}

const TRACK_DARK = '#1f2937'
const TRACK_LIGHT = '#d1d5db'

const PHASE_META = {
  preparation: {
    badge: 'PREPARACIÓN',
    label: 'COMENZANDO',
    accent: '#f59e0b',
    badgeClass: 'badge-warning badge-soft',
  },
  exercise: {
    badge: 'EJERCICIO',
    label: 'EJERCICIO',
    accent: '#22c55e',
    badgeClass: 'badge-success badge-soft',
  },
  rest: {
    badge: 'DESCANSO',
    label: 'DESCANSO',
    accent: '#ef4444',
    badgeClass: 'badge-error badge-soft',
  },
  done: {
    badge: 'COMPLETADO',
    label: 'COMPLETADO',
    accent: '#a78bfa',
    badgeClass: 'badge-primary badge-soft',
  },
} as const

export function TimerScreen({ config, onExit, theme }: TimerScreenProps) {
  const { state, togglePause, finalize } = useSession(config)
  const [modalOpen, setModalOpen] = useState(false)

  const meta = PHASE_META[state.phase]
  const trackColor = theme === 'dark' ? TRACK_DARK : TRACK_LIGHT
  const progress =
    state.phaseDuration > 0 ? (state.phaseDuration - state.timeLeft) / state.phaseDuration : 0

  const requestFinalize = useCallback(() => {
    if (state.phase === 'done') {
      onExit()
      return
    }
    setModalOpen(true)
  }, [state.phase, onExit])

  const confirmFinalize = useCallback(() => {
    setModalOpen(false)
    finalize()
    onExit()
  }, [finalize, onExit])

  const handlePauseToggle = useCallback(() => {
    if (state.phase === 'done') return
    togglePause()
  }, [state.phase, togglePause])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        handlePauseToggle()
      } else if (event.code === 'Escape') {
        event.preventDefault()
        requestFinalize()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlePauseToggle, requestFinalize])

  if (state.phase === 'done') {
    return (
      <div className="card card-border w-full bg-base-300/20 backdrop-blur-xs">
        <div className="card-body flex w-full flex-col items-center gap-8 text-center">
          <span className={`badge ${meta.badgeClass} gap-2 px-4 py-3`}>
            <span className="inline-block h-2 w-2 rounded-full bg-current" />
            {meta.badge}
          </span>
          <div>
            <h2 className="text-3xl font-bold">¡Completado!</h2>
            <p className="mt-2 opacity-70">Terminaste todas las rondas.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onExit}>
            Volver a configurar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card card-border w-full bg-base-300/20 backdrop-blur-xs">
      <div className="card-body flex w-full flex-col items-center gap-8 text-center">
        <span className={`badge ${meta.badgeClass} gap-2 px-4 py-3`}>
          <span className="inline-block h-2 w-2 rounded-full bg-current" />
          {meta.badge}
        </span>

        <div className="relative flex items-center justify-center">
          <ProgressRing
            progress={progress}
            size={240}
            stroke={14}
            color={meta.accent}
            trackColor={trackColor}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span
              className="text-7xl font-light leading-none"
              style={{ color: meta.accent }}
              aria-live="polite"
            >
              {state.timeLeft}
            </span>
            <span className="text-xs tracking-widest opacity-70">{meta.label}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          {state.phase === 'preparation' ? (
            <>
              <h2 className="text-xl font-bold tracking-wide">COMENZANDO</h2>
              <p className="text-lg opacity-80">Ronda {state.currentRound}</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">Ronda {state.currentRound} de {state.totalRounds}</h2>
              {state.phase === 'rest' && <p className="text-lg font-semibold opacity-90">Descansa</p>}
            </>
          )}

          <div className="mt-2 flex items-center justify-center gap-2">
            {Array.from({ length: state.totalRounds }).map((_, index) => {
              const roundNumber = index + 1
              let dotClass = 'bg-base-300'
              if (state.phase === 'exercise' && roundNumber === state.currentRound) {
                dotClass = 'bg-success'
              } else if (state.phase === 'rest' && roundNumber === state.currentRound) {
                dotClass = 'bg-error'
              } else if (roundNumber < state.currentRound || state.phase === 'done') {
                dotClass = 'bg-primary'
              }
              return (
                <span
                  key={roundNumber}
                  className={`inline-block h-2.5 w-2.5 rounded-full ${dotClass}`}
                />
              )
            })}
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <button
            type="button"
            className={`btn min-w-32 ${state.paused ? 'btn-primary' : 'btn-soft'}`}
            onClick={handlePauseToggle}
          >
            {state.paused ? 'Reanudar' : 'Pausar'}
          </button>
          <button type="button" className="btn btn-soft btn-error min-w-32" onClick={requestFinalize}>
            Finalizar
          </button>
        </div>
      </div>

      <FinalizeModal
        open={modalOpen}
        onKeepGoing={() => setModalOpen(false)}
        onConfirm={confirmFinalize}
      />
    </div>
  )
}
