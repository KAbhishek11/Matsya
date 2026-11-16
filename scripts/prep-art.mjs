// Converts the Figma AI images in .cache/figma into web assets in public/art.
import sharp from 'sharp'; import fs from 'node:fs';
import { removeBackground } from '@imgly/background-removal-node';
const SRC = '.cache/figma', OUT = 'public/art';
for (const name of ['home-portrait', 'home-wide', 'teal', 'teal-wide', 'tank-wide', 'tank-portrait'])
  await sharp(`${SRC}/${name}.png`).resize(1536, 1536, { fit: 'inside' }).webp({ quality: 78 }).toFile(`${OUT}/${name}.webp`);
for (const name of ['pin', 'flame']) {
  const png = await sharp(`${SRC}/${name}.png`).resize(512).png().toBuffer();
  const cut = Buffer.from(await (await removeBackground(new Blob([png], { type: 'image/png' }), { output: { format: 'image/png' } })).arrayBuffer());
  await sharp(cut).trim({ threshold: 10 }).resize(160, 160, { fit: 'inside' }).webp({ quality: 90, alphaQuality: 95 }).toFile(`${OUT}/${name}.webp`);
}
// The chevron is white on magenta, which the cut-out model eats; key out the magenta instead.
{
  const { data, info } = await sharp(`${SRC}/chevron.png`).resize(512).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const m = Math.min(data[i], data[i + 2]) - data[i + 1];
    if (m > 120) data[i + 3] = 0;
    else if (m > 40) { data[i + 3] = Math.round((255 * (120 - m)) / 80); data[i] = data[i + 2] = Math.min(255, data[i + 1] + 30) }
  }
  await sharp(data, { raw: info }).trim({ threshold: 10 }).resize(160, 160, { fit: 'inside' }).webp({ quality: 90, alphaQuality: 95 }).toFile(`${OUT}/chevron.webp`);
}
// Menu icons: illustrated on white, cut out with the same model as the pin.
for (const name of ['whose', 'find', 'name', 'daily', 'tank', 'sound-on', 'sound-off']) {
  const png = await sharp(`${SRC}/icon-${name}.png`).resize(640).png().toBuffer();
  const cut = Buffer.from(await (await removeBackground(new Blob([png], { type: 'image/png' }), { output: { format: 'image/png' } })).arrayBuffer());
  await sharp(cut).trim({ threshold: 10 }).resize(200, 200, { fit: 'inside' }).webp({ quality: 88, alphaQuality: 95 }).toFile(`${OUT}/icon-${name}.webp`);
}
console.log(fs.readdirSync(OUT).map((f) => `${f} ${Math.round(fs.statSync(`${OUT}/${f}`).size / 1024)}KB`).join('\n'));
