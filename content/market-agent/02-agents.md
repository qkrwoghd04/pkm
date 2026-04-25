---
title: Agents
tags:
  - openclaw
  - market
  - agents
  - workspace
aliases:
  - Market Agents
---

# Agents

Market Agent는 orchestrator인 `market`과 child agent인 `market-plan`, `market-research`, `market-eval`로 구성한다.

## Agent 생성

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

## Agent auth/models 복사

새 agent는 `sessions/`만 생기고 `agent/` 디렉토리가 없을 수 있으므로 `main` 기준 auth/models를 복사한다.

```bash
for AG in market market-plan market-research market-eval; do
  mkdir -p ~/.openclaw/agents/$AG/agent
  cp ~/.openclaw/agents/main/agent/auth-profiles.json ~/.openclaw/agents/$AG/agent/auth-profiles.json
  cp ~/.openclaw/agents/main/agent/models.json ~/.openclaw/agents/$AG/agent/models.json
  chmod 600 ~/.openclaw/agents/$AG/agent/auth-profiles.json
  chmod 600 ~/.openclaw/agents/$AG/agent/models.json
done
```

## Workspace 구조 생성

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

## 역할 요약

| Agent | 역할 | 주요 출력 |
|---|---|---|
| `market` | 전체 orchestration | `reports/latest.md`, `evidence/latest.md` |
| `market-plan` | 아침 리서치 체크리스트 생성 | `handoff/plan.md` |
| `market-research` | 뉴스/데이터 근거 수집 | `handoff/research.md` |
| `market-eval` | 근거 기반 신뢰도 평가 | `handoff/eval.md` |
