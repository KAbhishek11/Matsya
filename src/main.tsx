import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import './styles/tokens.css'
import './styles/app.css'
import App from './App'
import { installClickSounds } from './game/sound'

installClickSounds()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* "user": with reduce-motion on, Motion skips transform movement but keeps opacity fades. */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
