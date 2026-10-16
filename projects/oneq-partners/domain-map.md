---
id: inbox/closeouts/2026-09-03-oneq-domain-sync
title: 원큐 QR 고정 URL 도메인 맵 보정
description: 고정된 원큐 QR URL을 서비스 도메인 맵에 반영한 PKM 보정안.
type: closeout-candidate
status: active
visibility: public
updated: '2026-09-03'
project_id: oneq-partners
tags:
  - domain/quotation-brokerage
  - concern/document-sync
---


> [!summary]
> 원큐파트너스는 `oneqpartners.co.kr`을 기준 도메인으로 사용하고, 사용자 채널별로 서브도메인을 분리한다. QR 유입은 고객 플랫폼의 고정 경로 `https://oneqpartners.co.kr/consultation-request?code={referralCode}`로 처리한다.

## 기준 도메인

| 서비스 | 기준 URL | 주요 사용자 | 역할 |
| --- | --- | --- | --- |
| 고객 플랫폼 | [oneqpartners.co.kr](https://oneqpartners.co.kr) | 고객 | 상담 신청, 견적 확인과 공급업체 선택 |
| 공급업체 | [provider.oneqpartners.co.kr](https://provider.oneqpartners.co.kr) | 공급업체 | 견적 요청 확인, 견적·방문 대응과 진행 가능 여부 확인 |
| 영업 파트너 | [partner.oneqpartners.co.kr](https://partner.oneqpartners.co.kr) | 영업 파트너 | 파트너 신청, QR 확인과 유입 고객 정보 확인 |
| 1Q 백오피스 | [admin.oneqpartners.co.kr](https://admin.oneqpartners.co.kr) | 상담사·운영 담당자 | 상담, 공급업체 주선, 견적과 진행 상태 관리 |
| QR 진입 경로 | [oneqpartners.co.kr/consultation-request?code={referralCode}](https://oneqpartners.co.kr/consultation-request?code={referralCode}) | QR 유입 고객 | 상담 신청 경로 진입과 추천코드 전달 |

## 운영 기준

- `oneqpartners.co.kr`은 고객 플랫폼의 메인 도메인이다.
- 공급업체, 영업 파트너, 1Q 백오피스는 역할별 서브도메인으로 분리한다.
- QR 외부 URL은 `https://oneqpartners.co.kr/consultation-request?code={referralCode}`로 고정한다.
- `code` query parameter에 추천코드를 전달하고 상담 신청에 적용한다.
- 별도 `qr.oneqpartners.co.kr` 서브도메인 URL은 사용하지 않는다.
- 앱 설치 여부에 따른 앱 열기 및 웹 fallback은 위 고정 경로를 기준으로 처리한다.

## 미결 사항

- DNS 레코드와 TLS 인증서 설정
- 각 도메인의 실제 배포 대상과 운영 환경 연결
- Universal Link/App Link 검증 파일의 최종 내용

## 관련 문서

- [[index|원큐파트너스 프로젝트 개요]]
- [[architecture|프론트엔드 아키텍처]]
- [[discussions/2026-08-12|2026-08-12 논의 기록]]
