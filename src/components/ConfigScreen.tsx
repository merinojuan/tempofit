import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteTimer, getTimers, saveTimer, timerKey } from '../db'
import type { TimerConfig } from '../types'
import { ModalShell } from './ModalShell'

interface ConfigScreenProps {
  onStart: (config: TimerConfig) => void
}

const MIN_SECONDS = 10
const MIN_ROUNDS = 1

function sanitizePositiveInt(raw: string, min: number): number {
  const cleaned = raw.replace(/[^\d]/g, '')
  if (!cleaned) return min
  const value = parseInt(cleaned, 10)
  if (Number.isNaN(value) || value < min) return min
  return value
}

function parseDraft(exercise: string, rest: string, rounds: string): TimerConfig | null {
  const exerciseNum = exercise.trim() === '' ? NaN : parseInt(exercise.replace(/[^\d]/g, ''), 10)
  const restNum = rest.trim() === '' ? NaN : parseInt(rest.replace(/[^\d]/g, ''), 10)
  const roundsNum = rounds.trim() === '' ? NaN : parseInt(rounds.replace(/[^\d]/g, ''), 10)

  if (Number.isNaN(exerciseNum) || exerciseNum < MIN_SECONDS) return null
  if (Number.isNaN(restNum) || restNum < MIN_SECONDS) return null
  if (Number.isNaN(roundsNum) || roundsNum < MIN_ROUNDS) return null

  return { exercise: exerciseNum, rest: restNum, rounds: roundsNum }
}

export function ConfigScreen({ onStart }: ConfigScreenProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [exercise, setExercise] = useState('30')
  const [rest, setRest] = useState('15')
  const [rounds, setRounds] = useState('5')
  const [saved, setSaved] = useState<TimerConfig[]>([])
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TimerConfig | null>(null)

  const loadSaved = useCallback(async () => {
    try {
      const timers = await getTimers()
      timers.sort((a, b) => timerKey(a).localeCompare(timerKey(b)))
      setSaved(timers)
    } catch {
      setSaved([])
    }
  }, [])

  useEffect(() => {
    void loadSaved()
  }, [loadSaved])

  const draftConfig = useMemo(
    () => parseDraft(exercise, rest, rounds),
    [exercise, rest, rounds],
  )

  const draftExists = useMemo(() => {
    if (!draftConfig) return false
    const key = timerKey(draftConfig)
    return saved.some((timer) => timerKey(timer) === key)
  }, [draftConfig, saved])

  const openModal = useCallback(() => {
    setExercise('30')
    setRest('15')
    setRounds('5')
    setError(null)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setError(null)
  }, [])

  const handleSave = useCallback(async () => {
    if (!draftConfig) {
      setError(
        `Usá enteros válidos: ejercicio y descanso desde ${MIN_SECONDS}s, rondas desde ${MIN_ROUNDS}.`,
      )
      return
    }

    if (draftExists) return

    try {
      await saveTimer(draftConfig)
      await loadSaved()
    } catch {
      setError('No se pudo guardar el tempo.')
      return
    }

    closeModal()
  }, [draftConfig, draftExists, loadSaved, closeModal])

  const requestDelete = useCallback((config: TimerConfig) => {
    setDeleteTarget(config)
  }, [])

  const cancelDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteTimer(timerKey(deleteTarget))
      await loadSaved()
    } catch {
      // Se ignora el error de borrado.
    }
    setDeleteTarget(null)
  }, [deleteTarget, loadSaved])

  return (
    <div>
      <section className="card shadow-2xl w-full backdrop-blur-xs bg-base-200/10 dark:bg-base-200/60">
        <div className="card-body gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-widest opacity-70">MIS TEMPOS</h2>
            <button type="button" className="btn btn-primary btn-sm" onClick={openModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>
              Nuevo tempo
            </button>
          </div>

          {saved.length > 0 && (
            <ul className="flex flex-col gap-2">
              {saved.map((timer) => (
                <li
                  key={timerKey(timer)}
                  className="flex items-center gap-2 py-3"
                >
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-semibold">
                      {timer.exercise}s <span className="mx-1 opacity-50">●</span> {timer.rest}s
                    </span>
                    <span className="badge badge-soft badge-primary badge-sm w-fit">
                      {timer.rounds} rondas
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-soft btn-circle btn-primary"
                    onClick={() => onStart(timer)}
                    aria-label={`Iniciar tempo ${timerKey(timer)}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 4v16l13 -8l-13 -8" /></svg>
                  </button>
                  <button
                    type="button"
                    className="btn btn-soft btn-circle btn-primary"
                    onClick={() => requestDelete(timer)}
                    aria-label={`Eliminar tempo ${timerKey(timer)}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ModalShell open={modalOpen} onClose={closeModal}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold">Nuevo tempo</h3>
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm"
            onClick={closeModal}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <label className="form-control">
            <div className="label py-1">
              <span className="label-text font-semibold tracking-widest">EJERCICIO</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="input input-bordered w-full text-center text-xl font-bold"
              value={exercise}
              onChange={(e) => {
                setExercise(e.target.value)
                setError(null)
              }}
              onBlur={() => setExercise((v) => String(sanitizePositiveInt(v, MIN_SECONDS)))}
              placeholder="30"
              aria-label="Tiempo de ejercicio en segundos"
            />
            <div className="label py-1">
              <span className="label-text-alt">Segundos (mínimo {MIN_SECONDS})</span>
            </div>
          </label>

          <label className="form-control">
            <div className="label py-1">
              <span className="label-text font-semibold tracking-widest">DESCANSO</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="input input-bordered w-full text-center text-xl font-bold"
              value={rest}
              onChange={(e) => {
                setRest(e.target.value)
                setError(null)
              }}
              onBlur={() => setRest((v) => String(sanitizePositiveInt(v, MIN_SECONDS)))}
              placeholder="15"
              aria-label="Tiempo de descanso en segundos"
            />
            <div className="label py-1">
              <span className="label-text-alt">Segundos (mínimo {MIN_SECONDS})</span>
            </div>
          </label>

          <label className="form-control">
            <div className="label py-1">
              <span className="label-text font-semibold tracking-widest">RONDAS</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="input input-bordered w-full text-center text-xl font-bold"
              value={rounds}
              onChange={(e) => {
                setRounds(e.target.value)
                setError(null)
              }}
              onBlur={() => setRounds((v) => String(sanitizePositiveInt(v, MIN_ROUNDS)))}
              placeholder="5"
              aria-label="Cantidad de rondas"
            />
            <div className="label py-1">
              <span className="label-text-alt">Cantidad de rondas (mínimo 1)</span>
            </div>
          </label>

          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button type="button" className="btn btn-soft" onClick={closeModal}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!draftConfig || draftExists}
            onClick={() => void handleSave()}
          >
            {draftExists ? 'Ya existe' : 'Guardar tempo'}
          </button>
        </div>
      </ModalShell>

      <ModalShell open={deleteTarget !== null} onClose={cancelDelete}>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold">¿Eliminar este tempo?</h3>
          <button
            type="button"
            className="btn btn-circle btn-ghost btn-sm"
            onClick={cancelDelete}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {deleteTarget && (
          <p className="py-4 text-sm opacity-80">
            Se eliminará {deleteTarget.exercise}s <span className="mx-1 opacity-50">●</span>{' '}
            {deleteTarget.rest}s con {deleteTarget.rounds} rondas de tus tempos guardados.
          </p>
        )}
        <div className="modal-action">
          <button type="button" className="btn btn-soft" onClick={cancelDelete}>
            Cancelar
          </button>
          <button type="button" className="btn btn-error" onClick={() => void confirmDelete()}>
            Eliminar
          </button>
        </div>
      </ModalShell>
    </div>
  )
}
