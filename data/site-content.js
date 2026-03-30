window.ASTROBRIEF_SITE = {
  meta: {
    eyebrow: "Daily Astrophysics Brief",
    title: "AstroBrief Today",
    subtitle:
      "사이트를 열 때마다 arXiv astro-ph recent 최상단 논문을 읽어와, 초록 요약과 단일 핵심 개념, 후속 연구 질문까지 한 페이지에 정리하는 데일리 브리핑입니다."
  },
  concept: {
    label: "Selected Concept",
    title: "검출기 네트워크 상관 분석",
    description:
      "이 논문의 핵심 개념은 고주파 중력파를 단일 장비 하나로 검출하려 하지 않고, 서로 멀리 떨어진 여러 검출기의 데이터를 함께 비교하는 상관 분석에 있습니다. 각 장비의 로컬 잡음은 대체로 서로 다르지만, 실제 우주 기원의 신호는 여러 지점에서 일관된 패턴으로 나타날 가능성이 더 큽니다. 따라서 검출기 네트워크를 구성하면 신호 대 잡음비를 높일 수 있고, 신호가 정말 천체물리학적 또는 우주론적 기원을 갖는지도 더 설득력 있게 판단할 수 있습니다. GravNet은 바로 이 발상을 고주파 중력파 영역에 적용한 개념 설계입니다."
  },
  workflow: [
    "사이트는 한국 시간 오전 9시 브리핑 규칙을 반영하기 위해, 열릴 때마다 `https://arxiv.org/list/astro-ph/recent`의 최상단 논문을 다시 조회합니다.",
    "브라우저가 arXiv 원본 응답을 직접 읽지 못하면 CORS 우회 프록시를 한 번 더 시도한 뒤, 그래도 실패하면 번들된 fallback 논문을 보여줍니다.",
    "요약, 핵심 개념, 연구 아이디어는 가져온 논문의 제목·카테고리·초록을 바탕으로 브라우저 안에서 즉시 다시 생성됩니다.",
    "`data/paper-latest.js`는 오프라인 또는 네트워크 실패 상황을 위한 fallback 데이터 역할을 합니다."
  ]
};





