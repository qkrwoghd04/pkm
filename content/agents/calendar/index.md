---
title: Calendar Agent
description: Telegram 요청을 Google Calendar 작업으로 연결하는 OpenClaw 일정 관리 에이전트의 개요와 지식 지도.
status: active
updated: 2026-07-30
aliases:
  - 일정 관리 비서
  - Calendar Assistant
  - calendar-agent
  - calendar-agent/index
  - calendar-agent/00-index
tags:
  - agent/calendar
  - openclaw
  - calendar
  - pkm
  - agent
created: 2026-04-24
source: calendar.md
---

> [!summary]
> Calendar Agent는 Telegram의 일정 요청을 OpenClaw와 `gog`를 통해 Google Calendar 작업으로 연결한다.

## 목적

Telegram에서 일정을 조회·생성하고, 명시적 요청에 따라 수정·삭제할 수 있는 개인 일정 관리 인터페이스를 운영한다.

## 동작 구조

```text
Telegram
  → OpenClaw Gateway
  → Calendar Agent
  → gog CLI
  → Google Calendar
```

## 주요 기능

- 일정 조회
- 명시적 일정 생성
- 수정·삭제 전 요청 확인
- Telegram 결과 전달

## Reading path

1. [[architecture|구조와 gog 연동]]
2. [[runbook|운영과 복구]]

## Shared systems and integrations

- [[../../systems/home-server/index|Ubuntu Home Server]]
- [[../../systems/openclaw/gateway|OpenClaw Gateway와 Telegram]]
- [[../../integrations/google-calendar-gog|Google Calendar와 gog CLI]]
- [[../../playbooks/security-hardening|Ubuntu Server 보안 하드닝]]

## 운영 경계

- Google OAuth JSON, Telegram bot token, `GOG_KEYRING_PASSWORD`는 PKM에 평문으로 보관하지 않는다.
- 날짜나 시간이 모호하면 실행 전에 확인한다.
- 기본 캘린더 외 쓰기는 명시적으로 승인된 경우에만 수행한다.
- 수정·삭제는 명시 요청 없이는 수행하지 않는다.
