/* 쌤 노트 · 🎬 견본 모드 (PLAN_배포 1단계, v2.62.0)
   주소 뒤에 ?demo=1 을 붙이면 가짜 학교 '쌤비중학교'의 가짜 자료로 열립니다.
   - 실제 자료(localStorage·IndexedDB)는 건드리지 않습니다: 이 탭의 sessionStorage 안 "sndemo:" 칸에 따로 저장.
   - 창(탭)을 닫으면 견본 자료도 사라집니다. [견본 끝내기] 또는 ?demo=0 으로 바로 끝낼 수도 있어요.
   - 학교 업무판·급식은 가짜 응답을 돌려주고, 밖으로 보내는 요청(의견 보내기·동기화 등)은 막습니다.
   - 반드시 각 화면 <head> 맨 앞에서 불러야 합니다(다른 코드가 저장소를 읽기 전에). */
(function(){
  "use strict";
  var ss; try{ ss = window.sessionStorage; ss.getItem("x"); }catch(e){ return; }
  var P = "sndemo:", DBP = "sndemo_", FLAG = "sn_demo";
  var q = /[?&]demo=(1|0|off)\b/.exec(location.search);
  function dropAll(){
    var ks = []; for(var i = 0; i < ss.length; i++){ var k = ss.key(i); if(k && k.indexOf(P) === 0) ks.push(k); }
    ks.forEach(function(k){ ss.removeItem(k); }); ss.removeItem(FLAG);
    try{ if(indexedDB.databases) indexedDB.databases().then(function(L){ L.forEach(function(d){ if(d.name && d.name.indexOf(DBP) === 0) indexedDB.deleteDatabase(d.name); }); }); }catch(e){}
  }
  if(q){
    if(q[1] === "1"){ if(ss.getItem(FLAG) !== "1"){ dropAll(); ss.setItem(FLAG, "1"); } } else dropAll();
    try{ history.replaceState(null, "", location.pathname + location.search.replace(/[?&]demo=(1|0|off)\b/, "").replace(/^&/, "?") + location.hash); }catch(e){}
  }
  if(ss.getItem(FLAG) !== "1"){ window.TT_DEMO = null; return; }

  /* ---------- 1. 저장소 바꿔 끼우기 ---------- */
  function list(){ var o = []; for(var i = 0; i < ss.length; i++){ var k = ss.key(i); if(k && k.indexOf(P) === 0) o.push(k.slice(P.length)); } return o; }
  var fake = {
    getItem: function(k){ return ss.getItem(P + k); },
    setItem: function(k, v){ ss.setItem(P + k, String(v)); },
    removeItem: function(k){ ss.removeItem(P + k); },
    key: function(i){ return list()[i] || null; },
    clear: function(){ list().forEach(function(k){ ss.removeItem(P + k); }); }
  };
  Object.defineProperty(fake, "length", {get: function(){ return list().length; }});
  try{ Object.defineProperty(window, "localStorage", {configurable: true, get: function(){ return fake; }}); }catch(e){}
  /* 다른 창(같은 탭 안 iframe)에서 바꾼 것을 알리는 storage 이벤트도 원래 이름으로 */
  window.addEventListener("storage", function(e){
    if(e.storageArea !== ss || !e.key || e.key.indexOf(P) !== 0) return;
    try{ window.dispatchEvent(new StorageEvent("storage", {key: e.key.slice(P.length), oldValue: e.oldValue, newValue: e.newValue, url: e.url, storageArea: fake})); }catch(x){}
  });
  try{
    var IDB = window.indexedDB, o1 = IDB.open.bind(IDB), o2 = IDB.deleteDatabase.bind(IDB);
    IDB.open = function(n, v){ return v === undefined ? o1(DBP + n) : o1(DBP + n, v); };
    IDB.deleteDatabase = function(n){ return o2(DBP + n); };
  }catch(e){}

  /* ---------- 2. 가짜 학교 자료 ---------- */
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function addD(d, n){ var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  function schoolDay(d, n){ var x = addD(d, 0), k = 0, s = n < 0 ? -1 : 1; while(k < Math.abs(n)){ x = addD(x, s); if(x.getDay() > 0 && x.getDay() < 6) k++; } return x; }
  var T0 = new Date(), MON = addD(T0, -((T0.getDay() + 6) % 7));
  var SUR = "김이박최정강조윤장임한오서신권황안송류홍전고문양손배백허유남심노하곽성차주우구민".split("");
  var GIV = ["민준","서준","도윤","예준","시우","하준","주원","지호","지후","준우","준서","건우","도현","현우","우진","선우","서진","연우","유준","정우","승우","승현","시윤","준혁","은우","지환","승민","지우","유찬","윤우","민성","준영","시후","진우","지원","수현","재윤","시현","동현","태윤","하율","이안","로운","태오","라온"];
  function nm(i){ return SUR[(i * 7 + 3) % SUR.length] + GIV[(i * 11 + 5) % GIV.length]; }
  var ME = "김쌤비", HOME_CLS = 3, PERIODS = ["08:50","09:45","10:40","11:35","13:30","14:25","15:20"].map(function(t, i){ return {n: i + 1, t: t}; });

  function seed(){
    var put = function(k, v){ fake.setItem(k, JSON.stringify(v)); };
    var cid = function(c){ return "demo3" + c; };
    /* 학교·나 */
    put("tt_school_v1", {name: "쌤비중학교", teacher: ME, role: "homeroom", subject: "수학", pack: "math", principal: "박교장",
      addr: "가나시 다라구 쌤비로 1", tel: "000-000-0000", neisA: "Z99", neisS: "9999999", updatedAt: Date.now()});
    put("tt_ui_v1", {owlAsk: 1}); fake.setItem("ttv_kind", "personal");
    /* 3학년 1~6반, 반마다 26명 (모두 지어낸 이름) */
    var cls = [], n = 0;
    for(var c = 1; c <= 6; c++){
      var st = []; for(var s = 1; s <= 26; s++) st.push({no: s, name: nm(n++)});
      cls.push({id: cid(c), name: "3학년 " + c + "반", grade: 3, cls: c, students: st});
    }
    put("tt_roster_v1", {v: 1, current: cid(HOME_CLS), home: cid(HOME_CLS), classes: cls});
    /* 내 시간표 (수학 · 3학년 1·2·3·4·5반) */
    var plan = {"1-1":301,"1-3":303,"1-5":302,"2-2":304,"2-3":305,"2-6":303,"3-1":302,"3-4":301,"3-5":303,"4-2":305,"4-3":304,"4-6":302,"5-1":303,"5-2":301,"5-5":304};
    var slots = {}; Object.keys(plan).forEach(function(k){ slots[k] = {code: String(plan[k]), cls: plan[k], subj: "수학"}; });
    put("tt_timetable_v1", {v: 1, periods: PERIODS, slots: slots, weeks: {}, updatedAt: Date.now(), from: "setup"});
    /* 교직원 · 전체 교사 시간표 */
    var staff = [
      ["박교장","","교장","",""],["이교감","","교감","",""],["최국어","교무운영부","부장","국어","201"],["정영어","인성안전부","부장","영어","202"],
      ["강과학","연구장학부","교사","과학","203"],["조사회","학년부","부장","사회","204"],["윤체육","인성안전부","교사","체육","205"],
      ["장음악","문화환경부","교사","음악","206"],[ME,"학년부","교사","수학","207"],["한미술","교육정보부","교사","미술","208"],["오상담","진로교육부","교사","상담","209"],["서행정","행정실","주무관","","100"]
    ].map(function(a){ return {name: a[0], dept: a[1], pos: a[2], subj: a[3], tel: a[4]}; });
    put("tt_staff_v1", {v: 1, list: staff, main: [], at: Date.now()});
    var subjs = {"최국어":"국어","정영어":"영어","강과학":"과학","조사회":"사회","윤체육":"체육"}, teachers = [{name: ME, slots: slots}];
    Object.keys(subjs).forEach(function(t, ti){
      var sl = {}; for(var d = 1; d <= 5; d++) for(var p = 1; p <= 7; p++){ if((d * 3 + p + ti * 2) % 3 === 0){ var cc = 300 + ((d + p + ti) % 6) + 1; sl[d + "-" + p] = {code: String(cc), cls: cc, subj: subjs[t]}; } }
      teachers.push({name: t, slots: sl});
    });
    put("tt_alltt_v1", {v: 1, periods: PERIODS, teachers: teachers, at: Date.now()});
    /* 학사일정 (오늘 기준) */
    var E = [[2,"학부모 상담 주간","evt"],[6,"2학기 기말고사","exam"],[7,"2학기 기말고사","exam"],[8,"2학기 기말고사","exam"],[12,"진로 체험의 날","evt"],[16,"재량휴업일","off"],[-3,"과학의 날 행사","evt"],[22,"겨울방학식","evt"]];
    put("tt_calendar_v1", {v: 1, y: T0.getMonth() >= 2 ? T0.getFullYear() : T0.getFullYear() - 1, at: Date.now(),
      events: E.map(function(e){ return {d: ymd(schoolDay(T0, e[0])), t: e[1], k: e[2], src: "set"}; }).sort(function(a, b){ return a.d < b.d ? -1 : 1; })});
    /* 내 할 일 */
    var td = [["기말고사 문항 검토 제출", 0],["상담 주간 학부모 안내 문자", 1],["수행평가 점수 입력", 3],["교복 물려주기 신청서 정리", 5]];
    put("tt_mytodo_v1", {items: td.map(function(x, i){ return {id: "demo_t" + i, text: x[0], date: ymd(schoolDay(T0, x[1]) ), done: false, created: Date.now()}; })});
    /* 우리 반 출결·지도 (3학년 3반) */
    var att = {}, mark = function(dd, no, r){ var k = ymd(dd); (att[k] = att[k] || {})[String(no)] = r; };
    mark(schoolDay(T0, -1), 7, {t: "L"}); mark(schoolDay(T0, -2), 7, {t: "L"}); mark(schoolDay(T0, -4), 12, {t: "L"});
    mark(schoolDay(T0, -3), 18, {t: "A", k: "sick", why: "감기·몸살"}); mark(schoolDay(T0, -2), 18, {t: "A", k: "sick", why: "감기·몸살"});
    mark(schoolDay(T0, -6), 21, {t: "A", k: "ok", why: "교외체험학습"});
    put("tt_guide_v1", {v: 1, att: att, meta: {}, holidays: {}, reports: {}, guardians: {},
      counsel: [{id: "demo_c1", sid: "7", date: ymd(schoolDay(T0, -1)), trigger: "연속 지각", reasons: ["늦잠"], content: "늦게 자는 습관 이야기를 나눔. 알람 두 개 맞추기로 약속.", actions: ["약속 정하기"], actionNote: "", parent: "none", next: "", done: false, created: Date.now()}],
      gd: [{id: "demo_g1", sid: "4", date: ymd(schoolDay(T0, -1)), time: "", kind: "칭찬👍", how: "개별", memo: "모둠 활동에서 친구를 잘 도움", grp: "", created: Date.now()}],
      settings: {weekN: 3, runN: 2, mask: false, countApproved: false, school: "쌤비중학교", teacher: ME, confirm: "학부모와의 통화"}});
    /* 학교 업무판 (가짜 주소 · 응답은 아래 fetch에서 만듦) */
    put("tt_board_v1", {url: "https://script.google.com/macros/s/SSAMBI-DEMO/exec", pw: "demo", school: "쌤비중학교"});
    seed2(put, cls, plan);
  }

  /* ---------- 2-2. 견본 자료 보강 (PLAN_배포 2단계, v2.63.0): 수업 기록 · 학생 기록 · 생기부 초안 · 공부 Gym ---------- */
  var CUR3 = ["# 삼각비","삼각비의 뜻","특수한 각의 삼각비","삼각비의 값 구하기","삼각비의 활용 : 길이","삼각비의 활용 : 넓이","# 원의 성질","원과 현","원의 접선","원주각","원주각의 활용","# 통계","대푯값과 산포도","분산과 표준편차","산점도와 상관관계"];
  function seed2(put, cls, plan){
    var L = CUR3.filter(function(x){ return x[0] !== "#"; }), now = Date.now();
    /* 수업 기록장: 지난 3주 수업을 차례로 '수업함'으로, 학생 활동 기록 40여 개 */
    var students = {}, seats = {}, prog = {}, taught = {}, recs = [], id = 1;
    cls.forEach(function(c){
      var cc = c.grade * 100 + c.cls, nos = c.students.map(function(s){ return s.no; }), a = [];
      for(var i = 0; i < Math.ceil(nos.length / 5) * 5; i++) a.push(nos[i] || 0);
      students[cc] = c.students.map(function(s){ return {no: s.no, name: s.name}; }); seats[cc] = a; prog[cc] = {n: 0, memo: ""};
    });
    var TG = [["적극 참여"],["질문함"],["발표함"],["칠판 풀이"],["다양한 풀이"],["친구 설명"],["모둠 협력"],["심화 질문"],["오개념 수정"],["성실함","과제 성실"],["수행 우수"],["집중 부족"]];
    var TX = ["특수각 삼각비를 직각삼각형 그림으로 스스로 설명함","높이 구하기 문제를 두 가지 방법으로 풀어 비교함","모둠 친구에게 tan의 뜻을 차근차근 설명해 줌","원주각이 같은 이유를 질문하며 끝까지 탐구함","","","길이 구하기 활용 문제를 칠판에서 풀이함","",""];
    for(var b = 8; b >= 1; b--){
      var d = schoolDay(T0, -b), wd = d.getDay(), k = ymd(d);
      for(var p = 1; p <= 7; p++){
        var c = plan[wd + "-" + p]; if(!c) continue;
        if(prog[c].n >= L.length) continue;
        taught[k + "|" + p] = {kind: "done", lesson: prog[c].n};
        var les = L[prog[c].n]; prog[c].n++;
        var many = c === 303 ? 4 : 2;
        for(var r = 0; r < many; r++){
          var no = ((b * 7 + p * 5 + r * 11) % 26) + 1, t = TG[(b + p + r) % TG.length];
          recs.push({id: id++, date: k, period: p, cls: c, no: no, tags: t, text: TX[(b * 3 + r) % TX.length], star: (b + r) % 5 === 0, ts: now - b * 864e5 + p * 6e5 + r, les: les});
        }
      }
    }
    prog[303].memo = "다음 시간: 활용 문제 모둠 발표 · 활동지 회수"; prog[303].memoAt = ymd(T0);
    put("tt_journal_v1", {v: 2, hideNames: false, tt: {}, cur: {3: CUR3.join("\n")}, prog: prog, taught: taught, students: students, seats: seats, records: recs, lastCls: 303, nextId: id});
    /* 학생 기록 창고: 행동특성·진로·자율 기록 + 학생 메모 (수업 기록은 쌤 노트가 알아서 옮겨 옴) */
    var H = cls[2].students, nr = [], nm2 = function(no){ return H[no - 1].name; };
    [[1,"beh","학급 회의에서 의견을 조리 있게 정리해 발표함"],[1,"career","진로 체험의 날 소감문에 건축가의 하루를 자세히 적음"],[1,"auto","환경 정리 1인 1역(분리수거)을 한 학기 동안 꾸준히 해냄"],
     [4,"beh","모둠 활동에서 친구를 잘 도움"],[7,"beh","지각이 이어졌으나 상담 뒤 알람 약속을 지키려 노력함"],[9,"club","수학 탐구반에서 피보나치 수열 포스터를 만듦"],
     [12,"beh","급식 봉사를 자발적으로 맡아 책임감 있게 함"],[15,"career","관심 직업(간호사) 인터뷰 질문지를 직접 만듦"],[18,"auto","학교 축제 학급 부스 기획을 이끎"],[22,"beh","친구의 고민을 들어 주고 담임에게 알려 도움을 받게 함"]]
      .forEach(function(x, i){ nr.push({id: "demo_n" + i, k: "3-3-" + x[0], n: nm2(x[0]), date: ymd(schoolDay(T0, -(i + 2))), area: x[1], src: i % 3 ? "학생 기록" : "말로 기록", text: x[2], at: now - (i + 2) * 864e5}); });
    put("tt_notes_v1", {v: 1, recs: nr, updatedAt: now, memo: {"3-3-1": {t: "학급 회장 · 수학 탐구반", n: nm2(1), u: now}, "3-3-7": {t: "아침 지각 주의 · 알람 약속", n: nm2(7), u: now}, "3-3-18": {t: "몸이 자주 아픔 → 보건실 연계", n: nm2(18), u: now}}});
    put("tt_saeteuk_v1", {v: 1, few: 2, drafts: {"3-3-1": {subj: {t: "삼각비 단원에서 특수각의 삼각비를 직각삼각형 그림으로 스스로 설명하고, 높이 구하기 문제를 두 가지 방법으로 풀어 비교하는 등 수학적 의사소통 능력이 뛰어남.", u: now}}}});
    /* 공부 Gym: 3주째 다니는 학생 '수학근육왕' (휴대폰 화면용) */
    var G = {v: 1, nick: "수학근육왕", start: ymd(addD(MON, -14)), week: {start: ymd(MON), int: "rec"}, days: {}, xp: {warm: 620, kor: 1340, math: 2180, eng: 980, sci: 540, soc: 430}, lv: {warm: 2, kor: 3, math: 4, eng: 3, sci: 2, soc: 2},
      rx: {}, cards: {}, ptr: {}, conf: [], restUsed: {}, last: null, fib: {}, cur: {}, intake: {}, kp: null, kpDone: {}, kr: [], dsDone: {}, mode: "m3", prog: [], cls: null};
    for(var g = 13; g >= 0; g--){
      var gd = addD(T0, -g); if(g % 7 === 3) continue;
      var sec = g === 0 ? {warm: 600, math: 900, kor: 300} : {warm: 600, kor: 600 + (g % 3) * 300, math: 900 + (g % 2) * 300, eng: 600, sci: g % 2 ? 600 : 0, soc: g % 3 ? 600 : 0};
      var xs = 0; for(var s in sec) xs += Math.round(sec[s] / 6);
      G.days[ymd(gd)] = {sec: sec, xp: xs, sets: {}, n: {}, ok: {}, t: {}, rev: {}, cond: g % 4 ? "good" : "ok"};
      G.last = ymd(gd);
    }
    put("gym_v1", G);
  }
  if(!fake.getItem("tt_school_v1")) seed();

  /* ---------- 3. 밖으로 가는 요청: 가짜로 답하거나 막기 ---------- */
  var BOARD = [["교무운영부","기말고사 문항 최종 검토","15:30",0],["학년부","3학년 진학 상담 자료 배부","",0],["인성안전부","학교폭력 예방 교육(5교시)","13:30",1],
    ["연구장학부","수업 공개의 날 협의회","16:00",2],["행정실","교복 물려주기 접수 마감","",3],["진로교육부","진로 체험의 날 사전 안내","",4],["교감","교직원 회의","16:30",5],["학년부","졸업 앨범 촬영","",7],["교무운영부","생활기록부 점검 1차","",8]];
  var LIB = [["규정","쌤비중학교 학교생활 규정","교칙 · 상벌점 기준 · 2026 개정판","pdf","교무운영부"],["교육계획","2026 학교 교육계획서","학년별 운영 계획 · 평가 계획 포함","pdf","교무운영부"],
    ["서식","결석계·체험학습 신청서 서식 모음","담임 출결 서식 한 번에","hwpx","교무운영부"],["학사·평가","2학기 기말고사 시행 계획","시험 시간표 · 감독 배정","pdf","연구장학부"],
    ["생활기록부","학교생활기록부 점검 일정 안내","1·2차 점검 기간과 유의점","pdf","교무운영부"],["업무 안내","교복 물려주기 운영 안내","신청 · 접수 · 배부 순서","hwpx","행정실"],
    ["연수 자료","학교폭력 예방 교육 자료(교사용)","5교시 교육 진행용 슬라이드","pdf","인성안전부"],["서식","학부모 상담 기록지","상담 주간용","hwpx","학년부"]];
  function boardJson(body){
    var b = {}; try{ b = JSON.parse(body || "{}"); }catch(e){}
    if(b.action === "liblist") return {ok: true, items: LIB.map(function(x, i){ return {id: "demo_f" + i, name: x[1] + "." + x[3], title: x[1], cat: x[0], desc: x[2], by: x[4], at: ymd(addD(T0, -(i + 1) * 3)), size: 180000 + i * 41000, pages: 0, latest: true}; })};   /* 견본 자료실 목록(파일은 없음) */
    if(b.action === "aiinfo") return {ok: true, enabled: false};
    if(b.action && b.action !== "week" && b.action !== "month") return {ok: false, error: "견본 모드에서는 업무판을 고칠 수 없어요"};
    var items = BOARD.map(function(x, i){ return {type: "item", id: "demo_b" + i, date: ymd(schoolDay(MON, x[3])), dept: x[0], text: x[1], title: x[1], time: x[2]}; });
    return {ok: true, school: "쌤비중학교", items: items};
  }
  var MENU = ["보리밥/돼지고기김치찌개/계란말이/깍두기/요구르트","카레라이스/미니돈까스/양배추샐러드/배추김치/귤","잡곡밥/소고기미역국/닭갈비/콩나물무침/깍두기","김치볶음밥/어묵국/떡꼬치/요구르트","현미밥/된장찌개/불고기/시금치나물/사과"];
  function mealJson(u){
    var m = /MLSV_FROM_YMD=(\d{8})/.exec(u), row = [];
    if(m){ var d0 = new Date(+m[1].slice(0, 4), +m[1].slice(4, 6) - 1, +m[1].slice(6, 8)); for(var i = 0; i < 5; i++){ var d = addD(d0, i); row.push({MLSV_YMD: ymd(d).replace(/-/g, ""), MMEAL_SC_NM: "중식", DDISH_NM: MENU[i].split("/").join("<br/>"), CAL_INFO: (720 + i * 23) + " Kcal"}); } }
    return {mealServiceDietInfo: [{head: [{list_total_count: row.length}, {RESULT: {CODE: "INFO-000", MESSAGE: "정상 처리되었습니다."}}]}, {row: row}]};
  }
  function reply(o){ return Promise.resolve(new Response(JSON.stringify(o), {status: 200, headers: {"Content-Type": "application/json"}})); }
  var oFetch = window.fetch && window.fetch.bind(window);
  if(oFetch) window.fetch = function(input, init){
    var u = typeof input === "string" ? input : (input && input.url) || "", meth = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
    if(/^https:\/\/script\.google(usercontent)?\.com\//.test(u)){
      if(u.indexOf("SSAMBI-DEMO") >= 0) return reply(boardJson(init && init.body));
      return reply({ok: false, error: "견본 모드에서는 보낼 수 없어요"});
    }
    if(/^https:\/\/open\.neis\.go\.kr\//.test(u)) return reply(/mealServiceDietInfo/.test(u) ? mealJson(u) : {RESULT: {CODE: "INFO-200", MESSAGE: "해당하는 데이터가 없습니다."}});
    if(meth !== "GET" && /^https?:/.test(u) && u.indexOf(location.origin) !== 0) return reply({ok: false, error: "견본 모드에서는 보낼 수 없어요"});
    return oFetch(input, init);
  };
  try{ if(navigator.sendBeacon) navigator.sendBeacon = function(){ return true; }; }catch(e){}

  /* ---------- 4. 견본 표시 (맨 바깥 창에만) ---------- */
  function end(){ dropAll(); location.href = location.pathname.replace(/apps\/[^\/]+\/(index\.html)?$/, "") || "./"; }
  function badge(){
    if(window.top !== window || document.getElementById("snDemo")) return;
    var b = document.createElement("div"); b.id = "snDemo"; b.setAttribute("role", "status");
    var nar = Math.min(window.innerWidth || 999, screen.width || 999) < 640;
    b.innerHTML = nar ? '<span>🎬 견본</span><button type="button">끝내기</button>' : '<span>🎬 견본 모드 · 가짜 자료예요</span><button type="button">견본 끝내기</button>';
    b.style.cssText = "position:fixed;left:50%;top:6px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:8px;padding:5px 6px 5px 12px;white-space:nowrap;border-radius:999px;background:#2b2b33;color:#fff;font:600 12.5px/1.2 system-ui,'Malgun Gothic',sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25);opacity:.92;pointer-events:auto";
    if(nar){ b.style.left = "auto"; b.style.right = "96px"; b.style.transform = "none"; b.style.fontSize = "11.5px"; }
    var btn = b.querySelector("button"); btn.style.cssText = "border:0;border-radius:999px;padding:4px 10px;background:#ffd84d;color:#2b2b33;font:inherit;cursor:pointer";
    btn.addEventListener("click", end);
    document.body.appendChild(b);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", badge); else badge();
  window.TT_DEMO = {on: true, end: end, reseed: function(){ fake.clear(); seed(); location.reload(); }};
})();
