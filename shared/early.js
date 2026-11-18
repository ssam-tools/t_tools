/* v2.3.1: 도구 화면을 그리기 전에 '쌤비 홈' 디자인이면 표시하고 잠깐 감춤 — 업무판 모양이 먼저 보였다 바뀌지 않게 (늦어도 2.5초 뒤에는 보임) */
(function(){
  try{
    var L = JSON.parse(localStorage.getItem("snlook_v1") || "null"), r = document.documentElement;
    if(!L || L.ui !== "ssambi" || localStorage.getItem("ttv_device") === "classroom") return;
    r.setAttribute("data-ui", "ssambi");
    if(window.top !== window){ r.classList.add("sbReady"); return; }
    document.write('<style id="sbHold">html[data-ui="ssambi"]:not(.sbReady) body{visibility:hidden}html[data-ui="ssambi"] .tt-rail{display:none!important}</style>');
    setTimeout(function(){ r.classList.add("sbReady"); }, 2500);
  }catch(e){}
})();
