---
id: projects/oneq-partners/architecture
title: 원큐파트너스 프론트엔드 아키텍처
description: oneq-FE의 기술 스택, 6개 앱 경계, pnpm workspace와 초기 검증 체계를 설명한다.
project_id: oneq-partners
project_kind: work
status: active
updated: "2026-08-08"
verified_at: "2026-08-08"
aliases:
  - 원큐파트너스 프론트엔드 구조
  - oneq-FE architecture
  - projects/oneq-partners/architecture
tags:
  - concern/multi-channel
  - concern/monorepo
  - tech/pnpm
  - tech/react
  - tech/expo
  - tech/vite
---

> [!summary]
> oneq-FE는 여섯 개의 웹·모바일 앱을 하나의 pnpm workspace에서 관리하는 프론트엔드 모노레포다. 앱은 사용자 채널별로 독립 실행·빌드 경계를 유지하고, 루트는 의존성 설치와 정적 검증 명령을 통합한다.

## 목표와 현재 범위

초기 구조는 플랫폼, 공급업체, 영업 파트너, 운영사 채널을 하나의 저장소에서 관리하되 앱별 배포 단위를 분리하는 데 초점을 둔다.

- 플랫폼과 공급업체는 각각 웹과 Expo 앱을 제공한다.
- 영업 파트너와 운영사는 웹 앱을 제공한다.
- 공통 패키지를 둘 위치는 마련하되 실제 재사용 요구가 생기기 전까지 빈 상태로 둔다.
- 현재 코드, 패키지 manifest와 검증 결과가 이 문서보다 우선한다.

## 1차 모노레포 구조

```text
oneq-FE/
├── apps/
│   ├── platform-web/
│   ├── platform-app/
│   ├── provider-web/
│   ├── provider-app/
│   ├── partner-web/
│   └── admin-web/
├── packages/
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

`apps/*`는 독립 실행 가능한 제품 앱이고 `packages/*`는 이후 공통 UI, 설정, 타입 또는 도메인 모듈이 실제로 필요해질 때 사용한다. lockfile은 루트의 `pnpm-lock.yaml` 하나만 유지한다.

## 앱별 기술 스택

| 패키지 | 1차 기술 스택 | 역할 |
| --- | --- | --- |
| `@oneq/platform-web` | TanStack Start, TanStack Router, React 19, Vite 8, TypeScript | 플랫폼 웹 |
| `@oneq/platform-app` | Expo SDK 57, React Native 0.86, React 19, TypeScript | 플랫폼 앱 |
| `@oneq/provider-web` | TanStack Start, TanStack Router, React 19, Vite 8, TypeScript | 공급업체 웹 |
| `@oneq/provider-app` | Expo SDK 57, React Native 0.86, React 19, TypeScript | 공급업체 앱 |
| `@oneq/partner-web` | React 19, Vite 8, TypeScript | 영업 파트너 웹 |
| `@oneq/admin-web` | React 19, Vite 8, TypeScript | 운영사 웹 |

플랫폼·공급업체 웹은 TanStack Start 기반으로 시작하고, 파트너·운영사 웹은 React·Vite SPA로 시작한다. 모바일 앱은 Expo SDK와 호환되는 React·React Native 버전을 각 앱에서 명시한다. 웹 앱과 Expo 앱의 React 버전을 루트 override로 강제 통일하지 않는다.

## Workspace와 패키지 규칙

- 패키지 관리자는 pnpm 11을 사용한다.
- workspace 범위는 `apps/*`와 `packages/*`다.
- 패키지 이름은 `@oneq/<channel>-<platform>` 형식을 사용한다.
- 의존성 설치는 모노레포 루트에서 실행한다.
- 앱 내부에 별도 `pnpm-lock.yaml`이나 독립 pnpm store를 두지 않는다.
- 공통 lint 도구인 Oxlint는 루트에서 관리하고 각 앱은 같은 `lint` 명령 이름을 노출한다.

## 공통 명령 계약

모든 앱은 구현 기술이 달라도 가능한 한 같은 스크립트 이름을 사용한다.

| 명령 | 적용 대상 | 의미 |
| --- | --- | --- |
| `dev` | 6개 앱 | 앱별 개발 서버 또는 Expo 개발 서버 실행 |
| `typecheck` | 6개 앱 | TypeScript 정적 검사 |
| `lint` | 6개 앱 | 루트 Oxlint 설정으로 검사 |
| `build` | 웹 앱 4개 | 프로덕션 웹 빌드 |

Expo 앱의 스토어 배포는 로컬 `build` 스크립트로 추상화하지 않고 이후 EAS 구성에서 다룬다.

루트의 `pnpm check`는 다음 검증을 순서대로 실행한다.

1. 6개 앱 TypeScript 검사
2. 6개 앱 Oxlint 검사
3. 4개 웹 앱 프로덕션 빌드

## 현재 선택과 유보 사항

- 초기 단계에서는 Turbo나 Nx를 도입하지 않는다. pnpm recursive command로 현재 규모의 실행과 검증을 처리한다.
- `packages/`는 확장 지점일 뿐, 선제적인 공통 추상화를 만들지 않는다.
- Expo 앱의 EAS 빌드·스토어 배포 설정은 후속 작업으로 둔다.
- 앱별 프레임워크 선택은 현재 채널 경계의 출발점이며, 상세 기능과 배포 요구가 확정되면 저장소 구현과 함께 갱신한다.

## 관련 문서

- [[index|원큐파트너스]]
- [[troubleshooting|트러블슈팅 기록]]
- [[career-notes|경력 정리 노트]]
