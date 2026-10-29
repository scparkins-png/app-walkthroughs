// © 2026 Stuart Parkins. Demo data for walkthrough recordings only. It is made up and is labelled
// "Demo data" on screen in every video. All dates are relative to the recording day, so it never goes stale.
// The story: a household of 2 adults, 2 children and a dog, part-way through building a 3-day pack.
// Essentials about 80% done, core pack about half, extras only just started. A few things need attention:
// the torch check is overdue, the first aid kit expires in 9 days, some water in 20 days, and two items
// still have no expiry date.
module.exports = function demoState() {
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const days = n => { const d = new Date(t); d.setDate(d.getDate() + n); return iso(d); };
  const months = n => { const d = new Date(t); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return iso(d); };
  let n = 0;
  const it = o => Object.assign({ id: 'demo' + (++n), size: 1, unit: '' }, o);
  const food = (name, qty, size, group, cook, date) =>
    it({ key: 'food-meals', cat: 'food', name, qty, size, unit: 'portions', group, cook, loc: 'Kitchen cupboard', mode: 'expiry', date });

  const items = [
    // Water
    it({ key: 'water-drink', cat: 'water', name: 'Bottled water, 2 L bottles', qty: 6, size: 2, unit: 'L', loc: 'Under stairs box', mode: 'expiry', date: days(20) }),
    it({ key: 'water-drink', cat: 'water', name: 'Bottled water, 1.5 L bottles', qty: 12, size: 1.5, unit: 'L', loc: 'Garage shelf', mode: 'expiry', date: months(14) }),
    it({ key: 'water-wash', cat: 'water', name: 'Water container, 5 L', qty: 2, size: 5, unit: 'L', loc: 'Garage shelf', mode: 'expiry', date: months(5) }),
    // Food
    food('Porridge oats, 500 g', 1, 12, 'breakfast', 1, months(9)),
    food('Pasta, 500 g bag', 1, 6, 'base', 1, months(18)),
    food('Microwave rice pouch, 250 g', 3, 2, 'base', 1, days(55)),
    food('Baked beans, 400 g tin', 4, 2, 'protein', 0, months(15)),
    food('Tuna, small tin', 4, 1, 'protein', 0, months(26)),
    food('Soup, 400 g tin', 4, 1, 'meal', 0, months(11)),
    food('Tinned stew or chilli', 2, 2, 'meal', 0, months(20)),
    food('Chopped tomatoes, 400 g tin', 2, 2, 'veg', 0, months(19)),
    it({ key: 'food-snacks', cat: 'food', name: 'Cereal bars, 6-pack', qty: 2, unit: 'packs', loc: 'Kitchen cupboard', mode: 'expiry', date: days(70) }),
    it({ key: 'food-stove', cat: 'food', name: 'Camping stove and gas', qty: 1, loc: 'Garage', mode: 'check', interval: 6, date: months(-2) }),
    it({ key: 'food-opener', cat: 'food', name: 'Tin opener', qty: 1, loc: 'Under stairs box', mode: 'none', date: '' }),
    // Light and power
    it({ key: 'light-torch', cat: 'light', name: 'Wind-up torch', qty: 1, loc: 'Under stairs box', mode: 'check', interval: 6, date: months(-7) }),
    it({ key: 'light-batt', cat: 'light', name: 'AA batteries', qty: 2, unit: 'packs', loc: 'Kitchen drawer', mode: 'expiry', date: months(30) }),
    it({ key: 'light-power', cat: 'light', name: 'Power bank', qty: 1, loc: 'Hall drawer', mode: 'check', interval: 3, date: days(-40) }),
    // First aid
    it({ key: 'fa-kit', cat: 'firstaid', name: 'First aid kit', qty: 1, loc: 'Bathroom', mode: 'expiry', date: days(9) }),
    it({ key: 'fa-meds', cat: 'firstaid', name: 'Prescription medicines: check supply', qty: 1, loc: 'Bathroom cabinet', mode: 'check', interval: 1, date: days(-11) }),
    it({ key: 'fa-pain', cat: 'firstaid', name: 'Paracetamol', qty: 1, unit: 'packs', loc: 'Bathroom cabinet', mode: 'expiry', date: '' }),
    // Hygiene and warmth
    it({ key: 'hy-gel', cat: 'hygiene', name: 'Hand sanitiser', qty: 1, loc: 'Under stairs box', mode: 'expiry', date: '' }),
    it({ key: 'wa-blanket', cat: 'warmth', name: 'Sleeping bag', qty: 2, loc: 'Loft', mode: 'none', date: '' }),
    // Tools and pets
    it({ key: 'to-cash', cat: 'tools', name: 'Cash in small notes', qty: 1, loc: 'Under stairs box', mode: 'check', interval: 12, date: months(-3) }),
    it({ key: 'pet-food', cat: 'pets', name: 'Dog food pouches', qty: 4, unit: 'days', loc: 'Utility room', mode: 'expiry', date: days(80) })
  ];

  return {
    household: { adults: 2, children: 2, infants: 0, pets: 1, days: 3, rates: { drink: 3, wash: 3, meals: 3 } },
    items, shopDone: {}, sample: false   // sample:false hides the app's own "Example items loaded" banner
  };
};
