param(
  [string]$OutputPath = (Join-Path $PSScriptRoot "..\\data\\paper-latest.js")
)

$ErrorActionPreference = "Stop"

function Normalize-Whitespace {
  param([string]$Text)

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return ""
  }

  return ([regex]::Replace($Text, "\s+", " ")).Trim()
}

function Get-Sentences {
  param([string]$Text)

  $normalized = Normalize-Whitespace $Text
  if (-not $normalized) {
    return @()
  }

  $matches = [regex]::Split($normalized, "(?<=[.!?])\s+")
  return @($matches | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
}

function Get-TopRecentPaperId {
  param([string]$Html)

  $pattern = '(?s)<dt>\s*(?:<span class="list-identifier">)?\s*\[\s*<a href="/abs/(?<id>[^"]+)"'
  $match = [regex]::Match($Html, $pattern)

  if (-not $match.Success) {
    $fallback = [regex]::Match($Html, 'href="/abs/(?<id>[^"]+)"')
    if ($fallback.Success) {
      return $fallback.Groups["id"].Value
    }

    throw "Top paper id could not be parsed from astro-ph/recent."
  }

  return $match.Groups["id"].Value
}

function Get-MethodLabel {
  param([string]$Abstract)

  $patterns = @(
    @{ Match = "(?i)\b(simulation|numerical|hydrodynamic|n-body|monte carlo)\b"; Text = "수치 시뮬레이션과 모델링을 활용한 접근" },
    @{ Match = "(?i)\b(observation|observed|survey|telescope|spectra|spectroscopic|photometric)\b"; Text = "관측 자료와 서베이 데이터를 활용한 접근" },
    @{ Match = "(?i)\b(machine learning|neural network|classifier|inference)\b"; Text = "통계 추론 또는 기계학습 기반 분석" },
    @{ Match = "(?i)\b(analytic|analytical|theory|framework|formalism)\b"; Text = "이론적 프레임워크와 해석적 계산 중심 접근" }
  )

  foreach ($pattern in $patterns) {
    if ($Abstract -match $pattern.Match) {
      return $pattern.Text
    }
  }

  return "초록에 제시된 핵심 가설을 검증하기 위한 분석적 접근"
}

function Get-FocusLabel {
  param([string[]]$Categories)

  $focusMap = @{
    "astro-ph.CO" = "우주론적 초기 조건과 구조 형성"
    "astro-ph.EP" = "행성계와 원시행성 원반 진화"
    "astro-ph.GA" = "은하의 형성과 진화"
    "astro-ph.HE" = "고에너지 천체물리 현상"
    "astro-ph.IM" = "관측 장비와 데이터 해석"
    "astro-ph.SR" = "태양 및 항성 물리"
  }

  foreach ($category in $Categories) {
    if ($focusMap.ContainsKey($category)) {
      return $focusMap[$category]
    }
  }

  return "최신 천체물리학 질문 정리"
}

function Build-SummaryBullets {
  param(
    [string]$Title,
    [string]$Abstract,
    [string]$MethodLabel
  )

  $sentences = Get-Sentences $Abstract
  $opening = if ($sentences.Count -gt 0) { $sentences[0] } else { Normalize-Whitespace $Title }
  $closing = if ($sentences.Count -gt 1) { $sentences[-1] } else { $opening }

  return @(
    "이 논문은 '$Title'라는 질문을 중심으로 최신 천체물리학 문제를 다룹니다. 초록의 첫 메시지는 '$opening'에 가깝습니다.",
    "방법 측면에서는 $MethodLabel 패턴이 뚜렷하게 보이며, 논문의 핵심은 어떤 관측량 또는 모델 파라미터가 민감하게 반응하는지를 정리하는 데 있습니다.",
    "마지막으로 초록은 '$closing'이라는 함의를 남기므로, 후속 연구에서는 이 결론이 다른 데이터셋이나 가정에서도 유지되는지 확인하는 것이 중요합니다."
  )
}

function Build-Takeaways {
  param(
    [string]$Abstract,
    [string[]]$Categories
  )

  $method = Get-MethodLabel $Abstract
  $focus = Get-FocusLabel $Categories

  return @(
    "핵심 포커스는 '$focus'이며, 초록을 읽을 때 저자들이 무엇을 새롭게 측정하거나 제약했는지 먼저 확인하면 좋습니다.",
    "사용한 방법은 '$method'에 가깝기 때문에, 데이터 선택과 모델 가정이 결론에 미치는 영향을 따로 체크하는 것이 좋습니다.",
    "논문에서 제시한 결과가 후속 관측이나 시뮬레이션으로 얼마나 재현 가능한지 메모해 두면 다음 연구 질문으로 이어지기 쉽습니다."
  )
}

function Build-ResearchIdeas {
  param(
    [string]$Title,
    [string]$Abstract,
    [string[]]$Categories
  )

  $observationIdea = @{
    kicker = "Observation"
    title = "독립 관측 자료와의 교차 검증"
    description = "이 논문의 결과가 특정 데이터셋에만 의존하는지 확인하려면, 비슷한 물리량을 다른 관측 창구나 별도 서베이로 다시 비교하는 과정이 필요합니다."
    nextStep = "같은 물리량을 추적할 수 있는 대체 관측 지표를 하나 선정해 비교 표를 만듭니다."
  }

  $modelIdea = @{
    kicker = "Modeling"
    title = "가정 변화에 대한 민감도 스캔"
    description = "초록에서 제시한 결론이 특정 초기 조건, 경계 조건, 또는 잡음 모델에 얼마나 민감한지 확인하면 논문의 해석 범위를 더 선명하게 만들 수 있습니다."
    nextStep = "가장 강한 가정 2~3개를 골라 파라미터 스윕 실험을 설계합니다."
  }

  $forecastIdea = @{
    kicker = "Forecast"
    title = "차세대 장비 또는 시뮬레이션 기준의 재현 가능성 평가"
    description = "결과가 흥미롭더라도 실제 후속 장비 또는 더 큰 스케일의 수치 실험에서 검출 가능한지 먼저 계산해야 연구 우선순위를 정하기 쉬워집니다."
    nextStep = "예상 신호 크기, 잡음, 계산 비용을 함께 적은 간단한 feasibility 메모를 작성합니다."
  }

  if ($Abstract -match "(?i)\b(simulation|numerical|hydrodynamic|n-body)\b") {
    $modelIdea.title = "해상도와 피직스 옵션에 따른 결과 안정성 점검"
    $modelIdea.description = "수치 실험 기반 결과라면 해상도, 서브그리드 피직스, 초기 조건이 결론을 얼마나 바꾸는지 확인하는 것 자체가 하나의 후속 연구가 됩니다."
    $modelIdea.nextStep = "저해상도와 고해상도 케이스를 나눈 비교 테이블을 먼저 만듭니다."
  }

  if ($Categories -contains "astro-ph.IM") {
    $forecastIdea.title = "관측 파이프라인과 시스템 오차까지 포함한 end-to-end 테스트"
    $forecastIdea.description = "장비·방법론 카테고리 논문은 알고리즘 성능뿐 아니라 실제 관측 파이프라인 안에서 시스템 오차가 어떻게 전파되는지 확인해야 실전성이 높아집니다."
    $forecastIdea.nextStep = "입력부터 최종 통계량까지 이어지는 오차 전파 흐름도를 작성합니다."
  }

  return @($observationIdea, $modelIdea, $forecastIdea)
}

function Convert-ToJsLiteral {
  param([object]$Value)

  $json = $Value | ConvertTo-Json -Depth 10
  return "window.ASTROBRIEF_PAPER = $json;"
}

$recentUri = "https://arxiv.org/list/astro-ph/recent"
Write-Host "Fetching top paper from astro-ph/recent..."
$recentResponse = Invoke-WebRequest -Uri $recentUri -UseBasicParsing
$paperId = Get-TopRecentPaperId -Html $recentResponse.Content

$apiUri = "https://export.arxiv.org/api/query?id_list=$paperId"
Write-Host "Fetching metadata for $paperId..."
$response = Invoke-WebRequest -Uri $apiUri -UseBasicParsing
[xml]$xml = $response.Content

$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("atom", "http://www.w3.org/2005/Atom")

$entry = $xml.SelectSingleNode("//atom:feed/atom:entry", $ns)

if (-not $entry) {
  throw "Latest arXiv entry could not be found."
}

$title = Normalize-Whitespace ([string]$entry.title)
$abstract = Normalize-Whitespace ([string]$entry.summary)
$authors = @($entry.author | ForEach-Object { Normalize-Whitespace ([string]$_.name) })
$publishedAt = [datetime]([string]$entry.published)
$updatedAt = [datetime]([string]$entry.updated)
$arxivUrl = [string](
  @($entry.link | Where-Object { $_.rel -eq "alternate" } | Select-Object -First 1).href
)

if (-not $arxivUrl) {
  $arxivUrl = Normalize-Whitespace ([string]$entry.id)
}

$paperCategories = @(
  $entry.category |
    ForEach-Object { Normalize-Whitespace ([string]$_.term) } |
    Where-Object { $_ } |
    Select-Object -Unique
)

$methodLabel = Get-MethodLabel $abstract
$paper = [ordered]@{
  status = "live"
  generatedAt = (Get-Date).ToString("o")
  publishedAt = $publishedAt.ToString("o")
  updatedAt = $updatedAt.ToString("o")
  selectionSource = $recentUri
  selectionRule = "한국 시간 오전 9시에 astro-ph/recent를 열었을 때 최상단 논문"
  focus = Get-FocusLabel $paperCategories
  title = $title
  authors = $authors
  categories = $paperCategories
  arxivUrl = $arxivUrl
  summaryBullets = Build-SummaryBullets -Title $title -Abstract $abstract -MethodLabel $methodLabel
  takeaways = Build-Takeaways -Abstract $abstract -Categories $paperCategories
  abstract = $abstract
  researchIdeas = Build-ResearchIdeas -Title $title -Abstract $abstract -Categories $paperCategories
}

$js = Convert-ToJsLiteral $paper
$resolvedOutput = if ([System.IO.Path]::IsPathRooted($OutputPath)) {
  $OutputPath
} else {
  [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot $OutputPath))
}
[System.IO.File]::WriteAllText($resolvedOutput, $js, (New-Object System.Text.UTF8Encoding($true)))

Write-Host "Updated briefing data at $resolvedOutput"


