---
id: systems/pkm/closeout-workflow
id_aliases:
  - public/systems/pkm/closeout-workflow
title: PKM Closeout Workflow
description: 완료된 개발 작업에서 장기 보존할 지식을 선별해 Captured로 넘기고 자동 또는 수동으로 Ready까지 승격하는 Codex 운영 방식.
status: active
updated: 2026-08-21
aliases:
  - PKM closeout
  - 지식 후보 제안 흐름
tags:
  - domain/knowledge-management
  - tech/codex
  - concern/human-review
  - concern/knowledge-lifecycle
---

> [!summary]
> Codex는 의미 있는 작업을 검증한 뒤 `$pkm-closeout`으로 최대 세 개의 지식 후보를 제안한다. 사용자가 특정 후보를 승인하면 비공개 Captured 메모가 되며, 기본적으로는 일일 자동 curator가 Ready로 정리한다. 사용자는 `준비해: <Captured ID>`로 같은 승격을 즉시 실행할 수도 있다.

## 목적

프로젝트에서 확인한 원인, 설계 판단과 운영 경험은 대화 종료와 함께 사라지기 쉽다. 반대로 모든 작업을 자동 저장하면 임시 판단, 중복과 미검증 정보가 canonical knowledge에 섞인다.

Closeout은 작업 종료 시 보존 가치가 있는 변화만 골라 Captured 단계로 전달한다. 별도의 Decision 또는 Publish-candidate 상태를 만들지 않는다.

## 실행 조건

다음 중 하나가 검증된 작업을 마치면 closeout을 수행한다.

- 원인과 해결이 확인된 비단순 incident
- 장기간 유지할 architecture, design 또는 operations decision
- migration, deployment, dependency 또는 testing strategy의 실질적인 변경
- 여러 프로젝트에서 재사용할 수 있는 pattern
- 반복 가능한 runbook의 실질적인 변경

서식 변경, 단순 이름 변경, 사소한 문법 수정, 완료되지 않은 조사, 검증되지 않은 가설과 기존 PKM과 같은 내용은 생략한다.

## 흐름

1. **Verify:** 코드, 테스트, 저장소 문서, diff와 런타임 결과로 완료를 확인한다.
2. **Search:** 현재 프로젝트 지식을 먼저 찾고 공통 pattern을 이어서 검색한다.
3. **Deduplicate:** 기존 canonical note가 있으면 새 문서보다 갱신 후보로 만든다.
4. **Classify:** incident, decision, pattern, runbook, project-note 또는 career로 분류한다.
5. **Propose:** 보존 가치가 높은 후보만 최대 세 개 제안한다.
6. **Wait:** 사용자가 구체적인 후보를 승인할 때까지 저장하지 않는다.
7. **Capture:** 승인된 후보만 비공개 `inbox/closeouts`에 Captured 메모로 생성한다.
8. **Curate:** 기본적으로 매일 curator가 중복 제거·보완해 Ready로 만든다. 사용자가 `준비해: <Captured ID>`를 보내면 같은 검증 경로를 즉시 실행한다.
9. **Publish:** 사용자가 정확한 Ready ID를 지정한 경우에만 공개 검증과 배포를 수행한다.

MCP를 사용할 수 없으면 작업 종료를 막지 않는다. 중복 검사 상태를 `확인 불가`로 표시하고 후보만 제안한다.

## 수동 Ready 승격

자동 curator를 기다리지 않고 closeout 후보를 정리하려면 정확한 Captured ID를 지정한다.

```text
준비해: <Captured ID>
```

수동 경로도 자동 경로와 동일하게 중복 확인, 목적지 선택, 민감정보 제거, 콘텐츠 검증과 해시 생성을 수행한다. 이미 Ready가 있으면 기존 ID를 반환하고 중복 초안을 만들지 않는다. 수동 승격은 공개 승인을 포함하지 않으며, 공개에는 별도의 `공개해: <Ready ID>`가 필요하다.

## 지식 유형과 제안 위치

프로젝트 문서는 기본적으로 `content/projects/<project>/` 아래에서 flat하게 관리한다.

| 유형         | 기록할 내용                                      | 제안 위치 예시                                      |
| ------------ | ------------------------------------------------ | --------------------------------------------------- |
| Incident     | 증상, 영향, 원인, 해결, 검증과 재발 방지         | `projects/<project>/incident-<slug>.md`             |
| Decision     | 맥락, 선택, 대안, trade-off와 결과               | `projects/<project>/decision-<slug>.md`             |
| Runbook      | 반복 가능한 배포, 운영, 복구 또는 검증 절차      | `projects/<project>/runbook-<slug>.md`              |
| Project note | 프로젝트에서만 유효한 구조·요구사항·경험         | `projects/<project>/<slug>.md`                      |
| Career       | 역할, 책임, 성과와 이력서 근거                   | `projects/<project>/career-notes.md` 또는 `career/` |
| Pattern      | 두 개 이상의 프로젝트에서 재사용된 일반화된 교훈 | `patterns/<domain>/<slug>.md`                       |

한 프로젝트에서만 확인된 구현을 곧바로 pattern으로 승격하지 않는다.

## 후보 계약

각 후보는 다음 정보를 포함한다.

- 후보 유형과 제목
- 다시 필요할 이유
- 제안할 canonical note 경로
- 핵심 내용 1–3문장
- 파일·행, 테스트, 로그 또는 commit 근거
- 공개 가능 여부와 제거해야 할 민감정보
- 새 문서, 기존 문서 갱신 또는 중복 검사 불가 상태

## 승인 경계

`1번 기록해`, `모두 기록해`처럼 closeout 후보를 특정한 명령만 Captured 저장 승인으로 본다. `좋아`, `확인`과 무응답은 승인으로 해석하지 않는다.

Captured 저장 승인은 공개 승인이 아니다. 공개는 일일 정리 후 생성된 실제 Ready ID를 다음처럼 지정해야 한다.

```text
공개해: 2026-08-10-213000-systemd-environment
```

Ready ID가 없는 `공개해`, `모두 공개해`, 번호만 사용한 요청은 공개 권한으로 처리하지 않는다.

## 안전 경계

- 읽기 MCP와 Captured 생성 MCP는 분리한다.
- Captured 생성 대상은 비공개 `inbox/closeouts`로 고정한다.
- 승인된 closeout 후보도 `status: inbox`, `unverified: true`로 시작한다.
- 자동 또는 수동 Ready 생성은 중복 병합과 민감정보 제거를 수행하지만 공개하지 않는다.
- Ready 공개는 초안 해시, 경로 allowlist, 비밀 검사, 콘텐츠 검증, Quartz build, push, 배포와 HTTP health check를 모두 통과해야 한다.
- 실패한 Ready는 그대로 남고 기존 서비스 release는 유지된다.

## Codex 연동

사용자 Skill은 `~/.codex/skills/pkm-closeout/`에 두며 의미 있는 작업이 검증된 뒤에만 실행한다. 현재 코드와 테스트가 PKM보다 우선한다.

승인된 후보는 `jayden-pkm-capture.create_closeout_candidate`로 Captured 상태에 들어간다. OpenClaw curator는 일반 Telegram capture와 closeout capture를 같은 pending 목록에서 정리한다.

## 현재 운영

- Captured 메모는 비공개 Git snapshot으로 보존된다.
- 매일 21:30 Asia/Seoul에 pending Captured 메모를 Ready로 정리한다.
- 필요하면 `준비해: <Captured ID>`로 특정 메모의 Ready 승격을 즉시 실행한다.
- 공개는 Ready 한 건을 명시적으로 승인할 때만 실행한다.
- 레거시 `decisions/`와 `publish-ready/`는 검색 가능한 과거 이력으로만 유지한다.

## 관련 문서

- [[knowledge-lifecycle|AI-assisted PKM 지식 생명주기]]
- [[index|PKM System]]
- [[../../projects/index|Projects]]
- [[../../incidents/index|Incidents]]
