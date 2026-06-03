const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');

function showContactStatus(message, type = 'success') {
  contactStatus.textContent = message;
  contactStatus.className = `form-status visible ${type === 'error' ? 'error' : ''}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    showContactStatus('이름, 이메일, 문의 내용을 모두 입력해주세요.', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showContactStatus('이메일 형식을 다시 확인해주세요.', 'error');
    return;
  }

  showContactStatus('의견이 접수되었습니다. 확인 후 참고하겠습니다.');
  contactForm.reset();
});
