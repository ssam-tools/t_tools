/* 🧰 수학 도구 (PLAN_수업길 7~10단계) — window.TT_MTOOLS
   차시(쪽)마다 쓸 수학 앱을 모읍니다: ① 그 쪽의 📎 차시 자료 중 수학 앱 주소 ② 단원별 추천(아래 REC, 다른 선생님께 배포할 때 기본값)
   ③ 내장 수학 실험실(shared/mathlab.js, 인터넷 없이) ④ 내가 등록한 '수업용' 사이트(공용 기기에서는 이것만)
   여는 방법: embed:true → 쌤 노트 안에 띄우기 시도(안 뜨면 ↗ 새 창) · false → 새 창 (로그인·끼워 넣기 막힌 사이트)
   학생에게: QR · 주소 · 활동 코드 크게 + "이름 대신 번호만" 안내
   jidangmath가 Claude와 함께 제작 */
(function(){
  "use strict";
  if(window.TT_MTOOLS) return;
  var APPS = {
    ggbG: {n: "지오지브라 그래핑", ic: "📈", u: "https://www.geogebra.org/graphing", embed: true},
    ggbGeo: {n: "지오지브라 기하", ic: "📐", u: "https://www.geogebra.org/geometry", embed: true},
    ggb3d: {n: "지오지브라 3D", ic: "🧊", u: "https://www.geogebra.org/3d", embed: true},
    ggbP: {n: "지오지브라 확률", ic: "🎲", u: "https://www.geogebra.org/probability", embed: true},
    desmos: {n: "데스모스 계산기", ic: "📉", u: "https://www.desmos.com/calculator?lang=ko", embed: true},
    algeo: {n: "알지오매스", ic: "🔷", u: "https://www.algeomath.kr", embed: true},
    tong: {n: "통그라미", ic: "📊", u: "https://tong.kostat.go.kr", embed: false},
    kosis: {n: "KOSIS 통계놀이터", ic: "🧸", u: "https://kosis.kr/edu", embed: false}
  };
  /* 단원 코드 → [앱, 이렇게 써요] */
  var F = [["ggbG", "식을 넣고 슬라이더로 계수를 바꾸며 그래프 변화 보기"], ["desmos", "a, b 값을 바꿔 보며 그래프가 어떻게 움직이는지 예상 → 확인"]];
  var G = [["ggbGeo", "꼭짓점을 끌어 보며 변하지 않는 성질 찾기"], ["algeo", "같은 작도를 한국어 메뉴로"]];
  var REC = {
    PRIME: [], INT: [["desmos", "수직선 위에 점 찍어 크기 비교"]], CYCLIC: [], ROOT: [["ggbGeo", "넓이가 2인 정사각형의 한 변 작도하기"]],
    POLY: [["algeo", "대수 막대로 식의 계산 보기"]], LE: [["desmos", "y = 좌변, y = 우변 두 그래프의 교점이 해임을 확인"]], INEQ: [["desmos", "부등식의 영역을 수직선·좌표평면에 칠해 보기"]],
    SYS: [["desmos", "두 직선의 교점 = 연립방정식의 해"], ["ggbG", "두 식을 넣고 교점 찾기"]], FACT: [["algeo", "대수 막대로 인수분해를 직사각형 만들기로"]],
    QE: [["desmos", "y = x² + 10x − 39와 x축의 교점 확인"], ["ggbG", "계수 슬라이더로 근의 개수 변화 보기"]],
    INV: F, LF: F, QF: F,
    BASIC: G, PLANE: G, TRI: [["ggbGeo", "외심·내심 작도 후 꼭짓점 끌어 보기"], ["algeo", "같은 작도를 한국어 메뉴로"]], QUAD: G, SIM: G,
    PYTH: [["ggbGeo", "직각삼각형 꼭짓점을 끌며 세 정사각형 넓이 비교"], ["algeo", "같은 작도를 한국어 메뉴로"]],
    TRIG: [["ggbGeo", "각을 바꾸며 sin·cos·tan 값 관찰"]], CIRCLE: [["ggbGeo", "원주각 꼭짓점을 원 위에서 움직여 보기"]],
    SOLID: [["ggb3d", "입체도형 돌려 보기·전개도"]],
    PROB: [["ggbP", "실험 횟수를 늘리며 상대도수 관찰"]],
    STAT1: [["tong", "우리 반 자료로 히스토그램·도수분포다각형"], ["kosis", "실제 국가통계 자료로 그래프 읽기"]],
    STAT2: [["tong", "상자 그림·산점도 그리기"], ["kosis", "실제 자료로 상관관계 찾기"]]
  };
  var LAB = {PRIME: "sieve", PYTH: "pyth", QE: "qe", QF: "qe", FACT: "qe", PROB: "prob", STAT1: "scatter", STAT2: "scatter", LF: "graph", INV: "graph", SYS: "graph"};
  function host(u){ try{ return new URL(u).hostname.replace(/^www\./, ""); }catch(e){ return ""; } }
  var EMB = /(^|\.)(geogebra\.org|desmos\.com|algeomath\.kr)$/;
  /* 이 차시 도구 목록: code(단원), res(이 쪽 📎 자료 [{t,u}]), opt.sites(수업용 사이트 포함) */
  function forPage(code, res, opt){
    var out = [], seen = {};
    (res || []).forEach(function(r){ var h = host(r.u); if(!h || seen[r.u]) return; seen[r.u] = 1; out.push({n: r.t || h, ic: "📎", u: r.u, how: "이 차시 자료", embed: EMB.test(h), src: "page"}); });
    (REC[code] || []).forEach(function(x){ var a = APPS[x[0]]; if(!a || seen[a.u]) return; seen[a.u] = 1; out.push({n: a.n, ic: a.ic, u: a.u, how: x[1], embed: a.embed, src: "rec"}); });
    if(opt && opt.sites){ try{ var D = TT.store.get("tt_sites_v1", null); (D && D.items || []).filter(function(x){ return x.c === "class" && x.u && !seen[x.u]; }).slice(0, 8).forEach(function(x){ seen[x.u] = 1; out.push({n: x.t || host(x.u), ic: "🌐", u: x.u, how: "내 수업용 사이트", embed: EMB.test(host(x.u)), src: "site"}); }); }catch(e){} }
    return out;
  }
  window.TT_MTOOLS = {APPS: APPS, REC: REC, lab: function(c){ return LAB[c] || ""; }, forPage: forPage, embeddable: function(u){ return EMB.test(host(u)); }};
})();
