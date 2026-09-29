const pptxgen=require('pptxgenjs');const sharp=require('sharp');const {I,svg}=require('./icons');const D=require('./data');
const OUT=process.argv[2];
const NAVY='0B1440',NAVY2='141E52',OR='F44904',PAPER='FAF7F2',SAND='F3EFE6',INK='5B6088',LINE='DDD6C7',MUTED='B7AFA0';
const DISP='Poppins ExtraBold',T='Poppins',ED='Poppins SemiBold',B='Hanken Grotesk',BM='Hanken Grotesk Medium',M='JetBrains Mono Medium';
const IC={};
async function prep(){for(const n of Object.keys(I)){IC[n]='image/png;base64,'+(await sharp(Buffer.from(svg(n,{size:400})),{density:300}).resize(400,400).png().toBuffer()).toString('base64');
 IC[n+'_d']='image/png;base64,'+(await sharp(Buffer.from(svg(n,{size:400,stroke:'#FAF7F2'})),{density:300}).resize(400,400).png().toBuffer()).toString('base64');}}
const pres=new pptxgen();pres.layout='LAYOUT_WIDE';pres.title='A Typical Day — Today';pres.author='Today — Escola de Inglês';pres.company='Today';
let N=0;const TOTAL=17;
function tx(s,text,x,y,w,h,o={}){const q=t=>t.replace(/'/g,'’');text=Array.isArray(text)?text.map(r=>({text:q(r.text),options:r.options})):q(text);s.addText(text,Object.assign({x,y,w,h,fontFace:B,fontSize:20,color:NAVY,margin:0,valign:'top',isTextBox:true,paraSpaceAfter:0},o));}
function rr(s,x,y,w,h,fill=SAND,o={}){s.addShape(pres.shapes.ROUNDED_RECTANGLE,Object.assign({x,y,w,h,rectRadius:0.14,fill:{color:fill},line:{type:'none'}},o));}
function icon(s,n,x,y,sz,dark=false){s.addImage({data:IC[n+(dark?'_d':'')],x,y,w:sz,h:sz,altText:n.replace(/_/g,' ')});}
function slide({dark=false,kicker,notes}){const s=pres.addSlide();N++;s.background={color:dark?NAVY:PAPER};
 if(kicker){tx(s,[{text:'— ',options:{color:OR}},{text:kicker,options:{color:dark?MUTED:INK}}],0.6,0.45,9,0.3,{fontFace:M,fontSize:11,charSpacing:1.5});}
 if(N>1){tx(s,'A TYPICAL DAY',9.23,0.45,3.5,0.3,{fontFace:M,fontSize:10,color:dark?MUTED:INK,align:'right',charSpacing:1.5});
  tx(s,String(N).padStart(2,'0')+' / '+TOTAL,9.23,6.95,3.5,0.3,{fontFace:M,fontSize:10,color:dark?MUTED:INK,align:'right',charSpacing:1});}
 if(notes)s.addNotes(notes);return s;}
function title(s,t,o={}){tx(s,t,0.6,o.y??0.85,o.w??11.5,o.h??0.9,{fontFace:T,bold:true,fontSize:o.size??40,color:o.dark?PAPER:NAVY});}
function label(s,t,x,y,w,o={}){tx(s,t,x,y,w,0.3,Object.assign({fontFace:M,fontSize:11,color:OR,charSpacing:1.5},o));}
function line(s,x,y,w,h,col=LINE,wd=1){s.addShape(pres.shapes.LINE,{x,y,w,h,line:{color:col,width:wd}});}
// Day line — precision ticks (the one surviving brand texture), hours 6..22
function dayline(s,x,y,w,{dark=false,from=6,to=22,labels=true,ring=null}={}){
 const lab=dark?MUTED:INK;line(s,x,y,w,0,dark?INK:LINE,1.25);
 for(let h=from;h<=to;h++){const xx=x+(h-from)/(to-from)*w;const major=h%2===0;line(s,xx,y-(major?0.16:0.09),0,major?0.32:0.18,dark?INK:MUTED,major?1.25:0.75);
  if(labels&&major){const first=h===from,last=h===to;tx(s,String(h).padStart(2,'0')+':00',first?xx:last?xx-0.8:xx-0.4,y+0.25,0.8,0.25,{fontFace:M,fontSize:9,color:lab,align:first?'left':last?'right':'center'});}}
 if(ring!==null){const xx=x+(ring-from)/(to-from)*w;s.addShape(pres.shapes.OVAL,{x:xx-0.22,y:y-0.22,w:0.44,h:0.44,fill:{type:'none'},line:{color:OR,width:2.5}});}
}
function idCard(s,who,x,y,{sz=1.1,dark=false,label:lb='DOCTOR'}={}){
 const st={L:{fill:NAVY,col:PAPER,line:null},S:{fill:OR,col:NAVY,line:null},B:{fill:SAND,col:NAVY,line:NAVY}}[who.initial];
 rr(s,x,y,sz,sz,st.fill,st.line?{line:{color:st.line,width:1.5}}:{});
 tx(s,who.initial,x,y,sz,sz,{fontFace:DISP,fontSize:sz*40,color:st.col,align:'center',valign:'middle'});
 tx(s,who.name,x+sz+0.25,y+sz*0.12,Math.min(4,12.73-(x+sz+0.25)),0.55,{fontFace:T,bold:true,fontSize:sz*20,color:dark?PAPER:NAVY});
 tx(s,lb,x+sz+0.25,y+sz*0.12+sz*0.42,Math.min(4,12.73-(x+sz+0.25)),0.3,{fontFace:M,fontSize:10,color:dark?MUTED:INK,charSpacing:1.5});}
function steps(s,arr,active,x,y,dark){const r=[];arr.forEach((t,i)=>{r.push({text:t,options:{color:i===active?OR:(dark?MUTED:INK)}});if(i<arr.length-1)r.push({text:'  →  ',options:{color:dark?MUTED:LINE}});});tx(s,r,x,y,11,0.35,{fontFace:M,fontSize:12,charSpacing:1.5});}
// timeline of Dr Sarah (Stage 3)
function timeline(s,withText){const x0=0.6,w=12.13,y=3.35;line(s,x0,y,w,0,LINE,1.25);
 D.SARAH.day.forEach(([t,ic,ph],i)=>{const cx=x0+0.62+i*(w-1.24)/7;line(s,cx,y-0.12,0,0.24,NAVY,1.25);
  tx(s,t,cx-0.6,y-0.62,1.2,0.35,{fontFace:M,fontSize:14,color:i%2?NAVY:NAVY,align:'center'});
  icon(s,ic,cx-0.5,y+0.35,1.0);
  if(withText)tx(s,ph,cx-0.66,y+1.5,1.32,0.8,{fontSize:15,bold:true,align:'center'});});}

function build(){
// 01 COVER
let s=slide({dark:true,notes:`STAGE 1 (with slide 2) · Lead-in · 4 min total.
Show the cover for a few seconds while you greet the student. No explanation of the lesson.`});
tx(s,[{text:'— ',options:{color:OR}},{text:'GENERAL ENGLISH · CONVERSATION',options:{color:MUTED}}],0.6,0.6,8,0.3,{fontFace:M,fontSize:11,charSpacing:1.5});
s.addImage({path:'/tmp/td/logo_reverse_crop.png',x:11.78,y:0.5,w:0.95,h:0.95*356/308,altText:'Today'});
tx(s,[{text:'A Typical',options:{color:PAPER,breakLine:true}},{text:'Day.',options:{color:OR}}],0.6,1.45,9,3.0,{fontFace:DISP,fontSize:96,lineSpacingMultiple:0.9});
tx(s,'Habits, routines & everyday life',0.6,4.35,8,0.5,{fontFace:ED,fontSize:24,color:PAPER});
tx(s,'A1 / A1+  ·  60 MIN  ·  1-TO-1',0.6,4.95,8,0.3,{fontFace:M,fontSize:11,color:MUTED,charSpacing:1.5});
dayline(s,0.6,6.2,12.13,{dark:true,ring:7});

// 02 LEAD-IN
s=slide({kicker:'01 · LET’S TALK',notes:`STAGE 1 · Lead-in · 4 min · T↔S
Aim: activate the topic; start diagnosing spontaneous simple present.
Ask the big question naturally. Use the three follow-ups only if the student needs a push.
Do NOT correct. Start your error log (lesson plan, Appendix C): note 3rd-person -s, do/does, don't/doesn't, "I am work".`});
tx(s,'What’s a typical day like for you?',0.6,1.3,7.4,2.6,{fontFace:DISP,fontSize:52,lineSpacingMultiple:0.95});
[['What time do you get up?'],['What do you do in the morning?'],['What time do you start work?']].forEach(([q],i)=>{const y=1.3+i*1.5;rr(s,8.45,y,4.28,1.3);
 tx(s,'0'+(i+1),8.75,y+0.2,0.6,0.3,{fontFace:M,fontSize:11,color:OR});tx(s,q,8.75,y+0.48,3.75,0.72,{fontFace:ED,fontSize:18,valign:'middle'});});

// 03 DIAGNOSTIC
s=slide({kicker:'02 · YOUR WEEKDAY',notes:`STAGE 2 · Diagnostic speaking · 5 min · S→T
Aim: baseline — let the student speak at length about a normal weekday.
"Tell me about a normal weekday — from the morning to the evening." Let the student point along the day line.
Use the support questions only when the student stops. Listen more than you speak.
Keep writing errors in your log — especially: He work… / I am work… / He don't… / Does he works…? These feed stage 9.`});
title(s,'Tell me about your day.');
tx(s,'A normal weekday — morning to evening.',0.6,1.75,8,0.45,{fontSize:22,color:INK});
dayline(s,0.6,3.55,12.13);
[['Morning',0],['Afternoon',6],['Evening',12]].forEach(([w,h],i)=>tx(s,w.toUpperCase(),0.6+h/16*12.13-(i?0.8:0),2.95,1.6,0.3,{fontFace:M,fontSize:10,color:OR,charSpacing:1.5,align:i?'center':'left'}));
label(s,'IF YOU NEED HELP',0.6,4.75,4);
['What time do you get up?','What do you do in the morning?','Where do you work?','What do you do at work?','What time do you finish?'].forEach((q,i)=>tx(s,q,0.6+(i%3)*4.1,5.15+Math.floor(i/3)*0.5,3.9,0.4,{fontSize:17,color:INK}));

// 04 A DOCTOR'S DAY (no text)
s=slide({kicker:'03 · A DOCTOR’S DAY',notes:`STAGE 3 · Vocabulary discovery · 7 min (slides 4–6) · T↔S
This is Dr. Sarah — our doctor for the whole lesson.
Slide 4 (about 2 min): times and pictures only. LOOK. GUESS. SAY IT. ELICIT: "What does she do at 7:00?" Accept any form; don't correct yet.
Expected: She gets up / She arrives at the clinic / She sees patients / She examines a patient / She has lunch / She sees patients / She checks medical records / She finishes work.
Feed missing words ("medical records", "examine") only if the student can't find them.`});
title(s,'A Doctor’s Day');idCard(s,D.SARAH,8.63,0.8,{sz:0.95});
tx(s,'What does she do at 7:00?',0.6,1.7,7,0.5,{fontFace:ED,fontSize:22,color:INK});
timeline(s,false);
tx(s,'Look. Guess. Say it.',0.6,5.9,8,0.4,{fontFace:M,fontSize:11,color:INK,charSpacing:1.5});

// 05 WHAT DOES HE DO?
s=slide({kicker:'03 · A DOCTOR’S DAY',notes:`STAGE 3 · continued (about 3 min)
Reveal the phrases. The student retells Dr. Sarah's day as a story: "At 7:00 she gets up. At 8:00 she arrives at the clinic…"
Then ask the three questions.
ANSWERS: She sees patients. · No, she doesn't. She works at a clinic. · She finishes at 6:00.
If the student says "she see / she finish", don't correct yet — note it in the error log.`});
title(s,'What does she do?');idCard(s,D.SARAH,8.63,0.8,{sz:0.95});
timeline(s,true);
[['What does she do at 8:30?'],['Does she work at a hospital?'],['What time does she finish?']].forEach(([q],i)=>{const x=0.6+i*4.1;rr(s,x,5.75,3.85,0.85);tx(s,q,x+0.25,5.75,3.45,0.85,{fontFace:ED,fontSize:16,valign:'middle'});});

// 06 WHAT DO YOU DO?
s=slide({kicker:'03 · YOU',notes:`STAGE 3 · Personalisation (about 2 min) · T↔S
"Which of these things do you do? When?" The student chooses 5–6 phrases and makes true sentences: "I see patients at 9:00." "I don't work on weekends."
Encourage negatives. Note errors silently.`});
title(s,'What do you do?');
tx(s,'Which of these things do you do? When?',0.6,1.7,8,0.45,{fontSize:22,color:INK});
label(s,'EVERY DAY',0.6,2.45,3);label(s,'AT WORK',6.85,2.45,3);
function pills(arr,x0,maxw){let x=x0,y=2.85;arr.forEach(t=>{const w=0.3+t.length*0.118;if(x+w>x0+maxw){x=x0;y+=0.62;}rr(s,x,y,w,0.48,SAND,{rectRadius:0.24});tx(s,t,x,y,w,0.48,{fontFace:BM,fontSize:15,align:'center',valign:'middle'});x+=w+0.14;});}
pills(D.ROUTINE.map(r=>r[1]),0.6,5.9);pills(['work at a hospital','work at a clinic','see patients','examine a patient','check a patient','have appointments','check medical records','work on weekends'],6.85,5.9);
line(s,0.6,5.75,12.13,0);
tx(s,[{text:'I ',options:{}},{text:'see patients',options:{color:OR}},{text:' at 9:00.     I don’t ',options:{}},{text:'work on weekends',options:{color:OR}},{text:'.',options:{}}],0.6,5.95,12,0.55,{fontFace:ED,fontSize:24});

// 07 WHAT'S DIFFERENT?
s=slide({kicker:'04 · LOOK AGAIN',notes:`STAGE 4 · Language discovery · 7 min (slides 7–8) · T↔S
Slide 7 (about 4 min): ELICIT, don't explain. Ask one question at a time and wait:
1 "What's different?" (works / doesn't / does)
2 "Why do we say 'works' here?" (he / she / it)
3 "Why doesn't 'work' change here?" (after doesn't / does → base verb)
4 "What happens after 'does'?" (he + work — no -s)
CCQs: "Does he work at night — one person or more?" (one) "Is 'works' OK after does?" (no)`});
title(s,'What’s different?');
label(s,'I / YOU',0.6,1.85,3);label(s,'HE / SHE',6.85,1.85,3);
[['I work at a clinic.','He works at a clinic.'],['I don’t work on Sundays.','He doesn’t work on Sundays.'],['Do you work at night?','Does he work at night?']].forEach(([a,b],i)=>{const y=2.3+i*1.2;
 rr(s,0.6,y,5.95,0.95);rr(s,6.85,y,5.88,0.95);tx(s,a,0.9,y,5.5,0.95,{fontFace:ED,fontSize:26,valign:'middle'});tx(s,b,7.15,y,5.5,0.95,{fontFace:ED,fontSize:26,valign:'middle'});});
tx(s,'What changes? Why?',0.6,6.05,8,0.55,{fontFace:T,bold:true,italic:true,fontSize:24,color:OR});

// 08 THE PATTERN
s=slide({kicker:'04 · THE PATTERN',notes:`STAGE 4 · continued (about 3 min)
Let the student tell YOU the pattern first, then show this slide to confirm.
Point to the crossed-out WORKS: "Does he works?" — no. Does already has the -s.
Quick check: "She ___ (live) in Brazil." "___ she work at night?" "He ___ (not work) on Sundays."`});
title(s,'The pattern');
const rows=[['HE / SHE / IT + -S',[['He work',NAVY],['s',OR],['.',NAVY]]],['DOESN’T + BASE VERB',[['He ',NAVY],['doesn’t work',OR],['.',NAVY]]],['DOES + HE + BASE VERB',[['Does',OR],[' he ',NAVY],['work',OR],['?',NAVY]]]];
rows.forEach(([l,parts],i)=>{const y=1.85+i*0.95;label(s,l,0.6,y+0.2,4.2,{color:INK});tx(s,parts.map(([t,c])=>({text:t,options:{color:c}})),4.9,y,7,0.75,{fontFace:T,bold:true,fontSize:34,valign:'middle'});if(i<2)line(s,0.6,y+0.85,12.13,0);});
rr(s,0.6,4.9,12.13,1.65,NAVY);
const blk=[['DOES',OR],['+',null],['HE',PAPER],['+',null],['WORK',PAPER]];let bx=0.95;
blk.forEach(([t,c])=>{if(!c){tx(s,t,bx,5.05,0.5,1.3,{fontFace:T,bold:true,fontSize:30,color:MUTED,align:'center',valign:'middle'});bx+=0.55;return;}
 const w=t.length*0.42+0.5;s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x:bx,y:5.25,w,h:0.95,rectRadius:0.12,fill:{color:NAVY2},line:{color:c===OR?OR:INK,width:1.5}});tx(s,t,bx,5.25,w,0.95,{fontFace:DISP,fontSize:30,color:c,align:'center',valign:'middle'});bx+=w+0.1;});
tx(s,[{text:'NOT  ',options:{fontFace:M,fontSize:12,color:MUTED}},{text:'Does he works?',options:{strike:'sngStrike',color:MUTED}}],bx+0.5,5.25,12.55-(bx+0.5),0.95,{fontFace:T,bold:true,fontSize:26,valign:'middle'});
tx(s,'Yes, he does.  /  No, he doesn’t.',bx+0.5,5.95,12.55-(bx+0.5),0.4,{fontSize:15,color:MUTED});

// 09 RIGHT OR WRONG
s=slide({kicker:'05 · CHALLENGE',notes:`STAGE 5 · Quick accuracy challenge · 5 min · T↔S
"Right or wrong? Fix the wrong ones." The student says the correct sentence aloud — no writing needed.
KEY: 1 ✗ He works in a clinic. · 2 ✗ I work from Monday to Friday. · 3 ✓ · 4 ✗ Does he work on Saturdays? · 5 ✓
If the student is unsure, point back to slide 8 (don't re-explain).`});
title(s,'Right or wrong?');
tx(s,'Fix the wrong ones.',0.6,1.7,8,0.45,{fontSize:22,color:INK});
D.RW.forEach(([t],i)=>{const y=2.4+i*0.82;tx(s,String(i+1),0.6,y,0.5,0.6,{fontFace:M,fontSize:14,color:OR,valign:'middle'});tx(s,t,1.2,y,8.5,0.6,{fontFace:ED,fontSize:28,valign:'middle'});
 ['RIGHT','WRONG'].forEach((w,j)=>{rr(s,10.2+j*1.3,y+0.07,1.18,0.46,SAND,{rectRadius:0.23});tx(s,w,10.2+j*1.3,y+0.07,1.18,0.46,{fontFace:M,fontSize:11,color:INK,align:'center',valign:'middle',charSpacing:1});});});

// 10 WHO IS IT?
s=slide({kicker:'06 · INFORMATION GAP',notes:`STAGE 6 · Information gap · 7 min (slides 10–11) · S↔T
"You know Dr. Sarah's day at the clinic. There are six more things you don't know. I know. Ask me."
Answer ONLY the information requested. If the question is wrong ("How many patients she sees?"), don't answer: look puzzled, pause, elicit ("Again?") and let the student self-correct. Reformulate only if they're stuck.
TEACHER ONLY — do not show: sees 15 patients a day · doesn't work on Sundays · doesn't work at night · has appointments in the afternoon · watches TV after work · goes to bed at 11:00.`});
title(s,'Who is it?');idCard(s,D.SARAH,0.6,1.85,{sz:1.4});
tx(s,'Six things you don’t know.',0.6,3.6,5,0.5,{fontFace:ED,fontSize:24});tx(s,'Ask me. Find them.',0.6,4.1,5,0.5,{fontSize:22,color:INK});
D.SARAH.facts.forEach(([k],i)=>{const c=i%2,r=Math.floor(i/2),x=6.35+c*3.2,y=1.85+r*1.55;rr(s,x,y,3.0,1.35);
 tx(s,k.toUpperCase(),x+0.25,y+0.22,2.6,0.3,{fontFace:M,fontSize:10,color:INK,charSpacing:1.2});tx(s,'?',x+0.25,y+0.55,2.6,0.6,{fontFace:DISP,fontSize:30,color:OR});});

// 11 ASK THE QUESTIONS
s=slide({kicker:'06 · ASK',notes:`STAGE 6 · continued
Use this slide if the student needs support forming the questions (the gap = does / Does).
When all six facts are found: "Now tell me about Dr. Sarah." → She sees 15 patients a day. She doesn't work on Sundays… (third-person -s in use).
Do not reveal Sarah's facts on screen — say them.`});
title(s,'Ask the questions');idCard(s,D.SARAH,9.35,0.8,{sz:0.95});
D.SARAH.questions.forEach(([a,b,aux],i)=>{const y=1.95+i*0.66;tx(s,[{text:a,options:{}},{text:'_____',options:{color:OR}},{text:b,options:{}}],0.6,y,8.55,0.55,{fontFace:ED,fontSize:23,valign:'middle'});});
rr(s,9.35,2.2,3.38,2.7);label(s,'SHORT ANSWERS',9.65,2.45,3);
tx(s,[{text:'Yes, she does.',options:{breakLine:true}},{text:'No, she doesn’t.'}],9.65,2.85,2.9,0.9,{fontFace:ED,fontSize:19,lineSpacingMultiple:1.2});
label(s,'THEN',9.65,3.9,2);tx(s,'Tell me about Dr. Sarah.',9.65,4.2,2.9,0.6,{fontSize:16});
tx(s,[{text:'She see',options:{}},{text:'s',options:{color:OR}},{text:'…  She doesn’t…  She go',options:{}},{text:'es',options:{color:OR}},{text:'…',options:{}}],0.6,6.05,9,0.5,{fontFace:ED,fontSize:22,color:INK});

// 12 HE WORKS
s=slide({kicker:'07 · SAY IT',notes:`STAGE 7 · Pronunciation micro-focus · 3 min · T↔S
NOTICE: "Listen — are the endings the same?" Say works / lives / watches.
LISTEN: model each sentence twice, natural speed.
REPEAT: student repeats; tap the final sound.
USE: "Tell me about a colleague." If needed: "Where does he/she work? What does he/she do?" → She works… He lives… He watches…
Only 3 minutes — no phonetics lecture.`});
title(s,'He works.');steps(s,['NOTICE','LISTEN','REPEAT','USE'],-1,0.6,1.7,false);
[['work','works','s','He works at night.'],['live','lives','z','She lives in Brazil.'],['watch','watches','iz','He watches TV after work.']].forEach(([a,b,snd,ex],i)=>{const x=0.6+i*4.1;rr(s,x,2.3,3.85,3.3);
 tx(s,a,x+0.3,2.55,3.3,0.45,{fontSize:20,color:INK});tx(s,[{text:b.slice(0,a.length),options:{}},{text:b.slice(a.length),options:{color:OR}}],x+0.3,2.95,3.3,0.8,{fontFace:DISP,fontSize:40});
 rr(s,x+0.3,3.9,0.75,0.42,NAVY,{rectRadius:0.21});tx(s,'/'+snd+'/',x+0.3,3.9,0.75,0.42,{fontFace:M,fontSize:12,color:PAPER,align:'center',valign:'middle'});
 tx(s,ex,x+0.3,4.55,3.3,0.8,{fontFace:ED,fontSize:18});});
tx(s,[{text:'USE  ',options:{fontFace:M,fontSize:12,color:OR}},{text:'Tell me about a colleague.',options:{}}],0.6,6.0,10,0.5,{fontFace:ED,fontSize:22});

// 13 DOCTOR VS DOCTOR — ROUND 1
s=slide({kicker:'08 · DOCTOR VS. DOCTOR',notes:`STAGE 8 · Main communicative task · 10 min (slides 13–15)
Three rounds: SUPPORTED → PERSONALISED → INDEPENDENT.
ROUND 1 (about 3 min) · S→T · SUPPORTED: the student interviews you about Dr. Ben, Dr. Sarah's colleague. Answer in the 3rd person, only what is asked.
TEACHER ONLY — do not show: works at a hospital · starts at 8:00 in the evening · works at night · sees about 20 patients a night · works on weekends · doesn't work on Mondays · finishes at 6:00 in the morning.
If asked "Does he work at the clinic?" → "No, he doesn't. He works at a hospital." 
Monitor, don't interrupt. Keep logging errors.`});
title(s,'Doctor vs. Doctor');steps(s,['ROUND 1 · DR. BEN','ROUND 2 · YOU','ROUND 3 · NO HELP'],0,0.6,1.7,false);
idCard(s,D.BEN,0.6,2.45,{sz:1.3,label:'DR. SARAH’S COLLEAGUE'});
tx(s,'Ask me about Dr. Ben.',0.6,4.1,4.8,0.5,{fontFace:ED,fontSize:24});tx(s,'He works with Dr. Sarah.',0.6,4.6,4.8,0.45,{fontSize:20,color:INK});
['Where does he work?','What time does he start?','Does he work at night?','How many patients does he see?','Does he work on weekends?','What time does he finish?'].forEach((q,i)=>{const y=2.45+i*0.66;rr(s,6.1,y,6.63,0.54,SAND);tx(s,q,6.4,y,6.2,0.54,{fontFace:ED,fontSize:19,valign:'middle'});});

// 14 ROUND 2
s=slide({kicker:'08 · DOCTOR VS. DOCTOR',notes:`STAGE 8 · ROUND 2 (about 3–4 min) · T→S
PERSONALISED. Now you interview the student about their real routine.
Do not ask all six questions mechanically. Choose 3–4 questions and use natural follow-up questions where appropriate.
Examples: "What time do you start work?" → "Every day?" → "What do you do first?" · "Do you work on weekends?" → "How often?" · "Where do you work?" → "Do you like working there?"
Aim: QUESTION → ANSWER → FOLLOW-UP. Keep follow-ups simple — no new grammar. Keep logging errors.`});
title(s,'Your turn.');steps(s,['ROUND 1 · DR. BEN','ROUND 2 · YOU','ROUND 3 · NO HELP'],1,0.6,1.7,false);
tx(s,'I ask. You answer.',0.6,2.3,4.5,0.5,{fontFace:ED,fontSize:24});
tx(s,[{text:'I start work at…',options:{breakLine:true}},{text:'I see about… patients.',options:{breakLine:true}},{text:'I don’t work on…'}],0.6,2.95,4.8,1.5,{fontSize:19,color:INK,lineSpacingMultiple:1.2});
D.ROUND2.forEach((q,i)=>{const y=2.3+i*0.7;rr(s,6.1,y,6.63,0.56,SAND);tx(s,String(i+1).padStart(2,'0'),6.35,y,0.5,0.56,{fontFace:M,fontSize:10,color:OR,valign:'middle'});tx(s,q,6.9,y,5.7,0.56,{fontFace:ED,fontSize:19,valign:'middle'});});

// 15 ROUND 3
s=slide({dark:true,kicker:'08 · ROUND 3 · NO HELP',notes:`STAGE 8 · ROUND 3 (about 3 min) · S→T
INDEPENDENT. No prompts. "Tell me about your typical working day." Extended freer speaking — about 2–3 minutes without help.
(Different from the exit task, which is a short 4–5 sentence final check.)
Monitor silently; choose the 3–5 most useful real errors from the whole lesson and type them into slide 16 now.`});
tx(s,'Tell me about your typical working day.',0.6,1.5,10.5,2.6,{fontFace:DISP,fontSize:54,color:PAPER,lineSpacingMultiple:0.95});
tx(s,'From the morning to the evening.',0.6,4.35,8,0.5,{fontFace:ED,fontSize:22,color:MUTED});
dayline(s,0.6,6.1,12.13,{dark:true});

// 16 CAN YOU FIX IT?
s=slide({kicker:'09 · CAN YOU FIX IT?',notes:`STAGE 9 · Delayed correction · 5 min · T↔S
BEFORE SHOWING: replace the example sentences with 3–5 REAL errors produced by the student during the lesson whenever possible (type over them; delete unused lines). The examples are only a backup.
Use the student's own language. Show one error at a time. Ask: "Is it right?" "Can you fix it?" — guided self-correction; if stuck, point to the pattern box.
Don't explain the grammar again unless absolutely necessary. Never correct more than one target error in the same sentence.
Finish with the pattern box (read it together once).`});
title(s,'Can you fix it?');
tx(s,'Try again.',9.23,0.85,3.5,0.7,{fontFace:T,bold:true,italic:true,fontSize:30,color:OR,align:'right'});
D.FIX.forEach((t,i)=>{const y=1.95+i*0.72;tx(s,String(i+1),0.6,y,0.5,0.55,{fontFace:M,fontSize:13,color:OR,valign:'middle'});tx(s,t,1.2,y,7.4,0.55,{fontFace:ED,fontSize:26,valign:'middle'});line(s,1.2,y+0.64,7.2,0);});
rr(s,8.95,1.95,3.78,3.55,NAVY);
[['I / YOU / WE / THEY','WORK',PAPER],['HE / SHE / IT','WORKS',OR],['DOES / DOESN’T','WORK',PAPER]].forEach(([a,b,c],i)=>{const y=2.2+i*1.08;tx(s,a,9.25,y,3.3,0.3,{fontFace:M,fontSize:10,color:MUTED,charSpacing:1.2});tx(s,[{text:'→ ',options:{fontFace:M}},{text:b,options:{}}],9.25,y+0.3,3.3,0.6,{fontFace:DISP,fontSize:28,color:c});});
tx(s,'Your sentences from today.',0.6,5.85,8,0.45,{fontSize:18,color:INK});

// 17 EXIT
s=slide({dark:true,kicker:'10 · EXIT TASK',notes:`STAGE 10 · Exit task · 2 min · S→T
"So, what does a typical day look like for you?" A short final check: 4–5 sentences, no help. (Round 3 was the extended speaking; this measures the main aim.)
Check against the exit checklist (lesson plan, Appendix D): simple present form · routine vocabulary · 3rd-person / questions where used · fewer of today's logged slips.
Small preview only — How often…? (always · usually · sometimes · never). Do not teach this now.`});
tx(s,'So, what does a typical day look like for you?',0.6,1.4,10.8,2.7,{fontFace:DISP,fontSize:50,color:PAPER,lineSpacingMultiple:0.95});
tx(s,'4–5 sentences. No help.',0.6,4.35,8,0.5,{fontFace:ED,fontSize:24,color:OR});
tx(s,'NEXT TIME · HOW OFTEN DO YOU…? · ALWAYS · USUALLY · SOMETIMES · NEVER',0.6,6.95,8.4,0.3,{fontFace:M,fontSize:9,color:MUTED,charSpacing:1.2});
s.addImage({path:'/tmp/td/logo_reverse_crop.png',x:11.78,y:5.45,w:0.95,h:0.95*356/308,altText:'Today'});
}
(async()=>{await prep();build();await pres.writeFile({fileName:OUT});console.log('slides',N);})();
