// © 2026 SP Data Consultancy Ltd. Help clip C02 "Connect your Zoho, read-only" (Running It All help-content lane).
// No intro card; ends on the result. Rules as C00 (demo caption, "we", no prices, Stuart not named).
// Script agreed with Stuart, 25 Nov 2026. Shared settings and demo server: apps/crmsafekeep-shared.
const settings = require('../crmsafekeep-shared/common.js');
const DEMO = 'Example screen with demo data for an invented business';

module.exports = settings('monitor', 8815, {
  name: 'C02 Connect your Zoho read-only',
  nameHtml: 'CRM <span class="accent">SafeKeep</span>',
  tagline: 'Connect your Zoho, read-only',
  demoLabel: DEMO,
  outro: { points: ['Read-only'], support: 'support@crmsafekeep.com', credit: 'crmsafekeep.com' },

  scenes: [
    { id: 'connect', title: 'Connect my Zoho', label: 'Connect my Zoho',
      say: "To connect, you'll need someone with Zoho admin rights. You only do this once. Click Connect my Zoho.",
      run: async (p, h) => {
        await h.go('__demo/new'); await h.wait(900); await h.snap();
        await h.scrollTo('text=Connect my Zoho', 'center'); await h.wait(1000);
      } },

    // Stuart is recording Zoho's real sign-in and Accept screens; until then this card stands in.
    { id: 'zoho', card: 'text', title: "On Zoho's own page", kicker: 'On Zoho',
      heading: "Sign in on Zoho's own page, then click Accept",
      lines: ['We never see your password', 'Every permission is read-only'],
      say: "Zoho's own sign-in page opens, so we never see your password. Sign in as usual, and Zoho lists what we're asking for. Every permission is read-only: we can view your settings, counts and backup status, never your customers' details. Then click Accept." },

    { id: 'first', title: 'Your first check', label: 'First check',
      say: "You're back in CRM SafeKeep, and we start your first check straight away. Your organisation's name is at the top, so you know the right Zoho is connected.",
      run: async (p, h) => { await h.go('__demo/connect'); await h.wait(1500); await h.snap(); } },

    { id: 'results', title: 'Your first results', label: 'First results',
      say: "Here are your first results: one headline, whether it's backed up, and your eight areas, with anything that needs you at the top. Here, one area needs a look: who has access. We only look, and you can disconnect at any time from Help.",
      run: async (p, h) => {
        await h.go(''); await h.wait(2600); await h.snap();
        await h.scrollTo('text=Is it backed up?', 'start', 16); await h.wait(2200);
        await h.scrollTo('text=Who has access', 'center'); await h.wait(1800);
        await h.scrollTop(); await h.wait(800);
      } }
  ]
});
