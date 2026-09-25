import pymupdf
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
d=pymupdf.open('/root/.claude/uploads/3362cece-0854-54c9-ad0f-fb3165955fef/a0d9fc02-Today___Master_Brand_Guidelines.pdf')
p=d[15]
def path_of(dr):
    s=[];cur=None
    for it in dr['items']:
        if it[0]=='l':
            a,b=it[1],it[2]
            if cur is None or (abs(cur.x-a.x)>1e-3 or abs(cur.y-a.y)>1e-3): s.append(f'M{a.x:.3f} {a.y:.3f}')
            s.append(f'L{b.x:.3f} {b.y:.3f}'); cur=b
        elif it[0]=='c':
            a,c1,c2,b=it[1:5]
            if cur is None or (abs(cur.x-a.x)>1e-3 or abs(cur.y-a.y)>1e-3): s.append(f'M{a.x:.3f} {a.y:.3f}')
            s.append(f'C{c1.x:.3f} {c1.y:.3f} {c2.x:.3f} {c2.y:.3f} {b.x:.3f} {b.y:.3f}'); cur=b
        elif it[0]=='re':
            r=it[1]; s.append(f'M{r.x0} {r.y0}H{r.x1}V{r.y1}H{r.x0}Z'); cur=None
        elif it[0]=='qu':
            q=it[1]; s.append(f'M{q.ul.x} {q.ul.y}L{q.ur.x} {q.ur.y}L{q.lr.x} {q.lr.y}L{q.ll.x} {q.ll.y}Z'); cur=None
    return ' '.join(s)
drs=[x for x in p.get_drawings() if len(x['items'])==88]
ring=drs[0]; print(ring.get('even_odd'), ring['rect'])
ringd=path_of(ring)
# glyphs
f=TTFont('/root/.fonts/Poppins-Bold.ttf'); gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm
size=36.0; baseline=None
# baseline: span bbox y0=214.2 ; ascender based. compute via hhea ascent
asc=f['hhea'].ascent; base=214.2+asc/upm*size
def glyphs(text,x0):
    out=[];x=x0
    for ch in text:
        g=cmap[ord(ch)]; pen=SVGPathPen(gs)
        tp=TransformPen(pen,(size/upm,0,0,-size/upm,x,base)); gs[g].draw(tp); out.append(pen.getCommands()); x+=gs[g].width*size/upm
    return ' '.join(out),x
T,_=glyphs('T',162.1640625); day,xe=glyphs('day',207.1875)
x0,y0,x1,y1=158,212,282,268
fr='evenodd' if ring.get('even_odd') else 'nonzero'
def svg(txt,ringc):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {x1-x0} {y1-y0}" width="{(x1-x0)*10}" height="{(y1-y0)*10}"><path fill="{txt}" d="{T} {day}"/><path fill="{ringc}" fill-rule="{fr}" d="{ringd}"/></svg>'
open('today_lockup_paper-on-navy.svg','w').write(svg('#FAF7F2','#F44904'))
open('today_lockup_navy-on-paper.svg','w').write(svg('#0B1440','#F44904'))
print(base, xe)

# ---- smooth ring: fit circles to polygon vertices of each subpath
import numpy as np
subs=[];cur=[]
for it in ring['items']:
    if it[0]=='l':
        a,b=it[1],it[2]
        if cur and (abs(cur[-1][0]-a.x)>1e-3 or abs(cur[-1][1]-a.y)>1e-3): subs.append(cur);cur=[]
        if not cur: cur.append((a.x,a.y))
        cur.append((b.x,b.y))
subs.append(cur)
def fit(pts):
    P=np.array(pts);A=np.c_[2*P,np.ones(len(P))];b=(P**2).sum(1)
    cx,cy,c=np.linalg.lstsq(A,b,rcond=None)[0];return cx,cy,np.sqrt(c+cx*cx+cy*cy)
res=[]
for s in subs:
    P=np.array(s); cx,cy,r=fit(P); d=np.abs(np.hypot(P[:,0]-cx,P[:,1]-cy)-r)
    arc=P[d<0.05*r]; cx,cy,r=fit(arc)
    res.append((cx,cy,r,P[:,0].min(),P[:,1].min(),P[:,0].max(),P[:,1].max()))
    print('sub',len(s),round(cx,3),round(cy,3),round(r,3),P.min(0),P.max(0))
(o,i)=sorted(res,key=lambda t:-t[2])
ocx,ocy,oR=o[:3]; icx,icy,ir=i[:3]
# outer: circle with bottom-left square corner ; inner: circle with bottom-right square corner
outer=f'M{ocx-oR:.4f} {ocy:.4f} A{oR:.4f} {oR:.4f} 0 1 1 {ocx:.4f} {ocy+oR:.4f} L{ocx-oR:.4f} {ocy+oR:.4f} Z'
inner=f'M{icx+ir:.4f} {icy:.4f} A{ir:.4f} {ir:.4f} 0 1 0 {icx:.4f} {icy+ir:.4f} L{icx+ir:.4f} {icy+ir:.4f} Z'
ringd=outer+' '+inner; fr='evenodd'
x0,y0,x1,y1=161.5,217.5,280.5,262.5
open('today_lockup_paper-on-navy.svg','w').write(svg('#FAF7F2','#F44904'))
open('today_lockup_navy-on-paper.svg','w').write(svg('#0B1440','#F44904'))
open('today_symbol_navy.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{ocx-oR} {ocy-oR} {2*oR} {2*oR}" width="1000" height="1000"><path fill="#0B1440" fill-rule="evenodd" d="{ringd}"/></svg>')
open('today_symbol_orange.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{ocx-oR} {ocy-oR} {2*oR} {2*oR}" width="1000" height="1000"><path fill="#F44904" fill-rule="evenodd" d="{ringd}"/></svg>')
