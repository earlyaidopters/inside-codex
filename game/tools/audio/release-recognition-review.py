from pathlib import Path
import json,hashlib,time
from faster_whisper import WhisperModel
root=Path(__file__).resolve().parents[3]
prior=json.loads((root/'evidence/production/audio-v1/transcript-audit-current.json').read_text())
manifest=json.loads((root/'art-source/audio/narration-manifest.json').read_text());by_id={x['id']:x for x in manifest['segments']}
out=root/'evidence/production/release-review-v1/audio-recognition-small.json'
model=WhisperModel('small.en',device='cpu',compute_type='int8',cpu_threads=2,download_root=str(Path.home()/'.cache/inside-codex/whisper'))
r={'complete':False,'model':'faster-whisper small.en, CPU int8, 2 threads, beam 5, no text prompt','scope':'Unconditioned second automated recognition of the thirteen previously flagged recordings. This is not headphone listening, human voice approval or independent human feedback. Prior evidence remains unchanged.','rows':[]};start=time.time()
for item in prior['rows']:
 if not item['reviewRequired']:continue
 p=root/'game/public/assets/audio'/f"{item['id']}.mp3"
 segments,_=model.transcribe(str(p),beam_size=5,language='en',vad_filter=False)
 heard=' '.join(s.text.strip() for s in segments)
 r['rows'].append({'id':item['id'],'expected':item['expected'],'baseRecognized':item['recognized'],'smallRecognized':heard,'audioSha256':hashlib.sha256(p.read_bytes()).hexdigest()})
 out.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'done':len(r['rows']),'total':13}),flush=True)
r['complete']=True;r['seconds']=time.time()-start
r['modelFiles']=[{'path':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in Path(model.model.model_path).glob('*') if p.is_file()] if hasattr(model.model,'model_path') else []
out.write_text(json.dumps(r,indent=2)+'\n')
