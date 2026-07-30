---
title: Runbook
tags:
  - openclaw
  - calendar
  - runbook
  - recovery
  - commands
created: 2026-04-24
source: calendar.md
---

# Calendar Agent 운영 런북

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

## 8. 현재 상태 요약

현재까지 확실히 된 것:

- Ubuntu Server 설치 완료
- SSH 접속 성공
- 덮개 닫아도 절전 안 되게 설정 완료
- Tailscale 설치 및 접속 경로 확보
- OpenClaw 설치 및 Telegram 연결 경험 있음
- Google OAuth 완료
- gog 설치 완료
- gog로 캘린더 조회 가능

추가 검증이 필요한 것:

- OpenClaw systemd 서비스가 `gog` 환경을 안정적으로 읽는지
- Telegram → OpenClaw → gog → Google Calendar 생성이 완전히 자동으로 되는지

## 9. 처음부터 복구하는 최단 순서

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

## 10. 빠른 장애 분기

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

## 관련 노트

- [[01-setup]]
- [[02-network]]
- [[03-gateway]]
- [[04-google-cli]]
- [[05-integration]]
