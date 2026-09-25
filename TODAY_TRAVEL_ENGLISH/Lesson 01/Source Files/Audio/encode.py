import soundfile as sf, numpy as np, json, lameenc, sys, shutil
L=sys.argv[1]; y,sr=sf.read('leos_call.wav'); marks=json.load(open('marks.json'))
def mp3(x,path):
    e=lameenc.Encoder(); e.set_bit_rate(128); e.set_in_sample_rate(sr); e.set_channels(1); e.set_quality(2)
    pcm=(np.clip(x,-1,1)*32767).astype('<i2').tobytes(); open(path,'wb').write(e.encode(pcm)+e.flush())
mp3(y,f'{L}/Audio/TTE_L01_A01_Leos-Call_v1.0.mp3')
clips=[('A02','Say-It-1_I-need-sunscreen',"I need sunscreen."),('A03','Say-It-2_Im-taking-a-swimsuit',"I'm taking a swimsuit."),('A04','Say-It-3_Im-not-taking-shorts',"I'm not taking shorts.")]
out={}
for code,name,text in clips:
    m=[m for m in marks if m['text']==text][0]
    a=int((m['start']-0.06)*sr); b=int((m['end']+0.08)*sr)
    seg=np.concatenate([np.zeros(int(.3*sr)),y[a:b],np.zeros(int(.4*sr))])
    fn=f'TTE_L01_{code}_{name}_v1.0.mp3'; mp3(seg,f'{L}/Audio/{fn}'); out[code]=dict(file=fn,text=text,source_start=m['start'],source_end=m['end'],speaker=m['speaker'],turn=m['turn'])
    print(fn, round(len(seg)/sr,2))
json.dump(out,open('clips.json','w'),indent=1)
shutil.copy('leos_call.wav',f'{L}/Source Files/Audio/TTE_L01_A01_Leos-Call_MASTER_24kHz_v1.0.wav')
shutil.copy('marks.json',f'{L}/Source Files/Audio/TTE_L01_A01_Leos-Call_timing-marks_v1.0.json')
shutil.copy('build_audio.py',f'{L}/Source Files/Audio/build_audio.py')
