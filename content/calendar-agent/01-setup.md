---
title: Setup
type: setup-note
tags:
  - ubuntu
  - zenbook
  - server
  - ssh
  - tmux
created: 2026-04-24
source: calendar.md
---

# Zenbook Ubuntu Server 초기 구축

## 목적

ASUS Zenbook UX425EA를 Ubuntu Server 기반 개인 비서 서버로 사용하기 위한 초기 구축 절차다.

## 대상 환경

- 장비: ASUS Zenbook UX425EA
- CPU: Intel i7-1165G7
- RAM: 16GB
- 저장소: 약 477GB
- OS: Ubuntu Server 24.04 LTS
- 용도: 개인 비서 서버

## 1. Ubuntu Server 설치 USB 만들기

Ubuntu Server ISO로 설치 USB를 만든다.

권장:

- Ubuntu Server 24.04 LTS
- Mac에서는 balenaEtcher 사용

## 2. 설치 시 기본 선택

설치 과정에서 아래 기준으로 진행한다.

- Ubuntu Server
- OpenSSH server 설치 체크
- 서드파티 드라이버는 기본적으로 체크하지 않음
- 계정 생성:
  - name: `[내 이름]`
  - server name: `[내 서버 호스트명]`
  - username: `[내 서버 사용자명]`

## 3. Ubuntu 최초 세팅

로그인 후 먼저 실행한다.

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y openssh-server curl git vim tmux
```

## 4. SSH 상태 확인

```bash
systemctl status ssh
```

정상이면 `active (running)`이 보인다.

## 5. 현재 IP 확인

```bash
ip a
```

또는:

```bash
hostname -I
```

접속 예시:

```bash
ssh [내 서버 사용자명]@[내 서버 로컬 IP 주소]
```

## 6. MacBook에서 SSH 접속

맥북 터미널에서:

```bash
ssh [내 서버 사용자명]@[내 서버 로컬 IP 주소]
```

처음 접속 시:

- 호스트 키 확인 문구가 뜨면 `yes`
- 비밀번호 입력

## 7. 덮개 닫아도 절전 안 되게 설정

서버로 계속 쓰기 위해 lid close 동작을 무시한다.

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

확인:

```bash
cat /etc/systemd/logind.conf.d/50-lid.conf
sudo systemd-analyze cat-config systemd/logind.conf | grep -E 'HandleLidSwitch'
systemctl status systemd-logind --no-pager
```

정상 기준:

- `HandleLidSwitch=ignore`
- `HandleLidSwitchExternalPower=ignore`
- `HandleLidSwitchDocked=ignore`

## 8. tmux 사용

네트워크가 잠깐 끊겨도 작업 세션을 유지하기 위해 `tmux`를 사용한다.

실행:

```bash
tmux
```

세션 분리:

```text
Ctrl + b 누른 뒤 d
```

다시 붙기:

```bash
tmux attach
```

## 관련 노트

- [[02-network]]
- [[03-gateway]]
- [[06-runbook]]
