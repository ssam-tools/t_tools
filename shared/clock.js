/* 보완 1단계 (v1.4.0): 첫 화면 큰 시계
   - 머리줄 오른쪽에 큰 시각 + "5교시 · 끝까지 12분" + 진행 막대 (시간표가 있을 때)
   - 시계를 누르면 전체 화면 시계(수업 중 활동 안내용) + 3·5·10분 타이머
   - 설정(이 기기에만, snclock_v1): 24시간 표시, 초 표시
   학생 자료는 다루지 않습니다. */
(function(){
  "use strict";
  var KEY = "snclock_v1", LEN = 45;
  function opt(){ try{ return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }catch(e){ return {}; } }
  function setOpt(k, v){ var o = opt(); o[k] = v; try{ localStorage.setItem(KEY, JSON.stringify(o)); }catch(e){} }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function timeParts(d){
    var o = opt(), H = d.getHours(), M = pad(d.getMinutes()), S = pad(d.getSeconds());
    if(o.h24) return {ap: "", t: pad(H) + ":" + M, s: S};
    return {ap: H < 12 ? "오전" : "오후", t: ((H % 12) || 12) + ":" + M, s: S};
  }
  /* 지금 교시 상태: {txt, pct} (pct = 수업 진행 0~1, 쉬는 시간이면 null) */
  function state(){
    var TTT = window.TT && TT.timetable; if(!TTT || !TTT.has()) return null;
    var d = new Date(), w = d.getDay(); if(w < 1 || w > 5) return null;
    var m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60, cur = TTT.now(), nx = TTT.next(), list = TTT.day(d);
    if(cur) return {txt: cur.n + "교시 · 끝까지 <b>" + Math.max(1, Math.ceil(cur.end - m)) + "</b>분", pct: Math.min(1, Math.max(0, (m - cur.start) / LEN)), cls: "on"};
    if(nx && nx.start - m <= 60) return {txt: (list.some(function(s){ return s.end <= m; }) ? "쉬는 시간 · " : "") + nx.n + "교시까지 <b>" + Math.max(1, Math.ceil(nx.start - m)) + "</b>분", pct: null, cls: "brk"};
    if(list.length && !nx) return {txt: "오늘 수업 끝", pct: null, cls: "end"};
    return null;
  }
  var CSS = ""
    + ".hclock{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:2px;border:0;background:none;cursor:pointer;padding:2px 8px;margin-left:auto;margin-right:clamp(6px,1.2vw,16px);border-radius:14px;font-family:var(--font);color:var(--ink);line-height:1;-webkit-tap-highlight-color:transparent}"
    + ".hclock:hover{background:var(--accent-soft)}"
    + ".hclock .hc1{display:flex;align-items:baseline;gap:6px}"
    + ".hclock .ap{font-size:clamp(14px,2.2vh,19px);font-weight:800;color:var(--sub)}"
    + ".hclock .tm{font-size:clamp(34px,6.4vh,58px);font-weight:900;letter-spacing:-.02em;font-variant-numeric:tabular-nums}"
    + ".hclock .sc{font-size:clamp(14px,2.2vh,19px);font-weight:800;color:var(--sub);font-variant-numeric:tabular-nums}"
    + ".hclock .hc2{font-size:clamp(12.5px,1.8vh,15px);font-weight:700;color:var(--sub);white-space:nowrap}"
    + ".hclock .hc2 b{color:var(--t-now,#2f6fb5);font-size:1.12em}"
    + ".hclock .hbar{display:block;width:100%;min-width:120px;height:5px;border-radius:9px;background:var(--line);overflow:hidden}"
    + ".hclock .hbar i{display:block;height:100%;background:var(--t-now,#2f6fb5);border-radius:9px}"
    + "@media (max-width:760px){.hclock{order:2;margin:0 4px 0 auto;padding:0 4px}.hclock .tm{font-size:30px}.hclock .ap{font-size:13px}.hclock .hbar,.hclock .sc{display:none}.hclock .hc2{font-size:12px}}"
    + "#tdLesson .tdh .tck{display:none}"
    + ".fclk{position:fixed;inset:0;z-index:200;background:var(--bg,#f4f6f9);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vh;font-family:var(--font);color:var(--ink)}"
    + ".fclk[hidden]{display:none}"
    + ".fclk .ft{display:flex;align-items:baseline;gap:1.5vw;line-height:1}"
    + ".fclk .ft .ap{font-size:6vh;font-weight:800;color:var(--sub)}"
    + ".fclk .ft .tm{font-size:min(30vw,38vh);font-weight:900;letter-spacing:-.03em;font-variant-numeric:tabular-nums}"
    + ".fclk .ft .sc{font-size:8vh;font-weight:800;color:var(--sub);font-variant-numeric:tabular-nums}"
    + ".fclk .fs{font-size:4.2vh;font-weight:800;color:var(--sub)}.fclk .fs b{color:var(--t-now,#2f6fb5)}"
    + ".fclk .fbar{width:min(70vw,900px);height:1.4vh;border-radius:9px;background:var(--line);overflow:hidden}.fclk .fbar i{display:block;height:100%;background:var(--t-now,#2f6fb5)}"
    + ".fclk .ftm{font-size:12vh;font-weight:900;color:#c2410c;font-variant-numeric:tabular-nums;line-height:1}"
    + ".fclk .ftm.done{animation:fblink 1s steps(2) infinite}@keyframes fblink{50%{opacity:.25}}"
    + ".fclk .fb{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}"
    + ".fclk .fb button{font:inherit;font-size:2.6vh;font-weight:800;border:0;border-radius:999px;padding:1.1vh 2.2vw;background:var(--card);box-shadow:0 1px 4px rgba(0,0,0,.1);cursor:pointer;color:var(--ink)}"
    + ".fclk .fb button.p{background:var(--accent);color:var(--t-on,#fff)}"
    + ".fclk .fo{position:absolute;bottom:2vh;display:flex;gap:16px;font-size:14px;color:var(--sub)}"
    + ".fclk .fo label{display:flex;gap:5px;align-items:center;cursor:pointer}"
    + ".fclk .fx{position:absolute;top:2vh;right:2vw;font:inherit;font-size:22px;border:0;background:var(--card);border-radius:999px;width:48px;height:48px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.1)}";

  var box, full, timerEnd = 0, timerTxt;
  function headHTML(){
    var p = timeParts(new Date()), s = state(), o = opt();
    return '<span class="hc1">' + (p.ap ? '<span class="ap">' + p.ap + "</span>" : "") + '<span class="tm">' + p.t + "</span>" + (o.sec ? '<span class="sc">' + p.s + "</span>" : "") + "</span>"
      + (s ? '<span class="hc2">' + s.txt + "</span>" + (s.pct != null ? '<span class="hbar"><i style="width:' + Math.round(s.pct * 100) + '%"></i></span>' : "") : "");
  }
  function fullHTML(){
    var p = timeParts(new Date()), s = state(), o = opt(), left = timerEnd ? Math.max(0, Math.round((timerEnd - Date.now()) / 1000)) : -1;
    return '<button type="button" class="fx" data-c="x" aria-label="닫기">✕</button>'
      + '<div class="ft">' + (p.ap ? '<span class="ap">' + p.ap + "</span>" : "") + '<span class="tm">' + p.t + "</span>" + (o.sec ? '<span class="sc">' + p.s + "</span>" : "") + "</div>"
      + (s ? '<div class="fs">' + s.txt + "</div>" + (s.pct != null ? '<div class="fbar"><i style="width:' + Math.round(s.pct * 100) + '%"></i></div>' : "") : "")
      + (left >= 0 ? '<div class="ftm' + (left === 0 ? " done" : "") + '">' + (left === 0 ? "⏰ 끝!" : "⏳ " + Math.floor(left / 60) + ":" + pad(left % 60)) + "</div>" : "")
      + '<div class="fb">' + [1, 3, 5, 10].map(function(n){ return '<button type="button" data-c="t" data-n="' + n + '">' + n + "분</button>"; }).join("")
      + (timerEnd ? '<button type="button" data-c="t" data-n="0">타이머 끄기</button>' : "") + "</div>"
      + '<div class="fo"><label><input type="checkbox" data-c="h24"' + (o.h24 ? " checked" : "") + "> 24시간</label>"
      + '<label><input type="checkbox" data-c="sec"' + (o.sec ? " checked" : "") + "> 초 표시</label><span>Esc 닫기</span></div>";
  }
  function tick(){
    if(box) box.innerHTML = headHTML();
    if(full && !full.hidden) full.innerHTML = fullHTML();
  }
  function openFull(){
    full.hidden = false; tick();
    try{ if(document.documentElement.requestFullscreen && window.innerWidth > 760) document.documentElement.requestFullscreen().catch(function(){}); }catch(e){}
  }
  function closeFull(){ full.hidden = true; try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){} }
  function start(){
    var head = document.querySelector("header"); if(!head || document.getElementById("hClock")) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    box = document.createElement("button"); box.type = "button"; box.id = "hClock"; box.className = "hclock"; box.title = "누르면 전체 화면 시계 · 타이머";
    var bar = head.querySelector(".bar"); head.insertBefore(box, bar || null);
    full = document.createElement("div"); full.className = "fclk"; full.hidden = true; full.setAttribute("role", "dialog"); full.setAttribute("aria-label", "전체 화면 시계");
    document.body.appendChild(full);
    box.addEventListener("click", openFull);
    full.addEventListener("click", function(e){
      var b = e.target.closest("[data-c]"); if(!b) return;
      var c = b.getAttribute("data-c");
      if(c === "x") return closeFull();
      if(c === "t"){ var n = +b.getAttribute("data-n"); timerEnd = n ? Date.now() + n * 60000 : 0; return tick(); }
      if(c === "h24" || c === "sec"){ setOpt(c, b.checked); tick(); }
    });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !full.hidden) closeFull(); });
    tick(); setInterval(tick, 1000);
  }
  window.TTClock = {state: state};
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
