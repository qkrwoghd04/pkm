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

`portfolio.yaml`은 Market Agent가 매일 아침 브리프를 만들 때 참조하는 보유 자산, 벤치마크, watchlist, 해석 메모를 담는다.

## 실제 보유 종목 기준

- `381180` TIGER 미국필라델피아반도체
- `360750` TIGER 미국S&P500
- `423160` KODEX KOFR 금리액티브
- `458730` TIGER 미국배당다우존스

## 작성 명령

```bash
cat > ~/.openclaw/workspace-market/portfolio.yaml <<'EOF'
timezone: Asia/Seoul
report_time: "08:00"
base_currency: KRW

benchmarks:
  - SPY
  - QQQ
  - USDKRW

holdings:
  - symbol: "381180"
    label: "TIGER 미국필라델피아반도체"
    market: KR
    asset_type: ETF
    qty: 15
    avg_cost: 30125
    current_price_ref: 33680
    priority: core
    thesis: "미국 반도체 업황과 AI 인프라 사이클에 민감"

  - symbol: "360750"
    label: "TIGER 미국S&P500"
    market: KR
    asset_type: ETF
    qty: 53
    avg_cost: 24543
    current_price_ref: 25105
    priority: core
    thesis: "미국 대형주 장기 적립 핵심 자산"

  - symbol: "423160"
    label: "KODEX KOFR 금리액티브"
    market: KR
    asset_type: ETF
    qty: 3
    avg_cost: 110770
    current_price_ref: 110735
    priority: defensive
    thesis: "현금성 및 단기 금리 방어 포지션"

  - symbol: "458730"
    label: "TIGER 미국배당다우존스"
    market: KR
    asset_type: ETF
    qty: 14
    avg_cost: 14603
    current_price_ref: 14565
    priority: income
    thesis: "미국 배당/퀄리티 성격의 현금흐름형 자산"

watchlist:
  - NVDA
  - AAPL
  - MSFT

notes:
  - "한국 상장 ETF이지만 미국 시장/환율 영향이 큼"
  - "아침 브리프에서는 미국 증시, 반도체 섹터, 배당주 흐름, USD/KRW를 우선 점검"
  - "실제 ETF 현재가와 기초자산 뉴스/거시를 함께 해석"
EOF
```

확인:

```bash
cat ~/.openclaw/workspace-market/portfolio.yaml
```

## 관리 메모

- 보유 수량, 평균단가, 참고 현재가는 주기적으로 업데이트한다.
- 한국 상장 ETF는 미국 시장, 환율, 기초지수 흐름을 함께 봐야 한다.
- Market Agent는 실제 매매를 실행하지 않고, 보수적인 제안과 불확실성을 표시해야 한다.
