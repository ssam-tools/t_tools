/* 쌤 노트 소개 영상 · 장면 그리기 (PLAN_배포 5단계, v2.66.0)
   TT_FILM.set(t) → t초 순간의 화면을 그대로 그림(시간만으로 정해지는 그림 — 몇 번을 찍어도 같은 모습).
   박자: 1마디 = 2초(120 BPM). music.py 와 같은 시간표를 씁니다.
     선생님 45초: 0~3 질문 · 3~35 기능 16개(2초씩) · 35~37 모아 보기 · 37 퇴근 도장 · 38~45 마무리 + QR
     학생 25초:   0~3 질문 · 3~21 장면 9개(2초씩) · 21 레벨 업 · 22~25 마무리 + QR
   화면 그림은 ../shots/ — 견본 모드(가짜 학교 '쌤비중학교')로 찍은 것이라 개인정보가 없습니다.
   그림이 바뀌면 같은 이름으로 바꿔 넣고 make.py 를 다시 돌리면 영상이 새로 만들어집니다. */
(function(){
  "use strict";
  var P = new URLSearchParams(location.search), V = P.get("v") === "student" ? "student" : "teacher";
  var SITE = "https://ssam-tools.github.io/t_tools/";
  var LEN = V === "student" ? 25 : 45;
  var st = document.getElementById("stage");
  st.className = V === "student" ? "S" : "T";

  /* ── 도우미 ── */
  function cl(x, a, b){ return Math.max(a, Math.min(b, x)); }
  function k(t, a, b){ return cl((t - a) / (b - a), 0, 1); }            // a~b 사이 진행률 0~1
  function eo(x){ return 1 - Math.pow(1 - x, 3); }                       // 빠르게 → 느리게
  function ei(x){ return x * x * x; }
  function eio(x){ return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function back(x){ var c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function lerp(a, b, x){ return a + (b - a) * x; }
  function mk(cls, html, parent, tag){ var e = document.createElement(tag || "div"); if(cls) e.className = cls; if(html != null) e.innerHTML = html; (parent || st).appendChild(e); return e; }
  function css(e, o){ for(var n in o) e.style[n] = o[n]; }
  function show(e, on){ e.style.display = on ? "" : "none"; }
  function owlSvg(o, size){ o = Object.assign({size: size}, o || {}); return window.TT_SBART ? TT_SBART.svg(o) : ""; }
  function qr(path, size){ return window.TTQR ? TTQR.svg(SITE + path, {size: size}) : ""; }
  var CUR = '<svg viewBox="0 0 24 24" width="64" height="64"><path d="M5 2 L5 20 L9.5 15.6 L12.6 22 L15.4 20.7 L12.3 14.4 L18.5 14.4 Z" fill="#fff" stroke="#04342C" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  /* ── 기기 틀 + 화면 그림 (확대·이동·누르기) ── */
  function device(kind, shot, box){
    var root = mk(kind === "pc" ? "mon" : "phone"), scr = mk("scr", null, root);
    css(root, {left: box.x + "px", top: box.y + "px", width: box.w + "px", height: box.h + "px"});
    var img = mk("", null, scr, "img"); img.src = "../shots/" + shot + ".webp";
    var IW = kind === "pc" ? 1440 : 585, IH = kind === "pc" ? 900 : 1266;
    var tap = mk("tap", null, scr), cur = mk("cur", CUR, scr);
    var sw = box.w - (kind === "pc" ? 36 : 32), sh = box.h - (kind === "pc" ? 64 : 32);
    return {root: root, kind: kind, draw: function(lt, f){        // lt: 장면 안 시간, f: {z, fx, fy, px, py}
      var z = lerp(1, f.z || 1, eio(k(lt, .15, 1.0))) * (1 + .03 * k(lt, 1.0, 2.2));
      var sc = sw / IW * z, iw = IW * sc, ih = IH * sc;
      var tx = cl(sw / 2 - (f.fx != null ? f.fx : .5) * iw, sw - iw, 0), ty = cl(sh / 2 - (f.fy != null ? f.fy : .5) * ih, sh - ih, 0);
      img.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + sc.toFixed(4) + ")";
      if(f.px == null){ tap.style.opacity = 0; cur.style.opacity = 0; return; }
      var X = tx + f.px * iw, Y = ty + f.py * ih, m = eio(k(lt, .45, .95));
      css(cur, {opacity: k(lt, .4, .55) * (1 - k(lt, 1.6, 1.8)), left: lerp(sw * .85, X - 8, m) + "px", top: lerp(sh * 1.05, Y - 6, m) + "px", transform: "scale(" + (lt > .95 && lt < 1.1 ? .85 : 1) + ")"});
      var r = k(lt, .95, 1.5);
      css(tap, {left: X + "px", top: Y + "px", opacity: r > 0 && r < 1 ? 1 - r : 0, transform: "scale(" + lerp(.3, 1.5, eo(r)) + ")"});
    }};
  }

  /* 기기가 들어오고 나가는 움직임 (오른쪽에서 휙 → 왼쪽으로 휙) */
  function slide(e, lt, dur, tilt){
    var a = eo(k(lt, -.22, .28)), b = ei(k(lt, dur - .16, dur + .02));
    var x = (1 - a) * 1100 - b * 1100, r = (tilt || 0) * (1 - a + b);
    e.style.transform = "translateX(" + x.toFixed(1) + "px) rotate(" + r.toFixed(2) + "deg)";
    show(e, lt > -.22 && lt < dur + .02);
  }

  /* 터지는 종이 꽃가루 (같은 씨앗 → 늘 같은 모양) */
  function confetti(n, seed, cols){
    var s = seed, R = function(){ s = (s * 16807) % 2147483647; return s / 2147483647; }, out = [];
    for(var i = 0; i < n; i++) out.push({e: mk("conf"), x: 540 + (R() - .5) * 200, y: 1000, vx: (R() - .5) * 1900, vy: -900 - R() * 1300, rot: R() * 720 - 360, c: cols[i % cols.length]});
    out.forEach(function(p){ p.e.style.background = p.c; show(p.e, false); });
    return function(dt){
      out.forEach(function(p){
        if(dt < 0 || dt > 3.2){ show(p.e, false); return; }
        show(p.e, true);
        var x = p.x + p.vx * dt * .9, y = p.y + p.vy * dt + 1500 * dt * dt;
        css(p.e, {left: x + "px", top: y + "px", transform: "rotate(" + (p.rot * dt * 2) + "deg)", opacity: 1 - k(dt, 2.4, 3.2)});
      });
    };
  }

  var draw;

  /* ═════════ 선생님 45초 — "선생님의 하루, 쌤 노트 하나로" ═════════ */
  if(V === "teacher"){
    var F = [   // [시각, 그림, 기기, 제목, 한 줄, 쌤비 소품, {확대 z, 초점 fx·fy, 누를 곳 px·py}]
      ["08:30", "home", "pc", "출근하면 쌤비가<br>먼저 브리핑", "지금 수업·할 일·놓친 것을 한 화면에", "coffee", {z: 1.9, fx: .38, fy: .2, px: .33, py: .26}],
      ["08:40", "timetable", "pc", "내 시간표는<br>붙여넣기 한 번", "컴시간 표를 복사해 Ctrl+V", "calendar", {z: 1.6, fx: .33, fy: .35, px: .39, py: .42}],
      ["08:50", "book", "pc", "교과서도<br>쌤 노트에서 바로", "반·쪽만 고르면 수업 화면으로", "book", {z: 1.7, fx: .75, fy: .7, px: .92, py: .9}],
      ["09:40", "journal", "pc", "수업 기록은<br>버튼 하나", "진도·학생 활동이 저절로 쌓여요", "redpen", {z: 1.9, fx: .25, fy: .6, px: .24, py: .59}],
      ["10:00", "m-home", "phone", "휴대폰이<br>수업 리모컨으로", "교실 어디서든 넘기고 띄우기", "clock", {z: 1.25, fx: .6, fy: .62, px: .81, py: .61}],
      ["10:52", "tardy", "pc", "지각은<br>이름만 톡", "날짜·사유만 — 나이스와 겹치지 않게", "alarm", {z: 1.8, fx: .4, fy: .4, px: .4, py: .43}],
      ["11:00", "report", "pc", "결석신고서가<br>저절로", "학교 양식 그대로 출력", "paper", {z: 2.0, fx: .72, fy: .3, px: .92, py: .28}],
      ["12:30", "m-find", "phone", "급식·일정·내선번호<br>찾기 한 번", "휴대폰으로 오늘을 바로 확인", "meal", {z: 1.3, fx: .5, fy: .35, px: .5, py: .33}],
      ["13:00", "stucard", "pc", "학생 카드로<br>한눈에", "출결·상담·기록이 한 장에", "student", {z: 1.8, fx: .3, fy: .45, px: .23, py: .43}],
      ["13:40", "voice", "pc", "말로 하면<br>기록이 된다", "상담·회의 녹음 → 요약 정리", "mic", {z: 1.7, fx: .3, fy: .3, px: .24, py: .19}],
      ["14:30", "counsel", "pc", "상담일지<br>깔끔하게 정리", "학부모 안내문도 복사 한 번", "listen", {z: 1.8, fx: .6, fy: .2, px: .86, py: .19}],
      ["15:00", "record", "pc", "생기부 초안까지<br>한 번에", "쌓인 기록으로 문장 만들기", "notebook", {z: 1.7, fx: .8, fy: .5, px: .85, py: .89}],
      ["15:30", "school", "pc", "학교 업무판이<br>내 화면에", "이번 주·이번 달 업무를 함께", "school", {z: 1.6, fx: .4, fy: .3, px: .46, py: .38}],
      ["15:50", "lib", "pc", "학교 자료실<br>찾기 한 번", "서식·규정·계획서 바로 보기", "search", {z: 1.7, fx: .65, fy: .2, px: .61, py: .08}],
      ["16:10", "m-tardy", "phone", "복도에서도<br>휴대폰으로", "PC와 똑같이 저장돼요", "mark", {z: 1.3, fx: .35, fy: .3, px: .31, py: .29}],
      ["16:20", "m-gym", "phone", "학생들은<br>공부 Gym으로", "하루 10분, 스스로 키우는 실력", "", {z: 1.15, fx: .5, fy: .35, px: .5, py: .26}]
    ];
    var NF = F.length, T0 = 3, MON = T0 + NF * 2, END = MON + 2;   // 3 · 35 · 37
    mk("grid");
    // 질문 (0~3초)
    var hook = mk("hook", '<h1>오늘 같은 일,<br><em>몇 번</em> 하셨어요?</h1>');
    var chips = mk("chips", null, hook);
    var CH = ["복사 → 붙여넣기", "엑셀 열기", "양식 찾기", "나이스 다시 입력", "또 복사", "메신저 뒤지기", "파일 이름 바꾸기", "인쇄 → 스캔", "같은 내용 또 쓰기", "어디 뒀더라…"];
    var POS = [[40, 40], [400, 10], [300, 130], [20, 250], [560, 230], [180, 360], [600, 400], [40, 480], [420, 520], [250, 610]];
    var chipEls = CH.map(function(c, i){ var e = mk("chip", c, chips); css(e, {left: POS[i][0] + "px", top: POS[i][1] + "px"}); return e; });
    var times = mk("times", "", chips);
    var hookOwl = mk("hookOwl", owlSvg({item: "coffee"}, 300), hook), hookSay = mk("hookSay", "이제 <span style='color:var(--g)'>클릭 한 번</span>이면 돼요", hook);
    // 위: 시계 · 하루 줄 · 세기
    var hud = mk("hud");
    var clock = mk("clock", '<span class="ic">🕗</span><span><small>선생님의 하루</small><b>08:30</b></span>', hud);
    var cnt = mk("cnt", '<span class="pill">👆 클릭 1번 · <em>1</em>/16</span><span class="demo">견본 화면 · 가짜 학교 자료</span>', hud);
    var track = mk("track", '<i></i><span class="tl" style="left:0">08:30 출근</span><span class="tl" style="right:0">16:30 퇴근</span>', hud);
    var trackOwl = mk("owl", owlSvg({}, 70), track);
    // 기기들
    var PC = {x: 40, y: 560, w: 1000, h: 666}, PH = {x: 304, y: 392, w: 472, h: 984};
    var devs = F.map(function(f){ return device(f[2], f[1], f[2] === "pc" ? PC : PH); });
    // 모아 보기
    var mont = mk("mont", F.map(function(f){ return '<div><img src="../shots/' + f[1] + '.webp" alt=""></div>'; }).join(""));
    var tiles = Array.prototype.slice.call(mont.children);
    // 아래: 쌤비 말풍선
    var cap = mk("cap"), capOwl = mk("owl", "", cap), bub = mk("bub", "", cap);
    var curItem = null, curCap = -1;
    // 마무리
    var end = mk("end"), endBg = end;
    var stamp = mk("stamp", "<b>퇴근</b><small>16:30</small>", end);
    var endH = mk("", "선생님의 하루,<br><em>쌤 노트</em> 하나로", end, "h1");
    var endOwl = mk("owlE", owlSvg({item: "stamp", open: false}, 250), end);
    var endQr = mk("qr", '<div class="q">' + qr("index.html?demo=1", 260) + '</div><div><b>견본으로<br>먼저 써 보기</b><span>가짜 학교 자료로 모든 화면을 눌러 봐요</span><code>ssam-tools.github.io/t_tools</code></div>', end);
    var endBy = mk("by", "jidangmath가 Claude와 함께 제작 · 쌤 노트", end);

    function mins(s){ var p = s.split(":"); return +p[0] * 60 + +p[1]; }
    draw = function(t){
      // 질문
      show(hook, t < 3.05);
      if(t < 3.05){
        var out = k(t, 2.8, 3.0);
        hook.style.opacity = 1 - out; hook.style.transform = "scale(" + (1 + out * .15) + ")";
        var h1 = hook.firstChild; h1.style.opacity = k(t, 0, .25); h1.style.transform = "translateY(" + (1 - eo(k(t, 0, .35))) * 40 + "px)";
        var n = 0;
        chipEls.forEach(function(e, i){ var a = k(t, .35 + i * .15, .5 + i * .15); if(a > 0) n++; e.style.opacity = a; e.style.transform = "scale(" + lerp(.4, 1, back(a)) + ") rotate(" + ((i % 3) - 1) * 3 + "deg)"; });
        times.textContent = "×" + n; times.style.opacity = n ? 1 : 0;
        var o = k(t, 2.0, 2.3); hookOwl.style.opacity = o; hookOwl.style.transform = "translateY(" + (1 - back(o)) * 120 + "px)";
        hookSay.style.opacity = k(t, 2.15, 2.35);
        chips.style.opacity = 1 - k(t, 2.0, 2.3) * .6;
      }
      // 위
      var hudOn = t >= 2.9 && t < END + .05;
      show(hud, hudOn); show(cap, t >= 2.9 && t < END + .05);
      var hi = k(t, 2.9, 3.25); hud.style.transform = "translateY(" + (1 - eo(hi)) * -300 + "px)"; cap.style.transform = "translateY(" + (1 - eo(hi)) * 400 + "px)";
      var i = cl(Math.floor((t - T0) / 2), 0, NF - 1), lt = t - T0 - i * 2;
      var inMon = t >= MON;
      // 시계·하루 줄
      var cm = mins(F[i][0]), pm = i ? mins(F[i - 1][0]) : mins("08:30"), mm = inMon ? lerp(mins("16:20"), mins("16:30"), k(t, MON, MON + 1)) : lerp(pm, cm, eo(k(lt, 0, .35)));
      mm = Math.round(mm);
      clock.querySelector("b").textContent = ("0" + Math.floor(mm / 60)).slice(-2) + ":" + ("0" + mm % 60).slice(-2);
      var fr = (mm - 510) / 480; track.firstChild.style.width = (fr * 100) + "%"; trackOwl.style.left = (fr * 100) + "%";
      trackOwl.style.transform = "translateY(" + (-Math.abs(Math.sin(t * Math.PI * 2)) * 10) + "px)";
      cnt.firstChild.innerHTML = inMon ? "👆 <em>16</em>가지 일, 클릭 1번씩" : "👆 클릭 1번 · <em>" + (i + 1) + "</em>/16";
      var pop = inMon ? k(t, MON, MON + .25) : k(lt, 0, .25); cnt.firstChild.style.transform = "scale(" + (1 + .12 * Math.sin(pop * Math.PI)) + ")";
      // 기기
      devs.forEach(function(d, j){ var l = t - T0 - j * 2; if(l > -.25 && l < 2.05 && t < MON + .05){ slide(d.root, l, 2, d.kind === "pc" ? 0 : (j % 2 ? 4 : -4)); d.draw(l, F[j][6]); } else show(d.root, false); });
      // 모아 보기
      show(mont, inMon && t < END + .05);
      if(inMon){ tiles.forEach(function(e, j){ var a = k(t, MON - .1 + j * .05, MON + .15 + j * .05); e.style.opacity = a; e.style.transform = "scale(" + lerp(.3, 1, back(a)) + ")"; }); mont.style.transform = "scale(" + (1 + .04 * k(t, MON, END)) + ")"; }
      // 말풍선
      var ci = inMon ? NF : i, item = inMon ? "stamp" : F[i][5];
      if(ci !== curCap){
        curCap = ci;
        bub.innerHTML = inMon ? "<h2>이 모든 일이<br>쌤 노트 하나로</h2><p>입력은 한 번, 서류는 저절로</p>" : "<h2>" + F[i][3] + "</h2><p>" + F[i][4] + '</p>';
      }
      if(item !== curItem){ curItem = item; capOwl.innerHTML = owlSvg({item: item || undefined, acc: item ? undefined : "trainer", open: !item}, 210); }
      var bl = inMon ? t - MON : lt, b0 = k(bl, 0, .3);
      bub.style.transform = "scale(" + lerp(.85, 1, back(b0)) + ")"; bub.style.opacity = .3 + .7 * b0; bub.style.transformOrigin = "0 80%";
      capOwl.style.transform = "translateY(" + (-Math.abs(Math.sin(t * Math.PI)) * 14) + "px) rotate(" + Math.sin(t * Math.PI) * 3 + "deg)";
      // 마무리: 도장 쾅
      show(end, t >= END - .02);
      if(t >= END - .02){
        var d = t - END, w = eo(k(d, -.02, .35));
        endBg.style.clipPath = "circle(" + (w * 1500) + "px at 540px 565px)";
        var s = k(d, -.02, .16), sh = d > .16 && d < .6 ? Math.sin(d * 90) * 14 * (1 - k(d, .16, .6)) : 0;
        stamp.style.transform = "translate(" + sh + "px," + (-sh / 2) + "px) scale(" + lerp(3, 1, ei(s)) + ") rotate(" + lerp(-30, -10, s) + "deg)";
        stamp.style.opacity = s > 0 ? 1 : 0;
        st.style.transform = d > .16 && d < .5 ? "translate(" + sh * .6 + "px," + sh * .4 + "px)" : "";
        var h = k(d, 1.0, 1.4); endH.style.opacity = h; endH.style.transform = "translateY(" + (1 - eo(h)) * 60 + "px)";
        var o2 = k(d, 1.4, 1.8); endOwl.style.opacity = o2; endOwl.style.transform = "translateY(" + ((1 - back(o2)) * 100 - Math.abs(Math.sin(t * Math.PI)) * 12) + "px) rotate(8deg)";
        var q = k(d, 2.2, 2.6); endQr.style.opacity = q; endQr.style.transform = "translateY(" + (1 - eo(q)) * 120 + "px)";
        endBy.style.opacity = k(d, 3.0, 3.4);
      } else st.style.transform = "";
    };
  }

  /* ═════════ 학생 25초 — "공부 Gym 레벨 업" ═════════ */
  else {
    var S = [   // [그림, 제목, 한 줄, 쌤비 소품, {확대·누를 곳}]
      ["m-gym", "공부 Gym 입장!", "링크 하나 · PT실 6개", "", {z: 1.1, px: .5, py: .45}],
      ["s-test", "체력 측정", "내 수준부터 알고 시작", "hourglass", {z: 1.15, fx: .5, fy: .3, px: .5, py: .3}],
      ["s-warm", "준비운동 PT", "하루 10분 복습 루프", "alarm", {z: 1.1, px: .5, py: .93}],
      ["s-room", "수학 PT", "입소 진단 → 단원 훈련", "redpen", {z: 1.15, fx: .5, fy: .45, px: .5, py: .44}],
      ["s-kread", "국어 근육", "어휘 5개 + 지문 1편", "book", {z: 1.1, px: .5, py: .32}],
      ["s-mus", "근육이 자란다", "과목마다 레벨 업 💪", "", {z: 1.2, fx: .5, fy: .4, px: .45, py: .3}],
      ["s-log", "불꽃 출석", "연속 기록이 쌓이는 재미", "calendar", {z: 1.1, fx: .5, fy: .3, px: .55, py: .27}],
      ["s-map", "마스터 맵", "중학교 수학, 빈칸 없이", "search", {z: 1.15, fx: .5, fy: .4, px: .3, py: .3}],
      ["s-play", "수학 놀이터", "퍼즐로 머리 말랑말랑", "", {z: 1.1, fx: .5, fy: .4, px: .3, py: .3}]
    ];
    var NS = S.length, T0s = 3, LU = T0s + NS * 2;   // 3 · 21
    var rays = mk("rays"); mk("dots");
    // 위: 레벨 · 경험치 · 불꽃
    var hudS = mk("shud");
    var lv = mk("lv jua", "LV.1", hudS), xp = mk("xp jua", "<i></i><span>0 XP</span>", hudS), streak = mk("streak jua", "", hudS);
    mk("sdemo", "견본 화면", hudS);
    var plus = mk("plus jua", "+120 XP");
    // 질문
    var sh = mk("shook");
    var L1 = mk("jua", "고1 첫 시험,", sh, "h1"), L2 = mk("jua", "지금부터", sh, "h1"), L3 = mk("jua b", "달라진다!", sh, "h1");
    css(L1, {top: "480px"}); css(L2, {top: "700px"}); css(L3, {top: "880px", fontSize: "190px"});
    var shOwl = mk("sowl", owlSvg({acc: "trainer", open: true}, 340), sh); css(shOwl, {left: "370px", top: "1260px", width: "340px"});
    // 휴대폰들
    var PB = {x: 280, y: 360, w: 520, h: 1088};
    var sdevs = S.map(function(s){ return device("phone", s[0], PB); });
    var scap = mk("scap", "<h2 class='jua'></h2><p class='jua'></p>"), sOwl = mk("sowl"), sItem = null, sCap = -1;
    // 레벨 업 + 마무리
    var lvup = mk("lvup jua", "LEVEL UP!");
    var boom = confetti(70, 12345, ["#FF4D6D", "#FF7A1A", "#2B2100", "#1D9E75", "#fff", "#4D7CFF"]);
    var send = mk("send");
    var sH = mk("jua", "하루 1시간,<br>고등학교가<br><em>달라진다</em>", send, "h1");
    var sQr = mk("qr", '<div class="q">' + qr("apps/gym/", 250) + '</div><div><b class="jua">공부 Gym</b><span class="jua">휴대폰으로 찍고 바로 시작!</span><code>ssam-tools.github.io/t_tools/apps/gym</code></div>', send);
    var sBy = mk("by", "jidangmath가 Claude와 함께 제작 · 쌤 노트", send);
    var sEndOwl = mk("sowl", owlSvg({acc: "trainer", item: "stamp"}, 240), send); css(sEndOwl, {left: "420px", top: "460px", width: "240px"});

    draw = function(t){
      rays.style.transform = "rotate(" + (t * 18) + "deg)";
      var i = cl(Math.floor((t - T0s) / 2), 0, NS - 1), lt = t - T0s - i * 2, inS = t >= T0s && t < LU;
      // 질문
      show(sh, t < 3.05);
      if(t < 3.05){
        var out = k(t, 2.75, 3.0);
        sh.style.opacity = 1 - out; sh.style.transform = "scale(" + (1 + out * .3) + ")";
        [[L1, .05], [L2, .8], [L3, 1.35]].forEach(function(p){ var a = k(t, p[1], p[1] + .25); p[0].style.opacity = a; p[0].style.transform = "scale(" + lerp(2.2, 1, eo(a)) + ")"; });
        var sk = t > 1.6 && t < 2.1 ? Math.sin(t * 80) * 10 * (1 - k(t, 1.6, 2.1)) : 0; L3.style.transform += " translateX(" + sk + "px) rotate(-4deg)";
        var o = k(t, .4, .75); shOwl.style.opacity = o; shOwl.style.transform = "translateY(" + ((1 - back(o)) * 200 - Math.abs(Math.sin(t * Math.PI * 2)) * 20) + "px)";
      }
      // 위
      var level = t < T0s ? 1 : t < LU ? i + 1 + (k(lt, 1.2, 1.3) > 0 ? 1 : 0) : 10;
      lv.textContent = "LV." + level;
      var xpF = t < T0s ? 0 : t < LU ? eio(k(lt, .3, 1.25)) : 1;
      xp.firstChild.style.width = (xpF * 100) + "%";
      xp.lastChild.textContent = (t < T0s ? 0 : (t < LU ? i * 120 + Math.round(xpF * 120) : 1080)) + " XP";
      streak.textContent = t < T0s ? "🔥 오늘 시작" : "🔥 " + (t < LU ? i + 1 : 9) + "일 연속";
      var lp = t < LU ? k(lt, 1.2, 1.45) : 0; lv.style.transform = "scale(" + (1 + .25 * Math.sin(lp * Math.PI)) + ")";
      show(plus, inS);
      if(inS){ var pa = k(lt, .5, 1.5); css(plus, {left: "640px", top: (300 - eo(pa) * 90) + "px", opacity: pa > 0 && pa < 1 ? Math.sin(pa * Math.PI) * 1.4 : 0}); }
      // 휴대폰
      sdevs.forEach(function(d, j){
        var l = t - T0s - j * 2;
        if(l > -.25 && l < 2.05 && t < LU + .05){
          var a = back(k(l, -.2, .3)), b = ei(k(l, 1.82, 2.02)), tilt = j % 2 ? 3 : -3;
          d.root.style.transform = "translateY(" + ((1 - a) * -1400 + b * 1500) + "px) rotate(" + (tilt + (1 - a) * tilt * 4 - b * tilt * 3) + "deg) scale(" + (1 - b * .3) + ")";
          show(d.root, true); d.draw(l, S[j][4]);
        } else show(d.root, false);
      });
      // 자막 + 쌤비
      show(scap, inS); show(sOwl, inS);
      if(inS){
        if(i !== sCap){ sCap = i; scap.firstChild.textContent = S[i][1]; scap.lastChild.textContent = S[i][2]; }
        var c0 = k(lt, 0, .3); scap.firstChild.style.transform = "scale(" + lerp(1.8, 1, eo(c0)) + ") rotate(" + (i % 2 ? 2 : -2) + "deg)"; scap.firstChild.style.opacity = c0;
        scap.lastChild.style.opacity = k(lt, .2, .4);
        var it = S[i][3];
        if(it !== sItem){ sItem = it; sOwl.innerHTML = owlSvg({acc: "trainer", item: it || undefined, open: !it}, 220); }
        var side = i % 2 ? 820 : 40, ow = back(k(lt, .1, .45));
        css(sOwl, {left: side + "px", top: (1180 + (1 - ow) * 300 - Math.abs(Math.sin(t * Math.PI * 2)) * 18) + "px", opacity: k(lt, .1, .25) * (1 - k(lt, 1.85, 2))});
      }
      // 레벨 업 + 마무리
      var d = t - LU;
      show(lvup, d >= 0 && d < 1.3);
      if(d >= 0){ var u = k(d, 0, .25); lvup.style.opacity = 1 - k(d, .95, 1.25); lvup.style.transform = "scale(" + lerp(.2, 1, back(u)) + ") rotate(-5deg)"; }
      boom(d);
      show(send, d >= .85);
      if(d >= .85){
        var h = k(d, .85, 1.2); sH.style.opacity = h; sH.style.transform = "scale(" + lerp(1.5, 1, eo(h)) + ")";
        var q = k(d, 1.6, 1.95); sQr.style.opacity = q; sQr.style.transform = "translateY(" + (1 - eo(q)) * 120 + "px)";
        sBy.style.opacity = k(d, 2.2, 2.5);
        var eo2 = k(d, 1.1, 1.4); sEndOwl.style.opacity = eo2; sEndOwl.style.transform = "translateY(" + ((1 - back(eo2)) * 80 - Math.abs(Math.sin(t * Math.PI * 2)) * 14) + "px) rotate(8deg)";
      }
    };
  }

  /* ── 준비: 그림·글꼴을 모두 불러온 뒤 ── */
  var imgs = Array.prototype.slice.call(document.images);
  var ready = Promise.all(imgs.map(function(im){ return im.decode ? im.decode().catch(function(){}) : Promise.resolve(); }))
    .then(function(){ return document.fonts ? document.fonts.ready : null; });
  window.TT_FILM = {v: V, len: LEN, ready: ready, set: function(t){ draw(t); }};
  ready.then(function(){
    var t = parseFloat(P.get("t"));
    if(!isNaN(t)){ draw(t); return; }
    if(P.get("still")) return;
    var start = performance.now();
    (function loop(){ draw(((performance.now() - start) / 1000) % LEN); requestAnimationFrame(loop); })();
  });
  draw(0);
})();
