---
id: agents/calendar/morning-brief
id_aliases:
  - public/agents/calendar/morning-brief
title: Calendar Morning Brief
description: 매일 오전 Google Calendar를 읽기 전용으로 분석해 오늘 일정, 내일 첫 일정, 충돌과 준비사항을 Telegram으로 전달하는 기능.
status: active
updated: 2026-07-30
aliases:
  - Calendar 아침 브리핑
  - Calendar 아침 요약
tags:
  - domain/agent-automation
  - tech/openclaw
  - tech/google-calendar
  - concern/automation
  - concern/least-privilege
---

> [!summary]
> 매일 08:00 Asia/Seoul 기준으로 기본 캘린더의 오늘 전체 일정과 내일 첫 일정을 조회하고, 충돌·연속 일정·누락 정보를 분석해 Calendar Telegram bot으로 전달한다. 예약 실행은 Calendar를 변경하지 않는다.

## 현재 상태

- 기존 `calendar` agent와 Calendar Telegram bot을 사용한다.
- 매일 08:00 Asia/Seoul Cron으로 운영한다.
- 실제 Cron 실행과 Telegram 전달을 검증했다.
- Morning Brief는 읽기 전용이며 대화형 일정 관리 기능과 권한 경계를 분리한다.

## 목적

단순히 일정을 나열하는 대신 다음 질문에 답하는 실행형 아침 브리핑을 제공한다.

- 오늘 어떤 일정이 있는가?
- 일정이 겹치거나 너무 가깝게 이어지는가?
- 장소, 접속 링크, 참석 응답처럼 확인할 정보가 빠졌는가?
- Calendar 데이터에 근거해 미리 준비할 것은 무엇인가?
- 내일 가장 먼저 시작하는 일정은 무엇인가?

## 최종 동작 구조

```text
08:00 Asia/Seoul Cron
  → 기존 calendar agent
  → gog 읽기 전용 조회
      ├─ 오늘 전체 일정
      ├─ 내일 일정
      └─ 충돌 정보
  → 일정 정규화와 점검
  → Calendar Telegram bot 전달
```

V1에서는 별도의 `calendar-brief` agent를 만들지 않는다. 기존 구조를 유지하면서 예약 작업의 도구와 행동만 최소 권한으로 제한한다.

## 조회 범위

- 기본 캘린더만 조회한다.
- 오늘의 종일 일정과 시간 일정을 모두 포함한다.
- 내일 일정 중 시작 시각이 가장 빠른 일정 하나를 별도로 표시한다.
- 기준 시간대는 `Asia/Seoul`이다.
- 다른 캘린더를 임의로 합치지 않는다.

실제 Google 계정과 Calendar ID는 공개 문서에 기록하지 않는다.

## Morning Brief 읽기 전용 규칙

허용:

- `events`를 이용한 일정 조회
- `conflicts`를 이용한 충돌 조회
- 조회 결과 정규화와 요약
- Telegram 결과 전달

금지:

- `create`
- `update`
- `delete`
- `respond`
- 초대 수락·거절
- Calendar 데이터를 변경하는 다른 명령

Cron에 노출하는 도구는 `read`와 `exec`로 제한한다. `exec`는 사전에 정한 조회 명령만 실행하며, Morning Brief 지시문이 쓰기 명령을 요청하더라도 실행하지 않는다.

대화형 Calendar Agent의 일정 생성·수정·삭제 기능은 별도 흐름이다. Morning Brief의 읽기 전용 제한이 대화형 기능을 변경하지 않는다.

## gog 고정 조회 절차

Morning Brief는 `gog v0.12.0`의 `events`와 `conflicts`만 사용한다.

논리적인 조회 순서는 세 단계로 고정한다.

1. `events`: 오늘 전체 일정 조회
2. `events`: 내일 일정 조회 후 첫 일정 선택
3. `conflicts`: 설정된 범위의 일정 충돌 조회

계정, Calendar ID, 날짜 범위처럼 환경마다 달라지는 실제 명령 인자는 공개 문서에 기록하지 않는다. 운영 환경의 고정 명령은 비공개 설정에서 관리한다.

## 일정 정규화와 분석 규칙

1. 종일 일정과 시간 일정을 분리한다.
2. 시간 일정은 시작 시각 순으로 정렬한다.
3. 시간이 겹치는 일정은 충돌로 표시한다.
4. 일정 사이 간격이 30분 이하이면 연속 일정으로 표시한다.
5. 장소 또는 온라인 접속 링크가 없으면 확인 필요로 표시한다.
6. 참석 응답이 필요한 초대는 확인 필요로 표시한다.
7. 준비사항은 제목, 설명, 장소 등 Calendar 데이터에 근거할 때만 제안한다.
8. 준비사항은 중요도 순으로 최대 3개만 제공한다.
9. Calendar에 없는 내용은 추측하지 않는다.

V1은 장소 간 실제 이동시간을 계산하지 않는다. 서로 다른 장소라는 이유만으로 이동 가능 여부를 단정하지 않는다.

## Telegram 출력 형식

```text
☀️ 오늘의 일정 브리핑

한 줄 요약

📅 오늘 일정
- 종일 일정
- 시간 일정

⚠️ 일정 점검
- 충돌
- 30분 이하 연속 일정

✅ 오늘 준비
1. Calendar 근거가 있는 준비사항

❓ 확인 필요
- 장소·접속 링크·참석 응답 누락

🌅 내일 첫 일정

수집 시각
Calendar 조회 상태
```

일정이나 경고가 없으면 해당 사실을 짧게 표시한다. Calendar 원문, 개인 식별자, 내부 명령, 인증정보는 Telegram 출력에 포함하지 않는다.

## 오류 및 부분 실패 처리

- 조회에 실패한 항목은 추측으로 채우지 않는다.
- 일부 결과만 신뢰할 수 있으면 확인된 범위와 실패한 범위를 구분한다.
- 실행 오류는 첫 실패부터 알림 대상으로 처리한다.
- 같은 원인의 반복 오류 알림에는 6시간 cooldown을 적용한다.
- 오류가 발생해도 Calendar 쓰기 명령으로 재시도하지 않는다.

## Cron 운영 설정

| 항목                  | 설정                  |
| --------------------- | --------------------- |
| Agent                 | 기존 `calendar` agent |
| Schedule              | 매일 08:00            |
| Timezone              | Asia/Seoul            |
| Delivery              | Calendar Telegram bot |
| Tools                 | `read`, `exec`        |
| Timeout               | 90초                  |
| Failure notification  | 첫 오류부터 알림      |
| Notification cooldown | 6시간                 |

Cron UUID, Telegram chat ID, 서버 사용자명, 백업 절대 경로는 공개하지 않는다.

## 검증 결과

2026-07-30 기준 다음 항목을 확인했다.

- 합성 fixture 시나리오 통과
- 실제 Cron 실행 상태 `ok`
- Calendar Telegram 전달 성공
- 고정된 읽기 전용 조회 명령 3개만 실행
- 생성·수정·삭제·참석 응답 명령 호출 없음
- 실행 전후 Calendar 이벤트 해시 동일
- OpenClaw Gateway와 Telegram 채널 정상
- 기존 Calendar·Market·Healthcheck Cron 정상
- 기존 대화형 일정 생성의 기본 2시간 처리 규칙 유지

이 검증은 Morning Brief V1 동작에 대한 기록이다. 이후 도구 버전이나 Cron 선언을 변경하면 읽기 전용 회귀 테스트를 다시 수행한다.

## 롤백 방법

1. 현재 Morning Brief Cron을 비활성화한다.
2. 비공개 위치에 보관한 timestamp 백업에서 이전 Cron 선언을 복원한다.
3. OpenClaw Gateway와 Calendar Telegram 채널 상태를 확인한다.
4. 복원 후 한 번의 테스트 실행 또는 다음 예약 실행을 확인한다.
5. 실행 전후 Calendar 이벤트 해시가 동일한지 다시 검증한다.

공개 문서에는 백업의 실제 절대 경로를 기록하지 않는다.

## V1 제외 범위와 후속 개선

V1에서 제외:

- Gmail 연동
- PKM 관련 문서 검색
- 별도 `calendar-brief` agent
- 장소 간 이동시간 계산
- 자동 일정 생성·수정·삭제
- 자동 참석 응답

실제 사용 결과를 관찰한 뒤 변경 일정 감지, 반복 일정 정규화, 날짜별 브리핑 보존 같은 기능을 다음 단계 후보로 검토한다.

## 관련 문서

- [[index|Calendar Agent]]
- [[architecture|Calendar Agent 구조와 연동]]
- [[runbook|Calendar Agent 운영 런북]]
- [[../../integrations/google-calendar-gog|Google Calendar와 gog CLI 연동]]
