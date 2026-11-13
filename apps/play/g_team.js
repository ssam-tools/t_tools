/* 🙌 함께 풀기 — 퀴즈 배틀 · 수학 빙고 · 숫자 만들기 · 수 탐정 · 그래프 맞히기 */
(function(){
  "use strict";
  var h = K.h, btn = K.btn, ri = K.ri, pick = K.pick, sg = K.sg;
  K.css([
    ".qbox{background:#fff;border-radius:18px;box-shadow:0 6px 20px rgba(30,60,100,.12);padding:clamp(14px,3vh,30px) clamp(16px,3vw,40px);max-width:92%;display:flex;flex-direction:column;align-items:center;gap:10px}",
    ".qno{font-size:14px;font-weight:900;color:#8a96a3}",
    ".qrow{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;align-items:center}",
    ".awd{display:flex;gap:6px;align-items:center;font-size:13px;font-weight:800;color:var(--sub)}",
    /* 빙고 */
    ".bingo{display:flex;gap:16px;width:100%;height:100%;padding:12px;align-items:stretch}",
    ".bingo .left{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;min-width:0}",
    ".bingo .right{width:clamp(200px,30vw,330px);display:flex;flex-direction:column;gap:6px;min-height:0}",
    ".ball{width:clamp(80px,16vh,130px);height:clamp(80px,16vh,130px);border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0,#ffd43b 22%,#f08c00 100%);display:flex;align-items:center;justify-content:center;font-size:clamp(26px,5vh,42px);font-weight:900;color:#5c2d00;box-shadow:0 8px 18px rgba(0,0,0,.25)}",
    ".ball.roll{animation:broll .9s cubic-bezier(.2,.8,.3,1)}",
    "@keyframes broll{0%{transform:translateX(-60vw) rotate(-720deg)}100%{transform:none}}",
    ".pool{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}",
    ".pool span{background:#fff;border-radius:8px;text-align:center;font-weight:900;font-size:clamp(15px,2.8vh,24px);padding:4px 0;box-shadow:0 1px 0 #cfd8e3}",
    ".pool span.done{background:#ffe066;color:#5c2d00}",
    ".called{flex:1;overflow:auto;font-size:13px;background:#fff;border-radius:10px;padding:6px 9px;line-height:1.7}",
    ".called div{border-bottom:1px dashed #e4eaf0}",
    /* 숫자 만들기 */
    ".mk{display:flex;gap:clamp(8px,2vw,22px);justify-content:center}",
    ".nc{width:clamp(70px,13vh,120px);aspect-ratio:3/4;border-radius:14px;background:#fff;box-shadow:0 6px 18px rgba(30,60,100,.18);display:flex;align-items:center;justify-content:center;font-size:clamp(34px,8vh,66px);font-weight:900;color:#2d3a48}",
    ".nc.in{animation:dealin .5s backwards}",
    "@keyframes dealin{from{transform:translateY(-40px) rotate(-20deg);opacity:0}}",
    ".target{font-size:clamp(22px,4.5vh,40px);font-weight:900}",
    ".target b{color:#c2410c;font-size:1.5em}",
    ".sols{font-size:clamp(17px,3vh,26px);font-weight:800;color:#2e7d4f;text-align:center;line-height:1.6}",
    /* 수 탐정 */
    ".det{display:flex;gap:16px;width:100%;height:100%;padding:12px}",
    ".det .clues{flex:1;display:flex;flex-direction:column;gap:6px;justify-content:safe center;min-width:0;overflow:auto}",
    ".clue{background:#fff;border-radius:12px;padding:6px 14px;font-size:clamp(15px,2.7vh,26px);font-weight:800;box-shadow:0 2px 0 #cfd8e3;display:flex;gap:10px;align-items:center}",
    ".clue.new{animation:dealin .4s}",
    ".clue.hide{background:#e4eaf0;color:#9aa5b1;box-shadow:none;animation:none}",
    ".det .cand{width:clamp(200px,30vw,340px);display:grid;grid-template-columns:repeat(10,1fr);gap:2px;align-content:center}",
    ".det .cand span{font-size:clamp(9px,1.5vh,13px);text-align:center;border-radius:4px;background:#fff;font-weight:700;padding:1px 0}",
    ".det .cand span.x{background:transparent;color:#d5dbe2}",
    ".det .cand span.win{background:#ffd43b}",
    ".pts{font-size:clamp(18px,3vh,26px);font-weight:900;color:#c2410c}",
    /* 그래프 */
    ".gq{display:flex;gap:16px;width:100%;height:100%;padding:10px;align-items:center;justify-content:center}",
    ".gq svg{background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08)}",
    ".gq .main{height:100%;aspect-ratio:1;max-width:52%}",
    ".gq .opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1;max-width:560px}",
    ".gq .opts.g{height:100%;max-width:min(560px,46%);grid-template-rows:1fr 1fr}",
    ".gq .op{font:inherit;border:3px solid #dde3ea;background:#fff;border-radius:14px;cursor:pointer;font-size:clamp(17px,3.2vh,28px);font-weight:800;padding:12px 8px;display:flex;align-items:center;justify-content:center;gap:8px;min-height:0}",
    ".gq .op svg{height:100%;width:100%;box-shadow:none}",
    ".gq .op.ok{border-color:#2e9d5b;background:#e3f6e9}.gq .op.no{border-color:#d64545;background:#fdeceb;opacity:.6}",
    ".gq .formula{font-size:clamp(26px,5.5vh,48px);font-weight:900;text-align:center}",
    ".gq .lhs{display:flex;flex-direction:column;align-items:center;gap:10px;flex:1}"
  ].join("\n"));

  function seg(opts, val, onChange){
    var s = h("div", "seg"); opts.forEach(function(o){ var b = h("button", "", o[1]); b.type = "button"; b.setAttribute("aria-pressed", String(o[0] === val)); b.onclick = function(){ Array.prototype.forEach.call(s.children, function(x){ x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); onChange(o[0]); }; s.appendChild(b); }); return s;
  }
  function fracH(n, d){ if(d < 0){ n = -n; d = -d; } var g = K.gcd(n, d) || 1; n /= g; d /= g; if(d === 1) return sg(n); return (n < 0 ? "−" : "") + '<span class="frac"><span>' + Math.abs(n) + "</span><span>" + d + "</span></span>"; }
  /* 맞힌 모둠에게 주는 상: 점수 또는 운 게임 기회 */
  var AWARDS = [["1", "+1"], ["2", "+2"], ["3", "+3"], ["dice", "🎲 주사위만큼"], ["box", "🎁 상자 열기"], ["wheel", "🎡 돌림판"]];
  function awardSel(key){ var s = h("select"); s.title = "맞힌 모둠에게 주는 상"; AWARDS.forEach(function(a){ var o = h("option", "", "맞히면 " + a[1]); o.value = a[0]; s.appendChild(o); }); s.value = K.pref(key) || "1"; s.onchange = function(){ K.pref(key, s.value); }; return s; }
  function award(kind, title){
    K.askTeam(title || "✅ 맞힌 모둠은?", function(i){
      var T = K.teams()[i];
      if(/^\d$/.test(kind)){ K.add(i, +kind); K.S.good(); K.big("+" + kind, T.name + " 정답!", T.color, 1200); return; }
      if(kind === "dice"){ var d = h("span", "die", "🎲"), b = h("div", "bigmsg"); b.appendChild(d); K.layer().appendChild(b);
        K.rollDice(d).then(function(v){ setTimeout(function(){ b.remove(); K.add(i, v[0]); K.big("+" + v[0], T.name + " 주사위!", T.color, 1300); }, 700); }); return; }
      K.setTurn(i); K.S.fanfare(); location.hash = kind;
    });
  }

  /* =============== 🏁 퀴즈 배틀 =============== */
  var QS = {type: "mix1", lv: 2, sec: 30, n: 0, cur: null, seed: Date.now()};
  K.game({id: "quiz", icon: "🏁", cat: "team", name: "퀴즈 배틀", desc: "문항 생성기의 문제가 크게 뜨고 시간이 흐릅니다. 맞힌 모둠은 점수 또는 🎁 상자·🎡 돌림판 기회!", mount: function(el, ctl){
    var ts = h("select"); [["mix1", "중1 섞어서"], ["mix2", "중2 섞어서"], ["mix3", "중3 섞어서"]].forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; ts.appendChild(x); });
    MG.T.forEach(function(t){ var x = h("option", "", "중" + t.g + " · " + t.n); x.value = t.id; ts.appendChild(x); }); ts.value = K.pref("quizType") || QS.type; QS.type = ts.value;
    ts.onchange = function(){ QS.type = ts.value; K.pref("quizType", ts.value); next(); };
    var lv = seg([[1, "기초"], [2, "보통"], [3, "심화"]], QS.lv, function(v){ QS.lv = v; next(); });
    var sec = h("select"); [[0, "시간 없음"], [20, "20초"], [30, "30초"], [60, "1분"], [120, "2분"]].forEach(function(o){ var x = h("option", "", "⏱ " + o[1]); x.value = o[0]; sec.appendChild(x); }); sec.value = QS.sec; sec.onchange = function(){ QS.sec = +sec.value; };
    var aw = awardSel("quizAward"); ctl.appendChild(ts); ctl.appendChild(lv); ctl.appendChild(sec); ctl.appendChild(aw);
    var w = h("div", "gwrap"), box = h("div", "qbox"), no = h("div", "qno"), q = h("div", "q"), an = h("div", "ans"), row = h("div", "qrow"), tm = h("div", "tmr");
    box.appendChild(no); box.appendChild(q); box.appendChild(an); w.appendChild(tm); w.appendChild(box);
    var show = h("button", "bigbtn k", "👀 정답 보기"), okb = h("button", "bigbtn g", "✅ 맞힌 모둠"), nx = h("button", "bigbtn", "⏭ 다음 문제"); show.type = okb.type = nx.type = "button";
    row.appendChild(show); row.appendChild(okb); row.appendChild(nx); w.appendChild(row); el.appendChild(w);
    var T = null;
    function draw(){ var c = QS.cur; no.textContent = "문제 " + QS.n; q.innerHTML = c.q; an.innerHTML = c.shown ? "정답: " + c.a : ""; an.hidden = !c.shown; }
    function next(){
      var pool = /^mix/.test(QS.type) ? MG.T.filter(function(t){ return t.g === +QS.type.slice(3); }) : [MG.type(QS.type)];
      QS.n++; QS.cur = K.fresh("quiz", function(){ var t = pick(pool); return MG.make(t.id, QS.lv, QS.seed + "|" + QS.n + "|" + K.rnd(1e9)); }, function(x){ return x.q; }, 80); QS.cur.shown = false;   /* 최근 80문제와 겹치지 않게 */
      draw(); box.style.animation = "none"; void box.offsetWidth; box.style.animation = "dealin .45s"; K.S.whoosh();
      if(T) T.stop(); tm.innerHTML = ""; tm.classList.remove("over"); if(QS.sec) T = K.timer(tm, QS.sec, function(){ K.big("⏰ 시간 끝!", "정답을 확인해요", "#d64545", 1300); });
    }
    show.onclick = function(){ if(T) T.stop(); QS.cur.shown = true; draw(); K.S.pop(); };
    okb.onclick = function(){ if(T) T.stop(); QS.cur.shown = true; draw(); award(aw.value); };
    nx.onclick = next;
    if(QS.cur){ draw(); } else next();
    return function(){ if(T) T.stop(); };
  }});

  /* =============== 🎱 수학 빙고 =============== */
  var BG = [
    {g: 1, n: "정수 계산", f: function(){ var a = ri(-12, 12), b = ri(-12, 12), o = pick(["+", "−", "×"]); var v = o === "+" ? a + b : o === "−" ? a - b : a * b; var P = function(x){ return x < 0 ? "(" + sg(x) + ")" : String(x); }; return [P(a) + " " + o + " " + P(b), v]; }},
    {g: 1, n: "일차방정식", f: function(){ var x = ri(-9, 15), a = pick([2, 3, 4, 5, -2, -3]), b = ri(-10, 10); return [(a === 1 ? "" : a === -1 ? "−" : sg(a)) + "x " + (b < 0 ? "− " + -b : "+ " + b) + " = " + sg(a * x + b) + " 의 해 x", x]; }},
    {g: 1, n: "거듭제곱", f: function(){ var b = pick([2, 3, -2, -3, 5, 4, 10]), e = b === 10 ? 1 : b === 5 || b === 4 ? 2 : ri(2, 4), v = Math.pow(b, e); if(Math.abs(v) > 99) e = 2, v = b * b; var sup = "⁰¹²³⁴⁵"[e]; return [(b < 0 ? "(" + sg(b) + ")" : b) + sup, Math.pow(b, e)]; }},
    {g: 1, n: "약수의 개수", f: function(){ var n = pick([6, 8, 10, 12, 16, 18, 20, 24, 28, 30, 36, 40, 48, 60, 64, 72, 100]), c = 0; for(var i = 1; i <= n; i++) if(n % i === 0) c++; return [n + "의 약수의 개수", c]; }},
    {g: 2, n: "식의 값", f: function(){ var x = ri(-4, 4), y = ri(-4, 4), a = ri(1, 5), b = ri(-5, 5) || 2; return ["x = " + sg(x) + ", y = " + sg(y) + " 일 때 " + a + "x " + (b < 0 ? "− " + -b : "+ " + b) + "y", a * x + b * y]; }},
    {g: 2, n: "일차함수 값", f: function(){ var a = ri(-4, 4) || 3, b = ri(-6, 6), x = ri(-4, 5); return ["f(x) = " + sg(a) + "x " + (b < 0 ? "− " + -b : "+ " + b) + " 일 때 f(" + sg(x) + ")", a * x + b]; }},
    {g: 3, n: "제곱근", f: function(){ var k = ri(2, 15); return Math.random() < .5 ? ["√" + (k * k), k] : ["−√" + (k * k), -k]; }},
    {g: 3, n: "이차방정식 큰 근", f: function(){ var r1 = ri(-8, 9), r2 = ri(-8, 9); if(r1 === r2) r2++; var s = -(r1 + r2), p = r1 * r2; return ["x² " + (s < 0 ? "− " + -s : "+ " + s) + "x " + (p < 0 ? "− " + -p : "+ " + p) + " = 0 의 큰 근", Math.max(r1, r2)]; }}
  ];
  K.BG = BG; var BS = null;
  K.game({id: "bingo", icon: "🎱", cat: "team", name: "수학 빙고", desc: "25개의 답을 공책 5×5 칸에 마음대로 적고, 공에서 나오는 문제를 풀어 답을 지워요. 문제를 풀어야 빙고!", mount: function(el, ctl){
    var gs = h("select"); [[1, "중1"], [2, "중2"], [3, "중3"], [0, "섞어서"]].forEach(function(o){ var x = h("option", "", o[1] + " 문제"); x.value = o[0]; gs.appendChild(x); }); gs.value = K.pref("bingoG") || 1;
    var aw = awardSel("bingoAward");
    ctl.appendChild(gs); ctl.appendChild(aw); ctl.appendChild(btn("🔄 새 빙고", "primary", function(){ make(); draw(); K.S.whoosh(); })); gs.onchange = function(){ K.pref("bingoG", gs.value); make(); draw(); };
    var wrap = h("div", "bingo"), L = h("div", "left"), R = h("div", "right"); wrap.appendChild(L); wrap.appendChild(R); el.appendChild(wrap);
    function make(){
      var g = +gs.value, types = BG.filter(function(t){ return !g || t.g === g || (g >= 2 && t.g === g - 1 && Math.random() < .3); }), seen = {}, qs = [], guard = 0;
      if(!types.length) types = BG;
      while(qs.length < 25 && guard++ < 3000){ var t = pick(types), r = t.f(); if(seen[r[1]] || Math.abs(r[1]) > 99) continue; if(guard < 1500 && K.recent.seen("bingo", r[0])) continue; seen[r[1]] = 1; qs.push({q: r[0], a: r[1]}); }
      qs.forEach(function(x){ K.recent.add("bingo", x.q, 120); });   /* 지난 빙고에 나온 문제는 되도록 다시 내지 않음 */
      BS = {qs: K.shuffle(qs), i: 0, phase: "ready", show: false};
    }
    function draw(){
      L.innerHTML = ""; R.innerHTML = "";
      var pool = h("div", "pool"), sorted = BS.qs.map(function(x){ return x.a; }).sort(function(a, b){ return a - b; });
      sorted.forEach(function(a){ var done = BS.qs.slice(0, BS.i).some(function(x){ return x.a === a; }) && BS.show; pool.appendChild(h("span", done ? "done" : "", sg(a))); });
      if(BS.phase === "ready"){
        L.appendChild(h("div", "q", "공책에 5×5 빙고판을 그리고"));
        L.appendChild(h("div", "hint", "오른쪽 수 25개를 마음대로 한 칸씩 적으세요 (순서는 자유!)"));
        var go = h("button", "bigbtn y", "🎱 빙고 시작"); go.type = "button"; go.onclick = function(){ BS.phase = "play"; draw(); }; L.appendChild(go);
      } else {
        var ball = h("div", "ball", BS.i ? String(BS.i) : "?"), cur = BS.qs[BS.i - 1];
        L.appendChild(ball); L.appendChild(h("div", "q", cur ? cur.q : "첫 공을 뽑아요"));
        var ans = h("div", "ans", cur && BS.curShown ? "= " + sg(cur.a) : ""); L.appendChild(ans);
        var row = h("div", "qrow"); var nb = h("button", "bigbtn y", BS.i >= 25 ? "끝!" : "🎱 다음 공"), sb = h("button", "bigbtn k", "👀 답"), bb = h("button", "bigbtn g", "🎉 빙고!"); nb.type = sb.type = bb.type = "button"; nb.disabled = BS.i >= 25; sb.disabled = !cur;
        nb.onclick = function(){ BS.i++; BS.curShown = false; K.S.drum(.9); draw(); var b = L.querySelector(".ball"); b.classList.add("roll"); setTimeout(K.S.pop, 900); };
        sb.onclick = function(){ BS.curShown = true; K.S.pop(); draw(); };
        bb.onclick = function(){ K.S.win(); K.fireworks(4); K.big("🎉 빙고!", "답이 맞는지 확인해요 (지금까지 " + BS.i + "문제)", "#c2410c", 2200); K.later(function(){ award(aw.value, "🎉 빙고를 외친 모둠은?"); }, 2300); };
        row.appendChild(sb); row.appendChild(nb); row.appendChild(bb); L.appendChild(row);
      }
      R.appendChild(h("b", "", "빙고판에 적을 수 (" + 25 + "개)")); R.appendChild(pool);
      if(BS.phase === "play"){
        var tg = h("label", "sm"), cb = h("input"); cb.type = "checkbox"; cb.checked = BS.show; cb.onchange = function(){ BS.show = cb.checked; draw(); }; tg.appendChild(cb); tg.appendChild(document.createTextNode(" 나온 답 노랗게 표시 (확인할 때)")); R.appendChild(tg);
        var c = h("div", "called"); for(var i = BS.i - 1; i >= 0; i--){ var d = h("div"); d.textContent = (i + 1) + ". " + BS.qs[i].q + (BS.show || (i < BS.i - 1) ? "  → " + sg(BS.qs[i].a) : ""); c.appendChild(d); } R.appendChild(c);
      }
    }
    if(!BS) make(); draw();
  }});

  /* =============== ➕ 숫자 만들기 =============== */
  function solve(nums, target, max){
    var out = {}, cnt = 0;
    function strip(e){ return e.replace(/^\((.*)\)$/, function(m, x){ var d = 0; for(var i = 0; i < x.length; i++){ if(x[i] === "(") d++; else if(x[i] === ")"){ d--; if(d < 0) return m; } } return x; }); }
    function rec(L){
      if(cnt >= max) return;
      if(L.length === 1){ if(L[0].d !== 0 && L[0].n * 1 === target * L[0].d){ var s = strip(L[0].e); if(!out[s]){ out[s] = 1; cnt++; } } return; }
      for(var i = 0; i < L.length; i++) for(var j = 0; j < L.length; j++){
        if(i === j) continue; var a = L[i], b = L[j], rest = L.filter(function(_, k){ return k !== i && k !== j; }), cands = [];
        if(i < j){ cands.push({n: a.n * b.d + b.n * a.d, d: a.d * b.d, e: "(" + a.e + " + " + b.e + ")"}); cands.push({n: a.n * b.n, d: a.d * b.d, e: "(" + a.e + " × " + b.e + ")"}); }
        cands.push({n: a.n * b.d - b.n * a.d, d: a.d * b.d, e: "(" + a.e + " − " + b.e + ")"});
        if(b.n !== 0) cands.push({n: a.n * b.d, d: a.d * b.n, e: "(" + a.e + " ÷ " + b.e + ")"});
        cands.forEach(function(c){ if(c.d < 0){ c.n = -c.n; c.d = -c.d; } var g = K.gcd(c.n, c.d) || 1; c.n /= g; c.d /= g; rec(rest.concat([c])); });
      }
    }
    rec(nums.map(function(n){ return {n: n, d: 1, e: n < 0 ? "(" + sg(n) + ")" : String(n)}; }));
    return Object.keys(out);
  }
  var MK = null;
  K.game({id: "make", icon: "➕", cat: "team", name: "숫자 만들기", desc: "카드 4장을 한 번씩 써서 +, −, ×, ÷와 괄호로 목표 수를 만들어요. (24 게임)", mount: function(el, ctl){
    var lv = K.pref("mkLv") || 1;
    var sg2 = seg([[1, "기본 · 24"], [2, "응용 · 1~13"], [3, "음수 포함"]], lv, function(v){ lv = v; K.pref("mkLv", v); deal(); });
    var aw = awardSel("mkAward"); ctl.appendChild(sg2); ctl.appendChild(aw);
    var w = h("div", "gwrap"), tg = h("div", "target"), mk = h("div", "mk"), sol = h("div", "sols"), tm = h("div", "tmr"), row = h("div", "qrow");
    var sb = h("button", "bigbtn k", "💡 풀이 보기"), ok = h("button", "bigbtn g", "✅ 맞힌 모둠"), nx = h("button", "bigbtn", "🃏 새 카드"); sb.type = ok.type = nx.type = "button";
    row.appendChild(sb); row.appendChild(ok); row.appendChild(nx); w.appendChild(tg); w.appendChild(mk); w.appendChild(tm); w.appendChild(sol); w.appendChild(row); el.appendChild(w);
    var T = null;
    function deal(){
      var g = 0, nums, target, s;
      do{
        nums = [0, 0, 0, 0].map(function(){ return lv === 1 ? ri(1, 9) : lv === 2 ? ri(1, 13) : (ri(1, 9) * (Math.random() < .4 ? -1 : 1)); });
        target = lv === 1 ? 24 : lv === 2 ? ri(10, 36) : ri(-12, 24);
        s = solve(nums, target, 6);
      } while((!s.length || (g < 300 && K.recent.seen("make", nums.slice().sort().join(",") + ">" + target))) && g++ < 400);
      K.recent.add("make", nums.slice().sort().join(",") + ">" + target, 60);
      MK = {nums: nums, target: target, sols: s, show: false}; draw(true);
      K.S.whoosh(); if(T) T.stop(); tm.innerHTML = ""; T = K.timer(tm, 90, function(){ K.big("⏰ 시간 끝!", "풀이를 확인해요", "#d64545", 1300); });
    }
    function draw(anim){
      tg.innerHTML = "목표 수 <b>" + sg(MK.target) + "</b>";
      mk.innerHTML = ""; MK.nums.forEach(function(n, i){ var c = h("div", "nc" + (anim ? " in" : ""), sg(n)); c.style.animationDelay = (i * .12) + "s"; mk.appendChild(c); });
      sol.innerHTML = MK.show ? MK.sols.slice(0, 3).map(function(x){ return x + " = " + sg(MK.target); }).join("<br>") : "";
    }
    sb.onclick = function(){ MK.show = true; draw(); K.S.pop(); if(T) T.stop(); };
    ok.onclick = function(){ if(T) T.stop(); MK.show = true; draw(); award(aw.value); };
    nx.onclick = deal;
    if(MK) draw(); else deal();
    return function(){ if(T) T.stop(); };
  }});

  /* =============== 🕵️ 수 탐정 =============== */
  function divs(n){ var c = 0; for(var i = 1; i <= n; i++) if(n % i === 0) c++; return c; }
  function isPrime(n){ return n > 1 && divs(n) === 2; }
  function ye(n){ return /[013678]$/.test(String(Math.abs(n))) ? n + "이에요." : n + "예요."; }
  function clueGen(x, N){
    var C = [], ds = String(x).split("").reduce(function(a, b){ return a + +b; }, 0);
    C.push([x % 2 ? "홀수예요." : "짝수예요.", function(n){ return n % 2 === x % 2; }]);
    C.push([isPrime(x) ? "소수예요." : "소수가 아니에요.", function(n){ return isPrime(n) === isPrime(x); }]);
    [3, 4, 5, 6, 7, 9].forEach(function(k){ C.push([x % k ? k + "의 배수가 아니에요." : k + "의 배수예요.", function(n){ return !(n % k) === !(x % k); }]); });
    C.push(["약수가 " + divs(x) + "개예요.", function(n){ return divs(n) === divs(x); }]);
    C.push(["각 자리 숫자의 합이 " + ye(ds), function(n){ return String(n).split("").reduce(function(a, b){ return a + +b; }, 0) === ds; }]);
    C.push(["일의 자리 숫자가 " + ye(x % 10), function(n){ return n % 10 === x % 10; }]);
    if(x >= 10) C.push(["십의 자리 숫자가 " + ye(Math.floor(x / 10 % 10)), function(n){ return n >= 10 && Math.floor(n / 10 % 10) === Math.floor(x / 10 % 10); }]);
    var sq = Math.round(Math.sqrt(x)) ** 2 === x; C.push([sq ? "어떤 수의 제곱이에요." : "어떤 자연수의 제곱도 아니에요.", function(n){ return (Math.round(Math.sqrt(n)) ** 2 === n) === sq; }]);
    var b = ri(2, 8) * 10; if(b !== x) C.push([x > b ? b + "보다 커요." : b + "보다 작아요.", function(n){ return x > b ? n > b : n < b; }]);
    var b2 = Math.min(N - 1, Math.max(2, x + ri(-25, 25))); if(b2 !== x) C.push([x > b2 ? b2 + "보다 커요." : b2 + "보다 작아요.", function(n){ return x > b2 ? n > b2 : n < b2; }]);
    return C;
  }
  function plan(x, N){
    var cand = []; for(var i = 1; i <= N; i++) cand.push(i);
    var C = K.shuffle(clueGen(x, N)), out = [];
    while(cand.length > 1 && C.length){
      var opts = C.map(function(c){ return {c: c, left: cand.filter(c[1])}; }).filter(function(o){ return o.left.length < cand.length; });
      if(!opts.length) break;
      var soft = opts.filter(function(o){ return o.left.length > 1 && o.left.length > cand.length * .25; }), o = soft.length && out.length < 4 ? soft[0] : opts.sort(function(a, b){ return a.left.length - b.left.length; })[out.length < 3 ? opts.length - 1 : 0];
      out.push({t: o.c[0], left: o.left.slice()}); cand = o.left; C = C.filter(function(c){ return c !== o.c; });
    }
    return cand.length === 1 ? out : null;
  }
  var DS = null;
  K.game({id: "detect", icon: "🕵️", cat: "team", name: "수 탐정", desc: "단서를 하나씩 열며 숨은 수를 추리해요. 적은 단서로 맞힐수록 높은 점수! (약수·배수·소수·제곱수)", mount: function(el, ctl){
    var N = K.pref("detN") || 100, showC = false;
    var ns = h("select"); [50, 100].forEach(function(n){ var o = h("option", "", "1 ~ " + n); o.value = n; ns.appendChild(o); }); ns.value = N; ns.onchange = function(){ N = +ns.value; K.pref("detN", N); newCase(); };
    var cb = btn("🔢 후보 보기", "", function(){ showC = !showC; cb.classList.toggle("primary", showC); draw(); });
    ctl.appendChild(ns); ctl.appendChild(cb); ctl.appendChild(btn("🔄 새 사건", "primary", newCase));
    var wrap = h("div", "det"), cl = h("div", "clues"), cand = h("div", "cand"); wrap.appendChild(cl); wrap.appendChild(cand); el.appendChild(wrap);
    function newCase(){ var p = null, x, g = 0; while((!p || (g < 150 && K.recent.seen("detect" + N, x))) && g++ < 200){ x = ri(2, N); p = plan(x, N); } K.recent.add("detect" + N, x, Math.round(N * .4)); DS = {x: x, plan: p, open: 1, solved: false, N: N}; K.S.whoosh(); draw(); }
    function pts(){ return Math.max(1, DS.plan.length + 2 - DS.open); }
    function draw(){
      cl.innerHTML = ""; cand.innerHTML = "";
      var hd = h("div", "qrow"); hd.appendChild(h("span", "q", DS.solved ? "🎉 정답은 " + DS.x + "!" : "🕵️ 숨은 수는?")); if(!DS.solved) hd.appendChild(h("span", "pts", "지금 맞히면 " + pts() + "점")); cl.appendChild(hd);
      DS.plan.forEach(function(c, i){ var d = h("div", "clue" + (i < DS.open || DS.solved ? "" : " hide") + (i === DS.fresh ? " new" : "")); d.appendChild(h("span", "", "🔍 " + (i + 1))); d.appendChild(h("span", "", i < DS.open || DS.solved ? c.t : "단서 " + (i + 1))); cl.appendChild(d); });
      var row = h("div", "qrow"), ob = h("button", "bigbtn y", "🔍 다음 단서"), ok = h("button", "bigbtn g", "✅ 맞힌 모둠"), sh = h("button", "bigbtn k", "👀 정답 공개"); ob.type = ok.type = sh.type = "button";
      ob.disabled = DS.solved || DS.open >= DS.plan.length; ok.disabled = sh.disabled = DS.solved;
      ob.onclick = function(){ DS.open++; DS.fresh = DS.open - 1; K.S.pop(); draw(); DS.fresh = -1; };
      ok.onclick = function(){ var p = pts(); K.askTeam("🕵️ " + DS.x + "을(를) 맞힌 모둠은? (+" + p + "점)", function(i){ DS.solved = true; K.add(i, p); K.S.win(); K.fireworks(3); K.big("🎉 " + DS.x + "!", K.teams()[i].name + " +" + p, K.teams()[i].color, 2000); draw(); }); };
      sh.onclick = function(){ DS.solved = true; K.S.drum(1); setTimeout(function(){ K.S.fanfare(); K.big(String(DS.x), "숨은 수", "#c2410c"); draw(); }, 1000); };
      row.appendChild(ob); row.appendChild(sh); row.appendChild(ok); cl.appendChild(row);
      var left = DS.solved ? [DS.x] : DS.plan[Math.min(DS.open, DS.plan.length) - 1].left;
      cand.hidden = !showC && !DS.solved;
      for(var n = 1; n <= DS.N; n++) cand.appendChild(h("span", DS.solved && n === DS.x ? "win" : left.indexOf(n) < 0 ? "x" : "", String(n)));
    }
    if(DS && DS.N === N) draw(); else newCase();
  }});

  /* =============== 📈 그래프 맞히기 =============== */
  var GS = null, R0 = 6;
  function fmtLin(a, b){ var s = "y = "; s += a.d === 1 ? (a.n === 1 ? "" : a.n === -1 ? "−" : sg(a.n)) : fracH(a.n, a.d); s += "x"; if(b) s += b < 0 ? " − " + -b : " + " + b; return s; }
  function fmtQ(a, p, q){ var s = "y = " + (a.d === 1 ? (a.n === 1 ? "" : a.n === -1 ? "−" : sg(a.n)) : fracH(a.n, a.d)); s += p ? "(x " + (p > 0 ? "− " + p : "+ " + -p) + ")²" : "x²"; if(q) s += q < 0 ? " − " + -q : " + " + q; return s; }
  function plot(f, big){
    var W = 240, s = W / (2 * R0), X = function(x){ return W / 2 + x * s; }, Y = function(y){ return W / 2 - y * s; }, g = "";
    for(var i = -R0; i <= R0; i++){ g += '<line x1="' + X(i) + '" y1="0" x2="' + X(i) + '" y2="' + W + '" stroke="#eef2f6"/><line y1="' + Y(i) + '" x1="0" y2="' + Y(i) + '" x2="' + W + '" stroke="#eef2f6"/>'; }
    g += '<line x1="0" y1="' + Y(0) + '" x2="' + W + '" y2="' + Y(0) + '" stroke="#5b6773" stroke-width="1.5"/><line x1="' + X(0) + '" y1="0" x2="' + X(0) + '" y2="' + W + '" stroke="#5b6773" stroke-width="1.5"/>';
    if(big) for(i = -R0 + 1; i < R0; i++) if(i && i % 2 === 0){ g += '<text x="' + X(i) + '" y="' + (Y(0) + 11) + '" font-size="8" text-anchor="middle" fill="#8a96a3">' + i + '</text><text x="' + (X(0) - 4) + '" y="' + (Y(i) + 3) + '" font-size="8" text-anchor="end" fill="#8a96a3">' + i + "</text>"; }
    g += '<text x="' + (W - 8) + '" y="' + (Y(0) - 4) + '" font-size="10" fill="#5b6773">x</text><text x="' + (X(0) + 4) + '" y="10" font-size="10" fill="#5b6773">y</text>';
    var d = "", pen = false; for(var x = -R0; x <= R0; x += .05){ var y = f(x); if(Math.abs(y) > R0 + 2){ pen = false; continue; } d += (pen ? "L" : "M") + X(x).toFixed(1) + " " + Y(y).toFixed(1); pen = true; }
    g += '<path d="' + d + '" fill="none" stroke="#d6336c" stroke-width="' + (big ? 3 : 3.5) + '" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 ' + W + " " + W + '" preserveAspectRatio="xMidYMid meet">' + g + "</svg>";
  }
  function genGraph(kind){
    var opts = [], seen = {};
    function fr(){ var o = pick([[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [2, 3]]); return {n: o[0], d: o[1]}; }
    function key(o){ return o.k; }
    if(kind === 1){
      var a = fr(), b = ri(-4, 4), L = function(a, b){ return {k: a.n + "/" + a.d + "|" + b, f: function(x){ return a.n / a.d * x + b; }, t: fmtLin(a, b)}; };
      var main = L(a, b), ds = [L({n: -a.n, d: a.d}, b), L(a, -b || b + 2), L({n: -a.n, d: a.d}, -b || -2), L(a, b + (Math.random() < .5 ? 2 : -2)), L({n: a.d, d: Math.abs(a.n)}, b)];
      opts = [main].concat(ds);
    } else {
      var A = pick([{n: 1, d: 1}, {n: -1, d: 1}, {n: 2, d: 1}, {n: -2, d: 1}, {n: 1, d: 2}, {n: -1, d: 2}]), p = ri(-3, 3), q = ri(-3, 3);
      var Q = function(a, p, q){ return {k: a.n + "/" + a.d + "|" + p + "|" + q, f: function(x){ return a.n / a.d * (x - p) * (x - p) + q; }, t: fmtQ(a, p, q)}; };
      var m2 = Q(A, p, q); opts = [m2, Q(A, -p || 2, q), Q(A, p, -q || 2), Q({n: -A.n, d: A.d}, p, q), Q(A, q, p), Q({n: -A.n, d: A.d}, -p || 1, q)];
    }
    var out = []; opts.forEach(function(o){ if(!seen[key(o)] && out.length < 4){ seen[key(o)] = 1; out.push(o); } });
    return {ans: out[0], opts: K.shuffle(out)};
  }
  K.game({id: "graph", icon: "📈", cat: "team", name: "그래프 맞히기", desc: "그래프를 보고 알맞은 식을, 또는 식을 보고 알맞은 그래프를 골라요. (일차함수·이차함수)", mount: function(el, ctl){
    var kind = K.pref("gKind") || 1, dir = K.pref("gDir") || "g2f";
    ctl.appendChild(seg([[1, "일차함수"], [2, "이차함수"]], kind, function(v){ kind = v; K.pref("gKind", v); next(); }));
    ctl.appendChild(seg([["g2f", "그래프 → 식"], ["f2g", "식 → 그래프"]], dir, function(v){ dir = v; K.pref("gDir", v); next(); }));
    var aw = awardSel("gAward"); ctl.appendChild(aw); ctl.appendChild(btn("⏭ 다음", "primary", function(){ next(); }));
    var wrap = h("div", "gq"); el.appendChild(wrap);
    function next(){ GS = {g: K.fresh("graph" + kind, function(){ return genGraph(kind); }, function(x){ return x.ans.t; }, 25), kind: kind, dir: dir, done: false}; K.S.whoosh(); draw(); }
    function draw(){
      wrap.innerHTML = ""; var G = GS.g;
      if(GS.dir === "g2f"){
        var m = h("div", "main"); m.innerHTML = plot(G.ans.f, true); m.firstChild.style.width = m.firstChild.style.height = "100%"; wrap.appendChild(m);
        var os = h("div", "opts");
        G.opts.forEach(function(o){ var b = h("button", "op"); b.type = "button"; b.innerHTML = o.t; b.onclick = function(){ choose(o, b); }; os.appendChild(b); }); wrap.appendChild(os);
      } else {
        var l = h("div", "lhs"); var fm = h("div", "formula"); fm.innerHTML = G.ans.t; l.appendChild(fm); l.appendChild(h("div", "hint", "알맞은 그래프를 골라요")); wrap.appendChild(l);
        var og = h("div", "opts g"); G.opts.forEach(function(o){ var b = h("button", "op"); b.type = "button"; b.innerHTML = plot(o.f, false); b.onclick = function(){ choose(o, b); }; og.appendChild(b); }); wrap.appendChild(og);
      }
    }
    function choose(o, b){
      if(GS.done) return;
      if(o === GS.g.ans){ GS.done = true; b.classList.add("ok"); K.S.good(); var r = b.getBoundingClientRect(); K.confetti(r.left + r.width / 2, r.top + r.height / 2, 50); K.later(function(){ award(aw.value); }, 700); }
      else { b.classList.add("no"); K.S.bad(); K.shake(b); }
    }
    if(GS && GS.kind === kind && GS.dir === dir) draw(); else next();
  }});
})();
