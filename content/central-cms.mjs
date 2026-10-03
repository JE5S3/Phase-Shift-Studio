import {WebsiteContent,validateValue} from './core.mjs';
export const CMS_ORIGIN='https://phase-shift-cms.vercel.app';

// Extend the public page only. The retained legacy editor keeps its original manifest.
export function connectCentralCms(document,manifest,fallback){
  for(const [key,selector] of [['contact.email','.contact-direct a[href^="mailto:"]'],['contact.phone','.contact-direct a[href^="tel:"]']]){
    const element=document.querySelector(selector);
    const node=element&&[...element.childNodes].find(n=>n.nodeType===3&&n.nodeValue.trim());
    if(!node)throw new Error('Missing contact binding '+key);
    const index=[...element.childNodes].indexOf(node);element.setAttribute('data-content-target',key);
    manifest.targets.push({id:key,bindings:[{key,path:[index],before:node.nodeValue.match(/^\s*/)[0],after:node.nodeValue.match(/\s*$/)[0]}]});
    manifest.fields.push({key,type:'text',section:'contact',value:node.nodeValue.trim(),maxLength:200});
  }
  function infoSpan(key,value){
    const span=document.createElement('span');span.textContent=value;span.setAttribute('data-content-target',key);
    manifest.targets.push({id:key,bindings:[{key,path:[0],before:'',after:''}]});
    manifest.fields.push({key,type:'text',section:'info',value,maxLength:200});return span;
  }
  const location=[...document.querySelector('.contact-direct p').childNodes].find(n=>n.nodeType===3&&n.nodeValue.includes(' · '));
  if(!location)throw new Error('Missing contact location');
  const separator=location.nodeValue.indexOf(' · ')+3;
  location.replaceWith(document.createTextNode(location.nodeValue.slice(0,separator)),infoSpan('contact.address',location.nodeValue.slice(separator)));
  const footer=[...document.querySelector('.footer-bottom > span:first-child').childNodes].find(n=>n.nodeType===3&&n.nodeValue.includes(' · ABN '));
  if(!footer)throw new Error('Missing footer location/ABN');
  const [address,abn]=footer.nodeValue.split(' · ABN ');
  footer.replaceWith(infoSpan('footer.address',address),document.createTextNode(' · ABN '),infoSpan('business.abn',abn));
  document.querySelectorAll('.work-visual img').forEach((element,i)=>element.setAttribute('data-cms-field','photos.project_'+(i+1)));
  for(const field of manifest.fields){
    const value=fallback.values[field.key]??field.value;
    if(!validateValue(field,value))throw new Error('Invalid published fallback '+field.key);
    field.value=value;
  }
  const content=new WebsiteContent(manifest,document);
  for(const target of manifest.targets)for(const element of document.querySelectorAll('[data-content-target="'+target.id+'"]'))
    for(const binding of target.bindings){const node=content.nodeAt(element,binding.path);if(!node)throw new Error('Missing public text node '+binding.key);node.nodeValue=binding.before+content.get(binding.key)+binding.after;}
  content.renderPricing();
  document.querySelectorAll('script[src="/content-data.js"],script[src="/content-runtime.js"]').forEach(s=>s.remove());
  document.querySelectorAll('script:not([src])').forEach(s=>{if(s.textContent==='window.PSSContent.apply();')s.remove();});
  const anchor=document.querySelector('script[src]');
  const data=document.createElement('script');data.src='/cms-manifest.js';anchor.before(data);
  const runtime=document.createElement('script');runtime.src='/cms-runtime.js';runtime.setAttribute('data-site','phase-shift-studio');runtime.setAttribute('data-cms-origin',CMS_ORIGIN);anchor.before(runtime);
  return manifest;
}

