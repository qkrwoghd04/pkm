---
title: Google CLI
tags:
  - google-calendar
  - gog
  - oauth
  - linuxbrew
  - openclaw
created: 2026-04-24
source: calendar.md
---

# Google Calendar gog CLI 설정

## 목적

Zenbook 서버에서 `gog` CLI로 Google Calendar를 조회하고 일정을 생성할 수 있도록 설정한다.

## 1. Google Cloud에서 OAuth JSON 발급

Google Cloud Console에서 진행한다.

1. 프로젝트 생성
2. Calendar API 활성화
3. OAuth Consent Screen 설정
4. 앱 상태는 Testing
5. 테스트 사용자에 본인 Gmail 추가
6. OAuth Client 생성
   - 타입: Desktop app
7. JSON 다운로드

> OAuth JSON은 secret이므로 PKM에 원문을 붙여넣지 않는다.

## 2. OAuth JSON 파일 서버로 복사

Mac에서 서버로 업로드:

```bash
scp ~/Downloads/<파일명>.json [내 서버 사용자명]@[내 서버 로컬 IP 주소]:~
```

서버에서 확인:

```bash
ls -l ~ | grep json
chmod 600 ~/*.json
```

## 3. Homebrew 설치 Linux

`gog` 설치를 위해 Linuxbrew를 설치한다.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

셸 환경 반영:

```bash
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

확인:

```bash
brew --version
```

## 4. gog 설치

```bash
brew install steipete/tap/gogcli
gog --help
which gog
```

예상 경로:

```text
/home/linuxbrew/.linuxbrew/bin/gog
```

## 5. gog credentials 등록

```bash
gog auth credentials ~/YOUR_FILE.json
```

## 6. Google OAuth 진행

쓰기 권한 포함 Calendar 인증:

```bash
gog auth add [내 구글 계정] --services calendar --manual
```

진행 방식:

- 서버 터미널에 URL 출력
- 맥 브라우저에서 열기
- Google 로그인 및 동의
- 마지막 redirect URL 전체를 복사
- 서버 터미널에 붙여넣기

## 7. 테스트 사용자 누락 오류

오류 예시:

```text
403 access_denied
앱은 현재 테스트 중이며 개발자가 승인한 테스터만 앱에 액세스할 수 있습니다.
```

해결:

- Google Cloud Console → Audience
- 테스트 사용자 추가
- `[내 구글 계정]` 등록

## 8. 인증 상태 확인

```bash
gog auth status
gog auth list
```

## 9. gog keyring 비밀번호

`gog auth status` 또는 Calendar 명령 실행 시 아래 문구가 뜰 수 있다.

```text
Enter passphrase to unlock "/home/[내 서버 사용자명]/.config/gogcli/keyring":
```

이 비밀번호는 `gog keyring unlock passphrase`다.

CLI에서 반복 입력을 피하려면 현재 셸에 임시로 export한다.

```bash
export GOG_KEYRING_PASSWORD='[내 keyring 비밀번호]'
```

> 실제 keyring 비밀번호는 PKM에 평문으로 보관하지 않는다. 비밀번호 관리자에 저장한다.

## 10. Google Calendar 목록 확인

```bash
gog -a [내 구글 계정] calendar calendars --plain
```

실제 확인된 캘린더 예시:

```text
ID                                      NAME                            ROLE
[내 구글 계정]                           [내 기본 캘린더]                 owner
[가족 캘린더 ID]                         가족                            owner
```

## 11. Google Calendar 테스트 이벤트 생성

중요:

- `gog calendar create`에서 제목 필드는 `--title`이 아니라 `--summary`를 사용한다.

테스트용 예시:

```bash
CAL_ID='[내 기본 캘린더 ID]'

gog -a [내 구글 계정] calendar create "$CAL_ID" \
  --summary "테너 특순 연습" \
  --from 2026-04-12T13:00:00+09:00 \
  --to 2026-04-12T14:00:00+09:00 \
  --location "성가대실" \
  --description "5월 특순 연습"
```

추가 예시:

```bash
gog -a [내 구글 계정] calendar create "$CAL_ID" \
  --summary "테너 특순 연습" \
  --from 2026-04-19T20:00:00+09:00 \
  --to 2026-04-19T21:00:00+09:00 \
  --location "성가대실" \
  --description "5월 특순 연습"
```

## 관련 노트

- [[03-gateway]]
- [[05-integration]]
- [[06-runbook]]
