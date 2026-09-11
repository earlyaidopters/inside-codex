"""Compare geometry to source in memory, without modifying the reference image."""
from PIL import Image,ImageDraw
from pathlib import Path
import json,numpy as np,hashlib
ROOT=Path(__file__).resolve().parent.parent;OUT=ROOT/'evidence/production/mascot-v4';d=json.loads((OUT/'glyph-geometry.json').read_text());ref=np.array(Image.open(ROOT/'game/public/assets/codex-reference.png').convert('RGB'));report=[]
for name,(x0,y0,x1,y1) in [('chevron',(330,390,465,650)),('underscore',(490,550,700,655))]:
 source=np.all(ref[y0:y1,x0:x1]>np.array([200,210,220]),axis=2)
 for variant in ['baseline','candidate']:
  canvas=Image.new('1',(1024,1024));draw=ImageDraw.Draw(canvas)
  for mesh in d[variant]:
   if not mesh['name'].startswith(('White prompt','Rounded glyph','Chevron rounded')):continue
   for p in mesh['primitives']:
    verts=np.array(p['positions']).reshape((-1,3));indices=np.array(p['indices']).reshape((-1,3))
    for tri in indices:draw.polygon([(float(verts[i,0]*290+485),float(515-(verts[i,1]-2)*290)) for i in tri],fill=1)
  mask=np.array(canvas)[y0:y1,x0:x1];intersection=np.logical_and(mask,source).sum();union=np.logical_or(mask,source).sum();report.append({'part':name,'variant':variant,'sourcePixels':int(source.sum()),'projectedPixels':int(mask.sum()),'intersectionOverUnion':float(intersection/union)})
assert all(r['intersectionOverUnion']>.97 for r in report if r['variant']=='candidate')
(OUT/'glyph-fidelity.json').write_text(json.dumps({'pass':True,'scope':'Orthographic mesh silhouette reprojected into original source coordinates. Fixed white thresholds match the trace. Measures glyph placement/outline only, not shading or runtime appearance.','inputs':d['_sources'],'comparisons':report},indent=2))
def sig(mesh):
 tris=[]
 for p in mesh['primitives']:
  v=[tuple(round(x,5) for x in p['positions'][i:i+3]) for i in range(0,len(p['positions']),3)]
  tris += [tuple(sorted(v[j] for j in p['indices'][i:i+3])) for i in range(0,len(p['indices']),3)]
 return hashlib.sha256(repr(sorted(tris)).encode()).hexdigest(),len(tris)
rows=[];candidate={m['name']:m for m in d['candidate']}
for m in d['baseline']:
 if m['name'].startswith(('White prompt','Rounded glyph','Chevron rounded')):continue
 a,na=sig(m);b,nb=sig(candidate[m['name']]);rows.append({'mesh':m['name'],'sameTrianglePositionsAt10Micrometres':a==b,'trianglesBefore':na,'trianglesAfter':nb})
assert all(r['sameTrianglePositionsAt10Micrometres'] for r in rows)
(OUT/'nonglyph-retention.json').write_text(json.dumps({'pass':True,'scope':'Sorted triangle positions at 10-micrometre precision. Shape/topology check, not a normal or material equivalence claim.','inputs':d['_sources'],'meshes':rows},indent=2));print(json.dumps({'pass':True,'glyphOverlap':report,'retainedMeshes':len(rows)}))
