// Keyword reader: finds sector, place, intents, amounts, staff and business
// age in the owner's own words. It is NOT AI: it only looks for word stems
// from the lexicon below (UX_SPEC.md section 5). All three languages are
// searched at once; there is no language detection and no negation handling.
//
// Every match records { category, value, sourceWord, charRange } so the UI can
// highlight the word and say "From «word»".

import { bandFor } from './rules.js';

// ------------------------------------------------------------------ lexicon
// A stem matches the START of a word: 'patis' matches patisri, patisserie.
// A stem ending in '=' must match the whole word. Spaces make a phrase.

const SECTORS = {
  food: ['patis', 'gato', 'boulanz', 'dipin', 'restoran', 'manze', 'kwizinn', 'snack', 'kafe',
    'boulang', 'patiss', 'gateau', 'pain=', 'restau', 'traiteur', 'cuisin',
    'baker', 'pastr', 'cake', 'bread', 'restaurant', 'food', 'takeaway', 'cater', 'cafe'],
  retail: ['boutik', 'laboutik', 'magazin', 'komers', 'boutique', 'magasin', 'commerce', 'epicer',
    'shop', 'store', 'retail', 'grocer'],
  tourism: ['lotel', 'gesthaus', 'touris', 'bungalow', 'kanpman', 'hotel', 'maison d hote', 'gite',
    'guest house', 'guesthouse', 'b&b='],
  making: ['fabrik', 'lizinn', 'artizan', 'kouti', 'mebl', 'fabri', 'usine', 'artisan', 'couture', 'menuis',
    'factor', 'manufactur', 'craft', 'workshop', 'sewing', 'furniture'],
  farming: ['agrikiltir', 'plantasion', 'lapes', 'peser', 'legim', 'zelvaz', 'agricult', 'plantation', 'peche',
    'pecheur', 'legume', 'elevage', 'farm', 'fishing', 'fisher', 'vegetable', 'livestock'],
  it: ['lordinater', 'aplikasion', 'lozisiel', 'sit web', 'digital', 'informati', 'numerique', 'logiciel',
    'application', 'site web', 'software', 'app=', 'apps=', 'website', 'tech='], // + "IT" (case-sensitive, below)
  beauty: ['kwafer', 'bote', 'manikir', 'salon', 'coiff', 'beaute', 'esthetique', 'onglerie',
    'beauty', 'hair', 'barber', 'nail', 'spa='],
  transport: ['transpor', 'taksi', 'kamion', 'bis=', 'van=', 'taxi', 'camion', 'livraison', 'truck', 'lorry', 'deliver'],
};

// Words that make a food shop a bakery ("Pastry shop / bakery" in the draft).
const BAKERY = ['patis', 'gato', 'boulang', 'dipin', 'pain=', 'baker', 'pastr', 'cake', 'bread'];

// Intents. 'four' (oven) is handled separately because it is also "four" (4).
// 'anplway=' is whole-word so the noun "anplwaye" (employee) is not "hire".
const INTENTS = {
  equipment: ['aste', 'ashte', 'masinn', 'ekipman', 'zouti', 'frizider', 'achet', 'achat', 'machine',
    'equipement', 'materiel', 'outil', 'buy', 'purchas', 'equipment', 'oven', 'tool', 'fridge'],
  loan: ['prete', 'kredi', 'pret=', 'credit', 'emprunt', 'financ', 'loan', 'borrow'],
  marketing: ['reklam', 'piblisite', 'promosion', 'pib=', 'publicit', 'promotion', 'marketing',
    'reseaux sociaux', 'advert', 'promot', 'social media', 'facebook'],
  export: ['ekspor', 'export', 'etranger', 'abroad', 'overseas'],
  hire: ['anbos', 'anplway=', 'embauch', 'recrut', 'hire', 'hiring', 'recruit'],
  register: ['anrezistre', 'lisans', 'permi', 'brn=', 'enregistr', 'immatricul', 'licence', 'permis',
    'regist', 'licen', 'permit'],
  start: ['koumans', 'lans', 'ouver', 'demarr', 'lancer', 'ouvrir', 'creer', 'start', 'launch', 'open',
    'set up', 'nouvo biznes=', 'new business', 'nouvelle entreprise'],
};

// 'four' means oven only after one of these words (within 2 words)...
const OVEN_BEFORE = ['enn', 'en', 'un', 'le', 'mon', 'nouvo', 'nouveau', 'gros', 'a', 'an', 'new', 'the'];
// ...and not when a staff or time word follows ("four employees", "four years").
const STAFF_NOUNS = ['dimounn', 'anplwaye', 'travayer', 'employe', 'salarie', 'personne', 'staff', 'employee', 'worker', 'people'];
const TIME_NOUNS = ['an', 'ans', 'lane', 'year', 'mois', 'month', 'semaine', 'week', 'zour', 'jour', 'day'];

// Equipment item for "For your …" and the draft. First one found wins.
const ITEMS = {
  oven: ['oven'], // + 'four' when it passes the oven guard
  machine: ['masinn', 'machine'],
  fridge: ['frizider', 'fridge', 'frigo', 'refrigerat'],
  computer: ['lordinater', 'computer', 'ordinateur'],
  truck: ['kamion', 'truck', 'camion'],
};

// Places: [phrase, display name]. A null name means the phrase is the island
// itself. All place names match whole words only.
const MAURITIUS = [
  ['port louis', 'Port-Louis'], ['porlwi', 'Port-Louis'], ['rose hill', 'Rose-Hill'], ['rosehill', 'Rose-Hill'],
  ['rozil', 'Rose-Hill'], ['beau bassin', 'Beau-Bassin'], ['bobasin', 'Beau-Bassin'],
  ['quatre bornes', 'Quatre-Bornes'], ['katborn', 'Quatre-Bornes'], ['vacoas', 'Vacoas'], ['phoenix', 'Phoenix'],
  ['curepipe', 'Curepipe'], ['kurpip', 'Curepipe'], ['floreal', 'Floréal'], ['moka', 'Moka'], ['ebene', 'Ebène'],
  ['reduit', 'Réduit'], ['mahebourg', 'Mahébourg'], ['maybour', 'Mahébourg'], ['goodlands', 'Goodlands'],
  ['triolet', 'Triolet'], ['grand baie', 'Grand-Baie'], ['granbe', 'Grand-Baie'], ['central flacq', 'Central Flacq'],
  ['flacq', 'Flacq'], ['rose belle', 'Rose-Belle'], ['souillac', 'Souillac'], ['chemin grenier', 'Chemin-Grenier'],
  ['bel air', 'Bel-Air'], ['pamplemousses', 'Pamplemousses'], ['flic en flac', 'Flic-en-Flac'], ['tamarin', 'Tamarin'],
  ['black river', 'Black River'], ['riviere noire', 'Rivière-Noire'], ['riviere du rempart', 'Rivière-du-Rempart'],
  ['plaine magnien', 'Plaine-Magnien'], ['bambous', 'Bambous'], ['quartier militaire', 'Quartier-Militaire'],
  ['saint pierre', 'Saint-Pierre'], ['le morne', 'Le Morne'], ['cap malheureux', 'Cap-Malheureux'],
  ['belle mare', 'Belle-Mare'], ['petite riviere', 'Petite-Rivière'], ['coromandel', 'Coromandel'],
  ['pailles', 'Pailles'], ['plaine verte', 'Plaine-Verte'], ['terre rouge', 'Terre-Rouge'],
  ['mauritius', null], ['maurice', null], ['moris', null],
];
const RODRIGUES = [
  ['rodrigues', null], ['rodrig', null], ['port mathurin', 'Port-Mathurin'], ['mont lubin', 'Mont-Lubin'],
  ['baie aux huitres', 'Baie-aux-Huîtres'], ['la ferme', 'La Ferme'], ['grande montagne', 'Grande-Montagne'],
  ['petite butte', 'Petite-Butte'], ['rodriguais', null], ['rodrigais', null],
];

const NUMBER_WORDS = {
  enn: 1, de: 2, trwa: 3, kat: 4, sink: 5, sis: 6, set: 7, wit: 8, nef: 9, dis: 10,
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10,
  one: 1, two: 2, three: 3, four: 4, five: 5, seven: 7, eight: 8, nine: 9, ten: 10,
};

const ALONE = ['zis mwa', 'mo tousel', 'moi seul', 'seule=', 'just me', 'on my own', 'by myself'];
const NOT_STARTED = ['pankor koumanse', 'pas encore', 'not started', 'planning to'];
const JUST_STARTED = ['just started', 'vient d ouvrir', 'nouvo biznes'];
const AGE_WORDS = ['depi', 'depuis', 'for', 'since'];
const YEAR_WORDS = ['an', 'ans', 'lane', 'year', 'years'];

const TURNOVER_CUES = ['sifer dafer', 'chiffre d affaires', 'turnover', 'sales', 'lavant', 'ventes',
  'par an', 'per year', 'a year']; // + "CA" (case-sensitive, below)
const COST_CUES = ['kout', 'coute', 'cost', 'pri=', 'prix', 'price', 'pou aste', 'acheter', 'buy'];

const THIS_YEAR = 2026;

// ------------------------------------------------------------ normalising

// Lowercase, strip accents (é -> e), and split into words. Each word keeps
// its start/end position in the ORIGINAL text, for highlighting.
export function tokenize(text) {
  const tokens = [];
  let current = null;
  for (let i = 0; i < text.length; i++) {
    // NFD splits "é" into "e" + accent mark; we drop the mark.
    const plain = text[i].toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    const isWordChar = plain !== '' && /^[\p{L}\p{N}]+$/u.test(plain);
    if (isWordChar) {
      if (!current) current = { t: '', start: i, end: i + 1 };
      current.t += plain;
      current.end = i + 1;
    } else if (plain !== '' && current) {
      tokens.push(current); // apostrophes, hyphens, spaces and punctuation end a word
      current = null;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

// Turn 'maison d hote' or 'pain=' into { words: [...], whole: bool }.
function parseStem(stem) {
  const whole = stem.endsWith('=');
  const words = tokenize(whole ? stem.slice(0, -1) : stem).map((tok) => tok.t);
  return { words, whole };
}

// Does the stem match the words starting at tokens[i]? Returns the number of
// words matched (0 = no match). All words but the last must match exactly.
function matchAt(tokens, i, stem, forceWhole = false) {
  const { words, whole } = typeof stem === 'string' ? parseStem(stem) : stem;
  for (let j = 0; j < words.length; j++) {
    const tok = tokens[i + j];
    if (!tok) return 0;
    const last = j === words.length - 1;
    const exact = !last || whole || forceWhole;
    if (exact ? tok.t !== words[j] : !tok.t.startsWith(words[j])) return 0;
  }
  return words.length;
}

// First stem in the list that matches at position i (or null).
function firstMatch(tokens, i, stems, forceWhole = false) {
  for (const stem of stems) {
    const len = matchAt(tokens, i, stem, forceWhole);
    if (len) return { stem, len };
  }
  return null;
}

function hit(category, value, text, tokens, i, len) {
  const start = tokens[i].start;
  const end = tokens[i + len - 1].end;
  return { category, value, sourceWord: text.slice(start, end), charRange: [start, end] };
}

// Is the word "four" at position i an oven?
function isOven(tokens, i) {
  if (tokens[i].t !== 'four') return false;
  const before = [tokens[i - 1], tokens[i - 2]].filter(Boolean).map((tok) => tok.t);
  if (!before.some((word) => OVEN_BEFORE.includes(word))) return false;
  const next = tokens[i + 1];
  if (next && [...STAFF_NOUNS, ...TIME_NOUNS].some((noun) => next.t.startsWith(noun))) return false;
  return true;
}

function numberValue(tok) {
  if (!tok) return null;
  if (/^\d{1,4}$/.test(tok.t)) return Number(tok.t);
  return NUMBER_WORDS[tok.t] ?? null;
}

// ------------------------------------------------------------------ amounts

// Number: "180,000" / "180 000" / "180.000" (a separator + exactly 3 digits is
// a thousands separator) or "1.5" / "1,5" (1–2 digits after it = decimal).
// Money context is required: Rs / MUR before, or Rs / roupi / rupee after.
const AMOUNT_RE = new RegExp(
  '(?:\\b(rs\\.?|mur)\\s?)?' + // 1: currency before
  '(\\d{1,3}(?:[ ,.\\u00A0\\u202F]\\d{3})+|\\d+(?:[.,]\\d{1,2})?)' + // 2: number
  '(?:\\s?(millions?|milyon|mille|thousand|lakhs?|mil|mn|k|m)\\b)?' + // 3: multiplier
  '(?:\\s?(roupies?|roupi|rupees?|rs\\b\\.?|mur\\b))?', // 4: currency after
  'gi'
);

const MULTIPLIERS = {
  k: 1e3, mil: 1e3, mille: 1e3, thousand: 1e3,
  m: 1e6, mn: 1e6, million: 1e6, millions: 1e6, milyon: 1e6,
  lakh: 1e5, lakhs: 1e5,
};

function parseNumber(str) {
  if (/^\d{1,3}([ ,.  ]\d{3})+$/.test(str)) return Number(str.replace(/\D/g, ''));
  return Number(str.replace(',', '.'));
}

// All money amounts in the text: [{ value, sourceWord, charRange }].
export function findAmounts(text) {
  const found = [];
  for (const m of text.matchAll(AMOUNT_RE)) {
    const [whole, before, number, mult, after] = m;
    if (!before && !after) continue; // a bare number is never an amount ("2019", "2 employees")
    const factor = mult ? MULTIPLIERS[mult.toLowerCase()] : 1;
    const value = Math.round(parseNumber(number) * factor);
    const trimmed = whole.trimEnd();
    found.push({ value, sourceWord: trimmed, charRange: [m.index, m.index + trimmed.length] });
  }
  return found;
}

// Same parser for a typed cost field in the draft ("180000", "Rs 180,000", "1.5 M").
export function parseMoneyInput(str) {
  const clean = String(str || '').trim();
  if (!clean) return null;
  const withContext = /\b(rs|mur)\b/i.test(clean) ? clean : 'Rs ' + clean;
  const amounts = findAmounts(withContext);
  return amounts.length ? amounts[0].value : null;
}

// "Rs 180,000" (KM/EN) or "Rs 180 000" with narrow no-break spaces (FR).
export function formatRs(value, lang = 'en') {
  const digits = String(Math.floor(value)).replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'fr' ? ' ' : ',');
  return 'Rs ' + digits;
}

// Sentence boundaries: . ! ? followed by a space or the end ("Rs." is not one).
function sentenceRanges(text) {
  const ranges = [];
  let start = 0;
  for (const m of text.matchAll(/[.!?](?=\s|$)/g)) {
    if (/\brs$/i.test(text.slice(Math.max(0, m.index - 3), m.index))) continue;
    ranges.push([start, m.index + 1]);
    start = m.index + 1;
  }
  if (start < text.length) ranges.push([start, text.length]);
  return ranges;
}

function hasCue(tokens, cues) {
  for (let i = 0; i < tokens.length; i++) {
    if (firstMatch(tokens, i, cues)) return true;
  }
  return false;
}

// ------------------------------------------------------------------- reader

export function read(text = '') {
  const tokens = tokenize(text);
  const matches = [];

  // --- sector: count hits per sector (one hit per word per sector)
  const sectorHits = {};
  for (let i = 0; i < tokens.length; i++) {
    for (const [sector, stems] of Object.entries(SECTORS)) {
      const m = firstMatch(tokens, i, stems);
      if (m) (sectorHits[sector] ||= []).push(hit('sector', sector, text, tokens, i, m.len));
    }
  }
  for (const m of text.matchAll(/\bIT\b/g)) { // "IT" only in capitals
    (sectorHits.it ||= []).push({ category: 'sector', value: 'it', sourceWord: 'IT', charRange: [m.index, m.index + 2] });
  }
  // "salon" is beauty unless a food word is also there.
  if (sectorHits.food && sectorHits.beauty) {
    sectorHits.beauty = sectorHits.beauty.filter((h) => !h.sourceWord.toLowerCase().startsWith('salon'));
    if (!sectorHits.beauty.length) delete sectorHits.beauty;
  }
  // Retail always loses to any other sector ("boutik patisri" = food).
  if (sectorHits.retail && Object.keys(sectorHits).length > 1) delete sectorHits.retail;
  // Most hits wins; a tie goes to the first one in the text.
  let sector = null;
  for (const [value, hits] of Object.entries(sectorHits)) {
    hits.sort((a, b) => a.charRange[0] - b.charRange[0]);
    const better = !sector || hits.length > sector.hits.length ||
      (hits.length === sector.hits.length && hits[0].charRange[0] < sector.hits[0].charRange[0]);
    if (better) sector = { value, hits };
  }
  let sectorResult = null;
  if (sector) {
    const first = sector.hits[0];
    const bakery = sector.value === 'food' && tokens.some((tok, i) => firstMatch(tokens, i, BAKERY));
    sectorResult = { ...first, bakery };
    matches.push(...sector.hits);
  }

  // --- intents (first occurrence of each), including the guarded "four"
  const intentHits = {};
  let item = null;
  for (let i = 0; i < tokens.length; i++) {
    for (const [intent, stems] of Object.entries(INTENTS)) {
      const m = firstMatch(tokens, i, stems);
      if (m) (intentHits[intent] ||= []).push(hit('want', intent, text, tokens, i, m.len));
    }
    if (isOven(tokens, i)) {
      (intentHits.equipment ||= []).push(hit('want', 'equipment', text, tokens, i, 1));
      item ||= 'oven';
    }
    if (!item) {
      for (const [name, stems] of Object.entries(ITEMS)) {
        if (firstMatch(tokens, i, stems)) { item = name; break; }
      }
    }
  }
  const intents = Object.keys(INTENTS)
    .filter((intent) => intentHits[intent])
    .map((intent) => {
      intentHits[intent].sort((a, b) => a.charRange[0] - b.charRange[0]);
      matches.push(...intentHits[intent]);
      return { ...intentHits[intent][0], words: intentHits[intent].map((h) => h.sourceWord) };
    });
  const hasEquipment = intents.some((x) => x.value === 'equipment');
  if (!hasEquipment) item = null;
  else item ||= 'equipment';

  // --- place: Rodrigues wins over the generic "Mauritius"
  let place = null;
  for (let i = 0; i < tokens.length && !place; i++) {
    for (const [phrase, name] of RODRIGUES) {
      const len = matchAt(tokens, i, phrase, true);
      if (len) { place = { ...hit('place', 'rod', text, tokens, i, len), town: name }; break; }
    }
  }
  for (let i = 0; i < tokens.length && !place; i++) {
    for (const [phrase, name] of MAURITIUS) {
      const len = matchAt(tokens, i, phrase, true);
      if (len) { place = { ...hit('place', 'mu', text, tokens, i, len), town: name }; break; }
    }
  }
  if (place) matches.push(place);

  // --- staff: "just me" phrases, or a number + staff word within 2 words
  let staff = null;
  for (let i = 0; i < tokens.length && !staff; i++) {
    const alone = firstMatch(tokens, i, ALONE);
    if (alone) { staff = hit('staff', 's0', text, tokens, i, alone.len); break; }
    const n = numberValue(tokens[i]);
    if (n === null) continue;
    for (let j = 1; j <= 2; j++) {
      const noun = tokens[i + j];
      if (noun && STAFF_NOUNS.some((s) => noun.t.startsWith(s))) {
        const value = n === 0 ? 's0' : n <= 5 ? 's1' : n <= 20 ? 's2' : n <= 50 ? 's3' : 's4';
        staff = hit('staff', value, text, tokens, i, j + 1);
        break;
      }
    }
  }
  if (staff) matches.push(staff);

  // --- age: "depi 5 an", "since 2019", "4 years old", then phrases
  let age = null;
  const ageBand = (years) => (years < 1 ? 'a1' : years <= 3 ? 'a2' : 'a3');
  for (let i = 0; i < tokens.length && !age; i++) {
    const tok = tokens[i];
    const n = numberValue(tokens[i + 1]);
    if (AGE_WORDS.includes(tok.t) && n !== null) {
      const isYear = /^\d{4}$/.test(tokens[i + 1].t) && n >= 1950 && n <= THIS_YEAR && tok.t !== 'for';
      if (isYear) age = hit('age', ageBand(THIS_YEAR - n), text, tokens, i, 2);
      else if (tokens[i + 2] && YEAR_WORDS.includes(tokens[i + 2].t)) age = hit('age', ageBand(n), text, tokens, i, 3);
    }
    const m = numberValue(tok);
    if (!age && m !== null && tokens[i + 1] && ['year', 'years'].includes(tokens[i + 1].t) && tokens[i + 2]?.t === 'old') {
      age = hit('age', ageBand(m), text, tokens, i, 3);
    }
  }
  for (let i = 0; i < tokens.length && !age; i++) {
    const a0 = firstMatch(tokens, i, NOT_STARTED);
    if (a0) { age = hit('age', 'a0', text, tokens, i, a0.len); break; }
  }
  for (let i = 0; i < tokens.length && !age; i++) {
    const a1 = firstMatch(tokens, i, JUST_STARTED);
    if (a1) { age = hit('age', 'a1', text, tokens, i, a1.len); break; }
  }
  // A start intent means "not started yet" unless an age was found.
  const start = intents.find((x) => x.value === 'start');
  if (!age && start) age = { ...start, category: 'age', value: 'a0' };
  if (age) matches.push(age);

  // --- amounts and their role (turnover / cost / none), from cues in the same sentence
  const sentences = sentenceRanges(text);
  const amounts = findAmounts(text).map((amount) => {
    const range = sentences.find(([s, e]) => amount.charRange[0] >= s && amount.charRange[0] < e) || [0, text.length];
    const sentenceText = text.slice(range[0], range[1]);
    const sentenceTokens = tokenize(sentenceText);
    let role = null;
    if (hasCue(sentenceTokens, TURNOVER_CUES) || /\bCA\b/.test(sentenceText)) role = 'turnover';
    else if (hasCue(sentenceTokens, COST_CUES) || hasEquipment) role = 'cost';
    return { category: 'amount', ...amount, role };
  });
  matches.push(...amounts);
  const cost = amounts.find((a) => a.role === 'cost') || null;
  const turnoverAmount = amounts.find((a) => a.role === 'turnover');
  const turnover = turnoverAmount ? { ...turnoverAmount, value: bandFor(turnoverAmount.value), amount: turnoverAmount.value } : null;

  matches.sort((a, b) => a.charRange[0] - b.charRange[0]);

  return {
    matches,
    sector: sectorResult,
    place,
    intents,
    item,
    amounts,
    cost,
    turnover,
    staff,
    age,
    found: matches.length > 0,
  };
}

// The five answers the reader can pre-select, with the word each came from.
// { sector: { value, word }, turnover: …, place: …, staff: …, age: … }
export function detectedAnswers(result) {
  const out = {};
  if (!result) return out;
  if (result.sector) out.sector = { value: result.sector.value, word: result.sector.sourceWord };
  if (result.turnover) out.turnover = { value: result.turnover.value, word: result.turnover.sourceWord };
  if (result.place) out.place = { value: result.place.value, word: result.place.sourceWord };
  if (result.staff) out.staff = { value: result.staff.value, word: result.staff.sourceWord };
  if (result.age) out.age = { value: result.age.value, word: result.age.sourceWord };
  return out;
}
