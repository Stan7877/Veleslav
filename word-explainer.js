/* ═══════════════════════════════════════════════════════════
   Veleslav — Word Explainer Widget
   word-explainer.js

   Fallback: Free Dictionary API (dictionaryapi.dev)
   — No API key required. Works on GitHub Pages.
   — CORS-enabled public endpoint.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Built-in dictionary ── */
  const DICTIONARY = {
    // Required words
    ominous:     'Giving the impression that something bad is about to happen.',
    languid:     'Slow and relaxed; lacking energy or vitality.',
    restraint:   'Control over one\'s own actions or feelings.',
    predatory:   'Seeking to exploit or oppress others for personal gain.',
    // Extended — thematically relevant to Veleslav
    melancholic: 'Feeling a deep, pensive sadness without obvious cause.',
    preamble:    'An opening statement that introduces what follows.',
    respite:     'A short period of rest or relief from difficulty.',
    foreboding:  'A feeling that something bad is going to happen.',
    audacity:    'Willingness to take bold risks; impudent confidence.',
    resonant:    'Evoking images and memories through rich association.',
    unnerving:   'Causing one to lose courage or composure.',
    analytical:  'Using logical examination to understand something.',
    periphery:   'The outer edge or boundary of an area.',
    trickster:   'One who uses deception and cunning to achieve goals.',
    wistful:     'Feeling vague longing or regret for something past.',
    cultivated:  'Refined and developed through care and education.',
    insidious:   'Proceeding in a subtle way but with serious effect.',
    imperceptible: 'Too slight or gradual to be noticed.',
    luminous:    'Emitting or reflecting a steady, gentle light.',
    clandestine: 'Done secretly, often for illicit reasons.',
    enigmatic:   'Difficult to interpret or understand; mysterious.',
    stoic:       'Enduring pain without showing feelings or complaint.',
    taciturn:    'Reserved and uncommunicative in speech; silent.',
    pallid:      'Deficient in color; pale, especially from illness or fear.',
    reverie:     'A state of dreamy meditation or fanciful musing.',
    dissonance:  'A lack of harmony or agreement between things.',
    perpetual:   'Never ending or changing; occurring continually.',
    labyrinthine:'Like a labyrinth; intricate and difficult to navigate.',
    antiquated:  'Old-fashioned or outdated in style or manner.',
    ephemeral:   'Lasting only a very short time.',
    tenuous:     'Very weak or slight; having little substance.',
    visceral:    'Relating to deep, instinctive feelings rather than intellect.',
    presage:     'A sign or warning that something will happen.',
    duplicitous: 'Deceitful and double-dealing in character.',
    solemnity:   'The quality of being serious and dignified.',
    crepuscular: 'Of, resembling, or relating to twilight.',
    liminal:     'Relating to a threshold or transitional state.',
    incipient:   'Beginning to happen or develop.',
    aberrant:    'Departing from an accepted standard; unusual.',
    inexorable:  'Impossible to stop or prevent; relentless.',
    cadence:     'A modulation or rhythmic sequence of sounds.',
    apparition:  'A remarkable or unexpected appearance of something.',
    veiled:      'Partially hidden or disguised; obscured.',
    sinister:    'Giving the impression of something harmful or evil.',
    morbid:      'Having an unusual interest in disturbing topics.',
    elusive:     'Difficult to find, catch, or achieve.',
    somber:      'Dark or dull in color; oppressively solemn.',
    uncanny:     'Strange or mysterious in an unsettling way.',
    reclusive:   'Avoiding the company of others; solitary.',
    austere:     'Severe in manner; without ornament or comfort.',
  };

  /* ── 2. Validation — one word, letters only ── */
  const VALID_WORD  = /^[a-zA-Z]+$/;
  const ERROR_MSG   = 'Only single words can be explained.';
  const UNKNOWN_MSG = 'No definition available.';

  function validate(raw) {
    const t = raw.trim();
    if (!t || /\s/.test(t) || !VALID_WORD.test(t)) return null;
    return t.toLowerCase();
  }

  /* ── 3. Truncate a definition to max 12 words ── */
  function truncate(text) {
    const words = text.trim().split(/\s+/);
    if (words.length <= 12) return text.trim();
    return words.slice(0, 12).join(' ').replace(/[,;:]$/, '') + '.';
  }

  /* ── 4. Free Dictionary API fallback (no key, CORS-safe) ── */
  async function fetchFromApi(word) {
    const url = 'https://api.dictionaryapi.dev/api/v2/entries/en/' +
      encodeURIComponent(word);
    const res = await fetch(url);
    if (!res.ok) return null;           // 404 = word not found
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) return null;

    // Walk meanings → definitions to find the first usable one
    for (const meaning of data[0].meanings || []) {
      for (const def of meaning.definitions || []) {
        const text = (def.definition || '').trim();
        if (text) return truncate(text);
      }
    }
    return null;
  }

  /* ── 5. UI helpers ── */
  function h(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setEmpty() {
    output.className = 'we-empty';
    output.textContent = 'Enter a word above\u2026';
  }

  function setLoading() {
    output.className = '';
    output.innerHTML =
      '<span style="font-family:\'IM Fell English\',serif;font-style:italic;' +
      'font-size:0.82rem;color:#8b6f47;">Consulting the lexicon</span>' +
      '&nbsp;<span class="we-loading"><span></span><span></span><span></span></span>';
  }

  function setDefinition(word, def) {
    output.className = '';
    output.innerHTML =
      '<span class="we-word-label">' + h(word) + '</span>' +
      '<span class="we-def">'        + h(def)  + '</span>';
  }

  function setError(msg) {
    output.className = 'we-error';
    output.textContent = msg;
  }

  /* ── 6. Core lookup ── */
  async function explain() {
    const word = validate(input.value);

    if (!word) {
      setError(ERROR_MSG);
      return;
    }

    /* Dictionary hit — instant */
    if (Object.prototype.hasOwnProperty.call(DICTIONARY, word)) {
      setDefinition(word, DICTIONARY[word]);
      return;
    }

    /* API fallback */
    setLoading();
    btn.disabled = true;

    try {
      const def = await fetchFromApi(word);
      if (def) {
        setDefinition(word, def);
      } else {
        setError(UNKNOWN_MSG);
      }
    } catch (_) {
      setError(UNKNOWN_MSG);
    } finally {
      btn.disabled = false;
    }
  }

  /* ── 7. DOM wiring — runs after DOMContentLoaded ── */
  function init() {
    const panel  = document.getElementById('we-panel');
    const toggle = document.getElementById('we-toggle');
    const close  = document.getElementById('we-close');

    /* Expose to module scope for helpers above */
    btn    = document.getElementById('we-btn');
    input  = document.getElementById('we-input');
    output = document.getElementById('we-output');

    if (!panel || !toggle || !btn || !input || !output) return;

    /* Toggle open / close */
    toggle.addEventListener('click', function () {
      var hidden = panel.classList.toggle('we-hidden');
      if (!hidden) input.focus();
    });

    close.addEventListener('click', function () {
      panel.classList.add('we-hidden');
    });

    /* Explain on button click or Enter */
    btn.addEventListener('click', explain);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') explain();
    });

    /* Clear error on fresh input */
    input.addEventListener('input', function () {
      if (output.classList.contains('we-error')) setEmpty();
    });

    /* Close when clicking outside the widget */
    document.addEventListener('click', function (e) {
      var widget = document.getElementById('word-explainer');
      if (widget && !widget.contains(e.target)) {
        panel.classList.add('we-hidden');
      }
    });
  }

  /* Module-level references populated by init() */
  var btn, input, output;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
