import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {atlas,searchAtlas,atlasMarkdown,ATLAS_DATE} from '../src/atlas.mjs';
import {starterFiles} from '../src/resources.mjs';
import {freshProgress} from '../src/learning.mjs';
import {lessons} from '../src/content.ts';

test('Every field note links to a pinned source and declares date, surface, prerequisites and evidence scope',()=>{
 const captures=JSON.parse(fs.readFileSync('../production/sources/atlas-2026-09-10/manifest.json','utf8'));
 assert(atlas.length>=30);assert.equal(new Set(atlas.map(e=>e.id)).size,atlas.length);
 for(const e of atlas){
  const capture=captures.find(c=>c.source===e.source);assert(capture,`No source capture for ${e.id}`);
  const bytes=fs.readFileSync('../'+capture.file);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),capture.sha256);
  assert.equal(e.verifiedAt,ATLAS_DATE);assert(e.surfaces.length);assert(e.prerequisites.length>25);assert(e.evidence.length>25);assert(e.example.length>30);
  assert(['official','installation'].includes(e.claim));assert(e.mission>=0&&e.mission<12);
 }
});
test('Surface filters preserve documented product distinctions',()=>{
 const cli=searchAtlas('','Tools','CLI').map(e=>e.id),ide=searchAtlas('','Tools','IDE').map(e=>e.id);
 assert(cli.includes('mcp'));assert(!cli.includes('browser'));assert(!cli.includes('computer-use'));
 assert(ide.includes('skills'));assert(ide.includes('image-generation'));assert(!ide.includes('plugins'));
 assert.equal(searchAtlas('experimental context')[0].id,'context-management');
 assert.equal(searchAtlas('Astra','Models').length,1);
 assert.equal(atlas.filter(e=>e.category==='Models'&&e.title.startsWith('GPT-')).length,6);
 assert.equal(atlas.find(e=>e.id==='ask-for-workspace').claim,'installation');
 assert(atlas.find(e=>e.id==='ask-for-workspace').evidence.includes('not a fresh execution test'));
});
test('The portable field notes include the full catalog, sources and installation caveats',()=>{
 const text=atlasMarkdown();for(const e of atlas){assert(text.includes('## '+e.title));assert(text.includes(e.source));}
 assert(text.includes('Installation capability'));assert.equal(starterFiles(freshProgress(),lessons)['FIELD-NOTES.md'],text);
});
