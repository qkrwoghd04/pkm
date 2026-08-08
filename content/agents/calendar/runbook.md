---
id: agents/calendar/runbook
id_aliases:
  - public/agents/calendar/runbook
title: Calendar Agent 운영 런북
description: Calendar Agent와 관련 홈서버, Tailscale, OpenClaw, gog를 점검하고 장애를 복구하는 운영 절차.
status: active
updated: 2026-07-30
aliases:
  - Calendar Agent Runbook
  - calendar-agent/06-runbook
tags:
  - domain/agent-automation
  - tech/openclaw
  - tech/google-calendar
  - concern/operations
  - concern/recovery
created: 2026-04-24
source: calendar.md
---

## 목적

Zenbook 기반 OpenClaw + Telegram + Google Calendar 비서 서버의 일상 점검, 장애 확인, 복구 순서를 빠르게 보기 위한 런북이다.

## 1. 서버 기본 점검

```bash
hostname
hostname -I
ip a
systemctl status ssh
```

## 2. SSH 접속

로컬 IP 접속:

```bash
ssh [내 서버 사용자명]@[내 서버 로컬 IP 주소]
```

Tailscale IP 접속:

```bash
ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

또는:

```bash
tailscale ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

## 3. 절전 방지 확인

```bash
sudo systemd-analyze cat-config systemd/logind.conf | grep -E 'HandleLidSwitch'
```

정상 기준:

- `HandleLidSwitch=ignore`
- `HandleLidSwitchExternalPower=ignore`
- `HandleLidSwitchDocked=ignore`

## 4. Tailscale 점검

```bash
tailscale status
tailscale ip -4
sudo tailscale set --ssh
```

## 5. OpenClaw 점검

```bash
openclaw --version
openclaw doctor
openclaw status
openclaw gateway status
openclaw gateway probe
openclaw logs --follow
```

systemd 로그:

```bash
journalctl --user -u openclaw-gateway.service -n 200 --no-pager
```

포트 확인:

```bash
ss -ltnp | grep 18789
```

Gateway 재시작:

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
openclaw gateway probe
```

## 6. gog 점검

```bash
which gog
gog --help
gog auth status
gog auth list
gog -a [내 구글 계정] calendar calendars --plain
```

`gog`가 keyring 비밀번호를 요구하면 현재 셸에서 임시로 export한다.

```bash
export GOG_KEYRING_PASSWORD='[내 keyring 비밀번호]'
```

## 7. Calendar 생성 테스트

```bash
CAL_ID='[내 기본 캘린더 ID]'

gog -a [내 구글 계정] calendar create "$CAL_ID" \
  --summary "테스트 일정" \
  --from 2026-04-12T13:00:00+09:00 \
  --to 2026-04-12T14:00:00+09:00 \
  --location "테스트 장소" \
  --description "gog 생성 테스트"
```

중요:

- 제목 옵션은 `--title`이 아니라 `--summary`다.

## 8. Morning Brief 점검

Cron과 Telegram 채널 상태를 확인한다.

```bash
openclaw cron list --all
openclaw channels status --probe
```

정상 기준:

- Calendar Morning Brief가 매일 08:00 Asia/Seoul로 등록돼 있다.
- 최근 실행 상태가 `ok`다.
- Calendar Telegram 채널이 `works` 상태다.
- timeout은 90초다.
- 첫 오류부터 알림을 보내고 반복 알림 cooldown은 6시간이다.

읽기 전용 회귀 점검:

- Cron 선언이 고정 조회 3개만 실행하는지 확인한다.
- `events`와 `conflicts` 외 Calendar 명령이 없는지 확인한다.
- `create`, `update`, `delete`, `respond`가 호출되지 않았는지 확인한다.
- Cron 설정을 변경했다면 실행 전후 Calendar 이벤트 해시를 비교한다.

Cron UUID와 Telegram chat ID는 공개 문서에 기록하지 않는다.

## 9. 현재 상태 요약

현재까지 확실히 된 것:

- Ubuntu Server 설치 완료
- SSH 접속 성공
- 덮개 닫아도 절전 안 되게 설정 완료
- Tailscale 설치 및 접속 경로 확보
- OpenClaw 설치 및 Telegram 연결 경험 있음
- Google OAuth 완료
- gog 설치 완료
- gog로 캘린더 조회 가능
- OpenClaw systemd 환경에서 Calendar 조회 가능
- Calendar Morning Brief 실제 Cron 상태 `ok`
- Calendar Telegram 전달 성공
- 예약 실행의 읽기 전용 동작 검증 완료

운영 중 계속 확인할 것:

- OAuth와 keyring 인증 상태
- 최근 Cron 실행 상태와 실패 알림
- 도구 또는 Cron 선언 변경 후 읽기 전용 회귀 여부

## 10. 처음부터 복구하는 최단 순서

1. Ubuntu Server 설치
2. `apt update && apt full-upgrade`
3. `openssh-server`, `curl`, `git`, `tmux` 설치
4. SSH 접속 확인
5. lid close ignore 설정
6. Tailscale 설치
7. OpenClaw 설치 + onboard
8. Telegram bot 연결 + pairing 승인
9. Google Cloud OAuth Desktop app JSON 발급
10. Linuxbrew 설치
11. `gog` 설치
12. `gog auth credentials`
13. `gog auth add --services calendar --manual`
14. `gog calendar calendars --plain`
15. `gog calendar create ... --summary ...`
16. `.openclaw/.env`, `AGENTS.md`, `TOOLS.md` 정리
17. Gateway 재시작 후 Telegram 테스트
18. 비공개 백업에서 Morning Brief Cron 선언 복원
19. Cron과 Calendar Telegram 전달 확인
20. 실행 전후 Calendar 이벤트 해시 비교

## 11. 빠른 장애 분기

### SSH가 안 됨

1. 서버가 켜져 있는지 확인
2. 서버가 Wi‑Fi 또는 유선 LAN에 붙어 있는지 확인
3. 로컬 IP가 바뀌었는지 `hostname -I`로 확인
4. Tailscale IP 접속 시도

### OpenClaw가 Telegram 응답을 안 함

1. `openclaw gateway status`
2. `openclaw gateway probe`
3. `openclaw logs --follow`
4. Telegram pairing code 재확인
5. Gateway 재시작

### OpenClaw에서는 gog가 안 됨

1. `which gog` 확인
2. `/home/linuxbrew/.linuxbrew/bin`이 PATH에 있는지 확인
3. `~/.openclaw/.env`에 `PATH`와 `GOG_KEYRING_PASSWORD`가 있는지 확인
4. `chmod 600 ~/.openclaw/.env`
5. Gateway 재시작

### Morning Brief가 안 옴

1. `openclaw cron list --all`에서 최근 실행 상태를 확인한다.
2. `openclaw channels status --probe`에서 Calendar Telegram 상태를 확인한다.
3. job timeout과 실패 알림 기록을 확인한다.
4. `events`, `conflicts` 조회가 현재 `gog` 버전에서 동작하는지 확인한다.
5. 쓰기 명령을 추가하지 않은 상태로 테스트 실행한다.

## 관련 문서

- [[../../systems/home-server/setup|Ubuntu 홈서버 초기 구축]]
- [[../../systems/home-server/networking|SSH와 Tailscale 네트워크 운영]]
- [[../../systems/openclaw/gateway|OpenClaw Gateway와 Telegram 연결]]
- [[../../integrations/google-calendar-gog|Google Calendar와 gog CLI 연동]]
- [[architecture|Calendar Agent 구조와 연동]]
- [[morning-brief|Calendar Morning Brief]]
