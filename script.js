// ======================================
// PHASE SHIFT STUDIO — PRICING SETTINGS
// Edit your prices here.
// ======================================

const PRICING = {
  landingPage: {
    label: "Landing Page",
    oneTime: 750,
    monthly: 99
  },

  customWebsite: {
    label: "Custom Website",
    oneTime: 1250,
    monthly: 179
  },

  webApp: {
    label: "Web / Mobile App",
    oneTime: null,
    monthly: null
  }
};

const BUDGET_OPTIONS = {
  oneTime: [
    "$750 – $1,500",
    "$1,500 – $3,000",
    "$3,000 – $5,000",
    "$5,000+",
    "Not sure yet"
  ],

  monthly: [
    "$99 – $199 / month",
    "$200 – $349 / month",
    "$350+ / month",
    "Not sure yet"
  ]
};

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

// Start the repeating foil sheen after the pricing cards first enter view.
const pricingGrid = document.querySelector('.pricing-grid');
if (pricingGrid && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const pricingSheenObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.price-card').forEach((card, index) => {
        window.setTimeout(() => card.classList.add('sheen-played'), index * 140);
      });
      pricingSheenObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  pricingSheenObserver.observe(pricingGrid);
}




// =========================
// 4. PROJECT ENQUIRY FORM
// =========================
// Budget options change automatically to match the visitor's payment preference.

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

form.addEventListener('submit', async e => {
  e.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonHTML = submitButton.innerHTML;

  status.classList.remove('success', 'error');
  status.textContent = 'SENDING ENQUIRY…';
  submitButton.disabled = true;
  submitButton.innerHTML = 'SENDING… <span>→</span>';

  try {
    const formData = new FormData(form);
    const projectType = String(formData.get('type') || 'Not Sure');
    const submissionId = form.dataset.submissionId || crypto.randomUUID();
    form.dataset.submissionId = submissionId;

    const enquiryPayload = {
      submissionId,
      botcheck: formData.get('botcheck'),
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      type: projectType,
      payment: 'unsure',
      hasWebsite: 'No',
      services: [projectType],
      message: formData.get('message')
    };

    formData.append('access_key', '12a67359-21bc-4c4f-b464-40081db6280a');
    formData.append('subject', `New Phase Shift Studio Enquiry — ${projectType}`);
    formData.append('from_name', 'Phase Shift Studio Website');

    const draftResponse = await fetch('https://txvorfcyvxwmwpkctndg.supabase.co/functions/v1/enquiry-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryPayload)
    });
    const draftResult = await draftResponse.json();
    if (!draftResponse.ok || !draftResult.ok) {
      throw new Error(draftResult.error || 'Draft quote creation failed');
    }

    const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Submission failed');

    status.classList.add('success');
    status.textContent = 'ENQUIRY SENT — THANK YOU.';
    form.reset();
    delete form.dataset.submissionId;
  } catch (error) {
    console.error('Enquiry submission error:', error);
    status.classList.add('error');
    status.textContent = 'SOMETHING WENT WRONG — PLEASE TRY AGAIN.';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonHTML;
  }
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
    note: 'Every project is quoted around the work that is actually useful. Add-on or plugin services may still require monthly billing.',
    plans: {
      landing: {
        price: `FROM <strong>$${PRICING.landingPage.oneTime.toLocaleString()}</strong>`,
        features: [
          'Single high-impact page',
          'Mobile responsive design',
          'Contact / enquiry flow',
          'Basic SEO setup',
          'Google Business Profile creation'
        ]
      },
      website: {
        price: `FROM <strong>$${PRICING.customWebsite.oneTime.toLocaleString()}</strong>`,
        features: [
          'Multi-page custom website',
          'Workflow-focused UX',
          'Responsive development',
          'Launch + handover'
        ]
      },
      app: {
        price: PRICING.webApp.oneTime == null
          ? '<strong>CUSTOM</strong> QUOTE'
          : `FROM <strong>$${PRICING.webApp.oneTime.toLocaleString()}</strong>`,
        features: [
          'Product planning',
          'UI / UX design',
          'Prototype or full build',
          'Workflow planning'
        ]
      }
    }
  },

  monthly: {
    description: 'LOWER UPFRONT COST. SUPPORT + UPDATES INCLUDED.',
    note: 'Monthly plans keep support, hosting and smaller improvements moving. Larger new features can be added later through a package or a quoted job.',
    plans: {
      landing: {
        price: `FROM <strong>$${PRICING.landingPage.monthly.toLocaleString()}</strong> / MO`,
        features: [
          'Design + build included',
          'Managed hosting included',
          'Small content updates',
          'Google Business Profile creation'
        ]
      },
      website: {
        price: `FROM <strong>$${PRICING.customWebsite.monthly.toLocaleString()}</strong> / MO`,
        features: [
          'Custom multi-page website',
          'Managed hosting included',
          'Ongoing content updates',
          'Support + maintenance'
        ]
      },
      app: {
        price: PRICING.webApp.monthly == null
          ? '<strong>CUSTOM</strong> / MO'
          : `FROM <strong>$${PRICING.webApp.monthly.toLocaleString()}</strong> / MO`,
        features: [
          'Workflow + interface support',
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

function setPriceCardFlipped(card, flipped) {
  card.classList.toggle('flipped', flipped);
  card.setAttribute('aria-expanded', String(flipped));
  card.querySelector('.price-front').setAttribute('aria-hidden', String(flipped));
  card.querySelector('.price-back').setAttribute('aria-hidden', String(!flipped));
}

priceCards.forEach(card => {
  setPriceCardFlipped(card, false);

  card.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    setPriceCardFlipped(card, !card.classList.contains('flipped'));
  });

  card.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button, a')) {
      event.preventDefault();
      setPriceCardFlipped(card, !card.classList.contains('flipped'));
    }
  });
});

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

// Render the default pricing mode using the central PRICING settings.
setPricingMode('monthly');
