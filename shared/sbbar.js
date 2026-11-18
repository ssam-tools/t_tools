/* 쌤 노트 v2.0.1 · 위쪽 고정 줄 (쌤비 홈 디자인일 때 모든 화면 공통)
   [쌤비] [검색창 🎤] + 메뉴 줄 [홈 · 수업 · 우리 반 · 학생 · 학교 · 설정]
   - 첫 화면·메뉴 화면(중메뉴)·도구 화면(소메뉴) 어디서나 같은 자리, 같은 모양입니다. 지금 있는 메뉴에 밑줄.
   - 쌤비를 누르면 쌤비 창(말로 입력·찾기·브리핑·바로 실행), 검색창을 누르면 찾기·한 줄 입력(Ctrl+K 창, 도구 화면에서는 첫 화면으로 가서 엶).
   - 쌤비 그림은 상황에 따라 소품이 바뀝니다(첫 화면은 shared/sbhome.js 가 할 일까지 보고 정함).
   - 업무판 화면에서는 보이지 않습니다(shared/v2.css 가 html[data-ui="ssambi"] 일 때만 보여 줌). */
(function(){
  "use strict";
  if(!window.TT || window.TT_SBAR || TT.classroom) return;
  var R = document.documentElement, ART = window.TT_SBART, BASE = TT.BASE || "./";
  var HOME = !/\/apps\//.test(location.pathname);
  if(!HOME && R.getAttribute("data-ui") !== "ssambi") return;          // 도구 화면은 쌤비 홈 디자인일 때만 (첫 화면은 바꾸는 즉시 보이도록 늘 만들어 둠)
  var MENUS = [["home", "홈"], ["class", "수업"], ["homeroom", "우리 반"], ["student", "학생"], ["school", "학교"], ["settings", "설정"]];
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function icon(n, s){ return ART && ART.icon ? ART.icon(n, s) : ""; }
  function shown(id){ return id === "home" || id === "settings" || typeof ttMenuShown !== "function" || ttMenuShown(id); }

  /* 지금 있는 메뉴: 첫 화면은 주소 끝 #, 도구 화면은 그 도구가 속한 메뉴 */
  function curMenu(){
    if(HOME){ var h = (location.hash || "").replace(/^#/, ""); return MENUS.some(function(m){ return m[0] === h; }) ? h : "home"; }
    var m = location.pathname.match(/\/apps\/([^\/]+)\//), id = m ? m[1] : "";
    if(id === "tardy" && /[?&]tab=counsel/.test(location.search)) id = "counsel";
    var t = typeof TT_TOOLS !== "undefined" ? TT_TOOLS.filter(function(x){ return x.id === id; })[0] : null;
    return t ? t.menu : "";
  }
  function season(){
    var lk = R.getAttribute("data-look"), m = new Date().getMonth() + 1;
    return /^(spring|summer|autumn|winter)$/.test(lk || "") ? lk : m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter";
  }
  /* 도구 화면용 간단한 소품 (시간만 보고) — 첫 화면은 setOwl 로 덮어씀 */
  function basicPick(){
    var d = new Date(), w = d.getDay(), h = d.getHours() + d.getMinutes() / 60, wk = w >= 1 && w <= 5;
    if(!wk || h >= 18) return {item: "night", sleep: true, title: "쌤비 · 푹 쉬세요"};
    if(h < 9) return {item: "coffee", title: "쌤비 · 좋은 아침이에요"};
    if(h >= 12 && h < 13) return {item: "spoon", title: "쌤비 · 점심시간"};
    return {item: "", title: "쌤비"};
  }
  var owlState = null;
  function owlSvg(){ var P = owlState || basicPick(); return ART ? ART.svg({item: P.item, deco: TT.joy && TT.joy.on && !TT.joy.on() ? "" : season(), open: !!P.open, sleep: !!P.sleep, listen: !!P.listen, size: 52}) : "🦉"; }

  var bar = document.createElement("div"); bar.id = "sbBar";
  function draw(){
    var cur = curMenu();
    bar.innerHTML = '<div class="in">'
      + '<button type="button" class="owl" id="sbBarOwl" title="쌤비 — 말로 입력 · 찾기 · 오늘 브리핑 (Alt+B)" aria-label="쌤비 열기 (Alt+B)">' + owlSvg() + "</button>"
      + '<button type="button" class="q" data-q title="찾기 · 한 줄 입력 (/ 또는 Ctrl+K)">' + icon("search", 20) + '<span>학생 · 도구 · 내선번호 찾기, 할 일 · 학생 기록 적기</span><kbd>/</kbd></button>'
      + '<button type="button" class="ib" data-mic title="말로 기록" aria-label="말로 기록">' + icon("mic", 20) + "</button>"
      + (HOME && window.TT_QUICK ? '<button type="button" class="ib plus" data-plus title="빠른 입력 (지각·결석·상담·수업 기록)" aria-label="빠른 입력">' + icon("plus", 22) + "</button>" : "")
      + "</div>"
      + '<nav class="sbTabs" aria-label="메뉴">' + MENUS.filter(function(m){ return shown(m[0]); }).map(function(m){
          var on = m[0] === cur, href = m[0] === "home" ? BASE : BASE + "#" + m[0];
          return '<a href="' + esc(href) + '" data-m="' + m[0] + '"' + (on ? ' class="on" aria-current="page"' : "") + ">" + icon(m[0], 18) + "<span>" + m[1] + "</span></a>";
        }).join("") + "</nav>";
    var o = bar.querySelector(".owl"); if(o && owlState && owlState.title) o.title = owlState.title + " (Alt+B)";
  }
  function mount(){ if(!bar.parentNode) document.body.insertBefore(bar, document.body.firstChild); if(!HOME) document.body.classList.add("sbBarOn"); draw(); }

  function openSsambi(listen){
    if(!window.TT_SSAMBI) return;
    var box = document.getElementById("sbBox"), ow = document.getElementById("sbBarOwl");
    if(!listen && box && !box.hidden){ TT_SSAMBI.close(); return; }
    TT_SSAMBI.open("menu", null, ow);
    if(listen){ var b = document.querySelector('#sbBox [data-a="listen"]'); if(b) b.click(); }
  }
  function find(){ if(HOME && window.TT_FIND) TT_FIND.open(""); else location.href = BASE + "?sb=find"; }
  bar.addEventListener("click", function(e){
    var t = e.target.closest("button,a"); if(!t) return;
    if(t.id === "sbBarOwl"){ e.stopPropagation(); openSsambi(false); return; }
    if(t.hasAttribute("data-mic")){ e.stopPropagation(); openSsambi(true); return; }
    if(t.hasAttribute("data-q")){ find(); return; }
    if(t.hasAttribute("data-plus")){ if(window.TT_QUICK) TT_QUICK.open(); return; }
    if(t.dataset.m && HOME){                                             // 첫 화면 안에서는 다시 불러오지 않고 화면만 바꿈
      e.preventDefault();
      var u = TT.store.get("tt_ui_v1", {}) || {};
      if(t.dataset.m === "school" && u.mtab && u.mtab.school === "lib"){ u.mtab.school = "all"; TT.store.set("tt_ui_v1", u); }
      if(t.dataset.m === "home"){ if(location.hash) location.hash = ""; } else location.hash = t.dataset.m;
    }
  });
  document.addEventListener("keydown", function(e){                    // 도구 화면에서도 / → 찾기 (첫 화면은 sbhome.js)
    if(HOME || e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || R.getAttribute("data-ui") !== "ssambi") return;
    var a = document.activeElement, tg = a && a.tagName;
    if(tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT" || (a && a.isContentEditable) || document.querySelector("dialog[open]")) return;
    e.preventDefault(); find();
  });
  window.addEventListener("hashchange", draw);
  window.addEventListener("popstate", draw);
  window.addEventListener("load", draw);
  setInterval(function(){                                               // 쌤비가 듣는 중이면 귀 기울이기, 시간이 바뀌면 소품도
    var btn = document.getElementById("sbBtn"), lis = !!(btn && btn.classList.contains("lis"));
    var o = bar.querySelector(".owl svg"); if(o) o.classList.toggle("lis", lis);
  }, 700);
  setInterval(function(){ if(!owlState && document.visibilityState === "visible") draw(); }, 5 * 60 * 1000);
  new MutationObserver(draw).observe(R, {attributes: true, attributeFilter: ["data-look"]});

  window.TT_SBAR = {
    setOwl: function(P){ var k = JSON.stringify(P || null); if(k === JSON.stringify(owlState)) return; owlState = P || null; var o = bar.querySelector(".owl"); if(o){ o.innerHTML = owlSvg(); if(P && P.title) o.title = P.title + " (Alt+B)"; } },
    draw: draw
  };
  if(document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
