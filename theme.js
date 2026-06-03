const THEME_KEY = 'security-guide-theme';
const root = document.documentElement;

function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);

  const button = document.querySelector('.theme-toggle');
  if (!button) return;

  const isDark = theme === 'dark';
  button.setAttribute('aria-pressed', String(isDark));
  button.textContent = isDark ? '라이트모드' : '다크모드';
}

function createThemeButton() {
  const header = document.querySelector('.header');
  if (!header || document.querySelector('.theme-toggle')) return;

  const button = document.createElement('button');
  button.className = 'theme-toggle';
  button.type = 'button';
  button.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });

  header.appendChild(button);
  setTheme(root.dataset.theme || getSavedTheme());
}

setTheme(getSavedTheme());
document.addEventListener('DOMContentLoaded', createThemeButton);
