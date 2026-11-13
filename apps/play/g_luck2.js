/* 🍀 운으로 (더하기) — 윷놀이 · 사다리 타기 · 블랙잭 21 · 슬롯머신 · 동전 연속 맞히기 */
(function(){
  "use strict";
  var h = K.h, btn = K.btn;
  K.css([
    /* 윷놀이 */
    ".yut{display:flex;gap:16px;width:100%;height:100%;padding:10px;align-items:center;justify-content:center}",
    ".yut .bd{position:relative;height:100%;aspect-ratio:1;max-width:58%;background:#fff7e6;border-radius:18px;box-shadow:inset 0 0 0 3px #e8d3a8}",
    ".yut .bd svg{position:absolute;inset:0;width:100%;height:100%}",
    ".yut .sp{position:absolute;width:9%;aspect-ratio:1;border-radius:50%;background:#fff;border:3px solid #c9a86a;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:1px}",
    ".yut .sp.big{width:12%;background:#ffe9b8;border-color:#b8873a}",
    ".yut .sp .lb{position:absolute;font-size:11px;font-weight:900;color:#a07a3a;top:-17px;white-space:nowrap}",
    ".yut .tok{width:44%;height:44%;font-size:10px}",
    ".yut .side{display:flex;flex-direction:column;gap:10px;align-items:center;min-width:240px;max-width:40%}",
    ".sticks{display:flex;gap:10px;height:clamp(90px,20vh,170px)}",
    ".stick{width:clamp(22px,4vh,36px);height:100%;border-radius:999px;display:flex;flex-direction:column;align-items:center;justify-content:space-around;font-weight:900;color:#7a4b12;font-size:clamp(11px,2vh,16px);transition:transform .1s}",
    ".stick.f{background:#f6dfae;box-shadow:inset 0 0 0 3px #d9b36d}.stick.r{background:linear-gradient(90deg,#8a5a22,#b07a38 50%,#8a5a22);color:transparent}",
    ".stick.toss{animation:toss .5s}",
    "@keyframes toss{30%{transform:translateY(-40px) rotate(160deg)}60%{transform:translateY(-10px) rotate(300deg)}}",
    ".yres{font-size:clamp(30px,7vh,60px);font-weight:900;color:#b8560f;min-height:1.2em}",
    ".ystat{display:grid;grid-template-columns:repeat(6,1fr);gap:3px;font-size:12px;text-align:center;width:100%}",
    ".ystat b{display:block;font-size:15px}",
    ".ystat div{background:#fff;border-radius:8px;padding:3px 0}",
    /* 사다리 */
    ".lad{flex:1;width:100%;display:flex;flex-direction:column;padding:8px 14px;gap:4px;min-height:0}",
    ".lad .row{display:grid;gap:6px}",
    ".lad .row button,.lad .row div{font:inherit;font-weight:900;border-radius:12px;padding:6px 4px;text-align:center;font-size:clamp(13px,2.4vh,20px);border:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}",
    ".lad .row button{color:#fff;cursor:pointer}.lad .row button:disabled{opacity:.45;cursor:default}",
    ".lad .row div{background:#fff;box-shadow:0 2px 0 #cfd8e3;color:#2d3a48}",
    ".lad .row div.hid{background:repeating-linear-gradient(45deg,#dde3ea 0 8px,#e9edf2 8px 16px);color:#8a96a3}",
    ".lad svg{flex:1;min-height:0;width:100%}",
    /* 블랙잭 */
    ".bj{flex:1;width:100%;display:flex;flex-direction:column;gap:5px;padding:8px 12px;min-height:0}",
    ".bj .ln{flex:1;display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;padding:4px 10px;min-height:0;border:3px solid transparent}",
    ".bj .ln.on{border-color:#ffd23f;background:#fffbea}.bj .ln.out{opacity:.5}",
    ".bj .nm{width:90px;font-weight:900;font-size:15px}",
    ".bj .cs{flex:1;display:flex;gap:5px;height:100%;align-items:center;min-width:0}",
    ".bj .cd{height:86%;max-height:70px;aspect-ratio:2/3;border-radius:8px;background:#fff;border:2px solid #cfd8e3;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:clamp(16px,3.4vh,28px);animation:dealin .35s}",
    ".bj .sm{font-size:clamp(20px,4vh,34px);font-weight:900;width:110px;text-align:right}",
    ".bj .bot{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap}",
    /* 슬롯 */
    ".slot{display:flex;gap:22px;align-items:center;justify-content:center;width:100%;height:100%;padding:10px}",
    ".slot .mach{background:linear-gradient(180deg,#d6336c,#a61e4d);border-radius:26px;padding:clamp(12px,3vh,26px);box-shadow:0 10px 0 #7a1538;display:flex;flex-direction:column;align-items:center;gap:12px}",
    ".slot .top{color:#ffe066;font-weight:900;font-size:clamp(18px,3.4vh,30px);letter-spacing:4px}",
    ".slot .reels{display:flex;gap:10px;background:#2b1020;padding:10px;border-radius:16px}",
    ".slot .reel{width:clamp(70px,13vh,120px);height:clamp(96px,18vh,160px);background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:clamp(50px,11vh,96px);font-weight:900;color:#2d3a48;box-shadow:inset 0 10px 14px rgba(0,0,0,.18),inset 0 -10px 14px rgba(0,0,0,.18)}",
    ".slot .reel.spin{filter:blur(1.5px);color:#868e96}",
    ".slot .rules{background:#fff;border-radius:14px;padding:10px 14px;font-size:clamp(13px,2.2vh,17px);line-height:1.7;min-width:230px}",
    ".slot .rules .on{background:#fff3bf;border-radius:6px;font-weight:900}",
    ".slot .rules small{color:var(--sub)}",
    /* 동전 */
    ".coin{width:clamp(120px,26vh,220px);aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:clamp(34px,7vh,60px);font-weight:900;color:#7a5200;background:radial-gradient(circle at 35% 30%,#fff6c8,#ffd43b 45%,#e0a100);box-shadow:0 8px 0 #a87300,inset 0 0 0 8px rgba(255,255,255,.35)}",
    ".coin.b{background:radial-gradient(circle at 35% 30%,#f1f3f5,#ced4da 45%,#868e96);color:#343a40;box-shadow:0 8px 0 #495057,inset 0 0 0 8px rgba(255,255,255,.35)}",
    ".coin.flip{animation:cflip .9s cubic-bezier(.3,.7,.4,1)}",
    "@keyframes cflip{0%{transform:translateY(0) rotateX(0)}45%{transform:translateY(-120px) rotateX(900deg)}100%{transform:translateY(0) rotateX(1800deg)}}",
    ".chist{display:flex;gap:3px;flex-wrap:wrap;justify-content:center;max-width:640px}",
    ".chist span{width:20px;height:20px;border-radius:50%;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;background:#ffd43b;color:#7a5200}",
    ".chist span.b{background:#ced4da;color:#343a40}"
  ].join("\n"));

  /* =============== 🪵 윷놀이 =============== */
  /* 판: 바깥 20칸 + 대각선 지름길(모서리·가운데에서 멈추면 지름길로) */
  var YP = {}, Y_OUT = [];
  (function(){
    var P = function(id, x, y, big, lb){ YP[id] = {x: x, y: y, big: !!big, lb: lb}; };
    P("O0", 100, 100, true, "출발·도착");
    for(var i = 1; i <= 4; i++) P("O" + i, 100, 100 - i * 20);
    P("O5", 100, 0, true); for(i = 1; i <= 4; i++) P("O" + (5 + i), 100 - i * 20, 0);
    P("O10", 0, 0, true); for(i = 1; i <= 4; i++) P("O" + (10 + i), 0, i * 20);
    P("O15", 0, 100, true); for(i = 1; i <= 4; i++) P("O" + (15 + i), i * 20, 100);
    P("A1", 83.3, 16.7); P("A2", 66.7, 33.3); P("C", 50, 50, true, "방"); P("B3", 33.3, 66.7); P("B4", 16.7, 83.3);
    P("E1", 16.7, 16.7); P("E2", 33.3, 33.3); P("F3", 66.7, 66.7); P("F4", 83.3, 83.3);
    for(i = 0; i < 20; i++) Y_OUT.push("O" + i);
  })();
  var ROUTE = {
    out: Y_OUT.concat(["END"]),
    r5: ["O5", "A1", "A2", "C", "B3", "B4", "O15", "O16", "O17", "O18", "O19", "END"],
    r10: ["O10", "E1", "E2", "C", "F3", "F4", "END"],
    rc: ["C", "F3", "F4", "END"]
  };
  var YNAME = {1: "도", 2: "개", 3: "걸", 4: "윷", 5: "모", "-1": "빽도"};
  K.game({id: "yut", icon: "🪵", cat: "luck", name: "윷놀이", desc: "맞힌 모둠이 윷을 던져 말을 옮겨요. 모서리에 멈추면 지름길! 윷·모·잡기는 한 번 더. 도·개·걸·윷·모는 왜 확률이 다를까?", mount: function(el, ctl){
    var back = K.pref("yutBack") !== false, pcs, busy = false, done = false, stat;
    var wrap = h("div", "yut"), bd = h("div", "bd"), side = h("div", "side"); wrap.appendChild(bd); wrap.appendChild(side); el.appendChild(wrap);
    var tr = K.turnRow(), sticks = h("div", "sticks"), res = h("div", "yres"), row = h("div", "qrow"), st = h("div", "ystat");
    var ok = h("button", "bigbtn g", "✅ 맞혔다! 윷 던지기"), no = h("button", "bigbtn k", "❌ 틀림"); ok.type = no.type = "button"; row.appendChild(no); row.appendChild(ok);
    side.appendChild(tr); side.appendChild(sticks); side.appendChild(res); side.appendChild(row); side.appendChild(st);
    var bl = h("label", "sm"), bc = h("input"); bc.type = "checkbox"; bc.checked = back; bc.onchange = function(){ back = bc.checked; K.pref("yutBack", back); drawSticks([1, 1, 1, 1]); }; bl.appendChild(bc); bl.appendChild(document.createTextNode(" 빽도 넣기")); bl.style.cssText = "display:flex;gap:4px;align-items:center";
    ctl.appendChild(bl); ctl.appendChild(btn("🔄 새 판", "primary", reset));
    function reset(){ pcs = {}; K.teams().forEach(function(t){ pcs[t.i] = {route: "out", idx: 0, hist: [], fin: false}; }); stat = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, "-1": 0, n: 0}; done = false; res.textContent = ""; K.setTurn(0); drawSticks([1, 1, 1, 1]); draw(); }
    function cell(p){ return ROUTE[p.route][p.idx]; }
    function draw(){
      bd.innerHTML = "";
      var lines = [["O0", "O5"], ["O5", "O10"], ["O10", "O15"], ["O15", "O0"], ["O5", "O15"], ["O10", "O0"]], s = '<svg viewBox="-8 -8 116 116" preserveAspectRatio="none">';
      lines.forEach(function(l){ s += '<line x1="' + YP[l[0]].x + '" y1="' + YP[l[0]].y + '" x2="' + YP[l[1]].x + '" y2="' + YP[l[1]].y + '" stroke="#d9bf8c" stroke-width="1.6" stroke-dasharray="' + (l[0] === "O5" && l[1] === "O15" || l[0] === "O10" && l[1] === "O0" ? "3 2" : "0") + '"/>'; });
      bd.innerHTML = s + "</svg>";
      Object.keys(YP).forEach(function(id){
        var p = YP[id], d = h("div", "sp" + (p.big ? " big" : "")); d.style.left = ((p.x + 8) / 1.16) + "%"; d.style.top = ((p.y + 8) / 1.16) + "%";
        if(p.lb) d.appendChild(h("span", "lb", p.lb));
        K.teams().forEach(function(t){ var q = pcs[t.i]; if(!q || q.fin) return; var wait = !q.hist.length; if(wait ? id === "O0" : cell(q) === id){ var o = h("span", "tok", String(t.i + 1)); o.style.background = t.color; if(wait){ o.style.opacity = ".45"; o.title = "출발 전"; } d.appendChild(o); } });
        bd.appendChild(d);
      });
      st.innerHTML = "";
      [1, 2, 3, 4, 5].concat(back ? [-1] : []).forEach(function(k){ var c = h("div"); c.appendChild(h("b", "", YNAME[k])); var th = {1: 4, 2: 6, 3: 4, 4: 1, 5: 1, "-1": 1}[k]; if(back && k === 1) th = 3; c.appendChild(h("span", "", stat[k] + "번")); c.title = "이론 " + th + "/16"; c.appendChild(h("small", "", " ·" + th + "/16")); st.appendChild(c); });
      st.style.gridTemplateColumns = "repeat(" + (back ? 6 : 5) + ",1fr)";
    }
    function drawSticks(fl, anim){
      sticks.innerHTML = "";
      fl.forEach(function(f, i){ var s = h("div", "stick " + (f ? "f" : "r") + (anim ? " toss" : "")); if(f){ var mk = back && i === 0 ? "↩" : "×"; s.appendChild(h("span", "", mk)); s.appendChild(h("span", "", "×")); s.appendChild(h("span", "", mk)); } s.style.animationDelay = (i * .05) + "s"; sticks.appendChild(s); });
    }
    function throwYut(){
      var fl = [0, 0, 0, 0].map(function(){ return K.rnd(2); }), n = fl.reduce(function(a, b){ return a + b; }, 0);
      var v = n === 0 ? 5 : n; if(back && n === 1 && fl[0] === 1) v = -1;
      return {fl: fl, v: v};
    }
    async function step(t, v){
      var p = pcs[t];
      if(v < 0){ if(!p.hist.length){ K.big("빽도… 출발 전이라 그대로", null, "#56606b", 1200); return; } var s0 = p.hist.pop(); p.route = s0.route; p.idx = s0.idx; K.S.bad(); draw(); return; }
      for(var k = 0; k < v; k++){
        p.hist.push({route: p.route, idx: p.idx}); p.idx++;
        if(cell(p) === "END"){ p.fin = true; draw(); return; }
        draw(); K.S.step(k); await K.sleep(260);
      }
      var c = cell(p);
      if(p.route === "out" && c === "O5"){ p.route = "r5"; p.idx = 0; }
      else if(p.route === "out" && c === "O10"){ p.route = "r10"; p.idx = 0; }
      else if(p.route === "r5" && c === "C"){ p.route = "rc"; p.idx = 0; }
      if(YP[c].big && c !== "O0" && c !== "O15"){ K.tone(700, .15, "triangle", .2, 0, 1200); }
    }
    ok.onclick = async function(){
      if(busy || done) return; busy = true; ok.disabled = no.disabled = true; var t = K.turn(), T = K.teams()[t];
      if(!pcs[t]) pcs[t] = {route: "out", idx: 0, hist: [], fin: false};
      K.S.whoosh(); var r = throwYut(); drawSticks(r.fl, true); res.textContent = "…"; await K.sleep(550); K.S.dice();
      stat[r.v]++; stat.n++; res.textContent = YNAME[r.v] + (r.v > 0 ? " (" + r.v + "칸)" : " (1칸 뒤로)");
      K.big(YNAME[r.v] + "!", T.name, r.v >= 4 ? "#c2410c" : r.v < 0 ? "#56606b" : "#8a5a22", 1000); await K.sleep(700);
      await step(t, r.v);
      var again = r.v >= 4, p = pcs[t];
      if(p.fin){ done = true; K.S.win(); K.fireworks(6); K.big("🏁 " + T.name + " 도착!", "+5점", T.color, 3000); K.add(t, 5); }
      else if(p.hist.length && r.v !== 0){
        var c = cell(p);
        K.teams().forEach(function(o){ var q = pcs[o.i]; if(o.i !== t && q && !q.fin && q.hist.length && cell(q) === c){ q.route = "out"; q.idx = 0; q.hist = []; again = true; K.S.boom(); K.shake(); K.big("잡았다! 🎯", o.name + " 처음으로 · " + T.name + " 한 번 더", T.color, 1800); } });
      }
      draw();
      if(!done){ if(again){ setTimeout(function(){ if(!done) K.big("한 번 더! 🔁", T.name, "#4c8bf5", 1000); }, 400); } else K.nextTurn(); }
      busy = false; ok.disabled = no.disabled = false;
    };
    no.onclick = function(){ if(busy || done) return; K.S.bad(); K.nextTurn(); };
    var lis = function(ev){ if(ev.type === "teams"){ K.teams().forEach(function(t){ if(!pcs[t.i]) pcs[t.i] = {route: "out", idx: 0, hist: [], fin: false}; }); draw(); } }; K.on(lis);
    reset();
    return function(){ K.off(lis); tr.cleanup(); };
  }});

  /* =============== 🪜 사다리 타기 =============== */
  var LAD_DEF = ["+3", "+2", "+1", "꽝", "×2", "+5", "−1", "한 번 더"];
  K.game({id: "ladder", icon: "🪜", cat: "luck", name: "사다리 타기", desc: "모둠 이름에서 출발해 가로줄을 만날 때마다 꺾어 내려가요. 아래 결과는 가려져 있어요! 결과 칸은 고칠 수 있어요.", mount: function(el, ctl){
    var list = K.pref("ladder") || LAD_DEF.slice(), hide = K.pref("ladHide") !== false, apply = K.pref("ladApply") !== false, n, prizes, rungs, ROWS = 12, used, busy = false;
    var w = h("div", "lad"), top = h("div", "row"), svgBox = h("div"), bot = h("div", "row"); svgBox.style.cssText = "flex:1;min-height:0;display:flex"; w.appendChild(top); w.appendChild(svgBox); w.appendChild(bot); el.appendChild(w);
    function chk(label, val, fn){ var l = h("label", "sm"), c = h("input"); c.type = "checkbox"; c.checked = val; c.onchange = function(){ fn(c.checked); }; l.appendChild(c); l.appendChild(document.createTextNode(" " + label)); l.style.cssText = "display:flex;gap:4px;align-items:center"; return l; }
    ctl.appendChild(chk("결과 가리기", hide, function(v){ hide = v; K.pref("ladHide", v); drawEnds(); }));
    ctl.appendChild(chk("점수에 반영", apply, function(v){ apply = v; K.pref("ladApply", v); }));
    ctl.appendChild(btn("✏️ 결과 칸", "", edit)); ctl.appendChild(btn("▶ 모두 타기", "", allGo)); ctl.appendChild(btn("🔄 새 사다리", "primary", build));
    function build(){
      n = K.teams().length; var base = list.slice(); while(base.length < n) base = base.concat(list); prizes = K.shuffle(base.slice(0, n)); used = {};
      do{ rungs = []; for(var r = 0; r < ROWS; r++){ var row = []; for(var g = 0; g < n - 1; g++) row.push(!row[g - 1] && K.rnd(100) < 42); rungs.push(row); } }
      while(!Array.from({length: n - 1}, function(_, g){ return rungs.some(function(r){ return r[g]; }); }).every(Boolean));
      K.S.whoosh(); draw();
    }
    function path(c){ var pts = [[c, 0]]; for(var r = 0; r < ROWS; r++){ var y = r + 1; pts.push([c, y]); if(rungs[r][c]){ c++; pts.push([c, y]); } else if(c > 0 && rungs[r][c - 1]){ c--; pts.push([c, y]); } } pts.push([c, ROWS + 1]); return {pts: pts, end: c}; }
    var W = 1000, H = 600;
    function X(c){ return (c + .5) * W / n; } function Y(y){ return y * H / (ROWS + 1); }
    function draw(){
      var cols = "repeat(" + n + ",1fr)"; top.style.gridTemplateColumns = bot.style.gridTemplateColumns = cols;
      top.innerHTML = ""; K.teams().forEach(function(t){ var b = h("button", "", t.name); b.type = "button"; b.style.background = t.color; b.disabled = !!used[t.i]; b.onclick = function(){ run(t.i); }; top.appendChild(b); });
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none">';
      for(var c = 0; c < n; c++) s += '<line x1="' + X(c) + '" y1="0" x2="' + X(c) + '" y2="' + H + '" stroke="#5b6773" stroke-width="7" stroke-linecap="round"/>';
      rungs.forEach(function(row, r){ row.forEach(function(on, g){ if(on) s += '<line x1="' + X(g) + '" y1="' + Y(r + 1) + '" x2="' + X(g + 1) + '" y2="' + Y(r + 1) + '" stroke="#5b6773" stroke-width="7" stroke-linecap="round"/>'; }); });
      s += '<g id="ladPaths"></g></svg>'; svgBox.innerHTML = s; svgBox.firstChild.style.cssText = "width:100%;height:100%";
      Object.keys(used).forEach(function(i){ addPath(+i, false); });
      drawEnds();
    }
    function drawEnds(){
      bot.innerHTML = ""; var shown = {}; Object.keys(used).forEach(function(i){ shown[used[i]] = +i; });
      prizes.forEach(function(p, c){ var d = h("div", hide && shown[c] == null ? "hid" : "", hide && shown[c] == null ? "?" : p); if(shown[c] != null){ d.style.boxShadow = "inset 0 0 0 4px " + K.teams()[shown[c]].color; } bot.appendChild(d); });
    }
    function addPath(i, anim){
      var g = svgBox.querySelector("#ladPaths"), p = path(i), d = p.pts.map(function(q, k){ return (k ? "L" : "M") + X(q[0]) + " " + Y(q[1]); }).join(" "), col = K.teams()[i].color;
      var e = document.createElementNS("http://www.w3.org/2000/svg", "path"); e.setAttribute("d", d); e.setAttribute("fill", "none"); e.setAttribute("stroke", col); e.setAttribute("stroke-width", "13"); e.setAttribute("stroke-linejoin", "round"); e.setAttribute("stroke-linecap", "round"); e.setAttribute("opacity", ".85");
      g.appendChild(e);
      if(anim){ var L = e.getTotalLength(); e.style.strokeDasharray = L; e.style.strokeDashoffset = L; e.getBoundingClientRect(); e.style.transition = "stroke-dashoffset 2.4s linear"; e.style.strokeDashoffset = 0; }
      return p.end;
    }
    function run(i){
      return new Promise(function(res){
        if(busy || used[i] != null){ res(); return; } busy = true; var end = addPath(i, true); var tick = setInterval(function(){ K.S.tick(); }, 180);
        setTimeout(function(){
          clearInterval(tick); used[i] = end; busy = false; draw(); var pz = prizes[end];
          var r = bot.children[end].getBoundingClientRect(); K.confetti(r.left + r.width / 2, r.top, /꽝|−/.test(pz) ? 0 : 50);
          if(apply) K.applyPrize(pz, i); else { K.S.fanfare(); K.big(pz, K.teams()[i].name, K.teams()[i].color, 1500); }
          setTimeout(res, 1700);
        }, 2450);
      });
    }
    async function allGo(){ for(var i = 0; i < n; i++){ if(used[i] == null) await run(i); } }
    function edit(){
      var d = h("dialog"), f = h("form"); d.appendChild(f); document.body.appendChild(d);
      f.innerHTML = '<h2>✏️ 사다리 결과 칸 (한 줄에 하나)</h2><p>모둠 수만큼 골라 섞어 씁니다. <b>+3</b>, <b>−1</b>, <b>×2</b>, <b>꽝</b>은 점수에 반영되고, 그 밖의 말(예: 발표 먼저 🎤, 청소 면제)은 보여 주기만 해요.</p><textarea></textarea><div class="acts"><button type="button" class="btn" id="ld">기본값</button><div class="r"><button type="button" class="btn" id="lx">취소</button><button class="btn primary">저장하고 새 사다리</button></div></div>';
      var ta = f.querySelector("textarea"); ta.value = list.join("\n"); f.querySelector("#ld").onclick = function(){ ta.value = LAD_DEF.join("\n"); }; f.querySelector("#lx").onclick = function(){ d.close(); };
      f.onsubmit = function(e){ e.preventDefault(); var L = ta.value.split("\n").map(function(s){ return s.trim().replace(/^-/, "−"); }).filter(Boolean).slice(0, 12); if(L.length < 2) return; list = L; K.pref("ladder", L); d.close(); build(); };
      d.addEventListener("close", function(){ d.remove(); }); d.showModal();
    }
    var lis = function(ev){ if(ev.type === "teams" && K.teams().length !== n) build(); }; K.on(lis);
    build();
    return function(){ K.off(lis); };
  }});

  /* =============== 🂡 블랙잭 21 =============== */
  K.game({id: "bj", icon: "🂡", cat: "luck", name: "블랙잭 21", desc: "1~10 카드를 한 장씩 받아 합을 21에 가깝게! 넘으면 탈락. 한 장 더 받을까, 멈출까? 넘을 확률도 계산해 봐요.", mount: function(el, ctl){
    var deck, hands, cur, over, showP = false;
    var w = h("div", "bj"), list = h("div"), bot = h("div", "bot"); list.style.cssText = "flex:1;display:flex;flex-direction:column;gap:5px;min-height:0"; w.appendChild(list); w.appendChild(bot); el.appendChild(w);
    var hit = h("button", "bigbtn g", "🃏 한 장 더"), stay = h("button", "bigbtn", "✋ 멈춤"), info = h("div", "hint"); hit.type = stay.type = "button"; bot.appendChild(hit); bot.appendChild(stay); bot.appendChild(info);
    var pb = btn("🔢 넘을 확률", "", function(){ showP = !showP; pb.classList.toggle("primary", showP); draw(); }); ctl.appendChild(pb); ctl.appendChild(btn("🔄 새 판", "primary", start));
    function sum(a){ return a.reduce(function(p, q){ return p + q; }, 0); }
    function start(){
      deck = []; for(var v = 1; v <= 10; v++) for(var k = 0; k < 4; k++) deck.push(v); deck = K.shuffle(deck);
      hands = K.teams().map(function(){ return {c: [deck.pop(), deck.pop()], st: "play"}; }); cur = 0; over = false; K.setTurn(0); K.S.whoosh(); draw();
    }
    function draw(){
      list.innerHTML = "";
      K.teams().forEach(function(t, i){
        var H = hands[i]; if(!H) return; var s = sum(H.c), ln = h("div", "ln" + (i === cur && !over ? " on" : "") + (H.st === "bust" ? " out" : ""));
        var nm = h("div", "nm", t.name); nm.style.color = t.color; ln.appendChild(nm);
        var cs = h("div", "cs"); H.c.forEach(function(v){ cs.appendChild(h("div", "cd", String(v))); }); ln.appendChild(cs);
        var sm = h("div", "sm", (H.st === "bust" ? "💥 " : H.st === "stay" ? "✋ " : "") + s); sm.style.color = s === 21 ? "#c2410c" : s > 21 ? "#d64545" : "#2d3a48"; ln.appendChild(sm);
        list.appendChild(ln);
      });
      hit.disabled = stay.disabled = over;
      if(over){ info.textContent = "남은 카드 " + deck.length + "장 · 🔄 새 판"; return; }
      var s = sum(hands[cur].c), bad = deck.filter(function(v){ return s + v > 21; }).length;
      info.textContent = K.teams()[cur].name + " 차례 · 지금 " + s + (showP ? " · 다음 카드에 21을 넘을 확률 " + bad + "/" + deck.length + " (" + Math.round(bad / deck.length * 100) + "%)" : " · 남은 카드 " + deck.length + "장");
    }
    function next(){
      var n = hands.length, k = 0;
      do{ cur = (cur + 1) % n; k++; } while(hands[cur].st !== "play" && k <= n);
      if(hands.every(function(x){ return x.st !== "play"; })) return finish();
      K.setTurn(cur); draw();
    }
    function finish(){
      over = true; var best = -1; hands.forEach(function(x){ var s = sum(x.c); if(s <= 21) best = Math.max(best, s); }); draw();
      if(best < 0){ K.S.sad(); K.big("모두 탈락 😱", "다음 판에서!", "#56606b", 2000); return; }
      var win = []; hands.forEach(function(x, i){ if(sum(x.c) === best) win.push(i); });
      K.S.win(); K.fireworks(3); var p = best === 21 ? 5 : 3; win.forEach(function(i){ K.add(i, p); });
      K.big("🏆 " + win.map(function(i){ return K.teams()[i].name; }).join(", "), best + (best === 21 ? " 딱 21! +5" : " · +3"), K.teams()[win[0]].color, 2800);
    }
    hit.onclick = function(){
      if(over) return; var H = hands[cur]; if(!deck.length){ K.big("카드가 없어요", null); return; }
      H.c.push(deck.pop()); K.S.pop(); var s = sum(H.c);
      if(s > 21){ H.st = "bust"; draw(); K.S.boom(); K.shake(list.children[cur]); K.big("💥 " + s + "! 탈락", K.teams()[cur].name, "#d64545", 1400); setTimeout(next, 900); return; }
      if(s === 21){ H.st = "stay"; draw(); K.S.fanfare(); K.big("딱 21! 🎯", K.teams()[cur].name, "#c2410c", 1200); setTimeout(next, 900); return; }
      draw();
    };
    stay.onclick = function(){ if(over) return; hands[cur].st = "stay"; K.S.click(); next(); };
    var lis = function(ev){ if(ev.type === "teams") start(); }; K.on(lis);
    start();
    return function(){ K.off(lis); };
  }});

  /* =============== 🎰 슬롯머신 =============== */
  var SLOT_R = [["jack", "🎉 셋 다 같은 수", 5], ["run", "🔢 연속하는 세 수 (순서 상관없이)", 3], ["prime", "✨ 셋 다 소수", 2], ["pair", "👯 두 개가 같은 수", 1], ["none", "😝 그 밖은 꽝", 0]];
  function slotKind(v){
    var s = v.slice().sort(function(a, b){ return a - b; }), P = function(x){ return [2, 3, 5, 7].indexOf(x) >= 0; };
    if(s[0] === s[2]) return "jack"; if(s[1] === s[0] + 1 && s[2] === s[1] + 1) return "run"; if(v.every(P)) return "prime"; if(s[0] === s[1] || s[1] === s[2]) return "pair"; return "none";
  }
  var SLOT_P = (function(){ var c = {}; for(var a = 0; a < 10; a++) for(var b = 0; b < 10; b++) for(var d = 0; d < 10; d++){ var k = slotKind([a, b, d]); c[k] = (c[k] || 0) + 1; } return c; })();
  K.game({id: "slot", icon: "🎰", cat: "luck", name: "슬롯머신", desc: "0~9 숫자 세 개가 돌아가요. 셋 다 같으면 잭팟, 연속하는 수, 셋 다 소수… 어떤 게 더 잘 나올까?", mount: function(el, ctl){
    var showP = false, busy = false;
    var w = h("div", "slot"), m = h("div", "mach"), reels = h("div", "reels"), rs = [h("div", "reel", "7"), h("div", "reel", "7"), h("div", "reel", "7")], go = h("button", "bigbtn y", "🎰 당기기"), rules = h("div", "rules");
    go.type = "button"; rs.forEach(function(r){ reels.appendChild(r); }); m.appendChild(h("div", "top", "★ LUCKY ★")); m.appendChild(reels); m.appendChild(go);
    var side = h("div", "hlside"), tr = K.turnRow(); side.appendChild(tr); side.appendChild(rules); w.appendChild(m); w.appendChild(side); el.appendChild(w);
    var pb = btn("🔢 확률 보기", "", function(){ showP = !showP; pb.classList.toggle("primary", showP); drawRules(); }); ctl.appendChild(pb);
    function drawRules(hl){ rules.innerHTML = ""; SLOT_R.forEach(function(r){ var d = h("div", r[0] === hl ? "on" : "", r[1] + (r[2] ? "  +" + r[2] : "")); if(showP) d.appendChild(h("small", "", "  " + SLOT_P[r[0]] + "/1000")); rules.appendChild(d); }); }
    go.onclick = function(){
      if(busy) return; busy = true; go.disabled = true; var v = [K.rnd(10), K.rnd(10), K.rnd(10)], t = K.teams()[K.turn()]; K.S.whoosh();
      rs.forEach(function(r, i){ r.classList.add("spin"); var iv = setInterval(function(){ r.textContent = K.rnd(10); K.S.tick(); }, 70);
        setTimeout(function(){ clearInterval(iv); r.classList.remove("spin"); r.textContent = v[i]; K.S.pop(); if(i === 2) done(); }, 700 + i * 500); });
      function done(){
        var k = slotKind(v), r = SLOT_R.filter(function(x){ return x[0] === k; })[0]; drawRules(k);
        if(r[2]){ K.add(t.i, r[2]); if(k === "jack"){ K.S.win(); K.fireworks(6); K.flash("#ffe066"); } else K.S.good(); var b = m.getBoundingClientRect(); K.confetti(b.left + b.width / 2, b.top + b.height / 3, 20 * r[2]); K.big(r[1].split(" ")[0] + " +" + r[2], t.name, t.color, 1600); }
        else { K.S.sad(); K.big("꽝 😝", v.join(" · "), "#56606b", 1200); }
        setTimeout(function(){ K.nextTurn(); busy = false; go.disabled = false; }, 900);
      }
    };
    drawRules();
    return function(){ tr.cleanup(); };
  }});

  /* =============== 🪙 동전 연속 맞히기 =============== */
  K.game({id: "coin", icon: "🪙", cat: "luck", name: "동전 연속 맞히기", desc: "앞일까 뒤일까? 맞히면 계속, 언제든 멈추고 점수로! 한 번 틀리면 0점. 몇 번 연속 맞힐 확률은? (1/2)ⁿ", mount: function(el, ctl){
    var streak = 0, hist = [], busy = false;
    var w = h("div", "gwrap"), tr = K.turnRow(), hl = h("div", "hl"), coin = h("div", "coin", "앞"), side = h("div", "hlside");
    var a = h("button", "bigbtn y", "🟡 앞"), b = h("button", "bigbtn k", "⚪ 뒤"), st = h("div", "streak"), pr = h("div", "hint"), bank = h("button", "bigbtn g", "🏦 멈추고 점수 받기"), hs = h("div", "chist"), cnt = h("div", "hint");
    a.type = b.type = bank.type = "button"; side.appendChild(a); side.appendChild(st); side.appendChild(b);
    hl.appendChild(coin); hl.appendChild(side); w.appendChild(tr); w.appendChild(hl); w.appendChild(pr); w.appendChild(bank); w.appendChild(hs); w.appendChild(cnt); el.appendChild(w);
    ctl.appendChild(btn("🧹 기록 지우기", "", function(){ hist = []; draw(); }));
    function draw(){
      st.textContent = "🔥 " + streak + "연속";
      pr.textContent = streak ? "다음에도 맞힐 확률 1/2 · 지금까지 " + streak + "번 연속 맞힐 확률 1/" + Math.pow(2, streak) + " · 멈추면 +" + streak + "점" : K.teams()[K.turn()].name + " 차례 · 앞일까 뒤일까?";
      bank.disabled = !streak;
      hs.innerHTML = ""; hist.slice(-60).forEach(function(x){ hs.appendChild(h("span", x ? "" : "b", x ? "앞" : "뒤")); });
      var f = hist.filter(Boolean).length; cnt.textContent = hist.length ? "던진 횟수 " + hist.length + " · 앞 " + f + "번 (" + Math.round(f / hist.length * 100) + "%) · 뒤 " + (hist.length - f) + "번 — 많이 던질수록 50%에 가까워질까?" : "";
    }
    function guess(front){
      if(busy) return; busy = true; a.disabled = b.disabled = bank.disabled = true; var r = K.rnd(2) === 1, t = K.teams()[K.turn()];
      coin.classList.remove("flip"); void coin.offsetWidth; coin.classList.add("flip"); K.S.whoosh();
      setTimeout(function(){
        coin.textContent = r ? "앞" : "뒤"; coin.className = "coin" + (r ? "" : " b"); hist.push(r ? 1 : 0); K.S.pop();
        if(r === front){ streak++; K.S.good(); var q = coin.getBoundingClientRect(); K.confetti(q.left + q.width / 2, q.top + q.height / 2, 30 + streak * 6); if(streak >= 3) K.big("🔥 " + streak + "연속!", "1/" + Math.pow(2, streak) + "의 확률!", "#c2410c", 1200); }
        else { K.S.sad(); K.shake(coin); K.big("아쉬워요 😢", streak ? t.name + " " + streak + "연속에서 멈춤 → 0점" : t.name, "#56606b", 1400); streak = 0; K.nextTurn(); }
        busy = false; a.disabled = b.disabled = false; draw();
      }, 950);
    }
    a.onclick = function(){ guess(true); }; b.onclick = function(){ guess(false); };
    bank.onclick = function(){ if(!streak || busy) return; var t = K.turn(); K.add(t, streak); K.S.win(); K.big("🏦 +" + streak, K.teams()[t].name, K.teams()[t].color, 1400); streak = 0; K.nextTurn(); draw(); };
    var lis = function(ev){ if(ev.type !== "score") draw(); }; K.on(lis);
    draw();
    return function(){ K.off(lis); tr.cleanup(); };
  }});
})();
