import { animate, AnimatePresence, motion, useReducedMotion, type AnimationPlaybackControls } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { mulberry32 } from '../game/engine'
import { isMuted, onMuteChange, setMuted, sfx } from '../game/sound'
import { STATE_BY_ID } from '../data/states'
import { ALL_FISH, BONUS, FISH, type Fish } from '../data/fish'
import type { Mode } from '../game/engine'
import { art, Chunky, FishImg, MenuCta } from '../ui/kit'

// A small shoal swims back and forth in the open water under the menu buttons, at varied depths and speeds.

function useViewport() {
  const [v, setV] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const on = () => setV({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return v
}

function FishTip({ fish }: { fish: Fish }) {
  return (
    <motion.div
      className="fish-tip"
      role="tooltip"
      initial={{ opacity: 0, scale: 0.96, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.1 } }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
    >
      <b>{fish.name}</b>
      <span className="fish-tip__local">“{fish.localName}”</span>
      <span className="fish-tip__where">
        {fish.bonus ? `Bonus fish · famous in ${fish.famousIn}` : `State fish of ${fish.states.map((s) => STATE_BY_ID[s].name).join(', ')}`}
      </span>
      <span className="fish-tip__fact">{fish.fact}</span>
    </motion.div>
  )
}

function FloatFish({ fish, top, size, speed, phase, width }: { fish: Fish; top: number; size: number; speed: number; phase: number; width: number }) {
  const reduce = useReducedMotion()
  const [tip, setTip] = useState(false)
  // Swimming right needs the head on the right: flip photos whose fish faces left.
  const right = fish.faces === 'right' ? 1 : -1
  const show = () => {
    if (!tip) sfx.bloop()
    setTip(true)
  }
  // Hover on desktop; tap toggles on touch, where there is no hover.
  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === 'mouse' && show(),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === 'mouse' && setTip(false),
    onClick: () => (tip ? setTip(false) : show()),
  }
  const tipEl = <AnimatePresence>{tip && <FishTip fish={fish} />}</AnimatePresence>
  if (reduce) {
    return (
      <motion.div className="shoal__fish" style={{ top, width: size, x: phase * (width - size), zIndex: tip ? 5 : undefined }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} {...handlers}>
        <div style={{ scale: `${right} 1` }}>
          <FishImg id={fish.id} />
        </div>
        {tipEl}
      </motion.div>
    )
  }
  return <SwimmingFish {...{ fish, size, speed, phase, width, top, right, tip, handlers, tipEl }} />
}

// Swims with imperative animations so hovering can ease the playback speed down (and back up) mid-lap.
function SwimmingFish({ fish, size, speed, phase, width, top, right, tip, handlers, tipEl }: {
  fish: Fish; size: number; speed: number; phase: number; width: number; top: number; right: number; tip: boolean
  handlers: Record<string, unknown>; tipEl: ReactNode
}) {
  const outer = useRef<HTMLDivElement>(null)
  const flip = useRef<HTMLDivElement>(null)
  const swims = useRef<AnimationPlaybackControls[]>([])
  const rate = useRef(1)
  useEffect(() => {
    // x lives on the outer layer so the tooltip rides along unflipped; the turn-around flip is on the inner layer.
    const swim = { duration: speed, times: [0, 0.49, 0.5, 0.99, 1], repeat: Infinity, ease: 'linear' as const, delay: -phase * speed }
    const a = animate(outer.current!, { x: [-size, width, width, -size, -size] }, swim)
    const b = animate(flip.current!, { scaleX: [right, right, -right, -right, right] }, swim)
    a.speed = b.speed = rate.current
    swims.current = [a, b]
    return () => { a.stop(); b.stop() }
  }, [size, speed, phase, width, right])
  // While its fact card is open the fish slows to a quarter speed so it is easy to read; it eases back after.
  useEffect(() => {
    const ctrl = animate(rate.current, tip ? 0.25 : 1, {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1],
      onUpdate: (v) => {
        rate.current = v
        swims.current.forEach((c) => (c.speed = v))
      },
    })
    return () => ctrl.stop()
  }, [tip])
  return (
    <motion.div
      ref={outer}
      className="shoal__fish"
      style={{ top, width: size, x: -size, zIndex: tip ? 5 : undefined }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      aria-label={fish.name}
      {...handlers}
    >
      <div ref={flip}>
        <motion.div animate={{ y: [0, -6, 0, 5, 0] }} transition={{ duration: 3 + (size % 3), repeat: Infinity, ease: 'easeInOut' }}>
          <FishImg id={fish.id} />
        </motion.div>
      </div>
      {tipEl}
    </motion.div>
  )
}

function Shoal({ top }: { top: number }) {
  const { w, h } = useViewport()
  const count = w >= 900 ? 11 : 7
  const band = Math.max(h - top, 100)
  const size = Math.round(Math.min(Math.max(band * 0.6, 72), 160))
  const swimmers = useMemo(() => {
    const rnd = mulberry32(11)
    const picks = [...ALL_FISH].sort(() => rnd() - 0.5).slice(0, count)
    return picks.map((fish, i) => ({ fish, lane: (i + 0.5) / count, speed: 30 + rnd() * 20, phase: rnd(), scale: 0.8 + rnd() * 0.35 }))
  }, [count])
  return (
    <div className="shoal" aria-hidden>
      {swimmers.map((s) => {
        const sz = Math.round(size * s.scale)
        return <FloatFish key={s.fish.id} fish={s.fish} top={top + (band - sz * 0.7) * s.lane} size={sz} speed={s.speed} phase={s.phase} width={w} />
      })}
    </div>
  )
}

function SoundToggle() {
  const [off, setOff] = useState(isMuted)
  useEffect(() => onMuteChange(setOff), [])
  return (
    <Chunky size="round" className="sound-toggle" aria-label={off ? 'Turn sound on' : 'Turn sound off'} aria-pressed={!off} onClick={() => setMuted(!off)}>
      <img src={art(off ? 'icon-sound-off' : 'icon-sound-on')} alt="" className="sound-toggle__img" draggable={false} />
    </Chunky>
  )
}

export function Home({
  onPlay,
  onTank,
  onCredits,
  daily,
  caughtCount,
}: {
  onPlay: (mode: Mode) => void
  onTank: () => void
  onCredits: () => void
  daily?: number
  caughtCount: number
}) {
  // The shoal lives in the water below the last line of the menu.
  const foot = useRef<HTMLDivElement>(null)
  const [shoalTop, setShoalTop] = useState(() => window.innerHeight * 0.8)
  useLayoutEffect(() => {
    const measure = () => foot.current && setShoalTop(foot.current.getBoundingClientRect().bottom + 8)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return (
    <div className="screen home">
      <div className="bg bg--home" aria-hidden />
      <Shoal top={shoalTop} />
      <SoundToggle />
      <div className="column">
        <div className="menu-col">
          <div className="logo">
            <div className="logo__word outlined">Matsya</div>
            <div>
              <span className="logo__tag">Guess India’s state fish</span>
            </div>
          </div>

          <div className="menu">
            <MenuCta tone="blue" icon="whose" onClick={() => onPlay('whose')} sub="See a fish · name its state">
              Whose Fish?
            </MenuCta>
            <MenuCta tone="green" icon="find" size="hero" onClick={() => onPlay('find')} sub="See a state · pick its fish">
              Find the Fish
            </MenuCta>
            <MenuCta tone="purple" icon="name" onClick={() => onPlay('name')} sub={`Bonus · ${FISH.length + BONUS.length} Indian fish`}>
              Name the Fish
            </MenuCta>
            <div className="menu-row">
              <MenuCta tone="gold" icon="daily" size="sm" onClick={() => onPlay('daily')} sub={daily === undefined ? 'Same 8 for all' : `Today: ${daily}/8`}>
                Daily
              </MenuCta>
              <MenuCta tone="teal" icon="tank" size="sm" onClick={onTank} sub={`${caughtCount}/${ALL_FISH.length} caught`}>
                My Tank
              </MenuCta>
            </div>
          </div>
          <div className="home-foot" ref={foot}>
            <button className="linkish" type="button" onClick={onCredits}>
              Photo credits &amp; sources
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
