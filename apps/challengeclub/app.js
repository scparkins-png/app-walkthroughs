// © 2026 Stuart Parkins. Walkthrough configuration for the Do 30 Day Challenge Club (club.do30daychallenge.com).
// Scene fields are described in apps/smartdrinktracker/app.js.
//
// The club is a Cloudflare Worker with a database, so it can't be opened as a plain file. "site" starts a
// local copy (wrangler dev) with its own fresh database, loads the made-up members from demo-data.js and
// publishes this week's welcome and last month's roundup, then records it. The live club is never touched.
const path = require('path'), fs = require('fs'), { execSync } = require('child_process');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'app-clubs');
const WORK = path.join(__dirname, '..', '..', '.work', 'challengeclub');
const DB = path.join(WORK, 'club-db');
const PORT = 8799;
const run = (cmd) => execSync(cmd, { cwd: CODE, stdio: 'pipe', env: { ...process.env, CI: '1' } });

module.exports = {
  name: 'Do 30 Day Challenge Club',
  nameHtml: 'Do<span class="accent">30</span>DayChallenge Club',
  tagline: 'Feel better, move more, together',
  url: 'club.do30daychallenge.com',
  repo: 'scparkins-png/app-clubs',
  icon: path.join(__dirname, 'icon-512.png'),
  colours: { brand: '#0f766e', brandDark: '#0b2f2c', mint: '#e3f3f1', sky: '#eaf4fb', accent: '#14b8a6' },
  outro: {
    points: ['Free', 'No accounts', 'No tracking'],
    supportIcon: '💚',
    support: 'Support the club · club.do30daychallenge.com/support',
    credit: 'Created by Stuart Parkins · © 2026'
  },
  voice: { name: 'bf_emma', speed: 1.0 },

  site: {
    url: `http://127.0.0.1:${PORT}/`,
    ready: 'api/health',
    cwd: CODE,
    command: `npx wrangler dev --ip 127.0.0.1 --port ${PORT} --test-scheduled --persist-to "${DB}"`,
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
      // Publish this week's welcome (Friday job) and last month's roundup (5th of the month job).
      for (const cron of ['0 8 * * 5', '0 8 5 * *']) {
        const r = await fetch(`${url}cdn-cgi/handler/scheduled?cron=${encodeURIComponent(cron)}`);
        if (!r.ok) await fetch(`${url}__scheduled?cron=${encodeURIComponent(cron)}`);
      }
      await new Promise(ok => setTimeout(ok, 1500));
    }
  },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'Meet the Do 30 Day Challenge Club. A free club to help you feel better and move more. No accounts, no tracking.',
      tts: 'Meet the Do Thirty Day Challenge Club. A free club to help you feel better and move more. No accounts, no tracking.' },

    { id: 'week', title: 'This week’s starters', label: 'Starters',
      say: 'Every Friday the club welcomes everyone who has started this month’s challenge, on their own or as a team.',
      run: async (p, h) => {
        await h.wait(900);
        await h.scrollTo('#week', 'start', 70); await h.wait(700); await h.snap();
        await h.scrollBy(220); await h.wait(600);
      } },

    { id: 'roundup', title: 'The monthly roundup', label: 'Roundup',
      say: 'On the fifth of each month, the roundup celebrates every finisher. Bands and alphabetical lists, never a league table.',
      run: async (p, h) => {
        await h.scrollTo('#roundup', 'start', 70); await h.wait(900); await h.snap();
        await h.scrollBy(260); await h.wait(700); await h.scrollBy(240); await h.wait(500);
      } },

    { id: 'badges', title: 'Badges', label: 'Badges',
      say: 'Badges mark 30, 90, 180 and 360 days. Tap one to see who has shared it.',
      tts: 'Badges mark thirty, ninety, one hundred and eighty, and three hundred and sixty days. Tap one to see who has shared it.',
      run: async (p, h) => {
        await h.go('badges'); await h.wait(900); await h.snap();
        await h.tap('a.medal[href="/badges/30"]'); await h.wait(1000);
        await h.scrollBy(240); await h.wait(500);
      } },

    { id: 'together', title: 'Do it together', label: 'Team up',
      say: 'Team up with family or friends. Use the same team name and start day, and your team is celebrated together.',
      run: async (p, h) => {
        await h.go(''); await h.wait(300);
        await h.scrollTo('#together', 'start', 70); await h.wait(900); await h.snap();
      } },

    { id: 'join', title: 'How to join', label: 'Join in',
      say: 'To join, add a club nickname in the app’s settings, then tap Share when you start, finish or earn a badge. Nothing is sent unless you tap Share.',
      run: async (p, h) => {
        await h.scrollTo('#join', 'start', 70); await h.wait(900); await h.snap();
      } },

    { id: 'support', title: 'Support the club', label: 'Support',
      say: 'The club and the app are free, with no adverts. If you’d like to help, there’s the club shop, a tea or coffee, or simply sharing the club.',
      run: async (p, h) => {
        await h.tap('nav.tabs a[href="/support"]'); await h.wait(900); await h.snap();
        await h.scrollTo('#shop', 'start', 70); await h.wait(1200);
        await h.scrollTo('#coffee', 'start', 70); await h.wait(900);
        await h.scrollTo('#share', 'start', 70); await h.wait(600);
      } },

    { id: 'outro', card: 'outro', title: 'Join at club.do30daychallenge.com',
      say: 'The Do 30 Day Challenge Club is free at club.do30daychallenge.com. Start your challenge, share it, and we’ll cheer you on.',
      tts: 'The Do Thirty Day Challenge Club is free at club dot do thirty day challenge dot com. Start your challenge, share it, and we will cheer you on.' }
  ]
};
