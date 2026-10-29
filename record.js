// © 2026 Stuart Parkins. Records each app scene at phone size, timed to its voiceover.
// Usage: node record.js <app folder> <work folder>
// Needs <work>/voice/durations.json from voice.py. Writes <work>/frames/<scene>/ (JPEG frames),
// <work>/frames/<scene>/list.ffconcat, a screenshot per scene in <work>/shots/, and <work>/timings.json.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const appDir = path.resolve(process.argv[2]), work = path.resolve(process.argv[3]);
const app = require(path.join(appDir, 'app.js'));
const durations = JSON.parse(fs.readFileSync(path.join(work, 'voice', 'durations.json')));
const LEAD = 0.4, TAIL = 0.7;   // seconds of picture before the voice starts and after it ends
const VIEW = { width: 390, height: 844 }, DSF = 2;

// A visible "finger tap" so viewers can see what was pressed.
const TAP_CSS = `.__tap{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
  background:rgba(30,138,110,.35);border:3px solid rgba(255,255,255,.9);box-shadow:0 2px 10px rgba(0,0,0,.25);
  pointer-events:none;z-index:2147483647;animation:__tap .65s ease-out forwards}
  @keyframes __tap{0%{transform:scale(.5);opacity:1}100%{transform:scale(1.5);opacity:0}}
  html{scroll-behavior:auto}`;

function helpers(page, shotPath) {
  const h = {
    snapped: false,
    async snap() { await page.screenshot({ path: shotPath }); h.snapped = true; },
    wait: ms => page.waitForTimeout(ms),
    async scrollTo(sel, block = 'center', offset = 0) {
      const loc = page.locator(sel).first();
      if (!(await loc.count())) { console.log('  (not found: ' + sel + ')'); return; }
      await loc.evaluate((el, [block, offset]) => {
        const r = el.getBoundingClientRect();
        const y = block === 'start' ? scrollY + r.top - offset : scrollY + r.top - (innerHeight - r.height) / 2;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }, [block, offset]);
      await page.waitForTimeout(750);
    },
    async scrollBy(dy) { await page.evaluate(dy => window.scrollBy({ top: dy, behavior: 'smooth' }), dy); await page.waitForTimeout(750); },
    async scrollTop() { await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' })); await page.waitForTimeout(700); },
    async tapEl(loc) {
      await loc.scrollIntoViewIfNeeded();
      const b = await loc.boundingBox();
      if (!b) throw new Error('Nothing to tap');
      const x = b.x + b.width / 2, y = b.y + b.height / 2;
      await page.evaluate(([x, y]) => { const d = document.createElement('div'); d.className = '__tap';
        d.style.left = x + 'px'; d.style.top = y + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 700); }, [x, y]);
      await page.waitForTimeout(260);
      await page.mouse.click(x, y);
    },
    tap: sel => h.tapEl(page.locator(sel).first()),
    tapNth: (sel, n) => h.tapEl(page.locator(sel).nth(n)),
    async tab(name) { await h.tap(`nav [data-tab="${name}"], [data-act="tab"][data-tab="${name}"]`); await page.waitForTimeout(350); }
  };
  return h;
}

async function newPage(browser, state) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: DSF, locale: app.locale || 'en-GB', timezoneId: 'Europe/London', serviceWorkers: 'block', hasTouch: false });
  await ctx.addInitScript(([key, s]) => {
    if (!sessionStorage.getItem('__seeded')) { localStorage.setItem(key, s); sessionStorage.setItem('__seeded', '1'); }
  }, [app.storageKey, JSON.stringify(state)]);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('  page error:', e.message));
  await page.goto('file://' + app.appFile);
  await page.waitForTimeout(700);
  // Reload once so any milestones the demo history has earned are recorded quietly, not shown as pop-ups.
  await page.reload(); await page.waitForTimeout(700);
  await page.addStyleTag({ content: TAP_CSS });
  return page;
}

async function recordScene(page, scene, dir, shotPath) {
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async f => {
    const file = `f${String(frames.length).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(dir, file), Buffer.from(f.data, 'base64'));
    frames.push({ file, t: f.metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await page.addStyleTag({ content: TAP_CSS });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: VIEW.width * DSF, maxHeight: VIEW.height * DSF, everyNthFrame: 1 });
  // Nudge a repaint so the first frame arrives straight away.
  await page.evaluate(() => { document.body.style.outline = '1px solid transparent'; });
  const t0 = Date.now() / 1000;
  await page.waitForTimeout(LEAD * 1000);
  const h = helpers(page, shotPath);
  await scene.run(page, h);
  const want = LEAD + durations[scene.id] + TAIL;
  const spent = Date.now() / 1000 - t0;
  if (spent < want) await page.waitForTimeout((want - spent) * 1000);
  await page.evaluate(() => { document.body.style.outline = ''; });
  await page.waitForTimeout(80);
  await cdp.send('Page.stopScreencast');
  const end = Date.now() / 1000;
  await cdp.detach();
  if (!frames.length) throw new Error('No frames captured for ' + scene.id);
  // ffconcat list: each frame is held until the next one arrives; the last one until the scene ends.
  const start = frames[0].t, total = end - t0;
  let list = 'ffconcat version 1.0\n';
  frames.forEach((f, i) => {
    const next = i + 1 < frames.length ? frames[i + 1].t - start : total;
    const dur = Math.max(0.001, next - (f.t - start));
    list += `file ${f.file}\nduration ${dur.toFixed(4)}\n`;
  });
  list += `file ${frames[frames.length - 1].file}\n`;
  fs.writeFileSync(path.join(dir, 'list.ffconcat'), list);
  if (!h.snapped) await page.screenshot({ path: shotPath });
  return { duration: +total.toFixed(3), frames: frames.length };
}

(async () => {
  // UK English throughout, so date fields show day/month/year (the browser's own language comes from LANG).
  const browser = await chromium.launch({ args: ['--lang=en-GB'], env: { ...process.env, LANG: 'en_GB.UTF-8', LANGUAGE: 'en_GB' } });
  const timings = {};
  fs.mkdirSync(path.join(work, 'shots'), { recursive: true });
  let page = null, pageState = null;
  for (const scene of app.scenes) {
    if (scene.card) { timings[scene.id] = { card: true, duration: +(LEAD + durations[scene.id] + TAIL + 0.3).toFixed(3) }; continue; }
    const want = scene.state || 'demo';
    if (want !== pageState) {
      if (page) await page.context().close();
      page = await newPage(browser, app.demo(want === 'fresh' ? { welcomed: false, empty: true } : {}));
      pageState = want === 'fresh' ? 'fresh-used' : want;   // a fresh page is used once, then demo data loads
    }
    process.stdout.write(`recording ${scene.id}... `);
    const r = await recordScene(page, scene, path.join(work, 'frames', scene.id), path.join(work, 'shots', `${scene.id}.png`));
    timings[scene.id] = r;
    console.log(`${r.duration}s, ${r.frames} frames`);
  }
  timings._meta = { lead: LEAD, tail: TAIL, width: VIEW.width * DSF, height: VIEW.height * DSF };
  fs.writeFileSync(path.join(work, 'timings.json'), JSON.stringify(timings, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
