---
title: Telegram
tags:
  - openclaw
  - market
  - telegram
  - bot
aliases:
  - market_bot
---

# Telegram

`market_bot`을 Telegram에 연결하고, OpenClaw 라우팅을 `market` agent로 설정한다.

## market_bot 생성

Telegram `@BotFather`에서 새 bot 생성:

```text
/newbot
```

## `openclaw.json`에 market Telegram account 추가

```bash
python3 - <<'PY'
import json
from pathlib import Path

p = Path.home() / ".openclaw" / "openclaw.json"
data = json.loads(p.read_text())

tg = data.setdefault("channels", {}).setdefault("telegram", {})
accounts = tg.setdefault("accounts", {})
accounts["market"] = {
    "botToken": "MARKET_BOT_TOKEN"
}

bindings = data.setdefault("bindings", [])

wanted = {
    "agentId": "market",
    "match": {
        "channel": "telegram",
        "accountId": "market"
    }
}

exists = any(
    b.get("agentId") == "market"
    and b.get("match", {}).get("channel") == "telegram"
    and b.get("match", {}).get("accountId") == "market"
    for b in bindings
)

if not exists:
    bindings.append(wanted)

p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print("patched:", p)
PY
```

## 문법 확인

```bash
python3 -m json.tool ~/.openclaw/openclaw.json >/dev/null && echo OK
```

## Gateway 재시작 및 binding 확인

```bash
export PATH="$HOME/.openclaw/bin:$PATH"
hash -r

systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
sleep 2
openclaw gateway probe
openclaw agents bindings
```

기대 routing:

```text
main <- telegram accountId=chief
calendar <- telegram accountId=calendar
market <- telegram accountId=market
```

## market_bot DM pairing

Telegram `market_bot`에 `/start` 또는 아무 메시지를 보낸다.

로그 보기:

```bash
openclaw logs --follow
```

로그에서 확인할 값:

- `pairing code`: `<PAIRING_CODE>`
- `chatId`: `<MARKET_REPORT_CHAT_ID>`

승인:

```bash
openclaw pairing approve telegram <PAIRING_CODE>
```

chat id 저장:

```bash
export MARKET_REPORT_CHAT_ID='<MARKET_REPORT_CHAT_ID>'
printf '\nMARKET_REPORT_CHAT_ID=%s\n' "$MARKET_REPORT_CHAT_ID" >> ~/.openclaw/.env
chmod 600 ~/.openclaw/.env
```

## 보안 메모

- `MARKET_BOT_TOKEN`은 평문 노트에 저장하지 않는다.
- `MARKET_REPORT_CHAT_ID`도 공개 저장소에는 올리지 않는다.
- pairing code는 일회성 값으로 다룬다.
