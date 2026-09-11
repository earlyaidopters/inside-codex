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
import {freshTools,toolPass} from './tool-lab.mjs';
export function buildToolExhibit(scene:Scene,anchor:Vector3,onAction:(id:string)=>void){
 const root=new TransformNode('Tool workshop assembly',scene);root.position=anchor.clone();
 const mat=(name:string,color:string,metal=0)=>{const m=new PBRMaterial(name,scene);m.albedoColor=Color3.FromHexString(color);m.metallic=metal;m.roughness=.32;return m;};
 const ivory=mat('Tool ceramic','#e9e4d7'),metal=mat('Tool satin hardware','#aeb4b0',.75),graphite=mat('Tool graphite','#344039'),purple=mat('Tool skill cartridge','#8975a7'),green=mat('Tool verified','#89b082'),red=mat('Tool mismatched source','#bb7863');
 function box(name:string,x:number,y:number,z:number,w:number,h:number,d:number,m:PBRMaterial){const b=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);b.parent=root;b.position.set(x,y,z);b.material=m;b.isPickable=false;return b;}
 box('Plugin tray',0,1.59,0,2.58,.12,.82,metal);box('Plugin backplane',0,2.25,-.12,2.37,1.25,.14,graphite);
 const connector=box('Document connector cartridge',-.72,2.23,.08,.58,.87,.3,ivory);const skill=box('Procedure cartridge',0,2.23,.08,.58,.87,.3,purple);const artifact=box('Saved artifact cartridge',.72,2.23,.08,.58,.87,.3,ivory);
 for(const x of [-.36,.36])box('Data connection '+x,x,2.2,.05,.22,.07,.08,metal);
 const socket=box('Connection indicator',-.72,1.76,.17,.47,.07,.08,red);
 const lamps=[box('Northstar result lamp',.56,1.76,.17,.20,.07,.08,ivory),box('Harbor result lamp',.88,1.76,.17,.20,.07,.08,ivory)];
 function plate(id:string,x:number,y:number,w:number,h:number,tw=512,th=224){const texture=new DynamicTexture('Tool '+id,{width:tw,height:th},scene,true),material=new StandardMaterial('Tool ink '+id,scene);material.diffuseTexture=texture;material.emissiveColor=Color3.White();material.disableLighting=true;material.backFaceCulling=false;const face=MeshBuilder.CreatePlane('Tool '+id,{width:w,height:h},scene);face.parent=root;face.position.set(x,y,.255);face.material=material;return {id,texture,face};}
 const ports=[['connect','CONNECT'],['procedure','PROCEDURE'],['results','RESULTS']].map(([id,label],i)=>{const p=plate(id,(i-1)*.86,3.06,.8,.34);p.face.actionManager=new ActionManager(scene);p.face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onAction(id)));return {...p,label};});
 const labels=[['tool',-.72,'READ TOOL'],['skill',0,'SKILL'],['file',.72,'CSV FILES']].map(([id,x,label])=>({...plate(String(id),Number(x),2.28,.55,.22),label:String(label)}));for(const p of labels){p.face.isPickable=false;const c=p.texture.getContext() as CanvasRenderingContext2D;c.fillStyle='#ece8dc';c.fillRect(0,0,512,224);c.fillStyle='#323c35';c.font='bold 57px sans-serif';c.textAlign='center';c.fillText(p.label,256,133);p.texture.update();}
 const status=plate('setup status',0,2.79,2.18,.20,1024,96);status.face.isPickable=false;
 batchStaticParts(root,root.getChildMeshes().filter(m=>m.name==='Plugin tray'||m.name.startsWith('Data connection ')),'Tool rail');
 let s:any=freshTools(),sig='';
 function setState(next:any){s=next;const key=JSON.stringify([s.section,s.installed,s.connected,s.skill,s.loaded,s.outputs,s.revision,s.scope]);if(key===sig)return;sig=key;
  connector.material=s.installed==='source'?ivory:graphite;skill.material=s.loaded.includes(s.skill)?purple:graphite;artifact.material=toolPass(s)?green:ivory;socket.material=s.connected?green:red;
  lamps.forEach((lamp,i)=>{const o=s.outputs[['northstar','harbor'][i]];lamp.material=o?.checked&&o.revision===s.revision?green:o?.checks.length?red:ivory;});
  for(const p of ports){const c=p.texture.getContext() as CanvasRenderingContext2D;c.fillStyle=p.id===s.section?'#51436a':'#ebe7dc';c.fillRect(0,0,512,224);c.fillStyle=p.id===s.section?'#f5f1e6':'#333d36';c.font='bold 52px sans-serif';c.textAlign='center';c.fillText(p.label,256,97);c.font='30px sans-serif';c.fillText(p.id==='connect'?'PLUGIN + ACCESS':p.id==='procedure'?'LOAD INSTRUCTIONS':'READ BACK + CHECK',256,166);p.texture.update();}
  const c=status.texture.getContext() as CanvasRenderingContext2D;c.fillStyle='#344039';c.fillRect(0,0,1024,96);c.fillStyle='#f1eddf';c.font='bold 34px sans-serif';c.textAlign='center';c.fillText(toolPass(s)?'TWO CLIENTS · ONE VERIFIED PROCEDURE':s.connected?'SOURCE CONNECTED · '+(s.loaded.includes(s.skill)?'SKILL LOADED':'SKILL WAITING'):'CONNECT A SOURCE · LOAD A SKILL',512,60);status.texture.update();
 }
 setState(s);
 return {setState,update:(_dt:number,_reduced:boolean)=>{},state:()=>({verified:toolPass(s),connected:s.connected,skillLoaded:s.loaded.includes(s.skill),ports:ports.map(p=>{const e=scene.getEngine(),v=scene.activeCamera!.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight());v.y=e.getRenderHeight()-v.y-v.height;const q=Vector3.Project(p.face.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),v);return {id:p.id,screen:{x:q.x*e.getRenderingCanvas()!.clientWidth/e.getRenderWidth(),y:q.y*e.getRenderingCanvas()!.clientHeight/e.getRenderHeight()}};})})};
}
