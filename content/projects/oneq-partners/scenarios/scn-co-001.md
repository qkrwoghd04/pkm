---
id: projects/oneq-partners/scenarios/scn-co-001
title: SCN-CO-001 견적 요청
description: 상담 도메인의 사용자 시나리오 SCN-CO-001의 내보내기 스냅샷.
knowledge_type: scenario
project_id: oneq-partners
status: draft
updated: "2026-07-31"
source_status: 내부 검토
source_kind: outline-export
source_snapshot: "2026-07-30"
aliases:
  - SCN-CO-001
tags:
  - project/oneq-partners
  - user-scenario
  - domain/co
  - consultation
  - service-request
project_kind: work
---

> 이 문서는 2026-07-30 기준 Outline 내보내기를 정규화한 공개용 스냅샷입니다. 내부 원본 링크와 담당자 표기는 제거했습니다. 현재 구현과 충돌하면 최신 승인 문서와 현재 코드가 우선합니다.

- - - **상태**: 내부 검토
    - **사용자**: 고객
    - **목표**: 원하는 업종의 서비스를 신청하고 상담을 완료해 공급업체 견적을 기다린다.
    - **시작 조건**: 고객이 플랫폼에 접속한다.

    ## 시나리오 흐름

    ```mermaid
    flowchart LR
        O["업종 선택"] --> n2["신청 폼 입력"]
        n1(["플랫폼 접속"]) --> O
        n2 --> P["QR 코드 접속?"]
        P -- 예 --> n3["추천 코드 자동입력"]
        P -- 아니오 --> n4["추천 코드 선택입력(null)"]
        n4 --> n5["신청 완료"]
        n5 --> n6["상담사 유선 상담"]
        n3 --> n5
        n6 --> n7(["공급업체 견적 대기"])

        P@{ shape: diam}
        n6@{ shape: rect}
    ```

    ## 핵심 기준
    - 고객은 업종을 선택하고 신청 폼을 입력한다.
    - QR 코드로 접속한 경우 추천 코드가 자동 입력된다.
    - QR 코드 접속이 아닌 경우 추천 코드는 선택 입력이며 null일 수 있다.
    - 신청 완료 후 상담사 유선 상담을 거쳐 공급업체 견적을 기다린다.

    ## 예외·확인 필요
    - **예외**: QR 코드 접속이 아닌 경우 추천 코드 없이 신청할 수 있다.

    ## 관련 자료
