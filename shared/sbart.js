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

  /* v2.8 쌤비 소품 (배지를 받으면 하나씩 열림 · 화면 꾸미기에서 고름) */
  var ACC = {
    hat: '<g class="sbAcc"><path d="M49 29 L60 3 L71 29 Z" fill="#F4C0D1" stroke="#04342C" stroke-width="1.4" stroke-linejoin="round"/><path d="M53 20 L67 20 M56 12 L64 12" stroke="#D9483B" stroke-width="2.4" stroke-linecap="round"/><circle cx="60" cy="3" r="3.4" fill="#EF9F27" stroke="#04342C" stroke-width="1.2"/></g>',
    bow: '<g class="sbAcc"><path d="M60 73 L49 67 L49 79 Z M60 73 L71 67 L71 79 Z" fill="#D9483B" stroke="#04342C" stroke-width="1.2" stroke-linejoin="round"/><circle cx="60" cy="73" r="2.8" fill="#A32D24" stroke="#04342C" stroke-width="1.2"/></g>',
    flower: '<g class="sbAcc"><circle cx="89.0" cy="31.0" r="4.2" fill="#FFE27A" stroke="#C99A1E" stroke-width=".8"/><circle cx="85.5" cy="35.8" r="4.2" fill="#FFE27A" stroke="#C99A1E" stroke-width=".8"/><circle cx="80.0" cy="33.9" r="4.2" fill="#FFE27A" stroke="#C99A1E" stroke-width=".8"/><circle cx="80.0" cy="28.1" r="4.2" fill="#FFE27A" stroke="#C99A1E" stroke-width=".8"/><circle cx="85.5" cy="26.2" r="4.2" fill="#FFE27A" stroke="#C99A1E" stroke-width=".8"/><circle cx="84" cy="31" r="3" fill="#EF9F27"/></g>',
    grad: '<g class="sbAcc"><path d="M60 8 L86 18 L60 28 L34 18 Z" fill="#2C2C2A" stroke="#04342C" stroke-width="1.2" stroke-linejoin="round"/><path d="M45 22 v8 q15 6 30 0 v-8" fill="#2C2C2A"/><path d="M86 18 v12" stroke="#EF9F27" stroke-width="1.6"/><circle cx="86" cy="31" r="2" fill="#EF9F27"/></g>',
    crown: '<g class="sbAcc"><path d="M44 30 L46 12 L53 21 L60 8 L67 21 L74 12 L76 30 Z" fill="#F2C744" stroke="#9A6A00" stroke-width="1.4" stroke-linejoin="round"/><circle cx="60" cy="24" r="2.4" fill="#D9483B"/><circle cx="51" cy="25" r="1.8" fill="#378ADD"/><circle cx="69" cy="25" r="1.8" fill="#378ADD"/></g>'
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
  /* 도구마다 선 아이콘 (tools.js 의 id) · 도구가 아닌 칸(설정 카드 등)은 그림 글자로 찾음 */
  var T = {
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    notebook: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M12 8h4M12 12h4"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3v2a5 5 0 0 0 10 0V3M7 21v-2a5 5 0 0 1 10 0v2"/>',
    toolbox: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5h6v3M3 13h18"/>',
    group: '<circle cx="12" cy="8" r="3"/><circle cx="5" cy="10" r="2"/><circle cx="19" cy="10" r="2"/><path d="M7 20a5 5 0 0 1 10 0M2 19a3 3 0 0 1 4-3M22 19a3 3 0 0 0-4-3"/>',
    chart: '<path d="M4 20V11M10 20V5M16 20v-7M2 20h20"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13.5" r="3.5"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"/>',
    list: '<path d="M10 6h10M10 12h10M10 18h10M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    seats: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
    idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 16.5a3.5 3.5 0 0 1 7 0M15 10h3M15 14h3"/>',
    bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    medal: '<circle cx="12" cy="15" r="5"/><path d="M8.5 3l3.5 7 3.5-7"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    robot: '<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9 17h6"/><circle cx="9.5" cy="13" r="1"/><circle cx="14.5" cy="13" r="1"/>',
    cert: '<rect x="5" y="3" width="14" height="14" rx="2"/><path d="M9 8h6M9 12h6M9 21l3-3 3 3"/>',
    clip: '<path d="M15 7l-6.5 6.5a2.1 2.1 0 0 0 3 3L18 10a4.2 4.2 0 0 0-6-6L5.5 10.5a6.4 6.4 0 0 0 9 9L20 14"/>',
    suitcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 12h18"/>',
    map: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    numbers: '<path d="M4 8h2v8M10 8h4v4h-4v4h4M17 8h3v8h-3M17 12h3"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    open: '<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM18 14h2M14 18h2"/>',
    game: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 12.5h4M9 10.5v4"/><circle cx="16" cy="11.5" r=".9"/><circle cx="18" cy="13.5" r=".9"/>',
    teacher: '<circle cx="8" cy="7" r="3"/><path d="M3 20a5 5 0 0 1 10 0M14 5h7v8h-7M17 13v3"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
    phone: '<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-2 0-3h3a4 4 0 0 0 4-4c0-5-4-9-9-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    sparkle: '<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z"/>',
    save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01"/>',
    sprout: '<path d="M12 21v-9M12 12C12 7 8 5 4 5c0 4 3 7 8 7zM12 10c0-4 3-6 7-6 0 4-3 6-7 6z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    megaphone: '<path d="M3 10v4h4l7 4V6l-7 4z"/><path d="M17 9a4 4 0 0 1 0 6"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14-4l-2 2M4 13a8 8 0 0 0 14 4l2-2"/><path d="M4 4v5h5M20 20v-5h-5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    alarm: '<circle cx="12" cy="13" r="7"/><path d="M12 10v3l2 2M4 5l3-2M20 5l-3-2"/>',
    dots: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>'
  };
  var TOOL = {timetable: "clock", book: "class", remote: "phone", stuprog: "qr", journal: "notebook", mpace: "hourglass", "class": "toolbox", group: "group", assess: "chart", mblue: "target",
    roster: "homeroom", photo: "camera", tardy: "compass", parent: "mail", submit: "box", duty: "list", seat: "seats",
    stucard: "idcard", voice: "mic", gquick: "bolt", counsel: "chat", record: "doc", advisor: "cap", bonus: "medal",
    year: "calendar", schoolhub: "school", lib: "search", ai: "robot", train: "cert", merge: "clip", setup: "suitcase",
    concept: "map", mgen: "numbers", mcheck: "check", mstudy: "open", mqr: "qr", play: "game", kread: "open", kreadt: "teacher"};
  var EMO = {"🗣️": "chat", "🔁": "refresh", "⚡": "bolt", "📄": "doc", "📦": "box", "📝": "pencil", "⏳": "hourglass", "📆": "calendar", "🏖️": "sun", "👀": "eye", "🧭": "compass", "✏️": "pencil", "⏰": "alarm", "📣": "megaphone", "🎓": "cap", "📋": "list", "📞": "phone", "🗂️": "lib", "🙋": "doc", "📅": "calendar", "🔗": "link", "📞": "phone", "🏫": "school", "🎨": "palette", "✨": "sparkle", "☁️": "cloud", "💾": "save", "📂": "lib", "❓": "help", "🌱": "sprout", "🧳": "suitcase"};
  Object.keys(T).forEach(function(k){ if(!ICONS[k]) ICONS[k] = T[k]; });
  if(!ICONS.keyboard) ICONS.keyboard = '<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10"/>';
  EMO["⌨️"] = EMO["⌨"] = "keyboard"; EMO["🎈"] = "medal"; EMO["📲"] = "phone";   // v2.8 ⋯ 메뉴
  function toolIcon(id, emoji, size){
    var e = String(emoji || "").trim(), k = TOOL[id] || EMO[e];
    if(!k && e && typeof TT_TOOLS !== "undefined"){ var t = TT_TOOLS.filter(function(x){ return x.icon === e; })[0]; if(t) k = TOOL[t.id]; }   // 그림 글자만 아는 칸(찾기 결과 등)은 도구 목록에서
    return icon(k || "dots", size);
  }
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
      + note + it + (o.deco !== "winter" && dc && !(o.acc && ACC[o.acc] && o.acc !== "bow") ? '<g transform="translate(-9 -5)">' + dc + "</g>" : "") + (o.acc && ACC[o.acc] ? ACC[o.acc] : "") + "</svg>";
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
  window.TT_SBART = {accs: Object.keys(ACC), svg: svg, logo: logo, icon: icon, toolIcon: toolIcon, ICONS: ICONS, railIcons: railIcons, items: Object.keys(ITEMS), decos: Object.keys(DECO)};
})();
