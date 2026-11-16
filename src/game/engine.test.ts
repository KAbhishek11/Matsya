import { describe, expect, it } from 'vitest'
import { ALL_FISH, BONUS, FISH, FISH_BY_ID, fishOfState } from '../data/fish'
import { STATES } from '../data/states'
import { buildRound, hintRemovals, ROUND_LENGTH, seedFromString } from './engine'

describe('data', () => {
  it('every state maps to exactly one fish and every fish has a photo credit', () => {
    for (const s of STATES) expect(FISH.filter((f) => f.states.includes(s.id))).toHaveLength(1)
    for (const f of ALL_FISH) expect(f.credit?.license).toBeTruthy()
  })

  it('bonus fish belong to no state and say where they are famous', () => {
    expect(BONUS.length).toBe(13)
    expect(new Set(ALL_FISH.map((f) => f.id)).size).toBe(ALL_FISH.length)
    for (const f of BONUS) {
      expect(f.states).toEqual([])
      expect(f.famousIn).toBeTruthy()
    }
  })
})

describe('buildRound', () => {
  it('rounds are well formed across 300 seeds and all modes', () => {
    for (let seed = 1; seed <= 300; seed++) {
      for (const mode of ['whose', 'find', 'daily', 'name'] as const) {
        const round = buildRound(mode, seed)
        expect(round).toHaveLength(ROUND_LENGTH)
        expect(new Set(round.map((q) => q.fishId)).size).toBe(ROUND_LENGTH)
        for (const q of round) {
          expect(new Set(q.options).size).toBe(4)
          expect(q.options).toContain(q.answer)
          if (q.kind === 'whose') {
            // exactly one option belongs to this fish, so a shared fish never marks a right state as wrong
            const owners = FISH_BY_ID[q.fishId].states
            expect(q.options.filter((o) => owners.includes(o))).toHaveLength(1)
            expect(new Set(q.options.map((o) => fishOfState(o).id)).size).toBe(4)
          } else if (q.kind === 'find') {
            expect(fishOfState(q.stateId).id).toBe(q.answer)
          } else {
            expect(q.answer).toBe(q.fishId)
            for (const o of q.options) expect(FISH_BY_ID[o]).toBeTruthy()
          }
        }
      }
    }
  })

  it('only Name the Fish uses bonus fish as the answer', () => {
    const bonusIds = new Set(BONUS.map((f) => f.id))
    let sawBonus = false
    for (let seed = 1; seed <= 200; seed++) {
      for (const mode of ['whose', 'find', 'daily'] as const) for (const q of buildRound(mode, seed)) expect(bonusIds.has(q.fishId)).toBe(false)
      if (buildRound('name', seed).some((q) => bonusIds.has(q.fishId))) sawBonus = true
    }
    expect(sawBonus).toBe(true)
  })

  it('is deterministic for a daily seed', () => {
    const s = seedFromString('2026-11-16')
    expect(buildRound('daily', s)).toEqual(buildRound('daily', s))
  })

  it('daily alternates question kinds', () => {
    expect(buildRound('daily', 7).map((q) => q.kind).slice(0, 4)).toEqual(['whose', 'find', 'whose', 'find'])
  })

  it('hint removes two wrong options', () => {
    const q = buildRound('whose', 9)[0]
    const removed = hintRemovals(q)
    expect(removed).toHaveLength(2)
    expect(removed).not.toContain(q.answer)
  })
})
