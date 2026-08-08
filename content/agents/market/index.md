---
id: agents/market
id_aliases:
  - public/agents/market
title: Market Agent
description: 시장 조사, 평가, 아침 브리프 생성을 역할별 에이전트로 분리해 Telegram으로 전달하는 OpenClaw 시스템의 지식 지도.
status: active
updated: 2026-07-30
tags:
  - domain/agent-automation
  - tech/openclaw
  - concern/market-research
aliases:
  - 자산 관리 비서
  - OpenClaw Market Agent
  - market-agent
  - market-agent/index
---

> [!summary]
> Market Agent는 계획, 조사, 평가, 최종 브리프 생성을 분리하고 결과와 근거를 파일로 보존한다.

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

## Reading path

1. [[prerequisites|사전 준비]]
2. [[architecture|구조와 역할]]
3. [[portfolio-model|포트폴리오 모델]]
4. [[operating-rules|운영 지침]]
5. [[configuration|OpenClaw 설정]]
6. [[telegram|Telegram 연결]]
7. [[testing|테스트]]
8. [[automation|자동 실행]]
9. [[runbook|운영과 복구]]

## Shared systems and integrations

- [[../../systems/openclaw/index|OpenClaw]]
- [[../../integrations/alpha-vantage|Alpha Vantage]]
- [[../../playbooks/security-hardening|Ubuntu Server 보안 하드닝]]
