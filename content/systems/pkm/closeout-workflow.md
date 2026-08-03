---
title: PKM Closeout Workflow
description: 완료된 개발 작업에서 장기 보존할 incident·decision·pattern 후보를 자동 제안하는 Codex 운영 방식.
status: active
updated: 2026-08-03
aliases:
  - PKM closeout
  - 지식 후보 제안 흐름
tags:
  - system/pkm
  - knowledge-lifecycle
  - codex
  - human-review
---

> [!summary]
> Codex는 의미 있는 작업을 검증한 뒤 `$pkm-closeout`으로 최대 세 개의 지식 후보를 제안한다. 사용자가 특정 후보를 명시적으로 승인하면 별도 create-only MCP가 비공개 inbox 후보를 생성한다. 이 승인은 canonical 문서 갱신이나 공개 배포 권한을 포함하지 않는다.

## Purpose

프로젝트 작업에서 확인한 원인, 설계 판단과 운영 경험은 채팅 종료와 함께 사라지기 쉽다. 반대로 모든 작업을 자동 저장하면 임시 판단, 중복과 미검증 정보가 canonical knowledge에 섞인다.

Closeout workflow는 작업이 끝나는 시점에 보존 가치가 있는 변화만 찾아 사람이 승인할 수 있는 후보로 만드는 경계다.

## Trigger conditions

다음 중 하나가 검증된 작업을 마치면 closeout을 수행한다.

- 원인과 해결이 확인된 비단순 incident
- 장기간 유지할 architecture, design 또는 operations decision
- migration, deployment, dependency 또는 testing strategy의 실질적인 변경
- 여러 프로젝트에서 재사용할 수 있는 pattern
- 반복 가능한 runbook의 실질적인 변경

다음 작업에는 closeout을 생략한다.

- 서식 변경, 단순 이름 변경과 생성 파일 갱신
- 사소한 문법 수정과 일상적인 의존성 갱신
- 완료되지 않은 조사와 검증되지 않은 가설
- 기존 PKM 문서와 의미가 같은 변경

## Workflow

1. **Verify:** 현재 코드, 테스트, 저장소 문서, diff와 런타임 결과로 작업 완료를 확인한다.
2. **Search:** `jayden-pkm`에서 현재 프로젝트를 먼저 검색하고 공통 pattern을 이어서 검색한다.
3. **Deduplicate:** 기존 canonical note가 있으면 새 문서 대신 갱신 후보로 만든다.
4. **Classify:** 후보를 incident, decision, pattern 또는 runbook으로 분류한다.
5. **Propose:** 보존 가치가 높은 후보만 최대 세 개 제안한다.
6. **Wait:** 사용자가 후보를 명시적으로 승인할 때까지 어떤 PKM도 수정하지 않는다.
7. **Capture:** 승인된 후보만 `jayden-pkm-capture`를 통해 비공개 `inbox/closeouts`에 생성한다.
8. **Curate:** 나중에 사람이 후보를 검토해 기존 문서 병합, 비공개 보존 또는 공개 반영을 결정한다.

MCP를 사용할 수 없으면 작업 종료를 막지 않는다. 이 경우 후보의 중복 검사 상태를 `확인 불가`로 표시한다.

## Candidate types

| 유형     | 기록할 내용                                        | 기본 목적지                                                  |
| -------- | -------------------------------------------------- | ------------------------------------------------------------ |
| Incident | 증상, 영향, 원인, 해결, 검증과 재발 방지           | `projects/<project_id>/incidents/<slug>.md`                  |
| Decision | 맥락, 선택, 대안, trade-off와 결과                 | `projects/<project_id>/decisions/<slug>.md`                  |
| Pattern  | 다른 프로젝트에서도 재사용할 수 있는 일반화된 교훈 | `patterns/<domain>/<slug>.md`                                |
| Runbook  | 반복 가능한 배포, 운영, 복구 또는 검증 절차        | `projects/<project_id>/runbooks/<slug>.md` 또는 기존 runbook |

한 프로젝트에서만 확인된 세부 구현은 곧바로 pattern으로 승격하지 않는다. 재사용이 입증되기 전에는 프로젝트 지식으로 유지한다.

## Proposal contract

각 후보는 다음 정보를 포함한다.

- 후보 유형과 제목
- 다시 필요할 이유
- 제안할 canonical note 경로
- 핵심 내용 1–3문장
- 파일·행, 테스트, 로그 또는 commit 근거
- `public-review` 또는 `private-review` 검토 범위
- 새 문서, 기존 문서 갱신 또는 중복 검사 불가 상태

제안은 다음 형태를 사용한다.

```text
1. [incident] Caddy가 홈 디렉터리 정적 파일을 읽지 못한 문제
   - 보존 가치: 다른 systemd 웹 서비스에서도 반복될 수 있음
   - 제안 위치: patterns/infrastructure/web-service-file-permissions.md
   - 근거: 서비스 로그, HTTP 응답과 배포 검증
   - 검토 범위: public-review
   - 중복 검사: 기존 문서 갱신
```

## Approval boundary

`1번 기록해`, `모두 기록해`처럼 후보를 특정한 명령만 저장 승인으로 본다. `좋아`, `확인` 같은 일반적인 응답이나 무응답은 승인으로 해석하지 않는다.

저장 승인과 공개 승인은 서로 다르다. 비공개 후보 저장을 승인해도 공개 Quartz 게시까지 승인한 것으로 보지 않는다. 저장 단계에서도 개인정보, 자격증명, 내부 URL, 고객 기록과 비공개 issue 식별자를 다시 검사한다.

승인된 후보는 다음 안전 경계를 거친다.

- 읽기 전용 `jayden-pkm`과 분리된 `jayden-pkm-capture`만 사용한다.
- 호출자가 파일 경로를 정하지 못하며 목적지는 비공개 `inbox/closeouts`로 고정된다.
- 같은 내용은 fingerprint로 판별해 새 파일을 중복 생성하지 않는다.
- 새 파일만 만들 수 있고 기존 문서 수정·삭제·Git commit·Quartz 게시를 수행하지 않는다.
- 결과는 항상 `status: inbox`, `unverified: true`로 저장한다.
- 자격증명이나 token으로 의심되는 문자열은 파일을 만들기 전에 거부한다.

## Codex integration

전역 사용자 Skill은 `~/.codex/skills/pkm-closeout/`에 두고 implicit invocation을 허용한다. 전역 `~/.codex/AGENTS.md`는 완료된 의미 있는 작업의 최종 응답 전에 Skill을 사용하도록 연결한다.

Skill은 승인 후 `jayden-pkm-capture.create_closeout_candidate`에 승인 문구, 후보 유형, 요약, 보존 이유, 근거와 제안 위치를 전달한다. 새 MCP 또는 Skill 설정을 설치한 뒤에는 새 Codex task에서 적용 여부를 확인한다. 현재 task의 코드와 테스트가 PKM보다 우선하며, closeout은 작업이 검증된 뒤에만 실행한다.

## Current boundary

`jayden-pkm`은 계속 검색과 원문 읽기만 제공한다. 별도 `jayden-pkm-capture`는 승인된 후보를 새 비공개 inbox 파일로 만드는 도구 하나만 제공한다. 생성 직후 MCP catalog는 갱신되지만 OpenClaw 별도 index 반영은 독립 주기에 맡긴다.

비공개 inbox는 10분 주기의 snapshot으로 Git에 보존된다. 후보를 canonical public note로 병합하고 Quartz에 배포하는 작업은 기존 콘텐츠 검증과 명시적 push 승인 절차를 별도로 거친다.

## Related knowledge

- [[knowledge-lifecycle|AI-assisted PKM 지식 생명주기]]
- [[index|PKM System]]
- [[../../projects/index|Projects]]
- [[../../incidents/index|Incidents]]
