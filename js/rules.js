// Eligibility engine: pure functions, no DOM, no network. Tested in tests/.
// Spec: UX_SPEC.md section 4 (rules table) and 4.1 (matching).
//
// Answer ids:
//   sector   food | retail | tourism | making | farming | it | beauty | transport | other
//   turnover t0 (<3M) | t1 (3–10M) | t2 (10–30M) | t3 (30–100M) | t4 (>100M) | tU (not sure)
//   place    mu | rod
//   staff    s0 (just me) | s1 | s2 | s3 | s4
//   age      a0 (not started) | a1 (<1y) | a2 (1–3y) | a3 (>3y)
//
// A rule returns { result: 'pass' | 'fail' | 'unknown', reason? }.
// reason (only for 'unknown') is one of: notSure, notAsked, notPublished, bankDecides.

import { LIBRARY } from './data/library.js';

const PASS = { result: 'pass' };
const FAIL = { result: 'fail' };
const unknown = (reason) => ({ result: 'unknown', reason });

// A missing answer is treated like "Not sure": it never hides an item.
function turnoverRule(answers, passing) {
  const t = answers.turnover;
  if (!t || t === 'tU') return unknown('notSure');
  return passing.includes(t) ? PASS : FAIL;
}

// Each rule: which answers it reads (for "You said: …") and the check itself.
export const RULES = {
  sme: { uses: ['turnover'], check: (a) => turnoverRule(a, ['t0', 't1', 't2', 't3']) },
  t30: { uses: ['turnover'], check: (a) => turnoverRule(a, ['t0', 't1', 't2']) },
  scope: { uses: ['turnover'], check: (a) => turnoverRule(a, ['t0', 't1', 't2', 't3']) },
  any: { uses: ['sector'], check: () => PASS },
  youngWomen: { uses: [], check: () => unknown('notAsked') },
  localMade: {
    uses: ['sector'],
    check: (a) => (['food', 'making', 'farming'].includes(a.sector) ? PASS : FAIL),
  },
  stage: { uses: ['age'], check: () => PASS }, // always passes; the row states the stage
  place: { uses: ['place'], check: (a) => (a.place === 'mu' || a.place === 'rod' ? PASS : unknown('notSure')) },
  track: {
    uses: ['age'],
    check: (a) => {
      if (a.age === 'a2' || a.age === 'a3') return PASS;
      if (a.age === 'a0') return FAIL;
      return unknown('bankDecides'); // a1: under one year
    },
  },
  dbm: { uses: [], check: () => PASS },
  startup: { uses: ['age'], check: (a) => (a.age === 'a0' || a.age === 'a1' ? PASS : FAIL) },
  conditions: { uses: [], check: () => unknown('notPublished') },
  priority: {
    uses: ['sector', 'place'],
    check: (a) => (['it', 'making', 'farming'].includes(a.sector) || a.place === 'rod' ? PASS : FAIL),
  },
  entity: { uses: ['age'], check: (a) => (a.age === 'a0' ? FAIL : unknown('notAsked')) },
  anyBiz: { uses: [], check: () => PASS },
  vat: {
    uses: ['turnover'],
    check: (a) => {
      if (!a.turnover || a.turnover === 'tU') return unknown('notSure');
      return a.turnover === 't0' ? FAIL : PASS;
    },
  },
  employer: { uses: ['staff'], check: (a) => (a.staff && a.staff !== 's0' ? PASS : FAIL) },
  food: { uses: ['sector'], check: (a) => (a.sector === 'food' ? PASS : FAIL) },
};

// Run every rule of one item. matches = no rule failed.
export function checkItem(item, answers) {
  const checks = item.rules.map((id) => ({ id, uses: RULES[id].uses, ...RULES[id].check(answers) }));
  const passed = checks.filter((c) => c.result === 'pass').length;
  const unknownCount = checks.filter((c) => c.result === 'unknown').length;
  return {
    item,
    checks,
    matches: checks.every((c) => c.result !== 'fail'),
    passed,
    unknown: unknownCount,
    total: checks.length,
  };
}

// Score = sum of the item's weights for the intents found in the text.
export function score(item, intents = []) {
  return intents.reduce((sum, intent) => sum + (item.relevance[intent] || 0), 0);
}

// Sort by score (high first); ties keep library order.
function byScore(a, b) {
  return b.score - a.score || LIBRARY.indexOf(a.item) - LIBRARY.indexOf(b.item);
}

const OBLIGATION_ORDER = ['O1', 'O4', 'O2', 'O3'];

// Spec 4.1. Returns the three buckets plus n (size of Best).
//   best        up to 3 open supports (Confirmed / Unconfirmed), by score
//   also        other matching supports, then S7/S8 (neverBest), then O2 "not yet" when t0
//   obligations matching obligations in the order O1, O4, O2, O3
export function matchAll(answers, intents = []) {
  const results = LIBRARY.map((item) => ({ ...checkItem(item, answers), score: score(item, intents) }));
  const supports = results.filter((r) => r.item.type !== 'obligation' && r.matches);

  const open = supports
    .filter((r) => !r.item.neverBest && (r.item.status === 'confirmed' || r.item.status === 'unconfirmed'))
    .sort(byScore);
  const best = open.slice(0, 3);
  const bottom = supports.filter((r) => r.item.neverBest || !open.includes(r));
  const also = [...open.slice(3), ...bottom.sort(byScore)];

  const obligations = OBLIGATION_ORDER.map((id) => results.find((r) => r.item.id === id)).filter((r) => r.matches);

  // VAT under Rs 3 M: not an obligation yet, but worth knowing.
  if (answers.turnover === 't0') {
    const vat = results.find((r) => r.item.id === 'O2');
    also.push({ ...vat, notYet: true });
  }

  return { best, also, obligations, n: best.length };
}

// Money helpers. Grants are never rounded up, so we floor.
export function grant80(cost) {
  if (!cost || cost <= 0) return null;
  const raw = Math.floor((cost * 80) / 100);
  return { raw, grant: Math.min(raw, 150000), capped: raw > 150000 };
}

// NSIS stage from the business age (S4).
export function stageFor(age) {
  if (age === 'a0') return 'pre';
  if (age === 'a3') return 'acc';
  return 'inc'; // a1, a2
}

// Turnover band for an amount in rupees. A boundary value belongs to the
// lower band: VAT applies when sales "exceed" Rs 3 M, and the SME Act bands
// are "up to" 10 M / 30 M / 100 M.
export function bandFor(amount) {
  if (amount <= 3000000) return 't0';
  if (amount <= 10000000) return 't1';
  if (amount <= 30000000) return 't2';
  if (amount <= 100000000) return 't3';
  return 't4';
}
