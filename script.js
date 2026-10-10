// Existing enquiry integration; blocked in this local draft by preview-guard.js and preview-server policy.
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



// Progressive enhancement: all navigation, content and default prices exist in HTML.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const siteHeader = document.querySelector('.site-header');
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('aria-hidden', 'true');
document.body.prepend(scrollProgress);
document.body.classList.add('js-ready');
menuButton.hidden = matchMedia('(min-width: 701px)').matches;
function closeMenu(restoreFocus=false){document.body.classList.remove('menu-open');menuButton.setAttribute('aria-expanded','false');if(restoreFocus)menuButton.focus();}
menuButton.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menuButton.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('menu-open'))closeMenu(true);});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
document.addEventListener('focusin',e=>{if(!e.target.closest('.site-header'))closeMenu();});
const mobileQuery=matchMedia('(max-width:700px)');
mobileQuery.addEventListener('change',e=>{menuButton.hidden=!e.matches;closeMenu();});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
  closeMenu();
  const target=document.querySelector(link.getAttribute('href'));
  if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
  const type=link.dataset.enquiry;
  if(type){const field=form.elements.type;field.value=type==='Custom Website'?'Website':type;}
}));
const destinations=[['top','top'],['work','work'],['services','services'],['process','services'],['workflow','services'],['community','community'],['contact','contact']];
let scrollScheduled=false;
function updateNavigation(){
  scrollScheduled=false;let active='top';
  for(const [id,navId] of destinations){if(document.getElementById(id).getBoundingClientRect().top<=170)active=navId;}
  navigation.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  const scrollRange=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  scrollProgress.style.transform=`scaleX(${Math.min(1,Math.max(0,scrollY/scrollRange))})`;
  siteHeader.classList.toggle('is-scrolled',scrollY>18);
}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateNavigation);}},{passive:true});updateNavigation();
addEventListener('resize',updateNavigation,{passive:true});
new ResizeObserver(updateNavigation).observe(document.documentElement);

const pricingData={
 monthly:{description:'Lower upfront cost. Support + updates included.',note:'Monthly website plans include support, hosting and smaller improvements.',landing:{price:'<span>starting from:</span><strong>$99</strong><span>/ month</span>',features:['Design + build included','Managed hosting included','Small content updates','Google Business Profile creation']},website:{price:'<span>starting from:</span><strong>$179</strong><span>/ month</span>',features:['Custom multi-page website','Managed hosting included','Ongoing content updates','Support + maintenance']}},
 onetime:{description:'Pay once. Own the finished build.',note:'Every project is quoted around the work that is actually useful. Ongoing website support can be discussed separately.',landing:{price:'<span>starting from:</span><strong>$800</strong><span>one-time</span>',features:['Single high-impact page','Mobile responsive design','Contact / enquiry flow','Basic SEO setup','Google Business Profile creation']},website:{price:'<span>starting from:</span><strong>$1,790</strong><span>one-time</span>',features:['Multi-page custom website','Workflow-focused UX','Responsive development','Launch + handover']}}
};
const pricingButtons=[...document.querySelectorAll('[data-pricing-mode]')];
const pricingGrid=document.querySelector('.pricing-grid');
let pricingTransitioning=false;
function applyPricingMode(mode,button){
 if(window.PSSContent){window.PSSContent.setPricingMode(mode);return;}
 const data=pricingData[mode];
 pricingButtons.forEach(b=>{b.setAttribute('aria-pressed',String(b===button));b.classList.toggle('active',b===button);});
 document.getElementById('pricing-mode-description').textContent=data.description;
 document.getElementById('pricing-note').textContent=data.note;
 for(const plan of ['landing','website']){const card=document.querySelector(`[data-plan="${plan}"]`);card.querySelector('[data-price]').innerHTML=data[plan].price;card.querySelector('[data-features]').innerHTML=data[plan].features.map(f=>`<li>${f}</li>`).join('');}
 const badge=document.querySelector('.landing .price-badge');badge.textContent=mode==='monthly'?'$0 CREATION FEE':'ONE-TIME BUILD';
}
async function changePricingMode(mode,button){
 if(pricingTransitioning||button.classList.contains('active'))return;
 const cards=[...document.querySelectorAll('.price-card')];
 if(reduceMotion.matches||!cards.length){applyPricingMode(mode,button);return;}
 pricingTransitioning=true;pricingGrid.classList.add('pricing-is-flipping');pricingGrid.setAttribute('aria-busy','true');
 pricingButtons.forEach(b=>b.disabled=true);
 const direction=mode==='onetime'?1:-1,duration=700,stagger=65;
 const frames=[
  {offset:0,transform:'translateY(0) rotateY(0deg) scale(1)',filter:'brightness(1)',opacity:1},
  {offset:.43,transform:`translateY(-18px) rotateY(${direction*82}deg) scale(.975)`,filter:'brightness(.82)',opacity:1},
  {offset:.499,transform:`translateY(-18px) rotateY(${direction*90}deg) scale(.975)`,filter:'brightness(.76)',opacity:.18},
  {offset:.501,transform:`translateY(-18px) rotateY(${-direction*90}deg) scale(.975)`,filter:'brightness(.76)',opacity:.18},
  {offset:.57,transform:`translateY(-18px) rotateY(${-direction*82}deg) scale(.975)`,filter:'brightness(.82)',opacity:1},
  {offset:1,transform:'translateY(0) rotateY(0deg) scale(1)',filter:'brightness(1)',opacity:1}
 ];
 try{
  const turns=cards.map((card,index)=>card.animate(frames,{duration,delay:index*stagger,easing:'cubic-bezier(.42,0,.18,1)',fill:'forwards'}));
  await new Promise(resolve=>setTimeout(resolve,duration/2+stagger*(cards.length-1)/2));
  applyPricingMode(mode,button);
  await Promise.all(turns.map(animation=>animation.finished));turns.forEach(animation=>animation.cancel());
 }finally{
  pricingGrid.classList.remove('pricing-is-flipping');pricingGrid.removeAttribute('aria-busy');pricingButtons.forEach(b=>b.disabled=false);pricingTransitioning=false;
 }
}
pricingButtons.forEach(button=>button.addEventListener('click',()=>changePricingMode(button.dataset.pricingMode,button)));
document.querySelectorAll('.price-card').forEach(card=>{
 const reset=()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');card.style.setProperty('--mx','50%');card.style.setProperty('--my','0%');};
 card.addEventListener('pointermove',e=>{if(reduceMotion.matches||!finePointer.matches||e.pointerType==='touch')return;const box=card.getBoundingClientRect(),x=(e.clientX-box.left)/box.width,y=(e.clientY-box.top)/box.height;card.style.setProperty('--rx',`${(0.5-y)*5}deg`);card.style.setProperty('--ry',`${(x-0.5)*7}deg`);card.style.setProperty('--mx',`${x*100}%`);card.style.setProperty('--my',`${y*100}%`);});
 card.addEventListener('pointerleave',reset);reduceMotion.addEventListener('change',reset);finePointer.addEventListener('change',reset);
});

// Delegation keeps the trace attached when published CMS content refreshes the cards.
document.addEventListener('mouseover',e=>{const card=e.target.closest?.('.work-card');if(card&&!card.contains(e.relatedTarget)&&!reduceMotion.matches)card.classList.add('trace-active');});
document.addEventListener('mouseout',e=>{const card=e.target.closest?.('.work-card');if(card&&!card.contains(e.relatedTarget))card.classList.remove('trace-active');});
document.addEventListener('focusin',e=>{const card=e.target.closest?.('.work-card');if(card&&!reduceMotion.matches)card.classList.add('trace-active');});
document.addEventListener('focusout',e=>{const card=e.target.closest?.('.work-card');if(card&&!card.contains(e.relatedTarget))card.classList.remove('trace-active');});
reduceMotion.addEventListener('change',()=>document.querySelectorAll('.work-card').forEach(card=>card.classList.remove('trace-active')));

// Re-entering the viewport replays the red heading ignition; reduced motion stays static.
const glowingHeadings=[...document.querySelectorAll('.section-heading .eyebrow,.hero-kicker,.founder-copy>.eyebrow,.community-grid .eyebrow,.contact-copy>.eyebrow,.hero-line-accent .hero-line-inner,.community-grid h2>span,.contact-copy h2>span')];
let headingObserver;
function configureHeadingGlow(){
 headingObserver?.disconnect();
 glowingHeadings.forEach(el=>{el.classList.add('glow-ready');el.classList.remove('glow-visible');});
 if(reduceMotion.matches){glowingHeadings.forEach(el=>el.classList.add('glow-visible'));return;}
 headingObserver=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('glow-visible',entry.isIntersecting);},{threshold:.2,rootMargin:'-88px 0px -12% 0px'});
 glowingHeadings.forEach(el=>headingObserver.observe(el));
}
configureHeadingGlow();reduceMotion.addEventListener('change',configureHeadingGlow);

// The hero remains readable without JavaScript; motion is added only after setup succeeds.
function configureHeroEntrance(){
 document.body.classList.remove('motion-enhanced','hero-motion-ready');
 if(reduceMotion.matches)return;
 document.body.classList.add('motion-enhanced');
 requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.add('hero-motion-ready')));
}
configureHeroEntrance();reduceMotion.addEventListener('change',configureHeroEntrance);

// One-time section reveals keep content visible by default and reveal focused content immediately.
const revealItems=[...document.querySelectorAll([
 '#work .section-heading','.work-disclosure','.work-grid',
 '#services > .section-heading','.service-grid','.service-foot',
 '#pricing .section-heading','.pricing-toolbar','.pricing-grid','.editor-portal-offer',
 '.local-offer','#process .section-heading','.process-track',
 '.founder-mark','.founder-copy','.community-grid','.community-future',
 '.contact-copy','.contact-form'
].join(','))];
for(const item of revealItems)item.dataset.reveal='';
let revealObserver;
function showReveal(item){item.classList.remove('motion-pending');revealObserver?.unobserve(item);}
function configureReveals(){
 revealObserver?.disconnect();revealItems.forEach(item=>item.classList.remove('motion-pending'));
 if(reduceMotion.matches||!('IntersectionObserver' in window))return;
 revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)showReveal(entry.target);},{rootMargin:'0px 0px -6% 0px',threshold:.08});
 for(const item of revealItems){if(item.getBoundingClientRect().top>=innerHeight*.82)item.classList.add('motion-pending');revealObserver.observe(item);}
}
document.addEventListener('focusin',event=>{const item=event.target.closest('[data-reveal]');if(item)showReveal(item);});
configureReveals();reduceMotion.addEventListener('change',configureReveals);


// Offer borders use the same longer arrival and ember timing as red headings.
const glowingOffers=[...document.querySelectorAll('.local-offer')];
let offerObserver;
function configureOfferGlow(){
 offerObserver?.disconnect();
 glowingOffers.forEach(el=>el.classList.remove('offer-glow-visible'));
 if(reduceMotion.matches)return;
 offerObserver=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('offer-glow-visible',entry.isIntersecting);},{threshold:.15,rootMargin:'-88px 0px -10% 0px'});
 glowingOffers.forEach(el=>offerObserver.observe(el));
}
configureOfferGlow();reduceMotion.addEventListener('change',configureOfferGlow);
