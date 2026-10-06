-- Add the codeless edit-portal offer to the Phase Shift Studio CMS.
-- Safe to rerun: existing draft and published values always win.
begin;

with new_fields as (
  select $fields$[
    {"key":"pricing.editor_portal.eyebrow.text_1","type":"text","label":"Edit portal eyebrow","section":"pricing","maxLength":2000,"default":"YOUR SITE. YOUR CONTROL."},
    {"key":"pricing.editor_portal.heading.text_1","type":"text","label":"Edit portal heading","section":"pricing","maxLength":300,"default":"Make codeless website edits instantly."},
    {"key":"pricing.editor_portal.description.text_1","type":"text","label":"Edit portal description","section":"pricing","maxLength":2000,"default":"For $29.99 per month, access your own private edit portal and publish approved text and price updates from your phone or desktop. No coding, GitHub edits or redeployment required."},
    {"key":"pricing.editor_portal.feature_1.text_1","type":"text","label":"Edit portal feature 1","section":"pricing","maxLength":2000,"default":"Private, secure login"},
    {"key":"pricing.editor_portal.feature_2.text_1","type":"text","label":"Edit portal feature 2","section":"pricing","maxLength":2000,"default":"Works on phone and desktop"},
    {"key":"pricing.editor_portal.feature_3.text_1","type":"text","label":"Edit portal feature 3","section":"pricing","maxLength":2000,"default":"Update text and prices, then publish instantly"},
    {"key":"pricing.editor_portal.price","type":"price","label":"Edit portal monthly price","section":"pricing","maxLength":2000,"default":29.99},
    {"key":"pricing.editor_portal.cta.text_1","type":"text","label":"Edit portal button","section":"pricing","maxLength":300,"default":"ADD THE EDIT PORTAL"},
    {"key":"pricing.editor_portal.availability.text_1","type":"text","label":"Edit portal availability","section":"pricing","maxLength":2000,"default":"Available for compatible Phase Shift-managed websites."}
  ]$fields$::jsonb as value)
update pss_cms.businesses b
set fields = b.fields || coalesce((
  select jsonb_agg(n.item)
  from new_fields f
  cross join lateral jsonb_array_elements(f.value) n(item)
  where not exists (
    select 1 from jsonb_array_elements(b.fields) current(item)
    where current.item->>'key'=n.item->>'key'
  )
),'[]'::jsonb)
where b.slug='phase-shift-studio';

with defaults as (
  select $values${
    "pricing.editor_portal.eyebrow.text_1":"YOUR SITE. YOUR CONTROL.",
    "pricing.editor_portal.heading.text_1":"Make codeless website edits instantly.",
    "pricing.editor_portal.description.text_1":"For $29.99 per month, access your own private edit portal and publish approved text and price updates from your phone or desktop. No coding, GitHub edits or redeployment required.",
    "pricing.editor_portal.feature_1.text_1":"Private, secure login",
    "pricing.editor_portal.feature_2.text_1":"Works on phone and desktop",
    "pricing.editor_portal.feature_3.text_1":"Update text and prices, then publish instantly",
    "pricing.editor_portal.price":29.99,
    "pricing.editor_portal.cta.text_1":"ADD THE EDIT PORTAL",
    "pricing.editor_portal.availability.text_1":"Available for compatible Phase Shift-managed websites."
  }$values$::jsonb as value)
update pss_cms.content c
set draft=d.value || c.draft,
    published=d.value || c.published,
    previous=case when c.previous is null then null else d.value || c.previous end
from defaults d
join pss_cms.businesses b on b.slug='phase-shift-studio'
where c.business_id=b.id;

commit;

