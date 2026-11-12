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

  /* 업무판에서 한 주 업무 읽기 */
  function fetchWeek(c, mon){
    return fetch(c.url, {
      method: "POST", redirect: "follow", credentials: "omit", cache: "no-store",
      headers: {"Content-Type": "text/plain;charset=utf-8"},      // 단순 요청(사전 확인 없이 전송)
      body: JSON.stringify({action: "week", pw: c.pw, from: ymd(mon), to: ymd(add(mon, 6))})
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

  /* 화면 그리기 */
  var st = {};
  function render(){
    var c = cfg();
    box.hidden = !!c.hidden;
    if(c.hidden) return;
    if(!c.url){
      box.className = "board setup";
      box.innerHTML = '<span>📅 우리 학교 <b>주간 업무판</b>을 연결하면 이번 주 업무가 여기에 보입니다.</span>'
        + '<button type="button" class="btn primary" data-act="setup">연결하기</button>'
        + '<button type="button" class="bk" data-act="hide">숨기기</button>';
      return;
    }
    var mon = weekStart(), tk = ymd(new Date()), next = mon > new Date();
    var items = (st.data && st.data.items) || [];
    var focus = Math.max(0, Math.min(4, Math.round((new Date(new Date().toDateString()) - mon) / 864e5)));
    var status = st.loading ? "불러오는 중…"
      : st.err ? '<span class="err">⚠ ' + esc(st.err.text) + "</span>" + (st.at ? " (" + stamp(st.at) + " 내용)" : "")
      : st.at ? stamp(st.at) + " 확인" : "";
    var h = '<div class="bh"><b>📅 ' + (next ? "다음 주" : "이번 주") + ' 업무</b>'
      + '<span class="sm">' + esc((st.data && st.data.school) || c.school || "") + " · " + (mon.getMonth()+1) + "월 " + Math.ceil(mon.getDate()/7) + "주</span>"
      + '<span class="bst">' + status + "</span>"
      + (st.err && st.err.auth ? '<button type="button" class="bk due" data-act="setup">비밀번호 다시 입력</button>' : "")
      + (st.err && !st.err.auth ? '<button type="button" class="bk" data-act="retry">다시 시도</button>' : "")
      + '<span class="sp"></span>'
      + '<a class="btn" href="' + esc(c.url) + '" target="_blank" rel="noopener">업무판 열기 ↗</a>'
      + '<button type="button" class="bk" data-act="setup" title="업무판 설정" aria-label="업무판 설정">⚙</button></div>';
    h += '<a class="bdays" href="' + esc(c.url) + '" target="_blank" rel="noopener" title="눌러서 업무판 열기">';
    for(var i = 0; i < 5; i++){
      var d = add(mon, i), k = ymd(d);
      var lab = items.filter(function(x){ return x.type === "day" && x.date === k; })[0];
      var list = items.filter(function(x){ return x.type === "item" && x.date === k; })
        .sort(function(a, b){ return order(a.dept) - order(b.dept) || tmin(a.time) - tmin(b.time) || (a.id < b.id ? -1 : 1); });
      h += '<div class="bd' + (k === tk ? " today" : "") + (lab && lab.important === "1" ? " hol" : "") + (i === focus ? " focus" : "") + '">'
        + '<div class="bdh">' + DOW[d.getDay()] + " " + d.getDate() + (k === tk ? " · 오늘" : "") + (lab ? "<em>" + esc(lab.text) + "</em>" : "") + "</div>"
        + '<div class="bdl">'
        + (list.length ? list.map(function(x){
            var col = color(x.dept);
            return '<div class="bi' + (x.important === "1" ? " imp" : "") + '" title="' + esc(x.dept + " · " + (x.time ? x.time + " " : "") + x.text) + '">'
              + '<b style="color:' + col + '">' + esc(short(x.dept)) + "</b>"
              + (x.time ? '<span class="t">' + esc(x.time) + "</span>" : "") + esc(x.text) + "</div>";
          }).join("") : (st.data ? '<div class="bnone">—</div>' : ""))
        + "</div></div>";
    }
    h += "</a>";
    var notice = items.filter(function(x){ return x.type === "notice"; });
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
    if(c.hidden || !c.url){ st = {}; render(); return; }
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
