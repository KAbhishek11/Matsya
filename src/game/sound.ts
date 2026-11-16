// Small synthesised sound effects (Web Audio, no files). Kept quiet and short so they sit under the game.
const KEY = 'matsya:sound'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = (() => {
  try {
    return localStorage.getItem(KEY) === 'off'
  } catch {
    return false
  }
})()

const listeners = new Set<(m: boolean) => void>()

export const isMuted = () => muted
export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem(KEY, m ? 'off' : 'on')
  } catch {
    /* storage blocked: the setting just won't persist */
  }
  listeners.forEach((l) => l(m))
}
export function onMuteChange(l: (m: boolean) => void) {
  listeners.add(l)
  return () => void listeners.delete(l)
}

function audio() {
  if (muted) return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** One enveloped note. `to` slides the pitch; `at` delays it in seconds. */
function note(freq: number, dur: number, { type = 'sine' as OscillatorType, gain = 0.15, to, at = 0 }: { type?: OscillatorType; gain?: number; to?: number; at?: number } = {}) {
  const a = audio()
  if (!a || !master) return
  const t = a.currentTime + at
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sfx = {
  /** Soft wooden tap for any button. */
  click: () => note(520, 0.06, { type: 'triangle', gain: 0.09, to: 360 }),
  /** Bright two-note chime, a bubble on top. */
  correct: () => {
    note(660, 0.14, { type: 'triangle', gain: 0.14 })
    note(990, 0.22, { type: 'triangle', gain: 0.14, at: 0.08 })
    note(500, 0.12, { gain: 0.06, to: 1400, at: 0.16 })
  },
  /** Low, gentle "bwomp" — disappointing, not punishing. */
  wrong: () => {
    note(260, 0.16, { type: 'triangle', gain: 0.13, to: 200 })
    note(190, 0.26, { type: 'triangle', gain: 0.12, to: 130, at: 0.12 })
  },
  /** Sparkle for the 50:50 hint. */
  hint: () => {
    note(1200, 0.08, { gain: 0.07 })
    note(1600, 0.12, { gain: 0.07, at: 0.06 })
  },
  /** Water "bloop" when you tap a fish in the tank. */
  bloop: () => note(280, 0.12, { gain: 0.12, to: 900 }),
  /** End-of-round jingle: a rising arpeggio for a good haul, a short shrug otherwise. */
  results: (share: number) => {
    if (share >= 0.5) [523, 659, 784, 1047].forEach((f, i) => note(f, 0.2, { type: 'triangle', gain: 0.12, at: i * 0.08 }))
    else {
      note(392, 0.18, { type: 'triangle', gain: 0.11 })
      note(330, 0.28, { type: 'triangle', gain: 0.11, at: 0.14 })
    }
  },
}

/** Every button clicks, unless it opts out with data-sfx="none" because it plays its own sound. */
export function installClickSounds() {
  document.addEventListener(
    'click',
    (e) => {
      const btn = (e.target as Element | null)?.closest?.('button')
      if (!btn || btn.disabled || btn.closest('[data-sfx="none"]')) return
      sfx.click()
    },
    true,
  )
}
