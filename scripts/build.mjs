import {readFile,writeFile,mkdir,copyFile,cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';
import {build} from 'esbuild';
import {targets,pricing} from '../content/definition.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
// Local .env is optional. Vercel injects these values at build time.
try {
  for(const line of (await readFile(path.join(root,'.env'),'utf8')).split(/\r?\n/)) {
    const m=line.match(/^([A-Z_]+)=(.*)$/);
    if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');
  }
} catch(e){if(e.code!=='ENOENT')throw e;}
const url=(process.env.SUPABASE_URL||'').replace(/\/$/,'');
const key=process.env.SUPABASE_PUBLISHABLE_KEY||'';
if(Boolean(url)!==Boolean(key))throw new Error('Set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
if(url&&!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw new Error('Use the HTTPS Supabase project URL.');
if(key.startsWith('sb_secret_'))throw new Error('Secret Supabase keys must never be bundled.');
if(key.split('.').length===3) {
  let claims;try{claims=JSON.parse(Buffer.from(key.split('.')[1],'base64url').toString());}catch{throw new Error('Invalid anon key');}
  if(claims.role!=='anon')throw new Error('Only a publishable key or legacy anon key may be bundled.');
} else if(key&&!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))throw new Error('Use a Supabase publishable key.');
await mkdir(path.join(out,'admin'),{recursive:true});
await mkdir(path.join(root,'supabase'),{recursive:true});
const source=await readFile(path.join(root,'index.html'),'utf8');
const {document}=parseHTML(source);
const manifest={version:1,fields:[],targets:[]};
const seen=new Set();
function field(key,value,type='text',maxLength=2000){
  if(seen.has(key))throw new Error('Duplicate field '+key);
  seen.add(key);manifest.fields.push({key,section:key.split('.')[0],type,value,maxLength});
}
function textBindings(element,id,exclude){
  const bindings=[];
  function walk(node,indices){
    if(node.nodeType===3) {
      const value=node.nodeValue.trim();if(!value||value==='/')return;
      const key=id+'.text_'+(bindings.length+1);
      field(key,value,'text',/heading|title|cta|badge|label|category/.test(id)?300:2000);
      bindings.push({key,path:indices,before:node.nodeValue.match(/^\s*/)[0],after:node.nodeValue.match(/\s*$/)[0]});
    } else if(node.nodeType===1) {
      if(node.getAttribute('aria-hidden')==='true')return;
      if(node!==element&&exclude&&node.matches(exclude))return;
      [...node.childNodes].forEach((child,i)=>walk(child,[...indices,i]));
    }
  }
  walk(element,[]);return bindings;
}
for(const target of targets){
  const elements=[...document.querySelectorAll(target.selector)];
  if(!elements.length)throw new Error('Missing editable target '+target.id+' ('+target.selector+')');
  const bindings=textBindings(elements[0],target.id,target.exclude);
  const targetMarkup=elements[0].innerHTML;
  for(const el of elements){
    if(el.hasAttribute('data-content-target'))throw new Error('Overlapping field '+target.id);
    if(el.innerHTML!==targetMarkup)throw new Error('Shared fields differ: '+target.id);
    el.setAttribute('data-content-target',target.id);
  }
  manifest.targets.push({id:target.id,bindings});
}
field('pricing.prefix',pricing.prefix,'text',100);
for(const mode of ['monthly','onetime']){
  for(const name of ['description','note'])field('pricing.'+mode+'.'+name,pricing[mode][name]);
  if(mode==='monthly'){
    field('pricing.monthly.badge_label',pricing.monthly.badgeLabel,'text',100);
    field('pricing.monthly.landing.creation_fee',pricing.monthly.creationFee,'price');
  }else field('pricing.onetime.badge',pricing.onetime.badge,'text',100);
  for(const plan of ['landing','website']){
    const base='pricing.'+mode+'.'+plan+'.';const p=pricing[mode][plan];
    field(base+'price',p.price,'price');
    field(base+'suffix',p.suffix,'text',100);
    p.features.forEach((value,i)=>field(base+'feature_'+(i+1),value,'text',300));
  }
}
const originalScripts=[...document.querySelectorAll('script[src]')].map(s=>s.getAttribute('src'));
await writeFile(path.join(out,'admin/site-template.html'),document.toString());
const anchor=document.querySelector('script[src]');
for(const src of ['/content-data.js','/content-runtime.js']) {
  const s=document.createElement('script');s.src=src;anchor.before(s);
}
const apply=document.createElement('script');apply.textContent='window.PSSContent.apply();';document.body.append(apply);
await writeFile(path.join(out,'index.html'),document.toString());
await writeFile(path.join(out,'content-data.js'),'window.PSS_CONTENT_CONFIG='+JSON.stringify({url,key})+
  ';\nwindow.PSS_CONTENT_MANIFEST='+JSON.stringify(manifest)+';\n');
await build({entryPoints:[path.join(root,'content/runtime.mjs')],bundle:true,format:'iife',target:'es2022',
  outfile:path.join(out,'content-runtime.js'),minify:true});
await build({entryPoints:[path.join(root,'admin/editor.mjs')],bundle:true,format:'iife',target:'es2022',
  outfile:path.join(out,'admin/editor.js'),minify:true});
let shell=await readFile(path.join(root,'admin/index.html'),'utf8');
const fonts=[...document.head.querySelectorAll('link[href*="fonts."]')].map(el=>el.outerHTML).join('\n');
shell=shell.replace('<!-- EXISTING FONTS -->',fonts);
await writeFile(path.join(out,'admin/index.html'),shell);
for(const name of ['styles.css','script.js','process-animation.js','privacy.html','terms.html','favicon.png','favicon.svg','sitemap.xml','CNAME']){
  await copyFile(path.join(root,name),path.join(out,name));
}
await cp(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
await copyFile(path.join(root,'admin/editor.css'),path.join(out,'admin/editor.css'));
let robots=await readFile(path.join(root,'robots.txt'),'utf8');
robots=robots.replace('Allow: /','Allow: /\nDisallow: /admin');
await writeFile(path.join(out,'robots.txt'),robots);
// Adding fields never overwrites existing saved content.
const rows=manifest.fields.map(f=>({section:f.section,content_key:f.key,content_type:f.type,
  content_value:f.value,max_length:f.maxLength}));
await writeFile(path.join(root,'supabase/seed.sql'),
  '-- Generated from the current page. Safe to rerun: existing values are preserved.\n'+
  'insert into public.website_content (section, content_key, content_type, content_value, max_length)\n'+
  'select section, content_key, content_type, content_value, max_length\n'+
  'from jsonb_to_recordset($seed$'+JSON.stringify(rows,null,2)+'$seed$::jsonb)\n'+
  'as x(section text, content_key text, content_type text, content_value jsonb, max_length integer)\n'+
  'on conflict (content_key) do nothing;\n');
await writeFile(path.join(root,'content/manifest.generated.json'),JSON.stringify(manifest,null,2));
console.log('Built unchanged site + /admin; '+manifest.fields.length+' editable fields.');
if(!url)console.log('Supabase unconfigured: public fallback works; /admin login is disabled until configured.');
