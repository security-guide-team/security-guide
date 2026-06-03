const newsButtons = document.querySelectorAll('.news-card-head');

newsButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.news-card');
    const isOpen = card.classList.toggle('is-open');

    button.setAttribute('aria-expanded', String(isOpen));
  });
});
