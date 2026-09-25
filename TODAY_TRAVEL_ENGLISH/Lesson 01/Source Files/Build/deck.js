const pptxgen=require('pptxgenjs');const sharp=require('sharp');const fs=require('fs');const path=require('path');
const {I,svg}=require('./icons');const LS=require('./lesson');
const LDIR=process.argv[2]; const OUT=process.argv[3];
const NAVY='0B1440',ORANGE='F44904',PAPER='FAF7F2',SAND='F3EFE6';
const T='Poppins',B='Hanken Grotesk',M='JetBrains Mono';
const W=13.333;
const ICON={};
async function prep(){
  const cols={navy:'#0B1440',paper:'#FAF7F2',orange:'#F44904'};
  for(const n of Object.keys(I))for(const [k,c] of Object.entries(cols)){
    const b=await sharp(Buffer.from(svg(n,{size:384,stroke:c})),{density:300}).resize(384,384).png().toBuffer();
    ICON[n+'_'+k]='image/png;base64,'+b.toString('base64');}
  const play=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400"><rect width="100" height="100" fill="#FAF7F2"/><circle cx="50" cy="50" r="48" fill="#0B1440"/><path d="M41 32v36l29-18Z" fill="#FAF7F2" stroke="#FAF7F2" stroke-width="3" stroke-linejoin="round"/></svg>`;
  ICON.play='data:image/png;base64,'+(await sharp(Buffer.from(play),{density:300}).resize(400,400).png().toBuffer()).toString('base64');
  const play2=play.replace('<circle cx="50" cy="50" r="48" fill="#0B1440"/>','<circle cx="50" cy="50" r="48" fill="#F44904"/>').replace('fill="#FAF7F2" stroke="#FAF7F2"','fill="#0B1440" stroke="#0B1440"');
  ICON.play_o='data:image/png;base64,'+(await sharp(Buffer.from(play2),{density:300}).resize(400,400).png().toBuffer()).toString('base64');
}
const pres=new pptxgen(); pres.layout='LAYOUT_WIDE';
pres.title='Today Travel English · Lesson 01 · Packing for a Trip'; pres.company='Today'; pres.author='Today Travel English';
let N=0;
// Muted text uses the solid caption tones of the Today brand documents (no text transparency: renders unreliably outside PowerPoint)
const MUTE_L='5B6088',MUTE_D='8890B5';
function mute(o,base){if(o&&o.transparency!==undefined){const c=(o.color||base);o.color=(c===PAPER||c===MUTE_D)?MUTE_D:(c===ORANGE?ORANGE:MUTE_L);delete o.transparency;}return o;}
function tx(s,text,x,y,w,h,o={}){o=mute(Object.assign({},o),NAVY);if(Array.isArray(text))text=text.map(r=>({text:r.text,options:mute(Object.assign({},r.options||{}),o.color||NAVY)}));
  s.addText(text,Object.assign({x,y,w,h,fontFace:B,fontSize:20,color:NAVY,margin:0,valign:'top',isTextBox:true,paraSpaceAfter:0},o));}
function icon(s,n,x,y,sz,col='navy',tr=0){s.addImage({data:ICON[n+'_'+col],x,y,w:sz,h:sz,transparency:tr,altText:n.replace('_',' ')});}
function slide({dark=false,kicker,step,notes}){
  const s=pres.addSlide(); N++; s.background={color:dark?NAVY:PAPER};
  if(kicker) tx(s,'— '+kicker,0.6,0.42,9,0.3,{fontFace:M,fontSize:12,color:ORANGE,charSpacing:1.5});
  if(step) tx(s,step,8.2,0.42,4.53,0.3,{fontFace:M,fontSize:11,color:dark?PAPER:NAVY,transparency:40,align:'right',charSpacing:1.5});
  if(N>1){tx(s,'TODAY TRAVEL ENGLISH · LESSON 01 · PACKING FOR A TRIP',0.6,7.02,9.5,0.25,{fontFace:M,fontSize:9,color:dark?PAPER:NAVY,transparency:50,charSpacing:1});
    tx(s,String(N).padStart(2,'0'),12.1,7.02,0.63,0.25,{fontFace:M,fontSize:9,color:dark?PAPER:NAVY,transparency:50,align:'right'});}
  if(notes) s.addNotes(notes);
  return s;
}
function title(s,t,o={}){tx(s,t,0.6,o.y??0.85,o.w??12,o.h??0.85,Object.assign({fontFace:T,bold:true,fontSize:40,color:o.dark?PAPER:NAVY,valign:'top'},o.x!==undefined?{x:o.x}:{}, o.size?{fontSize:o.size}:{}));}
function label(s,t,x,y,w,o={}){tx(s,t,x,y,w,0.28,Object.assign({fontFace:M,fontSize:12,color:ORANGE,charSpacing:1.5},o));}
function box(s,x,y,sz=0.3,col=NAVY){s.addShape(pres.shapes.RECTANGLE,{x,y,w:sz,h:sz,fill:{type:'none'},line:{color:col,width:1.5}});}
function rect(s,x,y,w,h,fill=SAND){s.addShape(pres.shapes.RECTANGLE,{x,y,w,h,fill:{color:fill},line:{type:'none'}});}
function rule(s,x,y,w,dark){s.addShape(pres.shapes.LINE,{x,y,w,h:0,line:{color:dark?PAPER:NAVY,width:0.75,transparency:80}});}
function audio(s,file,x,y,sz,cover='play'){s.addMedia({type:'audio',path:path.join(LDIR,'Audio',file),x,y,w:sz,h:sz,cover:ICON[cover]});}
function steps(s,active,x,y,dark,size=18){const st=['PLAN','CHECK','DECIDE','UPDATE'];const runs=[];
  st.forEach((t,i)=>{runs.push({text:t,options:{color:i===active?ORANGE:(dark?PAPER:NAVY),transparency:i===active?0:45,bold:i===active}});if(i<3)runs.push({text:'  →  ',options:{color:dark?PAPER:NAVY,transparency:60}});});
  tx(s,runs,x,y,7.5,0.4,{fontFace:M,fontSize:size,charSpacing:1});}
function item(s,k,x,y,{sz=1.05,num,wordSize=22,tr=0}={}){
  const c=LS.CORE.find(r=>r[0]===k);icon(s,k,x,y,sz,'navy',tr);
  if(num) tx(s,String(num).padStart(2,'0'),x+sz+0.08,y,0.5,0.3,{fontFace:M,fontSize:12,color:ORANGE});
  const runs=[];if(c[1])runs.push({text:c[1]+' ',options:{bold:false,transparency:35}});runs.push({text:c[2],options:{bold:true}});
  tx(s,runs,x,y+sz+0.12,2.3,0.45,{fontSize:wordSize});
  if(k==='trousers') tx(s,'US: pants',x,y+sz+0.55,2,0.3,{fontFace:M,fontSize:11,transparency:40});
}
const ORDER=LS.CORE.map(r=>r[0]);
const WORD=k=>{const c=LS.CORE.find(r=>r[0]===k);return c?c[2]:k.replace('_',' ');};

function build(){
// 1 COVER
let s=slide({dark:true,kicker:'LESSON 01 · A1 · 90 MINUTES',notes:
`STAGE 1 · Which bag? (0–5 min, together with slides 2–3)
Cover. Greet the class. Show the cover while students settle. Don't explain the lesson yet — slide 3 does the work.`});
tx(s,[{text:'Packing',options:{color:PAPER,breakLine:true}},{text:'for a trip.',options:{color:ORANGE}}],0.6,1.75,7.4,2.9,{fontFace:T,bold:true,fontSize:76,lineSpacingMultiple:0.92});
tx(s,'Today Travel English',0.6,4.75,6,0.45,{fontSize:22,color:PAPER});
tx(s,'Choose. Decide. Pack.',0.6,5.2,6,0.4,{fontFace:M,fontSize:13,color:PAPER,transparency:40,charSpacing:1.5});
s.addImage({path:path.join(LDIR,'Images/Brand/today_lockup_paper-on-navy.png'),x:0.6,y:6.35,w:1.19,h:0.45,altText:'Today'});
[['passport',8.2,1.1],['sunglasses',10.35,0.95],['tshirt',11.7,2.35],['sunscreen',8.55,3.2],['shoes',10.2,3.55],['umbrella',11.75,4.85],['swimsuit',8.35,5.2]].forEach(([n,x,y])=>icon(s,n,x,y,1.35,'paper'));

// 2 GOAL
s=slide({kicker:'YOUR GOAL TODAY',notes:
`STAGE 1 · Which bag? (0–5 min)
Read the Can-do together (15 seconds). Point at the four steps: "At the end of the lesson — My Travel Bag. Plan, check, decide, update." Don't explain further; students will see it at the end.`});
tx(s,'I can talk about what I need to take on a trip and make a simple packing list.',0.6,1.3,10.8,2.0,{fontFace:T,bold:true,fontSize:38,lineSpacingMultiple:1.0});
label(s,'FINAL TASK · MY TRAVEL BAG',0.6,3.85,6);
[['Plan','your bag'],['Check','a partner’s bag'],['Decide','yes or no?'],['Update','your list']].forEach(([w,d],i)=>{const x=0.6+i*3.1;
 tx(s,'0'+(i+1),x,4.35,1,0.3,{fontFace:M,fontSize:13,color:ORANGE});
 tx(s,w,x,4.7,2.6,0.7,{fontFace:T,bold:true,fontSize:36});
 tx(s,d,x,5.45,2.6,0.4,{fontSize:18,transparency:30});
 if(i<3) tx(s,'→',x+2.45,4.8,0.5,0.6,{fontSize:30,color:ORANGE});});

// 3 WHICH BAG
s=slide({kicker:'DECISION 1 · WARM-UP',step:'DECISION 1 / 6',notes:
`STAGE 1 · Which bag? (0–5 min) · S–S
Aim: personalise; make the first decision.
1. Model once: "I'm going to Lisbon. Three days. Small bag!"
2. Students stand up / (online: breakout pairs) and ask 2 partners the three questions.
ICQs: "How many partners?" (2) "What do you ask?" (Where / How many days / Which bag)
3. Quick class check: "Who has a big bag? Why?" — accept one-word reasons.
Suitcase / backpack are recognition words: don't drill.`});
title(s,'Your next trip. Which bag?');
rect(s,0.6,1.95,3.55,3.95);rect(s,4.4,1.95,3.55,3.95);
icon(s,'suitcase',1.5,2.3,1.75);icon(s,'backpack',5.3,2.3,1.75);
tx(s,'Big bag',0.9,4.35,3,0.5,{fontFace:T,bold:true,fontSize:28});tx(s,'Small bag',4.7,4.35,3,0.5,{fontFace:T,bold:true,fontSize:28});
tx(s,'SUITCASE',0.9,4.95,3,0.3,{fontFace:M,fontSize:11,transparency:40,charSpacing:1.5});tx(s,'BACKPACK',4.7,4.95,3,0.3,{fontFace:M,fontSize:11,transparency:40,charSpacing:1.5});
label(s,'ASK 2 PARTNERS',8.55,2.0,4);
tx(s,[{text:'Where are you going?',options:{breakLine:true}},{text:'How many days?',options:{breakLine:true}},{text:'Which bag?'}],8.55,2.4,4.3,1.6,{fontFace:T,bold:true,fontSize:24,lineSpacingMultiple:1.15});
label(s,'ANSWER',8.55,4.2,4);
tx(s,[{text:"I'm going to ",options:{}},{text:'________',options:{color:ORANGE,breakLine:true}},{text:'Four days.',options:{breakLine:true}},{text:'Small bag!'}],8.55,4.6,4.3,1.5,{fontSize:24,lineSpacingMultiple:1.15});

// 4 BED
s=slide({kicker:'WORDS',notes:
`STAGE 2 · What's on the bed? (5–14 min) · S–S → T–S
Aim: activate and clarify the 14 core items (+ 4 weather words on slide 6).
1. Pairs: name as many things as possible in 60 seconds (point + say the number). (1 min)
ICQ: "Write or speak?" (speak) "How long?" (60 seconds)
2. Elicit item by item using numbers; move to slides 5–6 to show words. Elicit before telling.
Help language: "What's this in English?"`});
title(s,[{text:"What's on",options:{breakLine:true}},{text:'the bed?'}],{w:4.6,h:1.6});
tx(s,'Pairs: name everything you can.',0.6,2.65,4.4,0.9,{fontSize:22});
tx(s,'60',0.6,3.55,2,1.1,{fontFace:T,bold:true,fontSize:80,color:ORANGE});
tx(s,'SECONDS',0.6,4.75,3,0.3,{fontFace:M,fontSize:12,charSpacing:1.5});
label(s,'HELP',0.6,5.6,2);tx(s,"What's this in English?",0.6,5.95,4.5,0.45,{fontSize:20,italic:true});
rect(s,5.35,0.5,7.38,6.3);
ORDER.forEach((k,i)=>{let r,c;if(i<5){r=0;c=i}else if(i<9){r=1;c=i-5}else{r=2;c=i-9}
 const x=5.8+c*1.38+(r===1?0.69:0),y=0.95+r*2.0;icon(s,k,x,y,1.0);tx(s,String(i+1).padStart(2,'0'),x-0.05,y+1.08,0.6,0.3,{fontFace:M,fontSize:12,color:ORANGE});});

// 5 ESSENTIALS & CLOTHES
s=slide({kicker:'WORDS · 01–09',notes:
`STAGE 2 · What's on the bed? (continued)
Clarify meaning with the pictures, then drill only the problem words: clothes, sweater, trousers, swimsuit.
Point to the small words (a / an): say the chunk, e.g. "a sweater", "shorts". No grammar explanation.
Variant: trousers = pants (US). Both are fine.`});
title(s,'Essentials and clothes');
label(s,'ESSENTIALS',0.6,1.85,3);label(s,'CLOTHES',3.75,1.85,3);
s.addShape(pres.shapes.LINE,{x:3.35,y:1.9,w:0,h:4.8,line:{color:NAVY,width:0.75,transparency:80}});
item(s,'passport',0.6,2.3,{num:1});item(s,'phone_charger',0.6,4.6,{num:2});
['tshirt','shorts','trousers','sweater','jacket','shoes','swimsuit'].forEach((k,i)=>{const r=i<4?0:1,c=i<4?i:i-4;item(s,k,3.75+c*2.3,2.3+r*2.3,{num:3+i});});

// 6 WEATHER
s=slide({kicker:'WORDS · 10–14 · WEATHER',notes:
`STAGE 2 · What's on the bed? (continued)
Weather words: elicit with the icons. Model "It's sunny." / "It's cold at night."
Weather items 10–14: note "sunglasses" and "sunscreen" have no "a" — just say the chunk, don't explain.
Pairs test each other: A points, B names (2 min).`});
title(s,'The weather');
label(s,'WEATHER',0.6,1.85,3);label(s,'WEATHER ITEMS',5.1,1.85,4);
s.addShape(pres.shapes.LINE,{x:4.7,y:1.9,w:0,h:4.8,line:{color:NAVY,width:0.75,transparency:80}});
LS.WEATHER.forEach(([k,w],i)=>{const x=0.6+(i%2)*2.0,y=2.3+Math.floor(i/2)*2.0;icon(s,k,x,y,1.0);tx(s,w,x,y+1.1,1.9,0.45,{fontSize:22,bold:true});});
tx(s,[{text:"It's ",options:{}},{text:'sunny',options:{color:ORANGE,bold:true}},{text:'.',options:{}}],0.6,6.3,4,0.45,{fontSize:22});
['umbrella','raincoat','sunglasses','sunscreen','hat'].forEach((k,i)=>{const r=i<3?0:1,c=i<3?i:i-3;item(s,k,5.1+c*2.55,2.3+r*2.3,{num:10+i});});

// 7 ALWAYS / DEPENDS
s=slide({kicker:'DECISION 2',step:'DECISION 2 / 6',notes:
`STAGE 3 · Always or it depends? (14–19 min) · S–S
Aim: first sorting decision — essentials vs. weather/trip-dependent items.
1. Pairs sort the 14 cards (in class) or drag the small pictures into the two boxes (online, shared slide). (3 min)
ICQ: "How many groups?" (2)
2. Class check (2 min): "It depends… on what?" → "the weather", "the trip". Accept different answers — there is no single key (passport and phone charger are usually ALWAYS).`});
title(s,'Always — or it depends?');
rect(s,0.6,1.85,5.95,3.35);rect(s,6.78,1.85,5.95,3.35);
tx(s,'Always',0.95,2.1,5,0.6,{fontFace:T,bold:true,fontSize:30});tx(s,'in my bag, every trip',0.95,2.72,5,0.4,{fontSize:18,transparency:30});
tx(s,'It depends',7.13,2.1,5,0.6,{fontFace:T,bold:true,fontSize:30});tx(s,'on the weather? on the trip?',7.13,2.72,5,0.4,{fontSize:18,transparency:30});
ORDER.forEach((k,i)=>{icon(s,k,0.6+i*0.873,5.45,0.66);});
tx(s,'PAIRS · SORT THE 14 THINGS · ONLINE: DRAG THEM INTO A BOX',0.6,6.3,10,0.3,{fontFace:M,fontSize:11,charSpacing:1.2,transparency:30});

// 8 LEO'S BAG
s=slide({kicker:'DECISION 3 · LISTEN',step:'DECISION 3 / 6',notes:
`STAGE 4 · Leo's Call (19–31 min) · Pre-listening (3 min)
Aim: create a reason to listen; predict.
"Leo is going to Madrid. This is his bag — his first idea. Good bag?" Pairs predict (1 min), then 2–3 students share.
Don't confirm answers — the audio will.`});
title(s,'Leo is going to Madrid.');
tx(s,'This is his bag. Good bag?',0.6,1.65,8,0.5,{fontSize:24,transparency:25});
rect(s,0.6,2.45,7.2,3.9);label(s,"LEO'S BAG · FIRST IDEA",0.95,2.7,5,{color:NAVY,transparency:40});
[['tshirt','T-shirts'],['shorts','shorts'],['sunglasses','sunglasses']].forEach(([k,w],i)=>{icon(s,k,1.05+i*2.3,3.25,1.55);tx(s,w,1.05+i*2.3,4.95,2.2,0.45,{fontSize:22,bold:true});});
tx(s,'Predict.',8.4,2.45,4.3,0.7,{fontFace:T,bold:true,fontSize:32});
tx(s,[{text:'Good bag? Yes or no?',options:{breakLine:true}},{text:'What does Leo need?'}],8.4,3.25,4.3,1.2,{fontSize:22,lineSpacingMultiple:1.2});
tx(s,'Tell a partner.',8.4,4.6,4.3,0.45,{fontSize:22,color:ORANGE,bold:true});

// 9 LISTEN 1
s=slide({kicker:'LISTEN · 1',step:'DECISION 3 / 6',notes:
`STAGE 4 · Leo's Call · First listening (3 min) · AUDIO: TTE_L01_A01_Leos-Call_v1.0.mp3 (0:58)
Aim: gist — destination, days, weather, activities.
Read the 4 questions first. Play once. Pairs check.
ICQs: "How many activities do you tick?" (2)
ANSWERS: 1 Madrid · 2 four days · 3 day: sunny / night: cold · 4 walk, swim.
(If needed, play again before moving on.)`});
title(s,"Leo's Call");
tx(s,'LISTEN AND ANSWER',0.6,1.62,6,0.3,{fontFace:M,fontSize:12,charSpacing:1.5,transparency:35});
tx(s,[{text:'1   ',options:{fontFace:M,color:ORANGE}},{text:'Where is Leo going?  ',options:{}},{text:'__________',options:{color:ORANGE}}],0.6,1.98,8,0.45,{fontSize:24});
tx(s,[{text:'2   ',options:{fontFace:M,color:ORANGE}},{text:'How many days?  ',options:{}},{text:'__________',options:{color:ORANGE}}],0.6,2.55,8,0.45,{fontSize:24});
tx(s,[{text:'3   ',options:{fontFace:M,color:ORANGE}},{text:'The weather?',options:{}}],0.6,3.55,4,0.45,{fontSize:24});
tx(s,'DAY',4.3,3.17,1,0.3,{fontFace:M,fontSize:11,charSpacing:1.5,color:ORANGE});tx(s,'NIGHT',7.2,3.17,1.2,0.3,{fontFace:M,fontSize:11,charSpacing:1.5,color:ORANGE});
[['sunny',4.3],['rainy',5.5],['hot',7.2],['cold',8.4]].forEach(([k,x])=>{icon(s,k,x,3.45,0.8);box(s,x+0.25,4.33);});
tx(s,[{text:'4   ',options:{fontFace:M,color:ORANGE}},{text:'Activities? Tick 2.',options:{}}],0.6,5.05,5,0.45,{fontSize:24});
[['walk','walk'],['swim','swim'],['hike','hike'],['museum','museum']].forEach(([k,w],i)=>{const x=4.3+i*1.55;icon(s,k,x,4.9,0.8);tx(s,w,x,5.72,1.4,0.35,{fontSize:16,bold:true});box(s,x+0.25,6.1);});
audio(s,'TTE_L01_A01_Leos-Call_v1.0.mp3',11.35,1.55,1.2);tx(s,'AUDIO · 0:58',11.1,2.85,1.7,0.3,{fontFace:M,fontSize:10,align:'center',transparency:30});

// 10 LISTEN 2
s=slide({kicker:'LISTEN · 2',step:'DECISION 3 / 6',notes:
`STAGE 4 · Leo's Call · Second listening (4 min) · AUDIO: TTE_L01_A01_Leos-Call_v1.0.mp3 (same file)
Aim: detail — track Leo's packing decisions.
Play again. Students tick TAKING or NOT TAKING for each thing. Pairs compare (1 min). Then slide 11.
ANSWERS: taking — trousers, jacket, shoes, swimsuit, sunscreen, sunglasses · not taking — shorts, umbrella.`});
title(s,'Taking or not taking?');
tx(s,'Listen again. Tick one box for each thing.',0.6,1.62,8,0.4,{fontSize:20,transparency:25});
LS.L2_GRID.forEach(([k],i)=>{const r=Math.floor(i/4),c=i%4,x=0.6+c*2.7,y=2.25+r*2.3;icon(s,k,x,y,0.95);tx(s,WORD(k),x,y+1.02,2.3,0.4,{fontSize:20,bold:true});
 box(s,x+1.15,y+0.05,0.36);icon(s,'check',x+1.55,y+0.02,0.42);box(s,x+1.15,y+0.55,0.36);icon(s,'cross',x+1.55,y+0.52,0.42);});
tx(s,[{text:'taking',options:{breakLine:true}},{text:'not taking'}],11.25,4.55,1.5,0.8,{fontSize:14,transparency:30,lineSpacingMultiple:1.3});
icon(s,'check',10.8,4.52,0.36);icon(s,'cross',10.8,4.87,0.36);
audio(s,'TTE_L01_A01_Leos-Call_v1.0.mp3',11.35,1.55,1.2);tx(s,'AUDIO · 0:58',11.1,2.85,1.7,0.3,{fontFace:M,fontSize:10,align:'center',transparency:30});

// 11 CHECK
s=slide({kicker:'LISTEN · CHECK',step:'DECISION 3 / 6',notes:
`STAGE 4 · Leo's Call · Check (2 min)
Show only after pairs have compared. Then ask: "What changed? Why?" Let students answer before you point to the bottom line.
This is the model for the whole lesson: new information → a new decision.`});
title(s,'Check your answers');
label(s,'LISTENING 1',0.6,1.85,4);
tx(s,[{text:'1  Madrid',options:{breakLine:true}},{text:'2  Four days',options:{breakLine:true}},{text:'3  Sunny in the day, cold at night',options:{breakLine:true}},{text:'4  Walk and swim'}],0.6,2.25,4.8,2.4,{fontSize:22,lineSpacingMultiple:1.3});
label(s,'LISTENING 2',5.9,1.85,4);
LS.L2_GRID.forEach(([k,t],i)=>{const r=Math.floor(i/4),c=i%4,x=5.9+c*1.72,y=2.25+r*1.75;icon(s,k,x,y,0.75,'navy',t?0:45);icon(s,t?'check':'cross',x+0.8,y,0.45,t?'navy':'orange');tx(s,WORD(k),x,y+0.8,1.7,0.35,{fontSize:15,bold:true,transparency:t?0:40});});
rule(s,0.6,5.75,12.13);
tx(s,[{text:'What changed? Why?   ',options:{fontFace:T,bold:true,fontSize:26}},{text:'shorts → trousers and a jacket · ',options:{fontSize:20}},{text:"It's cold at night.",options:{fontSize:20,color:ORANGE,bold:true}}],0.6,5.95,12.1,0.6,{valign:'middle'});

// 12 GAPS
s=slide({kicker:'DECISION LANGUAGE',notes:
`STAGE 5 · Decision language (31–37 min) · Gap-fill (2 min)
Aim: notice the target chunks in Leo's own words.
Students complete individually (1 min), check in pairs.
ANSWERS: 1 going · 2 not · 3 taking · 4 need.
Optional: go back to slide 10 and play the audio once more to check.`});
title(s,"Complete Leo's lines.");
tx(s,[{text:'need',options:{bold:true}},{text:'   ·   ',options:{color:ORANGE}},{text:'taking',options:{bold:true}},{text:'   ·   ',options:{color:ORANGE}},{text:'not',options:{bold:true}},{text:'   ·   ',options:{color:ORANGE}},{text:'going',options:{bold:true}}],0.6,1.75,8,0.5,{fontSize:24});
[["I'm ",' to Madrid for four days.'],["I'm ",' taking shorts.'],["I'm ",' trousers and a jacket.'],['OK, I ',' good shoes.']].forEach(([a,b],i)=>{
 tx(s,[{text:String(i+1),options:{fontFace:M,fontSize:16,color:ORANGE}},{text:'     '+a,options:{}},{text:'__________',options:{color:ORANGE}},{text:b,options:{}}],0.6,2.6+i*0.95,12,0.6,{fontSize:32});});
tx(s,'Complete. Then check with a partner.',0.6,6.35,8,0.4,{fontSize:18,transparency:30});

// 13 DECISION LANGUAGE
s=slide({kicker:'DECISION LANGUAGE',notes:
`STAGE 5 · Decision language · Meaning + pairs (4 min)
CCQs — point to row 3: "Is the jacket in the bag?" (yes) Row 4: "Are the shorts in the bag?" (no) Row 2: "Shoes — important for Leo?" (yes).
No grammar metalanguage; "I'm going to Madrid" is a fixed chunk.
Pairs (2 min): A points to a picture on slide 5–6 (or a card); B decides and says "I'm taking…" / "I'm not taking…".`});
title(s,'Decide. Say it.');
const rows=[["I'm going to ",'Madrid',' for four days.','THE TRIP',null],['I need ','good shoes','.','IMPORTANT',null],["I'm taking ",'a jacket','.','IN MY BAG','check'],["I'm not taking ",'shorts','.','NOT IN MY BAG','cross']];
rows.forEach(([a,b,c,tag,ic],i)=>{const y=1.85+i*1.05;tx(s,[{text:a,options:{bold:true}},{text:b,options:{color:ORANGE}},{text:c,options:{bold:true}}],0.6,y,8.8,0.7,{fontFace:T,fontSize:32,valign:'middle'});
 if(ic) icon(s,ic,9.55,y+0.12,0.46,ic==='cross'?'orange':'navy');tx(s,tag,10.15,y,2.6,0.7,{fontFace:M,fontSize:13,charSpacing:1.5,valign:'middle'});
 if(i<3) rule(s,0.6,y+0.88,12.13);});
label(s,'PAIRS',0.6,6.2,1.2);tx(s,"A: point to a thing.   B: decide — I'm taking… / I'm not taking…",1.6,6.14,11,0.4,{fontSize:20});

// 14 SAY IT
s=slide({kicker:'SAY IT',notes:
`STAGE 6 · Say it (37–43 min) · T–S → S–S
AUDIO: A02 I need sunscreen · A03 I'm taking a swimsuit · A04 I'm not taking shorts (cut from Leo's Call).
1. Play each clip twice (1 min). 2. Students notice: orange = strong beats (1 min).
3. Backchain (2 min): a jacket → need a jacket → I need a jacket. Tap the beat lightly on the table.
Focus: keep the /m/ in I'm; NOT is strong in "I'm NOT taking".
4. Then slide 15 (2 min).`});
title(s,'Say it.');
const lines=[['TTE_L01_A02_Say-It-1_I-need-sunscreen_v1.0.mp3',[['I ',0],['need',1],[' ',0],['sun',1],['screen.',0]],'da  DUM  DUM-da'],
 ["TTE_L01_A03_Say-It-2_Im-taking-a-swimsuit_v1.0.mp3",[["I'm ",0],['tak',1],['ing a ',0],['swim',1],['suit.',0]],'da  DUM-da  da  DUM-da'],
 ["TTE_L01_A04_Say-It-3_Im-not-taking-shorts_v1.0.mp3",[["I'm ",0],['not',1],[' taking ',0],['shorts',1],['.',0]],'da  DUM  da-da  DUM']];
lines.forEach(([f,parts,rh],i)=>{const y=1.8+i*1.35;audio(s,f,0.6,y+0.05,0.7,'play_o');
 tx(s,parts.map(([t,st])=>({text:t,options:st?{color:ORANGE,bold:true}:{bold:false}})),1.6,y-0.05,7.6,0.75,{fontFace:T,fontSize:40,valign:'middle'});
 tx(s,rh,1.62,y+0.72,6,0.3,{fontFace:M,fontSize:13,charSpacing:1.5,transparency:40});});
rect(s,9.35,1.8,3.38,3.7);
label(s,'SAY THE M',9.65,2.05,3);tx(s,"I'm taking",9.65,2.45,2.9,0.55,{fontFace:T,bold:true,fontSize:26});tx(s,"not  “I taking”",9.65,3.0,2.9,0.4,{fontSize:18,transparency:35});
label(s,'LINK',9.65,3.7,3);tx(s,[{text:'need a',options:{bold:true,breakLine:true}},{text:'→ “needa”',options:{color:ORANGE}}],9.65,4.05,2.9,0.9,{fontSize:22});
label(s,'BUILD IT',0.6,6.0,2);tx(s,[{text:'a jacket  ',options:{}},{text:'→',options:{color:ORANGE}},{text:'  need a jacket  ',options:{}},{text:'→',options:{color:ORANGE}},{text:'  I need a jacket.',options:{bold:true}}],2.1,5.93,10.5,0.45,{fontSize:22});

// 15 QUICK DECISIONS
s=slide({kicker:'SAY IT · PAIRS',notes:
`STAGE 6 · Say it · Transfer (2 min) · S–S
A points to a tile. B decides fast and says it with the right stress. Swap after 6 turns.
Online: teacher calls a tile number, a named student answers, then nominates the next student.
Listen for: strong NOT, the /m/ in I'm.`});
title(s,'Decide fast.');
tx(s,'A: point.   B: decide and say it.',0.6,1.62,8,0.4,{fontSize:20,transparency:25});
[['rainy','raincoat',"I'm taking a raincoat."],['sunny','umbrella',"I'm not taking an umbrella."],['cold','shorts',''],['hot','sweater',''],['sunny','sunglasses',''],['cold','jacket','']].forEach(([w,k,ex],i)=>{
 const c=i%3,r=Math.floor(i/3),x=0.6+c*4.1,y=2.25+r*2.25;rect(s,x,y,3.85,2.0);
 tx(s,String(i+1),x+0.25,y+0.2,0.5,0.3,{fontFace:M,fontSize:12,color:ORANGE});
 icon(s,w,x+0.6,y+0.3,0.95);tx(s,'+',x+1.65,y+0.45,0.5,0.6,{fontSize:32,color:ORANGE,align:'center'});icon(s,k,x+2.25,y+0.3,0.95);
 if(ex) tx(s,ex,x+0.25,y+1.4,3.5,0.4,{fontSize:17,bold:true});});

// 16 CHANGE THE WEATHER
s=slide({kicker:'DECISION 4 · PRACTISE',step:'DECISION 4 / 6',notes:
`STAGE 7 · Change the weather (43–50 min) · S–S
Aim: guided practice — change a decision when new information arrives (like Leo).
Set-up with a demo pair (1 min). A chooses 3 things. B chooses a WEATHER CARD 1–4 (print materials p.4) and does NOT show A.
Round 1 (3 min), swap roles (3 min). A must change at least 2 things.
ICQs: "B, do you show your card?" (no) "A, how many changes?" (2)
Online: B privately picks a number; teacher sends the card text in private chat.
Monitor: note 2 good examples + 3 errors for delayed feedback.`});
title(s,'Change the weather.');
label(s,'A · TRAVELLER',0.6,1.85,4);tx(s,'Choose 3 things for your bag.',0.6,2.2,4.2,0.8,{fontSize:20});
label(s,'B · FRIEND',0.6,3.1,4);tx(s,"Choose a weather card. Don’t show A!",0.6,3.45,4.2,0.8,{fontSize:20});
tx(s,'A: change 2 things. Then swap.',0.6,4.45,4.2,0.8,{fontSize:20,bold:true,color:ORANGE});
label(s,'HELP',0.6,5.55,2);tx(s,[{text:'Sorry? Can you repeat that, please?',options:{breakLine:true}},{text:'Slowly, please.'}],0.6,5.88,4.3,0.8,{fontSize:17,italic:true});
rect(s,5.1,1.8,7.63,4.95);
const dlg=[['B','Hi! Are you ready for ',['________'],'?'],['A',"Yes! I'm going to ",['________'],' for ',['___'],' days.'],['A',"I'm taking ",['______'],', ',['______'],' and ',['______'],'.'],['A',"What's the weather like?"],['B',"It's ",['________'],' this week.'],['A',"Really? OK. I'm not taking ",['______'],'.'],['A',"I'm taking ",['______'],'.'],['A','Do I need ',['______'],'?'],['B',"Yes, you do.  /  No, you don't."]];
dlg.forEach((d,i)=>{const y=2.05+i*0.5;tx(s,d[0],5.4,y,0.4,0.4,{fontFace:M,fontSize:14,color:ORANGE,bold:true});
 tx(s,d.slice(1).map(p=>Array.isArray(p)?{text:p[0],options:{color:ORANGE}}:{text:p,options:{}}),5.9,y-0.02,6.7,0.45,{fontSize:19});});

// 17 CHALLENGE BRIEF
s=slide({dark:true,kicker:'DECISION 5 · THE CHALLENGE',step:'DECISION 5 / 6',notes:
`STAGE 8 · One bag, ten things (50–66 min = 16 min)
01 Think alone (2) · 02 Compare and agree (5) · 03 New information (3) · 04 Bag reveal to another pair (4) · Content feedback (2)
Materials: trip cards (slide 18 / print p.3), item cards (print p.1) or slide 19, bag template (print p.2), twist cards (slide 20 / print p.4).
Set-up: give each pair ONE trip card. "You are travelling together. One small bag. Ten things — passport and charger count!"
ICQs: "How many bags?" (one) "How many things?" (10) "Passport — in the 10?" (yes)`});
title(s,'One bag. Ten things.',{dark:true,size:48});
tx(s,"You're travelling together. You have ONE small bag — 10 things, including your essentials.",0.6,1.75,8,0.9,{fontSize:22,color:PAPER});
[['01 · 2 MIN','Think alone. Fill your bag.'],['02 · 5 MIN','Compare. Agree on ONE bag.'],['03 · 3 MIN','New information! 1 out, 1 in.'],['04 · 4 MIN','Show your bag to another pair.']].forEach(([a,b],i)=>{const y=2.95+i*0.72;
 tx(s,a,0.6,y+0.06,1.9,0.35,{fontFace:M,fontSize:13,color:ORANGE,charSpacing:1});tx(s,b,2.55,y,5.6,0.5,{fontSize:24,bold:true,color:PAPER});});
tx(s,'YOUR BAG · 10 THINGS',8.6,2.55,4,0.3,{fontFace:M,fontSize:12,color:PAPER,charSpacing:1.5,transparency:30});
for(let i=0;i<10;i++){const x=8.6+(i%5)*0.84,y=2.95+Math.floor(i/5)*0.84;s.addShape(pres.shapes.RECTANGLE,{x,y,w:0.72,h:0.72,fill:{type:'none'},line:{color:PAPER,width:1.25,dashType:'dash'}});}
icon(s,'passport',8.66,3.01,0.6,'paper');icon(s,'phone_charger',9.5,3.01,0.6,'paper');
s.addShape(pres.shapes.LINE,{x:0.6,y:6.0,w:12.13,h:0,line:{color:PAPER,width:0.75,transparency:75}});
tx(s,[{text:'SAY   ',options:{fontFace:M,fontSize:12,color:ORANGE}},{text:'Are you taking…?   ·   Good idea!   ·   Hmm, I’m not sure.   ·   My bag is full.',options:{fontSize:19,color:PAPER}}],0.6,6.2,12.1,0.45,{valign:'middle'});

// 18 TRIP CARDS
s=slide({kicker:'DECISION 5 · YOUR TRIP',step:'DECISION 5 / 6',notes:
`STAGE 8 · One bag, ten things · Trip cards
Give each pair one trip (A–D). Two pairs can share a trip — then compare their decisions in step 04.
Forecasts are "this week" only — not a rule about the country. Snowy and windy are recognition words: point to the icon.
1-to-1: teacher and student share one trip; the teacher's secret bag has 2 strange choices (e.g. a swimsuit for Sapporo).`});
title(s,'Your trip');
LS.TRIPS.forEach((t,i)=>{const x=0.6+i*3.1,y=1.75;rect(s,x,y,2.9,5.05);
 label(s,'TRIP '+t.id,x+0.25,y+0.2,2);tx(s,t.city,x+0.25,y+0.5,2.6,0.55,{fontFace:T,bold:true,fontSize:26});
 tx(s,t.country+' · '+t.month,x+0.25,y+1.08,2.6,0.35,{fontSize:15});tx(s,t.days+' days',x+0.25,y+1.38,2.6,0.35,{fontSize:15,bold:true});
 tx(s,'THIS WEEK',x+0.25,y+1.88,2.6,0.25,{fontFace:M,fontSize:10,charSpacing:1.5,transparency:35});
 t.forecast.forEach(([w,tmp],d)=>{const dx=x+0.25+d*0.85;tx(s,'DAY '+(d+1),dx,y+2.15,0.8,0.25,{fontFace:M,fontSize:9,transparency:30});icon(s,w,dx,y+2.4,0.58);tx(s,tmp,dx,y+3.02,0.8,0.3,{fontSize:15,bold:true});});
 if(t.note) tx(s,t.note.toUpperCase(),x+0.25,y+3.36,2.6,0.25,{fontFace:M,fontSize:9,color:ORANGE,charSpacing:1});
 tx(s,'ACTIVITIES',x+0.25,y+3.7,2.6,0.25,{fontFace:M,fontSize:10,charSpacing:1.5,transparency:35});
 t.acts.forEach(([k,w],a)=>{icon(s,k,x+0.25,y+3.98+a*0.5,0.42);tx(s,w,x+0.8,y+4.02+a*0.5,2.0,0.35,{fontSize:15});});});

// 19 PACK HERE
s=slide({kicker:'DECISION 5 · PACK',step:'DECISION 5 / 6',notes:
`STAGE 8 · One bag, ten things · Item bank (optional slide for online / 1-to-1)
Online: open the deck in edit mode on a shared screen (or give each pair a copy of this slide). Students drag or copy pictures into the 10 boxes.
Zero-tech alternative: students type their 10 things in the chat.
"Also in the shop" items are recognition only — students may pack them, but don't teach them.`});
title(s,'Pack your bag.');
rect(s,0.6,1.8,5.35,4.45);label(s,'OUR BAG · 10 THINGS',0.9,2.02,4,{color:NAVY,transparency:35});
for(let i=0;i<10;i++){const x=0.9+(i%5)*0.97,y=2.55+Math.floor(i/5)*1.55;s.addShape(pres.shapes.RECTANGLE,{x,y,w:0.82,h:0.82,fill:{type:'none'},line:{color:NAVY,width:1.25,dashType:'dash',transparency:40}});tx(s,String(i+1),x,y+0.88,0.82,0.3,{fontFace:M,fontSize:10,align:'center',transparency:45});}
ORDER.forEach((k,i)=>{const c=i%5,r=Math.floor(i/5),x=6.45+c*1.27,y=1.75+r*1.25;icon(s,k,x+0.1,y,0.62);tx(s,WORD(k),x-0.1,y+0.66,1.25,0.3,{fontSize:12,bold:true,align:'center'});});
tx(s,'ALSO IN THE SHOP',6.45,5.6,4,0.25,{fontFace:M,fontSize:10,charSpacing:1.5,transparency:45});
LS.RECOG.forEach(([k,a,w],i)=>{const x=6.45+i*0.9;icon(s,k,x+0.12,5.88,0.42,'navy',50);tx(s,w,x-0.1,6.32,0.9,0.25,{fontFace:M,fontSize:8,align:'center',transparency:45});});
tx(s,'ONLINE: DRAG INTO THE BAG · IN CLASS: CARDS',0.6,6.45,5.6,0.3,{fontFace:M,fontSize:10,charSpacing:1,transparency:35});

// 20 NEW INFO
s=slide({kicker:'DECISION 5 · NEW INFORMATION',step:'DECISION 5 / 6',notes:
`STAGE 8 · One bag, ten things · 03 New information (3 min), then 04 Bag reveal (4 min), then content feedback (2 min)
Give each pair ONE card number (in class: hand out the printed card). Pairs re-decide.
Card 3: present it as a possible local rule — "check the local dress rules". Don't link it to one country or religion.
Bag reveal: each pair tells another pair about its final bag in 3–4 sentences, including the change. The other pair asks one question.
Content feedback (2 min): "Which pair is ready for rain? Who changed their bag?" + one language point to reuse in the final task.`});
title(s,'New information!');
LS.TWISTS.forEach((t,i)=>{const x=0.6+i*3.1;rect(s,x,1.75,2.9,4.25);label(s,'CARD '+t.n,x+0.25,1.97,2);
 tx(s,t.title,x+0.25,2.35,2.5,0.5,{fontFace:T,bold:true,fontSize:22});
 tx(s,t.text,x+0.25,2.9,2.5,1.3,{fontSize:19});
 if(t.small) tx(s,t.small,x+0.25,4.1,2.5,1.0,{fontSize:12.5,transparency:25});
 tx(s,t.task.toUpperCase(),x+0.25,5.2,2.5,0.6,{fontFace:M,fontSize:10.5,color:ORANGE,charSpacing:0.8});});
tx(s,[{text:'Decide together. Then tell another pair: ',options:{}},{text:"I'm taking… / I'm not taking…",options:{bold:true}}],0.6,6.25,12,0.45,{fontSize:20});

// 21 TRAVEL NOTE
s=slide({kicker:'TRAVEL NOTE',notes:
`STAGE 9 · Travel Note: it depends (66–70 min) · S–S
1 min: students read the three notes (help with "forecast", "dress rules", "plugs" by pointing).
3 min: pairs answer "A visitor to your country: what do they need?" — "In Brazil, you need sunscreen."
Frame everything as "check before you go". Rules are different in different places; avoid generalisations about any country.`});
title(s,'It depends.');
[[['sunny','cold'],'WEATHER','The same city can be hot in the day and cold at night. Check the forecast for your dates.'],
 [['old_city'],'PLACES','Some religious sites have dress rules — for example, covering shoulders or knees. Rules are different in different places.'],
 [['adapter'],'PLUGS','Plugs are different in different countries. Do you need an adapter?']].forEach(([ics,lab,t],i)=>{const x=0.6+i*4.15;
 ics.forEach((k,j)=>icon(s,k,x+j*1.0,1.8,0.85));label(s,lab,x,2.85,3);tx(s,t,x,3.2,3.75,1.8,{fontSize:19,lineSpacingMultiple:1.1});});
rect(s,0.6,5.2,12.13,1.55);
tx(s,'A visitor to your country: what do they need?',0.9,5.35,11.5,0.55,{fontFace:T,bold:true,fontSize:24});
tx(s,[{text:'In ',options:{}},{text:'________',options:{color:ORANGE}},{text:', you need ',options:{}},{text:'________',options:{color:ORANGE}},{text:'.',options:{}}],0.9,5.95,11,0.5,{fontSize:22});

// 22 PLAN
s=slide({dark:true,kicker:'DECISION 6 · FINAL TASK',step:'DECISION 6 / 6',notes:
`STAGE 10 · My Travel Bag (70–86 min = 16 min): Plan 3 · Check 1 5 · Decide & update 1 · Check 2 5 · Decide & update 1 · One change 1
PLAN (3 min): each student chooses a real next trip, a dream trip, or a trip card, and completes the My Travel Bag card (print p.5; online: copy the card into a document or the chat).
ICQs: "How many things are you taking?" (5 or more) "How many things are you NOT taking?" (1 or more)
Teacher: monitor silently; help only with words.`});
title(s,'My Travel Bag',{dark:true,size:48});steps(s,0,0.6,1.85,true);
tx(s,'Plan.',0.6,2.55,4.6,0.7,{fontFace:T,bold:true,fontSize:32,color:PAPER});
tx(s,[{text:'Your trip: real or dream — or a trip card.',options:{breakLine:true}},{text:'Complete your list.'}],0.6,3.3,4.7,1.2,{fontSize:21,color:PAPER,lineSpacingMultiple:1.2});
tx(s,'3 MINUTES',0.6,4.7,3,0.3,{fontFace:M,fontSize:13,color:ORANGE,charSpacing:1.5});
rect(s,5.75,2.4,6.98,4.35,PAPER);
const cx=6.05;label(s,'MY TRAVEL BAG',cx,2.6,4);
tx(s,[{text:"I'm going to ",options:{}},{text:'____________',options:{color:ORANGE}},{text:' for ',options:{}},{text:'___',options:{color:ORANGE}},{text:' days.',options:{}}],cx,2.98,6.5,0.4,{fontSize:18});
tx(s,'The weather:',cx,3.48,1.6,0.4,{fontSize:18});['sunny','rainy','hot','cold'].forEach((k,i)=>{icon(s,k,7.75+i*0.85,3.4,0.45);box(s,8.25+i*0.85,3.5,0.22);});
tx(s,[{text:'Activities: ',options:{}},{text:'______________________',options:{color:ORANGE}}],cx,3.98,6.5,0.4,{fontSize:18});
tx(s,"I'm taking:",cx,4.48,2,0.4,{fontSize:18,bold:true});
for(let i=0;i<6;i++){tx(s,[{text:(i+1)+'  ',options:{fontFace:M,fontSize:12,color:ORANGE}},{text:'______________',options:{color:NAVY,transparency:50}}],cx+(i<3?0:3.2),4.85+(i%3)*0.36,3,0.34,{fontSize:15});}
tx(s,[{text:"I'm not taking: ",options:{bold:true}},{text:'__________',options:{color:ORANGE}},{text:"   It's ",options:{}},{text:'__________',options:{color:ORANGE}},{text:'.',options:{}}],cx,5.98,6.5,0.4,{fontSize:17});
tx(s,[{text:'CHANGES  ',options:{fontFace:M,fontSize:12,color:ORANGE}},{text:'______________________________',options:{transparency:50}}],cx,6.35,6.5,0.35,{fontSize:15});

// 23 CHECK
s=slide({kicker:'FINAL TASK · CHECK',step:'DECISION 6 / 6',notes:
`STAGE 10 · CHECK — Round 1 (5 min, about 2.5 min each way), Round 2 with a NEW partner (5 min)
The checker's job: ask at least 1 question and make 1 useful suggestion (add / remove / change) with a reason.
Model the example with a strong student first (30 seconds).
ICQs: "Checker — how many questions?" (1 or more) "How many suggestions?" (1) "Traveller — must you say yes?" (no)
Teacher: silent monitor with the assessment grid (lesson plan, appendix). Don't interrupt.`});
title(s,"Check your partner's bag.");steps(s,1,0.6,1.62,false,14);
tx(s,'Find ONE thing to add, remove or change.',0.6,2.15,6.2,0.5,{fontSize:22,bold:true,color:ORANGE});
label(s,'ASK',0.6,2.85,2);tx(s,[{text:'Are you taking… ?',options:{breakLine:true}},{text:'Do you need… ?'}],0.6,3.18,5.6,0.95,{fontFace:T,bold:true,fontSize:24,lineSpacingMultiple:1.1});
tx(s,[{text:'→ ',options:{color:ORANGE}},{text:"Yes, I am.  /  No, I'm not.  /  Yes, I do.  /  No, I don't."}],0.6,4.1,6,0.35,{fontSize:16});
label(s,'SUGGEST',0.6,4.6,2);tx(s,[{text:"You need a jacket. It's cold at night.",options:{breakLine:true}},{text:"You don't need shorts.",options:{breakLine:true}},{text:'Take a raincoat, not an umbrella.'}],0.6,4.93,5.8,1.4,{fontSize:21,lineSpacingMultiple:1.1});
rect(s,6.75,1.75,5.98,4.6);label(s,'EXAMPLE',7.05,1.97,3);
[['A',"I'm going to Lisbon for three days. It's sunny. I'm taking T-shirts, shoes, sunglasses and sunscreen. I'm not taking a swimsuit."],['B','Are you taking a jacket?'],['A','No.'],['B',"You need a jacket. It's cold at night."],['A',"OK, good idea. I'm taking a jacket."]].forEach(([p,t],i)=>{const y=[2.35,3.6,4.15,4.6,5.35][i];
 tx(s,p,7.05,y,0.4,0.35,{fontFace:M,fontSize:14,color:ORANGE,bold:true});tx(s,t,7.5,y-0.02,5.0,i===0?1.2:0.7,{fontSize:17.5,bold:p==='B'});});
tx(s,'2 ROUNDS · NEW PARTNER EACH ROUND · CHECK, THEN SWAP ROLES',0.6,6.45,11,0.3,{fontFace:M,fontSize:11,charSpacing:1.2,transparency:30});

// 24 DECIDE & UPDATE
s=slide({kicker:'FINAL TASK · DECIDE · UPDATE',step:'DECISION 6 / 6',notes:
`STAGE 10 · DECIDE & UPDATE (1 min after each round) + ONE CHANGE (1 min at the end)
The traveller decides: accept or decline — both are fine if there is a reason. Write the change in CHANGES.
End: 2–3 students tell the class one change: "I'm taking a jacket now. It's cold at night."
Assess with the checklist: every traveller box + every checker box.`});
title(s,'Decide. Update your list.');steps(s,3,0.6,1.62,false,14);
label(s,'DECIDE',0.6,2.3,2);
tx(s,[{text:'Yes  ',options:{fontFace:M,fontSize:14,color:ORANGE}},{text:"OK, good idea. I'm taking a jacket.",options:{breakLine:true}},{text:'No   ',options:{fontFace:M,fontSize:14,color:ORANGE}},{text:'No, thanks. I have a sweater.'}],0.6,2.65,6.4,1.1,{fontSize:22,bold:true,lineSpacingMultiple:1.3});
label(s,'UPDATE',0.6,4.0,2);tx(s,'Write the change on your list.',0.6,4.35,6,0.45,{fontSize:22});
tx(s,[{text:'CHANGES  ',options:{fontFace:M,fontSize:12,color:ORANGE}},{text:"+ a jacket  (It's cold at night.)",options:{}}],0.6,4.85,6,0.4,{fontSize:20,italic:true});
tx(s,[{text:'Tell the class: ',options:{bold:true}},{text:'one change and why.'}],0.6,5.8,6,0.45,{fontSize:22});
rect(s,7.25,1.75,5.48,5.0);label(s,'DID YOU DO IT?',7.55,1.97,4);
tx(s,'TRAVELLER',7.55,2.4,3,0.3,{fontFace:M,fontSize:11,charSpacing:1.5,transparency:30});
['I say where and how long.','I say the weather.',"I say 5+ things I'm taking and 1+ thing I'm not taking.",'I answer the question.','I decide and update my list.'].forEach((t,i)=>{const y=2.75+i*0.46+(i>2?0.2:0);box(s,7.55,y+0.05,0.24);tx(s,t,7.95,y,4.6,i===2?0.66:0.4,{fontSize:15.5});});
tx(s,'CHECKER',7.55,5.25,3,0.3,{fontFace:M,fontSize:11,charSpacing:1.5,transparency:30});
['I ask 1 question.','I make 1 useful suggestion with a reason.'].forEach((t,i)=>{const y=5.6+i*0.46;box(s,7.55,y+0.05,0.24);tx(s,t,7.95,y,4.6,0.4,{fontSize:15.5});});

// 25 FEEDBACK
s=slide({kicker:'FEEDBACK',notes:
`STAGE 11 · Feedback, Can-do check, Toolkit (86–90 min)
Delayed feedback (3 min): content first ("Who changed their bag? Why?"), then write 2 good examples under GREAT LANGUAGE and 3 errors under LET'S FIX — students self-correct in pairs.
Likely errors: "I taking" → I'm taking · "I need umbrella" → I need an umbrella · "I'm going in Lisbon" → I'm going to Lisbon.`});
title(s,'How did it go?');
tx(s,'Who changed their bag? Why?',0.6,1.65,9,0.5,{fontSize:24,transparency:20});
rect(s,0.6,2.4,5.95,4.35);rect(s,6.78,2.4,5.95,4.35);
label(s,'GREAT LANGUAGE',0.9,2.62,4);label(s,"LET'S FIX",7.08,2.62,4);

// 26 CAN-DO
s=slide({kicker:'CAN YOU…?',notes:
`STAGE 11 · Can-do check (under 1 min). Students tick silently. Point to the Toolkit (slides 27–28 / Toolkit PDF) as the take-home reference.`});
title(s,'Can you do it?');
['I can say where I’m going and for how long.','I can say what I’m taking and not taking.',"I can give a simple reason: It's cold at night.",'I can check a partner’s bag and make a suggestion.','I can make a simple packing list.'].forEach((t,i)=>{const y=1.9+i*0.78;box(s,0.6,y+0.08,0.38);tx(s,t,1.25,y,11,0.55,{fontSize:26});});
rule(s,0.6,6.05,12.13);
tx(s,'LESSON 01 · I CAN TALK ABOUT WHAT I NEED TO TAKE ON A TRIP AND MAKE A SIMPLE PACKING LIST.',0.6,6.2,12.1,0.3,{fontFace:M,fontSize:11,color:ORANGE,charSpacing:1});

// 27 TOOLKIT 1
const TK=LS.TOOLKIT;
s=slide({kicker:'TRAVEL TOOLKIT · LESSON 01',notes:`Toolkit (take-home). Same content as the Toolkit PDF. No teaching needed — point to it.`});
title(s,'Travel Toolkit');
function col(s,lab,arr,x,y,w,fs=20,gap=0.56){label(s,lab,x,y,w);arr.forEach((t,i)=>{tx(s,t,x,y+0.4+i*gap,w,0.45,{fontSize:fs});if(i<arr.length-1)rule(s,x,y+0.4+i*gap+gap-0.08,w);});}
col(s,'READY-MADE PHRASES',TK.phrases,0.6,1.8,6.1);col(s,'USEFUL QUESTIONS',TK.questions,7.1,1.8,5.6);

// 28 TOOLKIT 2
s=slide({kicker:'TRAVEL TOOLKIT · LESSON 01',notes:`Toolkit (take-home), page 2.`});
title(s,'Travel Toolkit');
col(s,'USEFUL ANSWERS',TK.answers,0.6,1.8,3.8,18,0.52);col(s,"CHECK A FRIEND'S BAG",TK.checker,4.75,1.8,4.25,18,0.52);col(s,'REPAIR',TK.repair,9.35,1.8,3.4,18,0.52);
rect(s,0.6,5.1,12.13,1.55);label(s,'EXAMPLE LIST',0.9,5.28,4);
tx(s,[{text:'Lisbon · 3 days · sunny, rainy Day 2   ',options:{bold:true}},{text:"I'm taking: ",options:{bold:true,color:ORANGE}},{text:'a passport, a phone charger, shoes, a sweater, a raincoat, sunglasses.   ',options:{}},{text:"I'm not taking: ",options:{bold:true,color:ORANGE}},{text:'an umbrella. I have a raincoat.   ',options:{}},{text:'CHANGES: ',options:{bold:true,color:ORANGE}},{text:"+ a jacket (It's cold at night.)",options:{}}],0.9,5.62,11.6,0.9,{fontSize:16});
}
(async()=>{await prep();build();await pres.writeFile({fileName:OUT});console.log('slides',N);})();
