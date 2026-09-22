---
id: beszel-healthchecks-monitoring
title: Beszel과 Healthchecks.io 서버 감시
description: Coolify에서 운영하는 Beszel Hub와 Agent, Telegram 알림, Healthchecks heartbeat, 백업 경계를 정리한 운영 기록
status: active
updated: 2026-09-23
verified_at: 2026-09-19
tags:
  - domain/observability
  - tech/docker
  - tech/telegram
  - concern/operations
---

> [!summary]
> Beszel Hub와 Agent가 Coolify에서 healthy 상태로 실행 중이며, 호스트 시스템이 Unix socket으로 등록되어 지표를 수집하는 상태. Telegram 알림과 Healthchecks heartbeat는 별도 확인이 필요한 운영 경계로 분리.

## 현재 구성

- 배포 위치: Coolify `Monitoring` 프로젝트의 Beszel 서비스
- Hub 이미지: `henrygd/beszel:0.18.7`
- Agent 이미지: `henrygd/beszel-agent:0.18.7`
- 데이터 볼륨: Beszel 데이터, Agent 상태, Hub-Agent Unix socket을 별도 Docker volume으로 보존
- Agent 통신: Hub와 Agent 사이에 Unix socket 사용
- Docker 접근: Docker socket 읽기 전용 마운트
- 외부 Agent 포트: 미공개
- 재기동: Coolify가 관리하는 컨테이너 lifecycle 사용
- 인증값: Hub와 Agent의 `KEY`, `TOKEN`은 Coolify 환경변수로 주입하며 문서에 기록하지 않음

## 호스트 시스템 등록

- 대상 호스트: `<server-name>`
- Agent socket: `/beszel_socket/beszel.sock`
- 연결 상태: Agent WebSocket `0.18.7` 연결 확인
- 수집 항목: CPU, 메모리, 디스크, 온도, 배터리, uptime, 컨테이너 상태
- 컨테이너 수집: Beszel Hub, Beszel Agent, OpenClaw sandbox, Coolify 데이터베이스와 Redis 등 확인

## 대시보드 접근

Coolify가 제공하는 HTTPS 도메인으로 Beszel 관리자 화면에 접근한다. 관리자 로그인은 Beszel 계정으로 보호한다.

현재 사용할 후보 도메인은 `<monitoring-domain>`이다. DNS는 서버를 가리키지만, Coolify 컨테이너 라우팅에는 아직 생성된 기본 도메인이 남아 있을 수 있으므로 다음 절차가 필요하다.

1. Coolify 서비스의 Domains에 `https://<monitoring-domain>` 저장
2. Beszel 서비스 재배포
3. DNS 상태가 정상으로 바뀌는지 확인
4. HTTPS 응답과 Beszel 로그인 화면 확인

도메인 변경은 Telegram 알림 설정과 별개이며, Beszel 데이터 볼륨을 유지한 채 재배포해야 한다.

## 알림 규칙

현재 호스트에 적용한 알림 기준은 다음과 같다.

| 규칙 | 상태 | 기준 |
| --- | --- | --- |
| 호스트 오프라인 | 사용 | 10분 |
| CPU | 사용 | 90% 초과가 5분 지속 |
| 메모리 | 사용 | 90% 초과가 5분 지속 |
| 디스크 | 사용 | 85% 초과가 5분 지속 |
| 기타 규칙 | 미사용 | 필요 시 별도 검토 |

## Heartbeat

- 공급자: Healthchecks.io 호스팅 서비스
- 체크: `<heartbeat-check>`
- 전송 주기: 60초
- HTTP 방식: GET
- Period: 1분
- Grace time: 4분
- 전송 주체: Beszel Hub 내장 heartbeat
- Heartbeat URL: 비밀값이므로 이 문서와 Git에 기록하지 않음
- 최근 확인: Beszel 화면에서 테스트 heartbeat 전송 성공
- 주의: Heartbeat 정상은 Beszel Hub가 살아 있음을 뜻하며, Telegram 경고 전달까지 검증한 것은 아님

## Telegram 알림

- 방식: Beszel의 Shoutrrr Webhook / Push 알림
- 봇: 기존 봇과 분리한 모니터링 전용 Telegram 봇
- URL 형식: `telegram://<bot-token>@telegram?chats=<chat-id>`
- 토큰과 Chat ID: Beszel 설정에만 저장하고 문서, Git, 채팅에 기록하지 않음
- 운영 원칙: 알림 URL을 Coolify 환경변수로 복제하지 않고 Beszel 설정 데이터로 관리
- 최종 확인: Beszel의 `테스트 URL` 실행 후 모니터링 봇에서 수신 확인 필요

## 데이터 저장과 백업

### Beszel 실데이터

- 저장 대상: Beszel Hub의 데이터 Docker volume
- 포함 내용: 시스템 등록 정보, 알림 설정, 시계열 데이터, 사용자 설정
- 현재 상태: 라이브 볼륨은 존재하지만 Coolify volume backup schedule은 없음
- 외부 백업: S3 또는 다른 서버로 복제하지 않음
- 위험: 노트북 디스크 또는 Docker volume 손상 시 Beszel 기록과 설정을 잃을 수 있음

### Coolify 자체 백업

- 대상: Coolify 관리 데이터베이스
- 주기: 매일 1회
- 저장 위치: `/data/coolify/backups/` 아래의 로컬 dump
- 외부 저장소: 현재 S3 저장 비활성
- 범위 제한: 이 백업은 Coolify 데이터베이스용이며 Beszel 데이터 volume 백업이 아님

### 권장 보완

1. Beszel data volume에 Coolify volume backup 추가
2. 로컬 백업을 R2, Backblaze B2 또는 NAS로 암호화 복제
3. OpenClaw 설정과 비공개 PKM도 같은 백업 정책에 포함
4. 월 1회 복구 테스트

## 현재 검증 결과

- Beszel Hub: healthy
- Beszel Agent: healthy 및 Hub WebSocket 연결 확인
- Hub와 Agent의 데이터 볼륨: 생성 및 마운트 확인
- Docker socket 권한: read-only mount 확인
- 호스트 지표: 대시보드 표시 확인
- 컨테이너 지표: 대시보드 표시 확인
- Healthchecks heartbeat: 테스트 전송 성공 확인
- Telegram 알림 URL: Beszel 설정 저장 여부는 사용자가 설정했으며 실제 테스트 메시지 수신 확인 필요
- Beszel volume backup: 미설정 확인
- Coolify DB backup: 최근 실행 성공 확인

## 운영 절차

### 상태 확인

1. Coolify에서 Beszel Hub와 Agent가 `healthy`인지 확인
2. Beszel 대시보드에서 호스트의 마지막 수집 시각 확인
3. 컨테이너 페이지에서 Hub와 Agent 상태 확인
4. Healthchecks에서 heartbeat 수신 시각 확인

### 알림 테스트

1. Beszel 알림 설정에서 Telegram URL의 `테스트 URL` 실행
2. 모니터링 전용 Telegram 봇에서 메시지 수신 확인
3. 테스트 후 URL과 토큰을 로그, 문서, 화면 캡처에 남기지 않음

### 도메인 변경

1. DNS가 `<monitoring-domain>`을 서버로 가리키는지 확인
2. Coolify Domains에 HTTPS 주소 저장
3. Beszel 서비스 재배포
4. HTTPS 접속과 인증서 확인

### 복구

현재 Beszel volume 외부 백업이 없으므로, 볼륨 삭제 후 완전 복구 절차는 준비되지 않은 상태. 외부 백업을 추가한 뒤 복구 테스트를 수행해야 한다.

## 재배포 및 롤백

- 재배포: Coolify Beszel 서비스의 Deploy 작업
- 데이터 보존: 기존 Docker volume을 유지한 채 재배포
- 문제 시: Beszel Hub와 Agent만 중지하거나 이전 Coolify 배포로 되돌리고 다른 서비스는 건드리지 않음
- 주의: Docker volume 삭제, Coolify의 volume 정리, 서버 초기화는 Beszel 데이터를 삭제할 수 있음

## Related knowledge

- [[../home-server/index|홈서버]]
- [[../openclaw/index|OpenClaw]]
