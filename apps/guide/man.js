/* 쌤 노트 설명서 공통 엔진 (PLAN_배포 3단계, v2.64.0) — jidangmath가 Claude와 함께 제작
   teacher.html · student.html · admin.html 이 같은 모양·같은 조작(← → 키 · 장 고르기 · 🖨 인쇄 · ?p=쪽)으로 움직이게 합니다.
   쪽 내용은 모두 apps/guide/pages.js (TT_MAN) 한 곳에 있습니다 — 쌤비 찾기창도 같은 파일로 설명서 쪽을 찾습니다.

   쪽 종류
   · (기본) img: shots/ 그림 + pt [가로%, 세로%, 설명] 번호
   · phones: 휴대폰 그림 여러 장 — pt 는 그림마다 하나
   · steps: 그림 대신 큰 그림 글자 + 단계 상자 (big · head · steps [[굵게, 설명]] · note · qr: 저장소 안 주소)
   · sum: 한 장 요약 카드 (cards: [{h, flow|chk|rules|keys|role|html}])
   · faq: 책의 faq 목록 */
(function(){
  "use strict";
  var R = "../../";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function demoUrl(u){ var h = "", k = u.indexOf("#"); if(k >= 0){ h = u.slice(k); u = u.slice(0, k); } return u + (u.indexOf("?") >= 0 ? "&" : "?") + "demo=1" + h; }

  window.TT_MAN_RUN = function(key){
    var BOOK = window.TT_MAN && TT_MAN[key]; if(!BOOK) return;
    var PAGES = BOOK.pages, FAQ = BOOK.faq || [], demo = !!window.TT_DEMO;
    document.documentElement.classList.add("sbReady");   // 설명서는 왼쪽 메뉴 없이 넓게 — 쌤비 줄을 기다리지 않고 바로 보이게
    var CH = []; PAGES.forEach(function(p){ if(CH.indexOf(p.ch) < 0) CH.push(p.ch); });
    function idx(id){ for(var i = 0; i < PAGES.length; i++) if(PAGES[i].id === id) return i; return 0; }

    function openBtns(p){
      if(!p.open) return "";
      return '<div class="open">' + p.open.map(function(o, i){
        var ext = /^https?:/.test(o[1]), href = ext ? o[1] : R + o[1];
        return '<a class="btn' + (i ? "" : " primary") + '" href="' + esc(href) + '"' + (ext || o[2] ? ' target="_blank" rel="noopener"' : "") + ">" + esc(o[0]) + (o[2] ? " ↗" : " 바로 열기 ▶") + "</a>"
          + (i || demo || ext || BOOK.noDemo || o[2] ? "" : '<a class="btn" href="' + esc(R + demoUrl(o[1])) + '" target="_blank" rel="noopener" title="가짜 학교 자료로 새 탭에서">견본으로 ↗</a>');
      }).join("") + "</div>";
    }
    function navRow(i, st){ return '<div class="nav"' + (st ? ' style="' + st + '"' : "") + '><button type="button" class="btn" data-go="' + (i - 1) + '"' + (i ? "" : " disabled") + '>← 앞</button><span class="n">' + (i + 1) + " / " + PAGES.length + '</span><button type="button" class="btn primary" data-go="' + (i + 1) + '"' + (i < PAGES.length - 1 ? "" : " disabled") + ">다음 →</button></div>"; }
    function ptsList(p, numbered){
      if(!p.pt || !p.pt.length) return "";
      return '<ol class="pts">' + p.pt.map(function(x, i){ return "<li><i" + (numbered ? "" : ' class="t"') + ">" + (numbered ? i + 1 : "✓") + "</i><span>" + x[2] + "</span></li>"; }).join("") + "</ol>";
    }
    function side(p, i, numbered){
      return '<aside class="side"><div class="kick">' + esc(p.kick || p.ch) + '</div><h2>' + esc(p.t) + '</h2><p class="sum">' + esc(p.sum || "") + "</p>"
        + ptsList(p, numbered) + (p.tip ? '<div class="tip">' + p.tip + "</div>" : "") + openBtns(p) + navRow(i) + "</aside>";
    }
    function shot(p){
      return '<div class="fig"><div class="shot"><img src="shots/' + p.img + '.webp" alt="' + esc(p.t) + ' 화면 (견본)" width="1440" height="900">'
        + p.pt.map(function(x, i){ return '<span class="pin" style="left:' + x[0] + "%;top:" + x[1] + '%">' + (i + 1) + "</span>"; }).join("") + "</div></div>";
    }
    function phoneShot(p){   // 휴대폰 한 장 + 번호
      return '<div class="fig"><div class="shot ph"><img src="shots/' + p.img + '.webp" alt="' + esc(p.t) + ' 화면 (견본)" width="585" height="1266">'
        + p.pt.map(function(x, i){ return '<span class="pin" style="left:' + x[0] + "%;top:" + x[1] + '%">' + (i + 1) + "</span>"; }).join("") + "</div></div>";
    }
    function phones(p){
      return '<div class="fig" style="gap:14px">' + p.phones.map(function(f, i){ return '<div class="shot ph" style="position:relative"><img src="shots/' + f + '.webp" alt="휴대폰 화면 (견본)" width="585" height="1266"><span class="pin" style="left:8%;top:4%">' + (i + 1) + "</span></div>"; }).join("") + "</div>";
    }
    function qrSvg(path){
      try{ var u = new URL(R + path, location.href).href; return window.TTQR ? TTQR.svg(u) : ""; }catch(e){ return ""; }
    }
    function steps(p){
      return '<div class="fig"><div class="noshot">' + (p.qr ? '<div class="qrb" title="' + esc(p.qr) + '">' + qrSvg(p.qr) + "</div>" : '<div class="big">' + (p.big || "🦉") + "</div>")
        + (p.head ? '<b style="font-size:18px;color:var(--ink)">' + p.head + "</b>" : "")
        + (p.steps ? '<div class="steps">' + p.steps.map(function(s, k){ return "<div><b>" + (s[2] || k + 1) + "</b>" + s[0] + (s[1] ? "<small>" + s[1] + "</small>" : "") + "</div>"; }).join("") + "</div>" : "")
        + (p.note ? "<small>" + p.note + "</small>" : "") + "</div></div>";
    }
    function card(c){
      var h = '<section class="card"><h3>' + c.h + "</h3>";
      if(c.flow) h += '<ol class="flow">' + c.flow.map(function(f){ return '<li><b class="tm">' + f[0] + '</b><span class="em">' + f[1] + '</span><a href="#" data-go="' + idx(f[2]) + '">' + f[3].replace(/^([^—]+)—/, "<b>$1</b>—") + "</a></li>"; }).join("") + "</ol>";
      if(c.chk) h += '<ol class="chk">' + c.chk.map(function(f, k){ return '<li><i>' + (k + 1) + '</i><a href="#" data-go="' + idx(f[0]) + '"><b>' + f[1] + "</b>" + (f[2] ? "<small>" + f[2] + "</small>" : "") + "</a></li>"; }).join("") + "</ol>";
      if(c.rules) h += '<ul class="rules">' + c.rules.map(function(r){ return "<li><span>" + r[0] + "</span><span>" + r[1] + "</span></li>"; }).join("") + "</ul>";
      if(c.role) h += '<div class="role">' + c.role.map(function(r){ return "<b>" + r[0] + "</b><span>" + r[1] + "</span>"; }).join("") + "</div>";
      if(c.keysH) h += '<h3 style="margin-top:6px">' + c.keysH + "</h3>";
      if(c.keys) h += '<div class="keys">' + c.keys.map(function(k){ return "<kbd>" + k[0] + "</kbd><span>" + k[1] + "</span>"; }).join("") + "</div>";
      if(c.html) h += c.html;
      return h + "</section>";
    }
    function page(i){
      var p = PAGES[i];
      if(p.kind === "sum") return '<main class="man" style="display:flex;flex-direction:column"><div class="sumw"' + (p.cols ? ' style="grid-template-columns:' + p.cols + '"' : "") + ">" + p.cards.map(card).join("") + "</div>" + navRow(i) + "</main>";
      if(p.kind === "faq") return '<main class="man" style="display:flex;flex-direction:column"><ul class="faq">' + FAQ.map(function(q){ return '<li><b class="q">❓ ' + esc(q[0]) + "</b>" + q[1] + "</li>"; }).join("") + "</ul>" + navRow(i) + "</main>";
      if(p.kind === "steps") return '<main class="man" style="display:flex">' + steps(p) + side(p, i, false) + "</main>";
      if(p.phones) return '<main class="man" style="display:flex">' + phones(p) + side(p, i, true) + "</main>";
      if(p.phone) return '<main class="man" style="display:flex">' + phoneShot(p) + side(p, i, true) + "</main>";
      return '<main class="man" style="display:flex">' + shot(p) + side(p, i, true) + "</main>";
    }
    var cur = 0;
    function show(i){
      cur = Math.max(0, Math.min(PAGES.length - 1, i));
      document.getElementById("view").innerHTML = page(cur);
      var ch = PAGES[cur].ch;
      document.getElementById("chs").innerHTML = CH.map(function(c){ var f = 0; for(var k = 0; k < PAGES.length; k++) if(PAGES[k].ch === c){ f = k; break; } return '<button type="button" data-go="' + f + '" aria-current="' + (c === ch) + '">' + esc(c) + "</button>"; }).join("");
      try{ history.replaceState(null, "", location.pathname + "?p=" + PAGES[cur].id); }catch(e){}
      if(window.innerWidth <= 760) try{ window.scrollTo(0, 0); }catch(e){}
    }
    document.addEventListener("click", function(e){ var b = e.target.closest("[data-go]"); if(!b || b.disabled) return; e.preventDefault(); show(+b.dataset.go); });
    document.addEventListener("keydown", function(e){
      if(/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || "") || e.altKey || e.ctrlKey || e.metaKey) return;
      if(e.key === "ArrowRight" || e.key === "PageDown"){ show(cur + 1); e.preventDefault(); }
      else if(e.key === "ArrowLeft" || e.key === "PageUp"){ show(cur - 1); e.preventDefault(); }
    });
    var prt = document.getElementById("prt");
    if(prt) prt.onclick = function(){
      document.getElementById("all").innerHTML = PAGES.map(function(p, i){ return "<section>" + page(i).replace(/^<main[^>]*>/, "").replace(/<\/main>$/, "") + "</section>"; }).join("");
      setTimeout(function(){ window.print(); }, 300);
    };
    show(idx(new URLSearchParams(location.search).get("p")));
  };
})();
