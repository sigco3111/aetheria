/* 지도사의 신전 — ceremonial interaction layer */
(function () {
  "use strict";

  const D = window.SANCTUM_DATA;
  if (!D) {
    console.error("SANCTUM_DATA missing");
    return;
  }

  const state = {
    worldId: D.WORLDS[0].id,
    active유물: new Set(["all"]),
    active컬렉션: null,
    selectedId: null,
    focusedPinIndex: -1,
    bookmarks: new Set(loadJson("sanctum_bookmarks", [])),
    routes: [],
    atlasTab: "lore",
    is밤: false,
    weather: "mist", // mist | clear | storm
    reduce모션: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    searchQuery: "",
    searchIndex: 0,
    pan: { x: 0, y: 0 },
    zoom: 1,
    dragging: false,
    dragStart: null,
    entered: false,
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function loadJson(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* ignore */
    }
  }

  function toast(msg) {
    const t = els.toast;
    t.hidden = false;
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add("is-show"));
    clearTimeout(toast._tm);
    toast._tm = setTimeout(() => {
      t.classList.remove("is-show");
      setTimeout(() => {
        t.hidden = true;
      }, 350);
    }, 2600);
  }

  function currentWorld() {
    return D.WORLDS.find((w) => w.id === state.worldId) || D.WORLDS[0];
  }

  function locationsForWorld() {
    return D.LOCATIONS.filter((l) => l.worldId === state.worldId);
  }

  function activeTags() {
    if (state.active유물.has("all") || state.active유물.size === 0) return null;
    const tags = new Set();
    state.active유물.forEach((id) => {
      const r = D.유물.find((x) => x.id === id);
      if (r && r.tags) r.tags.forEach((t) => tags.add(t));
    });
    if (state.active컬렉션) {
      const c = D.COLLECTIONS.find((x) => x.id === state.active컬렉션);
      if (c) c.tags.forEach((t) => tags.add(t));
    }
    return tags;
  }

  function filteredLocations() {
    let list = locationsForWorld();
    const tags = activeTags();
    if (tags && tags.size) {
      list = list.filter((l) => l.tags.some((t) => tags.has(t)));
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.tags.some((t) => t.includes(q)) ||
          l.description.toLowerCase().includes(q) ||
          l.creator.toLowerCase().includes(q)
      );
    }
    return list;
  }

  /* ---------- Portal ink canvas ---------- */
  function initPortalInk() {
    const canvas = els.inkCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles, raf;

    function resize() {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    }

    function spawn() {
      particles = Array.from({ length: 48 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.3 * devicePixelRatio,
        r: (0.6 + Math.random() * 2.2) * devicePixelRatio,
        a: 0.15 + Math.random() * 0.4,
      }));
    }

    function frame() {
      if (state.entered) return;
      ctx.clearRect(0, 0, w, h);
      // flowing ink veins
      ctx.strokeStyle = "rgba(201,162,39,0.08)";
      ctx.lineWidth = 1 * devicePixelRatio;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const baseY = h * (0.25 + i * 0.1);
        for (let x = 0; x < w; x += 8 * devicePixelRatio) {
          const y =
            baseY +
            Math.sin(x * 0.002 + performance.now() * 0.0004 + i) * 30 * devicePixelRatio +
            Math.sin(x * 0.006 + i) * 12 * devicePixelRatio;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.fillStyle = `rgba(232,213,176,${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    }

    resize();
    spawn();
    if (!state.reduce모션) frame();
    window.addEventListener("resize", () => {
      if (state.entered) return;
      resize();
      spawn();
    });
  }

  function enterSanctum() {
    if (state.entered) return;
    state.entered = true;
    const portal = els.portal;
    portal.classList.add("is-exiting");
    els.sanctum.setAttribute("aria-hidden", "false");
    els.sanctum.classList.remove("is-hidden");
    // slight delay so portal fade and sanctum reveal overlap cinematically
    requestAnimationFrame(() => {
      els.sanctum.classList.add("is-revealed");
    });
    setTimeout(() => {
      portal.classList.add("is-gone");
      portal.setAttribute("aria-hidden", "true");
    }, 1300);
    toast("먹물이 가라앉고, 지도책이 숨 쉬기 시작합니다.");
    // focus map for keyboard explorers
    setTimeout(() => els.mapStage.focus({ preventScroll: true }), 900);
  }

  /* ---------- Ambient chamber ---------- */
  function buildStars() {
    const root = els.constellation;
    if (!root) return;
    root.innerHTML = "";
    const n = state.reduce모션 ? 24 : 60;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "star";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.setProperty("--d", 2 + Math.random() * 5 + "s");
      s.style.setProperty("--delay", Math.random() * 4 + "s");
      if (Math.random() > 0.7) {
        s.style.width = "3px";
        s.style.height = "3px";
      }
      root.appendChild(s);
    }
  }

  function buildDust() {
    const root = els.dust;
    if (!root || state.reduce모션) return;
    root.innerHTML = "";
    for (let i = 0; i < 28; i++) {
      const m = document.createElement("span");
      m.className = "mote";
      m.style.left = Math.random() * 100 + "%";
      m.style.bottom = Math.random() * 20 + "%";
      m.style.setProperty("--d", 10 + Math.random() * 18 + "s");
      m.style.setProperty("--delay", Math.random() * 12 + "s");
      root.appendChild(m);
    }
  }

  /* ---------- Worlds / collections / relics UI ---------- */
  function render컬렉션s() {
    const ul = els.collectionsList;
    ul.innerHTML = "";
    D.COLLECTIONS.forEach((c) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "book-item" + (state.active컬렉션 === c.id ? " is-active" : "");
      btn.setAttribute("aria-pressed", state.active컬렉션 === c.id ? "true" : "false");
      btn.innerHTML = `
        <span class="book-spine" style="--spine:${c.spine}"></span>
        <span class="book-body">
          <strong>${escapeHtml(c.name)}</strong>
          <span>${c.count} marked leaves</span>
        </span>`;
      btn.addEventListener("click", () => {
        state.active컬렉션 = state.active컬렉션 === c.id ? null : c.id;
        if (state.active컬렉션) {
          // clear "all" exclusive feel — collection acts as soft filter
          state.active유물.delete("all");
          if (state.active유물.size === 0) state.active유물.add("all");
          toast(`Tome drawn: ${c.name}`);
        } else {
          toast("책이 선반으로 돌아갔습니다");
        }
        render컬렉션s();
        render유물();
        renderPins();
        updateLegend();
        renderAtlas();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
  }

  function renderWorlds() {
    const rail = els.worldsRail;
    rail.innerHTML = "";
    D.WORLDS.forEach((w) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "world-card" + (w.id === state.worldId ? " is-active" : "");
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", w.id === state.worldId ? "true" : "false");
      btn.innerHTML = `
        <div class="world-art" style="background:${w.art}" aria-hidden="true"></div>
        <div class="world-info">
          <strong>${escapeHtml(w.name)}</strong>
          <div class="world-meta">
            <span class="rating">★ ${w.rating}</span>
            <span>${escapeHtml(w.size)}</span>
            <span>${w.discoveries} finds</span>
          </div>
          <div class="completion-bar" aria-hidden="true"><i style="width:${w.completion}%"></i></div>
        </div>`;
      btn.addEventListener("click", () => selectWorld(w.id));
      rail.appendChild(btn);
    });
  }

  function selectWorld(id) {
    if (state.worldId === id) return;
    state.worldId = id;
    state.selectedId = null;
    state.focusedPinIndex = -1;
    state.routes = [];
    closeTablet();
    renderWorlds();
    drawMap();
    renderPins();
    renderThreads();
    updateLegend();
    renderAtlas();
    updateActions();
    const w = currentWorld();
    toast(`Atlas turns to ${w.realm}`);
    rippleAt(50, 50);
  }

  function render유물() {
    const ring = els.relicRing;
    ring.innerHTML = "";
    D.유물.forEach((r) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "relic" + (state.active유물.has(r.id) ? " is-active" : "");
      btn.setAttribute("aria-pressed", state.active유물.has(r.id) ? "true" : "false");
      btn.title = `Layer: ${r.name}`;
      btn.innerHTML = `<span class="relic-sym" aria-hidden="true">${r.symbol}</span><span class="relic-name">${escapeHtml(r.name)}</span>`;
      btn.addEventListener("click", () => toggle유물(r.id));
      ring.appendChild(btn);
    });
  }

  function toggle유물(id) {
    if (id === "all") {
      state.active유물 = new Set(["all"]);
    } else {
      state.active유물.delete("all");
      if (state.active유물.has(id)) state.active유물.delete(id);
      else state.active유물.add(id);
      if (state.active유물.size === 0) state.active유물.add("all");
    }
    render유물();
    renderPins();
    updateLegend();
    const names = [...state.active유물].map((i) => D.유물.find((r) => r.id === i)?.name || i);
    toast(names.includes("전체") ? "모든 레이어 깨어남" : `유물 켜짐: ${names.join(", ")}`);
  }

  /* ---------- Living map canvas ---------- */
  function drawMap() {
    const canvas = els.mapCanvas;
    if (!canvas) return;
    const stage = els.mapStage;
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = Math.max(320, rect.width || 900);
    const cssH = Math.max(240, rect.height || 520);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = cssW;
    const h = cssH;
    const world = currentWorld();
    const pal = world.palette;
    const rng = mulberry32(hashStr(world.id));

    // parchment base
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#c4a878");
    base.addColorStop(0.5, "#d8c09a");
    base.addColorStop(1, "#b8956a");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // noise grain
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = rng() > 0.5 ? "#3d2914" : "#fff8e8";
      ctx.fillRect(rng() * w, rng() * h, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;

    // ocean / land masses via layered blobs
    drawWater(ctx, w, h, pal, rng);
    drawContinents(ctx, w, h, pal, rng);
    drawMountains(ctx, w, h, pal, rng);
    drawForests(ctx, w, h, pal, rng);
    drawRivers(ctx, w, h, pal, rng);
    drawRoads(ctx, w, h, rng);
    draw도시Glow(ctx, w, h, rng);

    // compass rose
    drawCompass(ctx, w - 54, h - 54, 28);

    // ornate border ticks
    ctx.strokeStyle = "rgba(61,41,20,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.strokeStyle = "rgba(176,141,87,0.4)";
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // graticule faint
    ctx.strokeStyle = "rgba(61,41,20,0.08)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const x = (w / 8) * i;
      const y = (h / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, 12);
      ctx.lineTo(x, h - 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, y);
      ctx.lineTo(w - 12, y);
      ctx.stroke();
    }

    // title cartouche
    ctx.fillStyle = "rgba(232,213,176,0.55)";
    ctx.fillRect(18, 16, 160, 36);
    ctx.strokeStyle = "rgba(61,41,20,0.35)";
    ctx.strokeRect(18, 16, 160, 36);
    ctx.fillStyle = "#2a1a10";
    ctx.font = "600 11px Cinzel, serif";
    ctx.fillText(world.realm.toUpperCase(), 28, 32);
    ctx.font = "italic 12px 'IM Fell English', serif";
    ctx.fillText(world.name, 28, 46);

    if (state.is밤) {
      ctx.fillStyle = "rgba(10, 18, 35, 0.28)";
      ctx.fillRect(0, 0, w, h);
      // moon glints
      for (let i = 0; i < 18; i++) {
        ctx.fillStyle = `rgba(200,220,255,${0.15 + rng() * 0.35})`;
        ctx.beginPath();
        ctx.arc(rng() * w, rng() * h, 0.8 + rng(), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawWater(ctx, w, h, pal, rng) {
    ctx.fillStyle = pal.water;
    ctx.globalAlpha = 0.55;
    // large seas
    blob(ctx, w * 0.15, h * 0.7, w * 0.35, h * 0.4, rng);
    blob(ctx, w * 0.75, h * 0.25, w * 0.4, h * 0.35, rng);
    blob(ctx, w * 0.55, h * 0.85, w * 0.3, h * 0.25, rng);
    ctx.globalAlpha = 1;
    // water shimmer lines
    ctx.strokeStyle = "rgba(180,220,230,0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const y = h * (0.55 + rng() * 0.4);
      ctx.beginPath();
      for (let x = 0; x < w; x += 6) {
        const yy = y + Math.sin(x * 0.04 + i) * 3;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }

  function drawContinents(ctx, w, h, pal, rng) {
    ctx.fillStyle = pal.land;
    ctx.globalAlpha = 0.85;
    blob(ctx, w * 0.45, h * 0.45, w * 0.55, h * 0.5, rng);
    blob(ctx, w * 0.28, h * 0.35, w * 0.3, h * 0.28, rng);
    blob(ctx, w * 0.68, h * 0.55, w * 0.32, h * 0.3, rng);
    blob(ctx, w * 0.5, h * 0.22, w * 0.25, h * 0.2, rng);
    ctx.globalAlpha = 1;
    // land edge ink
    ctx.strokeStyle = "rgba(40,28,16,0.25)";
    ctx.lineWidth = 1.5;
    // soft height shading
    const g = ctx.createRadialGradient(w * 0.45, h * 0.4, 10, w * 0.45, h * 0.4, w * 0.35);
    g.addColorStop(0, "rgba(255,240,200,0.12)");
    g.addColorStop(1, "rgba(40,30,15,0.15)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawMountains(ctx, w, h, pal, rng) {
    const peaks = 14 + Math.floor(rng() * 10);
    for (let i = 0; i < peaks; i++) {
      const x = w * (0.2 + rng() * 0.6);
      const y = h * (0.2 + rng() * 0.45);
      const s = 10 + rng() * 22;
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s * 0.7, y + s * 0.35);
      ctx.lineTo(x - s * 0.7, y + s * 0.35);
      ctx.closePath();
      ctx.fillStyle = pal.peak;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
      // snow cap
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s * 0.25, y - s * 0.45);
      ctx.lineTo(x - s * 0.25, y - s * 0.45);
      ctx.closePath();
      ctx.fillStyle = pal.snow;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
      // hatch
      ctx.strokeStyle = "rgba(30,20,10,0.35)";
      ctx.beginPath();
      ctx.moveTo(x - s * 0.3, y);
      ctx.lineTo(x + s * 0.15, y + s * 0.2);
      ctx.stroke();
    }
  }

  function drawForests(ctx, w, h, pal, rng) {
    ctx.fillStyle = pal.forest;
    for (let i = 0; i < 80; i++) {
      const x = w * (0.15 + rng() * 0.7);
      const y = h * (0.25 + rng() * 0.55);
      ctx.globalAlpha = 0.25 + rng() * 0.35;
      ctx.beginPath();
      ctx.arc(x, y, 2 + rng() * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawRivers(ctx, w, h, pal, rng) {
    ctx.strokeStyle = pal.water;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.65;
    ctx.lineCap = "round";
    for (let r = 0; r < 4; r++) {
      let x = w * (0.25 + rng() * 0.5);
      let y = h * (0.15 + rng() * 0.2);
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 18; s++) {
        x += (rng() - 0.45) * 28;
        y += 8 + rng() * 14;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawRoads(ctx, w, h, rng) {
    ctx.strokeStyle = "rgba(90,60,30,0.35)";
    ctx.lineWidth = 1.25;
    ctx.setLineDash([4, 5]);
    for (let r = 0; r < 5; r++) {
      let x = w * (0.2 + rng() * 0.6);
      let y = h * (0.25 + rng() * 0.5);
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let s = 0; s < 10; s++) {
        x += (rng() - 0.5) * 40;
        y += (rng() - 0.5) * 30;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  function draw도시Glow(ctx, w, h, rng) {
    for (let i = 0; i < 10; i++) {
      const x = w * (0.2 + rng() * 0.6);
      const y = h * (0.25 + rng() * 0.5);
      const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
      g.addColorStop(0, "rgba(255, 200, 100, 0.35)");
      g.addColorStop(1, "rgba(255, 200, 100, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCompass(ctx, cx, cy, r) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(61,41,20,0.55)";
    ctx.fillStyle = "rgba(232,213,176,0.55)";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#8b3a2f";
    ctx.beginPath();
    ctx.moveTo(0, -r + 4);
    ctx.lineTo(5, 2);
    ctx.lineTo(0, -4);
    ctx.lineTo(-5, 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2a1a10";
    ctx.beginPath();
    ctx.moveTo(0, r - 4);
    ctx.lineTo(5, -2);
    ctx.lineTo(0, 4);
    ctx.lineTo(-5, -2);
    ctx.closePath();
    ctx.fill();
    ctx.font = "600 9px Cinzel, serif";
    ctx.fillStyle = "#2a1a10";
    ctx.textAlign = "center";
    ctx.fillText("N", 0, -r + 14);
    ctx.restore();
  }

  function blob(ctx, cx, cy, rw, rh, rng) {
    ctx.beginPath();
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const jitter = 0.75 + rng() * 0.35;
      const x = cx + Math.cos(a) * rw * 0.5 * jitter;
      const y = cy + Math.sin(a) * rh * 0.5 * jitter;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* ---------- Pins ---------- */
  function renderPins() {
    const root = els.mapPins;
    const list = filteredLocations();
    const all = locationsForWorld();
    root.innerHTML = "";

    all.forEach((loc, idx) => {
      const visible = list.some((l) => l.id === loc.id);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "map-pin";
      if (!visible) btn.classList.add("is-dim");
      if (state.selectedId === loc.id) btn.classList.add("is-selected");
      if (state.bookmarks.has(loc.id)) btn.classList.add("is-bookmarked");
      btn.style.left = loc.x + "%";
      btn.style.top = loc.y + "%";
      btn.style.setProperty("--delay", (idx % 10) * 0.15 + "s");
      btn.dataset.id = loc.id;
      btn.setAttribute("aria-label", `${loc.name}, ${loc.primary}, ${loc.difficulty}`);
      btn.innerHTML = `<span class="pin-label">${escapeHtml(loc.name)}</span><span class="pin-glyph" aria-hidden="true">${loc.glyph}</span>`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectLocation(loc.id);
      });
      btn.addEventListener("focus", () => {
        state.focusedPinIndex = filteredLocations().findIndex((l) => l.id === loc.id);
        [...root.querySelector전체(".map-pin")].forEach((p) => p.classList.remove("is-focused"));
        btn.classList.add("is-focused");
      });
      root.appendChild(btn);
    });

    els.pinCount.textContent = `${list.length} marker${list.length === 1 ? "" : "s"}`;
  }

  function selectLocation(id) {
    state.selectedId = id;
    const loc = D.LOCATIONS.find((l) => l.id === id);
    if (!loc) return;
    if (loc.worldId !== state.worldId) {
      selectWorld(loc.worldId);
    }
    renderPins();
    openTablet(loc);
    renderAtlas(loc);
    updateActions();
    rippleAt(loc.x, loc.y);
    // ceremonial zoom feel via stage class
    els.mapStage.classList.add("is-inspecting");
    setTimeout(() => els.mapStage.classList.remove("is-inspecting"), 600);
  }

  function rippleAt(xPct, yPct) {
    const r = els.mapRipple;
    r.style.left = xPct + "%";
    r.style.top = yPct + "%";
    r.classList.remove("is-active");
    void r.offsetWidth;
    r.classList.add("is-active");
  }

  /* ---------- Threads (bookmarks) ---------- */
  function renderThreads() {
    const root = els.mapThreads;
    const marks = locationsForWorld().filter((l) => state.bookmarks.has(l.id));
    if (marks.length < 2 && state.routes.length === 0) {
      root.innerHTML = "";
      return;
    }
    let paths = "";
    // connect bookmarks in order
    if (marks.length >= 2) {
      let d = `M ${marks[0].x} ${marks[0].y}`;
      for (let i = 1; i < marks.length; i++) {
        const a = marks[i - 1];
        const b = marks[i];
        const cx = (a.x + b.x) / 2 + (i % 2 ? 4 : -4);
        const cy = (a.y + b.y) / 2 - 3;
        d += ` Q ${cx} ${cy} ${b.x} ${b.y}`;
      }
      paths += `<path vector-effect="non-scaling-stroke" d="${d}" />`;
    }
    state.routes.forEach((route) => {
      if (route.length < 2) return;
      let d = `M ${route[0].x} ${route[0].y}`;
      for (let i = 1; i < route.length; i++) {
        d += ` L ${route[i].x} ${route[i].y}`;
      }
      paths += `<path vector-effect="non-scaling-stroke" d="${d}" stroke="rgba(139,58,47,0.55)" />`;
    });
    root.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${paths}</svg>`;
  }

  /* ---------- Tablet ---------- */
  function openTablet(loc) {
    const world = D.WORLDS.find((w) => w.id === loc.worldId);
    els.tablet.hidden = false;
    requestAnimationFrame(() => els.tablet.classList.add("is-open"));
    els.tabletWorld.textContent = `${world.game} · ${world.realm}`;
    els.tabletTitle.textContent = loc.name;
    els.tabletMeta.innerHTML = `
      <span class="chip">${escapeHtml(loc.difficulty)}</span>
      <span class="chip">${escapeHtml(loc.primary)}</span>
      <span>★ ${loc.rating}</span>
      <span>${loc.downloads.toLocaleString()} seals</span>
      <span>${escapeHtml(loc.coords)}</span>`;
    els.tabletDesc.textContent = loc.description;
    els.tabletGrid.innerHTML = `
      <div class="cell"><b>퀘스트</b><span>${loc.quests} nearby</span></div>
      <div class="cell"><b>Collectibles</b><span>${loc.collectibles}</span></div>
      <div class="cell"><b>NPCs</b><span>${loc.npcs}</span></div>
      <div class="cell"><b>비밀</b><span>${loc.secrets}</span></div>
      <div class="cell"><b>Cartographer</b><span>${escapeHtml(loc.creator)}</span></div>
      <div class="cell"><b>Tags</b><span>${loc.tags.join(", ")}</span></div>`;
    els.tabletBookmark.textContent = state.bookmarks.has(loc.id)
      ? "양피지 핀 제거"
      : "양피지에 핀 박기";
  }

  function closeTablet() {
    els.tablet.classList.remove("is-open");
    setTimeout(() => {
      if (!els.tablet.classList.contains("is-open")) els.tablet.hidden = true;
    }, 400);
  }

  /* ---------- Atlas book ---------- */
  function renderAtlas(loc) {
    const inner = els.atlasInner;
    // restart page animation
    inner.style.animation = "none";
    void inner.offsetWidth;
    inner.style.animation = "";

    const world = currentWorld();
    loc = loc || (state.selectedId && D.LOCATIONS.find((l) => l.id === state.selectedId));

    if (!loc) {
      inner.innerHTML = renderWorldAtlas(world);
      return;
    }

    if (state.atlasTab === "lore") {
      inner.innerHTML = `
        <p class="atlas-kicker">${escapeHtml(world.game)}</p>
        <h3 class="atlas-title">${escapeHtml(loc.name)}</h3>
        <div class="atlas-rule"></div>
        <div class="atlas-body">
          <p>${escapeHtml(loc.description)}</p>
          <p><em>“${escapeHtml(loc.notes[0])}”</em></p>
          <div class="tag-row">${loc.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
          <p>난이도 각인: <strong>${escapeHtml(loc.difficulty)}</strong>. Coordinates ${escapeHtml(loc.coords)}.</p>
        </div>`;
    } else if (state.atlasTab === "stats") {
      inner.innerHTML = `
        <p class="atlas-kicker">Survey Metrics</p>
        <h3 class="atlas-title">${escapeHtml(loc.name)}</h3>
        <div class="atlas-rule"></div>
        <div class="stat-grid">
          <div class="stat-cell"><b>Rating</b><span>★ ${loc.rating}</span></div>
          <div class="stat-cell"><b>Sealed scrolls</b><span>${loc.downloads.toLocaleString()}</span></div>
          <div class="stat-cell"><b>퀘스트</b><span>${loc.quests}</span></div>
          <div class="stat-cell"><b>Collectibles</b><span>${loc.collectibles}</span></div>
          <div class="stat-cell"><b>NPCs</b><span>${loc.npcs}</span></div>
          <div class="stat-cell"><b>비밀</b><span>${loc.secrets}</span></div>
          <div class="stat-cell"><b>Creator</b><span>${escapeHtml(loc.creator)}</span></div>
          <div class="stat-cell"><b>World size</b><span>${escapeHtml(world.size)}</span></div>
        </div>
        <div class="atlas-body"><p>World completion across the Sanctum: <strong>${world.completion}%</strong> · Community ★ ${world.rating}</p></div>`;
    } else if (state.atlasTab === "notes") {
      inner.innerHTML = `
        <p class="atlas-kicker">Cartographer Leaves</p>
        <h3 class="atlas-title">${escapeHtml(loc.name)}</h3>
        <div class="atlas-rule"></div>
        ${loc.notes
          .map(
            (n) => `<div class="note-card"><span class="seal" aria-hidden="true"></span>${escapeHtml(n)}</div>`
          )
          .join("")}
        <div class="atlas-body"><p><em>Pinned by explorers of the Sanctum. Ink still wet on the latest leaf.</em></p></div>`;
    } else {
      inner.innerHTML = `
        <p class="atlas-kicker">Community Layer</p>
        <h3 class="atlas-title">${escapeHtml(loc.name)}</h3>
        <div class="atlas-rule"></div>
        ${loc.community
          .map(
            (n) => `<div class="note-card"><span class="seal" aria-hidden="true"></span>${escapeHtml(n)}</div>`
          )
          .join("")}
        <div class="atlas-body">
          <p>Enable more layers via the relics: routes, rare loot, photo spots, speedrun paths.</p>
          <div class="tag-row"><span class="tag">handwritten</span><span class="tag">wax seal</span><span class="tag">sketch</span></div>
        </div>`;
    }
  }

  function renderWorldAtlas(world) {
    const locs = locationsForWorld();
    const top = [...locs].sort((a, b) => b.rating - a.rating).slice(0, 4);
    if (state.atlasTab === "stats") {
      return `
        <p class="atlas-kicker">World Ledger</p>
        <h3 class="atlas-title">${escapeHtml(world.name)}</h3>
        <div class="atlas-rule"></div>
        <div class="stat-grid">
          <div class="stat-cell"><b>Realm</b><span>${escapeHtml(world.realm)}</span></div>
          <div class="stat-cell"><b>Rating</b><span>★ ${world.rating}</span></div>
          <div class="stat-cell"><b>Size</b><span>${escapeHtml(world.size)}</span></div>
          <div class="stat-cell"><b>발견</b><span>${world.discoveries}</span></div>
          <div class="stat-cell"><b>Completion</b><span>${world.completion}%</span></div>
          <div class="stat-cell"><b>Markers here</b><span>${locs.length}</span></div>
        </div>`;
    }
    if (state.atlasTab === "notes" || state.atlasTab === "community") {
      return `
        <p class="atlas-kicker">${state.atlasTab === "community" ? "Whispers" : "Margins"}</p>
        <h3 class="atlas-title">${escapeHtml(world.name)}</h3>
        <div class="atlas-rule"></div>
        <div class="note-card"><span class="seal"></span>Select a marker on the living atlas to read field notes.</div>
        <div class="note-card"><span class="seal"></span>${escapeHtml(world.blurb)}</div>
        <div class="atlas-body"><p><em>${locs.length} locations catalogued in this chamber.</em></p></div>`;
    }
    return `
      <p class="atlas-kicker">Illuminated Atlas</p>
      <h3 class="atlas-title">${escapeHtml(world.name)}</h3>
      <div class="atlas-rule"></div>
      <div class="atlas-body">
        <p>${escapeHtml(world.blurb)}</p>
        <p><em>게임: ${escapeHtml(world.game)}</em></p>
        <p>추천 discoveries:</p>
        <ul style="margin:0.25rem 0 0.75rem 1rem;padding:0;font-family:var(--font-hand);">
          ${top.map((t) => `<li>${escapeHtml(t.name)} — ★ ${t.rating}</li>`).join("")}
        </ul>
        <p>양피지 위에 떠 있는 인장을 만져 그 석판을 열어보세요.</p>
      </div>`;
  }

  /* ---------- Search ---------- */
  function onSearchInput() {
    const q = els.searchInput.value;
    state.searchQuery = q;
    els.searchParchment.classList.toggle("is-writing", q.length > 0);
    renderPins();
    updateLegend();
    renderSearchResults();
    els.searchStatus.textContent = q
      ? `${filteredLocations().length} results for ${q}`
      : "검색이 초기화되었습니다";
    if (q.trim()) rippleAt(50 + Math.sin(q.length) * 10, 50);
  }

  function renderSearchResults() {
    const box = els.searchResults;
    const q = state.searchQuery.trim().toLowerCase();
    if (!q) {
      box.hidden = true;
      box.innerHTML = "";
      return;
    }
    // global search across worlds
    const hits = D.LOCATIONS.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.tags.some((t) => t.includes(q)) ||
        l.creator.toLowerCase().includes(q)
    ).slice(0, 12);
    if (!hits.length) {
      box.hidden = false;
      box.innerHTML = `<div class="search-result" style="cursor:default">그 이름에 응답하는 왕국이 없습니다…</div>`;
      return;
    }
    box.hidden = false;
    box.innerHTML = hits
      .map((h, i) => {
        const w = D.WORLDS.find((x) => x.id === h.worldId);
        return `<button type="button" class="search-result${i === state.searchIndex ? " is-active" : ""}" role="option" data-id="${h.id}">
          ${escapeHtml(h.name)}
          <small>${escapeHtml(w.name)} · ${escapeHtml(h.primary)} · ${escapeHtml(h.difficulty)}</small>
        </button>`;
      })
      .join("");
    box.querySelector전체(".search-result[data-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const loc = D.LOCATIONS.find((l) => l.id === id);
        if (loc.worldId !== state.worldId) selectWorld(loc.worldId);
        state.searchQuery = "";
        els.searchInput.value = "";
        els.searchParchment.classList.remove("is-writing");
        box.hidden = true;
        selectLocation(id);
      });
    });
  }

  /* ---------- Actions ---------- */
  function updateActions() {
    const has = !!state.selectedId;
    els.btnBookmark.disabled = !has;
    els.btnDownload.disabled = !has;
    els.btnShare.disabled = !has;
  }

  function updateLegend() {
    const w = currentWorld();
    els.activeWorldName.textContent = `${w.realm} — ${w.name}`;
    const tags = activeTags();
    if (state.active컬렉션) {
      const c = D.COLLECTIONS.find((x) => x.id === state.active컬렉션);
      els.layerStatus.textContent = c ? `컬렉션: ${c.name}` : "컬렉션";
    } else if (!tags) {
      els.layerStatus.textContent = "모든 레이어";
    } else {
      els.layerStatus.textContent = [...state.active유물]
        .map((id) => D.유물.find((r) => r.id === id)?.name)
        .filter(Boolean)
        .join(" · ");
    }
  }

  function toggleBookmark(id) {
    id = id || state.selectedId;
    if (!id) return;
    if (state.bookmarks.has(id)) {
      state.bookmarks.delete(id);
      toast("양피지에서 핀이 뽑힘");
    } else {
      state.bookmarks.add(id);
      toast("지도책에 책갈피 박힘");
    }
    saveJson("sanctum_bookmarks", [...state.bookmarks]);
    renderPins();
    renderThreads();
    const loc = D.LOCATIONS.find((l) => l.id === id);
    if (loc && els.tablet.classList.contains("is-open")) openTablet(loc);
  }

  function sealScroll() {
    if (!state.selectedId) return;
    const loc = D.LOCATIONS.find((l) => l.id === state.selectedId);
    els.scrollSeal.hidden = false;
    els.scrollMsg.textContent = `Sealing “${loc.name}”…`;
    setTimeout(() => {
      els.scrollMsg.textContent = "봉인 완료. 두루마리가 가방에 담겼습니다.";
    }, 1100);
    setTimeout(() => {
      els.scrollSeal.hidden = true;
      // actual file download of a tiny parchment note
      const text = [
        "지도사의 신전",
        "════════════════════════",
        loc.name,
        `${currentWorld().game} · ${currentWorld().realm}`,
        "",
        loc.description,
        "",
        `Difficulty: ${loc.difficulty}`,
        `Coords: ${loc.coords}`,
        `Creator: ${loc.creator}`,
        `Tags: ${loc.tags.join(", ")}`,
        "",
        loc.notes.join("\n"),
      ].join("\n");
      const blob = new Blob([text], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${loc.name.replace(/\s+/g, "_").toLowerCase()}_scroll.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast("두루마리 봉인되어 전달됨");
    }, 2000);
  }

  function share발견y() {
    if (!state.selectedId) return;
    const loc = D.LOCATIONS.find((l) => l.id === state.selectedId);
    const text = `발견ed ${loc.name} in the 지도사의 신전 (${currentWorld().name})`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => toast("발견y 급사의 석판에 복사됨"),
        () => toast(text)
      );
    } else {
      toast(text);
    }
  }

  function traceRoute() {
    if (!state.selectedId) return;
    const loc = D.LOCATIONS.find((l) => l.id === state.selectedId);
    const nearby = locationsForWorld()
      .filter((l) => l.id !== loc.id)
      .map((l) => ({
        l,
        d: Math.hypot(l.x - loc.x, l.y - loc.y),
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .map((x) => x.l);
    state.routes = [[loc, ...nearby]];
    renderThreads();
    toast("살아있는 지도 위에 경로가 그려졌습니다");
  }

  /* ---------- Day/night weather motion ---------- */
  function applyAtmosphere() {
    els.mapStage.classList.toggle("is-night", state.is밤);
    els.mapStage.classList.remove("weather-mist", "weather-clear", "weather-storm");
    els.mapStage.classList.add("weather-" + state.weather);
    els.btnDaynight.setAttribute("aria-pressed", state.is밤 ? "true" : "false");
    els.btnDaynight.querySelector(".relic-icon").textContent = state.is밤 ? "☀" : "☾";
    els.btnDaynight.querySelector(".relic-label").textContent = state.is밤 ? "Day" : "밤";
    document.body.classList.toggle("reduce-motion", state.reduce모션);
    els.btn모션.setAttribute("aria-pressed", state.reduce모션 ? "true" : "false");
    drawMap();
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '\u0026amp;')
      .replace(/</g, '\u0026lt;')
      .replace(/>/g, '\u0026gt;')
      .replace(/"/g, '\u0026quot;');
  }

  /* ---------- Keyboard ---------- */
  function onKeydown(e) {
    // portal
    if (!state.entered) {
      if (e.key === "Enter") {
        e.preventDefault();
        enterSanctum();
      }
      if (e.key === "Esc") {
        e.preventDefault();
        enterSanctum();
      }
      return;
    }

    // focus search
    if (e.key === "/" && document.activeElement !== els.searchInput) {
      e.preventDefault();
      els.searchInput.focus();
      return;
    }

    if (e.key === "Esc") {
      if (!els.searchResults.hidden) {
        els.searchResults.hidden = true;
        return;
      }
      if (els.tablet.classList.contains("is-open")) {
        closeTablet();
        return;
      }
    }

    // search results nav
    if (!els.searchResults.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      const items = [...els.searchResults.querySelector전체(".search-result[data-id]")];
      if (!items.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        state.searchIndex = Math.min(items.length - 1, state.searchIndex + 1);
        renderSearchResults();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        state.searchIndex = Math.max(0, state.searchIndex - 1);
        renderSearchResults();
      } else if (e.key === "Enter") {
        e.preventDefault();
        items[state.searchIndex]?.click();
      }
      return;
    }

    // map pin keyboard when stage focused
    if (document.activeElement === els.mapStage || document.activeElement?.classList?.contains("map-pin")) {
      const list = filteredLocations().filter(Boolean);
      if (!list.length) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        state.focusedPinIndex = (state.focusedPinIndex + 1 + list.length) % list.length;
        focusPinByIndex();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        state.focusedPinIndex = (state.focusedPinIndex - 1 + list.length) % list.length;
        focusPinByIndex();
      } else if (e.key === "Enter" || e.key === " ") {
        if (state.focusedPinIndex >= 0 && list[state.focusedPinIndex]) {
          e.preventDefault();
          selectLocation(list[state.focusedPinIndex].id);
        }
      }
    }
  }

  function focusPinByIndex() {
    const list = filteredLocations();
    const loc = list[state.focusedPinIndex];
    if (!loc) return;
    const btn = els.mapPins.querySelector(`.map-pin[data-id="${loc.id}"]`);
    if (btn) btn.focus();
  }

  /* ---------- Map pointer pan (subtle) ---------- */
  function initMapPointer() {
    const stage = els.mapStage;
    let ox = 0,
      oy = 0;
    stage.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".map-pin")) return;
      state.dragging = true;
      state.dragStart = { x: e.clientX, y: e.clientY, ox, oy };
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      if (!state.dragging || !state.dragStart) return;
      const dx = (e.clientX - state.dragStart.x) * 0.02;
      const dy = (e.clientY - state.dragStart.y) * 0.02;
      // decorative parallax on fog
      els.mapFog.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    stage.addEventListener("pointerup", () => {
      state.dragging = false;
    });
    stage.addEventListener("pointercancel", () => {
      state.dragging = false;
    });
  }

  /* ---------- Boot ---------- */
  function cacheEls() {
    els.portal = $("portal");
    els.inkCanvas = $("ink-canvas");
    els.enterBtn = $("enter-btn");
    els.sanctum = $("sanctum");
    els.constellation = $("constellation");
    els.dust = $("dust");
    els.searchInput = $("search-input");
    els.searchParchment = document.querySelector(".search-parchment");
    els.searchResults = $("search-results");
    els.searchStatus = $("search-status");
    els.collectionsList = $("collections-list");
    els.worldsRail = $("worlds-rail");
    els.mapStage = $("map-stage");
    els.mapCanvas = $("map-canvas");
    els.mapPins = $("map-pins");
    els.mapThreads = $("map-threads");
    els.mapFog = $("map-fog");
    els.mapRipple = $("map-ripple");
    els.relicRing = $("relic-ring");
    els.activeWorldName = $("active-world-name");
    els.pinCount = $("pin-count");
    els.layerStatus = $("layer-status");
    els.atlasInner = $("atlas-inner");
    els.atlasBook = $("atlas-book");
    els.btnBookmark = $("btn-bookmark");
    els.btnDownload = $("btn-download");
    els.btnShare = $("btn-share");
    els.btnDaynight = $("btn-daynight");
    els.btn날씨 = $("btn-weather");
    els.btn모션 = $("btn-motion");
    els.tablet = $("tablet");
    els.tabletClose = $("tablet-close");
    els.tabletWorld = $("tablet-world");
    els.tabletTitle = $("tablet-title");
    els.tabletMeta = $("tablet-meta");
    els.tabletDesc = $("tablet-desc");
    els.tabletGrid = $("tablet-grid");
    els.tabletBookmark = $("tablet-bookmark");
    els.tabletRoute = $("tablet-route");
    els.scrollSeal = $("scroll-seal");
    els.scrollMsg = $("scroll-msg");
    els.toast = $("toast");
  }

  function bind() {
    els.enterBtn.addEventListener("click", enterSanctum);
    els.searchInput.addEventListener("input", () => {
      state.searchIndex = 0;
      onSearchInput();
    });
    els.searchInput.addEventListener("focus", () => {
      if (state.searchQuery) renderSearchResults();
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-parchment")) {
        els.searchResults.hidden = true;
      }
    });

    document.querySelector전체(".atlas-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelector전체(".atlas-tab").forEach((t) => {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("is-active");
        tab.setAttribute("aria-selected", "true");
        state.atlasTab = tab.dataset.tab;
        renderAtlas();
      });
    });

    els.btnDaynight.addEventListener("click", () => {
      state.is밤 = !state.is밤;
      applyAtmosphere();
      toast(state.is밤 ? "달빛이 지도책을 씻어냅니다" : "촛불이 돌아옴");
    });
    els.btn날씨.addEventListener("click", () => {
      const order = ["mist", "clear", "storm"];
      state.weather = order[(order.indexOf(state.weather) + 1) % order.length];
      applyAtmosphere();
      toast(
        state.weather === "clear"
          ? "탁자 위로 하늘이 개입니다"
          : state.weather === "storm"
            ? "먹물 위로 폭풍 전선이 지나갑니다"
            : "부드러운 안개가 돌아옵니다"
      );
    });
    els.btn모션.addEventListener("click", () => {
      state.reduce모션 = !state.reduce모션;
      applyAtmosphere();
      if (state.reduce모션) {
        els.dust.innerHTML = "";
      } else {
        buildDust();
        buildStars();
      }
      toast(state.reduce모션 ? "모션 stilled" : "방이 다시 숨 쉬기 시작합니다");
    });

    els.btnBookmark.addEventListener("click", () => toggleBookmark());
    els.btnDownload.addEventListener("click", sealScroll);
    els.btnShare.addEventListener("click", share발견y);
    els.tabletClose.addEventListener("click", closeTablet);
    els.tablet.addEventListener("click", (e) => {
      // backdrop is ::before on tablet; clicks on empty chrome close
      if (e.target === els.tablet) closeTablet();
    });
    els.tabletBookmark.addEventListener("click", () => toggleBookmark());
    els.tabletRoute.addEventListener("click", traceRoute);

    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", () => {
      if (!state.entered) return;
      drawMap();
    });

    initMapPointer();
  }

  function boot() {
    cacheEls();
    if (state.reduce모션) document.body.classList.add("reduce-motion");
    initPortalInk();
    buildStars();
    buildDust();
    render컬렉션s();
    renderWorlds();
    render유물();
    // map sized after layout
    requestAnimationFrame(() => {
      drawMap();
      renderPins();
      renderThreads();
      updateLegend();
      renderAtlas();
      updateActions();
      applyAtmosphere();
    });
    bind();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
