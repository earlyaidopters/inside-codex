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
import {contextSources,freshContext,contextPasses} from './context-lab.mjs';

export function buildContextExhibit(scene:Scene,anchor:Vector3,onInspect:(id:string)=>void){
 const root=new TransformNode('Context evidence rack',scene);root.position=anchor.clone();
 const metal=new PBRMaterial('Archive brushed metal',scene);metal.albedoColor=Color3.FromHexString('#99a2b1');metal.metallic=.8;metal.roughness=.3;
 const paper=new PBRMaterial('Archive ceramic file',scene);paper.albedoColor=Color3.FromHexString('#e8e4db');paper.roughness=.32;
 const spine=MeshBuilder.CreateBox('Evidence rack spine',{width:.06,height:1.75,depth:.06},scene);spine.parent=root;spine.position.set(0,2.2,-.13);spine.material=metal;
 for(const y of [1.75,2.58]){const rail=MeshBuilder.CreateBox('Evidence rail',{width:2.05,height:.045,depth:.06},scene);rail.parent=root;rail.position.set(0,y,-.13);rail.material=metal;}
 // Keep drawing coordinates stable at 2× raster density. Mipmaps prevent tiny
 // strokes breaking up at distance; anisotropy preserves oblique close-ups.
 const cards=contextSources.map((f,i)=>{
  const mount=new TransformNode('Source '+f.id,scene);mount.parent=root;const y=2.09+Math.floor(i/3)*.83;mount.position.set((i%3-1)*.7,y,0);
  const body=MeshBuilder.CreateBox('Archive file '+f.id,{width:.63,height:.7,depth:.055},scene);body.parent=mount;body.material=paper;body.isPickable=false;
  const texture=new DynamicTexture('Archive face '+f.id,{width:768,height:896},scene,true);
  texture.anisotropicFilteringLevel=8;
  const ink=new StandardMaterial('Archive ink '+f.id,scene);ink.diffuseTexture=texture;ink.emissiveColor=Color3.White();ink.disableLighting=true;ink.backFaceCulling=false;
  const face=MeshBuilder.CreatePlane('Inspect source '+f.id,{width:.59,height:.65},scene);face.parent=mount;face.position.z=.032;face.material=ink;
  face.actionManager=new ActionManager(scene);face.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onInspect(f.id)));
  return {id:f.id,mount,face,texture,y};
 });
 const resultTexture=new DynamicTexture('Context result ribbon',{width:1536,height:224},scene,true);resultTexture.anisotropicFilteringLevel=8;
 const resultInk=new StandardMaterial('Context ribbon ink',scene);resultInk.diffuseTexture=resultTexture;resultInk.emissiveColor=Color3.White();resultInk.disableLighting=true;resultInk.backFaceCulling=false;
 const resultFace=MeshBuilder.CreatePlane('Context draft and check status',{width:1.95,height:.28},scene);resultFace.parent=root;resultFace.position.set(0,1.57,.05);resultFace.material=resultInk;resultFace.isPickable=true;resultFace.actionManager=new ActionManager(scene);resultFace.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onInspect('__explore')));
 let tracePoints=[new Vector3(-1.5,3.5,.18),new Vector3(-.7,4.45,.18),new Vector3(.7,4.45,.18),new Vector3(1.5,3.5,.18)];const trace=MeshBuilder.CreateLines('Source to CSV trace',{points:tracePoints,updatable:true},scene);trace.parent=root;trace.color=Color3.FromHexString('#aa8be8');trace.isPickable=false;trace.setEnabled(false);
 const spark=MeshBuilder.CreateSphere('Evidence moving to field',{diameter:.12,segments:12},scene);spark.parent=root;const sparkMaterial=new StandardMaterial('Evidence glow',scene);sparkMaterial.emissiveColor=Color3.FromHexString('#bd9bff');sparkMaterial.disableLighting=true;spark.material=sparkMaterial;spark.isPickable=false;spark.setEnabled(false);let flowTime=0;
 batchStaticParts(root,root.getChildMeshes().filter(m=>/^(Evidence rack spine$|Evidence rail$)/.test(m.name)),'Context rack');
 let state:any=freshContext(),signature='';
 function setState(next:any){state=next;const key=JSON.stringify([state.selected,state.opened,state.authority,state.result,state.check,state.exploration]);if(signature===key)return;signature=key;
  const names:Record<string,string>={brief:'BRIEF',sample:'CSV',image:'IMAGE',agents:'GUIDE',old:'AUGUST',note:'NOTE'};
  for(const c of cards){const included=state.selected.includes(c.id),ctx=c.texture.getContext();ctx.setTransform(2,0,0,2,0,0);ctx.fillStyle=included?'#293f35':'#eeeae0';ctx.fillRect(0,0,384,448);ctx.fillStyle=included?'#ddd6fb':'#6d598a';ctx.fillRect(24,26,336,12);ctx.font='bold 66px sans-serif';ctx.fillText(names[c.id],26,135);ctx.font='30px sans-serif';ctx.fillStyle=included?'#e2ebde':'#536253';ctx.fillText(c.id==='old'?'AUG 12':'SEP '+(c.id==='brief'?'09':c.id==='agents'?'08':'10'),28,207);ctx.font='bold 31px sans-serif';ctx.fillText(included?'IN YOUR PACK':'OPEN FILE',28,332);if(state.opened===c.id){ctx.strokeStyle='#a191d2';ctx.lineWidth=8;ctx.strokeRect(8,8,368,432);}if(state.exploration&&['brief','old','sample'].includes(c.id)){ctx.fillStyle='#eeeae0';ctx.fillRect(20,170,344,240);ctx.fillStyle='#6d598a';ctx.font='bold 54px sans-serif';const name=c.id==='sample'?(state.exploration.traced?(state.exploration.source==='old'?'Evan Cole':'Nina Patel'):'Empty field'):c.id==='old'?'Evan Cole':'Nina Patel';name.split(' ').forEach((word:string,i:number)=>ctx.fillText(word,28,242+i*65));ctx.font='23px sans-serif';ctx.fillStyle='#536253';ctx.fillText(c.id==='sample'?'approval_owner':c.id==='old'?'SUPERSEDED · AUG 12':'APPROVED · SEP 09',28,388);}c.texture.update();}
  if(state.exploration){const startY=state.exploration.source==='old'?2.35:3.5;tracePoints=[new Vector3(-1.5,startY,.18),new Vector3(-.7,4.45,.18),new Vector3(.7,4.45,.18),new Vector3(1.5,3.5,.18)];MeshBuilder.CreateLines('Source to CSV trace',{points:tracePoints,instance:trace},scene);} 
  const ctx=resultTexture.getContext();ctx.setTransform(2,0,0,2,0,0);ctx.fillStyle=contextPasses(state)?'#436a52':state.check?.failures.length?'#894c3c':'#49415e';ctx.fillRect(0,0,768,112);ctx.fillStyle='#ffffff';ctx.font='bold 44px sans-serif';ctx.fillText(contextPasses(state)?'SAVED CSV · CHECK PASSED':state.check?.failures.length?'CHECK FAILED · REVIEW SOURCES':state.result?'DRAFT SAVED · RUN THE CHECK':'EXPLORE INSIDE ↗',20,73);resultTexture.update();
 }
 const screenPoint=(face:any)=>{const engine=scene.getEngine(),v=scene.activeCamera!.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight());v.y=engine.getRenderHeight()-v.y-v.height;const p=Vector3.Project(face.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),v);return {x:p.x*engine.getRenderingCanvas()!.clientWidth/engine.getRenderWidth(),y:p.y*engine.getRenderingCanvas()!.clientHeight/engine.getRenderHeight()};};
 setState(state);
 return {setState,update:(dt:number,reduced:boolean)=>{const deep=state.exploration;const positions:Record<string,number[]>={brief:[-1.5,3.5],old:[-1.5,2.35],sample:[1.5,3.5],agents:[0,2.35],image:[1.5,2.35],note:[0,3.5]};for(const [i,c] of cards.entries()){const xy=deep?positions[c.id]:[(i%3-1)*.7,c.y+(state.selected.includes(c.id)?.16:0)];const scale=deep?(c.id===deep.source||c.id==='sample'?1.45:1.1):1;const speed=reduced?1:Math.min(1,dt*4);c.mount.position.x+=(xy[0]-c.mount.position.x)*speed;c.mount.position.y+=(xy[1]-c.mount.position.y)*speed;c.mount.scaling.setAll(c.mount.scaling.x+(scale-c.mount.scaling.x)*speed);c.face.visibility=deep&&['note','old','brief'].includes(c.id)&&c.id!==deep.source?.48:1;}trace.setEnabled(!!deep?.traced);spark.setEnabled(!!deep?.traced);if(deep?.traced){flowTime=(flowTime+dt*.35)%1;trace.color=Color3.FromHexString(deep.source==='old'?'#de9761':'#aa8be8');const t=reduced?.5:flowTime;const segment=Math.min(2,Math.floor(t*3));spark.position=Vector3.Lerp(tracePoints[segment],tracePoints[segment+1],t*3-segment);}resultFace.position.y=deep?1.4:1.57;},state:()=>({entry:screenPoint(resultFace),exploring:!!state.exploration,selected:[...state.selected],verified:contextPasses(state),cards:cards.map(c=>{const engine=scene.getEngine(),v=scene.activeCamera!.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight());v.y=engine.getRenderHeight()-v.y-v.height;const p=Vector3.Project(c.face.getAbsolutePosition(),Matrix.Identity(),scene.getTransformMatrix(),v);return {id:c.id,y:c.mount.position.y,screen:{x:p.x*engine.getRenderingCanvas()!.clientWidth/engine.getRenderWidth(),y:p.y*engine.getRenderingCanvas()!.clientHeight/engine.getRenderHeight()}};})})};
}
