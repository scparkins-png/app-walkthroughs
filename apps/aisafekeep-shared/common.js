// © 2026 SP Data Consultancy Ltd. Shared settings for the AI SafeKeep help clips (A00, A03, …).
// Scene fields are described in apps/smartdrinktracker/app.js; text cards (card: 'text') take a
// heading and lines, and short: false keeps a scene out of the Short.
//
// AI SafeKeep is a Cloudflare Worker with a database, so it can't be opened as a file. "site" starts
// demo-server.mjs, which runs the real ai-pack code in Node with a fresh in-memory database and an
// invented business (Larkfield Bookkeeping Ltd). It has no secrets and refuses every outgoing request,
// so the live app, its database and real clients are never touched.
//
// Rules for every clip (Stuart, 26 Nov 2026): demo caption on screen; say "we", never name Stuart;
// "your AI Officer"; "Talk to us"; no prices; never "compliant", "secure" or "certified" (say "lines up
// with"); no "pilot"; policies are drafts you approve, not legal advice; we never collect prompts or
// conversations; the yearly review only as Enable.
const path = require('path');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'ai-pack');

// Spellings for the AI voice only.
const say = (s) => s
  .replace(/aisafekeep\.com/g, 'A I safe keep dot com')
  .replace(/SafeKeep/g, 'Safe Keep')
  .replace(/ChatGPT/g, 'Chat G P T')
  .replace(/\bMOTs\b/g, 'M O Ts').replace(/\bMOT\b/g, 'M O T')
  .replace(/\bAI\b/g, 'A I');
const line = (o) => ({ ...o, tts: say(o.say) });

// The demo caption on every recorded screen.
const badge = (label) => `addEventListener('DOMContentLoaded', () => {
  const b = document.createElement('div');
  b.textContent = ${JSON.stringify(label)};
  b.style.cssText = 'position:fixed;left:10px;right:10px;bottom:10px;z-index:2147483646;background:#fff7e0;color:#7a5a00;border:1.5px solid #f0d27a;border-radius:10px;padding:3px 10px;font:600 12px system-ui,sans-serif;text-align:center;pointer-events:none';
  document.body.appendChild(b);
});`;

const DEMO = 'Example screen with demo data for an invented business';

module.exports = function settings(plan, port, extra) {
  return {
    repo: 'scparkins-png/ai-pack',
    url: 'aisafekeep.com',
    nameHtml: 'AI <span class="accent">Safe</span>Keep',
    // AI SafeKeep's own icon (ai-pack assets/brand/aisk-icon-512.png): navy shield, white spark, purple swoosh.
    icon: path.join(__dirname, 'aisk-icon-512.png'),
    // ai-pack logo.js: navy #14284B, purple #7B3FC4; light purple tint and the app's page grey.
    colours: { brand: '#7B3FC4', brandDark: '#14284B', mint: '#F1EAFB', sky: '#F6F8FB', accent: '#7B3FC4' },
    voice: { name: 'bf_emma', speed: 1.0 },
    demoLabel: DEMO,
    start: '__demo/new',
    initScript: badge(DEMO),
    outro: {
      points: ['Make AI work safely for your business'],
      supportIcon: '✉️',
      support: 'Questions? support@aisafekeep.com',
      credit: 'A service of SP Data Consultancy Ltd',
    },
    site: {
      url: `http://localhost:${port}/`,
      ready: '__demo/health',
      cwd: __dirname,
      command: `APP_CODE="${CODE}" node demo-server.mjs ${port} ${plan}`,
    },
    ...extra,
    scenes: extra.scenes.map(line),
  };
};
