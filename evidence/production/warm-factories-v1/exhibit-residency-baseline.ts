import type {Scene} from '@babylonjs/core/scene';
import type {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {Frustum} from '@babylonjs/core/Maths/math.frustum';
import {Vector3} from '@babylonjs/core/Maths/math.vector';

type Controller={setState:(...args:any[])=>void;state:()=>any;update?:(dt:number,reduced:boolean)=>void;setEnabled?:(value:boolean)=>void};
type Definition={id:string;station:number;modulePath:string;exportName:string;center:Vector3;load:()=>Promise<any>;make:(factory:any)=>Controller;enabled?:boolean};
type Owned={meshes:Scene['meshes'];nodes:Scene['transformNodes'];materials:Scene['materials'];textures:Scene['textures']};
type Entry={definition:Definition;enabled:boolean;wanted:boolean;lastWanted:number;pending?:Promise<void>;controller?:Controller;owned?:Owned;args?:any[];snapshot:any;generation:number;attempt:number;loads:number;unloads:number;error:string|null};
export type ExhibitStatus={message:string;retry:boolean;reload?:boolean};

// Each synchronous factory exclusively owns the resources it adds. Async module
// loading finishes before this scope starts, so unrelated scene loads cannot be
// accidentally included in the ownership set.
function inventory(scene:Scene):Owned{return {meshes:[...scene.meshes],nodes:[...scene.transformNodes],materials:[...scene.materials],textures:[...scene.textures]};}
function additions(scene:Scene,before:Owned):Owned{const after=inventory(scene);return Object.fromEntries(Object.entries(after).map(([key,items])=>[key,items.filter((x:any)=>!(before[key as keyof Owned] as any[]).includes(x))])) as Owned;}
function release(owned:Owned){
 for(const m of owned.meshes)if(!m.isDisposed())m.dispose(false,false);
 for(const n of owned.nodes)if(!n.isDisposed())n.dispose(false,false);
 for(const m of owned.materials)m.dispose(false,false);
 for(const t of owned.textures)t.dispose();
}

export function createExhibitResidency(scene:Scene,camera:ArcRotateCamera,onStatus:(s:ExhibitStatus)=>void){
 const entries:Entry[]=[];let active=-1,disposed=false,lastMessage='',lastRetry=false,holdStart:number|null=null,heldFrames=0;
 const events:{at:number;kind:string;id?:string;durationMs?:number}[]=[];
 const record=(kind:string,id?:string,durationMs?:number)=>{events.push({at:performance.now(),kind,id,durationMs});if(events.length>400)events.shift();};
 async function retryModule(e:Entry){
  let url:string;
  if(import.meta.env.DEV)url='/'+e.definition.modulePath;
  else{
   const response=await fetch('/exhibits-manifest.json',{cache:'no-cache'});if(!response.ok)throw Error('Exhibit manifest unavailable');
   const manifest=await response.json() as Record<string,{file:string}>;
   const runningScript=document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.src;
   if(!runningScript||!manifest['index.html']?.file||new URL(manifest['index.html'].file,location.origin+'/').href!==runningScript)throw Error('Exhibit release changed');
   const entry=manifest[e.definition.modulePath];if(!entry?.file)throw Error('Exhibit module missing from manifest');
   const target=new URL(entry.file,location.origin+'/');if(target.origin!==location.origin||!target.pathname.startsWith('/assets/')||!target.pathname.endsWith('.js'))throw Error('Invalid exhibit module location');url=target.href;
  }
  // A fresh module URL also recovers browsers that cache a failed module fetch.
  const target=new URL(url,location.origin);target.searchParams.set('exhibit-retry',String(e.attempt));
  return import(/* @vite-ignore */target.href);
 }
 function evict(e:Entry){
  if(e.controller){e.snapshot=e.controller.state();e.controller=undefined;release(e.owned!);e.owned=undefined;e.unloads++;record('release',e.definition.id);}
  e.generation++;
 }
 function begin(e:Entry){
  if(disposed||!e.enabled||!e.wanted||e.controller||e.pending||e.error)return;
  const generation=++e.generation,at=performance.now();record('load-start',e.definition.id);
  let timer:ReturnType<typeof setTimeout>;
  const module=e.attempt===0?e.definition.load():retryModule(e);
  const job=Promise.race([module,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('Exhibit preparation timed out')),15000);})]).then(namespace=>{
   if(disposed||generation!==e.generation||!e.wanted||!e.enabled){record('load-discard',e.definition.id);return;}
   const before=inventory(scene);
   try{
    const factory=namespace[e.definition.exportName];if(typeof factory!=='function')throw Error('Exhibit factory unavailable');
    const controller=e.definition.make(factory);e.owned=additions(scene,before);e.controller=controller;
    if(e.args)controller.setState(...e.args);controller.setEnabled?.(true);controller.update?.(0,true);
    e.snapshot=controller.state();e.loads++;record('load-ready',e.definition.id,performance.now()-at);
   }catch(error){e.controller=undefined;release(additions(scene,before));e.owned=undefined;throw error;}
  }).catch(error=>{if(!disposed&&generation===e.generation&&e.wanted&&e.enabled){e.error=String(error);record('load-failed',e.definition.id,performance.now()-at);}}).finally(()=>{clearTimeout(timer);if(e.pending===job)e.pending=undefined;});
  e.pending=job;
 }
 function register(definition:Definition){
  const e:Entry={definition,enabled:definition.enabled!==false,wanted:false,lastWanted:0,snapshot:{},generation:0,attempt:0,loads:0,unloads:0,error:null};entries.push(e);
  return {
   setState:(...args:any[])=>{e.args=args;e.controller?.setState(...args);},
   setEnabled:(value:boolean)=>{if(e.enabled===value)return;e.enabled=value;if(!value){e.wanted=false;evict(e);}else e.error=null;},
   update:(dt:number,reduced:boolean)=>e.controller?.update?.(dt,reduced),
   state:()=>e.controller?{...e.controller.state(),loaded:true}:{...e.snapshot,loaded:false,ports:[],cards:[],controls:[]},
  };
 }
 function refresh(){
  if(disposed)return;
  camera.getViewMatrix(true);camera.getProjectionMatrix(true);scene.updateTransformMatrix(true);
  const planes=Frustum.GetPlanes(scene.getTransformMatrix()),now=performance.now();
  for(const e of entries){
   // Radius five prepares the complete exhibit before its radius-three visual
   // bounds enter view. An explicit destination is always prepared as well.
   const wanted=e.enabled&&(e.definition.station===active||planes.every(p=>p.dotCoordinate(e.definition.center)>=-5));e.wanted=wanted;
   // The visibility margin already extends two metres beyond visual bounds.
   // A short grace absorbs small reversals without retaining a whole old wing
   // until the destination wing's detailed exhibits have also been allocated.
   if(wanted){e.lastWanted=now;begin(e);}else if(e.controller&&now-e.lastWanted>750)evict(e);
  }
  const required=entries.filter(e=>e.enabled&&e.wanted),failed=required.some(e=>e.error),pending=required.some(e=>!e.controller),reload=required.some(e=>e.error?.includes('Exhibit release changed'));
  const message=reload?'A tour update is available. Reload to continue; saved progress is kept.':failed?'This exhibit couldn’t load. Your lesson is still available.':pending?'Preparing the exhibit…':'';
  if(message!==lastMessage||failed!==lastRetry){lastMessage=message;lastRetry=failed;onStatus({message,retry:failed,reload});}
 }
 function ready(){return entries.every(e=>!e.enabled||!e.wanted||!!e.controller);}
 function canRender(){
  const value=ready();if(!value){heldFrames++;if(holdStart===null){holdStart=performance.now();record('view-held');}}
  else if(holdStart!==null){record('view-released',undefined,performance.now()-holdStart);holdStart=null;}
  return value;
 }
 async function initial(){refresh();await Promise.all(entries.map(e=>e.pending));refresh();}
 function dispose(){if(disposed)return;disposed=true;for(const e of entries){e.wanted=false;evict(e);}onStatus({message:'',retry:false});}
 // Also cancel pending factories when world initialization fails and its catch
 // disposes the scene before the normal world API has been returned.
 scene.onDisposeObservable.addOnce(dispose);
 return {register,refresh,initial,ready,canRender,focus:(index:number)=>{active=index;},retry:()=>{for(const e of entries)if(e.enabled&&e.wanted&&e.error){e.error=null;e.attempt++;begin(e);}refresh();},
  state:()=>({active,ready:ready(),heldFrames,holdingSince:holdStart,events:[...events],entries:entries.map(e=>({id:e.definition.id,station:e.definition.station,enabled:e.enabled,wanted:e.wanted,loaded:!!e.controller,pending:!!e.pending,loads:e.loads,unloads:e.unloads,error:e.error,resources:e.owned?{meshes:e.owned.meshes.length,materials:e.owned.materials.length,textures:e.owned.textures.length}:null}))}),
  dispose,
 };
}
