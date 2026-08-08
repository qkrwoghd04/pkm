---
id: agents/market/automation
id_aliases:
  - public/agents/market/automation
title: Market Agent 자동 실행
description: Market 아침 브리프의 one-shot 검증과 평일 오전 예약 실행을 등록·점검하는 OpenClaw Cron 절차.
status: active
updated: 2026-07-30
tags:
  - domain/agent-automation
  - tech/openclaw
  - concern/automation
  - concern/notifications
aliases:
  - Morning Market Brief Cron
  - market-agent/09-cron
---

Market Agent의 one-shot 테스트 cron과 정식 아침 브리프 cron을 등록한다.

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

## 정식 cron: 평일 오전 8시

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
  --to "$MARKET_REPORT_CHAT_ID"
```

매일 8시로 변경하려면:

```bash
--cron "0 8 * * *"
```

## 상태 확인

```bash
openclaw cron list
openclaw cron status
openclaw cron runs --limit 20
```

## 주의

`0 8 * * 1-5`는 월~금 오전 8시 실행이다. 토요일에는 실행되지 않는 것이 정상이다.

## 관련 문서

- [[index|Market Agent]]
- [[configuration|OpenClaw 설정]]
- [[telegram|Telegram 연결]]
- [[runbook|운영 런북]]
