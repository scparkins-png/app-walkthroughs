// © 2026 Stuart Parkins. Walkthrough configuration for Pocket Karate (pocketkarate.com).
// Scene fields are described in apps/smartdrinktracker/app.js. Aimed at beginners.
// Updated 8 Nov 2026: Train together scene (Pocket Karate Club) and the outro points to Support the club.
//
// Pocket Karate uses <base href="/">, so it can't be opened as a plain file: "serve" makes the
// recorder open it from a small local web server instead. Its progress screens depend on the week,
// so "clock" starts the recording on Thursday 19 November 2026; demo-data.js is written to match.
const path = require('path');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'pocket-karate');

// The session player asks "End this session?" part-way through; accept it.
async function endSession(p, h) {
  p.once('dialog', d => d.accept().catch(() => {}));
  await h.tap('#pExit'); await h.wait(500);
}

module.exports = {
  name: 'Pocket Karate',
  nameHtml: 'Pocket <span class="accent">Karate</span>',
  tagline: 'Learn and train karate at home, free',
  url: 'pocketkarate.com',
  // Where the app's code lives. run.sh downloads the repo and sets APP_CODE.
  repo: 'scparkins-png/pocket-karate',
  appFile: path.join(CODE, 'app', 'index.html'),
  serve: path.join(CODE, 'app'),
  icon: path.join(CODE, 'app', 'img', 'icons', 'logo-512.png'),
  storageKey: 'pocketkarate.v1',
  clock: '2026-11-19T18:30:00Z',
  demo: require('./demo-data.js'),
  colours: { brand: '#d97f00', brandDark: '#1f1a14', mint: '#fbeedb', sky: '#f6e4cc', accent: '#f39200' },
  outro: {
    points: ['Free', 'No sign-up', 'Works offline'],
    supportIcon: '💚',
    support: 'Support the club · club.pocketkarate.com/support',
    credit: 'Created by Stuart Parkins · © 2026'
  },
  voice: { name: 'bf_emma', speed: 1.0 },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'New to karate? Pocket Karate gives you free lessons and hands-free training you can follow at home.' },

    { id: 'learn', title: 'Start here', label: 'Start here',
      say: 'Start with Learn. It follows a simple training plan: the bow, warm-ups and stretches first, then stances, blocks, punches and kicks.',
      run: async (p, h) => {
        await h.wait(1200); await h.snap();
        await h.scrollTo('h2:has-text("Topics")', 'start', 70); await h.wait(2600);
        await h.scrollBy(380); await h.wait(1600);
      } },

    { id: 'lesson', title: 'Step by step', label: 'Step by step',
      say: 'Each lesson shows the move step by step on an instruction card, with beginner reps, a video and a Listen button.',
      run: async (p, h) => {
        await h.scrollTop(); await h.tap('[data-go="#/cat/stances"]'); await h.wait(700);
        await h.tap('[data-go="#/item/B2"]'); await h.wait(900); await h.snap();
        await h.tap('[data-zoom]'); await h.wait(1400); await h.tap('#zoom button'); await h.wait(300);
        await h.scrollTo('h2:has-text("How many")', 'start', 90); await h.wait(900);
      } },

    { id: 'train', title: 'Train at home', label: 'Train at home',
      say: 'Ready to practise? Start a quick session, or pick a ready-made lesson.',
      run: async (p, h) => {
        await h.tab('train'); await h.wait(1300); await h.snap();
        await h.scrollTo('h2:has-text("Ready-made lessons")', 'start', 70); await h.wait(1200);
      } },

    { id: 'player', title: 'Hands-free sessions', label: 'Hands-free',
      say: 'Prop your phone up and follow along. Each part is announced, then a timer with beeps moves you on.',
      run: async (p, h) => {
        await h.tap('[data-lesson="L1"]'); await h.wait(900);
        await h.tap('#pPlay'); await h.wait(2000); await h.snap();
        await h.tap('#pNext'); await h.wait(1700);
      } },

    { id: 'pathway', title: 'Aim for your first belt', label: 'First belt goal',
      say: 'Working towards your first belt? The pathway builds up, stage by stage, to a first-belt syllabus, with practice mock gradings.',
      run: async (p, h) => {
        await endSession(p, h);
        await h.scrollTo('[data-go="#/path"]', 'center'); await h.wait(400);
        await h.tap('[data-go="#/path"]'); await h.wait(1000);
        await h.scrollTo('[data-go="#/path/1"]', 'start', 90); await h.wait(500); await h.snap(); await h.wait(1300);
        await h.scrollBy(260); await h.wait(300);
      } },

    { id: 'kata', title: 'Your first kata', label: 'Your first kata',
      tts: 'When you\'re ready, learn your first kata, Pin-ann Nee-dan, one movement at a time.',
      say: 'When you\'re ready, learn your first kata, Pinan Nidan, one movement at a time.',
      run: async (p, h) => {
        await h.tab('kata'); await h.wait(500);
        await h.tap('[data-go="#/kata/step/0"]'); await h.wait(900);
        await h.tap('button:has-text("Next ›")'); await h.wait(900); await h.snap();
        await h.tap('button:has-text("Next ›")'); await h.wait(400);
      } },

    { id: 'progress', title: 'Little and often', label: 'Little and often',
      say: 'Little and often is the aim. My progress shows your training days, points and week streak.',
      run: async (p, h) => {
        await h.tab('train'); await h.wait(300);
        await h.tap('.progc'); await h.wait(1300); await h.snap();
        await h.scrollTo('h3:has-text("This week")', 'center'); await h.wait(2000);
      } },

    { id: 'badges', title: 'Earn badges', label: 'Earn badges',
      say: 'Earn badges as you go, with certificates to work towards.',
      run: async (p, h) => {
        await h.scrollTo('h3.bfam', 'start', 80); await h.wait(1200); await h.snap(); await h.wait(600);
        await h.scrollTo('h2:has-text("Certificates")', 'start', 80); await h.wait(1000);
      } },

    { id: 'club', title: 'Train together', label: 'Train together',
      say: 'Join the free Pocket Karate Club. Pick a nickname, then share your training week to be cheered on, with family or friends if you like.',
      run: async (p, h) => {
        // The share gets a made-up reply here, so nothing reaches the live club.
        await p.route('**/api/share', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, name: 'approved' }) }));
        await p.evaluate(() => { location.hash = '#/settings'; }); await h.wait(700);
        await h.scrollTo('#clubNick', 'center'); await h.wait(300);
        await h.tap('#clubNick'); await p.keyboard.type('DemoKicker', { delay: 45 }); await h.wait(150);
        await h.tap('#clubTeam'); await p.keyboard.type('Demo Family', { delay: 45 }); await h.wait(200);
        await h.tap('[data-clubsave]'); await h.wait(500); await h.snap();
        await p.evaluate(() => { location.hash = '#/progress'; }); await h.wait(600);
        await h.scrollTo('[data-clubweek]', 'center'); await h.wait(400);
        p.once('dialog', d => d.accept().catch(() => {}));
        await h.tap('[data-clubweek]'); await h.wait(1600);
      } },

    { id: 'safety', title: 'Train safely', label: 'Train safely',
      say: 'Warm up first and stop if anything hurts. There\'s no account, and your training stays on your phone.',
      run: async (p, h) => {
        await h.tap('footer a[href="#/disclaimer"]'); await h.wait(1300); await h.snap(); await h.wait(1200);
        await h.scrollBy(420); await h.wait(1000);
      } },

    { id: 'outro', card: 'outro', title: 'Free at pocketkarate.com',
      say: 'Pocket Karate is free at pocketkarate.com. Train with others at club.pocketkarate.com, and if you’d like to help, there’s a Support the club page.',
      tts: 'Pocket Karate is free at pocket karate dot com. Train with others at club dot pocket karate dot com, and if you would like to help, there is a Support the club page.' }
  ]
};
