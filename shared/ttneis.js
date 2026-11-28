/* 쌤 노트 v2.69 · 나이스 시간표 자동 반영 (모든 화면에서 저절로)
   - 쌤 노트를 열면(그리고 2시간마다·창을 다시 볼 때) 이번 주 + 다음 주 나이스 학급 시간표(중학교 misTimetable)를 읽어
     내 반·내 교과 칸이 바뀐 곳을 찾아 그 주 시간표에 바로 반영합니다. 기본 시간표는 그대로 둡니다.
   - 선생님이 직접 고치거나 붙여 넣은 칸(TT.timetable.hand)은 덮어쓰지 않습니다.
   - 반영한 뒤에는 [되돌리기]가 남고, 되돌린 칸은 다시 자동으로 바꾸지 않습니다(직접 고친 칸처럼 지킴).
   - 안전장치: 그 반 그날 자료가 나이스에 있을 때만 바꿈 · 한 반에 같은 교과 선생님이 여럿이라 보이는 반은 건너뜀
   - 나이스에는 학교 코드·학년·반·날짜만 보냅니다(학생·교사 이름 없음). 기록은 이 기기 "tt_ttneis_v1"에만.
   TTNeis.run({force})  → Promise<{ok, msg, weeks:[{mon, list}]}>
   TTNeis.last()        → 마지막 결과 {at, msg, ok, weeks:[{mon, list, at}]}
   TTNeis.undo(mon)     → 그 주 자동 반영 되돌리기 */
var TTNeis = window.TTNeis || (function(){
  "use strict";
  if(!window.TT || TT.classroom) return null;
  var KEY = "tt_ttneis_v1", GAP = 2 * 3600000, DOW = "일월화수목금토", busy = null;
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function add(d, n){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function clsTxt(s){ var c = +s.cls; return c > 100 ? Math.floor(c / 100) + "-" + (c % 100) : String(s.code || ""); }
  function norm(x){ return String(x || "").replace(/[\s·*()]/g, ""); }
  function match(a, b){ a = norm(a); b = norm(b); return !!a && !!b && (a.indexOf(b) === 0 || b.indexOf(a) === 0); }
  function meta(){ return TT.store.get(KEY, null) || {}; }
  function ready(){ var s = TT.school.load() || {}; return !!(s.neisA && s.neisS && s.neisKey && TT.timetable.has()); }
  function thisMon(){ var d = new Date(), w = d.getDay(); return add(d, w === 0 ? 1 : w === 6 ? 2 : 1 - w); }   // 주말이면 다음 주 월요일

  /* 한 주 읽기 → 바뀐 칸 계산 */
  function week(monD, s, t, my){
    var mon = ymd(monD), C = Object.keys(my);
    var ay = monD.getMonth() >= 2 ? monD.getFullYear() : monD.getFullYear() - 1, sem = monD.getMonth() >= 2 && monD.getMonth() <= 7 ? 1 : 2;
    var f = mon.replace(/-/g, ""), to = ymd(add(monD, 4)).replace(/-/g, "");
    return Promise.all(C.map(function(c){
      var q = {Type: "json", KEY: s.neisKey, pIndex: 1, pSize: 200, ATPT_OFCDC_SC_CODE: s.neisA, SD_SCHUL_CODE: s.neisS, AY: ay, SEM: sem, TI_FROM_YMD: f, TI_TO_YMD: to, GRADE: Math.floor(c / 100), CLASS_NM: c % 100};
      var url = "https://open.neis.go.kr/hub/misTimetable?" + Object.keys(q).map(function(k){ return k + "=" + encodeURIComponent(q[k]); }).join("&");
      return fetch(url, {credentials: "omit", cache: "no-store"}).then(function(r){ return r.json(); })
        .then(function(j){ var A = j && j.misTimetable; return {c: +c, rows: A && A[1] && A[1].row ? A[1].row : [], err: !A && j && j.RESULT && !/INFO-200/.test(j.RESULT.CODE || "") ? j.RESULT.CODE : ""}; })
        .catch(function(){ return {c: +c, rows: [], fail: 1}; });
    })).then(function(res){
      if(res.length && res.every(function(r){ return r.fail; })) throw new Error("net");
      var bad = res.filter(function(r){ return /ERROR-290|ERROR-300/.test(r.err || ""); })[0]; if(bad) throw new Error("key");
      var got = {}, found = {}, nN = {}, nB = {};                       // got["반|요일"] = 그 반 그날 자료가 나이스에 있음
      res.forEach(function(r){ r.rows.forEach(function(x){
        var y = String(x.ALL_TI_YMD || ""); if(y.length !== 8) return;
        var wd = new Date(+y.slice(0, 4), +y.slice(4, 6) - 1, +y.slice(6, 8)).getDay(); if(wd < 1 || wd > 5) return;
        got[r.c + "|" + wd] = 1;
        if(match(x.ITRT_CNTNT, my[r.c])){ found[wd + "-" + (+x.PERIO)] = r.c; nN[r.c] = (nN[r.c] || 0) + 1; }
      }); });
      Object.keys(t.slots).forEach(function(k){ var c = +(t.slots[k] && t.slots[k].cls); if(c > 100) nB[c] = (nB[c] || 0) + 1; });
      var skip = {};                                                    // 같은 교과를 여러 선생님이 가르치는 반 (나이스 시간이 내 시간보다 훨씬 많음)
      C.forEach(function(c){ if((nN[c] || 0) >= (nB[c] || 0) + 2 && (nN[c] || 0) > (nB[c] || 0) * 1.4) skip[c] = 1; });
      var cur = TT.timetable.week(mon), H = TT.timetable.hand(mon), next = {}, list = [];
      Object.keys(cur).forEach(function(k){ next[k] = cur[k]; });
      t.periods.forEach(function(p){ for(var i = 1; i <= 5; i++){
        var k = i + "-" + p.n, was = cur[k], c = found[k];
        if(H[k]) continue;                                              // 직접 고친 칸은 그대로
        if(c && skip[c]) continue;
        var wc = was && +was.cls > 100 ? +was.cls : 0;
        if(wc && (skip[wc] || !got[wc + "|" + i])) continue;            // 지금 칸의 반 자료가 없으면 그대로
        if(!wc && was) continue;                                        // 반이 아닌 칸(동아리·창체 등)은 그대로
        if(c && !got[c + "|" + i]) continue;
        var want = c ? (wc === c ? was : {code: String(c), cls: c, subj: my[c]}) : null;
        if(!TT.timetable.same(want, was)){ list.push(DOW[i] + " " + p.n + "교시 " + (was ? clsTxt(was) : "공강") + " → " + (want ? clsTxt(want) : "공강")); if(want) next[k] = want; else delete next[k]; }
      } });
      var any = Object.keys(got).length > 0;
      return {mon: mon, any: any, list: list, next: next, prev: cur};
    });
  }

  function run(o){
    o = o || {};
    if(busy) return busy;
    if(!ready()) return Promise.resolve({ok: false, msg: "need"});
    var M = meta(); if(!o.force && M.at && Date.now() - M.at < GAP && M.day === ymd(new Date())) return Promise.resolve(M);
    var s = TT.school.load() || {}, t = TT.timetable.load(), my = {};
    Object.keys(t.slots).forEach(function(k){ var x = t.slots[k]; if(x && +x.cls > 100) my[+x.cls] = my[+x.cls] || x.subj || s.subject || ""; });
    if(!Object.keys(my).length) return Promise.resolve({ok: false, msg: "시간표에 반(예: 304)이 들어 있어야 나이스와 맞출 수 있어요."});
    var m0 = thisMon();
    busy = week(m0, s, t, my).then(function(a){ return week(add(m0, 7), s, t, my).then(function(b){ return [a, b]; }, function(){ return [a]; }); })
      .then(function(W){
        var out = {at: Date.now(), day: ymd(new Date()), ok: true, weeks: (M.weeks || []).filter(function(x){ return x.mon >= ymd(m0); })}, n = 0;
        W.forEach(function(w){
          if(!w.list.length) return;
          TT.timetable.setWeek(w.mon, w.next);
          out.weeks = out.weeks.filter(function(x){ return x.mon !== w.mon; });
          out.weeks.push({mon: w.mon, list: w.list, at: Date.now(), prev: w.prev});
          n += w.list.length;
        });
        out.weeks.sort(function(a, b){ return a.mon < b.mon ? -1 : 1; });
        out.msg = !W[0].any ? "나이스에 이번 주 시간표가 아직 없어요" : n ? "나이스 교체 " + n + "곳을 반영했어요" : "나이스와 같아요";
        out.n = n;
        TT.store.set(KEY, out);
        if(n){ try{ window.dispatchEvent(new Event("tt-home-change")); window.dispatchEvent(new Event("tt-timetable-auto")); }catch(e){}
          TT.ui.toast("🔄 " + out.msg, function(){ W.forEach(function(w){ if(w.list.length) undo(w.mon); }); }, "되돌리기", 8000); }
        return out;
      })
      .catch(function(e){ var r = {ok: false, at: Date.now(), day: ymd(new Date()), msg: e && e.message === "key" ? "나이스 인증키를 확인해 주세요" : "나이스에 연결하지 못했어요", weeks: M.weeks || []}; TT.store.set(KEY, r); return r; })
      .then(function(r){ busy = null; return r; });
    return busy;
  }

  /* 되돌리기: 그 주를 자동 반영 전으로. 되돌린 칸은 '직접 고친 칸'으로 지켜 다시 바꾸지 않음 */
  function undo(mon){
    var M = meta(), w = (M.weeks || []).filter(function(x){ return x.mon === mon; })[0]; if(!w || !w.prev) return false;
    var cur = TT.timetable.week(mon), keys = {};
    Object.keys(cur).concat(Object.keys(w.prev)).forEach(function(k){ if(!TT.timetable.same(cur[k], w.prev[k])) keys[k] = 1; });
    TT.timetable.setWeek(mon, w.prev, {hand: Object.keys(keys)});
    M.weeks = M.weeks.filter(function(x){ return x.mon !== mon; }); TT.store.set(KEY, M);
    try{ window.dispatchEvent(new Event("tt-home-change")); window.dispatchEvent(new Event("tt-timetable-auto")); }catch(e){}
    TT.ui.toast("자동 반영을 되돌렸어요 (그 칸은 다시 바꾸지 않아요)");
    return true;
  }

  /* 저절로: 화면을 열 때 · 창을 다시 볼 때 · 2시간마다 (쉬는 시간에 조용히) */
  function auto(){ if(document.visibilityState !== "visible") return; var go = function(){ run({quiet: true}); }; if(window.requestIdleCallback) requestIdleCallback(go, {timeout: 4000}); else setTimeout(go, 1500); }
  if(document.readyState === "complete") setTimeout(auto, 1200); else window.addEventListener("load", function(){ setTimeout(auto, 1200); });
  document.addEventListener("visibilitychange", auto);
  setInterval(auto, GAP + 60000);

  return {run: run, last: meta, undo: undo, ready: ready, KEY: KEY};
})();
