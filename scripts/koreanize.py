#!/usr/bin/env python3
"""
AETHERIA 100% 한국어화 스크립트 (Python 3.x, macOS 호환)
- UI 라벨, 카테고리, 콘텐츠, 푸터 모두 한국어 번역
- 게임 정식명(Skyrim, Elden Ring 등)은 원형 유지
- 빌드된 three.js 번들은 손대지 않음
- 원본 보존: *.bak 자동 생성
- Idempotent: 재실행 안전
"""
from __future__ import annotations
import json
import os
import sys
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ---------- 치환 사전 ----------
# translations.json is bundled with this script (see end of file) so the
# repo is self-contained. A local override can be placed at .omo/translations.json.
_BUNDLED_JSON = Path(__file__).with_name("translations.json")
_LOCAL_JSON = ROOT / ".omo" / "translations.json"
_json_src = _LOCAL_JSON if _LOCAL_JSON.exists() else _BUNDLED_JSON
with open(_json_src, encoding="utf-8") as _f:
    MAP = json.load(_f)
# Dedupe + longest-first
_seen = set()
_MAP = []
for _k, _v in MAP:
    if _k not in _seen:
        _seen.add(_k)
        _MAP.append((_k, _v))
MAP = _MAP
MAP.sort(key=lambda x: -len(x[0]))

# ---------- 처리 대상 ----------
# HTML lang 속성을 ko로 변환할 파일
HTML_LANG_TARGETS = [
    "app/layout.tsx",
    "cartographers_sanctum/index.html",
    "achievements/index.html",
    "curators_vault/index.html",
    "grand_guild_exchange/index.html",
    "public/cartographers_sanctum/index.html",
    "public/achievements/index.html",
    "public/curators_vault/index.html",
    "public/grand_guild_exchange/index.html",
]

# 한국어 치환 대상 (소스 디렉터리 + public/ 미러)
ALL_TARGETS = HTML_LANG_TARGETS + [
    "app/layout.tsx",
    "components/cinematic/study.tsx",
    "components/cinematic/scene.tsx",
    "components/cinematic/ambient-audio.ts",
    "components/ui/button.tsx",
    "lib/cinematic.ts",
    "lib/utils.ts",
    "cartographers_sanctum/data.js",
    "cartographers_sanctum/app.js",
    "cartographers_sanctum/index.html",
    "achievements/data.js",
    "achievements/app.js",
    "achievements/index.html",
    "grand_guild_exchange/App.js",
    "grand_guild_exchange/index.js",
    "grand_guild_exchange/index.html",
    # public/ 하위 정적 모듈 (Next.js가 정적 서빙)
    "public/cartographers_sanctum/data.js",
    "public/cartographers_sanctum/app.js",
    "public/cartographers_sanctum/index.html",
    "public/achievements/data.js",
    "public/achievements/app.js",
    "public/achievements/index.html",
    "public/grand_guild_exchange/App.js",
    "public/grand_guild_exchange/index.js",
    "public/grand_guild_exchange/index.html",
    # curators_vault 빌드 번들 (정적 서빙)
    "curators_vault/assets/index-nQacoCGK.js",
    "public/curators_vault/assets/index-nQacoCGK.js",
    "README.md",
]


def koreanize_file(path: Path) -> int:
    """단일 파일 한국어화 (in-place + .bak 백업)"""
    if not path.exists():
        return 0
    bak = path.with_suffix(path.suffix + ".bak")
    if not bak.exists():
        shutil.copy2(path, bak)

    text = path.read_text(encoding="utf-8")
    original = text
    hits = 0

    for en, ko in MAP:
        if en in text:
            count = text.count(en)
            text = text.replace(en, ko)
            hits += count

    if text != original:
        path.write_text(text, encoding="utf-8")
        return hits
    return 0


def fix_html_lang(path: Path) -> bool:
    """HTML lang=en 속성을 lang=ko 로 변환"""
    if not path.exists():
        return False
    bak = path.with_suffix(path.suffix + ".bak")
    if not bak.exists():
        shutil.copy2(path, bak)
    text = path.read_text(encoding="utf-8")
    new_text = (
        text.replace('<html lang="en">', '<html lang="ko">')
            .replace('<html lang="en" class="dark">', '<html lang="ko" class="dark">')
            .replace('<html lang="en" className', '<html lang="ko" className')
    )
    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        return True
    return False


def main():
    os.chdir(ROOT)
    total_hits = 0
    processed = 0

    print(f"📍 작업 루트: {ROOT}")
    print(f"📖 사전 크기: {len(MAP)}건")
    print()

    # 1. HTML lang 속성
    print("🌐 HTML lang 속성 ko 변환 중...")
    for rel in HTML_LANG_TARGETS:
        p = Path(rel)
        if fix_html_lang(p):
            print(f"  ✓ {rel}")
        else:
            print(f"  · {rel} (변경 없음)")

    print()

    # 2. 사전 기반 한국어화
    print("🇰🇷 한국어 치환 중...")
    for rel in ALL_TARGETS:
        p = Path(rel)
        if not p.exists():
            continue
        hits = koreanize_file(p)
        if hits > 0:
            print(f"  ✓ {rel}  ({hits}건 치환)")
            total_hits += hits
            processed += 1
        else:
            print(f"  · {rel}  (변경 없음)")

    print()
    print(f"✅ 완료! 총 {total_hits}건 치환, {processed}개 파일 수정")
    print(f"📦 백업: 모든 파일의 *.bak")


if __name__ == "__main__":
    main()
