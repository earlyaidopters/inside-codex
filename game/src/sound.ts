import narrationCatalog from './narration.json';
import {defaultAudio,normalizeAudio} from './audio-settings.mjs';
type Channel='voice'|'music'|'ambience'|'effects';
type Levels=Record<Channel,number>;
type Loop={source:AudioBufferSourceNode;gain:GainNode;id:string};
export class TourSound {
 private context?:AudioContext;
 private master?:GainNode;
 private meter?:AnalyserNode;
 private limiter?:DynamicsCompressorNode;
 private buses:Partial<Record<Channel,GainNode>>={};
 private levels=defaultAudio() as Levels;
 private muted=true;
 private paused=false;
 private hidden=false;
 private disposed=false;
 private wing=0;
 private buffers=new Map<string,Promise<AudioBuffer|null>>();
 private decoded=new Map<string,AudioBuffer>();
 private loadingLoops=new Set<string>();
 private loops=new Map<'music'|'ambience',Loop>();
 private retiring=new Set<Loop>();
 private shots=new Set<AudioBufferSourceNode>();
 private voice?:AudioBufferSourceNode;
 private voiceMessage='';
 private voiceTicket=0;

 private caption='';
 private failures:string[]=[];
 private lastCueAt=-10;
 constructor(private onCaption:(text:string)=>void,private onStatus:(text:string)=>void){}
 private get silent(){return this.muted||this.paused||this.hidden||this.disposed;}
 configure(settings:{muted:boolean;audio?:unknown}){
  this.muted=settings.muted;this.levels=normalizeAudio(settings.audio) as Levels;
  if(this.muted||!this.levels.voice)this.stopVoice();
  this.mix();this.syncTransport();
 }
 private mix(){
  if(!this.context||!this.master)return;const t=this.context.currentTime;
  this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(this.silent?0:1,t,.012);
  for(const channel of ['voice','music','ambience','effects'] as const){const bus=this.buses[channel];if(!bus)continue;const duck=this.caption&&(channel==='music'||channel==='ambience')?.24:1;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(this.levels[channel]*duck,t,this.caption?.08:.35);}
 }
 async activate(){
  if(this.muted||this.disposed)return;
  try{
   if(!this.context){this.context=new AudioContext();this.master=this.context.createGain();this.master.gain.value=0;this.limiter=this.context.createDynamicsCompressor();this.limiter.threshold.value=-3;this.limiter.knee.value=0;this.limiter.ratio.value=20;this.limiter.attack.value=.001;this.limiter.release.value=.12;this.master.connect(this.limiter);if(new URLSearchParams(location.search).has('audioAudit')){this.meter=this.context.createAnalyser();this.meter.fftSize=256;this.limiter.connect(this.meter);this.meter.connect(this.context.destination);}else this.limiter.connect(this.context.destination);
    for(const key of ['voice','music','ambience','effects'] as const){const gain=this.context.createGain();gain.gain.value=0;gain.connect(this.master);this.buses[key]=gain;}}
   this.mix();this.syncTransport();await this.ensureLoops();
  }catch{this.onStatus('Sound is unavailable in this browser. All instructions remain in the lesson.');}
 }
 private syncTransport(){
  if(!this.context)return;
  const operation=this.silent?this.context.suspend():this.context.resume();void operation.catch(()=>{});
  if(!this.silent)void this.ensureLoops();
 }
 private async load(id:string){
  if(!this.context||this.disposed)return null;
  if(!this.buffers.has(id)){const context=this.context;const promise=(async()=>{
   try{const response=await fetch(`/assets/audio/${id}.mp3`);if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.arrayBuffer();if(this.disposed)return null;const buffer=await context.decodeAudioData(data);if(this.disposed)return null;this.decoded.set(id,buffer);const voices=[...this.decoded.keys()].filter(key=>key.startsWith('voice/'));while(voices.length>4){const oldest=voices.shift()!;this.decoded.delete(oldest);this.buffers.delete(oldest);}return buffer;}
   catch{if(!this.disposed){this.failures.push(id);this.onStatus('A sound could not load. The tour remains playable; use Retry sound in Settings.');}this.buffers.delete(id);return null;}
  })();this.buffers.set(id,promise);}
  return this.buffers.get(id)!;
 }
 private async ensureLoops(){
  if(!this.context||this.silent)return;
  await Promise.all([this.ensureLoop('music','headquarters-score'),this.ensureLoop('ambience',`wing-${this.wing}`)]);
 }
 private async ensureLoop(channel:'music'|'ambience',id:string){
  if(!this.context||!this.levels[channel]||this.loops.get(channel)?.id===id||this.loadingLoops.has(id))return;
  this.loadingLoops.add(id);const buffer=await this.load(id);this.loadingLoops.delete(id);
  if(!buffer||this.silent||!this.context||!this.levels[channel]||(channel==='ambience'&&id!==`wing-${this.wing}`))return;
  const old=this.loops.get(channel);if(old?.id===id)return;const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;source.connect(gain);gain.connect(this.buses[channel]!);const t=this.context.currentTime;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(1,t+1.2);source.start();this.loops.set(channel,{source,gain,id});
  if(old){this.retiring.add(old);old.gain.gain.cancelScheduledValues(t);old.gain.gain.setValueAtTime(old.gain.gain.value,t);old.gain.gain.linearRampToValueAtTime(0,t+1.2);old.source.onended=()=>{old.source.disconnect();old.gain.disconnect();this.retiring.delete(old);};old.source.stop(t+1.25);}
 }
 setWing(wing:number){this.wing=Math.max(0,Math.min(2,wing));this.stopVoice();void this.ensureLoops();}
 pause(value:boolean){this.paused=value;this.mix();this.syncTransport();}
 visibility(value:boolean){this.hidden=value;this.mix();this.syncTransport();}
 async cue(id:'select'|'success'|'reconsider'|'travel'){
  if(this.silent||!this.levels.effects)return;void this.activate();if(this.silent||!this.context)return;
  const now=this.context.currentTime;if(id==='select'&&now-this.lastCueAt<.06)return;this.lastCueAt=now;
  const ticket=this.voiceTicket,buffer=await this.load(id);if(!buffer||this.silent||!this.context||(!this.levels.effects)||id==='travel'&&ticket!==this.voiceTicket)return;
  const source=this.context.createBufferSource();source.buffer=buffer;source.connect(this.buses.effects!);this.shots.add(source);source.onended=()=>{source.disconnect();this.shots.delete(source);};source.start();
 }
 speak(text:string){
  this.stopVoice();if(this.silent||!this.levels.voice)return;
  const segments=(narrationCatalog as Record<string,{text:string;id:string}[]>)[text];
  if(!segments){this.onStatus('This line has no voice recording yet. The guide text is available in the lesson.');return;}
  this.voiceMessage=text;const ticket=this.voiceTicket;void this.activate();void this.playSegment(segments,0,ticket);
 }
 private async playSegment(segments:{text:string;id:string}[],index:number,ticket:number){
  if(ticket!==this.voiceTicket||this.muted||this.disposed)return;
  if(index>=segments.length){this.voice=undefined;this.voiceMessage='';this.caption='';this.onCaption('');this.mix();return;}
  const segment=segments[index],buffer=await this.load(segment.id);
  if(ticket!==this.voiceTicket||this.muted||this.disposed)return;
  if(!buffer||!this.context){this.caption='';this.onCaption('');this.mix();return;}
  const voice=this.context.createBufferSource();voice.buffer=buffer;voice.connect(this.buses.voice!);this.voice=voice;
  this.caption=segment.text;this.onCaption(segment.text);this.mix();
  voice.onended=()=>{voice.disconnect();if(ticket!==this.voiceTicket)return;this.voice=undefined;void this.playSegment(segments,index+1,ticket);};voice.start();
 }
 stopVoice(){this.voiceTicket++;if(this.voice){this.voice.onended=null;try{this.voice.stop();}catch{}this.voice.disconnect();}this.voice=undefined;this.voiceMessage='';this.caption='';this.onCaption('');this.mix();}
 retry(){this.failures=[];this.onStatus('');const text=this.voiceMessage;void this.activate();if(text)this.speak(text);}
 state(){const samples=new Float32Array(256);this.meter?.getFloatTimeDomainData(samples);const outputRms=this.context?.state==='running'?Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length):0;return {outputRms,limiterReduction:this.limiter?.reduction??0,time:this.context?.currentTime??0,voiceActive:!!this.voice,unlocked:!!this.context,context:this.context?.state??'locked',muted:this.muted,paused:this.paused,hidden:this.hidden,levels:{...this.levels},voiceBackend:'recorded-kokoro-v1',voiceMessage:this.voiceMessage,caption:this.caption,wing:this.wing,loops:[...this.loops.values()].map(x=>x.id),retiring:this.retiring.size,shots:this.shots.size,pending:[...this.loadingLoops],failures:[...this.failures],buffers:[...this.decoded].map(([id,b])=>({id,duration:b.duration,channels:b.numberOfChannels,samples:b.length,rate:b.sampleRate})),gains:Object.fromEntries(Object.entries(this.buses).map(([k,v])=>[k,v?.gain.value])),master:this.master?.gain.value??0};}
 dispose(){this.disposed=true;this.stopVoice();for(const x of [...this.loops.values(),...this.retiring]){x.source.onended=null;try{x.source.stop();}catch{}x.source.disconnect();x.gain.disconnect();}for(const s of this.shots){s.onended=null;try{s.stop();}catch{}s.disconnect();}this.loops.clear();this.retiring.clear();this.shots.clear();this.decoded.clear();this.buffers.clear();void this.context?.close().catch(()=>{});}
}
