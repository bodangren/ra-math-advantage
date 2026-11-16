#!/usr/bin/env python3
import concurrent.futures, copy, json, os, subprocess, sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / "evidence"
EVIDENCE.mkdir(exist_ok=True)
URL = os.environ.get("QF_LOCAL_CONVEX_URL", "")
KEY_FILE = Path(os.environ.get("QF_LOCAL_ADMIN_KEY_FILE", ""))
parsed = urlparse(URL)
if parsed.scheme != "http" or parsed.hostname not in {"127.0.0.1", "localhost", "::1"}:
    raise SystemExit("QF_LOCAL_CONVEX_URL must be an explicit loopback HTTP URL")
if not KEY_FILE.is_file():
    raise SystemExit("QF_LOCAL_ADMIN_KEY_FILE must name a local key file")
ENV = os.environ.copy()
ENV.pop("CONVEX_DEPLOYMENT", None); ENV.pop("CONVEX_DEPLOY_KEY", None)
ENV["CONVEX_SELF_HOSTED_URL"] = URL
ENV["CONVEX_SELF_HOSTED_ADMIN_KEY"] = KEY_FILE.read_text().strip()
SECRET = ENV["CONVEX_SELF_HOSTED_ADMIN_KEY"]
CWD = os.environ.get("QF_CANDIDATE_APP", "/tmp/im3-lesson18-recovery-v6l3h06f/apps/integrated-math-3")

def redact(value): return value.replace(SECRET, "<redacted>")

def call(name, args, label, fail=False):
    p = subprocess.run(["npx", "convex", "run", name, json.dumps(args)], cwd=CWD, env=ENV,
                       text=True, capture_output=True)
    stdout, stderr = redact(p.stdout), redact(p.stderr)
    (EVIDENCE / f"{label}.log").write_text(stdout + stderr)
    if fail:
        assert p.returncode != 0, stdout
        return stderr
    assert p.returncode == 0, stderr
    if name == "qfLocalVerification:rerunQfUpsert" and not stdout.strip(): return None
    return json.loads(stdout)

def normal(name, args, label, fail=False): return call(f"activities:{name}", args, label, fail)
def fixture(name, args, label, fail=False): return call(f"qfLocalVerification:{name}", args, label, fail)
def snap(ids, label):
    value = fixture("snapshot", {"learnerIds": ids["learnerIds"], "activityIds": list(ids["activityIds"].values())}, label)
    (EVIDENCE / f"{label}.json").write_text(json.dumps(value, sort_keys=True, indent=2))
    return value
def qf_args(learner, activity, mode): return {"userId": learner, "activityId": activity, "mode": mode}
def finish(learner, pending, label, timing=False):
    env = fixture("makeEnvelope", {"pendingSubmissionId": pending["pendingSubmissionId"], "timing": timing}, label+"-envelope")
    args = {"userId": learner, "activityId": env["activityId"], "pendingSubmissionId": env["pendingSubmissionId"], "idempotencyKey": env["idempotencyKey"], "submissionData": env["submissionData"]}
    result = normal("createServerOwnedSubmission", args, label)
    assert result["submissionId"] == pending["pendingSubmissionId"]
    return result, args

ids = fixture("seed", {}, "seed")
learners = ids["learnerIds"]; guided = ids["activityIds"]["guided_practice"]; independent = ids["activityIds"]["independent_practice"]
initial = snap(ids, "00-initial")
assert len(initial["items"]) == 2 and len(initial["variants"]) == 2
assert not any(initial[k] for k in ["submissions", "evidence", "receipts", "cards", "reviews"])
scheduled_baseline = initial["scheduled"]

# 1. Concurrent Start for one learner.
args = qf_args(learners[0], guided, "guided_practice")
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    starts = list(pool.map(lambda i: normal("startQuadraticFormulaAttempt", args, f"01-start-{i}"), range(2)))
assert starts[0] == starts[1] and starts[0]["state"] == "pending"
first = starts[0]
one_start = snap(ids, "01-concurrent-start-state")
first_rows = [row for row in one_start["submissions"] if row["userId"] == learners[0] and row["activityId"] == guided]
assert len(first_rows) == 1 and first_rows[0]["submissionData"]["status"] == "draft"

# 3 and 6. Concurrent exact final retry with timing, then final GET.
envelope = fixture("makeEnvelope", {"pendingSubmissionId": first["pendingSubmissionId"], "timing": True}, "02-timed-envelope")
submit_args = {"userId": learners[0], "activityId": guided, "pendingSubmissionId": first["pendingSubmissionId"], "idempotencyKey": first["idempotencyKey"], "submissionData": envelope["submissionData"]}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    finals = list(pool.map(lambda i: normal("createServerOwnedSubmission", submit_args, f"02-final-{i}"), range(2)))
assert finals[0] == finals[1] and finals[0]["submissionId"] == first["pendingSubmissionId"]
assert finals[0]["score"] == 3 and finals[0]["maxScore"] == 3
read_final = normal("getQuadraticFormulaAttempt", args, "02-final-get")
assert read_final["state"] == "final" and read_final["submissionId"] == first["pendingSubmissionId"]
assert read_final["score"] == 3 and read_final["maxScore"] == 3
one_final = snap(ids, "02-concurrent-final-state")
final_rows = [row for row in one_final["submissions"] if row["_id"] == first["pendingSubmissionId"]]
assert len(final_rows) == 1 and final_rows[0]["submissionData"]["status"] == "graded"

# 2. Two learners create canonical finals, then share suffix one.
for index in [1, 2]:
    a = qf_args(learners[index], guided, "guided_practice")
    pending = normal("startQuadraticFormulaAttempt", a, f"03-canonical-start-{index}")
    finish(learners[index], pending, f"03-canonical-final-{index}")
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    later = list(pool.map(lambda i: normal("startQuadraticFormulaAttempt", qf_args(learners[i+1], guided, "guided_practice"), f"03-later-{i}"), range(2)))
assert later[0]["pendingSubmissionId"] != later[1]["pendingSubmissionId"]
assert later[0]["props"] == later[1]["props"]
shared = snap(ids, "03-shared-relation")
suffix = ".variant.1"
suffix_variants = [row for row in shared["variants"] if row["variantKey"].endswith(suffix)]
suffix_items = [row for row in shared["items"] if row["variantKey"].endswith(suffix)]
later_ids = {row["pendingSubmissionId"] for row in later}
later_rows = [row for row in shared["submissions"] if row["_id"] in later_ids]
assert len(suffix_variants) == 1 and len(suffix_items) == 1
assert suffix_items[0]["activityId"] == guided and len(later_rows) == 2
assert {row["allocatedVariantKey"] for row in later_rows} == {suffix_variants[0]["variantKey"]}

# Prepare a canonical Independent final. The next Start must create suffix one.
canonical_i = normal("startQuadraticFormulaAttempt", qf_args(learners[0], independent, "independent_practice"), "04-canonical-start")
finish(learners[0], canonical_i, "04-canonical-final")

# 4. Later Start rollback leaves every captured effect byte equal.
before = snap(ids, "04-before-start-rollback")
err = fixture("rollbackStart", {"learnerId": learners[0], "activityId": independent, "mode": "independent_practice"}, "04-start-rollback", True)
assert "qf_local_start_then_rollback" in err
after = snap(ids, "04-after-start-rollback")
assert before == after

# 5. Final rollback leaves the later pending row and all effects unchanged.
ip = normal("startQuadraticFormulaAttempt", qf_args(learners[0], independent, "independent_practice"), "05-start")
ienv = fixture("makeEnvelope", {"pendingSubmissionId": ip["pendingSubmissionId"], "timing": False}, "05-envelope")
iargs = {"learnerId": learners[0], "activityId": independent, "pendingSubmissionId": ip["pendingSubmissionId"], "idempotencyKey": ip["idempotencyKey"], "submissionData": ienv["submissionData"]}
before = snap(ids, "05-before-final-rollback")
err = fixture("rollbackFinal", iargs, "05-final-rollback", True)
assert "qf_local_final_then_rollback" in err
after = snap(ids, "05-after-final-rollback")
assert before == after

# Complete the Independent pending row after rollback.
finish(learners[0], ip, "05-final-after-rollback")

# Complete all four Independent regimes and prove Independent exhaustion.
independent_seen = [canonical_i["props"]["equation"], ip["props"]["equation"]]
next_i = normal("startQuadraticFormulaAttempt", qf_args(learners[0], independent, "independent_practice"), "05-independent-next")
while next_i["state"] == "pending":
    independent_result, _ = finish(learners[0], next_i, f"05-independent-final-{next_i['attemptOrdinal']}")
    got_i = normal("getQuadraticFormulaAttempt", qf_args(learners[0], independent, "independent_practice"), f"05-independent-get-{next_i['attemptOrdinal']}")
    expected_max = 2 if next_i["attemptOrdinal"] == 3 else 3
    assert independent_result["score"] == expected_max and independent_result["maxScore"] == expected_max
    if next_i["attemptOrdinal"] == 3:
        x2_i = next(part for part in got_i["parts"] if part["partId"] == "x2")
        assert got_i["answers"]["x2"] == "" and x2_i["maxScore"] == 0 and got_i["maxScore"] == 2
    independent_seen.append(got_i["props"]["equation"])
    next_i = normal("startQuadraticFormulaAttempt", qf_args(learners[0], independent, "independent_practice"), f"05-independent-next-{next_i['attemptOrdinal']}")
assert next_i["state"] == "exhausted" and len(set(independent_seen)) == 4

# 7 and 8. Finish all four Guided regimes and prove exhaustion.
current = normal("startQuadraticFormulaAttempt", args, "06-next-after-timed")
seen = [read_final["props"]["equation"]]
while current["state"] == "pending":
    result, _ = finish(learners[0], current, f"06-regime-{current['attemptOrdinal']}")
    final = normal("getQuadraticFormulaAttempt", args, f"06-regime-get-{current['attemptOrdinal']}")
    seen.append(final["props"]["equation"])
    if current["attemptOrdinal"] == 3:
        x2 = next(part for part in final["parts"] if part["partId"] == "x2")
        assert final["answers"]["x2"] == "" and x2["maxScore"] == 0 and final["maxScore"] == 2
    current = normal("startQuadraticFormulaAttempt", args, f"06-next-{current['attemptOrdinal']}")
assert current["state"] == "exhausted" and len(set(seen)) == 4
before_exhausted = snap(ids, "07-before-exhausted")
again = normal("startQuadraticFormulaAttempt", args, "07-exhausted")
after_exhausted = snap(ids, "07-after-exhausted")
assert again["state"] == "exhausted" and before_exhausted == after_exhausted

# 9. Seed rerun preserves every existing activity, variant, and item byte.
before_seed = snap(ids, "08-before-seed-rerun")
fixture("rerunQfUpsert", {}, "08-seed-rerun")
after_seed = snap(ids, "08-after-seed-rerun")
for key in ["activities", "variants", "items"]: assert before_seed[key] == after_seed[key]

# Optional historical control. Exact legacy replay uses the indexed key and does not allocate.
legacy = fixture("insertLegacyFinal", {"learnerId": learners[1], "activityId": independent, "mode": "independent_practice", "key": "qf-local-legacy"}, "09-legacy-insert")
legacy_replay = normal("createServerOwnedSubmission", {"userId": learners[1], "activityId": independent, "idempotencyKey": legacy["idempotencyKey"], "submissionData": legacy["request"]}, "09-legacy-replay")
assert legacy_replay["submissionId"] == legacy["submissionId"]

# 10. Draft QF paths produce no learning or scheduler effects.
final_snapshot = snap(ids, "10-final")
assert not any(final_snapshot[key] for key in ["evidence", "receipts", "cards", "reviews"])
assert final_snapshot["scheduled"] == scheduled_baseline
assert all("masteryContractVersion" not in row for row in final_snapshot["submissions"])
(EVIDENCE / "result.json").write_text(json.dumps({"status": "passed", "guidedEquations": seen, "independentEquations": independent_seen, "concurrentStart": starts, "concurrentFinal": finals, "sharedLater": later}, sort_keys=True, indent=2))
print(json.dumps({"status": "passed", "evidence": str(EVIDENCE)}, indent=2))
