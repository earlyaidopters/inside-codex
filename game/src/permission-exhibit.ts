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
import {freshPermissions,permissionReadAllowed,permissionsPass} from './permission-lab.mjs';
export function buildPermissionExhibit(scene:Scene,anchor:Vector3,onAction:(id:string)=>void){
 const root=new TransformNode('Permission desk control gates',scene);root.position=anchor.clone();
 const metal=new PBRMaterial('Permission brushed nickel',scene);metal.albedoColor=Color3.FromHexString('#a9a9b1');metal.metallic=.82;metal.roughness=.3;
 const paper=new PBRMaterial('Permission ivory ceramic',scene);paper.albedoColor=Color3.FromHexString('#ebe6dc');paper.roughness=.36;
 const graphite=new PBRMaterial('Permission housing graphite',scene);graphite.albedoColor=Color3.FromHexString('#37373e');graphite.roughness=.35;
 function box(name:string,x:number,y:number,z:number,w:number,h:number,d:number,mat:PBRMaterial){const b=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);b.parent=root;b.position.set(x,y,z);b.material=mat;b.isPickable=false;return b;}
 box('Gates base',0,1.57,0,2.5,.13,.52,metal);
 const gates=['read','draft','check'].map((id,i)=>{
  const x=(i-1)*.83;
  box('Gate back '+id,x,2.24,-.14,.72,1.22,.11,graphite);
  for(const dx of [-.35,.35])box('Gate jamb '+id,x+dx,2.24,.025,.065,1.27,.16,metal);
  for(const y of [1.62,2.87])box('Gate lintel '+id,x,y,.025,.76,.065,.16,metal);
  const card=box('Retained evidence '+id,x,2.22,-.05,.5,.71,.03,paper);
  for(let n=0;n<4;n++)box('Evidence ink '+id+n,x,2.43-n*.14,-.03,n===0?.35:.28,.023,.01,graphite);
  const door=box('Permission shutter '+id,x,2.24,.105,.62,1.16,.06,paper);
  const lamp=new PBRMaterial('Gate indicator '+id,scene);lamp.albedoColor=Color3.FromHexString('#88768e');lamp.roughness=.4;
  box('Gate status light '+id,x,2.88,.12,.52,.032,.025,lamp);
  const w=512,h=260,texture=new DynamicTexture('Gate action '+id,{width:w,height:h},scene,true);
  const ink=new StandardMaterial('Gate control ink '+id,scene);ink.diffuseTexture=texture;ink.emissiveColor=Color3.White();ink.disableLighting=true;ink.backFaceCulling=false;
  const face=MeshBuilder.CreatePlane('Permission '+id,{width:.74,height:.38},scene);face.parent=root;face.position.set(x,3.16,.08);face.material=ink;
  face.actionManager=new ActionManager(scene);face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onAction(id)));
  box('Gate label support '+id,x,3.07,-.06,.04,.36,.04,metal);
  return {id,door,card,face,texture,lamp,open:false};
 });
 batchStaticParts(root,root.getChildMeshes().filter(m=>/^(Gates base$|Gate back |Gate jamb |Gate lintel |Retained evidence |Evidence ink |Gate label support )/.test(m.name)),'Permission frame');
 let state:any=freshPermissions(),signature='';
 function setState(s:any){state=s;const key=JSON.stringify([s.profile,s.connected,s.source,s.draft,s.pending,s.check]);if(key===signature)return;signature=key;
  for(const g of gates){g.open=g.id==='read'?permissionReadAllowed(s):g.id==='draft'?s.connected:permissionsPass(s);const ready=g.id==='read'?!!s.source:g.id==='draft'?!!s.draft:permissionsPass(s);
   g.lamp.emissiveColor=Color3.FromHexString(ready?'#35643e':g.open?'#675081':'#46282c');
   const c=g.texture.getContext() as CanvasRenderingContext2D;c.fillStyle=ready?'#294534':'#e9e5dc';c.fillRect(0,0,512,260);c.fillStyle=ready?'#f1f5e9':'#403448';c.textAlign='center';c.font='bold 68px sans-serif';c.fillText(g.id==='read'?'READ':g.id==='draft'?'DRAFT':'CHECK',256,110);c.font='34px sans-serif';c.fillText(g.id==='read'?(s.pending?'AWAITING APPROVAL':s.source?'SOURCE IN CONTEXT':'LOCAL FILE'):g.id==='draft'?(s.draft?'UNSENT DRAFT':s.connected?'APP CONNECTED':'APP DISCONNECTED'):permissionsPass(s)?'VERIFIED':'READ BACK',256,185);g.texture.update();
  }
 }
 setState(state);
 return {setState,update:(dt:number,reduced:boolean)=>{for(const g of gates){const target=g.open?.08:1;g.door.scaling.y=reduced?target:g.door.scaling.y+(target-g.door.scaling.y)*Math.min(1,dt*5);g.door.position.y=2.82-.58*g.door.scaling.y;}},state:()=>({verified:permissionsPass(state),sourceLoaded:!!state.source,connected:state.connected,draft:state.draft?.status??null,ports:gates.map(g=>{const e=scene.getEngine(),v=scene.activeCamera!.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight());v.y=e.getRenderHeight()-v.y-v.height;const p=Vector3.Project(g.face.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),v);return {id:g.id,open:g.open,screen:{x:p.x*e.getRenderingCanvas()!.clientWidth/e.getRenderWidth(),y:p.y*e.getRenderingCanvas()!.clientHeight/e.getRenderHeight()}};})})};
}
