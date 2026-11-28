/* v2.11.6 우리 학교 공통 사이트 (관리자가 미리 넣어 두는 기본 목록) — 쌤 노트 '자주 가는 사이트'와 첫 화면 단추에 처음 한 번 들어갑니다.
   · c: "class" 수업용(교실 기기에도 보임) · "work" 업무용 · "me" 개인용 / pin: true 이면 첫 화면 단추로
   · 선생님이 지운 것은 다시 넣지 않습니다(tt_sites_v1.seeded 에 id 기억). 새로 추가한 줄은 다음에 열 때 각자 목록에 들어갑니다.
   · id 는 한 번 정하면 바꾸지 마세요. 아이디·비밀번호가 든 주소는 넣지 마세요(이 파일은 누구나 볼 수 있어요).
   · 다른 학교가 쓸 때는 이 목록만 자기 학교 것으로 바꾸면 됩니다. */
window.TT_SCHOOL_SITES = [
  {id: "d-eduptl",   t: "업무포털",       u: "https://gne.eduptl.kr/",                                  c: "work", pin: true},
  {id: "d-school",   t: "마산서중학교",   u: "https://masanseo-m.gne.go.kr/masanseo-m/main.do",         c: "work", pin: true, home: true},   // home: 본교 업무판에 연결된 기기에만
  {id: "d-bell",     t: "학교종이",       u: "https://schoolbell-e.com/",                               c: "work", pin: true},
  {id: "d-gneti",    t: "경남교육연수포털", u: "https://www.gneti.or.kr/",                              c: "work", pin: true},
  {id: "d-highsch",  t: "경남고입포털",   u: "https://highschool.gne.go.kr/s10/hsa/user/main.do",       c: "work", pin: true},
  /* v2.11.7 수업용 — 교과서 출판사 교사 지원 사이트(중등). 출판사가 학교마다 달라 📌 고정은 하지 않음 → 각자 쓰는 곳만 📌 */
  {id: "c-douclass", t: "두클래스 중등",   u: "https://mh.douclass.com/",                                c: "class"},
  {id: "c-tsherpa",  t: "티셀파 중등",     u: "https://mh.tsherpa.co.kr/",                               c: "class"},
  {id: "c-vivasam",  t: "비바샘 중등",     u: "https://v.vivasam.com/",                                  c: "class"},
  {id: "c-ycloud",   t: "Y클라우드 중등",  u: "https://www.ybmcloud.com/",                               c: "class"},
  {id: "c-tsol",     t: "티솔루션 중등",   u: "https://tsol.jihak.co.kr/main.ez?schoolTypeSeq=SUBJECT_SCHOOLTYPE_MIDDLE", c: "class"},
  {id: "c-mteacher", t: "엠티처 중등",     u: "https://m.m-teacher.co.kr/pages/mid/Main.mrn",            c: "class"},
  {id: "c-thub",     t: "티칭허브 중등",   u: "https://thub.kumsung.co.kr/main.do",                      c: "class"},
  {id: "c-neteacher",t: "능률엔이 중등",   u: "https://www.neteacher.co.kr/",                            c: "class"}
];
/* v2.12 날씨 위치 = 학교 위치 (선생님 기기 위치는 쓰지 않음). 지우면 날씨가 나오지 않습니다. */
window.TT_SCHOOL_WX = {name: "마산", lat: 35.21, lon: 128.57, home: true};
/* v2.67 다른 학교도 같은 사이트를 쓰므로, 본교에만 맞는 줄(home: true)은 본교 업무판에 연결된 기기에서만 씁니다.
   TT_SCHOOL_HOME(): true 본교 · false 다른 학교 · null 아직 업무판 연결 전 / demo=true 이면 견본 모드도 본교처럼(날씨만) */
window.TT_SCHOOL_HOME_BOARD = "AKfycbys89yIhtx7OdMvLikI7nBgBRTBqsYjK0qog4MfF5sR7cu_Ist0i3IADzLnPpiBqX0GkQ";
window.TT_SCHOOL_HOME = function(demo){
  try{
    var b = (window.TT && TT.store && TT.store.get("tt_board_v1", null)) || {}, u = String(b.url || "");
    if(!u) return null;
    if(demo && u.indexOf("SSAMBI-DEMO") >= 0) return true;
    return u.indexOf(window.TT_SCHOOL_HOME_BOARD) >= 0;
  }catch(e){ return null; }
};
/* 학교 목록에서 뺀 것: 이미 선생님 목록에 들어간 공통 사이트(🏫)도 지움 (선생님이 직접 넣은 것은 그대로) */
window.TT_SCHOOL_SITES_GONE = ["c-didimdol"];
window.TT_SITES_SEED = function(){
  try{
    if(!window.TT || !TT.store || TT.classroom) return false;
    var D = TT.store.get("tt_sites_v1", null) || {v: 1, items: []}, ch = false, home = window.TT_SCHOOL_HOME();
    D.items = D.items || []; D.seeded = D.seeded || [];
    var homeIds = window.TT_SCHOOL_SITES.filter(function(s){ return s.home; }).map(function(s){ return s.id; });
    window.TT_SCHOOL_SITES.forEach(function(s){
      if(s.home && home !== true) return;   // 본교 전용 줄은 본교 업무판에 연결된 뒤에만 (기억도 하지 않아 연결 뒤 들어감)
      if(D.seeded.indexOf(s.id) >= 0) return;
      D.seeded.push(s.id); ch = true;
      if(!D.items.some(function(x){ return x.u === s.u; })) D.items.push({id: s.id, t: s.t, u: s.u, c: s.c, pin: !!s.pin, sch: true});
    });
    var n0 = D.items.length;
    D.items = D.items.filter(function(x){ return !(x.sch && (window.TT_SCHOOL_SITES_GONE.indexOf(x.id) >= 0 || (home === false && homeIds.indexOf(x.id) >= 0))); });
    if(D.items.length !== n0) ch = true;
    if(ch) TT.store.set("tt_sites_v1", D);
    return ch;
  }catch(e){ return false; }
};
