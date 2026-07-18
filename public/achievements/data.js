// ============================================================
// THE HALL OF LEGENDS — Mock Data
// All content below is sample/fictional, for demonstration only.
// ============================================================

const RARITY = {
  common:    { label: "Common",    color: "#9ca3a8", globalMin: 40, globalMax: 90 },
  rare:      { label: "Rare",      color: "#5b8fb0", globalMin: 15, globalMax: 40 },
  epic:      { label: "Epic",      color: "#a561c2", globalMin: 4,  globalMax: 15 },
  legendary: { label: "Legendary", color: "#d9b23e", globalMin: 0.5,globalMax: 4 },
  mythic:    { label: "Mythic",    color: "#e2536b", globalMin: 0.02,globalMax: 0.5 },
};

// icon glyph -> difficulty label mapping (flavor, not mechanical)
const DIFFICULTY_BY_RARITY = {
  common: "Modest",
  rare: "Challenging",
  epic: "Arduous",
  legendary: "Punishing",
  mythic: "Near Impossible",
};

function mk(name, desc, categoryId, rarity, icon, completion, unlockDate, points, lore, globalPct) {
  return {
    name, description: desc, category: categoryId, rarity, icon,
    completion, // 0-100, personal
    unlocked: completion >= 100,
    unlockDate: unlockDate || null,
    points,
    difficulty: DIFFICULTY_BY_RARITY[rarity],
    lore,
    globalCompletionPct: globalPct,
  };
}

// Simple deterministic "icon key" -> which SVG glyph to draw for a relic.
// Glyph renderer picks from: sword, shield, compass, tome, crystal, crest, banner, tablet, constellation, chalice
const CATEGORIES = [
  {
    id: "warrior",
    name: "Warrior",
    glyph: "⚔",
    color: "#e2536b",
    description: "Forged in battle. Measured in scars.",
    achievements: [
      mk("Dragon Slayer", "Fell an elder dragon in single combat.", "warrior", "legendary", "sword", 100, "2024-11-02", 500,
        "The scale you carry still remembers the heat of its own fire.", 2.1),
      mk("First Blood", "Win your first duel.", "warrior", "common", "sword", 100, "2023-01-14", 10,
        "Every legend begins with a single, trembling swing.", 78.4),
      mk("Champion of the North", "Win the Northern Reach tournament.", "warrior", "epic", "shield", 100, "2024-03-08", 250,
        "The frost never melted where you stood your ground.", 6.7),
      mk("Unbroken Line", "Survive 50 consecutive duels without defeat.", "warrior", "epic", "sword", 62, "", 300,
        "They call it a win streak. You call it a promise kept.", 4.3),
      mk("Guardian of the Forest", "Defend Silverwood from three separate sieges.", "warrior", "rare", "shield", 100, "2024-06-19", 150,
        "The trees remember which side you stood on.", 21.9),
      mk("The Last Stand", "Win a battle after your entire party has fallen.", "warrior", "mythic", "sword", 0, "", 800,
        "No one else was left to tell it, so the stone tells it instead.", 0.09),
      mk("Blademaster", "Master all seven sword styles.", "warrior", "epic", "sword", 85, "", 280,
        "The seventh style has no name. You gave it yours.", 5.2),
      mk("Kingdom Protector", "Prevent the fall of a capital city.", "warrior", "legendary", "shield", 100, "2024-09-30", 550,
        "The gates still bear the dent where you held the line.", 1.4),
    ],
  },
  {
    id: "explorer",
    name: "Explorer",
    glyph: "⟡",
    color: "#5b8fb0",
    description: "Where the map ends, your footprints begin.",
    achievements: [
      mk("Master Explorer", "Discover every region on the continent.", "explorer", "legendary", "compass", 100, "2024-12-01", 500,
        "The cartographers stopped drawing borders and started drawing your route instead.", 1.8),
      mk("100 Hidden Caves", "Find and chart 100 hidden caves.", "explorer", "epic", "compass", 100, "2024-08-14", 260,
        "Some caves you found. Some caves, it's said, found you.", 5.5),
      mk("Cartographer Supreme", "Complete every regional map to 100%.", "explorer", "legendary", "compass", 71, "", 480,
        "A map this complete borders on prophecy.", 1.2),
      mk("The Last Wanderer", "Visit every settlement, ruin, and outpost in the realm.", "explorer", "mythic", "compass", 100, "2025-01-11", 900,
        "There is nowhere left for you to be lost.", 0.14),
      mk("First Light", "Reach the summit of Skyreach Peak before dawn.", "explorer", "rare", "compass", 100, "2024-05-02", 140,
        "The sun rose to find you already waiting for it.", 18.3),
      mk("Tidewalker", "Cross the Sunken Straits without a boat.", "explorer", "epic", "compass", 40, "", 240,
        "The sea let you pass. It rarely explains why.", 6.9),
      mk("Wayfinder's Oath", "Travel 10,000 leagues on foot.", "explorer", "rare", "compass", 88, "", 130,
        "Your boots have worn thinner than most kingdoms' patience.", 24.0),
      mk("Master of Forgotten Ruins", "Fully excavate five lost civilizations.", "explorer", "epic", "tablet", 100, "2024-10-22", 270,
        "History owes you a great many thank-yous it will never speak.", 4.8),
    ],
  },
  {
    id: "collector",
    name: "Collector",
    glyph: "◈",
    color: "#d9b23e",
    description: "Every treasure has a story. You keep them all.",
    achievements: [
      mk("Relic Collector", "Acquire 50 ancient relics.", "collector", "rare", "crystal", 100, "2024-07-04", 160,
        "Each one hums faintly when the others are near.", 19.6),
      mk("Treasure King", "Amass one million gold in personal wealth.", "collector", "epic", "chalice", 100, "2024-09-15", 300,
        "The vaults have started naming rooms after you.", 5.9),
      mk("Artifact Hunter", "Recover all seven Sundered Artifacts.", "collector", "mythic", "crystal", 43, "", 950,
        "Six answer to your touch. The seventh is still deciding.", 0.05),
      mk("Curator's Eye", "Collect one item of every known rarity in a single sitting.", "collector", "epic", "crystal", 100, "2024-04-01", 220,
        "Common to mythic, laid out like a sentence finally finished.", 4.1),
      mk("Hoarder's Vault", "Fill every vault slot you own.", "collector", "common", "chalice", 100, "2023-08-19", 20,
        "There's a particular satisfaction in a shelf with nothing left to give.", 61.2),
      mk("The Complete Bestiary", "Collect a trophy from every creature type in the realm.", "collector", "legendary", "crest", 90, "", 520,
        "The final page of the bestiary still waits, blank and patient.", 1.6),
    ],
  },
  {
    id: "lorekeeper",
    name: "Lorekeeper",
    glyph: "✦",
    color: "#a561c2",
    description: "Knowledge outlives kingdoms. You outlive forgetting.",
    achievements: [
      mk("Keeper of Secrets", "Uncover every hidden lore fragment in the Elven Archive.", "lorekeeper", "epic", "tome", 100, "2024-06-30", 260,
        "The archive doesn't creak for just anyone.", 4.9),
      mk("Explorer of Secrets", "Solve all environmental puzzles across three regions.", "lorekeeper", "rare", "tome", 100, "2024-05-20", 140,
        "The walls stopped hiding things from you around the second region.", 20.4),
      mk("The Silent Library", "Read all 212 tomes in the Sunken Library without triggering its guardian.", "lorekeeper", "legendary", "tome", 76, "", 540,
        "It noticed you. It simply chose not to mind.", 1.1),
      mk("Oral Tradition", "Learn every regional folk tale from a named NPC.", "lorekeeper", "common", "tome", 100, "2023-05-11", 15,
        "Stories told around fires tend to travel further than swords.", 82.0),
      mk("Codebreaker", "Decipher the full Old Tongue cipher.", "lorekeeper", "mythic", "tome", 0, "", 850,
        "Three scholars died certain it was untranslatable. You made it a footnote.", 0.03),
      mk("Whisper of the Ancients", "Complete the hidden ancestor-spirit questline.", "lorekeeper", "epic", "constellation", 100, "2024-11-27", 250,
        "They speak to you now in a register the wind can't carry.", 3.8),
    ],
  },
  {
    id: "builder",
    name: "Builder",
    glyph: "⌂",
    color: "#9ca3a8",
    description: "Others pass through the world. You leave it standing.",
    achievements: [
      mk("Master Architect", "Construct 10 fully-furnished settlements.", "builder", "epic", "tablet", 100, "2024-08-02", 230,
        "Each roof was raised by hands that remembered the last one.", 5.7),
      mk("Foundation Stone", "Build your first permanent structure.", "builder", "common", "tablet", 100, "2023-02-09", 10,
        "It's crooked. It's yours. It's the first of many.", 88.1),
      mk("The Eternal Keep", "Build a fortress that withstands five separate sieges.", "builder", "legendary", "crest", 100, "2024-12-19", 500,
        "The mortar set harder each time the walls were tested.", 1.5),
      mk("Bridge Between Worlds", "Complete a bridge connecting two previously unlinked regions.", "builder", "rare", "tablet", 100, "2024-03-27", 150,
        "Trade routes rewrote themselves the day you finished the final plank.", 22.7),
      mk("City of Legend", "Grow a single settlement to 1,000 residents.", "builder", "mythic", "crest", 12, "", 900,
        "The census-takers have started running out of ink.", 0.06),
    ],
  },
  {
    id: "monster-slayer",
    name: "Monster Slayer",
    glyph: "☠",
    color: "#e2536b",
    description: "The dark has learned to fear your footsteps.",
    achievements: [
      mk("Monster Slayer", "Defeat 500 monsters across every biome.", "monster-slayer", "rare", "sword", 100, "2024-04-18", 140,
        "The wilds keep a tally too. Yours is the longest.", 23.5),
      mk("Bane of the Deep", "Slay the Leviathan of the Sunken Trench.", "monster-slayer", "legendary", "crystal", 100, "2024-10-05", 520,
        "The tide has been calmer ever since.", 1.3),
      mk("Nightmare's End", "Defeat every named nightmare boss in a single cycle.", "monster-slayer", "mythic", "constellation", 8, "", 920,
        "Sleep returned to three provinces the week you finished.", 0.04),
      mk("Pest Control", "Clear 100 monster dens threatening local villages.", "monster-slayer", "common", "sword", 100, "2023-09-30", 15,
        "Small deeds, repeated, start to look a great deal like heroism.", 74.6),
      mk("The Hydra's Reckoning", "Defeat the Hydra without it regenerating a single head.", "monster-slayer", "epic", "sword", 100, "2024-07-11", 280,
        "It has told this story to no one. It has no mouths left to tell it with.", 4.4),
    ],
  },
  {
    id: "community",
    name: "Community Hero",
    glyph: "❖",
    color: "#d9b23e",
    description: "Not all monuments are made of stone. Some are made of people.",
    achievements: [
      mk("Guild Champion", "Lead your guild to victory in the Grand Tournament.", "community", "epic", "banner", 100, "2024-11-14", 260,
        "The banner still carries your guild's colors into every hall it enters.", 4.6),
      mk("Beacon of Hope", "Assist 200 fellow adventurers in distress.", "community", "rare", "banner", 100, "2024-02-25", 140,
        "Two hundred small rescues rarely feel like a legend. They are one anyway.", 19.9),
      mk("Quest Master", "Complete 1,000 side quests across the realm.", "community", "epic", "tablet", 91, "", 240,
        "The realm ran out of small problems for you to solve.", 5.3),
      mk("The Mentor's Path", "Guide 25 new adventurers through their first year.", "community", "rare", "banner", 100, "2024-06-08", 150,
        "A few of them are legends now too. That part was always the plan.", 17.2),
      mk("World Savior", "Prevent the Convergence catastrophe from unmaking the realm.", "community", "mythic", "constellation", 100, "2025-01-30", 1000,
        "History doesn't usually get a second draft. You wrote it one anyway.", 0.02),
      mk("Completionist", "Achieve 100% completion across every category in the Hall.", "community", "legendary", "crest", 34, "", 600,
        "The Hall itself seems to be waiting to see if you'll finish.", 0.8),
    ],
  },
];

// Flatten for search / hero wall / stats
const ALL_ACHIEVEMENTS = CATEGORIES.flatMap(cat =>
  cat.achievements.map(a => ({ ...a, categoryName: cat.name, categoryColor: cat.color }))
);

const STATS = {
  totalAchievements: 512,
  unlockedByYou: ALL_ACHIEVEMENTS.filter(a => a.unlocked).length,
  totalPointsEarned: ALL_ACHIEVEMENTS.filter(a => a.unlocked).reduce((s, a) => s + a.points, 0),
  totalPointsPossible: ALL_ACHIEVEMENTS.reduce((s, a) => s + a.points, 0),
  legendsRank: 1342,
  totalAdventurers: 284917,
  worldCompletionPct: 38,
  rarestOwned: "The Last Wanderer",
  currentStreakDays: 47,
};

// Extra generated tablets to make the Hero Wall feel like "hundreds" — lightweight, name+rarity+category only
const WALL_FILLER_NAMES = [
  "Ashfall Veteran","Moonlit Vigil","Iron Oath","Salt Road Wanderer","Cinder Ward",
  "Hollowmere Rite","Gilded Sentinel","Widow's Pass","Emberkeep Warden","Duskbound Vow",
  "Thornfield Reckoning","Highspire Watch","Graywater Trial","Sable Crest Bearer","Nightglass Seeker",
  "Rootdeep Wanderer","Starfall Witness","Coldharbor Stand","Verdant Oath","Bronzeframe Legacy",
  "Hallowed Ledger","Driftwood Requiem","Sunspire Ascent","Frostbound Crest","Wyrmscale Tribute",
  "Longshadow Pact","Amberlight Vigil","Stormrest Banner","Deepwrit Chronicle","Ivory Bastion",
  "Quietfall Watch","Ferncrown Trial","Duskmere Ledger","Palewind Ascent","Thistlegate Oath",
  "Runeforge Legacy","Silverreach Vow","Mossbound Sentinel","Cragmere Reckoning","Windward Ledger",
];

function generateWallTablets(count = 260) {
  const rarities = Object.keys(RARITY);
  // weight commons much higher than mythics for a believable distribution
  const weights = { common: 46, rare: 30, epic: 16, legendary: 6.5, mythic: 1.5 };
  const weighted = [];
  rarities.forEach(r => { for (let i = 0; i < weights[r] * 10; i++) weighted.push(r); });

  const tablets = [];
  for (let i = 0; i < count; i++) {
    const cat = CATEGORIES[i % CATEGORIES.length];
    const rarity = weighted[Math.floor(Math.random() * weighted.length)];
    const name = WALL_FILLER_NAMES[i % WALL_FILLER_NAMES.length] + (i >= WALL_FILLER_NAMES.length ? ` ${Math.floor(i / WALL_FILLER_NAMES.length) + 1}` : "");
    tablets.push({
      name,
      category: cat.id,
      categoryName: cat.name,
      color: cat.color,
      rarity,
      unlocked: Math.random() > 0.35,
    });
  }
  return tablets;
}

const WALL_TABLETS = generateWallTablets(260);
