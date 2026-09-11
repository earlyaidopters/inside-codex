// Local, bounded startup diagnostics. No telemetry, storage writes, stack dumps
// or lesson/workspace contents. URL queries/fragments are excluded from errors.
const clean=(value:string)=>value.replace(/https?:\/\/[^\s"'<>]+/g,raw=>{try{const u=new URL(raw);return u.origin+u.pathname;}catch{return '[URL]';}}).slice(0,500);
const field=(value:unknown,key:string):unknown=>{try{return value&&typeof value==='object'?(value as Record<string,unknown>)[key]:undefined;}catch{return undefined;}};
function describe(error:unknown){const name=field(error,'name'),message=field(error,'message');return {name:typeof name==='string'?clean(name).slice(0,80):'Error',message:clean(typeof message==='string'&&message?message:typeof error==='string'?error:'Startup failed without an error message.')};}
export class StartupTimeoutError extends Error{phase:string;constructor(phase:string){super(`Startup timed out during ${phase}`);this.name='StartupTimeoutError';this.phase=phase;}}
export function createStartupMonitor(){
 const started=performance.now();let phase='world-module',status:'starting'|'complete'|'failed'='starting';
 const events:{kind:string;phase:string;atMs:number;detail?:string}[]=[];
 let failure:{phase:string;atMs:number;name:string;message:string;causes:{name:string;message:string}[]}|null=null;
 const elapsed=()=>Math.round((performance.now()-started)*10)/10;
 function record(kind:string,detail?:string){events.push({kind,phase,atMs:elapsed(),...(detail?{detail:clean(detail)}:{})});if(events.length>40)events.shift();}
 function enter(next:string){phase=next;record('phase-start');}
 function fail(error:unknown){
  if(failure)return;status='failed';const causes=[],seen=new Set<unknown>([error]);let cause=field(error,'cause')??field(error,'innerError');
  while(cause!==undefined&&!seen.has(cause)&&causes.length<3){seen.add(cause);causes.push(describe(cause));cause=field(cause,'cause')??field(cause,'innerError');}
  failure={phase,atMs:elapsed(),...describe(error),causes};record('failed');
 }
 async function run<T>(next:string,operation:(signal:AbortSignal)=>Promise<T>,deadlineMs=15000):Promise<T>{
  enter(next);let timer:ReturnType<typeof setTimeout>|undefined;const controller=new AbortController();
  try{const value=await Promise.race([Promise.resolve().then(()=>operation(controller.signal)),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{const error=new StartupTimeoutError(next);reject(error);controller.abort(error);},deadlineMs);})]);record('phase-complete');return value;}
  catch(error){controller.abort(error);fail(error);throw error;}finally{clearTimeout(timer);}
 }
 return {enter,run,fail,note:(kind:string,detail?:string)=>record(kind,detail),finish:()=>{if(status!=='failed'){status='complete';record('complete');}},state:()=>({status,phase,elapsedMs:elapsed(),events:events.map(e=>({...e})),failure:failure?{...failure,causes:failure.causes.map(c=>({...c}))}:null})};
}
export type StartupMonitor=ReturnType<typeof createStartupMonitor>;
