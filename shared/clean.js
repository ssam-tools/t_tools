/* 쌤 노트 · 청소 당번 대기열 (TT_CLEAN) — 1인 1역(apps/duty)·학생 카드·첫 화면이 함께 씁니다.
   우리 반(★) 기록에서 자동으로 모읍니다. 원래 기록(출결·지도·제출물)은 지우지 않고, "청소 완료" 표시만 tt_duty_v1 에 남깁니다.
   · 무단지각: 출결(tt_guide_v1.att) 미인정 지각 (L|날짜|번호)
   · 지도: 빠른 지도(tt_guide_v1.gd) 중 고른 종류만 (G|기록id)
   · 미제출: 제출물(tt_submit_v1) 중 마감이 지난 것의 미제출 (S|제출물id|번호)
   설정·완료 표시: tt_duty_v1.c[학급id].cl = {on:{L,G,S}, kinds:[…], since:"YYYY-MM-DD", done:{키:완료한 날}} */
(function(){
  "use strict";
  if(window.TT_CLEAN) return;
  var KEY = "tt_duty_v1", DEFK = ["생활", "복장", "휴대폰"];
  function pad(n){ return ("0" + n).slice(-2); }
  function today(){ var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function md(s){ var a = String(s || "").split("-"); return a.length > 2 ? (+a[1]) + "/" + (+a[2]) : s; }
  function home(){ try{ return TT.roster.home(); }catch(e){ return null; } }
  function store(){ var S = TT.store.get(KEY, null) || {}; S.v = 1; S.c = S.c || {}; return S; }
  function cfg(cid){
    var c = store().c[cid] || {}, cl = c.cl || {};
    return {on: cl.on || {L: true, G: true, S: true}, kinds: Array.isArray(cl.kinds) ? cl.kinds : DEFK.slice(), since: cl.since || "", done: cl.done || {}};
  }
  function setCfg(cid, o){
    var S = store(), c = S.c[cid] = S.c[cid] || {}, cur = cfg(cid);
    c.cl = {on: o.on || cur.on, kinds: o.kinds || cur.kinds, since: o.since != null ? o.since : cur.since, done: o.done || cur.done};
    S.updatedAt = Date.now(); TT.store.set(KEY, S);
  }
  /* 처음 쓰는 날부터 모음(예전 기록이 한꺼번에 쌓이지 않게) */
  function since(cid){ var c = cfg(cid); if(!c.since){ setCfg(cid, {since: today()}); return today(); } return c.since; }
  /* 대기열: [{no, name, items:[{key, why, d}]}] (번호순) — 우리 반만 */
  function pending(cid){
    var H = home(); if(!H || (cid && H.id !== cid)) return [];
    var c = cfg(H.id), from = since(H.id), td = today(), by = {}, G = TT.store.get("tt_guide_v1", null) || {}, SB = TT.store.get("tt_submit_v1", null) || {};
    function add(no, key, why, d){ if(c.done[key]) return; (by[no] = by[no] || []).push({key: key, why: why, d: d}); }
    if(c.on.L) Object.keys(G.att || {}).forEach(function(d){ if(d < from || d > td) return; var day = G.att[d] || {}; Object.keys(day).forEach(function(no){ var r = day[no]; if(r && r.t === "L" && !r.o) add(+no, "L|" + d + "|" + no, "지각", d); }); });
    if(c.on.G) (G.gd || []).forEach(function(g){ if(g.date < from || g.date > td) return; if(c.kinds.indexOf(String(g.kind).replace("👍", "")) < 0 && c.kinds.indexOf(g.kind) < 0) return; add(+g.sid, "G|" + g.id, g.kind, g.date); });
    if(c.on.S) (SB.items || []).forEach(function(it){ if(it.cls !== H.id || !it.due || it.due >= td || it.due < from) return; var m = (SB.m || {})[it.id] || {}; (H.students || []).forEach(function(s){ if(!m[s.no]) add(+s.no, "S|" + it.id + "|" + s.no, it.title + " 미제출", it.due); }); });
    return Object.keys(by).map(Number).sort(function(a, b){ return a - b; }).map(function(no){
      var s = (H.students || []).filter(function(x){ return +x.no === no; })[0];
      return {no: no, name: s ? s.name : "", items: by[no].sort(function(a, b){ return a.d < b.d ? -1 : 1; })};
    });
  }
  function markDone(cid, keys){ var c = cfg(cid), t = today(); keys.forEach(function(k){ c.done[k] = t; }); setCfg(cid, {done: c.done}); }
  function count(){ var H = home(); return H ? pending(H.id).length : 0; }
  window.TT_CLEAN = {pending: pending, markDone: markDone, cfg: cfg, setCfg: setCfg, count: count, md: md, DEFK: DEFK};
})();
