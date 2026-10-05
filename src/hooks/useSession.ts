import { useCallback, useEffect, useRef, useState } from 'react'
import { pauseBeep, playBeep, resumeBeep, stopBeep } from '../audio'
import type { SessionState, TimerConfig } from '../types'

const PREPARATION_SECONDS = 10
const WARNING_SECONDS = 10

interface UseSessionResult {
  state: SessionState
  togglePause: () => void
  finalize: () => void
}

export function useSession(config: TimerConfig): UseSessionResult {
  const [state, setState] = useState<SessionState>(() => ({
    phase: 'preparation',
    currentRound: 1,
    totalRounds: config.rounds,
    timeLeft: PREPARATION_SECONDS,
    phaseDuration: PREPARATION_SECONDS,
    paused: false,
  }))

  const warnedPhasesRef = useRef<Set<string>>(new Set())
  const configRef = useRef(config)
  configRef.current = config

  const advance = useCallback((prev: SessionState): SessionState => {
    const cfg = configRef.current

    if (prev.phase === 'preparation') {
      return {
        ...prev,
        phase: 'exercise',
        timeLeft: cfg.exercise,
        phaseDuration: cfg.exercise,
        paused: false,
      }
    }

    if (prev.phase === 'exercise') {
      if (prev.currentRound >= prev.totalRounds) {
        return {
          ...prev,
          phase: 'done',
          timeLeft: 0,
          phaseDuration: 0,
          paused: true,
        }
      }
      return {
        ...prev,
        phase: 'rest',
        timeLeft: cfg.rest,
        phaseDuration: cfg.rest,
        paused: false,
      }
    }

    return {
      ...prev,
      phase: 'exercise',
      currentRound: prev.currentRound + 1,
      timeLeft: cfg.exercise,
      phaseDuration: cfg.exercise,
      paused: false,
    }
  }, [])

  useEffect(() => {
    if (state.paused || state.phase === 'done') return

    const intervalId = window.setInterval(() => {
      setState((prev) => {
        if (prev.paused || prev.phase === 'done') return prev

        const nextLeft = prev.timeLeft - 1

        if (nextLeft <= 0) {
          return advance(prev)
        }

        return { ...prev, timeLeft: nextLeft }
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [state.paused, state.phase, advance])

  // Audio: al iniciar sesión y en los 10 segundos previos al fin de ejercicio/descanso.
  useEffect(() => {
    if (state.paused || state.phase === 'done') return

    const shouldWarn =
      state.timeLeft === WARNING_SECONDS ||
      (state.phaseDuration > 0 && state.phaseDuration <= WARNING_SECONDS && state.timeLeft === state.phaseDuration)

    if (!shouldWarn) return

    const warnKey = `${state.phase}-${state.currentRound}`
    if (warnedPhasesRef.current.has(warnKey)) return

    warnedPhasesRef.current.add(warnKey)
    playBeep()
  }, [state.paused, state.phase, state.timeLeft, state.phaseDuration, state.currentRound])

  // Pausar/reanudar el audio junto con la sesión.
  useEffect(() => {
    if (state.phase === 'done') return
    if (state.paused) {
      pauseBeep()
    } else {
      resumeBeep()
    }
  }, [state.paused, state.phase])

  // Cancelar audio al finalizar la sesión o al desmontar.
  // También se limpia el guard de avisos para que un nuevo montaje pueda reproducirlo.
  useEffect(() => {
    if (state.phase === 'done') {
      stopBeep()
      warnedPhasesRef.current.clear()
    }
  }, [state.phase])

  useEffect(() => {
    return () => {
      stopBeep()
      warnedPhasesRef.current.clear()
    }
  }, [])

  const togglePause = useCallback(() => {
    setState((prev) => {
      if (prev.phase === 'done') return prev
      return { ...prev, paused: !prev.paused }
    })
  }, [])

  const finalize = useCallback(() => {
    stopBeep()
    warnedPhasesRef.current.clear()
    setState({
      phase: 'done',
      currentRound: configRef.current.rounds,
      totalRounds: configRef.current.rounds,
      timeLeft: 0,
      phaseDuration: 0,
      paused: true,
    })
  }, [])

  return { state, togglePause, finalize }
}
