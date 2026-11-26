// © 2026 SP Data Consultancy Ltd. Help clip A03 "The free AI check" (Running It All help-content lane).
// No intro card: starts on the task and ends on the results, then the outro. Assess plan, a brand-new owner.
// Script agreed with Stuart, 26 Nov 2026. Shared settings and the demo server: apps/aisafekeep-shared.
const settings = require('../aisafekeep-shared/common.js');

module.exports = settings('assess', 8817, {
  name: 'A03 The free AI check',
  tagline: 'The free AI check',

  scenes: [
    { id: 'start', title: 'Where are you with AI?', label: 'Starting question',
      say: 'The free AI check starts with one question: where is your business with AI today? Pick the closest answer. It becomes your goal, and it tailors what follows.',
      run: async (p, h) => {
        await h.go('__demo/new'); await h.wait(600);
        await h.tap('text=Start the AI check'); await p.waitForLoadState(); await h.wait(2400); await h.snap();
        await h.tap('label:has-text("We use AI tools, but not in our business systems")'); await h.wait(1200);
        await h.tap('button:has-text("Start")'); await p.waitForLoadState(); await h.wait(800);
      } },

    { id: 'questions', title: 'One question at a time', label: 'One at a time',
      say: 'Then it\'s one plain question per screen. You don\'t need to know the answers in advance. Not sure is fine, and earlier answers reword later ones, so the next questions ask about the tools you do know.',
      run: async (p, h) => {
        await h.wait(2600);
        await h.tap('label:has-text("Not sure")'); await p.waitForLoadState(); await h.wait(3400); await h.snap();
        await h.tap('label:has-text("Partly")'); await p.waitForLoadState(); await h.wait(2600);
        await h.tap('label:has-text("No")'); await p.waitForLoadState(); await h.wait(1200);
      } },

    { id: 'saved', title: 'Saved as you go', label: 'Saved as you go',
      say: 'Your answers are saved as you go. Stop any time, and Home picks up where you left off. We keep your answers, never your prompts or conversations.',
      run: async (p, h) => {
        await h.tap('text=Finish later'); await p.waitForLoadState(); await h.wait(2600); await h.snap();
        await h.tap('text=Carry on with the check'); await p.waitForLoadState(); await h.wait(2000);
      } },

    { id: 'results', title: 'Your results', label: 'Your results',
      say: 'Answer the last question, and your results appear: four key areas in red, amber or green, your top three next steps, and your stage on the AI Pathway.',
      run: async (p, h) => {
        await h.go('__demo/finish'); await h.wait(2600); await h.snap();
        await h.scrollTo('text=Your top 3 next steps', 'start', 16); await h.wait(2600);
        await h.scrollTo('text=Your AI Pathway', 'start', 16); await h.wait(1800);
      } },

    { id: 'outro', card: 'outro', title: 'aisafekeep.com',
      say: 'Take the free AI check at aisafekeep.com.' }
  ]
});
