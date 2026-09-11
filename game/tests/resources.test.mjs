import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {starterFiles} from '../src/resources.mjs';
import {freshProgress,createPracticeTask} from '../src/learning.mjs';
import {lessons} from '../src/content.ts';

test('Starter package preserves the player brief and makes hint-assisted practice visible',()=>{
 const progress=freshProgress();
 progress.workspace=createPracticeTask(progress.workspace,{title:'Approval audit',brief:'Inspect the saved approval checklist and compare each required field against the current client brief.',effort:'medium',pin:true});
 progress.completed=[0];progress.hints={'harness.0':1};progress.capstone=[true,false,true];
 const files=starterFiles(progress,lessons);
 assert.equal(JSON.parse(files['MY-WORKFLOW.json']).brief,progress.workspace.tasks[0].brief);
 assert(files['MY-WORKFLOW.md'].includes('medium'));
 assert(files['CODEX-TOOLKIT.md'].includes('completed (used a hint)'));
 assert(files['CODEX-TOOLKIT.md'].includes('Earlier choice exercise: 2/5 checks'));
 assert(files['.agents/skills/northstar-onboarding/SKILL.md'].includes('checks/verify_onboarding.py'));
 assert(files['AGENTS.md'].includes('CLIENT-BRIEF.md'));
 assert(!files['MY-WORKFLOW.md'].includes('Example workflow'));
 assert(starterFiles(freshProgress(),lessons)['MY-WORKFLOW.md'].includes('Example workflow'));
});

test('The packaged acceptance check reproduces the defect, verifies its repair, and rejects collateral damage',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'inside-codex-starter-'));
 try{
  const files=starterFiles(freshProgress(),lessons);
  for(const [name,text] of Object.entries(files)){const target=path.join(dir,name);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,text);}
  const check=()=>spawnSync('python3',['checks/verify_onboarding.py'],{cwd:dir,encoding:'utf8'});
  let result=check();assert.equal(result.status,1);assert(result.stdout.includes('approval_owner'));
  const repaired=files['onboarding.csv'].replace('requested,\n','requested,Nina Patel\n');
  await fs.writeFile(path.join(dir,'onboarding.csv'),repaired);
  result=check();assert.equal(result.status,0,result.stderr||result.stdout);assert(result.stdout.includes('CHECK PASSED'));
  await fs.writeFile(path.join(dir,'onboarding.csv'),repaired.replace('scheduled','cancelled'));
  result=check();assert.equal(result.status,1);assert(result.stdout.includes('kickoff'));
  await fs.writeFile(path.join(dir,'onboarding.csv'),repaired+repaired.split('\n')[1]+'\n');
  result=check();assert.equal(result.status,1);assert(result.stdout.includes('Expected one record'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
