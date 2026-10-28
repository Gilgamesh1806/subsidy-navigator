// Draft form ("Prepare my form"): builds the fields and the export text.
// Pure functions, no DOM. Spec: UX_SPEC.md section 6.
//
// Labels on screen use the UI language. VALUES (and the copy/PDF export) use
// the "form language": English when the UI is Kreol or English, French when
// the UI is French, because official forms are in English or French.

import { t } from './data/strings.js';
import { getItem } from './data/library.js';
import { grant80, stageFor } from './rules.js';
import { formatRs, parseMoneyInput, detectedAnswers } from './reader.js';

export function formLangFor(lang) {
  return lang === 'fr' ? 'fr' : 'en';
}

// Which field holds the cost for each scheme (calculated fields depend on it).
const COST_FIELD = { S1: 'S1.cost', S2: 'S2.cost', S3: 'S3.cost', S4: 'S4.cost', S5: 'S5.amount', S6: 'S6.amount' };
export function costFieldKey(schemeId) {
  return COST_FIELD[schemeId];
}

// state: { lang, answers, reading (reader result or null), schemeId, edits }
// edits: { fieldKey: text the user typed } — these win over pre-filled values.
export function buildDraft({ lang, answers, reading, schemeId, edits = {} }) {
  const f = formLangFor(lang);
  const scheme = getItem(schemeId);
  const detected = detectedAnswers(reading);
  const fromWords = (key) => Boolean(detected[key] && detected[key].value === answers[key]);
  const money = (n) => formatRs(n, f);
  const intents = (reading?.intents || []).map((x) => x.value);
  const hasEquipment = intents.includes('equipment');
  const item = reading?.item || 'equipment';
  const detectedCost = reading?.cost ? money(reading.cost.value) : '';

  // One form field. tag = words | answers | calc | fill (shown as text).
  function field(key, labelKey, prefill, tag, extra = {}) {
    const edited = Object.prototype.hasOwnProperty.call(edits, key);
    return { key, label: t(lang, labelKey), exportLabel: t(f, labelKey), value: edited ? edits[key] : prefill, tag, ...extra };
  }
  const tagFor = (key) => (fromWords(key) ? 'words' : 'answers');

  // ---------------------------------------------------------------- Part A
  const sectorValue = answers.sector === 'food' && reading?.sector?.bakery
    ? t(f, 'v.bakery')
    : answers.sector ? t(f, 'sector.' + answers.sector) : '';

  let location = '';
  if (answers.place) {
    const island = t(f, answers.place === 'rod' ? 'v.rodrigues' : 'v.mauritius');
    const town = fromWords('place') ? reading.place.town : null;
    location = town ? `${town}, ${island}` : island;
  }

  let turnover = '';
  if (answers.turnover) {
    turnover = t(f, 'turnover.' + answers.turnover);
    if (answers.turnover !== 'tU') turnover += ' · ' + t(f, 'v.band.' + answers.turnover);
  }

  const partA = [
    field('A.applicant', 'f.applicant', '', 'fill'),
    field('A.business', 'f.business', '', 'fill'),
    field('A.brn', 'f.brn', '', 'fill', answers.age === 'a0' ? { hint: t(lang, 'f.brnHint') } : {}),
    field('A.activity', 'f.activity', sectorValue, tagFor('sector')),
    field('A.location', 'f.location', location, tagFor('place')),
    field('A.years', 'f.years', answers.age ? t(f, 'age.' + answers.age) : '', tagFor('age')),
    field('A.employees', 'f.employees', answers.staff ? t(f, 'staff.' + answers.staff) : '', tagFor('staff')),
    field('A.turnover', 'f.turnover', turnover, tagFor('turnover')),
    field('A.contact', 'f.contact', '', 'fill', { hint: t(lang, 'f.contactNote') }),
  ];

  // ---------------------------------------------------------------- Part B
  // The current cost: what the user typed, or the cost found in their words.
  const costKey = COST_FIELD[schemeId];
  const costPrefill = {
    S1: detectedCost,
    S2: intents.includes('marketing') ? detectedCost : '', // an oven cost is not a marketing cost
    S3: '',
    S4: detectedCost,
    S5: detectedCost,
    S6: detectedCost,
  }[schemeId];
  const costField = (labelKey) =>
    field(costKey, labelKey, costPrefill, costPrefill ? 'words' : 'fill', { isCost: true, inputmode: 'numeric' });
  const costText = costKey in edits ? edits[costKey] : costPrefill;
  const cost = parseMoneyInput(costText);

  // Calculated field: read-only, recomputed from the cost.
  function calc(key, labelKey, amount, working, note, formula) {
    return field(key, labelKey, amount === null ? '' : money(amount), 'calc', {
      readonly: true,
      working: amount === null ? formula : working,
      note,
    });
  }

  function grantField() {
    const g = grant80(cost);
    if (!g) return calc(schemeId + '.grant', 'f.grant', null, '', t(f, 'calc.80.note'), t(f, 'calc.80.formula'));
    const working = g.capped
      ? t(f, 'calc.80.capped', { cost: money(cost), raw: money(g.raw) })
      : t(f, 'calc.80.under', { cost: money(cost), grant: money(g.grant) });
    return calc(schemeId + '.grant', 'f.grant', g.grant, working, t(f, 'calc.80.note'));
  }

  const newItem = hasEquipment ? t(f, 'v.new.' + item) : '';
  const aNewItem = t(f, 'v.aNew.' + item);
  let partB = [];

  if (schemeId === 'S1') {
    const g = grant80(cost);
    const own = g ? cost - g.grant : null;
    partB = [
      field('S1.equipment', 'f.equipment', newItem, newItem ? 'words' : 'fill'),
      costField('f.cost'),
      grantField(),
      calc('S1.own', 'f.own', own, own === null ? '' : t(f, 'calc.own.working', { cost: money(cost), grant: money(g.grant) }),
        t(f, 'calc.own.note'), t(f, 'calc.own.formula')),
      field('S1.purpose', 'f.purpose', hasEquipment ? t(f, 'v.purposeS1', { x: aNewItem }) : '', hasEquipment ? 'words' : 'fill', { multiline: true }),
      field('S1.supplier', 'f.supplier', '', 'fill'),
    ];
  } else if (schemeId === 'S2') {
    const marketing = intents.includes('marketing') ? t(f, 'v.advertising') : '';
    partB = [
      field('S2.activity', 'f.marketing', marketing, marketing ? 'words' : 'fill'),
      costField('f.mcost'),
      grantField(),
    ];
  } else if (schemeId === 'S3') {
    const grant = cost ? Math.min(cost, 50000) : null;
    partB = [
      field('S3.product', 'f.product', sectorValue, tagFor('sector')),
      costField('f.certCost'),
      calc('S3.grant', 'f.grant', grant, t(f, 'calc.50k.working'), t(f, 'calc.50k.note'), t(f, 'calc.50k.working')),
    ];
  } else if (schemeId === 'S4') {
    // The owner's share is rounded up, so the grant part is never rounded up.
    const share = cost ? Math.ceil(cost / 2) : null;
    partB = [
      field('S4.stage', 'f.stage', t(f, 'v.stage.' + stageFor(answers.age)), tagFor('age')),
      field('S4.incubator', 'f.incubator', '', 'fill', { placeholder: t(f, 'v.incubatorPh') }),
      costField('f.projectCost'),
      calc('S4.share', 'f.share', share, share === null ? '' : t(f, 'calc.half.working', { cost: money(cost) }),
        t(f, 'calc.half.note'), t(f, 'calc.half.formula')),
    ];
  } else if (schemeId === 'S5' || schemeId === 'S6') {
    const product = schemeId === 'S6' ? t(f, 'v.dbmLoan') : t(f, hasEquipment ? 'v.leasing' : 'v.businessLoan');
    partB = [
      field(schemeId + '.product', 'f.loanProduct', product, hasEquipment && schemeId === 'S5' ? 'words' : 'answers'),
      costField('f.amount'),
      field(schemeId + '.purpose', 'f.purpose', hasEquipment ? t(f, 'v.purposeLoan', { x: aNewItem }) : '', hasEquipment ? 'words' : 'fill', { multiline: true }),
    ];
  }

  const askKeys = ['ask.open', 'ask.docs', 'ask.time'];
  return {
    formLang: f,
    scheme,
    partA,
    partB,
    questions: askKeys.map((k) => t(lang, k)),
    exportQuestions: askKeys.map((k) => t(f, k)),
  };
}

// Plain-text export for Copy and Share (spec section 6 format).
export function exportText(draft) {
  const f = draft.formLang;
  const fillIn = t(f, 'export.fillIn');
  const line = (fld) => {
    const value = String(fld.value || '').trim();
    if (!value) return `${fld.exportLabel}: ${fillIn}`;
    return fld.tag === 'calc' ? `${fld.exportLabel}: ${value} (${fld.note})` : `${fld.exportLabel}: ${value}`;
  };
  return [
    t(f, 'export.header'),
    `${t(f, 'export.scheme')}: ${draft.scheme.name}`,
    `${t(f, 'export.source')}: ${draft.scheme.sources[0]} · ${t(f, 'export.checked')}`,
    t(f, 'export.partA'),
    ...draft.partA.map(line),
    t(f, 'export.partB'),
    ...draft.partB.map(line),
    t(f, 'export.partC'),
    ...draft.exportQuestions.map((q) => '- ' + q),
    t(f, 'export.footer'),
  ].join('\n');
}
