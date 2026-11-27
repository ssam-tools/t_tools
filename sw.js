/* 선생님 도구 모음 · 오프라인 사용
   인터넷이 되면 항상 새 파일을 받아 보여 주고(자동 업데이트), 안 되면 지난번에 받아 둔 파일을 보여 줍니다.
   버전 숫자를 따로 올릴 필요가 없습니다. 학생 자료는 다루지 않고, 프로그램 파일만 저장합니다.
   GitHub Pages는 브라우저가 파일을 10분쯤 그대로 쓰게 하므로, 새 파일을 받을 때는 브라우저 저장본을 건너뜁니다(cache: no-cache).
   그래야 새로 올린 화면 파일과 예전 공통 파일이 섞여 화면이 비는 일이 없습니다. */
importScripts('shared/tools.js');
TT_PACKS.forEach(p => { try { importScripts(p.file); } catch (e) {} });   // 교과 팩 도구도 오프라인 저장
const CACHE = 'tt-files-v189';
const CORE = ['./', 'manifest.webmanifest', 'assets/ssambi3-192.png', 'assets/ssambi3-512.png', 'assets/ssambi3-maskable-512.png', 'assets/ssambi3-180.png', 'assets/ssambi3-32.png',
              'shared/look.css', 'shared/tt.css', 'shared/tt.js', 'shared/tools.js', ...TT_PACKS.map(p => p.file), 'shared/board.js', 'shared/early.js', 'apps/mstudy/', 'apps/kread/', 'shared/mytodo.js', 'shared/mob.js', 'shared/quick.js', 'shared/today.js', 'shared/clock.js', 'shared/meal.js', 'shared/vaultui.js', 'shared/vault.js', 'shared/notes.js', 'shared/guidelogic.js', 'shared/theme.css', 'shared/calendar.js', 'shared/mathgen.js', 'shared/comci.js', 'shared/hwpx.js', 'shared/auto.js', 'shared/fonts.css', 'shared/fill.js', 'shared/libd.js', 'shared/libcache.js', 'shared/vendor/pdfjs/pdf.min.mjs', 'shared/vendor/pdfjs/pdf.worker.min.mjs', 'shared/voice.js', 'shared/mask.js', 'shared/ssambi.js', 'shared/ink.js', 'shared/follow.js', 'shared/exam-data.js', 'shared/challenge.js', 'shared/concepts.js', 'shared/sync.html', 'apps/tardy/absence-form.hwpx', 'apps/kread/data.js', 'apps/gym/', 'apps/gym/rooms.js', 'apps/gym/map.js', 'apps/gym/math.js', 'apps/gym/math2.js', 'apps/gym/math3.js', 'apps/gym/board.html', 'apps/gym/kor.js', 'apps/gym/kor2.js', 'apps/gym/kor3.js', 'apps/gym/kor4.js', 'apps/gym/kor5.js', 'apps/gym/eng.js', 'apps/gym/warm.js', 'apps/gym/sci.js', 'apps/gym/sci2.js', 'apps/gym/soc.js', 'apps/gym/soc2.js', 'apps/gym/coach.js', 'apps/gym/core.js', 'apps/gym/feedback.js', 'apps/gym/his.js', 'apps/gym/vary.js', 'apps/lessonkit/', 'shared/lessonkit.js', 'shared/lessonroad.js', 'shared/mathlab.js', 'shared/mathtools.js', 'apps/mlab/', 'shared/mathgen.js', 'apps/hmath/', 'apps/hmath/data.js', 'apps/jidang/', 'apps/jidang/subjects.js', 'shared/jdgym.js', 'shared/qr.js', 'shared/clean.js', 'apps/qr/', 'apps/remote/', 'apps/stuprog/', 'apps/sguide/', 'apps/mgen/ans.html', 'shared/peek.js', 'shared/quick.js', 'shared/keys.js', 'shared/joy.js', 'shared/hidden.js', 'shared/sbart.js', 'shared/sbhome.js', 'shared/sbside.js', 'shared/sbbar.js', 'shared/v2.css', 'g/schools.js', 'g/sites.js', 'shared/wx.js', 'shared/favs.js', 'shared/talk.js', 'shared/schoolset.js', 'shared/official.js', 'shared/admin.js', 'shared/safe.js'];
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
/* v2.12.6 빠르게: 최근에 받은 파일 표시 · 받는 중인 파일(같은 파일을 두 번 받지 않게) · 미리 받기(warm) */
const FRESH = new Map(), INFL = new Map(), FRESH_MS = 90000;
function fresh(k) { const t = FRESH.get(k); return !!t && Date.now() - t < FRESH_MS; }
function netGet(cache, k) {
  const p = fetch(k, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
    INFL.delete(k);
    if (res && res.ok) { cache.put(k, res.clone()); FRESH.set(k, Date.now()); }
    return res;
  }, err => { INFL.delete(k); throw err; });
  INFL.set(k, p.then(r => r && r.ok, () => false));
  return p;
}
self.addEventListener('message', e => {
  const d = e.data; if (!d || typeof d.warm !== 'string') return;
  let u; try { u = new URL(d.warm, self.location.href); } catch (x) { return; }
  if (u.origin !== location.origin || u.pathname.indexOf('/downloads/') >= 0) return;
  const k = u.origin + u.pathname;
  if (fresh(k) || INFL.has(k)) return;
  e.waitUntil(caches.open(CACHE).then(c => netGet(c, k)).catch(() => null));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (new URL(req.url).pathname.indexOf('/downloads/') >= 0) return;            // 큰 실행파일은 그대로 내려받기
  // 화면 주소의 ?뒤(공유로 받은 글 ?text=… 등)는 화면 안에서만 읽습니다. 서버로 보내지도, 저장본에 남기지도 않도록 떼어 냅니다(녹음 3단계).
  const u = new URL(req.url), url = req.mode === 'navigate' && u.search ? u.origin + u.pathname : req.url;
  // v2.12.2 버전이 붙은 파일(…js?v=2.12.2)은 저장본을 바로 보여 주고, 뒤에서 새로 받아 둠 → 메뉴를 눌렀을 때 화면이 빨리 뜸
  //         버전이 바뀌면 주소가 달라지므로 새 파일을 받음(예전 파일과 섞이지 않음)
  if (req.mode !== 'navigate' && u.searchParams.has('v') && !/\.\d{10,}$/.test(u.searchParams.get('v'))) {
    e.respondWith(caches.open(CACHE).then(cache => cache.match(req).then(hit => {
      const fromNet = fetch(req, { cache: 'no-cache', credentials: 'same-origin' }).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; });
      if (hit) { e.waitUntil(fromNet.catch(() => null)); return hit; }
      return fromNet.catch(() => cache.match(req, { ignoreSearch: true }));
    })));
    return;
  }
  e.respondWith(caches.open(CACHE).then(cache => {
    // v2.12.6 방금(90초 안) 인터넷에서 받은 파일은 다시 묻지 않고 저장본을 바로 씀 → 다른 메뉴로 넘어갈 때 빠름
    //         (첫 화면에서 받은 공통 파일 · 메뉴에 마우스를 올렸을 때 미리 받은 화면)
    if (fresh(url)) return cache.match(url).then(hit => hit || netGet(cache, url));
    if (INFL.has(url)) return INFL.get(url).then(r => r ? cache.match(url) : null).then(hit => hit || netGet(cache, url));
    const fromNet = netGet(cache, url);
    const slow = new Promise(resolve => setTimeout(resolve, 4000));       // 4초 안에 안 오면 저장본으로
    return Promise.race([fromNet.catch(() => null), slow]).then(res =>
      res || cache.match(req, { ignoreSearch: true }).then(hit => hit || fromNet));
  }));
});
