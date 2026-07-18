const { useState, useEffect, useRef, useMemo } = React;

// --- DATA ---

const RELIC_FILTERS = [
  { id: 'all', label: 'Everything', icon: '🪬' },
  { id: 'maps', label: 'Maps', icon: '🧭' },
  { id: 'creatures', label: 'Creatures', icon: '🐉' },
  { id: 'weapons', label: 'Weapons', icon: '⚔️' },
  { id: 'props', label: 'Relics', icon: '🛡️' },
  { id: 'potions', label: 'Alchemy', icon: '🧪' },
  { id: 'runes', label: 'Shaders', icon: '🔮' },
  { id: 'scrolls', label: 'Lore', icon: '📜' },
];

const DISCOVERIES = [
  { id: 1, title: 'The Silent Citadel', author: 'Eldarion', cat: 'maps', price: 45, dls: '12k', rating: '4.9', tags: ['dungeon','gothic','boss-arena'], imgColor: '#2b2c30', artType: 'map', desc: 'A vast gothic cathedral ruined by time and dark magic. Contains 4 sprawling floors, a hidden catacomb, and a massive boss arena at the summit. Optimized for low draw calls.' },
  { id: 2, title: 'Wyrmbone Greatsword', author: 'Kael', cat: 'weapons', price: 0, dls: '38k', rating: '4.8', tags: ['2-handed','fire-dmg','high-poly'], imgColor: '#4a2f26', artType: 'weapon', desc: 'Forged from the spine of a firedrake. The blade constantly emits a subtle heat distortion. Fully rigged and animated.' },
  { id: 3, title: 'Troll King Skarn', author: 'Grukza', cat: 'creatures', price: 120, dls: '5k', rating: '4.9', tags: ['boss','rigged','pbr'], imgColor: '#3c4a2a', artType: 'creature', desc: 'A towering troll warlord wearing scavenged armor. Includes 24 custom attack animations, idle loops, and 3 phases of combat logic.' },
  { id: 4, title: 'Void Rift Shader', author: 'Archmage Sol', cat: 'runes', price: 20, dls: '21k', rating: '5.0', tags: ['vfx','portal','compute'], imgColor: '#1c162e', artType: 'rune', desc: 'A highly customizable portal shader that bends local light and space. Drag and drop onto any quad.' },
  { id: 5, title: 'Alchemist\'s Set', author: 'Nyx', cat: 'props', price: 15, dls: '18k', rating: '4.7', tags: ['clutter','bottles','tables'], imgColor: '#3d291e', artType: 'prop', desc: '140+ individual props to clutter up wizard towers and apothecaries. Mortars, pestles, scales, and glowing liquids.' },
  { id: 6, title: 'The Drowned Coast', author: 'Eldarion', cat: 'maps', price: 65, dls: '8k', rating: '4.8', tags: ['region','ocean','ruins'], imgColor: '#263b4a', artType: 'map', desc: 'A 4km x 4km coastal region featuring jagged cliffs, shipwrecks, and a haunted fishing village.' },
  { id: 7, title: 'Sunfire Flask', author: 'Nyx', cat: 'potions', price: 0, dls: '55k', rating: '4.9', tags: ['consumable','animated','glow'], imgColor: '#4a3b1a', artType: 'potion', desc: 'A high-poly glass flask filled with churning magical fire. The liquid sloshes dynamically based on character movement.' },
  { id: 8, title: 'Age of Kings Lorebook', author: 'Scribe Vane', cat: 'scrolls', price: 5, dls: '40k', rating: '4.6', tags: ['ui','text','history'], imgColor: '#473d2b', artType: 'scroll', desc: 'A 20-page interactive UI book containing the complete history of the First Era. Easily integrated into your quest system.' },
  { id: 9, title: 'Ironwood Crossbow', author: 'Kael', cat: 'weapons', price: 25, dls: '11k', rating: '4.7', tags: ['ranged','mechanisms'], imgColor: '#2f2c25', artType: 'weapon', desc: 'A heavy mechanical crossbow with animated gears, string tension, and reload states.' },
  { id: 10, title: 'Spectral Wraith', author: 'Archmage Sol', cat: 'creatures', price: 35, dls: '14k', rating: '4.8', tags: ['undead','floating','translucent'], imgColor: '#243236', artType: 'creature', desc: 'An ethereal enemy that floats above the ground. Features an incredible flowing cloth simulation.' },
];

const KINGDOMS = [
  { id: 1, name: 'Aethelgard', desc: 'High fantasy, castles, knights', col: '#45566b' },
  { id: 2, name: 'Drogor Wastes', desc: 'Deserts, ruins, scorpions', col: '#6b5437' },
  { id: 3, name: 'The Pale', desc: 'Frozen tundras, vikings', col: '#3a4650' },
  { id: 4, name: 'Sylphwood', desc: 'Elven forests, ancient magic', col: '#335035' },
];

const CREATORS = [
  { id: 1, name: 'Eldarion', rank: 'Grand Architect', icon: '🏰' },
  { id: 2, name: 'Nyx', rank: 'Master Alchemist', icon: '🦇' },
  { id: 3, name: 'Kael', rank: 'Forgemaster', icon: '🔨' },
  { id: 4, name: 'Archmage Sol', rank: 'Weaver of Light', icon: '👁️' },
];

// --- CANVAS ARTWORK RENDERERS ---

// A helper to draw diegetic thumbnails on canvas so we don't need external images.
function drawArt(canvas, type, color, seed) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  
  // Vignette
  const grd = ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w);
  grd.addColorStop(0, 'transparent');
  grd.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  
  ctx.save();
  ctx.translate(w/2, h/2);
  
  if (type === 'map') {
    ctx.strokeStyle = '#8a5f1e';
    ctx.beginPath();
    for(let i=0; i<5; i++){
      ctx.moveTo(-w/3 + Math.sin(seed+i)*20, -h/3 + i*30);
      ctx.lineTo(w/3 + Math.cos(seed+i)*20, -h/3 + i*20 + Math.sin(seed)*10);
    }
    ctx.stroke();
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.arc(Math.sin(seed)*20, Math.cos(seed)*20, 6, 0, Math.PI*2);
    ctx.fill();
  } else if (type === 'weapon') {
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#8a8a9e';
    ctx.fillRect(-4, -h/3, 8, h/1.5);
    ctx.fillStyle = '#d9a441';
    ctx.fillRect(-15, h/3 - 10, 30, 8);
    ctx.fillStyle = '#4a2f26';
    ctx.fillRect(-3, h/3 - 2, 6, 20);
  } else if (type === 'creature') {
    ctx.fillStyle = '#1f8f7e';
    ctx.beginPath();
    ctx.arc(0, -10, 25, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(-8, -15, 4, 0, Math.PI*2);
    ctx.arc(8, -15, 4, 0, Math.PI*2);
    ctx.fill();
  } else if (type === 'rune' || type === 'potion') {
    ctx.fillStyle = '#57e0c8';
    ctx.shadowColor = '#57e0c8';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 25);
    ctx.lineTo(-20, 0);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // scroll / prop
    ctx.fillStyle = '#d7bf8f';
    ctx.fillRect(-20, -30, 40, 60);
    ctx.fillStyle = '#8a5f1e';
    ctx.fillRect(-20, -35, 40, 5);
    ctx.fillRect(-20, 30, 40, 5);
  }
  
  ctx.restore();
}

function CanvasArt({ type, color, id }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.width = ref.current.offsetWidth * 2;
      ref.current.height = ref.current.offsetHeight * 2;
      drawArt(ref.current, type, color, id);
    }
  }, [type, color, id]);
  return <canvas ref={ref} />;
}

// --- COMPONENTS ---

window.GuildExchange = function GuildExchange() {
  const [entered, setEntered] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewing, setViewing] = useState(null);
  const [toast, setToast] = useState('');
  const [bookmarks, setBookmarks] = useState(new Set());

  // Filter logic
  const filtered = useMemo(() => {
    let res = DISCOVERIES;
    if (activeFilter !== 'all') res = res.filter(d => d.cat === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(d => d.title.toLowerCase().includes(q) || d.author.toLowerCase().includes(q) || d.tags.some(t => t.includes(q)));
    }
    if (sortBy === 'price_asc') res = [...res].sort((a,b) => a.price - b.price);
    if (sortBy === 'price_desc') res = [...res].sort((a,b) => b.price - a.price);
    // popular is default, data is roughly pre-sorted
    return res;
  }, [activeFilter, search, sortBy]);

  const handleToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    const next = new Set(bookmarks);
    if (next.has(id)) { next.delete(id); handleToast('Removed from compendium.'); }
    else { next.add(id); handleToast('Saved to compendium.'); }
    setBookmarks(next);
  };

  // Entrance
  if (!entered) {
    return (
      <div id="passage">
        <div className="door l"></div>
        <div className="door r"></div>
        <div className="passage-core">
          <div className="sigil">🗝️</div>
          <h1>The Grand Guild Exchange</h1>
          <p>Where the world's knowledge is stored</p>
          <div className="enter-btn">
            <button className="btn btn-rune" onClick={() => {
              document.getElementById('passage')?.classList.add('open');
              setTimeout(() => {
                document.getElementById('passage')?.classList.add('gone');
                setEntered(true);
              }, 1200);
            }}>Enter the Archives</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      <a href="#main" className="skip sr-only">Skip to main content</a>
      
      {/* Background Ambience */}
      <div id="hall">
        <div className="hall-rays"></div>
        <div className="hall-vignette"></div>
        <div className="hall-pillar" style={{left:'10%'}}></div>
        <div className="hall-pillar" style={{right:'10%'}}></div>
        <div className="hall-pillar" style={{left:'30%', opacity: 0.2, width: '4vw'}}></div>
        <div className="hall-pillar" style={{right:'30%', opacity: 0.2, width: '4vw'}}></div>
      </div>
      <div id="motes">
        {Array.from({length: 30}).map((_, i) => (
          <div key={i} className="mote" style={{
            left: `${Math.random()*100}%`,
            width: `${Math.random()*4 + 2}px`,
            height: `${Math.random()*4 + 2}px`,
            animationDelay: `-${Math.random()*20}s`,
            animationDuration: `${15 + Math.random()*20}s`
          }}></div>
        ))}
      </div>

      <header className="topbar">
        <div className="shell topbar-in">
          <div className="crest">🦅</div>
          <div className="brand">
            <div className="k">Guild Exchange</div>
            <div className="s">Imperial Archives</div>
          </div>
          <div className="topbar-spacer"></div>
          <div className="topbar-actions">
            <button className="btn btn-brass small" onClick={() => handleToast('Vault locked.')}>
              <span className="ic">🪙</span> Vault
            </button>
            <button className="btn btn-wood small" onClick={() => handleToast('Profile opened.')}>
              <span className="ic">🧙‍♂️</span> Profile
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="shell">
        
        {/* HERO MAP TABLE */}
        <section className="hero">
          <h1>The Archives</h1>
          <p className="lede">Discover maps, relics, and lost knowledge left by adventurers from every corner of the realm.</p>
          
          <div className="maptable">
            <div className="rim"></div>
            <div className="holo-scan"></div>
            <div className="holo"></div>
            {/* abstract landmasses */}
            <div className="landmass" style={{width:'40%', height:'50%', left:'10%', top:'20%'}}></div>
            <div className="landmass" style={{width:'30%', height:'40%', right:'15%', top:'30%'}}></div>
            <div className="river" style={{width:'20%', left:'25%', top:'45%', transform:'rotate(20deg)'}}></div>
            
            {/* pins */}
            {KINGDOMS.map((k, i) => (
              <div key={k.id} className="pin" style={{left: `${20 + i*20}%`, top: `${30 + (i%2)*20}%`}}>
                <div className="head"></div>
                <div className="stem"></div>
                <div className="flag">{k.name}</div>
              </div>
            ))}

            <div className="kingdom-readout">
              <div className="kn">Aethelgard Region</div>
              <div className="kd">142 active scholars exploring</div>
            </div>
            <div className="map-stats">
              <span className="chip">14,204 Discoveries</span>
              <span className="chip">28 Guilds</span>
            </div>
          </div>
        </section>

        {/* SEARCH TOME */}
        <section className="section">
          <div className="tome-wrap">
            <div className="tome">
              <div className="tome-book">
                <div className="tome-page left">
                  <h3>Compendium of Knowledge</h3>
                  <div className="rune-row">
                    <span>ᛚ</span><span>ᛟ</span><span>ᚱ</span><span>ᛖ</span>
                  </div>
                  <p className="tome-hint">Speak your desire or write it upon the parchment, and the archives shall reveal what is hidden.</p>
                </div>
                <div className="tome-page right">
                  <div className="tome-results-note">{filtered.length} Tomes Found</div>
                  <input 
                    type="text" 
                    className="ink-input" 
                    placeholder="Seek forgotten kingdoms..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Search the archives"
                  />
                  <div className="mt">
                    <span className="tome-hint">Scribe's ink forms:</span><br/>
                    {search ? <strong>"{search}"<span className="ink-caret"></span></strong> : <span className="ink-caret"></span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RELIC FILTERS */}
        <section className="section">
          <div className="relics">
            {RELIC_FILTERS.map(f => (
              <button 
                key={f.id} 
                className={`relic ${activeFilter === f.id ? 'on' : ''}`}
                onClick={() => setActiveFilter(f.id)}
                aria-pressed={activeFilter === f.id}
              >
                <div className="glyph">{f.icon}</div>
                <span className="lbl">{f.label}</span>
              </button>
            ))}
          </div>

          <div className="subfilters">
            <button className="tag-toggle">PBR Ready</button>
            <button className="tag-toggle on">Animated</button>
            <button className="tag-toggle">Low Poly</button>
            <button className="tag-toggle">Free</button>
          </div>

          <div className="filter-bar">
            <div className="result-count">{filtered.length} Discoveries</div>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort by">
              <option value="popular">Most Renowned</option>
              <option value="new">Recently Discovered</option>
              <option value="price_asc">Tithe (Low to High)</option>
              <option value="price_desc">Tithe (High to Low)</option>
            </select>
          </div>

          {/* DISCOVERY GRID */}
          <div className="grid">
            {filtered.map(d => (
              <article key={d.id} className="disc" tabIndex={0} onClick={() => setViewing(d)} onKeyDown={e => e.key === 'Enter' && setViewing(d)}>
                <div className="tape"></div>
                <div className="art">
                  <CanvasArt type={d.artType} color={d.imgColor} id={d.id} />
                  <div className="frame"></div>
                  <div className="cat">{RELIC_FILTERS.find(f => f.id === d.cat)?.label}</div>
                  <div className={`price ${d.price === 0 ? 'free' : ''}`}>{d.price === 0 ? 'Free' : `${d.price} G`}</div>
                </div>
                <div className="body">
                  <h3 className="title">{d.title}</h3>
                  <div className="by">Discovered by {d.author}</div>
                  <div className="meta">
                    <span><b className="stars">★★★★★</b> {d.rating}</span>
                    <span><b>{d.dls}</b> acquired</span>
                  </div>
                  <div className="tags">
                    {d.tags.map(t => <span key={t}>{t}</span>)}
                  </div>
                  <div className="cardfoot">
                    <button className="btn btn-wood small" onClick={(e) => { e.stopPropagation(); handleToast(`Acquired ${d.title}`); }}>Acquire</button>
                    <div className="wax">
                      <button className={`book ${bookmarks.has(d.id) ? 'on' : ''}`} onClick={(e) => toggleBookmark(e, d.id)} aria-label="Bookmark" title="Add to Compendium">🔖</button>
                      <button aria-label="Applaud" title="Grant Renown" onClick={(e) => { e.stopPropagation(); handleToast('Renown granted!'); }}>🔥</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div style={{gridColumn:'1/-1', textAlign:'center', padding:'40px 0', color:'var(--parch-2)'}}>
                No relics match your inscription.
              </div>
            )}
          </div>
          
          {filtered.length > 0 && (
            <div className="loadmore">
              <button className="btn btn-iron" onClick={() => handleToast('Searching deeper archives...')}>Delve Deeper</button>
            </div>
          )}
        </section>

        <div className="divider"></div>

        {/* COMMUNITY SECTIONS */}
        <section className="section">
          <div className="sec-head">
            <div className="eyebrow">Guild Honors</div>
            <h2>Curator's Picks</h2>
            <p>Artifacts deemed exceptional by the Grandmasters of the Exchange.</p>
          </div>
          <div className="rail">
            {[1,2,3,4].map(i => (
              <div key={i} className="rail-card">
                <div className="pick-plaque">
                  <div className="rank">#{i}</div>
                  <div className="pt">The Royal Armory Vol {i}</div>
                  <div className="pd">A complete set of high-fantasy weaponry forged for kings.</div>
                  <div className="pm">
                    <span>By Kael</span>
                    <span>14k acquired</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="sec-head">
            <div className="eyebrow">Master Artisans</div>
            <h2>Renowned Creators</h2>
          </div>
          <div className="creator-grid">
            {CREATORS.map(c => (
              <div key={c.id} className="creator-card">
                <div className="avatar">{c.icon}</div>
                <div className="cn">{c.name}</div>
                <div className="cr">{c.rank}</div>
                <div className="cstats">
                  <div><b>24</b> Uploads</div>
                  <div><b>142k</b> Followers</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="sec-head">
            <div className="eyebrow">Expeditions</div>
            <h2>Regions of Origin</h2>
          </div>
          <div className="kingdom-grid">
            {KINGDOMS.map(k => (
              <div key={k.id} className="kingdom-tile">
                <CanvasArt type="map" color={k.col} id={k.id} />
                <div className="kv">
                  <div className="kn">{k.name}</div>
                  <div className="kc">{k.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="foot shell">
        <div className="seal">⚜️</div>
        <p className="fq">"Knowledge hidden is knowledge lost. Leave your map, take a blade."</p>
        <div className="fl">
          <a href="#">Guild Rules</a>
          <a href="#">The Scribes</a>
          <a href="#">Report Heresy</a>
          <a href="#">Tithe Records</a>
        </div>
      </footer>

      {/* DETAIL OVERLAY */}
      {viewing && (
        <div className="veil" onClick={() => setViewing(null)}>
          <div className="detail" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <button className="btn btn-wax detail-close" onClick={() => setViewing(null)} aria-label="Close scroll">✕</button>
            <div className="detail-grid">
              <div className="detail-gallery">
                <div className="detail-hero">
                  <CanvasArt type={viewing.artType} color={viewing.imgColor} id={viewing.id} />
                  <div className="float-label">Preview Projection</div>
                </div>
                <div className="thumbs">
                  <div className="th on"><CanvasArt type={viewing.artType} color={viewing.imgColor} id={viewing.id} /></div>
                  <div className="th"><CanvasArt type={viewing.artType} color="#111" id={viewing.id+1} /></div>
                  <div className="th"><CanvasArt type={viewing.artType} color="#222" id={viewing.id+2} /></div>
                </div>
              </div>
              <div className="detail-info">
                <div className="cat">{RELIC_FILTERS.find(f => f.id === viewing.cat)?.label}</div>
                <h2 id="dialog-title">{viewing.title}</h2>
                <div className="sub">Added 2 moons ago • Ver 1.04</div>
                
                <div className="creator-row mt">
                  <div className="avatar">🧙‍♂️</div>
                  <div>
                    <div className="cn">{viewing.author}</div>
                    <div className="cr">Grandmaster</div>
                  </div>
                  <div style={{marginLeft:'auto'}}>
                    <button className="btn btn-wood small">Follow Scribe</button>
                  </div>
                </div>

                <p className="desc">{viewing.desc}</p>
                
                <div className="detail-tags">
                  {viewing.tags.map((t) => <span key={t}>{t}</span>)}
                </div>

                <div className="spec-grid">
                  <div><div className="k">Acquisitions</div><div className="v">{viewing.dls}</div></div>
                  <div><div className="k">Renown</div><div className="v">★ {viewing.rating}</div></div>
                  <div><div className="k">Origin</div><div className="v">Aethelgard</div></div>
                  <div><div className="k">License</div><div className="v">Royal Free</div></div>
                </div>

                <div className="detail-actions">
                  <button className="btn btn-brass" onClick={() => handleToast(`Acquired ${viewing.title}`)}>
                    {viewing.price === 0 ? 'Claim Free Relic' : `Pay Tithe (${viewing.price} G)`}
                  </button>
                  <button className="btn btn-wood" onClick={(e) => toggleBookmark(e, viewing.id)}>
                    {bookmarks.has(viewing.id) ? 'Remove from Compendium' : 'Add to Compendium'}
                  </button>
                  <button className="btn btn-iron" onClick={() => handleToast('Link copied to parchment.')}>Share</button>
                </div>

                <div className="detail-section">
                  <h4>Scribe Notes</h4>
                  <ul className="versions">
                    <li><span className="vtag">v1.04</span> Restored missing textures on the pommel.</li>
                    <li><span className="vtag">v1.03</span> Added blood variants.</li>
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Scholars' Thoughts</h4>
                  <ul className="comments">
                    <li className="comment">
                      <div className="ch"><div className="cavatar">T</div><div className="cn">Thorin</div><div className="cd">3 days ago</div></div>
                      An exquisite piece. Fits perfectly in my dungeon scene.
                    </li>
                    <li className="comment">
                      <div className="ch"><div className="cavatar">L</div><div className="cn">Lyra</div><div className="cd">1 week ago</div></div>
                      The poly count is a bit high for mobile realms, but beautiful.
                    </li>
                  </ul>
                  <button className="btn btn-wood small mt" style={{width:'100%', justifyContent:'center'}}>Leave a thought</button>
                </div>
                
                <div className="detail-section">
                  <h4>Similar Relics</h4>
                  <div className="related-row">
                    <div className="rel"><CanvasArt type="weapon" color="#2b2b2b" id={99} /><div className="rn">Steel Mace</div></div>
                    <div className="rel"><CanvasArt type="weapon" color="#3a2a2a" id={98} /><div className="rn">Dagger</div></div>
                    <div className="rel"><CanvasArt type="prop" color="#1a1a1a" id={97} /><div className="rn">Shield</div></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="toast-wrap">
          <div className="toast">{toast}</div>
        </div>
      )}

    </div>
  );
};
