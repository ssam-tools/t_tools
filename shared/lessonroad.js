/* 🛤️ 수업 길 화면 (PLAN_수업길 2~6단계) — window.TT_ROAD
   자료(shared/lessonkit.js)를 6단계 화면으로 그립니다. 교과서·수업 모드(apps/book)와 수업 길 화면(apps/lessonkit)이 함께 씁니다.
   TT_ROAD.render(host, ctx) — ctx = {code, step, cls, nos:[번호], past:[{code, label}], tools:[TT_MTOOLS 도구], onTool(i, "open"|"qr"), onMode(m), onEnd(info), redraw()}
   · ① 다시 꺼내기: past(어제·일주일 전·한 달 전 단원)마다 문제 1개 — 그 단원 출구 질문 → 문항 생성기(MG) → 개념 카드 순으로 고름
   · ③ 배우기 · ⑥ 확인에서 onMode(1~4)로 교과서 수업 모드의 ①~④를 엽니다
   · ④ 해 보기: 수학 실험실(shared/mathlab.js) · ⑤ 1분 설명 미션 + 번호 뽑기(번호만) · ⑥ 나는 이제 할 수 있어요 → onEnd
   · 자료가 없는 단원도 기본 화면(개념 카드·문항 생성기·일반 발문)으로 6단계가 모두 돌아갑니다
   기록 "tt_road_v1" {log:[{d, c, code, st:[단계], can, ppl:[수학자]}]} — 번호·이름 없이 수업 단위로만(이 기기에만)
   jidangmath가 Claude와 함께 제작 */
(function(){
  "use strict";
  if(window.TT_ROAD) return;
  var K = window.TT_LESSONKIT || {steps: [], units: {}}, KEY = "tt_road_v1";
  var LABOF = {PRIME: "sieve", PYTH: "pyth", QE: "qe", QF: "qe", FACT: "qe", PROB: "prob", STAT1: "scatter", STAT2: "scatter"};
  var CSS = ".rd{display:flex;flex-direction:column;gap:10px;height:100%;min-height:0;color:#111}"
    + ".rd .pane{flex:1;min-height:0;display:grid;gap:10px}"
    + ".rd .box{background:#fff;border:1.5px solid #e3e6ea;border-radius:16px;padding:12px 16px;display:flex;flex-direction:column;gap:8px;min-height:0;overflow:auto}"
    + ".rd .box h3{margin:0;font-size:clamp(15px,1.3vw,19px);display:flex;gap:6px;align-items:center}"
    + ".rd .box h3 small{margin-left:auto;color:#777;font-weight:600;font-size:12.5px}"
    + ".rd .big{font-size:clamp(20px,2.4vw,36px);font-weight:900;line-height:1.4}"
    + ".rd .mid{font-size:clamp(15px,1.5vw,21px);line-height:1.6}"
    + ".rd .ans{font:inherit;font-size:clamp(13px,1.1vw,16px);font-weight:800;border:2px dashed #ccd;background:#fff;border-radius:12px;padding:6px 14px;cursor:pointer;align-self:flex-start}"
    + ".rd .ansv{font-size:clamp(15px,1.5vw,22px);font-weight:800;color:#b3261e;background:#fff6f3;border-radius:12px;padding:8px 14px;line-height:1.5}"
    + ".rd .lbl{align-self:flex-start;font-size:12.5px;font-weight:800;color:#fff;background:#2f6fb5;border-radius:6px;padding:1px 9px}"
    + ".rd .talk{display:flex;flex-direction:column;gap:6px}.rd .talk p{margin:0;padding:7px 12px;border-radius:14px;max-width:90%;line-height:1.55;font-size:clamp(14px,1.25vw,18px)}"
    + ".rd .talk .T{background:#e6f0fa;align-self:flex-start}.rd .talk .S{background:#f3f3f3;align-self:flex-end;color:#555}.rd .talk p b{font-size:12px;display:block;opacity:.7}"
    + ".rd .scene p{margin:0 0 .5em;line-height:1.65;font-size:clamp(14px,1.3vw,19px)}"
    + ".rd .fact{display:flex;gap:8px;font-size:13.5px;line-height:1.45}.rd .fact i{flex:none;font-style:normal;font-size:11.5px;font-weight:800;border-radius:6px;padding:1px 7px}"
    + ".rd .fact i.r{background:#e3f3ea;color:#2e7d4f}.rd .fact i.l{background:#f6efd9;color:#7a6a3a}"
    + ".rd .pp{border:1.5px solid #e3e6ea;border-radius:12px;padding:8px 10px;font-size:14px;line-height:1.5}.rd .pp b{font-size:16px}.rd .pp .w{color:#777;font-size:12px;font-weight:700}"
    + ".rd .why{font-size:clamp(13.5px,1.15vw,16px);line-height:1.6}.rd .why b{color:#2f6fb5}"
    + ".rd .k{font-size:12.5px;font-weight:800;color:#fff;border-radius:6px;padding:1px 9px;align-self:flex-start}"
    + ".rd ol.steps{margin:0;padding-left:1.3em;font-size:clamp(15px,1.4vw,20px);line-height:1.7}"
    + ".rd .words{display:flex;flex-wrap:wrap;gap:8px}.rd .words button,.rd .can button{font:inherit;font-weight:800;border:2px solid #dde3ea;background:#fff;border-radius:999px;padding:6px 14px;cursor:pointer;font-size:clamp(15px,1.4vw,20px)}"
    + ".rd .words button[aria-pressed=true]{background:#e3f3ea;border-color:#2e7d4f;color:#2e7d4f}"
    + ".rd .can button{display:block;width:100%;text-align:left;border-radius:12px;margin-bottom:6px}.rd .can button[aria-pressed=true]{background:#fff8e1;border-color:#e0a526}.rd .can button[aria-pressed=true]::before{content:'⭐ '}"
    + ".rd .tmr{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.rd .tmr b{font-size:clamp(30px,3.6vw,54px);font-variant-numeric:tabular-nums;min-width:2.8em}"
    + ".rd .tmr button,.rd .go{font:inherit;font-weight:900;border:2px solid #222;background:#fff;border-radius:12px;padding:6px 14px;cursor:pointer;color:#111;font-size:clamp(14px,1.2vw,18px)}"
    + ".rd .tmr b.end{color:#fff;background:#c2432a;border-radius:12px;padding:0 10px}"
    + ".rd .go.pri{background:#2d8a5b;border-color:#2d8a5b;color:#fff}.rd .go.y{background:#ffe066;border-color:#c99a00}"
    + ".rd .pick{font-size:clamp(46px,7vw,110px);font-weight:900;color:#2f6fb5;text-align:center;line-height:1.1}"
    + ".rd .line{font-size:clamp(17px,1.9vw,26px);font-weight:900;line-height:1.5;background:#fff8e1;border-left:6px solid #e0a526;padding:10px 14px}"
    + ".rd .lab{flex:1;min-height:260px;display:flex;flex-direction:column}"
    + ".rd .sw a{font-weight:800}.rd .sw div{font-size:14px;line-height:1.5}"
    + ".rd .none{color:#777;font-size:14px;line-height:1.6;margin:0;text-align:left}"
    + ".rd .rows{display:flex;gap:8px;flex-wrap:wrap}"
    + "@media (max-width:900px){.rd .pane{grid-template-columns:1fr!important}.rd .box{overflow:visible}}";
  function css(){ if(document.getElementById("rdCss")) return; var s = document.createElement("style"); s.id = "rdCss"; s.textContent = CSS; document.head.appendChild(s); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function today(){ var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function uinfo(code){ try{ return window.TTChallenge && TTChallenge.unit(code) || null; }catch(e){ return null; } }
  function uname(code){ var k = K.units[code]; if(k) return k.title; var u = uinfo(code); return u ? u.name : code || "이 단원"; }

  /* 수업 중 상태 (단원별) */
  var ST = {}, TM = {left: 0, iv: 0, total: 60}, PICK = {used: [], now: 0};
  function st(code){ return ST[code] || (ST[code] = {open: {}, words: {}, can: {}, seen: {}}); }

  /* ① 다시 꺼내기 문제: 출구 질문 → 문항 생성기 → 개념 카드 */
  function quiz(code, seed){
    var k = K.units[code];
    if(k && k.s6 && k.s6.exit) return {q: esc(k.s6.exit.q), a: esc(k.s6.exit.a)};
    try{
      var u = uinfo(code);
      if(u && window.MG){ var L = MG.units(u.g).filter(function(x){ return x.kw.test(u.name); })[0];
        if(L){ var id = L.ids[Math.abs(hash(seed + code)) % L.ids.length], o = MG.make(id, 1, seed + "|" + code); if(o) return {q: o.q, a: o.a}; } }
    }catch(e){}
    var C = window.TT_CONCEPTS && TT_CONCEPTS.CARDS[code];
    return {q: "‘" + esc(uname(code)) + "’에서 기억나는 것 한 가지를 말해 보세요.", a: C && C[0] ? C[0] : "개념 카드에서 확인해요"};
  }
  function hash(s){ var h = 0; for(var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
  function reveal(s, id, label, html){ return s.open[id] ? '<div class="ansv">' + html + "</div>" : '<button class="ans" data-rd-open="' + id + '">' + (label || "정답 보기") + "</button>"; }
  function tmrHtml(){ var l = TM.left; return '<div class="tmr"><b id="rdTm" class="' + (TM.iv || l ? "" : "") + '">' + Math.floor(l / 60) + ":" + pad(l % 60) + '</b><button data-rd-t="60">1분</button><button data-rd-t="120">2분</button><button data-rd-t="180">3분</button><button data-rd-t="stop">' + (TM.iv ? "⏸" : "■") + "</button></div>"; }

  /* 단계별 화면 */
  function s1(c){
    var s = st(c.code), items = (c.past || []).map(function(p){ var q = quiz(p.code, today()); return {lb: p.label + " · " + uname(p.code), q: q.q, a: q.a}; }), k = K.units[c.code];
    if(k && k.s1) items.push({lb: "오늘 준비", q: esc(k.s1.q), a: esc(k.s1.a)});
    if(!items.length) items.push({lb: "오늘 준비", q: "지난 시간에 배운 것 한 가지를 짝에게 말해 보세요.", a: "정답은 없어요. 떠올리는 것 자체가 연습이에요."});
    items = items.slice(0, 4);
    return '<div class="pane" style="grid-template-columns:repeat(' + items.length + ',minmax(0,1fr))">' + items.map(function(it, i){ return '<div class="box"><span class="lbl">' + esc(it.lb) + '</span><div class="big" style="font-size:clamp(18px,2vw,30px)">' + it.q + "</div>" + reveal(s, "q" + i, "정답 보기", it.a) + "</div>"; }).join("") + "</div>"
      + '<div class="none">🔁 공책 덮고 머릿속으로만 30초 · 하루·일주일·한 달 전 단원은 이 반 진도 기록에서 자동으로 골라요 · 틀려도 떠올리려 애쓴 순간 기억이 단단해져요</div>';
  }
  function s2(c){
    var k = K.units[c.code];
    if(!k){ var C = window.TT_CONCEPTS && TT_CONCEPTS.CARDS[c.code];
      return '<div class="pane" style="grid-template-columns:1fr"><div class="box"><h3>📜 ' + esc(uname(c.code)) + ' <small>이 단원 이야기는 준비 중이에요 (PLAN_수업길 7단계)</small></h3><div class="big" style="font-size:clamp(18px,2vw,28px)">❓ 이 단원을 배우면 무엇을 할 수 있게 될까요? 예상을 먼저 들어 보세요.</div>' + (C ? '<ul class="mid">' + C.slice(0, 4).map(function(t){ return "<li>" + t + "</li>"; }).join("") + "</ul>" : "") + "</div></div>"; }
    return '<div class="pane" style="grid-template-columns:1.3fr 1fr"><div class="box"><h3>📜 역사 속 한 장면 <small>약 3분</small></h3><div class="big" style="font-size:clamp(18px,2vw,28px)">❓ ' + esc(k.hook.q) + '</div><div class="scene">' + k.story.scene.map(function(p){ return "<p>" + esc(p) + "</p>"; }).join("") + "</div>"
      + '<h3>🎤 이렇게 열어요</h3><div class="talk">' + k.s2.map(function(l){ return '<p class="' + l[0] + '"><b>' + (l[0] === "T" ? "선생님" : "예상 반응") + "</b>" + esc(l[1]) + "</p>"; }).join("") + "</div></div>"
      + '<div class="box"><h3>🤔 왜 배우나</h3><div class="why"><b>생활 속</b> ' + esc(k.why.life) + "<br><b>다음에는</b> " + esc(k.why.next) + "</div><h3>👤 수학자 카드</h3>"
      + k.people.map(function(p){ return '<div class="pp"><b>' + esc(p.n) + '</b> <span class="w">' + esc(p.when) + "</span><br>" + esc(p.one) + "<br>💡 " + esc(p.fun) + "</div>"; }).join("")
      + "<h3>🔎 근거</h3>" + k.story.facts.map(function(f){ return '<div class="fact"><i class="' + (f.k === "기록" ? "r" : "l") + '">' + esc(f.k) + "</i><span>" + esc(f.t) + "</span></div>"; }).join("") + "</div></div>";
  }
  function s3(c){
    var k = K.units[c.code], s = st(c.code), T = {predict: ["예측", "#7a5cc2"], why: ["왜", "#c2432a"], compare: ["비교", "#2d8a5b"]};
    var Q = k ? k.s3 : {predict: {q: "오늘 개념으로 풀 수 있을 것 같은 문제는 어떤 문제일까요? 먼저 공책에 예상을 적어 보세요.", a: "교과서 첫 예제에서 확인해요."}, why: {q: "이 공식(성질)은 왜 성립할까요? 그림이나 예로 설명해 보세요.", a: "개념 정리 화면에서 함께 확인해요."}, compare: {q: "지난 단원에서 배운 것과 무엇이 같고 무엇이 다를까요?", a: "개념지도에서 앞 단원과 비교해 봐요."}};
    var btn = c.onMode ? '<div class="rows"><button class="go y" data-rd-mode="1">① 교과서 따라오기</button><button class="go y" data-rd-mode="2">② 개념 정리</button></div>' : '<div class="rows"><a class="go" href="../book/?lesson=1" style="text-decoration:none">📘 교과서 수업 모드</a><a class="go" href="../concept/?u=' + esc(c.code) + '" style="text-decoration:none">🗺️ 개념 카드</a></div>';
    return '<div class="pane" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + ["predict", "why", "compare"].map(function(key){ var x = Q[key]; return '<div class="box"><span class="k" style="background:' + T[key][1] + '">' + T[key][0] + '</span><div class="big" style="font-size:clamp(17px,1.8vw,26px)">' + esc(x.q) + "</div>" + reveal(s, "3" + key, "생각한 뒤 답 보기", esc(x.a)) + "</div>"; }).join("") + "</div>"
      + '<div class="none">📘 질문 하나를 띄우고 → 교과서·개념으로 가서 설명 → 다시 와서 답 확인. 정답을 바로 알려 주기보다 먼저 예상하게 해요.</div>' + btn;
  }
  function s4(c){
    var k = K.units[c.code], lab = (k && k.s4.lab) || (window.TT_MTOOLS && TT_MTOOLS.lab(c.code)) || LABOF[c.code] || "", paper = k ? k.s4.paper : null;
    var tools = c.tools || (window.TT_MTOOLS ? TT_MTOOLS.forPage(c.code, [], {}) : []);
    return '<div class="pane" style="grid-template-columns:' + (lab ? "1fr 1.6fr" : "1fr") + '"><div class="box"><h3>🔬 손으로 해 보기 <small>짝과 함께 · 약 8분</small></h3>'
      + (paper ? '<ol class="steps">' + paper.map(function(p){ return "<li>" + esc(p) + "</li>"; }).join("") + "</ol>" : '<div class="mid">교과서 탐구 활동을 짝과 함께 해 보세요. 결과를 예상 → 확인 → 이유 말하기 순서로.</div>')
      + (k && k.s4.sw.length ? '<div class="none">💡 ' + k.s4.sw.map(function(s){ return esc(s[0]) + ": " + esc(s[2]); }).join(" · ") + "</div>" : "")
      + (tools.length ? '<h3>🧰 이 차시 도구 <small>' + (c.onTool ? "안에 띄우기 · 학생에게 QR" : "새 창") + '</small></h3><div class="sw">' + tools.map(function(x, i){ return '<div class="rows" style="align-items:center;margin-bottom:6px"><b style="min-width:9em">' + esc(x.ic + " " + x.n) + '</b><span style="flex:1;font-size:13px;color:#555">' + esc(x.how) + "</span>"
          + (c.onTool ? '<button class="go" data-rd-tool="' + i + '">열기</button><button class="go" data-rd-tq="' + i + '">📱 학생에게</button>' : '<a class="go" href="' + esc(x.u) + '" target="_blank" rel="noopener" style="text-decoration:none">↗ 열기</a>') + "</div>"; }).join("") + "</div>" : "")
      + "</div>" + (lab ? '<div class="box"><h3>🧪 수학 실험실 <small>인터넷 없이 동작</small></h3><div class="lab" id="rdLab" data-lab="' + lab + '"></div></div>' : "") + "</div>";
  }
  function s5(c){
    var k = K.units[c.code], s = st(c.code), m = k ? k.s5.mission : {task: "오늘 배운 개념을 짝에게 1분 동안 설명해 보세요. 예를 하나 꼭 들어요.", words: ["오늘 배운 낱말", "예 하나", "왜 그런지"], ans: "설명을 들은 짝이 한 문장으로 다시 말해 보면 확인돼요."};
    var talk = k ? k.s5.talk : "오늘 배운 것 중 가장 헷갈리는 부분은 어디인가요? 짝과 이유를 나눠 보세요.";
    var nos = c.nos || [];
    return '<div class="pane" style="grid-template-columns:1fr 1.25fr .7fr"><div class="box"><h3>💬 짝 토의 <small>2~3분</small></h3><div class="big" style="font-size:clamp(17px,1.8vw,26px)">' + esc(talk) + "</div>"
      + '<div class="talk"><p class="T"><b>선생님</b>짝과 30초씩 번갈아 말해 볼게요. 정답보다 이유가 중요해요.</p><p class="T"><b>선생님</b>(발표 뒤) 방금 설명에서 가장 좋았던 한마디는 무엇이었나요?</p></div></div>'
      + '<div class="box"><h3>🧑‍🏫 1분 설명 미션 <small>A가 설명 → 역할 바꾸기</small></h3><div class="big" style="font-size:clamp(17px,1.8vw,26px)">' + esc(m.task) + "</div>" + tmrHtml()
      + '<div class="none">듣는 친구는 아래 말이 나오면 손가락을 하나씩 펴요</div><div class="words">' + m.words.map(function(w, i){ return '<button data-rd-w="' + i + '" aria-pressed="' + !!s.words[i] + '">' + esc(w) + "</button>"; }).join("") + "</div>" + reveal(s, "m", "풀이 보기", esc(m.ans)) + "</div>"
      + '<div class="box"><h3>🎯 발표 뽑기</h3>' + (nos.length ? '<div class="pick" id="rdPick">' + (PICK.now ? PICK.now + "번" : "?") + '</div><button class="go y" data-rd-pick="1">뽑기</button><div class="none">한 번 뽑힌 번호는 이 시간에 다시 안 나와요 (' + PICK.used.length + "/" + nos.length + ')</div>' : '<div class="none">반을 고르면 그 반 번호로 뽑아요 (교과서·수업 모드에서)</div>') + "</div></div>";
  }
  function s6(c){
    var k = K.units[c.code], s = st(c.code), ex = k ? {q: esc(k.s6.exit.q), a: esc(k.s6.exit.a)} : quiz(c.code, today() + "exit");
    var can = k ? k.s6.can : ["오늘 배운 개념을 내 말로 설명할 수 있어요", "교과서 문제를 혼자 풀 수 있어요", "친구의 질문에 답할 수 있어요"];
    var nCan = can.filter(function(x, i){ return s.can[i]; }).length;
    return '<div class="pane" style="grid-template-columns:1fr 1.1fr"><div class="box"><h3>✏️ 확인 <small>교과서 문제 → 도전 문제 → 출구 질문</small></h3>'
      + (c.onMode ? '<div class="rows"><button class="go y" data-rd-mode="3">③ 교과서 문제 (타이머)</button><button class="go y" data-rd-mode="4">④ 도전 문제</button></div>' : "")
      + '<span class="lbl" style="background:#c2432a">출구 질문</span><div class="big">' + ex.q + "</div>" + reveal(s, "x", "정답 보기", ex.a)
      + '<a class="go" href="../mcheck/" style="text-decoration:none;align-self:flex-start">✅ 형성평가 QR로 정답률 보기</a>'
      + (k ? '<h3>📌 오늘의 한 줄</h3><div class="line">' + esc(k.s6.line) + "</div>" : "") + "</div>"
      + '<div class="box"><h3>⭐ 나는 이제 할 수 있어요 <small>손 든 학생이 많으면 누르기</small></h3><div class="can">' + can.map(function(t, i){ return '<button data-rd-c="' + i + '" aria-pressed="' + !!s.can[i] + '">' + esc(t) + "</button>"; }).join("") + "</div>"
      + (k ? '<h3>🔙 처음 질문으로 돌아가기</h3><div class="mid">' + esc(k.hook.back) + "</div>" : "")
      + (c.onEnd ? '<button class="go pri" data-rd-end="1" style="align-self:flex-start;font-size:clamp(16px,1.6vw,22px)">🏁 오늘 수업 끝 <small style="font-weight:600">· ⭐ ' + nCan + "/" + can.length + "</small></button>" : "") + "</div></div>";
  }

  var HOST = null, CTX = null;
  function render(host, ctx){
    css(); HOST = host; CTX = ctx; var s = st(ctx.code); s.seen[ctx.step] = 1;
    var f = [null, s1, s2, s3, s4, s5, s6][ctx.step] || s1;
    host.innerHTML = '<div class="rd">' + f(ctx) + "</div>";
    var L = host.querySelector("#rdLab"); if(L && window.TT_LAB) TT_LAB.mount(L, L.dataset.lab);
    if(!host._rd){ host._rd = 1; host.addEventListener("click", click); }
  }
  function again(){ if(CTX && CTX.redraw) CTX.redraw(); else if(HOST) render(HOST, CTX); }
  function tick(){ TM.left = Math.max(0, TM.left - 1); var e = document.getElementById("rdTm"); if(e){ e.textContent = Math.floor(TM.left / 60) + ":" + pad(TM.left % 60); e.className = TM.left ? "" : "end"; } if(!TM.left){ clearInterval(TM.iv); TM.iv = 0; try{ var A = new (window.AudioContext || window.webkitAudioContext)(), o = A.createOscillator(); o.frequency.value = 880; o.connect(A.destination); o.start(); o.stop(A.currentTime + .4); }catch(e2){} } }
  function click(e){
    var b = e.target.closest("[data-rd-open],[data-rd-w],[data-rd-c],[data-rd-t],[data-rd-pick],[data-rd-mode],[data-rd-end],[data-rd-tool],[data-rd-tq]"); if(!b || !CTX) return;
    var s = st(CTX.code), d = b.dataset;
    if(d.rdOpen){ s.open[d.rdOpen] = 1; again(); return; }
    if(d.rdW != null){ s.words[d.rdW] = !s.words[d.rdW]; again(); return; }
    if(d.rdC != null){ s.can[d.rdC] = !s.can[d.rdC]; again(); return; }
    if(d.rdT){ clearInterval(TM.iv); TM.iv = 0; if(d.rdT !== "stop"){ TM.left = +d.rdT; TM.iv = setInterval(tick, 1000); } again(); return; }
    if(d.rdPick){ var nos = (CTX.nos || []).filter(function(n){ return PICK.used.indexOf(n) < 0; }); if(!nos.length){ PICK.used = []; nos = CTX.nos.slice(); } PICK.now = nos[Math.floor(Math.random() * nos.length)]; PICK.used.push(PICK.now); again(); return; }
    if(d.rdMode){ CTX.onMode && CTX.onMode(+d.rdMode); return; }
    if(d.rdTool != null){ CTX.onTool && CTX.onTool(+d.rdTool, "open"); return; }
    if(d.rdTq != null){ CTX.onTool && CTX.onTool(+d.rdTq, "qr"); return; }
    if(d.rdEnd){ var k = K.units[CTX.code], info = {code: CTX.code, st: Object.keys(s.seen).map(Number).sort(), can: Object.keys(s.can).filter(function(i){ return s.can[i]; }).length, canN: k ? k.s6.can.length : 3, ppl: k ? k.people.map(function(p){ return p.n; }) : [], m: Object.keys(s.words).filter(function(i){ return s.words[i]; }).length};
      log(CTX.cls, info); CTX.onEnd && CTX.onEnd(info); }
  }
  /* 수업 기록 (수업 단위, 번호·이름 없음) */
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY) || "null") || {log: []}; }catch(e){ return {log: []}; } }
  function log(cls, info){ var o = load(), d = today(); o.log = o.log.filter(function(x){ return !(x.d === d && x.c === cls && x.code === info.code); }); o.log.push({d: d, c: cls || 0, code: info.code, st: info.st, can: info.can, canN: info.canN, ppl: info.ppl}); if(o.log.length > 1000) o.log = o.log.slice(-1000); try{ localStorage.setItem(KEY, JSON.stringify(o)); }catch(e){} }
  function summary(cls){ var L = load().log.filter(function(x){ return !cls || x.c === cls; }), P = {}; L.forEach(function(x){ (x.ppl || []).forEach(function(p){ P[p] = 1; }); }); return {lessons: L.length, people: Object.keys(P), labs: L.filter(function(x){ return (x.st || []).indexOf(4) >= 0; }).length}; }
  /* 지난 진도(날짜·단원코드)에서 하루·일주일·한 달 전 단원 고르기 */
  function pastFrom(list, code){
    var d0 = new Date(today() + "T00:00:00"), out = [], used = {};
    used[code] = 1;
    [["지난 시간", 1, 6], ["일주일 전", 6, 20], ["한 달 전", 21, 75]].forEach(function(w){
      var best = null; list.forEach(function(x){ if(!x.code || used[x.code] || x.d >= today()) return; var g = Math.round((d0 - new Date(x.d + "T00:00:00")) / 864e5); if(g >= w[1] && g <= w[2] && (!best || Math.abs(g - (w[1] + w[2]) / 2) < Math.abs(best.g - (w[1] + w[2]) / 2))) best = {code: x.code, g: g}; });
      if(best){ used[best.code] = 1; out.push({code: best.code, label: w[0]}); }
    });
    return out;
  }
  window.TT_ROAD = {steps: K.steps, has: function(c){ return !!K.units[c]; }, render: render, past: pastFrom, summary: summary, name: uname};
})();
