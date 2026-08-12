/* Sample cartography data — dense, handcrafted, never empty */
window.SANCTUM_DATA = (function () {
  const 유물 = [
    { id: "all", name: "전체", symbol: "✧", tags: null },
    { id: "cities", name: "도시", symbol: "🏛", tags: ["city", "village", "capital"] },
    { id: "castles", name: "성", symbol: "🏰", tags: ["castle", "fort", "tower"] },
    { id: "dungeons", name: "던전", symbol: "🕳", tags: ["dungeon", "cave", "ruin"] },
    { id: "bosses", name: "보스", symbol: "☠", tags: ["boss", "dragon", "enemy"] },
    { id: "treasure", name: "보물", symbol: "💎", tags: ["treasure", "loot", "chest"] },
    { id: "shrines", name: "신사", symbol: "⛩", tags: ["shrine", "temple", "altar"] },
    { id: "nature", name: "자연", symbol: "🌲", tags: ["forest", "lake", "mountain", "river"] },
    { id: "travel", name: "여행", symbol: "⛵", tags: ["fast-travel", "port", "road", "camp"] },
    { id: "quests", name: "퀘스트", symbol: "⚔", tags: ["quest", "npc", "merchant"] },
    { id: "secrets", name: "비밀", symbol: "👁", tags: ["secret", "lore", "hidden"] },
    { id: "photo", name: "전망", symbol: "📷", tags: ["photo", "vista"] },
    { id: "craft", name: "제작", symbol: "⚗", tags: ["craft", "resource", "fishing"] },
    { id: "community", name: "노트", symbol: "✉", tags: ["community"] },
  ];

  const COLLECTIONS = [
    { id: "dragons", name: "숨겨진 용", count: 14, spine: "#6b1e1e", tags: ["dragon", "boss"] },
    { id: "lakes", name: "아름다운 호수", count: 22, spine: "#1e4a6b", tags: ["lake", "photo"] },
    { id: "weapons", name: "전설의 무기", count: 31, spine: "#6b5a1e", tags: ["treasure", "loot"] },
    { id: "dungeons", name: "최고의 던전", count: 18, spine: "#3d2a4a", tags: ["dungeon"] },
    { id: "completion", name: "100% 완수", count: 9, spine: "#1e6b3a", tags: ["quest", "secret"] },
    { id: "underground", name: "지하 도시", count: 7, spine: "#2a2a2a", tags: ["city", "cave"] },
    { id: "villages", name: "좋아하는 마을", count: 26, spine: "#5a3a1e", tags: ["village"] },
    { id: "speedrun", name: "스피드런 경로", count: 12, spine: "#4a1e6b", tags: ["fast-travel", "road"] },
  ];

  const CREATORS = [
    "엘란드라 깃펜", "가시 지도제작자", "벨룸 자매", "측량사 카엘",
    "미라 먹손", "옛 카르토스", "재의 룬", "리사 밤해도",
    "컴퍼스 형제", "아이비 길잡이", "도리안 인장장이", "네사 짙은먹물",
  ];

  const WORLDS = [
    {
      id: "skyrim",
      name: "Skyrim",
      realm: "탐레일",
      game: "The Elder Scrolls V: Skyrim",
      rating: 4.9,
      completion: 67,
      size: "37 km²",
      discoveries: 842,
      art: "linear-gradient(135deg,#2a3a4a 0%,#1a2a1a 40%,#3a2a1a 100%)",
      palette: { land: "#4a5a3a", water: "#2a4a5a", peak: "#8a8a8a", snow: "#d8e0e8", forest: "#2a4a28" },
      blurb: "용과 고대 무덤, 속삭임의 예언으로 가득한 얼어붙은 지방.",
    },
    {
      id: "elden",
      name: "사이의 땅",
      realm: "엘든 링",
      game: "엘든 링",
      rating: 4.95,
      completion: 41,
      size: "Vast",
      discoveries: 1204,
      art: "linear-gradient(135deg,#5a3a2a 0%,#3a2a4a 50%,#1a1a2a 100%)",
      palette: { land: "#6a5a3a", water: "#3a5a6a", peak: "#7a6a5a", snow: "#c8c0b0", forest: "#3a4a2a" },
      blurb: "신들과 신성, 황금의 부패가 지배하는 산산조각 난 영역.",
    },
    {
      id: "witcher",
      name: "대륙",
      realm: "위처 3",
      game: "위처 3: 야생의 사냥",
      rating: 4.92,
      completion: 73,
      size: "136 km²",
      discoveries: 956,
      art: "linear-gradient(135deg,#2a3a2a 0%,#3a2a1a 45%,#1a2a3a 100%)",
      palette: { land: "#4a5a30", water: "#2a4555", peak: "#6a655a", snow: "#d0d8e0", forest: "#243a20" },
      blurb: "전쟁에 찢긴 왕국, 귀신 들린 숲, 피로 쓰여진 계약.",
    },
    {
      id: "botw",
      name: "하일룰",
      realm: "야생의 숨결",
      game: "The Legend of Zelda: 야생의 숨결",
      rating: 4.97,
      completion: 58,
      size: "360 km²",
      discoveries: 1102,
      art: "linear-gradient(135deg,#3a6a4a 0%,#5a8a3a 40%,#2a5a8a 100%)",
      palette: { land: "#6a8a4a", water: "#3a7aaa", peak: "#9a9a8a", snow: "#eef4ff", forest: "#2f6a32" },
      blurb: "다시 태어난 야생의 왕국 — 탑과 신사, 끝없는 지평선.",
    },
    {
      id: "totk",
      name: "하일룰과 하늘",
      realm: "왕국의 눈물",
      game: "The Legend of Zelda: 왕국의 눈물",
      rating: 4.94,
      completion: 39,
      size: "Layered",
      discoveries: 1380,
      art: "linear-gradient(135deg,#4a7a9a 0%,#6a8a4a 40%,#5a3a2a 100%)",
      palette: { land: "#5a7a40", water: "#2a6a9a", peak: "#8a7a6a", snow: "#e8f0ff", forest: "#2a5a30" },
      blurb: "하늘의 섬들, 심연, 그리고 고대의 힘으로 다시 쓰여진 왕국.",
    },
    {
      id: "rdr2",
      name: "아메리카, 1899",
      realm: "Red Dead Redemption 2",
      game: "Red Dead Redemption 2",
      rating: 4.91,
      completion: 52,
      size: "75 km²",
      discoveries: 780,
      art: "linear-gradient(135deg,#5a4a2a 0%,#3a5a3a 50%,#2a3a5a 100%)",
      palette: { land: "#6a6a3a", water: "#2a4a5a", peak: "#7a6a5a", snow: "#dce4ec", forest: "#2a4a28" },
      blurb: "변방의 황야, 죽어가는 무법자, 그리고 먼지 위에 그려진 지도.",
    },
    {
      id: "tsushima",
      name: "쓰시마",
      realm: "Ghost of Tsushima",
      game: "Ghost of Tsushima",
      rating: 4.88,
      completion: 61,
      size: "Island",
      discoveries: 640,
      art: "linear-gradient(135deg,#8a3a4a 0%,#3a5a3a 50%,#2a2a3a 100%)",
      palette: { land: "#5a6a3a", water: "#2a4a6a", peak: "#6a6058", snow: "#e0e8f0", forest: "#2a4a30" },
      blurb: "바람에 휩쓸린 섬들, 여우 신사, 그리고 유령의 길.",
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
      blurb: "마법 없는 중세 보헤미아 — 진흙, 강철, 명예만이 있을 뿐.",
    },
    {
      id: "dogma",
      name: "그랜시스",
      realm: "Dragon's Dogma",
      game: "Dragon's Dogma",
      rating: 4.65,
      completion: 48,
      size: "Wide",
      discoveries: 520,
      art: "linear-gradient(135deg,#3a2a4a 0%,#2a3a2a 50%,#4a2a1a 100%)",
      palette: { land: "#4a5a35", water: "#2a4558", peak: "#6a5a4a", snow: "#d0d8e0", forest: "#284028" },
      blurb: "사환, 와이번, 그리고 당신의 선택을 기억하는 세계.",
    },
    {
      id: "nms",
      name: "유클리드 은하",
      realm: "No Man's Sky",
      game: "No Man's Sky",
      rating: 4.6,
      completion: 22,
      size: "18 Q planets",
      discoveries: 2400,
      art: "linear-gradient(135deg,#1a2a4a 0%,#2a1a4a 40%,#1a4a3a 100%)",
      palette: { land: "#3a6a5a", water: "#1a3a6a", peak: "#5a4a6a", snow: "#c8d8f0", forest: "#1a5a40" },
      blurb: "무한한 별들, 절차적으로 생성된 해안, 그리고 지도책 인터페이스.",
    },
    {
      id: "hogwarts",
      name: "고지대",
      realm: "Hogwarts Legacy",
      game: "Hogwarts Legacy",
      rating: 4.75,
      completion: 55,
      size: "Castle+",
      discoveries: 690,
      art: "linear-gradient(135deg,#2a2a4a 0%,#3a2a1a 45%,#1a3a2a 100%)",
      palette: { land: "#4a5a38", water: "#2a4560", peak: "#6a655a", snow: "#e0e6f0", forest: "#2a4028" },
      blurb: "성, 금지된 숲, 그리고 스스로 재배열되는 지도.",
    },
    {
      id: "cyber",
      name: "밤 City",
      realm: "Cyberpunk 2077",
      game: "Cyberpunk 2077",
      rating: 4.7,
      completion: 49,
      size: "Metro",
      discoveries: 880,
      art: "linear-gradient(135deg,#1a0a2a 0%,#2a1a3a 40%,#0a2a3a 100%)",
      palette: { land: "#3a3a48", water: "#1a3a4a", peak: "#5a4a5a", snow: "#b0b8c8", forest: "#2a3a30" },
      blurb: "잠들지 않고, 용서하지도 않는 도시의 네온 지도학.",
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
      blurb: "블록으로 태어난 대륙, 깊고 어두운 도시, 그리고 플레이어가 만든 신화.",
    },
    {
      id: "valheim",
      name: "제10세계",
      realm: "Valheim",
      game: "Valheim",
      rating: 4.8,
      completion: 46,
      size: "Procedural",
      discoveries: 560,
      art: "linear-gradient(135deg,#2a3a4a 0%,#1a3a2a 50%,#3a2a1a 100%)",
      palette: { land: "#3a5a38", water: "#1a3a4a", peak: "#6a6a6a", snow: "#d8e4f0", forest: "#1a3a22" },
      blurb: "바이킹의 이승 — 바이옴들은 세계수 그림자를 둘러쌉니다.",
    },
    {
      id: "ac",
      name: "역사적 지구",
      realm: "Assassin's Creed",
      game: "Assassin's Creed Odyssey",
      rating: 4.72,
      completion: 51,
      size: "Greece",
      discoveries: 920,
      art: "linear-gradient(135deg,#2a5a7a 0%,#5a7a4a 45%,#7a5a2a 100%)",
      palette: { land: "#6a7a45", water: "#2a6a9a", peak: "#8a7a6a", snow: "#e8eef8", forest: "#3a5a30" },
      blurb: "에게 해의 섬들, 신탁, 그리고 매의 눈 같은 지도 제작술.",
    },
    {
      id: "aetherion",
      name: "에테리온",
      realm: "커뮤니티 지도집",
      game: "에테리온 (가상)",
      rating: 4.83,
      completion: 28,
      size: "Archipelago",
      discoveries: 334,
      art: "linear-gradient(135deg,#2a1a4a 0%,#1a3a5a 40%,#3a2a1a 100%)",
      palette: { land: "#4a4a6a", water: "#1a2a5a", peak: "#7a6a8a", snow: "#d0d0f0", forest: "#2a3a4a" },
      blurb: "별의 다리로 연결된 부유 섬들 — 신전 자체가 지도화했습니다.",
    },
    {
      id: "ashmere",
      name: "애시미어",
      realm: "커뮤니티 지도집",
      game: "애시미어 연대기 (가상)",
      rating: 4.77,
      completion: 36,
      size: "Coastal",
      discoveries: 288,
      art: "linear-gradient(135deg,#4a2a1a 0%,#2a2a2a 50%,#1a2a3a 100%)",
      palette: { land: "#5a4a30", water: "#2a4050", peak: "#6a5a4a", snow: "#d0d4d8", forest: "#2a3820" },
      blurb: "화산의 해안, 유리 사막, 그리고 식은 용암 위에 세워진 도시들.",
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
    "현지인들은 달이 얇을 때 물 아래 빛에 대해 이야기합니다.",
    "지도 제작자의 메모가 이 장소를 먹물 세 획의 다급한 표시로 남겨두었습니다.",
    "바람이 철과 오래된 향의 냄새를 실어 나릅니다.",
    "이곳의 땅은 마땅히 그래야 할 때보다 따뜻합니다.",
    "커뮤니티 정찰병들이 동쪽 능선에서 희귀 식물군을 보고했습니다.",
    "여백에 그려진 미완성 스케치가 두 번째 입구를 암시합니다.",
    "순례자들이 세워진 돌에 밀납 인장을 남깁니다.",
    "스피드러너들은 깔끔한 낙하를 위해 북쪽 선반을 선호합니다.",
    "지난 서리철에 상인 캐러밴이 여기서 사라졌습니다.",
    "메아리가 두 번 응답합니다 — 한 번은 돌에서, 한 번은 다른 무언가에서.",
    "제3시대에 피가 흘렸던 자리에 지도가 어둡게 얼룩져 있습니다.",
    "사진작가들이 황금빛 시간 절벽을 위해 황혼에 모여듭니다.",
    "손글씨 경고: 노래를 따라가지 말 것.",
    "옛 탐험대가 야영했던 자리에 측량 막대가 여전히 서 있습니다.",
    "보물 사냥꾼들이 빈 상자와 봉인된 편지 한 통을 남겼습니다.",
  ];

  const DIFFICULTIES = ["Tranquil", "겸손", "Perilous", "Dire", "전설"];
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
            rng() > 0.5 ? "밀납 인장: 세 탐험가에 의해 검증됨." : "스케치 첨부 — 커뮤니티 레이어 참조.",
          ],
          community: [
            `"${pick(rng, ["Bring torches.", "새벽이 가장 좋다.", "능선을 살피라.", "서쪽에 숨겨진 선반.", "농장 경로는 시계 방향."])}" — ${pick(rng, CREATORS)}`,
            rng() > 0.4 ? `Photo spot rated ${rating}/5 by pilgrims.` : `Speedrun split saves ~${Math.floor(8 + rng() * 40)}s.`,
          ],
        });
      }
    });
    return locations;
  }

  const LOCATIONS = generateLocations();

  return {
    유물,
    COLLECTIONS,
    WORLDS,
    LOCATIONS,
    CREATORS,
  };
})();
