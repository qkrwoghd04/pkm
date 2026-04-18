---
title: 일정 관리 비서
type: agent
tags:
  - openclaw
  - schedule
  - telegram
---

# Zenbook Ubuntu + OpenClaw + Telegram + Google Calendar 구축 기록

## 문서 목적

이 문서는 이번 세션에서 진행한 작업을 **처음부터 다시 따라갈 수 있도록** 정리한 복구용/운영용 문서다.

대상 환경:

- 장비: **ASUS Zenbook UX425EA**
- CPU: **Intel i7-1165G7**
- RAM: **16GB**
- 저장소: **약 477GB**
- OS: **Ubuntu Server 24.04 LTS**
- 용도: **개인 비서 서버**
- 핵심 기능:
  - Telegram으로 OpenClaw 비서 사용
  - Google Calendar 일정 조회/생성
  - 필요 시 Tailscale/SSH로 원격 접속
  - 집 Wi‑Fi + 핫스팟 백업 네트워크 운용

---

# 1. 전체 구조

## 현재 목표 구조

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

## 현재 핵심 계정/이름

- Ubuntu 사용자명: `[내 서버 사용자명]`
- 서버 호스트명: `[내 서버 호스트명]`
- Google 계정: `[내 구글 계정]`

---

# 2. Ubuntu Server 설치

## 2-1. 설치 USB 만들기

Ubuntu Server ISO로 설치 USB 생성.

권장:

- **Ubuntu Server 24.04 LTS**
- Mac에서 **balenaEtcher**로 굽기 권장

## 2-2. 설치 시 기본 선택

설치 과정에서 대체로 아래 기준으로 진행했다.

- Ubuntu Server
- OpenSSH server 설치 체크
- 서드파티 드라이버는 기본적으로 체크하지 않음
- 계정 생성:
  - name: `[내 이름]`
  - server name: `[내 서버 호스트명]`
  - username: `[내 서버 사용자명]`

---

# 3. Ubuntu 최초 세팅

로그인 후 먼저 실행:

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y openssh-server curl git vim tmux
```

## SSH 상태 확인

```bash
systemctl status ssh
```

정상이면 `active (running)` 이 보인다.

## 현재 IP 확인

```bash
ip a
```

또는 더 간단히:

```bash
hostname -I
```

예시:

```bash
ssh [내 서버 사용자명]@[내 서버 로컬 IP 주소]
```

---

# 4. 맥북에서 SSH 접속

맥북 터미널에서:

```bash
ssh [내 서버 사용자명]@[내 서버 로컬 IP 주소]
```

처음 접속 시:

- 호스트 키 확인 문구가 뜨면 `yes`
- 비밀번호 입력

---

# 5. 덮개 닫아도 절전 안 되게 설정

서버로 계속 쓰기 위해 lid close 동작을 무시하도록 설정했다.

```bash
sudo mkdir -p /etc/systemd/logind.conf.d
sudo tee /etc/systemd/logind.conf.d/50-lid.conf >/dev/null <<'EOF'
[Login]
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
EOF

sudo systemctl restart systemd-logind
```

## 확인

```bash
cat /etc/systemd/logind.conf.d/50-lid.conf
sudo systemd-analyze cat-config systemd/logind.conf | grep -E 'HandleLidSwitch'
systemctl status systemd-logind --no-pager
```

정상 기준:

- `HandleLidSwitch=ignore`
- `HandleLidSwitchExternalPower=ignore`
- `HandleLidSwitchDocked=ignore`

---

# 6. tmux 사용

네트워크가 잠깐 끊겨도 작업 세션을 유지하기 위해 `tmux` 사용.

## 실행

```bash
tmux
```

## 세션 분리

- `Ctrl + b` 누른 뒤 `d`

## 다시 붙기

```bash
tmux attach
```

---

# 7. Tailscale 설치

같은 집 LAN 밖에서도 접속하기 위해 Tailscale 설치.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
sudo tailscale set --ssh
```

## 상태 확인

```bash
tailscale status
tailscale ip -4
```

예시 Tailscale IP:

```text
[내 서버 Tailscale IP 주소]
```

## 접속 예시

```bash
tailscale ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

또는 일반 SSH로도 가능:

```bash
ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

## 주의

`tailscale ssh [내 서버 사용자명]@[내 서버 호스트명]` 가 안 될 경우:

- MagicDNS 이름이 안 풀리는 상태일 수 있음
- 이때는 **이름 대신 Tailscale IP로 붙는 게 가장 확실함**

---

# 8. OpenClaw 설치

## 권장 설치

OpenClaw 설치는 자동 Node 설치를 포함한 스크립트로 진행.

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

만약 기본 installer가 NodeSource 단계에서 멈추면 우회 설치:

```bash
curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
```

## 설치 확인

```bash
openclaw --version
openclaw doctor
```

---

# 9. OpenClaw 온보딩

권장 방식:

```bash
openclaw onboard --install-daemon
```

진행 중 선택 기준:

- 개인용 서버 전제: **Yes**
- gateway token 생성: **Yes**
- `~/.openclaw` 권한 강화: **Yes**
- bash shell completion: **Yes**
- gateway service 설치: **Yes**
- gateway service 이미 있으면: **Restart**
- bot hatch: **Hatch in TUI**
- hooks: **Skip for now**
- web search provider: **Skip for now**
- skill dependencies는 나중에 필요한 것만 선택

## gateway.mode 문제

중간에 gateway가 안 뜨고 아래 에러가 난 적이 있음:

```text
existing config is missing gateway.mode
```

이 경우 재온보딩:

```bash
openclaw onboard --mode local
```

---

# 10. OpenClaw Gateway 상태 확인

## 상태

```bash
openclaw gateway status
openclaw gateway probe
openclaw status
```

## 로그 확인

```bash
journalctl --user -u openclaw-gateway.service -n 200 --no-pager
openclaw logs --follow
```

## 포트 확인

```bash
ss -ltnp | grep 18789
```

---

# 11. Telegram 연동

## 기본 흐름

1. Telegram에서 `@BotFather` 열기
2. `/newbot`
3. bot name 지정
4. bot username 지정 (`...bot` 으로 끝나야 함)
5. bot token 발급
6. OpenClaw 설정에 bot token 입력

## Pairing 승인

Telegram에서 pairing code가 뜨면 서버에서 승인:

```bash
openclaw pairing approve telegram <PAIRING_CODE>
```

예시:

```bash
openclaw pairing approve telegram 9J632JTQ
```

---

# 12. Google Calendar 연결 준비

## 12-1. Google Cloud에서 OAuth JSON 발급

Google Cloud Console에서:

1. 프로젝트 생성
2. Calendar API 활성화
3. OAuth Consent Screen 설정
4. 앱 상태는 Testing
5. **테스트 사용자에 본인 Gmail 추가**
6. OAuth Client 생성
   - 타입: **Desktop app**
7. JSON 다운로드

## 12-2. JSON 파일 서버로 복사

맥에서 서버로 업로드:

```bash
scp ~/Downloads/<파일명>.json [내 서버 사용자명]@[내 서버 로컬 IP 주소]:~
```

서버에서 확인:

```bash
ls -l ~ | grep json
chmod 600 ~/*.json
```

---

# 13. Homebrew 설치 (Linux)

`gog` 설치를 위해 Linuxbrew 설치.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

셸 환경 반영:

```bash
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

확인:

```bash
brew --version
```

---

# 14. gog 설치

```bash
brew install steipete/tap/gogcli
gog --help
which gog
```

예상 경로:

```text
/home/linuxbrew/.linuxbrew/bin/gog
```

---

# 15. gog 인증

## 15-1. credentials 등록

```bash
gog auth credentials ~/YOUR_FILE.json
```

## 15-2. Google OAuth 진행

쓰기 권한 포함 Calendar 인증:

```bash
gog auth add [내 구글 계정] --services calendar --manual
```

진행 방식:

- 서버 터미널에 URL 출력
- 맥 브라우저에서 열기
- Google 로그인 및 동의
- 마지막 redirect URL 전체를 복사
- 서버 터미널에 붙여넣기

### 테스트 사용자 누락 오류

만약 다음 오류가 뜨면:

```text
403 access_denied
앱은 현재 테스트 중이며 개발자가 승인한 테스터만 앱에 액세스할 수 있습니다.
```

해결:

- Google Cloud Console → **Audience**
- **테스트 사용자 추가**
- `[내 구글 계정]` 등록

## 15-3. 인증 상태 확인

```bash
gog auth status
gog auth list
```

---

# 16. gog keyring 비밀번호

`gog auth status` 또는 Calendar 명령 실행 시 아래 문구가 뜰 수 있다.

```text
Enter passphrase to unlock "/home/[내 서버 사용자명]/.config/gogcli/keyring":
```

이 비밀번호는 **gog keyring unlock passphrase**다.

CLI에서 반복 입력을 피하려면:

```bash
export GOG_KEYRING_PASSWORD='비밀번호'
```

예시:

```bash
export GOG_KEYRING_PASSWORD='[내 keyring 비밀번호]'
```

---

# 17. Google Calendar 목록 확인

```bash
gog -a [내 구글 계정] calendar calendars --plain
```

실제 확인된 캘린더 예시:

```text
ID                                      NAME                            ROLE
[내 구글 계정]                           [내 기본 캘린더]                 owner
[가족 캘린더 ID]                         가족                            owner
```

---

# 18. Google Calendar 테스트 이벤트 생성

## 중요: `--title`이 아니라 `--summary`

`gog calendar create`에서 제목 필드는 `--title`이 아니라 **`--summary`** 사용.

## 테스트용 예시

```bash
CAL_ID='[내 기본 캘린더 ID]'

gog -a [내 구글 계정] calendar create "$CAL_ID" \
  --summary "테너 특순 연습" \
  --from 2026-04-12T13:00:00+09:00 \
  --to 2026-04-12T14:00:00+09:00 \
  --location "성가대실" \
  --description "5월 특순 연습"
```

추가 예시:

```bash
gog -a [내 구글 계정] calendar create "$CAL_ID" \
  --summary "테너 특순 연습" \
  --from 2026-04-19T20:00:00+09:00 \
  --to 2026-04-19T21:00:00+09:00 \
  --location "성가대실" \
  --description "5월 특순 연습"
```

---

# 19. OpenClaw가 gog를 못 보던 문제와 해결 방향

문제:

- SSH 셸에서 `export GOG_KEYRING_PASSWORD=...` 해도
- OpenClaw는 **systemd user service**로 돌기 때문에
- 현재 셸 환경변수를 자동으로 받지 않음

즉:

- 터미널에서 `gog`는 됨
- Telegram/OpenClaw 안에서는 `gog` 환경이 안 보일 수 있음

## 해결을 위해 넣었던 방향

OpenClaw 서비스가 읽도록 `.env` 및 지침 파일 추가.

### OpenClaw 환경 파일

```bash
mkdir -p ~/.openclaw
cat >> ~/.openclaw/.env <<'EOF'
PATH=/home/linuxbrew/.linuxbrew/bin:/usr/local/bin:/usr/bin:/bin
GOG_KEYRING_PASSWORD=[내 keyring 비밀번호]
EOF
chmod 600 ~/.openclaw/.env
```

### AGENTS.md

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

### TOOLS.md

```bash
cat > ~/.openclaw/workspace/TOOLS.md <<'EOF'
Google Calendar is managed with gog.
For event creation, gog uses --summary, --from, --to, --location, and --description.
Account: [내 구글 계정]
Default calendar: [내 기본 캘린더 ID]
EOF
```

### Gateway 재시작

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
openclaw gateway probe
```

> 참고: 이 부분은 세션 중 계속 조정 중이었고, end-to-end Telegram → OpenClaw → gog → Calendar 생성은 최종 안정화까지 추가 검증이 필요함.

---

# 20. Telegram에서 일정 요청 예시

OpenClaw가 정상 인식하면 Telegram에서 다음처럼 요청 가능하도록 설계했다.

예시:

```text
기본 캘린더에 2026년 4월 12일 오후 1시부터 2시까지 "테너 특순 연습" 일정 생성해줘. 장소는 성가대실, 설명은 "5월 특순 연습"이야. gog를 사용해.
```

권장:

- 처음에는 **짧고 명확한 한 건**만 테스트
- 날짜/시간/제목/장소/설명을 명시

---

# 21. OpenClaw 오케스트레이터 구상

현재는 일정관리 에이전트 하나만 만든 상태.

향후 추천 구조:

- `calendar` 에이전트: 일정 생성/조회 전용
- `chief` 또는 `ops` 에이전트: 상위 orchestrator
  - sub-agent 호출
  - cron/standing orders 관리
  - Telegram 공개 봇과 분리된 private control 채널에서 사용

---

# 22. Wi‑Fi와 핫스팟 운영

## SSH 가능 조건

서버 쪽이 네트워크에 연결돼 있어야 SSH 가능.

- 서버 Wi‑Fi 연결됨 → SSH 가능
- 서버 Wi‑Fi 끊김 → SSH 불가
- 유선 LAN 연결됨 → SSH 가능

## 핫스팟으로 바뀌면 IP 변경 가능

핫스팟 사용 시 로컬 IP가 바뀔 수 있다.

### 서버에서 현재 IP 확인

```bash
hostname -I
```

또는:

```bash
ip a show wlo1
```

예시:

- 집 Wi‑Fi: `192.168.x.x`
- 아이폰 핫스팟: `172.20.10.x`

### 핫스팟 상태에서도 Tailscale이 살아 있으면

Tailscale IP는 그대로인 경우가 많다.

```bash
tailscale ip -4
```

그리고 맥에서:

```bash
ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

---

# 23. Netplan에 집 Wi‑Fi + 핫스팟 둘 다 등록하기

현재/향후 운용을 위해 서버에 여러 SSID를 등록 가능.

## 파일 확인

```bash
ls /etc/netplan
sudo cat /etc/netplan/*.yaml
```

## 수정

```bash
sudo nano /etc/netplan/50-cloud-init.yaml
```

예시:

```yaml
network:
  version: 2
  renderer: networkd
  wifis:
    wlo1:
      dhcp4: true
      access-points:
        "집와이파이SSID":
          password: "집와이파이비밀번호"
        "내핫스팟SSID":
          password: "핫스팟비밀번호"
```

## 적용

```bash
sudo netplan try
sudo netplan apply
```

---

# 24. Tailscale 관련 메모

## 같은 LAN이면 Tailscale 필수 아님

같은 집 네트워크에서는 원래 이렇게 접속 가능:

```bash
ssh [내 서버 사용자명]@[내 서버 로컬 IP 주소]
```

즉 Tailscale은 필수가 아니라:

- 외부/회사/다른 네트워크에서 안정적으로 붙기 위한 보조 수단

## Tailscale SSH 이름 해석 문제

`tailscale ssh [내 서버 사용자명]@[내 서버 호스트명]` 가 안 되면 MagicDNS 이름 해석 문제일 수 있음.

이 경우 이름 대신 **Tailscale IP** 사용:

```bash
tailscale ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

또는:

```bash
ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

---

# 25. 자주 쓰는 핵심 명령 모음

## 서버 기본 점검

```bash
hostname
hostname -I
ip a
systemctl status ssh
```

## SSH 접속

```bash
ssh [내 서버 사용자명]@[내 서버 로컬 IP 주소]
ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

## 절전 방지

```bash
sudo systemd-analyze cat-config systemd/logind.conf | grep -E 'HandleLidSwitch'
```

## Tailscale

```bash
tailscale status
tailscale ip -4
sudo tailscale set --ssh
```

## OpenClaw

```bash
openclaw --version
openclaw doctor
openclaw status
openclaw gateway status
openclaw gateway probe
openclaw logs --follow
```

## gog

```bash
which gog
gog --help
gog auth status
gog -a [내 구글 계정] calendar calendars --plain
```

---

# 26. 현재 상태 요약

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

---

# 27. 복구 순서 요약

다시 처음부터 복구해야 할 때 가장 짧은 순서:

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
