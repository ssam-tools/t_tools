/* 쌤 노트 · 공통 판서 엔진 TTInk (v1.11.0, PLAN_칠판 1~6단계)
   교과서 수업 모드(apps/book)와 교실 도구 칠판(apps/class)이 같은 도구를 씁니다.
   ① 기본: ✏️ 펜 · 🖍️ 형광펜(곧은 선, 거의 수평이면 딱 수평) · 🧽 지우개(닿은 획만) · ↶ 되돌리기 · ↷ 다시 하기 · 🗑 이 쪽 지우기
   ② 칠판: 🔴 레이저(2초 뒤 사라짐) · 🙈 가림막(끌어 내려 하나씩 보이기) · 🔤 글상자(수학 기호 단추)
   ③ 작도: 📏 선분·직선·반직선 · ⭕ 원 · ◠ 호 · 🔺 다각형 · ⬠ 정다각형 · ∟ 직각 · ｜‖ 같은 길이 · ≫ 평행 · 🧲 점·격자에 붙이기
   ④ 📐 각도기 · 삼각자(30°·60° / 45°) 옮기기·돌리기 · ∠ 각 재기(세 점)
   ⑤ 📈 그래프(y=2x+1, y=x²-2x-3, y=6/x — 절편·꼭짓점 표시) · 📍 점 찍기(좌표) · ➖ 수직선 구간(-1≤x<3)
      그래프·구간은 좌표평면·수직선 바탕(칠판)에서 씁니다. 교과서 위에서는 점이 A, B, C… 로 붙습니다.
   ⑥ 저장은 쓰는 쪽(host)이 합니다: setPage(배열) 로 넘긴 배열을 그대로 고치고 onChange 를 부릅니다.
   좌표는 0~1 비율로 저장해서 확대·창 크기가 바뀌어도 같은 자리. 굵기는 화면 너비의 1/1000(u) 단위. */
(function(){
  "use strict";
  var HL = ["rgba(255,214,0,.42)", "rgba(110,230,120,.42)", "rgba(255,120,190,.38)", "rgba(110,190,255,.40)"];
  var LIGHT = ["#d62828", "#1f6fd1", "#1d2733", "#16884a"], DARK = ["#ffffff", "#ffe066", "#ff8a8a", "#7fd3ff", "#9cf29c"];
  var SYM = ["√", "π", "²", "³", "≤", "≥", "≠", "±", "×", "÷", "°", "∠", "△", "⊥", "∥", "≡", "∽", "½"];
  var MATH = [["seg", "📏", "선분"], ["line", "↔", "직선"], ["ray", "→", "반직선"], ["circle", "⭕", "원"], ["arc", "◠", "호"], ["poly", "🔺", "다각형"], ["ngon", "⬠", "정다각형"],
    ["right", "∟", "직각 표시"], ["tick1", "｜", "같은 길이"], ["tick2", "‖", "같은 길이(2)"], ["par", "≫", "평행 표시"], ["ang", "∠", "각 재기 (세 점)"],
    ["pt", "📍", "점 찍기"], ["graph", "📈", "그래프"], ["range", "➖", "수직선 구간"]];
  var CSS = ""
    + ".tik{display:flex;align-items:center;gap:4px;flex-wrap:wrap;position:relative;font-family:inherit}"
    + ".tik button,.tik select{font:inherit;font-size:15px;font-weight:800;min-width:38px;height:40px;border:1.5px solid #c9d1da;background:#fff;color:#1d2733;border-radius:10px;padding:0 8px;cursor:pointer;white-space:nowrap}"
    + ".tik button.on{background:#1d2733;border-color:#1d2733;color:#fff}.tik button:disabled{opacity:.35}"
    + ".tik .sw{min-width:28px;width:28px;height:28px;padding:0;border-radius:50%;border:2px solid #c9d1da}.tik .sw.on{outline:3px solid #2f6fb5;outline-offset:2px;background:inherit}"
    + ".tik .sep{width:1px;height:28px;background:#d5dbe2;margin:0 2px}.tik .grow{flex:1}"
    + ".tik .mbtn.on{background:#2f6fb5;border-color:#2f6fb5}"
    + ".tik-m{position:absolute;left:0;bottom:calc(100% + 6px);z-index:40;display:none;flex-wrap:wrap;gap:4px;background:#fff;border:1.5px solid #c9d1da;border-radius:14px;padding:8px;box-shadow:0 10px 30px rgba(0,0,0,.18);max-width:min(760px,96vw)}"
    + ".tik-m.on{display:flex}.tik-m.down{bottom:auto;top:calc(100% + 6px)}.tik-m button{font-size:14px}.tik-m button b{font-size:17px;margin-right:3px}"
    + ".tik-m .opt{display:flex;align-items:center;gap:4px;width:100%;font-size:13px;color:#5b6773;border-top:1px dashed #d5dbe2;padding-top:6px;margin-top:2px}"
    + ".tik-m .opt input{height:34px;font:inherit;font-size:15px;border:1.5px solid #c9d1da;border-radius:8px;padding:0 8px;min-width:0}"
    + "canvas.tinkc{position:absolute;left:0;top:0;pointer-events:none;touch-action:none}canvas.tinkc.on{pointer-events:auto;cursor:crosshair}"
    + ".tinkov{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3}"
    + ".tinkov .curt{position:absolute;left:0;right:0;bottom:0;background:repeating-linear-gradient(135deg,#dfe4ea 0 14px,#e8ecf1 14px 28px);pointer-events:auto;box-shadow:0 -4px 14px rgba(0,0,0,.18)}"
    + ".tinkov .curt .hd{position:absolute;left:50%;top:-22px;transform:translateX(-50%);background:#1d2733;color:#fff;border-radius:12px 12px 0 0;padding:4px 18px;font-weight:800;font-size:14px;cursor:ns-resize;touch-action:none;user-select:none;white-space:nowrap}"
    + ".tinkov .curt .x{position:absolute;right:8px;top:8px;border:0;background:#fff;border-radius:8px;font:inherit;font-weight:800;padding:4px 10px;cursor:pointer}"
    + ".tinkov .tool{position:absolute;pointer-events:auto;touch-action:none;cursor:move;user-select:none}"
    + ".tinkov .tool .h{position:absolute;width:30px;height:30px;border-radius:50%;background:#2f6fb5;color:#fff;font-size:17px;display:flex;align-items:center;justify-content:center;cursor:grab;box-shadow:0 2px 6px rgba(0,0,0,.3)}"
    + ".tinkov .tool .h.x{background:#c2432a;cursor:pointer}"
    + ".tinkov .txt{position:absolute;pointer-events:auto;display:flex;flex-direction:column;gap:4px;background:#fff;border:2px solid #2f6fb5;border-radius:12px;padding:6px;box-shadow:0 8px 24px rgba(0,0,0,.2);z-index:5}"
    + ".tinkov .txt input{font:inherit;font-size:20px;border:1.5px solid #c9d1da;border-radius:8px;padding:4px 8px;min-width:220px}"
    + ".tinkov .txt .sy{display:flex;flex-wrap:wrap;gap:3px;max-width:330px}.tinkov .txt .sy button{font:inherit;font-size:16px;min-width:32px;height:32px;border:1px solid #c9d1da;background:#f6f8fa;border-radius:8px;cursor:pointer}"
    + ".tinkov .txt .r{display:flex;gap:4px;justify-content:flex-end}.tinkov .txt .r button{font:inherit;font-weight:800;border:1.5px solid #c9d1da;background:#fff;border-radius:8px;padding:4px 12px;cursor:pointer}.tinkov .txt .r .ok{background:#2f6fb5;border-color:#2f6fb5;color:#fff}";
  var cssDone = false;
  function addCss(){ if(cssDone) return; cssDone = true; var s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s); }
  function toast(m){ if(window.TT && TT.ui && TT.ui.toast) TT.ui.toast(m); }
  function r4(v){ return Math.round(v * 10000) / 10000; }
  function fmt(v){ var s = (Math.round(v * 100) / 100).toString(); return s === "-0" ? "0" : s; }
  function el(tag, cls, html){ var e = document.createElement(tag); if(cls) e.className = cls; if(html != null) e.innerHTML = html; return e; }

  /* ── 식 읽기: y = 2x^2 - 3x + 1, 6/x, √(x), |x| … → 함수 ── */
  function parseExpr(src){
    var s = String(src).replace(/\s+/g, "").replace(/^(y|f\(x\))=/i, "").replace(/²/g, "^2").replace(/³/g, "^3").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").replace(/√/g, "sqrt");
    s = s.replace(/\|([^|]+)\|/g, "abs($1)");
    var i = 0;
    function peek(){ return s[i]; }
    function num(){ var m = /^\d*\.?\d+/.exec(s.slice(i)); if(!m) return null; i += m[0].length; var v = +m[0]; return function(){ return v; }; }
    function startsPrim(){ var c = peek(); return c != null && (/[\d.x(a-z]/i.test(c)); }
    function prim(){
      var c = peek();
      if(c === "("){ i++; var e = expr(); if(peek() !== ")") throw 0; i++; return e; }
      if(/[\d.]/.test(c)) return num();
      if(c === "x"){ i++; return function(x){ return x; }; }
      var m = /^(sqrt|abs|pi)/.exec(s.slice(i));
      if(m){ i += m[0].length; if(m[1] === "pi") return function(){ return Math.PI; }; var a = peek() === "(" ? prim() : power(), f = Math[m[1]]; return function(x){ return f(a(x)); }; }
      throw 0;
    }
    function power(){ var b = prim(); if(peek() === "^"){ i++; var e = factor(); return function(x){ return Math.pow(b(x), e(x)); }; } return b; }
    function factor(){ if(peek() === "-"){ i++; var f = factor(); return function(x){ return -f(x); }; } if(peek() === "+"){ i++; return factor(); } return power(); }
    function term(){
      var a = factor();
      for(;;){
        var c = peek();
        if(c === "*" || c === "/"){ i++; var b = factor(); a = (function(a, b, c){ return c === "*" ? function(x){ return a(x) * b(x); } : function(x){ return a(x) / b(x); }; })(a, b, c); }
        else if(startsPrim()){ var b2 = power(); a = (function(a, b){ return function(x){ return a(x) * b(x); }; })(a, b2); }
        else return a;
      }
    }
    function expr(){ var a = term(); for(;;){ var c = peek(); if(c === "+" || c === "-"){ i++; var b = term(); a = (function(a, b, c){ return c === "+" ? function(x){ return a(x) + b(x); } : function(x){ return a(x) - b(x); }; })(a, b, c); } else return a; } }
    try{ var f = expr(); if(i !== s.length) return null; f(1.234); return f; }catch(e){ return null; }
  }
  /* 부등식: x>2, -1<=x<3, x≤-2, x=3 → {lo, li, hi, hi2} */
  function parseRange(src){
    var s = String(src).replace(/\s+/g, "").replace(/≤|=</g, "<=").replace(/≥|=>/g, ">=").replace(/−/g, "-");
    var n = "(-?\\d*\\.?\\d+)", m;
    if((m = new RegExp("^" + n + "(<=?)x(<=?)" + n + "$").exec(s))) return {lo: +m[1], li: m[2] === "<=", hi: +m[4], hi2: m[3] === "<="};
    if((m = new RegExp("^" + n + "(>=?)x(>=?)" + n + "$").exec(s))) return {lo: +m[4], li: m[3] === ">=", hi: +m[1], hi2: m[2] === ">="};
    if((m = new RegExp("^x(<=?|>=?|=)" + n + "$").exec(s)) || (m = new RegExp("^" + n + "(<=?|>=?|=)x$").exec(s))){
      var op = m[1], v = +m[2]; if(/^-?\d/.test(m[1])){ op = m[2]; v = +m[1]; op = op.replace("<", "#").replace(">", "<").replace("#", ">"); }
      if(op === "=") return {lo: v, li: true, hi: v, hi2: true};
      if(op[0] === ">") return {lo: v, li: op === ">=", hi: Infinity, hi2: false};
      return {lo: -Infinity, li: false, hi: v, hi2: op === "<="};
    }
    return null;
  }

  function create(o){
    addCss();
    o = o || {};
    var I = {tool: "pen", color: null, hl: 0, size: 6, snap: true, ngon: 5, list: [], active: false};
    var cv = null, ov = null, W = 0, H = 0, D = 1, undo = [], redo = [];
    var cur = null, laser = [], lasT = 0, curt = null, tools = [], txtBox = null, letters = 0;
    function dark(){ return !!(o.dark && o.dark()); }
    function pens(){ return dark() ? DARK : LIGHT; }
    function U(){ return W / 1000; }
    function frame(){ var f = o.frame ? o.frame(W, H) : null; return f || null; }
    function changed(){ if(o.onChange) o.onChange(); }
    function snap0(){ undo.push(JSON.stringify(I.list)); if(undo.length > 60) undo.shift(); redo = []; barState(); }
    function restore(js){ var a = JSON.parse(js); I.list.length = 0; Array.prototype.push.apply(I.list, a); draw(); changed(); barState(); }

    /* ── 그리기 ── */
    function P(p){ return [p[0] * W, p[1] * H]; }
    function draw(){
      if(!cv) return;
      var g = cv.getContext("2d"); g.setTransform(D, 0, 0, D, 0, 0); g.clearRect(0, 0, W, H);
      var L = I.list.slice(); if(cur && cur.obj) L.push(cur.obj);
      L.filter(function(x){ return x.t === "hl"; }).forEach(function(x){ one(g, x); });
      L.filter(function(x){ return x.t !== "hl"; }).forEach(function(x){ one(g, x); });
      if(cur && cur.prev) cur.prev(g);
      var now = Date.now();
      laser.forEach(function(l){
        var a = l.end ? Math.max(0, 1 - (now - l.end) / 900) : 1; if(a <= 0 || l.pts.length < 1) return;
        g.save(); g.globalAlpha = a; g.strokeStyle = "#ff2d2d"; g.shadowColor = "#ff2d2d"; g.shadowBlur = 12; g.lineWidth = 5; g.lineCap = g.lineJoin = "round";
        g.beginPath(); l.pts.forEach(function(p, i){ var q = P(p); if(i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); g.restore();
      });
    }
    function lw(x){ return Math.max(1, (x.w || 6) * U()); }
    function dot(g, p, r, fill){ g.beginPath(); g.arc(p[0], p[1], r, 0, 7); if(fill === false){ g.save(); g.fillStyle = dark() ? "#1f3d33" : "#fff"; g.fill(); g.restore(); g.stroke(); } else g.fill(); }
    function label(g, t, p, c, sz, align){ g.save(); g.font = "bold " + Math.round(sz || 16) + "px 'Malgun Gothic','Apple SD Gothic Neo',sans-serif"; g.fillStyle = c; g.textAlign = align || "left"; g.textBaseline = "middle";
      g.lineWidth = 4; g.strokeStyle = dark() ? "rgba(31,61,51,.85)" : "rgba(255,255,255,.9)"; g.strokeText(t, p[0], p[1]); g.fillText(t, p[0], p[1]); g.restore(); }
    function extend(a, b, both){ var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, k = (W + H) * 2 / L; return [both ? [a[0] - dx * k, a[1] - dy * k] : a, [a[0] + dx * k, a[1] + dy * k]]; }
    function one(g, x){
      g.save(); g.lineCap = g.lineJoin = "round"; g.strokeStyle = g.fillStyle = x.c || "#1d2733"; g.lineWidth = lw(x);
      var a, b, i, k;
      switch(x.t){
        case "pen":
          if(x.pts.length === 1){ dot(g, P(x.pts[0]), g.lineWidth / 2); break; }
          g.beginPath(); x.pts.forEach(function(p, i){ var q = P(p); if(i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke(); break;
        case "hl": a = P(x.a); b = P(x.b); g.lineCap = "butt"; g.lineWidth = Math.max(10, 22 * U()); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); break;
        case "line":
          a = P(x.a); b = P(x.b); var e = x.k === "seg" ? [a, b] : extend(a, b, x.k === "line");
          g.beginPath(); g.moveTo(e[0][0], e[0][1]); g.lineTo(e[1][0], e[1][1]); g.stroke();
          if(x.k === "seg"){ dot(g, a, g.lineWidth + 1.5); dot(g, b, g.lineWidth + 1.5); } else if(x.k === "ray") dot(g, a, g.lineWidth + 1.5);
          break;
        case "circle": a = P(x.o); g.beginPath(); g.arc(a[0], a[1], x.r * W, 0, Math.PI * 2); g.stroke(); dot(g, a, 2.5); break;
        case "arc": a = P(x.o); g.beginPath(); g.arc(a[0], a[1], x.r * W, x.a0, x.a1, false); g.stroke(); dot(g, a, 2.5); break;
        case "poly":
          g.beginPath(); x.pts.forEach(function(p, i){ var q = P(p); if(i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); if(x.closed) g.closePath(); g.stroke(); break;
        case "mark":
          a = P(x.p); var s = Math.max(12, 16 * U() * 1.4), th = x.ang || 0, cs = Math.cos(th), sn = Math.sin(th);
          g.lineWidth = Math.max(2, lw(x) * .6);
          g.translate(a[0], a[1]); g.rotate(th); g.beginPath();
          if(x.k === "right"){ g.moveTo(s, 0); g.lineTo(s, -s); g.lineTo(0, -s); }
          else if(x.k === "tick1"){ g.moveTo(0, -s * .6); g.lineTo(0, s * .6); }
          else if(x.k === "tick2"){ g.moveTo(-4, -s * .6); g.lineTo(-4, s * .6); g.moveTo(4, -s * .6); g.lineTo(4, s * .6); }
          else { g.moveTo(-s * .45, -s * .5); g.lineTo(s * .2, 0); g.lineTo(-s * .45, s * .5); g.moveTo(-s * .05, -s * .5); g.lineTo(s * .6, 0); g.lineTo(-s * .05, s * .5); }
          g.stroke(); void cs; void sn; break;
        case "text": a = P(x.p); g.font = "bold " + Math.round((x.s || 34) * U()) + "px 'Malgun Gothic','Apple SD Gothic Neo',sans-serif"; g.textBaseline = "top"; g.fillText(x.v, a[0], a[1]); break;
        case "pt": a = P(x.p); dot(g, a, Math.max(4, lw(x) * .9)); if(x.l) label(g, x.l, [a[0] + 10, a[1] - 14], x.c, Math.max(15, 22 * U())); break;
        case "ang":
          a = P(x.a); var O = P(x.o); b = P(x.b);
          var t1 = Math.atan2(a[1] - O[1], a[0] - O[0]), t2 = Math.atan2(b[1] - O[1], b[0] - O[0]), d = t2 - t1;
          while(d <= -Math.PI) d += 2 * Math.PI; while(d > Math.PI) d -= 2 * Math.PI;
          var R = Math.max(24, 40 * U()); g.lineWidth = Math.max(2, lw(x) * .6);
          g.beginPath(); g.arc(O[0], O[1], R, t1, t1 + d, d < 0); g.stroke();
          var m = t1 + d / 2; label(g, Math.round(Math.abs(d) * 180 / Math.PI) + "°", [O[0] + Math.cos(m) * (R + 18), O[1] + Math.sin(m) * (R + 18)], x.c, Math.max(15, 22 * U()), "center");
          break;
        case "graph": graph(g, x); break;
        case "range": range(g, x); break;
      }
      g.restore();
    }
    function graph(g, x){
      var F = frame(); if(!F || !F.axis) return; var f = parseExpr(x.e); if(!f) return;
      var ox = F.ox, oy = F.oy, u = F.u, prev = null, step = 2, pts = [];
      g.lineWidth = Math.max(2.5, lw(x) * .7); g.beginPath();
      for(var px = 0; px <= W; px += step){
        var X = (px - ox) / u, Y = f(X), py = oy - Y * u;
        if(!isFinite(py) || Math.abs(py) > H * 6){ prev = null; continue; }
        if(prev && Math.abs(py - prev[1]) > H * 1.5){ prev = null; }
        if(prev) g.lineTo(px, py); else g.moveTo(px, py);
        prev = [px, py]; pts.push([X, Y]);
      }
      g.stroke();
      /* 절편 · 꼭짓점 */
      var sp = [], x0 = -ox / u, x1 = (W - ox) / u, n = 400, dx = (x1 - x0) / n, i, xa, ya, xb, yb;
      function add(px2, py2){ if(!isFinite(py2)) return; if(sp.some(function(q){ return Math.abs(q[0] - px2) < 1e-3 && Math.abs(q[1] - py2) < 1e-3; })) return; sp.push([px2, py2]); }
      var y0 = f(0); if(isFinite(y0) && Math.abs(y0) < 1e6) add(0, y0);
      for(i = 0; i < n; i++){
        xa = x0 + i * dx; xb = xa + dx; ya = f(xa); yb = f(xb);
        if(isFinite(ya) && isFinite(yb) && ya * yb < 0 && Math.abs(ya - yb) < 1e3){ var lo = xa, hi = xb; for(var k = 0; k < 40; k++){ var mid = (lo + hi) / 2; if(f(lo) * f(mid) <= 0) hi = mid; else lo = mid; } add((lo + hi) / 2, 0); }
        else if(ya === 0) add(xa, 0);
        if(i > 0){ var yp = f(xa - dx); if(isFinite(yp) && isFinite(ya) && isFinite(yb) && (ya - yp) * (yb - ya) < 0){ var l2 = xa - dx, h2 = xb; for(var j = 0; j < 50; j++){ var m1 = l2 + (h2 - l2) / 3, m2 = h2 - (h2 - l2) / 3; if((f(m1) < f(m2)) === (ya > yp)) l2 = m1; else h2 = m2; } var xv = (l2 + h2) / 2; add(xv, f(xv)); } }
      }
      sp.slice(0, 8).forEach(function(q){
        var X = Math.abs(q[0] - Math.round(q[0])) < 1e-6 ? Math.round(q[0]) : q[0], Y = Math.abs(q[1] - Math.round(q[1])) < 1e-6 ? Math.round(q[1]) : q[1];
        var p = [ox + X * u, oy - Y * u]; if(p[0] < 0 || p[0] > W || p[1] < 0 || p[1] > H) return;
        dot(g, p, 4.5); label(g, "(" + fmt(X) + ", " + fmt(Y) + ")", [p[0] + 8, p[1] - 14], x.c, 14);
      });
      /* 식 이름표: 보이는 끝 근처 */
      var vis = pts.filter(function(q){ var py = oy - q[1] * u; return py > 20 && py < H - 20; });
      if(vis.length){ var q = vis[Math.floor(vis.length * .85)]; label(g, "y=" + x.e.replace(/^\s*(y|f\(x\))\s*=\s*/i, ""), [ox + q[0] * u + 8, oy - q[1] * u - 18], x.c, 17); }
    }
    function range(g, x){
      var F = frame(); if(!F) return; var R = parseRange(x.e); if(!R) return;
      var idx = I.list.filter(function(y){ return y.t === "range"; }).indexOf(x); if(idx < 0) idx = I.list.filter(function(y){ return y.t === "range"; }).length;
      var y = F.oy - 22 - idx * 22, xl = isFinite(R.lo) ? F.ox + R.lo * F.u : 6, xr = isFinite(R.hi) ? F.ox + R.hi * F.u : W - 6;
      g.lineWidth = 4; g.beginPath(); g.moveTo(xl, y); g.lineTo(xr, y); g.stroke();
      [[R.lo, R.li, xl, -1], [R.hi, R.hi2, xr, 1]].forEach(function(e){
        if(isFinite(e[0])){ g.save(); g.setLineDash([3, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(e[2], y); g.lineTo(e[2], F.oy); g.stroke(); g.restore(); g.lineWidth = 3; dot(g, [e[2], y], 6, e[1] ? true : false); }
        else { g.beginPath(); g.moveTo(e[2], y); g.lineTo(e[2] - e[3] * 12, y - 7); g.moveTo(e[2], y); g.lineTo(e[2] - e[3] * 12, y + 7); g.stroke(); }
      });
      label(g, x.e, [Math.max(6, Math.min(W - 6, (Math.max(6, xl) + Math.min(W - 6, xr)) / 2)), y - 14], x.c, 14, "center");
    }

    /* ── 지우개: 닿은 획 찾기 ── */
    function path(x){
      var a, b;
      switch(x.t){
        case "pen": return x.pts.map(P);
        case "hl": return [P(x.a), P(x.b)];
        case "line": a = P(x.a); b = P(x.b); return x.k === "seg" ? [a, b] : extend(a, b, x.k === "line");
        case "poly": var p = x.pts.map(P); if(x.closed) p.push(p[0]); return p;
        case "circle": case "arc": a = P(x.o); var r = x.r * W, s = x.t === "arc" ? x.a0 : 0, e = x.t === "arc" ? x.a1 : Math.PI * 2, out = []; if(e < s) e += Math.PI * 2; for(var t = s; t <= e + 1e-6; t += (e - s) / 48) out.push([a[0] + Math.cos(t) * r, a[1] + Math.sin(t) * r]); return out;
        case "text": a = P(x.p); var h = (x.s || 34) * U(), w = x.v.length * h * .9; return [[a[0], a[1] + h / 2], [a[0] + w, a[1] + h / 2]];
        case "ang": return [P(x.o)];
        case "graph": var F = frame(), f = parseExpr(x.e), o2 = []; if(!F || !f) return []; for(var px = 0; px <= W; px += 6){ var py = F.oy - f((px - F.ox) / F.u) * F.u; if(isFinite(py)) o2.push([px, py]); else o2.push(null); } return o2;
        case "range": return [];
        default: return [P(x.p)];
      }
    }
    function near(x, q, tol){
      var p = path(x);
      if(x.t === "range"){ var F = frame(); if(!F) return false; var idx = I.list.filter(function(y){ return y.t === "range"; }).indexOf(x); return Math.abs(q[1] - (F.oy - 22 - idx * 22)) < 10; }
      if(p.length === 1) return Math.hypot(p[0][0] - q[0], p[0][1] - q[1]) < tol + 10;
      for(var i = 1; i < p.length; i++){
        var a = p[i - 1], b = p[i]; if(!a || !b) continue;
        var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0;
        if(Math.hypot(a[0] + t * dx - q[0], a[1] + t * dy - q[1]) < tol + (x.t === "hl" ? 11 * U() * 2 : lw(x) / 2)) return true;
      }
      return false;
    }

    /* ── 붙이기: 다른 도형의 점 → 격자 ── */
    function keyPts(){
      var out = [];
      I.list.forEach(function(x){
        if(x.t === "line"){ out.push(P(x.a), P(x.b)); } else if(x.t === "poly") x.pts.forEach(function(p){ out.push(P(p)); });
        else if(x.t === "circle" || x.t === "arc") out.push(P(x.o)); else if(x.t === "pt") out.push(P(x.p));
      });
      if(cur && cur.verts) cur.verts.forEach(function(p){ out.push(P(p)); });
      return out;
    }
    function snapPt(q){
      if(!I.snap) return q;
      var best = null, bd = 14;
      keyPts().forEach(function(p){ var d = Math.hypot(p[0] - q[0], p[1] - q[1]); if(d < bd){ bd = d; best = p; } });
      if(best) return [best[0], best[1]];
      var F = frame();
      if(F && F.grid){ var gx = F.ox + Math.round((q[0] - F.ox) / F.u) * F.u, gy = F.oy + Math.round((q[1] - F.oy) / F.u) * F.u; if(Math.hypot(gx - q[0], gy - q[1]) < F.u * .3) return [gx, gy]; }
      return q;
    }
    function N(q){ return [r4(q[0] / W), r4(q[1] / H)]; }
    function pos(e){ var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)]; }
    function col(){ return I.color || pens()[0]; }

    /* ── 손가락·펜 ── */
    function down(e){
      if(!I.active) return; e.preventDefault(); closeMenu();
      var q = pos(e), t = I.tool;
      if(txtBox && t !== "text") closeText();
      if(t === "laser"){ cv.setPointerCapture(e.pointerId); cur = {laser: {pts: [N(q)]}}; laser.push(cur.laser); tickLaser(); return; }
      if(t === "eraser"){ cv.setPointerCapture(e.pointerId); cur = {erase: true, did: false}; eraseAt(q); return; }
      if(t === "text"){ openText(q); return; }
      if(t === "graph" || t === "range"){ toast(t === "graph" ? "📈 아래 칸에 식을 넣고 [그리기]를 누르세요" : "➖ 아래 칸에 부등식을 넣고 [표시]를 누르세요"); openMenu(); return; }
      if(t === "pt"){ var F = frame(), sq = snapPt(q), lb;
        if(F && (F.axis)){ lb = "(" + fmt((sq[0] - F.ox) / F.u) + ", " + fmt((F.oy - sq[1]) / F.u) + ")"; }
        else lb = String.fromCharCode(65 + (letters++ % 26));
        snap0(); I.list.push({t: "pt", p: N(sq), l: lb, c: col(), w: I.size}); draw(); changed(); return; }
      if(t === "ang"){
        var s = snapPt(q);
        if(!cur || !cur.ang){ cur = {ang: [N(s)], prev: angPrev}; draw(); return; }
        cur.ang.push(N(s));
        if(cur.ang.length === 3){ snap0(); I.list.push({t: "ang", a: cur.ang[0], o: cur.ang[1], b: cur.ang[2], c: col(), w: I.size}); cur = null; changed(); }
        draw(); return;
      }
      if(t === "poly"){
        var v = snapPt(q);
        if(!cur || !cur.verts){ cur = {verts: [N(v)], hover: v, prev: polyPrev}; draw(); return; }
        var f0 = P(cur.verts[0]);
        if(cur.verts.length >= 3 && Math.hypot(f0[0] - v[0], f0[1] - v[1]) < 16){ finishPoly(true); return; }
        var lp = P(cur.verts[cur.verts.length - 1]); if(Math.hypot(lp[0] - v[0], lp[1] - v[1]) < 6){ finishPoly(false); return; }   // 같은 자리 두 번 = 끝
        cur.verts.push(N(v)); draw(); return;
      }
      if(t === "arc" && cur && cur.arc2){ snap0(); I.list.push(cur.obj); cur = null; draw(); changed(); return; }
      cv.setPointerCapture(e.pointerId);
      var a = (t === "pen" || t === "hl") ? q : snapPt(q);
      if(t === "pen") cur = {obj: {t: "pen", c: col(), w: I.size, pts: [N(a)]}};
      else if(t === "hl") cur = {obj: {t: "hl", c: HL[I.hl] || HL[0], a: N(a), b: N(a)}, A: a};
      else if(t === "seg" || t === "line" || t === "ray") cur = {obj: {t: "line", k: t, c: col(), w: I.size, a: N(a), b: N(a)}, A: a};
      else if(t === "circle" || t === "arc") cur = {obj: {t: "circle", c: col(), w: I.size, o: N(a), r: 0}, A: a, arc: t === "arc"};
      else if(t === "ngon") cur = {obj: {t: "poly", closed: true, c: col(), w: I.size, pts: []}, A: a, ngon: true};
      else if(t === "right" || t === "tick1" || t === "tick2" || t === "par") cur = {obj: {t: "mark", k: t, c: col(), w: I.size, p: N(a), ang: 0}, A: a};
      draw();
    }
    function move(e){
      var q = pos(e);
      if(cur && cur.verts){ cur.hover = snapPt(q); draw(); return; }
      if(cur && cur.ang){ cur.hover = snapPt(q); draw(); return; }
      if(cur && cur.arc2){ var A = cur.A, t = Math.atan2(q[1] - A[1], q[0] - A[0]); cur.obj.a1 = t; draw(); return; }
      if(!cur) return;
      if(cur.laser){ (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(function(x){ cur.laser.pts.push(N(pos(x))); }); return; }
      if(cur.erase){ eraseAt(q); return; }
      var o2 = cur.obj; if(!o2) return;
      if(o2.t === "pen"){ (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(function(x){ o2.pts.push(N(pos(x))); }); }
      else if(o2.t === "hl"){ var b = q.slice(); if(Math.abs(b[1] - cur.A[1]) < Math.abs(b[0] - cur.A[0]) * Math.tan(12 * Math.PI / 180)) b[1] = cur.A[1]; o2.b = N(b); }
      else if(o2.t === "line") o2.b = N(snapPt(q));
      else if(o2.t === "circle"){ var s = snapPt(q); o2.r = r4(Math.hypot(s[0] - cur.A[0], s[1] - cur.A[1]) / W); cur.B = s; }
      else if(cur.ngon){ var s2 = snapPt(q), R = Math.hypot(s2[0] - cur.A[0], s2[1] - cur.A[1]), t0 = Math.atan2(s2[1] - cur.A[1], s2[0] - cur.A[0]), n = I.ngon, pts = [];
        for(var i = 0; i < n; i++){ var th = t0 + i * 2 * Math.PI / n; pts.push(N([cur.A[0] + Math.cos(th) * R, cur.A[1] + Math.sin(th) * R])); } o2.pts = pts; }
      else if(o2.t === "mark"){ if(Math.hypot(q[0] - cur.A[0], q[1] - cur.A[1]) > 8) o2.ang = Math.atan2(q[1] - cur.A[1], q[0] - cur.A[0]); }
      draw();
    }
    function up(){
      if(!cur) return;
      if(cur.laser){ cur.laser.end = Date.now(); cur = null; tickLaser(); return; }
      if(cur.erase){ cur = null; if(eraseDid){ eraseDid = false; changed(); } return; }
      if(cur.verts || cur.ang || cur.arc2) return;
      var x = cur.obj;
      if(x && x.t === "circle" && cur.arc){ if(x.r * W < 6){ cur = null; draw(); return; } var B = cur.B || cur.A, a0 = Math.atan2(B[1] - cur.A[1], B[0] - cur.A[0]); cur = {obj: {t: "arc", c: x.c, w: x.w, o: x.o, r: x.r, a0: a0, a1: a0 + .01}, A: cur.A, arc2: true}; toast("◠ 호가 끝날 곳을 누르세요"); draw(); return; }
      var tiny = x && ((x.t === "line" && Math.hypot((x.a[0] - x.b[0]) * W, (x.a[1] - x.b[1]) * H) < 6) || (x.t === "hl" && Math.hypot((x.a[0] - x.b[0]) * W, (x.a[1] - x.b[1]) * H) < 6) || (x.t === "circle" && x.r * W < 4) || (x.t === "poly" && x.pts.length < 3));
      if(x && !tiny){ snap0(); I.list.push(x); changed(); }
      cur = null; draw();
    }
    var eraseDid = false;
    function eraseAt(q){
      for(var i = I.list.length - 1; i >= 0; i--) if(near(I.list[i], q, 10)){ if(!eraseDid) snap0(); eraseDid = true; I.list.splice(i, 1); }
      draw();
    }
    function polyPrev(g){
      if(!cur.verts) return; g.save(); g.strokeStyle = col(); g.lineWidth = Math.max(1, I.size * U()); g.lineCap = "round"; g.setLineDash([]);
      g.beginPath(); cur.verts.forEach(function(p, i){ var q = P(p); if(i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke();
      if(cur.hover){ var l = P(cur.verts[cur.verts.length - 1]); g.setLineDash([6, 6]); g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(cur.hover[0], cur.hover[1]); g.stroke(); }
      g.setLineDash([]); g.fillStyle = "#2f6fb5"; cur.verts.forEach(function(p, i){ dot(g, P(p), i ? 4 : 7); }); g.restore();
    }
    function angPrev(g){
      g.save(); g.strokeStyle = "#2f6fb5"; g.fillStyle = "#2f6fb5"; g.lineWidth = 2; g.setLineDash([6, 6]);
      var pts = cur.ang.map(P); if(cur.hover) pts.push(cur.hover);
      g.beginPath(); pts.forEach(function(q, i){ if(i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke();
      cur.ang.forEach(function(p, i){ dot(g, P(p), i === 1 ? 6 : 4); }); g.restore();
      label(g, ["① 한쪽 끝", "② 꼭짓점", "③ 다른 쪽 끝"][cur.ang.length] || "", [(cur.hover || P(cur.ang[0]))[0] + 12, (cur.hover || P(cur.ang[0]))[1] + 16], "#2f6fb5", 13);
    }
    function finishPoly(closed){ if(cur && cur.verts && cur.verts.length >= 2){ snap0(); I.list.push({t: "poly", closed: closed && cur.verts.length >= 3, c: col(), w: I.size, pts: cur.verts}); changed(); } cur = null; draw(); }
    function cancelCur(){ if(cur && cur.verts && cur.verts.length >= 2){ finishPoly(false); return; } cur = null; draw(); }
    function tickLaser(){
      if(lasT) return;
      (function f(){ var now = Date.now(); laser = laser.filter(function(l){ return !l.end || now - l.end < 900; }); draw(); if(laser.length){ lasT = requestAnimationFrame(f); } else lasT = 0; })();
    }

    /* ── 글상자 ── */
    function openText(q){
      closeText();
      var b = el("div", "txt"); b.style.left = Math.min(q[0], W - 360) + "px"; b.style.top = Math.min(q[1], H - 150) + "px";
      b.innerHTML = '<input type="text" placeholder="글자를 쓰고 Enter">' + '<div class="sy">' + SYM.map(function(s){ return '<button type="button">' + s + "</button>"; }).join("") + '</div><div class="r"><button type="button" class="no">취소</button><button type="button" class="ok">넣기</button></div>';
      ov.appendChild(b); txtBox = {el: b, q: q};
      var inp = b.querySelector("input");
      b.querySelector(".sy").onclick = function(e){ var t = e.target.closest("button"); if(!t) return; var s = inp.selectionStart || inp.value.length; inp.value = inp.value.slice(0, s) + t.textContent + inp.value.slice(inp.selectionEnd || s); inp.focus(); inp.selectionStart = inp.selectionEnd = s + t.textContent.length; };
      b.querySelector(".no").onclick = closeText; b.querySelector(".ok").onclick = commitText;
      inp.onkeydown = function(e){ e.stopPropagation(); if(e.key === "Enter" && !e.isComposing){ e.preventDefault(); commitText(); } else if(e.key === "Escape") closeText(); };
      setTimeout(function(){ inp.focus(); }, 0);
    }
    function commitText(){ if(!txtBox) return; var v = txtBox.el.querySelector("input").value.trim(); if(v){ snap0(); I.list.push({t: "text", p: N(txtBox.q), v: v, c: col(), s: Math.max(26, I.size * 4 + 14)}); changed(); } closeText(); draw(); }
    function closeText(){ if(txtBox){ txtBox.el.remove(); txtBox = null; } }

    /* ── 가림막 ── */
    function curtain(on){
      if(!on){ if(curt){ curt.el.remove(); curt = null; } barState(); return; }
      if(curt) return;
      var c = el("div", "curt", '<div class="hd">⇕ 끌어서 보이기</div><button type="button" class="x">✕ 걷기</button>'); curt = {el: c, y: .18};
      function put(){ c.style.top = (curt.y * 100) + "%"; }
      put(); ov.appendChild(c);
      var hd = c.querySelector(".hd"), sy = 0, s0 = 0;
      hd.onpointerdown = function(e){ e.preventDefault(); hd.setPointerCapture(e.pointerId); sy = e.clientY; s0 = curt.y; };
      hd.onpointermove = function(e){ if(!hd.hasPointerCapture(e.pointerId)) return; curt.y = Math.max(0, Math.min(.97, s0 + (e.clientY - sy) / (H || 1))); put(); };
      c.querySelector(".x").onclick = function(){ curtain(false); };
      barState();
    }

    /* ── 각도기 · 삼각자 (화면 위에 놓고 옮기기·돌리기) ── */
    function addTool(kind){
      var t = {kind: kind, x: .5, y: .55, rot: 0}; tools.push(t); placeTool(t); barState();
    }
    function toolSvg(kind){
      var s = "", i, r = 170;
      if(kind === "prot"){
        s = '<svg width="360" height="190" viewBox="-180 -180 360 190" style="display:block;overflow:visible"><path d="M-175 0 A175 175 0 0 1 175 0 Z" fill="rgba(170,215,255,.42)" stroke="#1f6fd1" stroke-width="2"/>';
        for(i = 0; i <= 180; i++){ var a = Math.PI - i * Math.PI / 180, L = i % 10 === 0 ? 18 : i % 5 === 0 ? 12 : 6, c = Math.cos(a), sn = Math.sin(a);
          s += '<line x1="' + (c * r) + '" y1="' + (-sn * r) + '" x2="' + (c * (r - L)) + '" y2="' + (-sn * (r - L)) + '" stroke="#123" stroke-width="' + (i % 10 ? .8 : 1.4) + '"/>';
          if(i % 10 === 0){ s += '<text x="' + (c * (r - 30)) + '" y="' + (-sn * (r - 30) + 4) + '" font-size="11" text-anchor="middle" fill="#123" font-weight="700">' + i + '</text><text x="' + (c * (r - 46)) + '" y="' + (-sn * (r - 46) + 4) + '" font-size="9" text-anchor="middle" fill="#c2432a">' + (180 - i) + "</text>"; } }
        s += '<line x1="-175" y1="0" x2="175" y2="0" stroke="#1f6fd1" stroke-width="1.5"/><circle r="4" fill="#c2432a"/><line x1="0" y1="0" x2="0" y2="-40" stroke="#c2432a" stroke-width="1"/></svg>';
        return {svg: s, w: 360, h: 190, cx: 180, cy: 180};
      }
      var tri = kind === "sq45" ? [[0, 0], [260, 0], [0, -260]] : [[0, 0], [300, 0], [0, -173]];
      s = '<svg width="320" height="280" viewBox="-10 -270 320 280" style="display:block;overflow:visible"><path d="M' + tri.map(function(p){ return p.join(" "); }).join(" L") + ' Z" fill="rgba(255,226,140,.45)" stroke="#b07800" stroke-width="2"/>';
      for(i = 0; i <= tri[1][0]; i += 10) s += '<line x1="' + i + '" y1="0" x2="' + i + '" y2="' + (i % 50 ? -7 : -13) + '" stroke="#5a4200" stroke-width="1"/>';
      for(i = 0; i <= -tri[2][1]; i += 10) s += '<line x1="0" y1="' + (-i) + '" x2="' + (i % 50 ? 7 : 13) + '" y2="' + (-i) + '" stroke="#5a4200" stroke-width="1"/>';
      s += '<path d="M14 0 L14 -14 L0 -14" fill="none" stroke="#5a4200" stroke-width="1.5"/>';
      s += kind === "sq45" ? '<text x="190" y="-12" font-size="13" fill="#5a4200" font-weight="800">45°</text><text x="8" y="-200" font-size="13" fill="#5a4200" font-weight="800">45°</text>'
        : '<text x="232" y="-10" font-size="13" fill="#5a4200" font-weight="800">30°</text><text x="8" y="-130" font-size="13" fill="#5a4200" font-weight="800">60°</text>';
      return {svg: s + "</svg>", w: 320, h: 280, cx: 10, cy: 270};
    }
    function placeTool(t){
      if(!ov) return;
      var S = toolSvg(t.kind), d = t.el;
      if(!d){
        d = el("div", "tool", S.svg + '<span class="h r" title="돌리기">↻</span><span class="h x" title="치우기">✕</span>'); t.el = d; ov.appendChild(d);
        d.style.width = S.w + "px"; d.style.height = S.h + "px"; d.style.transformOrigin = S.cx + "px " + S.cy + "px";
        var hr = d.querySelector(".r"), hx = d.querySelector(".x");
        if(t.kind === "prot"){ hr.style.left = (S.w - 16) + "px"; hr.style.top = (S.cy - 30) + "px"; hx.style.left = "-14px"; hx.style.top = (S.cy - 30) + "px"; }
        else { var top = t.kind === "sq45" ? 260 : 173, rx = t.kind === "sq45" ? 260 : 300; hr.style.left = (S.cx + rx - 10) + "px"; hr.style.top = (S.cy - 44) + "px"; hx.style.left = (S.cx + 18) + "px"; hx.style.top = (S.cy - top - 4) + "px"; }
        hx.onpointerdown = function(e){ e.stopPropagation(); }; hx.onclick = function(){ d.remove(); tools.splice(tools.indexOf(t), 1); barState(); };
        var mode = null, s0, p0, a0;
        d.onpointerdown = function(e){ e.preventDefault(); d.setPointerCapture(e.pointerId); var r = cv.getBoundingClientRect(); var cx = r.left + t.x * r.width, cy = r.top + t.y * r.height;
          if(e.target.closest(".r")){ mode = "rot"; a0 = Math.atan2(e.clientY - cy, e.clientX - cx) - t.rot; } else { mode = "mv"; s0 = [e.clientX, e.clientY]; p0 = [t.x, t.y]; } };
        d.onpointermove = function(e){ if(!mode) return; var r = cv.getBoundingClientRect();
          if(mode === "mv"){ t.x = Math.max(0, Math.min(1, p0[0] + (e.clientX - s0[0]) / r.width)); t.y = Math.max(0, Math.min(1, p0[1] + (e.clientY - s0[1]) / r.height)); }
          else { var cx = r.left + t.x * r.width, cy = r.top + t.y * r.height, a = Math.atan2(e.clientY - cy, e.clientX - cx) - a0, deg = a * 180 / Math.PI, sn = Math.round(deg / 15) * 15; if(Math.abs(deg - sn) < 3) a = sn * Math.PI / 180; t.rot = a; }
          placeTool(t); };
        d.onpointerup = d.onpointercancel = function(){ mode = null; };
      }
      var sc = Math.max(.55, Math.min(1.6, W / 1000));
      d.style.left = (t.x * W - S.cx) + "px"; d.style.top = (t.y * H - S.cy) + "px"; d.style.transform = "rotate(" + t.rot + "rad) scale(" + sc + ")";
    }

    /* ── 도구 막대 ── */
    var bar = null, menu = null, btns = {}, docClick = false;
    function closeMenu(){ if(menu){ menu.classList.remove("on"); var mb = bar && bar.querySelector(".mbtn"); if(mb) mb.classList.remove("on"); } }
    function openMenu(){ if(menu){ menu.classList.add("on"); var mb = bar.querySelector(".mbtn"); if(mb) mb.classList.add("on"); fillOpt(); } }
    function setTool(t){
      if(cur){ if(cur.verts && cur.verts.length >= 2) finishPoly(false); cur = null; }
      if(t === "curtain"){ curtain(!curt); return; }
      if(t === "prot" || t === "sq30" || t === "sq45"){ addTool(t); closeMenu(); return; }
      I.tool = t; if(t !== "text") closeText();
      if(o.onTool) o.onTool(t);
      barState(); draw();
      if(t === "graph" || t === "range" || t === "ngon"){ openMenu(); } else if(MATH.some(function(m){ return m[0] === t; })) setTimeout(closeMenu, 120);
    }
    function mk(id, html, title, cls){ var b = el("button", cls || "", html); b.type = "button"; b.title = title; b.onclick = function(){ setTool(id); }; btns[id] = b; return b; }
    function renderBar(host, extra){
      if(extra) o.extra = extra;
      bar = host; host.innerHTML = ""; host.classList.add("tik"); btns = {};
      [["pen", "✏️", "펜"], ["hl", "🖍️", "형광펜 (곧은 선 · 거의 수평이면 딱 수평)"], ["eraser", "🧽", "지우개 (닿은 획만)"], ["laser", "🔴", "레이저 (2초 뒤 사라짐)"], ["text", "🔤", "글상자 (수학 기호)"], ["curtain", "🙈", "가림막 (끌어서 하나씩 보이기)"]]
        .forEach(function(x){ host.appendChild(mk(x[0], x[1], x[2])); });
      var mb = el("button", "mbtn", "📐 수학"); mb.type = "button"; mb.title = "작도·각도기·그래프"; mb.onclick = function(e){ e.stopPropagation(); if(menu.classList.contains("on")) closeMenu(); else openMenu(); }; host.appendChild(mb);
      host.appendChild(el("span", "sep"));
      var sw = el("span", "sws"); sw.style.display = "contents"; host.appendChild(sw);
      var sz = el("select", ""); sz.title = "굵기"; [["3", "가늘게"], ["6", "보통"], ["11", "굵게"], ["18", "아주 굵게"]].forEach(function(x){ var op = el("option", "", x[1]); op.value = x[0]; sz.appendChild(op); }); sz.value = String(I.size); sz.onchange = function(){ I.size = +sz.value; }; host.appendChild(sz);
      host.appendChild(el("span", "sep"));
      var bu = el("button", "", "↶"); bu.type = "button"; bu.title = "되돌리기 (Ctrl+Z)"; bu.onclick = doUndo; btns._u = bu; host.appendChild(bu);
      var br = el("button", "", "↷"); br.type = "button"; br.title = "다시 하기 (Ctrl+Y)"; br.onclick = doRedo; btns._r = br; host.appendChild(br);
      var bc = el("button", "", "🗑"); bc.type = "button"; bc.title = "이 쪽 판서 모두 지우기"; bc.onclick = function(){ if(!I.list.length) return; snap0(); I.list.length = 0; draw(); changed(); toast("지웠어요. ↶ 로 살릴 수 있어요."); }; host.appendChild(bc);
      (o.extra || []).forEach(function(n){ host.appendChild(n); });
      menu = el("div", "tik-m" + (o.menuDown ? " down" : ""));
      MATH.forEach(function(m){ menu.appendChild(mk(m[0], "<b>" + m[1] + "</b>" + m[2], m[2])); });
      [["prot", "📐", "각도기"], ["sq30", "◺", "삼각자 30°·60°"], ["sq45", "◸", "삼각자 45°"]].forEach(function(m){ menu.appendChild(mk(m[0], "<b>" + m[1] + "</b>" + m[2], m[2] + " (끌어 옮기기 · ↻ 돌리기)")); });
      var sn = el("button", "", "<b>🧲</b>붙이기"); sn.type = "button"; sn.title = "점·격자에 붙이기"; sn.onclick = function(){ I.snap = !I.snap; barState(); }; btns._snap = sn; menu.appendChild(sn);
      menu.appendChild(el("div", "opt"));
      menu.onclick = function(e){ e.stopPropagation(); };
      host.appendChild(menu);
      if(!docClick){ docClick = true; document.addEventListener("click", function(e){ if(menu && bar && !bar.contains(e.target)) closeMenu(); }); }
      barState();
    }
    function fillOpt(){
      if(!menu) return; var op = menu.querySelector(".opt"), t = I.tool, F = frame();
      if(t === "graph"){
        op.innerHTML = '📈 <input id="tikG" placeholder="y = x² - 2x - 3" style="flex:1"><button type="button" id="tikGo">그리기</button>' + (F && F.axis ? "" : '<span style="color:#c2432a">좌표평면 바탕에서 그려져요</span>');
        var gi = op.querySelector("#tikG"), go = function(){ var v = gi.value.trim(); if(!v) return; if(!parseExpr(v)){ toast("식을 읽지 못했어요. 예: y=2x+1, y=x^2-4, y=6/x"); return; } if(!(F && F.axis)){ toast("칠판 바탕을 '좌표평면'으로 바꾸면 그래프가 그려져요"); return; } snap0(); I.list.push({t: "graph", e: v, c: col(), w: I.size}); draw(); changed(); gi.value = ""; };
        op.querySelector("#tikGo").onclick = go; gi.onkeydown = function(e){ e.stopPropagation(); if(e.key === "Enter" && !e.isComposing) go(); }; setTimeout(function(){ gi.focus(); }, 0);
      } else if(t === "range"){
        op.innerHTML = '➖ <input id="tikR" placeholder="-1 ≤ x < 3" style="flex:1"><button type="button" class="sym">≤</button><button type="button" class="sym">≥</button><button type="button" id="tikRo">표시</button>' + (F && (F.axis || F.numline) ? "" : '<span style="color:#c2432a">수직선·좌표평면 바탕에서</span>');
        var ri = op.querySelector("#tikR"), go2 = function(){ var v = ri.value.trim(); if(!parseRange(v)){ toast("예: x > 2,  -1 ≤ x < 3,  x ≤ -2"); return; } if(!(F && (F.axis || F.numline))){ toast("칠판 바탕을 '수직선'으로 바꾸면 표시돼요"); return; } snap0(); I.list.push({t: "range", e: v, c: col()}); draw(); changed(); ri.value = ""; };
        [].forEach.call(op.querySelectorAll(".sym"), function(b){ b.onclick = function(){ ri.value += b.textContent; ri.focus(); }; });
        op.querySelector("#tikRo").onclick = go2; ri.onkeydown = function(e){ e.stopPropagation(); if(e.key === "Enter" && !e.isComposing) go2(); }; setTimeout(function(){ ri.focus(); }, 0);
      } else if(t === "ngon"){
        op.innerHTML = '⬠ 정 <select id="tikN">' + [3, 4, 5, 6, 8].map(function(n){ return '<option' + (n === I.ngon ? " selected" : "") + ">" + n + "</option>"; }).join("") + '</select>각형 · 가운데를 누르고 끌기';
        op.querySelector("#tikN").onchange = function(){ I.ngon = +this.value; };
      } else op.innerHTML = '<span>' + ({seg: "두 점을 이어 끌기", line: "두 점을 지나는 직선", ray: "시작점에서 끌기", circle: "중심을 누르고 끌기 (반지름)", arc: "중심 → 끌어서 시작점 → 끝날 곳 누르기", poly: "꼭짓점을 차례로 누르기 · 첫 점을 누르면 닫힘 · 같은 점 두 번 = 끝", right: "꼭짓점을 누르고 한 변 쪽으로 끌기", tick1: "변 가운데를 누르고 변 방향으로 끌기", tick2: "변 가운데를 누르고 변 방향으로 끌기", par: "변 위를 누르고 변 방향으로 끌기", ang: "한쪽 끝 → 꼭짓점 → 다른 쪽 끝 차례로 누르기", pt: F && F.axis ? "누른 곳에 점과 좌표" : "누른 곳에 점 A, B, C…"}[t] || "작도 · 각도기 · 그래프") + " · 🧲 붙이기 " + (I.snap ? "켜짐" : "꺼짐") + "</span>";
    }
    function barState(){
      if(!bar) return;
      Object.keys(btns).forEach(function(k){ if(k[0] !== "_") btns[k].classList.toggle("on", k === I.tool || (k === "curtain" && !!curt)); });
      if(btns._snap) btns._snap.classList.toggle("on", I.snap);
      if(btns._u) btns._u.disabled = !undo.length; if(btns._r) btns._r.disabled = !redo.length;
      var sw = bar.querySelector(".sws"); if(sw){ sw.innerHTML = "";
        var hl = I.tool === "hl", L = hl ? HL : pens(); if(!hl && L.indexOf(I.color) < 0) I.color = L[0];
        L.forEach(function(c, i){ var b = el("button", "sw" + ((hl ? I.hl === i : I.color === c) ? " on" : "")); b.type = "button"; b.style.background = hl ? c.replace(/,\.\d+\)/, ",1)") : c; b.title = hl ? "형광펜 색" : "펜 색";
          b.onclick = function(){ if(hl) I.hl = i; else { I.color = c; if(["eraser", "laser", "curtain"].indexOf(I.tool) >= 0) I.tool = "pen"; } barState(); }; sw.appendChild(b); }); }
      if(menu && menu.classList.contains("on")) fillOpt();
    }
    function doUndo(){ if(!undo.length) return; redo.push(JSON.stringify(I.list)); restore(undo.pop()); }
    function doRedo(){ if(!redo.length) return; undo.push(JSON.stringify(I.list)); restore(redo.pop()); }
    document.addEventListener("keydown", function(e){
      if(!I.active || /INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName || "")) return;
      if((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "z" || e.key === "Z")){ e.preventDefault(); doUndo(); }
      else if((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y" || (e.shiftKey && (e.key === "z" || e.key === "Z")))){ e.preventDefault(); doRedo(); }
      else if(e.key === "Escape"){ if(cur) cancelCur(); closeMenu(); }
      else if(e.key === "Enter" && cur && cur.verts){ finishPoly(false); }
    });

    /* ── 붙이기(mount) · 쪽 바꾸기 ── */
    function mount(wrap, w, h){
      W = w; H = h; D = Math.min(2, window.devicePixelRatio || 1);
      if(!cv || cv.parentNode !== wrap){
        if(cv && cv.parentNode) cv.remove(); if(ov && ov.parentNode) ov.remove();
        cv = el("canvas", "tinkc"); ov = el("div", "tinkov"); wrap.appendChild(cv); wrap.appendChild(ov);
        cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move); cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
        cv.addEventListener("dblclick", function(){ if(cur && cur.verts) finishPoly(false); });
        tools.forEach(function(t){ t.el = null; }); if(curt){ var y = curt.y; curt = null; curtain(true); curt.y = y; curt.el.style.top = (y * 100) + "%"; }
        txtBox = null;
      }
      cv.width = Math.round(w * D); cv.height = Math.round(h * D); cv.style.width = w + "px"; cv.style.height = h + "px";
      cv.classList.toggle("on", I.active);
      tools.forEach(placeTool); draw();
    }
    I.mount = mount;
    I.renderBar = renderBar;
    I.setPage = function(arr){ I.list = arr || []; undo = []; redo = []; cur = null; letters = I.list.filter(function(x){ return x.t === "pt" && /^[A-Z]$/.test(x.l || ""); }).length; closeText(); draw(); barState(); };
    I.setActive = function(on){ I.active = !!on; if(cv) cv.classList.toggle("on", I.active); if(!on){ if(cur) cancelCur(); closeText(); closeMenu(); } };
    I.redraw = function(){ draw(); barState(); };
    I.canvas = function(){ return cv; };
    I.hideOverlays = function(){ curtain(false); tools.slice().forEach(function(t){ if(t.el) t.el.remove(); }); tools = []; barState(); };
    I.setTool = setTool;
    return I;
  }
  window.TTInk = {create: create, parseExpr: parseExpr, parseRange: parseRange};
})();
