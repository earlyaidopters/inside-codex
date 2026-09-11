from pathlib import Path
from PIL import Image, ImageChops, ImageStat
import json, math

old = Path('../evidence/production/static-shadow-v1/views')
new = Path('../evidence/production/startup-diagnostics-v1/views')
before = json.loads((old/'candidate.json').read_text())['rows']
after = json.loads((new/'candidate-compressed.json').read_text())['rows']
assert len(before) == len(after) == 10
rows = []
for a, b in zip(before, after):
    assert (a['quality'], a['name']) == (b['quality'], b['name'])
    first = Image.open(old/a['filename']).convert('RGB')
    second = Image.open(new/b['filename']).convert('RGB')
    assert first.size == second.size
    difference = ImageChops.difference(first, second)
    stats = ImageStat.Stat(difference)
    rows.append({'quality': a['quality'], 'view': a['name'], 'identical': difference.getbbox() is None,
                 'mean': sum(stats.mean)/3, 'rms': math.sqrt(sum(x*x for x in stats.rms)/3),
                 'max': max(x[1] for x in stats.extrema)})
(new/'comparison.json').write_text(json.dumps({'pass': all(x['identical'] for x in rows), 'rows': rows}, indent=2))
print(json.dumps(rows))
assert all(x['identical'] for x in rows), 'Visual differences require inspection'
