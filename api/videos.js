const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 8000,
});

const VIDEOS_PER_CHANNEL = 6;

const CHANNELS = [
  {
    name: '\uB178\uB9D0\uD2F1',
    type: 'channel',
    value: 'UCGfK2k6fq4S9agJ82GG86cg',
  },
  {
    name: '\uBCF4\uC548\uB274\uC2A4',
    type: 'channel',
    value: 'UCCSHdGfRK0iPIAhwhLK8zfA',
  },
  {
    name: 'KISA',
    type: 'user',
    value: 'KISA118',
  },
];

const categoryRules = [
  { category: '\uD53C\uC2F1', keywords: ['\uD53C\uC2F1', '\uC2A4\uBBF8\uC2F1', '\uC0AC\uCE6D', 'phishing', 'smishing', 'scam'] },
  { category: '\uB79C\uC12C\uC6E8\uC5B4', keywords: ['\uB79C\uC12C\uC6E8\uC5B4', 'ransomware', '\uC554\uD638\uD654', '\uBCF5\uAD6C\uBE44', '\uAC08\uCDE8'] },
  { category: '\uCDE8\uC57D\uC810', keywords: ['\uCDE8\uC57D\uC810', 'cve', 'vulnerability', 'exploit', 'zero-day', '\uC81C\uB85C\uB370\uC774', '\uD328\uCE58'] },
  { category: '\uAC1C\uC778\uC815\uBCF4', keywords: ['\uAC1C\uC778\uC815\uBCF4', 'privacy', 'data leak', '\uC720\uCD9C', '\uACC4\uC815', '\uC778\uC99D\uC815\uBCF4'] },
  { category: '\uC815\uCC45/\uACF5\uACF5', keywords: ['\uC815\uBD80', '\uACF5\uACF5', '\uC815\uCC45', 'cisa', 'kisa', 'nist', '\uAE30\uAD00'] },
  { category: '\uC6F9\uBCF4\uC548', keywords: ['\uC6F9\uBCF4\uC548', 'xss', 'sql injection', 'sqli', 'csrf', 'owasp', '\uD574\uD0B9'] },
];

function getYoutubeRssUrl(channel) {
  if (channel.type === 'user') {
    return `https://www.youtube.com/feeds/videos.xml?user=${channel.value}`;
  }

  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.value}`;
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

function classifyCategory(title = '') {
  const text = title.toLowerCase();
  const matched = categoryRules.find(({ keywords }) =>
    keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );

  return matched ? matched.category : '\uAE30\uD0C0';
}

function extractVideoId(item) {
  try {
    const url = new URL(item.link);
    const videoId = url.searchParams.get('v');

    if (videoId) {
      return videoId;
    }
  } catch (error) {
    // Fall through to item.id parsing.
  }

  const idMatch = String(item.id || '').match(/yt:video:([^:]+)/);
  return idMatch ? idMatch[1] : '';
}

function normalizeVideo(item, channel) {
  const videoId = extractVideoId(item);

  if (!videoId) {
    return null;
  }

  const rawDate = item.isoDate || item.pubDate || item.published || new Date().toISOString();
  const title = item.title || '\uC81C\uBAA9 \uC5C6\uB294 \uC601\uC0C1';

  return {
    title,
    link: item.link || `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    date: formatDate(rawDate),
    rawDate,
    channel: channel.name,
    category: classifyCategory(title),
    source: 'YouTube',
  };
}

async function fetchChannelVideos(channel) {
  const feed = await parser.parseURL(getYoutubeRssUrl(channel));

  return (feed.items || [])
    .map((item) => normalizeVideo(item, channel))
    .filter(Boolean)
    .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
    .slice(0, VIDEOS_PER_CHANNEL);
}

module.exports = async function handler(req, res) {
  const settled = await Promise.allSettled(CHANNELS.map(fetchChannelVideos));
  const failedChannels = [];
  const sourceStatus = [];
  const videosById = new Map();

  settled.forEach((result, index) => {
    const channel = CHANNELS[index];

    if (result.status === 'rejected') {
      sourceStatus.push({
        name: channel.name,
        status: 'failed',
        count: 0,
      });
      failedChannels.push({
        name: channel.name,
        value: channel.value,
        message: result.reason.message,
      });
      return;
    }

    sourceStatus.push({
      name: channel.name,
      status: 'success',
      count: result.value.length,
    });

    result.value.forEach((video) => {
      if (!videosById.has(video.videoId)) {
        videosById.set(video.videoId, video);
      }
    });
  });

  const videos = [...videosById.values()]
    .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
    .map(({ rawDate, ...video }, index) => ({
      id: index + 1,
      ...video,
    }));

  if (!videos.length) {
    res.status(500).json({
      error: '\uC720\uD29C\uBE0C RSS\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.',
      failedChannels,
      sourceStatus,
    });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
  res.status(200).json({
    videos,
    failedChannels,
    sourceStatus,
  });
};
