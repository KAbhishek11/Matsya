import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FISH_BY_ID } from '../data/fish'
import { STATE_BY_ID } from '../data/states'
import { sfx } from '../game/sound'
import { buildRound, hintRemovals, isCorrect, type Mode, type Question } from '../game/engine'
import { Chunky, Flame, IndiaMap, Panel, Polaroid } from '../ui/kit'

const TILTS = [-2.5, 2, -1.5, 3]
const HINTS_PER_ROUND = 2
const EASE_OUT = [0.23, 1, 0.32, 1] as const

export function Quiz({
  mode,
  seed,
  onCatch,
  onDone,
  onExit,
}: {
  mode: Mode
  seed: number
  onCatch: (fishId: string) => void
  onDone: (round: Question[], results: boolean[], bestStreak: number) => void
  onExit: () => void
}) {
  const round = useMemo(() => buildRound(mode, seed), [mode, seed])
  const [idx, setIdx] = useState(0)
  const [pick, setPick] = useState<string | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  // Two 50:50 hints per round, at most one per question (a second would leave only the answer).
  const [hintLeft, setHintLeft] = useState(HINTS_PER_ROUND)
  const [hidden, setHidden] = useState<string[]>([])

  const q = round[idx]
  const fish = FISH_BY_ID[q.fishId]
  const state = STATE_BY_ID[q.stateId]
  const answered = pick !== null
  const right = answered && isCorrect(q, pick)
  const last = idx === round.length - 1

  function choose(option: string) {
    if (answered) return
    const ok = isCorrect(q, option)
    setPick(option)
    setResults((r) => [...r, ok])
    const s = ok ? streak + 1 : 0
    setStreak(s)
    setBest((b) => Math.max(b, s))
    if (ok) onCatch(q.fishId)
    if (ok) sfx.correct()
    else sfx.wrong()
    navigator.vibrate?.(ok ? 15 : [30, 40, 30])
  }

  function next() {
    if (last) return onDone(round, results, best)
    setIdx(idx + 1)
    setPick(null)
    setHidden([])
  }

  function useHint() {
    if (!hintLeft || answered || hidden.length) return
    setHintLeft((h) => h - 1)
    setHidden(hintRemovals(q))
    sfx.hint()
  }

  // Keyboard play: 1–4 or A–D pick an option, H uses the hint, Enter / → goes to the next fish, Esc leaves.
  // A ref keeps the listener reading the latest state without re-binding on every render.
  const keys = useRef({ q, answered, hidden, choose, next, useHint, onExit })
  keys.current = { q, answered, hidden, choose, next, useHint, onExit }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      const k = keys.current
      const key = e.key.toLowerCase()
      const slot = '1234'.indexOf(key) >= 0 ? '1234'.indexOf(key) : 'abcd'.indexOf(key)
      if (slot >= 0 && !k.answered) {
        const o = k.q.options[slot]
        if (o && !k.hidden.includes(o)) k.choose(o)
        e.preventDefault()
      } else if (key === 'h' && !k.answered) {
        k.useHint()
      } else if ((key === 'enter' || key === 'arrowright' || key === 'n') && k.answered) {
        // A focused button already turns Enter into a click; don't advance twice.
        if (key === 'enter' && (e.target as Element)?.closest?.('button')) return
        sfx.click()
        k.next()
        e.preventDefault()
      } else if (key === 'escape') {
        k.onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const optionState = (o: string) =>
    !answered ? (hidden.includes(o) ? 'muted' : 'default') : o === q.answer ? 'correct' : o === pick ? 'wrong' : 'muted'

  return (
    <div className="screen teal-world">
      <div className="column" style={{ paddingBottom: answered ? 330 : undefined }}>
        <div className="topbar">
          <Chunky size="round" onClick={onExit} aria-label="Back to menu">
            ✕
          </Chunky>
          <div className="pips" aria-label={`Fish ${idx + 1} of ${round.length}`}>
            {round.map((_, i) => (
              <span key={i} className={`pip ${i < results.length ? (results[i] ? 'pip--hit' : 'pip--miss') : i === idx ? 'pip--now' : ''}`} />
            ))}
          </div>
          {/* Pops when the streak grows; a reset to 0 just changes the number. */}
          <motion.span
            key={streak}
            className="badge"
            aria-label={`Streak ${streak}`}
            initial={streak ? { scale: 1 } : false}
            animate={streak ? { scale: [1, 1.18, 1] } : undefined}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <Flame size={22} /> {streak}
          </motion.span>
        </div>

        {/* No exit + wait here: "Next fish" is pressed 8 times a round, so the new question arrives at once. */}
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            {q.kind !== 'find' ? (
              <>
                <h1 className="q-title outlined">{q.kind === 'whose' ? 'Whose fish is this?' : 'What fish is this?'}</h1>
                <motion.div
                  initial={{ rotate: -4, scale: 0.96 }}
                  animate={{ rotate: -2, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
                  style={{ maxWidth: 360, margin: '0 auto' }}
                >
                  <Polaroid
                    fishId={q.fishId}
                    hidden={!answered}
                    caption={
                      answered ? (
                        <motion.span
                          style={{ display: 'block' }}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22, ease: EASE_OUT }}
                        >
                          {fish.name}
                          <small>{fish.localName}</small>
                        </motion.span>
                      ) : (
                        '???'
                      )
                    }
                  />
                </motion.div>
                <div className="options">
                  {q.options.map((o, i) => {
                    const st = optionState(o)
                    return (
                      <Chunky
                        key={o}
                        variant={st as 'default'}
                        className={answered && o === pick && !right ? 'shake' : ''}
                        data-sfx="none"
                        disabled={answered || hidden.includes(o)}
                        onClick={() => choose(o)}
                        icon={answered && o === q.answer ? '✓' : answered && o === pick ? '✗' : undefined}
                      >
                        {q.kind === 'whose' ? STATE_BY_ID[o].name : FISH_BY_ID[o].name}
                        {!answered && <kbd aria-hidden className="keycap keycap--corner">{i + 1}</kbd>}
                      </Chunky>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                <h1 className="q-title outlined">
                  <small>Find the state fish of</small>
                  {state.name}
                </h1>
                <Panel className="state-card">
                  <IndiaMap on={[state.mapId]} label={`${state.name} highlighted on the map of India`} />
                  <div>
                    <div className="state-card__region">{state.region} India</div>
                    <div className="state-card__hint">Which of these four is its state fish?</div>
                  </div>
                </Panel>
                <div className="fish-grid">
                  {q.options.map((o, i) => {
                    const st = optionState(o)
                    return (
                      <button
                        key={o}
                        type="button"
                        className={`fish-pick fish-pick--${st} ${answered && o === pick && !right ? 'shake' : ''}`}
                        data-sfx="none"
                        disabled={answered || hidden.includes(o)}
                        onClick={() => choose(o)}
                        aria-label={answered ? FISH_BY_ID[o].name : `Fish option ${i + 1}`}
                      >
                        <div style={{ position: 'relative' }}>
                          {!answered && <kbd aria-hidden className="keycap keycap--corner keycap--pick">{i + 1}</kbd>}
                          {answered && (o === q.answer || o === pick) && (
                            <motion.span
                              className={`mark ${o === q.answer ? 'mark--ok' : 'mark--no'}`}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', duration: 0.25, bounce: 0.3 }}
                            >
                              {o === q.answer ? '✓' : '✗'}
                            </motion.span>
                          )}
                          <Polaroid
                            fishId={o}
                            tilt={TILTS[i]}
                            pin={false}
                            caption={answered ? FISH_BY_ID[o].name : ''}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </motion.div>

        {!answered && (
          <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center' }}>
            <Chunky size="sm" variant="sun" disabled={!hintLeft || hidden.length > 0} onClick={useHint} data-sfx="none" className={!hintLeft || hidden.length > 0 ? 'chunky--muted' : ''} aria-label={`50:50 hint, ${hintLeft} left`}>
              {!hintLeft ? 'No hints left' : hidden.length ? `Hint used · ${hintLeft} left` : `50:50 hint · ${hintLeft} left`}
              {hintLeft > 0 && !hidden.length && <kbd aria-hidden className="keycap keycap--inline">H</kbd>}
            </Chunky>
          </div>
        )}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            className="sheet-wrap"
            initial={{ y: '110%' }}
            animate={{ y: 0, transition: { type: 'spring', duration: 0.4, bounce: 0.12 } }}
            exit={{ y: '110%', transition: { duration: 0.18, ease: EASE_OUT } }}
          >
            <Panel className="sheet">
              <div className="sheet__head">
                <span className="sheet__verdict outlined">{right ? 'Caught it! 🎣' : 'It got away! 🫧'}</span>
              </div>
              {!right && pick && (
                <div className="sheet__miss">
                  You picked {q.kind === 'whose' ? STATE_BY_ID[pick].name : `the ${FISH_BY_ID[pick].name}`}
                </div>
              )}
              <div className={`sheet__body ${fish.bonus ? 'sheet__body--bonus' : ''}`}>
                {fish.bonus ? (
                  <span className="bonus-tag">Bonus fish</span>
                ) : (
                  <IndiaMap on={fish.states} label={`States that chose the ${fish.name}`} />
                )}
                <div>
                  <div className="sheet__name">{fish.name}</div>
                  <div className="sheet__local">“{fish.localName}”</div>
                  <div className="sheet__sci">{fish.scientific}</div>
                  {fish.bonus ? (
                    <div className="sheet__famous">Not a state fish · famous in {fish.famousIn}</div>
                  ) : (
                    <div className="chips">
                      {fish.states.map((s) => (
                        <span key={s} className="chip">{STATE_BY_ID[s].name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="sheet__fact">{fish.fact}</p>
              {fish.credit.note && <p className="sheet__note">{fish.credit.note}</p>}
              <Chunky variant="primary" onClick={next} autoFocus>
                {last ? 'See your catch' : 'Next fish'}
                <kbd aria-hidden className="keycap keycap--inline">↵</kbd>
              </Chunky>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
