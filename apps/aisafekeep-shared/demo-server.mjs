// © 2026 SP Data Consultancy Ltd. Demo server for the AI SafeKeep help clips. Demo data only.
//
// Runs the real AI SafeKeep Worker code (the ai-pack repo, from APP_CODE) in Node, with a fresh in-memory
// database. It is started with no secrets, no database binding, no email token and no Stripe, its app
// address is localhost, and every outgoing request is refused, so nothing here can reach the live app, its
// database or any real client. The business is invented: Larkfield Bookkeeping Ltd, six people.
//
// Usage: node demo-server.mjs <port> <assess|protect>
// Demo-only routes:
//   /__demo/health          ready check for the recorder
//   /__demo/new             a brand-new owner with nothing done yet (a fresh one each visit)
//   /__demo/signin          the owner of the ready-made demo business
//   /__demo/finish          answers the rest of the AI check for whoever is signed in, then opens Results
//   /__demo/plan?tier=      changes the signed-in business's plan (free | paid | build | managed), as a test account
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const PORT = Number(process.argv[2] || 8816);
const PLAN = process.argv[3] === 'protect' ? 'protect' : 'assess';
const CODE = process.env.APP_CODE;
if (!CODE) { console.error('Set APP_CODE to the ai-pack folder'); process.exit(1); }

// --- Fixed clock: 24 Nov 2026, 10:00 UK time, then runs normally (dates on screen stay the same). ----
const RealDate = Date;
const offset = RealDate.UTC(2026, 10, 24, 10, 0, 0) - RealDate.now();
globalThis.Date = class extends RealDate {
  constructor(...a) { if (a.length) super(...a); else super(RealDate.now() + offset); }
  static now() { return RealDate.now() + offset; }
};

// --- No network: email is accepted and dropped; everything else is refused and logged. ----------------
globalThis.fetch = async (input) => {
  const u = new URL(typeof input === 'string' ? input : input.url);
  if (u.hostname.includes('zeptomail')) return Response.json({ data: [{ code: 'EM_104' }] }, { status: 201 });
  console.log(`[demo] blocked outgoing request to ${u.hostname}`);
  return Response.json({ demo: true }, { status: 503 });
};

const worker = (await import(pathToFileURL(path.join(CODE, 'src/worker/index.js')).href)).default;

// --- Small D1 stand-in on SQLite (as ai-pack's own scripts/local-check.mjs) ---------------------------
function d1() {
  const sql = new DatabaseSync(':memory:');
  const stmt = (q, args = []) => ({
    bind: (...a) => stmt(q, a),
    run: async () => { const r = sql.prepare(q).run(...args); return { success: true, meta: { last_row_id: Number(r.lastInsertRowid), changes: Number(r.changes) } }; },
    first: async () => sql.prepare(q).get(...args) ?? null,
    all: async () => ({ results: sql.prepare(q).all(...args) }),
  });
  const batch = async (list) => { sql.exec('BEGIN'); try { const out = []; for (const st of list) out.push(await st.run()); sql.exec('COMMIT'); return out; } catch (e) { sql.exec('ROLLBACK'); throw e; } };
  return { prepare: (q) => stmt(q), batch };
}

const BASE = `http://localhost:${PORT}`;
// Demo values only. No ZEPTO_TOKEN, no Stripe, no Turnstile, no HQ key: those features stay switched off.
const env = { DB: d1(), ADMIN_KEY: 'demo-admin', APP_URL: BASE, SIGNUP_MODE: 'invite' };
const ctx = { waitUntil: (p) => Promise.resolve(p).catch(() => {}), passThroughOnException() {} };
const call = (p, { jar = '', method = 'GET', form } = {}) => worker.fetch(new Request(BASE + p, {
  method, redirect: 'manual',
  headers: { ...(jar ? { cookie: jar } : {}), ...(form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
  body: form ? new URLSearchParams(form) : undefined,
}), env, ctx);
const post = (p, form, jar) => call(p, { method: 'POST', form, jar });
const cookieOf = (r) => (r.headers.get('set-cookie') || '').split(';')[0];
const SESSION = 'ap_session';

// --- The invented business ---------------------------------------------------------------------------
const BUSINESS = 'Larkfield Bookkeeping Ltd';
const OWNER = 'sam@larkfield-bookkeeping.example';
const START = 'tools_only'; // "We use AI tools, but not in our business systems"
// Preset check answers (any not asked for this starting point are ignored by the app's own flow).
const ANSWERS = { t1: 'partly', t2: 'partly', t3: 'partly', d1: 'partly', d2: 'no', d3: 'partly', p1: 'no', p2: 'unsure', p3: 'yes', o1: 'yes', o2: 'yes', o3: 'na', o4: 'yes' };

let admin = '';
async function inviteLink(email) {
  const r = await post('/admin/invite', { email, business: BUSINESS }, admin);
  const m = (await r.text()).match(/\/signin\?t=([a-f0-9]+)/);
  if (!m) throw new Error('no sign-in link');
  return `/signin?t=${m[1]}`;
}
async function accountFor(jar) {
  const raw = (jar.match(new RegExp(`${SESSION}=([^;]+)`)) || [])[1];
  if (!raw) return null;
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)))].map((b) => b.toString(16).padStart(2, '0')).join('');
  return env.DB.prepare('SELECT a.id, a.business_id FROM sessions s JOIN accounts a ON a.id = s.account_id WHERE s.token_hash = ?').bind(hash).first().catch(() => null);
}

// Answer whatever the check still asks, using the app's own forms (start first if needed).
async function finishCheck(jar) {
  let r = await call('/check', { jar });
  if (r.status === 200 && /action="\/check\/start"/.test(await r.text())) r = await post('/check/start', { start: START }, jar);
  for (let i = 0; i < 20; i++) {
    const loc = r.headers.get('location') || '';
    const m = loc.match(/\/check\/q\/([a-z0-9]+)/);
    if (!m) break;
    r = await post(`/check/q/${m[1]}`, { answer: ANSWERS[m[1]] || 'yes' }, jar);
  }
}

async function build() {
  admin = cookieOf(await post('/admin/login', { key: 'demo-admin' }));
  const owner = cookieOf(await call(await inviteLink(OWNER)));
  await post('/check/start', { start: START }, owner);
  await finishCheck(owner);
  await call('/', { jar: owner });
  if (PLAN === 'protect') {
    const acc = await env.DB.prepare('SELECT business_id FROM accounts WHERE email = ?').bind(OWNER).first();
    await post('/admin/plan', { b: String(acc.business_id), tier: 'paid', source: 'test' }, admin);
  }
}

await build();
console.log(`AI SafeKeep demo (${PLAN}) ready on ${BASE}`);

// --- Static files: on Cloudflare these come from ai-pack's assets/ folder before the Worker runs. ------
const ASSETS = path.join(CODE, 'assets');
const TYPES = { '.png': 'image/png', '.ico': 'image/x-icon', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
function staticFile(p) {
  const f = path.join(ASSETS, path.normalize(decodeURIComponent(p)).replace(/^(\.\.[/\\])+/, ''));
  return f.startsWith(ASSETS + path.sep) && fs.existsSync(f) && fs.statSync(f).isFile() ? f : null;
}

let n = 0;
const send = (res, loc, clear = true) => { res.writeHead(303, { location: loc, ...(clear ? { 'set-cookie': `${SESSION}=; Path=/; Max-Age=0` } : {}) }); res.end(); };

http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, BASE);
    const jar = String(req.headers.cookie || '');
    if (u.pathname === '/__demo/health') { res.writeHead(200); return res.end('ok'); }
    if (u.pathname === '/__demo/new') return send(res, await inviteLink(`new${++n}@larkfield-bookkeeping.example`));
    if (u.pathname === '/__demo/signin') {
      const acc = await env.DB.prepare('SELECT id FROM accounts WHERE email = ?').bind(OWNER).first();
      const r = await post('/admin/link', { a: String(acc.id) }, admin);
      return send(res, `/signin?t=${(await r.text()).match(/\/signin\?t=([a-f0-9]+)/)[1]}`);
    }
    if (u.pathname === '/__demo/finish') { await finishCheck(jar); return send(res, '/results', false); }
    if (u.pathname === '/__demo/plan') {
      const acc = await accountFor(jar);
      if (acc) await post('/admin/plan', { b: String(acc.business_id), tier: u.searchParams.get('tier') || 'free', source: 'test' }, admin);
      return send(res, '/', false);
    }
    const file = req.method === 'GET' && staticFile(u.pathname);
    if (file) { res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' }); return fs.createReadStream(file).pipe(res); }
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
