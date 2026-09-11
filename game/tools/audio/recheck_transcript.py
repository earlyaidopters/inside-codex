from pathlib import Path
import json
from faster_whisper import WhisperModel
root=Path(__file__).resolve().parents[3];stage=root/'evidence/production/audio-v1';old=json.loads((stage/'narration-manifest-initial.json').read_text());new=json.loads((root/'art-source/audio/narration-manifest.json').read_text());audit=json.loads((stage/'transcript-audit.json').read_text());oldByText={x['text']:x for x in old['segments']};rowsById={x['id']:x for x in audit['rows']};model=None;rows=[]
for x in new['segments']:
 previous=oldByText[x['text']];prior=rowsById[previous['id']]
 if previous['sha256']==x['sha256']:rows.append({**prior,'id':x['id'],'evidence':'Reused independent transcription of byte-identical MP3','audioSha256':x['sha256']});continue
 if model is None:model=WhisperModel('base.en',device='cpu',compute_type='int8',cpu_threads=6,download_root=str(Path.home()/'.cache/inside-codex/whisper'))
 heard,_=model.transcribe(str(root/'game/public/assets/audio'/f"{x['id']}.mp3"),beam_size=5,language='en');recognized=' '.join(s.text.strip() for s in heard);row={'id':x['id'],'expected':x['spoken'],'recognized':recognized,'evidence':'New independent transcription after pronunciation repair','audioSha256':x['sha256'],'reviewRequired':recognized.lower().rstrip('.').replace('nine','9')!=x['spoken'].lower().rstrip('.').replace('nine','9')};rows.append(row);print(json.dumps(row))
(stage/'transcript-audit-current.json').write_text(json.dumps({'complete':True,'scope':'Every current segment is linked to an independently transcribed MP3 with the same SHA-256. Flagged differences remain open listening/recognition questions.','rows':rows},indent=2))
