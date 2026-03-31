# AstroBrief Today

개인용 데일리 천체물리학 브리핑 사이트입니다. 브리핑 구조는 아래 3단계로 구성되어 있습니다.

1. 오늘의 논문: 한국 시간 오전 9시에 `https://arxiv.org/list/astro-ph/recent`를 열었을 때 최상단 논문 1편
2. 핵심 개념 짚기: 논문에서 뽑은 단일 핵심 개념 1개
3. 연구 아이디어: 이 논문에서 바로 파생할 수 있는 후속 질문

사이트 주소: [https://blackhole-lyj.github.io/astrobrief-today/](https://blackhole-lyj.github.io/astrobrief-today/)

## 파일 구조

- `index.html`: 메인 페이지
- `assets/styles.css`: 전체 비주얼 스타일
- `assets/app.js`: 저장된 스냅샷 데이터를 렌더링하는 프런트엔드 로직
- `data/site-content.js`: 고정 소개 문구와 운영 메모
- `data/paper-latest.js`: 현재 공개 중인 일간 스냅샷 데이터
- `scripts/update-briefing.ps1`: `astro-ph/recent` 최상단 논문을 읽어 스냅샷 데이터를 생성하는 스크립트
- `.github/workflows/update-briefing.yml`: 매일 오전 9시 KST 스냅샷 갱신 워크플로

## 현재 동작 방식

이 사이트는 브라우저에서 열릴 때마다 실시간으로 arXiv를 다시 조회하지 않습니다. 대신 저장소에 들어 있는 `data/paper-latest.js`를 그대로 렌더링하므로, 같은 날에는 누구나 같은 논문 브리핑을 보게 됩니다.

## 오전 9시 고정 스냅샷

GitHub Actions가 매일 UTC 00:00에 실행되어 `astro-ph/recent` 최상단 논문을 읽고 `data/paper-latest.js`를 갱신합니다. 한국 시간으로는 오전 9시이므로, 오전 9시 이후에는 그날의 브리핑이 사이트 전체에 고정됩니다.

즉, 2026년 3월 31일 오전 10시에 접속한 사람과 오후 5시에 접속한 사람은 동일한 스냅샷을 보게 됩니다. 오전 9시 이전에는 전날 스냅샷이 유지됩니다.

참고로 GitHub 공식 문서에 따르면 scheduled workflow는 GitHub Actions 부하가 높은 시간대에 약간 지연될 수 있습니다. 그래서 실제 반영이 몇 분 늦어질 가능성은 있습니다.

## 수동 갱신

워크플로와 별개로 로컬에서 스냅샷을 즉시 다시 만들고 싶다면 PowerShell에서 아래 명령을 실행하면 됩니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\update-briefing.ps1
```

스크립트는 `astro-ph/recent` 페이지에서 최상단 arXiv ID를 추출하고, 해당 논문의 메타데이터를 가져와 `data/paper-latest.js`를 덮어씁니다.
