function cycleBase() {
  const keys = Object.keys(BASE_LAYERS);
  const cur = S.d.prefs.base || 'dark';
  const next = keys[(keys.indexOf(cur) + 1) % keys.length];
  M.setBase(next);
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371, rad = d => d * Math.PI / 180;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function nearest() {
  const run = pos => {
    const sorted = S.d.spots
      .map(sp => ({ sp, km: haversineKm(pos.lat, pos.lng, sp.lat, sp.lng) }))
      .sort((a, b) => a.km - b.km);
    const best = sorted[0];
    if (!best) return;
    M.drawRoute(best.sp);
    toast(`🧭 ${best.sp.name} is ${best.km.toFixed(1)} km away`);
  };
  if (M.mePos) run(M.mePos);
  else M.locate(run);
}

let _buddyInt = null, _buddyEnd = 0;
function buddy() {
  const remain = Math.max(0, Math.ceil((_buddyEnd - Date.now()) / 1000));
  V.sheet(`
    <h2>Buddy Check-In Timer ⏱️</h2>
    <p><small>Set a safety timer before entering the water. Alerts you when time is up.</small></p>
    ${_buddyInt ? `
      <div class="big" style="margin:16px 0">${Math.floor(remain / 60)}:${String(remain % 60).padStart(2, '0')}</div>
      <button class="btn danger" onclick="stopBuddy()">I'm Safe — Cancel Timer</button>
    ` : `
      <div class="seg" style="margin-top:14px">
        <button class="on" onclick="startBuddy(15)">15 min</button>
        <button onclick="startBuddy(30)">30 min</button>
        <button onclick="startBuddy(60)">60 min</button>
      </div>
    `}
  `);
}

function startBuddy(mins) {
  clearInterval(_buddyInt);
  _buddyEnd = Date.now() + mins * 60000;
  document.querySelector('.fabs button[onclick="buddy()"]')?.classList.add('lit');
  _buddyInt = setInterval(() => {
    if (Date.now() >= _buddyEnd) {
      stopBuddy();
      alert('⏱️ Buddy Check-In Time! Check in with your crew.');
    }
  }, 1000);
  V.close();
  toast(`⏱️ Buddy timer set for ${mins}m`);
}

function stopBuddy() {
  clearInterval(_buddyInt);
  _buddyInt = null;
  _buddyEnd = 0;
  document.querySelector('.fabs button[onclick="buddy()"]')?.classList.remove('lit');
  V.close();
  toast('Buddy timer cleared');
}

function sos() {
  const show = pos => {
    const coords = pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : 'Location unavailable';
    const near = pos && S.d.spots.length
      ? S.d.spots.map(s => ({ s, km: haversineKm(pos.lat, pos.lng, s.lat, s.lng) })).sort((a, b) => a.km - b.km)[0]
      : null;
    const msg = `SOS Splash Map! Need help at GPS: ${coords}` + (near ? ` (near ${near.sp.name}, ${near.km.toFixed(1)}km)` : '');
    const ice = S.d.me.ice;
    V.sheet(`
      <h2 style="color:var(--bad)">Emergency SOS 🆘</h2>
      <div class="warn bad">
        <b>GPS:</b> ${coords}<br>
        ${near ? `<b>Nearest Spot:</b> ${esc(near.sp.name)} (${near.km.toFixed(1)} km)` : ''}
      </div>
      ${ice ? `<a class="btn danger" href="sms:${encodeURIComponent(ice)}?body=${encodeURIComponent(msg)}">📩 SMS ICE Contact (${esc(ice)})</a>` : ''}
      <button class="btn ghost" onclick="navigator.clipboard?.writeText('${esc(msg)}');toast('SOS message copied!')">📋 Copy Emergency Coordinates</button>
      <a class="btn ghost" href="tel:111">📞 Call Emergency Services (111 / 911 / 112)</a>
    `);
  };
  if (M.mePos) show(M.mePos);
  else {
    show(null);
    M.locate(pos => { if (document.getElementById('sheet').classList.contains('open')) show(pos); });
  }
}
