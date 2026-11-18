/* 새 놀이 — 🚪 몬티 홀(운) · 🔺 수 피라미드(퍼즐) · ➕ 카쿠로 미니(퍼즐) · 🎯 혼자 가장 작은 수(함께)
   난이도 이름은 모두 기초 · 보통 · 심화 */
(function(){
  "use strict";
  var h = K.h, btn = K.btn, ri = K.ri, sg = K.sg;
  var LV = [[1, "기초"], [2, "보통"], [3, "심화"]];
  K.css([
    ".ng2{display:flex;flex-direction:column;gap:12px;width:100%;height:100%;padding:10px;align-items:center;justify-content:center}",
    ".ng2 .msg{font-size:clamp(18px,3.4vh,30px);font-weight:900;text-align:center;min-height:1.3em}",
    ".ng2 .row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}",
    /* 몬티 홀 */
    ".doors{display:flex;gap:clamp(6px,1.4vw,18px);justify-content:center;flex-wrap:wrap;width:100%}",
    ".door{font:inherit;border:0;cursor:pointer;width:clamp(70px,14vw,170px);aspect-ratio:3/5;border-radius:14px 14px 4px 4px;background:linear-gradient(180deg,#b5651d,#8a4b12);color:#fff;font-size:clamp(28px,6vh,60px);font-weight:900;box-shadow:inset 0 0 0 6px #6d3a0c;position:relative;transition:transform .2s}",
    ".door.many{width:clamp(40px,7vw,90px);font-size:clamp(16px,3vh,30px)}",
    ".door:hover{transform:translateY(-4px)}.door.pick{outline:6px solid #ffd23f;outline-offset:3px}",
    ".door.open{background:#fff8e6;color:#2d3a48;box-shadow:inset 0 0 0 4px #e9d7b6;cursor:default}",
    ".door.car{background:#e6fcf5}",
    ".mstat{font-size:15px;color:#5b6773;text-align:center;line-height:1.6}",
    /* 수 피라미드 */
    ".pyr{display:flex;flex-direction:column;gap:6px;align-items:center}",
    ".pyr .pr{display:flex;gap:6px}",
    ".pyr input,.pyr .gv{width:clamp(44px,7.5vh,72px);height:clamp(38px,6.2vh,60px);border-radius:10px;border:2px solid #cfd8e3;text-align:center;font:inherit;font-size:clamp(16px,3.2vh,28px);font-weight:900;background:#fff;box-sizing:border-box}",
    ".pyr .gv{display:flex;align-items:center;justify-content:center;background:#e7f5ff;border-color:#a5d8ff}",
    ".pyr input.ok{border-color:#2f9e44;background:#ebfbee}.pyr input.ng{border-color:#e03131;background:#fff5f5}",
    /* 카쿠로 미니 */
    ".kk{display:grid;gap:5px}",
    ".kk input,.kk .cl{width:clamp(44px,8vh,76px);height:clamp(44px,8vh,76px);border-radius:10px;text-align:center;font:inherit;font-size:clamp(18px,3.6vh,32px);font-weight:900;box-sizing:border-box}",
    ".kk input{border:2px solid #cfd8e3;background:#fff}.kk input.g{background:#e7f5ff;border-color:#a5d8ff}.kk input.bad{border-color:#e03131;background:#fff5f5}",
    ".kk .cl{display:flex;align-items:center;justify-content:center;background:#2d3a48;color:#fff;font-size:clamp(14px,2.6vh,22px)}.kk .cl.ok{background:#2f9e44}.kk .cl.x{background:transparent}",
    /* 혼자 가장 작은 수 */
    ".lp{display:grid;grid-template-columns:repeat(auto-fit,minmax(56px,1fr));gap:8px;width:min(760px,96%)}",
    ".lp button{font:inherit;font-size:clamp(20px,4vh,34px);font-weight:900;border:0;border-radius:12px;background:#fff;box-shadow:0 4px 0 #cfd8e3;cursor:pointer;padding:10px 0}",
    ".lpres{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}",
    ".lpres div{background:#fff;border-radius:12px;padding:6px 14px;font-weight:900;font-size:clamp(16px,3vh,24px);border-top:6px solid #ccc;text-align:center}",
    ".lpres div small{display:block;font-size:.6em;color:#5b6773}",
    ".lpres div.win{outline:5px solid #ffd23f}.lpres div.dup{opacity:.5;text-decoration:line-through}"
  ].join(""));

  /* =============== 🚪 몬티 홀 =============== */
  K.game({id: "monty", icon: "🚪", cat: "luck", name: "몬티 홀", desc: "문 하나 뒤에 자동차! 고른 뒤 사회자가 꽝 문을 열어 줘요. 바꿀까, 그대로 둘까? 반 전체가 투표하고, 100번 해 보며 확률을 확인해요.", mount: function(el, ctl){
    var N = +(K.pref("mhN") || 3), car, pick, open, phase, st = K.pref("mhS") || {sw: [0, 0], st: [0, 0]};
    var ns = K.seg([[3, "문 3개"], [10, "문 10개"]], N, function(v){ N = v; K.pref("mhN", v); start(); });
    ctl.appendChild(ns); ctl.appendChild(btn("🤖 100번 해 보기", "", sim)); ctl.appendChild(btn("🧹 기록 지우기", "", function(){ st = {sw: [0, 0], st: [0, 0]}; K.pref("mhS", st); draw(); })); ctl.appendChild(btn("🔄 새 판", "primary", start));
    var w = h("div", "ng2"), msg = h("div", "msg"), doors = h("div", "doors"), act = h("div", "row"), stat = h("div", "mstat");
    w.appendChild(msg); w.appendChild(doors); w.appendChild(act); w.appendChild(stat); el.appendChild(w);
    function start(){ car = K.rnd(N); pick = -1; open = []; phase = "pick"; K.S.whoosh(); draw(); }
    function rate(a){ return a[1] ? Math.round(a[0] / a[1] * 100) + "% (" + a[0] + "/" + a[1] + ")" : "—"; }
    function draw(){
      doors.innerHTML = ""; act.innerHTML = "";
      for(var i = 0; i < N; i++){
        var isOpen = open.indexOf(i) >= 0 || phase === "end", d = h("button", "door" + (N > 3 ? " many" : "") + (i === pick ? " pick" : "") + (isOpen ? " open" : "") + (isOpen && i === car ? " car" : ""), isOpen ? (i === car ? "🚗" : "🐐") : String(i + 1));
        d.type = "button"; (function(i){ d.onclick = function(){ choose(i); }; })(i); doors.appendChild(d);
      }
      msg.textContent = phase === "pick" ? "자동차는 어느 문 뒤에 있을까요? 하나를 골라요" : phase === "vote" ? "사회자가 꽝 문 " + open.length + "개를 열었어요. 바꿀까요?" : "";
      if(phase === "vote"){
        var other = -1; for(var i2 = 0; i2 < N; i2++) if(i2 !== pick && open.indexOf(i2) < 0) other = i2;
        var b1 = h("button", "bigbtn g", "🔄 " + (other + 1) + "번 문으로 바꾸기"), b2 = h("button", "bigbtn", "✋ " + (pick + 1) + "번 그대로"); b1.type = b2.type = "button";
        b1.onclick = function(){ fin(true, other); }; b2.onclick = function(){ fin(false, pick); }; act.appendChild(b1); act.appendChild(b2);
      }
      stat.innerHTML = "우리 반 기록 — 🔄 바꿔서 이긴 비율 <b>" + rate(st.sw) + "</b> · ✋ 그대로 두고 이긴 비율 <b>" + rate(st.st) + "</b>";
    }
    function choose(i){
      if(phase !== "pick") return; pick = i; K.S.click();
      var goats = []; for(var k = 0; k < N; k++) if(k !== pick && k !== car) goats.push(k);
      var keep = pick === car ? goats[K.rnd(goats.length)] : car;      // 사회자는 자동차를 피해서, 하나만 남기고 모두 엽니다
      open = []; for(k = 0; k < N; k++) if(k !== pick && k !== keep) open.push(k);
      phase = "vote"; setTimeout(function(){ K.S.pop(); draw(); }, 300); draw();
    }
    function fin(sw, final){
      phase = "end"; pick = final; var win = final === car, a = sw ? st.sw : st.st; a[1]++; if(win) a[0]++; K.pref("mhS", st); draw();
      if(win){ K.S.win(); K.fireworks(3); K.big("🚗 자동차!", sw ? "바꿔서 이겼어요" : "그대로 두고 이겼어요", "#2e9d5b", 2200); }
      else { K.S.sad(); K.big("🐐 염소…", "자동차는 " + (car + 1) + "번 문", "#56606b", 2000); }
    }
    function sim(){
      var s = [0, 0], t = [0, 0];
      for(var r = 0; r < 100; r++){ var c = K.rnd(N), p = K.rnd(N); if(p === c) t[0]++; else s[0]++; s[1]++; t[1]++; }
      K.S.drum(.8); setTimeout(function(){ K.big("🤖 100번씩 해 보니", "바꾸기 " + s[0] + "번 승 · 그대로 " + t[0] + "번 승", "#2563c9", 3500); }, 800);
    }
    start();
  }});

  /* =============== 🔺 수 피라미드 =============== */
  K.game({id: "pyramid", icon: "🔺", cat: "puzzle", name: "수 피라미드", desc: "아래 두 칸의 합이 바로 위 칸! 빈칸을 채워 피라미드를 완성해요. 기초는 4층 자연수, 보통은 5층 음수, 심화는 6층·최소 힌트.", mount: function(el, ctl){
    var lv = +(K.pref("pyLv") || 1), n, val, given;
    ctl.appendChild(K.seg(LV, lv, function(v){ lv = v; K.pref("pyLv", v); start(); })); ctl.appendChild(btn("🔄 새 문제", "primary", start));
    var w = h("div", "ng2"), msg = h("div", "msg"), py = h("div", "pyr"), hint = h("div", "mstat"); w.appendChild(msg); w.appendChild(py); w.appendChild(hint); el.appendChild(w);
    /* 칸(r, c): r = 0(맨 위) ~ n-1(맨 아래). 칸 값 = 맨 아래 수들의 이항계수 합 → 주어진 칸으로 맨 아래가 하나로 정해지는지(계수 행렬의 계수 = n) 확인 */
    function coef(r, c){ var v = []; for(var j = 0; j < n; j++) v.push(0); var k = n - 1 - r; for(var t = 0; t <= k; t++) v[c + t] = binom(k, t); return v; }
    function binom(a, b){ var x = 1; for(var i = 1; i <= b; i++) x = x * (a - b + i) / i; return x; }
    function rank(M){ M = M.map(function(r){ return r.slice(); }); var rk = 0; for(var col = 0; col < n && rk < M.length; col++){ var p = -1; for(var i = rk; i < M.length; i++) if(Math.abs(M[i][col]) > 1e-9){ p = i; break; } if(p < 0) continue; var t = M[p]; M[p] = M[rk]; M[rk] = t; for(i = 0; i < M.length; i++) if(i !== rk){ var f = M[i][col] / M[rk][col]; for(var j = 0; j < n; j++) M[i][j] -= f * M[rk][j]; } rk++; } return rk; }
    function start(){
      n = lv === 1 ? 4 : lv === 2 ? 5 : 6;
      var bot = []; for(var i = 0; i < n; i++) bot.push(lv === 1 ? ri(1, 9) : lv === 2 ? ri(-9, 9) : ri(-12, 15));
      val = []; val[n - 1] = bot; for(var r = n - 2; r >= 0; r--){ val[r] = []; for(var c = 0; c <= r; c++) val[r][c] = val[r + 1][c] + val[r + 1][c + 1]; }
      var cells = []; for(r = 0; r < n; r++) for(c = 0; c <= r; c++) cells.push([r, c]);
      var need = n + (lv === 1 ? 3 : lv === 2 ? 1 : 0);
      for(var tries = 0; tries < 400; tries++){
        var pool = K.shuffle(cells).filter(function(x){ return lv < 3 || x[0] < n - 1 || K.rnd(4) === 0; });   // 심화: 맨 아래 칸은 거의 주지 않음
        var g = pool.slice(0, need); if(g.length < need) continue;
        if(rank(g.map(function(x){ return coef(x[0], x[1]); })) === n){ given = {}; g.forEach(function(x){ given[x[0] + "-" + x[1]] = 1; }); break; }
      }
      K.S.whoosh(); draw();
    }
    function draw(){
      py.innerHTML = "";
      for(var r = 0; r < n; r++){
        var row = h("div", "pr");
        for(var c = 0; c <= r; c++){
          if(given[r + "-" + c]){ row.appendChild(h("div", "gv", sg(val[r][c]))); continue; }
          var inp = h("input"); inp.inputMode = "numeric"; inp.dataset.r = r; inp.dataset.c = c; inp.setAttribute("aria-label", (r + 1) + "층 " + (c + 1) + "번째 칸"); row.appendChild(inp);
        }
        py.appendChild(row);
      }
      msg.textContent = n + "층 피라미드 · 빈칸 " + (n * (n + 1) / 2 - Object.keys(given).length) + "개";
      hint.textContent = lv === 1 ? "아래 두 칸을 더하면 위 칸이에요. 위 칸 − 옆 칸 = 아래 칸!" : lv === 2 ? "음수도 나와요. 위에서 아래로 빼며 내려가 봐요." : "힌트가 가장 적어요. 맨 아래 수를 □로 두고 식을 세워 보세요.";
    }
    py.addEventListener("input", function(e){
      var t = e.target; if(t.tagName !== "INPUT") return; var v = t.value.replace(/[−–]/g, "-").trim();
      t.classList.remove("ok", "ng"); if(v === "" || v === "-") return;
      var ok = +v === val[+t.dataset.r][+t.dataset.c]; t.classList.add(ok ? "ok" : "ng"); if(ok) K.S.pop(); else K.S.bad();
      var all = Array.prototype.every.call(py.querySelectorAll("input"), function(x){ return x.classList.contains("ok"); });
      if(all){ K.S.win(); K.fireworks(4); K.big("🔺 완성!", "꼭대기 = " + sg(val[0][0]), "#2e9d5b", 2500); }
    });
    start();
  }});

  /* =============== ➕ 카쿠로 미니 =============== */
  K.game({id: "kakuro", icon: "➕", cat: "puzzle", name: "카쿠로 미니", desc: "줄마다 적힌 합이 되도록 1~9를 채워요. 한 줄(가로·세로)에 같은 수는 한 번만! 조건만 맞으면 어떤 답이든 정답이에요.", mount: function(el, ctl){
    var lv = +(K.pref("kkLv") || 1), n, sol, give;
    ctl.appendChild(K.seg(LV, lv, function(v){ lv = v; K.pref("kkLv", v); start(); })); ctl.appendChild(btn("👀 답 하나 보기", "", function(){ Array.prototype.forEach.call(grid.querySelectorAll("input"), function(x){ x.value = sol[+x.dataset.r][+x.dataset.c]; }); check(); })); ctl.appendChild(btn("🔄 새 문제", "primary", start));
    var w = h("div", "ng2"), msg = h("div", "msg"), grid = h("div", "kk"), hint = h("div", "mstat"); w.appendChild(msg); w.appendChild(grid); w.appendChild(hint); el.appendChild(w);
    function fill(){   // 가로·세로 줄마다 서로 다른 1~9 (되돌아가며 채우기)
      var g = []; for(var r = 0; r < n; r++){ g.push([]); for(var c = 0; c < n; c++) g[r].push(0); }
      function go(i){ if(i === n * n) return true; var r = Math.floor(i / n), c = i % n, D = K.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for(var k = 0; k < 9; k++){ var d = D[k], bad = false; for(var j = 0; j < n; j++) if(g[r][j] === d || g[j][c] === d){ bad = true; break; } if(bad) continue; g[r][c] = d; if(go(i + 1)) return true; g[r][c] = 0; } return false; }
      go(0); return g;
    }
    function start(){
      n = lv === 1 ? 3 : lv === 2 ? 4 : 5; sol = fill();
      var cells = []; for(var i = 0; i < n * n; i++) cells.push(i); give = {}; K.shuffle(cells).slice(0, lv === 1 ? 3 : lv === 2 ? 2 : 0).forEach(function(i){ give[i] = 1; });
      draw(); K.S.whoosh();
    }
    function rs(r){ return sol[r].reduce(function(a, b){ return a + b; }, 0); }
    function cs(c){ var s = 0; for(var r = 0; r < n; r++) s += sol[r][c]; return s; }
    function draw(){
      grid.innerHTML = ""; grid.style.gridTemplateColumns = "repeat(" + (n + 1) + ",auto)";
      grid.appendChild(h("div", "cl x", ""));
      for(var c = 0; c < n; c++){ var t = h("div", "cl", "↓" + cs(c)); t.dataset.col = c; grid.appendChild(t); }
      for(var r = 0; r < n; r++){
        var rl = h("div", "cl", rs(r) + "→"); rl.dataset.row = r; grid.appendChild(rl);
        for(c = 0; c < n; c++){ var inp = h("input"); inp.inputMode = "numeric"; inp.maxLength = 1; inp.dataset.r = r; inp.dataset.c = c; if(give[r * n + c]){ inp.value = sol[r][c]; inp.readOnly = true; inp.className = "g"; } grid.appendChild(inp); }
      }
      msg.textContent = n + "×" + n + " · 줄의 합을 맞춰요"; hint.textContent = lv === 1 ? "3×3 · 힌트 3개 — 작은 합부터 생각해요" : lv === 2 ? "4×4 · 힌트 2개" : "5×5 · 힌트 없음 — 같은 수가 겹치지 않게!"; check();
    }
    function vals(){ var g = []; for(var r = 0; r < n; r++){ g.push([]); for(var c = 0; c < n; c++) g[r].push(0); } Array.prototype.forEach.call(grid.querySelectorAll("input"), function(x){ var v = parseInt(x.value, 10); g[+x.dataset.r][+x.dataset.c] = v >= 1 && v <= 9 ? v : 0; }); return g; }
    function check(){
      var g = vals(), ok = true;
      Array.prototype.forEach.call(grid.querySelectorAll("input"), function(x){ var r = +x.dataset.r, c = +x.dataset.c, v = g[r][c], dup = false; if(v) for(var j = 0; j < n; j++){ if(j !== c && g[r][j] === v) dup = true; if(j !== r && g[j][c] === v) dup = true; } x.classList.toggle("bad", dup); if(dup || !v) ok = false; });
      for(var r = 0; r < n; r++){ var s = g[r].reduce(function(a, b){ return a + b; }, 0), full = g[r].every(Boolean), e = grid.querySelector('[data-row="' + r + '"]'); e.classList.toggle("ok", full && s === rs(r)); if(s !== rs(r)) ok = false; }
      for(var c = 0; c < n; c++){ var s2 = 0, f2 = true; for(r = 0; r < n; r++){ s2 += g[r][c]; if(!g[r][c]) f2 = false; } var e2 = grid.querySelector('[data-col="' + c + '"]'); e2.classList.toggle("ok", f2 && s2 === cs(c)); if(s2 !== cs(c)) ok = false; }
      return ok;
    }
    grid.addEventListener("input", function(e){ var t = e.target; t.value = t.value.replace(/[^1-9]/g, "").slice(-1); if(check()){ K.S.win(); K.fireworks(4); K.big("➕ 완성!", "모든 줄의 합이 맞아요", "#2e9d5b", 2500); } else if(t.value) K.S.click(); });
    start();
  }});

  /* =============== 🎯 혼자 가장 작은 수 =============== */
  K.game({id: "lupi", icon: "🎯", cat: "team", name: "혼자 가장 작은 수", desc: "모둠마다 몰래 수 하나를 골라요. 아무와도 겹치지 않은 수 중 가장 작은 수를 고른 모둠이 이겨요! 너무 작으면 겹치고, 너무 크면 져요.", mount: function(el, ctl){
    var picks, step, M, hist = [];
    ctl.appendChild(btn("🔄 새 판", "primary", start));
    var w = h("div", "ng2"), msg = h("div", "msg"), pad = h("div", "lp"), res = h("div", "lpres"), act = h("div", "row"), log = h("div", "mstat");
    w.appendChild(msg); w.appendChild(pad); w.appendChild(res); w.appendChild(act); w.appendChild(log); el.appendChild(w);
    function start(){ var T = K.teams(); M = Math.max(5, T.length * 2); picks = T.map(function(){ return 0; }); step = 0; K.setTurn(0); draw(); }
    function draw(){
      var T = K.teams(); pad.innerHTML = ""; res.innerHTML = ""; act.innerHTML = "";
      if(step < T.length){
        msg.innerHTML = '<span style="color:' + T[step].color + '">' + T[step].name + "</span> 차례 — 다른 모둠은 화면을 보지 않아요 🙈 (1~" + M + ")";
        for(var i = 1; i <= M; i++){ var b = h("button", "", String(i)); b.type = "button"; (function(i){ b.onclick = function(){ picks[step] = i; step++; K.S.click(); if(step < T.length) K.setTurn(step); draw(); }; })(i); pad.appendChild(b); }
        res.textContent = step ? step + "모둠 골랐어요 ✓" : "";
        return;
      }
      msg.textContent = "모두 골랐어요! 공개할까요?";
      var rb = h("button", "bigbtn g", "🎉 공개"); rb.type = "button"; rb.onclick = reveal; act.appendChild(rb);
    }
    function reveal(){
      var T = K.teams(), cnt = {}; picks.forEach(function(p){ cnt[p] = (cnt[p] || 0) + 1; });
      var uniq = picks.filter(function(p){ return cnt[p] === 1; }), best = uniq.length ? Math.min.apply(null, uniq) : null, wi = best == null ? -1 : picks.indexOf(best);
      res.innerHTML = ""; act.innerHTML = "";
      T.forEach(function(t, i){ var d = h("div", i === wi ? "win" : cnt[picks[i]] > 1 ? "dup" : ""); d.style.borderTopColor = t.color; d.innerHTML = picks[i] + "<small>" + t.name + "</small>"; res.appendChild(d); });
      hist.unshift(picks.slice().sort(function(a, b){ return a - b; }).join(" · ") + (best == null ? " → 승자 없음" : " → " + best)); hist = hist.slice(0, 5);
      log.textContent = "지난 판: " + hist.join(" / ");
      if(wi < 0){ K.S.sad(); msg.textContent = "모두 겹쳤어요! 승자 없음"; K.big("😱 모두 겹침", null, "#56606b", 1800); }
      else { K.add(wi, 3); K.S.win(); K.fireworks(3); msg.textContent = T[wi].name + " +3점 (" + best + ")"; K.big("🏆 " + T[wi].name, "혼자 가장 작은 수 " + best + " · +3", T[wi].color, 2600); }
      var nb = h("button", "bigbtn", "🔄 다음 판"); nb.type = "button"; nb.onclick = start; act.appendChild(nb);
    }
    var lis = function(ev){ if(ev.type === "teams") start(); }; K.on(lis);
    start();
    return function(){ K.off(lis); };
  }});
})();
