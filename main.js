function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function ago(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

let _tTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(_tTimer);
  _tTimer = setTimeout(() => t.classList.remove('on'), 2600);
}

function go(tab) {
  document.querySelectorAll('.tab').forEach(el => el.classList.toggle('on', el.id === 't-' + tab));
  document.querySelectorAll('.nb').forEach(el => el.classList.toggle('on', el.dataset.t === tab));
  if (tab === 'map') setTimeout(() => M.map && M.map.invalidateSize(), 60);
  if (tab === 'feed') V.feed();
  if (tab === 'rank') V.rank();
  if (tab === 'me') V.me();
}

function buildChips() {
  const wrap = document.getElementById('chips');
  wrap.innerHTML =
    CATS.map(c => `<button class="chip ${c.id === 'all' ? 'on' : ''}" data-c="${c.id}" onclick="pickCat('${c.id}',this)">${c.ico} ${c.name}</button>`).join('') +
    `<button class="chip" id="fav-chip" onclick="toggleFavFilter(this)">❤️ Saved</button>` +
    `<label class="chip">Min <span id="mh-lbl">0m</span><input type="range" min="0" max="10" step="1" value="0" oninput="setMinH(this.value)"></label>`;
}

function pickCat(id, btn) {
  M.cat = id;
  document.querySelectorAll('#chips button[data-c]').forEach(b => b.classList.toggle('on', b === btn));
  M.draw();
}

function toggleFavFilter(btn) {
  M.onlyFav = !M.onlyFav;
  btn.classList.toggle('on', M.onlyFav);
  M.draw();
}

function setMinH(v) {
  M.minH = +v;
  document.getElementById('mh-lbl').textContent = v + 'm';
  M.draw();
}

window.addEventListener('DOMContentLoaded', () => {
  S.load();
  buildChips();
  M.init();
  if (location.hash === '#log') V.record();
});
