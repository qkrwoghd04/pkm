---
id: projects/oneq-partners/non-functional-requirements
title: 원큐파트너스 비기능 요구사항 요약
description: "원큐파트너스 MVP의 보안, 개인정보, 정합성, 복구, 운영, 성능, 가용성, 호환성 최소 기준."
knowledge_type: quality-baseline
project_id: oneq-partners
status: active
updated: "2026-07-31"
source_kind: outline-export
source_snapshot: "2026-07-30"
aliases:
  - 1QP NFR
  - 원큐 품질 기준
tags:
  - project/oneq-partners
  - non-functional-requirement
  - security
  - privacy
  - reliability
  - operations
  - performance
keywords:
  - TLS 1.2
  - 30분 세션
  - RPO 24시간
  - RTO 8업무시간
  - p95 3초
  - 업무시간 99.0%
project_kind: work
---

> V1 NFR은 고급 인프라를 추가하기 위한 목록이 아니라, 합의된 핵심 흐름을 안전하게 출시·운영하기 위한 최소 품질 게이트다. 현재는 내부 검토 상태이며 개인정보 항목은 고객 확인이 필요하다.

## 최소 품질 기준

| ID                                         | 영역           | 핵심 기준        |
| ------------------------------------------ | -------------- | ---------------- | ------------------------------------------------------------------------------------------ |
| [[requirements/non-functional/nfr-sec-001  | NFR-SEC-001]]  | 인증·세션        | TLS 1.2 이상, 반복 실패 제한, 운영 사용자 30분 미사용 만료, 로그아웃·계정 중지 즉시 무효화 |
| [[requirements/non-functional/nfr-sec-002  | NFR-SEC-002]]  | 권한·데이터 분리 | 서버 권한 검증 누락과 타 사용자 데이터 노출 0건                                            |
| [[requirements/non-functional/nfr-sec-003  | NFR-SEC-003]]  | 입력·파일        | 서버 검증, 금지 파일·무권한 접근 0건, 현재 기준 파일당 10MB·신청당 10개                    |
| [[requirements/non-functional/nfr-priv-001 | NFR-PRIV-001]] | 개인정보         | 불필요 수집, 로그 노출, 권한 외 원문 노출 0건                                              |
| [[requirements/non-functional/nfr-rel-001  | NFR-REL-001]]  | 정합성           | 중복·부분 저장·허용되지 않은 상태 전이 0건                                                 |
| [[requirements/non-functional/nfr-rec-001  | NFR-REC-001]]  | 백업·복구        | 일 1회, 7일 보관, RPO 24시간, RTO 8업무시간                                                |
| [[requirements/non-functional/nfr-ops-001  | NFR-OPS-001]]  | 운영             | 로그 30일, 상태 점검 5분, 장애 알림 10분 이내                                              |
| [[requirements/non-functional/nfr-perf-001 | NFR-PERF-001]] | 성능             | 동시 사용자 30명, 핵심 경로 p95 3초 이내, 오류 안내 5초 이내                               |
| [[requirements/non-functional/nfr-avl-001  | NFR-AVL-001]]  | 가용성           | 업무시간 월 99.0%, 계획 중단 24시간 전 안내                                                |
| [[requirements/non-functional/nfr-comp-001 | NFR-COMP-001]] | 호환성           | 최신·직전 주요 브라우저, 모바일 360px 이상, PC 1280px 이상                                 |

## 출시 전 최소 증빙

- 역할별 정상·거부 테스트와 HTTPS·세션 설정
- 개인정보 수집·마스킹·로그·운영 권한 체크리스트
- 입력 경계값, 스크립트, 금지 확장자, 용량 초과 테스트
- 중복 클릭·재전송·동시 변경 정합성 테스트
- 자동 백업 설정과 비운영 환경 복구 시험
- 오류·권한 거부·외부 연동 실패 로그와 알림 수신
- 핵심 E2E 단계별 p95 측정
- 상태 점검과 장애 기록 위치
- 대상 브라우저·실기기 핵심 흐름 체크리스트

## V1에서 제외한 고도화

- 다중 리전, 활성-활성, 무중단 배포, 자동 확장
- 24시간 관제·SOC·당직, 분산 추적, 장기 분석
- 대규모 부하·전용 캐시·검색 클러스터
- 고급 파일 검사·변환·CDN
- 완전한 WCAG 인증, 다국어·현지화
- 계약·전자서명·계약서 보관 품질 기준
- 다중 리전 DR, 실시간 복제, AI·추천·고급 분석

## 결정 전 확인

최종 운영 기준으로 사용하기 전에 [[open-questions|미결정 사항]]의 개인정보 보관, 알림 수신, 업무시간, 지원 OS, 첨부파일, 예상 동시 사용자, 비밀번호 정책을 확정해야 한다.
