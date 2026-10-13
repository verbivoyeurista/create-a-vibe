# Music: "Create a vibe" concept (portfolio piece)

A self-directed concept applying the GoodRx agent work to music recommendations, using no GoodRx data. Built by Brittney with Claude. Not affiliated with Apple; no Apple logos or brand assets.

## Portfolio entry (copy of PORTFOLIO_candidates.md #4, 2026-10-12)
**The story:** a self-directed concept that applies the GoodRx principles to music recommendations, without using any GoodRx data. Covers loose requests ("breakup music," "running music at my pace," "create a vibe" from seed songs, mood, event type, and a "based on" choice of my taste, popular hits or classics), and where content design meets content engineering: a controlled vibe vocabulary, aliases, when to ask instead of guess, ranking choices made visible, fixed text that's true every time, and an eval set.
**Why it's useful:** shows the GoodRx thinking (resolve before search, ambiguity rules enforced by tests, offer don't label, golden datasets) in a domain anyone can read, with nothing proprietary.
**Before publishing:** label it as an unaffiliated concept; no Apple logos or brand assets; say Claude helped.

## Files
| File | What it is |
|---|---|
| `vibe_vocabulary_v0.csv` | 18 vibes across 4 facets, with alternate labels, broader terms, measurable signals and ask-instead-of-guess rules |
| `ambiguous_terms_v0.csv` | 6 terms deliberately not mapped to one vibe (the music version of ISMP's error-prone list) |
| `running_tempo_source.md` | Sources for pace → tempo (Leacox et al. 2025; Buhmann et al. 2018) and what they allow us to say |
| `create_a_vibe_flow_v0.md` | The flow: inputs, clarifying moments, result, adjust, fixed text, and the design/engineering split |
| `golden_set_v0.csv` | 23 test prompts with expected action (play / ask / adjust / negative path), must-include and must-not-include, and the principle each one tests |
| `docs/` | The prototype site (GitHub Pages serves this folder). Plain HTML/CSS/JS, no build step |
| `docs/case-study.html` | The case study page (linked from the prototype) |
| `docs/files/` | Copies of the CSVs, check and sources, published so the case study can link to them (written by `build_data.py`) |
| `docs/content.js` | Every line of prototype copy, keyed by where it appears, including the fixed text and the Behind the scenes notes |
| `build_data.py` | Turns the vocabulary CSVs into `docs/data/vocabulary.js`, so the CSVs stay the single source of truth |
| `test_prototype.js` | Runs the golden-set prompts through the prototype's logic: `node test_prototype.js` |
| `validate_vocabulary.py` | The schema gate: content rules written as checks. `python3 validate_vocabulary.py` |

## How the vocabulary is structured
Modeled on SKOS (the W3C standard for controlled vocabularies): a preferred label, alternate labels, and broader terms.

- **Facets:** `mood` (how it feels), `theme` (what it's about), `activity` (what you're doing), `setting` (where and with whom). A request can combine them: "sad songs for a road trip" is a mood plus an activity.
- **Measurable signals:** energy, valence (how positive it sounds), tempo, lyrics, explicit default. Kept as plain bands, not numbers, until there's a real catalog to calibrate against.
- **Ask, don't guess:** `ambiguous = yes` requires a clarifying question and real options. `needs_input` (e.g. running needs a pace) requires a question to ask for it.

## Design decisions worth showing
1. **"Breakup" is ambiguous on purpose.** Sad, over it, or missing them are different playlists. The system asks "Still in it, or over it?" with quick choices. (GoodRx parallel: ambiguous abbreviations ask instead of resolving silently.)
2. **Lead with the listener's words.** The empowered breakup vibe is labeled "Over it," not "Empowered breakup."
3. **A mood is never a crisis signal.** "Sad," "crying music" and "in my feels" get matching songs, never crisis resources. Matching the mood is the help. (GoodRx parallel: offer, don't label; trigger only on explicit risk.)
4. **Settings add constraints, not just moods.** Intimate dinner turns explicit off; a party asks once about clean versions. A business or public venue is a negative path: a clear limit and a better option, not a playlist. "Large" isn't the trigger; a big wedding is private.
5. **Running translates units honestly.** "10-minute mile · about 170 BPM" (Leacox et al. 2025: 169 steps per minute at 10:00/mile). Pace barely moves cadence and people vary more, so the copy says "about" and Faster / Slower does the real work.
6. **"Throwback" isn't mapped.** It's relative to the listener. Use listening history, never infer age.
7. **One label, one vibe, enforced by a test.** Adding "bangers" to Party fails the check because Hype already owns it; adding "vibes" anywhere fails because it's on the ambiguous list.

## GoodRx principles this carries over (methods only)
- Figure out what the user means before searching.
- Leave ambiguous terms out on purpose, and enforce it with a test.
- Ranking is a deliberate choice; "based on: my taste / popular hits / classics" makes it the user's.
- Complete lists beat top hits.
- Fixed text has to be true every time it appears.
- Offer, don't label.
- Check claims against a real source before using them.

## Next

## The prototype
Open `docs/index.html` in a browser. Add `?try=breakup%20songs%20for%20the%20gym` to the URL to open on a specific request (useful for portfolio links).

**After any vocabulary edit:** `python3 validate_vocabulary.py && python3 build_data.py && node test_prototype.js`

**Publishing on GitHub Pages (personal account):**
1. Create a new public repo on your personal GitHub (e.g. `create-a-vibe`).
2. Put the contents of this `music` folder at the repo's root and push.
3. Repo → Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder: `/docs` → Save.
4. The site appears at `https://<your-username>.github.io/create-a-vibe/` within a few minutes.

**Using Apple's official iPhone bezel (optional):** download the iPhone 17 bezel PNG from Apple's Design Resources page yourself, read its license (reportedly limited to mock-ups of software on Apple platforms), and save it as `docs/assets/iphone-bezel.png`. The page switches to it automatically. If the screen doesn't line up, adjust `--bezel-inset-top` and `--bezel-inset-side` in `docs/styles.css`. Without the file, the page uses its own CSS frame.
