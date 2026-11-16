// Downloads each chosen fish photo, removes the background, trims and writes public/fish/<id>.webp
// plus src/data/credits.json. Usage: NODE_USE_ENV_PROXY=1 node scripts/fetch-fish.mjs [id,id]
import sharp from 'sharp'; import fs from 'node:fs';
import { removeBackground } from '@imgly/background-removal-node';
const UA = { 'User-Agent': 'MatsyaQuizBuild/0.1 (educational fish quiz)' };
const sources = JSON.parse(fs.readFileSync('scripts/sources.json', 'utf8'));
const only = process.argv[2]?.split(',');
const credits = fs.existsSync('src/data/credits.json') ? JSON.parse(fs.readFileSync('src/data/credits.json', 'utf8')) : {};
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const [id, s] of Object.entries(sources)) {
  if (only && !only.includes(id)) continue;
  const rawPath = `.cache/raw/${id}`;
  if (!fs.existsSync(rawPath)) {
    let url = s.full;
    if (s.src === 'commons') url = url; // full-size original
    const r = await fetch(url, { headers: UA });
    if (!r.ok) { console.log('download failed', id, r.status); continue }
    fs.writeFileSync(rawPath, Buffer.from(await r.arrayBuffer())); await sleep(800);
  }
  let img = sharp(rawPath).rotate();
  const meta = await sharp(rawPath).rotate().metadata();
  let w = meta.autoOrient?.width ?? meta.width, h = meta.autoOrient?.height ?? meta.height;
  if (s.crop) { const [l, t, cw, ch] = s.crop; img = sharp(await img.extract({ left: Math.round(l * w), top: Math.round(t * h), width: Math.round(cw * w), height: Math.round(ch * h) }).toBuffer()) }
  if (s.rotate) img = sharp(await img.rotate(s.rotate).toBuffer());
  const prepped = await img.resize(1400, 1400, { fit: 'inside', withoutEnlargement: true }).png().toBuffer();
  const blob = await removeBackground(new Blob([prepped], { type: 'image/png' }), { model: s.model || 'medium', output: { format: 'image/png' } });
  const cut = Buffer.from(await blob.arrayBuffer());
  let out = sharp(cut).trim({ threshold: 10 });
  // Photos shot on a green board leave a green fringe on the fins; pull green down to the other channels.
  // alphaFloor drops the faint half-transparent shadow the cut-out model sometimes keeps under a fish.
  if (s.despill || s.alphaFloor) {
    const { data, info } = await out.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      if (s.despill) { const m = Math.max(data[i], data[i + 2]); if (data[i + 1] > m) data[i + 1] = m }
      if (s.alphaFloor && data[i + 3] < s.alphaFloor) data[i + 3] = 0
    }
    out = sharp(await sharp(data, { raw: info }).png().toBuffer()).trim({ threshold: 10 });
  }
  if (s.flop) out = out.flop();
  await out.resize(720, 480, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 90 }).toFile(`public/fish/${id}.webp`);
  credits[id] = { author: s.author.replace(/^\(c\)\s*/, '').replace(/,? some rights reserved.*$/, '').replace(/, uploaded by.*$/, '').trim(), license: /public/i.test(s.license) ? 'Public domain' : s.license.toUpperCase().replace(/^CC-/, 'CC ').replace(/^CC BY-?(?=[A-Z])/, 'CC BY-'), source: s.page, ...(s.note ? { note: s.note } : {}) };
  console.log('ok', id);
}
fs.writeFileSync('src/data/credits.json', JSON.stringify(credits, null, 1));
