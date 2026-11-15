// © 2026 Stuart Parkins. Walkthrough for CRM SafeKeep on the free Monitor plan.
// Shared settings, demo server and icon are in apps/crmsafekeep-shared. Script agreed with Stuart, 15 Nov 2026
// (project doc claude/walkthrough-videos.md).
const settings = require('../crmsafekeep-shared/common.js');

module.exports = settings('monitor', 8811, {
  name: 'CRM SafeKeep Monitor',
  nameHtml: 'CRM <span class="accent">SafeKeep</span>',
  tagline: 'Know your Zoho CRM is safe and backed up. Free.',
  outro: {
    points: ['Free', 'Read-only', 'Zoho CRM today, more systems soon'],
    supportIcon: '✉️',
    support: 'Questions? support@crmsafekeep.com',
    credit: 'Created by Stuart Parkins · © 2026'
  },

  scenes: [
    { id: 'intro', card: 'intro', title: 'Welcome',
      say: "Is your Zoho CRM safe? Most businesses don't actually know." },

    { id: 'backups', card: 'text', title: 'Backups', kicker: 'The problem',
      heading: 'Zoho makes backups. Who keeps them?',
      lines: ['They only last a short time', 'Many are never downloaded', 'Or kept somewhere safe'],
      say: 'Zoho makes backups for you, but they only sit there for a short time. Many people never download them and keep them somewhere safe.' },

    { id: 'drift', card: 'text', title: 'CRMs drift', kicker: 'The problem',
      heading: 'CRMs change over time',
      lines: ['Workflows get switched off', 'Fields get removed', 'Records go missing'],
      say: "And CRMs change over time. Workflows get switched off, fields get removed, records go missing. If nobody is checking, how would you know?" },

    { id: 'start', title: 'CRM SafeKeep checks for you', label: 'It checks for you',
      say: 'CRM SafeKeep checks for you. It works with Zoho CRM today, with more systems on the way.',
      run: async (p, h) => {
        await h.go('start'); await h.wait(1600); await h.snap();
        await h.scrollBy(380); await h.wait(1400); await h.scrollTop();
      } },

    { id: 'connect', title: 'Connect in one click', label: 'Connect Zoho',
      say: "Click Connect my Zoho, sign in as normal and click Accept. It's read-only, so it never changes your records.",
      run: async (p, h) => {
        await h.go('__demo/new'); await h.wait(1500); await h.snap();
        await h.scrollTo('a.btn.primary, .btn.primary', 'center'); await h.wait(900);
      } },

    { id: 'dashboard', title: 'One headline, eight tiles', label: 'Your dashboard',
      say: "Behind it is Stuart Parkins' own eight-area method for looking after business systems. You see it as one headline, a red, amber or green gauge, and eight simple tiles.",
      run: async (p, h) => {
        await h.go('__demo/signin'); await h.wait(1400); await h.snap();
        await h.wait(1600); await h.scrollBy(480); await h.wait(1500); await h.scrollBy(420); await h.wait(900);
        await h.scrollTop();
      } },

    { id: 'backup', title: 'Your backup', label: 'Your backup',
      say: "Your backup shows when Zoho last made a backup, whether it's been downloaded, and when the download link runs out.",
      run: async (p, h) => {
        await h.tap('a[href="/tile/backup"]'); await h.wait(1300); await h.snap();
        await h.scrollTo('text=What we found', 'start', 20); await h.wait(1500);
      } },

    { id: 'changes', title: 'Weekly checks', label: 'What changed',
      say: 'Every week it checks again, and tells you when something has changed since last time.',
      run: async (p, h) => {
        await h.go('tile/automations'); await h.wait(1500); await h.snap();
        await h.scrollBy(300); await h.wait(900);
      } },

    { id: 'audit', title: 'The Self Audit', label: 'Self Audit',
      say: "Some things the checks can't see, so the Self Audit asks a few quick questions and grades each area.",
      run: async (p, h) => {
        await h.go('audit'); await h.wait(1400); await h.snap();
        await h.scrollBy(420); await h.wait(1300); await h.scrollBy(380); await h.wait(600);
      } },

    { id: 'upgrade', title: 'Monitor, then Protect', label: 'Upgrade to Protect',
      say: 'Monitor shows you the risk. Protect gives you an independent backup and the steps to fix it.',
      run: async (p, h) => {
        await h.go(''); await h.wait(500);
        await h.scrollTo('.procard', 'center'); await h.wait(1200); await h.snap();
      } },

    { id: 'improving', card: 'text', title: 'Always improving', short: false, kicker: 'Good to know',
      heading: 'Always improving',
      lines: ['Some screens may look a little different'],
      say: 'CRM SafeKeep is improving all the time, so some screens may look a little different.' },

    { id: 'outro', card: 'outro', title: 'Free at crmsafekeep.com',
      say: 'Free at crmsafekeep.com. Created by Stuart Parkins.' }
  ]
});
