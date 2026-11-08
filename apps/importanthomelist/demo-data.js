// © 2026 Stuart Parkins. Demo data for walkthrough recordings only. It is made up and is labelled
// "Demo data" on screen in every video. All dates are relative to the recording day, so it never goes stale.
// The story: a household of two (Alex and Sam) with a dog. A few things are due soon (passport, home
// insurance, boiler service, MOT), one entry has no location yet and one has only a single copy, so the
// Gaps card has something to show. Names, providers, phone numbers and the four-digit endings are invented.
// The first-visit state (empty: true) is the app's own Welcome screen with nothing entered.
module.exports = function demoState(opts = {}) {
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const days = n => { const d = new Date(t); d.setDate(d.getDate() + n); return iso(d); };
  const months = n => { const d = new Date(t); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return iso(d); };
  const ago = n => new Date(Date.now() - n * 864e5).toISOString();
  let n = 0;
  const entry = o => Object.assign({ id: 'demo' + (++n), title: '', category: 'Other', person: 'Household', provider: '', phone: '',
    website: '', ref4: '', fullDetails: '', locations: [], expiry: '', review: '', yearly: false, notes: '', checked: '' }, o);
  const loc = (type, text, url = '') => ({ type, text, url });

  const base = {
    entries: [], bills: [], people: ['Household'],
    settings: { window: 90, alertDays: 30, theme: 'light', billSort: 'due' },
    pack: { household: '', contacts: [], wishes: '', includeLinks: true, includeContacts: true, includeWishes: false, includeBills: true },
    meta: { lastExport: null, lastChange: null, lastOpened: null }
  };
  if (opts.empty) return base;

  const entries = [
    entry({ title: 'Passport – Alex', category: 'Identity', person: 'Alex', provider: 'HM Passport Office', expiry: days(48),
      fullDetails: 'Fireproof box, study', checked: days(-120),
      locations: [loc('physical', 'Fireproof box, study'), loc('gdrive', 'Scans > Identity > Passport', 'https://example.com/scan')] }),
    entry({ title: 'Passport – Sam', category: 'Identity', person: 'Sam', provider: 'HM Passport Office', expiry: months(21),
      locations: [loc('physical', 'Fireproof box, study'), loc('gdrive', 'Scans > Identity > Passport', 'https://example.com/scan')] }),
    entry({ title: 'Home insurance', category: 'Insurance', person: 'Joint', provider: 'Everwell Home Cover', phone: '01632 960 111',
      ref4: '4821', expiry: days(21), yearly: true, notes: 'Renewal quote usually arrives about three weeks before.', checked: days(-200),
      locations: [loc('email', "Gmail: search 'policy schedule'"), loc('physical', 'Blue folder, filing cabinet')] }),
    entry({ title: 'Boiler service', category: 'Home', person: 'Household', provider: 'Harbour Heating', phone: '01632 960 222',
      expiry: days(9), yearly: true, locations: [loc('physical', 'Blue folder, filing cabinet')] }),
    entry({ title: 'Mortgage', category: 'Home', person: 'Joint', provider: 'Highfield Bank', ref4: '6602', review: days(70),
      fullDetails: 'Annual statement, blue folder',
      locations: [loc('physical', 'Blue folder, filing cabinet'), loc('portal', 'Highfield Bank online', 'https://example.com/bank')] }),
    entry({ title: 'Car insurance', category: 'Vehicles', person: 'Alex', provider: 'Roadside Direct', ref4: '9137', expiry: days(63), yearly: true,
      locations: [loc('portal', 'Roadside Direct online', 'https://example.com/car'), loc('email', "Gmail: search 'Roadside Direct'")] }),
    entry({ title: 'MOT – Fiesta', category: 'Vehicles', person: 'Alex', expiry: days(14), yearly: true,
      locations: [loc('physical', 'Glovebox folder')] }),
    entry({ title: 'Current account – Alex', category: 'Money', person: 'Alex', provider: 'Highfield Bank', ref4: '7310',
      fullDetails: 'Statements online',
      locations: [loc('portal', 'Highfield Bank online', 'https://example.com/bank')] }),   // one copy only
    entry({ title: 'Savings account – Joint', category: 'Money', person: 'Joint', provider: 'Northgate Building Society', ref4: '2096' }),   // no location yet
    entry({ title: 'Workplace pension – Sam', category: 'Pensions', person: 'Sam', provider: 'Northgate Pensions', review: days(75),
      locations: [loc('email', "Gmail: search 'pension statement'"), loc('portal', 'Northgate Pensions online', 'https://example.com/pension')] }),
    entry({ title: 'Life insurance – Alex', category: 'Insurance', person: 'Alex', provider: 'Everwell Life', ref4: '3355',
      locations: [loc('physical', 'Fireproof box, study'), loc('gdrive', 'Scans > Insurance > Life', 'https://example.com/life')] }),
    entry({ title: 'Will – Joint', category: 'Legal and will', person: 'Joint', provider: 'Marsh & Co Solicitors', review: months(8),
      locations: [loc('person', 'R Marsh, solicitor', '01632 960 123'), loc('physical', 'Fireproof box, study')] }),
    entry({ title: 'Pet insurance – Biscuit', category: 'Pets', person: 'Household', provider: 'Paws Cover', ref4: '1184', expiry: days(33), yearly: true,
      locations: [loc('email', "Gmail: search 'Paws Cover'")] }),
    entry({ title: 'Password manager recovery kit', category: 'Digital accounts', person: 'Household',
      fullDetails: 'Printed kit in the fireproof box', locations: [loc('physical', 'Fireproof box, study')] })
  ];
  const bill = (payee, purpose, amount, frequency, method, person, dueDate) =>
    ({ id: 'bill' + (++n), payee, purpose, amount, frequency, method, person, dueDate, notes: '' });
  const bills = [
    bill('Brightspark Energy', 'Gas and electricity', '£95, varies', 'Monthly', 'Direct debit', 'Joint', days(5)),
    bill('County Council', 'Council tax', '£164', 'Monthly', 'Direct debit', 'Joint', days(12)),
    bill('FastLine Broadband', 'Broadband', '£32', 'Monthly', 'Direct debit', 'Alex', days(19)),
    bill('Clearwater Water', 'Water', '£38', 'Monthly', 'Direct debit', 'Joint', days(26)),
    bill('Pebble Mobile', 'Mobile phones', '£28', 'Monthly', 'Direct debit', 'Sam', days(31)),
    bill('Everwell Home Cover', 'Home insurance', '£420', 'Annual', 'Manual transfer', 'Joint', days(21))
  ];
  return Object.assign(base, {
    entries, bills, people: ['Household', 'Alex', 'Sam'],
    pack: { household: 'The Rivers household', includeLinks: true, includeContacts: true, includeWishes: false, includeBills: true, wishes: '',
      contacts: [
        { name: 'R Marsh', role: 'Solicitor', contact: '01632 960 123' },
        { name: 'J Okafor', role: 'Accountant', contact: 'j.okafor@example.com' },
        { name: 'Sam', role: 'Executor', contact: '07700 900123' }
      ] },
    meta: { lastExport: ago(3), lastChange: ago(4), lastOpened: ago(1) }
  });
};
