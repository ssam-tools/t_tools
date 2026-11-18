/* 쌤 노트 v2.1 · 쌤비와 메뉴 (쌤비 홈 디자인일 때 모든 화면) — 쌤비는 어디에나 있습니다
   ① 첫 화면·중메뉴(index): 위쪽 빈칸 + ⋯ / 큰 쌤비 + 말풍선 / 검색창 / 동그라미 메뉴 줄 [홈 · 수업 · 우리 반 · 학생 · 학교 · 자료실 · 설정]
   ② 도구 화면(소메뉴, 넓은 화면): 왼쪽 막대 = 쌤비 + 한마디 / 찾기 / 메뉴 — 지금 메뉴는 펼쳐 그 안의 도구 목록, 오른쪽은 도구 화면
   ③ 도구 화면(휴대폰·좁은 화면): 위쪽 줄 = 쌤비 · 찾기 · 🎤 + 메뉴 아이콘 줄
   - 쌤비를 누르면 어디서나 같은 쌤비 창(오늘 상황 + 말하기). 소품은 상황에 따라 바뀝니다(첫 화면은 shared/sbhome.js 가 정함).
   - 업무판 화면에서는 보이지 않습니다(shared/v2.css 가 html[data-ui="ssambi"] 일 때만 보여 줌). */
(function(){
  "use strict";
  if(!window.TT || window.TT_SBAR || TT.classroom) return;
  var R = document.documentElement, ART = window.TT_SBART, BASE = TT.BASE || "./";
  var HOME = !/\/apps\//.test(location.pathname);
  if(!HOME && R.getAttribute("data-ui") !== "ssambi") return;          // 도구 화면은 쌤비 홈 디자인일 때만 (첫 화면은 바꾸는 즉시 보이도록 늘 만들어 둠)
  var MENUS = [["home", "홈"], ["class", "수업"], ["homeroom", "우리 반"], ["student", "학생"], ["school", "학교"], ["lib", "자료실"], ["settings", "설정"]];
  var KEYS = {home: "Alt+1", "class": "Alt+2", homeroom: "Alt+3", student: "Alt+4", school: "Alt+5", settings: "Alt+0"};
  var SUBK = "sbSub";                                                  // 자료실 = 학교 메뉴의 자료실 묶음 (이 창에서만 기억)
  var DOW = "일월화수목금토";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function icon(n, s){ return ART && ART.icon ? ART.icon(n, s) : ""; }
  function shown(id){ return id === "home" || id === "settings" || id === "lib" || typeof ttMenuShown !== "function" || ttMenuShown(id); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function sub(){ try{ return sessionStorage.getItem(SUBK) || ""; }catch(e){ return ""; } }
  function setSub(v){ try{ if(v) sessionStorage.setItem(SUBK, v); else sessionStorage.removeItem(SUBK); }catch(e){} }

  /* 지금 있는 곳: 첫 화면은 주소 끝 #, 도구 화면은 그 도구가 속한 메뉴 */
  function hereTool(){
    if(HOME) return null;
    var m = location.pathname.match(/\/apps\/([^\/]+)\//), id = m ? m[1] : "";
    if(id === "tardy" && /[?&]tab=counsel/.test(location.search)) id = "counsel";
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
    if(m < 540) return {item: "coffee", line: "좋은 아침이에요", sub: nx ? "첫 수업 " + nx.n + "교시 " + cls(nx) : ""};
    if(m >= 720 && m < 780) return {item: "spoon", line: "점심시간이에요", sub: "맛있게 드세요"};
    return {item: "", line: nx ? "다음 " + nx.n + "교시 " + cls(nx) : "무엇을 도와드릴까요?", sub: nx ? nx.t + " 시작" : ""};
  }
  var owlState = null;
  function P(){ return owlState || basicPick(); }
  function owlSvg(size){ var p = P(); return ART ? ART.svg({item: p.item, deco: TT.joy && TT.joy.on && !TT.joy.on() ? "" : season(), open: !!p.open, sleep: !!p.sleep, listen: !!p.listen, size: size}) : "🦉"; }
  function href(id){ return id === "home" ? BASE : BASE + "#" + (id === "lib" ? "school" : id); }

  /* ── ① 첫 화면·중메뉴 머리 ──
     쌤비를 누르거나 🎤를 누르면 따로 창을 띄우지 않고 쌤비 옆 말풍선이 그대로 쌤비 창이 됩니다(오늘 상황 · 말하기 · 듣는 중).
     검색창은 그 자리에서 적고 Enter → 결과는 메뉴 줄 아래(shared/sbhome.js). "종례: …" "할 일: …"은 Enter 한 번에 바로 넣음. */
  var hero = null;
  function hrowHTML(){
    var p = P(), d = new Date(), s = (TT.school && TT.school.load ? TT.school.load() : {}) || {};
    return '<button type="button" class="owl" id="sbBarOwl" title="쌤비 — 오늘 상황 · 말로 기록 (Alt+B)" aria-label="쌤비 열기 (Alt+B)">' + owlSvg(132) + "</button>"
      + '<div class="bub" role="status"><div class="b0"><div class="when">' + (s.name ? esc(s.name) + " · " : "") + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + DOW[d.getDay()] + "요일 · " + (d.getHours() < 12 ? "오전 " : "오후 ") + ((d.getHours() % 12) || 12) + ":" + pad(d.getMinutes())
      + (p.ev ? ' · <span class="ev">📌 ' + esc(p.ev) + "</span>" : "") + "</div><p>" + esc(p.line || "") + "</p>" + (p.sub ? "<small>" + esc(p.sub) + "</small>" : "") + "</div></div>";
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
      return '<a href="' + esc(href(m[0])) + '" data-m="' + m[0] + '"' + (on ? ' class="on" aria-current="page"' : "") + ' title="' + m[1] + (KEYS[m[0]] ? " (" + KEYS[m[0]] + ")" : "") + '"><span class="ci">' + icon(m[0], 24) + "</span><b>" + m[1] + "</b></a>";
    }).join("");
  }
  var moreHome = null;
  function drawHero(){
    if(!hero){
      hero = document.createElement("div"); hero.id = "sbHero";
      hero.innerHTML = '<div class="top"><span class="sp"></span></div><div class="hrow"></div><div class="srow">' + srowHTML() + '</div><nav class="circ" aria-label="메뉴"></nav>';
      document.body.insertBefore(hero, document.body.firstChild);
      wireSearch();
    }
    var box = document.getElementById("sbBox"); if(box && hero.contains(box)) document.body.appendChild(box);   // 다시 그리는 동안 쌤비 창을 잠깐 비켜 둠
    hero.querySelector(".hrow").innerHTML = hrowHTML();
    hero.querySelector(".circ").innerHTML = circHTML();
    seatMore(); seatBox();
  }
  function seatBox(){                                                   // 쌤비 창(#sbBox)은 첫 화면에서는 말풍선 안에
    var box = document.getElementById("sbBox"); if(!box) return;
    var b = hero && hero.querySelector(".bub"), on = R.getAttribute("data-ui") === "ssambi" && document.body.classList.contains("sbOn");
    if(on && b){ if(box.parentNode !== b) b.appendChild(box); }
    else if(box.parentNode !== document.body) document.body.appendChild(box);
  }
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
      if(/^(종례|할\s*일|todo)\s*[:：]/i.test(v) && window.TT_FIND && TT_FIND.rows){ var r = TT_FIND.rows(v).filter(function(r){ return !r.h && !r.bag && r.go; })[0]; if(r){ r.go(); q.value = ""; sync(); h.search(""); return; } }
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
      if(!t.ready || !t.href) return false;
      if(typeof ttToolShown === "function" && !ttToolShown(t)) return false;
      if(mid === "lib") return t.menu === "school" && t.group === "lib";
      if(mid === "school") return t.menu === "school" && t.group !== "lib";
      return t.menu === mid;
    });
  }
  function railHTML(){
    var cur = curMenu(), me = hereTool(), p = P();
    return '<button type="button" class="owl" id="sbBarOwl" title="쌤비 — 오늘 상황 · 말로 기록 (Alt+B)" aria-label="쌤비 열기 (Alt+B)">' + owlSvg(76) + "</button>"
      + '<div class="say"><b>' + esc(p.line || "") + "</b>" + (p.sub ? "<small>" + esc(p.sub) + "</small>" : "") + "</div>"
      + '<button type="button" class="q" data-q title="찾기 · 한 줄 입력 (/)">' + icon("search", 16) + "<span>찾기</span><kbd>/</kbd></button>"
      + '<nav class="ml" aria-label="메뉴">' + MENUS.filter(function(m){ return shown(m[0]); }).map(function(m){
          var on = m[0] === cur, L = on ? tools(m[0]) : [];
          return '<a class="mi' + (on ? " on" : "") + '" href="' + esc(href(m[0])) + '" data-m="' + m[0] + '" title="' + m[1] + (KEYS[m[0]] ? " (" + KEYS[m[0]] + ")" : "") + '">' + icon(m[0], 20) + "<span>" + m[1] + "</span></a>"
            + (L.length ? '<div class="tl" role="group" aria-label="' + m[1] + ' 도구">' + L.map(function(t){
                var here = me && me.id === t.id;
                return '<a class="ti' + (here ? " on" : "") + '" href="' + esc(BASE + t.href) + '" title="' + esc(t.name) + '"' + (here ? ' aria-current="page"' : "") + ">" + (ART ? ART.toolIcon(t.id, t.icon, 16) : "") + "<span>" + esc(t.short || t.name) + "</span></a>";
              }).join("") + "</div>" : "");
        }).join("") + "</nav>";
  }
  function barHTML(){
    var cur = curMenu();
    return '<div class="in"><button type="button" class="owl" id="sbBarOwl2" title="쌤비 (Alt+B)" aria-label="쌤비 열기">' + owlSvg(46) + "</button>"
      + '<button type="button" class="q" data-q>' + icon("search", 18) + "<span>찾기 · 할 일 적기</span></button>"
      + '<button type="button" class="ib" data-mic aria-label="말로 기록">' + icon("mic", 18) + "</button></div>"
      + '<nav class="sbTabs" aria-label="메뉴">' + MENUS.filter(function(m){ return shown(m[0]); }).map(function(m){
          return '<a href="' + esc(href(m[0])) + '" data-m="' + m[0] + '"' + (m[0] === cur ? ' class="on" aria-current="page"' : "") + ">" + icon(m[0], 18) + "<span>" + m[1] + "</span></a>";
        }).join("") + "</nav>";
  }
  function drawApp(){
    if(!rail){ rail = document.createElement("aside"); rail.id = "sbRail"; rail.setAttribute("aria-label", "쌤비와 메뉴"); document.body.appendChild(rail); document.body.classList.add("sbRailOn"); }
    if(!bar){ bar = document.createElement("div"); bar.id = "sbBar"; document.body.insertBefore(bar, document.body.firstChild); document.body.classList.add("sbBarOn"); }
    rail.innerHTML = railHTML(); bar.innerHTML = barHTML();
  }
  function draw(){ if(HOME) drawHero(); else drawApp(); }

  /* ── 누르기 ── */
  function owlEl(){ if(HOME && hero && document.body.classList.contains("sbOn")) return document.getElementById("sbBarOwl"); var a = document.getElementById("sbBarOwl"), b = document.getElementById("sbBarOwl2"); return a && a.offsetParent !== null ? a : b && b.offsetParent !== null ? b : a; }
  function openSsambi(listen){
    if(!window.TT_SSAMBI) return;
    var box = document.getElementById("sbBox");
    if(!listen && box && !box.hidden){ TT_SSAMBI.close(); return; }
    TT_SSAMBI.open("menu", null, owlEl());
    if(listen){ var b = document.querySelector('#sbBox [data-a="talk"],#sbBox [data-a="listen"]'); if(b) b.click(); }
  }
  function v2home(){ return HOME && R.getAttribute("data-ui") === "ssambi" && document.body.classList.contains("sbOn"); }
  function find(){ if(v2home()) focusSearch(""); else if(HOME && window.TT_FIND) TT_FIND.open(""); else location.href = BASE + "?sb=find"; }
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
    var t = e.target.closest("button,a"); if(!t || (t.closest("#more") && !t.dataset.m)) return;
    if(t.id === "sbBarOwl" || t.id === "sbBarOwl2"){ e.stopPropagation(); openSsambi(false); return; }
    if(t.hasAttribute("data-mic")){ e.stopPropagation(); openSsambi(true); return; }
    if(t.hasAttribute("data-q")){ find(); return; }
    if(t.hasAttribute("data-qx")) return;
    if(t.hasAttribute("data-plus")){ if(window.TT_QUICK) TT_QUICK.open(); return; }
    var m = t.dataset.m; if(!m) return;
    setSub(m === "lib" ? "lib" : "");
    if(HOME){                                                           // 첫 화면 안에서는 다시 불러오지 않고 화면만 바꿈
      e.preventDefault();
      var h = m === "home" ? "" : m === "lib" ? "school" : m;
      if((location.hash || "").replace(/^#/, "") === h){ draw(); window.dispatchEvent(new Event("tt-home-change")); }
      else location.hash = h;
    }
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

  window.TT_SBAR = {
    setOwl: function(p){ var k = JSON.stringify(p || null); if(k === JSON.stringify(owlState)) return; owlState = p || null; draw(); },
    draw: draw, cur: curMenu, sub: sub, focusSearch: focusSearch, clearSearch: clearSearch, seatBox: function(){ if(HOME && hero) seatBox(); }
  };
  if(document.body) draw(); else document.addEventListener("DOMContentLoaded", draw);
})();
