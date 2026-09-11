import {createQualityAdvice,type QualityAdvice} from './quality-advice';
import {createStartupMonitor,type StartupMonitor} from './startup';
import {installArchitectureTextures,installOriginalArchitectureTextures} from './architecture-textures';
import {createArchitectureDetail} from './architecture-detail';
import {batchStaticShadows} from './static-shadow-batch';
import {createExhibitResidency,type ExhibitStatus} from './exhibit-residency';
import {VertexData} from '@babylonjs/core/Meshes/mesh.vertexData';
import {MeshoptCompression} from '@babylonjs/core/Meshes/Compression/meshoptCompression';
import {createMascotDetail,mascotFile,type MascotDetail} from './mascot-detail';
import {guideSightPoints,visibilityIndex} from './tour-camera.mjs';
import {Ray} from '@babylonjs/core/Culling/ray';
import {PointerEventTypes} from '@babylonjs/core/Events/pointerEvents';
// Register mesh picking explicitly; module-specific imports omit this scene extension.
import '@babylonjs/core/Culling/ray';
import {InputManager} from '@babylonjs/core/Inputs/scene.inputManager';
import {SceneInstrumentation} from '@babylonjs/core/Instrumentation/sceneInstrumentation';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {PointLight} from '@babylonjs/core/Lights/pointLight';
import {Engine} from '@babylonjs/core/Engines/engine';
import {Scene} from '@babylonjs/core/scene';
import {Color3,Color4} from '@babylonjs/core/Maths/math.color';
import {Vector3,Matrix} from '@babylonjs/core/Maths/math.vector';
import {Viewport} from '@babylonjs/core/Maths/math.viewport';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {HemisphericLight} from '@babylonjs/core/Lights/hemisphericLight';
import {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import {ArcRotateCamera} from '@babylonjs/core/Cameras/arcRotateCamera';
import {CubeTexture} from '@babylonjs/core/Materials/Textures/cubeTexture';
import {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import {DefaultRenderingPipeline} from '@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {SceneLoader} from '@babylonjs/core/Loading/sceneLoader';
import {AnimationGroup} from '@babylonjs/core/Animations/animationGroup';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {ActionManager} from '@babylonjs/core/Actions/actionManager';
import {ExecuteCodeAction} from '@babylonjs/core/Actions/directActions';
import '@babylonjs/loaders/glTF';

MeshoptCompression.Configuration={decoder:{url:'/assets/decoders/meshopt-decoder-1.2.0-codex1.js'}};
async function loadArchitecture(scene:Scene,signal?:AbortSignal){
 performance.mark('codex.architecture.request');
 const response=await fetch('/assets/headquarters/streamed/architecture.glb.gz',{signal});
 if(!response.ok)throw Error('Headquarters download failed');
 const packed=await response.arrayBuffer();performance.mark('codex.architecture.downloaded');
 performance.measure('codex.architecture.download','codex.architecture.request','codex.architecture.downloaded');
 let bytes:Uint8Array<ArrayBuffer>=new Uint8Array(packed);
 // Some hosts serve the sidecar with Content-Encoding and the browser has
 // already unpacked it. Otherwise decode the exact same packaged GLB locally.
 if(bytes[0]===0x1f&&bytes[1]===0x8b){
  if(typeof DecompressionStream!=='undefined'){
   const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
   bytes=new Uint8Array(await new Response(stream).arrayBuffer());
  }else{
   const {gunzip}=await import('fflate');
   bytes=await new Promise<Uint8Array<ArrayBuffer>>((resolve,reject)=>gunzip(bytes,(error,data)=>error?reject(error):resolve(new Uint8Array(data))));
  }
 }
 signal?.throwIfAborted();
 if(bytes.length<12||new DataView(bytes.buffer).getUint32(0,true)!==0x46546c67)throw Error('Headquarters download is not a valid GLB');
 performance.mark('codex.architecture.unpacked');performance.measure('codex.architecture.unpack','codex.architecture.downloaded','codex.architecture.unpacked');
 const result=await SceneLoader.ImportMeshAsync('','/assets/headquarters/',new File([bytes],'architecture.glb'),scene);
 performance.mark('codex.architecture.imported');performance.measure('codex.architecture.import','codex.architecture.unpacked','codex.architecture.imported');
 return result;
}
const C=(s:string)=>Color3.FromHexString(s);
export async function createWorld(canvas:HTMLCanvasElement,onSelect:(i:number)=>void,onChoose:(id:string)=>void,onInspect:(id:string)=>void,onModelAction:(action:string,id:string)=>void,onPermissionAction:(action:string)=>void,onReviewAction:(id:string)=>void,onSteeringAction:(id:string)=>void,onToolAction:(id:string)=>void,onAutomationAction:(id:string)=>void,onHandoffAction:(id:string)=>void,onCapstoneAction:(id:string)=>void,initialQuality:MascotDetail='high',onQualityStatus:(message:string)=>void=()=>{},onExhibitStatus:(status:ExhibitStatus)=>void=()=>{},startup:StartupMonitor=createStartupMonitor(),onQualityAdvice:(value:QualityAdvice)=>void=()=>{}){
 // Every release is a single selection. No exhibit has a double-click action.
 // Babylon otherwise suppresses a second quick pick, even on a different mesh.
 InputManager.DoubleClickDelay=0;
 startup.enter('graphics-context');
 const creationError=(event:Event)=>startup.note('context-creation-error',(event as WebGLContextEvent).statusMessage);
 canvas.addEventListener('webglcontextcreationerror',creationError);let engine:Engine;
 try{engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});}finally{canvas.removeEventListener('webglcontextcreationerror',creationError);}
 const startupCleanup:(()=>void)[]=[];startup.enter('scene-setup');
 const scene=new Scene(engine);try{let lastPick:any=null;scene.onPointerObservable.add(info=>{if(info.type===PointerEventTypes.POINTERDOWN)lastPick={mesh:info.pickInfo?.pickedMesh?.name,hit:info.pickInfo?.hit,x:scene.pointerX,y:scene.pointerY};});const instrumentation=new SceneInstrumentation(scene);instrumentation.captureFrameTime=true;scene.useRightHandedSystem=true;scene.clearColor=new Color4(.88,.88,.86,1);
 const camera=new ArcRotateCamera('Tour camera',1.22,1.31,13.5,new Vector3(-1.3,2.3,2),scene);
 camera.minZ=.1;camera.maxZ=160;camera.fov=.83;camera.lowerRadiusLimit=5;camera.upperRadiusLimit=26;camera.lowerBetaLimit=.5;camera.upperBetaLimit=1.48;
 camera.wheelPrecision=45;camera.panningSensibility=0;camera.attachControl(canvas,true);
 // Start lighting alongside geometry, but require its explicit load result.
 // Babylon can consider the scene ready after an environment request fails.
 const environmentReady=new Promise<Error|null>(resolve=>{
  scene.environmentTexture=new CubeTexture('/assets/studio.env',scene,{prefiltered:true,createPolynomials:true,
   onLoad:()=>resolve(null),onError:(message,cause)=>resolve(new Error(message||'Environment lighting failed',{cause}))});
 });scene.environmentIntensity=.72;
 scene.imageProcessingConfiguration.toneMappingEnabled=true;scene.imageProcessingConfiguration.toneMappingType=1;scene.imageProcessingConfiguration.exposure=.85;scene.imageProcessingConfiguration.contrast=1.22;
 const sky=new HemisphericLight('Sky fill',new Vector3(0,1,0),scene);sky.intensity=.45;sky.groundColor=C('#988c80');sky.diffuse=C('#eff3ff');
 const sun=new DirectionalLight('Late afternoon',new Vector3(-.7,-1,-.4),scene);sun.position=new Vector3(16,24,12);sun.intensity=1.9;sun.diffuse=C('#fff0d5');
 const shadow=new ShadowGenerator(2048,sun);shadow.usePercentageCloserFiltering=true;shadow.filteringQuality=ShadowGenerator.QUALITY_MEDIUM;shadow.bias=.002;shadow.normalBias=.06;shadow.darkness=.22;
 const materials:Record<string,PBRMaterial>={};
 const mat=(id:string,color:string,metal=0,rough=.5)=>{const m=new PBRMaterial(id,scene);m.albedoColor=C(color);m.metallic=metal;m.roughness=rough;materials[id]=m;return m;};
 const stone=mat('Limestone','#e4dfd2',.02,.7),ivory=mat('Porcelain','#f4f1e8',.08,.3),floor=mat('Honed travertine','#cfcbc0',.05,.4),metal=mat('Brushed champagne','#ab9670',.8,.29),dark=mat('Graphite','#202b30',.35,.3),blue=mat('Learning violet','#8073ef',.45,.25),green=mat('Plant green','#607b4e',0,.9);
 const glow=(name:string,col:string)=>{const m=mat(name,col,0,.5);m.emissiveColor=C(col).scale(1.25);return m;};
 const violet=glow('Violet wayfinding','#9d91ff'),warm=glow('Warm fixture','#fff0c7'),mint=glow('Evidence green','#9ce3bc');
 const casters:AbstractMesh[]=[];
 const box=(name:string,pos:number[],size:number[],m:PBRMaterial,cast=true)=>{const o=MeshBuilder.CreateBox(name,{width:size[0],height:size[1],depth:size[2]},scene);o.position=new Vector3(...pos);o.material=m;o.receiveShadows=true;if(cast){shadow.addShadowCaster(o);casters.push(o);}return o;};
 const cyl=(name:string,pos:number[],diam:number,h:number,m:PBRMaterial,tess=64)=>{const o=MeshBuilder.CreateCylinder(name,{diameter:diam,height:h,tessellation:tess},scene);o.position=new Vector3(...pos);o.material=m;o.receiveShadows=true;shadow.addShadowCaster(o);casters.push(o);return o;};
 // Thin wayfinding tubes need a smooth 96-segment circumference, but only
 // eight sides around their 32 mm cross-section. Separate these dimensions.
 const ring=(name:string,pos:number[],diam:number,tube:number,m:PBRMaterial)=>{
  const data=new VertexData(),positions:number[]=[],normals:number[]=[],uvs:number[]=[],indices:number[]=[];
  const around=96,cross=8,stride=cross+1;
  for(let i=0;i<=around;i++){
   const transform=Matrix.Translation(diam/2,0,0).multiply(Matrix.RotationY(i*Math.PI*2/around-Math.PI/2));
   for(let j=0;j<=cross;j++){
    const a=j*Math.PI*2/cross+Math.PI,normal=new Vector3(Math.cos(a),Math.sin(a),0);
    positions.push(...Vector3.TransformCoordinates(normal.scale(tube/2),transform).asArray());normals.push(...Vector3.TransformNormal(normal,transform).asArray());uvs.push(i/around,1-j/cross);
    if(i<around&&j<cross){const v=i*stride+j;indices.push(v,v+1,v+stride,v+1,v+stride+1,v+stride);}
   }
  }
  data.positions=positions;data.normals=normals;data.uvs=uvs;data.indices=indices;
  const o=new Mesh(name,scene);data.applyToMesh(o);o.position=new Vector3(...pos);o.material=m;return o;
 };
 const label=(text:string,pos:number[],width=3,color='#eee8da',size=90)=>{const t=new DynamicTexture(text,{width:1024,height:256},scene,true);t.hasAlpha=true;t.anisotropicFilteringLevel=8;const ctx=t.getContext();ctx.clearRect(0,0,1024,256);t.drawText(text,null,165,`${size}px sans-serif`,color,'transparent',true);const m=new StandardMaterial(text+' label',scene);m.diffuseTexture=t;m.useAlphaFromDiffuseTexture=true;m.emissiveColor=Color3.White();m.disableLighting=true;m.backFaceCulling=false;const p=MeshBuilder.CreatePlane(text,{width,height:width/4},scene);p.position=new Vector3(...pos);p.rotation.y=0;p.material=m;return p;};
 // The authored source and these lightmaps share one fixture manifest.
 const architecture=await startup.run('architecture',signal=>loadArchitecture(scene,signal));
 const staticCasters:AbstractMesh[]=[...architecture.meshes];
 const architectureDetail=createArchitectureDetail(scene,architecture.meshes,onQualityStatus);
 await startup.run('architecture-detail',()=>architectureDetail.select(initialQuality));
 const lightmaps:Record<string,Texture>={};
 const architectureTextures=await startup.run('architecture-textures',async()=>{const installed=await installArchitectureTextures(scene,architecture.meshes,lightmaps);if(installed.mode==='original')await installOriginalArchitectureTextures(scene,architecture.meshes,lightmaps);return installed;},30000);
 for(const mesh of architecture.meshes){
  const exterior=mesh.name.includes('exterior');mesh.receiveShadows=!exterior;mesh.isPickable=false;
  if(!exterior&&!mesh.name.includes('floor'))shadow.addShadowCaster(mesh);
  const m=mesh.material;if(m instanceof PBRMaterial){const group=Object.keys(lightmaps).find(g=>m.name.includes('__'+g));if(group){m.lightmapTexture=lightmaps[group];m.useLightmapAsShadowmap=false;}m.environmentIntensity=.28;m.maxSimultaneousLights=5;}
 }
 const fixtureManifest=await startup.run('room-fixtures',async signal=>{const response=await fetch('/assets/headquarters/fixtures.json',{signal});if(!response.ok)throw new Error('Architectural fixture manifest missing');return response.json();});startup.enter('room-assembly');const authoredSun=fixtureManifest.fixtures.find((f:any)=>f.type==='directional');
 sun.direction=new Vector3(...authoredSun.direction);sun.diffuse=new Color3(...authoredSun.color);sun.intensity=authoredSun.runtimeIntensity;
 const exhibitKey=new PointLight('Active exhibit practical',new Vector3(2,7,2),scene);exhibitKey.diffuse=new Color3(1,.85,.65);exhibitKey.intensity=4;exhibitKey.range=9;
 const halos:Mesh[]=[];
 // Each wing has four distinct stations arranged along a real promenade.
 const stations:TransformNode[]=[];const statusLamps:Mesh[]=[];
 const wingColors=[violet,mint,warm];const titles=['UNDERSTAND','DIRECT','REPEAT'];
 for(let wing=0;wing<3;wing++){
  const base=(wing-1)*16;
  
  label(titles[wing],[base,6.25,-17.97],6,'#f3f0e6',68);
  label(`0${wing+1}  /  THE CODEX ECOSYSTEM`,[base,5.65,-17.96],6,'#aaaeb4',38);
  for(let j=0;j<4;j++){
   const i=wing*4+j;const x=base-5.4+j*3.6,z=-10;
   const anchor=new TransformNode('Station '+i,scene);anchor.position=new Vector3(x,0,z);stations.push(anchor);
   
   const lamp=ring('Learning state '+i,[x,1.399,z],1.5,.032,wingColors[wing]);statusLamps.push(lamp);
   const sculptureRoot=new TransformNode('Exhibit mechanism '+i,scene);sculptureRoot.position=new Vector3(x,2.2,z);
   for(let q=0;q<(i===0||i===1||i===2||i===3||i===5||i===6||i===7||i===8||i===10||i===11?0:3);q++){
    let ob:Mesh;
    if(j===0){ob=MeshBuilder.CreateTorus('Agent loop '+q,{diameter:.72+q*.30,thickness:.07,tessellation:40},scene);ob.rotation.x=Math.PI/2;ob.rotation.z=q*.5;}
    else if(j===1){ob=MeshBuilder.CreateBox('Context volume '+q,{width:.7,height:1,depth:.08},scene);ob.position.x=(q-1)*.28;ob.position.y=q*.10;ob.rotation.y=q*.3-.3;}
    else if(j===2){ob=MeshBuilder.CreatePolyhedron('Decision crystal '+q,{type:1,size:.26},scene);ob.position.y=q*.38-.4;ob.position.x=(q%2)*.35-.175;}
    else {ob=MeshBuilder.CreateBox('Evidence block '+q,{size:.45},scene);ob.position.x=(q-1)*.44;ob.position.y=(q-1)*.22;ob.rotation.z=.1;}
    ob.actionManager=new ActionManager(scene);ob.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onSelect(i)));ob.parent=sculptureRoot;ob.material=q===1?wingColors[wing]:metal;shadow.addShadowCaster(ob);staticCasters.push(ob);
   }
   const plaque=label(String(i+1).padStart(2,'0'),[x,.98,z+.905],.42,'#ffffff',88);

   plaque.actionManager=new ActionManager(scene);plaque.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger,()=>onSelect(i)));
  }
 }
 const residency=createExhibitResidency(scene,camera,onExhibitStatus);
 const cedarExhibit=residency.register({id:'capstone',station:11,center:stations[11].position.add(new Vector3(0,2.6,0)),modulePath:'src/capstone-exhibit.ts',exportName:'buildCapstoneExhibit',load:()=>import('./capstone-exhibit'),make:factory=>factory(scene,stations[11].position,onCapstoneAction),enabled:false});
 const handoffExhibit=residency.register({id:'handoff',station:11,center:stations[11].position.add(new Vector3(0,2.6,0)),modulePath:'src/handoff-exhibit.ts',exportName:'buildHandoffExhibit',load:()=>import('./handoff-exhibit'),make:factory=>factory(scene,stations[11].position,onHandoffAction)});
 const automationExhibit=residency.register({id:'automation',station:10,center:stations[10].position.add(new Vector3(0,2.6,0)),modulePath:'src/automation-exhibit.ts',exportName:'buildAutomationExhibit',load:()=>import('./automation-exhibit'),make:factory=>factory(scene,stations[10].position,onAutomationAction)});
 const toolExhibit=residency.register({id:'tool',station:8,center:stations[8].position.add(new Vector3(0,2.6,0)),modulePath:'src/tool-exhibit.ts',exportName:'buildToolExhibit',load:()=>import('./tool-exhibit'),make:factory=>factory(scene,stations[8].position,onToolAction)});
 const steeringExhibit=residency.register({id:'steering',station:6,center:stations[6].position.add(new Vector3(0,2.6,0)),modulePath:'src/steering-exhibit.ts',exportName:'buildSteeringExhibit',load:()=>import('./steering-exhibit'),make:factory=>factory(scene,stations[6].position,onSteeringAction)});
 const reviewExhibit=residency.register({id:'review',station:7,center:stations[7].position.add(new Vector3(0,2.6,0)),modulePath:'src/review-exhibit.ts',exportName:'buildReviewExhibit',load:()=>import('./review-exhibit'),make:factory=>factory(scene,stations[7].position,onReviewAction)});
 const permissionExhibit=residency.register({id:'permission',station:3,center:stations[3].position.add(new Vector3(0,2.6,0)),modulePath:'src/permission-exhibit.ts',exportName:'buildPermissionExhibit',load:()=>import('./permission-exhibit'),make:factory=>factory(scene,stations[3].position,onPermissionAction)});
 const modelExhibit=residency.register({id:'model',station:2,center:stations[2].position.add(new Vector3(0,2.6,0)),modulePath:'src/model-exhibit.ts',exportName:'buildModelExhibit',load:()=>import('./model-exhibit'),make:factory=>factory(scene,stations[2].position,onModelAction)});
 const contextExhibit=residency.register({id:'context',station:1,center:stations[1].position.add(new Vector3(0,2.6,0)),modulePath:'src/context-exhibit.ts',exportName:'buildContextExhibit',load:()=>import('./context-exhibit'),make:factory=>factory(scene,stations[1].position,onInspect)});
 const branchExhibit=residency.register({id:'branch',station:5,center:stations[5].position.add(new Vector3(0,2.6,0)),modulePath:'src/branch-exhibit.ts',exportName:'buildBranchExhibit',load:()=>import('./branch-exhibit'),make:factory=>factory(scene,stations[5].position)});
 const harness=residency.register({id:'harness',station:0,center:stations[0].position.add(new Vector3(0,2.6,0)),modulePath:'src/harness-exhibit.ts',exportName:'buildHarnessExhibit',load:()=>import('./harness-exhibit'),make:factory=>factory(scene,stations[0].position,onChoose)});
 function makeFinishingPipeline(q:MascotDetail){
  const p=new DefaultRenderingPipeline('Finishing',true,scene,[camera],false);
  p.fxaaEnabled=true;p.samples=q==='high'?4:1;p.bloomEnabled=q==='high';p.bloomThreshold=.94;p.bloomWeight=.12;p.bloomKernel=48;
  p.prepare();p.automaticBuild=true;return p;
 }
 let pipelineQuality=initialQuality,pip=makeFinishingPipeline(initialQuality);
 const result=await startup.run('guide',()=>SceneLoader.ImportMeshAsync('','/assets/',mascotFile(initialQuality),scene));startup.enter('scene-finalization');
 const mascotDetail=createMascotDetail(scene,result.meshes,initialQuality,onQualityStatus);
 const mascot=new TransformNode('Codex guide',scene);mascot.position=new Vector3(2,.35,2);mascot.rotation.y=.25;mascot.scaling.setAll(1.15);
 const presentation=new TransformNode('Guide presentation offset',scene);presentation.parent=mascot;
 for(const m of result.meshes)if(!m.parent)m.parent=presentation;
 for(const m of result.meshes){m.receiveShadows=true;shadow.addShadowCaster(m);}
 const guideKey=new DirectionalLight('Guide softbox',new Vector3(-.35,-.4,-1),scene);guideKey.diffuse=new Color3(.94,.96,1);guideKey.intensity=1.65;guideKey.includedOnlyMeshes=result.meshes;
 const guideRim=new DirectionalLight('Guide rim',new Vector3(.6,-.2,1),scene);guideRim.diffuse=new Color3(.62,.69,1);guideRim.intensity=.7;guideRim.includedOnlyMeshes=result.meshes;
 for(const m of result.meshes)if(m.material instanceof PBRMaterial)m.material.maxSimultaneousLights=5;
 const staticShadows=batchStaticShadows(scene,shadow,staticCasters);
 mascotDetail.attachShadows(shadow);

 const renderAudit=new URLSearchParams(location.search).has('renderAudit')?(await startup.run('render-audit',()=>import('./render-audit'))).createRenderAudit(scene,instrumentation):null;
 const cameraAudit=new URLSearchParams(location.search).has('cameraAudit');const navigation=cameraAudit?await startup.run('camera-audit',async signal=>{const response=await fetch('/assets/headquarters/navigation.json',{signal});if(!response.ok)throw Error('Camera diagnostic manifest missing');return response.json();}):null;const visibility=navigation?visibilityIndex(navigation.boxes):null;
 const qualityAdvice=createQualityAdvice(onQualityAdvice);let adviceReady=false;
 let time=0,paused=false,reduced=false,quality=initialQuality,active=-1,transition=0,layout='welcome';
 let clip:AnimationGroup|undefined,previousClip:AnimationGroup|undefined,blendElapsed=1,gestureAge=0,reminderGiven=false;
 const gesture=(name:string)=>{
  const requested=name==='Point'&&active>=4&&active%4===0?'PointLeft':name;const next=result.animationGroups.find(a=>a.name===requested)??result.animationGroups[0];if(next===clip)return;
  previousClip?.stop();previousClip=clip;clip=next;blendElapsed=0;gestureAge=0;
  previousClip?.setWeightForAllAnimatables(1);next?.start(true,1);next?.setWeightForAllAnimatables(previousClip?0:1);
  if(reduced){previousClip?.stop();previousClip=undefined;next?.setWeightForAllAnimatables(1);next?.goToFrame(0);next?.pause();blendElapsed=1;}
  if(paused){next?.pause();previousClip?.pause();}
 };gesture('Idle');
 let fromTarget=camera.target.clone(),toTarget=camera.target.clone(),fromPos=mascot.position.clone(),toPos=mascot.position.clone(),fromRadius=camera.radius,toRadius=camera.radius;
 let fromAlpha=camera.alpha,toAlpha=camera.alpha,fromBeta=camera.beta;let travelPoints:Vector3[]=[fromPos.clone(),toPos.clone()],travelDuration=1.5;
 const atRoute=(t:number)=>{const lengths=travelPoints.slice(1).map((p,i)=>Vector3.Distance(p,travelPoints[i]));const total=lengths.reduce((a,b)=>a+b,0);let distance=t*total;for(let i=0;i<lengths.length;i++){if(distance<=lengths[i])return Vector3.Lerp(travelPoints[i],travelPoints[i+1],lengths[i]>0?distance/lengths[i]:1);distance-=lengths[i];}return toPos.clone();};
 const frameMs:number[]=[];
 let presented:{active:number;transition:number}|null=null;
 const responsiveCamera=()=>{
  const small=innerWidth<=700,compact=innerWidth>700&&innerHeight<=500;
  camera.viewport=compact?(layout==='mission'?new Viewport(0,0,.49,1):new Viewport(.49,0,.51,1)):small?(layout==='mission'?new Viewport(0,.48,1,.52):new Viewport(0,0,1,.56)):layout==='mission'?new Viewport(0,0,(innerWidth-(innerWidth<=1100?370:innerWidth>=1600?445:400)-innerWidth*.055)/innerWidth,1):new Viewport(0,0,1,1);
  if(small||compact){if(layout==='mission'&&active>=0){const p=stations[active].position;toTarget=new Vector3(p.x+(active>=4&&active%4===0?.6:-.6),compact?3.1:2.55,p.z+.3);toRadius=compact?8.4:8.8;}else{toTarget=toPos.add(new Vector3(0,2.1,0));toRadius=8.6;}toAlpha=Math.PI/2-.12;}
  else if(active<0){toTarget=new Vector3(-1.3,2.3,2);toRadius=13.5;toAlpha=1.22;}
  else {const p=stations[active].position;toTarget=new Vector3(p.x+(active>=4&&active%4===0?.6:-.6),2.3,p.z);toRadius=9;toAlpha=1.28;}
  engine.resize();
 };
 const travel=(index:number)=>{
  const wasTravelling=transition>0;const previousIndex=active;active=index;residency.focus(index);reminderGiven=false;fromTarget=camera.target.clone();fromPos=mascot.position.clone();fromRadius=camera.radius;fromAlpha=camera.alpha;fromBeta=camera.beta;
  if(index<0){toTarget=new Vector3(-1.3,2.3,2);toPos=new Vector3(2,.35,2);toRadius=13.5;toAlpha=1.22;}
  else {const p=stations[index].position;toTarget=new Vector3(p.x+(active>=4&&active%4===0?.6:-.6),2.3,p.z);toPos=new Vector3(p.x+(index>=4&&index%4===0?2:-2),.1,p.z+1.7);toRadius=9;toAlpha=1.28;}
  responsiveCamera();
  travelPoints=Vector3.Distance(fromPos,toPos)<.2||(!wasTravelling&&previousIndex>=0&&index>=0&&Math.floor(previousIndex/4)===Math.floor(index/4))?[fromPos.clone(),toPos.clone()]:[fromPos.clone(),new Vector3(fromPos.x,.1,-1),new Vector3(toPos.x,.1,-1),toPos.clone()];
  const distance=travelPoints.slice(1).reduce((sum,p,i)=>sum+Vector3.Distance(p,travelPoints[i]),0);travelDuration=Math.max(.8,Math.min(5.5,distance/8));
  transition=reduced?1:.0001;gesture('Travel');
 };
 // A lesson may already be open when asynchronous world creation finishes.
 // Establish its first visible state directly, including when the user paused
 // before a canvas existed; no queued travel should freeze at the arrival view.
 const restoreView=(index:number)=>{
  travel(index);transition=0;mascot.position.copyFrom(toPos);camera.setTarget(toTarget.clone(),false,true,true);camera.alpha=toAlpha;camera.beta=1.31;camera.radius=toRadius;
  camera.inertialAlphaOffset=0;camera.inertialBetaOffset=0;camera.inertialRadiusOffset=0;
  const portrait=innerWidth<=700&&index>=0&&layout==='mission';presentation.position.y=portrait?1.9:0;mascot.scaling.setAll(index<0?1.15:portrait?.76:.86);mascot.rotation.y=index<0?.25:index>=4&&index%4===0?-.16:.10;
  exhibitKey.position=new Vector3(mascot.position.x+2,6.6,mascot.position.z+.7);
  for(const group of result.animationGroups)group.stop();clip=undefined;previousClip=undefined;gesture('Idle');
  residency.syncPresentation();residency.refresh();
 };
 const updateFrame=()=>{
  const dt=Math.min(.05,engine.getDeltaTime()/1000);if(!paused)time+=dt;
  if(frameMs.length>600)frameMs.shift();frameMs.push(engine.getDeltaTime());
  if(transition>0&&!paused){transition=Math.min(1,transition+dt/travelDuration);const t=transition*transition*(3-2*transition);mascot.position=atRoute(t);camera.setTarget(mascot.position.add(Vector3.Lerp(fromTarget.subtract(fromPos),toTarget.subtract(toPos),t)),false,true,true);camera.beta=fromBeta+(1.31-fromBeta)*t;camera.radius=fromRadius+(toRadius-fromRadius)*t;camera.alpha=fromAlpha+(toAlpha-fromAlpha)*t;if(transition===1){transition=0;gesture(active<0?'Return':'Greet');}}
  if(!paused){
   if(!reduced){gestureAge+=dt;if(previousClip){blendElapsed=Math.min(1,blendElapsed+dt/.32);clip?.setWeightForAllAnimatables(blendElapsed);previousClip.setWeightForAllAnimatables(1-blendElapsed);if(blendElapsed===1){previousClip.stop();previousClip=undefined;}}if(gestureAge>3.15&&clip&&!['Idle','Travel','Wait'].includes(clip.name))gesture('Idle');if(gestureAge>12&&active>=0&&clip?.name==='Idle'&&!reminderGiven){reminderGiven=true;gesture('Beckon');}}
   handoffExhibit.update(dt,reduced);automationExhibit.update(dt,reduced);toolExhibit.update(dt,reduced);steeringExhibit.update(dt,reduced);reviewExhibit.update(dt,reduced);permissionExhibit.update(dt,reduced);modelExhibit.update(dt,reduced);contextExhibit.update(dt,reduced);branchExhibit.update(dt,reduced);harness.update(dt,reduced);const portraitLesson=innerWidth<=700&&active>=0&&layout==='mission';const targetScale=active<0?1.15:portraitLesson?.76:.86;const lift=portraitLesson?1.9:0;presentation.position.y=reduced?lift:presentation.position.y+(lift-presentation.position.y)*Math.min(1,dt*4);mascot.scaling.setAll(reduced?targetScale:mascot.scaling.x+(targetScale-mascot.scaling.x)*Math.min(1,dt*4));exhibitKey.position=new Vector3(mascot.position.x+2,6.6,mascot.position.z+.7);}
  if(!paused&&!reduced){halos.forEach((h,i)=>h.rotation.y=time*.05*(i%2?1:-1));}
  if(!paused){const facing=active<0?.25:active>=4&&active%4===0?-.16:.10;mascot.rotation.y=reduced?facing:mascot.rotation.y+(facing-mascot.rotation.y)*Math.min(1,dt*4);}
 };
 function applyRenderQuality(v:MascotDetail){
  quality=v;engine.setHardwareScalingLevel(v==='balanced'?1:1/Math.min(2,Math.max(1,window.devicePixelRatio||1)));
  // Disabling bloom retains its reusable GPU targets. A real mode change owns
  // a new pipeline and releases every effect in the old one, including bloom.
  if(pipelineQuality!==v){
   pip.dispose();
   // Babylon 9.25 keeps null attachment slots on detach. This camera owns one
   // pipeline; clear only a fully empty list, preserving any external effects.
   if(camera._postProcesses.every(p=>p===null))camera._postProcesses.length=0;
   pip=makeFinishingPipeline(v);pipelineQuality=v;
  }
 }
 function cameraVisibility(){if(!cameraAudit||!visibility)return null;const points=guideSightPoints(mascot.position.asArray(),mascot.scaling.x,presentation.position.y),position=camera.globalPosition.asArray(),viewport=camera.viewport.toGlobal(engine.getRenderWidth(),engine.getRenderHeight());viewport.y=engine.getRenderHeight()-viewport.y-viewport.height;const projected=points.map(p=>{const v=Vector3.Project(Vector3.FromArray(p),Matrix.Identity(),scene.getTransformMatrix(),viewport);return {x:v.x/engine.getRenderWidth()*canvas.clientWidth,y:v.y/engine.getRenderHeight()*canvas.clientHeight,depth:v.z};});const proxy=points.map(p=>visibility.firstHit(position,p,.02));const exact=points.map(p=>{const end=Vector3.FromArray(p),delta=end.subtract(camera.globalPosition),ray=new Ray(camera.globalPosition,delta.normalize(),Vector3.Distance(camera.globalPosition,end)-.02);const hit=scene.pickWithRay(ray,m=>architecture.meshes.includes(m)&&!m.name.includes('floor')&&!m.name.includes('exterior'));return hit?.hit?{mesh:hit.pickedMesh?.name,distance:hit.distance}:null;});return {mode:'authored-smooth',position,points,projected,viewport:{x:viewport.x/engine.getRenderWidth()*canvas.clientWidth,y:viewport.y/engine.getRenderHeight()*canvas.clientHeight,width:viewport.width/engine.getRenderWidth()*canvas.clientWidth,height:viewport.height/engine.getRenderHeight()*canvas.clientHeight},proxy,exact};}
 let resizePending=false;
 const resize=()=>{if(!residency.ready()){resizePending=true;return;}resizePending=false;applyRenderQuality(quality);const portrait=innerWidth<=700&&active>=0&&layout==='mission';presentation.position.y=portrait?1.9:0;mascot.scaling.setAll(active<0?1.15:portrait?.76:.86);fromTarget=camera.target.clone();fromPos=mascot.position.clone();fromRadius=camera.radius;fromAlpha=camera.alpha;fromBeta=camera.beta;responsiveCamera();transition=1;};
 responsiveCamera();if(innerWidth<=700||innerHeight<=500){camera.setTarget(toTarget.clone(),false,true,true);camera.radius=toRadius;camera.alpha=toAlpha;}
 applyRenderQuality(initialQuality);
 await startup.run('exhibits',()=>residency.initial(),17000);
 await startup.run('environment',async()=>{const error=await environmentReady;if(error)throw error;});
 engine.runRenderLoop(()=>{
  // Resolve camera inputs and scripted travel before deciding which exhibits
  // this frame needs. Retain the previous canvas while cold modules arrive.
  if(residency.ready()){
   if(resizePending)resize();
   camera.update();
   updateFrame();
  }
  residency.refresh();
  if(!residency.canRender()){qualityAdvice.suspend();return;}
  engine.restoreDefaultFramebuffer();engine.setViewport(new Viewport(0,0,1,1));engine.clear(scene.clearColor,true,true,true);
  scene.render(false);
  presented={active,transition};
  qualityAdvice.sample(performance.now(),adviceReady&&!paused&&!document.hidden&&mascotDetail.isSettled()&&architectureDetail.isSettled(),quality,`${engine.getRenderWidth()}x${engine.getRenderHeight()}`);
 });window.addEventListener('resize',resize);startupCleanup.push(()=>window.removeEventListener('resize',resize));
 await startup.run('graphics-ready',()=>scene.whenReadyAsync());adviceReady=true;startupCleanup.length=0;
 return {
  travel,restoreView,gesture,retryExhibit:residency.retry,setCapstone:(s:any,visible:boolean)=>{cedarExhibit.setState(s);cedarExhibit.setEnabled(visible);handoffExhibit.setEnabled(!visible);},setHandoff:handoffExhibit.setState,setAutomation:automationExhibit.setState,setTools:toolExhibit.setState,setSteering:steeringExhibit.setState,setReview:reviewExhibit.setState,setPermissions:permissionExhibit.setState,setModels:modelExhibit.setState,setContext:contextExhibit.setState,setBranches:branchExhibit.setState,setLessonState:(index:number,selected:string[],feedback:string|null,step:number)=>{if(index===0)harness.setState(selected,feedback==='correct',step);},setLayout:(value:string)=>{layout=value;responsiveCamera();},
  syncCompleted:(indices:number[])=>{statusLamps.forEach((lamp,i)=>lamp.material=indices.includes(i)?mint:wingColors[Math.floor(i/4)]);},
  complete:(i:number)=>{statusLamps[i].material=mint;gesture('Celebrate');},
  pause:(v:boolean)=>{paused=v;qualityAdvice.suspend();result.animationGroups.forEach(a=>{if(v)a.pause();else if((a===clip||a===previousClip)&&!reduced)a.play(true);});},
  setReduced:(v:boolean)=>{reduced=v;if(v){result.animationGroups.forEach(a=>a.pause());if(transition>0)transition=1;}else if(!paused){clip?.play(true);previousClip?.play(true);}},
  setQuality:(v:string)=>{const q:MascotDetail=v==='balanced'?'balanced':'high';applyRenderQuality(q);mascotDetail.select(q);void architectureDetail.select(q);},
  resetCamera:()=>travel(active),
  state:()=>({qualityAdvice:qualityAdvice.state(),presented,residency:residency.state(),renderAudit:renderAudit?{...renderAudit(),finishing:{quality:pipelineQuality,cameraSlots:camera._postProcesses.length,activeEffects:camera._postProcesses.filter(Boolean).length,registeredEffects:scene.postProcesses.length}}:null,ready:scene.isReady()&&residency.ready(),renderSize:{width:engine.getRenderWidth(),height:engine.getRenderHeight(),cssWidth:canvas.clientWidth,cssHeight:canvas.clientHeight,dpr:window.devicePixelRatio},lastPick,active,quality,paused,reduced,mascotDetail:mascotDetail.state(),architecture:{staticShadows:staticShadows.state(),detail:architectureDetail.state(),textureCompression:architectureTextures,ready:architecture.meshes.length>0,meshes:architecture.meshes.length,lightmaps:Object.keys(lightmaps)},capstone:cedarExhibit.state(),handoff:handoffExhibit.state(),automation:automationExhibit.state(),tools:toolExhibit.state(),steering:steeringExhibit.state(),review:reviewExhibit.state(),permissions:permissionExhibit.state(),models:modelExhibit.state(),harness:harness.state(),context:contextExhibit.state(),branches:branchExhibit.state(),drawCalls:instrumentation.drawCallsCounter.current,renderFrameMs:instrumentation.frameTimeCounter.current,meshes:scene.meshes.length,triangles:scene.getActiveIndices()/3,animations:result.animationGroups.map(g=>g.name),animationPlaying:result.animationGroups.some(g=>g.isPlaying),gesture:clip?.name,blending:!!previousClip,transition,frameMs:[...frameMs],camera:{alpha:camera.alpha,beta:camera.beta,radius:camera.radius,target:camera.target.asArray(),visibility:cameraVisibility()},mascot:{x:mascot.position.x,y:mascot.position.y,z:mascot.position.z,displayLift:presentation.position.y*mascot.scaling.x}}),
  dispose:()=>{window.removeEventListener('resize',resize);residency.dispose();mascotDetail.dispose();pip.dispose();instrumentation.dispose();scene.dispose();engine.dispose();}
 };
 }catch(error){startup.fail(error);for(const clean of startupCleanup)clean();scene.dispose();engine.dispose();startup.note('world-disposed');throw error;}
}
export type World=Awaited<ReturnType<typeof createWorld>>;
