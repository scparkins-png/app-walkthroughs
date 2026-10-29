// © 2026 Stuart Parkins. Draws the branded graphics as PNGs: intro and outro cards, a background
// for each scene (title beside the phone, or a label above it in the Short), and the rounded phone mask.
// Usage: node cards.js <app folder> <work folder>     Writes <work>/cards/ and <work>/cards/layout.json
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const appDir = path.resolve(process.argv[2]), work = path.resolve(process.argv[3]);
const app = require(path.join(appDir, 'app.js'));
const out = path.join(work, 'cards'); fs.mkdirSync(out, { recursive: true });
const C = app.colours;
const icon = 'data:image/png;base64,' + fs.readFileSync(app.icon).toString('base64');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Phone placement. The recording is 780 x 1688 (a 390 x 844 phone at 2x).
const L = {
  wide: { W: 1920, H: 1080, phoneW: 450, phoneH: 974, x: 1238, y: 53, radius: 40, bezel: 14 },
  tall: { W: 1080, H: 1920, phoneW: 694, phoneH: 1502, x: 193, y: 262, radius: 56, bezel: 16 }
};

const base = (W, H, body) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:Inter,system-ui,sans-serif;color:${C.brandDark};
  background:radial-gradient(1200px 800px at 15% 10%,#ffffff 0%,${C.mint} 45%,${C.sky} 100%);position:relative}
.waves{position:absolute;left:0;bottom:0;width:100%;height:38%;opacity:.55}
.accent{color:${C.brand}}
.brand{display:flex;align-items:center;gap:22px}
.brand img{border-radius:22%;box-shadow:0 6px 20px rgba(18,48,41,.18)}
.name{font-weight:800;letter-spacing:-.02em}
.tag{color:#3d5e56;font-weight:500}
.pill{display:inline-flex;align-items:center;gap:10px;background:#fff7e0;color:#7a5a00;border:2px solid #f0d27a;
  border-radius:999px;font-weight:700}
.pill i{width:12px;height:12px;border-radius:50%;background:#e0a800;display:inline-block}
.bezel{position:absolute;background:${C.brandDark};box-shadow:0 30px 70px rgba(18,48,41,.35)}
.url{font-weight:700;color:${C.brand}}
</style></head><body>
<svg class="waves" viewBox="0 0 1440 400" preserveAspectRatio="none"><path fill="${C.brand}" fill-opacity=".10" d="M0,220 C240,160 480,280 720,230 C960,180 1200,260 1440,210 L1440,400 L0,400Z"/>
<path fill="${C.brand}" fill-opacity=".08" d="M0,290 C260,250 520,340 760,300 C1000,260 1220,330 1440,290 L1440,400 L0,400Z"/></svg>
${body}</body></html>`;

const bezel = g => `<div class="bezel" style="left:${g.x - g.bezel}px;top:${g.y - g.bezel}px;width:${g.phoneW + 2 * g.bezel}px;height:${g.phoneH + 2 * g.bezel}px;border-radius:${g.radius + g.bezel}px"></div>`;
const demoPill = (size) => `<span class="pill" style="font-size:${size}px;padding:${size * .45}px ${size * .9}px"><i></i>Demo data</span>`;

function sceneWide(s, n, total) {
  const g = L.wide;
  return base(g.W, g.H, `${bezel(g)}
  <div style="position:absolute;left:120px;top:96px" class="brand"><img src="${icon}" width="84" height="84"><div class="name" style="font-size:46px">${app.nameHtml}</div></div>
  <div style="position:absolute;left:120px;top:380px;width:960px">
    <div style="font-size:30px;font-weight:700;color:${C.brand};letter-spacing:.08em">${n} / ${total}</div>
    <div style="font-size:84px;font-weight:800;line-height:1.05;margin-top:18px;letter-spacing:-.02em">${esc(s.title)}</div>
  </div>
  <div style="position:absolute;left:120px;bottom:96px;display:flex;align-items:center;gap:28px">
    <span class="url" style="font-size:34px">${esc(app.url)}</span>${demoPill(24)}</div>`);
}
function sceneTall(s) {
  const g = L.tall;
  return base(g.W, g.H, `${bezel(g)}
  <div style="position:absolute;left:0;right:0;top:62px;text-align:center">
    <div class="brand" style="justify-content:center;gap:14px"><img src="${icon}" width="52" height="52"><div class="name" style="font-size:34px">${app.nameHtml}</div></div>
    <div style="font-size:76px;font-weight:800;margin-top:26px;letter-spacing:-.02em">${esc(s.label || s.title)}</div>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:44px;display:flex;justify-content:center;align-items:center;gap:26px">
    <span class="url" style="font-size:34px">${esc(app.url)}</span>${demoPill(24)}</div>`);
}
function introCard(W, H, tall) {
  const k = tall ? 1.15 : 1;
  return base(W, H, `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 80px">
    <img src="${icon}" width="${220 * k}" height="${220 * k}" style="border-radius:22%;box-shadow:0 14px 40px rgba(18,48,41,.22)">
    <div class="name" style="font-size:${(tall ? 92 : 104)}px;margin-top:${48 * k}px">${app.nameHtml}</div>
    <div class="tag" style="font-size:${44 * k}px;margin-top:20px;max-width:${tall ? 900 : 1400}px;line-height:1.25">${esc(app.tagline)}</div>
    <div class="url" style="font-size:${40 * k}px;margin-top:${44 * k}px">${esc(app.url)}</div></div>`);
}
function outroCard(W, H, tall) {
  const k = tall ? 1.1 : 1, o = app.outro;
  const chips = o.points.map(p => `<span style="background:#fff;border:2px solid ${C.brand}33;border-radius:999px;padding:${14 * k}px ${30 * k}px;font-size:${34 * k}px;font-weight:700;color:${C.brand}">✓ ${esc(p)}</span>`).join('');
  return base(W, H, `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 70px">
    <div class="brand" style="justify-content:center"><img src="${icon}" width="${110 * k}" height="${110 * k}"><div class="name" style="font-size:${(tall ? 64 : 72)}px">${app.nameHtml}</div></div>
    <div class="url" style="font-size:${(tall ? 72 : 88)}px;margin-top:${50 * k}px;letter-spacing:-.01em">${esc(app.url)}</div>
    <div style="display:flex;gap:18px;margin-top:${46 * k}px;flex-wrap:wrap;justify-content:center">${chips}</div>
    <div style="font-size:${32 * k}px;margin-top:${60 * k}px;font-weight:600">☕ ${esc(o.support)}</div>
    <div class="tag" style="font-size:${28 * k}px;margin-top:22px">${esc(o.credit)}</div></div>`);
}
const mask = g => `<!doctype html><html><body style="margin:0;background:#000;width:${g.phoneW}px;height:${g.phoneH}px">
  <div style="width:${g.phoneW}px;height:${g.phoneH}px;border-radius:${g.radius}px;background:#fff"></div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  async function shot(html, W, H, file) {
    await page.setViewportSize({ width: W, height: H });
    await page.setContent(html); await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(out, file) });
  }
  const rec = app.scenes.filter(s => !s.card);
  for (const [i, s] of rec.entries()) {
    await shot(sceneWide(s, i + 1, rec.length), 1920, 1080, `bg-wide-${s.id}.png`);
    await shot(sceneTall(s), 1080, 1920, `bg-tall-${s.id}.png`);
  }
  await shot(introCard(1920, 1080, false), 1920, 1080, 'intro-wide.png');
  await shot(introCard(1080, 1920, true), 1080, 1920, 'intro-tall.png');
  await shot(outroCard(1920, 1080, false), 1920, 1080, 'outro-wide.png');
  await shot(outroCard(1080, 1920, true), 1080, 1920, 'outro-tall.png');
  await shot(mask(L.wide), L.wide.phoneW, L.wide.phoneH, 'mask-wide.png');
  await shot(mask(L.tall), L.tall.phoneW, L.tall.phoneH, 'mask-tall.png');
  fs.writeFileSync(path.join(out, 'layout.json'), JSON.stringify(L, null, 1));
  await browser.close();
  console.log('cards done');
})().catch(e => { console.error(e); process.exit(1); });
