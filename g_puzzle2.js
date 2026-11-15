/* 🧠 퍼즐 (더하기) — 15 게임 · 님 · 지뢰찾기 · 2048 · 물통 퍼즐 · 가짜 동전 저울 · 15 퍼즐 · 불 끄기 · 점 잇기 */
(function(){
  "use strict";
  var h = K.h, btn = K.btn, ri = K.ri, pick = K.pick;
  K.css([
    ".p2{display:flex;gap:16px;width:100%;height:100%;padding:10px;align-items:center;justify-content:center}",
    ".p2 .side{display:flex;flex-direction:column;gap:10px;align-items:center;min-width:220px;max-width:38%}",
    ".p2 .msg{font-size:clamp(18px,3.4vh,28px);font-weight:900;text-align:center;min-height:1.3em}",
    ".p2 .big2{font-size:clamp(22px,4.4vh,38px);font-weight:900}",
    /* 15 게임 */
    ".nums15{display:grid;grid-template-columns:repeat(9,1fr);gap:8px;width:min(900px,96%)}",
    ".nums15 button{font:inherit;font-size:clamp(28px,7vh,60px);font-weight:900;border:0;border-radius:14px;aspect-ratio:3/4;background:#fff;box-shadow:0 4px 0 #cfd8e3;cursor:pointer;color:#2d3a48}",
    ".nums15 button:disabled{cursor:default;color:#fff}",
    ".nums15 button.win{outline:5px solid #ffd23f}",
    ".hands15{display:flex;gap:30px;justify-content:center;flex-wrap:wrap}",
    ".hands15 div{background:#fff;border-radius:14px;padding:8px 16px;font-weight:900;font-size:clamp(16px,3vh,24px);border-top:6px solid #ccc;min-width:200px;text-align:center}",
    ".lo{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:clamp(120px,24vh,190px)}",
    ".lo span{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:8px;font-weight:900;font-size:clamp(18px,3.5vh,28px);border:2px solid #e4eaf0}",
    /* 님 */
    ".heaps{display:flex;flex-direction:column;gap:clamp(8px,2vh,18px);flex:1;min-width:0;justify-content:center}",
    ".heap{display:flex;align-items:center;gap:clamp(4px,1vw,10px);background:#fff;border-radius:14px;padding:8px 14px;min-height:clamp(60px,12vh,100px)}",
    ".heap .hn{width:2.2em;font-weight:900;font-size:clamp(18px,3vh,26px);color:#8a96a3}",
    ".heap .bn{font-family:monospace;font-size:14px;color:#5b6773;margin-left:auto}",
    ".mst{width:clamp(12px,1.6vw,20px);height:clamp(50px,10vh,86px);border-radius:6px;background:linear-gradient(180deg,#e03131 0 16%,#e9b872 16%);cursor:pointer;transition:transform .15s,opacity .15s}",
    ".mst:hover{transform:translateY(-4px)}.mst.sel{opacity:.3;transform:translateY(-10px)}",
    /* 지뢰찾기 */
    ".mines{display:grid;gap:3px;height:100%;aspect-ratio:1;max-width:62%}",
    ".mines button{font:inherit;border:0;border-radius:6px;background:linear-gradient(180deg,#a5d8ff,#74c0fc);box-shadow:inset 0 -3px 0 rgba(0,0,0,.12);font-weight:900;font-size:clamp(14px,3vh,26px);padding:0;cursor:pointer;min-height:0;min-width:0}",
    ".mines button.o{background:#f8f9fa;box-shadow:none;cursor:default}.mines button.b{background:#ff8787}",
    ".mines .n1{color:#1c7ed6}.mines .n2{color:#2f9e44}.mines .n3{color:#e03131}.mines .n4{color:#5f3dc4}.mines .n5{color:#c2410c}.mines .n6{color:#0b7285}",
    /* 2048 */
    ".g2048{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(6px,1.2vh,12px);background:#bbada0;padding:clamp(6px,1.2vh,12px);border-radius:14px;height:100%;aspect-ratio:1;max-width:60%}",
    ".g2048 div{border-radius:8px;background:#cdc1b4;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:clamp(20px,5.5vh,48px);color:#776e65;min-height:0}",
    ".g2048 div.new{animation:pop2 .2s}.g2048 div.mg{animation:bump .25s}",
    "@keyframes pop2{from{transform:scale(.3)}}",
    ".arrows{display:grid;grid-template-columns:repeat(3,56px);gap:6px}",
    ".arrows button{font:inherit;font-size:24px;height:50px;border:0;border-radius:10px;background:#fff;box-shadow:0 3px 0 #cfd8e3;cursor:pointer}",
    /* 물통 */
    ".jugs{display:flex;gap:clamp(14px,4vw,50px);align-items:flex-end;height:100%;padding-bottom:6px}",
    ".jug{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer}",
    ".jug .gl{position:relative;width:clamp(70px,11vw,120px);background:rgba(255,255,255,.7);border:4px solid #74838f;border-top:0;border-radius:0 0 18px 18px;overflow:hidden}",
    ".jug.sel .gl{border-color:#f0a400;box-shadow:0 0 0 4px #ffe8a3}",
    ".jug .wt{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(180deg,#74c0fc,#1c7ed6);transition:height .45s}",
    ".jug .tk{position:absolute;left:0;width:22%;border-top:2px solid rgba(60,70,80,.35)}",
    ".jug .amt{font-size:clamp(22px,4.5vh,38px);font-weight:900}",
    ".jug .cap{font-size:13px;color:var(--sub);font-weight:800}",
    ".jug .jb{display:flex;gap:4px}.jug .jb button{font:inherit;font-size:12.5px;font-weight:800;border:1px solid var(--line);background:#fff;border-radius:8px;padding:3px 7px;cursor:pointer}",
    /* 저울 */
    ".scale{position:relative;width:min(640px,96%);height:clamp(150px,30vh,250px)}",
    ".scale .beam{position:absolute;left:5%;right:5%;top:30%;height:10px;background:#5b6773;border-radius:6px;transition:transform .7s cubic-bezier(.3,1.5,.5,1);transform-origin:50% 50%}",
    ".scale .pan{position:absolute;top:10px;width:42%;min-height:58px;background:#fff;border:3px solid #868e96;border-radius:0 0 50% 50%/0 0 30px 30px;display:flex;flex-wrap:wrap;gap:3px;justify-content:center;align-content:flex-start;padding:6px}",
    ".scale .pan.l{left:-4%}.scale .pan.r{right:-4%}",
    ".scale .post{position:absolute;left:50%;top:34%;bottom:0;width:12px;margin-left:-6px;background:#5b6773;border-radius:4px}",
    ".coins{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:min(820px,96%)}",
    ".cn{width:clamp(30px,5.4vh,46px);height:clamp(30px,5.4vh,46px);border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6c8,#ffd43b 50%,#e0a100);display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:clamp(12px,2vh,16px);color:#7a5200;cursor:pointer;border:3px solid transparent;flex:none}",
    ".cn.L{border-color:#4c8bf5}.cn.R{border-color:#f5634c}.cn.out{opacity:.3}.cn.fake{background:radial-gradient(circle at 35% 30%,#fff,#ced4da 50%,#868e96);color:#343a40}",
    ".wlog{font-size:13.5px;color:#33404d;line-height:1.6;text-align:left;max-height:16vh;overflow:auto}",
    /* 15 퍼즐 · 불 끄기 */
    ".slide{display:grid;gap:clamp(4px,1vh,8px);height:100%;aspect-ratio:1;max-width:60%;background:#2d3a48;padding:clamp(5px,1vh,10px);border-radius:16px;position:relative}",
    ".slide div{border-radius:10px;background:linear-gradient(180deg,#ffd8a8,#ffa94d);display:flex;align-items:center;justify-content:center;font-size:clamp(24px,6.5vh,56px);font-weight:900;color:#7a3e00;cursor:pointer;box-shadow:inset 0 -5px 0 rgba(0,0,0,.12);min-height:0}",
    ".slide div.ok{background:linear-gradient(180deg,#b2f2bb,#69db7c);color:#1d6b3d}",
    ".slide div.e{background:transparent;box-shadow:none;cursor:default}",
    ".lights{display:grid;gap:clamp(5px,1vh,10px);height:100%;aspect-ratio:1;max-width:60%;background:#1e2a36;padding:clamp(8px,1.4vh,14px);border-radius:16px}",
    ".lights button{border:0;border-radius:12px;background:#34495e;cursor:pointer;min-height:0;transition:background .15s,box-shadow .15s;font-size:22px;padding:0}",
    ".lights button.on{background:#ffe066;box-shadow:0 0 18px #ffd43b}",
    ".lights button.hint{outline:4px dashed #ff6b6b;outline-offset:-6px}",
    /* 점 잇기 */
    ".dots{height:100%;aspect-ratio:1;max-width:62%}",
    ".dots svg{width:100%;height:100%}",
    ".dots .ln{cursor:pointer}.dots .ln:hover .v{stroke:#adb5bd}",
    ".dcount{display:flex;flex-direction:column;gap:5px;width:100%}",
    ".dcount div{display:flex;justify-content:space-between;background:#fff;border-radius:10px;padding:5px 12px;font-weight:900;font-size:16px;border-left:8px solid #ccc}"
  ].join("\n"));
  function chk(label, val, fn){ var l = h("label", "sm"), c = h("input"); c.type = "checkbox"; c.checked = val; c.onchange = function(){ fn(c.checked); }; l.appendChild(c); l.appendChild(document.createTextNode(" " + label)); l.style.cssText = "display:flex;gap:4px;align-items:center"; return l; }
  function selOpts(list, val, fn){ var s = h("select"); list.forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; s.appendChild(x); }); s.value = val; s.onchange = function(){ fn(s.value); }; return s; }
  function win(t, sub){ K.S.win(); K.fireworks(4); K.big(t, sub, "#2e9d5b", 2400); }

  /* =============== 🎯 15 게임 =============== */
  var LO = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
  function has15(a){ for(var i = 0; i < a.length; i++) for(var j = i + 1; j < a.length; j++) for(var k = j + 1; k < a.length; k++) if(a[i] + a[j] + a[k] === 15) return [a[i], a[j], a[k]]; return null; }
  K.game({id: "pick15", icon: "🎯", cat: "puzzle", name: "15 게임", desc: "1~9 중 번갈아 하나씩 가져가요. 내 수 세 개의 합이 15가 되면 승리! 사실 이 게임의 정체는… 🪄 마방진을 열어 보세요.", mount: function(el, ctl){
    var mode = K.pref("p15m") || "cpu", lvl = +(K.pref("p15l") || 2), owner, who, over, sec = false, cpuFirst = false, P;
    ctl.appendChild(K.seg([["cpu", "🤖 반 vs 컴퓨터"], ["team", "👥 두 모둠"]], mode, function(v){ mode = v; K.pref("p15m", v); start(); }));
    var ls = selOpts([[1, "🤖 쉬움"], [2, "🤖 보통"], [3, "🤖 고수"]], lvl, function(v){ lvl = +v; K.pref("p15l", lvl); });
    var sb = btn("🪄 비밀 보기", "", function(){ sec = !sec; sb.classList.toggle("primary", sec); draw(); });
    ctl.appendChild(ls); ctl.appendChild(sb); ctl.appendChild(btn("🤖 컴퓨터 먼저", "", function(){ cpuFirst = true; start(); })); ctl.appendChild(btn("🔄 새 판", "primary", function(){ cpuFirst = false; start(); }));
    var w = h("div", "gwrap"), msg = h("div", "msg"), nums = h("div", "nums15"), hands = h("div", "hands15"), lo = h("div", "lo"); w.appendChild(msg); w.appendChild(nums); w.appendChild(hands); w.appendChild(lo); el.appendChild(w);
    function start(){
      owner = {}; over = false; var T = K.teams(), a = T[K.turn()], b = T[(K.turn() + 1) % T.length];
      P = mode === "cpu" ? [{name: "우리 반", color: "#4c8bf5"}, {name: "🤖 컴퓨터", color: "#2d3a48", cpu: true}] : [{name: a.name, color: a.color, i: a.i}, {name: b.name, color: b.color, i: b.i}];
      who = mode === "cpu" && cpuFirst ? 1 : 0; ls.hidden = mode !== "cpu"; K.S.whoosh(); draw(); if(P[who].cpu) setTimeout(cpu, 800);
    }
    function mine(p){ return Object.keys(owner).filter(function(n){ return owner[n] === p; }).map(Number); }
    function draw(){
      var line = [0, 1].map(function(p){ return has15(mine(p)); });
      nums.innerHTML = ""; for(var n = 1; n <= 9; n++){ (function(n){ var b = h("button", "", String(n)); b.type = "button"; if(owner[n] != null){ b.disabled = true; b.style.background = P[owner[n]].color; } if(line.some(function(l){ return l && l.indexOf(n) >= 0; })) b.classList.add("win"); b.disabled = b.disabled || over || !!P[who].cpu; b.onclick = function(){ take(n); }; nums.appendChild(b); })(n); }
      hands.innerHTML = ""; P.forEach(function(p, k){ var d = h("div", "", p.name + " : " + (mine(k).sort(function(x, y){ return x - y; }).join(", ") || "—")); d.style.borderTopColor = p.color; if(k === who && !over) d.style.boxShadow = "0 0 0 4px #ffd23f"; hands.appendChild(d); });
      if(!over) msg.textContent = P[who].name + " 차례 · 세 수의 합이 15!";
      lo.hidden = !sec; lo.innerHTML = ""; LO.forEach(function(r){ r.forEach(function(v){ var s = h("span", "", String(v)); if(owner[v] != null){ s.style.background = P[owner[v]].color; s.style.color = "#fff"; } lo.appendChild(s); }); });
      if(sec) msg.textContent = "🪄 가로·세로·대각선의 합이 모두 15 — 사실은 틱택토(삼목)였어요!";
    }
    function take(n){
      if(over || owner[n] != null) return; owner[n] = who; K.S.pop(); var l = has15(mine(who));
      if(l){ over = true; draw(); var p = P[who]; msg.textContent = "🎉 " + p.name + " 승리! " + l.join(" + ") + " = 15";
        if(p.cpu){ K.S.sad(); K.big("🤖 컴퓨터 승리", l.join(" + ") + " = 15", "#56606b", 2400); } else { win("🎉 " + p.name + " 승리!", l.join(" + ") + " = 15"); if(mode === "team") K.add(p.i, 3); } return; }
      if(Object.keys(owner).length === 9){ over = true; draw(); msg.textContent = "🤝 비겼어요!"; K.S.fanfare(); K.big("🤝 무승부", "아무도 15를 못 만들었어요", "#4c8bf5", 2000); return; }
      who = 1 - who; if(mode === "team") K.setTurn(P[who].i); draw(); if(P[who].cpu) setTimeout(cpu, 750);
    }
    var memo = {};
    function mm(o, p){ /* 지금 p 차례일 때 p 쪽 값: 1 이김, 0 비김, −1 짐 */
      var key = Array.from({length: 9}, function(_, i){ return o[i + 1] == null ? "." : o[i + 1]; }).join("") + p; if(memo[key] != null) return memo[key];
      var free = [], best = -2; for(var n = 1; n <= 9; n++) if(o[n] == null) free.push(n);
      if(!free.length) return (memo[key] = 0);
      for(var i = 0; i < free.length; i++){ o[free[i]] = p; var mine2 = []; for(var k = 1; k <= 9; k++) if(o[k] === p) mine2.push(k); var v = has15(mine2) ? 1 : -mm(o, 1 - p); o[free[i]] = null; if(v > best) best = v; if(best === 1) break; }
      return (memo[key] = best);
    }
    function cpu(){
      if(over) return; var o = {}, free = []; Object.keys(owner).forEach(function(k){ o[k] = owner[k]; });
      for(var n = 1; n <= 9; n++) if(o[n] == null) free.push(n);
      var scored = free.map(function(n){ o[n] = 1; var m = mine(1).concat([n]), v = has15(m) ? 1 : -mm(o, 0); o[n] = null; return {n: n, v: v}; });
      var top = Math.max.apply(null, scored.map(function(s){ return s.v; })), choice;
      var winNow = scored.filter(function(s){ var m = mine(1).concat([s.n]); return has15(m); });
      if(winNow.length) choice = winNow[0].n;
      else if(lvl === 3 || (lvl === 2 && K.rnd(3))) choice = pick(scored.filter(function(s){ return s.v === top; })).n;
      else choice = pick(free);
      take(choice);
    }
    start();
  }});

  /* =============== 🥢 님 =============== */
  K.game({id: "nim", icon: "🥢", cat: "puzzle", name: "님 게임", desc: "한 줄에서만, 원하는 만큼 성냥을 가져가요. 마지막 성냥을 가져가는 쪽이 이겨요(또는 져요). 이기는 비밀은 2진법!", mount: function(el, ctl){
    var mode = K.pref("nimM") || "cpu", misere = !!K.pref("nimX"), lvl = +(K.pref("nimL") || 2), heaps, sel = null, who, P, over, bin = false;
    ctl.appendChild(K.seg([["cpu", "🤖 반 vs 컴퓨터"], ["team", "👥 모둠끼리"]], mode, function(v){ mode = v; K.pref("nimM", v); start(); }));
    var ls = selOpts([[1, "🤖 쉬움"], [2, "🤖 보통"], [3, "🤖 고수"]], lvl, function(v){ lvl = +v; K.pref("nimL", lvl); });
    var bb = btn("💡 2진법 보기", "", function(){ bin = !bin; bb.classList.toggle("primary", bin); draw(); });
    ctl.appendChild(ls); ctl.appendChild(chk("마지막을 가져가면 짐", misere, function(v){ misere = v; K.pref("nimX", v); draw(); })); ctl.appendChild(bb); ctl.appendChild(btn("🔄 새 판", "primary", start));
    var w = h("div", "p2"), hp = h("div", "heaps"), side = h("div", "side"), msg = h("div", "msg"), take = h("button", "bigbtn g", "✋ 가져가기"), info = h("div", "hint"); take.type = "button";
    side.appendChild(msg); side.appendChild(take); side.appendChild(info); w.appendChild(hp); w.appendChild(side); el.appendChild(w);
    function start(){
      var n = ri(3, 4); heaps = K.fresh("nim", function(){ return Array.from({length: n}, function(){ return ri(1, 7); }); }, function(x){ return x.join(","); }, 20);
      P = mode === "cpu" ? [{name: "우리 반", color: "#4c8bf5"}, {name: "🤖 컴퓨터", cpu: true, color: "#2d3a48"}] : K.teams().map(function(t){ return {name: t.name, color: t.color, i: t.i}; });
      who = 0; over = false; sel = null; ls.hidden = mode !== "cpu"; if(mode === "team") K.setTurn(P[0].i); K.S.whoosh(); draw();
    }
    function xr(a){ return a.reduce(function(p, q){ return p ^ q; }, 0); }
    function draw(){
      hp.innerHTML = "";
      heaps.forEach(function(n, i){ var r = h("div", "heap"); r.appendChild(h("span", "hn", String(n)));
        for(var k = 0; k < n; k++){ (function(k){ var s = h("div", "mst" + (sel && sel.i === i && k >= n - sel.n ? " sel" : "")); s.onclick = function(){ if(over || P[who].cpu) return; sel = {i: i, n: n - k}; K.S.click(); draw(); }; r.appendChild(s); })(k); }
        if(bin) r.appendChild(h("span", "bn", ("000" + n.toString(2)).slice(-3))); hp.appendChild(r); });
      if(bin){ var x = h("div", "heap"); x.appendChild(h("span", "hn", "⊕")); x.appendChild(h("span", "", "자리마다 1의 개수가 모두 짝수면 0")); x.appendChild(h("span", "bn", ("000" + xr(heaps).toString(2)).slice(-3))); hp.appendChild(x); }
      take.disabled = !sel || over || !!P[who].cpu;
      if(!over){ msg.innerHTML = ""; var s = h("span", "", P[who].name); s.style.color = P[who].color; msg.appendChild(s); msg.appendChild(document.createTextNode(" 차례")); }
      info.textContent = (sel ? sel.n + "개를 가져가요 · " : "가져갈 성냥을 누르세요 (그 오른쪽까지 함께) · ") + (misere ? "마지막을 가져가면 져요" : "마지막을 가져가면 이겨요");
    }
    function doTake(i, n){
      heaps[i] -= n; sel = null; K.S.pop(); var left = heaps.reduce(function(a, b){ return a + b; }, 0);
      if(!left){ over = true; draw(); var winner = misere ? (who + 1) % P.length : who, loser = misere ? who : null;
        if(mode === "cpu"){ if(P[winner].cpu){ K.S.sad(); K.big("🤖 컴퓨터 승리", "2진법 비밀을 찾아봐요 💡", "#56606b", 2400); } else win("🎉 우리 반 승리!"); }
        else if(misere){ K.S.boom(); K.big("💥 " + P[loser].name, "마지막 성냥! −2", P[loser].color, 2200); K.add(P[loser].i, -2); }
        else { win("🎉 " + P[winner].name + " 승리!", "+3"); K.add(P[winner].i, 3); }
        msg.textContent = "🏁 끝!"; return; }
      who = (who + 1) % P.length; if(mode === "team") K.setTurn(P[who].i); draw(); if(P[who].cpu) setTimeout(cpu, 900);
    }
    take.onclick = function(){ if(sel && !over) doTake(sel.i, sel.n); };
    function cpu(){
      if(over) return; var best = null, x = xr(heaps), big = heaps.filter(function(n){ return n > 1; }).length;
      var smart = lvl === 3 || (lvl === 2 && K.rnd(3));
      if(smart){
        if(misere && big <= 1){ /* 끝판: 1짜리 더미 수를 홀수로 남기기 */
          var i = heaps.findIndex(function(n){ return n > 1; }), ones = heaps.filter(function(n){ return n === 1; }).length;
          if(i >= 0) best = {i: i, n: ones % 2 ? heaps[i] : heaps[i] - 1}; else { i = heaps.findIndex(function(n){ return n > 0; }); best = {i: i, n: 1}; }
        } else if(x){ for(var k = 0; k < heaps.length; k++){ var t = heaps[k] ^ x; if(t < heaps[k]){ best = {i: k, n: heaps[k] - t}; break; } } }
      }
      if(!best){ var live = heaps.map(function(n, i){ return n ? i : -1; }).filter(function(i){ return i >= 0; }), j = pick(live); best = {i: j, n: ri(1, Math.min(3, heaps[j]))}; }
      sel = best; draw(); setTimeout(function(){ doTake(best.i, best.n); }, 700);
    }
    start();
  }});

  /* =============== 🚩 지뢰찾기 =============== */
  K.game({id: "mine", icon: "🚩", cat: "puzzle", name: "지뢰찾기", desc: "숫자는 둘레 8칸에 있는 지뢰의 수! 논리로 안전한 칸을 열어요. 오른쪽 클릭이나 🚩 깃발 모드로 표시해요. 반 전체 도전!", mount: function(el, ctl){
    var lv = K.pref("mnL") || "8", N, M, mines, open, flag, first, over, flagMode = false, pen = !!K.pref("mnP");
    var SZ = {"6": [6, 5], "8": [8, 10], "10": [10, 16]};
    ctl.appendChild(selOpts([["6", "6×6 · 지뢰 5"], ["8", "8×8 · 지뢰 10"], ["10", "10×10 · 지뢰 16"]], lv, function(v){ lv = v; K.pref("mnL", v); start(); }));
    var fb = btn("🚩 깃발 모드", "", function(){ flagMode = !flagMode; fb.classList.toggle("primary", flagMode); });
    ctl.appendChild(fb); ctl.appendChild(chk("모둠 차례 · 터뜨리면 −2", pen, function(v){ pen = v; K.pref("mnP", v); tr.hidden = !v; })); ctl.appendChild(btn("🔄 새 판", "primary", start));
    var w = h("div", "p2"), grid = h("div", "mines"), side = h("div", "side"), tr = K.turnRow(), msg = h("div", "big2"), info = h("div", "hint"); tr.hidden = !pen;
    side.appendChild(tr); side.appendChild(msg); side.appendChild(info); w.appendChild(grid); w.appendChild(side); el.appendChild(w);
    function start(){ N = SZ[lv][0]; M = SZ[lv][1]; mines = {}; open = {}; flag = {}; first = true; over = false; grid.style.gridTemplateColumns = "repeat(" + N + ",1fr)"; K.S.whoosh(); draw(); }
    function nb(i){ var r = Math.floor(i / N), c = i % N, o = []; for(var a = -1; a <= 1; a++) for(var b = -1; b <= 1; b++){ if(!a && !b) continue; var x = r + a, y = c + b; if(x >= 0 && y >= 0 && x < N && y < N) o.push(x * N + y); } return o; }
    function cnt(i){ return nb(i).filter(function(j){ return mines[j]; }).length; }
    function lay(safe){ var ban = {}; ban[safe] = 1; nb(safe).forEach(function(j){ ban[j] = 1; }); var cells = K.shuffle(Array.from({length: N * N}, function(_, i){ return i; }).filter(function(i){ return !ban[i]; })); cells.slice(0, M).forEach(function(i){ mines[i] = 1; }); }
    function reveal(i){ var st = [i]; while(st.length){ var j = st.pop(); if(open[j] || flag[j]) continue; open[j] = 1; if(!cnt(j)) nb(j).forEach(function(k){ if(!open[k]) st.push(k); }); } }
    function draw(){
      grid.innerHTML = ""; var nOpen = 0;
      for(var i = 0; i < N * N; i++){ (function(i){ var b = h("button"); b.type = "button";
        if(open[i]){ b.className = "o" + (mines[i] ? " b" : ""); var c = cnt(i); b.textContent = mines[i] ? "💣" : c ? c : ""; if(c) b.classList.add("n" + c); nOpen++; }
        else if(flag[i]) b.textContent = "🚩"; else if(over && mines[i]) b.textContent = "💣";
        b.onclick = function(){ click(i, false); }; b.oncontextmenu = function(e){ e.preventDefault(); click(i, true); }; grid.appendChild(b); })(i); }
      var fl = Object.keys(flag).length; msg.textContent = over ? (over === "win" ? "🎉 성공!" : "💥 펑!") : "💣 " + (M - fl);
      info.textContent = "남은 안전한 칸 " + (N * N - M - nOpen) + " · 처음 누른 칸 둘레에는 지뢰가 없어요";
    }
    function click(i, fl){
      if(over || open[i]) return;
      if(fl || flagMode){ if(flag[i]) delete flag[i]; else flag[i] = 1; K.S.click(); draw(); return; }
      if(flag[i]) return;
      if(first){ lay(i); first = false; }
      if(mines[i]){ open[i] = 1; over = "lose"; draw(); K.S.boom(); K.flash("#ff6b6b"); K.shake(grid); K.big("💥 펑!", "다시 도전!", "#d64545", 2000); if(pen) K.add(K.turn(), -2); return; }
      reveal(i); K.tone(600 + cnt(i) * 80, .06, "triangle", .12); if(pen) K.nextTurn();
      var safe = N * N - M, n = Object.keys(open).length; if(n >= safe){ over = "win"; win("🎉 지뢰를 모두 피했어요!"); }
      draw();
    }
    start();
    return function(){ tr.cleanup(); };
  }});

  /* =============== 🔢 2048 =============== */
  K.game({id: "g2048", icon: "🔢", cat: "puzzle", name: "2048", desc: "화살표로 타일을 밀어 같은 수끼리 합쳐요. 2 → 4 → 8 → … 2048 = 2¹¹! 거듭제곱으로 보기도 돼요.", mount: function(el, ctl){
    var B, score, best = K.pref("b2048") || 0, pw = !!K.pref("p2048"), lim = +(K.pref("t2048") || 0), T = null, over, fresh = -1, merged = {};
    ctl.appendChild(chk("거듭제곱(2ⁿ)으로", pw, function(v){ pw = v; K.pref("p2048", v); draw(); }));
    ctl.appendChild(selOpts([[0, "⏱ 시간 없음"], [120, "⏱ 2분 도전"], [180, "⏱ 3분 도전"]], lim, function(v){ lim = +v; K.pref("t2048", lim); start(); }));
    ctl.appendChild(btn("🔄 새 판", "primary", start));
    var w = h("div", "p2"), g = h("div", "g2048"), side = h("div", "side"), sc = h("div", "big2"), tm = h("div", "tmr"), ar = h("div", "arrows"), info = h("div", "hint"), give = h("button", "bigbtn y", "🏆 점수 주기"); give.type = "button";
    [["", ""], ["⬆", "U"], ["", ""], ["⬅", "L"], ["⬇", "D"], ["➡", "R"]].forEach(function(a){ if(!a[0]){ ar.appendChild(h("span")); return; } var b = h("button", "", a[0]); b.type = "button"; b.onclick = function(){ move(a[1]); }; ar.appendChild(b); });
    side.appendChild(sc); side.appendChild(tm); side.appendChild(ar); side.appendChild(info); side.appendChild(give); w.appendChild(g); w.appendChild(side); el.appendChild(w);
    var COL = {2: "#eee4da", 4: "#ede0c8", 8: "#f2b179", 16: "#f59563", 32: "#f67c5f", 64: "#f65e3b", 128: "#edcf72", 256: "#edcc61", 512: "#edc850", 1024: "#edc53f", 2048: "#edc22e"};
    function add2(){ var e = []; B.forEach(function(v, i){ if(!v) e.push(i); }); if(!e.length) return; var i = pick(e); B[i] = K.rnd(10) ? 2 : 4; fresh = i; }
    function start(){ B = new Array(16).fill(0); score = 0; over = false; add2(); add2(); if(T) T.stop(); tm.innerHTML = ""; tm.classList.remove("over"); tm.hidden = !lim; if(lim) T = K.timer(tm, lim, function(){ over = true; end("⏰ 시간 끝!"); }); K.S.whoosh(); draw(); }
    function lab(v){ return pw ? "2" + String(Math.log2(v)).split("").map(function(c){ return "⁰¹²³⁴⁵⁶⁷⁸⁹"[c]; }).join("") : String(v); }
    function draw(){
      g.innerHTML = ""; B.forEach(function(v, i){ var d = h("div", (i === fresh ? "new" : "") + (merged[i] ? " mg" : ""), v ? lab(v) : ""); if(v){ d.style.background = COL[v] || "#3c3a32"; d.style.color = v > 4 ? "#fff" : "#776e65"; if(v >= 1024) d.style.fontSize = "clamp(16px,4vh,36px)"; } g.appendChild(d); });
      var mx = Math.max.apply(null, B); sc.textContent = "점수 " + score;
      info.textContent = "가장 큰 수 " + mx + " (2의 " + Math.log2(mx) + "제곱) · 최고 점수 " + best + " · 키보드 화살표도 돼요";
    }
    function line(idx){ return idx.map(function(i){ return B[i]; }); }
    function move(d){
      if(over) return; var moved = false; merged = {};
      for(var k = 0; k < 4; k++){
        var idx = [0, 1, 2, 3].map(function(j){ return d === "L" ? k * 4 + j : d === "R" ? k * 4 + 3 - j : d === "U" ? j * 4 + k : (3 - j) * 4 + k; });
        var v = line(idx).filter(Boolean), out = [];
        for(var j = 0; j < v.length; j++){ if(v[j] === v[j + 1]){ out.push(v[j] * 2); score += v[j] * 2; merged[idx[out.length - 1]] = 1; j++; } else out.push(v[j]); }
        while(out.length < 4) out.push(0);
        idx.forEach(function(i, j){ if(B[i] !== out[j]) moved = true; B[i] = out[j]; });
      }
      if(!moved) return; fresh = -1; add2(); K.tone(Object.keys(merged).length ? 700 : 400, .05, "triangle", .12);
      if(score > best){ best = score; K.pref("b2048", best); }
      draw();
      if(B.indexOf(2048) >= 0 && !over){ over = true; win("🎉 2048 = 2¹¹!", "점수 " + score); if(T) T.stop(); return; }
      if(!canMove()){ over = true; end("더 움직일 수 없어요"); }
    }
    function canMove(){ if(B.indexOf(0) >= 0) return true; for(var i = 0; i < 16; i++){ if(i % 4 < 3 && B[i] === B[i + 1]) return true; if(i < 12 && B[i] === B[i + 4]) return true; } return false; }
    function end(t){ if(T) T.stop(); K.S.fanfare(); K.big(t, "점수 " + score + " · 가장 큰 수 " + Math.max.apply(null, B), "#c2410c", 2400); }
    give.onclick = function(){ K.award("2", "🏆 이번 판을 한 모둠은? (+2)"); };
    function key(e){ var m = {ArrowLeft: "L", ArrowRight: "R", ArrowUp: "U", ArrowDown: "D"}[e.key]; if(m && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){ e.preventDefault(); move(m); } }
    var sx = null; g.addEventListener("pointerdown", function(e){ sx = [e.clientX, e.clientY]; });
    g.addEventListener("pointerup", function(e){ if(!sx) return; var dx = e.clientX - sx[0], dy = e.clientY - sx[1]; sx = null; if(Math.max(Math.abs(dx), Math.abs(dy)) < 30) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : (dy > 0 ? "D" : "U")); });
    document.addEventListener("keydown", key);
    start();
    return function(){ document.removeEventListener("keydown", key); if(T) T.stop(); };
  }});

  /* =============== 🪣 물통 퍼즐 =============== */
  function jugBFS(cap, st, goal, canFill){
    var key = function(s){ return s.join(","); }, seen = {}, q = [[st, []]]; seen[key(st)] = 1;
    while(q.length){ var cur = q.shift(), s = cur[0];
      if(goal(s)) return cur[1];
      var nx = [];
      for(var i = 0; i < s.length; i++){
        if(canFill){ var f = s.slice(); f[i] = cap[i]; nx.push([f, ["fill", i]]); var e = s.slice(); e[i] = 0; nx.push([e, ["empty", i]]); }
        for(var j = 0; j < s.length; j++){ if(i === j) continue; var p = s.slice(), m = Math.min(p[i], cap[j] - p[j]); if(!m) continue; p[i] -= m; p[j] += m; nx.push([p, ["pour", i, j]]); }
      }
      nx.forEach(function(n){ var k = key(n[0]); if(!seen[k]){ seen[k] = 1; q.push([n[0], cur[1].concat([n[1]])]); } });
    }
    return null;
  }
  function makeJug(){
    if(!K.rnd(4)) return {cap: [8, 5, 3], st: [8, 0, 0], fill: false, t: 4, txt: "8 L 물을 똑같이 4 L씩 나눠요 (수도 없음)", goal: function(s){ return s[0] === 4 && s[1] === 4; }};
    for(var g = 0; g < 100; g++){
      var a = ri(3, 7), b = ri(a + 2, 13), t = ri(1, b - 1); if(t === a || K.gcd(a, b) !== 1 && t % K.gcd(a, b)) continue;
      var goal = function(t){ return function(s){ return s.indexOf(t) >= 0; }; }(t), p = jugBFS([a, b], [0, 0], goal, true);
      if(p && p.length >= 4 && p.length <= 10) return {cap: [a, b], st: [0, 0], fill: true, t: t, txt: a + " L 통과 " + b + " L 통으로 물을 정확히 " + t + " L 만들어요", goal: goal};
    }
    return {cap: [3, 5], st: [0, 0], fill: true, t: 4, txt: "3 L 통과 5 L 통으로 물을 정확히 4 L 만들어요", goal: function(s){ return s.indexOf(4) >= 0; }};
  }
  K.game({id: "jug", icon: "🪣", cat: "puzzle", name: "물통 퍼즐", desc: "눈금 없는 물통으로 정확한 양을 만들어요. 3 L와 5 L로 4 L를? 통을 누르고 다른 통을 누르면 부어요.", mount: function(el, ctl){
    var J, s, steps, sel = null, best, done;
    ctl.appendChild(btn("💡 다음 한 수", "", hint)); ctl.appendChild(btn("↩ 처음 상태로", "", function(){ s = J.st.slice(); steps = 0; done = false; sel = null; draw(); })); ctl.appendChild(btn("🔄 새 문제", "primary", start));
    var w = h("div", "p2"), jugs = h("div", "jugs"), side = h("div", "side"), goal = h("div", "msg"), st = h("div", "big2"), info = h("div", "hint");
    side.appendChild(goal); side.appendChild(st); side.appendChild(info); w.appendChild(jugs); w.appendChild(side); el.appendChild(w);
    function start(){ J = K.fresh("jug", makeJug, function(x){ return x.cap.join("-") + ">" + x.t; }, 12); s = J.st.slice(); steps = 0; sel = null; done = false; best = jugBFS(J.cap, J.st, J.goal, J.fill).length; K.S.whoosh(); draw(); }
    function draw(){
      jugs.innerHTML = ""; var mx = Math.max.apply(null, J.cap), H = jugs.clientHeight || 300;
      J.cap.forEach(function(c, i){
        var d = h("div", "jug" + (sel === i ? " sel" : "")), amt = h("div", "amt", s[i] + " L"), gl = h("div", "gl"), wt = h("div", "wt"); gl.style.height = Math.max(60, (H - 130) * c / mx) + "px"; wt.style.height = (s[i] / c * 100) + "%";
        gl.appendChild(wt); for(var k = 1; k < c; k++){ var t = h("div", "tk"); t.style.bottom = (k / c * 100) + "%"; gl.appendChild(t); }
        d.appendChild(amt); d.appendChild(gl); d.appendChild(h("div", "cap", c + " L 통"));
        if(J.fill){ var jb = h("div", "jb"), f = h("button", "", "🚰 채우기"), e = h("button", "", "🕳 비우기"); f.type = e.type = "button"; f.onclick = function(ev){ ev.stopPropagation(); act(["fill", i]); }; e.onclick = function(ev){ ev.stopPropagation(); act(["empty", i]); }; jb.appendChild(f); jb.appendChild(e); d.appendChild(jb); }
        d.onclick = function(){ if(done) return; if(sel == null){ sel = i; K.S.click(); draw(); } else if(sel === i){ sel = null; draw(); } else { var a = sel; sel = null; act(["pour", a, i]); } };
        jugs.appendChild(d);
      });
      goal.textContent = "🎯 " + J.txt; st.textContent = "옮긴 횟수 " + steps;
      info.textContent = sel != null ? "부을 통을 누르세요" : "물을 부을 통을 먼저 누르고, 받을 통을 누르세요 · 가장 적게는 " + best + "번";
    }
    function act(a){
      if(done) return; var n = s.slice();
      if(a[0] === "fill") n[a[1]] = J.cap[a[1]]; else if(a[0] === "empty") n[a[1]] = 0; else { var m = Math.min(n[a[1]], J.cap[a[2]] - n[a[2]]); if(!m){ K.S.bad(); draw(); return; } n[a[1]] -= m; n[a[2]] += m; }
      if(n.join() === s.join()) return; s = n; steps++; K.noise(.3, .25, 0, 900); draw();
      if(J.goal(s)){ done = true; win("🎉 성공!", steps + "번 만에" + (steps <= best ? " — 최소 횟수!" : " (최소 " + best + "번)")); }
    }
    function hint(){ if(done) return; var p = jugBFS(J.cap, s, J.goal, J.fill); if(!p || !p.length) return; var a = p[0]; K.S.pop(); K.big("💡 " + (a[0] === "fill" ? J.cap[a[1]] + " L 통 채우기" : a[0] === "empty" ? J.cap[a[1]] + " L 통 비우기" : J.cap[a[1]] + " L → " + J.cap[a[2]] + " L 붓기"), "남은 최소 " + p.length + "번", "#4c8bf5", 1800); }
    var ro = new ResizeObserver(function(){ if(J) draw(); }); ro.observe(jugs);
    start();
    return function(){ ro.disconnect(); };
  }});

  /* =============== ⚖️ 가짜 동전 저울 =============== */
  K.game({id: "scale", icon: "⚖️", cat: "puzzle", name: "가짜 동전 저울", desc: "동전 중 딱 하나가 가벼운 가짜! 양팔 저울을 정해진 횟수만 써서 찾아요. 동전을 누르면 왼쪽 → 오른쪽 → 빼기.", mount: function(el, ctl){
    var lv = K.pref("scL") || "9", N, LIM, fake, pos, used, log, accuse = false, done;
    var LV = {"8": [8, 2], "9": [9, 2], "27": [27, 3]};
    ctl.appendChild(selOpts([["8", "동전 8개 · 2번"], ["9", "동전 9개 · 2번"], ["27", "동전 27개 · 3번"]], lv, function(v){ lv = v; K.pref("scL", v); start(); }));
    ctl.appendChild(btn("🔄 새 문제", "primary", start));
    var w = h("div", "gwrap"), sc = h("div", "scale"), beam = h("div", "beam"), pl = h("div", "pan l"), pr = h("div", "pan r"); sc.appendChild(h("div", "post")); sc.appendChild(beam); beam.appendChild(pl); beam.appendChild(pr);
    var coins = h("div", "coins"), row = h("div", "qrow"), wb = h("button", "bigbtn y", "⚖️ 달기"), ab = h("button", "bigbtn r", "🔍 가짜 고르기"), clr = h("button", "bigbtn k", "↩ 내리기"), msg = h("div", "msg"), lg = h("div", "wlog");
    wb.type = ab.type = clr.type = "button"; row.appendChild(clr); row.appendChild(wb); row.appendChild(ab);
    w.appendChild(msg); w.appendChild(sc); w.appendChild(coins); w.appendChild(row); w.appendChild(lg); el.appendChild(w);
    function start(){ N = LV[lv][0]; LIM = LV[lv][1]; fake = K.rnd(N) + 1; pos = {}; used = 0; log = []; accuse = false; done = false; beam.style.transform = ""; K.S.whoosh(); draw(); }
    function draw(){
      coins.innerHTML = ""; pl.innerHTML = ""; pr.innerHTML = "";
      for(var i = 1; i <= N; i++){ (function(i){ var c = h("div", "cn" + (pos[i] ? " " + pos[i] : "") + (done && i === fake ? " fake" : ""), String(i)); c.onclick = function(){ click(i); };
        if(pos[i] === "L") pl.appendChild(c); else if(pos[i] === "R") pr.appendChild(c); else coins.appendChild(c); })(i); }
      msg.textContent = done ? msg.textContent : accuse ? "🔍 가짜라고 생각하는 동전을 누르세요" : "저울 사용 " + used + " / " + LIM + "번 · 가벼운 가짜 동전 1개를 찾아요";
      wb.disabled = done || accuse; ab.classList.toggle("on", accuse); ab.textContent = accuse ? "↩ 다시 달기" : "🔍 가짜 고르기";
      lg.innerHTML = log.map(function(x, k){ return "①②③④⑤⑥⑦⑧⑨"[k] + " " + x; }).join("<br>");
    }
    function click(i){
      if(done) return;
      if(accuse){ done = true; if(i === fake){ if(used <= LIM) win("🎉 정답! " + i + "번", used + "번 달아서 찾았어요"); else { K.S.good(); K.big("정답! " + i + "번", "그런데 " + used + "번 달았어요 (목표 " + LIM + "번)", "#f0a400", 2400); } msg.textContent = "🎉 " + i + "번이 가짜!"; }
        else { K.S.sad(); K.big("아쉬워요 😢", "가짜는 " + fake + "번", "#d64545", 2200); msg.textContent = "가짜는 " + fake + "번이었어요"; } draw(); return; }
      pos[i] = !pos[i] ? "L" : pos[i] === "L" ? "R" : null; if(!pos[i]) delete pos[i]; K.S.click(); draw();
    }
    wb.onclick = function(){
      var L = [], R = []; Object.keys(pos).forEach(function(k){ (pos[k] === "L" ? L : R).push(+k); }); if(!L.length && !R.length){ K.big("저울에 동전을 올려요", null, null, 1000); return; }
      var wl = L.length * 10 - (L.indexOf(fake) >= 0 ? 1 : 0), wr = R.length * 10 - (R.indexOf(fake) >= 0 ? 1 : 0); used++;
      var r = wl === wr ? "평형 ⚖️" : wl < wr ? "왼쪽이 올라감 (왼쪽이 가벼움)" : "오른쪽이 올라감 (오른쪽이 가벼움)";
      beam.style.transform = wl === wr ? "rotate(0)" : "rotate(" + (wl < wr ? 7 : -7) + "deg)"; K.tone(300, .4, "triangle", .2, 0, wl === wr ? 300 : 500);
      log.push("[" + L.join(",") + "] vs [" + R.join(",") + "] → " + r); if(used > LIM) K.big("횟수를 넘었어요", "목표 " + LIM + "번", "#d64545", 1300);
      draw();
    };
    clr.onclick = function(){ if(done) return; pos = {}; beam.style.transform = ""; draw(); };
    ab.onclick = function(){ if(done) return; accuse = !accuse; draw(); };
    start();
  }});

  /* =============== 🧩 15 퍼즐 =============== */
  K.game({id: "slide", icon: "🧩", cat: "puzzle", name: "15 퍼즐", desc: "빈칸 옆 조각을 밀어 1, 2, 3, …의 순서로 맞춰요. 3×3(8 퍼즐)부터 도전! 키보드 화살표도 돼요.", mount: function(el, ctl){
    var n = +(K.pref("slN") || 3), B, moves, t0, iv = null, done;
    ctl.appendChild(K.seg([[3, "3×3"], [4, "4×4"]], n, function(v){ n = v; K.pref("slN", v); start(); })); ctl.appendChild(btn("🔄 섞기", "primary", start));
    var w = h("div", "p2"), g = h("div", "slide"), side = h("div", "side"), mv = h("div", "big2"), tm = h("div", "msg"), info = h("div", "hint", "빈칸과 같은 줄의 조각을 누르면 줄째로 밀려요");
    side.appendChild(mv); side.appendChild(tm); side.appendChild(info); w.appendChild(g); w.appendChild(side); el.appendChild(w);
    function start(){
      B = Array.from({length: n * n}, function(_, i){ return (i + 1) % (n * n); }); var e = n * n - 1, prev = -1;
      for(var k = 0; k < (n === 3 ? 120 : 260); k++){ var opts = [e - n, e + n, e % n ? e - 1 : -1, e % n < n - 1 ? e + 1 : -1].filter(function(x){ return x >= 0 && x < n * n && x !== prev; }), j = pick(opts); B[e] = B[j]; B[j] = 0; prev = e; e = j; }
      if(B.every(function(v, i){ return v === (i + 1) % (n * n); })) return start();
      moves = 0; done = false; t0 = Date.now(); clearInterval(iv); iv = setInterval(clock, 500); g.style.gridTemplateColumns = "repeat(" + n + ",1fr)"; K.S.whoosh(); draw();
    }
    function clock(){ if(done) return; var s = Math.floor((Date.now() - t0) / 1000); tm.textContent = "⏱ " + Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }
    function draw(){ g.innerHTML = ""; B.forEach(function(v, i){ var d = h("div", v ? (v === i + 1 ? "ok" : "") : "e", v ? String(v) : ""); d.onclick = function(){ tap(i); }; g.appendChild(d); }); mv.textContent = "움직인 횟수 " + moves; clock(); }
    function tap(i){
      if(done) return; var e = B.indexOf(0), r = Math.floor(i / n), c = i % n, er = Math.floor(e / n), ec = e % n;
      if(r !== er && c !== ec) return; var step = r === er ? (c < ec ? -1 : 1) : (r < er ? -n : n);
      while(e !== i){ B[e] = B[e + step]; B[e + step] = 0; e += step; moves++; }
      K.tone(500, .04, "square", .08); draw();
      if(B.every(function(v, k){ return v === (k + 1) % (n * n); })){ done = true; clearInterval(iv); win("🧩 완성!", moves + "번 · " + tm.textContent); }
    }
    function key(e){ var d = {ArrowLeft: 1, ArrowRight: -1, ArrowUp: n, ArrowDown: -n}[e.key]; if(d == null || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return; e.preventDefault(); var em = B.indexOf(0), j = em + d; if(j < 0 || j >= n * n || (Math.abs(d) === 1 && Math.floor(j / n) !== Math.floor(em / n))) return; tap(j); }
    document.addEventListener("keydown", key);
    start();
    return function(){ clearInterval(iv); document.removeEventListener("keydown", key); };
  }});

  /* =============== 💡 불 끄기 =============== */
  K.game({id: "lights", icon: "💡", cat: "puzzle", name: "불 끄기", desc: "칸을 누르면 그 칸과 위아래 양옆의 불이 바뀌어요. 모든 불을 꺼 보세요! 같은 칸을 두 번 누르면? (짝수·홀수)", mount: function(el, ctl){
    var n = +(K.pref("ltN") || 4), on, need, moves, par, done, hintI = -1;
    ctl.appendChild(K.seg([[3, "3×3"], [4, "4×4"], [5, "5×5"]], n, function(v){ n = v; K.pref("ltN", v); start(); }));
    ctl.appendChild(btn("💡 힌트", "", function(){ var k = need.findIndex(Boolean); if(k < 0 || done) return; hintI = k; K.S.pop(); draw(); })); ctl.appendChild(btn("↩ 처음 판", "", function(){ on = par.on.slice(); need = par.need.slice(); moves = 0; done = false; hintI = -1; draw(); })); ctl.appendChild(btn("🔄 새 판", "primary", start));
    var w = h("div", "p2"), g = h("div", "lights"), side = h("div", "side"), mv = h("div", "big2"), info = h("div", "hint");
    side.appendChild(mv); side.appendChild(info); w.appendChild(g); w.appendChild(side); el.appendChild(w);
    function flip(a, i){ var r = Math.floor(i / n), c = i % n; [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){ var x = r + d[0], y = c + d[1]; if(x >= 0 && y >= 0 && x < n && y < n) a[x * n + y] = !a[x * n + y]; }); }
    function start(){
      var k = n === 3 ? ri(3, 4) : n === 4 ? ri(4, 6) : ri(5, 8), P = K.fresh("lights" + n, function(){ return K.shuffle(Array.from({length: n * n}, function(_, i){ return i; })).slice(0, k).sort(function(a, b){ return a - b; }); }, function(x){ return x.join(","); }, 20);
      on = new Array(n * n).fill(false); need = new Array(n * n).fill(false); P.forEach(function(i){ flip(on, i); need[i] = true; });
      if(!on.some(Boolean)) return start();
      par = {on: on.slice(), need: need.slice(), k: k}; moves = 0; done = false; hintI = -1; g.style.gridTemplateColumns = "repeat(" + n + ",1fr)"; K.S.whoosh(); draw();
    }
    function draw(){ g.innerHTML = ""; on.forEach(function(v, i){ var b = h("button", (v ? "on" : "") + (i === hintI ? " hint" : "")); b.type = "button"; b.onclick = function(){ tap(i); }; g.appendChild(b); }); mv.textContent = "누른 횟수 " + moves; info.textContent = "켜진 불 " + on.filter(Boolean).length + "개 · " + par.k + "번 안에 끌 수 있어요"; }
    function tap(i){ if(done) return; flip(on, i); need[i] = !need[i]; moves++; hintI = -1; K.tone(on[i] ? 880 : 440, .05, "sine", .15); draw(); if(!on.some(Boolean)){ done = true; win("💡 모두 껐어요!", moves + "번" + (moves <= par.k ? " — 최고!" : "")); } }
    start();
  }});

  /* =============== 🔳 점 잇기 =============== */
  K.game({id: "dots", icon: "🔳", cat: "puzzle", name: "점 잇기", desc: "모둠이 차례로 점 사이에 선을 하나씩 그어요. 네 번째 변을 그어 상자를 완성하면 내 상자 + 한 번 더! 상자가 가장 많은 모둠이 승리.", mount: function(el, ctl){
    var n = +(K.pref("dtN") || 4), H, V, box, over;
    ctl.appendChild(K.seg([[3, "3×3"], [4, "4×4"], [5, "5×5"]], n, function(v){ n = v; K.pref("dtN", v); start(); })); ctl.appendChild(btn("🔄 새 판", "primary", start));
    var w = h("div", "p2"), bd = h("div", "dots"), side = h("div", "side"), tr = K.turnRow(), cntEl = h("div", "dcount"), info = h("div", "hint", "선을 눌러 그어요. 상자를 완성하면 한 번 더!");
    side.appendChild(tr); side.appendChild(cntEl); side.appendChild(info); w.appendChild(bd); w.appendChild(side); el.appendChild(w);
    function start(){ H = {}; V = {}; box = {}; over = false; K.setTurn(0); K.S.whoosh(); draw(); }
    function draw(){
      var S = 100, P = 30, W = n * S + 2 * P, o = '<svg viewBox="0 0 ' + W + " " + W + '">', T = K.teams();
      for(var r = 0; r < n; r++) for(var c = 0; c < n; c++){ var b = box[r + "," + c]; if(b != null) o += '<rect x="' + (P + c * S + 4) + '" y="' + (P + r * S + 4) + '" width="' + (S - 8) + '" height="' + (S - 8) + '" rx="8" fill="' + T[b].color + '" opacity=".75"/><text x="' + (P + c * S + S / 2) + '" y="' + (P + r * S + S / 2 + 12) + '" text-anchor="middle" font-size="34" font-weight="900" fill="#fff">' + (b + 1) + "</text>"; }
      function ln(k, x1, y1, x2, y2, own){ return '<g class="ln" data-k="' + k + '"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="transparent" stroke-width="26"/><line class="v" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (own != null ? T[own] ? T[own].color : "#2d3a48" : "#ced4da") + '" stroke-width="' + (own != null ? 9 : 5) + '"' + (own != null ? "" : ' stroke-dasharray="2 12"') + ' stroke-linecap="round"/></g>'; }
      for(r = 0; r <= n; r++) for(c = 0; c < n; c++) o += ln("h" + r + "," + c, P + c * S, P + r * S, P + (c + 1) * S, P + r * S, H[r + "," + c]);
      for(r = 0; r < n; r++) for(c = 0; c <= n; c++) o += ln("v" + r + "," + c, P + c * S, P + r * S, P + c * S, P + (r + 1) * S, V[r + "," + c]);
      for(r = 0; r <= n; r++) for(c = 0; c <= n; c++) o += '<circle cx="' + (P + c * S) + '" cy="' + (P + r * S) + '" r="8" fill="#2d3a48"/>';
      bd.innerHTML = o + "</svg>";
      cntEl.innerHTML = ""; T.forEach(function(t){ var k = Object.keys(box).filter(function(x){ return box[x] === t.i; }).length, d = h("div"); d.style.borderLeftColor = t.color; d.appendChild(h("span", "", t.name)); d.appendChild(h("span", "", "▣ " + k)); cntEl.appendChild(d); });
    }
    function full(r, c){ return H[r + "," + c] != null && H[(r + 1) + "," + c] != null && V[r + "," + c] != null && V[r + "," + (c + 1)] != null; }
    bd.onclick = function(e){
      var g = e.target.closest(".ln"); if(!g || over) return; var k = g.dataset.k, t = K.turn(), m = k.slice(1).split(",").map(Number), r = m[0], c = m[1], got = 0;
      if(k[0] === "h"){ if(H[r + "," + c] != null) return; H[r + "," + c] = t; [[r - 1, c], [r, c]].forEach(function(b){ if(b[0] >= 0 && b[0] < n && box[b] == null && full(b[0], b[1])){ box[b[0] + "," + b[1]] = t; got++; } }); }
      else { if(V[r + "," + c] != null) return; V[r + "," + c] = t; [[r, c - 1], [r, c]].forEach(function(b){ if(b[1] >= 0 && b[1] < n && box[b[0] + "," + b[1]] == null && full(b[0], b[1])){ box[b[0] + "," + b[1]] = t; got++; } }); }
      if(got){ K.S.good(); K.big("▣ +" + got, K.teams()[t].name + " 한 번 더!", K.teams()[t].color, 900); } else { K.S.click(); K.nextTurn(); }
      draw();
      if(Object.keys(box).length === n * n){
        over = true; var T = K.teams(), c2 = T.map(function(x){ return Object.keys(box).filter(function(y){ return box[y] === x.i; }).length; }), mx = Math.max.apply(null, c2), ws = T.filter(function(x, i){ return c2[i] === mx; });
        ws.forEach(function(x){ K.add(x.i, 3); }); setTimeout(function(){ win("🏆 " + ws.map(function(x){ return x.name; }).join(", "), "상자 " + mx + "개 · +3"); }, 900);
      }
    };
    start();
    return function(){ tr.cleanup(); };
  }});
})();
