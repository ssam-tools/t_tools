/* 쌤 노트 · 재미 요소 (PLAN_통일 6단계) — TT.joy
   업무를 가리지 않는 작은 즐거움. 모두 이 기기에만 저장(tt_joy_v1, 전체 백업에 포함)하고, ⋯ → 🎈 도장판·배지에서 끌 수 있습니다.
   교실 기기(전자칠판) 모드에서는 아무것도 하지 않습니다.
   ① 🦉 살아 있는 쌤비 — 계절 소품(🌸🕶️🍂🧣), 시험 기간 머리띠(📝), 시간·요일에 맞춘 한마디(첫 화면, 시간대마다 한 번)
   ② ✅ 퇴근 도장 — '오늘 챙길 것'에 급한 일이 없으면 오후에 [🙌 퇴근 도장] → 쾅! 한 달 도장판
   ③ ⏱️ 아껴 준 시간 — 쌤 노트가 만든 파일 내려받기·인쇄를 할 때마다 그 일을 손으로 할 때 걸리는 시간을 대략 더함, 금요일 오후 한 주 결산
   ④ 🌳 우리 반 나무 — ⚡ 빠른 지도의 '칭찬'이 쌓이면 우리 반 메뉴의 나무가 자람
   ⑤ 📅 D-day 한 줄 — 학사일정에서 가장 가까운 시험·방학·졸업
   ⑥ 🏅 숨은 배지 — 처음 받기 전에는 ❔ */
(function(){
  "use strict";
  if(!window.TT || TT.joy || TT.classroom) return;
  var KEY = "tt_joy_v1";
  var HOME = !/\/apps\//.test(location.pathname);
  var APP = (location.pathname.match(/\/apps\/([^\/]+)\//) || [])[1] || "home";
  function load(){ var o = TT.store.get(KEY, null) || {}; o.stamps = o.stamps || {}; o.saved = Array.isArray(o.saved) ? o.saved : []; o.badges = o.badges || {}; o.cnt = o.cnt || {}; o.seen = o.seen || {}; return o; }
  function save(o){ TT.store.set(KEY, o); }
  var J = load();
  function on(){ return !J.off; }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function monday(d){ d = new Date(d || new Date()); d.setHours(0, 0, 0, 0); var w = d.getDay(); d.setDate(d.getDate() - (w === 0 ? 6 : w - 1)); return d; }
  function hm(m){ m = Math.round(m); var h = Math.floor(m / 60), r = m % 60; return h ? h + "시간" + (r ? " " + r + "분" : "") : r + "분"; }

  /* ---------- 화면 모양 ---------- */
  var st = document.createElement("style");
  st.textContent = ""
    + "#joyBub{position:fixed;z-index:71;max-width:min(300px,70vw);background:var(--t-card,#fff);color:var(--t-ink,#1d2733);border:2px solid #1D9E75;border-radius:16px 16px 4px 16px;padding:9px 13px;font:600 13.5px/1.5 var(--t-font,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif);box-shadow:0 8px 22px rgba(15,110,86,.22);cursor:pointer;animation:joyIn .35s cubic-bezier(.2,1.4,.4,1)}"
    + ".joyAcc2{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.joyAcc2 button{font:inherit;font-size:11.5px;border:2px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:12px;padding:6px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;color:var(--t-ink,#1d2733)}"
    + ".joyAcc2 button i{font-style:normal;font-size:20px}.joyAcc2 button.on{border-color:var(--t-accent,#2f6fb5)}.joyAcc2 button:disabled{opacity:.5;cursor:default}"
    + "#joyBub.lt{border-radius:16px 16px 16px 4px}"
    + "#joyBub small{display:block;color:var(--t-sub,#5b6773);font-weight:500;font-size:11.5px;margin-top:2px}"
    + "#joyPill{position:fixed;z-index:71;background:#1D9E75;color:#fff;border-radius:999px;padding:5px 11px;font:800 13px/1 var(--t-font,'Malgun Gothic',system-ui,sans-serif);pointer-events:none;animation:joyUp 2.4s ease-out forwards}"
    + "@keyframes joyIn{from{opacity:0;transform:translateY(8px) scale(.9)}to{opacity:1;transform:none}}"
    + "@keyframes joyUp{0%{opacity:0;transform:translateY(10px)}15%{opacity:1;transform:none}75%{opacity:1}100%{opacity:0;transform:translateY(-26px)}}"
    + ".joyAcc{position:absolute;left:-4px;top:-10px;font-size:26px;line-height:1;pointer-events:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.18));transform:rotate(-14deg)}"
    + "@media (max-width:760px){.joyAcc{font-size:21px;left:-3px;top:-8px}}"
    + ".joyChip{display:inline-flex;align-items:center;gap:3px;margin-left:6px;padding:2px 9px;border-radius:999px;font-size:12.5px;font-weight:800;background:var(--t-accent-soft,#e6f0fa);color:var(--t-accent,#2f6fb5);border:0;cursor:pointer;font-family:inherit;vertical-align:middle;white-space:nowrap}"
    + ".joyChip.dd{background:#fff3e0;color:#a35a00}.joyChip.sv{background:#e3f3ea;color:#1f6b45}.joyChip.tr{background:#eaf6e4;color:#2f6b1f}"
    + ".joyStamp{border:0;border-radius:999px;padding:3px 10px;font:800 12.5px var(--t-font,'Malgun Gothic',system-ui,sans-serif);cursor:pointer;margin-left:6px;background:#fdecec;color:#b3261e;white-space:nowrap}"
    + ".joyStamp.done{background:#e3f3ea;color:#1f6b45}"
    + ".joyStamp.go{animation:joyWig 2.4s ease-in-out infinite}"
    + "@keyframes joyWig{0%,86%,100%{transform:none}90%{transform:rotate(-6deg)}95%{transform:rotate(6deg)}}"
    + "#joyBig{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;pointer-events:none}"
    + "#joyBig .s{width:min(240px,56vw);aspect-ratio:1;border-radius:50%;border:9px double #c62828;color:#c62828;display:flex;flex-direction:column;align-items:center;justify-content:center;font:900 clamp(26px,6vw,40px)/1.15 var(--t-font,'Malgun Gothic',system-ui,sans-serif);background:rgba(255,255,255,.88);transform:rotate(-12deg);animation:joyBang .55s cubic-bezier(.3,1.6,.5,1) both;text-align:center;box-shadow:0 10px 40px rgba(198,40,40,.25)}"
    + "#joyBig .s small{font-size:.42em;font-weight:800;margin-top:4px}"
    + "@keyframes joyBang{0%{opacity:0;transform:rotate(-12deg) scale(2.6)}60%{opacity:1;transform:rotate(-12deg) scale(.92)}100%{transform:rotate(-12deg) scale(1)}}"
    + ".joyCf{position:fixed;z-index:91;top:-20px;font-size:20px;pointer-events:none;animation:joyFall linear forwards}"
    + "@keyframes joyFall{to{transform:translateY(105vh) rotate(540deg);opacity:.2}}"
    + ".joyDlg{border:0;border-radius:18px;padding:16px 18px;width:min(560px,95vw);max-height:92vh;box-shadow:0 18px 50px rgba(20,40,70,.28);font-family:var(--t-font,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif);color:var(--t-ink,#1d2733);background:var(--t-card,#fff)}"
    + ".joyDlg::backdrop{background:rgba(20,30,45,.4)}"
    + ".joyDlg h2{font-size:18px;font-weight:800;margin:0 0 8px;display:flex;align-items:center;gap:8px}.joyDlg h2 button{margin-left:auto}"
    + ".joyDlg h3{font-size:14px;font-weight:800;margin:8px 0 4px;display:flex;gap:6px;align-items:baseline}.joyDlg h3 small{font-weight:600;color:var(--t-sub,#5b6773)}"
    + ".joyDlg button.x{border:1px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:9px;padding:4px 10px;font:inherit;font-size:13px;cursor:pointer}"
    + ".joyCal{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}.joyCal b{font-size:11.5px;color:var(--t-sub,#5b6773);text-align:center}"
    + ".joyCal span{height:clamp(22px,4.2vh,34px);border-radius:8px;background:var(--t-bg,#f3f6f9);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--t-sub,#5b6773);position:relative}"
    + ".joyCal span.st{background:#fdecec;color:#c62828;font-weight:900}.joyCal span.st::after{content:'✔';position:absolute;right:4px;top:1px;font-size:10px}.joyCal span.td{outline:2px solid var(--t-accent,#2f6fb5)}.joyCal span.no{visibility:hidden}"
    + ".joyRow{display:flex;gap:8px;flex-wrap:wrap}.joyRow>div{flex:1 1 140px;background:var(--t-bg,#f3f6f9);border-radius:12px;padding:8px 10px;font-size:12.5px;color:var(--t-sub,#5b6773)}.joyRow>div b{display:block;font-size:17px;color:var(--t-ink,#1d2733)}"
    + ".joyBd{display:grid;grid-template-columns:repeat(6,1fr);gap:5px}.joyBd div{border-radius:10px;background:var(--t-bg,#f3f6f9);text-align:center;padding:6px 2px;font-size:11px;line-height:1.3;color:var(--t-sub,#5b6773)}.joyBd div i{display:block;font-style:normal;font-size:20px}.joyBd div.got{background:#fff6d6;color:#7a5a00;font-weight:700}"
    + ".joyDlg .joyOff{display:flex;align-items:center;gap:6px;font-size:13px;margin-top:10px;color:var(--t-sub,#5b6773)}"
    + "@media print{#joyBub,#joyPill,#joyBig,.joyCf,.joyAcc,.joyChip,.joyStamp{display:none!important}}"
    + "@media (prefers-reduced-motion:reduce){#joyBub,#joyPill,#joyBig .s,.joyCf,.joyStamp.go{animation:none!important}.joyCf{display:none}}";
  document.head.appendChild(st);

  /* ---------- 학사일정 · 시기 ---------- */
  function events(){ var C = TT.store.get("tt_calendar_v1", null); return C && Array.isArray(C.events) ? C.events : []; }
  function dday(){
    var t = ymd(), lim = ymd(new Date(Date.now() + 120 * 864e5)), best = null;
    events().forEach(function(e){
      if(!e || !e.d || e.d <= t || e.d > lim) return;
      if(!/고사|시험|평가회|방학식|방학|졸업|수능|종업식|체육대회|축제|수학여행|수련회/.test(e.t || "")) return;
      if(/방학/.test(e.t) && !/방학식/.test(e.t) && e.k === "off") return;   // 방학 기간 날짜들은 방학식만
      if(!best || e.d < best.d) best = e;
    });
    if(!best) return null;
    var n = Math.round((new Date(best.d + "T00:00:00") - new Date(t + "T00:00:00")) / 864e5);
    return {t: String(best.t).replace(/\s+/g, " ").slice(0, 12), n: n, d: best.d};
  }
  function examNear(){ var t = new Date(); t.setHours(0, 0, 0, 0); var a = ymd(new Date(t - 2 * 864e5)), b = ymd(new Date(+t + 5 * 864e5)); return events().some(function(e){ return e.d >= a && e.d <= b && (e.k === "exam" || /고사|시험/.test(e.t || "")); }); }
  function season(){ var m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter"; }
  var ACC = {spring: ["🌸", "봄 꽃 핀"], summer: ["🕶️", "여름 선글라스"], autumn: ["🍂", "가을 낙엽"], winter: ["🧣", "겨울 목도리"]};

  /* ---------- ③ 아껴 준 시간 ---------- */
  var MIN = {tardy: 10, bonus: 30, advisor: 15, merge: 15, photo: 10, ai: 8, voice: 10, journal: 10, stucard: 5, parent: 5, setup: 10, record: 10, submit: 5, seat: 5, group: 5, mgen: 15, assess: 10, mcheck: 10, duty: 5, year: 5, train: 5, home: 0};   // 첫 화면 내려받기(백업 등)는 셈하지 않음
  var PMIN = {tardy: 5, advisor: 10, seat: 5, group: 5, record: 5, mgen: 10, home: 0};
  var lastSave = {};
  function saved(kind, m){
    kind = kind || APP; if(m == null) m = kind in MIN ? MIN[kind] : 5; if(!m) return;
    var now = Date.now(); if(lastSave[kind] && now - lastSave[kind] < 60 * 1000) return;   // 같은 일을 1분 안에 또 하면 한 번만
    lastSave[kind] = now; J = load(); J.saved.push({d: ymd(), k: kind, m: m});
    if(J.saved.length > 600) J.saved = J.saved.slice(-600);
    save(J); if(on()){ pill("⏱️ +" + m + "분 아꼈어요"); badges(); }
  }
  function sumSince(d0){ var a = ymd(d0); return load().saved.reduce(function(s, x){ return x.d >= a ? s + (+x.m || 0) : s; }, 0); }
  function weekSaved(){ return sumSince(monday()); }
  function allSaved(){ return load().saved.reduce(function(s, x){ return s + (+x.m || 0); }, 0); }
  (function(){   // 내려받기·인쇄를 지켜보기 (도구 코드는 고치지 않음)
    var U = TT.util; if(U && U.download && !U.download.__joy){ var d0 = U.download; U.download = function(){ var r = d0.apply(this, arguments); try{ saved(APP); }catch(e){} return r; }; U.download.__joy = 1; }
    var p0 = window.print; if(p0 && !p0.__joy){ window.print = function(){ try{ saved(APP, APP in PMIN ? PMIN[APP] : 3); }catch(e){} return p0.apply(window, arguments); }; window.print.__joy = 1; }
  })();

  /* ---------- 쌤비 옆 말풍선 · 작은 알약 ---------- */
  function owl(){   // v2.8: 쌤비 홈 디자인이면 첫 화면 큰 쌤비 · 도구 화면 왼쪽 막대 쌤비 · 휴대폰 위쪽 쌤비 중 보이는 것
    var L = ["sbBtn", "sbBarOwl", "sbBarOwl2"];
    for(var i = 0; i < L.length; i++){ var b = document.getElementById(L[i]); if(b && b.getClientRects().length && getComputedStyle(b).display !== "none"){ var r = b.getBoundingClientRect(); if(r.width && r.bottom > 0) return r; } }
    return null;
  }
  function place(el, gap){ var r = owl();
    if(r && r.left < innerWidth / 2){ el.style.left = Math.min(innerWidth - 260, r.right + (gap || 8)) + "px"; el.style.top = Math.max(8, r.top + r.height * .25) + "px"; el.style.right = "auto"; el.style.bottom = "auto"; el.classList.add("lt"); return; }
    if(r){ el.style.right = Math.max(8, innerWidth - r.left + (gap || 8)) + "px"; el.style.bottom = Math.max(8, innerHeight - r.top - r.height * .55) + "px"; } else { el.style.right = "20px"; el.style.bottom = "20px"; } }
  function pill(t){ var o = document.getElementById("joyPill"); if(o) o.remove(); var p = document.createElement("div"); p.id = "joyPill"; p.textContent = t; document.body.appendChild(p); place(p, -60); p.style.bottom = (parseFloat(p.style.bottom) + 70) + "px"; setTimeout(function(){ p.remove(); }, 2500); }
  var bubT = 0;
  function bubble(html, ms){
    var o = document.getElementById("joyBub"); if(o) o.remove();
    var b = document.createElement("div"); b.id = "joyBub"; b.setAttribute("role", "status"); b.innerHTML = html; b.title = "누르면 닫힘";
    b.onclick = function(){ b.remove(); }; document.body.appendChild(b); place(b, 10);
    clearTimeout(bubT); bubT = setTimeout(function(){ if(b.parentNode) b.remove(); }, ms || 9000);
  }

  /* ---------- ① 살아 있는 쌤비 ---------- */
  function dress(){
    var b = document.getElementById("sbBtn"); if(!b) return false;
    var a = b.querySelector(".joyAcc"); if(!on()){ if(a) a.remove(); return true; }
    var x = examNear() ? ["📝", "시험 기간 머리띠"] : ACC[season()];
    if(!a){ a = document.createElement("span"); a.className = "joyAcc"; a.setAttribute("aria-hidden", "true"); b.appendChild(a); }
    if(a.textContent !== x[0]){ a.textContent = x[0]; a.title = x[1]; } return true;
  }
  function greet(){
    if(!on() || !HOME || document.documentElement.getAttribute("data-ui") === "ssambi") return;   // v2.0 쌤비 홈은 쌤비 말풍선이 첫 화면에 늘 있음
    var d = new Date(), h = d.getHours() + d.getMinutes() / 60, w = d.getDay(), slot = h < 5 ? "late" : h < 9 ? "am0" : h < 12 ? "am" : h < 13.2 ? "lunch" : h < 16.5 ? "pm" : "eve", k = ymd() + "|" + slot;
    J = load(); if(J.seen.greet === k) return;
    var msg = "", sub = "", dd = dday(), tt = null;
    try{ tt = TT.timetable && TT.timetable.day ? TT.timetable.day(d) : null; }catch(e){}
    var mins = d.getHours() * 60 + d.getMinutes(), next = (tt || []).filter(function(x){ return x.start > mins; })[0], cnt = (tt || []).length;
    if(w === 0 || w === 6) msg = "주말에도 오셨네요! 오늘은 조금만 하고 푹 쉬어요 🌿";
    else if(slot === "late") msg = "늦은 시간까지 고생 많으세요. 푹 쉬세요 🌙";
    else if(slot === "am0") msg = (w === 1 ? "새로운 한 주예요! " : w === 5 ? "드디어 금요일! " : "좋은 아침이에요! ") + (cnt ? "오늘 수업 " + cnt + "시간" + (next ? ", 첫 수업은 " + next.n + "교시 " + (next.code || "") + "예요." : "이에요.") : "오늘도 함께해요.");
    else if(slot === "am") msg = next ? "다음은 " + next.n + "교시 " + (next.code || "") + " 수업이에요. 화이팅!" : "오전 잘 보내고 계시죠? 물 한 잔 마셔요 💧";
    else if(slot === "lunch") msg = "점심시간이에요! 맛있게 드세요 🍚";
    else if(slot === "pm") msg = w === 5 ? "금요일 오후! 조금만 더 하면 주말이에요 🎉" : next ? "오후도 힘내요! 다음은 " + next.n + "교시 " + (next.code || "") + "." : "수업 끝! 오늘 챙길 것만 보면 퇴근 도장이에요 ✅";
    else msg = "오늘 하루 수고 많으셨어요. 얼른 들어가 쉬세요 🌙";
    if(examNear()) sub = "📝 시험 기간이에요. 조금만 힘내요!";
    else if(dd && dd.n <= 14) sub = "📅 " + dd.t + "까지 " + dd.n + "일";
    var ws = weekSaved();
    if(w === 5 && slot !== "am0" && slot !== "am" && ws >= 10 && J.seen.week !== ymd(monday())){ msg = "이번 주 쌤 노트가 <b>" + hm(ws) + "</b> 아껴 드렸어요. 주말 잘 보내세요! 🎉"; sub = ""; J.seen.week = ymd(monday()); }
    J.seen.greet = k; if(h < 8) J.cnt.early = (J.cnt.early || 0) + 1; save(J);
    bubble("🦉 " + msg + (sub ? "<small>" + esc(sub) + "</small>" : ""), 9000);
    badges();
  }

  /* ---------- ② 퇴근 도장 ---------- */
  function stampable(){ var d = new Date(); return d.getDay() >= 1 && d.getDay() <= 5 && d.getHours() >= 12; }
  function monthStamps(){ var p = ymd().slice(0, 7); return Object.keys(load().stamps).filter(function(k){ return k.indexOf(p) === 0; }).length; }
  function stampBtn(){
    var c = document.getElementById("tdCheck"); if(!c) return;
    var h = c.querySelector(".tdh"); if(!h) return;
    var old = h.querySelector(".joyStamp"); if(!on()){ if(old) old.remove(); return; }
    var urgent = /급한 일/.test((h.querySelector(".tdn") || {}).textContent || ""), got = !!load().stamps[ymd()];
    var want = got ? "done" : (stampable() && !urgent ? "go" : "");
    if(!want){ if(old) old.remove(); return; }
    if(old && old.dataset.s === want) return;
    if(old) old.remove();
    var b = document.createElement("button"); b.type = "button"; b.className = "joyStamp " + want; b.dataset.s = want;
    b.textContent = want === "done" ? "✅ 오늘 도장 · 이번 달 " + monthStamps() : "🙌 퇴근 도장";
    b.title = want === "done" ? "도장판·배지 보기" : "오늘 챙길 일을 다 했어요! 눌러서 퇴근 도장 쾅";
    b.onclick = function(e){ e.preventDefault(); e.stopPropagation(); if(want === "done") open(); else stamp(); };
    var tdn = h.querySelector(".tdn"); h.insertBefore(b, tdn || null);
  }
  function stamp(){
    J = load(); var t = ymd(); if(J.stamps[t]) return open();
    J.stamps[t] = Date.now(); save(J);
    var d = new Date(), big = document.createElement("div"); big.id = "joyBig";
    big.innerHTML = '<div class="s">참 잘했어요<small>' + (d.getMonth() + 1) + "." + d.getDate() + " 퇴근 도장</small></div>";
    document.body.appendChild(big); confetti(["🎉", "✨", "⭐", "🌟", "💮"], 26);
    setTimeout(function(){ big.style.transition = "opacity .5s"; big.style.opacity = "0"; }, 1400); setTimeout(function(){ big.remove(); }, 2000);
    setTimeout(function(){ bubble("🦉 오늘도 수고 많으셨어요! 이번 달 도장 <b>" + monthStamps() + "</b>개" + (weekSaved() ? "<small>이번 주 아낀 시간 " + hm(weekSaved()) + "</small>" : ""), 7000); badges(); stampBtn(); }, 1500);
  }
  function confetti(set, n){
    if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for(var i = 0; i < n; i++){ var c = document.createElement("span"); c.className = "joyCf"; c.textContent = set[i % set.length]; c.style.left = Math.random() * 100 + "vw"; c.style.animationDuration = (1.6 + Math.random() * 1.6) + "s"; c.style.animationDelay = Math.random() * .5 + "s"; c.style.fontSize = (14 + Math.random() * 14) + "px"; document.body.appendChild(c); setTimeout(function(x){ x.remove(); }.bind(null, c), 3800); }
  }

  /* ---------- ④ 우리 반 나무 ---------- */
  /* v2.8 연속 퇴근 도장: 오늘(아직이면 지난 평일)부터 거꾸로 평일을 세어 도장이 이어진 날 수 */
  function streak(){
    var S = load().stamps, d = new Date(); d.setHours(12, 0, 0, 0);
    if(!S[ymd(d)]) d.setDate(d.getDate() - 1);
    var n = 0;
    for(var i = 0; i < 400; i++){ var w = d.getDay(); if(w !== 0 && w !== 6){ if(S[ymd(d)]) n++; else break; } d.setDate(d.getDate() - 1); }
    return n;
  }
  /* v2.8 나무에 물 주기: 칭찬 + 청소 당번 '완료' (우리 반 1인1역 화면) */
  function cleaned(){
    var D = TT.store.get("tt_duty_v1", null), y = new Date(), from = (y.getMonth() + 1 >= 3 ? y.getFullYear() : y.getFullYear() - 1) + "-03-01", n = 0;
    try{ Object.keys((D && D.c) || {}).forEach(function(k){ var dn = (D.c[k].cl || {}).done || {}; Object.keys(dn).forEach(function(x){ if(String(dn[x]) >= from) n++; }); }); }catch(e){}
    return n;
  }
  function growth(){ return praise() + cleaned(); }
  function praise(){
    var G = TT.store.get("tt_guide_v1", null), y = new Date(), from = (y.getMonth() + 1 >= 3 ? y.getFullYear() : y.getFullYear() - 1) + "-03-01";
    return G && Array.isArray(G.gd) ? G.gd.filter(function(g){ return g && String(g.kind || "").indexOf("칭찬") >= 0 && (g.date || "") >= from; }).length : 0;
  }
  var TREE = [[0, "🌰", "씨앗"], [1, "🌱", "새싹"], [5, "🌿", "어린 나무"], [15, "🌳", "나무"], [30, "🌸", "꽃 핀 나무"], [60, "🍎", "열매 맺은 나무"], [100, "🏞️", "숲"]];
  function tree(n){ var s = TREE[0], nx = null; TREE.forEach(function(x, i){ if(n >= x[0]){ s = x; nx = TREE[i + 1] || null; } }); return {ic: s[1], nm: s[2], next: nx ? nx[0] - n : 0, nnm: nx ? nx[2] : ""}; }
  function treeChip(){
    var mv = document.getElementById("mview"); if(!mv) return;
    var h = mv.getAttribute("data-menu") === "homeroom" ? mv.querySelector(".mfh h2") : null, old = document.querySelector(".joyChip.tr");
    if(!h || !on()){ if(old) old.remove(); return; }
    if(old && h.contains(old)) return; if(old) old.remove();
    var n = growth(), T = tree(n), b = document.createElement("button"); b.type = "button"; b.className = "joyChip tr";
    b.innerHTML = T.ic + " 우리 반 " + T.nm + " <small style='font-weight:600'>칭찬·청소 " + n + "</small>";
    b.title = "⚡ 빠른 지도의 '칭찬👍', 청소 당번 '완료'마다 자라요" + (T.next ? " · " + T.nnm + "까지 " + T.next + "번" : "");
    b.onclick = function(e){ e.preventDefault(); open("tree"); }; h.appendChild(b);
  }

  /* ---------- ⑤ D-day · 이번 주 아낀 시간 (첫 화면 날짜 줄) ---------- */
  function leadChips(){
    var p = document.querySelector("header .lead"); if(!p) return;
    var a = p.querySelector(".joyChip.dd"), s = p.querySelector(".joyChip.sv");
    if(!on()){ if(a) a.remove(); if(s) s.remove(); return; }
    var dd = dday(), ws = weekSaved();
    if(dd){ var tx = "📅 " + dd.t + " D-" + dd.n; if(!a){ a = document.createElement("button"); a.type = "button"; a.className = "joyChip dd"; a.onclick = function(){ location.href = (TT.BASE || "./") + "apps/year/"; }; p.appendChild(a); } if(a.textContent !== tx){ a.textContent = tx; a.title = dd.d + " " + dd.t + " (학사일정)"; } } else if(a) a.remove();
    if(ws){ var sx = "⏱️ 이번 주 " + hm(ws) + " 아낌"; if(!s){ s = document.createElement("button"); s.type = "button"; s.className = "joyChip sv"; s.title = "쌤 노트가 만든 파일·인쇄로 아낀 시간(대략) · 눌러서 도장판"; s.onclick = function(){ open(); }; p.appendChild(s); } if(s.textContent !== sx) s.textContent = sx; } else if(s) s.remove();
  }

  /* ---------- ⑥ 숨은 배지 ---------- */
  var BADGES = [
    ["stamp1", "✅", "첫 퇴근 도장", function(o){ return Object.keys(o.stamps).length >= 1; }],
    ["stamp10", "🔟", "퇴근 도장 10개", function(o){ return Object.keys(o.stamps).length >= 10; }],
    ["month", "🏆", "한 달 도장 15개", function(){ return monthStamps() >= 15; }],
    ["fri", "🎉", "금요일 퇴근 도장", function(o){ return Object.keys(o.stamps).some(function(k){ return new Date(k + "T12:00:00").getDay() === 5; }); }],
    ["save60", "⏱️", "아낀 시간 1시간", function(){ return allSaved() >= 60; }],
    ["save600", "🚀", "아낀 시간 10시간", function(){ return allSaved() >= 600; }],
    ["praise10", "🌱", "칭찬 10번", function(){ return praise() >= 10; }],
    ["praise50", "🌳", "칭찬 50번", function(){ return praise() >= 50; }],
    ["merge", "📎", "첫 파일 합치기", function(o){ return o.saved.some(function(x){ return x.k === "merge"; }); }],
    ["keys", "⌨️", "단축키 30번", function(o){ return (o.cnt.keys || 0) >= 30; }],
    ["early", "🌅", "아침 8시 전 출근", function(o){ return (o.cnt.early || 0) >= 1; }],
    ["tools", "🧰", "하루에 도구 5가지", function(o){ return (o.cnt.toolsMax || 0) >= 5; }],
    ["streak5", "🔥", "5일 연속 퇴근 도장", function(){ return streak() >= 5; }],
    ["find50", "🔎", "검색창으로 찾기 50번", function(o){ return (o.cnt.find || 0) >= 50; }],
    ["voice1", "🎙️", "첫 말로 기록", function(o){ return o.saved.some(function(x){ return x.k === "voice"; }) || (o.cnt.voice || 0) >= 1; }],
    ["backup3", "💾", "백업 3번", function(o){ return (o.cnt.backup || 0) >= 3; }],
    ["duty4", "🧹", "1인 1역 4주 운영", function(){ var D = TT.store.get("tt_duty_v1", null), ok = false; try{ Object.keys((D && D.c) || {}).forEach(function(k){ var c = D.c[k]; if(c.start && c.roles && c.roles.length && (Date.now() - new Date(c.start + "T00:00:00")) >= 28 * 864e5) ok = true; }); }catch(e){} return ok; }],
    ["tree15", "🌳", "우리 반 나무가 '나무'로", function(){ return growth() >= 15; }]
  ];
  /* v2.8 쌤비 소품: 배지를 받을수록 하나씩 열림 → ⋯ 화면 꾸미기 · 도장판에서 골라 씌우기 (계절 = 철마다 저절로) */
  var ACCS = [["season", "🍂", "계절 소품", 0], ["bow", "🎀", "나비넥타이", 1], ["flower", "🌼", "꽃 핀", 3], ["hat", "🥳", "고깔모자", 5], ["grad", "🎓", "학사모", 8], ["crown", "👑", "왕관", 12]];
  function nBadge(){ return Object.keys(load().badges).length; }
  function accOpen(a){ return nBadge() >= a[3]; }
  function acc(){ if(!on()) return ""; var k = load().acc; var a = ACCS.filter(function(x){ return x[0] === k; })[0]; return a && a[0] !== "season" && accOpen(a) ? a[0] : ""; }
  function setAcc(k){ J = load(); J.acc = k; save(J); try{ if(window.TT_SBAR) TT_SBAR.draw(); }catch(e){} refresh(); }
  function badges(){
    if(!on()) return; J = load(); var got = [];
    BADGES.forEach(function(b){ if(!J.badges[b[0]]){ var ok = false; try{ ok = b[3](J); }catch(e){} if(ok){ J.badges[b[0]] = Date.now(); got.push(b); } } });
    if(!got.length) return; save(J);
    var nb = Object.keys(J.badges).length, nu = ACCS.filter(function(a){ return a[3] && a[3] <= nb && a[3] > nb - got.length; })[0];
    setTimeout(function(){ confetti(["🏅", "✨", "⭐"], 14); bubble("🏅 새 배지! <b>" + got.map(function(b){ return b[1] + " " + b[2]; }).join(", ") + "</b>" + (nu ? "<small>" + nu[1] + " 쌤비 소품 '" + nu[2] + "'이(가) 열렸어요 · ⋯ → 도장판·배지에서 씌워 보세요</small>" : "<small>⋯ → 도장판·배지에서 모두 볼 수 있어요</small>"), 9000); }, 600);
  }
  function count(k){ J = load(); J.cnt[k] = (J.cnt[k] || 0) + 1; save(J); if(k === "keys" && J.cnt.keys === 30) badges(); }
  (function(){   // 하루에 쓴 도구 가짓수
    if(HOME) return; J = load(); var t = ymd(); if(J.cnt.toolDay !== t){ J.cnt.toolDay = t; J.cnt.tools = []; }
    if(J.cnt.tools.indexOf(APP) < 0) J.cnt.tools.push(APP); J.cnt.toolsMax = Math.max(J.cnt.toolsMax || 0, J.cnt.tools.length); save(J);
  })();

  /* ---------- 도장판·배지 창 ---------- */
  var dlg = null;
  function open(focus){
    J = load();
    if(!dlg){ dlg = document.createElement("dialog"); dlg.className = "joyDlg"; dlg.setAttribute("aria-label", "도장판·배지"); document.body.appendChild(dlg);
      dlg.addEventListener("click", function(e){ if(e.target === dlg || (e.target.closest && e.target.closest("[data-x]"))) dlg.close(); });
      dlg.addEventListener("change", function(e){ if(e.target.id === "joyOn"){ J = load(); J.off = !e.target.checked; save(J); refresh(); open(); } });
      dlg.addEventListener("click", function(e){ var s = e.target.closest && e.target.closest("[data-stamp]"); if(s){ e.preventDefault(); dlg.close(); stamp(); } });
      dlg.addEventListener("click", function(e){ var a = e.target.closest && e.target.closest("[data-acc]"); if(a && !a.disabled){ setAcc(a.dataset.acc); open(); } });
    }
    var d = new Date(), y = d.getFullYear(), m = d.getMonth(), first = new Date(y, m, 1), last = new Date(y, m + 1, 0).getDate(), cells = "", t = ymd();
    var lead = (first.getDay() + 6) % 7; if(lead > 4) lead = 0;
    for(var i = 0; i < lead; i++) cells += '<span class="no"></span>';
    for(var k = 1; k <= last; k++){ var dt = new Date(y, m, k), w = dt.getDay(); if(w === 0 || w === 6) continue; var key = ymd(dt); cells += '<span class="' + (J.stamps[key] ? "st" : "") + (key === t ? " td" : "") + '">' + k + "</span>"; }
    var n = growth(), T = tree(n), ws = weekSaved(), al = allSaved(), ms = monthStamps(), sk = streak(), nb = Object.keys(J.badges).length, ca = J.acc || "season";
    var canStamp = !J.stamps[t] && stampable();
    dlg.innerHTML = '<h2>🎈 도장판 · 배지<button type="button" class="x" data-x>닫기 Esc</button></h2>'
      + '<h3>✅ ' + (m + 1) + '월 퇴근 도장 <small>' + ms + "개" + (sk >= 2 ? " · 🔥 " + sk + "일 연속" : "") + (canStamp ? ' · <a href="#" data-stamp style="color:#c62828;font-weight:800">오늘 도장 찍기</a>' : "") + "</small></h3>"
      + '<div class="joyCal"><b>월</b><b>화</b><b>수</b><b>목</b><b>금</b>' + cells + "</div>"
      + '<div class="joyRow" style="margin-top:10px"><div>⏱️ 이번 주 아낀 시간<b>' + (ws ? hm(ws) : "0분") + "</b></div><div>🚀 지금까지<b>" + (al ? hm(al) : "0분") + "</b></div><div" + (focus === "tree" ? ' style="outline:2px solid #2f6b1f"' : "") + ">" + T.ic + " 우리 반 나무<b>" + T.nm + " · 칭찬·청소 " + n + "</b>" + (T.next ? T.nnm + "까지 " + T.next + "번" : "") + "</div></div>"
      + '<h3>🏅 배지 <small>' + Object.keys(J.badges).length + " / " + BADGES.length + " · 받기 전에는 숨겨져 있어요</small></h3>"
      + '<div class="joyBd">' + BADGES.map(function(b){ var g = J.badges[b[0]]; return '<div class="' + (g ? "got" : "") + '"' + (g ? ' title="' + new Date(g).toLocaleDateString("ko-KR") + '"' : "") + "><i>" + (g ? b[1] : "❔") + "</i>" + (g ? esc(b[2]) : "숨은 배지") + "</div>"; }).join("") + "</div>"
      + '<p style="font-size:12px;color:var(--t-sub,#5b6773);margin:8px 0 0;line-height:1.5">아낀 시간은 쌤 노트가 만든 파일 내려받기·인쇄 때마다 손으로 할 때 걸릴 시간을 대략 더한 값입니다. 모든 기록은 이 기기에만 있습니다.</p>'
      + '<h3>🦉 쌤비 소품 <small>배지를 받을수록 하나씩 열려요 · 눌러서 씌우기</small></h3><div class="joyAcc2">' + ACCS.map(function(a){ var op = a[3] <= nb;
          return '<button type="button" data-acc="' + a[0] + '"' + (op ? "" : " disabled") + ' class="' + (ca === a[0] ? "on" : "") + '" title="' + (op ? a[2] : "배지 " + a[3] + "개를 받으면 열려요") + '"><i>' + (op ? a[1] : "🔒") + "</i>" + (op ? esc(a[2]) : "배지 " + a[3] + "개") + "</button>"; }).join("") + "</div>"
      + '<label class="joyOff"><input type="checkbox" id="joyOn"' + (on() ? " checked" : "") + "> 재미 요소 켜기 (쌤비 소품·한마디·도장·배지·D-day 칩)</label>";
    if(!dlg.open){ if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); }
  }

  /* ---------- v2.8 학년 마무리 카드 (새 학년 시작 바로 전) ---------- */
  function yearCard(next){
    if(!on() || TT.classroom){ next(); return; }
    J = load(); var y = new Date(), from = (y.getMonth() + 1 >= 3 ? y.getFullYear() : y.getFullYear() - 1) + "-03-01";
    var st = Object.keys(J.stamps).filter(function(k){ return k >= from; }).length;
    var sv = J.saved.reduce(function(a, x){ return x.d >= from ? a + (+x.m || 0) : a; }, 0);
    var use = ((TT.store.get("tt_ui_v1", {}) || {}).tools || {}).use || {}, top = Object.keys(use).map(function(k){ return {id: k, n: +use[k].n || 0}; }).sort(function(a, b){ return b.n - a.n; }).slice(0, 3)
      .map(function(x){ var t = typeof TT_TOOLS !== "undefined" ? TT_TOOLS.filter(function(z){ return z.id === x.id; })[0] : null; return t ? t.icon + " " + (t.short || t.name) : ""; }).filter(Boolean);
    var T = tree(growth()), d = document.createElement("dialog"); d.className = "joyDlg"; d.setAttribute("aria-label", "한 해 돌아보기");
    d.innerHTML = '<h2>🦉 올해도 수고 많으셨어요</h2><p style="color:var(--t-sub,#5b6773);margin:0 0 10px;font-size:13px">새 학년을 시작하기 전에, 쌤 노트와 함께한 한 해를 돌아봐요.</p>'
      + '<div class="joyRow"><div>✅ 퇴근 도장<b>' + st + '개</b></div><div>⏱️ 아낀 시간<b>' + (sv ? hm(sv) : "0분") + '</b></div><div>' + T.ic + ' 우리 반 나무<b>' + T.nm + '</b></div></div>'
      + '<div class="joyRow" style="margin-top:8px"><div>🏅 배지<b>' + Object.keys(J.badges).length + " / " + BADGES.length + '</b></div><div style="flex:2 1 280px">🧰 많이 쓴 도구<b style="font-size:15px">' + (top.length ? esc(top.join(" · ")) : "—") + "</b></div></div>"
      + '<p style="font-size:12.5px;color:var(--t-sub,#5b6773);margin:12px 0 0">다음 단계에서 지금 자료를 백업 파일로 저장한 뒤 이 기기를 비웁니다. 도장·배지·아낀 시간도 백업 파일에 들어 있어요.</p>'
      + '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px"><button type="button" class="x" data-c style="position:static;float:none">취소</button><button type="button" class="x" data-n style="position:static;float:none;background:var(--t-accent,#2f6fb5);color:#fff;border-color:var(--t-accent,#2f6fb5)">다음: 새 학년 시작 →</button></div>';
    document.body.appendChild(d); confetti(["🌸", "🎓", "✨", "🌟"], 20);
    d.addEventListener("click", function(e){ if(e.target.closest && e.target.closest("[data-n]")){ d.close(); d.remove(); next(); } else if(e.target === d || (e.target.closest && e.target.closest("[data-c]"))){ d.close(); d.remove(); } });
    if(d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  (function(){ var B = TT.backup; if(B && B.save && !B.save.__joy){ var s0 = B.save; B.save = function(){ var r = s0.apply(this, arguments); try{ count("backup"); badges(); }catch(e){} return r; }; B.save.__joy = 1; } })();   // 백업 횟수(배지)

  /* ---------- 붙이기 · 다시 그리기 ---------- */
  function refresh(){ dress(); stampBtn(); treeChip(); if(HOME) leadChips(); }
  var rT = 0; function soon(){ clearTimeout(rT); rT = setTimeout(refresh, 250); }
  function start(){
    var n = 0, iv = setInterval(function(){ if(dress() || ++n > 40) clearInterval(iv); }, 250);
    refresh();
    try{ new MutationObserver(function(ms){ for(var i = 0; i < ms.length; i++){ var t = ms[i].target; if(t && t.closest && t.closest("#joyBub,#joyPill,#joyBig,.joyDlg,.joyAcc,#hClock,.hclock,.fclk")) continue; soon(); return; } }).observe(document.body, {childList: true, subtree: true}); }catch(e){}
    setInterval(refresh, 60 * 1000);
    setTimeout(greet, 1800);
    badges();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  TT.joy = {saved: saved, count: count, open: open, stamp: stamp, on: on, weekSaved: weekSaved, dday: dday, examNear: examNear, season: season,
            stamped: function(){ return !!load().stamps[ymd()]; }, stampable: stampable, monthStamps: monthStamps,
            streak: streak, acc: acc, setAcc: setAcc, yearCard: yearCard, treeNow: function(){ var n = growth(); var t = tree(n); t.n = n; return t; }, bubble: bubble, allSaved: allSaved};   // v2.8   // v2.0 쌤비 홈도 함께 씀
})();
