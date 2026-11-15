/* 🍀 운으로 — 보물 상자 · 숫자 폭탄 · 돌림판 · 주사위 말판 · 주사위 합 경주 · 하이·로우 */
(function(){
  "use strict";
  var h = K.h, btn = K.btn;
  K.css([
    /* 차례 고르기 */
    ".turnrow{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;font-weight:800;font-size:14px}",
    ".turnrow button{font:inherit;font-size:14px;font-weight:800;border:3px solid transparent;border-radius:999px;padding:5px 13px;color:#fff;cursor:pointer;opacity:.55}",
    ".turnrow button.on{opacity:1;border-color:#ffd23f;transform:scale(1.08)}",
    /* 보물 상자 */
    ".boxes{display:grid;gap:clamp(6px,1.2vh,12px);width:100%;max-width:980px;flex:1;min-height:0}",
    ".bx{position:relative;border:0;border-radius:16px;cursor:pointer;font:inherit;background:linear-gradient(180deg,#ffcf4d,#f29d0b);box-shadow:0 5px 0 #b06d00,inset 0 -8px 0 rgba(0,0,0,.08);color:#7a3e00;font-weight:900;font-size:clamp(20px,4vh,34px);display:flex;align-items:center;justify-content:center;min-height:0;transition:transform .15s}",
    ".bx:hover{transform:translateY(-3px)}",
    ".bx::before{content:'';position:absolute;left:0;right:0;top:32%;height:12%;background:#c97a00;opacity:.55}",
    ".bx .n{position:relative;background:#fff6d6;border-radius:10px;padding:0 10px;font-size:.7em}",
    ".bx.shk{animation:shake .5s infinite}",
    ".bx.open{background:#fff;box-shadow:0 2px 0 #d9e0e8;border:2px dashed #cfd8e3;cursor:default;color:#33404d;font-size:clamp(15px,2.8vh,24px);flex-direction:column}",
    ".bx.open::before{display:none}.bx.open small{font-size:.55em;color:#8a96a3;font-weight:700}",
    ".bx.good{background:#e3f6e9;border-color:#69db7c}.bx.bad{background:#fdeceb;border-color:#ff8787}.bx.wow{background:#f3eaff;border-color:#b197fc}",
    /* 숫자 폭탄 */
    ".bomb{display:flex;gap:16px;width:100%;height:100%;padding:12px;align-items:stretch}",
    ".bomb .side{width:clamp(170px,24vw,260px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center}",
    ".bomb .bico{font-size:clamp(60px,13vh,110px);line-height:1;transition:transform .2s}",
    ".bomb .rng{font-size:clamp(26px,5.5vh,48px);font-weight:900;color:#c2410c}",
    ".bomb .ud{font-size:clamp(28px,6vh,52px);font-weight:900;height:1.2em}",
    ".bomb .grid{flex:1;display:grid;gap:3px;min-height:0}",
    ".bomb .grid button{border:0;border-radius:7px;font:inherit;font-weight:800;font-size:clamp(11px,1.9vh,17px);background:#fff;box-shadow:0 1px 0 #cfd8e3;cursor:pointer;color:#2d3a48;padding:0;min-height:0}",
    ".bomb .grid button:hover{background:#fff4d6}",
    ".bomb .grid button.x{background:transparent;box-shadow:none;color:#c4ccd6;cursor:default;font-weight:500}",
    ".bomb .grid button.hit{background:#d64545;color:#fff}",
    "@keyframes fuse{50%{transform:scale(1.12) rotate(-6deg)}}",
    /* 돌림판 */
    ".wheel{display:flex;gap:18px;width:100%;height:100%;align-items:center;justify-content:center;padding:10px}",
    ".wheel .wbox{position:relative;height:100%;aspect-ratio:1;max-width:62%}",
    ".wheel canvas{width:100%;height:100%}",
    ".wheel .ptr{position:absolute;left:50%;top:-4px;transform:translateX(-50%);font-size:clamp(28px,6vh,48px);filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));z-index:2}",
    ".wheel .res{font-size:clamp(24px,5vh,44px);font-weight:900;min-height:1.3em;text-align:center}",
    ".wheel .rside{display:flex;flex-direction:column;gap:12px;align-items:center;max-width:34%}",
    ".wheel .hist{font-size:12.5px;color:var(--sub);text-align:center;max-height:22vh;overflow:auto}",
    /* 말판 */
    ".board{flex:1;width:100%;display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(3,1fr);gap:5px;min-height:0;padding:0 6px}",
    ".cell{background:#fff;border-radius:10px;box-shadow:0 2px 0 #cfd8e3;position:relative;display:flex;align-items:flex-start;justify-content:flex-start;padding:3px 5px;font-size:11px;font-weight:800;color:#9aa5b1;min-height:0}",
    ".cell .sp{position:absolute;right:4px;top:2px;font-size:clamp(14px,2.6vh,22px)}",
    ".cell.start{background:#e3f6e9}.cell.goal{background:#fff1c2}",
    ".cell .tk{position:absolute;bottom:3px;display:flex;flex-wrap:wrap;gap:2px;left:4px;right:4px}",
    ".tok{width:clamp(16px,3vh,26px);height:clamp(16px,3vh,26px);border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:900}",
    ".tok.hop{animation:hop .25s}",
    "@keyframes hop{50%{transform:translateY(-12px)}}",
    ".bctl{display:flex;gap:14px;align-items:center;justify-content:center;padding:6px;flex-wrap:wrap}",
    /* 합 경주 */
    ".race{flex:1;width:100%;display:flex;flex-direction:column;gap:3px;padding:6px 12px;min-height:0}",
    ".lane{flex:1;display:flex;align-items:center;gap:8px;min-height:0}",
    ".lane .lb{width:34px;font-weight:900;font-size:clamp(14px,2.4vh,20px);text-align:center;color:#33404d}",
    ".lane .tr{flex:1;height:100%;background:repeating-linear-gradient(90deg,#fff 0,#fff calc(var(--w) - 2px),#e4eaf0 calc(var(--w) - 2px),#e4eaf0 var(--w));border-radius:8px;position:relative;border-right:6px solid #2d3a48}",
    ".lane .hr{position:absolute;top:50%;transform:translate(-50%,-50%) scaleX(-1);font-size:clamp(16px,3.2vh,28px);transition:left .35s cubic-bezier(.3,1.4,.5,1)}",
    ".lane.lit .tr{background-color:#fff6d6}",
    ".lane .ct{width:30px;font-size:12px;color:var(--sub);text-align:right}",
    ".chart{display:flex;gap:4px;align-items:flex-end;height:28vh;width:100%;max-width:760px;padding:0 10px}",
    ".chart .c{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:2px;font-size:12px;font-weight:800}",
    ".chart .b1{width:100%;background:#4c8bf5;border-radius:6px 6px 0 0}",
    ".chart .b2{width:100%;border:2px dashed #f2a516;border-bottom:0;border-radius:6px 6px 0 0;margin-top:-2px}",
    /* 하이로우 */
    ".hl{display:flex;align-items:center;justify-content:center;gap:clamp(14px,4vw,50px);flex:1;width:100%}",
    ".pcard{width:clamp(120px,22vh,200px);aspect-ratio:2/3;border-radius:18px;background:#fff;box-shadow:0 8px 24px rgba(30,60,100,.22);display:flex;align-items:center;justify-content:center;font-size:clamp(60px,14vh,120px);font-weight:900;color:#2d3a48;position:relative;transition:transform .4s}",
    ".pcard.back{background:repeating-linear-gradient(45deg,#4c8bf5 0 12px,#3b74d6 12px 24px);color:transparent}",
    ".pcard.flip{animation:flip .45s}",
    "@keyframes flip{50%{transform:rotateY(90deg)}}",
    ".pcard small{position:absolute;top:10px;left:14px;font-size:22px;color:#9aa5b1}",
    ".hlside{display:flex;flex-direction:column;gap:12px;align-items:center}",
    ".streak{font-size:clamp(22px,4.5vh,40px);font-weight:900;color:#c2410c}",
    ".used{display:flex;gap:3px;flex-wrap:wrap;justify-content:center;max-width:480px}",
    ".used span{font-size:12px;font-weight:800;background:#e4eaf0;border-radius:5px;padding:1px 5px;color:#5b6773}",
    ".used span.out{opacity:.3;text-decoration:line-through}"
  ].join("\n"));

  /* 차례 표시 줄 (모둠 점수와 같은 차례) */
  function turnRow(onPick){
    var row = h("div", "turnrow");
    function draw(){
      row.innerHTML = ""; row.appendChild(h("span", "", "차례"));
      K.teams().forEach(function(t){ var b = h("button", t.i === K.turn() ? "on" : "", t.name); b.type = "button"; b.style.background = t.color; b.onclick = function(){ K.setTurn(t.i); if(onPick) onPick(t.i); }; row.appendChild(b); });
    }
    var f = function(ev){ if(ev.type !== "score") draw(); }; K.on(f); draw();
    row.cleanup = function(){ K.off(f); }; return row;
  }

  /* =============== 🎁 보물 상자 =============== */
  var BOX_DEF = ["+1", "+1", "+2", "+2", "+2", "+3", "+3", "+5", "×2", "꽝", "꽝", "1등과 바꾸기", "1등 −3", "모두 +1", "한 번 더", "−2"];
  K.game({id: "box", icon: "🎁", cat: "luck", name: "보물 상자", desc: "맞힌 모둠이 상자 하나를 엽니다. +점수, ×2, 꽝, 1등과 바꾸기… 끝까지 역전!", mount: function(el, ctl){
    /* 판은 놀이를 옮겨 다녀도 그대로(🏁 퀴즈 배틀에서 맞힌 모둠이 와서 열 수 있게) */
    var BS = K.boxState || (K.boxState = {cont: [], opened: []}), list = K.pref("box") || BOX_DEF.slice(), cont = BS.cont, opened = BS.opened, busy = false;
    var w = h("div", "gwrap"), tr = turnRow(), grid = h("div", "boxes"); w.appendChild(tr); w.appendChild(grid); el.appendChild(w);
    function deal(){ cont = BS.cont = K.shuffle(list); opened = BS.opened = cont.map(function(){ return false; }); draw(); }
    function draw(){
      var n = cont.length; grid.style.gridTemplateColumns = "repeat(" + (n > 16 ? 5 : n > 12 ? 4 : n > 9 ? 4 : 3) + ",1fr)"; grid.style.gridTemplateRows = "repeat(" + Math.ceil(n / (n > 16 ? 5 : n > 9 ? 4 : 3)) + ",1fr)";
      grid.innerHTML = "";
      cont.forEach(function(c, i){
        var b = h("button", "bx"); b.type = "button";
        if(opened[i]){ b.classList.add("open", kind(c)); b.appendChild(h("span", "", c)); b.appendChild(h("small", "", opened[i])); b.disabled = true; }
        else { b.appendChild(h("span", "n", String(i + 1))); b.onclick = function(){ openBox(i, b); }; }
        grid.appendChild(b);
      });
    }
    function kind(c){ return /^\+|모두/.test(c) ? "good" : /꽝|−/.test(c) && !/1등/.test(c) ? "bad" : "wow"; }
    function openBox(i, b){
      if(busy) return; busy = true; var t = K.teams()[K.turn()]; b.classList.add("shk"); K.S.drum(1.1);
      setTimeout(function(){
        b.classList.remove("shk"); var c = cont[i]; opened[i] = t.name; var again = apply(c, t);
        draw(); var r = grid.children[i].getBoundingClientRect(); K.confetti(r.left + r.width / 2, r.top + r.height / 2, kind(c) === "bad" ? 0 : 60);
        busy = false; if(!again) K.nextTurn();
        if(opened.every(Boolean)) setTimeout(function(){ K.big("🎉 상자를 모두 열었어요!", "🔄 새 판으로 다시", null, 2200); }, 1900);
      }, 1150);
    }
    function apply(c, t){
      var T = K.teams(), m;
      if((m = c.match(/^\+(\d+)$/))){ K.add(t.i, +m[1]); K.big(c, t.name + " 점수 획득!", "#2e9d5b"); return false; }
      if((m = c.match(/^[−-](\d+)$/))){ K.add(t.i, -m[1]); K.big(c, "앗! " + t.name, "#d64545"); return false; }
      if(c === "×2"){ K.add(t.i, Math.max(0, t.score)); K.S.win(); K.big("×2 🔥", t.name + " 점수 두 배! (" + Math.max(0, t.score) * 2 + "점)", "#9b5de5"); return false; }
      if(c === "꽝"){ K.S.sad(); K.big("꽝 😝", "다음 기회에…", "#56606b"); return false; }
      if(c === "모두 +1"){ T.forEach(function(x){ K.add(x.i, 1); }); K.big("모두 +1 🎈", "다 같이 축하!", "#2e9d5b"); return false; }
      if(c === "한 번 더"){ K.S.fanfare(); K.big("한 번 더! 🔁", t.name + " 상자를 하나 더 여세요", "#4c8bf5"); return true; }
      var top = Math.max.apply(null, T.map(function(x){ return x.score; })), tops = T.filter(function(x){ return x.score === top; });
      if(/바꾸기/.test(c)){
        if(t.score === top){ K.big("이미 1등! 😎", "바꿀 필요가 없네요", "#9b5de5"); return false; }
        var o = tops[0]; K.setScore(o.i, t.score); K.setScore(t.i, top); K.S.whoosh(); K.S.win(); K.shake(); K.big("🔄 점수 바꾸기!", t.name + " ↔ " + o.name, "#9b5de5"); return false;
      }
      if(/1등/.test(c)){
        var hit = tops.filter(function(x){ return x.i !== t.i; }); m = c.match(/(\d+)/); var n = m ? +m[1] : 3;
        if(!hit.length || top <= 0){ K.big("1등은 바로 우리!", "아무 일도 없어요", "#9b5de5"); return false; }
        hit.forEach(function(x){ K.add(x.i, -n); }); K.S.boom(); K.shake(); K.big("💥 1등 −" + n, hit.map(function(x){ return x.name; }).join(", "), "#d64545"); return false;
      }
      K.S.fanfare(); K.big(c, t.name, "#4c8bf5"); return false;
    }
    function edit(){
      var d = h("dialog"), f = h("form"); d.appendChild(f); document.body.appendChild(d);
      f.innerHTML = '<h2>✏️ 상자 내용 (한 줄에 하나, 9~20개)</h2><p>쓸 수 있는 말: <b>+3</b>, <b>−2</b>, <b>×2</b>, <b>꽝</b>, <b>1등과 바꾸기</b>, <b>1등 −3</b>, <b>모두 +1</b>, <b>한 번 더</b>. 그 밖의 말(예: 숙제 면제 🎫, 노래 한 소절 🎤)은 화면에 크게 보여 주기만 합니다.</p><textarea></textarea><div class="acts"><button type="button" class="btn" id="bd">기본값</button><div class="r"><button type="button" class="btn" id="bx">취소</button><button class="btn primary">저장하고 새 판</button></div></div>';
      var ta = f.querySelector("textarea"); ta.value = list.join("\n");
      f.querySelector("#bd").onclick = function(){ ta.value = BOX_DEF.join("\n"); };
      f.querySelector("#bx").onclick = function(){ d.close(); };
      f.onsubmit = function(e){ e.preventDefault(); var L = ta.value.split("\n").map(function(s){ return s.trim().replace(/^-/, "−"); }).filter(Boolean).slice(0, 20); if(L.length < 4){ TT.ui.toast("4개 이상 적어 주세요."); return; } list = L; K.pref("box", L); d.close(); deal(); };
      d.addEventListener("close", function(){ d.remove(); }); d.showModal();
    }
    ctl.appendChild(btn("✏️ 상자 내용", "", edit)); ctl.appendChild(btn("🔄 새 판", "primary", function(){ K.S.whoosh(); deal(); }));
    if(cont.length) draw(); else deal();
    return function(){ tr.cleanup(); };
  }});

  /* =============== 💣 숫자 폭탄 =============== */
  K.game({id: "bomb", icon: "💣", cat: "luck", name: "숫자 폭탄", desc: "숨은 폭탄 숫자를 피해 차례로 수를 부릅니다. UP·DOWN으로 범위가 줄어들수록 두근두근!", mount: function(el, ctl){
    var N = K.pref("bombN") || 100, lo, hi, bomb, over, ticker = null, pen = K.pref("bombPen") !== false;
    var wrap = h("div", "bomb"), side = h("div", "side"), grid = h("div", "grid"); wrap.appendChild(side); wrap.appendChild(grid); el.appendChild(wrap);
    var ico = h("div", "bico", "💣"), rng = h("div", "rng"), ud = h("div", "ud"), tr = turnRow(); side.appendChild(ico); side.appendChild(rng); side.appendChild(ud); side.appendChild(tr);
    var sel = h("select"); [30, 50, 100, 200].forEach(function(n){ var o = h("option", "", "1 ~ " + n); o.value = n; if(n === N) o.selected = true; sel.appendChild(o); });
    sel.onchange = function(){ N = +sel.value; K.pref("bombN", N); start(); };
    var pl = h("label", "sm"); var cb = h("input"); cb.type = "checkbox"; cb.checked = pen; cb.onchange = function(){ pen = cb.checked; K.pref("bombPen", pen); }; pl.appendChild(cb); pl.appendChild(document.createTextNode(" 터뜨린 모둠 −3"));
    pl.style.display = "flex"; pl.style.gap = "4px"; pl.style.alignItems = "center";
    ctl.appendChild(sel); ctl.appendChild(pl); ctl.appendChild(btn("🔄 새 폭탄", "primary", start));
    function start(){
      lo = 1; hi = N; bomb = K.ri(1, N); over = false; ud.textContent = ""; ico.textContent = "💣"; ico.style.animation = "";
      var cols = N <= 30 ? 6 : N <= 50 ? 10 : N <= 100 ? 10 : 20; grid.style.gridTemplateColumns = "repeat(" + cols + ",1fr)"; grid.style.gridTemplateRows = "repeat(" + Math.ceil(N / cols) + ",1fr)";
      grid.innerHTML = ""; for(var i = 1; i <= N; i++){ var b = h("button", "", String(i)); b.type = "button"; b.dataset.n = i; grid.appendChild(b); }
      draw(); fuse();
    }
    function draw(){
      rng.textContent = lo + " ~ " + hi;
      Array.prototype.forEach.call(grid.children, function(b){ var n = +b.dataset.n; b.classList.toggle("x", n < lo || n > hi); });
      var r = (hi - lo + 1) / N; ico.style.animation = over ? "" : "fuse " + Math.max(.18, r * 1.2) + "s infinite";
    }
    function fuse(){ clearInterval(ticker); if(over) return; var r = (hi - lo + 1) / N; ticker = setInterval(function(){ K.S.tick(); }, Math.max(110, r * 900)); }
    grid.onclick = function(e){
      var b = e.target.closest("button"); if(!b || over || b.classList.contains("x")) return; var n = +b.dataset.n, t = K.teams()[K.turn()];
      if(n === bomb){
        over = true; clearInterval(ticker); b.classList.add("hit"); ico.textContent = "💥"; ico.style.animation = ""; ud.textContent = "";
        K.S.boom(); K.flash("#ff6b6b"); K.shake(document.getElementById("m")); K.big("💥 펑!", n + " — " + t.name + (pen ? " −3" : ""), "#d64545", 2600);
        if(pen) setTimeout(function(){ K.add(t.i, -3); }, 300);
        return;
      }
      if(n < bomb){ lo = n + 1; ud.textContent = "UP ⬆"; ud.style.color = "#2e9d5b"; K.tone(500, .15, "triangle", .2, 0, 900); }
      else { hi = n - 1; ud.textContent = "DOWN ⬇"; ud.style.color = "#4c8bf5"; K.tone(900, .15, "triangle", .2, 0, 500); }
      K.nextTurn(); draw(); fuse();
      if(lo === hi){ ud.textContent = "😱 마지막 하나!"; ud.style.color = "#d64545"; }
    };
    start();
    return function(){ clearInterval(ticker); tr.cleanup(); };
  }});

  /* =============== 🎡 돌림판 =============== */
  var WPRE = {
    "보상·벌칙": ["+1점", "+2점", "+3점", "꽝", "×2", "노래 한 소절 🎤", "칭찬 한마디 💬", "+5점"],
    "모둠 고르기": null,
    "번호 1~10": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    "문제 난이도": ["기초 (1점)", "기초 (1점)", "보통 (2점)", "보통 (2점)", "심화 (3점)", "도전! (5점)"],
    "직접 만들기": null
  };
  var WCOL = ["#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c", "#38d9a9", "#4dabf7", "#748ffc", "#da77f2", "#f783ac", "#a9e34b", "#63e6be", "#ffc078"];
  K.game({id: "wheel", icon: "🎡", cat: "luck", name: "돌림판", desc: "칸을 마음대로 만들어 돌립니다. 보상·벌칙, 모둠 고르기, 번호, 문제 난이도…", mount: function(el, ctl){
    var pre = K.pref("wheelPre") || "보상·벌칙", items = [], ang = 0, spinning = false, raf = 0, remove = false, hist = [];
    var wrap = h("div", "wheel"), wb = h("div", "wbox"), cv = h("canvas"), ptr = h("div", "ptr", "🔻"); wb.appendChild(ptr); wb.appendChild(cv); wrap.appendChild(wb);
    var rs = h("div", "rside"), res = h("div", "res", "돌려 보세요!"), go = h("button", "bigbtn y", "🎡 돌리기"), hs = h("div", "hist"); go.type = "button"; rs.appendChild(res); rs.appendChild(go); rs.appendChild(hs); wrap.appendChild(rs); el.appendChild(wrap);
    var sel = h("select"); Object.keys(WPRE).forEach(function(k){ var o = h("option", "", k); if(k === pre) o.selected = true; sel.appendChild(o); });
    sel.onchange = function(){ pre = sel.value; K.pref("wheelPre", pre); load(); };
    var rl = h("label", "sm"); var rc = h("input"); rc.type = "checkbox"; rc.onchange = function(){ remove = rc.checked; }; rl.appendChild(rc); rl.appendChild(document.createTextNode(" 나온 칸 빼기")); rl.style.display = "flex"; rl.style.gap = "4px"; rl.style.alignItems = "center";
    ctl.appendChild(sel); ctl.appendChild(rl); ctl.appendChild(btn("✏️ 칸 고치기", "", edit));
    function load(){
      if(pre === "모둠 고르기") items = K.teams().map(function(t){ return t.name; });
      else if(pre === "직접 만들기") items = (K.pref("wheelMine") || ["가", "나", "다", "라"]).slice();
      else items = WPRE[pre].slice();
      hist = []; hs.textContent = ""; res.textContent = "돌려 보세요!"; draw();
    }
    function size(){ var r = wb.getBoundingClientRect(), d = Math.max(100, Math.min(r.width, r.height)), p = devicePixelRatio || 1; cv.width = cv.height = Math.round(d * p); return d * p; }
    function draw(){
      var D = cv.width || size(), c = cv.getContext("2d"), R = D / 2, n = items.length || 1, seg = Math.PI * 2 / n;
      c.clearRect(0, 0, D, D); c.save(); c.translate(R, R); c.rotate(ang);
      items.forEach(function(t, i){
        c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R - 6, i * seg, (i + 1) * seg); c.closePath(); c.fillStyle = pre === "모둠 고르기" ? K.TCOL[i % K.TCOL.length] : WCOL[i % WCOL.length]; c.fill(); c.strokeStyle = "#fff"; c.lineWidth = R * .015; c.stroke();
        c.save(); c.rotate(i * seg + seg / 2); c.textAlign = "right"; c.textBaseline = "middle"; c.fillStyle = pre === "모둠 고르기" ? "#fff" : "#2d2d2d";
        var fs = Math.max(10, Math.min(R * .11, R * 2.6 / Math.max(4, n) * 1.1)); c.font = "900 " + fs + "px Malgun Gothic, sans-serif";
        var s = t.length > 9 ? t.slice(0, 9) + "…" : t; c.fillText(s, R - 18, 0); c.restore();
      });
      c.restore(); c.beginPath(); c.arc(R, R, R * .1, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill(); c.lineWidth = R * .02; c.strokeStyle = "#2d3a48"; c.stroke();
    }
    function at(){ var n = items.length, seg = Math.PI * 2 / n, a = ((-Math.PI / 2 - ang) % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2); return Math.floor(a / seg) % n; }
    go.onclick = function(){
      if(spinning || items.length < 2) return; spinning = true; go.disabled = true; res.textContent = "…";
      var v = .35 + Math.random() * .25, last = at();
      (function loop(){
        ang += v; v *= .985; if(v < .045) v *= .975; draw(); var k = at(); if(k !== last){ last = k; K.S.tick(); }
        if(v > .0015) raf = requestAnimationFrame(loop);
        else {
          spinning = false; go.disabled = false; var r = items[at()]; res.textContent = r; K.S.fanfare(); var b = wb.getBoundingClientRect(); K.confetti(b.left + b.width / 2, b.top + b.height / 3, 50); K.big(r, null, "#c2410c", 1600);
          hist.unshift(r); hs.textContent = "나온 것: " + hist.slice(0, 12).join(" · ");
          if(remove){ items.splice(at(), 1); setTimeout(draw, 900); }
        }
      })();
    };
    function edit(){
      var d = h("dialog"), f = h("form"); d.appendChild(f); document.body.appendChild(d);
      f.innerHTML = '<h2>✏️ 돌림판 칸 (한 줄에 하나, 2~24개)</h2><p>고친 것은 "직접 만들기"로 저장됩니다. 같은 말을 두 번 쓰면 그 칸이 나올 확률이 두 배가 돼요.</p><textarea></textarea><div class="acts"><span></span><div class="r"><button type="button" class="btn" id="wx">취소</button><button class="btn primary">저장</button></div></div>';
      var ta = f.querySelector("textarea"); ta.value = items.join("\n"); f.querySelector("#wx").onclick = function(){ d.close(); };
      f.onsubmit = function(e){ e.preventDefault(); var L = ta.value.split("\n").map(function(s){ return s.trim(); }).filter(Boolean).slice(0, 24); if(L.length < 2) return; K.pref("wheelMine", L); pre = "직접 만들기"; sel.value = pre; K.pref("wheelPre", pre); d.close(); load(); };
      d.addEventListener("close", function(){ d.remove(); }); d.showModal();
    }
    var ro = new ResizeObserver(function(){ size(); draw(); }); ro.observe(wb);
    load();
    return function(){ cancelAnimationFrame(raf); ro.disconnect(); };
  }});

  /* =============== 🛤️ 주사위 말판 =============== */
  var SPECIAL = {4: ["⏩", "2칸 앞으로"], 8: ["🎁", "+2점"], 11: ["⏪", "2칸 뒤로"], 14: ["🔁", "한 번 더"], 17: ["🌀", "5칸 순간 이동"], 20: ["⏪", "3칸 뒤로"], 23: ["🎁", "+2점"], 26: ["🕳️", "처음으로!"], 28: ["⏩", "1칸 앞으로"]};
  K.game({id: "track", icon: "🛤️", cat: "luck", name: "주사위 말판", desc: "문제를 맞힌 모둠이 주사위를 굴려 말을 옮깁니다. 함정·순간 이동 칸, 먼저 도착하면 +5점!", mount: function(el, ctl){
    var LEN = 30, pos = {}, busy = false, done = false;
    var w = h("div", "gwrap"), tr = turnRow(), board = h("div", "board"), bc = h("div", "bctl"), die = h("span", "die", "🎲"); w.style.gap = "8px"; w.appendChild(tr); w.appendChild(board);
    var ok = h("button", "bigbtn g", "✅ 맞혔다! 주사위"), no = h("button", "bigbtn k", "❌ 틀림 → 다음 모둠"); ok.type = no.type = "button";
    bc.appendChild(no); bc.appendChild(die); bc.appendChild(ok); w.appendChild(bc); el.appendChild(w);
    ctl.appendChild(btn("🔄 새 판", "primary", reset));
    function cellIndex(i){ var row = Math.floor(i / 10), col = i % 10; if(row === 1) col = 9 - col; return {r: row + 1, c: col + 1}; }
    function reset(){ pos = {}; K.teams().forEach(function(t){ pos[t.i] = 0; }); done = false; K.setTurn(0); draw(); }
    function draw(){
      board.innerHTML = "";
      for(var i = 0; i < LEN; i++){
        var p = cellIndex(i), c = h("div", "cell" + (i === 0 ? " start" : i === LEN - 1 ? " goal" : "")); c.style.gridRow = p.r; c.style.gridColumn = p.c;
        c.appendChild(h("span", "", i === 0 ? "출발" : i === LEN - 1 ? "🏁 도착" : String(i)));
        if(SPECIAL[i]){ var s = h("span", "sp", SPECIAL[i][0]); s.title = SPECIAL[i][1]; c.appendChild(s); }
        var tk = h("div", "tk"); K.teams().forEach(function(t){ if((pos[t.i] || 0) === i){ var o = h("span", "tok", String(t.i + 1)); o.style.background = t.color; o.dataset.t = t.i; tk.appendChild(o); } }); c.appendChild(tk);
        board.appendChild(c);
      }
    }
    async function move(t, steps){
      var dir = steps > 0 ? 1 : -1;
      for(var k = 0; k < Math.abs(steps); k++){ pos[t] = Math.max(0, Math.min(LEN - 1, (pos[t] || 0) + dir)); draw(); var o = board.querySelector('.tok[data-t="' + t + '"]'); if(o) o.classList.add("hop"); K.S.step(pos[t] % 12); await K.sleep(230); }
    }
    ok.onclick = async function(){
      if(busy || done) return; busy = true; ok.disabled = no.disabled = true; var t = K.turn(), T = K.teams()[t], again = false;
      var v = (await K.rollDice(die))[0]; await K.sleep(350); await move(t, v);
      if(pos[t] < LEN - 1 && SPECIAL[pos[t]]){
        var sp = SPECIAL[pos[t]]; await K.sleep(250); K.big(sp[0] + " " + sp[1], T.name, null, 1300); await K.sleep(900);
        if(/앞으로|순간/.test(sp[1])){ K.S.whoosh(); await move(t, parseInt(sp[1], 10)); }
        else if(/뒤로/.test(sp[1])){ K.S.bad(); await move(t, -parseInt(sp[1], 10)); }
        else if(/처음/.test(sp[1])){ K.S.boom(); K.shake(); pos[t] = 0; draw(); }
        else if(/점/.test(sp[1])) K.add(t, 2);
        else if(/한 번 더/.test(sp[1])){ again = true; K.S.fanfare(); }
      }
      if(pos[t] >= LEN - 1){ done = true; K.S.win(); K.fireworks(6); K.big("🏁 " + T.name + " 도착!", "+5점", T.color, 3000); K.add(t, 5); }
      else if(!again) K.nextTurn();
      busy = false; ok.disabled = no.disabled = false;
    };
    no.onclick = function(){ if(busy || done) return; K.S.bad(); K.nextTurn(); };
    var f = function(ev){ if(ev.type === "teams"){ K.teams().forEach(function(t){ if(pos[t.i] == null) pos[t.i] = 0; }); draw(); } }; K.on(f);
    reset();
    return function(){ K.off(f); tr.cleanup(); };
  }});

  /* =============== 🏇 주사위 합 경주 =============== */
  K.game({id: "sumrace", icon: "🏇", cat: "luck", name: "주사위 합 경주", desc: "2~12번 말 중 응원할 말을 고르고, 주사위 두 개의 합만큼… 정말 운일까요? (확률 수업 도입)", mount: function(el, ctl){
    var L = K.pref("raceLen") || 8, posn, cnt, rolls, done, auto = null;
    var w = h("div", "gwrap"), race = h("div", "race"), bc = h("div", "bctl"), d1 = h("span", "die", "⚀"), d2 = h("span", "die", "⚀"), sum = h("span", "q", ""), go = h("button", "bigbtn y", "🎲 굴리기"), au = h("button", "bigbtn k", "▶ 자동");
    go.type = au.type = "button"; w.style.gap = "6px"; w.appendChild(race); bc.appendChild(d1); bc.appendChild(d2); bc.appendChild(sum); bc.appendChild(go); bc.appendChild(au); w.appendChild(bc); el.appendChild(w);
    var sel = h("select"); [6, 8, 10, 12].forEach(function(n){ var o = h("option", "", n + "칸"); o.value = n; if(n === L) o.selected = true; sel.appendChild(o); }); sel.onchange = function(){ L = +sel.value; K.pref("raceLen", L); reset(); };
    ctl.appendChild(sel); ctl.appendChild(btn("📊 결과 보기", "", chart)); ctl.appendChild(btn("🔄 새 경주", "primary", reset));
    function reset(){ stop(); posn = {}; cnt = {}; rolls = 0; done = false; for(var s = 2; s <= 12; s++){ posn[s] = 0; cnt[s] = 0; } sum.textContent = ""; go.disabled = au.disabled = false; draw(); }
    function draw(){
      race.innerHTML = ""; race.style.setProperty("--w", "calc(100% / " + L + ")");
      for(var s = 2; s <= 12; s++){
        var ln = h("div", "lane"); ln.dataset.s = s; ln.appendChild(h("span", "lb", String(s)));
        var t = h("div", "tr"); t.style.setProperty("--w", (100 / L) + "%"); var hr = h("span", "hr", "🏇"); hr.style.left = "calc(" + (posn[s] / L * 100) + "% + " + (posn[s] ? "-14px" : "18px") + ")"; t.appendChild(hr); ln.appendChild(t);
        ln.appendChild(h("span", "ct", cnt[s] + "번")); race.appendChild(ln);
      }
    }
    async function roll(){
      if(done) return; go.disabled = true; var v = await K.rollDice([d1, d2]), s = v[0] + v[1]; sum.textContent = "= " + s; rolls++; cnt[s]++; posn[s]++;
      draw(); var ln = race.querySelector('[data-s="' + s + '"]'); if(ln){ ln.classList.add("lit"); }
      K.tone(400 + s * 50, .12, "triangle", .2);
      if(posn[s] >= L){ done = true; stop(); go.disabled = au.disabled = true; K.S.win(); K.fireworks(4); K.big("🏆 " + s + "번 말 우승!", rolls + "번 굴려서 · 📊 결과 보기로 확인해 봐요", "#c2410c", 3200); setTimeout(chart, 3400); return; }
      go.disabled = false;
    }
    go.onclick = roll;
    function stop(){ clearInterval(auto); auto = null; au.textContent = "▶ 자동"; }
    au.onclick = function(){ if(auto){ stop(); return; } au.textContent = "⏸ 멈춤"; auto = setInterval(function(){ if(!go.disabled) roll(); }, 900); };
    function chart(){
      var d = h("dialog"), f = h("form"); d.style.width = "min(820px,94vw)"; d.appendChild(f); document.body.appendChild(d);
      f.appendChild(h("h2", "", "📊 주사위 두 개의 합 — 실제로 나온 횟수 vs 이론"));
      var ways = {2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1}, mx = 1;
      for(var s = 2; s <= 12; s++) mx = Math.max(mx, cnt[s], rolls * ways[s] / 36);
      var c = h("div", "chart");
      for(s = 2; s <= 12; s++){
        var col = h("div", "c"); col.appendChild(h("span", "", String(cnt[s])));
        var b2 = h("div", "b2"); b2.style.height = (rolls * ways[s] / 36 / mx * 80) + "%"; var b1 = h("div", "b1"); b1.style.height = (cnt[s] / mx * 80) + "%";
        var stack = h("div"); stack.style.cssText = "width:100%;height:100%;display:flex;flex-direction:column;justify-content:flex-end;position:relative"; b2.style.position = "absolute"; b2.style.bottom = "0"; b2.style.left = "0"; b2.style.right = "0"; stack.appendChild(b1); stack.appendChild(b2); col.appendChild(stack);
        col.appendChild(h("b", "", String(s))); col.appendChild(h("small", "", ways[s] + "/36")); c.appendChild(col);
      }
      f.appendChild(c);
      f.appendChild(h("p", "", "파란 막대 = 실제로 나온 횟수(" + rolls + "번), 노란 점선 = 이론으로 기대되는 횟수. 합이 7이 되는 경우는 (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) 여섯 가지라서 가장 자주 나와요. 2와 12는 한 가지뿐! 굴릴수록 두 막대가 비슷해집니다(큰 수의 법칙)."));
      var a = h("div", "acts"); a.appendChild(h("span")); var cl = btn("닫기", "primary", function(){ d.close(); }); a.appendChild(cl); f.appendChild(a);
      d.addEventListener("close", function(){ d.remove(); }); d.showModal();
    }
    reset();
    return stop;
  }});

  /* =============== 🃏 하이·로우 =============== */
  K.game({id: "hilo", icon: "🃏", cat: "luck", name: "하이·로우", desc: "다음 카드가 더 클까, 작을까? 반 전체가 손을 들어 정합니다. 연속으로 맞힌 만큼 점수로!", mount: function(el, ctl){
    var deck, curC, streak = 0, best = 0, used = [], showP = false;
    var w = h("div", "gwrap"), hl = h("div", "hl"), card = h("div", "pcard"), nx = h("div", "pcard back", "?"), side = h("div", "hlside");
    var up = h("button", "bigbtn g", "⬆ 더 크다"), dn = h("button", "bigbtn", "⬇ 더 작다"), st = h("div", "streak"), pr = h("div", "hint"), bank = h("button", "bigbtn y", "🏦 점수로 바꾸기"), us = h("div", "used");
    up.type = dn.type = bank.type = "button"; side.appendChild(up); side.appendChild(st); side.appendChild(dn);
    hl.appendChild(card); hl.appendChild(side); hl.appendChild(nx); w.appendChild(hl); w.appendChild(pr); w.appendChild(bank); w.appendChild(us); el.appendChild(w);
    var pb = btn("🔢 확률 보기", "", function(){ showP = !showP; pb.classList.toggle("primary", showP); draw(); }); ctl.appendChild(pb); ctl.appendChild(btn("🔄 새로 섞기", "primary", function(){ newDeck(); K.S.whoosh(); }));
    function newDeck(){ deck = K.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]); used = []; curC = deck.pop(); used.push(curC); streak = 0; draw(); }
    function draw(){
      card.innerHTML = ""; card.appendChild(h("small", "", "지금")); card.appendChild(document.createTextNode(curC));
      st.textContent = "🔥 " + streak + "연속" + (best ? " (최고 " + best + ")" : "");
      var hi = deck.filter(function(x){ return x > curC; }).length, lo = deck.filter(function(x){ return x < curC; }).length;
      pr.textContent = showP ? "남은 카드 " + deck.length + "장 중 더 큰 수 " + hi + "장 (" + hi + "/" + deck.length + "), 더 작은 수 " + lo + "장 (" + lo + "/" + deck.length + ")" : "1~13 카드 한 벌 · 나온 카드는 다시 나오지 않아요";
      us.innerHTML = ""; for(var i = 1; i <= 13; i++) us.appendChild(h("span", used.indexOf(i) >= 0 ? "out" : "", String(i)));
      bank.disabled = streak < 1;
    }
    function guess(isUp){
      if(!deck.length){ K.big("카드를 다 썼어요", "🔄 새로 섞기", null); return; }
      up.disabled = dn.disabled = true; K.S.drum(.7);
      setTimeout(function(){
        var n = deck.pop(); used.push(n); nx.classList.remove("back"); nx.classList.add("flip"); nx.textContent = n;
        var ok = isUp ? n > curC : n < curC;
        if(ok){ streak++; best = Math.max(best, streak); K.S.good(); var r = nx.getBoundingClientRect(); K.confetti(r.left + r.width / 2, r.top + r.height / 2, 40); if(streak >= 3) K.big("🔥 " + streak + "연속!", null, "#c2410c", 1000); }
        else { K.S.sad(); K.shake(nx); K.big("아쉬워요 😢", streak ? streak + "연속에서 멈춤" : null, "#56606b", 1300); streak = 0; }
        setTimeout(function(){ curC = n; nx.className = "pcard back"; nx.textContent = "?"; up.disabled = dn.disabled = false; if(!deck.length) newDeck(); else draw(); }, 1300);
      }, 700);
    }
    up.onclick = function(){ guess(true); }; dn.onclick = function(){ guess(false); };
    bank.onclick = function(){ var s = streak; K.askTeam("🏦 " + s + "점을 어느 모둠에?", function(i){ K.add(i, s); K.S.win(); streak = 0; draw(); }); };
    newDeck();
  }});
})();
