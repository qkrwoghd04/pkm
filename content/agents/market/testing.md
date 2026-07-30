---
title: Market Agent 테스트
description: Market의 plan, research, eval child agent와 orchestrator를 개별 검증하는 명령과 통과 기준.
status: active
updated: 2026-07-30
tags:
  - agent/market
  - openclaw
  - market
  - testing
aliases:
  - Market Agent Testing
  - market-agent/08-testing
---

Market Agent의 child agent와 orchestrator를 개별적으로 테스트한다.

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

## 테스트 기준

- `handoff/plan.md`가 생성되는가
- `handoff/research.md`가 facts / interpretations / open questions / evidence bundle 구조를 갖는가
- `handoff/eval.md`가 confidence score를 포함하는가
- `reports/latest.md`, `evidence/latest.md`가 생성되는가
- Telegram으로 요약이 전달되는가
- 불확실성이 명시되는가
- 실제 매매 실행처럼 표현하지 않는가
