// © 2026 Stuart Parkins. Demo data for walkthrough recordings only. It is made up and is labelled
// "Demo data" on screen in every video. The recording clock starts at Thursday 19 November 2026
// (see "clock" in app.js), so these dates are fixed rather than relative to the real date.
//
// The story: "Sam Example" finished September (Classic ABS) and October (ABS Mix), earning the
// 30 Day Finisher badge. November is Moderate ABS Mixed, 17/30 so far:
//   - green ticks on most days, rest on Saturdays 7 and 14, rests planned for 21 and 28
//   - 11 Nov caught up on the 12th (orange tick, and the 12th shows x2)
//   - 17 Nov missed (amber !), which the catch-up scene fixes
// Other activity: walks, martial arts, yoga and a bike ride, with a weekly target of 3 met this week.
//
// The three exercise sets were made once by the app's own mix maker and fixed here so every run matches.
const DEF = {
  sep: {"id":"abs","version":2,"name":"ABS","focus":"Abdominals","length":30,"restAllowance":8,"progression":"daily","exercises":[{"id":"crunch","fromDay":1,"start":10,"end":50},{"id":"bicycle-crunch","fromDay":1,"start":10,"end":50},{"id":"plank","fromDay":1,"start":20,"end":60},{"id":"leg-raise","fromDay":8,"start":8,"end":25},{"id":"russian-twist","fromDay":15,"start":16,"end":40},{"id":"reverse-crunch","fromDay":22,"start":10,"end":20}],"notes":"Rest 20–30 seconds between exercises.","level":"easy","baseName":"ABS"},
  oct: {"id":"abs-mix","version":1,"name":"ABS Mix","focus":"Abdominals — a fresh mix each month","length":30,"restAllowance":8,"progression":"daily","exercises":[{"id":"plank-step-up","fromDay":1,"start":10,"end":30,"slot":"moving"},{"id":"heel-touch","fromDay":1,"start":16,"end":50,"slot":"upper"},{"id":"dead-bug","fromDay":1,"start":10,"end":30,"slot":"control"},{"id":"russian-twist","fromDay":8,"start":16,"end":40,"slot":"obliques"},{"id":"side-plank","fromDay":15,"start":15,"end":40,"slot":"hold"},{"id":"knee-tuck","fromDay":22,"start":8,"end":25,"slot":"lower"}],"notes":"Rest 20–30 seconds between exercises.","level":"easy","baseName":"ABS Mix"},
  nov: {"id":"abs-mixed","version":1,"name":"Moderate ABS Mixed","focus":"Warm-up, abs and extras — a fresh mix each month","length":30,"restAllowance":8,"progression":"daily","exercises":[{"id":"star-jump","fromDay":1,"start":20,"end":50,"slot":"warmup","role":"warmup","toDay":7},{"id":"leg-swing","fromDay":8,"start":20,"end":40,"slot":"warmup","role":"warmup","toDay":14},{"id":"side-step-bounce","fromDay":15,"start":30,"end":60,"slot":"warmup","role":"warmup","toDay":21},{"id":"forward-back-bounce","fromDay":22,"start":30,"end":60,"slot":"warmup","role":"warmup","toDay":30},{"id":"sit-up","fromDay":1,"start":8,"end":30,"slot":"upper","role":"core"},{"id":"plank","fromDay":1,"start":20,"end":60,"slot":"hold","role":"core"},{"id":"bicycle-crunch","fromDay":1,"start":10,"end":50,"slot":"obliques","role":"core"},{"id":"reverse-crunch","fromDay":8,"start":10,"end":25,"slot":"lower","role":"core"},{"id":"mountain-climber","fromDay":15,"start":16,"end":50,"slot":"moving","role":"core"},{"id":"leg-raise","fromDay":22,"start":8,"end":25,"slot":"control","role":"core"},{"id":"squat-thrust","fromDay":1,"start":8,"end":25,"slot":"extra","role":"extra"},{"id":"press-up","fromDay":15,"start":5,"end":20,"slot":"extra","role":"extra"}],"notes":"Rest 20–30 seconds between exercises.","level":"moderate","baseName":"ABS Mixed"}
};

module.exports = function demoState(opts = {}) {
  const clone = o => JSON.parse(JSON.stringify(o));
  const settings = { name: 'Sam Example', restWeekdays: [], units: 'mi', weeklyTarget: 3, theme: 'light',
    leadIn: false, sound: true, vibrate: true, testToday: null, iosTipDismissed: true };
  if (opts.empty) return { schemaVersion: 1, settings, lastBackupAt: null, active: null, history: [], badgesSeen: [], activities: [] };

  const pad = n => String(n).padStart(2, '0');
  let seq = 0;
  const entry = (month, day, date, time = '07:30') =>
    ({ day, date: `${month}-${pad(date)}`, at: `${month}-${pad(date)}T${time}:00.000Z`, seq: ++seq });
  const challenge = (month, def, extra) => Object.assign({ id: `${month}-${def.id}`, month, startDate: `${month}-01`,
    definition: clone(def), completions: [], rests: [], plannedRestDates: [], skipRestDates: [], plan: {}, planDays: {},
    swaps: {}, startedAt: `${month}-01T07:00:00.000Z` }, extra);

  // A finished month: every Challenge Day done on its own date, with rest on the given dates.
  const finished = (month, def, restDays, archivedAt) => {
    seq = 0; const ch = challenge(month, def, { archivedAt });
    for (let n = 1; n <= 30; n++) (restDays.includes(n) ? ch.rests : ch.completions).push(entry(month, n, n));
    return ch;
  };
  const sep = finished('2026-09', DEF.sep, [6, 13, 20, 27], '2026-10-01T08:00:00.000Z');
  const oct = finished('2026-10', DEF.oct, [4, 11, 18, 25], '2026-11-01T08:00:00.000Z');

  // November so far.
  seq = 0; const m = '2026-11';
  const nov = challenge(m, DEF.nov, { plannedRestDates: ['2026-11-21', '2026-11-28'] });
  const done = (day, date = day, time) => nov.completions.push(entry(m, day, date, time));
  [1, 2, 3, 4, 5, 6].forEach(n => done(n));
  nov.rests.push(entry(m, 7, 7, '09:00'));
  [8, 9, 10].forEach(n => done(n));
  done(12); done(11, 12, '18:30');   // Day 11 caught up on the 12th
  done(13);
  nov.rests.push(entry(m, 14, 14, '09:00'));
  done(15); done(16); done(18);      // the 17th is missed

  const act = (date, type, mins, km) =>
    ({ id: 'demo-' + date + '-' + type, date, type, mins, ...(km ? { km } : {}), at: date + 'T18:00:00.000Z' });
  const activities = [
    act('2026-11-02', 'walk', 45, 5.1), act('2026-11-05', 'martial', 60), act('2026-11-08', 'yoga', 30),
    act('2026-11-10', 'walk', 35, 3.9), act('2026-11-12', 'martial', 60), act('2026-11-15', 'cycle', 50, 20.1),
    act('2026-11-16', 'walk', 40, 4.7), act('2026-11-17', 'yoga', 25), act('2026-11-18', 'martial', 60)
  ];

  return { schemaVersion: 1, settings, lastBackupAt: '2026-11-15T19:00:00.000Z', active: nov, history: [oct, sep],
    badgesSeen: ['b30'], activities };
};
