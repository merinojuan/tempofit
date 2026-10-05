export interface TimerConfig {
  exercise: number
  rest: number
  rounds: number
}

export type Phase = 'preparation' | 'exercise' | 'rest' | 'done'

export interface SessionState {
  phase: Phase
  currentRound: number
  totalRounds: number
  timeLeft: number
  phaseDuration: number
  paused: boolean
}
