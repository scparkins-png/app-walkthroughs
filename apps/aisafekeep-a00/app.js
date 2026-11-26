// © 2026 SP Data Consultancy Ltd. Help clip A00 "AI SafeKeep in 3 minutes" (Running It All help-content lane).
// Home → the free AI check → results → Starter Pack → what Protect adds. Assess plan, a brand-new owner.
// Script agreed with Stuart, 26 Nov 2026. Shared settings and the demo server: apps/aisafekeep-shared.
const settings = require('../aisafekeep-shared/common.js');

module.exports = settings('assess', 8816, {
  name: 'A00 AI SafeKeep in 3 minutes',
  tagline: 'AI SafeKeep in 3 minutes',

  scenes: [
    { id: 'intro', card: 'intro', title: 'AI SafeKeep in 3 minutes',
      say: "AI SafeKeep helps small businesses make AI work safely. In the next few minutes, we'll show you where you land, the free AI check, your results, the Starter Pack, and what Protect adds." },

    { id: 'home', title: 'Home', label: 'Home',
      say: "This is Home, where you land each time you sign in. The card at the top shows how your business stands with AI, with one next step. It looks at four key areas: what AI you're using, what's safe to put in, whether your team is AI-aware, and where AI could save time. Your first step is the AI check.",
      run: async (p, h) => {
        await h.go('__demo/new'); await h.wait(2600); await h.snap();
        await h.scrollTo('text=What to do', 'start', 16); await h.wait(3200);
        await h.scrollTop(); await h.wait(1200);
      } },

    { id: 'check', title: 'The free AI check', label: 'AI check',
      say: "The check is twelve plain questions, about ten minutes. It starts with where you are with AI today, which becomes your goal. Then it's one question per screen, and earlier answers skip or reword later ones. Not sure is a fine answer. We keep your answers, never your prompts or conversations.",
      run: async (p, h) => {
        await h.tap('text=Start the AI check'); await p.waitForLoadState(); await h.wait(2200); await h.snap();
        await h.tap('label:has-text("We use AI tools, but not in our business systems")'); await h.wait(800);
        await h.tap('button:has-text("Start")'); await p.waitForLoadState(); await h.wait(3600);
        await h.tap('label:has-text("Partly")'); await p.waitForLoadState(); await h.wait(3600);
        await h.tap('label:has-text("Partly")'); await p.waitForLoadState(); await h.wait(1800);
      } },

    { id: 'results', title: 'Your results', label: 'Your results',
      say: "Your results show each area as All good, Take a look, or Act now. Here, what's safe to put in needs acting on now. Your top three next steps show what to fix first, and the AI Pathway shows how far you are with AI. Not every business needs to go further than stage one.",
      run: async (p, h) => {
        await h.go('__demo/finish'); await h.wait(3400); await h.snap();
        await h.scrollTo('text=Your top 3 next steps', 'start', 16); await h.wait(3600);
        await h.scrollTo('text=Your AI Pathway', 'start', 16); await h.wait(2400);
      } },

    { id: 'pack', title: 'Your Starter Pack', label: 'Starter Pack',
      say: "The Starter Pack is five short activities: your tools list, data traffic lights, top time-savers, three golden rules and a prompt guide. Each takes a few minutes, and together they print as a pack for your team.",
      run: async (p, h) => {
        await h.go('pack'); await h.wait(1800); await h.snap();
        await h.scrollTo('text=1. Your AI tools list', 'start', 16); await h.wait(2400);
        await h.tap('text=2. Your data traffic lights'); await p.waitForLoadState(); await h.wait(1600);
        await h.scrollTo('text=What kind of business are you?', 'start', 16); await h.wait(700);
        await h.tap('label:has-text("Legal, accounting or finance")'); await h.wait(500);
        await h.tap('button:has-text("Show my examples")'); await p.waitForLoadState(); await h.wait(900);
        await h.scrollTo('text=To sort', 'start', 16); await h.wait(1500);
      } },

    { id: 'protect', title: 'What Protect adds', label: 'What Protect adds',
      say: "Protect adds your AI policy, drafted from your answers. It's a draft you edit and approve, not legal advice. It also brings approved templates, a staff guide with practice, read-and-agree links for each person, AI MOT settings checks, and an evidence map showing the guidance your set-up lines up with.",
      run: async (p, h) => {
        await h.go('policy'); await h.wait(2400); await h.snap();
        await h.scrollTo('text=Part of Protect', 'start', 16); await h.wait(3000);
        await h.scrollTo('text=Your proof, also in Protect', 'center'); await h.wait(2000);
      } },

    { id: 'plans', card: 'text', title: 'Three plans', kicker: 'Plans',
      heading: 'Assess, Protect and Enable',
      lines: ['Assess: see where you stand', 'Protect: make AI safe and controlled', "Enable: your AI Officer's ongoing support"],
      say: 'Assess is free: the check, your results and the Starter Pack. Protect makes AI safe and controlled, and keeps it live. Enable is ongoing support from your AI Officer. And on every plan, you can Talk to us.' },

    { id: 'outro', card: 'outro', title: 'aisafekeep.com',
      say: 'Start your free AI check at aisafekeep.com.' }
  ]
});
