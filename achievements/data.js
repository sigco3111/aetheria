// ============================================================
// THE HALL OF 전설 — Mock Data
// 전체 content below is sample/fictional, for demonstration only.
// ============================================================

const RARITY = {
  common:    { label: "일반",    color: "#9ca3a8", globalMin: 40, globalMax: 90 },
  rare:      { label: "희귀",      color: "#5b8fb0", globalMin: 15, globalMax: 40 },
  epic:      { label: "에픽",      color: "#a561c2", globalMin: 4,  globalMax: 15 },
  legendary: { label: "전설", color: "#d9b23e", globalMin: 0.5,globalMax: 4 },
  mythic:    { label: "신화",    color: "#e2536b", globalMin: 0.02,globalMax: 0.5 },
};

// icon glyph -> difficulty label mapping (flavor, not mechanical)
const DIFFICULTY_BY_RARITY = {
  common: "겸손",
  rare: "도전적",
  epic: "고된",
  legendary: "가혹",
  mythic: "불가능에 가까운",
};

function mk(name, desc, categoryId, 등급, icon, completion, unlockDate, points, lore, globalPct) {
  return {
    name, description: desc, category: categoryId, 등급, icon,
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
    name: "전사",
    glyph: "⚔",
    color: "#e2536b",
    description: "전투 속에서 벼려졌고, 흉터로 측량된다.",
    achievements: [
      mk("드래곤 슬레이어", "일기토에서 장로 드래곤을 쓰러뜨림.", "warrior", "legendary", "sword", 100, "2024-11-02", 500,
        "당신이 지니고 다니는 그 비늘은 여전히 자신의 불꽃의 열기를 기억합니다.", 2.1),
      mk("첫 피", "첫 결투에서 승리.", "warrior", "common", "sword", 100, "2023-01-14", 10,
        "모든 전설은 단 한 번의 떨리는 일격에서 시작됩니다.", 78.4),
      mk("북방의 챔피언", "북방 도달지 토너먼트 우승.", "warrior", "epic", "shield", 100, "2024-03-08", 250,
        "당신이 자리를 지킨 곳의 서리란 결코 녹지 않았습니다.", 6.7),
      mk("끊기지 않은 흐름", "50번 연속 결투에서 패배 없이 생존.", "warrior", "epic", "sword", 62, "", 300,
        "그들은 이것을 연승이라 부릅니다. 당신은 지켜낸 약속이라 부릅니다.", 4.3),
      mk("숲의 수호자", "실버우드를 세 번의 별도 공성전에서 방어.", "warrior", "rare", "shield", 100, "2024-06-19", 150,
        "나무들은 당신이 어느 편에 섰는지를 기억합니다.", 21.9),
      mk("최후의 저항", "파티 전원이 쓰러진 뒤 전투에서 승리.", "warrior", "mythic", "sword", 0, "", 800,
        "이를 전해줄 다른 이는 남아 있지 않아, 대신 돌이 전하고 있습니다.", 0.09),
      mk("검의 대가", "일곱 가지 검술 모두 마스터.", "warrior", "epic", "sword", 85, "", 280,
        "일곱 번째 검술에는 이름이 없습니다. 당신은 그것에 당신의 이름을 주었습니다.", 5.2),
      mk("왕국의 수호자", "수도의 함락을 방지.", "warrior", "legendary", "shield", 100, "2024-09-30", 550,
        "성문에는 당신이 진형을 지킨 자리의 흠집이 아직 남아 있습니다.", 1.4),
    ],
  },
  {
    id: "explorer",
    name: "탐험가",
    glyph: "⟡",
    color: "#5b8fb0",
    description: "지도가 끝나는 곳에서 당신의 발자국이 시작된다.",
    achievements: [
      mk("대탐험가", "대륙의 모든 지역을 발견.", "explorer", "legendary", "compass", 100, "2024-12-01", 500,
        "지도 제작자들은 더 이상 국경을 그리지 않고, 대신 당신의 경로를 그리기 시작했습니다.", 1.8),
      mk("숨겨진 동굴 100개", "숨겨진 동굴 100개를 찾아 지도에 기록.", "explorer", "epic", "compass", 100, "2024-08-14", 260,
        "어떤 동굴은 당신이 발견했습니다. 어떤 동굴은, 소문으로는, 당신을 발견했다고 합니다.", 5.5),
      mk("최고의 지도 제작자", "모든 지역 지도를 100%까지 완성.", "explorer", "legendary", "compass", 71, "", 480,
        "이렇게 완전한 지도는 예언에 거의 가깝습니다.", 1.2),
      mk("마지막 방랑자", "왕국의 모든 정착지, 폐허, 전초기지를 방문.", "explorer", "mythic", "compass", 100, "2025-01-11", 900,
        "이제 당신이 길을 잃을 수 있는 곳은 남아 있지 않습니다.", 0.14),
      mk("첫 빛", "새벽 전 스카이리치 봉우리 정상 도달.", "explorer", "rare", "compass", 100, "2024-05-02", 140,
        "태양은 당신이 이미 자신을 기다리고 있는 것을 발견하고 떠올랐습니다.", 18.3),
      mk("밀물 위를 걷는 자", "배 없이 침몰해안 횡단.", "explorer", "epic", "compass", 40, "", 240,
        "바다가 당신을 지나가게 했습니다. 바다가 왜인지를 설명하는 경우는 드뭅니다.", 6.9),
      mk("길잡이의 맹세", "도보로 10,000리 여행.", "explorer", "rare", "compass", 88, "", 130,
        "당신의 부츠는 대부분의 왕국의 인내보다 더 얇아졌습니다.", 24.0),
      mk("잊혀진 폐허의 대가", "사라진 문명 다섯 곳을 완전히 발굴.", "explorer", "epic", "tablet", 100, "2024-10-22", 270,
        "역사는 결코 말하지 않을, 셀 수 없는 감사 인사를 당신에게 빚지고 있습니다.", 4.8),
    ],
  },
  {
    id: "collector",
    name: "수집가",
    glyph: "◈",
    color: "#d9b23e",
    description: "모든 보물에는 이야기가 있습니다. 당신은 그것을 모두 간직합니다.",
    achievements: [
      mk("유물 수집가", "고대 유물 50개 획득.", "collector", "rare", "crystal", 100, "2024-07-04", 160,
        "각각은 다른 것들이 가까이 있을 때 희미하게 윙윙거립니다.", 19.6),
      mk("보물 King", "개인 자산으로 금화 백만 축적.", "collector", "epic", "chalice", 100, "2024-09-15", 300,
        "금고는 당신의 이름을 따서 방 이름을 붙이기 시작했습니다.", 5.9),
      mk("유물 사냥꾼", "단절된 유물 일곱 개 모두 회수.", "collector", "mythic", "crystal", 43, "", 950,
        "여섯 개는 당신의 손길에 응답합니다. 일곱 번째는 여전히 결정 중입니다.", 0.05),
      mk("큐레이터의 눈", "한 자리에서 모든 알려진 등급의 아이템을 하나씩 수집.", "collector", "epic", "crystal", 100, "2024-04-01", 220,
        "일반부터 신화까지, 마침내 완성된 한 문장처럼 늘어놓았습니다.", 4.1),
      mk("보물 수집가의 금고", "소유한 금고 슬롯을 모두 채움.", "collector", "common", "chalice", 100, "2023-08-19", 20,
        "더 이상 줄 것이 없는 선반에는 특별한 만족감이 있습니다.", 61.2),
      mk("완전한 도감", "왕국의 모든 생물 유형에서 트로피 수집.", "collector", "legendary", "crest", 90, "", 520,
        "도감의 마지막 장은 여전히, 백지인 채 인내하며 기다리고 있습니다.", 1.6),
    ],
  },
  {
    id: "lorekeeper",
    name: "로어키퍼",
    glyph: "✦",
    color: "#a561c2",
    description: "지식은 왕국보다 오래 살아남습니다. 당신은 잊혀지는 것보다 오래 남습니다.",
    achievements: [
      mk("비밀의 수호자", "엘프 기록 보관소의 모든 숨겨진 로어 파편 발견.", "lorekeeper", "epic", "tome", 100, "2024-06-30", 260,
        "기록 보관소가 휘적거리는 것은 그저 누구에게나 그런 것이 아닙니다.", 4.9),
      mk("비밀의 탐험가", "세 지역에 걸친 모든 환경 퍼즐 해결.", "lorekeeper", "rare", "tome", 100, "2024-05-20", 140,
        "벽들은 두 번째 지역쯤부터 당신에게 무엇인가를 숨기는 일을 그만두었습니다.", 20.4),
      mk("침묵의 도서관", "침묵의 도서관의 수호자를 깨우지 않고 그곳의 책 212권을 모두 읽음.", "lorekeeper", "legendary", "tome", 76, "", 540,
        "그것은 당신을 알아차렸습니다. 다만 개의치 않기로 했을 뿐입니다.", 1.1),
      mk("구전 전통", "이름 있는 NPC로부터 모든 지역의 민담을 습득.", "lorekeeper", "common", "tome", 100, "2023-05-11", 15,
        "모닥불 주변에서 들려주는 이야기는 보통 검보다 멀리 여행합니다.", 82.0),
      mk("암호 해독자", "옛 언어 암호 전체 해독.", "lorekeeper", "mythic", "tome", 0, "", 850,
        "세 학자는 번역 불가능하다고 확신하며 죽었습니다. 당신은 그것을 각주로 만들었습니다.", 0.03),
      mk("고대의 속삭임", "숨겨진 조상 정령 퀘스트라인 완수.", "lorekeeper", "epic", "constellation", 100, "2024-11-27", 250,
        "그들은 이제 바람이 실어 나를 수 없는 음역으로 당신에게 말합니다.", 3.8),
    ],
  },
  {
    id: "builder",
    name: "장인",
    glyph: "⌂",
    color: "#9ca3a8",
    description: "다른 이들은 세계를 지나갑니다. 당신은 그것을 세워둔 채 떠납니다.",
    achievements: [
      mk("건축의 대가", "완전히 가구 배치된 정착지 10곳 건설.", "builder", "epic", "tablet", 100, "2024-08-02", 230,
        "지붕마다 마지막 지붕을 기억하는 손에 의해 세워졌습니다.", 5.7),
      mk("초석", "첫 영구 구조물 건축.", "builder", "common", "tablet", 100, "2023-02-09", 10,
        "그것은 삐뚫어져 있습니다. 그것은 당신의 것. 그것은 많은 것의 첫 번째입니다.", 88.1),
      mk("영원한 요새", "다섯 번의 별도 공성전에서 버티는 요새 건설.", "builder", "legendary", "crest", 100, "2024-12-19", 500,
        "성벽이 시험받을 때마다 회반죽은 더 단단히 굳어갔습니다.", 1.5),
      mk("세계 사이의 다리", "이전에는 연결되지 않았던 두 지역을 잇는 다리 완성.", "builder", "rare", "tablet", 100, "2024-03-27", 150,
        "당신이 마지막 판자를 끝낸 날, 무역로가 스스로 다시 쓰여졌습니다.", 22.7),
      mk("전설의 도시", "단일 정착지를 주민 1,000명 규모로 성장.", "builder", "mythic", "crest", 12, "", 900,
        "인구 조사관들이 잉크가 떨어지기 시작했습니다.", 0.06),
    ],
  },
  {
    id: "monster-slayer",
    name: "몬스터 슬레이어",
    glyph: "☠",
    color: "#e2536b",
    description: "어둠은 당신의 발자국을 두려워하는 법을 배웠습니다.",
    achievements: [
      mk("몬스터 슬레이어", "모든 바이옴에서 몬스터 500마리 처치.", "monster-slayer", "rare", "sword", 100, "2024-04-18", 140,
        "야지 역시 기록을 남깁니다. 당신의 기록이 가장 깁니다.", 23.5),
      mk("심연의 재앙", "침몰 해구의 리바이어던 학살.", "monster-slayer", "legendary", "crystal", 100, "2024-10-05", 520,
        "그 이후로 밀물은 한결 잔잔해졌습니다.", 1.3),
      mk("악몽의 끝", "한 사이클 안에 이름 붙은 모든 나이트메어 보스 처치.", "monster-slayer", "mythic", "constellation", 8, "", 920,
        "당신이 끝낸 그 주에 세 개 주에서 잠이 돌아왔습니다.", 0.04),
      mk("해충 박멸", "마을을 위협하는 몬스터 소굴 100개 소탕.", "monster-slayer", "common", "sword", 100, "2023-09-30", 15,
        "작은 행위가 반복되면 영웅 숭배와 매우 닮아 보이기 시작합니다.", 74.6),
      mk("하이드라의 심판", "하이드라가 단 하나의 머리도 재생하지 못하게 막고 처치.", "monster-slayer", "epic", "sword", 100, "2024-07-11", 280,
        "이것은 아무에게도 이 이야기를 전하지 않았습니다. 그것은 전할 입이 더는 남아 있지 않기 때문입니다.", 4.4),
    ],
  },
  {
    id: "community",
    name: "커뮤니티 영웅",
    glyph: "❖",
    color: "#d9b23e",
    description: "모든 기념물이 돌로 만들어지는 것은 아닙니다. 어떤 것은 사람으로 만들어집니다.",
    achievements: [
      mk("길드 챔피언", "그랜드 토너먼트에서 길드를 승리로 이끔.", "community", "epic", "banner", 100, "2024-11-14", 260,
        "깃발은 들어서는 모든 전당에 당신 길드의 색을 여전히 실어 나릅니다.", 4.6),
      mk("희망의 등불", "위기에 처한 동료 모험가 200명 지원.", "community", "rare", "banner", 100, "2024-02-25", 140,
        "두백 번의 작은 구조는 전설처럼 느껴지지 않습니다. 그런데 그것은 어쨌든 하나의 전설입니다.", 19.9),
      mk("퀘스트 마스터", "왕국 전역에서 1,000개의 사이드 퀘스트 완수.", "community", "epic", "tablet", 91, "", 240,
        "왕국은 당신이 해결할 작은 문제를 더 이상 남기지 않았습니다.", 5.3),
      mk("멘토의 길", "새 모험가 25명의 첫 해를 안내.", "community", "rare", "banner", 100, "2024-06-08", 150,
        "그들 중 몇 명은 이제 전설이기도 합니다. 그 부분은 항상 계획이었습니다.", 17.2),
      mk("세계의 구원자", "융합 재앙이 왕국을 소멸시키는 것을 막음.", "community", "mythic", "constellation", 100, "2025-01-30", 1000,
        "역사는 보통 두 번째 초고를 받지 않습니다. 그런데 당신은 그것을 썼습니다.", 0.02),
      mk("완성주의자", "전당의 모든 카테고리에서 100% 완수.", "community", "legendary", "crest", 34, "", 600,
        "전당 자체가 당신이 끝낼지를 지켜보고 있는 듯합니다.", 0.8),
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
  rarestOwned: "마지막 방랑자",
  currentStreakDays: 47,
};

// Extra generated tablets to make the Hero Wall feel like "hundreds" — lightweight, name+rarity+category only
const WALL_FILLER_NAMES = [
  "재폭풍의 베테랑","달빛 파수","철의 맹세","소금길 방랑자","재빛 수호",
  "공동 호숫제의","도금된 파수꾼","과부의 고개","잿불 요새의 수호자","황혼에 묶인 맹세",
  "가시 들판의 심판","첨탑 파수","창백한 물의 시험","검빛 문장 보유자","밤유리 추적자",
  "깊은뿌리 방랑자","별 falling 목격자","차가운 항만의 저항","신록의 맹세","청동틀의 유산",
  "성스러운 장부","유목의 진혼곡","태양 첨탑 등반","서리에 묶인 문장","용비늘 공물",
  "긴 그림자의 계약","호박빛 파수","폭풍쉼터 깃발","심연 기록 연대기","상아 요새",
  "조용한 폭포의 파수","고사리 왕관의 시험","황혼늪 장부","창백한 바람의 등반","가시문 맹세",
  "룬 대장간 유산","은빛 도달의 맹세","이끼 묶인 파수꾼","벼랑 호수의 심판","바람 방향 장부",
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
