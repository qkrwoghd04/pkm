---
title: Alpha Vantage
description: Market Agent가 가격, 환율, 실적, 실적 캘린더 데이터를 조회하는 Alpha Vantage helper의 구현과 검증 방법.
status: active
updated: 2026-07-30
tags:
  - integration/alpha-vantage
  - market
  - alpha-vantage
  - python
  - data
aliases:
  - Alpha Vantage Helper
  - market-agent/04-alpha-vantage
---

Alpha Vantage helper script는 Market Agent가 구조화된 가격, 환율, 실적, 실적 캘린더 데이터를 조회하는 데 사용한다.

## Helper script 생성

```bash
cat > ~/.openclaw/workspace-market/bin/alpha_vantage.py <<'EOF'
#!/usr/bin/env python3
import os
import sys
import json
import csv
import io
import urllib.parse
import urllib.request

BASE = "https://www.alphavantage.co/query"
API_KEY = os.environ.get("ALPHAVANTAGE_API_KEY", "").strip()

def fail(msg, code=1):
    print(json.dumps({"ok": False, "error": msg}, ensure_ascii=False, indent=2))
    raise SystemExit(code)

def fetch(params):
    if not API_KEY:
        fail("ALPHAVANTAGE_API_KEY is not set")
    params = dict(params)
    params["apikey"] = API_KEY
    url = BASE + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
    return raw

def print_jsonish(raw):
    s = raw.strip()
    if not s:
        fail("empty response")
    if s.startswith("{") or s.startswith("["):
        try:
            obj = json.loads(s)
            print(json.dumps(obj, ensure_ascii=False, indent=2))
            return
        except Exception:
            pass
    try:
        rows = list(csv.DictReader(io.StringIO(s)))
        print(json.dumps(rows, ensure_ascii=False, indent=2))
        return
    except Exception:
        pass
    print(s)

def main():
    if len(sys.argv) < 2:
        fail("usage: alpha_vantage.py <quote|fx|earnings|calendar|call> ...")

    cmd = sys.argv[1]

    if cmd == "quote":
        if len(sys.argv) != 3:
            fail("usage: alpha_vantage.py quote <SYMBOL>")
        raw = fetch({"function": "GLOBAL_QUOTE", "symbol": sys.argv[2]})
        print_jsonish(raw)
        return

    if cmd == "fx":
        if len(sys.argv) != 4:
            fail("usage: alpha_vantage.py fx <FROM> <TO>")
        raw = fetch({
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": sys.argv[2],
            "to_currency": sys.argv[3],
        })
        print_jsonish(raw)
        return

    if cmd == "earnings":
        if len(sys.argv) != 3:
            fail("usage: alpha_vantage.py earnings <SYMBOL>")
        raw = fetch({"function": "EARNINGS", "symbol": sys.argv[2]})
        print_jsonish(raw)
        return

    if cmd == "calendar":
        horizon = "3month"
        symbol = None
        if len(sys.argv) >= 3:
            horizon = sys.argv[2]
        if len(sys.argv) >= 4:
            symbol = sys.argv[3]
        params = {"function": "EARNINGS_CALENDAR", "horizon": horizon}
        if symbol:
            params["symbol"] = symbol
        raw = fetch(params)
        print_jsonish(raw)
        return

    if cmd == "call":
        if len(sys.argv) < 3:
            fail("usage: alpha_vantage.py call <FUNCTION> [key=value ...]")
        params = {"function": sys.argv[2]}
        for kv in sys.argv[3:]:
            if "=" not in kv:
                fail(f"bad arg: {kv} (expected key=value)")
            k, v = kv.split("=", 1)
            params[k] = v
        raw = fetch(params)
        print_jsonish(raw)
        return

    fail(f"unknown command: {cmd}")

if __name__ == "__main__":
    main()
EOF

chmod +x ~/.openclaw/workspace-market/bin/alpha_vantage.py
```

## 테스트

```bash
set -a
source ~/.openclaw/.env
set +a

python3 ~/.openclaw/workspace-market/bin/alpha_vantage.py quote AAPL | sed -n '1,40p'
python3 ~/.openclaw/workspace-market/bin/alpha_vantage.py fx USD KRW | sed -n '1,60p'
python3 ~/.openclaw/workspace-market/bin/alpha_vantage.py earnings AAPL | sed -n '1,80p'
python3 ~/.openclaw/workspace-market/bin/alpha_vantage.py calendar 3month AAPL | sed -n '1,80p'
```

## 명령 요약

| 명령 | 목적 |
|---|---|
| `quote <SYMBOL>` | 개별 종목 quote 조회 |
| `fx <FROM> <TO>` | 환율 조회 |
| `earnings <SYMBOL>` | 실적 이력 조회 |
| `calendar 3month <SYMBOL>` | 실적 캘린더 조회 |
| `call <FUNCTION> key=value ...` | Alpha Vantage raw function 호출 |
