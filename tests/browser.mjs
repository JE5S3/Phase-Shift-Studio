// Local-only integration tests: all third-party requests are intercepted.
// Install Playwright separately, or set PLAYWRIGHT_MODULE to a bundled index.mjs.
import assert from 'node:assert/strict';
import {readFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {previewServer} from '../scripts/preview.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const browser=await chromium.launch({headless:true,
  ...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
const server=previewServer(4174);
const baselineServer=process.env.BASELINE_ROOT?previewServer(4175,process.env.BASELINE_ROOT):null;
const origin='http://127.0.0.1:4174';
const manifest=JSON.parse(await readFile('content/manifest.generated.json','utf8'));
const defaults=Object.fromEntries(manifest.fields.map(f=>[f.key,f.value]));
const adminId='11111111-1111-4111-8111-111111111111';
const jwt='eyJhbGciOiJIUzI1NiJ9.'+Buffer.from(JSON.stringify({sub:adminId,role:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.mock-signature';
let snapshot={revision:0,values:{...defaults}},isAdmin=true,conflict=false,intakes=0,emails=0,templateRequests=0,writes=0;
const errors=[];
async function context(viewport={width:1440,height:1000},configured=true){
  const ctx=await browser.newContext({viewport});
  await ctx.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.hostname==='127.0.0.1'&&url.port==='4175')return route.continue();
    if(url.origin===origin){
      if(url.pathname==='/content-data.js'&&configured){
        return route.fulfill({contentType:'text/javascript',body:
          'window.PSS_CONTENT_CONFIG='+JSON.stringify({url:'https://testproject.supabase.co',key:'sb_publishable_test'})+
          ';window.PSS_CONTENT_MANIFEST='+JSON.stringify(manifest)+';'});
      }
      if(url.pathname==='/admin/site-template.html')templateRequests++;
      return route.continue();
    }
    if(url.hostname==='testproject.supabase.co'){
      let payload;
      if(url.pathname==='/auth/v1/token')payload={access_token:jwt,refresh_token:'mock-refresh',expires_in:3600,token_type:'bearer',user:{id:adminId,email:'admin@example.test',role:'authenticated',aud:'authenticated',app_metadata:{},user_metadata:{}}};
      else if(url.pathname==='/auth/v1/user')payload={id:adminId,email:'admin@example.test'};
      else if(url.pathname==='/auth/v1/logout')return route.fulfill({status:204});
      else if(url.pathname==='/rest/v1/website_admins')payload=isAdmin?[{user_id:adminId}]:[];
      else if(url.pathname==='/rest/v1/rpc/read_website_content')payload=snapshot;
      else if(url.pathname==='/rest/v1/rpc/save_website_content'){
        writes++;const body=req.postDataJSON();
        if(conflict||body.expected_revision!==snapshot.revision)return route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({message:'CONTENT_CONFLICT',code:'40001'})});
        snapshot={revision:snapshot.revision+1,values:{...snapshot.values,...body.changes}};payload=snapshot;
      }else throw new Error('Unexpected mock request: '+url);
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(payload)});
    }
    if(url.hostname==='txvorfcyvxwmwpkctndg.supabase.co'&&url.pathname.endsWith('/enquiry-intake')){
      intakes++;return route.fulfill({contentType:'application/json',body:'{"ok":true}'});
    }
    if(url.hostname==='api.web3forms.com'){emails++;return route.fulfill({contentType:'application/json',body:'{"success":true}'});}
    // No remote fonts, tracking, auth, emails or other third-party traffic in tests.
    return route.fulfill({status:200,body:''});
  });
  ctx.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  return ctx;
}
async function waitUntil(page,fn){
  await page.waitForFunction(fn,{},{timeout:10000});
}
async function fillEnquiry(page){
  await page.locator('[name="name"]').fill('Test Only');
  await page.locator('[name="email"]').fill('test@example.test');
  await page.locator('[name="type"]').selectOption('Website');
  await page.locator('[name="message"]').fill('Local automated test; no real email is sent.');
  await page.locator('[name="privacyAccepted"]').check();
}
try{
  await mkdir('test-results',{recursive:true});
  for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:780}]){
    const ctx=await context(viewport,false);const page=await ctx.newPage();
    await page.goto(origin);
    await page.waitForSelector('.price strong');
    assert.equal(await page.locator('.landing .price strong').textContent(),'$99');
    assert.equal(await page.locator('.website .price strong').textContent(),'$179');
    assert.equal(await page.locator('.admin-toolbar,[data-editable],[contenteditable]').count(),0);
    const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
      offenders:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,10).map(el=>({tag:el.tagName,cls:el.className,right:el.getBoundingClientRect().right}))}));
    if(viewport.width===320&&baselineServer){
      const baseline=await ctx.newPage();await baseline.goto('http://127.0.0.1:4175');
      const originalOverflow=await baseline.evaluate(()=>document.documentElement.scrollWidth);
      assert.equal(overflow.scroll,originalOverflow,'No new narrow-screen overflow');
      console.log('NOTE: pre-existing 320px overflow preserved ('+originalOverflow+'px); no styling changed.');
      await baseline.close();
    }else assert.ok(overflow.scroll<=overflow.width,JSON.stringify(overflow));
    const invalid=await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(a=>!document.querySelector(a.getAttribute('href'))).map(a=>a.getAttribute('href')));
    assert.deepEqual(invalid,[]);
    await page.locator('[data-pricing-mode="onetime"]').click();
    assert.equal(await page.locator('.landing .price strong').textContent(),'$800');
    assert.equal(await page.locator('.website .price strong').textContent(),'$1,790');
    await page.locator('[data-pricing-mode="monthly"]').click();
    assert.equal(await page.locator('.website .price strong').textContent(),'$179');
    await page.locator('.landing summary').click();assert.ok(await page.locator('.landing details').getAttribute('open')!==null);
    if(viewport.width<701){
      await page.evaluate(()=>scrollTo(0,0));await page.locator('.menu-toggle').click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
      await page.locator('.site-nav a[href="#work"]').click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
    }
    await page.evaluate(()=>scrollTo(0,0));
    await page.screenshot({path:'test-results/public-'+viewport.width+'.png'});
    await ctx.close();
  }
  console.log('PASS: desktop/mobile 1440, 390, 320; pricing, FAQs, nav, no public controls; no introduced overflow.');
  const publicContext=await context();const publicPage=await publicContext.newPage();await publicPage.goto(origin);
  await fillEnquiry(publicPage);await publicPage.locator('#contact-form button').click();
  await waitUntil(publicPage,()=>document.getElementById('form-status').textContent.includes('ENQUIRY SENT'));
  assert.equal(intakes,1);assert.equal(emails,1);
  const firstY=await publicPage.locator('.process-track').evaluate(el=>el.style.getPropertyValue('--process-y'));
  await publicPage.waitForFunction(y=>document.querySelector('.process-track').style.getPropertyValue('--process-y')!==y,firstY,{timeout:5000});
  assert.equal(await publicPage.locator('.process-highlight .highlight-copy').count(),1);
  await publicPage.locator('#process-pause').click();
  assert.equal(await publicPage.locator('#process-pause').getAttribute('aria-pressed'),'true');
  console.log('PASS: public enquiry endpoints preserved (mocked); process animation advances and pause works.');
  // Supabase outage keeps defaults, with no blank content.
  const failContext=await context();await failContext.route('https://testproject.supabase.co/**',r=>r.abort());
  const failPage=await failContext.newPage();await failPage.goto(origin);
  assert.equal(await failPage.locator('.landing .price strong').textContent(),'$99');assert.ok((await failPage.locator('h1').textContent()).includes('SOFTWARE'));
  await failContext.close();
  // Signed-out gate and authenticated-but-unapproved account.
  const rejectContext=await context();const rejectPage=await rejectContext.newPage();await rejectPage.goto(origin+'/admin');
  assert.equal(await rejectPage.locator('.admin-toolbar,[data-editable]').count(),0);
  assert.equal(templateRequests,0);isAdmin=false;
  await rejectPage.locator('[name="email"]').fill('outsider@example.test');await rejectPage.locator('[name="password"]').fill('mock-password');
  await rejectPage.locator('#admin-login button').click();
  await waitUntil(rejectPage,()=>document.getElementById('admin-message').textContent.includes('not authorised'));
  assert.equal(templateRequests,0);assert.equal(await rejectPage.locator('.admin-toolbar').count(),0);
  await rejectContext.close();isAdmin=true;
  console.log('PASS: signed-out and non-allowlisted accounts cannot load the editing interface.');
  const adminContext=await context({width:390,height:844});const adminPage=await adminContext.newPage();await adminPage.goto(origin+'/admin');
  await adminPage.locator('[name="email"]').fill('admin@example.test');await adminPage.locator('[name="password"]').fill('mock-password');
  await adminPage.locator('#admin-login button').click();
  await adminPage.waitForSelector('.admin-toolbar');
  assert.equal(await adminPage.locator('.service-card').count(),4);
  await adminPage.locator('.landing summary').click({position:{x:20,y:20}});
  await adminPage.locator('.landing details p').click();
  assert.equal(await adminPage.locator('.inline-editor textarea').count(),2);
  await adminPage.locator('.inline-editor .done').click();
  await adminPage.locator('.landing .price-badge').click();
  assert.equal(await adminPage.locator('.inline-editor input[type="number"]').count(),1);
  assert.equal(await adminPage.locator('.inline-editor textarea').count(),1);
  await adminPage.locator('.inline-editor button').filter({hasText:'Undo this edit'}).click();
  await adminPage.locator('.landing .price strong').click();
  await adminPage.locator('.inline-editor input').fill('125');
  await adminPage.locator('.inline-editor .done').click();
  assert.ok((await adminPage.locator('.admin-status').textContent()).includes('Unsaved'));
  assert.equal(await adminPage.locator('.landing .price strong').textContent(),'$125');
  await adminPage.locator('.admin-toolbar .save').click();
  await waitUntil(adminPage,()=>document.querySelector('.admin-status').textContent==='Saved ✓');
  assert.equal(snapshot.values['pricing.monthly.landing.price'],125);assert.equal(writes,1);
  await publicPage.reload();await waitUntil(publicPage,()=>document.querySelector('.landing .price strong').textContent==='$125');
  // Edit a segmented heading: red span and line breaks remain.
  const headingText=await adminPage.locator('h1').textContent();
  await adminPage.locator('h1').click();await adminPage.locator('.inline-editor textarea').first().fill('CLEAN SOFTWARE');
  await adminPage.locator('.inline-editor .done').click();
  assert.equal(await adminPage.locator('h1 > span').count(),1);assert.equal(await adminPage.locator('h1 br').count(),2);
  adminPage.once('dialog',d=>d.accept());await adminPage.locator('.admin-toolbar .revert').click();
  assert.equal(await adminPage.locator('h1').textContent(),headingText);
  await adminPage.locator('[data-pricing-mode="onetime"]').click();
  await adminPage.locator('#pricing-mode-description').click();
  assert.equal(await adminPage.locator('.inline-editor textarea').inputValue(),'Pay once. Own the finished build.');
  await adminPage.locator('.inline-editor button').filter({hasText:'Undo this edit'}).click();
  await adminPage.locator('.landing .price strong').click();await adminPage.locator('.inline-editor input').fill('550');
  await adminPage.locator('.inline-editor .done').click();conflict=true;
  await adminPage.locator('.admin-toolbar .save').click();
  await waitUntil(adminPage,()=>document.querySelector('.admin-status').textContent.includes('Another session'));
  assert.equal(snapshot.values['pricing.onetime.landing.price'],800);
  conflict=false;
  adminPage.once('dialog',d=>d.accept());await adminPage.locator('.admin-toolbar .revert').click();
  assert.equal(await adminPage.locator('.landing .price strong').textContent(),'$800');
  await adminPage.locator('.landing .price strong').click();
  await adminPage.screenshot({path:'test-results/admin-inline-price.png'});
  await adminPage.locator('.inline-editor button').filter({hasText:'Undo this edit'}).click();
  await adminPage.setViewportSize({width:1440,height:1000});
  await adminPage.locator('#pricing').scrollIntoViewIfNeeded();
  await adminPage.screenshot({path:'test-results/admin-desktop-pricing.png'});
  await adminPage.setViewportSize({width:390,height:844});
  await fillEnquiry(adminPage);
  // Editable marketing CTA opens its editor rather than transmitting an enquiry.
  await adminPage.locator('#contact-form').evaluate(f=>f.requestSubmit());
  assert.equal(intakes,1);assert.equal(emails,1);
  assert.ok((await adminPage.locator('#form-status').textContent()).includes('no enquiry'));
  await adminPage.evaluate(()=>scrollTo(0,0));await adminPage.screenshot({path:'test-results/admin-mobile.png'});
  await adminPage.locator('.admin-toolbar .logout').click();await adminPage.waitForSelector('#admin-login');
  assert.equal(await adminPage.locator('.admin-toolbar,[data-editable]').count(),0);
  await adminContext.close();await publicContext.close();
  console.log('PASS: authorised inline editing, numeric save, public refresh, revert, conflict, admin form safety, logout.');
  assert.deepEqual(errors,[]);
  console.log('PASS: no browser JavaScript errors; screenshots in test-results/.');
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
  if(baselineServer)await new Promise(resolve=>baselineServer.close(resolve));
}
