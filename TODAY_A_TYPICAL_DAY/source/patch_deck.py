d=open('deck.js').read()
rep=[
("// timeline of Dr Lucas","// timeline of Dr Sarah (Stage 3)"),("D.LUCAS.day.forEach","D.SARAH.day.forEach"),
("""Slide 4 (about 2 min): times and pictures only. ELICIT: "What does he do at 7:00?" Accept any form; don't correct yet.
Expected: He gets up / He arrives at the clinic / He sees patients / He examines a patient / He has lunch / He sees patients / He checks medical records / He finishes work.""",
"""This is Dr. Sarah — our doctor for the whole lesson.
Slide 4 (about 2 min): times and pictures only. LOOK. GUESS. SAY IT. ELICIT: "What does she do at 7:00?" Accept any form; don't correct yet.
Expected: She gets up / She arrives at the clinic / She sees patients / She examines a patient / She has lunch / She sees patients / She checks medical records / She finishes work."""),
("title(s,'A Doctor’s Day');idCard(s,D.LUCAS,8.63,0.8,{sz:0.95});\ntx(s,'What does he do at 7:00?',","title(s,'A Doctor’s Day');idCard(s,D.SARAH,8.63,0.8,{sz:0.95});\ntx(s,'What does she do at 7:00?',"),
("""Reveal the phrases. Student reads the day as a story: "At 7:00 he gets up. At 8:00 he arrives at the clinic…"
Then ask the three questions.
ANSWERS: He sees patients. · No, he doesn't. He works at a clinic. · He finishes at 6:00.
If the student says "he see / he finish", don't correct yet — note it.""",
"""Reveal the phrases. The student retells Dr. Sarah's day as a story: "At 7:00 she gets up. At 8:00 she arrives at the clinic…"
Then ask the three questions.
ANSWERS: She sees patients. · No, she doesn't. She works at a clinic. · She finishes at 6:00.
If the student says "she see / she finish", don't correct yet — note it in the error log."""),
("title(s,'What does he do?');idCard(s,D.LUCAS,8.63,0.8,{sz:0.95});","title(s,'What does she do?');idCard(s,D.SARAH,8.63,0.8,{sz:0.95});"),
("[['What does he do at 8:30?'],['Does he work at a hospital?'],['What time does he finish?']]","[['What does she do at 8:30?'],['Does she work at a hospital?'],['What time does she finish?']]"),
("""\"This is Dr. Sarah. You don't know her day. I know. Ask me — find the six things."
Answer ONLY what the student asks. If the question is wrong ("Where she works?"), look puzzled and wait — let them self-correct. Reformulate only if they're stuck.
TEACHER ONLY — Dr. Sarah: works in a hospital · starts at 7:30 · sees 15 patients a day · doesn't work on Sundays · has lunch at 12:30 · finishes at 5:00.""",
"""\"You know Dr. Sarah's day at the clinic. There are six more things you don't know. I know. Ask me."
Answer ONLY the information requested. If the question is wrong ("How many patients she sees?"), don't answer: look puzzled, pause, elicit ("Again?") and let the student self-correct. Reformulate only if they're stuck.
TEACHER ONLY — do not show: sees 15 patients a day · doesn't work on Sundays · doesn't work at night · has appointments in the afternoon · watches TV after work · goes to bed at 11:00."""),
("tx(s,'You don’t know her day.',0.6,3.6,5,0.5,{fontFace:ED,fontSize:24});tx(s,'Ask me. Find six things.',0.6,4.1,5,0.5,{fontSize:22,color:INK});",
 "tx(s,'Six things you don’t know.',0.6,3.6,5,0.5,{fontFace:ED,fontSize:24});tx(s,'Ask me. Find them.',0.6,4.1,5,0.5,{fontSize:22,color:INK});"),
("""Use this slide if the student needs support forming the questions (auxiliary gap = does).
When all six facts are found: "Now tell me about Dr. Sarah." → She works in a hospital. She starts at 7:30… (third-person -s in use).""",
"""Use this slide if the student needs support forming the questions (the gap = does / Does).
When all six facts are found: "Now tell me about Dr. Sarah." → She sees 15 patients a day. She doesn't work on Sundays… (third-person -s in use)."""),
("tx(s,[{text:'She work',options:{}},{text:'s',options:{color:OR}},{text:' in…  She start',options:{}},{text:'s',options:{color:OR}},{text:' at…',options:{}}],",
 "tx(s,[{text:'She see',options:{}},{text:'s',options:{color:OR}},{text:'…  She doesn’t…  She go',options:{}},{text:'es',options:{color:OR}},{text:'…',options:{}}],"),
("const y=1.95+i*0.66;tx(s,[{text:a,options:{}},{text:'_____',options:{color:OR}},{text:b,options:{}}],0.6,y,8.5,0.55,{fontFace:ED,fontSize:25,valign:'middle'});",
 "const y=1.95+i*0.66;tx(s,[{text:a,options:{}},{text:'_____',options:{color:OR}},{text:b,options:{}}],0.6,y,8.55,0.55,{fontFace:ED,fontSize:23,valign:'middle'});"),
("USE: \"Tell me about a friend or a colleague.\" → She works… He lives… He watches…","USE: \"Tell me about a colleague.\" If needed: \"Where does he/she work? What does he/she do?\" → She works… He lives… He watches…"),
("{text:'Tell me about a friend or a colleague.',options:{}}","{text:'Tell me about a colleague.',options:{}}"),
("""ROUND 1 (about 3 min) · S→T: the student interviews you about Dr. Ben. You answer as his colleague, in the 3rd person.
TEACHER ONLY — Dr. Ben: works at a hospital · starts at 8:00 in the evening · works at night (Yes, he does) · sees about 20 patients a night · works on weekends (Yes, he does — he doesn't work on Mondays) · finishes at 6:00 in the morning.""",
"""Three rounds: SUPPORTED → PERSONALISED → INDEPENDENT.
ROUND 1 (about 3 min) · S→T · SUPPORTED: the student interviews you about Dr. Ben, Dr. Sarah's colleague. Answer in the 3rd person, only what is asked.
TEACHER ONLY — do not show: works at a hospital · starts at 8:00 in the evening · works at night · sees about 20 patients a night · works on weekends · doesn't work on Mondays · finishes at 6:00 in the morning.
If asked "Does he work at the clinic?" → "No, he doesn't. He works at a hospital." """),
("idCard(s,D.BEN,0.6,2.45,{sz:1.3});","idCard(s,D.BEN,0.6,2.45,{sz:1.3,label:'DR. SARAH’S COLLEAGUE'});"),
("tx(s,'I’m his colleague.',0.6,4.6,4.8,0.45,{fontSize:20,color:INK});","tx(s,'He works with Dr. Sarah.',0.6,4.6,4.8,0.45,{fontSize:20,color:INK});"),
("""Now you interview the student. The questions are on screen as a model of do-questions; the student answers with full sentences where natural.
Follow up genuinely ("Really? Why?"). Keep logging errors.""",
"""PERSONALISED. Now you interview the student about their real routine.
Do not ask all six questions mechanically. Choose 3–4 questions and use natural follow-up questions where appropriate.
Examples: "What time do you start work?" → "Every day?" → "What do you do first?" · "Do you work on weekends?" → "How often?" · "Where do you work?" → "Do you like working there?"
Aim: QUESTION → ANSWER → FOLLOW-UP. Keep follow-ups simple — no new grammar. Keep logging errors."""),
("""No prompts. "Tell me about your typical working day." Let the student speak for 2 minutes without help.""",
"""INDEPENDENT. No prompts. "Tell me about your typical working day." Extended freer speaking — about 2–3 minutes without help.
(Different from the exit task, which is a short 4–5 sentence final check.)"""),
("""BEFORE SHOWING: replace these example sentences with 3–5 REAL errors from your log (type over them; delete unused lines).
Show one at a time if possible. "Is it right? Can you fix it?" Student self-corrects; if stuck, point to the pattern box.""",
"""BEFORE SHOWING: replace the example sentences with 3–5 REAL errors produced by the student during the lesson whenever possible (type over them; delete unused lines). The examples are only a backup.
Use the student's own language. Show one error at a time. Ask: "Is it right?" "Can you fix it?" — guided self-correction; if stuck, point to the pattern box.
Don't explain the grammar again unless absolutely necessary. Never correct more than one target error in the same sentence."""),
(""""So, what does a typical day look like for you?" The student produces 4–5 sentences with no help.
Check against the exit checklist (lesson plan): simple present form · routine vocabulary · 3rd-person / questions if used · fewer of today's main slips.
Mention next lesson: How often…? (always / usually / sometimes / never). Don't teach it now.""",
""""So, what does a typical day look like for you?" A short final check: 4–5 sentences, no help. (Round 3 was the extended speaking; this measures the main aim.)
Check against the exit checklist (lesson plan, Appendix D): simple present form · routine vocabulary · 3rd-person / questions where used · fewer of today's logged slips.
Small preview only — How often…? (always · usually · sometimes · never). Do not teach this now."""),
("tx(s,'NEXT TIME · HOW OFTEN DO YOU…?',0.6,6.1,8,0.3,{fontFace:M,fontSize:11,color:MUTED,charSpacing:1.5});",
 "tx(s,'NEXT TIME · HOW OFTEN DO YOU…? · ALWAYS · USUALLY · SOMETIMES · NEVER',0.6,6.95,8.4,0.3,{fontFace:M,fontSize:9,color:INK,charSpacing:1.2});"),
]
for a,b in rep:
    assert a in d,a[:90]; d=d.replace(a,b)
open('deck.js','w').write(d); print('ok')
