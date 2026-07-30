---
title: Integration
tags:
  - openclaw
  - calendar-agent
  - gog
  - systemd
  - telegram
created: 2026-04-24
source: calendar.md
---

# OpenClaw Calendar Agent와 gog 연동

## 목적

Telegram에서 OpenClaw에게 일정 생성을 요청하면 OpenClaw가 서버의 `gog` CLI를 사용해 Google Calendar 이벤트를 생성하도록 연결한다.

## 1. 문제 상황

SSH 셸에서 아래처럼 환경변수를 export해도:

```bash
export GOG_KEYRING_PASSWORD='[내 keyring 비밀번호]'
```

OpenClaw는 systemd user service로 돌기 때문에 현재 셸의 환경변수를 자동으로 받지 않는다.

결과:

- 터미널에서 `gog`는 됨
- Telegram/OpenClaw 안에서는 `gog` 환경이 안 보일 수 있음

## 2. 해결 방향

OpenClaw 서비스가 읽을 수 있도록 `.env` 및 작업 지침 파일을 추가한다.

## 3. OpenClaw 환경 파일

```bash
mkdir -p ~/.openclaw
cat >> ~/.openclaw/.env <<'EOF'
PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/bin:/usr/bin:/bin
GOG_KEYRING_PASSWORD=[내 keyring 비밀번호]
EOF
chmod 600 ~/.openclaw/.env
```

주의:

- 실제 `GOG_KEYRING_PASSWORD` 값은 PKM에 적지 않는다.
- `.env` 파일 권한은 반드시 `600`으로 제한한다.
- OpenClaw Gateway 재시작 후 반영 여부를 확인한다.

## 4. AGENTS.md

```bash
mkdir -p ~/.openclaw/workspace
cat > ~/.openclaw/workspace/AGENTS.md <<'EOF'
You are [내 비서 이름], [내 이름]'s personal calendar assistant.
When [내 이름] asks in Telegram to add a schedule, create a Google Calendar event.
Default timezone is Asia/Seoul.
Use the host CLI tool "gog" for Google Calendar actions.
Until explicitly approved, write only to the calendar "[내 기본 캘린더 ID]".
If the date or time is ambiguous, ask one short follow-up question.
After creating an event, reply with title, date, start time, end time, and calendar name.
Do not modify or delete events unless explicitly requested.
EOF
```

## 5. TOOLS.md

```bash
cat > ~/.openclaw/workspace/TOOLS.md <<'EOF'
Google Calendar is managed with gog.
For event creation, gog uses --summary, --from, --to, --location, and --description.
Account: [내 구글 계정]
Default calendar: [내 기본 캘린더 ID]
EOF
```

## 6. Gateway 재시작

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
openclaw gateway probe
```

## 7. Telegram에서 일정 요청 테스트

예시:

```text
기본 캘린더에 2026년 4월 12일 오후 1시부터 2시까지 "테너 특순 연습" 일정 생성해줘. 장소는 성가대실, 설명은 "5월 특순 연습"이야. gog를 사용해.
```

테스트 기준:

- 날짜와 시간이 명확한지
- 제목이 명확한지
- 기본 캘린더 ID로 생성되는지
- OpenClaw 응답에 제목, 날짜, 시작/종료 시각, 캘린더명이 포함되는지

## 8. 아직 추가 검증 필요한 부분

- OpenClaw systemd 서비스가 `gog` 환경을 안정적으로 읽는지
- Telegram → OpenClaw → gog → Google Calendar 생성이 완전히 자동으로 되는지

## 9. 운영 원칙

- 일정 생성은 명시 요청이 있을 때만 수행한다.
- 날짜/시간이 애매하면 한 문장으로 되묻는다.
- 수정/삭제는 명시 요청 없이는 하지 않는다.
- 기본 타임존은 Asia/Seoul이다.
- 기본 캘린더 외 쓰기는 명시 승인 후만 허용한다.

## 관련 노트

- [[03-gateway]]
- [[04-google-cli]]
- [[06-runbook]]
