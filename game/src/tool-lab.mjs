export const toolBriefs={northstar:{client:'Northstar Studio',kickoff:'scheduled',files:'requested',approval_owner:'Nina Patel'},harbor:{client:'Harbor Analytics',kickoff:'requested',files:'approved',approval_owner:'Amir Chen'}};
export const projectRules='Write UTF-8 CSV with exactly client,kickoff,files,approval_owner. Preserve the current brief’s values. Never infer the approval owner from an earlier client. Read the saved file back and compare every field with its source. Missing fields require clarification.';
export const toolSkills={example:{name:'Copy the first checklist',description:'Create an onboarding CSV using the first successful example.',body:'Read the current brief. Copy its client, kickoff and files. Set approval_owner to Nina Patel, the approver in our first example. Save CSV and check it.'},reusable:{name:'Onboarding from the current brief',description:'Use when an approved client brief must become a checked onboarding CSV. Requires document-reading access; does not grant it.',body:'Read the applicable AGENTS.md and the current approved brief through an available document-reading tool. Require client, kickoff, files and approval_owner. Copy every value from that brief, including its approval owner. Write the required CSV. Read it back and compare all fields against the same source. Report missing data or unavailable access; do not guess.'}};
export const csvFor=b=>'client,kickoff,files,approval_owner\n'+[b.client,b.kickoff,b.files,b.approval_owner].join(',')+'\n';
export const freshTools=()=>({section:'connect',package:'source',inspected:[],installed:null,scope:'training',connected:false,guidanceRead:false,skill:'example',loaded:[],client:'northstar',reads:{},outputs:{},revision:1,failureSeen:false,actions:[],events:[],message:'Two client briefs are in a fictional document service. Inspect the plugin, connect its reading tool, then test the bundled procedure.'});
const note=(s,message)=>{s.message=message;s.events.push(message);s.events=s.events.slice(-60);};
const names=['inspect-package','install','scope','connect','disconnect','guidance','load-skill','client','read','run','verify'];
export function toolAction(input,action,value){
 if(action==='restart')return freshTools();const s=structuredClone(input);
 if(action==='section'&&['connect','procedure','results'].includes(value)){s.section=value;return s;}
 if(!names.includes(action))return s;
 if(['inspect-package','install'].includes(action)&&!['source','notes'].includes(value))return s;
 if(action==='scope'&&!['training','workspace'].includes(value))return s;
 if(action==='load-skill'&&!Object.hasOwn(toolSkills,value))return s;
 if(action==='client'&&!Object.hasOwn(toolBriefs,value))return s;
 if(s.actions.length>=120){s.message='This rehearsal has reached its history limit. Restart to try another setup.';return s;}
 s.actions.push({action,...(value===undefined?{}:{value})});
 if(action==='inspect-package'){s.package=value;if(!s.inspected.includes(value))s.inspected.push(value);note(s,value==='source'?'Source Kit contains a document connector (list documents, read document) and two onboarding skills. No mail or document-write tool is included.':'Procedure Kit contains the same two skills. It has no connector or document-reading tool. Instructions alone do not retrieve a remote brief.');}
 if(action==='install'){
  if(!s.inspected.includes(value)){note(s,'Inspect this package’s contents and access before installing it in the rehearsal.');return s;}
  if(s.installed!==value){s.installed=value;s.connected=false;s.reads={};s.outputs={};s.revision++;}note(s,value==='source'?'Source Kit installed in the rehearsal. Its connector still needs an account connection.':'Procedure Kit installed. Skills are available; remote document tools are absent.');
 }
 if(action==='scope'){s.scope=value;s.connected=false;note(s,'Connection scope changed. Reconnect to apply it; saved local artifacts remain available.');}
 if(action==='connect'){
  if(s.installed!=='source'){note(s,'No document connector is installed. A skill cannot supply the missing read tool.');return s;}
  s.connected=true;note(s,s.scope==='training'?'Connected to Training briefs: read-only access to Northstar and Harbor.':'Connected with workspace-wide read access. It works, but this job only needs Training briefs.');
 }
 if(action==='disconnect'){s.connected=false;note(s,'Document service disconnected. Already read copies and local files remain; fresh remote reads need reconnection.');}
 if(action==='guidance'){s.guidanceRead=true;note(s,'Read project guidance: preserve current source values, save the required CSV and verify the saved file.');}
 if(action==='load-skill'){
  if(!s.installed){note(s,'Install a package before loading its skill instructions.');return s;}
  if(s.skill!==value){s.skill=value;s.revision++;}if(!s.loaded.includes(value))s.loaded.push(value);note(s,'Loaded full instructions: '+toolSkills[value].name+'. Earlier output files retain their original procedure revision.');
 }
 if(action==='client'){s.client=value;note(s,'Selected '+toolBriefs[value].client+'. Its current source copy and saved output are shown separately.');}
 if(action==='read'){
  if(s.installed!=='source'||!s.connected){note(s,'Read failed: document tool is unavailable or disconnected. No source was invented.');return s;}
  s.reads[s.client]={...toolBriefs[s.client]};note(s,'read_document returned the approved '+toolBriefs[s.client].client+' brief. This copy is now available locally.');
 }
 if(action==='run'){
  if(!s.reads[s.client]){note(s,'No current brief has been retrieved for this client. Read it before running the procedure.');return s;}
  if(!s.guidanceRead||!s.loaded.includes(s.skill)){note(s,'Read the project guidance and load the selected skill’s full instructions first.');return s;}
  const b={...s.reads[s.client]};if(s.skill==='example')b.approval_owner='Nina Patel';
  s.outputs[s.client]={revision:s.revision,skill:s.skill,csv:csvFor(b),checked:false,checks:[]};note(s,'Saved '+s.client+'.csv using '+toolSkills[s.skill].name+'. The file has not been verified.');
 }
 if(action==='verify'){
  const o=s.outputs[s.client];if(!o){note(s,'There is no saved file to read back for this client.');return s;}
  const expected=toolBriefs[s.client],rows=o.csv.trimEnd().split('\n'),values=rows[1]?.split(',')??[];
  o.checks=[{name:'CSV schema',pass:rows.length===2&&rows[0]==='client,kickoff,files,approval_owner'&&values.length===4},...Object.entries(expected).map(([key,v],i)=>({name:key,pass:values[i]===v,expected:v,actual:values[i]??''}))];o.checked=o.checks.every(c=>c.pass);
  if(!o.checked)s.failureSeen=true;note(s,o.checked?'Saved file matches every source field. '+(o.revision===s.revision?'This procedure revision is checked for this client.':'It uses an older procedure revision; rerun with the current skill.'):'Read-back found a mismatch: '+o.checks.filter(c=>!c.pass).map(c=>c.name+' expected '+c.expected+', got '+c.actual).join(';')+'.');
 }
 return s;
}
export function toolChecks(s){return [
 {name:'Source Kit inspected and connected to Training briefs',pass:s.installed==='source'&&s.inspected.includes('source')&&s.connected&&s.scope==='training'},
 {name:'Project rules and reusable skill read',pass:s.guidanceRead&&s.skill==='reusable'&&s.loaded.includes('reusable')},
 {name:'The example’s hidden defect was reproduced',pass:s.failureSeen},
 ...Object.entries(toolBriefs).map(([id,b])=>({name:b.client+' verified with the current procedure',pass:!!s.outputs[id]?.checked&&s.outputs[id].revision===s.revision&&s.outputs[id].skill==='reusable'&&s.outputs[id].csv===csvFor(b)}))
 ];}
export const toolPass=s=>!!s&&toolChecks(s).every(c=>c.pass===true);
export const toolReceipt=s=>toolPass(s)?{version:1,simulation:true,actions:s.actions,scope:s.scope,skill:s.skill,outputs:s.outputs,events:s.events,checks:toolChecks(s)}:null;
export function normalizeToolReceipt(r){if(r?.version!==1||r.simulation!==true||!Array.isArray(r.actions)||r.actions.length>120)return null;let s=freshTools();for(const a of r.actions){if(!a||!names.includes(a.action)||Object.keys(a).some(k=>!['action','value'].includes(k))||(a.value!==undefined&&(typeof a.value!=='string'||a.value.length>24)))return null;s=toolAction(s,a.action,a.value);}const v=toolReceipt(s);return v&&JSON.stringify(v)===JSON.stringify(r)?v:null;}
export const reusableSkillFile=()=>`---\nname: approved-brief-to-csv\ndescription: Convert an approved client onboarding brief into a checked CSV. Use for onboarding exports with client, kickoff, files and approval_owner fields. Requires an available source-reading tool or supplied file.\n---\n\n${toolSkills.reusable.body}\n\nFollow the applicable project guidance. Tool names depend on the installed connector; inspect the available read tool and its scope. Never include credentials in this skill. Test a fresh client with a different approval owner before reusing the workflow.\n\nExpected output: client,kickoff,files,approval_owner header and one source-grounded row. Return the saved file, source identity and verification result. Missing access or fields are explicit failures, never invented values.\n`;
export const toolCheckScript=`from pathlib import Path
import csv
import json
import sys

root = Path(__file__).resolve().parent
sources = json.loads((root / "source-briefs.json").read_text(encoding="utf-8"))
columns = ["client", "kickoff", "files", "approval_owner"]
failures = []
for client, expected in sources.items():
    with (root / (client + ".csv")).open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        if reader.fieldnames != columns or len(rows) != 1 or rows[0] != expected:
            failures.append(client)
if failures:
    print("FAIL: saved files differ from their source: " + ", ".join(failures))
    sys.exit(1)
print("PASS: both saved CSV files match every source field.")
`;
export function toolFiles(r){return {'tool-workshop/check.py':toolCheckScript,'tool-workshop/northstar.csv':r.outputs.northstar.csv,'tool-workshop/harbor.csv':r.outputs.harbor.csv,'tool-workshop/source-briefs.json':JSON.stringify(toolBriefs,null,2)+'\n','tool-workshop/AGENTS.md':projectRules+'\n','tool-workshop/.agents/skills/approved-brief-to-csv/SKILL.md':reusableSkillFile(),'tool-workshop/rehearsal.json':JSON.stringify(r,null,2)+'\n','tool-workshop/READ-ME.md':'# A workflow that travels\n\nThese are fictional training records, not live client data. Source Kit and Procedure Kit are teaching fixtures, not installable real plugins. No account was connected by this webpage.\n\nA plugin packages capabilities. A connector exposes available tools. A read tool retrieves a source. A skill describes a repeatable procedure. AGENTS.md supplies project guidance. Inspect the actual installed tools and access in your Codex environment before using this skill.\n\nRun `python3 check.py` from this folder to check the actual CSV files against source-briefs.json. The checker uses only the Python standard library.\n\nYour two CSV files were verified against different source owners. The first example had hard-coded Nina Patel; the reusable procedure reads each current owner. This deterministic rehearsal does not establish real-model skill triggering or general reliability. Test the exported skill in your own environment with new examples.\n\nOfficial sources checked September 10, 2026:\nhttps://learn.chatgpt.com/docs/build-skills\nhttps://learn.chatgpt.com/docs/customization/overview\n'};}
