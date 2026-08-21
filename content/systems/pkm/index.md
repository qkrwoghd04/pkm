---
id: systems/pkm
id_aliases:
  - public/systems/pkm
title: PKM System
description: Markdown 원본을 수집·검토·게시·검색하는 개인 지식 관리 시스템의 지식 지도.
status: active
updated: 2026-08-21
aliases:
  - PKM 시스템
  - 지식 관리 시스템
tags:
  - domain/knowledge-management
  - concern/navigation
  - concern/knowledge-lifecycle
---

> [!summary]
> `기록해:`로 수집한 메모를 기본적으로 매일 Ready로 정리하고, 필요하면 `준비해: <Captured ID>`로 같은 승격을 즉시 실행한다. 정확한 Ready ID를 승인한 문서만 검증·배포한다.

## Purpose

PKM System은 프로젝트 경험, 설계 결정, 트러블슈팅과 재사용 가능한 패턴을 다음 작업에서 다시 찾을 수 있도록 보존한다. 원본 자료를 무조건 축적하기보다 저장 목적을 명시하고, 기존 지식과 연결한 뒤 지속적인 가치가 있는 내용만 정식 문서로 만든다.

## Documents

- [[knowledge-lifecycle|AI-assisted PKM 지식 생명주기]] — Captured, Ready, Published 세 단계와 자동·수동 승격 및 공개 안전 게이트
- [[closeout-workflow|PKM Closeout Workflow]] — 완료된 작업에서 보존할 지식 후보를 제안하고 승인받는 방식

## System boundaries

- Markdown 문서는 지식의 source of truth다.
- 비공개 원본과 미검증 후보는 공개 `content/` 밖에서 관리한다.
- Quartz는 승인된 문서를 사람이 탐색하는 공개 레이어다.
- 읽기 MCP는 허용된 지식을 AI가 검색하고 읽는 조회 레이어다.
- 별도 capture MCP는 명시적으로 승인된 closeout 후보만 비공개 Captured inbox에 새로 만드는 생성 전용 레이어다.
- OpenClaw curator는 매일 새 Captured 메모를 중복 제거·분류해 비공개 Ready 초안으로 만든다.
- `준비해: <Captured ID>`는 같은 검증 경로를 특정 메모에 즉시 실행하는 수동 승격 레이어다.
- 구체적인 Ready ID를 지정한 `공개해:` 요청만 공개 검증·push·배포를 수행한다.
- 현재 프로젝트의 코드, 테스트와 저장소 문서는 과거 PKM보다 우선한다.

## Related knowledge

- [[../openclaw/index|OpenClaw]]
- [[../../projects/index|Projects]]
- [[../../incidents/index|Incidents]]
