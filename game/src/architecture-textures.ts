import type {Scene} from '@babylonjs/core/scene';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {AutoReleaseWorkerPool} from '@babylonjs/core/Misc/workerPool';
import type {BaseTexture} from '@babylonjs/core/Materials/Textures/baseTexture';
import {KhronosTextureContainer2} from '@babylonjs/core/Misc/khronosTextureContainer2';
import '@babylonjs/core/Materials/Textures/Loaders/ktxTextureLoader';

const groups=['floor','shell','furnishings'] as const;
function applyTextureSet(meshes:AbstractMesh[],lightmaps:Record<string,Texture>,replacements:Map<string,Texture>){
 const previous=new Set<BaseTexture>();
 for(const mesh of meshes){const material=mesh.material;if(!(material instanceof PBRMaterial))continue;const group=groups.find(g=>material.name.includes('__'+g));if(!group)continue;
  const next=replacements.get(`${group}-albedo`)!;next.coordinatesIndex=material.albedoTexture?.coordinatesIndex??0;
  if(material.albedoTexture&&material.albedoTexture!==next)previous.add(material.albedoTexture);material.albedoTexture=next;
  if(material.lightmapTexture&&material.lightmapTexture!==replacements.get(`${group}-indirect`))previous.add(material.lightmapTexture);material.lightmapTexture=replacements.get(`${group}-indirect`)!;
 }
 for(const group of groups){if(lightmaps[group]&&lightmaps[group]!==replacements.get(`${group}-indirect`))previous.add(lightmaps[group]);lightmaps[group]=replacements.get(`${group}-indirect`)!;}
 for(const texture of previous)texture.dispose();
}
// Original pixels are a complete alternative, fetched only if compression is
// unsupported or its batch fails. Geometry import never downloads these maps.
export async function installOriginalArchitectureTextures(scene:Scene,meshes:AbstractMesh[],lightmaps:Record<string,Texture>){
 const created:Texture[]=[],cancel=new Set<()=>void>();let stopped=false;
 const ids=groups.flatMap(group=>[`${group}-albedo`,`${group}-indirect`]);
 const timer=setTimeout(()=>{stopped=true;for(const stop of [...cancel])stop();},12000);
 try{
  const textures=await Promise.all(ids.map(id=>new Promise<Texture>((resolve,reject)=>{
   const albedo=id.endsWith('albedo'),url=albedo?`/assets/headquarters/streamed/${id}.jpg`:`/assets/headquarters/${id}.jpg`;
   const abort=()=>reject(Error('Original architecture texture deadline'));cancel.add(abort);
   const texture=new Texture(url,scene,{noMipmap:false,invertY:false,samplingMode:Texture.TRILINEAR_SAMPLINGMODE,useSRGBBuffer:albedo,onLoad:()=>{cancel.delete(abort);const size=texture.getSize();if(stopped||scene.isDisposed||size.width!==2048||size.height!==2048){reject(Error(`Original texture unavailable: ${id}`));return;}resolve(texture);},onError:()=>{cancel.delete(abort);reject(Error(`Original texture unavailable: ${id}`));}});
   texture.name=url;texture.gammaSpace=albedo;if(!albedo)texture.level=.65;created.push(texture);
  })));
  applyTextureSet(meshes,lightmaps,new Map(ids.map((id,i)=>[id,textures[i]])));
 }catch(error){stopped=true;for(const stop of [...cancel])stop();for(const texture of created)texture.dispose();throw error;}finally{clearTimeout(timer);}
}
// Pin every worker dependency to this release's own origin. No decoder CDN
// or background service is required by a distributed copy of the game.
function configureDecoder(){
 const root=new URL('/assets/decoders/ktx2-9.25.0/',location.href).href;
 KhronosTextureContainer2.URLConfig={jsDecoderModule:root+'decoder.js',wasmUASTCToASTC:root+'uastc_astc.wasm',wasmUASTCToBC7:root+'uastc_bc7.wasm',wasmUASTCToRGBA_UNORM:root+'uastc_rgba8_unorm_v2.wasm',wasmUASTCToRGBA_SRGB:root+'uastc_rgba8_srgb_v2.wasm',wasmUASTCToR8_UNORM:root+'uastc_r8_unorm.wasm',wasmUASTCToRG8_UNORM:root+'uastc_rg8_unorm.wasm',jsMSCTranscoder:root+'msc_basis_transcoder.js',wasmMSCTranscoder:root+'msc_basis_transcoder.wasm',wasmZSTDDecoder:root+'zstddec.wasm'};
 KhronosTextureContainer2.DefaultNumWorkers=2;
 // Defensive UASTC policy for cached prior assets; new maps use ETC1S.
 KhronosTextureContainer2.DefaultDecoderOptions.useRGBAIfASTCBC7NotAvailableWhenUASTC=true;
 return {root,urls:KhronosTextureContainer2.URLConfig};
}
export async function installArchitectureTextures(scene:Scene,meshes:AbstractMesh[],lightmaps:Record<string,Texture>){
 const caps=scene.getEngine().getCaps();
 // The pinned loader leaves uncompressed mip-chain dimensions at the final
 // 1x1 mip. Preserve the original full-resolution materials on these devices.
 if(!caps.etc2&&(caps.etc1||(!caps.bptc&&!caps.s3tc)))return {mode:'original',reason:'High-quality GPU texture compression unavailable',textures:[]};
 const {root,urls}=configureDecoder();performance.mark('codex.architecture.textures.start');
 const created:Texture[]=[],workers:Worker[]=[],cancel=new Set<()=>void>(),controller=new AbortController();let pool:AutoReleaseWorkerPool|undefined,abandoned=false;
 // Own this one startup batch's workers so failure cannot strand decoding or
 // upload into a texture after fallback. Both fetch and decode have a deadline.
 const deadline=setTimeout(()=>{abandoned=true;controller.abort();for(const stop of [...cancel])stop();pool?.dispose();for(const worker of workers)worker.terminate();},12000);
 const stop=(failed=false)=>{clearTimeout(deadline);if(failed){pool?.dispose();for(const worker of workers)worker.terminate();}};
 async function initialize(){
  const worker=new Worker(root+'worker.js');workers.push(worker);
  await new Promise<void>((resolve,reject)=>{
   const initTimer=setTimeout(()=>abort(),8000);
   const cleanup=()=>{clearTimeout(initTimer);cancel.delete(abort);worker.removeEventListener('message',message);worker.removeEventListener('error',error);};
   const abort=()=>{cleanup();worker.terminate();reject(Error('Architecture decoder deadline'));};
   const error=(event:ErrorEvent)=>{event.preventDefault();cleanup();worker.terminate();reject(Error('Architecture decoder unavailable'));};
   const message=(event:MessageEvent)=>{if(event.data?.action==='init'){cleanup();resolve();}};
   cancel.add(abort);worker.addEventListener('message',message);worker.addEventListener('error',error);worker.postMessage({action:'init',urls});
  });return worker;
 }
 async function load(id:string){
  const url=`/assets/headquarters/compressed/${id}.ktx2`,response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error(`${id}: HTTP ${response.status}`);const data=await response.arrayBuffer();
  if(abandoned||scene.isDisposed)throw Error('Architecture texture batch cancelled');
  return new Promise<Texture>((resolve,reject)=>{
   const abort=()=>reject(Error('Architecture texture deadline'));cancel.add(abort);
   const albedo=id.endsWith('albedo');const texture=new Texture('data:'+url,scene,{buffer:data,forcedExtension:'.ktx2',noMipmap:false,invertY:false,samplingMode:Texture.TRILINEAR_SAMPLINGMODE,useSRGBBuffer:albedo,onLoad:()=>{cancel.delete(abort);const size=texture.getSize();if(size.width!==2048||size.height!==2048){reject(Error(`Invalid decoded dimensions for ${id}`));return;}resolve(texture);},onError:(_message,error)=>{cancel.delete(abort);reject(error??Error(`Could not decode ${id}`));}});
   texture.name=url;texture.gammaSpace=albedo;if(!albedo)texture.level=.65;created.push(texture);
  });
 }
 const ids=groups.flatMap(group=>[`${group}-albedo`,`${group}-indirect`]);
 let results:PromiseSettledResult<Texture>[];
 try{
  const initialized=await Promise.all([initialize(),initialize()]);if(abandoned||scene.isDisposed)throw Error('Architecture decoder cancelled');
  // Keep the pool reusable for Babylon's context-restoration texture reloads.
  // Idle workers release after one second; new workers have their own deadline.
  const failedWorker=(error:unknown)=>{
   const target=new EventTarget();return Object.assign(target,{terminate(){},postMessage(message:{action:string}){if(message.action==='decode')queueMicrotask(()=>target.dispatchEvent(new MessageEvent('message',{data:{action:'decoded',success:false,msg:String(error)}})));}}) as unknown as Worker;
  };
  pool=new AutoReleaseWorkerPool(2,async()=>initialized.shift()??await initialize().catch(failedWorker),{idleTimeElapsedBeforeRelease:1000});KhronosTextureContainer2.WorkerPool=pool;
  scene.onDisposeObservable.addOnce(()=>pool?.dispose());
  results=await Promise.allSettled(ids.map(load));const rejected=results.find(r=>r.status==='rejected');
  if(rejected?.status==='rejected')throw rejected.reason;if(abandoned||scene.isDisposed)throw Error('Architecture texture batch cancelled');
 }catch(error){
  abandoned=true;controller.abort();for(const cancelPending of [...cancel])cancelPending();stop(true);for(const texture of created)texture.dispose();
  return {mode:'original',reason:String(error),textures:[]};
 }
 stop();
 const replacements=new Map(ids.map((id,i)=>[id,(results[i] as PromiseFulfilledResult<Texture>).value]));
 applyTextureSet(meshes,lightmaps,replacements);
 performance.mark('codex.architecture.textures.ready');performance.measure('codex.architecture.textures','codex.architecture.textures.start','codex.architecture.textures.ready');
 return {mode:'compressed',reason:null,textures:created.map(t=>({name:t.name,format:t.getInternalTexture()?.format,width:t.getSize().width,height:t.getSize().height}))};
}
