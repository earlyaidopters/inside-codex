from pathlib import Path
from PIL import Image,ImageChops,ImageStat
import json,math,os
p=Path(os.environ.get('EVIDENCE_DIR','../evidence/production/static-shadow-v1/views'));rows=[]
baseline=json.loads((p/'baseline.json').read_text())['rows'];candidate=json.loads((p/'candidate.json').read_text())['rows']
for before,after in zip(baseline,candidate):
 q,name=before['quality'],before['name'];assert (q,name)==(after['quality'],after['name'])
 a=Image.open(p/before['filename']).convert('RGB');b=Image.open(p/after['filename']).convert('RGB');d=ImageChops.difference(a,b);s=ImageStat.Stat(d)
 x,y=before['audit'],after['audit'];assert x['activeMeshTriangles']==y['activeMeshTriangles'];assert x['lastFrame']['mainDrawCalls']==y['lastFrame']['mainDrawCalls'];assert x['lastFrame']['allPassSubmittedTriangles']==y['lastFrame']['allPassSubmittedTriangles'];assert x['lastFrame']['totalDrawCalls']-y['lastFrame']['totalDrawCalls']==28
 rows.append({'quality':q,'name':name,'mean':sum(s.mean)/3,'rms':math.sqrt(sum(v*v for v in s.rms)/3),'max':max(v[1] for v in s.extrema),'identical':d.getbbox() is None,'beforeDraws':x['lastFrame']['totalDrawCalls'],'afterDraws':y['lastFrame']['totalDrawCalls'],'activeTriangles':y['activeMeshTriangles'],'allPassTriangles':y['lastFrame']['allPassSubmittedTriangles']})
 composite=Image.new('RGB',(a.width*3,a.height));composite.paste(a,(0,0));composite.paste(b,(a.width,0));composite.paste(d.point(lambda x:min(255,x*16)),(a.width*2,0));composite.thumbnail((1800,1000));composite.save(p/f'review-{q}-{name}.png')
(p/'comparison.json').write_text(json.dumps({'pass':True,'rows':rows},indent=2));print(json.dumps(rows))
