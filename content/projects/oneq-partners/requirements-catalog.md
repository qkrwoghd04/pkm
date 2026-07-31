---
id: projects/oneq-partners/requirements-catalog
title: 원큐파트너스 기능 요구사항 카탈로그
description: 원큐파트너스 V1 기능 요구사항 29건을 도메인별로 분류한 검색·탐색용 카탈로그.
knowledge_type: requirements-catalog
project_id: oneq-partners
status: active
updated: "2026-07-31"
source_kind: outline-export
source_snapshot: "2026-07-30"
aliases:
  - 1QP 기능 요구사항
  - 원큐 FR 목록
tags:
  - project/oneq-partners
  - requirements
  - functional-requirement
  - traceability
keywords:
  - FR
  - 기능 요구사항
  - 수용 기준
  - 도메인 요구사항
project_kind: work
---

> 이번 스냅샷에는 기능 요구사항 29건이 있다. 원본 상태는 모두 초안이므로 최신 승인 여부를 확인한 뒤 구현 근거로 사용한다.

## 도메인별 수량

| 도메인           | 코드 | 수량 |
| ---------------- | ---: | ---: |
| 공통             |   CM |    1 |
| 영업 파트너·유입 |   SP |    5 |
| 업종             |   BC |    3 |
| 고객·인증        |   CU |    2 |
| 상담·서비스 요청 |   CO |    6 |
| 매칭·견적        |   QT |    8 |
| 공급업체         |   SU |    4 |
| 합계             |      |   29 |

## 공통

- [[requirements/functional/fr-cm-ac001|FR-CM-AC001 운영사 사용자 계정·역할 관리]]

## 영업 파트너·유입

- [[requirements/functional/fr-sp-ap001|FR-SP-AP001 영업 파트너 신청]]
- [[requirements/functional/fr-sp-ar001|FR-SP-AR001 영업 파트너 승인·추천코드 발급]]
- [[requirements/functional/fr-sp-pt001|FR-SP-PT001 파트너 포털 접근·유입 정보 권한]]
- [[requirements/functional/fr-sp-qr001|FR-SP-QR001 추천코드·파트너 QR 생명주기 관리]]
- [[requirements/functional/fr-sp-st001|FR-SP-ST001 유입 고객 진행 상태 조회]]

## 업종

- [[requirements/functional/fr-bc-001|FR-BC-001 업종 목록 조회·선택]]
- [[requirements/functional/fr-bc-002|FR-BC-002 업종 기준정보 관리]]
- [[requirements/functional/fr-bc-fm001|FR-BC-FM001 업종별 상담 신청 항목 구성]]

## 고객·인증

- [[requirements/functional/fr-cu-au001|FR-CU-AU001 고객 회원가입·로그인]]
- [[requirements/functional/fr-cu-id001|FR-CU-ID001 비회원 신청·회원 계정 연결]]

## 상담·서비스 요청

- [[requirements/functional/fr-co-rq001|FR-CO-RQ001 고객 서비스 신청]]
- [[requirements/functional/fr-co-rq002|FR-CO-RQ002 고객 신청 조회·수정·취소]]
- [[requirements/functional/fr-co-cs001|FR-CO-CS001 상담사 배정·요구사항 보완]]
- [[requirements/functional/fr-co-cs002|FR-CO-CS002 상담 신청 업무 큐·담당자 관리]]
- [[requirements/functional/fr-co-cs003|FR-CO-CS003 고객 연락·상담 진행 이력 관리]]
- [[requirements/functional/fr-co-rm001|FR-CO-RM001 고객 요구사항·첨부자료 관리]]

## 매칭·견적

- [[requirements/functional/fr-qt-rq001|FR-QT-RQ001 견적 요청서 작성·발송·24시간 수집]]
- [[requirements/functional/fr-qt-rq002|FR-QT-RQ002 견적 요청 대상 공급업체 선택]]
- [[requirements/functional/fr-qt-rq003|FR-QT-RQ003 견적 응답 기한·무응답 처리]]
- [[requirements/functional/fr-qt-oq001|FR-QT-OQ001 방문 견적 응답·최종 견적 제출]]
- [[requirements/functional/fr-qt-rs001|FR-QT-RS001 공급업체 견적 응답 제출]]
- [[requirements/functional/fr-qt-cp001|FR-QT-CP001 수신 견적 조회·비교]]
- [[requirements/functional/fr-qt-cp002|FR-QT-CP002 고객 업체 선택]]
- [[requirements/functional/fr-qt-cp003|FR-QT-CP003 고객 선택 변경·취소]]

## 공급업체

- [[requirements/functional/fr-su-001|FR-SU-001 공급업체 서비스 범위 관리]]
- [[requirements/functional/fr-su-ac001|FR-SU-AC001 공급업체 계정 발급]]
- [[requirements/functional/fr-su-rg001|FR-SU-RG001 공급업체 수기 등록·목록 조회]]
- [[requirements/functional/fr-su-us001|FR-SU-US001 공급업체 사용자 계정 상태 관리]]

## 사용 규칙

- 요구사항 ID를 검색 키워드로 우선 사용한다.
- 현재 코드·테스트와 이 스냅샷이 충돌하면 현재 코드와 최신 승인 문서를 확인한다.
- 수용 기준에 미정 또는 상충 문장이 있으면 [[open-questions|확인 필요·미결정 사항]]에 반영한 뒤 구현한다.
