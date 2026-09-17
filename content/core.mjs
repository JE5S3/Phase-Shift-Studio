export function validateValue(field, value) {
  if (field.type === 'price') {
    return typeof value === 'number' && Number.isFinite(value) &&
      value >= 0 && value <= 10000000 && Math.abs(Math.round(value * 100) - value * 100) < 0.000001;
  }
  return typeof value === 'string' && value.trim().length > 0 &&
    [...value].length <= field.maxLength && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
}
export function formatPrice(value) {
  return new Intl.NumberFormat('en-AU', {style:'currency', currency:'AUD',
    minimumFractionDigits:Number.isInteger(value)?0:2, maximumFractionDigits:2}).format(value);
}
export class WebsiteContent {
  constructor(manifest, doc = document) {
    this.manifest=manifest; this.document=doc;
    this.fields=new Map(manifest.fields.map(f=>[f.key,f]));
    this.defaults=Object.fromEntries(manifest.fields.map(f=>[f.key,f.value]));
    this.saved={...this.defaults}; this.values={...this.defaults};
    this.revision=null; this.mode='monthly'; this.onChange=()=>{};
  }
  get(key) { return this.values[key] ?? this.defaults[key]; }
  changed() {
    return Object.fromEntries(Object.entries(this.values).filter(([key,val])=>val!==this.saved[key]));
  }
  set(key, value) {
    const field=this.fields.get(key);
    if (!field || !validateValue(field,value)) throw new Error('Enter a valid value for ' + key);
    this.values[key]=value; this.apply(); this.onChange();
  }
  accept(snapshot, requireComplete=false) {
    if (!snapshot || !Number.isSafeInteger(snapshot.revision) || !snapshot.values ||
      typeof snapshot.values !== 'object' || Array.isArray(snapshot.values)) throw new Error('Invalid content response');
    const next={...this.defaults};
    for (const field of this.manifest.fields) {
      const value=snapshot.values[field.key];
      if (value===undefined) {
        if (requireComplete) throw new Error('Content setup is incomplete. Run the latest seed SQL.');
      } else if (validateValue(field,value)) next[field.key]=value;
      else if (requireComplete) throw new Error('Invalid saved content for ' + field.key);
    }
    this.revision=snapshot.revision; this.saved=next; this.values={...next};
    this.apply(); this.onChange();
  }
  revert() {this.values={...this.saved};this.apply();this.onChange();}
  nodeAt(element, path) {
    let node=element;
    for (const i of path) {node=node?.childNodes[i];}
    return node?.nodeType===3?node:null;
  }
  apply() {
    for (const target of this.manifest.targets) {
      for (const element of this.document.querySelectorAll('[data-content-target="' + target.id + '"]')) {
        for (const binding of target.bindings) {
          const node=this.nodeAt(element,binding.path);
          if (node) node.nodeValue=binding.before + this.get(binding.key) + binding.after;
        }
      }
    }
    this.renderPricing();
    this.document.dispatchEvent(new CustomEvent('website-content:rendered'));
  }
  // Dynamic fields keep the original price/feature markup and original styling.
  dynamicText(tag, key, className) {
    const el=this.document.createElement(tag); el.dataset.editKey=key;
    if(className)el.className=className;
    el.textContent=this.fields.get(key).type==='price'?formatPrice(this.get(key)):this.get(key);
    return el;
  }
  renderPricing() {
    const prefix='pricing.' + this.mode + '.';
    for(const plan of ['landing','website']) {
      const card=this.document.querySelector('.price-card[data-plan="' + plan + '"]');
      if(!card)continue;
      card.querySelector('[data-price]').replaceChildren(
        this.dynamicText('span','pricing.prefix'),
        this.dynamicText('strong',prefix + plan + '.price'),
        this.dynamicText('span',prefix + plan + '.suffix'));
      const features=this.manifest.fields.filter(f=>f.key.startsWith(prefix+plan+'.feature_'));
      card.querySelector('[data-features]').replaceChildren(...features.map(f=>this.dynamicText('li',f.key)));
    }
    for(const [selector,key] of [
      ['#pricing-mode-description',prefix+'description'],
      ['#pricing-note',prefix+'note']
    ]) {
      const el=this.document.querySelector(selector);
      if(el){el.textContent=this.get(key);el.dataset.editKey=key;}
    }
    const badge=this.document.querySelector('.landing > .price-badge');
    if(badge){
      if(this.mode==='monthly'){
        badge.textContent=formatPrice(this.get('pricing.monthly.landing.creation_fee'))+' '+this.get('pricing.monthly.badge_label');
        badge.dataset.editKeys='pricing.monthly.landing.creation_fee,pricing.monthly.badge_label';
        delete badge.dataset.editKey;
      }else{
        badge.textContent=this.get('pricing.onetime.badge');
        badge.dataset.editKey='pricing.onetime.badge';delete badge.dataset.editKeys;
      }
    }
  }
  setPricingMode(mode) {
    if(!['monthly','onetime'].includes(mode))return;
    this.mode=mode;
    for(const b of this.document.querySelectorAll('[data-pricing-mode]')) {
      b.classList.toggle('active',b.dataset.pricingMode===mode);
      b.setAttribute('aria-pressed',String(b.dataset.pricingMode===mode));
    }
    this.renderPricing();this.document.dispatchEvent(new CustomEvent('website-content:rendered'));
  }
}
