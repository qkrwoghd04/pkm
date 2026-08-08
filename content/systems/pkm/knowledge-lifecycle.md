---
id: systems/pkm/knowledge-lifecycle
id_aliases:
  - public/systems/pkm/knowledge-lifecycle
title: AI-assisted PKM 지식 생명주기
description: 원본 자료와 작업 경험을 검토된 지식으로 승격하고 다시 검색·관리하는 운영 절차.
status: active
updated: 2026-08-03
aliases:
  - PKM 지식 생명주기
  - AI-assisted PKM workflow
tags:
  - domain/knowledge-management
  - concern/human-review
  - concern/knowledge-lifecycle
---

> [!summary]
> 지식은 `raw source → ingest review → canonical knowledge → retrieval → closeout and lint` 순서로 관리한다. AI는 후보를 만들고 연결하지만, 사람이 승인한 내용만 canonical knowledge가 된다.

## Why this lifecycle exists

대화, 영상, 프로젝트 산출물과 작업 기록을 그대로 검색 대상으로 쌓으면 중복, 오래된 사실, 개인정보와 임시 판단이 섞이기 쉽다. 이 생명주기는 원본과 정식 지식을 분리하고, AI의 정리 능력을 활용하면서도 지식의 정확성과 공개 경계를 사람이 통제하기 위한 규칙이다.

## Knowledge states

| 상태                 | 역할                                          | 신뢰 수준          | 기본 검색    |
| -------------------- | --------------------------------------------- | ------------------ | ------------ |
| Raw source           | 원문, transcript, 참고자료와 작업 산출물 보존 | 출처 자체로만 유효 | 제외         |
| Ingest review        | 기존 지식과 비교한 변경 후보                  | 미검증             | 제외         |
| Canonical knowledge  | 사람이 승인한 현재 지식                       | 검증된 참고자료    | 포함         |
| Decision or incident | 선택 이유 또는 해결된 문제의 기록             | 문서 상태에 따름   | 승인 후 포함 |
| Archive              | 대체되었거나 더 이상 사용하지 않는 기록       | 역사적 참고        | 제외         |

## Lifecycle

### 1. Capture

가치 있는 원본만 선택적으로 수집한다. 원본과 함께 다음 맥락을 남겨야 한다.

- 왜 저장하는가
- 어떤 질문이나 프로젝트에 활용할 것인가
- 원문 전체인지 일부 발췌인지
- 출처와 수집 시점은 무엇인가
- 개인정보나 공개할 수 없는 내용이 포함되어 있는가

Raw source는 수정하지 않고 비공개로 보존하며 Quartz와 MCP 기본 검색에서 제외한다. 모든 대화, 화면과 음성을 상시 기록하는 방식은 검색 잡음과 개인정보 위험 때문에 기본 운영 원칙으로 채택하지 않는다.

### 2. Ingest

AI는 새 자료만 요약하기 전에 현재 PKM을 먼저 검색한다. 새 문서를 무조건 만들지 않고 다음 중 필요한 변경을 최대 세 개까지 제안한다.

- 기존 canonical 문서 갱신
- 프로젝트별 decision 또는 incident 추가
- 여러 프로젝트에서 재사용할 pattern 또는 playbook 추가
- 지속적인 지식이 없을 때 `no canonical change`로 종료

제안에는 근거 source, 기존 문서와의 차이, 불확실성, 공개 제외 항목과 예상 목적지를 포함한다.

### 3. Review

사람은 source가 주장하는 사실과 실제 운영에 채택할 결정을 구분해 검토한다. 다음 조건을 만족할 때만 승격한다.

- 현재 코드와 저장소 문서에 모순되지 않는다.
- 임시 아이디어를 확정된 사실처럼 표현하지 않는다.
- 중복 문서를 만들지 않고 기존 authoritative note를 갱신한다.
- 개인정보, 자격증명과 내부 전용 정보가 제거되었다.
- 향후 다시 검색하거나 적용할 지속적인 가치가 있다.

미검증 후보는 inbox 또는 publish-ready 상태로 유지하며 canonical 근거로 사용하지 않는다. Closeout 후보는 명시적 승인 후에만 create-only MCP가 비공개 `inbox/closeouts`에 생성한다.

### 4. Publish

승인된 내용을 의미 중심의 Markdown 문서로 반영한다. 공개 반영 전에는 다음 순서를 지킨다.

1. 관련 index와 wikilink를 함께 갱신한다.
2. 콘텐츠 구조와 frontmatter를 검사한다.
3. 민감정보 패턴을 검사한다.
4. Quartz build로 문서와 링크를 검증한다.
5. Git diff를 사람이 확인한다.
6. 명시적 승인 후에만 push하고 배포한다.

AI가 canonical 문서를 무승인으로 수정하거나 자동 push하는 흐름은 사용하지 않는다.

### 5. Query

AI가 PKM을 사용할 때는 프로젝트별 지식을 먼저 찾고, 그다음 여러 프로젝트에 재사용할 수 있는 pattern을 찾는다. 답변에는 사용한 note와 관련 구간을 표시한다.

정보가 충돌할 때의 우선순위는 다음과 같다.

1. 현재 코드와 테스트
2. 현재 저장소의 `AGENTS.md`와 로컬 문서
3. active canonical 문서와 accepted decision
4. resolved incident와 재사용 pattern
5. 미검증 inbox 또는 publish-ready 후보

PKM에 근거가 없거나 오래되었다면 그 사실을 밝히고 현재 저장소를 기준으로 계속 진행한다.

### 6. Closeout

의미 있는 작업을 마치면 새로 확인된 knowledge delta를 최대 세 개까지 제안한다.

- 해결한 incident와 재발 방지책
- 장기간 유지할 설계 decision
- 다른 프로젝트에 재사용할 pattern
- 변경된 runbook 또는 운영 절차

후보에는 제목, 보존 이유, 대상 위치, 근거 코드·문서와 공개 가능 여부를 포함한다. 사용자 승인 전에는 저장하거나 canonical 문서를 변경하지 않는다. 승인 후에도 먼저 미검증 비공개 inbox 후보로만 생성하며, 기존 canonical 문서 병합과 공개 배포는 별도 검토와 승인을 요구한다.

Codex의 자동 후보 선정 기준과 승인 경계는 [[closeout-workflow|PKM Closeout Workflow]]에서 관리한다.

### 7. Lint

정기적으로 다음 상태를 점검한다.

- 깨진 wikilink와 고립된 문서
- 중복되거나 서로 모순되는 설명
- 오래되어 현재 구현과 맞지 않는 문서
- deprecated 문서에 누락된 대체 문서
- 민감정보와 공개 경계 위반
- 프로젝트 incident 중 공통 pattern으로 승격할 후보

문서 수가 작을 때는 구조 검사와 사람 검토를 우선하고, 별도의 벡터 DB나 완전 자동 지식 그래프는 검색 품질 문제가 확인될 때 도입한다.

## Operating principles

- 원본과 canonical knowledge를 같은 것으로 취급하지 않는다.
- 저장량보다 검색했을 때 다시 쓸 수 있는 품질을 우선한다.
- 한 문서는 하나의 주요 질문에 답하게 한다.
- 같은 설명을 복제하지 않고 authoritative note에 연결한다.
- AI는 제안과 연결을 담당하고, 사람은 승인과 공개 경계를 책임진다.

## Related knowledge

- [[index|PKM System]]
- [[closeout-workflow|PKM Closeout Workflow]]
- [[../../projects/index|Projects]]
- [[../../incidents/index|Incidents]]
