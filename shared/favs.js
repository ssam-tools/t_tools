/* 쌤 노트 v2.12 · 즐겨찾기 서랍 (TT_FAVS) — 첫 화면 맨 위 ⋯ 왼쪽의 ☆
   · 누르면 ⋯ 메뉴처럼 작은 창: 📚 수업 · 💼 업무 · 🙂 개인 탭 + 동그란 아이콘 격자(스크롤 없이). 열려 있는 동안 쌤비가 책갈피를 듭니다.
   · 오늘 연 사이트에는 작은 ✓ (sn_sites_open, 이 기기에만 · 날짜가 바뀌면 지워짐)
   · 숨은 기능: 검색창에 사이트 이름 → 맨 위에 '자주 가는 사이트'로 나와 Enter 한 번에 열기
   · 단축키 Alt+S · 교실 기기는 수업용만(탭 없이) · 사이트 목록은 apps/sites/ (tt_sites_v1) */
(function(){
  "use strict";
  if(!window.TT || window.TT_FAVS) return;
  var R = document.documentElement, BASE = TT.BASE || "./", HOME = !/\/apps\//.test(location.pathname), OK = "sn_sites_open";
  var CATS = [["class", "📚 수업"], ["work", "💼 업무"], ["me", "🙂 개인"]], COL = {"class": "#2f6fb5", work: "#1f8a7a", me: "#b5652f"};
  var tab = "", pop = null;
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function today(){ var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function list(){
    if(window.TT_SITES_SEED) TT_SITES_SEED();
    var D = TT.store.get("tt_sites_v1", null), L = D && D.items ? D.items.filter(function(x){ return x.u; }) : [];
    return TT.classroom ? L.filter(function(x){ return x.c === "class"; }) : L;
  }
  function opened(){ try{ var o = JSON.parse(localStorage.getItem(OK)) || {}; return o.d === today() ? o.ids || [] : []; }catch(e){ return []; } }
  function mark(id){ try{ var ids = opened(); if(ids.indexOf(id) < 0) ids.push(id); localStorage.setItem(OK, JSON.stringify({d: today(), ids: ids})); }catch(e){} }
  function go(x){ mark(x.id); window.open(x.u, "_blank", "noopener"); }
  function letter(t){ var s = String(t || "").trim(); return s ? Array.from(s)[0].toUpperCase() : "?"; }
  function host(u){ try{ return new URL(u).hostname.replace(/^www\./, ""); }catch(e){ return ""; } }

  /* ── 서랍 ── */
  function draw(){
    var L = list(), ids = opened(), cats = TT.classroom ? [CATS[0]] : CATS.filter(function(c){ return L.some(function(x){ return x.c === c[0]; }); });
    if(!cats.length) cats = [CATS[0]];
    if(!tab || !cats.some(function(c){ return c[0] === tab; })){ var pin = L.filter(function(x){ return x.pin; })[0]; tab = pin && cats.some(function(c){ return c[0] === pin.c; }) ? pin.c : cats[0][0]; }
    var S = L.filter(function(x){ return x.c === tab; }).sort(function(a, b){ return (b.pin ? 1 : 0) - (a.pin ? 1 : 0); });
    pop.innerHTML = (cats.length > 1 ? '<div class="ft" role="tablist">' + cats.map(function(c){ return '<button type="button" role="tab" data-t="' + c[0] + '" aria-selected="' + (c[0] === tab) + '"' + (c[0] === tab ? ' class="on"' : "") + ">" + c[1] + "</button>"; }).join("") + "</div>" : '<div class="fh">📚 수업 사이트</div>')
      + (S.length ? '<div class="fg">' + S.slice(0, 16).map(function(x){
          var done = ids.indexOf(x.id) >= 0;
          return '<a href="' + esc(x.u) + '" target="_blank" rel="noopener noreferrer" data-id="' + esc(x.id) + '" title="' + esc(x.t) + " · " + esc(host(x.u)) + (done ? " · 오늘 열어 봄" : "") + '"><i style="--c:' + (COL[x.c] || COL.work) + '">' + esc(letter(x.t)) + (done ? '<s aria-label="오늘 열어 봄">✓</s>' : "") + (x.pin ? '<u aria-hidden="true"></u>' : "") + "</i><span>" + esc(x.t) + "</span></a>";
        }).join("") + "</div>" : '<p class="fe">' + (TT.classroom ? "수업용 사이트가 없어요" : "아직 없어요") + "</p>")
      + (TT.classroom ? "" : '<a class="fm" href="' + esc(BASE + "apps/sites/") + '">✏️ 넣기·고치기</a>');
  }
  function btn(){ return document.getElementById("sbFav"); }
  function open(){
    var b = btn(); if(!b) return false;
    if(!pop){ pop = document.createElement("div"); pop.id = "sbFavPop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "자주 가는 사이트"); }
    b.parentNode.appendChild(pop); draw(); pop.hidden = false; b.setAttribute("aria-expanded", "true"); b.classList.add("on");
    var m = document.getElementById("more"); if(m) m.open = false;
    if(window.TT_SBAR && TT_SBAR.prop) TT_SBAR.prop("mark");
    var f = pop.querySelector(".fg a"); if(f) f.focus({preventScroll: true});
    return true;
  }
  function close(){
    if(!pop || pop.hidden) return; pop.hidden = true;
    var b = btn(); if(b){ b.setAttribute("aria-expanded", "false"); b.classList.remove("on"); }
    if(window.TT_SBAR && TT_SBAR.prop) TT_SBAR.prop(null);
  }
  function toggle(){ if(pop && !pop.hidden) close(); else if(!open()) location.href = BASE + "apps/sites/"; }
  document.addEventListener("click", function(e){
    if(e.target.closest("#sbFav")){ e.preventDefault(); toggle(); return; }
    if(!pop || pop.hidden) return;
    var t = e.target.closest("#sbFavPop [data-t]"); if(t){ tab = t.dataset.t; draw(); return; }
    var a = e.target.closest("#sbFavPop .fg a"); if(a){ mark(a.dataset.id); setTimeout(close, 60); return; }
    if(!e.target.closest("#sbFavPop")) close();
  });
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && pop && !pop.hidden){ close(); var b = btn(); if(b) b.focus(); return; }
    if(e.altKey && !e.ctrlKey && !e.metaKey && (e.code === "KeyS")){ e.preventDefault(); if(HOME) toggle(); else location.href = BASE + "?sb=favs"; }
    if(pop && !pop.hidden && /^Arrow(Left|Right|Up|Down)$/.test(e.key)){          // 화살표로 칸 옮기기
      var A = [].slice.call(pop.querySelectorAll(".fg a")), i = A.indexOf(document.activeElement); if(i < 0) return;
      e.preventDefault(); var n = e.key === "ArrowLeft" ? i - 1 : e.key === "ArrowRight" ? i + 1 : e.key === "ArrowUp" ? i - 4 : i + 4;
      if(A[n]) A[n].focus();
    }
  });
  if(HOME && /[?&]sb=favs/.test(location.search)) window.addEventListener("load", function(){ setTimeout(open, 200); });

  /* ── 숨은 기능: 검색창에 사이트 이름 → 맨 위에 ── */
  function wrap(){
    if(!window.TT_FIND || !TT_FIND.rows || TT_FIND.__fav) return;
    var o = TT_FIND.rows;
    TT_FIND.rows = function(q){
      var R0 = o.apply(this, arguments) || [], k = String(q || "").trim().toLowerCase().replace(/\s+/g, "");
      if(k.length < 1) return R0;
      var hit = list().filter(function(x){ var n = String(x.t).toLowerCase().replace(/\s+/g, ""); return n.indexOf(k) >= 0 || host(x.u).indexOf(k) >= 0; }).slice(0, 4);
      if(!hit.length) return R0;
      return [{h: "자주 가는 사이트"}].concat(hit.map(function(x){ return {ic: "🔗", tx: esc(x.t), sub: esc(host(x.u)) + (opened().indexOf(x.id) >= 0 ? " · 오늘 열어 봄 ✓" : ""), go: function(){ go(x); }}; })).concat(R0);
    };
    TT_FIND.__fav = 1;
  }
  wrap(); window.addEventListener("load", wrap);

  window.TT_FAVS = {open: open, close: close, list: list, opened: opened, mark: mark};
})();
