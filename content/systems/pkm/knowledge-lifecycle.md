---
id: systems/pkm/knowledge-lifecycle
id_aliases:
  - public/systems/pkm/knowledge-lifecycle
title: AI-assisted PKM 지식 생명주기
description: 메모를 수집하고 자동 또는 수동으로 Ready로 정리한 뒤 명시적으로 선택한 지식만 검증·게시하는 세 단계 운영 절차.
status: active
updated: 2026-08-21
aliases:
  - PKM 지식 생명주기
  - AI-assisted PKM workflow
tags:
  - domain/knowledge-management
  - concern/human-review
  - concern/knowledge-lifecycle
---

> [!summary]
> 사용자에게 보이는 상태는 `Captured → Ready → Published` 세 가지다. `기록해:`로 수집한 메모는 기본적으로 매일 자동 정리하고, 필요하면 `준비해: <Captured ID>`로 같은 Ready 승격을 즉시 수동 실행한다. 공개는 `공개해: <Ready ID>`로 별도 승인한다.

## 세 가지 상태

| 상태      | 의미                                              | 신뢰 수준        | 공개 여부 |
| --------- | ------------------------------------------------- | ---------------- | --------- |
| Captured  | 원문과 맥락을 보존한 비공개 임시 메모             | 미정리           | 비공개    |
| Ready     | 자동 또는 수동으로 중복을 병합한 비공개 공개 초안 | 미공개·검토 가능 | 비공개    |
| Published | 검증·push·배포까지 완료된 canonical 문서          | 공개 참고자료    | 공개      |

`decision`, `incident`, `pattern`, `runbook`, `project-note`, `career`는 상태가 아니라 Ready 문서가 어떤 지식인지 설명하는 분류다. 메모를 별도 명령으로 Decision이나 Publish candidate에 승격하지 않는다.

## 1. Captured

Chief Telegram에서 메시지를 `기록해:`로 시작하면 비공개 inbox에 새 메모를 만든다.

```text
기록해: systemd 서비스는 로그인 셸의 PATH를 자동 상속하지 않는다.
```

Capture 과정에서 AI는 다음만 보완한다.

- 원문을 훼손하지 않은 요약
- 검색에 도움이 되는 태그
- 관련되거나 중복된 기존 문서
- 나중에 확인해야 할 질문

`메모해:`, `저장해:`, 평서문이나 과거 메시지 인용은 저장 권한으로 해석하지 않는다. 같은 내용을 다시 기록하더라도 새 메모는 보존하고 중복 관계를 연결해 정리 단계에서 병합한다.

## 2. Ready 승격

### 기본 자동 경로

매일 21:30 Asia/Seoul에 curator가 새 Captured 메모를 검토한다. 이 과정은 공개하지 않는다.

1. 아직 정리되지 않은 Captured 메모를 찾는다.
2. 기존 public/reference 지식을 먼저 검색한다.
3. 중복되거나 같은 주제인 메모를 병합한다.
4. 새 문서보다 기존 canonical 문서 갱신을 우선한다.
5. 지식 유형과 대상 경로를 정한다.
6. 민감정보를 제거하고 완전한 공개 Markdown 초안을 만든다.
7. 최대 다섯 개의 Ready 항목과 정확한 Ready ID를 Telegram으로 알린다.

### 수동 즉시 경로

자동 실행을 기다리지 않고 특정 Captured 메모를 처리하려면 정확한 ID를 지정해 다음처럼 요청한다.

```text
준비해: <Captured ID>
```

이 명령은 자동 경로와 같은 중복 검색, 분류, 목적지 선택, 민감정보 제거, 초안 검증과 해시 생성을 즉시 실행한다.

1. Captured ID가 실제로 존재하는지 확인한다.
2. 이미 Ready가 있으면 새 문서를 만들지 않고 기존 Ready ID를 반환한다.
3. 없으면 Ready를 만들고 내부 메타데이터에 `curation_trigger: manual`을 기록한다.
4. Ready ID만 반환하며, 이 명령만으로 공개하거나 Git에 반영하지 않는다.

`준비해`, `모두 준비해`처럼 대상 ID가 없거나 여러 메모를 암시하는 요청은 실행하지 않고 정확한 Captured ID를 다시 요청한다.

이미 canonical 문서에 반영됐거나 중복·일시적·근거 부족·민감정보 때문에 Ready가 필요 없는 메모는 내부 curation receipt로 정리 완료 처리한다. 이 영수증은 같은 메모를 매일 다시 읽지 않기 위한 운영 기록이며 사용자에게 보이는 네 번째 상태가 아니다.

Ready는 다음 정보를 포함한다.

- 근거가 된 Captured 메모
- 지식 유형
- 제안 대상 경로
- 공개 초안 전체
- 민감정보 검사 여부
- 공개 초안의 SHA-256 해시
- 승격 트리거(`scheduled` 또는 `manual`)

Captured 원문이 바뀌거나 Ready 초안이 변조되면 해시 검증이 실패해 공개할 수 없다.

## 3. Published

공개는 Ready ID 한 개를 지정한 다음 형식으로만 승인한다.

```text
공개해: 2026-08-10-213000-systemd-environment
```

`공개해`, `모두 공개해`, `1번 공개해`처럼 대상을 확정할 수 없는 문구는 승인으로 처리하지 않는다. 승인된 한 건은 다음 게이트를 모두 통과해야 한다.

1. Ready ID와 원본 요청 일치
2. 대상 경로 allowlist와 경로 탈출 차단
3. 공개 초안 SHA-256 재검증
4. 자격증명·이메일·비공개 데이터 검사
5. 전체 콘텐츠 구조와 wikilink 검사
6. Quartz build
7. Git `main` push
8. 기존 release 파이프라인 배포
9. 실서비스 HTTP 200 health check

한 단계라도 실패하면 Ready 항목은 미공개 상태로 남는다. 배포까지 성공한 항목만 Published 보관함으로 이동한다.

## 검색 우선순위

AI가 답변할 때의 우선순위는 다음과 같다.

1. 현재 프로젝트 코드와 테스트
2. 저장소의 `AGENTS.md`와 로컬 문서
3. Published canonical 문서와 accepted legacy decision
4. private reference
5. Ready 초안
6. Captured 메모

Ready는 `미공개 Ready 초안`, Captured는 `미정리 메모`로 표시한다. 충돌하는 내용을 조용히 합치지 않고 날짜·상태·근거를 함께 보여준다.

## 원본 자료와 Closeout

영상 transcript, 회의 기록과 긴 자료는 `sources/`에 원본으로 보존할 수 있다. 이것은 사용자에게 보이는 추가 상태가 아니라 Captured 메모를 만들 때 참고하는 내부 자료다.

Codex의 `$pkm-closeout`도 별도 생명주기를 만들지 않는다. 의미 있는 작업에서 승인된 후보를 Captured inbox로 넣고, 기본적으로는 일일 curator가 Ready로 정리한다. 필요하면 같은 후보에 `준비해: <Captured ID>`를 사용해 즉시 수동 승격할 수 있다. 세부 승인 경계는 [[closeout-workflow|PKM Closeout Workflow]]에서 관리한다.

## 운영 원칙

- 원본 메모와 canonical 지식을 같은 것으로 취급하지 않는다.
- 자동화는 기본 정리와 Ready 승격을 담당하되 명시적 수동 승격도 지원하고, 공개는 구체적인 사용자 승인으로 제한한다.
- 한 문서는 하나의 주요 질문에 답한다.
- 새 문서보다 기존 authoritative note 갱신을 우선한다.
- 공개 실패 시 현재 서비스 중인 release를 유지한다.
- 레거시 `decisions/`와 `publish-ready/`는 이력으로만 보존하며 새 파일을 만들지 않는다.

## 관련 문서

- [[index|PKM System]]
- [[closeout-workflow|PKM Closeout Workflow]]
- [[../../projects/index|Projects]]
- [[../../incidents/index|Incidents]]
