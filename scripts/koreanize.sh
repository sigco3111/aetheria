#!/usr/bin/env bash
# AETHERIA 한국어화 스크립트
# - UI 라벨, 카테고리 이름, 게임 콘텐츠 한국어 번역
# - 게임 정식명(Skyrim, Elden Ring 등)은 원형 유지
# - 원본 보존: *.bak 생성 후 sed로 in-place 치환

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ---------- 치환 사전 (EN -> KO) ----------
# 순서 중요: 긴 표현 먼저
declare -A MAP=(
  # ===== 3D 시네마틱 랜딩 (app/layout.tsx, components/cinematic/experience.tsx) =====
  ["Aetheria Isle — a floating medieval fantasy island revealed from the morning mist"]="에테리아 섬 — 아침 안개 속으로 드러나는 중세 판타지 부유 섬"
  ["Aetheria Isle — A Cinematic Reveal"]="에테리아 섬 — 시네마틱 리빌"
  ["A breathtaking cinematic landing experience. Watch a medieval fantasy island emerge from the morning mist, surrounded by an endless crystal-blue ocean."]="숨 막힐 듯한 시네마틱 착륙 체험. 수정처럼 푸른 끝없는 바다 위로 아침 안개 속에서 중세 판타지 섬이 모습을 드러냅니다."
  ["Interactive Open-World Game Companion App"]="인터랙티브 오픈 월드 게임 동반 앱"
  ["Members:"]="팀원:"
  ["Members: Govind Jindal, Aaradhya Khanna"]="팀원: Govind Jindal, Aaradhya Khanna"
  ["Scroll to journey through the island"]="스크롤하여 섬을 여행하세요"
  ["Where the morning mist parts, an ancient kingdom waits."]="아침 안개가 걷히면, 고대 왕국이 당신을 기다립니다."
  ["Tab through relics · Click pins · / to search"]="유물 사이를 Tab으로 이동 · 핀 클릭 · / 로 검색"

  # ===== Cartographer's Sanctum (지도사의 신전) =====
  ["The Cartographer's Sanctum"]="지도사의 신전"
  ["Enter the legendary hall where every known world has been mapped."]="알려진 모든 세계가 지도화된 전설의 전당으로 들어오세요."
  ["Skip to sanctum"]="신전으로 건너뛰기"
  ["The parchment tears open"]="양피지가 찢어집니다"
  ["Headquarters of every explorer who has ever mapped a world."]="세계를 지도화한 모든 탐험가의 본부."
  ["Step Through the Ink"]="먹물 속으로 발을 딛다"
  ["Press Enter · Esc skips ceremony"]="Enter · Esc는 의식을 건너뜁니다"
  ["Legendary Hall"]="전설의 전당"
  ["Search forgotten kingdoms"]="잊혀진 왕국을 검색"
  ["Search forgotten kingdoms, caves, dragons, ruins…"]="잊혀진 왕국, 동굴, 용, 폐허를 검색…"
  ["Toggle day and night"]="낮과 밤 전환"
  ["Toggle day and night on the atlas"]="지도집의 낮과 밤 전환"
  ["Cycle weather"]="날씨 순환"
  ["Cycle map weather"]="지도 날씨 순환"
  ["Toggle reduced motion"]="모션 줄이기"
  ["Leather Collections"]="가죽 컬렉션"
  ["Pull a tome from the shelf"]="책장에서 한 권을 꺼내세요"
  ["Trending Worlds"]="인기 세계"
  ["Recently explored realms"]="최근 탐험한 영역"
  ["Game worlds"]="게임 세계"
  ["Magical atlas table"]="마법 지도 테이블"
  ["Living world map. Arrow keys pan, plus and minus zoom, Enter selects focused pin."]="살아있는 세계 지도. 방향키로 이동, +/-로 확대·축소, Enter로 핀 선택."
  ["All layers"]="모든 레이어"
  ["Illuminated atlas"]="찬란한 지도책"
  ["Pin Bookmark"]="책갈피 핀 꽂기"
  ["Seal Scroll"]="두루마리 봉인"
  ["Share Discovery"]="발견 공유"
  ["Close tablet"]="석판 닫기"
  ["Drive pin into parchment"]="양피지에 핀 박기"
  ["Trace route"]="경로 그리기"
  ["Sealing the scroll…"]="두루마리를 봉인하는 중…"
  ["Warm candlelight · Cool moonlight · Handcrafted parchment"]="따뜻한 촛불 · 차분한 달빛 · 손으로 만든 양피지"
  ["Atlas sections"]="지도책 섹션"
  ["Night"]="밤"
  ["Weather"]="날씨"
  ["Motion"]="모션"
  ["markers"]="마커"
  ["All"]="전체"
  ["Cities"]="도시"
  ["Castles"]="성"
  ["Dungeons"]="던전"
  ["Bosses"]="보스"
  ["Treasure"]="보물"
  ["Shrines"]="신사"
  ["Nature"]="자연"
  ["Travel"]="여행"
  ["Quests"]="퀘스트"
  ["Secrets"]="비밀"
  ["Vista"]="전망"
  ["Craft"]="제작"
  ["Notes"]="노트"
  ["Hidden Dragons"]="숨겨진 용"
  ["Beautiful Lakes"]="아름다운 호수"
  ["Legendary Weapons"]="전설의 무기"
  ["Best Dungeons"]="최고의 던전"
  ["100% Completion"]="100% 완수"
  ["Underground Cities"]="지하 도시"
  ["Favorite Villages"]="좋아하는 마을"
  ["Speedrun Routes"]="스피드런 경로"

  # Sanctum 게임/세계 설명
  ["A frozen province of dragons, ancient barrows, and whispered prophecies."]="용과 고대 무덤, 속삭임의 예언으로 가득한 얼어붙은 지방."
  ["A shattered realm ruled by demigods, grace, and golden rot."]="신들과 신성, 황금의 부패가 지배하는 산산조각 난 영역."
  ["War-torn kingdoms, haunted woods, and contracts written in blood."]="전쟁에 찢긴 왕국, 귀신 들린 숲, 피로 쓰여진 계약."
  ["A wild kingdom reborn—towers, shrines, and endless horizons."]="다시 태어난 야생의 왕국 — 탑과 신사, 끝없는 지평선."
  ["Tamriel — Skyrim"]="탐레일 — 스카이림"
  ["Tamriel — Morrowind"]="탐레일 — 모로윈드"
  ["Tamriel — Cyrodiil"]="탐레일 — 사이로디일"

  # ===== Achievements (전설의 전당) =====
  ["The Hall of Legends"]="전설의 전당"
  ["Common"]="일반"
  ["Rare"]="희귀"
  ["Epic"]="에픽"
  ["Legendary"]="전설"
  ["Mythic"]="신화"
  ["Modest"]="겸손"
  ["Challenging"]="도전적"
  ["Arduous"]="고된"
  ["Punishing"]="가혹"
  ["Near Impossible"]="불가능에 가까운"
  ["Warrior"]="전사"
  ["Explorer"]="탐험가"
  ["Mage"]="마법사"
  ["Thief"]="도적"
  ["Diplomat"]="외교관"
  ["Craftsman"]="장인"
  ["Forged in battle. Measured in scars."]="전투 속에서 벼려졌고, 흉터로 측량된다."
  ["Where the map ends, your footprints begin."]="지도가 끝나는 곳에서 당신의 발자국이 시작된다."
  ["Weaver of storms, reader of tomes, speaker with the dead."]="폭풍을 엮고, 책을 읽으며, 죽은 자와 대화한다."
  ["Steps that leave no sound, hands that take what isn't given."]="소리 없이 걷는 발걸음, 주어지지 않은 것을 가져가는 손."
  ["Words that move kingdoms, hands that seal them."]="왕국을 움직이는 말, 그것을 봉인하는 손."
  ["The fire is patient; the hammer remembers."]="불은 인내심이 있고, 망치기는 기억한다."

  # ===== Curator's Vault (큐레이터의 금고) =====
  ["The Curator's Vault"]="큐레이터의 금고"
  ["The Curator's Vault — a legendary treasure vault cataloguing every artifact discovered across countless open-world adventures."]="큐레이터의 금고 — countless한 오픈 월드 모험에서 발견된 모든 유물을 정리하는 전설의 보물 금고."
  ["Curator's Vault"]="큐레이터의 금고"
  ["Artifacts of Legend"]="전설의 유물"
  ["Easter Eggs Found"]="찾은 이스터에그"
  ["Hidden Lore"]="숨겨진 로어"
  ["Recently Discovered"]="최근 발견"
  ["Discover"]="발견"
  ["Search artifacts"]="유물 검색"

  # ===== Grand Guild Exchange (위대한 길드 교역소) =====
  ["The Grand Guild Exchange"]="위대한 길드 교역소"
  ["Everything"]="전체"
  ["Maps"]="지도"
  ["Creatures"]="생물"
  ["Weapons"]="무기"
  ["Relics"]="유물"
  ["Alchemy"]="연금술"
  ["Shaders"]="셰이더"
  ["Lore"]="로어"

  # ===== UI 공통 =====
  ["AETHERIA"]="에테리아"
  ["AETHERIA ISLE"]="에테리아 섬"
  ["THE ISLE"]="섬"
  ["LEGENDS"]="전설"
  ["THE KEEP"]="금고"
  ["GALLERY"]="갤러리"
  ["BEGIN JOURNEY"]="여행 시작"
  ["SCROLL TO DESCEND"]="스크롤하여 내려가기"
  ["BEYOND THE ENDLESS SEA"]="끝없는 바다 너머"
  ["SCENE II"]="장면 II"
  ["SCENE III"]="장면 III"
  ["THE LIVING VILLAGE"]="살아있는 마을"
  ["THE ANCIENT STUDY"]="고대의 서재"
  ["SKIP INTRO"]="인트로 건너뛰기"
  ["SOUND ON"]="사운드 켜짐"
  ["ENABLE SOUND"]="사운드 켜기"
  ["Tamriel"]="탐레일"
  ["Elden Ring"]="엘든 링"
  ["The Witcher 3"]="위처 3"
  ["Breath of the Wild"]="야생의 숨결"
  ["Tears of the Kingdom"]="왕국의 눈물"

  # ===== Footer (원본 저작권 유지 + 한국어 라벨) =====
  ["Team:"]="팀:"
  ["Team: AA-OG's"]="팀: AA-OG's"
  ["Code:"]="코드:"
  ["Code: GAM-03"]="코드: GAM-03"
  ["Title:"]="제목:"
  ["Title: Interactive Open-World Game Companion App"]="제목: 인터랙티브 오픈 월드 게임 동반 앱"

  # ===== Misc =====
  ["Members: Govind Jindal, Aaradhya Khanna"]="팀원: Govind Jindal, Aaradhya Khanna"
  ["v0.app"]="v0.app"
)

# ---------- 처리 대상 파일 목록 ----------
TARGETS=(
  "app/layout.tsx"
  "app/page.tsx"
  "components/cinematic/experience.tsx"
  "components/cinematic/scene.tsx"
  "components/cinematic/island.tsx"
  "components/cinematic/nature.tsx"
  "components/cinematic/elder-house.tsx"
  "components/cinematic/ocean.tsx"
  "components/cinematic/study.tsx"
  "components/cinematic/villagers.tsx"
  "components/cinematic/ambient-audio.ts"
  "components/ui/button.tsx"
  "lib/cinematic.ts"
  "lib/utils.ts"
  "cartographers_sanctum/index.html"
  "cartographers_sanctum/data.js"
  "cartographers_sanctum/app.js"
  "cartographers_sanctum/styles.css"
  "achievements/index.html"
  "achievements/data.js"
  "achievements/app.js"
  "grand_guild_exchange/index.html"
  "grand_guild_exchange/App.js"
  "grand_guild_exchange/index.js"
  "grand_guild_exchange/styles.css"
  "curators_vault/index.html"
  "README.md"
)

# HTML lang 속성 en -> ko
for f in cartographers_sanctum/index.html achievements/index.html curators_vault/index.html grand_guild_exchange/index.html app/layout.tsx; do
  if [[ -f "$f" ]]; then
    if [[ "$f" == *.bak ]]; then continue; fi
    # 백업
    [[ ! -f "${f}.bak" ]] && cp "$f" "${f}.bak"
    # sed 치환 (macOS 호환)
    LC_ALL=C sed -i '' \
      -e 's|<html lang="en">|<html lang="ko">|g' \
      -e 's|<html lang="en" class="dark">|<html lang="ko" class="dark">|g' \
      -e 's|<html lang="en" className|<html lang="ko" className|g' \
      "$f"
  fi
done

# 사전 기반 치환
for f in "${TARGETS[@]}"; do
  if [[ ! -f "$f" ]]; then continue; fi
  if [[ "$f" == *.bak ]]; then continue; fi
  # 백업 (최초 1회)
  [[ ! -f "${f}.bak" ]] && cp "$f" "${f}.bak"

  # 임시 파일에 sed 치환
  tmp=$(mktemp)
  cp "$f" "$tmp"
  for key in "${!MAP[@]}"; do
    val="${MAP[$key]}"
    # macOS sed: &, |, \ 같은 특수문자 이스케이프
    esc_key=$(printf '%s\n' "$key" | sed -e 's/[&\\|]/\\&/g' | sed -e ':a;N;$!ba;s/\n/\\n/g')
    esc_val=$(printf '%s\n' "$val" | sed -e 's/[&\\|]/\\&/g' | sed -e ':a;N;$!ba;s/\n/\\n/g')
    # LC_ALL=C로 UTF-8 안전
    LC_ALL=C sed -i '' "s|$esc_key|$esc_val|g" "$tmp" 2>/dev/null || true
  done
  mv "$tmp" "$f"
done

echo "✅ 한국어화 완료 (대상: ${#TARGETS[@]}개 파일)"
echo "📦 백업: *.bak 파일 참조"
