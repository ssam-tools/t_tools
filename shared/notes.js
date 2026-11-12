/* 학생 기록 화면 (빠른 기록 · 학생 카드)
   자료는 shared/tt.js 의 TT.notes ("tt_notes_v1")에 저장됩니다. 이 파일은 화면만 그립니다.
   도구마다 디자인 파일이 달라서 스타일을 스스로 넣습니다. */
(function(){
  "use strict";
  if(!window.TT || TT.notesUI) return;
  var N = TT.notes, R = TT.roster;
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function md(s){ var a = String(s).split("-"); return (+a[1]) + "/" + (+a[2]); }

  var css = ".ttn{border:0;border-radius:16px;padding:16px 18px;width:min(640px,96vw);max-height:calc(100vh - 16px);box-sizing:border-box;box-shadow:0 10px 40px rgba(0,0,0,.28);color:#1d2733;font:14px/1.5 'Malgun Gothic','Apple SD Gothic Neo','Noto Sans KR',system-ui,sans-serif}"
    + ".ttn[open]{display:flex;flex-direction:column;gap:8px}"
    + ".ttn::backdrop{background:rgba(20,30,45,.5)}"
    + ".ttn h2{font-size:17px;margin:0;display:flex;align-items:center;gap:8px}.ttn h2 small{font-size:12px;color:#5b6773;font-weight:400}"
    + ".ttn .top{display:flex;gap:8px;flex-wrap:wrap;align-items:center}"
    + ".ttn select,.ttn input[type=date],.ttn input[type=text],.ttn textarea{font:inherit;font-size:14px;border:1px solid #dde3ea;border-radius:9px;padding:6px 9px;background:#fbfcfd;color:#1d2733;box-sizing:border-box}"
    + ".ttn textarea{width:100%;resize:none;height:64px;font-size:15px}"
    + ".ttn .areas{display:flex;gap:4px;flex-wrap:wrap}"
    + ".ttn .areas button{font:inherit;font-size:12.5px;font-weight:700;border:1px solid #dde3ea;background:#fff;color:#5b6773;border-radius:999px;padding:3px 10px;cursor:pointer}"
    + ".ttn .areas button[aria-pressed=true]{background:#7a4fb5;border-color:#7a4fb5;color:#fff}"
    + ".ttn .stu{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:4px;overflow:auto;min-height:0;flex:0 1 auto;max-height:38vh;padding:2px}"
    + ".ttn .stu button{font:inherit;font-size:13.5px;text-align:left;border:1px solid #dde3ea;background:#fff;border-radius:8px;padding:5px 7px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
    + ".ttn .stu button i{font-style:normal;color:#8a949e;font-size:12px;margin-right:4px}"
    + ".ttn .stu button[aria-pressed=true]{background:#efe7fa;border-color:#7a4fb5;color:#4b2a80;font-weight:700}"
    + ".ttn .stu button sup{color:#7a4fb5;font-size:10px;margin-left:2px}"
    + ".ttn .acts{display:flex;justify-content:space-between;align-items:center;gap:8px}.ttn .acts .r{display:flex;gap:6px}"
    + ".ttn .b{font:inherit;font-size:14px;font-weight:700;border:1px solid #dde3ea;background:#fff;color:#1d2733;border-radius:10px;padding:7px 14px;cursor:pointer}"
    + ".ttn .b.p{background:#7a4fb5;border-color:#7a4fb5;color:#fff}.ttn .b:disabled{opacity:.45;cursor:default}"
    + ".ttn .muted{color:#5b6773;font-size:12.5px}"
    + ".ttn .recs{list-style:none;margin:0;padding:0;overflow:auto;min-height:0;flex:1 1 auto;display:flex;flex-direction:column;gap:4px}"
    + ".ttn .recs li{display:flex;gap:6px;align-items:flex-start;border:1px solid #eef1f4;border-radius:8px;padding:5px 8px;font-size:13.5px}"
    + ".ttn .recs .d{flex:none;color:#5b6773;font-size:12px;min-width:34px;padding-top:1px}"
    + ".ttn .recs .t{flex:1;white-space:pre-wrap;word-break:break-all}"
    + ".ttn .chip{flex:none;font-size:11px;font-weight:700;border-radius:999px;padding:1px 7px;background:#efe7fa;color:#4b2a80}"
    + ".ttn .chip.beh{background:#e6f0fa;color:#21507f}.ttn .chip.etc{background:#eceff3;color:#4a5560}"
    + ".ttn .x{flex:none;border:0;background:transparent;color:#a0a9b3;font-size:16px;cursor:pointer;border-radius:6px;line-height:1;padding:2px 4px}.ttn .x:hover{background:#fdeceb;color:#b3261e}"
    + ".ttn .who{display:flex;gap:12px;align-items:center}"
    + ".ttn .ph{width:72px;height:90px;border-radius:10px;object-fit:cover;background:#eef1f4;flex:none;display:flex;align-items:center;justify-content:center;font-size:30px;color:#a0a9b3}"
    + ".ttn .who .nm{font-size:20px;font-weight:800}.ttn .who .memo{width:100%;margin-top:4px}"
    + ".ttn .add{display:flex;gap:6px;align-items:center}.ttn .add input[type=text]{flex:1;min-width:0}"
    + ".ttn .flt{display:flex;gap:4px;flex-wrap:wrap}"
    + "@media (max-height:560px){.ttn textarea{height:44px}.ttn .stu{max-height:30vh}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function dlg(html){
    var d = document.createElement("dialog"); d.className = "ttn"; d.innerHTML = html;
    document.body.appendChild(d); d.addEventListener("close", function(){ d.remove(); });
    d.addEventListener("click", function(e){ if(e.target === d) d.close(); });
    d.showModal(); return d;
  }
  function areaBtns(cur){
    return N.AREAS.map(function(a){ return '<button type="button" data-area="' + a[0] + '" aria-pressed="' + (a[0] === cur) + '">' + a[1] + "</button>"; }).join("");
  }
  function chip(a){ return '<span class="chip ' + (a === "beh" ? "beh" : a === "etc" ? "etc" : "") + '">' + esc(N.area(a)) + "</span>"; }

  /* 지금 수업 중인 반(내 시간표)과 명렬표 학급을 짝짓기: 반 코드 304 → 3학년 4반 */
  function classNow(list){
    try{
      var n = TT.timetable.has() && (TT.timetable.now() || null);
      if(!n || !n.cls) return null;
      var g = Math.floor(n.cls / 100), c = n.cls % 100;
      return list.filter(function(x){ return +x.grade === g && +x.cls === c; })[0] || null;
    }catch(e){ return null; }
  }

  /* ========== 빠른 기록: 어느 화면에서든 학생을 골라 한 줄 남깁니다 ==========
     o: {cls: 학급 id, nos: [번호], area, text, src} */
  function quick(o){
    var d0 = R.load(), list = R.classes(d0).filter(function(c){ return c.students.length; });
    if(!list.length){ TT.ui.toast("먼저 학급 명렬표에 나이스 명단을 올려 주세요."); return; }
    var now = classNow(list), home = R.home(d0);
    var c = list.filter(function(x){ return x.id === o.cls; })[0] || now || (home && home.students.length ? home : list[0]);
    var area = o.area || (now ? "subj" : "beh"), picked = {};
    (o.nos || []).forEach(function(n){ picked[n] = 1; });
    var d = dlg('<h2>✍️ 학생 기록 <small>본 것·한 것을 그때그때 한 줄씩 · 생기부 쓸 때 모아 봅니다</small></h2>'
      + '<div class="top"><select data-k="cls" aria-label="학급">' + list.map(function(x){ return '<option value="' + esc(x.id) + '"' + (x.id === c.id ? " selected" : "") + ">" + (x === now ? "● " : x.id === d0.home ? "★ " : "") + esc(x.name) + "</option>"; }).join("") + "</select>"
      + '<input type="date" data-k="date" value="' + ymd() + '" aria-label="날짜"><div class="areas">' + areaBtns(area) + "</div></div>"
      + '<div class="stu" role="group" aria-label="학생 고르기 (여러 명 가능)"></div>'
      + '<textarea data-k="text" maxlength="1000" placeholder="예: 이차함수 그래프의 평행이동을 친구에게 그림으로 설명함"></textarea>'
      + '<div class="muted" data-k="les"></div><div class="muted" data-k="last"></div>'
      + '<div class="acts"><span class="muted" data-k="cnt">학생을 골라 주세요 (여러 명 가능)</span><div class="r"><button type="button" class="b" data-a="close">닫기</button><button type="button" class="b p" data-a="save" disabled>저장</button></div></div>');
    var q = function(s){ return d.querySelector(s); }, ta = q("[data-k=text]");
    if(o.text) ta.value = o.text;
    function cnts(){ var m = N.count(); return m; }
    function drawStu(){
      var m = cnts();
      q(".stu").innerHTML = c.students.map(function(s){
        var k = N.key(c, s), n = m[k] || 0;
        return '<button type="button" data-no="' + s.no + '" aria-pressed="' + (!!picked[s.no]) + '" title="기록 ' + n + '건"><i>' + s.no + "</i>" + esc(s.name || "") + (n ? "<sup>" + n + "</sup>" : "") + "</button>";
      }).join("");
      upd();
    }
    function sel(){ return c.students.filter(function(s){ return picked[s.no]; }); }
    function les(){ return area === "subj" && c.grade && c.cls && N.lessonNow ? N.lessonNow(c.grade * 100 + c.cls) : ""; }   // 수업 기록장의 지금 차시
    function upd(){
      var s = sel();
      q("[data-k=cnt]").textContent = s.length ? s.length + "명 선택 · " + N.area(area) : "학생을 골라 주세요 (여러 명 가능)";
      q("[data-a=save]").disabled = !s.length || !ta.value.trim();
      var last = "";
      if(s.length === 1){
        var L = N.list(N.key(c, s[0])).slice(0, 2);
        last = L.length ? "최근: " + L.map(function(r){ return md(r.date) + " " + N.area(r.area) + " · " + r.text.slice(0, 40); }).join(" / ") : "";
      }
      q("[data-k=last]").textContent = last;
      var l = les(); q("[data-k=les]").textContent = l ? "📖 지금 차시: " + l + " (기록 앞에 붙습니다)" : "";
    }
    q("[data-k=cls]").onchange = function(){ var v = this.value; c = list.filter(function(x){ return x.id === v; })[0]; picked = {}; drawStu(); };
    q(".areas").onclick = function(e){ var b = e.target.closest("button"); if(!b) return; area = b.dataset.area; this.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", x === b); }); upd(); };
    q(".stu").onclick = function(e){ var b = e.target.closest("button"); if(!b) return; var n = +b.dataset.no; if(picked[n]) delete picked[n]; else picked[n] = 1; b.setAttribute("aria-pressed", !!picked[n]); upd(); };
    ta.oninput = upd;
    ta.onkeydown = function(e){ if(e.key === "Enter" && (e.ctrlKey || e.metaKey)){ e.preventDefault(); q("[data-a=save]").click(); } };
    q("[data-a=close]").onclick = function(){ d.close(); };
    q("[data-a=save]").onclick = function(){
      var s = sel(), text = ta.value.trim(), date = q("[data-k=date]").value || ymd();
      if(!s.length || !text) return;
      var l = les(); if(l && text.indexOf("[") !== 0) text = "[" + l + "] " + text;
      s.forEach(function(x){ N.add({k: N.key(c, x), n: x.name, date: date, area: area, src: o.src || "", text: text}); });
      TT.ui.toast(s.length === 1 ? (s[0].name || s[0].no + "번") + " 기록을 저장했습니다." : s.length + "명에게 같은 기록을 저장했습니다.");
      picked = {}; ta.value = ""; drawStu(); ta.focus();
      window.dispatchEvent(new CustomEvent("tt-notes-change"));
    };
    drawStu(); setTimeout(function(){ (sel().length ? ta : q(".stu button") || ta).focus(); }, 0);
  }

  /* ========== 학생 카드: 사진 · 메모 · 지금까지의 기록 ========== */
  function card(c, s){
    var k = N.key(c, s), flt = "all";
    var d = dlg('<div class="who"><div class="ph" data-k="ph">👤</div><div style="flex:1;min-width:0">'
      + '<div class="nm">' + esc(s.name || "") + ' <span class="muted">' + esc(c.name) + " " + s.no + "번</span></div>"
      + '<input type="text" class="memo" data-k="memo" maxlength="200" placeholder="학생 메모 (예: 앞자리 희망, 수학 기초 보충)" value="' + esc(N.memo(k)) + '"></div></div>'
      + '<div class="flt" data-k="flt"></div>'
      + '<ul class="recs" data-k="recs"></ul>'
      + '<div class="add"><select data-k="area" aria-label="영역">' + N.AREAS.map(function(a){ return '<option value="' + a[0] + '">' + a[1] + "</option>"; }).join("") + "</select>"
      + '<input type="text" data-k="text" maxlength="1000" placeholder="새 기록 한 줄 (Enter로 저장)"><button type="button" class="b p" data-a="add">더하기</button></div>'
      + '<div class="acts"><span class="muted">🔒 메모·기록은 이 기기(와 내 보관함)에만 · 교실 기기에는 가지 않음</span><div class="r"><button type="button" class="b" data-a="close">닫기</button></div></div>');
    var q = function(x){ return d.querySelector(x); };
    if(TT.photos) TT.photos.get(k).then(function(b){ if(b && d.isConnected){ var u = URL.createObjectURL(b), img = document.createElement("img"); img.className = "ph"; img.alt = ""; img.src = u; q("[data-k=ph]").replaceWith(img); d.addEventListener("close", function(){ URL.revokeObjectURL(u); }); } });
    function draw(){
      var all = N.list(k), by = {};
      all.forEach(function(r){ by[r.area] = (by[r.area] || 0) + 1; });
      q("[data-k=flt]").innerHTML = '<div class="areas"><button type="button" data-f="all" aria-pressed="' + (flt === "all") + '">전체 ' + all.length + "</button>"
        + N.AREAS.filter(function(a){ return by[a[0]]; }).map(function(a){ return '<button type="button" data-f="' + a[0] + '" aria-pressed="' + (flt === a[0]) + '">' + a[1] + " " + by[a[0]] + "</button>"; }).join("") + "</div>";
      var L = all.filter(function(r){ return flt === "all" || r.area === flt; });
      q("[data-k=recs]").innerHTML = L.length ? L.map(function(r){
        return '<li><span class="d">' + md(r.date) + "</span>" + chip(r.area) + '<span class="t">' + esc(r.text) + (r.src ? ' <span class="muted">· ' + esc(r.src) + "</span>" : "") + '</span><button type="button" class="x" data-del="' + esc(r.id) + '" title="지우기" aria-label="지우기">×</button></li>';
      }).join("") : '<li class="muted" style="border:0">아직 기록이 없습니다. 아래에 한 줄 적거나, 어느 화면에서든 ✍️ 학생 기록을 누르세요.</li>';
    }
    q("[data-k=memo]").onchange = function(){ N.setMemo(k, this.value, s.name); window.dispatchEvent(new CustomEvent("tt-notes-change")); TT.ui.toast("메모를 저장했습니다."); };
    q("[data-k=flt]").onclick = function(e){ var b = e.target.closest("button"); if(b){ flt = b.dataset.f; draw(); } };
    q("[data-k=recs]").onclick = function(e){
      var b = e.target.closest("[data-del]"); if(!b) return;
      var id = b.dataset.del, r = N.list(k).filter(function(x){ return x.id === id; })[0];
      N.remove(id); draw(); window.dispatchEvent(new CustomEvent("tt-notes-change"));
      TT.ui.toast("기록을 지웠습니다.", function(){ var dd = N.load(); dd.recs.push(r); N.save(dd); if(d.isConnected) draw(); });
    };
    function add(){
      var t = q("[data-k=text]").value.trim(); if(!t) return;
      N.add({k: k, n: s.name, area: q("[data-k=area]").value, text: t, src: "명렬표"}); q("[data-k=text]").value = ""; draw();
      window.dispatchEvent(new CustomEvent("tt-notes-change"));
    }
    q("[data-a=add]").onclick = add;
    q("[data-k=text]").onkeydown = function(e){ if(e.key === "Enter"){ e.preventDefault(); add(); } };
    q("[data-a=close]").onclick = function(){ var m = q("[data-k=memo]"); if(m.value.trim() !== N.memo(k)) m.onchange(); d.close(); };
    draw();
  }

  TT.notesUI = {quick: quick, card: card};
})();
