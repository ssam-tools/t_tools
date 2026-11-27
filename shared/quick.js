/* 쌤 노트 · 휴대폰 ＋ 빠른 입력 (화면 개편 3·4단계)
   - 휴대폰 아래 메뉴 막대 가운데에 ＋ 단추. 누르면 아래에서 올라오는 판에 자주 넣는 6가지.
   - 새 입력 화면을 따로 만들지 않고, 이미 있는 화면(학생 기록·상담일지·수업 기록·말로 기록·오늘 챙길 것 입력칸)을 그대로 엽니다.
     지각·결석만 이 판 안에서 바로: 학생 번호 한 번 누르면 저장(구분: 지각 · 결석 · 인정결), 사유는 고르고 싶을 때만.
     자료 모양은 출결(apps/tardy)과 같습니다: 무단지각 {t:'L'}, 병결 {t:'A',k:'sick'}, 인정결 {t:'A',k:'ok'} + 사유 r.
   - 설정 → 꾸미기 → 화면 → 휴대폰 화면 '예전 화면'이면 이 파일은 아무것도 하지 않습니다(<html data-mob="old">).
   - 학생 이름은 이 기기 안에서만 보여 주고, 어디로도 보내지 않습니다. */
(function(){
  "use strict";
  if(!window.TT || TT.classroom) return;
  var nav = document.getElementById("mnav"); if(!nav) return;
  var KEYG = "tt_guide_v1", KEYQ = "tt_quick_v1";
  var KINDS = [{k: "L", name: "지각", ic: "🕘"}, {k: "A", name: "결석", ic: "🤒"}, {k: "R", name: "인정결", ic: "📄"}];
  var WHY = {L: ["늦잠", "교통·이동", "건강 문제", "가정 사정", "기타"], A: ["감기·몸살", "복통·장염", "두통", "병원 진료", "가정 사정", "연락 없음"], R: ["교외체험학습", "경조사", "법정 감염병", "학교 대표 활동", "기타 인정 사유"]};
  function isNew(){ return !document.documentElement.hasAttribute("data-mob"); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  var st = document.createElement("style");
  st.textContent =
      ".mnav .qplus{display:none}"
    + "@media (max-width:760px){"
    +   "html:not([data-mob]) .mnav .qplus{display:flex;flex:1;align-items:center;justify-content:center;border:0;background:none;padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent}"
    +   ".mnav .qplus i{display:flex;align-items:center;justify-content:center;width:52px;height:52px;margin-top:-18px;border-radius:50%;background:var(--accent,#2f6fb5);color:var(--t-on,#fff);font-style:normal;font-size:32px;font-weight:700;line-height:1;box-shadow:0 4px 12px rgba(30,60,100,.3);border:3px solid var(--card,#fff)}"
    +   ".mnav .qplus:active i{transform:scale(.94)}"
    /* 4단계: 새 휴대폰 화면 — 글씨 16px 이상 · 누르는 곳 44~48px */
    +   "html:not([data-mob]) .tdl,html:not([data-mob]) .ti .tx,html:not([data-mob]) .bday .bi{font-size:16px}"
    +   "html:not([data-mob]) .tdin input,html:not([data-mob]) .tdin button{min-height:46px;font-size:16px}"
    +   "html:not([data-mob]) .ti .ck{min-width:40px;min-height:40px}"
    +   "html:not([data-mob]) .bc{min-height:44px;font-size:15px}"
    +   "html:not([data-mob]) .tbtns .tbtn{min-height:48px;display:inline-flex;align-items:center}"
    +   "html:not([data-mob]) .bday{max-height:none}html:not([data-mob]) .bday .bi{white-space:normal;line-height:1.45;padding:3px 0}"
    + "}"
    + ".qsh{position:fixed;inset:0;z-index:45;background:rgba(20,30,45,.45);display:flex;align-items:flex-end;justify-content:center}"
    + ".qsh[hidden]{display:none}body.qopen #sbBtn,body.qopen #sbTip,body.qopen #sbBox{display:none!important}body.qopen #tt-toast{z-index:50;top:calc(10px + env(safe-area-inset-top,0px));bottom:auto}"
    + ".qsh .in{background:var(--card,#fff);color:var(--ink,#1d2733);width:min(560px,100%);max-height:88dvh;overflow:auto;border-radius:18px 18px 0 0;padding:12px 14px calc(14px + env(safe-area-inset-bottom,0px));box-sizing:border-box;font-family:var(--font,inherit)}"
    + ".qsh .hd{display:flex;align-items:center;gap:8px;margin-bottom:10px}.qsh .hd h3{flex:1;margin:0;font-size:18px}"
    + ".qsh .x{font:inherit;font-size:15px;font-weight:700;border:0;border-radius:12px;background:var(--t-chip,#eceff3);color:var(--ink,#1d2733);min-height:44px;padding:0 14px;cursor:pointer}"
    + ".qsh .g6{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}"
    + ".qsh .tile{font:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:86px;border:1px solid var(--line,#dde3ea);border-radius:16px;background:var(--card,#fff);color:var(--ink,#1d2733);cursor:pointer;text-decoration:none;padding:6px}"
    + ".qsh .tile span{font-size:30px;line-height:1}.qsh .tile b{font-size:15px}.qsh .tile small{font-size:11.5px;color:var(--sub,#667085);text-align:center;line-height:1.25}"
    + ".qsh .tile:active{background:var(--accent-soft,#e6f0fa)}"
    + ".qsh .seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px}"
    + ".qsh .seg button{font:inherit;font-size:16px;font-weight:800;min-height:48px;border:2px solid var(--line,#dde3ea);border-radius:12px;background:var(--card,#fff);color:var(--ink,#1d2733);cursor:pointer}"
    + ".qsh .seg button[aria-pressed=true]{border-color:var(--accent,#2f6fb5);background:var(--accent,#2f6fb5);color:var(--t-on,#fff)}"
    + ".qsh .lab{font-size:13px;color:var(--sub,#667085);margin:6px 0 4px}"
    + ".qsh .nos{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}"
    + ".qsh .nos button{font:inherit;min-height:52px;border:1px solid var(--line,#dde3ea);border-radius:12px;background:var(--t-field,#fbfcfd);color:var(--ink,#1d2733);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2px;min-width:0}"
    + ".qsh .nos button i{font-style:normal;font-size:17px;font-weight:800;line-height:1.1}.qsh .nos button small{font-size:11px;color:var(--sub,#667085);max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}"
    + ".qsh .nos button.L{background:#fff4e0;border-color:#e08a1e}.qsh .nos button.A{background:#fdeaea;border-color:#c0392b}.qsh .nos button.R{background:#e6f4ec;border-color:#1d7a4f}"
    + ".qsh .nos button sup{font-size:10px;font-weight:800}"
    + ".qsh .why{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding:8px;border-radius:12px;background:var(--accent-soft,#e6f0fa)}"
    + ".qsh .why b{width:100%;font-size:14px}.qsh .why button{font:inherit;font-size:14px;font-weight:700;min-height:40px;border:1px solid var(--line,#dde3ea);border-radius:999px;background:var(--card,#fff);color:var(--ink,#1d2733);padding:0 13px;cursor:pointer}"
    + ".qsh .why button[aria-pressed=true]{background:var(--accent,#2f6fb5);color:var(--t-on,#fff);border-color:var(--accent,#2f6fb5)}"
    + ".qsh .msg{font-size:15px;line-height:1.6;padding:10px 4px}.qsh .msg a{color:var(--accent,#2f6fb5);font-weight:800}";
  document.head.appendChild(st);

  /* ── ＋ 단추: 메뉴 막대를 다시 그려도 늘 가운데에 ── */
  function plant(){
    if(nav.querySelector(".qplus")) return;
    var as = nav.querySelectorAll("a[data-menu]:not([data-menu=settings])"); if(!as.length) return;
    var b = document.createElement("button"); b.type = "button"; b.className = "qplus"; b.title = "빠른 입력"; b.setAttribute("aria-label", "빠른 입력");
    b.innerHTML = "<i>＋</i>"; b.onclick = function(){ open(); };
    var at = as[Math.min(as.length - 1, Math.ceil(as.length / 2))];
    nav.insertBefore(b, at);
  }
  new MutationObserver(plant).observe(nav, {childList: true}); plant();

  /* ── 판 ── */
  var sh = document.createElement("div"); sh.className = "qsh"; sh.hidden = true; sh.setAttribute("role", "dialog"); sh.setAttribute("aria-label", "빠른 입력");
  sh.innerHTML = '<div class="in"></div>'; document.body.appendChild(sh);
  var inn = sh.firstChild;
  sh.addEventListener("click", function(e){ if(e.target === sh) close(); });
  window.addEventListener("keydown", function(e){ if(e.key === "Escape" && !sh.hidden) close(); });
  function close(){ sh.hidden = true; inn.innerHTML = ""; document.body.classList.remove("qopen"); }
  var TILES = [
    {id: "att", ic: "🕘", b: "지각·결석", s: "번호 한 번 누르면 저장"},
    {id: "rec", ic: "✍️", b: "학생 기록", s: "생기부용 한 줄"},
    {id: "cns", ic: "💬", b: "상담일지", s: "출결 · 상담"},
    {id: "jrn", ic: "✏️", b: "수업 기록", s: "진도 · 메모"},
    {id: "todo", ic: "📝", b: "할 일", s: "오늘 챙길 것에"},
    {id: "voice", ic: "🎙️", b: "말로 기록", s: "상담·회의 녹음"}
  ];
  function open(){
    if(!isNew()) return;
    sh.hidden = false; document.body.classList.add("qopen");
    inn.innerHTML = '<div class="hd"><h3>＋ 빠른 입력</h3><button type="button" class="x" data-q="close">닫기</button></div><div class="g6">'
      + TILES.map(function(t){ return '<button type="button" class="tile" data-q="' + t.id + '"><span>' + t.ic + "</span><b>" + t.b + "</b><small>" + t.s + "</small></button>"; }).join("") + "</div>";
  }
  inn.addEventListener("click", function(e){
    var b = e.target.closest("[data-q]"); if(!b) return;
    var q = b.dataset.q;
    if(q === "close"){ close(); return; }
    if(q === "back"){ open(); return; }
    if(q === "att"){ att.kind = att.kind || "L"; att.last = null; drawAtt(); return; }
    if(q === "rec"){ close(); TT.notes.quick({src: "빠른 입력"}); return; }
    if(q === "cns"){ location.href = "apps/tardy/?tab=counsel"; return; }
    if(q === "jrn"){ location.href = "apps/journal/"; return; }
    if(q === "voice"){ location.href = "apps/voice/"; return; }
    if(q === "todo"){
      close();
      if(document.body.classList.contains("inmenu")) location.hash = "";
      setTimeout(function(){ var i = document.getElementById("tdInp"); if(i){ i.scrollIntoView({block: "center"}); i.focus(); } else { var d = document.getElementById("dlgTodo"); if(d){ window.dispatchEvent(new CustomEvent("tt-mytodo-change", {detail: "open"})); d.showModal(); } } }, 120);
      return;
    }
  });

  /* ── 지각·결석: 구분 고르기(처음은 지각) → 번호 누르면 바로 저장 → 사유는 골라도 되고 안 골라도 됨 ── */
  var att = {kind: "L", last: null};
  function guide(){ var G = TT.store.get(KEYG, null); return G && typeof G === "object" ? G : null; }
  function grp(r){ return !r ? "" : r.t === "L" ? (r.o ? "R" : "L") : (r.k === "ok" || r.k === "early") ? "R" : "A"; }
  function mk(k, why){ var x = k === "L" ? {t: "L"} : k === "A" ? {t: "A", k: "sick"} : {t: "A", k: "ok"}; if(why) x.r = why; return x; }
  function recent(){ var q = TT.store.get(KEYQ, null); return q && Array.isArray(q.recent) ? q.recent : []; }
  function pushRecent(no){ var r = recent().filter(function(x){ return x !== no; }); r.unshift(no); TT.store.set(KEYQ, {recent: r.slice(0, 5)}); }
  function drawAtt(){
    var home = null; try{ home = TT.roster.home(); }catch(e){}
    var G = guide(), td = ymd(new Date()), d = new Date();
    var h = '<div class="hd"><button type="button" class="x" data-q="back">← 뒤로</button><h3>🕘 지각·결석 <small style="font-weight:600;font-size:13px">' + (d.getMonth() + 1) + "/" + d.getDate() + " 오늘</small></h3>"
      + '<a class="x" href="apps/tardy/" style="display:inline-flex;align-items:center;text-decoration:none">출결 열기</a></div>';
    if(!home || !home.students || !home.students.length){ inn.innerHTML = h + '<p class="msg">먼저 <a href="apps/roster/">명렬표</a>에서 우리 반(★)을 정해 주세요.</p>'; return; }
    if(!G){ inn.innerHTML = h + '<p class="msg"><a href="apps/tardy/">출결</a>을 한 번 열어 주세요. 그다음부터 여기서 바로 넣을 수 있어요.</p>'; return; }
    var T = (G.att || {})[td] || {}, mask = !!(G.settings && G.settings.mask);
    function nm(s){ var n = String(s.name || ""); return mask && n ? n[0] + "○".repeat(Math.max(1, n.length - 1)) : n; }
    var S = home.students.slice().sort(function(a, b){ return a.no - b.no; }), R = recent().filter(function(no){ return S.some(function(s){ return String(s.no) === no; }); });
    function btn(s){ var no = String(s.no), g = grp(T[no]); return '<button type="button" data-no="' + no + '"' + (g ? ' class="' + g + '"' : "") + ' title="' + esc(no + "번 " + nm(s)) + '"><i>' + no + (g ? "<sup>" + {L: "지", A: "결", R: "인"}[g] + "</sup>" : "") + "</i><small>" + esc(nm(s)) + "</small></button>"; }
    h += '<div class="seg" role="group" aria-label="구분">' + KINDS.map(function(k){ return '<button type="button" data-k="' + k.k + '" aria-pressed="' + (att.kind === k.k) + '">' + k.ic + " " + k.name + "</button>"; }).join("") + "</div>";
    if(R.length) h += '<div class="lab">최근 고른 학생</div><div class="nos">' + R.map(function(no){ return btn(S.filter(function(s){ return String(s.no) === no; })[0]); }).join("") + "</div>";
    h += '<div class="lab">번호를 누르면 바로 저장 · 한 번 더 누르면 지움</div><div class="nos">' + S.map(btn).join("") + "</div>";
    if(att.last && T[att.last]){
      var r = T[att.last], g = grp(r), s0 = S.filter(function(s){ return String(s.no) === att.last; })[0];
      h += '<div class="why"><b>' + esc(att.last + "번 " + (s0 ? nm(s0) : "")) + " · " + {L: "지각", A: "결석", R: "인정결"}[g] + ' 사유 (골라도 되고 안 골라도 돼요)</b>' + (WHY[g] || []).map(function(w){ return '<button type="button" data-why="' + esc(w) + '" aria-pressed="' + (r.r === w) + '">' + esc(w) + "</button>"; }).join("") + "</div>";
    }
    inn.innerHTML = h;
  }
  function saveG(G){ var ok = TT.store.set(KEYG, G); try{ if(window.TT_TODAY) TT_TODAY.render(); }catch(e){} return ok; }
  inn.addEventListener("click", function(e){
    var k = e.target.closest("[data-k]"), n = e.target.closest("[data-no]"), w = e.target.closest("[data-why]");
    if(k){ att.kind = k.dataset.k; drawAtt(); return; }
    var G = guide(); if(!G || (!n && !w)) return;
    var td = ymd(new Date()); G.att = G.att || {}; var T = G.att[td] = G.att[td] || {};
    if(n){
      var no = n.dataset.no, before = T[no] ? JSON.parse(JSON.stringify(T[no])) : null, same = before && grp(before) === att.kind;
      if(same) delete T[no]; else T[no] = mk(att.kind, before && grp(before) === att.kind ? before.r : "");
      if(!saveG(G)){ TT.ui.toast("저장하지 못했어요."); return; }
      pushRecent(no); att.last = same ? null : no; drawAtt();
      var lab = n.getAttribute("title") || no + "번";
      TT.ui.toast(same ? lab + " 기록을 지웠어요." : lab + " " + {L: "지각", A: "결석", R: "인정결"}[att.kind] + " 저장", function(){
        var G2 = guide(); if(!G2) return; var T2 = (G2.att = G2.att || {})[td] = G2.att[td] || {};
        if(before) T2[no] = before; else delete T2[no];
        saveG(G2); if(!sh.hidden && inn.querySelector(".nos")){ att.last = null; drawAtt(); }
      });
      return;
    }
    if(w && att.last && T[att.last]){ var r = T[att.last]; if(r.r === w.dataset.why) delete r.r; else r.r = w.dataset.why; saveG(G); drawAtt(); }
  });
  window.TT_QUICK = {open: open};
})();
