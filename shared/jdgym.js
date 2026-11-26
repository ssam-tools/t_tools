/* 지당 노트 × 공부 Gym 연결 (PLAN_지당연계 2~5단계) — window.JDGYM
   같은 주소(ssam-tools.github.io/t_tools)라서 학생 휴대폰 안의 두 기록을 서로 읽을 수 있습니다.
   · 읽기만 합니다. 쓰기는 각 앱이 자기 기록에만 합니다(gym_v1 / jidang.v1). 밖으로 보내는 것은 없습니다.
   · 선물 코드: 교사용 반 현황판이 만들고 지당 노트가 확인합니다. 코드를 소스에 그대로 적지 않으려고 확인 글자를 씁니다.
   jidangmath가 Claude와 함께 제작 */
(function(){
  "use strict";
  if(window.JDGYM) return;
  var ROOMS = {warm: ["준비운동", "🔥"], kor: ["국어", "📖"], math: ["수학", "🧮"], eng: ["영어", "🔤"], sci: ["통합과학", "🔬"], soc: ["통합사회", "🌏"], his: ["한국사", "📜"]};
  var HEART = [0, 7, 21, 50, 100], HEARTN = ["작은 심장", "뛰는 심장", "튼튼한 심장", "강철 심장", "백일 심장"];
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function get(k){ try{ return JSON.parse(localStorage.getItem(k) || "null"); }catch(e){ return null; } }
  function mins(d, id){ return d ? Math.floor(((d.sec || {})[id] || 0) / 60) : 0; }

  /* 공부 Gym 오늘 기록 + 가장 키울 과목 */
  function gym(){
    var S = get("gym_v1");
    if(!S || !S.days) return {has: false, today: 0, rooms: {}, weak: null};
    var d = S.days[ymd()], rooms = {}, t = 0;
    Object.keys(ROOMS).forEach(function(k){ rooms[k] = mins(d, k); t += rooms[k]; });
    var weak = null, best = 1e9;
    ["kor", "math", "eng", "sci", "soc", "his"].forEach(function(k){                     // 입소 진단 정답률이 가장 낮은 과목, 진단 전이면 XP가 가장 적은 과목
      var it = S.intake && S.intake[k], v;
      if(it && it.r && it.r.length){ var o = 0, n = 0; it.r.forEach(function(w){ o += w[1]; n += w[2]; }); v = n ? o / n : 1; }
      else v = 2 + ((S.xp && S.xp[k]) || 0) / 1e6;
      if(v < best){ best = v; weak = k; }
    });
    var nd = 0; Object.keys(S.days).forEach(function(k){ var dd = S.days[k], s = 0; for(var r in (dd.sec || {})) s += dd.sec[r]; if(s >= 600) nd++; });
    return {has: true, nick: S.nick || "", today: t, rooms: rooms, weak: weak ? {id: weak, name: ROOMS[weak][0], emo: ROOMS[weak][1], tested: best <= 1} : null, days: nd};
  }
  /* 지당 노트 누적 · 끈기 심장 */
  function heart(n){ var s = 0; HEART.forEach(function(v, i){ if(n >= v) s = i; }); return {lv: s, name: HEARTN[s], next: HEART[s + 1] || null, left: HEART[s + 1] ? HEART[s + 1] - n : 0}; }
  function jd(){
    var S = get("jidang.v1");
    if(!S || !S.goal) return {has: false, n: 0, today: false, heart: heart(0)};
    var n = Object.keys(S.entries || {}).length;
    return {has: true, nick: S.nick || "", n: n, today: !!(S.entries || {})[ymd()], goal: S.goal.text || "", heart: heart(n)};
  }
  /* 선물 코드: JD-<종류 1글자><무작위 4글자><확인 1글자> */
  var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var GIFTS = {S: ["⭐", "선생님 금별"], H: ["💗", "선생님 하트"], C: ["👏", "선생님 칭찬 도장"], F: ["🔥", "선생님 응원 불꽃"]};
  function ck(s){ var h = 7; for(var i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i) * 7 + 3) >>> 0; h ^= h >>> 13; return A.charAt((h * 2654435761 >>> 0) % 32); }
  function giftMake(k){ var r = ""; for(var i = 0; i < 4; i++) r += A.charAt(Math.floor(Math.random() * 32)); return "JD-" + k + r + ck("jdg" + k + r); }
  function giftCheck(code){
    var c = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if(c.indexOf("JD") === 0) c = c.slice(2);
    if(c.length !== 6 || !GIFTS[c[0]]) return null;
    return ck("jdg" + c[0] + c.slice(1, 5)) === c[5] ? {k: c[0], code: "JD-" + c} : null;
  }
  window.JDGYM = {ROOMS: ROOMS, gym: gym, jd: jd, heart: heart, HEART: HEART, GIFTS: GIFTS, giftMake: giftMake, giftCheck: giftCheck, ymd: ymd};
})();
