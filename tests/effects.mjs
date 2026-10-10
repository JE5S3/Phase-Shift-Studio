import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {previewServer} from '../scripts/preview.mjs';

const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});
const server=previewServer(4177);
const origin='http://127.0.0.1:4177';
async function pageFor(options={}){
  const context=await browser.newContext(options);
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  const page=await context.newPage();
  await page.goto(origin);
  return {context,page};
}

try{
  await mkdir('test-results',{recursive:true});
  const normal=await pageFor({viewport:{width:1440,height:1000}});
  const page=normal.page;
  await page.waitForFunction(()=>document.body.classList.contains('hero-motion-ready'));
  assert.equal(await page.locator('.hero-line').count(),3);
  assert.equal(await page.locator('.scroll-progress').count(),1);
  assert.ok(await page.locator('[data-reveal].motion-pending').count()>0);
  const aurora=await page.locator('.hero-art').evaluate(el=>{
    const style=getComputedStyle(el,'::after');
    return {animation:style.animationName,background:style.backgroundImage,opacity:Number(style.opacity)};
  });
  assert.equal(aurora.animation,'galaxy-aurora');
  assert.match(aurora.background,/radial-gradient/);assert.ok(aurora.opacity>0);
  await page.waitForTimeout(1100);
  await page.screenshot({path:'test-results/effects-desktop-hero.png'});

  await page.locator('.work-grid').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>!document.querySelector('.work-grid').classList.contains('motion-pending'));
  const card=page.locator('.work-card').first();
  await page.mouse.move(1,1);
  await card.hover();
  await page.waitForTimeout(480);
  await card.evaluate(el=>el.classList.add('trace-active'));
  const hover=await card.evaluate(el=>({
    image:getComputedStyle(el.querySelector('.work-visual img')).transform,
    heading:getComputedStyle(el.querySelector('.work-body h3')).transform,
    clockwise:getComputedStyle(el,'::before').animationName,
    counter:getComputedStyle(el,'::after').animationName,
    iterations:getComputedStyle(el,'::before').animationIterationCount
  }));
  assert.notEqual(hover.image,'none');assert.notEqual(hover.heading,'none');
  assert.equal(hover.clockwise,'work-trace-clockwise');assert.equal(hover.counter,'work-trace-counter');assert.equal(hover.iterations,'1');
  await page.screenshot({path:'test-results/effects-work-hover.png'});
  await page.locator('.pricing-grid').scrollIntoViewIfNeeded();
  const landing=page.locator('.price-card.landing');
  const monthlyPriceText=await landing.locator('[data-price]').textContent();
  assert.match(await landing.evaluate(el=>getComputedStyle(el).backgroundImage),/linear-gradient/);
  await landing.hover();await page.waitForTimeout(320);
  assert.equal(await landing.evaluate(el=>getComputedStyle(el).animationName),'pricing-galaxy-glow');
  assert.match(await landing.evaluate(el=>getComputedStyle(el).boxShadow),/rgb/);
  await page.screenshot({path:'test-results/effects-pricing-galaxy.png'});
  await page.locator('[data-pricing-mode="onetime"]').click();
  await page.waitForFunction(()=>document.querySelector('.pricing-grid').getAttribute('aria-busy')==='true');
  assert.notEqual(await landing.evaluate(el=>getComputedStyle(el).transform),'none');
  await page.waitForFunction(()=>!document.querySelector('.pricing-grid').hasAttribute('aria-busy'));
  const oneTimePriceText=await landing.locator('[data-price]').textContent();
  assert.notEqual(oneTimePriceText,monthlyPriceText);assert.match(oneTimePriceText,/one-time/);
  assert.equal(await page.locator('[data-pricing-mode="onetime"]').getAttribute('aria-pressed'),'true');
  await page.screenshot({path:'test-results/effects-pricing-flipped.png'});
  await page.locator('.process-track').scrollIntoViewIfNeeded();
  const processPosition=await page.locator('.process-track').evaluate(el=>el.style.getPropertyValue('--process-position'));
  await page.waitForFunction(position=>document.querySelector('.process-track').style.getPropertyValue('--process-position')!==position,processPosition,{timeout:4500});
  assert.equal(await page.locator('.process-list .is-active').count(),1);
  assert.equal(await page.locator('.process-list').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),4);
  assert.equal(await page.locator('.process-row.is-active h3').evaluate(el=>getComputedStyle(el).color),'rgb(255, 255, 255)');
  await page.screenshot({path:'test-results/effects-process-journey.png'});
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*.7));await page.waitForTimeout(120);
  assert.equal(await page.locator('.site-header').evaluate(el=>el.classList.contains('is-scrolled')),true);
  assert.notEqual(await page.locator('.scroll-progress').evaluate(el=>getComputedStyle(el).transform),'none');
  await normal.context.close();

  const mobile=await pageFor({viewport:{width:390,height:844},hasTouch:true});
  await mobile.page.waitForFunction(()=>document.body.classList.contains('hero-motion-ready'));
  await mobile.page.waitForTimeout(1100);
  assert.equal(await mobile.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await mobile.page.screenshot({path:'test-results/effects-mobile.png'});
  await mobile.context.close();

  const reduced=await pageFor({viewport:{width:390,height:844},reducedMotion:'reduce'});
  assert.equal(await reduced.page.locator('body').evaluate(el=>el.classList.contains('motion-enhanced')),false);
  assert.equal(await reduced.page.locator('.motion-pending').count(),0);
  assert.equal(await reduced.page.locator('.hero-art').evaluate(el=>getComputedStyle(el,'::after').animationName),'none');
  assert.equal(await reduced.page.locator('.hero-line-inner').first().evaluate(el=>getComputedStyle(el).transform),'none');
  assert.equal(await reduced.page.locator('.price-card').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await reduced.page.locator('[data-pricing-mode="onetime"]').click();
  assert.equal(await reduced.page.locator('.pricing-grid').getAttribute('aria-busy'),null);
  assert.match(await reduced.page.locator('.price-card.landing [data-price]').textContent(),/one-time/);
  await reduced.page.screenshot({path:'test-results/effects-mobile-reduced.png'});
  await reduced.context.close();

  const noScript=await pageFor({viewport:{width:390,height:844},javaScriptEnabled:false});
  assert.equal(await noScript.page.locator('#hero-title').isVisible(),true);
  assert.equal(await noScript.page.locator('.hero-actions .btn').isVisible(),true);
  assert.equal(await noScript.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await noScript.context.close();
  console.log('PASS: hero sequence, galaxy aurora, work hover, process journey, reveals, progress/header state, reduced motion and no-JS fallback.');
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
