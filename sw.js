/* 선생님 도구 모음 · 오프라인 사용
   인터넷이 되면 항상 새 파일을 받아 보여 주고(자동 업데이트), 안 되면 지난번에 받아 둔 파일을 보여 줍니다.
   버전 숫자를 따로 올릴 필요가 없습니다. 학생 자료는 다루지 않고, 프로그램 파일만 저장합니다.
   GitHub Pages는 브라우저가 파일을 10분쯤 그대로 쓰게 하므로, 새 파일을 받을 때는 브라우저 저장본을 건너뜁니다(cache: no-cache).
   그래야 새로 올린 화면 파일과 예전 공통 파일이 섞여 화면이 비는 일이 없습니다. */
importScripts('shared/tools.js');
const CACHE = 'tt-files-v10';
const CORE = ['./', 'manifest.webmanifest', 'assets/icon-192.png', 'assets/icon-512.png',
              'shared/tt.css', 'shared/tt.js', 'shared/tools.js', 'shared/board.js', 'shared/mytodo.js', 'shared/vaultui.js', 'shared/vault.js', 'shared/notes.js', 'shared/guidelogic.js', 'shared/theme.css', 'shared/calendar.js', 'shared/mathgen.js', 'shared/sync.html', 'apps/tardy/absence-form.hwpx'];
const FILES = CORE.concat(TT_TOOLS.filter(t => t.ready && t.href).map(t => t.href));   // 내려받는 PC 프로그램은 저장해 두지 않음

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE && (k.indexOf('tt-files-') === 0 || k.indexOf('teacher-tools-') === 0)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (new URL(req.url).pathname.indexOf('/downloads/') >= 0) return;            // 큰 실행파일은 그대로 내려받기
  e.respondWith(caches.open(CACHE).then(cache => {
    const fromNet = fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; });
    const slow = new Promise(resolve => setTimeout(resolve, 4000));       // 4초 안에 안 오면 저장본으로
    return Promise.race([fromNet.catch(() => null), slow]).then(res =>
      res || cache.match(req, { ignoreSearch: true }).then(hit => hit || fromNet));
  }));
});
