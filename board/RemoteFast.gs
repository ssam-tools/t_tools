/* 쌤 노트 v2.11.0 · 수업 리모컨 빠른 길
   tt_remote_v1(리모컨 명령)·tt_rstate_v1(교실 화면 상태) 두 칸만 시트 대신 캐시(CacheService)에 둡니다.
   - 시트 전체를 읽고 다시 쓰지 않으므로 한 번 주고받는 시간이 크게 줄어듭니다.
   - 서버에는 지금처럼 '잠근 글자'만 오고, 6시간 뒤 자동으로 지워집니다.
   - 쓰는 법: 이 파일을 Apps Script에 새 파일로 추가하고, Code.gs의 doPost 안
       vpull: () => vPull_(req), vpush: () => vPush_(req)
     를
       vpull: () => vFast_(req) || vPull_(req), vpush: () => vFast_(req) || vPush_(req)
     로 바꾼 뒤 [배포 → 배포 관리 → ✏ 수정 → 새 버전 → 배포]. */
const V_FAST = ['tt_remote_v1', 'tt_rstate_v1'];
function vFast_(req) {
  const keys = req.action === 'vpull' ? (req.keys || []) : (req.items || []).map(it => String(it && it.key || ''));
  if (!keys.length || keys.some(k => V_FAST.indexOf(k) < 0)) return null;   // 다른 자료는 원래 길(시트)로
  const id = vFastAuth_(req), cache = CacheService.getScriptCache();
  if (req.action === 'vpull') {
    const since = req.since || {}, items = [];
    keys.forEach(k => {
      const v = cache.get('vr_' + id + '_' + k); if (!v) return;
      const o = JSON.parse(v);
      if (o.ver > Number(since[k] || 0)) items.push({ key: k, ver: o.ver, data: o.data });
    });
    return { items: items, now: Date.now() };
  }
  const res = {};
  req.items.forEach(it => {
    const k = String(it.key), ver = Number(it.ver) || Date.now(), data = String(it.data || '');
    if (data.length > 90000) { res[k] = { ok: false }; return; }
    cache.put('vr_' + id + '_' + k, JSON.stringify({ ver: ver, data: data }), 21600);
    res[k] = { ok: true, ver: ver };
  });
  return { results: res };
}
/* 인증: 처음 한 번은 원래 방식(vAuth_)으로 확인하고, 맞으면 인증값의 해시를 6시간 기억 → 그다음부터 시트를 읽지 않음 */
function vFastAuth_(req) {
  auth_(req.pw);
  const id = vId_(req.id), cache = CacheService.getScriptCache(), ck = 'va_' + id, h = sha256_(req.auth);
  if (cache.get(ck) === h) return id;
  vAuth_(req);
  cache.put(ck, h, 21600);
  return id;
}
