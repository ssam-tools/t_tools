/* 쌤 노트 · QR 코드 만들기 (인터넷 없이 이 기기 안에서 만듦, 외부 라이브러리 없음)
   TTQR.svg("https://...", {size: 240}) → <svg> 문자열.  TTQR.matrix(text) → [[true/false]] (어두운 칸 = true)
   바이트 모드 · 오류 정정 M · 버전 1~40 자동. 표준(ISO/IEC 18004)의 계산 방식을 그대로 따릅니다. */
(function(g){
  "use strict";
  var ECC_M = [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28];
  var BLK_M = [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49];
  var FMT_M = 0;                                            // 오류 정정 M 의 형식 비트

  function rawModules(v){
    var r = (16 * v + 128) * v + 64;
    if(v >= 2){ var n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if(v >= 7) r -= 36; }
    return r;
  }
  function dataCodewords(v){ return Math.floor(rawModules(v) / 8) - ECC_M[v] * BLK_M[v]; }
  function utf8(s){
    if(typeof TextEncoder !== "undefined") return Array.prototype.slice.call(new TextEncoder().encode(s));
    var b = unescape(encodeURIComponent(s)), a = []; for(var i = 0; i < b.length; i++) a.push(b.charCodeAt(i)); return a;
  }
  function gmul(x, y){ var z = 0; for(var i = 7; i >= 0; i--){ z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 0xFF; }
  function rsDivisor(deg){
    var r = []; for(var i = 0; i < deg - 1; i++) r.push(0); r.push(1);
    var root = 1;
    for(i = 0; i < deg; i++){
      for(var j = 0; j < r.length; j++){ r[j] = gmul(r[j], root); if(j + 1 < r.length) r[j] ^= r[j + 1]; }
      root = gmul(root, 0x02);
    }
    return r;
  }
  function rsRemainder(data, div){
    var r = div.map(function(){ return 0; });
    data.forEach(function(b){ var f = b ^ r.shift(); r.push(0); div.forEach(function(c, i){ r[i] ^= gmul(c, f); }); });
    return r;
  }
  function alignPos(v, size){
    if(v === 1) return [];
    var n = Math.floor(v / 7) + 2, step = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2, r = [6];
    for(var p = size - 7; r.length < n; p -= step) r.splice(1, 0, p);
    return r;
  }

  function matrix(text){
    var bytes = utf8(String(text)), v, cap;
    for(v = 1; v <= 40; v++){ cap = dataCodewords(v) * 8; if(4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= cap) break; }
    if(v > 40) throw new Error("QR에 담기에 너무 깁니다");
    // ① 데이터 비트
    var bits = [], put = function(val, len){ for(var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16); bytes.forEach(function(b){ put(b, 8); });
    put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
    for(var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = []; for(var i = 0; i < bits.length; i += 8){ var b = 0; for(var j = 0; j < 8; j++) b = (b << 1) | bits[i + j]; data.push(b); }
    // ② 블록 나누기 + 오류 정정 + 엇갈려 놓기
    var nb = BLK_M[v], el = ECC_M[v], raw = Math.floor(rawModules(v) / 8), nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    var div = rsDivisor(el), blocks = [], k = 0;
    for(i = 0; i < nb; i++){
      var d = data.slice(k, k + shortLen - el + (i < nShort ? 0 : 1)); k += d.length;
      var e = rsRemainder(d, div); if(i < nShort) d.push(0); blocks.push(d.concat(e));
    }
    var cw = [];
    for(i = 0; i < blocks[0].length; i++) for(j = 0; j < blocks.length; j++) if(i !== shortLen - el || j >= nShort) cw.push(blocks[j][i]);
    // ③ 기능 패턴
    var size = v * 4 + 17, M = [], F = [];
    for(i = 0; i < size; i++){ M.push(new Array(size).fill(false)); F.push(new Array(size).fill(false)); }
    var set = function(x, y, dark){ M[y][x] = !!dark; F[y][x] = true; };
    for(i = 0; i < size; i++){ set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function(c){
      for(var dy = -4; dy <= 4; dy++) for(var dx = -4; dx <= 4; dx++){
        var x = c[0] + dx, y = c[1] + dy, dist = Math.max(Math.abs(dx), Math.abs(dy));
        if(x >= 0 && x < size && y >= 0 && y < size) set(x, y, dist !== 2 && dist !== 4);
      }
    });
    var ap = alignPos(v, size), na = ap.length;
    for(i = 0; i < na; i++) for(j = 0; j < na; j++){
      if((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
      for(var dy2 = -2; dy2 <= 2; dy2++) for(var dx2 = -2; dx2 <= 2; dx2++) set(ap[i] + dx2, ap[j] + dy2, Math.max(Math.abs(dx2), Math.abs(dy2)) !== 1);
    }
    var drawFormat = function(mask){
      var dt = (FMT_M << 3) | mask, rem = dt;
      for(var q = 0; q < 10; q++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var fb = ((dt << 10) | rem) ^ 0x5412, bit = function(n){ return ((fb >>> n) & 1) !== 0; };
      for(q = 0; q <= 5; q++) set(8, q, bit(q));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for(q = 9; q < 15; q++) set(14 - q, 8, bit(q));
      for(q = 0; q < 8; q++) set(size - 1 - q, 8, bit(q));
      for(q = 8; q < 15; q++) set(8, size - 15 + q, bit(q));
      set(8, size - 8, true);
    };
    drawFormat(0);
    if(v >= 7){
      var rem = v; for(i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vb = (v << 12) | rem;
      for(i = 0; i < 18; i++){ var bt = ((vb >>> i) & 1) !== 0, a = size - 11 + i % 3, bb = Math.floor(i / 3); set(a, bb, bt); set(bb, a, bt); }
    }
    // ④ 데이터 채우기(지그재그)
    var bi = 0;
    for(var right = size - 1; right >= 1; right -= 2){
      if(right === 6) right = 5;
      for(var vert = 0; vert < size; vert++) for(j = 0; j < 2; j++){
        var x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if(!F[y][x] && bi < cw.length * 8){ M[y][x] = ((cw[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0; bi++; }
      }
    }
    // ⑤ 마스크 8가지 중 가장 보기 좋은 것
    var maskFn = [
      function(x, y){ return (x + y) % 2 === 0; }, function(x, y){ return y % 2 === 0; }, function(x){ return x % 3 === 0; },
      function(x, y){ return (x + y) % 3 === 0; }, function(x, y){ return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
      function(x, y){ return x * y % 2 + x * y % 3 === 0; }, function(x, y){ return (x * y % 2 + x * y % 3) % 2 === 0; },
      function(x, y){ return ((x + y) % 2 + x * y % 3) % 2 === 0; }];
    var apply = function(m){ for(var yy = 0; yy < size; yy++) for(var xx = 0; xx < size; xx++) if(!F[yy][xx] && maskFn[m](xx, yy)) M[yy][xx] = !M[yy][xx]; };
    var penalty = function(){
      var p = 0, dark = 0, yy, xx, run, c;
      for(yy = 0; yy < size; yy++){ run = 1; for(xx = 1; xx <= size; xx++){ if(xx < size && M[yy][xx] === M[yy][xx - 1]) run++; else { if(run >= 5) p += run - 2; run = 1; } } }
      for(xx = 0; xx < size; xx++){ run = 1; for(yy = 1; yy <= size; yy++){ if(yy < size && M[yy][xx] === M[yy - 1][xx]) run++; else { if(run >= 5) p += run - 2; run = 1; } } }
      for(yy = 0; yy < size - 1; yy++) for(xx = 0; xx < size - 1; xx++){ c = M[yy][xx]; if(c === M[yy][xx + 1] && c === M[yy + 1][xx] && c === M[yy + 1][xx + 1]) p += 3; }
      for(yy = 0; yy < size; yy++) for(xx = 0; xx < size; xx++) if(M[yy][xx]) dark++;
      return p + Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    };
    var best = 0, bestP = Infinity;
    for(var m = 0; m < 8; m++){ apply(m); drawFormat(m); var pp = penalty(); if(pp < bestP){ bestP = pp; best = m; } apply(m); }
    apply(best); drawFormat(best);
    return M;
  }

  function svg(text, opt){
    opt = opt || {};
    var M = matrix(text), n = M.length, q = 4, all = n + q * 2, d = "";
    for(var y = 0; y < n; y++) for(var x = 0; x < n; x++) if(M[y][x]) d += "M" + (x + q) + "," + (y + q) + "h1v1h-1z";
    var s = opt.size ? ' width="' + opt.size + '" height="' + opt.size + '"' : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + all + " " + all + '"' + s + ' shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
  }
  g.TTQR = {matrix: matrix, svg: svg};
})(typeof window !== "undefined" ? window : this);
