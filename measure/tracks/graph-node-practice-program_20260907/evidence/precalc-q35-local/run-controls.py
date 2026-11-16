from pathlib import Path
import os, subprocess, json, concurrent.futures
E=os.environ.copy()
for k in ['CONVEX_DEPLOYMENT','CONVEX_DEPLOY_KEY']: E.pop(k,None)
E.update(CONVEX_SELF_HOSTED_URL='http://127.0.0.1:43130',CONVEX_SELF_HOSTED_ADMIN_KEY=Path('/tmp/precalc-q35-rename-admin').read_text().strip())
def call(name,args,label,fail=False):
 p=subprocess.run(['npx','convex','run','q35_fresh_fixture:'+name,json.dumps(args)],cwd='/tmp/precalc-q35-rename-current-main/apps/pre-calculus',env=E,text=True,capture_output=True)
 Path('/tmp/precalc-q35-control-'+label+'.log').write_text(p.stdout+p.stderr)
 if fail:
  assert p.returncode != 0, p.stdout+p.stderr
  return p.stdout+p.stderr
 assert p.returncode == 0, p.stdout+p.stderr
 return json.loads(p.stdout)
ids=json.loads(Path('/tmp/precalc-q35-fresh-ids.json').read_text()); learner={'learnerId':ids['learnerId']}
call('ensureFreshGuidedActivity',learner,'guided-activity')
guided=call('createFreshGuidedSubmission',{**learner,'key':'q35-guided-concurrent-first'},'guided-create')
before=call('inspectEffects',learner,'guided-before')
args={**learner,'submissionId':guided['submissionId']}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 results=list(pool.map(lambda i:call('submitFreshIndependentEvidence',args,'guided-concurrent-'+str(i)),range(2)))
assert sorted(r['delivery'] for r in results)==['new','replay'], results
after=call('inspectEffects',learner,'guided-after')
assert len(after['evidence'])==len(before['evidence'])+1
assert len(after['receipts'])==len(before['receipts'])+1
assert len(after['cards'])==len(before['cards'])
assert len(after['reviews'])==len(before['reviews'])
row=[r for r in after['evidence'] if r.get('submissionId')==guided['submissionId']]
assert len(row)==1 and 'gradedEvidence' not in row[0] and row[0]['mode']=='guided_practice'
receipt=[r for r in after['receipts'] if r.get('submissionId')==guided['submissionId']]
assert len(receipt)==1 and receipt[0]['masteryApplied'] is False
fresh=call('createFreshIndependentSubmission',{**learner,'key':'q35-disabled-control'},'disabled-create')
state_before=call('inspectEffects',learner,'disabled-before')
call('setFreshCredentialActive',{**learner,'isActive':False},'disable')
err=call('submitFreshIndependentEvidence',{**learner,'submissionId':fresh['submissionId']},'disabled-new-reject',True)
assert 'Inactive student identity' in err,err
err2=call('submitFreshIndependentEvidence',{**learner,'submissionId':ids['submissionId']},'disabled-replay-reject',True)
assert 'Inactive student identity' in err2,err2
state_after=call('inspectEffects',learner,'disabled-after')
assert state_before==state_after
call('setFreshCredentialActive',{**learner,'isActive':True},'restore')
print(json.dumps({'guidedWriter':guided,'guidedConcurrent':results,'guidedEffectDelta':{k:len(after[k])-len(before[k]) for k in before},'guidedEvidence':row[0],'guidedReceipt':receipt[0],'disabledNewRejected':True,'disabledReplayRejected':True,'disabledEffectsUnchanged':True,'credentialRestored':True},indent=2))
