/* Create a vibe: mini prototype.
   Reads the vocabulary (data/vocabulary.js), a fictional catalog (data/catalog.js)
   and all copy (content.js). No build step, no dependencies. */
(function () {
  "use strict";

  const C = window.CONTENT;
  const VOCAB = window.VOCAB;
  const CATALOG = window.CATALOG;
  const byId = Object.fromEntries(VOCAB.vibes.map((v) => [v.id, v]));

  const MOOD_CHIPS = ["chill", "happy", "hype", "romantic", "sad", "breakup"];
  const OCCASION_CHIPS = ["intimate-dinner", "party", "road-trip", "workout", "running", "focus", "sleep"];
  const ERAS = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s"];
  const ERA_LABEL = { "1960s": "60s", "1970s": "70s", "1980s": "80s", "1990s": "90s", "2000s": "2000s", "2010s": "2010s" };
  const HIGH_ENERGY = new Set(["workout", "running", "party", "hype"]);
  const LOW_ENERGY = new Set(["sleep", "chill", "focus", "intimate-dinner", "sad", "breakup-sad"]);

  // Leacox et al., 2025 (Int J Sports Phys Ther): mean cadence of experienced runners by pace.
  // The study covers 7:00 to 10:00 per mile, so the picker does too.
  const PACE_CADENCE = [["10", 169], ["9:30", 170], ["9", 171], ["8:30", 172], ["8", 174], ["7:30", 176], ["7", 178]];
  const SYNC_STEP = 4; // ~2.5% of 170: the window where runners fall into sync on their own (cited in Buhmann et al., 2018)

  // Business words that signal commercial use. "Gym" is left out on purpose:
  // "for the gym" means a workout, not a business.
  const BUSINESS_RE = /\b(my|our) (business|cafe|coffee shop|store|shop|restaurant|bar|salon|boutique)\b/;
  // Explicit risk only, stated outright. Moods ("sad", "crying") never match.
  const RISK_RE = /\b(kill myself|end my life|want to die|suicide|hurt myself)\b/;

  const state = freshState();
  let notes = [];

  function freshState() {
    return {
      screen: "create",
      seeds: [],
      mood: null,
      occasion: null,
      basedOn: "mine",
      era: null,
      eraAsked: false,
      clean: null,
      bpm: null,
      excluded: [],
      held: null,
      business: false,
      risk: false,
      conflictLead: null,
      contextNoted: false,
      loosen: 0,
      boosts: [],
      removed: [],
      sheet: null,
      fixed: null,
      query: "",
    };
  }

  // ---------- helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const labelOf = (id) => (byId[id] ? byId[id].pref_label : id);
  const titleCase = (s) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase());

  function note(text) {
    notes.push(text);
    renderNotes();
  }

  // ---------- understanding a typed request ----------
  function normalize(text) {
    return " " + text.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[’]/g, "'")
      .replace(/[^a-z0-9:'/\- ]/g, " ")
      .replace(/\s+/g, " ") + " ";
  }

  function labelIndex() {
    const entries = [];
    VOCAB.vibes.forEach((v) => [v.pref_label, ...v.alt_labels].forEach((l) => entries.push([l.toLowerCase(), v.id])));
    VOCAB.ambiguous.forEach((a) => entries.push([a.term.toLowerCase(), null]));
    return entries.sort((a, b) => b[0].length - a[0].length);
  }

  function interpret(raw) {
    const s = freshState();
    s.query = raw;
    let t = normalize(raw);

    if (RISK_RE.test(t)) { s.risk = true; return s; }
    if (BUSINESS_RE.test(t)) { s.business = true; return s; }

    // "but not X" rules X out.
    const neg = t.match(/ not ([a-z\- ]+?)(?= but | and |$| $)/);
    let negPhrase = "";
    if (neg) { negPhrase = " " + neg[1].trim() + " "; t = t.replace(neg[0], " "); }

    const pace = t.match(/(\d{1,2})(?::(\d{2}))?[ -]?(?:min(?:ute)?s?)?[ -]?(?:mile|mi)\b/);
    if (pace) {
      const key = pace[2] && pace[2] !== "00" ? `${pace[1]}:${pace[2]}` : pace[1];
      const hit = PACE_CADENCE.find(([p]) => p === key);
      if (hit) { s.bpm = hit[1]; s.paceLabel = hit[0]; }
      t = t.replace(pace[0], " ");
    }

    const era = t.match(/ (?:19)?([6-9]0)s | (2000|2010)s /);
    if (era) { s.era = era[2] ? `${era[2]}s` : `19${era[1]}s`; s.eraAsked = true; t = t.replace(era[0], " "); }
    if (/ classics? /.test(t)) { s.basedOn = "classics"; t = t.replace(/ classics? /, " "); }
    if (/ (popular|trending|top hits) /.test(t)) { s.basedOn = "popular"; }

    const found = [];
    for (const [label, id] of labelIndex()) {
      const needle = " " + label + " ";
      if (negPhrase.includes(needle)) { if (id) s.excluded.push(id); negPhrase = negPhrase.replace(needle, " "); continue; }
      if (t.includes(needle)) {
        t = t.replace(needle, " ");
        if (!id) { s.held = s.held || label; continue; }
        found.push([label, id]);
      }
    }
    s.found = found;
    for (const [, id] of found) {
      const facet = byId[id].facet;
      if (facet === "mood" || facet === "theme") {
        // A narrower vibe beats its ambiguous parent ("breakup ... over it").
        if (!s.mood || byId[id].broader === s.mood) s.mood = id;
      } else if (facet === "setting" && id === "business") {
        s.business = true;
      } else {
        if (!s.occasion || byId[id].broader === s.occasion) s.occasion = id;
      }
    }
    return s;
  }

  // ---------- the rules, in order ----------
  function next() {
    state.sheet = null;

    if (state.risk) return showFixed("support");
    if (state.business) { note(C.notes.business); return showFixed("business"); }

    if (state.held) {
      const term = state.held;
      state.held = null;
      if (term === "venue" || term === "public event") {
        note(C.notes.businessAsk(term));
        return ask(C.questions.business, [
          [C.questions.businessYes, () => { state.business = true; }],
          [C.questions.businessNo, () => { state.occasion = state.occasion || "party"; }],
        ]);
      }
      if (term === "throwback") { state.eraAsked = true; note(C.notes.eraAsk(term)); return askEra(); }
      note(C.notes.heldOut(term));
      if (term === "lit") return ask(C.questions.lit, [[labelOf("hype"), () => { state.mood = "hype"; }], [labelOf("party"), () => { state.occasion = "party"; }]]);
      if (term === "emo") return ask(C.questions.emo, [[C.questions.emoMood, () => { state.mood = "sad"; }], [C.questions.emoGenre, () => { state.mood = "sad"; note("Genres aren't in this demo, so it falls back to the mood."); }]]);
      return ask(C.questions.vague, MOOD_CHIPS.map((id) => [labelOf(id), () => { state.mood = id; }]));
    }

    const mood = state.mood && byId[state.mood];
    if (mood && mood.ambiguous === "yes") {
      const strong = state.occasion && HIGH_ENERGY.has(state.occasion);
      if (strong) {
        const pick = mood.clarify_options.find((o) => byId[o].energy === "high");
        if (pick) { note(C.notes.contextResolved(mood.pref_label, labelOf(state.occasion))); state.mood = pick; return next(); }
      }
      note(C.notes.askAmbiguous(mood.pref_label));
      return ask(mood.clarify_question, mood.clarify_options.map((o) => [labelOf(o), () => { state.mood = o; }]));
    }

    if (state.occasion === "running" && !state.bpm) {
      note(C.notes.paceAsk);
      return ask(C.questions.pace, PACE_CADENCE.map(([p, bpm]) => [C.questions.paceOption(p, bpm), () => { state.bpm = bpm; state.paceLabel = p; }]), C.questions.paceHelper);
    }

    if (state.occasion === "party" && state.clean === null) {
      note(C.notes.clean);
      return ask(C.questions.clean, [[C.questions.cleanYes, () => { state.clean = true; }], [C.questions.cleanNo, () => { state.clean = false; }]]);
    }

    if (state.basedOn === "classics" && !state.eraAsked) {
      state.eraAsked = true;
      return askEra();
    }

    const quiet = [state.mood, state.occasion].find((id) => id && LOW_ENERGY.has(id) && byId[id].energy.includes("low"));
    if (state.seeds.length && quiet && !state.conflictLead) {
      const avg = state.seeds.reduce((n, s) => n + s.energy, 0) / state.seeds.length;
      if (avg >= 4) {
        note(C.notes.conflict);
        return ask(C.questions.conflict(labelOf(quiet)), [
          [C.questions.conflictSongs, () => { state.conflictLead = "songs"; if (state.mood === quiet) state.mood = null; if (state.occasion === quiet) state.occasion = null; }],
          [labelOf(quiet), () => { state.conflictLead = "vibe"; state.seeds = []; }],
        ]);
      }
    }

    if (!state.seeds.length && !state.mood && !state.occasion && !state.query) return showFixed("empty");

    // A typed request with nothing recognized: say so and ask, never present a generic mix as a match.
    const understood = state.mood || state.occasion || state.era || state.basedOn !== "mine" || (state.found && state.found.length);
    if (state.query && !state.seeds.length && !understood) {
      note(C.notes.unrecognized(state.query));
      state.query = "";
      return ask(C.questions.vague, MOOD_CHIPS.map((id) => [labelOf(id), () => { state.mood = id; }]));
    }

    buildResult();
  }

  function askEra() {
    return ask(C.questions.era, [[C.create.eraAny, () => { state.era = null; }], ...ERAS.map((e) => [ERA_LABEL[e], () => { state.era = e; note(C.notes.era(ERA_LABEL[e])); }])]);
  }

  function ask(question, options, helper) {
    state.sheet = { question, options, helper };
    render();
  }

  function showFixed(kind) {
    state.screen = "fixed";
    state.fixed = kind;
    if (kind === "support") note(C.notes.support);
    if (kind === "empty") note(C.notes.empty);
    render();
  }

  // ---------- building the playlist ----------
  function score(song, targets, ctx) {
    let n = 0;
    targets.forEach((id) => {
      if (song.vibes.includes(id)) n += 3;
      const broader = byId[id] && byId[id].broader;
      if (broader && song.vibes.includes(broader)) n += 1;
    });
    if (ctx.seedProfile) {
      const p = ctx.seedProfile;
      n += 2 - Math.min(2, Math.abs(song.energy - p.energy));
      n += 2 - Math.min(2, Math.abs(song.valence - p.valence));
      if (song.decade === p.decade) n += 1;
      if (song.acoustic === p.acoustic) n += 1;
    }
    state.boosts.forEach((id) => { if (song.vibes.includes(id)) n += 2; });
    if (state.basedOn === "mine" && song.mine) n += 2;
    if (state.basedOn === "popular") n += song.pop;
    if (state.basedOn === "classics") n += song.lasting;
    return n;
  }

  function seedProfile() {
    if (!state.seeds.length) return null;
    const avg = (k) => state.seeds.reduce((n, s) => n + s[k], 0) / state.seeds.length;
    const decades = state.seeds.map((s) => s.decade);
    const decade = decades.sort((a, b) => decades.filter((d) => d === b).length - decades.filter((d) => d === a).length)[0];
    return { energy: avg("energy"), valence: avg("valence"), decade, acoustic: state.seeds.filter((s) => s.acoustic).length * 2 >= state.seeds.length };
  }

  function buildResult() {
    const targets = [state.mood, state.occasion].filter(Boolean);
    const ctx = { seedProfile: seedProfile() };
    const syncWindow = SYNC_STEP * (state.loosen >= 2 ? 2 : 1);
    let droppedForClean = 0;

    let pool = CATALOG.filter((song) => {
      if (state.removed.includes(song.id)) return false;
      if (state.seeds.some((s) => s.id === song.id)) return false;
      if (targets.length && !targets.some((id) => song.vibes.includes(id) || song.vibes.includes((byId[id] || {}).broader)) && state.loosen < 3) return false;
      if (state.excluded.some((id) => song.vibes.includes(id) || (byId[id] && byId[id].energy.includes("low") && song.energy <= 1))) return false;
      if (state.occasion === "intimate-dinner" && (song.explicit || song.energy > 3)) return false;
      if (state.occasion === "running" && state.bpm && Math.abs(song.bpm - state.bpm) > syncWindow) return false;
      if (state.basedOn === "classics" && (song.decade === "2020s" || song.lasting < 4)) return false;
      if (state.era && state.loosen < 1 && song.decade !== state.era) return false;
      if (state.clean && song.explicit && !song.clean) { droppedForClean += 1; return false; }
      return true;
    });

    pool = pool.map((song) => ({ song, n: score(song, targets, ctx) })).sort((a, b) => b.n - a.n).slice(0, 8).map((x) => x.song);
    state.result = { songs: pool, droppedForClean };
    state.screen = "result";

    if (state.found) state.found.forEach(([said, id]) => { if (said !== byId[id].pref_label.toLowerCase()) note(C.notes.alias(said, byId[id].pref_label)); });
    if (state.excluded.length) note(C.notes.negation(state.excluded.map(labelOf).join(", ")));
    if (state.bpm && state.paceLabel && !state.paceNoted) { note(C.notes.pace(state.paceLabel, state.bpm)); state.paceNoted = true; }
    if (state.occasion === "intimate-dinner") note(C.notes.dinner);
    if (state.mood === "sad" || state.mood === "breakup-sad") note(C.notes.mood);
    note(C.notes.basedOn(C.create.basedOn[state.basedOn].label));
    note(C.notes.title);
    if (pool.length < 5) note(C.notes.fewer);
    render();
  }

  function playlistTitle() {
    const mood = state.mood ? titleCase(labelOf(state.mood)) : null;
    const occ = state.occasion ? titleCase(labelOf(state.occasion)) : null;
    const era = state.basedOn === "classics" ? `${state.era ? ERA_LABEL[state.era] + " " : ""}Classics` : null;
    const lead = mood || era;
    if (lead && occ) return C.result.titleEdition(lead, occ);
    if (lead || occ) return lead || occ;
    if (state.seeds.length) return `Like ${state.seeds[0].title}`;
    return C.create.basedOn[state.basedOn].label;
  }

  function whyLines() {
    const lines = [];
    if (state.seeds.length) {
      const p = seedProfile();
      const traits = [p.energy <= 2 ? "mellow" : p.energy >= 4 ? "high-energy" : "mid-energy", p.acoustic ? "acoustic" : null, `mostly ${p.decade}`].filter(Boolean).join(", ");
      lines.push(C.result.whySeeds(state.seeds.map((s) => s.title).join(" and "), traits));
    }
    if (state.mood) lines.push(C.result.whyVibe(labelOf(state.mood)));
    if (state.occasion === "running" && state.bpm) lines.push(C.result.whyRunning(state.bpm));
    else if (state.occasion === "intimate-dinner") lines.push(C.result.whyDinner);
    else if (state.occasion) lines.push(C.result.whyVibe(labelOf(state.occasion)));
    if (state.clean) lines.push(C.result.whyClean);
    lines.push(C.result.whyBasedOn(C.create.basedOn[state.basedOn].label, state.basedOn === "classics" && state.era ? ERA_LABEL[state.era] : ""));
    return lines;
  }

  // ---------- rendering ----------
  function render() {
    const screen = $("#screen");
    if (state.screen === "create") screen.innerHTML = renderCreate();
    if (state.screen === "result") screen.innerHTML = renderResult();
    if (state.screen === "fixed") screen.innerHTML = renderFixed();
    screen.insertAdjacentHTML("beforeend", renderSheet());
    bind();
  }

  function dirty() {
    return state.seeds.length || state.mood || state.occasion || state.basedOn !== "mine" || state.era || state.query;
  }

  function startOver() {
    notes = [];
    Object.assign(state, freshState());
    renderNotes();
    render();
    const input = $("#sayInput");
    if (input) input.focus();
  }

  function chips(ids, selected, group) {
    return ids.map((id) => `<button class="chip${selected === id || (byId[selected] && byId[selected].broader === id) ? " on" : ""}" data-${group}="${id}">${esc(labelOf(id))}</button>`).join("");
  }

  function renderCreate() {
    const c = C.create;
    const seeds = state.seeds.map((s) => `<span class="seed">${esc(s.title)}<button aria-label="Remove ${esc(s.title)}" data-unseed="${s.id}">×</button></span>`).join("");
    const based = Object.entries(c.basedOn).map(([k, v]) => `<button class="seg${state.basedOn === k ? " on" : ""}" data-based="${k}">${esc(v.label)}</button>`).join("");
    const eraRow = state.basedOn === "classics"
      ? `<div class="label small">${esc(c.eraLabel)}</div><div class="chips">${[`<button class="chip${!state.era ? " on" : ""}" data-era="">${esc(c.eraAny)}</button>`, ...ERAS.map((e) => `<button class="chip${state.era === e ? " on" : ""}" data-era="${e}">${ERA_LABEL[e]}</button>`)].join("")}</div>`
      : "";
    return `
      <div class="pad">
        ${dirty() ? `<div class="topbar"><span></span><button class="link" data-startover>${esc(c.startOver)}</button></div>` : ""}
        <h1>${esc(c.title)}</h1>
        <p class="muted">${esc(c.helper)}</p>
        <form class="say" id="say">
          <label class="label" for="sayInput">${esc(c.sayLabel)}</label>
          <div class="row"><input id="sayInput" autocomplete="off" placeholder="${esc(c.sayPlaceholder)}" value="${esc(state.query)}"><button class="go">${esc(c.saySend)}</button></div>
        </form>
        <div class="label">${esc(c.songsLabel)}</div>
        <p class="muted small">${esc(c.songsHelper)}</p>
        <div class="seeds">${seeds}</div>
        <div class="search">
          <input id="songSearch" autocomplete="off" placeholder="${esc(state.seeds.length >= 5 ? c.songsFull : c.songsPlaceholder)}" ${state.seeds.length >= 5 ? "disabled" : ""}>
          <div id="songResults" class="results"></div>
        </div>
        <div class="label">${esc(c.moodLabel)}</div>
        <div class="chips">${chips(MOOD_CHIPS, state.mood, "mood")}</div>
        <div class="label">${esc(c.occasionLabel)}</div>
        <div class="chips">${chips(OCCASION_CHIPS, state.occasion, "occasion")}</div>
        <div class="label">${esc(c.basedOnLabel)}</div>
        <div class="segs">${based}</div>
        <p class="muted small">${esc(c.basedOn[state.basedOn].helper)}</p>
        ${eraRow}
        <button class="primary" id="make">${esc(c.submit)}</button>
      </div>`;
  }

  function renderResult() {
    const r = C.result;
    const { songs, droppedForClean } = state.result;
    const fewer = songs.length < 5
      ? `<div class="notice">${esc(C.fixed.fewer(songs.length, state.era ? "the era" : state.occasion ? "the occasion" : "the mood"))} <button class="link" id="loosen">${esc(C.fixed.loosen)}</button></div>`
      : "";
    const clean = droppedForClean ? `<div class="notice">${esc(C.fixed.cleanDropped)}</div>` : "";
    const tempo = state.occasion === "running" && state.bpm
      ? `<div class="tempo"><button class="seg" id="slower">${esc(r.slower)}</button><span>${esc(r.tempoLabel(state.bpm))}</span><button class="seg" id="faster">${esc(r.faster)}</button></div>`
      : "";
    const rows = songs.map((s, i) => `
      <li class="song">
        <div class="art a${(i % 6) + 1}" aria-hidden="true"></div>
        <div class="meta"><div class="t">${esc(s.title)}</div><div class="muted small">${esc(s.artist)} · ${esc(s.decade)}${state.occasion === "running" ? ` · ${s.bpm} BPM` : ""}${s.explicit && state.clean ? " · clean" : ""}</div></div>
        <button class="icon" title="${esc(r.more)}" aria-label="${esc(r.more)}" data-more="${s.id}">＋</button>
        <button class="icon" title="${esc(r.less)}" aria-label="${esc(r.less)}" data-less="${s.id}">－</button>
      </li>`).join("");
    return `
      <div class="pad">
        <div class="topbar"><button class="back" id="back">‹ ${esc(r.back)}</button><button class="link" data-startover>${esc(C.create.startOver)}</button></div>
        <div class="cover" aria-hidden="true"></div>
        <h1 class="center">${esc(playlistTitle())}</h1>
        <div class="why"><div class="label small">${esc(r.whyTitle)}</div>${whyLines().map((l) => `<p>${esc(l)}</p>`).join("")}</div>
        ${tempo}${fewer}${clean}
        <ol class="songs">${rows}</ol>
      </div>`;
  }

  function renderFixed() {
    const f = C.fixed;
    const text = { business: f.business, empty: f.empty, support: f.support }[state.fixed];
    const extra = state.fixed === "support"
      ? `<button class="primary" id="calm">${esc(f.supportMusic)}</button><button class="secondary" id="back">${esc(f.supportBack)}</button>`
      : `<button class="secondary" id="back">${esc(C.result.back)}</button>`;
    const over = `<button class="link center-link" data-startover>${esc(C.create.startOver)}</button>`;
    return `<div class="pad fixed"><p class="fixed-text">${esc(text)}</p>${extra}${over}</div>`;
  }

  function renderSheet() {
    if (!state.sheet) return "";
    const { question, options, helper } = state.sheet;
    return `
      <div class="scrim"></div>
      <div class="sheet" role="dialog" aria-label="${esc(question)}">
        <div class="grabber"></div>
        <h2>${esc(question)}</h2>
        ${helper ? `<p class="muted small">${esc(helper)}</p>` : ""}
        <div class="options">${options.map(([label], i) => `<button class="option" data-opt="${i}">${esc(label)}</button>`).join("")}</div>
        <button class="link" id="cancel">${esc(C.questions.cancel)}</button>
      </div>`;
  }

  function renderNotes() {
    const list = $("#notes");
    if (!list) return;
    list.innerHTML = notes.length ? notes.map((n) => `<li>${esc(n)}</li>`).join("") : `<li class="muted empty">${esc(C.page.notesEmpty)}</li>`;
    list.scrollTop = list.scrollHeight;
  }

  // ---------- events ----------
  function bind() {
    const on = (sel, fn) => { const el = $(sel); if (el) el.addEventListener("click", fn); };
    document.querySelectorAll("[data-mood]").forEach((b) => b.addEventListener("click", () => { state.mood = state.mood === b.dataset.mood ? null : b.dataset.mood; render(); }));
    document.querySelectorAll("[data-occasion]").forEach((b) => b.addEventListener("click", () => { state.occasion = state.occasion === b.dataset.occasion ? null : b.dataset.occasion; state.bpm = null; render(); }));
    document.querySelectorAll("[data-based]").forEach((b) => b.addEventListener("click", () => { state.basedOn = b.dataset.based; if (state.basedOn !== "classics") state.era = null; state.eraAsked = state.basedOn === "classics"; render(); }));
    document.querySelectorAll("[data-era]").forEach((b) => b.addEventListener("click", () => { state.era = b.dataset.era || null; render(); }));
    document.querySelectorAll("[data-unseed]").forEach((b) => b.addEventListener("click", () => { state.seeds = state.seeds.filter((s) => s.id !== b.dataset.unseed); render(); }));
    document.querySelectorAll("[data-opt]").forEach((b) => b.addEventListener("click", () => { const fn = state.sheet.options[+b.dataset.opt][1]; state.sheet = null; fn(); next(); }));
    document.querySelectorAll("[data-more]").forEach((b) => b.addEventListener("click", () => { const s = CATALOG.find((x) => x.id === b.dataset.more); state.boosts.push(...s.vibes); buildResult(); }));
    document.querySelectorAll("[data-less]").forEach((b) => b.addEventListener("click", () => { state.removed.push(b.dataset.less); buildResult(); }));

    document.querySelectorAll("[data-startover]").forEach((b) => b.addEventListener("click", startOver));
    on("#cancel", () => { state.sheet = null; render(); });
    on("#make", () => { notes = []; renderNotes(); state.query = ""; state.found = null; next(); });
    on("#back", () => { resetTo(state.screen === "result" ? state : null); });
    on("#calm", () => { state.risk = false; state.mood = "chill"; state.screen = "create"; buildResult(); });
    on("#loosen", () => { state.loosen += 1; buildResult(); });
    on("#faster", () => { state.bpm += SYNC_STEP; note(C.notes.adjust(state.bpm)); buildResult(); });
    on("#slower", () => { state.bpm -= SYNC_STEP; note(C.notes.adjust(state.bpm)); buildResult(); });

    const say = $("#say");
    if (say) say.addEventListener("submit", (e) => { e.preventDefault(); runQuery($("#sayInput").value); });

    const search = $("#songSearch");
    if (search) search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      const box = $("#songResults");
      if (!q) { box.innerHTML = ""; return; }
      const hits = CATALOG.filter((s) => (s.title + " " + s.artist).toLowerCase().includes(q) && !state.seeds.some((x) => x.id === s.id)).slice(0, 5);
      box.innerHTML = hits.map((s) => `<button class="hit" data-seed="${s.id}">${esc(s.title)} <span class="muted">· ${esc(s.artist)}</span></button>`).join("");
      box.querySelectorAll("[data-seed]").forEach((b) => b.addEventListener("click", () => { state.seeds.push(CATALOG.find((s) => s.id === b.dataset.seed)); render(); }));
    });
  }

  function resetTo(keep) {
    const seeds = keep ? keep.seeds : [];
    Object.assign(state, freshState(), { seeds });
    render();
  }

  function runQuery(text) {
    if (!text.trim()) return;
    notes = [];
    const s = interpret(text);
    Object.assign(state, s, { seeds: state.seeds });
    renderNotes();
    next();
  }

  // ---------- page shell ----------
  function initPage() {
    const p = C.page;
    document.title = "Create a vibe";
    $("#pageTitle").textContent = p.title;
    $("#caseLink").textContent = p.caseStudy;
    $("#notesTitle").textContent = p.notesTitle;
    const toggle = $("#notesToggle");
    toggle.textContent = p.notesToggleOn;
    toggle.addEventListener("click", () => {
      const hidden = document.body.classList.toggle("notes-hidden");
      toggle.textContent = hidden ? p.notesToggleOff : p.notesToggleOn;
    });
    // Use Apple's official bezel if it's been added to assets/ (see README).
    const bezel = new Image();
    bezel.onload = () => { document.body.classList.add("has-bezel"); $("#bezel").src = bezel.src; };
    bezel.src = "assets/iphone-bezel.png";
    renderNotes();
    render();
    // ?try=... opens the prototype on a specific request (handy for portfolio links).
    const tryParam = new URLSearchParams(location.search).get("try");
    if (tryParam) { state.query = tryParam; render(); runQuery(tryParam); }
  }

  // Exposed for the test script only.
  window.__vibe = { interpret, state, next, buildResult, freshState, playlistTitle, get notes() { return notes; }, reset() { notes = []; Object.assign(state, freshState()); } };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPage);
  else initPage();
})();
