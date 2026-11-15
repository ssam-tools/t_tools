/* 학사일정 (tt_calendar_v1) — 학교 학사일정 표를 복사해 붙여 넣으면 날짜별 행사·휴업일·시험일로 읽습니다.
   한 번 넣으면: 연간 업무 달력 · 첫 화면 2주 달력(📌) · 출결 휴일(연속 지각 판정) · 수업일마다 도는 당번이 함께 씁니다.
   저장: {v:1, events:[{d:"YYYY-MM-DD", t:"행사 이름", k:"evt"|"off"|"exam"}], at}
   읽는 모양: ① 목록형 (날짜 | 요일 | 행사 / "3.2.(월) 입학식" / "3월 2일 입학식" / 2026-03-02 …, 기간 "3.3.~3.6.")
              ② 달력형 (달마다 표, 칸 안에 "날짜 + 행사"; "3월" 같은 제목이 표 앞이나 칸에 있음) */
var TTCal = (function(){
  "use strict";
  var KEY = "tt_calendar_v1";
  var OFF = /휴업|방학(?!식)|공휴일|대체|재량|개교\s*기념|신정|설날|설\s*연휴|추석|어린이날|현충일|광복절|개천절|한글날|성탄|기독탄신|삼일절|3\.1절|석가|부처님|선거일|연휴|휴일/;
  var EXAM = /고사|시험|평가|모의고사/;
  function pad(n){ return ("0" + n).slice(-2); }
  function key(y, m, d){ return y + "-" + pad(m) + "-" + pad(d); }
  function valid(y, m, d){ var x = new Date(y, m - 1, d); return x.getFullYear() === y && x.getMonth() === m - 1 && x.getDate() === d; }
  function kind(t){ return OFF.test(t) ? "off" : EXAM.test(t) ? "exam" : "evt"; }
  function load(){ var o = TT.store.get(KEY, null) || {}; if(!Array.isArray(o.events)) o.events = []; o.v = 1; return o; }
  function save(o){ o.at = Date.now(); TT.store.set(KEY, o); }
  function yearOf(m, Y){ return m >= 3 ? Y : Y + 1; }                  // 학년도: 3월 ~ 이듬해 2월
  function clean(t){ return t.replace(/\((?:월|화|수|목|금|토|일)\)/g, " ").replace(/[|·•▶◆■□○●\-–—~]+\s*$/g, "").replace(/^[\s|:·•\-–—~,]+|[\s|:,]+$/g, "").replace(/\s{2,}/g, " ").trim(); }

  /* 칸 글자: 줄바꿈(<br>, 문단)을 살려서 (화면에 그려지지 않은 문서라 innerText를 쓸 수 없음) */
  function cellText(c){
    var h = c.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li)>/gi, "\n");
    var t = document.createElement("template"); t.innerHTML = h;
    return (t.content.textContent || "").replace(/\r/g, "").replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{2,}/g, "\n").trim();
  }
  /* 붙여 넣은 것 → 칸(셀) 차례 목록. 표가 있으면 칸마다, 없으면 줄마다(탭은 칸 나눔) */
  function cells(html, text){
    var out = [];
    if(html && /<table/i.test(html)){
      var doc = new DOMParser().parseFromString(html, "text/html");
      (function walk(n){
        if(n.nodeType === 3){ var t = n.textContent.trim(); if(t && !(n.parentNode && n.parentNode.closest && n.parentNode.closest("td,th"))) out.push({t: t, row: null}); return; }
        if(n.nodeType !== 1) return;
        var tag = n.tagName;
        if(tag === "TR"){ var r = []; Array.prototype.forEach.call(n.children, function(c){ if(c.tagName === "TD" || c.tagName === "TH") r.push(cellText(c)); }); r.forEach(function(t){ out.push({t: t, row: r}); }); return; }
        if(tag === "SCRIPT" || tag === "STYLE") return;
        Array.prototype.forEach.call(n.childNodes, walk);
      })(doc.body);
      return out;
    }
    String(text || "").replace(/\r/g, "").split("\n").forEach(function(line){ var r = line.split("\t"); r.forEach(function(t){ out.push({t: t, row: r, line: line}); }); });
    return out;
  }

  /* ① 목록형: 한 줄(행)에 날짜와 행사가 함께 */
  var DATE = /(?:(\d{4})\s*[.\-/년]\s*)?(\d{1,2})\s*(?:[.\-/]|월)\s*(\d{1,2})\s*(?:일|\.)?(?:\s*\((?:월|화|수|목|금|토|일)\))?/;
  var RANGE = new RegExp(DATE.source + "\\s*[~∼〜\\-–]\\s*(?:(?:(\\d{4})\\s*[.\\-/년]\\s*)?(\\d{1,2})\\s*(?:[.\\-/]|월)\\s*)?(\\d{1,2})\\s*(?:일|\\.)?(?:\\s*\\((?:월|화|수|목|금|토|일)\\))?");
  function parseList(cs, Y){
    var seen = {}, ev = [];
    cs.forEach(function(c){
      var rowText = c.row ? c.row.join(" | ") : c.t;
      if(seen[rowText]) return; seen[rowText] = 1;
      String(rowText).split("\n").forEach(function(line){
        var mr = line.match(RANGE), m1 = line.match(DATE), m = mr || m1;
        if(!m) return;
        var y1 = m[1] ? +m[1] : 0, mo = +m[2], d = +m[3];
        if(mo < 1 || mo > 12 || d < 1 || d > 31) return;
        var t = clean(line.replace(m[0], " ").replace(/\d{4}\s*학년도/, ""));
        if(!t || /^\d+$/.test(t) || t.length < 2) return;
        var yy = y1 || yearOf(mo, Y); if(!valid(yy, mo, d)) return;
        var e = {d: key(yy, mo, d), t: t.slice(0, 40), k: kind(t)};
        if(mr){ var m2 = mr[5] ? +mr[5] : mo, d2 = +mr[6], y2 = mr[4] ? +mr[4] : yearOf(m2, Y); if(valid(y2, m2, d2)) e.to = key(y2, m2, d2); }
        ev.push(e);
      });
    });
    return ev;
  }
  /* ② 달력형: "3월" 제목 뒤 칸들이 "날짜(줄바꿈)행사" */
  function parseGrid(cs, Y){
    var mo = 0, ev = [], seen = {};
    cs.forEach(function(c){
      var t = String(c.t).trim(); if(!t) return;
      var mh = t.match(/^(?:\d{4}\s*년\s*)?(\d{1,2})\s*월(?:\s|$)/);
      if(mh && t.length <= 12){ mo = +mh[1]; return; }
      if(!mo) return;
      var md = t.match(/^(\d{1,2})\s*(?:일)?(?:\s*\((?:월|화|수|목|금|토|일)\))?\s*[\n ]+([\s\S]+)$/);
      if(!md) return;
      var d = +md[1]; if(d < 1 || d > 31) return;
      md[2].split(/\n|,|·/).forEach(function(x){
        x = clean(x); if(!x || /^\d+$/.test(x) || x.length < 2) return;
        var yy = yearOf(mo, Y); if(!valid(yy, mo, d)) return;
        var k2 = key(yy, mo, d) + x; if(seen[k2]) return; seen[k2] = 1;
        ev.push({d: key(yy, mo, d), t: x.slice(0, 40), k: kind(x)});
      });
    });
    return ev;
  }
  function parse(html, text, Y){
    var cs = cells(html, text), a = parseList(cs, Y), b = parseGrid(cs, Y);
    var ev = b.length > a.length ? b : a;
    var u = {}, out = [];
    ev.forEach(function(e){ var k = e.d + "|" + e.t; if(!u[k]){ u[k] = 1; out.push(e); } });
    return out.sort(function(x, y){ return x.d < y.d ? -1 : x.d > y.d ? 1 : 0; });
  }
  /* 기간(~)은 휴업·시험이면 평일마다 펼치고, 행사는 첫날에 "(~끝날)"을 붙임 */
  function expand(list){
    var out = [];
    list.forEach(function(e){
      if(!e.to || e.to <= e.d){ out.push({d: e.d, t: e.t, k: e.k}); return; }
      if(e.k === "evt"){ out.push({d: e.d, t: e.t + " (~" + (+e.to.slice(5, 7)) + "/" + (+e.to.slice(8)) + ")", k: e.k}); return; }
      var a = e.d.split("-"), x = new Date(+a[0], a[1] - 1, +a[2]), n = 0;
      while(key(x.getFullYear(), x.getMonth() + 1, x.getDate()) <= e.to && n++ < 80){
        var w = x.getDay(); if(w !== 0 && w !== 6) out.push({d: key(x.getFullYear(), x.getMonth() + 1, x.getDate()), t: e.t, k: e.k});
        x.setDate(x.getDate() + 1);
      }
    });
    return out;
  }
  /* 학년도(3월~이듬해 2월) 일정을 새것으로 바꿈 */
  function replaceYear(Y, list){
    var o = load(), from = Y + "-03-01", to = (Y + 1) + "-02-31";
    o.events = o.events.filter(function(e){ return e.d < from || e.d > to; }).concat(expand(list));
    o.events.sort(function(a, b){ return a.d < b.d ? -1 : 1; }); o.y = Y; save(o); return o;
  }
  function offDays(){ var m = {}; load().events.forEach(function(e){ if(e.k === "off") m[e.d] = e.t; }); return m; }
  function inRange(a, b){ return load().events.filter(function(e){ return e.d >= a && e.d <= b; }); }
  return {KEY: KEY, load: load, save: save, parse: parse, expand: expand, replaceYear: replaceYear, offDays: offDays, inRange: inRange, kind: kind};
})();
