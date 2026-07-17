#!/usr/bin/env bash
# Validate all environment flag files (prod safety invariants).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export ROOT
python3 - <<'PY'
import json, sys, os
from pathlib import Path
root = Path(os.environ["ROOT"])
ok = True
for name in ("dev", "stage", "prod"):
    p = root / "config" / "flags" / f"{name}.json"
    d = json.loads(p.read_text())
    if d.get("env") != name:
        print(f"✗ {p}: env field must be {name}")
        ok = False
        continue
    f = d["flags"]
    for section in ("payments", "commerce", "features", "ops"):
        if section not in f:
            print(f"✗ {p}: missing flags.{section}")
            ok = False
    if name == "prod":
        if f["payments"].get("manual_checkout"):
            print("✗ prod must not allow manual_checkout")
            ok = False
        if not f["payments"].get("razorpay"):
            print("✗ prod must enable razorpay")
            ok = False
        if f["ops"].get("e2e_hooks"):
            print("✗ prod must not enable e2e_hooks")
            ok = False
        if f["ops"].get("show_env_badge"):
            print("✗ prod must not show env badge")
            ok = False
    if name == "stage" and f["payments"].get("razorpay_live_keys"):
        print("✗ stage must not set razorpay_live_keys=true")
        ok = False
    print(f"✓ {name}")
if not ok:
    sys.exit(1)
print("All flag files OK")
PY
