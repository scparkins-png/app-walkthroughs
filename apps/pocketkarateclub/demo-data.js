// © 2026 Stuart Parkins. Made-up members for the Pocket Karate Club walkthrough.
// Every name here is invented. The recording uses a local copy of the club with its own empty
// database, so nothing real is shown and the live club is never touched.
//
// Dates are worked out from the day it's recorded, so "this week" and "last month's roundup"
// always have something in them. Points stay within what the app's scoring rules allow.

const DAY = 86400000;

// Nicknames and teams (all approved, all fictional).
const NAMES = ['MorningKiai', 'TeaAndTsuki', 'SuffolkSteps', 'QuietKicker', 'KitchenKata', 'GardenGedan',
  'LunchtimeLunge', 'SteadyStance', 'BowAndGo', 'RainyDayRei', 'Team Dumpling', 'The Garage Gang'];

// This week's shares: [nickname, team, level, training days, points, week streak]
const THIS_WEEK = [
  ['MorningKiai', 'Team Dumpling', 'beginner', 4, 78, 6],
  ['TeaAndTsuki', 'Team Dumpling', 'beginner', 3, 62, 3],
  ['SuffolkSteps', null, 'advanced', 3, 71, 9],
  ['KitchenKata', 'The Garage Gang', 'advanced', 3, 66, 5],
  ['GardenGedan', 'The Garage Gang', 'beginner', 2, 34, 0],
  ['QuietKicker', null, 'beginner', 2, 31, 0],
  ['BowAndGo', null, 'beginner', 1, 14, 0],
  [null, null, 'beginner', 3, 58, 1],           // shared without a nickname: counted, not named
];

// Last month's weeks: [nickname, team, level, [training days for each week of the month], streak before the month]
const LAST_MONTH = [
  ['MorningKiai', 'Team Dumpling', 'beginner', [3, 3, 4, 3, 3], 1],
  ['TeaAndTsuki', 'Team Dumpling', 'beginner', [2, 3, 2, 3, 2], 0],
  ['SuffolkSteps', null, 'advanced', [3, 4, 3, 3, 3], 4],
  ['KitchenKata', 'The Garage Gang', 'advanced', [3, 3, 3, 3, 2], 0],
  ['GardenGedan', 'The Garage Gang', 'beginner', [1, 2, 3, 2, 2], 0],
  ['LunchtimeLunge', null, 'beginner', [2, 2, 3, 3, 3], 0],
  ['SteadyStance', null, 'advanced', [4, 3, 4, 4, 3], 2],
  ['RainyDayRei', null, 'beginner', [1, 2, 2, 1, 2], 0],
  [null, null, 'beginner', [2, 3, 2, 2, 1], 0],
];

// Badges: [nickname, team, code, 'week' (this week) or 'month' (last month)]
const BADGES = [
  ['MorningKiai', 'Team Dumpling', 'STEADY', 'month'], ['SteadyStance', null, 'STEADY', 'month'],
  ['SuffolkSteps', null, 'ROOTS', 'month'], ['TeaAndTsuki', 'Team Dumpling', 'STAGE1', 'month'],
  ['LunchtimeLunge', null, 'FIRST', 'month'], ['KitchenKata', 'The Garage Gang', 'PN10', 'month'],
  ['GardenGedan', 'The Garage Gang', 'STAGE1', 'month'], ['SteadyStance', null, 'SET_STANCES', 'month'],
  ['QuietKicker', null, 'FIRST', 'week'], ['MorningKiai', 'Team Dumpling', 'STAGE2', 'week'],
  ['KitchenKata', 'The Garage Gang', 'STEADY', 'week'],
  [null, null, 'FIRST', 'month'], [null, null, 'STAGE1', 'month'],
];

// Points for a week: about 20 a day plus the app's weekly bonus (5/15/30/35/40 for 1/2/3/4/5+ days).
const BONUS = [0, 5, 15, 30, 35, 40];
const ptsFor = (days, i) => days * (18 + (i % 4)) + BONUS[Math.min(days, 5)];

const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

// Returns the SQL that loads the demo members into a fresh local club database.
module.exports = function seedSql(now = new Date()) {
  const iso = (d) => new Date(d).toISOString();
  const ymd = (d) => iso(d).slice(0, 10);
  const monday = (t) => { const d = new Date(t); const dow = (d.getUTCDay() + 6) % 7; return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow); };
  const thisMonday = monday(now.getTime());
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const prevMonth = ymd(prev).slice(0, 7);
  // Mondays that start in last month (the roundup counts every training week that started in it).
  const mondays = [];
  for (let t = monday(prev.getTime()); ymd(t).slice(0, 7) <= prevMonth; t += 7 * DAY) if (ymd(t).slice(0, 7) === prevMonth) mondays.push(t);

  const lines = [];
  let id = 0;
  const sub = (code, nick, team, level, at, extra = {}) => {
    id++;
    const d = ymd(at);
    lines.push(`INSERT INTO submissions (id, received_at, app, code, challenge, level, ach_date, month, nick, team, device_hash, dedupe_key, pts, days, streak, week)
      VALUES (${id}, ${q(iso(at))}, 'PK', ${q(code)}, 'karate', ${q(level)}, ${q(d)}, ${q(d.slice(0, 7))}, ${q(nick)}, ${q(team)},
      ${q('demo-device-' + (extra.device || id))}, 'demo-${id}', ${q(extra.pts)}, ${q(extra.days)}, ${q(extra.streak)}, ${q(extra.week)});`);
    return id;
  };
  const device = (nick, i) => (nick ? 'n-' + nick.toLowerCase() : 'anon-' + i);

  for (const n of NAMES) {
    lines.push(`INSERT OR REPLACE INTO names (app, norm, display, status, first_seen, last_seen)
      VALUES ('PK', ${q(n.toLowerCase())}, ${q(n)}, 'approved', ${q(iso(now))}, ${q(iso(now))});`);
  }

  // This week: shared during the week so far (never before Monday, never after now).
  THIS_WEEK.forEach(([nick, team, lv, days, pts, streak], i) => {
    const at = Math.max(thisMonday + 3600000, now.getTime() - (i + 1) * 47 * 60000);
    sub('WEEK', nick, team, lv, at, { device: device(nick, i), pts, days, streak, week: ymd(thisMonday) });
  });

  // Last month: one share per week, on that week's Sunday evening.
  LAST_MONTH.forEach(([nick, team, lv, weeks, streak0], i) => {
    let streak = streak0;
    mondays.forEach((m, w) => {
      const days = weeks[w % weeks.length];
      streak = days >= 3 ? streak + 1 : 0;
      sub('WEEK', nick, team, lv, m + 6 * DAY + 19 * 3600000, { device: device(nick, i), pts: ptsFor(days, i + w), days, streak, week: ymd(m) });
    });
  });

  BADGES.forEach(([nick, team, code, when], i) => {
    const at = when === 'week'
      ? Math.max(thisMonday + 2 * 3600000, now.getTime() - (i + 2) * 61 * 60000)
      : Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), 26 - i, 19);
    const sid = sub(code, nick, team, 'beginner', at, { device: device(nick, 100 + i) });
    lines.push(`INSERT OR IGNORE INTO badge_shares (sub_id, app, code, ach_date, month, nick, team)
      VALUES (${sid}, 'PK', ${q(code)}, ${q(ymd(at))}, ${q(ymd(at).slice(0, 7))}, ${q(nick)}, ${q(team)});`);
  });
  return lines.join('\n') + '\n';
};
