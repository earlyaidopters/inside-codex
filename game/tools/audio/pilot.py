from pathlib import Path
from kokoro_onnx import Kokoro
import soundfile as sf,json,hashlib,time
root=Path(__file__).resolve().parents[3];cache=Path.home()/'.cache/inside-codex/kokoro'
started=time.time();tts=Kokoro(str(cache/'kokoro-v1.0.onnx'),str(cache/'voices-v1.0.bin'))
text='Welcome inside. I’m Codex. Give me a model and I can reason. Give me the right working environment and we can actually get something done.'
audio,rate=tts.create(text,voice='af_heart',speed=.98,lang='en-us');dest=root/'art-source/audio/guide-pilot.wav';sf.write(dest,audio,rate)
r={'route':'kokoro-onnx 0.6.1, full precision Kokoro v1.0','voice':'af_heart','speed':.98,'text':text,'seconds':len(audio)/rate,'sampleRate':rate,'renderSeconds':time.time()-started,'path':str(dest),'modelSha256':hashlib.sha256((cache/'kokoro-v1.0.onnx').read_bytes()).hexdigest(),'voicesSha256':hashlib.sha256((cache/'voices-v1.0.bin').read_bytes()).hexdigest(),'listeningReview':False};(root/'evidence/production/audio-v1/voice-pilot.json').write_text(json.dumps(r,indent=2));print(json.dumps(r))
