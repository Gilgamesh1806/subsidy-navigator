// Subsidy Navigator prototype: screens, navigation and state.
// Plain JavaScript modules, no framework. Everything runs on the phone;
// nothing is sent over the network.
//
// Screens: home -> q (steps 1–5) -> results -> detail -> draft.
// Every screen change is a history entry (history.pushState), so the Android
// back button and the browser back button move one step back.

import { t, tn, HTML_LANG, LANG_NAME } from './data/strings.js';
import { getItem, EDB_PORTAL } from './data/library.js';
import { read, detectedAnswers, formatRs } from './reader.js';
import { matchAll, checkItem, grant80, stageFor } from './rules.js';
import { buildDraft, exportText, costFieldKey } from './draft.js';
import { icon } from './icons.js';

// ------------------------------------------------------------------ state
// One object, mirrored to sessionStorage so a reload or a language switch
// never loses answers. (If storage is blocked, the app just works in memory.)
const STORE_KEY = 'subsidy-navigator-v1';
const EMPTY_ANSWERS = { sector: null, turnover: null, place: null, staff: null, age: null };

function freshState(lang = 'km') {
  return {
    lang,                          // km | fr | en (Kreol first)
    text: '',                      // the owner's sentence
    detected: null,                // keyword reader result, or null before "Read"
    answers: { ...EMPTY_ANSWERS }, // the five answers
    wasRead: false,                // the text was read, then edited
    draft: { edits: {} },          // what the user typed in the draft form
    matchesAt: null,               // when the results were last computed
  };
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (raw) return { ...freshState(), ...JSON.parse(raw) };
  } catch (err) { /* storage blocked: use memory */ }
  return freshState();
}

function save() {
  try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (err) { /* ignore */ }
}

let state = loadState();
let current = { screen: 'home', depth: 0 };   // the view on screen
let readingRun = null;                         // the reading animation while it plays
let installPrompt = null;                      // Chrome's "add to home screen" event
const ui = { error: false, tip: false, notice: false }; // Home messages (not saved)
let tipTimer = null;
let toastTimer = null;

// ------------------------------------------------------------------ helpers
const $ = (selector) => document.querySelector(selector);
const L = (key, vars) => t(state.lang, key, vars);
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const $screen = $('#screen');
const $bar = $('#bottombar');
const $live = $('#live');
const $toast = $('#toast');

// Escape text before putting it inside HTML.
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Say something to screen readers through the one polite live region.
function announce(text) {
  $live.textContent = '';
  setTimeout(() => { $live.textContent = text; }, 80);
}

function toast(text) {
  $toast.textContent = text;
  $toast.hidden = false;
  announce(text);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $toast.hidden = true; }, 3200);
}

// A short buzz on selection, where the phone supports it.
function buzz() {
  try { if (navigator.vibrate) navigator.vibrate(8); } catch (err) { /* ignore */ }
}

// "From «Rose-Hill»" with the word in a marker. The template string is ours
// (trusted); only the user's word is escaped.
function fromHtml(word) {
  return esc(L('q.from', { x: '%%' })).replace('%%', `<mark>${esc(word)}</mark>`);
}

function capitalise(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function firstSentence(text) {
  return text.split(/(?<=\.)\s/)[0];
}

// ------------------------------------------------------------------ questions
const QUESTIONS = [
  {
    key: 'sector', title: 'q1.title',
    values: ['food', 'retail', 'tourism', 'making', 'farming', 'it', 'beauty', 'transport', 'other'],
    label: (v) => 'sector.' + v, hint: (v) => 'hint.' + v,
    icons: { food: 'cake', retail: 'store', tourism: 'palm', making: 'hammer', farming: 'sprout', it: 'laptop', beauty: 'scissors', transport: 'truck', other: 'dots' },
  },
  { key: 'turnover', title: 'q2.title', help: 'q2.help', values: ['t0', 't1', 't2', 't3', 't4', 'tU'], label: (v) => 'turnover.' + v, hint: (v) => 'band.' + v },
  { key: 'place', title: 'q3.title', values: ['mu', 'rod'], label: (v) => 'place.' + v, hint: (v) => 'hint.' + v },
  { key: 'staff', title: 'q4.title', help: 'q4.help', values: ['s0', 's1', 's2', 's3', 's4'], label: (v) => 'staff.' + v },
  { key: 'age', title: 'q5.title', values: ['a0', 'a1', 'a2', 'a3'], label: (v) => 'age.' + v },
];

// A short label for an answer ("Food & drink", "1–5 staff").
function answerLabel(key, value = state.answers[key]) {
  if (!value) return '';
  if (key === 'staff') return L('staffChip.' + value);
  const q = QUESTIONS.find((x) => x.key === key);
  return L(q.label(value));
}

function intentValues() {
  return (state.detected?.intents || []).map((x) => x.value);
}

// Answers the reader pre-selected that the user has not changed.
function detectedNow() {
  const det = detectedAnswers(state.detected);
  const out = {};
  for (const key of Object.keys(det)) if (state.answers[key] === det[key].value) out[key] = det[key];
  return out;
}

// ------------------------------------------------------------------ navigation
function hashFor(view) {
  if (view.screen === 'q') return '#q' + view.step;
  if (view.screen === 'detail' || view.screen === 'draft') return `#${view.screen}-${view.id}`;
  return '#' + view.screen;
}

// Go forward to a new screen (adds a history entry).
function navigate(view) {
  history.replaceState({ ...history.state, scroll: $screen.scrollTop }, ''); // remember where we were
  const next = { ...view, depth: current.depth + 1 };
  history.pushState(next, '', hashFor(next));
  show(next, 'forward');
}

window.addEventListener('popstate', (event) => {
  const view = event.state || { screen: 'home', depth: 0 };
  show(view, view.depth < current.depth ? 'back' : 'forward');
});

// "Start again": clear everything and walk history back to the first entry
// (Home), so the Android back button then leaves the app.
function restart() {
  state = freshState(state.lang);
  save();
  if (current.depth > 0) history.go(-current.depth);
  else show({ screen: 'home', depth: 0 }, 'back');
}

// Render a view, with the slide transition when moving between screens.
function show(view, direction = 'none') {
  if (readingRun) finishReading(false);
  current = view;
  const update = () => {
    try { renderView(current); } catch (err) { showError(err); }
  };
  const after = () => {
    $screen.scrollTop = view.scroll || 0;
    if (direction !== 'none') {
      const h1 = $screen.querySelector('h1');
      if (h1) h1.focus({ preventScroll: true });
      announceArrival();
    }
  };

  if (direction === 'none') { update(); after(); return; }

  document.documentElement.dataset.nav = direction;
  if (document.startViewTransition) {
    const transition = document.startViewTransition(update);
    transition.updateCallbackDone.then(after, after);
  } else {
    update();
    $screen.classList.remove('enter-fwd', 'enter-back');
    void $screen.offsetWidth; // restart the CSS animation
    $screen.classList.add(direction === 'back' ? 'enter-back' : 'enter-fwd');
    after();
  }
}

function renderView(view) {
  // Results, detail and draft need all five answers; otherwise ask the first missing one.
  if (['results', 'detail', 'draft'].includes(view.screen)) {
    const missing = QUESTIONS.findIndex((q) => !state.answers[q.key]);
    if (missing >= 0) {
      view = { screen: 'q', step: missing + 1, depth: view.depth };
      history.replaceState(view, '', hashFor(view));
      current = view;
    }
  }
  document.body.dataset.screen = view.screen;
  $screen.classList.toggle('draft-screen', view.screen === 'draft');
  if (view.screen === 'q') renderQuestion(view.step, view.mode);
  else if (view.screen === 'results') renderResults();
  else if (view.screen === 'detail') renderDetail(view.id);
  else if (view.screen === 'draft') renderDraft(view.id);
  else renderHome();
}

// App bar: brand on Home, back button + title elsewhere. Also document.title.
function setAppBar(title, lang = '') {
  const home = current.screen === 'home';
  $('#btn-back').hidden = home;
  $('#brand').hidden = !home;
  const titleEl = $('#appbar-title');
  titleEl.hidden = home;
  titleEl.textContent = title || '';
  if (lang) titleEl.setAttribute('lang', lang);
  else titleEl.removeAttribute('lang');
  document.title = home ? 'Subsidy Navigator' : `${title} — Subsidy Navigator`;
}

// Live-region message when a screen opens.
function announceArrival() {
  if (current.screen === 'results') {
    const m = matchAll(state.answers, intentValues());
    const head = m.n ? tn(state.lang, 'res.headline', m.n) : L('noresult.title');
    announce(`${head}. ${tn(state.lang, 'res.obligCount', m.obligations.length)}`);
  } else if (current.screen === 'draft') {
    announce(L('draft.live', { x: getItem(current.id).name }));
  }
}

// ------------------------------------------------------------------ language
function applyLang() {
  document.documentElement.lang = HTML_LANG[state.lang];
  for (const radio of document.querySelectorAll('input[name="lang"]')) radio.checked = radio.value === state.lang;
  $('#lang-switch').setAttribute('aria-label', L('lang.label'));
  $('#btn-back').setAttribute('aria-label', L('back'));
  $('#offline-text').textContent = L('offline');
}

// Switching language re-renders the current screen in place. No transition,
// focus stays on the switcher, text and answers are kept.
$('#lang-switch').addEventListener('change', (event) => {
  if (event.target.name !== 'lang') return;
  if (readingRun) finishReading(false);
  state.lang = event.target.value;
  save();
  applyLang();
  const scroll = $screen.scrollTop;
  try { renderView(current); } catch (err) { showError(err); }
  $screen.scrollTop = scroll;
  announce(LANG_NAME[state.lang]);
});

// ------------------------------------------------------------------ offline
function updateOnline() {
  $('#offline-row').hidden = navigator.onLine;
}
window.addEventListener('online', updateOnline);
window.addEventListener('offline', updateOnline);

// ------------------------------------------------------------------ Home
function homeMode() {
  if (!state.detected) return 'compose';
  return state.detected.found ? 'detected' : 'nothing';
}

const EXAMPLES = [
  { lang: 'fr', text: 'Je veux ouvrir un salon de coiffure à Curepipe.' },
  { lang: 'en', text: 'I run a small fishing business in Rodrigues and want to export.' },
];

function renderHome() {
  setAppBar('');
  const mode = homeMode();
  $screen.innerHTML = `
    <div class="hero">
      <h1 class="display" id="home-title" tabindex="-1">${esc(L('home.title'))}</h1>
      <p class="hero-sub" id="home-sub">${esc(L('home.sub'))}</p>
      <p class="tagline" lang="mfe">${esc(L('tagline'))}</p>
    </div>
    <div class="card composer ${readingRun ? 'reading' : ''}" id="composer">
      ${mode === 'compose' ? composeHtml() : readHtml(mode)}
    </div>
    <div class="home-foot">
      <button type="button" class="install-chip pressable" data-action="install" ${installPrompt ? '' : 'hidden'}>${esc(L('install'))}</button>
      <p class="privacy caption">${icon('lock')}<span>${esc(L('privacy'))}</span></p>
      ${state.lang === 'km' ? `<p class="caption">${esc(L('km.prototype'))}</p>` : ''}
    </div>`;
  renderHomeBar(readingRun ? 'reading' : mode);
  if (mode === 'compose') updateMsgs();
}

function composeHtml() {
  return `
    <p class="label">${esc(L('home.examples'))}</p>
    <button type="button" class="persona pressable" data-action="persona">
      <span class="avatar" aria-hidden="true">MC</span>
      <span class="persona-text">
        <span class="persona-name">${esc(L('persona.name'))}</span>
        <span class="persona-meta">${esc(L('persona.meta'))}</span>
      </span>
      ${icon('arrow-right')}
    </button>
    <div class="examples">
      ${EXAMPLES.map((ex, i) => `<button type="button" class="ex-chip pressable" lang="${ex.lang}" data-action="example" data-i="${i}">${esc(ex.text)}</button>`).join('')}
    </div>
    <div class="input-wrap">
      <textarea id="composer-input" class="composer-input" rows="5" maxlength="400"
        aria-labelledby="home-title" aria-describedby="home-sub composer-msgs"
        placeholder="${esc(L('home.placeholder'))}">${esc(state.text)}</textarea>
      <button type="button" class="mic pressable" data-action="mic" aria-label="${esc(L('mic.label'))}">${icon('mic')}</button>
    </div>
    <div class="field-msgs" id="composer-msgs"></div>`;
}

// The text as a read-only block with markers, plus the "What we found" tray.
function readHtml(mode) {
  const d = state.detected;
  const chips = foundChips(d);
  const tray = mode === 'detected'
    ? `<ul class="fchips">${chips.map((c) => `<li class="fchip" data-cat="${c.cat}"><span class="cat">${esc(L('cat.' + c.cat))} ·</span> ${esc(c.text)}</li>`).join('')}</ul>
       <p class="caption">${esc(L('found.honest'))}</p>`
    : `<div class="nothing">${icon('scan')}<div><p class="nothing-title">${esc(L('nothing.title'))}</p><p>${esc(L('nothing.body'))}</p></div></div>`;
  return `
    <div class="readblock" id="readblock">${highlightHtml(state.text, d.matches, !readingRun)}</div>
    <section class="tray" aria-labelledby="tray-title">
      <div class="tray-head">
        <h2 id="tray-title">${esc(L('found.title'))}</h2>
        <button type="button" class="text-btn pressable" data-action="edit-text">${icon('pencil')}${esc(L('btn.edit'))}</button>
      </div>
      ${tray}
    </section>`;
}

// Chips for the tray: [{ cat, text, short }]. short is used in the live region.
function foundChips(d) {
  const chips = [];
  if (d.sector) chips.push({ cat: 'sector', text: L('sector.' + d.sector.value) });
  if (d.place) {
    const label = L('place.' + d.place.value);
    const same = d.place.sourceWord.toLowerCase().replace(/[^a-z]/g, '') === label.toLowerCase().replace(/[^a-z]/g, '');
    chips.push({ cat: 'place', text: same ? label : `${d.place.sourceWord} → ${label}`, short: label });
  }
  for (const intent of d.intents) chips.push({ cat: 'want', text: L('intent.' + intent.value) });
  for (const amount of d.amounts) {
    const money = formatRs(amount.value, state.lang);
    const text = amount.role === 'turnover' ? `${money} → ${L('turnover.' + d.turnover.value)}` : money;
    chips.push({ cat: 'amount', text, short: money });
  }
  if (d.staff) chips.push({ cat: 'staff', text: L('staffChip.' + d.staff.value) });
  if (d.age) chips.push({ cat: 'age', text: L('age.' + d.age.value) });
  return chips;
}

// Wrap the matched words in <mark> and every word in <span class="w">
// (the reading caret steps from word to word).
function highlightHtml(text, matches, on) {
  const ranges = [];
  for (const m of [...matches].sort((a, b) => a.charRange[0] - b.charRange[0])) {
    const [start, end] = m.charRange;
    const last = ranges[ranges.length - 1];
    if (last && start < last.end) {
      last.end = Math.max(last.end, end);
      last.cats.add(m.category);
    } else {
      ranges.push({ start, end, cats: new Set([m.category]) });
    }
  }
  const words = (part) => part.split(/(\s+)/).map((w) => (w === '' ? '' : /^\s+$/.test(w) ? esc(w) : `<span class="w">${esc(w)}</span>`)).join('');
  let html = '';
  let pos = 0;
  for (const r of ranges) {
    html += words(text.slice(pos, r.start));
    html += `<mark class="hl ${on ? 'on' : ''}" data-cats="${[...r.cats].join(' ')}">${words(text.slice(r.start, r.end))}</mark>`;
    pos = r.end;
  }
  return html + words(text.slice(pos));
}

function renderHomeBar(mode) {
  const arrow = icon('arrow-right');
  if (mode === 'reading') {
    $bar.innerHTML = `
      <button type="button" class="secondary pressable" data-action="skip-reading">${esc(L('btn.skip'))}</button>
      <button type="button" class="primary" id="btn-primary" aria-disabled="true"><span class="progress-line"></span>${esc(L('reading.status'))}</button>`;
  } else if (mode === 'compose') {
    $bar.innerHTML = `
      <button type="button" class="secondary pressable" data-action="skip-to-qs">${esc(L('btn.skipToQs'))}</button>
      <button type="button" class="primary pressable" id="btn-primary" data-action="read">${esc(L('btn.read'))}${arrow}</button>`;
  } else {
    const label = mode === 'detected' ? L('btn.continue') : L('btn.five');
    $bar.innerHTML = `<button type="button" class="primary pressable" id="btn-primary" data-action="to-q1">${esc(label)}${arrow}</button>`;
  }
}

// Error, edited notice, mic tip and the character counter under the textarea.
function updateMsgs() {
  const box = $('#composer-msgs');
  const input = $('#composer-input');
  if (!box || !input) return;
  let html = '';
  if (ui.error) html += `<p class="err">${icon('alert-triangle')}<span>${esc(L('err.empty'))}</span></p>`;
  if (ui.notice) html += `<p class="notice">${esc(L('edited.notice'))}</p>`;
  if (ui.tip) html += `<p class="tip">${esc(L('mic.tip'))}</p>`;
  if (input.value.length > 300) html += `<p class="caption counter">${esc(L('counter', { n: input.value.length }))}</p>`;
  box.innerHTML = html;
  input.setAttribute('aria-invalid', ui.error ? 'true' : 'false');
}

function fillText(text) {
  state.text = text;
  save();
  ui.error = false;
  const input = $('#composer-input');
  input.value = text;
  input.setSelectionRange(text.length, text.length); // caret at the end
  updateMsgs();
  $('#btn-primary').focus(); // focus "Read", so the keyboard does not open
}

function onRead() {
  if (state.text.replace(/\s/g, '').length < 3) {
    ui.error = true;
    updateMsgs();
    $('#composer-input').focus();
    announce(L('err.empty'));
    return;
  }
  ui.error = false;
  ui.notice = false;
  ui.tip = false;

  // Compute first (instant), then play the reading moment on top.
  const result = read(state.text);
  const det = detectedAnswers(result);
  for (const key of Object.keys(det)) state.answers[key] = det[key].value;
  state.detected = result;
  state.wasRead = false;
  save();

  readingRun = { timers: [], anims: [] };
  renderHome();
  announce(L('reading.status'));
  playReading();
}

// The signature moment: a caret runs under the words, matched words get a
// marker, then each chip travels from its word into the tray. ≤ 2 seconds.
// A tap anywhere (or Skip) finishes it at once.
function playReading() {
  const run = readingRun;
  const block = $('#readblock');
  const chips = [...document.querySelectorAll('.fchip')];
  const progress = $('#btn-primary .progress-line');
  $('[data-action="skip-reading"]')?.focus({ preventScroll: true });
  document.addEventListener('pointerdown', onTapToSkip, true);

  if (reduceMotion()) {
    // No caret, no flight: markers and chips fade in together.
    block.querySelectorAll('mark.hl').forEach((m) => m.classList.add('on'));
    run.timers.push(setTimeout(() => finishReading(true), 140));
    return;
  }

  const words = [...block.querySelectorAll('.w')];
  const step = Math.min(45, 1400 / Math.max(words.length, 1));
  const caretTime = words.length * step;
  const stagger = chips.length > 1 ? Math.max(0, Math.min(80, (2000 - caretTime - 260) / (chips.length - 1))) : 0;
  const total = caretTime + 260 + stagger * Math.max(chips.length - 1, 0);
  if (progress) run.anims.push(progress.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: total, fill: 'forwards' }));

  const caret = document.createElement('span');
  caret.className = 'caret';
  caret.setAttribute('aria-hidden', 'true');
  block.appendChild(caret);

  words.forEach((word, i) => {
    run.timers.push(setTimeout(() => {
      const box = block.getBoundingClientRect();
      const r = word.getBoundingClientRect();
      caret.style.left = `${r.left - box.left - block.clientLeft}px`;
      caret.style.top = `${r.bottom - box.top - block.clientTop}px`;
      caret.style.width = `${r.width}px`;
      word.closest('mark.hl')?.classList.add('on');
    }, i * step));
  });

  run.timers.push(setTimeout(() => {
    caret.remove();
    // FLIP: each chip starts on top of its word and moves to its place in the tray.
    chips.forEach((chip, i) => {
      const source = block.querySelector(`mark.hl[data-cats~="${chip.dataset.cat}"]`);
      const to = chip.getBoundingClientRect();
      const from = source ? source.getBoundingClientRect() : to;
      run.anims.push(chip.animate(
        [{ opacity: 0, transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(.92)` }, { opacity: 1, transform: 'none' }],
        { duration: 260, delay: i * stagger, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' },
      ));
    });
    run.timers.push(setTimeout(() => finishReading(true), 260 + stagger * Math.max(chips.length - 1, 0)));
  }, caretTime));
}

function onTapToSkip() {
  finishReading(true);
}

// End the reading moment and show the final state.
function finishReading(announceResult) {
  const run = readingRun;
  if (!run) return;
  readingRun = null;
  run.timers.forEach(clearTimeout);
  run.anims.forEach((a) => a.cancel());
  document.removeEventListener('pointerdown', onTapToSkip, true);
  if (current.screen !== 'home') return;

  document.querySelectorAll('#readblock mark.hl').forEach((m) => m.classList.add('on'));
  $('#readblock .caret')?.remove();
  $('#composer')?.classList.remove('reading');
  const mode = homeMode();
  renderHomeBar(mode);
  if (!document.activeElement || document.activeElement === document.body || !document.activeElement.isConnected) {
    $('#btn-primary').focus({ preventScroll: true });
  }
  if (announceResult) {
    const chips = foundChips(state.detected);
    announce(mode === 'detected'
      ? L('found.live', { n: chips.length, x: chips.map((c) => c.short || c.text).join(', ') })
      : `${L('nothing.title')}. ${L('nothing.body')}`);
  }
}

// "Edit": back to the textarea. Answers that came only from the reader are cleared.
function editText() {
  const det = detectedAnswers(state.detected);
  for (const key of Object.keys(det)) if (state.answers[key] === det[key].value) state.answers[key] = null;
  state.detected = null;
  state.wasRead = true;
  save();
  renderHome();
  $('#composer-input').focus();
}

// ------------------------------------------------------------------ Questions
function renderQuestion(step, mode) {
  const q = QUESTIONS[step - 1];
  const det = detectedAnswers(state.detected)[q.key];
  setAppBar(L('q.progress', { n: step }));

  const tiles = q.values.map((value, i) => {
    const isDet = det && det.value === value;
    const span = q.values.length % 2 === 1 && i === q.values.length - 1 ? 'span2' : '';
    const hint = q.hint ? L(q.hint(value)) : '';
    return `
      <label class="tile ${span}" ${isDet ? 'data-detected' : ''}>
        <input type="radio" name="answer" value="${value}" ${state.answers[q.key] === value ? 'checked' : ''}>
        ${isDet ? `<span class="det-badge" aria-hidden="true">${icon('scan')}${esc(L('q.detected'))}</span>` : ''}
        ${q.icons ? icon(q.icons[value]) : ''}
        <span class="tile-label">${esc(L(q.label(value)))}</span>
        ${hint ? `<span class="tile-hint">${esc(hint)}</span>` : ''}
        ${isDet ? `<span class="tile-from" aria-hidden="true">${fromHtml(det.word)}</span><span class="vh det-sr">, ${esc(L('q.detectedSr', { x: det.word }))}</span>` : ''}
        <span class="tile-check" aria-hidden="true">${icon('check')}</span>
      </label>`;
  }).join('');

  const strip = state.text.trim()
    ? `<button type="button" class="words-strip" data-action="toggle-strip" aria-expanded="false">
         <span class="strip-text"><strong>${esc(L('q.yourWords'))}:</strong> «${stripHtml()}»</span>${icon('chevron-down')}
       </button>`
    : '';

  $screen.innerHTML = `
    <div class="progress" id="progress" aria-hidden="true">${progressHtml(step)}</div>
    ${strip}
    <form class="q-form" novalidate>
      <fieldset class="q" role="radiogroup" aria-describedby="${q.help ? 'q-help ' : ''}q-err">
        <legend><h1 class="title" tabindex="-1">${esc(L(q.title))}</h1></legend>
        ${q.help ? `<p class="q-help" id="q-help">${esc(L(q.help))}</p>` : ''}
        <p class="err" id="q-err" hidden>${icon('alert-triangle')}<span>${esc(L('err.choose'))}</span></p>
        <div class="tiles">${tiles}</div>
      </fieldset>
    </form>`;

  const label = mode === 'edit' ? L('btn.backToResults') : step < 5 ? L('btn.next') : L('btn.results');
  $bar.innerHTML = `<button type="button" class="primary pressable" id="btn-primary" data-action="q-next">${esc(label)}${mode === 'edit' ? '' : icon('arrow-right')}</button>`;
}

// The user's words with the matched words marked (no word spans needed here).
function stripHtml() {
  if (!state.detected) return esc(state.text);
  return highlightHtml(state.text, state.detected.matches, true).replace(/<mark class="hl on"[^>]*>/g, '<mark>');
}

function progressHtml(step) {
  const det = detectedNow();
  return QUESTIONS.map((q, i) => {
    const n = i + 1;
    const cls = n < step ? 'done' : n === step ? 'current' : '';
    const seg = `<span class="seg ${cls} ${det[q.key] ? 'det' : ''}"></span>`;
    return i === 0 ? seg : `<span class="seg-join"></span>${seg}`;
  }).join('');
}

function onAnswerChange(input) {
  const q = QUESTIONS[current.step - 1];
  state.answers[q.key] = input.value;
  save();
  buzz();
  const err = $('#q-err');
  if (err) err.hidden = true;
  $('.q')?.removeAttribute('aria-invalid');
  $('#progress').innerHTML = progressHtml(current.step);
}

function onQuestionNext() {
  const q = QUESTIONS[current.step - 1];
  if (!state.answers[q.key]) {
    $('#q-err').hidden = false;
    $('.q').setAttribute('aria-invalid', 'true');
    $('.q input[type="radio"]').focus();
    announce(L('err.choose'));
    return;
  }
  if (current.mode === 'edit') history.back();
  else if (current.step < 5) navigate({ screen: 'q', step: current.step + 1 });
  else navigate({ screen: 'results' });
}

// ------------------------------------------------------------------ Results
function statusChip(status) {
  const icons = { confirmed: 'shield-check', unconfirmed: 'alert-triangle', announced: 'megaphone', closed: 'lock' };
  return `<span class="status st-${status}">${icon(icons[status])}${esc(L('status.' + status))}</span>`;
}

function typeTag(item) {
  return `<span class="type-tag">${item.type === 'obligation' ? icon('shield-check') : ''}${esc(L('type.' + item.type))}</span>`;
}

// The equipment item for "For your …" (oven, machine, …, or "project").
function itemName() {
  const item = state.detected?.item || 'project';
  return L('item.' + item);
}

function detectedCost() {
  return state.detected?.cost?.value || null;
}

// Personal amount line on a card (S1) or the leasing line (S5).
function personalLine(item) {
  const cost = detectedCost();
  if (!cost) return '';
  if (item.id === 'S1') {
    const g = grant80(cost);
    return `<p class="for-you">${esc(L('card.forYou', { item: itemName(), amount: formatRs(g.grant, state.lang) }))}</p>`;
  }
  if (item.id === 'S5' && intentValues().includes('equipment') && cost <= 5000000) {
    return `<p class="for-you">${esc(L('card.leasing', { amount: formatRs(cost, state.lang) }))}</p>`;
  }
  return '';
}

// Intents in the text that this item is relevant to ("Buy equipment").
function goalIntents(item) {
  return (state.detected?.intents || []).filter((x) => item.relevance[x.value]);
}

function cardHtml(r) {
  const item = r.item;
  let body;
  if (r.notYet) {
    body = `<p class="meta-line">${icon('minus-circle')}<span>${esc(L('card.notYet'))}</span></p>`;
  } else if (item.type === 'obligation') {
    const c = r.checks[0];
    body = c.result === 'unknown'
      ? `<p class="meta-line">${icon('help-circle')}<span>${esc(L('det.notChecked', { x: L('reason.' + c.reason) }))}</span></p>`
      : `<p class="meta-line">${icon('check-circle')}<span>${esc(L('card.applies', { x: L('rule.' + c.id) }))}</span></p>`;
    if (item.id === 'O1' && state.answers.age === 'a0') body += `<p class="meta-line">${icon('alert-triangle')}<span>${esc(L('o1.a0'))}</span></p>`;
  } else {
    const goals = goalIntents(item);
    body = `
      <p class="gives" lang="en">${esc(firstSentence(item.gives))}</p>
      ${personalLine(item)}
      <p class="meta-line">${icon('check-circle')}<span>${esc(L('card.rules', { k: r.passed, m: r.total }))}${r.unknown ? ' · ' + esc(L('card.notChecked', { u: r.unknown })) : ''}</span></p>
      ${goals.length ? `<p class="meta-line">${icon('target')}<span>${esc(L('det.goal', { x: goals.map((g) => L('intent.' + g.value)).join(', ') }))}</span></p>` : ''}`;
  }
  return `
    <a class="item-card" href="#detail-${item.id}" data-action="detail" data-id="${item.id}">
      <div class="card-top">${typeTag(item)}<span class="agency" lang="en">· ${esc(item.agency)}</span>${statusChip(item.status)}</div>
      <h3 class="card-title" lang="en">${esc(item.title)}</h3>
      ${body}
      ${icon('arrow-right', 'card-arrow')}
    </a>`;
}

function cardList(results, startIndex = 0, stagger = true) {
  return `<ul class="card-list ${stagger ? 'stagger' : ''}">${results.map((r, i) => `<li style="--i:${Math.min(startIndex + i, 5)}">${cardHtml(r)}</li>`).join('')}</ul>`;
}

function answerChips(extraClass = '') {
  return `<ul class="answer-chips ${extraClass}">${QUESTIONS.map((q, i) => {
    const value = state.answers[q.key];
    const text = q.key === 'turnover' && value === 'tU' ? `${L('cat.turnover')}: ${answerLabel(q.key)}` : answerLabel(q.key);
    return `<li><button type="button" class="answer-chip pressable" data-action="edit-q" data-step="${i + 1}">
      <span class="vh">${esc(L('btn.edit'))} — ${esc(L('cat.' + q.key))}: </span>${icon('pencil')}${esc(text)}</button></li>`;
  }).join('')}</ul>`;
}

function externalLink(url, text, label) {
  return `<a class="link-row" href="${esc(url)}" target="_blank" rel="noopener" data-external aria-label="${esc(label)}">${esc(text)}${icon('external-link')}</a>`;
}

function portalLink() {
  return externalLink(EDB_PORTAL, L('gap.portal'), `${L('gap.portal')} — ${L('det.linkLabel')}`);
}

function renderResults() {
  const m = matchAll(state.answers, intentValues());
  state.matchesAt = Date.now();
  save();
  setAppBar(L('res.title'));
  const kmNote = state.lang === 'km' ? `<p class="caption km-note">${esc(L('km.prototype'))}</p>` : '';

  if (m.n === 0) {
    // No-results state: honest, with the verified EDB portal link.
    $screen.innerHTML = `
      <section class="noresult">
        ${icon('help-circle', 'icon-lg')}
        <h1 class="display" tabindex="-1">${esc(L('noresult.title'))}</h1>
        <p>${esc(L('noresult.body'))}</p>
        ${portalLink()}
        <p class="caption">${esc(L('gap.noLink'))}</p>
      </section>
      <section class="your-answers"><h2>${esc(L('res.yourAnswers'))}</h2>${answerChips('light-chips')}</section>
      <div class="route">
        <h2 class="sec-title">${esc(L('res.oblig'))}</h2>
        ${cardList(m.obligations)}
      </div>
      ${kmNote}`;
    $bar.innerHTML = `
      <button type="button" class="secondary pressable" data-action="restart">${icon('rotate-ccw')}${esc(L('btn.restart'))}</button>
      <button type="button" class="primary pressable" data-action="change-answers">${esc(L('btn.changeAnswers'))}${icon('arrow-right')}</button>`;
    return;
  }

  $screen.innerHTML = `
    <section class="res-band">
      <h1 class="display" tabindex="-1">${esc(tn(state.lang, 'res.headline', m.n))}</h1>
      <p class="res-sub">${esc(L('res.sub'))}</p>
      ${answerChips()}
    </section>
    <div class="route">
      <h2 class="sec-title">${esc(L('res.best'))}</h2>
      ${cardList(m.best)}
      <h2 class="sec-title">${esc(L('res.oblig'))}</h2>
      ${cardList(m.obligations, m.best.length)}
      ${m.also.length ? `
        <details class="more">
          <summary>${esc(L('res.more', { n: m.also.length }))}${icon('chevron-down')}</summary>
          ${cardList(m.also, 0, false)}
        </details>` : ''}
      <section class="card gap-card" aria-labelledby="gap-title">
        <h2 id="gap-title">${esc(L('gap.title'))}</h2>
        <p>${esc(L('gap.body'))}</p>
        ${portalLink()}
        <p class="caption">${esc(L('gap.noLink'))}</p>
      </section>
    </div>
    ${kmNote}`;
  $bar.innerHTML = `<button type="button" class="primary pressable" data-action="draft" data-id="${m.best[0].item.id}">${esc(L('btn.draft'))}${icon('arrow-right')}</button>`;
}

// ------------------------------------------------------------------ Detail
function saidLine(uses) {
  const det = detectedNow();
  const parts = uses.filter((key) => state.answers[key]).map((key) => {
    const from = det[key] ? ` · ${fromHtml(det[key].word)}` : '';
    return esc(answerLabel(key)) + from;
  });
  if (!parts.length) return '';
  return `<span class="said">${esc(L('det.youSaid', { x: '%%' })).replace('%%', parts.join(' · '))}</span>`;
}

function ruleText(id) {
  return id === 'stage' ? L('rule.stage', { x: L('stage.' + stageFor(state.answers.age)) }) : L('rule.' + id);
}

function whyRows(r) {
  const rows = r.checks.map((c) => {
    if (c.result === 'pass') {
      return `<li class="why-row why-pass">${icon('check-circle')}<div><p class="rule-text">${esc(ruleText(c.id))}</p>${saidLine(c.uses)}</div></li>`;
    }
    if (c.result === 'unknown') {
      return `<li class="why-row why-unknown">${icon('help-circle')}<div><p class="rule-text">${esc(L('det.notChecked', { x: ruleText(c.id) }))}</p><span class="said">${esc(capitalise(L('reason.' + c.reason)))}</span></div></li>`;
    }
    return `<li class="why-row why-notyet">${icon('minus-circle')}<div><p class="rule-text">${esc(L('det.notYet', { x: ruleText(c.id) }))}</p>${saidLine(c.uses)}</div></li>`;
  });
  const goals = goalIntents(r.item);
  if (goals.length) {
    const words = goals.flatMap((g) => g.words);
    rows.push(`<li class="why-row why-goal">${icon('target')}<div><p class="rule-text">${esc(L('det.goal', { x: goals.map((g) => L('intent.' + g.value)).join(', ') }))}</p><span class="said">${fromHtml(words.join(', '))}</span></div></li>`);
  }
  return rows.join('');
}

function sourceLink(url) {
  const domain = new URL(url).hostname.replace(/^www\./, '');
  return externalLink(url, domain, `${L('det.linkLabel')}: ${domain}`);
}

function renderDetail(id) {
  const item = getItem(id);
  const r = { ...checkItem(item, state.answers) };
  setAppBar(item.title, 'en'); // scheme names stay in English

  let personal = '';
  const cost = detectedCost();
  if (item.id === 'S1' && cost) {
    personal = `<p class="amount-label">${esc(L('det.forYouLabel', { item: itemName(), cost: formatRs(cost, state.lang) }))}</p>
      <p class="amount">${esc(L('det.upTo', { amount: formatRs(grant80(cost).grant, state.lang) }))}</p>`;
  } else if (item.id === 'S5' && cost && intentValues().includes('equipment') && cost <= 5000000) {
    personal = `<p class="amount-label">${esc(L('card.leasing', { amount: formatRs(cost, state.lang) }))}</p>`;
  } else if (item.id === 'O1' && state.answers.age === 'a0') {
    personal = `<p class="amount-label">${esc(L('o1.a0'))}</p>`;
  }

  const reported = item.quoteKind === 'reported';
  $screen.innerHTML = `
    <article class="detail">
      <div class="card-top">${typeTag(item)}<span class="agency" lang="en">· ${esc(item.agency)}</span></div>
      <h1 class="title" tabindex="-1" lang="en">${esc(item.name)}</h1>
      ${statusChip(item.status)}
      ${item.statusNote ? `<p class="status-note" lang="en">${esc(item.statusNote)}</p>` : ''}
      <section class="card gives-box">
        <h2 class="box-title">${esc(L('det.gives'))}</h2>
        <p lang="en">${esc(item.gives)}</p>
        ${personal}
      </section>
      <h2 class="det-h2">${esc(L('det.why'))}</h2>
      <ul class="why-list">${whyRows(r)}</ul>
      <h2 class="det-h2">${esc(L(reported ? 'det.ruleReported' : 'det.rule'))}</h2>
      <blockquote class="quote" lang="en">“${esc(item.quote)}”</blockquote>
      <p class="caption quote-note">${reported ? `${esc(item.quoteBy)} · ${esc(L('det.secondary'))}` : esc(L('det.quoteNote'))}${item.quoteRef ? ` (${esc(item.quoteRef)})` : ''}</p>
      <h2 class="det-h2">${esc(L('det.source'))}</h2>
      <div class="source-list">${item.sources.map(sourceLink).join('')}</div>
      <p class="caption checked">${icon('calendar')}<span>${esc(L('det.checked'))}</span></p>
    </article>`;

  const open = item.draft && (item.status === 'confirmed' || item.status === 'unconfirmed');
  if (open) {
    $bar.innerHTML = `<button type="button" class="primary pressable" data-action="draft" data-id="${item.id}">${esc(L('btn.draft'))}${icon('arrow-right')}</button>`;
  } else if (item.status === 'closed') {
    $bar.innerHTML = `
      <a class="secondary" href="${esc(item.sources[0])}" target="_blank" rel="noopener" data-external>${esc(L('det.openSource'))}${icon('external-link')}</a>
      <p class="closed-bar">${icon('lock')}${esc(L('det.closedCta'))}</p>`;
  } else {
    $bar.innerHTML = `<button type="button" class="primary pressable" data-action="back">${esc(L('btn.backToResults'))}</button>`;
  }
}

// ------------------------------------------------------------------ Draft
function draftOptions(id) {
  const m = matchAll(state.answers, intentValues());
  const options = m.best.map((r) => r.item).filter((item) => item.draft);
  if (!options.some((item) => item.id === id)) options.push(getItem(id));
  return options;
}

function currentDraft() {
  return buildDraft({ lang: state.lang, answers: state.answers, reading: state.detected, schemeId: current.id, edits: state.draft.edits });
}

function fieldHtml(f, formLang) {
  const id = 'f-' + f.key.replace('.', '-');
  const described = [`${id}-tag`, f.working ? `${id}-work` : '', f.hint ? `${id}-hint` : ''].filter(Boolean).join(' ');
  const common = `id="${id}" class="fld" data-field="${f.key}" lang="${formLang}" aria-describedby="${described}"`;
  const control = f.multiline
    ? `<textarea ${common} rows="3">${esc(f.value)}</textarea>`
    : `<input ${common} type="text" value="${esc(f.value)}" ${f.readonly ? 'readonly' : ''} ${f.isCost ? 'inputmode="decimal"' : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}>`;
  return `
    <div class="field">
      <div class="field-head"><label for="${id}">${esc(f.label)}</label><span class="ptag" id="${id}-tag">${esc(L('tag.' + f.tag))}</span></div>
      ${control}
      ${f.working ? `<p class="caption working" id="${id}-work" data-work="${f.key}" lang="${formLang}">${esc(f.working)}</p>` : ''}
      ${f.hint ? `<p class="caption fld-hint" id="${id}-hint">${esc(f.hint)}</p>` : ''}
    </div>`;
}

function sheetHtml(d) {
  return `
    <div class="watermark" aria-hidden="true">${esc(t(d.formLang, 'export.watermark'))}</div>
    <h1 class="title" tabindex="-1" lang="en">${esc(d.scheme.name)}</h1>
    <h2 class="part-title fieldset-gap">${esc(L('draft.partA'))}</h2>
    ${d.partA.map((f) => fieldHtml(f, d.formLang)).join('')}
    <h2 class="part-title fieldset-gap">${esc(L('draft.partB'))}</h2>
    ${d.partB.map((f) => fieldHtml(f, d.formLang)).join('')}
    <h2 class="part-title fieldset-gap">${esc(L('draft.ask'))}</h2>
    <ul class="ask-list">${d.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>`;
}

function renderDraft(id) {
  const item = getItem(id);
  if (!item || !item.draft) { history.back(); return; }
  setAppBar(L('draft.title'));
  const d = currentDraft();
  const options = draftOptions(id);

  $screen.innerHTML = `
    <div class="draft-banner" role="note">${icon('alert-triangle')}<div><strong>${esc(L('draft.banner'))}</strong>${esc(L('draft.bannerBody'))}</div></div>
    <fieldset class="switcher">
      <legend>${esc(L('draft.for'))}</legend>
      <div class="rchips">${options.map((o) => `
        <label class="rchip"><input type="radio" name="scheme" value="${o.id}" ${o.id === id ? 'checked' : ''}>${icon('check')}<span lang="en">${esc(o.title)}</span></label>`).join('')}
      </div>
    </fieldset>
    ${state.lang === 'km' ? `<p class="caption lang-note">${esc(L('draft.langNote'))}</p>` : ''}
    <form class="card sheet" id="sheet" autocomplete="off" novalidate>${sheetHtml(d)}</form>
    <div class="copy-box" id="copy-box" hidden>
      <label class="label" for="copy-text">${esc(L('draft.copyBox'))}</label>
      <textarea id="copy-text" class="fld" readonly></textarea>
    </div>`;

  // Share only where the phone supports it, so there is never a dead button.
  const canShare = typeof navigator.share === 'function';
  $bar.innerHTML = `
    <div class="actions3" style="--cols:${canShare ? 3 : 2}">
      <button type="button" class="act act-main pressable" data-action="copy">${icon('copy')}${esc(L('btn.copy'))}</button>
      ${canShare ? `<button type="button" class="act pressable" data-action="share">${icon('share')}${esc(L('btn.share'))}</button>` : ''}
      <button type="button" class="act pressable" data-action="pdf">${icon('file-down')}${esc(L('btn.pdf'))}</button>
    </div>
    <p class="caption pdf-hint">${esc(L('draft.pdfHint'))}</p>`;
}

function onSchemeChange(input) {
  const view = { ...current, id: input.value };
  current = view;
  history.replaceState(view, '', hashFor(view));
  buzz();
  $('#sheet').innerHTML = sheetHtml(currentDraft());
}

// Typing in a draft field: keep the edit; a cost change recomputes the
// calculated fields live (without re-rendering, so focus stays put).
function onDraftInput(input) {
  state.draft.edits[input.dataset.field] = input.value;
  save();
  if (input.dataset.field !== costFieldKey(current.id)) return;
  const d = currentDraft();
  for (const f of d.partB.filter((x) => x.tag === 'calc')) {
    const el = document.querySelector(`[data-field="${f.key}"]`);
    if (el) el.value = f.value;
    const work = document.querySelector(`[data-work="${f.key}"]`);
    if (work) work.textContent = f.working;
  }
}

async function copyDraft() {
  const text = exportText(currentDraft());
  try {
    await navigator.clipboard.writeText(text);
    toast(L('toast.copied'));
  } catch (err) {
    toast(L('toast.copyFail'));
    $('#copy-box').hidden = false;
    const box = $('#copy-text');
    box.value = text;
    box.focus();
    box.select();
  }
}

async function shareDraft() {
  const d = currentDraft();
  try {
    await navigator.share({ title: `Subsidy Navigator — ${d.scheme.name}`, text: exportText(d) });
  } catch (err) {
    if (err.name !== 'AbortError') copyDraft();
  }
}

// "Save as PDF": build a print-only copy in the form language, then print.
// thead/tfoot repeat on every printed page (header + source footer).
function printDraft() {
  const d = currentDraft();
  const f = d.formLang;
  const fillIn = t(f, 'export.fillIn');
  const rows = (fields) => fields.map((x) => {
    const value = String(x.value || '').trim();
    const shown = !value ? fillIn : x.tag === 'calc' ? `${value} (${x.note})` : value;
    return `<dt>${esc(x.exportLabel)}</dt><dd>${esc(shown)}</dd>`;
  }).join('');
  $('#print-sheet').innerHTML = `
    <div class="print-watermark" aria-hidden="true">${esc(t(f, 'export.watermark'))}</div>
    <table class="print-table" lang="${f}">
      <thead><tr><td>${esc(t(f, 'export.header'))}</td></tr></thead>
      <tfoot><tr><td>${esc(t(f, 'export.source'))}: ${esc(d.scheme.sources[0])} · ${esc(t(f, 'export.checked'))}</td></tr></tfoot>
      <tbody><tr><td>
        <h1>${esc(d.scheme.name)}</h1>
        <h2>${esc(t(f, 'export.partA'))}</h2><dl>${rows(d.partA)}</dl>
        <h2>${esc(t(f, 'export.partB'))}</h2><dl>${rows(d.partB)}</dl>
        <h2>${esc(t(f, 'export.partC'))}</h2><ul>${d.exportQuestions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
        <p><strong>${esc(t(f, 'export.footer'))}</strong></p>
      </td></tr></tbody>
    </table>`;
  window.print();
}

// ------------------------------------------------------------------ errors
function showError(err) {
  console.error(err);
  try {
    $screen.innerHTML = `<section class="card error-card"><h1 class="title" tabindex="-1">${esc(L('err.generic'))}</h1></section>`;
    $bar.innerHTML = `
      <button type="button" class="secondary pressable" data-action="restart">${icon('rotate-ccw')}${esc(L('btn.restart'))}</button>
      <button type="button" class="primary pressable" data-action="retry">${esc(L('err.retry'))}</button>`;
  } catch (inner) {
    console.error(inner);
  }
}
window.addEventListener('error', (event) => showError(event.error || event.message));
window.addEventListener('unhandledrejection', (event) => showError(event.reason));

// ------------------------------------------------------------------ events
document.addEventListener('click', (event) => {
  // Source links need the internet; offline we say so instead of failing.
  const external = event.target.closest('a[data-external]');
  if (external && !navigator.onLine) {
    event.preventDefault();
    toast(L('toast.offlineLink'));
    return;
  }

  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case 'persona': fillText(L('persona.text')); break;
    case 'example': fillText(EXAMPLES[Number(el.dataset.i)].text); break;
    case 'mic': {
      const input = $('#composer-input');
      input.focus(); // opens the keyboard, which has its own mic
      ui.tip = true;
      updateMsgs();
      announce(L('mic.tip'));
      clearTimeout(tipTimer);
      tipTimer = setTimeout(() => { ui.tip = false; updateMsgs(); }, 6000);
      break;
    }
    case 'read': onRead(); break;
    case 'skip-reading': finishReading(true); break;
    case 'skip-to-qs':
    case 'to-q1': navigate({ screen: 'q', step: 1 }); break;
    case 'edit-text': editText(); break;
    case 'install':
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt = null;
        el.hidden = true;
      }
      break;
    case 'toggle-strip': el.setAttribute('aria-expanded', el.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'); break;
    case 'q-next': onQuestionNext(); break;
    case 'edit-q': navigate({ screen: 'q', step: Number(el.dataset.step), mode: 'edit' }); break;
    case 'change-answers': navigate({ screen: 'q', step: 1, mode: 'edit' }); break;
    case 'detail': event.preventDefault(); navigate({ screen: 'detail', id: el.dataset.id }); break;
    case 'draft': navigate({ screen: 'draft', id: el.dataset.id }); break;
    case 'back': history.back(); break;
    case 'restart': restart(); break;
    case 'retry': state = loadState(); show(current, 'none'); break;
    case 'copy': copyDraft(); break;
    case 'share': shareDraft(); break;
    case 'pdf': printDraft(); break;
    default: break;
  }
});

$('#btn-back').addEventListener('click', () => history.back());

document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'composer-input') {
    state.text = el.value;
    save();
    if (state.wasRead) ui.notice = true;
    if (ui.error && el.value.replace(/\s/g, '').length >= 3) ui.error = false;
    ui.tip = false;
    updateMsgs();
  } else if (el.dataset.field) {
    onDraftInput(el);
  }
});

document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.name === 'answer') onAnswerChange(el);
  else if (el.name === 'scheme') onSchemeChange(el);
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault(); // show our own small chip instead of Chrome's banner
  installPrompt = event;
  const chip = document.querySelector('[data-action="install"]');
  if (chip) chip.hidden = false;
});

// ------------------------------------------------------------------ boot
function boot() {
  applyLang();
  updateOnline();
  let view = history.state;
  if (!view || !view.screen) {
    view = { screen: 'home', depth: 0 };
    history.replaceState(view, '', location.pathname + location.search);
  }
  current = view;
  show(view, 'none');

  // Service worker: caches the app so it works offline after the first load.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch((err) => console.warn('Service worker not registered:', err));
  }
}

boot();
