/* 쌤 노트 · 자료실 빠르게 (v2.39.1)
   학교 자료실 파일은 학교 업무판(구글 앱스 스크립트)이 드라이브에서 꺼내 보내 주므로 처음에는 몇 초 걸립니다.
   · 한 번 본 파일은 이 기기(IndexedDB "tt_libfiles")에 넣어 두고, 다음부터는 바로 보여 줍니다.
     자료실 파일은 고치면 새 자료(새 id)로 올라가므로, 같은 id면 내용이 같습니다(학교 드라이브 폴더 자료는 수정 시각으로 확인).
   · ★ 자주 보는 문서는 쌤 노트를 켜 두면 쉬는 동안 미리 받아 둡니다(한 번에 하나씩, 휴대폰 데이터 절약 모드에서는 안 함).
   · 자료 목록도 넣어 두었다가 먼저 보여 주고, 뒤에서 새로 확인합니다.
   · 교실 기기(전자칠판 등 공용)에는 저장하지 않습니다. 이 저장소는 전체 백업·동기화에 들어가지 않습니다.
   · 학교 공용 자료만 다룹니다(학생 자료는 자료실에 올리지 않는 것이 약속). 최대 60개 · 200MB, 오래 안 본 것부터 지움. */
(function(){
  "use strict";
  if(window.TT_LIBC) return;
  var DB = "tt_libfiles", ST = "f", MAXN = 60, MAXB = 200 * 1048576, mem = {};
  var shared = (function(){ try{ return localStorage.getItem("ttv_device") === "classroom"; }catch(e){ return false; } })();
  function open(){
    return new Promise(function(res, rej){
      if(!window.indexedDB) return rej(new Error("no idb"));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function(){ r.result.createObjectStore(ST); };
      r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); };
    });
  }
  function tx(mode, fn){
    return open().then(function(db){ return new Promise(function(res, rej){
      var t = db.transaction(ST, mode), st = t.objectStore(ST), out = fn(st);
      t.oncomplete = function(){ db.close(); res(out && "result" in out ? out.result : out); };
      t.onerror = function(){ db.close(); rej(t.error); };
    }); });
  }
  function all(){
    return open().then(function(db){ return new Promise(function(res){
      var out = [], t = db.transaction(ST, "readonly"), c = t.objectStore(ST).openCursor();
      c.onsuccess = function(){ var cur = c.result; if(cur){ var v = cur.value || {}; if(v.bytes != null) out.push({k: cur.key, bytes: v.bytes, used: v.used || 0}); cur.continue(); } };
      t.oncomplete = function(){ db.close(); res(out); }; t.onerror = function(){ db.close(); res(out); };
    }); }).catch(function(){ return []; });
  }
  function trim(){
    return all().then(function(L){
      L.sort(function(a, b){ return b.used - a.used; });
      var sum = 0, drop = [];
      L.forEach(function(x, i){ sum += x.bytes; if(i >= MAXN || sum > MAXB) drop.push(x.k); });
      if(drop.length) return tx("readwrite", function(st){ drop.forEach(function(k){ st.delete(k); }); });
    }).catch(function(){});
  }
  /* 파일: key = 갈래("lib"·"dr") + ":" + id, ver 가 다르면(드라이브 폴더 파일을 고친 경우) 없는 것으로 봄 */
  function get(key, ver){
    var m = mem[key]; if(m && (!ver || !m.ver || m.ver === ver)) return Promise.resolve(m);
    if(shared) return Promise.resolve(null);
    return tx("readonly", function(st){ return st.get(key); }).then(function(v){
      if(!v || !v.buf || (ver && v.ver && v.ver !== ver)) return null;
      var f = {name: v.name, mime: v.mime, u8: new Uint8Array(v.buf), ver: v.ver};
      mem = {}; mem[key] = f;
      tx("readwrite", function(st){ v.used = Date.now(); st.put(v, key); }).catch(function(){});
      return f;
    }).catch(function(){ return null; });
  }
  function put(key, f, ver){
    mem = {}; mem[key] = {name: f.name, mime: f.mime, u8: f.u8, ver: ver || ""};
    if(shared || !f.u8 || f.u8.length > 60 * 1048576) return Promise.resolve();
    var buf = f.u8.buffer.slice(f.u8.byteOffset, f.u8.byteOffset + f.u8.byteLength);
    return tx("readwrite", function(st){ st.put({name: f.name, mime: f.mime, buf: buf, bytes: buf.byteLength, ver: ver || "", used: Date.now()}, key); }).then(trim).catch(function(){});
  }
  function has(key){
    if(mem[key]) return Promise.resolve(true);
    if(shared) return Promise.resolve(false);
    return tx("readonly", function(st){ return st.getKey(key); }).then(function(k){ return k !== undefined; }).catch(function(){ return false; });
  }
  /* 목록(자료 이름·분류 등 공용 정보)은 localStorage 대신 여기에 — 다음에 열 때 먼저 보여 줌 */
  function listGet(name){ if(shared) return Promise.resolve(null); return tx("readonly", function(st){ return st.get("list:" + name); }).then(function(v){ return v && v.items ? v : null; }).catch(function(){ return null; }); }
  function listPut(name, items, extra){ if(shared) return Promise.resolve(); return tx("readwrite", function(st){ st.put({items: items, extra: extra || null, at: Date.now()}, "list:" + name); }).catch(function(){}); }
  /* 목록에 없는(지워진) 자료는 저장본도 지움 */
  function prune(kind, ids){
    if(shared) return;
    var keep = {}; ids.forEach(function(i){ keep[kind + ":" + i] = 1; });
    all().then(function(L){
      var drop = L.filter(function(x){ return String(x.k).indexOf(kind + ":") === 0 && !keep[x.k]; }).map(function(x){ return x.k; });
      if(drop.length) tx("readwrite", function(st){ drop.forEach(function(k){ st.delete(k); }); }).catch(function(){});
    });
  }

  /* 업무판에 파일을 달라고 하고, 받는 만큼 진행을 알려 줌(onProg(받은 바이트, 예상 바이트)) */
  function fetchB64(url, body, approx, onProg){
    return fetch(url, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(body)}).then(function(r){
      if(!r.body || !r.body.getReader || !onProg) return r.json();
      var rd = r.body.getReader(), parts = [], got = 0, total = (+r.headers.get("content-length") || 0) || (approx ? Math.round(approx * 4 / 3) + 400 : 0);
      function pump(){ return rd.read().then(function(x){
        if(x.done) return;
        parts.push(x.value); got += x.value.length; try{ onProg(got, total); }catch(e){}
        return pump();
      }); }
      return pump().then(function(){
        var all = new Uint8Array(got), o = 0; parts.forEach(function(p){ all.set(p, o); o += p.length; });
        return JSON.parse(new TextDecoder().decode(all));
      });
    }).then(function(j){
      if(!j || !j.ok) throw new Error(j && j.error || "응답 없음");
      var bin = atob(j.data), n = bin.length, u8 = new Uint8Array(n);
      for(var i = 0; i < n; i++) u8[i] = bin.charCodeAt(i);
      return {name: j.name, mime: j.mime, u8: u8};
    });
  }
  function mb(n){ return n >= 1048576 ? (n / 1048576).toFixed(1) + "MB" : Math.max(1, Math.round(n / 1024)) + "KB"; }
  function progText(got, total){ return total ? "⏳ 받는 중… " + mb(Math.min(got, total) * 3 / 4) + " / " + mb(total * 3 / 4) : "⏳ 받는 중… " + mb(got * 3 / 4); }

  /* PDF 보기 프로그램(pdf.js)을 미리 받아 둠 — 처음 [바로 보기] 때 기다리지 않게 */
  var warmed = false;
  function warmViewer(base){
    if(warmed) return; warmed = true;
    var b = base || (window.TT && TT.BASE) || "../../";
    ["shared/vendor/pdfjs/pdf.min.mjs", "shared/vendor/pdfjs/pdf.worker.min.mjs"].forEach(function(f){
      try{ var l = document.createElement("link"); l.rel = "prefetch"; l.href = b + f; document.head.appendChild(l); }catch(e){}
    });
  }

  /* ★ 자주 보는 문서 미리 받기: 업무판이 연결된 내 기기에서만, 쉬는 동안 하나씩 */
  var preRun = false;
  function prefetchStars(){
    if(preRun || shared || !window.TT || !TT.store) return; preRun = true;
    var c = navigator.connection; if(c && (c.saveData || /2g/.test(c.effectiveType || ""))) return;
    if(navigator.onLine === false) return;
    var B = TT.store.get("tt_board_v1", null) || {};
    if(!B.url || !B.pw || !/^https:\/\/script\.google\.com\//.test(B.url)) return;
    var S = (TT.store.get("tt_lib_star_v1", null) || {}).ids || {}, ids = Object.keys(S).slice(0, 12);
    var i = 0;
    function next(){
      if(i >= ids.length) return;
      var id = ids[i++], key = "lib:" + id;
      has(key).then(function(h){
        if(h) return next();
        fetchB64(B.url, {pw: B.pw, action: "libget", id: id}).then(function(f){ return put(key, f, ""); }).catch(function(){}).then(function(){ setTimeout(next, 1500); });
      });
    }
    var idle = window.requestIdleCallback || function(fn){ return setTimeout(fn, 1); };
    setTimeout(function(){ idle(next, {timeout: 8000}); }, 6000);
  }

  /* 첫 화면(쌤비 홈)을 켜 두면 ★ 문서를 미리 받아 둠 */
  if(window.top === window && !/\/apps\//.test(location.pathname)) window.addEventListener("load", function(){ try{ prefetchStars(); }catch(e){} });

  window.TT_LIBC = {get: get, put: put, has: has, listGet: listGet, listPut: listPut, prune: prune, fetchB64: fetchB64, progText: progText, warmViewer: warmViewer, prefetchStars: prefetchStars, shared: shared};
})();
