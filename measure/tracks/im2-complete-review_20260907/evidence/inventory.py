"""Read the current IM2 source and artifact inventory. Run from the repository root."""
from pathlib import Path
from collections import Counter
import json
import re
import zipfile
import xml.etree.ElementTree as ET

base = Path('apps/integrated-math-2/curriculum')
sources = sorted(base.joinpath('modules').glob('module-*-lesson-*'))
sources = [p / 'index.md' if p.is_dir() else p for p in sources]
images = []
for source in sources:
    for target in re.findall(r'!\[[^\]]*\]\(([^)]+)\)', source.read_text()):
        images.append((source, target, (source.parent / target).exists()))
print('Lesson sources:', len(sources))
print('Image references:', len(images), 'unresolved:', sum(not x[2] for x in images))
originals = list(base.joinpath('source-materials').rglob('Int2_*_practice.docx'))
media_count = 0
for original in originals:
    with zipfile.ZipFile(original) as archive:
        ET.fromstring(archive.read('word/document.xml'))
        media_count += sum(name.startswith('word/media/') for name in archive.namelist())
print('Readable DOCX files:', len(originals), 'media entries:', media_count)
packages = list(base.joinpath('implementation/class-period-packages').glob('*.json'))
module_packages = [p for p in packages if p.name.startswith('module-')]
print('All packages:', len(packages), 'module packages:', len(module_packages))
print('Day types:', dict(Counter(json.loads(p.read_text())['dayType'] for p in module_packages)))
print('Instruction warm-ups:', dict(Counter(json.loads(p.read_text())['warmUp'] for p in module_packages if json.loads(p.read_text())['dayType'] == 'instruction')))
nodes = json.loads(base.joinpath('skill-graph/nodes.json').read_text())['nodes']
print('Node kinds:', dict(Counter(n['kind'] for n in nodes)))
units = [n for n in nodes if n['kind'] == 'instructional_unit']
print('First lesson node:', units[0])
for relative in ['implementation/practice-v1/activity-map.json', 'skill-graph/projection/practice-v1-activity-map.json']:
    activities = json.loads(base.joinpath(relative).read_text())['activities']
    print(relative, 'entries:', len(activities), 'modes:', dict(Counter(a.get('mode') for a in activities)))
source_ids = {re.search(r'module-(\d+)-lesson-(\d+)', str(p)).groups(): p for p in sources}
graph_ids = {(str(n['metadata']['module']), str(n['metadata']['lesson'])): n for n in units}
missing = sorted(set(source_ids) - set(graph_ids), key=lambda pair: tuple(map(int, pair)))
print('Missing graph lessons:', ['-'.join(pair) for pair in missing])
mismatches = []
for key, node in graph_ids.items():
    source_title = source_ids[key].read_text().splitlines()[0]
    source_title = re.sub(r'^#\s*Lesson\s+\d+-\d+\s*[—–:-]\s*', '', source_title)
    if source_title.strip().casefold() != node['title'].strip().casefold():
        mismatches.append((key, node['title'], source_title))
print('Title mismatches:', len(mismatches))
blueprints = json.loads(base.joinpath('skill-graph/blueprints.json').read_text())['blueprints']
by_id = {b['nodeId']: b for b in blueprints}
queue = json.loads(base.joinpath('skill-graph/geometry-renderer-gap-queue.json').read_text())['items']
print('Renderer mismatches:', sum(i['currentRenderer'] != by_id[i['nodeId']]['rendererKey'] for i in queue), '/', len(queue))
