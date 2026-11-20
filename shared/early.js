/* v2.3.1: 도구 화면을 그리기 전에 '쌤비 홈' 디자인이면 표시하고 잠깐 감춤 — 업무판 모양이 먼저 보였다 바뀌지 않게 (늦어도 2.5초 뒤에는 보임) */
(function(){
  try{
    var L = JSON.parse(localStorage.getItem("snlook_v1") || "null"), r = document.documentElement;
    var leg = localStorage.getItem("sn_legacy_ui") === "1";   // v2.8: 예전 화면은 ?legacy=on 일 때만 (LEGACY.md)
    if(localStorage.getItem("ttv_device") === "classroom"){ var rmS = null; try{ rmS = JSON.parse(sessionStorage.getItem("ttv_session")); }catch(e){} r.setAttribute("data-room", rmS && rmS.k && Date.now() - (rmS.last || 0) < 12e5 && !(rmS.until && Date.now() > rmS.until) ? "on" : "lock"); }   // v2.11.4 교실 기기도 쌤비 디자인 (잠긴 동안은 수업 시작 화면만)
    if(leg && (!L || L.ui !== "ssambi")) return;
    r.setAttribute("data-ui", "ssambi");
    if(window.top !== window){ r.classList.add("sbReady"); return; }
    document.write('<style id="sbHold">html[data-ui="ssambi"]:not(.sbReady) body{visibility:hidden}html[data-ui="ssambi"] .tt-rail{display:none!important}html[data-room="lock"] body>*:not(.ttv-room):not(.ttv-lock){visibility:hidden!important}</style>');
    setTimeout(function(){ r.classList.add("sbReady"); }, 2500);
  }catch(e){}
})();
