---
title: PKM System
description: Markdown 원본을 수집·검토·게시·검색하는 개인 지식 관리 시스템의 지식 지도.
status: active
updated: 2026-08-03
aliases:
  - PKM 시스템
  - 지식 관리 시스템
tags:
  - system/pkm
  - pkm
  - knowledge-management
---

> [!summary]
> 사람과 AI가 함께 지식을 수집하고 정리하되, 검토된 Markdown만 canonical knowledge로 승격하는 운영 구조를 관리한다.

## Purpose

PKM System은 프로젝트 경험, 설계 결정, 트러블슈팅과 재사용 가능한 패턴을 다음 작업에서 다시 찾을 수 있도록 보존한다. 원본 자료를 무조건 축적하기보다 저장 목적을 명시하고, 기존 지식과 연결한 뒤 지속적인 가치가 있는 내용만 정식 문서로 만든다.

## Documents

- [[knowledge-lifecycle|AI-assisted PKM 지식 생명주기]] — 원본 수집부터 검토, 게시, 검색과 유지보수까지의 운영 원칙
- [[closeout-workflow|PKM Closeout Workflow]] — 완료된 작업에서 보존할 지식 후보를 제안하고 승인받는 방식

## System boundaries

- Markdown 문서는 지식의 source of truth다.
- 비공개 원본과 미검증 후보는 공개 `content/` 밖에서 관리한다.
- Quartz는 승인된 문서를 사람이 탐색하는 공개 레이어다.
- MCP는 허용된 지식을 AI가 검색하고 읽는 조회 레이어다.
- 현재 프로젝트의 코드, 테스트와 저장소 문서는 과거 PKM보다 우선한다.

## Related knowledge

- [[../openclaw/index|OpenClaw]]
- [[../../projects/index|Projects]]
- [[../../incidents/index|Incidents]]
