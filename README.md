# AstroBrief Today

개인용 데일리 천체물리학 브리핑 사이트입니다. 참고 사이트의 흐름을 가져오되, 구조는 아래 3단계에 맞춰 다시 구성했습니다.

1. 오늘의 논문: 한국 시간 오전 9시에 `https://arxiv.org/list/astro-ph/recent`를 열었을 때 최상단 논문 1편
2. 핵심 개념 짚기: 논문에서 뽑은 단일 핵심 개념 1개
3. 연구 아이디어: 이 논문에서 바로 파생할 수 있는 후속 질문

## 파일 구조

- `index.html`: 메인 페이지
- `assets/styles.css`: 전체 비주얼 스타일
- `assets/app.js`: 렌더링 및 인터랙션
- `data/site-content.js`: 고정 소개 문구, fallback 개념 설명, 운영 메모
- `data/paper-latest.js`: 오늘의 논문 데이터
- `scripts/update-briefing.ps1`: 최신 arXiv 메타데이터로 브리핑 데이터를 갱신하는 스크립트

## 바로 보기

`index.html`을 브라우저에서 바로 열면 됩니다. 사이트는 브라우저에서 열릴 때마다 `astro-ph/recent` 최상단 논문을 다시 읽어오므로, 한국 시간 오전 9시 이후 접속하면 그날 브리핑 논문이 자동으로 반영됩니다.

## 최신 arXiv 반영

기본 동작은 실시간 조회입니다. 인터넷이 연결된 상태에서 사이트를 열면, 브라우저가 `astro-ph/recent` 최상단 논문을 다시 가져와 화면을 갱신합니다.

브라우저에서 원본 arXiv 응답을 직접 읽지 못할 경우를 대비해 CORS 우회 프록시를 한 번 더 시도하고, 그것도 실패하면 `data/paper-latest.js`에 들어 있는 fallback 논문을 보여줍니다.

## 선택적 수동 갱신

오프라인 fallback 데이터를 직접 최신 상태로 바꾸고 싶다면 PowerShell에서 아래 명령을 실행할 수 있습니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\update-briefing.ps1
```

스크립트는 `astro-ph/recent` 페이지를 읽고 최상단 논문의 arXiv ID를 추출한 뒤, 그 논문의 메타데이터를 가져와 `data/paper-latest.js`를 덮어씁니다. 즉, fallback 데이터도 같은 기준인 "한국 시간 오전 9시에 recent 페이지 최상단"을 따릅니다.




