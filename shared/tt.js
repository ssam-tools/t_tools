/* 선생님 도구 모음 · 공통 코드 (모든 도구가 함께 씁니다)
   TT.store   이 기기 브라우저에만 저장 (서버로 보내지 않음)
   TT.roster  학급 명렬표: 나이스 파일에서 만든 학년·반·번호·이름. 모든 도구가 같은 명단을 씁니다.
   TT.file    엑셀(xlsx)·CSV·표 파일을 기기 안에서 읽기
   TT.backup  모든 도구의 자료를 파일 하나로 저장하고 불러오기
   TT.ui      알림, 확인 창, 입력 창
   저장 이름 규칙: 반드시 "tt_"로 시작합니다. 그래야 전체 백업에 함께 들어갑니다. */
var TT = (function(){
  "use strict";
  var VERSION = "2.50.0";
  var BASE = (function(){                       // 도구 모음의 맨 위 주소 (shared 폴더의 한 칸 위)
    var s = document.currentScript && document.currentScript.src;
    try{ return new URL("../", s).href; }catch(e){ return "./"; }
  })();

  /* ================= 교실 기기(전자칠판) 보호 =================
     교실 기기로 정한 기기에서는 "수업 시작" 때 받은 자료를 창을 닫거나 20분 동안 쓰지 않으면 지웁니다.
     도구가 자료를 읽기 전에 실행되어야 해서 맨 앞에 둡니다. (자세한 동작은 shared/vault.js) */
  var classroom = (function(){
    var dev = null; try{ dev = localStorage.getItem("ttv_device"); }catch(e){}
    if(dev !== "classroom") return null;
    var ses = null; try{ ses = JSON.parse(sessionStorage.getItem("ttv_session")); }catch(e){}
    if(ses && ses.k && Date.now() - (ses.last || 0) < 20 * 60 * 1000 && !(ses.until && Date.now() > ses.until)){   // v2.10.0: 교시가 끝나도(until) 잠김
      ses.last = Date.now(); try{ sessionStorage.setItem("ttv_session", JSON.stringify(ses)); }catch(e){}
      return {locked:false, id:ses.id, name:ses.name || ses.id, mask:ses.mask !== false, until:ses.until || 0,
        setMask:function(on){ this.mask = !!on; try{ var x = JSON.parse(sessionStorage.getItem("ttv_session")); if(x){ x.mask = !!on; sessionStorage.setItem("ttv_session", JSON.stringify(x)); } }catch(e){} }};
    }
    try{
      var del = [];
      for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(k && k.indexOf("tt_") === 0 && k !== "tt_board_v1" && k !== "tt_mode") del.push(k); }
      del.forEach(function(k){ localStorage.removeItem(k); });
      sessionStorage.removeItem("ttv_session"); sessionStorage.removeItem("ttv_meta");
    }catch(e){}
    return {locked:true};
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
    toast: function(msg, undo, label, ms){   // v2.8.1: label = 단추 글자(기본 '되돌리기'), ms = 보이는 시간
      var t = document.getElementById("tt-toast");
      if(!t){ t = el("div"); t.id = "tt-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
      t.textContent = ""; t.appendChild(el("span", "", msg));
      if(undo){
        var b = el("button", "", label || "되돌리기"); b.type = "button";
        b.onclick = function(){ undo(); t.hidden = true; }; t.appendChild(b);
      }
      t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function(){ t.hidden = true; }, ms || 8000);
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
        if(!list.length){ var o0 = el("option", "", "명단 없음 · 명렬표 먼저"); o0.value = ""; sel.appendChild(o0); }
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
    /* PLAN_다듬기 4단계: 학생 고르기 창 (모든 도구 공통) — 출결처럼 반을 고르고 번호 칸을 누름.
       opt: {cls: 학급 id(없으면 우리 반), title, sel: 지금 고른 번호}, cb({cls: 학급, no, name}) */
    pickStudent: function(opt, cb){
      opt = opt || {};
      if(!document.getElementById("ttPkCss")){ var st = el("style"); st.id = "ttPkCss"; st.textContent = ".tt-pk{border:0;border-radius:18px;padding:14px 16px;width:min(760px,96vw);max-height:92vh;box-shadow:0 18px 50px rgba(20,40,70,.28);font-family:var(--t-font,'Malgun Gothic',system-ui,sans-serif);color:var(--t-ink,#1d2733);background:var(--t-card,#fff)}.tt-pk::backdrop{background:rgba(20,30,45,.4)}.tt-pk h3{font-size:17px;font-weight:800;margin:0 0 8px;display:flex;gap:8px;align-items:center}.tt-pk h3 button{margin-left:auto;font:inherit;font-size:13px;border:1px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:9px;padding:4px 10px;cursor:pointer}.tt-pk .cs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}.tt-pk .cs button{font:inherit;font-size:13.5px;font-weight:700;border:1px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:999px;padding:4px 12px;cursor:pointer;color:var(--t-sub,#5b6773)}.tt-pk .cs button.on{background:var(--t-accent,#2f6fb5);border-color:var(--t-accent,#2f6fb5);color:#fff}.tt-pk .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:6px;max-height:62vh;overflow:auto}.tt-pk .g button{font:inherit;border:1px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:12px;padding:8px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;color:var(--t-ink,#1d2733)}.tt-pk .g button small{font-size:11.5px;color:var(--t-sub,#5b6773);font-weight:700}.tt-pk .g button b{font-size:15.5px}.tt-pk .g button:hover,.tt-pk .g button.on{border-color:var(--t-accent,#2f6fb5);background:var(--t-accent-soft,#e6f0fa)}"; document.head.appendChild(st); }
      var d = roster.load(), list = roster.classes(d).filter(function(c){ return c.students.length > 0; }).sort(function(a, b){ return (b.id === d.home) - (a.id === d.home); });
      if(!list.length){ ui.toast("먼저 학급 명렬표에 학생 명단을 넣어 주세요."); return; }
      var cid = list.some(function(c){ return c.id === opt.cls; }) ? opt.cls : list[0].id;
      var dlg = el("dialog", "tt-pk"); dlg.setAttribute("aria-label", "학생 고르기"); document.body.appendChild(dlg);
      function draw(){
        var c = list.filter(function(x){ return x.id === cid; })[0];
        dlg.innerHTML = "<h3>👆 " + (opt.title || "학생 고르기") + '<button type="button" data-x>닫기 Esc</button></h3>'
          + (list.length > 1 ? '<div class="cs">' + list.map(function(x){ return '<button type="button" data-c="' + x.id + '" class="' + (x.id === cid ? "on" : "") + '">' + (x.id === d.home ? "★ " : "") + x.name.replace(/[<>&]/g, "") + "</button>"; }).join("") + "</div>" : "")
          + '<div class="g">' + c.students.slice().sort(byNo).map(function(s){ return '<button type="button" data-n="' + s.no + '" class="' + (String(s.no) === String(opt.sel) && c.id === opt.cls ? "on" : "") + '"><small>' + s.no + "번</small><b>" + String(s.name || "").replace(/[<>&]/g, "") + "</b></button>"; }).join("") + "</div>";
      }
      dlg.addEventListener("click", function(e){
        var t = e.target.closest ? e.target.closest("button") : null;
        if(e.target === dlg || (t && t.hasAttribute("data-x"))){ dlg.close(); return; }
        if(t && t.dataset.c){ cid = t.dataset.c; draw(); return; }
        if(t && t.dataset.n){ var c = list.filter(function(x){ return x.id === cid; })[0], s = c.students.filter(function(x){ return String(x.no) === t.dataset.n; })[0]; dlg.close(); if(cb) cb({cls: c, no: +t.dataset.n, name: s ? s.name : ""}); }
      });
      dlg.addEventListener("close", function(){ dlg.remove(); });
      draw(); dlg.showModal();
    },
    /* 명단이 없을 때 보여 줄 안내 (명렬표로 가는 버튼 포함) */
    needRoster: function(host){
      host.textContent = "";
      var box = el("div", "tt-empty");
      box.appendChild(el("div", "big", "👥"));
      var rn = typeof ttTool === "function" && ttTool("roster") ? ttTool("roster").name : "학급 명렬표";   // 도구 이름은 shared/tools.js 한 곳에서
      box.appendChild(el("div", "", "먼저 " + rn + "에 나이스 학생 명단 파일을 올려 주세요."));
      var a = el("a", "btn primary", rn + " 열기"); a.href = BASE + "apps/roster/"; box.appendChild(a);
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
      download("쌤노트_전체백업_" + today() + ".json", JSON.stringify(b, null, 1), "application/json");
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
        "지금까지의 자료(명렬표, 출결·상담, 학생 메모·기록 등)를 백업 파일 하나로 저장한 뒤, 이 기기의 자료와 학생 사진을 모두 비웁니다. 동기화를 켰다면 보관함에서도 지워집니다. 학교 이름·업무판 연결은 그대로 둡니다. 비운 뒤에는 새 학년 나이스 명단을 올려 다시 시작합니다.",
        "백업 저장 후 비우기", function(){
          backup.save();
          setTimeout(function(){
            store.keys().forEach(function(k){ if(k !== "tt_mode" && k !== "tt_school_v1" && k.indexOf("tt_board") !== 0) store.remove(k); });   // 학교 업무판 연결·학교 이름은 새 학년에도 유지
            photos.clear();                                                                    // 학생 사진도 지움
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

  /* v2.38.1 빠르게 열기: 도구 화면은 tt.js → (화면 다 읽은 뒤) 도구 목록 → 쌤비 파일 순서로 차례차례 받아 늦게 떴음.
     나중에 받을 파일을 지금 미리 받아 둠(실행 순서·내용은 그대로). 이미 화면에 들어 있으면 건너뜀 */
  (function(){
    try{
      if(!/\/apps\//.test(location.pathname) || window.top !== window) return;
      var L = ["shared/tools.js?v=" + VERSION];
      if(!document.querySelector('script[src*="shared/ssambi.js"]')) (document.querySelector('script[src*="shared/voice.js"]') ? [] : ["shared/voice.js"]).concat(["shared/sbart.js", "shared/sbbar.js", "shared/ssambi.js"]).forEach(function(f){ L.push(f + "?v=" + VERSION); });
      L.forEach(function(f){ var l = document.createElement("link"); l.rel = "preload"; l.as = "script"; l.href = BASE + f; (document.head || document.documentElement).appendChild(l); });
    }catch(e){}
  })();

  /* ================= 단축키 (PLAN_통일 3단계, shared/keys.js) ================= */
  (function(){ var g = document.createElement("script"); g.src = BASE + "g/schools.js?v=" + VERSION; (document.head || document.documentElement).appendChild(g); var g2 = document.createElement("script"); g2.src = BASE + "g/sites.js?v=" + VERSION; g2.onload = function(){ if(window.TT_SITES_SEED && TT_SITES_SEED() && window.TT_SBHOME && TT_SBHOME.render) try{ TT_SBHOME.render(); }catch(e){} }; (document.head || document.documentElement).appendChild(g2); })();   // v2.11.3 우리 학교 업무판 주소(기본값) — 기기 연결·업무판 연결 창에 미리 넣기
  (function(){ ["keys", "joy", "hidden", "wx", "favs"].concat(window.TTMeal || document.querySelector('script[src*="shared/meal.js"]') ? [] : ["meal"]).forEach(function(n){ var s = document.createElement("script"); s.src = BASE + "shared/" + n + ".js?v=" + VERSION; (document.head || document.documentElement).appendChild(s); }); })();   // joy = 재미 요소(PLAN_통일 6단계)

  /* ================= 설치·오프라인 ================= */
  if("serviceWorker" in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener("load", function(){ navigator.serviceWorker.register(BASE + "sw.js", {scope: BASE}).catch(function(){}); });
    /* v2.12.6 빠르게: 메뉴·도구에 마우스를 올리면(휴대폰은 손가락을 대면) 그 화면을 미리 받아 둠 → 누르면 바로
       누르는 순간 맨 위에 얇은 진행 줄을 띄워 "눌렸다"는 느낌을 바로 줌 */
    (function(){
      var warmed = {}, wT = 0;
      function link(t){
        var a = t && t.closest ? t.closest("a[href]") : null; if(!a || a.target === "_blank" || a.hasAttribute("download")) return null;
        var u; try{ u = new URL(a.href, location.href); }catch(e){ return null; }
        if(u.origin !== location.origin || u.pathname === location.pathname || /\/downloads\//.test(u.pathname) || !/\/$|\.html$/.test(u.pathname)) return null;
        return u;
      }
      function warm(u){
        var c = navigator.serviceWorker && navigator.serviceWorker.controller; if(!c || !u) return;
        var k = u.pathname, now = Date.now(); if(warmed[k] && now - warmed[k] < 60000) return; warmed[k] = now;
        try{ c.postMessage({warm: u.origin + u.pathname}); }catch(e){}
      }
      document.addEventListener("pointerover", function(e){ var u = link(e.target); if(!u) return; clearTimeout(wT); wT = setTimeout(function(){ warm(u); }, 60); }, true);
      document.addEventListener("touchstart", function(e){ warm(link(e.target)); }, {passive: true, capture: true});
      document.addEventListener("focusin", function(e){ warm(link(e.target)); }, true);
      var st = document.createElement("style");
      st.textContent = "html.tt-going::before{content:'';position:fixed;z-index:2147483000;top:0;left:0;height:3px;width:100%;background:var(--t-accent,#2f6fb5);transform-origin:0 50%;animation:ttGo 1.2s cubic-bezier(.2,.7,.2,1) forwards;pointer-events:none}@keyframes ttGo{from{transform:scaleX(0)}to{transform:scaleX(.9)}}@media (prefers-reduced-motion:reduce){html.tt-going::before{animation:none;transform:scaleX(.6)}}";
      (document.head || document.documentElement).appendChild(st);
      document.addEventListener("click", function(e){
        if(e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        var u = link(e.target); if(!u) return;
        setTimeout(function(){ if(!e.defaultPrevented) document.documentElement.classList.add("tt-going"); }, 0);
      });
      window.addEventListener("pageshow", function(){ document.documentElement.classList.remove("tt-going"); });
    })();
    /* v2.8.1 새 버전 알림: version.json 의 번호가 지금과 다르면 "새로고침" 단추 (처음 열 때 + 30분마다, 다른 화면 안에서는 안 함) */
    if(window.top === window){
      var verNum = function(v){ return String(v || "").split(".").map(function(x){ return ("000" + (parseInt(x, 10) || 0)).slice(-3); }).join("."); }, verTold = "";
      var verCheck = function(){
        if(navigator.onLine === false) return;
        fetch(BASE + "version.json?t=" + Date.now(), {cache: "no-store"}).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
          if(!j || !j.v || verNum(j.v) <= verNum(VERSION) || verTold === j.v) return; verTold = j.v;
          var go = function(){ try{ navigator.serviceWorker && navigator.serviceWorker.getRegistration && navigator.serviceWorker.getRegistration().then(function(g){ if(g) g.update(); }); }catch(e){} setTimeout(function(){ location.reload(); }, 300); };
          setTimeout(function(){ ui.toast("🦉 쌤 노트 새 버전(" + j.v + ")이 나왔어요" + (j.note ? " · " + j.note : ""), go, "새로고침", 60000); }, 2500);
        }).catch(function(){});
      };
      window.addEventListener("load", function(){ setTimeout(verCheck, 4000); setInterval(verCheck, 30 * 60 * 1000); });
    }
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
    document.documentElement.setAttribute("data-app", here);               // 공통 디자인 맞춤(shared/theme.css)
    (function(){ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "shared/theme.css"; document.head.appendChild(l); })();
    var WIDE = "(min-width:900px) and (min-height:460px)";
    var CSS = ":root{--tt-rail:84px}"
      + ".tt-rail,.tt-navbtn{display:none}"
      + ".tt-ri{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:10px;text-decoration:none;color:var(--t-sub,#5b6773);text-align:center;font-family:var(--t-font,'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif)}"
      + ".tt-ri span{font-size:20px;line-height:1}"
      + ".tt-ri b{font-size:10.5px;font-weight:700;line-height:1.15;word-break:keep-all}"
      + ".tt-ri:hover{background:var(--t-accent-soft,#e6f0fa);color:var(--t-accent,#2f6fb5)}"
      + ".tt-ri.on{background:var(--t-accent,#2f6fb5);color:var(--t-on,#fff)}"
      + ".tt-ri:focus-visible{outline:3px solid var(--t-focus,#7fb0e6);outline-offset:1px}"
      + "button.tt-ri{border:0;background:transparent;cursor:pointer;font-family:inherit;padding:0}"
      + ".tt-grp{display:flex;flex-direction:column;gap:2px;background:#eef4fb;border-radius:10px;padding:3px 0 3px}"
      + ".tt-gh{display:flex;flex-direction:column;align-items:center;color:var(--t-accent,#2f6fb5);padding:2px 0;font-family:var(--t-font,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif)}"
      + ".tt-gh span{font-size:18px;line-height:1}.tt-gh b{font-size:10.5px;font-weight:800}"
      + ".tt-ri.tt-sub{margin:0 3px;background:var(--t-card,#fff);border:1px solid #d6e3f1}"
      + ".tt-ri.tt-sub span{font-size:15px}.tt-ri.tt-sub b{font-size:9.5px}"
      + ".tt-ri.tt-sub.on{background:var(--t-accent,#2f6fb5);border-color:var(--t-accent,#2f6fb5)}"
      + ".tt-ri.tt-rec{color:var(--t-rec,#7a4fb5)}.tt-ri.tt-rec:hover{background:#f1eafb;color:var(--t-rec,#7a4fb5)}"
      + "@media " + WIDE + "{"
      +   "html.tt-hasnav body{margin-left:var(--tt-rail)!important}"
      +   "html.tt-hasnav .back,html.tt-hasnav .ttback{display:none!important}"
      +   "html.tt-hasnav .cta,html.tt-hasnav .tabs,html.tt-hasnav .dock{left:var(--tt-rail)!important}"
      /* 첫 화면 왼쪽 메뉴 막대(index.html .mnav)와 같은 너비·같은 단추 크기. 스크롤 없이 한 화면에 (개편 뒤 다듬기) */
      +   ".tt-rail{display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;width:var(--tt-rail);z-index:15;background:var(--t-card,#fff);border-right:1px solid var(--t-line,#dde3ea);padding:12px 8px;gap:4px;overflow:hidden;box-sizing:border-box}"
      +   ".tt-rail .tt-top{flex:0 0 64px;height:64px;border-radius:12px;gap:2px}"
      +   ".tt-rail .tt-top span{display:block;font-size:22px;line-height:26px;height:26px}"
      +   ".tt-rail .tt-top b{display:block;font-size:11.5px;font-weight:800;line-height:1.1;margin-top:3px}"
      +   ".tt-rail .tt-top:hover{background:var(--m-soft,var(--t-accent-soft,#e6f0fa));color:var(--m,var(--t-accent,#2f6fb5))}"
      +   ".tt-rail .tt-top.on{background:var(--m,var(--t-accent,#2f6fb5));color:var(--t-on,#fff)}"
      +   ".tt-rail .tt-top[data-menu=home]{--m:var(--t-now,#2f6fb5)}"
      +   ".tt-rail .tt-list{flex:1 1 0;min-height:0;display:grid;grid-template-columns:var(--tt-cols,1fr);grid-auto-rows:var(--tt-rh,34px);align-content:start;gap:2px;background:var(--m-soft,#eef4fb);border-radius:12px;padding:3px;margin:0 -4px;overflow:hidden}"
      +   ".tt-rail .tt-list .tt-ri{flex-direction:row;justify-content:flex-start;gap:3px;padding:0 3px;min-width:0;overflow:hidden;color:var(--t-ink,#1d2733)}"
      +   ".tt-rail .tt-list .tt-ri span{font-size:14px;flex:none}"
      +   ".tt-rail .tt-list .tt-ri b{font-size:10.5px;letter-spacing:-.02em;text-align:left;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}"
      +   ".tt-rail .tt-list .tt-ri:hover{background:var(--t-card,#fff);color:var(--m,var(--t-accent,#2f6fb5))}"
      +   ".tt-rail .tt-list .tt-ri.on{background:var(--m,var(--t-accent,#2f6fb5));color:var(--t-on,#fff)}"
      +   ".tt-rail .tt-list.c2 .tt-ri{justify-content:center;padding:0}.tt-rail .tt-list.c2 .tt-ri b{display:none}"
      +   ".tt-rail .tt-foot{flex:none;display:flex;flex-direction:column;gap:2px;border-top:1px solid var(--t-line,#dde3ea);padding-top:4px;margin:0 -4px}"
      +   ".tt-rail .tt-foot .tt-ri{flex-direction:row;justify-content:flex-start;gap:3px;height:34px;padding:0 3px;white-space:nowrap}"
      +   ".tt-rail .tt-foot .tt-ri span{font-size:15px}.tt-rail .tt-foot .tt-ri b{font-size:10.5px;font-weight:800;letter-spacing:-.02em}"
      +   ".tt-rail .tt-foot .tt-ri.on{background:var(--t-accent,#2f6fb5);color:var(--t-on,#fff)}"
      + "  .tt-rail.cf .tt-foot{flex-direction:row;justify-content:space-around}.tt-rail.cf .tt-foot .tt-ri{height:30px;flex:1 1 0;justify-content:center;padding:0}.tt-rail.cf .tt-foot .tt-ri b{display:none}"
      + "}"
      + "@media " + WIDE + " and (max-height:640px){"
      +   ".tt-rail{padding:8px 8px;gap:3px}.tt-rail .tt-top{flex-basis:50px;height:50px}.tt-rail .tt-top span{font-size:19px;line-height:22px;height:22px}.tt-rail .tt-top b{margin-top:1px}"
      +   ".tt-rail .tt-foot .tt-ri{height:30px}"
      + "}"
      + "@media (max-width:899px),(max-height:459px){"
      +   "html.tt-hasnav .tt-navbtn{display:inline-block;font:inherit;font-size:12px;font-weight:700;border:1px solid currentColor;background:transparent;color:inherit;border-radius:999px;padding:1px 9px;margin-left:8px;cursor:pointer;opacity:.85;vertical-align:middle}"
      +   "html.tt-hasnav .ttback{display:inline-block}"
      + "}"
      + ".tt-sheet{position:fixed;inset:0;z-index:40;background:rgba(20,30,45,.45);display:flex;align-items:flex-end;justify-content:center}"
      + ".tt-sheet[hidden]{display:none!important}"
      + ".tt-sheet .in{background:var(--t-card,#fff);width:min(520px,100%);border-radius:18px 18px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px));display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;box-sizing:border-box}"
      + ".tt-sheet h3{grid-column:1/-1;font-size:15px;margin:0 0 2px;color:var(--t-ink,#1d2733);font-family:var(--t-font,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif)}"
      + ".tt-sheet .tt-ri{min-height:66px;border:1px solid var(--t-line,#dde3ea)}.tt-sheet .in{max-height:88vh;overflow:auto}"
      + ".tt-sheet .tt-ri b{font-size:12px}"
      + ".tt-grp[data-menu]{background:var(--m-soft,#eef4fb)}.tt-grp[data-menu] .tt-gh{color:var(--m,var(--t-accent,#2f6fb5))}"
      + ".tt-sheet .tt-grp{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:6px}.tt-sheet .tt-gh{grid-column:1/-1;flex-direction:row;gap:6px;justify-content:flex-start;padding:0 4px}.tt-sheet .tt-ri.tt-sub{min-height:56px;margin:0}"
      + "@media print{.tt-rail,.tt-navbtn,.tt-sheet{display:none!important}html.tt-hasnav body{margin-left:0!important}}";
    function attr(v){ return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
    /* 개편 2단계: 메뉴(TT_MENUS) → 묶음 → 도구. 지금 메뉴는 펼쳐 모든 도구를, 다른 메뉴는 아이콘 하나(누르면 그 메뉴 첫 도구)로. all=true면 모두 펼침(좁은 화면 목록)
       '교과만' 선생님(학교·선생님 설정)에게는 우리 반 메뉴를 숨깁니다(지금 보고 있는 도구는 그대로 둠). */
    function items(all){
      var hereId = here === "tardy" && /[?&]tab=counsel/.test(location.search) ? "counsel" : here;
      var me = TT_TOOLS.filter(function(t){ return t.id === hereId; })[0], curMenu = me ? me.menu : null;
      function ok(t){ return t.ready && t.href && !(classroom && !t.room) && (!t.subject || t.id === hereId || typeof ttPackId !== "function" || (typeof ttPackOnly === "function" && !ttPackOnly()) || t.subject === ttPackId()); }   // 내려받는 프로그램은 첫 화면에서, 교실 기기는 수업용만, 교과 팩은 고른 교과만
      function shown(mid){ return mid === curMenu || typeof ttMenuShown !== "function" || ttMenuShown(mid); }
      function link(t, cls, label){
        var on = t.id === hereId;
        return '<a class="tt-ri' + cls + (on ? ' on' : '') + '" href="' + BASE + t.href + '" title="' + attr(t.name) + '"' + (on ? ' aria-current="page"' : '') + '><span>' + t.icon + '</span><b>' + attr(label) + '</b></a>';
      }
      var h = '<a class="tt-ri tt-home" href="' + BASE + '" title="첫 화면"><span>🍎</span><b>쌤 노트</b></a>';
      var MS = typeof TT_MENUS !== "undefined" ? TT_MENUS : [];
      MS.forEach(function(c){
        if(c.id === "home" || !shown(c.id)) return;
        var L = TT_TOOLS.filter(function(t){ return t.menu === c.id && ok(t); });
        if(!L.length) return;
        if(all || c.id === curMenu){
          h += '<div class="tt-grp" data-menu="' + attr(c.id) + '"><div class="tt-gh"><span>' + (c.icon === "⋯" ? "⚙️" : c.icon) + '</span><b>' + attr(c.name) + '</b></div>';
          L.forEach(function(t){ h += link(t, " tt-sub", t.short || t.name); });
          h += '</div>';
        } else h += '<a class="tt-ri" data-menu="' + attr(c.id) + '" href="' + BASE + (c.id === "settings" ? L[0].href : "#" + c.id) + '" title="' + attr(c.name + ": " + L.map(function(t){ return t.name; }).join(", ")) + '"><span>' + (c.icon === "⋯" ? "⚙️" : c.icon) + '</span><b>' + attr(c.name) + '</b></a>';
      });
      if(!classroom) h += '<button type="button" class="tt-ri tt-rec" data-tt="rec" title="학생 기록 한 줄 남기기 (생기부 자료)"><span>✍️</span><b>학생 기록</b></button>';
      var b = store.get("tt_board_v1", {}) || {};
      if(b.url && !b.hidden && /^https:\/\/script\.google\.com\//.test(b.url))
        h += '<a class="tt-ri tt-bd" href="' + attr(b.url) + '" target="_blank" rel="noopener" title="학교 업무판 (새 창)"><span>📅</span><b>업무판</b></a>';
      return h;
    }
    /* 넓은 화면 왼쪽 막대: 첫 화면 메뉴 막대와 똑같이 위에 홈·수업·우리 반·학생·학교(크기 고정),
       그 아래 지금 메뉴의 도구 목록(남은 높이에 맞춰 줄 높이를 정함, 스크롤 없음), 맨 아래 설정·학생 기록·업무판 */
    var NAVM = ["home", "class", "homeroom", "student", "school"];
    function railItems(){
      var hereId = here === "tardy" && /[?&]tab=counsel/.test(location.search) ? "counsel" : here;
      var me = TT_TOOLS.filter(function(t){ return t.id === hereId; })[0], curMenu = me ? me.menu : null;
      function ok(t){ return t.ready && t.href && !(classroom && !t.room) && (!t.subject || t.id === hereId || typeof ttPackId !== "function" || (typeof ttPackOnly === "function" && !ttPackOnly()) || t.subject === ttPackId()); }
      function shown(mid){ return mid === curMenu || typeof ttMenuShown !== "function" || ttMenuShown(mid); }
      function tools(mid){ return TT_TOOLS.filter(function(t){ return t.menu === mid && ok(t); }); }
      function M(id){ return typeof ttMenu === "function" ? ttMenu(id) : null; }
      var h = "";
      NAVM.forEach(function(id){
        var m = M(id); if(!m) return;
        if(id !== "home" && (!shown(id) || !tools(id).length)) return;
        var on = id === curMenu;
        h += '<a class="tt-ri tt-top' + (on ? ' on' : '') + '" data-menu="' + id + '" href="' + BASE + (id === "home" ? "" : "#" + id) + '" title="' + attr(m.name) + '"><span>' + m.icon + '</span><b>' + attr(m.name) + '</b></a>';
      });
      var L = curMenu ? tools(curMenu) : [];
      if(L.length){
        h += '<div class="tt-list" data-menu="' + attr(curMenu) + '" role="group" aria-label="' + attr((M(curMenu) || {}).name || "") + ' 도구">';
        L.forEach(function(t){
          var on = t.id === hereId;
          h += '<a class="tt-ri' + (on ? ' on' : '') + '" href="' + BASE + t.href + '" title="' + attr(t.name) + '"' + (on ? ' aria-current="page"' : '') + '><span>' + t.icon + '</span><b>' + attr(t.short || t.name) + '</b></a>';
        });
        h += '</div>';
      } else h += '<i style="flex:1"></i>';
      h += '<div class="tt-foot">';
      var S = tools("settings");
      if(S.length) h += '<a class="tt-ri' + (curMenu === "settings" ? ' on' : '') + '" href="' + BASE + '#settings" title="설정: 학교·선생님 설정, 화면 꾸미기, 학기초 세팅 파일, 백업"><span>⚙️</span><b>설정</b></a>';
      if(!classroom) h += '<button type="button" class="tt-ri tt-rec" data-tt="rec" title="학생 기록 한 줄 남기기 (생기부 자료)"><span>✍️</span><b>학생 기록</b></button>';
      var b = store.get("tt_board_v1", {}) || {};
      if(b.url && !b.hidden && /^https:\/\/script\.google\.com\//.test(b.url))
        h += '<a class="tt-ri tt-bd" href="' + attr(b.url) + '" target="_blank" rel="noopener" title="학교 업무판 (새 창)"><span>📅</span><b>업무판</b></a>';
      return h + '</div>';
    }
    /* 도구 목록 줄 높이: 한 줄에 하나(아이콘+이름)로 들어가면 그렇게, 모자라면 두 줄(아이콘만, 이름은 마우스를 올리면) */
    function fitRail(rail){
      var list = rail.querySelector(".tt-list"); if(!list) return;
      var n = list.children.length, G = 2;
      function one(){ return (list.clientHeight - 6 - (n - 1) * G) / n; }
      rail.classList.remove("cf");
      if(one() < 26) rail.classList.add("cf");   // 자리가 모자라면 맨 아래(설정·학생 기록·동기화)를 아이콘 한 줄로
      var o = one();
      if(o >= 26){ list.classList.remove("c2"); list.style.setProperty("--tt-cols", "1fr"); list.style.setProperty("--tt-rh", Math.floor(Math.min(40, o)) + "px"); return; }
      var r = Math.ceil(n / 2), two = (list.clientHeight - 6 - (r - 1) * G) / r;
      list.classList.add("c2"); list.style.setProperty("--tt-cols", "1fr 1fr"); list.style.setProperty("--tt-rh", Math.floor(Math.max(18, Math.min(40, two))) + "px");
    }
    /* 바뀐 도구 이름(tools.js 의 old → name)을 도구 화면 제목(h1·창 제목)에 반영합니다. 도구 파일은 고치지 않습니다. */
    function rename(){
      var t = TT_TOOLS.filter(function(x){ return x.id === here; })[0];
      if(!t || !t.old || t.old === t.name) return;
      if(document.title.indexOf(t.old) === 0) document.title = t.name + document.title.slice(t.old.length);
      var h1 = document.querySelector("header h1, h1");
      if(h1) Array.prototype.forEach.call(h1.childNodes, function(n){ if(n.nodeType === 3 && n.nodeValue.indexOf(t.old) >= 0) n.nodeValue = n.nodeValue.replace(t.old, t.name); });
    }
    function build(){
      try{ rename(); }catch(e){}
      if(window.top !== window){ document.documentElement.classList.add("sbReady"); return; }   // v2.3: 학교 업무판의 문서 칸처럼 다른 화면 안에 열리면 메뉴 막대 없이
      var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
      document.documentElement.classList.add("tt-hasnav");
      var rail = document.createElement("nav"); rail.className = "tt-rail"; rail.setAttribute("aria-label", "도구 이동");
      rail.innerHTML = railItems(); document.body.appendChild(rail);
      fitRail(rail); var fT; window.addEventListener("resize", function(){ clearTimeout(fT); fT = setTimeout(function(){ fitRail(rail); }, 80); });
      if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fitRail(rail); });
      var sheet = document.createElement("div"); sheet.className = "tt-sheet"; sheet.hidden = true;
      sheet.innerHTML = '<nav class="in" aria-label="도구 이동"><h3>다른 도구로 이동</h3>' + items(true) + "</nav>";
      document.body.appendChild(sheet);
      sheet.addEventListener("click", function(e){ if(e.target === sheet) sheet.hidden = true; });
      document.addEventListener("keydown", function(e){ if(e.key === "Escape") sheet.hidden = true; });
      document.addEventListener("click", function(e){ var r = e.target.closest && e.target.closest("[data-tt=rec]"); if(r){ sheet.hidden = true; notes.quick({}); } });
      Array.prototype.forEach.call(document.querySelectorAll(".back, .ttback"), function(a){
        var btn = document.createElement("button"); btn.type = "button"; btn.className = "tt-navbtn"; btn.textContent = "☰ 도구";
        btn.addEventListener("click", function(e){ e.preventDefault(); sheet.hidden = false; });
        a.parentNode.insertBefore(btn, a.nextSibling);
      });
      /* v1.10.1: 도구 화면에도 쌤비(오른쪽 아래 둥근 캐릭터 · Alt+B). 교실 기기 모드에서는 숨김 */
      if(!classroom && !window.TT_SSAMBI && !document.getElementById("sbBtn")) (function(){
        /* v2.12.2 빨라지게: 예전에는 voice → sbart → sbbar → ssambi 를 하나씩 차례로 받아 화면이 늦게 떴음.
           이제 한꺼번에 받고(async=false 라서 실행 순서는 그대로), 주소에 버전(?v=)을 붙여 저장본을 바로 씀(sw.js) */
        function add(src){ var s = document.createElement("script"); s.src = BASE + src + "?v=" + VERSION; s.async = false; document.head.appendChild(s); }
        (window.TTVoice ? [] : ["shared/voice.js"]).concat(["shared/sbart.js", "shared/sbbar.js", "shared/ssambi.js"]).forEach(add);   // v2.0.1: 쌤비 홈 디자인이면 위쪽 고정 줄(shared/sbbar.js)
      })();
    }
    /* 교과 팩(subjects/*.js)까지 불러온 뒤 그림. 도구 화면에서는 모든 팩을 불러 지금 도구가 어느 팩 것이든 메뉴에 보이게 */
    function withPack(){ if(typeof ttPackLoad === "function") ttPackLoad(BASE, build, true); else build(); }
    function start(){
      if(typeof TT_TOOLS !== "undefined" && typeof TT_MENUS !== "undefined" && typeof ttPackLoad === "function") return withPack();
      var s = document.createElement("script"); s.src = BASE + "shared/tools.js?v=" + VERSION + (typeof TT_TOOLS !== "undefined" ? "." + Date.now() : "");   // 예전 목록이 남아 있으면 새로 받음
      s.onload = withPack; s.onerror = build; document.head.appendChild(s);
    }
    if(document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  })();

  /* ---------- 내 시간표 (apps/timetable 에서 입력, "tt_timetable_v1") ----------
     slots: {"요일-교시": {code:"304", cls:304, subj:"수학"}}  (요일 1=월 … 5=금)  ← 기본 시간표(학기 내내)
     weeks: {"2026-11-16"(그 주 월요일): {slots:{…}, at}}  ← 수업 교체로 그 주에만 바뀐 시간표(14단계). 기본 시간표는 그대로 둡니다.
     periods: [{n:1, t:"08:50"}, …]  수업 길이는 45분으로 계산합니다. */
  var timetable = (function(){
    var KEY = "tt_timetable_v1", LEN = 45;
    function toMin(t){ var a = String(t).split(":"); return (+a[0]) * 60 + (+a[1]); }
    function hm(m){ return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
    function load(){ var t = store.get(KEY, null); return t && t.slots && Array.isArray(t.periods) ? t : null; }
    function ymdOf(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
    function monday(date){ var d = new Date(date || new Date()); d = new Date(d.getFullYear(), d.getMonth(), d.getDate()); var w = d.getDay(); d.setDate(d.getDate() - (w === 0 ? 6 : w - 1)); return ymdOf(d); }
    function same(a, b){ return !a && !b || !!(a && b && a.code === b.code && (a.subj || "") === (b.subj || "")); }
    function weekSlots(t, mon){ var w = t && t.weeks && t.weeks[mon]; return w && w.slots ? w.slots : (t ? t.slots : {}); }
    function day(date){
      var t = load(); date = date || new Date();
      var w = date.getDay(); if(!t || w < 1 || w > 5) return [];
      var mon = monday(date), S = weekSlots(t, mon), changed = S !== t.slots;
      return t.periods.map(function(p){
        var k = w + "-" + p.n, s = S[k]; if(!s) return null;
        var st = toMin(p.t);
        return {key: k, n: p.n, t: p.t, e: hm(st + LEN), start: st, end: st + LEN, code: s.code, cls: s.cls, subj: s.subj, chg: changed && !same(s, t.slots[k])};
      }).filter(Boolean);
    }
    function nowMin(){ var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
    return {
      KEY: KEY, load: load, day: day, monday: monday, same: same,
      has: function(){ var t = load(); return !!(t && Object.keys(t.slots).length); },
      now: function(){ var m = nowMin(); return day().filter(function(s){ return m >= s.start && m < s.end; })[0] || null; },     // 지금 수업 중
      next: function(){ var m = nowMin(); return day().filter(function(s){ return s.start > m; })[0] || null; },                  // 오늘 남은 다음 수업
      /* 그 주 시간표 (바뀐 게 없으면 기본 시간표) */
      week: function(mon){ return weekSlots(load(), mon); },
      changed: function(mon){ var t = load(); return !!(t && t.weeks && t.weeks[mon]); },
      /* 그 주에만 바꾸기. 기본과 같아지면 지움. 5주 지난 기록은 정리 */
      setWeek: function(mon, slots){
        var t = load(); if(!t) return false;
        var diff = Object.keys(slots).concat(Object.keys(t.slots)).some(function(k){ return !same(slots[k], t.slots[k]); });
        t.weeks = t.weeks || {};
        if(diff) t.weeks[mon] = {slots: slots, at: Date.now()}; else delete t.weeks[mon];
        var old = monday(new Date(Date.now() - 35 * 86400000));
        Object.keys(t.weeks).forEach(function(k){ if(k < old) delete t.weeks[k]; });
        t.weekAt = Date.now(); return store.set(KEY, t);
      },
      clearWeek: function(mon){ var t = load(); if(!t || !t.weeks) return; delete t.weeks[mon]; t.weekAt = Date.now(); store.set(KEY, t); }
    };
  })();

  /* 보관함 동기화 화면(설정창·교실 모드·상태 표시)은 따로 불러옵니다 */
  /* ---------- 학교·선생님 설정 ("tt_school_v1") ----------
     학교 이름은 여기 한 곳에만 넣으면 첫 화면 제목, 결석신고서, 학부모 문자에 함께 쓰입니다. */
  var SCH_TXT = {principal: 10, addr: 60, tel: 20, comci: 12, subject: 12, hb: 16, role: 10, pack: 12, neisA: 4, neisS: 10, neisKey: 40};   // 보완 3단계: 급식(나이스 교육청 코드·학교 코드·인증키)   // 개편 3단계: pack = 교과 칸(교과 팩 id · "none")   // 개편 2단계: role "subject" = 교과만(우리 반 메뉴 숨김), "homeroom"·"" = 담임   // 14단계: 교장·주소·전화·컴시간 학교 코드·내 교과
  var school = {
    load: function(){
      var o = store.get("tt_school_v1", null) || {};
      var name = String(o.name || "").trim();
      if(!name){ var b = store.get("tt_board_v1", null) || {}; name = String(b.school || "").trim(); }
      var logo = /^data:image\/(png|jpeg|webp);base64,/.test(o.logo || "") && o.logo.length < 200000 ? o.logo : "";
      var out = {name: name, teacher: String(o.teacher || "").trim(), logo: logo, hid: o.hid && typeof o.hid === "object" ? o.hid : null};
      Object.keys(SCH_TXT).forEach(function(k){ out[k] = String(o[k] || "").trim(); });
      return out;
    },
    save: function(o){
      var c = store.get("tt_school_v1", null) || {};
      if(o.name != null) c.name = String(o.name).trim().slice(0, 20);
      if(o.teacher != null) c.teacher = String(o.teacher).trim().slice(0, 10);
      if(o.logo != null) c.logo = /^data:image\/(png|jpeg|webp);base64,/.test(o.logo) && o.logo.length < 200000 ? o.logo : "";   // 학교 로고(선택, 작게 줄인 그림)
      Object.keys(SCH_TXT).forEach(function(k){ if(o[k] != null) c[k] = String(o[k]).trim().slice(0, SCH_TXT[k]); });
      if(o.packOnly != null) c.packOnly = !!o.packOnly;
      if(o.hid != null && typeof o.hid === "object"){ c.hid = {}; Object.keys(o.hid).slice(0, 20).forEach(function(k){ if(/^[a-z]{2,8}$/.test(k)) c.hid[k] = !!o.hid[k]; }); }   // v2.9 숨은 정보: 담당자가 세팅 파일로 켜고 끔   // PLAN_다듬기 5단계: 교과 칸에 내 교과만
      c.updatedAt = Date.now(); store.set("tt_school_v1", c);
    },
    short: function(){ return school.load().name.replace(/\s+/g, "").replace(/학교$/, ""); },   // 마산서중학교 → 마산서중
    title: function(){ var s = school.short(); return (s ? s + " " : "") + "쌤 노트"; }
  };
  /* 교직원 명렬 ("tt_staff_v1", 14단계 학기초 세팅에서 넣음): {v:1, list:[{name, dept, pos, subj, tel}]} */
  var staff = {
    KEY: "tt_staff_v1",
    load: function(){ var o = store.get("tt_staff_v1", null); return o && Array.isArray(o.list) ? o.list : []; },
    save: function(list){ return store.set("tt_staff_v1", {v: 1, list: list, at: Date.now()}); }
  };

  /* ---------- 학생 기록 ("tt_notes_v1") ----------
     모든 도구가 함께 쓰는 학생 기록 창고. 학생 메모(한 줄)와 날짜별 기록(영역: 교과·행동·창체 등)을 담습니다.
     학생은 "학년-반-번호"로 찾고, 이름도 함께 적어 둡니다(명단이 바뀌었을 때 확인용).
     교실 기기에는 보내지 않습니다(동기화 CLASS_KEYS에 없음). 화면은 shared/notes.js */
  var notes = (function(){
    var KEY = "tt_notes_v1";
    var AREAS = [["subj","교과 세특"],["beh","행동특성"],["auto","자율"],["club","동아리"],["career","진로"],["etc","기타"]];
    function load(){
      var d = store.get(KEY, null); if(!d || typeof d !== "object") d = {};
      if(!d.memo || typeof d.memo !== "object") d.memo = {};
      if(!Array.isArray(d.recs)) d.recs = [];
      d.v = 1; return d;
    }
    function save(d){ d.updatedAt = Date.now(); return store.set(KEY, d); }
    function key(c, s){ return c && (c.grade && c.cls) ? c.grade + "-" + c.cls + "-" + s.no : (c ? c.id : "_") + "-" + s.no; }
    function ymd(){ var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()); }
    /* 수업 기록장(tt_journal_v1)의 지금 차시 이름: 지금 교시에 "수업함"으로 표시한 차시, 없으면 다음 차시 */
    function lessonNow(cc){
      var J = store.get("tt_journal_v1", null); if(!J || !J.cur) return "";
      var g = Math.floor(cc / 100), raw = J.cur[g]; raw = Array.isArray(raw) ? raw.join("\n") : String(raw || "");
      var L = [], unit = "";
      raw.split("\n").forEach(function(l){ l = l.trim(); if(!l) return; if(l[0] === "#"){ unit = l.replace(/^#+\s*/, ""); return; } L.push(l); });
      if(!L.length) return "";
      var now = timetable.now(), i = -1;
      if(now && J.taught){ var tg = J.taught[ymd() + "|" + now.n]; if(tg && tg.kind === "done") i = tg.lesson; }
      if(i < 0) i = Math.min(((J.prog || {})[cc] || {}).n || 0, L.length - 1);
      return L[i] || "";
    }
    /* 수업 기록장의 학생 기록(발표·질문 등)을 학생 기록 창고로 모읍니다. 교실 기기에서 쓴 것도 내 기기에서 모입니다.
       "내부 참고" 꼬리표만 있는 기록은 옮기지 않고, 수업 기록장에서 지우면 여기서도 지웁니다. */
    var INTERNAL = ["과제 미제출", "집중 부족", "준비물 미지참", "지원 필요"];
    function fromJournal(){
      if(classroom) return;
      var J = store.get("tt_journal_v1", null); if(!J || !Array.isArray(J.records)) return;
      var d = load(), have = {}, live = {}, changed = false, skip = d.skipJ || {};
      d.recs.forEach(function(r){ if(r.jid) have[r.jid] = 1; });
      var cl = roster.classes();
      J.records.forEach(function(r){
        var jid = "j" + r.cls + "-" + r.id + "-" + r.ts; live[jid] = 1;
        if(have[jid] || skip[jid]) return;
        var tags = (r.tags || []).filter(function(t){ return INTERNAL.indexOf(t) < 0; }), inn = (r.tags || []).filter(function(t){ return INTERNAL.indexOf(t) >= 0; });
        if(!tags.length && !r.text) return;
        var g = Math.floor(r.cls / 100), c = r.cls % 100, cc = cl.filter(function(x){ return +x.grade === g && +x.cls === c; })[0];
        var st = cc ? cc.students.filter(function(x){ return +x.no === +r.no; })[0] : null;
        var text = (r.les ? "[" + r.les + "] " : "") + tags.concat(inn.length ? ["(참고: " + inn.join(", ") + ")"] : []).join(", ") + (r.text ? (tags.length ? " — " : "") + r.text : "") + (r.star ? " ⭐" : "");
        d.recs.push({id: uid(), jid: jid, k: g + "-" + c + "-" + r.no, n: st ? st.name : "", date: r.date, area: "subj", src: "수업 기록장", text: text.slice(0, 1000), at: r.ts || Date.now()});
        changed = true;
      });
      var before = d.recs.length;
      d.recs = d.recs.filter(function(r){ return !r.jid || live[r.jid]; });
      if(changed || d.recs.length !== before) save(d);
    }
    if(!classroom){
      setTimeout(function(){ try{ fromJournal(); }catch(e){} }, 0);
      window.addEventListener("storage", function(e){ if(e.key === "tt_journal_v1"){ try{ fromJournal(); }catch(err){} } });
    }

    return {
      KEY: KEY, AREAS: AREAS, load: load, save: save, key: key,
      area: function(id){ var a = AREAS.filter(function(x){ return x[0] === id; })[0]; return a ? a[1] : "기타"; },
      memo: function(k){ var m = load().memo[k]; return m ? m.t || "" : ""; },
      setMemo: function(k, text, name){
        var d = load(); text = String(text || "").trim().slice(0, 200);
        if(text) d.memo[k] = {t: text, n: name || "", u: Date.now()}; else delete d.memo[k];
        save(d);
      },
      add: function(o){
        var d = load(), r = {id: uid(), k: o.k, n: o.n || "", date: o.date || ymd(), area: o.area || "etc", src: o.src || "", text: String(o.text || "").trim().slice(0, 1000), at: Date.now()};
        if(!r.k || !r.text) return null;
        d.recs.push(r); save(d); return r;
      },
      update: function(id, patch){ var d = load(); d.recs.forEach(function(r){ if(r.id === id) Object.assign(r, patch); }); save(d); },
      remove: function(id){ var d = load(); d.recs = d.recs.filter(function(r){ if(r.id === id && r.jid){ d.skipJ = d.skipJ || {}; d.skipJ[r.jid] = 1; } return r.id !== id; }); save(d); },
      list: function(k){ return load().recs.filter(function(r){ return !k || r.k === k; }).sort(function(a, b){ return b.date < a.date ? -1 : b.date > a.date ? 1 : b.at - a.at; }); },
      count: function(){ var c = {}; load().recs.forEach(function(r){ c[r.k] = (c[r.k] || 0) + 1; }); return c; },
      lessonNow: lessonNow, fromJournal: fromJournal,
      /* 화면(빠른 기록·학생 카드)은 shared/notes.js 가 채웁니다. */
      quick: function(o){ withUI(function(){ TT.notesUI.quick(o || {}); }); },
      card: function(c, s){ withUI(function(){ TT.notesUI.card(c, s); }); }
    };
  })();
  function withUI(fn){
    if(TT.notesUI) return fn();
    var s = document.createElement("script"); s.src = BASE + "shared/notes.js"; s.onload = fn; document.head.appendChild(s);
  }

  /* ---------- 학생 사진 (명렬표에서만 보임) ----------
     "나이스 사진 이름"에서 짝지은 사진을 작게 줄여 이 기기의 IndexedDB("tt_photos")에만 둡니다.
     전체 백업·동기화에는 들어가지 않습니다(용량이 크고 민감한 자료). 키는 학생 기록과 같은 "학년-반-번호". */
  var photos = (function(){
    var DB = "tt_photos", ST = "p";
    function open(){
      return new Promise(function(res, rej){
        if(!window.indexedDB) return rej(new Error("no idb"));
        var r = indexedDB.open(DB, 1);
        r.onupgradeneeded = function(){ r.result.createObjectStore(ST); };
        r.onsuccess = function(){ res(r.result); }; r.onerror = function(){ rej(r.error); };
      });
    }
    function tx(mode, fn){
      return open().then(function(db){ return new Promise(function(res, rej){
        var t = db.transaction(ST, mode), st = t.objectStore(ST), out = fn(st);
        t.oncomplete = function(){ db.close(); res(out && "result" in out ? out.result : out); };
        t.onerror = function(){ db.close(); rej(t.error); };
      }); });
    }
    return {
      put: function(k, blob){ return tx("readwrite", function(st){ st.put(blob, k); }); },
      get: function(k){ return tx("readonly", function(st){ return st.get(k); }).catch(function(){ return null; }); },
      all: function(){
        return open().then(function(db){ return new Promise(function(res){
          var out = {}, t = db.transaction(ST, "readonly"), c = t.objectStore(ST).openCursor();
          c.onsuccess = function(){ var cur = c.result; if(cur){ out[cur.key] = cur.value; cur.continue(); } };
          t.oncomplete = function(){ db.close(); res(out); }; t.onerror = function(){ db.close(); res(out); };
        }); }).catch(function(){ return {}; });
      },
      del: function(k){ return tx("readwrite", function(st){ st.delete(k); }); },
      clear: function(prefix){
        return tx("readwrite", function(st){
          if(!prefix){ st.clear(); return; }
          var c = st.openCursor(); c.onsuccess = function(){ var cur = c.result; if(cur){ if(String(cur.key).indexOf(prefix) === 0) cur.delete(); cur.continue(); } };
        }).catch(function(){});
      }
    };
  })();

  /* ---------- 화면 글꼴 (tt_ui_v1.font) — 모든 화면에 같은 글꼴. 글꼴 정의는 shared/fonts.css ---------- */
  /* ---------- 화면 꾸미기 (개편 7단계): 테마 5 · 글꼴 4 · 글자 크기 3 ----------
     이 기기에만 저장합니다("snlook_v1" — tt_ 로 시작하지 않아 백업·동기화에 들어가지 않음). <html data-look · data-font · data-size> 로 고름.
     색·글꼴 값은 shared/look.css · shared/fonts.css 한 곳에 있습니다. TT.font 는 예전 이름(글꼴만). */
  var look = (function(){
    var KEY = "snlook_v1";
    /* v2.8: 첫 화면은 쌤비 홈, 휴대폰은 새 화면으로 고정. 예전 화면 코드는 그대로 두고 고르기만 숨김 — 다시 쓰려면 주소 끝 ?legacy=on (LEGACY.md) */
    function legacy(){ try{ return localStorage.getItem("sn_legacy_ui") === "1"; }catch(e){ return false; } }
    function classDev(){ try{ return localStorage.getItem("ttv_device") === "classroom"; }catch(e){ return false; } }   // 교실 기기(전자칠판)는 예전처럼
    var THEMES = [
      {id: "basic", name: "기본", desc: "맑은 파랑", c: ["#f3f6f9", "#2f6fb5", "#2563c9", "#1f7a4d", "#6b46c1", "#0f6e7a"]},
      {id: "spring", name: "봄", desc: "새싹 연두 · 벚꽃 분홍 · 라일락 · 개나리", c: ["#f5f9ef", "#3d7a2c", "#3d7a2c", "#c0396a", "#7a50b5", "#866100"]},
      {id: "summer", name: "여름", desc: "바다 청록 · 산호 · 하늘 · 햇살", c: ["#eef7f9", "#0b6f80", "#0b6f80", "#c0412b", "#1f68b3", "#8a5f00"]},
      {id: "autumn", name: "가을", desc: "단풍 주황 · 밤색 · 포도주 · 올리브", c: ["#fbf5ec", "#b04a10", "#b04a10", "#7a4a2a", "#8e2f47", "#5c6117"]},
      {id: "winter", name: "겨울", desc: "얼음 파랑 · 회청 · 남색 · 잿빛", c: ["#f0f3f7", "#2b659e", "#2b659e", "#466678", "#3d4a8f", "#57616b"]}
    ];
    var FONTS = [
      {id: "basic", name: "본고딕", desc: "기본 · 또렷함", ff: '"Noto Sans KR","Malgun Gothic",sans-serif'},
      {id: "plex", name: "IBM 플렉스 산스", desc: "단정 · 업무", ff: '"IBM Plex Sans KR","Malgun Gothic",sans-serif'},
      {id: "dodum", name: "고운돋움", desc: "부드러움", ff: '"Gowun Dodum","SN Gowun Dodum",sans-serif'},
      {id: "batang", name: "고운바탕", desc: "차분함 · 책", ff: '"Gowun Batang","SN Gowun Batang",serif'}
    ];
    var SIZES = [{id: "m", name: "보통"}, {id: "l", name: "크게"}, {id: "xl", name: "아주 크게"}];
    var MOBS = [{id: "new", name: "새 화면", desc: "＋ 빠른 입력 · 오늘 업무 바로 보기 · 큰 글씨"}, {id: "old", name: "예전 화면", desc: "v1.33 까지의 휴대폰 화면"}];   // 화면 개편 3·4단계 (휴대폰에서만 달라짐)
    var UIS = [{id: "board", name: "업무판", desc: "v1 · 오늘 칸 · 이번 주 업무 · 도구 카드를 한 화면에"}, {id: "ssambi", name: "쌤비 홈", desc: "v2 · 심플 · 지금 할 일만 드러나게"}];   // v2.0 첫 화면 고르기 (자료는 같음)
    function has(L, id){ return L.some(function(x){ return x.id === id; }); }
    function get(){
      var o = null; try{ o = JSON.parse(localStorage.getItem(KEY) || "null"); }catch(e){}
      if(!o){ var u = store.get("tt_ui_v1", {}) || {}, old = {soft: "dodum", cute: "dodum", neat: "batang"}[u.font]; o = {font: old || "basic"}; }   // 예전 '화면 글꼴'에서 이어받기
      return {look: has(THEMES, o.look) ? o.look : "basic", font: has(FONTS, o.font) ? o.font : "basic", size: has(SIZES, o.size) ? o.size : "m", mob: !legacy() ? "new" : has(MOBS, o.mob) ? o.mob : "new", ui: !legacy() ? (classDev() ? "board" : "ssambi") : has(UIS, o.ui) ? o.ui : "board"};
    }
    function apply(o){
      var r = document.documentElement; o = o || get();
      if(o.look === "basic") r.removeAttribute("data-look"); else r.setAttribute("data-look", o.look);
      if(o.font === "basic") r.removeAttribute("data-font"); else r.setAttribute("data-font", o.font);
      if(o.size === "m") r.removeAttribute("data-size"); else r.setAttribute("data-size", o.size);
      if(o.mob === "new") r.removeAttribute("data-mob"); else r.setAttribute("data-mob", o.mob);
      if(o.ui === "board") r.removeAttribute("data-ui"); else r.setAttribute("data-ui", o.ui);
      if(o.ui === "ssambi" && !document.getElementById("sbHold")){        // 쌤비 홈 디자인: 새 화면이 준비될 때까지 감춤 (예전 화면이 잠깐 보이지 않게, 늦어도 2.5초 뒤에는 보임)
        try{ var hs = document.createElement("style"); hs.id = "sbHold"; hs.textContent = 'html[data-ui="ssambi"]:not(.sbReady) body{visibility:hidden}html[data-ui="ssambi"] .tt-rail{display:none!important}'; (document.head || r).appendChild(hs); }catch(e){}
        setTimeout(function(){ r.classList.add("sbReady"); }, /\/apps\//.test(location.pathname) ? 2500 : 8000);   // v2.8.1: 첫 화면은 쌤비 홈이 다 그리면 보임(느린 기기에서 2.5초에 예전 업무판이 잠깐 보이던 문제)
      }   // v2.0: 쌤비 홈 디자인(shared/v2.css)은 이 표시가 있을 때만
      var mt = document.querySelector('meta[name="theme-color"]'), th = THEMES.filter(function(x){ return x.id === o.look; })[0]; if(mt && th) mt.setAttribute("content", th.c[1]);
    }
    function set(k, v){ var o = get(); o[k] = v; try{ localStorage.setItem(KEY, JSON.stringify(o)); }catch(e){} apply(o); }
    /* 처음대로: 색·글꼴·크기만 되돌림 (첫 화면 고르기는 그대로) */
    function reset(){ var keepUi = get().ui; try{ localStorage.removeItem(KEY); if(keepUi !== "board") localStorage.setItem(KEY, JSON.stringify({ui: keepUi})); }catch(e){} var u = store.get("tt_ui_v1", {}) || {}; if(u.font){ delete u.font; store.set("tt_ui_v1", u); } apply(); }
    try{ if(!document.querySelector('link[href$="shared/look.css"]')){ var lk = document.createElement("link"); lk.rel = "stylesheet"; lk.href = BASE + "shared/look.css"; document.head.appendChild(lk); } }catch(e){}   // 화면 꾸미기 값(색·글꼴 변수)
    try{ var l = document.createElement("link"); l.rel = "stylesheet"; l.href = BASE + "shared/fonts.css"; document.head.appendChild(l); }catch(e){}
    try{ if(!document.querySelector('link[href*="shared/v2.css"]')){ var l2 = document.createElement("link"); l2.rel = "stylesheet"; l2.href = BASE + "shared/v2.css?v=" + VERSION; document.head.appendChild(l2); } }catch(e){}   // v2.0 쌤비 홈 디자인 (html[data-ui=ssambi] 일 때만 적용)
    apply();
    window.addEventListener("storage", function(e){ if(e.key === KEY || e.key === "tt_ui_v1") apply(); });
    /* 화면 꾸미기 창: 고르면 바로 바뀌고(미리 보기), [처음대로]로 되돌림 */
    function open(){
      var d = document.createElement("dialog"), o = get(); d.className = "ttlook";
      var css = ".ttlook{border:0;border-radius:16px;padding:16px 18px;width:min(640px,96vw);max-height:calc(100vh - 16px);box-shadow:0 10px 40px rgba(0,0,0,.28);color:var(--t-ink,#1d2733);background:var(--t-card,#fff);font-family:var(--t-font)}"
        + ".ttlook::backdrop{background:rgba(20,30,45,.45)}.ttlook h2{font-size:18px;margin:0 0 4px}.ttlook h3{font-size:13px;color:var(--t-sub,#5b6773);margin:12px 0 6px}.ttlook p{font-size:12.5px;color:var(--t-sub,#5b6773);margin:0}"
        + ".ttlook .g{display:grid;gap:7px}.ttlook .g5{grid-template-columns:repeat(5,minmax(0,1fr))}.ttlook .g4{grid-template-columns:repeat(4,minmax(0,1fr))}.ttlook .g3{grid-template-columns:repeat(3,minmax(0,1fr))}.ttlook .g2{grid-template-columns:repeat(2,minmax(0,1fr))}"
        + ".ttlook .o{font:inherit;border:2px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:12px;padding:8px;cursor:pointer;text-align:left;color:var(--t-ink,#1d2733);display:flex;flex-direction:column;gap:4px;min-width:0}"
        + ".ttlook .o.on{border-color:var(--t-accent,#2f6fb5);box-shadow:0 0 0 2px var(--t-accent-soft,#e6f0fa)}.ttlook .o b{font-size:14px}.ttlook .o small{font-size:11px;color:var(--t-sub,#5b6773);line-height:1.3}"
        + ".ttlook .sw{display:flex;gap:3px;border-radius:8px;padding:5px}.ttlook .sw i{flex:1;height:16px;border-radius:4px}.ttlook .fs{font-size:20px;line-height:1.2}"
        + ".ttlook .acts{display:flex;justify-content:space-between;margin-top:14px;gap:8px}.ttlook .btn{font:inherit;font-weight:700;border:1px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:10px;padding:8px 14px;cursor:pointer;color:var(--t-ink,#1d2733)}"
        + ".ttlook .btn.p{background:var(--t-accent,#2f6fb5);color:#fff;border-color:var(--t-accent,#2f6fb5)}"
        + "@media (max-width:560px){.ttlook .g5{grid-template-columns:repeat(3,minmax(0,1fr))}.ttlook .g4{grid-template-columns:repeat(2,minmax(0,1fr))}}";
      d.innerHTML = "<style>" + css + "</style><h2>🎨 화면 꾸미기</h2><p>고르면 바로 바뀝니다 · 모든 화면에 함께 · 이 기기에만 저장</p>"
        + (!legacy() ? "" : "<h3>첫 화면 <small style=\"font-weight:400\">· 자료는 그대로, 화면 모양만 바뀝니다</small></h3><div class=\"g g2\" data-k=\"ui\">" + UIS.map(function(z){ return '<button type="button" class="o" data-v="' + z.id + '"><b>' + z.name + "</b><small>" + z.desc + "</small></button>"; }).join("") + "</div>")
        + (window.TT_SBART && TT_SBART.coatPicker ? "<h3>🦉 쌤비 옷장 <small style=\"font-weight:400\">· 깃털 색 · 특별한 색은 배지를 모으면 열려요</small></h3>" + TT_SBART.coatPicker() : "")   // v2.48
        + "<h3>테마</h3><div class=\"g g5\" data-k=\"look\">" + THEMES.map(function(t){ return '<button type="button" class="o" data-v="' + t.id + '"><span class="sw" style="background:' + t.c[0] + '">' + t.c.slice(1).map(function(c){ return '<i style="background:' + c + '"></i>'; }).join("") + "</span><b>" + t.name + "</b><small>" + t.desc + "</small></button>"; }).join("") + "</div>"
        + "<h3>글꼴</h3><div class=\"g g4\" data-k=\"font\">" + FONTS.map(function(f){ return '<button type="button" class="o" data-v="' + f.id + '"><span class="fs" style="font-family:' + f.ff.replace(/"/g, "&quot;") + '">가나다 Aa 12</span><b>' + f.name + "</b><small>" + f.desc + "</small></button>"; }).join("") + "</div>"
        + "<h3>글자 크기</h3><div class=\"g g3\" data-k=\"size\">" + SIZES.map(function(z, i){ return '<button type="button" class="o" data-v="' + z.id + '"><b style="font-size:' + (14 + i * 3) + 'px">' + z.name + "</b></button>"; }).join("") + "</div>"
        + (!legacy() ? "" : "<h3>휴대폰 화면 <small style=\"font-weight:400\">· 마음에 들지 않으면 예전 화면으로 (자료는 그대로)</small></h3><div class=\"g g2\" data-k=\"mob\">" + MOBS.map(function(z){ return '<button type="button" class="o" data-v="' + z.id + '"><b>' + z.name + "</b><small>" + z.desc + "</small></button>"; }).join("") + "</div>")
        + '<div class="acts"><button type="button" class="btn" data-act="reset">↺ 처음대로</button><button type="button" class="btn p" data-act="close">닫기</button></div>';
      function mark(){ var c = get(); Array.prototype.forEach.call(d.querySelectorAll("[data-k]"), function(g){ Array.prototype.forEach.call(g.children, function(b){ b.classList.toggle("on", b.dataset.v === c[g.dataset.k]); }); }); }
      d.addEventListener("click", function(e){
        var b = e.target.closest("button"); if(!b) return;
        if(b.dataset.act === "close"){ d.close(); return; } if(b.dataset.act === "reset"){ reset(); mark(); return; }
        var g = b.closest("[data-k]"); if(g){ set(g.dataset.k, b.dataset.v); mark(); window.dispatchEvent(new Event("resize")); }
      });
      d.addEventListener("close", function(){ d.remove(); });
      document.body.appendChild(d); mark(); d.showModal();
    }
    return {themes: THEMES, fonts: FONTS, sizes: SIZES, mobs: MOBS, uis: UIS, legacy: legacy, get: get, set: set, reset: reset, open: open};
  })();
  var font = {list: look.fonts, get: function(){ return look.get().font; }, set: function(id){ look.set("font", id); }};   // 예전 이름

  (function(){ var s = document.createElement("script"); s.src = BASE + "shared/vaultui.js"; s.defer = true; document.head.appendChild(s); })();

  return { VERSION: VERSION, BASE: BASE, classroom: classroom, store: store, roster: roster, timetable: timetable, school: school, staff: staff, font: font, look: look, notes: notes, photos: photos, file: {toRows: fileToRows, readXlsx: readXlsx, userErr: userErr, zip: makeZip}, util: util, ui: ui, backup: backup };
})();
