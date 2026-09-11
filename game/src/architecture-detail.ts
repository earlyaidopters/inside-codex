import {Mesh} from '@babylonjs/core/Meshes/mesh';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import type {Scene} from '@babylonjs/core/scene';
import type {MascotDetail} from './mascot-detail';

const asset='/assets/headquarters/streamed/architecture-balanced-ce31744b4b30.bin.gz';
const source='705665f178129075ce5d538132e92766f2d5e399357b41fcc4c0bffc5beb33b4';
type Row={material:string;vertices:number;originalIndices:number;offset:number;count:number};

// One live mesh set and one vertex stream. Only triangle indices change; shadow
// membership, materials, bounds, transforms and pickability keep their identity.
export function createArchitectureDetail(scene:Scene,imported:AbstractMesh[],onStatus:(message:string)=>void){
 const meshes=imported.filter((m):m is Mesh=>m instanceof Mesh&&m.getTotalIndices()>0);
 const originals=new Map(meshes.map(m=>[m,new Uint32Array(m.getIndices()!)]));
 let balanced:Map<Mesh,Uint32Array>|undefined,pending:Promise<Map<Mesh,Uint32Array>>|undefined;
 let active:MascotDetail='high',desired:MascotDetail='high',revision=0,error='',disposed=false;
 let controller=new AbortController();
 async function load(){
  controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  try{
   const response=await fetch(asset,{signal:controller.signal});if(!response.ok)throw Error('Room detail download failed');
   let bytes:Uint8Array<ArrayBuffer>=new Uint8Array(await response.arrayBuffer());
   if(bytes[0]===0x1f&&bytes[1]===0x8b){
    if(typeof DecompressionStream!=='undefined')bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    else{const {gunzip}=await import('fflate');bytes=await new Promise<Uint8Array<ArrayBuffer>>((resolve,reject)=>gunzip(bytes,(e,b)=>e?reject(e):resolve(new Uint8Array(b))));}
   }
   if(disposed||scene.isDisposed)throw Error('Scene closed');
   const view=new DataView(bytes.buffer);if(view.byteLength<8||view.getUint32(0,true)!==0x314c4349)throw Error('Invalid room detail header');
   const size=view.getUint32(4,true),start=8+Math.ceil(size/4)*4;
   if(size>20000||start>bytes.length||(bytes.length-start)%4)throw Error('Invalid room detail length');
   const header=JSON.parse(new TextDecoder().decode(bytes.subarray(8,8+size)));
   if(header.version!==1||header.sourceSha256!==source||header.rows?.length!==meshes.length)throw Error('Room detail version mismatch');
   const next=new Map<Mesh,Uint32Array>();let offset=0;
   for(const row of header.rows as Row[]){
    const mesh=meshes.find(m=>m.material?.name===row.material);
    if(!mesh||next.has(mesh)||mesh.getTotalVertices()!==row.vertices||originals.get(mesh)!.length!==row.originalIndices||row.offset!==offset||!Number.isSafeInteger(row.count)||row.count<=0||row.count%3||row.count>row.originalIndices||start+(offset+row.count)*4>bytes.length)throw Error('Room detail mesh mismatch');
    const indices=new Uint32Array(row.count);
    for(let i=0;i<row.count;i++){const index=view.getUint32(start+(offset+i)*4,true);if(index>=row.vertices)throw Error('Invalid room detail index');indices[i]=index;}
    next.set(mesh,indices);offset+=row.count;
   }
   if(start+offset*4!==bytes.length||new Set(meshes.map(m=>m.geometry)).size!==meshes.length)throw Error('Room detail geometry mismatch');
   balanced=next;return next;
  }finally{clearTimeout(timer);}
 }
 async function select(detail:MascotDetail){
  desired=detail;const ticket=++revision;error='';
  if(active===detail)return;
  try{
   const indices=detail==='high'?originals:balanced??await(pending??=load().finally(()=>{pending=undefined;}));
   if(disposed||scene.isDisposed||ticket!==revision)return;
   for(const mesh of meshes)mesh.setIndices(indices.get(mesh)!);
   active=detail;
  }catch{
   if(disposed||scene.isDisposed||ticket!==revision)return;
   error='Balanced room detail couldn’t load. The complete room is still available at High detail.';onStatus(error);
  }
 }
 scene.onDisposeObservable.addOnce(()=>{disposed=true;++revision;controller.abort();balanced?.clear();originals.clear();});
 return {select,isSettled:()=>active===desired&&!pending&&!error,state:()=>({requested:desired,active,loading:!!pending,error,triangles:meshes.reduce((n,m)=>n+m.getTotalIndices()/3,0),cached:!!balanced,meshIds:meshes.map(m=>m.uniqueId)})};
}
