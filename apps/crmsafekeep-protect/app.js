// © 2026 Stuart Parkins. Walkthrough for CRM SafeKeep on the Protect plan.
// Shared settings, demo server and icon are in apps/crmsafekeep-shared. Script agreed with Stuart, 15 Nov 2026
// (project doc claude/walkthrough-videos.md).
const settings = require('../crmsafekeep-shared/common.js');

module.exports = settings('protect', 8812, {
  name: 'CRM SafeKeep Protect',
  nameHtml: 'CRM SafeKeep <span class="accent">Protect</span>',
  tagline: 'Your Zoho CRM, backed up, and getting better over time.',
  outro: {
    points: ['Backed up', 'From £39 a month, billed annually', 'Zoho CRM today, more systems soon'],
    supportIcon: '✉️',
    support: 'Questions? support@crmsafekeep.com',
    credit: 'Created by Stuart Parkins · © 2026'
  },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: 'CRM SafeKeep Protect. Your Zoho CRM, backed up, and getting better over time.' },

    { id: 'problem', card: 'text', title: 'The problem', kicker: 'The problem',
      heading: "A backup you never download isn't much of a backup",
      lines: ['And a CRM nobody checks slowly drifts'],
      say: "A backup you never download isn't much of a backup. And a CRM nobody checks slowly drifts: changes, switched-off automations, damaged data." },

    { id: 'dashboard', title: 'Checked every morning', label: 'Daily checks',
      say: "Protect checks your CRM every morning, using Stuart Parkins' eight-area method for looking after business systems. You can refresh whenever you like.",
      run: async (p, h) => {
        await h.wait(1500); await h.snap();
        await h.wait(1500); await h.scrollBy(460); await h.wait(1500); await h.scrollBy(400); await h.wait(800);
        await h.scrollTop();
      } },

    { id: 'backup', title: 'Backed up', label: 'Backed up',
      say: "It adds an independent backup of your CRM, kept outside Zoho, so you're never relying on one copy.",
      run: async (p, h) => {
        await h.go('tile/backup'); await h.wait(1600);
        await h.go('help'); await h.wait(300);
        await h.scrollTo('#plan', 'start', 20); await h.wait(1500); await h.snap();
      } },

    { id: 'changed', title: 'See exactly what changed', label: 'What changed',
      say: 'When something changes, you see exactly what it was, like this workflow being switched off, so you can check it was meant to happen.',
      run: async (p, h) => {
        await h.go('tile/automations'); await h.wait(1300); await h.snap();
        await h.scrollTo('text=Since the last check', 'center'); await h.wait(1300);
      } },

    { id: 'fix', title: 'Steps to fix it', label: 'Fix it',
      say: 'Each issue comes with clear steps for today, and a button straight into the right Zoho screen.',
      run: async (p, h) => {
        await h.go('tile/access'); await h.wait(1200);
        await h.tap('summary:has-text("About this area")'); await h.wait(500);
        await h.scrollTo('text=Quick tips', 'start', 120); await h.wait(1400); await h.snap();
      } },

    { id: 'audit', title: 'The Self Audit', label: 'Self Audit',
      say: "The Self Audit covers what the checks can't see. Your answers grade each of the eight areas and show where to improve.",
      run: async (p, h) => {
        await h.go('audit'); await h.wait(1300); await h.snap();
        await h.scrollBy(420); await h.wait(1300); await h.scrollBy(380); await h.wait(600);
      } },

    { id: 'plan', title: 'One action plan', label: 'Action plan',
      say: "Everything goes into one action plan. Tick things off, and the next check confirms they're done.",
      run: async (p, h) => {
        await h.go('plan'); await h.wait(900);
        await h.scrollBy(330); await h.wait(1300); await h.snap();
        await h.scrollTo('text=Done this month', 'start', 20); await h.wait(1500);
      } },

    { id: 'weeks', title: 'Watch it improve', label: 'Getting better',
      say: 'And you can watch your CRM improve. The last eight weeks show it changing as you make each fix.',
      run: async (p, h) => {
        await h.scrollTop(); await h.wait(300);
        await h.scrollTo('.hist', 'center'); await h.wait(1400); await h.snap();
      } },

    { id: 'running', title: 'Early warnings', label: 'Early warnings',
      say: 'Storage and API meters show the trend and warn you before anything fills up.',
      run: async (p, h) => {
        await h.go('tile/running'); await h.wait(1100);
        await h.scrollTo('text=File storage', 'center'); await h.wait(1300); await h.snap();
      } },

    { id: 'report', title: 'A review record', label: 'Review record',
      say: 'Print a review record for your files, ready for audits and GDPR.',
      run: async (p, h) => {
        await h.go('report'); await h.wait(1300); await h.snap();
        await h.scrollBy(460); await h.wait(900);
      } },

    { id: 'ask', title: 'Ask Stuart', label: 'Ask Stuart',
      say: 'Stuck? Ask Stuart from inside the app.',
      run: async (p, h) => { await h.go('ask'); await h.wait(1200); await h.snap(); } },

    { id: 'improving', card: 'text', title: 'Always improving', short: false, kicker: 'Good to know',
      heading: 'Zoho CRM today. More systems soon.',
      lines: ['Always improving, so some screens may change'],
      say: 'Zoho CRM today, more systems soon, and the app keeps improving, so some screens may change.' },

    { id: 'outro', card: 'outro', title: 'crmsafekeep.com',
      say: 'Protect, from £39 a month billed annually, at crmsafekeep.com. Created by Stuart Parkins.' }
  ]
});
