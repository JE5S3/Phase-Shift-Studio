import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {WebsiteContent,validateValue,formatPrice} from '../content/core.mjs';
const manifest=JSON.parse(await readFile('content/manifest.generated.json','utf8'));
const html=await readFile('dist/index.html','utf8');
function fixture(){
  const {document,window}=parseHTML(html);
  globalThis.CustomEvent=window.CustomEvent;
  return {document,store:new WebsiteContent(manifest,document)};
}
test('every original target preserves markup and default text',()=>{
  const {document,store}=fixture();
  const originals=manifest.targets.map(t=>[t.id,document.querySelector('[data-content-target="'+t.id+'"]').innerHTML]);
  store.apply();
  for(const [id,markup] of originals)assert.equal(document.querySelector('[data-content-target="'+id+'"]').innerHTML,markup,id);
});
test('prices are numeric, safely formatted, and both pricing modes remain editable',()=>{
  assert.equal(formatPrice(499),'$499');assert.equal(formatPrice(1450),'$1,450');assert.equal(formatPrice(99.29),'$99.29');
  for(const value of [0,1,99.29,10000000])assert.ok(validateValue({type:'price'},value));
  for(const value of [-1,NaN,Infinity,1.001,'99',null])assert.ok(!validateValue({type:'price'},value));
  const {store,document}=fixture();store.apply();
  store.set('pricing.monthly.landing.price',125);
  assert.equal(document.querySelector('.landing [data-price] strong').textContent,'$125');
  store.setPricingMode('onetime');store.set('pricing.onetime.website.price',2000);
  assert.equal(document.querySelector('.website [data-price] strong').textContent,'$2,000');
  store.setPricingMode('monthly');
  assert.equal(document.querySelector('.landing [data-price] strong').textContent,'$125');
});
test('draft/revert/saved snapshots are separate and incomplete admin setup is rejected',()=>{
  const {store}=fixture();
  store.set('pricing.monthly.landing.price',123);assert.equal(Object.keys(store.changed()).length,1);
  store.revert();assert.equal(store.get('pricing.monthly.landing.price'),99);assert.deepEqual(store.changed(),{});
  assert.throws(()=>store.accept({revision:1,values:{}},true),/incomplete/);
  store.accept({revision:1,values:{...store.defaults,'pricing.monthly.landing.price':222}},true);
  assert.equal(store.get('pricing.monthly.landing.price'),222);assert.deepEqual(store.changed(),{});
});
test('untrusted marketing copy is rendered as text, never HTML; duplicate offers stay synced',()=>{
  const {store,document}=fixture();store.apply();
  const f=manifest.fields.find(f=>f.key.startsWith('hero.intro.'));
  store.set(f.key,'<img src=x onerror=alert(1)>');
  assert.equal(document.querySelector('.hero-intro img'),null);
  assert.match(document.querySelector('.hero-intro').textContent,/<img/);
  const p=manifest.fields.find(f=>f.key.startsWith('promotion.description.'));
  store.set(p.key,'A new promotion.');
  for(const el of document.querySelectorAll('.local-offer p:not(.eyebrow)'))assert.equal(el.textContent,'A new promotion.');
});
test('SEO, enquiry structure, CSS and existing scripts are retained',async()=>{
  const {document}=fixture();const source=parseHTML(await readFile('index.html','utf8')).document;
  assert.equal(document.title,source.title);
  for(const meta of source.querySelectorAll('meta'))assert.ok(document.head.innerHTML.includes(meta.outerHTML));
  assert.equal(document.querySelector('script[type="application/ld+json"]').textContent,source.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(document.getElementById('contact-form').innerHTML.replace(/ data-content-target="[^"]+"/g,''),source.getElementById('contact-form').innerHTML);
  assert.equal(await readFile('dist/styles.css','utf8'),await readFile('styles.css','utf8'));
  assert.equal(await readFile('dist/process-animation.js','utf8'),await readFile('process-animation.js','utf8'));
  assert.equal(document.querySelectorAll('[contenteditable]').length,0);
  assert.equal(document.querySelector('script[src="/admin/editor.js"]'),null);
});
