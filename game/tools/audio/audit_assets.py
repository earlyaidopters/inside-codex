from pathlib import Path
import soundfile as sf,numpy as np,json,hashlib
root=Path(__file__).resolve().parents[3];out=root/'evidence/production/audio-v1';rows=[]
for p in sorted((root/'game/public/assets/audio').rglob('*.mp3')):
 x,rate=sf.read(p,always_2d=True);assert np.isfinite(x).all();peak=float(np.max(np.abs(x)));assert 0<peak<1
 delta=float(np.max(np.abs(np.diff(x,axis=0))));seam=float(np.max(np.abs(x[0]-x[-1])));loop=p.stem=='headquarters-score' or p.stem.startswith('wing-')
 if loop:assert seam<delta,'Loop boundary exceeds its largest adjacent sample change'
 rows.append({'path':p.relative_to(root).as_posix(),'seconds':len(x)/rate,'peakDbfs':float(20*np.log10(peak)),'rmsDbfs':float(20*np.log10(np.sqrt(np.mean(x*x)))),'decodedSamples':len(x),'loop':loop,'seamDelta':seam,'maxAdjacentDelta':delta,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
manifest={'pass':True,'scope':'Every shipped MP3 decodes into finite, non-silent, unclipped PCM. Loop boundary jumps do not exceed ordinary adjacent sample changes. This is not a headphone listening or perceptual seamlessness claim.','files':rows,'totalBytes':sum((root/r['path']).stat().st_size for r in rows)};(out/'asset-audit.json').write_text(json.dumps(manifest,indent=2));print(json.dumps({'pass':True,'files':len(rows),'bytes':manifest['totalBytes'],'maxPeakDbfs':max(r['peakDbfs'] for r in rows)}))
