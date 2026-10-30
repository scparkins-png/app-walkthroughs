// © 2026 Stuart Parkins. Walkthrough configuration for Speak Receipts.
// Based on apps/smartdrinktracker. Scene fields are described in that app's app.js and the README.
const path = require('path');
const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'speak-expenses');

// What the demo "dictates" in the capture scene. Three receipts: the second takes its date and
// payment from the first, and the third has no category, so the review shows amber cards to fix.
const DICTATION = 'Paperfield printer ink, stationery, £24.99, 28th October, card, next. ' +
  'Quaymart car park, travel, £3.80, next. Fixwell light bulbs, £6.40, petty cash';

module.exports = {
  name: 'Speak Receipts',
  nameHtml: 'Speak <span class="accent">Receipts</span>',
  tagline: 'Dictate the pile. Check it. Send it to your accounts.',
  url: 'speakreceipts.com',
  // Where the app's code lives. run.sh downloads the repo and sets APP_CODE.
  repo: 'scparkins-png/speak-expenses',
  appFile: path.join(CODE, 'public', 'index.html'),
  icon: path.join(CODE, 'public', 'icon-512.png'),
  storageKey: 'sayItReceipts.v1',   // kept from Say It Receipts
  clock: '2026-10-30T09:30:00Z',     // the demo receipts use fixed dates in September and October 2026
  demo: require('./demo-data.js'),
  colours: { brand: '#1f6f5c', brandDark: '#12352c', mint: '#dcebe5', sky: '#eaf4fb', accent: '#2a8a70' },
  outro: {
    points: ['Free', 'Private, no login', 'Works offline'],
    support: 'Buy me a tea or coffee · buymeacoffee.com/stuartparkins',
    credit: 'Created by Stuart Parkins · © 2026'
  },
  voice: { name: 'bf_emma', speed: 1.0 },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'Meet Speak Receipts. Dictate your pile of receipts, check them, and send them to your accounts.' },

    { id: 'welcome', state: 'fresh', title: 'No account needed', label: 'No sign-up',
      say: "There's no account and no sign-up. Your receipts stay on your phone.",
      run: async (p, h) => { await h.wait(900); await h.scrollBy(260); await h.wait(1200); await h.scrollTop(); } },

    { id: 'dictate', title: 'Say your receipts', label: 'Speak your receipts',
      say: "Pick up a receipt and say the supplier, what it was, the amount, the date and how you paid. Say next, and carry on.",
      run: async (p, h) => {
        await h.tap('#dictation'); await h.wait(300);
        await p.locator('#dictation').pressSequentially(DICTATION, { delay: 32 });
        await h.wait(500); await h.snap();
      } },

    { id: 'check', title: 'Check the cards', label: 'Check each one',
      say: 'Tap Process and each receipt becomes a card. Anything in amber needs a quick look.',
      run: async (p, h) => {
        await p.locator('#dictation').fill(DICTATION);
        await h.tap('#processBtn'); await h.wait(900);
        await h.scrollTo('#review', 'start', 12); await h.wait(900); await h.snap();
        await h.scrollBy(520); await h.wait(700); await h.scrollBy(520); await h.wait(200);
      } },

    { id: 'save', title: 'Fix and save', label: 'Fix and save',
      say: 'Fix anything in a tap, then save. Write the reference number on the paper receipt.',
      run: async (p, h) => {
        const cat = '#review select[data-f="cat"]';
        await h.scrollTo(`${cat} >> nth=2`, 'center'); await h.wait(500);
        await h.tapNth(cat, 2); await p.locator(cat).nth(2).selectOption('office'); await h.wait(1100);
        await h.scrollTo('#saveAll', 'center'); await h.wait(400);
        await h.tap('#saveAll'); await h.wait(700); await h.scrollTop(); await h.wait(300); await h.snap();
      } },

    { id: 'receipts', title: 'All your receipts', label: 'All your receipts',
      say: 'The Receipts tab keeps them all, with totals, and filters by month, category and how you paid.',
      run: async (p, h) => {
        await p.evaluate(() => { const t = document.getElementById('toast'); if (t) t.hidden = true; });
        await h.tab('receipts'); await h.wait(1300); await h.snap();
        await h.scrollBy(450); await h.wait(900);
        await h.scrollTo('#catSummaryPanel', 'start', 80); await h.wait(1200);
      } },

    { id: 'export', title: 'Free CSV export', label: 'Free CSV export',
      say: 'Export a free CSV whenever you like, then mark them as exported so nothing goes in twice.',
      run: async (p, h) => {
        await h.scrollTo('#exFormat', 'start', 110); await h.wait(900);
        await h.tap('#dlCsv'); await h.wait(1300); await h.snap();
        await h.tap('#markEx'); await h.wait(1000);
      } },

    { id: 'pack', title: 'Export Pack', label: 'Ready for your accounts',
      say: 'The optional Export Pack adds ready-made files for Zoho Books, Xero, QuickBooks, FreeAgent and FreshBooks.',
      tts: 'The optional Export Pack adds ready-made files for Zoho Books, Zero, QuickBooks, Free Agent and Fresh Books.',
      run: async (p, h) => {
        await h.scrollTo('#exFormat', 'start', 110); await h.wait(400);
        await h.tap('#exFormat'); await p.locator('#exFormat').selectOption('xero'); await h.wait(900);
        await h.scrollTo('#packLocked', 'center'); await h.wait(1500); await h.snap();
        await p.locator('#exFormat').selectOption('basic');
      } },

    { id: 'settings', title: 'Make it yours', label: 'Your categories',
      say: "Set your own categories and the words you say for them, and turn on VAT if you're registered.",
      run: async (p, h) => {
        await h.tab('setup'); await h.wait(400);
        await h.tap('summary:has-text("Categories and spoken words")'); await h.wait(800); await h.snap();
        await h.scrollBy(380); await h.wait(300);
        await h.tap('#vatSettings summary'); await h.wait(400);
        await h.tap('#vatOn'); await h.wait(300); await h.scrollTo('#vatSettings', 'start', 90); await h.wait(400);
      } },

    { id: 'backup', title: 'Back up and move', label: 'Back up your data',
      say: 'Back up to a file to keep your receipts safe, or move them to another phone.',
      run: async (p, h) => {
        // Quietly fold away the sections opened in the last scene, so the backup section is easy to see.
        await p.evaluate(() => document.querySelectorAll('#view-setup details[open]').forEach(d => d.open = false));
        await h.scrollTo('summary:has-text("Backup and restore")', 'center'); await h.wait(300);
        await h.tap('summary:has-text("Backup and restore")'); await h.wait(1200); await h.snap(); await h.wait(600);
      } },

    { id: 'outro', card: 'outro', title: 'Free at speakreceipts.com',
      say: 'Speak Receipts is free at speakreceipts.com. If it saves you time, a tea or coffee is always appreciated.',
      tts: 'Speak Receipts is free at speak receipts dot com. If it saves you time, a tea or coffee is always appreciated.' }
  ]
};
