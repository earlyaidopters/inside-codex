from pathlib import Path
import json,re,time
from faster_whisper import WhisperModel
root=Path(__file__).resolve().parents[3];manifest=json.loads((root/'art-source/audio/narration-manifest.json').read_text());out=root/'evidence/production/audio-v1/transcript-audit.json'
model=WhisperModel('base.en',device='cpu',compute_type='int8',cpu_threads=6,download_root=str(Path.home()/'.cache/inside-codex/whisper'))
def words(text):return re.findall(r"[a-z0-9]+",text.lower().replace('codex','code x').replace('c s v','csv').replace('agents dot em dee','agents md').replace('user interface','ui'))
def distance(a,b):
 prev=list(range(len(b)+1))
 for i,x in enumerate(a):
  row=[i+1]
  for j,y in enumerate(b):row.append(min(row[-1]+1,prev[j+1]+1,prev[j]+(x!=y)))
  prev=row
 return prev[-1]
rows=[];start=time.time()
for item in manifest['segments']:
 path=root/'game/public/assets/audio'/f"{item['id']}.mp3";segments,_=model.transcribe(str(path),beam_size=5,language='en',vad_filter=False);heard=' '.join(s.text.strip() for s in segments);expected=words(item['spoken']);actual=words(heard);edits=distance(expected,actual)
 rows.append({'id':item['id'],'expected':item['spoken'],'recognized':heard,'words':len(expected),'wordEdits':edits,'reviewRequired':edits>0});out.write_text(json.dumps({'model':'faster-whisper base.en, CPU int8','kind':'Independent automated transcription; pronunciation and listening review are separate','complete':False,'rows':rows},indent=2));print(json.dumps({'done':len(rows),'total':len(manifest['segments']),'edits':edits}),flush=True)
out.write_text(json.dumps({'model':'faster-whisper base.en, CPU int8','kind':'Independent automated transcription; pronunciation and listening review are separate','complete':True,'seconds':time.time()-start,'rows':rows,'totalEdits':sum(r['wordEdits'] for r in rows),'totalWords':sum(r['words'] for r in rows)},indent=2))
