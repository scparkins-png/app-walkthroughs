// © 2026 Stuart Parkins. Shared settings for the two CRM SafeKeep walkthroughs (Monitor and Protect).
// Scene fields are described in apps/smartdrinktracker/app.js; text cards (card: 'text') take a
// heading and lines, and short: false keeps a scene out of the Short.
//
// CRM SafeKeep is a Cloudflare Worker with a database and a Zoho connection, so it can't be opened
// as a file. "site" starts demo-server.mjs, which runs the real app code in Node with a fresh
// in-memory database, a pretend Zoho and eight weeks of made-up history for an invented business
// (Harbourside Joinery Ltd). The live app, its database, Zoho and real clients are never touched,
// and no scene presses Run checks or Refresh.
const path = require('path');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'crm-safekeep');

// Spellings for the AI voice only.
const say = (s) => s
  .replace(/crmsafekeep\.com/g, 'C R M safe keep dot com')
  .replace(/\bCRMs\b/g, 'C R Ms').replace(/\bCRM\b/g, 'C R M')
  .replace(/SafeKeep/g, 'Safe Keep').replace(/\bGDPR\b/g, 'G D P R').replace(/\bAPI\b/g, 'A P I')
  .replace(/£39/g, 'thirty-nine pounds');
const line = (o) => ({ ...o, tts: say(o.say) });

// A "Demo data" badge on every recorded screen (help clips pass their own wording as demoLabel).
const badge = (label) => `addEventListener('DOMContentLoaded', () => {
  const b = document.createElement('div');
  b.textContent = ${JSON.stringify(label)};
  b.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:2147483646;background:#fff7e0;color:#7a5a00;border:1.5px solid #f0d27a;border-radius:999px;padding:3px 10px;font:600 12px system-ui,sans-serif;pointer-events:none';
  if (b.textContent.length > 20) { b.style.left = '10px'; b.style.textAlign = 'center'; b.style.borderRadius = '10px'; }
  document.body.appendChild(b);
});`;

module.exports = function settings(plan, port, extra) {
  return {
    repo: 'scparkins-png/crm-safekeep',
    url: 'crmsafekeep.com',
    // CRM SafeKeep's own icon (brand 1.5.0; no SP icon since app 1.7.0).
    icon: path.join(__dirname, 'csk-icon-512.png'),
    // Brand 1.5.0: navy #14284B, blue #0B6FD6, tint #EAF2FC, page #F6F8FB.
    colours: { brand: '#0B6FD6', brandDark: '#14284B', mint: '#EAF2FC', sky: '#F6F8FB', accent: '#0B6FD6' },
    voice: { name: 'bf_emma', speed: 1.0 },
    start: '__demo/signin',
    initScript: badge(extra.demoLabel || 'Demo data'),
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
