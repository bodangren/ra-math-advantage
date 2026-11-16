from pathlib import Path
import os,subprocess,json,concurrent.futures
E=os.environ.copy()
for k in ['CONVEX_DEPLOYMENT','CONVEX_DEPLOY_KEY']:E.pop(k,None)
E.update(CONVEX_SELF_HOSTED_URL='http://127.0.0.1:43130',CONVEX_SELF_HOSTED_ADMIN_KEY=Path('/tmp/precalc-q35-rename-admin').read_text().strip())
def call(name,args,label,fail=False):
 p=subprocess.run(['npx','convex','run','q35_fresh_fixture:'+name,json.dumps(args)],env=E,text=True,capture_output=True)
 Path('/tmp/precalc-q35-'+label+'.log').write_text(p.stdout+p.stderr)
 if fail:
  assert p.returncode!=0 and 'q35_actual_selected_effects_then_rollback' in p.stderr,p.stderr
  return
 assert p.returncode==0,p.stderr
 return json.loads(p.stdout)
a=json.loads(Path('/tmp/precalc-q35-fresh-ids.json').read_text());learner={'learnerId':a['learnerId']}
first={'learnerId':a['learnerId'],'submissionId':a['submissionId']}
replay=call('submitFreshIndependentEvidence',first,'first-replay');assert replay['delivery']=='replay'
new=call('createFreshIndependentSubmission',{**learner,'key':'q35-rollback-concurrent-first'},'second-create')
assert new['score']==3 and new['attemptOrdinal']==2,new
args={**learner,'submissionId':new['submissionId']}
Path('/tmp/precalc-q35-second-ids.json').write_text(json.dumps(args))
before=call('inspectEffects',learner,'before-rollback')
call('rollbackFreshEvidence',args,'actual-rollback',True)
after=call('inspectEffects',learner,'after-rollback');assert before==after,'Rollback changed persisted effects'
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 results=list(pool.map(lambda i:call('submitFreshIndependentEvidence',args,'concurrent-'+str(i)),range(2)))
assert sorted(r['delivery'] for r in results)==['new','replay'],results
final=call('inspectEffects',learner,'after-concurrent')
assert {k:len(v) for k,v in final.items()}=={'evidence':3,'receipts':2,'cards':1,'reviews':2},final
assert sum(r.get('submissionId')==args['submissionId'] for r in final['evidence'])==1
assert sum(r.get('submissionId')==args['submissionId'] for r in final['receipts'])==1
assert sum(r.get('submissionId')==args['submissionId'] for r in final['reviews'])==1
print(json.dumps({'firstReplay':replay,'rollback':'all persisted effect rows unchanged','concurrent':results,'finalCounts':{k:len(v) for k,v in final.items()}},indent=2))
