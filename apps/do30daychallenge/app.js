// © 2026 Stuart Parkins. Walkthrough configuration for Do 30 Day Challenge (do30daychallenge.com).
// Scene fields are described in apps/smartdrinktracker/app.js.
//
// This app's screens depend on the date, so "clock" starts the recording at a fixed date and time
// (Thursday 19 November 2026). The demo data in demo-data.js is written to match it.
const path = require('path');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', '30-day-challenge');

// The app's bottom bar uses data-act="tab" with data-arg, so tabs are tapped directly.
const tab = (h, name) => h.tap(`#nav [data-act="tab"][data-arg="${name}"]`);

module.exports = {
  name: 'Do30DayChallenge',
  nameHtml: 'Do<span class="accent">30</span>DayChallenge',
  tagline: 'Your 30-day exercise challenge, planned, tracked and caught up',
  url: 'do30daychallenge.com',
  // Where the app's code lives. run.sh downloads the repo and sets APP_CODE.
  repo: 'scparkins-png/30-day-challenge',
  appFile: path.join(CODE, 'public', 'index.html'),
  icon: path.join(CODE, 'public', 'icons', 'icon-512.png'),
  storageKey: 'thirtyday:v1',
  clock: '2026-11-19T09:30:00Z',
  demo: require('./demo-data.js'),
  colours: { brand: '#0f766e', brandDark: '#0b2f2c', mint: '#e3f3f1', sky: '#eaf4fb', accent: '#14b8a6' },
  outro: {
    points: ['Free', 'Private, no login', 'Works offline'],
    support: 'Buy me a tea or coffee · buymeacoffee.com/stuartparkins',
    credit: 'Created by Stuart Parkins · © 2026'
  },
  voice: { name: 'bf_emma', speed: 1.0 },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'Meet Do 30 Day Challenge. A free, private app for your monthly thirty-day exercise challenge.',
      tts: 'Meet Do Thirty Day Challenge. A free, private app for your monthly thirty-day exercise challenge.' },

    // A first visit (no data yet), planning December so the set-up screen is clean.
    { id: 'choose', state: 'fresh', title: 'Choose your challenge', label: 'Pick your challenge',
      say: 'Choose a challenge for the month: Classic ABS, a fresh ABS Mix, or ABS Mixed with warm-ups and extras. Pick your level, then shuffle or swap any exercise.',
      tts: 'Choose a challenge for the month: Classic abs, a fresh abs Mix, or abs Mixed, with warm-ups and extras. Pick your level, then shuffle or swap any exercise.',
      run: async (p, h) => {
        await h.wait(200); await h.tap('[data-act="startMonth"][data-arg="next"]'); await h.wait(400);
        await h.scrollTo('[data-act="pickStart"][data-arg="abs"]', 'start', 90); await h.wait(600);
        await h.tap('[data-act="pickStart"][data-arg="abs-mixed"]'); await h.wait(900);
        await h.scrollTo('[data-act="pickLevel"][data-arg="moderate"]', 'start', 120); await h.wait(300);
        await h.tap('[data-act="pickLevel"][data-arg="moderate"]'); await h.wait(700); await h.snap();
        await h.scrollTo('[data-act="mixShuffle"]', 'center'); await h.wait(400);
        await h.tap('[data-act="mixShuffle"]'); await h.wait(700);
      } },

    { id: 'today', title: 'Today at a glance', label: 'Today',
      say: "Today shows your progress, the rest days you have left, and today's workout, with every target worked out for you.",
      run: async (p, h) => {
        await h.wait(1200); await h.snap(); await h.wait(1600);
        await h.scrollTo('[data-act="startWorkout"]', 'center'); await h.wait(1200);
        await h.scrollBy(-260); await h.wait(600);
      } },

    { id: 'workout', title: 'Follow the workout', label: 'Workout',
      say: 'Each exercise has a picture and simple steps, and timed moves have a built-in timer.',
      run: async (p, h) => {
        await h.tap('[data-act="startWorkout"]'); await h.wait(900);
        await h.tap('#wk [data-act="tmToggle"]'); await h.wait(1600); await h.snap(); await h.wait(300);
        await h.tap('#wk [data-act="wkNext"]'); await h.wait(1000);
        await h.tap('#wk [data-act="wkQuit"]'); await h.wait(400);
        if (await p.locator('#sheet.open').count()) { await h.tap('#sheet [data-act="confirmOk"]'); await h.wait(300); }
      } },

    { id: 'calendar', title: 'Your month on one screen', label: 'Calendar',
      say: 'The calendar shows your whole month: green ticks for days done, rest days, and an amber mark for a day you missed.',
      run: async (p, h) => {
        await tab(h, 'calendar'); await h.wait(1400); await h.snap(); await h.wait(2600);
        await h.scrollBy(240); await h.wait(1200);
      } },

    { id: 'catchup', title: 'Catch up on a missed day', label: 'Catch up',
      say: 'Missed a day? Tap it to catch up. It gets an orange tick, so you can see it was done later.',
      run: async (p, h) => {
        await h.scrollTop(); await h.wait(300);
        await h.tap('[data-act="day"][data-arg="2026-11-17"]'); await h.wait(1600); await h.snap(); await h.wait(500);
        await h.tap('#sheet [data-act="catchMark"]'); await h.wait(600);
        await h.tap('#sheet [data-act="confirmOk"]'); await h.wait(1300);
      } },

    { id: 'exercises', title: 'Exercise library', label: 'Exercises',
      say: 'Browse thirty exercises by area, each with a picture and how to do it.',
      tts: 'Browse thirty exercises by area, each with a picture, and how to do it.',
      run: async (p, h) => {
        await tab(h, 'exercises'); await h.wait(700);
        await h.tap('[data-act="exFilter"][data-arg="obliques"]'); await h.wait(900);
        await h.tap('[data-act="exDetail"][data-arg="russian-twist"]'); await h.wait(1500); await h.snap(); await h.wait(700);
        await h.tap('#sheet [data-act="closeSheet"]'); await h.wait(300);
      } },

    { id: 'activity', title: 'Log other activity', label: 'Other activity',
      say: 'Log walks, martial arts, yoga and more, and set yourself a weekly target.',
      run: async (p, h) => {
        await tab(h, 'today'); await h.wait(300);
        await h.scrollTo('[data-act="actAdd"][data-arg="walk"]', 'center'); await h.wait(400);
        await h.tap('[data-act="actAdd"][data-arg="walk"]'); await h.wait(500);
        await p.locator('#aMins').fill('30'); await h.wait(200);
        const dist = p.locator('#aDist'); if (await dist.count()) await dist.fill('2.1');
        await h.wait(300); await h.snap();
        await h.tap('#sheet [data-act="actSave"]'); await h.wait(500);
        await h.scrollTo('[data-act="actAdd"][data-arg="walk"]', 'center'); await h.wait(600);
      } },

    { id: 'badges', title: 'Badges and certificates', label: 'Badges',
      say: 'Finish a month and you earn a badge, with a certificate you can print.',
      run: async (p, h) => {
        await tab(h, 'history'); await h.wait(500);
        await h.tap('[data-act="openBadges"]'); await h.wait(1500); await h.snap();
        await h.tap('#sheet [data-act="openCert"]'); await h.wait(1700);
        await p.evaluate(() => closeSheet());   // the certificate sheet has no Close button
      } },

    { id: 'private', title: 'Private, with backups', label: 'Private & backed up',
      say: "There's no account. Everything stays on your phone, and you can back it up or move it to another device.",
      run: async (p, h) => {
        await tab(h, 'settings'); await h.wait(900);
        await h.scrollTo('#backupCard', 'center'); await h.wait(1200); await h.snap(); await h.wait(800);
      } },

    { id: 'outro', card: 'outro', title: 'Free at do30daychallenge.com',
      say: 'Do 30 Day Challenge is free at do30daychallenge.com. If it helps you, a tea or coffee is always appreciated.',
      tts: 'Do Thirty Day Challenge is free at do thirty day challenge dot com. If it helps you, a tea or coffee is always appreciated.' }
  ]
};
