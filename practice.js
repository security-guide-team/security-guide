/* =========================================================
   practice.js - OWASP Top 10 대화형 실습 스크립트
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // 전역 상태
  let currentTab = 'xss';
  let badXssAlertTriggered = false;
  
  // 1234 비밀번호 상수
  const CORRECT_PASSWORD = '1234';

  // 로컬 스토리지 초기 설정
  if (!localStorage.getItem('role')) {
    localStorage.setItem('role', 'user');
  }

  // =========================================================
  // 1. 공통 모달 및 코드 복사 제어
  // =========================================================
  const modalOverlay = document.getElementById('practiceModal');
  const modalCloseBtn = modalOverlay.querySelector('.modal-close-btn');
  const modalConfirmBtn = modalOverlay.querySelector('#modalConfirmBtn');
  const copyBtn = modalOverlay.querySelector('.modal-copy-btn');

  function openModal(title, badgeText, description, codeText) {
    modalOverlay.querySelector('.modal-title').textContent = title;
    modalOverlay.querySelector('.modal-badge').textContent = badgeText;
    modalOverlay.querySelector('#modalDescription').innerHTML = description;
    
    const codeContainer = modalOverlay.querySelector('.modal-code code');
    if (codeText) {
      modalOverlay.querySelector('.modal-code-wrap').style.display = 'block';
      codeContainer.textContent = codeText;
    } else {
      modalOverlay.querySelector('.modal-code-wrap').style.display = 'none';
      codeContainer.textContent = '';
    }

    modalOverlay.classList.add('active');
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  modalCloseBtn.addEventListener('click', closeModal);
  modalConfirmBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  copyBtn.addEventListener('click', () => {
    const codeText = modalOverlay.querySelector('.modal-code code').textContent;
    navigator.clipboard.writeText(codeText).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '복사 완료!';
      copyBtn.style.background = 'var(--good-color)';
      copyBtn.style.borderColor = 'var(--good-color)';
      copyBtn.style.color = '#ffffff';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
        copyBtn.style.borderColor = '';
        copyBtn.style.color = '';
      }, 2000);
    });
  });


  // =========================================================
  // 2. alert 감지 (XSS 실습용)
  // =========================================================
  const originalAlert = window.alert;
  window.alert = function (message) {
    // 기본 alert 호출
    originalAlert(message);

    // XSS 실습 페이지이며, 아직 모달이 트리거되지 않았을 때만 실행
    if (currentTab === 'xss' && !badXssAlertTriggered) {
      badXssAlertTriggered = true;
      
      openModal(
        '공격 성공: A05:2025 - Injection (XSS)',
        'XSS (Cross-Site Scripting)',
        `<p><strong>축하합니다! 취약점 공격에 성공하셨습니다.</strong></p>
         <p>방명록 입력창에 입력한 악성 스크립트 <code>&lt;img src=x onerror=alert('...')&gt;</code>가 그대로 웹 페이지에 렌더링되면서 자바스크립트가 실행되었습니다.</p>
         <p>이것은 <strong>innerHTML</strong>을 사용하여 유저 입력을 소스 코드로 브라우저에 전달했기 때문입니다. 공격자는 이 방식을 통해 다른 유저의 쿠키를 가로채거나 세션을 탈취할 수 있습니다.</p>
         <p><strong>대응 방안:</strong> 텍스트 데이터를 노출할 때는 <code>textContent</code>를 사용하거나, 특수기호(&lt;, &gt;, &amp;, ", ')를 안전한 HTML 엔티티로 치환하여 실행 불가능한 문자열로 만들어야 합니다.</p>`,
        `// 안전한 대응 방안 예시
const userContent = input.value;
const div = document.createElement('div');
div.textContent = userContent; // 텍스트로 안전하게 바인딩
list.appendChild(div);`
      );
    }
  };


  // =========================================================
  // 3. 실습 탭 전환
  // =========================================================
  const tabs = document.querySelectorAll('.practice-tab');
  const sections = document.querySelectorAll('.challenge-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      currentTab = target;

      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`${target}-challenge`).classList.add('active');

      // 탭 전환 시 코드 뷰어 업데이트
      updateCodeViewer(target);
    });
  });


  // =========================================================
  // 4. [실습 1] Injection - XSS 로직
  // =========================================================
  const badXssInput = document.getElementById('badXssInput');
  const badXssSubmit = document.getElementById('badXssSubmit');
  const badXssList = document.getElementById('badXssList');

  const goodXssInput = document.getElementById('goodXssInput');
  const goodXssSubmit = document.getElementById('goodXssSubmit');
  const goodXssList = document.getElementById('goodXssList');

  // BAD (취약): innerHTML 사용
  badXssSubmit.addEventListener('click', () => {
    const val = badXssInput.value.trim();
    if (!val) return;

    const item = document.createElement('div');
    item.className = 'guestbook-item';
    item.innerHTML = val; // 취약점 발생 지점
    badXssList.appendChild(item);
    badXssList.scrollTop = badXssList.scrollHeight;
    
    badXssInput.value = '';
  });

  // GOOD (안전): textContent 사용
  goodXssSubmit.addEventListener('click', () => {
    const val = goodXssInput.value.trim();
    if (!val) return;

    const item = document.createElement('div');
    item.className = 'guestbook-item';
    item.textContent = val; // 안전한 출력 바인딩
    goodXssList.appendChild(item);
    goodXssList.scrollTop = goodXssList.scrollHeight;
    
    goodXssInput.value = '';

    // 만약 사용자가 공격 코드를 시도했다면, 안전함을 직접 안내
    if (val.includes('<img') || val.includes('onerror') || val.includes('<script')) {
      setTimeout(() => {
        openModal(
          '방어 성공: XSS 필터링 적용',
          '보안 조치 완효',
          `<p><strong>공격이 성공적으로 방어되었습니다!</strong></p>
           <p>안전한 모드에서는 <code>element.textContent</code>를 사용하여 입력된 악성 태그와 스크립트를 코드가 아닌 단순 '문자열(String)'로 안전하게 렌더링합니다.</p>
           <p>그 결과 브라우저는 스크립트를 실행하지 않고 화면에 문자열 그대로 출력합니다.</p>`,
          `// HTML Entity 변환 방식 (직접 구현 예시)
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}`
        );
      }, 500);
    }
  });


  // =========================================================
  // 5. [실습 2] Broken Access Control 로직
  // =========================================================
  const badAdminDashboard = document.getElementById('badAdminDashboard');
  const badDeleteButtons = document.querySelectorAll('.bad-delete-btn');
  const goodRoleBadge = document.getElementById('goodRoleBadge');
  const goodApiLog = document.getElementById('goodApiLog');
  const callGoodApiBtn = document.getElementById('callGoodApiBtn');
  
  let badAccessControlAlertTriggered = false;

  // LocalStorage 감시용 인터벌
  setInterval(() => {
    const currentRole = localStorage.getItem('role') || 'user';
    
    // BAD 측 로직: 로컬 스토리지 값만 보고 비밀 관리자 창 활성화
    if (currentRole === 'admin') {
      if (badAdminDashboard.style.display !== 'block') {
        badAdminDashboard.style.display = 'block';
        
        // BAD 역할 배지 업데이트
        document.getElementById('badRoleBadge').textContent = 'admin';
        document.getElementById('badRoleBadge').className = 'role-badge admin';

        if (!badAccessControlAlertTriggered && currentTab === 'access') {
          badAccessControlAlertTriggered = true;
          openModal(
            '공격 성공: A01:2025 - Broken Access Control',
            '접근 통제 우회',
            `<p><strong>로컬 스토리지 변조를 통한 관리자 페이지 우회에 성공했습니다!</strong></p>
             <p>개발자 도구(F12)에서 <code>role</code> 값을 <code>admin</code>으로 수정하자마자, 클라이언트 스크립트가 이를 감지하여 비밀 대시보드 창을 띄웠습니다.</p>
             <p>클라이언트 측 변조(JavaScript 변수 조작, LocalStorage 수정, Cookie 변조 등)는 공격자가 얼마든지 조작할 수 있으므로 화면 제어에만 사용하는 수준에 그쳐야 합니다.</p>
             <p><strong>대응 방안:</strong> 화면을 보여주거나 민감 데이터를 내려받는 모든 행위는 서버 측에서 반드시 사용자 토큰(JWT, Session)을 검증하여 권한 여부를 체크해야 합니다.</p>`,
            `// 취약한 클라이언트 단 전용 검사
if (localStorage.getItem('role') === 'admin') {
  adminDashboard.style.display = 'block'; // 화면 노출만 차단하면 해킹에 취약함
}`
          );
        }
      }
    } else {
      badAdminDashboard.style.display = 'none';
      document.getElementById('badRoleBadge').textContent = 'user';
      document.getElementById('badRoleBadge').className = 'role-badge';
      badAccessControlAlertTriggered = false;
    }
  }, 800);

  // BAD 대시보드 회원 삭제 버튼 클릭 시 시뮬레이션
  badDeleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const username = e.target.dataset.user;
      originalAlert(`[BAD] 클라이언트 즉시 차단 해제 상태: ${username} 회원 정보가 데이터베이스에서 삭제되었습니다. (실제 검증 생략됨)`);
    });
  });

  // GOOD 측 로직: 클라이언트 조작 감지 및 서버 측 API 차단 시뮬레이션
  callGoodApiBtn.addEventListener('click', () => {
    const currentRole = localStorage.getItem('role') || 'user';
    
    // 배지 상태 표시는 클라이언트 조작에 맞춰지더라도
    if (currentRole === 'admin') {
      goodRoleBadge.textContent = 'admin';
      goodRoleBadge.className = 'role-badge admin';
    } else {
      goodRoleBadge.textContent = 'user';
      goodRoleBadge.className = 'role-badge';
    }

    goodApiLog.innerHTML = `<span style="color: #88c0d0;">[API Request]</span> GET /api/admin/users<br>Authorization: Bearer mock-jwt-token-role-${currentRole}...<br>호출 중...`;
    
    setTimeout(() => {
      if (currentRole === 'admin') {
        // 로컬스토리지는 admin이지만 실제 서버(가상)는 거부
        goodApiLog.innerHTML += `<br><span style="color: #ff6b6b;">[API Response] 403 Forbidden</span><br>Error: "Access Denied. 실제 세션 서명 토큰 검증 실패."`;
        
        openModal(
          '방어 성공: 서버 단 토큰 권한 검증 적용',
          '보안 대응 완료',
          `<p><strong>서버 측 API 토큰 검증을 통해 회원 정보 노출이 안전하게 방어되었습니다!</strong></p>
           <p>비록 클라이언트에서 로컬 스토리지를 <code>admin</code>으로 변조하더라도, 서버 API 호출 시 제공되는 JWT/세션 서명 토큰은 여전히 <code>user</code> 권한이거나 유효하지 않기 때문에 서버가 요청을 거부합니다 (403 Forbidden).</p>
           <p>이와 같이 프론트엔드의 화면 디자인 조작과 무관하게, 실제 데이터베이스 제어나 비즈니스 로직은 **서버에서 반드시 다시 검증**해야만 완벽한 접근 제어를 이룰 수 있습니다.</p>`,
          `// 안전한 서버 측 API 검증 (Node.js/Express 예시)
app.get('/api/admin/users', checkAuth, checkRole('admin'), (req, res) => {
  // 토큰 유효성 및 역할(admin) 검사가 통과되었을 때만 데이터 응답
  res.json(db.users.getAll());
});`
        );
      } else {
        goodApiLog.innerHTML += `<br><span style="color: #ff6b6b;">[API Response] 403 Forbidden</span><br>Error: "일반 사용자(user)는 접근 권한이 없습니다."`;
      }
    }, 1000);
  });


  // =========================================================
  // 6. [실습 3] Authentication - Brute Force 로직
  // =========================================================
  const badLoginBtn = document.getElementById('badLoginBtn');
  const badSimBtn = document.getElementById('badSimBtn');
  const badSimNum = document.getElementById('badSimNum');
  const badSimFill = document.getElementById('badSimFill');
  const badPwInput = document.getElementById('badPwInput');

  const goodLoginBtn = document.getElementById('goodLoginBtn');
  const goodSimBtn = document.getElementById('goodSimBtn');
  const goodSimNum = document.getElementById('goodSimNum');
  const goodSimFill = document.getElementById('goodSimFill');
  const goodPwInput = document.getElementById('goodPwInput');
  const goodLockoutOverlay = document.getElementById('goodLockoutOverlay');
  const goodLockoutTimer = document.getElementById('goodLockoutTimer');

  let badSimInterval = null;
  let goodSimInterval = null;
  let goodFailCount = 0;
  let goodIsLocked = false;
  let goodLockoutSec = 30;
  let goodLockoutInterval = null;

  // BAD: 무차별 대입 시뮬레이터
  badSimBtn.addEventListener('click', () => {
    if (badSimInterval) {
      clearInterval(badSimInterval);
      badSimInterval = null;
      badSimBtn.textContent = '공격 시작';
      badSimBtn.style.background = '';
      return;
    }

    badSimBtn.textContent = '공격 중지';
    badSimBtn.style.background = 'var(--bad-color)';
    let currentPw = 0;
    const startTime = Date.now();

    badSimInterval = setInterval(() => {
      // 4자리 패딩
      const pwStr = String(currentPw).padStart(4, '0');
      badSimNum.textContent = pwStr;
      badPwInput.value = pwStr;
      
      const progressPercent = (currentPw / 9999) * 100;
      badSimFill.style.width = `${progressPercent}%`;

      // 로그인 시도
      if (pwStr === CORRECT_PASSWORD) {
        clearInterval(badSimInterval);
        badSimInterval = null;
        badSimBtn.textContent = '공격 성공';
        badSimBtn.disabled = true;
        badLoginBtn.style.background = 'var(--bad-color)';
        
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
        
        openModal(
          '공격 성공: A07:2025 - Authentication Failures',
          '무차별 대입 돌파',
          `<p><strong>무차별 대입(Brute Force) 공격을 통해 1.5초 만에 로그인에 성공했습니다!</strong></p>
           <p>시도 횟수: <code>${currentPw + 1}</code>회</p>
           <p>소요 시간: <code>${elapsedSec}</code>초</p>
           <p>취약한 환경에서는 로그인 시도 실패 횟수에 제한이 없기 때문에, 공격자가 자동화 툴(딕셔너리 공격, 브루트 포스 등)을 가동하면 순식간에 비밀번호를 무작위로 주입하여 뚫릴 수밖에 없습니다.</p>
           <p><strong>대응 방안:</strong> 5회 연속 로그인 실패 시 계정을 일정 시간 잠그거나(Account Lockout), IP별 로그인 요청 주기에 제한을 두어야 합니다. 또한 CAPTCHA 등을 적용하여 봇에 의한 자동 요청을 지연/방지해야 합니다.</p>`,
          `// 취약한 로그인 로직 (제한 부재)
function handleLogin(pw) {
  if (pw === CORRECT_PASSWORD) {
    loginSuccess();
  } else {
    showError("비밀번호 불일치");
  }
}`
        );
      }

      currentPw++;
      if (currentPw > 9999) {
        clearInterval(badSimInterval);
        badSimInterval = null;
        badSimBtn.textContent = '공격 실패';
      }
    }, 4);
  });

  // GOOD: 무차별 대입 시뮬레이터 (차단됨)
  goodSimBtn.addEventListener('click', () => {
    if (goodIsLocked) return;

    if (goodSimInterval) {
      clearInterval(goodSimInterval);
      goodSimInterval = null;
      goodSimBtn.textContent = '공격 시작';
      goodSimBtn.style.background = '';
      return;
    }

    goodSimBtn.textContent = '공격 중지';
    goodSimBtn.style.background = 'var(--bad-color)';
    let currentPw = 0;

    goodSimInterval = setInterval(() => {
      const pwStr = String(currentPw).padStart(4, '0');
      goodSimNum.textContent = pwStr;
      goodPwInput.value = pwStr;
      
      const progressPercent = (currentPw / 9999) * 100;
      goodSimFill.style.width = `${progressPercent}%`;

      // GOOD 측 로그인 검사
      if (pwStr === CORRECT_PASSWORD) {
        // 성공 (하지만 가상 차단에 걸릴 것임)
        clearInterval(goodSimInterval);
        goodSimInterval = null;
        goodSimBtn.textContent = '공격 완료';
      } else {
        goodFailCount++;
        // 5회 도달 시 차단
        if (goodFailCount >= 5) {
          clearInterval(goodSimInterval);
          goodSimInterval = null;
          goodSimBtn.textContent = '공격 차단됨';
          goodSimBtn.disabled = true;

          triggerGoodLockout();
        }
      }

      currentPw++;
    }, 8);
  });

  // 계정 잠금 활성화
  function triggerGoodLockout() {
    goodIsLocked = true;
    goodPwInput.disabled = true;
    goodLoginBtn.disabled = true;
    
    goodLockoutOverlay.style.display = 'flex';
    goodLockoutSec = 30;
    goodLockoutTimer.textContent = `${goodLockoutSec}초`;

    // 락아웃 타이머 작동
    goodLockoutInterval = setInterval(() => {
      goodLockoutSec--;
      goodLockoutTimer.textContent = `${goodLockoutSec}초`;
      
      // 프로그레스 바 동적 표현
      const overlayFill = goodLockoutOverlay.querySelector('.lockout-progress-fill');
      overlayFill.style.width = `${(goodLockoutSec / 30) * 100}%`;

      if (goodLockoutSec <= 0) {
        clearInterval(goodLockoutInterval);
        goodLockoutOverlay.style.display = 'none';
        
        // 락아웃 해제
        goodIsLocked = false;
        goodFailCount = 0;
        goodPwInput.disabled = false;
        goodLoginBtn.disabled = false;
        goodPwInput.value = '';
        goodSimNum.textContent = '0000';
        goodSimFill.style.width = '0%';
        
        goodSimBtn.disabled = false;
        goodSimBtn.textContent = '공격 시작';
        goodSimBtn.style.background = '';
      }
    }, 1000);

    openModal(
      '방어 성공: A07:2025 - 계정 잠금 정책 적용',
      '무차별 대입 방어',
      `<p><strong>계정 잠금 정책이 무차별 대입 공격을 차단해냈습니다!</strong></p>
       <p>연속 로그인 실패 횟수가 <code>5회</code>에 도달하자마자, 로그인 창이 <code>30초 동안 잠금(Disabled)</code> 모드로 전환되었습니다.</p>
       <p>이로 인해 자동 공격 툴의 주입 시도가 즉시 중단되었으며, 공격자는 잠금 시간 동안 더 이상 패스워드를 대입해볼 수 없게 되어 공격에 많은 자원과 시간이 발생하게 됩니다.</p>
       <p>실제 서비스 환경에서는 데이터베이스에 계정별 '실패 카운트' 및 '잠금 해제 시간' 컬럼을 두고 백엔드에서 로그인을 영구 혹은 일시 차단하여 방어합니다.</p>`,
      `// 로그인 실패 및 계정 잠금 검증 로직
function processLogin(username, password) {
  if (isAccountLocked(username)) {
    return { success: false, msg: "계정이 잠겼습니다. 나중에 다시 시도하세요." };
  }
  
  if (validatePassword(username, password)) {
    resetFailCount(username);
    return { success: true };
  } else {
    incrementFailCount(username);
    if (getFailCount(username) >= 5) {
      lockAccount(username, 30); // 30초 락아웃
    }
    return { success: false, msg: "비밀번호 오류" };
  }
}`
    );
  }

  // GOOD 측 로그인 폼 직접 수동 제출 테스트 지원
  goodLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (goodIsLocked) return;
    
    const pw = goodPwInput.value.trim();
    if (pw === CORRECT_PASSWORD) {
      goodFailCount = 0;
      originalAlert('로그인 성공! (GOOD)');
    } else {
      goodFailCount++;
      if (goodFailCount >= 5) {
        triggerGoodLockout();
      } else {
        originalAlert(`로그인 실패! (오류 횟수: ${goodFailCount}/5)`);
      }
    }
  });

  badLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const pw = badPwInput.value.trim();
    if (pw === CORRECT_PASSWORD) {
      originalAlert('로그인 성공! (BAD)');
    } else {
      originalAlert('비밀번호가 올바르지 않습니다. (실패 횟수 제한 없음)');
    }
  });


  // =========================================================
  // 7. 실시간 코드 하이라이터 & 코드 스니펫 목록
  // =========================================================
  const codeSnippets = {
    xss: {
      bad: `// [VULN] 취약한 innerHTML 사용
const guestbookInput = document.getElementById('bad-input').value;
const listItem = document.createElement('div');

// 사용자 입력을 안전 검증 없이 HTML 코드로 파싱 및 화면에 즉시 렌더링
listItem.innerHTML = guestbookInput; 
guestbookList.appendChild(listItem);`,
      good: `// [SECURE] 안전한 textContent 적용
const guestbookInput = document.getElementById('good-input').value;
const listItem = document.createElement('div');

// 사용자 입력을 순수 텍스트 문자열(String)로만 안전하게 파싱하여 렌더링
listItem.textContent = guestbookInput; 
guestbookList.appendChild(listItem);`
    },
    access: {
      bad: `// [VULN] 로컬 스토리지에만 전적으로 의존하는 권한 제어
setInterval(() => {
  const userRole = localStorage.getItem('role');
  
  // 클라이언트의 로컬 스토리지는 사용자가 F12 등을 통해 임의 변조 가능함
  if (userRole === 'admin') {
    adminDashboard.style.display = 'block'; // UI 화면 노출 차단만으로 방어 불가
  }
}, 1000);`,
      good: `// [SECURE] 백엔드 서버 측 API 토큰 유효성 권한 재검증
async function loadAdminDashboard() {
  // 클라이언트가 관리자 화면 조작을 시도하여 API를 직접 호출하더라도
  const res = await fetch('/api/admin/users', {
    headers: { 'Authorization': \`Bearer \${jwtToken}\` }
  });
  
  if (res.status === 403) {
    showErrorMessage("권한이 없어 조회를 거부합니다. (서버 측 재검증)");
    return;
  }
  
  renderData(await res.json());
}`
    },
    brute: {
      bad: `// [VULN] 로그인 횟수 실패 차단이 부재한 경우
function authenticateUser(user, password) {
  const correct = db.getPassword(user);
  if (password === correct) {
    return generateSession();
  } else {
    // 횟수 제어나 타임아웃 제한이 없어 무차별 대입 공격에 무기력하게 노출됨
    throw new AuthenticationError("비밀번호 불일치");
  }
}`,
      good: `// [SECURE] 5회 로그인 오류 시 일시적 계정 잠금 정책 적용 (Account Lockout)
let failCounter = {};
let lockTimeouts = {};

function authenticateSecure(user, password) {
  if (lockTimeouts[user] && Date.now() < lockTimeouts[user]) {
    throw new LockoutError("계정 일시 정지 상태입니다.");
  }
  
  if (password === db.getPassword(user)) {
    failCounter[user] = 0;
    return generateSession();
  } else {
    failCounter[user] = (failCounter[user] || 0) + 1;
    if (failCounter[user] >= 5) {
      lockTimeouts[user] = Date.now() + (30 * 1000); // 30초 잠금 등록
      throw new LockoutError("5회 인증 오류로 인해 계정이 30초간 차단됩니다.");
    }
    throw new AuthenticationError("비밀번호 불일치");
  }
}`
    }
  };

  function highlightJs(code) {
    if (!code) return '';
    let html = code;
    
    // HTML 엔티티 사전 변환
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // 주석 하이라이트
    html = html.replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>');
    
    // 문자열 하이라이트
    html = html.replace(/(["'`])(.*?)\1/g, '<span class="code-string">$1$2$1</span>');
    
    // 키워드
    const keywords = ['const', 'let', 'var', 'function', 'if', 'else', 'return', 'async', 'await', 'throw', 'new'];
    keywords.forEach(keyword => {
      const reg = new RegExp(`\\b${keyword}\\b`, 'g');
      html = html.replace(reg, `<span class="code-keyword">${keyword}</span>`);
    });

    // 특정 함수나 프로퍼티 강조
    const functions = ['innerHTML', 'textContent', 'getItem', 'fetch', 'authenticateSecure', 'authenticateUser'];
    functions.forEach(func => {
      const reg = new RegExp(`\\b${func}\\b`, 'g');
      html = html.replace(reg, `<span class="code-function">${func}</span>`);
    });

    // 라인별 가공 (위험 라인 / 안전 라인 테두리)
    html = html.split('\n').map(line => {
      if (line.includes('[VULN]') || line.includes('innerHTML') || line.includes('role === \'admin\'') || line.includes('AuthenticationError')) {
        if (!line.includes('class="code-comment"')) {
          return `<span class="code-danger-line">${line}</span>`;
        }
      }
      if (line.includes('[SECURE]') || line.includes('textContent') || line.includes('fetch(') || line.includes('LockoutError') || line.includes('lockTimeouts')) {
        if (!line.includes('class="code-comment"')) {
          return `<span class="code-success-line">${line}</span>`;
        }
      }
      return line;
    }).join('\n');

    return html;
  }

  function updateCodeViewer(tab) {
    const badCodeEl = document.querySelector('#badCodeBlock code');
    const goodCodeEl = document.querySelector('#goodCodeBlock code');

    const snippet = codeSnippets[tab];
    if (snippet) {
      badCodeEl.innerHTML = highlightJs(snippet.bad);
      goodCodeEl.innerHTML = highlightJs(snippet.good);
    }
  }

  // 초기 뷰어 렌더링
  updateCodeViewer('xss');
});
