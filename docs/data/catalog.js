// Sample catalog: fictional songs and artists, made up for this prototype.
// energy and valence are 1 (low) to 5 (high). bpm is the song's tempo.
// mine = in the demo listener's history. pop = popular right now. lasting = still widely played.
window.CATALOG = [
  // Breakup: sad
  { id: "s01", title: "Paper Thin Goodbye", artist: "Juniper Hale", decade: "2010s", energy: 1, valence: 1, vibes: ["breakup-sad", "sad", "heartbreak"], bpm: 72, explicit: false, clean: true, pop: 3, lasting: 4, mine: true, acoustic: true },
  { id: "s02", title: "Kitchen Light at 3 A.M.", artist: "The Quiet Year", decade: "2020s", energy: 1, valence: 1, vibes: ["breakup-sad", "sad"], bpm: 68, explicit: false, clean: true, pop: 4, lasting: 2, mine: false, acoustic: true },
  { id: "s03", title: "Still Your Sweater", artist: "Mara Okafor", decade: "2000s", energy: 2, valence: 1, vibes: ["breakup-sad", "heartbreak"], bpm: 80, explicit: false, clean: true, pop: 2, lasting: 4, mine: true, acoustic: false },
  { id: "s04", title: "Rain on the Overpass", artist: "Delta Lowe", decade: "1990s", energy: 2, valence: 1, vibes: ["breakup-sad", "sad"], bpm: 76, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
  // Breakup: over it
  { id: "s05", title: "New Number, Who Dis", artist: "Vela Rae", decade: "2020s", energy: 5, valence: 5, vibes: ["breakup-empowered", "hype", "workout"], bpm: 172, explicit: true, clean: true, pop: 5, lasting: 2, mine: true, acoustic: false },
  { id: "s06", title: "Better in Gold", artist: "Sunny Marchetti", decade: "2010s", energy: 4, valence: 5, vibes: ["breakup-empowered", "happy"], bpm: 124, explicit: false, clean: true, pop: 4, lasting: 4, mine: true, acoustic: false },
  { id: "s07", title: "Keys on the Table", artist: "The Harlow Set", decade: "2000s", energy: 5, valence: 4, vibes: ["breakup-empowered", "workout", "running"], bpm: 170, explicit: false, clean: true, pop: 3, lasting: 5, mine: false, acoustic: false },
  { id: "s08", title: "Lighter Without You", artist: "Kit Navarro", decade: "1980s", energy: 4, valence: 5, vibes: ["breakup-empowered", "road-trip"], bpm: 132, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
  { id: "s09", title: "Unfollow", artist: "Pressa June", decade: "2020s", energy: 5, valence: 4, vibes: ["breakup-empowered", "hype", "party"], bpm: 128, explicit: true, clean: false, pop: 5, lasting: 2, mine: false, acoustic: false },
  // Breakup: missing them
  { id: "s10", title: "Polaroids in a Shoebox", artist: "Ellis Wren", decade: "2010s", energy: 2, valence: 3, vibes: ["breakup-nostalgic", "heartbreak"], bpm: 92, explicit: false, clean: true, pop: 3, lasting: 4, mine: true, acoustic: true },
  { id: "s11", title: "Summer We Had", artist: "Coast & Cartwright", decade: "1970s", energy: 2, valence: 3, vibes: ["breakup-nostalgic", "road-trip"], bpm: 98, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: true },
  { id: "s12", title: "Your Song Came On", artist: "Mara Okafor", decade: "2020s", energy: 2, valence: 2, vibes: ["breakup-nostalgic", "sad"], bpm: 84, explicit: false, clean: true, pop: 4, lasting: 2, mine: true, acoustic: false },
  // Chill
  { id: "s13", title: "Slow Sunday", artist: "Lumen Bay", decade: "2010s", energy: 2, valence: 4, vibes: ["chill", "focus"], bpm: 88, explicit: false, clean: true, pop: 3, lasting: 4, mine: true, acoustic: true },
  { id: "s14", title: "Linen", artist: "Hollis Park", decade: "2020s", energy: 2, valence: 4, vibes: ["chill", "intimate-dinner"], bpm: 94, explicit: false, clean: true, pop: 4, lasting: 2, mine: false, acoustic: true },
  { id: "s15", title: "Porch Swing Theory", artist: "Ada Fontaine", decade: "1970s", energy: 2, valence: 4, vibes: ["chill", "road-trip"], bpm: 100, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: true },
  { id: "s16", title: "Low Tide Radio", artist: "Lumen Bay", decade: "2000s", energy: 3, valence: 4, vibes: ["chill", "happy"], bpm: 108, explicit: false, clean: true, pop: 2, lasting: 4, mine: true, acoustic: false },
  // Feel-good
  { id: "s17", title: "Windows Down", artist: "Sunny Marchetti", decade: "2010s", energy: 4, valence: 5, vibes: ["happy", "road-trip"], bpm: 118, explicit: false, clean: true, pop: 4, lasting: 4, mine: true, acoustic: false },
  { id: "s18", title: "Good Day Machine", artist: "The Brightsiders", decade: "1960s", energy: 4, valence: 5, vibes: ["happy", "road-trip", "party"], bpm: 126, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
  { id: "s19", title: "Sugar Rush Avenue", artist: "Pressa June", decade: "2020s", energy: 5, valence: 5, vibes: ["happy", "party", "hype"], bpm: 122, explicit: false, clean: true, pop: 5, lasting: 2, mine: false, acoustic: false },
  { id: "s20", title: "Saturday Shine", artist: "Coast & Cartwright", decade: "1980s", energy: 4, valence: 5, vibes: ["happy", "party"], bpm: 120, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
  // Hype / workout / running
  { id: "s21", title: "Redline", artist: "Volt Sisters", decade: "2010s", energy: 5, valence: 3, vibes: ["hype", "workout", "running"], bpm: 168, explicit: false, clean: true, pop: 4, lasting: 4, mine: true, acoustic: false },
  { id: "s22", title: "Pavement Heart", artist: "Kip Adeyemi", decade: "2020s", energy: 5, valence: 4, vibes: ["running", "workout"], bpm: 170, explicit: false, clean: true, pop: 4, lasting: 2, mine: false, acoustic: false },
  { id: "s23", title: "Mile Marker", artist: "The Harlow Set", decade: "2010s", energy: 5, valence: 4, vibes: ["running", "workout"], bpm: 172, explicit: false, clean: true, pop: 3, lasting: 4, mine: true, acoustic: false },
  { id: "s24", title: "Second Wind", artist: "Volt Sisters", decade: "2000s", energy: 5, valence: 4, vibes: ["running", "hype"], bpm: 174, explicit: false, clean: true, pop: 3, lasting: 5, mine: false, acoustic: false },
  { id: "s25", title: "Stride", artist: "Kip Adeyemi", decade: "2020s", energy: 5, valence: 3, vibes: ["running", "workout"], bpm: 176, explicit: true, clean: true, pop: 5, lasting: 2, mine: true, acoustic: false },
  { id: "s26", title: "Fast Lane Hymn", artist: "Dara Quist", decade: "1990s", energy: 5, valence: 4, vibes: ["running", "road-trip"], bpm: 178, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
  { id: "s27", title: "Heat Check", artist: "Pressa June", decade: "2020s", energy: 5, valence: 4, vibes: ["running", "hype", "party"], bpm: 166, explicit: true, clean: false, pop: 5, lasting: 2, mine: false, acoustic: false },
  { id: "s28", title: "Cadence", artist: "Ellis Wren", decade: "2010s", energy: 4, valence: 4, vibes: ["running"], bpm: 164, explicit: false, clean: true, pop: 3, lasting: 3, mine: true, acoustic: false },
  { id: "s29", title: "Bassline Sprint", artist: "Volt Sisters", decade: "2020s", energy: 5, valence: 4, vibes: ["running", "workout", "hype"], bpm: 180, explicit: false, clean: true, pop: 4, lasting: 2, mine: false, acoustic: false },
  { id: "s30", title: "Iron and Glitter", artist: "Kit Navarro", decade: "1980s", energy: 5, valence: 4, vibes: ["workout", "hype"], bpm: 140, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
  // Romantic / dinner
  { id: "s31", title: "Candle Math", artist: "Hollis Park", decade: "2010s", energy: 2, valence: 4, vibes: ["romantic", "intimate-dinner"], bpm: 78, explicit: false, clean: true, pop: 3, lasting: 4, mine: true, acoustic: true },
  { id: "s32", title: "Velvet Hour", artist: "Odette Lane", decade: "1960s", energy: 2, valence: 4, vibes: ["romantic", "intimate-dinner"], bpm: 82, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: true },
  { id: "s33", title: "Second Glass", artist: "Ada Fontaine", decade: "1970s", energy: 2, valence: 4, vibes: ["intimate-dinner", "chill"], bpm: 90, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: true },
  { id: "s34", title: "Slow Dance in the Kitchen", artist: "Juniper Hale", decade: "2020s", energy: 2, valence: 5, vibes: ["romantic"], bpm: 74, explicit: false, clean: true, pop: 4, lasting: 2, mine: true, acoustic: true },
  { id: "s35", title: "After Hours", artist: "Nico Vale", decade: "2000s", energy: 3, valence: 3, vibes: ["romantic", "chill"], bpm: 96, explicit: true, clean: false, pop: 3, lasting: 4, mine: false, acoustic: false },
  // Sad
  { id: "s36", title: "Grey Cardigan Weather", artist: "The Quiet Year", decade: "2010s", energy: 1, valence: 1, vibes: ["sad"], bpm: 70, explicit: false, clean: true, pop: 3, lasting: 4, mine: true, acoustic: true },
  { id: "s37", title: "Dial Tone", artist: "Delta Lowe", decade: "1990s", energy: 2, valence: 1, vibes: ["sad", "heartbreak"], bpm: 82, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
  // Focus / sleep
  { id: "s38", title: "Graph Paper", artist: "Lumen Bay", decade: "2020s", energy: 2, valence: 3, vibes: ["focus"], bpm: 90, explicit: false, clean: true, pop: 3, lasting: 2, mine: true, acoustic: false, instrumental: true },
  { id: "s39", title: "Margins", artist: "Teo Brandt", decade: "2010s", energy: 2, valence: 3, vibes: ["focus", "chill"], bpm: 86, explicit: false, clean: true, pop: 2, lasting: 4, mine: false, acoustic: true, instrumental: true },
  { id: "s40", title: "Lanterns Out", artist: "Teo Brandt", decade: "2010s", energy: 1, valence: 3, vibes: ["sleep"], bpm: 60, explicit: false, clean: true, pop: 2, lasting: 4, mine: true, acoustic: true, instrumental: true },
  { id: "s41", title: "Feather Weight", artist: "Odette Lane", decade: "2020s", energy: 1, valence: 3, vibes: ["sleep", "chill"], bpm: 64, explicit: false, clean: true, pop: 3, lasting: 2, mine: false, acoustic: true, instrumental: true },
  // Party / road trip
  { id: "s42", title: "Everybody in the Pool", artist: "The Brightsiders", decade: "1990s", energy: 5, valence: 5, vibes: ["party", "happy"], bpm: 124, explicit: false, clean: true, pop: 3, lasting: 5, mine: false, acoustic: false },
  { id: "s43", title: "Afterparty Forecast", artist: "Vela Rae", decade: "2020s", energy: 5, valence: 4, vibes: ["party", "hype"], bpm: 126, explicit: true, clean: true, pop: 5, lasting: 2, mine: true, acoustic: false },
  { id: "s44", title: "Turn It Up, Mom", artist: "Dara Quist", decade: "2000s", energy: 5, valence: 5, vibes: ["party", "road-trip"], bpm: 128, explicit: false, clean: true, pop: 3, lasting: 5, mine: false, acoustic: false },
  { id: "s45", title: "Interstate Singalong", artist: "Coast & Cartwright", decade: "1990s", energy: 4, valence: 5, vibes: ["road-trip", "happy"], bpm: 116, explicit: false, clean: true, pop: 2, lasting: 5, mine: true, acoustic: false },
  { id: "s46", title: "Mixtape for the Ride", artist: "Kit Navarro", decade: "1980s", energy: 4, valence: 4, vibes: ["road-trip"], bpm: 112, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
  { id: "s47", title: "Gas Station Sunglasses", artist: "Sunny Marchetti", decade: "2020s", energy: 4, valence: 5, vibes: ["road-trip", "happy"], bpm: 120, explicit: false, clean: true, pop: 5, lasting: 2, mine: false, acoustic: false },
  { id: "s48", title: "Neon Prom", artist: "Nico Vale", decade: "1980s", energy: 4, valence: 4, vibes: ["party", "breakup-nostalgic"], bpm: 118, explicit: false, clean: true, pop: 2, lasting: 5, mine: false, acoustic: false },
];
