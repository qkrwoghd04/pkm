---
title: Market Agent
type: agent
tags:
  - openclaw
  - market
  - telegram
  - pkm
aliases:
  - 자산 관리 비서
  - OpenClaw Market Agent
---

# Market Agent

OpenClaw 기반 개인 자산 관리/시장 브리프 에이전트 구축 기록이다.

## 목적

- 매일 아침 8시 시장 브리프 생성
- Telegram `market_bot` DM으로 브리프 수신
- `market -> market-plan / market-research / market-eval` 구조로 리서치, 평가, 브리프 생성을 분리
- `reports/latest.md`, `evidence/latest.md`를 통해 결과와 근거를 보관

## 대상 환경

- 서버: `[내 서버 호스트명]` Ubuntu Server
- OpenClaw Gateway: local / loopback
- Telegram bot 구성:
  - `chief_bot` → `main`
  - `calendar_bot` → `calendar`
  - `market_bot` → `market`
- 웹 검색: Tavily
- 시장/환율/실적 데이터: Alpha Vantage
- 기본 시간대: `Asia/Seoul`

## 전체 구조

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

## Notes

- [[market-agent/01-prerequisites|Prerequisites]] — OpenClaw PATH, Gateway, Tavily, Alpha Vantage API key
- [[market-agent/02-agents|Agents]] — market 계열 agent 생성, auth/models 복사, workspace 구조
- [[market-agent/03-portfolio|Portfolio]] — `portfolio.yaml` 구성
- [[market-agent/04-alpha-vantage|Alpha Vantage]] — Alpha Vantage helper script와 테스트
- [[market-agent/05-instructions|Instructions]] — `AGENTS.md`, `TOOLS.md` 지침
- [[market-agent/06-openclaw-config|OpenClaw Config]] — `openclaw.json` patch
- [[market-agent/07-telegram|Telegram]] — `market_bot` 라우팅, pairing, chat id 저장
- [[market-agent/08-testing|Testing]] — 개별 agent 및 orchestrator 테스트
- [[market-agent/09-cron|Cron]] — one-shot cron, 평일 오전 8시 cron
- [[market-agent/10-runbook|Runbook]] — 트러블슈팅, 현재 상태, 추후 개선
