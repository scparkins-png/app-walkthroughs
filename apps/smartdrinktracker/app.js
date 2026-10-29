// © 2026 Stuart Parkins. Walkthrough configuration for SmartDrinkTracker.
// Each app gets its own folder like this one: app.js (branding + scenes) and demo-data.js.
//
// Scene fields:
//   id     short name, used for file names
//   title  heading shown beside the phone in the widescreen video
//   label  short label burned into the upright Short (people often watch muted)
//   say    the voiceover line, also used for the captions file
//   tts    optional spelling for the AI voice when "say" would be misread (e.g. the app name)
//   card   'intro' or 'outro' for the branded cards (no recording)
//   state  which demo state to load: 'demo' (default) or 'fresh' (first visit, no data)
//   run    async (page, h) => { ... } the taps and scrolls, using the helpers in record.js
const path = require('path');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'smart-drinks-tracker');

module.exports = {
  name: 'SmartDrinkTracker',
  nameHtml: 'Smart<span class="accent">Drink</span>Tracker',
  tagline: 'Drink more water, less caffeine, sugar and alcohol',
  url: 'smartdrinktracker.org',
  // Where the app's code lives. run.sh downloads the repo and sets APP_CODE.
  repo: 'scparkins-png/smart-drinks-tracker',
  appFile: path.join(CODE, 'public', 'index.html'),
  icon: path.join(CODE, 'public', 'icon-512.png'),
  storageKey: 'sdt.v1',
  demo: require('./demo-data.js'),
  colours: { brand: '#1e8a6e', brandDark: '#123029', mint: '#e2f5ed', sky: '#eaf4fb', accent: '#2a9d7a' },
  outro: {
    points: ['Free', 'Private, no login', 'Works offline'],
    support: 'Buy me a tea or coffee · buymeacoffee.com/stuartparkins',
    credit: 'Created by Stuart Parkins · © 2026'
  },
  voice: { name: 'bf_emma', speed: 1.0 },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'Meet SmartDrinkTracker. A free, private app to help you drink more water, and less caffeine, sugar and alcohol.',
      tts: 'Meet Smart Drink Tracker. A free, private app to help you drink more water, and less caffeine, sugar and alcohol.' },

    { id: 'welcome', state: 'fresh', title: 'No account needed', label: 'No sign-up',
      say: "There's no account and no sign-up. Everything stays on your phone.",
      run: async (p, h) => { await h.wait(800); await h.snap(); await h.wait(1400); await h.tap('[data-act="welcome"]'); await h.wait(600); } },

    { id: 'water', title: 'Track your water', label: 'Add water',
      say: 'Tap a glass each time you have water, and watch your daily goal fill up.',
      run: async (p, h) => {
        await h.scrollTo('.water-big', 'center'); await h.wait(500);
        await h.tap('.water-big'); await h.wait(900); await h.tap('.water-big'); await h.wait(700);
        await h.scrollTop(); await h.wait(600);
      } },

    { id: 'alcohol', title: 'Log a drink', label: 'Log a drink',
      say: "Log a drink with one tap. Pints, halves or wine, the units are worked out for you, with a swap suggested if you'd like one.",
      run: async (p, h) => {
        await h.scrollTo('h3:has-text("Beer, ale and cider")', 'start', 90); await h.wait(1600);
        await h.tap('[data-act="drink"][data-id="hh"]'); await h.wait(1800);
        await h.snap(); await h.tap('[data-act="swap"]'); await h.wait(1200);
      } },

    { id: 'other', title: 'Healthier choices count', label: 'Decaf counts too',
      say: 'Herbal tea, decaf and sugar-free squash count towards your water too.',
      run: async (p, h) => {
        await h.scrollTo('[data-act="fluid"][data-c="q"]', 'center'); await h.wait(900);
        await h.tap('[data-act="fluid"][data-c="x"]'); await h.wait(1500);
      } },

    { id: 'yesterday', title: 'Missed one?', label: 'Add to yesterday',
      say: 'Forgot something? Switch to Yesterday and add it.',
      run: async (p, h) => {
        await h.scrollTop(); await h.wait(300);
        await h.tap('[data-act="logday"][data-v="yesterday"]'); await h.wait(500);
        await h.tap('.water-big'); await h.wait(1100);
        await h.scrollTop(); await h.tap('[data-act="logday"][data-v="today"]'); await h.wait(300);
      } },

    { id: 'swaps', title: 'See what you save', label: 'Your swaps',
      say: "The Swaps page shows your best alternatives, and the calories and units you've saved.",
      run: async (p, h) => { await h.tab('swaps'); await h.wait(500); await h.snap(); await h.wait(800); await h.scrollBy(420); await h.wait(1200); await h.scrollBy(420); await h.wait(400); } },

    { id: 'progress', title: 'Streaks and history', label: 'Your progress',
      say: 'Progress shows your streaks, a calendar of your days, and how this week compares with last. Alcohol-free days count once the day is over.',
      run: async (p, h) => {
        await h.tab('week'); await h.wait(1200); await h.snap(); await h.wait(1400);
        await h.scrollTo('.cal-head', 'start', 120); await h.wait(2600);
        await h.scrollTop(); await h.wait(600);
      } },

    { id: 'share', title: 'Share your good news', label: 'Share progress',
      say: 'Proud of a streak? Share your good news, and choose exactly what goes in.',
      run: async (p, h) => {
        await h.tap('[data-act="share"]'); await h.wait(1500);
        await h.tapNth('#sharebox input[type=checkbox]', 1); await h.wait(500); await h.snap(); await h.wait(800);
        await h.tap('#sharebox [data-act="shareclose"]'); await h.wait(400);
      } },

    { id: 'backup', title: 'Back up and move', label: 'Back up your data',
      say: 'Back up your data to a file, so you can move it to a new phone or another device.',
      run: async (p, h) => { await h.tab('backup'); await h.wait(1800); await h.scrollBy(300); await h.wait(1200); } },

    { id: 'settings', title: 'Make it yours', label: 'Light or dark',
      say: 'Choose light or dark, or match your phone.',
      run: async (p, h) => {
        await h.tab('settings'); await h.scrollTo('[data-act="theme"]', 'center'); await h.wait(500);
        await h.tap('[data-act="theme"][data-v="dark"]'); await h.wait(700); await h.snap(); await h.wait(600);
        await h.tap('[data-act="theme"][data-v="light"]'); await h.wait(700);
      } },

    { id: 'outro', card: 'outro', title: 'Free at smartdrinktracker.org',
      say: 'SmartDrinkTracker is free at smartdrinktracker.org. If it helps you, a tea or coffee is always appreciated.',
      tts: 'Smart Drink Tracker is free at smart drink tracker dot org. If it helps you, a tea or coffee is always appreciated.' }
  ]
};
