---
id: systems/home-server/duranno-qt-telegram
title: 두란노 QT 본문 Telegram 자동화
description: 두란노 생명의 삶 오늘 본문을 Asia/Seoul 기준으로 캡처하고 읽기 좋은 이미지 앨범으로 Telegram에 전달하는 서버 자동화.
status: active
updated: 2026-09-19
verified_at: 2026-09-19
aliases:
  - 두란노 QT 스크린샷 자동화
  - Duranno QT Telegram Bot
tags:
  - domain/automation
  - tech/nodejs
  - tech/playwright
  - tech/telegram
  - concern/operations
---

> [!summary]
> 홈서버의 사용자 systemd timer가 매일 07:00 Asia/Seoul에 두란노 QT 페이지의 실제 DOM을 읽고, 필요한 본문만 전용 템플릿으로 렌더링한 뒤 Telegram으로 보낸다. OpenClaw와 LLM을 사용하지 않는다.

## 현재 상태

- 운영 경로: `%h/utils/qt-bot`
- 실행 방식: Node.js, Playwright Chromium, Telegram Bot API, systemd user service와 timer
- 자동 실행: 매일 07:00 Asia/Seoul
- 누락 실행 대응: `Persistent=true`
- 최근 검증: 2026-09-19 본문 28절, 마지막 절 47절까지 2장 앨범 전송 성공
- 비밀값: `.env`에서만 주입하며 공개 저장소와 로그에 기록하지 않음

## 목적

두란노 `생명의 삶` 오늘의 QT 본문을 휴대폰에서 읽기 편한 이미지로 전달한다. 원본 웹페이지 전체를 그대로 캡처하지 않고, 실제 DOM에서 날짜, 본문 범위, QT 제목, 오늘의 찬송, 소제목과 절별 본문을 추출해 전용 화면으로 다시 렌더링한다.

## 동작 구조

```text
systemd timer
  → qt-bot.service
  → run.sh
  → capture.mjs
  → Duranno QT DOM 추출
  → 전용 HTML 렌더링과 Playwright PNG 캡처
  → Telegram sendPhoto 또는 sendMediaGroup
```

원본 Markdown이나 PKM을 런타임에 읽지 않으며, OpenClaw Gateway와도 연결하지 않는다.

## 입력과 추출 규칙

요청 URL은 다음 형식이며 날짜는 코드에서 명시적으로 `Asia/Seoul` 기준으로 계산한다.

```text
https://www.duranno.com/qt/view/bible.asp?qtDate=YYYY-MM-DD
```

페이지의 다음 DOM 영역을 읽는다.

- `.contents.right.last-div`: 오늘 QT 본문 컨테이너
- `.date > li`: 표시 날짜
- `h1 span`: 성경 본문 범위
- `h1 em`: QT 제목
- `.song.box`: 오늘의 찬송 제목과 가사
- `.bible > p.title`: 본문 소제목
- `.bible > table > tbody > tr`: 절 번호와 본문

추출한 본문 문자열은 요약하거나 수정하지 않는다. HTML escape 후 전용 템플릿에 그대로 넣는다.

## 렌더링과 페이지 분할

전용 렌더링 화면은 흰색 배경, 모바일 읽기에 적합한 폭, Pretendard와 Noto Sans KR 계열 fallback, 절 번호 전용 열, 넓은 본문 줄간격을 사용한다.

- 날짜와 본문 범위를 상단에 배치
- 오늘의 찬송을 옅은 회색 카드로 표시
- 소제목을 별도 섹션 heading으로 표시
- 절 번호와 본문을 grid로 분리
- 실제 렌더링 높이를 측정
- 페이지 높이가 기준을 넘으면 소제목 경계를 우선 분할
- 한 소제목이 너무 길 때만 절 경계에서 추가 분할
- 절 하나를 두 이미지 사이에서 나누지 않음

한 장이면 `sendPhoto`, 여러 장이면 첫 이미지에만 caption을 넣은 `sendMediaGroup`을 사용한다.

```text
out/qt-YYYY-MM-DD.png
out/qt-YYYY-MM-DD-01.png
out/qt-YYYY-MM-DD-02.png
```

## 검증과 실패 처리

페이지가 정상적인 오늘 본문인지 확인한 뒤에만 이미지를 만든다.

검증 항목:

- 본문 컨테이너가 정확히 하나인지
- 요청 날짜와 페이지 표시 날짜가 일치하는지
- 본문 범위와 QT 제목이 존재하는지
- 오늘의 찬송과 가사가 존재하는지
- 본문 소제목과 절이 존재하는지
- 마지막 절 번호가 본문 범위의 끝 절과 일치하는지
- PNG가 유효하고 이미지 크기가 정상인지

페이지 구조 변경, QT 미게시, 네트워크 오류, selector 불일치가 발생하면 2~3회 재시도 후 실패한다. 실패한 실행에서는 Telegram으로 전송하지 않는다.

## 환경변수와 보안

`.env`에만 아래 값을 둔다.

```dotenv
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

토큰과 Chat ID는 코드, Git, PKM 문서, 로그에 기록하지 않는다. `.env`는 `.gitignore`로 제외한다. 운영용 Telegram 봇은 QT 전송 목적만 갖는 별도 봇으로 분리한다.

## 배포와 운영

systemd user unit은 `%h`를 사용해 계정명을 하드코딩하지 않는다.

```ini
[Service]
WorkingDirectory=%h/utils/qt-bot
ExecStart=%h/utils/qt-bot/run.sh
```

timer는 다음 정책으로 동작한다.

```ini
[Timer]
OnCalendar=*-*-* 07:00:00 Asia/Seoul
Persistent=true
AccuracySec=1min
```

설치와 활성화:

```bash
mkdir -p ~/.config/systemd/user
cp systemd/qt-bot.service ~/.config/systemd/user/
cp systemd/qt-bot.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now qt-bot.timer
```

로그인하지 않은 상태에서도 실행해야 하면 user lingering을 별도로 활성화한다.

```bash
sudo loginctl enable-linger "$USER"
```

확인 명령:

```bash
systemctl --user status qt-bot.timer
systemctl --user list-timers qt-bot.timer
journalctl --user -u qt-bot.service -n 100 --no-pager
```

## 수동 실행과 재실행

전송 없이 캡처와 검증만 수행:

```bash
./run.sh --date=YYYY-MM-DD --no-send
```

운영 날짜로 실제 전송:

```bash
./run.sh
```

재실행은 임시 파일을 먼저 만든 뒤 Telegram 전송이 성공한 경우에만 최종 파일명으로 교체한다. 같은 날짜의 페이지 수가 바뀌면 이전 결과를 정리하고, 전송 실패 시 기존 결과를 유지한다. 14일보다 오래된 결과 이미지는 성공 후 삭제한다.

## 검증 결과

2026-09-19 서버 검증 결과:

- 실제 두란노 오늘 본문 페이지 접근 성공
- DOM 기반 전용 렌더링 성공
- 760px 폭 이미지 2장 생성
- 28절을 마지막 절 47까지 포함
- Telegram 앨범 전송 성공
- timer가 `enabled`와 `active` 상태
- 다음 실행 시각이 07:00 Asia/Seoul 정책과 일치

## 운영상 주의사항

- 두란노 페이지 DOM이 변경되면 추측해서 전송하지 않고 실패해야 한다.
- 캡처가 성공해도 Telegram 응답이 성공하기 전에는 운영 결과로 확정하지 않는다.
- `out/` 이미지는 임시 운영 산출물이며 장기 백업 저장소가 아니다.
- 실제 토큰, Chat ID, 개인 일정과 계정 정보는 공개 PKM에 기록하지 않는다.
- 이 자동화는 서버 systemd 기반이며 Coolify 애플리케이션 배포와는 별도다.

## 관련 문서

- [[index|홈서버 지식 지도]]
- [[../../monitoring/index|Monitoring]]
- [[../../playbooks/index|Playbooks]]
- [[../pkm/index|PKM System]]
