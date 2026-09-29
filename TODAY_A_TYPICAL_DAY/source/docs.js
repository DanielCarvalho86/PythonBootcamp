const {chromium}=require('playwright-core');const fs=require('fs');const {I,svg}=require('./icons');const D=require('./data');
const OUTDIR=process.argv[2];
const ic=(n,sz=40)=>svg(n,{size:sz});
const logo='data:image/png;base64,'+fs.readFileSync('/tmp/td/logo_primary_navy_crop.png').toString('base64');
const q=s=>s.replace(/'/g,'’');
const CSS=`:root{--navy:#0B1440;--navy2:#141E52;--or:#F44904;--paper:#FAF7F2;--sand:#F3EFE6;--ink:#5B6088;--line:#DDD6C7;--muted:#B7AFA0}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Hanken Grotesk';color:var(--navy);-webkit-print-color-adjust:exact;print-color-adjust:exact}
@page{size:A4;margin:0}
.page{width:210mm;height:297mm;padding:16mm 16mm 14mm;background:var(--paper);position:relative;overflow:hidden;break-after:page}
.page:last-child{break-after:auto}
.k{font-family:'JetBrains Mono Medium';font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:var(--ink)}.k b{color:var(--or);font-weight:400}
.lab{font-family:'JetBrains Mono Medium';font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:var(--or);margin:6mm 0 2.5mm}
h1{font-family:'Poppins ExtraBold';font-size:34pt;line-height:1;margin:3mm 0 2mm}
h2{font-family:'Poppins';font-weight:700;font-size:15pt;line-height:1.15}
.sub{font-family:'Poppins SemiBold';font-size:12pt;color:var(--ink)}
.top{display:flex;justify-content:space-between;align-items:flex-start}
.foot{position:absolute;left:16mm;right:16mm;bottom:9mm;display:flex;justify-content:space-between}
.card{background:var(--sand);border-radius:3.5mm;padding:4mm 4.5mm}
.o{color:var(--or)}.b{font-weight:700}.ink{color:var(--ink)}.ed{font-family:'Poppins SemiBold'}
.strike{text-decoration:line-through;color:var(--muted)}
table{border-collapse:collapse;width:100%}td,th{text-align:left;vertical-align:top}
.ln{display:inline-block;border-bottom:1px solid var(--navy);height:5mm;vertical-align:bottom}
.box{display:inline-block;width:3.6mm;height:3.6mm;border:1.2px solid var(--navy);border-radius:.8mm;vertical-align:-0.5mm}`;
function doc(t,body){body=body.replace(/[→↔]/g,m=>`<span style="font-family:'JetBrains Mono Medium'">${m}</span>`);return `<!doctype html><html><head><meta charset="utf-8"><title>${t}</title><style>${CSS}</style></head><body>${body}</body></html>`;}
const head=(k,t,sub)=>`<div class="top"><div><div class="k"><b>—</b> ${k}</div><h1>${t}</h1>${sub?`<div class="sub">${sub}</div>`:''}</div><img src="${logo}" style="height:16mm"></div>`;
const foot=(l,r)=>`<div class="foot"><span class="k">${l}</span><span class="k">${r}</span></div>`;

// ---------------- STUDENT PDF ----------------
function student(){
 const ex={get_up:'I get up at 6:30.',have_breakfast:'I have breakfast at home.',go_to_work:'I go to work by car.',start_work:'I start work at 8:00.',have_lunch:'I have lunch at 12:30.',take_a_break:'I take a break at 3:00.',finish_work:'I finish work at 6:00.',go_home:'I go home at 6:30.',watch_tv:'I watch TV after dinner.',go_to_bed:'I go to bed at 11:00.'};
 const p1=`<section class="page">${head('Student notes · A1 / A1+','A Typical Day','Habits, routines &amp; everyday life')}
 <p style="font-size:10.5pt;margin-top:5mm;max-width:150mm;line-height:1.45">Use these notes before, during and after the lesson. <b>Before:</b> tick the things you do every day. <b>After:</b> say one true sentence for each phrase.</p>
 <div class="lab">Everyday routine · key verb phrases</div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm">${D.ROUTINE.map(([k,p])=>`<div class="card" style="display:flex;gap:4mm;align-items:center;padding:3mm 4mm">${ic(k,38)}<div style="flex:1"><div class="ed" style="font-size:12.5pt">${p}</div><div class="ink" style="font-size:9.5pt;margin-top:.6mm">${q(ex[k])}</div></div><span class="box"></span></div>`).join('')}</div>
 <div class="card" style="margin-top:6mm;background:var(--navy);color:var(--paper);display:flex;justify-content:space-between;align-items:center"><div><div class="k" style="color:var(--muted)">In the lesson</div><div class="ed" style="font-size:14pt;margin-top:1mm">What’s a typical day like for you?</div></div><div class="k" style="color:var(--or)">Talk · notice · practise · fix</div></div>
 ${foot('Today · A Typical Day','01 / 06')}</section>`;
 const third={'Get up':'gets up','Arrive at the clinic':'arrives at the clinic','See patients':'sees patients','Examine a patient':'examines a patient','Have lunch':'has lunch','Check medical records':'checks medical records','Finish work':'finishes work'};
 const wex=[['hospital','work at a hospital',"She works at a hospital."],['clinic','work at a clinic',"He works at a clinic."],['see_patients','see patients',"I see patients every day."],['examine','examine a patient',"He examines a patient at 10:00."],['check_patient','check a patient',"She checks a patient after lunch."],['appointments','have appointments',"I have appointments in the afternoon."],['records','check medical records',"He checks medical records at 4:00."],['weekends','work on weekends',"I don't work on weekends."]];
 const p2=`<section class="page">${head('Student notes · Vocabulary','A Doctor’s Day','Dr. Lucas — a fictional doctor')}
 <div style="display:grid;grid-template-columns:62mm 1fr;gap:8mm;margin-top:5mm">
 <div><div class="lab" style="margin-top:0">His day</div>${D.LUCAS.day.map(([t,k,p])=>`<div style="display:flex;align-items:center;gap:3mm;padding:1.6mm 0;border-bottom:.6pt solid var(--line)"><span class="k" style="width:11mm;color:var(--navy)">${t}</span>${ic(k,26)}<span style="font-size:10.5pt">He <b>${third[p]}</b>.</span></div>`).join('')}
 <div class="card" style="margin-top:4mm;font-size:9.5pt;line-height:1.5"><span class="o b">he / she + -s</span><br>he get<b class="o">s</b> up · he see<b class="o">s</b> · he ha<b class="o">s</b> lunch · he finish<b class="o">es</b></div></div>
 <div><div class="lab" style="margin-top:0">Work vocabulary</div>${wex.map(([k,p,e])=>`<div style="display:flex;align-items:center;gap:4mm;padding:2.4mm 0;border-bottom:.6pt solid var(--line)">${ic(k,32)}<div><div class="ed" style="font-size:12pt">${p}</div><div class="ink" style="font-size:9.5pt">${q(e)}</div></div></div>`).join('')}
 <p class="ink" style="font-size:9pt;margin-top:3mm">Also: <b>take a break</b> — I take a break at 3:00.</p></div></div>
 ${foot('Today · A Typical Day','02 / 06')}</section>`;
 const row=(a,b,c)=>`<tr><td style="padding:2mm 0;border-bottom:.6pt solid var(--line);width:27%" class="k">${a}</td><td style="padding:2mm 3mm 2mm 0;border-bottom:.6pt solid var(--line);width:40%;font-size:12pt" class="ed">${b}</td><td style="padding:2mm 0;border-bottom:.6pt solid var(--line);font-size:12pt" class="ed">${c}</td></tr>`;
 const p3=`<section class="page">${head('Student notes · Grammar','Simple Present','For habits, routines and things that are generally true.')}
 <div class="lab">Affirmative</div><table>${row('I / you / we / they','I <b>work</b>.','They <b>work</b>.')}${row('he / she / it','He work<b class="o">s</b>.','She work<b class="o">s</b>.')}</table>
 <div class="lab">Negative</div><table>${row('I / you / we / they','I <b class="o">don’t</b> work.','We <b class="o">don’t</b> work.')}${row('he / she / it','He <b class="o">doesn’t</b> work.','She <b class="o">doesn’t</b> work.')}</table>
 <div class="lab">Questions · short answers</div><table>${row('I / you / we / they','<b class="o">Do</b> you work at night?','Yes, I do. / No, I don’t.')}${row('he / she / it','<b class="o">Does</b> he work at night?','Yes, he does. / No, he doesn’t.')}</table>
 <div class="card" style="background:var(--navy);color:var(--paper);margin-top:7mm;display:flex;align-items:center;gap:4mm;padding:5mm 6mm">
 ${[['DOES',1],['+',0],['HE',2],['+',0],['WORK',2]].map(([t,k])=>k===0?`<span style="font-family:Poppins;font-weight:700;font-size:18pt;color:var(--muted)">+</span>`:`<span style="font-family:'Poppins ExtraBold';font-size:18pt;padding:2mm 4mm;border-radius:2mm;background:var(--navy2);border:1.2px solid ${k===1?'#F44904':'#5B6088'};color:${k===1?'#F44904':'#FAF7F2'}">${t}</span>`).join('')}
 <span style="margin-left:4mm;font-family:Poppins;font-weight:700;font-size:13pt"><span class="k" style="color:var(--muted)">not</span> <span style="text-decoration:line-through;color:var(--muted)">Does he works?</span></span></div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:6mm">
 <div class="card"><div class="k" style="color:var(--or)">Spelling · he / she / it</div><p style="font-size:10.5pt;line-height:1.6;margin-top:2mm">work → work<b class="o">s</b> · live → live<b class="o">s</b><br>watch → watch<b class="o">es</b> · finish → finish<b class="o">es</b><br>study → stud<b class="o">ies</b> · go → go<b class="o">es</b> · do → do<b class="o">es</b><br>have → <b class="o">has</b></p></div>
 <div class="card"><div class="k" style="color:var(--or)">Say it · the -s sound</div><p style="font-size:10.5pt;line-height:1.6;margin-top:2mm"><b>/s/</b> He works at night.<br><b>/z/</b> She lives in Brazil.<br><b>/iz/</b> He watches TV after work.</p></div></div>
 ${foot('Today · A Typical Day','03 / 06')}</section>`;
 const fr=[['What time','do','you','get up?'],['Where','do','you','work?'],['What','do','you','do after work?'],['How many patients','do','you','see?'],['What time','does','she','start?'],['Where','does','he','work?'],['','Do','you','work on weekends?'],['','Does','she','work on Sundays?']];
 const p4=`<section class="page">${head('Student notes · Questions','Useful Questions','Question word + do / does + person + verb')}
 <table style="margin-top:5mm">${['Question word','do / does','Person','Verb …'].map(h=>`<th class="k" style="padding:2mm 0;border-bottom:1pt solid var(--navy)">${h}</th>`).join('')}${fr.map(r=>`<tr>${r.map((c,i)=>`<td style="padding:2.2mm 0;border-bottom:.6pt solid var(--line);font-size:12pt" class="${i===1?'o b':'ed'}">${c||'—'}</td>`).join('')}</tr>`).join('')}</table>
 <p class="ink" style="font-size:9.5pt;margin-top:2.5mm">After <b>do / does</b>, use the base verb: Does she <b>start</b>? — not <span class="strike">Does she starts?</span></p>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:6mm">
 ${[['Dr. Sarah','S','#F44904','#0B1440',['Where?','Start?','Patients a day?','Sundays?','Lunch?','Finish?']],['Dr. Ben','B','#F3EFE6','#0B1440',['Where?','Start?','At night?','Patients?','Weekends?','Finish?']]].map(([n,i,bg,fg,f])=>`<div class="card" style="background:#fff;border:1pt solid var(--line)"><div style="display:flex;align-items:center;gap:3mm"><span style="width:10mm;height:10mm;border-radius:2mm;background:${bg};${bg==='#F3EFE6'?'border:1.2px solid #0B1440;':''}display:flex;align-items:center;justify-content:center;font-family:'Poppins ExtraBold';font-size:14pt;color:${fg}">${i}</span><div><div class="b" style="font-family:Poppins;font-size:12pt">${n}</div><div class="k">My notes · in the lesson</div></div></div>
 ${f.map(x=>`<div style="display:flex;gap:2mm;margin-top:3mm;font-size:10pt"><span style="width:26mm" class="ink">${x}</span><span class="ln" style="flex:1"></span></div>`).join('')}</div>`).join('')}</div>
 ${foot('Today · A Typical Day','04 / 06')}</section>`;
 const p5=`<section class="page">${head('Student notes · Your turn','My Typical Day','Write notes, then tell your teacher.')}
 <div class="lab">My weekday</div>
 <table>${['','','','','','','',''].map((_,i)=>`<tr><td style="width:24mm;padding:2.6mm 0;border-bottom:.6pt solid var(--line)"><span class="k">Time</span> <span class="ln" style="width:12mm"></span></td><td style="padding:2.6mm 0;border-bottom:.6pt solid var(--line)"><span class="ln" style="width:100%"></span></td></tr>`).join('')}</table>
 <div class="lab">Sentence starters</div>
 <div class="card" style="font-size:11.5pt;line-height:2">I get up at <span class="ln" style="width:22mm"></span>. &nbsp; I start work at <span class="ln" style="width:22mm"></span>.<br>I see about <span class="ln" style="width:14mm"></span> patients a day. &nbsp; I don’t <span class="ln" style="width:40mm"></span> on weekends.<br>After work, I <span class="ln" style="width:60mm"></span>.</div>
 <div class="lab">Someone I know</div>
 <div class="card" style="font-size:11.5pt;line-height:2">My <span class="ln" style="width:28mm"></span> (friend / colleague / partner) work<b class="o">s</b> at <span class="ln" style="width:40mm"></span>.<br>He / She <span class="ln" style="width:45mm"></span><b class="o">s</b> every day. &nbsp; He / She <b class="o">doesn’t</b> <span class="ln" style="width:35mm"></span>.</div>
 ${foot('Today · A Typical Day','05 / 06')}</section>`;
 const rv=[["She ______ (work) at a hospital.","works"],["______ he see patients on Saturdays?","Does"],["I ______ (not / work) at night.","don’t work"],["He doesn’t ______ (finish) at 6:00.","finish"],["What time ______ you start work?","do"]];
 const p6=`<section class="page">${head('Student notes · Check','Quick Review','Five sentences. Complete them.')}
 <div style="margin-top:6mm">${rv.map(([s],i)=>`<div style="display:flex;gap:5mm;align-items:baseline;padding:4mm 0;border-bottom:.6pt solid var(--line)"><span class="k" style="color:var(--or)">0${i+1}</span><span class="ed" style="font-size:15pt">${q(s).replace('______','<span class="ln" style="width:30mm"></span>')}</span></div>`).join('')}</div>
 <div class="card" style="background:var(--navy);color:var(--paper);margin-top:8mm;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm">
 ${[['I / you / we / they','→ WORK','#FAF7F2'],['he / she / it','→ WORKS','#F44904'],['does / doesn’t','→ WORK','#FAF7F2']].map(([a,b,c])=>`<div><div class="k" style="color:var(--muted)">${a}</div><div style="font-family:'Poppins ExtraBold';font-size:17pt;color:${c};margin-top:1mm">${b}</div></div>`).join('')}</div>
 <div class="card" style="margin-top:6mm"><div class="k" style="color:var(--or)">Next time</div><p class="ed" style="font-size:12pt;margin-top:1.5mm">How often do you work on weekends? — always · usually · sometimes · never</p></div>
 <p class="k" style="position:absolute;bottom:18mm;left:16mm">Answers · 1 works · 2 Does · 3 don’t work · 4 finish · 5 do</p>
 ${foot('Today · A Typical Day','06 / 06')}</section>`;
 return doc('Today — A Typical Day — Student',p1+p2+p3+p4+p5+p6);
}

// ---------------- TEACHER PLAN ----------------
function teacher(){
 const tcss=`@page{size:A4;margin:14mm 15mm 16mm;background:#FAF7F2;@bottom-left{content:'TODAY · A TYPICAL DAY · TEACHER LESSON PLAN';font-family:'JetBrains Mono Medium';font-size:7pt;letter-spacing:.14em;color:#5B6088}@bottom-right{content:counter(page) ' / ' counter(pages);font-family:'JetBrains Mono Medium';font-size:7pt;color:#5B6088}}
 html,body{background:#FAF7F2}.tsec{break-before:page}.tsec:first-of-type{break-before:auto} h3{break-after:avoid}.proc .t td{font-size:8.2pt;padding:1.3mm 1.8mm;line-height:1.3}.tsec h1{font-size:28pt}.tsec .lab,.tsec .card{margin-top:3mm}.card{break-inside:avoid}.t td,.t th{padding:1.5mm 2mm;border-bottom:.6pt solid var(--line);font-size:8.6pt;line-height:1.34}.t th{font-family:'JetBrains Mono Medium';font-size:7pt;letter-spacing:.1em;text-transform:uppercase;color:var(--paper);background:var(--navy);font-weight:400}
 .t tr{break-inside:avoid}p,li{font-size:9.1pt;line-height:1.4}ul{padding-left:4.5mm}li{margin:.5mm 0}.flow{height:auto;min-height:297mm;overflow:visible}
 h3{font-family:Poppins;font-weight:700;font-size:11pt;margin:3.6mm 0 1.2mm}.q{font-family:'Poppins SemiBold'}`;
 const T=(heads,rows,w)=>`<table class="t"><tr>${heads.map((h,i)=>`<th style="width:${w[i]}">${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
 let st=0;const time=D.STAGES.map(s=>{const a=st;st+=s[3];return `${a}–${st}`;});
 const proc=[
 ['Ask “What’s a typical day like for you?” Follow up only as needed: “What time do you get up? What do you do in the morning? What time do you start work?” Don’t correct. Start the error log.','Activate the topic; begin diagnosing spontaneous simple present.'],
 ['“Tell me about a normal weekday — morning to evening.” The student speaks along the day line. Support questions only when the student stops. Log errors.','Establish a baseline and identify priority errors.'],
 ['S4: times + icons only — elicit “What does he do at 7:00?” S5: reveal phrases; the student tells Dr. Lucas’s day; ask the 3 questions. S6: “Which of these do you do? When?” — true sentences, including negatives.','Review/expand routine and work vocabulary; connect it to the target language; personalise.'],
 ['S7: show the pairs with no highlighting. Ask one question at a time: What’s different? Why “works”? Why doesn’t “work” change? What comes after “does”? S8: the student states the pattern; confirm with the slide. Point to DOES + HE + WORK.','Guided discovery of the form: 3rd-person -s; doesn’t / does + base verb.'],
 ['“Right or wrong? Fix the wrong ones.” The student corrects orally. Refer back to S8 rather than re-explaining.','Controlled accuracy practice.'],
 ['S10: “This is Dr. Sarah. You don’t know her day. Ask me — find six things.” Answer only well-formed questions; if the form is wrong, look puzzled and wait. S11: question frames if needed; then “Tell me about Dr. Sarah.”','Meaningful do/does question practice; 3rd-person retelling.'],
 ['NOTICE works / lives / watches → LISTEN (model ×2) → REPEAT → USE: “Tell me about a friend or a colleague.”','Intelligibility of 3rd-person -s (/s/ /z/ /iz/).'],
 ['R1 (S13): the student interviews you about Dr. Ben (you answer as his colleague). R2 (S14): you interview the student. R3 (S15): no prompts — “Tell me about your typical working day.” Monitor; don’t interrupt. During R3, type 3–5 real errors into S16.','Transfer the target language to personalised, freer communication.'],
 ['Show the student’s real errors one at a time: “Can you fix it?” Guided self-correction; reformulate only if needed. Close with the pattern box.','Address priority errors without disrupting fluency.'],
 ['“So, what does a typical day look like for you?” 4–5 sentences, no help. Check with the exit checklist (Appendix D). Mention next time: How often…?','Check progress against the main aim.']];
 const procRows=D.STAGES.map((s,i)=>[`<b>${s[0]}. ${s[1]}</b><br><span class="q">“${q(s[2])}”</span><br><span class="k">Slides ${s[5]}</span>`,`${s[3]} min<br><span class="k">${time[i]}</span>`,s[4],q(proc[i][0]),q(proc[i][1])]);
 const detail=[
 ['1 · Lead-in (4 min · slides 1–2)','“What’s a typical day like for you?”',['I wake up at six, I go to the hospital…','I am work in a clinic. (diagnostic)'],'I am work / I working; missing -s in any he/she mention.'],
 ['2 · Diagnostic speaking (5 min · slide 3)','“Tell me about a normal weekday — from the morning to the evening.”',['I get up at 6:30. I go to work by car. I see patients all morning…'],'Tense mixing (I went / I go); “I am…” + verb; he don’t (if they mention colleagues).'],
 ['3 · Vocabulary discovery (7 min · slides 4–6)','“What does he do at 7:00? … and at 8:30?” → “Which of these things do you do? When?”',['He gets up. He arrives at the clinic. He sees patients…','No, he doesn’t. He works at a clinic. · He finishes at 6:00.'],'He see / he finish (no -s); “examinate”; “medical registers” for medical records.'],
 ['4 · Language discovery (7 min · slides 7–8)','“What’s different?” / “Why do we say ‘works’ here?” / “What happens after ‘does’?”',['Works — because it’s he.','After does — no s. / Does has the s.'],'The student may over-apply -s (Does he works?) or say “because present”. CCQ: “He — one person or more?” “Is ‘works’ OK after does?”'],
 ['5 · Right or wrong? (5 min · slide 9)','“Right or wrong? Fix the wrong ones.”',['1 He works… · 2 I work… · 3 right · 4 Does he work… · 5 right'],'Accepting 4 as right (the -s “looks” correct). Point to DOES + HE + WORK.'],
 ['6 · Information gap (7 min · slides 10–11)','“Ask me. Find six things about Dr. Sarah.” → “Now tell me about Dr. Sarah.”',['Where does she work? What time does she start? How many patients does she see? Does she work on Sundays?','She works in a hospital. She starts at 7:30…'],'Where she works? / Does she works? / What time she start? — withhold the answer until the question is well formed.'],
 ['7 · Pronunciation (3 min · slide 12)','“Listen — are the endings the same?”',['works /s/ · lives /z/ · watches /iz/'],'Adding an extra syllable to works (“work-es”); dropping the -s completely.'],
 ['8 · Doctor vs. Doctor (10 min · slides 13–15)','R1 “Ask me about Dr. Ben.” · R2 “Now I ask you.” · R3 “Tell me about your typical working day.”',['Does he work at night? — Yes, he does.','I start work at 7:00. I don’t work on Sundays.'],'Mixing do/does across rounds (Do he…?); dropping -s in fluent R3 speech.'],
 ['9 · Delayed correction (5 min · slide 16)','“Is it right? Can you fix it?”',['He doesn’t work on Sunday.'],'Correcting the wrong part — prompt with the pattern box, not an explanation.'],
 ['10 · Exit task (2 min · slide 17)','“So, what does a typical day look like for you?”',['4–5 spontaneous sentences'],'Measure: fewer slips from today’s error log.']];
 const p1=`<section class="tsec"><style>${tcss}</style>${head('Teacher lesson plan','A Typical Day','Habits, routines &amp; everyday life')}
 ${T(['Lesson','Details'],[['Level','A1 / A1+'],['Duration','60 minutes (55 min core + about 5 min flexibility for natural 1-to-1 interaction)'],['Class','1 teacher + 1 adult student · in person or online'],['Student profile','Adult doctor. Communicates successfully but makes frequent grammar slips.'],['Course','General English / Conversation — not a medical English lesson; medical vocabulary is personal context only.'],['Language reference','American English File 1, 3rd ed., Lessons 3A–3B and Grammar Bank 3A/3B (simple present + / − / ?, 3rd-person -s, verb phrases, jobs). Adapted, not reproduced.'],['Materials','01 Student PPTX (17 slides, teacher notes in speaker notes) · 02 Student PDF (6 pages) · this plan (error log in Appendix C)']],['28%','72%'])}
 <h3>Main aim</h3><p>By the end of the lesson, the student will be better able to use the simple present accurately to describe routines, habits and everyday activities, and to ask and answer questions about routines.</p>
 <h3>Subsidiary aims</h3><ul><li>Review and expand useful daily-routine and work vocabulary; use verb phrases to describe their own routine.</li><li>Improve accuracy with 3rd-person -s, do/does, don’t/doesn’t and the base verb after auxiliaries.</li><li>Practise the pronunciation of 3rd-person -s (/s/ /z/ /iz/).</li><li>Take part in short spontaneous exchanges about routines.</li></ul>
 <h3>Target language</h3>${T(['Form','Examples'],[['Affirmative','I work. · You work. · He works. · She works.'],['Negative','I don’t work. · He doesn’t work.'],['Questions','Do you work…? · Does he work…? · Where does she work? · What time does he start?'],['Short answers','Yes, I do. / No, I don’t. · Yes, he does. / No, he doesn’t.'],['High-priority errors','He work at a hospital → He <b>works</b> · He doesn’t works → He doesn’t <b>work</b> · Does he works? → Does he <b>work</b>? · I am work → I <b>work</b> · He don’t → He <b>doesn’t</b>']],['24%','76%'])}
 <h3>Vocabulary</h3><p><b>Routine:</b> get up · have breakfast · go to work · start work · have lunch · take a break · finish work · go home · watch TV · go to bed.<br><b>Work / light medical (context only):</b> work at a hospital · work at a clinic · see patients · examine a patient · check a patient · have appointments · check medical records · work on weekends. <b>Also in the Doctor’s Day:</b> arrive at the clinic.</p>
 <h3>Assumptions</h3><ul><li>The student already uses the simple present, but not accurately; the lesson is about accuracy in communication, not first presentation.</li><li>The student knows most routine verbs; “examine”, “medical records” and “appointments” may need eliciting in English.</li><li>As a doctor, the student has a real routine to talk about — personalisation is genuine.</li><li>Grammar terms are not needed; “base verb” is used only in this plan and on the pattern slide label.</li></ul>
 </section>`;
 const p2=`<section class="tsec">${head('Teacher lesson plan','Procedure','Stage · Time · Interaction · Procedure · Aim')}<div style="height:2mm"></div>
 <div class="proc">${T(['Stage','Time','Interaction','Procedure','Aim'],procRows,['19%','9%','9%','41%','22%'])}</div>
 <p style="margin-top:3mm"><b>Total core time: 55 minutes.</b> Use the remaining 5 minutes for natural follow-up conversation — don’t stretch activities to fill it.</p>
 </section>`;
 const p3=`<section class="tsec">${head('Teacher lesson plan','Stage notes','Teacher instructions · expected responses · language problems')}<div style="height:4mm"></div>
 ${T(['Stage','Teacher says','Expected student responses','Potential language problems'],detail.map(d=>[`<b>${d[0]}</b>`,`<span class="q">${q(d[1])}</span>`,d[2].map(q).join('<br>'),q(d[3])]),['18%','27%','30%','25%'])}
 </section>`;
 const p4=`<section class="tsec">${head('Teacher lesson plan','Problems & correction')}
 <h3>Anticipated problems and solutions</h3>${T(['Problem','Solution'],[
 ['The student communicates fluently, so errors “don’t matter” to them.','Use their own sentences in stage 9: real errors from their own speech make the grammar relevant.'],
 ['Over-application of -s after does (Does he works?).','The DOES + HE + WORK strip (slide 8); ask “Where is the -s? — in does.”'],
 ['“I am work / I am working” for routines.','Contrast once: “Now, in this lesson?” vs “every day?” Reformulate to I work; add it to the error log.'],
 ['The student turns stage 4 into a request for rules.','Ask them to tell you the rule first; confirm in one sentence; move on.'],
 ['The lesson drifts into medical English.','Keep medical terms as personal context; redirect to routine: “And after work?”'],
 ['Stage 6 answers come too easily (the student guesses).','Answer only well-formed questions; the facts stay off-screen.'],
 ['The student is tired of being corrected.','No correction in stages 1, 2 and 8 (fluency). Correction is concentrated in stages 5 and 9.'],
 ['Time runs short.','Shorten stage 6 to four questions and Round 1 of stage 8. Never cut stage 9 or the exit task.']],['40%','60%'])}
 <h3>Error-correction strategy</h3>
 <p><b>Priority order:</b> 1 simple present form · 2 third-person -s · 3 do / does · 4 don’t / doesn’t · 5 base verb after auxiliaries.</p>
 ${T(['Error type','Example','What to do','When'],[
 ['Aim-critical (interferes with the lesson aim)','He work · Does she works? · He don’t','Log it. In controlled stages: elicit → guided self-correction (finger-point to the word, raise an eyebrow). In fluency stages: log only.','Stages 4–6 on the spot; everything else in stage 9'],
 ['Minor / incidental','prepositions (at / in hospital), articles, tense slips outside the aim','Let it go unless it blocks meaning; at most one quick reformulation.','Rarely'],
 ['Vocabulary gap','“examinate”, “medical registers”','Supply the word naturally; add it to the board / chat.','Immediately — it helps the flow'],
 ['Pronunciation','“work-es”, missing -s sound','Stage 7 model; later a quick echo only.','Stage 7, then light-touch'],
 ],['22%','22%','38%','18%'])}
 <p style="margin-top:2mm"><b>Techniques:</b> elicitation (“He…?”) · reformulation (repeat correctly, move on) · guided self-correction (point to the pattern box) · delayed correction with the student’s real sentences (stage 9). Never correct more than one thing in a sentence.</p>
 </section>`;
 const p5=`<section class="tsec">${head('Teacher lesson plan','Appendices','Teacher-only information')}
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:5mm">
 <div class="card"><div class="k" style="color:var(--or)">A · Dr. Sarah (stage 6 — do not show)</div>${D.SARAH.facts.map(([k,v])=>`<p style="margin-top:1.4mm"><span class="ink" style="display:inline-block;width:30mm">${k}</span>${q(v)}</p>`).join('')}</div>
 <div class="card"><div class="k" style="color:var(--or)">A · Dr. Ben (stage 8, Round 1 — do not show)</div>${D.BEN.facts.map(([k,v])=>`<p style="margin-top:1.4mm"><span class="ink">${q(k)}</span> — ${q(v)}</p>`).join('')}</div></div>
 <div class="card" style="margin-top:4mm"><div class="k" style="color:var(--or)">B · Right or wrong? key (stage 5)</div><p style="margin-top:1.5mm">${D.RW.map(([s,ok,c],i)=>`${i+1} ${q(s)} → ${ok?'<b>right</b>':'<b>wrong</b> — '+q(c)}`).join('<br>')}</p></div>
 <div class="k" style="color:var(--or);margin-top:6mm">C · Error log (use during stages 1, 2, 6 and 8)</div>
 ${T(['Stage','What the student said','Type (-s / do-does / don’t-doesn’t / base verb / other)','Use in stage 9?'],Array.from({length:6},()=>['','','','']),['10%','46%','30%','14%']).replace(/<td><\/td>/g,'<td style="height:7.5mm"></td>')}
 <div class="card" style="margin-top:5mm"><div class="k" style="color:var(--or)">D · Exit task checklist (stage 10)</div><p style="margin-top:1.5mm"><span class="box"></span> 4–5 sentences in the simple present &nbsp; <span class="box"></span> routine vocabulary used &nbsp; <span class="box"></span> 3rd-person -s correct where used &nbsp; <span class="box"></span> questions / negatives correct where used &nbsp; <span class="box"></span> fewer of today’s logged slips than in stage 2</p></div>
 <div class="card" style="margin-top:4mm"><div class="k" style="color:var(--or)">E · Follow-up lesson</div><p style="margin-top:1.5mm">Frequency adverbs — always · usually · sometimes · never — and “How often do you work on weekends? / How often do you see patients?” Build it from this lesson’s error log. Not taught today.</p></div>
 </section>`;
 return doc('Today — A Typical Day — Teacher Lesson Plan',p1+p2+p3+p4+p5);
}
(async()=>{const br=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const pg=await br.newPage();
 for(const [f,h] of [['02_Today_A_Typical_Day_Student.pdf',student()],['03_Today_A_Typical_Day_Teacher_Lesson_Plan.pdf',teacher()]]){
  const hp='/tmp/td/'+f.replace('.pdf','.html');fs.writeFileSync(hp,h);await pg.goto('file://'+hp);await pg.evaluate(()=>document.fonts.ready);
  await pg.pdf({path:OUTDIR+'/'+f,preferCSSPageSize:true,printBackground:true});console.log('ok',f);}
 await br.close();})();
