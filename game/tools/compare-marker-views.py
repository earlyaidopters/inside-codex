from pathlib import Path
import json
from PIL import Image, ImageChops, ImageStat, ImageDraw
root=Path('../evidence/production/traversal-v1/marker-views')
a=json.loads((root/'baseline.json').read_text());b=json.loads((root/'candidate.json').read_text());rows=[]
for x,y in zip(a['rows'],b['rows']):
 assert (x['quality'],x['name'],x['camera'],x['mascot'],x['renderSize'])==(y['quality'],y['name'],y['camera'],y['mascot'],y['renderSize'])
 def other(r):return sorted((m['name'],m['triangles'],m['submeshes']) for m in r['audit']['meshes'] if not m['name'].startswith('Learning state '))
 assert other(x)==other(y),'Non-marker active geometry changed'
 ma=[m for m in x['audit']['meshes'] if m['name'].startswith('Learning state ')];mb=[m for m in y['audit']['meshes'] if m['name'].startswith('Learning state ')]
 assert len(ma)==len(mb);assert all(m['triangles']==18818 for m in ma);assert all(m['triangles']==1536 for m in mb)
 ia=Image.open(root/x['filename']).convert('RGB');ib=Image.open(root/y['filename']).convert('RGB');d=ImageChops.difference(ia,ib);st=ImageStat.Stat(d);gray=d.convert('L');hist=gray.histogram();count=ia.width*ia.height
 row={'quality':x['quality'],'view':x['name'],'meanAbsoluteChannelDifference':sum(st.mean)/3,'pixelsWithLumaDifferenceAbove8':sum(hist[9:]),'percentAbove8':sum(hist[9:])*100/count,'activeMarkers':len(ma),'trianglesSaved':len(ma)*(18818-1536),'sameCameraPoseAndNonmarkerGeometry':True};rows.append(row)
 # A difference image helps locate even tiny affected silhouettes; amplified x8.
 d.point(lambda v:min(255,v*8)).save(root/f'diff-{x["quality"]}-{x["name"]}.png')
report={'pass':all(r['percentAbove8']<.1 and r['meanAbsoluteChannelDifference']<.1 for r in rows),'scope':'Ten matched still views, two quality profiles. Numeric thresholds flag raster changes; assistant inspection is separately required. Not all-camera equivalence.','rows':rows}
(root/'comparison.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
assert report['pass'],'Raster review threshold exceeded'
