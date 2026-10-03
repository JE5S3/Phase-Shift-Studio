import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {parseHTML} from 'linkedom';
import {CMS_ORIGIN} from '../content/central-cms.mjs';
const runtime=await readFile('dist/cms-runtime.js','utf8');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function run(document,window,{fetchImpl,manifest,framed=false}={}){
  Object.defineProperty(document,'currentScript',{value:document.querySelector('script[src="/cms-runtime.js"]')});
  window.parent=framed?{}:window;window.PSS_CONTENT_MANIFEST=manifest;window.PSSContent=undefined;
  const events={},cache=new Map();
  vm.runInNewContext(runtime,{document,window,URL,AbortSignal,CustomEvent:window.CustomEvent,location:{origin:'https://phaseshiftstudio.com.au'},localStorage:{getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)},fetch:fetchImpl||(async()=>{throw new Error('Content service unavailable');}),setInterval:()=>0,addEventListener:(name,fn)=>events[name]=fn});
  return {events,cache};
}
test('the public build connects the approved fields while the retained editor keeps its original manifest',async()=>{
  const {document}=parseHTML(await readFile('dist/index.html','utf8'));
  const script=document.querySelector('script[src="/cms-runtime.js"]');
  assert.equal(script.dataset.cmsOrigin,CMS_ORIGIN);assert.equal(script.dataset.site,'phase-shift-studio');
  assert.equal(script.hasAttribute('data-isolated-preview'),false);
  assert.equal(document.querySelector('script[src="/content-runtime.js"]'),null);
  assert.equal(document.querySelectorAll('.work-visual img[data-cms-field]').length,4);
  const legacy=JSON.parse(await readFile('content/manifest.generated.json','utf8'));
  const current=JSON.parse(await readFile('content/cms-manifest.generated.json','utf8'));
  const fallback=JSON.parse(await readFile('content/central-cms-fallback.json','utf8'));
  assert.equal(current.fields.length,legacy.fields.length+5);
  for(const field of current.fields)assert.deepEqual(field.value,fallback.values[field.key]);
  assert(!legacy.fields.some(f=>f.key==='contact.address'));
  assert((await readFile('dist/admin/index.html','utf8')).includes('/content-runtime.js'));
});
test('a CMS outage preserves the current published text and both payment options',async()=>{
  const {document,window}=parseHTML(await readFile('dist/index.html','utf8'));
  const manifest=JSON.parse(await readFile('content/cms-manifest.generated.json','utf8'));
  run(document,window,{manifest});await tick();
  assert.equal(document.getElementById('hero-title').textContent.replace(/\s+/g,''),'SOFTWARETHATFITSHOWYOUWORK.');
  assert.equal(document.querySelector('.landing [data-price] strong').textContent,'$99');
  window.PSSContent.setPricingMode('onetime');
  assert.equal(document.querySelector('.landing [data-price] strong').textContent,'$792');
});
test('the standalone runtime requests the CMS origin and keeps private previews out of its public cache',async()=>{
  const {document,window}=parseHTML('<html><head><script src="/cms-runtime.js" data-cms-origin="'+CMS_ORIGIN+'" data-site="phase-shift-studio"></script></head><body><h1 data-cms-field="hero.heading">Fallback</h1></body></html>');
  const content=text=>({revision:1,fields:[{key:'hero.heading',type:'text',maxLength:200,default:'Fallback'}],values:{'hero.heading':text}});
  const requests=[];const {events,cache}=run(document,window,{framed:true,fetchImpl:async url=>{requests.push(url);return {ok:true,json:async()=>content('Published')};}});
  await tick();assert.deepEqual(requests,[CMS_ORIGIN+'/api/content?site=phase-shift-studio']);
  const event={source:window.parent,origin:'https://phaseshiftstudio.com.au',data:{type:'pss-cms-preview',site:'phase-shift-studio',content:content('Private draft')}};
  events.message(event);assert.equal(document.querySelector('h1').textContent,'Published');
  events.message({...event,origin:CMS_ORIGIN,source:{}});assert.equal(document.querySelector('h1').textContent,'Published');
  events.message({...event,origin:CMS_ORIGIN});assert.equal(document.querySelector('h1').textContent,'Private draft');
  assert.equal(JSON.parse(cache.get('pss-cms-published:phase-shift-studio')).values['hero.heading'],'Published');
});

test('the real website loads published headings and accepts private drafts from the custom editor domain',async()=>{
  const editorOrigin='https://edit.phaseshiftstudio.com.au';
  const html=await readFile('dist/index.html','utf8');
  const manifest=JSON.parse(await readFile('content/cms-manifest.generated.json','utf8'));
  const fields=manifest.fields.map(f=>({key:f.key,type:f.type,maxLength:f.maxLength,default:f.value}));
  const fallback=JSON.parse(await readFile('content/central-cms-fallback.json','utf8'));
  const content=heading=>({revision:42,fields,values:{...fallback.values,'hero.heading.text_1':heading}});
  const {document,window}=parseHTML(html);
  const requests=[];
  run(document,window,{manifest,fetchImpl:async url=>{requests.push(url);return {ok:true,json:async()=>content('SOFTWARE!!')};}});
  await tick();
  assert.deepEqual(requests,[editorOrigin+'/api/content?site=phase-shift-studio']);
  assert.match(document.getElementById('hero-title').textContent,/SOFTWARE!!/);

  const framed=parseHTML(html);
  const {events,cache}=run(framed.document,framed.window,{manifest,framed:true,fetchImpl:async()=>({ok:true,json:async()=>content('SOFTWARE!!')})});
  await tick();
  const event={source:framed.window.parent,origin:editorOrigin,data:{type:'pss-cms-preview',site:'phase-shift-studio',content:content('PRIVATE DRAFT')}};
  events.message({...event,origin:'https://untrusted.example'});
  assert.match(framed.document.getElementById('hero-title').textContent,/SOFTWARE!!/);
  events.message(event);
  assert.match(framed.document.getElementById('hero-title').textContent,/PRIVATE DRAFT/);
  assert.equal(JSON.parse(cache.get('pss-cms-published:phase-shift-studio')).values['hero.heading.text_1'],'SOFTWARE!!');
  const config=JSON.parse(await readFile('vercel.json','utf8'));
  assert(config.redirects.filter(r=>r.source.startsWith('/admin')).every(r=>r.destination===editorOrigin+'/'));
});
