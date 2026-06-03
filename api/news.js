const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 8000,
});

const RSS_URL = 'https://www.boannews.com/media/news_rss.xml';
const RSS_URLS = [
  RSS_URL,
  'http://www.boannews.com/media/news_rss.xml',
  'https://www.cisa.gov/news.xml',
];

const EMPTY_SUMMARY = '\uAE30\uC0AC \uBBF8\uB9AC\uBCF4\uAE30\uAC00 \uC81C\uACF5\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC6D0\uBB38 \uAE30\uC0AC\uC5D0\uC11C \uC790\uC138\uD55C \uB0B4\uC6A9\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.';
const SENTENCE_PATTERN = /.+?(?:\uB2C8\uB2E4\.|\uB2E4\.|\uC694\.|[.!?])(?=\s|$)/g;

const categoryRules = [
  { category: '\uD53C\uC2F1', keywords: ['\uD53C\uC2F1', 'phishing', '\uC0AC\uCE6D', 'spoofing', '\uC2A4\uBBF8\uC2F1', 'smishing', '\uC545\uC131 \uB9C1\uD06C', '\uC774\uBA54\uC77C', 'email'] },
  { category: '\uB79C\uC12C\uC6E8\uC5B4', keywords: ['\uB79C\uC12C\uC6E8\uC5B4', 'ransomware', '\uC554\uD638\uD654', '\uBCF5\uAD6C\uBE44', '\uAC08\uCDE8', 'extortion'] },
  { category: '\uCDE8\uC57D\uC810', keywords: ['\uCDE8\uC57D\uC810', 'vulnerability', 'vulnerabilities', 'cve', '\uD328\uCE58', 'patch', '\uAD8C\uD55C \uC0C1\uC2B9', '\uC81C\uB85C\uB370\uC774', 'zero-day'] },
  { category: '\uAC1C\uC778\uC815\uBCF4', keywords: ['\uAC1C\uC778\uC815\uBCF4', 'privacy', '\uC720\uCD9C', 'data breach', 'leak', '\uACC4\uC815', 'account', '\uC778\uC99D\uC815\uBCF4', 'credential'] },
  { category: '\uC815\uCC45/\uACF5\uACF5', keywords: ['\uC815\uBD80', '\uACF5\uACF5', '\uAE08\uC735\uAD8C', '\uC815\uCC45', '\uAE30\uAD00', 'government', 'public', 'policy', 'agency', 'cisa'] },
];

const riskRules = [
  { risk: '\uC2EC\uAC01', keywords: ['\uB79C\uC12C\uC6E8\uC5B4', 'ransomware', '\uB300\uADDC\uBAA8 \uC720\uCD9C', 'large-scale breach', '\uC81C\uB85C\uB370\uC774', 'zero-day', '\uB8E8\uD2B8 \uAD8C\uD55C', '\uAD6D\uAC00 \uD574\uD0B9', 'nation-state'] },
  { risk: '\uB192\uC74C', keywords: ['\uD53C\uC2F1', 'phishing', '\uC545\uC131\uCF54\uB4DC', 'malware', '\uACC4\uC815 \uD0C8\uCDE8', 'account takeover', '\uCDE8\uC57D\uC810', 'vulnerability'] },
  { risk: '\uC8FC\uC758', keywords: ['\uC815\uCC45', 'policy', '\uBCF4\uC548 \uAD8C\uACE0', 'advisory', 'guidance', '\uC5C5\uB370\uC774\uD2B8', 'update'] },
];

function decodeEntities(value = '') {
  return String(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function cleanText(value = '') {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasBalancedPairs(text = '') {
  const pairs = [
    ['(', ')'],
    ['[', ']'],
    ['{', '}'],
    ['\u2018', '\u2019'],
    ['\u201C', '\u201D'],
    ['"', '"'],
  ];

  return pairs.every(([open, close]) => {
    const openCount = [...text].filter((char) => char === open).length;
    const closeCount = [...text].filter((char) => char === close).length;

    return open === close ? openCount % 2 === 0 : openCount === closeCount;
  });
}

function hasAwkwardEnding(text = '') {
  return (
    /(\.\.\.|…)$/.test(text) ||
    /[(\[{'"“‘,;:]$/.test(text) ||
    !hasBalancedPairs(text)
  );
}

function getCompleteSentences(text = '') {
  const cleanedText = cleanText(text);

  if (!cleanedText || /(\.\.\.|…)$/.test(cleanedText)) {
    return [];
  }

  return (cleanedText.match(SENTENCE_PATTERN) || [])
    .map((sentence) => sentence.trim())
    .filter((sentence) => !hasAwkwardEnding(sentence));
}

function isUsefulSummary(summary = '', sentenceCount = 0) {
  const compactLength = summary.replace(/\s/g, '').length;

  if (!summary || sentenceCount === 0 || hasAwkwardEnding(summary)) {
    return false;
  }

  // One complete sentence can still be useful, but very short headline fragments should be hidden.
  return compactLength >= 80 || /[\uAC00-\uD7A3]{12,}.*(?:\uB2C8\uB2E4\.|\uB2E4\.|\uC694\.)$/.test(summary);
}

function makeSummary(item) {
  const summarySource = item.contentSnippet || item.content || item.description || '';
  const sentences = getCompleteSentences(summarySource);

  if (sentences.length === 0) {
    return EMPTY_SUMMARY;
  }

  let selectedSentences = sentences.slice(0, 3);

  if (selectedSentences.join(' ').length > 360 && selectedSentences.length > 2) {
    selectedSentences = selectedSentences.slice(0, 2);
  }

  if (selectedSentences.join(' ').length > 360 && selectedSentences.length > 1) {
    selectedSentences = selectedSentences.slice(0, 1);
  }

  const summary = selectedSentences.join(' ');

  return isUsefulSummary(summary, selectedSentences.length) ? summary : EMPTY_SUMMARY;
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function pickByKeyword(title = '', summary = '', rules, fallback) {
  const text = `${title} ${summary}`.toLowerCase();
  const matched = rules.find(({ keywords }) =>
    keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );

  return matched ? matched.category || matched.risk : fallback;
}

function normalizeItem(item, index) {
  const title = cleanText(item.title) || '\uC81C\uBAA9 \uC5C6\uB294 \uBCF4\uC548 \uB274\uC2A4';
  const summary = makeSummary(item);
  const category = pickByKeyword(title, summary, categoryRules, '\uAE30\uD0C0');
  const risk = pickByKeyword(title, summary, riskRules, '\uBCF4\uD1B5');

  return {
    id: index + 1,
    title,
    link: item.link || '',
    date: formatDate(item.isoDate || item.pubDate || item.date),
    summary,
    category,
    risk,
  };
}

function decodeRss(buffer) {
  const utf8Text = new TextDecoder('utf-8').decode(buffer);
  const encoding = utf8Text.match(/encoding=["']([^"']+)/i)?.[1]?.toLowerCase();

  if (encoding && (encoding.includes('euc-kr') || encoding.includes('ks_c_5601'))) {
    return new TextDecoder('euc-kr').decode(buffer);
  }

  return utf8Text;
}

async function fetchFeed(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SecurityGuide/1.0 (+https://vercel.com)',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const rssText = decodeRss(buffer);
  const feed = await parser.parseString(rssText);

  if (!feed.items || feed.items.length === 0) {
    throw new Error('RSS item\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.');
  }

  return feed;
}

async function loadFirstAvailableFeed() {
  const failures = [];

  for (const url of RSS_URLS) {
    try {
      const feed = await fetchFeed(url);
      return { feed, sourceUrl: url };
    } catch (error) {
      failures.push({
        url,
        message: error.message,
      });
    }
  }

  const failureMessage = failures.map((failure) => `${failure.url}: ${failure.message}`).join(' | ');
  throw new Error(failureMessage || '\uBAA8\uB4E0 RSS \uC694\uCCAD\uC774 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.');
}

module.exports = async function handler(req, res) {
  try {
    const { feed, sourceUrl } = await loadFirstAvailableFeed();
    const news = feed.items.slice(0, 24).map(normalizeItem);

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    res.setHeader('X-News-Source', sourceUrl);
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({
      error: '\uB274\uC2A4 RSS\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
      message: error.message,
    });
  }
};
