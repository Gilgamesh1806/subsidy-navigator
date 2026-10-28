// Core tests: the Marie-Claire demo path, the no-results path and amount parsing.
// Run from the prototype folder:  node --test tests/
// Uses only Node's built-in test runner (no npm packages).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { read, findAmounts, detectedAnswers, formatRs } from '../js/reader.js';
import { matchAll, bandFor } from '../js/rules.js';
import { buildDraft, exportText } from '../js/draft.js';
import { LIBRARY } from '../js/data/library.js';
import { STRINGS, t, tn } from '../js/data/strings.js';

const ids = (list) => list.map((r) => r.item.id);

// ------------------------------------------------------------ Marie-Claire

for (const lang of ['km', 'fr', 'en']) {
  test(`persona sentence (${lang}) gives the same four chips`, () => {
    const r = read(STRINGS['persona.text'][lang]);
    assert.equal(r.sector.value, 'food');
    assert.equal(r.sector.bakery, true);
    assert.equal(r.place.value, 'mu');
    assert.equal(r.place.town, 'Rose-Hill');
    assert.deepEqual(r.intents.map((x) => x.value), ['equipment']);
    assert.equal(r.item, 'oven');
    assert.equal(r.cost.value, 180000);
    // Turnover, staff and age are NOT detected (acceptance criterion 2).
    assert.equal(r.turnover, null);
    assert.equal(r.staff, null);
    assert.equal(r.age, null);
  });
}

const marieClaire = { sector: 'food', turnover: 't1', place: 'mu', staff: 's1', age: 'a3' };

test('Marie-Claire result: 3 best matches, obligations in order', () => {
  const m = matchAll(marieClaire, ['equipment']);
  assert.equal(m.n, 3);
  assert.deepEqual(ids(m.best), ['S1', 'S5', 'S2']);
  assert.deepEqual(ids(m.also), ['S3', 'S4', 'S6']);
  assert.deepEqual(ids(m.obligations), ['O1', 'O4', 'O2', 'O3']);
  assert.equal(tn('km', 'res.headline', m.n), '3 sipor ki kapav ed ou'); // deck slide 3
});

test('Marie-Claire draft: S1 grant is Rs 144,000 with Rs 36,000 own share', () => {
  const reading = read(STRINGS['persona.text'].km);
  const draft = buildDraft({ lang: 'km', answers: marieClaire, reading, schemeId: 'S1' });
  const field = (key) => draft.partB.find((f) => f.key === key);
  assert.equal(field('S1.cost').value, 'Rs 180,000');
  assert.equal(field('S1.grant').value, 'Rs 144,000');
  assert.equal(field('S1.own').value, 'Rs 36,000');
  assert.equal(draft.partA.find((f) => f.key === 'A.activity').value, 'Pastry shop / bakery (food & drink)');
  assert.equal(draft.partA.find((f) => f.key === 'A.location').value, 'Rose-Hill, Mauritius');
  const text = exportText(draft);
  assert.match(text, /^SUBSIDY NAVIGATOR — DRAFT \(guidance, not legal advice\)/);
  assert.match(text, /Grant requested: Rs 144,000 \(80%, max Rs 150,000\)/);
  assert.match(text, /Applicant name: \[fill in\]/);
});

// ------------------------------------------------------- the other two chips

test('FR chip: beauty + Curepipe + start, age a0', () => {
  const r = read('Je veux ouvrir un salon de coiffure à Curepipe.');
  assert.equal(r.sector.value, 'beauty');
  assert.equal(r.place.value, 'mu');
  assert.equal(r.place.town, 'Curepipe');
  assert.ok(r.intents.some((x) => x.value === 'start'));
  assert.equal(r.age.value, 'a0');
});

test('EN chip: farming + Rodrigues + export; S8 only under "Also"', () => {
  const r = read('I run a small fishing business in Rodrigues and want to export.');
  assert.equal(r.sector.value, 'farming');
  assert.equal(r.place.value, 'rod');
  assert.deepEqual(r.intents.map((x) => x.value), ['export']);
  const m = matchAll({ ...detectedValues(r), turnover: 't0', staff: 's0', age: 'a2' }, ['export']);
  assert.ok(ids(m.also).includes('S8'));
  assert.ok(!ids(m.best).includes('S8'));
});

function detectedValues(r) {
  const d = detectedAnswers(r);
  return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.value]));
}

// ------------------------------------------------------------ no results

test('no-results: turnover over Rs 100 M fails every support', () => {
  const m = matchAll({ ...marieClaire, turnover: 't4' }, ['equipment']);
  assert.equal(m.n, 0);
  assert.deepEqual(ids(m.best), []);
  assert.deepEqual(ids(m.also), []);
  assert.deepEqual(ids(m.obligations), ['O1', 'O4', 'O2', 'O3']); // still listed
  assert.equal(t('en', 'noresult.title'), "We don't know — ask SME Mauritius");
});

test('no SME Mauritius URL anywhere in the library', () => {
  const urls = LIBRARY.flatMap((item) => item.sources);
  assert.ok(urls.every((u) => !/sme ?mauritius|smemu|smeMauritius/i.test(u)));
  assert.equal(LIBRARY.length, 12);
});

// ----------------------------------------------------- edges: VAT and NSF

test('VAT: under Rs 3 M is "not yet", over is an obligation, not sure is unknown', () => {
  const low = matchAll({ ...marieClaire, turnover: 't0' });
  assert.ok(!ids(low.obligations).includes('O2'));
  assert.ok(low.also.some((r) => r.item.id === 'O2' && r.notYet));
  assert.ok(ids(matchAll({ ...marieClaire, turnover: 'tU' }).obligations).includes('O2'));
  assert.equal(bandFor(3000000), 't0'); // "exceeds Rs 3 M" -> exactly 3 M is not over
  assert.equal(bandFor(3000001), 't1');
  assert.equal(bandFor(30000000), 't2'); // LokalBoost: "not exceeding MUR 30 million"
  assert.equal(bandFor(100000001), 't4');
});

test('NSF: only when the owner employs someone', () => {
  assert.ok(!ids(matchAll({ ...marieClaire, staff: 's0' }).obligations).includes('O3'));
  assert.ok(ids(matchAll({ ...marieClaire, staff: 's1' }).obligations).includes('O3'));
});

// ---------------------------------------------------------------- amounts

test('amount strings parse exactly as in spec 5.5', () => {
  const one = (text) => findAmounts(text).map((a) => a.value);
  assert.deepEqual(one('Rs 180,000'), [180000]);
  assert.deepEqual(one('180 000 roupi'), [180000]);
  assert.deepEqual(one('Rs 1.5 M'), [1500000]);
  assert.deepEqual(one('Rs1,5M'), [1500000]);
  assert.deepEqual(one('Rs 180k'), [180000]);
  assert.deepEqual(one('180.000 Rs'), [180000]);
  assert.deepEqual(one('1.5 M'), []); // no money context: not an amount
  assert.deepEqual(one('since 2019, 2 employees'), []);
});

test('turnover cue gives a band; "four employees" is staff, not an oven', () => {
  const r = read('2 milyon roupi par an');
  assert.equal(r.turnover.amount, 2000000);
  assert.equal(r.turnover.value, 't0');
  const s = read('I have four employees');
  assert.equal(s.staff.value, 's1');
  assert.equal(s.item, null);
  assert.ok(!s.intents.some((x) => x.value === 'equipment'));
});

test('empty and gibberish text find nothing', () => {
  assert.equal(read('').found, false);
  assert.equal(read('qwxz blorp zzzt').found, false);
});

test('money display: KM/EN comma, FR narrow no-break space', () => {
  assert.equal(formatRs(180000, 'en'), 'Rs 180,000');
  assert.equal(formatRs(180000, 'fr'), 'Rs 180 000');
});
