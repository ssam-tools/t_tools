/* 쌤 노트 v2.45 · 홈 오른쪽 칸 (넓은 화면 PC만) — 오늘의 흐름을 한눈에
   ① 내 시간표: [오늘 | 이번 주] · 지금 교시 강조 · 기록한 교시 ✓ · 기록 안 한 교시 '기록' · 교체된 칸 표시 · 누르면 그 수업 자료
      [나이스로 확인]: 나이스(open.neis.go.kr) 학급 시간표에서 내 반·내 교과 칸을 읽어 이번 주 교체를 찾아 줌 → 바뀐 곳만 보여 주고, [반영]을 눌러야 바뀜
   ② 작은 달력: 학교 업무판(월간) · 학사일정 · 연간 업무 · 내 할 일 마감을 점으로 — 마우스를 올리면 그날 내용, 누르면 아래에 그날 목록
   - 학생 이름은 쓰지 않습니다. 업무판에는 날짜·공용 비밀번호만, 나이스에는 학교 코드·학년·반·날짜만 보냅니다. */
(function(){
  "use strict";
  if(!window.TT || window.TT_SBSIDE || TT.classroom) return;
  var R = document.documentElement, DOW = "일월화수목금토", side = null;
  var st = {view: "", mon: 0, pick: "", neis: null, busy: false};
  var BMK = "tt_board_month_v1";
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function add(d, n){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function toMin(t){ var a = String(t).split(":"); return (+a[0]) * 60 + (+a[1]); }
  function clsTxt(s){ var c = +s.cls; return c > 100 ? Math.floor(c / 100) + "-" + (c % 100) : String(s.code || ""); }
  function view(){ if(st.view) return st.view; try{ return localStorage.getItem("sb_side_view") || "day"; }catch(e){ return "day"; } }
  function isSet(){ return document.body.classList.contains("inmenu") && /^#settings$/.test(location.hash || ""); }   // v2.47 설정 화면: 내 쌤 노트 상태
  function on(){
    return R.getAttribute("data-ui") === "ssambi" && document.body.classList.contains("sbOn") && (!document.body.classList.contains("inmenu") || isSet())
      && window.innerWidth >= 1280 && !(TT.classroom);
  }

  /* ── v2.47 설정 화면 오른쪽: ① 준비 점검(빠진 것만 눈에 띄게, 누르면 바로 그 설정) ② 안전·기기(백업 · 동기화 · 저장 공간 · 버전) ── */
  var space = null;                                                     // 이 기기 저장 공간 (한 번만 재고 기억)
  function readSpace(){
    if(space || !navigator.storage || !navigator.storage.estimate) return;
    space = {busy: 1}; navigator.storage.estimate().then(function(e){ space = {u: e.usage || 0, q: e.quota || 0}; paint(); }).catch(function(){ space = {}; });
  }
  function mb(n){ return n >= 1073741824 ? (n / 1073741824).toFixed(1) + "GB" : Math.max(1, Math.round(n / 1048576)) + "MB"; }
  function checks(){
    var s = TT.school.load() || {}, bd = TT.store.get("tt_board_v1", {}) || {}, Cal = TT.store.get("tt_calendar_v1", null);
    var rs = false; try{ rs = TT.roster.has(); }catch(e){}
    var sub = s.role === "subject";
    return [
      {ok: !!(s.name && s.teacher), t: "학교·선생님 정보", hint: "이름이 결석신고서·문자에 들어가요", act: "mSchool"},
      {ok: TT.timetable.has(), t: "내 시간표", hint: "지금 수업·기록 안 한 수업을 알려 줘요", href: "apps/timetable/"},
      sub ? null : {ok: rs, t: "학급 명렬표", hint: "출결·상담·학생 카드에 쓰여요", href: "apps/roster/"},
      {ok: !!(Cal && Cal.events && Cal.events.length), t: "학사일정", hint: "D-day·달력·남은 수업일", href: "apps/setup/"},
      {ok: !!(s.neisA && s.neisS && s.neisKey), t: "나이스 연결", hint: s.neisA && s.neisS ? "인증키를 넣으면 교체 확인이 돼요" : "급식·시간표 교체 확인", act: "mSchool"},
      {ok: !!(bd.url && bd.pw), t: "학교 업무판", hint: "월간 업무가 달력에 보여요", act: "mBoard"}
    ].filter(Boolean);
  }
  function setHTML(){
    var C = checks(), n = C.filter(function(c){ return c.ok; }).length, all = n === C.length;
    var h = '<section class="sdC sdS" aria-label="준비 점검"><div class="sdH"><b>준비 점검</b><span class="sdCnt' + (all ? " ok" : "") + '">' + n + " / " + C.length + "</span></div>"
      + '<span class="sdBar" aria-hidden="true"><i style="width:' + Math.round(n / C.length * 100) + '%"></i></span>'
      + (all ? '<p class="sdAll">🎉 모두 준비됐어요!</p>' : "")
      + '<div class="sdChk">' + C.map(function(c){
          var tag = c.href ? 'a href="' + esc(c.href) + '"' : 'button type="button" data-act="' + c.act + '"';
          return "<" + tag + ' class="ck' + (c.ok ? " ok" : "") + '" title="' + esc(c.hint) + '"><i>' + (c.ok ? "✓" : "!") + "</i><span><b>" + esc(c.t) + "</b>" + (c.ok ? "" : "<small>" + esc(c.hint) + "</small>") + "</span>" + (c.ok ? "" : "<em>넣기 ›</em>") + "</" + (c.href ? "a" : "button") + ">";
        }).join("") + "</div></section>";
    /* 안전·기기 */
    var bd = TT.backup && TT.backup.daysSince ? TT.backup.daysSince() : null, has = TT.backup && TT.backup.hasData ? TT.backup.hasData() : true;
    var bWarn = has && (bd == null || bd >= 14);
    var V = window.Vault && Vault.status ? Vault.status() : null, vm = V ? V.mode : "";
    var vTxt = vm === "personal" ? "켜짐" + (V.last ? " · " + ago(V.last) : "") : vm === "classroom" ? "교실 기기(공용)" : "꺼짐";
    readSpace();
    h += '<section class="sdC sdV" aria-label="안전·기기"><div class="sdH"><b>안전·기기</b></div>'
      + row("💾", "백업", bd == null ? "아직 안 했어요" : bd === 0 ? "오늘 ✓" : bd + "일 전", bWarn ? "warn" : "", bWarn ? '<button type="button" class="sm p" data-act="mBackup">지금 백업</button>' : "")
      + row("☁️", "기기 연결", vTxt, vm ? "" : "dim", '<button type="button" class="sm" data-act="mVault">' + (vm ? "관리" : "켜기") + "</button>")
      + row("💽", "이 기기 저장", space && space.u != null ? mb(space.u) + " 사용" + (space.q ? " · 남은 " + mb(Math.max(0, space.q - space.u)) : "") : "재는 중…", "", "")
      + row("⌨️", "단축키", "Alt+1~5 메뉴 · / 찾기", "", '<button type="button" class="sm" data-act="mKeys">보기</button>')
      + '<button type="button" class="sdVer" data-hist title="제작 히스토리">🦉 쌤 노트 v' + esc(TT.VERSION) + ' <span>· 무엇이 바뀌었나 ›</span></button>'
      + "</section>";
    return h;
  }
  function ago(t){ var m = Math.round((Date.now() - t) / 60000); return m < 1 ? "방금" : m < 60 ? m + "분 전" : m < 1440 ? Math.round(m / 60) + "시간 전" : Math.round(m / 1440) + "일 전"; }
  function row(ic, t, v, cls, btn){ return '<div class="sdR' + (cls ? " " + cls : "") + '"><i>' + ic + "</i><span><b>" + t + "</b><small>" + esc(v) + "</small></span>" + btn + "</div>"; }

  /* ── ① 내 시간표 ── */
  function taught(){ var J = TT.store.get("tt_journal_v1", null); return (J && J.taught) || {}; }
  function dayHTML(){
    var t = TT.timetable.load(), d = new Date(), w = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), td = ymd(d), tg = taught();
    if(!t) return '<p class="sdE">내 시간표를 넣으면 여기에 나와요.<br><a href="apps/timetable/">시간표 넣기</a></p>';
    var weekend = w < 1 || w > 5, day = weekend ? add(d, w === 6 ? 2 : 1) : d, S = TT.timetable.day(day), by = {};
    S.forEach(function(s){ by[s.n] = s; });
    var h = weekend ? '<div class="sdNote">월요일 시간표</div>' : "", prevEnd = 0;
    t.periods.forEach(function(p){
      var st0 = toMin(p.t), s = by[p.n];
      if(prevEnd && st0 - prevEnd >= 30) h += '<div class="sdGap"><span>점심</span>' + (!weekend && m >= prevEnd && m < st0 ? '<b>지금</b>' : "") + "</div>";
      prevEnd = st0 + 45;
      var now = !weekend && m >= st0 && m < st0 + 45, past = !weekend && m >= st0 + 45, done = s && tg[td + "|" + p.n];
      var cls = "sdP" + (now ? " now" : "") + (past ? " past" : "") + (s ? "" : " free") + (s && s.chg ? " chg" : "");
      var miss = s && past && !done, tail = !s ? "" : now ? "<em>지금</em>" : done ? '<em class="ok">✓</em>' : miss ? '<span class="miss">기록</span>' : "<em>" + p.t + "</em>";
      var main = s ? "<b>" + esc(clsTxt(s)) + "</b><small>" + esc(s.subj || "") + (s.chg ? " · 교체" : "") + "</small>" : '<small>공강</small>';
      var href = miss ? "apps/journal/" : s && +s.cls > 100 ? "apps/book/?lesson=1&c=" + (+s.cls) : "";
      h += (href ? '<a class="' + cls + '" href="' + href + '" title="' + p.n + "교시 " + esc(clsTxt(s)) + (miss ? " 수업 기록하기" : " 자료 열기") + '">' : '<div class="' + cls + '">')
        + '<span class="n">' + p.n + "</span>" + '<span class="c">' + main + "</span>" + tail + (href ? "</a>" : "</div>");
    });
    return h;
  }
  function weekHTML(){
    var t = TT.timetable.load(); if(!t) return dayHTML();
    var d = new Date(), w = d.getDay(), monD = add(d, w === 0 ? 1 : w === 6 ? 2 : 1 - w), mon = ymd(monD), S = TT.timetable.week(mon), B = t.slots, td = ymd(d);
    var h = '<table class="sdW"><thead><tr><th></th>';
    for(var i = 0; i < 5; i++){ var di = add(monD, i); h += "<th" + (ymd(di) === td ? ' class="td"' : "") + ">" + DOW[i + 1] + "<small>" + di.getDate() + "</small></th>"; }
    h += "</tr></thead><tbody>";
    t.periods.forEach(function(p){
      h += "<tr><th>" + p.n + "</th>";
      for(var i = 1; i <= 5; i++){
        var k = i + "-" + p.n, s = S[k], chg = !TT.timetable.same(s, B[k]);
        h += "<td" + (ymd(add(monD, i - 1)) === td ? ' class="td' + (chg ? " chg" : "") + '"' : chg ? ' class="chg"' : "") + (chg ? ' title="이번 주만 바뀐 칸"' : "") + ">" + (s ? esc(clsTxt(s)) : "") + "</td>";
      }
      h += "</tr>";
    });
    return h + "</tbody></table>";
  }

  /* 나이스 학급 시간표로 이번 주 교체 찾기 (중학교 misTimetable) — 바꾸기 전에 바뀐 곳을 보여 줌 */
  function neisCheck(){
    var s = TT.school.load() || {}, t = TT.timetable.load();
    if(!t){ location.href = "apps/timetable/"; return; }
    if(!s.neisA || !s.neisS){ st.neis = {msg: "먼저 나이스에서 우리 학교를 한 번 찾아 연결해 주세요.", school: 1}; paint(); return; }
    if(!s.neisKey){ st.neis = {msg: "나이스 인증키를 넣으면 시간표를 읽을 수 있어요.", key: 1}; paint(); return; }   // v2.46 인증키를 여기서 바로 넣기
    var d = new Date(), w = d.getDay(), monD = add(d, w === 0 ? 1 : w === 6 ? 2 : 1 - w), mon = ymd(monD), base = t.slots, my = {};
    Object.keys(base).forEach(function(k){ var x = base[k]; if(x && +x.cls > 100) my[+x.cls] = my[+x.cls] || x.subj || s.subject || ""; });
    var C = Object.keys(my); if(!C.length){ st.neis = {msg: "시간표에 반(예: 304)이 들어 있어야 확인할 수 있어요."}; paint(); return; }
    var ay = monD.getMonth() >= 2 ? monD.getFullYear() : monD.getFullYear() - 1, sem = monD.getMonth() >= 2 && monD.getMonth() <= 7 ? 1 : 2;
    var f = ymd(monD).replace(/-/g, ""), to = ymd(add(monD, 4)).replace(/-/g, "");
    function norm(x){ return String(x || "").replace(/[\s·*]/g, ""); }
    function match(a, b){ a = norm(a); b = norm(b); return !!a && !!b && (a.indexOf(b) === 0 || b.indexOf(a) === 0); }
    st.busy = true; st.neis = {msg: "나이스에서 " + C.length + "개 반 시간표를 읽는 중…"}; paint();
    Promise.all(C.map(function(c){
      var q = {Type: "json", KEY: s.neisKey, pIndex: 1, pSize: 100, ATPT_OFCDC_SC_CODE: s.neisA, SD_SCHUL_CODE: s.neisS, AY: ay, SEM: sem, TI_FROM_YMD: f, TI_TO_YMD: to, GRADE: Math.floor(c / 100), CLASS_NM: c % 100};
      var url = "https://open.neis.go.kr/hub/misTimetable?" + Object.keys(q).map(function(k){ return k + "=" + encodeURIComponent(q[k]); }).join("&");
      return fetch(url, {credentials: "omit", cache: "no-store"}).then(function(r){ return r.json(); }).then(function(j){
        var A = j && j.misTimetable, rows = A && A[1] && A[1].row ? A[1].row : [];
        return {c: +c, rows: rows};
      });
    })).then(function(res){
      var got = {}, found = {};                                         // got[요일] = 그날 나이스 자료가 있음
      res.forEach(function(r){ r.rows.forEach(function(x){
        var y = String(x.ALL_TI_YMD || ""); if(y.length !== 8) return;
        var dt = new Date(+y.slice(0, 4), +y.slice(4, 6) - 1, +y.slice(6, 8)), wd = dt.getDay(); if(wd < 1 || wd > 5) return;
        got[wd] = 1; if(match(x.ITRT_CNTNT, my[r.c])) found[wd + "-" + (+x.PERIO)] = r.c;
      }); });
      if(!Object.keys(got).length){ st.neis = {msg: "나이스에 이번 주 시간표가 아직 없어요. 학교에서 입력한 뒤 다시 확인해 주세요."}; return; }
      var cur = TT.timetable.week(mon), next = {}, diff = [];
      Object.keys(cur).forEach(function(k){ next[k] = cur[k]; });
      t.periods.forEach(function(p){ for(var i = 1; i <= 5; i++){
        if(!got[i]) continue;                                           // 나이스에 없는 날은 그대로 둠
        var k = i + "-" + p.n, c = found[k], was = cur[k];
        var want = c ? (was && +was.cls === c ? was : {code: String(c), cls: c, subj: my[c]}) : null;
        if(!TT.timetable.same(want, was)){ diff.push(DOW[i] + " " + p.n + "교시: " + (was ? clsTxt(was) : "공강") + " → " + (want ? clsTxt(want) : "공강")); }
        if(want) next[k] = want; else delete next[k];
      } });
      st.neis = diff.length ? {msg: "이번 주 바뀐 곳 " + diff.length + "개", list: diff, apply: function(){ TT.timetable.setWeek(mon, next); TT.ui.toast("이번 주 시간표에 반영했어요"); window.dispatchEvent(new Event("tt-home-change")); }}
        : {msg: "✓ 나이스 시간표와 같아요.", ok: 1};
    }).catch(function(){ st.neis = {msg: "나이스에 연결하지 못했어요. 잠시 뒤 다시 해 주세요."}; })
      .then(function(){ st.busy = false; paint(); });
  }

  /* ── ② 작은 달력 ── */
  function mine(){                                                      // 이 기기 자료 (업무판으로 보내지 않음)
    var out = [];
    var Mt = TT.store.get("tt_mytodo_v1", null); if(Mt && Array.isArray(Mt.items)) Mt.items.forEach(function(x){ if(x.date && !x.done) out.push({d: x.date, t: x.text, k: "me"}); });
    var Cal = TT.store.get("tt_calendar_v1", null); if(Cal && Array.isArray(Cal.events)) Cal.events.forEach(function(e){ out.push({d: e.d, t: e.t, k: /방학|휴업|공휴|재량|개교기념/.test(e.t) ? "off" : "sch"}); });
    var Yr = TT.store.get("tt_year_v1", null), t0 = new Date(), ay = t0.getMonth() >= 2 ? t0.getFullYear() : t0.getFullYear() - 1;
    if(Yr && Array.isArray(Yr.items)) Yr.items.forEach(function(it){ if(!it.d || (Yr.done || {})[ay + "|" + it.id]) return; var y = it.m <= 2 ? ay + 1 : ay; out.push({d: y + "-" + pad(it.m) + "-" + pad(it.d), t: it.title, k: "me"}); });
    return out;
  }
  function boardCfg(){ var c = TT.store.get("tt_board_v1", {}) || {}; return c.url && c.pw && !c.hidden ? c : null; }
  function monthKey(D){ return D.getFullYear() + "-" + pad(D.getMonth() + 1); }
  function boardItems(D){
    var c = boardCfg(), mk = monthKey(D), C = TT.store.get(BMK, null) || {};
    var hit = c && C.url === c.url && C.m && C.m[mk];
    if(c && (!hit || Date.now() - hit.at > 30 * 60000) && !boardItems.busy[mk]){
      boardItems.busy[mk] = 1;
      var a = new Date(D.getFullYear(), D.getMonth(), 1), b = new Date(D.getFullYear(), D.getMonth() + 1, 0);
      fetch(c.url, {method: "POST", redirect: "follow", credentials: "omit", cache: "no-store", headers: {"Content-Type": "text/plain;charset=utf-8"},
        body: JSON.stringify({action: "week", pw: c.pw, from: ymd(a), to: ymd(b)})})
        .then(function(r){ return r.text(); }).then(function(tx){
          var j = JSON.parse(tx); if(!j || !j.ok) throw 0;
          var C2 = TT.store.get(BMK, null) || {}; if(C2.url !== c.url) C2 = {url: c.url, m: {}};
          C2.m = C2.m || {}; C2.m[mk] = {at: Date.now(), items: (j.items || []).filter(function(x){ return x.date; }).map(function(x){ return {d: x.date, t: x.text || "", dept: x.dept || "", type: x.type || "item", imp: x.important === "1"}; })};
          Object.keys(C2.m).sort().slice(0, -3).forEach(function(k){ delete C2.m[k]; });   // 석 달 치만
          TT.store.set(BMK, C2); paint(); try{ window.dispatchEvent(new Event("tt-board")); }catch(e){}   // v2.59 휴대폰 찾기도 다시 그림
        }).catch(function(){}).then(function(){ boardItems.busy[mk] = 0; });
    }
    return hit ? hit.items.map(function(x){ return {d: x.d, t: (x.dept ? "[" + String(x.dept).replace(/(부|실)$/, "") + "] " : "") + x.t, k: x.type === "day" ? (x.imp ? "off" : "sch") : "bd"}; }) : [];
  }
  boardItems.busy = {};
  function calHTML(){
    var t = new Date(), D = new Date(t.getFullYear(), t.getMonth() + st.mon, 1), td = ymd(t), L = mine().concat(boardItems(D)), by = {};
    L.forEach(function(x){ (by[x.d] = by[x.d] || []).push(x); });
    var h = '<div class="sdCh"><button type="button" data-cm="-1" aria-label="이전 달">‹</button><b>' + (D.getFullYear() !== t.getFullYear() ? D.getFullYear() + "년 " : "") + (D.getMonth() + 1) + '월</b><button type="button" data-cm="1" aria-label="다음 달">›</button>'
      + (st.mon ? '<button type="button" class="tdb" data-cm="0">오늘</button>' : "") + "</div>";
    h += '<div class="sdG">' + "일월화수목금토".split("").map(function(x, i){ return '<span class="hd' + (i === 0 ? " su" : i === 6 ? " sa" : "") + '">' + x + "</span>"; }).join("");
    for(var i = 0; i < D.getDay(); i++) h += "<span></span>";
    var last = new Date(D.getFullYear(), D.getMonth() + 1, 0).getDate();
    for(var dd = 1; dd <= last; dd++){
      var k = D.getFullYear() + "-" + pad(D.getMonth() + 1) + "-" + pad(dd), X = by[k] || [], wd = new Date(D.getFullYear(), D.getMonth(), dd).getDay();
      var kinds = {}; X.forEach(function(x){ kinds[x.k] = 1; });
      var tip = X.length ? (D.getMonth() + 1) + "/" + dd + " (" + DOW[wd] + ")\n" + X.slice(0, 6).map(function(x){ return "· " + x.t; }).join("\n") + (X.length > 6 ? "\n… " + (X.length - 6) + "개 더" : "") : "";
      h += '<button type="button" class="d' + (k === td ? " td" : "") + (k === st.pick ? " pk" : "") + (k < td ? " past" : "") + (kinds.off || wd === 0 ? " off" : wd === 6 ? " sa" : "") + '" data-day="' + k + '"' + (tip ? ' title="' + esc(tip) + '"' : "") + ">" + dd
        + '<span class="dots">' + ["off", "sch", "bd", "me"].filter(function(q){ return kinds[q]; }).map(function(q){ return '<span class="dt k-' + q + '"></span>'; }).join("") + "</span></button>";
    }
    h += "</div>";
    /* 아래: 고른 날 → 그날 목록, 아니면 다가오는 일 (내 일·학사 먼저, 업무판은 그다음) */
    var lst, head;
    if(st.pick){ var pd = new Date(+st.pick.slice(0, 4), +st.pick.slice(5, 7) - 1, +st.pick.slice(8, 10)); head = (pd.getMonth() + 1) + "/" + pd.getDate() + " (" + DOW[pd.getDay()] + ")"; lst = (by[st.pick] || []).slice(); }
    else{
      var mk0 = monthKey(D), from = st.mon > 0 ? mk0 + "-01" : td;              // v2.46 보고 있는 달의 남은 일만 (이번 달이면 오늘부터)
      head = st.mon < 0 ? (D.getMonth() + 1) + "월 일정" : (st.mon ? (D.getMonth() + 1) + "월 할 일" : "이번 달 남은 일"); var rank = {me: 0, off: 1, sch: 1, bd: 2};
      lst = L.filter(function(x){ return String(x.d).slice(0, 7) === mk0 && (st.mon < 0 || x.d >= from); }).sort(function(a, b){ return a.d < b.d ? -1 : a.d > b.d ? 1 : rank[a.k] - rank[b.k]; });
      var seen = {}; lst = lst.filter(function(x){ var q = x.d + x.t; if(seen[q]) return false; seen[q] = 1; return true; });
    }
    h += '<div class="sdL"><div class="lh"><span>' + esc(head) + (lst.length ? ' <em class="ct">' + lst.length + "</em>" : "") + "</span>" + (st.pick ? '<button type="button" data-day="">✕</button>' : "") + "</div>"
      + (lst.length ? lst.map(function(x){ var dt = x.d.slice(5).replace(/^0/, "").replace("-", "/").replace("/0", "/"); return '<div class="li k-' + x.k + '" title="' + esc(x.t) + '">' + (st.pick ? "" : "<span>" + dt + "</span>") + esc(x.t) + "</div>"; }).join("") : '<div class="li none">' + (st.pick ? "일정이 없어요" : "남은 일정이 없어요") + "</div>")
      + "</div>"
      + (boardCfg() ? "" : '<div class="sdHint">학교 업무판을 연결하면 월간 업무도 여기에 보여요 · 설정 → 시작 세팅 → 학교 연결</div>');
    return h;
  }

  /* v2.46 나이스 인증키 저장 (이 기기 · 학교·선생님 설정과 같은 자리 tt_school_v1.neisKey) → 바로 교체 확인 */
  function saveKey(){
    var i = side && side.querySelector("#sdKey"), v = i ? i.value.replace(/\s+/g, "") : "";
    if(!/^[0-9a-zA-Z]{16,40}$/.test(v)){ TT.ui.toast("인증키를 확인해 주세요 (영문·숫자 32자 정도)"); if(i) i.focus(); return; }
    TT.school.save({neisKey: v}); try{ var o = JSON.parse(localStorage.getItem("snmeal_v1") || "{}"); o.w = {}; localStorage.setItem("snmeal_v1", JSON.stringify(o)); }catch(x){}
    TT.ui.toast("나이스 인증키를 저장했어요"); st.neis = null; neisCheck();
  }

  /* ── 그리기 ── */
  function paint(){
    if(!on()){ if(side){ side.hidden = true; } if(document.body.classList.contains("sbSideOn")) document.body.classList.remove("sbSideOn"); return; }
    if(!side){
      side = document.createElement("aside"); side.id = "sbSide"; side.setAttribute("aria-label", "오늘 한눈에");
      document.body.appendChild(side);
      side.addEventListener("click", function(e){
        var b = e.target.closest("[data-v],[data-cm],[data-day],[data-neis],[data-napply],[data-nclose],[data-nkey],[data-nsch],[data-act],[data-hist]"); if(!b) return;
        if(b.hasAttribute("data-act")){ var mb0 = document.getElementById(b.getAttribute("data-act")); if(mb0) mb0.click(); else TT.ui.toast("잠시 뒤 다시 눌러 주세요"); return; }
        if(b.hasAttribute("data-hist")){ var cr = document.getElementById("sbCredit"); if(cr) cr.click(); return; }
        if(b.hasAttribute("data-nsch")){ st.neis = null; paint(); if(window.TTMeal) TTMeal.open(); return; }
        if(b.hasAttribute("data-nkey")){ saveKey(); return; }
        if(b.hasAttribute("data-v")){ st.view = b.getAttribute("data-v"); try{ localStorage.setItem("sb_side_view", st.view); }catch(x){} }
        else if(b.hasAttribute("data-cm")){ var v = +b.getAttribute("data-cm"); st.mon = v ? st.mon + v : 0; st.pick = ""; }
        else if(b.hasAttribute("data-day")){ var k = b.getAttribute("data-day"); st.pick = st.pick === k ? "" : k; }
        else if(b.hasAttribute("data-neis")){ if(!st.busy) neisCheck(); return; }
        else if(b.hasAttribute("data-napply")){ if(st.neis && st.neis.apply) st.neis.apply(); st.neis = null; }
        else if(b.hasAttribute("data-nclose")){ st.neis = null; }
        paint();
      });
    }
    side.hidden = false; if(!document.body.classList.contains("sbSideOn")) document.body.classList.add("sbSideOn");
    if(isSet()){ side.classList.add("set"); side.innerHTML = setHTML(); return; }
    side.classList.remove("set");
    var v = view(), N = st.neis, ki = side.querySelector("#sdKey"), kv = ki ? ki.value : "", kf = ki && document.activeElement === ki;   // 적던 인증키는 다시 그려도 그대로
    var sl = side.querySelector(".sdL"), sy = sl ? sl.scrollTop : 0;
    side.innerHTML = '<section class="sdC sdT" aria-label="내 시간표"><div class="sdH"><b>내 시간표</b><span class="seg" role="group" aria-label="보기">'
      + '<button type="button" data-v="day" aria-pressed="' + (v === "day") + '">오늘</button><button type="button" data-v="week" aria-pressed="' + (v === "week") + '">이번 주</button></span></div>'
      + '<div class="sdB">' + (v === "week" ? weekHTML() : dayHTML()) + "</div>"
      + '<div class="sdF"><button type="button" data-neis title="나이스 학급 시간표와 비교해 이번 주 교체를 찾아요"' + (st.busy ? " disabled" : "") + ">↻ 교체 확인</button><a href=\"apps/timetable/\">고치기</a></div>"
      + (N ? '<div class="sdN' + (N.ok ? " ok" : "") + '"><p>' + esc(N.msg) + "</p>" + (N.list ? "<ul>" + N.list.slice(0, 8).map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + (N.list.length > 8 ? "<li>… " + (N.list.length - 8) + "개 더</li>" : "") + "</ul>" : "")
        + (N.key ? '<div class="nk"><input id="sdKey" type="text" inputmode="latin" autocomplete="off" spellcheck="false" maxlength="40" placeholder="인증키 붙여넣기" aria-label="나이스 인증키"><button type="button" class="p" data-nkey>저장</button></div>'
          + '<small class="nh">open.neis.go.kr → 마이페이지 → 인증키 (무료) · 설정 → 시작 세팅 → 내 정보에서도 바꿀 수 있어요</small>' : "")
        + (N.school ? '<div class="nk"><button type="button" class="p" data-nsch>🍚 우리 학교 찾기</button></div>' : "")
        + '<div class="na">' + (N.apply ? '<button type="button" class="p" data-napply>이번 주에 반영</button>' : "") + (st.busy ? "" : '<button type="button" data-nclose>닫기</button>') + "</div></div>" : "")
      + "</section>"
      + '<section class="sdC sdK" aria-label="달력">' + calHTML() + "</section>";
    var k2 = side.querySelector("#sdKey"); if(k2){ k2.value = kv; if(kf || (N && !N.f)){ k2.focus(); N.f = 1; } }
    var l2 = side.querySelector(".sdL"); if(l2 && sy) l2.scrollTop = sy;
  }
  document.addEventListener("keydown", function(e){ if(e.key === "Enter" && e.target && e.target.id === "sdKey" && !e.isComposing){ e.preventDefault(); saveKey(); } });
  var rT = 0; function soon(){ clearTimeout(rT); rT = setTimeout(paint, 80); }
  document.addEventListener("close", function(){ if(isSet()) soon(); }, true);   // 설정 창을 닫으면 점검 다시
  ["resize", "tt-home-change", "tt-mytodo-change", "hashchange", "focus", "load"].forEach(function(ev){ window.addEventListener(ev, soon); });
  window.addEventListener("storage", function(e){ if(!e.key || /^tt_/.test(e.key)) soon(); });
  new MutationObserver(soon).observe(document.body, {attributes: true, attributeFilter: ["class"]});
  (function tick(){ setTimeout(function(){ if(document.visibilityState === "visible") paint(); tick(); }, 60500 - Date.now() % 60000); })();
  window.TT_SBSIDE = {render: soon, paint: paint, check: neisCheck, board: function(D){ return boardItems(D || new Date()); }};   // v2.59 board: 휴대폰 찾기 '이번 주 일정'
  if(location.hash) soon(); else paint();   // v2.58.1 첫 화면은 바로 그림(80ms 늦게 그려 가운데가 옮겨 가던 문제)
})();
