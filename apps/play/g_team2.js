/* 🙌 함께 풀기 (더하기) — 369 게임 · 31 게임 · 어림 대장 · 3초 기억 · 오답 탐정 · 좌표 해전 */
(function(){
  "use strict";
  var h = K.h, btn = K.btn, ri = K.ri, pick = K.pick, sg = K.sg;
  K.css([
    /* 369 */
    ".t369{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;flex:1;width:100%}",
    ".t369 .num{font-size:clamp(90px,26vh,230px);font-weight:900;line-height:1;color:#2d3a48;transition:transform .1s}",
    ".t369 .num.beat{transform:scale(1.08)}",
    ".t369 .num.hidden{color:#cfd8e3}",
    ".t369 .prev{font-size:clamp(18px,3.4vh,30px);font-weight:800;color:var(--sub);min-height:1.4em}",
    ".t369 .rule{font-size:clamp(15px,2.6vh,22px);font-weight:800;background:#fff;border-radius:999px;padding:6px 18px}",
    ".beats{display:flex;gap:8px}.beats i{width:16px;height:16px;border-radius:50%;background:#dde3ea}.beats i.on{background:#f0a400}",
    /* 31 */
    ".g31{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;flex:1;width:100%;padding:10px}",
    ".g31 .grid{display:grid;grid-template-columns:repeat(8,1fr);gap:6px;width:min(860px,96%)}",
    ".g31 .grid span{background:#fff;border-radius:10px;text-align:center;font-weight:900;font-size:clamp(16px,3.4vh,30px);padding:clamp(4px,1vh,10px) 0;box-shadow:0 2px 0 #cfd8e3;color:#adb5bd;position:relative}",
    ".g31 .grid span.on{color:#fff}.g31 .grid span.last{background:#2d3a48!important;color:#fff}",
    ".g31 .grid span.key::after{content:'★';position:absolute;top:-4px;right:3px;font-size:13px;color:#f0a400}",
    ".g31 .who{font-size:clamp(18px,3.4vh,28px);font-weight:900}",
    /* 어림 */
    ".est{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;flex:1;width:100%;padding:10px}",
    ".est .guess{display:grid;gap:8px;width:min(980px,96%)}",
    ".est .guess label{background:#fff;border-radius:12px;padding:6px 8px;display:flex;flex-direction:column;gap:3px;font-weight:900;font-size:13px;border-top:6px solid #ccc}",
    ".est .guess input{font:inherit;font-size:clamp(16px,3vh,24px);font-weight:800;width:100%;border:1px solid var(--line);border-radius:8px;padding:4px 6px;text-align:right}",
    ".est .guess label.win{box-shadow:0 0 0 4px #ffd23f}",
    ".est .guess small{font-weight:700;color:var(--sub);min-height:1.2em}",
    /* 3초 기억 */
    ".mem3{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;flex:1;width:100%;padding:10px}",
    ".mem3 .pic{flex:1;min-height:0;width:min(900px,96%);background:#fff;border-radius:16px;box-shadow:0 4px 14px rgba(30,60,100,.12);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}",
    ".mem3 .pic svg{width:100%;height:100%}",
    ".mem3 .cover{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(40px,12vh,110px);font-weight:900;color:#adb5bd;background:#f8f9fa}",
    /* 오답 탐정 */
    ".wd{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;flex:1;width:100%;padding:10px}",
    ".wd .ttl{font-size:clamp(16px,2.8vh,24px);font-weight:900;color:#5b6773}",
    ".wd .ls{display:flex;flex-direction:column;gap:6px;width:min(860px,96%)}",
    ".wd .ls button{font:inherit;text-align:left;background:#fff;border:3px solid #e4eaf0;border-radius:12px;padding:clamp(4px,1vh,10px) 14px;font-size:clamp(18px,3.6vh,32px);font-weight:800;cursor:pointer;display:flex;gap:14px;align-items:center}",
    ".wd .ls button:hover{border-color:#a5c8f0}",
    ".wd .ls button .k{font-size:.75em;color:#8a96a3;width:1.4em}",
    ".wd .ls button.no{border-color:#d64545;background:#fdeceb;opacity:.7}.wd .ls button.ok{border-color:#2e9d5b;background:#e3f6e9}",
    ".wd .ls button.first{cursor:default;background:#f1f3f5}",
    ".wd .fix{font-size:clamp(16px,3vh,26px);font-weight:800;color:#2e7d4f;text-align:center;min-height:1.3em}",
    /* 좌표 해전 */
    ".sea{display:flex;gap:14px;width:100%;height:100%;padding:10px;align-items:center;justify-content:center}",
    ".sea .map{height:100%;aspect-ratio:1;max-width:64%}",
    ".sea .map svg{width:100%;height:100%}",
    ".sea .map .pt{cursor:pointer}",
    ".sea .map .pt:hover circle.h{fill:#ffd23f}",
    ".sea .side{display:flex;flex-direction:column;gap:10px;align-items:center;min-width:220px}",
    ".sea .last{font-size:clamp(26px,5.5vh,48px);font-weight:900;min-height:1.3em}",
    ".sea .ships{display:flex;flex-direction:column;gap:5px;font-size:15px;font-weight:800}",
    ".sea .ships span{display:inline-block;width:16px;height:16px;border-radius:4px;background:#4c8bf5;margin-right:2px;vertical-align:middle}",
    ".sea .ships .sunk span{background:#d64545}.sea .ships .sunk{text-decoration:line-through;color:#8a96a3}"
  ].join("\n"));

  /* =============== 👏 369 게임 =============== */
  var R369 = [
    ["369", "3·6·9가 들어가면 그 개수만큼 박수", function(n){ return (String(n).match(/[369]/g) || []).length; }],
    ["m3", "3의 배수면 박수", function(n){ return n % 3 ? 0 : 1; }],
    ["m4", "4의 배수면 박수", function(n){ return n % 4 ? 0 : 1; }],
    ["prime", "소수면 박수", function(n){ if(n < 2) return 0; for(var i = 2; i * i <= n; i++) if(n % i === 0) return 0; return 1; }],
    ["sq", "제곱수(1, 4, 9, …)면 박수", function(n){ var r = Math.round(Math.sqrt(n)); return r * r === n ? 1 : 0; }],
    ["s7", "7이 들어가거나 7의 배수면 박수", function(n){ return /7/.test(String(n)) || n % 7 === 0 ? 1 : 0; }]
  ];
  K.game({id: "g369", icon: "👏", cat: "team", name: "369 게임", desc: "박자에 맞춰 모둠 차례로 수를 말하다가 규칙에 맞는 수에서는 말 대신 박수! 3의 배수·소수·제곱수 규칙도 있어요.", mount: function(el, ctl){
    var rule = R369.filter(function(r){ return r[0] === K.pref("r369"); })[0] || R369[0], spd = K.pref("s369") || 1100, faster = K.pref("f369") !== false, hideN = !!K.pref("h369"), n = 0, iv = null, gap = spd, turnT = 0;
    var rs = h("select"); R369.forEach(function(r){ var o = h("option", "", r[1]); o.value = r[0]; rs.appendChild(o); }); rs.value = rule[0]; rs.onchange = function(){ rule = R369.filter(function(r){ return r[0] === rs.value; })[0]; K.pref("r369", rule[0]); reset(); };
    var ss = h("select"); [[1600, "🐢 느리게"], [1100, "🚶 보통"], [750, "🏃 빠르게"]].forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; ss.appendChild(x); }); ss.value = spd; ss.onchange = function(){ spd = +ss.value; K.pref("s369", spd); };
    function chk(label, val, fn){ var l = h("label", "sm"), c = h("input"); c.type = "checkbox"; c.checked = val; c.onchange = function(){ fn(c.checked); }; l.appendChild(c); l.appendChild(document.createTextNode(" " + label)); l.style.cssText = "display:flex;gap:4px;align-items:center"; return l; }
    ctl.appendChild(rs); ctl.appendChild(ss); ctl.appendChild(chk("점점 빠르게", faster, function(v){ faster = v; K.pref("f369", v); })); ctl.appendChild(chk("숫자 가리기", hideN, function(v){ hideN = v; K.pref("h369", v); draw(); }));
    var w = h("div", "t369"), tr = K.turnRow(), ru = h("div", "rule"), num = h("div", "num", "1"), beats = h("div", "beats"), prev = h("div", "prev"), row = h("div", "qrow");
    var go = h("button", "bigbtn g", "▶ 시작"), oops = h("button", "bigbtn r", "❌ 틀렸다!"), rst = h("button", "bigbtn k", "↺ 처음부터"); go.type = oops.type = rst.type = "button";
    for(var i = 0; i < 4; i++) beats.appendChild(h("i")); row.appendChild(go); row.appendChild(oops); row.appendChild(rst);
    w.appendChild(tr); w.appendChild(ru); w.appendChild(num); w.appendChild(beats); w.appendChild(prev); w.appendChild(row); el.appendChild(w);
    function say(k){ var c = rule[2](k); return c ? new Array(c + 1).join("👏") : String(k); }
    function draw(){ ru.textContent = "규칙: " + rule[1]; num.textContent = n ? (hideN ? "?" : String(n)) : "준비"; num.classList.toggle("hidden", hideN && n > 0); prev.textContent = n > 1 ? "방금 " + (n - 1) + " → " + say(n - 1) : ""; go.textContent = iv ? "⏸ 멈춤" : n ? "▶ 이어서" : "▶ 시작"; }
    function tick(){
      n++; K.setTurn(turnT); turnT = (turnT + 1) % K.teams().length; num.classList.add("beat"); setTimeout(function(){ num.classList.remove("beat"); }, 120);
      Array.prototype.forEach.call(beats.children, function(b, k){ b.classList.toggle("on", k === (n - 1) % 4); }); K.tone((n - 1) % 4 ? 900 : 1300, .05, "square", .1); draw();
      if(faster && n % 10 === 0 && gap > 450){ gap = Math.round(gap * .9); clearInterval(iv); iv = setInterval(tick, gap); K.big("⚡ 빨라져요!", n + " 돌파", "#c2410c", 700); }
    }
    function start(){ if(iv){ stop(); return; } gap = gap || spd; if(!n) gap = spd; iv = setInterval(tick, gap); tick(); draw(); }
    function stop(){ clearInterval(iv); iv = null; draw(); }
    function reset(){ stop(); n = 0; turnT = 0; gap = spd; K.setTurn(0); draw(); }
    go.onclick = start; rst.onclick = reset;
    oops.onclick = function(){
      if(!n) return; stop(); K.S.bad(); K.shake(num);
      K.big("❌ " + n + "에서 멈춤!", "정답: " + say(n), "#d64545", 1800);
      setTimeout(function(){ K.askTeam("틀린 모둠은? (−1점, 취소하면 점수 없이)", function(i){ K.add(i, -1); }); }, 1900);
    };
    reset();
    return function(){ clearInterval(iv); tr.cleanup(); };
  }});

  /* =============== 🍦 31 게임 =============== */
  K.game({id: "g31", icon: "🍦", cat: "team", name: "31 게임", desc: "번갈아 1~3개의 수를 이어 부르고, 31을 부르면 져요. 컴퓨터를 이기는 비밀은 4의 나머지에! (베스킨라빈스 게임)", mount: function(el, ctl){
    var mode = K.pref("m31") || "cpu", lvl = K.pref("l31") || 2, cur = 0, who = [], players, pi = 0, over = false, keyOn = false, cpuFirst = false;
    ctl.appendChild(K.seg([["cpu", "🤖 반 전체 vs 컴퓨터"], ["team", "👥 모둠끼리"]], mode, function(v){ mode = v; K.pref("m31", v); start(); }));
    var ls = h("select"); [[1, "🤖 쉬움"], [2, "🤖 보통"], [3, "🤖 고수"]].forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; ls.appendChild(x); }); ls.value = lvl; ls.onchange = function(){ lvl = +ls.value; K.pref("l31", lvl); };
    var kb = btn("💡 비밀 보기", "", function(){ keyOn = !keyOn; kb.classList.toggle("primary", keyOn); draw(); });
    ctl.appendChild(ls); ctl.appendChild(kb); ctl.appendChild(btn("🤖 컴퓨터 먼저", "", function(){ cpuFirst = true; start(); })); ctl.appendChild(btn("🔄 새 판", "primary", function(){ cpuFirst = false; start(); }));
    var w = h("div", "g31"), whoEl = h("div", "who"), grid = h("div", "grid"), row = h("div", "qrow"), hint = h("div", "hint"); w.appendChild(whoEl); w.appendChild(grid); w.appendChild(row); w.appendChild(hint); el.appendChild(w);
    function col(p){ return p.cpu ? "#2d3a48" : p.color; }
    function start(){
      cur = 0; who = []; over = false;
      players = mode === "cpu" ? [{name: "우리 반", color: "#4c8bf5"}, {name: "🤖 컴퓨터", cpu: true}] : K.teams().map(function(t){ return {name: t.name, color: t.color, i: t.i}; });
      pi = mode === "cpu" && cpuFirst ? 1 : 0; if(mode === "team") K.setTurn(0);
      ls.hidden = mode !== "cpu"; draw(); K.S.whoosh(); if(players[pi].cpu) setTimeout(cpuMove, 900);
    }
    function draw(){
      grid.innerHTML = "";
      for(var k = 1; k <= 31; k++){ var s = h("span", (k <= cur ? "on" : "") + (k === 31 && over ? " last" : "") + (keyOn && k % 4 === 2 ? " key" : ""), String(k)); if(k <= cur) s.style.background = col(players[who[k - 1]]); grid.appendChild(s); }
      row.innerHTML = "";
      if(over){ whoEl.textContent = "🏁 끝!"; return; }
      var p = players[pi]; whoEl.innerHTML = ""; var sp = h("span", "", p.name); sp.style.color = col(p); whoEl.appendChild(sp); whoEl.appendChild(document.createTextNode(" 차례"));
      [1, 2, 3].forEach(function(m){ if(cur + m > 31) return; var lab = []; for(var j = 1; j <= m; j++) lab.push(cur + j); var b = h("button", "bigbtn" + (m === 1 ? " g" : m === 2 ? "" : " y"), lab.join(" · ")); b.type = "button"; b.disabled = !!p.cpu; b.onclick = function(){ play(m); }; row.appendChild(b); });
      hint.textContent = keyOn ? "★ 칸(2, 6, 10, …, 30)을 내가 부르면, 상대가 무엇을 하든 다음 ★도 내가 부를 수 있어요. 30을 부르면 상대가 31!" : "한 번에 1개, 2개, 3개까지 이어서 부를 수 있어요. 31을 부르는 쪽이 져요.";
    }
    function play(m){
      if(over) return;
      for(var j = 0; j < m; j++){ cur++; who.push(pi); } K.S.pop(); K.tone(500 + cur * 20, .1, "triangle", .15);
      if(cur >= 31){ over = true; draw(); lose(pi); return; }
      pi = (pi + 1) % players.length; if(mode === "team") K.setTurn(players[pi].i); draw();
      if(players[pi].cpu) setTimeout(cpuMove, 800);
    }
    function cpuMove(){
      if(over) return; var m, need = (2 - cur % 4 + 4) % 4;   /* 다음 ★(4로 나눈 나머지 2)까지 */
      var smart = lvl === 3 || (lvl === 2 && (cur >= 18 || K.rnd(2)));
      if(smart && need >= 1 && need <= 3) m = need; else m = cur >= 30 ? 1 : ri(1, Math.min(3, 30 - cur || 1));
      if(cur + m > 31) m = 31 - cur; play(m);
    }
    function lose(p){
      var L = players[p];
      if(mode === "cpu"){ if(L.cpu){ K.S.win(); K.fireworks(5); K.big("🎉 우리 반 승리!", "컴퓨터가 31을 불렀어요", "#2e9d5b", 2600); } else { K.S.sad(); K.big("🤖 컴퓨터 승리", "비밀을 찾아볼까요? 💡", "#56606b", 2600); } return; }
      K.S.boom(); K.shake(); K.big("💥 " + L.name + " 31!", "−2점", L.color, 2200); K.add(L.i, -2);
    }
    start();
  }});

  /* =============== 📏 어림 대장 =============== */
  var EST_FACT = [
    ["하루는 몇 초일까?", 86400, "초"], ["1년(365일)은 몇 분일까?", 525600, "분"], ["100만 초는 며칠쯤일까?", 11.6, "일"], ["1억 초는 몇 년쯤일까?", 3.17, "년"],
    ["지구 한 바퀴(적도 둘레)는 약 몇 km일까?", 40075, "km"], ["지구의 반지름은 약 몇 km일까?", 6371, "km"], ["지구에서 달까지 평균 거리는 약 몇 km일까?", 384400, "km"],
    ["빛은 1초에 약 몇 km를 갈까?", 300000, "km"], ["햇빛이 지구까지 오는 데 약 몇 초 걸릴까?", 499, "초"], ["에베레스트산의 높이는 약 몇 m일까?", 8849, "m"],
    ["한라산의 높이는 약 몇 m일까?", 1947, "m"], ["백두산의 높이는 약 몇 m일까?", 2744, "m"], ["어른 몸의 뼈는 몇 개일까?", 206, "개"],
    ["바둑판에서 돌을 놓는 자리(교차점)는 몇 개일까?", 361, "개"], ["A4 용지(21 cm × 29.7 cm)의 넓이는 약 몇 cm²일까?", 623.7, "cm²"], ["1부터 100까지 모두 더하면?", 5050, ""],
    ["서울에서 부산까지 직선거리는 약 몇 km일까?", 325, "km"], ["국제 축구 경기장의 권장 길이는 몇 m일까?", 105, "m"], ["보폭 70 cm로 1 km를 걸으면 약 몇 걸음일까?", 1429, "걸음"],
    ["매일 10분씩 1년(365일) 공부하면 모두 몇 시간일까?", 60.8, "시간"], ["50 m × 25 m × 깊이 2 m 수영장에 물은 몇 L 들어갈까?", 2500000, "L"], ["주사위 3개를 던져 나올 수 있는 경우는 모두 몇 가지일까?", 216, "가지"],
    ["2를 20번 곱하면(2²⁰) 약 얼마일까?", 1048576, ""], ["1 m 정육면체 상자에 1 cm 정육면체를 가득 채우면 몇 개일까?", 1000000, "개"], ["한 변이 1 km인 정사각형 땅은 몇 m²일까?", 1000000, "m²"]
  ];
  var EST_GEN = [
    function(){ var a = ri(31, 99) * 10 + pick([-2, -1, 1, 2]), b = ri(11, 59) + pick([0, 0, 1]); return [a + " × " + b + " 을(를) 어림하면?", a * b, ""]; },
    function(){ var n; do{ n = ri(2, 300); } while(Math.round(Math.sqrt(n)) ** 2 === n); return ["√" + n + " 은(는) 약 얼마일까? (소수 둘째 자리까지)", Math.round(Math.sqrt(n) * 100) / 100, ""]; },
    function(){ var r = ri(3, 15); return ["반지름이 " + r + " cm인 원의 넓이는 약 몇 cm²일까? (π를 수로)", Math.round(Math.PI * r * r * 10) / 10, "cm²"]; },
    function(){ var d = pick([3, 6, 7, 9, 11, 12, 13, 17]); return ["1 ÷ " + d + " 을(를) 소수로 나타내면? (소수 셋째 자리까지)", Math.round(1000 / d) / 1000, ""]; },
    function(){ var n = ri(30, 200); return ["1부터 " + n + "까지 모두 더하면?", n * (n + 1) / 2, ""]; },
    function(){ var p = pick([7, 13, 17, 23, 37, 45, 62, 88]), x = ri(12, 98) * 10 + pick([3, 7]); return [x + "의 " + p + "%는 약 얼마일까?", Math.round(x * p) / 100, ""]; },
    function(){ var a = ri(101, 999), b = ri(11, 49); return [a + " ÷ " + b + " 은(는) 약 얼마일까? (소수 첫째 자리까지)", Math.round(a / b * 10) / 10, ""]; }
  ];
  function fmtN(x){ return Number(x).toLocaleString("ko-KR", {maximumFractionDigits: 3}); }
  K.game({id: "est", icon: "📏", cat: "team", name: "어림 대장", desc: "정답에 가장 가깝게 어림한 모둠이 이겨요! 생활 속 수(하루는 몇 초?)와 계산 어림(√50, 498×21). 모둠 답을 적으면 자동 판정.", mount: function(el, ctl){
    var kind = K.pref("estK") || "mix", Q, T = null, shown = false;
    ctl.appendChild(K.seg([["mix", "섞어서"], ["fact", "생활 속 수"], ["calc", "계산 어림"]], kind, function(v){ kind = v; K.pref("estK", v); next(); }));
    var sec = h("select"); [[0, "⏱ 시간 없음"], [30, "⏱ 30초"], [60, "⏱ 1분"]].forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; sec.appendChild(x); }); sec.value = K.pref("estT") || 30; sec.onchange = function(){ K.pref("estT", sec.value); };
    ctl.appendChild(sec);
    var w = h("div", "est"), tm = h("div", "tmr"), box = h("div", "qbox"), q = h("div", "q"), an = h("div", "ans"), gs = h("div", "guess"), row = h("div", "qrow");
    var show = h("button", "bigbtn y", "👀 정답 공개"), nx = h("button", "bigbtn", "⏭ 다음 문제"); show.type = nx.type = "button"; row.appendChild(show); row.appendChild(nx);
    box.appendChild(q); box.appendChild(an); w.appendChild(tm); w.appendChild(box); w.appendChild(gs); w.appendChild(row); el.appendChild(w);
    function gen(){ var useF = kind === "fact" || (kind === "mix" && K.rnd(2)); var x = useF ? pick(EST_FACT) : pick(EST_GEN)(); return {q: x[0], a: x[1], u: x[2]}; }
    function next(){
      Q = K.fresh("est", gen, function(x){ return x.q; }, 15); shown = false; q.textContent = Q.q; an.textContent = ""; K.S.whoosh();
      box.style.animation = "none"; void box.offsetWidth; box.style.animation = "dealin .45s";
      gs.innerHTML = ""; gs.style.gridTemplateColumns = "repeat(" + K.teams().length + ",1fr)";
      K.teams().forEach(function(t){ var l = h("label"); l.style.borderTopColor = t.color; l.appendChild(h("span", "", t.name)); var i = h("input"); i.inputMode = "decimal"; i.placeholder = Q.u || "답"; l.appendChild(i); l.appendChild(h("small")); gs.appendChild(l); });
      if(T) T.stop(); tm.innerHTML = ""; tm.classList.remove("over"); if(+sec.value) T = K.timer(tm, +sec.value, function(){ K.big("⏰ 시간 끝!", "답을 적어 주세요", "#d64545", 1200); });
    }
    show.onclick = function(){
      if(shown) return; shown = true; if(T) T.stop(); K.S.drum(1);
      setTimeout(function(){
        an.textContent = "정답: " + fmtN(Q.a) + " " + (Q.u || ""); K.S.fanfare();
        var L = gs.querySelectorAll("label"), d = [], best = Infinity;
        Array.prototype.forEach.call(L, function(l, i){ var v = parseFloat(l.querySelector("input").value.replace(/[, ]/g, "").replace("−", "-")); if(isNaN(v)){ d[i] = null; return; } d[i] = Math.abs(v - Q.a); best = Math.min(best, d[i]); l.querySelector("small").textContent = "차이 " + fmtN(Math.round(d[i] * 1000) / 1000) + (Q.a ? " (" + Math.round(d[i] / Math.abs(Q.a) * 100) + "%)" : ""); });
        if(best === Infinity){ K.big(fmtN(Q.a) + " " + (Q.u || ""), "정답", "#c2410c", 1600); setTimeout(function(){ K.award("2", "📏 가장 가까운 모둠은?"); }, 1700); return; }
        var win = []; d.forEach(function(x, i){ if(x === best){ win.push(i); L[i].classList.add("win"); } });
        win.forEach(function(i){ K.add(i, 2); }); K.fireworks(2);
        K.big("📏 " + win.map(function(i){ return K.teams()[i].name; }).join(", "), "가장 가까워요! +2 (정답 " + fmtN(Q.a) + ")", K.teams()[win[0]].color, 2400);
      }, 1000);
    };
    nx.onclick = next;
    next();
    return function(){ if(T) T.stop(); };
  }});

  /* =============== ⚡ 3초 기억 =============== */
  var PIPS = {1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]};
  var SHAPE = {
    "삼각형": function(x, y, r, c){ return '<polygon points="' + x + "," + (y - r) + " " + (x + r * .9) + "," + (y + r * .7) + " " + (x - r * .9) + "," + (y + r * .7) + '" fill="' + c + '"/>'; },
    "사각형": function(x, y, r, c){ return '<rect x="' + (x - r * .8) + '" y="' + (y - r * .8) + '" width="' + r * 1.6 + '" height="' + r * 1.6 + '" rx="3" fill="' + c + '"/>'; },
    "원": function(x, y, r, c){ return '<circle cx="' + x + '" cy="' + y + '" r="' + r * .85 + '" fill="' + c + '"/>'; },
    "별": function(x, y, r, c){ var p = []; for(var i = 0; i < 10; i++){ var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; p.push((x + Math.cos(a) * rr).toFixed(1) + "," + (y + Math.sin(a) * rr).toFixed(1)); } return '<polygon points="' + p.join(" ") + '" fill="' + c + '"/>'; }
  };
  var SCOLS = ["#e03131", "#1c7ed6", "#2f9e44", "#f08c00"], SCN = {"#e03131": "빨간", "#1c7ed6": "파란", "#2f9e44": "초록", "#f08c00": "주황"};
  function spread(n, W, H, r){ var pts = [], g = 0; while(pts.length < n && g++ < 5000){ var x = ri(r + 4, W - r - 4), y = ri(r + 4, H - r - 4); if(pts.every(function(p){ return (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y) > (2.3 * r) * (2.3 * r); })) pts.push([x, y]); } return pts; }
  function memGen(mode){
    var W = 600, H = 340, s = "", q, a;
    if(mode === "group"){
      var k = ri(2, 6), m = ri(2, 6), cols = k <= 3 ? k : Math.ceil(k / 2), rows = Math.ceil(k / cols), cw = W / cols, ch = H / rows;
      for(var i = 0; i < k; i++){ var cx = cw * (i % cols + .5), cy = ch * (Math.floor(i / cols) + .5); s += '<rect x="' + (cx - 62) + '" y="' + (cy - 62) + '" width="124" height="124" rx="18" fill="#fff4e6" stroke="#ffc078" stroke-width="3"/>'; PIPS[m].forEach(function(p){ s += '<circle cx="' + (cx + p[0] * 36) + '" cy="' + (cy + p[1] * 36) + '" r="14" fill="#e8590c"/>'; }); }
      q = "점은 모두 몇 개?"; a = k * m; return {svg: s, q: q, a: a, ex: k + " 묶음 × " + m + "개 = " + a, key: "g" + k + "x" + m};
    }
    if(mode === "dots"){ var n = ri(7, 24); spread(n, W, H, 15).forEach(function(p){ s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" fill="#1c7ed6"/>'; }); return {svg: s, q: "점은 모두 몇 개?", a: n, ex: "점 " + n + "개", key: "d" + n + "|" + K.rnd(9999)}; }
    if(mode === "dice"){ var dn = ri(3, 5), vs = [], dx = W / dn; for(var d = 0; d < dn; d++){ var v = ri(1, 6); vs.push(v); var X = dx * (d + .5), Y = H / 2; s += '<rect x="' + (X - 55) + '" y="' + (Y - 55) + '" width="110" height="110" rx="16" fill="#fff" stroke="#495057" stroke-width="4"/>'; PIPS[v].forEach(function(p){ s += '<circle cx="' + (X + p[0] * 30) + '" cy="' + (Y + p[1] * 30) + '" r="11" fill="' + (v === 1 ? "#e03131" : "#212529") + '"/>'; }); }
      return {svg: s, q: "주사위 눈의 합은?", a: vs.reduce(function(x, y){ return x + y; }, 0), ex: vs.join(" + ") + " = " + vs.reduce(function(x, y){ return x + y; }, 0), key: "dc" + vs.join("")}; }
    var names = K.shuffle(Object.keys(SHAPE)).slice(0, 3), total = ri(10, 18), pts = spread(total, W, H, 20), cnt = {}, target = names[0], tc = pick(SCOLS), askCol = K.rnd(2), c2 = 0;
    pts.forEach(function(p, i){ var nm = i < 3 ? names[i] : pick(names), c = pick(SCOLS); s += SHAPE[nm](p[0], p[1], 20, c); cnt[nm] = (cnt[nm] || 0) + 1; if(nm === target && c === tc) c2++; });
    if(askCol && c2 > 0) return {svg: s, q: SCN[tc] + " " + target + "은(는) 몇 개?", a: c2, ex: SCN[tc] + " " + target + " " + c2 + "개", key: "s" + K.rnd(99999)};
    return {svg: s, q: target + "은(는) 몇 개?", a: cnt[target], ex: target + " " + cnt[target] + "개 (전체 " + total + "개)", key: "s" + K.rnd(99999)};
  }
  K.game({id: "flash", icon: "⚡", cat: "team", name: "3초 기억", desc: "그림을 잠깐만 보여 주고 가려요. 점은 모두 몇 개? 삼각형은? 주사위 눈의 합은? 묶어 세기·빠른 셈 연습.", mount: function(el, ctl){
    var mode = K.pref("flM") || "group", secs = +(K.pref("flS") || 3), cur = null, phase = "ready", tmo = null;
    ctl.appendChild(K.seg([["group", "점 묶음"], ["dots", "흩어진 점"], ["shape", "도형 세기"], ["dice", "주사위 합"]], mode, function(v){ mode = v; K.pref("flM", v); ready(); }));
    var ss = h("select"); [1, 2, 3, 5].forEach(function(n){ var o = h("option", "", "👁 " + n + "초"); o.value = n; ss.appendChild(o); }); ss.value = secs; ss.onchange = function(){ secs = +ss.value; K.pref("flS", secs); };
    var aw = K.awardSel("flAward"); ctl.appendChild(ss); ctl.appendChild(aw);
    var w = h("div", "mem3"), q = h("div", "q"), pic = h("div", "pic"), cover = h("div", "cover", "?"), an = h("div", "ans"), row = h("div", "qrow");
    var go = h("button", "bigbtn y", "👁 보여 주기"), sh = h("button", "bigbtn k", "👀 정답"), ok = h("button", "bigbtn g", "✅ 맞힌 모둠"); go.type = sh.type = ok.type = "button";
    row.appendChild(go); row.appendChild(sh); row.appendChild(ok); w.appendChild(q); w.appendChild(pic); w.appendChild(an); w.appendChild(row); el.appendChild(w);
    function ready(){
      clearTimeout(tmo); cur = K.fresh("flash", function(){ return memGen(mode); }, function(x){ return x.key; }, 30); phase = "ready";
      pic.innerHTML = '<svg viewBox="0 0 600 340">' + cur.svg + "</svg>"; cover.textContent = "준비되면 👁"; pic.appendChild(cover); q.textContent = "잘 보세요! " + secs + "초만 보여 줘요"; an.textContent = ""; go.textContent = "👁 보여 주기"; sh.disabled = ok.disabled = true; go.disabled = false;
    }
    async function show(){
      if(phase !== "ready") return; phase = "count"; go.disabled = true;
      for(var c = 3; c >= 1; c--){ cover.textContent = c; K.tone(800, .1, "square", .12); await K.sleep(650); if(phase !== "count") return; }
      cover.remove(); K.S.pop(); phase = "show"; q.textContent = "👁 보세요!";
      tmo = setTimeout(function(){ cover.textContent = "?"; pic.appendChild(cover); K.S.whoosh(); phase = "ask"; q.textContent = cur.q; sh.disabled = ok.disabled = false; }, secs * 1000);
    }
    go.onclick = function(){ if(phase === "done") ready(); else show(); };
    function reveal(){ cover.remove(); an.textContent = "정답 " + cur.a + " · " + cur.ex; phase = "done"; go.disabled = false; go.textContent = "⏭ 다음 그림"; K.S.fanfare(); }
    sh.onclick = function(){ if(phase === "ask") reveal(); };
    ok.onclick = function(){ if(phase === "ask") reveal(); K.award(aw.value); };
    ready();
    return function(){ clearTimeout(tmo); phase = "x"; };
  }});

  /* =============== 🔎 오답 탐정 =============== */
  function tm(c, v, first){ /* 계수 c, 문자 v (빈칸이면 상수) */ if(!c) return ""; var a = Math.abs(c), s = v ? (a === 1 ? "" : a) + v : String(a); return first ? (c < 0 ? "−" : "") + s : (c < 0 ? " − " : " + ") + s; }
  function ex(terms){ var o = "", f = true; terms.forEach(function(t){ if(!t[0]) return; o += tm(t[0], t[1], f); f = false; }); return o || "0"; }
  function P(n){ return n < 0 ? "(" + sg(n) + ")" : String(n); }
  function fr(n, d){ if(d < 0){ n = -n; d = -d; } var g = K.gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? sg(n) : (n < 0 ? "−" : "") + '<span class="frac"><span>' + Math.abs(n) + "</span><span>" + d + "</span></span>"; }
  function sup(x, n){ return n === 1 ? x : x + "<sup>" + n + "</sup>"; }
  var WRONG = [
    {g: 1, f: function(){ /* 거듭제곱이 있는 정수 계산 */
      var a = ri(2, 5), b = ri(2, 6), c = ri(2, 6), v1 = -a * a, v2 = -b * c, e = K.rnd(2);
      var L = ["−" + a + "² + " + b + " × (−" + c + ")"];
      if(e === 0){ L.push("= " + (a * a) + " + (" + sg(v2) + ")", "= " + sg(a * a + v2)); return {t: "계산하기", L: L, bad: 1, fix: "−" + a + "² = −(" + a + "×" + a + ") = " + sg(v1) + " 이므로 = " + sg(v1) + " + (" + sg(v2) + ")"}; }
      L.push("= " + sg(v1) + " + (" + sg(v2) + ")", "= " + sg(v1 - v2)); return {t: "계산하기", L: L, bad: 2, fix: sg(v1) + " + (" + sg(v2) + ") = " + sg(v1 + v2)};
    }},
    {g: 1, f: function(){ /* 일차방정식 */
      var x = K.rnd(2) ? ri(1, 7) : -ri(1, 7), a = ri(2, 7), c = ri(-4, a - 1); if(c === 0) c = -1; var b = ri(-9, 9) || 4, d = (a - c) * x + b, e = K.rnd(3); if(e === 1 && a + c === 0) e = 2;
      var L = [ex([[a, "x"], [b, ""]]) + " = " + ex([[c, "x"], [d, ""]])];
      if(e === 0){ L.push(ex([[a, "x"], [-c, "x"]]) + " = " + sg(d) + (b < 0 ? " − " + -b : " + " + b)); var r = d + b; L.push(tm(a - c, "x", true) + " = " + sg(r), "x = " + fr(r, a - c)); return {t: "방정식 풀기", L: L, bad: 1, fix: "이항하면 부호가 바뀌어요: " + ex([[a, "x"], [-c, "x"]]) + " = " + sg(d) + (b < 0 ? " + " + -b : " − " + b)}; }
      L.push(ex([[a, "x"], [-c, "x"]]) + " = " + sg(d) + (b < 0 ? " + " + -b : " − " + b));
      if(e === 1){ L.push(tm(a + c, "x", true) + " = " + sg(d - b), "x = " + fr(d - b, a + c)); return {t: "방정식 풀기", L: L, bad: 2, fix: ex([[a, "x"], [-c, "x"]]) + " = " + tm(a - c, "x", true) + " 이므로 " + tm(a - c, "x", true) + " = " + sg(d - b)}; }
      L.push(tm(a - c, "x", true) + " = " + sg(d - b), "x = " + fr(a - c, d - b)); return {t: "방정식 풀기", L: L, bad: 3, fix: "양변을 " + P(a - c) + "(으)로 나누면 x = " + fr(d - b, a - c)};
    }},
    {g: 2, f: function(){ /* 분배법칙 */
      var k = ri(2, 5), a = ri(2, 5), b = ri(1, 9), m = ri(2, 9) * (K.rnd(2) ? 1 : -1), e = K.rnd(2);
      var L = ["−" + k + "(" + ex([[a, "x"], [-b, ""]]) + ") " + (m < 0 ? "− " + -m : "+ " + m) + "x"];
      if(e === 0){ L.push("= " + ex([[-k * a, "x"], [-k * b, ""], [m, "x"]]), "= " + ex([[m - k * a, "x"], [-k * b, ""]])); return {t: "식 간단히 하기", L: L, bad: 1, fix: "−" + k + " × (−" + b + ") = +" + k * b + " → = " + ex([[-k * a, "x"], [k * b, ""], [m, "x"]])}; }
      L.push("= " + ex([[-k * a, "x"], [k * b, ""], [m, "x"]]), "= " + ex([[m + k * a, "x"], [k * b, ""]])); return {t: "식 간단히 하기", L: L, bad: 2, fix: "동류항: " + sg(-k * a) + "x " + (m < 0 ? "− " + -m : "+ " + m) + "x = " + tm(m - k * a, "x", true) + " → = " + ex([[m - k * a, "x"], [k * b, ""]])};
    }},
    {g: 2, f: function(){ /* 지수법칙 */
      var a = ri(2, 4), b = ri(2, 4), c = ri(2, 6), d = ri(1, 5), e = K.rnd(2), L = ["(" + sup("x", a) + ")" + "<sup>" + b + "</sup> × " + sup("x", c) + " ÷ " + sup("x", d)];
      if(e === 0){ L.push("= " + sup("x", a + b) + " × " + sup("x", c) + " ÷ " + sup("x", d), "= " + sup("x", a + b + c - d)); return {t: "지수법칙", L: L, bad: 1, fix: "(x<sup>a</sup>)<sup>b</sup> = x<sup>a×b</sup> → = " + sup("x", a * b) + " × " + sup("x", c) + " ÷ " + sup("x", d)}; }
      L.push("= " + sup("x", a * b) + " × " + sup("x", c) + " ÷ " + sup("x", d), "= " + sup("x", a * b * c - d)); return {t: "지수법칙", L: L, bad: 2, fix: "곱하면 지수를 더해요: = " + sup("x", a * b + c - d)};
    }},
    {g: 3, f: function(){ /* 곱셈 공식 */
      var a = ri(2, 9), s = K.rnd(2) ? 1 : -1, e = K.rnd(2), L = ["(" + ex([[1, "x"], [s * a, ""]]) + ")²", "= (" + ex([[1, "x"], [s * a, ""]]) + ")(" + ex([[1, "x"], [s * a, ""]]) + ")"];
      if(e === 0){ L.push("= " + ex([[1, "x²"], [a * a, ""]])); return {t: "전개하기", L: L, bad: 2, fix: "가운데 항을 빠뜨렸어요: = " + ex([[1, "x²"], [2 * s * a, "x"], [a * a, ""]])}; }
      L.push("= " + ex([[1, "x²"], [s * a, "x"], [s * a, "x"], [a * a, ""]]), "= " + ex([[1, "x²"], [2 * s * a, "x"], [-a * a, ""]])); return {t: "전개하기", L: L, bad: 3, fix: P(s * a) + " × " + P(s * a) + " = +" + a * a + " → = " + ex([[1, "x²"], [2 * s * a, "x"], [a * a, ""]])};
    }},
    {g: 3, f: function(){ /* 인수분해로 이차방정식 */
      var r1 = ri(1, 8) * (K.rnd(2) ? 1 : -1), r2 = ri(1, 8) * (K.rnd(2) ? 1 : -1); if(r1 === r2) r2 = -r2 || 3; var e = K.rnd(2);
      var L = [ex([[1, "x²"], [r1 + r2, "x"], [r1 * r2, ""]]) + " = 0", "(" + ex([[1, "x"], [r1, ""]]) + ")(" + ex([[1, "x"], [r2, ""]]) + ") = 0"];
      if(e === 0){ L.push(ex([[1, "x"], [r1, ""]]) + " = 0 또는 " + ex([[1, "x"], [r2, ""]]) + " = 0", "x = " + sg(r1) + " 또는 x = " + sg(r2)); return {t: "이차방정식 풀기", L: L, bad: 3, fix: "x = " + sg(-r1) + " 또는 x = " + sg(-r2)}; }
      L[1] = "(" + ex([[1, "x"], [-r1, ""]]) + ")(" + ex([[1, "x"], [-r2, ""]]) + ") = 0"; L.push("x = " + sg(r1) + " 또는 x = " + sg(r2)); return {t: "이차방정식 풀기", L: L, bad: 1, fix: "(" + ex([[1, "x"], [r1, ""]]) + ")(" + ex([[1, "x"], [r2, ""]]) + ") = 0 → x = " + sg(-r1) + " 또는 " + sg(-r2)};
    }},
    {g: 3, f: function(){ /* 근호 */
      var m = pick([2, 3, 5, 6, 7]), p = ri(2, 4), q = ri(2, 5), e = K.rnd(2); if(p === q) q++; var rt = function(n){ return "√" + n; };
      var L = [rt(p * p * m) + " + " + rt(q * q * m)];
      if(e === 0){ L.push("= " + p * p + rt(m) + " + " + q + rt(m), "= " + (p * p + q) + rt(m)); return {t: "근호 계산", L: L, bad: 1, fix: rt(p * p * m) + " = " + rt(p * p) + " × " + rt(m) + " = " + p + rt(m)}; }
      L.push("= " + p + rt(m) + " + " + q + rt(m), "= " + (p + q) + rt(m + m)); return {t: "근호 계산", L: L, bad: 2, fix: "√ 안은 그대로, 앞의 수만 더해요: = " + (p + q) + rt(m)};
    }}
  ];
  K.game({id: "wrong", icon: "🔎", cat: "team", name: "오답 탐정", desc: "풀이 중 딱 한 줄이 틀렸어요! 몇 번째 줄일까? 부호·지수법칙·곱셈 공식에서 자주 하는 실수를 찾아요.", mount: function(el, ctl){
    var g = +(K.pref("wdG") || 0), cur, done = false;
    var gs = h("select"); [[0, "섞어서"], [1, "중1"], [2, "중2"], [3, "중3"]].forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; gs.appendChild(x); }); gs.value = g; gs.onchange = function(){ g = +gs.value; K.pref("wdG", g); next(); };
    var aw = K.awardSel("wdAward"); ctl.appendChild(gs); ctl.appendChild(aw);
    var w = h("div", "wd"), tt = h("div", "ttl"), ls = h("div", "ls"), fix = h("div", "fix"), row = h("div", "qrow");
    var sh = h("button", "bigbtn k", "👀 정답 공개"), ok = h("button", "bigbtn g", "✅ 맞힌 모둠"), nx = h("button", "bigbtn", "⏭ 다음 문제"); sh.type = ok.type = nx.type = "button"; row.appendChild(sh); row.appendChild(ok); row.appendChild(nx);
    w.appendChild(tt); w.appendChild(ls); w.appendChild(fix); w.appendChild(row); el.appendChild(w);
    var NUM = "①②③④⑤";
    function next(){
      var pool = WRONG.filter(function(x){ return !g || x.g === g; });
      cur = K.fresh("wrong", function(){ return pick(pool).f(); }, function(x){ return x.L.join("|"); }, 40); done = false; fix.innerHTML = ""; K.S.whoosh();
      tt.textContent = "🔎 " + cur.t + " — 틀린 줄은 몇 번?";
      ls.innerHTML = ""; cur.L.forEach(function(l, i){ var b = h("button", i ? "" : "first"); b.type = "button"; b.appendChild(h("span", "k", NUM[i])); var s = h("span"); s.innerHTML = l; b.appendChild(s); if(i) b.onclick = function(){ choose(i, b); }; ls.appendChild(b); });
    }
    function reveal(){ done = true; ls.children[cur.bad].classList.add("ok"); fix.innerHTML = "✏️ 바르게: " + cur.fix; }
    function choose(i, b){
      if(done) return;
      if(i === cur.bad){ reveal(); K.S.win(); var r = b.getBoundingClientRect(); K.confetti(r.left + r.width / 2, r.top, 50); K.big("🔎 찾았다!", NUM[i] + "번 줄", "#2e9d5b", 1300); }
      else { b.classList.add("no"); K.S.bad(); K.shake(b); }
    }
    sh.onclick = function(){ if(!done){ reveal(); K.S.fanfare(); } };
    ok.onclick = function(){ if(!done) reveal(); K.award(aw.value); };
    nx.onclick = next;
    next();
  }});

  /* =============== ⚓ 좌표 해전 =============== */
  K.game({id: "sea", icon: "⚓", cat: "team", name: "좌표 해전", desc: "좌표평면에 숨은 배를 찾아요! 모둠이 (3, −2)처럼 좌표를 부르면 그 점을 눌러요. 맞히면 +1, 배를 가라앉히면 +2.", mount: function(el, ctl){
    var R = 5, ships, shots, over, lastT = "";
    var w = h("div", "sea"), map = h("div", "map"), side = h("div", "side"), tr = K.turnRow(), last = h("div", "last"), shp = h("div", "ships"), cor = h("div", "hint");
    side.appendChild(tr); side.appendChild(last); side.appendChild(shp); side.appendChild(cor); w.appendChild(map); w.appendChild(side); el.appendChild(w);
    ctl.appendChild(btn("👀 배 위치 보기", "", function(){ over = true; draw(); })); ctl.appendChild(btn("🔄 새 바다", "primary", start));
    var NAMES = [["🚢 큰 배", 4], ["⛴️ 중간 배", 3], ["🚤 작은 배", 2], ["🚤 작은 배", 2]];
    function start(){
      for(var g = 0; g < 500; g++){
        var occ = {}, out = [], okAll = true;
        NAMES.forEach(function(nm){
          if(!okAll) return; var placed = false;
          for(var t = 0; t < 200 && !placed; t++){
            var hz = K.rnd(2), L = nm[1], x = ri(-R, hz ? R - L + 1 : R), y = ri(-R, hz ? R : R - L + 1), cells = [];
            for(var k = 0; k < L; k++) cells.push(hz ? [x + k, y] : [x, y + k]);
            if(cells.every(function(c){ return !occ[c] && !occ[[c[0] + 1, c[1]]] && !occ[[c[0] - 1, c[1]]] && !occ[[c[0], c[1] + 1]] && !occ[[c[0], c[1] - 1]]; })){ cells.forEach(function(c){ occ[c] = 1; }); out.push({n: nm[0], cells: cells, hit: {}}); placed = true; }
          }
          if(!placed) okAll = false;
        });
        if(okAll) break;
      }
      ships = out; shots = {}; over = false; last.textContent = ""; K.setTurn(0); K.S.whoosh(); draw();
    }
    function shipAt(x, y){ return ships.filter(function(s){ return s.cells.some(function(c){ return c[0] === x && c[1] === y; }); })[0]; }
    function sunk(s){ return s.cells.every(function(c){ return s.hit[c]; }); }
    function draw(){
      var S = 30, W = (2 * R + 2) * S, X = function(x){ return (x + R + 1) * S; }, Y = function(y){ return (R + 1 - y) * S; }, o = '<svg viewBox="0 0 ' + W + " " + W + '">';
      o += '<rect width="' + W + '" height="' + W + '" rx="14" fill="#e7f5ff"/>';
      [["Ⅰ", 1, 1], ["Ⅱ", -1, 1], ["Ⅲ", -1, -1], ["Ⅳ", 1, -1]].forEach(function(q){ o += '<text x="' + X(q[1] * 3) + '" y="' + (Y(q[2] * 3) + 10) + '" font-size="34" text-anchor="middle" fill="#d0ebff" font-weight="900">' + q[0] + "</text>"; });
      for(var i = -R; i <= R; i++){ o += '<line x1="' + X(i) + '" y1="' + Y(-R) + '" x2="' + X(i) + '" y2="' + Y(R) + '" stroke="#a5d8ff"/><line x1="' + X(-R) + '" y1="' + Y(i) + '" x2="' + X(R) + '" y2="' + Y(i) + '" stroke="#a5d8ff"/>'; }
      o += '<line x1="' + (X(-R) - 14) + '" y1="' + Y(0) + '" x2="' + (X(R) + 14) + '" y2="' + Y(0) + '" stroke="#1c4f7c" stroke-width="2.5"/><line x1="' + X(0) + '" y1="' + (Y(-R) + 14) + '" x2="' + X(0) + '" y2="' + (Y(R) - 14) + '" stroke="#1c4f7c" stroke-width="2.5"/>';
      for(i = -R; i <= R; i++) if(i){ o += '<text x="' + X(i) + '" y="' + (Y(0) + 17) + '" font-size="11" text-anchor="middle" fill="#1c4f7c" font-weight="700">' + sg(i) + '</text><text x="' + (X(0) - 7) + '" y="' + (Y(i) + 4) + '" font-size="11" text-anchor="end" fill="#1c4f7c" font-weight="700">' + sg(i) + "</text>"; }
      o += '<text x="' + (X(0) - 6) + '" y="' + (Y(0) + 15) + '" font-size="11" text-anchor="end" fill="#1c4f7c">O</text><text x="' + (X(R) + 18) + '" y="' + (Y(0) + 4) + '" font-size="13" fill="#1c4f7c" font-style="italic">x</text><text x="' + (X(0) + 5) + '" y="' + (Y(R) - 16) + '" font-size="13" fill="#1c4f7c" font-style="italic">y</text>';
      if(over) ships.forEach(function(s){ var a = s.cells[0], b = s.cells[s.cells.length - 1]; o += '<line x1="' + X(a[0]) + '" y1="' + Y(a[1]) + '" x2="' + X(b[0]) + '" y2="' + Y(b[1]) + '" stroke="#495057" stroke-width="18" stroke-linecap="round" opacity=".35"/>'; });
      for(var x = -R; x <= R; x++) for(var y = -R; y <= R; y++){
        var k = x + "," + y, sh = shots[k];
        o += '<g class="pt" data-x="' + x + '" data-y="' + y + '"><circle cx="' + X(x) + '" cy="' + Y(y) + '" r="13" fill="transparent"/>';
        if(sh === "hit") o += '<text x="' + X(x) + '" y="' + (Y(y) + 8) + '" font-size="22" text-anchor="middle">💥</text>';
        else if(sh === "miss") o += '<circle cx="' + X(x) + '" cy="' + Y(y) + '" r="7" fill="#74c0fc"/>';
        else o += '<circle class="h" cx="' + X(x) + '" cy="' + Y(y) + '" r="3.6" fill="#4dabf7"/>';
        o += "<title>(" + sg(x) + ", " + sg(y) + ")</title></g>";
      }
      map.innerHTML = o + "</svg>";
      shp.innerHTML = ""; ships.forEach(function(s){ var d = h("div", sunk(s) ? "sunk" : ""); d.appendChild(document.createTextNode(s.n + " ")); s.cells.forEach(function(){ d.appendChild(h("span")); }); shp.appendChild(d); });
      cor.textContent = "점에 마우스를 올리면 좌표가 보여요 · 맞혀도 차례는 넘어가요";
    }
    map.onclick = function(e){
      var g = e.target.closest(".pt"); if(!g || over) return; var x = +g.dataset.x, y = +g.dataset.y, k = x + "," + y; if(shots[k]) return;
      var t = K.teams()[K.turn()], s = shipAt(x, y), lab = "(" + sg(x) + ", " + sg(y) + ")";
      if(s){ shots[k] = "hit"; s.hit[[x, y]] = 1; K.S.boom(); K.add(t.i, 1); last.textContent = lab + " 💥";
        if(sunk(s)){ K.add(t.i, 2); K.fireworks(3); K.big("🔥 " + s.n + " 격침!", t.name + " +3", t.color, 2000); } else K.big("💥 명중!", lab + " · " + t.name + " +1", t.color, 1300);
      } else { shots[k] = "miss"; K.S.whoosh(); last.textContent = lab + " 🌊"; }
      K.nextTurn(); draw();
      if(ships.every(sunk)){ over = true; setTimeout(function(){ K.S.win(); K.big("⚓ 모든 배를 찾았어요!", null, "#1c7ed6", 2600); draw(); }, 1500); }
    };
    start();
    return function(){ tr.cleanup(); };
  }});
})();
