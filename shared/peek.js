/* 쌤 노트 · 미리보기 말풍선 (화면 개편 2단계)
   - 마우스를 0.3초 올리면: 잘려 보이는 업무·할 일·일정의 전체 내용, 업무가 넘치는 날은 그날 업무 전체를 말풍선으로 보여 줍니다.
   - 터치 화면(전자칠판·휴대폰)은 길게 누르기(0.45초)로 같은 말풍선. 손을 떼도 남아 있고, 다른 곳을 누르면 닫힙니다.
   - 누르기(클릭)는 지금처럼 '열기·고치기' 그대로입니다. 보기 = 올리기, 고치기 = 누르기.
   - 화면에 이미 다 보이는 것은 말풍선을 띄우지 않습니다. 새 자료를 만들거나 보내지 않습니다(화면 글자만 읽음). */
(function(){
  "use strict";
  var SEL = ".bd[data-date], .bi, .ti .tx, .tdl, .tev, [data-peek]";
  var tip = document.createElement("div"); tip.id = "ttPeek"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
  var st = document.createElement("style");
  st.textContent = "#ttPeek{position:fixed;z-index:60;max-width:min(420px,92vw);max-height:min(70vh,520px);overflow:auto;background:var(--card,var(--t-card,#fff));color:var(--ink,var(--t-ink,#1d2733));"
    + "border:1px solid var(--line,var(--t-line,#dde3ea));border-radius:12px;box-shadow:0 10px 30px rgba(20,40,70,.22);padding:9px 12px;font-size:14px;line-height:1.55;pointer-events:none;font-family:var(--font,var(--t-font,inherit))}"
    + "#ttPeek.touch{pointer-events:auto}#ttPeek h4{margin:0 0 4px;font-size:14.5px;color:var(--accent,var(--t-accent,#2f6fb5))}"
    + "#ttPeek .pi{padding:3px 0;border-top:1px dashed var(--line,#e3e7ee);word-break:keep-all;overflow-wrap:anywhere}#ttPeek .pi:first-of-type{border-top:0}"
    + "#ttPeek .pi b{font-size:12px;margin-right:5px}#ttPeek .pi.imp{color:var(--danger,#c62828);font-weight:700}#ttPeek .pi.me{color:#6b3fa0;font-weight:700}"
    + "#ttPeek .ph{font-size:11.5px;color:var(--sub,#667085);margin-top:5px}";
  document.head.appendChild(st);
  function add(){ if(!tip.isConnected) document.body.appendChild(tip); }
  if(document.body) add(); else document.addEventListener("DOMContentLoaded", add);
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function cut(el){ return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1; }
  function full(el){                                                   // 원래 말풍선(title)은 여기서 보여 주고 브라우저 기본 말풍선은 끔
    if(el.hasAttribute("title")){ el.setAttribute("data-ptitle", el.getAttribute("title")); el.removeAttribute("title"); }
    return el.getAttribute("data-peek") || el.getAttribute("data-ptitle") || el.textContent.replace(/\s+/g, " ").trim();
  }
  function itemHTML(b){
    var t = full(b); if(b.classList.contains("me")) t = b.textContent.replace(/\s+/g, " ").trim();
    var cls = b.classList.contains("imp") ? " imp" : b.classList.contains("me") ? " me" : "";
    var dep = b.querySelector("b"), m = /^(.+?) · (.*)$/.exec(t);
    return '<div class="pi' + cls + '">' + (m && dep ? '<b style="color:' + esc(dep.style.color || "") + '">' + esc(m[1]) + "</b>" + esc(m[2]) : esc(t)) + "</div>";
  }
  function content(el){
    if(el.matches(".bd[data-date]")){                                  // 업무가 넘치는 날: 그날 업무 모두
      var l = el.querySelector(".bdl"); if(!l || !(cut(l) || Array.prototype.some.call(l.querySelectorAll(".bi"), cut))) return "";
      var its = el.querySelectorAll(".bi"), hd = el.querySelector(".bdh");
      var ht = ""; if(hd){ var c = hd.cloneNode(true), em = c.querySelector("em"); if(em) em.textContent = " · " + em.textContent; ht = c.textContent; }
      return "<h4>" + esc(ht) + " · " + its.length + "건</h4>" + Array.prototype.map.call(its, itemHTML).join("") + '<div class="ph">업무를 누르면 업무판이 열려요</div>';
    }
    if(el.matches(".bi")) return cut(el) ? itemHTML(el) : "";
    if(!el.hasAttribute("data-peek") && !cut(el)) return "";
    return '<div class="pi">' + esc(full(el)) + "</div>";
  }
  function place(el, touch){
    add(); tip.classList.toggle("touch", !!touch); tip.hidden = false;
    var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var x = Math.min(Math.max(8, r.left), vw - w - 8), y = r.bottom + 6;
    if(y + h > vh - 8) y = Math.max(8, r.top - h - 6);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hide(){ tip.hidden = true; cur = null; }
  var cur = null, timer = 0;
  function show(el, touch){ var h = content(el); if(!h){ hide(); return; } tip.innerHTML = h; cur = el; place(el, touch); }
  function pick(t){                                                    // 가장 안쪽 대상 먼저(업무 한 줄 → 그날 칸)
    var a = t && t.closest ? t.closest(SEL) : null;
    while(a){ if(content(a)) return a; a = a.parentElement ? a.parentElement.closest(SEL) : null; }
    return null;
  }
  /* 마우스 */
  document.addEventListener("mouseover", function(e){
    if(Date.now() - lastTouch < 900) return;                          // 터치 뒤 따라오는 가짜 마우스 신호는 무시
    var el = e.target.closest ? e.target.closest(SEL) : null;
    if(cur && el && (cur === el || cur.contains(el))) return;
    clearTimeout(timer);
    if(!el){ hide(); return; }
    timer = setTimeout(function(){ var p = pick(e.target); if(p) show(p); else hide(); }, 300);
  });
  document.addEventListener("mouseout", function(e){ if(!e.relatedTarget || !(cur && cur.contains(e.relatedTarget))){ clearTimeout(timer); if(!(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(SEL))) hide(); } });
  /* 길게 누르기 (터치) */
  var lp = 0, sx = 0, sy = 0, eat = false, lastTouch = 0;
  document.addEventListener("touchstart", function(e){
    if(!tip.hidden && !tip.contains(e.target)){ hide(); }
    lastTouch = Date.now(); var t = e.touches[0]; sx = t.clientX; sy = t.clientY; clearTimeout(lp);
    var p = pick(e.target); if(!p) return;
    lp = setTimeout(function(){ show(p, true); eat = true; try{ navigator.vibrate && navigator.vibrate(15); }catch(x){} }, 450);
  }, {passive: true});
  document.addEventListener("touchmove", function(e){ var t = e.touches[0]; if(Math.abs(t.clientX - sx) + Math.abs(t.clientY - sy) > 10) clearTimeout(lp); }, {passive: true});
  document.addEventListener("touchend", function(){ clearTimeout(lp); }, {passive: true});
  document.addEventListener("click", function(e){ if(eat){ eat = false; e.preventDefault(); e.stopPropagation(); } }, true);   // 길게 누른 뒤의 누르기는 열기로 넘기지 않음
  document.addEventListener("contextmenu", function(e){ if(cur && tip.classList.contains("touch")) e.preventDefault(); });
  window.addEventListener("scroll", function(){ if(!tip.classList.contains("touch")) hide(); }, true);
  window.addEventListener("keydown", function(e){ if(e.key === "Escape") hide(); });
  window.TT_PEEK = {hide: hide};
})();
