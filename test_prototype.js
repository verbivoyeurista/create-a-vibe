// Runs the golden-set prompts through the prototype's logic (no browser needed).
// node test_prototype.js
const fs = require("fs"), vm = require("vm"), path = require("path");
const el = () => ({ innerHTML: "", textContent: "", insertAdjacentHTML() {}, addEventListener() {}, querySelectorAll: () => [], classList: { add() {}, toggle() {} } });
const ctx = { console, Image: function () {}, document: { readyState: "loading", addEventListener() {}, querySelector: el, querySelectorAll: () => [], body: { classList: { add() {}, toggle() {} } } } };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ["data/vocabulary.js", "data/catalog.js", "content.js", "app.js"]) vm.runInContext(fs.readFileSync(path.join(__dirname, "docs", f), "utf8"), ctx);
const V = ctx.__vibe;

function run(prompt, setup) {
  V.reset();
  const s = V.interpret(prompt);
  Object.assign(V.state, s);
  if (setup) setup(V.state);
  V.next();
  const st = V.state;
  if (st.sheet) return { action: "ask", detail: st.sheet.question };
  if (st.screen === "fixed") return { action: st.fixed === "business" ? "negative path" : st.fixed === "support" ? "support" : "fixed:" + st.fixed, detail: "" };
  return { action: "play", detail: `${V.playlistTitle()} | ${st.result.songs.length} songs: ${st.result.songs.slice(0, 3).map(x => x.title).join(", ")}${st.bpm ? " | bpm " + st.bpm : ""}` };
}
const cases = [
  ["play breakup music", "ask", "Still in it"],
  ["breakup songs but I'm over it", "play"],
  ["breakup songs for the gym", "play"],
  ["sad girl music", "play"],
  ["songs for when I want to cry", "play"],
  ["I want to kill myself, just play something", "support"],
  ["chill but not sleepy", "play"],
  ["running music", "ask", "pace"],
  ["running music for a 10 minute mile", "play"],
  ["music for my café", "negative path"],
  ["playlist for my wedding reception, 200 people", "ask", "Clean"],
  ["something for the venue", "ask", "business"],
  ["throwback party", "ask", "From when"],
  ["90s classics for a road trip", "play"],
  ["classics", "ask", "From when"],
  ["bangers", "play"],
  ["lit playlist", "ask", "Hype"],
  ["emo", "ask", "genre"],
  ["date night dinner", "play"],
];
let fail = 0;
for (const [p, want, contains] of cases) {
  const r = run(p);
  const ok = r.action === want && (!contains || r.detail.includes(contains));
  if (!ok) fail++;
  console.log(`${ok ? "ok  " : "FAIL"} ${p.padEnd(48)} → ${r.action}${r.detail ? " | " + r.detail : ""}`);
}
// "not" must actually rule something out, and no Sleep songs may appear.
{
  run("chill but not sleepy");
  const st = V.state, sleepy = st.result.songs.filter(x => x.vibes.includes("sleep"));
  const ok = st.excluded.includes("sleep") && sleepy.length === 0;
  if (!ok) fail++;
  console.log(`${ok ? "ok  " : "FAIL"} ${"chill but not sleepy: excludes Sleep".padEnd(48)} → excluded ${JSON.stringify(st.excluded)}, sleep songs ${sleepy.length}`);
}
// conflict case: high-energy seeds + Sleep
const seeds = ["s21", "s22", "s05"].map(id => ctx.CATALOG.find(s => s.id === id));
const r = run("", st => { st.seeds = seeds; st.occasion = "sleep"; st.query = ""; });
console.log(`${r.action === "ask" ? "ok  " : "FAIL"} ${"[3 high-energy seeds] + Sleep".padEnd(48)} → ${r.action} | ${r.detail}`);
if (r.action !== "ask") fail++;
console.log(fail ? `\n${fail} failing` : "\nall passing");
