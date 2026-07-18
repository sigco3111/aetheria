// ============================================================
// THE HALL OF LEGENDS — Application Logic
// ============================================================

(function () {
  "use strict";

  // ---------- Reduced motion ----------
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) document.body.classList.add('reduced-motion');

  // ---------- Icon glyphs (relic representations) ----------
  // Each returns an inline SVG string, colored via currentColor so rarity color cascades in.
  const ICONS = {
    sword: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 4 L36 40 L32 46 L28 40 Z" fill="currentColor" opacity="0.9"/>
      <rect x="30" y="40" width="4" height="14" fill="#8b5a2b"/>
      <path d="M20 46 H44" stroke="#8b5a2b" stroke-width="4" stroke-linecap="round"/>
      <circle cx="32" cy="58" r="4" fill="currentColor"/>
    </svg>`,
    shield: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 4 L54 12 V30 C54 46 44 56 32 60 C20 56 10 46 10 30 V12 Z" fill="currentColor" opacity="0.85" stroke="#8b5a2b" stroke-width="2"/>
      <path d="M32 14 V50 M20 24 H44" stroke="#1a1108" stroke-width="2" opacity="0.5"/>
    </svg>`,
    compass: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2.5"/>
      <path d="M32 14 L38 32 L32 50 L26 32 Z" fill="currentColor" opacity="0.85"/>
      <circle cx="32" cy="32" r="3" fill="#8b5a2b"/>
    </svg>`,
    tome: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12 C20 8 28 8 32 12 C36 8 44 8 52 12 V50 C44 46 36 46 32 50 C28 46 20 46 12 50 Z" fill="currentColor" opacity="0.85" stroke="#5c4630" stroke-width="1.5"/>
      <path d="M32 12 V50" stroke="#5c4630" stroke-width="1.5"/>
    </svg>`,
    crystal: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6 L48 24 L38 58 L26 58 L16 24 Z" fill="currentColor" opacity="0.8" stroke="#fff" stroke-opacity="0.3" stroke-width="1"/>
      <path d="M32 6 L32 58 M16 24 L48 24" stroke="#fff" stroke-opacity="0.3" stroke-width="1"/>
    </svg>`,
    crest: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 6 L52 16 V34 C52 48 42 56 32 60 C22 56 12 48 12 34 V16 Z" fill="currentColor" opacity="0.85"/>
      <circle cx="32" cy="30" r="8" fill="#1a1108" opacity="0.4"/>
      <path d="M32 22 L36 30 L32 38 L28 30 Z" fill="#f4d999"/>
    </svg>`,
    banner: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="6" width="4" height="52" fill="#5c4630"/>
      <path d="M18 8 H48 L42 22 L48 36 H18 Z" fill="currentColor" opacity="0.85"/>
    </svg>`,
    tablet: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="8" width="44" height="48" rx="2" fill="currentColor" opacity="0.8" stroke="#5c4630" stroke-width="1.5"/>
      <path d="M18 20 H46 M18 30 H46 M18 40 H36" stroke="#1a1108" stroke-width="2" opacity="0.4"/>
    </svg>`,
    constellation: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="46" r="2.5" fill="currentColor"/>
      <circle cx="30" cy="14" r="3" fill="currentColor"/>
      <circle cx="50" cy="24" r="2.5" fill="currentColor"/>
      <circle cx="42" cy="50" r="2.5" fill="currentColor"/>
      <path d="M14 46 L30 14 L50 24 L42 50 L14 46" stroke="currentColor" stroke-width="1" opacity="0.5"/>
    </svg>`,
    chalice: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8 H46 C46 22 38 28 32 28 C26 28 18 22 18 8 Z" fill="currentColor" opacity="0.85"/>
      <rect x="30" y="28" width="4" height="18" fill="#8b5a2b"/>
      <path d="M20 54 H44" stroke="#8b5a2b" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  };

  function iconSVG(key) { return ICONS[key] || ICONS.crystal; }

  // ---------- Build category alcoves ----------
  const alcoveContainer = document.getElementById('alcove-container');
  const visibleCountEl = document.getElementById('visible-count');
  const searchInput = document.getElementById('relic-search');
  const rarityFilter = document.getElementById('rarity-filter');
  const sortOrder = document.getElementById('sort-order');

  function sortAchievements(list, mode) {
    const arr = [...list];
    switch (mode) {
      case 'recent':
        return arr.sort((a, b) => (b.unlockDate || '').localeCompare(a.unlockDate || ''));
      case 'difficulty': {
        const order = { 'Near Impossible': 5, 'Punishing': 4, 'Arduous': 3, 'Challenging': 2, 'Modest': 1 };
        return arr.sort((a, b) => order[b.difficulty] - order[a.difficulty]);
      }
      case 'rarest':
        return arr.sort((a, b) => a.globalCompletionPct - b.globalCompletionPct);
      case 'completion':
        return arr.sort((a, b) => b.completion - a.completion);
      default:
        return arr;
    }
  }

  function matchesFilters(a) {
    const q = searchInput.value.trim().toLowerCase();
    const rarity = rarityFilter.value;
    if (rarity && a.rarity !== rarity) return false;
    if (q && !(a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))) return false;
    return true;
  }

  function renderAlcoves() {
    alcoveContainer.innerHTML = '';
    let totalVisible = 0;

    CATEGORIES.forEach(cat => {
      const filtered = sortAchievements(cat.achievements.filter(matchesFilters), sortOrder.value);
      totalVisible += filtered.length;
      if (filtered.length === 0) return;

      const section = document.createElement('div');
      section.className = 'alcove';
      section.dataset.cat = cat.id;
      section.style.setProperty('--cat-color', cat.color);

      section.innerHTML = `
        <div class="alcove-frame">
          <div class="alcove-header">
            <div class="alcove-title-wrap">
              <div class="alcove-glyph" aria-hidden="true">${cat.glyph}</div>
              <div>
                <div class="alcove-title">${cat.name}</div>
                <div class="alcove-desc">${cat.description}</div>
              </div>
            </div>
            <div class="alcove-meta">${filtered.length} of ${cat.achievements.length} relics shown</div>
          </div>
          <div class="relic-row" role="list" aria-label="${cat.name} achievements"></div>
        </div>
      `;

      const row = section.querySelector('.relic-row');
      filtered.forEach(a => row.appendChild(buildRelicCard(a, cat)));
      alcoveContainer.appendChild(section);
    });

    visibleCountEl.textContent = `${totalVisible} relic${totalVisible === 1 ? '' : 's'} catalogued`;

    if (totalVisible === 0) {
      const empty = document.createElement('div');
      empty.style.textAlign = 'center';
      empty.style.padding = '60px 20px';
      empty.style.fontFamily = 'var(--font-lore)';
      empty.style.fontStyle = 'italic';
      empty.style.color = 'var(--parchment)';
      empty.style.opacity = '0.7';
      empty.textContent = 'No relics answer to that search. Try another name, or clear the rune filters.';
      alcoveContainer.appendChild(empty);
    }
  }

  function buildRelicCard(a, cat) {
    const rarity = RARITY[a.rarity];
    const card = document.createElement('div');
    card.className = 'relic-card' + (a.unlocked ? '' : ' locked');
    card.style.setProperty('--rarity-color', rarity.color);
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${a.name}, ${rarity.label} rarity, ${a.completion}% complete`);

    card.innerHTML = `
      <div class="relic-rarity-tag">${rarity.label}</div>
      <div class="relic-icon-wrap">
        <div class="relic-glow-ring" style="color:${rarity.color}"></div>
        <div style="color:${rarity.color}; position:relative; z-index:1;">${iconSVG(a.icon)}</div>
      </div>
      <div class="relic-name">${a.name}</div>
      <div class="relic-desc">${a.description}</div>
      <div class="relic-progress-track"><div class="relic-progress-fill" style="width:${a.completion}%"></div></div>
      <div class="relic-footer">
        <span>${a.completion}% complete</span>
        <span class="relic-points">${a.points} pts</span>
      </div>
    `;

    const open = () => openRelicModal(a, cat);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });

    return card;
  }

  [searchInput, rarityFilter, sortOrder].forEach(el => {
    el.addEventListener('input', renderAlcoves);
    el.addEventListener('change', renderAlcoves);
  });

  // ---------- Modal ----------
  const modalOverlay = document.getElementById('relic-modal-overlay');
  const modalClose = document.getElementById('relic-modal-close');
  let lastFocusedEl = null;

  function openRelicModal(a, cat) {
    lastFocusedEl = document.activeElement;
    const rarity = RARITY[a.rarity];
    document.getElementById('relic-modal').style.setProperty('--rarity-color', rarity.color);
    document.getElementById('relic-modal-icon').innerHTML = `<div style="color:${rarity.color}">${iconSVG(a.icon)}</div>`;
    document.getElementById('relic-modal-rarity').textContent = rarity.label + ' Relic';
    document.getElementById('relic-modal-rarity').style.color = rarity.color;
    document.getElementById('relic-modal-name').textContent = a.name;
    document.getElementById('relic-modal-category').textContent = (cat ? cat.name : a.categoryName) + ' · ' + a.difficulty;
    document.getElementById('relic-modal-lore').textContent = '"' + a.lore + '"';
    document.getElementById('relic-modal-desc').textContent = a.description;

    document.getElementById('relic-modal-stats').innerHTML = `
      <div class="relic-stat"><div class="relic-stat-label">Points</div><div class="relic-stat-value">${a.points}</div></div>
      <div class="relic-stat"><div class="relic-stat-label">Global Completion</div><div class="relic-stat-value">${a.globalCompletionPct < 1 ? a.globalCompletionPct.toFixed(2) : a.globalCompletionPct.toFixed(1)}%</div></div>
      <div class="relic-stat"><div class="relic-stat-label">Difficulty</div><div class="relic-stat-value">${a.difficulty}</div></div>
      <div class="relic-stat"><div class="relic-stat-label">Unlocked</div><div class="relic-stat-value">${a.unlockDate ? formatDate(a.unlockDate) : '— not yet —'}</div></div>
    `;

    document.getElementById('relic-modal-progress-pct').textContent = a.completion + '%';
    const fill = document.getElementById('relic-modal-progress-fill');
    fill.style.width = '0%';
    modalOverlay.classList.add('open');
    requestAnimationFrame(() => { fill.style.width = a.completion + '%'; });

    modalClose.focus();
    document.addEventListener('keydown', escCloseHandler);
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.removeEventListener('keydown', escCloseHandler);
    if (lastFocusedEl) lastFocusedEl.focus();
  }
  function escCloseHandler(e) { if (e.key === 'Escape') closeModal(); }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  // ---------- Tree node clicks -> filter to category ----------
  document.querySelectorAll('.tree-node-group').forEach(g => {
    const go = () => {
      const catId = g.dataset.category;
      rarityFilter.value = '';
      searchInput.value = '';
      renderAlcoves();
      requestAnimationFrame(() => {
        const el = alcoveContainer.querySelector(`.alcove[data-cat="${catId}"]`);
        if (el) el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
        else document.getElementById('categories').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    };
    g.addEventListener('click', go);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });

  // ---------- Hero Wall ----------
  const tabletGrid = document.getElementById('tablet-grid');
  const wallLegend = document.getElementById('wall-legend');

  WALL_TABLETS.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'tablet' + (t.unlocked ? '' : ' locked');
    div.style.setProperty('--t-color', RARITY[t.rarity].color);
    div.title = `${t.name} — ${t.categoryName} (${RARITY[t.rarity].label})`;
    div.dataset.index = i;
    tabletGrid.appendChild(div);
  });

  Object.entries(RARITY).forEach(([key, r]) => {
    const span = document.createElement('span');
    span.innerHTML = `<i style="background:${r.color}"></i>${r.label}`;
    wallLegend.appendChild(span);
  });

  // Progressive illumination on scroll (IntersectionObserver, staggered)
  const tabletEls = Array.from(tabletGrid.children);
  const wallObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const idx = parseInt(el.dataset.index, 10);
        const delay = prefersReduced ? 0 : (idx % 24) * 18;
        setTimeout(() => el.classList.add('lit'), delay);
        wallObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  tabletEls.forEach(el => wallObserver.observe(el));

  // ---------- Statistics ----------
  const statsFloor = document.getElementById('stats-floor');
  const statSlabs = [
    { icon: '✦', value: STATS.unlockedByYou, label: 'Achievements Unlocked' },
    { icon: '⚔', value: STATS.totalPointsEarned.toLocaleString(), label: 'Legacy Points Earned' },
    { icon: '☾', value: '#' + STATS.legendsRank.toLocaleString(), label: 'Rank Among Legends' },
    { icon: '⟡', value: STATS.currentStreakDays + ' days', label: 'Current Unlock Streak' },
    { icon: '◈', value: STATS.worldCompletionPct + '%', label: 'World Completion' },
    { icon: '❖', value: STATS.totalAdventurers.toLocaleString(), label: 'Adventurers Enshrined' },
  ];
  statSlabs.forEach(s => {
    const div = document.createElement('div');
    div.className = 'stat-slab';
    div.innerHTML = `
      <div class="stat-slab-icon">${s.icon}</div>
      <div class="stat-slab-value" data-count="${typeof s.value === 'number' ? s.value : ''}">${s.value}</div>
      <div class="stat-slab-label">${s.label}</div>
    `;
    statsFloor.appendChild(div);
  });

  // ---------- Progress rail active state ----------
  const railButtons = document.querySelectorAll('#progress-rail button');
  const sections = Array.from(railButtons).map(b => document.querySelector(b.dataset.target));
  railButtons.forEach(b => {
    b.addEventListener('click', () => {
      document.querySelector(b.dataset.target).scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
  const railObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = sections.indexOf(entry.target);
      if (idx === -1) return;
      if (entry.isIntersecting) {
        railButtons.forEach(b => b.classList.remove('active'));
        railButtons[idx].classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => s && railObserver.observe(s));

  // ---------- Gate scroll ----------
  document.querySelector('.gate-descend').addEventListener('click', () => {
    document.getElementById('monument').scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
  });
  document.querySelector('.gate-descend').style.cursor = 'pointer';

  // ---------- Motes (gate ambient particles, DOM based, cheap) ----------
  const gateMotes = document.getElementById('gate-motes');
  if (!prefersReduced) {
    for (let i = 0; i < 26; i++) {
      const m = document.createElement('div');
      const size = 1 + Math.random() * 2.5;
      m.style.cssText = `
        position:absolute; left:${Math.random() * 100}%; top:${Math.random() * 100}%;
        width:${size}px; height:${size}px; border-radius:50%;
        background: radial-gradient(circle, rgba(244,217,153,0.9), transparent 70%);
        opacity:${0.2 + Math.random() * 0.5};
        animation: mote-float ${8 + Math.random() * 10}s ease-in-out ${Math.random() * 6}s infinite;
      `;
      gateMotes.appendChild(m);
    }
    const style = document.createElement('style');
    style.textContent = `@keyframes mote-float{0%,100%{transform:translateY(0) translateX(0);}50%{transform:translateY(-40px) translateX(12px);}}`;
    document.head.appendChild(style);
  }

  // ---------- Dust canvas (full-page ambient, lightweight) ----------
  const dustCanvas = document.getElementById('dust-canvas');
  const ctx = dustCanvas.getContext('2d');
  let dustParticles = [];
  let w, h;

  function resizeDust() {
    w = dustCanvas.width = window.innerWidth;
    h = dustCanvas.height = window.innerHeight;
  }
  function initDust() {
    resizeDust();
    const count = Math.min(50, Math.floor((w * h) / 30000));
    dustParticles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.4,
      vy: 0.05 + Math.random() * 0.12,
      vx: (Math.random() - 0.5) * 0.08,
      alpha: 0.08 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  let dustRAF;
  function drawDust(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f4d999';
    dustParticles.forEach(p => {
      p.y -= p.vy;
      p.x += p.vx + Math.sin(t / 3000 + p.phase) * 0.05;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t / 2000 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    dustRAF = requestAnimationFrame(drawDust);
  }

  if (!prefersReduced) {
    initDust();
    dustRAF = requestAnimationFrame(drawDust);
    window.addEventListener('resize', () => { resizeDust(); });
  } else {
    dustCanvas.style.display = 'none';
  }

  // ---------- Initial render ----------
  renderAlcoves();

})();
