/* 도전 문제 (고1 3월 모의고사 기출) · 수업 3단계
   어느 화면에서나 불러 쓰는 공통 코드입니다. 먼저 shared/exam-data.js 를 불러온 뒤 이 파일을 불러옵니다.
     TTChallenge.list("ROOT")        → 그 단원의 기출 목록 (쉬운 배점 → 어려운 배점, 최근 연도 먼저)
     TTChallenge.open(list, i, 닫은뒤, 보여줄때)  → 문제 그림을 화면 가득 크게. 누를 때마다 문제 → 정답 → 해설
     TTChallenge.label(it)           → "고1 3월 모의고사 2023년 14번"
     TTChallenge.pickFolder(done)    → [기출 그림 불러오기] (exam 폴더를 고르면 이 기기 브라우저에 저장)
     TTChallenge.importFix(done)     → [고친 단원 불러오기] (exam 화면에서 내보낸 exam-unit-fix.json)
   ⚠️ 기출 그림(exam/img)은 재배포 금지 자료라 GitHub에 올리지 않습니다.
      그림은 ① 이 기기 브라우저 저장소(IndexedDB "tt_exam") ② 쌤 노트 폴더 옆 exam 폴더 순서로 찾습니다.
   저장: "tt_concept_v1" { fix:{문항id: 단원코드}, seen:{문항id: "2026-11-16"} }  (그림은 백업에 넣지 않음) */
(function(){
  "use strict";
  var E = window.EXAM; if(!E){ console.warn("exam-data.js 가 먼저 필요합니다"); return; }
  var ROOT = (function(){ var s = document.currentScript && document.currentScript.src || ""; return s.replace(/shared\/challenge\.js.*$/, ""); })();
  var KEY = "tt_concept_v1";
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || "{}"); }catch(e){ return {}; } }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
  var S = load(); S.fix = S.fix || {}; S.seen = S.seen || {};
  /* exam 화면(같은 주소에서 연 경우)에서 고친 단원도 함께 반영 */
  try{ var ef = JSON.parse(localStorage.getItem("examUnitFix") || "{}"); Object.keys(ef).forEach(function(k){ if(!S.fix[k]) S.fix[k] = ef[k]; }); }catch(e){}
  var U = {}; E.units.forEach(function(u){ U[u.c] = u; });
  function unitOf(it){ return S.fix[it.id] || it.u; }
  function list(code){
    return E.items.filter(function(it){ return unitOf(it) === code; })
      .sort(function(a, b){ return a.pt - b.pt || b.y - a.y || a.n - b.n; });
  }
  function count(code){ return list(code).length; }
  function label(it){ return "고1 3월 모의고사 " + it.y + "년 " + it.n + "번"; }
  function today(){ var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  /* ── 그림 찾기: 브라우저 저장소 → 폴더 ── */
  var DB = null;
  function db(cb){
    if(DB) return cb(DB);
    if(!window.indexedDB) return cb(null);
    var r; try{ r = indexedDB.open("tt_exam", 1); }catch(e){ return cb(null); }
    r.onupgradeneeded = function(){ r.result.createObjectStore("img"); };
    r.onsuccess = function(){ DB = r.result; cb(DB); };
    r.onerror = function(){ cb(null); };
  }
  function idbGet(name, cb){ db(function(d){ if(!d) return cb(null); try{ var q = d.transaction("img").objectStore("img").get(name); q.onsuccess = function(){ cb(q.result || null); }; q.onerror = function(){ cb(null); }; }catch(e){ cb(null); } }); }
  function stored(cb){ db(function(d){ if(!d) return cb(0); try{ var q = d.transaction("img").objectStore("img").count(); q.onsuccess = function(){ cb(q.result || 0); }; q.onerror = function(){ cb(0); }; }catch(e){ cb(0); } }); }
  var BASES = [ROOT + "../exam/", ROOT + "exam/"], okBase = null, urls = {};
  function src(path, cb){                      // path: "img/2023-14.png"
    var name = path.split("/").pop();
    if(urls[name]) return cb(urls[name]);
    idbGet(name, function(blob){
      if(blob){ urls[name] = URL.createObjectURL(blob); return cb(urls[name]); }
      var tries = okBase ? [okBase] : BASES.slice(), i = 0;
      (function next(){
        if(i >= tries.length) return cb(null);
        var b = tries[i++], im = new Image();
        im.onload = function(){ okBase = b; cb(b + path); };
        im.onerror = next; im.src = b + path;
      })();
    });
  }
  /* 그림 파일 여러 개를 이 기기 브라우저에 저장 (폴더 고르기 · 수업 자료 폴더 한 번에 불러오기 공통) */
  function isImg(f){ return /^\d{4}-\d{2}s?\.png$/i.test(f.name); }
  function storeImages(files, done){
    var fs = [].filter.call(files || [], isImg);
    if(!fs.length) return done && done(0);
    db(function(d){
      if(!d) return done && done(0);
      var n = 0;
      (function put(i){
        if(i >= fs.length){ done && done(n); return; }
        var tx = d.transaction("img", "readwrite"); tx.objectStore("img").put(fs[i], fs[i].name.toLowerCase());
        tx.oncomplete = function(){ n++; delete urls[fs[i].name.toLowerCase()]; put(i + 1); };
        tx.onerror = function(){ put(i + 1); };
      })(0);
    });
  }
  function pickFolder(done){
    var inp = document.createElement("input"); inp.type = "file"; inp.multiple = true;
    inp.setAttribute("webkitdirectory", "");
    inp.onchange = function(){
      if(![].some.call(inp.files || [], isImg)){ alert("문제 그림을 찾지 못했습니다.\n수업 자료 폴더(lesson_files)의 exam 폴더나, exam.zip을 푼 폴더를 고르세요."); return; }
      storeImages(inp.files, done);
    };
    inp.click();
  }
  function importFixObj(o){ var n = 0; Object.keys(o || {}).forEach(function(k){ if(U[o[k]]){ S.fix[k] = o[k]; n++; } }); save(); return n; }
  function importFix(done){
    var inp = document.createElement("input"); inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = function(){
      var f = inp.files && inp.files[0]; if(!f) return;
      var rd = new FileReader();
      rd.onload = function(){
        try{
          done && done(importFixObj(JSON.parse(rd.result)));
        }catch(e){ alert("exam-unit-fix.json 파일이 아닙니다."); }
      };
      rd.readAsText(f);
    };
    inp.click();
  }

  /* ── 화면 가득 보기 ── */
  var css = ".chv{position:fixed;inset:0;z-index:500;background:#fff;color:#111;display:none;flex-direction:column;font-family:inherit}"
    + ".chv.on{display:flex}"
    + ".chv .ct{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:2px solid #222;font-size:clamp(18px,2.2vw,30px);font-weight:800}"
    + ".chv .ct small{font-size:.6em;font-weight:600;color:#666}"
    + ".chv .ct .sp{flex:1}"
    + ".chv .ca{font-size:clamp(22px,3vw,44px);font-weight:900;color:#c2432a;min-width:2em;text-align:right}"
    + ".chv .cs{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:auto;cursor:pointer;padding:8px}"
    + ".chv .cs img{display:block;max-width:none;flex:none;margin:auto;image-rendering:auto}"   // 보완 4단계: 크기는 fit()이 정함(선명한 큰 그림을 줄여서만 보여 줌)
    + ".chv .cs.zm{cursor:grab;align-items:flex-start;justify-content:flex-start}.chv .cs.drag{cursor:grabbing}"
    + ".chv .zm3{display:flex;gap:4px}.chv .zm3 button{font:inherit;font-size:clamp(15px,1.4vw,20px);font-weight:800;border:2px solid #222;background:#fff;border-radius:10px;padding:2px 10px;cursor:pointer;min-width:2.2em}"
    + ".chv .zm3 span{align-self:center;font-size:13px;color:#666;min-width:3.2em;text-align:center}"
    + ".chv .cm{font-size:22px;color:#666;text-align:center;line-height:1.7}"
    + ".chv .cb{display:flex;gap:10px;padding:10px 16px;border-top:1px solid #ddd}"
    + ".chv .cb button{flex:1;font:inherit;font-size:clamp(17px,1.8vw,26px);font-weight:800;padding:12px 6px;border-radius:14px;border:2px solid #222;background:#fff;color:#111;cursor:pointer}"
    + ".chv .cb button.on{background:#222;color:#fff}"
    + ".chv .cb .x{flex:0 0 auto;padding:12px 20px}"
    + ".chv select{font:inherit;font-size:13px;border:1px solid #bbb;border-radius:8px;padding:4px}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var V = document.createElement("div"); V.className = "chv";
  V.innerHTML = '<div class="ct"><span id="chvT"></span><span class="sp"></span><span class="zm3"><button id="chvZo" title="작게 (−)">－</button><span id="chvZ">맞춤</span><button id="chvZi" title="크게 (+)">＋</button><button id="chvZf" title="화면에 맞춤 (0)">맞춤</button></span><select id="chvU" title="단원이 틀렸으면 고치기"></select><span class="ca" id="chvA"></span></div>'
    + '<div class="cs" id="chvS"></div>'
    + '<div class="cb"><button id="chvP">◀ 이전</button><button id="chvQ">문제</button><button id="chvAn">정답</button><button id="chvSo">해설</button><button id="chvN">다음 ▶</button><button class="x" id="chvX">✕ 닫기</button></div>';
  document.body.appendChild(V);
  var $ = function(id){ return document.getElementById(id); };
  E.units.forEach(function(u){ var o = document.createElement("option"); o.value = u.c; o.textContent = "단원: " + u.g + "학년 " + u.name; $("chvU").appendChild(o); });
  var cur = { list: [], i: 0, stage: 0, z: 1 }, onClose = null, onShow = null;   // stage 0 문제 · 1 정답 · 2 해설, z 확대 배율(1 = 맞춤)
  /* 보완 4단계: 그림 크기 — 맞춤(문제: 화면 안에 다 보이게, 해설: 가로 1100까지)×배율. 원본보다 크게 늘리지 않으면 흐려지지 않음 */
  function fit(){
    var box = $("chvS"), im = box.querySelector("img"); if(!im || !im.naturalWidth) return;
    var bw = box.clientWidth - 16, bh = box.clientHeight - 16, nw = im.naturalWidth, nh = im.naturalHeight, w;
    if(cur.stage === 2) w = Math.min(bw, 1100);
    else w = Math.min(bw, nw * bh / nh);
    w = Math.max(80, w * cur.z);
    im.style.width = Math.round(w) + "px"; im.style.height = "auto";
    box.classList.toggle("zm", cur.z > 1);
    $("chvZ").textContent = cur.z === 1 ? "맞춤" : Math.round(cur.z * 100) + "%";
  }
  function zoom(f, keep){
    var box = $("chvS"), cx = box.scrollLeft + box.clientWidth / 2, cy = box.scrollTop + box.clientHeight / 2, old = cur.z;
    cur.z = f === 0 ? 1 : Math.min(4, Math.max(1, Math.round(cur.z * f * 100) / 100)); fit();
    if(keep !== false && cur.z !== old){ var k = cur.z / old; box.scrollLeft = cx * k - box.clientWidth / 2; box.scrollTop = cy * k - box.clientHeight / 2; }
    if(cur.z === 1){ box.scrollLeft = 0; box.scrollTop = 0; }
  }
  window.addEventListener("resize", function(){ if(V.classList.contains("on")) fit(); });
  function show(){
    var it = cur.list[cur.i]; if(!it) return;
    $("chvT").innerHTML = "🔥 " + label(it) + " <small>" + it.pt + "점 · " + (cur.i + 1) + "/" + cur.list.length + "</small>";
    $("chvA").textContent = cur.stage >= 1 ? "정답 " + it.a : "";
    $("chvU").value = unitOf(it);
    $("chvQ").className = cur.stage === 0 ? "on" : ""; $("chvAn").className = cur.stage === 1 ? "on" : ""; $("chvSo").className = cur.stage === 2 ? "on" : "";
    var box = $("chvS"); box.className = "cs" + (cur.stage === 2 ? " sol" : "");
    var want = cur.stage === 2 ? it.s : it.q, key = it.id + cur.stage;
    box.dataset.k = key;
    src(want, function(u){
      if(box.dataset.k !== key) return;
      if(u){ box.innerHTML = '<img alt="' + label(it) + '" src="' + u + '">'; box.scrollTop = 0; var im = box.querySelector("img"); im.onload = fit; if(im.complete) fit(); }
      else box.innerHTML = '<div class="cm">문제 그림이 이 기기에 없습니다.<br>쌤 노트 폴더의 <b>exam</b> 폴더를 한 번만 불러오면 다음부터 바로 보입니다.<br><br><button id="chvL" style="font:inherit;font-size:22px;padding:12px 24px;border-radius:14px;border:2px solid #222;background:#fff;cursor:pointer">📂 기출 그림 불러오기</button></div>';
      var l = $("chvL"); if(l) l.onclick = function(e){ e.stopPropagation(); pickFolder(function(n){ alert("기출 그림 " + n + "장을 이 기기에 저장했습니다."); show(); }); };
    });
    if(!S.seen[it.id]){ S.seen[it.id] = today(); save(); }
    if(onShow) try{ onShow(it); }catch(e){}
  }
  function go(d){ var n = cur.i + d; if(n < 0 || n >= cur.list.length) return; cur.i = n; cur.stage = 0; cur.z = 1; show(); }
  function stage(s){ cur.stage = s; cur.z = 1; show(); }
  function close(){ V.classList.remove("on"); onShow = null; if(onClose){ var f = onClose; onClose = null; f(); } }
  var drag = null, moved = false;
  $("chvS").addEventListener("pointerdown", function(e){ if(cur.z <= 1) return; drag = {x: e.clientX, y: e.clientY, l: this.scrollLeft, t: this.scrollTop}; moved = false; this.classList.add("drag"); });
  window.addEventListener("pointermove", function(e){ if(!drag) return; var b = $("chvS"), dx = e.clientX - drag.x, dy = e.clientY - drag.y; if(Math.abs(dx) + Math.abs(dy) > 5) moved = true; b.scrollLeft = drag.l - dx; b.scrollTop = drag.t - dy; });
  window.addEventListener("pointerup", function(){ if(drag){ drag = null; $("chvS").classList.remove("drag"); } });
  $("chvS").addEventListener("wheel", function(e){ if(!e.ctrlKey) return; e.preventDefault(); zoom(e.deltaY < 0 ? 1.25 : 0.8); }, {passive: false});
  $("chvS").ondblclick = function(e){ e.preventDefault(); };
  $("chvS").onclick = function(){ if(moved){ moved = false; return; } if(cur.z > 1) return; stage((cur.stage + 1) % 3); };   // 누를 때마다 문제 → 정답 → 해설 (확대 중에는 끌어서 보기)
  $("chvZi").onclick = function(e){ e.stopPropagation(); zoom(1.5); }; $("chvZo").onclick = function(e){ e.stopPropagation(); zoom(1 / 1.5); }; $("chvZf").onclick = function(e){ e.stopPropagation(); zoom(0); };
  $("chvP").onclick = function(){ go(-1); }; $("chvN").onclick = function(){ go(1); };
  $("chvQ").onclick = function(){ stage(0); }; $("chvAn").onclick = function(){ stage(1); }; $("chvSo").onclick = function(){ stage(2); };
  $("chvX").onclick = close;
  $("chvU").onchange = function(){ var it = cur.list[cur.i]; if(this.value === it.u) delete S.fix[it.id]; else S.fix[it.id] = this.value; save(); };
  document.addEventListener("keydown", function(e){
    if(!V.classList.contains("on")) return;
    if(e.key === "ArrowLeft") go(-1); else if(e.key === "ArrowRight") go(1);
    else if(e.key === "Escape") close();
    else if(e.key === " " || e.key === "Enter"){ e.preventDefault(); stage((cur.stage + 1) % 3); }
    else if(e.key === "1") stage(0); else if(e.key === "2") stage(1); else if(e.key === "3") stage(2);
    else if(e.key === "+" || e.key === "=") zoom(1.5); else if(e.key === "-") zoom(1 / 1.5); else if(e.key === "0") zoom(0);
  });
  function open(l, i, after, shown){ if(!l || !l.length) return; cur.list = l; cur.i = i || 0; cur.stage = 0; cur.z = 1; onClose = after || null; onShow = shown || null; V.classList.add("on"); show(); }

  window.TTChallenge = { data: E, units: E.units, unit: function(c){ return U[c]; }, unitOf: unitOf, list: list, count: count, label: label,
    open: open, pickFolder: pickFolder, importFix: importFix, storeImages: storeImages, importFixObj: importFixObj, isImg: isImg, isOpen: function(){ return V.classList.contains("on"); }, stored: stored, seen: function(id){ return S.seen[id] || ""; }, fixCount: function(){ return Object.keys(S.fix).length; } };
})();
