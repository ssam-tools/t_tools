/* 쌤 노트 v2.52 · 🛡️ 관리자 모드 (PLAN_금고 1단계)
   - 관리자 비밀번호를 학교 업무판(board/Admin.gs)에서 확인 → 30분짜리 표(tok)를 이 창(sessionStorage)에만 둡니다.
     관리자 요청을 할 때마다 표가 새로 와서 30분이 다시 시작됩니다. 창을 닫으면 끝납니다.
   - 두 단계: 최고 관리자(LIB_ADMIN) · 관리자(담당자, 최고 관리자가 만듦).
   - 교실 기기(전자칠판 등 공용)에서는 관리자 모드를 켤 수 없습니다.
   - 관리자 모드인 동안에는 어느 화면에서나 맨 위 가운데에 "🛡️ 관리자 모드 · 이름 · 남은 시간 [끝내기]"가 보입니다. */
(function(){
  "use strict";
  if(window.TT_ADMIN) return;
  var K = "ttadm_s", DEVK = "ttadm_dev", LIBK = "tt_lib_admin";
  var URL_RE = /^https:\/\/script\.google\.com\/(?:a\/macros\/[^\/?#\s]+|macros)\/s\/[\w-]+\/exec$/;
  var subs = [];
  function SS(){ try{ return window.sessionStorage; }catch(e){ return null; } }
  function LS(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function board(){
    if(window.TTSet && TTSet.board) return TTSet.board();
    var B = {}; try{ B = JSON.parse(LS("tt_board_v1") || "null") || {}; }catch(e){}
    return B;
  }
  function classroom(){ return !!(window.TT && TT.classroom) || LS("ttv_device") === "classroom"; }
  function dev(){ var d = LS(DEVK); if(!d){ d = Math.random().toString(36).slice(2) + Date.now().toString(36); try{ localStorage.setItem(DEVK, d); }catch(e){} } return d; }
  function state(){
    var s = null; try{ s = JSON.parse(SS().getItem(K) || "null"); }catch(e){}
    if(s && !(s.exp > Date.now())){ try{ SS().removeItem(K); SS().removeItem(LIBK); }catch(e){} s = null; }
    return s;
  }
  function fire(){ subs.forEach(function(f){ try{ f(state()); }catch(e){} }); paint(); }
  function save(r){ try{ SS().setItem(K, JSON.stringify({tok: r.tok, exp: r.exp, role: r.role, name: r.name})); }catch(e){} fire(); return r; }
  function api(action, extra){
    var c = board();
    if(!c.url || !URL_RE.test(c.url) || !c.pw) return Promise.reject(new Error("NOBOARD"));
    return fetch(c.url, {method: "POST", redirect: "follow", credentials: "omit", cache: "no-store", headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify(Object.assign({action: action, pw: c.pw}, extra || {}))})
      .then(function(r){ if(!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function(t){ var j; try{ j = JSON.parse(t); }catch(e){ throw new Error("NO_DOPOST"); } if(!j.ok) throw new Error(j.error || "오류"); return j; });
  }
  /* 관리자 요청: 표를 붙여 보내고, 새 표를 받으면 30분 다시 시작 */
  function call(action, extra){
    var s = state(); if(!s) return Promise.reject(new Error("ADMIN_EXPIRED"));
    return api(action, Object.assign({tok: s.tok}, extra || {})).then(function(r){ if(r.tok) save(r); return r; }, function(e){
      if(/ADMIN_EXPIRED/.test(String(e && e.message))) end(true);
      throw e;
    });
  }
  function login(pw, name){
    if(classroom()) return Promise.reject(new Error("ROOM"));
    return api("admlogin", {admin: pw, name: name || "", dev: dev()}).then(function(r){
      save(r);
      if(r.role === "super"){ try{ SS().setItem(LIBK, pw); }catch(e){} }   // 자료실·짧은 주소의 예전 관리자 기능도 이 창에서 바로 (창을 닫으면 사라짐)
      return r;
    });
  }
  function end(expired){
    try{ SS().removeItem(K); SS().removeItem(LIBK); }catch(e){}
    fire();
    if(window.TT && TT.ui && TT.ui.toast) TT.ui.toast(expired ? "🛡️ 관리자 모드 시간이 끝났어요" : "🛡️ 관리자 모드를 끝냈어요");
  }
  function errText(e){
    var m = String(e && e.message || e);
    if(m === "NOBOARD") return "먼저 ⋯ → 학교 업무판 연결에서 주소와 공용 비밀번호를 넣어 주세요.";
    if(m === "ROOM") return "교실 기기(공용)에서는 관리자 모드를 켤 수 없어요.";
    if(m === "ADMIN_EXPIRED") return "관리자 모드 시간이 끝났어요. 다시 관리자 비밀번호를 넣어 주세요.";
    if(m === "CONFLICT") return "다른 관리자가 먼저 올렸어요. 새로 받은 뒤 다시 고쳐 주세요.";
    if(m === "AUTH") return "업무판 공용 비밀번호가 바뀌었어요. ⋯ → 학교 업무판 연결에서 다시 넣어 주세요.";
    if(m === "NO_DOPOST" || /지원하지 않는/.test(m)) return "학교 업무판에 관리자 기능(Admin.gs)이 아직 없어요. 담당자께 '관리자_금고_설정안내'를 부탁해 주세요.";
    if(/^HTTP|Failed to fetch|NetworkError/.test(m)) return "학교 업무판에 연결하지 못했어요. 인터넷을 확인해 주세요.";
    return m;
  }
  function isSuper(){ var s = state(); return !!(s && s.role === "super"); }
  function on(f){ subs.push(f); }

  /* ── 맨 위 가운데 표시 (어느 화면에서나) · 움직이고 있으면 끝나기 10분 전에 저절로 연장 ── */
  var pill = null, lastAct = Date.now(), lastPing = 0;
  ["pointerdown", "keydown"].forEach(function(t){ document.addEventListener(t, function(){ lastAct = Date.now(); }, true); });
  function paint(){
    var s = state();
    if(!s){ if(pill){ pill.remove(); pill = null; } return; }
    if(!document.body) return;
    if(!pill){
      pill = document.createElement("div"); pill.id = "ttAdmPill"; pill.setAttribute("role", "status");
      pill.style.cssText = "position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:70;display:flex;align-items:center;gap:8px;background:#7a2e0e;color:#fff;border-radius:999px;padding:4px 6px 4px 12px;font:700 12.5px/1.2 var(--t-font,system-ui);box-shadow:0 2px 10px rgba(0,0,0,.18)";
      pill.innerHTML = '<a href="" data-adm-go style="color:#fff;text-decoration:none"></a><button type="button" data-adm-end style="border:0;border-radius:999px;background:rgba(255,255,255,.2);color:#fff;font:inherit;padding:3px 9px;cursor:pointer">끝내기</button>';
      pill.querySelector("[data-adm-end]").onclick = function(){ end(false); };
      document.body.appendChild(pill);
    }
    var base = (window.TT && TT.BASE) || "./";
    var a = pill.querySelector("[data-adm-go]"); a.href = base + "apps/admin/";
    a.textContent = "🛡️ " + (s.role === "super" ? "최고 관리자" : "관리자") + " · " + s.name + " · " + Math.max(1, Math.ceil((s.exp - Date.now()) / 60000)) + "분";
    a.title = "🛡️ 관리 화면으로 · 무언가 하고 있으면 시간이 저절로 늘어나요";
  }
  setInterval(function(){
    var s = state(); paint();
    if(s && s.exp - Date.now() < 10 * 60000 && Date.now() - lastAct < 5 * 60000 && Date.now() - lastPing > 4 * 60000){
      lastPing = Date.now(); call("admping").catch(function(){});
    }
  }, 30000);
  if(document.body) paint(); else document.addEventListener("DOMContentLoaded", paint);
  window.addEventListener("storage", paint);

  window.TT_ADMIN = {state: state, login: login, end: end, call: call, api: api, board: board, classroom: classroom, errText: errText, isSuper: isSuper, on: on};
})();
