const {chromium}=require('playwright-core');const fs=require('fs');const path=require('path');
const {I,svg}=require('./icons');const LS=require('./lesson');
const LDIR=process.argv[2];
const ic=(n,sz=48,col='#0B1440',op=1)=>svg(n,{size:sz,stroke:col,opacity:op}).replace('<svg ','<svg class="ic" ');
const logo=fs.readFileSync(path.join(LDIR,'Images/Brand/today_lockup_navy-on-paper.svg'),'utf8').replace(/width="[^"]*" height="[^"]*"/,'height="22"');
const CSS=`
:root{--navy:#0B1440;--orange:#F44904;--paper:#FAF7F2;--sand:#F3EFE6;--mute:#5B6088;}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Hanken Grotesk';color:var(--navy);background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
@page{size:A4;margin:12mm}
@page land{size:A4 landscape;margin:12mm}
.land{page:land}
.page{break-after:page;position:relative;height:272mm;overflow:hidden}
.page.land{height:185mm}
.page:last-child{break-after:auto}
.k{font-family:'JetBrains Mono';font-size:8.5pt;letter-spacing:.12em;color:var(--orange);text-transform:uppercase}
.m{font-family:'JetBrains Mono';font-size:8pt;letter-spacing:.1em;color:var(--mute);text-transform:uppercase}
h1{font-family:Poppins;font-weight:700;font-size:24pt;line-height:1.05;margin:2mm 0 1mm}
h2{font-family:Poppins;font-weight:700;font-size:16pt;line-height:1.1}
.sub{font-size:10.5pt;color:var(--mute);margin-bottom:5mm}
.head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3mm}
.foot{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between}
.cut{border:1px dashed #8890B5}
.o{color:var(--orange)}
.b{font-weight:700}
`;
function doc(title,body){return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body>${body}</body></html>`;}
function head(k,t,s){return `<div class="head"><div><div class="k">— ${k}</div><h1>${t}</h1>${s?`<div class="sub">${s}</div>`:''}</div><div style="padding-top:1mm">${logo}</div></div>`;}
const foot=(t)=>`<div class="foot"><span class="m">Today Travel English · Lesson 01 · Packing for a Trip</span><span class="m">${t}</span></div>`;

// ---------- CLASSROOM MATERIALS ----------
function itemCard(k,art,w,rec){return `<div class="cut card ${rec?'rec':''}"><div class="n">${rec?'EXTRA':''}</div>${ic(k,rec?60:74,'#0B1440',rec?0.55:1)}<div class="w">${art?`<span class="a">${art}</span> `:''}${w}</div></div>`;}
const MAT_CSS=`
.cards{display:grid;grid-template-columns:repeat(5,1fr);gap:0}
.card{height:43mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm;position:relative}
.card .w{font-size:11.5pt;font-weight:700}.card .a{font-weight:400;color:var(--mute)}
.card.rec .w{font-size:9.5pt;font-weight:400;color:var(--mute)}.card .n{position:absolute;top:2mm;left:2.5mm;font-family:'JetBrains Mono';font-size:6.5pt;letter-spacing:.1em;color:var(--mute)}
.bag{display:grid;grid-template-columns:repeat(5,1fr);gap:5mm;margin-top:4mm}
.slot{height:48mm;border:1.5px dashed #0B1440;display:flex;align-items:flex-end;justify-content:center;padding-bottom:2mm;font-family:'JetBrains Mono';font-size:9pt;color:var(--mute)}
.slot.fixed{flex-direction:column;align-items:center;justify-content:center;gap:2mm}
.four{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;height:262mm}
.tc{padding:7mm;display:flex;flex-direction:column}
.fc{display:flex;gap:4mm;margin:3mm 0}.fc div{text-align:center}.fc .t{font-weight:700;font-size:12pt}
.act{display:flex;align-items:center;gap:2.5mm;font-size:12pt;margin-top:2mm}
.tw{padding:8mm;display:flex;flex-direction:column;background:var(--sand);border:none;outline:1px dashed #8890B5}
.tw .x{font-size:15pt;margin-top:3mm;line-height:1.3}.tw .sm{font-size:10pt;color:var(--mute);margin-top:3mm;line-height:1.35}
.tw .task{margin-top:auto;font-family:'JetBrains Mono';font-size:9pt;letter-spacing:.08em;color:var(--orange);text-transform:uppercase}
.two{display:grid;grid-template-rows:1fr 1fr;height:262mm;gap:0}
.lc{padding:6mm 9mm;display:flex;flex-direction:column;gap:2.6mm;font-size:12pt}
.ln{display:inline-block;border-bottom:1px solid #F44904;min-width:40mm;height:5mm;vertical-align:bottom}
.wx{display:inline-flex;align-items:center;gap:1mm;margin-right:4mm}.bx{display:inline-block;width:4mm;height:4mm;border:1.2px solid #0B1440}
.tk{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm 8mm}
`;
function materials(){
 let h='';
 // P1 item cards
 h+=`<section class="page">${head('Signature task · One bag, ten things','Item cards','Print one set per pair. Cut along the dashed lines. EXTRA cards are recognition only — students may pack them.')}
 <div class="cards">${LS.CORE.map(([k,a,w])=>itemCard(k,a,w,false)).join('')}${LS.RECOG.map(([k,a,w])=>itemCard(k,a,w,true)).join('')}</div>${foot('Print 1 · Item cards')}</section>`;
 // P2 bag template (landscape)
 h+=`<section class="page land">${head('Signature task · One bag, ten things','Our bag · 10 things',"You're travelling together. ONE small bag. 10 things, including your essentials.")}
 <div class="bag">${Array.from({length:10},(_,i)=>`<div class="slot">${i+1}</div>`).join('')}</div>
 <div style="display:flex;gap:10mm;margin-top:6mm;font-size:11.5pt"><div><span class="k">01 · 2 min</span><br>Think alone. Fill your bag.</div><div><span class="k">02 · 5 min</span><br>Compare. Agree on ONE bag.</div><div><span class="k">03 · 3 min</span><br>New information! 1 out, 1 in.</div><div><span class="k">04 · 4 min</span><br>Show your bag to another pair.</div></div>
 <div style="margin-top:5mm;font-size:11.5pt"><span class="k">Say</span>&nbsp;&nbsp; Are you taking…? &nbsp;·&nbsp; Good idea! &nbsp;·&nbsp; Hmm, I'm not sure. &nbsp;·&nbsp; My bag is full.</div>${foot('Print 2 · Bag template · A4 landscape')}</section>`;
 // P3 trip cards
 h+=`<section class="page">${head('Signature task · One bag, ten things','Trip cards','One card per pair. Forecasts are for “this week” only.')}<div class="four" style="height:222mm">${LS.TRIPS.map(t=>`<div class="cut tc"><div class="k">Trip ${t.id}</div><h2 style="font-size:22pt;margin-top:2mm">${t.city}</h2><div style="font-size:11.5pt;margin-top:1mm">${t.country} · ${t.month}</div><div class="b" style="font-size:11.5pt">${t.days} days</div>
 <div class="m" style="margin-top:4mm">This week</div><div class="fc">${t.forecast.map(([w,tmp],d)=>`<div><div class="m">Day ${d+1}</div>${ic(w,44)}<div class="t">${tmp}</div></div>`).join('')}</div>${t.note?`<div class="k" style="font-size:7.5pt">${t.note}</div>`:''}
 <div class="m" style="margin-top:3mm">Activities</div>${t.acts.map(([k,w])=>`<div class="act">${ic(k,30)}${w}</div>`).join('')}</div>`).join('')}</div>${foot('Print 3 · Trip cards')}</section>`;
 // P4 twist cards
 h+=`<section class="page">${head('Signature task · Step 03','New information cards','Give ONE card to each pair after step 02.')}<div class="four" style="height:222mm;gap:4mm">${LS.TWISTS.map(t=>`<div class="tw"><div class="k">Card ${t.n}</div><h2 style="margin-top:3mm">${t.title}</h2><div class="x">${t.text}</div>${t.small?`<div class="sm">${t.small}</div>`:''}<div class="task">${t.task}</div></div>`).join('')}</div>${foot('Print 4 · New information cards')}</section>`;
 // P5 weather cards
 h+=`<section class="page">${head('Stage 7 · Change the weather','Weather cards','For student B (the friend). Don’t show your card to A!')}<div class="four" style="height:222mm;gap:4mm">${LS.WCARDS.map(c=>`<div class="tw" style="background:#fff"><div class="k">Weather card ${c.n}</div><div style="display:flex;gap:4mm;margin:6mm 0">${c.icons.map(k=>ic(k,70)).join('')}</div><div class="x" style="font-size:17pt;font-weight:700">${c.text}</div><div class="task">B: say “It's … this week.”</div></div>`).join('')}</div>${foot('Print 5 · Weather cards')}</section>`;
 // P6 list card x2
 const lc=`<div class="cut lc"><div style="display:flex;justify-content:space-between"><div><div class="k">Final task</div><h2 style="font-size:20pt;margin-top:1mm">My Travel Bag</h2></div><div class="m" style="text-align:right">Plan → Check → Decide → Update</div></div>
 <div>I'm going to <span class="ln" style="min-width:55mm"></span> for <span class="ln" style="min-width:12mm"></span> days.</div>
 <div>The weather: ${['sunny','rainy','hot','cold'].map(k=>`<span class="wx">${ic(k,24)}<span class="bx"></span></span>`).join('')}</div>
 <div>Activities: <span class="ln" style="min-width:110mm"></span></div>
 <div class="b">I'm taking:</div><div class="tk">${[1,2,3,4,5,6].map(i=>`<div><span class="k">${i}</span> <span class="ln" style="min-width:70mm"></span></div>`).join('')}</div>
 <div><span class="b">I'm not taking:</span> <span class="ln"></span> &nbsp; It's <span class="ln"></span>.</div>
 <div><span class="k">Changes</span> <span class="ln" style="min-width:140mm"></span></div>
 <div class="m" style="margin-top:auto">Checker: ask 1 question · make 1 suggestion — Traveller: decide · update</div></div>`;
 h+=`<section class="page"><div class="two" style="height:262mm">${lc}${lc}</div>${foot('Print 6 · List card ×2')}</section>`;
 return doc('TTE L01 Classroom Materials',`<style>${MAT_CSS}</style>`+h);
}

// ---------- TOOLKIT ----------
function toolkit(){
 const TK=LS.TOOLKIT;
 const list=(k,arr)=>`<div class="sec"><div class="k">${k}</div>${arr.map(t=>`<div class="row">${t.replace(/  \/  /g,' &nbsp;/&nbsp; ')}</div>`).join('')}</div>`;
 const css=`.grid{display:grid;grid-template-columns:1fr 1fr;gap:4mm 10mm}.sec .row{font-size:11.5pt;padding:1.6mm 0;border-bottom:.6pt solid rgba(11,20,64,.15)}.sec .row:last-child{border-bottom:none}
 .words{display:grid;grid-template-columns:repeat(7,1fr);gap:2mm 2mm;margin:3mm 0 5mm}.words div{text-align:center;font-size:9pt;font-weight:700}.words .a{font-weight:400;color:var(--mute)}
 .ex{background:var(--sand);padding:4mm 6mm;margin-top:5mm;font-size:10.5pt;line-height:1.45}`;
 const words=LS.CORE.map(([k,a,w])=>`<div>${ic(k,34)}<br>${a?`<span class="a">${a}</span> `:''}${w}</div>`).join('');
 const b=`<section class="page">${head('Travel Toolkit · Lesson 01','Packing for a trip','Your travel reference. Use it the night before your next trip.')}
 <div class="k">Pack it · 14 things</div><div class="words">${words}</div>
 <div class="grid">${list('Ready-made phrases',TK.phrases)}${list('Useful questions',TK.questions)}${list('Useful answers',TK.answers)}${list("Check a friend's bag",TK.checker)}</div>
 <div class="grid" style="margin-top:4mm">${list('Repair',TK.repair)}<div class="sec"><div class="k">Weather</div><div style="display:flex;gap:5mm;margin-top:3mm">${LS.WEATHER.map(([k,w])=>`<div style="text-align:center;font-size:10pt;font-weight:700">${ic(k,40)}<br>It's ${w}.</div>`).join('')}</div></div></div>
 <div class="ex"><div class="k" style="margin-bottom:1.5mm">Example list</div><b>Lisbon · 3 days · sunny, rainy Day 2</b><br><span class="o b">I'm taking:</span> a passport, a phone charger, shoes, a sweater, a raincoat, sunglasses.<br><span class="o b">I'm not taking:</span> an umbrella. I have a raincoat.<br><span class="o b">Changes:</span> + a jacket (It's cold at night.)</div>
 ${foot('Lesson 01 · A1')}</section>`;
 return doc('TTE L01 Travel Toolkit',`<style>${css}</style>`+b);
}

// ---------- AUDIO SCRIPT ----------
function audioScript(){
 const marks=JSON.parse(fs.readFileSync(path.join(LDIR,'Source Files/Audio/TTE_L01_A01_Leos-Call_timing-marks_v1.0.json')));
 const byTurn={};marks.forEach(m=>{(byTurn[m.turn]=byTurn[m.turn]||[]).push(m)});
 const fmt=t=>{const s=Math.floor(t);return `0:${String(s).padStart(2,'0')}`;};
 const rows=LS.SCRIPT.map(([sp,t],i)=>{const ms=byTurn[i+1];return `<tr><td class="m">${String(i+1).padStart(2,'0')}</td><td class="m">${fmt(ms[0].start)}–${fmt(ms[ms.length-1].end)}</td><td class="k">${sp}</td><td>${t}</td></tr>`}).join('');
 const dur=marks[marks.length-1].end+0.55;
 const css=`table{border-collapse:collapse;width:100%;margin-top:3mm}td,th{padding:2mm 2.5mm;border-bottom:.6pt solid rgba(11,20,64,.15);font-size:11pt;vertical-align:top;text-align:left}th{font-family:'JetBrains Mono';font-size:7.5pt;letter-spacing:.1em;color:var(--mute);font-weight:400;text-transform:uppercase}
 .blk{margin-top:6mm}.blk p{font-size:10.5pt;line-height:1.45;margin-top:1.5mm}`;
 const b=`<section class="page">${head('Audio source script · Lesson 01',"Leo's Call",`A01 · 0:${String(Math.round(dur)).padStart(2,'0')} · A1 · International English · two speakers`)}
 <table><tr><th>#</th><th>Time</th><th>Speaker</th><th>Line (final transcript)</th></tr>${rows}</table>
 <div class="blk"><div class="k">Speakers</div><p><b>LEO</b> — the traveller. Male voice, US-accented International English.<br><b>SOFIA</b> — Leo's friend who lives in Madrid. Female voice, UK-accented International English.<br>Two clearly different voices and accents; no exaggerated accents; no idioms.</p></div>
 <div class="blk"><div class="k">Delivery</div><p>A1 pacing (speech rate 0.88 of the voice default), 0.55 s pause between turns and 0.22 s between sentences. Total ${dur.toFixed(1)} s. Normal speed only — no slow version (the A1 pace is already controlled).</p></div>
 ${foot('Audio script · page 1')}</section>
 <section class="page">${head('Audio source script · Lesson 01','Files and where they are used')}
 <table><tr><th>Code</th><th>File (Lesson 01/Audio)</th><th>Content</th><th>Used in the PPTX</th></tr>
 <tr><td class="k">A01</td><td>TTE_L01_A01_Leos-Call_v1.0.mp3</td><td>Full conversation (${dur.toFixed(0)} s)</td><td>Slide 9 (Listen 1 — gist) and slide 10 (Listen 2 — detail), embedded. Optional replay (from slide 10) to check the slide 12 gap-fill.</td></tr>
 <tr><td class="k">A02</td><td>TTE_L01_A02_Say-It-1_I-need-sunscreen_v1.0.mp3</td><td>“I need sunscreen.” (Leo, turn 14)</td><td>Slide 14 (Say it), line 1, embedded</td></tr>
 <tr><td class="k">A03</td><td>TTE_L01_A03_Say-It-2_Im-taking-a-swimsuit_v1.0.mp3</td><td>“I'm taking a swimsuit.” (Leo, turn 12)</td><td>Slide 14 (Say it), line 2, embedded</td></tr>
 <tr><td class="k">A04</td><td>TTE_L01_A04_Say-It-3_Im-not-taking-shorts_v1.0.mp3</td><td>“I'm not taking shorts.” (Leo, turn 6)</td><td>Slide 14 (Say it), line 3, embedded</td></tr></table>
 <div class="blk"><div class="k">Pronunciation model lines</div><p>A02–A04 are cut sample-exact from A01 (not re-recorded), so the model lines are Leo's own words. Phase 1 listed “I'm taking a jacket” as a model line; the script only has “I'm taking trousers and a jacket”, so the verbatim line “I'm taking a swimsuit” is used instead. “I need a jacket” remains the backchaining example on slide 14.</p></div>
 <div class="blk"><div class="k">Answer keys</div><p><b>Listen 1:</b> Madrid · four days · sunny in the day, cold at night · walk and swim.<br><b>Listen 2:</b> taking — trousers, jacket, shoes, swimsuit, sunscreen, sunglasses · not taking — shorts, umbrella.</p></div>
 <div class="blk"><div class="k">Production and verification</div><p>Voices are synthetic (neural text-to-speech, Kokoro model: voices “am_michael” for Leo and “bf_emma” for Sofia), generated sentence by sentence and assembled with fixed pauses. Master: 24 kHz mono WAV (Source Files/Audio); delivery: 128 kbps MP3.<br>Verification: the finished file was transcribed by an independent speech recogniser (Whisper base.en). Every word matched the script; the only differences were punctuation, capital letters and the spelling “Sophia”.<br>Recommended before commercial release: re-record with two voice actors using this script and timing sheet.</p></div>
 ${foot('Audio script · page 2')}</section>`;
 return doc('TTE L01 Audio Script',`<style>${css}</style>`+b);
}
(async()=>{
 const out=[['Teacher Lesson Plan/TTE_L01_Classroom-Materials_Print_v1.0.pdf',materials(),'TTE_L01_Classroom-Materials.html'],
  ['Toolkit/TTE_L01_Travel-Toolkit_v1.0.pdf',toolkit(),'TTE_L01_Travel-Toolkit.html'],
  ['Audio/TTE_L01_Audio-Script_v1.0.pdf',audioScript(),'TTE_L01_Audio-Script.html']];
 const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const pg=await br.newPage();
 for(const [pdf,html,src] of out){const hp=path.join(LDIR,'Source Files/Print-HTML',src);fs.writeFileSync(hp,html);
  await pg.goto('file://'+hp);await pg.evaluate(()=>document.fonts.ready);await pg.pdf({path:path.join(LDIR,pdf),preferCSSPageSize:true,printBackground:true});console.log('ok',pdf);}
 await br.close();})();
