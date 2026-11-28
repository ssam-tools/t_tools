/* 쌤 노트 소개 발표 공통 엔진 (PLAN_배포 4단계, v2.65.0) — jidangmath가 Claude와 함께 제작
   intro-teacher.html · intro-student.html 이 같은 조작으로 움직입니다. 장 내용은 slides.js (TT_DECK) 한 곳.
   조작: → · Space · PageDown 다음 / ← · PageUp 앞 / Home · End / F 전체 화면 / N 발표 메모 / Esc 실제 화면 닫기 / ?s=장 번호
   [▶ 실제로 열기] 는 견본 쌤 노트(?demo=1, 가짜 학교 '쌤비중학교')를 장 안에 그대로 띄웁니다 — 눌러 보며 설명할 수 있어요.
   견본 자료는 이 탭 안에만 있고 실제 자료는 읽지도 쓰지도 않습니다(shared/demo.js). 발표를 마치고 [← 안내]로 나가면 견본도 끝납니다.

   장 종류(kind)
   · cover  표지          t · lead · tag · sb
   · hook   같은 일 여러 번  items [[제목, 설명, 꼬리표]] · ans
   · cards  카드 3~4장      cards [[그림 글자, 제목, 설명]]
   · day    하루 시계        stops [{tm, em, l, s, go: 장 id}]
   · live   실제 화면        url · img · phone · pts · more [[이름, 주소]] · tab(장 안 대신 새 탭으로 — 홈처럼 화면 전체가 필요한 곳)
   · phones 휴대폰 그림 여러 장 imgs · url
   · cmp    전·후 비교 + 어림 계산 rows [[일, 전, 후, 아끼는 분, 1년 횟수]]
   · routine 하루 공부 고리   mins · blocks [[그림 글자, 이름, 설명]]
   · lvl    레벨 막대        bars [[이름, 높이 %, 레벨]]
   · qr     시작 3단계 + QR   steps [[굵게, 설명]] · qrs [[이름, 저장소 안 주소]] · stamp */
(function(){
  "use strict";
  var R = "../../";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function demoUrl(u){ var h = "", k = u.indexOf("#"); if(k >= 0){ h = u.slice(k); u = u.slice(0, k); } return R + u + (u.indexOf("?") >= 0 ? "&" : "?") + "demo=1" + h; }
  function owl(o){ try{ return window.TT_SBART ? TT_SBART.svg(Object.assign({size: 150}, o || {})) : '<div style="font-size:110px;text-align:center">🦉</div>'; }catch(e){ return ""; } }
  function qrSvg(path){ try{ var u = new URL(R + path, location.href).href; return window.TTQR ? TTQR.svg(u) : ""; }catch(e){ return ""; } }
  function qrHref(path){ try{ return new URL(R + path, location.href).href.replace(/index\.html$/, ""); }catch(e){ return path; } }
  function d(i){ return ' style="animation-delay:' + (0.08 + i * 0.09).toFixed(2) + 's"'; }

  window.TT_DECK_RUN = function(key){
    var D = window.TT_DECK && TT_DECK[key]; if(!D) return;
    var S = D.slides, cur = 0, usedDemo = false, dayTimer = null;
    document.documentElement.classList.add("sbReady");
    function idx(id){ for(var i = 0; i < S.length; i++) if(S[i].id === id) return i; return -1; }

    function head(s){
      return (s.kick ? '<div class="kick in">' + esc(s.kick) + "</div>" : "") + (s.t ? '<h2 class="in"' + d(1) + ">" + s.t + "</h2>" : "") + (s.lead ? '<p class="lead in"' + d(2) + ">" + s.lead + "</p>" : "");
    }
    function sb(s){ return s.sb ? '<div class="sb pop" style="animation:pop .6s .35s both">' + owl(s.sb) + "</div>" + (s.say ? '<div class="say in"' + d(6) + ">" + s.say + "</div>" : "") : ""; }

    function screen(s){
      var ph = !!s.phone, W = ph ? 390 : 1440, H = ph ? 844 : 900, w = ph ? 330 : 900, h = Math.round(w * H / W);
      return '<div class="scr' + (ph ? " ph" : "") + ' in"' + d(3) + ' data-url="' + esc(s.url) + '" data-w="' + W + '" data-h="' + H + '" data-s="' + (w / W) + '">'
        + '<span class="lab">견본 쌤 노트 · 가짜 학교 자료</span><button type="button" class="x" title="그림으로 돌아가기 (Esc)">✕</button>'
        + '<div class="vp" style="width:' + w + "px;height:" + h + 'px">'
        + (s.img ? '<img src="shots/' + s.img + '.webp" alt="' + esc(s.kick || "") + ' 화면 (견본)">' : "")
        + (s.tab ? '<a class="play" href="' + esc(demoUrl(s.url)) + '" target="_blank" rel="noopener"><span>▶ 실제로 열기 ↗</span></a>' : '<button type="button" class="play" data-live="1"><span>▶ 실제로 열기</span></button>') + "</div></div>";
    }
    var R_ = {
      cover: function(s){
        return '<div class="sl cover">' + (s.tag ? '<span class="tag in">' + s.tag + "</span>" : "") + '<h2 class="in"' + d(1) + ">" + s.t + '</h2><p class="lead in"' + d(2) + ">" + (s.lead || "") + "</p>"
          + (s.by ? '<p class="in" style="font-size:18px;color:var(--sub);margin:0;animation-delay:.4s">' + s.by + "</p>" : "")
          + '<div class="sb">' + owl(s.sb) + "</div></div>";
      },
      hook: function(s){
        return '<div class="sl">' + head(s) + '<div class="hook">' + s.items.map(function(x, i){ return "<div class=\"in\"" + d(i + 3) + "><i>" + x[2] + "</i><b>" + x[0] + "</b>" + x[1] + "</div>"; }).join("") + "</div>"
          + (s.ans ? '<div class="ans in" style="animation-delay:1.3s">' + s.ans + "</div>" : "") + sb(s) + "</div>";
      },
      cards: function(s){
        return '<div class="sl">' + head(s) + '<div class="cards' + (s.cards.length > 3 ? " c4" : "") + '">' + s.cards.map(function(c, i){ return '<section class="in"' + d(i + 3) + '><div class="ic">' + c[0] + "</div><h3>" + c[1] + "</h3><p>" + c[2] + "</p></section>"; }).join("") + "</div>" + sb(s) + "</div>";
      },
      day: function(s){
        var n = s.stops.length;
        return '<div class="sl">' + head(s) + '<div class="day"><div class="clock" id="dkClock">' + s.stops[0].tm + "<small>" + esc(s.stops[0].l) + '</small></div><div class="track"></div><div class="sun" id="dkSun" style="left:40px">' + owl({item: "calendar", size: 60}) + "</div>"
          + s.stops.map(function(x, i){ var L = 40 + (1520 - 80) * (i + 0.5) / n; return '<button type="button" class="stop in" style="left:' + L.toFixed(0) + 'px;animation-delay:' + (0.08 + (i + 3) * 0.09).toFixed(2) + 's" data-go="' + idx(x.go) + '" data-i="' + i + '"><b>' + x.tm + '</b><span class="dt"></span><span class="em">' + x.em + '</span><span class="l">' + x.l + "</span><small>" + (x.s || "") + "</small></button>"; }).join("")
          + "</div></div>";
      },
      live: function(s){
        return '<div class="sl"><div class="live"><div class="txt">' + head(s)
          + (s.pts ? '<ol class="steps3">' + s.pts.map(function(p, i){ return '<li class="in"' + d(i + 3) + "><i>" + (i + 1) + "</i><span>" + p + "</span></li>"; }).join("") + "</ol>" : "")
          + '<div class="open in"' + d(7) + '>' + (s.tab ? '<a class="dbtn pri" href="' + esc(demoUrl(s.url)) + '" target="_blank" rel="noopener" title="홈은 화면 전체를 써서 새 탭에서 열어요">▶ 실제로 열기 ↗</a>' : '<button type="button" class="dbtn pri" data-live="1">▶ 실제로 열기</button><a class="dbtn" href="' + esc(demoUrl(s.url)) + '" target="_blank" rel="noopener" title="새 탭에서 견본으로">↗ 새 탭</a>')
          + (s.more || []).map(function(m){ return '<a class="dbtn" href="' + esc(demoUrl(m[1])) + '" target="_blank" rel="noopener">' + esc(m[0]) + " ↗</a>"; }).join("") + "</div></div>"
          + screen(s) + "</div></div>";
      },
      phones: function(s){
        return '<div class="sl"><div class="live"><div class="txt">' + head(s)
          + (s.pts ? '<ol class="steps3">' + s.pts.map(function(p, i){ return '<li class="in"' + d(i + 3) + "><i>" + (i + 1) + "</i><span>" + p + "</span></li>"; }).join("") + "</ol>" : "")
          + (s.url ? '<div class="open in"' + d(7) + '><a class="dbtn pri" href="' + esc(demoUrl(s.url)) + '" target="_blank" rel="noopener">↗ 새 탭에서 열기</a></div>' : "") + "</div>"
          + '<div class="pcs">' + s.imgs.map(function(f, i){ return '<div class="scr ph in"' + d(i + 3) + '><div class="vp" style="width:' + (s.w || 250) + "px;height:" + Math.round((s.w || 250) * 844 / 390) + 'px"><img src="shots/' + f + '.webp" alt="휴대폰 화면 (견본)"></div></div>'; }).join("") + "</div></div></div>";
      },
      cmp: function(s){
        return '<div class="sl">' + head(s) + '<table class="cmp in"' + d(3) + "><thead><tr><th>할 일</th><th>지금까지</th><th>쌤 노트</th><th>아끼는 시간 (어림)</th></tr></thead><tbody>"
          + s.rows.map(function(r, i){ return "<tr><td>" + r[0] + '</td><td class="b">' + r[1] + '</td><td class="a">' + r[2] + '</td><td><input type="number" min="0" max="120" value="' + r[3] + '" data-c="m' + i + '" aria-label="한 번에 아끼는 분"> 분 × <input type="number" min="0" max="2000" value="' + r[4] + '" data-c="t' + i + '" aria-label="1년 횟수"> 번</td></tr>'; }).join("")
          + '</tbody></table><div class="tot in"' + d(5) + '><span style="font-size:26px;font-weight:900">1년이면</span><span class="big" id="dkTot">0시간</span><small>' + (s.foot || "") + "</small></div>" + sb(s) + "</div>";
      },
      routine: function(s){
        var C = 2 * Math.PI * 130;
        return '<div class="sl">' + head(s) + '<div class="routine"><div class="ring in"' + d(3) + '><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="130" fill="none" stroke="var(--line)" stroke-width="26"/><circle class="f" id="dkRing" cx="150" cy="150" r="130" fill="none" stroke="var(--accent)" stroke-width="26" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"/></svg><div class="c"><b id="dkMin">0</b><small>분 · 오늘의 운동</small></div></div>'
          + '<div class="blocks">' + s.blocks.map(function(b, i){ return '<div class="in"' + d(i + 4) + '><span class="em">' + b[0] + "</span><span>" + b[1] + "<small>" + b[2] + "</small></span></div>"; }).join("") + "</div></div>" + sb(s) + "</div>";
      },
      lvl: function(s){
        return '<div class="sl"><div class="live"><div class="txt">' + head(s)
          + (s.pts ? '<ol class="steps3">' + s.pts.map(function(p, i){ return '<li class="in"' + d(i + 3) + "><i>" + (i + 1) + "</i><span>" + p + "</span></li>"; }).join("") + "</ol>" : "")
          + '<div class="open in"' + d(7) + '><a class="dbtn pri" href="' + esc(demoUrl(s.url)) + '" target="_blank" rel="noopener">↗ 새 탭에서 열기</a></div></div>'
          + '<div class="pcs">' + (s.imgs || []).map(function(f, i){ return '<div class="scr ph in"' + d(i + 3) + '><div class="vp" style="width:250px;height:541px"><img src="shots/' + f + '.webp" alt="휴대폰 화면 (견본)"></div></div>'; }).join("")
          + '<div class="lvlw in"' + d(5) + '><div class="lvl">' + s.bars.map(function(b, i){ return '<div style="height:' + b[1] + "%;animation-delay:" + (0.5 + i * 0.12) + 's"><span>' + b[2] + "</span></div>"; }).join("") + '</div><div class="lb">' + s.bars.map(function(b){ return "<span>" + b[0] + "</span>"; }).join("") + '</div><small style="font-size:15px;color:var(--sub)">(예시 그림)</small></div></div></div></div>';
      },
      qr: function(s){
        return '<div class="sl">' + head(s) + '<div class="qrw"><div class="go3">' + s.steps.map(function(x, i){ return '<div class="in"' + d(i + 3) + '><b class="n">' + (i + 1) + "</b><span>" + x[0] + "<small>" + (x[1] || "") + "</small></span></div>"; }).join("") + "</div>"
          + '<div class="qrs">' + s.qrs.map(function(q, i){ return '<div class="qrc in"' + d(i + 5) + '><div class="qb">' + qrSvg(q[1]) + "</div><b>" + q[0] + "</b><small>" + esc(qrHref(q[1])) + "</small></div>"; }).join("") + "</div></div>"
          + (s.stamp ? '<div class="stamp">' + s.stamp + "</div>" : "") + (s.by ? '<p style="position:absolute;left:80px;bottom:8px;margin:0;font-size:16px;color:var(--sub)">' + s.by + "</p>" : "") + "</div>";
      }
    };

    var stage = document.getElementById("stage"), view = document.getElementById("view");
    function fit(){
      var k = Math.min(window.innerWidth / 1600, window.innerHeight / 900) * (document.fullscreenElement ? 1 : 0.98);
      stage.style.transform = "scale(" + k.toFixed(4) + ")";
    }
    window.addEventListener("resize", fit);
    document.addEventListener("fullscreenchange", fit);

    function closeLive(){
      var on = view.querySelector(".scr.on"); if(!on) return false;
      var f = on.querySelector("iframe"); if(f) f.remove();
      on.classList.remove("on"); var p = on.querySelector(".play"); if(p) p.hidden = false; return true;
    }
    function openLive(){
      var sc = view.querySelector(".scr[data-url]"); if(!sc || sc.classList.contains("on")) return;
      var W = +sc.dataset.w, H = +sc.dataset.h, k = +sc.dataset.s, f = document.createElement("iframe");
      f.src = demoUrl(sc.dataset.url); f.title = "견본 쌤 노트"; f.width = W; f.height = H;
      f.style.width = W + "px"; f.style.height = H + "px"; f.style.transform = "scale(" + k + ")";
      sc.querySelector(".vp").appendChild(f); sc.querySelector(".play").hidden = true; sc.classList.add("on"); usedDemo = true;
      var bk = document.getElementById("dkBack"); if(bk && !/demo=0/.test(bk.href)) bk.href += (bk.href.indexOf("?") >= 0 ? "&" : "?") + "demo=0";
    }
    function runDay(){
      clearInterval(dayTimer);
      var s = S[cur]; if(s.kind !== "day") return;
      var stops = view.querySelectorAll(".stop"), sun = document.getElementById("dkSun"), ck = document.getElementById("dkClock"), i = 0;
      function step(){
        if(!stops.length) return;
        stops.forEach(function(b){ b.classList.remove("on"); }); var b = stops[i % stops.length]; b.classList.add("on");
        sun.style.left = (parseFloat(b.style.left) - 0) + "px";
        var x = s.stops[i % stops.length]; ck.innerHTML = x.tm + "<small>" + esc(x.l.replace(/<[^>]+>/g, " ")) + "</small>"; i++;
      }
      step(); dayTimer = setInterval(step, 1600);
    }
    function runCmp(){
      var s = S[cur]; if(s.kind !== "cmp") return;
      var t = 0; s.rows.forEach(function(r, i){ var m = view.querySelector('[data-c="m' + i + '"]'), n = view.querySelector('[data-c="t' + i + '"]'); t += (+m.value || 0) * (+n.value || 0); });
      document.getElementById("dkTot").textContent = "약 " + Math.round(t / 60) + "시간";
    }
    function runRing(){
      var s = S[cur]; if(s.kind !== "routine") return;
      var r = document.getElementById("dkRing"), m = document.getElementById("dkMin"), C = 2 * Math.PI * 130, goal = s.mins || 60, t0 = null;
      setTimeout(function(){ r.style.strokeDashoffset = "0"; }, 300);
      function tick(ts){ if(!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1600); m.textContent = Math.round(goal * p); if(p < 1 && S[cur] === s) requestAnimationFrame(tick); }
      setTimeout(function(){ requestAnimationFrame(tick); }, 300);
    }
    function show(i){
      closeLive();
      cur = Math.max(0, Math.min(S.length - 1, i));
      var s = S[cur];
      view.innerHTML = (R_[s.kind] || R_.cards)(s);
      document.getElementById("bar").style.width = ((cur + 1) / S.length * 100) + "%";
      document.getElementById("dkN").textContent = (cur + 1) + " / " + S.length;
      document.getElementById("dkDots").innerHTML = S.map(function(x, k){ return '<button type="button" data-go="' + k + '" aria-current="' + (k === cur) + '" title="' + esc((k + 1) + ". " + (x.kick || x.t || "").replace(/<[^>]+>/g, "")) + '"></button>'; }).join("");
      document.getElementById("note").innerHTML = s.note ? "🗒 " + s.note : "🗒 (이 장 메모 없음)";
      document.getElementById("dkPrev").disabled = !cur; document.getElementById("dkNext").disabled = cur === S.length - 1;
      try{ history.replaceState(null, "", location.pathname + "?s=" + (cur + 1)); }catch(e){}
      runDay(); runCmp(); runRing();
    }
    document.addEventListener("click", function(e){
      var t = e.target;
      if(t.closest("[data-live]")){ openLive(); return; }
      if(t.closest(".scr .x")){ closeLive(); return; }
      var g = t.closest("[data-go]"); if(g && +g.dataset.go >= 0){ e.preventDefault(); show(+g.dataset.go); return; }
      if(t.closest("#dkPrev")) show(cur - 1); else if(t.closest("#dkNext")) show(cur + 1);
      else if(t.closest("#dkNote")) document.getElementById("note").classList.toggle("on");
      else if(t.closest("#dkFs")) fs();
    });
    document.addEventListener("input", function(e){ if(e.target.closest(".cmp")) runCmp(); });
    function fs(){ try{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }catch(e){} }
    document.addEventListener("keydown", function(e){
      if(/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "") || e.altKey || e.ctrlKey || e.metaKey) return;
      var k = e.key;
      if(k === "ArrowRight" || k === "PageDown" || k === " "){ show(cur + 1); e.preventDefault(); }
      else if(k === "ArrowLeft" || k === "PageUp"){ show(cur - 1); e.preventDefault(); }
      else if(k === "Home"){ show(0); e.preventDefault(); }
      else if(k === "End"){ show(S.length - 1); e.preventDefault(); }
      else if(k === "f" || k === "F" || k === "ㄹ"){ fs(); }
      else if(k === "n" || k === "N" || k === "ㅜ"){ document.getElementById("note").classList.toggle("on"); }
      else if(k === "Enter"){ if(S[cur].kind === "live" && !S[cur].tab) openLive(); }
      else if(k === "Escape"){ closeLive(); }
    });
    /* 밖으로 끌어 넘기기(터치 화면·전자칠판) */
    var sx = null;
    stage.addEventListener("touchstart", function(e){ if(e.target.closest(".scr.on,input")) return; sx = e.touches[0].clientX; }, {passive: true});
    stage.addEventListener("touchend", function(e){ if(sx == null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if(Math.abs(dx) > 60) show(cur + (dx < 0 ? 1 : -1)); });
    fit();
    var q = parseInt(new URLSearchParams(location.search).get("s"), 10);
    show(q > 0 ? q - 1 : 0);
  };
})();
