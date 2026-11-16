import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { ALL_FISH, BONUS, DEPTH_LABEL, FISH, FISH_BY_ID, type Depth, type Fish } from '../data/fish'
import { STATES, STATE_BY_ID } from '../data/states'
import { mulberry32 } from '../game/engine'
import { sfx } from '../game/sound'
import { Chunky, FishImg, Polaroid } from '../ui/kit'

function useWidth() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

// Water-column bands as % of screen height (top of the fish box). The HUD covers the top ~20%,
// and the riverbed in the background art starts around 85%.
const ZONES: Record<Depth, { from: number; to: number; speed: [number, number]; bob: number }> = {
  surface: { from: 21, to: 30, speed: [14, 20], bob: 6 },
  mid: { from: 33, to: 58, speed: [18, 28], bob: 10 },
  bottom: { from: 62, to: 82, speed: [26, 38], bob: 3 },
}

// Fish leaving on a Mine/All switch fade out instead of vanishing.
const FADE_OUT = { opacity: 0, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] as const } }

function Swimmer({ fish, lane, speed, size, phase, bob, width, onTap }: { fish: Fish; lane: number; speed: number; size: number; phase: number; bob: number; width: number; onTap: () => void }) {
  const reduce = useReducedMotion()
  // Moving right needs the head on the right: flip photos whose fish faces left.
  const right = fish.faces === 'right' ? 1 : -1
  const label = fish.bonus ? `${fish.name}, bonus fish` : `${fish.name}, ${fish.states.map((s) => STATE_BY_ID[s].name).join(', ')}`
  if (reduce) {
    // Reduced motion: the fish rest in place across the tank instead of swimming.
    return (
      <motion.button type="button" className="swimmer" data-sfx="none" style={{ top: `${lane}%`, width: size, x: phase * (width - size), scaleX: right }} aria-label={label} onClick={onTap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={FADE_OUT}>
        <FishImg id={fish.id} />
      </motion.button>
    )
  }
  return (
    <motion.button
      type="button"
      className="swimmer" data-sfx="none"
      style={{ top: `${lane}%`, width: size }}
      aria-label={label}
      onClick={onTap}
      initial={{ x: -size, opacity: 0 }}
      exit={FADE_OUT}
      animate={{ x: [-size, width, width, -size, -size], scaleX: [right, right, -right, -right, right], opacity: 1 }}
      transition={{
        default: { duration: speed, times: [0, 0.49, 0.5, 0.99, 1], repeat: Infinity, ease: 'linear', delay: -phase * speed },
        opacity: { duration: 0.25, ease: 'easeOut' },
      }}
    >
      <motion.div animate={{ y: [0, -bob, 0, bob * 0.8, 0] }} transition={{ duration: 3 + (size % 3) + (bob < 5 ? 2 : 0), repeat: Infinity, ease: 'easeInOut' }}>
        <FishImg id={fish.id} />
      </motion.div>
    </motion.button>
  )
}

export function Tank({ caught, onBack }: { caught: Record<string, number>; onBack: () => void }) {
  const [view, setView] = useState<'mine' | 'all'>(Object.keys(caught).length ? 'mine' : 'all')
  const [open, setOpen] = useState<string | null>(null)
  const width = useWidth()
  const swimmers = useMemo(() => {
    const rnd = mulberry32(7)
    // Spread each zone's fish evenly through its band so they keep to their real depth without stacking.
    const byZone = (d: Depth) => ALL_FISH.filter((f) => f.depth === d)
    return ALL_FISH.map((f) => {
      const zone = ZONES[f.depth]
      const peers = byZone(f.depth)
      const j = peers.indexOf(f)
      const [slow, fast] = zone.speed
      return {
        fish: f,
        lane: zone.from + ((zone.to - zone.from) * (j + 0.5)) / peers.length + (rnd() - 0.5) * 2,
        speed: slow + rnd() * (fast - slow),
        // 31 fish share the tank now, so each is a little smaller than when there were 18.
        size: Math.round(Math.min(width * 0.3, 150) * (0.75 + rnd() * 0.45)),
        phase: rnd(),
        bob: zone.bob,
      }
    })
  }, [width])
  const shown = swimmers.filter((s) => view === 'all' || caught[s.fish.id])
  const caughtStates = STATES.filter((s) => FISH.some((f) => caught[f.id] && f.states.includes(s.id))).length
  const species = FISH.filter((f) => caught[f.id]).length
  const bonusCaught = BONUS.filter((f) => caught[f.id]).length
  const sel = open ? FISH_BY_ID[open] : null

  return (
    <div className="screen tank">
      <div className="bg bg--tank" aria-hidden />
      <div className="tank__water">
        <AnimatePresence>
          {shown.map((s) => (
            <Swimmer key={s.fish.id} {...s} width={width} onTap={() => { sfx.bloop(); setOpen(s.fish.id) }} />
          ))}
        </AnimatePresence>
      </div>

      <div className="column" style={{ pointerEvents: 'none' }}>
        <div className="tank__hud" style={{ pointerEvents: 'auto' }}>
          <div className="topbar">
            <Chunky size="round" onClick={onBack} aria-label="Back">←</Chunky>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span className="outlined" style={{ fontSize: 30 }}>My Tank</span>
            </div>
            <div className="seg" role="group" aria-label="Which fish to show">
              <button type="button" aria-pressed={view === 'mine'} onClick={() => setView('mine')}>Mine</button>
              <button type="button" aria-pressed={view === 'all'} onClick={() => setView('all')}>All</button>
            </div>
          </div>
          <div className="meter">
            {species}/{FISH.length} state fish · {caughtStates}/{STATES.length} states · {bonusCaught}/{BONUS.length} bonus
            <div className="meter__bar"><span style={{ width: `${((species + bonusCaught) / ALL_FISH.length) * 100}%` }} /></div>
          </div>
        </div>
      </div>

      {view === 'mine' && species + bonusCaught === 0 && (
        <div className="empty">
          <div className="outlined" style={{ fontSize: 28 }}>Your tank is empty</div>
          <p style={{ color: '#fff', fontWeight: 700 }}>Play a round — every fish you name swims in here.</p>
        </div>
      )}

      <AnimatePresence>
        {sel && (
          <motion.div className="modal-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }} exit={{ opacity: 0, transition: { duration: 0.15 } }} onClick={() => setOpen(null)}>
            <motion.div
              initial={{ scale: 0.94, rotate: -4, opacity: 0 }}
              animate={{ scale: 1, rotate: -2, opacity: 1, transition: { type: 'spring', duration: 0.35, bounce: 0.25 } }}
              exit={{ scale: 0.96, opacity: 0, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
              onClick={(e) => e.stopPropagation()}
            >
              <Polaroid
                fishId={sel.id}
                caption={
                  <div className="modal-info">
                    {sel.name}
                    <small>“{sel.localName}” · {sel.bonus ? `Bonus fish, famous in ${sel.famousIn}` : sel.states.map((s) => STATE_BY_ID[s].name).join(', ')}</small>
                    <small style={{ marginTop: 4, color: 'var(--teal-700)' }}>{DEPTH_LABEL[sel.depth]}</small>
                    <small style={{ fontWeight: 500, marginTop: 6 }}>{sel.fact}</small>
                    {!caught[sel.id] && <small style={{ marginTop: 6, color: 'var(--coral-bevel)' }}>Not caught yet</small>}
                  </div>
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
