---
id: projects/oneq-partners/decision-expo-organization-ownership
title: Expo Organization 소유권과 인수인계
description: 고객사 전용 Expo Organization을 먼저 생성해 앱을 구축하고, 이후 고객사 소유권과 운영 권한으로 전환하는 기준을 정리한다.
project_id: oneq-partners
project_kind: work
status: active
updated: 2026-08-21
tags:
  - tech/expo
  - concern/ownership
  - concern/operations
  - concern/decision-making
---

> [!summary]
> 고객사 담당자가 Expo Organization을 직접 만들기 어려운 상황을 고려해, 우리 팀이 고객 전용 Organization을 먼저 생성하고 초기 구축을 진행한다. 이후 고객 담당자를 Owner로 초대해 소유권과 결제 주체를 고객사 기준으로 전환한다.

## 결정

- 공용 Organization이나 개인 계정이 아니라 고객 전용 Organization을 사용한다.
- `platform-app`, `provider-app`은 그 Organization에 연결한다.
- 고객 담당자를 나중에 `Owner`로 초대하고, 우리 팀은 필요한 개발 권한만 유지한다.
- 기존 EAS 프로젝트가 있다면 `projectId`를 유지하고 재생성하지 않는다.

## 실행 순서

### 1. Organization 생성

우리 팀 담당자의 Expo 대시보드에서 **Create Organization**을 선택해 고객사 이름과 최종 slug를 정한다. 공용 개발 Organization이나 Personal account를 사용하지 않는다.

### 2. 앱 연결

각 앱 설정에 Organization slug를 지정한다.

```json
{
  "expo": {
    "owner": "<organization-slug>"
  }
}
```

EAS 프로젝트가 없는 앱에만 초기화한다.

```bash
npx eas-cli@latest account:login
npx eas-cli@latest project:init
npx eas-cli@latest project:info
```

이미 연결된 앱은 `project:init`을 다시 실행하지 말고 기존 `extra.eas.projectId`와 `owner`를 확인한다.

### 3. 개발자 초대와 빌드

Organization의 **Settings → Members**에서 우리 팀을 `Developer`로 초대한다. 결제나 멤버 관리가 필요할 때만 `Admin`을 사용한다.

```bash
npx eas-cli@latest build:configure
npx eas-cli@latest build --profile development --platform all
npx eas-cli@latest build --profile preview --platform all
```

푸시·딥링크·네이티브 모듈은 Expo Go가 아닌 Development Build에서 확인한다.

### 4. 고객사 인수인계

고객 담당자가 Expo account를 만들면 다음만 진행한다.

1. 고객 담당자를 Organization `Owner`로 초대한다.
2. 고객사가 결제 정보와 소유권을 확인한다.
3. 두 앱의 빌드·업데이트·푸시 알림을 고객 Owner가 확인한다.
4. 우리 팀은 `Developer`로 남기고 임시 Owner와 불필요한 멤버를 제거한다.

이 방식은 Organization을 새로 옮기지 않으므로 EAS project ID와 업데이트 연결을 유지한다.

## 이전이 필요한 경우

이미 우리 팀의 다른 Organization에서 시작했다면 고객사 Organization을 만든 뒤 **Project settings → General → Transfer project**를 사용한다. 이전 실행자는 양쪽 Organization에서 Owner 또는 Admin이어야 한다. 고객사 권한을 받을 수 없으면 escrow Organization을 중간 단계로 사용할 수 있다.

## 주의

- Expo Organization과 Apple Developer·Google Play 앱은 별도 자산이다. Organization Owner 변경만으로 스토어 소유권은 바뀌지 않는다.
- 인증서, keystore, API key, EAS secret은 이 문서에 기록하지 않는다.

## 미결 사항

- 고객 담당자 계정을 만들 시점
- 소유권·결제 전환 시점과 정확한 인수인계 범위
- 최종 Organization slug
- 스토어 자산의 초기 계정 소유자

## 참고 자료

- [Expo account types](https://docs.expo.dev/accounts/account-types/)
- [Expo app transfers](https://docs.expo.dev/distribution/app-transfers/)
- [EAS CLI reference](https://docs.expo.dev/eas/cli/)

## 관련 문서

- [[index|원큐파트너스 프로젝트 개요]]
- [[architecture|프론트엔드 아키텍처]]
- [[discussions/2026-08-21|2026-08-21 구두 논의 기록]]
