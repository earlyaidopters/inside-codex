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
import {freshModelLab,modelCatalog,modelEfforts,modelJobs,modelsPass} from './model-lab.mjs';

export function buildModelExhibit(scene:Scene,anchor:Vector3,onAction:(action:string,id:string)=>void){
 const root=new TransformNode('Model observatory routing console',scene);root.position=anchor.clone();
 const metal=new PBRMaterial('Observatory satin brass',scene);metal.albedoColor=Color3.FromHexString('#b6a17d');metal.metallic=.78;metal.roughness=.33;
 const ceramic=new PBRMaterial('Observatory graphite ceramic',scene);ceramic.albedoColor=Color3.FromHexString('#34333f');ceramic.roughness=.31;
 const base=MeshBuilder.CreateCylinder('Observatory instrument foot',{diameter:1.6,height:.13,tessellation:64},scene);base.parent=root;base.position.y=1.48;base.material=metal;base.isPickable=false;
 for(const x of [-1.22,1.22]){const post=MeshBuilder.CreateCylinder('Observatory support',{diameter:.045,height:1.8,tessellation:12},scene);post.parent=root;post.position.set(x,2.38,-.10);post.material=metal;post.isPickable=false;}
 for(const y of [1.7,3.2]){const rail=MeshBuilder.CreateBox('Observatory rail',{width:2.48,height:.04,depth:.04},scene);rail.parent=root;rail.position.set(0,y,-.10);rail.material=metal;rail.isPickable=false;}
 const controls:any[]=[];
 function plate(name:string,id:string,action:string,x:number,y:number,w:number,h:number){
  const mount=new TransformNode(name+' mount',scene);mount.parent=root;mount.position.set(x,y,0);
  const body=MeshBuilder.CreateBox(name+' ceramic',{width:w+.035,height:h+.035,depth:.07},scene);body.parent=mount;body.material=ceramic;body.isPickable=false;
  const width=id==='status'?1024:512,height=Math.round(width*h/w);
  const texture=new DynamicTexture(name+' text',{width,height},scene,true);
  const ink=new StandardMaterial(name+' unlit face',scene);ink.diffuseTexture=texture;ink.emissiveColor=Color3.White();ink.disableLighting=true;ink.backFaceCulling=false;
  const face=MeshBuilder.CreatePlane(name,{width:w,height:h},scene);face.parent=mount;face.position.z=.043;face.material=ink;face.isPickable=!!action;
  if(action){face.actionManager=new ActionManager(scene);face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onAction(action,id)));}
  const item={id,action,mount,face,texture,y,width,height};controls.push(item);return item;
 }
 modelJobs.forEach((j,i)=>plate('Route '+j.name,j.id,'job',(i-1)*.8,3.16,.73,.38));
 modelCatalog.forEach((m,i)=>plate('Select '+m.name,m.id,'model',(i-1.5)*.61,2.62,.55,.42));
 const core=MeshBuilder.CreateSphere('Selected reasoning core',{diameter:.25,segments:24},scene);core.parent=root;core.position.set(0,2.10,.04);core.material=ceramic;core.isPickable=false;
 const rings=modelEfforts.map((_,i)=>{const mat=new PBRMaterial('Effort band '+i,scene);mat.albedoColor=Color3.FromHexString('#71618f');mat.metallic=.3;mat.roughness=.35;const ring=MeshBuilder.CreateTorus('Reasoning effort band '+i,{diameter:.29+i*.08,thickness:.025,tessellation:48},scene);ring.parent=root;ring.position.set(0,2.10,.04);ring.rotation.x=Math.PI/2;ring.material=mat;ring.isPickable=false;return {ring,mat};});
 const status=plate('Output check status','status','',0,1.66,2.23,.28);
 batchStaticParts(root,root.getChildMeshes().filter(m=>/^(Observatory instrument foot$|Observatory support$|Observatory rail$|Selected reasoning core$|Output check status ceramic$)/.test(m.name)||(m.name.startsWith('Route ')&&m.name.endsWith(' ceramic'))),'Observatory frame');
 let state:any=freshModelLab(),signature='';
 function draw(item:any,title:string,sub:string,active:boolean,good=false){
  const c=item.texture.getContext(),w=item.width,h=item.height;
  c.fillStyle=good?'#294535':active?'#65527f':'#e8e4d9';c.fillRect(0,0,w,h);c.fillStyle=active||good?'#fff9ef':'#40374b';c.textAlign='center';
  const titleSize=Math.floor(Math.min(h*.31,(w-30)/(Math.max(1,title.length)*.64)));
  const subSize=Math.floor(Math.min(h*.17,(w-30)/(Math.max(1,sub.length)*.58)));
  c.font=`bold ${titleSize}px sans-serif`;c.fillText(title,w/2,h*.44);c.font=`${subSize}px sans-serif`;c.fillText(sub,w/2,h*.77);item.texture.update();
 }
 function setState(s:any){state=s;const key=JSON.stringify([s.job,...modelJobs.map(({id})=>[s.jobs[id].model,s.jobs[id].effort,s.jobs[id].current,s.jobs[id].accepted])]);if(key===signature)return;signature=key;const j=s.jobs[s.job];
  for(const c of controls){if(c.action==='job')draw(c,c.id==='label'?'LABEL':c.id==='billing'?'BILLING':'SHEET',s.jobs[c.id].accepted?'VERIFIED':'ROUTE JOB',s.job===c.id,!!s.jobs[c.id].accepted);if(c.action==='model')draw(c,modelCatalog.find(m=>m.id===c.id)!.name.toUpperCase(),j.model===c.id?'SELECTED':'SELECT',j.model===c.id);}
  rings.forEach(({mat},i)=>mat.emissiveColor=i<=modelEfforts.indexOf(j.effort)?new Color3(.18,.12,.28):Color3.Black());
  const checked=j.current?.checks,passed=checked?.every((c:any)=>c.pass);
  draw(status,j.accepted?'ROUTE KEPT':j.current?.result.blocked?'CONNECTION MISSING':checked?(passed?'OUTPUT VERIFIED':'CHECK FAILED'):j.current?'OUTPUT SAVED':'CHOOSE → RUN → CHECK',`${modelCatalog.find(m=>m.id===j.model)!.name.toUpperCase()} / ${j.effort.toUpperCase()} · ${modelJobs.filter(x=>s.jobs[x.id].accepted).length}/3 KEPT`,true,!!j.accepted);
 }
 setState(state);
 return {setState,update:(dt:number,reduced:boolean)=>{for(const c of controls.filter(c=>c.action==='model')){const target=c.y+(c.id===state.jobs[state.job].model? .06:0);c.mount.position.y=reduced?target:c.mount.position.y+(target-c.mount.position.y)*Math.min(1,dt*6);}},state:()=>({job:state.job,verified:modelsPass(state),selected:state.jobs[state.job].model,effort:state.jobs[state.job].effort,kept:modelJobs.filter(j=>state.jobs[j.id].accepted).length,controls:controls.filter(c=>c.action).map(c=>{const e=scene.getEngine(),v=scene.activeCamera!.viewport.toGlobal(e.getRenderWidth(),e.getRenderHeight());v.y=e.getRenderHeight()-v.y-v.height;const p=Vector3.Project(c.face.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),v);return {id:c.id,action:c.action,screen:{x:p.x*e.getRenderingCanvas()!.clientWidth/e.getRenderWidth(),y:p.y*e.getRenderingCanvas()!.clientHeight/e.getRenderHeight()}};})})};
}
