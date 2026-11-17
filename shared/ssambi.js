/* 쌤 노트 · 마스코트 챗봇 "쌤비" (쌤의 비서, 안경 쓴 부엉이) — v1.1
   오른쪽 아래 부엉이를 누르면 창이 열립니다. 한 화면(스크롤 없이)에 네 가지:
   ① 🎤 말로 입력 — 브라우저 음성 인식(크롬·엣지·삼성 인터넷). 알아들은 말을 이렇게 나눕니다.
        "12번 지각" / "홍길동 결석" → 우리 반 오늘 출결에 기록 (확인 단추를 눌러야 저장)
        "종례 내일 체육복" → 종례 바구니 · "할 일 금요일 공문 회신" → 내 할 일
        "찾아 줘 ○○" → 찾기 · "결석신고서" "시간표" 같은 도구 이름 → 바로 열기 · "브리핑" → 오늘 브리핑
        그 밖의 말은 찾기 창(Ctrl+K)에 넣어 고르게 합니다(학생 기록·할 일·종례 바구니).
   ② 🔎 찾기 — 기존 찾기 창(shared/today.js TT_FIND)을 엽니다.
   ③ ☀️ 오늘 브리핑 — 오늘 수업 · 챙길 일 · 종례 바구니 · 내 할 일 · 우리 반 출결. 🔊 읽어 주기는 숫자만 읽음(학생 이름 X).
   ④ ⚡ 바로 실행 — 자주 하는 일 단추.
   🔒 자료는 이 기기 안에서만 읽고 씁니다. 단, 음성 인식은 브라우저 회사(구글 등) 서버를 거칠 수 있어
      학생 이름 대신 번호로 말하기를 권합니다(창 아래 안내). 교실 기기(전자칠판) 모드에서는 쌤비를 숨깁니다. */
(function(){
  "use strict";
  if(typeof TT === "undefined" || TT.classroom) return;
  var KEYG = "tt_guide_v1", KEYU = "tt_ssambi_v1";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hm(m){ return Math.floor(m / 60) + ":" + pad(m % 60); }
  function tool(id){ return typeof ttTool === "function" ? ttTool(id) : null; }
  function tname(id, fb){ var t = tool(id); return t ? t.name : fb; }
  function go(href){ if(href) location.href = href; }
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  /* ── 부엉이 그림 (직접 그린 SVG, 외부 파일 없음) ── */
  var OWL = '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#E1F5EE"/>'
    + '<path d="M18 30 L24 14 L32 26 Z M62 30 L56 14 L48 26 Z" fill="#0F6E56"/><ellipse cx="40" cy="46" rx="24" ry="26" fill="#1D9E75"/>'
    + '<ellipse cx="40" cy="54" rx="14" ry="15" fill="#9FE1CB"/><circle cx="30" cy="38" r="9" fill="#fff" stroke="#04342C" stroke-width="2.5"/>'
    + '<circle cx="50" cy="38" r="9" fill="#fff" stroke="#04342C" stroke-width="2.5"/><line x1="39" y1="38" x2="41" y2="38" stroke="#04342C" stroke-width="2.5"/>'
    + '<g class="sbEye"><circle cx="31" cy="39" r="3.5" fill="#04342C"/><circle cx="49" cy="39" r="3.5" fill="#04342C"/></g>'
    + '<path d="M37 46 L40 50 L43 46 Z" fill="#EF9F27"/><rect x="50" y="56" width="14" height="10" rx="2" fill="#fff" stroke="#04342C" stroke-width="1.5"/>'
    + '<line x1="53" y1="60" x2="61" y2="60" stroke="#04342C" stroke-width="1.2"/></svg>';

  var st = document.createElement("style");
  st.textContent = ""
    + "#sbBtn{position:fixed;right:16px;bottom:18px;z-index:70;width:64px;height:64px;border:0;padding:0;border-radius:50%;background:none;cursor:pointer;filter:drop-shadow(0 4px 10px rgba(15,110,86,.28));-webkit-tap-highlight-color:transparent;transition:transform .15s}"
    + "#sbBtn:hover{transform:translateY(-2px) scale(1.04)}#sbBtn svg{width:100%;height:100%;display:block}"
    + "#sbBtn.on .sbEye{animation:sbBlink 3.2s infinite}@keyframes sbBlink{0%,92%,100%{transform:none}95%{transform:scaleY(.1)}}#sbBtn .sbEye{transform-origin:40px 39px}"
    + "#sbBtn.lis{animation:sbPulse 1s infinite}@keyframes sbPulse{50%{filter:drop-shadow(0 0 0 6px rgba(29,158,117,.35)) drop-shadow(0 0 14px rgba(29,158,117,.6))}}"
    + "#sbTip{position:fixed;right:88px;bottom:34px;z-index:70;max-width:min(240px,60vw);background:var(--card,#fff);color:var(--ink,#1f2a37);border:1px solid var(--line,#dde3ea);border-radius:14px 14px 4px 14px;padding:7px 11px;font-size:13px;line-height:1.45;box-shadow:0 6px 18px rgba(30,60,100,.14);cursor:pointer}"
    + "#sbBox{position:fixed;right:16px;bottom:92px;z-index:71;width:min(360px,calc(100vw - 24px));max-height:calc(100vh - 120px);overflow:auto;background:var(--card,#fff);color:var(--ink,#1f2a37);border:1px solid var(--line,#dde3ea);border-radius:16px;box-shadow:0 14px 36px rgba(30,60,100,.22);padding:12px 14px;font-size:14px;line-height:1.5}"
    + "#sbBox[hidden],#sbTip[hidden]{display:none}"
    + "#sbBox .hd{display:flex;align-items:center;gap:8px;margin-bottom:8px}#sbBox .hd .av{width:34px;height:34px;flex:none}#sbBox .hd .av svg{width:100%;height:100%}"
    + "#sbBox .hd b{font-size:15px}#sbBox .hd .x,#sbBox .hd .bk{margin-left:auto;border:0;background:none;font:inherit;font-size:18px;cursor:pointer;color:var(--sub,#5b6775);padding:2px 6px;border-radius:8px}#sbBox .hd .bk{margin-left:0;font-size:15px}"
    + "#sbBox .hd .x:hover,#sbBox .hd .bk:hover{background:var(--bg,#f3f6f9)}"
    + "#sbBox .g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}"
    + "#sbBox .bt{display:flex;align-items:center;gap:6px;min-height:46px;padding:8px 10px;border:1px solid var(--line,#dde3ea);border-radius:12px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;cursor:pointer;text-align:left;text-decoration:none;line-height:1.25}"
    + "#sbBox .bt:hover{border-color:#1D9E75;background:#E1F5EE;color:#04342C}#sbBox .bt i{font-style:normal;font-size:18px;flex:none}#sbBox .bt small{display:block;font-weight:500;font-size:11.5px;color:var(--sub,#5b6775)}"
    + "#sbBox .bt.p{background:#1D9E75;border-color:#1D9E75;color:#fff}#sbBox .bt.p:hover{background:#0F6E56}#sbBox .bt.p small{color:#E1F5EE}"
    + "#sbBox .nt{margin-top:8px;font-size:11.5px;color:var(--sub,#5b6775);line-height:1.45}"
    + "#sbBox .say{min-height:52px;border-radius:12px;background:var(--bg,#f3f6f9);padding:10px 12px;margin:2px 0 10px;font-size:15px}"
    + "#sbBox .say.ph{color:var(--sub,#8a95a1)}#sbBox .ok{color:#0F6E56;font-weight:700}#sbBox .er{color:var(--danger,#c62828)}"
    + "#sbBox .ex{font-size:12.5px;color:var(--sub,#5b6775);line-height:1.6}#sbBox .ex b{color:var(--ink,#1f2a37);font-weight:700}"
    + "#sbBox .row{display:flex;gap:8px;margin-top:8px}#sbBox .row .bt{flex:1;justify-content:center}"
    + "#sbBox .sec{margin:6px 0 2px;font-size:12px;font-weight:800;color:#0F6E56}"
    + "#sbBox .pds{display:flex;gap:3px;flex-wrap:wrap}#sbBox .pds span{flex:1;min-width:38px;text-align:center;border-radius:8px;background:var(--bg,#f3f6f9);padding:3px 0;font-size:12px;line-height:1.3}"
    + "#sbBox .pds span i{display:block;font-style:normal;font-size:10.5px;color:var(--sub,#8a95a1)}#sbBox .pds span.cur{background:#1D9E75;color:#fff}#sbBox .pds span.cur i{color:#E1F5EE}#sbBox .pds span.past{opacity:.45}"
    + "#sbBox ul{list-style:none;margin:0;padding:0}#sbBox li{display:flex;gap:6px;align-items:center;padding:2px 0;font-size:13.5px}"
    + "#sbBox li a{color:inherit;text-decoration:none;display:flex;gap:6px;flex:1;min-width:0}#sbBox li a:hover{text-decoration:underline}"
    + "#sbBox li .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#sbBox li .n{flex:none;font-size:11.5px;font-weight:800;border-radius:999px;padding:0 7px;background:#FAEEDA;color:#854F0B}"
    + "#sbBox li .n.hi{background:#FCEBEB;color:#A32D2D}"
    + "@media (max-width:760px){#sbBtn{bottom:calc(84px + env(safe-area-inset-bottom,0px));width:56px;height:56px;right:12px}#sbTip{bottom:calc(96px + env(safe-area-inset-bottom,0px));right:76px}#sbBox{bottom:calc(148px + env(safe-area-inset-bottom,0px));right:12px;max-height:calc(100vh - 170px)}}"
    + "@media print{#sbBtn,#sbBox,#sbTip{display:none!important}}";
  document.head.appendChild(st);

  var btn = document.createElement("button");
  btn.id = "sbBtn"; btn.type = "button"; btn.className = "on"; btn.title = "쌤비 — 말로 입력 · 찾기 · 오늘 브리핑 · 바로 실행"; btn.setAttribute("aria-label", "쌤비 열기");
  btn.innerHTML = OWL; document.body.appendChild(btn);
  var box = document.createElement("div"); box.id = "sbBox"; box.hidden = true; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "쌤비");
  document.body.appendChild(box);
  var tip = document.createElement("div"); tip.id = "sbTip"; tip.hidden = true; document.body.appendChild(tip);

  function head(title, back){
    return '<div class="hd">' + (back ? '<button type="button" class="bk" data-a="menu" aria-label="처음으로">←</button>' : '<span class="av">' + OWL + "</span>")
      + "<b>" + title + '</b><button type="button" class="x" data-a="close" aria-label="닫기">✕</button></div>';
  }
  function open(view, arg){ tip.hidden = true; box.hidden = false; show(view || "menu", arg); }
  function close(){ stopListen(); box.hidden = true; }
  function show(view, arg){ box.innerHTML = (V[view] || V.menu)(arg); var f = box.querySelector("[autofocus]"); if(f) f.focus(); }

  /* ── 화면들 ── */
  var V = {};
  V.menu = function(){
    var hr = new Date().getHours(), hi = hr < 11 ? "좋은 아침이에요!" : hr < 17 ? "무엇을 도와드릴까요?" : "오늘도 수고하셨어요.";
    return head("쌤비 <small style='font-weight:500;color:var(--sub,#5b6775)'>· " + hi + "</small>")
      + '<div class="g2">'
      + '<button type="button" class="bt p" data-a="listen" autofocus><i>🎤</i><span>말로 입력<small>"12번 지각"</small></span></button>'
      + '<button type="button" class="bt" data-a="find"><i>🔎</i><span>찾기<small>학생·도구·자료</small></span></button>'
      + '<button type="button" class="bt" data-a="brief"><i>☀️</i><span>오늘 브리핑<small>수업·챙길 일</small></span></button>'
      + '<button type="button" class="bt" data-a="run"><i>⚡</i><span>바로 실행<small>자주 하는 일</small></span></button>'
      + "</div>"
      + '<p class="nt">🔒 기록은 이 기기 안에만 저장돼요. 단축키: <b>Ctrl+K</b> 찾기</p>';
  };
  V.listen = function(a){
    a = a || {};
    var noSR = !SR;
    return head("🎤 말로 입력", true)
      + '<div class="say' + (a.text ? "" : " ph") + '" id="sbSay">' + (noSR ? '<span class="er">이 브라우저는 음성 인식을 지원하지 않아요. 크롬·엣지·삼성 인터넷에서 써 주세요. 아래 칸에 글로 적어도 됩니다.</span>' : a.text ? esc(a.text) : "듣고 있어요… 말씀해 주세요") + "</div>"
      + '<div class="row" style="margin-top:0"><input id="sbTxt" type="text" placeholder="또는 글로: 12번 지각" style="flex:1;min-width:0;height:40px;border:1px solid var(--line,#dde3ea);border-radius:10px;padding:0 10px;font:inherit;background:var(--card,#fff);color:inherit" autocomplete="off">'
      + '<button type="button" class="bt p" data-a="typed" style="flex:none;min-height:40px">확인</button></div>'
      + '<div class="row">' + (noSR ? "" : '<button type="button" class="bt" data-a="relisten">🎤 다시 듣기</button>') + "</div>"
      + '<div class="ex" style="margin-top:8px">이렇게 말해 보세요<br><b>12번 지각</b> · <b>5번 결석</b> · <b>종례 내일 체육복</b> · <b>할 일 금요일 공문 회신</b> · <b>결석신고서 열어</b> · <b>찾아 줘 교복</b> · <b>브리핑</b></div>'
      + '<p class="nt">🔒 음성 인식은 브라우저 회사 서버를 거칠 수 있어요. 학생은 <b>이름 대신 번호</b>로 말해 주세요.</p>';
  };
  V.confirm = function(c){
    return head("✔ 확인해 주세요", true)
      + '<div class="say">' + c.html + "</div>"
      + '<div class="row"><button type="button" class="bt p" data-a="yes" autofocus>' + esc(c.yes || "기록하기") + '</button><button type="button" class="bt" data-a="listen">다시 말하기</button></div>'
      + (c.note ? '<p class="nt">' + c.note + "</p>" : "");
  };
  V.brief = function(){
    var B = window.TT_TODAY && TT_TODAY.brief ? TT_TODAY.brief() : null;
    if(!B) return head("☀️ 오늘 브리핑", true) + '<div class="say ph">브리핑은 첫 화면에서 볼 수 있어요.</div>';
    var d = new Date(), DOW = "일월화수목금토", m = d.getHours() * 60 + d.getMinutes(), h = "";
    h += '<div class="sec">📅 ' + (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + DOW[d.getDay()] + ")" + (B.weekday && B.close ? " · 종례 " + hm(B.close) : "") + "</div>";
    if(!B.weekday) h += '<div class="ex">주말이에요. 푹 쉬세요!</div>';
    else if(!B.hasTT) h += '<div class="ex"><a href="apps/timetable/" style="color:#0F6E56;font-weight:700">🕘 시간표를 넣으면</a> 오늘 수업이 나와요.</div>';
    else if(!B.lessons.length) h += '<div class="ex">오늘은 수업이 없어요.</div>';
    else{
      var left = B.lessons.filter(function(x){ return x.end > m; }).length;
      h += '<div class="pds">' + B.lessons.map(function(x){ var c = m >= x.end ? "past" : m >= x.start ? "cur" : ""; return '<span class="' + c + '"><i>' + x.n + "교시</i>" + esc(x.c) + (x.chg ? "🔁" : "") + "</span>"; }).join("") + "</div>"
        + '<div class="ex" style="margin-top:3px">수업 ' + B.lessons.length + "시간 · 남은 수업 " + left + "시간</div>";
    }
    var it = B.items.slice(0, 5);
    h += '<div class="sec">✅ 챙길 일' + (B.items.length ? " " + B.items.length + "가지" : "") + "</div>";
    h += it.length ? "<ul>" + it.map(function(x){ var inner = '<span>' + x.ic + '</span><span class="t">' + esc(x.t) + '</span><span class="n' + (x.lv === "hi" ? " hi" : "") + '">' + esc(x.n) + "</span>";
      return "<li>" + (x.href ? '<a href="' + esc(x.href) + '">' + inner + "</a>" : inner) + "</li>"; }).join("") + "</ul>" : '<div class="ex">급한 일이 없어요. 👍</div>';
    var att = B.att;
    h += '<div class="sec">🌱 우리 반 · 종례 · 할 일</div><ul>'
      + (att ? '<li><a href="apps/tardy/"><span>🧭</span><span class="t">오늘 출결 (' + esc(att.name || "우리 반") + ")</span><span class=\"n\">" + (att.abs || att.late ? "결석 " + att.abs + " · 지각 " + att.late : "모두 출석") + "</span></a></li>" : "")
      + '<li><span>📣</span><span class="t">' + (B.bag.length ? esc(B.bag.slice(0, 2).join(" · ")) : "종례 바구니가 비어 있어요") + '</span>' + (B.bag.length ? '<span class="n">' + B.bag.length + "건</span>" : "") + "</li>"
      + '<li><span>📝</span><span class="t">' + (B.todoDue.length ? "오늘까지: " + esc(B.todoDue.slice(0, 2).join(" · ")) : "오늘까지 할 일 없음") + '</span><span class="n' + (B.todoDue.length ? " hi" : "") + '">' + B.todo + "건</span></li></ul>";
    return head("☀️ 오늘 브리핑", true) + h
      + '<div class="row"><button type="button" class="bt" data-a="speak">🔊 읽어 주기</button><button type="button" class="bt" data-a="listen">🎤 말로 입력</button></div>'
      + '<p class="nt">🔊 읽어 주기는 숫자만 읽고 학생 이름은 읽지 않아요.</p>';
  };
  function runList(){
    var L = [
      ["🧭", "지각·결석 기록", "말로: 12번 지각", function(){ show("listen"); startListen(); }],
      ["📄", "결석신고서", tname("tardy", "출결"), "apps/tardy/?tab=report", "tardy"],
      ["📣", "종례 바구니에 넣기", "종례에 전할 말", function(){ find("종례 "); }],
      ["📝", "할 일 넣기", "할 일: 날짜 + 내용", function(){ find("할 일: "); }],
      ["📒", tname("journal", "수업 기록"), "오늘 진도·메모", "apps/journal/", "journal"],
      ["📘", tname("book", "교과서 띄우기"), "수업 모드", "apps/book/", "book"],
      ["📦", tname("submit", "제출물 확인"), "미제출 모아 보기", "apps/submit/", "submit"],
      ["🔎", tname("lib", "자료실"), "서식·규정집", "apps/lib/", "lib"]
    ];
    return L.filter(function(x){ var t = x[4] && tool(x[4]); return !x[4] || (t && t.ready && (typeof ttToolShown !== "function" || ttToolShown(t))); });
  }
  V.run = function(){
    return head("⚡ 바로 실행", true) + '<div class="g2">' + runList().map(function(x, i){
      return '<button type="button" class="bt" data-r="' + i + '"><i>' + x[0] + "</i><span>" + esc(x[1]) + "<small>" + esc(x[2]) + "</small></span></button>"; }).join("") + "</div>"
      + '<p class="nt">말로도 돼요: "<b>결석신고서 열어</b>", "<b>시간표</b>"</p>';
  };

  /* ── 음성 인식 ── */
  var rec = null, listening = false;
  function stopListen(){ if(rec){ try{ rec.abort(); }catch(e){} } rec = null; listening = false; btn.classList.remove("lis"); }
  function startListen(){
    if(!SR){ var t = box.querySelector("#sbTxt"); if(t) t.focus(); return; }
    stopListen();
    rec = new SR(); rec.lang = "ko-KR"; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    var fin = "";
    rec.onresult = function(e){
      var s = ""; for(var i = e.resultIndex; i < e.results.length; i++){ s += e.results[i][0].transcript; if(e.results[i].isFinal) fin = s; }
      var say = box.querySelector("#sbSay"); if(say){ say.classList.remove("ph"); say.textContent = s; }
    };
    rec.onerror = function(e){
      var say = box.querySelector("#sbSay"); if(!say) return;
      say.classList.remove("ph");
      say.innerHTML = '<span class="er">' + (e.error === "not-allowed" || e.error === "service-not-allowed" ? "마이크 사용을 허용해 주세요 (주소창 옆 🔒 → 마이크 허용)." : e.error === "no-speech" ? "말소리가 들리지 않았어요. 다시 듣기를 눌러 주세요." : e.error === "network" ? "인터넷이 연결되어야 음성 인식이 돼요. 아래 칸에 글로 적어 주세요." : "잘 못 들었어요. 다시 듣기를 눌러 주세요.") + "</span>";
    };
    rec.onend = function(){ listening = false; btn.classList.remove("lis"); rec = null; if(fin.trim()) handle(fin.trim()); };
    try{ rec.start(); listening = true; btn.classList.add("lis"); }catch(e){}
  }

  /* ── 말 알아듣기 ── */
  function norm(s){ return String(s).replace(/[.。!?]+$/g, "").replace(/\s+/g, " ").trim(); }
  var NUMK = {"일":1,"이":2,"삼":3,"사":4,"오":5,"육":6,"칠":7,"팔":8,"구":9,"십":10};
  function korNum(s){                                                // "십이" → 12 (음성 인식이 숫자를 한글로 줄 때)
    if(/^\d+$/.test(s)) return +s;
    var m = s.match(/^([이삼사오육칠팔구])?십([일이삼사오육칠팔구])?$/); if(m) return (m[1] ? NUMK[m[1]] : 1) * 10 + (m[2] ? NUMK[m[2]] : 0);
    return NUMK[s] || 0;
  }
  function attCmd(t){
    var km = t.match(/(지각|결석|조퇴|결과)/); if(!km) return null;
    var home = TT.roster.home(); if(!home) return {err: "우리 반(★)이 정해지지 않았어요. 명렬표에서 우리 반을 지정해 주세요."};
    var S = home.students || [], who = null, m = t.match(/(\d{1,2}|[일이삼사오육칠팔구]?십[일이삼사오육칠팔구]?|[일이삼사오육칠팔구])\s*번/);
    if(m){ var no = korNum(m[1]); who = S.filter(function(s){ return +s.no === no; })[0]; if(!who) return {err: no + "번 학생이 " + esc(home.name) + "에 없어요."}; }
    else{ who = S.filter(function(s){ return s.name && t.indexOf(s.name) >= 0; })[0]; }
    if(!who) return null;
    var k = km[1] === "결석" ? "A" : "L";
    return {who: who, home: home, k: k, kn: km[1] === "결석" ? "결석" : "지각"};
  }
  function saveAtt(c){
    var G = TT.store.get(KEYG, null); if(!G || typeof G !== "object") return null;   // 출결을 한 번도 열지 않았으면(예전 자료 옮기기 전) 쓰지 않음
    G.att = G.att || {}; var td = ymd(new Date()), no = String(c.who.no);
    var r = c.k === "A" ? {t: "A", k: "sick"} : {t: "L"};
    (G.att[td] = G.att[td] || {})[no] = r;
    if(!TT.store.set(KEYG, G)) return false;
    try{ if(window.TT_TODAY) TT_TODAY.render(); }catch(e){}
    return true;
  }
  var TOOLWORD = [
    [/결석\s*신고서|결석계/, "apps/tardy/?tab=report"], [/상담\s*일지/, "apps/tardy/?tab=counsel"], [/출결/, "apps/tardy/"]
  ];
  function toolCmd(t){
    for(var i = 0; i < TOOLWORD.length; i++) if(TOOLWORD[i][0].test(t)) return TOOLWORD[i][1];
    var w = t.replace(/\s*(열어\s*줘|열어|켜\s*줘|켜|보여\s*줘|보여|띄워\s*줘|띄워|가자|가\s*줘)\s*$/, "").replace(/\s/g, "");
    if(w.length < 2 || typeof TT_TOOLS === "undefined") return null;
    var hit = TT_TOOLS.filter(function(x){ return x.ready && x.href && (typeof ttToolShown !== "function" || ttToolShown(x)) &&
      [x.name, x.short, x.old].some(function(n){ return n && n.replace(/\s/g, "") === w; }); })[0];
    return hit ? hit.href : null;
  }
  function find(q){ close(); if(window.TT_FIND) TT_FIND.open(q || ""); else TT.ui.toast("찾기는 첫 화면에서 쓸 수 있어요."); }
  function handle(raw){
    var t = norm(raw); if(!t) return;
    var say = box.querySelector("#sbSay"); if(say){ say.classList.remove("ph"); say.textContent = t; }
    if(/^(오늘\s*)?브리핑|^오늘\s*(일정|할\s*일\s*알려|뭐\s*있)/.test(t)){ show("brief"); return; }
    var fm = t.match(/^(.+?)\s*(찾아\s*줘|찾아|검색해\s*줘|검색)$/) || t.match(/^(?:찾아\s*줘|찾아|검색)\s+(.+)$/);
    if(fm){ find(fm[1]); return; }
    var a = attCmd(t);
    if(a && a.err){ if(say) say.innerHTML = '<span class="er">' + a.err + "</span>"; return; }
    if(a){
      pend = function(){ var ok = saveAtt(a); if(ok === null){ close(); TT.ui.toast("🦉 " + tname("tardy", "출결") + "을 처음 한 번 열어 준비해 주세요. 지금 열게요."); setTimeout(function(){ go("apps/tardy/"); }, 900); return; } if(ok){ close(); TT.ui.toast("🦉 " + a.who.no + "번 오늘 " + a.kn + "으로 기록했어요 · 사유·인정 구분은 출결에서"); } else TT.ui.toast("저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요."); };
      show("confirm", {html: "<b>" + esc(a.home.name) + " " + esc(a.who.no) + "번 " + esc(a.who.name) + "</b><br>오늘 <span class=\"ok\">" + a.kn + "</span>으로 기록할까요?",
        yes: a.kn + " 기록", note: a.k === "A" ? "결석은 우선 '질병'으로 저장돼요. 인정결·미인정은 " + esc(tname("tardy", "출결")) + "에서 바꿔 주세요." : "무단지각으로 저장돼요. 인정지각이면 " + esc(tname("tardy", "출결")) + "에서 바꿔 주세요."});
      return;
    }
    var href = toolCmd(t); if(href){ close(); go(href); return; }
    var q = t.replace(/^종례\s*(바구니에?)?\s*/, function(s){ return s ? "종례: " : s; }).replace(/^할\s*일\s*[:：]?\s*/, "할 일: ");
    find(q);
  }
  var pend = null;

  /* ── 누르기 ── */
  btn.addEventListener("click", function(){ if(box.hidden) open("menu"); else close(); });
  tip.addEventListener("click", function(){ open("brief"); });
  box.addEventListener("click", function(e){
    var b = e.target.closest("[data-a],[data-r]"); if(!b) return;
    if(b.dataset.r != null){ var x = runList()[+b.dataset.r]; if(!x) return; if(typeof x[3] === "function") x[3](); else { close(); if(TT.noteTool && x[4]) TT.noteTool(x[4]); go(x[3]); } return; }
    var a = b.dataset.a;
    if(a === "close") close();
    else if(a === "menu"){ stopListen(); show("menu"); }
    else if(a === "listen" || a === "relisten"){ show("listen"); startListen(); }
    else if(a === "typed"){ var v = box.querySelector("#sbTxt"); if(v && v.value.trim()) { stopListen(); handle(v.value); } }
    else if(a === "find") find("");
    else if(a === "brief") show("brief");
    else if(a === "run") show("run");
    else if(a === "yes"){ if(pend) pend(); pend = null; }
    else if(a === "speak") speak();
  });
  box.addEventListener("keydown", function(e){
    if(e.key === "Enter" && !e.isComposing && e.target.id === "sbTxt"){ e.preventDefault(); if(e.target.value.trim()){ stopListen(); handle(e.target.value); } }
  });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !box.hidden) close(); });
  document.addEventListener("click", function(e){ var P = e.composedPath ? e.composedPath() : []; if(!box.hidden && P.indexOf(box) < 0 && P.indexOf(btn) < 0 && P.indexOf(tip) < 0 && !(e.target.closest && e.target.closest("dialog"))) close(); });

  /* ── 읽어 주기 (숫자만) ── */
  function speak(){
    if(!window.speechSynthesis){ TT.ui.toast("이 브라우저는 읽어 주기를 지원하지 않아요."); return; }
    var B = TT_TODAY.brief(), d = new Date(), m = d.getHours() * 60 + d.getMinutes(), s = [];
    s.push((d.getMonth() + 1) + "월 " + d.getDate() + "일입니다.");
    if(B.weekday && B.lessons.length){
      var nx = B.lessons.filter(function(x){ return x.end > m; })[0];
      s.push("오늘 수업은 " + B.lessons.length + "시간" + (nx ? ", 다음은 " + nx.n + "교시 " + nx.c.replace("-", "학년 ") + "반입니다." : ", 모두 끝났습니다."));
    }
    s.push(B.items.length ? "챙길 일이 " + B.items.length + "가지 있습니다. " + B.items.slice(0, 3).map(function(x){ return x.t + " " + x.n; }).join(", ") + "." : "급한 일은 없습니다.");
    if(B.att) s.push(B.att.abs || B.att.late ? "우리 반 오늘 결석 " + B.att.abs + "명, 지각 " + B.att.late + "명입니다." : "우리 반은 모두 출석입니다.");
    if(B.bag.length) s.push("종례에 전할 말이 " + B.bag.length + "건 있습니다.");
    if(B.todoDue.length) s.push("오늘까지 할 일이 " + B.todoDue.length + "건 있습니다.");
    try{ speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(s.join(" ").replace(/D-(\d+)/g, "디데이 $1일")); u.lang = "ko-KR"; u.rate = 1.05; speechSynthesis.speak(u); }catch(e){}
  }

  /* ── 말풍선: 하루 한 번, 급한 챙길 일이 있으면 살짝 알려 줌 ── */
  setTimeout(function(){
    try{
      if(!window.TT_TODAY || !TT_TODAY.brief) return;
      var U = TT.store.get(KEYU, {}) || {}, td = ymd(new Date()); if(U.tip === td) return;
      var B = TT_TODAY.brief(), hi = B.items.filter(function(x){ return x.lv === "hi"; }).length;
      var msg = hi ? "챙길 일이 " + B.items.length + "가지 있어요. 눌러서 확인!" : B.weekday && B.lessons.length ? "오늘 수업 " + B.lessons.length + "시간! 브리핑 볼까요?" : "";
      if(!msg) return;
      tip.textContent = "🦉 " + msg; tip.hidden = false; U.tip = td; TT.store.set(KEYU, U);
      setTimeout(function(){ tip.hidden = true; }, 7000);
    }catch(e){}
  }, 1500);

  window.TT_SSAMBI = {open: open, close: close, handle: handle};
})();
