const newsGrid = document.querySelector('#newsGrid');
const newsStatus = document.querySelector('#newsStatus');
const loadMoreButton = document.querySelector('#loadMoreNews');
const filterButtons = document.querySelectorAll('.filter-button');
const fallbackTemplate = document.querySelector('#fallbackNewsTemplate');
const videoList = document.querySelector('#videoList');
const loadMoreVideosButton = document.querySelector('#loadMoreVideos');
const fallbackVideoTemplate = document.querySelector('#fallbackVideoTemplate');
const videoChannelButtons = document.querySelectorAll('.video-channel-button');

const PAGE_SIZE = 3;
const VIDEO_PAGE_SIZE = 2;
const EMPTY_SUMMARY = '\uAE30\uC0AC \uBBF8\uB9AC\uBCF4\uAE30\uAC00 \uC81C\uACF5\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC6D0\uBB38 \uAE30\uC0AC\uC5D0\uC11C \uC790\uC138\uD55C \uB0B4\uC6A9\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.';
const SENTENCE_PATTERN = /.+?(?:\uB2C8\uB2E4\.|\uB2E4\.|\uC694\.|[.!?])(?=\s|$)/g;

let allNews = [];
let activeCategory = '\uC804\uCCB4';
let visibleCount = PAGE_SIZE;
let allVideos = [];
let selectedVideoChannel = '\uB178\uB9D0\uD2F1';
let visibleVideoCount = VIDEO_PAGE_SIZE;

const categoryKeywords = [
  { category: '\uD53C\uC2F1', keywords: ['\uD53C\uC2F1', 'phishing', '\uC0AC\uCE6D', '\uC2A4\uBBF8\uC2F1', '\uC545\uC131 \uB9C1\uD06C', '\uC774\uBA54\uC77C'] },
  { category: '\uB79C\uC12C\uC6E8\uC5B4', keywords: ['\uB79C\uC12C\uC6E8\uC5B4', 'ransomware', '\uC554\uD638\uD654', '\uBCF5\uAD6C\uBE44', '\uAC08\uCDE8'] },
  { category: '\uCDE8\uC57D\uC810', keywords: ['\uCDE8\uC57D\uC810', 'vulnerability', 'cve', '\uD328\uCE58', '\uAD8C\uD55C \uC0C1\uC2B9', '\uC81C\uB85C\uB370\uC774'] },
  { category: '\uAC1C\uC778\uC815\uBCF4', keywords: ['\uAC1C\uC778\uC815\uBCF4', 'privacy', '\uC720\uCD9C', '\uACC4\uC815', '\uC778\uC99D\uC815\uBCF4'] },
  { category: '\uC815\uCC45/\uACF5\uACF5', keywords: ['\uC815\uBD80', '\uACF5\uACF5', '\uAE08\uC735\uAD8C', '\uC815\uCC45', '\uAE30\uAD00', 'cisa'] },
];

const riskKeywords = [
  { risk: '\uC2EC\uAC01', keywords: ['\uB79C\uC12C\uC6E8\uC5B4', 'ransomware', '\uB300\uADDC\uBAA8 \uC720\uCD9C', '\uC81C\uB85C\uB370\uC774', '\uB8E8\uD2B8 \uAD8C\uD55C', '\uAD6D\uAC00 \uD574\uD0B9'] },
  { risk: '\uB192\uC74C', keywords: ['\uD53C\uC2F1', 'phishing', '\uC545\uC131\uCF54\uB4DC', '\uACC4\uC815 \uD0C8\uCDE8', '\uCDE8\uC57D\uC810', 'vulnerability'] },
  { risk: '\uC8FC\uC758', keywords: ['\uC815\uCC45', '\uBCF4\uC548 \uAD8C\uACE0', '\uC5C5\uB370\uC774\uD2B8', 'advisory', 'update'] },
];

const riskClassMap = {
  '\uBCF4\uD1B5': 'risk-normal',
  '\uC8FC\uC758': 'risk-caution',
  '\uB192\uC74C': 'risk-high',
  '\uC2EC\uAC01': 'risk-critical',
};

function classifyCategory(title = '', summary = '') {
  const text = `${title} ${summary}`.toLowerCase();
  const matched = categoryKeywords.find(({ keywords }) =>
    keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );

  return matched ? matched.category : '\uAE30\uD0C0';
}

function classifyRisk(title = '', summary = '') {
  const text = `${title} ${summary}`.toLowerCase();
  const matched = riskKeywords.find(({ keywords }) =>
    keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );

  return matched ? matched.risk : '\uBCF4\uD1B5';
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toDatetime(date = '') {
  return date.replaceAll('.', '-');
}

function getSafeLink(link = '') {
  try {
    const url = new URL(link, window.location.origin);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href;
    }
  } catch (error) {
    return '#';
  }

  return '#';
}

function splitSummaryIntoParagraphs(summary = '') {
  const cleanedSummary = String(summary || EMPTY_SUMMARY).replace(/\s+/g, ' ').trim();
  const sentences = (cleanedSummary.match(SENTENCE_PATTERN) || [])
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return [EMPTY_SUMMARY];
  }

  return sentences.slice(0, 3);
}

function getFilteredNews() {
  if (activeCategory === '\uC804\uCCB4') {
    return allNews;
  }

  return allNews.filter((news) => news.category === activeCategory);
}

function createNewsCard(news, index) {
  const number = String(index + 1).padStart(2, '0');
  const title = escapeHtml(news.title || '\uC81C\uBAA9 \uC5C6\uB294 \uBCF4\uC548 \uB274\uC2A4');
  const date = escapeHtml(news.date || '');
  const category = escapeHtml(news.category || '\uAE30\uD0C0');
  const risk = news.risk || '\uBCF4\uD1B5';
  const escapedRisk = escapeHtml(risk);
  const riskClass = riskClassMap[risk] || 'risk-normal';
  const link = getSafeLink(news.link);
  const summaryParagraphs = splitSummaryIntoParagraphs(news.summary)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');

  return `
    <article class="news-card">
      <button class="news-card-head" type="button" aria-expanded="false">
        <span class="news-number">${number}</span>
        <span class="news-head-main">
          <span class="news-title">${title}</span>
          <span class="news-meta-badges">
            <span class="news-badge category-badge">${category}</span>
            <span class="news-badge risk-badge ${riskClass}">${escapedRisk}</span>
            <span class="news-badge source-badge">\uBCF4\uC548\uB274\uC2A4</span>
          </span>
        </span>
        <time class="news-date" datetime="${toDatetime(date)}">${date}</time>
      </button>
      <div class="news-card-body">
        <div class="news-summary-box">
          <p class="summary-label">\uAE30\uC0AC \uBBF8\uB9AC\uBCF4\uAE30</p>
          <div class="news-summary-text">
            ${summaryParagraphs}
          </div>
        </div>
        <a class="news-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">
          \uC6D0\uBCF8 \uAE30\uC0AC \uBCF4\uAE30
        </a>
      </div>
    </article>
  `;
}

function updateLoadMoreButton(filteredNews) {
  if (!loadMoreButton) {
    return;
  }

  const hasMore = visibleCount < filteredNews.length;
  loadMoreButton.disabled = !hasMore;
  loadMoreButton.textContent = hasMore ? '\uB274\uC2A4 \uB354\uBCF4\uAE30' : '\uBAA8\uB4E0 \uB274\uC2A4\uB97C \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4';
}

function renderNews() {
  const filteredNews = getFilteredNews();
  const visibleNews = filteredNews.slice(0, visibleCount);

  if (!visibleNews.length) {
    newsGrid.innerHTML = '<p class="news-message">\uC120\uD0DD\uD55C \uCE74\uD14C\uACE0\uB9AC\uC758 \uB274\uC2A4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</p>';
    updateLoadMoreButton(filteredNews);
    return;
  }

  newsGrid.innerHTML = visibleNews.map(createNewsCard).join('');
  updateLoadMoreButton(filteredNews);
}

function createVideoCard(video) {
  const title = escapeHtml(video.title || '\uC81C\uBAA9 \uC5C6\uB294 \uC601\uC0C1');
  const channel = escapeHtml(video.channel || 'YouTube');
  const date = escapeHtml(video.date || '');
  const category = escapeHtml(video.category || '\uAE30\uD0C0');
  const link = getSafeLink(video.link);
  const thumbnail = getSafeLink(video.thumbnail);
  const imageSrc = thumbnail === '#' ? 'https://img.youtube.com/vi/1yu3hr6yUok/hqdefault.jpg' : thumbnail;

  return `
    <article class="video-card">
      <a class="video-frame" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">
        <img src="${escapeHtml(imageSrc)}" alt="${title}" loading="lazy" />
        <span class="video-play" aria-hidden="true"></span>
      </a>
      <div class="video-info">
        <span class="video-category-badge">${category}</span>
        <h3 class="video-title">${title}</h3>
        <p class="video-meta">${channel} · ${date}</p>
      </div>
    </article>
  `;
}

function updateLoadMoreVideosButton() {
  if (!loadMoreVideosButton) {
    return;
  }

  const filteredVideos = getFilteredVideos();
  const hasMore = visibleVideoCount < filteredVideos.length;
  loadMoreVideosButton.disabled = !hasMore;
  loadMoreVideosButton.textContent = hasMore
    ? '\uC601\uC0C1 \uB354\uBCF4\uAE30'
    : '\uBAA8\uB4E0 \uC601\uC0C1\uC744 \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4';
}

function getFilteredVideos() {
  const selectedChannel = String(selectedVideoChannel).trim();

  return allVideos.filter((video) => String(video.channel || '').trim() === selectedChannel);
}

function renderVideos() {
  if (!videoList) {
    return;
  }

  const filteredVideos = getFilteredVideos();
  const visibleVideos = filteredVideos.slice(0, visibleVideoCount);

  if (!visibleVideos.length) {
    videoList.innerHTML = '<p class="video-message">\uD574\uB2F9 \uCC44\uB110\uC758 \uC601\uC0C1\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.</p>';
    updateLoadMoreVideosButton();
    return;
  }

  videoList.innerHTML = visibleVideos.map(createVideoCard).join('');
  updateLoadMoreVideosButton();
}

function renderFallbackVideos() {
  if (!videoList) {
    return;
  }

  if (fallbackVideoTemplate) {
    videoList.innerHTML = '';
    videoList.append(fallbackVideoTemplate.content.cloneNode(true));
  } else {
    videoList.innerHTML = [
      {
        title: '\uBCF4\uC548 \uD2B8\uB80C\uB4DC \uC601\uC0C1',
        link: 'https://www.youtube.com/watch?v=1yu3hr6yUok',
        thumbnail: 'https://img.youtube.com/vi/1yu3hr6yUok/hqdefault.jpg',
        date: '',
        channel: 'YouTube',
        category: '\uAE30\uD0C0',
      },
      {
        title: '\uBCF4\uC548 \uD2B8\uB80C\uB4DC \uC601\uC0C1',
        link: 'https://www.youtube.com/watch?v=mN_D9yU_smg',
        thumbnail: 'https://img.youtube.com/vi/mN_D9yU_smg/hqdefault.jpg',
        date: '',
        channel: 'YouTube',
        category: '\uAE30\uD0C0',
      },
    ].map(createVideoCard).join('');
  }

  if (loadMoreVideosButton) {
    loadMoreVideosButton.disabled = true;
    loadMoreVideosButton.textContent = '\uBAA8\uB4E0 \uC601\uC0C1\uC744 \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4';
  }

  videoChannelButtons.forEach((button) => {
    button.disabled = true;
  });
}

function setStatus(message = '', type = '') {
  if (!newsStatus) {
    return;
  }

  newsStatus.textContent = message;
  newsStatus.dataset.type = type;
  newsStatus.hidden = !message;
}

function readFallbackNews() {
  if (!fallbackTemplate) {
    return [];
  }

  return [...fallbackTemplate.content.querySelectorAll('.news-card')].map((card, index) => {
    const title = card.querySelector('.news-title')?.textContent.trim() || '\uBC31\uC5C5 \uBCF4\uC548 \uB274\uC2A4';
    const date = card.querySelector('.news-date')?.textContent.trim() || '';
    const summary = card.querySelector('.news-summary')?.textContent.trim().replace(/\s+/g, ' ') || EMPTY_SUMMARY;
    const link = card.querySelector('.news-link')?.href || '#';

    return {
      id: index + 1,
      title,
      link,
      date,
      summary,
      category: classifyCategory(title, summary),
      risk: classifyRisk(title, summary),
    };
  });
}

async function loadNews() {
  try {
    setStatus('\uB274\uC2A4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4...', 'loading');

    const response = await fetch('/api/news');
    if (!response.ok) {
      throw new Error('\uB274\uC2A4 API \uC751\uB2F5\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.');
    }

    const news = await response.json();
    allNews = Array.isArray(news) ? news : [];

    if (!allNews.length) {
      throw new Error('\uAC00\uC838\uC628 \uB274\uC2A4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.');
    }

    setStatus('');
    renderNews();
  } catch (error) {
    allNews = readFallbackNews();
    setStatus('\uCD5C\uC2E0 \uB274\uC2A4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD574 \uBC31\uC5C5 \uB274\uC2A4\uB97C \uD45C\uC2DC\uD569\uB2C8\uB2E4.', 'error');

    if (allNews.length) {
      renderNews();
      return;
    }

    newsGrid.innerHTML = '<p class="news-message">\uB274\uC2A4\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.</p>';
    updateLoadMoreButton([]);
  }
}

async function loadVideos() {
  if (!videoList) {
    return;
  }

  try {
    const response = await fetch('/api/videos');

    if (!response.ok) {
      throw new Error('\uC601\uC0C1 API \uC751\uB2F5\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.');
    }

    const data = await response.json();
    const videos = Array.isArray(data) ? data : data.videos;
    allVideos = Array.isArray(videos) ? videos : [];

    if (!allVideos.length) {
      throw new Error('\uAC00\uC838\uC628 \uC601\uC0C1\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.');
    }

    visibleVideoCount = VIDEO_PAGE_SIZE;
    videoChannelButtons.forEach((button) => {
      button.disabled = false;
    });
    renderVideos();
  } catch (error) {
    allVideos = [];
    renderFallbackVideos();
  }
}

newsGrid?.addEventListener('click', (event) => {
  const button = event.target.closest('.news-card-head');
  if (!button) {
    return;
  }

  const card = button.closest('.news-card');
  const isOpen = card.classList.toggle('is-open');
  button.setAttribute('aria-expanded', String(isOpen));
});

loadMoreButton?.addEventListener('click', () => {
  visibleCount += PAGE_SIZE;
  renderNews();
});

loadMoreVideosButton?.addEventListener('click', () => {
  visibleVideoCount += VIDEO_PAGE_SIZE;
  renderVideos();
});

videoChannelButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedVideoChannel = String(button.dataset.channel || '\uB178\uB9D0\uD2F1').trim();
    visibleVideoCount = VIDEO_PAGE_SIZE;

    videoChannelButtons.forEach((channelButton) => {
      channelButton.classList.toggle('active', channelButton === button);
    });

    if (loadMoreVideosButton) {
      loadMoreVideosButton.textContent = '\uC601\uC0C1 \uB354\uBCF4\uAE30';
      loadMoreVideosButton.disabled = false;
    }

    renderVideos();
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category || '\uC804\uCCB4';
    visibleCount = PAGE_SIZE;

    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle('is-active', filterButton === button);
    });

    renderNews();
  });
});

loadNews();
loadVideos();
