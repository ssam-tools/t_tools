/* 선생님 도구 모음 · 오프라인 사용
   인터넷이 되면 항상 새 파일을 받아 보여 주고(자동 업데이트), 안 되면 지난번에 받아 둔 파일을 보여 줍니다.
   버전 숫자를 따로 올릴 필요가 없습니다. 학생 자료는 다루지 않고, 프로그램 파일만 저장합니다.
   GitHub Pages는 브라우저가 파일을 10분쯤 그대로 쓰게 하므로, 새 파일을 받을 때는 브라우저 저장본을 건너뜁니다(cache: no-cache).
   그래야 새로 올린 화면 파일과 예전 공통 파일이 섞여 화면이 비는 일이 없습니다. */
importScripts('shared/tools.js');
TT_PACKS.forEach(p => { try { importScripts(p.file); } catch (e) {} });   // 교과 팩 도구도 오프라인 저장
const CACHE = 'tt-files-v53';
const CORE = ['./', 'manifest.webmanifest', 'assets/icon-192.png', 'assets/icon-512.png',
              'shared/look.css', 'shared/tt.css', 'shared/tt.js', 'shared/tools.js', ...TT_PACKS.map(p => p.file), 'shared/board.js', 'shared/mytodo.js', 'shared/today.js', 'shared/clock.js', 'shared/meal.js', 'shared/vaultui.js', 'shared/vault.js', 'shared/notes.js', 'shared/guidelogic.js', 'shared/theme.css', 'shared/calendar.js', 'shared/mathgen.js', 'shared/comci.js', 'shared/hwpx.js', 'shared/auto.js', 'shared/fonts.css', 'shared/fill.js', 'shared/libd.js', 'shared/voice.js', 'shared/mask.js', 'shared/ssambi.js', 'shared/follow.js', 'shared/exam-data.js', 'shared/challenge.js', 'shared/concepts.js', 'shared/sync.html', 'apps/tardy/absence-form.hwpx'];
// 글꼴 파일(shared/fonts/)은 미리 받지 않고, 그 글꼴을 골라 처음 쓸 때 저장해 둡니다(아래 fetch).
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
  // 화면 주소의 ?뒤(공유로 받은 글 ?text=… 등)는 화면 안에서만 읽습니다. 서버로 보내지도, 저장본에 남기지도 않도록 떼어 냅니다(녹음 3단계).
  const u = new URL(req.url), url = req.mode === 'navigate' && u.search ? u.origin + u.pathname : req.url;
  e.respondWith(caches.open(CACHE).then(cache => {
    const fromNet = fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => { if (res && res.ok) cache.put(url, res.clone()); return res; });
    const slow = new Promise(resolve => setTimeout(resolve, 4000));       // 4초 안에 안 오면 저장본으로
    return Promise.race([fromNet.catch(() => null), slow]).then(res =>
      res || cache.match(req, { ignoreSearch: true }).then(hit => hit || fromNet));
  }));
});
