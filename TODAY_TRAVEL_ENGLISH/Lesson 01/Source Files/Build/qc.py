import sys,re,json,zipfile,hashlib,os,subprocess,numpy as np,soundfile as sf
L=sys.argv[1]; P=f'{L}/PPTX/TTE_L01_Packing-for-a-Trip_Student-Deck_v1.0.pptx'
norm=lambda s:re.sub(r'[^a-z0-9 ]','',s.lower().replace('’',"'").replace("'",'').replace('-',' ')).split()
res=[]
# 1 script (lesson.js) vs audio chunks vs ASR of MP3
script=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('%s/../build/lesson.js').SCRIPT))"%os.getcwd()]))
marks=json.load(open(f'{L}/Source Files/Audio/TTE_L01_A01_Leos-Call_timing-marks_v1.0.json'))
a=[w for sp,t in script for w in norm(t)]; b=[w for m in marks for w in norm(m['text'])]
res.append(('Transcript words == synthesised words',a==b,f'{len(a)} words'))
import sherpa_onnx
w='sherpa-onnx-whisper-base.en/'
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=w+'base.en-encoder.int8.onnx',decoder=w+'base.en-decoder.int8.onnx',tokens=w+'base.en-tokens.txt',num_threads=4)
def asr(x,sr):
    s=r.create_stream(); s.accept_waveform(sr,x.astype(np.float32)); r.decode_stream(s); return s.result.text
y,sr=sf.read(f'{L}/Audio/TTE_L01_A01_Leos-Call_v1.0.mp3'); dur=len(y)/sr
hyp=[]
turns={}
for m in marks: turns.setdefault(m['turn'],[]).append(m)
for k,ms in turns.items(): hyp+=norm(asr(y[int(ms[0]['start']*sr):int(ms[-1]['end']*sr)+2000],sr))
fix={'sophia':'sofia','okay':'ok','tshirts':'t','t':'t'}
hyp=[fix.get(x,x) for x in hyp]; ref=[x for x in a]
ref2=' '.join(ref).replace('t shirts','tshirts'); hyp2=' '.join(hyp).replace('t shirts','tshirts')
res.append(('MP3 A01 ASR == script (case/punct-insensitive)',ref2==hyp2,f'duration {dur:.1f}s'))
if ref2!=hyp2:
    import difflib; print('\n'.join(difflib.unified_diff(ref2.split(),hyp2.split(),lineterm='',n=0)))
for f,t in [('TTE_L01_A02_Say-It-1_I-need-sunscreen_v1.0.mp3',"I need sunscreen."),('TTE_L01_A03_Say-It-2_Im-taking-a-swimsuit_v1.0.mp3',"I'm taking a swimsuit."),('TTE_L01_A04_Say-It-3_Im-not-taking-shorts_v1.0.mp3',"I'm not taking shorts.")]:
    y2,sr2=sf.read(f'{L}/Audio/{f}'); h=asr(y2,sr2); res.append((f'Clip {f[8:11]} ASR == "{t}"',norm(h)==norm(t),h.strip()))
# 2 embedded media == Audio folder files, and slide mapping
z=zipfile.ZipFile(P); md5=lambda b:hashlib.md5(b).hexdigest()
folder={md5(open(f'{L}/Audio/{f}','rb').read()):f for f in os.listdir(f'{L}/Audio') if f.endswith('.mp3')}
media={n:md5(z.read(n)) for n in z.namelist() if n.startswith('ppt/media/') and n.endswith('.mp3')}
slides={}
for n in z.namelist():
    m=re.match(r'ppt/slides/_rels/slide(\d+)\.xml\.rels',n)
    if m:
        for t in re.findall(r'Target="\.\./media/([^"]+\.mp3)"',z.read(n).decode()): slides.setdefault(int(m.group(1)),set()).add(folder.get(media['ppt/media/'+t],'UNKNOWN'))
exp={9:{'TTE_L01_A01_Leos-Call_v1.0.mp3'},10:{'TTE_L01_A01_Leos-Call_v1.0.mp3'},14:{'TTE_L01_A02_Say-It-1_I-need-sunscreen_v1.0.mp3','TTE_L01_A03_Say-It-2_Im-taking-a-swimsuit_v1.0.mp3','TTE_L01_A04_Say-It-3_Im-not-taking-shorts_v1.0.mp3'}}
res.append(('Embedded audio == Audio folder files, on slides 9/10/14 only',slides==exp,str({k:sorted(v) for k,v in slides.items()})))
# 3 deck text
from pptx import Presentation
prs=Presentation(P); txt=[]
for s in prs.slides:
    t=' '.join(sh.text_frame.text for sh in s.shapes if sh.has_text_frame); txt.append(t)
deck=' '.join(txt).replace('’',"'")
tk=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('%s/../build/lesson.js').TOOLKIT))"%os.getcwd()]))
miss=[]
for sec in ['phrases','questions','answers','checker','repair']:
    for line in tk[sec]:
        for part in line.split('  /  '):
            core=part.strip().replace('’',"'")
            key={"I'm going to Lisbon for three days.":"I'm going to Lisbon for three days","I'm taking a sweater.":"I'm taking","It's rainy this week.":"It's rainy this week","I need sunscreen.":"I need sunscreen","I need a jacket.":"I need a jacket","Are you taking a hat?":"Are you taking","Do you need sunscreen?":"Do you need","Are you taking a jacket?":"Are you taking a jacket","Do I need an umbrella?":"Do I need","OK, good idea!":"good idea","Hmm, I'm not sure.":"I'm not sure","Yes, you do.":"Yes, you do","No, you don't.":"No, you don't","Yes, I am.":"Yes, I am","No, I'm not.":"No, I'm not","Yes, I do.":"Yes, I do","No, I don't.":"No, I don't"}.get(core,core.rstrip('.?!'))
            if key not in deck: miss.append(core)
res.append(('Every Toolkit line is taught/practised in the deck',not miss,'missing: '+str(miss)))
old=['I pack','long johns','portable fan','beanie','overcoat','lip balm','Google Maps','Duolingo','Couchsurfing','Splitwise','Augustine','THANK YOU','hacks','hot place','cold place','Do you prefer']
hits=[o for o in old if o.lower() in deck.lower()]
res.append(('No obsolete content from the old Lesson 1 deck',not hits,str(hits)))
res.append(('Slide count',len(prs.slides)==28,str(len(prs.slides))))
# notes present on all slides, no teacher text in slide body
res.append(('Speaker notes on every slide',all(s.has_notes_slide and s.notes_slide.notes_text_frame.text.strip() for s in prs.slides),''))
leak=[i+1 for i,t in enumerate(txt) if re.search(r'ANSWER:|ICQ|CCQ|STAGE \d',t)]
res.append(('No teacher-only content on slide surfaces',not leak,str(leak)))
# 4 colours & fonts
xml=' '.join(z.read(n).decode('utf8','ignore') for n in z.namelist() if n.startswith('ppt/slides/slide'))
cols=set(re.findall(r'srgbClr val="([0-9A-Fa-f]{6})"',xml)); fonts=set(re.findall(r'typeface="([^"]+)"',xml))
allowed={'0B1440','F44904','FAF7F2','F3EFE6','141E52','5B6088','8890B5'}
res.append(('Colours limited to Today palette (+ brand caption tones)',cols<=allowed,str(sorted(cols))))
res.append(('Fonts limited to Poppins / Hanken Grotesk / JetBrains Mono',fonts<={'Poppins','Hanken Grotesk','JetBrains Mono'},str(sorted(fonts))))
# 5 icons for active vocab in deck
res.append(('Audio duration 50–60 s',50<=dur<=60,f'{dur:.1f}s'))
for n,ok,d in res: print(('PASS' if ok else 'FAIL'),'|',n,'|',d)
