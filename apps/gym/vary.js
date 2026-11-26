/* 공부 Gym — 🔀 변형 엔진 (PLAN_공부Gym 3부 21단계, v2.42.0)
   "같은 문제가 또 나와요"를 줄이기 위해, 이미 있는 문항으로 '같은 개념 · 다른 얼굴' 문항을 만듭니다.
   rooms.js 다음, index.html 앞에서 읽습니다. 자료 파일(soc.js·sci.js·math.js…)은 그대로 둡니다.
   · 🌏 통합사회 개념어 1개 → 4가지 얼굴: 뜻 고르기(원래) · 거꾸로(뜻 → 낱말) · 빈칸 채우기 · 짝 OX
     오답 보기는 같은 단원 낱말에서 골라 헷갈리는 것끼리 구별하게 합니다.
   · 🔬 통합과학·🌏 통합사회 〈보기〉 ㄱㄴㄷ 생성기: 같은 단원 문장 3개로 '옳은 것만 고르기'(학평 형식) — 조합이 매번 달라짐
   · 🧮 수학 계산: 5문제 중 1문제쯤은 '값 고르기'나 '답 맞는지 OX'로 형식을 바꿔 냄(계산은 그대로)
   새 id 는 원래 id 뒤에 #r · #b · #x 를 붙입니다(학생 기기의 복습 상자가 id 로 연결됨). */
(function(){
  "use strict";
  if(typeof GYM_ROOMS === "undefined") return;
  var R = GYM_ROOMS;
  function shuffle(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
  var BX = [["ㄱ"], ["ㄷ"], ["ㄱ", "ㄴ"], ["ㄴ", "ㄷ"], ["ㄱ", "ㄴ", "ㄷ"]], KK = ["ㄱ", "ㄴ", "ㄷ"];
  /* 〈보기〉 문항 만들기: pool = [{s: 문장, t: 참/거짓, e: 해설}] */
  function boxItem(idp, tag, u, pool, ask){
    var T = shuffle(pool.filter(function(x){ return x.t; })), F = shuffle(pool.filter(function(x){ return !x.t; }));
    var ok = BX.filter(function(b){ return b.length <= T.length && 3 - b.length <= F.length; });
    if(!ok.length) return null;
    var ans = pick(ok), ti = 0, fi = 0, st = KK.map(function(k){ return ans.indexOf(k) >= 0 ? T[ti++] : F[fi++]; });
    var opts = BX.map(function(b){ return b.join(", "); }), rs = ans.join(", ");
    return {id: idp + st.map(function(x){ return x.s.length; }).join("."), tag: tag, u: u, bx: true,
      q: "〈보기〉\n" + st.map(function(x, i){ return KK[i] + ". " + x.s; }).join("\n"), ask: ask, c: opts, a: opts.indexOf(rs), keep: true,
      e: st.map(function(x, i){ return KK[i] + (x.t ? " ○" : " ✕") + (x.e && !x.t ? " " + x.e : ""); }).join(" · ")};
  }
  function addGen(room, tagOf, make, ratio){
    var r = R[room]; if(!r) return;
    var orig = r.gen, tags = [], uo = Object.assign({}, r.unitOf || {});
    Object.keys(make).forEach(function(u){ var t = tagOf(u); tags.push(t); uo[t] = u; });
    r.genTags = (r.genTags || []).concat(tags); r.unitOf = uo;
    var TU = {}; tags.forEach(function(t){ TU[t] = uo[t]; });
    r.gen = function(lv, tag){
      if(tag && TU[tag]){ var o = make[TU[tag]](); if(o) return o; }
      if(orig) return orig(lv, tag && !TU[tag] ? tag : undefined);
      return make[pick(Object.keys(make))]();
    };
    if(ratio != null && (r.genRatio == null || r.genRatio > ratio)) r.genRatio = ratio;
  }
  var FN = {}; if(typeof GYM_MAP !== "undefined") Object.keys(GYM_MAP).forEach(function(k){ GYM_MAP[k].groups.forEach(function(g){ g.f.forEach(function(f){ FN[f[0]] = f[1]; }); }); });

  /* 🌏 통합사회 개념어 → 거꾸로 · 빈칸 · 짝 OX */
  if(R.soc && R.soc.bank){
    var W = R.soc.bank.filter(function(it){ return it.tag === "개념어" && it.e && it.e.indexOf(": ") > 0 && it.u; }).map(function(it){
      var k = it.e.indexOf(": "); return {it: it, w: it.e.slice(0, k), m: it.e.slice(k + 2), u: it.u};
    });
    var byU = {}; W.forEach(function(x){ (byU[x.u] = byU[x.u] || []).push(x); });
    function mates(x, n){ var l = shuffle((byU[x.u] || []).filter(function(y){ return y.w !== x.w && y.m !== x.m; })); if(l.length < n) l = l.concat(shuffle(W.filter(function(y){ return y.u !== x.u && y.w !== x.w; }))); return l.slice(0, n); }
    var add = [];
    W.forEach(function(x, i){
      add.push({id: x.it.id + "#r", tag: "개념어 · 거꾸로", u: x.u, q: x.m, ask: "이 뜻을 가진 개념어는?", e: x.w + ": " + x.m,
        mk: function(){ return {c: [x.w].concat(mates(x, 3).map(function(y){ return y.w; })), a: 0}; }});
      if(/\[[^\]]+\]/.test(x.it.q)) add.push({id: x.it.id + "#b", tag: "개념어 · 빈칸", u: x.u, q: x.it.q.replace(/\[[^\]]+\]/, "(　　　)"), ask: "빈칸에 알맞은 말은?", e: x.w + ": " + x.m,
        mk: function(){ return {c: [x.w].concat(mates(x, 3).map(function(y){ return y.w; })), a: 0}; }});
      var tru = i % 2 === 0, ml = (byU[x.u] || []).filter(function(y){ return y.w !== x.w && y.m !== x.m; }), alt = tru ? null : ml.length ? ml[i % ml.length] : null;
      if(alt) add.push({id: x.it.id + "#x", tag: "개념어 · 짝 OX", u: x.u, q: x.w + " — " + alt.m, c: ["O", "X"], a: 1, ox: true, e: "틀린 짝 · " + x.w + ": " + x.m + " / 위의 뜻은 '" + alt.w + "'"});
      else add.push({id: x.it.id + "#x", tag: "개념어 · 짝 OX", u: x.u, q: x.w + " — " + x.m, c: ["O", "X"], a: 0, ox: true, e: "맞는 짝 · " + x.w + ": " + x.m});
    });
    /* 짝 OX 는 늘 같은 짝(같은 단원 낱말 중 순서대로 정함)이라 복습 때도 같은 문제로 나옵니다 */
    R.soc.bank = R.soc.bank.concat(add);
    var smk = {};
    Object.keys(byU).forEach(function(u){
      smk[u] = function(){
        var pool = [];
        byU[u].forEach(function(x){
          if(Math.random() < .5) pool.push({s: x.w + ": " + x.m, t: true});
          else { var y = mates(x, 1)[0]; if(y) pool.push({s: x.w + ": " + y.m, t: false, e: "(" + x.w + " → " + x.m + ")"}); }
        });
        return boxItem("soc:bx:" + u + ":", "〈보기〉 고르기 · " + (FN[u] || "개념어"), u, pool, "개념어와 뜻이 바르게 짝지어진 것만을 〈보기〉에서 고른 것은?");
      };
    });
    addGen("soc", function(u){ return "〈보기〉 고르기 · " + (FN[u] || u); }, smk, .2);
  }

  /* 🔬 통합과학 개념 OX → 〈보기〉 ㄱㄴㄷ */
  if(R.sci && R.sci.bank){
    var OXU = {};
    R.sci.bank.forEach(function(it){ if(it.ox && it.u && it.q) (OXU[it.u] = OXU[it.u] || []).push({s: it.q, t: it.a === 0, e: it.e}); });
    var cmk = {};
    Object.keys(OXU).forEach(function(u){ if(OXU[u].length >= 5) cmk[u] = function(){ return boxItem("sci:bx:" + u + ":", "〈보기〉 고르기 · " + (FN[u] || "개념"), u, OXU[u], "옳은 것만을 〈보기〉에서 있는 대로 고른 것은?"); }; });
    addGen("sci", function(u){ return "〈보기〉 고르기 · " + (FN[u] || u); }, cmk, .35);
  }

  /* 📖 국어 문법·문학·화법·작문 카드 → 답 확인 OX · 〈보기〉 ㄱㄴㄷ (27단계, v2.43.0)
     카드 하나(물음 + 정답)를 '사실'로 보고, 같은 단원의 오답 보기와 짝지어 다른 얼굴로 냅니다. 새 id = 원래 id + "#x" */
  if(R.kor && R.kor.bank){
    var KC = R.kor.bank.filter(function(it){ return /카드$/.test(it.tag || "") && it.u && it.c && it.c.length >= 2 && it.a === 0; });
    var kadd = [], KU = {};
    KC.forEach(function(it, i){
      var tru = i % 2 === 0, w = it.c[1 + (i % (it.c.length - 1))], q = String(it.q).replace(/\s*[?？]\s*$/, "");
      kadd.push({id: it.id + "#x", tag: it.tag.replace(/카드$/, "카드 · 답 확인"), u: it.u, q: it.q, ask: "「" + (tru ? it.c[0] : w) + "」이(가) 답이면 O, 아니면 X", c: ["O", "X"], ox: true, a: tru ? 0 : 1,
        e: (tru ? "맞아요 · " : "답은 「" + it.c[0] + "」 · ") + (it.e || "")});
      (KU[it.u] = KU[it.u] || []).push({q: q, t: it.c[0], f: it.c.slice(1), e: it.e});
    });
    R.kor.bank = R.kor.bank.concat(kadd);
    var kmk = {};
    Object.keys(KU).forEach(function(u){ if(KU[u].length >= 5) kmk[u] = function(){
      var pool = KU[u].map(function(x){ return Math.random() < .5 ? {s: x.q + " → " + x.t, t: true} : {s: x.q + " → " + pick(x.f), t: false, e: "(→ " + x.t + ")"}; });
      return boxItem("kor:bx:" + u + ":", "〈보기〉 고르기 · " + (FN[u] || "카드"), u, pool, "물음과 답이 바르게 짝지어진 것만을 〈보기〉에서 고른 것은?");
    }; });
    addGen("kor", function(u){ return "〈보기〉 고르기 · " + (FN[u] || u); }, kmk, .25);
  }

  /* 🧮 수학 계산: 형식 바꾸기 (값 고르기 · 답 OX) — 같은 계산 근육, 다른 얼굴 */
  if(R.math && R.math.gen){
    var mg = R.math.gen;
    var neg = function(v){ return String(v).replace("-", "−"); };
    R.math.gen = function(lv, tag){
      var o = mg(lv, tag);
      if(!o || !o.num || o.fr || typeof o.n !== "number" || !isFinite(o.n) || Math.random() > .22) return o;
      var n = o.n, cand = shuffle([n + 1, n - 1, -n, n + 2, n - 2, n * 2, n + 10, n - 10, Math.round(n / 2)]).filter(function(v, i, a){ return v !== n && a.indexOf(v) === i && isFinite(v); });
      var x = Object.assign({}, o); delete x.num; delete x.n;
      if(Math.random() < .55){ x.id = o.id + "#c"; x.tag = o.tag; x.ask = o.ask || "값으로 옳은 것은?"; x.c = [neg(n)].concat(cand.slice(0, 3).map(neg)); x.a = 0; }
      else { var tru = Math.random() < .5, k = tru ? n : cand[0]; x.id = o.id + "#x" + neg(k); x.ask = (o.ask ? o.ask.replace(/\s*\(.*\)\s*$/, "").replace(/[?？]\s*$/, "") + " → " : "") + "답이 " + neg(k) + "이면 O"; x.c = ["O", "X"]; x.ox = true; x.a = tru ? 0 : 1; x.e = "답은 " + neg(n) + " · " + (o.e || ""); }
      return x;
    };
  }
})();
