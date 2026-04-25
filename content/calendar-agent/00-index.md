---
title: Calendar Agent
type: index
tags:
  - openclaw
  - calendar
  - pkm
  - agent
created: 2026-04-24
source: calendar.md
---

# 일정 관리 비서 구축

## 전체 목표

ASUS Zenbook을 Ubuntu Server 기반 개인 비서 서버로 구성하고, OpenClaw + Telegram + Google Calendar를 연결해 Telegram에서 일정 생성/조회가 가능하도록 운영한다.

```text
MacBook Pro
  ├─ SSH / Tailscale SSH
  └─ 서버 운영

Zenbook (Ubuntu Server)
  ├─ OpenSSH Server
  ├─ Tailscale
  ├─ OpenClaw Gateway
  ├─ Telegram Bot 채널
  └─ gog (Google Calendar CLI)
```

## 노트 구성

- [[01-setup]]: Ubuntu Server 설치, 초기 패키지, lid close 절전 방지, tmux
- [[02-network]]: SSH, Tailscale, Wi‑Fi/핫스팟, Netplan
- [[03-gateway]]: OpenClaw 설치, 온보딩, Gateway 점검, Telegram bot pairing
- [[04-google-cli]]: Google Cloud OAuth, Linuxbrew, gog 설치/인증/캘린더 테스트
- [[05-integration]]: OpenClaw 서비스에서 gog를 쓰기 위한 `.env`, `AGENTS.md`, `TOOLS.md`
- [[06-runbook]]: 자주 쓰는 명령, 현재 상태, 복구 순서

## 핵심 환경

- 장비: ASUS Zenbook UX425EA
- CPU: Intel i7-1165G7
- RAM: 16GB
- 저장소: 약 477GB
- OS: Ubuntu Server 24.04 LTS
- 용도: 개인 비서 서버
- 기본 시간대: Asia/Seoul

## 핵심 계정/식별자

값은 환경마다 달라질 수 있으므로 아래 플레이스홀더를 기준으로 관리한다.

| 항목            | 값                            |
| --------------- | ----------------------------- |
| Ubuntu 사용자명 | `[내 서버 사용자명]`          |
| 서버 호스트명   | `[내 서버 호스트명]`          |
| Google 계정     | `[내 구글 계정]`              |
| 기본 캘린더 ID  | `[내 기본 캘린더 ID]`         |
| Tailscale IP    | `[내 서버 Tailscale IP 주소]` |

## 보안 메모

- Google OAuth JSON, Telegram bot token, `GOG_KEYRING_PASSWORD`는 PKM에 평문으로 보관하지 않는다.
- 실제 값은 비밀번호 관리자 또는 별도 secret store에 저장한다.
- `.openclaw/.env`는 서버에서 `chmod 600`으로 제한한다.
