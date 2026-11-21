/* 쌤 노트 · 학교 자료실(구글 드라이브) 화면 — 개편 8단계
   - 학교 메뉴의 [자료실] 탭에 붙습니다: 찾기 칸 · 분류 버튼 · 📞 내선번호 · 파일마다 [바로 보기] · [내려받기]
   - 자료는 학교 업무판(앱스 스크립트)이 학교 구글 드라이브의 '쌤노트_학교자료' 폴더에서 읽어 줍니다(공용 비밀번호 필요).
     스크립트 쪽 코드와 설정 안내: 바탕화면 board/드라이브자료실.gs · 자료실_설정안내.md (공개 저장소에는 올리지 않음)
   - 내선번호는 찾기(Ctrl+K)에서도 쓰도록 이 기기에만 잠깐 기억합니다("tt_ext_cache_v1", 하루). 학생 자료는 보내지 않습니다.
     업무판 시트가 없으면 학기초 세팅의 교직원 명렬(tt_staff_v1: 내선 tel · 대표번호 main)을 대신 보여 줍니다(v1.3).
   - 한글 파일은 같은 이름의 PDF와 묶어 [바로 보기]=PDF, [내려받기]=원본. */
(function(){
  "use strict";
  var CATS = ["서식", "학교 운영", "생활기록부", "규정", "안내"], KIND = {pdf: "📕", hwp: "📘", xls: "📗", ppt: "📙", doc: "📄", img: "🖼️", etc: "📎"};
  var EXTK = "tt_ext_cache_v1", list = null, listAt = 0, cat = "", lastQ = "", hits = null, extOpen = false, busy = false, err = "";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function cfg(){ return TT.store.get("tt_board_v1", null) || {}; }
  function connected(){ var B = cfg(); return !!(B.url && B.pw && /^https:\/\/script\.google\.com\//.test(B.url)); }
  function post(o){
    var B = cfg();
    if(!connected()) return Promise.reject(new Error("NOBOARD"));
    return fetch(B.url, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(Object.assign({pw: B.pw}, o))})
      .then(function(r){ return r.json(); }).then(function(j){ if(!j || !j.ok) throw new Error(j && j.error || "응답 없음"); return j; });
  }
  function errText(e){
    var m = String(e && e.message || e);
    if(m === "NOBOARD") return "학교 업무판을 연결하면 학교 구글 드라이브의 자료가 여기에 나옵니다.";
    if(m.indexOf("AUTH") >= 0) return "업무판 비밀번호가 바뀌었어요. 업무판 연결에서 다시 넣어 주세요.";
    if(m.indexOf("지원하지 않는") >= 0) return "업무판 스크립트에 자료실 기능이 아직 없어요. 업무판 관리 선생님께 '자료실_설정안내'를 부탁해 주세요.";
    if(/Failed to fetch|NetworkError|Load failed/i.test(m)) return "인터넷이 끊겼거나 업무판에 연결할 수 없어요.";
    return m;
  }
  function getList(fresh){
    if(list && !fresh && Date.now() - listAt < 300000) return Promise.resolve(list);
    return post({action: "drlist", fresh: !!fresh}).then(function(j){ list = j.items || []; listAt = Date.now(); if(j.cats && j.cats.length) CATS = j.cats; return list; });
  }
  function search(q){ return post({action: "drsearch", q: q}).then(function(j){ return j.hits || []; }); }
  function ext(fresh){
    var c = TT.store.get(EXTK, null);
    if(c && !fresh && Date.now() - c.at < 864e5) return Promise.resolve(c.list);
    return post({action: "ext"}).then(function(j){ TT.store.set(EXTK, {at: Date.now(), list: j.list || []}); return j.list || []; });
  }
  function extCached(){ var c = TT.store.get(EXTK, null), L = c && Array.isArray(c.list) ? c.list : []; return L.length ? L : extLocal(); }
  /* v1.3: 업무판 '내선번호' 시트가 없으면 학기초 세팅에서 넣은 교직원 명렬(tt_staff_v1)의 내선·대표번호를 씀 — 이 기기 안에서만 */
  function extLocal(){
    var o = TT.store.get("tt_staff_v1", null) || {}, out = [];
    (Array.isArray(o.main) ? o.main : []).forEach(function(x){ if(x && x.number) out.push({t: String(x.number), n: String(x.label || ""), d: "대표번호", m: ""}); });
    (Array.isArray(o.list) ? o.list : []).forEach(function(x){ if(x && x.tel) out.push({t: String(x.tel), n: String(x.name || ""), d: String(x.dept || ""), m: [x.pos, x.subj].filter(Boolean).join(" ")}); });
    return out;
  }
  /* 파일 받기: 바로 보기(새 창에 PDF) · 내려받기(원본 이름 그대로) */
  function fetchRaw(id){ return post({action: "drget", id: id}).then(function(j){ var b = atob(j.data), u = new Uint8Array(b.length); for(var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return {name: j.name, mime: j.mime, u8: u}; }); }
  /* v2.39.1: 한 번 받은 파일은 이 기기에 넣어 두고 바로 씀(shared/libcache.js가 있을 때). 드라이브 파일은 고친 시각이 바뀌면 새로 받음 */
  function fetchFile(id){
    var C = window.TT_LIBC, x = (list || []).filter(function(i){ return i.view === id || i.orig === id || i.id === id; })[0] || {}, ver = String(x.at || "");
    var p = C ? C.get("dr:" + id, ver).then(function(f){ return f || fetchRaw(id).then(function(f2){ C.put("dr:" + id, f2, ver); return f2; }); }) : fetchRaw(id);
    return p.then(function(f){ return {name: f.name, blob: new Blob([f.u8], {type: f.mime || "application/octet-stream"})}; });
  }
  function view(id){
    var w = window.open("", "_blank");                                    // 누른 순간 창을 열어 두어야 막히지 않음
    if(w) w.document.write('<p style="font:16px sans-serif;padding:20px">자료를 여는 중…</p>');
    fetchFile(id).then(function(f){ var url = URL.createObjectURL(f.blob); if(w) w.location.href = url; else location.href = url; setTimeout(function(){ URL.revokeObjectURL(url); }, 120000); })
      .catch(function(e){ if(w) w.close(); TT.ui.toast(errText(e)); });
  }
  function down(id){
    TT.ui.toast("내려받는 중…");
    fetchFile(id).then(function(f){ TT.util.download(f.name, f.blob); }).catch(function(e){ TT.ui.toast(errText(e)); });
  }
  (function(){
    var st = document.createElement("style");
    st.textContent = ".ld{grid-column:1/-1;display:flex;flex-direction:column;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;min-height:0}"
      + ".ldtop{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.ldtop b{color:var(--m);font-size:15px;margin-right:4px}"
      + ".ldq{flex:1;min-width:180px;font:inherit;font-size:15px;border:2px solid var(--m,var(--accent));border-radius:11px;padding:7px 11px;background:var(--card);color:var(--ink)}"
      + ".ld .lb{font:inherit;font-size:13px;font-weight:800;border:1px solid var(--line);background:var(--card);border-radius:10px;padding:6px 11px;cursor:pointer;color:var(--ink);white-space:nowrap}"
      + ".ld .lb.on,.ld .lb:hover{border-color:var(--m);background:var(--m-soft)}.ld .lb.p{background:var(--m);border-color:var(--m);color:var(--t-on,#fff)}"
      + ".ldcats{display:flex;gap:5px;flex-wrap:wrap}"
      + ".ldx{border:1px dashed var(--m);border-radius:12px;padding:8px 10px;display:flex;flex-direction:column;gap:6px}.ldx input{font:inherit;font-size:14px;border:1px solid var(--line);border-radius:9px;padding:5px 9px}"
      + ".ldxl{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:4px;max-height:30vh;overflow:auto}.ldxl div{display:flex;gap:6px;font-size:14px;border-bottom:1px solid var(--t-chip,#eceff3);padding:2px 0}.ldxl b{color:var(--m);min-width:3.5em;font-variant-numeric:tabular-nums}.ldxl small{color:var(--sub)}"
      + ".ldl{display:flex;flex-direction:column;gap:4px;overflow:auto;max-height:calc(100vh - 430px);min-height:120px}"
      + ".ldr{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:11px;padding:7px 10px}.ldr .ic{font-size:22px;flex:none}"
      + ".ldr .ldn{flex:1;min-width:0;display:flex;flex-direction:column}.ldr .ldn b{font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ldr .ldn small{font-size:12px;color:var(--sub)}"
      + ".ldr .lb{padding:5px 10px}.ldmsg{font-size:14px;color:var(--sub);padding:10px 4px;line-height:1.6}.ldmsg .lb{margin-left:6px}"
      + "@media (max-width:760px){.ldl{max-height:none}.ldr{flex-wrap:wrap}.ldr .ldn{flex:1 1 60%}}";
    document.head.appendChild(st);
  })();
  function row(x){
    var meta = [x.cat, x.at, x.match === "내용" ? "🔎 본문에서 찾음" : "", x.kind === "hwp" && x.view && x.view !== x.orig ? "PDF로 보기 · 한글 원본" : ""].filter(Boolean).join(" · ");
    return '<div class="ldr"><span class="ic">' + (KIND[x.kind] || "📎") + '</span><span class="ldn"><b title="' + esc(x.name) + '">' + esc(x.name) + "</b><small>" + esc(meta) + "</small></span>"
      + (x.view ? '<button type="button" class="lb p" data-view="' + esc(x.view) + '">바로 보기</button>' : "")
      + '<button type="button" class="lb" data-down="' + esc(x.orig || x.id) + '">내려받기</button></div>';
  }
  var box = null;
  function draw(){
    if(!box) return;
    var L = hits || (list || []).filter(function(x){ return !cat || x.cat === cat; });
    var h = '<div class="ldtop"><b>🗂️ 학교 드라이브 자료</b><input class="ldq" type="search" placeholder="자료 찾기 — 이름과 본문 (예: 업무분장, 기재요령)" value="' + esc(lastQ) + '" aria-label="자료 찾기">'
      + '<button type="button" class="lb' + (extOpen ? " on" : "") + '" data-act="ext">📞 내선번호</button><button type="button" class="lb" data-act="re" title="새로 고침">↻</button></div>'
      + '<div class="ldcats">' + ["전체"].concat(CATS).map(function(c){ var v = c === "전체" ? "" : c; return '<button type="button" class="lb' + (!hits && cat === v ? " on" : "") + '" data-cat="' + esc(v) + '">' + esc(c) + (list && v ? " <small>" + list.filter(function(x){ return x.cat === v; }).length + "</small>" : "") + "</button>"; }).join("") + "</div>";
    if(extOpen) h += '<div class="ldx"><input class="ldxq" type="search" placeholder="이름·부서로 찾기 (예: 행정실)" aria-label="내선번호 찾기"><div class="ldxl">' + extRows("") + "</div></div>";
    h += '<div class="ldl">';
    if(err) h += '<div class="ldmsg">⚠ ' + esc(err) + (connected() ? "" : '<button type="button" class="lb p" data-act="board">업무판 연결</button>') + "</div>";
    else if(busy && !L.length) h += '<div class="ldmsg">불러오는 중…</div>';
    else if(!L.length) h += '<div class="ldmsg">' + (hits ? "'" + esc(lastQ) + "'에 맞는 자료가 없습니다." : "이 분류에 자료가 없습니다. 학교 드라이브의 '쌤노트_학교자료' 폴더에 넣으면 나옵니다.") + "</div>";
    else{ if(hits) h += '<div class="ldmsg" style="padding:2px 4px">🔎 \'' + esc(lastQ) + "' " + L.length + '건 <button type="button" class="lb" data-act="clear">✕ 찾기 지우기</button></div>'; h += L.slice(0, 200).map(row).join(""); }
    h += "</div>";
    var ae = document.activeElement, focusQ = ae && ae.classList && ae.classList.contains("ldq");
    box.innerHTML = h;
    if(focusQ){ var q = box.querySelector(".ldq"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }
  function extRows(q){
    var L = extCached(); q = String(q || "").trim();
    if(!L.length) return '<span class="ldmsg">' + (busy ? "불러오는 중…" : "내선번호가 없습니다. 학기초 세팅에서 내선번호 한글 파일을 넣거나, 업무판 '내선번호' 시트를 쓰세요.") + "</span>";
    return L.filter(function(x){ return !q || (x.n + " " + x.d + " " + x.m).indexOf(q) >= 0; }).slice(0, 200)
      .map(function(x){ return "<div><b>" + esc(x.t) + "</b><span>" + esc(x.n) + ' <small>' + esc(x.d) + "</small></span></div>"; }).join("") || '<span class="ldmsg">맞는 번호가 없습니다</span>';
  }
  function load(fresh){
    if(!connected()){ err = errText(new Error("NOBOARD")); draw(); return; }
    busy = true; err = ""; draw();
    getList(fresh).then(function(){ busy = false; draw(); }, function(e){ busy = false; err = errText(e); draw(); });
  }
  var qt;
  function mount(el){
    box = document.createElement("div"); box.className = "ld"; el.appendChild(box);
    var pre = sessionStorage.getItem("sn_libq"); if(pre){ sessionStorage.removeItem("sn_libq"); lastQ = pre; }
    if(sessionStorage.getItem("sn_ext")){ sessionStorage.removeItem("sn_ext"); extOpen = true; if(connected()) ext().then(draw, draw); }
    box.addEventListener("click", function(e){
      var b = e.target.closest("button"); if(!b) return;
      if(b.dataset.view) return view(b.dataset.view);
      if(b.dataset.down) return down(b.dataset.down);
      if(b.dataset.cat != null){ cat = b.dataset.cat; hits = null; lastQ = ""; return draw(); }
      var a = b.dataset.act;
      if(a === "re"){ TT.store.remove(EXTK); load(true); if(extOpen) ext(true).then(draw, draw); }
      if(a === "clear"){ hits = null; lastQ = ""; draw(); }
      if(a === "board"){ var mb = document.getElementById("mBoard"); if(mb) mb.click(); }
      if(a === "ext"){ extOpen = !extOpen; draw(); if(extOpen && connected()){ busy = true; ext().then(function(){ busy = false; draw(); }, function(e){ busy = false; err = errText(e); draw(); }); } }
    });
    box.addEventListener("input", function(e){
      if(e.target.classList.contains("ldxq")){ box.querySelector(".ldxl").innerHTML = extRows(e.target.value); return; }
      if(!e.target.classList.contains("ldq")) return;
      clearTimeout(qt); var v = e.target.value.trim(); lastQ = v;
      if(!v){ hits = null; draw(); return; }
      qt = setTimeout(function(){ runSearch(v); }, 450);
    });
    load(false);
    if(lastQ) runSearch(lastQ);
  }
  function runSearch(v){
    if(!connected()){ err = errText(new Error("NOBOARD")); draw(); return; }
    var lo = v.toLowerCase();
    hits = (list || []).filter(function(x){ return (x.name + " " + x.cat).toLowerCase().indexOf(lo) >= 0; }).map(function(x){ return Object.assign({match: "이름"}, x); });   // 이름은 바로
    draw();
    search(v).then(function(H){ if(lastQ !== v) return; hits = H; draw(); }, function(e){ err = errText(e); draw(); });
  }
  /* 학생 메뉴 '생기부 기재요령 찾기' → 학교 메뉴 자료실 탭에서 바로 찾기 */
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-libq]"); if(!b) return;
    sessionStorage.setItem("sn_libq", b.dataset.libq);
    var u = TT.store.get("tt_ui_v1", {}) || {}; u.mtab = u.mtab || {}; u.mtab.school = "lib"; TT.store.set("tt_ui_v1", u);
    if(location.hash === "#school") window.dispatchEvent(new Event("tt-menu-refresh")); else location.hash = "school";
  });
  document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest("[data-board]"); if(b){ var mb = document.getElementById("mBoard"); if(mb) mb.click(); } });
  window.TT_LIBD = {mount: mount, search: search, ext: ext, extCached: extCached, connected: connected, view: view, down: down, errText: errText};
})();
