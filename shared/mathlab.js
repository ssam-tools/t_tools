/* 🧪 수학 실험실 (PLAN_수업길 5단계) — window.TT_LAB
   인터넷 없이 전자칠판에서 바로 움직이는 작은 실험 5개. 수업 길 ④ 해 보기 · apps/mlab/ 에서 씁니다.
   TT_LAB.list → [{id, ic, n, d}] · TT_LAB.mount(엘리먼트, id) → 그 안에 실험을 그림
   · sieve 에라토스테네스의 체 · pyth 피타고라스 넓이 · qe 정사각형 완성·이차함수 그래프 · prob 동전·주사위 · scatter 산점도
   학생 이름 등 개인정보를 받지 않습니다(산점도는 숫자만).
   jidangmath가 Claude와 함께 제작 */
(function(){
  "use strict";
  if(window.TT_LAB) return;
  var LIST = [
    {id: "sieve", ic: "🧮", n: "에라토스테네스의 체", d: "1~100에서 배수를 지우면 소수만 남아요", g: 1},
    {id: "pyth", ic: "🟦", n: "피타고라스 넓이", d: "두 변을 바꾸며 세 정사각형 넓이 비교", g: 2},
    {id: "prob", ic: "🎲", n: "동전·주사위 던지기", d: "많이 던질수록 확률에 가까워져요", g: 2},
    {id: "qe", ic: "🟨", n: "정사각형 완성·이차함수", d: "x² + bx를 정사각형으로 · 그래프와 x축", g: 3},
    {id: "scatter", ic: "📈", n: "산점도", d: "두 자료를 점으로 · 상관관계 보기", g: 3},
    {id: "graph", ic: "📉", n: "빈 그래프판", d: "식을 넣으면 바로 그래프 (인터넷 없이)", g: 0}
  ];
  var CSS = ".tlab{display:flex;flex-direction:column;gap:10px;height:100%;min-height:0;font-size:16px}"
    + ".tlab .tb{display:flex;flex-wrap:wrap;gap:6px;align-items:center}"
    + ".tlab button.b{font:inherit;font-weight:800;border:2px solid #222;background:#fff;border-radius:12px;padding:6px 14px;cursor:pointer;color:#111}"
    + ".tlab button.b.on{background:#ffe066;border-color:#c99a00}"
    + ".tlab .say{font-size:clamp(16px,1.6vw,22px);font-weight:800;line-height:1.45}"
    + ".tlab .say b{color:#c2432a}"
    + ".tlab .grid{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;flex:1;min-height:0}"
    + ".tlab .grid button{font:inherit;font-weight:900;font-size:clamp(13px,1.5vw,22px);border:2px solid #ccd;border-radius:8px;background:#fff;cursor:pointer;color:#111;padding:0;min-height:30px}"
    + ".tlab .grid button.x{background:#eee;color:#bbb;border-color:#eee;text-decoration:line-through}"
    + ".tlab .grid button.p{background:#fff3c4;border-color:#e0a526}"
    + ".tlab .grid button.h{background:#c2432a;color:#fff;border-color:#c2432a}"
    + ".tlab label.r{display:flex;align-items:center;gap:8px;font-weight:800}"
    + ".tlab label.r input{flex:1;min-width:120px}"
    + ".tlab svg{width:100%;flex:1;min-height:200px;background:#fff;border:1px solid #e3e3e3;border-radius:12px}"
    + ".tlab textarea{font:inherit;font-size:15px;border:1.5px solid #ccd;border-radius:10px;padding:8px;min-height:70px}"
    + ".tlab .two{display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:1;min-height:0}"
    + "@media (max-width:800px){.tlab .two{grid-template-columns:1fr}}";
  function css(){ if(document.getElementById("tlabCss")) return; var s = document.createElement("style"); s.id = "tlabCss"; s.textContent = CSS; document.head.appendChild(s); }
  function el(h){ var d = document.createElement("div"); d.className = "tlab"; d.innerHTML = h; return d; }
  function fmt(n){ return String(n).replace("-", "−"); }

  /* 🧮 에라토스테네스의 체 */
  function sieve(root){
    var gone = {}, prime = {}, hl = 0;
    root.appendChild(el('<div class="tb"><span class="say" id="lsSay">1에 ×, 그다음 2부터 배수를 지워 보세요</span></div>'
      + '<div class="tb"><button class="b" data-p="1">1 지우기</button><button class="b" data-p="2">2의 배수</button><button class="b" data-p="3">3의 배수</button><button class="b" data-p="5">5의 배수</button><button class="b" data-p="7">7의 배수</button><button class="b" data-p="0">↺ 처음부터</button></div><div class="grid" id="lsG"></div>'));
    function draw(){
      var g = root.querySelector("#lsG"), h = "", left = 0;
      for(var i = 1; i <= 100; i++){ var c = gone[i] ? "x" : prime[i] ? "p" : ""; if(hl && i % hl === 0 && i !== hl && gone[i] === hl) c += " h"; if(!gone[i] && i > 1) left++; h += '<button class="' + c + '" data-n="' + i + '">' + i + "</button>"; }
      g.innerHTML = h;
      var done = gone[1] && [2, 3, 5, 7].every(function(p){ return prime[p]; });
      root.querySelector("#lsSay").innerHTML = done ? "남은 수 <b>" + left + "개</b>가 모두 소수예요! 100 안의 소수는 25개 · 왜 7까지만 지우면 될까요? (7 × 7 = 49, 11 × 11 = 121 > 100)" : "남은 수 " + left + "개 · 다음으로 남은 가장 작은 수의 배수를 지워 보세요";
    }
    root.addEventListener("click", function(e){
      var b = e.target.closest("button"); if(!b) return;
      if(b.dataset.p != null){ var p = +b.dataset.p;
        if(p === 0){ gone = {}; prime = {}; hl = 0; }
        else if(p === 1){ gone[1] = 1; }
        else { prime[p] = 1; hl = p; for(var k = p * 2; k <= 100; k += p) if(!gone[k]) gone[k] = p; }
        draw(); return; }
      if(b.dataset.n){ var n = +b.dataset.n; if(gone[n]) delete gone[n]; else gone[n] = -1; draw(); }
    });
    draw();
  }

  /* 🟦 피타고라스 넓이 */
  function pyth(root){
    root.appendChild(el('<div class="tb"><label class="r">a <input type="range" min="1" max="9" value="3" id="lpa"><b id="lpav">3</b></label><label class="r">b <input type="range" min="1" max="9" value="4" id="lpb"><b id="lpbv">4</b></label><label class="r" style="flex:0 0 auto"><input type="checkbox" id="lpr" checked> 직각</label></div>'
      + '<svg id="lpS" viewBox="0 0 400 300"></svg><div class="say" id="lpSay"></div>'));
    function draw(){
      var a = +root.querySelector("#lpa").value, b = +root.querySelector("#lpb").value, right = root.querySelector("#lpr").checked;
      root.querySelector("#lpav").textContent = a; root.querySelector("#lpbv").textContent = b;
      var ang = right ? Math.PI / 2 : Math.PI * 0.62, s = 200 / Math.max(a + b + 4, 12);
      var C = [150, 190], A = [C[0] + b * s, C[1]], B = [C[0] + a * s * Math.cos(ang), C[1] - a * s * Math.sin(ang)];  /* C: 직각(또는 둔각) 꼭짓점, CA = b, CB = a */
      var c2 = a * a + b * b - 2 * a * b * Math.cos(ang);
      function sq(P, Q, out, col, lab){ var dx = Q[0] - P[0], dy = Q[1] - P[1], nx = -dy, ny = dx; if(out < 0){ nx = dy; ny = -dx; }
        var R = [Q[0] + nx, Q[1] + ny], S2 = [P[0] + nx, P[1] + ny], cx = (P[0] + Q[0] + R[0] + S2[0]) / 4, cy = (P[1] + Q[1] + R[1] + S2[1]) / 4;
        return '<polygon points="' + [P, Q, R, S2].map(function(p){ return p.join(","); }).join(" ") + '" fill="' + col + '" fill-opacity=".35" stroke="' + col + '" stroke-width="2"/><text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" font-size="18" font-weight="900" fill="#222">' + lab + "</text>"; }
      var h = '<g transform="translate(0,0)">' + sq(C, A, 1, "#2f6fb5", "b² = " + b * b) + sq(B, C, 1, "#2d8a5b", "a² = " + a * a) + sq(A, B, 1, "#c2432a", "c² = " + (Math.round(c2 * 10) / 10)) + "</g>"
        + '<polygon points="' + [C, A, B].map(function(p){ return p.join(","); }).join(" ") + '" fill="#fff" stroke="#222" stroke-width="2.5"/>'
        + (right ? '<rect x="' + C[0] + '" y="' + (C[1] - 12) + '" width="12" height="12" fill="none" stroke="#222"/>' : "");
      var svg = root.querySelector("#lpS"); svg.innerHTML = h;
      var bb = svg.getBBox(); svg.setAttribute("viewBox", (bb.x - 10) + " " + (bb.y - 10) + " " + (bb.width + 20) + " " + (bb.height + 20));
      root.querySelector("#lpSay").innerHTML = right ? "a² + b² = " + a * a + " + " + b * b + " = <b>" + (a * a + b * b) + "</b> = c² · 직각이면 언제나 같아요" : "직각이 아니면? a² + b² = " + (a * a + b * b) + " ≠ c² = " + (Math.round(c2 * 10) / 10) + " · 둔각이면 c²이 더 커져요";
    }
    root.addEventListener("input", draw);
    draw();
  }

  /* 🟨 정사각형 완성 · 이차함수 */
  function qe(root){
    root.appendChild(el('<div class="tb"><button class="b on" data-t="sq">정사각형 완성</button><button class="b" data-t="gr">이차함수 그래프</button></div><div id="lqB" style="display:flex;flex-direction:column;gap:8px;flex:1;min-height:0"></div>'));
    var tab = "sq";
    function sq(){
      var B = root.querySelector("#lqB");
      B.innerHTML = '<div class="tb"><label class="r">x² + <input type="range" min="2" max="12" step="2" value="10" id="lqb"> <b id="lqbv">10</b>x = <input type="range" min="0" max="60" value="39" id="lqk"> <b id="lqkv">39</b></label><label class="r" style="flex:0 0 auto"><input type="checkbox" id="lqf"> 모서리 채우기</label></div><svg id="lqS" viewBox="0 0 400 300"></svg><div class="say" id="lqSay"></div>';
      function d(){
        var b = +B.querySelector("#lqb").value, k = +B.querySelector("#lqk").value, f = B.querySelector("#lqf").checked, h2 = b / 2;
        B.querySelector("#lqbv").textContent = b; B.querySelector("#lqkv").textContent = k;
        var x = (-b + Math.sqrt(b * b + 4 * k)) / 2, U = 240 / (x + h2 || 1), X = x * U, H = h2 * U, o = 30;
        var s = '<rect x="' + o + '" y="' + o + '" width="' + X + '" height="' + X + '" fill="#2f6fb5" fill-opacity=".3" stroke="#2f6fb5" stroke-width="2"/><text x="' + (o + X / 2) + '" y="' + (o + X / 2 + 6) + '" text-anchor="middle" font-size="20" font-weight="900">x²</text>'
          + '<rect x="' + (o + X) + '" y="' + o + '" width="' + H + '" height="' + X + '" fill="#2d8a5b" fill-opacity=".3" stroke="#2d8a5b" stroke-width="2"/><text x="' + (o + X + H / 2) + '" y="' + (o + X / 2 + 6) + '" text-anchor="middle" font-size="16" font-weight="900">' + h2 + "x</text>"
          + '<rect x="' + o + '" y="' + (o + X) + '" width="' + X + '" height="' + H + '" fill="#2d8a5b" fill-opacity=".3" stroke="#2d8a5b" stroke-width="2"/><text x="' + (o + X / 2) + '" y="' + (o + X + H / 2 + 6) + '" text-anchor="middle" font-size="16" font-weight="900">' + h2 + "x</text>"
          + '<rect x="' + (o + X) + '" y="' + (o + X) + '" width="' + H + '" height="' + H + '" fill="' + (f ? "#e0a526" : "#fff") + '" fill-opacity="' + (f ? ".55" : "1") + '" stroke="#e0a526" stroke-width="2" stroke-dasharray="' + (f ? "0" : "6 4") + '"/><text x="' + (o + X + H / 2) + '" y="' + (o + X + H / 2 + 6) + '" text-anchor="middle" font-size="14" font-weight="900">' + (f ? h2 * h2 : "?") + "</text>"
          + '<text x="' + (o + X / 2) + '" y="' + (o - 8) + '" text-anchor="middle" font-size="14">x</text><text x="' + (o + X + H / 2) + '" y="' + (o - 8) + '" text-anchor="middle" font-size="14">' + h2 + "</text>";
        B.querySelector("#lqS").innerHTML = s;
        var r = Math.round(x * 100) / 100, big = k + h2 * h2, rt = Math.sqrt(big), nice = Math.abs(rt - Math.round(rt)) < 1e-9;
        B.querySelector("#lqSay").innerHTML = f ? "넓이 " + k + " + " + h2 * h2 + " = <b>" + big + "</b> → 큰 정사각형 한 변 " + (nice ? Math.round(rt) : "√" + big) + " → (x + " + h2 + ")² = " + big + " → x = <b>" + (nice ? Math.round(rt) - h2 : r) + "</b>" + (nice ? " (또 하나의 해 " + fmt(-Math.round(rt) - h2) + "은 길이가 될 수 없어 그림에는 없어요)" : "")
          : "x² + " + b + "x = " + k + " · 빈 모서리를 채우면 큰 정사각형이 돼요. 넓이는 얼마일까요?";
      }
      B.oninput = d; d();
    }
    function gr(){
      var B = root.querySelector("#lqB");
      B.innerHTML = '<div class="tb"><label class="r">a <input type="range" min="-3" max="3" step="0.5" value="1" id="lga"><b id="lgav">1</b></label><label class="r">b <input type="range" min="-10" max="10" value="-2" id="lgb"><b id="lgbv">−2</b></label><label class="r">c <input type="range" min="-10" max="10" value="-3" id="lgc"><b id="lgcv">−3</b></label></div><svg id="lgS" viewBox="-10 -10 20 20" preserveAspectRatio="xMidYMid meet"></svg><div class="say" id="lgSay"></div>';
      function d(){
        var a = +B.querySelector("#lga").value || 0.5, b = +B.querySelector("#lgb").value, c = +B.querySelector("#lgc").value;
        if(+B.querySelector("#lga").value === 0) a = 0.5;
        B.querySelector("#lgav").textContent = fmt(a); B.querySelector("#lgbv").textContent = fmt(b); B.querySelector("#lgcv").textContent = fmt(c);
        var pts = [], D = b * b - 4 * a * c;
        for(var x = -10; x <= 10.001; x += 0.1){ var y = a * x * x + b * x + c; if(Math.abs(y) < 30) pts.push(x.toFixed(2) + "," + (-y).toFixed(2)); }
        var s = "";
        for(var i = -10; i <= 10; i += 2) s += '<line x1="' + i + '" y1="-10" x2="' + i + '" y2="10" stroke="#eee" stroke-width=".05"/><line x1="-10" y1="' + i + '" x2="10" y2="' + i + '" stroke="#eee" stroke-width=".05"/>';
        s += '<line x1="-10" y1="0" x2="10" y2="0" stroke="#333" stroke-width=".08"/><line x1="0" y1="-10" x2="0" y2="10" stroke="#333" stroke-width=".08"/>';
        s += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="#c2432a" stroke-width=".18"/>';
        var roots = D > 0 ? [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)] : D === 0 ? [-b / (2 * a)] : [];
        roots.forEach(function(r){ s += '<circle cx="' + r + '" cy="0" r=".3" fill="#2f6fb5"/>'; });
        B.querySelector("#lgS").innerHTML = s;
        var R = function(v){ return fmt(Math.round(v * 100) / 100); };
        B.querySelector("#lgSay").innerHTML = "y = " + fmt(a) + "x² " + (b < 0 ? "− " + -b : "+ " + b) + "x " + (c < 0 ? "− " + -c : "+ " + c) + " · 판별식 b² − 4ac = <b>" + R(D) + "</b> → "
          + (D > 0 ? "x축과 <b>두 점</b>에서 만나요 (x = " + roots.map(R).join(", ") + ")" : D === 0 ? "x축에 <b>접해요</b> (x = " + R(roots[0]) + ")" : "x축과 <b>만나지 않아요</b>");
      }
      B.oninput = d; d();
    }
    root.addEventListener("click", function(e){ var b = e.target.closest("[data-t]"); if(!b) return; tab = b.dataset.t; [].forEach.call(root.querySelectorAll("[data-t]"), function(x){ x.classList.toggle("on", x.dataset.t === tab); }); (tab === "sq" ? sq : gr)(); });
    sq();
  }

  /* 🎲 동전·주사위 */
  function prob(root){
    var kind = "dice", cnt = [];
    root.appendChild(el('<div class="tb"><button class="b on" data-k="dice">🎲 주사위</button><button class="b" data-k="coin">🪙 동전</button><span style="flex:1"></span><button class="b" data-n="1">1번</button><button class="b" data-n="10">10번</button><button class="b" data-n="100">100번</button><button class="b" data-n="1000">1000번</button><button class="b" data-n="0">↺</button></div><svg id="lrS" viewBox="0 0 400 220"></svg><div class="say" id="lrSay"></div>'));
    function reset(){ cnt = kind === "dice" ? [0, 0, 0, 0, 0, 0] : [0, 0]; }
    function draw(){
      var n = cnt.reduce(function(s, v){ return s + v; }, 0), k = cnt.length, p = 1 / k, w = 360 / k, s = "", lab = kind === "dice" ? ["1", "2", "3", "4", "5", "6"] : ["앞", "뒤"];
      var py = 190 - p * 300;
      cnt.forEach(function(v, i){ var r = n ? v / n : 0, h = Math.min(r, 0.6) * 300; s += '<rect x="' + (25 + i * w + w * 0.15) + '" y="' + (190 - h) + '" width="' + (w * 0.7) + '" height="' + h + '" fill="#2f6fb5" fill-opacity=".75" rx="4"/><text x="' + (25 + i * w + w / 2) + '" y="208" text-anchor="middle" font-size="14" font-weight="900">' + lab[i] + '</text><text x="' + (25 + i * w + w / 2) + '" y="' + (184 - h) + '" text-anchor="middle" font-size="12">' + (n ? (Math.round(r * 1000) / 10) + "%" : "") + "</text>"; });
      s += '<line x1="20" y1="' + py + '" x2="390" y2="' + py + '" stroke="#c2432a" stroke-width="2" stroke-dasharray="6 4"/><text x="388" y="' + (py - 6) + '" text-anchor="end" font-size="12" fill="#c2432a">확률 ' + (kind === "dice" ? "1/6 ≈ 16.7%" : "1/2 = 50%") + "</text>";
      root.querySelector("#lrS").innerHTML = s;
      root.querySelector("#lrSay").innerHTML = n ? "모두 <b>" + n + "번</b> 던졌어요 · 많이 던질수록 막대가 빨간 선(확률)에 가까워질까요?" : "먼저 예상해 보세요: 주사위를 6번 던지면 1이 꼭 한 번 나올까요?";
    }
    root.addEventListener("click", function(e){
      var b = e.target.closest("button"); if(!b) return;
      if(b.dataset.k){ kind = b.dataset.k; [].forEach.call(root.querySelectorAll("[data-k]"), function(x){ x.classList.toggle("on", x.dataset.k === kind); }); reset(); draw(); return; }
      if(b.dataset.n != null){ var n = +b.dataset.n; if(!n) reset(); else for(var i = 0; i < n; i++) cnt[Math.floor(Math.random() * cnt.length)]++; draw(); }
    });
    reset(); draw();
  }

  /* 📈 산점도 */
  function scatter(root){
    var SAMPLE = "150 42\n155 47\n160 50\n162 55\n165 53\n168 60\n170 58\n172 65\n175 63\n178 70";
    root.appendChild(el('<div class="two"><div style="display:flex;flex-direction:column;gap:8px"><div class="say" style="font-size:16px">한 줄에 두 수씩 (예: 키 몸무게) · 이름은 쓰지 않아요</div><textarea id="lcT">' + SAMPLE + '</textarea><div class="tb"><button class="b" data-s="1">예시 자료</button><button class="b" data-s="2">반대 경향 예시</button><button class="b" data-s="3">관계없음 예시</button></div><div class="say" id="lcSay"></div></div><svg id="lcS" viewBox="0 0 300 300"></svg></div>'));
    function draw(){
      var P = []; root.querySelector("#lcT").value.split("\n").forEach(function(l){ var m = l.trim().split(/[\s,\t]+/).map(Number); if(m.length >= 2 && isFinite(m[0]) && isFinite(m[1])) P.push(m); });
      var svg = root.querySelector("#lcS");
      if(P.length < 2){ svg.innerHTML = ""; root.querySelector("#lcSay").textContent = "두 수가 있는 줄이 2개 이상 필요해요"; return; }
      var xs = P.map(function(p){ return p[0]; }), ys = P.map(function(p){ return p[1]; }), x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
      var X = function(v){ return 30 + (x1 === x0 ? 120 : (v - x0) / (x1 - x0) * 250); }, Y = function(v){ return 270 - (y1 === y0 ? 120 : (v - y0) / (y1 - y0) * 250); };
      var s = '<line x1="25" y1="275" x2="290" y2="275" stroke="#333"/><line x1="25" y1="275" x2="25" y2="10" stroke="#333"/>';
      P.forEach(function(p){ s += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="6" fill="#2f6fb5" fill-opacity=".8"/>'; });
      svg.innerHTML = s;
      var n = P.length, mx = xs.reduce(function(a, b){ return a + b; }, 0) / n, my = ys.reduce(function(a, b){ return a + b; }, 0) / n, sxy = 0, sxx = 0, syy = 0;
      P.forEach(function(p){ sxy += (p[0] - mx) * (p[1] - my); sxx += (p[0] - mx) * (p[0] - mx); syy += (p[1] - my) * (p[1] - my); });
      var r = sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
      root.querySelector("#lcSay").innerHTML = "점 " + n + "개 · " + (r > 0.5 ? "<b>양의 상관관계</b> (한쪽이 커지면 다른 쪽도 커지는 경향)" : r < -0.5 ? "<b>음의 상관관계</b> (한쪽이 커지면 다른 쪽은 작아지는 경향)" : "<b>상관관계가 거의 없어요</b>");
    }
    root.addEventListener("input", draw);
    root.addEventListener("click", function(e){ var b = e.target.closest("[data-s]"); if(!b) return; var t = {1: SAMPLE, 2: "1 95\n2 90\n3 86\n4 80\n5 77\n6 70\n7 66\n8 60", 3: "3 70\n8 72\n1 50\n6 90\n4 60\n9 55\n2 85\n7 65"}[b.dataset.s]; root.querySelector("#lcT").value = t; draw(); });
    draw();
  }

  /* 📉 빈 그래프판 — 식 3개까지. 쓸 수 있는 것: 숫자 x + − × ÷ ^ ( ) sqrt abs sin cos tan pi (그 밖의 글자는 받지 않음) */
  function graph(root){
    root.appendChild(el('<div class="tb"><label class="r" style="flex:1 1 200px">y = <input id="lg0" value="2x + 1" style="font:inherit;flex:1;border:1.5px solid #ccd;border-radius:8px;padding:4px 8px"></label><label class="r" style="flex:1 1 200px">y = <input id="lg1" value="x^2 - 3" style="font:inherit;flex:1;border:1.5px solid #ccd;border-radius:8px;padding:4px 8px"></label><label class="r" style="flex:1 1 200px">y = <input id="lg2" value="" placeholder="(비워도 돼요)" style="font:inherit;flex:1;border:1.5px solid #ccd;border-radius:8px;padding:4px 8px"></label></div>'
      + '<div class="tb"><button class="b" data-z="0.5">＋ 확대</button><button class="b" data-z="2">－ 축소</button><span class="say" id="lgSay" style="font-size:14px"></span></div><svg id="lgP" viewBox="-10 -10 20 20" preserveAspectRatio="xMidYMid meet"></svg>'));
    var R = 10, COL = ["#c2432a", "#2f6fb5", "#2d8a5b"];
    function comp(s){                      /* 작은 수식 해석기 (eval 없이) → x를 넣으면 값이 나오는 함수 */
      s = String(s || "").replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/π/g, "pi").toLowerCase();
      if(!s) return null;
      if(!/^([0-9x.+\-*/^()]|sqrt|abs|sin|cos|tan|pi)+$/.test(s)) throw new Error("x와 숫자, + − × ÷ ^ ( ), sqrt abs sin cos tan pi만 쓸 수 있어요");
      s = s.replace(/(\d|x|\)|pi)(?=(x|\(|sqrt|abs|sin|cos|tan|pi|\d))/g, function(m0, a1, a2, off, str){ return /\d/.test(a1) && /\d/.test(str.charAt(off + a1.length)) ? a1 : a1 + "*"; });
      var i = 0;
      function peek(){ return s.charAt(i); }
      function eat(c){ if(s.charAt(i) === c){ i++; return true; } return false; }
      function expr(){ var f = term(); for(;;){ if(eat("+")){ var a = f, b = term(); f = function(x){ return a(x) + b(x); }; } else if(eat("-")){ var a2 = f, b2 = term(); f = function(x){ return a2(x) - b2(x); }; } else return f; } }
      function term(){ var f = unary(); for(;;){ if(eat("*")){ var a = f, b = unary(); f = function(x){ return a(x) * b(x); }; } else if(eat("/")){ var a2 = f, b2 = unary(); f = function(x){ return a2(x) / b2(x); }; } else return f; } }
      function unary(){ if(eat("-")){ var f = unary(); return function(x){ return -f(x); }; } if(eat("+")) return unary(); return power(); }
      function power(){ var f = atom(); if(eat("^")){ var g = unary(); return function(x){ return Math.pow(f(x), g(x)); }; } return f; }
      function atom(){
        var m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/); if(m){ i += m[0].length; var v = +m[0]; return function(){ return v; }; }
        if(eat("x")) return function(x){ return x; };
        if(s.substr(i, 2) === "pi"){ i += 2; return function(){ return Math.PI; }; }
        var fn = s.slice(i).match(/^(sqrt|abs|sin|cos|tan)/); if(fn){ i += fn[0].length; var F2 = Math[fn[0]]; if(!eat("(")) throw new Error(fn[0] + " 뒤에는 ( )가 필요해요"); var g = expr(); if(!eat(")")) throw new Error("괄호를 닫아 주세요"); return function(x){ return F2(g(x)); }; }
        if(eat("(")){ var e = expr(); if(!eat(")")) throw new Error("괄호를 닫아 주세요"); return e; }
        throw new Error("식을 읽을 수 없어요 (" + (peek() || "끝") + ")");
      }
      var out = expr(); if(i < s.length) throw new Error("식을 읽을 수 없어요 (" + s.charAt(i) + ")");
      return out;
    }
    function draw(){
      var s = "", msg = [], g = R / 5;
      for(var i = -R; i <= R; i += g) s += '<line x1="' + i + '" y1="' + -R + '" x2="' + i + '" y2="' + R + '" stroke="#eee" stroke-width="' + R / 200 + '"/><line x1="' + -R + '" y1="' + i + '" x2="' + R + '" y2="' + i + '" stroke="#eee" stroke-width="' + R / 200 + '"/>';
      s += '<line x1="' + -R + '" y1="0" x2="' + R + '" y2="0" stroke="#333" stroke-width="' + R / 120 + '"/><line x1="0" y1="' + -R + '" x2="0" y2="' + R + '" stroke="#333" stroke-width="' + R / 120 + '"/>';
      for(var k = 0; k < 3; k++){
        var f; try{ f = comp(root.querySelector("#lg" + k).value); }catch(e){ msg.push(e.message); continue; }
        if(!f) continue;
        var seg = [], pts = [];
        for(var x = -R; x <= R + 1e-9; x += R / 200){ var y; try{ y = f(x); }catch(e2){ y = NaN; } if(isFinite(y) && Math.abs(y) < R * 4){ pts.push(x.toFixed(3) + "," + (-y).toFixed(3)); } else if(pts.length){ seg.push(pts); pts = []; } }
        if(pts.length) seg.push(pts);
        seg.forEach(function(p){ if(p.length > 1) s += '<polyline points="' + p.join(" ") + '" fill="none" stroke="' + COL[k] + '" stroke-width="' + R / 60 + '"/>'; });
      }
      var svg = root.querySelector("#lgP"); svg.setAttribute("viewBox", -R + " " + -R + " " + 2 * R + " " + 2 * R); svg.innerHTML = s;
      root.querySelector("#lgSay").textContent = msg.length ? "⚠️ " + msg[0] : "보이는 범위 −" + R + " ~ " + R + " · 빨강·파랑·초록 순서";
    }
    root.addEventListener("input", draw);
    root.addEventListener("click", function(e){ var b = e.target.closest("[data-z]"); if(!b) return; R = Math.max(1, Math.min(100, R * +b.dataset.z)); draw(); });
    draw();
  }

  var F = {sieve: sieve, pyth: pyth, qe: qe, prob: prob, scatter: scatter, graph: graph};
  window.TT_LAB = {
    list: LIST,
    mount: function(host, id){ css(); host.innerHTML = ""; if(!F[id]){ host.textContent = "이 실험은 아직 없어요"; return; } var w = document.createElement("div"); w.style.cssText = "height:100%;display:flex;flex-direction:column;min-height:0"; host.appendChild(w); F[id](w); }
  };
})();
