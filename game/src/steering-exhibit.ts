import {batchStaticParts} from './static-parts';
import {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {Color3} from '@babylonjs/core/Maths/math.color';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {ActionManager} from '@babylonjs/core/Actions/actionManager';
import {ExecuteCodeAction} from '@babylonjs/core/Actions/directActions';
import {freshSteering,steeringPass} from './steering-lab.mjs';
export function buildSteeringExhibit(scene:Scene,anchor:Vector3,onAction:(id:string)=>void){
 const root=new TransformNode('Steering switching station',scene);root.position=anchor.clone();
 const metal=new PBRMaterial('Steering satin rails',scene);metal.albedoColor=Color3.FromHexString('#aeb1b0');metal.metallic=.8;metal.roughness=.3;
 const graphite=new PBRMaterial('Steering graphite chassis',scene);graphite.albedoColor=Color3.FromHexString('#343e39');graphite.roughness=.4;
 const purple=new PBRMaterial('Steering current run',scene);purple.albedoColor=Color3.FromHexString('#8170b2');purple.metallic=.28;purple.roughness=.28;
 const ivory=new PBRMaterial('Steering queued message',scene);ivory.albedoColor=Color3.FromHexString('#e8e6d8');ivory.roughness=.3;
 function box(n:string,x:number,y:number,z:number,w:number,h:number,d:number,m:PBRMaterial){const b=MeshBuilder.CreateBox(n,{width:w,height:h,depth:d},scene);b.parent=root;b.position.set(x,y,z);b.material=m;b.isPickable=false;return b;}
 box('Routing table',0,1.57,0,2.65,.15,.7,metal);box('Routing backplate',0,2.30,-.13,2.45,1.28,.1,graphite);
 for(const y of [1.92,2.12])box('Current work rail '+y,0,y,.04,2.13,.035,.09,metal);
 const carrier=box('Active work carriage',-.74,2.05,.13,.3,.42,.19,purple);
 const messages=Array.from({length:6},(_,i)=>box('Queued message cartridge '+i,-.92+i*.37,2.6,.04,.24,.34,.12,ivory));
 function plate(id:string,x:number,y:number,w:number,h:number,tw:number,th:number){const texture=new DynamicTexture('Steering '+id,{width:tw,height:th},scene,true);const material=new StandardMaterial('Steering ink '+id,scene);material.diffuseTexture=texture;material.emissiveColor=Color3.White();material.disableLighting=true;material.backFaceCulling=false;const face=MeshBuilder.CreatePlane('Steering '+id,{width:w,height:h},scene);face.parent=root;face.position.set(x,y,.22);face.material=material;return {id,texture,face};}
 const ports=[['send-steer','STEER'],['advance','NEXT'],['send-queue','QUEUE']].map(([id,label],i)=>{const x=(i-1)*.86;box('Selector stem '+id,x,2.94,0,.035,.3,.035,metal);const p=plate(id,x,3.14,.8,.35,512,224);p.face.actionManager=new ActionManager(scene);p.face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onAction(id)));return {...p,label};});
 const status=plate('work status',0,1.77,2.12,.22,1024,136);status.face.isPickable=false;
 const stages=plate('work stages',0,2.32,2.12,.18,1024,88);stages.face.isPickable=false;const sc=stages.texture.getContext() as CanvasRenderingContext2D;sc.fillStyle='#343e39';sc.fillRect(0,0,1024,88);sc.fillStyle='#eeeadd';sc.textAlign='center';sc.font='bold 45px sans-serif';sc.fillText('READ',154,59);sc.fillText('WRITE',512,59);sc.fillText('CHECK',870,59);stages.texture.update();
 const waiting=plate('queue heading',0,2.855,2.12,.13,1024,63);waiting.face.isPickable=false;const qc=waiting.texture.getContext() as CanvasRenderingContext2D;qc.fillStyle='#343e39';qc.fillRect(0,0,1024,63);qc.fillStyle='#c7b9de';qc.textAlign='center';qc.font='bold 39px sans-serif';qc.fillText('WAITING FOR THE NEXT RUN',512,45);waiting.texture.update();
 const completeMaterial=new PBRMaterial('Steering verified artifact',scene);completeMaterial.albedoColor=Color3.FromHexString('#91b989');completeMaterial.roughness=.32;
 batchStaticParts(root,root.getChildMeshes().filter(m=>/^(Routing table$|Current work rail |Selector stem )/.test(m.name)),'Steering rails');
 let s:any=freshSteering(),signature='',targetX=-.74;
 function setState(next:any){s=next;const key=JSON.stringify([s.active,s.pending,s.queue,s.language,s.messageKind,s.checklist,s.draft,s.statusAsked,s.steered]);if(signature===key)return;signature=key;targetX=s.active?.kind==='checklist'?[-.74,0,.74][s.active.step]:s.active?(s.active.kind==='status'?-.74:s.active.step===0?0:.74):s.checklist?.checked?.74:-.74;
  messages.forEach((m,i)=>{m.isVisible=i<s.queue.length;});carrier.isVisible=!!s.active||!!s.checklist;carrier.material=steeringPass(s)?completeMaterial:s.language==='fr'?purple:ivory;
  for(const p of ports){const c=p.texture.getContext() as CanvasRenderingContext2D;c.fillStyle=p.id==='advance'?'#51436a':'#e8e5dd';c.fillRect(0,0,512,224);c.fillStyle=p.id==='advance'?'#f5f2e8':'#3d3c42';c.textAlign='center';c.font='bold 65px sans-serif';c.fillText(p.label,256,96);c.font='29px sans-serif';c.fillText(p.id==='advance'?'ONE WORK STEP':s.messageKind==='french'?'FRENCH CORRECTION':s.messageKind==='email'?'WELCOME DRAFT':'STATUS QUESTION',256,168);p.texture.update();}
  const c=status.texture.getContext() as CanvasRenderingContext2D;c.fillStyle=steeringPass(s)?'#294a34':'#40374d';c.fillRect(0,0,1024,136);c.fillStyle='#f4f0e4';c.textAlign='center';c.font='bold 43px sans-serif';c.fillText(steeringPass(s)?'CHECKED → QUEUED → UNSENT':`${s.active?'RUN '+s.active.run:'BETWEEN RUNS'}  ·  ${s.language.toUpperCase()}  ·  ${s.queue.length} QUEUED`,512,86);status.texture.update();
 }
 setState(s);
 return {setState,update:(dt:number,reduced:boolean)=>{carrier.position.x=reduced?targetX:carrier.position.x+(targetX-carrier.position.x)*Math.min(1,dt*6);},state:()=>({verified:steeringPass(s),queueCount:s.queue.length,activeRun:s.active?.run??null,carriageX:carrier.position.x,carriageTargetX:targetX,ports:ports.map(p=>{const e=scene.getEngine(),v=scene.activeCamera!.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight());v.y=e.getRenderHeight()-v.y-v.height;const q=Vector3.Project(p.face.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),v);return {id:p.id,screen:{x:q.x*e.getRenderingCanvas()!.clientWidth/e.getRenderWidth(),y:q.y*e.getRenderingCanvas()!.clientHeight/e.getRenderHeight()}};})})};
}
