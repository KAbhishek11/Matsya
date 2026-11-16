import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Native file events don't reach Vite in sandboxed shells; poll so edits hot-reload.
  server: { port: 5183, strictPort: true, watch: { usePolling: true, interval: 200 } },
})
