/* 쌤 노트 · 마스코트 챗봇 "쌤비" (쌤의 비서, 안경 쓴 부엉이) — v1.1 (v1.10.2: 모든 화면 오른쪽 아래에 떠 있는 둥근 쌤비 + 첫 화면 위쪽 단추, Alt+B)
   휴대폰은 오른쪽 아래, 넓은 화면은 왼쪽 메뉴 막대 부엉이를 누르면(또는 Alt+B) 창이 열립니다. 한 화면(스크롤 없이)에 네 가지:
   ① 🎤 말로 입력 — 브라우저 음성 인식(크롬·엣지·삼성 인터넷). 알아들은 말을 이렇게 나눕니다.
        "12번 지각" / "홍길동 결석" → 우리 반 오늘 출결에 기록 (확인 단추를 눌러야 저장)
        "종례 내일 체육복" → 종례 바구니 · "할 일 금요일 공문 회신" → 내 할 일
        "찾아 줘 ○○" → 찾기 · "결석신고서" "시간표" 같은 도구 이름 → 바로 열기 · "브리핑" → 오늘 브리핑
        그 밖의 말은 찾기 창(Ctrl+K)에 넣어 고르게 합니다(학생 기록·할 일·종례 바구니).
   ② 🔎 찾기 — 기존 찾기 창(shared/today.js TT_FIND)을 엽니다.
   ③ ☀️ 오늘 브리핑 — 오늘 수업 · 챙길 일 · 종례 바구니 · 내 할 일 · 우리 반 출결. 🔊 읽어 주기는 숫자만 읽음(학생 이름 X).
   ④ ⚡ 바로 실행 — 자주 하는 일 단추.
   (v1.2) 음성 인식은 공통 엔진 shared/voice.js(TTVoice)로 옮겼습니다.
   🔒 자료는 이 기기 안에서만 읽고 씁니다. 단, 음성 인식은 브라우저 회사(구글 등) 서버를 거칠 수 있어
      학생 이름 대신 번호로 말하기를 권합니다(창 아래 안내). 교실 기기(전자칠판) 모드에서는 쌤비를 숨깁니다. */
(function(){
  "use strict";
  if(typeof TT === "undefined" || TT.classroom) return;
  var KEYG = "tt_guide_v1", KEYU = "tt_ssambi_v1";
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hm(m){ return Math.floor(m / 60) + ":" + pad(m % 60); }
  function tool(id){ return typeof ttTool === "function" ? ttTool(id) : null; }
  function tname(id, fb){ var t = tool(id); return t ? t.name : fb; }
  /* v1.10.1: 도구 화면(apps/…)에서도 쌤비가 나옵니다. 주소는 쌤 노트 맨 위(TT.BASE) 기준으로 */
  var BASE = TT.BASE || "", HOME = !/\/apps\/[^\/]+\/(index\.html)?$/.test(location.pathname);
  function abs(href){ return !href || /^([a-z]+:|\/|#)/i.test(href) ? href : BASE + href; }
  function go(href){ if(href) location.href = abs(href); }
  var VO = window.TTVoice, SR = !!(VO && VO.supported);           // 말→글은 공통 엔진(shared/voice.js)을 씁니다

  /* ── 부엉이 그림 (직접 그린 SVG, 외부 파일 없음) ── */
  var V2 = document.documentElement.getAttribute("data-ui") === "ssambi" && window.TT_SBART;   // v2.0 쌤비 홈: 노트를 든 새 쌤비(shared/sbart.js)
  var OWL = V2 ? TT_SBART.svg({acc: TT.joy && TT.joy.acc ? TT.joy.acc() : "", size: 80, deco: (function(){ var lk = document.documentElement.getAttribute("data-look"), m = new Date().getMonth() + 1; return /^(spring|summer|autumn|winter)$/.test(lk || "") ? lk : m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter"; })()}) : '<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="#E1F5EE"/>'
    + '<path d="M18 30 L24 14 L32 26 Z M62 30 L56 14 L48 26 Z" fill="#0F6E56"/><ellipse cx="40" cy="46" rx="24" ry="26" fill="#1D9E75"/>'
    + '<ellipse cx="40" cy="54" rx="14" ry="15" fill="#9FE1CB"/><circle cx="30" cy="38" r="9" fill="#fff" stroke="#04342C" stroke-width="2.5"/>'
    + '<circle cx="50" cy="38" r="9" fill="#fff" stroke="#04342C" stroke-width="2.5"/><line x1="39" y1="38" x2="41" y2="38" stroke="#04342C" stroke-width="2.5"/>'
    + '<g class="sbEye"><circle cx="31" cy="39" r="3.5" fill="#04342C"/><circle cx="49" cy="39" r="3.5" fill="#04342C"/></g>'
    + '<path d="M37 46 L40 50 L43 46 Z" fill="#EF9F27"/><rect x="50" y="56" width="14" height="10" rx="2" fill="#fff" stroke="#04342C" stroke-width="1.5"/>'
    + '<line x1="53" y1="60" x2="61" y2="60" stroke="#04342C" stroke-width="1.2"/></svg>';

  var st = document.createElement("style");
  st.textContent = ""
    + "#sbBtn{position:fixed;right:22px;bottom:22px;z-index:70;width:78px;height:78px;border:0;padding:5px;border-radius:50%;background:#fff;cursor:pointer;box-shadow:0 0 0 3px #1D9E75,0 10px 26px rgba(15,110,86,.38);-webkit-tap-highlight-color:transparent;transition:transform .18s,box-shadow .18s;animation:sbBob 3.6s ease-in-out infinite}"
    + "@keyframes sbBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}"
    + "#sbBtn .nm{position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);background:#1D9E75;color:#fff;font-size:11.5px;font-weight:800;line-height:1;padding:4px 9px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 6px rgba(15,110,86,.3);font-family:inherit}"
    + "#sbBtn .dot{position:absolute;right:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#EF9F27;border:2px solid #fff;animation:sbDot 1.8s infinite}@keyframes sbDot{50%{transform:scale(1.25)}}"
    + "#sbBtn.open{animation:none;box-shadow:0 0 0 4px #0F6E56,0 10px 26px rgba(15,110,86,.45)}#sbBtn.open .dot{display:none}"
    + "#sbBtn:hover{animation:none;transform:translateY(-4px) scale(1.07);box-shadow:0 0 0 4px #1D9E75,0 14px 30px rgba(15,110,86,.45)}#sbBtn svg{width:100%;height:100%;display:block}"
    + "#sbBtn.on .sbEye{animation:sbBlink 3.2s infinite}@keyframes sbBlink{0%,92%,100%{transform:none}95%{transform:scaleY(.1)}}#sbBtn .sbEye{transform-origin:40px 39px}"
    + "#sbBtn.lis{animation:sbPulse 1s infinite}@keyframes sbPulse{50%{filter:drop-shadow(0 0 0 6px rgba(29,158,117,.35)) drop-shadow(0 0 14px rgba(29,158,117,.6))}}"
    + "#sbTip{position:fixed;right:112px;bottom:44px;z-index:70;max-width:min(240px,60vw);background:var(--card,#fff);color:var(--ink,#1f2a37);border:1px solid var(--line,#dde3ea);border-radius:14px 14px 4px 14px;padding:7px 11px;font-size:13px;line-height:1.45;box-shadow:0 6px 18px rgba(30,60,100,.14);cursor:pointer}"
    + "#sbBox{position:fixed;right:22px;bottom:118px;z-index:71;width:min(360px,calc(100vw - 24px));max-height:calc(100vh - 140px);overflow:auto;background:var(--card,#fff);color:var(--ink,#1f2a37);border:1px solid var(--line,#dde3ea);border-radius:16px;box-shadow:0 14px 36px rgba(30,60,100,.22);padding:12px 14px;font-size:14px;line-height:1.5}"
    + "#sbBox[hidden],#sbTip[hidden]{display:none}"
    + "#sbBox .hd{display:flex;align-items:center;gap:8px;margin-bottom:8px}#sbBox .hd .av{width:34px;height:34px;flex:none}#sbBox .hd .av svg{width:100%;height:100%}"
    + "#sbBox .hd b{font-size:15px}#sbBox .hd .x,#sbBox .hd .bk{margin-left:auto;border:0;background:none;font:inherit;font-size:18px;cursor:pointer;color:var(--sub,#5b6775);padding:2px 6px;border-radius:8px}#sbBox .hd .bk{margin-left:0;font-size:15px}"
    + "#sbBox .hd .x:hover,#sbBox .hd .bk:hover{background:var(--bg,#f3f6f9)}"
    + "#sbBox .g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}"
    + "#sbBox .bt{display:flex;align-items:center;gap:6px;min-height:46px;padding:8px 10px;border:1px solid var(--line,#dde3ea);border-radius:12px;background:var(--card,#fff);color:inherit;font:inherit;font-weight:700;cursor:pointer;text-align:left;text-decoration:none;line-height:1.25}"
    + "#sbBox .bt:hover{border-color:#1D9E75;background:#E1F5EE;color:#04342C}#sbBox .bt i{font-style:normal;font-size:18px;flex:none}#sbBox .bt small{display:block;font-weight:500;font-size:11.5px;color:var(--sub,#5b6775)}"
    + "#sbBox .bt.p{background:#1D9E75;border-color:#1D9E75;color:#fff}#sbBox .bt.p:hover{background:#0F6E56}#sbBox .bt.p small{color:#E1F5EE}"
    + "#sbBox .nt{margin-top:8px;font-size:11.5px;color:var(--sub,#5b6775);line-height:1.45}"
    + "#sbBox .say{min-height:52px;border-radius:12px;background:var(--bg,#f3f6f9);padding:10px 12px;margin:2px 0 10px;font-size:15px}"
    + "#sbBox .say.ph{color:var(--sub,#8a95a1)}#sbBox .ok{color:#0F6E56;font-weight:700}#sbBox .er{color:var(--danger,#c62828)}"
    + "#sbBox .ex{font-size:12.5px;color:var(--sub,#5b6775);line-height:1.6}#sbBox .ex b{color:var(--ink,#1f2a37);font-weight:700}"
    + "#sbBox .row{display:flex;gap:8px;margin-top:8px}#sbBox .row .bt{flex:1;justify-content:center}"
    + "#sbBox .sec{margin:6px 0 2px;font-size:12px;font-weight:800;color:#0F6E56}"
    + "#sbBox .pds{display:flex;gap:3px;flex-wrap:wrap}#sbBox .pds span{flex:1;min-width:38px;text-align:center;border-radius:8px;background:var(--bg,#f3f6f9);padding:3px 0;font-size:12px;line-height:1.3}"
    + "#sbBox .pds span i{display:block;font-style:normal;font-size:10.5px;color:var(--sub,#8a95a1)}#sbBox .pds span.cur{background:#1D9E75;color:#fff}#sbBox .pds span.cur i{color:#E1F5EE}#sbBox .pds span.past{opacity:.45}"
    + "#sbBox ul{list-style:none;margin:0;padding:0}#sbBox li{display:flex;gap:6px;align-items:center;padding:2px 0;font-size:13.5px}"
    + "#sbBox li a{color:inherit;text-decoration:none;display:flex;gap:6px;flex:1;min-width:0}#sbBox li a:hover{text-decoration:underline}"
    + "#sbBox li .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#sbBox li .n{flex:none;font-size:11.5px;font-weight:800;border-radius:999px;padding:0 7px;background:#FAEEDA;color:#854F0B}"
    + "#sbBox li .n.hi{background:#FCEBEB;color:#A32D2D}"
    + "@media (max-width:760px){#sbBtn{bottom:calc(84px + env(safe-area-inset-bottom,0px));width:62px;height:62px;right:14px;padding:4px}#sbTip{bottom:calc(98px + env(safe-area-inset-bottom,0px));right:86px}#sbBox{bottom:calc(160px + env(safe-area-inset-bottom,0px));right:12px;max-height:calc(100vh - 170px)}}"
    /* v1.2.2 넓은 화면(PC): 왼쪽 메뉴 막대 '학교' 아래에 큰 부엉이, 창은 그 오른쪽으로. 휴대폰: 오른쪽 아래 그대로 */
    + ".mnav .sbRail{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;height:84px;margin-top:6px;border:0;background:none;cursor:pointer;border-radius:14px;font:inherit;font-size:11.5px;font-weight:800;color:#0F6E56;-webkit-tap-highlight-color:transparent;padding:0}"
    + ".mnav .sbRail svg{width:60px;height:60px;display:block;filter:drop-shadow(0 3px 6px rgba(15,110,86,.28));transition:transform .2s}"
    + ".mnav .sbRail:hover{background:#E1F5EE}.mnav .sbRail:hover svg{transform:translateY(-3px) rotate(-6deg)}"
    + ".mnav .sbRail.open{background:#E1F5EE}.mnav .sbRail .sbEye{animation:sbBlink 3.2s infinite;transform-origin:40px 39px}"
    + ".mnav .sbRail.lis svg{animation:sbPulse 1s infinite}.mnav .sbRail small{font-size:10px;font-weight:700;color:var(--sub,#5b6775)}"
    + ".mnav .sbRail.hop svg{animation:sbHop .9s ease 2}@keyframes sbHop{0%,100%{transform:none}30%{transform:translateY(-8px) rotate(-8deg)}60%{transform:translateY(0) rotate(5deg)}}"
    + ".sbHd{display:inline-flex;align-items:center;gap:4px;background:#E1F5EE!important;color:#04342C!important}.sbHd:hover{background:#1D9E75!important;color:#fff!important}"
    + ".sbHd svg{width:22px;height:22px;flex:none;margin:-3px 0}.sbHd small{opacity:.6;font-weight:700}.sbHd.lis{animation:sbPulse 1s infinite}"
    + "@media (max-width:760px){.sbHd{display:none!important}}"
    + "@media (min-width:761px){body.sbSide #sbBtn{display:none}}"
    + "@media (max-width:760px){.mnav .sbRail{display:none!important}}"
    + ".tt-rail .sbFoot{color:#0F6E56!important;background:#E1F5EE!important}.tt-rail .sbFoot:hover,.tt-rail .sbFoot.open{background:#1D9E75!important;color:#fff!important}"
    + ".tt-rail .sbFoot svg{width:22px;height:22px;flex:none}.tt-rail .sbFoot .sbEye{animation:sbBlink 3.2s infinite;transform-origin:40px 39px}.tt-rail .sbFoot.lis svg{animation:sbPulse 1s infinite}"
    + "@media (min-width:900px) and (min-height:460px){html.sbRailOn #sbBtn{display:none}}"
    + "@media print{#sbBtn,#sbBox,#sbTip,.sbRail,.sbHd,.sbFoot{display:none!important}}";
  document.head.appendChild(st);

  var btn = document.createElement("button");
  btn.id = "sbBtn"; btn.type = "button"; btn.className = "on"; btn.title = "쌤비 — 말로 입력 · 찾기 · 오늘 브리핑 · 바로 실행 (Alt+B)"; btn.setAttribute("aria-label", "쌤비 열기");
  btn.innerHTML = OWL + '<span class="nm">쌤비</span>' + (sessionStorage.getItem("sbSeen") ? "" : '<span class="dot"></span>'); document.body.appendChild(btn);
  var box = document.createElement("div"); box.id = "sbBox"; box.hidden = true; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "쌤비");
  document.body.appendChild(box);
  var tip = document.createElement("div"); tip.id = "sbTip"; tip.hidden = true; document.body.appendChild(tip);
  /* PC: 첫 화면 왼쪽 메뉴 막대(#mnav) '학교' 아래에 큰 부엉이. 메뉴 막대는 화면을 옮길 때마다 새로 그려지므로 그때마다 다시 넣습니다. */
  var nav = null, hb = null, rail = null;   // v1.10.2: 메뉴 막대 대신 모든 화면 오른쪽 아래에 떠 있는 둥근 쌤비 (첫 화면 위쪽 단추는 그대로)
  if(rail){                                                             // 도구 화면: 왼쪽 메뉴 막대 아래칸(설정 위)에 작은 부엉이
    hb = document.createElement("button"); hb.type = "button"; hb.className = "tt-ri sbFoot"; hb.title = "쌤비 — 말로 입력 · 찾기 · 오늘 브리핑 · 말로 기록 (Alt+B)"; hb.setAttribute("aria-label", "쌤비 열기 (Alt+B)");
    hb.innerHTML = OWL + "<b>쌤비</b>";
    var ft = rail.querySelector(".tt-foot"); if(ft) ft.insertBefore(hb, ft.firstChild); else rail.appendChild(hb);
    document.documentElement.classList.add("sbRailOn");
    setTimeout(function(){ window.dispatchEvent(new Event("resize")); }, 0);
  }
  if(nav){
    hb = document.createElement("button"); hb.type = "button"; hb.className = "sbRail"; hb.title = "쌤비 — 말로 입력 · 찾기 · 오늘 브리핑 · 말로 기록 (Alt+B)"; hb.setAttribute("aria-label", "쌤비 열기 (Alt+B)");
    hb.innerHTML = OWL + "<span>쌤비</span><small>Alt+B</small>";
    var seat = function(){
      if(hb.parentNode === nav && hb.previousElementSibling && hb.previousElementSibling.getAttribute("data-menu") === "school") return;
      var sc = nav.querySelector('[data-menu="school"]'), sp = nav.querySelector(".sp");
      if(sc) nav.insertBefore(hb, sc.nextSibling); else if(sp) nav.insertBefore(hb, sp); else nav.appendChild(hb);
    };
    seat(); new MutationObserver(seat).observe(nav, {childList: true});
    document.body.classList.add("sbSide");
    setTimeout(function(){ hb.classList.add("hop"); setTimeout(function(){ hb.classList.remove("hop"); }, 2000); }, 1200);   // 처음 열 때 한 번 폴짝
  }
  /* PC: 위쪽 머리글 🔎 찾기 앞에도 쌤비 단추 (v1.2.3 — 두 곳 모두) */
  var bar = HOME && document.querySelector("header .bar"), hd = null;
  if(bar){
    hd = document.createElement("button"); hd.type = "button"; hd.className = "qrec sbHd"; hd.title = "쌤비 — 말로 입력 · 찾기 · 오늘 브리핑 · 말로 기록 (Alt+B)"; hd.setAttribute("aria-label", "쌤비 열기 (Alt+B)");
    hd.innerHTML = OWL + '<span class="ql"> 쌤비 <small>Alt+B</small></span>';
    bar.insertBefore(hd, bar.firstChild);
  }
  var from = null;                                                      // 마지막으로 누른 단추(창을 그 옆에)
  function isSide(){ return hb && hb.offsetParent !== null; }            // 지금 메뉴 막대의 부엉이가 보이는가(넓은 화면)
  function seen(el){ return !!el && (el.offsetParent !== null || (el.offsetWidth > 0 && getComputedStyle(el).position === "fixed")); }   // 고정(fixed) 단추는 offsetParent가 없음
  function place(){                                                     // 창·말풍선 자리: 누른 단추 옆 / 휴대폰은 오른쪽 아래
    [box, tip].forEach(function(el){ el.style.top = el.style.bottom = el.style.left = el.style.right = el.style.borderRadius = el.style.maxHeight = ""; });
    var h = window.innerHeight, w = window.innerWidth;
    if(from && from.nodeType === 1 && from !== hd && from !== hb && from !== btn && seen(from)){   // v2.0: 쌤비 홈의 큰 쌤비 → 바로 아래 가운데
      var a = from.getBoundingClientRect(), bw = Math.min(360, w - 24), lx = Math.round(Math.max(12, Math.min(w - bw - 12, a.left + a.width / 2 - bw / 2))), ty = Math.round(Math.min(a.bottom + 8, h - 220));
      var rl = from.closest && from.closest("#sbRail"); if(rl){ lx = Math.round(rl.getBoundingClientRect().right + 12); ty = Math.round(Math.max(12, a.top)); }   // 도구 화면: 왼쪽 막대 바로 오른쪽
      box.style.top = ty + "px"; box.style.bottom = "auto"; box.style.left = lx + "px"; box.style.right = "auto"; box.style.maxHeight = (h - ty - 16) + "px";
      tip.style.top = ty + "px"; tip.style.bottom = "auto"; tip.style.left = lx + "px"; tip.style.right = "auto";
      return;
    }
    if(from === hd && seen(hd)){                                        // 위쪽 단추 → 바로 아래
      var q = hd.getBoundingClientRect(), rt = Math.max(12, w - q.right) + "px", yy = Math.round(q.bottom + 8);
      box.style.top = yy + "px"; box.style.bottom = "auto"; box.style.right = rt; box.style.maxHeight = (h - yy - 16) + "px";
      tip.style.top = yy + "px"; tip.style.bottom = "auto"; tip.style.right = rt; tip.style.borderRadius = "14px 4px 14px 14px";
      return;
    }
    if(!isSide()){                                                      // 떠 있는 부엉이 → 부엉이 위(자리가 없으면 아래), 오른쪽 끝 맞춤
      if(!seen(btn)){ var bo = document.getElementById("sbBarOwl"); if(bo && seen(bo)){ from = bo; place(); } return; }   // v2.0.1: 위쪽 고정 줄의 쌤비 아래로
      var b = btn.getBoundingClientRect(), bw = Math.min(360, w - 24), lx = Math.round(Math.max(12, Math.min(b.right - bw, w - bw - 12)));
      box.style.left = lx + "px"; box.style.right = "auto";
      if(b.top > 320 || b.top > h - b.bottom){ box.style.top = "auto"; box.style.bottom = Math.round(h - b.top + 14) + "px"; box.style.maxHeight = Math.round(b.top - 26) + "px"; }
      else { box.style.bottom = "auto"; box.style.top = Math.round(b.bottom + 14) + "px"; box.style.maxHeight = Math.round(h - b.bottom - 26) + "px"; }
      var tl = b.left > 260; tip.style.top = Math.round(b.top + 16) + "px"; tip.style.bottom = "auto";
      if(tl){ tip.style.right = Math.round(w - b.left + 10) + "px"; tip.style.left = "auto"; } else { tip.style.left = Math.round(b.right + 10) + "px"; tip.style.right = "auto"; tip.style.borderRadius = "14px 14px 14px 4px"; }
      return;
    }
    var r = hb.getBoundingClientRect(), x = Math.round(r.right + 12) + "px";
    var y = Math.max(12, Math.min(r.top - 20, h - 560));
    box.style.left = x; box.style.right = "auto"; box.style.top = y + "px"; box.style.bottom = "auto"; box.style.maxHeight = (h - y - 16) + "px";
    tip.style.left = x; tip.style.right = "auto"; tip.style.top = Math.round(r.top + 14) + "px"; tip.style.bottom = "auto"; tip.style.borderRadius = "4px 14px 14px 14px";
  }
  function lis(on){ btn.classList.toggle("lis", on); if(hb) hb.classList.toggle("lis", on); if(hd) hd.classList.toggle("lis", on); }
  function mark(){ if(hb) hb.classList.toggle("open", !box.hidden && from !== hd); btn.classList.toggle("open", !box.hidden && from !== hd); if(!box.hidden){ var d = btn.querySelector(".dot"); if(d) d.remove(); try{ sessionStorage.setItem("sbSeen", "1"); }catch(e){} } }
  function toggle(src){ if(box.hidden){ from = src || null; open("menu"); } else if(src && src !== from && seen(src)){ from = src; place(); mark(); } else close(); }

  function head(title, back){
    return '<div class="hd">' + (back ? '<button type="button" class="bk" data-a="menu" aria-label="처음으로">←</button>' : '<span class="av">' + OWL + "</span>")
      + "<b>" + title + '</b><button type="button" class="x" data-a="close" aria-label="닫기">✕</button></div>';
  }
  function open(view, arg, anchor){ if(anchor) from = anchor; tip.hidden = true; place(); box.hidden = false; mark(); show(view || "menu", arg); }
  function close(){ stopListen(); box.hidden = true; mark(); }
  function show(view, arg){ box.innerHTML = (V[view] || V.menu)(arg);
    Array.prototype.forEach.call(box.querySelectorAll("a[href]"), function(a){ a.setAttribute("href", abs(a.getAttribute("href"))); });
    var f = box.querySelector("[autofocus]"); if(f) f.focus(); }

  /* ── 화면들 ── */
  var V = {};
  V.menu = function(){
    var hr = new Date().getHours(), hi = hr < 5 ? "늦은 시간이에요. 푹 쉬세요." : hr < 11 ? "좋은 아침이에요!" : hr < 17 ? "무엇을 도와드릴까요?" : "오늘도 수고하셨어요.";
    return head("쌤비 <small style='font-weight:500;color:var(--sub,#5b6775)'>· " + hi + "</small>")
      + '<div class="g2">'
      + '<button type="button" class="bt p" data-a="listen" autofocus><i>🎤</i><span>말로 입력<small>"12번 지각"</small></span></button>'
      + '<button type="button" class="bt" data-a="find"><i>🔎</i><span>찾기<small>학생·도구·자료</small></span></button>'
      + '<button type="button" class="bt" data-a="brief"><i>☀️</i><span>오늘 브리핑<small>수업·챙길 일</small></span></button>'
      + '<button type="button" class="bt" data-a="run"><i>⚡</i><span>바로 실행<small>자주 하는 일</small></span></button>'
      + "</div>"
      + ('<button type="button" class="bt" data-a="voice" style="width:100%;margin-top:6px"><i>🎙️</i><span>말로 기록<small>상담 · 학부모 상담 · 회의 · 수업 관찰 · 할 일</small></span></button>')
      + '<p class="nt">🔒 기록은 이 기기 안에만 저장돼요.<br>⌨️ 단축키: <b>Alt+B</b> 쌤비 · <b>Ctrl+K</b> 찾기</p>';
  };
  V.listen = function(a){
    a = a || {};
    var noSR = !SR;
    return head("🎤 말로 입력", true)
      + '<div class="say' + (a.text ? "" : " ph") + '" id="sbSay">' + (noSR ? (VO ? VO.fallbackHTML() : '<span class="er">이 브라우저는 음성 인식을 지원하지 않아요. 아래 칸에 글로 적어 주세요.</span>') : a.text ? esc(a.text) : "듣고 있어요… 말씀해 주세요") + "</div>"
      + '<div class="row" style="margin-top:0"><input id="sbTxt" type="text" placeholder="또는 글로: 12번 지각" style="flex:1;min-width:0;height:40px;border:1px solid var(--line,#dde3ea);border-radius:10px;padding:0 10px;font:inherit;background:var(--card,#fff);color:inherit" autocomplete="off">'
      + '<button type="button" class="bt p" data-a="typed" style="flex:none;min-height:40px">확인</button></div>'
      + '<div class="row">' + (noSR ? "" : '<button type="button" class="bt" data-a="relisten">🎤 다시 듣기</button>') + "</div>"
      + '<div class="ex" style="margin-top:8px">이렇게 말해 보세요<br><b>12번 지각</b> · <b>5번 결석</b> · <b>3번 휴대폰 지도</b> · <b>3반 5번 칠판 풀이</b> · <b>12번 진학</b> · <b>종례 내일 체육복</b> · <b>할 일 금요일 공문 회신</b> · <b>결석신고서 열어</b> · <b>찾아 줘 교복</b> · <b>기재요령에서 봉사활동 찾아 줘</b> · <b>브리핑</b></div>'
      + '<p class="nt">🔒 음성 인식은 브라우저 회사 서버를 거칠 수 있어요. 학생은 <b>이름 대신 번호</b>로 말해 주세요.</p>';
  };
  V.confirm = function(c){
    return head("✔ 확인해 주세요", true)
      + '<div class="say">' + c.html + "</div>"
      + '<div class="row"><button type="button" class="bt p" data-a="yes" autofocus>' + esc(c.yes || "기록하기") + '</button><button type="button" class="bt" data-a="listen">다시 말하기</button></div>'
      + (c.note ? '<p class="nt">' + c.note + "</p>" : "");
  };
  V.brief = function(){
    var B = window.TT_TODAY && TT_TODAY.brief ? TT_TODAY.brief() : null;
    if(!B){ if(!HOME){ setTimeout(function(){ go("?sb=brief"); }, 0); return head("☀️ 오늘 브리핑", true) + '<div class="say ph">첫 화면으로 가서 브리핑을 열어요…</div>'; }
      return head("☀️ 오늘 브리핑", true) + '<div class="say ph">브리핑을 불러오지 못했어요.</div>'; }
    var d = new Date(), DOW = "일월화수목금토", m = d.getHours() * 60 + d.getMinutes(), h = "";
    h += '<div class="sec">📅 ' + (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + DOW[d.getDay()] + ")" + (B.weekday && B.close ? " · 종례 " + hm(B.close) : "") + "</div>";
    if(!B.weekday) h += '<div class="ex">주말이에요. 푹 쉬세요!</div>';
    else if(!B.hasTT) h += '<div class="ex"><a href="apps/timetable/" style="color:#0F6E56;font-weight:700">🕘 시간표를 넣으면</a> 오늘 수업이 나와요.</div>';
    else if(!B.lessons.length) h += '<div class="ex">오늘은 수업이 없어요.</div>';
    else{
      var left = B.lessons.filter(function(x){ return x.end > m; }).length;
      h += '<div class="pds">' + B.lessons.map(function(x){ var c = m >= x.end ? "past" : m >= x.start ? "cur" : ""; return '<span class="' + c + '"><i>' + x.n + "교시</i>" + esc(x.c) + (x.chg ? "🔁" : "") + "</span>"; }).join("") + "</div>"
        + '<div class="ex" style="margin-top:3px">수업 ' + B.lessons.length + "시간 · 남은 수업 " + left + "시간</div>";
    }
    var it = B.items.slice(0, 5);
    h += '<div class="sec">✅ 챙길 일' + (B.items.length ? " " + B.items.length + "가지" : "") + "</div>";
    h += it.length ? "<ul>" + it.map(function(x){ var inner = '<span>' + x.ic + '</span><span class="t">' + esc(x.t) + '</span><span class="n' + (x.lv === "hi" ? " hi" : "") + '">' + esc(x.n) + "</span>";
      return "<li>" + (x.href ? '<a href="' + esc(x.href) + '">' + inner + "</a>" : inner) + "</li>"; }).join("") + "</ul>" : '<div class="ex">급한 일이 없어요. 👍</div>';
    var att = B.att;
    h += '<div class="sec">🌱 우리 반 · 종례 · 할 일</div><ul>'
      + (att ? '<li><a href="apps/tardy/"><span>🧭</span><span class="t">오늘 출결 (' + esc(att.name || "우리 반") + ")</span><span class=\"n\">" + (att.abs || att.late ? "결석 " + att.abs + " · 지각 " + att.late : "모두 출석") + "</span></a></li>" : "")
      + (window.TTMeal && TTMeal.todayText() ? '<li><a href="#" onclick="TTMeal.open();return false"><span>🍚</span><span class="t">' + esc(TTMeal.todayText()) + "</span></a></li>" : "")
      + '<li><span>📣</span><span class="t">' + (B.bag.length ? esc(B.bag.slice(0, 2).join(" · ")) : "종례 바구니가 비어 있어요") + '</span>' + (B.bag.length ? '<span class="n">' + B.bag.length + "건</span>" : "") + "</li>"
      + '<li><span>📝</span><span class="t">' + (B.todoDue.length ? "오늘까지: " + esc(B.todoDue.slice(0, 2).join(" · ")) : "오늘까지 할 일 없음") + '</span><span class="n' + (B.todoDue.length ? " hi" : "") + '">' + B.todo + "건</span></li></ul>";
    return head("☀️ 오늘 브리핑", true) + h
      + '<div class="row"><button type="button" class="bt" data-a="speak">🔊 읽어 주기</button><button type="button" class="bt" data-a="listen">🎤 말로 입력</button></div>'
      + '<p class="nt">🔊 읽어 주기는 숫자만 읽고 학생 이름은 읽지 않아요.</p>';
  };
  function runList(){
    var L = [
      ["🧭", "지각·결석 기록", "말로: 12번 지각", function(){ show("listen"); startListen(); }],
      ["📄", "결석신고서", tname("tardy", "출결"), "apps/tardy/?tab=report", "tardy"],
      ["📣", "종례 바구니에 넣기", "종례에 전할 말", function(){ find("종례 "); }],
      ["📝", "할 일 넣기", "할 일: 날짜 + 내용", function(){ find("할 일: "); }],
      ["📒", tname("journal", "수업 기록"), "오늘 진도·메모", "apps/journal/", "journal"],
      ["📘", tname("book", "교과서 띄우기"), "수업 모드", "apps/book/", "book"],
      ["📦", tname("submit", "제출물 확인"), "미제출 모아 보기", "apps/submit/", "submit"],
      ["🔎", tname("lib", "자료실"), "서식·규정집", "apps/lib/", "lib"]
    ];
    return L.filter(function(x){ var t = x[4] && tool(x[4]); return !x[4] || (t && t.ready && (typeof ttToolShown !== "function" || ttToolShown(t))); });
  }
  V.run = function(){
    return head("⚡ 바로 실행", true) + '<div class="g2">' + runList().map(function(x, i){
      return '<button type="button" class="bt" data-r="' + i + '"><i>' + x[0] + "</i><span>" + esc(x[1]) + "<small>" + esc(x[2]) + "</small></span></button>"; }).join("") + "</div>"
      + '<p class="nt">말로도 돼요: "<b>결석신고서 열어</b>", "<b>시간표</b>"</p>';
  };

  /* v2.1 쌤비 홈 디자인: 쌤비 창 = 오늘 상황(읽기만) + 말하기 단추 하나 [한마디 / 길게 기록]
     찾기(→ 검색창)·바로 실행(→ 메뉴)·오늘 브리핑 단추(→ 창 맨 위에 바로)·말로 입력/말로 기록 두 단추(→ 하나)처럼 겹치던 것을 뺐습니다. */
  function sbMode(){ try{ return sessionStorage.getItem("sbMode") === "long" ? "long" : "short"; }catch(e){ return "short"; } }
  function briefLines(){
    var L = [], d = new Date(), w = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), T = TT.timetable;
    function cls(x){ var c = +x.cls; return c > 100 ? Math.floor(c / 100) + "-" + (c % 100) : String(x.code || ""); }
    try{
      if(w < 1 || w > 5) L.push(["📅", "주말이에요 · 푹 쉬세요", ""]);
      else if(!T.has()) L.push(["🕘", "시간표를 넣으면 오늘 수업이 나와요", "apps/timetable/"]);
      else{ var cur = T.now(), nx = T.next(), all = T.day(d);
        L.push(["🕘", cur ? "지금 " + cur.n + "교시 " + cls(cur) + " · 끝까지 " + (cur.end - m) + "분" : nx ? "다음 " + nx.n + "교시 " + cls(nx) + " · " + (nx.start - m <= 180 ? (nx.start - m) + "분 뒤" : nx.t) : "오늘 수업 " + all.length + "시간 · 모두 끝", "apps/journal/"]); }
    }catch(e){}
    try{ var NM = TT.store.get("tt_ttneis_v1", null), nmon = TT.timetable.monday(new Date(d.getTime() + (w === 0 ? 1 : w === 6 ? 2 : 0) * 864e5)), NW = ((NM && NM.weeks) || []).filter(function(x){ return x.list && x.list.length && x.mon >= nmon && Date.now() - (x.at || 0) < 3 * 864e5; });   // v2.70 최근 반영한 수업 교체
      NW.forEach(function(x){ L.push(["🔁", (x.mon === nmon ? "이번 주" : "다음 주") + " 수업 교체 " + x.list.length + "곳 · 시간표에 반영했어요", "apps/timetable/"]); }); }catch(e){}
    var B = null; try{ B = window.TT_TODAY && TT_TODAY.brief ? TT_TODAY.brief() : null; }catch(e){}
    if(B){
      var hi = B.items.filter(function(x){ return x.lv === "hi"; }).length, n = B.items.length + B.bag.length + B.todoDue.length;
      L.push(["✅", n ? "챙길 일 " + n + "개" + (hi ? " · 급한 일 " + hi + "개" : "") : "지금 챙길 일이 없어요", ""]);
      if(B.att) L.push(["🌱", B.att.abs || B.att.late ? "우리 반 결석 " + B.att.abs + " · 지각 " + B.att.late : "우리 반 모두 출석", "apps/tardy/"]);
    }
    try{ var ml = window.TTMeal ? TTMeal.todayText() : ""; if(ml) L.push(["🍚", ml, ""]); }catch(e){}
    return L;
  }
  if(V2){
    V.menu = function(){
      var hr = new Date().getHours(), hi = hr < 5 ? "늦은 시간이에요" : hr < 11 ? "좋은 아침이에요" : hr < 17 ? "무엇을 도와드릴까요?" : "오늘도 수고하셨어요", md = sbMode();
      var L = briefLines();
      return head("쌤비 <small style='font-weight:500;color:var(--sub,#5b6775)'>· " + hi + "</small>")
        + '<ul class="v2b">' + L.map(function(x){ var in1 = '<span class="i">' + x[0] + "</span><span>" + esc(x[1]) + "</span>"; return "<li>" + (x[2] ? '<a href="' + esc(x[2]) + '">' + in1 + "</a>" : in1) + "</li>"; }).join("") + "</ul>"
        + (window.TT_TODAY ? '<div class="v2r"><button type="button" class="lk" data-a="speak">🔊 읽어 주기</button><button type="button" class="lk" data-a="brief">자세히 보기 ›</button></div>' : "")
        + '<button type="button" class="bt p v2talk" data-a="talk" autofocus><i>🎤</i><span>' + (md === "long" ? "눌러서 길게 기록" : "눌러서 말하기") + "<small>" + (md === "long" ? "상담 · 회의" : "예: 12번 지각") + "</small></span></button>"
        + '<div class="v2m" role="group" aria-label="말하기 방식"><button type="button" data-a="m-short"' + (md === "short" ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + ">한마디</button>"
        + '<button type="button" data-a="m-long"' + (md === "long" ? ' class="on" aria-pressed="true"' : ' aria-pressed="false"') + ">길게 기록</button></div>"
        + "";
    };
    var listen0 = V.listen;                                             // 심플: 예시는 한 줄로, 안내 문구는 짧게
    V.listen = function(a){ return listen0(a).replace(/<div class="ex"[^>]*>[\s\S]*?<\/div>/, '<div class="ex" style="margin-top:6px">예: 12번 지각 · 종례: 내일 체육복</div>').replace(/<p class="nt">[\s\S]*?<\/p>/, '<p class="nt">🔒 이름 대신 번호로 말해 주세요.</p>'); };
  }

  /* ── 음성 인식 ── */
  var vo = null, listening = false;
  function stopListen(){ if(vo) vo.abort(); vo = null; listening = false; lis(false); }
  function startListen(){
    if(!SR){ var t = box.querySelector("#sbTxt"); if(t) t.focus(); return; }
    stopListen();
    vo = VO.create({ continuous: false, wakeLock: false,          // 한 마디만 듣기 · 임시 저장 안 함
      onText: function(full, interim){ var say = box.querySelector("#sbSay"); if(say){ say.classList.remove("ph"); say.textContent = full + (interim ? " " + interim : ""); } },
      onError: function(code, m){ var say = box.querySelector("#sbSay"); if(!say) return; say.classList.remove("ph"); say.innerHTML = '<span class="er">' + esc(m) + "</span>"; },
      onEnd: function(full){ listening = false; lis(false); vo = null; if(full.trim()) handle(full.trim()); }
    });
    if(vo.start()){ listening = true; lis(true); }
  }

  /* ── 말 알아듣기 ── */
  function norm(s){ return String(s).replace(/[.。!?]+$/g, "").replace(/\s+/g, " ").trim(); }
  var NUMK = {"일":1,"이":2,"삼":3,"사":4,"오":5,"육":6,"칠":7,"팔":8,"구":9,"십":10};
  function korNum(s){                                                // "십이" → 12 (음성 인식이 숫자를 한글로 줄 때)
    if(/^\d+$/.test(s)) return +s;
    var m = s.match(/^([이삼사오육칠팔구])?십([일이삼사오육칠팔구])?$/); if(m) return (m[1] ? NUMK[m[1]] : 1) * 10 + (m[2] ? NUMK[m[2]] : 0);
    return NUMK[s] || 0;
  }
  function attCmd(t){
    var km = t.match(/(지각|결석|조퇴|결과)/); if(!km) return null;
    var home = TT.roster.home(); if(!home) return {err: "우리 반(★)이 정해지지 않았어요. 명렬표에서 우리 반을 지정해 주세요."};
    var S = home.students || [], who = null, m = t.match(/(\d{1,2}|[일이삼사오육칠팔구]?십[일이삼사오육칠팔구]?|[일이삼사오육칠팔구])\s*번/);
    if(m){ var no = korNum(m[1]); who = S.filter(function(s){ return +s.no === no; })[0]; if(!who) return {err: no + "번 학생이 " + esc(home.name) + "에 없어요."}; }
    else{ who = S.filter(function(s){ return s.name && t.indexOf(s.name) >= 0; })[0]; }
    if(!who) return null;
    var k = km[1] === "결석" ? "A" : "L";
    return {who: who, home: home, k: k, kn: km[1] === "결석" ? "결석" : "지각"};
  }
  /* 보완 2단계: "3번 휴대폰 지도" / "홍길동 복장 지도" → 빠른 지도 기록 */
  var GK0 = ["생활", "학습", "복장", "휴대폰", "교우관계", "진로", "칭찬👍", "기타"];
  function gdCmd(t){
    if(!/지도|칭찬/.test(t)) return null;
    var home = TT.roster.home(); if(!home) return null;
    var G = TT.store.get(KEYG, null) || {}, K = (G.settings && Array.isArray(G.settings.gkinds) && G.settings.gkinds.length) ? G.settings.gkinds : GK0;
    var kind = K.filter(function(k){ var w = k.replace(/👍/g, ""); return w && t.indexOf(w) >= 0; })[0] || (/폰|핸드폰/.test(t) ? K.filter(function(k){ return k.indexOf("휴대폰") >= 0; })[0] : null);
    if(!kind) return null;
    var S = home.students || [], who = null, m = t.match(/(\d{1,2}|[일이삼사오육칠팔구]?십[일이삼사오육칠팔구]?|[일이삼사오육칠팔구])\s*번/);
    if(m){ var no = korNum(m[1]); who = S.filter(function(s){ return +s.no === no; })[0]; if(!who) return {err: no + "번 학생이 " + esc(home.name) + "에 없어요."}; }
    else who = S.filter(function(s){ return s.name && t.indexOf(s.name) >= 0; })[0];
    return who ? {who: who, home: home, kind: kind} : null;
  }
  function saveGd(c){
    var G = TT.store.get(KEYG, null); if(!G || typeof G !== "object") return null;
    G.gd = Array.isArray(G.gd) ? G.gd : []; var d = new Date();
    G.gd.push({id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), sid: String(c.who.no), date: ymd(d), time: ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2), kind: c.kind, how: "개별", memo: "", grp: "", created: Date.now(), src: "ssambi"});
    return TT.store.set(KEYG, G);
  }
  /* 보완 7단계: "3반 5번 칠판 풀이" / "2학년 1반 12번 질문함" → 수업 기록장 학생 기록 */
  var JTAGS = ["적극 참여", "성실함", "집중", "모둠 협력", "질문함", "심화 질문", "다양한 풀이", "오개념 수정", "발표함", "칠판 풀이", "친구 설명", "과제 성실", "수행 우수", "과제 미제출", "집중 부족", "준비물 미지참", "지원 필요"];
  function recCmd(t){
    var J = TT.store.get("tt_journal_v1", null); if(!J || J.v !== 2 || !J.students) return null;
    var w = t.replace(/\s/g, ""), tag = JTAGS.filter(function(x){ return w.indexOf(x.replace(/\s/g, "")) >= 0; }).sort(function(a, b){ return b.length - a.length; })[0];
    if(!tag && /발표/.test(w)) tag = "발표함"; if(!tag && /질문/.test(w)) tag = "질문함";
    if(!tag) return null;
    var cm = t.match(/(?:(\d)\s*학년\s*)?(\d{1,2}|[일이삼사오육칠팔구]?십[일이삼사오육칠팔구]?|[일이삼사오육칠팔구])\s*반/), nm = t.match(/(\d{1,2}|[일이삼사오육칠팔구]?십[일이삼사오육칠팔구]?|[일이삼사오육칠팔구])\s*번/);
    if(!cm || !nm) return null;
    var R = {}; try{ TT.roster.classes().forEach(function(x){ if(x.grade != null && x.cls != null && x.students.length) R[x.grade * 100 + x.cls] = x.students; }); }catch(e){}
    Object.keys(J.students).forEach(function(k){ if(J.students[k] && J.students[k].length) R[k] = J.students[k]; });
    var cls = korNum(cm[2]), no = korNum(nm[1]), codes = Object.keys(R).map(Number).filter(function(c){ return c % 100 === cls && (!cm[1] || Math.floor(c / 100) === +cm[1]); });
    if(!codes.length) return {err: cls + "반이 수업 기록장에 없어요."};
    if(codes.length > 1) return {err: "몇 학년 " + cls + "반인지 말해 주세요 (예: 3학년 " + cls + "반)."};
    var c = codes[0], st = (R[c] || []).filter(function(x){ return +x.no === no; })[0];
    if(!st) return {err: Math.floor(c / 100) + "-" + cls + " " + no + "번 학생이 없어요."};
    return {c: c, no: no, name: st.name, tag: tag};
  }
  function saveRec(r){
    var J = TT.store.get("tt_journal_v1", null); if(!J) return false;
    J.records = J.records || []; J.nextId = J.nextId || 1; var d = new Date(), per = 0;
    try{ var L = TT.timetable.day(d).filter(function(s){ return +s.cls === r.c; }), m = d.getHours() * 60 + d.getMinutes(), past = L.filter(function(s){ return s.start <= m + 10; }); per = (past.length ? past[past.length - 1] : L[0] || {}).n || 0; }catch(e){}
    var les = ""; try{ les = TT.notes && TT.notes.lessonNow ? TT.notes.lessonNow(r.c) : ""; }catch(e){}
    J.records.push({id: J.nextId++, date: ymd(d), period: per, cls: r.c, no: r.no, tags: [r.tag], text: "", star: false, ts: Date.now(), les: les || "", src: "ssambi"});
    return TT.store.set("tt_journal_v1", J);
  }
  function saveAtt(c){
    var G = TT.store.get(KEYG, null); if(!G || typeof G !== "object") return null;   // 출결을 한 번도 열지 않았으면(예전 자료 옮기기 전) 쓰지 않음
    G.att = G.att || {}; var td = ymd(new Date()), no = String(c.who.no);
    var r = c.k === "A" ? {t: "A", k: "sick"} : {t: "L"};
    (G.att[td] = G.att[td] || {})[no] = r;
    if(!TT.store.set(KEYG, G)) return false;
    try{ if(window.TT_TODAY) TT_TODAY.render(); }catch(e){}
    return true;
  }
  var TOOLWORD = [
    [/회의\s*록|회의\s*기록/, "apps/voice/?k=mtg"], [/학부모\s*상담/, "apps/voice/?k=par"], [/상담\s*기록|말로\s*기록|기록\s*하기|녹음/, "apps/voice/"], [/관찰\s*기록|수업\s*관찰/, "apps/voice/?k=obs"],
    [/결석\s*신고서|결석계/, "apps/tardy/?tab=report"], [/빠른\s*지도|지도\s*기록/, "apps/tardy/?tab=guide"], [/상담\s*일지/, "apps/tardy/?tab=counsel"], [/출결/, "apps/tardy/"]
  ];
  function toolCmd(t){
    for(var i = 0; i < TOOLWORD.length; i++) if(TOOLWORD[i][0].test(t)) return TOOLWORD[i][1];
    var w = t.replace(/\s*(열어\s*줘|열어|켜\s*줘|켜|보여\s*줘|보여|띄워\s*줘|띄워|가자|가\s*줘)\s*$/, "").replace(/\s/g, "");
    if(w.length < 2 || typeof TT_TOOLS === "undefined") return null;
    var hit = TT_TOOLS.filter(function(x){ return x.ready && x.href && (typeof ttToolShown !== "function" || ttToolShown(x)) &&
      [x.name, x.short, x.old].some(function(n){ return n && n.replace(/\s/g, "") === w; }); })[0];
    return hit ? hit.href : null;
  }
  function find(q){ close(); if(window.TT_FIND) TT_FIND.open(q || ""); else if(window.TT_SBAR && /\/apps\//.test(location.pathname) && document.getElementById("sbRq") && TT_SBAR.focusSearch(q || "")) return; else go("?sb=find" + (q ? "&q=" + encodeURIComponent(q) : "")); }   // v2.7: 도구 화면은 왼쪽 검색창에서 (보고 있는 화면 안에서 찾음)
  /* v2.7: "기재요령에서 봉사활동 찾아 줘" → 그 문서를 열고 바로 찾기 · "업무판에서 시험 찾아" · "내선번호에서 김 찾아" */
  function findIn(where, q){
    close(); var w = where.replace(/\s+/g, "");
    if(/업무판|주간업무|월간업무/.test(w)) go("apps/school/?tab=board&q=" + encodeURIComponent(q));
    else if(/내선|전화번호/.test(w)) go("apps/school/?tab=ext&q=" + encodeURIComponent(q));
    else go("apps/lib/?find=" + encodeURIComponent(where.replace(/^(학교\s*)?(자료실|문서)\s*/, "").trim()) + "&q=" + encodeURIComponent(q));
  }
  function handle(raw){
    var t = norm(raw); if(!t) return;
    var say = box.querySelector("#sbSay"); if(say){ say.classList.remove("ph"); say.textContent = t; }
    if(/^(오늘\s*)?브리핑|^오늘\s*(일정|할\s*일\s*알려|뭐\s*있)/.test(t)){ show("brief"); return; }
    var dm = t.match(/^(.+?)\s*에서\s+(.+?)\s*(?:을|를)?\s*(찾아\s*줘|찾아\s*봐|찾아|검색해\s*줘|검색)$/);
    if(dm && dm[1].trim().length >= 2){ findIn(dm[1].trim(), dm[2].trim()); return; }
    var fm = t.match(/^(.+?)\s*(찾아\s*줘|찾아|검색해\s*줘|검색)$/) || t.match(/^(?:찾아\s*줘|찾아|검색)\s+(.+)$/);
    if(fm){ find(fm[1]); return; }
    var rc = recCmd(t);
    if(rc && rc.err){ if(say) say.innerHTML = '<span class="er">' + rc.err + "</span>"; return; }
    if(rc){
      pend = function(){ close(); TT.ui.toast(saveRec(rc) ? "🦉 " + Math.floor(rc.c / 100) + "-" + (rc.c % 100) + " " + rc.no + "번 · " + rc.tag + " 기록했어요" : "저장하지 못했어요."); };
      show("confirm", {html: "<b>" + Math.floor(rc.c / 100) + "-" + (rc.c % 100) + " " + rc.no + "번 " + esc(rc.name) + "</b><br><span class=\"ok\">" + esc(rc.tag) + "</span> 수업 기록으로 남길까요?", yes: "기록", note: "메모·★는 수업 기록장 › 학생에서 붙일 수 있어요."});
      return;
    }
    var gd = gdCmd(t);
    if(gd && gd.err){ if(say) say.innerHTML = '<span class="er">' + gd.err + "</span>"; return; }
    if(gd){
      pend = function(){ var ok = saveGd(gd); if(ok === null){ close(); TT.ui.toast("🦉 출결을 처음 한 번 열어 준비해 주세요. 지금 열게요."); setTimeout(function(){ go("apps/tardy/?tab=guide"); }, 900); return; } close(); TT.ui.toast(ok ? "🦉 " + gd.who.no + "번 " + gd.kind + " 지도로 기록했어요" : "저장하지 못했어요."); };
      show("confirm", {html: "<b>" + esc(gd.home.name) + " " + esc(gd.who.no) + "번 " + esc(gd.who.name) + "</b><br>오늘 <span class=\"ok\">" + esc(gd.kind) + " 지도</span>로 기록할까요?", yes: "지도 기록", note: "메모는 상담 › ⚡ 지도에서 길게 눌러 붙일 수 있어요."});
      return;
    }
    var a = attCmd(t);
    if(a && a.err){ if(say) say.innerHTML = '<span class="er">' + a.err + "</span>"; return; }
    if(a){
      pend = function(){ var ok = saveAtt(a); if(ok === null){ close(); TT.ui.toast("🦉 " + tname("tardy", "출결") + "을 처음 한 번 열어 준비해 주세요. 지금 열게요."); setTimeout(function(){ go("apps/tardy/"); }, 900); return; } if(ok){ close(); TT.ui.toast("🦉 " + a.who.no + "번 오늘 " + a.kn + "으로 기록했어요 · 사유·인정 구분은 출결에서"); } else TT.ui.toast("저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요."); };
      show("confirm", {html: "<b>" + esc(a.home.name) + " " + esc(a.who.no) + "번 " + esc(a.who.name) + "</b><br>오늘 <span class=\"ok\">" + a.kn + "</span>으로 기록할까요?",
        yes: a.kn + " 기록", note: a.k === "A" ? "결석은 우선 '질병'으로 저장돼요. 인정결·미인정은 " + esc(tname("tardy", "출결")) + "에서 바꿔 주세요." : "무단지각으로 저장돼요. 인정지각이면 " + esc(tname("tardy", "출결")) + "에서 바꿔 주세요."});
      return;
    }
    var jm = t.match(/(\d{1,2}|[일이삼사오육칠팔구]?십[일이삼사오육칠팔구]?|[일이삼사오육칠팔구])\s*번\s*(진학|고입|고교\s*추천)/);   // 보완 13단계: "12번 진학 자료 보여줘"
    if(jm){ close(); go("apps/advisor/?no=" + korNum(jm[1])); return; }
    var href = toolCmd(t); if(href){ close(); go(href); return; }
    var q = t.replace(/^종례\s*(바구니에?)?\s*/, function(s){ return s ? "종례: " : s; }).replace(/^할\s*일\s*[:：]?\s*/, "할 일: ");
    find(q);
  }
  var pend = null;

  /* ── 비켜 서기 (v1.10.3): 부엉이가 글자·단추·입력 칸을 가리면 빈 곳으로 옮깁니다 ── */
  var SBK = "sbPos";
  function mine(el){ return el === btn || btn.contains(el) || box.contains(el) || tip.contains(el) || el === box || el === tip; }
  function covers(x, y, ww, hh){                                        // 그 자리에 가려지는 내용이 있는가 (5×5 점 검사)
    var M = 4;
    for(var i = 0; i < 5; i++) for(var j = 0; j < 5; j++){
      var px = x + M + (ww - 2 * M) * i / 4, py = y + M + (hh - 2 * M) * j / 4;
      var L = document.elementsFromPoint(px, py) || [], el = null;
      for(var k = 0; k < L.length; k++) if(!mine(L[k])){ el = L[k]; break; }
      if(!el || el === document.body || el === document.documentElement) continue;
      if(el.closest && el.closest("button,a,input,select,textarea,label,img,canvas,video,iframe,svg,summary,[role=button],[contenteditable=true],.tt-rail,#mnav,.mnav,header")) return true;
      var c = el.childNodes;
      for(var t = 0; t < c.length; t++){
        if(c[t].nodeType !== 3 || !/\S/.test(c[t].nodeValue)) continue;
        var r = document.createRange(); r.selectNodeContents(c[t]); var R = r.getClientRects();
        for(var q = 0; q < R.length; q++){ var Q = R[q]; if(px >= Q.left - 6 && px <= Q.right + 6 && py >= Q.top - 6 && py <= Q.bottom + 6) return true; }
      }
    }
    return false;
  }
  function spots(){                                                     // 후보 자리: 오른쪽 아래(기본) → 오른쪽 위로 → 아래 줄 왼쪽으로 → 왼쪽 → 화면 전체
    var w = window.innerWidth, h = window.innerHeight, s = btn.offsetWidth || 78, g = 18, out = [];
    var lm = 12; ["#mnav", ".tt-rail"].forEach(function(q){ var e = document.querySelector(q); if(e && e.offsetParent !== null){ var r = e.getBoundingClientRect(); if(r.width < w / 3) lm = Math.max(lm, r.right + 12); } });
    var x1 = w - s - 22, y1 = h - s - (w <= 760 ? 84 : 22), stepY = s * 0.75, stepX = s + 12, x, y;
    for(y = y1; y >= 70; y -= stepY) out.push([x1, y]);
    for(x = x1 - stepX; x >= lm; x -= stepX) out.push([x, y1]);
    for(y = y1 - stepY; y >= 70; y -= stepY) out.push([lm, y]);
    for(y = y1 - stepY; y >= 70; y -= stepY) for(x = x1 - stepX; x > lm; x -= stepX) out.push([x, y]);
    return out.map(function(p){ return [Math.round(p[0]), Math.round(p[1])]; });
  }
  var cur = null, moving = false;
  function setPos(p){ cur = p; btn.style.left = p[0] + "px"; btn.style.top = p[1] + "px"; btn.style.right = btn.style.bottom = "auto"; }
  function avoid(){
    if(moving || !box.hidden || !seen(btn) || (btn.matches && btn.matches(":hover")) || document.querySelector("dialog[open]")) return;
    var s = btn.offsetWidth || 78, L = spots(); if(!L.length) return;
    if(cur && (cur[0] > window.innerWidth - s || cur[1] > window.innerHeight - s)) cur = null;   // 창 크기가 바뀌어 밖으로 나갔으면 다시
    var first = cur || L[0];
    if(!covers(first[0], first[1], s, s)){ if(!cur) setPos(first); return; }
    for(var i = 0; i < L.length; i++) if(!covers(L[i][0], L[i][1], s, s)){
      moving = true; btn.style.transition = "left .35s ease,top .35s ease"; setPos(L[i]);
      setTimeout(function(){ moving = false; btn.style.transition = ""; }, 400); return;
    }
    if(!cur) setPos(L[0]);                                               // 빈 곳이 없으면 기본 자리
  }
  var avT = null; function avoidSoon(){ clearTimeout(avT); avT = setTimeout(avoid, 250); }
  window.addEventListener("resize", function(){ cur = null; avoidSoon(); });
  window.addEventListener("scroll", avoidSoon, true);
  document.addEventListener("click", function(){ setTimeout(avoidSoon, 300); }, true);
  setTimeout(avoid, 900); setInterval(avoid, 2500);

  /* ── 누르기 ── */
  btn.addEventListener("click", function(){ toggle(btn); });
  if(hb) hb.addEventListener("click", function(){ toggle(hb); });
  if(hd) hd.addEventListener("click", function(){ toggle(hd); });
  /* Alt+B(쌤비의 B): 키 자리(KeyB)로 알아들어 한/영 상태와 상관없이 열고 닫기. 오른쪽 Alt가 한/영 키인 노트북은 왼쪽 Alt로 */
  document.addEventListener("keydown", function(e){
    if(e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && e.code === "KeyB"){ e.preventDefault(); toggle(seen(hb) ? hb : null); }
  });
  window.addEventListener("resize", function(){ if(!box.hidden || !tip.hidden) place(); });
  tip.addEventListener("click", function(){ open("brief"); });
  box.addEventListener("click", function(e){
    var b = e.target.closest("[data-a],[data-r]"); if(!b) return;
    if(b.dataset.r != null){ var x = runList()[+b.dataset.r]; if(!x) return; if(typeof x[3] === "function") x[3](); else { close(); if(TT.noteTool && x[4]) TT.noteTool(x[4]); go(x[3]); } return; }
    var a = b.dataset.a;
    if(a === "talk"){ if(sbMode() === "long"){ close(); go("apps/voice/"); } else { show("listen"); startListen(); } return; }
    if(a === "m-short" || a === "m-long"){ try{ sessionStorage.setItem("sbMode", a === "m-long" ? "long" : "short"); }catch(err){} show("menu"); return; }
    if(a === "close") close();
    else if(a === "menu"){ stopListen(); show("menu"); }
    else if(a === "listen" || a === "relisten"){ show("listen"); startListen(); }
    else if(a === "typed"){ var v = box.querySelector("#sbTxt"); if(v && v.value.trim()) { stopListen(); handle(v.value); } }
    else if(a === "voice"){ close(); go("apps/voice/"); }
    else if(a === "find") find("");
    else if(a === "brief") show("brief");
    else if(a === "run") show("run");
    else if(a === "yes"){ if(pend) pend(); pend = null; }
    else if(a === "speak") speak();
  });
  box.addEventListener("keydown", function(e){
    if(e.key === "Enter" && !e.isComposing && e.target.id === "sbTxt"){ e.preventDefault(); if(e.target.value.trim()){ stopListen(); handle(e.target.value); } }
  });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !box.hidden) close(); });
  document.addEventListener("click", function(e){ var P = e.composedPath ? e.composedPath() : []; if(!box.hidden && P.indexOf(box) < 0 && P.indexOf(btn) < 0 && (!hb || P.indexOf(hb) < 0) && (!hd || P.indexOf(hd) < 0) && P.indexOf(tip) < 0 && !(e.target.closest && e.target.closest("dialog"))) close(); });

  /* ── 읽어 주기 (숫자만) ── */
  function speak(){
    if(!window.speechSynthesis){ TT.ui.toast("이 브라우저는 읽어 주기를 지원하지 않아요."); return; }
    var B = TT_TODAY.brief(), d = new Date(), m = d.getHours() * 60 + d.getMinutes(), s = [];
    s.push((d.getMonth() + 1) + "월 " + d.getDate() + "일입니다.");
    if(B.weekday && B.lessons.length){
      var nx = B.lessons.filter(function(x){ return x.end > m; })[0];
      s.push("오늘 수업은 " + B.lessons.length + "시간" + (nx ? ", 다음은 " + nx.n + "교시 " + nx.c.replace("-", "학년 ") + "반입니다." : ", 모두 끝났습니다."));
    }
    s.push(B.items.length ? "챙길 일이 " + B.items.length + "가지 있습니다. " + B.items.slice(0, 3).map(function(x){ return x.t + " " + x.n; }).join(", ") + "." : "급한 일은 없습니다.");
    if(B.att) s.push(B.att.abs || B.att.late ? "우리 반 오늘 결석 " + B.att.abs + "명, 지각 " + B.att.late + "명입니다." : "우리 반은 모두 출석입니다.");
    if(window.TTMeal && TTMeal.todayText()) s.push(TTMeal.todayText().replace(":", "은") + "입니다.");
    if(B.bag.length) s.push("종례에 전할 말이 " + B.bag.length + "건 있습니다.");
    if(B.todoDue.length) s.push("오늘까지 할 일이 " + B.todoDue.length + "건 있습니다.");
    try{ speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(s.join(" ").replace(/D-(\d+)/g, "디데이 $1일")); u.lang = "ko-KR"; u.rate = 1.05; speechSynthesis.speak(u); }catch(e){}
  }

  /* ── 말풍선: 하루 한 번, 급한 챙길 일이 있으면 살짝 알려 줌 ── */
  setTimeout(function(){
    try{
      if(!window.TT_TODAY || !TT_TODAY.brief) return;
      var U = TT.store.get(KEYU, {}) || {}, td = ymd(new Date()); if(U.tip === td) return;
      var B = TT_TODAY.brief(), hi = B.items.filter(function(x){ return x.lv === "hi"; }).length;
      var msg = hi ? "챙길 일이 " + B.items.length + "가지 있어요. 눌러서 확인!" : B.weekday && B.lessons.length ? "오늘 수업 " + B.lessons.length + "시간! 브리핑 볼까요?" : "";
      if(!msg) return;
      tip.textContent = "🦉 " + msg; place(); tip.hidden = false; U.tip = td; TT.store.set(KEYU, U);
      setTimeout(function(){ tip.hidden = true; }, 7000);
    }catch(e){}
  }, 1500);

  (function(){                                                          // 도구 화면에서 넘어온 요청 (?sb=brief / ?sb=find&q=…)
    var m = /[?&]sb=(\w+)/.exec(location.search); if(!m || !HOME) return;
    var q = /[?&]q=([^&]*)/.exec(location.search); q = q ? decodeURIComponent(q[1]) : "";
    history.replaceState(null, "", location.pathname + location.hash);
    setTimeout(function(){ if(m[1] === "find"){ if(window.TT_FIND) TT_FIND.open(q); } else { from = seen(hb) ? hb : null; open(m[1] === "brief" ? "brief" : "menu"); } }, 400);
  })();
  if(location.hash === "#ssambi"){ history.replaceState(null, "", location.pathname + location.search); setTimeout(function(){ open("menu"); }, 300); }   // 말로 기록 화면의 🦉 쌤비에게
  window.TT_SSAMBI = {open: open, close: close, handle: handle};
})();
