/* 쌤 노트 · "준비됨" 엔진 (15단계) — 모든 자동화의 공통 틀
   쌤 노트가 먼저 만들어 두고, 선생님은 확인 → [복사]/[인쇄]/[저장] 만 누릅니다.

   ■ 새 자동화는 규칙 네 줄만 적으면 됩니다 (아래 RULES 에 하나 추가, 또는 다른 파일에서 TTAuto.add({...}))
     id    : 이름표 (영문, 바꾸지 않음 — 처리 기록이 이 이름으로 남음)
     icon, name, desc : 첫 화면·설정에 보이는 이름과 설명 (학생 이름은 넣지 않음)
     days  : 기본 "며칠 전" (설정에서 바꿀 수 있음, 없으면 null)
     ① when(c)      언제 — 지금 준비할 일 목록 [{key, due:"YYYY-MM-DD", n:"숫자만 쓴 짧은 말"}]. 같은 key 는 한 번만 뜸
     ② read(c, o)   무엇을 읽고 — 필요한 자료를 모아 돌려줌 (기기 안에서만)
     ③ make(d, o)   무엇을 만들어 — {title, text} 미리보기 글 (선생님이 고칠 수 있음)
     ④ end          어떻게 끝내나 — ["copy","print","save","done"] 중 고름 ("done" = ✔ 다 했어요, 글 없이 처리만)
     (선택) done(o)  처리했을 때 함께 할 일 (예: 연간 업무 체크, 내 할 일 지우기)
     (선택) make 가 돌려준 links:[{href, label}] → 미리보기에 도구 단추로 보임 (16단계)
   ■ 카드 길: 기다림(아직 며칠 전 아님) → 준비됨(첫 화면 "오늘 챙길 것"에 뜸) → 확인(미리보기) → 처리(사라짐·기록)
              / 미루기(내일 다시) / 이번엔 안 함(기록만 남기고 다시 안 뜸)
   ■ 저장: "tt_auto_v1" {set:{규칙id:{on, days}}, log:{"규칙id|key":{s:"done"|"skip"|"later", at, until}}}
     처리 기록은 90일 지나면 정리합니다. 계산은 모두 이 기기 안에서 합니다. 첫 화면 카드 제목에는 숫자만(이름은 눌러야). */
var TTAuto = (function(){
  "use strict";
  var KEY = "tt_auto_v1", DOW = "일월화수목금토";
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s){ var a = String(s).split("-"); return new Date(+a[0], a[1] - 1, +a[2]); }
  function add(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function diff(a, b){ return Math.round((parse(a) - parse(b)) / 86400000); }
  function md(s){ var d = parse(s); return (d.getMonth() + 1) + "/" + d.getDate() + "(" + DOW[d.getDay()] + ")"; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function toMin(t){ var a = String(t).split(":"); return (+a[0]) * 60 + (+a[1]); }

  /* ---------- 공통 자료 (규칙이 함께 씀) ---------- */
  function ctx(){
    var now = new Date(), td = ymd(now), C = TT.store.get("tt_calendar_v1", null), ev = C && Array.isArray(C.events) ? C.events : [];
    var off = {}; ev.forEach(function(e){ if(e.k === "off") off[e.d] = e.t; });
    function school(d){ var w = d.getDay(); return w >= 1 && w <= 5 && !off[ymd(d)]; }
    function nextSchool(d){ var x = new Date(d); var g = 0; do{ x = add(x, 1); }while(!school(x) && g++ < 30); return x; }
    var CLOSE_T = {1: "15:10", 2: "16:05", 3: "15:10", 4: "16:05", 5: "15:10"}, u = (TT.store.get("tt_ui_v1", {}) || {}).home || {};
    return {now: now, td: td, min: now.getHours() * 60 + now.getMinutes(), ev: ev, off: off, school: school, nextSchool: nextSchool,
      closeMin: function(w){ return toMin((u.close || {})[w] || CLOSE_T[w] || "15:10"); },
      home: TT.roster.home(), sch: TT.school.load(), ymd: ymd, md: md, diff: diff, add: add, parse: parse};
  }
  function who(c){ var h = c.home; return h ? h.name : "우리 반"; }
  function sign(c){ return c.sch.teacher ? "담임 " + c.sch.teacher : "담임"; }

  /* ---------- 규칙 ---------- */
  var RULES = [
    { id: "close-notice", icon: "📣", name: "종례 안내문", days: null,
      desc: "종례 30분 전에 종례 바구니·내일 일정·오늘까지 할 일을 쿨메신저에 붙여 넣을 학급 안내문으로 만듭니다.",
      when: function(c){                                                           // ① 수업일 종례 30분 전 ~ 종례 1시간 뒤
        if(!c.school(c.now)) return [];
        var cl = c.closeMin(c.now.getDay()); if(c.min < cl - 30 || c.min > cl + 60) return [];
        var B = (TT.store.get("tt_close_v1", null) || {}).items || [], nb = B.filter(function(x){ return !x.done && x.date <= c.td; }).length;
        return [{key: c.td, due: c.td, n: nb ? "전할 말 " + nb : "내일 일정"}];
      },
      read: function(c){                                                           // ② 종례 바구니 · 다음 수업일 학사일정
        var B = ((TT.store.get("tt_close_v1", null) || {}).items || []).filter(function(x){ return !x.done && x.date <= c.td; });
        var nx = c.nextSchool(c.now), nk = ymd(nx), gap = [];
        for(var d = add(c.now, 1); ymd(d) < nk; d = add(d, 1)) if(c.off[ymd(d)]) gap.push(ymd(d) + "|" + c.off[ymd(d)]);
        return {bag: B.map(function(x){ return x.text; }), next: nk, gap: gap, evs: c.ev.filter(function(e){ return e.d === nk && e.k !== "off"; }).map(function(e){ return e.t; })};
      },
      make: function(d, o, c){                                                     // ③ 학급 안내문
        var L = ["[" + who(c) + " 종례 안내] " + md(c.td), ""];
        if(d.bag.length){ L.push("■ 오늘 전할 말"); d.bag.forEach(function(t){ L.push("- " + t); }); L.push(""); }
        var uniq = {}; d.gap.forEach(function(g){ var p = g.split("|"); uniq[p[1]] = uniq[p[1]] || p[0]; });
        Object.keys(uniq).forEach(function(t){ L.push("■ " + md(uniq[t]) + " " + t + " (등교하지 않습니다)"); });
        L.push("■ 다음 등교: " + md(d.next) + (d.evs.length ? " · " + d.evs.join(", ") : ""));
        L.push("", sign(c));
        return {title: "종례 안내문 · " + md(c.td), text: L.join("\n")};
      },
      end: ["copy", "print"] },

    { id: "off-notice", icon: "🏖️", name: "휴업일·방학 안내", days: 3,
      desc: "학사일정의 휴업일·방학·재량휴업일 며칠 전에 학생·학부모 안내 문자 초안을 만듭니다.",
      when: function(c, days){
        var out = [], seen = {};
        c.ev.filter(function(e){ return e.k === "off" && e.d > c.td && diff(e.d, c.td) <= days && !/^(토|일)$/.test(DOW[parse(e.d).getDay()]); })
          .sort(function(a, b){ return a.d < b.d ? -1 : 1; })
          .forEach(function(e){
            var pv = add(parse(e.d), -1); while(pv.getDay() === 0 || pv.getDay() === 6) pv = add(pv, -1);
            if(c.off[ymd(pv)] === e.t) return;                                         // 이어진 휴업은 첫날 하나로
            if(seen[e.t + e.d]) return; seen[e.t + e.d] = 1;
            out.push({key: e.d + "|" + e.t, due: e.d, n: "D-" + diff(e.d, c.td), ev: e});
          });
        return out;
      },
      read: function(c, o){
        var e = o.ev, end = e.d, x = parse(e.d);
        for(var g = 0; g < 80; g++){                                             // 주말을 건너 이어진 같은 휴업까지
          var y = add(x, 1); while(y.getDay() === 0 || y.getDay() === 6) y = add(y, 1);
          if(c.off[ymd(y)] === e.t){ end = ymd(y); x = y; } else break;
        }
        return {t: e.t, from: e.d, to: end, back: ymd(c.nextSchool(parse(end)))};
      },
      make: function(d, o, c){
        var span = d.from === d.to ? md(d.from) : md(d.from) + "~" + md(d.to);
        var text = "[" + (c.sch.name || "학교") + "] " + who(c) + " 안내드립니다.\n" + span + "은 " + d.t + "입니다.\n"
          + md(d.back) + "에 정상 등교합니다. 안전하게 지내도록 가정에서도 지도 부탁드립니다.\n" + sign(c) + " 드림";
        return {title: d.t + " 안내 · " + span, text: text};
      },
      end: ["copy", "save"] },

    { id: "submit-missing", icon: "📦", name: "미제출 안내", days: 1,
      desc: "제출물 마감 다음 날부터 미제출 학생 명단(번호·이름)과 종례 때 전할 말을 만듭니다. 이름은 눌러야 보입니다.",
      when: function(c, days){
        var Sb = TT.store.get("tt_submit_v1", null), cl = TT.roster.classes(), out = [];
        if(Sb && Array.isArray(Sb.items)) Sb.items.forEach(function(it){
          if(!it.due || diff(c.td, it.due) < days) return;
          var cs = cl.filter(function(x){ return x.id === it.cls; })[0]; if(!cs) return;
          var mk = (Sb.m || {})[it.id] || {}, miss = cs.students.filter(function(s){ return !mk[s.no]; }).length;
          if(miss) out.push({key: it.id + "|" + miss, due: it.due, n: miss + "명", it: it, cs: cs});
        });
        return out;
      },
      read: function(c, o){
        var mk = ((TT.store.get("tt_submit_v1", null) || {}).m || {})[o.it.id] || {};
        return {name: o.it.name || o.it.title || "제출물", due: o.it.due, cls: o.cs.name, miss: o.cs.students.filter(function(s){ return !mk[s.no]; })};
      },
      make: function(d){
        return {title: d.name + " 미제출 " + d.miss.length + "명 · " + d.cls,
          text: "[" + d.cls + "] " + d.name + " (마감 " + md(d.due) + ") 아직 내지 않은 학생\n"
            + d.miss.map(function(s){ return s.no + "번 " + s.name; }).join(", ") + "\n\n→ 내일까지 꼭 내 주세요."};
      },
      end: ["copy", "print"] },

    /* ── 16단계: 학사일정 → 할 일 자동 생성 ── */
    { id: "counsel-week", icon: "🗣️", name: "상담 주간 준비", days: 7,
      desc: "학사일정의 상담 주간 며칠 전에 학부모 상담 안내 문자와 준비 목록(상담 카드 살펴보기 · 일정표)을 만듭니다.",
      when: function(c, days){ return firstOf(c, /상담\s*주간|학부모\s*상담/, days).map(function(e){ return {key: e.d, due: e.d, n: "D-" + diff(e.d, c.td), ev: e}; }); },
      read: function(c, o){ return {ev: o.ev, end: spanEnd(c, o.ev)}; },
      make: function(d, o, c){
        var span = d.end > d.ev.d ? md(d.ev.d) + "~" + md(d.end) : md(d.ev.d);
        return {title: "상담 주간 준비 · " + span, links: [{href: "apps/tardy/?tab=counsel", label: "🗣️ 상담 열기"}, {href: "apps/roster/", label: "📇 학생 카드"}],
          text: "[" + (c.sch.name || "학교") + "] " + who(c) + " 학부모님께\n" + span + "은 " + d.ev.t + "입니다.\n상담을 원하시면 편하신 날짜와 시간(대면·전화)을 " + md(ymd(add(parse(d.ev.d), -2))) + "까지 답장으로 알려 주세요.\n" + sign(c) + " 드림"
            + "\n\n─ 준비할 것 ─\n□ 학생 카드(상담·지각·미제출 기록) 살펴보기\n□ 상담 일정표 만들기\n□ 위 안내 문자 보내기"};
      },
      end: ["copy", "done"] },

    { id: "exam-prep", icon: "📝", name: "시험 준비 점검", days: 21,
      desc: "시험 며칠 전에 이원목적분류표 · 시험 범위까지 진도(남은 수업) · 출제 일정을 점검하는 목록을 만듭니다.",
      when: function(c, days){ return firstOf(c, null, days, "exam").map(function(e){ return {key: e.d + "|" + e.t, due: e.d, n: "D-" + diff(e.d, c.td), ev: e}; }); },
      read: function(c, o){ var P = TT.store.get("tt_mpace_v1", null); return {ev: o.ev, short: P && P.short > 0 ? P.short : 0}; },
      make: function(d){
        return {title: d.ev.t + " 준비 · " + md(d.ev.d), links: [{href: "apps/mblue/", label: "🎯 분류표"}, {href: "apps/mpace/", label: "⏳ 진도·시수"}],
          text: d.ev.t + " (" + md(d.ev.d) + ")까지 " + diff(d.ev.d, ymd(new Date())) + "일\n\n□ 이원목적분류표 만들기 (성취기준·난이도·배점)\n□ 시험 범위까지 반별 진도 점검" + (d.short ? " — 진도 부족 " + d.short + "반" : "") + "\n□ 출제·검토 일정 확인\n□ 수행평가 점수 정리"};
      },
      end: ["done", "copy"] },

    { id: "term-end", icon: "📑", name: "학기말 생기부 마감 점검", days: 7,
      desc: "방학 며칠 전에 교과 세특 · 행동특성 · 창체 · 출결 마감을 점검하는 목록을 만듭니다.",
      when: function(c, days){ return firstOf(c, /방학/, days, "off").map(function(e){ return {key: e.d, due: e.d, n: "D-" + diff(e.d, c.td), ev: e}; }); },
      read: function(c, o){ var N = TT.store.get("tt_notes_v1", null), n = N && Array.isArray(N.recs) ? N.recs.length : 0; return {ev: o.ev, recs: n}; },
      make: function(d){
        return {title: "학기말 생기부 마감 점검 · " + d.ev.t + " " + md(d.ev.d), links: [{href: "apps/record/", label: "📑 생기부 도우미"}, {href: "apps/tardy/", label: "🧭 출결"}],
          text: d.ev.t + " (" + md(d.ev.d) + ") 전에 끝낼 것\n\n□ 교과 세특 — 글자 수·유의 낱말 점검 (모인 학생 기록 " + d.recs + "건)\n□ 행동특성 및 종합의견\n□ 창체(자율·동아리·진로) 기록\n□ 출결 마감 · 결석신고서 정리\n□ 기록 마감 점검표 확인"};
      },
      end: ["done", "copy"] },

    { id: "year-items", icon: "📆", name: "연간 업무 다가옴", days: 7,
      desc: "연간 업무의 '해마다 돌아오는 일'을 학사일정 날짜에 맞춰 며칠 전에 띄웁니다 (예: 기말고사 출제·검토는 실제 시험 날짜를 따라감).",
      when: function(c, days){
        var Y = yearItems(c), out = [];
        Y.list.forEach(function(x){
          if(Y.done[Y.ay + "|" + x.it.id]) return;
          var k = diff(x.due, c.td); if(k > days || k < 0) return;                 // 지난 일은 연간 업무 화면에서 (첫 화면에 쌓이지 않게)
          out.push({key: Y.ay + "|" + x.it.id, due: x.due, n: k > 0 ? "D-" + k : "오늘", x: x, name: x.it.title});
        });
        return out;
      },
      read: function(c, o){ return o.x; },
      make: function(x){
        var t = typeof TT_TOOLS !== "undefined" ? TT_TOOLS.filter(function(z){ return z.id === x.it.tool && z.href; })[0] : null;
        return {title: x.it.title + " · " + md(x.due), links: t ? [{href: t.href, label: t.icon + " " + t.short}] : [],
          text: x.it.title + "\n날짜: " + md(x.due) + (x.by ? " (학사일정 '" + x.by + "'에 맞춤)" : "") + (x.it.note ? "\n메모: " + x.it.note : "") + "\n\n다 했으면 [✔ 다 했어요]를 누르세요. 연간 업무에도 체크됩니다."};
      },
      done: function(o){ var Yr = TT.store.get("tt_year_v1", null); if(!Yr) return; Yr.done = Yr.done || {}; Yr.done[o.key] = 1; TT.store.set("tt_year_v1", Yr); },
      end: ["done"] },

    { id: "doc-due", icon: "🏛️", name: "공문 마감", days: 3,
      desc: "찾기·입력(Ctrl+K)에 붙여 넣은 에듀파인 공문의 마감 며칠 전에 처리 카드를 띄웁니다. 다 하면 내 할 일에서도 지워집니다.",
      when: function(c, days){
        var M = TT.store.get("tt_mytodo_v1", null), out = [];
        (M && M.items || []).forEach(function(x){
          if(x.done || x.src !== "공문" || !x.date) return;
          var k = diff(x.date, c.td); if(k <= days) out.push({key: x.id, due: x.date, n: k > 0 ? "D-" + k : k === 0 ? "오늘" : "지남", it: x});
        });
        return out;
      },
      read: function(c, o){ return o.it; },
      make: function(x){
        return {title: "공문 마감 " + md(x.date), text: x.text.replace(/^\[공문\]\s*/, "") + "\n마감: " + md(x.date) + "\n\n□ 담당·제출 방법 확인\n□ 자료 모으기\n□ 에듀파인에서 처리(보고·회신)"};
      },
      done: function(o){ var M = TT.store.get("tt_mytodo_v1", null); if(!M) return; M.items.forEach(function(x){ if(x.id === o.key) x.done = true; }); TT.store.set("tt_mytodo_v1", M); window.dispatchEvent(new CustomEvent("tt-mytodo-change", {detail: "auto"})); },
      end: ["done"] }
  ];

  /* ---------- 16단계 도움 함수 ---------- */
  /* 다가오는(오늘~days일 뒤) 일정 중 행사마다 첫날 하나 */
  function firstOf(c, re, days, kind){
    var seen = {}, out = [];
    c.ev.filter(function(e){ return (!kind || e.k === kind) && (!re || re.test(e.t)) && e.d >= c.td && diff(e.d, c.td) <= days; })
      .sort(function(a, b){ return a.d < b.d ? -1 : 1; })
      .forEach(function(e){
        var name = e.t.replace(/\s*\(~.*\)$/, "").replace(/\s+/g, "");
        if(seen[name]) return; seen[name] = 1;
        var prev = c.ev.some(function(x){ return x.t === e.t && x.d < e.d && diff(e.d, x.d) <= 4; });   // 이미 시작한 행사는 빼기
        if(!prev) out.push(e);
      });
    return out;
  }
  function spanEnd(c, e){ var end = e.d; c.ev.forEach(function(x){ if(x.t === e.t && x.d > end && diff(x.d, e.d) <= 14) end = x.d; }); var m = /\(~(\d{1,2})\/(\d{1,2})\)/.exec(e.t); if(m){ var y = parse(e.d).getFullYear(); end = ymd(new Date(y, +m[1] - 1, +m[2])); } return end; }
  /* 연간 업무 → 올해 날짜. 학사일정에 같은 행사(상담 주간·중간고사·기말고사·방학 …)가 있으면 그 날짜를 따르고,
     "출제·검토"처럼 그 행사에 딸린 일은 기본 예시의 간격(예: 시험 14일 전)을 그대로 둡니다. */
  var KW = ["상담주간", "중간고사", "기말고사", "방학식", "방학", "졸업식", "입학식", "체험학습", "수학여행", "체육대회", "축제", "진단평가"];
  function keyOf(t){ var s = String(t).replace(/\s+/g, ""), sem = (/(1|2)학기/.exec(s) || [])[1] || ""; for(var i = 0; i < KW.length; i++) if(s.indexOf(KW[i]) >= 0) return {kw: KW[i], sem: sem}; return null; }
  function yearItems(c){
    var Yr = TT.store.get("tt_year_v1", null), now = c.now, ay = now.getMonth() >= 2 ? now.getFullYear() : now.getFullYear() - 1, list = [];
    if(!Yr || !Array.isArray(Yr.items)) return {list: [], done: {}, ay: ay};
    function base(it){ return ymd(new Date(it.m <= 2 ? ay + 1 : ay, it.m - 1, it.d || 1)); }
    function semOk(e, sem){ if(!sem) return true; var m = +e.d.slice(5, 7); return sem === "1" ? m >= 3 && m <= 8 : m >= 8 || m <= 2; }
    var from = ay + "-03-01", to = (ay + 1) + "-02-31";
    Yr.items.forEach(function(it){
      var b = base(it), k = keyOf(it.title), due = b, by = "";
      if(k){
        var ev = c.ev.filter(function(e){ var ek = keyOf(e.t); return e.d >= from && e.d <= to && ek && ek.kw === k.kw && semOk(e, k.sem) && (!ek.sem || !k.sem || ek.sem === k.sem); }).sort(function(a, b){ return a.d < b.d ? -1 : 1; })[0];
        if(ev){
          var anchor = Yr.items.filter(function(a){ var ak = keyOf(a.title); return ak && ak.kw === k.kw && ak.sem === k.sem && a.title.replace(/\s+/g, "").replace(/[12]학기/, "").length <= k.kw.length + 2; })[0];
          var off = anchor && anchor !== it ? diff(b, base(anchor)) : 0;
          due = ymd(add(parse(ev.d), off)); by = ev.t;
          if(!off && /상담주간|중간고사|기말고사|방학/.test(k.kw)) return;      // 행사 그 자체는 따로 준비 카드(상담 주간·시험·방학)가 있음
        }
      }
      list.push({it: it, due: due, by: by});
    });
    return {list: list, done: Yr.done || {}, ay: ay};
  }

  /* ---------- 상태 ---------- */
  function st(){ var o = TT.store.get(KEY, null) || {}; o.set = o.set || {}; o.log = o.log || {}; return o; }
  function save(o){
    var cut = Date.now() - 90 * 86400000; Object.keys(o.log).forEach(function(k){ if((o.log[k].at || 0) < cut) delete o.log[k]; });
    TT.store.set(KEY, o);
  }
  function conf(r, o){ var s = (o || st()).set[r.id] || {}; return {on: s.on !== false, days: s.days != null ? +s.days : r.days}; }

  /* 지금 준비된 일: [{r, o, k}] 급한 순서(마감이 가까운 것부터) */
  function ready(){
    var S = st(), c, out = [], td;
    try{ c = ctx(); }catch(e){ return []; }
    td = c.td;
    RULES.forEach(function(r){
      var cf = conf(r, S); if(!cf.on) return;
      var L = []; try{ L = r.when(c, cf.days) || []; }catch(e){}
      L.forEach(function(o){
        var k = r.id + "|" + o.key, g = S.log[k];
        if(g && (g.s === "done" || g.s === "skip")) return;
        if(g && g.s === "later" && g.until > td) return;
        out.push({r: r, o: o, k: k});
      });
    });
    return out.sort(function(a, b){ return a.o.due < b.o.due ? -1 : a.o.due > b.o.due ? 1 : 0; });
  }
  function mark(k, s){
    var S = st(), prev = S.log[k];
    S.log[k] = {s: s, at: Date.now(), until: s === "later" ? ymd(add(new Date(), 1)) : ""};
    save(S); changed();
    return function(){ var S2 = st(); if(prev) S2.log[k] = prev; else delete S2.log[k]; save(S2); changed(); };
  }
  function changed(){ window.dispatchEvent(new Event("tt-auto-change")); }

  /* ---------- 미리보기 (확인 → 복사/인쇄/저장 · 미루기 · 안 함) ---------- */
  (function(){
    var s = document.createElement("style");
    s.textContent = ".auDlg{width:min(560px,94vw)}.auDlg textarea{width:100%;min-height:min(42vh,320px);font:inherit;font-size:14.5px;line-height:1.6;border:1px solid var(--line,#dde3ea);border-radius:10px;padding:10px;resize:vertical}"
      + ".auDlg .meta{font-size:12.5px;color:var(--sub,#5b6773);margin:2px 0 8px}.auDlg .acts{flex-wrap:wrap;gap:6px}.auDlg .acts .l{display:flex;gap:6px}"
      + ".auSet label.rr{display:grid;grid-template-columns:auto 1fr auto;gap:4px 10px;align-items:center;padding:8px 0;border-top:1px solid var(--line,#eef1f4);font-size:14px}"
      + ".auSet label.rr small{grid-column:2/4;color:var(--sub,#5b6773);font-size:12.5px;line-height:1.45}.auSet input[type=number]{width:56px;font:inherit;padding:3px 6px;border:1px solid var(--line,#dde3ea);border-radius:8px}";
    document.head.appendChild(s);
  })();
  var END = {copy: "📋 복사", print: "🖨 인쇄", save: "💾 저장", done: "✔ 다 했어요"};
  function open(item){
    var c = ctx(), r = item.r, out;
    try{ out = r.make(r.read(c, item.o), item.o, c); }catch(e){ TT.ui.toast("준비하지 못했습니다. 자료를 확인해 주세요."); return; }
    var d = document.createElement("dialog"); d.className = "auDlg";
    d.innerHTML = "<form><h2>" + r.icon + " " + esc(out.title) + "</h2><p class=\"meta\">쌤 노트가 준비해 두었습니다. 필요하면 고친 뒤 끝내세요.</p><textarea spellcheck=\"false\"></textarea>"
      + '<div class="acts"><div class="l"><button type="button" class="btn" data-a="later" title="내일 다시 띄웁니다">⏰ 미루기</button><button type="button" class="btn" data-a="skip" title="이번 일은 다시 띄우지 않습니다">이번엔 안 함</button></div>'
      + '<div class="r">' + r.end.map(function(e, i){ return '<button type="button" class="btn' + (i === 0 ? " primary" : "") + '" data-a="' + e + '">' + END[e] + "</button>"; }).join("") + "</div></div>"
      + (out.links && out.links.length ? '<p class="meta" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' + out.links.map(function(l){ return '<a class="btn" style="padding:4px 10px;font-size:13px" href="' + TT.BASE + esc(l.href) + '">' + esc(l.label) + "</a>"; }).join("") + "</p>" : "")
      + '<p class="meta" style="margin-top:8px"><a href="#" data-a="set">⚙ 자동 준비 설정</a> · ' + esc(r.desc) + "</p></form>";
    document.body.appendChild(d); d.addEventListener("close", function(){ d.remove(); });
    var ta = d.querySelector("textarea"); ta.value = out.text;
    function finish(msg){ try{ if(r.done) r.done(item.o); }catch(e){} TT.ui.toast(msg, mark(item.k, "done")); }
    d.addEventListener("click", function(e){
      var b = e.target.closest("[data-a]"); if(!b) return; e.preventDefault();
      var a = b.getAttribute("data-a"), text = ta.value;
      if(a === "done"){ d.close(); finish("다 한 일로 표시했어요."); return; }
      if(a === "set"){ d.close(); settings(); return; }
      if(a === "later"){ d.close(); TT.ui.toast("내일 다시 띄웁니다.", mark(item.k, "later")); return; }
      if(a === "skip"){ d.close(); TT.ui.toast("이번 일은 다시 띄우지 않습니다.", mark(item.k, "skip")); return; }
      if(a === "copy"){
        var ok = function(){ d.close(); finish("복사했습니다. 붙여 넣으세요(Ctrl+V). 처리한 일로 표시했어요."); };
        if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function(){ ta.select(); document.execCommand("copy"); ok(); });
        else { ta.select(); document.execCommand("copy"); ok(); }
      }
      if(a === "print"){
        var w = window.open("", "_blank"); if(!w){ TT.ui.toast("새 창이 막혔어요. 팝업을 허용해 주세요."); return; }
        w.document.write("<!DOCTYPE html><meta charset=utf-8><title>" + esc(out.title) + "</title><style>body{font-family:'Malgun Gothic',sans-serif;font-size:16px;line-height:1.8;padding:24px;white-space:pre-wrap}</style>" + esc(text));
        w.document.close(); w.focus(); w.print();
        d.close(); finish("인쇄 창을 열었습니다. 처리한 일로 표시했어요.");
      }
      if(a === "save"){
        TT.util.download(TT.util.safe(out.title) + ".txt", "﻿" + text.replace(/\n/g, "\r\n"), "text/plain");
        d.close(); finish("다운로드 폴더에 저장했습니다. 처리한 일로 표시했어요.");
      }
    });
    d.showModal(); ta.focus(); ta.setSelectionRange(0, 0); ta.scrollTop = 0;
  }
  /* 준비된 일 모두 (첫 화면 [더 보기]) */
  function list(){
    var R = ready(), d = document.createElement("dialog"); d.className = "auDlg";
    d.innerHTML = "<form><h2>✨ 준비됨 " + R.length + "건</h2><p class=\"meta\">급한 순서입니다. 눌러서 확인하세요.</p><div class=\"auL\">"
      + (R.length ? R.map(function(x, i){ return '<button type="button" class="btn" style="display:flex;width:100%;margin:4px 0;text-align:left;gap:8px" data-i="' + i + '"><span>' + x.r.icon + '</span><span style="flex:1">' + esc(x.o.name || x.r.name) + '</span><small style="color:var(--sub)">' + esc(x.o.n) + "</small></button>"; }).join("") : '<p class="meta">지금 준비된 일이 없습니다.</p>')
      + '</div><div class="acts"><a href="#" data-a="set">⚙ 자동 준비 설정</a><div class="r"><button type="button" class="btn" data-a="close">닫기</button></div></div></form>';
    document.body.appendChild(d); d.addEventListener("close", function(){ d.remove(); });
    d.addEventListener("click", function(e){
      var b = e.target.closest("[data-i],[data-a]"); if(!b) return; e.preventDefault();
      if(b.hasAttribute("data-i")){ d.close(); open(R[+b.getAttribute("data-i")]); return; }
      d.close(); if(b.getAttribute("data-a") === "set") settings();
    });
    d.showModal();
  }
  /* 규칙마다 켜기·끄기와 "며칠 전"만 */
  function settings(){
    var S = st(), d = document.createElement("dialog"); d.className = "auDlg auSet";
    d.innerHTML = "<form><h2>⚙ 자동 준비 설정</h2><p class=\"meta\">켜 둔 일은 때가 되면 첫 화면 '오늘 챙길 것'에 \"준비됨\"으로 뜹니다. 모두 이 기기 안에서만 계산합니다.</p>"
      + RULES.map(function(r){ var cf = conf(r, S);
          return '<label class="rr"><input type="checkbox" data-on="' + r.id + '"' + (cf.on ? " checked" : "") + "><b>" + r.icon + " " + esc(r.name) + "</b>"
            + (r.days != null ? '<span><input type="number" min="0" max="60" data-days="' + r.id + '" value="' + cf.days + '"> 일 ' + (r.id === "submit-missing" ? "뒤" : "전") + "</span>" : "<span></span>")
            + "<small>" + esc(r.desc) + "</small></label>"; }).join("")
      + '<div class="acts"><span></span><div class="r"><button type="button" class="btn" data-a="no">취소</button><button type="submit" class="btn primary">저장</button></div></div></form>';
    document.body.appendChild(d); d.addEventListener("close", function(){ d.remove(); });
    d.querySelector("[data-a=no]").onclick = function(){ d.close(); };
    d.querySelector("form").onsubmit = function(e){
      e.preventDefault(); var S2 = st();
      RULES.forEach(function(r){
        var on = d.querySelector('[data-on="' + r.id + '"]').checked, di = d.querySelector('[data-days="' + r.id + '"]');
        S2.set[r.id] = {on: on}; if(di){ var v = parseInt(di.value, 10); S2.set[r.id].days = isFinite(v) ? Math.max(0, Math.min(60, v)) : r.days; }
      });
      save(S2); d.close(); changed(); TT.ui.toast("자동 준비 설정을 저장했습니다.");
    };
    d.showModal();
  }

  return {
    rules: RULES, ready: ready, open: open, list: list, settings: settings, mark: mark,
    add: function(r){ if(r && r.id && !RULES.some(function(x){ return x.id === r.id; })) RULES.push(r); }
  };
})();
