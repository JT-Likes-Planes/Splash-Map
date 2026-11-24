const V = {
  sheet(html) {
    const el = document.getElementById('sheet');
    el.innerHTML = `<div class="grab" onclick="V.close()"></div>` + html;
    el.classList.add('open');
  },
  close() {
    document.getElementById('sheet').classList.remove('open');
  },

  spot(id) {
    const sp = S.spot(id);
    if (!sp) return;
    const cat = CATS.find(c => c.id === sp.cat) || CATS[0];
    const fav = S.d.favs.includes(id);
    const vis = S.d.visited.includes(id);
    const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${sp.lat},${sp.lng}`;

    this.sheet(`
      <div class="hd">
        <div>
          <small>${cat.ico} ${cat.name.toUpperCase()}</small>
          <h2>${esc(sp.name)}</h2>
        </div>
        <div style="display:flex;gap:6px">
          <button class="mini ${fav ? 'on' : ''}" onclick="S.toggleFav('${id}');V.spot('${id}');M.draw()">${fav ? '❤️ Saved' : '🤍 Save'}</button>
          <button class="mini ${vis ? 'on' : ''}" onclick="S.toggleVisited('${id}');V.spot('${id}');M.draw()">${vis ? '✅ Sent' : 'Sent?'}</button>
        </div>
      </div>

      <div class="row3">
        <div><small>HEIGHT</small><b>${S.fmtH(sp.height)}</b></div>
        <div><small>DEPTH</small><b>${S.fmtH(sp.depth)}</b></div>
        <div><small>RATING</small><b>⭐ ${sp.rating}</b></div>
      </div>

      <div class="wx" id="wx-box">
        <div><small>LIVE CONDITIONS</small><div style="font-size:13px;margin-top:2px">Fetching weather & wind...</div></div>
        <span class="wx-badge wx-safe">⏳</span>
      </div>

      <p style="font-size:14px;line-height:1.5;margin:8px 0">${esc(sp.desc)}</p>

      <div>${(sp.tags || []).map(t => `<span class="tg">${esc(t)}</span>`).join('')}</div>

      ${(sp.hazards || []).length ? `<div class="warn bad">⚠️ <b>Hazards:</b> ${sp.hazards.map(esc).join(' • ')}</div>` : ''}

      <div class="seg" style="margin-top:14px">
        <a href="${gmaps}" target="_blank" rel="noopener">🧭 Directions</a>
        <button onclick="V.shareSpot('${id}')">📤 Share</button>
        <button onclick="V.hazardPrompt('${id}')">⚠️ Hazard</button>
      </div>

      <button class="btn" onclick="V.record('${id}')">🤙 Log jump here</button>

      <h3>Rate &amp; Check-in</h3>
      <div class="stars" id="r-stars">
        ${[1,2,3,4,5].map(n => `<span onclick="V.setStar(${n})">★</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input id="r-txt" placeholder="Depth ok? Water temp? Current?">
        <button class="mini on" onclick="V.submitRate('${id}')">Post</button>
      </div>

      ${(sp.comments || []).length ? `<h3>Crew Notes</h3>` + sp.comments.map(c =>
        `<div class="cmt"><b>${esc(c.by)}</b> <small>${ago(c.ts)}</small><div>${esc(c.txt)}</div></div>`
      ).join('') : ''}
    `);

    this._stars = 0;
    this.loadWeather(sp.lat, sp.lng);
  },

  async loadWeather(lat, lng) {
    const box = document.getElementById('wx-box');
    if (!box) return;
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_gusts_10m,precipitation`);
      const j = await r.json();
      const c = j.current;
      const wind = Math.round(c.wind_speed_10m);
      const gust = Math.round(c.wind_gusts_10m);
      let cls = 'wx-safe', lbl = 'Calm / Good';
      if (wind > 30 || gust > 45 || c.precipitation > 2) { cls = 'wx-bad'; lbl = 'Rough'; }
      else if (wind > 18 || gust > 28) { cls = 'wx-caut'; lbl = 'Choppy'; }
      box.innerHTML = `
        <div>
          <small>LIVE CONDITIONS</small>
          <div style="font-size:14px;font-weight:700;margin-top:2px">🌡️ ${Math.round(c.temperature_2m)}°C • 💨 ${wind} km/h (gust ${gust})</div>
        </div>
        <span class="wx-badge ${cls}">${lbl}</span>`;
    } catch {
      box.innerHTML = `<div><small>CONDITIONS</small><div style="font-size:13px">Offline — check water visually before jumping</div></div><span class="wx-badge wx-caut">Offline</span>`;
    }
  },

  _stars: 0,
  setStar(n) {
    this._stars = n;
    document.querySelectorAll('#r-stars span').forEach((el, i) => el.classList.toggle('on', i < n));
  },
  submitRate(id) {
    const txt = document.getElementById('r-txt').value;
    if (!this._stars && !txt.trim()) return toast('Pick stars or write a note');
    S.rateSpot(id, this._stars, txt);
    toast('Thanks! +10 XP');
    this.spot(id);
    M.draw();
  },

  hazardPrompt(id) {
    this.sheet(`
      <h2>Report Hazard</h2>
      <p><small>Keep the crew safe with live water warnings.</small></p>
      <div style="margin-top:12px">
        ${HAZARDS_LIST.map(h => `<button class="btn ghost" onclick="S.reportHazard('${id}','${h}');toast('Hazard added');V.spot('${id}')">${h}</button>`).join('')}
      </div>
      <button class="btn" onclick="V.spot('${id}')">Back</button>
    `);
  },

  shareSpot(id) {
    const sp = S.spot(id);
    const txt = `${sp.name} (${S.fmtH(sp.height)}) — ${sp.lat.toFixed(5)}, ${sp.lng.toFixed(5)} on Splash Map`;
    if (navigator.share) navigator.share({ title: sp.name, text: txt }).catch(() => {});
    else { navigator.clipboard?.writeText(txt); toast('Spot coordinates copied!'); }
  },

  addSpot(lat, lng) {
    this.sheet(`
      <h2>Add Water Spot</h2>
      <small>Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}</small>
      <label>Spot Name</label>
      <input id="as-name" placeholder="e.g. Shelly Bay Wharf">
      <label>Category</label>
      <select id="as-cat">
        ${CATS.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.ico} ${c.name}</option>`).join('')}
      </select>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><label>Jump Height (m)</label><input id="as-h" type="number" step="0.5" value="4.0"></div>
        <div><label>Water Depth (m)</label><input id="as-d" type="number" step="0.5" value="4.5"></div>
      </div>
      <label>Description &amp; Entry Tips</label>
      <input id="as-desc" placeholder="Best tide, ladder exit, jump line...">
      <label>Hazards</label>
      ${HAZARDS_LIST.slice(0, 4).map(h => `<label class="tg ck"><input type="checkbox" class="as-hz" value="${h}"> ${h}</label>`).join('')}
      <button class="btn" onclick="V.saveSpot(${lat},${lng})">Drop Pin (+50 XP)</button>
    `);
  },

  saveSpot(lat, lng) {
    const name = document.getElementById('as-name').value.trim();
    if (!name) return toast('Enter a spot name');
    const hazards = [...document.querySelectorAll('.as-hz:checked')].map(i => i.value);
    const sp = {
      id: 's' + Date.now(),
      name,
      cat: document.getElementById('as-cat').value,
      lat, lng,
      height: +document.getElementById('as-h').value || 3,
      depth: +document.getElementById('as-d').value || 4,
      rating: 5.0,
      votes: 1,
      desc: document.getElementById('as-desc').value.trim() || 'Community added spot. Always check depth first!',
      tags: ['Community pin'],
      hazards,
      comments: []
    };
    S.addSpot(sp);
    M.draw();
    this.close();
    toast('Pin dropped! +50 XP');
    setTimeout(() => V.spot(sp.id), 300);
  },

  _sessCount: 1,
  _dropT0: 0,
  _dropTimer: null,
  _photo: '',

  record(spotId) {
    this._sessCount = 1;
    this._photo = '';
    const sp = spotId ? S.spot(spotId) : S.d.spots[0];
    this.sheet(`
      <h2>Log Session 🤙</h2>
      <label>Spot</label>
      <select id="lg-spot">
        ${S.d.spots.map(s => `<option value="${s.id}" ${sp && s.id === sp.id ? 'selected' : ''}>${esc(s.name)} (${S.fmtH(s.height)})</option>`).join('')}
      </select>

      <label>Style</label>
      <select id="lg-style">
        ${STYLES.map(st => `<option>${st}</option>`).join('')}
      </select>

      <div class="drop-box">
        <small>FREEFALL HEIGHT ESTIMATOR (½gt²)</small>
        <div class="big" id="lg-hval" style="font-size:36px;margin:4px 0">${sp ? sp.height.toFixed(1) : '4.0'}m</div>
        <button class="mini on" id="drop-btn" onclick="V.toggleDrop()">⏱️ Start Freefall Timer</button>
      </div>

      <label>Session Jump Counter (tap per jump)</label>
      <button class="tap" id="tap-cnt" onclick="V.bumpSess()">1</button>

      <label>Session Note</label>
      <input id="lg-note" placeholder="Clean pop, glassy water...">

      <label>Photo (optional)</label>
      <input type="file" accept="image/*" onchange="V.readPhoto(this)">

      <button class="btn" onclick="V.submitJump()">Save &amp; Post to Feed (+XP)</button>
    `);
  },

  bumpSess() {
    this._sessCount++;
    const el = document.getElementById('tap-cnt');
    if (el) el.textContent = this._sessCount;
  },

  toggleDrop() {
    const btn = document.getElementById('drop-btn');
    const out = document.getElementById('lg-hval');
    if (!this._dropT0) {
      this._dropT0 = performance.now();
      btn.textContent = '💦 TAP ON SPLASH!';
      this._dropTimer = setInterval(() => {
        const dt = (performance.now() - this._dropT0) / 1000;
        const h = 0.5 * 9.81 * dt * dt;
        out.textContent = `${h.toFixed(1)}m (${dt.toFixed(2)}s)`;
      }, 30);
    } else {
      clearInterval(this._dropTimer);
      const dt = (performance.now() - this._dropT0) / 1000;
      const h = Math.min(40, Math.max(0.5, 0.5 * 9.81 * dt * dt));
      this._dropT0 = 0;
      out.dataset.m = h.toFixed(1);
      out.textContent = `${S.fmtH(h)} (${(9.81 * dt * 3.6).toFixed(0)} km/h)`;
      btn.textContent = '⏱️ Re-measure Drop';
    }
  },

  readPhoto(inp) {
    const file = inp.files?.[0];
    if (!file) return;
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.onload = () => {
        const max = 720, scale = Math.min(1, max / img.width);
        const c = document.createElement('canvas');
        c.width = img.width * scale;
        c.height = img.height * scale;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        this._photo = c.toDataURL('image/jpeg', 0.72);
        toast('Photo ready!');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  submitJump() {
    const spotId = document.getElementById('lg-spot').value;
    const sp = S.spot(spotId);
    const measured = parseFloat(document.getElementById('lg-hval').dataset.m);
    const height = measured || (sp ? sp.height : 4);
    S.logJump({
      spotId,
      style: document.getElementById('lg-style').value,
      height,
      count: this._sessCount,
      note: document.getElementById('lg-note').value.trim() || 'Sent a clean session!',
      photo: this._photo
    });
    this.close();
    toast(`+${this._sessCount * 15} XP logged!`);
    go('feed');
  },

  feed() {
    const box = document.getElementById('t-feed');
    box.innerHTML = `<h2>Crew Feed 🔥</h2>
      <p style="margin-bottom:14px"><small>Latest splashes, manu sessions and cliff checks.</small></p>` +
      S.d.feed.map((f, i) => `
        <article class="card" style="--i:${i}">
          <div class="who">
            <div class="av">${f.av}</div>
            <div>
              <b>${esc(f.who)}</b> <small>• ${ago(f.ts)}</small>
              <small>${esc(f.spot)} • ${esc(f.style)} • ${S.fmtH(f.height)}</small>
            </div>
            <button class="mini" style="margin-left:auto" onclick="M.focus('${f.spotId}')">Map 📍</button>
          </div>
          ${f.photo ? `<img class="ph" src="${f.photo}" alt="Splash photo">` : ''}
          <p style="margin-top:10px;line-height:1.45">${esc(f.note)}</p>
          <div class="acts">
            <button class="stoke ${f.stoked ? 'on' : ''}" onclick="V.stoke(this,'${f.id}')">🤙 ${f.stokes} (${f.count} jumps)</button>
          </div>
        </article>
      `).join('');
  },

  stoke(btn, id) {
    const f = S.d.feed.find(x => x.id === id);
    if (!f) return;
    f.stoked = !f.stoked;
    f.stokes += f.stoked ? 1 : -1;
    S.save();
    btn.classList.toggle('on', f.stoked);
    btn.textContent = `🤙 ${f.stokes} (${f.count} jumps)`;
    if (f.stoked) {
      for (let i = 0; i < 6; i++) {
        const p = document.createElement('span');
        p.className = 'p';
        p.textContent = ['💦', '🤙', '✨'][i % 3];
        p.style.setProperty('--x', (Math.random() * 90 - 45) + 'px');
        p.style.setProperty('--y', (-20 - Math.random() * 50) + 'px');
        btn.appendChild(p);
        setTimeout(() => p.remove(), 700);
      }
    }
  },

  rank() {
    const all = [...SEED_RANKS, { name: S.d.me.name + ' (You)', av: S.d.me.av, jumps: S.d.me.jumps, xp: S.d.me.xp }]
      .sort((a, b) => b.xp - a.xp);
    const maxXp = all[0].xp || 1;
    const topSpots = [...S.d.spots].sort((a, b) => b.rating - a.rating).slice(0, 5);

    document.getElementById('t-rank').innerHTML = `
      <h2>Splash Ranks 🏆</h2>
      <h3>Crew XP Leaderboard</h3>
      ${all.map((r, i) => `
        <div class="lb" style="--i:${i}">
          <b>#${i + 1}</b>
          <div>
            <b>${r.av} ${esc(r.name)}</b>
            <div class="bar"><u style="width:${Math.round(r.xp / maxXp * 100)}%"></u></div>
          </div>
          <small>${r.xp} XP</small>
          <b>${r.jumps}</b>
        </div>
      `).join('')}

      <h3>Top Rated Spots</h3>
      ${topSpots.map((s, i) => `
        <div class="lb" style="--i:${i};cursor:pointer" onclick="M.focus('${s.id}')">
          <b>⭐</b>
          <div><b>${esc(s.name)}</b><br><small>${S.fmtH(s.height)} • ${s.votes} ratings</small></div>
          <small>${s.rating}</small>
          <span>🗺️</span>
        </div>
      `).join('')}
    `;
  },

  me() {
    const m = S.d.me;
    const lvl = Math.floor(m.xp / 200) + 1;
    const pct = Math.min(1, m.jumps / (m.goal || 20));
    const offset = 326.7 * (1 - pct);
    const maxW = Math.max(1, ...m.week);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const uStats = { jumps: m.jumps, maxH: m.maxH, added: m.added, favs: S.d.favs.length, xp: m.xp };

    document.getElementById('t-me').innerHTML = `
      <div class="ph2">
        <div class="av">${m.av}</div>
        <div>
          <h2>${esc(m.name)}</h2>
          <span class="lvl">LVL ${lvl} • ${m.xp} XP</span>
        </div>
      </div>

      <div class="ringw">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#123a60" stroke-width="10"/>
          <circle id="ring" cx="60" cy="60" r="52" fill="none" stroke="var(--aqua)" stroke-width="10" stroke-linecap="round" stroke-dashoffset="${offset.toFixed(1)}"/>
        </svg>
        <div class="rc"><b>${m.jumps}</b><small>of ${m.goal} goal</small></div>
      </div>

      <div class="row3">
        <div><small>MAX DROP</small><b>${S.fmtH(m.maxH)}</b></div>
        <div><small>SAVED</small><b>${S.d.favs.length}</b></div>
        <div><small>VISITED</small><b>${S.d.visited.length}</b></div>
      </div>

      <h3>This Week</h3>
      <div class="wk">
        ${m.week.map((v, i) => `
          <div class="wb">
            <i style="height:${Math.round((v / maxW) * 72)}px"></i>
            <small>${days[i]}</small>
          </div>
        `).join('')}
      </div>

      <h3>Badges</h3>
      <div class="badges">
        ${BADGES.map(b => `<div class="bdg ${b.check(uStats) ? 'on' : ''}"><b>${b.ico}</b><small>${b.name}</small></div>`).join('')}
      </div>

      <h3>Saved Spots</h3>
      ${S.d.favs.length ? S.d.favs.map(id => {
        const sp = S.spot(id);
        return sp ? `<button class="btn ghost" onclick="M.focus('${sp.id}')">📍 ${esc(sp.name)} (${S.fmtH(sp.height)})</button>` : '';
      }).join('') : `<p class="mute">Tap ❤️ on any spot to save it for offline trips.</p>`}
    `;
  },

  settings() {
    const m = S.d.me;
    this.sheet(`
      <h2>Settings ⚙️</h2>
      <label>Your Name</label>
      <input id="st-name" value="${esc(m.name)}">
      <label>Avatar</label>
      <div class="seg">
        ${['🐬','🦈','🐙','🦭','🐋','🤙'].map(a => `<button class="${m.av === a ? 'on' : ''}" onclick="S.d.me.av='${a}';S.save();V.settings();V.me()">${a}</button>`).join('')}
      </div>
      <label>Units</label>
      <div class="seg">
        <button class="${S.d.prefs.units === 'm' ? 'on' : ''}" onclick="S.d.prefs.units='m';S.save();V.settings()">Meters (m)</button>
        <button class="${S.d.prefs.units === 'ft' ? 'on' : ''}" onclick="S.d.prefs.units='ft';S.save();V.settings()">Feet (ft)</button>
      </div>
      <label>Accent Theme</label>
      <div class="sw">
        ${['#00e5d0','#2ec5ff','#ffc233','#ff7eb6','#7dff8b'].map(c => `<i style="background:${c}" onclick="S.d.prefs.accent='${c}';S.applyTheme();S.save();toast('Theme updated')"></i>`).join('')}
      </div>
      <label>Emergency ICE Contact (for SOS)</label>
      <input id="st-ice" placeholder="Phone number e.g. +6421..." value="${esc(m.ice || '')}">
      <button class="btn" onclick="S.d.me.name=document.getElementById('st-name').value.trim()||'Splasher';S.d.me.ice=document.getElementById('st-ice').value.trim();S.save();V.close();V.me();toast('Saved')">Save Profile</button>
      <button class="btn ghost" onclick="V.exportData()">📤 Export Backup JSON</button>
      <button class="btn danger" onclick="if(confirm('Reset all local spots & logs?')){localStorage.removeItem('${KEY}');location.reload()}">Reset App Data</button>
    `);
  },

  exportData() {
    const blob = new Blob([JSON.stringify(S.d, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'splashmap-backup.json';
    a.click();
    toast('Backup exported!');
  }
};
