import { useCallback, useEffect, useState } from 'react'
import { ConfigScreen } from './components/ConfigScreen'
import { TimerScreen } from './components/TimerScreen'
import type { TimerConfig } from './types'
import { getStoredTheme, setTheme, toggleTheme, type Theme } from './theme'

type View = 'config' | 'timer'

export default function App() {
  const [view, setView] = useState<View>('config')
  const [config, setConfig] = useState<TimerConfig | null>(null)
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme())

  const handleThemeToggle = useCallback(() => {
    setThemeState((prev) => toggleTheme(prev))
  }, [])

  const handleStart = useCallback((timerConfig: TimerConfig) => {
    setConfig(timerConfig)
    setView('timer')
  }, [])

  const handleExit = useCallback(() => {
    setConfig(null)
    setView('config')
  }, [])

  useEffect(() => {
    setTheme(theme)
  }, [theme])

  return (
    <div className="relative min-h-full text-base-content">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [background-position:0_0] dark:bg-base-100 dark:bg-[radial-gradient(#33333a_1px,transparent_1px)]"
      />

      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-transparent py-3">
          <h1 className="font-title text-4xl leading-none tracking-tight">
            Tempo<span className="text-primary">Fit</span>
          </h1>
          <button
            type="button"
            className="btn btn-sm gap-2"
            onClick={handleThemeToggle}
            aria-label="Cambiar tema"
          >
            <span className="text-lg leading-none">{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-8 py-4">
          {view === 'config' || !config ? (
            <ConfigScreen onStart={handleStart} />
          ) : (
            <TimerScreen config={config} onExit={handleExit} theme={theme} />
          )}
        </main>
      </div>
    </div>
  )
}
