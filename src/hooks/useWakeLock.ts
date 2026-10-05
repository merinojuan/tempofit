import { useEffect, useRef } from 'react'

// Screen Wake Lock API: mantiene la pantalla encendida mientras `active` sea true.
// El navegador libera el lock solo al ocultar el documento, por eso se vuelve
// a solicitar en `visibilitychange` cuando la pestaña vuelve a estar visible.
export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return

    let cancelled = false

    const acquire = async () => {
      if (sentinelRef.current) return

      try {
        const sentinel = await navigator.wakeLock.request('screen')

        if (cancelled) {
          void sentinel.release()
          return
        }

        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null
        })
        sentinelRef.current = sentinel
      } catch {
        // Permiso denegado o documento inactivo; se reintenta al volver a estar visible.
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire()
    }

    void acquire()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      const sentinel = sentinelRef.current
      sentinelRef.current = null
      if (sentinel) {
        void sentinel.release().catch(() => undefined)
      }
    }
  }, [active])
}
