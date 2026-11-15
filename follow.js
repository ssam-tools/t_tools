/* 쌤 노트 · 후속 조치 자동 연결 (18단계) — 한 일의 "다음 일"을 쌤 노트가 이어 둡니다. "준비됨" 엔진(auto.js)에 규칙을 더합니다.
   ① 제출물 마감이 지나면 미제출 번호를 종례 바구니에 자동으로 넣고(이름 없이 번호만), 사흘이 지나도 안 내면 학부모 문자 초안을 준비
   ② 무단지각이 쌓이면(주 N회·연속) 상담 기록 초안(상담 계기·후속 확인일)과 학부모 문자를 준비 → [상담일지에 초안 넣기]
   ③ 결석 뒤 결석신고서를 아직 안 만들었으면 학생별 정리 + 서류 제출 안내 문자를 준비
   ④ 오늘 수업이 끝났는데 수업 기록장에 기록이 없는 교시 → [모두 진도 +1] 한 번에 (첫 화면 다음 수업 칸에도 [진도 +1])
   모두 이 기기 안에서만 계산합니다. 첫 화면 카드 제목에는 숫자만 쓰고, 이름은 눌러 연 미리보기에만 나옵니다. */
var TTFollow = (function(){
  "use strict";
  var DOW = "일월화수목금토";
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s){ var a = String(s).split("-"); return new Date(+a[0], a[1] - 1, +a[2]); }
  function add(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function diff(a, b){ return Math.round((parse(a) - parse(b)) / 86400000); }
  function md(s){ var d = parse(s); return (d.getMonth() + 1) + "/" + d.getDate() + "(" + DOW[d.getDay()] + ")"; }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function sch(){ return TT.school.load(); }
  function sign(){ var h = TT.roster.home(), s = sch(); return (h ? h.name + " " : "") + "담임" + (s.teacher ? " " + s.teacher : ""); }

  /* ---------- 생활지도 자료 (tt_guide_v1) ---------- */
  function guide(){ var G = TT.store.get("tt_guide_v1", null); if(!G || typeof G !== "object") return null; G.att = G.att || {}; G.counsel = G.counsel || []; G.reports = G.reports || {}; G.settings = G.settings || {}; return G; }
  function holidays(G){
    var h = {}; Object.keys((G && G.holidays) || {}).forEach(function(k){ h[k] = G.holidays[k]; });
    var C = TT.store.get("tt_calendar_v1", null); ((C && C.events) || []).forEach(function(e){ if(e.k === "off" && !h[e.d]) h[e.d] = e.t; });
    return h;
  }
  function homeStudents(){ var h = TT.roster.home(); return h ? h.students.slice().sort(function(a, b){ return a.no - b.no; }) : []; }

  /* ---------- ① 제출물 → 종례 바구니 (자동, 한 번만) ---------- */
  function autoLog(){ var o = TT.store.get("tt_auto_v1", null) || {}; o.set = o.set || {}; o.log = o.log || {}; return o; }
  function syncBag(){
    try{
      var A = autoLog(), cf = A.set["submit-bag"] || {}; if(cf.on === false) return 0;
      var days = cf.days != null ? +cf.days : 1, td = ymd(new Date()), Sb = TT.store.get("tt_submit_v1", null), cl = TT.roster.classes(), n = 0;
      if(!Sb || !Array.isArray(Sb.items)) return 0;
      var B = TT.store.get("tt_close_v1", null); B = B && Array.isArray(B.items) ? B : {items: []};
      Sb.items.forEach(function(it){
        var k = "submit-bag|" + it.id;
        if(!it.due || A.log[k] || diff(td, it.due) < days || diff(td, it.due) > 14) return;   // 2주 넘게 지난 것은 넣지 않음
        var cs = cl.filter(function(x){ return x.id === it.cls; })[0]; if(!cs) return;
        var mk = (Sb.m || {})[it.id] || {}, miss = cs.students.filter(function(s){ return !mk[s.no]; }).map(function(s){ return s.no; });
        A.log[k] = {s: "done", at: Date.now()};
        if(!miss.length) return;
        B.items.push({id: uid(), text: "📦 " + (it.title || it.name || "제출물") + " 미제출 " + miss.join(", ") + "번 — 내일까지 내기", date: td, done: false, src: "auto"});
        n++;
      });
      TT.store.set("tt_auto_v1", A);
      if(n) TT.store.set("tt_close_v1", B);
      return n;
    }catch(e){ return 0; }
  }

  /* ---------- ⑤ 수업 기록장: 진도 +1 ---------- */
  function lessonList(J, g){
    var raw = (J.cur || {})[g]; raw = Array.isArray(raw) ? raw.join("\n") : String(raw || "");
    var L = []; raw.split("\n").forEach(function(l){ l = l.trim(); if(l && l[0] !== "#") L.push(l); });
    return L;
  }
  function missed(d){
    var J = TT.store.get("tt_journal_v1", null), m = d.getHours() * 60 + d.getMinutes(), td = ymd(d);
    if(!J || !TT.timetable || !TT.timetable.has()) return [];
    return TT.timetable.day(d).filter(function(s){ return s.end <= m && s.cls && !(J.taught || {})[td + "|" + s.n]; }).map(function(s){
      var c = +s.cls, L = lessonList(J, Math.floor(c / 100)), p = (J.prog || {})[c] || {}, i = Math.min(+p.n || 0, L.length);
      return {s: s, td: td, now: L[i] || "", nL: L.length};
    });
  }
  /* 한 교시를 '진행 완료'로 (수업 기록장의 [진행 완료]와 같음). 되면 그 차시 이름을 돌려줌 */
  function plusOne(td, s){
    var J = TT.store.get("tt_journal_v1", null); if(!J) return "";
    J.taught = J.taught || {}; J.prog = J.prog || {};
    var key = td + "|" + s.n; if(J.taught[key]) return "";
    var c = +s.cls, L = lessonList(J, Math.floor(c / 100)), P = J.prog[c] || (J.prog[c] = {n: 0}), i = Math.min(+P.n || 0, L.length);
    if(i >= L.length) return "";
    J.taught[key] = {kind: "done", lesson: i}; P.n = i + 1;
    TT.store.set("tt_journal_v1", J);
    return L[i];
  }
  /* 첫 화면 [진도 +1] 단추: 오늘 n교시 */
  function plusOneNow(n){
    var d = new Date(), s = TT.timetable.day(d).filter(function(x){ return x.n === n; })[0]; if(!s) return;
    var t = plusOne(ymd(d), s);
    if(t) TT.ui.toast(n + "교시 " + s.code + " · " + t + " 진행 완료", function(){
      var J = TT.store.get("tt_journal_v1", null), k = ymd(d) + "|" + n; if(!J || !J.taught[k]) return;
      var c = +s.cls; delete J.taught[k]; if(J.prog[c]) J.prog[c].n = Math.max(0, (+J.prog[c].n || 1) - 1); TT.store.set("tt_journal_v1", J);
      window.dispatchEvent(new Event("tt-auto-change"));
    });
    else TT.ui.toast("수업 기록장에 차시 목록이 없거나 모든 차시를 마쳤습니다. 수업 기록장에서 확인해 주세요.");
    window.dispatchEvent(new Event("tt-auto-change"));
  }

  /* ---------- 규칙 (auto.js 에 더함) ---------- */
  var RULES = [
    { id: "submit-bag", icon: "📣", name: "미제출 → 종례 바구니", days: 1, after: true,
      desc: "제출물 마감 다음 날, 아직 안 낸 학생 번호를 종례 바구니에 자동으로 넣습니다(이름 없이 번호만, 제출물마다 한 번).",
      when: function(){ return []; }, read: function(){ return {}; }, make: function(){ return {title: "", text: ""}; }, end: ["done"] },

    { id: "submit-parent", icon: "📱", name: "미제출 학부모 문자", days: 3, after: true,
      desc: "제출물 마감 며칠 뒤에도 안 낸 학생이 있으면 학생마다 학부모 안내 문자 초안을 만듭니다.",
      when: function(c, days){
        var Sb = TT.store.get("tt_submit_v1", null), cl = TT.roster.classes(), out = [];
        if(Sb && Array.isArray(Sb.items)) Sb.items.forEach(function(it){
          var g = it.due ? diff(c.td, it.due) : -1; if(g < days || g > days + 14) return;
          var cs = cl.filter(function(x){ return x.id === it.cls; })[0]; if(!cs) return;
          var mk = (Sb.m || {})[it.id] || {}, miss = cs.students.filter(function(s){ return !mk[s.no]; }).length;
          if(miss) out.push({key: it.id, due: it.due, n: miss + "명", it: it, cs: cs, name: (it.title || "제출물") + " 학부모 문자"});
        });
        return out;
      },
      read: function(c, o){ var mk = ((TT.store.get("tt_submit_v1", null) || {}).m || {})[o.it.id] || {}; return {it: o.it, cs: o.cs, miss: o.cs.students.filter(function(s){ return !mk[s.no]; }).sort(function(a, b){ return a.no - b.no; })}; },
      make: function(d, o, c){
        var nx = md(ymd(c.nextSchool(c.now))), what = d.it.title || "제출물", me = sign();
        return {title: what + " 미제출 학부모 문자 " + d.miss.length + "명", links: [{href: "apps/submit/", label: "📦 제출물 체크"}, {href: "apps/parent/", label: "✉️ 학부모 문자"}],
          text: d.miss.map(function(s){
            return "■ " + s.no + "번 " + s.name + "\n안녕하세요. " + me + "입니다.\n" + s.name + " 학생이 아직 " + what + "을(를) 내지 않았습니다(마감 " + md(d.it.due) + "). " + nx + "까지 준비해 보내 주시면 감사하겠습니다.";
          }).join("\n\n")};
      },
      end: ["copy", "done"] },

    { id: "tardy-follow", icon: "🧭", name: "무단지각 누적 → 상담 기록", days: null,
      desc: "무단지각이 한 주 기준 횟수 이상이거나 이어지면(출결 설정 기준), 상담 기록 초안(상담 계기·후속 확인일)과 학부모 문자를 준비합니다.",
      labels: {done: "🗣️ 상담일지에 초안 넣기"},
      when: function(c){
        var G = guide(); if(!G || typeof Logic === "undefined") return [];
        var hol = holidays(G), mon = Logic.weekStart(c.td), opt = {weekN: +G.settings.weekN || 3, runN: +G.settings.runN || 2}, L = [];
        Logic.cfg.countApproved = !!G.settings.countApproved;
        homeStudents().forEach(function(s){
          var w = Logic.weekStatus(G.att, hol, String(s.no), mon, opt);
          if(w.level === "ok") return;
          if(G.counsel.some(function(x){ return String(x.sid) === String(s.no) && x.date >= mon; })) return;     // 이번 주에 이미 상담 기록이 있음
          L.push({s: s, w: w});
        });
        return L.length ? [{key: mon + "|" + L.map(function(x){ return x.s.no; }).join(","), due: c.td, n: L.length + "명", list: L, mon: mon}] : [];
      },
      read: function(c, o){ return o; },
      make: function(d, o, c){
        var me = sign(), nx = ymd(add(c.now, 7));
        return {title: "무단지각 상담 준비 " + d.list.length + "명", links: [{href: "apps/tardy/?tab=counsel", label: "🗣️ 상담 열기"}],
          text: d.list.map(function(x){
            var tr = Logic.describe(x.w);
            return "■ " + x.s.no + "번 " + x.s.name + "\n[상담 기록 초안] 상담 계기: " + tr + " · 후속 확인일 " + md(nx)
              + "\n[학부모 문자] 안녕하세요. " + me + "입니다.\n" + x.s.name + " 학생이 최근 여러 차례 지각하였습니다(" + tr.replace(/무단지각/g, "지각") + "). 등교 습관을 함께 살펴 주시면 감사하겠습니다. 아침에 어려운 사정이 있다면 편하게 말씀해 주세요.";
          }).join("\n\n") + "\n\n[상담일지에 초안 넣기]를 누르면 학생마다 상담 계기·후속 확인일이 채워진 상담일지가 만들어집니다. 상담 뒤 내용만 적으세요."};
      },
      done: function(o){
        var G = guide(); if(!G) return; var td = ymd(new Date()), nx = ymd(add(new Date(), 7));
        o.list.forEach(function(x){
          G.counsel.push({id: uid(), sid: String(x.s.no), date: td, trigger: Logic.describe(x.w), reasons: [], content: "", actions: [], actionNote: "", parent: "none", next: nx, done: false, created: Date.now(), auto: 1});
        });
        TT.store.set("tt_guide_v1", G);
      },
      end: ["done", "copy"] },

    { id: "absence-doc", icon: "📄", name: "결석신고서 챙기기", days: 1, after: true,
      desc: "결석이 끝나고 며칠이 지나도 결석신고서를 만들지 않았으면, 학생별 정리와 서류 제출 안내 문자를 준비합니다.",
      when: function(c, days){
        var E = episodes(); if(!E) return [];
        var L = E.filter(function(e){ return !e.made && diff(c.td, e.end) >= days && diff(c.td, e.end) <= 30; });
        return L.length ? [{key: L.map(function(e){ return e.key; }).join(","), due: L[0].end, n: L.length + "건", list: L}] : [];
      },
      read: function(c, o){ return o; },
      make: function(d){
        var me = sign(), AK = {sick: "병결", ok: "인정결", un: "미인정결", etc: "기타결"};
        return {title: "결석신고서 미작성 " + d.list.length + "건", links: [{href: "apps/tardy/?tab=report", label: "📄 결석신고서 만들기"}],
          text: d.list.map(function(e){
            var span = e.start === e.end ? md(e.start) : md(e.start) + "~" + md(e.end);
            return "■ " + e.s.no + "번 " + e.s.name + " · " + span + " " + (AK[e.kind] || "결석") + (e.reasons.length ? " · 사유: " + e.reasons.join(", ") : "")
              + "\n[학부모 문자] 안녕하세요. " + me + "입니다.\n" + e.s.name + " 학생의 " + span + " 결석 처리를 위해 결석신고서와 증빙 서류(진료확인서·처방전 등)가 필요합니다. 준비되는 대로 학생 편으로 보내 주시면 감사하겠습니다.";
          }).join("\n\n") + "\n\n결석신고서는 출결·결석계 화면에서 학생·기간·사유가 이미 채워져 있습니다."};
      },
      end: ["copy", "done"] },

    { id: "lesson-miss", icon: "✏️", name: "수업 기록 빠짐 → 진도 +1", days: null,
      desc: "오늘 끝난 수업 중 수업 기록장에 기록이 없는 교시를 모아, 한 번에 '진행 완료'(진도 +1)로 기록합니다.",
      labels: {done: "✔ 모두 진도 +1"},
      when: function(c){
        if(!c.school(c.now)) return [];
        var M = missed(c.now).filter(function(x){ return x.nL && x.now; });
        if(!M.length) return [];
        var all = TT.timetable.day(c.now), lastEnd = all.length ? all[all.length - 1].end : 0;
        if(c.min < Math.min(lastEnd, c.closeMin(c.now.getDay()))) return [];          // 마지막 수업(또는 종례)이 끝난 뒤에
        return [{key: c.td + "|" + M.map(function(x){ return x.s.n; }).join(","), due: c.td, n: M.length + "교시", list: M}];
      },
      read: function(c, o){ return o; },
      make: function(d){
        return {title: "오늘 수업 기록 빠짐 " + d.list.length + "교시", links: [{href: "apps/journal/", label: "📒 수업 기록장"}],
          text: d.list.map(function(x){ return x.s.n + "교시 " + x.s.code + " → " + x.now; }).join("\n")
            + "\n\n[모두 진도 +1]을 누르면 위 차시를 '진행 완료'로 기록합니다. 수업을 못 한 교시는 수업 기록장에서 '수업 없음'으로 바꾸세요."};
      },
      done: function(o){ var n = 0; o.list.forEach(function(x){ if(plusOne(x.td, x.s)) n++; }); },
      end: ["done"] }
  ];

  /* 결석 묶음 (출결·결석계와 같은 방법: 같은 학생·같은 구분이 수업일로 이어지면 한 건) */
  function episodes(){
    var G = guide(); if(!G) return null;
    var hol = holidays(G), out = [];
    function nextSchool(s){ var x = parse(s), g = 0; do{ x = add(x, 1); }while((x.getDay() === 0 || x.getDay() === 6 || hol[ymd(x)]) && g++ < 400); return ymd(x); }
    homeStudents().forEach(function(st){
      var no = String(st.no), cur = null;
      Object.keys(G.att).filter(function(d){ var r = G.att[d] && G.att[d][no]; return r && r.t === "A"; }).sort().forEach(function(d){
        var r = G.att[d][no], k = r.k || "un";
        if(cur && cur.kind === k && nextSchool(cur.end) === d){ cur.end = d; if(r.r && cur.reasons.indexOf(r.r) < 0) cur.reasons.push(r.r); }
        else { cur = {s: st, kind: k, start: d, end: d, reasons: r.r ? [r.r] : []}; out.push(cur); }
      });
    });
    out.forEach(function(e){ e.key = e.s.no + "|" + e.start; e.made = !!G.reports[e.key]; });
    return out;
  }

  if(typeof TTAuto !== "undefined") RULES.forEach(TTAuto.add);
  if(/\/(index\.html)?$/.test(location.pathname) && !/\/apps\//.test(location.pathname)) syncBag();   // 첫 화면을 열 때

  return {syncBag: syncBag, plusOne: plusOne, plusOneNow: plusOneNow, missed: missed, episodes: episodes, rules: RULES};
})();
