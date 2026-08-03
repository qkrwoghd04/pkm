---
id: projects/oneq-partners
title: 원큐파트너스
description: 영업 파트너, 고객, 운영사, 공급업체를 연결하는 다자간 견적 중개 프로젝트와 담당 경험을 요약한 기록.
knowledge_type: project
project_id: oneq-partners
status: active
updated: "2026-08-03"
aliases:
  - 원큐파트너스
  - 1QP
  - 1Q 파트너스
  - projects/oneq-partners/project-overview
  - projects/oneq-partners/mvp-workflow
tags:
  - project/oneq-partners
  - project-history
  - quotation-brokerage
  - landing-page
  - astro
keywords:
  - 원큐파트너스
  - 다자간 견적 중개
  - 영업 파트너 QR
  - 영업 파트너 랜딩
  - Astro
  - React Islands
project_kind: work
---

> 원큐파트너스는 영업 파트너가 유입한 고객의 요청을 운영사가 정리하고 여러 공급업체의 견적과 연결하는 다자간 견적 중개 프로젝트다. 이 노트는 세부 요구사항 대신 프로젝트의 성격과 장기적으로 재사용할 경험만 보존한다.

## 프로젝트 개요

원큐파트너스는 다음 참여자를 하나의 견적 흐름으로 연결한다.

- **영업 파트너:** 고객 유입과 제휴 접점
- **고객:** 상담 신청, 견적 비교, 공급업체 선택
- **운영사:** 요구사항 정리, 공급업체 주선, 상담과 일정 조율
- **공급업체:** 방문 또는 온라인 견적 제공

프로젝트에는 영업 파트너용 랜딩과 포털, 고객 채널, 운영사 어드민, 공급업체 채널처럼 서로 다른 사용자 접점이 포함된다. 세부 범위는 변경될 수 있으므로 현재 구현과 저장소 문서를 우선한다.

## 내가 다룬 영역

- 공인중개사·부동산 중개업소를 대상으로 한 영업 파트너 모집·신청 랜딩 페이지의 기술 기반과 구현 경계
- 정적 콘텐츠를 중심으로 한 Astro 페이지 구조
- 필요한 상호작용만 React island로 분리하는 프런트엔드 경계
- 검색 엔진과 공유 미리보기를 고려한 문서·메타데이터 기반
- 모바일과 데스크톱을 함께 고려하는 반응형 웹 기반

이 범위는 `1qpartners-LANDING` 저장소에서 확인된 내용이다. 실제 담당 범위와 성과는 프로젝트 진행에 따라 [[career-notes|경력 정리 노트]]에 갱신한다.

## 기술 키워드

- Astro 7
- React 19
- TypeScript
- pnpm
- Static-first architecture
- Islands architecture
- Responsive web
- SEO와 소셜 공유 메타데이터

## 장기 보존 대상

- [[career-notes|이력서·경력 정리 재료]]
- [[incidents/index|트러블슈팅과 장애 기록]]

세부 기능 요구사항, 시나리오, 미결정 정책의 스냅샷은 장기 PKM에서 관리하지 않는다. 현재 사실은 코드, 테스트, 프로젝트 저장소 문서가 우선한다.
