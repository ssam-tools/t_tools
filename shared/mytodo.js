/* 선생님 도구 모음 · 첫 화면 "내 할 일" (나만 보는 개인 업무)
   - 이 기기 브라우저(tt_mytodo_v1)에만 저장되고 어디로도 보내지 않습니다. 학교 업무판과도 섞이지 않습니다.
   - "전체 백업"에 함께 들어가므로 기기를 바꿀 때 백업 파일로 옮길 수 있습니다. */
(function(){
  "use strict";
  var KEY = "tt_mytodo_v1", KEEP_DONE_DAYS = 30;
  var box = document.getElementById("mytodo");
  if(!box) return;
  var DOW = ["일","월","화","수","목","금","토"];
  var showDone = false;

  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth()+1) + "-" + pad(d.getDate()); }
  function parse(s){ var p = s.split("-").map(Number); return new Date(p[0], p[1]-1, p[2]); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function load(){
    var d = TT.store.get(KEY, null);
    d = d && Array.isArray(d.items) ? d : {items: []};
    var cut = Date.now() - KEEP_DONE_DAYS * 864e5;                       // 끝낸 지 30일 지난 것은 정리
    d.items = d.items.filter(function(x){ return !x.done || !x.doneAt || x.doneAt > cut; });
    return d;
  }
  function save(d){ TT.store.set(KEY, d); window.dispatchEvent(new CustomEvent("tt-mytodo-change", {detail: "self"})); }   // 첫 화면 달력도 함께 갱신
  function uid(){ return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

  /* 날짜 표시: 오늘·내일·요일(이번 주)·월/일, 지난 날짜는 빨간색 */
  function dateLabel(s){
    var t = parse(ymd(new Date())), d = parse(s), diff = Math.round((d - t) / 864e5);
    var txt = diff === 0 ? "오늘" : diff === 1 ? "내일" : diff === -1 ? "어제"
      : (diff > 1 && diff < 7) ? DOW[d.getDay()] + "요일" : (d.getMonth()+1) + "/" + d.getDate();
    return {txt: txt, cls: diff < 0 ? "late" : diff === 0 ? "today" : ""};
  }
  function sorted(items){
    return items.slice().sort(function(a, b){
      if(!!a.date !== !!b.date) return a.date ? -1 : 1;                   // 날짜 있는 것 먼저(가까운 순)
      if(a.date && b.date && a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.created - b.created;
    });
  }

  function render(){
    var d = load(), open = d.items.filter(function(x){ return !x.done; }), done = d.items.filter(function(x){ return x.done; });
    var list = showDone ? done.sort(function(a, b){ return b.doneAt - a.doneAt; }) : sorted(open);
    var h = '<div class="th"><b>📝 내 할 일</b><span class="lock" title="이 기기 브라우저에만 저장되고 다른 사람에게 보이지 않습니다">🔒 나만 보기</span><span class="sp"></span>'
      + (done.length || showDone ? '<button type="button" class="bk" data-act="toggle">' + (showDone ? "← 할 일" : "끝낸 일 " + done.length) + "</button>" : "") + "</div>";
    if(!showDone) h += '<form class="tin" autocomplete="off"><input id="tdText" maxlength="120" placeholder="할 일을 적고 Enter" aria-label="할 일">'
      + '<input id="tdDate" type="date" title="날짜 (선택)" aria-label="날짜"></form>';
    h += '<ul class="tl">';
    if(!list.length) h += '<li class="none">' + (showDone ? "끝낸 일이 없습니다." : "개인 업무·메모를 적어 두세요. 날짜를 넣으면 가까운 순으로 정렬됩니다.") + "</li>";
    list.forEach(function(x){
      var dl = x.date ? dateLabel(x.date) : null;
      h += '<li class="' + (x.done ? "done" : "") + '" data-id="' + esc(x.id) + '">'
        + '<input type="checkbox" ' + (x.done ? "checked" : "") + ' data-act="check" aria-label="끝냄 표시">'
        + '<span class="tx" data-act="edit" title="눌러서 고치기">' + esc(x.text) + "</span>"
        + (dl ? '<span class="dt ' + dl.cls + '">' + dl.txt + "</span>" : "")
        + '<button type="button" class="x" data-act="del" title="지우기" aria-label="지우기">×</button></li>';
    });
    h += "</ul>";
    box.innerHTML = h;
    var f = box.querySelector(".tin");
    if(f) f.addEventListener("submit", function(e){
      e.preventDefault();
      var t = document.getElementById("tdText").value.trim(); if(!t) return;
      var d2 = load(); d2.items.push({id: uid(), text: t, date: document.getElementById("tdDate").value || "", done: false, created: Date.now()});
      save(d2); render(); document.getElementById("tdText").focus();
    });
  }

  box.addEventListener("click", function(e){
    var el = e.target.closest("[data-act]"); if(!el) return;
    var act = el.getAttribute("data-act");
    if(act === "toggle"){ showDone = !showDone; return render(); }
    var li = el.closest("li"), id = li && li.getAttribute("data-id"); if(!id) return;
    var d = load(), it = d.items.filter(function(x){ return x.id === id; })[0]; if(!it) return;
    if(act === "check"){
      it.done = !it.done; it.doneAt = it.done ? Date.now() : 0; save(d); render();
      if(it.done) TT.ui.toast("끝냈습니다 ✔", function(){ var d3 = load(); d3.items.forEach(function(x){ if(x.id === id){ x.done = false; x.doneAt = 0; } }); save(d3); render(); });
    }
    if(act === "del"){
      var idx = d.items.indexOf(it); d.items.splice(idx, 1); save(d); render();
      TT.ui.toast("지웠습니다.", function(){ var d3 = load(); d3.items.splice(Math.min(idx, d3.items.length), 0, it); save(d3); render(); });
    }
    if(act === "edit") TT.ui.prompt("할 일 고치기", it.text, "", function(v){
      var d3 = load(); d3.items.forEach(function(x){ if(x.id === id) x.text = v.slice(0, 120); }); save(d3); render();
    });
  });
  window.addEventListener("storage", function(e){ if(e.key === KEY) render(); });
  window.addEventListener("tt-mytodo-change", function(e){ if(e.detail !== "self") render(); });
  window.addEventListener("pageshow", render);
  render();
})();
