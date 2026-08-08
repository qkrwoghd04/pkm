---
id: agents/market/runbook
id_aliases:
  - public/agents/market/runbook
title: Market Agent 운영 런북
description: Market Agent의 CLI, Gateway, Telegram, Cron 장애를 점검하고 복구하는 운영 절차.
status: active
updated: 2026-07-30
tags:
  - domain/agent-automation
  - tech/openclaw
  - concern/operations
  - concern/recovery
aliases:
  - Market Agent Runbook
  - market-agent/10-runbook
---

Market Agent 운영 중 자주 보는 문제, 현재 상태, 추후 개선 항목을 정리한다.

## Troubleshooting

### `openclaw: command not found`

```bash
export PATH="$HOME/.openclaw/bin:$PATH"
hash -r
```

### `openclaw gateway probe` timeout

```bash
systemctl --user status openclaw-gateway.service --no-pager -l
journalctl --user -u openclaw-gateway.service -n 100 --no-pager
```

### `nano`에서 `xterm-ghostty` 에러

```bash
export TERM=xterm-256color
nano ~/.openclaw/.env
```

### Telegram DM / pairing 문제

로그 확인:

```bash
openclaw logs --follow
```

pairing 승인:

```bash
openclaw pairing approve telegram <PAIRING_CODE>
```

### cron이 안 온 경우

```bash
openclaw cron list
openclaw cron runs --limit 20
openclaw channels status --probe
openclaw logs --follow
```

`0 8 * * 1-5`는 월~금 오전 8시이므로 토요일에는 안 오는 것이 정상이다.

## 현재 최종 상태 요약

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

## 추후 개선

- 브리프 포맷 추가 개선
- 한국 ETF용 추가 데이터 소스 보강
- 주간 회고 브리프 cron 추가
- confidence 규칙 세분화

## 복구 순서 요약

1. OpenClaw PATH와 Gateway 상태 확인
2. Tavily web provider 설정 확인
3. Alpha Vantage API key `.env` 반영
4. market 계열 agent 생성
5. auth/models 복사
6. workspace와 handoff 파일 생성
7. `portfolio.yaml` 작성
8. Alpha Vantage helper script 생성 및 테스트
9. 각 agent의 `AGENTS.md`, `TOOLS.md` 작성
10. `openclaw.json` patch
11. Gateway 재시작
12. Telegram `market_bot` 생성 및 pairing
13. child agent 개별 테스트
14. orchestrator 테스트
15. cron 등록 및 run 확인

## 관련 문서

- [[index|Market Agent]]
- [[testing|테스트]]
- [[automation|자동 실행]]
- [[configuration|OpenClaw 설정]]
