/* 쌤 노트 v2.0 · 쌤비 홈 (PLAN_ssambi 3~6단계)
   ⋯ → 🎨 화면 꾸미기 → 첫 화면 [쌤비 홈]일 때만 그립니다(<html data-ui="ssambi">). [업무판]이면 아무것도 하지 않습니다.
   구글 첫 화면처럼: ① 쌤비 + 한마디(상황에 따라 소품이 바뀜) ② 검색창 하나(찾기·한 줄 입력·말로 기록) ③ 지금 카드
                     ④ 오늘 할 일(입력한 자료에서 저절로 생기고, 끝내면 사라짐 → 0개면 퇴근 도장) ⑤ 바로가기 6개
   - 자료와 규칙은 업무판 첫 화면과 똑같습니다: shared/today.js 의 TT_TODAY.home()을 읽기만 합니다.
   - 메뉴 화면(#class …)·설정·모든 창은 업무판과 같은 코드를 쓰고, 모양만 shared/v2.css 가 맞춥니다.
   - 첫 화면에는 학생 이름을 쓰지 않습니다(숫자만, 눌러야 이름). 교실 기기(전자칠판) 모드에서는 업무판 그대로. */
(function(){
  "use strict";
  if(!window.TT || window.TT_SBHOME) return;
  var host = document.getElementById("sbHome"); if(!host) return;
  var R = document.documentElement, ART = window.TT_SBART;
  var MAX = 5, st = {listen: false, more: false};
  function fitMax(){ var h = window.innerHeight; MAX = h < 700 ? 4 : h < 860 ? 5 : 7; }   // 스크롤 없이: 화면 높이에 맞춰 할 일 줄 수
  fitMax(); window.addEventListener("resize", function(){ soon(); });
  var DOW = "일월화수목금토";

  function on(){ return R.getAttribute("data-ui") === "ssambi" && !TT.classroom && !!window.TT_TODAY && !!TT_TODAY.home; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function hm(min){ return Math.floor(min / 60) + ":" + pad(min % 60); }
  function clockTxt(d){ var H = d.getHours(); return (H < 12 ? "오전 " : "오후 ") + ((H % 12) || 12) + ":" + pad(d.getMinutes()); }
  function josa(w, a, b){ var c = String(w).charCodeAt(String(w).length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? a : b; }   // 받침 있으면 a
  function menuOk(id){ return typeof ttMenuShown !== "function" || ttMenuShown(id); }

  /* ── 아이콘 (선 아이콘 한 종류: 굵기 1.8 · 둥근 끝) ── */
  function ic(d, s){ return '<svg viewBox="0 0 24 24" width="' + (s || 22) + '" height="' + (s || 22) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + "</svg>"; }
  var I = ART && ART.ICONS ? ART.ICONS : {};   // 선 아이콘은 shared/sbart.js 한 곳에서

  window.TT_SBICON = function(name, size){ return I[name] ? ic(I[name], size) : ""; };   // 다른 화면에서도 같은 아이콘을 쓰게

  /* ── 쌤비가 지금 들 소품과 한마디 (앞에 있는 상황이 이김) ── */
  function season(){
    var lk = R.getAttribute("data-look");
    if(lk === "spring" || lk === "summer" || lk === "autumn" || lk === "winter") return lk;
    var m = new Date().getMonth() + 1; return m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter";
  }
  function prepStep(){ var a = document.querySelector("#prep .pi"); return a ? a.textContent.replace(/^\d+\.\s*/, "").replace(/^[^\s가-힣A-Za-z0-9★]+\s*/, "").replace(/\s*\(.*\)$/, "") : ""; }
  function prepGo(){ var a = document.querySelector("#prep .pi"); if(!a) return false; a.click(); return true; }
  function pick(H){
    var d = new Date(), w = d.getDay(), wk = w >= 1 && w <= 5, m = d.getHours() * 60 + d.getMinutes(), N = H.now, T = H.tasks;
    var J = TT.joy && TT.joy.on && TT.joy.on() ? TT.joy : null, dd = J && J.dday ? J.dday() : null;
    var urgent = T.filter(function(x){ return x.lv === "hi" && /^(오늘|지남|종례|지금|D-[01])$/.test(String(x.n)); });
    var nxt = N.has && !N.cur && N.n ? N : null, cnt = T.length, deco = J ? season() : "";
    function r(item, line, sub, o){ o = o || {}; return {item: item, deco: deco, open: !!o.open, sleep: !!o.sleep, listen: !!o.listen, line: line, sub: sub || ""}; }
    var pr = prepStep(); if(pr) return r("paper", "시작 준비: " + pr, "말풍선을 누르면 바로 해요.");   // 예전 "시작 준비" 줄 대신
    if(st.listen) return r("listen", "듣고 있어요.", "말하면 오른쪽에 적혀요.", {listen: true});
    if(!urgent.length && wk && d.getHours() >= 12 && J){                 // v2.8: 급한 일만 없으면 퇴근 도장 (남은 일은 내일 해도 됨)
      var sk = J.streak ? J.streak() : 0;
      if(J.stamped()) return r("stamp", (cnt ? "급한 일 끝! " : "오늘 할 일 끝! ") + "수고 많으셨어요.", "이번 달 퇴근 도장 " + J.monthStamps() + "개" + (sk >= 2 ? " · 🔥 " + sk + "일 연속" : ""));
      if(d.getHours() >= 14 || !cnt) return r("stamp", (cnt ? "급한 일은 없어요. " : "오늘 할 일 끝! ") + "퇴근 도장 찍을까요?", cnt ? "남은 " + cnt + "개는 내일 해도 돼요." : "");
    }
    if(urgent.length) return r("alarm", "‘" + urgent[0].t + "’" + josa(urgent[0].t, "을", "를") + " 오늘 꼭 챙겨요.", urgent.length > 1 ? "급한 일이 " + urgent.length + "개 있어요." : "");
    if(N.cur) return r("shh", N.n + "교시 " + N.cls + " 수업 중이에요.", "끝까지 " + N.left + "분");
    if(nxt && nxt.left <= 15) return r("book", nxt.left + "분 뒤 " + nxt.n + "교시 " + nxt.cls + (nxt.subj ? " " + nxt.subj : "") + " 수업이에요.", nxt.prog && nxt.prog.now ? "이번 차시: " + nxt.prog.now : (nxt.unit ? "단원: " + nxt.unit : ""));
    if(wk && m >= 720 && m < 780){ var ml = ""; try{ ml = window.TTMeal ? TTMeal.todayText() : ""; }catch(e){} return r("spoon", "점심시간이에요. 맛있게 드세요!", ml || (cnt ? "오후에 챙길 일 " + cnt + "개" : "")); }
    /* v2.8: 새로 바뀐 점(업데이트 후 첫날) · 금요일 한 주 결산 · 백업 30일 */
    var NEWS = {"2.8.0": ["새 기능: 퇴근 도장은 급한 일만 없으면!", "쌤비 소품 · 연속 도장 · 우리 반 나무 · 앱 설치하기(쌤비 아이콘) — ⋯ 메뉴에서"]}, nv = NEWS[TT.VERSION];
    if(nv && m >= 300){ var sk = "sn_news_seen", sv0 = ""; try{ sv0 = localStorage.getItem(sk) || ""; }catch(e){}
      var td = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      if(sv0.indexOf(TT.VERSION + "|") !== 0){ try{ localStorage.setItem(sk, TT.VERSION + "|" + td); }catch(e){} sv0 = TT.VERSION + "|" + td; }
      if(sv0 === TT.VERSION + "|" + td) return r("paper", nv[0], nv[1]); }
    if(J && w === 5 && d.getHours() >= 14 && d.getHours() < 18 && J.weekSaved && J.weekSaved() >= 10){ var ws = J.weekSaved(); return r("stamp", "이번 주 쌤 노트로 " + (ws >= 60 ? Math.floor(ws / 60) + "시간 " + (ws % 60 ? ws % 60 + "분" : "") : ws + "분") + " 아꼈어요!", "한 주 수고 많으셨어요." + (cnt ? " 남은 일 " + cnt + "개" : "")); }
    if(wk && m >= 300 && TT.backup && TT.backup.hasData()){ var bd = TT.backup.daysSince(); if(bd === null || bd >= 30) return r("paper", bd === null ? "아직 백업을 안 했어요." : "백업한 지 " + bd + "일 됐어요.", "⋯ → 전체 백업 저장 (파일 하나로)"); }
    if(m < 300) return r("night", "늦은 시간이에요." + (wk && N.count ? " 오늘 수업 " + N.count + "시간" : ""), cnt ? "챙길 일 " + cnt + "개는 아침에 봐요. 푹 쉬세요." : "푹 쉬세요.", {sleep: true});   // 자정~새벽 5시
    if(wk && m < 540) return r("coffee", "좋은 아침이에요!" + (N.count ? " 오늘 수업 " + N.count + "시간" : ""), cnt ? "오늘 챙길 일 " + cnt + "개예요." : "오늘 챙길 일은 아직 없어요.");
    if(J && J.examNear && J.examNear()) return r("redpen", "시험 기간이에요. 조금만 힘내요!", cnt ? "챙길 일 " + cnt + "개" : "");
    var mo = d.getMonth() + 1, dt = d.getDate();
    if((mo === 2 && dt >= 20) || (mo === 3 && dt <= 14)) return r("paper", "새 학년이에요. 명렬·시간표를 넣어 주세요.", "");
    if(dd && /방학/.test(dd.t) && dd.n <= 21) return r("calendar", dd.t + "까지 D-" + dd.n + "!", cnt ? "그 전에 챙길 일 " + cnt + "개" : "");
    if(!wk) return r("night", "주말이에요. 쉬어 가세요.", cnt ? "" : "", {sleep: true});
    if(d.getHours() >= 18) return r("night", "오늘도 수고하셨어요. 푹 쉬세요.", cnt ? "" : "", {sleep: true});
    var line = cnt ? "오늘 챙길 일이 " + cnt + "개 있어요." : "지금 챙길 일은 없어요.";
    var sub = nxt ? "다음은 " + nxt.n + "교시 " + nxt.cls + " (" + nxt.t + ")" : (dd ? dd.t + "까지 D-" + dd.n : "");
    return r("", line, sub, {open: true});
  }

  /* ── 지금 카드 ── */
  function nowCard(N){
    if(!N.has && prepStep()) return "";                                  // 시작 준비 중에는 말풍선이 안내하므로 숨김
    if(!N.has) return '<div class="sbNow none"><div class="nb"><div class="k">지금</div><div class="tt">내 시간표를 넣으면 다음 수업이 여기에 나와요</div></div>'
      + '<div class="acts"><a class="sbBtn p" href="apps/timetable/">시간표 넣기</a></div></div>';
    var h = "";
    if(N.n){
      var k = N.cur ? "지금 수업 · 끝까지 " + N.left + "분" : "다음 수업 · " + (N.left <= 180 ? N.left + "분 뒤" : N.t + " 시작");
      var sub = N.prog ? (N.prog.done ? "✔ 이 교시 진행 완료 · " + N.prog.done : N.prog.skip ? "수업 없음 · " + N.prog.skip : (N.prog.last ? "지난 " + N.prog.last + " → " : "") + "이번 " + N.prog.now) : (N.unit ? "단원 " + N.unit : "");
      h += '<div class="sbNow' + (N.cur ? " cur" : "") + '"><div class="nb"><div class="k">' + esc(k) + (N.chg ? ' <span class="chg">수업 교체</span>' : "") + "</div>"
        + '<div class="tt">' + N.n + "교시 " + esc(N.cls) + (N.subj ? " " + esc(N.subj) : "") + "</div>"
        + '<div class="sb">' + esc(sub) + (N.page ? " · p." + esc(N.page) : "") + "</div>" + (N.memo ? '<div class="sb memo">📝 ' + esc(N.memo) + "</div>" : "") + "</div>"
        + '<div class="acts">' + (N.book ? '<a class="sbBtn p" href="' + esc(N.book) + '">자료 열기</a><a class="sbBtn" href="apps/journal/">수업 기록</a>' : '<a class="sbBtn p" href="apps/journal/">수업 기록</a>') + "</div></div>";
    }else{
      var msg = !N.weekday ? "주말이에요" : !N.count ? "오늘은 수업이 없어요" : N.miss ? "오늘 수업 끝 · 기록 확인" : "✔ 오늘 수업 끝";
      h += '<div class="sbNow none"><div class="nb"><div class="k">지금</div><div class="tt">' + esc(msg) + '</div></div><div class="acts"><a class="sbBtn" href="apps/journal/">수업 기록</a></div></div>';
    }
    if(N.miss) h += '<div class="sbMiss"><a href="apps/journal/">✏️ ' + N.miss.n + "교시 " + esc(N.miss.cls) + " 기록 안 함" + (N.miss.count > 1 ? " 외 " + (N.miss.count - 1) + "개" : "") + "</a>"
      + (window.TTFollow ? '<button type="button" class="sbBtn sm" data-plus="' + N.miss.n + '">진도 +1</button>' : "") + "</div>";
    return h;
  }

  /* ── 오늘 할 일: 꼬리표 없이 왼쪽 동그라미(끝내기)·그림, 오른쪽은 마감만. 쌤 노트가 준비해 둔 일은 한 줄로 묶음 ── */
  var cur = [];
  var HOT = /^(오늘|지남)$/;   // 강조색은 오늘·지난 일에만
  function row(x, i){
    var can = x.kind === "bag" || x.kind === "todo", hot = x.lv === "hi" && HOT.test(String(x.n));
    var lead = can ? '<button type="button" class="ck" data-done="' + i + '" aria-label="' + esc(x.t) + ' 끝냈어요" title="끝냈어요"></button>' : '<span class="ico" aria-hidden="true">' + (ART && ART.toolIcon ? ART.toolIcon("", x.ic, 18) : esc(x.ic)) + "</span>";
    var go = x.kind === "auto" || x.kind === "autos" || x.pop || x.href || x.kind === "todo";
    var sub = "";
    var body = '<span class="tx"><b>' + esc(x.t) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span>";
    return '<li class="sbRow ' + esc(x.kind) + (hot ? " hot" : "") + '">' + lead
      + (go ? '<button type="button" class="go" data-go="' + i + '">' + body + "</button>" : '<span class="go">' + body + "</span>")
      + '<span class="n">' + esc(x.n || "") + "</span></li>";
  }
  function group(T){                                                   // "준비됨"은 여러 개면 한 줄로
    var A = T.filter(function(x){ return x.kind === "auto"; });
    if(A.length < 2) return T;
    var at = T.indexOf(A[0]), out = T.filter(function(x){ return x.kind !== "auto"; });
    out.splice(at, 0, {kind: "autos", ic: "✨", t: "쌤 노트가 준비해 둔 일 " + A.length + "개", n: "확인 ›", lv: "rd"});
    return out;
  }
  function tasks(T){
    T = cur = group(T);
    var J = TT.joy && TT.joy.on && TT.joy.on() ? TT.joy : null, d = new Date(), wk = d.getDay() >= 1 && d.getDay() <= 5;
    var hd = '<div class="sbTh"><h2>오늘 할 일 <span class="c">' + T.length + '</span></h2>'
      + '<button type="button" class="sbAdd" data-add title="할 일이나 종례 때 전할 말 적기">' + ic(I.plus, 16) + "적기</button></div>";
    if(!T.length){
      var stamped = J && J.stamped(), can = J && wk && d.getHours() >= 12;
      if(!stamped && !can) return hd.replace("</h2>", '</h2><span class="sbNone">지금 챙길 일이 없어요</span>');   // 빈 상자 대신 한 줄
      return hd + '<div class="sbDone"><div class="stp' + (stamped ? " on" : "") + '" aria-hidden="true">퇴근</div><div><b>' + (stamped ? "오늘 퇴근 도장 쾅!" : "지금 챙길 일이 없어요") + "</b><small>"
        + (stamped ? "이번 달 " + J.monthStamps() + "개" : can ? "" : "") + "</small></div>"
        + (J && (stamped || can) ? '<button type="button" class="sbBtn' + (stamped ? "" : " p") + '" data-stamp>' + (stamped ? "도장판 보기" : "퇴근 도장") + "</button>" : "") + "</div>";
    }
    var urg = T.some(function(x){ return x.lv === "hi" && /^(오늘|지남|종례|지금|D-[01])$/.test(String(x.n)); });
    if(J && wk && !urg && (J.stamped() || d.getHours() >= 12))           // v2.8: 급한 일이 없으면 할 일이 남아 있어도 퇴근 도장
      hd = hd.replace("</h2>", '</h2><button type="button" class="sbStampS' + (J.stamped() ? " on" : "") + '" data-stamp title="' + (J.stamped() ? "도장판 보기" : "급한 일이 없어요. 퇴근 도장 쾅!") + '">' + (J.stamped() ? "✅ 퇴근 도장 " + J.monthStamps() : "🙌 퇴근 도장") + "</button>");
    var L = st.more ? T : T.slice(0, MAX);
    return hd + '<ul class="sbList">' + L.map(row).join("") + "</ul>"
      + (T.length > MAX ? '<button type="button" class="sbMore" data-more>' + (st.more ? "접기" : "+ " + (T.length - MAX) + "개 더 보기") + "</button>" : "");
  }

  /* ── 그리기: 쌤비·검색창·메뉴는 위쪽 고정 줄(shared/sbbar.js), 여기는 쌤비 한마디 · 지금 · 오늘 할 일 ── */
  /* ── 중메뉴: 업무판 메뉴 화면(#mview, 숨김)이 그린 도구 칸을 그대로 읽어 다시 배치 ──
     ① 지금 자주 쓰는 3개(쓴 횟수 → 시기 순)를 크게 + 상태 한 줄 ② 나머지는 묶음별 작은 동그라미 + 이름(설명은 마우스를 올리면)
     ③ 내 교과가 아닌 교과 칸은 접어 둠. 누르면 원래 칸을 눌러 줍니다(같은 동작 — 도구 열기·설정 창·내려받기). */
  var mid = [], openG = {};
  function midData(){
    var mv = document.getElementById("mview"); if(!mv || mv.hidden) return null;
    var all = mv.querySelector('.mtabs [data-tab="all"]'); if(all && !all.classList.contains("on")){ all.click(); mv = document.getElementById("mview"); }
    var box = mv.querySelector(".mtiles"); if(!box) return null;
    var G = [], g = null;
    Array.prototype.forEach.call(box.children, function(ch){
      if(ch.classList.contains("mgh")){ g = {name: ch.textContent.trim(), items: []}; G.push(g); return; }
      var t = ch.classList.contains("mtw") ? ch.querySelector(".mt") : null; if(!t) return;
      if(!g){ g = {name: "", items: []}; G.push(g); }
      var sm = t.querySelector("small");
      g.items.push({el: t, id: t.dataset.tid || "", ic: (t.querySelector(".mi") || {}).textContent || "", name: (t.querySelector("b") || {}).textContent || "", st: sm ? sm.textContent : "", warn: !!(sm && sm.classList.contains("warn")), hot: t.classList.contains("hot"), dim: t.classList.contains("dim"), tip: t.title || ""});
    });
    return G;
  }
  function midHTML(){
    var m = window.TT_SBAR ? TT_SBAR.cur() : "", G = midData() || [];
    if(m === "lib") G = G.filter(function(g){ return /자료실/.test(g.name); });
    else if(m === "school") G = G.filter(function(g){ return !/자료실/.test(g.name); });
    var L = []; G.forEach(function(g){ g.items.forEach(function(it){ L.push(it); }); });
    if(!L.length) return '<div class="sbMid"><p class="sbEmpty">이 메뉴에 보일 도구가 없어요.</p></div>';
    var use = ((TT.store.get("tt_ui_v1", {}) || {}).tools || {}).use || {};
    function n(it){ return it.id && use[it.id] ? +use[it.id].n || 0 : 0; }
    var flat = m === "settings";                                  // 설정: 큰 카드 없이 설정 6 · 백업·안내 4를 같은 크기 칸으로(설명 글 없음)
    var big = !flat && L.length > 4 ? L.map(function(it, i){ return {it: it, i: i}; }).filter(function(x){ return !x.it.dim; })
      .sort(function(a, b){ return (n(b.it) - n(a.it)) || ((b.it.hot ? 1 : 0) - (a.it.hot ? 1 : 0)) || (a.i - b.i); }).slice(0, 3).map(function(x){ return x.it; }) : [];
    mid = [];
    function idx(it){ mid.push(it); return mid.length - 1; }
    function ico(it, sz){ return ART && ART.toolIcon ? ART.toolIcon(it.id, it.ic, sz) : esc(it.ic); }
    var pk = typeof ttPack === "function" ? ttPack() : null, my = pk ? pk.name : "";
    var h = '<div class="sbMid' + (flat ? ' flat' : '') + '">';
    if(big.length) h += '<div class="sbBig">' + big.map(function(it){
      return '<button type="button" class="bc' + (it.dim ? " dim" : "") + '" data-mid="' + idx(it) + '" title="' + esc(it.tip || it.st) + '"><span class="ci">' + ico(it, 24) + '</span><span class="tx"><b>' + esc(it.name) + "</b><small" + (it.warn ? ' class="warn"' : "") + ">" + esc(it.st) + "</small></span>" + (it.hot ? '<em>지금</em>' : "") + "</button>";
    }).join("") + "</div>";
    var rest = G.map(function(g){ return {name: g.name, items: g.items.filter(function(it){ return big.indexOf(it) < 0; })}; }).filter(function(g){ return g.items.length; });
    /* 교과 칸은 한 칸(열)에 모아, 내 교과가 아닌 칸은 그 아래 한 줄로 접어 둠 → 3칸 안에 다 들어가 스크롤 없이 */
    var cols = rest.map(function(g){ return [g]; });                   // 묶음마다 한 칸 — 교과 칸도 수학 · 국어 나란히(접지 않음)
    function sec(g){
      var fold = false;
      return '<section class="gp' + (fold ? " fold" : "") + '"><h3>' + (fold ? '<button type="button" data-open="' + esc(g.name) + '">' + esc(g.name.replace(/^교과 칸\s*·\s*/, "")) + " (" + g.items.length + ") ▸</button>" : esc(g.name || "그 밖의 도구")) + "</h3>"
        + (fold ? "" : '<div class="ic">' + g.items.map(function(it){
            return '<button type="button" class="sc' + (it.dim ? " dim" : "") + '" data-mid="' + idx(it) + '" title="' + esc(it.name + (it.st ? " · " + it.st : "")) + '"><span class="ci">' + ico(it, 20) + "</span><b>" + esc(it.name) + "</b></button>";
          }).join("") + "</div>") + "</section>";
    }
    if(cols.length) h += '<div class="sbGroups" style="--gc:' + Math.min(cols.length, 4) + '">' + cols.map(function(c){ return '<div class="col">' + c.map(sec).join("") + "</div>"; }).join("") + "</div>";
    return h + "</div>";
  }

  /* ── 검색 결과 (창 없이 메뉴 줄 아래에) — 찾는 규칙은 업무판 찾기 창과 같음(TT_FIND.rows) ── */
  var Q = {q: "", rows: [], sel: 0};
  function picks(){ return Q.rows.filter(function(r){ return !r.h && !r.bag; }); }
  function resHTML(){
    var R0 = Q.rows = window.TT_FIND && TT_FIND.rows ? TT_FIND.rows(Q.q) : [], pk = picks(), i = -1;
    if(Q.sel >= pk.length) Q.sel = 0;
    var h = '<div class="sbRes"><div class="rh"><b>‘' + esc(Q.q) + '’ 찾은 결과 <span class="c">' + pk.length + '</span></b><span class="hint"></span><button type="button" class="sbAdd" data-qclose>닫기 ✕</button></div>';
    if(!R0.length) return h + '<p class="sbEmpty">맞는 것이 없어요.</p></div>';
    h += '<ul class="sbList">' + R0.map(function(r, k){
      if(r.h) return '<li class="rgh">' + r.h + "</li>";
      var on = !r.bag && ++i === Q.sel;
      return '<li class="sbRow rr' + (on ? " on" : "") + '"><span class="ico" aria-hidden="true">' + (ART && ART.toolIcon ? ART.toolIcon("", String(r.ic).replace(/<[^>]*>/g, ""), 18) : r.ic) + '</span><button type="button" class="go" data-r="' + k + '"><span class="tx"><b>' + r.tx + "</b>" + (r.sub ? "<small>" + r.sub + "</small>" : "") + "</span></button>"
        + (r.btns || []).map(function(b, j){ return '<button type="button" class="sbBtn sm" data-r="' + k + '" data-b="' + j + '">' + b[0] + "</button>"; }).join("") + "</li>";
    }).join("") + "</ul></div>";
    return h;
  }
  function doneSearch(){ Q.q = ""; Q.sel = 0; if(window.TT_SBAR) TT_SBAR.clearSearch(); render(); }
  function runRow(k, b){
    var r = Q.rows[k]; if(!r) return;
    if(b != null && r.btns && r.btns[b]){ r.btns[b][1](); setTimeout(render, 50); return; }
    if(r.go){ var keep = Q.q; r.go(); if(Q.q === keep) doneSearch(); }
  }

  /* ── 그리기: 쌤비·말풍선·검색창·메뉴는 shared/sbbar.js(머리), 여기는 홈 = 지금 · 오늘 할 일 / 중메뉴 = 도구 ── */
  var lastP = null;
  function render(){
    var ok = on();
    document.body.classList.toggle("sbOn", ok);
    if(!ok){ host.hidden = true; host.textContent = ""; R.classList.add("sbReady"); return; }
    var H; try{ H = TT_TODAY.home(); }catch(e){ console.warn("쌤비 홈:", e); return; }
    var P = lastP = pick(H);
    if(window.TT_SBAR) TT_SBAR.setOwl({item: P.item, open: P.open, sleep: P.sleep, listen: P.listen, line: P.line, sub: P.sub, ev: H.events.join(" · ")});
    host.hidden = false;
    if(window.TT_SBAR && TT_SBAR.seatBox) TT_SBAR.seatBox();
    if(Q.q){ host.innerHTML = '<div class="sbWrap">' + resHTML() + "</div>"; var on1 = host.querySelector(".rr.on"); if(on1 && on1.scrollIntoView) on1.scrollIntoView({block: "nearest"}); return; }
    if(document.body.classList.contains("inmenu")){ host.innerHTML = '<div class="sbWrap mid">' + midHTML() + "</div>"; return; }
    host.innerHTML = '<div class="sbWrap">'
      + '<div class="sbNowWrap">' + nowCard(H.now) + "</div>"
      + '<section class="sbTasks" aria-label="오늘 할 일">' + tasks(H.tasks) + "</section></div>";
    var shown = Math.min(MAX, cur.length);
    if(!st.more && window.innerWidth > 760 && shown > 2 && document.documentElement.scrollHeight > window.innerHeight + 2){ MAX = shown - 1; render(); }   // 넘치면 한 줄씩 줄여 스크롤 없이
  }

  /* ── 누르기 ── */
  host.addEventListener("click", function(e){
    var t = e.target.closest("button,a"); if(!t) return;
    if(t.hasAttribute("data-qclose")){ doneSearch(); return; }
    if(t.hasAttribute("data-r")){ runRow(+t.dataset.r, t.hasAttribute("data-b") ? +t.dataset.b : null); return; }
    if(t.hasAttribute("data-mid")){ var it = mid[+t.dataset.mid]; if(it && it.el) it.el.click(); return; }
    if(t.hasAttribute("data-open")){ openG[t.dataset.open] = 1; render(); return; }
    if(t.hasAttribute("data-go")){ var x = cur[+t.dataset.go]; if(x && x.kind === "autos"){ if(window.TTAuto) TTAuto.list(); } else TT_TODAY.act(x, t); return; }
    if(t.hasAttribute("data-done")){ TT_TODAY.done(cur[+t.dataset.done]); return; }
    if(t.hasAttribute("data-more")){ st.more = !st.more; render(); return; }
    if(t.hasAttribute("data-add")){ if(window.TT_FIND) TT_FIND.open("할 일: "); return; }
    if(t.hasAttribute("data-stamp")){ if(TT.joy){ if(TT.joy.stamped()) TT.joy.open(); else { TT.joy.stamp(); setTimeout(render, 300); } } return; }
    if(t.hasAttribute("data-plus")){ if(window.TTFollow) TTFollow.plusOneNow(+t.dataset.plus); setTimeout(render, 200); return; }
  });
  document.addEventListener("keydown", function(e){                    // 어디서나 / → 찾기 (글 쓰는 칸 밖에서만)
    if(e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || !on()) return;
    var a = document.activeElement, tg = a && a.tagName;
    if(tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT" || (a && a.isContentEditable) || document.querySelector("dialog[open]")) return;
    e.preventDefault(); if(window.TT_SBAR && TT_SBAR.focusSearch) TT_SBAR.focusSearch(""); else if(window.TT_FIND) TT_FIND.open("");
  });

  /* ── 다시 그리기: 자료가 바뀌거나, 분이 바뀌거나, 화면을 옮길 때 ── */
  var rT = 0; function soon(){ clearTimeout(rT); rT = setTimeout(function(){ fitMax(); render(); }, 60); }
  ["tt-mytodo-change", "tt-auto-change", "tt-home-change", "hashchange", "popstate", "pageshow", "focus", "load"].forEach(function(ev){ window.addEventListener(ev, soon); });
  window.addEventListener("storage", function(e){ if(!e.key || /^(tt_|snlook_v1)/.test(e.key)) soon(); });
  document.addEventListener("visibilitychange", function(){ if(document.visibilityState === "visible") soon(); });
  new MutationObserver(soon).observe(R, {attributes: true, attributeFilter: ["data-ui", "data-look"]});
  new MutationObserver(function(){ soon(); }).observe(document.body, {attributes: true, attributeFilter: ["class"]});
  (function tick(){ setTimeout(function(){ if(document.visibilityState === "visible") render(); tick(); }, 60500 - Date.now() % 60000); })();
  /* 쌤비가 듣는 중이면 홈의 쌤비도 귀를 기울임 */
  (function(){
    var box = null;
    setInterval(function(){
      box = box || document.getElementById("sbBox"); var btn = document.getElementById("sbBtn");
      var lis = !!(btn && btn.classList.contains("lis"));
      if(lis !== st.listen){ st.listen = lis; if(on() && !document.body.classList.contains("inmenu")) render(); }
    }, 700);
  })();
  /* 머리글 제목의 🍎 대신 쌤 노트 로고(노트 + 쌤비 안경) */
  function logo(){
    var t = document.getElementById("appTitle"); if(!t) return;
    var h = t.parentNode, lg = h.querySelector(".sbLogoWrap");
    if(on()){
      if(!lg && ART){ lg = document.createElement("span"); lg.className = "sbLogoWrap"; lg.innerHTML = ART.logo(30); h.insertBefore(lg, t); }
      if(/^🍎\s*/.test(t.textContent)) t.textContent = t.textContent.replace(/^🍎\s*/, "");
    }else if(lg){ lg.remove(); if(!/^🍎/.test(t.textContent) && /쌤 노트$/.test(t.textContent)) t.textContent = "🍎 " + t.textContent; }
  }
  new MutationObserver(function(){ logo(); }).observe(document.getElementById("appTitle") || document.body, {childList: true, characterData: true, subtree: true});
  new MutationObserver(logo).observe(R, {attributes: true, attributeFilter: ["data-ui"]});

  /* 메뉴 막대(PC 왼쪽 · 휴대폰 아래)의 그림 글자도 같은 선 아이콘으로 */
  function navIcons(){
    var nav = document.getElementById("mnav"); if(!nav || !on()) return;
    Array.prototype.forEach.call(nav.querySelectorAll("a[data-menu]"), function(a){
      var k = a.getAttribute("data-menu"), sp = a.querySelector("span"); if(!sp || sp.getAttribute("data-ic") === k || !I[k]) return;
      sp.setAttribute("data-ic", k); sp.innerHTML = ic(I[k], 22);
    });
  }
  var navEl = document.getElementById("mnav");
  if(navEl) new MutationObserver(navIcons).observe(navEl, {childList: true});
  new MutationObserver(navIcons).observe(R, {attributes: true, attributeFilter: ["data-ui"]});

  window.addEventListener("tt-menu-refresh", soon);
  window.addEventListener("tt-find-update", function(){ if(Q.q) render(); });
  window.addEventListener("hashchange", function(){ if(Q.q){ Q.q = ""; if(window.TT_SBAR) TT_SBAR.clearSearch(); } });
  window.TT_SBHOME = {render: render, pick: pick, prepGo: prepGo,
    search: function(q){ q = String(q || "").trim(); if(q === Q.q) return; Q.q = q; Q.sel = 0; render(); },
    query: function(){ return Q.q; },
    move: function(d){ var n = picks().length; if(!n) return; Q.sel = (Q.sel + d + n) % n; render(); },
    run: function(){ var p = picks()[Q.sel]; if(!p) return; runRow(Q.rows.indexOf(p), null); }};
  render(); logo(); navIcons();
  requestAnimationFrame(function(){ R.classList.add("sbReady"); }); setTimeout(function(){ R.classList.add("sbReady"); }, 120);   // v2.8.1: 창이 뒤에 있어 그림 신호가 늦어도 보이게   // 첫 그림이 끝나면 보이기
})();
