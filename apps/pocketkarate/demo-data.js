// © 2026 Stuart Parkins. Demo data for walkthrough recordings only. It is made up and is labelled
// "Demo data" on screen in every video.
//
// The story: "Demo Student", a beginner about a month in. Started on Monday 19 October 2026 and has
// trained 3 days a week since, with 2 days so far this week (the recording runs as Thursday
// 19 November 2026, see "clock" in app.js). Points are worked out with the app's own scoring rules,
// read from the app's content.js, so the totals match what the app would have given.
const fs = require('fs'), path = require('path'), vm = require('vm');

function content() {
  const CODE = process.env.APP_CODE || path.join(__dirname, '..', '..', 'apps-code', 'pocket-karate');
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(CODE, 'app', 'data', 'content.js'), 'utf8'), sandbox);
  return sandbox.window.PK_CONTENT;
}

module.exports = function demoState(opts = {}) {
  const base = { done: {}, history: [], sessions: [], myVideos: {}, badges: {}, kataRuns: 0, lastQuick: [],
    settings: { level: 'beginner', beeps: true, voice: true, wake: true, certName: 'Demo Student' } };
  if (opts.empty) return base;

  const PROG = content().progress;
  const rule = (r, n) => r && n >= r.min ? r.pts + Math.min(n - r.min, r.maxExtra) * r.extra : 0;
  // Same as scoreSession() in the app (no day cap needed: one session a day here).
  function score(c, secs) {
    const gate = c.warmup >= 1 && c.stretch >= 1;
    let tech = 0, nTech = c.combo + c.kata;
    ['stances', 'blocks', 'punches', 'kicks', 'movement'].forEach(g => { tech += rule(PROG.group, c[g]); nTech += c[g]; });
    tech += c.combo * PROG.combo + c.kata * PROG.kata;
    const mins = Math.min(Math.round(secs / 60 / 15) * 15, PROG.durationCap.beginner);
    let dur = 0; PROG.duration.forEach(r => { if (mins >= r[0]) dur = r[1]; });
    const full = gate && nTech > 0 ? PROG.fullPlan : 0;
    const p = { dur, mins, durCapped: false, warm: rule(PROG.warmup, c.warmup), stretch: rule(PROG.stretch, c.stretch),
      fit: rule(PROG.fitness, c.fitness), tech: gate ? tech : 0, techLost: gate ? 0 : tech, full, dayCap: false };
    p.total = p.dur + p.warm + p.stretch + p.fit + p.tech + p.full;
    return p;
  }
  const C = o => Object.assign({ warmup: 0, stretch: 0, fitness: 0, stances: 0, blocks: 0, punches: 0, kicks: 0, movement: 0, combo: 0, kata: 0 }, o);

  // [date, hour, name, kind, counts, active minutes]
  const quick = C({ warmup: 3, stretch: 3, fitness: 1, stances: 1, punches: 1, movement: 1 });
  const S = [
    ['2026-10-19', 18, 'The Power Fist Punch', 'lesson', C({ warmup: 1, stretch: 1, stances: 1, punches: 3 }), 22],
    ['2026-10-21', 18, 'Quick session', 'quick', quick, 28],
    ['2026-10-24', 10, 'Stage 1: Foundations', 'stage', C({ warmup: 4, stretch: 6, stances: 3, punches: 1, movement: 2 }), 35],
    ['2026-10-26', 18, 'Sweeping High and Low Blocks', 'lesson', C({ warmup: 1, stretch: 1, stances: 1, blocks: 2 }), 22],
    ['2026-10-28', 18, 'Quick session', 'quick', quick, 30],
    ['2026-10-31', 10, 'Stage 1: Foundations', 'stage', C({ warmup: 5, stretch: 8, stances: 3, punches: 1, movement: 3 }), 40],
    ['2026-11-02', 18, 'My warm-up and basics', 'mine', C({ warmup: 2, stretch: 3, stances: 2, punches: 2 }), 30],
    ['2026-11-04', 18, 'The Power Fist Punch', 'lesson', C({ warmup: 1, stretch: 1, stances: 1, punches: 3 }), 22],
    ['2026-11-07', 10, 'Stage 2: On the spot', 'stage', C({ warmup: 2, stretch: 3, combo: 4 }), 32],
    ['2026-11-09', 18, 'Quick session', 'quick', quick, 30],
    ['2026-11-11', 18, 'My warm-up and basics', 'mine', C({ warmup: 2, stretch: 3, stances: 2, punches: 2, kata: 1 }), 38],
    ['2026-11-14', 10, 'Stage 2: On the spot', 'stage', C({ warmup: 2, stretch: 3, combo: 5 }), 35],
    ['2026-11-16', 18, 'Sweeping High and Low Blocks', 'lesson', C({ warmup: 1, stretch: 1, stances: 1, blocks: 2 }), 24],
    ['2026-11-17', 18, 'Quick session', 'quick', quick, 30]
  ];
  // Dates are local (Europe/London); 19–24 Oct is still British Summer Time.
  const at = (d, hr) => { const bst = d < '2026-10-25'; return Date.parse(`${d}T${String(hr - (bst ? 1 : 0)).padStart(2, '0')}:00:00Z`); };
  base.history = S.map(([d, hr, name, kind, c, mins]) => ({
    name, t: at(d, hr) + mins * 60000, parts: 2 + Object.values(c).reduce((a, b) => a + b, 0) + 1,
    secs: mins * 60 + 40, active: mins * 60, kind, counts: c, pts: score(c, mins * 60)
  }));

  // Lessons ticked "I've practised this": all of pathway stage 1, plus a start on stage 2 and some blocks.
  const tick = (ids, d) => ids.forEach(id => { base.done[id] = at(d, 18); });
  tick(['W1', 'W2', 'W3', 'W4', 'W6', 'W7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12'], '2026-10-31');
  tick(['R0', 'E0', 'B0', 'B1', 'B2', 'B6', 'B7'], '2026-10-19');
  tick(['BL1', 'BL2', 'BL3'], '2026-10-31');
  tick(['B16', 'B19'], '2026-10-26');
  tick(['HC1', 'HC2', 'HC3', 'HC24', 'HC15'], '2026-11-14');
  tick(['K1'], '2026-11-11');
  base.kataRuns = 2;

  // Badges already earned, dated when the history above earned them (otherwise the app stamps them with
  // the recording date). Any others the history earns are added quietly by the app on load.
  base.badges = { first: at('2026-10-19', 19), 'set-movement': at('2026-10-31', 11), stage1: at('2026-10-31', 11),
    s10: at('2026-11-09', 19), respect: at('2026-11-09', 19), steady: at('2026-11-14', 11) };

  base.sessions = [{ name: 'My warm-up and basics', items: ['W1', 'W2', 'S1', 'S3', 'S8', 'B0', 'B1', 'B2', 'B6', 'B7'] }];
  base.lastQuick = ['W3', 'S5', 'F2', 'B1', 'B6', 'BL1'];
  return base;
};
