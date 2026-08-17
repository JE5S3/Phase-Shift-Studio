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
// 6. PRICING MODE TOGGLE
// =========================
// All pricing content lives in this object so it is easy to edit later.
// "onetime" = upfront project purchase.
// "monthly" = lower upfront commitment with ongoing support included.
const pricingPlans = {
  onetime: {
    description: 'PAY ONCE. OWN THE FINISHED BUILD.',
    note: 'Every project is different. These are starting points only — final pricing depends on scope, features and content requirements.',
    plans: {
      landing: {
        price: 'FROM <strong>$750</strong>',
        features: [
          'Single high-impact page',
          'Mobile responsive design',
          'Contact / enquiry flow',
          'Basic SEO setup'
        ]
      },
      website: {
        price: 'FROM <strong>$1,500</strong>',
        features: [
          'Multi-page custom website',
          'Conversion-focused UX',
          'Responsive development',
          'Launch + handover'
        ]
      },
      app: {
        price: '<strong>CUSTOM</strong> QUOTE',
        features: [
          'Product planning',
          'UI / UX design',
          'Prototype or full build',
          'Scalable project scope'
        ]
      }
    }
  },

  monthly: {
    description: 'LOWER UPFRONT COST. SUPPORT + UPDATES INCLUDED.',
    note: 'Monthly plans are starting points and are quoted to suit the project. Hosting, support and reasonable ongoing content updates are included; larger redesigns or new features may be quoted separately.',
    plans: {
      landing: {
        price: 'FROM <strong>$99</strong> / MO',
        features: [
          'Design + build included',
          'Managed hosting included',
          'Small content updates',
          'Ongoing technical support'
        ]
      },
      website: {
        price: 'FROM <strong>$179</strong> / MO',
        features: [
          'Custom multi-page website',
          'Managed hosting included',
          'Ongoing content updates',
          'Priority support + maintenance'
        ]
      },
      app: {
        price: '<strong>CUSTOM</strong> / MO',
        features: [
          'Product + interface support',
          'Hosting / deployment support',
          'Ongoing improvements',
          'Monthly scope matched to your app'
        ]
      }
    }
  }
};

const pricingButtons = document.querySelectorAll('[data-pricing-mode]');
const priceCards = document.querySelectorAll('.price-card[data-plan]');
const pricingDescription = document.getElementById('pricing-mode-description');
const pricingNote = document.getElementById('pricing-note');

// Render one payment mode across all three cards.
function setPricingMode(mode) {
  const selected = pricingPlans[mode];
  if (!selected) return;

  // Update the toggle's visual + accessibility state.
  pricingButtons.forEach(button => {
    const isActive = button.dataset.pricingMode === mode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  pricingDescription.textContent = selected.description;
  pricingNote.textContent = selected.note;

  // Brief fade/slide makes the content change feel deliberate rather than abrupt.
  priceCards.forEach(card => card.classList.add('pricing-changing'));

  window.setTimeout(() => {
    priceCards.forEach(card => {
      const plan = selected.plans[card.dataset.plan];
      if (!plan) return;

      card.querySelector('[data-price]').innerHTML = plan.price;
      card.querySelector('[data-features]').innerHTML = plan.features
        .map(feature => `<li>${feature}</li>`)
        .join('');

      card.classList.remove('pricing-changing');
    });
  }, 150);
}

// Switch modes when either toggle button is clicked.
pricingButtons.forEach(button => {
  button.addEventListener('click', () => {
    setPricingMode(button.dataset.pricingMode);
  });
});
