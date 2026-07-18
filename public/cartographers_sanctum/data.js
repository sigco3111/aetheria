/* Sample cartography data — dense, handcrafted, never empty */
window.SANCTUM_DATA = (function () {
  const RELICS = [
    { id: "all", name: "All", symbol: "✧", tags: null },
    { id: "cities", name: "Cities", symbol: "🏛", tags: ["city", "village", "capital"] },
    { id: "castles", name: "Castles", symbol: "🏰", tags: ["castle", "fort", "tower"] },
    { id: "dungeons", name: "Dungeons", symbol: "🕳", tags: ["dungeon", "cave", "ruin"] },
    { id: "bosses", name: "Bosses", symbol: "☠", tags: ["boss", "dragon", "enemy"] },
    { id: "treasure", name: "Treasure", symbol: "💎", tags: ["treasure", "loot", "chest"] },
    { id: "shrines", name: "Shrines", symbol: "⛩", tags: ["shrine", "temple", "altar"] },
    { id: "nature", name: "Nature", symbol: "🌲", tags: ["forest", "lake", "mountain", "river"] },
    { id: "travel", name: "Travel", symbol: "⛵", tags: ["fast-travel", "port", "road", "camp"] },
    { id: "quests", name: "Quests", symbol: "⚔", tags: ["quest", "npc", "merchant"] },
    { id: "secrets", name: "Secrets", symbol: "👁", tags: ["secret", "lore", "hidden"] },
    { id: "photo", name: "Vista", symbol: "📷", tags: ["photo", "vista"] },
    { id: "craft", name: "Craft", symbol: "⚗", tags: ["craft", "resource", "fishing"] },
    { id: "community", name: "Notes", symbol: "✉", tags: ["community"] },
  ];

  const COLLECTIONS = [
    { id: "dragons", name: "Hidden Dragons", count: 14, spine: "#6b1e1e", tags: ["dragon", "boss"] },
    { id: "lakes", name: "Beautiful Lakes", count: 22, spine: "#1e4a6b", tags: ["lake", "photo"] },
    { id: "weapons", name: "Legendary Weapons", count: 31, spine: "#6b5a1e", tags: ["treasure", "loot"] },
    { id: "dungeons", name: "Best Dungeons", count: 18, spine: "#3d2a4a", tags: ["dungeon"] },
    { id: "completion", name: "100% Completion", count: 9, spine: "#1e6b3a", tags: ["quest", "secret"] },
    { id: "underground", name: "Underground Cities", count: 7, spine: "#2a2a2a", tags: ["city", "cave"] },
    { id: "villages", name: "Favorite Villages", count: 26, spine: "#5a3a1e", tags: ["village"] },
    { id: "speedrun", name: "Speedrun Routes", count: 12, spine: "#4a1e6b", tags: ["fast-travel", "road"] },
  ];

  const CREATORS = [
    "Elandra Quill", "Thorn Mapwright", "Sister Vellum", "Kael the Surveyor",
    "Mira Inkhand", "Old Cartos", "Rune of Ashfall", "Lysa Nightchart",
    "Brother Compass", "Ivy Wayfinder", "Dorian Sealwright", "Nessa Deepink",
  ];

  const WORLDS = [
    {
      id: "skyrim",
      name: "Skyrim",
      realm: "Tamriel",
      game: "The Elder Scrolls V: Skyrim",
      rating: 4.9,
      completion: 67,
      size: "37 km²",
      discoveries: 842,
      art: "linear-gradient(135deg,#2a3a4a 0%,#1a2a1a 40%,#3a2a1a 100%)",
      palette: { land: "#4a5a3a", water: "#2a4a5a", peak: "#8a8a8a", snow: "#d8e0e8", forest: "#2a4a28" },
      blurb: "A frozen province of dragons, ancient barrows, and whispered prophecies.",
    },
    {
      id: "elden",
      name: "The Lands Between",
      realm: "Elden Ring",
      game: "Elden Ring",
      rating: 4.95,
      completion: 41,
      size: "Vast",
      discoveries: 1204,
      art: "linear-gradient(135deg,#5a3a2a 0%,#3a2a4a 50%,#1a1a2a 100%)",
      palette: { land: "#6a5a3a", water: "#3a5a6a", peak: "#7a6a5a", snow: "#c8c0b0", forest: "#3a4a2a" },
      blurb: "A shattered realm ruled by demigods, grace, and golden rot.",
    },
    {
      id: "witcher",
      name: "The Continent",
      realm: "The Witcher 3",
      game: "The Witcher 3: Wild Hunt",
      rating: 4.92,
      completion: 73,
      size: "136 km²",
      discoveries: 956,
      art: "linear-gradient(135deg,#2a3a2a 0%,#3a2a1a 45%,#1a2a3a 100%)",
      palette: { land: "#4a5a30", water: "#2a4555", peak: "#6a655a", snow: "#d0d8e0", forest: "#243a20" },
      blurb: "War-torn kingdoms, haunted woods, and contracts written in blood.",
    },
    {
      id: "botw",
      name: "Hyrule",
      realm: "Breath of the Wild",
      game: "The Legend of Zelda: Breath of the Wild",
      rating: 4.97,
      completion: 58,
      size: "360 km²",
      discoveries: 1102,
      art: "linear-gradient(135deg,#3a6a4a 0%,#5a8a3a 40%,#2a5a8a 100%)",
      palette: { land: "#6a8a4a", water: "#3a7aaa", peak: "#9a9a8a", snow: "#eef4ff", forest: "#2f6a32" },
      blurb: "A wild kingdom reborn—towers, shrines, and endless horizons.",
    },
    {
      id: "totk",
      name: "Hyrule & Skies",
      realm: "Tears of the Kingdom",
      game: "The Legend of Zelda: Tears of the Kingdom",
      rating: 4.94,
      completion: 39,
      size: "Layered",
      discoveries: 1380,
      art: "linear-gradient(135deg,#4a7a9a 0%,#6a8a4a 40%,#5a3a2a 100%)",
      palette: { land: "#5a7a40", water: "#2a6a9a", peak: "#8a7a6a", snow: "#e8f0ff", forest: "#2a5a30" },
      blurb: "Sky islands, depths, and a kingdom rewritten by ancient power.",
    },
    {
      id: "rdr2",
      name: "America, 1899",
      realm: "Red Dead Redemption 2",
      game: "Red Dead Redemption 2",
      rating: 4.91,
      completion: 52,
      size: "75 km²",
      discoveries: 780,
      art: "linear-gradient(135deg,#5a4a2a 0%,#3a5a3a 50%,#2a3a5a 100%)",
      palette: { land: "#6a6a3a", water: "#2a4a5a", peak: "#7a6a5a", snow: "#dce4ec", forest: "#2a4a28" },
      blurb: "Frontier wilderness, dying outlaws, and maps drawn in dust.",
    },
    {
      id: "tsushima",
      name: "Tsushima",
      realm: "Ghost of Tsushima",
      game: "Ghost of Tsushima",
      rating: 4.88,
      completion: 61,
      size: "Island",
      discoveries: 640,
      art: "linear-gradient(135deg,#8a3a4a 0%,#3a5a3a 50%,#2a2a3a 100%)",
      palette: { land: "#5a6a3a", water: "#2a4a6a", peak: "#6a6058", snow: "#e0e8f0", forest: "#2a4a30" },
      blurb: "Wind-swept islands, fox shrines, and the path of the ghost.",
    },
    {
      id: "kcd",
      name: "Bohemia",
      realm: "Kingdom Come",
      game: "Kingdom Come: Deliverance",
      rating: 4.7,
      completion: 44,
      size: "16 km²",
      discoveries: 410,
      art: "linear-gradient(135deg,#4a4a3a 0%,#3a4a2a 50%,#2a2a2a 100%)",
      palette: { land: "#5a5a38", water: "#3a5058", peak: "#6a6558", snow: "#d8dce0", forest: "#2e4228" },
      blurb: "Medieval Bohemia without magic—only mud, steel, and honor.",
    },
    {
      id: "dogma",
      name: "Gransys",
      realm: "Dragon's Dogma",
      game: "Dragon's Dogma",
      rating: 4.65,
      completion: 48,
      size: "Wide",
      discoveries: 520,
      art: "linear-gradient(135deg,#3a2a4a 0%,#2a3a2a 50%,#4a2a1a 100%)",
      palette: { land: "#4a5a35", water: "#2a4558", peak: "#6a5a4a", snow: "#d0d8e0", forest: "#284028" },
      blurb: "Pawns, wyverns, and a world that remembers your choices.",
    },
    {
      id: "nms",
      name: "Euclid Galaxy",
      realm: "No Man's Sky",
      game: "No Man's Sky",
      rating: 4.6,
      completion: 22,
      size: "18 Q planets",
      discoveries: 2400,
      art: "linear-gradient(135deg,#1a2a4a 0%,#2a1a4a 40%,#1a4a3a 100%)",
      palette: { land: "#3a6a5a", water: "#1a3a6a", peak: "#5a4a6a", snow: "#c8d8f0", forest: "#1a5a40" },
      blurb: "Infinite stars, procedural shores, and the atlas interface.",
    },
    {
      id: "hogwarts",
      name: "The Highlands",
      realm: "Hogwarts Legacy",
      game: "Hogwarts Legacy",
      rating: 4.75,
      completion: 55,
      size: "Castle+",
      discoveries: 690,
      art: "linear-gradient(135deg,#2a2a4a 0%,#3a2a1a 45%,#1a3a2a 100%)",
      palette: { land: "#4a5a38", water: "#2a4560", peak: "#6a655a", snow: "#e0e6f0", forest: "#2a4028" },
      blurb: "Castles, forbidden forests, and maps that rearrange themselves.",
    },
    {
      id: "cyber",
      name: "Night City",
      realm: "Cyberpunk 2077",
      game: "Cyberpunk 2077",
      rating: 4.7,
      completion: 49,
      size: "Metro",
      discoveries: 880,
      art: "linear-gradient(135deg,#1a0a2a 0%,#2a1a3a 40%,#0a2a3a 100%)",
      palette: { land: "#3a3a48", water: "#1a3a4a", peak: "#5a4a5a", snow: "#b0b8c8", forest: "#2a3a30" },
      blurb: "Neon cartography of a city that never sleeps—or forgives.",
    },
    {
      id: "minecraft",
      name: "Overworld",
      realm: "Minecraft",
      game: "Minecraft",
      rating: 4.85,
      completion: 33,
      size: "Infinite",
      discoveries: 9999,
      art: "linear-gradient(135deg,#3a7a3a 0%,#5a8a3a 40%,#3a5a8a 100%)",
      palette: { land: "#5a8a3a", water: "#2a6aaa", peak: "#8a8a8a", snow: "#f0f4ff", forest: "#2a6a28" },
      blurb: "Block-born continents, deep dark cities, and player-made myths.",
    },
    {
      id: "valheim",
      name: "The Tenth World",
      realm: "Valheim",
      game: "Valheim",
      rating: 4.8,
      completion: 46,
      size: "Procedural",
      discoveries: 560,
      art: "linear-gradient(135deg,#2a3a4a 0%,#1a3a2a 50%,#3a2a1a 100%)",
      palette: { land: "#3a5a38", water: "#1a3a4a", peak: "#6a6a6a", snow: "#d8e4f0", forest: "#1a3a22" },
      blurb: "Viking afterlife—biomes ring the world-tree's shadow.",
    },
    {
      id: "ac",
      name: "Historical Earth",
      realm: "Assassin's Creed",
      game: "Assassin's Creed Odyssey",
      rating: 4.72,
      completion: 51,
      size: "Greece",
      discoveries: 920,
      art: "linear-gradient(135deg,#2a5a7a 0%,#5a7a4a 45%,#7a5a2a 100%)",
      palette: { land: "#6a7a45", water: "#2a6a9a", peak: "#8a7a6a", snow: "#e8eef8", forest: "#3a5a30" },
      blurb: "Aegean isles, oracles, and eagle-eyed cartography.",
    },
    {
      id: "aetherion",
      name: "Aetherion",
      realm: "Community Atlas",
      game: "Aetherion (Fictional)",
      rating: 4.83,
      completion: 28,
      size: "Archipelago",
      discoveries: 334,
      art: "linear-gradient(135deg,#2a1a4a 0%,#1a3a5a 40%,#3a2a1a 100%)",
      palette: { land: "#4a4a6a", water: "#1a2a5a", peak: "#7a6a8a", snow: "#d0d0f0", forest: "#2a3a4a" },
      blurb: "Floating isles bound by star-bridges—mapped by the Sanctum itself.",
    },
    {
      id: "ashmere",
      name: "Ashmere",
      realm: "Community Atlas",
      game: "Chronicles of Ashmere (Fictional)",
      rating: 4.77,
      completion: 36,
      size: "Coastal",
      discoveries: 288,
      art: "linear-gradient(135deg,#4a2a1a 0%,#2a2a2a 50%,#1a2a3a 100%)",
      palette: { land: "#5a4a30", water: "#2a4050", peak: "#6a5a4a", snow: "#d0d4d8", forest: "#2a3820" },
      blurb: "Volcanic shores, glass deserts, and cities built in cooled magma.",
    },
  ];

  const NAME_PARTS = {
    prefix: ["Ash", "Black", "Cold", "Dawn", "Elder", "Frost", "Gold", "Hollow", "Iron", "Jade", "King", "Lost", "Moon", "North", "Oak", "Pale", "Quiet", "Red", "Silver", "Thorn", "Umber", "Vale", "White", "Yew", "Storm", "Ember", "Mist", "Rune", "Shadow", "Star"],
    mid: ["water", "stone", "wood", "fell", "gate", "haven", "mere", "ridge", "spire", "watch", "brook", "cairn", "dell", "forge", "glen", "keep", "march", "peak", "reach", "shore"],
    suffix: [" Hold", " Crossing", " Depths", " Ruins", " Sanctum", " Pass", " Hollow", " Reach", " Tor", " Fen", "", " Bastion", " Overlook", " Warren", " Archive"],
    dungeon: ["Crypt of", "Caverns of", "Barrow of", "Labyrinth of", "Catacombs of", "Pit of", "Vault of", "Temple of"],
    nature: ["Lake", "Falls", "Woods", "Peaks", "Marshes", "Bluffs", "Meadows", "Gorge"],
  };

  const DESCS = [
    "Locals speak of lights beneath the water when the moon is thin.",
    "A cartographer's note marks this place with three urgent strokes of ink.",
    "Wind carries the smell of iron and old incense.",
    "The ground here is warmer than it should be.",
    "Community scouts report rare flora along the eastern ridge.",
    "An unfinished sketch in the margins suggests a second entrance.",
    "Pilgrims leave wax seals on the standing stones.",
    "Speedrunners favor the northern ledge for a clean drop.",
    "A merchant caravan vanished here in the last frost.",
    "Echoes answer twice—once from stone, once from something else.",
    "The map stains dark where blood was spilled in the third age.",
    "Photographers gather at dusk for the gold-hour cliffs.",
    "A handwritten warning: do not follow the singing.",
    "Survey rods still stand where the old expedition camped.",
    "Treasure hunters left empty chests and one sealed letter.",
  ];

  const DIFFICULTIES = ["Tranquil", "Modest", "Perilous", "Dire", "Legendary"];
  const PIN_GLYPHS = {
    city: "⚑", village: "⌂", capital: "♛", castle: "♜", fort: "⛨", tower: "⌁",
    dungeon: "⬡", cave: "◠", ruin: "卍", boss: "☠", dragon: "◈", enemy: "⚔",
    treasure: "◆", loot: "◇", chest: "▣", shrine: "☯", temple: "⛩", altar: "✝",
    forest: "♣", lake: "◎", mountain: "▲", river: "∿", "fast-travel": "✸",
    port: "⚓", road: "⊹", camp: "♨", quest: "❖", npc: "☺", merchant: "⚖",
    secret: "◉", lore: "※", hidden: "◎", photo: "✧", vista: "◈",
    craft: "⚒", resource: "◍", fishing: "◠", community: "✉",
  };

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function makeName(rng, tags) {
    if (tags.includes("dungeon") || tags.includes("cave") || tags.includes("ruin")) {
      return `${pick(rng, NAME_PARTS.dungeon)} ${pick(rng, NAME_PARTS.prefix)}${pick(rng, NAME_PARTS.mid)}`;
    }
    if (tags.includes("lake") || tags.includes("forest") || tags.includes("mountain") || tags.includes("river")) {
      return `${pick(rng, NAME_PARTS.prefix)}${pick(rng, NAME_PARTS.mid)} ${pick(rng, NAME_PARTS.nature)}`;
    }
    return `${pick(rng, NAME_PARTS.prefix)}${pick(rng, NAME_PARTS.mid)}${pick(rng, NAME_PARTS.suffix)}`.trim();
  }

  const TAG_POOLS = [
    ["city", "capital", "quest"],
    ["village", "merchant", "camp"],
    ["castle", "fort", "lore"],
    ["tower", "fast-travel"],
    ["dungeon", "boss", "loot"],
    ["cave", "secret", "treasure"],
    ["ruin", "lore", "hidden"],
    ["dragon", "boss", "mountain"],
    ["shrine", "temple", "photo"],
    ["forest", "resource", "vista"],
    ["lake", "fishing", "photo"],
    ["mountain", "vista", "camp"],
    ["river", "road", "fishing"],
    ["port", "merchant", "fast-travel"],
    ["quest", "npc", "community"],
    ["treasure", "chest", "secret"],
    ["craft", "resource", "merchant"],
    ["photo", "vista", "community"],
    ["enemy", "road", "camp"],
    ["altar", "secret", "lore"],
  ];

  function generateLocations() {
    const locations = [];
    let id = 0;
    WORLDS.forEach((world, wi) => {
      const rng = mulberry32(0xc0ffee + wi * 997);
      const count = 18 + Math.floor(rng() * 14); // 18–31 per world
      for (let i = 0; i < count; i++) {
        const tags = pick(rng, TAG_POOLS).slice();
        if (rng() > 0.7) tags.push("community");
        const x = 8 + rng() * 84;
        const y = 10 + rng() * 78;
        const name = makeName(rng, tags);
        const creator = pick(rng, CREATORS);
        const rating = +(3.6 + rng() * 1.4).toFixed(1);
        const downloads = Math.floor(40 + rng() * 9800);
        const difficulty = pick(rng, DIFFICULTIES);
        const primary = tags[0];
        locations.push({
          id: `loc-${id++}`,
          worldId: world.id,
          name,
          tags,
          primary,
          glyph: PIN_GLYPHS[primary] || "✦",
          x,
          y,
          description: pick(rng, DESCS),
          difficulty,
          rating,
          downloads,
          creator,
          quests: Math.floor(rng() * 6),
          collectibles: Math.floor(rng() * 12),
          npcs: Math.floor(rng() * 8),
          secrets: Math.floor(rng() * 5),
          coords: `${(rng() * 180 - 90).toFixed(2)}°, ${(rng() * 360 - 180).toFixed(2)}°`,
          notes: [
            `${creator} marked this on the ${["vernal", "autumnal", "solstice", "eclipse"][Math.floor(rng() * 4)]} survey.`,
            rng() > 0.5 ? "Wax seal: verified by three explorers." : "Sketch attached—see community layer.",
          ],
          community: [
            `"${pick(rng, ["Bring torches.", "Best at dawn.", "Watch the ridge.", "Hidden ledge west.", "Farm route clockwise."])}" — ${pick(rng, CREATORS)}`,
            rng() > 0.4 ? `Photo spot rated ${rating}/5 by pilgrims.` : `Speedrun split saves ~${Math.floor(8 + rng() * 40)}s.`,
          ],
        });
      }
    });
    return locations;
  }

  const LOCATIONS = generateLocations();

  return {
    RELICS,
    COLLECTIONS,
    WORLDS,
    LOCATIONS,
    CREATORS,
  };
})();
