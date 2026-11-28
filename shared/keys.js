/* 쌤 노트 · 단축키 (PLAN_통일 3단계)
   모든 화면(첫 화면·도구 화면)에서 같은 단축키를 씁니다. tt.js가 자동으로 붙입니다.
   글자를 쓰는 칸에 있을 때는 Alt 조합만 듣고, ? 는 듣지 않습니다.
   한/영 상태와 상관없도록 e.code(자판 위치)로 봅니다.
   Alt 키만 잠깐 누르고 있으면 메뉴 단추 위에 단축키 딱지가 보입니다. */
(function(){
  "use strict";
  if(window.TT_KEYS) return;
  var BASE = (function(){ var s = document.currentScript && document.currentScript.src; try{ return new URL("../", s).href; }catch(e){ return "./"; } })();
  var HOME = !/\/apps\//.test(location.pathname);
  var MENUS = [["Digit1", "home", "🏠 홈"], ["Digit2", "class", "📚 수업"], ["Digit3", "homeroom", "🌱 우리 반"], ["Digit4", "student", "🤝 학생"], ["Digit5", "school", "🏫 학교"], ["Digit6", "lib", "🔎 자료실"], ["Digit0", "settings", "⚙️ 설정"]];
  /* v2.71 단축키 정리: 번호 = 메뉴 순서, 글자 = 기능 첫 글자 (B 쌤비 · N 노트 · T 시간 · S 사이트)
     LIST 는 [묶음 제목, [[키, 설명], …]] — 설명서(apps/guide/pages.js)도 이 목록을 그대로 씁니다. */
  var LIST = [
    ["이동", [
      ["Alt + 1~6", "메뉴 순서대로: 1 홈 · 2 수업 · 3 우리 반 · 4 학생 · 5 학교 · 6 자료실"],
      ["Alt + 0", "설정"],
      ["Alt + ←", "이전 화면"]
    ]],
    ["찾기", [
      ["/ 또는 Ctrl + K", "지금 화면의 검색창으로 (문서·업무판을 볼 때는 Ctrl + F 도 같아요)"],
      ["Enter / Shift + Enter", "찾은 곳 다음 / 이전 · ↑ ↓ 로 결과 고르기"]
    ]],
    ["바로 열기", [
      ["Alt + B", "쌤비 (말로 입력·찾기·오늘 브리핑)"],
      ["Alt + N", "학생 기록 한 줄 (Ctrl + Enter 로 저장)"],
      ["Alt + T", "큰 시계·타이머 (교과서 수업 모드에서는 수업 타이머)"],
      ["Alt + S", "자주 가는 사이트"],
      ["?", "이 단축키 안내 · Esc 열린 창 닫기"]
    ]]
  ];
  var TIP = "💡 검색창에 이렇게 적어도 돼요: <b>+ 내일 공문 회신</b> → 내 할 일 · <b>37</b> → 37쪽으로 · 홈에서 <b>3번 지각</b> → 바로 기록";
  var FOOT = "Alt 키만 잠깐 누르고 있으면 메뉴 단추 위에 단축키가 보입니다. 한/영 상태와 상관없고, 글자를 쓰는 칸에서는 Alt·Ctrl 조합만 됩니다.";
  function typing(t){ t = t || document.activeElement; if(!t) return false; var n = (t.tagName || "").toLowerCase(); return n === "input" || n === "textarea" || n === "select" || t.isContentEditable; }
  function goMenu(id){
    if(HOME){
      if(id === "home"){ var a = document.querySelector('.mnav a[data-menu="home"]'); if(a){ a.click(); return; } if(location.hash) history.pushState(null, "", location.pathname + location.search); window.dispatchEvent(new HashChangeEvent("hashchange")); return; }
      location.hash = id; return;
    }
    location.href = BASE + (id === "home" ? "" : "#" + id);
  }
  /* ---------- 단축키 안내 창 ---------- */
  var dlg = null;
  function css(){
    if(document.getElementById("ttKeyCss")) return;
    var st = document.createElement("style"); st.id = "ttKeyCss";
    st.textContent = ".ttk-dlg{border:0;border-radius:16px;padding:18px 20px;max-width:min(560px,94vw);max-height:94vh;overflow:auto;box-shadow:0 18px 50px rgba(20,40,70,.28);font-family:var(--t-font,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif);color:var(--t-ink,#1d2733);background:var(--t-card,#fff)}"
      + ".ttk-dlg::backdrop{background:rgba(20,30,45,.4)}"
      + ".ttk-dlg h2{font-size:18px;font-weight:800;margin:0 0 10px;display:flex;align-items:center;gap:8px}.ttk-dlg h2 button{margin-left:auto;border:1px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:9px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer}"
      + ".ttk-dlg table{border-collapse:collapse;width:100%;font-size:14px}.ttk-dlg td{padding:6px 4px;border-top:1px solid var(--t-line,#dde3ea);vertical-align:top}"
      + ".ttk-dlg td:first-child{white-space:nowrap;width:1%;padding-right:12px}"
      + ".ttk-dlg p{font-size:12.5px;color:var(--t-sub,#5b6773);margin:10px 0 0;line-height:1.5}.ttk-dlg p.tip{color:var(--t-ink,#1d2733);background:var(--t-bg,#f3f6f9);border-radius:10px;padding:7px 10px}"
      + ".ttk-dlg.two{max-width:min(1060px,96vw);width:min(1060px,96vw)}.ttk-cols{display:grid;gap:18px}.ttk-dlg.two .ttk-cols{grid-template-columns:1fr 1fr}@media(max-width:760px){.ttk-dlg.two .ttk-cols{grid-template-columns:1fr}}"
      + ".ttk-dlg tr.ttk-g th{text-align:left;font-size:12px;font-weight:800;color:var(--t-sub,#5b6773);padding:10px 4px 3px;letter-spacing:.02em}.ttk-dlg tr.ttk-g:first-child th{padding-top:0}.ttk-dlg tr.ttk-g.pg th{color:var(--t-now,#2f6fb5)}.ttk-dlg td{padding:5px 4px}"
      + "kbd.ttk{display:inline-block;font:700 12px/1 var(--t-font,'Malgun Gothic',system-ui,sans-serif);background:var(--t-bg,#f3f6f9);border:1px solid var(--t-line,#dde3ea);border-bottom-width:2px;border-radius:6px;padding:4px 7px;color:var(--t-ink,#1d2733)}"
      /* Alt 를 누르고 있을 때 메뉴 단추 위 딱지 */
      + "html.ttk-tips [data-ttk]{position:relative}"
      + "html.ttk-tips [data-ttk]::after{content:attr(data-ttk);position:absolute;top:2px;right:2px;z-index:30;font:800 11px/1 var(--t-font,'Malgun Gothic',system-ui,sans-serif);background:var(--t-ink,#1d2733);color:#fff;border-radius:6px;padding:3px 5px;box-shadow:0 2px 6px rgba(0,0,0,.25);pointer-events:none}";
    document.head.appendChild(st);
  }
  function kb(s){ return s.split(" 또는 ").map(function(o){ return o.split(" / ").map(function(p){ return p.split(" + ").map(function(k){ return '<kbd class="ttk">' + k + '</kbd>'; }).join(" + "); }).join(" / "); }).join(" 또는 "); }
  function rowsHTML(rows){ return rows.map(function(r){ return "<tr><td>" + kb(r[0]) + "</td><td>" + r[1] + "</td></tr>"; }).join(""); }
  function groupHTML(t, rows, cls){ return '<tr class="ttk-g' + (cls ? " " + cls : "") + '"><th colspan="2">' + t + "</th></tr>" + rowsHTML(rows); }
  function help(){
    css();
    if(!dlg){
      dlg = document.createElement("dialog"); dlg.className = "ttk-dlg"; dlg.setAttribute("aria-label", "단축키 안내");
      dlg.addEventListener("click", function(e){ if(e.target === dlg || (e.target.closest && e.target.closest("[data-x]"))) dlg.close(); });
      document.body.appendChild(dlg);
    }
    if(dlg.open){ dlg.close(); return; }
    var pg = window.TT_KEYS_PAGE && (typeof TT_KEYS_PAGE.rows === "function" ? TT_KEYS_PAGE.rows() : TT_KEYS_PAGE.rows);   // 화면만의 단축키(교과서 수업 모드 등)는 맨 위에
    var two = !!(pg && pg.length);                                     // 화면만의 단축키가 있으면 두 칸으로 (스크롤 없이 한눈에)
    dlg.classList.toggle("two", two);
    dlg.innerHTML = '<h2>⌨️ 쌤 노트 단축키<button type="button" data-x>닫기 Esc</button></h2><div class="ttk-cols">'
      + (two ? "<div><table>" + groupHTML(TT_KEYS_PAGE.title || "이 화면", pg, "pg") + "</table></div>" : "")
      + "<div><table>" + LIST.map(function(g){ return groupHTML(g[0], g[1]); }).join("") + "</table></div></div>"
      + '<p class="tip">' + TIP + "</p><p>" + FOOT + "</p>";
    if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  /* ---------- 딱지 표시할 단추에 data-ttk 달기 (메뉴는 나중에 그려지므로 그때그때) ---------- */
  function tag(){
    MENUS.forEach(function(m){
      var key = m[0] === "Digit0" ? "0" : m[0].slice(5);
      Array.prototype.forEach.call(document.querySelectorAll('.mnav a[data-menu="' + m[1] + '"], .tt-rail a.tt-top[data-menu="' + m[1] + '"]'), function(a){ a.setAttribute("data-ttk", "Alt+" + key); if(a.title && a.title.indexOf("Alt+") < 0) a.title += " (Alt+" + key + ")"; else if(!a.title) a.title = m[2] + " (Alt+" + key + ")"; });
      Array.prototype.forEach.call(document.querySelectorAll('#sbHero a[data-m="' + m[1] + '"], #sbRail a[data-m="' + m[1] + '"], #sbBar a[data-m="' + m[1] + '"]'), function(a){ a.setAttribute("data-ttk", "Alt+" + key); });   // v2.71 쌤비 화면 메뉴에도 딱지
      if(m[1] === "settings") Array.prototype.forEach.call(document.querySelectorAll('.tt-rail .tt-foot a[href$="#settings"], .mnav a[data-menu="settings"], #setBtn'), function(a){ a.setAttribute("data-ttk", "Alt+0"); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-tt="rec"], #qRec'), function(a){ a.setAttribute("data-ttk", "Alt+N"); });
    ["sbBtn", "sbBarOwl", "sbBarOwl2"].forEach(function(id){ var sb = document.getElementById(id); if(sb) sb.setAttribute("data-ttk", "Alt+B"); });
    Array.prototype.forEach.call(document.querySelectorAll("#sbFav"), function(a){ a.setAttribute("data-ttk", "Alt+S"); });
  }
  var tipT = null;
  function tipsOn(){ tag(); css(); document.documentElement.classList.add("ttk-tips"); }
  function tipsOff(){ clearTimeout(tipT); tipT = null; document.documentElement.classList.remove("ttk-tips"); }
  function hit(){ try{ if(window.TT && TT.joy) TT.joy.count("keys"); }catch(e){} }
  document.addEventListener("keydown", function(e){
    if(e.key === "Alt" && !e.repeat){ clearTimeout(tipT); tipT = setTimeout(tipsOn, 450); return; }
    if(e.key !== "Alt") tipsOff();
    if(e.defaultPrevented) return;
    var alt = e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey;
    if(alt){
      var m = MENUS.filter(function(x){ return x[0] === e.code; })[0];
      if(m){ e.preventDefault(); hit(); goMenu(m[1]); return; }
      if(e.code === "KeyN"){ e.preventDefault(); hit(); if(window.TT && TT.notes && TT.notes.quick) TT.notes.quick({}); return; }
      if(e.code === "KeyT"){ e.preventDefault(); if(window.TT_KEYS_PAGE && TT_KEYS_PAGE.altT && TT_KEYS_PAGE.altT()) return; var c = document.getElementById("hClock"); if(c) c.click(); else if(!HOME) location.href = BASE + "?clock=1"; return; }
      if(e.code === "ArrowLeft" && !HOME){ e.preventDefault(); history.back(); return; }
      return;
    }
    if((e.ctrlKey || e.metaKey) && !e.altKey && e.code === "KeyK" && !HOME && !window.TT_FIND){   // v2.71 도구 화면 Ctrl+K = / (화면을 떠나지 않고 왼쪽 검색창)
      e.preventDefault(); hit();
      try{ if(window.TT_SBAR && TT_SBAR.focusSearch && TT_SBAR.focusSearch("")) return; }catch(x){}
      location.href = BASE + "?sb=find"; return;
    }
    if(!e.ctrlKey && !e.metaKey && !e.altKey && (e.key === "?" || (e.shiftKey && e.code === "Slash")) && !typing(e.target)){ e.preventDefault(); help(); }
  }, true);
  document.addEventListener("keyup", function(e){ if(e.key === "Alt") tipsOff(); });
  window.addEventListener("blur", tipsOff);
  if(HOME && /[?&]clock=1/.test(location.search)){   // 도구 화면에서 Alt+T → 첫 화면 큰 시계
    history.replaceState(null, "", location.pathname + location.hash);
    var n = 0, iv = setInterval(function(){ var c = document.getElementById("hClock"); if(c || ++n > 20){ clearInterval(iv); if(c) c.click(); } }, 150);
  }
  window.TT_KEYS = {help: help, list: LIST, tip: TIP};
})();
