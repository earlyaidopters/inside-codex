import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import type {Scene} from '@babylonjs/core/scene';
import type {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';

// The authored guide has one skeleton, identity mesh transforms and no mesh-
// targeted animation. Keep its source meshes for exact LOD swaps and bounds;
// concatenate compatible skin streams without changing joints or bind data.
export function batchSkinnedGuide(scene:Scene,imported:AbstractMesh[]){
 type Group={mesh:Mesh;sources:Mesh[];refs:Array<Mesh['geometry']>;refreshes:number};
 const grouped=new Map<string,Mesh[]>(),groups:Group[]=[],sourceSet=new Set<Mesh>();
 const supported=new Set(['position','normal','uv','uv2','color','matricesIndices','matricesWeights','matricesIndicesExtra','matricesWeightsExtra']);
 for(const source of imported){
  if(!(source instanceof Mesh)||!source.geometry||source.isUnIndexed||!source.getTotalIndices()||!source.isVerticesDataPresent('matricesIndices')||!source.isVerticesDataPresent('matricesWeights')||!source.skeleton||!source.computeBonesUsingShaders||source.actionManager||source.morphTargetManager||source.instances.length||source.hasThinInstances||source.getChildren().length||source.animations.length||source.isUsingPivotMatrix()||!source.material||source.subMeshes?.length!==1||!source.isEnabled()||!source.isVisible||source.visibility!==1)continue;
  if(source.material.needAlphaBlendingForMesh(source)||source.material.needAlphaTestingForMesh(source)||source.getVerticesDataKinds().some(k=>!supported.has(k))||scene.animationGroups.some(g=>g.targetedAnimations.some(a=>a.target===source)))continue;
  if(source.position.lengthSquared()!==0||source.scaling.x!==1||source.scaling.y!==1||source.scaling.z!==1||source.rotation.lengthSquared()!==0||source.rotationQuaternion&&(!source.rotationQuaternion.equalsToFloats(0,0,0,1)))continue;
  const key=JSON.stringify([source.parent?.uniqueId,source.skeleton.uniqueId,source.material.uniqueId,source.numBoneInfluencers,source.sideOrientation,source.layerMask,source.renderingGroupId,source.alphaIndex,source.hasVertexAlpha,source.receiveShadows,source.alwaysSelectAsActiveMesh,source.getVerticesDataKinds().filter(k=>k!=='uv').sort(),Array.from(source.getPoseMatrix().m)]);
  const list=grouped.get(key)??[];list.push(source);grouped.set(key,list);
 }
 function dataFor(sources:Mesh[]){
  const vertices=sources.reduce((n,m)=>n+m.getTotalVertices(),0);
  if(vertices>65535&&!scene.getEngine().getCaps().uintIndices)return null;
  const data=sources.map(m=>VertexData.ExtractFromMesh(m,true,true));
  // The untextured porcelain glyph has no UVs; zero is glTF's default UV.
  // Preserve every supplied UV and all skin/normal attributes verbatim.
  if(data.some(d=>d.uvs))for(const d of data)if(!d.uvs)d.uvs=new Float32Array(d.positions!.length/3*2);
  return data[0].merge(data.slice(1),vertices>65535,true);
 }
 for(const sources of grouped.values()){
  if(sources.length<2)continue;const data=dataFor(sources);if(!data)continue;
  const first=sources[0],mesh=new Mesh(`Guide batch: ${first.material!.name}`,scene);
  try{
   data.applyToMesh(mesh);mesh.parent=first.parent;mesh.skeleton=first.skeleton;mesh.numBoneInfluencers=first.numBoneInfluencers;mesh.computeBonesUsingShaders=first.computeBonesUsingShaders;mesh.updatePoseMatrix(first.getPoseMatrix().clone());
   mesh.material=first.material;mesh.sideOrientation=first.sideOrientation;mesh.layerMask=first.layerMask;mesh.renderingGroupId=first.renderingGroupId;mesh.alphaIndex=first.alphaIndex;mesh.hasVertexAlpha=first.hasVertexAlpha;mesh.receiveShadows=first.receiveShadows;mesh.alwaysSelectAsActiveMesh=first.alwaysSelectAsActiveMesh;mesh.isPickable=false;
   mesh.metadata={skinnedGuide:{sources:sources.map(m=>m.name)}};
   for(const source of sources){source.layerMask=0;sourceSet.add(source);}
   groups.push({mesh,sources,refs:sources.map(m=>m.geometry),refreshes:1});imported.push(mesh);
  }catch(error){mesh.dispose(false,false);throw error;}
 }
 function refresh(){
  const changed=groups.filter(g=>g.sources.some((m,i)=>m.geometry!==g.refs[i]));
  const pending=changed.map(g=>{const data=dataFor(g.sources);if(!data)throw Error('Guide batch index capability changed');return {g,data};});
  for(const {g,data} of pending){data.applyToMesh(g.mesh);g.refs=g.sources.map(m=>m.geometry);++g.refreshes;}
 }
 function attachShadows(shadow:ShadowGenerator){
  if(!groups.length)return;
  const map=shadow.getShadowMap()!;map.renderList=(map.renderList??[]).filter(m=>!sourceSet.has(m as Mesh));
  for(const {mesh} of groups)if(!map.renderList.includes(mesh))map.renderList.push(mesh);
  const sourcesByBatch=new Map(groups.map(g=>[g.mesh,g.sources]));
  const light=shadow.getLight(),original=light.setShadowProjectionMatrix;
  const projection:typeof original=function(matrix,view,list){
   const expanded=list.flatMap(m=>sourcesByBatch.get(m as Mesh)??[m]);
   for(const m of expanded)if(sourceSet.has(m as Mesh))m.computeWorldMatrix(true);
   return original.call(light,matrix,view,expanded);
  };
  light.setShadowProjectionMatrix=projection;
  // Unwrap before earlier projection owners run their disposal callbacks.
  scene.onDisposeObservable.add(()=>{if(light.setShadowProjectionMatrix===projection)light.setShadowProjectionMatrix=original;},-1,true,undefined,true);
 }
 return {refresh,attachShadows,state:()=>({drawsSavedPerPass:groups.reduce((n,g)=>n+g.sources.length-1,0),batches:groups.map(g=>({id:g.mesh.uniqueId,name:g.mesh.name,sources:g.sources.map(m=>m.name),triangles:g.mesh.getTotalIndices()/3,sourceTriangles:g.sources.reduce((n,m)=>n+m.getTotalIndices()/3,0),refreshes:g.refreshes})),sourceGeometryRetained:true,shadowProjectionUsesOriginalBounds:true})};
}
