---
id: integrations/outline-mcp
id_aliases:
  - public/integrations/outline-mcp
title: Outline MCP 읽기 전용 연결
description: Outline 지식을 MCP로 조회할 때 자격 증명, 도구, 문서 권한을 최소 범위로 제한하는 운영 절차.
status: active
updated: 2026-08-07
aliases:
  - Outline MCP read-only setup
tags:
  - domain/knowledge-management
  - tech/outline
  - tech/mcp
  - concern/least-privilege
---

> [!summary]
> Outline MCP는 검색과 조회만 허용하는 것을 기본값으로 삼는다. 읽기 범위의 자격 증명, 실행 환경을 통한 토큰 주입, MCP 도구 허용 목록을 함께 적용하고, 더 강한 경계가 필요하면 Outline 계정과 컬렉션 권한도 Viewer 수준으로 제한한다.

## 목적

AI 클라이언트가 Outline의 문서를 참고할 수 있게 하면서도 문서 생성·수정·삭제 권한은 제공하지 않는다. 클라이언트 설정 하나에 의존하지 않고 다음 세 계층에서 권한을 줄인다.

1. Outline 계정과 컬렉션 권한
2. MCP 서버가 사용할 자격 증명의 범위
3. Codex 같은 MCP 클라이언트에 노출할 도구 목록

## 권한 경계

```text
Codex
  → 읽기 도구 허용 목록
  → Outline MCP
  → 읽기 전용 자격 증명
  → 접근이 허용된 컬렉션
```

- Outline 자격 증명은 검색과 조회에 필요한 최소 범위로 만든다.
- 토큰은 저장소나 공유 설정 파일에 기록하지 않고 실행 환경에서 주입한다.
- MCP 클라이언트에는 검색·목록·문서 읽기 도구만 허용한다.
- 강제력이 필요한 환경에서는 MCP 도구 필터와 별개로 Outline 사용자 또는 컬렉션 권한을 Viewer로 제한한다.

## 설정 절차

1. Outline에서 MCP 전용 계정 또는 자격 증명을 준비한다.
2. 해당 계정이 읽어야 하는 컬렉션만 열고 편집 권한은 제거한다.
3. 토큰을 `OUTLINE_API_TOKEN`과 같은 환경변수로 주입한다. 실제 변수 이름은 사용하는 MCP 서버의 문서를 따른다.
4. Codex의 MCP 설정에서 검색·목록·읽기 도구만 허용한다. 도구 이름은 MCP 서버 버전에 따라 달라질 수 있으므로 실제 노출 목록을 확인한다.
5. MCP 호스트와 클라이언트를 다시 시작해 새 환경과 도구 정책을 적용한다.

## 검증

- 허용된 컬렉션에서 문서를 검색할 수 있다.
- 검색 결과의 본문을 읽을 수 있다.
- 문서 생성·수정·삭제 도구가 노출되지 않거나 호출이 거부된다.
- 허용하지 않은 컬렉션은 검색 결과와 직접 조회에서 모두 보이지 않는다.
- 토큰 값이 저장소, 설정 출력, 로그에 남지 않는다.

## 운영 시 주의사항

클라이언트의 도구 허용 목록은 실수 방지에는 유용하지만 단독으로는 강한 보안 경계가 아니다. MCP 서버가 다른 클라이언트에서 실행되거나 설정이 바뀌면 쓰기 도구가 다시 노출될 수 있기 때문이다. 중요한 문서는 Outline 자체 권한까지 읽기 전용으로 제한한다.

자격 증명은 정기적으로 교체하고, 접근 범위가 변경될 때마다 검색·읽기 성공과 쓰기 차단을 함께 재검증한다.

## 관련 문서

- [[index|Integrations]]
- [[../systems/pkm/index|PKM System]]
- [[../playbooks/security-hardening|Ubuntu Server 보안 하드닝]]
