import json

with open("submission.json", "r", encoding="utf-8") as f:
    sub = json.load(f)

with open("../submission.template.json", "r", encoding="utf-8") as f:
    tpl = json.load(f)

# 1. Top-level keys
assert set(sub.keys()) == set(tpl.keys()), f"Top-level keys mismatch: {set(sub.keys())} vs {set(tpl.keys())}"

# 2. Candidate keys
assert set(sub["candidate"].keys()) == set(tpl["candidate"].keys()), "Candidate keys mismatch"

# 3. Answers keys
assert set(sub["answers"].keys()) == set(tpl["answers"].keys()), f"Answers keys mismatch"

# 4. Findings structure
VALID_CATEGORIES = {
    "auth", "pagination", "units", "filters", "sorting", "timestamps",
    "duplicates", "completeness", "data_quality", "fraud", "consistency",
    "missing_endpoint", "undocumented_endpoint"
}
finding_keys = set(tpl["findings"][0].keys())
for i, f in enumerate(sub["findings"]):
    assert set(f.keys()) == finding_keys, f"Finding {i} keys mismatch: {set(f.keys()) ^ finding_keys}"
    assert f["category"] in VALID_CATEGORIES, f"Finding {i} invalid category: {f['category']}"
    assert len(f["evidence"]) <= 20, f"Finding {i} evidence > 20 ({len(f['evidence'])})"

print("SUCCESS: submission.json matches submission.template.json 100% perfectly!")
print("Candidate:", sub["candidate"])
print("Answers summary:", {k: v if not isinstance(v, list) else f"list({len(v)})" for k, v in sub["answers"].items()})
print(f"Total findings: {len(sub['findings'])}")
