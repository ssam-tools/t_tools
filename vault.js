/* 쌤 노트 · 보관함 동기화 엔진
   shared/sync.html(숨은 작은 창) 안에서만 실행됩니다. 바깥 화면은 window.Vault 를 불러 씁니다.

   [잠그는 방식]
   · 선생님 비밀 문구 → PBKDF2(31만 번) → 열쇠 512비트: 앞 256비트 = 암호화 열쇠(AES-GCM), 뒤 256비트 = 서버 인증값
   · 자료는 gzip으로 줄인 뒤 AES-GCM으로 잠그고, "ID|자료 이름"을 함께 묶어(다른 칸으로 바꿔치기 못 하게) 보냅니다.
   · 서버(학교 업무판 구글 시트)에는 잠긴 글자와 인증값의 해시만 남습니다. 비밀 문구·암호화 열쇠는 기기 밖으로 나가지 않습니다.

   [기기 종류]
   · 내 기기(personal): 교무실 PC·휴대폰. 모든 tt_ 자료를 동기화하고, 열쇠를 이 기기에 기억(ttv_vault).
   · 교실 기기(classroom): 전자칠판 등 공용. 수업에 필요한 자료(CLASS_KEYS)만 받고, 열쇠는 창을 닫으면 사라지는 곳(sessionStorage)에만 둠.
     잠그면 받은 자료를 이 기기에서 모두 지움.

   [합치는 규칙] 자료 이름(tt_…)마다 더 나중에 고친 쪽이 이깁니다. */
(function () {
  'use strict';
  var DEV = 'ttv_device', CFG = 'ttv_vault', SES = 'ttv_session', META = 'ttv_meta', SRV = 'ttv_server';
  var LOCAL_ONLY = ['tt_board_v1', 'tt_board_cache_v1', 'tt_last_backup', 'tt_probe', 'tt_mode', 'tt_ui_v1'];
  var CLASS_KEYS = ['tt_roster_v1', 'tt_timetable_v1', 'tt_journal_v1', 'tt_group_v1', 'tt_school_v1', 'tt_class_v1', 'tt_duty_v1', 'tt_calendar_v1'];
  var URL_RE = /^https:\/\/script\.google\.com\/(?:a\/macros\/[^\/?#\s]+|macros)\/s\/[\w-]+\/exec$/;
  var ITER = 310000, IDLE_MS = 20 * 60 * 1000;
  var enc = new TextEncoder(), dec = new TextDecoder();

  function J(s) { try { return JSON.parse(s); } catch (e) { return null; } }
  var LS = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
  var SS = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} } };
  function b64(u8) { var s = ''; for (var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function hex(u8) { return Array.prototype.map.call(u8, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }

  /* ---------- 상태 ---------- */
  var st = { busy: false, last: 0, error: '', pulled: 0 };
  function mode() { return LS.get(DEV) === 'classroom' ? 'classroom' : (J(LS.get(CFG)) ? 'personal' : ''); }
  function active() {
    if (mode() === 'classroom') { var s = J(SS.get(SES)); return s && s.k ? s : null; }
    return J(LS.get(CFG));
  }
  function metaStore() { return mode() === 'classroom' ? SS : LS; }
  function getMeta() { var m = J(metaStore().get(META)); var c = active(); return m && c && m.id === c.id ? m : { id: c ? c.id : '', keys: {} }; }
  function saveMeta(m) { metaStore().set(META, JSON.stringify(m)); }
  function allowed(k) {
    if (!/^tt_[a-z0-9_]{1,40}$/.test(k) || LOCAL_ONLY.indexOf(k) >= 0) return false;
    return mode() === 'classroom' ? CLASS_KEYS.indexOf(k) >= 0 : true;
  }
  function localKeys() {
    var out = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && allowed(k)) out.push(k); } } catch (e) {}
    return out;
  }
  function tell(type, extra) {
    var msg = Object.assign({ tt: 'vault', type: type, status: status() }, extra || {});
    try { if (window.parent && window.parent !== window) window.parent.postMessage(msg, location.origin); } catch (e) {}
  }
  function status() { var c = active(); return { mode: mode(), id: c ? c.id : '', busy: st.busy, last: st.last, error: st.error }; }

  /* ---------- 암호 ---------- */
  async function derive(pass, saltB64) {
    var base = await crypto.subtle.importKey('raw', enc.encode(String(pass).normalize('NFC')), 'PBKDF2', false, ['deriveBits']);
    var bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(saltB64), iterations: ITER }, base, 512));
    return { k: b64(bits.slice(0, 32)), auth: hex(bits.slice(32)) };
  }
  var keyCache = {};
  async function aes(kB64) { return keyCache[kB64] || (keyCache[kB64] = await crypto.subtle.importKey('raw', unb64(kB64), 'AES-GCM', false, ['encrypt', 'decrypt'])); }
  async function gz(u8, pack) {
    var s = new Blob([u8]).stream().pipeThrough(pack ? new CompressionStream('gzip') : new DecompressionStream('gzip'));
    return new Uint8Array(await new Response(s).arrayBuffer());
  }
  async function seal(c, key, text) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: enc.encode(c.id + '|' + key) }, await aes(c.k), await gz(enc.encode(text), true)));
    return 'v1.' + b64(iv) + '.' + b64(ct);
  }
  async function unseal(c, key, data) {
    var p = String(data).split('.');
    if (p[0] !== 'v1' || p.length !== 3) throw new Error('알 수 없는 형식');
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(p[1]), additionalData: enc.encode(c.id + '|' + key) }, await aes(c.k), unb64(p[2]));
    return dec.decode(await gz(new Uint8Array(pt), false));
  }
  async function sha(text) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text)))); }

  /* ---------- 서버 ---------- */
  function server() { return J(LS.get(SRV)) || {}; }
  async function call(action, body) {
    var s = server();
    if (!s.url || !URL_RE.test(s.url) || !s.pw) throw new Error('NOSERVER');
    var res = await fetch(s.url, { method: 'POST', redirect: 'follow', credentials: 'omit', cache: 'no-store',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action: action, pw: s.pw }, body)) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var j = J(await res.text());
    if (!j) throw new Error('NOVAULT');
    if (!j.ok) throw new Error(j.error || '알 수 없는 오류');
    return j;
  }
  function errText(e) {
    var m = String(e && e.message || e);
    if (m === 'NOSERVER') return '학교 업무판 주소와 학교 비밀번호가 필요해요.';
    if (m === 'NOVAULT') return '업무판에 보관함 기능이 아직 없어요. 업무판 Code.gs를 새 버전으로 바꿔 주세요.';
    if (m.indexOf('VAUTH') >= 0) return '비밀 문구가 맞지 않아요.';
    if (m.indexOf('VNOUSER') >= 0) return '보관함에 없는 ID예요.';
    if (m.indexOf('AUTH') >= 0) return '학교 비밀번호가 맞지 않아요.';
    if (e instanceof TypeError || /Failed to fetch|NetworkError|Load failed/i.test(m)) return '인터넷이나 업무판에 연결할 수 없어요.';
    return m;
  }

  /* ---------- 동기화 ---------- */
  /* 마지막으로 맞춘 뒤 이 기기에서 바뀐 자료는 "방금 고침"으로 표시 */
  async function markLocal() {
    var meta = getMeta(), ch = false;
    for (var k of localKeys().concat(Object.keys(meta.keys))) {
      if (!allowed(k)) continue;
      var v = LS.get(k), h = v == null ? '' : await sha(v), m = meta.keys[k] || { ver: 0, h: '' };
      if (h !== m.h && !m.d) { m.d = Date.now(); meta.keys[k] = m; ch = true; }
    }
    if (ch) saveMeta(meta);
  }
  async function pull() {
    var c = active(); if (!c) return [];
    var meta = getMeta(), since = {};
    Object.keys(meta.keys).forEach(function (k) { since[k] = meta.keys[k].ver || 0; });
    var j = await call('vpull', { id: c.id, auth: c.auth, since: since, keys: mode() === 'classroom' ? CLASS_KEYS : undefined });
    var changed = [];
    for (var it of j.items || []) {
      if (!allowed(it.key)) continue;
      var m = meta.keys[it.key] || { ver: 0, h: '' };
      if (it.ver <= (m.ver || 0)) continue;
      var obj = J(await unseal(c, it.key, it.data)); if (!obj) continue;
      var local = LS.get(it.key), lh = local == null ? '' : await sha(local);
      if (lh !== m.h && m.d && m.d > it.ver) { meta.keys[it.key] = Object.assign(m, { ver: it.ver }); continue; }   // 이 기기에서 더 나중에 고침 → 올림
      if (obj.v == null) LS.del(it.key); else LS.set(it.key, obj.v);
      meta.keys[it.key] = { ver: it.ver, h: obj.v == null ? '' : await sha(obj.v) };
      if (lh !== meta.keys[it.key].h) changed.push(it.key);
    }
    saveMeta(meta);
    return changed;
  }
  async function push() {
    var c = active(); if (!c) return;
    var meta = getMeta(), items = [], size = 0;
    var keys = Array.from(new Set(localKeys().concat(Object.keys(meta.keys)))).filter(allowed);
    for (var k of keys) {
      var v = LS.get(k), h = v == null ? '' : await sha(v), m = meta.keys[k] || { ver: 0, h: '' };
      if (h === m.h) { if (m.d) { delete m.d; meta.keys[k] = m; } continue; }
      if (v == null && !m.ver) continue;
      var ver = Math.max(Date.now(), (m.ver || 0) + 1), data = await seal(c, k, JSON.stringify({ v: v }));
      items.push({ key: k, ver: ver, data: data, h: h }); size += data.length;
      if (size > 3000000 || items.length >= 30) break;
    }
    if (!items.length) { saveMeta(meta); return 0; }
    var j = await call('vpush', { id: c.id, auth: c.auth, items: items.map(function (x) { return { key: x.key, ver: x.ver, data: x.data }; }) });
    var rejected = 0;
    items.forEach(function (x) {
      var r = j.results && j.results[x.key];
      if (r && r.ok) meta.keys[x.key] = { ver: x.ver, h: x.h }; else rejected++;
    });
    saveMeta(meta);
    return rejected;
  }
  var running = null;
  function sync() {
    if (running) return running;
    if (!active()) return Promise.resolve();
    st.busy = true; tell('status');
    running = (async function () {
      try {
        await markLocal();
        var changed = await pull();
        var rej = await push();
        if (rej) { changed = changed.concat(await pull()); await push(); }
        st.last = Date.now(); st.error = '';
        if (changed.length) tell('changed', { keys: changed });
      } catch (e) { st.error = errText(e); }
      st.busy = false; running = null; tell('status');
    })();
    return running;
  }

  /* ---------- 교실 기기 ---------- */
  var KEEP = ['tt_board_v1', 'tt_mode'];
  function wipeLocal() {
    var del = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf('tt_') === 0 && KEEP.indexOf(k) < 0) del.push(k); } } catch (e) {}
    del.forEach(function (k) { LS.del(k); });
    SS.del(SES); SS.del(META);
  }

  /* ---------- 바깥 화면이 부르는 기능 ---------- */
  async function login(o, wantMode) {
    var s = { url: String(o.url || server().url || '').trim(), pw: String(o.pw || server().pw || '') };
    if (!URL_RE.test(s.url)) throw new Error('업무판 주소는 https://script.google.com/…/exec 형태여야 해요.');
    if (!s.pw) throw new Error('학교 비밀번호를 넣어 주세요.');
    LS.set(SRV, JSON.stringify(s));
    var id = String(o.id || '').trim().toLowerCase(), pass = String(o.pass || '');
    if (!/^[a-z0-9_.-]{3,30}$/.test(id)) throw new Error('ID는 영문 소문자·숫자 3~30자로 정해 주세요.');
    if (pass.length < 8) throw new Error('비밀 문구는 8자 이상이어야 해요.');
    var info = await call('vinfo', { id: id }), salt, d;
    if (!info.exists) {
      if (wantMode === 'classroom') throw new Error('보관함에 없는 ID예요. 먼저 내 기기(교무실 PC)에서 보관함을 만들어 주세요.');
      if (!o.create) return { needCreate: true };
      salt = b64(crypto.getRandomValues(new Uint8Array(16)));
      d = await derive(pass, salt);
      await call('vreg', { id: id, salt: salt, auth: d.auth });
    } else {
      salt = info.salt; d = await derive(pass, salt);
      await call('vpull', { id: id, auth: d.auth, since: {}, keys: ['tt__check'] });   // 비밀 문구 확인
    }
    return { id: id, salt: salt, k: d.k, auth: d.auth, created: !info.exists };
  }
  var Vault = {
    status: status,
    /* 내 기기 연결. 처음이면 o.create=true 로 다시 부름. 이미 있는 보관함이면 보관함 내용이 우선(이 기기에만 있던 자료는 올림) */
    connectPersonal: async function (o) {
      try {
        var r = await login(o, 'personal'); if (r.needCreate) return r;
        LS.set(DEV, 'personal'); LS.set(CFG, JSON.stringify({ id: r.id, salt: r.salt, k: r.k, auth: r.auth }));
        LS.del(META); keyCache = {};
        await sync();
        if (st.error) return { error: st.error };
        startLoop();
        return { ok: true, created: r.created };
      } catch (e) { return { error: errText(e) }; }
    },
    /* 교실 기기로 정하기(전자칠판). 이 기기의 학생 자료는 지움 */
    setClassroom: function (o) {
      var s = { url: String(o.url || '').trim(), pw: String(o.pw || '') };
      if (!URL_RE.test(s.url)) return { error: '업무판 주소는 https://script.google.com/…/exec 형태여야 해요.' };
      if (!s.pw) return { error: '학교 비밀번호를 넣어 주세요.' };
      LS.set(SRV, JSON.stringify(s)); LS.del(CFG); LS.del(META); wipeLocal(); LS.set(DEV, 'classroom');
      return { ok: true };
    },
    /* 교실 기기에서 수업 시작 */
    unlock: async function (o) {
      try {
        wipeLocal();
        var r = await login(o, 'classroom');
        SS.set(SES, JSON.stringify({ id: r.id, k: r.k, auth: r.auth, last: Date.now() }));
        keyCache = {};
        await sync();
        if (st.error) { wipeLocal(); return { error: st.error }; }
        startLoop();
        return { ok: true };
      } catch (e) { wipeLocal(); return { error: errText(e) }; }
    },
    /* 교실 기기: 수업 끝(잠그기) — 남은 변경을 올린 뒤 지움 */
    lock: async function () {
      try { if (active()) await sync(); } catch (e) {}
      wipeLocal(); tell('status'); return { ok: true };
    },
    syncNow: function () { return sync().then(status); },
    /* 이 기기 연결 끊기 (내 기기: 자료는 이 기기에 남음 / 교실 기기: 일반 기기로 되돌림) */
    disconnect: function () {
      if (mode() === 'classroom') wipeLocal();
      LS.del(CFG); LS.del(META); LS.del(DEV); keyCache = {}; tell('status'); return { ok: true };
    },
    /* 보관함 지우기 (서버의 내 자료와 ID를 모두 지움) */
    wipeServer: async function () {
      var c = active(); if (!c) return { error: '연결되어 있지 않아요.' };
      try { await call('vwipe', { id: c.id, auth: c.auth }); Vault.disconnect(); return { ok: true }; }
      catch (e) { return { error: errText(e) }; }
    },
    server: function () { var s = server(); return { url: s.url || '', hasPw: !!s.pw }; },
    IDLE_MS: IDLE_MS, CLASS_KEYS: CLASS_KEYS
  };
  window.Vault = Vault;

  /* ---------- 자동 동기화 ---------- */
  var loopOn = false, pushT = null;
  function startLoop() {
    if (loopOn) return; loopOn = true;
    setInterval(function () { if (active() && !(window.parent && window.parent.document && window.parent.document.hidden)) sync(); }, 30000);
  }
  /* 바깥 화면(도구)이 자료를 고치면 2초 뒤 올림 */
  window.addEventListener('storage', function (e) {
    if (!e.key || !allowed(e.key) || !active()) return;
    clearTimeout(pushT); pushT = setTimeout(sync, 2000);
  });
  if (active()) { startLoop(); sync(); }
  tell('ready');
})();
