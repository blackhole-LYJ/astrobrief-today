window.ASTROBRIEF_SITE = {
  meta: {
    eyebrow: "Daily Astrophysics Brief",
    title: "AstroBrief Today",
    subtitle:
      "매일 한국 시간 오전 9시에 고정 생성한 arXiv astro-ph 브리핑 스냅샷을 보여주며, 논문 요약과 단일 핵심 개념, 후속 연구 질문을 한 페이지에 정리합니다."
  },
  concept: {
    label: "Selected Concept",
    title: "관측량과 모형을 연결하는 해석 프레임",
    description:
      "핵심 개념 섹션은 그날 브리핑 논문의 제목과 초록을 바탕으로 가장 중요한 개념 하나만 골라 짧게 풀어줍니다. 개별 논문에 맞는 개념이 생성되지 않았을 때는, 관측량이 어떤 물리 모형과 연결되는지를 먼저 읽어내는 해석 프레임을 기본값으로 사용합니다."
  },
  workflow: [
    "GitHub Actions가 매일 한국 시간 오전 9시에 해당하는 UTC 00:00에 `https://arxiv.org/list/astro-ph/recent` 최상단 논문을 읽어 `data/paper-latest.js`를 갱신합니다.",
    "사이트는 접속할 때 실시간으로 arXiv를 다시 조회하지 않고, 저장소에 기록된 그날의 스냅샷을 하루 종일 동일하게 보여줍니다.",
    "오전 9시 이전에는 전날 스냅샷이 보이고, 오전 9시 갱신이 끝나면 그날 논문 스냅샷으로 교체됩니다.",
    "필요하면 GitHub Actions의 수동 실행이나 `scripts/update-briefing.ps1` 실행으로 스냅샷을 즉시 다시 생성할 수 있습니다."
  ]
};
