-- Generated from the current page. Safe to rerun: existing values are preserved.
insert into public.website_content (section, content_key, content_type, content_value, max_length)
select section, content_key, content_type, content_value, max_length
from jsonb_to_recordset($seed$[
  {
    "section": "hero",
    "content_key": "hero.heading.text_1",
    "content_type": "text",
    "content_value": "SOFTWARE",
    "max_length": 300
  },
  {
    "section": "hero",
    "content_key": "hero.heading.text_2",
    "content_type": "text",
    "content_value": "THAT FITS",
    "max_length": 300
  },
  {
    "section": "hero",
    "content_key": "hero.heading.text_3",
    "content_type": "text",
    "content_value": "HOW YOU WORK.",
    "max_length": 300
  },
  {
    "section": "hero",
    "content_key": "hero.intro.text_1",
    "content_type": "text",
    "content_value": "Web design, landing pages and custom web apps for businesses in Gladstone and Central Queensland. Built around the people using them.",
    "max_length": 2000
  },
  {
    "section": "hero",
    "content_key": "hero.subline.text_1",
    "content_type": "text",
    "content_value": "Work with the app, not for it.",
    "max_length": 2000
  },
  {
    "section": "hero",
    "content_key": "hero.reassurance.text_1",
    "content_type": "text",
    "content_value": "Free consultation",
    "max_length": 2000
  },
  {
    "section": "hero",
    "content_key": "hero.reassurance.text_2",
    "content_type": "text",
    "content_value": "Free quote",
    "max_length": 2000
  },
  {
    "section": "hero",
    "content_key": "hero.reassurance.text_3",
    "content_type": "text",
    "content_value": "No obligation",
    "max_length": 2000
  },
  {
    "section": "hero",
    "content_key": "hero.primary_cta.text_1",
    "content_type": "text",
    "content_value": "SEND A REQUEST",
    "max_length": 300
  },
  {
    "section": "hero",
    "content_key": "hero.secondary_cta.text_1",
    "content_type": "text",
    "content_value": "See selected work",
    "max_length": 300
  },
  {
    "section": "work",
    "content_key": "work.heading.text_1",
    "content_type": "text",
    "content_value": "Practical problems.",
    "max_length": 300
  },
  {
    "section": "work",
    "content_key": "work.heading.text_2",
    "content_type": "text",
    "content_value": "Purpose-built possibilities.",
    "max_length": 300
  },
  {
    "section": "work",
    "content_key": "work.intro.text_1",
    "content_type": "text",
    "content_value": "From the first enquiry to the everyday work behind it. A closer look at the kinds of systems Phase Shift can help shape.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.disclosure.text_1",
    "content_type": "text",
    "content_value": "A note on the work: the studio website and enquiry integration are from the supplied project. Other interfaces are illustrative concepts, awaiting genuine project screenshots and details.",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.heading.text_1",
    "content_type": "text",
    "content_value": "Web design",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.heading.text_2",
    "content_type": "text",
    "content_value": "&",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.heading.text_3",
    "content_type": "text",
    "content_value": "apps.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.heading.text_4",
    "content_type": "text",
    "content_value": "Built for Gladstone.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.intro.text_1",
    "content_type": "text",
    "content_value": "A first website, a better internal tool or a whole new workflow. Start with the part that makes a difference.",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.philosophy.text_1",
    "content_type": "text",
    "content_value": "Software and websites should fit the way people actually work.",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.pricing_cta.text_1",
    "content_type": "text",
    "content_value": "Explore pricing",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.heading.text_1",
    "content_type": "text",
    "content_value": "Start small. Make it useful.",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.intro.text_1",
    "content_type": "text",
    "content_value": "Know where you stand from the start. Choose a monthly website plan or an upfront build.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app_badge.text_1",
    "content_type": "text",
    "content_value": "MOST VALUE",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.website_badge.text_1",
    "content_type": "text",
    "content_value": "MOST POPULAR",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.app_quote.text_1",
    "content_type": "text",
    "content_value": "Free Quoting.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app_caption.text_1",
    "content_type": "text",
    "content_value": "Individually quoted build",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app_note.text_1",
    "content_type": "text",
    "content_value": "App builds are individually quoted. Monthly support is optional; hosting or third-party services may require recurring fees. New features can be quoted separately.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.plugin_note.text_1",
    "content_type": "text",
    "content_value": "Add-on or plugin services may still require monthly billing.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.tax_note.text_1",
    "content_type": "text",
    "content_value": "Pricing is in AUD and inclusive of GST where applicable.",
    "max_length": 2000
  },
  {
    "section": "promotion",
    "content_key": "promotion.heading.text_1",
    "content_type": "text",
    "content_value": "New business?",
    "max_length": 300
  },
  {
    "section": "promotion",
    "content_key": "promotion.heading.text_2",
    "content_type": "text",
    "content_value": "50% off eligible landing page services.",
    "max_length": 300
  },
  {
    "section": "promotion",
    "content_key": "promotion.eyebrow.text_1",
    "content_type": "text",
    "content_value": "A LITTLE HELP TO GET STARTED",
    "max_length": 2000
  },
  {
    "section": "promotion",
    "content_key": "promotion.description.text_1",
    "content_type": "text",
    "content_value": "To help support locals. Separate from the $0 creation fee monthly plan; eligible services and how offers apply are to be confirmed.",
    "max_length": 2000
  },
  {
    "section": "promotion",
    "content_key": "promotion.cta.text_1",
    "content_type": "text",
    "content_value": "Ask about eligibility",
    "max_length": 300
  },
  {
    "section": "process",
    "content_key": "process.heading.text_1",
    "content_type": "text",
    "content_value": "Low-risk from first",
    "max_length": 300
  },
  {
    "section": "process",
    "content_key": "process.heading.text_2",
    "content_type": "text",
    "content_value": "message to launch.",
    "max_length": 300
  },
  {
    "section": "process",
    "content_key": "process.intro.text_1",
    "content_type": "text",
    "content_value": "You bring the problem. We work out what’s worth building, together. No obligation to go beyond the quote.",
    "max_length": 2000
  },
  {
    "section": "process",
    "content_key": "process.caption.text_1",
    "content_type": "text",
    "content_value": "FOUR STAGES. ONE CLEAR PATH.",
    "max_length": 2000
  },
  {
    "section": "founder",
    "content_key": "founder.heading.text_1",
    "content_type": "text",
    "content_value": "Built locally.",
    "max_length": 300
  },
  {
    "section": "founder",
    "content_key": "founder.heading.text_2",
    "content_type": "text",
    "content_value": "Built directly with you.",
    "max_length": 300
  },
  {
    "section": "founder",
    "content_key": "founder.introduction.text_1",
    "content_type": "text",
    "content_value": "I’m Jesse Freese, the person behind Phase Shift Studio in Gladstone, Queensland. You work directly with the person designing and building your project.",
    "max_length": 2000
  },
  {
    "section": "founder",
    "content_key": "founder.philosophy.text_1",
    "content_type": "text",
    "content_value": "Phase Shift grew from first-hand experience with frustrating apps and systems that created extra work. My approach is simple: understand the real process, remove unnecessary steps and build only what is useful.",
    "max_length": 2000
  },
  {
    "section": "founder",
    "content_key": "founder.quote.text_1",
    "content_type": "text",
    "content_value": "Efficiency is not the result of addition.",
    "max_length": 2000
  },
  {
    "section": "founder",
    "content_key": "founder.quote.text_2",
    "content_type": "text",
    "content_value": "It’s subtraction.",
    "max_length": 2000
  },
  {
    "section": "founder",
    "content_key": "founder.cta.text_1",
    "content_type": "text",
    "content_value": "Let’s talk about your workflow",
    "max_length": 300
  },
  {
    "section": "community",
    "content_key": "community.heading.text_1",
    "content_type": "text",
    "content_value": "Supporting the",
    "max_length": 300
  },
  {
    "section": "community",
    "content_key": "community.heading.text_2",
    "content_type": "text",
    "content_value": "people building",
    "max_length": 300
  },
  {
    "section": "community",
    "content_key": "community.heading.text_3",
    "content_type": "text",
    "content_value": "Gladstone.",
    "max_length": 300
  },
  {
    "section": "community",
    "content_key": "community.introduction.text_1",
    "content_type": "text",
    "content_value": "Useful digital tools should also be accessible to the organisations supporting our local community.",
    "max_length": 2000
  },
  {
    "section": "community",
    "content_key": "community.description.text_1",
    "content_type": "text",
    "content_value": "Community and charity organisations in Gladstone and Central Queensland are invited to discuss potential sponsored websites, workflow tools and other project support.",
    "max_length": 2000
  },
  {
    "section": "community",
    "content_key": "community.cta.text_1",
    "content_type": "text",
    "content_value": "DISCUSS SPONSORED WORK",
    "max_length": 300
  },
  {
    "section": "community",
    "content_key": "community.availability.text_1",
    "content_type": "text",
    "content_value": "Sponsorship is considered based on project fit and availability.",
    "max_length": 2000
  },
  {
    "section": "community",
    "content_key": "community.future.text_1",
    "content_type": "text",
    "content_value": "Future supported-project stories will be shared here, with permission.",
    "max_length": 2000
  },
  {
    "section": "contact",
    "content_key": "contact.heading.text_1",
    "content_type": "text",
    "content_value": "What could",
    "max_length": 300
  },
  {
    "section": "contact",
    "content_key": "contact.heading.text_2",
    "content_type": "text",
    "content_value": "work",
    "max_length": 300
  },
  {
    "section": "contact",
    "content_key": "contact.heading.text_3",
    "content_type": "text",
    "content_value": "better?",
    "max_length": 300
  },
  {
    "section": "contact",
    "content_key": "contact.intro.text_1",
    "content_type": "text",
    "content_value": "A website that opens doors. A tool that takes a few steps out of your day. Tell me what you have in mind.",
    "max_length": 2000
  },
  {
    "section": "contact",
    "content_key": "contact.cta.text_1",
    "content_type": "text",
    "content_value": "SEND A REQUEST",
    "max_length": 300
  },
  {
    "section": "footer",
    "content_key": "footer.tagline.text_1",
    "content_type": "text",
    "content_value": "Less friction. Less red tape.",
    "max_length": 2000
  },
  {
    "section": "footer",
    "content_key": "footer.tagline.text_2",
    "content_type": "text",
    "content_value": "Better workflow.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_1.title.text_1",
    "content_type": "text",
    "content_value": "Transport Operations Tool",
    "max_length": 300
  },
  {
    "section": "work",
    "content_key": "work.project_1.problem.text_1",
    "content_type": "text",
    "content_value": "Jobs, vehicles and updates can be difficult to follow across separate systems.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_1.solution.text_1",
    "content_type": "text",
    "content_value": "A workflow concept bringing dispatch, job tracking and transport information into one clear view.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_1.caption.text_1",
    "content_type": "text",
    "content_value": "Dispatch · Job tracking · Web app",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_1.cta.text_1",
    "content_type": "text",
    "content_value": "Let’s talk",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_1.heading.text_1",
    "content_type": "text",
    "content_value": "Web design.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_1.heading.text_2",
    "content_type": "text",
    "content_value": "Built for your business.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_1.description.text_1",
    "content_type": "text",
    "content_value": "Business websites and landing pages for Gladstone businesses, with a clear message and a simple path to enquire.",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_1.category.text_1",
    "content_type": "text",
    "content_value": "WEBSITES",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_1.feature_1.text_1",
    "content_type": "text",
    "content_value": "Mobile-friendly, enquiry-focused layouts",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_1.feature_2.text_1",
    "content_type": "text",
    "content_value": "Google Business Profile creation",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_1.feature_3.text_1",
    "content_type": "text",
    "content_value": "Clear navigation + practical sales and marketing consultation",
    "max_length": 2000
  },
  {
    "section": "process",
    "content_key": "process.step_1.heading.text_1",
    "content_type": "text",
    "content_value": "Send your request",
    "max_length": 300
  },
  {
    "section": "process",
    "content_key": "process.step_1.description.text_1",
    "content_type": "text",
    "content_value": "Tell me what you are trying to build, improve or simplify. A rough idea is enough.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_2.title.text_1",
    "content_type": "text",
    "content_value": "Quoting Workflow",
    "max_length": 300
  },
  {
    "section": "work",
    "content_key": "work.project_2.problem.text_1",
    "content_type": "text",
    "content_value": "An enquiry should be the start of a clear process, without entering the same details twice.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_2.solution.text_1",
    "content_type": "text",
    "content_value": "The supplied site connects enquiries to an admin draft and email delivery. The illustration explores the wider quote journey.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_2.caption.text_1",
    "content_type": "text",
    "content_value": "Enquiries · Admin drafts · Customer flow",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_2.cta.text_1",
    "content_type": "text",
    "content_value": "Let’s talk",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_2.heading.text_1",
    "content_type": "text",
    "content_value": "Custom web apps.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_2.heading.text_2",
    "content_type": "text",
    "content_value": "Built for your team.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_2.description.text_1",
    "content_type": "text",
    "content_value": "Custom web app development for Gladstone and Central Queensland businesses: quoting systems, dashboards and customer portals built around your workflow.",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_2.category.text_1",
    "content_type": "text",
    "content_value": "WEB APPS",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_2.feature_1.text_1",
    "content_type": "text",
    "content_value": "Quoting tools, dashboards + customer portals",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_2.feature_2.text_1",
    "content_type": "text",
    "content_value": "Job tracking + internal tools",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_2.feature_3.text_1",
    "content_type": "text",
    "content_value": "Logistics, transport + operational systems",
    "max_length": 2000
  },
  {
    "section": "process",
    "content_key": "process.step_2.heading.text_1",
    "content_type": "text",
    "content_value": "Free workflow consultation + quote",
    "max_length": 300
  },
  {
    "section": "process",
    "content_key": "process.step_2.description.text_1",
    "content_type": "text",
    "content_value": "Discuss the real workflow, identify what is worth building and receive a clear, no-obligation quote.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_3.title.text_1",
    "content_type": "text",
    "content_value": "Equipment Fleet Register",
    "max_length": 300
  },
  {
    "section": "work",
    "content_key": "work.project_3.problem.text_1",
    "content_type": "text",
    "content_value": "Awkward spreadsheets make equipment details harder to find and keep consistent.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_3.solution.text_1",
    "content_type": "text",
    "content_value": "An illustrative register for browsing equipment, checking specifications and keeping fleet information together.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_3.caption.text_1",
    "content_type": "text",
    "content_value": "Equipment records · Filters · Mobile access",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_3.cta.text_1",
    "content_type": "text",
    "content_value": "Let’s talk",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_3.heading.text_1",
    "content_type": "text",
    "content_value": "Workflow tools.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_3.heading.text_2",
    "content_type": "text",
    "content_value": "Less repeated admin.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_3.description.text_1",
    "content_type": "text",
    "content_value": "Workflow tools and business automation for Gladstone teams. Replace awkward spreadsheets, reduce repeated administration and connect the steps between jobs.",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_3.category.text_1",
    "content_type": "text",
    "content_value": "WORKFLOW TOOLS",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_3.feature_1.text_1",
    "content_type": "text",
    "content_value": "Equipment + fleet registers",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_3.feature_2.text_1",
    "content_type": "text",
    "content_value": "Purpose-built tools + simpler processes",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_3.feature_3.text_1",
    "content_type": "text",
    "content_value": "Lightweight automation + useful integrations",
    "max_length": 2000
  },
  {
    "section": "process",
    "content_key": "process.step_3.heading.text_1",
    "content_type": "text",
    "content_value": "Design + build",
    "max_length": 300
  },
  {
    "section": "process",
    "content_key": "process.step_3.description.text_1",
    "content_type": "text",
    "content_value": "Once the quote is accepted and the deposit is paid, design and build around the agreed workflow.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_4.title.text_1",
    "content_type": "text",
    "content_value": "A clearer business presence",
    "max_length": 300
  },
  {
    "section": "work",
    "content_key": "work.project_4.problem.text_1",
    "content_type": "text",
    "content_value": "Visitors need to understand the business and know how to take the next step.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_4.solution.text_1",
    "content_type": "text",
    "content_value": "Phase Shift Studio’s own website combines clear services, public pricing and a direct enquiry flow.",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_4.caption.text_1",
    "content_type": "text",
    "content_value": "Responsive design · Local SEO · Enquiries",
    "max_length": 2000
  },
  {
    "section": "work",
    "content_key": "work.project_4.cta.text_1",
    "content_type": "text",
    "content_value": "Let’s talk",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_4.heading.text_1",
    "content_type": "text",
    "content_value": "Start with what matters.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_4.heading.text_2",
    "content_type": "text",
    "content_value": "Add what earns its place.",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_4.description.text_1",
    "content_type": "text",
    "content_value": "Launch the useful version first, with a clear path to support and expansion as your business needs change.",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_4.category.text_1",
    "content_type": "text",
    "content_value": "SUPPORT + EXPANSION",
    "max_length": 300
  },
  {
    "section": "services",
    "content_key": "services.service_4.feature_1.text_1",
    "content_type": "text",
    "content_value": "Team training + monthly support",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_4.feature_2.text_1",
    "content_type": "text",
    "content_value": "Hosting + deployment assistance",
    "max_length": 2000
  },
  {
    "section": "services",
    "content_key": "services.service_4.feature_3.text_1",
    "content_type": "text",
    "content_value": "Feature additions + separately quoted improvements",
    "max_length": 2000
  },
  {
    "section": "process",
    "content_key": "process.step_4.heading.text_1",
    "content_type": "text",
    "content_value": "Launch + expand",
    "max_length": 300
  },
  {
    "section": "process",
    "content_key": "process.step_4.description.text_1",
    "content_type": "text",
    "content_value": "Launch the first useful version, add support if needed and expand later when additional features earn their place.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.landing.title.text_1",
    "content_type": "text",
    "content_value": "Landing Page",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.landing.label.text_1",
    "content_type": "text",
    "content_value": "STARTER",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.landing.faq_question.text_1",
    "content_type": "text",
    "content_value": "Is this for me?",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.landing.faq_answer.text_1",
    "content_type": "text",
    "content_value": "One clear page. One clear action.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.landing.faq_answer.text_2",
    "content_type": "text",
    "content_value": "For a focused offer, campaign or a first business presence.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.landing.cta.text_1",
    "content_type": "text",
    "content_value": "GET A QUOTE",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.website.title.text_1",
    "content_type": "text",
    "content_value": "Custom Website",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.website.label.text_1",
    "content_type": "text",
    "content_value": "BUSINESS",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.website.faq_question.text_1",
    "content_type": "text",
    "content_value": "Is this for me?",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.website.faq_answer.text_1",
    "content_type": "text",
    "content_value": "Room to explain. Built to convert.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.website.faq_answer.text_2",
    "content_type": "text",
    "content_value": "For businesses with multiple services and a story that needs more room.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.website.cta.text_1",
    "content_type": "text",
    "content_value": "GET A QUOTE",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.title.text_1",
    "content_type": "text",
    "content_value": "Workflow tools and apps",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.label.text_1",
    "content_type": "text",
    "content_value": "PURPOSE-BUILT",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.faq_question.text_1",
    "content_type": "text",
    "content_value": "Is this for me?",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.faq_answer.text_1",
    "content_type": "text",
    "content_value": "Your process. Your tool.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.faq_answer.text_2",
    "content_type": "text",
    "content_value": "For quoting, operations, customer portals, fleet registers and internal systems.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.cta.text_1",
    "content_type": "text",
    "content_value": "DISCUSS YOUR APP",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.feature_1.text_1",
    "content_type": "text",
    "content_value": "Workflow + interface planning",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.feature_2.text_1",
    "content_type": "text",
    "content_value": "Prototype or full build",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.feature_3.text_1",
    "content_type": "text",
    "content_value": "AI integration",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.feature_4.text_1",
    "content_type": "text",
    "content_value": "Optional monthly support",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.app.feature_5.text_1",
    "content_type": "text",
    "content_value": "New features quoted separately",
    "max_length": 2000
  },
  {
    "section": "contact",
    "content_key": "contact.reassurance_1.text_1",
    "content_type": "text",
    "content_value": "NO COMMITMENT",
    "max_length": 2000
  },
  {
    "section": "contact",
    "content_key": "contact.reassurance_2.text_1",
    "content_type": "text",
    "content_value": "FREE CONSULTATION",
    "max_length": 2000
  },
  {
    "section": "contact",
    "content_key": "contact.reassurance_3.text_1",
    "content_type": "text",
    "content_value": "FREE QUOTING",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.prefix",
    "content_type": "text",
    "content_value": "starting from:",
    "max_length": 100
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.description",
    "content_type": "text",
    "content_value": "Lower upfront cost. Support + updates included.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.note",
    "content_type": "text",
    "content_value": "Monthly website plans include support, hosting and smaller improvements.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.badge_label",
    "content_type": "text",
    "content_value": "CREATION FEE",
    "max_length": 100
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.landing.creation_fee",
    "content_type": "price",
    "content_value": 0,
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.landing.price",
    "content_type": "price",
    "content_value": 99,
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.landing.suffix",
    "content_type": "text",
    "content_value": "/ month",
    "max_length": 100
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.landing.feature_1",
    "content_type": "text",
    "content_value": "Design + build included",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.landing.feature_2",
    "content_type": "text",
    "content_value": "Managed hosting included",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.landing.feature_3",
    "content_type": "text",
    "content_value": "Small content updates",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.landing.feature_4",
    "content_type": "text",
    "content_value": "Google Business Profile creation",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.website.price",
    "content_type": "price",
    "content_value": 179,
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.website.suffix",
    "content_type": "text",
    "content_value": "/ month",
    "max_length": 100
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.website.feature_1",
    "content_type": "text",
    "content_value": "Custom multi-page website",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.website.feature_2",
    "content_type": "text",
    "content_value": "Managed hosting included",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.website.feature_3",
    "content_type": "text",
    "content_value": "Ongoing content updates",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.monthly.website.feature_4",
    "content_type": "text",
    "content_value": "Support + maintenance",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.description",
    "content_type": "text",
    "content_value": "Pay once. Own the finished build.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.note",
    "content_type": "text",
    "content_value": "Every project is quoted around the work that is actually useful. Ongoing website support can be discussed separately.",
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.badge",
    "content_type": "text",
    "content_value": "ONE-TIME BUILD",
    "max_length": 100
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.landing.price",
    "content_type": "price",
    "content_value": 499,
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.landing.suffix",
    "content_type": "text",
    "content_value": "one-time",
    "max_length": 100
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.landing.feature_1",
    "content_type": "text",
    "content_value": "Single high-impact page",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.landing.feature_2",
    "content_type": "text",
    "content_value": "Mobile responsive design",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.landing.feature_3",
    "content_type": "text",
    "content_value": "Contact / enquiry flow",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.landing.feature_4",
    "content_type": "text",
    "content_value": "Basic SEO setup",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.landing.feature_5",
    "content_type": "text",
    "content_value": "Google Business Profile creation",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.website.price",
    "content_type": "price",
    "content_value": 1450,
    "max_length": 2000
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.website.suffix",
    "content_type": "text",
    "content_value": "one-time",
    "max_length": 100
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.website.feature_1",
    "content_type": "text",
    "content_value": "Multi-page custom website",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.website.feature_2",
    "content_type": "text",
    "content_value": "Workflow-focused UX",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.website.feature_3",
    "content_type": "text",
    "content_value": "Responsive development",
    "max_length": 300
  },
  {
    "section": "pricing",
    "content_key": "pricing.onetime.website.feature_4",
    "content_type": "text",
    "content_value": "Launch + handover",
    "max_length": 300
  }
]$seed$::jsonb)
as x(section text, content_key text, content_type text, content_value jsonb, max_length integer)
on conflict (content_key) do nothing;
