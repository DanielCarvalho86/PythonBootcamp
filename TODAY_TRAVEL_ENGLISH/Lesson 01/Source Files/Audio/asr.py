import sherpa_onnx, soundfile as sf, json, numpy as np, sys
w='sherpa-onnx-whisper-base.en/'
r=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=w+'base.en-encoder.int8.onnx',decoder=w+'base.en-decoder.int8.onnx',tokens=w+'base.en-tokens.txt',num_threads=4)
y,sr=sf.read(sys.argv[1]); marks=json.load(open('marks.json'))
# recognise per turn
turns={}
for m in marks: turns.setdefault(m['turn'],[]).append(m)
for k,ms in turns.items():
    seg=y[int(ms[0]['start']*sr):int(ms[-1]['end']*sr)]
    s=r.create_stream(); s.accept_waveform(sr,seg.astype(np.float32)); r.decode_stream(s)
    print(f"{ms[0]['speaker']:6}| REF: {' '.join(m['text'] for m in ms)}\n      | ASR: {s.result.text.strip()}")
