const homeNewsGrid = document.querySelector('#homeNewsGrid');
const homeNewsStatus = document.querySelector('#homeNewsStatus');
const riskScoreCard = document.querySelector('#riskScoreCard');
const riskScore = document.querySelector('#riskScore');
const riskMessage = document.querySelector('#riskMessage');
const riskKeywords = document.querySelector('#riskKeywords');
const riskActions = document.querySelector('#riskActions');
const habitChecklist = document.querySelector('#habitChecklist');
const habitScore = document.querySelector('#habitScore');
const habitProgressBar = document.querySelector('#habitProgressBar');
const habitMessage = document.querySelector('#habitMessage');

const HABIT_STORAGE_KEY = 'security-guide-habit-checklist';

const HOME_NEWS_FALLBACK = [
  {
    title: '랜섬웨어 공격 증가',
    summary:
      '기업과 개인을 대상으로 한 랜섬웨어 공격이 지속적으로 증가하고 있으며, 중요 파일 암호화와 금전 요구 피해가 확대되고 있습니다.',
    link: 'issue.html',
    date: '',
  },
  {
    title: '피싱 이메일 확산',
    summary:
      '공공기관, 금융기관, 택배 안내 등을 사칭한 피싱 이메일과 메시지가 빠르게 확산되며 개인정보 탈취 피해가 발생하고 있습니다.',
    link: 'issue.html',
    date: '',
  },
  {
    title: '대규모 개인정보 유출',
    summary:
      '서비스 해킹이나 관리 부실로 인해 개인정보가 유출되고 있으며, 유출된 정보는 스팸, 계정 탈취, 2차 범죄로 이어질 수 있습니다.',
    link: 'issue.html',
    date: '',
  },
];

const RISK_KEYWORD_RULES = [
  {
    label: '랜섬웨어',
    keywords: ['랜섬웨어', 'ransomware', '암호화', '복구비'],
    weight: 26,
    actions: ['중요 파일 백업 상태를 확인하세요.', '출처가 불분명한 첨부파일 실행을 피하세요.'],
  },
  {
    label: '취약점',
    keywords: ['취약점', 'vulnerability', 'cve', '제로데이', '패치'],
    weight: 22,
    actions: ['운영체제와 브라우저 업데이트를 확인하세요.', '자주 쓰는 프로그램의 보안 패치 여부를 점검하세요.'],
  },
  {
    label: '개인정보',
    keywords: ['개인정보', '유출', 'privacy', 'data breach', 'credential'],
    weight: 20,
    actions: ['주요 계정의 비밀번호 재사용 여부를 확인하세요.', '최근 로그인 기록과 계정 알림을 확인하세요.'],
  },
  {
    label: '피싱',
    keywords: ['피싱', 'phishing', '스미싱', '사칭', '악성 링크'],
    weight: 18,
    actions: ['문자나 메일의 링크를 바로 누르지 말고 주소를 확인하세요.', '금융/택배/기관 안내는 공식 앱이나 사이트에서 다시 확인하세요.'],
  },
  {
    label: '악성코드',
    keywords: ['악성코드', 'malware', '백도어', '감염'],
    weight: 18,
    actions: ['백신 실시간 감시와 최근 검사 기록을 확인하세요.', '무료 설치 파일이나 크랙 프로그램 다운로드를 피하세요.'],
  },
  {
    label: '계정 탈취',
    keywords: ['계정', '인증정보', '로그인', 'account takeover'],
    weight: 14,
    actions: ['중요 계정에 2단계 인증이 켜져 있는지 확인하세요.', '저장된 비밀번호 중 오래된 항목을 정리하세요.'],
  },
  {
    label: '공공/정책',
    keywords: ['정부', '공공', '기관', '정책', '금융권'],
    weight: 10,
    actions: ['공공기관 사칭 안내는 공식 홈페이지에서 다시 확인하세요.', '정책 변경 안내를 빙자한 개인정보 입력 요구를 주의하세요.'],
  },
];

const DEFAULT_RISK_ACTIONS = [
  '의심스러운 링크는 바로 누르지 말고 주소를 먼저 확인하세요.',
  '중요 계정의 2단계 인증과 복구 이메일을 점검하세요.',
  '운영체제, 브라우저, 자주 쓰는 앱을 최신 상태로 유지하세요.',
];

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getSafeLink(link = '') {
  try {
    const url = new URL(link, window.location.origin);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href;
    }
  } catch (error) {
    return 'issue.html';
  }

  return 'issue.html';
}

function makeShortSummary(summary = '') {
  const cleaned = String(summary || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return '기사 미리보기가 제공되지 않습니다. 원문 기사에서 자세한 내용을 확인해주세요.';
  }

  return cleaned.length > 120 ? `${cleaned.slice(0, 120).trim()}...` : cleaned;
}

function setHomeNewsStatus(message = '') {
  if (!homeNewsStatus) return;

  homeNewsStatus.textContent = message;
  homeNewsStatus.hidden = !message;
}

function createHomeNewsCard(news, index) {
  const number = String(index + 1).padStart(2, '0');
  const title = escapeHtml(news.title || '제목 없는 보안 뉴스');
  const summary = escapeHtml(makeShortSummary(news.summary));
  const link = escapeHtml(getSafeLink(news.link));
  const date = escapeHtml(news.date || '');

  return `
    <article class="issue-card">
      <span class="issue-tag">ISSUE ${number}</span>
      <h3>${title}</h3>
      ${date ? `<time class="issue-date">${date}</time>` : ''}
      <p>${summary}</p>
      <a href="${link}" class="card-link home-news-link" target="_blank" rel="noopener noreferrer">원본 바로가기</a>
    </article>
  `;
}

function renderHomeNews(newsList) {
  if (!homeNewsGrid) return;

  homeNewsGrid.innerHTML = newsList.slice(0, 3).map(createHomeNewsCard).join('');
}

function analyzeRisk(newsList) {
  const combinedText = newsList
    .map((news) => `${news.title || ''} ${news.summary || ''}`)
    .join(' ')
    .toLowerCase();

  const detected = RISK_KEYWORD_RULES.map((rule) => {
    const hitCount = rule.keywords.reduce((count, keyword) => {
      return combinedText.includes(keyword.toLowerCase()) ? count + 1 : count;
    }, 0);

    return {
      label: rule.label,
      score: hitCount * rule.weight,
      actions: rule.actions,
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const totalScore = detected.reduce((sum, item) => sum + item.score, 0);
  const score = Math.min(100, Math.max(12, totalScore));

  return {
    score,
    detected,
  };
}

function renderRiskDashboard(newsList) {
  if (!riskScoreCard || !riskScore || !riskMessage || !riskKeywords || !riskActions) return;

  const { score, detected } = analyzeRisk(newsList);
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const levelText = score >= 70 ? '높음' : score >= 40 ? '주의' : '보통';
  const message =
    score >= 70
      ? '최근 기사에서 강한 위험 신호가 감지되었습니다. 업데이트, 백업, 계정 보호 상태를 바로 확인하세요.'
      : score >= 40
        ? '주의할 만한 보안 키워드가 보입니다. 의심 링크와 계정 알림을 한 번 더 확인하세요.'
        : '큰 위험 신호는 적지만 기본 보안 습관은 계속 유지해야 합니다.';

  riskScoreCard.classList.remove('low', 'medium', 'high');
  riskScoreCard.classList.add(level);
  riskScore.textContent = `${levelText} ${score}%`;
  riskMessage.textContent = message;

  if (!detected.length) {
    riskKeywords.innerHTML = '<span class="is-empty">특이 키워드 없음</span>';
    riskActions.innerHTML = DEFAULT_RISK_ACTIONS.map((action) => `<li>${escapeHtml(action)}</li>`).join('');
    return;
  }

  riskKeywords.innerHTML = detected
    .slice(0, 5)
    .map((item) => `<span>${escapeHtml(item.label)}</span>`)
    .join('');

  const actionList = [
    ...new Set(detected.flatMap((item) => item.actions)),
  ].slice(0, 6);

  riskActions.innerHTML = actionList.map((action) => `<li>${escapeHtml(action)}</li>`).join('');
}

async function loadHomeNews() {
  if (!homeNewsGrid) return;

  try {
    setHomeNewsStatus('최신 보안 기사를 불러오는 중입니다...');

    const response = await fetch('/api/news');

    if (!response.ok) {
      throw new Error('뉴스 API 응답이 올바르지 않습니다.');
    }

    const news = await response.json();
    const latestNews = Array.isArray(news) ? news.slice(0, 3) : [];

    if (!latestNews.length) {
      throw new Error('표시할 최신 기사가 없습니다.');
    }

    renderHomeNews(latestNews);
    renderRiskDashboard(latestNews);
    setHomeNewsStatus('');
  } catch (error) {
    renderHomeNews(HOME_NEWS_FALLBACK);
    renderRiskDashboard(HOME_NEWS_FALLBACK);
    setHomeNewsStatus('최신 기사를 불러오지 못해 기본 보안 이슈를 표시합니다.');
  }
}

function readHabitState() {
  try {
    return JSON.parse(localStorage.getItem(HABIT_STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveHabitState(state) {
  localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(state));
}

function updateHabitSummary() {
  if (!habitChecklist || !habitScore || !habitProgressBar || !habitMessage) return;

  const checkboxes = [...habitChecklist.querySelectorAll('input[type="checkbox"]')];
  const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
  const percent = Math.round((checkedCount / checkboxes.length) * 100);

  habitScore.textContent = `${percent}%`;
  habitProgressBar.style.width = `${percent}%`;

  habitMessage.textContent =
    percent === 100
      ? '좋습니다. 오늘의 기본 보안 습관이 모두 갖춰졌습니다.'
      : percent >= 60
        ? '좋은 흐름입니다. 남은 항목까지 채우면 생활 보안 수준이 더 올라갑니다.'
        : '아직 보완할 부분이 있습니다. 2단계 인증과 백업부터 확인해보세요.';

  checkboxes.forEach((checkbox) => {
    checkbox.closest('.habit-item')?.classList.toggle('checked', checkbox.checked);
  });
}

function initHabitChecklist() {
  if (!habitChecklist) return;

  const savedState = readHabitState();
  const checkboxes = [...habitChecklist.querySelectorAll('input[type="checkbox"]')];

  checkboxes.forEach((checkbox) => {
    checkbox.checked = Boolean(savedState[checkbox.dataset.habit]);
    checkbox.addEventListener('change', () => {
      const nextState = readHabitState();
      nextState[checkbox.dataset.habit] = checkbox.checked;
      saveHabitState(nextState);
      updateHabitSummary();
    });
  });

  updateHabitSummary();
}

initHabitChecklist();
loadHomeNews();
