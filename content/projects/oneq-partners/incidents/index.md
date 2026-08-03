---
id: projects/oneq-partners/incidents
title: 원큐파트너스 트러블슈팅
description: 원큐파트너스에서 해결한 장애와 시행착오를 원인, 해결, 검증, 재사용 가능한 교훈 중심으로 축적하는 지식 지도.
knowledge_type: incident-map
project_id: oneq-partners
project_kind: work
status: active
updated: "2026-08-03"
tags:
  - project/oneq-partners
  - incident
  - troubleshooting
---

> [!summary]
> 단순 작업 로그가 아니라 다시 만났을 때 해결 시간을 줄일 수 있는 문제만 기록한다. 현재 코드와 테스트가 과거 incident보다 우선한다.

## 기록할 문제

- 원인을 찾는 데 시간이 오래 걸린 오류
- 배포, 빌드, 환경변수, 네트워크처럼 다시 발생할 수 있는 문제
- 문서나 일반적인 해결법과 실제 동작이 달랐던 사례
- 잘못된 접근을 반복할 가능성이 높은 문제
- 다른 프로젝트에도 적용할 수 있는 교훈이 생긴 문제

사소한 문법 오류, 일회성 오타, 해결 근거가 없는 추측은 기록하지 않는다.

## 파일 규칙

- 위치: `projects/oneq-partners/incidents/`
- 파일명: 증상이나 원인을 표현하는 semantic kebab-case
- 상태: 해결된 사건은 `resolved`, 조사 중이면 `draft`
- 한 문서는 하나의 사건만 다룬다.

## Incident 템플릿

```md
---
title: 문제를 식별할 수 있는 제목
description: 증상과 최종 원인을 한 문장으로 요약.
status: resolved
updated: YYYY-MM-DD
tags:
  - project/oneq-partners
  - incident
---

> [!summary]
> 무엇이 실패했고 어떤 원인으로 어떻게 해결했는지 요약한다.

## 증상

## 영향

## 환경과 조건

## 조사 과정

## 시도했지만 실패한 접근

## 근본 원인

## 해결

## 검증

## 재발 방지

## 다른 프로젝트에 재사용할 교훈

## 근거

- 관련 코드 경로
- 테스트 또는 로그
- 관련 커밋
```

민감한 URL, 고객 정보, 계정 식별자, 토큰, 원본 로그는 기록하지 않는다. 필요한 명령과 로그는 중립적인 플레이스홀더로 정리한다.

## 기록된 Incident

아직 정리된 incident가 없다. 실제 문제를 해결한 뒤 위 템플릿으로 추가한다.

## 관련 문서

- [[../index|원큐파트너스 프로젝트 개요]]
- [[../career-notes|이력서·경력 정리 재료]]
