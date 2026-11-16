import { useEffect, useState } from 'react'
import { buildRound, seedFromString, todayKey, type Mode, type Question } from './game/engine'
import { load, save, type Progress } from './game/storage'
import { Credits } from './screens/Credits'
import { Home } from './screens/Home'
import { Quiz } from './screens/Quiz'
import { Results } from './screens/Results'
import { Tank } from './screens/Tank'

type View =
  | { name: 'home' }
  | { name: 'quiz'; mode: Mode; seed: number; key: number }
  | { name: 'results'; mode: Mode; round: Question[]; results: boolean[]; best: number }
  | { name: 'tank' }
  | { name: 'credits' }

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const [progress, setProgress] = useState<Progress>(load)
  useEffect(() => save(progress), [progress])

  const today = todayKey()
  const dailyDone = progress.daily?.date === today ? progress.daily : undefined
  const home = () => setView({ name: 'home' })

  function play(mode: Mode) {
    if (mode === 'daily') {
      const seed = seedFromString(today)
      // The daily is one attempt per day; replaying it shows the stored result.
      if (dailyDone) return setView({ name: 'results', mode, round: buildRound('daily', seed), results: dailyDone.results, best: 0 })
      return setView({ name: 'quiz', mode, seed, key: Date.now() })
    }
    setView({ name: 'quiz', mode, seed: Math.floor(Math.random() * 2 ** 32), key: Date.now() })
  }

  switch (view.name) {
    case 'quiz':
      return (
        <Quiz
          key={view.key}
          mode={view.mode}
          seed={view.seed}
          onExit={home}
          onCatch={(id) => setProgress((p) => ({ ...p, caught: { ...p.caught, [id]: (p.caught[id] ?? 0) + 1 } }))}
          onDone={(round, results, best) => {
            setProgress((p) => ({
              ...p,
              bestStreak: Math.max(p.bestStreak, best),
              ...(view.mode === 'daily' ? { daily: { date: today, results } } : {}),
            }))
            setView({ name: 'results', mode: view.mode, round, results, best })
          }}
        />
      )
    case 'results':
      return (
        <Results
          mode={view.mode}
          round={view.round}
          results={view.results}
          bestStreak={view.best}
          onAgain={view.mode === 'daily' ? undefined : () => play(view.mode)}
          onTank={() => setView({ name: 'tank' })}
          onHome={home}
        />
      )
    case 'tank':
      return <Tank caught={progress.caught} onBack={home} />
    case 'credits':
      return <Credits onBack={home} />
    default:
      return (
        <Home
          onPlay={play}
          onTank={() => setView({ name: 'tank' })}
          onCredits={() => setView({ name: 'credits' })}
          daily={dailyDone?.results.filter(Boolean).length}
          caughtCount={Object.keys(progress.caught).length}
        />
      )
  }
}
