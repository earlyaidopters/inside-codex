"""Trace supplied glyph boundaries into mesh coordinates; source raster unchanged."""
from PIL import Image
from pathlib import Path
import json,hashlib,math
ROOT=Path(__file__).resolve().parent.parent;src=ROOT/'game/public/assets/codex-reference.png';im=Image.open(src).convert('RGB');parts=[]
def simplify(points,epsilon):
 if len(points)<3:return points
 a,b=points[0],points[-1];dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy
 def dist(p):
  t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
  return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
 ds=[dist(p) for p in points[1:-1]];v=max(ds);i=ds.index(v)+1
 return simplify(points[:i+1],epsilon)[:-1]+simplify(points[i:],epsilon) if v>epsilon else [a,b]
for name,roi in [('chevron',(330,390,465,650)),('underscore',(490,550,700,655))]:
 x0,y0,x1,y1=roi;mask={(x,y) for y in range(y0,y1) for x in range(x0,x1) if (lambda c:c[0]>200 and c[1]>210 and c[2]>220)(im.getpixel((x,y)))}
 assert all(x0<x<x1-1 and y0<y<y1-1 for x,y in mask),'ROI cuts glyph'
 edges={}
 for x,y in mask:
  for neighbor,a,b in [((x,y-1),(x,y),(x+1,y)),((x+1,y),(x+1,y),(x+1,y+1)),((x,y+1),(x+1,y+1),(x,y+1)),((x-1,y),(x,y+1),(x,y))]:
   if neighbor not in mask:assert a not in edges;edges[a]=b
 start=min(edges);loop=[start];p=edges[start]
 while p!=start:loop.append(p);p=edges[p]
 assert len(loop)==len(edges),'Multiple disconnected boundaries'
 smoothed=[tuple(sum(loop[(i+k)%len(loop)][axis] for k in range(-3,4))/7 for axis in [0,1]) for i in range(len(loop))]
 half=len(smoothed)//2;simple=simplify(smoothed[:half+1],.7)[:-1]+simplify(smoothed[half:]+[smoothed[0]],.7)[:-1]
 parts.append({'name':name,'roiPixels':roi,'pixelCount':len(mask),'boundaryPixels':len(loop),'boundary':simple,'verticesRuntime':[[round((x-485)/290,7),round(2-(y-515)/290,7)] for x,y in simple]})
out=ROOT/'art-source/glyph-contours.json';out.write_text(json.dumps({'source':str(src.relative_to(ROOT)),'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'method':'Connected white-pixel boundary, RGB thresholds [200,210,220], seven-boundary-sample smoothing followed by RDP 0.7 pixel; same 485,515 origin and 290 px/m as shell contour','parts':parts},indent=2));print([(p['name'],p['pixelCount'],len(p['boundary'])) for p in parts])
