---
id: projects/oneq-partners/scenarios/scn-qt-003
title: SCN-QT-003 견적 요청 수신 및 발신
description: 견적 도메인의 사용자 시나리오 SCN-QT-003의 내보내기 스냅샷.
knowledge_type: scenario
project_id: oneq-partners
status: draft
updated: "2026-07-31"
source_status: 내부 검토
source_kind: outline-export
source_snapshot: "2026-07-30"
aliases:
  - SCN-QT-003
tags:
  - project/oneq-partners
  - user-scenario
  - domain/qt
  - quotation
  - supplier-matching
project_kind: work
---

> 이 문서는 2026-07-30 기준 Outline 내보내기를 정규화한 공개용 스냅샷입니다. 내부 원본 링크와 담당자 표기는 제거했습니다. 현재 구현과 충돌하면 최신 승인 문서와 현재 코드가 우선합니다.

- 상태: 내부 검토
- 사용자: 공급업체
- 목표: 견적 요청에 응답하고 고객의 공급업체 최종 선택 결과를 확인한다.

### 시나리오 흐름

```mermaid
flowchart LR
  A[견적 요청 수신] --> B{방문 견적 필요 여부 확인}
  B -->|온라인 견적| C[온라인 견적 발신]
  B -->|방문 견적| D[방문 일정 조율 및 현장 견적]
  C --> E[고객의 견적 비교]
  D --> E
  E --> F[고객의 공급업체 최종 선택]
  F --> G[선택 결과 확인]
```

### 핵심 기준

- 견적 요청에는 24시간 이내 응답한다.
- 1차 범위는 고객의 공급업체 최종 선택에서 종료한다.
- 계약·계약서 업로드·수신·확인·승인 및 계약 확정은 1차 범위에서 제외한다.
