import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
const source='node_modules/meshoptimizer/meshopt_decoder.cjs',destination='public/assets/decoders/meshopt-decoder-1.2.0-codex1.js';
const original=await fs.readFile(source,'utf8');let text=original;
function patch(before,after){assert.equal(text.split(before).length,2,'Vendor patch no longer matches exactly');text=text.replace(before,after);}
patch('function createWorker(url) {','function createWorker(url, releaseUrl) {\n\t\tvar released = false;\n\t\tfunction loaded() { if (!released) { released = true; releaseUrl(); } }');
patch('\t\t\tpending: 0,','\t\t\tpending: 0,\n\t\t\treleaseUrl: loaded,\n\t\t\tfailed: null,');
patch('\t\t\tvar data = event.data;\n\n\t\t\tworker.pending', '\t\t\tvar data = event.data;\n\t\t\tif (data.action === "worker-ready") { loaded(); return; }\n\n\t\t\tworker.pending');
patch('\t\treturn worker;','\t\tworker.object.onerror = function (event) {\n\t\t\tloaded();\n\t\t\tworker.failed = new Error("Meshopt worker failed to load");\n\t\t\tfor (var id in worker.requests) worker.requests[id].reject(worker.failed);\n\t\t\tworker.requests = {}; worker.pending = 0;\n\t\t\tworker.object.terminate();\n\t\t\tevent.preventDefault();\n\t\t};\n\t\treturn worker;');
patch('\t\t\tworkerProcess.toString();','\t\t\tworkerProcess.toString() + \';self.postMessage({action:"worker-ready"});\';');
patch('\t\tvar url = URL.createObjectURL(blob);','\t\tvar url = URL.createObjectURL(blob);\n\t\tvar remaining = Math.max(0, count - workers.length);\n\t\tfunction releaseUrl() { if (--remaining === 0) URL.revokeObjectURL(url); }\n\t\tif (remaining === 0) URL.revokeObjectURL(url);');
patch('workers[i] = createWorker(url);','workers[i] = createWorker(url, releaseUrl);');
patch('\t\t\tworkers[i].object.postMessage({});','\t\t\tworkers[i].releaseUrl();\n\t\t\tworkers[i].object.postMessage({});');
patch('\n\t\tURL.revokeObjectURL(url);\n\t}', '\n\t}');
patch('\t\treturn new Promise(function (resolve, reject) {','\t\tif (worker.failed) return Promise.reject(worker.failed);\n\t\treturn new Promise(function (resolve, reject) {');
patch('return decodeWorker(count, size, source, decoders[mode], filters[filter]);','return decodeWorker(count, size, source, decoders[mode], filters[filter]).catch(function () {\n\t\t\t\t\treturn ready.then(function () {\n\t\t\t\t\t\tvar target = new Uint8Array(count * size);\n\t\t\t\t\t\tdecode(instance, instance.exports[decoders[mode]], target, count, size, source, instance.exports[filters[filter]]);\n\t\t\t\t\t\treturn target;\n\t\t\t\t\t});\n\t\t\t\t});');
text='// Local codex1 patch: retain worker blob URLs until every worker acknowledges loading; propagate worker failures and use the existing scalar decoder as recovery. Codec/WASM bytes are unchanged.\n'+text;
await fs.writeFile(destination,text);
const hash=x=>createHash('sha256').update(x).digest('hex');
await fs.writeFile('../evidence/production/startup-v1/decoder-vendoring.json',JSON.stringify({source,sourceSha256:hash(original),destination,sha256:hash(text),version:'meshoptimizer 1.2.0 + codex1 worker-lifecycle patch',license:'MIT; public/assets/decoders/MESHOPT-LICENSE.md',scope:'Worker URL lifetime and error delivery only. No codec algorithm or WASM byte changes. Reproduction asserts every source replacement exactly once.'},null,2));console.log(JSON.stringify({destination,bytes:Buffer.byteLength(text),sha256:hash(text)}));
