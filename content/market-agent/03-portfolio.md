---
title: Portfolio
tags:
  - market
  - portfolio
  - yaml
aliases:
  - portfolio.yaml
---

# Portfolio

`portfolio.yaml`은 Market Agent가 매일 아침 브리프를 만들 때 참조하는
보유 자산, 벤치마크, watchlist, 해석 메모를 담는다.

실제 종목, 보유 수량, 평균단가와 참고 가격은 공개 PKM에 기록하지 않는다.
공개 문서에는 재사용할 수 있는 필드 구조와 관리 원칙만 남긴다.

## 예시 구조

```yaml
timezone: Asia/Seoul
report_time: "08:00"
base_currency: KRW

benchmarks:
  - SPY
  - QQQ
  - USDKRW

holdings:
  - symbol: "<PRIVATE>"
    label: "<PRIVATE>"
    market: KR
    asset_type: ETF
    qty: <PRIVATE>
    avg_cost: <PRIVATE>
    current_price_ref: <PRIVATE>
    priority: core
    thesis: "<PRIVATE>"

watchlist:
  - "<PRIVATE>"

notes:
  - "아침 브리프에서 확인할 시장·섹터·환율 관점을 기록한다."
```

## 관리 원칙

- 실제 `portfolio.yaml`은 Market Agent의 비공개 workspace에서 관리한다.
- 공개 PKM에는 실제 보유 종목, 수량, 평균단가와 참고 가격을 복사하지 않는다.
- 한국 상장 ETF는 미국 시장, 환율, 기초지수 흐름을 함께 본다.
- Market Agent는 실제 매매를 실행하지 않고, 보수적인 제안과 불확실성을 표시한다.
