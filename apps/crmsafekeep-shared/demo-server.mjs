// © 2026 Stuart Parkins. Demo server for the CRM SafeKeep walkthroughs. Demo data only.
//
// Runs the real CRM SafeKeep Worker code (from APP_CODE) in Node, with a fresh in-memory database and a
// pretend Zoho, Skyvia and Zoho status feed. Nothing here talks to the live app, its database, Zoho or
// any client. It builds eight weeks of made-up history for an invented business, Harbourside Joinery
// Ltd, whose CRM starts with problems and gets better week by week as the owner fixes them.
//
// Usage: node demo-server.mjs <port> <monitor|protect>
// Demo-only routes: /__demo/signin (signs in as the demo owner), /__demo/new (an account that hasn't
// connected Zoho yet), /__demo/health.
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const PORT = Number(process.argv[2] || 8811);
const PLAN = process.argv[3] === 'protect' ? 'protect' : 'monitor';
const CODE = process.env.APP_CODE;
if (!CODE) { console.error('Set APP_CODE to the crm-safekeep folder'); process.exit(1); }
const worker = (await import(pathToFileURL(path.join(CODE, 'src/worker/index.js')).href)).default;
const { AUDIT_QUESTIONS } = await import(pathToFileURL(path.join(CODE, 'src/worker/audit.js')).href);

// --- Pretend clock: the history is built by moving time back, then forward to now. ---------------
const RealDate = Date;
let offset = 0;
globalThis.Date = class extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + offset); }
  static now() { return RealDate.now() + offset; }
};
const DAY = 864e5;

// --- Small D1 stand-in on SQLite (same as the app's own local check) --------------------------------
function d1() {
  const sql = new DatabaseSync(':memory:');
  const stmt = (q, args = []) => ({
    bind: (...a) => stmt(q, a),
    run: async () => { const r = sql.prepare(q).run(...args); return { success: true, meta: { last_row_id: Number(r.lastInsertRowid), changes: Number(r.changes) } }; },
    first: async () => sql.prepare(q).get(...args) ?? null,
    all: async () => ({ results: sql.prepare(q).all(...args) }),
  });
  return { prepare: (q) => stmt(q), batch: async (list) => Promise.all(list.map((s) => s.run())) };
}

// --- The made-up CRM, week by week (w = 0 is seven weeks ago, w = 7 is this morning) ---------------
let w = 0;
const iso = (ms) => new RealDate(ms).toISOString();
const workflows = () => [
  ['New enquiry welcome', 'Leads'], ['Quote follow-up', 'Deals'], ['Job booked confirmation', 'Deals'],
  ['Site visit reminder', 'Deals'], ['Invoice chaser', 'Accounts'], ['Review request', 'Contacts'],
].map(([name, mod], i) => ({ id: `w${i + 1}`, name, module: { api_name: mod }, status: { active: !(w >= 7 && name === 'Quote follow-up') } }));
function zoho(key) {
  const now = Date.now();
  const GB = 1073741824;
  const map = {
    '/crm/v8/org': { org: [{ id: '5550001000000000001', domain_name: 'org20099990001', zgid: '20099990001', company_name: 'Harbourside Joinery Ltd', license_details: { paid_type: 'professional', users_license_purchased: 10 } }] },
    '/crm/bulk/v8/backup': w >= 2 ? { backup: { id: '1', rrule: 'FREQ=WEEKLY;INTERVAL=1' } } : {},
    '/crm/bulk/v8/backup/urls': w >= 2 ? { urls: { data_links: ['https://download.example/Data_001.zip'], attachment_links: ['https://download.example/Attachments_001.zip'], expiry_date: iso(now + 5 * DAY) } } : {},
    '/crm/bulk/v8/backup/history': w >= 2 ? { history: [{ id: `h${w}`, log_time: iso(now - DAY), state: 'completed' }] } : { history: [] },
    '/crm/v8/users?type=AllUsers&per_page=200': { users: [
      ...Array.from({ length: 8 }, (_, i) => ({ id: `u${i + 1}`, status: 'active', profile: { name: i < (w >= 3 ? 2 : 4) ? 'Administrator' : 'Standard' } })),
      { id: 'u9', status: 'disabled', profile: { name: 'Standard' } }], info: { more_records: false } },
    '/crm/v8/settings/profiles': { profiles: [{ id: 'p1', name: 'Administrator', custom: false }, { id: 'p2', name: 'Standard', custom: false }, { id: 'p3', name: 'Workshop', custom: true }] },
    '/crm/v8/settings/roles': { roles: [{ id: 'r1', name: 'Director' }, { id: 'r2', name: 'Office' }, { id: 'r3', name: 'Workshop' }] },
    '/crm/v8/settings/modules': { modules: ['Leads', 'Contacts', 'Accounts', 'Deals', 'Quotes', 'Invoices'].map((m) => ({ api_name: m, api_supported: true, generated_type: 'default' })).concat([{ api_name: 'Jobs', api_supported: true, generated_type: 'custom' }]) },
    '/crm/v8/settings/automation/workflow_rules?per_page=200': { workflow_rules: workflows() },
    '/crm/v8/settings/recycle_bin/actions/count': { count: w <= 4 ? 184 : 12 },
    '/crm/v9/settings/file_storage': { file_storage: { workdrive_storage: null, zfs_storage: { used_space: String(Math.round((w <= 5 ? 1.86 : 1.1) * GB)), allowed_space: String(2 * GB) } } },
    '/crm/v9/settings/email_storage_summary': { email_storage_summary: [{ total_storage_used: String(Math.round(4.2 * GB)), storage_capacity: String(30 * GB) }] },
  };
  for (const [m, base] of [['Leads', 1240], ['Contacts', 860], ['Accounts', 410], ['Deals', 230]]) {
    map[`/crm/v8/settings/fields?module=${m}`] = { fields: Array.from({ length: 24 }, (_, i) => ({ id: `${m}${i}`, custom_field: i > 17 })) };
    map[`/crm/v8/${m}/actions/count`] = { count: base + w * 6 };
  }
  if (key in map) return map[key];
  if (key.startsWith('/crm/v8/settings/automation/webhook_failures')) {
    return w <= 4 ? { webhook_failures: [1, 3, 6].map((d) => ({ webhook: { name: 'Accounts sync', id: 'h1' }, failure_time: iso(now - d * DAY) })), info: { more_records: false } } : null;
  }
  return undefined;
}

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const u = new URL(typeof input === 'string' ? input : input.url);
  if (u.hostname.endsWith('zohostatus.com')) {
    return new Response('<?xml version="1.0"?><rss version="2.0"><channel><title>Zoho EU Services Availability - Status</title><item><title>EU Zoho CRM - Operational</title><description>EU Zoho CRM is Operational</description></item></channel></rss>', { headers: { 'content-type': 'application/rss+xml' } });
  }
  if (u.hostname === 'api.skyvia.com') {
    if (u.pathname.endsWith('/schedule')) return Response.json({ active: true });
    if (u.searchParams.get('failed') === 'true') return Response.json({ data: [], hasMore: false });
    const hrs = (h) => iso(Date.now() - h * 3600e3);
    return Response.json({ data: [
      { snapshotId: 901, startTime: hrs(27), endTime: hrs(26.6), state: 'Succeeded', runBySchedule: true },
      { snapshotId: 902, startTime: hrs(3), endTime: hrs(2.6), state: 'Succeeded', runBySchedule: true }], hasMore: false });
  }
  if (u.pathname === '/oauth/v2/token/revoke') return Response.json({});
  if (u.pathname === '/oauth/v2/token') {
    const body = new URLSearchParams(init.body);
    return Response.json(body.get('grant_type') === 'authorization_code'
      ? { access_token: 'demo-at', refresh_token: 'demo-rt', api_domain: 'https://www.zohoapis.eu' } : { access_token: 'demo-at' });
  }
  if (u.hostname === 'www.zohoapis.eu') {
    if (u.pathname === '/crm/v2/settings/api_dashboard/top_usage') return Response.json({ top_usage: [{ count: 310, value: 'Zoho Forms' }, { count: 140, value: 'Zoho Books' }] });
    const body = zoho(u.pathname + u.search);
    if (body === null) return new Response(null, { status: 204 });
    return body === undefined ? Response.json({ code: 'INVALID_URL_PATTERN' }, { status: 404 }) : Response.json(body);
  }
  // Anything else (email, Gumroad) is switched off in the demo.
  return Response.json({ demo: true }, { status: 503 });
};

// --- Talk to the Worker directly --------------------------------------------------------------------
const BASE = `http://localhost:${PORT}`;
const env = { DB: d1(), ZOHO_CLIENT_ID: 'demo', ZOHO_CLIENT_SECRET: 'demo', ADMIN_KEY: 'demo-admin', TOKEN_KEY: 'demo-token-key', SKYVIA_TOKEN: 'demo-sky', APP_URL: BASE };
const ctx = { waitUntil: (p) => Promise.resolve(p).catch(() => {}), passThroughOnException() {} };
const call = (p, { jar = '', method = 'GET', form } = {}) => worker.fetch(new Request(BASE + p, {
  method, redirect: 'manual',
  headers: { ...(jar ? { cookie: jar } : {}), ...(form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
  body: form ? new URLSearchParams(form) : undefined,
}), env, ctx);
const cookieOf = (r) => (r.headers.get('set-cookie') || '').split(';')[0];
const post = (p, form, jar) => call(p, { method: 'POST', form, jar });

let admin = '';
async function linkFor(accountId) {
  const r = await post('/admin/link', { a: String(accountId) }, admin);
  const m = (await r.text()).match(/\/signin\?t=([a-f0-9]+)/);
  if (!m) throw new Error('no sign-in link');
  return `/signin?t=${m[1]}`;
}

async function build() {
  const start = RealDate.now();
  const at = (week) => { const d = new RealDate(start - (7 - week) * 7 * DAY); d.setUTCHours(6, 0, 0, 0); return d.getTime() - start; };
  w = 0; offset = at(0) - DAY;
  admin = cookieOf(await post('/admin/login', { key: 'demo-admin' }));
  const inv = await (await post('/admin/invite', { email: 'owner@harbourside-joinery.example' }, admin)).text();
  const owner = cookieOf(await call(`/signin?t=${inv.match(/\/signin\?t=([a-f0-9]+)/)[1]}`));
  // Connect (week 0): the first check runs straight away.
  w = 0; offset = at(0);
  const st = new URL((await call('/connect', { jar: owner })).headers.get('location')).searchParams.get('state');
  await call(`/auth/callback?code=demo&state=${st}&location=eu&accounts-server=${encodeURIComponent('https://accounts.zoho.eu')}`, { jar: owner });
  const conn = await env.DB.prepare('SELECT id FROM connections').first();
  const c = String(conn.id);
  await call('/', { jar: owner });
  for (let week = 1; week <= 7; week++) {
    w = week; offset = at(week);
    await post('/admin/run', { c }, admin);
    await call('/', { jar: owner });   // saves that day's health score
    if (PLAN === 'protect' && week === 4) {
      // The owner ticks two actions; the next check (1 Nov) confirms both are fixed.
      await post('/admin/tier', { c, tier: 'pro', source: 'invoice' }, admin);
      for (const key of ['tile:records', 'tile:connected']) {
        const tk = await post('/plan/tick', { key }, owner);
        if (process.env.DEMO_DEBUG) console.log('tick', key, tk.headers.get('location'));
      }
    }
    if (week === 6) {
      // Self Audit: most areas answered, a couple of honest gaps, Your CRM setup not started yet.
      const byArea = {};
      for (const q of AUDIT_QUESTIONS) (byArea[q.area] ||= []).push(q);
      const gaps = PLAN === 'protect' ? {} : { offsite: 'no', restore_test: 'unsure' };
      for (const [area, qs] of Object.entries(byArea)) {
        if (area === 'setup') continue;
        const form = {};
        qs.forEach((q, i) => { form[q.key] = gaps[q.key] || (area === 'access' && i === qs.length - 1 ? 'no' : 'yes'); });
        if (area === 'backup') await post('/tile/backup/answers', form, owner);
        else await post(`/audit/${area}`, form, owner);
      }
    }
  }
  w = 7; offset = 0;
  await post('/admin/tier', PLAN === 'protect' ? { c, tier: 'pro', source: 'invoice' } : { c, tier: 'free' }, admin);
  await post('/admin/enforce', { c, on: '1' }, admin);
  if (PLAN === 'protect') {
    await post('/admin/skyvia/add', { c, label: 'Zoho CRM', backup: '350161', crm: 'on' }, admin);
    await post('/admin/skyvia/check', { c }, admin);
  }
  await call('/', { jar: owner });
  // A second, brand-new account for the Connect scene.
  await (await post('/admin/invite', { email: 'new@harbourside-joinery.example' }, admin)).text();
  const accounts = (await env.DB.prepare('SELECT id, email FROM accounts ORDER BY id').all()).results;
  return { ownerId: accounts[0].id, newId: accounts.find((a) => a.email.startsWith('new@')).id };
}

const ids = await build();
console.log(`CRM SafeKeep demo (${PLAN}) ready on ${BASE}`);

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, BASE);
    if (u.pathname === '/__demo/health') { res.writeHead(200); return res.end('ok'); }
    if (u.pathname === '/__demo/signin' || u.pathname === '/__demo/new') {
      const link = await linkFor(u.pathname === '/__demo/new' ? ids.newId : ids.ownerId);
      res.writeHead(303, { location: link, 'set-cookie': 'sk_session=; Path=/; Max-Age=0' });
      return res.end();
    }
    const chunks = []; for await (const ch of req) chunks.push(ch);
    const r = await worker.fetch(new Request(BASE + req.url, {
      method: req.method, headers: req.headers, redirect: 'manual',
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
    }), env, ctx);
    const headers = {};
    r.headers.forEach((v, k) => { if (k !== 'set-cookie') headers[k] = v; });
    const cookies = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
    if (cookies.length) headers['set-cookie'] = cookies;
    res.writeHead(r.status, headers);
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch (e) { console.error(e); res.writeHead(500); res.end(String(e)); }
}).listen(PORT);
void realFetch;
