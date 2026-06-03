const commonPasswords = [
  'password',
  'qwerty',
  '123456',
  '12345678',
  '111111',
  'abc123',
  'admin',
  'letmein',
  'iloveyou',
  'welcome',
];

const phishingSignals = [
  { pattern: /긴급|즉시|오늘 안에|마감|정지|차단|만료/g, weight: 12, label: '긴급하게 행동을 유도하는 표현' },
  { pattern: /비밀번호|인증번호|계좌|카드|주민등록|개인정보/g, weight: 16, label: '민감한 정보 입력 요구' },
  { pattern: /클릭|링크|접속|로그인|본인 인증|확인하기/g, weight: 12, label: '링크 클릭이나 로그인을 유도' },
  { pattern: /무료|당첨|쿠폰|환급|지원금|보상|이벤트/g, weight: 10, label: '금전, 보상, 쿠폰으로 유혹' },
  { pattern: /http:\/\/|bit\.ly|tinyurl|shorturl|t\.co/g, weight: 14, label: '안전하지 않거나 짧은 링크 포함' },
  { pattern: /은행|택배|관세청|국세청|경찰|검찰|카카오|네이버|구글/g, weight: 8, label: '기관이나 유명 서비스를 사칭할 가능성' },
];

const suspiciousUrlWords = [
  'login',
  'verify',
  'update',
  'secure',
  'account',
  'bank',
  'free',
  'gift',
  'event',
  'coupon',
  'password',
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setResult(target, percent, title, details, mode = 'risk') {
  const level =
    mode === 'strength'
      ? percent >= 70
        ? 'result-safe'
        : percent >= 40
          ? 'result-medium'
          : 'result-high'
      : percent >= 70
        ? 'result-high'
        : percent >= 40
          ? 'result-medium'
          : 'result-low';

  target.className = `result-box ${level}`;
  target.querySelector('.meter span').style.width = `${percent}%`;
  target.querySelector('strong').textContent = title;

  const body = details.length
    ? `<ul>${details.map((item) => `<li>${item}</li>`).join('')}</ul>`
    : '<p>특별히 큰 위험 신호는 발견되지 않았습니다.</p>';

  target.querySelector('p')?.remove();
  target.querySelector('ul')?.remove();
  target.insertAdjacentHTML('beforeend', body);
}

function analyzePassword() {
  const password = document.getElementById('passwordInput').value;
  const result = document.getElementById('passwordResult');
  const reasons = [];
  let score = 0;

  if (!password) {
    setResult(result, 0, '비밀번호를 입력해주세요.', ['빈 값은 진단할 수 없습니다.'], 'risk');
    return;
  }

  if (password.length >= 12) score += 28;
  else if (password.length >= 8) score += 16;
  else reasons.push('길이가 짧습니다. 최소 12자 이상을 권장합니다.');

  if (/[a-z]/.test(password)) score += 12;
  else reasons.push('영문 소문자가 없습니다.');

  if (/[A-Z]/.test(password)) score += 12;
  else reasons.push('영문 대문자가 없습니다.');

  if (/\d/.test(password)) score += 12;
  else reasons.push('숫자가 없습니다.');

  if (/[^A-Za-z0-9]/.test(password)) score += 16;
  else reasons.push('특수문자가 없습니다.');

  if (!/(.)\1{2,}/.test(password)) score += 10;
  else reasons.push('같은 문자가 3번 이상 반복됩니다.');

  if (!/0123|1234|2345|3456|4567|5678|6789|abcd|qwer/i.test(password)) score += 10;
  else reasons.push('연속된 문자나 키보드 패턴이 포함되어 있습니다.');

  if (commonPasswords.some((word) => password.toLowerCase().includes(word))) {
    score -= 22;
    reasons.push('많이 사용되는 쉬운 단어가 포함되어 있습니다.');
  }

  const finalScore = clamp(score, 5, 100);
  const title =
    finalScore >= 80
      ? `안전도 ${finalScore}%: 강한 비밀번호입니다.`
      : finalScore >= 50
        ? `안전도 ${finalScore}%: 보완이 필요합니다.`
        : `안전도 ${finalScore}%: 위험한 비밀번호입니다.`;

  const advice = reasons.length
    ? reasons
    : ['길이와 문자 조합이 좋습니다.', '다른 서비스와 같은 비밀번호를 재사용하지 마세요.'];

  setResult(result, finalScore, title, advice, 'strength');
}

function analyzeMail() {
  const text = document.getElementById('mailInput').value.trim();
  const result = document.getElementById('mailResult');
  const reasons = [];
  let risk = 8;

  if (!text) {
    setResult(result, 0, '메일 내용을 입력해주세요.', ['제목이나 본문 일부만 넣어도 진단할 수 있습니다.']);
    return;
  }

  phishingSignals.forEach((signal) => {
    const matches = text.match(signal.pattern);
    if (matches) {
      risk += signal.weight + Math.min(matches.length * 3, 10);
      reasons.push(signal.label);
    }
  });

  if (/[^\s]+@[^\s]+\.[^\s]+/.test(text) && !/@(naver|kakao|google|gmail|daum)\./i.test(text)) {
    risk += 8;
    reasons.push('낯선 발신자 주소나 연락처가 포함되어 있을 수 있습니다.');
  }

  if ((text.match(/https?:\/\//g) || []).length >= 2) {
    risk += 10;
    reasons.push('본문 안에 링크가 여러 개 있습니다.');
  }

  const percent = clamp(risk, 5, 96);
  const title =
    percent >= 70
      ? `피싱 의심 ${percent}%: 바로 클릭하지 마세요.`
      : percent >= 40
        ? `피싱 의심 ${percent}%: 추가 확인이 필요합니다.`
        : `피싱 의심 ${percent}%: 위험 신호가 적습니다.`;

  setResult(result, percent, title, reasons);
}

function normalizeUrl(input) {
  if (/^https?:\/\//i.test(input)) return input;
  return `https://${input}`;
}

function analyzeUrl() {
  const rawUrl = document.getElementById('urlInput').value.trim();
  const result = document.getElementById('urlResult');
  const reasons = [];
  let risk = 6;

  if (!rawUrl) {
    setResult(result, 0, 'URL을 입력해주세요.', ['예: https://example.com/login']);
    return;
  }

  try {
    const url = new URL(normalizeUrl(rawUrl));
    const host = url.hostname.toLowerCase();

    if (url.protocol !== 'https:') {
      risk += 24;
      reasons.push('HTTPS가 아닌 주소입니다. 로그인이나 결제에 사용하면 위험합니다.');
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      risk += 24;
      reasons.push('도메인 대신 IP 주소를 사용합니다.');
    }

    if (host.includes('xn--')) {
      risk += 18;
      reasons.push('문자가 비슷해 보이도록 만든 국제화 도메인일 수 있습니다.');
    }

    if ((host.match(/-/g) || []).length >= 2 || host.length > 32) {
      risk += 12;
      reasons.push('도메인이 지나치게 길거나 하이픈이 많습니다.');
    }

    if (/(bit\.ly|tinyurl\.com|t\.co|goo\.gl|shorturl)/i.test(host)) {
      risk += 22;
      reasons.push('짧은 URL은 실제 목적지를 숨길 수 있습니다.');
    }

    if (suspiciousUrlWords.some((word) => url.href.toLowerCase().includes(word))) {
      risk += 12;
      reasons.push('로그인, 인증, 보상 등 피싱에 자주 쓰이는 단어가 포함되어 있습니다.');
    }

    if (url.username || url.password) {
      risk += 20;
      reasons.push('주소 안에 계정 정보처럼 보이는 문자열이 포함되어 있습니다.');
    }

    if ((url.href.match(/@/g) || []).length > 0) {
      risk += 18;
      reasons.push('@ 문자가 포함된 URL은 실제 접속 위치를 헷갈리게 만들 수 있습니다.');
    }

    const percent = clamp(risk, 5, 96);
    const title =
      percent >= 70
        ? `URL 위험도 ${percent}%: 접속을 피하세요.`
        : percent >= 40
          ? `URL 위험도 ${percent}%: 출처 확인 후 접속하세요.`
          : `URL 위험도 ${percent}%: 큰 위험 신호는 적습니다.`;

    setResult(result, percent, title, reasons);
  } catch {
    setResult(result, 75, 'URL 형식이 올바르지 않습니다.', [
      '정상적인 주소인지 다시 확인하세요.',
      '의심스러운 문자나 공백이 섞여 있을 수 있습니다.',
    ]);
  }
}

document.getElementById('passwordCheck').addEventListener('click', analyzePassword);
document.getElementById('mailCheck').addEventListener('click', analyzeMail);
document.getElementById('urlCheck').addEventListener('click', analyzeUrl);

document.getElementById('togglePassword').addEventListener('click', (event) => {
  const input = document.getElementById('passwordInput');
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  event.currentTarget.setAttribute('aria-label', isHidden ? '비밀번호 숨기기' : '비밀번호 보기');
  event.currentTarget.setAttribute('aria-pressed', String(isHidden));
});
