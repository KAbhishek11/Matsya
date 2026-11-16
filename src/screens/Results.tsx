import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { sfx } from '../game/sound'
import { FISH_BY_ID } from '../data/fish'
import { shareText, type Mode, type Question } from '../game/engine'
import { Chunky, FishImg, Flame, Panel } from '../ui/kit'

const LINES = ['The fish were faster today.', 'A few nibbles!', 'Decent haul!', 'Great catch!', 'Master angler!']

export function Results({
  mode,
  round,
  results,
  bestStreak,
  onAgain,
  onTank,
  onHome,
}: {
  mode: Mode
  round: Question[]
  results: boolean[]
  bestStreak: number
  onAgain?: () => void
  onTank: () => void
  onHome: () => void
}) {
  const score = results.filter(Boolean).length
  const [shared, setShared] = useState('')
  // Jingle once on arrival (the ref stops StrictMode's double effect from playing it twice).
  const played = useRef(false)
  useEffect(() => {
    if (played.current) return
    played.current = true
    sfx.results(score / round.length)
  }, [score, round.length])
  const line = LINES[Math.min(4, Math.floor((score / round.length) * 4.99))]

  async function share() {
    const text = shareText(mode, results)
    try {
      if (navigator.share) await navigator.share({ text })
      else {
        await navigator.clipboard.writeText(text)
        setShared('Copied — paste it anywhere')
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="screen teal-world">
      <div className="column">
        <motion.h1
          className="result-title outlined"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.35 }}
        >
          {score}/{round.length} caught
        </motion.h1>
        <div className="result-sub">
          {line} {bestStreak > 1 && <>Best streak <Flame size={20} /> {bestStreak}</>}
        </div>

        <Panel>
          <div className="catch-grid">
            {round.map((q, i) => {
              const f = FISH_BY_ID[q.fishId]
              return (
                <motion.figure
                  key={q.fishId}
                  className={results[i] ? '' : 'missed'}
                  initial={{ y: 12, opacity: 0, rotate: 0 }}
                  animate={{ y: 0, opacity: 1, rotate: i % 2 ? 3 : -3 }}
                  transition={{ delay: 0.1 + i * 0.05, type: 'spring', duration: 0.45, bounce: 0.25 }}
                >
                  <FishImg id={f.id} className={results[i] ? 'sticker' : 'ghost'} />
                  <figcaption>
                    {results[i] ? '✓' : '✗'} {f.name}
                  </figcaption>
                </motion.figure>
              )
            })}
          </div>
        </Panel>

        <div className="stack">
          <Chunky variant="primary" onClick={share}>
            Share score
          </Chunky>
          {shared && <div className="result-sub" style={{ margin: 0 }}>{shared}</div>}
          {onAgain && <Chunky onClick={onAgain}>Play again</Chunky>}
          <div className="menu-row">
            <Chunky size="sm" onClick={onTank}>My Tank</Chunky>
            <Chunky size="sm" onClick={onHome}>Home</Chunky>
          </div>
        </div>
      </div>
    </div>
  )
}
