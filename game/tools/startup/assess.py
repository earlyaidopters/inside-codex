from pathlib import Path
import json, hashlib

root = Path(__file__).resolve().parents[3]
stage = root/'evidence/production/startup-diagnostics-v1'
def report(name):
    value = json.loads((stage/name).read_text())
    assert value['pass'], name
    return value

failures = report('failures-webkit.json')
assert len(failures['rows']) == 15 and all(r['pass'] for r in failures['rows'])
edges = report('edge-failures.json'); assert len(edges['rows']) == 2
transport = report('transport/report.json'); assert len(transport['checks']) == 6
late = report('late-candidate.json')
repeat = report('firefox-repeat.json'); assert len(repeat['rows']) == 12
exhibits = report('exhibit-recovery/report.json'); assert len(exhibits['engines']) == 3
journey = report('journey/report.json'); assert len(journey['checks']) == 37
views = report('views/comparison.json'); assert len(views['rows']) == 10
assert 'pass 76' in (stage/'unit.log').read_text()
assert 'pass 3' in (stage/'monitor.log').read_text()
runtime = ['src/main.ts','src/world.ts','src/exhibit-residency.ts','src/startup.ts','src/world-module.ts']
source = {p: hashlib.sha256((root/'game'/p).read_bytes()).hexdigest() for p in runtime}
build_id = hashlib.sha256((root/'game/dist/exhibits-manifest.json').read_bytes()).hexdigest()
result = {'pass': True, 'buildId': build_id, 'sourceSha256': source,
          'checks': {'unit':76,'monitor':3,'failureAndRetry':15,'edgeFailures':2,'transport':6,
                     'lateNavigation':1,'freshFirefox':12,'exhibitRecoveryEngines':3,'journey':37,'pixelIdenticalViews':10},
          'internalBrowserReview':'Arrival and task studio inspected in Codex; left paused with existing saved progress.',
          'historicalFirefoxRootCause':'Unproven; original failures had no intercepted harness requests. Current staged diagnostics and repeat/recovery results are distinct evidence.',
          'limits':['Local desktop engines only','No new performance acceptance','No physical-device or hosted-CDN evidence','Full release gates remain open'],
          'fullReleaseAccepted':False}
(stage/'assessment.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
