import beepUrl from './assets/beep.mp3'

let audio: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(beepUrl)
    audio.preload = 'auto'
  }
  return audio
}

export function playBeep(): void {
  const el = getAudio()
  el.currentTime = 0
  void el.play().catch(() => {
    // Autoplay puede fallar si el usuario no interactuó aún; se ignora.
  })
}

export function pauseBeep(): void {
  if (!audio) return
  audio.pause()
}

export function resumeBeep(): void {
  if (!audio) return
  if (audio.paused && audio.currentTime > 0 && !audio.ended) {
    void audio.play().catch(() => {
      // Se ignora si el navegador bloquea la reanudación.
    })
  }
}

export function stopBeep(): void {
  if (!audio) return
  audio.pause()
  audio.currentTime = 0
}
