---
id: projects/oneq-partners/domain-map
title: 원큐파트너스 서비스 도메인
description: 고객, 공급업체, 영업 파트너, 운영사와 QR Gateway의 기준 도메인 맵.
project_id: oneq-partners
project_kind: work
status: active
updated: 2026-08-21
aliases:
  - 원큐파트너스 도메인
  - oneqpartners.co.kr 도메인 맵
  - 서비스별 서브도메인
tags:
  - concern/multi-channel
  - concern/domain-routing
  - tech/hybrid-app
---

> [!summary]
> 원큐파트너스는 `oneqpartners.co.kr`을 기준 도메인으로 사용하고, 사용자 채널별로 서브도메인을 분리한다. QR 유입은 별도 QR Gateway인 `qr.oneqpartners.co.kr`에서 처리한다.

## 기준 도메인

| 서비스 | 기준 URL | 주요 사용자 | 역할 |
| --- | --- | --- | --- |
| 고객 플랫폼 | [oneqpartners.co.kr](https://oneqpartners.co.kr) | 고객 | 상담 신청, 견적 확인과 공급업체 선택 |
| 공급업체 | [provider.oneqpartners.co.kr](https://provider.oneqpartners.co.kr) | 공급업체 | 견적 요청 확인, 견적·방문 대응과 진행 가능 여부 확인 |
| 영업 파트너 | [partner.oneqpartners.co.kr](https://partner.oneqpartners.co.kr) | 영업 파트너 | 파트너 신청, QR 확인과 유입 고객 정보 확인 |
| 1Q 백오피스 | [admin.oneqpartners.co.kr](https://admin.oneqpartners.co.kr) | 상담사·운영 담당자 | 상담, 공급업체 주선, 견적과 진행 상태 관리 |
| QR Gateway | [qr.oneqpartners.co.kr](https://qr.oneqpartners.co.kr) | QR 유입 고객·앱 | QR URL, Universal Link/App Link 검증과 고객 플랫폼 fallback 처리 |

## 운영 기준

- `oneqpartners.co.kr`은 고객 플랫폼의 메인 도메인이다.
- 공급업체, 영업 파트너, 1Q 백오피스는 역할별 서브도메인으로 분리한다.
- QR Gateway는 고객 플랫폼과 별도 서비스로 운영한다.
- QR URL은 `qr.oneqpartners.co.kr/r/{referralCode}` 형태를 사용한다.
- 앱이 설치된 경우 QR Gateway가 Universal Link/App Link를 통해 고객 앱을 열고, 앱이 없으면 `oneqpartners.co.kr/r/{referralCode}`로 고객 웹을 보여준다.
- QR Gateway는 QR 도메인의 `.well-known` 검증 파일과 `/r/{referralCode}` 리다이렉트를 담당한다.

## 미결 사항

- DNS 레코드와 TLS 인증서 설정
- 각 도메인의 실제 배포 대상과 운영 환경 연결
- Universal Link/App Link 검증 파일의 최종 내용

## 관련 문서

- [[index|원큐파트너스 프로젝트 개요]]
- [[architecture|프론트엔드 아키텍처]]
- [[discussions/2026-08-12|2026-08-12 논의 기록]]
