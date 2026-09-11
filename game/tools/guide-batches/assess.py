from pathlib import Path
import hashlib, json

root = Path(__file__).resolve().parents[3]
stage = root / 'evidence/production/guide-batches-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
pre = read(stage / 'pre-capture.json')
assert pre['pass']
assert all(sha(root / 'game' / p) == h for p, h in pre['sourceSha256'].items())
goal = read(root / 'game/.game-dev/goals/skinned-guide-submissions.json')
assert goal['state']['status'] == 'met' and len(goal['state']['iterations']) == 1
comparison = read(stage / 'comparability.json')
assert comparison['pass']
runs = []
for label in ['baseline', 'candidate', 'active-high', 'active-balanced', 'warm-high']:
    verified = read(stage / (label + '-verify.json'))
    summary = read(stage / (label + '-summary.json'))
    assert verified['ok'] and summary['ok']
    data = verified['data']
    run = data['run']
    assert run['status'] == 'completed' and run['process']['exitCode'] == 0
    path = Path(data['runPath'])
    assert sha(path / 'run.json') == data['manifestSha256']
    is_active = run['scenarioId'] == 'active-scenes'
    report = read(path / ('profile.json' if is_active else 'traversal.json'))
    if label != 'baseline':
        assert report['buildId'] == comparison['candidateBuildId']
    row = dict(label=label, scenario=run['scenarioId'], runId=run['runId'],
               path=str(path), manifestSha256=data['manifestSha256'],
               metrics=summary['data']['metrics'], buildId=report['buildId'],
               quality=report['quality'], summary=report['summary'],
               powerBefore=report['powerBefore'], powerAfter=report['powerAfter'])
    if is_active:
        scene = read(path / 'scene-audit.json')
        journey = read(path / 'report.json')
        assert scene['pass'] and journey['pass'] and len(scene['cases']) == 85
        row['cases'] = [c['name'] for c in scene['cases']]
        row['maxActiveTriangles'] = max(c['audit']['activeMeshTriangles'] for c in scene['cases'])
    runs.append(row)
high, balanced = [next(r for r in runs if r['label'] == label) for label in ['active-high', 'active-balanced']]
assert high['cases'] == balanced['cases']
for r in runs[1:]:
    draw = next(m['max'] for m in r['metrics'] if m['metric'] == 'render.total_draw_calls')
    assert draw <= (180 if r['quality'] == 'high' else 100)
for label in ['candidate', 'warm-high']:
    r = next(r for r in runs if r['label'] == label)
    s = r['summary']
    assert s['intervalsOver100ms'] == 0 and s['heldRenderFrames'] == 0
    assert s['maxActiveTriangles'] <= (700000 if r['quality'] == 'high' else 250000)
    assert s['maxTextureEstimateBytes'] <= (384000000 if r['quality'] == 'high' else 160000000)
result = dict(pass_=True, scope='One closed bounded optimization plus fixed-build qualifications; not full release acceptance.',
              buildId=pre['buildId'], capturedFileSetBuildId=comparison['candidateBuildId'],
              sourceSha256=pre['sourceSha256'], changedPaths=pre['changedPaths'],
              goal=goal, checks=pre['checks'], unchangedAssetFiles=pre['unchangedAssetFiles'],
              comparison=comparison, runs=runs,
              limits=pre['limits'] + [
                  'All current runs recorded Battery Power; battery percentage and uncontrolled thermal/OS state differ. No causal timing-speedup or AC-power claim.',
                  'High traversal texture estimate is 342293124 bytes; no unchanged High-memory claim is inferred from the older 338838052-byte observation.',
                  'Added geometry buffers are not included in the texture estimate; no native VRAM claim.',
                  'Final comparable repetitions, audio-enabled soak, complete experience/source review and hosted acceptance remain open.'])
result['pass'] = result.pop('pass_')
(stage / 'assessment.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'pass': result['pass'], 'runs': len(runs), 'buildId': pre['buildId'], 'boundedGoal': 'met'}))
