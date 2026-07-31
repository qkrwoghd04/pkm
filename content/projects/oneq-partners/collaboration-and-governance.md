---
id: projects/oneq-partners/collaboration-and-governance
title: 원큐파트너스 문서 우선순위와 협업 원칙
description: "자료 충돌 시 우선순위, 문서 상태 해석, 변경·승인·추적 원칙을 정리한 프로젝트 거버넌스."
knowledge_type: governance
project_id: oneq-partners
status: active
updated: "2026-07-31"
source_kind: outline-export
source_snapshot: "2026-07-30"
aliases:
  - 1QP 문서 기준
  - 원큐 협업 규칙
tags:
  - project/oneq-partners
  - governance
  - documentation
  - approval
  - traceability
keywords:
  - 자료 우선순위
  - 승인 기준
  - 변경 요청
  - Linear
  - Outline
project_kind: work
---

> 프로젝트 문서는 현재 사실, 승인된 결정, 초안이 섞여 있다. 상태와 근거를 확인하지 않고 초안을 구현 확정으로 간주하지 않는다.

## 자료 우선순위

충돌할 때는 다음 순서로 해석한다.

1. 최신 승인 요구사항과 이해관계자 결정 기록
2. 현재 프로젝트 브리프
3. 승인된 Linear 이슈·스펙·결정 기록
4. 전체 플로우 DOCX
5. 영업용 소개서 이미지

현재 코드와 테스트가 이미 존재하는 경우, 코드가 실제 동작의 현재 증거다. 다만 코드가 승인 요구사항을 충족한다는 뜻은 아니므로 차이를 명시한다.

## 상태 해석

- `active`: 현재 기준으로 사용할 수 있는 정리 문서
- `draft`: 초안 또는 내부 검토 상태. 구현 전 승인 여부를 확인
- `resolved`: 종료된 사건·문제로, 재현과 해결 근거가 있는 기록
- `deprecated`: 과거 이력 보존용. 대체 문서를 우선

이번 내보내기의 FR·NFR·시나리오 상세는 `draft`로 분류한다.

## 변경 원칙

- 범위·정책·권한·상태가 확정되면 요구사항과 구현 문서를 함께 갱신한다.
- 이 프로젝트 개요에 없는 기능을 구현하기 전에 질문·결정 기록을 확인한다.
- 계약(`CT`)과 계약 이후 실제 이행은 별도 승인 없이는 V1에 추가하지 않는다.
- 추적 ID를 통해 요구사항, 화면, 개발 이슈, 테스트 근거를 연결한다.
- 요구사항의 미정 항목을 임의로 보완하지 않는다.

## AI 사용 규칙

1. [[index|프로젝트 지식 지도]]와 [[project-overview|현재 범위]]를 먼저 읽는다.
2. 질문에 관련된 FR·NFR·시나리오만 추가로 읽는다.
3. `draft`와 `source_status`를 답변에 명시한다.
4. 현재 코드·테스트와 문서의 차이를 확인한다.
5. 문서에 없는 정책을 사실처럼 만들지 않는다.
6. 답변에 사용한 요구사항 ID와 note ID를 남긴다.

## 원본과 정리본

- 원본 내보내기는 변경하지 않고 아카이브로 보존한다.
- 정리본은 검색과 탐색을 위한 파생 지식이다.
- 정리 전 원문 내보내기는 공개 저장소 밖에 별도 보관한다.
