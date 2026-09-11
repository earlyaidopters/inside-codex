import {batchSkinnedGuide} from './skinned-guide-batch';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import type {Geometry} from '@babylonjs/core/Meshes/geometry';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import type {Scene} from '@babylonjs/core/scene';

export type MascotDetail='high'|'balanced';
export const mascotFile=(detail:MascotDetail)=>detail==='balanced'?'codex-mascot-balanced.glb':'codex-mascot.glb';

// Change only the geometry on the live skinned meshes. The skeleton, animation
// groups, materials, shadow registration and guide transform keep their identity.
export function createMascotDetail(scene:Scene,imported:AbstractMesh[],initial:MascotDetail,onStatus:(message:string)=>void){
 const meshes=imported.filter((m):m is Mesh=>m instanceof Mesh&&!!m.geometry);
 const hands=meshes.filter(m=>/ finger | palm| thumb| wrist/.test(m.name));
 if(hands.length!==12)throw Error('Mascot hand geometry contract changed');
 const batches=batchSkinnedGuide(scene,imported);
 const cache=new Map<MascotDetail,Map<string,Geometry>>([[initial,new Map(hands.map(m=>[m.name,m.geometry!]))]]);
 const pending=new Map<MascotDetail,Promise<Map<string,Geometry>>>();
 let desired=initial,active=initial,disposed=false,revision=0,error='';
 const status=()=>onStatus(error||(pending.has(desired)?'Loading guide detail…':`Guide detail: ${active==='balanced'?'Balanced':'High'}.`));
 async function load(detail:MascotDetail){
  const cached=cache.get(detail);if(cached)return cached;
  const existing=pending.get(detail);if(existing)return existing;
  const job=(async()=>{
   const container=await SceneLoader.LoadAssetContainerAsync('/assets/',mascotFile(detail),scene);
   const copied=new Map<string,Geometry>();
   try{
    if(disposed||scene.isDisposed)throw Error('Scene closed');
    for(const m of hands){
     const source=container.meshes.find(x=>x.name===m.name);
     if(!(source instanceof Mesh)||!source.geometry)throw Error(`Missing detail mesh: ${m.name}`);
     copied.set(m.name,source.geometry.copy(`Guide ${detail}: ${m.name}`));
    }
    cache.set(detail,copied);return copied;
   }catch(e){for(const g of copied.values())g.dispose();throw e;}
   finally{container.dispose();}
  })();
  pending.set(detail,job);
  try{return await job;}finally{pending.delete(detail);}
 }
 function select(detail:MascotDetail){
  const ticket=++revision;desired=detail;error='';
  if(active===detail){status();return;}
  const apply=(geometries:Map<string,Geometry>)=>{
   if(disposed||scene.isDisposed||ticket!==revision)return;
   for(const m of hands)geometries.get(m.name)!.applyToMesh(m);
   batches.refresh();
   active=detail;status();
  };
  const cached=cache.get(detail);if(cached){apply(cached);return;}
  const job=load(detail);status();
  void job.then(apply).catch(()=>{
   if(disposed||scene.isDisposed||ticket!==revision)return;
   error=`Guide detail couldn’t load. ${active==='balanced'?'Balanced':'High'} detail is still active. Choose another quality, then try again.`;status();
  });
 }
 return {
  select,attachShadows:batches.attachShadows,isSettled:()=>active===desired&&!pending.has(desired)&&!error,
  state:()=>({batching:batches.state(),requested:desired,active,loading:pending.has(desired),error,triangles:meshes.reduce((n,m)=>n+m.getTotalIndices()/3,0),cached:[...cache.keys()],meshIds:meshes.map(m=>m.uniqueId),skeletonIds:[...new Set(meshes.map(m=>m.skeleton?.uniqueId))],pose:[...new Set(meshes.map(m=>m.skeleton).filter(Boolean))].flatMap(s=>s!.bones.map(b=>({name:b.name,matrix:Array.from(b.getFinalMatrix().m)}))),sceneMaterials:scene.materials.length,sceneTextures:scene.textures.length,sceneGeometries:scene.geometries.length,sceneSkeletons:scene.skeletons.length,sceneAnimationGroups:scene.animationGroups.length}),
  dispose:()=>{disposed=true;++revision;for(const geometries of cache.values())for(const g of geometries.values())if(!g.isDisposed())g.dispose();cache.clear();}
 };
}
