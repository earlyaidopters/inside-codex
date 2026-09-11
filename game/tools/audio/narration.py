from pathlib import Path
from kokoro_onnx import Kokoro
import soundfile as sf,numpy as np,json,hashlib,time,re,subprocess,shutil
root=Path(__file__).resolve().parents[3];cache=Path.home()/'.cache/inside-codex/kokoro';masters=root/'art-source/audio/voice';out=root/'game/public/assets/audio/voice';masters.mkdir(exist_ok=True);out.mkdir(exist_ok=True)
priorPath=root/'art-source/audio/narration-manifest.json';prior=json.loads(priorPath.read_text()) if priorPath.exists() else {'segments':[]};byText={x['text']:x for x in prior['segments']}
source=json.loads((root/'art-source/audio/dialogue-source.json').read_text());tts=Kokoro(str(cache/'kokoro-v1.0.onnx'),str(cache/'voices-v1.0.bin'));catalog={};assets={};started=time.time()
for message in source['messages']:
 sentences=re.split(r'(?<=[.!?])\s+(?=[A-Z“‘])',message);catalog[message]=[]
 for text in sentences:
  spoken=text.replace('AGENTS.md','agents dot em dee').replace('CSV','C S V').replace('API','A P I').replace('UI','user interface').replace('09:00','nine in the morning')
  key=hashlib.sha256(('kokoro-v1.0-af_heart-0.94:'+text+':spoken:'+spoken).encode()).hexdigest()[:16];catalog[message].append({'text':text,'id':'voice/'+key})
  if key in assets:continue
  previous=byText.get(text)
  if previous and previous['spoken']==spoken:
   oldKey=previous['id'].split('/')[-1];oldFile=out/(oldKey+'.mp3');oldMaster=masters/(oldKey+'.wav')
   if oldFile.exists() and oldMaster.exists() and hashlib.sha256(oldFile.read_bytes()).hexdigest()==previous['sha256']:
    if oldKey!=key:shutil.copy2(oldFile,out/(key+'.mp3'));shutil.copy2(oldMaster,masters/(key+'.wav'))
    assets[key]={**previous,'id':'voice/'+key};continue
  samples,rate=tts.create(spoken,voice='af_heart',speed=.94,lang='en-us');peak=float(np.max(np.abs(samples)));assert peak>0 and np.isfinite(samples).all()
  raw=masters/(key+'.wav');sf.write(raw,samples,rate)
  dest=out/(key+'.mp3');subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(raw),'-af','loudnorm=I=-19:TP=-3:LRA=8','-ar','24000','-codec:a','libmp3lame','-b:a','96k',str(dest)],check=True)
  assets[key]={'id':'voice/'+key,'text':text,'spoken':spoken,'seconds':len(samples)/rate,'sampleRate':rate,'words':len(text.split()),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
 print(json.dumps({'renderedSegments':len(assets),'messages':len(catalog),'elapsed':round(time.time()-started,1)}),flush=True)
(root/'game/src/narration.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+'\n')
manifest={'generatorVersion':2,'engine':'kokoro-onnx 0.6.1','model':'Kokoro v1.0 full precision','voice':'af_heart','speed':.94,'sources':['https://huggingface.co/hexgrad/Kokoro-82M','https://github.com/thewh1teagle/kokoro-onnx'],'modelSha256':hashlib.sha256((cache/'kokoro-v1.0.onnx').read_bytes()).hexdigest(),'voicesSha256':hashlib.sha256((cache/'voices-v1.0.bin').read_bytes()).hexdigest(),'messages':len(catalog),'segments':list(assets.values()),'generationSeconds':time.time()-started,'listeningReview':False,'transcriptAudit':False}
(root/'art-source/audio/narration-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n');
for old in prior['segments']:
 oldKey=old['id'].split('/')[-1]
 if oldKey not in assets:(out/(oldKey+'.mp3')).unlink(missing_ok=True)
print(json.dumps({'complete':True,'segments':len(assets),'bytes':sum(x['bytes'] for x in assets.values())}))
