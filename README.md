# Matsya — guess India's state fish

Mobile-first web game. 25 states, 18 species, real photos (background removed).

- **Whose Fish?** see a fish, pick its state · **Find the Fish** see a state, pick its fish · **Daily** 8 fish, same for everyone, once a day
- After every answer: local name, scientific name, a fact, and a map of every state that shares the fish
- Caught fish swim in **My Tank** (saved in the browser)

## Stack
Vite + React + TypeScript, Motion for animation, hand-written CSS tokens (`src/styles`), India map from `@svg-maps/india`, vitest.

```bash
npm install
npm run dev     # http://localhost:5183
npm test        # engine tests
npm run build   # static site in dist/
```

## Art
Backgrounds (home, quiz, tank) and the pin, chevron and flame icons were generated with Figma AI in the
"Card game" Figma file. The originals are kept in `.cache/figma/`, and `node scripts/prep-art.mjs` turns them into `public/art/*.webp`.

## Fish photos
`scripts/sources.json` lists the chosen photo for each species (Wikimedia Commons / iNaturalist).
`NODE_USE_ENV_PROXY=1 node scripts/fetch-fish.mjs [id,...]` downloads, removes the background
(`@imgly/background-removal-node`), trims to `public/fish/<id>.webp` and writes `src/data/credits.json`.
13 bonus fish (catla, bombil, surmai, bangda…) are popular Indian fish that are not a state fish; they appear only in Name the Fish, as extra wrong options in Find the Fish, and in the tank. Several photos are CC BY-NC — fine for a free game, swap them before any commercial use.
