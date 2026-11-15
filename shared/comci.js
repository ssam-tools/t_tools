/* 컴시간 시간표 읽기 (14단계) — 내 시간표·학기초 세팅이 함께 씁니다.
   컴시간 서버에 접속하지 않습니다. 선생님이 복사해 붙여 넣은 글이나 내려받은 엑셀만 기기 안에서 읽습니다.
   TTComci.parseCell("304 수학")      → {code:"304", cls:304, subj:"수학"}
   TTComci.grid(html, text)           → 한 선생님 시간표(교시 줄 × 요일 칸). [{n, t, cells:[{d, text}]}] + .dates
   TTComci.toSlots(rows)              → {periods, slots, count}
   TTComci.teachers(rows)             → 전체 교사 시간표(엑셀·표): {teachers:[{name, subj, slots}], periods:[n…]}
   TTComci.htmlRows(html)             → 붙여 넣은 표를 행·열 배열로 */
var TTComci = (function(){
  "use strict";
  var DAYS = ["월","화","수","목","금"];
  var PERIOD_RE = /^\s*(\d{1,2})\s*(?:교시)?\s*\(\s*(\d{1,2}:\d{2})\s*\)/;
  function dayIndex(t){ var s = String(t == null ? "" : t).trim(); return /^[월화수목금](?:요일)?(?:$|[\s(\d])/.test(s) ? DAYS.indexOf(s.charAt(0)) : -1; }
  function pad5(t){ var a = String(t).split(":"); return (a[0].length < 2 ? "0" : "") + a[0] + ":" + a[1]; }
  function txt(v){ return String(v == null ? "" : v).replace(/ /g, " ").trim(); }

  /* 칸 글자 → {code, cls, subj}. "304 수학", "3-4 수학", "수학 3-04", "3학년 4반" 모두 됩니다. */
  function parseCell(text){
    var s = txt(text).replace(/\s+/g, " ");
    if(!s || /^[-–—·.]+$/.test(s)) return null;
    var m = s.match(/(\d)\s*학년\s*(\d{1,2})\s*반/) || s.match(/(\d)\s*-\s*(\d{1,2})(?!\d)/) || s.match(/(?:^|\D)(\d)(\d{2})(?!\d)/);
    var code = "", cls = null;
    if(m){ cls = (+m[1]) * 100 + (+m[2]); code = String(cls); s = s.replace(m[0].replace(/^\D/, ""), " "); }
    var subj = s.replace(/[()\[\]]/g, " ").replace(/\s+/g, " ").trim();
    if(!code){ code = subj.split(" ")[0]; subj = subj.split(" ").slice(1).join(" "); }
    if(!code) return null;
    return {code: code.slice(0, 12), cls: cls, subj: subj.slice(0, 12)};
  }
  /* 날짜 "11/16", "11.16", "(11월 16일)" → "MM-DD" */
  function dateOf(t){ var m = /(\d{1,2})\s*[\/.월]\s*(\d{1,2})/.exec(String(t)); return m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= 31 ? ("0" + m[1]).slice(-2) + "-" + ("0" + m[2]).slice(-2) : ""; }

  function cellText(c){ c = c.cloneNode(true); c.querySelectorAll("br").forEach(function(b){ b.replaceWith(" "); }); return c.textContent; }
  function htmlRows(html){
    var doc = new DOMParser().parseFromString(html, "text/html"), rows = [];
    Array.prototype.forEach.call(doc.querySelectorAll("tr"), function(tr){
      var r = [];
      Array.prototype.forEach.call(tr.children, function(c){
        if(c.tagName !== "TD" && c.tagName !== "TH") return;
        var t = txt(cellText(c)), span = Math.min(+c.getAttribute("colspan") || 1, 60);
        r.push(t); for(var i = 1; i < span; i++) r.push("");
      });
      rows.push(r);
    });
    return rows;
  }

  /* ---------- 한 선생님 시간표 (교시 줄마다 "1(09:00)") ---------- */
  function fromHtml(html){
    var doc = new DOMParser().parseFromString(html, "text/html");
    var best = null;
    Array.prototype.forEach.call(doc.querySelectorAll("table"), function(tb){
      var rows = Array.prototype.filter.call(tb.rows, function(r){ return r.cells.length && PERIOD_RE.test(r.cells[0].textContent); });
      if(rows.length && (!best || rows.length > best.rows.length)) best = {tb: tb, rows: rows};
    });
    if(!best) return null;
    var cols = [0,1,2,3,4], dates = {};
    Array.prototype.some.call(best.tb.rows, function(r){
      var idx = Array.prototype.map.call(r.cells, function(c){ return dayIndex(c.textContent); });
      if(idx.filter(function(i){ return i >= 0; }).length >= 3){
        cols = idx.slice(1);
        Array.prototype.forEach.call(r.cells, function(c, i){ if(idx[i] >= 0){ var d = dateOf(c.textContent); if(d) dates[idx[i]] = d; } });
        return true;
      }
      return false;
    });
    var out = best.rows.map(function(r){
      var m = r.cells[0].textContent.match(PERIOD_RE), cells = [];
      for(var i = 1; i < r.cells.length; i++){
        var c = r.cells[i], st = (c.getAttribute("style") || "") + " " + (c.getAttribute("class") || "") + " " + Array.prototype.map.call(c.querySelectorAll("[style],[color],font"), function(x){ return (x.getAttribute("style") || "") + (x.getAttribute("color") || ""); }).join(" ");
        cells.push({d: cols[i-1] != null ? cols[i-1] : i-1, text: cellText(c), mark: /red|#f00|#ff0000|rgb\(\s*2[0-9]{2},\s*[0-9]{1,2},\s*[0-9]{1,2}\)|chg|change/i.test(st)});
      }
      return {n: +m[1], t: m[2], cells: cells};
    });
    out.dates = dates; return out;
  }
  function fromText(text){
    text = String(text).replace(/\r/g, "");
    var re = /(?:^|\n)\s*(\d{1,2})\s*(?:교시)?\s*\(\s*(\d{1,2}:\d{2})\s*\)/g, hits = [], m;
    while((m = re.exec(text))) hits.push({n: +m[1], t: m[2], start: m.index, end: re.lastIndex});
    if(!hits.length || text.indexOf("\t") < 0) return null;
    var headLine = text.slice(0, hits[0].start).split("\n").filter(function(l){ return l.split("\t").map(dayIndex).filter(function(i){ return i >= 0; }).length >= 3; }).pop() || "";
    var head = headLine.split("\t"), idx = head.map(dayIndex), cols = [0,1,2,3,4], dates = {};
    if(idx.filter(function(i){ return i >= 0; }).length >= 3){
      cols = idx.filter(function(i){ return i >= 0; });
      head.forEach(function(h, i){ if(idx[i] >= 0){ var d = dateOf(h); if(d) dates[idx[i]] = d; } });
    }
    var out = hits.map(function(h, k){
      var chunk = text.slice(h.end, k + 1 < hits.length ? hits[k+1].start : text.length);
      var parts = chunk.split("\t").slice(1);
      return {n: h.n, t: h.t, cells: parts.slice(0, cols.length).map(function(p, i){ return {d: cols[i], text: p}; })};
    });
    out.dates = dates; return out;
  }
  function grid(html, text){ return (html && fromHtml(html)) || (text && fromText(text)) || null; }
  function toSlots(rows){
    var periods = [], slots = {}, count = 0, marks = {};
    rows.forEach(function(r){
      periods.push({n: r.n, t: pad5(r.t)});
      r.cells.forEach(function(c){
        if(c.d < 0 || c.d > 4) return;
        var v = parseCell(c.text), k = (c.d + 1) + "-" + r.n;
        if(v){ slots[k] = v; count++; }
        if(c.mark) marks[k] = 1;
      });
    });
    var maxUsed = Object.keys(slots).reduce(function(a, k){ return Math.max(a, +k.split("-")[1]); }, 0);
    periods = periods.filter(function(p){ return p.n <= Math.max(maxUsed, 7); });
    return {periods: periods, slots: slots, count: count, marks: marks};
  }

  /* ---------- 전체 교사 시간표 (컴시간 엑셀: 한 줄에 한 선생님, 칸 = 요일×교시) ---------- */
  function nameOf(s){
    s = txt(s).replace(/\s+/g, " ");
    if(!s || /^\d+$/.test(s) || /^(교사|교사명|성명|이름|선생님|담당|번호|구분|요일|교시)$/.test(s.replace(/\s/g, ""))) return null;
    var m = /^([가-힣A-Za-z]{2,10})\s*(?:선생님)?\s*[(\[]\s*([^)\]]{1,12})\s*[)\]]/.exec(s);
    if(m) return {name: m[1], subj: m[2].trim()};
    m = /^([가-힣]{2,5})(?:\s+|$)([가-힣A-Za-z]{1,10})?/.exec(s);
    if(m && s.length <= 20) return {name: m[1], subj: (m[2] || "").trim()};
    return null;
  }
  function header(rows){
    var lim = Math.min(rows.length, 20);
    for(var r = 0; r < lim; r++){                                   // ① "월1 월2 … 금7" 한 줄
      var map = {}, n = 0;
      (rows[r] || []).forEach(function(v, ci){ var m = /^([월화수목금])(?:요일)?\s*[-_]?\s*(\d{1,2})(?:교시)?$/.exec(txt(v)); if(m){ map[ci] = {d: DAYS.indexOf(m[1]), p: +m[2]}; n++; } });
      if(n >= 10) return {row: r, map: map};
    }
    for(r = 0; r < lim; r++){                                       // ② 교시 숫자 줄 (+ 그 위의 요일 줄)
      var cols = [];
      (rows[r] || []).forEach(function(v, ci){ var m = /^(\d{1,2})(?:교시)?$/.exec(txt(v)); if(m && +m[1] >= 1 && +m[1] <= 10) cols.push({ci: ci, p: +m[1]}); });
      if(cols.length < 10) continue;
      var dayRow = null;
      for(var u = r - 1; u >= Math.max(0, r - 3) && !dayRow; u--) if((rows[u] || []).filter(function(v){ return dayIndex(v) >= 0; }).length >= 3) dayRow = rows[u];
      var map2 = {}, d = -1, prev = 99, last = -1;
      cols.forEach(function(c){
        if(dayRow){ for(var k = c.ci; k > last; k--){ var di = dayIndex(dayRow[k]); if(di >= 0){ d = di; break; } } last = c.ci; }
        if(!dayRow && c.p <= prev) d++;
        if(dayRow && d < 0) d = 0;
        prev = c.p; if(d >= 0 && d <= 4) map2[c.ci] = {d: d, p: c.p};
      });
      return {row: r, map: map2};
    }
    return null;
  }
  function byRows(rows){
    var h = header(rows); if(!h) return null;
    var cis = Object.keys(h.map).map(Number), first = Math.min.apply(null, cis), out = [], cur = null, maxP = 0;
    for(var r = h.row + 1; r < rows.length; r++){
      var row = rows[r] || [], who = null;
      for(var c = 0; c < first && !who; c++) who = nameOf(row[c]);
      var any = cis.some(function(ci){ return txt(row[ci]); });
      if(!who && !any) continue;
      if(who){ cur = {name: who.name, subj: who.subj, raw: {}}; out.push(cur); }
      else if(!cur) continue;
      cis.forEach(function(ci){ var v = txt(row[ci]); if(v){ var k = (h.map[ci].d + 1) + "-" + h.map[ci].p; cur.raw[k] = (cur.raw[k] ? cur.raw[k] + " " : "") + v; } });   // 두 줄(반·과목)로 나뉜 칸은 합침
    }
    return finish(out);
  }
  /* 선생님마다 표 하나("홍길동 선생님" 제목 + 요일 줄 + 교시 줄) */
  function byBlocks(rows){
    var out = [], cur = null, cols = null, title = null;
    rows.forEach(function(row){
      row = row || [];
      var nonEmpty = row.map(txt).filter(Boolean);
      var di = row.map(dayIndex);
      if(di.filter(function(i){ return i >= 0; }).length >= 3){ cols = di; cur = title ? {name: title.name, subj: title.subj, raw: {}} : null; if(cur) out.push(cur); title = null; return; }
      var pm = /^(\d{1,2})\s*(?:교시)?(?:\s*\(\s*\d{1,2}:\d{2}\s*\))?$/.exec(txt(row[0]));
      if(pm && cols && cur){ row.forEach(function(v, ci){ if(ci > 0 && cols[ci] >= 0 && txt(v)) cur.raw[(cols[ci] + 1) + "-" + (+pm[1])] = txt(v); }); return; }
      if(nonEmpty.length && nonEmpty.length <= 3){ var w = nameOf(nonEmpty.join(" ").replace(/교사|시간표|:/g, " ").trim()); if(w){ title = w; cols = null; cur = null; } }
    });
    return finish(out);
  }
  function finish(list){
    var seen = {}, teachers = [], maxP = 0;
    list.forEach(function(t){
      var slots = {}, n = 0, subjN = {};
      Object.keys(t.raw).forEach(function(k){ var v = parseCell(t.raw[k]); if(v){ slots[k] = v; n++; if(v.subj) subjN[v.subj] = (subjN[v.subj] || 0) + 1; maxP = Math.max(maxP, +k.split("-")[1]); } });
      if(!n) return;
      var subj = t.subj || Object.keys(subjN).sort(function(a, b){ return subjN[b] - subjN[a]; })[0] || "";
      Object.keys(slots).forEach(function(k){ if(!slots[k].subj) slots[k].subj = subj.slice(0, 12); });
      var key = t.name; if(seen[key]) key = t.name + "(" + subj + ")";
      if(seen[key]) return; seen[key] = 1;
      teachers.push({name: key, subj: subj.slice(0, 12), slots: slots});
    });
    return teachers.length ? {teachers: teachers, maxP: maxP} : null;
  }
  function teachers(rows){
    var a = byRows(rows), b = byBlocks(rows);
    if(a && b) return b.teachers.length > a.teachers.length ? b : a;
    return a || b;
  }
  return {DAYS: DAYS, parseCell: parseCell, grid: grid, toSlots: toSlots, teachers: teachers, htmlRows: htmlRows, dateOf: dateOf, pad5: pad5,
    /* 컴시간 교사용 웹 (한글 주소 컴시간교사.kr) */
    WEB: "http://xn--s39aqy283b66bj2x.kr/"};
})();
