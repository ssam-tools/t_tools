/* 쌤 노트 · 첫 화면 "오늘" 업무판 (PLAN.md)
   - 5단계: 찾기·빠른 입력(Ctrl+K) — 학생 이름·도구 찾기, 한 줄 입력을 할 일 / 종례 바구니(tt_close_v1) / 학생 기록으로 나눔.
     종례 시간: 월·수·금 15:10, 화·목 16:05 (CLOSE_T, tt_ui_v1.home.close 로 바꿀 수 있음).
   - 4단계: 상황에 따라 바뀌기 — 시간대(조회 전 / 수업 / 수업 끝 / 빈 시간 / 종례 전 / 금요일 오후 주간 정리)에 맞는 칸을
     넓히고 내용을 바꿈 + 이달 추천 도구(tools.js 의 months, 시험 전 exam)를 아래 도구 단추에 표시.
   - 3단계: "다음 수업" — 지금/다음 교시 반의 지난 진도·이번 차시·메모, 수업 끝났는데 기록 없으면 "기록 안 함 → 진도 +1".
   - 2단계: "오늘 챙길 것" — 알림 칩을 목록+숫자 배지로, 학사일정 D-day, 이번 주 신경 쓸 학생 수(눌러야 이름).
   - 1단계: 화면 재배치. 위쪽에 오늘 칸 3개(다음 수업 / 오늘 챙길 것 / 종례·할 일) 자리를 만들고,
     주간 달력은 한 줄(이번 주)로 접어 두었다가 눌러서 2주로 펼칩니다.
   - 자료는 TT.store 로 읽기만 합니다. 어디로도 보내지 않습니다.
   - 첫 화면에는 학생 이름을 쓰지 않습니다(숫자만, 눌러야 이름).
   - 교실(화면 공유) 모드에서는 오늘 칸을 숨깁니다. */
(function(){
  "use strict";
  var box = document.getElementById("today");
  var row = document.querySelector(".toprow");
  var UIKEY = "tt_ui_v1";

  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function ui(){ return TT.store.get(UIKEY, {}) || {}; }
  function setUi(k, v){ var u = ui(); u.home = u.home || {}; u.home[k] = v; TT.store.set(UIKEY, u); }

  /* 종례 시간 (요일 1=월 … 5=금): 월·수·금 6교시 끝, 화·목 7교시 끝 */
  var CLOSE_T = {1: "15:10", 2: "16:05", 3: "15:10", 4: "16:05", 5: "15:10"};
  function toMin(t){ var a = String(t).split(":"); return (+a[0]) * 60 + (+a[1]); }
  function closeMin(w){ var o = (ui().home || {}).close || {}; return toMin(o[w] || CLOSE_T[w] || "15:10"); }
  /* 종례 바구니 (tt_close_v1): 종례 때 전할 말. {items:[{id, text, date, done}]} — 이 기기에만 저장 */
  var BAG = "tt_close_v1";
  function bagLoad(){ var d = TT.store.get(BAG, null); d = d && Array.isArray(d.items) ? d : {items: []};
    var cut = ymd(new Date(Date.now() - 14 * 864e5)); d.items = d.items.filter(function(x){ return !x.done || x.date >= cut; }); return d; }
  function bagSave(d){ TT.store.set(BAG, d); }
  function nextSchool(d){ d = new Date(d); do{ d.setDate(d.getDate() + 1); }while(d.getDay() === 0 || d.getDay() === 6); return d; }
  function closeDay(){                                                // 지금 넣으면 전할 종례 날: 오늘 종례가 아직이면 오늘, 아니면 다음 수업일
    var d = new Date(), w = d.getDay(), m = d.getHours() * 60 + d.getMinutes();
    return ymd(w >= 1 && w <= 5 && m <= closeMin(w) + 20 ? d : nextSchool(d));
  }

  /* ── 주간 달력 접기/펼치기 (shared/board.js 가 그린 뒤 단추만 끼워 넣음) ── */
  var board = document.getElementById("board");
  function wk2(){ return !!(ui().home || {}).wk2; }
  function applyWk(){ if(row) row.classList.toggle("wk2", wk2()); }
  function addToggle(){
    if(!board || board.hidden) return;
    var bh = board.querySelector(".bh"); if(!bh || bh.querySelector(".wkTog")) return;
    var open = wk2(), lb = bh.querySelector("b");
    if(lb && !open && window.innerWidth > 760) lb.textContent = lb.textContent.replace(/ · (다음 주|그다음 주)$/, "");
    var b = document.createElement("button"); b.type = "button"; b.className = "bk wkTog";
    b.textContent = open ? "1주만 ▴" : "2주 보기 ▾"; b.title = open ? "이번 주만 한 줄로 접기" : "다음 주까지 펼쳐 보기";
    b.onclick = function(){
      setUi("wk2", !wk2()); applyWk();
      window.dispatchEvent(new Event("resize"));                     // board.js 가 다시 그리며 "+N건 더"를 맞춤
    };
    var sp = bh.querySelector(".sp"); bh.insertBefore(b, sp ? sp.nextSibling : null);
  }
  applyWk();
  if(board && window.MutationObserver) new MutationObserver(addToggle).observe(board, {childList: true});
  addToggle();

  if(!box) return;
  if(TT.classroom){ box.hidden = true; return; }

  /* ── 오늘 칸 3개 ── */
  function card(id, icon, title, href, body, badge){
    return '<section class="tdy" id="' + id + '"><div class="tdh">'
      + (href ? '<a href="' + href + '">' + icon + " " + title + "</a>" : "<b>" + icon + " " + title + "</b>")
      + (badge ? '<span class="tdn">' + badge + "</span>" : "") + "</div>"
      + '<div class="tdb">' + body + "</div></section>";
  }
  function hint(s){ return '<p class="tdx">' + s + "</p>"; }

  /* ① 다음 수업 (3단계) — 지금/다음 교시 반의 지난 진도·이번 차시·메모(수업 기록장 tt_journal_v1, 읽기만)
       + 수업이 끝났는데 기록이 없으면 "기록 안 함 → 진도 +1"(누르면 수업 기록장으로 이동해 '진행 완료'를 누름). */
  (function(){
    var st = document.createElement("style");
    st.textContent = ".tdl .ls{color:var(--sub,#5b6775)}.tdl .ls b{color:var(--ink,#1f2a37);font-weight:700}"
      + "a.tdl{display:block;color:inherit;text-decoration:none}a.tdl:hover{text-decoration:underline}"
      + "a.tdl.miss{color:var(--danger,#c62828);font-weight:700}a.tdl.miss small{color:var(--danger,#c62828);font-weight:400;opacity:.8}";
    document.head.appendChild(st);
  })();
  function journal(){ var J = TT.store.get("tt_journal_v1", null); return J && typeof J === "object" ? J : null; }
  function lessonList(J, g){                                          // 차시 목록 (# 줄은 단원 이름)
    var raw = (J.cur || {})[g]; raw = Array.isArray(raw) ? raw.join("\n") : String(raw || "");
    var L = []; raw.split("\n").forEach(function(l){ l = l.trim(); if(l && l[0] !== "#") L.push(l); });
    return L;
  }
  /* 한 반의 진도: {last: 지난 차시, now: 이번(할) 차시, memo, done: 이 교시에 이미 진행 완료한 차시} */
  function progOf(J, s, td){
    if(!J || !s || !s.cls) return null;
    var c = +s.cls, L = lessonList(J, Math.floor(c / 100)), p = (J.prog || {})[c] || {}, n = Math.min(+p.n || 0, L.length);
    var tg = (J.taught || {})[td + "|" + s.n];
    if(tg && tg.kind === "done") return {done: L[tg.lesson] || "진행 완료", memo: p.memo || ""};
    if(tg && tg.kind === "skip") return {skip: tg.reason || "수업 없음", memo: p.memo || ""};
    return {last: n > 0 ? L[n - 1] : "", now: L[n] || (L.length ? "모든 차시 완료" : ""), memo: p.memo || "", nL: L.length};
  }
  function progLine(P){
    if(!P) return "";
    if(P.done) return '<div class="tdl ok">✔ 진행 완료 · ' + esc(P.done) + "</div>";
    if(P.skip) return '<div class="tdl"><span class="ls">수업 없음 · ' + esc(P.skip) + "</span></div>";
    if(!P.nL) return hint('<a href="apps/journal/">수업 기록장</a>에 차시 목록을 넣으면 지난 진도가 나옵니다.');
    return '<div class="tdl"><span class="ls">' + (P.last ? "지난 " + esc(P.last) + " → " : "") + "이번 <b>" + esc(P.now) + "</b></span></div>";
  }
  function memoLine(P){ return P && P.memo ? '<div class="tdl"><span class="ls">📝 ' + esc(P.memo.replace(/\s+/g, " ")) + "</span></div>" : ""; }
  function lesson(){
    var TTT = TT.timetable;
    if(!TTT.has()) return card("tdLesson", "🕘", "다음 수업", "", hint('<a href="apps/timetable/">내 시간표</a>를 넣으면 지금·다음 수업이 여기에 나옵니다.'));
    var d = new Date(), w = d.getDay(), weekday = w >= 1 && w <= 5, h = "", td = ymd(d), m = d.getHours() * 60 + d.getMinutes();
    var cur = weekday ? TTT.now() : null, nx = weekday ? TTT.next() : null, J = journal();
    /* 수업 끝 기록 알림: 오늘 끝난 수업 중 수업 기록장에 '진행 완료'도 '수업 없음'도 없는 교시 */
    var miss = weekday && J ? TTT.day(d).filter(function(s){ return s.end <= m && !(J.taught || {})[td + "|" + s.n]; }) : [];
    if(miss.length){
      var f = miss[miss.length - 1];
      h += '<a class="tdl miss" href="apps/journal/" title="수업 기록장 오늘 화면에서 \'진행 완료\'를 누르면 진도가 +1 됩니다">✏️ '
        + f.n + "교시 " + esc(f.code) + " 기록 안 함 → 진도 +1" + (miss.length > 1 ? " <small>외 " + (miss.length - 1) + "개</small>" : "") + "</a>";
    }
    var focus = cur || nx;                                            // 지금 수업이 있으면 그 반, 없으면 다음 반의 진도를 보여 줌
    if(cur) h += '<div class="tdl"><span class="now">● 지금</span> <b>' + cur.n + "교시 " + esc(cur.code) + "</b> <small>~" + cur.e + "</small></div>";
    if(cur && J){ var Pc = progOf(J, cur, td); h += progLine(Pc) + (nx ? "" : memoLine(Pc)); }
    if(nx) h += '<div class="tdl"><span class="nx">▶ 다음</span> <b>' + nx.n + "교시 " + esc(nx.code) + "</b> <small>" + nx.t + "</small></div>";
    if(nx && J && (!cur || !miss.length)){ var Pn = progOf(J, nx, td); h += progLine(Pn) + (cur ? "" : memoLine(Pn)); }
    if(focus && !J) h += hint('<a href="apps/journal/">수업 기록장</a>을 쓰면 지난 진도와 메모가 여기에 나옵니다.');
    if(!cur && !nx) h += weekday && TTT.day(d).length ? (miss.length ? "" : '<div class="tdl ok">✔ 오늘 수업 끝' + (J ? " · 기록 완료" : "") + "</div>")
                         + (J ? "" : hint("수업 기록을 남겼는지 확인해 보세요."))
                       : hint(weekday ? "오늘은 수업이 없습니다." : "주말입니다. 월요일 수업은 위쪽 시간표 줄에서 볼 수 있어요.");
    return card("tdLesson", "🕘", "다음 수업", "apps/journal/", h, miss.length ? "기록 " + miss.length : "");
  }

  /* ② 오늘 챙길 것 (2단계) — 예전 위쪽 알림 칩을 목록+숫자 배지로 옮기고,
       학사일정 D-day(시험·방학, 진도 부족 함께)와 "이번 주 신경 쓸 학생 N명"(눌러야 이름)을 더함. */
  (function(){                                                       // 이 칸에만 쓰는 모양
    var st = document.createElement("style");
    st.textContent = ".tdg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px 10px}"
      + ".tdk{display:flex;align-items:center;gap:4px;min-width:0;font:inherit;font-size:clamp(12.5px,1.65vh,14.5px);line-height:1.6;color:var(--ink,#1f2a37);text-decoration:none;background:none;border:0;padding:0;cursor:pointer;text-align:left}"
      + ".tdk .tt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tdk:hover .tt{text-decoration:underline}"
      + ".tdk .n{flex:none;font-size:11.5px;font-weight:800;border-radius:999px;padding:0 7px;background:var(--star-soft,#fff3cc);color:#7a5a00}"
      + ".tdk.hi .n{background:var(--danger-soft,#fde8e8);color:var(--danger,#c62828)}.tdk.dd .n{background:var(--accent-soft,#e6f0fb);color:var(--accent,#2f6fb3)}"
      + "button.tdn{border:0;font-family:inherit;cursor:pointer}"
      + ".tdpop{position:fixed;z-index:60;width:min(340px,92vw);max-height:60vh;overflow:auto;background:var(--card,#fff);border:1px solid var(--line,#dde3ea);border-radius:12px;box-shadow:0 10px 28px rgba(30,60,100,.18);padding:10px 12px;font-size:13.5px;line-height:1.6}"
      + ".tdpop h4{font-size:14px;margin:0 0 4px}.tdpop .r{display:flex;gap:6px;padding:3px 0;border-top:1px solid var(--line,#eef1f4)}.tdpop .r:first-of-type{border-top:0}"
      + ".tdpop .r b{flex:none}.tdpop .r span{color:var(--sub,#5b6775)}.tdpop .r a{color:inherit;text-decoration:none;display:flex;gap:6px;flex:1}.tdpop .r a:hover{text-decoration:underline}"
      + ".tdpop .ft{margin-top:6px;font-size:12px;color:#8a95a1}.tdpop .ft a{color:var(--accent,#2f6fb3);font-weight:700}";
    document.head.appendChild(st);
  })();

  /* 작은 창: 눌렀을 때만 내용(학생 이름 등)을 보여 줌 */
  var popEl = null;
  function closePop(){ if(popEl){ popEl.remove(); popEl = null; } }
  function openPop(anchor, html){
    closePop();
    popEl = document.createElement("div"); popEl.className = "tdpop"; popEl.setAttribute("role", "dialog"); popEl.innerHTML = html;
    document.body.appendChild(popEl);
    var r = anchor.getBoundingClientRect(), w = popEl.offsetWidth, hgt = popEl.offsetHeight;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)), top = r.bottom + 4;
    if(top + hgt > window.innerHeight - 8) top = Math.max(8, r.top - hgt - 4);
    popEl.style.left = left + "px"; popEl.style.top = top + "px";
  }
  document.addEventListener("click", function(e){ if(popEl && !popEl.contains(e.target) && !e.target.closest("[data-pop]")) closePop(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") closePop(); });

  function dayDiff(a, b){ var p = a.split("-"), q = b.split("-"); return Math.round((new Date(+p[0], p[1]-1, +p[2]) - new Date(+q[0], q[1]-1, +q[2])) / 86400000); }
  function md(s){ return (+s.slice(5, 7)) + "/" + (+s.slice(8)); }

  var lastItems = [], lastStu = [];
  /* 챙길 일 모으기 → [{ic, t, n, href|pop, lv:"hi"|"mid"|"dd", tip}] (위쪽일수록 급함) */
  function collect(){
    var out = [], td = ymd(new Date()), stu = {};
    var home = TT.roster.home(), L = window.Logic;
    function mark(no, k){ var s = stu[no] = stu[no] || {}; s[k] = (s[k] || 0) + 1; }
    try{
      /* 생활지도(출결·상담·결석신고서) — 담임 반만 */
      var G = TT.store.get("tt_guide_v1", null);
      if(G && home && L){
        var T = G.att || {}, hol = G.holidays || {}, set = G.settings || {}, mon = L.weekStart(td), wk = L.weekDates(mon);
        L.cfg.countApproved = !!set.countApproved;
        var opt = {weekN: +set.weekN || 3, runN: +set.runN || 2}, need = 0, reps = 0, rep = G.reports || {};
        (home.students || []).forEach(function(s){
          var no = String(s.no), w = L.weekStatus(T, hol, no, mon, opt);
          if(w.level !== "ok"){
            var since = [mon].concat(w.runs.map(function(x){ return x.start; })).sort()[0];
            if(!(G.counsel || []).some(function(c){ return c.sid === no && c.date >= since; })) need++;
          }
          wk.forEach(function(d){ if(d > td) return; var r = T[d] && T[d][no]; if(!r) return;   // 이번 주 지각·결석
            if(r.t === "A") mark(no, "abs"); else if(L.isTardy(T, hol, no, d)) mark(no, "late"); });
          var cur = null;                                              // 결석신고서: 이어진 같은 구분 결석을 한 건으로
          Object.keys(T).filter(function(d){ var r = T[d][no]; return r && r.t === "A"; }).sort().forEach(function(d){
            var k = T[d][no].k || "un";
            if(cur && cur.k === k && L.nextSchoolDay(cur.end, hol) === d) cur.end = d;
            else{ cur = {k: k, start: d, end: d}; if(!rep[no + "|" + d]) reps++; }
          });
        });
        var fl = (G.counsel || []).filter(function(c){ return c.next && !c.done && c.next <= td; });
        fl.forEach(function(c){ if(c.sid != null) mark(String(c.sid), "follow"); });
        if(need) out.push({ic: "🗣️", t: "상담 필요", n: need + "명", href: "apps/tardy/", lv: "hi", tip: "무단지각 기준에 걸렸는데 상담일지가 없는 학생"});
        if(fl.length) out.push({ic: "🔁", t: "상담 후속 확인", n: fl.length + "건", href: "apps/tardy/", lv: "mid", tip: "상담 후속 확인일이 된 학생"});
        if(reps) out.push({ic: "📄", t: "결석신고서", n: reps + "건", href: "apps/tardy/", lv: "mid", tip: "아직 만들지 않은 결석신고서"});
      }
      /* 제출물: 마감이 지났는데 미제출이 남은 것 (담임 반 학생은 따로 표시) */
      var Sb = TT.store.get("tt_submit_v1", null), cl = TT.roster.classes(), over = 0;
      if(Sb && Array.isArray(Sb.items)) Sb.items.forEach(function(it){
        if(!it.due || it.due >= td) return;
        var c = cl.filter(function(x){ return x.id === it.cls; })[0]; if(!c) return;
        var mk = (Sb.m || {})[it.id] || {}, miss = c.students.filter(function(s){ return !mk[s.no]; });
        if(miss.length) over++;
        if(home && c.id === home.id) miss.forEach(function(s){ mark(String(s.no), "sub"); });
      });
      if(over) out.push({ic: "📦", t: "미제출", n: over + "건", href: "apps/submit/", lv: "hi", tip: "마감이 지났는데 미제출 학생이 있는 제출물"});

      /* 학사일정 D-day: 다가오는 시험(진도 부족과 함께), 방학 */
      var C = TT.store.get("tt_calendar_v1", null), ev = C && Array.isArray(C.events) ? C.events : [];
      var Pc = TT.store.get("tt_mpace_v1", null), short = Pc && Pc.short > 0 && Pc.to && Pc.to >= td ? Pc.short : 0;
      var ex = ev.filter(function(e){ return e.k === "exam" && e.d >= td && dayDiff(e.d, td) <= 60; }).sort(function(a, b){ return a.d < b.d ? -1 : 1; })[0];
      if(ex){
        var dx = dayDiff(ex.d, td);
        out.push({ic: "📝", t: ex.t + (short ? " · 진도 부족 " + short + "반" : ""), n: dx ? "D-" + dx : "오늘",
          href: short ? "apps/mpace/" : "", lv: short ? "hi" : "dd", tip: md(ex.d) + " " + ex.t + (short ? " — 시험 범위까지 남은 수업이 모자란 반이 있습니다" : "")});
      }else if(short) out.push({ic: "⏳", t: "진도 부족", n: short + "반", href: "apps/mpace/", lv: "hi", tip: "시험 범위까지 남은 수업이 모자란 반"});
      var vc = ev.filter(function(e){ return e.k === "off" && /방학/.test(e.t) && e.d >= td && dayDiff(e.d, td) <= 60; }).sort(function(a, b){ return a.d < b.d ? -1 : 1; })[0];
      if(vc){ var dv = dayDiff(vc.d, td); out.push({ic: "🏖️", t: vc.t, n: dv ? "D-" + dv : "오늘", href: "", lv: "dd", tip: md(vc.d) + " " + vc.t}); }

      /* 연간 업무: 이번 달 남은 일 */
      var Yr = TT.store.get("tt_year_v1", null), t0 = new Date(), ay = t0.getMonth() >= 2 ? t0.getFullYear() : t0.getFullYear() - 1, cm = t0.getMonth() + 1;
      var ym = Yr && Array.isArray(Yr.items) ? Yr.items.filter(function(it){ return it.m === cm && !(Yr.done || {})[ay + "|" + it.id]; }).length : 0;
      if(ym) out.push({ic: "📆", t: "연간 업무 남음", n: ym + "건", href: "apps/year/", lv: "mid", tip: "연간 업무: 이번 달에 남은 일"});
    }catch(err){}

    /* 이번 주 신경 쓸 학생: 지각·결석 / 미제출 / 상담 후속 중 두 가지 이상 겹친 학생 */
    var names = {}; if(home) (home.students || []).forEach(function(s){ names[String(s.no)] = s.name; });
    lastStu = Object.keys(stu).filter(function(no){ var s = stu[no]; return names[no] != null && ((s.late || s.abs) ? 1 : 0) + (s.sub ? 1 : 0) + (s.follow ? 1 : 0) >= 2; })
      .sort(function(a, b){ return a - b; }).map(function(no){
        var s = stu[no], why = [];
        if(s.late || s.abs) why.push([s.late ? "지각 " + s.late : "", s.abs ? "결석 " + s.abs : ""].filter(Boolean).join("·"));
        if(s.sub) why.push("미제출 " + s.sub);
        if(s.follow) why.push("상담 후속");
        return {no: no, name: names[no], why: why.join(" / ")};
      });
    if(lastStu.length) out.unshift({ic: "👀", t: "이번 주 신경 쓸 학생", n: lastStu.length + "명", pop: "stu", lv: "hi", tip: "지각·결석, 미제출, 상담 후속이 겹친 학생 (눌러야 이름이 보입니다)"});
    return out;
  }

  function item(x, i){
    var inner = '<span class="tt">' + x.ic + " " + esc(x.t) + '</span><span class="n">' + esc(x.n) + "</span>";
    var cls = "tdk " + (x.lv || "mid"), tip = ' title="' + esc(x.tip || "") + '"';
    if(x.pop) return '<button type="button" class="' + cls + '" data-pop="' + x.pop + '"' + tip + ">" + inner + "</button>";
    if(x.href) return '<a class="' + cls + '" href="' + x.href + '"' + tip + ">" + inner + "</a>";
    return '<span class="' + cls + '"' + tip + " style=\"cursor:default\">" + inner + "</span>";
  }
  function check(md){
    var L = lastItems = collect();
    if(md && md.id === "morning" && TT.roster.home())                   // 4단계: 조회 전에는 출결을 맨 위에
      L.unshift({ic: "🧭", t: "조회: 출결 확인", n: "지금", href: "apps/tardy/", lv: "hi", tip: "조회 시간 — 지각·결석을 출결·결석계에 적어 두세요"});
    if(!L.length) return card("tdCheck", "📋", "오늘 챙길 것", "", '<div class="tdl ok">✔ 지금 챙길 일이 없습니다</div>'
      + hint("상담·결석신고서·미제출·연간 업무·시험 D-day가 생기면 여기에 모입니다."));
    var urgent = L.filter(function(x){ return x.lv !== "dd"; }).length;
    var badge = '<button type="button" class="tdn" data-pop="all" title="챙길 일 전체 보기">' + (urgent ? urgent + "건" : "전체") + " ▾</button>";
    return card("tdCheck", "📋", "오늘 챙길 것", "", '<div class="tdg">' + L.map(item).join("") + "</div>").replace("</div><div class=\"tdb\">", badge + "</div><div class=\"tdb\">");
  }
  box.addEventListener("click", function(e){
    var b = e.target.closest("[data-pop]"); if(!b) return;
    if(popEl && popEl.dataset.k === b.dataset.pop){ closePop(); return; }
    if(b.dataset.pop === "stu"){
      openPop(b, "<h4>👀 이번 주 신경 쓸 학생 " + lastStu.length + "명</h4>"
        + lastStu.map(function(s){ return '<div class="r"><a href="apps/tardy/"><b>' + esc(s.no) + "번 " + esc(s.name) + "</b><span>" + esc(s.why) + "</span></a></div>"; }).join("")
        + '<div class="ft">지각·결석(이번 주), 미제출, 상담 후속 중 두 가지 이상 겹친 학생입니다. 이 기기 안에서만 계산합니다.</div>');
    }else{
      openPop(b, "<h4>📋 오늘 챙길 것</h4>" + lastItems.map(function(x){
        var row = "<b>" + x.ic + " " + esc(x.t) + "</b><span>" + esc(x.n) + (x.tip ? " · " + esc(x.tip) : "") + "</span>";
        return '<div class="r">' + (x.href ? '<a href="' + x.href + '">' + row + "</a>" : row) + "</div>";
      }).join(""));
    }
    popEl.dataset.k = b.dataset.pop;
  });

  /* ③ 종례·할 일 — 오늘까지인 내 할 일 (종례 바구니는 5단계). 상황(4단계)에 따라 제목·내용이 바뀜 */
  function todoItems(){ var M = TT.store.get("tt_mytodo_v1", null); return M && Array.isArray(M.items) ? M.items.filter(function(x){ return !x.done && x.date; }) : []; }
  function todo(md){
    var t = ymd(new Date()), all = todoItems(), k = md ? md.id : "";
    if(k === "week") return weekly(all);
    var tmr = ymd(nextSchool(new Date()));                              // 종례 때는 다음 수업일 것까지
    var lim = k === "close" ? tmr : t;
    var L = all.filter(function(x){ return x.date <= lim; }).sort(function(a, b){ return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var h = "";
    if(k === "free" && md.miss) h += '<a class="tdl miss" href="apps/journal/">✏️ 밀린 수업 기록 ' + md.miss + "개</a>";
    var B = bagLoad().items.filter(function(x){ return !x.done && x.date <= t; }), room = h ? 2 : 3;
    if(k === "morning") B = [];                                         // 조회 전에는 할 일만
    var bs = B.slice(0, k === "close" ? room : Math.min(room, 2));
    h += bs.map(function(x){ return '<div class="tdl"><button type="button" class="tdc" data-cdone="' + esc(x.id) + '" title="전했어요 (지우기)">✓</button> 📣 ' + esc(x.text) + "</div>"; }).join("");
    room -= bs.length;
    h += L.slice(0, room).map(function(x){
      var lb = x.date < t ? ["late", "지남"] : x.date === t ? ["today", "오늘"] : ["", "내일"];
      return '<div class="tdl"><span class="dt ' + lb[0] + '">' + lb[1] + "</span> " + esc(x.text) + "</div>";
    }).join("");
    var more = Math.max(0, L.length - room) + (B.length - bs.length);
    if(more) h += '<div class="tdm">+' + more + "건 더" + (B.length > bs.length ? " · 종례 바구니는 Ctrl+K" : " · 오른쪽 내 할 일") + "</div>";
    if(!L.length && !h) h = hint(k === "morning" ? "조회 때 전할 말은 내 할 일에 오늘 날짜로 적어 두면 여기 모입니다."
      : k === "close" ? "종례 때 전할 말이 없습니다. Ctrl+K 에 \"종례: 가정통신문 회수\"처럼 적으면 여기 모입니다."
      : "오늘까지인 할 일이 없습니다. Ctrl+K 에 \"종례: …\"로 적으면 종례 때 전할 말이 모입니다.");
    var title = k === "morning" ? "조회·할 일" : k === "free" ? "빈 시간 · 할 일" : "종례·할 일";
    return card("tdTodo", "📣", title, "", h, L.length + B.length ? L.length + B.length + "건" : "");
  }
  box.addEventListener("click", function(e){
    var b = e.target.closest("[data-cdone]"); if(!b) return;
    var d = bagLoad(), id = b.dataset.cdone; d.items.forEach(function(x){ if(x.id === id) x.done = true; }); bagSave(d); render();
    TT.ui.toast("종례 바구니에서 뺐습니다.", function(){ var d2 = bagLoad(); d2.items.forEach(function(x){ if(x.id === id) x.done = false; }); bagSave(d2); render(); });
  });
  /* 금요일 오후: 이번 주 정리 — 기록 안 한 수업, 이번 주 남은 할 일, 다음 주 일정 */
  function weekly(all){
    var d = new Date(), t = ymd(d), m = d.getHours() * 60 + d.getMinutes(), mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    var fri = new Date(mon); fri.setDate(mon.getDate() + 4); var nm = new Date(mon); nm.setDate(mon.getDate() + 7); var nf = new Date(mon); nf.setDate(mon.getDate() + 11);
    var J = journal(), G = TT.store.get("tt_guide_v1", null) || {}, hol = G.holidays || {}, C = TT.store.get("tt_calendar_v1", null), ev = C && Array.isArray(C.events) ? C.events : [];
    function off(ds){ return !!hol[ds] || ev.some(function(e){ return e.k === "off" && e.d === ds; }); }
    var miss = 0;
    if(J && TT.timetable.has()) for(var i = 0; i < 5; i++){
      var x = new Date(mon); x.setDate(mon.getDate() + i); var ds = ymd(x); if(ds > t || off(ds)) continue;
      TT.timetable.day(x).forEach(function(s){ if((ds < t || s.end <= m) && !(J.taught || {})[ds + "|" + s.n]) miss++; });
    }
    var left = all.filter(function(x){ return x.date <= ymd(fri); }).length, a = ymd(nm), b = ymd(nf);
    var nx = ev.filter(function(e){ return e.d >= a && e.d <= b; }).sort(function(p, q){ return p.d < q.d ? -1 : 1; });
    var nt = all.filter(function(x){ return x.date >= a && x.date <= b; }).length;
    var bg = bagLoad().items.filter(function(x){ return !x.done && x.date <= t; });
    var h = (bg.length ? '<div class="tdl"><button type="button" class="tdc" data-cdone="' + esc(bg[0].id) + '" title="전했어요 (지우기)">✓</button> 📣 ' + esc(bg[0].text) + (bg.length > 1 ? " <small>외 " + (bg.length - 1) + "건</small>" : "") + "</div>" : "")
      + (miss ? '<a class="tdl miss" href="apps/journal/">✏️ 이번 주 기록 안 한 수업 ' + miss + "개</a>" : (J ? '<div class="tdl ok">✔ 이번 주 수업 기록 완료</div>' : hint('<a href="apps/journal/">수업 기록장</a>을 쓰면 이번 주 빠진 기록이 나옵니다.')))
      + '<div class="tdl"><span class="ls">📝 남은 할 일 <b>' + left + "건</b> · 📅 다음 주 " + (nx.length ? "<b>" + esc(md2(nx[0].d) + " " + nx[0].t) + "</b>" + (nx.length > 1 ? " 외 " + (nx.length - 1) + "건" : "") : "학사일정 없음")
      + (nt ? " · 할 일 " + nt + "건" : "") + "</span></div>";
    if(bg.length && !miss && !J) h = h.replace(/<p class="tdx">[\s\S]*?<\/p>/, "");      // 칸이 좁으니 안내 문구는 뺌
    return card("tdTodo", "🗓️", "주간 정리", "", h, miss ? "기록 " + miss : "");
  }
  function md2(s){ return (+s.slice(5, 7)) + "/" + (+s.slice(8)); }

  /* ── 4단계: 지금 상황 고르기 ──
     조회 전 → 수업 직전(10분)·중 → 종례(15분 전~20분 뒤) → 수업 끝(15분 안, 기록 없음) → 금요일 오후 → 빈 시간 → (그 밖: 표시 없음) */
  function mode(){
    var d = new Date(), w = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), TTT = TT.timetable;
    if(w < 1 || w > 5) return null;
    var T = TTT.load(), P = T ? T.periods.map(function(p){ var a = String(p.t).split(":"); return (+a[0]) * 60 + (+a[1]); }).sort(function(a, b){ return a - b; }) : [];
    var first = P.length ? P[0] : 530, cl = closeMin(w);
    var td = ymd(d), J = journal(), today = TTT.day(d);
    var miss = J ? today.filter(function(s){ return s.end <= m && !(J.taught || {})[td + "|" + s.n]; }) : [];
    if(m >= 450 && m < first) return {id: "morning", label: "조회 전", card: "tdTodo"};
    var cur = TTT.now(), nx = TTT.next();
    if(cur || (nx && nx.start - m <= 10)) return {id: "lesson", label: cur ? "수업 중" : "곧 수업", card: "tdLesson"};
    if(m >= cl - 15 && m <= cl + 20) return {id: "close", label: m < cl ? "종례 전" : "종례", card: "tdTodo"};   // 종례가 수업 끝 알림보다 먼저
    if(miss.length && miss.some(function(s){ return m - s.end <= 15; })) return {id: "after", label: "수업 끝", card: "tdLesson"};
    if(w === 5 && m >= 780 && m <= cl + 120) return {id: "week", label: "금요일 오후", card: "tdTodo"};
    if(m >= first && m < cl) return {id: "free", label: "빈 시간", card: "tdTodo", miss: miss.length};
    return null;
  }
  (function(){
    var st = document.createElement("style");
    st.textContent = "#today.f1{grid-template-columns:1.5fr 1fr 1fr}#today.f2{grid-template-columns:1fr 1.5fr 1fr}#today.f3{grid-template-columns:1fr 1fr 1.5fr}@media (max-width:760px){#today.f1,#today.f2,#today.f3{grid-template-columns:1fr}}"
      + ".tdy.tdf{box-shadow:0 0 0 2px var(--accent-soft,#e6f0fb);background:linear-gradient(var(--accent-soft,#eef5fd),var(--card,#fff) 60%)}"
      + ".tdmode{font-size:11px;font-weight:800;color:var(--accent,#2f6fb3);background:var(--card,#fff);border:1px solid var(--accent,#2f6fb3);border-radius:999px;padding:0 7px;white-space:nowrap}"
      + "@media (max-width:760px){.tdy.tdf{order:-1}}"
      + "#grid .tdRec{position:relative;outline:2px solid var(--star,#f2b705);outline-offset:-2px}"
      + "#grid a.tb.tdRec::after{content:attr(data-rec);position:absolute;top:2px;right:4px;font-size:10px;font-weight:800;color:#7a5a00;background:var(--star-soft,#fff3cc);border-radius:999px;padding:0 5px;line-height:1.5}"
      + "#grid a.tbs.tdRec{background:var(--star-soft,#fff3cc)}";
    document.head.appendChild(st);
  })();

  /* 이달 추천 도구: tools.js 의 months(이번 달), exam(시험 N일 전~시험 날) → 아래 도구 단추에 표시 */
  function recTools(){
    if(typeof TT_TOOLS === "undefined") return [];
    var d = new Date(), cm = d.getMonth() + 1, td = ymd(d), C = TT.store.get("tt_calendar_v1", null), ev = C && Array.isArray(C.events) ? C.events : [];
    var ex = ev.filter(function(e){ return e.k === "exam" && e.d >= td; }).map(function(e){ return dayDiff(e.d, td); }).sort(function(a, b){ return a - b; })[0];
    return TT_TOOLS.filter(function(t){ return t.ready && t.href && ((t.months || []).indexOf(cm) >= 0 || (t.exam && ex != null && ex <= t.exam)); });
  }
  function markRec(){
    var g = document.getElementById("grid"); if(!g) return;
    var R = recTools(), ids = {}; R.forEach(function(t){ ids[t.href] = t; });
    Array.prototype.forEach.call(g.querySelectorAll("a.tb, a.tbs"), function(a){
      var t = ids[a.getAttribute("href")], on = !!t; if(a.classList.contains("tdRec") === on) return;
      a.classList.toggle("tdRec", on);
      if(on){ a.dataset.rec = t.exam && (t.months || []).indexOf(new Date().getMonth() + 1) < 0 ? "시험 전 추천" : "이달 추천"; a.dataset.tip0 = a.title; a.title = a.dataset.rec + " · " + a.title; }
      else if(a.dataset.tip0 != null) a.title = a.dataset.tip0;
    });
  }
  var gridEl = document.getElementById("grid");
  if(gridEl && window.MutationObserver) new MutationObserver(markRec).observe(gridEl, {childList: true});

  /* ── 5단계: 찾기·빠른 입력 (Ctrl+K, 위쪽 🔎 단추) ──
     학생 이름 → 학생 카드·학생 기록 / 도구 이름 → 열기 /
     한 줄 입력 → "종례: …" 는 종례 바구니, 날짜가 있으면 내 할 일, 학생 이름으로 시작하면 학생 기록.
     모두 이 기기 안에서만 찾고 저장합니다. */
  var DOW = "일월화수목금토";
  function addDays(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  /* 날짜 말 읽기 → {date:"YYYY-MM-DD", rest:"날짜 말을 뺀 글"} (없으면 date:"") */
  function parseDate(txt){
    var t0 = new Date(); t0.setHours(0, 0, 0, 0); var date = null, s = " " + txt + " ";
    function take(re, fn){ if(date) return; var m = s.match(re); if(!m) return; var r = fn(m); if(r){ date = r; s = s.replace(m[0], " "); } }
    take(/\s(오늘)(까지)?\s/, function(){ return t0; });
    take(/\s(내일)(까지)?\s/, function(){ return addDays(t0, 1); });
    take(/\s(모레)(까지)?\s/, function(){ return addDays(t0, 2); });
    take(/\s(다음\s?주|담주|이번\s?주|다다음\s?주)\s*([월화수목금토일])(요일)?(까지)?\s/, function(m){
      var mon = addDays(t0, -((t0.getDay() + 6) % 7)), wk = /다다음/.test(m[1]) ? 14 : /이번/.test(m[1]) ? 0 : 7;
      return addDays(mon, wk + (DOW.indexOf(m[2]) + 6) % 7);
    });
    take(/\s([월화수목금토일])요일(까지)?\s/, function(m){ var k = (DOW.indexOf(m[1]) - t0.getDay() + 7) % 7; return addDays(t0, k); });
    take(/\s(\d{1,2})\s?[\/.]\s?(\d{1,2})\.?(까지)?\s/, function(m){ return mkDate(+m[1], +m[2]); });
    take(/\s(\d{1,2})월\s?(\d{1,2})일(까지)?\s/, function(m){ return mkDate(+m[1], +m[2]); });
    take(/\s(\d{1,2})일(까지)?\s/, function(m){ var x = new Date(t0.getFullYear(), t0.getMonth(), +m[1]); if(x < t0) x.setMonth(x.getMonth() + 1); return x; });
    function mkDate(mo, dd){ if(mo < 1 || mo > 12 || dd < 1 || dd > 31) return null; var x = new Date(t0.getFullYear(), mo - 1, dd); if(x < addDays(t0, -60)) x.setFullYear(x.getFullYear() + 1); return x; }
    return {date: date ? ymd(date) : "", rest: s.replace(/\s+/g, " ").trim()};
  }
  function dLabel(ds){ if(!ds) return "날짜 없음"; var p = ds.split("-"), x = new Date(+p[0], p[1] - 1, +p[2]); return (+p[1]) + "/" + (+p[2]) + "(" + DOW[x.getDay()] + ")"; }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  (function(){
    var st = document.createElement("style");
    st.textContent = ".tdc{border:1px solid var(--line,#dde3ea);background:var(--card,#fff);border-radius:6px;font:inherit;font-size:11px;line-height:1.3;padding:0 4px;cursor:pointer;color:var(--ok,#2e7d32)}"
      + "#tdFind{border:0;border-radius:14px;padding:0;width:min(560px,94vw);box-shadow:0 18px 50px rgba(20,40,70,.28);background:var(--card,#fff);color:var(--ink,#1f2a37)}"
      + "#tdFind::backdrop{background:rgba(20,30,45,.35)}"
      + "#tdFind input{width:100%;box-sizing:border-box;border:0;border-bottom:1px solid var(--line,#dde3ea);padding:14px 16px;font:inherit;font-size:17px;outline:none;background:transparent;color:inherit}"
      + "#tdFind .fl{max-height:min(52vh,420px);overflow:auto;padding:6px}"
      + "#tdFind .fr{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:9px;cursor:pointer;font-size:14.5px}"
      + "#tdFind .fr.on{background:var(--accent-soft,#e6f0fb)}#tdFind .fr .ic{flex:none;width:1.5em;text-align:center}"
      + "#tdFind .fr .tx{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tdFind .fr small{color:var(--sub,#5b6775)}"
      + "#tdFind .fr .sb{flex:none;border:1px solid var(--line,#dde3ea);background:var(--card,#fff);border-radius:7px;font:inherit;font-size:12.5px;padding:2px 8px;cursor:pointer}"
      + "#tdFind .fh{font-size:11.5px;font-weight:800;color:#8a95a1;padding:6px 10px 2px}"
      + "#tdFind .ft{font-size:12px;color:#8a95a1;padding:8px 14px;border-top:1px solid var(--line,#eef1f4);line-height:1.6}#tdFind .ft b{color:var(--sub,#5b6775)}"
      + "#tdFind .bag .fr{cursor:default}";
    document.head.appendChild(st);
  })();

  var dlg = null, inp, list, rows = [], sel = 0;
  function students(){
    var out = []; try{ TT.roster.classes().forEach(function(c){ (c.students || []).forEach(function(s){ if(s.name) out.push({c: c, s: s}); }); }); }catch(e){}
    var h = TT.roster.home(); if(h) out.sort(function(a, b){ return (b.c.id === h.id) - (a.c.id === h.id); });
    return out;
  }
  /* 입력에 맞는 줄 만들기: [{h:머리글} | {ic, tx, sub, go:fn, btns:[[이름, fn]]}] */
  function build(q){
    var R = [], qq = q.trim(), low = qq.toLowerCase(); if(!qq) return bagRows();
    var act = [], m0 = qq.match(/^종례\s*[:：]?\s*(.+)$/);
    if(m0){
      var pd0 = parseDate(m0[1]), dd = pd0.date || closeDay();
      act.push({ic: "📣", tx: "종례 바구니에 넣기 · <b>" + esc(pd0.rest || m0[1]) + "</b>", sub: dLabel(dd) + " 종례", go: function(){ addBag(pd0.rest || m0[1], dd); }});
    }else{
      var pd = parseDate(qq), first = qq.split(/\s+/)[0], ST = students();
      var who = ST.filter(function(x){ return x.s.name === first; })[0];
      if(qq.length >= 2){
        var todo = {ic: "📝", tx: "내 할 일에 넣기 · <b>" + esc(pd.rest || qq) + "</b>", sub: dLabel(pd.date), go: function(){ addTodo(pd.rest || qq, pd.date); }};
        var rec = who && qq.length > first.length ? {ic: "✍️", tx: "학생 기록 · <b>" + esc(who.s.name) + "</b> " + esc(qq.slice(first.length).trim()), sub: esc(who.c.name),
          go: function(){ closeFind(); TT.notes.quick({cls: who.c.id, nos: [who.s.no], text: qq.slice(first.length).trim(), src: "첫 화면 빠른 입력"}); }} : null;
        if(rec && !pd.date) act.push(rec, todo); else { act.push(todo); if(rec) act.push(rec); }
        act.push({ic: "📣", tx: "종례 바구니에 넣기 · <b>" + esc(pd.rest || qq) + "</b>", sub: dLabel(pd.date || closeDay()) + " 종례", go: function(){ addBag(pd.rest || qq, pd.date || closeDay()); }});
      }
    }
    var T = m0 ? [] : (typeof TT_TOOLS === "undefined" ? [] : TT_TOOLS).filter(function(t){
      return t.ready && t.href && (t.name + " " + t.short + " " + t.desc + " " + t.id).toLowerCase().indexOf(low) >= 0; }).slice(0, 5)
      .map(function(t){ return {ic: t.icon, tx: esc(t.name), sub: "도구", go: function(){ if(TT.noteTool) TT.noteTool(t.id); location.href = t.href; }}; });
    var S = m0 ? [] : students().filter(function(x){ return x.s.name.indexOf(qq) >= 0 || (qq.length >= 3 && qq.indexOf(x.s.name + " ") === 0); }).slice(0, 6)
      .map(function(x){ return {ic: "🧑‍🎓", tx: "<b>" + esc(x.s.name) + "</b> <small>" + esc(x.c.name) + " " + esc(x.s.no) + "번</small>", go: function(){ closeFind(); TT.notes.card(x.c, x.s); },
        btns: [["📇 카드", function(){ closeFind(); TT.notes.card(x.c, x.s); }], ["✍️ 기록", function(){ closeFind(); TT.notes.quick({cls: x.c.id, nos: [x.s.no], src: "첫 화면 찾기"}); }]]}; });
    var actFirst = m0 || parseDate(qq).date || (!T.length && !S.length) || /\s/.test(qq);   // 띄어 쓴 한 줄은 입력으로 먼저
    function grp(h, L){ if(L.length){ R.push({h: h}); R = R.concat(L); } }
    if(actFirst) grp("입력", act);
    grp("학생", S); grp("도구", T);
    if(!actFirst) grp("입력", act);
    return R;
  }
  function bagRows(){
    var t = ymd(new Date()), B = bagLoad().items.filter(function(x){ return !x.done; }).sort(function(a, b){ return a.date < b.date ? -1 : 1; });
    if(!B.length) return [];
    return [{h: "📣 종례 바구니"}].concat(B.map(function(x){
      return {ic: x.date < t ? "⏰" : "📣", tx: esc(x.text), sub: dLabel(x.date), bag: 1, btns: [["✓ 전함", function(){ var d = bagLoad(); d.items.forEach(function(y){ if(y.id === x.id) y.done = true; }); bagSave(d); render(); draw(); }]]};
    }));
  }
  function addBag(text, date){
    text = String(text).trim().slice(0, 120); if(!text) return;
    var d = bagLoad(); d.items.push({id: uid(), text: text, date: date, done: false}); bagSave(d);
    closeFind(); render(); TT.ui.toast("📣 " + dLabel(date) + " 종례 바구니에 넣었습니다.");
  }
  function addTodo(text, date){
    text = String(text).trim().slice(0, 120); if(!text) return;
    var M = TT.store.get("tt_mytodo_v1", null); M = M && Array.isArray(M.items) ? M : {items: []};
    M.items.push({id: uid(), text: text, date: date || "", done: false, created: Date.now()}); TT.store.set("tt_mytodo_v1", M);
    closeFind(); window.dispatchEvent(new CustomEvent("tt-mytodo-change", {detail: "find"}));
    TT.ui.toast("📝 내 할 일에 넣었습니다 · " + dLabel(date));
  }
  function draw(){
    rows = build(inp.value); var pick = rows.filter(function(r){ return !r.h && !r.bag; });
    if(sel >= pick.length) sel = 0;
    var i = -1;
    list.innerHTML = rows.length ? rows.map(function(r, k){
      if(r.h) return '<div class="fh">' + r.h + "</div>";
      var on = !r.bag && ++i === sel;
      return '<div class="fr' + (on ? " on" : "") + '" data-i="' + k + '"><span class="ic">' + r.ic + '</span><span class="tx">' + r.tx + (r.sub ? " <small>· " + r.sub + "</small>" : "") + "</span>"
        + (r.btns || []).map(function(b, j){ return '<button type="button" class="sb" data-b="' + j + '">' + b[0] + "</button>"; }).join("") + "</div>";
    }).join("") : '<div class="fh">' + (inp.value.trim() ? "맞는 것이 없습니다" : "종례 바구니가 비어 있습니다") + "</div>";
    var on = list.querySelector(".fr.on"); if(on) on.scrollIntoView({block: "nearest"});
  }
  function openFind(){
    if(!dlg){
      dlg = document.createElement("dialog"); dlg.id = "tdFind";
      dlg.innerHTML = '<input type="text" placeholder="학생·도구 찾기, 또는 한 줄 입력 (예: 다음주 화 상담 / 종례: 가정통신문 회수)" autocomplete="off" spellcheck="false" aria-label="찾기·빠른 입력">'
        + '<div class="fl"></div><div class="ft"><b>↑↓</b> 고르기 · <b>Enter</b> 실행 · <b>Esc</b> 닫기<br>'
        + '<b>종례:</b> 로 시작 → 종례 바구니 · 날짜(오늘·내일·다음주 화·11/20) → 내 할 일 · 학생 이름으로 시작 → 학생 기록 · 🔒 이 기기 안에서만 찾고 저장</div>';
      document.body.appendChild(dlg);
      inp = dlg.querySelector("input"); list = dlg.querySelector(".fl");
      inp.addEventListener("input", function(){ sel = 0; draw(); });
      inp.addEventListener("keydown", function(e){
        var pick = rows.filter(function(r){ return !r.h && !r.bag; });
        if(e.key === "ArrowDown"){ e.preventDefault(); sel = (sel + 1) % Math.max(1, pick.length); draw(); }
        else if(e.key === "ArrowUp"){ e.preventDefault(); sel = (sel - 1 + pick.length) % Math.max(1, pick.length); draw(); }
        else if(e.key === "Enter" && !e.isComposing){ e.preventDefault(); if(pick[sel]) pick[sel].go(); }
      });
      list.addEventListener("click", function(e){
        var fr = e.target.closest(".fr"); if(!fr) return; var r = rows[+fr.dataset.i]; if(!r) return;
        var b = e.target.closest("[data-b]"); if(b){ r.btns[+b.dataset.b][1](); return; }
        if(r.go) r.go();
      });
      dlg.addEventListener("click", function(e){ if(e.target === dlg) closeFind(); });
    }
    inp.value = ""; sel = 0; draw();
    if(!dlg.open) dlg.showModal(); inp.focus();
  }
  function closeFind(){ if(dlg && dlg.open) dlg.close(); }
  document.addEventListener("keydown", function(e){
    if((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === "k" || e.key === "K" || e.code === "KeyK")){ e.preventDefault(); if(dlg && dlg.open) closeFind(); else openFind(); }
  });
  var fBtn = document.getElementById("qFind");
  if(fBtn){ fBtn.hidden = false; fBtn.onclick = openFind; }
  window.TT_FIND = {open: openFind, parseDate: parseDate};

  function render(){
    var md = null; try{ md = mode(); }catch(err){}
    box.innerHTML = lesson() + check(md) + todo(md);
    box.classList.remove("f1", "f2", "f3");
    if(md){
      var c = document.getElementById(md.card);
      if(c){ c.classList.add("tdf"); box.classList.add(md.card === "tdLesson" ? "f1" : md.card === "tdCheck" ? "f2" : "f3");
        var hd = c.querySelector(".tdh"), chip = document.createElement("span"); chip.className = "tdmode"; chip.textContent = "지금 · " + md.label;
        var a = hd.firstChild; hd.insertBefore(chip, a ? a.nextSibling : null); }
    }
    markRec();
    window.dispatchEvent(new Event("tt-today-render"));               // 다음 단계 기능이 이 신호로 칸을 채움
  }
  window.TT_TODAY = {render: render};
  window.addEventListener("pageshow", render);
  window.addEventListener("tt-mytodo-change", render);
  window.addEventListener("storage", function(e){ if(!e.key || /^tt_(timetable|mytodo|guide|submit|calendar|year|mpace|journal|roster|close)_v1$/.test(e.key)) render(); });
  setInterval(function(){ if(document.visibilityState === "visible") render(); }, 60000);
  render();
})();
