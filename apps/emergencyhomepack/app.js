// © 2026 Stuart Parkins. Walkthrough configuration for Emergency Home Pack.
// Copied from apps/smartdrinktracker; see that file and the README for what each scene field means.
const path = require('path');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'emrgency-home-pack');

module.exports = {
  name: 'Emergency Home Pack',
  nameHtml: 'Emergency <span class="accent">Home</span>&nbsp;Pack',
  tagline: 'Build it up. Keep it in date.',
  url: 'emergencyhomepack.com',
  // Where the app's code lives (the repo name is spelt "emrgency"). run.sh downloads it and sets APP_CODE.
  repo: 'scparkins-png/emrgency-home-pack',
  appFile: path.join(CODE, 'public', 'index.html'),
  icon: path.join(CODE, 'public', 'icon-512.png'),
  storageKey: 'hep-v1',
  demo: require('./demo-data.js'),
  // The app's own palette: signal orange on a dark navy band, warm off-white background.
  colours: { brand: '#d9480f', brandDark: '#1d2430', mint: '#fde8dc', sky: '#f3f2ee', accent: '#d9480f' },
  outro: {
    points: ['Free', 'Private, no login', 'Works offline'],
    support: 'Buy me a tea or coffee · buymeacoffee.com/stuartparkins',
    credit: 'Created by Stuart Parkins · © 2026'
  },
  voice: { name: 'bf_emma', speed: 1.0 },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'Meet Emergency Home Pack. A free, private app to build a home emergency kit, and keep it in date.' },

    { id: 'overview', title: 'How ready are you?', label: 'How ready are you?',
      say: 'The Overview shows how ready your home is, and the one thing to add this week.',
      run: async (p, h) => {
        await h.wait(500); await h.snap(); await h.wait(500);
        await h.scrollTo('h2:has-text("Build-up levels")', 'start', 125); await h.wait(900);
        await h.scrollTo('h2:has-text("One thing this week")', 'start', 125); await h.wait(700);
        await h.scrollTop();
      } },

    { id: 'household', title: 'Your household', label: 'Who it\'s for',
      say: 'Tell it who lives with you, pets included, and how many days to cover. It works out the water, food and kit you need.',
      run: async (p, h) => {
        await h.tab('plan'); await h.wait(900);
        await h.tap('[data-act="days"][data-d="7"]'); await h.wait(1000); await h.snap();
        await h.scrollTo('h2:has-text("What you need")', 'start', 125); await h.wait(1200);
        await h.scrollTop(); await h.wait(200);
        await h.tap('[data-act="days"][data-d="3"]'); await h.wait(500);
      } },

    { id: 'levels', title: 'Build it up in levels', label: 'Three levels',
      say: 'Everything is colour coded. Red essentials first, then the core pack, then the extras.',
      run: async (p, h) => {
        await h.scrollTo('h2:has-text("What you need")', 'start', 125); await h.wait(1000); await h.snap();
        await h.scrollBy(380); await h.wait(900); await h.scrollBy(380); await h.wait(400);
      } },

    { id: 'stock', title: 'Log your stock', label: 'Add your stock',
      say: "Log what you have, where it's kept, and when it expires. The date can wait if you're busy.",
      run: async (p, h) => {
        await h.tab('stock'); await h.wait(300);
        await h.tap('[data-act="new"]'); await h.wait(500);
        // Choose from the list without clicking it, so no native drop-down gets in the way.
        await p.selectOption('#e-key', 'hy-wipes'); await h.wait(600);
        await h.tap('#e-qty'); await p.fill('#e-qty', ''); await p.keyboard.type('2', { delay: 100 }); await h.wait(150);
        await h.tap('#e-loc'); await p.keyboard.type('Under stairs box', { delay: 35 }); await h.wait(150);
        await h.scrollTo('#e-date', 'center'); await p.fill('#e-date', '2028-03-31'); await h.wait(400); await h.snap();
        await h.tap('#ed button[type="submit"]'); await h.wait(300);
        await h.scrollTo('.row .t:has-text("Wet wipes")', 'center'); await h.wait(500);
      } },

    { id: 'checks', title: 'Keep it in date', label: 'Checks and expiry',
      say: "Expired items and overdue checks come to the top. Tap Checked today, and it's done.",
      run: async (p, h) => {
        await h.tab('overview'); await h.scrollTo('h2:has-text("Needs attention")', 'start', 125); await h.wait(1300); await h.snap();
        await h.tap('[data-act="checked"]'); await h.wait(1600);
      } },

    { id: 'food', title: 'Food into meals', label: 'Food into meals',
      say: "The Food tab turns tins and packets into meals, and shows which food groups you're short of.",
      run: async (p, h) => {
        await h.tab('food'); await h.wait(1500); await h.snap();
        await h.scrollTo('h2:has-text("Portions by group")', 'start', 125); await h.wait(1800);
      } },

    { id: 'mealplan', title: 'A rough meal plan', label: 'Meal plan',
      say: 'It even builds a rough meal plan, using the food closest to its date first.',
      run: async (p, h) => {
        await h.scrollTo('h2:has-text("Meal plan")', 'start', 125); await h.wait(1100); await h.snap();
        await h.scrollBy(360); await h.wait(1100); await h.scrollBy(360); await h.wait(600);
      } },

    { id: 'shop', title: 'Shopping list', label: 'Tick it, it\'s stocked',
      say: 'The shopping list comes from the gaps. Tick an item, and it goes straight into your stock.',
      run: async (p, h) => {
        await h.tab('shop'); await h.scrollTo('[data-act="tick"][data-key="light-torch"]', 'center'); await h.wait(900);
        await h.tap('[data-act="tick"][data-key="light-torch"]'); await h.wait(900); await h.snap();
        await h.scrollTo('#ed button[type="submit"]', 'center'); await h.wait(400);
        await h.tap('#ed button[type="submit"]'); await h.wait(300);
        await h.scrollTo('[data-act="tick"][data-key="light-torch"]', 'center'); await h.wait(500);
      } },

    { id: 'print', title: 'Print, remind, back up', label: 'Print and back up',
      say: 'Print a contents list for the box, add reminders to your calendar, and back up to move it to another phone.',
      run: async (p, h) => {
        await h.tab('help'); await h.scrollTo('h2:has-text("Print and reminders")', 'start', 125); await h.wait(1800); await h.snap();
        await h.scrollTo('h2:has-text("Backup and restore")', 'start', 125); await h.wait(1500);
      } },

    { id: 'outro', card: 'outro', title: 'Free at emergencyhomepack.com',
      say: 'Emergency Home Pack is free at emergencyhomepack.com. If it helps you, a tea or coffee is always appreciated.',
      tts: 'Emergency Home Pack is free at emergency home pack dot com. If it helps you, a tea or coffee is always appreciated.' }
  ]
};
