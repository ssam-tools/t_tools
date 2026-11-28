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
  if(!window.TT_MOB && !document.querySelector('script[src*="shared/mob.js"]')){ var ms = document.createElement("script"); ms.src = BASE + "shared/mob.js?v=" + (TT.VERSION || ""); document.head.appendChild(ms); }   // v2.56 휴대폰 화면
  var HOME = !/\/apps\//.test(location.pathname);
  if(!HOME && R.getAttribute("data-ui") !== "ssambi") return;          // 도구 화면은 쌤비 홈 디자인일 때만 (첫 화면은 바꾸는 즉시 보이도록 늘 만들어 둠)
  try{ if(localStorage.getItem("sb_rail_mini") === "1") R.classList.add("sbMini"); }catch(e){}   // v2.45 왼쪽 메뉴 접기(아이콘만) — 기억
  function miniBtn(){ var m = R.classList.contains("sbMini"); return '<button type="button" class="rmin" data-rmini title="' + (m ? "메뉴 펼치기" : "메뉴 접기") + '" aria-label="' + (m ? "메뉴 펼치기" : "메뉴 접기") + '">' + (m ? "»" : "«") + "</button>"; }
  var MENUS = [["home", "홈"], ["class", "수업"], ["homeroom", "우리 반"], ["student", "학생"], ["school", "학교"], ["lib", "자료실"], ["settings", "설정"]];
  var KEYS = {home: "Alt+1", "class": "Alt+2", homeroom: "Alt+3", student: "Alt+4", school: "Alt+5", settings: "Alt+0"};
  var SUBK = "sbSub";                                                  // 자료실 = 학교 메뉴의 자료실 묶음 (이 창에서만 기억)
  var DOW = "일월화수목금토";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function icon(n, s){ return ART && ART.icon ? ART.icon(n, s) : ""; }
  var CRM = !!TT.classroom;                                             // 교실 기기: 수업용(room) 도구가 있는 메뉴만, 검색·말로 기록·쌤비 창·나무 없음
  function PH(){ return typeof ttIsPhone === "function" && ttIsPhone(); }   // v2.55 휴대폰: 아래 탭 5칸(홈·수업·우리 반·학생·학교) — 자료실은 학교 안에, 설정은 오른쪽 위 ⋯
  function shown(id){ if(CRM) return id === "home" || tools(id).length > 0; if(PH() && (id === "lib" || id === "settings")) return false; return id === "home" || id === "settings" || id === "lib" || typeof ttMenuShown !== "function" || ttMenuShown(id); }
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
    if(id === "school") id = "schoolhub";                              // v2.55 학교 업무판 폴더 이름과 도구 id가 달라 메뉴 표시가 빠졌던 것
    return typeof TT_TOOLS !== "undefined" ? TT_TOOLS.filter(function(x){ return x.id === id; })[0] || null : null;
  }
  function curMenu(){
    if(HOME){
      var h = (location.hash || "").replace(/^#/, "");
      if(h === "school" && sub() === "lib") return "lib";
      return MENUS.some(function(m){ return m[0] === h; }) ? h : "home";
    }
    var t = hereTool(); if(!t) return "";
    return t.menu === "school" && t.group === "lib" && !PH() ? "lib" : t.menu;
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
  var REP_PH = {"class": "apps/journal/"};                             // v2.55 휴대폰: 수업 = 수업 기록 (교과서 띄우기는 PC·전자칠판)
  function rep(id){ return (PH() && !CRM && REP_PH[id]) || REP[id]; }
  function href(id){ return id === "home" ? BASE : rep(id) ? BASE + rep(id) : BASE + "#" + id; }
  if(HOME){                                                             // 예전 주소(#class …)·단축키(Alt+2~5)로 와도 대표 도구로
    var toRep = function(){
      if(R.getAttribute("data-ui") !== "ssambi") return false;
      var h = (location.hash || "").replace(/^#/, ""), k = h === "school" && sub() === "lib" ? "lib" : h;
      if(rep(k)){ location.replace(BASE + rep(k)); return true; }
      return false;
    };
    if(toRep()) return;
    window.addEventListener("hashchange", toRep);
  }

  /* ── ① 첫 화면·중메뉴 머리 ──
     쌤비를 누르거나 🎤를 누르면 따로 창을 띄우지 않고 쌤비 옆 말풍선이 그대로 쌤비 창이 됩니다(오늘 상황 · 말하기 · 듣는 중).
     검색창은 그 자리에서 적고 Enter → 결과는 메뉴 줄 아래(shared/sbhome.js). "종례: …" "할 일: …"은 Enter 한 번에 바로 넣음. */
  var hero = null;
  function briefHTML(p){                                                // v2.44 쌤비 브리핑: [꼬리표] 큰 한 줄 · 작은 설명 · 단추 / 다음 · 놓친 것
    var b = p.brief, ta = b.talkActs || (p.acts && p.talk ? p.acts : null);
    var acts = b.acts.map(function(a){ var c = "sbBtn" + (a[1] ? " p" : ""); return a[2] ? '<a class="' + c + '" href="' + esc(a[2]) + '">' + esc(a[0]) + "</a>" : '<button type="button" class="' + c + '" data-bact="' + a[3] + '">' + esc(a[0]) + "</button>"; }).join("")
      + (ta ? ta.map(function(a){ return '<button type="button" class="sbBtn" data-tact="' + esc(a[0]) + '">' + esc(a[1]) + "</button>"; }).join("") : "");
    var miss = b.miss.length ? b.miss.map(function(x){ return '<button type="button" class="chip" data-bmiss="' + x[1] + '">' + esc(x[0]) + "</button>"; }).join("") : '<span class="ok">없어요 ✓</span>';
    return '<div class="bub brief k-' + esc(b.kind) + (p.talk ? " talk" : "") + '" role="status"><div class="b0"' + (p.talk ? ' title="누르면 다음 이야기"' : "") + ">"
      + (p.ev ? '<div class="when"><span class="ev">📌 ' + esc(p.ev) + "</span></div>" : "")
      + (b.lab || p.tag ? '<div class="lab">' + (p.tag ? '<span class="ttag">' + esc(p.tag) + "</span>" : "") + esc(b.lab || "") + "</div>" : "")
      + "<p>" + esc(b.head || "") + "</p>" + (b.sub ? "<small>" + esc(b.sub) + "</small>" : "") + "</div>"
      + (acts ? '<div class="acts">' + acts + "</div>" : "")
      + (CRM ? "" : '<div class="bfoot">' + (b.next ? '<div class="bl nx"><span class="k">다음</span><span class="v">' + esc(b.next) + "</span></div>" : "")
      + '<div class="bl"><span class="k">놓친 것</span><span class="v chips">' + miss + "</span></div></div>") + "</div>";
  }
  function hrowHTML(){
    var p = P(), d = new Date(), s = (TT.school && TT.school.load ? TT.school.load() : {}) || {};
    if(p.brief) return '<button type="button" class="owl" id="sbBarOwl" title="쌤비 — 오늘 상황 · 말로 기록 (Alt+B)" aria-label="쌤비 열기 (Alt+B)">' + owlSvg(132) + "</button>" + briefHTML(p);
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
    return '<div class="q">' + icon("search", 20) + '<label for="sbQ2" class="sr">찾기 또는 한 줄 입력</label><input id="sbQ2" type="text" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="찾기 · 적기 — 예: 3번 지각, + 내일 회의">'
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
      hero.innerHTML = '<div class="top"><span class="sp"></span><nav class="circ" aria-label="메뉴"></nav><button type="button" class="fav" id="sbFav" aria-label="자주 가는 사이트 (Alt+S)" title="자주 가는 사이트 (Alt+S)" aria-expanded="false" aria-haspopup="dialog">' + icon("star", 19) + '</button></div><div class="hrow"></div><div class="srow">' + srowHTML() + '</div>';   // v2.44 메뉴는 맨 위 줄에 작게 (휴대폰은 아래 탭 줄)
      document.body.insertBefore(hero, document.body.firstChild);
      wireSearch();
    }
    var box = document.getElementById("sbBox"); if(box && hero.contains(box)) document.body.appendChild(box);   // 다시 그리는 동안 쌤비 창을 잠깐 비켜 둠
    hero.querySelector(".hrow").innerHTML = hrowHTML(); hero.querySelector(".top .sp").innerHTML = dateHTML();
    hero.querySelector(".circ").innerHTML = circHTML();
    homeRail();
    seatMore(); seatBox(); alignSoon();
  }
  /* v2.45 홈·설정에도 도구 화면과 같은 왼쪽 메뉴 (PC) — 위쪽 쌤비·검색창 자리는 쌤 노트 로고 (가운데에 큰 쌤비·검색창이 있으므로) */
  var hrail = null;
  function homeRail(){
    var ok = R.getAttribute("data-ui") === "ssambi" && document.body.classList.contains("sbOn");
    if(!hrail){
      hrail = document.createElement("aside"); hrail.id = "sbRail"; hrail.className = "hm"; hrail.setAttribute("aria-label", "메뉴");
      hrail.innerHTML = '<div class="rh"></div><div class="rn"></div><div class="rb"></div>';
      document.body.appendChild(hrail);
    }
    hrail.hidden = !ok;
    if(document.body.classList.contains("sbRailOn") !== ok) document.body.classList.toggle("sbRailOn", ok);
    if(!ok) return;
    var rhH = meCard();   // v2.47 나의 학교생활 카드 (도구 화면의 쌤비·찾기 칸과 같은 높이)
    var rh = hrail.querySelector(".rh"); if(rh.getAttribute("data-h") !== rhH){ rh.setAttribute("data-h", rhH); rh.innerHTML = rhH; }
    hrail.querySelector(".rn").innerHTML = railHTML();
    hrail.querySelector(".rb").innerHTML = rbHTML(); fitNote(hrail);
  }
  /* v2.47 홈·설정 왼쪽 위: 나의 학교생활 카드 — 다른 곳에 없는 것만 (맨 위 줄=날짜·날씨·급식, 오른쪽=시간표)
     ① 누구인지(이름 · 담임 반/교과) ② 가장 가까운 큰 일정 D-day ③ 방학식·종업식까지 남은 수업일 + 막대 ④ 우리 반 나무 · 퇴근 도장 · 아낀 시간
     모든 계산은 이 기기 자료로만 (보내는 것 없음). 누르면 도장판·배지. */
  function ymdS(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function termInfo(){
    var C = TT.store.get("tt_calendar_v1", null), E = C && Array.isArray(C.events) ? C.events : [], now = new Date(), td = ymdS(now);
    var ends = E.filter(function(e){ return e && e.d >= td && /방학식|종업식/.test(e.t || ""); }).sort(function(a, b){ return a.d < b.d ? -1 : 1; });
    var m = now.getMonth() + 1, y = now.getFullYear(), end = ends[0] ? ends[0].d : (m >= 3 && m <= 7 ? y + "-07-20" : (m >= 8 ? y + 1 : y) + "-01-08");
    var endName = ends[0] ? (/종업식/.test(ends[0].t) ? "종업식" : /여름/.test(ends[0].t) || +end.slice(5, 7) <= 8 && +end.slice(5, 7) >= 6 ? "여름방학" : "겨울방학") : (m >= 3 && m <= 7 ? "여름방학" : "겨울방학");
    var starts = E.filter(function(e){ return e && e.d <= td && /개학|입학식|시업식/.test(e.t || ""); }).sort(function(a, b){ return a.d < b.d ? 1 : -1; });
    var start = starts[0] ? starts[0].d : (m >= 3 && m <= 7 ? y + "-03-02" : (m >= 8 ? y : y - 1) + "-08-17");
    var off = {}; E.forEach(function(e){ if(e && /방학|휴업|공휴|재량|개교기념|대체/.test(e.t || "") && !/방학식/.test(e.t || "")) off[e.d] = 1; });
    function days(a, b){ var n = 0, d = new Date(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10)), z = b; for(var i = 0; i < 400; i++){ var k = ymdS(d); if(k > z) break; var w = d.getDay(); if(w && w < 6 && !off[k]) n++; d.setDate(d.getDate() + 1); } return n; }
    if(end < start) return null;
    var all = days(start, end), left = days(td, end);
    return all ? {name: endName, left: left, pct: Math.max(0, Math.min(100, Math.round((all - left) / all * 100)))} : null;
  }
  function meCard(){
    var sc = (TT.school && TT.school.load ? TT.school.load() : {}) || {}, who = "";
    var hc = null; try{ hc = sc.role !== "subject" && TT.roster ? TT.roster.home() : null; }catch(e){}
    var cls = hc ? (hc.grade && hc.cls ? hc.grade + "-" + hc.cls : hc.name || "") : "";
    if(sc.teacher) who = esc(sc.teacher) + " 선생님" + (cls ? " · " + esc(cls) + " 담임" : sc.subject ? " · " + esc(sc.subject) : "");
    var J = TT.joy && (!TT.joy.on || TT.joy.on()) ? TT.joy : null, dd = J && J.dday ? J.dday() : null, ti = termInfo();
    var h = '<div class="mcTop"><a class="lg" href="' + esc(BASE) + '" title="쌤 노트 홈">' + (ART && ART.logo ? ART.logo(22) : "") + "<b>쌤 노트</b></a>" + "</div>";   // v2.50.1 학교 이름은 맨 위 줄에 있으므로 뺌
    h += '<button type="button" class="meCard" data-mecard title="도장판 · 배지 · 아낀 시간 보기">';
    h += '<span class="mcWho">' + (who || "쌤 노트에 오신 걸 환영해요") + "</span>";
    h += dd ? '<span class="mcD" title="' + esc(dd.t) + '"><b>' + (dd.n === 0 ? "D-DAY" : "D-" + dd.n) + "</b><span>" + esc(dd.t) + "</span></span>"
            : '<span class="mcD calm"><b>' + (new Date().getMonth() + 1) + "월</b><span>가까운 큰 일정 없음</span></span>";
    if(ti) h += '<span class="mcBar" aria-hidden="true"><i style="width:' + ti.pct + '%"></i></span><span class="mcT">' + ti.name + "까지 수업일 <b>" + ti.left + "일</b></span>";
    if(J && J.treeNow){
      var t = J.treeNow(), sk = J.streak ? J.streak() : 0, ms = J.monthStamps ? J.monthStamps() : 0, ws = J.weekSaved ? J.weekSaved() : 0;
      h += '<span class="mcJ"><span title="우리 반 나무 (칭찬·청소 당번 완료로 자라요)">' + t.ic + " " + esc(t.nm) + "</span>"
        + '<span title="퇴근 도장' + (J.stamped && J.stamped() ? " · 오늘 찍음" : "") + '">' + (J.stamped && J.stamped() ? "✅" : "🙌") + " " + (sk >= 2 ? sk + "일째" : "도장 " + ms) + "</span>"
        + '<span title="이번 주 아낀 시간">⏱️ ' + (ws >= 60 ? Math.floor(ws / 60) + "시간" : ws + "분") + "</span></span>";
    }
    h += '</button><span class="mcMini" title="' + (dd ? esc(dd.t) + " D-" + dd.n : "") + '">' + (dd ? "D-" + dd.n : "") + "</span>";
    return h;
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
      if(h.parse && h.parse(v)){ q.value = ""; sync(); return; }          // v2.44 "3번 지각" → 말풍선에서 저장 확인
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
    var HT = hereTool();
    return TT_TOOLS.filter(function(t){
      if(!t.ready || !t.href || t.noRail || (CRM && !t.room)) return false;   // v2.8.1: 리모컨은 교과서 화면 위 [📱 리모컨] 단추로 (왼쪽 목록이 길어 스크롤 생기지 않게)
      if(typeof ttToolShown === "function" && !ttToolShown(t) && !(HT && HT.id === t.id)) return false;   // 휴대폰에서 숨긴 도구도 지금 열린 화면이면 보임
      if(mid === "lib") return t.menu === "school" && t.group === "lib";
      if(mid === "school") return t.menu === "school" && (t.group !== "lib" || PH());   // 휴대폰: 자료실 탭이 없으니 학교 안에
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
            + (L.length ? '<div class="tl" role="group" aria-label="' + m[1] + ' 도구">' + (m[0] === "class" && L.length > 7 ? clsGroups(L, me) : L.map(function(t){ return tiHTML(t, me); }).join("")) + "</div>" : "");
        }).join("") + "</nav>";
  }
  function tiHTML(t, me){
    var here = me && me.id === t.id;
    return '<a class="ti' + (here ? " on" : "") + '" href="' + esc(BASE + t.href) + '" title="' + esc(t.name) + '"' + (here ? ' aria-current="page"' : "") + ">" + (ART ? ART.toolIcon(t.id, t.icon, 16) : "") + "<span>" + esc(t.short || t.name) + "</span></a>";
  }
  /* v2.49 수업 메뉴 묶음: 도구가 많으면 4묶음으로 — 지금 도구가 있는 묶음만 펼침(따로 펼친 묶음은 그대로), 누르면 접고 펼치기(이 기기에 기억) */
  var CG = [["run", "📘", "수업 진행", ["timetable", "book", "lessonkit", "class", "group", "journal"]],
            ["eval", "📝", "평가", ["mgen", "mcheck", "assess", "mblue"]],
            ["ref", "📚", "참고자료", ["concept", "hmath", "sites"]],
            ["act", "🎮", "학생 활동", ["play", "mlab", "stuprog"]]];
  var CGK = "sb_cls_open";
  function cgOpen(){ try{ return JSON.parse(localStorage.getItem(CGK) || "{}") || {}; }catch(e){ return {}; } }
  function cgOf(t){
    for(var i = 0; i < CG.length; i++) if(CG[i][3].indexOf(t.id) >= 0) return CG[i][0];
    return t.group === "eval" ? "eval" : t.group === "subject" ? "ref" : "run";   // 다른 교과 팩 도구도 알맞은 묶음으로
  }
  function clsGroups(L, me){
    var O = cgOpen(), meG = me ? cgOf(me) : "";
    return CG.map(function(g){
      var T = L.filter(function(t){ return cgOf(t) === g[0]; });
      if(!T.length) return "";
      T.sort(function(a, b){ var ia = g[3].indexOf(a.id), ib = g[3].indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
      var open = g[0] === meG || (O[g[0]] != null ? !!O[g[0]] : g[0] === (meG || "run"));   // 기본: 지금 도구가 있는 묶음만 (없으면 수업 진행)
      return '<button type="button" class="tg' + (open ? " op" : "") + (g[0] === meG ? " here" : "") + '" data-cg="' + g[0] + '" aria-expanded="' + open + '"' + (g[0] === meG ? " disabled" : "") + '><span>' + g[1] + " " + g[2] + "</span><em>" + (open ? "" : T.length) + "</em></button>"
        + (open ? T.map(function(t){ return tiHTML(t, me); }).join("") : "");
    }).join("");
  }
  /* v2.8 우리 반 나무: 메뉴 '우리 반' 옆 작은 나무 (칭찬·청소 당번 완료로 자람) — 누르면 도장판 */
  function treeTag(){
    if(CRM || !TT.joy || !TT.joy.treeNow || (TT.joy.on && !TT.joy.on())) return "";
    var t = TT.joy.treeNow(); return '<i class="sbTree" data-tree title="우리 반 ' + esc(t.nm) + " · 칭찬·청소 당번 완료 " + t.n + "번" + (t.next ? " · " + t.nnm + "까지 " + t.next + "번" : "") + '">' + t.ic + "</i>";
  }
  /* ── v2.50 📌 쌤비 쪽지 (왼쪽 메뉴 맨 아래 · 넓은 화면) — 쌤비 말풍선은 "지금 할 일", 쪽지는 "알아두면 좋은 것"
     ① 시기 업무 팁: 학사일정에서 10일 안 행사 → 챙길 것 / 없으면 이달의 업무 팁
     ② 알아두면 좋은 것: 백업 7~29일(30일부터는 쌤비가 직접 말함) · 숨은 기능·단축키 한 가지
     ③ 오늘의 한 줄: 고전·속담·쌤비 한마디 (하루 한 개)
     규칙: 칸은 한 개(최대 2줄)로 고정 · ‹ › 로 넘기기 · 제목을 누르면 접기 · ⚙ 로 받을 쪽지 고르기 · 급한 일이 있으면 숨음
     자료는 이 기기 것만 읽고 아무것도 보내지 않습니다. 교실 기기(공용)에서는 보이지 않습니다. */
  var NK = "sb_note_v1", nIdx = 0, nSet = false;
  function nCfg(){ try{ var c = JSON.parse(localStorage.getItem(NK) || "{}") || {}; c.off = c.off || {}; return c; }catch(e){ return {off: {}}; } }
  function nSave(c){ try{ localStorage.setItem(NK, JSON.stringify(c)); }catch(e){} }
  var NMON = {
    1: ["학년말 생기부 최종 점검 — 누락·오탈자 확인", "새 학년 업무분장·담임 희망서 제출일 확인", "학생 사진·연락처 파일 정리·파기"],
    2: ["새 명렬표가 오면 쌤 노트 명렬표에 올리기", "새 시간표는 내 시간표부터 넣어 두기", "학기초 세팅을 먼저 받아 두면 3월이 편해요"],
    3: ["기초조사서·개인정보 동의서 회수 확인", "학부모 상담 주간 전 상담 일지 준비", "결석계 제출 기한을 학생에게 미리 안내"],
    4: ["지필 출제 원안·이원목적분류표 점검", "체험학습 신청서와 보고서 기한 안내", "수행평가 채점 기준 공개 여부 확인"],
    5: ["수행평가 결과 확인·이의 신청 안내", "행사 전 안전교육 기록 남기기", "학생 관찰은 그날그날 한 줄씩"],
    6: ["1학기 기말 출제·검토 일정 확인", "1학기 생기부 누가기록 미리 정리", "방학 전 살필 학생 한 번 더 보기"],
    7: ["1학기 성적·생기부 입력 마감 확인", "방학 중 연락 방법·안전교육 안내", "1학기 결석계·증빙 빠진 것 확인"],
    8: ["2학기 시간표 교체부터 확인", "개학 첫 주 결석·지각 학생 살피기", "2학기 수행평가 기준 공개 준비"],
    9: ["2학기 지필 출제 일정 확인", "중3 담임: 고입 상담 자료 모으기", "체험학습 보고서 기한 지난 학생 확인"],
    10: ["중간 성적 확인·이의 신청 안내", "세특·행특용 관찰 기록 모아 두기", "현장체험 전 안전교육 기록 남기기"],
    11: ["생기부 집중 시기 — 글자 수·금지 표현 점검", "중3 담임: 고입 원서 일정·서류 확인", "2학기 기말 출제·검토 일정 확인"],
    12: ["학년말 생기부 점검·마감 일정 확인", "한 해 결석계·증빙 빠진 것 확인", "겨울방학 안전교육·연락 방법 안내"]
  };
  var NEV = [[/고사|시험|지필/, "출제 원안·답안지 점검, 감독표 확인"], [/방학식/, "방학 중 연락 방법·안전교육 안내"], [/체험|수학여행|수련|소풍/, "참가 동의서·안전교육·비상 연락망"],
             [/졸업/, "졸업장·상장 명단 최종 확인"], [/상담|학부모|총회/, "상담 일정표·상담 일지 준비"], [/개학|입학/, "시간표 교체·명렬표 변동 확인"], [/생활기록부|생기부|성적/, "입력·점검 마감 시각 확인"]];
  var NTIP = [["/ 키를 누르면 어디서나 바로 찾기", ""], ["Alt+1~5로 메뉴 이동, Alt+0은 설정", ""], ["Alt+B를 누르면 쌤비가 열려요", ""],
              ["검색창에 '3번 지각'처럼 적으면 바로 출결에 저장돼요", ""], ["검색창에 '+ 할 일'을 적으면 할 일에 들어가요", ""],
              ["맨 위 날짜에 마우스를 올리면 오늘 급식이 보여요", ""], ["맨 위 시각에 마우스를 올리면 지금 교시·하교 시간", ""],
              ["선생님 이름에 마우스를 올리면 내선·지금 수업 중인지", ""], ["반 이름(3-2)에 마우스를 올리면 담임·지금 수업 선생님", ""],
              ["공용 화면에서는 출결의 '이름 가리기'를 켜 두세요", "apps/tardy/"], ["☆ 자주 가는 사이트는 Alt+S로 열어요", ""]];
  var NQ = ["배우고 때때로 익히면 또한 기쁘지 아니한가. — 논어", "아는 것을 안다 하고 모르는 것을 모른다 하는 것, 그것이 앎이다. — 논어", "옛것을 익혀 새것을 알면 스승이 될 만하다. — 논어",
            "세 사람이 길을 가면 그중에 반드시 나의 스승이 있다. — 논어", "가르치고 배우며 함께 자란다. (교학상장) — 예기", "천하의 영재를 얻어 가르치는 것, 군자의 세 번째 즐거움. — 맹자",
            "천 리 길도 한 걸음부터. — 속담", "낙숫물이 댓돌을 뚫는다. — 속담", "백지장도 맞들면 낫다. — 속담", "말 한마디로 천 냥 빚을 갚는다. — 속담", "구슬이 서 말이라도 꿰어야 보배. — 속담", "급할수록 돌아가라. — 속담", "시작이 반이다. — 속담",
            "오늘 한 학생의 이름을 다정하게 불러 주는 것으로 충분해요. — 쌤비", "기록은 기억보다 힘이 세요. 오늘도 한 줄! — 쌤비", "느린 학생은 늦은 학생이 아니에요. — 쌤비",
            "좋은 질문을 한 학생을 오늘 한 번 칭찬해 볼까요? — 쌤비", "선생님이 웃으면 교실 온도가 1도 올라가요. — 쌤비", "오늘 못 끝낸 일은 내일의 할 일일 뿐이에요. — 쌤비",
            "쉬는 시간 물 한 잔, 잊지 마세요. — 쌤비", "완벽한 수업보다 다시 해 보는 수업이 학생을 키워요. — 쌤비"];
  function doy(d){ return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000); }
  function nItems(){
    var c = nCfg(), now = new Date(), td = ymdS(now), n = doy(now), out = [];
    try{ var FM = (TT.store.get("tt_fb_mine_v1", null) || {}).list || [], nr = FM.filter(function(x){ return x.reply && !x.seen; }).length;   // v2.54 보낸 의견에 온 답(늘 맨 앞)
      if(nr) out.push({k: "info", tag: "📬 답이 왔어요", t: "보낸 의견에 답이 " + nr + "개 왔어요 · 눌러서 보기", href: BASE + "?fb=1"}); }catch(e){}
    if(!c.off.tip){
      var E = TT.cal.list(td), lim = ymdS(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10)), ev = null;
      E.filter(function(e){ return e && e.d > td && e.d <= lim && e.t; }).sort(function(a, b){ return a.d < b.d ? -1 : 1; }).some(function(e){
        for(var i = 0; i < NEV.length; i++) if(NEV[i][0].test(e.t)){ ev = {e: e, tip: NEV[i][1]}; return true; } return false; });
      if(ev){ var dn = Math.round((new Date(+ev.e.d.slice(0, 4), +ev.e.d.slice(5, 7) - 1, +ev.e.d.slice(8, 10)) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
        out.push({k: "tip", tag: "D-" + dn + " 일정", ev: ev.e.t, t: ev.tip}); }
      var M = NMON[now.getMonth() + 1] || []; if(M.length) out.push({k: "tip", tag: (now.getMonth() + 1) + "월 업무 팁", t: M[n % M.length]});
    }
    if(!c.off.info){
      var bd = TT.backup && TT.backup.daysSince ? TT.backup.daysSince() : null;
      if(TT.backup && TT.backup.hasData && TT.backup.hasData() && bd != null && bd >= 7 && bd < 30) out.push({k: "info", tag: "알아두면", t: "백업한 지 " + bd + "일 · 설정에서 전체 백업 저장", href: BASE + "#settings"});
      var T = NTIP[n % NTIP.length]; out.push({k: "info", tag: "숨은 기능", t: T[0], href: T[1] ? BASE + T[1] : ""});
    }
    if(!c.off.quote) out.push({k: "quote", tag: "오늘의 한 줄", t: NQ[n % NQ.length]});
    return out;
  }
  function noteHTML(){
    if(CRM) return "";
    var c = nCfg(), L = nItems();
    if(nSet){
      var ck = function(k, t){ return '<label><input type="checkbox" data-ntk="' + k + '"' + (c.off[k] ? "" : " checked") + "> " + t + "</label>"; };
      return '<div class="sbNote set" aria-label="쌤비 쪽지 고르기"><div class="nh"><b>📌 받을 쪽지</b><button type="button" class="na" data-nt="set" title="닫기" aria-label="닫기">✓</button></div>'
        + '<div class="nck">' + ck("tip", "업무 팁") + ck("info", "알아두면 좋은 것") + ck("quote", "오늘의 한 줄") + "</div></div>";
    }
    if(!L.length) return '<div class="sbNote fold"><div class="nh"><button type="button" class="nt" data-nt="set" title="받을 쪽지 고르기">📌 쌤비 쪽지 꺼 둠</button><button type="button" class="na" data-nt="set" aria-label="쪽지 고르기">⚙</button></div></div>';
    nIdx = (nIdx % L.length + L.length) % L.length;
    var it = L[nIdx], body = (it.ev ? "<b>" + esc(it.ev) + "</b> · " : "") + esc(it.t), fold = !!c.fold, tip = (it.ev ? esc(it.ev) + " · " : "") + esc(it.t);   // v2.50.1 일정 이름은 잘리지 않게 본문 첫머리에
    var txt = it.href ? '<a class="nb" href="' + esc(it.href) + '" title="' + tip + '">' + body + "</a>" : '<p class="nb" title="' + tip + '">' + body + "</p>";
    return '<div class="sbNote k-' + it.k + (it.ev ? " ev" : "") + (fold ? " fold" : "") + '" aria-label="쌤비 쪽지"><div class="nh">'
      + '<button type="button" class="nt" data-nt="fold" title="' + esc(it.tag) + " · " + (fold ? "펼치기" : "접기") + '" aria-expanded="' + !fold + '">📌 <span>' + esc(it.tag) + "</span></button>"
      + (L.length > 1 ? '<button type="button" class="na" data-nt="prev" aria-label="이전 쪽지" title="이전 (' + (nIdx + 1) + "/" + L.length + ')">‹</button><button type="button" class="na" data-nt="next" aria-label="다음 쪽지" title="다음 (' + (nIdx + 1) + "/" + L.length + ')">›</button>' : "")
      + '<button type="button" class="na ng" data-nt="set" title="받을 쪽지 고르기" aria-label="받을 쪽지 고르기">⚙</button></div>' + txt + "</div>";
  }
  function urgentNow(){ var p = P(); return !!(p && p.item === "alarm"); }   // 급한 일은 쌤비가 말하므로 쪽지는 잠시 숨김
  function rbHTML(){ return '<div class="nw"' + (urgentNow() ? " hidden" : "") + ">" + noteHTML() + "</div>" + miniBtn(); }
  function noteRedraw(){ Array.prototype.forEach.call(document.querySelectorAll("#sbRail .nw"), function(w){ w.innerHTML = noteHTML(); }); }
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("#sbRail [data-nt]"); if(!b) return;
    e.preventDefault(); var a = b.getAttribute("data-nt"), c = nCfg();
    if(a === "next") nIdx++; else if(a === "prev") nIdx--; else if(a === "set") nSet = !nSet; else if(a === "fold"){ c.fold = !c.fold; nSave(c); }
    noteRedraw();
  });
  document.addEventListener("change", function(e){
    var k = e.target.getAttribute && e.target.getAttribute("data-ntk"); if(!k) return;
    var c = nCfg(); c.off[k] = !e.target.checked; nSave(c); nIdx = 0;
  });

  function fitNote(el){ if(!el || !el.offsetHeight) return; el.classList.remove("noNote"); if(el.scrollHeight > el.clientHeight + 2) el.classList.add("noNote"); }
  /* v2.8.1 왼쪽 막대가 화면보다 길면 조금씩 줄여 스크롤 없이: ① 칸 높이·쌤비 크기 ② 쌤비 한마디 숨김 */
  function fitRail(){                                                   // v2.46 위쪽·메뉴 줄은 그대로, 펼친 도구 목록만 줄이고 그래도 길면 목록 안에서 스크롤
    if(!rail || !rail.offsetHeight) return;
    rail.classList.remove("tight", "tighter", "noNote", "noteMini");
    function over(){ var tl = rail.querySelector(".tl"); return (tl && tl.scrollHeight > tl.clientHeight + 2) || rail.scrollHeight > rail.clientHeight + 2; }
    /* v2.53 자리가 모자라면: 쪽지 한 줄 → 도구 줄 간격 줄이기 → (그래도 메뉴 전체가 넘칠 때만) 쪽지 숨김 — 화면마다 메뉴 아래가 달라지지 않게 */
    if(over()) rail.classList.add("noteMini");
    if(over()) rail.classList.add("tight");
    if(over()) rail.classList.add("tighter");
    if(rail.scrollHeight > rail.clientHeight + 2) rail.classList.add("noNote");
    var tl0 = rail.querySelector(".tl"); if(tl0) tl0.classList.toggle("scr", tl0.scrollHeight > tl0.clientHeight + 2);   // 목록이 더 있으면 아래를 흐리게
    var on = rail.querySelector(".tl .ti.on"), tl = on && on.parentNode; if(tl && tl.scrollHeight > tl.clientHeight + 2){ var r = on.offsetTop - tl.offsetTop; if(r < tl.scrollTop || r > tl.scrollTop + tl.clientHeight - on.offsetHeight) tl.scrollTop = r - (tl.clientHeight - on.offsetHeight) / 2; }
  }
  /* v2.46 맨 위 줄(학교 · 날짜 · 시각 · 날씨 ……… ☆ ⋯)을 어느 화면에서나 같은 자리에: 왼쪽 메뉴 끝 + 28px ~ 화면 오른쪽 끝 - 28px
     (화면마다 몸통 여백·오른쪽 칸이 달라도 줄의 양 끝을 똑같이 맞춤) */
  function alignTop(el){
    if(!el) return;
    el.style.marginLeft = ""; el.style.marginRight = "";
    var rl = document.getElementById("sbRail");
    if(window.innerWidth < 900 || window.innerHeight < 460 || !rl || rl.hidden || !rl.offsetWidth || !el.offsetWidth) return;
    var r = el.getBoundingClientRect(), L = rl.getBoundingClientRect().right + 28, Rt = document.documentElement.clientWidth - 28;
    el.style.setProperty("margin-left", Math.round(L - r.left) + "px", "important");
    el.style.setProperty("margin-right", Math.round(r.right - Rt) + "px", "important");
  }
  function alignAll(){ alignTop(hero && hero.querySelector(".top")); alignTop(topEl); }
  var alT = 0; function alignSoon(){ cancelAnimationFrame(alT); alT = requestAnimationFrame(alignAll); }
  window.addEventListener("resize", alignSoon);
  new MutationObserver(alignSoon).observe(R, {attributes: true, attributeFilter: ["class"]});
  new MutationObserver(alignSoon).observe(document.body || R, {attributes: true, attributeFilter: ["class"]});
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
  /* v2.41 도구 화면 맨 위 줄: 홈·설정과 똑같이 [학교 · 날짜 · 시각 · 날씨 ……… ☆ ⋯] — 어느 화면에서나 같은 자리
     ⋯ 메뉴는 홈의 ⋯ 와 같은 순서. 이 화면에서 바로 되는 것(단축키·도장판·학기초 세팅·백업)은 바로, 나머지는 홈으로 가서 그 창을 엽니다(?m=) */
  /* v2.55 도구 화면 ⋯ 도 홈 ⋯ 와 같은 설정 칸으로 (누르면 홈에서 그 창) — 휴대폰은 시작 세팅·꾸미기·도움말만 */
  var HUBM = [["start", "🧳", "시작 세팅"], ["look", "🎨", "꾸미기"], ["data", "💾", "백업·새 학년", 1], ["help", "❓", "도움말"], ["admin", "🛡️", "관리", 1]];
  function topMenuHTML(){
    return HUBM.filter(function(x){ return !(x[3] && PH()); }).map(function(x){
      var ic = '<span class="mi">' + (ART && ART.toolIcon ? ART.toolIcon(null, x[1], 16) : esc(x[1])) + "</span>";
      return x[0] === "admin" ? '<a href="' + esc(BASE + "apps/admin/") + '" data-e="' + x[1] + '">' + ic + x[2] + "</a>"
        : '<button type="button" data-top="hub:' + x[0] + '" data-e="' + x[1] + '">' + ic + x[2] + "</button>";
    }).join("");
  }
  var topEl = null;
  function drawTop(){
    if(HOME) return;
    if(!topEl){
      topEl = document.createElement("div"); topEl.id = "sbTop"; topEl.className = "top";
      topEl.innerHTML = '<span class="sp"></span><button type="button" class="fav" id="sbFav" aria-label="자주 가는 사이트 (Alt+S)" title="자주 가는 사이트 (Alt+S)" aria-expanded="false" aria-haspopup="dialog">' + icon("star", 18) + "</button>"
        + (CRM ? "" : '<details class="more" id="sbMore"><summary aria-label="더 보기" title="설정">⋯</summary><div class="menu">' + topMenuHTML() + "</div></details>");
      document.body.insertBefore(topEl, document.body.firstChild); document.body.classList.add("sbTopOn");
      topEl.addEventListener("click", function(e){
        var b = e.target.closest("[data-top]"); if(!b) return;
        var id = b.getAttribute("data-top"), md = document.getElementById("sbMore"); if(md) md.open = false;
        if(id.indexOf("hub:") === 0){ location.href = BASE + "index.html?hub=" + id.slice(4); return; }   // v2.55 홈의 같은 설정 창
        if(id === "mKeys" && window.TT_KEYS && TT_KEYS.help){ TT_KEYS.help(); return; }
        if(id === "mJoy"){ if(TT.joy) TT.joy.open(); else TT.ui.toast("교실 기기에서는 재미 요소가 꺼져 있어요."); return; }
        if(id === "mBackup" && TT.backup && TT.backup.save){ TT.backup.save(); return; }
        if(id === "mRestore" && TT.backup && TT.backup.pick){ TT.backup.pick(); return; }
        location.href = BASE + "index.html?m=" + id;                     // 나머지는 홈의 같은 창으로
      });
      document.addEventListener("click", function(e){ var md = document.getElementById("sbMore"); if(md && md.open && !e.target.closest("#sbMore")) md.open = false; });
    }
    topEl.querySelector(".sp").innerHTML = dateHTML();
  }
  function drawApp(){
    drawTop();
    if(!rail){
      rail = document.createElement("aside"); rail.id = "sbRail"; rail.setAttribute("aria-label", "쌤비와 메뉴");
      rail.innerHTML = '<div class="rt"></div><div class="rs">' + fboxHTML("R") + '<div class="fr" id="sbRr" hidden></div></div><div class="rn"></div><div class="rb"></div>';
      document.body.appendChild(rail); document.body.classList.add("sbRailOn");
    }
    if(!bar){
      bar = document.createElement("div"); bar.id = "sbBar";
      bar.innerHTML = '<div class="in"><span class="bo"></span>' + fboxHTML("B") + '<button type="button" class="ib" data-mic aria-label="말로 기록">' + icon("mic", 18) + '</button></div><div class="fr" id="sbBr" hidden></div><nav class="sbTabs" aria-label="메뉴"></nav><nav class="sbSubs" aria-label="이 메뉴의 도구"></nav>';
      document.body.insertBefore(bar, topEl && topEl.parentNode === document.body ? topEl.nextSibling : document.body.firstChild); document.body.classList.add("sbBarOn");
      F.wire("R"); F.wire("B");
    }
    rail.querySelector(".rt").innerHTML = railTop(); rail.querySelector(".rn").innerHTML = railHTML(); rail.querySelector(".rb").innerHTML = rbHTML();
    bar.querySelector(".bo").innerHTML = '<button type="button" class="owl" id="sbBarOwl2" title="쌤비 (Alt+B)" aria-label="쌤비 열기">' + owlSvg(46) + "</button>";
    bar.querySelector(".sbTabs").innerHTML = barTabs();
    var sbs = bar.querySelector(".sbSubs"), subH = barSubs();   // v2.24.1 휴대폰: 지금 메뉴의 도구(소메뉴)를 한 줄로 — 옆으로 밀어 다른 도구로
    if(sbs.getAttribute("data-h") !== subH){ sbs.setAttribute("data-h", subH); sbs.innerHTML = subH; sbs.hidden = !subH; var on = sbs.querySelector(".on"); if(on) setTimeout(function(){ try{ sbs.scrollLeft = on.offsetLeft - (sbs.clientWidth - on.offsetWidth) / 2; }catch(e){} }, 30); }
    F.ph(); headIcon(); fitRail(); alignSoon();
    if(window.TT_SBHOLD){ requestAnimationFrame(fitRail); } else { requestAnimationFrame(function(){ R.classList.add("sbReady"); fitRail(); }); setTimeout(function(){ R.classList.add("sbReady"); }, 120); }   // v2.58.2 첫 화면(쌤비 홈)은 sbhome.js 가 다 그린 뒤 보임   // v2.8.1: 창이 뒤에 있어 그림 신호가 늦어도 보이게
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
    var cg = e.target.closest("[data-cg]"); if(cg){ e.preventDefault(); var O = cgOpen(), k = cg.getAttribute("data-cg"); O[k] = !cg.classList.contains("op"); try{ localStorage.setItem(CGK, JSON.stringify(O)); }catch(x){} draw(); return; }   // v2.49 수업 묶음 접고 펼치기
    if(e.target.closest("[data-mecard]")){ e.preventDefault(); if(TT.joy && TT.joy.open) TT.joy.open(); else location.href = BASE + "index.html#settings"; return; }   // v2.47 나의 학교생활 카드
    if(e.target.closest("[data-rmini]")){ e.preventDefault(); var mn = !R.classList.contains("sbMini"); R.classList.toggle("sbMini", mn); try{ localStorage.setItem("sb_rail_mini", mn ? "1" : "0"); }catch(x){} draw(); window.dispatchEvent(new Event("resize")); return; }   // v2.45 메뉴 접기
    if(e.target.closest("[data-tree]") && TT.joy){ e.preventDefault(); e.stopPropagation(); TT.joy.open("tree"); return; }   // v2.8 우리 반 나무
    var ba = e.target.closest(".bub [data-bact]"); if(ba && window.TT_SBHOME && TT_SBHOME.bact){ e.stopPropagation(); TT_SBHOME.bact(ba.getAttribute("data-bact")); return; }   // v2.44 브리핑 단추
    var bm = e.target.closest(".bub [data-bmiss]"); if(bm && window.TT_SBHOME && TT_SBHOME.bmiss){ e.stopPropagation(); TT_SBHOME.bmiss(bm.getAttribute("data-bmiss")); return; }   // v2.44 놓친 것
    var ta = e.target.closest(".bub [data-tact]"); if(ta && window.TT_TALK){ e.stopPropagation(); TT_TALK.act(ta.getAttribute("data-tact")); return; }   // v2.13 쌤비 이야기 단추
    if(e.target.closest(".bub.talk .b0") && !e.target.closest(".bfoot") && window.TT_TALK){ TT_TALK.next(); return; }                                   // 말풍선을 누르면 다음 이야기
    if(e.target.closest(".bub .b0") && window.TT_SBHOME && TT_SBHOME.prepGo && document.querySelector("#prep .pi")){ TT_SBHOME.prepGo(); return; }   // 시작 준비 → 말풍선을 누르면 바로
    var t = e.target.closest("button,a"); if(!t || (t.closest("#more") && !t.dataset.m)) return;
    if(t.id === "sbBarOwl" || t.id === "sbBarOwl2"){ e.stopPropagation(); openSsambi(false); return; }
    if(t.hasAttribute("data-mic")){ e.stopPropagation(); openSsambi(true); return; }
    if(t.hasAttribute("data-q")){ find(); return; }
    if(t.hasAttribute("data-qx")) return;
    if(t.hasAttribute("data-plus")){ if(window.TT_QUICK) TT_QUICK.open(); return; }
    var m = t.dataset.m; if(!m) return;
    setSub(m === "lib" ? "lib" : "");
    if(rep(m)) return;                                                  // 대표 도구로 그대로 이동
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
