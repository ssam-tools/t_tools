/* 쌤 노트 v2.70 · 매일 자동 백업 (PLAN_자동화 3단계)
   - 처음 한 번 '백업 폴더'를 고르면(크롬·엣지 PC), 그 뒤로 쌤 노트를 켤 때마다 하루 한 번
     "쌤노트_자동백업_YYYYMMDD.json" 을 그 폴더에 저절로 저장하고 최근 14개만 남깁니다(오래된 자동 백업만 지움).
   - 기기 연결(보관함)이 켜진 기기는 자료가 이미 저절로 보관되므로 백업 경고를 띄우지 않습니다(tt.js backup.daysSince).
   - 브라우저가 폴더 허락을 다시 물으면 화면 아래 작은 알림 [허락] 한 번만 누르면 됩니다.
   - 폴더 정보는 이 기기 브라우저(IndexedDB)에만 둡니다. 자료는 이 기기 밖으로 나가지 않습니다.
   TTAutoBk.supported · TTAutoBk.setup() · TTAutoBk.status() → {on, name, last} · TTAutoBk.off() */
var TTAutoBk = window.TTAutoBk || (function(){
  "use strict";
  if(!window.TT || TT.classroom) return null;
  var KEEP = 14, PRE = "쌤노트_자동백업_", META = "sn_autobk", DB = "ttautobk", ST = "h";
  var supported = !!(window.showDirectoryPicker && window.indexedDB);
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function today(){ var d = new Date(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
  function meta(){ try{ return JSON.parse(localStorage.getItem(META) || "{}") || {}; }catch(e){ return {}; } }   // 이 기기 것만(동기화 안 함)
  function setMeta(m){ try{ localStorage.setItem(META, JSON.stringify(m)); }catch(e){} }
  function db(){ return new Promise(function(ok, no){ var r = indexedDB.open(DB, 1); r.onupgradeneeded = function(){ r.result.createObjectStore(ST); }; r.onsuccess = function(){ ok(r.result); }; r.onerror = function(){ no(r.error); }; }); }
  function idb(mode, fn){ return db().then(function(d){ return new Promise(function(ok, no){ var t = d.transaction(ST, mode), s = t.objectStore(ST), q = fn(s); t.oncomplete = function(){ ok(q && q.result); }; t.onerror = function(){ no(t.error); }; }); }); }
  function getH(){ return idb("readonly", function(s){ return s.get("dir"); }).catch(function(){ return null; }); }
  function putH(h){ return idb("readwrite", function(s){ return s.put(h, "dir"); }); }

  function write(dir){
    var name = PRE + today() + ".json", body = JSON.stringify(TT.backup.make());
    return dir.getFileHandle(name, {create: true}).then(function(f){ return f.createWritable(); })
      .then(function(w){ return w.write(body).then(function(){ return w.close(); }); })
      .then(function(){ return prune(dir); })
      .then(function(){ var m = meta(); m.last = Date.now(); m.day = today(); m.name = dir.name; setMeta(m); TT.store.setRaw("tt_last_backup", new Date().toISOString()); hideAsk(); return true; });
  }
  function prune(dir){
    var L = [];
    return (async function(){ for await (var e of dir.values()){ if(e.kind === "file" && e.name.indexOf(PRE) === 0 && /\.json$/.test(e.name)) L.push(e.name); } })()
      .then(function(){ L.sort(); var del = L.slice(0, Math.max(0, L.length - KEEP)); return Promise.all(del.map(function(n){ return dir.removeEntry(n).catch(function(){}); })); })
      .catch(function(){});
  }
  /* 하루 한 번 (허락이 살아 있으면 조용히) */
  function daily(){
    var m = meta(); if(!supported || !m.on || m.day === today() || !TT.backup.hasData()) return;
    getH().then(function(dir){
      if(!dir) return;
      return dir.queryPermission({mode: "readwrite"}).then(function(p){
        if(p === "granted") return write(dir);
        showAsk(dir);                                                   // 브라우저를 다시 켜면 한 번 더 물을 수 있음 → 단추 하나
      });
    }).catch(function(){});
  }
  var askEl = null;
  function showAsk(dir){
    if(askEl || !document.body) return;
    askEl = document.createElement("div"); askEl.className = "ttbk-ask"; askEl.setAttribute("role", "status");
    askEl.style.cssText = "position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:9998;background:var(--t-card,#fff);color:var(--t-text,#222);border:1px solid var(--t-line,#ddd);border-radius:999px;padding:6px 8px 6px 14px;font-size:13px;box-shadow:0 4px 18px rgba(0,0,0,.12);display:flex;gap:8px;align-items:center";
    askEl.innerHTML = '<span>💾 오늘 자동 백업을 하려면 폴더 허락이 필요해요</span><button type="button" style="border:0;border-radius:999px;padding:4px 12px;background:var(--t-accent,#2563eb);color:#fff;font:inherit;cursor:pointer">허락</button><button type="button" aria-label="닫기" style="border:0;background:transparent;font:inherit;cursor:pointer;color:var(--t-sub,#666)">✕</button>';
    var b = askEl.querySelectorAll("button");
    b[0].onclick = function(){ dir.requestPermission({mode: "readwrite"}).then(function(p){ if(p === "granted") return write(dir).then(function(){ TT.ui.toast("💾 오늘 자동 백업을 저장했어요"); }); }).catch(function(){}); };
    b[1].onclick = hideAsk;
    document.body.appendChild(askEl);
  }
  function hideAsk(){ if(askEl){ askEl.remove(); askEl = null; } }

  function setup(){
    if(!supported){ TT.ui.toast("이 브라우저는 자동 백업 폴더를 쓸 수 없어요 (PC 크롬·엣지에서 돼요)"); return Promise.resolve(false); }
    return window.showDirectoryPicker({id: "ttautobk", mode: "readwrite", startIn: "documents"}).then(function(dir){
      return putH(dir).then(function(){ var m = meta(); m.on = true; m.day = ""; setMeta(m); return write(dir); })
        .then(function(){ TT.ui.toast("💾 '" + dir.name + "' 폴더에 매일 저절로 백업해요 (최근 " + KEEP + "개)"); try{ window.dispatchEvent(new Event("tt-home-change")); }catch(e){} return true; });
    }).catch(function(){ return false; });
  }
  function off(){ var m = meta(); m.on = false; setMeta(m); idb("readwrite", function(s){ return s.delete("dir"); }).catch(function(){}); }

  if(document.readyState === "complete") setTimeout(daily, 2500); else window.addEventListener("load", function(){ setTimeout(daily, 2500); });
  document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "visible") daily(); });

  return {supported: supported, setup: setup, off: off, run: daily, KEEP: KEEP,
    status: function(){ var m = meta(); return {on: !!m.on, name: m.name || "", last: m.last || 0}; }};
})();
