import {estimateTextureStorage} from './texture-storage.mjs';
import type {Scene} from '@babylonjs/core/scene';
import type {SceneInstrumentation} from '@babylonjs/core/Instrumentation/sceneInstrumentation';

// Opt-in read-only observations. No scene, camera or learning-state mutations.
export function createRenderAudit(scene:Scene,instrumentation:SceneInstrumentation){
 const engine=scene.getEngine();
 let drawStart=0,mainDraws=0,mainIndices=0,indexStart=0;
 let last={frameId:0,totalDrawCalls:0,mainDrawCalls:0,otherDrawCalls:0,mainSubmittedTriangles:0,allPassSubmittedTriangles:0,cpuSceneMs:0};
 scene.onBeforeDrawPhaseObservable.add(()=>{drawStart=instrumentation.drawCallsCounter.current;indexStart=scene.getActiveIndices();});
 scene.onAfterDrawPhaseObservable.add(()=>{mainDraws=instrumentation.drawCallsCounter.current-drawStart;mainIndices=scene.getActiveIndices()-indexStart;});
 scene.onAfterRenderObservable.add(()=>{const total=instrumentation.drawCallsCounter.current;last={frameId:scene.getFrameId(),totalDrawCalls:total,mainDrawCalls:mainDraws,otherDrawCalls:total-mainDraws,mainSubmittedTriangles:mainIndices/3,allPassSubmittedTriangles:scene.getActiveIndices()/3,cpuSceneMs:instrumentation.frameTimeCounter.current};});
 return ()=>{
  const active=scene.getActiveMeshes();
  const meshes=active.data.slice(0,active.length).filter(m=>m.getTotalIndices()>0).map(m=>({id:m.uniqueId,name:m.name,triangles:m.getTotalIndices()/3,submeshes:m.subMeshes?.length??0}));
  const textures=engine.getLoadedTexturesCache().map(t=>{
   const storage=estimateTextureStorage(t);
   const names=scene.textures.filter(x=>x.getInternalTexture()===t).map(x=>x.name);
   return {id:t.uniqueId,names,url:t.url?.startsWith('data:')?'embedded':t.url,width:t.width,height:t.height,depth:t.depth,format:t.format,type:t.type,source:t.source,mipmaps:t.generateMipMaps,cube:t.isCube,samples:Math.max(1,t.samples||1),ready:t.isReady,...storage};
  });
  return {lastFrame:last,activeMeshCount:meshes.length,activeMeshTriangles:meshes.reduce((n,m)=>n+m.triangles,0),meshes,textures,textureStorageBytes:textures.reduce((n,t)=>n+(t.textureBytes??0),0),multisampleColorStorageBytes:textures.reduce((n,t)=>n+(t.estimatedMultisampleColorBytes??0),0),unknownTextureFormats:textures.filter(t=>t.textureBytes===null).length,limits:['Active mesh triangles count each camera-active mesh once, including triangles outside its visible pixels; not exact occlusion visibility.','Main draw phase is Babylon rendering-manager submission; total also includes shadow and finishing passes.','Texture storage is an allocation estimate; driver padding, default framebuffer, implicit depth/stencil renderbuffers, CPU decoded images, geometry and program memory are excluded.','Scene time is CPU-side elapsed browser time, not native GPU time.']};
 };
}
