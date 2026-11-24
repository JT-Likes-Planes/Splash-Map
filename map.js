const BASE_LAYERS = {
  dark:   { label: 'Dark Ocean', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OSM', dark: true },
  street: { label: 'Street',     url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OSM', dark: false },
  sat:    { label: 'Satellite',  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '© Esri', dark: false },
  topo:   { label: 'Topo',       url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attr: '© OpenTopoMap', dark: false }
};

const M = {
  map: null,
  layer: null,
  tile: null,
  userMarker: null,
  routeLine: null,
  cat: 'all',
  onlyFav: false,
  minH: 0,
  adding: false,
  mePos: null,

  init() {
    if (typeof L === 'undefined') {
      toast('Map library failed to load (offline?)');
      return;
    }
    this.map = L.map('map', { zoomControl: false, tap: true }).setView([-37.2, 175.3], 7);
    this.setBase(S.d.prefs.base || 'dark', true);

    this.layer = typeof L.markerClusterGroup === 'function'
      ? L.markerClusterGroup({ maxClusterRadius: 42, showCoverageOnHover: false })
      : L.layerGroup();
    this.map.addLayer(this.layer);

    this.map.on('click', e => {
      if (!this.adding) return;
      this.cancelAdd();
      V.addSpot(e.latlng.lat, e.latlng.lng);
    });

    window.addEventListener('resize', () => this.map && this.map.invalidateSize());
    setTimeout(() => this.map && this.map.invalidateSize(), 250);
    this.draw();
  },

  setBase(key, silent) {
    if (!this.map) return;
    const cfg = BASE_LAYERS[key] || BASE_LAYERS.dark;
    if (this.tile) this.map.removeLayer(this.tile);
    this.tile = L.tileLayer(cfg.url, { maxZoom: 19, attribution: cfg.attr }).addTo(this.map);
    document.getElementById('map').classList.toggle('dark', !!cfg.dark);
    S.d.prefs.base = key;
    S.save();
    if (!silent) toast('Map: ' + cfg.label);
  },

  draw() {
    if (!this.map || !this.layer) return;
    this.layer.clearLayers();
    const q = (document.getElementById('q')?.value || '').trim().toLowerCase();

    const list = S.d.spots.filter(sp => {
      if (this.cat !== 'all' && sp.cat !== this.cat) return false;
      if (this.onlyFav && !S.d.favs.includes(sp.id)) return false;
      if ((sp.height || 0) < this.minH) return false;
      if (q && !(`${sp.name} ${sp.desc} ${(sp.tags || []).join(' ')}`.toLowerCase().includes(q))) return false;
      return true;
    });

    list.forEach(sp => {
      const cObj = CATS.find(c => c.id === sp.cat) || CATS[0];
      const visited = S.d.visited.includes(sp.id);
      const icon = L.divIcon({
        className: '',
        html: `<div class="pin" style="--c:${cObj.c}">${visited ? '✅' : cObj.ico}</div>`,
        iconSize: [42, 50],
        iconAnchor: [21, 50]
      });
      const mk = L.marker([sp.lat, sp.lng], { icon });
      mk.on('click', () => {
        if (this.adding) return;
        V.spot(sp.id);
      });
      this.layer.addLayer(mk);
    });
  },

  locate(cb) {
    if (!navigator.geolocation) return toast('GPS not supported on this device');
    toast('Finding your GPS...');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        this.mePos = { lat, lng };
        if (this.map) {
          if (this.userMarker) this.map.removeLayer(this.userMarker);
          this.userMarker = L.marker([lat, lng], {
            icon: L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] })
          }).addTo(this.map);
          this.map.flyTo([lat, lng], Math.max(this.map.getZoom(), 13), { duration: 0.9 });
        }
        if (cb) cb(this.mePos);
      },
      () => toast('Allow location permission to use GPS'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  },

  focus(id) {
    const sp = S.spot(id);
    if (!sp || !this.map) return;
    go('map');
    setTimeout(() => {
      this.map.flyTo([sp.lat, sp.lng], 14, { duration: 0.8 });
      V.spot(sp.id);
    }, 150);
  },

  drawRoute(sp) {
    if (!this.map || !this.mePos) return;
    if (this.routeLine) this.map.removeLayer(this.routeLine);
    this.routeLine = L.polyline([[this.mePos.lat, this.mePos.lng], [sp.lat, sp.lng]], {
      color: S.d.prefs.accent || '#00e5d0',
      weight: 3,
      dashArray: '8, 8'
    }).addTo(this.map);
    this.map.fitBounds(this.routeLine.getBounds(), { padding: [60, 80] });
  },

  addMode() {
    if (this.adding) return this.cancelAdd();
    this.adding = true;
    document.getElementById('map').classList.add('adding');
    let banner = document.getElementById('add-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'add-banner';
      banner.className = 'add-banner';
      banner.innerHTML = `<span>📍 Tap anywhere on map to place spot</span>
        <div style="display:flex;gap:6px">
          <button onclick="M.useGpsForAdd()">My GPS</button>
          <button onclick="M.cancelAdd()">Cancel</button>
        </div>`;
      document.getElementById('t-map').appendChild(banner);
    }
  },

  useGpsForAdd() {
    this.locate(pos => {
      this.cancelAdd();
      V.addSpot(pos.lat, pos.lng);
    });
  },

  cancelAdd() {
    this.adding = false;
    document.getElementById('map')?.classList.remove('adding');
    document.getElementById('add-banner')?.remove();
  }
};
