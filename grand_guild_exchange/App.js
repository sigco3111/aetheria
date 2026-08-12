const { useState, useEffect, useRef, useMemo } = React;

// --- DATA ---

const RELIC_FILTERS = [
  { id: 'all', label: '전체', icon: '🪬' },
  { id: 'maps', label: '지도', icon: '🧭' },
  { id: 'creatures', label: '생물', icon: '🐉' },
  { id: 'weapons', label: '무기', icon: '⚔️' },
  { id: 'props', label: '유물', icon: '🛡️' },
  { id: 'potions', label: '연금술', icon: '🧪' },
  { id: 'runes', label: '셰이더', icon: '🔮' },
  { id: 'scrolls', label: '로어', icon: '📜' },
];

const DISCOVERIES = [
  { id: 1, title: '침묵의 성채', author: '엘다리온', cat: 'maps', price: 45, dls: '12k', rating: '4.9', tags: ['dungeon','gothic','boss-arena'], imgColor: '#2b2c30', artType: 'map', desc: '시간과 어두운 마법에 의해 폐허가 된 광대한 고딕 성당. 4개의 펼쳐진 층, 숨겨진 지하 묘지, 그리고 정상의 거대한 보스 아레나 포함. 낮은 드로우 콜에 최적화됨.' },
  { id: 2, title: '용뼈 대검', author: 'Kael', cat: 'weapons', price: 0, dls: '38k', rating: '4.8', tags: ['2-handed','fire-dmg','high-poly'], imgColor: '#4a2f26', artType: 'weapon', desc: '화룡의 척추로 벼려졌습니다. 칼날은 끊임없이 미묘한 열 왜곡을 방출합니다. 완전히 리깅되고 애니메이션 처리됨.' },
  { id: 3, title: '트롤왕 스카른', author: '그루자', cat: 'creatures', price: 120, dls: '5k', rating: '4.9', tags: ['boss','rigged','pbr'], imgColor: '#3c4a2a', artType: 'creature', desc: '약탈한 갑옷을 입은 거대한 트롤 전왕. 24개의 커스텀 공격 애니메이션, 대기 루프, 3단계 전투 로직 포함.' },
  { id: 4, title: '공허 균열 셰이더', author: '대마법사 솔', cat: 'runes', price: 20, dls: '21k', rating: '5.0', tags: ['vfx','portal','compute'], imgColor: '#1c162e', artType: 'rune', desc: '국소 빛과 공간을 휘게 하는 고도로 사용자 정의 가능한 포털 셰이더. 모든 쿼드에 끌어다 놓으세요.' },
  { id: 5, title: 'Alchemist\'s Set', author: 'Nyx', cat: 'props', price: 15, dls: '18k', rating: '4.7', tags: ['clutter','bottles','tables'], imgColor: '#3d291e', artType: 'prop', desc: '140개 이상의 개별 소품으로 마법사 탑과 약제상을 채웁니다. 막자, 막자사발, 저울, 빛나는 액체 등.' },
  { id: 6, title: '침몰 해안', author: '엘다리온', cat: 'maps', price: 65, dls: '8k', rating: '4.8', tags: ['region','ocean','ruins'], imgColor: '#263b4a', artType: 'map', desc: '4km x 4km 해안 지역으로, 들쭉날쭉한 절벽, 난파선, 귀신 들린 어촌이 있습니다.' },
  { id: 7, title: '태양불 플라스크', author: 'Nyx', cat: 'potions', price: 0, dls: '55k', rating: '4.9', tags: ['consumable','animated','glow'], imgColor: '#4a3b1a', artType: 'potion', desc: '휘몰아치는 마법의 불이 담긴 하이폴리 유리 플라스크. 캐릭터 움직임에 따라 액체가 역동적으로 출렁입니다.' },
  { id: 8, title: '왕들의 시대 로어북', author: '기록관 베인', cat: 'scrolls', price: 5, dls: '40k', rating: '4.6', tags: ['ui','text','history'], imgColor: '#473d2b', artType: 'scroll', desc: '제1시대의 완전한 역사가 담긴 20페이지 인터랙티브 UI 책. 퀘스트 시스템에 손쉽게 통합됩니다.' },
  { id: 9, title: '철목 석궁', author: 'Kael', cat: 'weapons', price: 25, dls: '11k', rating: '4.7', tags: ['ranged','mechanisms'], imgColor: '#2f2c25', artType: 'weapon', desc: '애니메이션 톱니바퀴, 줄 장력, 재장전 상태가 포함된 묵직한 기계식 석궁.' },
  { id: 10, title: '스펙트럴 레이스', author: '대마법사 솔', cat: 'creatures', price: 35, dls: '14k', rating: '4.8', tags: ['undead','floating','translucent'], imgColor: '#243236', artType: 'creature', desc: '공중을 떠다니는 천상의 적. 놀라운 흐르는 천 시뮬레이션을 특징으로 합니다.' },
];

const KINGDOMS = [
  { id: 1, name: '에셀가드', desc: '하이 판타지, 성, 기사', col: '#45566b' },
  { id: 2, name: '드로고르 황무지', desc: '사막, 폐허, 전갈', col: '#6b5437' },
  { id: 3, name: '창백의 땅', desc: '얼어붙은 툰드라, 바이킹', col: '#3a4650' },
  { id: 4, name: '실프우드', desc: '엘프의 숲, 고대의 마법', col: '#335035' },
];

const CREATORS = [
  { id: 1, name: 'Eldarion', rank: '대건축가', icon: '🏰' },
  { id: 2, name: 'Nyx', rank: '대연금술사', icon: '🦇' },
  { id: 3, name: 'Kael', rank: 'Forgemaster', icon: '🔨' },
  { id: 4, name: '대마법사 솔', rank: '빛의 직조자', icon: '👁️' },
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
    if (next.has(id)) { next.delete(id); handleToast('도감에서 제거되었습니다.'); }
    else { next.add(id); handleToast('도감에 저장되었습니다.'); }
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
          <h1>위대한 길드 교역소</h1>
          <p>Where the world's knowledge is stored</p>
          <div className="enter-btn">
            <button className="btn btn-rune" onClick={() => {
              document.getElementById('passage')?.classList.add('open');
              setTimeout(() => {
                document.getElementById('passage')?.classList.add('gone');
                setEntered(true);
              }, 1200);
            }}>기록 보관소에 입장</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app">
      <a href="#main" className="skip sr-only">본문으로 건너뛰기</a>
      
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
            <div className="k">위대한 길드 교역소</div>
            <div className="s">제국 기록 보관소</div>
          </div>
          <div className="topbar-spacer"></div>
          <div className="topbar-actions">
            <button className="btn btn-brass small" onClick={() => handleToast('금고가 잠겼습니다.')}>
              <span className="ic">🪙</span> 금고
            </button>
            <button className="btn btn-wood small" onClick={() => handleToast('프로필이 열렸습니다.')}>
              <span className="ic">🧙‍♂️</span> 프로필
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="shell">
        
        {/* HERO MAP TABLE */}
        <section className="hero">
          <h1>기록 보관소</h1>
          <p className="lede">왕국의 모든 구석을 누비던 모험가들이 남긴 지도, 유물, 잊혀진 지식을 발견하세요.</p>
          
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
              <div className="kn">에셀가드 지역</div>
              <div className="kd">142명의 활동 학자 탐험 중</div>
            </div>
            <div className="map-stats">
              <span className="chip">14,204 발견</span>
              <span className="chip">28개 길드</span>
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
                  <p className="tome-hint">원하는 것을 말하거나 양피지 위에 적으세요. 그러면 기록 보관소가 숨겨진 것을 드러낼 것입니다.</p>
                </div>
                <div className="tome-page right">
                  <div className="tome-results-note">{filtered.length} 발견된 책</div>
                  <input 
                    type="text" 
                    className="ink-input" 
                    placeholder="잊혀진 왕국을 찾아서..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="기록 보관소 검색"
                  />
                  <div className="mt">
                    <span className="tome-hint">기록관의 먹물이 형태를 만듭니다:</span><br/>
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
            <button className="tag-toggle">무료</button>
          </div>

          <div className="filter-bar">
            <div className="result-count">{filtered.length} 발견</div>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort by">
              <option value="popular">가장 명성 높은</option>
              <option value="new">최근 발견</option>
              <option value="price_asc">헌금 (낮은순)</option>
              <option value="price_desc">헌금 (높은순)</option>
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
                  <div className="by">발견자: {d.author}</div>
                  <div className="meta">
                    <span><b className="stars">★★★★★</b> {d.rating}</span>
                    <span><b>{d.dls}</b> 획득</span>
                  </div>
                  <div className="tags">
                    {d.tags.map(t => <span key={t}>{t}</span>)}
                  </div>
                  <div className="cardfoot">
                    <button className="btn btn-wood small" onClick={(e) => { e.stopPropagation(); handleToast(`${d.title} 획득`); }}>획득</button>
                    <div className="wax">
                      <button className={`book ${bookmarks.has(d.id) ? 'on' : ''}`} onClick={(e) => toggleBookmark(e, d.id)} aria-label="책갈피" title="도감에 추가">🔖</button>
                      <button aria-label="박수" title="명성 부여" onClick={(e) => { e.stopPropagation(); handleToast('명성이 부여되었습니다!'); }}>🔥</button>
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
              <button className="btn btn-iron" onClick={() => handleToast('더 깊은 기록 보관소를 탐색 중...')}>더 깊이 탐구</button>
            </div>
          )}
        </section>

        <div className="divider"></div>

        {/* COMMUNITY SECTIONS */}
        <section className="section">
          <div className="sec-head">
            <div className="eyebrow">길드의 영예</div>
            <h2>큐레이터의 선택</h2>
            <p>교역소의 대장장이들에 의해 탁월함이 인정된 유물들.</p>
          </div>
          <div className="rail">
            {[1,2,3,4].map(i => (
              <div key={i} className="rail-card">
                <div className="pick-plaque">
                  <div className="rank">#{i}</div>
                  <div className="pt">왕립 병기고 제{i}</div>
                  <div className="pd">A complete set of high-fantasy weaponry forged for kings.</div>
                  <div className="pm">
                    <span>By Kael</span>
                    <span>14k 획득</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="sec-head">
            <div className="eyebrow">Master Artisans</div>
            <h2>명성ed Creators</h2>
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
            <h2>Regions of 원산지</h2>
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
        <p className="fq">"숨겨진 지식은 잃어버린 지식입니다. 지도를 두고, 칼날을 가져가세요."</p>
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
            <button className="btn btn-wax detail-close" onClick={() => setViewing(null)} aria-label="두루마리 닫기">✕</button>
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
                <div className="sub">2달 전에 추가됨 • Ver 1.04</div>
                
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
                  <div><div className="k">획득</div><div className="v">{viewing.dls}</div></div>
                  <div><div className="k">명성</div><div className="v">★ {viewing.rating}</div></div>
                  <div><div className="k">원산지</div><div className="v">에셀가드</div></div>
                  <div><div className="k">라이선스</div><div className="v">왕실 무료</div></div>
                </div>

                <div className="detail-actions">
                  <button className="btn btn-brass" onClick={() => handleToast(`${viewing.title} 획득`)}>
                    {viewing.price === 0 ? '무료 유물 수령' : `헌금 지불 (${viewing.price} G)`}
                  </button>
                  <button className="btn btn-wood" onClick={(e) => toggleBookmark(e, viewing.id)}>
                    {bookmarks.has(viewing.id) ? '도감에서 제거' : '도감에 추가'}
                  </button>
                  <button className="btn btn-iron" onClick={() => handleToast('링크가 양피지에 복사되었습니다.')}>Share</button>
                </div>

                <div className="detail-section">
                  <h4>Scribe 노트</h4>
                  <ul className="versions">
                    <li><span className="vtag">v1.04</span> Restored missing textures on the pommel.</li>
                    <li><span className="vtag">v1.03</span> Added blood variants.</li>
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Scholars' Thoughts</h4>
                  <ul className="comments">
                    <li className="comment">
                      <div className="ch"><div className="cavatar">T</div><div className="cn">토린</div><div className="cd">3일 전</div></div>
                      An exquisite piece. Fits perfectly in my dungeon scene.
                    </li>
                    <li className="comment">
                      <div className="ch"><div className="cavatar">L</div><div className="cn">리라</div><div className="cd">1주일 전</div></div>
                      The poly count is a bit high for mobile realms, but beautiful.
                    </li>
                  </ul>
                  <button className="btn btn-wood small mt" style={{width:'100%', justifyContent:'center'}}>Leave a thought</button>
                </div>
                
                <div className="detail-section">
                  <h4>Similar 유물</h4>
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
