// Inline SVG icons: 24px grid, 1.75px stroke, round caps and joins, no fills
// (the stroke style is set once in css/app.css on .icon). Drawn for this app.
// Every icon is aria-hidden; the text next to it carries the meaning.

const PATHS = {
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8"/>',
  scan: '<path d="M3 5h12M3 10h7M3 15h5"/><circle cx="15.5" cy="15.5" r="4"/><path d="m18.5 18.5 3 3"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9"/>',
  'help-circle': '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.3-2.4 3.6M12 17h.01"/>',
  'minus-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  'alert-triangle': '<path d="M10.3 4 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4M12 17h.01"/>',
  megaphone: '<path d="m3 11 16-5v12L3 14v-3Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  'shield-check': '<path d="M12 3 4.5 6v6c0 4.6 3.2 7.8 7.5 9 4.3-1.2 7.5-4.4 7.5-9V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  'external-link': '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M16 3v4M8 3v4M3.5 10h17"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  'file-down': '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6M12 12v6M9 15l3 3 3-3"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  pencil: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="m15 5 4 4"/>',
  'cloud-off': '<path d="m3 3 18 18"/><path d="M6.3 6.3A6 6 0 0 0 8.5 18h8.8"/><path d="M20.6 16.3A4 4 0 0 0 17.5 10h-1.3a6 6 0 0 0-6.9-4.4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  // Sector tiles
  cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16c1.5 0 1.5-1.2 2.7-1.2s1.6 1.2 2.6 1.2 1.6-1.2 2.7-1.2 1.6 1.2 2.7 1.2 1.6-1.2 2.6-1.2S19 16 20 16"/><path d="M2 21h20M7 8v3M12 8v3M17 8v3M7 4h.01M12 4h.01M17 4h.01"/>',
  store: '<path d="M3.5 9 5 4h14l1.5 5"/><path d="M3.5 9a2.8 2.8 0 0 0 5.7 0 2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.7 0"/><path d="M5 11.5V20h14v-8.5M10 20v-5h4v5"/>',
  palm: '<path d="M12.5 21c0-4-.6-7.3-2-10"/><path d="M10.5 11C9.5 7.5 6.5 6 3 7.5"/><path d="M10.5 11c1.2-3.6 4.6-5 8-3.6"/><path d="M10.5 11c-3 0-5.5 1.6-6.5 4.5"/><path d="M10.5 11c3 .3 5.6 2.5 6.3 5.5"/><path d="M7 21h11"/>',
  hammer: '<path d="m14 12-8.5 8.5a2.1 2.1 0 0 1-3-3L11 9"/><path d="M15 15 9 9l3.5-3.5a5 5 0 0 1 7 0l.5.5-2 2 2 2-2 2"/>',
  sprout: '<path d="M7 20h10M12 20v-9"/><path d="M12 11C12 7.7 10 6 6 6c0 3.3 2 5 6 5Z"/><path d="M12 11c0-3.6 2-6 6-6 0 4-2 6-6 6Z"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19.5h20"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  truck: '<path d="M14 17V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1"/><path d="M14 17H9M19 17h2a1 1 0 0 0 1-1v-3.6a1 1 0 0 0-.2-.6l-3.5-4.4a1 1 0 0 0-.8-.4H14"/><circle cx="17" cy="17.5" r="2"/><circle cx="6.5" cy="17.5" r="2"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
};

// icon('scan') -> '<svg …>…</svg>' (a string, used inside HTML templates)
export function icon(name, extraClass = '') {
  return `<svg class="icon ${extraClass}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[name] || ''}</svg>`;
}

// The brand logo: the only filled mark. The Quote-pin: two camel drops forming a closing
// quotation mark (master files in ../logo/final/svg/).
export function logo(size = 28) {
  return `<svg class="logo" width="${size}" height="${size}" viewBox="97 79 236 236" aria-hidden="true" focusable="false">
    <path fill="#C0976A" d="M100.1 153.16C98.76 132.05 110.86 112.38 130.3 104.05C149.74 95.71 172.32 100.51 186.69 116.03C201.06 131.55 204.11 154.44 194.3 173.18L136.26 284.11C133.14 290.08 126.43 293.23 119.85 291.83C113.27 290.43 108.43 284.82 108 278.11ZM230.1 153.16C228.76 132.05 240.86 112.38 260.3 104.05C279.74 95.71 302.32 100.51 316.69 116.03C331.06 131.55 334.11 154.44 324.3 173.18L266.26 284.11C263.14 290.08 256.43 293.23 249.85 291.83C243.27 290.43 238.43 284.82 238 278.11Z"/>
  </svg>`;
}
