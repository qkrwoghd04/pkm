---
id: agents/market/configuration
id_aliases:
  - public/agents/market/configuration
title: Market Agent OpenClaw 설정
description: openclaw.json에 Market 계열 agent의 workspace, tool policy, subagent 구성을 반영하고 검증하는 방법.
status: active
updated: 2026-07-30
tags:
  - domain/agent-automation
  - tech/openclaw
  - concern/configuration
aliases:
  - openclaw.json
  - market-agent/06-openclaw-config
---

`openclaw.json`에 market 계열 agent의 workspace, agentDir, tool policy, subagent 설정을 반영한다.

## Backup

```bash
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak.$(date +%F-%H%M%S)
```

## Patch

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
    a["agentDir"] = f"/home/[내 서버 사용자명]/.openclaw/agents/{aid}/agent"
    return a

market = ensure_agent("market", "/home/[내 서버 사용자명]/.openclaw/workspace-market")
market["tools"] = {
    "profile": "coding",
    "deny": ["group:runtime", "group:web", "group:automation"]
}
market["subagents"] = {
    "allowAgents": ["market-plan", "market-research", "market-eval"]
}

plan = ensure_agent("market-plan", "/home/[내 서버 사용자명]/.openclaw/workspace-market-plan")
plan["tools"] = {
    "profile": "coding",
    "deny": ["group:runtime", "group:web", "group:automation"]
}

research = ensure_agent("market-research", "/home/[내 서버 사용자명]/.openclaw/workspace-market-research")
research["tools"] = {
    "profile": "coding",
    "deny": ["group:automation"]
}

eval_agent = ensure_agent("market-eval", "/home/[내 서버 사용자명]/.openclaw/workspace-market-eval")
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

## 문법 확인

```bash
python3 -m json.tool ~/.openclaw/openclaw.json >/dev/null && echo OK
```

## Gateway 재시작

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
sleep 2
openclaw gateway probe
```

## 설정 의도

| Agent             | Tool policy                 | 이유                                           |
| ----------------- | --------------------------- | ---------------------------------------------- |
| `market`          | runtime/web/automation deny | orchestrator는 child agent와 파일 handoff 중심 |
| `market-plan`     | runtime/web/automation deny | 계획 agent는 실행/검색 없이 체크리스트 작성    |
| `market-research` | automation deny             | web/data 수집 필요, 자동화 실행은 차단         |
| `market-eval`     | runtime/web/automation deny | 주어진 근거만 평가                             |

## 관련 문서

- [[index|Market Agent]]
- [[architecture|구조와 역할]]
- [[telegram|Telegram 연결]]
- [[../../systems/openclaw/index|OpenClaw]]
