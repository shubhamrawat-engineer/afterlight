import os
import re

handoff_file = os.path.join(os.path.dirname(__file__), "..", "..", "PERSON_A_BACKEND_HANDOFF.md")
with open(handoff_file, "r", encoding="utf-8") as f:
    content = f.read()

matches = re.findall(r"file:///([^\s\)\"\']+)", content)
print(f"Found {len(matches)} links in {os.path.basename(handoff_file)}:")
all_exist = True
for m in sorted(set(matches)):
    p = os.path.normpath(m)
    exists = os.path.exists(p)
    print(f"  [{'PASS' if exists else 'FAIL'}] {p}")
    if not exists:
        all_exist = False

if all_exist:
    print("\nALL REFERENCED FILES VERIFIED TO EXIST ON DISK.")
else:
    print("\nERROR: ONE OR MORE FILES DO NOT EXIST.")
    exit(1)
