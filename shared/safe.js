/* 쌤 노트 v2.52 · 🔐 학교 금고 (PLAN_금고 4~8단계)
   - 공용 계정(사이트·아이디·비밀번호), 연락처(동의한 분만), 보안 안내를 '금고 문구'로 이 기기 안에서 잠그고 풉니다.
     학교 업무판(board/Admin.gs)에는 잠긴 글자만 있습니다. 금고 문구는 기기 밖으로 나가지 않습니다.
   - 내 기기(교무실 PC·휴대폰): 문구를 처음 한 번 넣으면 기억(ttsafe_k). 교실 기기: 금고를 받지도 보여 주지도 않음.
   - 저장 이름은 모두 ttsafe_… (tt_ 밖) → 전체 백업 파일·보관함 동기화에 들어가지 않습니다.
   - 연 금고는 메모리에만 두고, 10분 동안 쓰지 않으면 다시 잠급니다. 복사한 비밀번호는 30초 뒤 클립보드에서 지웁니다.
   - 선택: 지문·Windows Hello(기기 잠금)로 열 때마다 확인 — 기억해 둔 문구를 남이 쓰지 못하게. */
(function(){
  "use strict";
  if(window.TT_SAFE) return;
  var APP = "ssamnote-safe", ITER = 310000, IDLE = 10 * 60000;
  var KP = "ttsafe_k", KC = "ttsafe_c", KW = "ttsafe_wa";
  var enc = new TextEncoder(), dec = new TextDecoder();
  var mem = null, timer = 0, subs = [];
  function LS(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function LSset(k, v){ try{ if(v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); }catch(e){} }
  function J(s){ try{ return JSON.parse(s); }catch(e){ return null; } }
  function room(){ return !!(window.TT && TT.classroom) || LS("ttv_device") === "classroom"; }
  function A(){ return window.TT_ADMIN; }

  /* ── 잠그기·풀기 (학교 세팅과 같은 방식, 다른 이름표) ── */
  function b64(u8){ var s = ""; for(var i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(s){ var b = atob(s), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  function keyOf(pass, salt, iter){
    return crypto.subtle.importKey("raw", enc.encode(String(pass).normalize("NFC")), "PBKDF2", false, ["deriveKey"]).then(function(base){
      return crypto.subtle.deriveKey({name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: iter}, base, {name: "AES-GCM", length: 256}, false, ["encrypt", "decrypt"]);
    });
  }
  function lock(obj, pass){
    var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    return keyOf(pass, salt, ITER).then(function(k){ return crypto.subtle.encrypt({name: "AES-GCM", iv: iv, additionalData: enc.encode(APP)}, k, enc.encode(JSON.stringify(obj))); })
      .then(function(ct){ return JSON.stringify({salt: b64(salt), iter: ITER, iv: b64(iv), ct: b64(new Uint8Array(ct))}); });
  }
  function unlock(text, pass){
    var f = typeof text === "string" ? J(text) : text; if(!f || !f.ct) return Promise.reject(new Error("EMPTY"));
    return keyOf(pass, unb64(f.salt), +f.iter || ITER).then(function(k){ return crypto.subtle.decrypt({name: "AES-GCM", iv: unb64(f.iv), additionalData: enc.encode(APP)}, k, unb64(f.ct)); })
      .then(function(pt){ return JSON.parse(dec.decode(new Uint8Array(pt))); }, function(){ throw new Error("PHRASE"); });
  }
  function blank(){ return {v: 1, acc: [], ppl: [], info: []}; }
  function norm(d){ d = d || {}; return {v: 1, acc: Array.isArray(d.acc) ? d.acc : [], ppl: Array.isArray(d.ppl) ? d.ppl : [], info: Array.isArray(d.info) ? d.info : []}; }

  /* ── 상태 ── */
  function cache(){ return J(LS(KC)) || null; }
  function phrase(){ return room() ? "" : (LS(KP) || ""); }
  function status(){ var c = cache(); return {room: room(), remembered: !!phrase(), cached: !!(c && c.data), ver: c ? c.ver : 0, open: !!mem, wa: waOn()}; }
  function fire(){ subs.forEach(function(f){ try{ f(status()); }catch(e){} }); }
  function touch(){ if(!mem) return; clearTimeout(timer); timer = setTimeout(close, IDLE); }
  function close(){ mem = null; clearTimeout(timer); fire(); }
  function forget(){ LSset(KP, null); LSset(KC, null); LSset(KW, null); close(); }

  /* 서버에서 새 판 확인 (긴급 잠금이면 이 기기에서 금고·문구를 지움) — 인터넷이 안 되면 기억해 둔 잠긴 판으로 */
  function latest(){
    if(!A()) return Promise.resolve(cache());
    return A().api("vltver").then(function(m){
      var c = cache();
      if(m.wiped){ forget(); return {wiped: true}; }
      if(!m.ver){ LSset(KC, null); return null; }
      if(c && c.ver === m.ver) return c;
      return A().api("vltget").then(function(r){ var n = {ver: r.ver, kv: r.kv || 1, data: r.data}; if(!room()) LSset(KC, JSON.stringify(n)); return n; });
    }, function(e){ var c = cache(); if(c && c.data) return c; throw e; });
  }
  /* 열기: pass(새로 넣은 문구) 없으면 기억한 문구 · remember=내 기기에 기억 */
  function open(pass, remember){
    if(room()) return Promise.reject(new Error("ROOM"));
    var given = !!pass, p = pass || phrase();
    var gate = !given && waOn() ? waCheck() : Promise.resolve();
    return gate.then(latest).then(function(c){
      if(c && c.wiped) throw new Error("WIPED");
      if(!c || !c.data) throw new Error("EMPTY");
      if(!p) throw new Error("NEED");
      return unlock(c.data, p).then(function(d){
        if(given && remember) LSset(KP, p);
        mem = {d: norm(d), ver: c.ver, kv: c.kv || 1, p: p}; touch(); fire();
        return mem.d;
      }, function(e){ if(!given) LSset(KP, null); throw e; });   // 기억한 문구가 안 맞으면(문구가 바뀜) 잊기
    });
  }
  function data(){ touch(); return mem ? mem.d : null; }

  /* ── 관리자: 새로 만들기 · 고쳐 올리기 · 문구 바꾸기 ── */
  function save(d, opt){
    opt = opt || {};
    if(!A()) return Promise.reject(new Error("NOBOARD"));
    var p = opt.newPass || (mem && mem.p) || opt.pass; if(!p) return Promise.reject(new Error("NEED"));
    var base = opt.base != null ? opt.base : (mem ? mem.ver : 0), kv = (mem ? mem.kv : (opt.kv || 1)) + (opt.newPass && mem ? 1 : 0);
    return lock(norm(d), p).then(function(t){ return A().call("vltput", {d: t, base: base, kv: kv, sum: opt.sum || ""}).then(function(r){
      var n = {ver: r.ver, kv: r.kv, data: t}; if(!room()) LSset(KC, JSON.stringify(n));
      if(opt.newPass && phrase()) LSset(KP, p);
      mem = {d: norm(d), ver: r.ver, kv: r.kv, p: p}; touch(); fire();
      return r;
    }); });
  }
  function wipe(){ return A().call("vltwipe").then(function(r){ forget(); return r; }); }

  /* ── 복사: 30초 뒤 클립보드 지우기 ── */
  var clipT = 0, clipV = "";
  function copy(v){
    touch();
    return navigator.clipboard.writeText(String(v)).then(function(){
      clipV = String(v); clearTimeout(clipT);
      clipT = setTimeout(clearClip, 30000);
    });
  }
  function clearClip(){
    if(!clipV) return;
    var done = function(){ clipV = ""; };
    if(document.hasFocus()) navigator.clipboard.writeText("").then(done, function(){});
    else window.addEventListener("focus", function f(){ window.removeEventListener("focus", f); clearClip(); });
  }
  window.addEventListener("pagehide", function(){ if(clipV) try{ navigator.clipboard.writeText(""); }catch(e){} });

  /* ── 지문·Windows Hello (선택) — 이 기기의 잠금으로 확인만 함 ── */
  function waOn(){ var w = J(LS(KW)); return !!(w && w.id); }
  function waAvail(){
    return window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ? PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(function(){ return false; }) : Promise.resolve(false);
  }
  function rnd(n){ return crypto.getRandomValues(new Uint8Array(n)); }
  function waEnable(){
    return navigator.credentials.create({publicKey: {challenge: rnd(32), rp: {name: "쌤 노트"}, user: {id: rnd(16), name: "ssamnote-safe", displayName: "쌤 노트 금고"},
      pubKeyCredParams: [{type: "public-key", alg: -7}, {type: "public-key", alg: -257}], authenticatorSelection: {authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged"}, timeout: 60000}})
      .then(function(c){ LSset(KW, JSON.stringify({id: b64(new Uint8Array(c.rawId))})); fire(); });
  }
  function waCheck(){
    var w = J(LS(KW)); if(!w || !w.id) return Promise.resolve();
    return navigator.credentials.get({publicKey: {challenge: rnd(32), allowCredentials: [{type: "public-key", id: unb64(w.id)}], userVerification: "required", timeout: 60000}})
      .then(function(){}, function(){ throw new Error("WA"); });
  }
  function waOff(){ LSset(KW, null); fire(); }

  function errText(e){
    var m = String(e && e.message || e);
    return {ROOM: "교실 기기(공용)에서는 금고를 열 수 없어요.", NEED: "금고 문구를 넣어 주세요. (담당자가 따로 알려 준 문구)", PHRASE: "금고 문구가 맞지 않아요. 문구가 바뀌었으면 담당자께 새 문구를 받아 주세요.",
            EMPTY: "아직 만들어진 금고가 없어요. 관리자가 🛡️ 관리 → 🔐 금고에서 만들어요.", WIPED: "금고가 긴급 잠금되었어요. 관리자가 새로 만들 때까지 기다려 주세요.",
            WA: "지문·기기 잠금 확인을 하지 못했어요."}[m] || (A() ? A().errText(e) : m);
  }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  /* 공용 계정 비밀번호 만들어 주기 (관리자 편집용) */
  function gen(n){ var C = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%", r = rnd(n || 14), s = ""; for(var i = 0; i < r.length; i++) s += C[r[i] % C.length]; return s; }

  window.TT_SAFE = {lock: lock, unlock: unlock, status: status, open: open, data: data, close: close, forget: forget, touch: touch, save: save, wipe: wipe, latest: latest,
    copy: copy, waAvail: waAvail, waEnable: waEnable, waOff: waOff, waOn: waOn, errText: errText, blank: blank, uid: uid, gen: gen, room: room, on: function(f){ subs.push(f); },
    ver: function(){ return mem ? mem.ver : (cache() || {}).ver || 0; }};
})();
