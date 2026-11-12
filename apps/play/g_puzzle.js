/* 🧠 퍼즐 — 스도쿠(계산 스도쿠) · 세 장 찾기 · 짝 맞추기 · 하노이 탑 · 마방진 · 성냥개비 식 */
(function(){
  "use strict";
  var h = K.h, btn = K.btn, ri = K.ri, pick = K.pick, sg = K.sg;
  K.css([
    ".pz{display:flex;gap:18px;width:100%;height:100%;padding:12px;align-items:center;justify-content:center}",
    ".pzside{display:flex;flex-direction:column;gap:10px;align-items:center;min-width:150px}",
    /* 스도쿠 */
    ".sd{display:grid;height:100%;aspect-ratio:1;max-width:60%;background:#2d3a48;gap:1px;border:3px solid #2d3a48;border-radius:8px;overflow:hidden}",
    ".sd .c{background:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;color:#2f6fb5;cursor:pointer;position:relative;min-width:0;min-height:0;user-select:none}",
    ".sd .c.g{color:#1d2733;font-weight:900;cursor:default;background:#f5f7fa}",
    ".sd .c.sel{background:#fff3bf!important}.sd .c.same{background:#e7f1ff}.sd .c.bad{color:#d64545;background:#fdeceb}",
    ".sd .c .cg{position:absolute;left:3px;top:1px;font-size:clamp(8px,1.3vh,12px);font-weight:800;color:#5b6773}",
    ".pad{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}",
    ".pad button{font:inherit;font-size:clamp(18px,3.4vh,28px);font-weight:900;border:1px solid var(--line);border-radius:12px;background:#fff;width:clamp(46px,7.5vh,64px);height:clamp(46px,7.5vh,64px);cursor:pointer}",
    ".pad button:active{background:#e6f0fa}",
    /* 세 장 찾기 */
    ".setb{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;flex:1;height:100%;max-width:820px;align-content:center}",
    ".setb.c5{grid-template-columns:repeat(5,1fr)}",
    ".scard{background:#fff;border:3px solid #dde3ea;border-radius:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4%;aspect-ratio:3/2;padding:6px;font:inherit;font-weight:900;font-size:clamp(15px,3vh,26px);color:#2d3a48;transition:transform .12s}",
    ".scard:hover{transform:translateY(-2px)}",
    ".scard.sel{border-color:#f2a516;background:#fff8e1;transform:translateY(-4px)}",
    ".scard.hint{border-color:#4c8bf5;box-shadow:0 0 0 4px #4c8bf555}",
    ".scard.ok{border-color:#2e9d5b;background:#e3f6e9}.scard.no{border-color:#d64545;animation:shake .5s}",
    ".scard svg{height:78%;width:auto}",
    ".scard .tb{font-size:.62em;border-collapse:collapse}.scard .tb td{border:1px solid #cfd8e3;padding:1px 6px;text-align:center}",
    ".scard .mini{height:100%;aspect-ratio:1}",
    ".score2{font-size:clamp(18px,3.2vh,26px);font-weight:900}",
    /* 짝 맞추기 */
    ".mem{display:grid;width:100%;grid-template-columns:repeat(4,1fr);gap:10px;height:100%;max-width:820px;flex:1}",
    ".mc{perspective:600px;cursor:pointer;min-height:0}",
    ".mc .in{position:relative;width:100%;height:100%;transition:transform .45s;transform-style:preserve-3d}",
    ".mc.up .in,.mc.got .in{transform:rotateY(180deg)}",
    ".mc .f,.mc .b{position:absolute;inset:0;border-radius:14px;backface-visibility:hidden;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:900;padding:4px}",
    ".mc .b{background:repeating-linear-gradient(45deg,#9775fa 0 10px,#845ef7 10px 20px);color:#fff;font-size:clamp(20px,4vh,34px)}",
    ".mc .f{background:#fff;transform:rotateY(180deg);font-size:clamp(14px,2.8vh,24px);border:3px solid #dde3ea;color:#2d3a48}",
    ".mc.got .f{border-color:var(--gc,#2e9d5b);background:#f4fbf6}",
    /* 하노이 */
    ".han{flex:1;height:100%;display:flex;gap:12px;align-items:flex-end;padding:20px 20px 10px;max-width:980px}",
    ".peg{flex:1;height:86%;position:relative;display:flex;flex-direction:column-reverse;align-items:center;cursor:pointer;border-radius:12px}",
    ".peg:hover{background:#ffffff88}",
    ".peg::before{content:'';position:absolute;bottom:0;left:50%;width:12px;height:100%;background:#a0703c;border-radius:6px 6px 0 0;transform:translateX(-50%)}",
    ".peg::after{content:'';position:absolute;bottom:-8px;left:2%;right:2%;height:12px;background:#7a522a;border-radius:6px}",
    ".disk{height:clamp(18px,4vh,34px);border-radius:10px;position:relative;z-index:1;margin-top:3px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.15);transition:transform .15s}",
    ".disk.up{transform:translateY(-40px)}",
    ".rec{font-size:13px;border-collapse:collapse}.rec td,.rec th{border:1px solid #cfd8e3;padding:3px 9px;text-align:center}",
    /* 마방진 */
    ".ms{display:grid;grid-template-columns:repeat(4,auto);gap:6px;align-items:center}",
    ".ms .c{width:clamp(64px,13vh,110px);height:clamp(64px,13vh,110px);background:#fff;border:3px solid #dde3ea;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:clamp(28px,6vh,52px);font-weight:900;cursor:pointer;color:#2f6fb5}",
    ".ms .c.g{color:#1d2733;background:#f5f7fa;cursor:default}",
    ".ms .s{font-size:clamp(14px,2.6vh,20px);font-weight:900;color:#9aa5b1;text-align:center;min-width:34px}",
    ".ms .s.ok{color:#2e9d5b}",
    ".tray{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:300px}",
    ".tray button{font:inherit;font-size:clamp(20px,3.6vh,30px);font-weight:900;width:clamp(48px,8vh,62px);height:clamp(48px,8vh,62px);border-radius:12px;border:2px solid #dde3ea;background:#fff;cursor:pointer}",
    ".tray button.sel{border-color:#f2a516;background:#fff3bf}.tray button:disabled{opacity:.2}",
    /* 성냥개비 */
    ".mt{flex:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}",
    ".mt svg{width:min(100%,900px);max-height:60%}",
    ".mt .stick{cursor:pointer}",
    ".mt .stick:hover rect{filter:brightness(1.15)}",
    ".mt .slot{cursor:pointer}"
  ].join("\n"));
  function seg(opts, val, onChange){
    var s = h("div", "seg"); opts.forEach(function(o){ var b = h("button", "", o[1]); b.type = "button"; b.setAttribute("aria-pressed", String(o[0] === val)); b.onclick = function(){ Array.prototype.forEach.call(s.children, function(x){ x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); onChange(o[0]); }; s.appendChild(b); }); return s;
  }
  function printHTML(title, body){
    var p = document.getElementById("prt"); if(!p){ p = h("div"); p.id = "prt"; document.body.appendChild(p); K.css("#prt{display:none}@media print{body>*:not(#prt){display:none!important}#prt{display:block!important;padding:10mm}#prt h2{font-size:20pt;margin-bottom:6mm}#prt .pg{page-break-after:always}}"); }
    p.innerHTML = '<h2>' + title + "</h2>" + body; window.print();
  }

  /* =============== 🔲 스도쿠 · 계산 스도쿠 =============== */
  var BOX = {4: [2, 2], 6: [2, 3], 9: [3, 3]};
  function latin(n, br, bc){
    var g = []; for(var r = 0; r < n; r++){ g.push([]); for(var c = 0; c < n; c++) g[r].push((bc * (r % br) + Math.floor(r / br) + c) % n + 1); }
    var bands = n / br, stacks = n / bc, rows = [], cols = [];
    K.shuffle(Array.from({length: bands}, function(_, i){ return i; })).forEach(function(b){ K.shuffle(Array.from({length: br}, function(_, i){ return i; })).forEach(function(i){ rows.push(b * br + i); }); });
    K.shuffle(Array.from({length: stacks}, function(_, i){ return i; })).forEach(function(s){ K.shuffle(Array.from({length: bc}, function(_, i){ return i; })).forEach(function(i){ cols.push(s * bc + i); }); });
    var map = [0].concat(K.shuffle(Array.from({length: n}, function(_, i){ return i + 1; })));
    return rows.map(function(r){ return cols.map(function(c){ return map[g[r][c]]; }); });
  }
  function countSol(grid, n, br, bc, cages, limit){
    var g = grid.map(function(r){ return r.slice(); }), cnt = 0, cell2cage = {};
    if(cages) cages.forEach(function(cg, k){ cg.cells.forEach(function(x){ cell2cage[x[0] * n + x[1]] = k; }); });
    function ok(r, c, v){
      for(var i = 0; i < n; i++){ if(g[r][i] === v || g[i][c] === v) return false; }
      if(br){ var r0 = r - r % br, c0 = c - c % bc; for(var a = 0; a < br; a++) for(var b = 0; b < bc; b++) if(g[r0 + a][c0 + b] === v) return false; }
      if(cages){ var cg = cages[cell2cage[r * n + c]]; g[r][c] = v; var vals = [], full = true; cg.cells.forEach(function(x){ var y = g[x[0]][x[1]]; if(y) vals.push(y); else full = false; }); g[r][c] = 0;
        if(full && !cageOk(cg, vals)) return false;
        if(!full && cg.op === "+" && vals.reduce(function(a, b){ return a + b; }, 0) >= cg.t) return false;
        if(!full && cg.op === "×" && cg.t % vals.reduce(function(a, b){ return a * b; }, 1)) return false; }
      return true;
    }
    function rec(){
      if(cnt >= limit) return; var best = -1, bc2 = 99, br2 = -1, cc = -1;
      for(var r = 0; r < n; r++) for(var c = 0; c < n; c++) if(!g[r][c]){ var m = 0; for(var v = 1; v <= n; v++) if(ok(r, c, v)) m++; if(m < bc2){ bc2 = m; br2 = r; cc = c; best = 1; } }
      if(best < 0){ cnt++; return; } if(!bc2) return;
      for(var v2 = 1; v2 <= n && cnt < limit; v2++) if(ok(br2, cc, v2)){ g[br2][cc] = v2; rec(); g[br2][cc] = 0; }
    }
    rec(); return cnt;
  }
  function cageOk(cg, v){
    if(cg.op === "") return v[0] === cg.t;
    if(cg.op === "+") return v.reduce(function(a, b){ return a + b; }, 0) === cg.t;
    if(cg.op === "×") return v.reduce(function(a, b){ return a * b; }, 1) === cg.t;
    if(cg.op === "−") return Math.abs(v[0] - v[1]) === cg.t;
    if(cg.op === "÷") return Math.max(v[0], v[1]) === cg.t * Math.min(v[0], v[1]);
    return false;
  }
  function makeSudoku(n, lv){
    var b = BOX[n], sol = latin(n, b[0], b[1]), puz = sol.map(function(r){ return r.slice(); });
    var cells = K.shuffle(Array.from({length: n * n}, function(_, i){ return i; })), keep = {4: [7, 6, 5], 6: [18, 15, 13], 9: [40, 34, 30]}[n][lv - 1], filled = n * n;
    for(var k = 0; k < cells.length && filled > keep; k++){
      var r = Math.floor(cells[k] / n), c = cells[k] % n, v = puz[r][c]; puz[r][c] = 0;
      if(countSol(puz, n, b[0], b[1], null, 2) !== 1) puz[r][c] = v; else filled--;
    }
    return {n: n, sol: sol, puz: puz, box: b, cages: null};
  }
  function makeKen(n){
    for(var tryN = 0; tryN < 40; tryN++){
      var sol = latin(n, 1, 1), own = {}, cages = [], order = K.shuffle(Array.from({length: n * n}, function(_, i){ return i; }));
      order.forEach(function(id){
        if(own[id] != null) return; var r = Math.floor(id / n), c = id % n, size = pick([1, 2, 2, 2, 3, 3]), cg = [[r, c]]; own[id] = cages.length;
        while(cg.length < size){
          var nb = []; cg.forEach(function(x){ [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){ var a = x[0] + d[0], b = x[1] + d[1]; if(a >= 0 && b >= 0 && a < n && b < n && own[a * n + b] == null) nb.push([a, b]); }); });
          if(!nb.length) break; var p = pick(nb); own[p[0] * n + p[1]] = cages.length; cg.push(p);
        }
        var v = cg.map(function(x){ return sol[x[0]][x[1]]; }), op, t;
        if(v.length === 1){ op = ""; t = v[0]; }
        else if(v.length === 2){ var hi = Math.max(v[0], v[1]), lo = Math.min(v[0], v[1]), ch = ["+", "−", "×"]; if(hi % lo === 0) ch.push("÷", "÷"); op = pick(ch); t = op === "+" ? hi + lo : op === "−" ? hi - lo : op === "×" ? hi * lo : hi / lo; }
        else { op = pick(["+", "×"]); t = op === "+" ? v.reduce(function(a, b){ return a + b; }, 0) : v.reduce(function(a, b){ return a * b; }, 1); }
        cages.push({cells: cg, op: op, t: t});
      });
      var empty = sol.map(function(r){ return r.map(function(){ return 0; }); });
      if(countSol(empty, n, 0, 0, cages, 2) === 1) return {n: n, sol: sol, puz: empty, box: null, cages: cages, own: own};
    }
    return null;
  }
  var SU = null;
  K.game({id: "sudoku", icon: "🔲", cat: "puzzle", name: "스도쿠", desc: "가로·세로·굵은 칸에 숫자가 한 번씩! 계산 스도쿠는 묶음마다 합·차·곱·몫 조건이 붙어요. 인쇄도 돼요.", mount: function(el, ctl){
    var st = K.pref("sd") || {n: 4, mode: "plain", lv: 1};
    var ms = seg([["plain", "스도쿠"], ["ken", "계산 스도쿠"]], st.mode, function(v){ st.mode = v; if(v === "ken" && st.n === 9) st.n = 4; save(); fresh(); });
    var ns = h("select"); [[4, "4×4"], [6, "6×6"], [9, "9×9"]].forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; ns.appendChild(x); }); ns.value = st.n; ns.onchange = function(){ st.n = +ns.value; if(st.n === 9 && st.mode === "ken"){ st.n = 6; ns.value = 6; } save(); fresh(); };
    var ls = h("select"); [[1, "쉬움"], [2, "보통"], [3, "어려움"]].forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; ls.appendChild(x); }); ls.value = st.lv; ls.onchange = function(){ st.lv = +ls.value; save(); fresh(); };
    ctl.appendChild(ms); ctl.appendChild(ns); ctl.appendChild(ls); ctl.appendChild(btn("🖨 인쇄", "", doPrint)); ctl.appendChild(btn("🔄 새 문제", "primary", fresh));
    function save(){ K.pref("sd", st); }
    var wrap = h("div", "pz"), board = h("div", "sd"), side = h("div", "pzside"), pad = h("div", "pad"), msg = h("div", "hint"); side.appendChild(pad); side.appendChild(msg); wrap.appendChild(board); wrap.appendChild(side); el.appendChild(wrap);
    var sel = -1;
    function fresh(){ msg.textContent = "만드는 중…"; setTimeout(function(){ var P = st.mode === "ken" ? makeKen(st.n) : makeSudoku(st.n, st.lv); if(!P){ P = makeSudoku(st.n, st.lv); } P.cur = P.puz.map(function(r){ return r.slice(); }); P.done = false; SU = P; sel = -1; K.S.whoosh(); draw(); }, 20); }
    function draw(){
      var P = SU, n = P.n; board.innerHTML = ""; board.style.gridTemplateColumns = "repeat(" + n + ",1fr)"; board.style.fontSize = "clamp(16px," + (n === 9 ? 3.4 : n === 6 ? 5 : 7) + "vh,60px)";
      var selV = sel >= 0 ? P.cur[Math.floor(sel / n)][sel % n] : 0;
      for(var r = 0; r < n; r++) for(var c = 0; c < n; c++){
        var id = r * n + c, v = P.cur[r][c], d = h("div", "c" + (P.puz[r][c] ? " g" : "")); d.dataset.id = id;
        if(v) d.textContent = v;
        if(id === sel) d.classList.add("sel"); else if(selV && v === selV) d.classList.add("same");
        if(v && !P.puz[r][c] && conflict(r, c)) d.classList.add("bad");
        var bw = function(cond){ return cond ? "3px solid #2d3a48" : ""; };
        if(P.box){ if(c % P.box[1] === 0 && c) d.style.borderLeft = bw(1); if(r % P.box[0] === 0 && r) d.style.borderTop = bw(1); }
        if(P.cages){
          var k = P.own[id], cg = P.cages[k];
          if(c && P.own[id - 1] !== k) d.style.borderLeft = bw(1); if(r && P.own[id - n] !== k) d.style.borderTop = bw(1);
          var first = cg.cells.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; })[0];
          if(first[0] === r && first[1] === c) d.appendChild(h("span", "cg", cg.t + cg.op));
        }
        board.appendChild(d);
      }
      pad.innerHTML = ""; for(var i = 1; i <= n; i++) (function(i){ pad.appendChild(btn(String(i), "", function(){ put(i); })); })(i); pad.appendChild(btn("⌫", "", function(){ put(0); }));
      pad.appendChild(btn("💡", "", hint));
      msg.textContent = P.done ? "🎉 완성!" : P.cages ? "굵은 선 묶음의 수를 계산하면 왼쪽 위 수가 돼요. (− ÷ 는 큰 수에서)" : "칸을 누르고 숫자를 고르세요. 키보드 숫자도 돼요.";
    }
    function conflict(r, c){ var P = SU, n = P.n, v = P.cur[r][c]; for(var i = 0; i < n; i++){ if(i !== c && P.cur[r][i] === v) return true; if(i !== r && P.cur[i][c] === v) return true; } if(P.box){ var r0 = r - r % P.box[0], c0 = c - c % P.box[1]; for(var a = 0; a < P.box[0]; a++) for(var b = 0; b < P.box[1]; b++){ var rr = r0 + a, cc = c0 + b; if((rr !== r || cc !== c) && P.cur[rr][cc] === v) return true; } } return false; }
    function put(v){
      var P = SU; if(sel < 0 || P.done) return; var r = Math.floor(sel / P.n), c = sel % P.n; if(P.puz[r][c]) return;
      P.cur[r][c] = v; K.S.click(); draw();
      if(P.cur.every(function(row, r){ return row.every(function(x, c){ return x === P.sol[r][c]; }); })){ P.done = true; K.S.win(); K.fireworks(5); K.big("🎉 완성!", P.n + "×" + P.n + (P.cages ? " 계산 스도쿠" : " 스도쿠"), "#2e9d5b", 2500); draw(); }
    }
    function hint(){ var P = SU, list = []; for(var r = 0; r < P.n; r++) for(var c = 0; c < P.n; c++) if(P.cur[r][c] !== P.sol[r][c]) list.push([r, c]); if(!list.length) return; var x = pick(list); sel = x[0] * P.n + x[1]; put(P.sol[x[0]][x[1]]); }
    board.onclick = function(e){ var d = e.target.closest(".c"); if(!d) return; sel = +d.dataset.id; draw(); };
    function key(e){ if(e.target.closest("input,textarea,select,dialog")) return; var n = parseInt(e.key, 10); if(n >= 1 && n <= SU.n){ put(n); e.preventDefault(); } else if(e.key === "Backspace" || e.key === "Delete" || e.key === "0") put(0); }
    document.addEventListener("keydown", key);
    function grid(P, ans){
      var n = P.n, s = '<table style="border-collapse:collapse;margin:0 auto 8mm">';
      for(var r = 0; r < n; r++){ s += "<tr>"; for(var c = 0; c < n; c++){
        var id = r * n + c, bt = r === 0 ? 3 : 1, bl = c === 0 ? 3 : 1;
        if(P.box){ if(r % P.box[0] === 0) bt = 3; if(c % P.box[1] === 0) bl = 3; }
        if(P.cages){ if(r && P.own[id - n] !== P.own[id]) bt = 3; if(c && P.own[id - 1] !== P.own[id]) bl = 3; }
        var v = ans ? P.sol[r][c] : P.puz[r][c] || "", lab = "";
        if(P.cages){ var cg = P.cages[P.own[id]], f = cg.cells.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; })[0]; if(f[0] === r && f[1] === c) lab = '<span style="position:absolute;left:3px;top:1px;font-size:9pt">' + cg.t + cg.op + "</span>"; }
        var sz = ans ? 8 : n === 9 ? 13 : 20;
        s += '<td style="position:relative;width:' + sz + "mm;height:" + sz + "mm;border:1px solid #333;border-top-width:" + bt + "px;border-left-width:" + bl + "px;border-right:" + (c === n - 1 ? 3 : 1) + "px solid #333;border-bottom:" + (r === n - 1 ? 3 : 1) + "px solid #333;text-align:center;font-size:" + (ans ? 9 : n === 9 ? 16 : 22) + 'pt;font-weight:bold">' + lab + v + "</td>";
      } s += "</tr>"; }
      return s + "</table>";
    }
    function doPrint(){ var P = SU; printHTML((P.cages ? "계산 스도쿠 " : "스도쿠 ") + P.n + "×" + P.n, grid(P, false) + '<p style="font-size:10pt">반 ___ 번호 ___ 이름 ______</p><div style="margin-top:20mm;font-size:9pt">정답</div>' + grid(P, true)); }
    if(SU && SU.n === st.n && (!!SU.cages) === (st.mode === "ken")) draw(); else fresh();
    return function(){ document.removeEventListener("keydown", key); };
  }});

  /* =============== 🔷 세 장 찾기 =============== */
  var SCOL = ["#e03131", "#2f9e44", "#7048e8"];
  function shapeSVG(card){
    var col = SCOL[card[1]], n = card[3] + 1, fill = card[2] === 0 ? col : card[2] === 1 ? "url(#st" + card[1] + ")" : "none", out = "";
    for(var i = 0; i < n; i++){
      var x = 50 + (i - (n - 1) / 2) * 34, p;
      if(card[0] === 0) p = '<path d="M' + x + ' 12 L' + (x + 14) + ' 40 L' + x + ' 68 L' + (x - 14) + ' 40Z"';
      else if(card[0] === 1) p = '<rect x="' + (x - 13) + '" y="12" width="26" height="56" rx="13"';
      else p = '<path d="M' + x + ' 12 L' + (x + 15) + ' 66 L' + (x - 15) + ' 66Z"';
      out += p + ' fill="' + fill + '" stroke="' + col + '" stroke-width="3"/>';
    }
    var defs = SCOL.map(function(c, i){ return '<pattern id="st' + i + '" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="2" fill="' + c + '"/></pattern>'; }).join("");
    return '<svg viewBox="0 0 100 80"><defs>' + defs + "</defs>" + out + "</svg>";
  }
  function isSet(a, b, c){ for(var i = 0; i < 4; i++){ var s = a[i] + b[i] + c[i]; if(s % 3) return false; } return true; }
  function findSet(cards){ for(var i = 0; i < cards.length; i++) for(var j = i + 1; j < cards.length; j++) for(var k = j + 1; k < cards.length; k++) if(isSet(cards[i], cards[j], cards[k])) return [i, j, k]; return null; }
  var FR = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 8], [3, 8], [1, 20], [3, 20], [1, 25], [6, 25], [3, 2], [5, 4], [2, 1]];
  function fracCards(){
    var vs = K.shuffle(FR).slice(0, 4), out = [];
    vs.forEach(function(v, k){ var dec = v[0] / v[1]; out.push({k: k, t: v[1] === 1 ? String(v[0]) : v[0] + "/" + v[1]}); out.push({k: k, t: String(+dec.toFixed(3))}); out.push({k: k, t: +(dec * 100).toFixed(1) + "%"}); });
    return K.shuffle(out);
  }
  function linCards(){
    var used = {}, out = [], k = 0;
    while(k < 4){ var a = pick([-3, -2, -1, 1, 2, 3]), b = ri(-3, 3); if(used[a + "|" + b]) continue; used[a + "|" + b] = 1;
      out.push({k: k, t: "y = " + (a === 1 ? "" : a === -1 ? "−" : sg(a)) + "x" + (b ? (b < 0 ? " − " + -b : " + " + b) : "")});
      out.push({k: k, h: '<table class="tb"><tr><td>x</td><td>0</td><td>1</td><td>2</td></tr><tr><td>y</td><td>' + sg(b) + "</td><td>" + sg(a + b) + "</td><td>" + sg(2 * a + b) + "</td></tr></table>"});
      var W = 100, s = W / 10, X = function(x){ return 50 + x * s; }, Y = function(y){ return 50 - y * s; };
      out.push({k: k, h: '<svg class="mini" viewBox="0 0 100 100"><line x1="0" y1="50" x2="100" y2="50" stroke="#8a96a3"/><line x1="50" y1="0" x2="50" y2="100" stroke="#8a96a3"/><line x1="' + X(-5) + '" y1="' + Y(-5 * a + b) + '" x2="' + X(5) + '" y2="' + Y(5 * a + b) + '" stroke="#d6336c" stroke-width="4"/><circle cx="50" cy="' + Y(b) + '" r="3.5" fill="#1d2733"/></svg>'});
      k++; }
    return K.shuffle(out);
  }
  K.game({id: "set", icon: "🔷", cat: "puzzle", name: "세 장 찾기", desc: "모양·색·개수·무늬가 각각 '모두 같거나 모두 다른' 세 장을 찾아요. 수학판: 같은 값(분수·소수·%), 같은 함수(식·표·그래프).", mount: function(el, ctl){
    var mode = K.pref("setMode") || "shape", deck, board, pick3 = [], found = 0, toTeam = K.pref("setTeam") !== false;
    ctl.appendChild(seg([["shape", "모양 카드"], ["frac", "분수·소수·%"], ["lin", "식·표·그래프"]], mode, function(v){ mode = v; K.pref("setMode", v); start(); }));
    var tl = h("label", "sm"), tc = h("input"); tc.type = "checkbox"; tc.checked = toTeam; tc.onchange = function(){ toTeam = tc.checked; K.pref("setTeam", toTeam); }; tl.appendChild(tc); tl.appendChild(document.createTextNode(" 찾으면 모둠 +1")); tl.style.cssText = "display:flex;gap:4px;align-items:center";
    ctl.appendChild(tl); ctl.appendChild(btn("💡 힌트", "", hint)); ctl.appendChild(btn("🔄 새 판", "primary", start));
    var wrap = h("div", "pz"), grid = h("div", "setb"), side = h("div", "pzside"), sc = h("div", "score2"), info = h("div", "hint"), more = h("button", "bigbtn k", "＋3장 (없어요!)"); more.type = "button";
    side.appendChild(sc); side.appendChild(info); side.appendChild(more); wrap.appendChild(grid); wrap.appendChild(side); el.appendChild(wrap);
    function start(){
      pick3 = []; found = 0;
      if(mode === "shape"){ deck = []; for(var a = 0; a < 3; a++) for(var b = 0; b < 3; b++) for(var c = 0; c < 3; c++) for(var d = 0; d < 3; d++) deck.push([a, b, c, d]); deck = K.shuffle(deck); board = deck.splice(0, 12); while(!findSet(board) && deck.length) board = board.concat(deck.splice(0, 3)); }
      else { deck = []; board = mode === "frac" ? fracCards() : linCards(); }
      more.hidden = mode !== "shape"; K.S.whoosh(); draw();
    }
    function draw(){
      grid.innerHTML = ""; grid.className = "setb" + (board.length > 12 ? " c5" : "");
      board.forEach(function(cd, i){ var b = h("button", "scard" + (pick3.indexOf(i) >= 0 ? " sel" : "")); b.type = "button"; b.dataset.i = i;
        if(mode === "shape") b.innerHTML = shapeSVG(cd); else if(cd.h) b.innerHTML = cd.h; else b.textContent = cd.t; if(cd.gone){ b.style.visibility = "hidden"; } grid.appendChild(b); });
      sc.textContent = "찾은 묶음 " + found + (mode === "shape" ? "" : " / 4");
      info.textContent = mode === "shape" ? "남은 카드 " + deck.length + "장 · 네 가지 성질이 각각 모두 같거나 모두 달라야 해요" : mode === "frac" ? "같은 값을 나타내는 분수·소수·백분율 세 장" : "같은 일차함수를 나타내는 식·표·그래프 세 장";
    }
    grid.onclick = function(e){
      var b = e.target.closest(".scard"); if(!b) return; var i = +b.dataset.i, at = pick3.indexOf(i);
      if(at >= 0) pick3.splice(at, 1); else pick3.push(i); K.S.click(); draw();
      if(pick3.length === 3){
        var A = pick3.map(function(x){ return board[x]; }), ok = mode === "shape" ? isSet(A[0], A[1], A[2]) : A[0].k === A[1].k && A[1].k === A[2].k;
        var els = pick3.map(function(x){ return grid.children[x]; });
        if(ok){
          els.forEach(function(x){ x.classList.add("ok"); }); K.S.good(); var r = els[1].getBoundingClientRect(); K.confetti(r.left + r.width / 2, r.top, 50); found++;
          var P = pick3.slice(); pick3 = [];
          if(toTeam) setTimeout(function(){ K.askTeam("🔷 찾은 모둠은?", function(t){ K.add(t, 1); }); }, 500);
          setTimeout(function(){
            if(mode === "shape"){ P.sort(function(a, b){ return b - a; }); if(board.length > 12 || !deck.length){ P.forEach(function(x){ board.splice(x, 1); }); } else { P.forEach(function(x){ board[x] = deck.pop(); }); } while(!findSet(board) && deck.length) board = board.concat(deck.splice(0, 3)); if(!findSet(board)){ K.S.win(); K.fireworks(5); K.big("🎉 끝!", "찾은 묶음 " + found + "개", "#2e9d5b", 2600); } }
            else { P.forEach(function(x){ board[x].gone = true; }); if(found >= 4){ K.S.win(); K.fireworks(5); K.big("🎉 모두 찾았어요!", null, "#2e9d5b", 2200); } }
            draw();
          }, 700);
        } else { els.forEach(function(x){ x.classList.add("no"); }); K.S.bad(); setTimeout(function(){ pick3 = []; draw(); }, 600); }
      }
    };
    function hint(){
      var s = null; if(mode === "shape") s = findSet(board); else { var live = board.map(function(c, i){ return c.gone ? null : i; }).filter(function(x){ return x != null; }); if(live.length) s = live.filter(function(i){ return board[i].k === board[live[0]].k; }); }
      if(!s){ K.big("묶음이 없어요", "＋3장을 눌러요", null, 1200); return; } var b = grid.children[s[0]]; b.classList.add("hint"); K.S.pop(); setTimeout(function(){ b.classList.remove("hint"); }, 1600);
    }
    more.onclick = function(){ if(findSet(board)){ K.S.bad(); K.big("아직 있어요! 👀", "다시 찾아봐요", "#d64545", 1200); return; } if(deck.length){ board = board.concat(deck.splice(0, 3)); K.S.whoosh(); draw(); } };
    start();
  }});

  /* =============== 🎴 짝 맞추기 =============== */
  K.game({id: "memory", icon: "🎴", cat: "puzzle", name: "짝 맞추기", desc: "카드를 두 장씩 뒤집어 문제와 답의 짝을 찾아요. 찾으면 그 모둠 +1점, 한 번 더!", mount: function(el, ctl){
    var g = +(K.pref("memG") || 1), cards = [], up = [], lock = false, got = 0;
    var gs = h("select"); [[1, "중1"], [2, "중2"], [3, "중3"]].forEach(function(o){ var x = h("option", "", o[1] + " 문제"); x.value = o[0]; gs.appendChild(x); }); gs.value = g; gs.onchange = function(){ g = +gs.value; K.pref("memG", g); start(); };
    ctl.appendChild(gs); ctl.appendChild(btn("🔄 새 판", "primary", start));
    var w = h("div", "gwrap"), tr = h("div", "turnrow"), mem = h("div", "mem"); w.appendChild(tr); w.appendChild(mem); el.appendChild(w);
    function turnRow(){ tr.innerHTML = "차례 "; K.teams().forEach(function(t){ var b = h("button", t.i === K.turn() ? "on" : "", t.name); b.type = "button"; b.style.background = t.color; b.onclick = function(){ K.setTurn(t.i); }; tr.appendChild(b); }); }
    var lis = function(ev){ if(ev.type !== "score") turnRow(); }; K.on(lis);
    function start(){
      var types = K.BG.filter(function(t){ return t.g <= g && t.g >= g - 1; }), seen = {}, pairs = [], guard = 0;
      while(pairs.length < 8 && guard++ < 999){ var r = pick(types).f(); if(seen[r[1]]) continue; seen[r[1]] = 1; pairs.push(r); }
      cards = []; pairs.forEach(function(p, k){ cards.push({k: k, t: p[0]}); cards.push({k: k, t: sg(p[1])}); }); cards = K.shuffle(cards); up = []; got = 0; lock = false;
      mem.style.gridTemplateRows = "repeat(4,1fr)"; draw(); K.S.whoosh(); turnRow();
    }
    function draw(){
      mem.innerHTML = "";
      cards.forEach(function(c, i){ var d = h("div", "mc" + (c.got ? " got" : up.indexOf(i) >= 0 ? " up" : "")); d.dataset.i = i; if(c.gc) d.style.setProperty("--gc", c.gc);
        var inn = h("div", "in"), f = h("div", "f", c.t), b = h("div", "b", "?"); inn.appendChild(b); inn.appendChild(f); d.appendChild(inn); mem.appendChild(d); });
    }
    mem.onclick = function(e){
      var d = e.target.closest(".mc"); if(!d || lock) return; var i = +d.dataset.i; if(cards[i].got || up.indexOf(i) >= 0) return;
      up.push(i); d.classList.add("up"); K.tone(700, .08, "triangle", .15);
      if(up.length === 2){
        lock = true; var a = cards[up[0]], b = cards[up[1]], t = K.teams()[K.turn()];
        setTimeout(function(){
          if(a.k === b.k){ a.got = b.got = true; a.gc = b.gc = t.color; got++; K.add(t.i, 1); K.S.good(); var r = d.getBoundingClientRect(); K.confetti(r.left + r.width / 2, r.top + r.height / 2, 40); if(got === 8){ K.S.win(); K.fireworks(5); K.big("🎉 모두 찾았어요!", null, "#2e9d5b", 2400); } }
          else { K.S.bad(); K.nextTurn(); }
          up = []; lock = false; draw();
        }, 1100);
      }
    };
    start();
    return function(){ K.off(lis); };
  }});

  /* =============== 🗼 하노이 탑 =============== */
  var HREC = {};
  K.game({id: "hanoi", icon: "🗼", cat: "puzzle", name: "하노이 탑", desc: "원판을 한 번에 하나씩, 작은 것 위에 큰 것은 못 올려요. 원판 수에 따른 최소 횟수의 규칙을 찾아봐요!", mount: function(el, ctl){
    var n = K.pref("hn") || 3, pegs, held = -1, moves = 0, done = false;
    var ns = h("select"); for(var i = 3; i <= 7; i++){ var o = h("option", "", "원판 " + i + "개"); o.value = i; ns.appendChild(o); } ns.value = n; ns.onchange = function(){ n = +ns.value; K.pref("hn", n); start(); };
    ctl.appendChild(ns); ctl.appendChild(btn("🔄 처음부터", "primary", start));
    var wrap = h("div", "pz"), han = h("div", "han"), side = h("div", "pzside"), mv = h("div", "score2"), tb = h("div"); side.appendChild(mv); side.appendChild(tb); wrap.appendChild(han); wrap.appendChild(side); el.appendChild(wrap);
    var DC = ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#4dabf7", "#748ffc", "#da77f2"];
    function start(){ pegs = [[], [], []]; for(var i = n; i >= 1; i--) pegs[0].push(i); held = -1; moves = 0; done = false; draw(); }
    function draw(){
      han.innerHTML = "";
      pegs.forEach(function(p, k){ var pg = h("div", "peg"); pg.dataset.k = k; p.forEach(function(s, j){ var d = h("div", "disk" + (held === k && j === p.length - 1 ? " up" : "")); d.style.width = (25 + s / n * 70) + "%"; d.style.background = DC[(s - 1) % 7]; pg.appendChild(d); }); han.appendChild(pg); });
      mv.textContent = "옮긴 횟수 " + moves;
      var s = '<table class="rec"><tr><th>원판</th><th>최소 횟수</th></tr>';
      for(var i = 1; i <= 7; i++) s += "<tr><td>" + i + "</td><td>" + (i <= 2 || HREC[i] ? (HREC[i] && HREC[i] > Math.pow(2, i) - 1 ? HREC[i] + " (더 줄일 수 있어요)" : Math.pow(2, i) - 1) : "?") + "</td></tr>";
      tb.innerHTML = s + '</table><p class="hint" style="margin-top:6px">최소로 풀면 "?"가 채워져요.<br>규칙이 보이나요?</p>';
    }
    han.onclick = function(e){
      var pg = e.target.closest(".peg"); if(!pg || done) return; var k = +pg.dataset.k;
      if(held < 0){ if(pegs[k].length){ held = k; K.tone(500, .08, "sine", .15, 0, 800); draw(); } return; }
      if(held === k){ held = -1; draw(); return; }
      var s = pegs[held][pegs[held].length - 1], top = pegs[k][pegs[k].length - 1];
      if(top && top < s){ K.S.bad(); K.shake(pg); return; }
      pegs[k].push(pegs[held].pop()); held = -1; moves++; K.tone(800, .08, "sine", .15, 0, 400); draw();
      if(pegs[2].length === n || pegs[1].length === n){ done = true; var min = Math.pow(2, n) - 1; HREC[n] = Math.min(HREC[n] || 1e9, moves); draw(); K.S.win(); K.fireworks(moves === min ? 6 : 3); K.big(moves === min ? "🏆 최소 횟수!" : "🎉 성공!", n + "개를 " + moves + "번에 (최소 " + min + "번)", "#2e9d5b", 2800); }
    };
    start();
  }});

  /* =============== 🪄 마방진 =============== */
  var LOSHU = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
  K.game({id: "magic", icon: "🪄", cat: "puzzle", name: "마방진", desc: "가로·세로·대각선 세 수의 합이 모두 같도록! 음수 마방진(−4~4)도 있어요.", mount: function(el, ctl){
    var off = K.pref("msOff") || 0, lv = K.pref("msLv") || 2, sol, given, cur, chosen = null;
    var os = h("select"); [[0, "1 ~ 9"], [1, "2 ~ 10"], [-5, "−4 ~ 4"], [9, "10 ~ 18"]].forEach(function(o){ var x = h("option", "", o[1]); x.value = o[0]; os.appendChild(x); }); os.value = off; os.onchange = function(){ off = +os.value; K.pref("msOff", off); start(); };
    var ls = seg([[1, "쉬움"], [2, "보통"], [3, "어려움"]], lv, function(v){ lv = v; K.pref("msLv", v); start(); });
    ctl.appendChild(os); ctl.appendChild(ls); ctl.appendChild(btn("🔄 새 문제", "primary", start));
    var wrap = h("div", "pz"), grid = h("div", "ms"), side = h("div", "pzside"), tray = h("div", "tray"), info = h("div", "hint"); side.appendChild(tray); side.appendChild(info); wrap.appendChild(grid); wrap.appendChild(side); el.appendChild(wrap);
    function start(){
      var g = LOSHU.map(function(r){ return r.slice(); }), t = ri(0, 7);
      for(var i = 0; i < t % 4; i++) g = g[0].map(function(_, c){ return g.map(function(r){ return r[c]; }).reverse(); });
      if(t >= 4) g = g.map(function(r){ return r.slice().reverse(); });
      sol = g.map(function(r){ return r.map(function(v){ return v + off; }); });
      var keep = lv === 1 ? 4 : lv === 2 ? 2 : 0, ids = K.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, keep);
      given = {}; ids.forEach(function(i){ given[i] = 1; }); cur = sol.map(function(r, a){ return r.map(function(v, b){ return given[a * 3 + b] ? v : null; }); }); chosen = null; draw();
    }
    function sums(){ var S = [], v = function(r, c){ return cur[r][c]; }, full = function(a){ return a.every(function(x){ return x != null; }) ? a.reduce(function(p, q){ return p + q; }, 0) : null; };
      for(var r = 0; r < 3; r++) S.push(full([v(r, 0), v(r, 1), v(r, 2)])); for(var c = 0; c < 3; c++) S.push(full([v(0, c), v(1, c), v(2, c)])); S.push(full([v(0, 0), v(1, 1), v(2, 2)])); S.push(full([v(0, 2), v(1, 1), v(2, 0)])); return S; }
    function draw(){
      var S = sums(), T = 15 + 3 * off; grid.innerHTML = "";
      for(var r = 0; r < 3; r++){ for(var c = 0; c < 3; c++){ var d = h("div", "c" + (given[r * 3 + c] ? " g" : ""), cur[r][c] == null ? "" : sg(cur[r][c])); d.dataset.r = r; d.dataset.c = c; grid.appendChild(d); } grid.appendChild(h("div", "s" + (S[r] === T ? " ok" : ""), S[r] == null ? "" : "=" + sg(S[r]))); }
      for(c = 0; c < 3; c++) grid.appendChild(h("div", "s" + (S[3 + c] === T ? " ok" : ""), S[3 + c] == null ? "" : sg(S[3 + c])));
      grid.appendChild(h("div", "s" + (S[6] === T ? " ok" : ""), S[6] == null ? "" : "↘" + sg(S[6])));
      tray.innerHTML = ""; var used = {}; cur.forEach(function(r){ r.forEach(function(v){ if(v != null) used[v] = 1; }); });
      for(var k = 1; k <= 9; k++){ var v = k + off, b = btn(sg(v), chosen === v ? "sel" : "", null); b.disabled = !!used[v]; (function(v){ b.onclick = function(){ chosen = v; K.S.click(); draw(); }; })(v); tray.appendChild(b); }
      info.innerHTML = "수를 고르고 칸을 누르세요. 칸을 다시 누르면 비워요.<br>" + (lv === 1 ? "한 줄의 합은 <b>" + sg(T) + "</b>" : "한 줄의 합은 얼마일까요? (모든 수의 합 ÷ 3)") + "<br>대각선 ↙ " + (S[7] == null ? "" : sg(S[7]));
      if(S.every(function(x){ return x === T; })){ K.S.win(); K.fireworks(5); K.big("🪄 완성!", "모든 줄의 합 = " + sg(T), "#2e9d5b", 2500); }
    }
    grid.onclick = function(e){ var d = e.target.closest(".c"); if(!d || d.classList.contains("g")) return; var r = +d.dataset.r, c = +d.dataset.c;
      if(cur[r][c] != null){ cur[r][c] = null; K.S.click(); draw(); return; } if(chosen == null){ K.S.bad(); return; } cur[r][c] = chosen; chosen = null; K.S.pop(); draw(); };
    start();
  }});

  /* =============== 🔥 성냥개비 식 =============== */
  var DG = {0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg"};
  var SEGS = "abcdefg", OPS = {"+": "hv", "−": "h"};
  function symOf(set, isOp){ var k = set.split("").sort().join(""); if(isOp){ for(var o in OPS) if(OPS[o].split("").sort().join("") === k) return o; return null; } for(var d in DG) if(DG[d].split("").sort().join("") === k) return +d; return null; }
  function evalEq(sy){ /* sy: [A, op, B, C1, (C2)] 기호 */ if(sy.some(function(x){ return x == null; })) return false; var C = sy.length === 5 ? sy[3] * 10 + sy[4] : sy[3]; if(sy.length === 5 && sy[3] === 0) return false; return (sy[1] === "+" ? sy[0] + sy[2] : sy[0] - sy[2]) === C; }
  function toSets(eq){ return eq.map(function(x, i){ return i === 1 ? OPS[x] : DG[x]; }); }
  function moves(sets){
    var out = [];
    sets.forEach(function(from, i){ from.split("").forEach(function(s){
      var rem = from.replace(s, ""); sets.forEach(function(to, j){
        var base = i === j ? rem : to, pool = j === 1 ? "hv" : SEGS;
        pool.split("").forEach(function(t){ if(base.indexOf(t) >= 0 || (i === j && t === s)) return; var ns = sets.slice(); ns[i] = rem; ns[j] = (i === j ? rem : to) + t; var sy = ns.map(function(x, k){ return symOf(x, k === 1); }); if(sy.every(function(x){ return x != null; })) out.push({sets: ns, sy: sy}); });
      });
    }); });
    return out;
  }
  function makeMatch(){
    for(var g = 0; g < 300; g++){
      var a = ri(0, 9), b = ri(0, 9), op = pick(["+", "−"]), c = op === "+" ? a + b : a - b; if(c < 0) continue;
      var eq = [a, op, b].concat(c >= 10 ? [Math.floor(c / 10), c % 10] : [c]);
      var bad = moves(toSets(eq)).filter(function(m){ return !evalEq(m.sy); });
      if(!bad.length) continue; var p = pick(bad);
      return {sets: p.sets, start: p.sets.slice(), sym: p.sy};
    }
    return null;
  }
  K.game({id: "match", icon: "🔥", cat: "puzzle", name: "성냥개비 식", desc: "틀린 식에서 성냥개비 딱 하나만 옮겨 맞는 식으로 만들어요. 개비를 누르고, 빈 자리를 누르세요.", mount: function(el, ctl){
    var P, held = null, solved = 0;
    ctl.appendChild(btn("↩ 되돌리기", "", function(){ P.sets = P.start.slice(); held = null; draw(); })); ctl.appendChild(btn("💡 정답 보기", "", answer)); ctl.appendChild(btn("🔄 새 문제", "primary", start));
    var w = h("div", "mt"), box = h("div"), info = h("div", "hint"), sc = h("div", "score2"); box.style.cssText = "width:100%;display:flex;justify-content:center"; w.appendChild(sc); w.appendChild(box); w.appendChild(info); el.appendChild(w);
    function start(){ P = makeMatch(); held = null; draw(); K.S.whoosh(); }
    var POS = {a: [0, 0, 1], b: [1, 0, 0], c: [1, 1, 0], d: [0, 2, 1], e: [0, 1, 0], f: [0, 0, 0], g: [0, 1, 1]};
    function stick(x, y, horiz, cls, data){
      var L = 52, T = 9, r = horiz ? '<rect x="' + (x + 6) + '" y="' + (y - T / 2) + '" width="' + (L - 12) + '" height="' + T + '" rx="3"' : '<rect x="' + (x - T / 2) + '" y="' + (y + 6) + '" width="' + T + '" height="' + (L - 12) + '" rx="3"';
      if(cls === "slot") return '<g class="slot" data-k="' + data + '">' + r + ' fill="#f1f3f5" stroke="#adb5bd" stroke-dasharray="4 3"/></g>';
      var head = horiz ? '<circle cx="' + (x + L - 8) + '" cy="' + y + '" r="6.5" fill="#e03131"/>' : '<circle cx="' + x + '" cy="' + (y + 8) + '" r="6.5" fill="#e03131"/>';
      return '<g class="stick" data-k="' + data + '">' + r + ' fill="' + (cls === "held" ? "#ffd43b" : "#e9b872") + '" stroke="#a0703c"/>' + head + "</g>";
    }
    function draw(){
      var x = 20, parts = "", n = P.sets.length;
      P.sets.forEach(function(set, i){
        if(i === 1){ var cx = x + 26, cy = 52; if(set.indexOf("h") >= 0 || held) parts += set.indexOf("h") >= 0 ? stick(cx - 26, cy, true, held && held.i === 1 && held.s === "h" ? "held" : "", "1|h") : (held ? stick(cx - 26, cy, true, "slot", "1|h") : "");
          if(set.indexOf("v") >= 0) parts += stick(cx, cy - 26, false, held && held.i === 1 && held.s === "v" ? "held" : "", "1|v"); else if(held) parts += stick(cx, cy - 26, false, "slot", "1|v");
          x += 80; return; }
        SEGS.split("").forEach(function(s){ var p = POS[s], sx = x + p[0] * 52, sy = 0 + p[1] * 52; var has = set.indexOf(s) >= 0, hh = held && held.i === i && held.s === s;
          if(has) parts += stick(sx, sy, !!p[2], hh ? "held" : "", i + "|" + s); else if(held) parts += stick(sx, sy, !!p[2], "slot", i + "|" + s); });
        x += 80;
        if(i === 2){ parts += '<rect x="' + (x + 4) + '" y="38" width="40" height="8" rx="3" fill="#868e96"/><rect x="' + (x + 4) + '" y="60" width="40" height="8" rx="3" fill="#868e96"/>'; x += 70; }
      });
      box.innerHTML = '<svg viewBox="0 -12 ' + (x + 10) + ' 132">' + parts + "</svg>";
      sc.textContent = "푼 문제 " + solved;
      info.textContent = held ? "옮길 빈 자리(점선)를 누르세요. 다시 누르면 내려놓기 취소" : "옮길 성냥개비 하나를 누르세요 · ＋를 －로, 숫자 모양을 바꾸는 것도 돼요";
    }
    box.onclick = function(e){
      var g = e.target.closest("g"); if(!g) return; var k = g.dataset.k.split("|"), i = +k[0], s = k[1];
      if(g.classList.contains("stick")){
        if(held && held.i === i && held.s === s){ held = null; K.S.click(); draw(); return; }
        if(held) return; held = {i: i, s: s}; K.tone(600, .08, "triangle", .15, 0, 900); draw(); return;
      }
      if(g.classList.contains("slot") && held){
        var ns = P.sets.slice(); ns[held.i] = ns[held.i].replace(held.s, ""); ns[i] = ns[i] + s; held = null; P.sets = ns; K.S.pop(); draw();
        var sy = ns.map(function(x, k){ return symOf(x, k === 1); });
        if(evalEq(sy)){ solved++; K.S.win(); K.fireworks(4); K.big("🔥 정답!", sy.slice(0, 3).join(" ") + " = " + sy.slice(3).join(""), "#2e9d5b", 2200); setTimeout(start, 2600); }
        else { setTimeout(function(){ K.S.bad(); K.big("아직 아니에요 🤔", "다시 해 봐요", "#d64545", 1000); P.sets = P.start.slice(); draw(); }, 500); }
      }
    };
    function answer(){ var m = moves(P.start).filter(function(x){ return evalEq(x.sy); })[0]; if(!m) return; P.sets = m.sets; held = null; draw(); K.S.fanfare(); K.big("💡 " + m.sy.slice(0, 3).join(" ") + " = " + m.sy.slice(3).join(""), "이렇게 옮겨요", "#4c8bf5", 2000); setTimeout(function(){ P.sets = P.start.slice(); draw(); }, 2600); }
    start();
  }});
})();
