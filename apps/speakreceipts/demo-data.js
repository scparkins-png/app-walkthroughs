// © 2026 Stuart Parkins. Demo data for walkthrough recordings only. It is made up and is labelled
// "Demo data" on screen in every video. The suppliers are invented names.
// The story: a small business's receipts for September and October 2026. September has been
// exported to the accounts; October has not. The recording clock is set to 30 October 2026 (app.js).
const RECEIPTS = [
  // date,        supplier,      description,          category,     amount, paid by
  ['2026-09-02', 'Petrolio',    'Fuel',                'motor',      58.40, 'card'],
  ['2026-09-04', 'Inkwell',     'Printer paper',       'stationery', 12.99, 'card'],
  ['2026-09-08', 'Brightline',  'Broadband',           'phone',      32.00, 'card'],
  ['2026-09-10', 'Stampwise',   'Stamps',              'postage',     7.80, 'cash'],
  ['2026-09-12', 'Petrolio',    'Fuel',                'motor',      61.15, 'card'],
  ['2026-09-15', 'Cloudnote',   'Notes app',           'software',    9.99, 'card'],
  ['2026-09-17', 'Harbourside', 'Lunch',               'travel',     11.50, 'petty'],
  ['2026-09-22', 'Toolbox',     'Door hinges',         'repairs',     8.75, 'petty'],
  ['2026-09-26', 'Petrolio',    'Fuel',                'motor',      55.00, 'card'],
  ['2026-09-29', 'Deskmart',    'Desk lamp',           'office',     24.00, 'card'],
  ['2026-10-02', 'Brightline',  'Broadband',           'phone',      32.00, 'card'],
  ['2026-10-05', 'Petrolio',    'Fuel',                'motor',      59.80, 'card'],
  ['2026-10-07', 'Stampwise',   'Parcel postage',      'postage',     4.20, 'cash'],
  ['2026-10-09', 'Domainly',    'Domain renewal',      'subs',       14.99, 'card'],
  ['2026-10-13', 'Inkwell',     'Envelopes',           'stationery',  6.49, 'petty'],
  ['2026-10-16', 'Harbourside', 'Train ticket',        'travel',     23.40, 'card'],
  ['2026-10-19', 'Petrolio',    'Fuel',                'motor',      57.25, 'card'],
  ['2026-10-21', 'Toolbox',     'Sealant',             'repairs',     9.60, 'petty'],
  ['2026-10-23', 'Deskmart',    'Chair mat',           'office',     34.99, 'card'],
  ['2026-10-26', 'Cloudnote',   'Notes app',           'software',    9.99, 'card'],
  ['2026-10-27', 'Harbourside', 'Parking',             'travel',      5.50, 'cash'],
  ['2026-10-29', 'Petrolio',    'Fuel',                'motor',      60.10, 'card']
];

module.exports = function demoState(opts = {}) {
  if (opts.empty) return { receipts: [], draft: [], nextRef: 1, lastBackup: null, settings: { theme: 'light' } };
  const pad = n => String(n).padStart(4, '0');
  const suppliers = {};
  const receipts = RECEIPTS.map(([date, supplier, desc, cat, amount, pay], i) => {
    suppliers[supplier.toLowerCase()] = { name: supplier, cat };
    return { id: 'demo' + (i + 1), ref: 'R-' + pad(i + 1), supplier, desc, cat, amount, vat: null, vatRate: null,
      date, pay, exported: date < '2026-10-01', created: date + 'T18:00:00.000Z' };
  });
  // Settings left out here are filled with the app's own defaults (categories, payment methods, VAT off).
  return { receipts, draft: [], nextRef: receipts.length + 1, lastBackup: '2026-10-27T17:45:00.000Z',
    settings: { theme: opts.theme || 'light', refPrefix: 'R-', vat: false, defaultPay: '', suppliers } };
};
