const B=window.BABYLON;
const canvas=document.querySelector('canvas');
const engine=new B.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true,powerPreference:'high-performance'});
engine.setHardwareScalingLevel(1/Math.min(window.devicePixelRatio,1.5));
const scene=new B.Scene(engine);
scene.useRightHandedSystem=true;
scene.clearColor=new B.Color4(.055,.082,.106,1);
scene.imageProcessingConfiguration.toneMappingEnabled=true;
scene.imageProcessingConfiguration.toneMappingType=B.ImageProcessingConfiguration.TONEMAPPING_ACES;
scene.imageProcessingConfiguration.exposure=1.35;
scene.imageProcessingConfiguration.contrast=1.08;
const camera=new B.ArcRotateCamera('Viewer camera',Math.PI/2-.5,1.08,7,new B.Vector3(0,.72,0),scene);
camera.attachControl(canvas,true);camera.lowerRadiusLimit=4.5;camera.upperRadiusLimit=10;camera.lowerBetaLimit=.38;camera.upperBetaLimit=1.48;camera.wheelPrecision=45;camera.panningSensibility=0;
const hemi=new B.HemisphericLight('Ambient',new B.Vector3(0,1,0),scene);hemi.intensity=.85;hemi.diffuse=new B.Color3(.72,.88,1);hemi.groundColor=new B.Color3(.15,.20,.23);
const key=new B.DirectionalLight('Warm key',new B.Vector3(-.5,-1,-.5),scene);key.position=new B.Vector3(4,6,4);key.intensity=3.5;key.diffuse=new B.Color3(1,.85,.68);
const fill=new B.PointLight('Cool rim',new B.Vector3(-2,3,-2),scene);fill.intensity=38;fill.diffuse=new B.Color3(.30,.75,1);
const shadow=new B.ShadowGenerator(2048,key);shadow.usePercentageCloserFiltering=true;shadow.bias=.0008;shadow.normalBias=.025;
let ready=false,paused=false,evening=false,frames=0,frameTimes=[];
const errors=[];window.addEventListener('error',e=>errors.push(e.message));window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
const pauseButton=document.querySelector('#pause');
const lightingButton=document.querySelector('#lighting');
const groups=[];
function updateButtons(){pauseButton.textContent=paused?'Resume animation':'Pause animation';lightingButton.textContent=evening?'Studio lighting':'Evening lighting';}
function pause(){if(!ready)return;paused=!paused;groups.forEach(g=>paused?g.pause():g.play(true));updateButtons();}
function lighting(){if(!ready)return;evening=!evening;key.intensity=evening?1.1:3.5;hemi.intensity=evening?.35:.85;fill.intensity=evening?55:38;scene.clearColor=evening?new B.Color4(.026,.035,.072,1):new B.Color4(.055,.082,.106,1);updateButtons();}
function reset(){if(!ready)return;camera.setTarget(new B.Vector3(0,.72,0));camera.alpha=Math.PI/2-.5;camera.beta=1.08;camera.radius=7;camera.inertialAlphaOffset=0;camera.inertialBetaOffset=0;camera.inertialRadiusOffset=0;if(evening)lighting();paused=false;groups.forEach(g=>{g.reset();g.play(true)});updateButtons();}
pauseButton.addEventListener('click',pause);lightingButton.addEventListener('click',lighting);document.querySelector('#reset').addEventListener('click',reset);
document.addEventListener('keydown',e=>{if(e.repeat)return;if(e.key.toLowerCase()==='p')pause();if(e.key.toLowerCase()==='r')reset();});
function resize(){camera.fovMode=window.innerWidth/window.innerHeight<.8?B.Camera.FOVMODE_HORIZONTAL_FIXED:B.Camera.FOVMODE_VERTICAL_FIXED;engine.resize();}
window.addEventListener('resize',resize);resize();
window.__smoke={getState(){return {ready,paused,evening,frames,errors:[...errors],meshes:scene.meshes.filter(m=>m.getTotalVertices()>0).length,vertices:scene.getTotalVertices(),textures:scene.textures.filter(t=>t.getClassName()!=='RenderTargetTexture').length,textureReady:scene.textures.filter(t=>t.getClassName()!=='RenderTargetTexture').every(t=>t.isReady()),skeletons:scene.skeletons.length,animationGroups:groups.map(g=>({name:g.name,playing:g.isPlaying})),bonePose:scene.skeletons[0]?.bones.map(b=>({name:b.name,matrix:Array.from(b.getLocalMatrix().m)}))??[],camera:{alpha:camera.alpha,beta:camera.beta,radius:camera.radius},renderer:engine.getGlInfo(),renderSize:{width:engine.getRenderWidth(),height:engine.getRenderHeight()},frameMs:frameTimes.slice(-240)}}};
engine.runRenderLoop(()=>{scene.render();frames++;if(ready)frameTimes.push(engine.getDeltaTime());if(frameTimes.length>600)frameTimes.shift();});
try{
 const loaded=await B.SceneLoader.ImportMeshAsync(null,'/public/','diagnostic-scene.glb',scene);
 for(const mesh of loaded.meshes){if(mesh.getTotalVertices()){shadow.addShadowCaster(mesh);mesh.receiveShadows=true;}}
 groups.push(...loaded.animationGroups);groups.forEach(g=>g.start(true));
 await scene.whenReadyAsync();
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 ready=true;document.querySelector('#loading').hidden=true;document.querySelector('#status').classList.add('ready');document.querySelector('#statusText').textContent='Blender asset loaded';document.querySelectorAll('button').forEach(b=>b.disabled=false);
 const triangles=scene.meshes.reduce((n,m)=>n+m.getTotalIndices()/3,0);document.querySelector('#metrics').textContent=`${Math.round(triangles).toLocaleString()} triangles · ${scene.skeletons.length} rig · ${groups.length} animation`;
}catch(error){errors.push(String(error));document.querySelector('#loading').textContent='Scene failed to load. See console for details.';document.querySelector('#loading').classList.add('error');console.error(error);}
