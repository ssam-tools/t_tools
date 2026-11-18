/* 수학 문항 생성 엔진 (MG) — 계산형 문항을 숫자만 바꿔 만들고 정답을 함께 냅니다.
   · 같은 씨앗(seed)이면 언제 만들어도 같은 문제 → 학습지를 다시 인쇄하거나 정답지를 맞출 수 있음
   · 학생별 다른 숫자: 씨앗 + 번호
   · 유형 id는 형성평가·보충 학습지가 함께 씁니다(틀린 유형만 다시 만들기)
   문항: {q: 문제(HTML), a: 정답(HTML), t: 정답(글자)} */
var MG = (function(){
  "use strict";
  /* 씨앗 있는 난수 */
  function hash(s){ var h = 1779033703 ^ s.length; for(var i = 0; i < s.length; i++){ h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return h >>> 0; }
  function rng(seed){ var a = hash(String(seed)); return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function ri(R, a, b){ return a + Math.floor(R() * (b - a + 1)); }
  function nz(R, a, b){ var x = 0, g = 0; while(x === 0 && g++ < 50) x = ri(R, a, b); return x || 1; }
  function pick(R, arr){ return arr[Math.floor(R() * arr.length)]; }
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = a % b; a = b; b = t; } return a; }
  /* 글자 꾸미기 */
  function sup(x, n){ return n === 1 ? x : x + "<sup>" + n + "</sup>"; }
  function supT(x, n){ return n === 1 ? x : x + "^" + n; }
  function par(n){ return n < 0 ? "(" + n.toString().replace("-", "−") + ")" : String(n); }
  function sg(n){ return String(n).replace("-", "−"); }
  function rt(n){ return '√<span style="text-decoration:overline">' + n + "</span>"; }
  /* 다항식: cs = [최고차 계수, …, 상수], 문자 v */
  function poly(cs, v, txt){
    var deg = cs.length - 1, out = "";
    cs.forEach(function(c, i){
      var p = deg - i; if(!c) return;
      var abs = Math.abs(c), term = p === 0 ? String(abs) : (abs === 1 ? "" : abs) + (p === 1 ? v : (txt ? supT(v, p) : sup(v, p)));
      out += (out ? (c < 0 ? " − " : " + ") : (c < 0 ? "−" : "")) + term;
    });
    return out || "0";
  }
  /* √n = k√m 꼴: [k, m] */
  function simp(n){ var k = 1, m = n; for(var f = 2; f * f <= m; f++) while(m % (f * f) === 0){ m /= f * f; k *= f; } return [k, m]; }
  function rtk(s){ return s[1] === 1 ? String(s[0]) : (s[0] === 1 ? "" : s[0]) + rt(s[1]); }
  function rtkT(s){ return s[1] === 1 ? String(s[0]) : (s[0] === 1 ? "" : s[0]) + "√" + s[1]; }
  function frac(n, d){ if(d < 0){ n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? sg(n) : (n < 0 ? "−" : "") + Math.abs(n) + "/" + d; }

  var T = [
    {id: "prime", g: 1, unit: "소인수분해", n: "소인수분해", f: function(R, lv){
      var ps = lv === 1 ? [2, 3, 5] : [2, 3, 5, 7], e = {}, n = 1, k = lv === 3 ? 3 : 2, g = 0, cap = lv === 1 ? 200 : lv === 2 ? 600 : 1500;
      while(Object.keys(e).length < k && g++ < 40){ var p = pick(R, ps); if(!e[p]){ var x = ri(R, 1, lv === 1 ? 2 : 3); if(n * Math.pow(p, x) > cap) x = 1; if(n * p > cap) continue; e[p] = x; n *= Math.pow(p, x); } }
      var keys = Object.keys(e).map(Number).sort(function(a, b){ return a - b; });
      return {q: n + "을(를) 소인수분해하시오.", a: keys.map(function(p){ return sup(p, e[p]); }).join(" × "), t: keys.map(function(p){ return supT(p, e[p]); }).join("×")};
    }},
    {id: "gcd", g: 1, unit: "최대공약수와 최소공배수", n: "최대공약수·최소공배수", f: function(R, lv){
      var c = pick(R, lv === 1 ? [2, 3, 4, 5] : [2, 3, 4, 5, 6, 7]), a = c * ri(R, 2, lv === 1 ? 5 : 9), b = c * ri(R, 2, lv === 1 ? 5 : 9), g0 = 0;
      while((a === b || gcd(a, b) !== c && lv === 1) && g0++ < 30){ a = c * ri(R, 2, 5); b = c * ri(R, 2, 5); }
      if(lv === 3){ var d = c * ri(R, 2, 7), G3 = gcd(gcd(a, b), d), L3 = a * b / gcd(a, b); L3 = L3 * d / gcd(L3, d); return {q: a + ", " + b + ", " + d + "의 최대공약수와 최소공배수를 구하시오.", a: "최대공약수 " + G3 + ", 최소공배수 " + L3, t: G3 + ", " + L3}; }
      var G = gcd(a, b), L = a * b / G;
      return {q: a + "와(과) " + b + "의 최대공약수와 최소공배수를 구하시오.", a: "최대공약수 " + G + ", 최소공배수 " + L, t: G + ", " + L};
    }},
    {id: "int", g: 1, unit: "정수와 유리수의 계산", n: "정수 계산", f: function(R, lv){
      if(lv === 1){ var a = nz(R, -9, 9), b = nz(R, -9, 9), c = nz(R, -9, 9), o1 = pick(R, ["+", "−"]), o2 = pick(R, ["+", "−"]); var v = (o1 === "+" ? a + b : a - b); v = o2 === "+" ? v + c : v - c; return {q: par(a) + " " + o1 + " " + par(b) + " " + o2 + " " + par(c) + " 을(를) 계산하시오.", a: sg(v), t: sg(v)}; }
      if(lv === 2){ var a2 = nz(R, -15, 15), b2 = nz(R, -9, 9), c2 = nz(R, -9, 9), o = pick(R, ["+", "−"]), v2 = o === "+" ? a2 + b2 * c2 : a2 - b2 * c2; return {q: par(a2) + " " + o + " " + par(b2) + " × " + par(c2) + " 을(를) 계산하시오.", a: sg(v2), t: sg(v2)}; }
      var d = nz(R, -6, 6), k = nz(R, -9, 9), b3 = nz(R, -8, 8), c3 = nz(R, -6, 6), a3 = k * d - b3 * c3, e = nz(R, -9, 9), v3 = k - e;
      return {q: "{" + par(a3) + " + " + par(b3) + " × " + par(c3) + "} ÷ " + par(d) + " − " + par(e) + " 을(를) 계산하시오.", a: sg(v3), t: sg(v3)};
    }},
    {id: "frac", g: 1, unit: "정수와 유리수의 계산", n: "분수 덧셈·뺄셈", f: function(R, lv){
      var d1 = ri(R, 2, lv === 1 ? 6 : 9), d2 = ri(R, 2, lv === 1 ? 6 : 9), n1 = lv === 1 ? ri(R, 1, 5) : nz(R, -8, 8), n2 = lv === 1 ? ri(R, 1, 5) : nz(R, -8, 8), o = pick(R, ["+", "−"]), g1 = 0;
      while((n1 % d1 === 0 || n2 % d2 === 0) && g1++ < 40){ n1 = nz(R, 1, 8); n2 = nz(R, 1, 8); }      // 정수가 되는 분수는 피함
      var n = o === "+" ? n1 * d2 + n2 * d1 : n1 * d2 - n2 * d1, d = d1 * d2;
      if(lv === 3){ var d3 = ri(R, 2, 9), n3 = nz(R, -8, 8), o2 = pick(R, ["+", "−"]), N = o2 === "+" ? n * d3 + n3 * d : n * d3 - n3 * d, D = d * d3; return {q: "(" + frac(n1, d1) + ") " + o + " (" + frac(n2, d2) + ") " + o2 + " (" + frac(n3, d3) + ") 을(를) 계산하시오.", a: frac(N, D), t: frac(N, D)}; }
      return {q: "(" + frac(n1, d1) + ") " + o + " (" + frac(n2, d2) + ") 을(를) 계산하시오.", a: frac(n, d), t: frac(n, d)};
    }},
    {id: "lin", g: 1, unit: "일차방정식", n: "일차방정식", f: function(R, lv){
      var x = nz(R, -9, 9), a = nz(R, -6, 6), c = lv === 1 ? 0 : nz(R, -6, 6), g0 = 0; while(a === c && g0++ < 20) c = nz(R, -6, 6);
      var b = ri(R, -12, 12), d = (a - c) * x + b;
      if(lv === 3){ function dc(n){ return sg((n / 10).toString()); } function pd(A, B){ return (A === 10 ? "" : A === -10 ? "−" : dc(A)) + "x" + (B ? (B < 0 ? " − " : " + ") + (Math.abs(B) / 10) : ""); }
        return {q: "일차방정식 " + pd(a, b) + " = " + pd(c, d) + " 을(를) 푸시오.", a: "x = " + sg(x), t: "x=" + sg(x)}; }   /* 소수 계수 (모두 10으로 나눔) */
      return {q: "일차방정식 " + poly([a, b], "x") + " = " + poly([c, d], "x") + " 을(를) 푸시오.", a: "x = " + sg(x), t: "x=" + sg(x)};
    }},
    {id: "sys", g: 2, unit: "연립일차방정식", n: "연립방정식", f: function(R, lv){
      var M = lv === 3 ? 9 : 6, x = nz(R, -M, M), y = nz(R, -M, M), C = lv === 3 ? 9 : 5, a1 = nz(R, -C, C), b1 = nz(R, -C, C), a2 = nz(R, -C, C), b2 = nz(R, -C, C), g0 = 0;
      if(lv === 1){ a1 = 1; b1 = pick(R, [1, -1]); a2 = ri(R, 1, 3); b2 = nz(R, -3, 3); }
      while(a1 * b2 - a2 * b1 === 0 && g0++ < 30){ a2 = nz(R, -C, C); b2 = nz(R, -C, C); }
      function side(a, b){ return poly([a, 0], "x").replace(/ − 0| \+ 0/, "") + (b < 0 ? " − " : " + ") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "y"; }
      return {q: "연립방정식 { " + side(a1, b1) + " = " + sg(a1 * x + b1 * y) + " , " + side(a2, b2) + " = " + sg(a2 * x + b2 * y) + " } 을(를) 푸시오.", a: "x = " + sg(x) + ", y = " + sg(y), t: "x=" + sg(x) + ",y=" + sg(y)};
    }},
    {id: "slope", g: 2, unit: "일차함수", n: "일차함수의 식 구하기", f: function(R, lv){
      var m = nz(R, -4, 4), k = ri(R, -8, 8), x1 = ri(R, -5, 0), x2 = x1 + ri(R, 1, 4);
      if(lv === 1) return {q: "기울기가 " + sg(m) + " 이고 점 (" + sg(x1) + ", " + sg(m * x1 + k) + ")을 지나는 일차함수의 식을 구하시오.", a: "y = " + poly([m, k], "x"), t: "y=" + poly([m, k], "x", true)};
      if(lv === 2) return {q: "두 점 (" + sg(x1) + ", " + sg(m * x1 + k) + "), (" + sg(x2) + ", " + sg(m * x2 + k) + ")을 지나는 일차함수의 식을 구하시오.", a: "y = " + poly([m, k], "x"), t: "y=" + poly([m, k], "x", true)};
      var p = nz(R, -6, 6), q = nz(R, -6, 6), A = "y = " + (frac(-q, p) === "1" ? "" : frac(-q, p) === "−1" ? "−" : frac(-q, p)) + "x" + (q < 0 ? " − " + (-q) : " + " + q);
      return {q: "x절편이 " + sg(p) + ", y절편이 " + sg(q) + " 인 직선을 그래프로 하는 일차함수의 식을 구하시오.", a: A, t: A.replace(/ /g, "")};
    }},
    {id: "expand", g: 3, unit: "다항식의 곱셈", n: "곱셈 공식 전개", f: function(R, lv){
      var a = lv === 1 ? 1 : nz(R, -3, 3), b = nz(R, -9, 9), c = lv === 1 ? 1 : nz(R, -3, 3), d = nz(R, -9, 9);
      if(lv === 3){ var p = nz(R, -4, 4), q = nz(R, -6, 6), u = ri(R, 1, 3), w = nz(R, -6, 6), r3 = [p * p - u * u, 2 * p * q, q * q + w * w];
        return {q: "(" + poly([p, q], "x") + ")<sup>2</sup> − (" + poly([u, w], "x") + ")(" + poly([u, -w], "x") + ") 을(를) 간단히 하시오.", a: poly(r3, "x"), t: poly(r3, "x", true)}; }
      var r = [a * c, a * d + b * c, b * d];
      return {q: "(" + poly([a, b], "x") + ")(" + poly([c, d], "x") + ") 을(를) 전개하시오.", a: poly(r, "x"), t: poly(r, "x", true)};
    }},
    {id: "factor", g: 3, unit: "인수분해", n: "인수분해", f: function(R, lv){
      if(lv === 3){ if(R() < .5){ var p = ri(R, 2, 9), q = ri(R, 1, 9); while(gcd(p, q) > 1) q = ri(R, 1, 9); return {q: poly([p * p, 0, -q * q], "x") + " 을(를) 인수분해하시오.", a: "(" + poly([p, q], "x") + ")(" + poly([p, -q], "x") + ")", t: "(" + poly([p, q], "x", true) + ")(" + poly([p, -q], "x", true) + ")"}; }
        var k = ri(R, 2, 4), s1 = nz(R, -6, 6), s2 = nz(R, -6, 6); return {q: poly([k, k * (s1 + s2), k * s1 * s2], "x") + " 을(를) 인수분해하시오.", a: k + "(" + poly([1, s1], "x") + ")(" + poly([1, s2], "x") + ")", t: k + "(" + poly([1, s1], "x", true) + ")(" + poly([1, s2], "x", true) + ")"}; }
      var r1 = lv === 1 ? ri(R, 1, 6) : nz(R, -9, 9), r2 = lv === 1 ? ri(R, 1, 6) : nz(R, -9, 9);
      if(r1 === r2) return {q: poly([1, 2 * r1, r1 * r1], "x") + " 을(를) 인수분해하시오.", a: "(" + poly([1, r1], "x") + ")<sup>2</sup>", t: "(" + poly([1, r1], "x", true) + ")^2"};
      return {q: poly([1, r1 + r2, r1 * r2], "x") + " 을(를) 인수분해하시오.", a: "(" + poly([1, r1], "x") + ")(" + poly([1, r2], "x") + ")", t: "(" + poly([1, r1], "x", true) + ")(" + poly([1, r2], "x", true) + ")"};
    }},
    {id: "sqrt", g: 3, unit: "제곱근과 실수", n: "근호 간단히·덧셈·뺄셈", f: function(R, lv){
      var m = pick(R, [2, 3, 5, 6, 7]), k = ri(R, 2, lv === 1 ? 4 : 7);
      if(lv === 1) return {q: rt(k * k * m) + " 을(를) a√b 꼴로 나타내시오.", a: k + rt(m), t: k + "√" + m};
      var k2 = ri(R, 2, 5), g9 = 0; while(k2 === k && g9++ < 9) k2 = ri(R, 2, 5);
      if(lv === 2){ var s = k + k2; return {q: rt(k * k * m) + " + " + rt(k2 * k2 * m) + " 을(를) 간단히 하시오.", a: s + rt(m), t: s + "√" + m}; }
      var k3 = ri(R, 2, 6), c = ri(R, 2, 3), v = k - c * k2 + k3, A = v === 0 ? "0" : (v === 1 ? "" : v === -1 ? "−" : sg(v)) + rt(m);
      return {q: rt(k * k * m) + " − " + c + rt(k2 * k2 * m) + " + " + rt(k3 * k3 * m) + " 을(를) 간단히 하시오.", a: A, t: A.replace(/<[^>]+>/g, "")};
    }},
    {id: "quad", g: 3, unit: "이차방정식", n: "이차방정식 (인수분해)", f: function(R, lv){
      var r1 = lv === 1 ? ri(R, 1, 7) : nz(R, -9, 9), r2 = lv === 1 ? ri(R, 1, 7) : nz(R, -9, 9), a = lv === 3 ? ri(R, 2, 3) : 1;
      var cs = [a, -a * (r1 + r2), a * r1 * r2], lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      if(lv === 3 && R() < .5){ var c0 = cs[2]; return {q: "이차방정식 " + poly([a, cs[1], 0], "x") + " = " + sg(-c0) + " 을(를) 푸시오.", a: lo === hi ? "x = " + sg(lo) + " (중근)" : "x = " + sg(lo) + " 또는 x = " + sg(hi), t: lo === hi ? "x=" + sg(lo) : "x=" + sg(lo) + "," + sg(hi)}; }
      return {q: "이차방정식 " + poly(cs, "x") + " = 0 을(를) 푸시오.", a: lo === hi ? "x = " + sg(lo) + " (중근)" : "x = " + sg(lo) + " 또는 x = " + sg(hi), t: lo === hi ? "x=" + sg(lo) : "x=" + sg(lo) + "," + sg(hi)};
    }},
    {id: "vertex", g: 3, unit: "이차함수", n: "이차함수의 꼭짓점", f: function(R, lv){
      var a = lv === 1 ? pick(R, [1, -1]) : nz(R, -3, 3), p = nz(R, -5, 5), q = ri(R, -9, 9);
      if(lv === 1) return {q: "이차함수 y = " + (a < 0 ? "−" : "") + "(x " + (p < 0 ? "+ " + (-p) : "− " + p) + ")<sup>2</sup> " + (q < 0 ? "− " + (-q) : "+ " + q) + " 의 그래프의 꼭짓점의 좌표를 구하시오.", a: "(" + sg(p) + ", " + sg(q) + ")", t: "(" + sg(p) + "," + sg(q) + ")"};
      if(lv === 2) return {q: "이차함수 y = " + poly([a, -2 * a * p, a * p * p + q], "x") + " 의 그래프의 꼭짓점의 좌표를 구하시오.", a: "(" + sg(p) + ", " + sg(q) + ")", t: "(" + sg(p) + "," + sg(q) + ")"};
      var m = nz(R, -4, 4), n = nz(R, -4, 4);
      return {q: "이차함수 y = " + poly([a, -2 * a * p, a * p * p + q], "x") + " 의 그래프를 x축 방향으로 " + sg(m) + "만큼, y축 방향으로 " + sg(n) + "만큼 평행이동한 그래프의 꼭짓점의 좌표를 구하시오.", a: "(" + sg(p + m) + ", " + sg(q + n) + ")", t: "(" + sg(p + m) + "," + sg(q + n) + ")"};
    }},
    /* ════ v2.6: 영역 넓히기 (중1·중2·중3 전 단원) — 기초·보통·심화가 확실히 다르게 ════ */
    /* ── 중1 ── */
    {id: "pow", g: 1, unit: "정수와 유리수의 계산", n: "거듭제곱 계산", f: function(R, lv){
      if(lv === 1){ var a = ri(R, 2, 5), m = ri(R, 2, 3), s = pick(R, [1, -1]), v = Math.pow(s * a, m); return {q: sup(par(s * a), m) + " 을(를) 계산하시오.", a: sg(v), t: sg(v)}; }
      if(lv === 2){ var a2 = ri(R, 2, 4), m2 = ri(R, 2, 4), b = ri(R, 2, 5), v2 = Math.pow(-a2, m2) - b * b; return {q: sup("(−" + a2 + ")", m2) + " − " + sup(b, 2) + " 을(를) 계산하시오.", a: sg(v2), t: sg(v2)}; }
      var a3 = ri(R, 2, 4), b3 = ri(R, 2, 3), c = ri(R, 2, 3), d = ri(R, 2, 4), v3 = -a3 * a3 + Math.pow(-b3, 3) - Math.pow(-c, 2) * d;
      return {q: "−" + sup(a3, 2) + " + " + sup("(−" + b3 + ")", 3) + " − " + sup("(−" + c + ")", 2) + " × " + d + " 을(를) 계산하시오.", a: sg(v3), t: sg(v3)};
    }},
    {id: "divmul", g: 1, unit: "정수와 유리수의 계산", n: "곱셈·나눗셈 섞인 계산", f: function(R, lv){
      if(lv === 1){ var c = ri(R, 2, 6), q = ri(R, 2, 9), a = c * q, b = ri(R, 2, 5); return {q: a + " ÷ " + c + " × " + b + " 을(를) 계산하시오.", a: String(q * b), t: String(q * b)}; }
      if(lv === 2){ var c2 = nz(R, -6, 6), q2 = nz(R, -9, 9), a2 = c2 * q2, b2 = nz(R, -5, 5); return {q: par(a2) + " ÷ " + par(c2) + " × " + par(b2) + " 을(를) 계산하시오.", a: sg(q2 * b2), t: sg(q2 * b2)}; }
      var d = nz(R, -5, 5), x = nz(R, -6, 6), y = nz(R, -6, 6), k = ri(R, 2, 4); while((x - y) * k % d) { d = nz(R, -5, 5); x = nz(R, -6, 6); }
      var v = (x - y) * k / d - k; return {q: "{" + par(x) + " − " + par(y) + "} × " + k + " ÷ " + par(d) + " − " + k + " 을(를) 계산하시오.", a: sg(v), t: sg(v)};
    }},
    {id: "fracmd", g: 1, unit: "정수와 유리수의 계산", n: "분수 곱셈·나눗셈", f: function(R, lv){
      var n1 = ri(R, 1, 9), d1 = ri(R, 2, 9), n2 = ri(R, 1, 9), d2 = ri(R, 2, 9);
      if(lv === 1) return {q: "(" + frac(n1, d1) + ") × (" + frac(n2, d2) + ") 을(를) 계산하시오.", a: frac(n1 * n2, d1 * d2), t: frac(n1 * n2, d1 * d2)};
      var s1 = pick(R, [1, -1]), s2 = pick(R, [1, -1]);
      if(lv === 2) return {q: "(" + frac(s1 * n1, d1) + ") ÷ (" + frac(s2 * n2, d2) + ") 을(를) 계산하시오.", a: frac(s1 * s2 * n1 * d2, d1 * n2), t: frac(s1 * s2 * n1 * d2, d1 * n2)};
      var n3 = ri(R, 1, 9), d3 = ri(R, 2, 9), N = s1 * n1 * d2 * n3, D = d1 * s2 * n2 * d3;
      return {q: "(" + frac(s1 * n1, d1) + ") ÷ (" + frac(s2 * n2, d2) + ") × (" + frac(n3, d3) + ") 을(를) 계산하시오.", a: frac(N, D), t: frac(N, D)};
    }},
    {id: "subst", g: 1, unit: "문자와 식", n: "식의 값", f: function(R, lv){
      var a = nz(R, lv === 1 ? 1 : -5, 5), b = nz(R, -5, 5), p = nz(R, 2, 5), q = nz(R, 1, 6);
      if(lv === 1) return {q: "a = " + sg(a) + " 일 때, " + p + "a − " + q + " 의 값을 구하시오.", a: sg(p * a - q), t: sg(p * a - q)};
      if(lv === 2) return {q: "a = " + sg(a) + ", b = " + sg(b) + " 일 때, " + p + "a − " + q + "b 의 값을 구하시오.", a: sg(p * a - q * b), t: sg(p * a - q * b)};
      var v = a * a - 2 * a * b + b; return {q: "a = " + sg(a) + ", b = " + sg(b) + " 일 때, " + sup("a", 2) + " − 2ab + b 의 값을 구하시오.", a: sg(v), t: sg(v)};
    }},
    {id: "linsimp", g: 1, unit: "문자와 식", n: "일차식의 계산", f: function(R, lv){
      if(lv === 1){ var a = ri(R, 2, 7), b = nz(R, -9, 9), c = nz(R, -5, 5), d = nz(R, -9, 9); return {q: poly([a, b], "x") + " + (" + poly([c, d], "x") + ") 을(를) 계산하시오.", a: poly([a + c, b + d], "x"), t: poly([a + c, b + d], "x", true)}; }
      if(lv === 2){ var p = ri(R, 2, 4), a2 = nz(R, -4, 4), b2 = nz(R, -6, 6), q = ri(R, 2, 4), c2 = nz(R, -4, 4), d2 = nz(R, -6, 6), r = [p * a2 - q * c2, p * b2 - q * d2];
        return {q: p + "(" + poly([a2, b2], "x") + ") − " + q + "(" + poly([c2, d2], "x") + ") 을(를) 계산하시오.", a: poly(r, "x"), t: poly(r, "x", true)}; }
      var m = pick(R, [2, 3, 4]), n = pick(R, [3, 5, 6].filter(function(x){ return x !== m; })), b3 = nz(R, -6, 6), d3 = nz(R, -6, 6), L = m * n / gcd(m, n);
      var cx = L / m - L / n, cc = L / m * b3 - L / n * d3, g3 = gcd(gcd(cx, cc), L) || 1, num = poly([cx / g3, cc / g3], "x"), den = L / g3;
      return {q: "(" + poly([1, b3], "x") + ")/" + m + " − (" + poly([1, d3], "x") + ")/" + n + " 을(를) 계산하시오.", a: den === 1 ? num : "(" + num + ")/" + den, t: den === 1 ? num : "(" + num + ")/" + den};
    }},
    {id: "lin2", g: 1, unit: "일차방정식", n: "괄호·분수 있는 일차방정식", f: function(R, lv){
      var x = nz(R, -8, 8);
      if(lv === 1){ var a = ri(R, 2, 5), b = nz(R, -6, 6); return {q: a + "(x " + (b < 0 ? "+ " + (-b) : "− " + b) + ") = " + sg(a * (x - b)) + " 을(를) 푸시오.", a: "x = " + sg(x), t: "x=" + sg(x)}; }
      if(lv === 2){ var a2 = ri(R, 2, 5), c = ri(R, 2, 5), b2 = 1, g0 = 0, d = 0; while(a2 === c && g0++ < 9) c = ri(R, 2, 5);
        var opts = []; for(var t0 = -9; t0 <= 9; t0++){ if(t0 && (a2 * (x + t0) - c * x) % c === 0 && (a2 * (x + t0) - c * x) / c !== 0) opts.push(t0); } b2 = opts.length ? pick(R, opts) : c; d = (a2 * (x + b2) - c * x) / c;
        return {q: a2 + "(" + poly([1, b2], "x") + ") = " + c + "(" + poly([1, d], "x") + ") 을(를) 푸시오.", a: "x = " + sg(x), t: "x=" + sg(x)}; }
      var A = pick(R, [2, 3, 4]), B = pick(R, [3, 5, 6].filter(function(v){ return v !== A; })), p = 0, qq = null;
      for(var t = -9; t <= 9; t++){ var v = B * (x + t); if(v % A === 0){ p = t; qq = v / A - x; if(R() < .5) break; } }
      return {q: "(" + poly([1, p], "x") + ")/" + A + " = (" + poly([1, qq], "x") + ")/" + B + " 을(를) 푸시오.", a: "x = " + sg(x), t: "x=" + sg(x)};
    }},
    {id: "prop", g: 1, unit: "좌표평면과 그래프", n: "정비례·반비례", f: function(R, lv){
      var a = nz(R, -6, 6), x = nz(R, -4, 4);
      if(lv === 1) return {q: "y = ax 의 그래프가 점 (" + sg(x) + ", " + sg(a * x) + ")을 지날 때, 상수 a의 값을 구하시오.", a: "a = " + sg(a), t: sg(a)};
      var k = nz(R, -24, 24), xs = [1, 2, 3, 4, 6].filter(function(v){ return k % v === 0; }), x2 = pick(R, xs) * pick(R, [1, -1]);
      if(lv === 2) return {q: "y = a/x 의 그래프가 점 (" + sg(x2) + ", " + sg(k / x2) + ")을 지날 때, 상수 a의 값을 구하시오.", a: "a = " + sg(k), t: sg(k)};
      var xs2 = [1, 2, 3, 4, 6, 8, 12].filter(function(v){ return k % v === 0 && v !== Math.abs(x2); }), x3 = (pick(R, xs2.length ? xs2 : [Math.abs(x2)])) * pick(R, [1, -1]); if(x3 === x2) x3 = -x2;
      return {q: "y가 x에 반비례하고 x = " + sg(x2) + " 일 때 y = " + sg(k / x2) + " 이다. x = " + sg(x3) + " 일 때 y의 값을 구하시오.", a: "y = " + sg(k / x3), t: sg(k / x3)};
    }},
    {id: "polyang", g: 1, unit: "평면도형", n: "다각형의 각·대각선", f: function(R, lv){
      var n = ri(R, 5, lv === 1 ? 15 : 20);
      if(lv === 1) return {q: n + "각형의 내각의 크기의 합을 구하시오.", a: 180 * (n - 2) + "°", t: String(180 * (n - 2))};
      if(lv === 2){ var m = pick(R, [5, 6, 8, 9, 10, 12]); return R() < .5 ? {q: "정" + m + "각형의 한 내각의 크기를 구하시오.", a: 180 * (m - 2) / m + "°", t: String(180 * (m - 2) / m)} : {q: "정" + m + "각형의 한 외각의 크기를 구하시오.", a: 360 / m + "°", t: String(360 / m)}; }
      return {q: "대각선의 개수가 " + n * (n - 3) / 2 + "개인 다각형의 이름을 쓰시오.", a: n + "각형", t: n + "각형"};
    }},
    {id: "sector", g: 1, unit: "원과 부채꼴", n: "부채꼴의 호·넓이", f: function(R, lv){
      var r = ri(R, 2, 12), th = pick(R, lv === 1 ? [90, 180, 60, 120] : [30, 45, 60, 72, 120, 135, 150]);
      function pi(n, d){ var g2 = gcd(n, d); n /= g2; d /= g2; return (d === 1 ? (n === 1 ? "" : n) : n + "/" + d) + "π"; }
      if(lv === 1) return {q: "반지름 " + r + " cm, 중심각 " + th + "°인 부채꼴의 호의 길이를 구하시오.", a: pi(r * th, 180) + " cm", t: pi(r * th, 180)};
      if(lv === 2) return {q: "반지름 " + r + " cm, 중심각 " + th + "°인 부채꼴의 넓이를 구하시오.", a: pi(r * r * th, 360) + " cm²", t: pi(r * r * th, 360)};
      var l = ri(R, 2, 9); return {q: "반지름 " + r + " cm, 호의 길이 " + l + "π cm인 부채꼴의 넓이를 구하시오.", a: pi(r * l, 2) + " cm²", t: pi(r * l, 2)};
    }},
    {id: "mean", g: 1, unit: "자료의 정리와 해석", n: "평균·중앙값·최빈값", f: function(R, lv){
      var n = lv === 1 ? 5 : 6, v = []; for(var i = 0; i < n; i++) v.push(ri(R, 1, lv === 1 ? 10 : 20));
      if(lv === 1){ var s = v.reduce(function(a, b){ return a + b; }, 0), fix = (5 - s % 5) % 5; v[4] += fix; s += fix; return {q: "자료 " + v.join(", ") + " 의 평균을 구하시오.", a: String(s / 5), t: String(s / 5)}; }
      if(lv === 2){ var w = v.slice().sort(function(a, b){ return a - b; }), md = (w[2] + w[3]) / 2; return {q: "자료 " + v.join(", ") + " 의 중앙값을 구하시오.", a: String(md), t: String(md)}; }
      var m = ri(R, 6, 14), x5 = []; for(var j = 0; j < 4; j++) x5.push(ri(R, m - 5, m + 5)); var xv = 5 * m - x5.reduce(function(a, b){ return a + b; }, 0);
      return {q: "다섯 개의 자료 " + x5.join(", ") + ", x 의 평균이 " + m + " 일 때, x의 값을 구하시오.", a: "x = " + sg(xv), t: sg(xv)};
    }},
    /* ── 중2 ── */
    {id: "rep", g: 2, unit: "유리수와 순환소수", n: "순환소수를 분수로", f: function(R, lv){
      function dot(s){ var d = s.split(""); return d.map(function(c, i){ return (i === 0 || i === d.length - 1) ? '<span style="position:relative;display:inline-block">' + c + '<span style="position:absolute;left:0;right:0;top:-.62em;text-align:center;font-weight:900">·</span></span>' : c; }).join(""); }   /* 순환마디 처음·끝 숫자 위에 점 */
      if(lv === 1){ var a = ri(R, 1, 8); return {q: "0." + dot(String(a)) + " 을(를) 기약분수로 나타내시오.", a: frac(a, 9), t: frac(a, 9)}; }
      if(lv === 2){ var ab = ri(R, 10, 98); while(ab % 11 === 0) ab = ri(R, 10, 98); return {q: "0." + dot(String(ab)) + " 을(를) 기약분수로 나타내시오.", a: frac(ab, 99), t: frac(ab, 99)}; }
      var p = ri(R, 1, 9), q = ri(R, 1, 9), g0 = 0; while(p === q && g0++ < 9) q = ri(R, 1, 9);
      var ip = ri(R, 0, 2); return {q: ip + "." + p + dot(String(q)) + " 을(를) 기약분수로 나타내시오.", a: frac(ip * 90 + 10 * p + q - p, 90), t: frac(ip * 90 + 10 * p + q - p, 90)};
    }},
    {id: "expo", g: 2, unit: "식의 계산", n: "지수법칙", f: function(R, lv){
      var a = ri(R, 2, 6), b = ri(R, 2, 5), c = ri(R, 2, 5);
      if(lv === 1) return {q: sup("x", a) + " × " + sup("x", b) + " 을(를) 간단히 하시오.", a: sup("x", a + b), t: supT("x", a + b)};
      if(lv === 2){ var e = a * b - c; if(e <= 0){ c = 1; e = a * b - 1; } return {q: "(" + sup("x", a) + ")" + "<sup>" + b + "</sup> ÷ " + sup("x", c) + " 을(를) 간단히 하시오.", a: sup("x", e), t: supT("x", e)}; }
      var k = ri(R, 1, 3), m = ri(R, 2, 3), coef = Math.pow(2 * k, 3), d = pick(R, [2, 4, 8].filter(function(v){ return coef % v === 0; }));
      var ex = 3 * m - 1, ey = 3 - 2; return {q: "(" + (2 * k) + sup("x", m) + "y)<sup>3</sup> ÷ " + d + "x" + sup("y", 2) + " 을(를) 간단히 하시오.", a: (coef / d === 1 ? "" : coef / d) + sup("x", ex) + (ey === 1 ? "y" : sup("y", ey)), t: (coef / d === 1 ? "" : coef / d) + supT("x", ex) + "y"};
    }},
    {id: "mono", g: 2, unit: "식의 계산", n: "단항식의 곱셈·나눗셈", f: function(R, lv){
      var a = nz(R, -6, 6), b = nz(R, -6, 6);
      function c1(n){ return n === 1 ? "" : n === -1 ? "−" : sg(n); }
      if(lv === 1) return {q: c1(a) + "x × " + par(b) + "y 을(를) 간단히 하시오.", a: c1(a * b) + "xy", t: c1(a * b) + "xy"};
      if(lv === 2){ var k = nz(R, -3, 3); return {q: "(" + c1(k) + "a)<sup>2</sup> × " + par(b) + "ab 을(를) 간단히 하시오.", a: c1(k * k * b) + sup("a", 3) + "b", t: c1(k * k * b) + "a^3b"}; }
      var p = nz(R, -4, 4), q = ri(R, 2, 4), r = nz(R, -3, 3), top = p * q * 3;
      return {q: top + sup("a", 3) + sup("b", 2) + " ÷ (" + c1(3 * p) + "ab) × " + par(r) + "b 을(를) 간단히 하시오.", a: c1(q * r) + sup("a", 2) + sup("b", 2), t: c1(q * r) + "a^2b^2"};
    }},
    {id: "polyadd", g: 2, unit: "식의 계산", n: "다항식의 덧셈·뺄셈", f: function(R, lv){
      function xy(a, b){ var s = poly([a, 0], "x").replace(/ [+−] 0$/, ""); if(!a) s = ""; var t = b === 0 ? "" : (b < 0 ? (s ? " − " : "−") : (s ? " + " : "")) + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "y"; return (s + t) || "0"; }
      var a = nz(R, -6, 6), b = nz(R, -6, 6), c = nz(R, -6, 6), d = nz(R, -6, 6);
      if(lv === 1) return {q: "(" + xy(a, b) + ") + (" + xy(c, d) + ") 을(를) 계산하시오.", a: xy(a + c, b + d), t: xy(a + c, b + d)};
      if(lv === 2){ var p = ri(R, 2, 4), q = ri(R, 2, 4); return {q: p + "(" + xy(a, b) + ") − " + q + "(" + xy(c, d) + ") 을(를) 계산하시오.", a: xy(p * a - q * c, p * b - q * d), t: xy(p * a - q * c, p * b - q * d)}; }
      var e = nz(R, -5, 5), f = nz(R, -5, 5), k = ri(R, 2, 3), r = [a - k * c, b - k * d, e - k * f];
      return {q: "(" + poly([a, b, e], "x") + ") − " + k + "(" + poly([c, d, f], "x") + ") 을(를) 계산하시오.", a: poly(r, "x"), t: poly(r, "x", true)};
    }},
    {id: "ineq", g: 2, unit: "일차부등식", n: "일차부등식", f: function(R, lv){
      var x = nz(R, -6, 6), sym = pick(R, ["<", ">", "≤", "≥"]), flip = {"<": ">", ">": "<", "≤": "≥", "≥": "≤"};
      if(lv === 1){ var b = nz(R, -9, 9); return {q: "일차부등식 " + poly([1, b], "x") + " " + sym + " " + sg(x + b) + " 을(를) 푸시오.", a: "x " + sym + " " + sg(x), t: "x" + sym + sg(x)}; }
      if(lv === 2){ var a = nz(R, -5, -2), b2 = nz(R, -9, 9); return {q: "일차부등식 " + poly([a, b2], "x") + " " + sym + " " + sg(a * x + b2) + " 을(를) 푸시오.", a: "x " + flip[sym] + " " + sg(x), t: "x" + flip[sym] + sg(x)}; }
      var p = ri(R, 2, 4), q = nz(R, -5, 5), c = nz(R, -6, 6), g0 = 0; while((p - c) === 0 && g0++ < 9) c = nz(R, -6, 6);
      var d = (p - c) * x - p * q, s2 = p - c < 0 ? flip[sym] : sym;
      return {q: "일차부등식 " + p + "(" + poly([1, -q], "x") + ") " + sym + " " + poly([c, d], "x") + " 을(를) 푸시오.", a: "x " + s2 + " " + sg(x), t: "x" + s2 + sg(x)};
    }},
    {id: "lfint", g: 2, unit: "일차함수", n: "기울기·절편·교점", f: function(R, lv){
      var a = nz(R, -5, 5), b = nz(R, -9, 9);
      if(lv === 1) return {q: "일차함수 y = " + poly([a, b], "x") + " 의 기울기와 y절편을 구하시오.", a: "기울기 " + sg(a) + ", y절편 " + sg(b), t: sg(a) + "," + sg(b)};
      if(lv === 2){ var x0 = nz(R, -6, 6), b2 = -a * x0; return {q: "일차함수 y = " + poly([a, b2], "x") + " 의 그래프의 x절편을 구하시오.", a: sg(x0), t: sg(x0)}; }
      var x = nz(R, -5, 5), y = ri(R, -9, 9), m1 = nz(R, -4, 4), m2 = nz(R, -4, 4), g0 = 0; while(m1 === m2 && g0++ < 9) m2 = nz(R, -4, 4);
      return {q: "두 일차함수 y = " + poly([m1, y - m1 * x], "x") + ", y = " + poly([m2, y - m2 * x], "x") + " 의 그래프의 교점의 좌표를 구하시오.", a: "(" + sg(x) + ", " + sg(y) + ")", t: "(" + sg(x) + "," + sg(y) + ")"};
    }},
    {id: "case", g: 2, unit: "경우의 수", n: "경우의 수", f: function(R, lv){
      var n = ri(R, 4, 12);
      if(lv === 1) return {q: n + "명 중에서 회장 1명, 부회장 1명을 뽑는 경우의 수를 구하시오.", a: String(n * (n - 1)), t: String(n * (n - 1))};
      if(lv === 2) return {q: n + "명 중에서 대표 2명을 뽑는 경우의 수를 구하시오.", a: String(n * (n - 1) / 2), t: String(n * (n - 1) / 2)};
      var k = ri(R, 3, 9); if(R() < .4){ var m3 = ri(R, 4, 9); return {q: "1부터 " + m3 + "까지의 숫자가 하나씩 적힌 카드 " + m3 + "장 중 3장을 뽑아 만들 수 있는 세 자리 정수의 개수를 구하시오.", a: String(m3 * (m3 - 1) * (m3 - 2)), t: String(m3 * (m3 - 1) * (m3 - 2))}; } return {q: "0부터 " + k + "까지의 숫자가 하나씩 적힌 카드 " + (k + 1) + "장 중 2장을 뽑아 만들 수 있는 두 자리 정수의 개수를 구하시오.", a: String(k * k), t: String(k * k)};
    }},
    {id: "prob", g: 2, unit: "확률", n: "확률", f: function(R, lv){
      if(lv === 1){ var E = pick(R, [["짝수", 3], ["홀수", 3], ["소수", 3], ["3의 배수", 2], ["4 이상", 3], ["5 이상", 2], ["6의 약수", 4], ["2 이하", 2]]); return {q: "주사위 한 개를 던질 때, " + E[0] + "의 눈이 나올 확률을 구하시오.", a: frac(E[1], 6), t: frac(E[1], 6)}; }
      if(lv === 2){ var s = ri(R, 3, 11), c2 = 6 - Math.abs(7 - s); return {q: "서로 다른 주사위 두 개를 던질 때, 나오는 눈의 수의 합이 " + s + "일 확률을 구하시오.", a: frac(c2, 36), t: frac(c2, 36)}; }
      var n = ri(R, 3, 4), C = [1, n, n * (n - 1) / 2]; return R() < .5 ? {q: "동전 " + n + "개를 동시에 던질 때, 적어도 한 개는 앞면이 나올 확률을 구하시오.", a: frac(Math.pow(2, n) - 1, Math.pow(2, n)), t: frac(Math.pow(2, n) - 1, Math.pow(2, n))}
        : {q: "동전 " + n + "개를 동시에 던질 때, 앞면이 2개 나올 확률을 구하시오.", a: frac(C[2], Math.pow(2, n)), t: frac(C[2], Math.pow(2, n))};
    }},
    {id: "pyth", g: 2, unit: "피타고라스 정리", n: "피타고라스 정리", f: function(R, lv){
      var TR = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15]], t = pick(R, lv === 1 ? TR.slice(0, 1).concat([[6, 8, 10], [9, 12, 15]]) : TR), k = lv === 1 ? ri(R, 1, 3) : 1;
      if(lv === 1) return {q: "직각삼각형에서 직각을 낀 두 변의 길이가 " + t[0] * k + " cm, " + t[1] * k + " cm일 때, 빗변의 길이를 구하시오.", a: t[2] * k + " cm", t: String(t[2] * k)};
      if(lv === 2) return {q: "직각삼각형에서 빗변의 길이가 " + t[2] + " cm, 다른 한 변의 길이가 " + t[0] + " cm일 때, 나머지 한 변의 길이를 구하시오.", a: t[1] + " cm", t: String(t[1])};
      var a = ri(R, 2, 7), b = ri(R, 2, 7), s = simp(a * a + b * b); return {q: "직각을 낀 두 변의 길이가 " + a + " cm, " + b + " cm인 직각삼각형의 빗변의 길이를 구하시오.", a: rtk(s) + " cm", t: rtkT(s)};
    }},
    {id: "simil", g: 2, unit: "도형의 닮음", n: "닮음비·넓이비·부피비", f: function(R, lv){
      var a = ri(R, 1, 4), b = ri(R, a + 1, 7), u = ri(R, 2, 5), g0 = 0; while(gcd(a, b) > 1 && g0++ < 20) b = ri(R, a + 1, 7);   /* 3 : 6 같은 약분되는 비는 피함 */
      if(lv === 1) return {q: "두 닮은 도형의 닮음비가 " + a + " : " + b + " 이다. 작은 도형의 한 변이 " + a * u + " cm일 때, 대응하는 큰 도형의 변의 길이를 구하시오.", a: b * u + " cm", t: String(b * u)};
      if(lv === 2) return {q: "닮음비가 " + a + " : " + b + " 인 두 평면도형에서 작은 도형의 넓이가 " + a * a * u + " cm²일 때, 큰 도형의 넓이를 구하시오.", a: b * b * u + " cm²", t: String(b * b * u)};
      return {q: "닮음비가 " + a + " : " + b + " 인 두 입체도형에서 작은 입체도형의 부피가 " + a * a * a * u + " cm³일 때, 큰 입체도형의 부피를 구하시오.", a: b * b * b * u + " cm³", t: String(b * b * b * u)};
    }},
    /* ── 중3 ── */
    {id: "sqrtmd", g: 3, unit: "제곱근과 실수", n: "근호의 곱셈·나눗셈·유리화", f: function(R, lv){
      var m = pick(R, [2, 3, 5, 6, 7]);
      if(lv === 1){ var u = ri(R, 1, 3), v = pick(R, [2, 3, 5].filter(function(x){ return x !== u; })), A = m * u, B = m * v, sp = simp(A * B); return {q: rt(A) + " × " + rt(B) + " 을(를) 간단히 하시오.", a: rtk(sp), t: rtkT(sp)}; }
      if(lv === 2){ var a = ri(R, 2, 6), b = ri(R, 2, 6), s2 = simp(a * a * m * b); return {q: rt(a * a * m * b * b) + " ÷ " + rt(b) + " 을(를) 간단히 하시오.", a: rtk(simp(a * a * m * b)), t: rtkT(simp(a * a * m * b))}; }
      var c = ri(R, 2, 9) * m, s3 = simp(m), num = c / m;
      return {q: c + " / " + rt(m) + " 의 분모를 유리화하시오.", a: (num === 1 ? "" : num) + rt(m), t: (num === 1 ? "" : num) + "√" + m};
    }},
    {id: "fact2", g: 3, unit: "인수분해", n: "인수분해 (공통인수·완전제곱·ac)", f: function(R, lv){
      if(lv === 1){ var k = ri(R, 2, 6), m = nz(R, -7, 7); return {q: poly([k, k * m, 0], "x") + " 을(를) 인수분해하시오.", a: k + "x(" + poly([1, m], "x") + ")", t: k + "x(" + poly([1, m], "x", true) + ")"}; }
      if(lv === 2){ var a = ri(R, 1, 3), p = nz(R, -7, 7); return {q: poly([a * a, 2 * a * p, p * p], "x") + " 을(를) 인수분해하시오.", a: "(" + poly([a, p], "x") + ")<sup>2</sup>", t: "(" + poly([a, p], "x", true) + ")^2"}; }
      var P = ri(R, 2, 3), Q = nz(R, -6, 6), S2 = ri(R, 1, 3), T2 = nz(R, -6, 6), g0 = 0; while(gcd(P, Q) > 1 && g0++ < 20) Q = nz(R, -6, 6);
      var cs = [P * S2, P * T2 + Q * S2, Q * T2];
      return {q: poly(cs, "x") + " 을(를) 인수분해하시오.", a: "(" + poly([P, Q], "x") + ")(" + poly([S2, T2], "x") + ")", t: "(" + poly([P, Q], "x", true) + ")(" + poly([S2, T2], "x", true) + ")"};
    }},
    {id: "qformula", g: 3, unit: "이차방정식", n: "근의 공식", f: function(R, lv){
      var a = lv === 3 ? ri(R, 2, 3) : 1, b, c, D, g0 = 0;
      do{ b = lv === 1 ? 2 * nz(R, -5, 5) : nz(R, -9, 9); c = nz(R, -9, 9); D = b * b - 4 * a * c; g0++; } while((D <= 0 || Math.sqrt(D) === Math.round(Math.sqrt(D))) && g0 < 80);
      var s = simp(D), den = 2 * a, gg = gcd(gcd(b, s[0]), den), B = -b / gg, K = s[0] / gg, Dd = den / gg;
      var rootT = (K === 1 ? "" : K) + "√" + s[1], top = (B ? sg(B) + " ± " : "±") + rootT;
      var ans = "x = " + (Dd === 1 ? top : "(" + top + ")/" + Dd);
      return {q: "이차방정식 " + poly([a, b, c], "x") + " = 0 을(를) 근의 공식으로 푸시오.", a: ans.replace(/√(\d+)/g, function(_, n){ return rt(n); }), t: ans};
    }},
    {id: "qmax", g: 3, unit: "이차함수", n: "최댓값·최솟값", f: function(R, lv){
      var a = lv === 1 ? 1 : lv === 2 ? pick(R, [-1, 2, -2]) : pick(R, [3, -3, 2, -2]), p = nz(R, -5, 5), q = ri(R, -9, 9);
      if(lv === 3){ return {q: "이차함수 y = " + poly([a, -2 * a * p, a * p * p + q], "x") + " 의 " + (a > 0 ? "최솟값" : "최댓값") + "과 그때의 x의 값을 구하시오.", a: "x = " + sg(p) + " 일 때 " + (a > 0 ? "최솟값 " : "최댓값 ") + sg(q), t: sg(p) + "," + sg(q)}; }
      return {q: "이차함수 y = " + poly([a, -2 * a * p, a * p * p + q], "x") + " 의 " + (a > 0 ? "최솟값" : "최댓값") + "을 구하시오.", a: sg(q), t: sg(q)};
    }},
    {id: "trig", g: 3, unit: "삼각비", n: "삼각비의 값", f: function(R, lv){
      var t = pick(R, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), f3 = pick(R, ["sin", "cos", "tan"]);
      var v = {sin: frac(t[0], t[2]), cos: frac(t[1], t[2]), tan: frac(t[0], t[1])};
      if(lv === 1) return {q: "∠C = 90°인 직각삼각형 ABC에서 BC = " + t[0] + ", AC = " + t[1] + ", AB = " + t[2] + " 일 때, " + f3 + " A 의 값을 구하시오.", a: v[f3], t: v[f3]};
      if(lv === 2) return {q: "∠C = 90°인 직각삼각형 ABC에서 BC = " + t[0] + ", AC = " + t[1] + " 일 때, " + f3 + " A 의 값을 구하시오.", a: v[f3], t: v[f3]};
      return {q: "0° < A < 90° 이고 sin A = " + v.sin + " 일 때, cos A × tan A 의 값을 구하시오.", a: v.sin, t: v.sin};
    }},
    {id: "trigsp", g: 3, unit: "삼각비", n: "특수각의 삼각비 계산", f: function(R, lv){
      var L = {1: [["sin 30° + cos 60°", "1"], ["tan 45° + sin 90°", "2"], ["2 sin 30°", "1"], ["cos 0° + tan 45°", "2"], ["sin 30° × cos 60°", "1/4"]],
               2: [["sin 45° × cos 45°", "1/2"], ["tan 60° × tan 30°", "1"], ["sin 60° ÷ cos 30°", "1"], ["(sin 45°)² + (cos 45°)²", "1"], ["2 cos 60° − tan 45°", "0"], ["sin 30° + cos 60° × tan 45°", "1"]],
               3: [["tan 60° × cos 30° − sin 30°", "1"], ["(sin 60° + cos 30°)²", "3"], ["sin 60° × tan 60° − cos 60°", "1"], ["(tan 30°)² + (sin 45°)²", "5/6"], ["4 sin 30° × cos 60° − tan² 45°", "0"], ["√2 sin 45° + √3 tan 30°", "2"]]};
      var x = pick(R, L[lv]); return {q: x[0] + " 의 값을 구하시오.", a: x[1], t: x[1]};
    }},
    {id: "inscr", g: 3, unit: "원의 성질", n: "원주각과 중심각", f: function(R, lv){
      var c = 2 * ri(R, 20, 85);
      if(lv === 1) return {q: "원 O에서 호 AB에 대한 중심각 ∠AOB = " + c + "°일 때, 호 AB에 대한 원주각 ∠APB의 크기를 구하시오.", a: c / 2 + "°", t: String(c / 2)};
      if(lv === 2) return {q: "원 O에서 호 AB에 대한 원주각 ∠APB = " + c / 2 + "°일 때, 중심각 ∠AOB의 크기를 구하시오.", a: c + "°", t: String(c)};
      var a = ri(R, 15, 75); return {q: "선분 AB가 원 O의 지름이고 점 P가 원 위의 점일 때, ∠PAB = " + a + "°이면 ∠PBA의 크기를 구하시오.", a: 90 - a + "°", t: String(90 - a)};
    }},
    {id: "disp", g: 3, unit: "대푯값과 산포도", n: "편차·분산·표준편차", f: function(R, lv){
      var m = ri(R, 5, 15), d = [];
      if(lv === 1){ for(var i = 0; i < 4; i++) d.push(nz(R, -4, 4)); var last = -d.reduce(function(a, b){ return a + b; }, 0); return {q: "5개의 변량의 편차가 " + d.map(sg).join(", ") + ", x 일 때, x의 값을 구하시오.", a: sg(last), t: sg(last)}; }
      var g0 = 0; do{ d = []; for(var j = 0; j < 4; j++) d.push(ri(R, -4, 4)); d.push(-d.reduce(function(a, b){ return a + b; }, 0)); g0++; } while((Math.abs(d[4]) > 6 || d.reduce(function(a, b){ return a + b * b; }, 0) % 5) && g0 < 200);
      var vals = d.map(function(x){ return m + x; }), V = d.reduce(function(a, b){ return a + b * b; }, 0) / 5;
      if(lv === 2) return {q: "자료 " + vals.join(", ") + " 의 분산을 구하시오.", a: String(V), t: String(V)};
      var s = simp(V); return {q: "자료 " + vals.join(", ") + " 의 표준편차를 구하시오.", a: rtk(s), t: rtkT(s)};
    }}
  ];
  /* 단원 순서 (교과서 차례 기준) — 진도까지 섞기·목록 정렬에 씀. kw: 진도표 단원 이름과 맞춰 볼 낱말 */
  var U = [
    {g: 1, k: "소인수분해", kw: /소인수|약수|배수|공약|공배/, ids: ["prime", "gcd"]},
    {g: 1, k: "정수·유리수", kw: /정수|유리수|사칙|거듭/, ids: ["int", "frac", "pow", "divmul", "fracmd"]},
    {g: 1, k: "문자와 식", kw: /문자|식의 값|일차식/, ids: ["subst", "linsimp"]},
    {g: 1, k: "일차방정식", kw: /방정식/, ids: ["lin", "lin2"]},
    {g: 1, k: "좌표·그래프", kw: /좌표|그래프|비례/, ids: ["prop"]},
    {g: 1, k: "평면도형", kw: /기본 ?도형|평면|다각형|작도|합동/, ids: ["polyang"]},
    {g: 1, k: "원·부채꼴", kw: /원과|부채꼴|입체/, ids: ["sector"]},
    {g: 1, k: "자료", kw: /자료|통계|대푯값|도수/, ids: ["mean"]},
    {g: 2, k: "순환소수", kw: /순환|유리수와|소수/, ids: ["rep"]},
    {g: 2, k: "식의 계산", kw: /식의 계산|지수|단항|다항/, ids: ["expo", "mono", "polyadd"]},
    {g: 2, k: "부등식", kw: /부등식/, ids: ["ineq"]},
    {g: 2, k: "연립방정식", kw: /연립/, ids: ["sys"]},
    {g: 2, k: "일차함수", kw: /함수/, ids: ["lfint", "slope"]},
    {g: 2, k: "닮음", kw: /닮음|삼각형의 성질|사각형/, ids: ["simil"]},
    {g: 2, k: "피타고라스", kw: /피타고라스/, ids: ["pyth"]},
    {g: 2, k: "경우의 수", kw: /경우의 수/, ids: ["case"]},
    {g: 2, k: "확률", kw: /확률/, ids: ["prob"]},
    {g: 3, k: "제곱근", kw: /제곱근|실수|근호/, ids: ["sqrt", "sqrtmd"]},
    {g: 3, k: "다항식의 곱셈", kw: /곱셈|전개/, ids: ["expand"]},
    {g: 3, k: "인수분해", kw: /인수분해/, ids: ["factor", "fact2"]},
    {g: 3, k: "이차방정식", kw: /이차방정식/, ids: ["quad", "qformula"]},
    {g: 3, k: "이차함수", kw: /이차함수/, ids: ["vertex", "qmax"]},
    {g: 3, k: "삼각비", kw: /삼각비/, ids: ["trig", "trigsp"]},
    {g: 3, k: "원의 성질", kw: /원의 성질|원주각|접선/, ids: ["inscr"]},
    {g: 3, k: "통계", kw: /통계|대푯값|산포|상관/, ids: ["disp"]}
  ];
  var UO = {}; U.forEach(function(u, i){ u.ids.forEach(function(id, j){ UO[id] = i * 10 + j; }); });
  T.sort(function(a, b){ return a.g - b.g || (UO[a.id] == null ? 999 : UO[a.id]) - (UO[b.id] == null ? 999 : UO[b.id]); });   /* 학년순 → 단원 차례순 */
  function units(g){ return U.filter(function(u){ return u.g === g; }); }
  /* 진도표 단원 이름 → 이 학년 단원 차례 번호 (못 찾으면 -1) */
  function unitIndex(g, name){ var L = units(g), r = -1; L.forEach(function(u, i){ if(u.kw.test(name || "")) r = i; }); return r; }
  function type(id){ return T.filter(function(t){ return t.id === id; })[0] || null; }
  /* 문항 하나: 유형·난이도·씨앗(+번호) */
  function make(id, lv, seed){ var t = type(id); if(!t) return null; var o = t.f(rng(seed), lv || 2); o.type = id; o.lv = lv || 2; return o; }
  /* 학습지: spec = [{id, n}], lv, seed, who(학생 번호 또는 0=공통) → 문항 목록 */
  function sheet(spec, lv, seed, who){
    var out = [];
    var seen = {};
    spec.forEach(function(s){ for(var i = 0; i < (s.n || 0); i++){
      var o = null, k = 0;
      /* lv 0 = 단계 섞기: 문항마다 기초·보통·심화를 3:4:3 정도로 (학생별로 달라지지 않게 학생 번호는 빼고 정함) */
      var L = lv || [1, 1, 1, 2, 2, 2, 2, 3, 3, 3][Math.floor(rng("lv|" + seed + "|" + s.id + "|" + i)() * 10)];
      do{ o = make(s.id, L, seed + "|" + s.id + "|" + i + "|" + (who || 0) + (k ? "|r" + k : "")); k++; } while(o && seen[o.q] && k < 12);   /* 같은 문제가 두 번 나오지 않게 */
      if(o) o.lv = L;
      if(o){ seen[o.q] = 1; out.push(o); }
    } });
    return out;
  }
  /* 학년별 개수 → 영역별로 고르게 섞은 spec: mix({1: 4, 2: 3, 3: 5}, seed) */
  function mix(cnt, seed, upto){
    var R = rng("mix|" + seed), out = {};
    [1, 2, 3].forEach(function(g){
      var lim = upto && upto[g] != null && upto[g] >= 0 ? upto[g] : 99, ok = {};
      units(g).forEach(function(u, i){ if(i <= lim) u.ids.forEach(function(id){ ok[id] = 1; }); });
      var n = +cnt[g] || 0, L = T.filter(function(t){ return t.g === g && ok[t.id]; }).map(function(t){ return t.id; });
      if(!L.length) return;
      for(var i = L.length - 1; i > 0; i--){ var j = Math.floor(R() * (i + 1)), x = L[i]; L[i] = L[j]; L[j] = x; }
      for(var k = 0; k < n; k++){ var id = L[k % L.length]; out[id] = (out[id] || 0) + 1; }
    });
    return T.filter(function(t){ return out[t.id]; }).map(function(t){ return {id: t.id, n: out[t.id]}; });
  }
  /* 고교 입학 준비: 고1 3월 모의고사에 바로 이어지는 중학교 핵심 영역 */
  var HS = [{id: "rep", n: 1}, {id: "expo", n: 1}, {id: "ineq", n: 1}, {id: "sys", n: 1}, {id: "lfint", n: 1}, {id: "sqrt", n: 1}, {id: "sqrtmd", n: 1}, {id: "expand", n: 1},
            {id: "factor", n: 1}, {id: "fact2", n: 1}, {id: "quad", n: 1}, {id: "qformula", n: 1}, {id: "vertex", n: 1}, {id: "qmax", n: 1}, {id: "trigsp", n: 1}];
  return {T: T, U: U, units: units, unitIndex: unitIndex, type: type, make: make, sheet: sheet, mix: mix, HS: HS, rng: rng};
})();
