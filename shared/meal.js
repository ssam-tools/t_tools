/* 보완 3단계 (v1.6.0): 오늘 급식 — 나이스 교육정보 개방 포털(open.neis.go.kr) 급식식단정보
   - 첫 화면 날짜 줄에 "🍚 급식" 단추 (v1.10.1) — 마우스를 올리면 오늘/내일 점심 메뉴, 누르면 급식 창
   - 누르면 오늘 메뉴 전체 + 열량 + 이번 주 식단(월~금), 학교 찾기·인증키 설정
   - 학교 코드(교육청 neisA · 학교 neisS · 인증키 neisKey)는 tt_school_v1 → 학기초 세팅 파일로 다른 선생님께 함께 감
   - 받은 식단은 이 기기에 저장(snmeal_v1, 2주) → 인터넷이 잠깐 안 돼도 보임. 학생 자료는 보내지 않습니다(학교 코드·날짜만). */
(function(){
  "use strict";
  if(window.TTMeal) return;                                              // v2.46 도구 화면에서도 불러옴(날짜 → 급식) — 두 번 불러도 한 번만
  var APPS = /\/apps\//.test(location.pathname);
  var API = "https://open.neis.go.kr/hub/", CK = "snmeal_v1";
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function sch(){ return window.TT ? TT.school.load() : {}; }
  function opt(){ try{ return JSON.parse(localStorage.getItem(CK) || "{}") || {}; }catch(e){ return {}; } }
  function saveOpt(o){ try{ localStorage.setItem(CK, JSON.stringify(o)); }catch(e){} }
  function monday(d){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function addD(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  /* 메뉴 정리: <br/> 나누기, 알레르기 번호 (1.5.6) 숨기기 */
  function dishes(raw, allergy){
    return String(raw || "").split(/<br\s*\/?>/i).map(function(x){
      x = x.replace(/&amp;/g, "&").trim();
      if(!allergy) x = x.replace(/\s*\(?[\d.]+\.?\)?\s*$/, "").replace(/\s*\([\d.\s]+\)/g, "").trim();
      return x.replace(/^[*#@]+|[*#@]+$/g, "").trim();
    }).filter(Boolean);
  }
  function url(svc, q){
    var s = sch(), p = ["Type=json", "pIndex=1", "pSize=" + (q.pSize || 20)];
    if(s.neisKey) p.push("KEY=" + encodeURIComponent(s.neisKey));
    Object.keys(q).forEach(function(k){ if(k !== "pSize") p.push(k + "=" + encodeURIComponent(q[k])); });
    return API + svc + "?" + p.join("&");
  }
  function rows(j, svc){
    var a = j && j[svc]; if(!a) return {err: j && j.RESULT ? j.RESULT.CODE : "ERR", msg: j && j.RESULT ? j.RESULT.MESSAGE : ""};
    var r = a.filter(function(x){ return x.row; })[0]; return {rows: r ? r.row : []};
  }
  /* 한 주(월~금) 식단 받기 → {YYYYMMDD: {d:[메뉴], cal, kind}} (중식 우선, 없으면 조·석식) */
  function fetchWeek(mon){
    var s = sch(); if(!s.neisA || !s.neisS) return Promise.reject(new Error("noschool"));
    var from = ymd(mon), to = ymd(addD(mon, 4));
    return fetch(url("mealServiceDietInfo", {ATPT_OFCDC_SC_CODE: s.neisA, SD_SCHUL_CODE: s.neisS, MLSV_FROM_YMD: from, MLSV_TO_YMD: to, pSize: 30}))
      .then(function(r){ return r.json(); }).then(function(j){
        var R = rows(j, "mealServiceDietInfo"), out = {};
        if(R.err && R.err !== "INFO-200") throw new Error(R.msg || R.err);
        (R.rows || []).forEach(function(x){
          var k = x.MLSV_YMD, kind = x.MMEAL_SC_NM || "중식";
          if(out[k] && out[k].kind === "중식") return;
          out[k] = {raw: x.DDISH_NM, cal: x.CAL_INFO || "", kind: kind};
        });
        var o = opt(); o.w = o.w || {}; o.w[from] = {at: Date.now(), days: out};
        Object.keys(o.w).sort().slice(0, -3).forEach(function(k){ delete o.w[k]; });   // 최근 3주만
        saveOpt(o); return out;
      });
  }
  var loading = {};   // 받는 중인 주 → 기다리는 함수들
  function week(mon, cb){
    var k = ymd(mon), o = opt(), c = o.w && o.w[k];
    if(c) cb(c.days);
    if(!c || Date.now() - c.at > 6 * 3600000){
      if(loading[k]){ if(!c) loading[k].push(cb); return; }
      loading[k] = c ? [] : [cb];
      fetchWeek(mon).then(function(d){ var L = loading[k]; delete loading[k]; L.forEach(function(f){ f(d); }); if(c) paint(); },
        function(e){ var L = loading[k]; delete loading[k]; if(!c) L.forEach(function(f){ f(null, e); }); });
    }
  }
  /* 어느 날 점심을 보여 줄까: 13:30 전에는 오늘, 뒤에는 다음 평일 */
  function target(){
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes(), w = d.getDay();
    if(w >= 1 && w <= 5 && m < 810) return {d: d, lab: "오늘 점심"};
    var n = addD(d, 1); while(n.getDay() === 0 || n.getDay() === 6) n = addD(n, 1);
    return {d: n, lab: (w === 5 && m >= 810) || w === 6 || w === 0 ? (n.getMonth() + 1) + "/" + n.getDate() + " 점심" : "내일 점심"};
  }
  var CSS = ""
    + ".meal{display:inline-flex;align-items:center;gap:5px;max-width:min(28vw,420px);border:0;background:var(--t-ok-soft,#e6f5ec);color:var(--ink);border-radius:999px;padding:3px 12px;margin-left:8px;font:inherit;font-size:clamp(13px,1.8vh,15px);font-weight:700;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}"
    + ".meal b{color:var(--t-ok,#1d7a46);flex:none}.meal span{overflow:hidden;text-overflow:ellipsis}"
    + ".meal.hot{background:#fff1d6;box-shadow:0 0 0 2px #f0b450 inset}.meal.hot b{color:#b4640a}"
    + ".meal.off{background:var(--t-chip,#eceff3);color:var(--sub)}"
    + "#mealPop{position:fixed;z-index:80;min-width:180px;max-width:280px;background:var(--card,#fff);color:var(--ink,#1f2a37);border:1px solid var(--line,#dde3ea);border-radius:12px;box-shadow:0 10px 26px rgba(30,60,100,.18);padding:9px 12px;font-size:14px;line-height:1.55;pointer-events:none}"
    + "#mealPop[hidden]{display:none}#mealPop h4{margin:0 0 4px;font-size:13px;color:var(--t-ok,#1d7a46)}#mealPop .cal{color:var(--sub);font-size:11.5px;margin-top:3px}#mealPop .ft{color:var(--sub);font-size:11px;margin-top:5px;border-top:1px dashed var(--line,#dde3ea);padding-top:4px}"
    + "@media (max-width:760px){.meal{max-width:calc(100vw - 40px);margin:4px 0 0}}"
    + "#dlgMeal{max-width:min(720px,94vw);width:720px}#dlgMeal h2{margin:0 0 8px}"
    + "#dlgMeal .mwk{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:8px 0}"
    + "#dlgMeal .mday{border:1px solid var(--line);border-radius:12px;padding:8px;background:var(--card);font-size:13.5px;line-height:1.45;min-height:120px}"
    + "#dlgMeal .mday.on{border:2px solid var(--t-ok,#1d7a46);background:var(--t-ok-soft,#e6f5ec)}"
    + "#dlgMeal .mday h4{margin:0 0 4px;font-size:13px}#dlgMeal .mday .cal{color:var(--sub);font-size:11.5px;margin-top:4px}"
    + "#dlgMeal .mset{border-top:1px solid var(--line);margin-top:10px;padding-top:8px;font-size:13.5px}"
    + "#dlgMeal .mset input[type=text]{width:100%;margin-top:4px}#dlgMeal .mres button{display:block;width:100%;text-align:left;margin-top:4px}"
    + "#dlgMeal .row2{display:flex;gap:6px;align-items:center;flex-wrap:wrap}"
    + "@media (max-width:760px){#dlgMeal .mwk{grid-template-columns:1fr}#dlgMeal .mday{min-height:0}}";
  var chip, dlg, cssOn = false;
  function css(){ if(cssOn) return; cssOn = true; var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st); }
  function lineText(days, t){
    var x = days && days[ymd(t.d)]; if(!x) return null;
    return dishes(x.raw, opt().allergy).slice(0, 5).join(" · ");
  }
  function hot(){ var d = new Date(), m = d.getHours() * 60 + d.getMinutes(), w = d.getDay(); return w >= 1 && w <= 5 && m >= 660 && m < 770; }   // 11:00~12:50
  var popHTML = "";
  function paint(){
    if(!chip) return;
    var s = sch();
    if(!s.neisA || !s.neisS){ popHTML = ""; if(opt().hideSetup){ chip.hidden = true; return; } chip.hidden = false; chip.className = "meal off"; chip.innerHTML = "🍚 <span>급식 연결하기</span>"; chip.title = ""; return; }
    var t = target(), DW = "일월화수목금토";
    chip.hidden = false; chip.className = "meal"; chip.innerHTML = "🍚 <b>급식</b>"; chip.title = "";   // v1.10.1: 메뉴는 마우스를 올리면, 누르면 급식 창
    week(monday(t.d), function(days, err){
      var x = days && days[ymd(t.d)], hd = "<h4>" + t.lab + " · " + (t.d.getMonth() + 1) + "/" + t.d.getDate() + " (" + DW[t.d.getDay()] + ")</h4>";
      if(err && !days){ chip.className = "meal off"; popHTML = hd + "급식을 불러오지 못했어요."; }
      else if(!x){ popHTML = hd + '<span class="muted">급식 없음</span>'; }
      else {
        chip.className = "meal" + (t.lab === "오늘 점심" && hot() ? " hot" : "");
        popHTML = hd + dishes(x.raw, opt().allergy).map(esc).join("<br>") + (x.cal ? '<div class="cal">' + esc(x.cal) + "</div>" : "");
      }
      popHTML += '<div class="ft">누르면 이번 주 식단</div>';
      if(pop && !pop.hidden) pop.innerHTML = popHTML;
    });
  }
  var pop = null;
  function showPop(){
    if(!popHTML || !chip || chip.hidden) return;
    if(!pop){ pop = document.createElement("div"); pop.id = "mealPop"; pop.hidden = true; document.body.appendChild(pop); }
    pop.innerHTML = popHTML; pop.hidden = false;
    var r = chip.getBoundingClientRect(), w = pop.offsetWidth;
    pop.style.top = Math.round(r.bottom + 6) + "px"; pop.style.left = Math.round(Math.max(8, Math.min(r.left, window.innerWidth - w - 8))) + "px";
  }
  function hidePop(){ if(pop) pop.hidden = true; }
  function wkHTML(days, mon, err){
    var t = target(), DW = "월화수목금";
    if(err && !days) return '<p class="muted">급식을 불러오지 못했어요. 인터넷 연결을 확인하거나, 아래에서 인증키를 넣어 보세요. (' + esc(err.message || "") + ")</p>";
    if(!days) return '<p class="muted">불러오는 중…</p>';
    return '<div class="mwk">' + [0, 1, 2, 3, 4].map(function(i){
      var d = addD(mon, i), k = ymd(d), x = days[k];
      return '<div class="mday' + (k === ymd(t.d) ? " on" : "") + '"><h4>' + DW[i] + " " + (d.getMonth() + 1) + "/" + d.getDate() + (x && x.kind !== "중식" ? " · " + esc(x.kind) : "") + "</h4>"
        + (x ? dishes(x.raw, opt().allergy).map(esc).join("<br>") + (x.cal ? '<div class="cal">' + esc(x.cal) + "</div>" : "") : '<span class="muted">급식 없음</span>') + "</div>";
    }).join("") + "</div>";
  }
  var shownMon = null;
  function openDlg(){
    css();
    if(!dlg){
      dlg = document.createElement("dialog"); dlg.id = "dlgMeal"; document.body.appendChild(dlg);
      dlg.addEventListener("click", function(e){
        if(e.target === dlg){ dlg.close(); return; }
        var b = e.target.closest("[data-m]"); if(!b) return;
        var a = b.getAttribute("data-m");
        if(a === "x") dlg.close();
        else if(a === "prev" || a === "next"){ shownMon = addD(shownMon, a === "prev" ? -7 : 7); fill(); }
        else if(a === "find") search();
        else if(a === "pick"){ TT.school.save({neisA: b.getAttribute("data-a"), neisS: b.getAttribute("data-s")}); var o = opt(); o.w = {}; o.sname = b.getAttribute("data-n"); saveOpt(o); shownMon = monday(target().d); fill(); paint(); }
        else if(a === "key"){ TT.school.save({neisKey: dlg.querySelector("#mKey").value.trim()}); var o2 = opt(); o2.w = {}; saveOpt(o2); fill(); paint(); TT.ui.toast("인증키를 저장했어요"); }
        else if(a === "hide"){ var o3 = opt(); o3.hideSetup = true; saveOpt(o3); dlg.close(); paint(); }
      });
      dlg.addEventListener("change", function(e){ if(e.target.id === "mAll"){ var o = opt(); o.allergy = e.target.checked; saveOpt(o); fill(); paint(); } });
      dlg.addEventListener("keydown", function(e){ if(e.key === "Enter" && e.target.id === "mQ"){ e.preventDefault(); search(); } });
    }
    shownMon = monday(target().d); fill();
    if(dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function fill(){
    var s = sch(), o = opt(), has = s.neisA && s.neisS;
    var h = '<div class="row2" style="justify-content:space-between"><h2>🍚 급식' + (o.sname ? ' <small class="muted">' + esc(o.sname) + "</small>" : "") + '</h2><button type="button" class="btn" data-m="x">닫기</button></div>';
    if(has){
      h += '<div class="row2"><button type="button" class="btn" data-m="prev">◀ 지난주</button><b>' + (shownMon.getMonth() + 1) + "/" + shownMon.getDate() + ' 주</b><button type="button" class="btn" data-m="next">다음 주 ▶</button>'
        + '<label style="margin-left:auto"><input type="checkbox" id="mAll"' + (o.allergy ? " checked" : "") + "> 알레르기 번호 보기</label></div><div id=\"mBody\"></div>";
    }else h += '<p>학교를 한 번 찾아 연결하면 첫 화면에 🍚 급식 단추가 나옵니다(마우스를 올리면 메뉴). (학기초 세팅 파일에도 함께 들어가 다른 선생님은 설정할 필요 없음)</p>';
    h += '<div class="mset"><b>학교 찾기</b><div class="row2"><input type="text" id="mQ" placeholder="학교 이름 (예: 마산서중)" value="' + esc((s.name || "").replace(/학교$/, "")) + '" style="flex:1"><button type="button" class="btn" data-m="find">찾기</button></div><div class="mres" id="mRes"></div>'
      + '<details style="margin-top:8px"><summary>나이스 인증키 (시간표 교체 확인에 필요)</summary><p class="muted" style="margin:4px 0">open.neis.go.kr → 마이페이지에서 무료로 받은 키. 급식은 키 없이도 되지만, 시간표 ↻ 교체 확인에는 꼭 필요해요.</p>'
      + '<div class="row2"><input type="text" id="mKey" value="' + esc(s.neisKey || "") + '" placeholder="인증키" style="flex:1"><button type="button" class="btn" data-m="key">저장</button></div></details>'
      + (has ? "" : '<p style="margin-top:8px"><button type="button" class="btn" data-m="hide">급식은 쓰지 않을래요 (첫 화면에서 숨기기)</button></p>') + "</div>"
      + '<p class="muted" style="font-size:12px;margin:8px 0 0">급식 정보는 나이스 교육정보 개방 포털에서 학교 코드와 날짜만으로 받아 옵니다.</p>';
    dlg.innerHTML = h;
    if(has) week(shownMon, function(days, err){ var b = dlg.querySelector("#mBody"); if(b) b.innerHTML = wkHTML(days, shownMon, err); });
  }
  function search(){
    var q = dlg.querySelector("#mQ").value.trim(), box = dlg.querySelector("#mRes"); if(q.length < 2){ box.textContent = "두 글자 이상 넣어 주세요."; return; }
    box.textContent = "찾는 중…";
    fetch(url("schoolInfo", {SCHUL_NM: q, pSize: 10})).then(function(r){ return r.json(); }).then(function(j){
      var R = rows(j, "schoolInfo"), L = R.rows || [];
      box.innerHTML = L.length ? L.map(function(x){ return '<button type="button" class="btn" data-m="pick" data-a="' + esc(x.ATPT_OFCDC_SC_CODE) + '" data-s="' + esc(x.SD_SCHUL_CODE) + '" data-n="' + esc(x.SCHUL_NM) + '"><b>' + esc(x.SCHUL_NM) + "</b> <small>" + esc(x.ATPT_OFCDC_SC_NM || "") + " · " + esc(x.ORG_RDNMA || "") + "</small></button>"; }).join("") : "찾는 학교가 없어요.";
    }, function(){ box.textContent = "인터넷 연결을 확인해 주세요."; });
  }
  function start(){
    if(APPS) return;                                                    // 도구 화면은 단추 없이 (맨 위 날짜에 올리면 급식)
    var lead = document.querySelector("header .lead"); if(!lead || chip) return;
    css();
    chip = document.createElement("button"); chip.type = "button"; chip.id = "mealChip"; chip.className = "meal"; chip.hidden = true;
    var lt = document.getElementById("leadTxt"); if(lt && lt.nextSibling) lead.insertBefore(chip, lt.nextSibling); else lead.appendChild(chip);
    chip.addEventListener("click", function(){ hidePop(); openDlg(); });
    chip.addEventListener("mouseenter", showPop); chip.addEventListener("mouseleave", hidePop);
    chip.addEventListener("focus", showPop); chip.addEventListener("blur", hidePop);
    paint(); setInterval(paint, 5 * 60000);
  }
  /* 쌤비 브리핑용: 저장된 오늘 점심 한 줄 (없으면 "") */
  function todayText(){ var t = target(), o = opt(), c = o.w && o.w[ymd(monday(t.d))]; var x = c && c.days[ymd(t.d)]; return x ? t.lab + ": " + dishes(x.raw, false).slice(0, 4).join(", ") : ""; }
  window.TTMeal = {open: openDlg, todayText: todayText, dishes: dishes,
    day: function(d, cb){ var k = ymd(d); try{ week(monday(d), function(days){ cb(days ? days[k] : null); }); }catch(e){ cb(null); } }};   // v2.9 숨은 정보(날짜 → 급식)
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
