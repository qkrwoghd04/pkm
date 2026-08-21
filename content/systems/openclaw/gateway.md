---
id: systems/openclaw/gateway
id_aliases:
  - public/systems/openclaw/gateway
title: OpenClaw Gateway와 Telegram 연결
description: Ubuntu 홈서버에 OpenClaw Gateway를 설치하고 Telegram bot을 연결·페어링하는 공용 기반 절차.
status: active
updated: 2026-07-30
aliases:
  - OpenClaw Gateway Telegram 연결
  - calendar-agent/03-gateway
tags:
  - domain/agent-automation
  - tech/openclaw
  - tech/telegram
  - concern/routing
  - concern/systemd
created: 2026-04-24
---

## 목적

Zenbook Ubuntu Server에 OpenClaw를 설치하고, Telegram bot을 통해 개인 비서 인터페이스를 붙이는 절차다.

## 1. OpenClaw 설치

권장 설치:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

기본 installer가 NodeSource 단계에서 멈추면 우회 설치:

```bash
curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
```

설치 확인:

```bash
openclaw --version
openclaw doctor
```

## 2. OpenClaw 온보딩

권장 방식:

```bash
openclaw onboard --install-daemon
```

진행 중 선택 기준:

- 개인용 서버 전제: Yes
- gateway token 생성: Yes
- `~/.openclaw` 권한 강화: Yes
- bash shell completion: Yes
- gateway service 설치: Yes
- gateway service 이미 있으면: Restart
- bot hatch: Hatch in TUI
- hooks: Skip for now
- web search provider: Skip for now
- skill dependencies는 나중에 필요한 것만 선택

## 3. `gateway.mode` 문제

중간에 Gateway가 안 뜨고 아래 에러가 난 적이 있다.

```text
existing config is missing gateway.mode
```

이 경우 재온보딩한다.

```bash
openclaw onboard --mode local
```

## 4. Gateway 상태 확인

상태:

```bash
openclaw gateway status
openclaw gateway probe
openclaw status
```

로그 확인:

```bash
journalctl --user -u openclaw-gateway.service -n 200 --no-pager
openclaw logs --follow
```

포트 확인:

```bash
ss -ltnp | grep 18789
```

## 5. Telegram bot 생성

기본 흐름:

1. Telegram에서 `@BotFather` 열기
2. `/newbot`
3. bot name 지정
4. bot username 지정. 반드시 `...bot`으로 끝나야 함
5. bot token 발급
6. OpenClaw 설정에 bot token 입력

> Telegram bot token은 PKM에 평문으로 보관하지 않는다.

## 6. Pairing 승인

Telegram에서 pairing code가 뜨면 서버에서 승인한다.

```bash
openclaw pairing approve telegram <PAIRING_CODE>
```

예시:

```bash
openclaw pairing approve telegram 9J632JTQ
```

## 7. Telegram에서 일정 요청 예시

OpenClaw가 정상 인식하면 Telegram에서 다음처럼 요청한다.

```text
기본 캘린더에 2026년 4월 12일 오후 1시부터 2시까지 "테너 특순 연습" 일정 생성해줘. 장소는 성가대실, 설명은 "5월 특순 연습"이야. gog를 사용해.
```

권장:

- 처음에는 짧고 명확한 한 건만 테스트
- 날짜, 시간, 제목, 장소, 설명을 명시
- 애매한 날짜/시간 표현은 피함

## 8. 오케스트레이터 구상

현재는 일정관리 에이전트 하나만 만든 상태다.

향후 추천 구조:

- `calendar` 에이전트: 일정 생성/조회 전용
- `chief` 또는 `ops` 에이전트: 상위 orchestrator
  - sub-agent 호출
  - cron/standing orders 관리
  - Telegram 공개 봇과 분리된 private control 채널에서 사용

## 관련 문서

- [[../../integrations/google-calendar-gog|Google Calendar와 gog CLI 연동]]
- [[../../agents/calendar/architecture|Calendar Agent 구조와 연동]]
- [[../../agents/calendar/runbook|Calendar Agent 운영 런북]]
