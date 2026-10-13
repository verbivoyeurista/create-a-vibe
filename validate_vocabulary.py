"""Schema gate for the vibe vocabulary. Run: python3 validate_vocabulary.py

Each rule is a content decision written down as a check, so the vocabulary
can grow without quietly breaking (same idea as the alias tests in PR #45).
"""
import csv, sys
from pathlib import Path

HERE = Path(__file__).parent
FACETS = {"mood", "theme", "activity", "setting"}

vibes = list(csv.DictReader(open(HERE / "vibe_vocabulary_v0.csv")))
ambiguous_terms = {r["term"].lower() for r in csv.DictReader(open(HERE / "ambiguous_terms_v0.csv"))}
ids = {v["id"] for v in vibes}
errors = []

def check(ok, message):
    if not ok:
        errors.append(message)

labels = {}
for v in vibes:
    check(v["facet"] in FACETS, f"{v['id']}: facet must be one of {sorted(FACETS)}")
    check(bool(v["definition"]), f"{v['id']}: every vibe needs a plain-language definition")
    check(not v["broader"] or v["broader"] in ids, f"{v['id']}: broader '{v['broader']}' doesn't exist")
    if v["ambiguous"] == "yes":
        options = [o for o in v["clarify_options"].split("|") if o]
        check(bool(v["clarify_question"]), f"{v['id']}: an ambiguous vibe must ask a question, not guess")
        check(len(options) >= 2 and all(o in ids for o in options), f"{v['id']}: clarify options must be 2+ real vibes")
    if v["needs_input"]:
        check(bool(v["clarify_question"]), f"{v['id']}: needs '{v['needs_input']}', so it needs a question to ask for it")
    for label in [v["pref_label"]] + [a for a in v["alt_labels"].split("|") if a]:
        key = label.strip().lower()
        check(key not in labels, f"'{label}' points to both {labels.get(key)} and {v['id']}: one label, one vibe")
        check(key not in ambiguous_terms, f"{v['id']}: '{label}' is on the ambiguous list and can't map to one vibe")
        labels[key] = v["id"]

golden = HERE / "golden_set_v0.csv"
if golden.exists():
    for case in csv.DictReader(open(golden)):
        for vibe in [x for x in case["expected_vibes"].split("|") if x]:
            check(vibe in ids, f"golden {case['id']}: expected vibe '{vibe}' isn't in the vocabulary")

if errors:
    print("FAIL"); [print(" -", e) for e in errors]; sys.exit(1)
print(f"PASS: {len(vibes)} vibes, {len(labels)} labels, {len(ambiguous_terms)} ambiguous terms held out")
