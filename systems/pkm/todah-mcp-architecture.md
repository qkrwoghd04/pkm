---
id: systems/todah-mcp/current-architecture
title: Todah MCP 원격 배포 및 네트워크 구조
description: >-
  Cloudflare Access, Coolify, Traefik, Docker, PKM 저장소와 GitHub PR 발행 흐름을 정리한 운영
  구조.
status: active
updated: '2026-09-01'
verified_at: 2026-09-01T00:00:00.000Z
visibility: public
project_id: pkm
tags:
  - domain/knowledge-management
  - tech/mcp
  - tech/docker
  - tech/coolify
  - concern/security
  - concern/deployment
---

> [!summary]
> Todah MCP는 Cloudflare Access로 보호된 단일 HTTP MCP다. Coolify가 관리하는 Docker 컨테이너에서 지식 검색과 읽기, 검토용 draft 작성과 merge, GitHub PR 기반 공개 발행을 제공한다.

## 구조 요약

~~~text
Codex
  │ HTTPS Streamable HTTP
  ▼
Cloudflare Access
  │ GitHub OAuth 인증 및 Access JWT
  ▼
Coolify가 관리하는 Traefik
  │ HTTPS 라우팅 및 TLS 종료
  ▼
Docker 네트워크의 todah-mcp 컨테이너
  │ Node.js HTTP 서버
  ▼
PKM catalog와 draft/merge 원본
~~~

공개 Quartz 사이트와 MCP 서버는 별도 배포 단위다. 공개 사이트는 사람이 읽는 문서를 제공하고, MCP는 Codex 같은 클라이언트가 인증된 상태로 지식을 검색하고 변경 요청을 수행하는 인터페이스 역할.

## 요청 흐름

1. Codex가 보호된 MCP 도메인의 `/mcp` 경로로 JSON-RPC POST를 전송한다.
2. DNS와 Cloudflare 프록시를 거치며, Cloudflare Access가 GitHub OAuth 로그인과 허용된 계정 정책을 확인한다.
3. Access를 통과한 요청에는 Access JWT가 전달된다.
4. Coolify의 Traefik이 호스트 규칙으로 MCP 컨테이너의 내부 포트에 요청을 전달한다.
5. Node.js 서버가 JWT의 서명, issuer, audience와 만료를 다시 확인한다.
6. 검증된 요청만 MCP 도구로 전달된다.

애플리케이션 포트는 호스트에 직접 공개하지 않고 프록시를 통해서만 접근한다. MCP transport는 세션 ID를 만들지 않는 stateless Streamable HTTP 방식.

## HTTP 인터페이스

- `GET /healthz`: 인증 없이 서비스 상태를 확인하는 운영 경로.
- `POST /mcp`: MCP JSON-RPC 요청 경로.
- `GET /mcp`: 일반 브라우저 페이지가 아닌 MCP 전용 경로라 허용하지 않음.
- 요청 본문 크기 제한과 JSON 형식 검증 적용.
- 로그는 MCP 프로토콜 출력과 분리.

## PKM 데이터 경계

~~~text
public
  → 검토가 끝나 공개된 Quartz Markdown

merge
  → 검토 완료된 비공개 원본

draft
  → 새로 기록된 미검토 메모
~~~

catalog는 Markdown만 읽으며 숨김 경로, archive, templates, symlink와 대용량 파일을 제외한다. 기본 검색은 public과 merge를 대상으로 하고 draft는 명시적으로 요청할 때만 포함하며 미검증 상태로 표시한다.

공개 문서는 merge 원본에서 파생한다. 공개 결과를 직접 수정하지 않으며, merge 원본은 공개 후에도 유지한다.

## MCP 도구

| 도구 | 역할 |
| --- | --- |
| `search_knowledge` | public와 merge 중심 지식 검색 |
| `read_note` | 허용된 Markdown 문서의 제한된 범위 읽기 |
| `create_closeout_candidate` | 승인된 작업 정리 후보를 draft로 생성 |
| `create_note` | draft에 새 문서 생성 |
| `update_note` | draft와 merge 문서 수정, 동시 수정 방지를 위한 해시 확인 |
| `merge_note` | draft를 merge로 승격하고 public-review면 PR 발행 |
| `publish_note` | 공개 PR 상태 확인과 발행 복구 |

생명주기는 다음과 같다.

~~~text
기록해:
  → draft 생성

사용자 검토
  → merge해: <Draft ID>
  → merge 승격

public-review
  → GitHub PR 생성
  → 사람이 PR 병합
  → 공개 사이트 배포
~~~

draft에서 public으로 직접 전이하는 경로는 없다. public-review가 아닌 merge는 비공개 원본으로만 남는다.

## GitHub PR 발행

public-review 문서를 merge할 때 MCP는 공개 저장소의 checkout을 직접 수정하지 않고 GitHub App API를 사용한다.

1. 대상 저장소의 main 기준을 확인한다.
2. 대상 경로에 같은 stable ID의 기존 문서가 있는지 검사한다.
3. 다른 문서를 덮어쓰는 경우를 차단한다.
4. stable ID와 문서 해시를 포함한 결정적 branch를 만든다.
5. 공개 파생 Markdown을 branch에 commit하고 PR을 생성한다.
6. 동일한 발행 marker의 중복 PR 생성을 막는다.
7. PR URL과 상태를 merge 원본에 기록한다.

GitHub App의 식별자와 private key는 배포 환경의 secret으로만 관리하며 문서나 로그에 기록하지 않는다. MCP가 main에 직접 push하거나 Coolify API를 직접 호출하지 않는 구조.

## 배포와 동기화

~~~text
MCP 소스 저장소 main
  → Coolify webhook
  → Docker build와 Node.js runtime
  → Traefik HTTPS route

공개 PKM 저장소 main
  → 공개 Quartz 배포

호스트 동기화 작업
  → 공개 PKM checkout을 주기적으로 fast-forward pull
  → MCP catalog 최신화
~~~

공개 PR 병합 뒤 공개 사이트 배포와 MCP catalog 동기화는 서로 다른 경로로 진행되므로 짧은 반영 지연이 생길 수 있다.

## 운영 확인

- 런타임에서 catalog 준비와 HTTP listener 시작 로그 확인.
- 인증 없는 MCP 요청은 401로 거부.
- health 경로는 200으로 응답.
- 애플리케이션 포트는 호스트에 직접 노출하지 않고 프록시 뒤에서만 접근.
- MCP와 공개 Quartz 사이트는 Coolify의 별도 애플리케이션.

## 주의점

- 공개 원본은 애플리케이션 수준에서 직접 수정하지 않지만, 컨테이너 mount 권한은 배포 설정에서 read-only인지 별도 확인 필요.
- production 검색은 현재 빠른 lexical 경로를 사용하며, 의미 기반 검색을 활성화할 때는 실행 시간과 인덱스 상태를 먼저 검증.
- Cloudflare Access는 사용자 인증, GitHub App은 PR 발행 인증으로 서로 다른 역할.
- PR이 생성된 상태는 공개 완료가 아니라 사람의 검토 대기 상태.

## 관련 문서

- [[systems/pkm|PKM System]]
- [[systems/pkm/knowledge-lifecycle|AI-assisted PKM 지식 생명주기]]
- [[systems/pkm/closeout-workflow|PKM Closeout Workflow]]
