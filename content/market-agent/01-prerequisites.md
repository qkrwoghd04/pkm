---
title: Prerequisites
tags:
  - openclaw
  - market
  - setup
  - tavily
  - alpha-vantage
aliases:
  - Market Agent Prerequisites
---

# Prerequisites

Market Agent를 구성하기 전에 OpenClaw CLI, Gateway, 검색 provider, Alpha Vantage API key를 점검한다.

## OpenClaw PATH 잡기

세션마다 `openclaw: command not found`가 뜰 수 있으므로 먼저 PATH를 잡는다.

```bash
export PATH="$HOME/.openclaw/bin:$PATH"
hash -r
```

영구 적용:

```bash
echo 'export PATH="$HOME/.openclaw/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

## Gateway 상태 확인

```bash
openclaw --version
openclaw gateway status
openclaw gateway probe
```

## 웹 검색 provider 설정: Tavily

OpenClaw web section 설정:

```bash
openclaw configure --section web
```

진행 시 선택:

- Gateway: `Local (this machine)`
- Native Codex web search: `No`
- Search provider: `Tavily`
- `web_fetch`: `Yes`

이 단계가 끝나면 `market-research`에서 `web_search`를 사용할 수 있다.

## Alpha Vantage API 키 설정

### API 키 발급

브라우저에서 Alpha Vantage 공식 사이트에서 API key를 발급한다.

### `.env`에 키 추가

터미널 이슈(`xterm-ghostty`)가 있으면 먼저:

```bash
export TERM=xterm-256color
```

그 다음 키 추가:

```bash
grep -q '^ALPHAVANTAGE_API_KEY=' ~/.openclaw/.env \
  && sed -i 's/^ALPHAVANTAGE_API_KEY=.*/ALPHAVANTAGE_API_KEY=YOUR_REAL_KEY/' ~/.openclaw/.env \
  || printf '\nALPHAVANTAGE_API_KEY=YOUR_REAL_KEY\n' >> ~/.openclaw/.env

chmod 600 ~/.openclaw/.env
```

현재 셸에도 반영:

```bash
set -a
source ~/.openclaw/.env
set +a
echo "$ALPHAVANTAGE_API_KEY"
```

Gateway 재시작:

```bash
systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
openclaw gateway probe
```

## Alpha Vantage 키 테스트

```bash
python3 - <<'PY'
import os, json, urllib.parse, urllib.request

key = os.environ.get("ALPHAVANTAGE_API_KEY")
url = "https://www.alphavantage.co/query?" + urllib.parse.urlencode({
    "function": "GLOBAL_QUOTE",
    "symbol": "AAPL",
    "apikey": key,
})

with urllib.request.urlopen(url, timeout=30) as r:
    data = json.loads(r.read().decode("utf-8"))

print(json.dumps(data, ensure_ascii=False, indent=2)[:1200])
PY
```
