(function () {
  const site = window.ASTROBRIEF_SITE;
  const fallbackPaper = window.ASTROBRIEF_PAPER;

  if (!site || !fallbackPaper) {
    throw new Error("AstroBrief data files are missing.");
  }

  const RECENT_URL = "https://arxiv.org/list/astro-ph/recent";
  const API_URL = "https://export.arxiv.org/api/query?id_list=";
  const CACHE_KEY = "astrobrief-live-paper-cache";

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
    mode: "loading",
    error: null,
    paper: readCachedPaper() || fallbackPaper
  };

  function normalizeWhitespace(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function getSentences(text) {
    return normalizeWhitespace(text)
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
  }

  function renderList(element, items) {
    element.innerHTML = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      element.appendChild(li);
    });
  }

  function getMethodLabel(abstract) {
    const rules = [
      { pattern: /\b(simulation|numerical|hydrodynamic|n-body|monte carlo)\b/i, text: "수치 시뮬레이션과 모델링을 활용한 접근" },
      { pattern: /\b(observation|observed|survey|telescope|spectra|spectroscopic|photometric)\b/i, text: "관측 자료와 서베이 데이터를 활용한 접근" },
      { pattern: /\b(machine learning|neural network|classifier|inference)\b/i, text: "통계 추론 또는 기계학습 기반 분석" },
      { pattern: /\b(analytic|analytical|theory|framework|formalism|parameterizing)\b/i, text: "이론적 프레임워크와 해석적 계산 중심 접근" }
    ];

    const match = rules.find((rule) => rule.pattern.test(abstract));
    return match ? match.text : "초록에 제시된 핵심 가설을 검증하기 위한 분석적 접근";
  }

  function getFocusLabel(categories) {
    const focusMap = {
      "astro-ph.CO": "우주론적 초기 조건과 암흑 성분 제약",
      "astro-ph.EP": "행성계와 반사광·스펙트럼 해석",
      "astro-ph.GA": "은하와 은하 주변 물질의 진화",
      "astro-ph.HE": "고에너지 천체물리 현상",
      "astro-ph.IM": "관측 장비와 데이터 해석",
      "astro-ph.SR": "태양 및 항성 물리"
    };

    const category = categories.find((item) => focusMap[item]);
    return category ? focusMap[category] : "최신 천체물리학 질문 정리";
  }

  function buildSummaryBullets(title, abstract, categories) {
    const sentences = getSentences(abstract);
    const opening = sentences[0] || title;
    const closing = sentences[sentences.length - 1] || opening;
    const focus = getFocusLabel(categories);
    const methodLabel = getMethodLabel(abstract);

    return [
      `이 논문은 '${title}'라는 질문을 중심으로 ${focus} 문제를 다룹니다. 초록의 첫 메시지는 '${opening}'에 가깝습니다.`,
      `접근 방식은 ${methodLabel}에 가깝고, 저자들은 어떤 파라미터나 관측량이 결론을 가장 크게 움직이는지에 주목합니다.`,
      `초록의 마무리 메시지는 '${closing}'으로 읽을 수 있어서, 후속 연구에서는 이 결론이 다른 데이터셋과 가정에서도 유지되는지 확인하는 것이 중요합니다.`
    ];
  }

  function buildTakeaways(abstract, categories) {
    const focus = getFocusLabel(categories);
    const methodLabel = getMethodLabel(abstract);

    return [
      `핵심 포커스는 '${focus}'이므로, 저자들이 무엇을 새롭게 제약했는지 먼저 읽어보면 좋습니다.`,
      `방법론은 '${methodLabel}'에 가깝기 때문에, 데이터 선택과 모형 가정이 결론에 주는 영향을 같이 보는 것이 좋습니다.`,
      "결론이 다른 관측 장비, 표본, 또는 시뮬레이션에서도 재현 가능한지 메모해 두면 바로 다음 연구 질문으로 이어집니다."
    ];
  }

  function buildResearchIdeas(title, abstract, categories) {
    const ideas = [
      {
        kicker: "Observation",
        title: "독립 데이터셋으로 같은 결론이 유지되는지 확인하기",
        description: "이 논문의 결과가 특정 표본이나 장비 설정에만 기대는지 확인하려면, 같은 물리량을 다른 관측 자료나 별도 서베이로 다시 비교하는 작업이 필요합니다.",
        nextStep: "같은 물리량을 추적할 수 있는 대체 관측 지표를 하나 골라 비교 표를 만듭니다."
      },
      {
        kicker: "Modeling",
        title: "강한 가정 두세 개만 골라 민감도 스캔하기",
        description: "초록에서 중요한 결론일수록 특정 초기 조건, prior, 잡음 모형, 또는 피직스 옵션에 얼마나 민감한지 확인해야 해석 범위를 더 정확히 잡을 수 있습니다.",
        nextStep: "결론을 가장 많이 흔들 것 같은 가정 2~3개를 선정해 파라미터 스윕 실험을 설계합니다."
      },
      {
        kicker: "Forecast",
        title: "후속 장비나 더 큰 표본에서 재현 가능한지 계산하기",
        description: "흥미로운 결론도 실제 다음 세대 장비나 더 넓은 데이터에서 검출 가능하지 않으면 후속 연구 우선순위를 세우기 어렵습니다.",
        nextStep: "예상 신호 크기, 잡음, 필요한 표본 수를 한 장짜리 feasibility 메모로 정리합니다."
      }
    ];

    if (/\b(bayesian|likelihood|prior)\b/i.test(`${title} ${abstract}`)) {
      ideas[1].title = "prior와 통계 선택이 결론을 얼마나 바꾸는지 분리하기";
      ideas[1].description = "베이지안 또는 likelihood 기반 논문이라면 통계적 선택이 물리적 결론보다 더 큰 영향을 주는지 확인하는 과정이 중요합니다.";
      ideas[1].nextStep = "기본 prior와 대안 prior를 나눈 비교 도표를 먼저 만듭니다.";
    }

    if (categories.includes("astro-ph.IM")) {
      ideas[2].title = "실제 관측 파이프라인까지 포함한 end-to-end 테스트";
      ideas[2].description = "장비·방법론 논문은 알고리즘 자체보다도 시스템 오차가 전체 파이프라인에서 어떻게 누적되는지 봐야 실전성이 높아집니다.";
      ideas[2].nextStep = "입력부터 최종 통계량까지 이어지는 오차 전파 흐름도를 작성합니다.";
    }

    return ideas;
  }

  function buildConcept(paper) {
    const text = `${paper.title} ${paper.abstract}`.toLowerCase();

    const rules = [
      {
        pattern: /\b(dark energy|density level|cpl|interacting dark energy|scalar-tensor)\b/,
        concept: {
          label: "Selected Concept",
          title: "암흑에너지 밀도 매개화",
          description:
            "이 논문에서 잡아야 할 개념은 암흑에너지의 진화를 직접 상태방정식으로 쓰기보다 밀도 함수 자체를 적은 수의 파라미터로 표현하는 방법입니다. 이렇게 하면 기존 CPL 같은 표현이 놓칠 수 있는 밀도 변화 양상을 더 직접적으로 비교할 수 있고, 관측 데이터가 실제로 어떤 시간대의 우주 팽창 이력을 선호하는지도 더 분명하게 읽어낼 수 있습니다. 핵심은 '어떤 수학적 형태가 더 편한가'보다, 관측 가능한 밀도 변화가 모델 선택에 얼마나 민감한가를 묻는 데 있습니다."
        }
      },
      {
        pattern: /\b(correlation|detector network|detector|gravitational waves|cavity)\b/,
        concept: {
          label: "Selected Concept",
          title: "검출기 네트워크 상관 분석",
          description:
            "이 논문의 핵심 개념은 신호를 단일 장비 하나에서 확정하려 하지 않고, 서로 멀리 떨어진 여러 검출기의 데이터를 함께 비교하는 상관 분석입니다. 각 장비의 로컬 잡음은 서로 다를 가능성이 크지만 실제 우주 기원의 신호는 여러 위치에서 일관된 패턴을 남길 수 있으므로, 네트워크를 구성하면 신호 대 잡음비를 높이고 신호의 기원도 더 설득력 있게 판단할 수 있습니다."
        }
      },
      {
        pattern: /\b(cmb|planck|act|desi|profile likelihood)\b/,
        concept: {
          label: "Selected Concept",
          title: "관측 데이터 결합을 통한 우주론 모형 제약",
          description:
            "이 논문에서 중요한 개념은 서로 다른 우주론 관측 데이터를 한 프레임에 묶어 하나의 모형을 제약하는 방법입니다. CMB, 대규모 구조, 거리 측정처럼 서로 민감한 스케일이 다른 데이터를 같이 쓰면 파라미터 퇴화를 줄일 수 있고, 특정 모형이 한 데이터셋에서는 좋아 보여도 전체적으로는 얼마나 안정적인지 더 분명하게 알 수 있습니다."
        }
      },
      {
        pattern: /\b(21 ?cm|foreground|power spectrum|reconstruction|emulator)\b/,
        concept: {
          label: "Selected Concept",
          title: "약한 우주 신호를 통계적으로 분리하는 방법",
          description:
            "이 논문에서 핵심은 매우 약한 우주 신호를 foreground, 잡음, 비선형 효과와 분리해 통계량으로 읽어내는 방법입니다. 관측 자체보다 중요한 것은 어떤 전처리와 모델링을 거쳐야 신호가 왜곡되지 않는지 판단하는 과정이며, 결국 분석 파이프라인 전체가 물리 결론의 일부가 됩니다."
        }
      },
      {
        pattern: /\b(reflected light|surface degeneracies|habitable worlds|modern earth)\b/,
        concept: {
          label: "Selected Concept",
          title: "제한된 반사광 관측에서 표면 조성을 역추론하기",
          description:
            "이 논문의 핵심 개념은 한 번의 반사광 관측처럼 정보가 제한된 상황에서 행성 표면이나 대기 조성을 거꾸로 추론하는 문제입니다. 서로 다른 표면 조합이 비슷한 스펙트럼을 만들 수 있기 때문에, 관측값 하나를 곧바로 물리적 실체와 연결하기보다 어떤 경우들이 서로 구별되지 않는지를 먼저 파악하는 것이 중요합니다."
        }
      }
    ];

    const matched = rules.find((rule) => rule.pattern.test(text));
    if (matched) {
      return matched.concept;
    }

    return {
      label: "Selected Concept",
      title: "관측량과 모형을 연결하는 해석 프레임",
      description:
        "이 논문에서 독자가 먼저 잡아야 할 개념은 '무엇을 직접 본 것인가'보다 '관측량이 어떤 물리 모형과 연결되는가'입니다. 최신 천체물리학 논문은 대개 관측 데이터, 통계 추론, 이론 모형을 한 덩어리로 다루므로, 핵심 개념도 특정 현상 하나보다 그 연결 구조를 이해하는 데서 나옵니다."
    };
  }

  function parseRecentTopPaper(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const firstDt = doc.querySelector("dl dt");
    const firstDd = doc.querySelector("dl dd");
    const firstHeading = doc.querySelector("h3");
    const absLink = firstDt ? firstDt.querySelector('a[href*="/abs/"]') : null;
    const href = absLink ? absLink.getAttribute("href") || "" : "";
    const idFromHref = href.includes("/abs/") ? href.split("/abs/")[1] : "";
    const idFromText = absLink ? normalizeWhitespace(absLink.textContent).replace(/^arXiv:/, "") : "";
    const paperId = idFromHref || idFromText;

    if (!paperId) {
      const regexMatch = html.match(/href="\/abs\/([^"]+)"/);
      if (!regexMatch) {
        throw new Error("Could not parse the top paper from astro-ph/recent.");
      }

      return {
        paperId: regexMatch[1],
        recentLabel: ""
      };
    }

    return {
      paperId,
      recentLabel: normalizeWhitespace((firstHeading ? firstHeading.textContent : "").replace(/\(.*$/, ""))
    };
  }

  function parsePaperXml(xmlText, recentMeta) {
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    const entry = xml.querySelector("entry");
    const parserError = xml.querySelector("parsererror");

    if (!entry || parserError) {
      throw new Error("Could not parse arXiv API response.");
    }

    const title = normalizeWhitespace(entry.querySelector("title")?.textContent || "");
    const abstract = normalizeWhitespace(entry.querySelector("summary")?.textContent || "");
    const authors = Array.from(entry.querySelectorAll("author > name"))
      .map((node) => normalizeWhitespace(node.textContent))
      .filter(Boolean);
    const categories = Array.from(entry.querySelectorAll("category"))
      .map((node) => node.getAttribute("term") || "")
      .filter(Boolean);
    const arxivUrl =
      entry.querySelector('link[rel="alternate"]')?.getAttribute("href") ||
      normalizeWhitespace(entry.querySelector("id")?.textContent || "https://arxiv.org/");
    const publishedAt = normalizeWhitespace(entry.querySelector("published")?.textContent || "");
    const updatedAt = normalizeWhitespace(entry.querySelector("updated")?.textContent || "");

    const paper = {
      status: "live",
      generatedAt: new Date().toISOString(),
      publishedAt,
      updatedAt,
      publishedLabel: recentMeta.recentLabel
        ? `${recentMeta.recentLabel} recent 최상단`
        : `${kstDateFormatter.format(new Date())} recent 최상단`,
      selectionSource: RECENT_URL,
      selectionRule: "한국 시간 오전 9시 기준 astro-ph/recent 최상단 규칙",
      focus: getFocusLabel(categories),
      title,
      authors,
      categories,
      arxivUrl,
      summaryBullets: buildSummaryBullets(title, abstract, categories),
      takeaways: buildTakeaways(abstract, categories),
      abstract,
      researchIdeas: buildResearchIdeas(title, abstract, categories)
    };

    paper.concept = buildConcept(paper);
    return paper;
  }

  function buildProxyUrls(url) {
    return [
      url,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    ];
  }

  async function fetchText(url) {
    let lastError = null;

    for (const candidate of buildProxyUrls(url)) {
      try {
        const response = await fetch(candidate, {
          headers: {
            Accept: "text/html,application/xml,text/xml,text/plain"
          }
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const body = await response.text();

        if (candidate.includes("/get?url=")) {
          const payload = JSON.parse(body);
          if (!payload.contents) {
            throw new Error("Proxy response did not include contents.");
          }

          return payload.contents;
        }

        return body;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("Remote fetch failed.");
  }

  async function loadLivePaper() {
    const recentHtml = await fetchText(RECENT_URL);
    const recentMeta = parseRecentTopPaper(recentHtml);
    const apiXml = await fetchText(`${API_URL}${encodeURIComponent(recentMeta.paperId)}`);
    return parsePaperXml(apiXml, recentMeta);
  }

  function readCachedPaper() {
    try {
      const raw = window.localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeCachedPaper(paper) {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(paper));
    } catch (error) {
      // Ignore storage failures in locked-down browsers.
    }
  }

  function getActiveConcept() {
    return state.paper.concept || site.concept;
  }

  function getHeroStatusLabel() {
    if (state.mode === "loading") {
      return "arXiv에서 오늘 논문 불러오는 중";
    }

    if (state.mode === "live") {
      return "실시간 arXiv 브리핑 반영됨";
    }

    return "네트워크 문제로 저장된 브리핑 표시 중";
  }

  function renderStats() {
    const paper = state.paper;
    const stats = [
      {
        label: "데이터 상태",
        value: state.mode === "live" ? "실시간 arXiv recent 조회" : "내장 fallback 데이터"
      },
      {
        label: "최종 갱신",
        value: paper.generatedAt ? dateTimeFormatter.format(new Date(paper.generatedAt)) : "수동 편집"
      },
      {
        label: "대표 카테고리",
        value: (paper.categories || [])[0] || "astro-ph"
      },
      {
        label: "핵심 포커스",
        value: paper.focus || "최신 천체물리학 질문 정리"
      },
      {
        label: "선정 규칙",
        value: paper.selectionRule || "한국 시간 오전 9시 기준 astro-ph/recent 최상단 규칙"
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

  function renderWorkflow() {
    renderList($("#workflow-list"), site.workflow);
  }

  function fillPage() {
    const paper = state.paper;
    const concept = getActiveConcept();

    $("#hero-eyebrow").textContent = site.meta.eyebrow;
    $("#site-title").textContent = site.meta.title;
    $("#site-subtitle").textContent = site.meta.subtitle;
    $("#hero-status-label").textContent = getHeroStatusLabel();

    $("#paper-link").href = paper.arxivUrl || "https://arxiv.org/";
    $("#paper-title").textContent = paper.title;
    $("#paper-date").textContent = paper.publishedLabel || dateTimeFormatter.format(new Date(paper.publishedAt));
    $("#paper-category").textContent = (paper.categories || []).join(" · ");
    $("#paper-authors").textContent = `저자: ${(paper.authors || []).join(", ")}`;
    $("#paper-abstract").textContent = paper.abstract;

    renderList($("#summary-list"), paper.summaryBullets || []);
    renderList($("#takeaway-list"), paper.takeaways || []);

    $("#concept-title").textContent = concept.title;
    $("#concept-label").textContent = concept.label;
    $("#concept-description").textContent = concept.description;

    renderStats();
    renderIdeas();
    renderWorkflow();
  }

  function wireInteractions() {
    const toggleButton = $("#toggle-abstract");
    const panel = $("#abstract-panel");

    toggleButton.addEventListener("click", function () {
      const expanded = toggleButton.getAttribute("aria-expanded") === "true";
      toggleButton.setAttribute("aria-expanded", String(!expanded));
      toggleButton.textContent = expanded ? "초록 펼치기" : "초록 접기";
      panel.classList.toggle("is-collapsed", expanded);
    });

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

  async function hydrateLivePaper() {
    try {
      const livePaper = await loadLivePaper();
      state.paper = livePaper;
      state.mode = "live";
      state.error = null;
      writeCachedPaper(livePaper);
    } catch (error) {
      state.mode = "fallback";
      state.error = error;
    }

    fillPage();
  }

  fillPage();
  wireInteractions();
  hydrateLivePaper();
})();


