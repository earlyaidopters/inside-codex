import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeProgress,freshProgress} from '../src/learning.mjs';
import {normalizeAudio} from '../src/audio-settings.mjs';
test('Old saves retain mute and receive independent audio defaults',()=>{const p=normalizeProgress({version:1,completed:[3],settings:{muted:false}});assert(!p.settings.muted);assert.deepEqual(p.settings.audio,{voice:.9,music:.22,ambience:.2,effects:.55});assert.deepEqual(p.completed,[3]);});
test('Imported volume values are bounded and cannot introduce channels',()=>{assert.deepEqual(normalizeAudio({voice:Infinity,music:-1,ambience:9,effects:'loud',extra:1}),{voice:.9,music:0,ambience:1,effects:.55});});
test('Independent zero volumes survive save export and import',()=>{const p=freshProgress();p.settings.audio={voice:0,music:.4,ambience:0,effects:.8};assert.deepEqual(normalizeProgress(JSON.parse(JSON.stringify(p))).settings.audio,p.settings.audio);});
