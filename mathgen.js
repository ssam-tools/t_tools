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
  function frac(n, d){ if(d < 0){ n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? sg(n) : (n < 0 ? "−" : "") + Math.abs(n) + "/" + d; }

  var T = [
    {id: "prime", g: 1, unit: "소인수분해", n: "소인수분해", f: function(R, lv){
      var ps = lv === 1 ? [2, 3, 5] : [2, 3, 5, 7], e = {}, n = 1, k = lv === 3 ? 3 : 2, g = 0, cap = lv === 1 ? 200 : lv === 2 ? 600 : 1500;
      while(Object.keys(e).length < k && g++ < 40){ var p = pick(R, ps); if(!e[p]){ var x = ri(R, 1, lv === 1 ? 2 : 3); if(n * Math.pow(p, x) > cap) x = 1; if(n * p > cap) continue; e[p] = x; n *= Math.pow(p, x); } }
      var keys = Object.keys(e).map(Number).sort(function(a, b){ return a - b; });
      return {q: n + "을(를) 소인수분해하시오.", a: keys.map(function(p){ return sup(p, e[p]); }).join(" × "), t: keys.map(function(p){ return supT(p, e[p]); }).join("×")};
    }},
    {id: "gcd", g: 1, unit: "최대공약수와 최소공배수", n: "최대공약수·최소공배수", f: function(R, lv){
      var c = pick(R, [2, 3, 4, 5, 6]), a = c * ri(R, 2, lv === 1 ? 6 : 9), b = c * ri(R, 2, lv === 1 ? 6 : 9), g0 = 0;
      while(a === b && g0++ < 20) b = c * ri(R, 2, 9);
      var G = gcd(a, b), L = a * b / G;
      return {q: a + "와(과) " + b + "의 최대공약수와 최소공배수를 구하시오.", a: "최대공약수 " + G + ", 최소공배수 " + L, t: G + ", " + L};
    }},
    {id: "int", g: 1, unit: "정수와 유리수의 계산", n: "정수 계산", f: function(R, lv){
      var m = lv === 1 ? 9 : lv === 2 ? 15 : 20, a = nz(R, -m, m), b = nz(R, -m, m), c = nz(R, -m, m);
      var o1 = pick(R, ["+", "−", "×"]), o2 = pick(R, lv === 1 ? ["+", "−"] : ["+", "−", "×"]);
      function op(x, o, y){ return o === "+" ? x + y : o === "−" ? x - y : x * y; }
      var v = (o2 === "×" && o1 !== "×") ? op(a, o1, b * c) : op(op(a, o1, b), o2, c);
      return {q: par(a) + " " + o1 + " " + par(b) + " " + o2 + " " + par(c) + " 을(를) 계산하시오.", a: sg(v), t: sg(v)};
    }},
    {id: "frac", g: 1, unit: "정수와 유리수의 계산", n: "분수 덧셈·뺄셈", f: function(R, lv){
      var d1 = ri(R, 2, lv === 1 ? 6 : 9), d2 = ri(R, 2, lv === 1 ? 6 : 9), n1 = nz(R, -8, 8), n2 = nz(R, -8, 8), o = pick(R, ["+", "−"]), g1 = 0;
      while((n1 % d1 === 0 || n2 % d2 === 0) && g1++ < 40){ n1 = nz(R, -8, 8); n2 = nz(R, -8, 8); }      // 정수가 되는 분수는 피함
      var n = o === "+" ? n1 * d2 + n2 * d1 : n1 * d2 - n2 * d1, d = d1 * d2;
      return {q: "(" + frac(n1, d1) + ") " + o + " (" + frac(n2, d2) + ") 을(를) 계산하시오.", a: frac(n, d), t: frac(n, d)};
    }},
    {id: "lin", g: 1, unit: "일차방정식", n: "일차방정식", f: function(R, lv){
      var x = nz(R, -9, 9), a = nz(R, -6, 6), c = lv === 1 ? 0 : nz(R, -6, 6), g0 = 0; while(a === c && g0++ < 20) c = nz(R, -6, 6);
      var b = ri(R, -12, 12), d = (a - c) * x + b;
      return {q: "일차방정식 " + poly([a, b], "x") + " = " + poly([c, d], "x") + " 을(를) 푸시오.", a: "x = " + sg(x), t: "x=" + sg(x)};
    }},
    {id: "sys", g: 2, unit: "연립일차방정식", n: "연립방정식", f: function(R, lv){
      var x = nz(R, -6, 6), y = nz(R, -6, 6), a1 = nz(R, -5, 5), b1 = nz(R, -5, 5), a2 = nz(R, -5, 5), b2 = nz(R, -5, 5), g0 = 0;
      while(a1 * b2 - a2 * b1 === 0 && g0++ < 30){ a2 = nz(R, -5, 5); b2 = nz(R, -5, 5); }
      if(lv === 1){ a1 = 1; b1 = 1; }
      function side(a, b){ return poly([a, 0], "x").replace(/ − 0| \+ 0/, "") + (b < 0 ? " − " : " + ") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "y"; }
      return {q: "연립방정식 { " + side(a1, b1) + " = " + sg(a1 * x + b1 * y) + " , " + side(a2, b2) + " = " + sg(a2 * x + b2 * y) + " } 을(를) 푸시오.", a: "x = " + sg(x) + ", y = " + sg(y), t: "x=" + sg(x) + ",y=" + sg(y)};
    }},
    {id: "slope", g: 2, unit: "일차함수", n: "두 점을 지나는 직선", f: function(R, lv){
      var m = nz(R, -4, 4), k = ri(R, -8, 8), x1 = ri(R, -5, 0), x2 = x1 + ri(R, 1, 4);
      return {q: "두 점 (" + sg(x1) + ", " + sg(m * x1 + k) + "), (" + sg(x2) + ", " + sg(m * x2 + k) + ")을 지나는 일차함수의 식을 구하시오.", a: "y = " + poly([m, k], "x"), t: "y=" + poly([m, k], "x", true)};
    }},
    {id: "expand", g: 3, unit: "다항식의 곱셈", n: "곱셈 공식 전개", f: function(R, lv){
      var a = lv === 1 ? 1 : nz(R, -3, 3), b = nz(R, -9, 9), c = lv === 1 ? 1 : nz(R, -3, 3), d = nz(R, -9, 9);
      var r = [a * c, a * d + b * c, b * d];
      return {q: "(" + poly([a, b], "x") + ")(" + poly([c, d], "x") + ") 을(를) 전개하시오.", a: poly(r, "x"), t: poly(r, "x", true)};
    }},
    {id: "factor", g: 3, unit: "인수분해", n: "인수분해", f: function(R, lv){
      if(lv === 3 && R() < .4){ var p = ri(R, 2, 9), q = ri(R, 1, 9); return {q: poly([p * p, 0, -q * q], "x") + " 을(를) 인수분해하시오.", a: "(" + poly([p, q], "x") + ")(" + poly([p, -q], "x") + ")", t: "(" + poly([p, q], "x", true) + ")(" + poly([p, -q], "x", true) + ")"}; }
      var r1 = nz(R, -9, 9), r2 = nz(R, -9, 9);
      return {q: poly([1, r1 + r2, r1 * r2], "x") + " 을(를) 인수분해하시오.", a: "(" + poly([1, r1], "x") + ")(" + poly([1, r2], "x") + ")", t: "(" + poly([1, r1], "x", true) + ")(" + poly([1, r2], "x", true) + ")"};
    }},
    {id: "sqrt", g: 3, unit: "제곱근과 실수", n: "근호 간단히", f: function(R, lv){
      var m = pick(R, [2, 3, 5, 6, 7]), k = ri(R, 2, lv === 1 ? 4 : 7);
      if(lv >= 2 && R() < .5){ var k2 = ri(R, 2, 5), s = k + k2; return {q: rt(k * k * m) + " + " + rt(k2 * k2 * m) + " 을(를) 간단히 하시오.", a: s + rt(m), t: s + "√" + m}; }
      return {q: rt(k * k * m) + " 을(를) a√b 꼴로 나타내시오.", a: k + rt(m), t: k + "√" + m};
    }},
    {id: "quad", g: 3, unit: "이차방정식", n: "이차방정식", f: function(R, lv){
      var r1 = nz(R, -9, 9), r2 = nz(R, -9, 9), a = lv === 3 ? ri(R, 2, 3) : 1;
      var cs = [a, -a * (r1 + r2), a * r1 * r2], lo = Math.min(r1, r2), hi = Math.max(r1, r2);
      return {q: "이차방정식 " + poly(cs, "x") + " = 0 을(를) 푸시오.", a: lo === hi ? "x = " + sg(lo) + " (중근)" : "x = " + sg(lo) + " 또는 x = " + sg(hi), t: lo === hi ? "x=" + sg(lo) : "x=" + sg(lo) + "," + sg(hi)};
    }},
    {id: "vertex", g: 3, unit: "이차함수", n: "이차함수의 꼭짓점", f: function(R, lv){
      var a = lv === 1 ? pick(R, [1, -1]) : nz(R, -3, 3), p = nz(R, -5, 5), q = ri(R, -9, 9);
      return {q: "이차함수 y = " + poly([a, -2 * a * p, a * p * p + q], "x") + " 의 그래프의 꼭짓점의 좌표를 구하시오.", a: "(" + sg(p) + ", " + sg(q) + ")", t: "(" + sg(p) + "," + sg(q) + ")"};
    }}
  ];
  function type(id){ return T.filter(function(t){ return t.id === id; })[0] || null; }
  /* 문항 하나: 유형·난이도·씨앗(+번호) */
  function make(id, lv, seed){ var t = type(id); if(!t) return null; var o = t.f(rng(seed), lv || 2); o.type = id; return o; }
  /* 학습지: spec = [{id, n}], lv, seed, who(학생 번호 또는 0=공통) → 문항 목록 */
  function sheet(spec, lv, seed, who){
    var out = [];
    spec.forEach(function(s){ for(var i = 0; i < (s.n || 0); i++) out.push(make(s.id, lv, seed + "|" + s.id + "|" + i + "|" + (who || 0))); });
    return out.filter(Boolean);
  }
  return {T: T, type: type, make: make, sheet: sheet, rng: rng};
})();
