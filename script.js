const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

menuToggle.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', e => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent(`Project enquiry — ${data.get('type')}`);
  const bodyText = encodeURIComponent(
    `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nProject: ${data.get('type')}\nBudget: ${data.get('budget')}\n\n${data.get('message')}`
  );
  status.textContent = 'OPENING YOUR EMAIL APP…';
  window.location.href = `mailto:hello@phaseshiftstudio.com?subject=${subject}&body=${bodyText}`;
});
