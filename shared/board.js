/* 선생님 도구 모음 · 첫 화면의 "이번 주 업무" 띠
   학교마다 따로 만든 주간·월간 업무판(구글 시트 + 앱스 스크립트)에서 이번 주 업무를 읽어 와 보여 줍니다.
   - 읽기만 합니다. 업무판으로 보내는 것은 날짜와 공용 비밀번호뿐이고, 이 도구 모음의 학생 자료는 보내지 않습니다.
   - 업무판 주소와 비밀번호는 이 기기 브라우저(tt_board_v1)에만 저장됩니다.
   - 첫 화면(index.html)의 보안 설정(CSP)은 구글 앱스 스크립트 주소 한 곳만 추가로 허용합니다. */
(function(){
  "use strict";
  var KEY = "tt_board_v1", CACHE = "tt_board_cache_v1";
  var URL_RE = /^https:\/\/script\.google\.com\/(?:a\/macros\/[^\/?#\s]+|macros)\/s\/[\w-]+\/exec$/;
  var DOW = ["일","월","화","수","목","금","토"];
  // 업무판의 기본 부서 색과 같게 맞춤. 목록에 없는 부서는 이름으로 색을 정합니다.
  var COLORS = {"교무운영부":"#2f6fdb","인성안전부":"#e0533d","연구장학부":"#8e5bd6","학력향상부":"#e08a1e","교육과정부":"#159a87",
                "교육정보부":"#3a9bd8","문화환경부":"#5aa83a","진로교육부":"#c9489b","학년부":"#66788f","행정실":"#8a6d3b","교감":"#c8601a","교장":"#a8481a"};
  var PAL = ["#2f6fdb","#e0533d","#8e5bd6","#e08a1e","#159a87","#3a9bd8","#5aa83a","#c9489b","#66788f","#8a6d3b"];

  var box = document.getElementById("board");
  if(!box) return;
  var dlg = document.getElementById("dlgBoard");
  var $ = function(id){ return document.getElementById(id); };

  function cfg(){ return TT.store.get(KEY, {}) || {}; }
  function setCfg(c){ TT.store.set(KEY, c); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()); }
  function add(d, n){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function color(d){
    if(COLORS[d]) return COLORS[d];
    var h = 0; for(var i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
    return PAL[h % PAL.length];
  }
  var ORDER = Object.keys(COLORS);
  function order(d){ var i = ORDER.indexOf(d); return i < 0 ? 50 : i; }   // 업무판 표의 부서 순서대로
  function short(d){ return (String(d).replace(/(부|실)$/, "").slice(0, 2)) || d; }
  function tmin(t){ var m = /(\d{1,2}):(\d{2})/.exec(t || ""); return m ? (+m[1]) * 60 + (+m[2]) : 9999; }
  /* 주말에는 다음 주를 보여 줍니다. */
  function weekStart(){
    var t = new Date(), w = t.getDay();
    return w === 6 ? add(t, 2) : w === 0 ? add(t, 1) : add(t, 1 - w);
  }

  /* 업무판에서 2주 치 업무 읽기 */
  function fetchWeek(c, mon){
    return fetch(c.url, {
      method: "POST", redirect: "follow", credentials: "omit", cache: "no-store",
      headers: {"Content-Type": "text/plain;charset=utf-8"},      // 단순 요청(사전 확인 없이 전송)
      body: JSON.stringify({action: "week", pw: c.pw, from: ymd(mon), to: ymd(add(mon, 13))})   // 2주
    }).then(function(res){
      if(!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    }).then(function(text){
      var j;
      try{ j = JSON.parse(text); }catch(e){ throw new Error("NO_DOPOST"); }
      if(!j.ok) throw new Error(j.error || "알 수 없는 오류");
      return j;
    });
  }
  function errMsg(e){
    var m = String(e && e.message || e);
    if(m.indexOf("AUTH") >= 0) return {auth: true, text: "비밀번호가 바뀌었어요."};
    if(m === "NO_DOPOST") return {text: "업무판에 홈 화면 연결 기능(doPost)이 아직 없어요."};
    if(e instanceof TypeError || /Failed to fetch|NetworkError|Load failed/i.test(m)) return {text: "업무판에 연결할 수 없어요."};
    return {text: m};
  }

  /* 내 할 일(tt_mytodo_v1) 중 날짜가 있는 것 — 이 기기에서만 읽고, 업무판으로 보내지 않습니다. */
  var MYKEY = "tt_mytodo_v1";
  function myItems(){
    if(TT.classroom) return [];                                                     // 교실 기기에서는 내 할 일을 보이지 않음
    var d = TT.store.get(MYKEY, null);
    var out = d && Array.isArray(d.items) ? d.items.filter(function(x){ return x.date && !x.done; }) : [];
    var G = TT.store.get("tt_guide_v1", null);                                       // 생활지도 상담 후속 확인일 (번호만 표시)
    if(G && Array.isArray(G.counsel)) G.counsel.forEach(function(c){ if(c.next && !c.done) out.push({date: c.next, text: c.sid + "번 상담 후속 확인", ic: "🗣️"}); });
    var Cal = TT.store.get("tt_calendar_v1", null);                                   // 학사일정 (연간 업무에서 붙여 넣기)
    if(Cal && Array.isArray(Cal.events)) Cal.events.forEach(function(e){ out.push({date: e.d, text: e.t, ic: "📌"}); });
    var Yr = TT.store.get("tt_year_v1", null), t0 = new Date(), ay = t0.getMonth() >= 2 ? t0.getFullYear() : t0.getFullYear() - 1;   // 연간 업무 (학년도 3월~이듬해 2월)
    if(Yr && Array.isArray(Yr.items)) Yr.items.forEach(function(it){
      if(!it.d || (Yr.done || {})[ay + "|" + it.id]) return;
      var y = it.m <= 2 ? ay + 1 : ay; out.push({date: y + "-" + ("0" + it.m).slice(-2) + "-" + ("0" + it.d).slice(-2), text: it.title, ic: "📆"});
    });
    var Sb = TT.store.get("tt_submit_v1", null), cl = TT.roster.classes();          // 제출물 마감 (미제출이 남은 것만)
    if(Sb && Array.isArray(Sb.items)) Sb.items.forEach(function(it){
      if(!it.due) return; var c = cl.filter(function(x){ return x.id === it.cls; })[0]; if(!c) return;
      var mk = (Sb.m || {})[it.id] || {}, n = c.students.filter(function(s){ return !mk[s.no]; }).length;
      if(n) out.push({date: it.due, text: it.title + " 마감 · 미제출 " + n + "명", ic: "📦"});
    });
    return out;
  }
  function addMine(date, text){
    var d = TT.store.get(MYKEY, null); d = d && Array.isArray(d.items) ? d : {items: []};
    d.items.push({id: "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), text: text.slice(0, 120), date: date, done: false, created: Date.now()});
    TT.store.set(MYKEY, d);
    window.dispatchEvent(new Event("tt-mytodo-change"));
  }

  /* 화면 그리기: 이번 주 + 다음 주 (주말에는 다음 주 + 그다음 주) */
  var st = {};
  function render(){
    var c = cfg();
    box.hidden = !!c.hidden;
    if(c.hidden) return;
    var mon = weekStart(), tk = ymd(new Date()), weekend = mon > new Date(), linked = !!c.url;
    var items = (linked && st.data && st.data.items) || [], mine = myItems();
    var focus = Math.max(0, Math.min(4, Math.round((new Date(new Date().toDateString()) - mon) / 864e5)));
    var status = !linked ? "" : st.loading ? "불러오는 중…"
      : st.err ? '<span class="err">⚠ ' + esc(st.err.text) + "</span>" + (st.at ? " (" + stamp(st.at) + " 내용)" : "")
      : st.at ? stamp(st.at) + " 확인" : "";
    var h = '<div class="bh"><b>📅 ' + (weekend ? "다음 주 · 그다음 주" : "이번 주 · 다음 주") + "</b>"
      + (linked ? '<span class="sm">' + esc((st.data && st.data.school) || c.school || "") + "</span>" : '<span class="sm">학교 업무판 미연결</span>')
      + '<span class="bst">' + status + "</span>"
      + (st.err && st.err.auth ? '<button type="button" class="bk due" data-act="setup">비밀번호 다시 입력</button>' : "")
      + (linked && st.err && !st.err.auth ? '<button type="button" class="bk" data-act="retry">다시 시도</button>' : "")
      + '<span class="sp"></span>' + (TT.classroom ? '' : '<span class="bhint">빈 곳을 누르면 📝 내 할 일 추가</span>') + ''
      + (linked ? '<a class="btn" href="' + esc(c.url) + '" target="_blank" rel="noopener">업무판 열기 ↗</a>'
                  + '<button type="button" class="bk" data-act="setup" title="업무판 설정" aria-label="업무판 설정">⚙</button>'
                : '<button type="button" class="btn primary" data-act="setup">업무판 연결</button><button type="button" class="bk" data-act="hide" title="이 칸 숨기기">숨기기</button>')
      + "</div>";
    h += '<div class="bweeks">';
    for(var wk = 0; wk < 2; wk++){
      var m0 = add(mon, wk * 7);
      h += '<div class="bwk">' + (wk === 0 ? (weekend ? "다음 주" : "이번 주") : (weekend ? "그다음" : "다음 주")) + "<small>" + (m0.getMonth()+1) + "." + m0.getDate() + "</small></div>";
      for(var i = 0; i < 5; i++){
        var d = add(m0, i), k = ymd(d), idx = wk * 5 + i;
        var lab = items.filter(function(x){ return x.type === "day" && x.date === k; })[0];
        var list = items.filter(function(x){ return x.type === "item" && x.date === k; })
          .sort(function(a, b){ return order(a.dept) - order(b.dept) || tmin(a.time) - tmin(b.time) || (a.id < b.id ? -1 : 1); });
        var my = mine.filter(function(x){ return x.date === k; });
        h += '<div class="bd' + (k === tk ? " today" : "") + (k < tk ? " past" : "") + (lab && lab.important === "1" ? " hol" : "")
          + (idx === focus ? " focus" : "") + (idx === focus + 1 ? " focus2" : "") + '" data-date="' + k + '" title="빈 곳을 누르면 이 날짜에 내 할 일 추가">'
          + '<div class="bdh">' + DOW[d.getDay()] + " " + d.getDate() + (k === tk ? " · 오늘" : "") + (lab ? "<em>" + esc(lab.text) + "</em>" : "") + "</div>"
          + '<div class="bdl">'
          + my.map(function(x){ return '<div class="bi me" title="' + (x.ic === "📌" ? "학사일정" : x.ic ? "나만 보기" : "내 할 일 (나만 보기)") + '">' + (x.ic || "📝") + " " + esc(x.text) + "</div>"; }).join("")
          + list.map(function(x){
              var col = color(x.dept);
              return '<a class="bi' + (x.important === "1" ? " imp" : "") + '" href="' + esc(c.url) + '" target="_blank" rel="noopener" title="' + esc(x.dept + " · " + (x.time ? x.time + " " : "") + x.text) + '">'
                + '<b style="color:' + col + '">' + esc(short(x.dept)) + "</b>"
                + (x.time ? '<span class="t">' + esc(x.time) + "</span>" : "") + esc(x.text) + "</a>";
            }).join("")
          + "</div></div>";
      }
    }
    h += "</div>";
    var notice = items.filter(function(x){ return x.type === "notice" && x.date === ymd(mon); });
    if(notice.length) h += '<div class="bn" title="' + esc(notice.map(function(x){ return x.text; }).join("\n")) + '">📢 ' + esc(notice.map(function(x){ return x.text; }).join("  ·  ")) + "</div>";
    box.className = "board";
    box.innerHTML = h;
    requestAnimationFrame(clamp);
  }
  function stamp(t){ var d = new Date(t); return (d.toDateString() === new Date().toDateString() ? "" : (d.getMonth()+1) + "/" + d.getDate() + " ") + pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  /* 칸에 다 안 들어가면 뒤쪽을 숨기고 "+N건"으로 표시 */
  function clamp(){
    Array.prototype.forEach.call(box.querySelectorAll(".bdl"), function(l){
      var its = l.querySelectorAll(".bi");
      if(l.scrollHeight <= l.clientHeight + 1 || its.length < 2) return;
      var more = document.createElement("div"); more.className = "bmore"; l.appendChild(more);
      var n = 0;
      for(var k = its.length - 1; k >= 1; k--){
        its[k].style.display = "none"; n++; more.textContent = "+" + n + "건 더";
        if(l.scrollHeight <= l.clientHeight + 1) break;
      }
    });
  }

  /* 불러오기 (지난번 내용을 먼저 보여 주고, 새 내용으로 바꿉니다) */
  var busy = false;
  function refresh(){
    var c = cfg();
    if(c.hidden || !c.url){ st = {}; render(); return; }   // 미연결이어도 내 할 일은 달력에 보임
    if(busy) return;
    var mon = weekStart(), wk = ymd(mon);
    if(!st.data){
      var cache = TT.store.get(CACHE, null);
      if(cache && cache.week === wk && cache.url === c.url) st = {data: cache.data, at: cache.at};
    }
    busy = true; st.loading = true; st.err = null; render();
    fetchWeek(c, mon).then(function(j){
      st = {data: j, at: Date.now()};
      TT.store.set(CACHE, {week: wk, url: c.url, data: j, at: st.at});
      if(j.school && j.school !== c.school){ c.school = j.school; setCfg(c); }
    }, function(e){
      st.loading = false; st.err = errMsg(e);
    }).then(function(){ busy = false; st.loading = false; render(); });
  }

  /* 설정 대화상자 */
  function openSetup(){
    var c = cfg();
    $("bUrl").value = c.url || "";
    $("bPw").value = "";
    $("bPw").placeholder = c.pw ? "저장된 비밀번호 사용 (바꿀 때만 입력)" : "업무판 공용 비밀번호";
    $("bErr").textContent = "";
    $("bOff").textContent = c.url ? "연결 해제" : "이 기능 쓰지 않기";
    $("bOk").disabled = false; $("bOk").textContent = "연결 확인";
    dlg.showModal();
    setTimeout(function(){ (c.url ? $("bPw") : $("bUrl")).focus(); }, 0);
  }
  $("fBoard").addEventListener("submit", function(e){
    e.preventDefault();
    var old = cfg(), url = $("bUrl").value.trim(), pw = $("bPw").value || old.pw || "";
    if(!URL_RE.test(url)){ $("bErr").textContent = "주소는 https://script.google.com/…/exec 형태여야 합니다. 업무판 주소창의 주소를 그대로 붙여 넣어 주세요."; return; }
    if(!pw){ $("bErr").textContent = "비밀번호를 입력해 주세요."; $("bPw").focus(); return; }
    $("bOk").disabled = true; $("bOk").textContent = "확인 중…"; $("bErr").textContent = "";
    var c = {url: url, pw: pw};
    fetchWeek(c, weekStart()).then(function(j){
      c.school = j.school || "";
      setCfg(c); TT.store.remove(CACHE);
      st = {data: j, at: Date.now()};
      TT.store.set(CACHE, {week: ymd(weekStart()), url: url, data: j, at: st.at});
      dlg.close(); render();
      TT.ui.toast("업무판을 연결했습니다" + (c.school ? " · " + c.school : "") + ".");
    }, function(err){
      var m = errMsg(err);
      $("bErr").textContent = m.auth ? "비밀번호가 맞지 않아요."
        : m.text + (m.text.indexOf("doPost") >= 0 ? " 업무판 코드에 doPost를 추가하고 새 버전으로 배포해 주세요."
          : " 주소가 맞는지, 업무판 배포 설정의 '액세스 권한'이 '모든 사용자'인지 확인해 주세요.");
      $("bOk").disabled = false; $("bOk").textContent = "연결 확인";
    });
  });
  $("bCancel").onclick = function(){ dlg.close(); };
  $("bOff").onclick = function(){
    var had = !!cfg().url;
    TT.store.remove(CACHE);
    setCfg(had ? {} : {hidden: true});
    st = {}; dlg.close(); render();
    TT.ui.toast(had ? "업무판 연결을 해제했습니다." : "숨겼습니다. ⋯ 메뉴의 '학교 업무판 연결'에서 다시 켤 수 있습니다.");
  };

  box.addEventListener("click", function(e){
    var b = e.target.closest("[data-act]");
    if(!b) return;
    var act = b.getAttribute("data-act");
    if(act === "setup") openSetup();
    if(act === "retry") refresh();
    if(act === "hide"){ setCfg({hidden: true}); render(); TT.ui.toast("숨겼습니다. ⋯ 메뉴의 '학교 업무판 연결'에서 다시 켤 수 있습니다."); }
  });
  /* 날짜 칸의 빈 곳(또는 내 할 일)을 누르면 그 날짜로 내 할 일 추가. 학교 업무를 누르면 업무판이 열립니다. */
  box.addEventListener("click", function(e){
    if(e.target.closest("a,button") || TT.classroom) return;
    var cell = e.target.closest(".bd[data-date]"); if(!cell) return;
    var k = cell.getAttribute("data-date"), d = new Date(+k.slice(0,4), +k.slice(5,7) - 1, +k.slice(8,10));
    TT.ui.prompt("📝 " + (d.getMonth()+1) + "월 " + d.getDate() + "일(" + DOW[d.getDay()] + ") 내 할 일", "", "나만 보는 할 일 (학교 업무판에는 올라가지 않음)", function(v){
      addMine(k, v); render(); TT.ui.toast("내 할 일에 넣었습니다 (나만 보기).");
    });
  });
  window.addEventListener("tt-mytodo-change", function(){ render(); });
  window.addEventListener("storage", function(e){ if(e.key === MYKEY) render(); });
  var menuItem = $("mBoard");
  if(menuItem) menuItem.addEventListener("click", function(){ var m = $("more"); if(m) m.open = false; openSetup(); });

  var rt; window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(render, 150); });
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", function(){
    if(document.visibilityState === "visible" && (!st.at || Date.now() - st.at > 120000)) refresh();
  });
  setInterval(function(){ if(document.visibilityState === "visible") refresh(); }, 5 * 60000);
  window.TT_BOARD = {refresh: refresh};
  refresh();
})();
