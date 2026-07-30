---
title: Quartz Explorer sortFn 런타임 장애
description: Quartz Explorer의 커스텀 sortFn 직렬화로 사이드바가 비는 증상의 원인, 해결, 안전한 작성 규칙.
status: resolved
updated: 2026-07-30
aliases:
  - Quartz Explorer sortFn 이슈
  - Quartz Explorer __name error
  - Quartz Explorer sidebar blank issue
  - quartz/troubleshooting/00-sortfn-runtime-issue
tags:
  - incident/quartz
  - quartz
  - explorer
  - typescript
  - pkm
  - debugging
created: 2026-04-25
---

## 문제 요약

Quartz의 Explorer 사이드바에서 `sortFn`을 커스텀할 때,
정렬 로직 자체는 맞아도 사이드바가 비어 보이는 문제가 생길 수 있다.

대표 증상:

```text
Explorer 제목만 보이고 파일/폴더 목록이 보이지 않음
```

브라우저 콘솔에는 이런 에러가 뜰 수 있다.

```text
Uncaught (in promise) ReferenceError: __name is not defined
```

또는 helper 함수를 외부에 뒀을 경우 이런 에러가 날 수 있다.

```text
ReferenceError: getLeadingNumber is not defined
```

이 문제는 보통 **정렬 알고리즘 자체의 문제라기보다, Quartz Explorer가 `sortFn`을 브라우저에서 다시 실행하는 방식과 빌드 도구의 함수 변환 방식이 충돌해서 생긴다.**

---

## 배경

Quartz Explorer는 `sortFn`, `filterFn`, `mapFn` 같은 함수를 옵션으로 받을 수 있다.

예시:

```ts
Component.Explorer({
  sortFn: explorerSort,
})
```

하지만 이 함수들은 서버/빌드 시점에서 일반적인 함수 참조로 끝까지 유지되는 것이 아니라, Explorer 클라이언트 스크립트 쪽에서 문자열화된 함수를 다시 복원해서 실행한다.

Quartz의 Explorer 클라이언트 스크립트는 대략 다음 흐름을 가진다.

```ts
sortFn: new Function("return " + (dataFns.sortFn || "undefined"))()
```

그리고 복원된 함수는 Explorer의 파일 트리를 정렬할 때 사용된다.

```ts
trie.sort(opts.sortFn)
```

즉, `sortFn`은 최종적으로 브라우저 런타임에서 독립적으로 다시 실행된다.

---

## 왜 문제가 생기는가

### 1. 외부 helper 함수는 같이 전달되지 않는다

예를 들어 이렇게 작성하면 문제가 생길 수 있다.

```ts
function getLeadingNumber(node: ExplorerSortNode): number {
  // ...
}

export function explorerSort(a: ExplorerSortNode, b: ExplorerSortNode): number {
  const aOrder = getLeadingNumber(a)
  const bOrder = getLeadingNumber(b)

  return aOrder - bOrder
}
```

개발자가 보기에는 `getLeadingNumber`가 같은 파일 안에 있으므로 정상적으로 보인다.

하지만 Quartz Explorer가 브라우저에서 실행할 때는 `explorerSort` 함수만 문자열로 복원될 수 있다. 이 경우 브라우저에는 `getLeadingNumber` 정의가 없다.

결과:

```text
ReferenceError: getLeadingNumber is not defined
```

---

### 2. 내부 arrow helper도 빌드 도구에 의해 변환될 수 있다

다음처럼 helper를 `sortFn` 내부에 넣어도 문제가 생길 수 있다.

```ts
export const explorerSort = (a, b) => {
  const getLeadingNumber = (node) => {
    // ...
  }

  const aOrder = getLeadingNumber(a)
  const bOrder = getLeadingNumber(b)

  return aOrder - bOrder
}
```

빌드 도구가 함수 이름 보존을 위해 내부적으로 `__name` 같은 helper를 삽입할 수 있다.

변환 후의 형태는 대략 이런 식이 될 수 있다.

```js
const getLeadingNumber = __name((node) => {
  // ...
}, "getLeadingNumber")
```

그런데 Quartz가 `sortFn` 문자열만 브라우저에서 다시 실행하면, 그 런타임에는 `__name` helper가 존재하지 않는다.

결과:

```text
ReferenceError: __name is not defined
```

---

## 안전한 작성 규칙

Quartz Explorer의 `sortFn`은 다음 원칙으로 작성하는 것이 안전하다.

```text
외부 helper 함수 참조 금지
내부 arrow helper 함수 금지
sortFn 본문 안에서 직접 계산
항상 number 반환
```

즉, `sortFn`은 **self-contained function**이어야 한다.

좋은 패턴:

```ts
export function explorerSort(a, b): number {
  // 모든 계산을 이 함수 안에서 직접 수행
  // 외부 함수, 외부 상수, 내부 arrow helper에 의존하지 않음
  return 0
}
```

피해야 할 패턴:

```ts
const PREFIX_REGEX = /^(\d+)[-_]/

function getOrder(node) {
  // ...
}

export function explorerSort(a, b): number {
  return getOrder(a) - getOrder(b)
}
```

---

## 적용한 해결 코드

`quartz/util/sort.ts`:

```ts
import type { Options } from "../components/Explorer"

type ExplorerSortFn = NonNullable<Options["sortFn"]>
type ExplorerSortNode = Parameters<ExplorerSortFn>[0]

export function explorerSort(a: ExplorerSortNode, b: ExplorerSortNode): number {
  if (a.isFolder && !b.isFolder) return -1
  if (!a.isFolder && b.isFolder) return 1

  const aSource = a.slug ?? a.data?.slug ?? a.displayName ?? ""
  const bSource = b.slug ?? b.data?.slug ?? b.displayName ?? ""

  const aNormalized = aSource.replace(/\/index$/, "")
  const bNormalized = bSource.replace(/\/index$/, "")

  const aFilename = aNormalized.split("/").pop() ?? aNormalized
  const bFilename = bNormalized.split("/").pop() ?? bNormalized

  const aMatch = aFilename.match(/^(\d+)[-_]/)
  const bMatch = bFilename.match(/^(\d+)[-_]/)

  const aOrder = aMatch ? Number.parseInt(aMatch[1], 10) : Number.POSITIVE_INFINITY
  const bOrder = bMatch ? Number.parseInt(bMatch[1], 10) : Number.POSITIVE_INFINITY

  if (aOrder !== bOrder) {
    return aOrder - bOrder
  }

  return a.displayName.localeCompare(b.displayName, undefined, {
    numeric: true,
    sensitivity: "base",
  })
}
```

핵심은 다음과 같다.

```text
1. 외부 helper 함수 없음
2. 내부 arrow helper 함수 없음
3. 정렬에 필요한 모든 계산을 explorerSort 본문에서 직접 수행
4. 모든 분기에서 number 반환
```

---

## layout 적용

`quartz.layout.ts`에서 Explorer를 쓰는 모든 layout에 같은 옵션을 적용한다.

```ts
import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { explorerSort } from "./quartz/util/sort"

const explorerOptions = {
  sortFn: explorerSort,
  folderDefaultState: "open" as const,
  folderClickBehavior: "collapse" as const,
  useSavedState: false,
}
```

개별 문서 페이지:

```ts
Component.Explorer(explorerOptions)
```

리스트 페이지:

```ts
Component.Explorer(explorerOptions)
```

`defaultContentPageLayout`와 `defaultListPageLayout` 양쪽 모두에 적용해야 한다.

---

## 동작 방식

예시 파일 구조:

```text
content/calendar-agent/
├─ index.md
├─ 01-server.md
├─ 02-network.md
├─ 03-gateway.md
├─ 04-google-calendar.md
├─ 05-integration.md
└─ 06-runbook.md
```

각 파일에서 계산되는 값:

| 파일                    | slug/source                         | filename             | order |
| ----------------------- | ----------------------------------- | -------------------- | ----- |
| `01-server.md`          | `calendar-agent/01-server`          | `01-server`          | `1`   |
| `02-network.md`         | `calendar-agent/02-network`         | `02-network`         | `2`   |
| `03-gateway.md`         | `calendar-agent/03-gateway`         | `03-gateway`         | `3`   |
| `04-google-calendar.md` | `calendar-agent/04-google-calendar` | `04-google-calendar` | `4`   |
| `05-integration.md`     | `calendar-agent/05-integration`     | `05-integration`     | `5`   |
| `06-runbook.md`         | `calendar-agent/06-runbook`         | `06-runbook`         | `6`   |

정렬 결과:

```text
01-server
02-network
03-gateway
04-google-calendar
05-integration
06-runbook
```

화면 표시명은 frontmatter의 `title`을 사용할 수 있다.

```md
---
title: Server
---
```

즉, 파일명은 정렬용으로 `01-server.md`를 쓰고, 사이드바 표시명은 `Server`처럼 짧게 유지할 수 있다.

---

## 디버깅 체크리스트

### 1. 브라우저 콘솔 확인

Explorer가 비어 있으면 먼저 DevTools Console을 본다.

가능한 에러:

```text
ReferenceError: __name is not defined
ReferenceError: getLeadingNumber is not defined
```

### 2. `data-fns`에 위험한 문자열이 있는지 확인

렌더된 HTML에서 Explorer의 `data-fns` 내용을 확인한다.

문제가 있는 문자열:

```text
__name
getLeadingNumber
외부 helper 함수명
```

`sortFn` 문자열 안에 이런 값이 있으면 브라우저 런타임에서 깨질 가능성이 높다.

### 3. localStorage 초기화

Quartz Explorer는 기본적으로 접힘/펼침 상태를 localStorage의 `fileTree`에 저장한다.

정렬/표시 테스트 중에는 다음 옵션을 둔다.

```ts
useSavedState: false
```

또는 브라우저에서 직접 삭제한다.

```text
DevTools → Application → Local Storage → 현재 사이트 → fileTree 삭제
```

### 4. 개발 서버 재시작

수정 후 개발 서버를 재시작한다.

```bash
npx quartz build --serve
```

---

## 최종 원칙

Quartz Explorer의 커스텀 `sortFn`은 일반적인 앱 코드처럼 작성하면 안 된다.

이 함수는 브라우저에서 문자열로 복원되어 다시 실행될 수 있으므로, 다음 조건을 만족해야 한다.

```text
독립적으로 실행 가능해야 함
외부 스코프에 의존하지 않아야 함
빌드 도구가 삽입하는 helper에 의존하지 않아야 함
항상 number를 반환해야 함
```

따라서 Explorer 정렬 함수는 가능한 한 단순하고 self-contained하게 작성하는 것이 좋다.

---

## 참고

- [Quartz Explorer 공식 문서](https://quartz.jzhao.xyz/features/explorer)
- [Quartz Explorer client script](https://raw.githubusercontent.com/jackyzha0/quartz/v4/quartz/components/scripts/explorer.inline.ts)
- [Quartz FileTrieNode implementation](https://raw.githubusercontent.com/jackyzha0/quartz/v4/quartz/util/fileTrie.ts)
