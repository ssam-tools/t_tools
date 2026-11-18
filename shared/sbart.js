/* 쌤 노트 v2.0 · 쌤비 그림 (TT_SBART) — 직접 그린 SVG, 외부 파일 없음
   쌤비 = 쌤들의 비서. 안경 쓴 부엉이가 늘 "쌤 노트"를 안고 있습니다.
   - 노트 표지는 고른 테마 색(--t-accent), 표지에는 쌤비 안경 무늬 = 쌤 노트 로고.
   - 노트를 펼치면 브리핑 중, 덮으면 기본. 상황에 따라 소품 하나 + 계절 장식 하나가 붙습니다.
   쓰는 법: TT_SBART.svg({item:"coffee", deco:"autumn", open:false, listen:false, sleep:false, size:120})
            TT_SBART.logo(size)  → 노트 + 안경 로고
            TT_SBART.items       → 소품 이름 목록
   색은 CSS 변수(--t-accent)를 따르므로 테마를 바꾸면 노트 색도 함께 바뀝니다. */
(function(){
  "use strict";
  if(window.TT_SBART) return;
  var INK = "#04342C", BODY = "#1D9E75", DARK = "#0F6E56", BELLY = "#9FE1CB", BEAK = "#EF9F27", RED = "#D9483B";
  var NOTE = "var(--t-accent,#2f6fb5)";

  function glasses(x, y, r, col, w){                                   // 안경 무늬 (로고·노트 표지)
    return '<circle cx="' + (x - r - 1) + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"/>'
      + '<circle cx="' + (x + r + 1) + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"/>'
      + '<path d="M' + (x - 1.4) + " " + (y - 0.6) + " q1.4 -1.4 2.8 0" + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"/>';
  }
  /* 소품: 오른쪽 날개 쪽(대략 x 86~112, y 58~96)에 그립니다 */
  var ITEMS = {
    coffee: '<g class="sbIt"><path d="M90 70 h16 v12 a6 6 0 0 1 -6 6 h-4 a6 6 0 0 1 -6 -6 z" fill="#fff" stroke="' + INK + '" stroke-width="1.8"/>'
      + '<path d="M106 73 a4 4 0 0 1 0 8" fill="none" stroke="' + INK + '" stroke-width="1.8"/><path d="M90 76 h16" stroke="#8a5a3c" stroke-width="2"/>'
      + '<path class="sbSteam" d="M95 66 q-2 -3 0 -6 M101 66 q-2 -3 0 -6" fill="none" stroke="#9aa5b1" stroke-width="1.6" stroke-linecap="round"/></g>',
    book: '<g class="sbIt"><rect x="88" y="62" width="20" height="26" rx="2.5" fill="#F0997B" stroke="' + INK + '" stroke-width="1.6" transform="rotate(10 98 75)"/>'
      + '<path d="M93 70 h10 M93 74 h8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" transform="rotate(10 98 75)"/></g>',
    shh: '<g class="sbIt"><ellipse cx="66" cy="67" rx="4" ry="8.5" fill="' + DARK + '" transform="rotate(14 66 67)"/></g>',
    spoon: '<g class="sbIt"><path d="M97 92 L101 70" stroke="#8a95a1" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="101.8" cy="66" rx="4.2" ry="5.8" fill="#c3cad2" stroke="#8a95a1" stroke-width="1.4"/>'
      + '<path d="M88 92 L86 70 M84 70 v6 M88 70 v6" stroke="#8a95a1" stroke-width="1.8" stroke-linecap="round"/></g>',
    alarm: '<g class="sbIt sbShake"><circle cx="98" cy="76" r="10" fill="#fff" stroke="' + RED + '" stroke-width="2.4"/><circle cx="90.5" cy="66.5" r="3.2" fill="' + RED + '"/><circle cx="105.5" cy="66.5" r="3.2" fill="' + RED + '"/>'
      + '<path d="M98 76 V70 M98 76 L102 78" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/></g>',
    listen: '<g class="sbIt sbWave"><path d="M97 44 a8 8 0 0 1 0 14 M102 40 a13 13 0 0 1 0 22 M107 36 a18 18 0 0 1 0 30" fill="none" stroke="' + NOTE + '" stroke-width="2.4" stroke-linecap="round"/></g>',
    stamp: '<g class="sbIt"><circle cx="63" cy="92" r="10" fill="none" stroke="' + RED + '" stroke-width="2.4" transform="rotate(-14 63 92)"/>'
      + '<path d="M57 92 l4 4 l8 -8" fill="none" stroke="' + RED + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<path d="M100 50 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 z" fill="#EF9F27"/><path d="M92 38 l1.2 -3 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 z" fill="#EF9F27"/></g>',
    night: '<g class="sbIt"><text x="90" y="34" font-size="11" font-weight="700" fill="#7f8ea0" font-family="sans-serif">z</text><text x="98" y="24" font-size="15" font-weight="700" fill="#7f8ea0" font-family="sans-serif">Z</text></g>',
    redpen: '<g class="sbIt"><path d="M90 92 L106 64" stroke="' + RED + '" stroke-width="5" stroke-linecap="round"/><path d="M88.6 94.4 L90 92" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M104 67 L107.5 61" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></g>',
    paper: '<g class="sbIt"><rect x="88" y="60" width="20" height="27" rx="2" fill="#fff" stroke="' + INK + '" stroke-width="1.6" transform="rotate(8 98 73)"/>'
      + '<path d="M92 67 h12 M92 71 h12 M92 75 h9 M92 79 h11" stroke="#9aa5b1" stroke-width="1.4" transform="rotate(8 98 73)"/></g>',
    calendar: '<g class="sbIt"><rect x="88" y="64" width="21" height="22" rx="3" fill="#fff" stroke="' + INK + '" stroke-width="1.6"/><path d="M88 64 h21 v6 h-21 z" fill="' + RED + '"/>'
      + '<path d="M93 61 v5 M104 61 v5" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/><text x="98.5" y="82.5" font-size="10" font-weight="700" text-anchor="middle" fill="' + INK + '" font-family="sans-serif">D</text></g>'
  };
  /* 계절 장식: 머리 왼쪽 위 */
  var DECO = {
    spring: '<g class="sbDeco">' + [0, 72, 144, 216, 288].map(function(a){ var r = a * Math.PI / 180; return '<circle cx="' + (30 + 4.4 * Math.cos(r)).toFixed(1) + '" cy="' + (26 + 4.4 * Math.sin(r)).toFixed(1) + '" r="3.6" fill="#F4C0D1"/>'; }).join("") + '<circle cx="30" cy="26" r="2.2" fill="#EF9F27"/></g>',
    summer: '<g class="sbDeco"><path d="M30 34 L18 20 A18 18 0 0 1 42 20 Z" fill="#85B7EB" stroke="' + INK + '" stroke-width="1.2"/><path d="M30 34 L24 19 M30 34 L30 17 M30 34 L36 19" stroke="#fff" stroke-width="1.2"/><path d="M30 34 v8" stroke="#8a5a3c" stroke-width="2" stroke-linecap="round"/></g>',
    autumn: '<g class="sbDeco"><path d="M30 16 L33 23 L40 21 L36 27 L42 31 L34 32 L33 38 L30 34 L27 38 L26 32 L18 31 L24 27 L20 21 L27 23 Z" fill="#D85A30" stroke="#993C1D" stroke-width="1"/><path d="M30 34 v6" stroke="#993C1D" stroke-width="1.4"/></g>',
    winter: '<g class="sbDeco"><path d="M30 68 Q60 76 90 68 L90 75 Q60 83 30 75 Z" fill="' + RED + '"/><path d="M78 74 l4 16 l7 -2 l-4 -15 z" fill="' + RED + '"/><path d="M80 88 h8" stroke="#fff" stroke-width="1.4" stroke-dasharray="2 2"/></g>'
  };

  /* ── 선 아이콘 한 종류 (굵기 1.8 · 둥근 끝) — 쌤비 홈·메뉴 막대·도구 화면 왼쪽 막대가 함께 씀 ── */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    "class": '<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM8 7h7"/>',
    homeroom: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5 5.5"/>',
    student: '<circle cx="10" cy="8" r="4"/><path d="M3 20a7 7 0 0 1 9-6.7"/><circle cx="17" cy="17" r="3"/><path d="M21 21l-1.8-1.8"/>',
    school: '<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M10 10h4"/>',
    lib: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    arrow: '<path d="M9 6l6 6-6 6"/>',
    home: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  function icon(name, size){ var d = ICONS[name]; return d ? '<svg viewBox="0 0 24 24" width="' + (size || 22) + '" height="' + (size || 22) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + d + "</svg>" : ""; }
  /* 도구 화면 왼쪽 막대(tt.js)의 메뉴 그림 글자도 같은 선 아이콘으로 (쌤비 홈 디자인일 때만) */
  function railIcons(){
    if(document.documentElement.getAttribute("data-ui") !== "ssambi") return;
    Array.prototype.forEach.call(document.querySelectorAll(".tt-rail .tt-top[data-menu] > span, .tt-rail .tt-foot a[href$='#settings'] > span"), function(sp){
      var a = sp.parentNode, k = a.getAttribute("data-menu") || "settings"; if(!ICONS[k] || sp.getAttribute("data-ic") === k) return;
      sp.setAttribute("data-ic", k); sp.innerHTML = icon(k, a.classList.contains("tt-top") ? 22 : 16);
    });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", railIcons); else railIcons();

  function svg(o){
    o = o || {};
    var P = o.listen ? 6 : 4.6, size = o.size || 120, it = ITEMS[o.item] || "", dc = DECO[o.deco] || "", sleep = !!o.sleep;
    var eyes = sleep ? '<path d="M41 54 q5 4 10 0 M69 54 q5 4 10 0" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>'
      : '<g class="sbEye"><circle cx="47.5" cy="53" r="' + P + '" fill="' + INK + '"/><circle cx="75.5" cy="53" r="' + P + '" fill="' + INK + '"/>'
        + '<circle cx="49.3" cy="51" r="1.5" fill="#fff"/><circle cx="77.3" cy="51" r="1.5" fill="#fff"/></g>';
    var note = o.open
      ? '<g class="sbNote"><rect x="31" y="80" width="58" height="30" rx="3" fill="' + NOTE + '"/>'
        + '<path d="M34 77 L60 81 L60 108 L34 104 Z" fill="#fff" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M86 77 L60 81 L60 108 L86 104 Z" fill="#fff" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>'
        + '<path d="M38 85 l17 2.6 M38 90 l17 2.6 M38 95 l12 1.8 M65 87.6 l17 -2.6 M65 92.6 l17 -2.6 M65 97.6 l12 -1.8" stroke="#9aa5b1" stroke-width="1.3" stroke-linecap="round"/></g>'
        + '<ellipse cx="31" cy="92" rx="6.5" ry="11" fill="' + DARK + '" transform="rotate(-20 31 92)"/><ellipse cx="89" cy="92" rx="6.5" ry="11" fill="' + DARK + '" transform="rotate(20 89 92)"/>'
      : '<g class="sbNote"><rect x="37" y="74" width="46" height="34" rx="4" fill="' + NOTE + '" stroke="' + INK + '" stroke-width="1.5"/>'
        + '<rect x="37" y="74" width="7" height="34" rx="3" fill="#000" opacity=".18"/>' + glasses(64, 89, 5, "#fff", 2.2) + '</g>'
        + '<ellipse cx="37" cy="90" rx="6.5" ry="12" fill="' + DARK + '" transform="rotate(-14 37 90)"/><ellipse cx="83" cy="90" rx="6.5" ry="12" fill="' + DARK + '" transform="rotate(14 83 90)"/>';
    return '<svg class="sbArt' + (o.listen ? " lis" : "") + '" viewBox="0 0 120 120" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">'
      + '<ellipse cx="60" cy="114" rx="30" ry="4" fill="#000" opacity=".07"/>'
      + '<path d="M29 36 L35 13 L47 30 Z M91 36 L85 13 L73 30 Z" fill="' + DARK + '"/>'
      + '<ellipse cx="60" cy="68" rx="35" ry="42" fill="' + BODY + '"/><ellipse cx="60" cy="80" rx="23" ry="25" fill="' + BELLY + '"/>'
      + '<path d="M50 96 q5 4 10 0 M60 96 q5 4 10 0" fill="none" stroke="' + BODY + '" stroke-width="1.6" opacity=".5"/>'
      + (o.deco === "winter" ? dc : "")
      + '<circle cx="46" cy="52" r="13" fill="#fff" stroke="' + INK + '" stroke-width="3"/><circle cx="74" cy="52" r="13" fill="#fff" stroke="' + INK + '" stroke-width="3"/>'
      + '<path d="M58.5 50.5 q1.5 -2 3 0" fill="none" stroke="' + INK + '" stroke-width="3"/>' + eyes
      + '<path d="M56 63 L60 70 L64 63 Z" fill="' + BEAK + '"/>'
      + note + it + (o.deco !== "winter" && dc ? '<g transform="translate(-9 -5)">' + dc + "</g>" : "") + "</svg>";
  }
  function logo(size){
    size = size || 28;
    return '<svg class="sbLogo" viewBox="0 0 32 32" width="' + size + '" height="' + size + '" aria-hidden="true" focusable="false">'
      + '<rect x="5" y="3" width="23" height="26" rx="4" fill="' + NOTE + '"/><rect x="5" y="3" width="5" height="26" rx="2.5" fill="#000" opacity=".2"/>'
      + glasses(18.5, 15, 4, "#fff", 2) + '<path d="M14 23 h9" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>';
  }
  var CSS = ".sbArt{display:block;overflow:visible}.tt-rail [data-ic]{display:flex!important;align-items:center;justify-content:center}.sbArt .sbEye{animation:sbArtBlink 4.2s infinite;transform-origin:60px 53px}"
    + "@keyframes sbArtBlink{0%,93%,100%{transform:none}95%{transform:scaleY(.1)}}"
    + ".sbArt .sbSteam{animation:sbArtSteam 2.4s ease-in-out infinite}@keyframes sbArtSteam{0%,100%{opacity:.25;transform:translateY(2px)}50%{opacity:1;transform:none}}"
    + ".sbArt .sbShake{animation:sbArtShake 1.6s ease-in-out infinite;transform-origin:98px 76px}@keyframes sbArtShake{0%,80%,100%{transform:none}84%{transform:rotate(-10deg)}88%{transform:rotate(10deg)}92%{transform:rotate(-6deg)}}"
    + ".sbArt.lis .sbWave{animation:sbArtWave 1s ease-in-out infinite}@keyframes sbArtWave{0%,100%{opacity:.35}50%{opacity:1}}"
    + "@media (prefers-reduced-motion:reduce){.sbArt *{animation:none!important}}";
  (function(){ var s = document.createElement("style"); s.textContent = CSS; (document.head || document.documentElement).appendChild(s); })();
  window.TT_SBART = {svg: svg, logo: logo, icon: icon, ICONS: ICONS, railIcons: railIcons, items: Object.keys(ITEMS), decos: Object.keys(DECO)};
})();
