import { ALL_FISH, FISH, FISH_BY_ID, fishOfState } from '../data/fish'
import { STATES } from '../data/states'

export type Mode = 'whose' | 'find' | 'daily' | 'name'
export type Kind = 'whose' | 'find' | 'name'

/** whose: show a fish, pick its state. find: show a state, pick its fish. name: show any fish, pick its name. */
export interface Question {
  kind: Kind
  fishId: string
  stateId: string
  /** state ids for `whose`, fish ids for `find` and `name`; `stateId` is '' for `name` */
  options: string[]
  answer: string
}

export const ROUND_LENGTH = 8

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromString(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function whoseQuestion(fishId: string, rnd: () => number): Question {
  const fish = FISH_BY_ID[fishId]
  const stateId = fish.states[Math.floor(rnd() * fish.states.length)]
  // Distractors must belong to a *different* fish, so a shared fish never has two right answers.
  // They also come from three different fish, so two states sharing one fish can't both appear and give the game away.
  const wrong: string[] = []
  const used = new Set<string>()
  for (const s of shuffle(STATES.filter((s) => !fish.states.includes(s.id)), rnd)) {
    const owner = fishOfState(s.id).id
    if (used.has(owner)) continue
    used.add(owner)
    wrong.push(s.id)
    if (wrong.length === 3) break
  }
  return { kind: 'whose', fishId, stateId, options: shuffle([stateId, ...wrong], rnd), answer: stateId }
}

function findQuestion(stateId: string, rnd: () => number): Question {
  const fish = fishOfState(stateId)
  // Bonus fish join the wrong options, so you can't just spot the one state fish among strangers.
  const wrong = shuffle(ALL_FISH.filter((f) => f.id !== fish.id), rnd).slice(0, 3).map((f) => f.id)
  return { kind: 'find', fishId: fish.id, stateId, options: shuffle([fish.id, ...wrong], rnd), answer: fish.id }
}

function nameQuestion(fishId: string, rnd: () => number): Question {
  const wrong = shuffle(ALL_FISH.filter((f) => f.id !== fishId), rnd).slice(0, 3).map((f) => f.id)
  return { kind: 'name', fishId, stateId: '', options: shuffle([fishId, ...wrong], rnd), answer: fishId }
}

/** Builds a round with no repeated fish. `daily` alternates both question kinds from a date seed. */
export function buildRound(mode: Mode, seed = Math.floor(Math.random() * 2 ** 32)): Question[] {
  const rnd = mulberry32(seed)
  // Name the Fish draws from every fish, bonus ones included; the state modes only use state fish.
  const pool = mode === 'name' ? ALL_FISH : FISH
  const fishIds = shuffle(pool.map((f) => f.id), rnd).slice(0, ROUND_LENGTH)
  return fishIds.map((fishId, i) => {
    if (mode === 'name') return nameQuestion(fishId, rnd)
    const kind: Kind = mode === 'daily' ? (i % 2 === 0 ? 'whose' : 'find') : mode
    if (kind === 'whose') return whoseQuestion(fishId, rnd)
    const states = FISH_BY_ID[fishId].states
    return findQuestion(states[Math.floor(rnd() * states.length)], rnd)
  })
}

export const isCorrect = (q: Question, pick: string) => pick === q.answer

/** 50:50 hint — returns two wrong options to hide. */
export function hintRemovals(q: Question, rnd: () => number = Math.random) {
  return shuffle(q.options.filter((o) => o !== q.answer), rnd).slice(0, 2)
}

export function shareText(mode: Mode, results: boolean[], date = todayKey()) {
  const title = { daily: `Matsya daily ${date}`, whose: 'Matsya · Whose fish?', find: 'Matsya · Find the fish', name: 'Matsya · Name the fish' }[mode]
  const score = results.filter(Boolean).length
  return `${title}\n${results.map((r) => (r ? '🐟' : '🫧')).join('')} ${score}/${results.length}\n${mode === 'name' ? 'How well do you know Indian fish?' : "Guess India's state fish"}`
}
