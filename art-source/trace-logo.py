"""Analyze the supplied logo silhouette into vector geometry; do not alter its image."""
from PIL import Image
from pathlib import Path
import math, json, hashlib, shutil
ROOT=Path(__file__).resolve().parent.parent
source=ROOT.parent/'astra-best-results/site/public/assets/codex.png'
dest=ROOT/'game/public/assets';dest.mkdir(parents=True,exist_ok=True)
shutil.copy2(source,dest/'codex-reference.png')
im=Image.open(source).convert('RGB');p=im.load();cx,cy=485,515
points=[]
for i in range(256):
 a=i*math.tau/256
 radii=[]
 for r in range(220,420):
  x,y=round(cx+math.cos(a)*r),round(cy+math.sin(a)*r)
  red,green,blue=p[x,y]
  if blue-red>30 and blue-green>15 and blue>145:radii.append(r)
 radius=max(radii) if radii else 300
 points.append([round(math.cos(a)*radius/290,6),round(-math.sin(a)*radius/290,6)])
(ROOT/'art-source/logo-contour.json').write_text(json.dumps({'source':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'centerPixels':[cx,cy],'pixelsPerMeter':290,'contour':points},indent=2))
print('Traced 256 source-derived contour landmarks; original image preserved.')
