/* 수학 놀이터 공통 도구 (K)
   · 소리: 파일 없이 Web Audio로 만듭니다. 켜고 끄기는 수업 도구와 같은 설정(tt_class_v1.sound)을 씁니다.
   · 효과: 색종이, 불꽃, 화면 흔들기, 번쩍, 큰 글자 알림
   · 모둠 점수: 수업 도구 🏆 모둠 점수와 같은 자료(tt_class_v1.scores[반코드])라 어디서 더해도 함께 쌓입니다.
   · 게임 등록: K.game({id, icon, name, cat, desc, mount(el)}) — mount는 정리 함수를 돌려줄 수 있습니다. */
var K = (function(){
  "use strict";
  var KEY = "tt_class_v1";
  var C = TT.store.get(KEY, null) || {}; C.v = 1; C.picks = C.picks || {}; C.scores = C.scores || {}; if(C.sound == null) C.sound = true;
  function save(){ var cur = TT.store.get(KEY, null) || {}; cur.v = 1; cur.sound = C.sound; cur.scores = C.scores; cur.picks = cur.picks || C.picks; TT.store.set(KEY, cur); }

  /* ---------- 작은 도우미 ---------- */
  function h(tag, cls, text){ var e = document.createElement(tag); if(cls) e.className = cls; if(text != null) e.textContent = text; return e; }
  function btn(text, cls, fn){ var b = h("button", "btn" + (cls ? " " + cls : ""), text); b.type = "button"; if(fn) b.onclick = fn; return b; }
  function rnd(n){ var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
  function ri(a, b){ return a + rnd(b - a + 1); }
  function pick(a){ return a[rnd(a.length)]; }
  function shuffle(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ var t = a % b; a = b; b = t; } return a; }
  function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function sg(n){ return n < 0 ? "−" + (-n) : String(n); }

  /* ---------- 소리 ---------- */
  var AC = null;
  function ac(){ if(!AC){ try{ AC = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){} } if(AC && AC.state === "suspended") AC.resume(); return AC; }
  function tone(f, dur, type, vol, when, f2){
    if(!C.sound) return; var a = ac(); if(!a) return;
    var t = a.currentTime + (when || 0), o = a.createOscillator(), g = a.createGain();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t); if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .2, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .02);
  }
  function noise(dur, vol, when, lp){
    if(!C.sound) return; var a = ac(); if(!a) return;
    var t = a.currentTime + (when || 0), n = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    var s = a.createBufferSource(), g = a.createGain(), f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = lp || 1200;
    s.buffer = b; g.gain.value = vol || .5; s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
  var S = {
    click: function(){ tone(900, .05, "square", .06); },
    tick: function(){ tone(1500, .03, "square", .05); },
    pop: function(){ tone(500, .12, "sine", .25, 0, 1100); },
    coin: function(){ tone(988, .08, "square", .12); tone(1319, .3, "square", .12, .08); },
    good: function(){ [660, 880, 1320].forEach(function(f, i){ tone(f, .18, "triangle", .2, i * .08); }); },
    bad: function(){ tone(220, .35, "sawtooth", .15, 0, 110); },
    whoosh: function(){ noise(.35, .25, 0, 2500); },
    boom: function(){ noise(1.2, .9, 0, 600); tone(90, .9, "sine", .5, 0, 30); },
    drum: function(sec){ var n = Math.floor((sec || 1.2) / .06); for(var i = 0; i < n; i++) noise(.05, .12 + i / n * .25, i * .06, 900); },
    fanfare: function(){ [523, 659, 784, 1047].forEach(function(f, i){ tone(f, .35, "triangle", .2, i * .11); }); },
    win: function(){ [523, 659, 784, 1047, 784, 1047, 1319].forEach(function(f, i){ tone(f, i === 6 ? .8 : .22, "triangle", .22, i * .13); }); },
    sad: function(){ [392, 370, 349, 330].forEach(function(f, i){ tone(f, .4, "triangle", .16, i * .3); }); },
    step: function(i){ tone(600 + (i || 0) * 40, .07, "triangle", .14); },
    dice: function(){ for(var i = 0; i < 7; i++) noise(.04, .3, i * .07, 3000); }
  };

  /* ---------- 효과 ---------- */
  var COLORS = ["#ffd23f", "#ff6b6b", "#4dabf7", "#69db7c", "#f783ac", "#ffa94d", "#9775fa"];
  function layer(){ var l = document.getElementById("fx"); if(!l){ l = h("div"); l.id = "fx"; document.body.appendChild(l); } return l; }
  function confetti(x, y, n){
    var L = layer(); x = x == null ? innerWidth / 2 : x; y = y == null ? innerHeight / 2 : y;
    for(var i = 0; i < (n || 70); i++){
      var s = h("i", "conf"); s.style.left = x + "px"; s.style.top = y + "px"; s.style.background = COLORS[i % COLORS.length];
      var a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 420;
      s.style.setProperty("--dx", Math.cos(a) * r + "px"); s.style.setProperty("--dy", Math.sin(a) * r - 80 + "px"); s.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
      s.style.animationDelay = (Math.random() * .15) + "s"; L.appendChild(s);
    }
    setTimeout(function(){ Array.prototype.forEach.call(L.querySelectorAll(".conf"), function(e){ e.remove(); }); }, 1900);
  }
  function fireworks(times){
    times = times || 5;
    for(var k = 0; k < times; k++) (function(k){ setTimeout(function(){ confetti(innerWidth * (.2 + Math.random() * .6), innerHeight * (.2 + Math.random() * .4), 45); if(C.sound) noise(.25, .3, 0, 1800); }, k * 380); })(k);
  }
  function shake(el){ el = el || document.body; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); setTimeout(function(){ el.classList.remove("shake"); }, 600); }
  function flash(color){ var f = h("div", "flash"); f.style.background = color || "#fff"; layer().appendChild(f); setTimeout(function(){ f.remove(); }, 650); }
  function big(text, sub, color, ms){
    var L = layer(), b = h("div", "bigmsg"); var t = h("div", "t", text); if(color) t.style.color = color; b.appendChild(t); if(sub) b.appendChild(h("div", "s", sub));
    L.appendChild(b); b.onclick = function(){ b.remove(); }; setTimeout(function(){ b.classList.add("out"); setTimeout(function(){ b.remove(); }, 400); }, ms || 1800);
  }
  /* 둥근 타이머: el 안에 그림, 끝나면 onEnd. stop()으로 멈춤 */
  function timer(el, sec, onEnd){
    var end = Date.now() + sec * 1000, dead = false;
    el.innerHTML = '<svg viewBox="0 0 36 36" class="ring"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#e4eaf0" stroke-width="3"/><circle class="a" cx="18" cy="18" r="15.9" fill="none" stroke-width="3" pathLength="100" transform="rotate(-90 18 18)" stroke-linecap="round"/></svg><b></b>';
    var a = el.querySelector(".a"), b = el.querySelector("b"), last = -1;
    (function loop(){
      if(dead) return; var left = Math.max(0, end - Date.now()), r = left / (sec * 1000), s = Math.ceil(left / 1000);
      a.setAttribute("stroke-dasharray", (r * 100) + " 100"); a.setAttribute("stroke", r > .3 ? "#2e7d4f" : r > .1 ? "#e0a100" : "#d62828"); b.textContent = s;
      if(s !== last){ last = s; if(s <= 5 && s > 0) tone(s <= 3 ? 1200 : 900, .07, "square", .1); }
      if(left <= 0){ dead = true; tone(440, .6, "square", .2); tone(330, .8, "square", .2, .3); el.classList.add("over"); if(onEnd) onEnd(); return; }
      requestAnimationFrame(loop);
    })();
    return {stop: function(){ dead = true; }};
  }
  /* 주사위 굴리기: 요소 안에 ⚀~⚅을 굴리다 값에서 멈춤 */
  var DIE = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  function rollDice(els){
    els = [].concat(els); var vals = els.map(function(){ return ri(1, 6); }); S.dice();
    return new Promise(function(res){
      var n = 0; els.forEach(function(e){ e.classList.add("rolling"); });
      var iv = setInterval(function(){
        els.forEach(function(e){ e.textContent = DIE[rnd(6)]; });
        if(++n > 9){ clearInterval(iv); els.forEach(function(e, i){ e.textContent = DIE[vals[i] - 1]; e.classList.remove("rolling"); e.classList.add("land"); setTimeout(function(){ e.classList.remove("land"); }, 400); }); S.pop(); res(vals); }
      }, 70);
    });
  }

  /* ---------- 모둠 점수 (수업 도구와 같은 자료) ---------- */
  var TCOL = ["#4c8bf5", "#f5634c", "#35b56a", "#f2a516", "#9b5de5", "#00b8a9", "#ef476f", "#6c757d"];
  var cls = null, turn = 0, listeners = [];
  function code(){ return cls && cls.grade && cls.cls ? cls.grade * 100 + cls.cls : (cls ? cls.id : "_"); }
  function sc(){ var k = code(); var o = C.scores[k]; if(!o){ o = C.scores[k] = {g: []}; for(var i = 0; i < 4; i++) o.g.push({name: (i + 1) + "모둠", score: 0}); } return o; }
  function teams(){ return sc().g.map(function(g, i){ return {i: i, name: g.name, score: g.score, color: TCOL[i % TCOL.length]}; }); }
  function emit(ev){ listeners.forEach(function(f){ try{ f(ev); }catch(e){} }); }
  function add(i, n, why){
    var o = sc(); if(!o.g[i]) return; o.g[i].score = Math.max(-99, o.g[i].score + n); save();
    if(n > 0) S.coin(); else if(n < 0) S.bad();
    emit({type: "score", i: i, n: n, why: why});
  }
  function setScore(i, v){ var o = sc(); if(o.g[i]){ o.g[i].score = v; save(); emit({type: "score", i: i, n: 0}); } }
  function setTurn(i){ turn = ((i % sc().g.length) + sc().g.length) % sc().g.length; emit({type: "turn"}); }
  function nextTurn(){ setTurn(turn + 1); }
  function setCount(n){ var o = sc(); while(o.g.length < n) o.g.push({name: (o.g.length + 1) + "모둠", score: 0}); o.g.length = n; save(); if(turn >= n) turn = 0; emit({type: "teams"}); }
  function resetScores(){ sc().g.forEach(function(g){ g.score = 0; }); save(); emit({type: "teams"}); }
  function rename(i, nm){ var o = sc(); if(o.g[i]){ o.g[i].name = nm; save(); emit({type: "teams"}); } }
  function setClass(c){ cls = c; turn = 0; emit({type: "teams"}); }

  /* 모둠 고르기 창: 누가 맞혔나요? → cb(i) */
  function askTeam(title, cb){
    var d = h("dialog", "teampick"), f = h("form"); d.appendChild(f); document.body.appendChild(d);
    f.appendChild(h("h2", "", title || "어느 모둠?"));
    var row = h("div", "tp"); teams().forEach(function(t){ var b = btn(t.name, "", function(){ d.close(); cb(t.i); }); b.style.background = t.color; b.style.borderColor = t.color; b.style.color = "#fff"; row.appendChild(b); });
    f.appendChild(row); var c = btn("취소", "", function(){ d.close(); }); f.appendChild(c);
    d.addEventListener("close", function(){ d.remove(); }); d.showModal();
  }

  /* ---------- 게임 등록 ---------- */
  var games = [];
  function css(t){ var st = document.createElement("style"); st.textContent = t; document.head.appendChild(st); }
  /* 놀이 설정 (이 기기): tt_play_v1 — 보물 상자·돌림판 칸 등 선생님이 고친 것 */
  function pref(k, v){ var o = TT.store.get("tt_play_v1", null) || {}; if(v === undefined) return o[k]; o[k] = v; TT.store.set("tt_play_v1", o); }
  function game(g){ games.push(g); }
  /* 놀이를 옮기면 예약해 둔 일(상 주기 창 등)은 하지 않습니다 */
  var epoch = 0;
  function later(fn, ms){ var e = epoch; return setTimeout(function(){ if(e === epoch) fn(); }, ms); }

  return {
    C: C, h: h, btn: btn, rnd: rnd, ri: ri, pick: pick, shuffle: shuffle, gcd: gcd, sleep: sleep, sg: sg,
    S: S, tone: tone, noise: noise, sound: function(v){ if(v != null){ C.sound = !!v; save(); } return C.sound; },
    layer: layer, confetti: confetti, fireworks: fireworks, shake: shake, flash: flash, big: big, timer: timer, rollDice: rollDice, DIE: DIE,
    teams: teams, add: add, setScore: setScore, turn: function(){ return turn; }, setTurn: setTurn, nextTurn: nextTurn, setCount: setCount, resetScores: resetScores, rename: rename, setClass: setClass,
    on: function(f){ listeners.push(f); }, off: function(f){ listeners = listeners.filter(function(x){ return x !== f; }); }, askTeam: askTeam, TCOL: TCOL,
    game: game, games: games, later: later, bump: function(){ epoch++; }, css: css, pref: pref
  };
})();
