export type QualityAdvice={quality:'high'|'balanced';status:'observing'|'steady'|'recommend-balanced'|'limited';windows:number;lastWindow:{samples:number;medianMs:number;p95Ms:number}|null};
// Browser frame intervals describe playback, not its CPU/GPU cause. Two
// sustained windows prevent one download or scheduling stall driving advice.
export function createQualityAdvice(onChange:(value:QualityAdvice)=>void=()=>{}){
 let quality:QualityAdvice['quality']='high',status:QualityAdvice['status']='observing',key='',last:number|null=null,warmUntil=0;
 let samples:number[]=[],duration=0,windows=0,badWindows=0,goodWindows=0,lastWindow:QualityAdvice['lastWindow']=null;
 const state=():QualityAdvice=>({quality,status,windows,lastWindow:lastWindow?{...lastWindow}:null});
 const publish=(next:QualityAdvice['status'])=>{if(status!==next){status=next;onChange(state());}};
 function suspend(){last=null;samples=[];duration=0;badWindows=0;goodWindows=0;}
 function reset(next:QualityAdvice['quality'],identity:string){quality=next;key=identity;status='observing';windows=0;lastWindow=null;suspend();onChange(state());}
 function sample(now:number,eligible:boolean,next:QualityAdvice['quality'],identity:string){
  if(next!==quality||identity!==key)reset(next,identity);
  if(!eligible||!Number.isFinite(now)){suspend();return;}
  if(last===null){last=now;warmUntil=now+2000;return;}
  const delta=now-last;last=now;
  if(delta<=0||delta>1000){suspend();return;}
  if(now<warmUntil)return;
  samples.push(delta);duration+=delta;
  if(samples.length>4096)samples.shift();
  if(duration<6000||samples.length<30)return;
  const sorted=[...samples].sort((a,b)=>a-b);
  const medianMs=sorted[Math.floor(sorted.length/2)],p95Ms=sorted[Math.ceil(sorted.length*.95)-1];
  lastWindow={samples:samples.length,medianMs,p95Ms};windows++;samples=[];duration=0;
  const bad=quality==='high'?(medianMs>22||p95Ms>40):(medianMs>40||p95Ms>60);
  if(bad){badWindows++;goodWindows=0;}else{goodWindows++;badWindows=0;}
  // Keep issued advice for this quality/viewport session; changing the setting
  // starts a new assessment. It never changes the player's saved preference.
  if(badWindows>=2)publish(quality==='high'?'recommend-balanced':'limited');
  else if(goodWindows>=2&&status==='observing')publish('steady');
 }
 return {sample,suspend,state};
}
