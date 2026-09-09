import json, sys
from pathlib import Path

before = json.loads(Path(sys.argv[1]).read_text())
after = json.loads(Path(sys.argv[2]).read_text())

def keyed(rows):
    return {row['_id']: row for row in rows}

for field in ('items', 'variants', 'submissions', 'learners', 'effects'):
    if before[field] != after[field]:
        raise SystemExit(f'{field} changed')
if any(before['effects'].values()):
    raise SystemExit('effect table was not empty before reconciliation')
if len(before['activities']) != 2 or len(before['items']) != 8 or len(before['variants']) != 8 or len(before['submissions']) != 8:
    raise SystemExit('pre-reconciliation row counts do not match the retained proof')

before_activities = keyed(before['activities'])
after_activities = keyed(after['activities'])
if before_activities.keys() != after_activities.keys():
    raise SystemExit('activity identities changed')
for row_id in before_activities:
    old = before_activities[row_id]
    new = after_activities[row_id]
    old_equation = old.get('props', {}).get('equation')
    new_equation = new.get('props', {}).get('equation')
    if not isinstance(old_equation, str) or new_equation != f'{old_equation} = 0':
        raise SystemExit(f'{row_id}: equation transition is not exact')
    expected = {**old, 'props': {**old['props'], 'equation': new_equation}, 'updatedAt': new.get('updatedAt')}
    if new != expected:
        raise SystemExit(f'{row_id}: fields other than props.equation and updatedAt changed')
print(json.dumps({'ok': True, 'activities': 2, 'variants': 8, 'items': 8, 'submissions': 8, 'effects': 0}))
