// Per-player progress kept in localStorage. Every access is guarded: private mode or blocked storage just means no saving.
export interface Progress {
  caught: Record<string, number>
  bestStreak: number
  daily?: { date: string; results: boolean[] }
}

const KEY = 'matsya:v1'
const empty = (): Progress => ({ caught: {}, bestStreak: 0 })

export function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty()
  } catch {
    return empty()
  }
}

export function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable */
  }
}
