/* 쌤 노트 v2.51 · 🌐 공식 자료 바로 찾기 — 교육부·교육청·법령처럼 기관 누리집에 늘 올라와 있는 지침은 올리지 않고 바로 찾아 씁니다
   - 자료실(apps/lib)의 '🌐 공식 자료' 갈래와 찾기 결과 아래에 나옵니다.
   - 주소는 기관 누리집의 목록 화면(해마다 새 판이 올라오는 곳)으로 연결합니다. 파일을 직접 가리키지 않으므로 새 판이 나와도 그대로 씁니다.
   - 목록에 없는 말은 교육부·우리 교육청 누리집 안에서 찾기(구글 사이트 검색)로 엽니다. 찾는 말만 보내고 학생·학교 자료는 보내지 않습니다.
   - 우리 교육청은 학기초 세팅의 나이스 교육청 코드(tt_school_v1.neisA)로 정합니다. */
(function(){
  "use strict";
  if(window.TT_OFFICIAL) return;
  var OFF = {B10: ["서울특별시교육청", "sen.go.kr"], C10: ["부산광역시교육청", "pen.go.kr"], D10: ["대구광역시교육청", "dge.go.kr"], E10: ["인천광역시교육청", "ice.go.kr"],
             F10: ["광주광역시교육청", "gen.go.kr"], G10: ["대전광역시교육청", "dje.go.kr"], H10: ["울산광역시교육청", "use.go.kr"], I10: ["세종특별자치시교육청", "sje.go.kr"],
             J10: ["경기도교육청", "goe.go.kr"], K10: ["강원특별자치도교육청", "gwe.go.kr"], M10: ["충청북도교육청", "cbe.go.kr"], N10: ["충청남도교육청", "cne.go.kr"],
             P10: ["전북특별자치도교육청", "jbe.go.kr"], Q10: ["전라남도교육청", "jne.go.kr"], R10: ["경상북도교육청", "gbe.kr"], S10: ["경상남도교육청", "gne.go.kr"], T10: ["제주특별자치도교육청", "jje.go.kr"]};
  function office(){
    var s = {}; try{ s = (window.TT && TT.school && TT.school.load ? TT.school.load() : null) || {}; }catch(e){}
    var o = OFF[String(s.neisA || "").toUpperCase()];
    return o ? {code: String(s.neisA).toUpperCase(), name: o[0], host: o[1]} : null;
  }
  var LAW = function(n){ return "https://www.law.go.kr/" + encodeURI("법령/" + n); };
  /* g: 갈래 · t: 이름 · who: 기관 · url: 바로 가기(없으면 q로 누리집 안에서 찾기) · k: 찾을 때 맞춰 볼 말 · d: 한 줄 설명 · at: 'moe' | 'off' | 'both' (찾기 범위) */
  var BASE = [
    {g: "생활기록부", t: "학교생활기록부 기재요령", who: "교육부 · 학생부 종합지원포털", url: "https://star.moe.go.kr/web/contents/m21100.do", k: "생활기록부 생기부 학생부 기재요령 기재 세특 행특 창체 출결 결석 인정 수상 진로 봉사 독서", d: "해마다 2월 새 판 · 초·중·고 학교급별"},
    {g: "생활기록부", t: "학교생활기록 작성 및 관리지침 (훈령)", who: "교육부 · 학생부 종합지원포털", url: "https://star.moe.go.kr/web/contents/m20103.do", k: "생활기록부 생기부 학생부 관리지침 훈령 정정 보존", d: "학생부 작성·정정·보존의 기준"},
    {g: "생활기록부", t: "학생부 종합지원포털 (기재 문의·FAQ·도움자료)", who: "교육부", url: "https://star.moe.go.kr/", k: "생활기록부 생기부 학생부 기재 문의 질문 FAQ 길라잡이 도움자료 설명영상", d: "기재 문의(Q&A) · 길라잡이 · 설명 영상"},
    {g: "교육과정", t: "국가 교육과정 원문 (2022 개정 등)", who: "국가교육과정정보센터", url: "https://ncic.re.kr/", k: "교육과정 성취기준 총론 각론 2022 개정 시수 편성", d: "총론·교과별 교육과정·성취기준"},
    {g: "법령", t: "초·중등교육법", who: "국가법령정보센터", url: LAW("초·중등교육법"), k: "법 법령 초중등교육법 학적 징계 수업 학교운영위원회", d: "학교 교육의 기본 법률"},
    {g: "법령", t: "초·중등교육법 시행령", who: "국가법령정보센터", url: LAW("초·중등교육법시행령"), k: "법 법령 시행령 수업일수 학년도 입학 전학 고입 전형 학생 징계", d: "수업일수·입학·전학 같은 세부 기준"},
    {g: "법령", t: "학교폭력예방 및 대책에 관한 법률", who: "국가법령정보센터", url: LAW("학교폭력예방및대책에관한법률"), k: "학교폭력 학폭 법 법령 심의 조치", d: "학교폭력 처리의 근거 법률"},
    {g: "법령", t: "교원지위법 (교육활동 보호)", who: "국가법령정보센터", url: LAW("교원의지위향상및교육활동보호를위한특별법"), k: "교권 교육활동 보호 침해 교원지위 법 법령", d: "교육활동 침해 대응의 근거 법률"},
    {g: "법령", t: "국가법령정보센터 (모든 법령·자치법규)", who: "법제처", url: "https://www.law.go.kr/", k: "법 법령 조례 자치법규 규칙 훈령", d: "교육청 조례·규칙도 여기서"},
    {g: "지침 찾기", t: "학교폭력 사안처리 가이드북", who: "교육부 누리집에서 찾기", q: "학교폭력 사안처리 가이드북", at: "both", k: "학교폭력 학폭 사안처리 가이드북 심의 전담기구", d: "해마다 새 판 · 교육부·교육청 게시"},
    {g: "지침 찾기", t: "학업성적관리 시행지침", who: "우리 교육청 누리집에서 찾기", q: "학업성적관리 시행지침", at: "off", k: "성적 평가 학업성적 수행평가 지필 시험 성적관리 규정", d: "교육청 지침 → 학교 학업성적관리규정의 근거"},
    {g: "지침 찾기", t: "교외체험학습 운영 지침", who: "우리 교육청 누리집에서 찾기", q: "교외체험학습 운영", at: "off", k: "체험학습 교외 현장체험 가정학습 출결 신청서 보고서", d: "신청·보고·출결 처리"},
    {g: "지침 찾기", t: "학생맞춤통합지원", who: "교육부·교육청 누리집에서 찾기", q: "학생맞춤통합지원", at: "both", k: "학맞통 학생맞춤 통합지원 학생지원 위기학생", d: "학생맞춤통합지원 운영 안내"},
    {g: "지침 찾기", t: "교육활동 보호 매뉴얼", who: "교육부·교육청 누리집에서 찾기", q: "교육활동 보호 매뉴얼", at: "both", k: "교권 교육활동 보호 침해 민원 매뉴얼", d: "교육활동 침해 대응 절차"},
    {g: "지침 찾기", t: "교육분야 개인정보보호 가이드라인", who: "교육부 누리집에서 찾기", q: "교육분야 개인정보보호 가이드라인", at: "moe", k: "개인정보 보호 가이드라인 동의서 파기", d: "수집·동의·파기 기준"},
    {g: "지침 찾기", t: "교복 지원 안내", who: "우리 교육청 누리집에서 찾기", q: "교복 지원", at: "off", k: "교복 지원 무상교복 학교주관구매", d: "교복 지원·학교주관구매"},
    {g: "지침 찾기", t: "학생 표창·포상 관련 안내", who: "우리 교육청 누리집에서 찾기", q: "학생 표창", at: "off", k: "표창 포상 시상 상장 수상 모범", d: "교육감 표창 추천 등"},
    {g: "바로가기", t: "한국장학재단", who: "교육부 산하", url: "https://www.kosaf.go.kr/", k: "장학금 장학 국가장학 꿈사다리", d: "장학 사업 안내·신청"},
    {g: "바로가기", t: "학교알리미", who: "교육부", url: "https://www.schoolinfo.go.kr/", k: "학교알리미 공시 학교정보 정보공시", d: "학교 정보 공시"},
    {g: "바로가기", t: "에듀넷·티-클리어", who: "한국교육학술정보원", url: "https://www.edunet.net/", k: "에듀넷 수업 자료 연수 교수학습", d: "수업 자료·교수학습 지원"},
    {g: "바로가기", t: "교육부 누리집", who: "교육부", url: "https://www.moe.go.kr/", k: "교육부 보도자료 정책 공지", d: "보도자료·정책 자료"}
  ];
  function items(){
    var o = office(), L = BASE.slice();
    if(o){
      L.push({g: "바로가기", t: o.name + " 누리집", who: o.name, url: "https://www." + o.host + "/", k: "교육청 공문 공지 고시 " + o.name, d: "공지·고시·자료실"});
      if(o.code === "S10"){
        L.push({g: "고입", t: "경남 고입포털 (입학전형 기본계획)", who: "경상남도교육청", url: "https://www.gne.go.kr/highschool/enter/plan/plan01/plan01_01.jsp", k: "고입 고등학교 입학 전형 기본계획 원서 내신 평준화 전기 후기", d: "전기·후기·평준화지역 전형"});
        L.push({g: "고입", t: "경남 고입 입학전형 일정", who: "경상남도교육청", url: "https://www.gne.go.kr/highschool/enter/schedule.jsp", k: "고입 고등학교 입학 일정 원서접수 합격자 발표", d: "원서 접수·전형·발표 일정"});
      }else L.push({g: "고입", t: "고등학교 입학전형 기본계획", who: o.name + " 누리집에서 찾기", q: "고등학교 입학전형 기본계획", at: "off", k: "고입 고등학교 입학 전형 기본계획 원서 내신 평준화", d: "올해 고입 전형·일정"});
    }else L.push({g: "고입", t: "고등학교 입학전형 기본계획", who: "교육청 누리집에서 찾기", q: "고등학교 입학전형 기본계획", at: "both", k: "고입 고등학교 입학 전형 기본계획 원서 내신", d: "학기초 세팅에서 학교(나이스)를 넣으면 우리 교육청으로 찾아요"});
    return L;
  }
  /* 누리집 안에서 찾기: 교육부 + 우리 교육청 (구글 사이트 검색) */
  function searchUrl(q, at){
    var o = office(), S = [];
    if(at !== "off") S.push("site:moe.go.kr");
    if(at !== "moe" && o) S.push("site:" + o.host);
    if(!S.length) S.push("site:moe.go.kr");
    return "https://www.google.com/search?q=" + encodeURIComponent(q + " (" + S.join(" OR ") + ")");
  }
  function href(it){ return it.url || searchUrl(it.q || it.t, it.at); }
  /* 찾을 말과 맞는 공식 자료 (점수 높은 순) */
  function match(q){
    q = String(q || "").trim(); if(!q) return [];
    var W = q.split(/\s+/).filter(function(w){ return w.length >= 2; }); if(!W.length) W = [q];
    return items().map(function(it){
      var hay = (it.t + " " + it.k).replace(/\s+/g, " "), sc = 0;
      W.forEach(function(w){ if(hay.indexOf(w) >= 0) sc += 2; else if(it.k.split(" ").some(function(k){ return k.length >= 2 && w.indexOf(k) >= 0; })) sc += 1; });
      return {it: it, sc: sc};
    }).filter(function(x){ return x.sc > 0; }).sort(function(a, b){ return b.sc - a.sc; }).map(function(x){ return x.it; });
  }
  window.TT_OFFICIAL = {items: items, match: match, href: href, searchUrl: searchUrl, office: office};
})();
