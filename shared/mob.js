/* 쌤 노트 v2.56 · 📱 휴대폰 화면 (PLAN_모바일)
   휴대폰의 할 일은 두 가지: ① 언제 어디서나 적기 ② 학교 정보 빠르게 찾기. 휴대성 · 아주 간단하게.
   - 아래 탭 3칸: ✏️ 적기(홈) · 🔎 찾기(#find) · ☰ 전체(#all) — 첫 화면(index.html)에서만
   - 도구 화면: 위쪽 쌤비·검색창·메뉴 줄 대신 얇은 한 줄 [‹ 도구 이름 ……… 🔎] — 뒤로 가면 원래 탭으로
   - 적기 6칸은 shared/sbhome.js(phQuick)가 그리고, 누르면 여기서 처리합니다.
   - 오늘 · 학사일정 · 선생님 시간표는 아래에서 올라오는 판으로 (이 기기에 있는 자료만 읽음, 어디로도 보내지 않음)
   - PC(폭 761px 이상)·교실 기기·예전 화면에서는 아무것도 하지 않습니다. */
(function(){
  "use strict";
  if(!window.TT || window.TT_MOB || TT.classroom || window.TT_STUDENT || window.top !== window) return;
  var R = document.documentElement, BASE = TT.BASE || "./", HOME = !/\/apps\//.test(location.pathname), ART = window.TT_SBART;
  var DOW = "일월화수목금토";
  function ph(){ return typeof ttIsPhone === "function" && ttIsPhone() && R.getAttribute("data-ui") === "ssambi"; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function icon(n, s){ return ART && ART.icon ? ART.icon(n, s || 22) : ""; }
  function tIcon(id, e, s){ return ART && ART.toolIcon ? ART.toolIcon(id, e, s || 22) : esc(e); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function md(s){ var a = String(s).split("-"), d = new Date(+a[0], +a[1] - 1, +a[2]); return (+a[1]) + "/" + (+a[2]) + "(" + DOW[d.getDay()] + ")"; }
  function homeroom(){ return typeof ttMenuShown !== "function" || ttMenuShown("homeroom"); }
  function room(){ try{ return localStorage.getItem("ttv_device") === "classroom"; }catch(e){ return false; } }

  /* ── 아래에서 올라오는 판 (오늘 · 학사일정 · 선생님 시간표) ── */
  var sh = null;
  function sheet(title, body){
    if(!sh){
      sh = document.createElement("dialog"); sh.className = "mobSh"; sh.setAttribute("aria-label", "정보");
      sh.addEventListener("click", function(e){ if(e.target === sh || (e.target.closest && e.target.closest("[data-mx]"))) sh.close(); });
      document.body.appendChild(sh);
    }
    sh.innerHTML = '<div class="shHd"><b>' + title + '</b><button type="button" data-mx aria-label="닫기">✕</button></div><div class="shBd">' + body + "</div>";
    if(!sh.open) sh.showModal();
    return sh.querySelector(".shBd");
  }
  function cal(){ var C = TT.store.get("tt_calendar_v1", null); return C && Array.isArray(C.events) ? C.events : []; }
  function allTT(){ var A = TT.store.get("tt_alltt_v1", null); return A && Array.isArray(A.teachers) && Array.isArray(A.periods) ? A : null; }
  function cls(s){ var c = +s.cls; return c > 100 ? Math.floor(c / 100) + "-" + (c % 100) : String(s.cls || s.code || ""); }
  function none(t, a){ return '<p class="no">' + t + (a ? " " + a : "") + "</p>"; }

  function todayHTML(){
    var d = new Date(), td = ymd(d), m = d.getHours() * 60 + d.getMinutes(), h = "";
    var T = []; try{ T = TT.timetable.day(); }catch(e){}
    h += "<h4>🕘 내 수업</h4>";
    h += T.length ? '<div class="ls">' + T.map(function(s){ var on = m >= s.start && m < s.end; return '<div class="r' + (on ? " on" : "") + '"><i>' + s.n + "</i><span>" + esc(cls(s)) + " " + esc(s.subj || "") + (s.chg ? " <em>교체</em>" : "") + "</span><small>" + esc(s.t) + "</small></div>"; }).join("") + "</div>"
      : none(TT.timetable.has() ? "오늘은 수업이 없어요." : "내 시간표가 아직 없어요.");
    h += '<h4>🍚 급식</h4><div class="ml">' + (window.TTMeal ? "불러오는 중…" : "급식은 학교 설정 뒤에 보여요.") + "</div>";
    var E = cal().filter(function(e){ return e.d >= td; }).slice(0, 5);
    h += "<h4>📅 다가오는 일정</h4>" + (E.length ? '<div class="ls">' + E.map(function(e){ return '<div class="r' + (e.d === td ? " on" : "") + '"><span>' + esc(e.t) + "</span><small>" + (e.d === td ? "오늘" : md(e.d)) + "</small></div>"; }).join("") + "</div>" : none("학사일정이 아직 없어요."));
    return h;
  }
  function openToday(){
    var bd = sheet("📅 오늘 · " + (new Date().getMonth() + 1) + "/" + new Date().getDate() + "(" + DOW[new Date().getDay()] + ")", todayHTML());
    if(window.TTMeal && TTMeal.day) TTMeal.day(new Date(), function(v){
      var el = bd.querySelector(".ml"); if(!el) return;
      el.innerHTML = v && v.raw ? esc(TTMeal.dishes(v.raw, false).join(", ")) + (v.cal ? " <small>" + esc(v.cal) + "</small>" : "") : "오늘 급식 정보가 없어요.";
    });
  }
  function openCal(){
    var td = ymd(new Date()), E = cal(), F = E.filter(function(e){ return e.d >= td; }).slice(0, 30);
    var h = F.length ? '<div class="ls">' + F.map(function(e){ return '<div class="r' + (e.d === td ? " on" : "") + (e.k === "off" ? " off" : "") + '"><span>' + esc(e.t) + "</span><small>" + md(e.d) + "</small></div>"; }).join("") + "</div>"
      : none("학사일정이 아직 없어요.", "PC에서 학교 세팅을 받으면 여기에도 보여요.");
    sheet("🏫 학사일정", h);
  }
  function openTT(name){
    var A = allTT();
    if(!A){ sheet("🕘 선생님 시간표", none("전체 선생님 시간표가 아직 없어요.", "학기초 세팅에서 컴시간 엑셀을 넣으면 보여요.")); return; }
    var L = A.teachers.map(function(t){ return t.name; }).filter(Boolean).sort();
    function draw(n){
      var t = A.teachers.filter(function(x){ return x.name === n; })[0], d = new Date(), w = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
      var h = '<input class="pick" type="search" placeholder="선생님 이름 (적으면 바로 좁혀져요)" value="' + esc(n || "") + '" aria-label="선생님 이름">';
      if(!t){ var F = L.filter(function(x){ return !n || x.indexOf(n) >= 0; });
        return h + (F.length ? '<div class="chips">' + F.map(function(x){ return '<button type="button" data-tn="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div>" : none("그 이름의 선생님이 시간표에 없어요.")); }
      h = h.replace('class="pick"', 'class="pick" data-on="1"') + '<button type="button" class="other" data-tn="">← 다른 선생님</button>';
      if(w < 1 || w > 5) return h + none("오늘은 수업이 없는 날이에요.");
      h += '<div class="ls">' + A.periods.map(function(p){
        var s = t.slots && t.slots[w + "-" + p.n], a = String(p.t || "").split(":"), st = (+a[0]) * 60 + (+a[1]), on = m >= st && m < st + 45;
        return '<div class="r' + (on ? " on" : "") + (s ? "" : " off") + '"><i>' + p.n + "</i><span>" + (s ? esc(cls(s)) + " " + esc(s.subj || "") : "빈 시간") + "</span><small>" + esc(p.t || "") + "</small></div>";
      }).join("") + "</div>";
      return h;
    }
    var bd = sheet("🕘 선생님 시간표 · 오늘", draw(name || ""));
    function redraw(n, keep){ bd.innerHTML = draw(n); var p = bd.querySelector(".pick"); if(keep && p){ p.focus(); try{ p.setSelectionRange(p.value.length, p.value.length); }catch(x){} } }
    bd.addEventListener("input", function(e){ if(e.target.classList.contains("pick") && !e.isComposing) redraw(e.target.value.trim(), true); });
    bd.addEventListener("compositionend", function(e){ if(e.target.classList.contains("pick")) redraw(e.target.value.trim(), true); });
    bd.addEventListener("click", function(e){ var b = e.target.closest("[data-tn]"); if(b) redraw(b.getAttribute("data-tn"), false); });
  }

  /* ── 탭 3칸 ── */
  var TABS = [["write", "notebook", "적기", ""], ["find", "search", "찾기", "#find"], ["all", "list", "전체", "#all"]];
  function view(){ var h = (location.hash || "").replace(/^#/, ""); return h === "find" || h === "all" ? h : "write"; }
  function navHTML(){
    var v = view();
    return TABS.map(function(t){ return '<a href="' + esc(BASE + t[3]) + '" data-mt="' + t[0] + '"' + (t[0] === v ? ' class="on" aria-current="page"' : "") + "><span>" + icon(t[1], 22) + "</span><b>" + t[2] + "</b></a>"; }).join("");
  }
  /* 찾기 8칸 */
  function findTiles(){
    var L = [["today", "calendar", "오늘", "수업·급식·일정"], ["ext", "", "내선번호", "", "📞"], ["board", "list", "업무판", "이번 주"], room() ? null : ["safe", "safe", "금고", "공용 계정"],
             ["cal", "school", "학사일정", ""], ["lib", "lib", "자료실", "학교 문서"], ["card", "idcard", "학생 카드", ""], ["tt", "clock", "선생님", "시간표"]].filter(Boolean);
    return '<nav class="mobT8" aria-label="학교 정보">' + L.map(function(x){ return '<button type="button" data-mf="' + x[0] + '"><span>' + (x[1] ? icon(x[1], 24) : tIcon(null, x[4], 24)) + "</span><b>" + x[2] + "</b>" + (x[3] ? "<small>" + x[3] + "</small>" : "") + "</button>"; }).join("") + "</nav>";
  }
  /* 전체: 휴대폰에서 쓰는 도구 목록 + 설정 */
  function allHTML(){
    var M = (typeof TT_MENUS !== "undefined" ? TT_MENUS : []).filter(function(m){ return m.id !== "home" && m.id !== "settings" && (typeof ttMenuShown !== "function" || ttMenuShown(m.id)); });
    var h = M.map(function(m){
      var L = (typeof TT_TOOLS !== "undefined" ? TT_TOOLS : []).filter(function(t){ return t.menu === m.id && t.ready && t.href && !t.in && (typeof ttToolShown !== "function" || ttToolShown(t)); });
      if(!L.length) return "";
      return '<section><h3>' + esc(m.name) + '</h3><div class="g">' + L.map(function(t){ return '<a href="' + esc(BASE + t.href) + '"><span>' + tIcon(t.id, t.icon, 20) + "</span><b>" + esc(t.short || t.name) + "</b></a>"; }).join("") + "</div></section>";
    }).join("");
    h += '<section><h3>설정</h3><div class="g">'
      + [["start", "🧳", "시작 세팅"], ["look", "🎨", "꾸미기"], ["help", "❓", "도움말"]].map(function(x){ return '<button type="button" data-mh="' + x[0] + '"><span>' + tIcon(null, x[1], 20) + "</span><b>" + x[2] + "</b></button>"; }).join("") + "</div></section>";
    return h;
  }
  var nav = null, box = null;
  function drawHome(){
    if(!HOME) return;
    var on = ph(); R.classList.toggle("mob", on);
    if(!on){ if(nav) nav.hidden = true; if(box) box.hidden = true; R.removeAttribute("data-mv"); return; }
    if(!nav){ nav = document.createElement("nav"); nav.id = "mobNav"; nav.setAttribute("aria-label", "휴대폰 메뉴"); document.body.appendChild(nav); }
    nav.hidden = false; nav.innerHTML = navHTML();
    var v = view(); R.setAttribute("data-mv", v);
    if(!box){ box = document.createElement("div"); box.id = "mobView"; var hero = document.getElementById("sbHero"); (hero && hero.parentNode ? hero.parentNode : document.body).insertBefore(box, hero ? hero.nextSibling : null); }
    box.hidden = v === "write";
    box.innerHTML = v === "find" ? findTiles() : v === "all" ? allHTML() : "";
    var q = document.getElementById("sbQ2");
    if(q){ q.placeholder = v === "find" ? "선생님 · 내선 · 일정 · 학생 · 문서 찾기" : "적기 · 찾기 — 예: 3번 지각, + 내일 회의"; }
  }

  /* ── 도구 화면: 얇은 머리줄 ── */
  var head = null;
  function here(){
    var m = location.pathname.match(/\/apps\/([^\/]+)\//), id = m ? m[1] : "";
    if(id === "sguide") id = /[?&]tab=counsel/.test(location.search) ? "counsel" : "gquick";
    if(id === "school") id = "schoolhub";
    return typeof ttTool === "function" ? ttTool(id) : null;
  }
  function from(){ try{ return sessionStorage.getItem("mob_from") || ""; }catch(e){ return ""; } }
  function drawTool(){
    if(HOME) return;
    var on = ph(); R.classList.toggle("mob", on);
    if(!on){ if(head) head.hidden = true; return; }
    var t = here(), ttl = document.title.split("·")[0].trim();
    if(!head){ head = document.createElement("div"); head.id = "mobHead"; head.setAttribute("role", "navigation"); head.setAttribute("aria-label", "도구 머리줄"); document.body.insertBefore(head, document.body.firstChild); }
    head.hidden = false;
    var back = BASE + (from() === "find" ? "#find" : from() === "all" ? "#all" : "");
    head.innerHTML = '<a class="bk" href="' + esc(back) + '" aria-label="뒤로">‹</a><b>' + (t ? tIcon(t.id, t.icon, 18) + " " + esc(t.short || t.name) : esc(ttl)) + "</b>"
      + '<a class="fd" href="' + esc(BASE + "#find") + '" aria-label="찾기">' + icon("search", 20) + "</a>";
  }

  /* v2.57 도구 안쪽: PC에서만 쓰는 단추(인쇄 · 크게 띄우기 · 단축키)는 휴대폰에서 숨김 — 화면이 다시 그려져도 */
  var PCB = /^\W{0,3}\s*(인쇄|인쇄용|크게 보기|크게 띄우기|전체 화면|단축키)/;
  function tidy(){
    if(HOME || !ph()) return;
    Array.prototype.forEach.call(document.querySelectorAll("button:not(.mobHide),a.btn:not(.mobHide)"), function(b){
      if(b.closest("#mobHead,.mobSh,dialog")) return;
      var t = (b.textContent || "").trim(); if(t && t.length < 16 && PCB.test(t)) b.classList.add("mobHide");
    });
  }
  var tT = 0;
  if(!HOME) new MutationObserver(function(){ clearTimeout(tT); tT = setTimeout(tidy, 120); }).observe(document.documentElement, {childList: true, subtree: true});

  /* ── 누르기 ── */
  document.addEventListener("click", function(e){
    if(!ph()) return;
    var a = e.target.closest("[data-mq],[data-mf],[data-mh],[data-mt],#mobView a[href],#mobHead .bk");
    if(!a) return;
    if(a.matches("#mobHead .bk")){                                       // 뒤로: 쌤 노트 안에서 왔으면 브라우저 뒤로, 아니면 원래 탭
      if(document.referrer && document.referrer.indexOf(location.origin) === 0 && history.length > 1){ e.preventDefault(); history.back(); }
      return;
    }
    if(a.dataset.mt){                                                    // 탭
      try{ sessionStorage.setItem("mob_from", a.dataset.mt); }catch(x){}
      if(HOME){ e.preventDefault(); var h = a.dataset.mt === "write" ? "" : a.dataset.mt; if(view() !== a.dataset.mt){ if(h) location.hash = h; else history.pushState(null, "", location.pathname + location.search); } drawHome(); window.scrollTo(0, 0); }
      return;
    }
    try{ sessionStorage.setItem("mob_from", view()); }catch(x){}
    if(a.dataset.mq){ e.preventDefault(); write(a.dataset.mq); return; }
    if(a.dataset.mh){ e.preventDefault(); if(window.TT_HUB) TT_HUB.open(a.dataset.mh); return; }
    var f = a.dataset.mf; if(!f) return;
    e.preventDefault();
    var go = {ext: "apps/school/?tab=ext", board: "apps/school/?tab=board", safe: "apps/school/?tab=safe", lib: "apps/lib/", card: "apps/stucard/"}[f];
    if(go){ location.href = BASE + go; return; }
    if(f === "today") openToday(); else if(f === "cal") openCal(); else if(f === "tt") openTT("");
  });
  /* 적기 6칸 */
  function write(k){
    if(k === "att"){ if(window.TT_QUICK && TT_QUICK.att) TT_QUICK.att(); else location.href = BASE + "apps/tardy/"; return; }
    if(k === "memo"){ if(TT.notes && TT.notes.quick) TT.notes.quick({src: "휴대폰 적기"}); return; }
    if(k === "todo"){ if(window.TT_FIND && TT_FIND.open) TT_FIND.open("할 일: "); return; }   // 홈 '오늘 할 일 + 적기'와 같은 창
    var go = {guide: "apps/sguide/?tab=guide", counsel: "apps/sguide/?tab=counsel", jrn: "apps/journal/", voice: "apps/voice/"}[k];
    if(go) location.href = BASE + go;
  }

  /* 찾기 탭: 적는 대로 바로 찾기 (Enter 없이) */
  var qT = 0;
  document.addEventListener("input", function(e){
    if(!HOME || !ph() || view() !== "find" || !e.target || e.target.id !== "sbQ2" || e.isComposing) return;
    clearTimeout(qT); var v = e.target.value.trim();
    qT = setTimeout(function(){ var h = window.TT_SBHOME; if(h && h.search && v.length >= 1) h.search(v); }, 250);
  });
  function draw(){ if(HOME) drawHome(); else { drawTool(); tidy(); } }
  window.addEventListener("hashchange", function(){ if(HOME) drawHome(); });
  window.addEventListener("popstate", function(){ if(HOME) drawHome(); });
  try{ window.matchMedia("(max-width:760px)").addEventListener("change", draw); }catch(e){}
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
  window.addEventListener("load", draw);
  window.TT_MOB = {open: function(k, a){ if(k === "today") openToday(); else if(k === "cal") openCal(); else if(k === "tt") openTT(a || ""); }, draw: draw, on: ph};
})();
