---
title: market agent
type: agent
tags:
  - openclaw
  - market
  - telegram
---

# OpenClaw Market 에이전트 구축 정리

이 문서는 이번 세션에서 진행한 **market 에이전트 구축 과정**을 처음부터 다시 따라갈 수 있도록 정리한 복구용/운영용 문서다.

대상 환경:

- 서버: `zenai` (Ubuntu Server)
- OpenClaw Gateway: local / loopback
- Telegram bot 구성:
  - `chief_bot` → `main`
  - `calendar_bot` → `calendar`
  - `market_bot` → `market`
- 웹 검색: **Tavily**
- 시장/환율/실적 데이터: **Alpha Vantage**
- 목표:
  - 매일 아침 8시 시장 브리프 생성
  - Telegram `market_bot` DM으로 브리프 수신
  - 내부적으로 `market -> market-plan / market-research / market-eval` 구조 사용

---

# 1. 전체 구조

```text
Telegram
  ├─ chief_bot     -> main
  ├─ calendar_bot  -> calendar
  └─ market_bot    -> market

market
  ├─ market-plan
  ├─ market-research
  └─ market-eval
```

시장 브리프 생성 흐름:

```text
cron (08:00 Asia/Seoul)
  -> market
      -> market-plan      (체크리스트 생성)
      -> market-research  (뉴스/데이터 수집)
      -> market-eval      (신뢰도/판단 평가)
      -> reports/latest.md
      -> evidence/latest.md
  -> Telegram market_bot DM 전달
```

---

# 2. 사전 점검

## OpenClaw PATH 잡기

세션마다 `openclaw: command not found` 가 뜰 수 있으므로 먼저 PATH를 잡는다.

```bash
export PATH="$HOME/.openclaw/bin:$PATH"
hash -r
```

영구 적용:

```bash
echo 'export PATH="$HOME/.openclaw/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Gateway 상태 확인

```bash
openclaw --version
openclaw gateway status
openclaw gateway probe
```

---

# 3. 웹 검색 provider 설정 (Tavily)

OpenClaw web section 설정:

```bash
openclaw configure --section web
```

진행 시 선택:

- Gateway: `Local (this machine)`
- Native Codex web search: `No`
- Search provider: `Tavily`
- `web_fetch`: `Yes`

> 이 단계가 끝나면 `market-research` 에서 `web_search` 를 사용할 수 있다.

---

# 4. Alpha Vantage API 키 설정

## API 키 발급

브라우저에서 Alpha Vantage 공식 사이트에서 API key 발급.

## `.env` 에 키 추가

터미널 이슈(`xterm-ghostty`)가 있으면 먼저:

```bash
export TERM=xterm-256color
```

그 다음 키 추가:

```bash
grep -q '^ALPHAVANTAGE_API_KEY=' ~/.openclaw/.env \
  && sed -i 's/^ALPHAVANTAGE_API_KEY=.*/ALPHAVANTAGE_API_KEY=YOUR_REAL_KEY/' ~/.openclaw/.env \
  || printf '\nALPHAVANTAGE_API_KEY=YOUR_REAL_KEY\n' >> ~/.openclaw/.env

chmod 600 ~/.openclaw/.env
```

현재 셸에도 반영:

```bash
set -a
source ~/.openclaw/.env
set +a
echo "$ALPHAVANTAGE_API_KEY"
```

Gateway 재시작:

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
openclaw gateway probe
```

## Alpha Vantage 키 테스트

```bash
python3 - <<'PY'
import os, json, urllib.parse, urllib.request
key = os.environ.get("ALPHAVANTAGE_API_KEY")
url = "https://www.alphavantage.co/query?" + urllib.parse.urlencode({
    "function": "GLOBAL_QUOTE",
    "symbol": "AAPL",
    "apikey": key,
})
with urllib.request.urlopen(url, timeout=30) as r:
    data = json.loads(r.read().decode("utf-8"))
print(json.dumps(data, ensure_ascii=False, indent=2)[:1200])
PY
```

---

# 5. market 계열 agent 생성

```bash
openclaw agents add market \
  --workspace ~/.openclaw/workspace-market \
  --non-interactive

openclaw agents add market-plan \
  --workspace ~/.openclaw/workspace-market-plan \
  --non-interactive

openclaw agents add market-research \
  --workspace ~/.openclaw/workspace-market-research \
  --non-interactive

openclaw agents add market-eval \
  --workspace ~/.openclaw/workspace-market-eval \
  --non-interactive
```

확인:

```bash
openclaw agents list
ls -R ~/.openclaw/agents
```

---

# 6. agent auth/models 복사

새 agent는 `sessions/` 만 생기고 `agent/` 디렉토리가 없을 수 있으므로 `main` 기준 auth/models를 복사한다.

```bash
for AG in market market-plan market-research market-eval; do
  mkdir -p ~/.openclaw/agents/$AG/agent
  cp ~/.openclaw/agents/main/agent/auth-profiles.json ~/.openclaw/agents/$AG/agent/auth-profiles.json
  cp ~/.openclaw/agents/main/agent/models.json ~/.openclaw/agents/$AG/agent/models.json
  chmod 600 ~/.openclaw/agents/$AG/agent/auth-profiles.json
  chmod 600 ~/.openclaw/agents/$AG/agent/models.json
done
```

---

# 7. workspace 구조 생성

```bash
mkdir -p ~/.openclaw/workspace-market/bin
mkdir -p ~/.openclaw/workspace-market/reports
mkdir -p ~/.openclaw/workspace-market/evidence
mkdir -p ~/.openclaw/workspace-market/handoff

mkdir -p ~/.openclaw/workspace-market-plan
mkdir -p ~/.openclaw/workspace-market-research
mkdir -p ~/.openclaw/workspace-market-eval
```

handoff / output 파일 생성:

```bash
touch ~/.openclaw/workspace-market/handoff/plan.md
touch ~/.openclaw/workspace-market/handoff/research.md
touch ~/.openclaw/workspace-market/handoff/eval.md
touch ~/.openclaw/workspace-market/reports/latest.md
touch ~/.openclaw/workspace-market/evidence/latest.md
```

---

# 8. `portfolio.yaml`

실제 보유 종목 기준:

- `381180` TIGER 미국필라델피아반도체
- `360750` TIGER 미국S&P500
- `423160` KODEX KOFR 금리액티브
- `458730` TIGER 미국배당다우존스

작성 명령:

```bash
cat > ~/.openclaw/workspace-market/portfolio.yaml <<'EOF'
timezone: Asia/Seoul
report_time: "08:00"
base_currency: KRW

benchmarks:
  - SPY
  - QQQ
  - USDKRW

holdings:
  - symbol: "381180"
    label: "TIGER 미국필라델피아반도체"
    market: KR
    asset_type: ETF
    qty: 15
    avg_cost: 30125
    current_price_ref: 33680
    priority: core
    thesis: "미국 반도체 업황과 AI 인프라 사이클에 민감"

  - symbol: "360750"
    label: "TIGER 미국S&P500"
    market: KR
    asset_type: ETF
    qty: 53
    avg_cost: 24543
    current_price_ref: 25105
    priority: core
    thesis: "미국 대형주 장기 적립 핵심 자산"

  - symbol: "423160"
    label: "KODEX KOFR 금리액티브"
    market: KR
    asset_type: ETF
    qty: 3
    avg_cost: 110770
    current_price_ref: 110735
    priority: defensive
    thesis: "현금성 및 단기 금리 방어 포지션"

  - symbol: "458730"
    label: "TIGER 미국배당다우존스"
    market: KR
    asset_type: ETF
    qty: 14
    avg_cost: 14603
    current_price_ref: 14565
    priority: income
    thesis: "미국 배당/퀄리티 성격의 현금흐름형 자산"

watchlist:
  - NVDA
  - AAPL
  - MSFT

notes:
  - "한국 상장 ETF이지만 미국 시장/환율 영향이 큼"
  - "아침 브리프에서는 미국 증시, 반도체 섹터, 배당주 흐름, USD/KRW를 우선 점검"
  - "실제 ETF 현재가와 기초자산 뉴스/거시를 함께 해석"
EOF
```

확인:

```bash
cat ~/.openclaw/workspace-market/portfolio.yaml
```

---

# 9. Alpha Vantage helper 스크립트

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

테스트:

```bash
set -a
source ~/.openclaw/.env
set +a

python3 ~/.openclaw/workspace-market/bin/alpha_vantage.py quote AAPL | sed -n '1,40p'
python3 ~/.openclaw/workspace-market/bin/alpha_vantage.py fx USD KRW | sed -n '1,60p'
python3 ~/.openclaw/workspace-market/bin/alpha_vantage.py earnings AAPL | sed -n '1,80p'
python3 ~/.openclaw/workspace-market/bin/alpha_vantage.py calendar 3month AAPL | sed -n '1,80p'
```

---

# 10. AGENTS.md / TOOLS.md 구성

## market-plan

```bash
cat > ~/.openclaw/workspace-market-plan/AGENTS.md <<'EOF'
# Role
You are ZenAI Market Planning Agent.

# Goal
Create a compact morning research checklist before any evidence collection starts.

# Rules
- Read /home/jaehong/.openclaw/workspace-market/portfolio.yaml.
- Produce at most 8 checklist items.
- Prioritize core holdings and listed benchmarks.
- Respect API quota. Prefer core holdings first.
- Do not browse the web.
- Do not execute commands.
- Do not give final market conclusions.
- Reply in Korean.

# Required file output
- Always overwrite /home/jaehong/.openclaw/workspace-market/handoff/plan.md
- The file must contain:
  1. 오늘 확인할 질문 목록
  2. 우선순위
  3. 예상 데이터 수집 범위

# Final reply
- After writing the file, reply with a short Korean confirmation only.
EOF
```

```bash
cat > ~/.openclaw/workspace-market-plan/TOOLS.md <<'EOF'
### Inputs
- /home/jaehong/.openclaw/workspace-market/portfolio.yaml

### Required output
- /home/jaehong/.openclaw/workspace-market/handoff/plan.md
EOF
```

## market-research

```bash
cat > ~/.openclaw/workspace-market-research/AGENTS.md <<'EOF'
# Role
You are ZenAI Market Research Agent.

# Goal
Collect evidence for the morning market brief.

# Rules
- Read /home/jaehong/.openclaw/workspace-market/portfolio.yaml.
- Read /home/jaehong/.openclaw/workspace-market/handoff/plan.md first.
- Use web_search for overnight macro, policy, market, sector, and holdings news.
- Use the Alpha Vantage helper for structured data:
  - python3 /home/jaehong/.openclaw/workspace-market/bin/alpha_vantage.py quote <SYMBOL>
  - python3 /home/jaehong/.openclaw/workspace-market/bin/alpha_vantage.py fx USD KRW
  - python3 /home/jaehong/.openclaw/workspace-market/bin/alpha_vantage.py earnings <SYMBOL>
  - python3 /home/jaehong/.openclaw/workspace-market/bin/alpha_vantage.py calendar 3month <SYMBOL>
- Separate facts from interpretation.
- Every factual claim must include a source and a date or timestamp.
- Do not make the final trading decision.
- Reply in Korean.

# Required file output
- Always overwrite /home/jaehong/.openclaw/workspace-market/handoff/research.md
- The file must contain:
  1. facts
  2. interpretations
  3. open questions
  4. evidence bundle

# Final reply
- After writing the file, reply with a short Korean confirmation only.
EOF
```

```bash
cat > ~/.openclaw/workspace-market-research/TOOLS.md <<'EOF'
### Inputs
- /home/jaehong/.openclaw/workspace-market/portfolio.yaml
- /home/jaehong/.openclaw/workspace-market/handoff/plan.md

### Alpha Vantage helper
- /home/jaehong/.openclaw/workspace-market/bin/alpha_vantage.py

### Required output
- /home/jaehong/.openclaw/workspace-market/handoff/research.md
EOF
```

## market-eval

```bash
cat > ~/.openclaw/workspace-market-eval/AGENTS.md <<'EOF'
# Role
You are ZenAI Market Evaluation Agent.

# Goal
Evaluate the collected evidence and score confidence.

# Rules
- Read /home/jaehong/.openclaw/workspace-market/handoff/plan.md
- Read /home/jaehong/.openclaw/workspace-market/handoff/research.md
- Use only the evidence you are given.
- Do not use web_search.
- Do not execute commands.
- Score:
  - data_confidence
  - interpretation_confidence
  - action_confidence
- Deduct confidence when:
  - only one source exists
  - price freshness is unclear
  - headlines conflict
  - symbol mapping is uncertain
  - evidence is incomplete
- Reply in Korean.
- Keep action suggestions conservative.

# Required file output
- Always overwrite /home/jaehong/.openclaw/workspace-market/handoff/eval.md
- The file must contain:
  1. 핵심 판단
  2. data_confidence
  3. interpretation_confidence
  4. action_confidence
  5. 무엇이 불확실한지

# Final reply
- After writing the file, reply with a short Korean confirmation only.
EOF
```

```bash
cat > ~/.openclaw/workspace-market-eval/TOOLS.md <<'EOF'
### Inputs
- /home/jaehong/.openclaw/workspace-market/handoff/plan.md
- /home/jaehong/.openclaw/workspace-market/handoff/research.md

### Required output
- /home/jaehong/.openclaw/workspace-market/handoff/eval.md
EOF
```

## market orchestrator

```bash
cat > ~/.openclaw/workspace-market/AGENTS.md <<'EOF'
# Role
You are ZenAI Market Orchestrator.

# Goal
Produce a complete Korean morning brief using child agents and file handoff.

# Workflow
- Read /home/jaehong/.openclaw/workspace-market/portfolio.yaml.
- Use these child agents in this exact order:
  1) market-plan
  2) market-research
  3) market-eval
- Tell each child to write its required handoff file.
- After all child agents finish, read:
  - /home/jaehong/.openclaw/workspace-market/handoff/plan.md
  - /home/jaehong/.openclaw/workspace-market/handoff/research.md
  - /home/jaehong/.openclaw/workspace-market/handoff/eval.md
- Then write:
  - /home/jaehong/.openclaw/workspace-market/reports/latest.md
  - /home/jaehong/.openclaw/workspace-market/evidence/latest.md
- Before finishing, verify both files by reading them back.

# File output rules
- reports/latest.md must contain the final morning brief.
- evidence/latest.md must contain a compact evidence summary.
- If any child file is missing or incomplete, explain which one failed and why.

# Rules
- Reply in Korean.
- Never finish with only "completed".
- Separate facts, interpretation, and action suggestions.
- Never place trades or pretend trades were placed.
- Keep action suggestions conservative and reversible.
- Highlight uncertainty clearly.

# Final output
Always reply in Korean with:
1. 한 줄 요약
2. 밤사이 핵심 이슈 3개
3. 내 보유 종목 영향
4. 오늘 체크 포인트
5. 제안 3개
6. data_confidence / interpretation_confidence / action_confidence
7. 불확실한 점
EOF
```

```bash
cat > ~/.openclaw/workspace-market/TOOLS.md <<'EOF'
### Core files
- Portfolio: /home/jaehong/.openclaw/workspace-market/portfolio.yaml

### Child agents
- market-plan
- market-research
- market-eval

### Handoff files
- /home/jaehong/.openclaw/workspace-market/handoff/plan.md
- /home/jaehong/.openclaw/workspace-market/handoff/research.md
- /home/jaehong/.openclaw/workspace-market/handoff/eval.md

### Final outputs
- /home/jaehong/.openclaw/workspace-market/reports/latest.md
- /home/jaehong/.openclaw/workspace-market/evidence/latest.md
EOF
```

---

# 11. `openclaw.json` patch

```bash
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.$(date +%F-%H%M%S)
```

```bash
python3 - <<'PY'
import json
from pathlib import Path

p = Path.home() / ".openclaw" / "openclaw.json"
data = json.loads(p.read_text())

agents = data.setdefault("agents", {})
alist = agents.setdefault("list", [])
by_id = {a["id"]: a for a in alist}

def ensure_agent(aid, workspace):
    a = by_id.get(aid)
    if not a:
        a = {"id": aid}
        alist.append(a)
        by_id[aid] = a
    a["workspace"] = workspace
    a["agentDir"] = f"/home/jaehong/.openclaw/agents/{aid}/agent"
    return a

market = ensure_agent("market", "/home/jaehong/.openclaw/workspace-market")
market["tools"] = {
    "profile": "coding",
    "deny": ["group:runtime", "group:web", "group:automation"]
}
market["subagents"] = {
    "allowAgents": ["market-plan", "market-research", "market-eval"]
}

plan = ensure_agent("market-plan", "/home/jaehong/.openclaw/workspace-market-plan")
plan["tools"] = {
    "profile": "coding",
    "deny": ["group:runtime", "group:web", "group:automation"]
}

research = ensure_agent("market-research", "/home/jaehong/.openclaw/workspace-market-research")
research["tools"] = {
    "profile": "coding",
    "deny": ["group:automation"]
}

eval_agent = ensure_agent("market-eval", "/home/jaehong/.openclaw/workspace-market-eval")
eval_agent["tools"] = {
    "profile": "coding",
    "deny": ["group:runtime", "group:web", "group:automation"]
}

defaults = agents.setdefault("defaults", {})
subd = defaults.setdefault("subagents", {})
subd.setdefault("runTimeoutSeconds", 300)
subd.setdefault("archiveAfterMinutes", 60)

p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print("patched:", p)
PY
```

문법 확인:

```bash
python3 -m json.tool ~/.openclaw/openclaw.json >/dev/null && echo OK
```

Gateway 재시작:

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
sleep 2
openclaw gateway probe
```

---

# 12. market_bot Telegram 연결

## market_bot 생성

Telegram `@BotFather` 에서 새 bot 생성:

```text
/newbot
```

## `openclaw.json` 에 market Telegram account 추가

```bash
python3 - <<'PY'
import json
from pathlib import Path

p = Path.home() / ".openclaw" / "openclaw.json"
data = json.loads(p.read_text())

tg = data.setdefault("channels", {}).setdefault("telegram", {})
accounts = tg.setdefault("accounts", {})
accounts["market"] = {
    "botToken": "MARKET_BOT_TOKEN"
}

bindings = data.setdefault("bindings", [])

wanted = {
    "agentId": "market",
    "match": {
        "channel": "telegram",
        "accountId": "market"
    }
}

exists = any(
    b.get("agentId") == "market"
    and b.get("match", {}).get("channel") == "telegram"
    and b.get("match", {}).get("accountId") == "market"
    for b in bindings
)

if not exists:
    bindings.append(wanted)

p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print("patched:", p)
PY
```

문법 확인:

```bash
python3 -m json.tool ~/.openclaw/openclaw.json >/dev/null && echo OK
```

Gateway 재시작:

```bash
export PATH="$HOME/.openclaw/bin:$PATH"
hash -r

systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
sleep 2
openclaw gateway probe
openclaw agents bindings
```

기대 routing:

```text
main <- telegram accountId=chief
calendar <- telegram accountId=calendar
market <- telegram accountId=market
```

## market_bot DM pairing

Telegram `market_bot` 에 `/start` 또는 아무 메시지 보내기.

로그 보기:

```bash
openclaw logs --follow
```

로그 예시:

- `pairing code`: 예시 `ZDNV8VVR`
- `chatId`: 예시 `8052215537`

승인:

```bash
openclaw pairing approve telegram ZDNV8VVR
```

chat id 저장:

```bash
export MARKET_REPORT_CHAT_ID=8052215537
printf '\nMARKET_REPORT_CHAT_ID=%s\n' "$MARKET_REPORT_CHAT_ID" >> ~/.openclaw/.env
chmod 600 ~/.openclaw/.env
```

---

# 13. 개별 테스트

## market-plan

```bash
openclaw agent --agent market-plan \
  --message 'portfolio.yaml을 읽고 오늘 아침 체크리스트를 작성하고 handoff/plan.md에 저장해줘.'
```

확인:

```bash
cat ~/.openclaw/workspace-market/handoff/plan.md
```

## market-research

```bash
openclaw agent --agent market-research \
  --message 'plan.md를 참고해서 오늘 아침 리서치 결과를 작성하고 handoff/research.md에 저장해줘.'
```

확인:

```bash
sed -n '1,220p' ~/.openclaw/workspace-market/handoff/research.md
```

## market-eval

```bash
openclaw agent --agent market-eval \
  --message 'plan.md와 research.md를 읽고 평가 결과를 handoff/eval.md에 저장해줘.'
```

확인:

```bash
cat ~/.openclaw/workspace-market/handoff/eval.md
```

## market orchestrator

```bash
openclaw agent --agent market \
  --message 'handoff에 이미 있는 plan.md, research.md, eval.md를 읽고 final morning brief를 생성해줘. reports/latest.md와 evidence/latest.md를 작성하고 검증한 뒤 한국어로 요약해줘.'
```

확인:

```bash
cat ~/.openclaw/workspace-market/reports/latest.md
echo '---'
cat ~/.openclaw/workspace-market/evidence/latest.md
```

---

# 14. cron 등록

## 테스트용 one-shot cron

```bash
openclaw cron add \
  --name "Market Brief Test" \
  --at "1m" \
  --session isolated \
  --agent market \
  --message 'handoff를 바탕으로 reports/latest.md와 evidence/latest.md를 작성하고, 간단한 테스트 브리프를 보내줘.' \
  --announce \
  --channel telegram \
  --to "$MARKET_REPORT_CHAT_ID"
```

확인:

```bash
openclaw cron list
openclaw cron runs --limit 20
```

## 정식 cron (평일 오전 8시)

```bash
openclaw cron add \
  --name "Morning Market Brief" \
  --cron "0 8 * * 1-5" \
  --tz "Asia/Seoul" \
  --exact \
  --session isolated \
  --agent market \
  --message 'portfolio.yaml을 바탕으로 morning brief 전체 흐름을 수행해줘. market-plan, market-research, market-eval을 순서대로 사용하고, 마지막에 reports/latest.md와 evidence/latest.md를 작성하고 검증해줘.' \
  --announce \
  --channel telegram \
  --to "8052215537"
```

매일 8시로 변경하려면:

```bash
--cron "0 8 * * *"
```

상태 확인:

```bash
openclaw cron list
openclaw cron status
openclaw cron runs --limit 20
```

---

# 15. 트러블슈팅

## `openclaw: command not found`

```bash
export PATH="$HOME/.openclaw/bin:$PATH"
hash -r
```

## `openclaw gateway probe` timeout

```bash
systemctl --user status openclaw-gateway.service --no-pager -l
journalctl --user -u openclaw-gateway.service -n 100 --no-pager
```

## `nano` 에서 `xterm-ghostty` 에러

```bash
export TERM=xterm-256color
nano ~/.openclaw/.env
```

## Telegram DM / pairing 문제

로그 확인:

```bash
openclaw logs --follow
```

pairing 승인:

```bash
openclaw pairing approve telegram <PAIRING_CODE>
```

## cron이 안 온 경우

```bash
openclaw cron list
openclaw cron runs --limit 20
openclaw channels status --probe
openclaw logs --follow
```

> `0 8 * * 1-5` 는 **월~금 오전 8시**이고, 토요일에는 안 오는 것이 정상이다.

---

# 16. 현재 최종 상태 요약

완료된 것:

- `market_bot` 생성 및 라우팅 연결
- Tavily 검색 연결
- Alpha Vantage 연동
- `market` / `market-plan` / `market-research` / `market-eval` 구조 생성
- 실제 보유 포트폴리오 반영
- handoff 기반 오케스트레이션 확인
- `reports/latest.md`, `evidence/latest.md` 생성 확인
- `market_bot` DM 테스트 수신 확인
- 정식 cron 등록 가능 상태 확보

추후 하면 좋은 것:

- 브리프 포맷 추가 개선
- 한국 ETF용 추가 데이터 소스 보강
- 주간 회고 브리프 cron 추가
- confidence 규칙 세분화
