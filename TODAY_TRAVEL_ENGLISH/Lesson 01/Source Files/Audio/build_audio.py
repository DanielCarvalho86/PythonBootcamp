import sherpa_onnx, soundfile as sf, numpy as np, json
d='kokoro-en-v0_19/'
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=d+'model.onnx',voices=d+'voices.bin',tokens=d+'tokens.txt',data_dir=d+'espeak-ng-data'),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg)
V={'LEO':6,'SOFIA':7}; SPEED={'LEO':0.88,'SOFIA':0.88}
# each turn: list of sentence chunks (synthesised separately so model lines can be cut cleanly)
script=[
('SOFIA',["Hi, Leo! Are you ready for Madrid?"]),
('LEO',["Hi, Sofia!","I'm packing now.","I'm going to Madrid for four days."]),
('SOFIA',["Great! What are you taking?"]),
('LEO',["T-shirts, shorts and sunglasses.","It's hot, right?"]),
('SOFIA',["It's sunny in the day.","But this week it's cold at night."]),
('LEO',["Really?","OK.","I'm not taking shorts.","I'm taking trousers and a jacket."]),
('SOFIA',["Good idea.","And we're going to walk a lot."]),
('LEO',["OK, I need good shoes.","Do I need an umbrella?"]),
('SOFIA',["No, you don't.","It's not rainy this week."]),
('LEO',["Great.","I'm not taking an umbrella."]),
('SOFIA',["And on Sunday, we're going to swim.","There's a pool near my house."]),
('LEO',["A pool!","OK.","I'm taking a swimsuit."]),
('SOFIA',["And sunscreen!"]),
('LEO',["Yes.","I need sunscreen.","And my passport!","See you on Friday!"]),
]
SR=24000
def trim(x,th=0.004):
    idx=np.where(np.abs(x)>th)[0]
    if len(idx)==0: return x
    a=max(0,idx[0]-int(0.03*SR)); b=min(len(x),idx[-1]+int(0.06*SR))
    return x[a:b]
out=[np.zeros(int(0.5*SR))]; t=0.5; marks=[]
for ti,(spk,chunks) in enumerate(script):
    for ci,c in enumerate(chunks):
        a=tts.generate(c,sid=V[spk],speed=SPEED[spk]); assert a.sample_rate==SR
        x=trim(np.array(a.samples,dtype=np.float32))
        marks.append({'turn':ti+1,'speaker':spk,'text':c,'start':round(t,2),'end':round(t+len(x)/SR,2)})
        out.append(x); t+=len(x)/SR
        gap=0.22 if ci<len(chunks)-1 else 0.55
        out.append(np.zeros(int(gap*SR))); t+=gap
y=np.concatenate(out); y=y/np.max(np.abs(y))*0.89
sf.write('leos_call.wav',y,SR)
json.dump(marks,open('marks.json','w'),indent=1)
print('duration',len(y)/SR)
