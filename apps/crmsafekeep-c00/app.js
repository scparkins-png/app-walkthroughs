// © 2026 SP Data Consultancy Ltd. Help clip C00 "CRM SafeKeep in 3 minutes" (Running It All help-content lane).
// Rules: demo data caption on screen, product voice "we", no prices, Stuart not named,
// no "free backup" / "compliant" / "secure" / "certified". Script agreed with Stuart, 25 Nov 2026.
// Shared settings and the demo server are in apps/crmsafekeep-shared. Monitor plan, a brand-new demo
// business signs up and connects (the demo's /__demo/as and /__demo/connect routes).
const settings = require('../crmsafekeep-shared/common.js');
const DEMO = 'Example screen with demo data for an invented business';
const EMAIL = 'jo@harbourside-joinery.example';

module.exports = settings('monitor', 8814, {
  name: 'C00 CRM SafeKeep in 3 minutes',
  nameHtml: 'CRM <span class="accent">SafeKeep</span>',
  tagline: 'CRM SafeKeep in 3 minutes',
  demoLabel: DEMO,
  outro: {
    points: ['Read-only', 'Eight areas', 'Zoho CRM'],
    supportIcon: '✉️',
    support: 'Questions? support@crmsafekeep.com',
    credit: 'A service of SP Data Consultancy Ltd'
  },

  scenes: [
    { id: 'intro', card: 'intro', title: 'CRM SafeKeep in 3 minutes',
      say: "CRM SafeKeep is a health check for your Zoho CRM. In the next few minutes, we'll show you how to sign up, connect your Zoho, and read what we find." },

    { id: 'start', title: 'Start at crmsafekeep.com', label: 'Start here',
      say: "It starts at crmsafekeep.com. It's made for owner-managed businesses on Zoho CRM, and it answers the questions that matter: is it really backed up, who has access, and has anything been switched off? We check your CRM across eight plain-English areas. And we only ever look. We never change anything in your CRM.",
      run: async (p, h) => {
        await h.go('start'); await h.wait(2600); await h.snap();
        await h.scrollTo('#h-problem', 'start', 16); await h.wait(2600);
        await h.scrollTo('#h-checks', 'start', 16); await h.wait(2800);
        await h.scrollBy(420); await h.wait(1800);
      } },

    { id: 'signup', title: 'Sign up: no password, no card', label: 'Sign up',
      say: "Type your work email and tick the box. There's no password and no card. We email you a sign-in link. It works once, and your device is remembered for ninety days.",
      run: async (p, h) => {
        await h.go('start#start'); await h.wait(700);
        await p.locator('#start input[name=email]').click();
        await p.type('#start input[name=email]', EMAIL, { delay: 45 });
        const biz = p.locator('#start input[name=business]');
        if (await biz.count()) await p.type('#start input[name=business]', 'Harbourside Joinery Ltd', { delay: 35 });
        const agree = p.locator('#start input[name=agree]');
        if (await agree.count()) await h.tapEl(agree);
        await h.wait(400);
        await h.tap('#start button[type=submit]'); await p.waitForLoadState(); await h.wait(1600); await h.snap();
      } },

    { id: 'connect', title: 'Connect your Zoho', label: 'Connect Zoho',
      say: "Next, connect your Zoho. The screen shows the three steps: sign in to Zoho, click Accept, and see your results. You'll need someone with Zoho admin rights. Click Connect my Zoho.",
      run: async (p, h) => {
        await h.go(`__demo/as?email=${encodeURIComponent(EMAIL)}`); await h.wait(1200); await h.snap();
        await h.scrollTo('text=Connect my Zoho', 'center'); await h.wait(900);
      } },

    // Stuart is recording Zoho's real sign-in and Accept screens; until then this card stands in.
    { id: 'zoho', card: 'text', title: "On Zoho's own page", kicker: 'On Zoho',
      heading: "Sign in on Zoho's own page, then click Accept",
      lines: ['We never see your password', 'Read-only access'],
      say: "Zoho's own sign-in page opens, so we never see your password. Sign in, and click Accept. That gives us read-only access." },

    { id: 'first', title: 'Your first check', label: 'First check',
      say: "You're back with us, and we run your first check straight away.",
      run: async (p, h) => { await h.go('__demo/connect'); await h.wait(1600); await h.snap(); } },

    { id: 'dashboard', title: 'Your dashboard', label: 'Your dashboard',
      say: "Your dashboard gives you one headline and a gauge: All good, Take a look, or Act now. The backup strip answers the big question: is it backed up? Below are your eight areas, with the ones that need you first, and the rest folded away under All good. Further down, the Self Audit asks a few questions only you can answer, like who looks after your backups, and grades each area.",
      run: async (p, h) => {
        await h.go(''); await h.wait(2600); await h.snap();
        await h.scrollTo('text=Is it backed up?', 'start', 16); await h.wait(2600);
        await h.scrollTo('text=All good (', 'center'); await h.wait(900);
        const more = p.locator('text=Show').first(); if (await more.count()) { await h.tapEl(more); await h.wait(2200); }
        await h.scrollTo('text=Questions only you can answer', 'center'); await h.wait(2400);
      } },

    { id: 'area', title: 'Open an area: Your backup', label: 'Your backup',
      say: "Open any area for the detail. Your backup shows when Zoho last made a backup and when the download link runs out. Zoho can't tell us whether a backup was downloaded, so you note when and where you saved it, and the area turns amber if the link is about to run out with no copy recorded. Open in Zoho takes you straight to the right screen.",
      run: async (p, h) => {
        await h.go('tile/backup'); await h.wait(2400); await h.snap();
        await h.scrollTo('text=Record your download', 'start', 16); await h.wait(3200);
        await h.scrollTo('text=What we found', 'start', 16); await h.wait(2600);
        await h.scrollTo('text=Open Zoho backups', 'center'); await h.wait(1600);
      } },

    { id: 'plans', card: 'text', title: 'Three plans', kicker: 'Plans',
      heading: 'Monitor, Protect and Managed',
      lines: ['Monitor: see the risk', 'Protect: backed up, with the tools to fix it', 'Managed: your CRM specialist looks after it'],
      say: 'There are three plans. Monitor, the free plan: weekly checks, the eight areas and backup reminders. Protect, backed up: an independent backup of your CRM records, daily checks, what changed, and step-by-step fixes. And Managed: your CRM specialist looks after it for you. You can start on Monitor and move up whenever you like.' },

    { id: 'outro', card: 'outro', title: 'crmsafekeep.com',
      say: 'Start with a free check at crmsafekeep.com.' }
  ]
});
