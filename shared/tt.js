/* 선생님 도구 모음 · 공통 코드 (모든 도구가 함께 씁니다)
   TT.store   이 기기 브라우저에만 저장 (서버로 보내지 않음)
   TT.roster  학급 명렬표: 나이스 파일에서 만든 학년·반·번호·이름. 모든 도구가 같은 명단을 씁니다.
   TT.file    엑셀(xlsx)·CSV·표 파일을 기기 안에서 읽기
   TT.backup  모든 도구의 자료를 파일 하나로 저장하고 불러오기
   TT.ui      알림, 확인 창, 입력 창
   저장 이름 규칙: 반드시 "tt_"로 시작합니다. 그래야 전체 백업에 함께 들어갑니다. */
var TT = (function(){
  "use strict";
  var VERSION = "0.3.1";
  var BASE = (function(){                       // 도구 모음의 맨 위 주소 (shared 폴더의 한 칸 위)
    var s = document.currentScript && document.currentScript.src;
    try{ return new URL("../", s).href; }catch(e){ return "./"; }
  })();

  /* ================= 저장 ================= */
  var canStore = true;
  try{ localStorage.setItem("tt_probe","1"); localStorage.removeItem("tt_probe"); }catch(e){ canStore = false; }
  function storeFail(){ canStore = false; ui.warnStore(); }
  var store = {
    ok: function(){ return canStore; },
    raw: function(key){ try{ return localStorage.getItem(key); }catch(e){ return null; } },
    setRaw: function(key, text){
      if(!canStore) return false;
      try{ localStorage.setItem(key, text); return true; }catch(e){ storeFail(); return false; }
    },
    get: function(key, fallback){
      try{ var s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }catch(e){ return fallback; }
    },
    set: function(key, value){ return store.setRaw(key, JSON.stringify(value)); },
    remove: function(key){ try{ localStorage.removeItem(key); }catch(e){} },
    keys: function(){
      var out = [];
      try{ for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(k && k.indexOf("tt_") === 0 && k !== "tt_probe") out.push(k); } }catch(e){}
      return out.sort();
    }
  };

  /* ================= 명렬표 자료 (공개본에서 검증된 코드 그대로) ================= */
  var KEY = "tt_roster_v1";
  function uid(){ return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function byNo(a,b){ return a.no - b.no; }
  function toInt(v){ var n = parseInt(String(v == null ? "" : v).trim(), 10); return isFinite(n) ? n : null; }
  function clsOrder(a,b){
    var ag = a.grade == null ? 99 : a.grade, bg = b.grade == null ? 99 : b.grade;
    if(ag !== bg) return ag - bg;
    var ac = a.cls == null ? 99 : a.cls, bc = b.cls == null ? 99 : b.cls;
    if(ac !== bc) return ac - bc;
    return a.name < b.name ? -1 : 1;
  }

  function clean(d){
    var out = {v:1, current:"", home:"", classes:[]};
    if(d && Array.isArray(d.classes)){
      d.classes.forEach(function(c){
        if(!c) return;
        var st = [];
        (Array.isArray(c.students) ? c.students : []).forEach(function(s){
          if(!s) return;
          var no = parseInt(s.no,10);
          if(isFinite(no) && no >= 1) st.push({no:no, name:String(s.name == null ? "" : s.name).slice(0,20)});
        });
        out.classes.push({
          id:String(c.id || uid()), name:String(c.name || "우리 반").slice(0,30),
          grade:toInt(c.grade), cls:toInt(c.cls), students:st
        });
      });
    }
    if(!out.classes.length) out.classes.push({id:uid(), name:"우리 반", grade:null, cls:null, students:[]});
    function has(id){ return out.classes.some(function(c){ return c.id === id; }); }
    out.current = d && has(d.current) ? d.current : out.classes.slice().sort(clsOrder)[0].id;
    out.home = d && d.home && has(d.home) ? d.home : "";
    return out;
  }
  /* ================= 글(붙여넣기) 해석 ================= */
  var NOT_NUM = /[^\d\s.\-\/]/;
  function parseRoster(text){
    var out = [];
    String(text).replace(/\r/g,"").split("\n").forEach(function(line){
      line = line.trim();
      if(!line) return;
      var tok = line.split(/[\t,;]+|\s+/).map(function(t){ return t.trim().replace(/^"+|"+$/g,""); }).filter(Boolean);
      if(!tok.length) return;
      if(/^(번호|학년|학번|no\.?|number)$/i.test(tok[0])) return;   // 제목 줄은 건너뜀
      var g = null, c = null, no = null, i = 0, name = null;
      if(/^\d{1,2}$/.test(tok[0]) && /^\d{1,2}$/.test(tok[1] || "") && /^\d{1,3}$/.test(tok[2] || "") && tok[3] && NOT_NUM.test(tok[3])){
        g = +tok[0]; c = +tok[1]; no = +tok[2]; i = 3;                // 학년 반 번호 이름
      } else if(/^\d{5}$/.test(tok[0])){
        g = +tok[0].charAt(0); c = +tok[0].slice(1,3); no = +tok[0].slice(3); i = 1;   // 학번(30301)
      } else if(/^\d{1,3}$/.test(tok[0])){
        no = +tok[0]; i = 1;                                           // 번호 이름
      }
      for(; i < tok.length; i++){ if(NOT_NUM.test(tok[i])){ name = tok[i]; break; } }
      if(!name) return;
      if(no == null) no = out.length ? out[out.length-1].no + 1 : 1;
      if(no < 1) return;
      out.push({g:g, c:c, no:no, name:name.slice(0,20)});
    });
    return out;
  }
  /* ================= 나이스 파일 읽기 ================= */
  function userErr(msg){ var e = new Error(msg); e.userMsg = msg; return e; }

  function decodeText(buf){
    try{ return new TextDecoder("utf-8", {fatal:true}).decode(buf); }
    catch(e){ try{ return new TextDecoder("euc-kr").decode(buf); }catch(e2){ return ""; } }
  }

  /* xlsx = zip 파일. 외부 도구 없이 브라우저 기능만으로 읽습니다. */
  function zipIndex(buf){
    var u8 = new Uint8Array(buf), dv = new DataView(buf), i = u8.length - 22, stop = Math.max(0, u8.length - 65557);
    while(i >= stop && dv.getUint32(i, true) !== 0x06054b50) i--;
    if(i < stop) throw userErr("엑셀(xlsx) 파일이 아니거나 손상된 파일입니다.");
    var cnt = dv.getUint16(i + 10, true), p = dv.getUint32(i + 16, true), files = {};
    for(var k = 0; k < cnt; k++){
      if(dv.getUint32(p, true) !== 0x02014b50) break;
      var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
      var nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      var lho = dv.getUint32(p + 42, true);
      var name = new TextDecoder("utf-8").decode(u8.subarray(p + 46, p + 46 + nlen));
      var start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
      files[name] = {method:method, start:start, csize:csize};
      p += 46 + nlen + elen + clen;
    }
    return files;
  }
  async function inflateRaw(u8){
    if(typeof DecompressionStream === "undefined") throw userErr("이 브라우저에서는 엑셀 파일을 읽을 수 없습니다. 크롬이나 엣지 최신 버전을 사용해 주세요.");
    var stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  function siText(el){
    if(!el) return "";
    var s = "";
    Array.prototype.forEach.call(el.childNodes, function(n){
      if(n.nodeName === "t") s += n.textContent;
      else if(n.nodeName === "r"){ var t = n.getElementsByTagName("t")[0]; if(t) s += t.textContent; }
    });
    return s;
  }
  function colIndex(ref){
    var m = /^([A-Z]+)/i.exec(ref || ""); if(!m) return -1;
    var s = m[1].toUpperCase(), n = 0;
    for(var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n - 1;
  }
  async function readXlsx(buf, onlyFirst){
    var files = zipIndex(buf), u8 = new Uint8Array(buf);
    async function get(name){
      var f = files[name]; if(!f) return null;
      var raw = u8.subarray(f.start, f.start + f.csize);
      return new TextDecoder("utf-8").decode(f.method === 0 ? raw : await inflateRaw(raw));
    }
    var ss = [], sx = await get("xl/sharedStrings.xml");
    if(sx){
      var sis = new DOMParser().parseFromString(sx, "application/xml").getElementsByTagName("si");
      for(var i = 0; i < sis.length; i++) ss.push(siText(sis[i]));
    }
    var names = Object.keys(files).filter(function(n){ return /^xl\/worksheets\/[^\/]+\.xml$/.test(n); })
      .sort(function(a,b){ return (parseInt(a.replace(/\D/g,""),10) || 0) - (parseInt(b.replace(/\D/g,""),10) || 0); });
    if(!names.length) throw userErr("엑셀 파일에서 표를 찾지 못했습니다.");
    var rows = [];
    for(var n = 0; n < (onlyFirst ? 1 : names.length); n++){
      var xml = await get(names[n]);
      var rowEls = new DOMParser().parseFromString(xml, "application/xml").getElementsByTagName("row");
      for(var r = 0; r < rowEls.length; r++){
        var arr = [], cells = rowEls[r].getElementsByTagName("c");
        for(var k = 0; k < cells.length; k++){
          var c = cells[k], col = colIndex(c.getAttribute("r")); if(col < 0) col = arr.length;
          var t = c.getAttribute("t"), v = c.getElementsByTagName("v")[0], val = "";
          if(t === "s" && v) val = ss[parseInt(v.textContent, 10)] || "";
          else if(t === "inlineStr") val = siText(c.getElementsByTagName("is")[0]);
          else if(v) val = v.textContent;
          arr[col] = val;
        }
        for(var q = 0; q < arr.length; q++) if(arr[q] == null) arr[q] = "";
        if(arr.length) rows.push(arr);
      }
    }
    return rows;
  }

  /* opt.firstSheet: 엑셀의 첫 시트만 읽기 */
  async function fileToRows(file, opt){
    var buf = await file.arrayBuffer(), b = new Uint8Array(buf);
    if(b[0] === 0x50 && b[1] === 0x4B) return readXlsx(buf, !!(opt && opt.firstSheet));                          // xlsx (zip)
    if(b[0] === 0xD0 && b[1] === 0xCF && b[2] === 0x11 && b[3] === 0xE0)
      throw userErr("옛 엑셀 형식(.xls)은 읽을 수 없습니다. 엑셀에서 열어 '다른 이름으로 저장 → xlsx'로 저장한 뒤 올려 주세요.");
    var txt = decodeText(buf).replace(/^﻿/, "");
    if(/<table/i.test(txt)){                                                           // html 표 형식의 .xls
      var doc = new DOMParser().parseFromString(txt, "text/html"), rows = [];
      Array.prototype.forEach.call(doc.querySelectorAll("tr"), function(tr){
        rows.push(Array.prototype.map.call(tr.querySelectorAll("th,td"), function(td){ return td.textContent.trim(); }));
      });
      return rows;
    }
    return txt.replace(/\r/g,"").split("\n").map(function(l){ return l.indexOf("\t") >= 0 ? l.split("\t") : l.split(","); });
  }

  /* 표(행·열) → 학생 목록. 열 제목(학년·반·번호·성명)을 찾아 읽고, 못 찾으면 줄 단위로 해석합니다. */
  function rowsToItems(rows){
    var h = -1, map = {}, r, items = [];
    for(r = 0; r < Math.min(rows.length, 20); r++){
      var m = {};
      rows[r].forEach(function(v, ci){
        var t = String(v == null ? "" : v).replace(/\s+/g, "");
        if(t === "학년") m.g = ci;
        else if(t === "반" || t === "학급") m.c = ci;
        else if(t === "번호" || t === "학생번호") m.no = ci;
        else if(/^(성명|이름|학생명|학생이름)$/.test(t)) m.nm = ci;
        else if(t === "학번" || t === "학생학번") m.hb = ci;
      });
      if(m.nm != null && (m.no != null || m.hb != null)){ h = r; map = m; break; }
    }
    if(h < 0){
      rows.forEach(function(row){ parseRoster(row.join("\t")).forEach(function(it){ items.push(it); }); });
      return items;
    }
    var dg = null, dc = null;
    for(r = 0; r < h; r++){                                   // 제목 줄의 "3학년 3반"
      var mm = /(\d{1,2})\s*학년\s*(\d{1,2})\s*반/.exec(rows[r].join(" "));
      if(mm){ dg = +mm[1]; dc = +mm[2]; }
    }
    for(r = h + 1; r < rows.length; r++){
      var row = rows[r], name = String(row[map.nm] == null ? "" : row[map.nm]).trim();
      if(!name || /^\d+$/.test(name)) continue;
      var g = null, c = null, no = null;
      if(map.hb != null){
        var hb = String(row[map.hb] == null ? "" : row[map.hb]).trim();
        if(/^\d{5}$/.test(hb)){ g = +hb.charAt(0); c = +hb.slice(1,3); no = +hb.slice(3); }
      }
      if(map.g != null && toInt(row[map.g]) != null) g = toInt(row[map.g]);
      if(map.c != null && toInt(row[map.c]) != null) c = toInt(row[map.c]);
      if(map.no != null && toInt(row[map.no]) != null) no = toInt(row[map.no]);
      if(g == null) g = dg;
      if(c == null) c = dc;
      if(no == null || no < 1) continue;
      items.push({g:g, c:c, no:no, name:name.slice(0,20)});
    }
    return items;
  }
  var roster = {
    KEY: KEY, clean: clean, clsOrder: clsOrder, byNo: byNo,
    parseText: parseRoster, rowsToItems: rowsToItems,
    /* 저장된 명렬표 전체. {v, current, home, classes:[{id,name,grade,cls,students:[{no,name}]}]} */
    load: function(){ return clean(store.get(KEY, null)); },
    save: function(d){ return store.set(KEY, d); },
    /* 학급 목록(학년·반 순서) */
    classes: function(d){ return (d || roster.load()).classes.slice().sort(clsOrder); },
    /* 우리 반(담임). 지정하지 않았으면 null */
    home: function(d){ d = d || roster.load(); return d.classes.filter(function(c){ return c.id === d.home; })[0] || null; },
    /* 명단이 한 명이라도 있는지 */
    has: function(d){ return (d || roster.load()).classes.some(function(c){ return c.students.length > 0; }); }
  };

  /* ================= 자주 쓰는 기능 ================= */
  function download(name, text, mime){
    var a = document.createElement("a");
    a.href = URL.createObjectURL(text instanceof Blob ? text : new Blob([text], {type:mime}));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function today(){ var d = new Date(); return d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()); }
  function safe(s){ return String(s).replace(/[\\\/:*?"<>|]+/g, "_"); }
  function csvCell(v){ v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v; }
  var util = { uid: uid, clone: clone, toInt: toInt, decodeText: decodeText, download: download, today: today, safe: safe, csvCell: csvCell };

  /* ================= 알림·대화상자 ================= */
  var toastTimer;
  function el(tag, cls, text){ var e = document.createElement(tag); if(cls) e.className = cls; if(text != null) e.textContent = text; return e; }
  function dialog(){
    var d = el("dialog"), f = el("form");
    d.appendChild(f); document.body.appendChild(d);
    d.addEventListener("close", function(){ d.remove(); });
    return {d: d, f: f};
  }
  function actions(f, okLabel, onCancel){
    var a = el("div", "acts"), r = el("div", "r");
    var c = el("button", "btn", "취소"); c.type = "button"; c.onclick = onCancel;
    var o = el("button", "btn primary", okLabel || "확인"); o.type = "submit";
    r.appendChild(c); r.appendChild(o); a.appendChild(el("span")); a.appendChild(r); f.appendChild(a);
  }
  var ui = {
    /* 아래쪽 알림. undo 함수를 주면 "되돌리기" 버튼이 붙습니다. */
    toast: function(msg, undo){
      var t = document.getElementById("tt-toast");
      if(!t){ t = el("div"); t.id = "tt-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
      t.textContent = ""; t.appendChild(el("span", "", msg));
      if(undo){
        var b = el("button", "", "되돌리기"); b.type = "button";
        b.onclick = function(){ undo(); t.hidden = true; }; t.appendChild(b);
      }
      t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function(){ t.hidden = true; }, 8000);
    },
    confirm: function(title, msg, okLabel, cb){
      var x = dialog();
      x.f.appendChild(el("h2", "", title)); x.f.appendChild(el("p", "", msg));
      actions(x.f, okLabel, function(){ x.d.close(); });
      x.f.addEventListener("submit", function(e){ e.preventDefault(); x.d.close(); if(cb) cb(); });
      x.d.showModal();
    },
    prompt: function(title, init, placeholder, cb, onClose){
      var x = dialog(), inp = el("input");
      inp.type = "text"; inp.maxLength = 30; inp.autocomplete = "off"; inp.value = init || ""; inp.placeholder = placeholder || "";
      x.f.appendChild(el("h2", "", title)); x.f.appendChild(inp);
      actions(x.f, "확인", function(){ x.d.close(); });
      x.f.addEventListener("submit", function(e){ e.preventDefault(); var v = inp.value.trim(); if(!v) return; x.d.close(); if(cb) cb(v); });
      if(onClose) x.d.addEventListener("close", onClose);
      x.d.showModal(); setTimeout(function(){ inp.focus(); inp.select(); }, 0);
    },
    /* 학급 고르기: <select>에 명렬표의 학급을 채웁니다. 처음에는 지난번 고른 반, 없으면 우리 반.
       tool = 도구 이름(지난번 고른 반을 도구별로 기억), onChange(학급 또는 null) */
    classSelect: function(sel, tool, onChange){
      var KEYUI = "tt_ui_v1";
      function fill(){
        var d = roster.load(), list = roster.classes(d).filter(function(c){ return c.students.length > 0; });
        var ui0 = store.get(KEYUI, {}) || {}, want = (ui0.last || {})[tool];
        if(!list.some(function(c){ return c.id === want; })) want = (roster.home(d) && roster.home(d).students.length ? d.home : (list[0] || {}).id) || "";
        sel.textContent = "";
        if(!list.length){ var o0 = el("option", "", "명단 없음 · 명렬표에 나이스 파일을 올려 주세요"); o0.value = ""; sel.appendChild(o0); }
        list.forEach(function(c){
          var o = el("option", "", (c.id === d.home ? "★ " : "") + c.name + " (" + c.students.length + "명)"); o.value = c.id; sel.appendChild(o);
        });
        sel.value = want;
        return list.filter(function(c){ return c.id === want; })[0] || null;
      }
      var cur = fill();
      sel.addEventListener("change", function(){
        var u = store.get(KEYUI, {}) || {}; u.last = u.last || {}; u.last[tool] = sel.value; store.set(KEYUI, u);
        cur = fill(); onChange(cur);
      });
      window.addEventListener("storage", function(e){ if(e.key === KEY){ cur = fill(); onChange(cur); } });
      onChange(cur);
      return { current: function(){ return cur; } };
    },
    /* 명단이 없을 때 보여 줄 안내 (명렬표로 가는 버튼 포함) */
    needRoster: function(host){
      host.textContent = "";
      var box = el("div", "tt-empty");
      box.appendChild(el("div", "big", "👥"));
      box.appendChild(el("div", "", "먼저 학급 명렬표에 나이스 학생 명단 파일을 올려 주세요."));
      var a = el("a", "btn primary", "학급 명렬표 열기"); a.href = BASE + "apps/roster/"; box.appendChild(a);
      host.appendChild(box);
    },
    /* 저장이 안 되는 브라우저(사생활 보호 모드 등)일 때 화면 위에 경고를 띄웁니다. */
    warnStore: function(){
      if(document.querySelector(".tt-warn") || !document.body) return;
      var w = el("div", "tt-warn", "⚠ 이 브라우저에서는 저장이 되지 않습니다(사생활 보호 모드 등). 입력한 내용은 창을 닫으면 사라지니, 꼭 백업을 저장하세요.");
      var h = document.querySelector("header");
      if(h && h.parentNode) h.parentNode.insertBefore(w, h.nextSibling); else document.body.insertBefore(w, document.body.firstChild);
    }
  };

  /* ================= ZIP 만들기 (여러 파일을 하나로 묶어 내려받기. 압축 없이 묶기만 합니다) ================= */
  var crcTable = null;
  function crc32(u8){
    if(!crcTable){
      crcTable = new Uint32Array(256);
      for(var n = 0; n < 256; n++){ var c = n; for(var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); crcTable[n] = c >>> 0; }
    }
    var crc = 0xFFFFFFFF;
    for(var i = 0; i < u8.length; i++) crc = crcTable[(crc ^ u8[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  /* files: [{name:"홍길동(1).jpg", data:Uint8Array}] → Blob */
  function makeZip(files){
    var enc = new TextEncoder(), parts = [], cd = [], off = 0, cdSize = 0, d = new Date();
    var dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function(f){
      var nm = enc.encode(f.name), len = f.data.length, crc = crc32(f.data);
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);   // 0x0800 = 파일 이름이 UTF-8
      h.setUint16(10, dosTime, true); h.setUint16(12, dosDate, true); h.setUint32(14, crc, true);
      h.setUint32(18, len, true); h.setUint32(22, len, true); h.setUint16(26, nm.length, true);
      parts.push(h.buffer, nm, f.data);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
      c.setUint16(12, dosTime, true); c.setUint16(14, dosDate, true); c.setUint32(16, crc, true);
      c.setUint32(20, len, true); c.setUint32(24, len, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
      cd.push(c.buffer, nm); off += 30 + nm.length + len; cdSize += 46 + nm.length;
    });
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, cdSize, true); e.setUint32(16, off, true);
    return new Blob(parts.concat(cd, [e.buffer]), {type:"application/zip"});
  }

  /* ================= 전체 백업 (모든 도구의 자료를 파일 하나로) ================= */
  var backup = {
    make: function(){
      var data = {};
      store.keys().forEach(function(k){ data[k] = store.raw(k); });
      return {app:"teacher-tools", v:1, saved:new Date().toISOString(), data:data};
    },
    save: function(){
      var b = backup.make();
      download("선생님도구_전체백업_" + today() + ".json", JSON.stringify(b, null, 1), "application/json");
      store.setRaw("tt_last_backup", new Date().toISOString());
      ui.toast("모든 도구의 자료를 백업 파일 하나로 저장했습니다. 다운로드 폴더를 확인하세요.");
    },
    /* 마지막으로 백업한 뒤 지난 날 수. 한 번도 안 했으면 null */
    daysSince: function(){
      var s = store.raw("tt_last_backup"), t = s ? Date.parse(s) : NaN;
      return isFinite(t) ? Math.max(0, Math.floor((Date.now() - t) / 86400000)) : null;
    },
    /* 저장된 자료가 하나라도 있는지 (설정값 제외) */
    hasData: function(){
      return store.keys().some(function(k){ return k !== "tt_mode" && k !== "tt_last_backup" && k.indexOf("tt_board") !== 0; });   // 업무판 설정만 있을 때는 백업 알림 안 함
    },
    /* 새 학년 시작: 전체 백업을 파일로 저장한 뒤 모든 도구의 자료를 비웁니다. */
    newYear: function(done){
      ui.confirm("새 학년 시작",
        "지금까지의 자료(명렬표, 출결, 상담 기록 등)를 백업 파일 하나로 저장한 뒤, 이 기기의 자료를 모두 비웁니다. 비운 뒤에는 새 학년 나이스 명단을 올려 다시 시작합니다.",
        "백업 저장 후 비우기", function(){
          backup.save();
          setTimeout(function(){
            store.keys().forEach(function(k){ if(k !== "tt_mode" && k.indexOf("tt_board") !== 0) store.remove(k); });   // 학교 업무판 연결은 새 학년에도 유지
            ui.toast("지난 학년 자료를 비웠습니다. 백업 파일은 다운로드 폴더에 있습니다.");
            if(done) done();
          }, 600);
        });
    },
    /* 백업 내용 읽기. 예전 명렬표 전용 백업도 받습니다. 잘못된 파일이면 null */
    read: function(text){
      var o; try{ o = JSON.parse(String(text).replace(/^﻿/, "")); }catch(e){ return null; }
      if(!o || typeof o !== "object") return null;
      if(o.app === "teacher-tools" && o.data && typeof o.data === "object"){
        var data = {};
        Object.keys(o.data).forEach(function(k){ if(k.indexOf("tt_") === 0 && typeof o.data[k] === "string") data[k] = o.data[k]; });
        return Object.keys(data).length ? {data:data, saved:o.saved || ""} : null;
      }
      if(Array.isArray(o.classes)){ var d = {}; d[KEY] = JSON.stringify(clean(o)); return {data:d, saved:"", rosterOnly:true}; }
      return null;
    },
    apply: function(b){
      Object.keys(b.data).forEach(function(k){ store.setRaw(k, b.data[k]); });
    },
    /* 파일을 골라 불러오기. 끝나면 done()을 부릅니다. */
    pick: function(done){
      var inp = el("input"); inp.type = "file"; inp.accept = ".json,application/json"; inp.hidden = true;
      document.body.appendChild(inp);
      inp.addEventListener("change", function(){
        var f = inp.files && inp.files[0]; inp.remove(); if(!f) return;
        f.arrayBuffer().then(function(buf){
          var b = backup.read(decodeText(buf));
          if(!b){ ui.toast("백업 파일이 아니거나 읽을 수 없습니다."); return; }
          var n = Object.keys(b.data).length;
          ui.confirm("백업 불러오기",
            b.rosterOnly ? "백업의 명렬표로 현재 명렬표 전체를 바꿉니다."
                         : "백업에 들어 있는 자료 " + n + "가지로 지금 자료를 바꿉니다." + (b.saved ? " (백업한 날: " + b.saved.slice(0,10) + ")" : ""),
            "불러오기", function(){ backup.apply(b); ui.toast("백업을 불러왔습니다."); if(done) done(); });
        });
      });
      inp.click();
    }
  };

  /* ================= 설치·오프라인 ================= */
  if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener("load", function(){ navigator.serviceWorker.register(BASE + "sw.js", {scope: BASE}).catch(function(){}); });
  }
  if(!canStore){ if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", ui.warnStore); else ui.warnStore(); }

  /* ---------- 도구 이동 메뉴 ----------
     각 도구 화면(apps/…)에 자동으로 붙습니다. 도구 목록은 shared/tools.js 를 그대로 씁니다.
     넓은 화면: 왼쪽에 고정된 세로 메뉴(한 번에 다른 도구로 이동)
     좁은 화면(휴대폰): "☰ 도구" 버튼을 누르면 도구 목록이 아래에서 올라옵니다. */
  (function(){
    var m = location.pathname.match(/\/apps\/([^\/]+)\/(?:index\.html)?$/);
    if(!m) return;
    var here = m[1];
    var WIDE = "(min-width:900px) and (min-height:460px)";
    var CSS = ":root{--tt-rail:68px}"
      + ".tt-rail,.tt-navbtn{display:none}"
      + ".tt-ri{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:10px;text-decoration:none;color:#5b6773;text-align:center;font-family:'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif}"
      + ".tt-ri span{font-size:20px;line-height:1}"
      + ".tt-ri b{font-size:10.5px;font-weight:700;line-height:1.15;word-break:keep-all}"
      + ".tt-ri:hover{background:#e6f0fa;color:#2f6fb5}"
      + ".tt-ri.on{background:#2f6fb5;color:#fff}"
      + ".tt-ri:focus-visible{outline:3px solid #7fb0e6;outline-offset:1px}"
      + "@media " + WIDE + "{"
      +   "html.tt-hasnav body{margin-left:var(--tt-rail)!important}"
      +   "html.tt-hasnav .back,html.tt-hasnav .ttback{display:none!important}"
      +   "html.tt-hasnav .cta,html.tt-hasnav .tabs,html.tt-hasnav .dock{left:var(--tt-rail)!important}"
      +   ".tt-rail{display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;width:var(--tt-rail);z-index:15;background:#fff;border-right:1px solid #dde3ea;padding:6px 5px;gap:2px;overflow-y:auto;box-sizing:border-box}"
      +   ".tt-rail .tt-ri{flex:1 1 0;max-height:60px;min-height:38px}"
      +   ".tt-rail .home{flex:0 0 50px;border-bottom:1px solid #dde3ea;border-radius:10px 10px 0 0;margin-bottom:4px}"
      +   ".tt-rail .bd{flex:0 0 50px;border-top:1px solid #dde3ea;border-radius:0 0 10px 10px;margin-top:4px}"
      + "}"
      + "@media (max-width:899px),(max-height:459px){"
      +   "html.tt-hasnav .tt-navbtn{display:inline-block;font:inherit;font-size:12px;font-weight:700;border:1px solid currentColor;background:transparent;color:inherit;border-radius:999px;padding:1px 9px;margin-left:8px;cursor:pointer;opacity:.85;vertical-align:middle}"
      +   "html.tt-hasnav .ttback{display:inline-block}"
      + "}"
      + ".tt-sheet{position:fixed;inset:0;z-index:40;background:rgba(20,30,45,.45);display:flex;align-items:flex-end;justify-content:center}"
      + ".tt-sheet[hidden]{display:none!important}"
      + ".tt-sheet .in{background:#fff;width:min(520px,100%);border-radius:18px 18px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;box-sizing:border-box}"
      + ".tt-sheet h3{grid-column:1/-1;font-size:15px;margin:0 0 2px;color:#1d2733;font-family:'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}"
      + ".tt-sheet .tt-ri{min-height:66px;border:1px solid #dde3ea}"
      + ".tt-sheet .tt-ri b{font-size:12px}"
      + "@media print{.tt-rail,.tt-navbtn,.tt-sheet{display:none!important}html.tt-hasnav body{margin-left:0!important}}";
    function attr(v){ return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
    function items(){
      var subject = store.raw("tt_mode") === "subject";
      var h = '<a class="tt-ri home" href="' + BASE + '" title="도구 모음 첫 화면"><span>🧰</span><b>도구 모음</b></a>';
      TT_TOOLS.forEach(function(t){
        if(!t.ready || !t.href) return;                                   // 내려받는 PC 프로그램은 첫 화면에서
        if(subject && t.scope === "home" && t.id !== here) return;        // "교과만"이면 담임용 도구는 숨김
        var on = t.id === here;
        h += '<a class="tt-ri' + (on ? ' on' : '') + '" href="' + BASE + t.href + '" title="' + attr(t.name) + '"' + (on ? ' aria-current="page"' : '') + '><span>' + t.icon + '</span><b>' + attr(t.short || t.name) + '</b></a>';
      });
      var b = store.get("tt_board_v1", {}) || {};
      if(b.url && !b.hidden && /^https:\/\/script\.google\.com\//.test(b.url))
        h += '<a class="tt-ri bd" href="' + attr(b.url) + '" target="_blank" rel="noopener" title="학교 업무판 (새 창)"><span>📅</span><b>업무판</b></a>';
      return h;
    }
    function build(){
      var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
      document.documentElement.classList.add("tt-hasnav");
      var rail = document.createElement("nav"); rail.className = "tt-rail"; rail.setAttribute("aria-label", "도구 이동");
      rail.innerHTML = items(); document.body.appendChild(rail);
      var sheet = document.createElement("div"); sheet.className = "tt-sheet"; sheet.hidden = true;
      sheet.innerHTML = '<nav class="in" aria-label="도구 이동"><h3>다른 도구로 이동</h3>' + items() + "</nav>";
      document.body.appendChild(sheet);
      sheet.addEventListener("click", function(e){ if(e.target === sheet) sheet.hidden = true; });
      document.addEventListener("keydown", function(e){ if(e.key === "Escape") sheet.hidden = true; });
      Array.prototype.forEach.call(document.querySelectorAll(".back, .ttback"), function(a){
        var btn = document.createElement("button"); btn.type = "button"; btn.className = "tt-navbtn"; btn.textContent = "☰ 도구";
        btn.addEventListener("click", function(e){ e.preventDefault(); sheet.hidden = false; });
        a.parentNode.insertBefore(btn, a.nextSibling);
      });
    }
    function start(){
      if(typeof TT_TOOLS !== "undefined") return build();
      var s = document.createElement("script"); s.src = BASE + "shared/tools.js"; s.onload = build; document.head.appendChild(s);
    }
    if(document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  })();

  /* ---------- 내 시간표 (apps/timetable 에서 입력, "tt_timetable_v1") ----------
     slots: {"요일-교시": {code:"304", cls:304, subj:"수학"}}  (요일 1=월 … 5=금)
     periods: [{n:1, t:"08:50"}, …]  수업 길이는 45분으로 계산합니다. */
  var timetable = (function(){
    var KEY = "tt_timetable_v1", LEN = 45;
    function toMin(t){ var a = String(t).split(":"); return (+a[0]) * 60 + (+a[1]); }
    function hm(m){ return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
    function load(){ var t = store.get(KEY, null); return t && t.slots && Array.isArray(t.periods) ? t : null; }
    function day(date){
      var t = load(); date = date || new Date();
      var w = date.getDay(); if(!t || w < 1 || w > 5) return [];
      return t.periods.map(function(p){
        var s = t.slots[w + "-" + p.n]; if(!s) return null;
        var st = toMin(p.t);
        return {key: w + "-" + p.n, n: p.n, t: p.t, e: hm(st + LEN), start: st, end: st + LEN, code: s.code, cls: s.cls, subj: s.subj};
      }).filter(Boolean);
    }
    function nowMin(){ var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
    return {
      KEY: KEY, load: load, day: day,
      has: function(){ var t = load(); return !!(t && Object.keys(t.slots).length); },
      now: function(){ var m = nowMin(); return day().filter(function(s){ return m >= s.start && m < s.end; })[0] || null; },     // 지금 수업 중
      next: function(){ var m = nowMin(); return day().filter(function(s){ return s.start > m; })[0] || null; }                    // 오늘 남은 다음 수업
    };
  })();

  return { VERSION: VERSION, BASE: BASE, store: store, roster: roster, timetable: timetable, file: {toRows: fileToRows, readXlsx: readXlsx, userErr: userErr, zip: makeZip}, util: util, ui: ui, backup: backup };
})();
