import sharp from 'sharp'; import fs from 'node:fs';
const [,, OUT, id, taxon] = process.argv;
const UA = { "User-Agent": "MatsyaQuizBuild/0.1 (educational fish quiz)" };
const j = await (await fetch(`https://api.inaturalist.org/v1/observations?${/^\d+$/.test(taxon)?"taxon_id="+taxon:"taxon_name="+encodeURIComponent(taxon)}&photos=true&photo_license=cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa,cc0&per_page=16&order_by=votes`,{headers:UA})).json();
const c = [];
for (const o of j.results) { const ph=o.photos[0]; if(!ph) continue; c.push({src:'inat', title:`iNat ${o.taxon?.name} obs ${o.id}`, thumb:ph.url.replace('square','medium'), full:ph.url.replace('square','original'), page:`https://www.inaturalist.org/observations/${o.id}`, license:ph.license_code, author:ph.attribution}) }
const cells=[];
for (const [i,x] of c.entries()) { const buf=Buffer.from(await (await fetch(x.thumb,{headers:UA})).arrayBuffer());
  const img=await sharp(buf).resize(300,200,{fit:'contain',background:'#fff'}).png().toBuffer();
  const label=Buffer.from(`<svg width="300" height="200"><rect width="60" height="30" fill="#000"/><text x="8" y="22" font-size="20" fill="#fff" font-family="Arial">${i}</text></svg>`);
  cells.push(await sharp(img).composite([{input:label,top:0,left:0}]).png().toBuffer()) }
if (cells.length) await sharp({create:{width:4*305,height:Math.ceil(cells.length/4)*205,channels:3,background:'#888'}}).composite(cells.map((b,i)=>({input:b,left:(i%4)*305,top:Math.floor(i/4)*205}))).jpeg({quality:70}).toFile(`${OUT}/obs-${id}.jpg`);
fs.writeFileSync(`${OUT}/obs-${id}.json`, JSON.stringify(c,null,1)); console.log(id, c.length, c.map(x=>x.title).slice(0,3));
