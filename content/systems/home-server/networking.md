---
id: systems/home-server/networking
id_aliases:
  - public/systems/home-server/networking
title: SSH와 Tailscale 네트워크 운영
description: Ubuntu 홈서버에 LAN, Tailscale, Wi-Fi, 핫스팟 환경에서 안정적으로 접속하기 위한 네트워크 운영 방법.
status: active
updated: 2026-07-30
aliases:
  - 네트워크
  - SSH Tailscale 네트워크 운영
  - calendar-agent/02-network
tags:
  - domain/infrastructure
  - tech/tailscale
  - tech/ubuntu
  - concern/networking
  - concern/operations
created: 2026-04-24
---

## 목적

Zenbook 서버에 같은 LAN, 외부 네트워크, 핫스팟 환경에서 안정적으로 접속하기 위한 네트워크 운영 메모다.

## 1. SSH 가능 조건

서버 쪽이 네트워크에 연결돼 있어야 SSH가 가능하다.

- 서버 Wi‑Fi 연결됨 → SSH 가능
- 서버 Wi‑Fi 끊김 → SSH 불가
- 유선 LAN 연결됨 → SSH 가능
- Tailscale 연결됨 → 외부 네트워크에서도 접속 가능

## 2. 같은 LAN에서 SSH 접속

같은 집 네트워크에서는 Tailscale 없이 로컬 IP로 접속할 수 있다.

```bash
ssh [내 서버 사용자명]@[내 서버 로컬 IP 주소]
```

현재 IP 확인:

```bash
hostname -I
```

또는:

```bash
ip a
```

## 3. Tailscale 설치

같은 집 LAN 밖에서도 접속하기 위해 Tailscale을 설치한다.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
sudo tailscale set --ssh
```

## 4. Tailscale 상태 확인

```bash
tailscale status
tailscale ip -4
```

Tailscale IP 예시:

```text
[내 서버 Tailscale IP 주소]
```

## 5. Tailscale SSH 접속

```bash
tailscale ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

일반 SSH로도 가능하다.

```bash
ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

## 6. MagicDNS 이름 해석 문제

아래 명령이 안 될 수 있다.

```bash
tailscale ssh [내 서버 사용자명]@[내 서버 호스트명]
```

가능한 원인:

- MagicDNS 이름이 안 풀리는 상태
- 클라이언트 쪽 DNS 설정 문제

가장 확실한 우회는 이름 대신 Tailscale IP를 쓰는 것이다.

```bash
tailscale ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

또는:

```bash
ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

## 7. 핫스팟 전환 시 IP 변경

핫스팟 사용 시 로컬 IP가 바뀔 수 있다.

예시:

- 집 Wi‑Fi: `192.168.x.x`
- 아이폰 핫스팟: `172.20.10.x`

서버에서 현재 IP 확인:

```bash
hostname -I
```

또는 무선 인터페이스 기준:

```bash
ip a show wlo1
```

Tailscale이 살아 있으면 Tailscale IP는 그대로인 경우가 많다.

```bash
tailscale ip -4
```

맥에서 접속:

```bash
ssh [내 서버 사용자명]@[내 서버 Tailscale IP 주소]
```

## 8. Netplan에 집 Wi‑Fi + 핫스팟 둘 다 등록

서버에 여러 SSID를 등록해 백업 네트워크를 준비할 수 있다.

파일 확인:

```bash
ls /etc/netplan
sudo cat /etc/netplan/*.yaml
```

수정:

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

적용:

```bash
sudo netplan try
sudo netplan apply
```

## 9. 핵심 명령 모음

```bash
hostname
hostname -I
ip a
systemctl status ssh
```

```bash
tailscale status
tailscale ip -4
sudo tailscale set --ssh
```

## 관련 문서

- [[setup|Ubuntu 홈서버 초기 구축]]
- [[../../agents/calendar/runbook|Calendar Agent 운영 런북]]
