const KEY = 'splashmap_v4';

const defaults = () => ({
  spots: structuredClone(SEED_SPOTS),
  feed: structuredClone(SEED_FEED),
  favs: ['s1'],
  visited: ['s1'],
  me: {
    name: 'Splasher',
    av: '🐬',
    xp: 220,
    jumps: 12,
    maxH: 5.5,
    added: 0,
    goal: 20,
    week: [1, 3, 0, 2, 4, 1, 1], // Mon..Sun
    ice: ''
  },
  prefs: {
    accent: '#00e5d0',
    units: 'm',
    base: 'dark'
  }
});

const S = {
  d: null,
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      this.d = raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
    } catch {
      this.d = defaults();
    }
    this.applyTheme();
  },
  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch {}
  },
  applyTheme() {
    document.documentElement.style.setProperty('--aqua', this.d.prefs.accent || '#00e5d0');
  },
  fmtH(meters) {
    if (this.d.prefs.units === 'ft') return `${(meters * 3.28084).toFixed(1)}ft`;
    return `${(+meters).toFixed(1)}m`;
  },
  spot(id) {
    return this.d.spots.find(x => x.id === id);
  },
  toggleFav(id) {
    const i = this.d.favs.indexOf(id);
    if (i >= 0) this.d.favs.splice(i, 1); else this.d.favs.push(id);
    this.save();
  },
  toggleVisited(id) {
    const i = this.d.visited.indexOf(id);
    if (i >= 0) this.d.visited.splice(i, 1); else this.d.visited.push(id);
    this.save();
  },
  addSpot(spot) {
    this.d.spots.unshift(spot);
    this.d.me.added++;
    this.d.me.xp += 50;
    this.save();
  },
  logJump({ spotId, style, height, count, note, photo }) {
    const sp = this.spot(spotId);
    const entry = {
      id: 'f' + Date.now(),
      who: this.d.me.name,
      av: this.d.me.av,
      spotId,
      spot: sp ? sp.name : 'Open Water',
      style,
      height: +height || 0,
      count: +count || 1,
      stokes: 1,
      stoked: true,
      note,
      photo,
      ts: Date.now()
    };
    this.d.feed.unshift(entry);
    this.d.me.jumps += entry.count;
    this.d.me.xp += entry.count * 15;
    if (entry.height > this.d.me.maxH) this.d.me.maxH = entry.height;
    const day = (new Date().getDay() + 6) % 7;
    this.d.me.week[day] = (this.d.me.week[day] || 0) + entry.count;
    if (spotId && !this.d.visited.includes(spotId)) this.d.visited.push(spotId);
    this.save();
    return entry;
  },
  rateSpot(id, stars, comment) {
    const sp = this.spot(id);
    if (!sp) return;
    if (stars > 0) {
      sp.rating = +(((sp.rating * sp.votes) + stars) / (sp.votes + 1)).toFixed(1);
      sp.votes++;
    }
    if (comment && comment.trim()) {
      sp.comments = sp.comments || [];
      sp.comments.unshift({ by: this.d.me.name, txt: comment.trim(), ts: Date.now() });
    }
    this.d.me.xp += 10;
    this.save();
  },
  reportHazard(id, hazard) {
    const sp = this.spot(id);
    if (!sp) return;
    sp.hazards = sp.hazards || [];
    if (!sp.hazards.includes(hazard)) sp.hazards.push(hazard);
    this.save();
  }
};
