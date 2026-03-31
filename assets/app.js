(function () {
  const site = window.ASTROBRIEF_SITE;
  const snapshotPaper = window.ASTROBRIEF_PAPER;

  if (!site || !snapshotPaper) {
    throw new Error("AstroBrief data files are missing.");
  }

  const $ = (selector) => document.querySelector(selector);

  const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short"
  });

  const kstDateFormatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const state = {
    paper: snapshotPaper
  };

  function renderList(element, items) {
    element.innerHTML = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      element.appendChild(li);
    });
  }

  function getKstDateKey(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;
    return `${year}-${month}-${day}`;
  }

  function getActiveConcept() {
    return state.paper.concept || site.concept;
  }

  function getHeroStatusLabel() {
    const snapshotDateKst = state.paper.snapshotDateKst;
    const todayKst = getKstDateKey(new Date());

    if (snapshotDateKst && snapshotDateKst === todayKst) {
      return "오늘 오전 9시 KST 스냅샷 표시 중";
    }

    return "마지막 생성 스냅샷 표시 중";
  }

  function getSnapshotChipLabel() {
    const paper = state.paper;

    if (paper.snapshotLabel) {
      return paper.snapshotLabel;
    }

    if (paper.snapshotDateKst) {
      const [year, month, day] = paper.snapshotDateKst.split("-");
      return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일 오전 9시 KST 스냅샷`;
    }

    if (paper.publishedAt) {
      return `${kstDateFormatter.format(new Date(paper.publishedAt))} 기준 스냅샷`;
    }

    return "한국 시간 오전 9시 스냅샷";
  }

  function renderStats() {
    const paper = state.paper;
    const stats = [
      {
        label: "데이터 상태",
        value: "고정 일간 스냅샷"
      },
      {
        label: "스냅샷 기준",
        value: getSnapshotChipLabel()
      },
      {
        label: "실제 생성 시각",
        value: paper.generatedAt ? dateTimeFormatter.format(new Date(paper.generatedAt)) : "수동 편집"
      },
      {
        label: "대표 카테고리",
        value: (paper.categories || [])[0] || "astro-ph"
      },
      {
        label: "핵심 포커스",
        value: paper.focus || "최신 천체물리학 질문 정리"
      }
    ];

    const grid = $("#stats-grid");
    grid.innerHTML = "";

    stats.forEach((stat) => {
      const card = document.createElement("article");
      card.className = "stat-card";

      const label = document.createElement("p");
      label.className = "stat-label";
      label.textContent = stat.label;

      const value = document.createElement("p");
      value.className = "stat-value";
      value.textContent = stat.value;

      card.append(label, value);
      grid.appendChild(card);
    });
  }

  function renderIdeas() {
    const grid = $("#ideas-grid");
    grid.innerHTML = "";

    (state.paper.researchIdeas || []).forEach((idea) => {
      const card = document.createElement("article");
      card.className = "idea-card";

      const kicker = document.createElement("span");
      kicker.className = "idea-kicker";
      kicker.textContent = idea.kicker;

      const title = document.createElement("h3");
      title.textContent = idea.title;

      const text = document.createElement("p");
      text.className = "idea-text";
      text.textContent = idea.description;

      const next = document.createElement("p");
      next.className = "idea-text";
      next.textContent = `다음 단계: ${idea.nextStep}`;

      card.append(kicker, title, text, next);
      grid.appendChild(card);
    });
  }

  function fillPage() {
    const paper = state.paper;
    const concept = getActiveConcept();

    $("#hero-eyebrow").textContent = site.meta.eyebrow;
    $("#site-title").textContent = site.meta.title;
    $("#site-subtitle").textContent = site.meta.subtitle;
    $("#hero-status-label").textContent = getHeroStatusLabel();

    $("#paper-link").href = paper.arxivUrl || "https://arxiv.org/";
    $("#paper-title").textContent = paper.title || "오늘의 논문 데이터를 준비 중입니다.";
    $("#paper-date").textContent = getSnapshotChipLabel();
    $("#paper-category").textContent = (paper.categories || []).join(" · ") || "astro-ph";
    $("#paper-authors").textContent = `저자: ${(paper.authors || []).join(", ") || "정보 없음"}`;
    $("#paper-abstract").textContent = paper.abstract || "";

    renderList($("#summary-list"), paper.summaryBullets || []);
    renderList($("#takeaway-list"), paper.takeaways || []);

    $("#concept-title").textContent = concept.title;
    $("#concept-label").textContent = concept.label;
    $("#concept-description").textContent = concept.description;

    renderStats();
    renderIdeas();
  }

  function wireInteractions() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));
  }

  fillPage();
  wireInteractions();
})();
