---
title: security setting
type: playbook
tags:
  - security
  - server
  - ssh
---

# ZenAI 서버 기본 보안 설정 정리

이 문서는 이번 세션에서 진행한 **기본 보안 설정**을 처음부터 다시 따라갈 수 있도록 정리한 문서다.

대상 환경:

- 서버: Ubuntu Server (`zenai`)
- 네트워크: 현재 **Wi‑Fi**
- 원격 접속: **Tailscale + SSH**
- 관리 단말: **Mac**
- 목표:
  - 서버 SSH를 **내 맥에서만** 접근 가능하게 만들기
  - 비밀번호 SSH를 끄고 **공개키 기반 로그인만 허용**
  - root SSH 로그인 차단
  - OpenClaw는 계속 **loopback** 바인딩 유지

---

# 1. 보안 목표

현재 권장 구조는 아래와 같다.

```text
Mac
  └─ Tailscale IP -> SSH -> Ubuntu Server

Ubuntu Server
  ├─ UFW: 포트 22를 "내 맥의 Tailscale IP" 에서만 허용
  ├─ SSH: 공개키 인증만 허용
  ├─ SSH: root 직접 로그인 금지
  └─ OpenClaw: loopback 유지 (별도 인바운드 오픈 불필요)
```

즉 보안은 두 겹으로 잡는다.

1. **네트워크 레벨**
   - UFW(Uncomplicated Firewall)로 내 맥의 Tailscale IP만 허용

2. **인증 레벨**
   - SSH는 공개키만 허용
   - 비밀번호 로그인 비활성화
   - root SSH 금지

---

# 2. 작업 전 주의사항

중요:

- **현재 SSH 세션은 절대 닫지 말 것**
- **맥에서 새 터미널을 하나 더 열어서 테스트할 것**
- 방화벽/SSH 설정은 잘못하면 잠길 수 있으므로,
  - 기존 세션 유지
  - 새 세션으로 접속 테스트
  - 성공 확인 후에만 기존 세션 종료

---

# 3. Tailscale IP 확인

## 3-1. 맥에서 Tailscale IP 확인

맥에서 실행:

```bash
tailscale ip -4
```

## 3-2. 서버에서 Tailscale IP 확인

서버에서 실행:

```bash
tailscale ip -4
```

예시:

- 맥 Tailscale IP: `100.x.x.x`
- 서버 Tailscale IP: `100.y.y.y`

이후 모든 SSH 접속은 **서버의 Tailscale IP** 기준으로 테스트한다.

---

# 4. 맥의 SSH 키 확인

맥에서 실행:

```bash
ls -la ~/.ssh
```

기존 키가 있는지 더 정확히 확인:

```bash
ls -l ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub
```

이미 있으면 재생성할 필요 없다.

공개키 확인:

```bash
cat ~/.ssh/id_ed25519.pub
```

지문 확인:

```bash
ssh-keygen -lf ~/.ssh/id_ed25519.pub
```

## 4-1. SSH 키가 없을 경우만 생성

맥에서 실행:

```bash
ssh-keygen -t ed25519 -a 64 -C "jaehong-mac"
```

---

# 5. 공개키를 서버에 등록

맥에서 실행:

```bash
cat ~/.ssh/id_ed25519.pub | ssh jaehong@<서버_Tailscale_IP> 'umask 077; mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'
```

예시:

```bash
cat ~/.ssh/id_ed25519.pub | ssh jaehong@100.97.204.32 'umask 077; mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'
```

## 5-1. 서버에 등록됐는지 확인

서버에서 실행:

```bash
cat ~/.ssh/authorized_keys
```

---

# 6. 공개키 로그인 테스트

맥의 **새 터미널**에서 실행:

```bash
ssh jaehong@<서버_Tailscale_IP>
```

비밀번호 없이 로그인되거나, 최소한 공개키 방식으로 정상 접속되면 다음 단계로 진행한다.

---

# 7. UFW 설치 및 기본 정책 설정

## 7-1. UFW 상태 확인

서버에서 실행:

```bash
sudo ufw status verbose
```

설치되지 않았다면:

```bash
sudo apt update
sudo apt install -y ufw
```

## 7-2. 기본 정책 설정

서버에서 실행:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

---

# 8. 내 맥의 Tailscale IP만 SSH 허용

서버에서 실행:

```bash
sudo ufw allow proto tcp from <맥_Tailscale_IP> to any port 22
```

예시:

```bash
sudo ufw allow proto tcp from 100.101.102.103 to any port 22
```

이 규칙은 **서버 SSH(포트 22)** 를 **내 맥 한 대의 Tailscale IP** 에서만 허용한다.

---

# 9. 넓게 열린 기존 SSH 규칙 제거

현재 규칙 확인:

```bash
sudo ufw status numbered
```

아래 같은 규칙이 있으면 너무 넓다.

- `22/tcp ALLOW Anywhere`
- `22/tcp (v6) ALLOW Anywhere (v6)`
- `OpenSSH ALLOW Anywhere`
- `Anywhere on tailscale0 ALLOW IN Anywhere`

필요하면 번호로 삭제:

```bash
sudo ufw delete <번호>
```

예시:

```bash
sudo ufw delete 1
sudo ufw delete 2
```

---

# 10. UFW 활성화

서버에서 실행:

```bash
sudo ufw enable
sudo ufw reload
sudo ufw status verbose
```

---

# 11. 방화벽 테스트

## 11-1. 맥에서 Tailscale IP로 SSH 접속 테스트

맥의 새 터미널에서:

```bash
ssh jaehong@<서버_Tailscale_IP>
```

정상 접속돼야 한다.

## 11-2. 맥에서 서버의 Wi‑Fi/LAN IP로 SSH 시도

예시:

```bash
ssh jaehong@172.20.10.13
```

이건 실패하거나 timeout 되는 것이 정상이다.

즉:

- **Tailscale IP로는 접속 가능**
- **일반 Wi‑Fi/LAN IP로는 접속 차단**

이 상태가 목표다.

---

# 12. SSH 하드닝

이 단계는 **공개키 로그인과 UFW 테스트가 성공한 뒤에만** 진행한다.

## 12-1. 설정 백업

서버에서 실행:

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%F-%H%M%S)
```

## 12-2. 추가 설정 파일 생성

서버에서 실행:

```bash
sudo tee /etc/ssh/sshd_config.d/99-zenai-hardening.conf >/dev/null <<'EOF'
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
MaxAuthTries 3
EOF
```

이 명령은 원본 `sshd_config` 를 직접 편집하는 대신,
추가 설정 파일을 `/etc/ssh/sshd_config.d/` 아래에 만들어 적용하는 방식이다.

설정 의미:

- `PubkeyAuthentication yes`
  - 공개키 로그인 허용
- `PasswordAuthentication no`
  - 비밀번호 로그인 차단
- `KbdInteractiveAuthentication no`
  - 비밀번호성 인터랙티브 인증 차단
- `PermitRootLogin no`
  - root 직접 SSH 로그인 금지
- `MaxAuthTries 3`
  - 인증 시도 횟수 축소

## 12-3. 문법 검사

서버에서 실행:

```bash
sudo sshd -t
```

출력이 없으면 정상이다.

## 12-4. SSH 재시작

서버에서 실행:

```bash
sudo systemctl restart ssh
sudo systemctl status ssh --no-pager
```

## 12-5. 다시 로그인 테스트

맥의 **새 터미널**에서:

```bash
ssh jaehong@<서버_Tailscale_IP>
```

정상 접속되면 하드닝 성공이다.

> 이때까지 기존 SSH 세션은 닫지 않는다.

---

# 13. OpenClaw 관련 보안 정리

OpenClaw는 현재 loopback 바인딩 유지가 기본 권장 상태다.

즉:

- `127.0.0.1` 로만 열려 있음
- 외부 인바운드 포트를 따로 열 필요 없음
- 별도 UFW 인바운드 허용 불필요

결론:

- **OpenClaw용 인바운드 포트는 열지 않는다**
- **SSH만 최소 범위로 연다**

---

# 14. 왜 이 설정을 하는가

핵심 이유는 아래와 같다.

## 14-1. 방화벽(UFW)

누가 문 앞까지 올 수 있는지 제한

- 내 맥의 Tailscale IP만 포트 22 허용
- 같은 Wi‑Fi/LAN의 다른 장비는 SSH 접근 불가

## 14-2. SSH 하드닝

문 앞에 온 사람 중 누가 실제로 들어올 수 있는지 제한

- 공개키를 가진 내 맥만 로그인 가능
- 비밀번호 기반 공격 차단
- root 직접 로그인 차단

즉:

- **방화벽 = 접근 가능한 상대 제한**
- **SSH 하드닝 = 인증 가능한 상대 제한**

---

# 15. 트러블슈팅

## 15-1. `xterm-ghostty` / `nano` 에러

Ghostty 환경에서 서버가 terminfo를 몰라 `nano` 가 안 열릴 수 있다.

서버에서 실행:

```bash
export TERM=xterm-256color
```

그 후 다시:

```bash
nano ~/.openclaw/.env
```

## 15-2. SSH 문법 확인 실패

```bash
sudo sshd -t
```

여기서 에러가 나면,
`/etc/ssh/sshd_config.d/99-zenai-hardening.conf` 내용을 다시 점검한다.

## 15-3. UFW 규칙 확인

```bash
sudo ufw status numbered
sudo ufw status verbose
```

## 15-4. SSH 서비스 상태 확인

```bash
sudo systemctl status ssh --no-pager
```

---

# 16. 최종 체크리스트

완료 상태는 아래와 같아야 한다.

- [ ] 맥에서 `ssh jaehong@<서버_Tailscale_IP>` 로 접속 가능
- [ ] 맥에서 `ssh jaehong@<서버_Wi‑Fi_IP>` 는 접속 불가
- [ ] UFW incoming default deny
- [ ] 포트 22는 **내 맥의 Tailscale IP만** 허용
- [ ] 비밀번호 SSH 로그인 비활성화
- [ ] root SSH 로그인 비활성화
- [ ] OpenClaw는 loopback 유지
- [ ] 기존 SSH 세션을 유지한 상태에서 새 세션 테스트 완료

---

# 17. 핵심 명령만 다시 요약

## 맥에서

```bash
tailscale ip -4
ls -l ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub
cat ~/.ssh/id_ed25519.pub | ssh jaehong@<서버_Tailscale_IP> 'umask 077; mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'
ssh jaehong@<서버_Tailscale_IP>
```

## 서버에서

```bash
sudo apt update
sudo apt install -y ufw

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow proto tcp from <맥_Tailscale_IP> to any port 22
sudo ufw status numbered
sudo ufw enable
sudo ufw reload
sudo ufw status verbose

sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%F-%H%M%S)

sudo tee /etc/ssh/sshd_config.d/99-zenai-hardening.conf >/dev/null <<'EOF'
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
MaxAuthTries 3
EOF

sudo sshd -t
sudo systemctl restart ssh
sudo systemctl status ssh --no-pager
```

---

# 18. 다음 단계 제안

지금 단계에서 추가로 고려할 수 있는 것:

- Tailscale SSH 정책 기반 접근 제어
- UFW 로그 점검
- fail2ban 여부 검토
- OpenClaw insecure auth 옵션 재점검
- 정기 보안 점검 체크리스트 문서화
