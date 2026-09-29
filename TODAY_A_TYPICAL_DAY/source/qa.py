import re,zipfile,pymupdf,sys
from pptx import Presentation
from pptx.util import Emu
O=sys.argv[1]; P=f'{O}/01_Today_A_Typical_Day_Student.pptx'
prs=Presentation(P)
slides=[]; notes=[]
for s in prs.slides:
    slides.append('\n'.join(sh.text_frame.text for sh in s.shapes if sh.has_text_frame)); notes.append(s.notes_slide.notes_text_frame.text)
stu=[p.get_text() for p in pymupdf.open(f'{O}/02_Today_A_Typical_Day_Student.pdf')]
tea=[p.get_text() for p in pymupdf.open(f'{O}/03_Today_A_Typical_Day_Teacher_Lesson_Plan.pdf')]
src=[('deck',i+1,t) for i,t in enumerate(slides)]+[('studentPDF',i+1,t) for i,t in enumerate(stu)]+[('teacherPDF',i+1,t) for i,t in enumerate(tea)]
V='work|see|finish|start|have|live|watch|examine|check|arrive|get|go|take'
pats={'3rd person without -s':rf"\b(?<!does )(?<!doesn't )(?<!doesn’t )(?<!Does )(He|he|She|she|It|it) ({V})\b(?! -s)",
 'auxiliary + -s verb':rf"\b(does|Does|doesn't|doesn’t|Doesn't|Doesn’t) (?:(?:he|she|it) )?({V})(e?s)\b",
 'I/you + -s verb':rf"\b(I|You|you|We|we|They|they) (works|sees|finishes|starts|lives|watches)\b",
 'am + verb':r"\bI am (work|see|start)\b",'he/she don\'t':r"\b(he|she|He|She) (don't|don’t)\b",
 'placeholder':r"(?i)placeholder|image here|photo here|lorem|TODO|\[insert"}
print('=== Flagged forms (must all be deliberate error examples) ===')
for name,pat in pats.items():
    for kind,n,t in src:
        for line in t.split('\n'):
            for m in re.finditer(pat,line):
                print(f'{name:24}| {kind} p{n:02d} | {line.strip()[:90]}')
# timings in notes
exp=[('STAGE 1',4),('STAGE 2',5),('STAGE 3',7),('STAGE 4',7),('STAGE 5',5),('STAGE 6',7),('STAGE 7',3),('STAGE 8',10),('STAGE 9',5),('STAGE 10',2)]
allnotes='\n'.join(notes)
print('=== Timing in notes ===',[ (s,m, bool(re.search(rf"{s} · [^\n]*{m} min",allnotes))) for s,m in exp])
# margins
W,H=prs.slide_width/914400,prs.slide_height/914400;bad=[]
for i,s in enumerate(prs.slides,1):
    for sh in s.shapes:
        x,y,w,h=[v/914400 for v in (sh.left,sh.top,sh.width,sh.height)]
        if x<0.55 or y<0.4 or x+w>W-0.55 or y+h>H-0.25: bad.append((i,sh.shape_type,round(x,2),round(y,2),round(x+w,2),round(y+h,2)))
print('=== Shapes outside 0.55in safe margin ===',bad)
z=zipfile.ZipFile(P);xml=' '.join(z.read(n).decode('utf8','ignore') for n in z.namelist() if n.startswith('ppt/slides/slide'))
print('colours',sorted(set(re.findall(r'srgbClr val="([0-9A-F]{6})"',xml))))
print('fonts',sorted(set(re.findall(r'typeface="([^"]+)"',xml))))
for f in ['02_Today_A_Typical_Day_Student.pdf','03_Today_A_Typical_Day_Teacher_Lesson_Plan.pdf']:
    d=pymupdf.open(f'{O}/{f}');fs=set()
    for p in d:
        for x in p.get_fonts(): fs.add(x[3].split('+')[-1])
    print(f,len(d),'pages; fonts',sorted(fs))
print('slides',len(prs.slides),'| notes on all:',all(n.strip() for n in notes))
# vocabulary coverage in deck
vocab=['get up','have breakfast','go to work','start work','have lunch','take a break','finish work','go home','watch TV','go to bed','work at a hospital','work at a clinic','see patients','examine a patient','check a patient','have appointments','check medical records','work on weekends']
deck='\n'.join(slides).lower()
print('vocab missing from deck',[v for v in vocab if v.lower() not in deck], '| missing from student PDF',[v for v in vocab if v.lower() not in '\n'.join(stu).lower()])
