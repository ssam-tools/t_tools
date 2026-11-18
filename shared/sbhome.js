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
  function fitMax(){ var h = window.innerHeight; MAX = h < 700 ? 3 : h < 860 ? 4 : 5; }   // 스크롤 없이: 화면 높이에 맞춰 할 일 줄 수
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
  function pick(H){
    var d = new Date(), w = d.getDay(), wk = w >= 1 && w <= 5, m = d.getHours() * 60 + d.getMinutes(), N = H.now, T = H.tasks;
    var J = TT.joy && TT.joy.on && TT.joy.on() ? TT.joy : null, dd = J && J.dday ? J.dday() : null;
    var urgent = T.filter(function(x){ return x.lv === "hi" && /^(오늘|지남|종례|지금|D-[01])$/.test(String(x.n)); });
    var nxt = N.has && !N.cur && N.n ? N : null, cnt = T.length, deco = J ? season() : "";
    function r(item, line, sub, o){ o = o || {}; return {item: item, deco: deco, open: !!o.open, sleep: !!o.sleep, listen: !!o.listen, line: line, sub: sub || ""}; }
    if(st.listen) return r("listen", "듣고 있어요. “12번 지각”처럼 말해 주세요.", "학생 이름 대신 번호로 말하면 더 안전해요.", {listen: true});
    if(!cnt && wk && d.getHours() >= 12 && J){
      if(J.stamped()) return r("stamp", "오늘 할 일 끝! 수고 많으셨어요.", "이번 달 퇴근 도장 " + J.monthStamps() + "개");
      return r("stamp", "오늘 챙길 일을 다 했어요. 퇴근 도장 찍을까요?", "아래 [퇴근 도장]을 누르세요.");
    }
    if(urgent.length) return r("alarm", "‘" + urgent[0].t + "’" + josa(urgent[0].t, "을", "를") + " 오늘 꼭 챙겨요.", urgent.length > 1 ? "급한 일이 " + urgent.length + "개 있어요." : urgent[0].kind === "bag" ? "종례 때 꼭 전해요." : "끝내면 아래에서 ○를 눌러 주세요.");
    if(N.cur) return r("shh", N.n + "교시 " + N.cls + " 수업 중이에요.", "끝까지 " + N.left + "분 · 끝나면 진도 기록을 알려 드릴게요.");
    if(nxt && nxt.left <= 15) return r("book", nxt.left + "분 뒤 " + nxt.n + "교시 " + nxt.cls + (nxt.subj ? " " + nxt.subj : "") + " 수업이에요.", nxt.prog && nxt.prog.now ? "이번 차시: " + nxt.prog.now : (nxt.unit ? "단원: " + nxt.unit : ""));
    if(wk && m >= 720 && m < 780) return r("spoon", "점심시간이에요. 맛있게 드세요!", cnt ? "오후에 챙길 일 " + cnt + "개" : "");
    if(wk && m < 540) return r("coffee", "좋은 아침이에요!" + (N.count ? " 오늘 수업 " + N.count + "시간" : ""), cnt ? "오늘 챙길 일 " + cnt + "개예요." : "오늘 챙길 일은 아직 없어요.");
    if(J && J.examNear && J.examNear()) return r("redpen", "시험 기간이에요. 조금만 힘내요!", cnt ? "챙길 일 " + cnt + "개" : "");
    var mo = d.getMonth() + 1, dt = d.getDate();
    if((mo === 2 && dt >= 20) || (mo === 3 && dt <= 14)) return r("paper", "새 학년이에요. 명렬·시간표를 넣어 두면 제가 다 챙길게요.", "⚙ 설정 → 학기초 세팅");
    if(dd && /방학/.test(dd.t) && dd.n <= 21) return r("calendar", dd.t + "까지 D-" + dd.n + "!", cnt ? "그 전에 챙길 일 " + cnt + "개" : "");
    if(!wk) return r("night", "주말이에요. 쉬어 가세요.", cnt ? "다음 주에 챙길 일 " + cnt + "개는 제가 기억할게요." : "", {sleep: true});
    if(d.getHours() >= 18) return r("night", "오늘도 수고하셨어요. 푹 쉬세요.", cnt ? "남은 " + cnt + "개는 내일 다시 알려 드릴게요." : "", {sleep: true});
    var line = cnt ? "오늘 챙길 일이 " + cnt + "개 있어요." : "지금 챙길 일은 없어요.";
    var sub = nxt ? "다음은 " + nxt.n + "교시 " + nxt.cls + " (" + nxt.t + ")" : (dd ? dd.t + "까지 D-" + dd.n : "");
    return r("", line, sub, {open: true});
  }

  /* ── 지금 카드 ── */
  function nowCard(N){
    if(!N.has) return '<div class="sbNow none"><div class="nb"><div class="k">지금</div><div class="tt">내 시간표를 넣으면 다음 수업이 여기에 나와요</div></div>'
      + '<div class="acts"><a class="sbBtn p" href="apps/timetable/">시간표 넣기</a></div></div>';
    var h = "";
    if(N.n){
      var k = N.cur ? "지금 수업 · 끝까지 " + N.left + "분" : "다음 수업 · " + (N.left <= 180 ? N.left + "분 뒤" : N.t + " 시작");
      var sub = N.prog ? (N.prog.done ? "✔ 이 교시 진행 완료 · " + N.prog.done : N.prog.skip ? "수업 없음 · " + N.prog.skip : (N.prog.last ? "지난 " + N.prog.last + " → " : "") + "이번 " + N.prog.now) : (N.unit ? "단원 " + N.unit : "수업 기록을 쓰면 지난 진도가 나와요");
      h += '<div class="sbNow' + (N.cur ? " cur" : "") + '"><div class="nb"><div class="k">' + esc(k) + (N.chg ? ' <span class="chg">수업 교체</span>' : "") + "</div>"
        + '<div class="tt">' + N.n + "교시 " + esc(N.cls) + (N.subj ? " " + esc(N.subj) : "") + "</div>"
        + '<div class="sb">' + esc(sub) + (N.page ? " · p." + esc(N.page) : "") + "</div>" + (N.memo ? '<div class="sb memo">📝 ' + esc(N.memo) + "</div>" : "") + "</div>"
        + '<div class="acts">' + (N.book ? '<a class="sbBtn p" href="' + esc(N.book) + '">자료 열기</a><a class="sbBtn" href="apps/journal/">수업 기록</a>' : '<a class="sbBtn p" href="apps/journal/">수업 기록</a>') + "</div></div>";
    }else{
      var msg = !N.weekday ? "주말이에요 · 월요일 수업은 내 시간표에서" : !N.count ? "오늘은 수업이 없어요" : N.miss ? "오늘 수업이 끝났어요 · 기록을 확인해 주세요" : "✔ 오늘 수업 끝";
      h += '<div class="sbNow none"><div class="nb"><div class="k">지금</div><div class="tt">' + esc(msg) + '</div></div><div class="acts"><a class="sbBtn" href="apps/journal/">수업 기록</a></div></div>';
    }
    if(N.miss) h += '<div class="sbMiss"><a href="apps/journal/">✏️ ' + N.miss.n + "교시 " + esc(N.miss.cls) + " 기록 안 함" + (N.miss.count > 1 ? " 외 " + (N.miss.count - 1) + "개" : "") + "</a>"
      + (window.TTFollow ? '<button type="button" class="sbBtn sm" data-plus="' + N.miss.n + '">진도 +1</button>' : "") + "</div>";
    return h;
  }

  /* ── 오늘 할 일 ── */
  var TAGN = {"class": "수업", homeroom: "우리 반", student: "학생", school: "학교"};
  var cur = [];
  function row(x, i){
    var can = x.kind === "bag" || x.kind === "todo", hot = x.lv === "hi" && /^(오늘|지남|종례|지금|D-[01])$/.test(String(x.n));
    var tag = x.kind === "bag" ? "종례" : x.kind === "todo" ? "할 일" : x.kind === "auto" ? "준비됨" : TAGN[x.menu] || "";
    var lead = can ? '<button type="button" class="ck" data-done="' + i + '" aria-label="' + esc(x.t) + ' 끝냈어요" title="끝냈어요"></button>' : '<span class="ico" aria-hidden="true">' + esc(x.ic) + "</span>";
    var go = x.kind === "auto" || x.pop || x.href || x.kind === "todo";
    var body = '<span class="tx"><b>' + esc(x.t) + "</b>" + (x.tip && x.kind === "item" ? "<small>" + esc(x.tip) + "</small>" : "") + "</span>";
    return '<li class="sbRow ' + esc(x.kind) + (hot ? " hot" : "") + '">' + lead
      + (go ? '<button type="button" class="go" data-go="' + i + '">' + body + "</button>" : '<span class="go">' + body + "</span>")
      + (tag ? '<span class="tg">' + tag + "</span>" : "") + (x.n ? '<span class="n">' + esc(x.n) + "</span>" : "") + "</li>";
  }
  function tasks(T){
    cur = T;
    var J = TT.joy && TT.joy.on && TT.joy.on() ? TT.joy : null, d = new Date(), wk = d.getDay() >= 1 && d.getDay() <= 5;
    var hd = '<div class="sbTh"><h2>오늘 할 일 <span class="c">' + T.length + '</span></h2><span class="hint">입력한 자료에서 저절로 생기고, 끝내면 사라져요</span>'
      + '<button type="button" class="sbAdd" data-add title="할 일이나 종례 때 전할 말 적기">' + ic(I.plus, 16) + "적기</button></div>";
    if(!T.length){
      var stamped = J && J.stamped(), can = J && wk && d.getHours() >= 12;
      return hd + '<div class="sbDone"><div class="stp' + (stamped ? " on" : "") + '" aria-hidden="true">퇴근</div><div><b>' + (stamped ? "오늘 퇴근 도장 쾅!" : "지금 챙길 일이 없어요") + "</b><small>"
        + (stamped ? "이번 달 도장 " + J.monthStamps() + "개 · 수고하셨어요" : can ? "오늘 할 일을 다 했어요. 도장을 찍어 볼까요?" : "새로 생기는 일은 쌤비가 알려 줄게요") + "</small></div>"
        + (J && (stamped || can) ? '<button type="button" class="sbBtn' + (stamped ? "" : " p") + '" data-stamp>' + (stamped ? "도장판 보기" : "퇴근 도장") + "</button>" : "") + "</div>";
    }
    var L = st.more ? T : T.slice(0, MAX);
    return hd + '<ul class="sbList">' + L.map(row).join("") + "</ul>"
      + (T.length > MAX ? '<button type="button" class="sbMore" data-more>' + (st.more ? "접기" : "+ " + (T.length - MAX) + "개 더 보기") + "</button>" : "");
  }

  /* ── 바로가기 6개 (Alt 단축키는 shared/keys.js 와 같음) ── */
  function shortcuts(){
    var L = [["class", "수업", "Alt+2"], ["homeroom", "우리 반", "Alt+3"], ["student", "학생", "Alt+4"], ["school", "학교", "Alt+5"], ["lib", "자료실", ""], ["settings", "설정", "Alt+0"]];
    return '<nav class="sbGo" aria-label="메뉴">' + L.filter(function(x){ return x[0] === "lib" || x[0] === "settings" || menuOk(x[0]); }).map(function(x){
      return '<a href="#' + (x[0] === "lib" ? "school" : x[0]) + '" data-m="' + x[0] + '"><span class="ci">' + ic(I[x[0]], 24) + "</span><b>" + x[1] + "</b>" + (x[2] ? "<small>" + x[2] + "</small>" : "<small>&nbsp;</small>") + "</a>";
    }).join("") + "</nav>";
  }

  /* ── 그리기 ── */
  function render(){
    var ok = on();
    document.body.classList.toggle("sbOn", ok);
    if(!ok){ host.hidden = true; host.textContent = ""; return; }
    if(document.body.classList.contains("inmenu")){ host.hidden = true; return; }
    var H; try{ H = TT_TODAY.home(); }catch(e){ console.warn("쌤비 홈:", e); return; }
    var P = pick(H), d = new Date();
    host.hidden = false;
    host.innerHTML = '<div class="sbWrap">'
      + '<div class="sbHero"><button type="button" class="sbOwl" id="sbOwl" title="쌤비 — 말로 입력 · 찾기 · 오늘 브리핑 (Alt+B)" aria-label="쌤비 열기">' + (ART ? ART.svg({item: P.item, deco: P.deco, open: P.open, sleep: P.sleep, listen: P.listen, size: 132}) : "🦉") + "</button>"
      + '<div class="sbBub" role="status"><div class="when">' + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + DOW[d.getDay()] + "요일 · " + clockTxt(d) + (H.events.length ? ' · <span class="ev">📌 ' + esc(H.events.join(" · ")) + "</span>" : "") + "</div>"
      + "<p>" + esc(P.line) + "</p>" + (P.sub ? "<small>" + esc(P.sub) + "</small>" : "") + "</div></div>"
      + '<div class="sbSearch" role="search">' + ic(I.search, 20) + '<label for="sbQ" class="sr">찾기 또는 한 줄 입력</label><input id="sbQ" type="search" autocomplete="off" placeholder="학생 · 도구 · 내선번호 찾기, 할 일 바로 적기">'
      + '<kbd title="어느 화면에서나 / 키로 찾기">/</kbd><button type="button" class="mic" data-mic aria-label="말로 기록" title="말로 기록 (쌤비)">' + ic(I.mic, 20) + "</button></div>"
      + '<div class="sbNowWrap">' + nowCard(H.now) + "</div>"
      + '<section class="sbTasks" aria-label="오늘 할 일">' + tasks(H.tasks) + "</section>"
      + shortcuts() + "</div>";
    var shown = Math.min(MAX, H.tasks.length);
    if(!st.more && window.innerWidth > 760 && shown > 2 && document.documentElement.scrollHeight > window.innerHeight + 2){ MAX = shown - 1; render(); }   // 넘치면 한 줄씩 줄여 스크롤 없이
  }

  /* ── 누르기 ── */
  host.addEventListener("click", function(e){
    var t = e.target.closest("button,a"); if(!t) return;
    if(t.id === "sbOwl"){ e.stopPropagation(); var bx = document.getElementById("sbBox"); if(window.TT_SSAMBI){ if(bx && !bx.hidden) TT_SSAMBI.close(); else TT_SSAMBI.open("menu", null, t); } return; }   // 다시 누르면 닫힘 (바깥 누르기로 바로 닫히지 않게 전파를 막음)
    if(t.hasAttribute("data-mic")){ e.stopPropagation(); if(window.TT_SSAMBI){ TT_SSAMBI.open("menu", null, document.getElementById("sbOwl")); var b = document.querySelector('#sbBox [data-a="listen"]'); if(b) b.click(); } return; }
    if(t.hasAttribute("data-go")){ TT_TODAY.act(cur[+t.dataset.go], t); return; }
    if(t.hasAttribute("data-done")){ TT_TODAY.done(cur[+t.dataset.done]); return; }
    if(t.hasAttribute("data-more")){ st.more = !st.more; render(); return; }
    if(t.hasAttribute("data-add")){ if(window.TT_FIND) TT_FIND.open("할 일: "); return; }
    if(t.hasAttribute("data-stamp")){ if(TT.joy){ if(TT.joy.stamped()) TT.joy.open(); else { TT.joy.stamp(); setTimeout(render, 300); } } return; }
    if(t.hasAttribute("data-plus")){ if(window.TTFollow) TTFollow.plusOneNow(+t.dataset.plus); setTimeout(render, 200); return; }
    if(t.dataset.m === "lib"){                                            // 자료실 = 학교 메뉴의 자료실 묶음
      var u = TT.store.get("tt_ui_v1", {}) || {}; u.mtab = u.mtab || {}; u.mtab.school = "lib"; TT.store.set("tt_ui_v1", u);
    }else if(t.dataset.m && t.dataset.m !== "lib"){
      var u2 = TT.store.get("tt_ui_v1", {}) || {}; if(u2.mtab && t.dataset.m === "school" && u2.mtab.school === "lib"){ u2.mtab.school = "all"; TT.store.set("tt_ui_v1", u2); }
    }
  });
  /* 검색창: 누르면 바로 공통 찾기 창(Ctrl+K)이 열리고 거기에 적습니다 — 찾기·한 줄 입력이 한곳에.
     (한글 입력 중에 창을 옮기면 글자가 깨지므로, 글자를 넣기 전에 엽니다) */
  host.addEventListener("focusin", function(e){
    if(e.target.id !== "sbQ" || !window.TT_FIND) return;
    var v = e.target.value; e.target.value = ""; e.target.blur(); TT_FIND.open(v);
  });
  document.addEventListener("keydown", function(e){                    // 어디서나 / → 찾기 (글 쓰는 칸 밖에서만)
    if(e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || !on()) return;
    var a = document.activeElement, tg = a && a.tagName;
    if(tg === "INPUT" || tg === "TEXTAREA" || tg === "SELECT" || (a && a.isContentEditable) || document.querySelector("dialog[open]")) return;
    e.preventDefault(); if(window.TT_FIND) TT_FIND.open("");
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

  window.TT_SBHOME = {render: render, pick: pick};
  render(); logo(); navIcons();
})();
