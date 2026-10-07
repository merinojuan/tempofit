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
    <div className="relative min-h-full h-full text-base-content">
      <div
        aria-hidden
        className="rain-effect absolute inset-0 -z-10 h-full w-full"
      />

      <div className="flex items-center mx-auto h-full w-full max-w-md px-4 py-6">
        <main className="w-full py-4">
          <header className="flex items-center justify-between gap-4 px-8 py-6">
            <h1 className="font-title text-4xl leading-none tracking-tight">
              Tempo<span className="text-primary">Fit</span>
            </h1>
            <button
              type="button"
              className="btn btn-circle btn-primary btn-soft gap-2"
              onClick={handleThemeToggle}
              aria-label="Cambiar tema"
            >
              <span className="text-lg leading-none">{theme === 'dark'
                ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" /></svg>
                : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" /></svg>
              }</span>
              {/*{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}*/}
              {/*{theme === 'dark' ? '☀️' : '🌙'}*/}
            </button>
          </header>
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
