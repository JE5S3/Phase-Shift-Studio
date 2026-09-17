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
}
addEventListener('scroll',()=>{if(!scrollScheduled){scrollScheduled=true;requestAnimationFrame(updateNavigation);}},{passive:true});updateNavigation();

const pricingData={
 monthly:{description:'Lower upfront cost. Support + updates included.',note:'Monthly website plans include support, hosting and smaller improvements.',landing:{price:'<span>starting from:</span><strong>$99</strong><span>/ month</span>',features:['Design + build included','Managed hosting included','Small content updates','Google Business Profile creation']},website:{price:'<span>starting from:</span><strong>$199</strong><span>/ month</span>',features:['Custom multi-page website','Managed hosting included','Ongoing content updates','Support + maintenance']}},
 onetime:{description:'Pay once. Own the finished build.',note:'Every project is quoted around the work that is actually useful. Ongoing website support can be discussed separately.',landing:{price:'<span>starting from:</span><strong>$499</strong><span>one-time</span>',features:['Single high-impact page','Mobile responsive design','Contact / enquiry flow','Basic SEO setup','Google Business Profile creation']},website:{price:'<span>starting from:</span><strong>$1,450</strong><span>one-time</span>',features:['Multi-page custom website','Workflow-focused UX','Responsive development','Launch + handover']}}
};
document.querySelectorAll('[data-pricing-mode]').forEach(button=>button.addEventListener('click',()=>{
 const mode=button.dataset.pricingMode;
 if(window.PSSContent){window.PSSContent.setPricingMode(mode);return;}
 const data=pricingData[mode];
 document.querySelectorAll('[data-pricing-mode]').forEach(b=>{b.setAttribute('aria-pressed',String(b===button));b.classList.toggle('active',b===button);});
 document.getElementById('pricing-mode-description').textContent=data.description;
 document.getElementById('pricing-note').textContent=data.note;
 for(const plan of ['landing','website']){const card=document.querySelector(`[data-plan="${plan}"]`);card.querySelector('[data-price]').innerHTML=data[plan].price;card.querySelector('[data-features]').innerHTML=data[plan].features.map(f=>`<li>${f}</li>`).join('');}
 const badge=document.querySelector('.landing .price-badge');badge.textContent=mode==='monthly'?'$0 CREATION FEE':'ONE-TIME BUILD';
}));
document.querySelectorAll('.price-card').forEach(card=>{
 const reset=()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');card.style.setProperty('--mx','50%');card.style.setProperty('--my','0%');};
 card.addEventListener('pointermove',e=>{if(reduceMotion.matches||!finePointer.matches||e.pointerType==='touch')return;const box=card.getBoundingClientRect(),x=(e.clientX-box.left)/box.width,y=(e.clientY-box.top)/box.height;card.style.setProperty('--rx',`${(0.5-y)*5}deg`);card.style.setProperty('--ry',`${(x-0.5)*7}deg`);card.style.setProperty('--mx',`${x*100}%`);card.style.setProperty('--my',`${y*100}%`);});
 card.addEventListener('pointerleave',reset);reduceMotion.addEventListener('change',reset);finePointer.addEventListener('change',reset);
});

const processSection=document.querySelector('.process-section');
const track=document.querySelector('.process-track');
const rows=[...document.querySelectorAll('.process-row')];
const highlight=document.querySelector('.process-highlight');
// A clipped, aria-hidden copy keeps text white exactly where the highlight travels.
// The semantic list below remains the single accessible source of process content.
const highlightCopy=document.querySelector('.process-list').cloneNode(true);
highlightCopy.classList.add('highlight-copy');highlightCopy.setAttribute('aria-hidden','true');
highlight.append(highlightCopy);
const pauseButton=document.getElementById('process-pause');
let stepIndex=0,timer=null,manualPause=false,hoverPause=false,focusPause=false,visible=false;
function drawHighlight(){
 const row=rows[stepIndex];track.style.setProperty('--process-y',row.offsetTop+'px');highlight.style.height=row.offsetHeight+'px';highlight.style.backgroundColor=stepIndex%2?'#101115':'#c9141e';
 rows.forEach((r,i)=>r.classList.toggle('is-active',!reduceMotion.matches&&i===stepIndex));
 highlightCopy.style.transform=`translateY(-${row.offsetTop}px)`;
 [...highlightCopy.children].forEach((r,i)=>r.style.height=rows[i].offsetHeight+'px');
 track.classList.toggle('is-running',!reduceMotion.matches);
}
function syncProcess(){
 clearInterval(timer);timer=null;pauseButton.hidden=reduceMotion.matches;
 processSection.classList.toggle('is-paused',manualPause||hoverPause||focusPause);
 if(reduceMotion.matches){track.classList.remove('is-running');rows.forEach(r=>r.classList.remove('is-active'));return;}
 drawHighlight();
 if(visible&&!document.hidden&&!manualPause&&!hoverPause&&!focusPause)timer=setInterval(()=>{stepIndex=(stepIndex+1)%rows.length;drawHighlight();},3000);
}
pauseButton.addEventListener('click',()=>{manualPause=!manualPause;pauseButton.setAttribute('aria-pressed',String(manualPause));pauseButton.innerHTML=manualPause?'Resume highlight <span aria-hidden="true">▷</span>':'Pause highlight <span aria-hidden="true">Ⅱ</span>';syncProcess();});
track.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hoverPause=true;syncProcess();}});track.addEventListener('pointerleave',()=>{hoverPause=false;syncProcess();});
processSection.addEventListener('focusin',()=>{focusPause=true;syncProcess();});processSection.addEventListener('focusout',e=>{if(!processSection.contains(e.relatedTarget)){focusPause=false;syncProcess();}});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncProcess();},{threshold:.1}).observe(track);
new ResizeObserver(drawHighlight).observe(track);
reduceMotion.addEventListener('change',syncProcess);document.addEventListener('visibilitychange',syncProcess);syncProcess();

// Re-entering the viewport replays the red heading ignition; reduced motion stays static.
const glowingHeadings=[...document.querySelectorAll('.section-heading .eyebrow,.hero-kicker,.founder-copy>.eyebrow,.community-grid .eyebrow,.contact-copy>.eyebrow,.hero-copy h1>span,.community-grid h2>span,.contact-copy h2>span')];
let headingObserver;
function configureHeadingGlow(){
 headingObserver?.disconnect();
 glowingHeadings.forEach(el=>{el.classList.add('glow-ready');el.classList.remove('glow-visible');});
 if(reduceMotion.matches){glowingHeadings.forEach(el=>el.classList.add('glow-visible'));return;}
 headingObserver=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('glow-visible',entry.isIntersecting);},{threshold:.2,rootMargin:'-88px 0px -12% 0px'});
 glowingHeadings.forEach(el=>headingObserver.observe(el));
}
configureHeadingGlow();reduceMotion.addEventListener('change',configureHeadingGlow);


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
