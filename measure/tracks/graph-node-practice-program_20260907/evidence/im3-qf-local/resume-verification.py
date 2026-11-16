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

def saved(label): return json.loads((EVIDENCE / f"{label}.log").read_text())
ids = saved("seed")
learners = ids["learnerIds"]; guided = ids["activityIds"]["guided_practice"]; independent = ids["activityIds"]["independent_practice"]
scheduled_baseline = saved("00-initial")["scheduled"]
before_seed = saved("08-before-seed-rerun")
starts = [saved(f"01-start-{i}") for i in range(2)]
finals = [saved(f"02-final-{i}") for i in range(2)]
later = [saved(f"03-later-{i}") for i in range(2)]
seen = [saved("02-final-get")["props"]["equation"]] + [saved(f"06-regime-get-{i}")["props"]["equation"] for i in [2,3,4]]
independent_seen = [saved("04-canonical-start")["props"]["equation"], saved("05-start")["props"]["equation"]] + [saved(f"05-independent-get-{i}")["props"]["equation"] for i in [3,4]]
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
