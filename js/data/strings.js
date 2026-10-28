// All interface copy in Kreol Morisien (km), French (fr) and English (en).
// Source: UX_SPEC.md section 3 (copy) and 4.2 (rule rows).
//
// Kreol review: every KM string needs a native speaker's review, except the
// ones marked "✓" (taken from research/deck at medium+ confidence).
// Strings marked "added" are NOT in the spec copy table: the developer wrote
// them because the spec describes the behaviour but gives no wording.
// The team should review those in all three languages.
//
// Placeholders: {n}, {x}, {k}, {m}, {u}, {item}, {amount}, {cost} are filled in by t().

export const LANGS = ['km', 'fr', 'en'];

// Value for <html lang>. mfe = ISO 639-3 code for Kreol Morisien.
export const HTML_LANG = { km: 'mfe', fr: 'fr', en: 'en' };

// Each language names itself (used for aria-label and the live region).
export const LANG_NAME = { km: 'Kreol Morisien', fr: 'Français', en: 'English' };

export const STRINGS = {
  // ---------------------------------------------------------- 3.1 Shell, Home, reader
  'app.name': { km: 'Subsidy Navigator', fr: 'Subsidy Navigator', en: 'Subsidy Navigator' },
  'tagline': { km: 'Ou biznes. Ou lang. Ou sipor.', fr: 'Ou biznes. Ou lang. Ou sipor.', en: 'Ou biznes. Ou lang. Ou sipor.' }, // ✓ brand, KM everywhere
  'lang.label': { km: 'Lang', fr: 'Langue', en: 'Language' }, // ✓
  'offline': { km: 'Offline — li marse mem', fr: 'Hors ligne — ça marche quand même', en: 'Offline — still works' },
  'home.title': { km: 'Dekrir ou biznes', fr: 'Décrivez votre entreprise', en: 'Describe your business' }, // ✓
  'home.sub': {
    km: 'Ekrir enn ou de fraz, dan Kreol, Franse ouswa Angle.',
    fr: 'Écrivez une ou deux phrases, en kreol, français ou anglais.',
    en: 'Write one or two sentences, in Kreol, French or English.',
  },
  'home.examples': { km: 'Esey enn egzanp', fr: 'Essayez un exemple', en: 'Try an example' },
  'persona.name': { km: 'Marie-Claire', fr: 'Marie-Claire', en: 'Marie-Claire' },
  'persona.meta': { km: 'patisri · Rose-Hill', fr: 'pâtisserie · Rose-Hill', en: 'pastry shop · Rose-Hill' },
  'persona.text': {
    // KM: first two sentences ✓, third sentence needs review.
    km: 'Mo ena enn ti boutik patisri dan Rose-Hill. Mo anvi aste enn nouvo four. Li kout Rs 180,000.',
    fr: "J'ai une petite pâtisserie à Rose-Hill. Je veux acheter un nouveau four. Il coûte Rs 180 000.",
    en: 'I have a small pastry shop in Rose-Hill. I want to buy a new oven. It costs Rs 180,000.',
  },
  'home.placeholder': {
    km: 'Egzanp: Mo ena enn ti restoran dan Port-Louis…',
    fr: "Ex. : J'ai un petit restaurant à Port-Louis…",
    en: 'e.g. I have a small restaurant in Port-Louis…',
  },
  'mic.label': { km: 'Koz olie ekrir', fr: "Parler au lieu d'écrire", en: 'Speak instead of typing' },
  'mic.tip': {
    km: 'Tap mikro lor ou klavie pou koze. Sa app la pa anrezistre ou lavwa.',
    fr: "Touchez le micro de votre clavier pour dicter. Cette app n'enregistre pas votre voix.",
    en: 'Tap the mic on your keyboard to speak. This app does not record your voice.',
  },
  'privacy': {
    km: 'Pa bizin login. Nanye pa kit ou telefonn.',
    fr: 'Pas de compte. Rien ne quitte votre téléphone.',
    en: 'No login. Nothing leaves your phone.',
  },
  'btn.read': { km: 'Lir mo biznes', fr: 'Lire ma description', en: 'Read my words' },
  'btn.skipToQs': { km: 'Reponn kestion direk', fr: 'Répondre directement aux questions', en: 'Answer the questions instead' },
  'reading.status': { km: 'Nou pe lir ou bann mo…', fr: 'Lecture de vos mots…', en: 'Reading your words…' },
  'btn.skip': { km: 'Sote', fr: 'Passer', en: 'Skip' },
  'found.title': { km: 'Seki nou finn trouve', fr: 'Ce que nous avons repéré', en: 'What we found' },
  'cat.sector': { km: 'Sekter', fr: 'Secteur', en: 'Sector' },
  'cat.place': { km: 'Landrwa', fr: 'Lieu', en: 'Place' },
  'cat.want': { km: 'Ou anvi', fr: 'Vous voulez', en: 'You want' },
  'cat.amount': { km: 'Montan', fr: 'Montant', en: 'Amount' },
  'cat.staff': { km: 'Dimounn', fr: 'Personnel', en: 'Staff' },
  'cat.age': { km: 'Laz biznes', fr: 'Âge', en: 'Age' },
  'cat.turnover': { km: 'Sifer dafer', fr: "Chiffre d'affaires", en: 'Turnover' }, // added
  'found.honest': {
    km: 'Sa enn lekter mo-kle, pa AI. Verifye ou repons dan prosenn etap.',
    fr: "C'est un lecteur de mots-clés, pas une IA. Vérifiez vos réponses à l'étape suivante.",
    en: 'This is a keyword reader, not AI. Check your answers in the next step.',
  },
  'found.live': { km: 'Nou finn trouv {n} zafer: {x}.', fr: '{n} éléments repérés : {x}.', en: 'Found {n} things: {x}.' }, // added
  'nothing.title': { km: 'Nou pa finn trouv okenn mo-kle', fr: 'Aucun mot-clé repéré', en: "We didn't spot any keywords" },
  'nothing.body': { km: 'Pa grav. Reponn 5 kestion kourt.', fr: 'Pas grave. Répondez à 5 questions courtes.', en: 'No problem. Answer 5 short questions.' },
  'btn.five': { km: 'Reponn 5 kestion', fr: 'Répondre à 5 questions', en: 'Answer 5 questions' },
  'btn.continue': { km: 'Kontinie', fr: 'Continuer', en: 'Continue' },
  'btn.edit': { km: 'Modifye', fr: 'Modifier', en: 'Edit' },
  'edited.notice': { km: 'Ou finn sanz ou fraz. Lir li ankor.', fr: 'Vous avez modifié le texte. Relisez-le.', en: 'You changed your text. Read it again.' },
  'err.empty': {
    km: 'Ekrir enn fraz avan, ouswa esey enn egzanp.',
    fr: "Écrivez d'abord une phrase, ou essayez un exemple.",
    en: 'Write a sentence first, or try an example.',
  },
  'install': { km: 'Met li lor ekran telefonn', fr: "Ajouter à l'écran d'accueil", en: 'Add to home screen' },
  'km.prototype': { km: 'Tradiksion Kreol prototip — pe atann revizion.', fr: '', en: '' },
  'counter': { km: '{n} / 400', fr: '{n} / 400', en: '{n} / 400' },

  // Intent values (what the owner wants to do)
  'intent.equipment': { km: 'Aste ekipman', fr: 'Acheter un équipement', en: 'Buy equipment' },
  'intent.loan': { km: 'Prete larzan', fr: 'Emprunter', en: 'Borrow money' },
  'intent.marketing': { km: 'Fer piblisite', fr: 'Faire de la publicité', en: 'Marketing' },
  'intent.export': { km: 'Eksporte', fr: 'Exporter', en: 'Export' },
  'intent.hire': { km: 'Anbos dimounn', fr: 'Embaucher', en: 'Hire staff' },
  'intent.register': { km: 'Anrezistre biznes', fr: "Enregistrer l'entreprise", en: 'Register' },
  'intent.start': { km: 'Koumans enn biznes', fr: 'Créer une entreprise', en: 'Start a business' },

  // Equipment item names, used in "For your {item}". added (KM/FR from the lexicon)
  'item.oven': { km: 'four', fr: 'four', en: 'oven' },
  'item.machine': { km: 'masinn', fr: 'machine', en: 'machine' },
  'item.fridge': { km: 'frizider', fr: 'réfrigérateur', en: 'fridge' },
  'item.computer': { km: 'lordinater', fr: 'ordinateur', en: 'computer' },
  'item.truck': { km: 'kamion', fr: 'camion', en: 'truck' },
  'item.equipment': { km: 'ekipman', fr: 'équipement', en: 'equipment' },
  'item.project': { km: 'proze', fr: 'projet', en: 'project' },

  // ---------------------------------------------------------- 3.2 Questions
  'q.progress': { km: 'Kestion {n} lor 5', fr: 'Question {n} sur 5', en: 'Question {n} of 5' },
  'q.yourWords': { km: 'Ou finn ekrir', fr: 'Vous avez écrit', en: 'You wrote' },
  'q.detected': { km: 'Detekte', fr: 'Repéré', en: 'Detected' },
  'q.from': { km: 'Dapre «{x}»', fr: "D'après « {x} »", en: 'From "{x}"' },
  'q.detectedSr': { km: 'detekte dan ou bann mo: {x}', fr: 'repéré dans vos mots : {x}', en: 'detected from your words: {x}' }, // added
  'q1.title': { km: 'Ki sekter ou biznes?', fr: 'Quel est votre secteur ?', en: 'What is your sector?' },
  'q2.title': { km: 'Ki sifer dafer par an?', fr: "Chiffre d'affaires annuel ?", en: 'Yearly turnover?' },
  'q2.help': {
    km: 'Tou seki ou vann dan enn lane, avan depans. M = milyon.',
    fr: 'Toutes vos ventes sur un an, avant dépenses. M = million.',
    en: 'Everything you sell in a year, before costs. M = million.',
  },
  'q3.title': { km: 'Kot biznes la ete?', fr: "Où se situe l'entreprise ?", en: 'Where is the business?' },
  'q4.title': { km: 'Konbien dimounn travay ladan?', fr: 'Combien de personnes employez-vous ?', en: 'How many people work for you?' },
  'q4.help': { km: 'San konte ou.', fr: 'Sans vous compter.', en: 'Not counting you.' },
  'q5.title': { km: 'Depi kan biznes la egziste?', fr: "Depuis quand l'entreprise existe-t-elle ?", en: 'How old is the business?' },

  // Sector tiles + hint line (hints: added, built from the keyword lexicon)
  'sector.food': { km: 'Manze ek bwar', fr: 'Alimentation', en: 'Food & drink' },
  'sector.retail': { km: 'Boutik ek komers', fr: 'Commerce', en: 'Shop & retail' },
  'sector.tourism': { km: 'Touris ek lotel', fr: 'Tourisme', en: 'Tourism' },
  'sector.making': { km: 'Fabrikasion ek artizana', fr: 'Fabrication et artisanat', en: 'Making & crafts' },
  'sector.farming': { km: 'Agrikiltir ek lapes', fr: 'Agriculture et pêche', en: 'Farming & fishing' },
  'sector.it': { km: 'IT ek digital', fr: 'Informatique et numérique', en: 'IT & digital' },
  'sector.beauty': { km: 'Bote ek kwafer', fr: 'Beauté et coiffure', en: 'Beauty & hair' },
  'sector.transport': { km: 'Transpor', fr: 'Transport', en: 'Transport' },
  'sector.other': { km: 'Lot kalite biznes', fr: 'Autre', en: 'Something else' },
  'hint.food': { km: 'patisri, restoran, snack…', fr: 'pâtisserie, restaurant, snack…', en: 'bakery, restaurant, takeaway…' },
  'hint.retail': { km: 'laboutik, magazin…', fr: 'boutique, épicerie…', en: 'shop, grocery…' },
  'hint.tourism': { km: 'lotel, gesthaus…', fr: 'hôtel, gîte…', en: 'hotel, guest house…' },
  'hint.making': { km: 'artizana, kouti, mebl…', fr: 'artisanat, couture, menuiserie…', en: 'crafts, sewing, furniture…' },
  'hint.farming': { km: 'plantasion, peser, zelvaz…', fr: 'plantation, pêche, élevage…', en: 'farm, fishing, livestock…' },
  'hint.it': { km: 'lozisiel, sit web…', fr: 'logiciel, site web…', en: 'software, website…' },
  'hint.beauty': { km: 'kwafer, manikir…', fr: 'coiffure, onglerie…', en: 'hair, nails…' },
  'hint.transport': { km: 'taksi, kamion…', fr: 'taxi, livraison…', en: 'taxi, delivery…' },
  'hint.other': { km: '', fr: '', en: '' },

  // Turnover tiles + SME Act band sub-labels
  'turnover.t0': { km: 'Mwins ki Rs 3 M', fr: 'Moins de Rs 3 M', en: 'Under Rs 3 M' },
  'turnover.t1': { km: 'Rs 3 M – 10 M', fr: 'Rs 3 M – 10 M', en: 'Rs 3 M – 10 M' },
  'turnover.t2': { km: 'Rs 10 M – 30 M', fr: 'Rs 10 M – 30 M', en: 'Rs 10 M – 30 M' },
  'turnover.t3': { km: 'Rs 30 M – 100 M', fr: 'Rs 30 M – 100 M', en: 'Rs 30 M – 100 M' },
  'turnover.t4': { km: 'Plis ki Rs 100 M', fr: 'Plus de Rs 100 M', en: 'Over Rs 100 M' },
  'turnover.tU': { km: 'Mo pa kone', fr: 'Je ne sais pas', en: 'Not sure' },
  'band.t0': { km: 'Mikro', fr: 'Micro', en: 'Micro' },
  'band.t1': { km: 'Mikro', fr: 'Micro', en: 'Micro' },
  'band.t2': { km: 'Ti biznes', fr: 'Petite', en: 'Small' },
  'band.t3': { km: 'Mwayen', fr: 'Moyenne', en: 'Medium' },
  'band.t4': { km: 'Pli gran ki SME', fr: "Plus grande qu'une PME", en: 'Bigger than an SME' },
  'band.tU': { km: '', fr: '', en: '' },

  // Place tiles (hints: added, example towns)
  'place.mu': { km: 'Moris', fr: 'Maurice', en: 'Mauritius' },
  'place.rod': { km: 'Rodrig', fr: 'Rodrigues', en: 'Rodrigues' },
  'hint.mu': { km: 'Port-Louis, Rose-Hill, Curepipe…', fr: 'Port-Louis, Rose-Hill, Curepipe…', en: 'Port-Louis, Rose-Hill, Curepipe…' },
  'hint.rod': { km: 'Port-Mathurin, La Ferme…', fr: 'Port-Mathurin, La Ferme…', en: 'Port-Mathurin, La Ferme…' },

  // Staff tiles
  'staff.s0': { km: 'Zis mwa', fr: 'Moi seul(e)', en: 'Just me' },
  'staff.s1': { km: '1–5', fr: '1–5', en: '1–5' },
  'staff.s2': { km: '6–20', fr: '6–20', en: '6–20' },
  'staff.s3': { km: '21–50', fr: '21–50', en: '21–50' },
  'staff.s4': { km: 'Plis ki 50', fr: 'Plus de 50', en: 'More than 50' },
  // Staff answer as a chip on Results ("1–5 dimounn" in the wireframe). added
  'staffChip.s0': { km: 'Zis mwa', fr: 'Moi seul(e)', en: 'Just me' },
  'staffChip.s1': { km: '1–5 dimounn', fr: '1–5 personnes', en: '1–5 staff' },
  'staffChip.s2': { km: '6–20 dimounn', fr: '6–20 personnes', en: '6–20 staff' },
  'staffChip.s3': { km: '21–50 dimounn', fr: '21–50 personnes', en: '21–50 staff' },
  'staffChip.s4': { km: 'Plis ki 50 dimounn', fr: 'Plus de 50 personnes', en: 'More than 50 staff' },

  // Age tiles
  'age.a0': { km: 'Pankor koumanse', fr: 'Pas encore lancée', en: 'Not started yet' },
  'age.a1': { km: 'Mwins ki enn lane', fr: "Moins d'un an", en: 'Under 1 year' },
  'age.a2': { km: '1–3 lane', fr: '1 à 3 ans', en: '1–3 years' },
  'age.a3': { km: 'Plis ki 3 lane', fr: 'Plus de 3 ans', en: 'More than 3 years' },

  'btn.next': { km: 'Swivan', fr: 'Suivant', en: 'Next' },
  'btn.results': { km: 'Montre mo rezilta', fr: 'Voir mes résultats', en: 'See my results' },
  'btn.backToResults': { km: 'Retounn lor rezilta', fr: 'Retour aux résultats', en: 'Back to results' },
  'err.choose': { km: 'Swazir enn repons pou kontinie.', fr: 'Choisissez une réponse pour continuer.', en: 'Choose an answer to continue.' },
  'back': { km: 'Retour', fr: 'Retour', en: 'Back' }, // ✓

  // ---------------------------------------------------------- 3.3 Results, detail, draft
  'res.title': { km: 'Ou bann rezilta', fr: 'Vos résultats', en: 'Your matches' },
  // Headline: KM ✓ (deck). FR/EN have a singular and a plural form.
  'res.headline.one': { km: '{n} sipor ki kapav ed ou', fr: '{n} aide qui peut vous aider', en: '{n} scheme that can help you' },
  'res.headline.other': { km: '{n} sipor ki kapav ed ou', fr: '{n} aides qui peuvent vous aider', en: '{n} schemes that can help you' },
  'res.sub': {
    km: 'Nou finn verifye 12 sipor ek lobligasion kont ou 5 repons.',
    fr: 'Nous avons vérifié 12 aides et obligations selon vos 5 réponses.',
    en: 'We checked 12 schemes and obligations against your 5 answers.',
  },
  'res.best': { km: 'Pli bon pou ou', fr: 'Les plus adaptées', en: 'Best matches' },
  'res.oblig': { km: 'Lobligasion: seki ou bizin fer', fr: 'Obligations : ce que vous devez faire', en: 'Obligations: what you must do' },
  'res.more': { km: 'Lezot pou verifye ({n})', fr: 'À vérifier aussi ({n})', en: 'Also worth checking ({n})' },
  'res.yourAnswers': { km: 'Ou bann repons', fr: 'Vos réponses', en: 'Your answers' }, // added (no-results state)
  'res.obligCount.one': { km: '{n} lobligasion.', fr: '{n} obligation.', en: '{n} obligation.' }, // added (live region)
  'res.obligCount.other': { km: '{n} lobligasion.', fr: '{n} obligations.', en: '{n} obligations.' }, // added
  'type.grant': { km: 'Sibvansion', fr: 'Subvention', en: 'Grant' },
  'type.loan': { km: 'Prè', fr: 'Prêt', en: 'Loan' },
  'type.tax': { km: 'Avantaz taks', fr: 'Avantage fiscal', en: 'Tax incentive' },
  'type.obligation': { km: 'Lobligasion', fr: 'Obligation', en: 'Obligation' },
  'card.forYou': { km: 'Pou ou {item}: ziska {amount}', fr: 'Pour votre {item} : jusqu’à {amount}', en: 'For your {item}: up to {amount}' },
  'card.rules': { km: '{k} lor {m} lareg OK', fr: '{k} critères sur {m} remplis', en: '{k} of {m} rules met' },
  'card.notChecked': { km: '{u} pa verifye', fr: '{u} non vérifié', en: '{u} not checked' }, // added
  'card.applies': { km: 'Li aplike parski: {x}', fr: 'S’applique car : {x}', en: 'Applies because: {x}' },
  'card.notYet': {
    km: 'Pankor: anrezistre kan lavant depas Rs 3 M',
    fr: 'Pas encore : inscrivez-vous quand les ventes dépassent Rs 3 M',
    en: 'Not yet: register when sales go over Rs 3 M',
  }, // EN from spec 4.1, KM/FR added
  'card.leasing': {
    km: 'Ou {amount} dan limit Rs 5 M pou leasing ekipman',
    fr: 'Vos {amount} restent sous la limite de Rs 5 M du crédit-bail',
    en: 'Your {amount} is within the Rs 5 M leasing limit',
  }, // EN from spec 4 (S5), KM/FR added
  'o1.a0': { km: 'Anrezistre avan ou koumans vann.', fr: 'Enregistrez-vous avant de commencer à vendre.', en: 'Register before you start trading.' }, // EN from spec 4 (O1)
  'status.confirmed': { km: 'Konfirme', fr: 'Confirmé', en: 'Confirmed' },
  'status.unconfirmed': { km: 'Pa konfirme — verifye', fr: 'Non confirmé — à vérifier', en: 'Unconfirmed — check' },
  'status.announced': { km: 'Anonse selman', fr: 'Annoncé seulement', en: 'Announced only' },
  'status.closed': { km: 'Ferme pou aster', fr: 'Fermé pour l’instant', en: 'Applications closed' },
  'gap.title': { km: 'Nou pa konn tou. Demann SME Mauritius.', fr: 'Nous ne savons pas tout. Demandez à SME Mauritius.', en: "We don't know everything. Ask SME Mauritius." },
  'gap.body': {
    km: 'Nou lis ena 12 zafer. Ena lezot sipor, ek bann lareg sanze.',
    fr: "Notre liste compte 12 éléments. D'autres aides existent, et les règles changent.",
    en: 'Our list has 12 items. Other schemes exist, and rules change.',
  }, // added: the spec names gap.body but gives no wording
  'noresult.title': { km: 'Nou pa kone — demande SME Mauritius', fr: 'Nous ne savons pas — demandez à SME Mauritius', en: "We don't know — ask SME Mauritius" },
  'noresult.body': {
    km: 'Okenn parmi nou 12 sipor pa koresponn ou repons. Sa pa vedir pena led.',
    fr: "Aucune de nos 12 aides ne correspond à vos réponses. Cela ne veut pas dire qu'il n'y a pas d'aide.",
    en: 'None of our 12 schemes fits your answers. That does not mean there is no help.',
  },
  'gap.portal': {
    km: 'Get tou bann sipor lor EDB Business Support Portal',
    fr: "Voir toutes les aides sur l'EDB Business Support Portal",
    en: 'See all schemes on the EDB Business Support Portal',
  },
  'gap.noLink': {
    km: 'Nou pa met lien SME Mauritius: nou pa finn kapav verifye so sit.',
    fr: "Pas de lien vers SME Mauritius : nous n'avons pas pu vérifier son site.",
    en: 'No SME Mauritius link: we could not verify its website.',
  },
  'btn.changeAnswers': { km: 'Sanz mo repons', fr: 'Modifier mes réponses', en: 'Change my answers' },
  'btn.restart': { km: 'Rekomans', fr: 'Recommencer', en: 'Start again' },
  'det.gives': { km: 'Ki li done', fr: 'Ce que ça offre', en: 'What it gives' },
  'det.why': { km: 'Kifer sa koresponn', fr: 'Pourquoi ça correspond', en: 'Why it matches' },
  'det.youSaid': { km: 'Ou finn dir: {x}', fr: 'Vous avez dit : {x}', en: 'You said: {x}' },
  'det.notChecked': { km: 'Pa verifye: {x}', fr: 'Non vérifié : {x}', en: 'Not checked: {x}' },
  'det.notYet': { km: 'Pankor: {x}', fr: 'Pas encore : {x}', en: 'Not yet: {x}' }, // added (O2 under Rs 3 M)
  'det.goal': { km: 'Li ale ek ou plan: {x}', fr: 'Correspond à votre projet : {x}', en: 'Fits your plan: {x}' },
  'det.forYouLabel': { km: 'Pou ou {item} ({cost}):', fr: 'Pour votre {item} ({cost}) :', en: 'For your {item} ({cost}):' }, // added (split of card.forYou)
  'det.upTo': { km: 'ziska {amount}', fr: 'jusqu’à {amount}', en: 'up to {amount}' }, // added
  'det.rule': { km: 'Lareg ofisiel', fr: 'Règle officielle', en: 'Official rule' },
  'det.ruleReported': { km: 'Lareg kouma rapporte', fr: 'Règle telle que rapportée', en: 'Rule as reported' },
  'det.quoteNote': { km: 'Kopie mo pou mo depi sours la, an Angle.', fr: 'Citée mot pour mot depuis la source, en anglais.', en: 'Quoted word for word from the source, in English.' },
  'det.secondary': { km: 'sours segonder', fr: 'source secondaire', en: 'secondary source' }, // added (S7 attribution)
  'det.source': { km: 'Sours ofisiel', fr: 'Source officielle', en: 'Official source' },
  'det.linkLabel': { km: 'Sours ofisiel, li ouver dan navigater', fr: 'Source officielle, s’ouvre dans le navigateur', en: 'Official source, opens in browser' }, // EN from spec 2.4
  'det.checked': { km: 'Dernyer verifikasyon: 28 Oktob 2026', fr: 'Dernière vérification : 28 oct. 2026', en: 'Last checked: 28 Oct 2026' },
  'det.closedCta': { km: 'Pa kapav fer demann aster', fr: "Pas de demande possible pour l'instant", en: 'Not open for applications now' },
  'det.openSource': { km: 'Ouver sours la', fr: 'Ouvrir la source', en: 'Open the source' },
  'det.statusNoteLabel': { km: 'Nott', fr: 'Note', en: 'Note' }, // added (screen readers)

  // Reasons for "Not checked: …" rows (spec 2.4 names them, wording added)
  'reason.notSure': { km: 'ou finn dir Mo pa kone', fr: 'vous avez dit Je ne sais pas', en: 'you said Not sure' },
  'reason.notPublished': { km: 'lareg la pa ankor pibliye', fr: "la règle n'est pas publiée", en: 'the rule is not published' },
  'reason.notAsked': { km: 'nou pa demann sa', fr: 'nous ne posons pas cette question', en: "we don't ask this" },
  'reason.bankDecides': { km: 'labank ki deside', fr: 'la banque décide', en: 'the bank decides' },

  // NSIS stages (S4). added
  'stage.pre': { km: 'Pre-inkibasion', fr: 'Pré-incubation', en: 'Pre-incubation' },
  'stage.inc': { km: 'Inkibasion', fr: 'Incubation', en: 'Incubation' },
  'stage.acc': { km: 'Akselerasion', fr: 'Accélération', en: 'Acceleration' },

  // ---------------------------------------------------------- 4.2 Rule rows
  'rule.sme': { km: 'SME: sifer dafer ziska Rs 100 M', fr: "PME : chiffre d'affaires jusqu'à Rs 100 M", en: 'SME: turnover up to Rs 100 M' },
  'rule.t30': { km: 'Sifer dafer ziska Rs 30 M (vre sifer)', fr: "CA jusqu'à Rs 30 M (réel)", en: 'Turnover up to Rs 30 M (actual)' },
  'rule.scope': { km: 'Sa prototip la kouver SME ziska Rs 100 M', fr: "Ce prototype couvre les PME jusqu'à Rs 100 M", en: 'This prototype covers SMEs up to Rs 100 M' },
  'rule.any': { km: 'Tou sekter', fr: 'Tout secteur', en: 'Any sector' },
  'rule.place': { km: 'Dan Moris ouswa Rodrig', fr: 'À Maurice ou Rodrigues', en: 'In Mauritius or Rodrigues' },
  'rule.track': { km: 'Biznes ki deza marse (bizin enn istorik)', fr: 'Entreprise déjà en activité (historique requis)', en: 'Business already trading (needs a track record)' },
  'rule.localMade': { km: 'Ou fer enn prodwi isi (nou lektir)', fr: 'Vous fabriquez un produit local (notre lecture)', en: 'You make a product locally (our reading)' },
  'rule.stage': { km: 'Ou etap: {x}', fr: 'Votre étape : {x}', en: 'Your stage: {x}' },
  'rule.startup': { km: 'Enn start-up', fr: 'Une start-up', en: 'A start-up' },
  'rule.conditions': { km: 'Kondision pa ankor pibliye', fr: 'Conditions pas encore publiées', en: 'Conditions not published yet' },
  'rule.priority': {
    km: 'Domenn prioriter (IT, fabrikasion, lamer/lanatir, Rodrig)',
    fr: 'Domaine prioritaire (numérique, fabrication, bleu/vert, Rodrigues)',
    en: 'Priority area (digital, manufacturing, blue/green, Rodrigues)',
  },
  'rule.entity': { km: 'Lantite legal ki deza anrezistre', fr: 'Entité légale déjà enregistrée', en: 'Already a registered legal entity' },
  'rule.dbm': { km: 'Lantrepriz, ladan SME ek start-up', fr: 'Entreprises, PME et start-ups comprises', en: 'Enterprises, including SMEs and start-ups' },
  'rule.youngWomen': { km: 'Bonis zenn ek fam antreprener', fr: 'Bonus jeunes et femmes entrepreneurs', en: "Young and women entrepreneurs' top-up" },
  'rule.anyBiz': { km: 'Tou dimounn ki fer biznes', fr: 'Toute personne qui exerce une activité', en: 'Anyone carrying on business' },
  'rule.vat': { km: 'Lavant plis ki Rs 3 M par an', fr: 'Ventes de plus de Rs 3 M par an', en: 'Sales over Rs 3 M a year' },
  'rule.employer': { km: 'Ou anplway dimounn', fr: 'Vous employez du personnel', en: 'You employ staff' },
  'rule.food': { km: 'Ou ena enn biznes manze', fr: 'Vous exploitez une entreprise alimentaire', en: 'You run a food business' },

  // ---------------------------------------------------------- Draft
  'btn.draft': { km: 'Prepar mo formiler', fr: 'Préparer mon formulaire', en: 'Prepare my form' }, // ✓
  'draft.title': { km: 'Mo formiler (brouion)', fr: 'Mon formulaire (brouillon)', en: 'My form (draft)' },
  'draft.banner': { km: 'BROUION — gidans, pa konsey legal', fr: 'BROUILLON — conseils, pas un avis juridique', en: 'DRAFT — guidance, not legal advice' },
  'draft.bannerBody': {
    km: 'Verifye sak lign. Fer ou demann zis par sanal ofisiel.',
    fr: 'Vérifiez chaque ligne. Déposez votre demande uniquement par le canal officiel.',
    en: 'Check every line. Apply only through the official channel.',
  },
  'draft.for': { km: 'Pou:', fr: 'Pour :', en: 'For:' }, // added (wireframe shows "Pou:")
  'draft.partA': { km: 'Part A — Ou ek ou biznes', fr: 'Partie A — Vous et votre entreprise', en: 'Part A — You and your business' },
  'draft.partB': { km: 'Part B — Ou proze', fr: 'Partie B — Votre projet', en: 'Part B — Your project' },
  'tag.words': { km: 'Depi ou bann mo', fr: "D'après vos mots", en: 'From your words' },
  'tag.answers': { km: 'Depi ou repons', fr: "D'après vos réponses", en: 'From your answers' },
  'tag.calc': { km: 'Kalkile', fr: 'Calculé', en: 'Calculated' },
  'tag.fill': { km: 'Ranpli sa', fr: 'À remplir', en: 'Fill this in' },
  'draft.langNote': { km: 'Valer yo an Angle, parski formiler ofisiel an Angle ouswa Franse.', fr: '', en: '' },
  'draft.ask': { km: 'Kestion pou poz azans la', fr: "Questions à poser à l'organisme", en: 'Questions to ask the agency' },
  'ask.open': { km: 'Eski sa sipor la ouver zordi?', fr: "Ce dispositif est-il ouvert aujourd'hui ?", en: 'Is this scheme open today?' }, // KM added
  'ask.docs': { km: 'Ki dokiman mo bizin atase?', fr: 'Quels documents dois-je joindre ?', en: 'Which documents must I attach?' }, // KM added
  'ask.time': { km: 'Konbien letan pou gagn enn desizion?', fr: 'Combien de temps faut-il pour une décision ?', en: 'How long does a decision take?' }, // KM added
  'btn.copy': { km: 'Kopie', fr: 'Copier', en: 'Copy' },
  'btn.share': { km: 'Partaz', fr: 'Partager', en: 'Share' },
  'btn.pdf': { km: 'Sov PDF', fr: 'Enregistrer en PDF', en: 'Save as PDF' },
  'draft.pdfHint': { km: 'Swazir «Save as PDF» kouma printer.', fr: 'Choisissez « Enregistrer au format PDF » comme imprimante.', en: 'Choose "Save as PDF" as the printer.' },
  'draft.live': { km: 'Formiler brouion pou {x}. Pa konsey legal.', fr: 'Brouillon de formulaire pour {x}. Pas un avis juridique.', en: 'Draft form for {x}. Not legal advice.' }, // added (EN from spec 2.5)
  'draft.copyBox': { km: 'Text pou kopie', fr: 'Texte à copier', en: 'Text to copy' }, // added (copy fallback label)
  'toast.copied': { km: 'Kopie!', fr: 'Copié', en: 'Copied' },
  'toast.copyFail': {
    km: 'Pa finn kapav kopie. Seleksion text la ek kopie li.',
    fr: 'Copie impossible. Sélectionnez le texte et copiez-le.',
    en: "Couldn't copy. Select the text and copy it.",
  },
  'toast.offlineLink': { km: 'Ou offline. Lien la bizin internet.', fr: "Vous êtes hors ligne. Le lien a besoin d'internet.", en: "You're offline. The link needs internet." },
  'err.generic': {
    km: 'Enn zafer pa finn marse. Ou repons ankor la.',
    fr: 'Un problème est survenu. Vos réponses sont conservées.',
    en: 'Something went wrong. Your answers are still here.',
  },
  'err.retry': { km: 'Esey ankor', fr: 'Réessayer', en: 'Try again' },

  // Draft field labels (on screen in the UI language; in the export they use
  // the form language: EN for KM/EN, FR for FR). KM labels added.
  'f.applicant': { km: 'Non ou', fr: 'Nom du demandeur', en: 'Applicant name' },
  'f.business': { km: 'Non biznes la', fr: "Nom de l'entreprise", en: 'Business name' },
  'f.brn': { km: 'BRN', fr: 'BRN', en: 'BRN' },
  'f.activity': { km: 'Aktivite biznes', fr: 'Activité', en: 'Business activity' },
  'f.location': { km: 'Landrwa', fr: 'Lieu', en: 'Location' },
  'f.years': { km: 'Depi kan li marse', fr: "Années d'activité", en: 'Years in operation' },
  'f.employees': { km: 'Anplwaye (san konte ou)', fr: 'Employés (sans le propriétaire)', en: 'Employees (excluding owner)' },
  'f.turnover': { km: 'Sifer dafer par an ek gramer', fr: "Chiffre d'affaires annuel et taille", en: 'Annual turnover and size' },
  'f.contact': { km: 'Telefonn / email', fr: 'Téléphone / e-mail', en: 'Phone / email' },
  'f.contactNote': { km: 'Li res lor sa telefonn la.', fr: 'Reste sur ce téléphone.', en: 'Stays on this phone.' },
  'f.brnHint': { km: 'Anrezistre avan: get BRN.', fr: "Enregistrez-vous d'abord : voir BRN.", en: 'Register first: see BRN.' },
  'f.equipment': { km: 'Ekipman', fr: 'Équipement', en: 'Equipment' },
  'f.cost': { km: 'Pri estime', fr: 'Coût estimé', en: 'Estimated cost' },
  'f.grant': { km: 'Sibvansion demande', fr: 'Subvention demandée', en: 'Grant requested' },
  'f.own': { km: 'Ou kontribisyon', fr: 'Votre contribution', en: 'Own contribution' },
  'f.purpose': { km: 'Kifer', fr: 'Objet', en: 'Purpose' },
  'f.supplier': { km: 'Fourniser ek referans kotasion', fr: 'Fournisseur et référence du devis', en: 'Supplier and quote reference' },
  'f.marketing': { km: 'Aktivite marketing', fr: 'Action marketing', en: 'Marketing activity' },
  'f.mcost': { km: 'Pri', fr: 'Coût', en: 'Cost' },
  'f.product': { km: 'Prodwi pou sertifye', fr: 'Produit à certifier', en: 'Product to certify' },
  'f.certCost': { km: 'Pri sertifikasion', fr: 'Coût de la certification', en: 'Certification cost' },
  'f.stage': { km: 'Etap', fr: 'Étape', en: 'Stage' },
  'f.incubator': { km: 'Inkibater', fr: 'Incubateur', en: 'Incubator' },
  'f.projectCost': { km: 'Pri proze', fr: 'Coût du projet', en: 'Project cost' },
  'f.share': { km: 'Ou 50%', fr: 'Votre part de 50 %', en: 'Your 50% share' },
  'f.loanProduct': { km: 'Prodwi', fr: 'Produit', en: 'Product' },
  'f.amount': { km: 'Montan demande', fr: 'Montant demandé', en: 'Amount requested' },
};

// Strings only used inside the draft form VALUES and the copy/PDF export.
// They exist in EN and FR only, because official forms are in English or French.
export const FORM = {
  'export.header': { en: 'SUBSIDY NAVIGATOR — DRAFT (guidance, not legal advice)', fr: 'SUBSIDY NAVIGATOR — BROUILLON (conseils, pas un avis juridique)' },
  'export.scheme': { en: 'Scheme', fr: 'Dispositif' },
  'export.source': { en: 'Source', fr: 'Source' },
  'export.checked': { en: 'Last checked: 28 Oct 2026', fr: 'Dernière vérification : 28 oct. 2026' },
  'export.partA': { en: 'PART A — YOU AND YOUR BUSINESS', fr: 'PARTIE A — VOUS ET VOTRE ENTREPRISE' },
  'export.partB': { en: 'PART B — YOUR PROJECT', fr: 'PARTIE B — VOTRE PROJET' },
  'export.partC': { en: 'QUESTIONS TO ASK THE AGENCY', fr: "QUESTIONS À POSER À L'ORGANISME" },
  'export.footer': { en: 'Check every line. Apply only through the official channel.', fr: 'Vérifiez chaque ligne. Déposez votre demande uniquement par le canal officiel.' },
  'export.fillIn': { en: '[fill in]', fr: '[à remplir]' },
  'export.watermark': { en: 'DRAFT', fr: 'BROUILLON' },

  'v.bakery': { en: 'Pastry shop / bakery (food & drink)', fr: 'Pâtisserie / boulangerie (alimentation)' },
  'v.mauritius': { en: 'Mauritius', fr: 'Maurice' },
  'v.rodrigues': { en: 'Rodrigues', fr: 'Rodrigues' },
  'v.band.t0': { en: 'Micro enterprise (SME Act)', fr: 'Micro-entreprise (SME Act)' },
  'v.band.t1': { en: 'Micro enterprise (SME Act)', fr: 'Micro-entreprise (SME Act)' },
  'v.band.t2': { en: 'Small enterprise (SME Act)', fr: 'Petite entreprise (SME Act)' },
  'v.band.t3': { en: 'Medium enterprise (SME Act)', fr: 'Moyenne entreprise (SME Act)' },
  'v.band.t4': { en: 'Larger than an SME', fr: "Plus grande qu'une PME" },
  'v.contactPh': { en: 'Stays on this phone', fr: 'Reste sur ce téléphone' },

  // "New oven" and "a new oven" for each equipment item
  'v.new.oven': { en: 'New oven', fr: 'Nouveau four' },
  'v.new.machine': { en: 'New machine', fr: 'Nouvelle machine' },
  'v.new.fridge': { en: 'New fridge', fr: 'Nouveau réfrigérateur' },
  'v.new.computer': { en: 'New computer', fr: 'Nouvel ordinateur' },
  'v.new.truck': { en: 'New truck', fr: 'Nouveau camion' },
  'v.new.equipment': { en: 'New equipment', fr: 'Nouvel équipement' },
  'v.aNew.oven': { en: 'a new oven', fr: 'un nouveau four' },
  'v.aNew.machine': { en: 'a new machine', fr: 'une nouvelle machine' },
  'v.aNew.fridge': { en: 'a new fridge', fr: 'un nouveau réfrigérateur' },
  'v.aNew.computer': { en: 'a new computer', fr: 'un nouvel ordinateur' },
  'v.aNew.truck': { en: 'a new truck', fr: 'un nouveau camion' },
  'v.aNew.equipment': { en: 'new equipment', fr: 'un nouvel équipement' },

  'v.purposeS1': { en: 'Buy {x} to increase production.', fr: 'Acheter {x} pour augmenter la production.' },
  'v.purposeLoan': { en: 'Buy {x}', fr: 'Acheter {x}' },
  'v.advertising': { en: 'Advertising / promotion', fr: 'Publicité / promotion' },
  'v.leasing': { en: 'Equipment leasing', fr: "Crédit-bail d'équipement" },
  'v.businessLoan': { en: 'Business loan', fr: 'Prêt aux entreprises' },
  'v.dbmLoan': { en: 'Business Loan Scheme', fr: 'Business Loan Scheme' },
  'v.incubatorPh': { en: 'Name of accredited incubator', fr: "Nom de l'incubateur accrédité" },
  'v.stage.pre': { en: 'Pre-incubation (up to Rs 50,000, 9 months)', fr: "Pré-incubation (jusqu'à Rs 50 000, 9 mois)" },
  'v.stage.inc': { en: 'Incubation (up to Rs 400,000, 18 months)', fr: "Incubation (jusqu'à Rs 400 000, 18 mois)" },
  'v.stage.acc': { en: 'Acceleration (up to Rs 300,000, 6 months)', fr: "Accélération (jusqu'à Rs 300 000, 6 mois)" },

  // Calculated fields: the working shown under the value, the short note in
  // the export, and the formula shown while no cost is known.
  'calc.80.under': { en: '80% of {cost} = {grant}, under the Rs 150,000 cap', fr: '80 % de {cost} = {grant}, sous le plafond de Rs 150 000' },
  'calc.80.capped': { en: '80% of {cost} = {raw}, capped at Rs 150,000', fr: '80 % de {cost} = {raw}, plafonné à Rs 150 000' },
  'calc.80.note': { en: '80%, max Rs 150,000', fr: '80 %, max. Rs 150 000' },
  'calc.80.formula': { en: '80% of your cost, max Rs 150,000', fr: '80 % de votre coût, max. Rs 150 000' },
  'calc.own.working': { en: '{cost} − {grant}', fr: '{cost} − {grant}' },
  'calc.own.note': { en: 'cost minus grant', fr: 'coût moins subvention' },
  'calc.own.formula': { en: 'Your cost minus the grant', fr: 'Votre coût moins la subvention' },
  'calc.50k.working': { en: 'Your cost, up to Rs 50,000', fr: "Votre coût, jusqu'à Rs 50 000" },
  'calc.50k.note': { en: 'max Rs 50,000', fr: 'max. Rs 50 000' },
  'calc.half.working': { en: 'Half of {cost}', fr: 'La moitié de {cost}' },
  'calc.half.note': { en: '50:50 matching', fr: 'financement 50/50' },
  'calc.half.formula': { en: 'Half of your project cost', fr: 'La moitié du coût du projet' },
};

// French typography: put a no-break space before ? : ! ; and inside « »,
// so a lone "?" never wraps onto its own line.
function frenchSpaces(text) {
  return text
    .replace(/ ([?:!;»])/g, ' $1')
    .replace(/« /g, '« ');
}

// Look up a string and fill in its placeholders.
// t('fr', 'q.progress', { n: 2 }) -> "Question 2 sur 5"
export function t(lang, key, vars = {}) {
  const entry = STRINGS[key] || FORM[key];
  if (!entry) {
    console.warn('Missing string:', key);
    return key;
  }
  let text = entry[lang];
  if (text === undefined) text = entry.en; // FORM strings have no km
  for (const name of Object.keys(vars)) {
    text = text.split('{' + name + '}').join(String(vars[name]));
  }
  return lang === 'fr' ? frenchSpaces(text) : text;
}

// Singular or plural key: tn('en', 'res.headline', 1) uses 'res.headline.one'.
export function tn(lang, key, n) {
  return t(lang, key + (n === 1 ? '.one' : '.other'), { n });
}
