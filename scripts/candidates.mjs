// Gathers candidate photos per species (Commons search + iNaturalist) and builds contact sheets for manual picking.
import sharp from 'sharp'; import fs from 'node:fs';
const OUT = process.argv[2];
const UA = { "User-Agent": "MatsyaQuizBuild/0.1 (educational fish quiz)" };
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const species = {
  murrel: ["Channa striata", "Channa striata"], goldenMahseer: ["Tor putitora","Tor putitora"], magur: ["Clarias magur","Clarias batrachus"],
  mullet: ["Mugil cephalus","Mugil cephalus"], ghol: ["Protonibea diacanthus","Protonibea diacanthus"], calbasu: ["Labeo calbasu","Labeo calbasu"],
  carnaticCarp: ["Hypselobarbus","Hypselobarbus carnaticus"], karimeen: ["Etroplus suratensis","Etroplus suratensis"], narmadaMahseer: ["Tor tor fish mahseer","Tor tor"],
  pomfret: ["Pampus argenteus","Pampus argenteus"], pengba: ["Osteobrama belangeri","Osteobrama belangeri"], ngahvang: ["Semiplotus","Semiplotus modestus"],
  mahanadiMahseer: ["Tor khudree","Tor khudree"], chocolateMahseer: ["Neolissochilus hexagonolepis","Neolissochilus hexagonolepis"], rohu: ["Labeo rohita","Labeo rohita"],
  pabda: ["Ompok bimaculatus","Ompok bimaculatus"], chital: ["Chitala chitala","Chitala chitala"], hilsa: ["Tenualosa ilisha","Tenualosa ilisha"],
};
const only = process.argv[3] && process.argv[3] !== '-' ? process.argv[3].split(',') : undefined;
// Optional 4th arg: a JSON file of { id: [commonsQuery, inatTaxon] } to search instead of the built-in list.
if (process.argv[4]) { for (const k of Object.keys(species)) delete species[k]; Object.assign(species, JSON.parse(fs.readFileSync(process.argv[4], 'utf8'))) }
const all = {};
for (const [id,[q,taxon]] of Object.entries(species)) {
  if (only && !only.includes(id)) continue;
  const c = [];
  for (let tries=0; tries<4; tries++) {
    const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch=${encodeURIComponent(q)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=320&iiextmetadatafilter=LicenseShortName|Artist`;
    const t = await (await fetch(u,{headers:UA})).text();
    try { const j = JSON.parse(t); for (const p of Object.values(j.query?.pages||{}).sort((a,b)=>a.index-b.index)) { const ii=p.imageinfo?.[0]; if(!ii||!/\.(jpe?g|png)$/i.test(p.title)) continue; c.push({src:'commons', title:p.title, thumb:ii.thumburl, full:ii.url, page:ii.descriptionurl, license:ii.extmetadata?.LicenseShortName?.value, author:(ii.extmetadata?.Artist?.value||'').replace(/<[^>]+>/g,'').trim()}) } break }
    catch { await sleep(6000) }
  }
  try {
    const j = await (await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(taxon)}&rank=species&per_page=1`,{headers:UA})).json();
    const tx = j.results?.[0];
    if (tx) { const d = await (await fetch(`https://api.inaturalist.org/v1/taxa/${tx.id}`,{headers:UA})).json();
      for (const tp of (d.results?.[0]?.taxon_photos||[]).slice(0,8)) { const ph=tp.photo; if(!ph.license_code) continue; c.push({src:'inat', title:`iNat ${tx.name} #${ph.id}`, thumb:ph.medium_url, full:ph.original_url||ph.large_url||ph.medium_url.replace('medium','original'), page:`https://www.inaturalist.org/photos/${ph.id}`, license:ph.license_code, author:ph.attribution}) } }
  } catch(e) { console.log('inat fail', id, e.message) }
  all[id]=c;
  // contact sheet
  const cells = [];
  for (const [i,x] of c.slice(0,16).entries()) {
    try { const buf = Buffer.from(await (await fetch(x.thumb,{headers:UA})).arrayBuffer());
      const img = await sharp(buf).resize(300,200,{fit:'contain',background:'#fff'}).png().toBuffer();
      const label = Buffer.from(`<svg width="300" height="200"><rect width="60" height="30" fill="#000"/><text x="8" y="22" font-size="20" fill="#fff" font-family="Arial">${i}</text></svg>`);
      cells.push(await sharp(img).composite([{input:label,top:0,left:0}]).png().toBuffer()); } catch { cells.push(await sharp({create:{width:300,height:200,channels:3,background:'#f00'}}).png().toBuffer()) }
    await sleep(300);
  }
  if (cells.length) { const cols=4, rows=Math.ceil(cells.length/cols);
    await sharp({create:{width:cols*305,height:rows*205,channels:3,background:'#888'}}).composite(cells.map((b,i)=>({input:b,left:(i%cols)*305,top:Math.floor(i/cols)*205}))).jpeg({quality:70}).toFile(`${OUT}/${id}.jpg`); }
  console.log(id, c.length);
  await sleep(1500);
}
fs.writeFileSync(`${OUT}/candidates${process.argv[4]?'-bonus':''}${only?'-'+only.join('_'):''}.json`, JSON.stringify(all,null,1));
