let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('inst');
  if (btn) btn.hidden = false;
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(() => {
      deferredPrompt = null;
      document.getElementById('inst').hidden = true;
    });
  } else {
    toast('Use browser menu → Add to Home Screen');
  }
}

function syncOnline() {
  const off = document.getElementById('off');
  if (off) off.hidden = navigator.onLine;
}
window.addEventListener('online', syncOnline);
window.addEventListener('offline', syncOnline);
syncOnline();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
