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
    function pk(){ if(typeof ttPackLoad === "function") ttPackLoad(BASE, cb, true); else cb(); }   // 교과 팩 도구도(교실 기기 막기 판단용)
    if(typeof TT_TOOLS !== "undefined") return pk();
    var s = document.createElement("script"); s.src = BASE + "shared/tools.js"; s.onload = pk; s.onerror = cb; document.head.appendChild(s);
  }

  /* ---------- 모양 ---------- */
  var css = ".ttv-dlg{border:0;border-radius:16px;padding:16px 20px;width:min(560px,94vw);max-height:calc(100vh - 16px);overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.28);color:var(--t-ink,#1d2733);font:14px/1.55 'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif}"
    + ".ttv-dlg::backdrop{background:rgba(20,30,45,.5)}"
    + ".ttv-dlg h2{font-size:18px;margin:0 0 6px}.ttv-dlg p{margin:6px 0;color:var(--t-sub,#5b6773);font-size:13px}"
    + ".ttv-dlg label.f{display:block;font-size:12.5px;font-weight:700;color:var(--t-sub,#5b6773);margin:7px 0 2px}"
    + ".ttv-dlg input[type=text],.ttv-dlg input[type=password],.ttv-dlg input[type=url]{width:100%;box-sizing:border-box;font:inherit;font-size:15px;border:1px solid var(--t-line,#dde3ea);border-radius:10px;padding:7px 11px}"
    + ".ttv-dlg .seg2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}"
    + ".ttv-dlg .seg2 label{border:2px solid var(--t-line,#dde3ea);border-radius:12px;padding:7px 10px;cursor:pointer;font-size:13px;color:var(--t-sub,#5b6773)}"
    + ".ttv-dlg .seg2 label b{display:block;font-size:15px;color:var(--t-ink,#1d2733);margin-bottom:2px}"
    + ".ttv-dlg .seg2 input{display:none}.ttv-dlg .seg2 label:has(input:checked){border-color:var(--t-accent,#2f6fb5);background:var(--t-accent-soft,#e6f0fa)}"
    + ".ttv-dlg .acts{display:flex;justify-content:space-between;gap:8px;margin-top:10px;flex-wrap:wrap}.ttv-dlg .acts .r{display:flex;gap:8px;margin-left:auto}"
    + ".ttv-btn{font:inherit;font-size:14px;font-weight:700;border:1px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);color:var(--t-ink,#1d2733);border-radius:10px;padding:8px 14px;cursor:pointer}"
    + ".ttv-btn.p{background:var(--t-accent,#2f6fb5);border-color:var(--t-accent,#2f6fb5);color:var(--t-on,#fff)}.ttv-btn.d{color:var(--t-danger,#b3261e);border-color:#f1c6c6}.ttv-btn:disabled{opacity:.6;cursor:default}"
    + ".ttv-dlg .two{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}@media(max-width:520px){.ttv-dlg .two{grid-template-columns:1fr}}" + ".ttv-err{color:var(--t-danger,#b3261e);font-weight:700;font-size:13px;min-height:1.2em;margin-top:8px}"
    + ".ttv-box{background:var(--t-bg,#f3f6f9);border-radius:10px;padding:10px 12px;margin-top:8px;font-size:13px}"
    + ".ttv-lock{position:fixed;inset:0;z-index:2000;background:linear-gradient(135deg,#1f3b63,var(--t-accent,#2f6fb5));display:flex;align-items:center;justify-content:center;padding:16px;font:15px/1.5 'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}"
    + ".ttv-card{background:var(--t-card,#fff);border-radius:20px;padding:28px 26px;width:min(440px,100%);box-shadow:0 20px 60px rgba(0,0,0,.3);text-align:center;color:var(--t-ink,#1d2733)}"
    + ".ttv-card h1{font-size:23px;margin:6px 0 2px}.ttv-card p{color:var(--t-sub,#5b6773);margin:0 0 16px;font-size:13.5px}"
    + ".ttv-card input{width:100%;box-sizing:border-box;font:inherit;font-size:18px;border:2px solid var(--t-line,#dde3ea);border-radius:12px;padding:12px;margin-bottom:10px;text-align:center}"
    + ".ttv-card input:focus{outline:none;border-color:var(--t-accent,#2f6fb5)}.ttv-card .ttv-btn{width:100%;padding:13px;font-size:17px}"
    + ".ttv-band{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:1500;background:#1f3b63;color:var(--t-on,#fff);border-radius:0 0 12px 12px;padding:3px 6px 3px 12px;font:12.5px/1.6 'Malgun Gothic',system-ui,sans-serif;display:flex;gap:8px;align-items:center;box-shadow:0 2px 10px rgba(0,0,0,.2)}"
    + ".ttv-band button{font:inherit;font-weight:700;border:0;border-radius:8px;padding:2px 10px;background:#ffd36b;color:#3a2a00;cursor:pointer}"
    + ".ttv-note{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:1600;background:var(--t-ink,#1d2733);color:var(--t-on,#fff);border-radius:12px;padding:9px 12px 9px 16px;font:14px 'Malgun Gothic',system-ui,sans-serif;display:flex;gap:10px;align-items:center;max-width:94vw;box-shadow:0 6px 20px rgba(0,0,0,.25)}"
    + ".ttv-note button{font:inherit;font-weight:700;border:0;border-radius:8px;padding:4px 12px;background:#9cc8ff;color:#0d2440;cursor:pointer}"
    + ".ttv-chip{font:12px 'Malgun Gothic',system-ui,sans-serif;font-weight:700;border:0;border-radius:999px;padding:3px 10px;cursor:pointer;background:var(--t-ok-soft,#e3f3ea);color:var(--t-ok,#2e7d4f)}"
    + ".ttv-chip.err{background:var(--t-danger-soft,#fdeceb);color:var(--t-danger,#b3261e)}.ttv-chip.off{background:var(--t-chip,#eceff3);color:var(--t-sub,#5b6773)}"
    + ".tt-rail > .ttv-ri b{font-size:9.5px!important}"
    /* v2.10.0 교실 기기 잠금 화면: 왼쪽 시계·급식(공개 정보) / 오른쪽 이름 → 숫자 6자리 */
    + ".ttv-room{position:fixed;inset:0;z-index:2000;display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,600px);gap:24px;align-items:center;padding:24px 4vw;background:linear-gradient(135deg,#1f3b63,var(--t-accent,#2f6fb5));color:#fff;font:15px/1.5 'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif;overflow:hidden}"
    + "@media(max-width:760px){.ttv-room{grid-template-columns:1fr;align-content:center;padding:14px}.ttv-pub .ttv-clk{font-size:56px!important}.ttv-pub .ttv-meal{display:none}}"
    + ".ttv-pub .ttv-clk{font-size:min(15vw,150px);font-weight:800;letter-spacing:-2px;line-height:1}.ttv-pub .ttv-dt{font-size:22px;opacity:.9;margin-top:6px}.ttv-pub .ttv-sc{font-size:15px;opacity:.75;margin-top:2px}"
    + ".ttv-pub .ttv-meal{margin-top:22px;background:rgba(255,255,255,.12);border-radius:16px;padding:12px 16px;max-width:460px;font-size:15px}.ttv-pub .ttv-meal b{display:block;font-size:13px;opacity:.8;margin-bottom:2px}"
    + ".ttv-room .ttv-err{font-size:15px}.ttv-room .ttv-card{width:auto;max-height:calc(100vh - 48px);display:flex;flex-direction:column;padding:20px 20px 16px}"
    + ".ttv-room h1{font-size:24px;margin:0 0 2px}.ttv-room .sub{color:var(--t-sub,#5b6773);font-size:15px;margin:0 0 12px}"
    + ".ttv-names{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;overflow:auto;min-height:0;padding:2px}"
    + ".ttv-names>p{grid-column:1/-1;margin:4px 0}.ttv-names button{font:inherit;font-size:19px;font-weight:700;border:2px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);color:var(--t-ink,#1d2733);border-radius:14px;padding:12px 6px;cursor:pointer}"
    + ".ttv-names button:hover{border-color:var(--t-accent,#2f6fb5);background:var(--t-accent-soft,#e6f0fa)}.ttv-names button.lk{opacity:.5}"
    + ".ttv-dots{display:flex;gap:12px;justify-content:center;margin:6px 0 12px}.ttv-dots i{width:16px;height:16px;border-radius:50%;border:2px solid var(--t-accent,#2f6fb5)}.ttv-dots i.on{background:var(--t-accent,#2f6fb5)}"
    + ".ttv-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:380px;margin:0 auto;width:100%}"
    + ".ttv-keys button{font:inherit;font-size:26px;font-weight:700;border:0;background:var(--t-bg,#f3f6f9);color:var(--t-ink,#1d2733);border-radius:14px;height:min(9.5vh,72px);cursor:pointer}.ttv-keys button:active{background:var(--t-accent-soft,#e6f0fa)}.ttv-keys button.s{font-size:15px}"
    + ".ttv-room .lnk{display:flex;justify-content:space-between;gap:8px;margin-top:14px;font-size:15px}.ttv-room .lnk a{color:var(--t-accent,#2f6fb5);font-weight:700;text-decoration:none;cursor:pointer}"
    + ".ttv-code{font-size:64px;font-weight:800;letter-spacing:6px;color:var(--t-accent,#2f6fb5);margin:6px 0}"
    + ".ttv-old input{width:100%;box-sizing:border-box;font:inherit;font-size:17px;border:2px solid var(--t-line,#dde3ea);border-radius:12px;padding:10px;margin-bottom:8px;text-align:center}"
    + ".ttv-pin{border:1px solid var(--t-line,#dde3ea);border-radius:12px;padding:8px 12px;margin-top:10px}.ttv-pin h3{font-size:14.5px;margin:0 0 2px}"
    + ".ttv-pin input.ttv-pinin{letter-spacing:6px;text-align:center;display:block;width:100%;position:static}.ttv-pin .row{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr) auto;gap:8px;align-items:end}@media(max-width:520px){.ttv-pin .row{grid-template-columns:1fr 1fr}}"
    + ".ttv-big{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.ttv-big button{font:inherit;text-align:left;border:2px solid var(--t-line,#dde3ea);background:var(--t-card,#fff);border-radius:14px;padding:12px;cursor:pointer;color:var(--t-sub,#5b6773);font-size:13px}"
    + ".ttv-big button b{display:block;font-size:16px;color:var(--t-ink,#1d2733);margin-bottom:4px}.ttv-big button:hover{border-color:var(--t-accent,#2f6fb5);background:var(--t-accent-soft,#e6f0fa)}@media(max-width:520px){.ttv-big{grid-template-columns:1fr}}"
    + ".ttv-band .warn{background:#ffd36b;color:#3a2a00;border-radius:8px;padding:0 8px}"
    + ".ttv-room,.ttv-lock{visibility:visible!important}"   // v2.11.4 쌤비 디자인이 몸통을 잠깐 감춰도 수업 시작 화면은 바로 보이게
    + "@media print{.ttv-band,.ttv-note,.ttv-lock,.ttv-room{display:none!important}}";
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
  window.TT_VAULT = vault;   // PLAN_수업: 다른 화면(교과서 · 수업 리모컨)이 보관함 기능을 부를 때 (Promise → Vault)
  window.addEventListener("message", function(e){
    if(e.origin !== location.origin || !e.data || e.data.tt !== "vault") return;
    lastStatus = e.data.status; paintChip();
    if(e.data.type === "changed") onChanged(e.data.keys || []);
  });
  ["pointerdown", "keydown"].forEach(function(ev){ document.addEventListener(ev, function(){ touched = true; }, true); });
  function onChanged(keys){
    if(typeof window.TT_ON_CHANGED === "function"){ try{ window.TT_ON_CHANGED(keys); }catch(e){} return; }   /* v2.11.1: 수업 리모컨처럼 다시 불러올 필요 없는 화면은 조용히 처리 */
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
    if(!s || !s.mode) return {t:"☁️ 동기화 안 함", c:"off"};
    if(s.error) return {t:"⚠ 동기화 오류", c:"err"};
    if(s.busy) return {t:"🔄 맞추는 중…", c:""};
    return {t:"☁️ 동기화 " + stamp(s.last), c:""};
  }
  function paintChip(){
    var c = chipText();
    document.querySelectorAll(".ttv-chip").forEach(function(el){ el.textContent = c.t; el.className = "ttv-chip " + c.c; el.title = (lastStatus && lastStatus.error) || "기기 연결·동기화"; });
    document.querySelectorAll(".ttv-ri").forEach(function(el){ el.querySelector("span").textContent = c.c === "err" ? "⚠️" : "☁️"; el.title = c.c === "err" ? "동기화 오류" + ((lastStatus && lastStatus.error) ? ": " + lastStatus.error : "") : c.c === "off" ? "기기 연결·동기화 (아직 안 함)" : "마지막 동기화 " + (lastStatus && lastStatus.busy ? "…" : stamp(lastStatus && lastStatus.last)); });   // 막대 글자는 '동기화' 그대로(잘리지 않게), 시각은 마우스를 올리면
  }
  function placeChips(){
    if(CR) return;
    var foot = document.getElementById("count");                                   // 첫 화면 아래쪽
    var pv = document.querySelector("footer .priv");
    if(pv){ if(CR) pv.textContent = "🏫 교실 기기: 수업용 자료만 잠깐 열립니다. 창을 닫거나 20분 쉬면 자동으로 지워져요.";
      else if(personal) pv.textContent = "🔒 자료는 이 기기에 저장되고, 내 비밀 문구로 잠근 뒤에만 학교 보관함과 동기화됩니다."; }
    if(foot && !document.querySelector(".ttv-chip")){ var b = document.createElement("button"); b.type = "button"; b.className = "ttv-chip off"; b.onclick = open; foot.parentNode.insertBefore(b, foot); foot.parentNode.insertBefore(document.createTextNode(" "), foot); }
    var rail = document.querySelector(".tt-rail");                                  // 도구 화면 왼쪽 메뉴
    if(rail && !rail.querySelector(".ttv-ri")){ var a = document.createElement("a"); a.href = "#"; a.className = "tt-ri ttv-ri bd"; a.innerHTML = "<span>☁️</span><b>동기화</b>"; a.onclick = function(e){ e.preventDefault(); open(); }; (rail.querySelector(".tt-foot") || rail).appendChild(a); try{ window.dispatchEvent(new Event("resize")); }catch(e){} }
    paintChip();
  }

  /* ---------- 기기 연결 설정창 ---------- */
  var dlg = null;
  function dialog(html){
    if(dlg) dlg.remove();
    dlg = document.createElement("dialog"); dlg.className = "ttv-dlg"; dlg.innerHTML = html;
    var d = dlg; document.body.appendChild(d); d.addEventListener("close", function(){ d.remove(); if(dlg === d) dlg = null; });   // 닫기 신호가 늦게 와도 새로 연 창은 지우지 않게
    dlg.showModal(); return dlg;
  }
  function q(s){ return dlg.querySelector(s); }
  function serverPrefill(){ var s = J(LS("ttv_server")) || {}, b = J(LS("tt_board_v1")) || {}, d = (window.TT_GO_SCHOOLS || {})[""] || ""; return {url: s.url || b.url || d, pw: s.pw || b.pw || ""}; }   // d = 우리 학교 업무판 기본 주소(g/schools.js)
  function localData(){ var n = 0; try{ for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(/^tt_(roster|journal|timetable|guide|tardy|notes|record|seat|duty|book|stucard|alltt|staff|calendar)/.test(k || "")) n++; } }catch(e){} return n; }
  function open(want){
    if(typeof want !== "string") want = "";
    var dev = LS("ttv_device"), cfg = J(LS("ttv_vault"));
    if(dev === "classroom"){
      dialog('<h2>🏫 여러 선생님이 쓰는 기기</h2><p>이 기기는 <b>교실 기기(전자칠판)</b>로 정해져 있어요. 수업 때마다 이름을 누르고 숫자 6자리(또는 휴대폰)로 열고, 수업이 끝나면 이 기기에서 자료가 지워집니다.</p>'
        + '<label class="f">이 기기 이름 <small>(휴대폰 허락 창에 보여요)</small></label><input type="text" name="room" maxlength="20" value="' + esc(LS("ttv_room") || "") + '" placeholder="예: 3-2 교실 전자칠판">'
        + '<div class="ttv-err"></div><div class="acts"><button class="ttv-btn d" data-a="normal">나만 쓰는 기기로 되돌리기</button><div class="r"><button class="ttv-btn" data-a="close">닫기</button></div></div>');
      q("[data-a=close]").onclick = function(){ try{ localStorage.setItem("ttv_room", q("[name=room]").value.trim().slice(0, 20)); }catch(e){} dlg.close(); };
      q("[data-a=normal]").onclick = function(){ vault().then(function(V){ V.disconnect(); location.reload(); }); };
      return;
    }
    if(cfg && cfg.id){
      var s = lastStatus || {};
      dialog('<h2>☁️ 기기 연결·동기화</h2><p>이 기기는 <b>' + esc(cfg.id) + '</b> 보관함과 연결된 <b>내 기기</b>예요. 바뀐 내용은 잠긴 채로 학교 업무판 보관함에 자동으로 맞춰집니다.</p>'
        + '<div class="ttv-box">마지막 동기화: <b class="ttv-last">' + (s.last ? new Date(s.last).toLocaleString("ko-KR") : "—") + '</b>' + (s.error ? '<br><span style="color:var(--t-danger,#b3261e)">' + esc(s.error) + '</span>' : '') + '</div>'
        + '<div class="ttv-pin"><h3>🏫 교실 전자칠판에서 열기</h3><div class="pst" style="font-size:13px;color:var(--t-sub,#5b6773)">확인 중…</div>'
        + '<div class="row" hidden><div><label class="f">칠판에 보일 이름</label><input type="text" name="pname" maxlength="20" value="' + esc((TT.school.load() || {}).teacher || "") + '" placeholder="예: 김수학"></div>'
        + '<div><label class="f">숫자 6자리</label><input type="password" class="ttv-pinin" name="pin" inputmode="numeric" maxlength="6" autocomplete="new-password"></div>'
        + '<div><label class="f">한 번 더</label><input type="password" class="ttv-pinin" name="pin2" inputmode="numeric" maxlength="6" autocomplete="new-password"></div>'
        + '<button class="ttv-btn p" data-a="pinset">정하기</button></div></div>'
        + '<p>다른 기기 연결: 그 기기에서 <b>설정 → 시작 세팅 → 내 기기 연결</b>를 열고 같은 ID와 비밀 문구를 넣으세요. 전자칠판은 “여러 선생님이 쓰는 기기”로 정하세요.</p>'
        + '<div class="ttv-err"></div><div class="acts"><button class="ttv-btn d" data-a="off">이 기기 연결 끊기</button><div class="r"><button class="ttv-btn" data-a="close">닫기</button><button class="ttv-btn p" data-a="now">지금 동기화</button></div></div>'
        + '<p style="margin-top:14px;font-size:12px">보관함을 아예 없애려면 <a href="#" data-a="wipe" style="color:var(--t-danger,#b3261e)">보관함 지우기</a> (학교 업무판에 있는 내 자료와 ID가 지워지고, 이 기기의 자료는 남아요)</p>');
      q("[data-a=close]").onclick = function(){ dlg.close(); };
      pinBox();
      q("[data-a=now]").onclick = function(){ var b = this; b.disabled = true; b.textContent = "맞추는 중…";
        vault().then(function(V){ return V.syncNow(); }).then(function(r){ b.disabled = false; b.textContent = "지금 동기화"; q(".ttv-last").textContent = r.last ? new Date(r.last).toLocaleString("ko-KR") : "—"; q(".ttv-err").textContent = r.error || ""; }); };
      q("[data-a=off]").onclick = function(){ if(!confirm2(this, "정말 끊을까요?")) return; vault().then(function(V){ V.disconnect(); location.reload(); }); };
      q("[data-a=wipe]").onclick = function(e){ e.preventDefault(); if(!confirm2(this, "정말 지울까요? 다시 누르면 지웁니다")) return;
        vault().then(function(V){ return V.wipeServer(); }).then(function(r){ if(r.error) q(".ttv-err").textContent = r.error; else location.reload(); }); };
      return;
    }
    var p = serverPrefill();
    dialog('<h2>☁️ 기기 연결·동기화</h2>'
      + '<p>교무실 PC·휴대폰·교실 전자칠판에서 같은 자료를 쓰도록 연결합니다. 자료는 <b>이 기기에서 비밀 문구로 잠근 뒤</b> 학교 업무판 보관함에 맡겨지고, 업무판 관리자나 구글도 내용을 볼 수 없어요.</p>'
      + '<div class="seg2"><label><input type="radio" name="kind" value="personal"' + (want === "classroom" ? "" : " checked") + '><b>💻 나만 쓰는 기기</b>교무실 PC, 내 휴대폰</label><label><input type="radio" name="kind" value="classroom"' + (want === "classroom" ? " checked" : "") + '><b>🏫 여러 선생님이 쓰는 기기</b>교실 전자칠판·교실 PC</label></div>'
      + '<label class="f">학교 업무판 주소</label><input type="url" name="url" value="' + esc(p.url) + '" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off" spellcheck="false">'
      + '<div class="two"><div><label class="f">학교 공용 비밀번호</label><input type="password" name="pw" value="' + esc(p.pw) + '" autocomplete="off"></div>'
      + '<div class="mine"><label class="f">내 ID <small>(영문 소문자·숫자)</small></label><input type="text" name="id" placeholder="예: ssam3" autocomplete="off" spellcheck="false" autocapitalize="off"></div></div>'
      + '<div class="room" hidden><label class="f">이 기기 이름 <small>(휴대폰 허락 창에 보여요)</small></label><input type="text" name="room" maxlength="20" placeholder="예: 3-2 교실 전자칠판"></div>'
      + '<div class="two mine"><div><label class="f">비밀 문구 <small>(8자 이상)</small></label><input type="password" name="pass" placeholder="나만 아는 문장" autocomplete="new-password"></div>'
      + '<div><label class="f pass2" hidden>비밀 문구 한 번 더</label><input type="password" name="pass2" hidden autocomplete="new-password"></div></div>'
      + '<p class="hint">⚠ 비밀 문구를 잊으면 보관함을 아무도 열 수 없어요(되찾기 불가). 이 기기 자료는 남으니 전체 백업도 함께 해 두세요.</p>'
      + '<div class="ttv-err"></div><div class="acts"><span></span><div class="r"><button class="ttv-btn" data-a="close">취소</button><button class="ttv-btn p" data-a="go">연결</button></div></div>');
    function kind(){ return q("input[name=kind]:checked").value; }
    var mine = localData();
    function kindUI(){
      var c = kind() === "classroom"; dlg.querySelectorAll(".mine").forEach(function(e){ e.hidden = c; }); q(".room").hidden = !c;
      q(".hint").innerHTML = c ? "선생님마다 <b>나만 쓰는 기기</b>(휴대폰·교무실 PC)에서 ‘교실에서 쓸 번호’를 정해 두면, 이 기기에서는 이름을 누르고 숫자 6자리(또는 휴대폰)로 열어요. 교시가 끝나거나 20분 동안 쓰지 않으면 잠기고 자료가 지워집니다."
        + (mine ? '<br><b style="color:var(--t-danger,#b3261e)">⚠ 이 기기에 있는 자료(' + mine + '가지)가 지워져요.</b> <a href="#" class="bk">먼저 전체 백업하기</a>' : "")
        : "⚠ 비밀 문구를 잊으면 보관함을 아무도 열 수 없어요(되찾기 불가). 이 기기 자료는 남으니 전체 백업도 함께 해 두세요.";
      var bk = q(".hint .bk"); if(bk) bk.onclick = function(e){ e.preventDefault(); try{ TT.backup.save(); }catch(er){} };
      q("[data-a=go]").textContent = c ? "이 기기를 교실 기기로 정하기" : "연결"; }
    dlg.querySelectorAll("input[name=kind]").forEach(function(r){ r.onchange = kindUI; });
    if(want === "classroom") kindUI();
    q("[data-a=close]").onclick = function(){ dlg.close(); };
    var creating = false;
    q("[data-a=go]").onclick = function(){
      var b = this, err = q(".ttv-err"); err.textContent = "";
      var o = {url: q("[name=url]").value.trim(), pw: q("[name=pw]").value, id: q("[name=id]").value.trim().toLowerCase(), pass: q("[name=pass]").value};
      if(kind() === "classroom"){
        if(mine && !confirm2(b, "자료가 지워져요. 다시 누르면 정합니다")) return;
        var room = q("[name=room]").value.trim().slice(0, 20);
        vault().then(function(V){ var r = V.setClassroom(o); if(r.error){ err.textContent = r.error; return; } try{ localStorage.setItem("ttv_room", room); localStorage.setItem("ttv_kind", "shared"); }catch(e){} location.href = BASE; });
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
        try{ localStorage.setItem("ttv_kind", "personal"); }catch(e){}
        dlg.close(); note(r.created ? "보관함을 만들고 이 기기 자료를 잠가서 올렸어요." : "보관함과 연결했어요. 보관함 내용을 받았습니다.");
        setTimeout(function(){ location.reload(); }, 1200);
      });
    };
    setTimeout(function(){ (!p.url ? q("[name=url]") : !p.pw ? q("[name=pw]") : kind() === "classroom" ? q("[name=room]") : q("[name=id]")).focus(); }, 30);
  }
  function confirm2(el, text){ if(el.dataset.sure) return true; el.dataset.sure = "1"; el.dataset.old = el.textContent; el.textContent = text; setTimeout(function(){ el.textContent = el.dataset.old; delete el.dataset.sure; }, 4000); return false; }

  /* ---------- 교실 기기 ---------- */
  /* ----- 공개 정보(잠긴 화면용): 학교 이름·급식 학교 코드·교시 시각 — 학생 자료 아님 ----- */
  function pub(){ return J(LS("ttv_pub")) || {}; }
  function savePub(extra){
    var sc = J(LS("tt_school_v1")) || {}, t = J(LS("tt_timetable_v1")) || {}, o = pub();
    if(sc.neisA && sc.neisS){ o.neisA = sc.neisA; o.neisS = sc.neisS; o.neisKey = sc.neisKey || ""; }
    if(Array.isArray(t.periods) && t.periods.length) o.periods = t.periods.map(function(p){ return {n: p.n, t: p.t}; });
    Object.assign(o, extra || {});
    try{ localStorage.setItem("ttv_pub", JSON.stringify(o)); }catch(e){}
  }
  function toMin(t){ var a = String(t || "").split(":"); return a.length === 2 ? (+a[0]) * 60 + (+a[1]) : NaN; }
  function periods(){
    var t = J(LS("tt_timetable_v1")), P = t && Array.isArray(t.periods) && t.periods.length ? t.periods : (pub().periods || []);
    return P.map(function(p){ return toMin(p.t); }).filter(function(m){ return !isNaN(m); }).sort(function(a, b){ return a - b; });
  }
  function at(d, m){ var u = new Date(d); u.setHours(0, m, 0, 0); return u.getTime(); }
  /* 지금(또는 10분 안에 시작하는) 교시가 끝나는 시각. 수업 시간이 아니면 0(→ 20분 쉬면 잠김만) */
  function periodEnd(now){
    var d = new Date(now), w = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), P = periods();
    if(w < 1 || w > 5) return 0;
    for(var i = 0; i < P.length; i++) if(m >= P[i] - 10 && m < P[i] + 45) return at(d, P[i] + 45);
    return 0;
  }
  /* [계속 쓰기]: 바로 이어지는 교시가 있으면 그 교시 끝까지, 없으면 10분 더 */
  function extendEnd(until){
    var d = new Date(until), m = d.getHours() * 60 + d.getMinutes(), P = periods();
    for(var i = 0; i < P.length; i++) if(P[i] >= m - 1 && P[i] - m <= 15) return at(d, P[i] + 45);
    return until + 10 * 60000;
  }
  function setSes(f){ try{ var x = JSON.parse(sessionStorage.getItem("ttv_session")); if(x){ f(x); sessionStorage.setItem("ttv_session", JSON.stringify(x)); } }catch(e){} }
  function opened(r, name){
    savePub();
    var u = periodEnd(Date.now()); setSes(function(x){ x.until = u; });
    try{ TT.ui.toast((name || "선생님") + " 수업 시작" + (u ? " · " + new Date(u).toTimeString().slice(0, 5) + "에 잠겨요" : "")); }catch(e){}
    setTimeout(function(){ location.reload(); }, 400);
  }
  function mealLine(box){
    var o = pub(); if(!o.neisA || !o.neisS) return;
    var d = new Date(), ymd = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var u = "https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=5" + (o.neisKey ? "&KEY=" + encodeURIComponent(o.neisKey) : "") + "&ATPT_OFCDC_SC_CODE=" + encodeURIComponent(o.neisA) + "&SD_SCHUL_CODE=" + encodeURIComponent(o.neisS) + "&MLSV_YMD=" + ymd;
    fetch(u).then(function(r){ return r.json(); }).then(function(j){
      var a = j && j.mealServiceDietInfo, row = a && a[1] && a[1].row; if(!row || !row.length) return;
      var x = row.filter(function(r){ return r.MMEAL_SC_NM === "중식"; })[0] || row[0];
      var L = String(x.DDISH_NM || "").split(/<br\s*\/?>/i).map(function(t){ return t.replace(/\s*\([\d.\s]+\)/g, "").replace(/[\d.]+$/, "").trim(); }).filter(Boolean);
      if(L.length){ box.hidden = false; box.innerHTML = "<b>🍚 오늘 급식</b>" + esc(L.join(" · ")); }
    }).catch(function(){});
  }

  /* ---------- 교실 기기: 잠긴 화면 (이름 → 숫자 6자리 / 휴대폰으로) ---------- */
  function lockScreen(){
    var srv = J(LS("ttv_server")) || {}, P = pub();
    var box = document.createElement("div"); box.className = "ttv-room"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "수업 시작");
    box.innerHTML = '<div class="ttv-pub"><div class="ttv-clk"></div><div class="ttv-dt"></div><div class="ttv-sc">' + esc(P.school || "") + '</div><div class="ttv-meal" hidden></div></div>'
      + '<div class="ttv-card"></div>';
    document.body.appendChild(box);
    var card = box.querySelector(".ttv-card"), list = null, cur = null, pin = "", waitT = null, busy = false;
    function tick(){ var d = new Date(); box.querySelector(".ttv-clk").textContent = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      box.querySelector(".ttv-dt").textContent = (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + "일월화수목금토"[d.getDay()] + "요일"; }
    tick(); setInterval(tick, 10000); mealLine(box.querySelector(".ttv-meal"));
    function foot(back){ return '<div class="lnk">' + (back ? '<a data-a="back">← 다른 선생님</a>' : '<a data-a="old">ID로 열기</a>') + '<a data-a="cfg">기기 설정</a></div>'; }
    function wire(){
      var x;
      if((x = card.querySelector("[data-a=back]"))) x.onclick = names;
      if((x = card.querySelector("[data-a=cfg]"))) x.onclick = function(){ open(); };
      if((x = card.querySelector("[data-a=old]"))) x.onclick = oldForm;
    }
    function names(){
      clearTimeout(waitT); cur = null; pin = "";
      card.innerHTML = '<h1>🏫 수업 시작</h1><p class="sub">내 이름을 누르세요.</p><div class="ttv-names"><p class="sub">불러오는 중…</p></div><div class="ttv-err"></div>' + foot(false);
      wire();
      if(!srv.url){ card.querySelector(".ttv-names").innerHTML = '<p class="sub" style="color:var(--t-danger,#b3261e)">학교 업무판 주소가 없어요. 아래 “기기 설정”에서 넣어 주세요.</p>'; return; }
      var paint = function(j){
        var g = card.querySelector(".ttv-names"); if(!g) return;
        if(j.error){ g.innerHTML = '<p class="sub" style="color:var(--t-danger,#b3261e)">' + esc(j.error) + '</p>'; return; }
        if(j.school && j.school !== P.school){ savePub({school: j.school}); P.school = j.school; box.querySelector(".ttv-sc").textContent = j.school; }
        list = j.items || [];
        if(!list.length){ g.innerHTML = '<p class="sub">아직 교실 열기를 정한 선생님이 없어요.<br>내 휴대폰이나 교무실 PC의 쌤 노트에서 <b>설정 → 시작 세팅 → 내 기기 연결 → 교실 전자칠판에서 열기</b>로 번호를 정하면 여기에 이름이 나와요.</p>'; return; }
        g.innerHTML = list.map(function(t, i){ return '<button type="button" data-i="' + i + '"' + (t.locked ? ' class="lk" title="번호가 여러 번 틀려 잠겼어요"' : "") + '>' + (t.locked ? "🔒 " : "") + esc(t.name) + '</button>'; }).join("");
        g.querySelectorAll("button").forEach(function(b){ b.onclick = function(){ keypad(list[+b.dataset.i]); }; });
      };
      if(list) paint({items: list});
      vault().then(function(V){ return V.roomList(); }).then(paint);
    }
    function keypad(t){
      cur = t; pin = "";
      card.innerHTML = '<h1>' + esc(t.name) + ' 선생님</h1><p class="sub">숫자 6자리를 누르세요.</p><div class="ttv-dots">' + "<i></i>".repeat(6) + '</div>'
        + '<div class="ttv-keys">' + [1,2,3,4,5,6,7,8,9].map(function(n){ return '<button type="button" data-k="' + n + '">' + n + '</button>'; }).join("") + '<button type="button" class="s" data-k="c">지우기</button><button type="button" data-k="0">0</button><button type="button" class="s" data-k="b">⌫</button></div>'
        + '<div class="ttv-err"></div><div class="lnk"><a data-a="back">← 다른 선생님</a><a data-a="phone">📲 휴대폰으로 열기</a></div>';
      wire();
      card.querySelector("[data-a=phone]").onclick = function(){ phone(t); };
      card.querySelectorAll(".ttv-keys button").forEach(function(b){ b.onclick = function(){ key(b.dataset.k); }; });
      if(t.locked) card.querySelector(".ttv-err").textContent = "번호가 5번 틀려 잠겼어요. 휴대폰으로 열거나, 내 기기에서 번호를 다시 정해 주세요.";
    }
    function dots(){ card.querySelectorAll(".ttv-dots i").forEach(function(d, i){ d.className = i < pin.length ? "on" : ""; }); }
    function key(k){
      if(busy || !cur || !card.querySelector(".ttv-keys")) return;
      if(k === "c") pin = ""; else if(k === "b") pin = pin.slice(0, -1); else if(pin.length < 6) pin += k;
      dots();
      if(pin.length === 6) go();
    }
    function go(){
      busy = true; var err = card.querySelector(".ttv-err"); err.style.color = "var(--t-sub,#5b6773)"; err.textContent = "여는 중…";
      var p = pin; pin = "";
      vault().then(function(V){ return V.roomOpen({h: cur.h, salt: cur.salt, pin: p}); }).then(function(r){
        busy = false;
        if(r.ok){ opened(r, cur.name); return; }
        dots(); err.style.color = ""; err.textContent = r.error || "열지 못했어요.";
        if(/잠겼/.test(r.error || "")) cur.locked = true;
      });
    }
    function phone(t){
      clearTimeout(waitT);
      card.innerHTML = '<h1>📲 휴대폰으로 열기</h1><p class="sub">' + esc(t.name) + ' 선생님 휴대폰에서 쌤 노트를 여세요. “열기” 창이 뜨면 아래 숫자가 같은지 확인하고 누르세요.</p><div class="ttv-code">··</div><div class="ttv-err"></div><div class="lnk"><a data-a="back">← 다른 선생님</a><a data-a="pin">숫자로 열기</a></div>';
      wire(); card.querySelector("[data-a=pin]").onclick = function(){ clearTimeout(waitT); keypad(t); };
      var err = card.querySelector(".ttv-err"), start = Date.now();
      vault().then(function(V){
        return V.roomAsk({h: t.h, room: LS("ttv_room") || "교실 기기"}).then(function(a){
          if(a.error){ err.textContent = a.error; return; }
          var c = card.querySelector(".ttv-code"); if(c) c.textContent = a.code;
          (function poll(){
            if(!card.querySelector(".ttv-code")) return;
            if(Date.now() - start > 170000){ err.textContent = "시간이 지났어요. 다시 눌러 주세요."; return; }
            V.roomWait({r: a.r}).then(function(r){
              if(!card.querySelector(".ttv-code")) return;
              if(r.ok){ opened(r, t.name); return; }
              if(r.error){ err.textContent = r.error; return; }
              waitT = setTimeout(poll, 3000);
            });
          })();
        });
      });
    }
    function oldForm(){
      card.innerHTML = '<form class="ttv-old" autocomplete="off"><h1>ID로 열기</h1><p class="sub">보관함 ID와 비밀 문구로 엽니다.</p><input name="id" placeholder="선생님 ID" autocapitalize="off" spellcheck="false"><input name="pass" type="password" placeholder="비밀 문구"><div class="ttv-err"></div><button class="ttv-btn p" type="submit" style="width:100%">수업 시작</button></form>' + foot(true);
      wire();
      var f = card.querySelector("form"); f.id.focus();
      f.onsubmit = function(e){
        e.preventDefault();
        var b = f.querySelector("button[type=submit]"), err = f.querySelector(".ttv-err");
        b.disabled = true; b.textContent = "여는 중…"; err.textContent = "";
        vault().then(function(V){ return V.unlock({id: f.id.value, pass: f.pass.value}); }).then(function(r){
          if(r.error){ err.textContent = r.error; b.disabled = false; b.textContent = "수업 시작"; f.pass.value = ""; return; }
          setSes(function(x){ x.mask = true; x.name = x.id; }); opened(r, "");
        });
      };
    }
    document.addEventListener("keydown", function(e){
      if(!card.querySelector(".ttv-keys")) return;
      if(/^\d$/.test(e.key)){ e.preventDefault(); key(e.key); } else if(e.key === "Backspace"){ e.preventDefault(); key("b"); } else if(e.key === "Escape") names();
    });
    names();
  }
  function lockNow(){ vault().then(function(V){ return V.lock(); }).then(function(){ location.href = BASE; }); }
  function classroomBand(){
    var band = document.createElement("div"); band.className = "ttv-band";
    band.innerHTML = '<span>🏫 <b>' + esc(CR.name || CR.id) + '</b> 선생님 수업 중</span><span class="left"></span><button type="button" class="more" hidden>계속 쓰기</button><button type="button" class="end">수업 끝 · 잠그기</button>';
    band.querySelector(".end").onclick = lockNow;
    band.querySelector(".more").onclick = function(){ setSes(function(x){ x.until = x.until ? extendEnd(x.until) : 0; x.last = Date.now(); }); check(); };
    document.body.appendChild(band);
    var last = Date.now();
    function bump(){ var now = Date.now(); if(now - last < 10000) return; last = now; setSes(function(x){ x.last = now; }); }
    ["pointerdown", "keydown", "wheel"].forEach(function(ev){ document.addEventListener(ev, bump, true); });
    function check(){
      var s = null; try{ s = JSON.parse(sessionStorage.getItem("ttv_session")); }catch(e){}
      if(!s){ lockNow(); return; }
      var now = Date.now(), idle = 20 * 60000 - (now - (s.last || 0)), end = s.until ? s.until - now : Infinity;
      var L = band.querySelector(".left"), M = band.querySelector(".more");
      if(end <= 0 || idle <= 0){ lockNow(); return; }
      if(end < 2 * 60000){ L.innerHTML = '<span class="warn">⏰ 수업 끝 · ' + Math.ceil(end / 60000) + '분 뒤 잠겨요</span>'; M.hidden = false; }
      else { M.hidden = true; L.textContent = idle < 3 * 60000 ? "· " + Math.ceil(idle / 60000) + "분 뒤 잠김" : (s.until ? "· " + new Date(s.until).toTimeString().slice(0, 5) + "까지" : ""); }
    }
    check(); setInterval(check, 10000);
  }
  /* ---------- 내 기기: 교실 칠판 열기 번호 정하기 ---------- */
  function pinBox(){
    var st = q(".pst"), row = q(".ttv-pin .row");
    function show(r){
      if(!dlg || !st) return;
      if(r.error){ st.textContent = r.error; return; }
      if(r.set){ try{ localStorage.setItem("ttv_pin", "1"); }catch(e){}
        st.innerHTML = (r.locked ? '<b style="color:var(--t-danger,#b3261e)">⛔ 번호가 5번 틀려 잠겼어요.</b> 번호를 다시 정하면 풀려요. ' : '✅ 칠판에 <b>' + esc(r.name) + '</b>(으)로 보여요. ')
          + '<a href="#" data-p="re">' + (r.locked ? "번호 다시 정하기" : "번호 바꾸기") + '</a> · <a href="#" data-p="off">교실 열기 끄기</a>';
        if(r.name) q("[name=pname]").value = r.name;
        st.querySelector("[data-p=re]").onclick = function(e){ e.preventDefault(); row.hidden = false; q("[name=pin]").focus(); };
        st.querySelector("[data-p=off]").onclick = function(e){ e.preventDefault(); if(!confirm2(this, "다시 누르면 끕니다")) return;
          vault().then(function(V){ return V.pinOff(); }).then(function(x){ if(x.error){ q(".ttv-err").textContent = x.error; return; } try{ localStorage.removeItem("ttv_pin"); }catch(e){} show({set: false}); }); };
        if(r.locked) row.hidden = false;
      } else {
        try{ localStorage.removeItem("ttv_pin"); localStorage.setItem("ttv_pinchk", String(Date.now())); }catch(e){}
        st.innerHTML = '전자칠판에서 <b>이름을 누르고 숫자 6자리</b>로 내 수업 환경을 열 수 있어요. 번호는 이 기기에서만 정하고, 5번 틀리면 잠겨요.'; row.hidden = false;
      }
    }
    vault().then(function(V){ return V.pinStatus(); }).then(show);
    q("[data-a=pinset]").onclick = function(){
      var b = this, err = q(".ttv-err"), a = q("[name=pin]").value, a2 = q("[name=pin2]").value;
      err.textContent = "";
      if(a !== a2){ err.textContent = "두 번 넣은 숫자가 달라요."; return; }
      b.disabled = true; b.textContent = "정하는 중…";
      vault().then(function(V){ return V.pinSet({name: q("[name=pname]").value, pin: a}); }).then(function(r){
        b.disabled = false; b.textContent = "정하기"; q("[name=pin]").value = ""; q("[name=pin2]").value = "";
        if(r.error){ err.textContent = r.error; return; }
        row.hidden = true; show({set: true, name: r.name}); note("교실 열기 번호를 정했어요. 전자칠판에서 이름을 누르세요.");
      });
    };
  }
  /* ---------- 내 기기: 칠판에서 온 "휴대폰으로 열기" 요청 ---------- */
  var seenReq = {}, roomT = null, roomUntil = 0;
  function roomCheck(){
    if(!personal || LS("ttv_pin") !== "1" || document.hidden) return;
    vault().then(function(V){ return V.roomPending().then(function(j){
      (j.items || []).forEach(function(it){
        if(seenReq[it.r] || document.querySelector("dialog[open]")) return; seenReq[it.r] = 1;
        dialog('<h2>📲 교실 기기 열기</h2><p><b>' + esc(it.room || "교실 기기") + '</b>에서 내 수업 환경을 열려고 해요.</p>'
          + '<div class="ttv-box" style="text-align:center">칠판 화면의 숫자가 <b style="font-size:34px;letter-spacing:4px;color:var(--t-accent,#2f6fb5)">' + esc(it.code) + '</b> 인가요?</div>'
          + '<p>내가 누른 게 아니면 <b>아니요</b>를 누르세요. 열린 칠판은 교시가 끝나면 저절로 잠겨요.</p>'
          + '<div class="ttv-err"></div><div class="acts"><span></span><div class="r"><button class="ttv-btn" data-a="no">아니요</button><button class="ttv-btn p" data-a="yes">맞아요, 열기</button></div></div>');
        q("[data-a=no]").onclick = function(){ V.roomApprove({r: it.r, no: true}); dlg.close(); };
        q("[data-a=yes]").onclick = function(){ var b = this; b.disabled = true; b.textContent = "보내는 중…";
          V.roomApprove({r: it.r, pub: it.pub}).then(function(r){ if(r.error){ q(".ttv-err").textContent = r.error; b.disabled = false; b.textContent = "맞아요, 열기"; return; } dlg.close(); note("교실 기기를 열었어요."); }); };
      });
    }); });
  }
  function roomWatch(){                                                            // 화면을 켠 뒤 3분 동안만 20초마다 확인(서버 부담 줄이기)
    if(!personal) return;
    if(LS("ttv_pin") !== "1"){                                                     // 다른 기기에서 번호를 정했을 수도 있으니 한 시간에 한 번 확인
      var last = +(LS("ttv_pinchk") || 0); if(Date.now() - last < 36e5) return;
      try{ localStorage.setItem("ttv_pinchk", String(Date.now())); }catch(e){}
      vault().then(function(V){ return V.pinStatus(); }).then(function(r){ if(r && r.set){ try{ localStorage.setItem("ttv_pin", "1"); }catch(e){} roomWatch(); } });
      return;
    }
    roomUntil = Date.now() + 3 * 60000; clearInterval(roomT);
    setTimeout(roomCheck, 1500);
    roomT = setInterval(function(){ if(Date.now() > roomUntil){ clearInterval(roomT); return; } roomCheck(); }, 20000);
  }
  /* ---------- 처음 한 번: 이 기기는 누가 쓰나요? ---------- */
  function firstRun(){
    if(here || CR || !document.getElementById("mBoard") || LS("ttv_device") || LS("ttv_vault") || LS("ttv_kind") || /[?&](legacy|invite|room)=/.test(location.search)) return;
    setTimeout(function(){
      if(document.querySelector("dialog[open]")) return;
      dialog('<h2>이 기기는 누가 쓰나요?</h2><p>처음 한 번만 고르면 돼요. 나중에 <b>설정 → 시작 세팅 → 내 기기 연결</b>에서 바꿀 수 있어요.</p>'
        + '<div class="ttv-big"><button type="button" data-k="personal"><b>💻 나만 쓰는 기기</b>교무실 PC·내 휴대폰<br>· 자료가 이 기기에 늘 저장돼요<br>· 모든 도구를 써요</button>'
        + '<button type="button" data-k="shared"><b>🏫 여러 선생님이 쓰는 기기</b>교실 전자칠판·교실 PC<br>· 이름 누르고 숫자 6자리로 열어요<br>· 수업 도구만, 끝나면 자료가 지워져요</button></div>'
        + '<div class="acts"><span></span><div class="r"><button class="ttv-btn" data-a="later">나중에</button></div></div>');
      function set(v){ try{ localStorage.setItem("ttv_kind", v); }catch(e){} }
      dlg.addEventListener("cancel", function(){ set("later"); });
      q("[data-a=later]").onclick = function(){ set("later"); dlg.close(); };
      q("[data-k=personal]").onclick = function(){ set("personal"); dlg.close(); note("나만 쓰는 기기로 정했어요. 자료는 이 기기에 저장됩니다."); };
      q("[data-k=shared]").onclick = function(){ dlg.close(); open("classroom"); };
    }, 1800);
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
    if(personal){ vault(); roomWatch(); document.addEventListener("visibilitychange", function(){ if(!document.hidden) roomWatch(); }); }
    firstRun();
    if(/[?&]room=1\b/.test(location.search) && document.getElementById("mBoard")){   // v2.40 교실 기기 QR → 학기초 세팅에서 비밀번호 확인 → 여기서 교실 기기로 정하기
      try{ history.replaceState(null, "", location.pathname + location.hash); }catch(e){}
      setTimeout(function(){ open("classroom"); }, 700);
    }
    placeChips();
    setTimeout(placeChips, 600);                                                     // 왼쪽 메뉴가 늦게 그려질 때
    var mb = document.getElementById("mBoard");                                      // 첫 화면 ⋯ 메뉴에 "기기 연결·동기화" 추가
    if(mb && !document.getElementById("mVault")){ var m = document.createElement("button"); m.type = "button"; m.id = "mVault"; m.textContent = "기기 연결·동기화"; m.onclick = function(){ var d = document.getElementById("more"); if(d) d.open = false; open(); }; mb.parentNode.insertBefore(m, mb.nextSibling); }
  }
  TT.vault = {open: function(){ open(); }, lock: lockNow};
  function boot(){ withTools(start); }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
