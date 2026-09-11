"""Original deterministic score/ambience/cues. No third-party recordings."""
from pathlib import Path
import numpy as np
import wave,subprocess,json,hashlib
ROOT=Path(__file__).resolve().parents[3];OUT=ROOT/'game/public/assets/audio';MASTER=ROOT/'art-source/audio';SR=32000
rng=np.random.default_rng(20260910)
def hz(m):return 440*2**((m-69)/12)
def instrument(m,duration=5):
 t=np.arange(int(SR*duration))/SR; f=hz(m)
 # Soft felt strike with a subdued inharmonic upper partial and natural decay.
 x=sum(a*np.sin(2*np.pi*f*k*t)*np.exp(-t/(2.8/k)) for k,a in [(1,1),(2,.29),(3,.075),(4.006,.025)])
 return x*(1-np.exp(-t/.012))*np.minimum(1,(duration-t)/.15)
def add(buf,x,at,amp=1,pan=0,wrap=False):
 idx=np.arange(len(x))+int(at*SR);stereo=x[:,None]*np.array([np.sqrt((1-pan)/2),np.sqrt((1+pan)/2)])*amp
 if wrap:np.add.at(buf,idx%len(buf),stereo)
 else:
  n=max(0,min(len(x),len(buf)-int(at*SR)));buf[int(at*SR):int(at*SR)+n]+=stereo[:n]
def reverb(x,wrap=False):
 out=x.copy()
 for delay,amp in [(0.061,.17),(.113,.13),(.229,.1),(.397,.075),(.613,.05),(.997,.027)]:
  n=int(delay*SR)
  if wrap:out+=np.roll(x,n,axis=0)[:,::-1]*amp
  else:out[n:]+=x[:-n,::-1]*amp
 return out
rows=[]
def save(name,x,loop=False):
 x-=x.mean(axis=0);x*=.24/max(.001,np.max(np.abs(x)))
 # Loop content is authored cyclically; preserve waveform continuity across wrap.
 if not loop:
  fade=min(int(.025*SR),len(x)//2);x[:fade]*=np.linspace(0,1,fade)[:,None];x[-fade:]*=np.linspace(1,0,fade)[:,None]
 pcm=np.round(np.clip(x,-1,1)*32767).astype('<i2');wav=MASTER/(name+'.wav')
 with wave.open(str(wav),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
 dest=OUT/(name+'.mp3');subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','128k','-ar',str(SR),str(dest)],check=True)
 rows.append({'id':name,'seconds':len(x)/SR,'loop':loop,'sampleRate':SR,'peakDbfs':float(20*np.log10(np.max(np.abs(x)))),'rmsDbfs':float(20*np.log10(np.sqrt(np.mean(x*x)))),'seamDelta':float(np.max(np.abs(x[0]-x[-1]))),'maxAdjacentDelta':float(np.max(np.abs(np.diff(x,axis=0)))),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
# Sixteen bars at 80 BPM: Em9 / Cmaj9 / Gmaj9 / Dadd9, with sparse motif variations.
length=48;x=np.zeros((length*SR,2));chords=[[40,55,59,66],[36,55,59,62],[43,54,59,62],[38,54,57,64]]
for bar in range(16):
 chord=chords[(bar//2)%4];start=bar*3
 if bar%2==0:
  for j,m in enumerate(chord):add(x,instrument(m,9),start+j*.045,.16 if j else .25,(j-1.5)*.3,True)
 if bar%2==1:
  for j,m in enumerate([chord[2]+12,chord[3]+12,chord[1]+12]):add(x,instrument(m,6),start+[.0,1.125,2.25][j],.105,[-.35,.3,.05][j],True)
save('headquarters-score',reverb(x,True),True)
# Quiet room air, one distinct texture per wing, cyclic filtered noise and distant tones.
for wing in range(3):
 seconds=12;n=seconds*SR;freq=np.fft.rfftfreq(n,1/SR);phase=rng.uniform(0,2*np.pi,len(freq));spectrum=np.exp(-(freq/(1100+wing*350))**2)/(1+(freq/70)**1.4);spectrum[freq<75]=0
 air=np.fft.irfft(spectrum*np.exp(1j*phase),n);air/=max(abs(air));t=np.arange(n)/SR
 left=air*.16;right=np.roll(air,1733+wing*617)*.16
 for m,a in [(40+wing*7,.007),(59+wing*7,.003)]:
  f=round(hz(m)*seconds)/seconds;tone=np.sin(2*np.pi*f*t)*(.7+.3*np.sin(2*np.pi*t/seconds));left+=tone*a;right+=tone*a*.8
 save(f'wing-{wing}',np.stack([left,right],axis=1),True)
for name,notes,seconds in [('success',[(64,0),(71,.12),(78,.3)],2.8),('reconsider',[(66,0),(62,.18)],2.2),('travel',[(52,0),(59,.15),(66,.3)],1.8),('select',[(76,0)],.25)]:
 x=np.zeros((int(seconds*SR),2))
 for m,at in notes:add(x,instrument(m,seconds-at),at,.16,0)
 save(name,reverb(x))
manifest={'version':1,'authoring':'Original deterministic additive instruments, filtered noise, cyclic composition and local delay network. No external samples.','license':'Project-authored audio; no third-party recording dependency.','assets':rows}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');(MASTER/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({'assets':len(rows),'deliveryBytes':sum(r['bytes'] for r in rows),'rows':rows},indent=2))
