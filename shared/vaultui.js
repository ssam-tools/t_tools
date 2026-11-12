/* 쌤 노트 · 보관함 화면 (모든 화면에 tt.js가 자동으로 붙입니다)
   · 기기 연결 설정창 (TT.vault.open())
   · 교실 기기(전자칠판): 수업 시작(로그인) 화면, 위쪽 "교실 모드" 띠, 20분 쓰지 않으면 자동 잠금, 수업용이 아닌 도구 막기
   · 동기화 상태 표시와 "다른 기기에서 바뀐 내용" 알림
   네트워크와 암호화는 shared/sync.html(vault.js)이 맡고, 이 파일은 화면만 그립니다. */
(function(){
  "use strict";
  if(window.TT_VAULTUI) return; window.TT_VAULTUI = true;
  var BASE = TT.BASE, CR = TT.classroom, LOADED = Date.now(), touched = false;
  var J = function(s){ try{ return JSON.parse(s); }catch(e){ return null; } };
  var LS = function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var personal = !!J(LS("ttv_vault")) && LS("ttv_device") !== "classroom";
  var here = (location.pathname.match(/\/apps\/([^\/]+)\//) || [])[1] || "";
  var tool = null;
  function withTools(cb){                                                          // 도구 목록(tools.js)이 아직 없으면 불러온 뒤 실행
    if(typeof TT_TOOLS !== "undefined") return cb();
    var s = document.createElement("script"); s.src = BASE + "shared/tools.js"; s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }

  /* ---------- 모양 ---------- */
  var css = ".ttv-dlg{border:0;border-radius:16px;padding:16px 20px;width:min(560px,94vw);max-height:calc(100vh - 16px);overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.28);color:#1d2733;font:14px/1.55 'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif}"
    + ".ttv-dlg::backdrop{background:rgba(20,30,45,.5)}"
    + ".ttv-dlg h2{font-size:18px;margin:0 0 6px}.ttv-dlg p{margin:6px 0;color:#5b6773;font-size:13px}"
    + ".ttv-dlg label.f{display:block;font-size:12.5px;font-weight:700;color:#5b6773;margin:7px 0 2px}"
    + ".ttv-dlg input[type=text],.ttv-dlg input[type=password],.ttv-dlg input[type=url]{width:100%;box-sizing:border-box;font:inherit;font-size:15px;border:1px solid #dde3ea;border-radius:10px;padding:7px 11px}"
    + ".ttv-dlg .seg2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}"
    + ".ttv-dlg .seg2 label{border:2px solid #dde3ea;border-radius:12px;padding:7px 10px;cursor:pointer;font-size:13px;color:#5b6773}"
    + ".ttv-dlg .seg2 label b{display:block;font-size:15px;color:#1d2733;margin-bottom:2px}"
    + ".ttv-dlg .seg2 input{display:none}.ttv-dlg .seg2 label:has(input:checked){border-color:#2f6fb5;background:#e6f0fa}"
    + ".ttv-dlg .acts{display:flex;justify-content:space-between;gap:8px;margin-top:10px;flex-wrap:wrap}.ttv-dlg .acts .r{display:flex;gap:8px;margin-left:auto}"
    + ".ttv-btn{font:inherit;font-size:14px;font-weight:700;border:1px solid #dde3ea;background:#fff;color:#1d2733;border-radius:10px;padding:8px 14px;cursor:pointer}"
    + ".ttv-btn.p{background:#2f6fb5;border-color:#2f6fb5;color:#fff}.ttv-btn.d{color:#b3261e;border-color:#f1c6c6}.ttv-btn:disabled{opacity:.6;cursor:default}"
    + ".ttv-dlg .two{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}@media(max-width:520px){.ttv-dlg .two{grid-template-columns:1fr}}" + ".ttv-err{color:#b3261e;font-weight:700;font-size:13px;min-height:1.2em;margin-top:8px}"
    + ".ttv-box{background:#f3f6f9;border-radius:10px;padding:10px 12px;margin-top:8px;font-size:13px}"
    + ".ttv-lock{position:fixed;inset:0;z-index:2000;background:linear-gradient(135deg,#1f3b63,#2f6fb5);display:flex;align-items:center;justify-content:center;padding:16px;font:15px/1.5 'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}"
    + ".ttv-card{background:#fff;border-radius:20px;padding:28px 26px;width:min(440px,100%);box-shadow:0 20px 60px rgba(0,0,0,.3);text-align:center;color:#1d2733}"
    + ".ttv-card h1{font-size:23px;margin:6px 0 2px}.ttv-card p{color:#5b6773;margin:0 0 16px;font-size:13.5px}"
    + ".ttv-card input{width:100%;box-sizing:border-box;font:inherit;font-size:18px;border:2px solid #dde3ea;border-radius:12px;padding:12px;margin-bottom:10px;text-align:center}"
    + ".ttv-card input:focus{outline:none;border-color:#2f6fb5}.ttv-card .ttv-btn{width:100%;padding:13px;font-size:17px}"
    + ".ttv-band{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:1500;background:#1f3b63;color:#fff;border-radius:0 0 12px 12px;padding:3px 6px 3px 12px;font:12.5px/1.6 'Malgun Gothic',system-ui,sans-serif;display:flex;gap:8px;align-items:center;box-shadow:0 2px 10px rgba(0,0,0,.2)}"
    + ".ttv-band button{font:inherit;font-weight:700;border:0;border-radius:8px;padding:2px 10px;background:#ffd36b;color:#3a2a00;cursor:pointer}"
    + ".ttv-note{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:1600;background:#1d2733;color:#fff;border-radius:12px;padding:9px 12px 9px 16px;font:14px 'Malgun Gothic',system-ui,sans-serif;display:flex;gap:10px;align-items:center;max-width:94vw;box-shadow:0 6px 20px rgba(0,0,0,.25)}"
    + ".ttv-note button{font:inherit;font-weight:700;border:0;border-radius:8px;padding:4px 12px;background:#9cc8ff;color:#0d2440;cursor:pointer}"
    + ".ttv-chip{font:12px 'Malgun Gothic',system-ui,sans-serif;font-weight:700;border:0;border-radius:999px;padding:3px 10px;cursor:pointer;background:#e3f3ea;color:#2e7d4f}"
    + ".ttv-chip.err{background:#fdeceb;color:#b3261e}.ttv-chip.off{background:#eceff3;color:#5b6773}"
    + ".tt-rail .ttv-ri b{font-size:9.5px!important}"
    + "@media print{.ttv-band,.ttv-note,.ttv-lock{display:none!important}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- 동기화 창 (숨은 iframe) ---------- */
  var frame = null, ready = null, lastStatus = null;
  function vault(){
    if(ready) return ready;
    ready = new Promise(function(resolve){
      frame = document.createElement("iframe");
      frame.src = BASE + "shared/sync.html"; frame.title = "보관함 동기화"; frame.setAttribute("aria-hidden", "true"); frame.tabIndex = -1;
      frame.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
      frame.addEventListener("load", function(){ resolve(frame.contentWindow.Vault); });
      (document.body || document.documentElement).appendChild(frame);
    });
    return ready;
  }
  window.addEventListener("message", function(e){
    if(e.origin !== location.origin || !e.data || e.data.tt !== "vault") return;
    lastStatus = e.data.status; paintChip();
    if(e.data.type === "changed") onChanged(e.data.keys || []);
  });
  ["pointerdown", "keydown"].forEach(function(ev){ document.addEventListener(ev, function(){ touched = true; }, true); });
  function onChanged(keys){
    var busy = document.querySelector("dialog[open]") || (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName));
    if(!busy && (!touched || Date.now() - LOADED < 4000)){ location.reload(); return; }
    note("다른 기기에서 바뀐 내용을 받았어요.", "새로 보기", function(){ location.reload(); });
  }
  var noteEl = null;
  function note(text, btn, fn){
    if(noteEl) noteEl.remove();
    noteEl = document.createElement("div"); noteEl.className = "ttv-note"; noteEl.setAttribute("role", "status");
    noteEl.innerHTML = "<span>" + esc(text) + "</span>" + (btn ? '<button type="button">' + esc(btn) + "</button>" : "");
    if(btn) noteEl.querySelector("button").onclick = fn;
    document.body.appendChild(noteEl);
    if(!btn) setTimeout(function(){ if(noteEl){ noteEl.remove(); noteEl = null; } }, 4000);
  }

  /* ---------- 상태 표시 ---------- */
  function stamp(t){ if(!t) return ""; var d = new Date(t); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function chipText(){
    var s = lastStatus;
    if(!s || !s.mode) return {t:"🔄 동기화 안 함", c:"off"};
    if(s.error) return {t:"⚠ 동기화 오류", c:"err"};
    if(s.busy) return {t:"🔄 맞추는 중…", c:""};
    return {t:"🔒 동기화 " + stamp(s.last), c:""};
  }
  function paintChip(){
    var c = chipText();
    document.querySelectorAll(".ttv-chip").forEach(function(el){ el.textContent = c.t; el.className = "ttv-chip " + c.c; el.title = (lastStatus && lastStatus.error) || "기기 연결·동기화"; });
    document.querySelectorAll(".ttv-ri b").forEach(function(el){ el.textContent = c.c === "err" ? "동기화 오류" : c.c === "off" ? "동기화" : "동기화 " + (lastStatus && lastStatus.busy ? "…" : stamp(lastStatus && lastStatus.last)); });
  }
  function placeChips(){
    if(CR) return;
    var foot = document.getElementById("count");                                   // 첫 화면 아래쪽
    var pv = document.querySelector("footer .priv");
    if(pv){ if(CR) pv.textContent = "🏫 교실 기기: 수업용 자료만 잠깐 열립니다. 창을 닫거나 20분 쉬면 자동으로 지워져요.";
      else if(personal) pv.textContent = "🔒 자료는 이 기기에 저장되고, 내 비밀 문구로 잠근 뒤에만 학교 보관함과 동기화됩니다."; }
    if(foot && !document.querySelector(".ttv-chip")){ var b = document.createElement("button"); b.type = "button"; b.className = "ttv-chip off"; b.onclick = open; foot.parentNode.insertBefore(b, foot); foot.parentNode.insertBefore(document.createTextNode(" "), foot); }
    var rail = document.querySelector(".tt-rail");                                  // 도구 화면 왼쪽 메뉴
    if(rail && !rail.querySelector(".ttv-ri")){ var a = document.createElement("a"); a.href = "#"; a.className = "tt-ri ttv-ri bd"; a.innerHTML = "<span>🔒</span><b>동기화</b>"; a.onclick = function(e){ e.preventDefault(); open(); }; rail.appendChild(a); }
    paintChip();
  }

  /* ---------- 기기 연결 설정창 ---------- */
  var dlg = null;
  function dialog(html){
    if(dlg) dlg.remove();
    dlg = document.createElement("dialog"); dlg.className = "ttv-dlg"; dlg.innerHTML = html;
    document.body.appendChild(dlg); dlg.addEventListener("close", function(){ dlg.remove(); dlg = null; });
    dlg.showModal(); return dlg;
  }
  function q(s){ return dlg.querySelector(s); }
  function serverPrefill(){ var s = J(LS("ttv_server")) || {}, b = J(LS("tt_board_v1")) || {}; return {url: s.url || b.url || "", pw: s.pw || b.pw || ""}; }
  function open(){
    var dev = LS("ttv_device"), cfg = J(LS("ttv_vault"));
    if(dev === "classroom"){
      dialog('<h2>🏫 교실 기기</h2><p>이 기기는 <b>교실 기기(전자칠판)</b>로 정해져 있어요. 수업 때마다 선생님 ID와 비밀 문구로 열고, 끝나면 이 기기에서 자료가 지워집니다.</p>'
        + '<div class="ttv-err"></div><div class="acts"><button class="ttv-btn d" data-a="normal">일반 기기로 되돌리기</button><div class="r"><button class="ttv-btn" data-a="close">닫기</button></div></div>');
      q("[data-a=close]").onclick = function(){ dlg.close(); };
      q("[data-a=normal]").onclick = function(){ vault().then(function(V){ V.disconnect(); location.reload(); }); };
      return;
    }
    if(cfg && cfg.id){
      var s = lastStatus || {};
      dialog('<h2>🔒 기기 연결·동기화</h2><p>이 기기는 <b>' + esc(cfg.id) + '</b> 보관함과 연결된 <b>내 기기</b>예요. 바뀐 내용은 잠긴 채로 학교 업무판 보관함에 자동으로 맞춰집니다.</p>'
        + '<div class="ttv-box">마지막 동기화: <b class="ttv-last">' + (s.last ? new Date(s.last).toLocaleString("ko-KR") : "—") + '</b>' + (s.error ? '<br><span style="color:#b3261e">' + esc(s.error) + '</span>' : '') + '</div>'
        + '<p>다른 기기 연결: 그 기기에서 <b>⋯ → 기기 연결·동기화</b>를 열고 같은 ID와 비밀 문구를 넣으세요. 전자칠판은 “교실 기기”로 정하세요.</p>'
        + '<div class="ttv-err"></div><div class="acts"><button class="ttv-btn d" data-a="off">이 기기 연결 끊기</button><div class="r"><button class="ttv-btn" data-a="close">닫기</button><button class="ttv-btn p" data-a="now">지금 동기화</button></div></div>'
        + '<p style="margin-top:14px;font-size:12px">보관함을 아예 없애려면 <a href="#" data-a="wipe" style="color:#b3261e">보관함 지우기</a> (학교 업무판에 있는 내 자료와 ID가 지워지고, 이 기기의 자료는 남아요)</p>');
      q("[data-a=close]").onclick = function(){ dlg.close(); };
      q("[data-a=now]").onclick = function(){ var b = this; b.disabled = true; b.textContent = "맞추는 중…";
        vault().then(function(V){ return V.syncNow(); }).then(function(r){ b.disabled = false; b.textContent = "지금 동기화"; q(".ttv-last").textContent = r.last ? new Date(r.last).toLocaleString("ko-KR") : "—"; q(".ttv-err").textContent = r.error || ""; }); };
      q("[data-a=off]").onclick = function(){ if(!confirm2(this, "정말 끊을까요?")) return; vault().then(function(V){ V.disconnect(); location.reload(); }); };
      q("[data-a=wipe]").onclick = function(e){ e.preventDefault(); if(!confirm2(this, "정말 지울까요? 다시 누르면 지웁니다")) return;
        vault().then(function(V){ return V.wipeServer(); }).then(function(r){ if(r.error) q(".ttv-err").textContent = r.error; else location.reload(); }); };
      return;
    }
    var p = serverPrefill();
    dialog('<h2>🔒 기기 연결·동기화</h2>'
      + '<p>교무실 PC·휴대폰·교실 전자칠판에서 같은 자료를 쓰도록 연결합니다. 자료는 <b>이 기기에서 비밀 문구로 잠근 뒤</b> 학교 업무판 보관함에 맡겨지고, 업무판 관리자나 구글도 내용을 볼 수 없어요.</p>'
      + '<div class="seg2"><label><input type="radio" name="kind" value="personal" checked><b>💻 내 기기</b>교무실 PC, 내 휴대폰</label><label><input type="radio" name="kind" value="classroom"><b>🏫 교실 기기</b>전자칠판 등 여럿이 쓰는 기기</label></div>'
      + '<label class="f">학교 업무판 주소</label><input type="url" name="url" value="' + esc(p.url) + '" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off" spellcheck="false">'
      + '<div class="two"><div><label class="f">학교 공용 비밀번호</label><input type="password" name="pw" value="' + esc(p.pw) + '" autocomplete="off"></div>'
      + '<div class="mine"><label class="f">내 ID <small>(영문 소문자·숫자)</small></label><input type="text" name="id" placeholder="예: ssam3" autocomplete="off" spellcheck="false" autocapitalize="off"></div></div>'
      + '<div class="two mine"><div><label class="f">비밀 문구 <small>(8자 이상)</small></label><input type="password" name="pass" placeholder="나만 아는 문장" autocomplete="new-password"></div>'
      + '<div><label class="f pass2" hidden>비밀 문구 한 번 더</label><input type="password" name="pass2" hidden autocomplete="new-password"></div></div>'
      + '<p class="hint">⚠ 비밀 문구를 잊으면 보관함을 아무도 열 수 없어요(되찾기 불가). 이 기기 자료는 남으니 전체 백업도 함께 해 두세요.</p>'
      + '<div class="ttv-err"></div><div class="acts"><span></span><div class="r"><button class="ttv-btn" data-a="close">취소</button><button class="ttv-btn p" data-a="go">연결</button></div></div>');
    function kind(){ return q("input[name=kind]:checked").value; }
    dlg.querySelectorAll("input[name=kind]").forEach(function(r){ r.onchange = function(){
      var c = kind() === "classroom"; dlg.querySelectorAll(".mine").forEach(function(e){ e.hidden = c; });
      q(".hint").innerHTML = c ? "이 기기의 학생 자료는 지워지고, 앞으로는 수업 때마다 선생님 ID·비밀 문구로 열어 씁니다. 창을 닫거나 20분 동안 쓰지 않으면 자동으로 잠기고 지워져요." : "⚠ 비밀 문구를 잊으면 보관함을 아무도 열 수 없어요(되찾기 불가). 이 기기 자료는 남으니 전체 백업도 함께 해 두세요.";
      q("[data-a=go]").textContent = c ? "교실 기기로 정하기" : "연결"; }; });
    q("[data-a=close]").onclick = function(){ dlg.close(); };
    var creating = false;
    q("[data-a=go]").onclick = function(){
      var b = this, err = q(".ttv-err"); err.textContent = "";
      var o = {url: q("[name=url]").value.trim(), pw: q("[name=pw]").value, id: q("[name=id]").value.trim().toLowerCase(), pass: q("[name=pass]").value};
      if(kind() === "classroom"){
        vault().then(function(V){ var r = V.setClassroom(o); if(r.error){ err.textContent = r.error; return; } location.reload(); });
        return;
      }
      if(creating){ if(q("[name=pass2]").value !== o.pass){ err.textContent = "비밀 문구가 서로 달라요."; return; } o.create = true; }
      b.disabled = true; b.textContent = creating ? "만드는 중…" : "확인 중…";
      vault().then(function(V){ return V.connectPersonal(o); }).then(function(r){
        b.disabled = false; b.textContent = creating ? "새 보관함 만들기" : "연결";
        if(r.needCreate){ creating = true; q(".pass2").hidden = false; q("[name=pass2]").hidden = false; q("[name=pass2]").focus();
          err.style.color = "#2f6fb5"; err.textContent = "‘" + o.id + "’ 보관함이 아직 없어요. 비밀 문구를 한 번 더 넣고 새로 만드세요."; b.textContent = "새 보관함 만들기"; return; }
        err.style.color = "";
        if(r.error){ err.textContent = r.error; return; }
        dlg.close(); note(r.created ? "보관함을 만들고 이 기기 자료를 잠가서 올렸어요." : "보관함과 연결했어요. 보관함 내용을 받았습니다.");
        setTimeout(function(){ location.reload(); }, 1200);
      });
    };
    setTimeout(function(){ (p.url ? q("[name=id]") : q("[name=url]")).focus(); }, 30);
  }
  function confirm2(el, text){ if(el.dataset.sure) return true; el.dataset.sure = "1"; el.dataset.old = el.textContent; el.textContent = text; setTimeout(function(){ el.textContent = el.dataset.old; delete el.dataset.sure; }, 4000); return false; }

  /* ---------- 교실 기기 ---------- */
  function lockScreen(){
    var srv = J(LS("ttv_server")) || {};
    var box = document.createElement("div"); box.className = "ttv-lock";
    box.innerHTML = '<form class="ttv-card" autocomplete="off"><div style="font-size:40px">🏫</div><h1>' + esc(TT.schoolTitle ? TT.schoolTitle() : "쌤 노트") + '</h1><p>교실 기기예요. 선생님 ID와 비밀 문구로 수업을 시작하세요.<br>창을 닫거나 20분 동안 쓰지 않으면 자동으로 잠기고 지워집니다.</p>'
      + '<input name="id" placeholder="선생님 ID" autocapitalize="off" spellcheck="false"><input name="pass" type="password" placeholder="비밀 문구">'
      + '<div class="ttv-err"></div><button class="ttv-btn p" type="submit">수업 시작</button>'
      + (srv.url ? '' : '<p style="margin-top:12px;color:#b3261e">학교 업무판 주소가 없어요. 아래 “기기 설정”에서 넣어 주세요.</p>')
      + '<p style="margin:14px 0 0;font-size:12px"><a href="#" class="cfg">기기 설정</a></p></form>';
    document.body.appendChild(box);
    var f = box.querySelector("form");
    f.querySelector(".cfg").onclick = function(e){ e.preventDefault(); open(); };
    f.onsubmit = function(e){
      e.preventDefault();
      var b = f.querySelector("button[type=submit]"), err = f.querySelector(".ttv-err");
      b.disabled = true; b.textContent = "여는 중…"; err.textContent = "";
      vault().then(function(V){ return V.unlock({id: f.id.value, pass: f.pass.value}); }).then(function(r){
        if(r.error){ err.textContent = r.error; b.disabled = false; b.textContent = "수업 시작"; f.pass.value = ""; return; }
        location.reload();
      });
    };
    setTimeout(function(){ f.id.focus(); }, 50);
  }
  function lockNow(){ vault().then(function(V){ return V.lock(); }).then(function(){ location.href = BASE; }); }
  function classroomBand(){
    var band = document.createElement("div"); band.className = "ttv-band";
    band.innerHTML = '<span>🏫 교실 모드 · <b>' + esc(CR.id) + '</b></span><span class="left"></span><button type="button">수업 끝 · 잠그기</button>';
    band.querySelector("button").onclick = lockNow;
    document.body.appendChild(band);
    var last = Date.now();
    function bump(){ var now = Date.now(); if(now - last < 10000) return; last = now;
      try{ var s = JSON.parse(sessionStorage.getItem("ttv_session")); if(s){ s.last = now; sessionStorage.setItem("ttv_session", JSON.stringify(s)); } }catch(e){} }
    ["pointerdown", "keydown", "wheel"].forEach(function(ev){ document.addEventListener(ev, bump, true); });
    setInterval(function(){
      var s = null; try{ s = JSON.parse(sessionStorage.getItem("ttv_session")); }catch(e){}
      var idle = s ? Date.now() - (s.last || 0) : 1e12, left = 20 * 60 * 1000 - idle;
      band.querySelector(".left").textContent = left < 3 * 60 * 1000 && left > 0 ? "· " + Math.ceil(left / 60000) + "분 뒤 잠김" : "";
      if(left <= 0) lockNow();
    }, 15000);
  }
  function blockTool(){
    var box = document.createElement("div"); box.className = "ttv-lock";
    box.innerHTML = '<div class="ttv-card"><div style="font-size:40px">🔒</div><h1>교실 기기에서는 쓰지 않는 도구예요</h1><p>' + esc(tool ? tool.name : "이 도구") + '에는 학생의 민감한 정보가 있어 교무실 PC나 휴대폰에서만 엽니다.</p><a class="ttv-btn p" style="display:block;text-decoration:none" href="' + BASE + '">수업 도구로 돌아가기</a></div>';
    document.body.appendChild(box);
  }

  /* ---------- 시작 ---------- */
  function start(){
    tool = (typeof TT_TOOLS !== "undefined" ? TT_TOOLS : []).filter(function(t){ return t.id === here; })[0] || null;
    if(CR){
      if(CR.locked){ lockScreen(); return; }
      if(tool && !tool.room){ blockTool(); }
      classroomBand(); vault();
      return;
    }
    if(personal) vault();
    placeChips();
    setTimeout(placeChips, 600);                                                     // 왼쪽 메뉴가 늦게 그려질 때
    var mb = document.getElementById("mBoard");                                      // 첫 화면 ⋯ 메뉴에 "기기 연결·동기화" 추가
    if(mb && !document.getElementById("mVault")){ var m = document.createElement("button"); m.type = "button"; m.id = "mVault"; m.textContent = "기기 연결·동기화"; m.onclick = function(){ var d = document.getElementById("more"); if(d) d.open = false; open(); }; mb.parentNode.insertBefore(m, mb.nextSibling); }
  }
  TT.vault = {open: open, lock: lockNow};
  function boot(){ withTools(start); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
