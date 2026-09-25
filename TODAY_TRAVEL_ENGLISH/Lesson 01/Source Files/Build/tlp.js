const fs=require('fs');const path=require('path');const LS=require('./lesson');
const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,ShadingType,AlignmentType,LevelFormat,BorderStyle,Footer,Header,PageNumber,HeadingLevel,PageBreak,TabStopType}=require('docx');
const LDIR=process.argv[2];
const NAVY='0B1440',OR='F44904',SAND='F3EFE6',MUTE='5B6088';
const P=(t,o={})=>new Paragraph({spacing:{after:o.after??100,before:o.before??0},keepNext:o.keepNext,children:runs(t,o)});
function runs(t,o={}){ // supports **bold** and _mono_
  if(Array.isArray(t)) return t;
  const out=[];const re=/(\*\*[^*]+\*\*|`[^`]+`)/g;let last=0,m;
  while((m=re.exec(t))){if(m.index>last)out.push(new TextRun({text:t.slice(last,m.index),size:o.size??20,color:o.color??NAVY,italics:o.italic}));
    const x=m[0];if(x.startsWith('**'))out.push(new TextRun({text:x.slice(2,-2),bold:true,size:o.size??20,color:o.color??NAVY}));else out.push(new TextRun({text:x.slice(1,-1),font:'JetBrains Mono',size:(o.size??20)-3,color:OR}));last=re.lastIndex;}
  if(last<t.length)out.push(new TextRun({text:t.slice(last),size:o.size??20,color:o.color??NAVY,italics:o.italic,bold:o.bold}));return out;}
const K=(t)=>new Paragraph({spacing:{before:120,after:60},keepNext:true,children:[new TextRun({text:'— '+t.toUpperCase(),font:'JetBrains Mono',size:16,color:OR,characterSpacing:20})]});
const H1=(t)=>new Paragraph({heading:HeadingLevel.HEADING_1,pageBreakBefore:false,spacing:{before:360,after:140},keepNext:true,children:[new TextRun({text:t,font:'Poppins',bold:true,size:34,color:NAVY})]});
const H2=(t)=>new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:260,after:100},keepNext:true,children:[new TextRun({text:t,font:'Poppins',bold:true,size:26,color:NAVY})]});
const BL=(t,l=0)=>new Paragraph({numbering:{reference:'b',level:l},spacing:{after:60},children:runs(t)});
const NL=(t,ref)=>new Paragraph({numbering:{reference:ref,level:0},spacing:{after:60},children:runs(t)});
let nlc=0;const numbered=(arr)=>{const ref='n'+(nlc++);NUMREFS.push(ref);return arr.map(t=>NL(t,ref));};
const NUMREFS=[];
const TW=9638;
function table(head,rows,widths,o={}){
  const bd={style:BorderStyle.SINGLE,size:4,color:'D5D3DE'};const borders={top:bd,bottom:bd,left:bd,right:bd};
  const cell=(t,w,h,i)=>new TableCell({width:{size:w,type:WidthType.DXA},borders,margins:{top:70,bottom:70,left:100,right:100},
    shading:h?{fill:NAVY,type:ShadingType.CLEAR,color:'auto'}:(o.firstCol&&i===0?{fill:SAND,type:ShadingType.CLEAR,color:'auto'}:undefined),
    children:(Array.isArray(t)?t:String(t).split('\n')).map(x=>x instanceof Paragraph?x:new Paragraph({spacing:{after:40},children:h?[new TextRun({text:x,bold:true,color:'FAF7F2',size:17,font:'JetBrains Mono'})]:runs(x,{size:o.size??18,bold:o.firstCol&&i===0})}))});
  const tr=[];if(head)tr.push(new TableRow({tableHeader:true,children:head.map((h,i)=>cell(h,widths[i],true,i))}));
  rows.forEach(r=>tr.push(new TableRow({cantSplit:o.cantSplit??true,children:r.map((c,i)=>cell(c,widths[i],false,i))})));
  return new Table({width:{size:TW,type:WidthType.DXA},columnWidths:widths,rows:tr});
}
const sp=()=>new Paragraph({spacing:{after:80},children:[]});
const C=[];
// ---------- COVER ----------
C.push(new Paragraph({spacing:{after:80},children:[new TextRun({text:'— TODAY TRAVEL ENGLISH · TEACHER LESSON PLAN',font:'JetBrains Mono',size:18,color:OR,characterSpacing:20})]}));
C.push(new Paragraph({spacing:{after:0},children:[new TextRun({text:'Lesson 01',font:'Poppins',bold:true,size:56,color:NAVY})]}));
C.push(new Paragraph({spacing:{after:200},children:[new TextRun({text:'Packing for a Trip',font:'Poppins',bold:true,size:56,color:OR})]}));
C.push(P('A1 · 90 minutes · Speaking-first · Signature experience: **Decision-making** · Final production: **My Travel Bag**',{size:22}));
C.push(P('Version 1.0 — for review (not marked FINAL until approved). Built from the approved Phase 1 architecture.',{color:MUTE,size:18,after:240}));
C.push(table(null,[
 ['Course','Today Travel English · 20 lessons × 90 min · A1 → A1+ → A2'],['Lesson','01 of 20 — Packing for a Trip'],['Theme / subtheme','Travel preparation / deciding what to pack'],
 ['CEFR','A1'],['Time','90 minutes'],['Skill focus','Speaking (functional), supported by listening and pronunciation'],['Lesson type','Task-based lesson built on a “Decision Ladder”: six decisions, each harder than the last'],
 ['Can-do (Matrix)','I can talk about what I need to take on a trip and make a simple packing list.'],
 ['Overall communicative aim','Learners decide what goes in a bag for a specific trip, say what they are taking and not taking, give a simple reason, check a partner’s bag and update their own list.'],
 ['Learners','Adults; 1-to-1 or groups; in person or online'],
 ['Materials','Student Deck (28 slides) · Audio A01–A04 · Classroom Materials PDF (print pages 1–6) · Travel Toolkit PDF'],
],[2600,7038],{firstCol:true}));
// ---------- AIMS ----------
C.push(H1('1. Aims and outcome'));
C.push(K('Main aim'));C.push(P('By the end of the lesson, learners can talk about what they need to take on a trip and make a simple packing list — shown by the final task **My Travel Bag** (plan → check → decide → update).'));
C.push(K('Secondary aims'));
C.push(BL('**Listening:** understand a short conversation for gist (destination, days, weather, activities) and for specific information (packing decisions).'));
C.push(BL('**Pronunciation:** rhythm and stress in `I need…` / `I’m taking…` / `I’m NOT taking…`; keeping the /m/ in I’m.'));
C.push(BL('**Vocabulary:** 14 packing items and 4 weather words for immediate spoken use.'));
C.push(BL('**Interaction:** asking about and suggesting changes to a partner’s choices (checker language).'));
C.push(K('Lesson outcome'));C.push(P('Every learner leaves with a personal packing list that has been checked by two partners and updated at least once (or with a reasoned “no, thanks”), plus the Travel Toolkit as a take-home reference.'));
C.push(K('Assumptions'));
['This is lesson 1: there is no previous course language to recycle. Learners know numbers 1–10, “I’m…”, “It’s…” and a/an at a basic level.','Many learners know some clothes and weather words; stage 2 activates these before teaching the gaps.','Learners have travelled, or plan to travel, so personalisation in stages 1 and 10 is real. A “dream trip” or a trip card covers anyone without a trip.','Learners do not need knowledge of any destination’s climate: all weather information is on the cards (“this week”).'].forEach(t=>C.push(BL(t)));
// ---------- TL ----------
C.push(H1('2. Target language'));
C.push(P('Taught as chunks. No grammar metalanguage is needed on slides or in class. Matrix “grammar in context”: need + noun; be going to as chunks.',{color:MUTE}));
C.push(K('A · Core chunks (production)'));
C.push(table(['Chunk','Function','Where it appears','How it is practised'],[
 ['I’m going to [Madrid] for [four] days.','Set the context of the trip','Slides 3, 9, 13, 16, 22–23','Lead-in questions; opening line in stages 7, 8 and 10'],
 ['I need [a jacket / sunscreen].','Say what is necessary','Audio; slides 13–14','Pronunciation; weather role-play; reasons'],
 ['I’m taking [a sweater].','Announce a decision','Audio; slides 10–24','Everywhere from stage 5 on'],
 ['I’m not taking [shorts].','Reject an item','Audio; slides 10–24','Contrastive stress drill; twist; final'],
 ['It’s [cold] (at night / this week).','Give a reason','Slides 6, 11, 16, 21–24','Every justification'],
],[2700,1900,2300,2738]));
C.push(K('B · Support language (scaffolded)'));
C.push(table(['Chunk','Function','Where'],[
 ['Do I need [an umbrella]? — Yes, you do. / No, you don’t.','Ask for advice','Audio; slides 16, 23'],
 ['Are you taking…? / Do you need…? — Yes, I am. / No, I’m not. / Yes, I do. / No, I don’t.','Check a decision','Slides 17, 23'],
 ['You need… It’s… / You don’t need… / Take a…, not a…','Suggest a change (checker)','Slide 23'],
 ['OK, good idea! / No, thanks. I have a… / Hmm, I’m not sure.','Accept / decline / hesitate','Slides 17, 24'],
 ['Where are you going? / How many days? / What’s the weather like?','Ask about a trip','Slides 3, 16'],
 ['My bag is full.','Refer to the limit','Slide 17'],
 ['I’m going to [walk / swim].','Planned activities (be going to as a chunk)','Audio (“we’re going to walk a lot”), trip cards'],
],[4400,2200,3038]));
C.push(K('C · Optional extension (strong learners only, not assessed)'));
C.push(BL('because: “I’m taking a jacket because it’s cold at night.”'));C.push(BL('We’re taking… / We’re not taking… (in stage 8, if a pair shifts to “we” naturally).'));
// ---------- VOCAB ----------
C.push(H1('3. Vocabulary'));
C.push(K('Active production — 18 items'));
C.push(table(['Category','Items (with the chunk students say)'],[
 ['Essentials','a passport · a phone charger'],['Clothes','a T-shirt · shorts · trousers (US: pants) · a sweater · a jacket · shoes · a swimsuit'],
 ['Weather items','an umbrella · a raincoat · sunglasses · sunscreen · a hat'],['Weather','sunny · rainy · hot · cold  (It’s sunny.)']],[2200,7438],{firstCol:true}));
C.push(P('Every active item has a picture on slides 4–6, 19 and on the item cards (print p.1). Slide numbering 01–14 is the same on slides 4, 5 and 6.',{before:80}));
C.push(K('Recognition only — do not drill'));
C.push(P('wallet, adapter, toothbrush, medicine, scarf, gloves, sandals (“EXTRA” cards, muted on slide 19) · suitcase, backpack, carry-on · windy, snowy (trip-card icons) · religious site, dress rules (twist card 3, Travel Note).'));
// ---------- PRON ----------
C.push(H1('4. Pronunciation'));
C.push(table(['Line (from the audio)','Stress / rhythm','Watch for'],[
 ['I need sunscreen. (A02)','da DUM DUM-da','need‿sunscreen; SUN-screen stress'],
 ['I’m taking a swimsuit. (A03)','da DUM-da da DUM-da','keep the /m/ in I’m; weak “a”'],
 ['I’m not taking shorts. (A04)','da DUM da-da DUM','NOT is strong — it carries the decision'],
 ['Build it: a jacket → need a jacket → I need a jacket.','backchaining','need a → “needa”']],[3600,2300,3738]));
C.push(P('Teacher model → student noticing → controlled practice → communicative transfer (slide 15). Six minutes in total. No phonemic script is needed.',{before:80}));
// ---------- MATERIALS ----------
C.push(H1('5. Materials and preparation'));
C.push(table(['Material','File / location','Preparation'],[
 ['Student Deck (28 slides)','PPTX/TTE_L01_Packing-for-a-Trip_Student-Deck_v1.0.pptx','Install the fonts (Source Files/Fonts). Test the audio on slides 9, 10 and 14.'],
 ['Audio','Audio/A01 Leo’s Call (0:58), A02–A04 Say it clips','Embedded in the deck; loose MP3s are a backup.'],
 ['Print 1 · Item cards','Teacher Lesson Plan/TTE_L01_Classroom-Materials_Print_v1.0.pdf, p.1','1 set per pair, cut up (stages 3 and 8)'],
 ['Print 2 · Bag template','same PDF, p.2 (A4 landscape)','1 per pair'],
 ['Print 3 · Trip cards A–D','same PDF, p.3','1 card per pair'],
 ['Print 4 · New information cards','same PDF, p.4','1 set, cut up'],
 ['Print 5 · Weather cards','same PDF, p.5','1 set per pair, cut up (stage 7)'],
 ['Print 6 · My Travel Bag card','same PDF, p.6 (2 per page)','1 per student'],
 ['Travel Toolkit','Toolkit/TTE_L01_Travel-Toolkit_v1.0.pdf','1 per student (print or send after class)'],
 ['Assessment grid','Appendix A of this plan','1 for the teacher']],[2500,4300,2838]));
// ---------- STAGING OVERVIEW ----------
C.push(H1('6. Staging overview'));
const inter=['T–S, S–S','S–S, T–S','S–S','S, S–S','T–S, S–S','T–S, S–S','S–S','Individual, pairs, pair-to-pair','S–S','Individual, rotating pairs','T–S'];
const aims=['Personalise; first decision','Activate and clarify 14 items and 4 weather words','First sorting decision','Gist and detail; hear a decision being changed','Draw out the chunks from the audio','Rhythm and stress','Change decisions after new information','Decide under a limit, justify, agree, re-decide','Widen “it depends” before the final','Show the Can-do: plan → check → decide → update','Close the loop'];
C.push(table(['#','Stage','Time','Slides','Aim','Interaction'],LS.STAGES.map((s,i)=>[String(s[0]),s[1],`${s[2]}–${s[3]} (${s[3]-s[2]} min)`,s[4],aims[i],inter[i]]),[450,2300,1300,800,3038,1750]));
C.push(P('Total: 5 + 9 + 5 + 12 + 6 + 6 + 7 + 16 + 4 + 16 + 4 = **90 minutes**. Estimated student talking time: about 58 minutes (about 64%).',{before:80}));
// ---------- DETAILED PROCEDURE ----------
C.push(H1('7. Detailed procedure'));
function stage(n,name,time,slides,inter,aim,steps,extra={}){
  C.push(H2(`Stage ${n} · ${name}`));
  C.push(P(`\`${time}\`  ·  slides ${slides}  ·  ${inter}`,{after:60}));
  C.push(P(`**Aim:** ${aim}`));
  numbered(steps).forEach(p=>C.push(p));
  for(const [k,v] of Object.entries(extra)){C.push(K(k));(Array.isArray(v)?v:[v]).forEach(t=>C.push(BL(t)));}
}
stage(1,'Which bag?','0–5 · 5 min','1–3','T–S → S–S','personalise; make the first decision; show the goal.',[
 'Slide 1–2 (1 min): show the Can-do and the four final-task steps. Say only: “At the end: My Travel Bag. Plan, check, decide, update.”',
 'Slide 3: model once — “I’m going to Lisbon. Three days. Small bag!”',
 'Students ask two partners the three questions on the slide (3 min). Then quick class check (1 min): “Who has a big bag? Why?”'],
 {'ICQs':['How many partners? (two)','What do you ask? (Where / How many days / Which bag)'],'Note':['suitcase / backpack are recognition words — don’t drill them.']});
stage(2,'What’s on the bed?','5–14 · 9 min','4–6','S–S → T–S','activate what learners know, then clarify the 14 items and 4 weather words.',[
 'Slide 4 (1 min): pairs name as many things as they can in 60 seconds (point and say, or use the numbers).',
 'Slides 5–6 (4 min): elicit item by item before showing the word. Drill only the problem words: clothes, sweater, trousers, swimsuit, sunscreen. Say the chunk with its article (a jacket, sunglasses) — no explanation.',
 'Slide 6 (2 min): weather icons → “It’s sunny.” / “It’s cold at night.”',
 'Pairs test each other (2 min): A points, B names.'],
 {'ICQs':['Write or speak? (speak)','How long? (60 seconds)'],'CCQs':['Point to shorts / trousers: Long or short? (short / long)','Sunglasses — for rain or for sun? (sun)']});
stage(3,'Always or it depends?','14–19 · 5 min','7','S–S','make the first sorting decision: essentials versus things that depend on the trip.',[
 'Give each pair the item cards (print p.1) or share slide 7 in edit mode online. Pairs sort the 14 items into ALWAYS and IT DEPENDS (3 min).',
 'Class check (2 min): “It depends… on what?” → the weather, the trip. Accept different answers; there is no single key.'],
 {'ICQ':['How many groups? (two)'],'Expected':['ALWAYS: usually a passport and a phone charger (shoes for some learners). IT DEPENDS: the rest. Reward reasons, not “correct” sorting.']});
stage(4,'Leo’s Call (listening)','19–31 · 12 min','8–11','S → S–S','listen for gist and for detail; hear a packing decision change after new information.',[
 'Pre-listening, slide 8 (3 min): “Leo is going to Madrid. This is his bag — his first idea. Good bag?” Pairs predict; 2–3 learners share. Don’t confirm.',
 'First listening, slide 9 (3 min): read the 4 questions first. Play A01 once. Pairs check.',
 'Second listening, slide 10 (4 min): play A01 again. Learners tick taking / not taking for 8 items. Pairs compare.',
 'Check, slide 11 (2 min): show answers. Ask “What changed? Why?” before pointing to the bottom line.'],
 {'ICQs':['How many activities do you tick? (two)','One box or two boxes for each thing? (one)'],'Answers':['L1: Madrid · four days · sunny in the day, cold at night · walk and swim.','L2: taking — trousers, jacket, shoes, swimsuit, sunscreen, sunglasses; not taking — shorts, umbrella.']});
stage(5,'Decision language','31–37 · 6 min','12–13','T–S → S–S','notice the target chunks in Leo’s own words and check their meaning.',[
 'Slide 12 (2 min): learners complete Leo’s four lines alone, then check in pairs. Optional: go back to slide 10 and replay A01.',
 'Slide 13 (2 min): check meaning with CCQs (below). “I’m going to Madrid” stays a fixed chunk; no metalanguage.',
 'Pairs (2 min): A points to a picture (slides 5–6 or a card), B decides: “I’m taking…” / “I’m not taking…”.'],
 {'Answers':['1 going · 2 not · 3 taking · 4 need'],'CCQs':['I’m taking a jacket → Is the jacket in the bag? (yes)','I’m not taking shorts → Are the shorts in the bag? (no) Did Leo decide? (yes)','I need good shoes → Are good shoes important for Leo? (yes) Why? (he’s going to walk a lot)','I’m going to Madrid → Is Leo in Madrid now? (no) Is it his plan? (yes)']});
stage(6,'Say it (pronunciation)','37–43 · 6 min','14–15','T–S → S–S','say the chunks with clear rhythm, stress and the /m/ in I’m.',[
 'Slide 14 — model (1 min): play A02, A03 and A04 twice each.',
 'Noticing (1 min): “Which parts are strong?” — the orange syllables. Clap or tap the rhythm once.',
 'Controlled practice (2 min): backchain “a jacket → need a jacket → I need a jacket”, chorally then individually. Contrast “I’m taking” with “I taking”.',
 'Transfer, slide 15 (2 min): A points to a tile, B decides fast and says it with the right stress (“I’m NOT taking an umbrella”). Swap after 6 turns.'],
 {'Monitor':['a strong NOT; the /m/ in I’m; “need a” linked']});
stage(7,'Change the weather','43–50 · 7 min','16','S–S','guided practice: change a decision when new information arrives, like Leo.',[
 'Set up with a demo pair (1 min). A (traveller) chooses 3 things. B (friend) takes a weather card (print p.5) and does not show it.',
 'Round 1 (3 min): pairs use the dialogue frame. A must change at least 2 things.',
 'Swap roles (3 min) with a new weather card.'],
 {'ICQs':['B, do you show your card? (no)','A, how many changes? (two)'],'Monitor':['Note 2 good examples and 3 errors on the feedback grid for stage 11.']});
stage(8,'One bag, ten things (signature task)','50–66 · 16 min','17–20','individual → pairs → pair-to-pair','make and justify decisions under a limit, agree as a pair, then decide again after new information.',[
 'Brief, slide 17: “You’re travelling together. One small bag. Ten things — the passport and charger count!” Give each pair a trip card (print p.3 / slide 18), item cards and the bag template (print p.2), or use slide 19 online.',
 '01 Think alone (2 min): each learner silently chooses 10 things.',
 '02 Compare and agree (5 min): partners tell each other their bags and agree on ONE bag. “I’m going to Bangkok. It’s rainy. I’m taking a raincoat.” — “Are you taking a hat?”',
 '03 New information (3 min): deal one card per pair (slide 20 / print p.4). The pair takes 1 thing out and puts 1 thing in (card 4: takes 2 out).',
 '04 Bag reveal (4 min): each pair tells another pair about its final bag and its change in 3–4 sentences. The listening pair asks one question.',
 'Content feedback (2 min): “Which pair is ready for rain? Who changed their bag? Why?” Then one language point to reuse in the final task.'],
 {'ICQs':['How many bags? (one)','How many things? (ten)','Is the passport in the ten? (yes)'],
  'Card 3 (religious site)':['Present it as a possible local rule: “Check the local dress rules.” Rules are different in different places. Don’t link it to any one country or religion.'],
  'Success':['A 10-item bag that fits the trip; every “it depends” item has a spoken reason; the bag is adjusted after the twist.']});
stage(9,'Travel Note: it depends','66–70 · 4 min','21','S–S','widen “it depends” (weather, places, plugs) before the personal final task.',[
 'Learners read the three notes (1 min). Help by pointing: forecast, dress rules, plugs.',
 'Pairs answer (3 min): “A visitor to your country: what do they need?” — “In Brazil, you need sunscreen.”'],
 {'Note':['Keep the message “check before you go”. Avoid generalisations; invite comparison with the learners’ own countries.']});
stage(10,'My Travel Bag (final production)','70–86 · 16 min','22–24','individual → rotating pairs','show the Can-do independently: PLAN → CHECK → DECIDE → UPDATE.',[
 'PLAN, slide 22 (3 min): each learner chooses a real trip, a dream trip or a trip card and completes the My Travel Bag card (print p.6).',
 'CHECK, round 1, slide 23 (5 min, about 2.5 min each way): the traveller talks about their bag; the checker asks at least 1 question and makes 1 suggestion with a reason. Then swap roles.',
 'DECIDE and UPDATE, slide 24 (1 min): the traveller accepts or declines (with a reason) and writes the change under CHANGES.',
 'CHECK, round 2 (5 min): new partner, same steps.',
 'DECIDE and UPDATE (1 min).',
 'ONE CHANGE (1 min): 2–3 learners tell the class one change and why.'],
 {'ICQs':['Checker — how many questions? (1 or more)','How many suggestions? (1)','Traveller — must you say yes? (no)'],
  'Minimum language':['Traveller: I’m going to X for N days. It’s [weather]. I’m taking… (5 or more). I’m not taking… (1 or more). A reply to each suggestion.','Checker: 1 question and 1 suggestion with a reason.'],
  'Teacher':['Monitor silently with the assessment grid (Appendix A). Don’t interrupt. If it turns into a monologue, prompt: “Checker — your question?”']});
stage(11,'Feedback, Can-do check, Toolkit','86–90 · 4 min','25–28','T–S','close the loop with delayed feedback and self-assessment.',[
 'Slide 25 (3 min): content first (“Who changed their bag? Why?”). Write 2 good examples under GREAT LANGUAGE and 3 errors under LET’S FIX; pairs self-correct.',
 'Slide 26 (under 1 min): learners tick the Can-do statements.',
 'Slides 27–28: point to the Travel Toolkit as the take-home reference (PDF).']);
// ---------- PROBLEMS ----------
C.push(H1('8. Anticipated problems and solutions'));
C.push(table(['Problem','Solution'],[
 ['“I taking a jacket” (drops the ’m)','Slide 14 “Say the M”; finger-count the words; reformulate in feedback.'],
 ['“I need umbrella” / “a sunglasses”','Labels always show the chunk (an umbrella, sunglasses). Reformulate; no grammar explanation.'],
 ['“I take a jacket” (present simple)','Reformulate to “I’m taking…”; the frame is on slide 13.'],
 ['“I’m going in / at Madrid”','Treat “I’m going to + place” as a fixed chunk; drill it once.'],
 ['“I need to take a jacket”','Correct English — accept it; it isn’t the target.'],
 ['Pronunciation: clothes, sweater, sunscreen','Drill in stage 2 only if needed; stress SUN-screen.'],
 ['Learners give no reasons','Ask “It depends… on what?”; in the final, the checker’s suggestion must have a reason.'],
 ['Stage 8: pairs agree too quickly','The 10-item limit forces choices; ask “Why?” about one item per pair.'],
 ['Final task turns into a presentation','The checker has a job card (slide 23). Stop it after 2.5 minutes: “Checker — your question?”'],
 ['Card 3 leads to generalisations about a country or religion','Reframe: “Rules are different in different places. Check before you go.”'],
 ['L1 during negotiation','Point to the SAY strip (slide 17). Allow a brief L1 moment, then: “Say it in English.”'],
 ['Online: the audio isn’t heard','Share computer sound; or send the MP3; the transcript is in section 10.'],
 ['Learners don’t know a destination’s climate','No general knowledge is needed: the forecast is on the card.']],[3700,5938]));
// ---------- ANSWER KEYS ----------
C.push(H1('9. Answer keys'));
C.push(table(['Slide','Task','Answer'],[
 ['7','Always / it depends','Open. Usually ALWAYS: a passport, a phone charger.'],
 ['9','Listening 1','Madrid · four days · day: sunny / night: cold · walk, swim'],
 ['10–11','Listening 2','Taking: trousers, jacket, shoes, swimsuit, sunscreen, sunglasses. Not taking: shorts, umbrella.'],
 ['12','Complete Leo’s lines','1 going · 2 not · 3 taking · 4 need'],
 ['15','Decide fast (model)','1 I’m taking a raincoat. 2 I’m not taking an umbrella. 3 I’m not taking shorts. 4 I’m not taking a sweater. 5 I’m taking sunglasses. 6 I’m taking a jacket. (Other decisions with a reason are fine.)']],[900,2600,6138]));
// ---------- TRANSCRIPT ----------
C.push(H1('10. Listening transcript — A01 Leo’s Call (0:58)'));
C.push(P('LEO — the traveller (male voice). SOFIA — his friend who lives in Madrid (female voice). The words match the audio exactly.',{color:MUTE}));
C.push(table(['#','Speaker','Line'],LS.SCRIPT.map(([s,t],i)=>[String(i+1),s,t]),[600,1300,7738]));
// ---------- FEEDBACK ----------
C.push(H1('11. Feedback plan'));
C.push(P('CELTA-style delayed feedback. Don’t interrupt fluency in stages 7, 8 and 10.'));
numbered(['**Content first:** “Which pair is ready for rain?” / “Who changed their bag? Why?”','**Successful language:** write 2 good examples you heard.','**Errors:** write 3 errors, anonymously, as they were said; pairs correct them.','**Reformulate:** say the correct chunk; learners repeat once.','Short content feedback also happens at the end of stage 8 (2 min).']).forEach(p=>C.push(p));
C.push(K('Error collection grid (copy to the board / slide 25)'));
C.push(table(['Great language (heard)','Let’s fix (said)','Correct form'],[['','',''],['','',''],['','','']],[3200,3200,3238]));
// ---------- DIFFERENTIATION ----------
C.push(H1('12. Differentiation'));
C.push(K('Stronger learners'));['Add a reason with because.','Checker: make two suggestions.','Stage 8: use We’re taking… when agreeing.','Final: 7–8 items and 2 “not taking” items.'].forEach(t=>C.push(BL(t)));
C.push(K('Learners needing support'));['Keep the frames on screen (slides 16, 22–24).','A 6-item bag in stage 8 (plus the essentials).','Allow pointing at a card plus the chunk (“I’m taking… [card]”).','Pair them with a patient partner for the first check round.'].forEach(t=>C.push(BL(t)));
// ---------- 1-TO-1 ----------
C.push(H1('13. 1-to-1 adaptation'));
C.push(P('The teacher is a genuine co-traveller, not a drill partner.'));
C.push(table(['Stage','1-to-1 version'],[
 ['1','Teacher and student both answer the questions: a real exchange about two trips.'],
 ['2–3','The student races the clock; the teacher challenges one sorting choice (“Passport — always? A trip in your country?”).'],
 ['4–6','Unchanged; the student does the pair checks with the teacher.'],
 ['7','The teacher plays B first, then A — as A, the teacher packs a bad first bag for the student to fix.'],
 ['8','The teacher is a co-traveller with a secret 10-item bag containing 2 strange choices (e.g. a swimsuit for Sapporo). The student must question them; then they agree on one bag. The student deals the twist card to the teacher.'],
 ['9','The student describes their own country for a visitor; the teacher compares.'],
 ['10','Round 1: the teacher checks in role as a friend who lives at the destination and gives one real local fact. Round 2: roles swap — the student checks the teacher’s prepared list (2 problems in it). Optional homework: a 45-second voice message describing the final bag.']],[1000,8638]));
// ---------- GROUP ----------
C.push(H1('14. Group adaptation'));
['**Pairs** by default; change pairs between stages 7, 8 and 10 so learners hear new voices.','**Odd numbers:** a triad. In stage 8, the third person must approve every change; in stage 10 there are two checkers, who must make different suggestions.','**Large groups (12+):** in stage 8, two pairs share a trip card, so the reveal compares decisions. In stage 10, use inner and outer circles; the outer circle moves one place for round 2.','**Maximise peer talk:** checker roles, bag reveals to another pair, and the “one change” round in front of the class.'].forEach(t=>C.push(BL(t)));
// ---------- ONLINE ----------
C.push(H1('15. Online adaptation'));
['Share the deck on screen with computer sound on (audio slides 9, 10 and 14).','Stages 3 and 8: use breakout rooms. Pairs work on a shared copy of slide 7 / slide 19 (edit mode) and drag the pictures, or type their items in the chat — no special technology needed.','Stage 7: B privately picks a card number; the teacher sends the weather card text in a private chat.','Stage 8: send the twist card text to each breakout room with the broadcast feature, or visit each room.','Stage 10: learners type their list in the chat or a shared document; check rounds happen in breakout rooms (2 rounds, reshuffle rooms in between).','1-to-1 online: as in section 13; the voice-message task works well in any messaging app.'].forEach(t=>C.push(BL(t)));
// ---------- EXT / RED ----------
C.push(H1('16. Optional extension and reduction'));
C.push(K('Extension (if time allows, or homework)'));['**Worst bag:** show a silly bag for a trip (e.g. Sapporo: swimsuit, sunglasses, shorts). Pairs fix it with You need… / You don’t need… (5 min).','**Second twist:** give each pair another new information card.','**Voice message:** learners record their final bag as a 45-second message to a friend at the destination.'].forEach(t=>C.push(BL(t)));
C.push(K('Reduction (if short of time)'));['Skip slide 15; do the transfer orally with 3 prompts.','Shorten stage 2 to 6 minutes (1-minute race and problem words only).','Set the Travel Note as reading homework.','Final: one check round instead of two. Keep CHECK → DECIDE → UPDATE — never cut the checker’s role.'].forEach(t=>C.push(BL(t)));
// ---------- APPENDIX ----------
C.push(new Paragraph({children:[new PageBreak()]}));
C.push(H1('Appendix A · My Travel Bag assessment grid'));
C.push(P('Tick during stage 10. A learner shows the Can-do when all traveller boxes are ticked.',{color:MUTE}));
C.push(table(['Learner','Where + how long','Weather','5+ taking / 1+ not','Answers question','Decides + updates','Checker: question','Checker: suggestion + reason'],
 Array.from({length:8},()=>['','','','','','','','']),[1600,1150,1000,1300,1150,1150,1100,1188],{size:16}));
C.push(H1('Appendix B · Lesson files'));
C.push(table(['Folder','File'],[
 ['PPTX','TTE_L01_Packing-for-a-Trip_Student-Deck_v1.0.pptx'],
 ['Audio','TTE_L01_A01_Leos-Call_v1.0.mp3 · A02 / A03 / A04 Say it clips · TTE_L01_Audio-Script_v1.0.pdf'],
 ['Teacher Lesson Plan','this plan (.docx and .pdf) · TTE_L01_Classroom-Materials_Print_v1.0.pdf'],
 ['Toolkit','TTE_L01_Travel-Toolkit_v1.0.pdf'],
 ['Images','Icons (SVG and PNG), Today lockup'],
 ['Source Files','build scripts, HTML sources, WAV master, timing marks, fonts']],[2400,7238]));

const doc=new Document({creator:'Today Travel English',title:'TTE L01 Teacher Lesson Plan',
 styles:{default:{document:{run:{font:'Hanken Grotesk',size:20,color:NAVY}}},
  paragraphStyles:[{id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Poppins',size:34,bold:true,color:NAVY},paragraph:{spacing:{before:360,after:140},outlineLevel:0}},
   {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:'Poppins',size:26,bold:true,color:NAVY},paragraph:{spacing:{before:260,after:100},outlineLevel:1}}]},
 numbering:{config:[{reference:'b',levels:[{level:0,format:LevelFormat.BULLET,text:'–',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:360,hanging:240}},run:{color:OR}}},{level:1,format:LevelFormat.BULLET,text:'·',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:720,hanging:240}}}}]},
  ...NUMREFS.map(r=>({reference:r,levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:400,hanging:300}},run:{color:OR,bold:true}}}]}))]},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},
  footers:{default:new Footer({children:[new Paragraph({children:[new TextRun({text:'TODAY TRAVEL ENGLISH · LESSON 01 · TEACHER LESSON PLAN · v1.0    ',font:'JetBrains Mono',size:14,color:MUTE}),new TextRun({children:[PageNumber.CURRENT],font:'JetBrains Mono',size:14,color:MUTE})]})]})},
  children:C}]});
Packer.toBuffer(doc).then(b=>{const f=path.join(LDIR,'Teacher Lesson Plan/TTE_L01_Teacher-Lesson-Plan_v1.0.docx');fs.writeFileSync(f,b);console.log('ok',f);});
