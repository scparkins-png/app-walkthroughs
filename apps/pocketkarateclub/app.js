// © 2026 Stuart Parkins. Walkthrough configuration for the Pocket Karate Club (club.pocketkarate.com).
// Scene fields are described in apps/smartdrinktracker/app.js.
//
// The club runs on the same Cloudflare Worker as the Do 30 Day Challenge Club (repo app-clubs). "site"
// starts a local copy (wrangler dev) with its own fresh database, loads the made-up members from
// demo-data.js and publishes this week's Friday shout and last month's roundup, then records it.
// It is started as club.pocketkarate.com so the karate pages are at the root. The live club is never touched.
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'app-clubs');
const WORK = path.join(__dirname, '..', '..', '.work', 'pocketkarateclub');
const DB = path.join(WORK, 'club-db');
const PORT = 8798;
const run = (cmd) => execSync(cmd, { cwd: CODE, stdio: 'pipe', env: { ...process.env, CI: '1' } });

module.exports = {
  name: 'Pocket Karate Club',
  nameHtml: 'Pocket <span class="accent">Karate</span> Club',
  tagline: 'Train regularly, together',
  url: 'club.pocketkarate.com',
  repo: 'scparkins-png/app-clubs',
  icon: path.join(__dirname, 'icon-512.png'),
  colours: { brand: '#d97f00', brandDark: '#1f1a14', mint: '#fbeedb', sky: '#f6e4cc', accent: '#f39200' },
  outro: {
    points: ['Free', 'No accounts', 'No tracking'],
    supportIcon: '💚',
    support: 'Support the club · club.pocketkarate.com/support',
    credit: 'Created by Stuart Parkins · © 2026'
  },
  voice: { name: 'bf_emma', speed: 1.0 },

  site: {
    url: `http://127.0.0.1:${PORT}/`,
    ready: 'api/health',
    cwd: CODE,
    command: `npx wrangler dev --ip 127.0.0.1 --port ${PORT} --host club.pocketkarate.com --test-scheduled --persist-to "${DB}"`,
    async setup() {
      fs.rmSync(DB, { recursive: true, force: true });
      fs.mkdirSync(WORK, { recursive: true });
      if (!fs.existsSync(path.join(CODE, 'node_modules'))) run('npm install --silent');
      // Local-only secrets for the demo copy (the real ones live in Cloudflare and are never needed here).
      const vars = path.join(CODE, '.dev.vars');
      if (!fs.existsSync(vars)) fs.writeFileSync(vars, 'ADMIN_SECRET=demo-only\nHASH_SALT=demo-only\n');
      run(`npx wrangler d1 migrations apply app-clubs --local --persist-to "${DB}"`);
    },
    async afterStart(url) {
      await fetch(url);   // first page view sets up the newer tables
      const sql = path.join(WORK, 'demo-members.sql');
      fs.writeFileSync(sql, require('./demo-data.js')());
      run(`npx wrangler d1 execute app-clubs --local --persist-to "${DB}" --file "${sql}" --yes`);
      // Publish this week's Friday shout and last month's roundup (the 5th of the month job).
      for (const cron of ['0 8 * * 5', '0 8 5 * *']) {
        const r = await fetch(`${url}cdn-cgi/handler/scheduled?cron=${encodeURIComponent(cron)}`);
        if (!r.ok) await fetch(`${url}__scheduled?cron=${encodeURIComponent(cron)}`);
      }
      await new Promise(ok => setTimeout(ok, 1500));
    }
  },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'Meet the Pocket Karate Club. A free club to help you train regularly, together where you can. No accounts, no tracking.' },

    { id: 'week', title: 'The Friday shout', label: 'Friday shout',
      say: 'Every Friday the club gives a shout to everyone training that week, with a special mention for three or more days.',
      run: async (p, h) => {
        await h.wait(900);
        await h.scrollTo('#week', 'start', 115); await h.wait(800); await h.snap();
        await h.scrollBy(260); await h.wait(900); await h.scrollBy(220); await h.wait(500);
      } },

    { id: 'roundup', title: 'The monthly roundup', label: 'Roundup',
      say: 'On the fifth of each month, the roundup celebrates everyone who kept training. Bands and alphabetical lists, never a league table.',
      run: async (p, h) => {
        await h.scrollTo('#roundup', 'start', 115); await h.wait(900); await h.snap();
        await h.scrollBy(260); await h.wait(800); await h.scrollBy(260); await h.wait(700);
      } },

    { id: 'badges', title: 'Badges', label: 'Badges',
      say: 'Badges mark regular training, practising every technique, kata run-throughs and the first belt pathway. Tap one to see who has shared it.',
      run: async (p, h) => {
        await h.go('badges'); await h.wait(900); await h.snap();
        await h.scrollBy(300); await h.wait(900);
        await h.tap('a.medal[href="/badges/steady-feet"]'); await h.wait(1200);
        await h.scrollBy(200); await h.wait(500);
      } },

    { id: 'together', title: 'Train together', label: 'Team up',
      say: 'Team up with family or friends. Use the same team name, and your team is celebrated together.',
      run: async (p, h) => {
        await h.go(''); await h.wait(300);
        await h.scrollTo('#together', 'start', 115); await h.wait(900); await h.snap();
        await h.scrollBy(140); await h.wait(600);
      } },

    { id: 'join', title: 'Join in', label: 'Join in',
      say: 'To join, add a club nickname in the app’s settings, then share your week or a badge. Nothing is sent unless you tap Share.',
      run: async (p, h) => {
        await h.scrollTo('#join', 'start', 115); await h.wait(900); await h.snap();
        await h.scrollBy(140); await h.wait(600);
      } },

    { id: 'support', title: 'Support the club', label: 'Support',
      say: 'The club and the app are free, with no adverts. If you’d like to help, there’s a tea or coffee, or simply sharing the club.',
      run: async (p, h) => {
        await h.tap('nav.tabs a[href="/support"]'); await h.wait(900); await h.snap();
        await h.scrollTo('#coffee', 'start', 115); await h.wait(1300);
        await h.scrollTo('#share', 'start', 115); await h.wait(700);
      } },

    { id: 'outro', card: 'outro', title: 'Join at club.pocketkarate.com',
      say: 'The Pocket Karate Club is free at club.pocketkarate.com. Share your training week, and we’ll cheer you on.',
      tts: 'The Pocket Karate Club is free at club dot pocket karate dot com. Share your training week, and we will cheer you on.' }
  ]
};
