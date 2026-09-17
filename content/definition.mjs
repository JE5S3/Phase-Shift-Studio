// Phase Shift-specific field selection. Reusable editing logic lives in core.mjs.
// Keep IDs stable after launch; values/defaults are extracted from the actual HTML.
export const targets = [
  ['hero.heading', '.hero-copy h1'],
  ['hero.intro', '.hero-intro'],
  ['hero.subline', '.hero-subline'],
  ['hero.reassurance', '.hero-reassurance'],
  ['hero.primary_cta', '.hero-actions .btn'],
  ['hero.secondary_cta', '.hero-actions .text-link'],
  ['work.heading', '#work .section-heading h2'],
  ['work.intro', '#work .section-intro'],
  ['work.disclosure', '.work-disclosure'],
  ['services.heading', '#services > .section-heading h2'],
  ['services.intro', '#services > .section-heading .section-intro'],
  ['services.philosophy', '.service-foot > span'],
  ['services.pricing_cta', '.service-foot > a'],
  ['pricing.heading', '#pricing .section-heading h2'],
  ['pricing.intro', '#pricing .section-intro'],
  ['pricing.app_badge', '.app > .price-badge'],
  ['pricing.website_badge', '.website > .price-badge'],
  ['pricing.app_quote', '.app [data-price] .custom-price'],
  ['pricing.app_caption', '.app [data-price] > span'],
  ['pricing.app_note', '.pricing-notes > p:nth-child(2)'],
  ['pricing.plugin_note', '.pricing-notes > p:nth-child(3)'],
  ['pricing.tax_note', '.pricing-notes > p:nth-child(4)'],
  ['promotion.heading', '.local-offer h3'],
  ['promotion.eyebrow', '.local-offer .eyebrow'],
  ['promotion.description', '.local-offer p:not(.eyebrow)'],
  ['promotion.cta', '.local-offer > a'],
  ['process.heading', '#process .section-heading h2'],
  ['process.intro', '#process .section-intro'],
  ['process.caption', '.process-controls > .eyebrow'],
  ['founder.heading', '.founder-copy h2'],
  ['founder.introduction', '.founder-copy > p:nth-of-type(2)'],
  ['founder.philosophy', '.founder-copy > p:nth-of-type(3)'],
  ['founder.quote', '.founder-copy blockquote'],
  ['founder.cta', '.founder-copy > a'],
  ['community.heading', '.community-grid h2'],
  ['community.introduction', '.community-copy > p:nth-of-type(1)'],
  ['community.description', '.community-copy > p:nth-of-type(2)'],
  ['community.cta', '.community-copy > a'],
  ['community.availability', '.community-copy > .small-copy'],
  ['community.future', '.community-future > p'],
  ['contact.heading', '.contact-copy h2'],
  ['contact.intro', '.contact-copy > p:not(.eyebrow)'],
  ['contact.cta', '#contact-form > button[type="submit"]'],
  ['footer.tagline', '.footer-top > p']
].map(([id, selector]) => ({id, selector}));

for (let i = 1; i <= 4; i++) {
  for (const [name, selector] of [
    ['title', 'h3'], ['problem', '> p:nth-of-type(2)'],
    ['solution', '> p:nth-of-type(3)'], ['caption', '.work-bottom > span'],
    ['cta', '.work-bottom > a']
  ]) targets.push({id: 'work.project_' + i + '.' + name,
    selector: '.work-card:nth-child(' + i + ') .work-body ' + selector});
  for (const [name, selector] of [
    ['heading', '> h3'], ['description', '> p:not(.eyebrow)']
  ]) targets.push({id: 'services.service_' + i + '.' + name,
    selector: '.service-card:nth-child(' + i + ') ' + selector});
  targets.push({id:'services.service_'+i+'.category',
    selector:'.service-card:nth-child('+i+') > .eyebrow',exclude:'span'});
  for (let j = 1; j <= 3; j++) targets.push({
    id: 'services.service_' + i + '.feature_' + j,
    selector: '.service-card:nth-child(' + i + ') li:nth-child(' + j + ')'});
  for (const [name, selector] of [['heading','h3'],['description','p']])
    targets.push({id:'process.step_' + i + '.' + name,
      selector: '.process-list:not(.highlight-copy) > li:nth-child(' + i + ') ' + selector});
}
for (const plan of ['landing', 'website', 'app']) {
  for (const [name, selector] of [
    ['title','.price-content > h3'], ['label','.price-content > .eyebrow'],
    ['faq_question','summary'], ['faq_answer','details p'], ['cta','.price-content > a']
  ]) targets.push({id:'pricing.' + plan + '.' + name, selector:'.price-card.' + plan + ' ' + selector});
}
for (let i=1;i<=5;i++) targets.push({id:'pricing.app.feature_' + i,
  selector:'.price-card.app [data-features] > li:nth-child(' + i + ')'});
for (let i=1;i<=3;i++) targets.push({id:'contact.reassurance_' + i,
  selector:'.contact-mini > span:nth-child(' + i + ')'});

// Preserve current visible prices. The old JS said $199 after a toggle while
// the initially displayed website price was $179: use the visible $179 consistently.
export const pricing = {
  prefix: 'starting from:',
  monthly: {
    description: 'Lower upfront cost. Support + updates included.',
    note: 'Monthly website plans include support, hosting and smaller improvements.',
    badgeLabel: 'CREATION FEE',
    creationFee: 0,
    landing: {price:99, suffix:'/ month', features:[
      'Design + build included','Managed hosting included','Small content updates','Google Business Profile creation']},
    website: {price:179, suffix:'/ month', features:[
      'Custom multi-page website','Managed hosting included','Ongoing content updates','Support + maintenance']}
  },
  onetime: {
    description: 'Pay once. Own the finished build.',
    note: 'Every project is quoted around the work that is actually useful. Ongoing website support can be discussed separately.',
    badge: 'ONE-TIME BUILD',
    landing: {price:800, suffix:'one-time', features:[
      'Single high-impact page','Mobile responsive design','Contact / enquiry flow','Basic SEO setup','Google Business Profile creation']},
    website: {price:1790, suffix:'one-time', features:[
      'Multi-page custom website','Workflow-focused UX','Responsive development','Launch + handover']}
  }
};
