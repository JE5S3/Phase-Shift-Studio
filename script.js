// =========================
// 1. SHARED PAGE REFERENCES
// =========================
// Cache the main elements we use more than once.
const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');


// =========================
// 2. MOBILE / SLIDE-OUT MENU
// =========================
// Clicking the MENU button toggles the "menu-open" class on <body>.
// CSS watches for that class and slides the navigation panel in/out.
menuToggle.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  // Keep the accessibility state in sync with whether the menu is open.
  menuToggle.setAttribute('aria-expanded', String(open));
});

// When a navigation link is clicked, close the menu again.
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// Also allow the Escape key to close the menu.
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});


// =========================
// 3. SCROLL-REVEAL ANIMATIONS
// =========================
// IntersectionObserver watches elements with the .reveal class.
// When an element enters the viewport, we add .visible.
// CSS handles the fade/slide animation.
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Stop watching after the first reveal so the animation only runs once.
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Register every .reveal element with the observer.
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// =========================
// 4. CURSOR GLOW EFFECT
// =========================
// Move the decorative red glow so it follows the pointer.
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', e => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});


// =========================
// 5. CONTACT FORM
// =========================
// The current form does NOT submit to a server.
// Instead, it builds a mailto: link and opens the visitor's email app.
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
  // IMPORTANT: change this if you use a different business inbox.
  window.location.href = `mailto:hello@phaseshiftstudio.com?subject=${subject}&body=${bodyText}`;
});


// =========================
// FUTURE PRICING TOGGLE
// =========================
// Next we can add the One-Time Payment vs Subscription switch here.
// The cleanest approach is to store both price values in data-* attributes
// on each pricing card, then switch the displayed values with JavaScript.
