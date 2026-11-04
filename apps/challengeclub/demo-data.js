// © 2026 Stuart Parkins. Made-up members for the Challenge Club walkthrough.
// Every name here is invented. The recording uses a local copy of the club with its own empty
// database, so nothing real is shown and the live club is never touched.
//
// Dates are worked out from today, so "this week's starters" and "last month's roundup" always
// have something in them whenever the video is recorded.

const DAY = 86400000;

// Nicknames and teams (all approved, all fictional).
const NAMES = ['SunnyStepper', 'PlankPal', 'RiverRunner', 'CoffeeCrunch', 'MorningMover', 'TeaBreakTom',
  'StretchyJo', 'Hilltop Hannah', 'QuietQuads', 'Team Porridge', 'The Plank Squad'];

// This week's starters: [nickname, team, challenge, level, days ago]
const STARTERS = [
  ['SunnyStepper', 'Team Porridge', 'abs-mixed', 'moderate', 1],
  ['PlankPal', 'Team Porridge', 'abs-mixed', 'moderate', 1],
  ['RiverRunner', null, 'abs', 'easy', 2],
  ['MorningMover', 'The Plank Squad', 'abs-mix', 'harder', 3],
  ['StretchyJo', 'The Plank Squad', 'abs-mix', 'moderate', 3],
  ['QuietQuads', null, 'abs', 'moderate', 4],
  [null, null, 'abs', 'easy', 2], [null, null, 'abs-mix', 'moderate', 5],   // shared without a nickname
];

// Last month's finishers: [nickname, team, challenge, level, days done on the day]
const FINISHERS = [
  ['CoffeeCrunch', null, 'abs', 'moderate', 30],
  ['Hilltop Hannah', 'The Plank Squad', 'abs-mix', 'harder', 30],
  ['MorningMover', 'The Plank Squad', 'abs-mix', 'harder', 27],
  ['SunnyStepper', 'Team Porridge', 'abs-mixed', 'easy', 25],
  ['TeaBreakTom', null, 'abs', 'easy', 22],
  [null, null, 'abs', 'easy', 24], [null, null, 'abs-mix', 'moderate', 30],
];

// Badges shared last month: [nickname, team, code]
const BADGES = [
  ['CoffeeCrunch', null, 'B30'], ['TeaBreakTom', null, 'B30'], ['SunnyStepper', 'Team Porridge', 'B30'],
  ['MorningMover', 'The Plank Squad', 'B90'], ['Hilltop Hannah', 'The Plank Squad', 'B180'],
  [null, null, 'B30'], [null, null, 'B30'],
];

const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);

// Returns the SQL that loads the demo members into a fresh local club database.
module.exports = function seedSql(now = new Date()) {
  const iso = (d) => new Date(d).toISOString();
  const ymd = (d) => iso(d).slice(0, 10);
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const prevMonth = ymd(prev).slice(0, 7);
  const lines = [];
  let id = 0;
  const sub = (code, nick, team, challenge, level, at, achDate, onDay) => {
    id++;
    lines.push(`INSERT INTO submissions (id, received_at, app, code, challenge, level, ach_date, month, on_day, nick, team, device_hash, dedupe_key)
      VALUES (${id}, ${q(iso(at))}, '30DC', ${q(code)}, ${q(challenge)}, ${q(level)}, ${q(achDate)}, ${q(achDate.slice(0, 7))}, ${q(onDay)},
      ${q(nick)}, ${q(team)}, 'demo-device-${id}', 'demo-${id}');`);
    return id;
  };
  for (const n of NAMES) {
    lines.push(`INSERT OR REPLACE INTO names (app, norm, display, status, first_seen, last_seen)
      VALUES ('30DC', ${q(n.toLowerCase())}, ${q(n)}, 'approved', ${q(iso(now))}, ${q(iso(now))});`);
  }
  STARTERS.forEach(([nick, team, ch, lv, ago], i) => {
    const at = now.getTime() - ago * DAY - (i + 1) * 3600000;
    sub('START', nick, team, ch, lv, at, ymd(at));
  });
  FINISHERS.forEach(([nick, team, ch, lv, onDay], i) => {
    const at = Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), 28 - i, 18);
    sub('DONE', nick, team, ch, lv, at, ymd(at), onDay);
  });
  BADGES.forEach(([nick, team, code], i) => {
    const at = Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), 27 - i, 19);
    const sid = sub(code, nick, team, 'abs', 'moderate', at, ymd(at));
    lines.push(`INSERT OR IGNORE INTO badge_shares (sub_id, app, code, ach_date, month, nick, team)
      VALUES (${sid}, '30DC', ${q(code)}, ${q(ymd(at))}, ${q(prevMonth)}, ${q(nick)}, ${q(team)});`);
  });
  return lines.join('\n') + '\n';
};
