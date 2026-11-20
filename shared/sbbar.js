/* 쌤 노트 v2.1 · 쌤비와 메뉴 (쌤비 홈 디자인일 때 모든 화면) — 쌤비는 어디에나 있습니다
   ① 첫 화면·중메뉴(index): 위쪽 빈칸 + ⋯ / 큰 쌤비 + 말풍선 / 검색창 / 동그라미 메뉴 줄 [홈 · 수업 · 우리 반 · 학생 · 학교 · 자료실 · 설정]
   ② 도구 화면(소메뉴, 넓은 화면): 왼쪽 막대 = 쌤비 + 한마디 / 찾기 / 메뉴 — 지금 메뉴는 펼쳐 그 안의 도구 목록, 오른쪽은 도구 화면
   ③ 도구 화면(휴대폰·좁은 화면): 위쪽 줄 = 쌤비 · 찾기 · 🎤 + 메뉴 아이콘 줄
   - 쌤비를 누르면 어디서나 같은 쌤비 창(오늘 상황 + 말하기). 소품은 상황에 따라 바뀝니다(첫 화면은 shared/sbhome.js 가 정함).
   - 업무판 화면에서는 보이지 않습니다(shared/v2.css 가 html[data-ui="ssambi"] 일 때만 보여 줌). */
(function(){
  "use strict";
  if(!window.TT || window.TT_SBAR || (TT.classroom && TT.classroom.locked)) return;   // v2.11.4 교실 기기도 (수업 시작 뒤) 쌤비 메뉴 — 수업용 도구만
  if(window.top !== window){ document.documentElement.classList.add("sbReady"); return; }   // 다른 화면 안(학교 업무판의 문서 칸)에 열렸을 때는 쌤비·메뉴 없이
  var R = document.documentElement, ART = window.TT_SBART, BASE = TT.BASE || "./";
  var HOME = !/\/apps\//.test(location.pathname);
  if(!HOME && R.getAttribute("data-ui") !== "ssambi") return;          // 도구 화면은 쌤비 홈 디자인일 때만 (첫 화면은 바꾸는 즉시 보이도록 늘 만들어 둠)
  var MENUS = [["home", "홈"], ["class", "수업"], ["homeroom", "우리 반"], ["student", "학생"], ["school", "학교"], ["lib", "자료실"], ["settings", "설정"]];
  var KEYS = {home: "Alt+1", "class": "Alt+2", homeroom: "Alt+3", student: "Alt+4", school: "Alt+5", settings: "Alt+0"};
  var SUBK = "sbSub";                                                  // 자료실 = 학교 메뉴의 자료실 묶음 (이 창에서만 기억)
  var DOW = "일월화수목금토";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function icon(n, s){ return ART && ART.icon ? ART.icon(n, s) : ""; }
  var CRM = !!TT.classroom;                                             // 교실 기기: 수업용(room) 도구가 있는 메뉴만, 검색·말로 기록·쌤비 창·나무 없음
  function shown(id){ if(CRM) return id === "home" || tools(id).length > 0; return id === "home" || id === "settings" || id === "lib" || typeof ttMenuShown !== "function" || ttMenuShown(id); }
  if(CRM) R.setAttribute("data-room", "on");
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function sub(){ try{ return sessionStorage.getItem(SUBK) || ""; }catch(e){ return ""; } }
  function setSub(v){ try{ if(v) sessionStorage.setItem(SUBK, v); else sessionStorage.removeItem(SUBK); }catch(e){} }

  /* 지금 있는 곳: 첫 화면은 주소 끝 #, 도구 화면은 그 도구가 속한 메뉴 */
  function hereTool(){
    if(HOME) return null;
    var m = location.pathname.match(/\/apps\/([^\/]+)\//), id = m ? m[1] : "";
    if(id === "tardy" && /[?&]tab=counsel/.test(location.search)) id = "counsel";
    if(id === "sguide") id = /[?&]tab=counsel/.test(location.search) ? "counsel" : "gquick";
    return typeof TT_TOOLS !== "undefined" ? TT_TOOLS.filter(function(x){ return x.id === id; })[0] || null : null;
  }
  function curMenu(){
    if(HOME){
      var h = (location.hash || "").replace(/^#/, "");
      if(h === "school" && sub() === "lib") return "lib";
      return MENUS.some(function(m){ return m[0] === h; }) ? h : "home";
    }
    var t = hereTool(); if(!t) return "";
    return t.menu === "school" && t.group === "lib" ? "lib" : t.menu;
  }
  function season(){
    var lk = R.getAttribute("data-look"), m = new Date().getMonth() + 1;
    return /^(spring|summer|autumn|winter)$/.test(lk || "") ? lk : m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter";
  }
  /* 도구 화면용 한마디 (시간표·시간만 보고) — 첫 화면은 setOwl 로 할 일까지 본 한마디 */
  function basicPick(){
    var d = new Date(), w = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), wk = w >= 1 && w <= 5, T = TT.timetable, cur = null, nx = null;
    try{ if(wk && T && T.has()){ cur = T.now(); nx = T.next(); } }catch(e){}
    function cls(s){ var c = +s.cls; return c > 100 ? Math.floor(c / 100) + "-" + (c % 100) : String(s.code || ""); }
    if(cur) return {item: "shh", line: cur.n + "교시 " + cls(cur) + " 수업 중", sub: "끝까지 " + (cur.end - m) + "분"};
    if(nx && nx.start - m <= 15) return {item: "book", line: nx.n + "교시 " + cls(nx) + (nx.subj ? " " + nx.subj : ""), sub: (nx.start - m) + "분 뒤 시작"};
    if(!wk || m >= 18 * 60) return {item: "night", sleep: true, line: "오늘도 수고하셨어요", sub: "푹 쉬세요"};
    if(m < 300) return {item: "night", sleep: true, line: "늦은 시간이에요", sub: "푹 쉬세요"};
    if(m < 540) return {item: "coffee", line: "좋은 아침이에요", sub: nx ? "첫 수업 " + nx.n + "교시 " + cls(nx) : ""};
    if(m >= 720 && m < 780) return {item: "spoon", line: "점심시간이에요", sub: "맛있게 드세요"};
    return {item: "", line: nx ? "다음 " + nx.n + "교시 " + cls(nx) : "무엇을 도와드릴까요?", sub: nx ? nx.t + " 시작" : ""};
  }
  var owlState = null;
  function P(){ return owlState || basicPick(); }
  var tempItem = null;                                                  // v2.12 잠깐 드는 소품(즐겨찾기 서랍 = 책갈피)
  function owlSvg(size){ var p = P(), it = tempItem || p.item; return ART ? ART.svg({acc: TT.joy && TT.joy.acc ? TT.joy.acc() : "", item: it, deco: (TT.joy && TT.joy.on && !TT.joy.on()) || it === "scarf" ? "" : season(), open: !!p.open, sleep: !!p.sleep, listen: !!p.listen, size: size}) : "🦉"; }
  /* v2.3: 메뉴를 누르면 중메뉴 없이 대표 도구가 바로 (홈·설정은 메인 화면) */
  var REP = {"class": "apps/book/", homeroom: "apps/tardy/", student: "apps/stucard/", school: "apps/school/", lib: "apps/lib/"};
  function href(id){ return id === "home" ? BASE : REP[id] ? BASE + REP[id] : BASE + "#" + id; }
  if(HOME){                                                             // 예전 주소(#class …)·단축키(Alt+2~5)로 와도 대표 도구로
    var toRep = function(){
      if(R.getAttribute("data-ui") !== "ssambi") return false;
      var h = (location.hash || "").replace(/^#/, ""), k = h === "school" && sub() === "lib" ? "lib" : h;
      if(REP[k]){ location.replace(BASE + REP[k]); return true; }
      return false;
    };
    if(toRep()) return;
    window.addEventListener("hashchange", toRep);
  }

  /* ── ① 첫 화면·중메뉴 머리 ──
     쌤비를 누르거나 🎤를 누르면 따로 창을 띄우지 않고 쌤비 옆 말풍선이 그대로 쌤비 창이 됩니다(오늘 상황 · 말하기 · 듣는 중).
     검색창은 그 자리에서 적고 Enter → 결과는 메뉴 줄 아래(shared/sbhome.js). "종례: …" "할 일: …"은 Enter 한 번에 바로 넣음. */
  var hero = null;
  function hrowHTML(){
    var p = P(), d = new Date(), s = (TT.school && TT.school.load ? TT.school.load() : {}) || {};
    return '<button type="button" class="owl" id="sbBarOwl" title="쌤비 — 오늘 상황 · 말로 기록 (Alt+B)" aria-label="쌤비 열기 (Alt+B)">' + owlSvg(132) + "</button>"
      + '<div class="bub' + (p.talk ? " talk" : "") + '" role="status"><div class="b0"' + (p.talk ? ' title="누르면 다음 이야기"' : "") + ">" + (p.ev ? '<div class="when"><span class="ev">📌 ' + esc(p.ev) + "</span></div>" : "") + (p.tag ? '<span class="ttag">' + esc(p.tag) + "</span>" : "") + "<p>" + esc(p.line || "") + "</p>" + (p.sub ? "<small>" + esc(p.sub) + "</small>" : "") + "</div>"
      + (p.acts && p.acts.length ? '<div class="acts">' + p.acts.map(function(a){ return '<button type="button" data-tact="' + esc(a[0]) + '">' + esc(a[1]) + "</button>"; }).join("") + "</div>" : "") + "</div>";   // v2.13 쌤비 이야기: 꼬리표 · 단추
  }
  function wxTag(sep){ var c = window.TT_WX ? TT_WX.chip() : ""; return c ? sep + '<span data-hid="wx" class="wx">' + esc(c) + "</span>" : ""; }   // v2.12 날씨 (올리면 자세히)
  function dateHTML(){                                                  // 학교 · 날짜 · 시간은 맨 위 ⋯ 줄 왼쪽에 (휴대폰은 짧게)
    var d = new Date(), s = (TT.school && TT.school.load ? TT.school.load() : {}) || {}, t = (d.getHours() < 12 ? "오전 " : "오후 ") + ((d.getHours() % 12) || 12) + ":" + pad(d.getMinutes());
    return '<span class="lg">' + (s.name ? '<span data-hid="school">' + esc(s.name) + "</span> · " : "") + '<span data-hid="meal">' + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + DOW[d.getDay()] + '요일</span> · <span data-hid="time">' + t + '</span>' + wxTag(" · ") + '</span><span class="st"><span data-hid="meal">' + (d.getMonth() + 1) + "/" + d.getDate() + "(" + DOW[d.getDay()] + ')</span> <span data-hid="time">' + t + "</span>" + wxTag(" ") + "</span>";   // v2.9 숨은 정보: 날짜 → 급식, 시각 → 교시
  }
  function srowHTML(){
    return '<div class="q">' + icon("search", 20) + '<label for="sbQ2" class="sr">찾기 또는 한 줄 입력</label><input id="sbQ2" type="text" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="찾기 · 할 일 적기">'
      + '<button type="button" class="qx" data-qx aria-label="지우기" hidden>✕</button><kbd title="어디서나 / 키로 여기에">/</kbd></div>'
      + '<button type="button" class="ib" data-mic title="말로 기록" aria-label="말로 기록">' + icon("mic", 20) + "</button>"
      + (window.TT_QUICK ? '<button type="button" class="ib plus" data-plus title="빠른 입력" aria-label="빠른 입력">' + icon("plus", 22) + "</button>" : "");
  }
  function circHTML(){
    var cur = curMenu();
    return MENUS.filter(function(m){ return shown(m[0]); }).map(function(m){
      var on = m[0] === cur;
      return '<a href="' + esc(href(m[0])) + '" data-m="' + m[0] + '"' + (on ? ' class="on" aria-current="page"' : "") + ' title="' + m[1] + (KEYS[m[0]] ? " (" + KEYS[m[0]] + ")" : "") + '"><span class="ci">' + icon(m[0], 24) + (m[0] === "homeroom" ? treeTag() : "") + "</span><b>" + m[1] + "</b></a>";
    }).join("");
  }
  var moreHome = null;
  function drawHero(){
    if(!hero){
      hero = document.createElement("div"); hero.id = "sbHero";
      hero.innerHTML = '<div class="top"><span class="sp"></span><button type="button" class="fav" id="sbFav" aria-label="자주 가는 사이트 (Alt+S)" title="자주 가는 사이트 (Alt+S)" aria-expanded="false" aria-haspopup="dialog">' + icon("star", 19) + '</button></div><div class="hrow"></div><div class="srow">' + srowHTML() + '</div><nav class="circ" aria-label="메뉴"></nav>';
      document.body.insertBefore(hero, document.body.firstChild);
      wireSearch();
    }
    var box = document.getElementById("sbBox"); if(box && hero.contains(box)) document.body.appendChild(box);   // 다시 그리는 동안 쌤비 창을 잠깐 비켜 둠
    hero.querySelector(".hrow").innerHTML = hrowHTML(); hero.querySelector(".top .sp").innerHTML = dateHTML();
    hero.querySelector(".circ").innerHTML = circHTML();
    seatMore(); seatBox();
  }
  function seatBox(){                                                   // 쌤비 창(#sbBox): 마이크 단추 바로 오른쪽(말풍선 높이에서) — 자리가 모자라면 마이크 아래에 띄움
    var box = document.getElementById("sbBox"); if(!box) return;
    var on = R.getAttribute("data-ui") === "ssambi" && document.body.classList.contains("sbOn") && hero;
    var mic = on && hero.querySelector(".srow [data-mic]"), bub = on && hero.querySelector(".bub");
    var side = !!(mic && bub && mic.getBoundingClientRect().right + 14 + 244 <= document.documentElement.clientWidth - 8);
    if(side){
      if(box.parentNode !== hero) hero.appendChild(box);
      var hr = hero.getBoundingClientRect(), mr = mic.getBoundingClientRect(), br = bub.getBoundingClientRect();
      var vw = document.documentElement.clientWidth, bw = 300 * 0.8, gap = Math.max(14, (vw - mr.right - bw) / 2);   // 마이크 끝 ~ 화면 오른쪽 끝의 가운데
      box.style.setProperty("left", Math.round(mr.right + gap - hr.left) + "px", "important");
      box.style.setProperty("top", Math.round(br.top - hr.top) + "px", "important");
      box.classList.add("sbSide");
    }else{
      if(box.parentNode !== document.body) document.body.appendChild(box);
      if(box.classList.contains("sbSide")){ box.classList.remove("sbSide"); box.style.removeProperty("left"); box.style.removeProperty("top"); }
    }
  }
  window.addEventListener("resize", function(){ if(HOME && hero) seatBox(); });
  function seatMore(){                                                  // ⋯ (설정·백업 등)은 오른쪽 위에 그대로 — 업무판으로 돌아가면 제자리로
    var more = document.getElementById("more"); if(!more) return;
    if(!moreHome) moreHome = {p: more.parentNode, n: more.nextSibling};
    var on = R.getAttribute("data-ui") === "ssambi", top = hero && hero.querySelector(".top");
    if(on && top){ if(more.parentNode !== top) top.appendChild(more); }
    else if(moreHome && more.parentNode !== moreHome.p) moreHome.p.insertBefore(more, moreHome.n && moreHome.n.parentNode === moreHome.p ? moreHome.n : null);
  }
  /* 검색창: 적고 Enter → 메뉴 줄 아래 결과 · ↑↓ 고르기 · 다시 Enter 실행 · Esc 지우기 */
  function qEl(){ return document.getElementById("sbQ2"); }
  function SH(){ return window.TT_SBHOME || null; }
  function wireSearch(){
    var q = qEl(), x = hero.querySelector("[data-qx]");
    function sync(){ x.hidden = !q.value; }
    q.addEventListener("input", function(){ sync(); var h = SH(); if(!h) return; if(!q.value.trim()) h.search(""); else if(h.query()) h.search(q.value); });
    q.addEventListener("keydown", function(e){
      var h = SH(); if(!h || e.isComposing) return;
      if(e.key === "Escape"){ q.value = ""; sync(); h.search(""); return; }
      if(e.key === "ArrowDown" || e.key === "ArrowUp"){ if(h.query()){ e.preventDefault(); h.move(e.key === "ArrowDown" ? 1 : -1); } return; }
      if(e.key !== "Enter") return;
      e.preventDefault();
      var v = q.value.trim(); if(!v){ h.search(""); return; }
      if(v.charAt(0) === "+" && v.length > 1) v = "할 일: " + v.replace(/^\+\s*/, "");   // v2.7: "+ 할 일" = 할 일 넣기 (도구 화면 검색창과 같게)
      if(/^(종례|할\s*일|todo|소식)\s*[:：]/i.test(v) && window.TT_FIND && TT_FIND.rows){ var r = TT_FIND.rows(v).filter(function(r){ return !r.h && !r.bag && r.go; })[0]; if(r){ r.go(); q.value = ""; sync(); h.search(""); return; } }
      if(h.query() === v) h.run(); else h.search(v);
    });
    x.addEventListener("click", function(){ q.value = ""; sync(); var h = SH(); if(h) h.search(""); q.focus(); });
  }
  function focusSearch(v){ var q = qEl(); if(!q) return false; if(typeof v === "string" && v){ q.value = v; q.dispatchEvent(new Event("input")); } q.focus(); try{ q.setSelectionRange(q.value.length, q.value.length); }catch(e){} return true; }
  function clearSearch(){ var q = qEl(); if(q){ q.value = ""; var x = hero.querySelector("[data-qx]"); if(x) x.hidden = true; } }

  /* ── ②·③ 도구 화면: 왼쪽 막대 + 좁은 화면 위쪽 줄 ── */
  var rail = null, bar = null;
  function tools(mid){
    if(typeof TT_TOOLS === "undefined") return [];
    return TT_TOOLS.filter(function(t){
      if(!t.ready || !t.href || t.noRail || (CRM && !t.room)) return false;   // v2.8.1: 리모컨은 교과서 화면 위 [📱 리모컨] 단추로 (왼쪽 목록이 길어 스크롤 생기지 않게)
      if(typeof ttToolShown === "function" && !ttToolShown(t)) return false;
      if(mid === "lib") return t.menu === "school" && t.group === "lib";
      if(mid === "school") return t.menu === "school" && t.group !== "lib";
      return t.menu === mid;
    });
  }
  /* v2.7: 쌤비·한마디(.rt)와 메뉴(.rn)만 1분마다 다시 그리고, 검색창(.rs)은 한 번 만든 그대로 둠(적던 글자·결과가 지워지지 않게) */
  function railTop(){
    var p = P();
    return '<button type="button" class="owl" id="sbBarOwl" title="쌤비 — 오늘 상황 · 말로 기록 (Alt+B)" aria-label="쌤비 열기 (Alt+B)">' + owlSvg(76) + "</button>"
      + '<div class="say"><b>' + esc(p.line || "") + "</b>" + (p.sub ? "<small>" + esc(p.sub) + "</small>" : "") + "</div>";
  }
  function fboxHTML(k){                                                  // 도구 화면 검색창: 누르면 바로 적기 (팝업 없음)
    return '<div class="q fq">' + icon("search", 16) + '<input id="sb' + k + 'q" type="text" enterkeyhint="search" autocomplete="off" spellcheck="false" aria-label="찾기 또는 한 줄 입력" placeholder="찾기">'
      + '<button type="button" class="fx" data-fx aria-label="지우기" hidden>✕</button><kbd title="어디서나 / 키 · Ctrl+F">/</kbd></div>';
  }
  function railHTML(){
    var cur = curMenu(), me = hereTool();
    return '<nav class="ml" aria-label="메뉴">' + MENUS.filter(function(m){ return shown(m[0]); }).map(function(m){
          var on = m[0] === cur, L = on ? tools(m[0]) : [];
          return '<a class="mi' + (on ? " on" : "") + '" href="' + esc(href(m[0])) + '" data-m="' + m[0] + '" title="' + m[1] + (KEYS[m[0]] ? " (" + KEYS[m[0]] + ")" : "") + '">' + icon(m[0], 20) + "<span>" + m[1] + "</span>" + (m[0] === "homeroom" ? treeTag() : "") + "</a>"
            + (L.length ? '<div class="tl" role="group" aria-label="' + m[1] + ' 도구">' + L.map(function(t){
                var here = me && me.id === t.id;
                return '<a class="ti' + (here ? " on" : "") + '" href="' + esc(BASE + t.href) + '" title="' + esc(t.name) + '"' + (here ? ' aria-current="page"' : "") + ">" + (ART ? ART.toolIcon(t.id, t.icon, 16) : "") + "<span>" + esc(t.short || t.name) + "</span></a>";
              }).join("") + "</div>" : "");
        }).join("") + "</nav>";
  }
  /* v2.8 우리 반 나무: 메뉴 '우리 반' 옆 작은 나무 (칭찬·청소 당번 완료로 자람) — 누르면 도장판 */
  function treeTag(){
    if(CRM || !TT.joy || !TT.joy.treeNow || (TT.joy.on && !TT.joy.on())) return "";
    var t = TT.joy.treeNow(); return '<i class="sbTree" data-tree title="우리 반 ' + esc(t.nm) + " · 칭찬·청소 당번 완료 " + t.n + "번" + (t.next ? " · " + t.nnm + "까지 " + t.next + "번" : "") + '">' + t.ic + "</i>";
  }
  /* v2.8.1 왼쪽 막대가 화면보다 길면 조금씩 줄여 스크롤 없이: ① 칸 높이·쌤비 크기 ② 쌤비 한마디 숨김 */
  function fitRail(){
    if(!rail || !rail.offsetHeight) return;
    rail.classList.remove("tight", "tighter");
    if(rail.scrollHeight > rail.clientHeight + 2) rail.classList.add("tight");
    if(rail.scrollHeight > rail.clientHeight + 2) rail.classList.add("tighter");
  }
  window.addEventListener("resize", function(){ clearTimeout(fitRail.t); fitRail.t = setTimeout(fitRail, 150); });
  function barTabs(){
    var cur = curMenu();
    return MENUS.filter(function(m){ return shown(m[0]); }).map(function(m){
      return '<a href="' + esc(href(m[0])) + '" data-m="' + m[0] + '"' + (m[0] === cur ? ' class="on" aria-current="page"' : "") + ">" + icon(m[0], 18) + "<span>" + m[1] + "</span></a>";
    }).join("");
  }
  function barSubs(){
    var L = tools(curMenu()), me = hereTool();
    if(L.length < 2) return "";
    return L.map(function(t){
      var here = me && me.id === t.id;
      return '<a class="si' + (here ? " on" : "") + '" href="' + esc(BASE + t.href) + '" title="' + esc(t.name) + '"' + (here ? ' aria-current="page"' : "") + ">" + (ART ? ART.toolIcon(t.id, t.icon, 16) : esc(t.icon || "")) + "<span>" + esc(t.short || t.name) + "</span></a>";
    }).join("");
  }
  function drawApp(){
    if(!rail){
      rail = document.createElement("aside"); rail.id = "sbRail"; rail.setAttribute("aria-label", "쌤비와 메뉴");
      rail.innerHTML = '<div class="rt"></div><div class="rs">' + fboxHTML("R") + '<div class="fr" id="sbRr" hidden></div></div><div class="rn"></div>';
      document.body.appendChild(rail); document.body.classList.add("sbRailOn");
    }
    if(!bar){
      bar = document.createElement("div"); bar.id = "sbBar";
      bar.innerHTML = '<div class="in"><span class="bo"></span>' + fboxHTML("B") + '<button type="button" class="ib" data-mic aria-label="말로 기록">' + icon("mic", 18) + '</button></div><div class="fr" id="sbBr" hidden></div><nav class="sbTabs" aria-label="메뉴"></nav><nav class="sbSubs" aria-label="이 메뉴의 도구"></nav>';
      document.body.insertBefore(bar, document.body.firstChild); document.body.classList.add("sbBarOn");
      F.wire("R"); F.wire("B");
    }
    rail.querySelector(".rt").innerHTML = railTop(); rail.querySelector(".rn").innerHTML = railHTML();
    bar.querySelector(".bo").innerHTML = '<button type="button" class="owl" id="sbBarOwl2" title="쌤비 (Alt+B)" aria-label="쌤비 열기">' + owlSvg(46) + "</button>";
    bar.querySelector(".sbTabs").innerHTML = barTabs();
    var sbs = bar.querySelector(".sbSubs"), subH = barSubs();   // v2.24.1 휴대폰: 지금 메뉴의 도구(소메뉴)를 한 줄로 — 옆으로 밀어 다른 도구로
    if(sbs.getAttribute("data-h") !== subH){ sbs.setAttribute("data-h", subH); sbs.innerHTML = subH; sbs.hidden = !subH; var on = sbs.querySelector(".on"); if(on) setTimeout(function(){ try{ sbs.scrollLeft = on.offsetLeft - (sbs.clientWidth - on.offsetWidth) / 2; }catch(e){} }, 30); }
    F.ph(); headIcon(); fitRail();
    requestAnimationFrame(function(){ R.classList.add("sbReady"); fitRail(); }); setTimeout(function(){ R.classList.add("sbReady"); }, 120);   // v2.8.1: 창이 뒤에 있어 그림 신호가 늦어도 보이게
  }

  /* ── v2.7 도구 화면 검색창: 오른쪽 화면이 무엇이냐에 따라 찾는 곳이 바뀝니다 ──
     화면이 window.TT_SBFIND_P 에 '찾기'를 정해 두면 그것을 쓰고(문서 · 업무판 · 내선번호 …), 없으면 기본(학생 · 도구 · 내선번호 · 자료실).
     찾기 = {key, ph:안내 글자, find(q), step(±1)?:다음·이전, page(n)?:쪽 이동, clear()} — 결과는 TT_SBAR.show({n, i, busy, rows:[{ic, tx(html), sub(html), go}], note, more})
     ·  "+ 할 일"처럼 +로 시작하면 내 할 일에 넣기 · 비운 채 누르면 최근 찾은 말 · Enter 다음 / Shift+Enter 이전 · Esc 지우기 */
  var F = (function(){
    var act = "R", q = "", T = 0, res = null, sel = 0, RK = "tt_sbq_recent_v1";
    function inp(k){ return document.getElementById("sb" + (k || act) + "q"); }
    function box(k){ return document.getElementById("sb" + (k || act) + "r"); }
    function prov(){ var p = window.TT_SBFIND_P; return p && typeof p.find === "function" ? p : DEF; }
    function both(fn){ ["R", "B"].forEach(function(k){ var i = inp(k), b = box(k); if(i && b) fn(i, b, k); }); }
    function ph(){ var p = prov(); both(function(i){ i.placeholder = p.ph || "찾기"; }); }
    function recent(){ var o = TT.store.get(RK, null) || {}; return (o[prov().key || "all"] || []).slice(0, 4); }
    function remember(v){
      v = String(v || "").trim(); if(v.length < 2 || v.charAt(0) === "+" || /^\d+$/.test(v)) return;
      var o = TT.store.get(RK, null) || {}, k = prov().key || "all", L = (o[k] || []).filter(function(x){ return x !== v; });
      L.unshift(v); o[k] = L.slice(0, 6);
      try{ if(TT.joy && TT.joy.count) TT.joy.count("find"); }catch(e){}   // 배지 '검색창으로 찾기 50번'
      var ks = Object.keys(o); if(ks.length > 30) delete o[ks[0]];
      TT.store.set(RK, o);
    }
    function todoRow(v){
      var t = v.replace(/^\+\s*/, "").trim();
      return {n: null, rows: t ? [{ic: "📝", tx: "내 할 일에 넣기 · <b>" + esc(t) + "</b>", sub: "Enter · 앞에 '내일'을 쓰면 내일 할 일", go: function(){ addTodo(t); }}] : [], note: t ? "" : "+ 다음에 할 일을 적어 주세요"};
    }
    function addTodo(t){
      var d = "", m = t.match(/^(오늘|내일|모레)\s+/), n = new Date();
      if(m){ var x = new Date(n.getFullYear(), n.getMonth(), n.getDate() + {"오늘": 0, "내일": 1, "모레": 2}[m[1]]); d = x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate()); t = t.slice(m[0].length); }
      t = t.trim().slice(0, 120); if(!t) return;
      var M = TT.store.get("tt_mytodo_v1", null); M = M && Array.isArray(M.items) ? M : {items: []};
      M.items.push({id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text: t, date: d, done: false, created: Date.now()});
      TT.store.set("tt_mytodo_v1", M); window.dispatchEvent(new CustomEvent("tt-mytodo-change", {detail: "rail"}));
      TT.ui.toast("📝 내 할 일에 넣었습니다" + (m ? " · " + m[1] : "")); clear();
    }
    function run(v){
      q = String(v == null ? "" : v); var t = q.trim(), p = prov();
      if(!t){ try{ p.clear && p.clear(); }catch(e){} res = null; paint(); return; }
      if(t.charAt(0) === "+"){ try{ p.clear && p.clear(); }catch(e){} show(todoRow(t)); return; }
      if(/^\d{1,4}$/.test(t) && p.page){ show({n: null, rows: [{ic: "↪", tx: "<b>" + t + "쪽</b>으로 가기", sub: "Enter", go: function(){ p.page(+t); }}]}); return; }
      try{ p.find(t); }catch(e){ show({n: 0, rows: [], note: "찾지 못했어요"}); }
    }
    function show(r){ res = r || null; sel = 0; paint(); }
    function paint(){
      var t = q.trim(), p = prov();
      both(function(i, b){
        var x = i.parentNode.querySelector("[data-fx]"); if(x) x.hidden = !i.value;
        var h = "";
        if(!t){
          var L = recent();
          if(L.length && document.activeElement === i) h = '<div class="rc"><span>최근</span>' + L.map(function(w){ return '<button type="button" data-rq="' + esc(w) + '">' + esc(w) + "</button>"; }).join("") + "</div>";
        }else if(res){
          if(res.n != null || res.busy) h += '<div class="fh"><span>' + (res.n ? (res.i ? "<b>" + res.i + "</b> / " : "") + res.n + "곳" : res.busy ? "찾는 중…" : "없어요") + (res.busy && res.n ? " · 찾는 중" : "") + "</span>"
            + (p.step && res.n ? '<button type="button" data-fs="-1" title="이전 (Shift+Enter)">▲</button><button type="button" data-fs="1" title="다음 (Enter)">▼</button>' : "") + "</div>";
          h += (res.rows || []).slice(0, 40).map(function(r, k){
            return '<button type="button" class="r' + (k === sel && !p.step ? " on" : "") + '" data-ri="' + k + '"><b>' + (r.ic ? '<i>' + r.ic + "</i>" : "") + r.tx + "</b>" + (r.sub ? "<small>" + r.sub + "</small>" : "") + "</button>";
          }).join("");
          if(res.note) h += '<div class="fn">' + res.note + "</div>";
        }
        b.innerHTML = h; b.hidden = !h;
      });
    }
    function pick(k){ var r = res && res.rows && res.rows[k]; if(!r || !r.go) return; remember(q); try{ r.go(); }catch(e){} }
    function clear(){ both(function(i){ i.value = ""; }); run(""); }
    function wire(k){
      var i = inp(k), b = box(k); if(!i || !b) return;
      i.addEventListener("focus", function(){ act = k; if(!i.value) paint(); });
      i.addEventListener("blur", function(){ setTimeout(function(){ if(!q.trim()) paint(); }, 200); });
      i.addEventListener("input", function(){ act = k; both(function(o){ if(o !== i) o.value = i.value; }); clearTimeout(T); var v = i.value; paint(); T = setTimeout(function(){ run(v); }, /^\s*\+/.test(v) ? 0 : 220); });
      i.addEventListener("keydown", function(e){
        if(e.isComposing) return;
        var p = prov(), n = res && res.rows ? res.rows.length : 0;
        if(e.key === "Escape"){ e.preventDefault(); if(i.value) clear(); else i.blur(); return; }
        if(e.key === "ArrowDown" || e.key === "ArrowUp"){
          e.preventDefault(); var d = e.key === "ArrowDown" ? 1 : -1;
          if(p.step && res && res.n) p.step(d); else if(n){ sel = (sel + d + n) % n; paint(); }
          return;
        }
        if(e.key !== "Enter") return;
        e.preventDefault(); clearTimeout(T);
        var v = i.value.trim(); if(!v) return;
        if(v !== q.trim()){ run(i.value); if(v.charAt(0) !== "+" && !/^\d{1,4}$/.test(v)) return; }
        if(v.charAt(0) === "+" || (/^\d{1,4}$/.test(v) && p.page)){ pick(0); return; }
        if(p.step && res && res.n){ remember(v); p.step(e.shiftKey ? -1 : 1); return; }
        if(n) pick(sel);
      });
      b.addEventListener("mousedown", function(e){ if(e.target.closest("button")) e.preventDefault(); });   // 누르는 동안 검색창 초점 유지
      b.addEventListener("click", function(e){
        var r = e.target.closest("[data-ri]"), s = e.target.closest("[data-fs]"), w = e.target.closest("[data-rq]");
        if(r){ pick(+r.dataset.ri); return; }
        if(s){ var p = prov(); if(p.step){ remember(q); p.step(+s.dataset.fs); } return; }
        if(w){ both(function(o){ o.value = w.dataset.rq; }); run(w.dataset.rq); i.focus(); }
      });
      i.parentNode.querySelector("[data-fx]").addEventListener("click", function(){ clear(); i.focus(); });
    }
    function visible(){ var r = inp("R"), b = inp("B"); return r && r.offsetParent !== null ? r : b && b.offsetParent !== null ? b : r || b; }
    function focus(v){
      var i = visible(); if(!i) return false; act = i.id === "sbBq" ? "B" : "R";
      if(typeof v === "string" && v){ both(function(o){ o.value = v; }); run(v); } else paint();
      i.focus(); try{ i.select(); }catch(e){} return true;
    }
    function refresh(){ ph(); if(q.trim()) run(q); else paint(); }
    return {wire: wire, ph: ph, show: show, focus: focus, refresh: refresh, clear: clear, q: function(){ return q.trim(); }};
  })();

  /* 기본 찾기: 학생 이름 → 학생 카드 · 도구 이름 → 바로 열기 · 내선번호 → 복사 · 자료실에서 찾기 */
  var libdTried = false;
  function students(){ var out = []; try{ TT.roster.classes().forEach(function(c){ (c.students || []).forEach(function(s){ if(s.name) out.push({c: c, s: s}); }); }); }catch(e){} return out; }
  var DEF = {
    key: "all",
    get ph(){ var m = curMenu(); return m === "student" || m === "homeroom" ? "학생 이름 · 도구 찾기" : "도구 · 학생 · 자료 찾기"; },
    find: function(qq){
      var low = qq.toLowerCase(), m = curMenu(), stuFirst = m === "student" || m === "homeroom";
      var S = students().filter(function(x){ return x.s.name.indexOf(qq) >= 0; }).slice(0, 6).map(function(x){
        return {ic: "🧑‍🎓", tx: esc(x.s.name) + " <small>" + esc(x.c.name) + " " + esc(x.s.no) + "번</small>", sub: "학생 카드", go: function(){ location.href = BASE + "apps/stucard/?c=" + encodeURIComponent(x.c.id) + "&no=" + encodeURIComponent(x.s.no); }};
      });
      var T = (typeof TT_TOOLS === "undefined" ? [] : TT_TOOLS).filter(function(t){
        return t.ready && t.href && (typeof ttToolShown !== "function" || ttToolShown(t)) && (t.name + " " + (t.short || "") + " " + (t.old || "") + " " + (t.desc || "") + " " + t.id).toLowerCase().indexOf(low) >= 0;
      }).slice(0, 5).map(function(t){ return {ic: t.icon, tx: esc(t.name), sub: "도구", go: function(){ location.href = BASE + t.href; }}; });
      if(!window.TT_LIBD && !libdTried){ libdTried = true; var s = document.createElement("script"); s.src = BASE + "shared/libd.js?v=" + (TT.VERSION || ""); s.onload = function(){ if(F.q()) F.refresh(); }; document.head.appendChild(s); }
      var E = window.TT_LIBD ? TT_LIBD.extCached().filter(function(x){ return (x.n + " " + x.d + " " + (x.m || "")).toLowerCase().indexOf(low) >= 0 || x.t === qq; }).slice(0, 4).map(function(x){
        return {ic: "📞", tx: "<b>" + esc(x.t) + "</b> " + esc(x.n), sub: esc(x.d) + " · 누르면 번호 복사", go: function(){ try{ navigator.clipboard.writeText(x.t); }catch(e){} TT.ui.toast("📞 " + x.n + " " + x.t + " — 번호를 복사했어요"); }};
      }) : [];
      var rows = stuFirst ? S.concat(T, E) : T.concat(S, E), n = rows.length;
      if(qq.length >= 2) rows.push({ic: "🗂️", tx: "자료실에서 '" + esc(qq) + "' 찾기", sub: "규정집 · 교육계획서 · 기재요령 등 내용까지", go: function(){ location.href = BASE + "apps/lib/?q=" + encodeURIComponent(qq); }});
      F.show({n: n, rows: rows, note: n ? "" : "맞는 학생·도구가 없어요"});
    },
    clear: function(){}
  };
  /* 도구 머리말: 제목 앞 컬러 이모지(🔎 🧭 📇 …)를 홈·왼쪽 막대와 같은 선 아이콘으로 (쌤비 홈 디자인일 때만) */
  var EMO = /^[\s\u200d\ufe0f]*(?:[\u2190-\u2bff\u2600-\u27bf\u3297\u3299]|\ud83c[\udc00-\udfff]|\ud83d[\udc00-\udfff]|\ud83e[\udc00-\udfff])[\u200d\ufe0f\ud83c\udffb-\udfff]*\s*/;
  function headIcon(){
    var h = document.querySelector("header h1"); if(!h || h.dataset.sbi) return;
    var me = hereTool(), tn = null;
    for(var n = h.firstChild; n; n = n.nextSibling){ if(n.nodeType === 3 && n.nodeValue.trim()){ tn = n; break; } if(n.nodeType === 1) break; }
    if(!tn || !EMO.test(tn.nodeValue)) return;
    var em = tn.nodeValue.match(EMO)[0].trim(); tn.nodeValue = tn.nodeValue.replace(EMO, "");
    var sp = document.createElement("span"); sp.className = "sbHi"; sp.setAttribute("aria-hidden", "true");
    sp.innerHTML = ART && ART.toolIcon ? ART.toolIcon(me ? me.id : "", em, 24) : esc(em);
    h.insertBefore(sp, h.firstChild); h.dataset.sbi = "1";
  }
  function draw(){ if(HOME) drawHero(); else drawApp(); }

  /* ── 누르기 ── */
  function owlEl(){ if(HOME && hero && document.body.classList.contains("sbOn")) return hero.querySelector(".srow [data-mic]") || document.getElementById("sbBarOwl"); var a = document.getElementById("sbBarOwl"), b = document.getElementById("sbBarOwl2"); return a && a.offsetParent !== null ? a : b && b.offsetParent !== null ? b : a; }
  function openSsambi(listen){
    if(CRM || !window.TT_SSAMBI) return;
    var box = document.getElementById("sbBox");
    if(!listen && box && !box.hidden){ TT_SSAMBI.close(); return; }
    if(HOME && hero) seatBox();
    TT_SSAMBI.open("menu", null, owlEl());
    if(HOME && hero) seatBox();
    if(listen){ var b = document.querySelector('#sbBox [data-a="talk"],#sbBox [data-a="listen"]'); if(b) b.click(); }
  }
  function v2home(){ return HOME && R.getAttribute("data-ui") === "ssambi" && document.body.classList.contains("sbOn"); }
  function find(){ if(v2home()) focusSearch(""); else if(HOME && window.TT_FIND) TT_FIND.open(""); else if(!HOME && F.focus("")) return; else location.href = BASE + "?sb=find"; }
  if(HOME){                                                             // 쌤비 홈에서는 찾기 창 대신 이 검색창으로 (Ctrl+K · / · 할 일 적기 · 도구 화면에서 넘어온 찾기)
    var wrapFind = function(){ if(!window.TT_FIND || TT_FIND.__sb) return; var o = TT_FIND.open; TT_FIND.open = function(q){ if(v2home() && focusSearch(q || "")) return; return o.apply(this, arguments); }; TT_FIND.__sb = 1; };
    wrapFind(); window.addEventListener("load", wrapFind);
    document.addEventListener("keydown", function(e){
      if(!v2home()) return;
      if((e.ctrlKey || e.metaKey) && !e.altKey && (e.code === "KeyK" || e.key === "k" || e.key === "K")){ e.preventDefault(); e.stopImmediatePropagation(); focusSearch(""); }
    }, true);
  }
  document.addEventListener("click", function(e){
    var host = e.target.closest && e.target.closest("#sbHero,#sbRail,#sbBar"); if(!host) return;
    if(e.target.closest("[data-tree]") && TT.joy){ e.preventDefault(); e.stopPropagation(); TT.joy.open("tree"); return; }   // v2.8 우리 반 나무
    var ta = e.target.closest(".bub [data-tact]"); if(ta && window.TT_TALK){ e.stopPropagation(); TT_TALK.act(ta.getAttribute("data-tact")); return; }   // v2.13 쌤비 이야기 단추
    if(e.target.closest(".bub.talk .b0") && window.TT_TALK){ TT_TALK.next(); return; }                                   // 말풍선을 누르면 다음 이야기
    if(e.target.closest(".bub .b0") && window.TT_SBHOME && TT_SBHOME.prepGo && document.querySelector("#prep .pi")){ TT_SBHOME.prepGo(); return; }   // 시작 준비 → 말풍선을 누르면 바로
    var t = e.target.closest("button,a"); if(!t || (t.closest("#more") && !t.dataset.m)) return;
    if(t.id === "sbBarOwl" || t.id === "sbBarOwl2"){ e.stopPropagation(); openSsambi(false); return; }
    if(t.hasAttribute("data-mic")){ e.stopPropagation(); openSsambi(true); return; }
    if(t.hasAttribute("data-q")){ find(); return; }
    if(t.hasAttribute("data-qx")) return;
    if(t.hasAttribute("data-plus")){ if(window.TT_QUICK) TT_QUICK.open(); return; }
    var m = t.dataset.m; if(!m) return;
    setSub(m === "lib" ? "lib" : "");
    if(REP[m]) return;                                                  // 대표 도구로 그대로 이동
    if(HOME){                                                           // 첫 화면 안에서는 다시 불러오지 않고 화면만 바꿈
      e.preventDefault();
      var h = m === "home" ? "" : m === "lib" ? "school" : m;
      if((location.hash || "").replace(/^#/, "") === h){ draw(); window.dispatchEvent(new Event("tt-home-change")); }
      else location.hash = h;
    }
  }, true);
  document.addEventListener("keydown", function(e){                    // v2.7: 문서·업무판을 볼 때 Ctrl+F → 브라우저 찾기 대신 왼쪽 검색창
    if(HOME || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || !(e.code === "KeyF" || e.key === "f" || e.key === "F") || R.getAttribute("data-ui") !== "ssambi") return;
    var p = window.TT_SBFIND_P; if(!p || !p.step) return;
    e.preventDefault(); F.focus("");
  }, true);
  document.addEventListener("keydown", function(e){                    // 도구 화면에서도 / → 찾기 (첫 화면은 shared/sbhome.js)
    if(HOME || e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || R.getAttribute("data-ui") !== "ssambi") return;
    var a = document.activeElement, tg = a && a.tagName;
    if(tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT" || (a && a.isContentEditable) || document.querySelector("dialog[open]")) return;
    e.preventDefault(); find();
  });
  window.addEventListener("hashchange", function(){ if(!/^#?school$/.test(location.hash)) setSub(""); draw(); });
  window.addEventListener("popstate", draw);
  window.addEventListener("load", draw);
  setInterval(function(){                                               // 쌤비가 듣는 중이면 귀 기울이기
    var lis = !!document.querySelector("#sbBox:not([hidden]) .lis, #sbBtn.lis");
    Array.prototype.forEach.call(document.querySelectorAll("#sbBarOwl svg,#sbBarOwl2 svg"), function(o){ o.classList.toggle("lis", lis); });
  }, 700);
  setInterval(function(){ if(document.visibilityState === "visible" && !(document.getElementById("more") || {}).open) draw(); }, 60 * 1000);   // 시각·한마디
  new MutationObserver(function(){ if(HOME) seatMore(); draw(); }).observe(R, {attributes: true, attributeFilter: ["data-look", "data-ui"]});

  document.addEventListener("tt-wx", function(){ if(window.TT_SBHOME && TT_SBHOME.render && HOME) TT_SBHOME.render(); else draw(); });   // v2.12 날씨를 새로 받으면
  window.TT_SBAR = {
    prop: function(it){ if(tempItem === (it || null)) return; tempItem = it || null; draw(); },
    setOwl: function(p){ var k = JSON.stringify(p || null); if(k === JSON.stringify(owlState)) return; owlState = p || null; draw(); },
    draw: draw, cur: curMenu, sub: sub, seatBox: function(){ if(HOME && hero) seatBox(); },
    focusSearch: function(v){ return HOME ? focusSearch(v) : F.focus(v); }, clearSearch: function(){ if(HOME) clearSearch(); else F.clear(); },
    show: function(r){ if(!HOME) F.show(r); }, refresh: function(){ if(!HOME) F.refresh(); }, query: function(){ return HOME ? "" : F.q(); }   // v2.7: 도구 화면 검색창 (화면이 정한 찾기 window.TT_SBFIND_P)
  };
  if(document.body) draw(); else document.addEventListener("DOMContentLoaded", draw);
})();
