# "Create a vibe": flow and copy, v0 (2026-10-12)

Concept only; not affiliated with Apple. Labels and vibes come from `vibe_vocabulary_v0.csv`.

**Design rule for the whole flow:** every input is optional except one. The listener can start from songs, a mood, or an occasion, and the system only asks a question when the answer changes what plays.

## 1. Entry
- **Button:** Create a vibe
- **Screen title:** What's the vibe?
- **Helper:** Pick any of these. Skip what you don't care about.

## 2. Inputs

### Start with songs (optional)
- **Label:** Start with a few songs
- **Helper:** Up to 5. I'll find what they have in common.
- **Empty state:** Search for a song or artist

### Mood (optional, pick one)
- **Label:** How should it feel?
- **Chips:** Chill · Feel-good · Hype · Romantic · Sad · Breakup
- Picking **Breakup** opens the clarifying question in step 3. It never guesses.

### Occasion (optional, pick one)
- **Label:** What's it for?
- **Chips:** Intimate dinner · Party · Road trip · Workout · Running · Focus · Sleep
- **Not a chip:** business. It's reached by typing or saying it ("music for my café"), and leads to the negative path in step 5.

### Based on (required, default "My taste")
- **Label:** Based on
- **Options:**
  - **My taste:** Built from what you play most.
  - **Popular right now:** What lots of people are playing.
  - **Classics:** Songs that have lasted.
- **Why it's required:** this is the ranking choice. Most products make it silently; here the listener makes it. It's also the fallback when nothing else is picked.
- **Follow-up for Classics:** From when?
  - **Chips:** Any era · 60s · 70s · 80s · 90s · 2000s · 2010s (default: Any era)
  - **No 2020s chip.** A song from last year hasn't had time to last, so offering it would break the label's promise.
  - **The same picker answers "throwback."** "Throwback" depends on the listener, so the system asks "From when?" (or uses listening history) and never guesses from age.
- **Content-engineering note:** "Classics" needs a definition the data can check: **from the chosen era and still widely played today.** That keeps the promise for every chip, including 2010s, without a fixed "10+ years old" cutoff that would quietly drop the late 2010s.

## 3. Clarifying moments (only when the answer changes what plays)

| When | Question | Choices | Why ask |
|---|---|---|---|
| Mood = Breakup | Still in it, or over it? | Sad breakup · Over it · Missing them | Three different playlists. Guessing wrong is worse than asking. |
| Occasion = Running | What pace? | Pace picker: "10-minute mile · about 170 BPM" | Tempo has to match steps. Shown as an estimate (see `running_tempo_source.md`). |
| Occasion = Party | Clean versions only? | Yes · No | Explicit is a guest question, not a taste question. Ask once, remember it. |
| "Venue" or "public event" | Is this for a business? | Yes · No, it's a private event | The line the terms draw is commercial use, not size or setting. A wedding at a venue is private. |
| Seed songs and mood conflict (e.g. high-energy songs + Sleep) | Your songs are high-energy, but Sleep is quiet. Which should lead? | My songs · Sleep | Don't silently drop one input. |

**Never asked:** age, relationship status, or anything about the listener's state. "Sad" is a mood, not a signal. It gets sad songs, never crisis resources.

## 4. Result

### Playlist title (generated)
- **Pattern:** the listener's own words first, then the occasion. "Over It, Road Trip Edition," "Chill Dinner for Two."
- **Rules:** no more than 5 words; never repeat a label the listener didn't choose; no puns that need explaining.

### "Why these songs" (always shown, one line per input)
- Because you picked *Song A* and *Song B*: mellow, acoustic, mostly 2010s.
- Intimate dinner: softer vocals, clean versions.
- Based on: My taste.

The explanation states what the system used, never what it assumed about the person.

### Adjust
- **More like this / Less like this** on each song.
- **Running only:** Faster · Slower (about 4 BPM each tap). Label shows the current estimate: "about 174 BPM."

## 5. Fixed text (true every time it appears)

| Situation | Text | Why this wording |
|---|---|---|
| **Business** (negative path) | "Apple Music is for personal, noncommercial use, so it isn't licensed for playing at a business. For that, look for a business music service that includes a public performance license." | Uses the terms' own words ("personal, noncommercial"). Says what the license covers, not what the system can't do: it *can* make the playlist; the limit is where it's played. Fires on commercial use only; "venue" and "public event" get a question first. Checked against Apple Media Services Terms (US, updated 2026-09-14); terms vary by country. |
| Fewer matches than a full playlist | "I found [n] songs that fit. Want me to loosen [the mood / the occasion]?" | Uses the real count. Offers the fix instead of padding with songs that don't fit. |
| Some songs unavailable where they are | "Some songs aren't available where you are, so I left them out." | True whatever the reason (region, licensing, removed). Doesn't guess which. |
| Clean versions only | "Some songs were left out because they don't have a clean version." | Explains a smaller playlist without blaming the setting. |
| Nothing picked, no history | "Pick a song, a mood, or an occasion to get started." | The one required step, said plainly. |

## 6. Where content design meets content engineering
| Content design decides | Content engineering makes it hold |
|---|---|
| Vibe names in the listener's words ("Over it") | Preferred and alternate labels in the vocabulary |
| When to ask instead of guess (Breakup) | `ambiguous = yes` requires a question and real options, enforced by `validate_vocabulary.py` |
| "Based on" labels and promises | A checkable definition for each option (e.g. "Classics") |
| Fixed text that's true every time | One string per situation, with the trigger defined in the vocabulary |
| "A mood is never a crisis" | A rule in the vocabulary notes, and a must-not item in the eval set |

## Next
- Eval set: about 20 prompts ("breakup songs for the gym," "chill but not sleepy," "music for my café," "throwback party") with must-include and must-not-include.
- Low-fidelity screens for steps 1–4.

## Sources
- Running: `running_tempo_source.md`
- Personal, noncommercial use: Apple Media Services Terms and Conditions (US), https://www.apple.com/legal/internet-services/itunes/us/terms.html
- Business use usually needs a public performance license (Australia; rules vary by country): OneMusic, https://onemusic.com.au/news/can-i-play-apple-music-in-my-business-legally/
