import {WebsiteContent,formatPrice} from './core.mjs';
import {validateField,UUID} from './cms-validation.mjs';
const source=document.currentScript;
const origin=new URL(source.dataset.cmsOrigin||source.src).origin;
const site=source.dataset.site;
if(source.dataset.isolatedPreview==='true')document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();},true);
const manifest=window.PSS_CONTENT_MANIFEST;
if(manifest)window.PSSContent=new WebsiteContent(manifest);
let fields=[],pending=false;
const key='pss-cms-published:'+site;
function apply(data,photoUrls={}) {
  if(!data?.values||!Array.isArray(data.fields))throw new Error('Invalid content');
  fields=data.fields;
  for(const f of fields)if(!validateField(f,data.values[f.key]))throw new Error('Invalid field');
  if(window.PSSContent)window.PSSContent.accept({revision:data.revision||0,values:data.values});
  for(const f of fields) {
    const elements=document.querySelectorAll(f.selector||'[data-cms-field="'+f.key+'"]');
    for(const el of elements){
      const value=data.values[f.key];
      if(f.type==='photo'&&el.tagName==='IMG'){
        if(value){el.src=photoUrls[value]||(UUID.test(value)?origin+'/api/media?id='+value:new URL(value,f.defaultOrigin==='cms'?origin:location.origin).href);el.hidden=false;}
        else el.hidden=true;
      }else if(!manifest){el.textContent=f.type==='price'?formatPrice(value):String(value);}
      if(f.contactLink&&el.tagName==='A'){
        if(f.type==='email')el.setAttribute('href','mailto:'+value);
        if(f.type==='phone')el.setAttribute('href','tel:'+value.replace(/[^+0-9]/g,''));
      }
    }
  }
}
async function refresh(){
  if(pending||document.hidden||window.parent!==window&&previewing)return;
  pending=true;
  try {
    const r=await fetch(origin+'/api/content?site='+encodeURIComponent(site),{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw new Error('Unavailable');
    const data=await r.json();
    // A draft may arrive while the initial public request is still in flight.
    if(window.parent!==window&&previewing)return;
    apply(data);try{localStorage.setItem(key,JSON.stringify(data));}catch{}
  }catch{/* Keep original HTML or the last successfully fetched published content. */}finally{pending=false;}
}
let previewing=false;
if(manifest)window.PSSContent.apply();
try{const cached=JSON.parse(localStorage.getItem(key));if(cached)apply(cached);}catch{}
refresh();addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);setInterval(refresh,60000);
addEventListener('message',e=>{
  if(window.parent===window||e.source!==window.parent||e.origin!==origin||e.data?.type!=='pss-cms-preview'||e.data?.site!==site)return;
  try {apply(e.data.content,e.data.photos);previewing=true;
    // Contain Safari/phone scrolling inside this verified private preview.
    document.documentElement.style.overscrollBehavior='none';
    document.body.style.overscrollBehavior='none';
    if(['monthly','onetime'].includes(e.data.pricingMode))window.PSSContent?.setPricingMode(e.data.pricingMode);
    document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',ev=>ev.preventDefault(),{once:false}));
    const target=e.data.section&&document.getElementById(e.data.section);
    // Scroll this iframe only; scrollIntoView also moves the surrounding editor.
    if(target){const margin=parseFloat(getComputedStyle(target).scrollMarginTop)||0;window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-margin),behavior:'instant'});}
  }catch{}
});

