// © 2026 Stuart Parkins. Demo data for walkthrough recordings only. It is made up and is labelled
// "Demo data" on screen in every video. Builds three weeks ending yesterday, plus a little of today.
// The story: heavier drinking and little water at the start, then steady improvement.
module.exports = function demoState(opts = {}) {
  const pad = n => String(n).padStart(2, '0');
  const dk = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const days = {}, N = 21;
  for (let i = N; i >= 1; i--) {
    const d = add(t, -i), wd = d.getDay(), weekend = wd === 5 || wd === 6, e = [];
    const early = i > 10;
    const water = early ? 3 + (i % 3) : 8 + (i % 2);           // goal of 8 met every day lately
    for (let w = 0; w < water; w++) e.push(['w', 450 + w * 75]);
    e.push(['t', 430]);
    let s = 0, sk = 0, su = 0;
    if (early) e.push(['c', 600], ['c', 900]); else { e.push(['x', 600]); s++; }
    if (early && (weekend || i % 4 === 0)) { e.push(['ph', 1170], ['wm', 1230]); if (weekend) e.push(['ph', 1290]); }
    if (early && i % 5 === 0) e.push(['f', 780]);
    if (!early && i > 5 && weekend) { e.push(['hh', 1170], ['af', 1230, [110, 20]]); s++; sk += 110; su += 20; }
    if (!early && i % 3 === 0) { e.push(['d', 780, [140, 0]]); s++; sk += 140; }
    days[dk(d)] = {e, s, sk, su};
  }
  if (opts.today !== false) days[dk(t)] = {e: [['t', 430], ['w', 450], ['w', 525], ['w', 600], ['w', 680]], s: 0};
  return {v: 2, welcomed: opts.welcomed !== false, country: 'GB', start: opts.empty ? dk(t) : dk(add(t, -N)), goal: 8,
    theme: opts.theme || 'light', days: opts.empty ? {} : days, ms: {}, lb: Date.now(), lastAsk: Date.now()};
};
