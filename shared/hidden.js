/* 쌤 노트 · 숨은 정보 (v2.9) — 화면에 표시는 없지만, 올려 보면(휴대폰·터치는 누르면/길게 누르면) 나오는 작은 말풍선
   ① 날짜 → 급식   ② 시각 → 지금 교시·오늘 교시 시간·하교   ③ 선생님 이름 → 내선·지금 수업 중인지·다음 빈 시간
   ④ 반 이름(3-2) → 담임·지금 그 반 수업 선생님 (+ 내 반이면 최근 수업 기록 한 줄)   ⑤ 쌤비 → 오늘 일정·이번 주 업무·남은 수업일
   ⑥ 학생 이름 → 번호·오늘 출결·최근 지도 한 줄   ⑦ 우리 반 나무 → 이번 달 칭찬 많이 받은 학생 3명
   (⑧ 업무판 날짜 칸 → 그날 출장 선생님은 학교 업무판 쪽 Index.html)
   · 무엇을 켤지는 학교 담당자가 학기초 세팅 파일로 정함(tt_school_v1.hid). 선생님은 설정 → 꾸미기 → 도장판·배지에서 끌 수 있음(tt_ui_v1.hidOff).
   · 학생 정보(⑥⑦, ④의 수업 기록)는 이 기기에 있는 자료로만, 교실 기기(전자칠판)에서는 보이지 않음. 아무것도 보내지 않음. */
(function(){
  "use strict";
  if(!window.TT || window.TT_HID) return;
  var R = document.documentElement, DOW = ["일", "월", "화", "수", "목", "금", "토"], LEN = 45;
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function classDev(){ try{ return !!TT.classroom || localStorage.getItem("ttv_device") === "classroom"; }catch(e){ return false; } }
  var KINDS = {meal: "날짜 → 급식", time: "시각 → 교시", wx: "날씨 → 자세히", staff: "선생님 이름", cls: "반 이름", owl: "쌤비", school: "학교 이름 → 연락처", stu: "학생 이름", tree: "우리 반 나무", trip: "업무판 날짜 → 출장"};
  function on(k){
    var u = TT.store.get("tt_ui_v1", {}) || {}; if(u.hidOff) return false;
    var h = (TT.school.load() || {}).hid; if(h && h[k] === false) return false;
    if((k === "stu" || k === "tree") && classDev()) return false;
    return true;
  }

  /* ── 말풍선 ── */
  var tip = document.createElement("div"); tip.id = "hidPeek"; tip.hidden = true; tip.setAttribute("role", "tooltip");
  var css = document.createElement("style");
  css.textContent = "#hidPeek{position:fixed;z-index:90;max-width:min(320px,90vw);background:var(--t-card,#fff);color:var(--t-ink,#1d2733);border:1px solid var(--t-line,#dde3ea);border-radius:14px;box-shadow:0 12px 32px rgba(20,40,70,.22);padding:10px 13px;font:13.5px/1.55 var(--t-font,'Malgun Gothic',sans-serif)}"
    + "#hidPeek[hidden]{display:none}#hidPeek h4{margin:0 0 4px;font-size:13px;color:var(--t-accent,#2f6fb5);display:flex;gap:6px;align-items:center}#hidPeek h4 small{margin-left:auto;color:var(--t-faint,#9aa5b1);font-weight:400;font-size:11px}"
    + "#hidPeek .r{display:flex;gap:8px;justify-content:space-between}#hidPeek .r b{font-weight:700}#hidPeek .m{color:var(--t-sub,#5b6773);font-size:12.5px}#hidPeek .on{color:var(--t-accent,#2f6fb5);font-weight:700}"
    + "#hidPeek ul{margin:2px 0 0;padding-left:16px}#hidPeek li{margin:1px 0}#hidPeek hr{border:0;border-top:1px solid var(--t-line,#dde3ea);margin:6px 0}"
    + "[data-hid]{cursor:default}"
    + "@media (hover:hover){#sbHero [data-hid=school],#sbHero [data-hid=meal],#sbHero [data-hid=time],#sbBar [data-hid=school],#sbBar [data-hid=meal],#sbBar [data-hid=time],#sbRail [data-hid=school],#sbRail [data-hid=meal],#sbRail [data-hid=time]{cursor:pointer;border-radius:6px}#sbHero [data-hid]:hover,#sbBar [data-hid]:hover,#sbRail [data-hid]:hover{color:var(--t-accent,#2f6fb5)}}";
  document.head.appendChild(css);
  function attach(){ if(!tip.parentNode && document.body) document.body.appendChild(tip); }
  var cur = null, T = 0;
  function place(el){
    var r = el.getBoundingClientRect(); tip.style.left = "0px"; tip.style.top = "0px"; tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight, x = Math.min(innerWidth - w - 8, Math.max(8, r.left)), y = r.bottom + 6;
    if(y + h > innerHeight - 8) y = Math.max(8, r.top - h - 6);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function show(el, kind, html){
    if(!html){ hide(); return; } attach(); cur = el; tip.innerHTML = html; place(el);
    try{ if(TT.joy && TT.joy.found) TT.joy.found(kind); }catch(e){}
  }
  function hide(){ clearTimeout(T); tip.hidden = true; cur = null; }

  /* ── 자료 ── */
  function allTT(){ var A = TT.store.get("tt_alltt_v1", null); return A && Array.isArray(A.teachers) && Array.isArray(A.periods) ? A : null; }
  function mins(t){ var m = /^(\d{1,2}):(\d{2})/.exec(t || ""); return m ? +m[1] * 60 + +m[2] : null; }
  function hm(m){ var h = Math.floor(m / 60), x = m % 60; return (h < 12 ? "오전 " : "오후 ") + ((h % 12) || 12) + ":" + pad(x); }
  function periods(){ var A = allTT(); return A ? A.periods.map(function(p){ return {n: +p.n, s: mins(p.t)}; }).filter(function(p){ return p.s != null; }) : []; }
  function nowPeriod(){                                               // {p, left} 지금 교시 · 아니면 {next}
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes(), P = periods(); if(!P.length || d.getDay() < 1 || d.getDay() > 5) return null;
    for(var i = 0; i < P.length; i++){ if(m >= P[i].s && m < P[i].s + LEN) return {p: P[i].n, left: P[i].s + LEN - m}; if(m < P[i].s) return {next: P[i].n, at: P[i].s, inMin: P[i].s - m}; }
    return {after: true};
  }
  function clsKey(v){ v = String(v || ""); var m = /(\d)\s*[-학년]\s*(\d{1,2})/.exec(v) || /^(\d)(\d{2})$/.exec(v.trim()); return m ? +m[1] + "-" + +m[2] : ""; }
  function slot(t, d, p){ var s = t.slots && t.slots[d + "-" + p]; return s || null; }
  function staffList(){ try{ return TT.staff.load() || []; }catch(e){ return []; } }
  function students(){ var out = []; try{ TT.roster.classes().forEach(function(c){ (c.students || []).forEach(function(s){ if(s.name) out.push({c: c, s: s}); }); }); }catch(e){} return out; }

  /* ── ① 급식 ── */
  function mealHTML(el){
    if(!window.TTMeal || !TTMeal.day) return "";
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes(), w = d.getDay(), days = [];
    function nextWk(x){ x = new Date(x); do{ x.setDate(x.getDate() + 1); }while(x.getDay() === 0 || x.getDay() === 6); return x; }
    if(w >= 1 && w <= 5 && m < 810) days.push([d, "오늘"]); days.push([w >= 1 && w <= 5 && m < 810 ? nextWk(d) : nextWk(d), "다음"]);
    /* v2.12.3 고침: 저장해 둔 급식은 답이 바로(같은 순간에) 와서 '불러오는 중…'이 덮어써 멈춰 있던 문제
       → 바로 온 답은 바로 보여 주고, 인터넷이 늦으면 8초 뒤 '불러오지 못했어요' */
    var out = [], left = days.length, sync = true, done = false;
    function fin(){ return "<h4>🍚 급식<small>학교 급식 · 나이스</small></h4>" + out.join("<hr>"); }
    days.forEach(function(x, i){
      TTMeal.day(x[0], function(v){
        if(done || out[i]) return;
        out[i] = '<div class="m">' + (x[1] === "오늘" ? "오늘" : (x[0].getMonth() + 1) + "/" + x[0].getDate() + "(" + DOW[x[0].getDay()] + ")") + "</div>" + (v && v.raw ? "<div>" + esc(TTMeal.dishes(v.raw, false).join(", ")) + "</div>" + (v.cal ? '<div class="m">' + esc(v.cal) + "</div>" : "") : '<div class="m">급식 정보 없음</div>');
        if(--left === 0){ done = true; if(!sync && cur === el) show(el, "meal", fin()); }
      });
    });
    sync = false;
    if(done) return fin();
    setTimeout(function(){ if(done) return; done = true; if(cur === el) show(el, "meal", '<h4>🍚 급식</h4><div class="m">급식을 불러오지 못했어요. 인터넷 연결을 확인하거나, 날짜를 눌러 급식 창에서 다시 보세요.</div>'); }, 8000);
    return '<h4>🍚 급식</h4><div class="m">불러오는 중…</div>';
  }
  /* ── ①-2 학교 연락처 (v2.12.4 맨 위 학교 이름에 올리면) — 대표전화 · 행정실 · 교무실 · 팩스 + 주소
     v2.12.5 보건실·교장실·사람 이름은 빼고, 주소가 설정에 없으면 나이스 학교 정보에서 한 번 받아 둠 */
  var ADK = "sn_school_addr_v1";
  function neisAddr(s, el){
    if(!s.neisA || !s.neisS) return "";
    var c = null; try{ c = JSON.parse(localStorage.getItem(ADK) || "null"); }catch(e){}
    if(c && c.k === s.neisA + s.neisS && c.a) return c.a;
    if(neisAddr.busy || (c && c.k === s.neisA + s.neisS && Date.now() - (c.at || 0) < 86400000)) return "";
    neisAddr.busy = true;
    var u = "https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=1&ATPT_OFCDC_SC_CODE=" + encodeURIComponent(s.neisA) + "&SD_SCHUL_CODE=" + encodeURIComponent(s.neisS) + (s.neisKey ? "&KEY=" + encodeURIComponent(s.neisKey) : "");
    fetch(u).then(function(r){ return r.json(); }).then(function(j){
      var row = j && j.schoolInfo && j.schoolInfo.filter(function(x){ return x.row; })[0], x = row && row.row[0];
      var ad = x ? [x.ORG_RDNMA, x.ORG_RDNDA].filter(Boolean).join(" ").trim() : "";
      try{ localStorage.setItem(ADK, JSON.stringify({k: s.neisA + s.neisS, a: ad, at: Date.now()})); }catch(e){}
      neisAddr.busy = false; if(ad && cur === el) show(el, "school", schoolHTML(el));
    }).catch(function(){ neisAddr.busy = false; try{ localStorage.setItem(ADK, JSON.stringify({k: s.neisA + s.neisS, a: "", at: Date.now()})); }catch(e){} });
    return "";
  }
  function schoolHTML(el){
    var s = {}; try{ s = TT.school.load() || {}; }catch(e){}
    var h = "<h4>🏫 " + esc(s.name || "우리 학교") + "<small>학교 연락처</small></h4>", rows = [], seen = {};
    function r(k, v){ if(!v || seen[v]) return; seen[v] = 1; rows.push('<div class="r"><span>' + esc(k) + "</span><b>" + esc(v) + "</b></div>"); }
    var OFF = /대표|행정실|교무실|팩스|FAX|fax/;
    r("📞 대표전화", s.tel);
    var o = {}; try{ o = TT.store.get("tt_staff_v1", null) || {}; }catch(e){}
    (Array.isArray(o.main) ? o.main : []).forEach(function(x){ if(x && x.number && OFF.test(String(x.label || "대표"))) r(String(x.label || "대표번호"), String(x.number)); });
    var EX = []; try{ EX = window.TT_LIBD ? TT_LIBD.extCached() : []; }catch(e){}
    EX.filter(function(x){ return OFF.test(x.n || "") || (!x.n && OFF.test(x.d || "")); }).slice(0, 6).forEach(function(x){ r(x.n || x.d, x.t); });
    var ad = s.addr || neisAddr(s, el);
    if(rows.length) h += rows.join("");
    if(ad) h += (rows.length ? "<hr>" : "") + '<div class="m">📍 ' + esc(ad) + "</div>";
    if(!rows.length && !ad) h += '<div class="m">설정 → 학교·선생님 설정에서 대표전화·주소를 넣으면 여기에 보여요.</div>';
    return h;
  }
  /* ── ② 교시 ── */
  function timeHTML(){
    var P = periods(); if(!P.length) return '<h4>🕘 오늘 교시</h4><div class="m">학기초 세팅에 전체 교사 시간표(교시 시각)가 들어오면 보여요.</div>';
    var N = nowPeriod(), h = "<h4>🕘 " + (N && N.p ? N.p + "교시 · 끝까지 " + N.left + "분" : N && N.next ? N.next + "교시까지 " + N.inMin + "분" : N && N.after ? "오늘 수업 끝" : "오늘 교시") + "</h4><ul>";
    P.forEach(function(p){ h += "<li" + (N && N.p === p.n ? ' class="on"' : "") + ">" + p.n + "교시 " + hm(p.s).replace(/^오[전후] /, "") + "~" + hm(p.s + LEN).replace(/^오[전후] /, "") + "</li>"; });
    return h + '</ul><div class="m">하교(마지막 교시 끝) ' + hm(P[P.length - 1].s + LEN) + "</div>";
  }
  /* ── ③ 선생님 ── */
  function staffHTML(st){
    var A = allTT(), t = A ? A.teachers.filter(function(x){ return x.name === st.name; })[0] : null, d = new Date().getDay(), N = nowPeriod(), h = "<h4>👩‍🏫 " + esc(st.name) + " 선생님<small>" + esc([st.dept, st.subj].filter(Boolean).join(" · ")) + "</small></h4>";
    if(st.tel) h += '<div class="r"><span>📞 내선</span><b>' + esc(st.tel) + "</b></div>";
    if(st.pos) h += '<div class="m">' + esc(st.pos) + "</div>";
    if(t && d >= 1 && d <= 5){
      var P = periods(), now = N && N.p ? slot(t, d, N.p) : null;
      h += "<hr>" + (N && N.p ? (now ? '<div class="on">지금 ' + N.p + "교시 " + esc(clsKey(now.cls || now.code) || now.cls || "") + " " + esc(now.subj || "") + " 수업 중</div>" : '<div class="on">지금 ' + N.p + "교시는 빈 시간</div>") : "");
      var from = N && N.p ? N.p + 1 : N && N.next ? N.next : 99, free = P.filter(function(p){ return p.n >= from && !slot(t, d, p.n); }).map(function(p){ return p.n; });
      var busy = P.filter(function(p){ return slot(t, d, p.n); }).length;
      h += '<div class="m">오늘 수업 ' + busy + "시간" + (free.length ? " · 다음 빈 시간 " + free.slice(0, 3).join(", ") + "교시" : from < 99 ? " · 남은 빈 시간 없음" : "") + "</div>";
    }
    return h;
  }
  /* ── ④ 반 ── */
  function clsHTML(k){
    var g = k.split("-"), home = staffList().filter(function(s){ return new RegExp("^\\s*" + g[0] + "\\s*-\\s*" + g[1] + "\\s*담임").test(s.pos || "") || new RegExp(g[0] + "\\s*-\\s*" + g[1] + "\\s*담임").test(s.pos || ""); })[0];
    var h = "<h4>🏫 " + g[0] + "학년 " + g[1] + "반</h4>";
    if(home) h += '<div class="r"><span>담임</span><b>' + esc(home.name) + (home.tel ? " · 📞 " + esc(home.tel) : "") + "</b></div>";
    var A = allTT(), d = new Date().getDay(), N = nowPeriod();
    if(A && N && N.p && d >= 1 && d <= 5){
      var who = A.teachers.filter(function(t){ var s = slot(t, d, N.p); return s && clsKey(s.cls || s.code) === k; })[0];
      h += '<div class="on">지금 ' + N.p + "교시: " + (who ? esc(who.name) + " 선생님" + (slot(who, d, N.p).subj ? " (" + esc(slot(who, d, N.p).subj) + ")" : "") : "수업 정보 없음") + "</div>";
    }
    if(!classDev()){                                                   // ⑦ 내 수업 기록 한 줄 (이 기기 자료)
      var J = TT.store.get("tt_journal_v1", null), recs = J && Array.isArray(J.records) ? J.records.filter(function(r){ return clsKey(r.cls) === k && (r.text || (r.tags || []).length); }) : [];
      if(recs.length){ recs.sort(function(a, b){ return (b.ts || 0) - (a.ts || 0); }); var r = recs[0];
        h += '<hr><div class="m">📖 최근 수업 기록' + (r.ts ? " · " + (new Date(r.ts).getMonth() + 1) + "/" + new Date(r.ts).getDate() : "") + "</div><div>" + esc(((r.tags || []).join(" ") + " " + (r.text || "")).trim().slice(0, 60)) + "</div>"; }
    }
    return h;
  }
  /* ── ⑤ 쌤비 ── */
  function owlHTML(){
    var t = ymd(new Date()), C = TT.store.get("tt_calendar_v1", null), ev = C && Array.isArray(C.events) ? C.events : [], h = "<h4>🦉 오늘 · 이번 주</h4>";
    var today = TT.cal.days(t, t).map(function(e){ return e.t; });   // v2.61 같은 날 중복 없이
    h += '<div class="r"><span>오늘 학사일정</span><b>' + (today.length ? esc(today.join(", ")) : "없음") + "</b></div>";
    var B = TT.store.get("tt_board_cache_v1", null), its = [];
    try{ its = ((B && B.data && B.data.items) || []).filter(function(x){ return x.type === "item" && (x.important === "1" || x.time) && x.date >= t; }).sort(function(a, b){ return (a.date + a.time).localeCompare(b.date + b.time); }).slice(0, 3); }catch(e){}
    if(its.length) h += '<hr><div class="m">📅 이번 주 업무판 주요 일</div><ul>' + its.map(function(x){ return "<li>" + esc(x.date.slice(5).replace("-", "/")) + " " + esc(x.text).slice(0, 40) + "</li>"; }).join("") + "</ul>";
    var dd = TT.joy && TT.joy.dday ? TT.joy.dday() : null;
    if(dd && dd.d){
      var off = {}; ev.forEach(function(e){ if(/휴업|방학|공휴|휴일|대체/.test(e.t || "") || e.k === "holiday") off[e.d] = 1; });
      var n = 0, x = new Date(); x.setHours(12, 0, 0, 0); var end = new Date(dd.d + "T12:00:00");
      while(x < end){ x.setDate(x.getDate() + 1); if(x >= end) break; if(x.getDay() > 0 && x.getDay() < 6 && !off[ymd(x)]) n++; }
      h += '<hr><div class="r"><span>' + esc(dd.t) + "까지</span><b>D-" + dd.n + " · 수업일 " + n + "일</b></div>";
    }
    return h;
  }
  /* ── ⑥ 학생 ── */
  function guide(){ var G = TT.store.get("tt_guide_v1", null); return G && typeof G === "object" ? G : {}; }
  var ATT = {L: "지각", A: "결석", E: "조퇴", O: "결과", l: "지각", a: "결석"};
  function stuHTML(list){
    var home = null; try{ home = TT.roster.home(); }catch(e){}
    var G = guide(), t = ymd(new Date()), h = "";
    list.slice(0, 3).forEach(function(x, i){
      h += (i ? "<hr>" : "") + "<h4>🧑‍🎓 " + esc(x.s.name) + "<small>" + esc(x.c.name) + " " + esc(x.s.no) + "번</small></h4>";
      if(home && home.id === x.c.id){
        var a = (G.att && G.att[t] || {})[String(x.s.no)], at = a == null ? "" : typeof a === "object" ? (ATT[a.t] || a.t || "기록") + (a.why ? " · " + a.why : "") : (ATT[a] || String(a));
        h += '<div class="r"><span>오늘 출결</span><b>' + (at ? esc(at) : "출석") + "</b></div>";
        var gd = (G.gd || []).filter(function(g){ return String(g.sid) === String(x.s.no); }).sort(function(p, q){ return (q.date + (q.time || "")).localeCompare(p.date + (p.time || "")); });
        var mo = t.slice(0, 7), pr = gd.filter(function(g){ return String(g.kind || "").indexOf("칭찬") >= 0 && (g.date || "").slice(0, 7) === mo; }).length;
        if(gd[0]) h += '<div class="m">최근 ' + esc((gd[0].date || "").slice(5).replace("-", "/")) + " " + esc(gd[0].kind || "") + (gd[0].how ? " · " + esc(String(gd[0].how).slice(0, 30)) : "") + "</div>";
        if(pr) h += '<div class="m">이번 달 칭찬 ' + pr + "번 👍</div>";
      }
    });
    return h;
  }
  /* ── ⑦ 우리 반 나무 ── */
  function treeHTML(){
    var home = null; try{ home = TT.roster.home(); }catch(e){} var G = guide(), mo = ymd(new Date()).slice(0, 7), cnt = {};
    (G.gd || []).forEach(function(g){ if(String(g.kind || "").indexOf("칭찬") >= 0 && (g.date || "").slice(0, 7) === mo) cnt[g.sid] = (cnt[g.sid] || 0) + 1; });
    var top = Object.keys(cnt).sort(function(a, b){ return cnt[b] - cnt[a]; }).slice(0, 3), nm = {};
    if(home) (home.students || []).forEach(function(s){ nm[String(s.no)] = s.name; });
    return "<h4>🌳 이번 달 칭찬왕</h4>" + (top.length ? "<ul>" + top.map(function(k, i){ return "<li>" + ["🥇", "🥈", "🥉"][i] + " " + esc(k) + "번 " + esc(nm[k] || "") + " · " + cnt[k] + "번</li>"; }).join("") + "</ul>" : '<div class="m">이번 달 칭찬 기록이 아직 없어요</div>');
  }

  /* ── 어디에 올렸나 ── */
  var SKIP = "#hidPeek,input,textarea,select,[contenteditable=true],#sbRail .mi,#sbRail .ti,#sbBar .sbTabs,.circ,nav,.fr,dialog,button.q";
  var NAME_RE = /^[가-힣]{2,4}$/;
  function detect(el){
    if(!el || el.nodeType !== 1) return null;
    var hk = el.closest("[data-hid]"); if(hk) return {kind: hk.getAttribute("data-hid"), el: hk};
    if(el.closest("[data-tree]")) return on("tree") ? {kind: "tree", el: el.closest("[data-tree]")} : null;
    if(el.closest("#sbBarOwl")) return on("owl") ? {kind: "owl", el: el.closest("#sbBarOwl")} : null;
    if(el.closest(SKIP) || el.children.length > 2) return null;
    var tx = (el.textContent || "").replace(/\s+/g, " ").trim(); if(!tx || tx.length > 24) return null;
    var core = tx.replace(/\s*(선생님|쌤|부장|교감|교장)$/, "").replace(/^\d{1,2}\s*번?\s*/, "");
    if(NAME_RE.test(core)){
      if(on("stu")){ var S = students().filter(function(x){ return x.s.name === core; }); if(S.length) return {kind: "stu", el: el, data: S}; }
      if(on("staff")){ var st = staffList().filter(function(x){ return x.name === core; })[0]; if(st) return {kind: "staff", el: el, data: st}; }
      return null;
    }
    if(on("cls")){ var m = /^(\d)\s*-\s*(\d{1,2})(?:\s*반)?$|^(\d)학년\s*(\d{1,2})반$/.exec(tx); if(m) return {kind: "cls", el: el, data: (m[1] || m[3]) + "-" + +(m[2] || m[4])}; }
    return null;
  }
  function html(h){
    switch(h.kind){
      case "meal": return on("meal") ? mealHTML(h.el) : "";
      case "time": return on("time") ? timeHTML() : "";
      case "school": return on("school") ? schoolHTML(h.el) : "";
      case "wx": return window.TT_WX ? TT_WX.html() : "";
      case "owl": return owlHTML();
      case "tree": return treeHTML();
      case "staff": return staffHTML(h.data);
      case "cls": return clsHTML(h.data);
      case "stu": return stuHTML(h.data);
    }
    return "";
  }
  function open(h){ show(h.el, h.kind, html(h)); }
  var touch = matchMedia("(hover: none)").matches;
  document.addEventListener("mouseover", function(e){
    if(touch) return;
    var h = detect(e.target);
    if(!h){ if(cur && !(cur.contains(e.target) || tip.contains(e.target))){ clearTimeout(T); T = setTimeout(hide, 150); } return; }
    if(h.el === cur) { clearTimeout(T); return; }
    clearTimeout(T); T = setTimeout(function(){ open(h); }, h.kind === "meal" || h.kind === "time" || h.kind === "wx" || h.kind === "school" || h.kind === "owl" || h.kind === "tree" ? 350 : 650);
  }, true);
  /* 터치: 날짜·시각은 누르면, 이름·반·쌤비·나무는 길게 누르면 */
  var lp = 0, lpEl = null;
  document.addEventListener("touchstart", function(e){
    var h = detect(e.target); if(!h) return; lpEl = h;
    if(h.kind === "meal" || h.kind === "time" || h.kind === "wx" || h.kind === "school") return;
    clearTimeout(lp); lp = setTimeout(function(){ open(h); lpEl = null; }, 500);
  }, {passive: true, capture: true});
  document.addEventListener("touchend", function(){ clearTimeout(lp); }, true);
  document.addEventListener("touchmove", function(){ clearTimeout(lp); }, {passive: true, capture: true});
  document.addEventListener("click", function(e){
    var hk = e.target.closest && e.target.closest('[data-hid="meal"],[data-hid="time"],[data-hid="wx"],[data-hid="school"]');
    /* v2.12.6 데스크톱: 맨 위 줄의 학교 이름 → 내선번호, 날짜 → 학교 업무판, 시각 → 시간표 (휴대폰은 누르면 미리보기 그대로) */
    if(hk && !touch && hk.closest("#sbHero,#sbBar,#sbRail")){
      var to = {school: "apps/school/?tab=ext", meal: "apps/school/?tab=board", time: "apps/timetable/"}[hk.getAttribute("data-hid")];
      if(to){ e.preventDefault(); hide(); document.documentElement.classList.add("tt-going"); location.href = (TT.BASE || "") + to; return; }
    }
    if(hk){ if(cur === hk){ hide(); return; } var h = detect(hk); if(h) open(h); return; }
    if(!tip.contains(e.target)) hide();
  }, true);
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") hide(); });
  addEventListener("scroll", function(){ if(cur) hide(); }, true);
  window.TT_HID = {kinds: KINDS, on: on, hide: hide};
})();
