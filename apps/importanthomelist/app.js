// © 2026 Stuart Parkins. Walkthrough configuration for Important Home List.
// Copied from apps/smartdrinktracker; see that file and the README for what each scene field means.
// Added 8 Nov 2026 for app v1.3 (new icon, Support the app page).
const path = require('path');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'important-home-list');

// A date a number of days ahead, as YYYY-MM-DD, for the date fields.
const inDays = n => { const d = new Date(); d.setDate(d.getDate() + n);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
// The app's bottom menu: Home, Register, Bills, Pack, Settings.
const nav = (h, name) => h.tap(`#nav button:has-text("${name}")`);

module.exports = {
  name: 'Important Home List',
  nameHtml: 'Important <span class="accent">Home</span>&nbsp;List',
  tagline: 'Know where it is. Know when it’s due.',
  url: 'importanthomelist.com',
  // Where the app's code lives. run.sh downloads the repo and sets APP_CODE.
  repo: 'scparkins-png/important-home-list',
  appFile: path.join(CODE, 'public', 'index.html'),
  icon: path.join(CODE, 'public', 'icon-512.png'),
  storageKey: 'importantHomeList.v1',
  demo: require('./demo-data.js'),
  // The app's own palette: deep teal header, warm off-white background.
  colours: { brand: '#1f5f6b', brandDark: '#143e46', mint: '#e3eeee', sky: '#f5f4ef', accent: '#1f8a8a' },
  outro: {
    points: ['Free', 'Private, no login', 'Works offline'],
    supportIcon: '💚',
    support: 'Support the app · importanthomelist.com/support',
    credit: 'Created by Stuart Parkins · © 2026'
  },
  voice: { name: 'bf_emma', speed: 1.0 },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'Meet Important Home List. A free, private list of where your important documents are, and when things need renewing.' },

    { id: 'start', title: 'Start with a checklist', label: 'Easy to start', state: 'fresh',
      say: 'Start with a checklist of common documents, or add your own. It records where things are kept, never the documents themselves.',
      run: async (p, h) => {
        await h.wait(600); await h.snap(); await h.wait(500);
        await h.tap('button:has-text("Start with a checklist")'); await h.wait(1300); await h.snap();
        for (let i = 0; i < 2; i++) { await p.evaluate(() => document.querySelector('.modal').scrollBy({ top: 380, behavior: 'smooth' })); await h.wait(1100); }
      } },

    { id: 'home', title: 'What’s due soon', label: 'Due soon',
      say: 'The Home screen shows what’s due soon, so renewals don’t catch you out. It also points out gaps, like an entry with no location, or only one copy.',
      run: async (p, h) => {
        await h.wait(600); await h.snap(); await h.wait(600);
        await h.scrollTo('h2:has-text("Gaps")', 'start', 90); await h.wait(1500);
        await h.scrollTo('h2:has-text("By category")', 'start', 90); await h.wait(900);
        await h.scrollTop();
      } },

    { id: 'register', title: 'Everything in one place', label: 'The Register',
      say: 'The Register holds everything in one place. Search it, or filter by person, category or where it’s kept.',
      run: async (p, h) => {
        await nav(h, 'Register'); await h.wait(1000); await h.snap();
        await h.scrollBy(420); await h.wait(900); await h.scrollTop();
        await h.tap('#q'); await p.keyboard.type('insurance', { delay: 90 }); await h.wait(1500); await h.snap();
      } },

    { id: 'entry', title: 'Where every copy lives', label: 'Where it is',
      say: 'Each entry says where every copy lives. A fireproof box, a cloud folder, even someone who holds it for you. Tap Checked today to keep it fresh.',
      run: async (p, h) => {
        await h.tap('.item:has-text("Home insurance")'); await h.wait(1200); await h.snap();
        await h.scrollTo('h2:has-text("Where it is")', 'start', 90); await h.wait(1500);
        await h.tap('button:has-text("Checked today")'); await h.wait(1500);
      } },

    { id: 'add', title: 'Add one in a minute', label: 'Add an entry',
      say: 'Adding one takes a minute. Note every place a copy is kept, and a renewal date if there is one. Never a full account number.',
      run: async (p, h) => {
        await nav(h, 'Register'); await h.wait(700);
        await h.tap('#fab'); await h.wait(800);
        await h.tap('#f_title'); await p.keyboard.type('Driving licence – Sam', { delay: 45 }); await h.wait(250);
        await p.selectOption('#f_category', 'Identity'); await h.wait(300);
        await p.selectOption('#f_person', 'Sam'); await h.wait(300);
        await h.tap('#f_provider'); await p.keyboard.type('DVLA', { delay: 60 }); await h.wait(300);
        await h.scrollTo('h2:has-text("Where it is")', 'start', 90); await h.wait(600);
        await h.tap('.loc input[data-lk="text"]'); await p.keyboard.type('Fireproof box, study', { delay: 40 }); await h.wait(300);
        await h.tap('button:has-text("Add location")'); await h.wait(500);
        await p.selectOption('.loc >> nth=1 >> select', 'gdrive'); await h.wait(500);
        await p.fill('.loc >> nth=1 >> input[data-lk="text"]', 'Scans > Identity > Licence'); await h.wait(500); await h.snap();
        await h.scrollTo('h2:has-text("Dates")', 'start', 90); await h.wait(500);
        await p.fill('#f_expiry', inDays(900)); await h.wait(700);
        await h.tap('button:has-text("Save")'); await h.wait(1600);
      } },

    { id: 'bills', title: 'Bills, so someone else could take over', label: 'Bills',
      say: 'Bills lists who you pay, what for, how often and when, so someone else could take over if they ever needed to.',
      run: async (p, h) => {
        await nav(h, 'Bills'); await h.wait(1000); await h.snap();
        await h.scrollBy(380); await h.wait(1000); await h.scrollTop();
        await h.tap('button:has-text("A–Z")'); await h.wait(1300);
        await h.tap('button:has-text("Due soonest")'); await h.wait(700);
      } },

    { id: 'pack', title: 'The “If I’m not here” pack', label: 'Printable pack',
      say: 'The If I’m not here pack turns it all into a printable summary for a partner or executor, with no passwords or full numbers.',
      run: async (p, h) => {
        await nav(h, 'Pack'); await h.wait(1000); await h.snap();
        await h.scrollTo('h2:has-text("Key contacts")', 'start', 90); await h.wait(1500);
        await h.scrollTo('h2:has-text("Wishes and notes")', 'start', 90); await h.wait(900);
      } },

    { id: 'backup', title: 'Private, and easy to move', label: 'Back up and move',
      say: 'Everything stays on your device. To use it on another phone, export a backup, and restore it there.',
      run: async (p, h) => {
        await nav(h, 'Settings'); await h.wait(900);
        await h.scrollTo('h2:has-text("Backup")', 'start', 90); await h.wait(1300); await h.snap();
        await h.scrollTop(); await h.wait(300);
        await h.tap('button:has-text("How this works")'); await h.wait(1200);
        await p.evaluate(() => { const m = document.querySelector('.modal'); const t = [...m.querySelectorAll('h3')].find(x => /Backing up/.test(x.textContent));
          if (t) m.scrollTo({ top: t.offsetTop - 12, behavior: 'smooth' }); });
        await h.wait(1800);
      } },

    { id: 'outro', card: 'outro', title: 'Free at importanthomelist.com',
      say: 'Important Home List is free at importanthomelist.com. If it helps you, share it with a friend, and support the app if you can.',
      tts: 'Important Home List is free at important home list dot com. If it helps you, share it with a friend, and support the app if you can.' }
  ]
};
