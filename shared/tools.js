/* 도구 목록 · 첫 화면과 오프라인 저장이 이 목록을 함께 씁니다.
   새 도구를 넣을 때: apps/<이름>/index.html 을 만들고 아래에 한 줄 추가합니다.
   scope: "home" = 담임용, "all" = 담임·교과 공통.  ready: 완성되면 true.
   short: 도구 화면 왼쪽 이동 메뉴에 쓰는 짧은 이름.  room: 교실 기기(전자칠판)에서도 쓰는 수업용 도구.
   href 대신 file 을 적으면 웹 도구가 아니라 내려받는 PC 프로그램입니다(downloads 폴더).
   cat: 갈래(TT_CATS). 첫 화면은 갈래 카드 5장, 도구는 그 안의 단추로 나옵니다. 왼쪽 메뉴는 갈래 → 도구로 펼쳐집니다.
   in: 다른 도구에 딸린 도구(예: 가산점 → 진학). 부모 단추 옆에 작은 단추로 붙습니다.
   home: true 이면 우리 반(★)이 있어야 쓰는 담임 도구 — 우리 반이 없으면 흐리게 보입니다(숨기지 않음).
   months: [3] 처럼 적으면 그달에 첫 화면에서 "이달 추천"으로 표시됩니다(shared/today.js).
   exam: 21 처럼 적으면 학사일정의 시험 21일 전부터 시험 날까지 추천으로 표시됩니다.

   ── 개편 0단계(v0.27): 도구 정보는 이 파일 한 곳에서만 고칩니다 ──
   menu: 새 메뉴(TT_MENUS) — class 수업 · homeroom 우리 반 · student 학생 · school 학교 · settings 설정.
   group: 그 메뉴 안의 묶음(TT_MENUS 의 groups).  subject: "math" 처럼 적으면 교과 칸(교과 팩) 도구.
   ── 개편 2단계(v0.29): 첫 화면 '전체 도구'와 도구 화면 왼쪽 메뉴를 menu → group 기준으로 그립니다 ──
   목록 순서 = 화면에 나오는 순서. cat 과 TT_CATS 는 예전 화면(저장본)이 깨지지 않게 남겨 둔 것으로, 더는 쓰지 않습니다.
   old: 바꾸기 전 이름. 찾기(Ctrl+K)에서 예전 이름으로도 찾고, 각 도구 화면의 제목(h1·창 제목)을 새 이름으로 바꿔 보여 줍니다.
   season: ["start"|"mid"|"end"] — 메뉴 화면에서 그 시기(학기초 2·3·8월 / 학기중 / 학기말 6·7·11·12월)에 앞으로 나오는 도구 (개편 6단계)
   who: "homeroom" 메뉴(우리 반)는 학교·선생님 설정에서 '교과만'을 고르면 숨깁니다(ttMenuShown).

   ── 개편 3단계(v0.30): 교과 칸 = 교과 팩 ──
   교과 전용 자료와 도구는 subjects/<교과>.js (교과 팩) 한 파일에 둡니다: 단원 목록 · 교과 자료 연결(링크) · 교과 전용 도구.
   새 교과를 넣을 때: subjects/math.js 를 본떠 subjects/<id>.js 를 만들고 아래 TT_PACKS 에 한 줄 추가합니다(다른 파일은 고치지 않음).
   어떤 팩을 쓸지는 학교·선생님 설정의 '교과 칸'(tt_school_v1.pack)으로 고릅니다. 고르지 않았으면 '내 교과'(subject) 글자로 찾고,
   그것도 없으면 첫 팩(수학, 견본)을 씁니다. 'none' 이면 팩 없이 교과 칸에 '교과 자료 연결'(링크 모음)만 보입니다.
   팩 파일은 고른 것 하나만 불러옵니다: 첫 화면은 ttPackWrite(""), 도구 화면은 tt.js 가 ttPackLoad 로.
   다른 화면에 도구 이름을 쓸 때는 글자로 적지 말고 ttName("journal") · ttLabel("journal") 을 쓰거나,
   HTML 에서는 <b data-tn="journal">수업 기록장</b> 처럼 적습니다(ttFillNames 가 이 목록의 이름으로 바꿈).
   그래야 이 목록에서 이름만 바꾸면 모든 화면이 함께 바뀝니다.
   id 와 href, 저장 키(localStorage 이름)는 절대 바꾸지 않습니다 — 저장된 기록과 📌 고정이 id 로 연결됩니다. */
/* 갈래 아이콘: 📚 교과지도  🌱 생활지도  🤝 상담·생기부  💼 업무  🧮 수학 (모든 교과에 보임 — 다른 교과도 참고해 꾸러미를 만들 수 있게)
   아이콘 표 — 기능마다 하나씩, 같은 기능은 어느 화면에서나 같은 아이콘을 씁니다. 새 기능은 겹치지 않게 골라 여기에 적으세요.
   🍎 쌤 노트(첫 화면)  📌 학사일정  👥 학급 명렬표  📷 사진 이름  📇 학생 카드  ✍️ 학생 기록  🕘 내 시간표
   📒 수업 기록장  🧩 모둠 편성  🧰 수업 도구 (🖍️ 칠판 · 🎲 뽑기 · ⏱️ 타이머 · 🏆 모둠 점수 · 🚦 소음)
   🧭 생활지도  🗣️ 상담  📄 결석신고서  ✉️ 학부모 문자  🏅 가산점  🎓 진학 추천  📑 생기부 도우미  📎 파일 합치기
   📅 학교 업무판  📝 내 할 일  ☁️ 동기화(보관함)  🏫 교실 기기  🏷️ 학교·선생님 설정  💾 백업  🖼️ 그림 저장  🔒 개인정보 보호 안내  📖 지금 차시
   🗃️ 문장 은행  🧾 기록 마감 점검표  🗂️ 상담 카드  🖨 인쇄
   📘 교과서·수업 모드  🗺️ 개념지도·도전 문제  🔥 도전 문제(기출)  🔢 문항 생성기  ✅ 형성평가  🔁 보충  🎯 이원목적분류표  ⏳ 진도·시수
   📊 수행평가  📦 제출물 체크  🧹 1인 1역·당번  🪑 자리 바꾸기
   📆 연간 업무  🤖 AI·문서 도우미 (📃 학습지·문항 📏 채점 기준 📨 가정통신문 🏛️ 공문 🗒️ 회의록 💬 민원 답변 ✒️ 세특 다듬기 ✨ 자유 요청 🗄️ 보관함)  🔎 학교 자료실
   📜 의무연수 취합  🧳 학기초 세팅
   🎮 수학 놀이터 (🎁 보물 상자 💣 숫자 폭탄 🎡 돌림판 🛤️ 주사위 말판 🏇 주사위 합 경주 🃏 하이·로우 🏁 퀴즈 배틀 🎱 수학 빙고 ➕ 숫자 만들기 🕵️ 수 탐정 📈 그래프 맞히기 🔲 스도쿠 🔷 세 장 찾기 🎴 짝 맞추기 🗼 하노이 탑 🪄 마방진 🔥 성냥개비 식) */
var TT_CATS = [
  {id:"teach", icon:"📚", name:"교과지도",   desc:"시간표 · 교과서·수업 모드 · 수업 기록 · 수업 도구 · 모둠 · 수행평가"},
  {id:"life",  icon:"🌱", name:"생활지도",   desc:"학급 명렬표 · 출결·결석계 · 학부모 문자 · 제출물 · 1인 1역"},
  {id:"care",  icon:"🤝", name:"상담·생기부", desc:"상담 · 생기부 도우미 · 진학(가산점)"},
  {id:"work",  icon:"💼", name:"업무",       desc:"연간 업무·학사일정 · AI·문서 도우미 · 파일 합치기"},
  {id:"math",  icon:"🧮", name:"수학",       desc:"개념지도·도전 문제 · 문항 생성 · 형성평가·보충 · 이원목적분류표 · 진도 · 수학 놀이터", soon:["📐 도형·그래프 그리기","📉 통계 실험"]}
];
/* 새 메뉴 구성 (PLAN_개편.md 확정안). color 는 1단계에서 CSS 변수로 연결합니다. who: "homeroom" = 담임에게만 보이는 메뉴 */
var TT_MENUS = [
  {id:"home",     icon:"🏠", name:"홈",    color:"",       who:"all",      groups:[]},
  {id:"class",    icon:"📚", name:"수업",  color:"blue",   who:"all",      groups:[{id:"teach", name:"수업하기"}, {id:"eval", name:"평가"}, {id:"subject", name:"교과 칸"}]},
  {id:"homeroom", icon:"🌱", name:"우리 반", color:"green", who:"homeroom", groups:[{id:"room", name:"우리 반"}]},
  {id:"student",  icon:"🤝", name:"학생",  color:"purple", who:"all",      groups:[{id:"stu", name:"학생"}]},
  {id:"school",   icon:"🏫", name:"학교",  color:"teal",   who:"all",      groups:[{id:"board", name:"업무판"}, {id:"lib", name:"자료실"}, {id:"work", name:"업무 도구"}]},
  {id:"settings", icon:"⋯",  name:"설정",  color:"",       who:"all",      groups:[{id:"guide", name:"안내"}, {id:"set", name:"설정"}, {id:"data", name:"백업"}, {id:"year", name:"새 학년"}]}
];
/* 교과 팩 목록: 파일은 subjects/ 폴더. 팩 안의 도구는 불러올 때 TT_TOOLS 에 붙습니다(menu:"class", group:"subject", subject:id) */
var TT_PACKS = [
  {id:"math", name:"수학", icon:"🧮", file:"subjects/math.js"},
  {id:"korean", name:"국어", icon:"📖", file:"subjects/korean.js"}
];
var TT_PACK_DATA = {};   // 불러온 팩: {id: {id, name, units, links, tools}}
var TT_TOOLS = [
  /* ── 수업 · 수업하기 ── */
  {id:"timetable",icon:"🕘", cat:"teach", menu:"class", group:"teach", short:"내 시간표", name:"내 시간표", desc:"컴시간 시간표를 붙여 넣으면 오늘 수업·수업 기록에 쓰입니다. 수업 교체는 그 주에만 반영.", href:"apps/timetable/", ready:true, room:true, season:["start"]},
  {id:"book",   icon:"📘", cat:"teach", menu:"class", group:"teach", short:"교과서", name:"교과서 띄우기", old:"교과서·수업 모드", desc:"▶ 수업 모드: ① 교과서 ② 개념 정리 ③ 교과서 문제(타이머) ④ 도전 문제 → [오늘 수업 끝] 한 번으로 진도 저장 · 반마다 지난 쪽에서 · 진도표.", href:"apps/book/", ready:true, room:true},
  {id:"remote", icon:"📱", cat:"teach", menu:"class", group:"teach", noRail:true, short:"리모컨", name:"수업 리모컨", desc:"휴대폰으로 교실 화면의 교과서를 넘기고 확대·단계·타이머·번호 뽑기·목표 띄우기 (보관함 연결 필요).", href:"apps/remote/", ready:true},
  {id:"journal",icon:"📒", cat:"teach", menu:"class", group:"teach", short:"수업 기록", name:"수업 기록", old:"수업 기록장", desc:"수업 진도와 학생 활동을 반별로 기록합니다.", href:"apps/journal/", ready:true, room:true},
  {id:"class",  icon:"🧰", cat:"teach", menu:"class", group:"teach", short:"교실 도구", name:"교실 도구", old:"수업 도구", desc:"칠판(모눈·좌표평면) · 뽑기 · 타이머 · 모둠 점수 · 소음 신호등.", href:"apps/class/", ready:true, room:true},
  {id:"group",  icon:"🧩", cat:"teach", menu:"class", group:"teach", short:"모둠 편성", name:"모둠 편성", desc:"조건에 맞게 모둠과 좌석을 편성합니다.", href:"apps/group/", ready:true, room:true, months:[3], season:["start"]},
  /* ── 수업 · 평가 ── */
  {id:"stuprog", icon:"🎒", cat:"teach", menu:"class", group:"teach", short:"학생 프로그램", name:"학생 프로그램", desc:"학생 휴대폰용 중학 개념지도(수학) · 국어 근육 — 큰 QR · 인쇄용 · 교실 함께 읽기 · 결과 모으기.", href:"apps/stuprog/", ready:true, room:true},
  {id:"assess", icon:"📊", cat:"teach", menu:"class", group:"eval", short:"수행평가", name:"수행평가", desc:"채점 기준(점수형·수준형)을 만들고 반마다 채점, 관찰은 교과 세특 기록으로.", href:"apps/assess/", ready:true, season:["start","end"]},
  {id:"mblue",  icon:"🎯", cat:"math", menu:"class", group:"eval",  short:"분류표", name:"이원목적분류표", desc:"문항별 성취기준·난이도·배점·정답 → 합계·분포 점검, 인쇄.", href:"apps/mblue/", ready:true, exam:21, season:["end"]},
  /* ── 수업 · 교과 칸 ── 교과 전용 도구는 교과 팩 파일(subjects/<교과>.js)에 있습니다. 아래 TT_PACKS 참고 */
  /* ── 우리 반 (담임) ── */
  {id:"roster", icon:"👥", cat:"life", menu:"homeroom", group:"room",  short:"명렬표", name:"명렬표", old:"학급 명렬표", desc:"나이스 명단 · 학생 사진과 메모 · 학생 카드(상담 카드).", href:"apps/roster/", ready:true, room:true, months:[3], season:["start"]},
  {id:"photo",  icon:"📷", cat:"life", menu:"homeroom", group:"room",  short:"사진", in:"roster", name:"사진 파일명", old:"나이스 사진 이름", desc:"반 사진을 명렬표 순서대로 이름(번호)로 바꾸고 용량도 줄입니다.", href:"apps/photo/", ready:true, home:true, season:["start"]},
  {id:"tardy",  icon:"🧭", cat:"life", menu:"homeroom", group:"room",  short:"출결", name:"출결·결석계", desc:"무단지각 확인, 결석 사유와 결석신고서(한글 파일·인쇄).", href:"apps/tardy/", ready:true, home:true},
  {id:"parent", icon:"✉️", cat:"life", menu:"homeroom", group:"room",  short:"문자", name:"학부모 문자", desc:"상황별 학부모 안내 문자를 빠르게 만듭니다.", href:"apps/parent/", ready:true},
  {id:"submit", icon:"📦", cat:"life", menu:"homeroom", group:"room",  short:"제출물", name:"제출물 확인", old:"제출물 체크", desc:"동의서·회신·신청서를 학생별로 체크하고 미제출자만 모아 봅니다.", href:"apps/submit/", ready:true},
  {id:"duty",   icon:"🧹", cat:"life", menu:"homeroom", group:"room",  short:"1인 1역", name:"1인 1역·당번", desc:"역할을 정하면 주마다 학생이 자동으로 돌아갑니다. 전자칠판에 띄워 씁니다.", href:"apps/duty/", ready:true, room:true, home:true, months:[3], season:["start"]},
  {id:"seat",   icon:"🪑", cat:"life", menu:"homeroom", group:"room",  short:"자리 배치", name:"자리 배치", desc:"명렬표로 자리표 만들기 · 무작위 · 바꾸기 · 고정 · 학생 쪽에서 보기 · 인쇄 (이 기기에만).", href:"apps/seat/", ready:true, room:true, season:["start"]},
  /* ── 학생 ── */
  {id:"stucard",icon:"📇", cat:"care", menu:"student", group:"stu",  short:"학생 카드", name:"학생 카드", desc:"학생 한 명의 기록 · 출결 · 상담 · 제출물을 한 화면에 (읽기 전용).", href:"apps/stucard/", ready:true},
  {id:"voice",  icon:"🎙️", cat:"care", menu:"student", group:"stu",  short:"말로 기록", name:"말로 기록", old:"녹음", desc:"상담·학부모 상담·회의·수업 관찰·할 일을 말로 남기고, 이름을 가린 뒤 AI로 정리해 제자리에 저장(소리는 저장 안 함).", href:"apps/voice/", ready:true},
  {id:"gquick", icon:"⚡", cat:"care", menu:"student", group:"stu",  short:"빠른 지도", name:"빠른 지도", desc:"어느 반에서나: 지도 종류를 고르고 학생을 누르면 바로 기록 (우리 반은 출결과 함께).", href:"apps/sguide/?tab=guide", ready:true},
  {id:"counsel",icon:"🗣️", cat:"care", menu:"student", group:"stu",  short:"상담 일지", name:"상담 일지", old:"상담", desc:"어느 반에서나 상담일지 · 후속 확인 (교과 세특 참고로도 모임).", href:"apps/sguide/?tab=counsel", ready:true},
  {id:"record", icon:"📑", cat:"care", menu:"student", group:"stu",  short:"생기부", name:"생기부 도우미", desc:"모인 학생 기록을 영역별로 보며 초안 쓰기 · 나이스 글자 수 · 유의 낱말 점검.", href:"apps/record/", ready:true, months:[7,12], season:["end"]},
  {id:"advisor",icon:"🎓", cat:"care", menu:"student", group:"stu",  short:"진학 추천", name:"진학 추천", old:"진학", desc:"성적 분석 · 지원 가능 고교 살펴보기 · 가산점 자동 입력.", href:"apps/advisor/", ready:true, home:true, months:[10,11], season:["end"]},
  {id:"bonus",  icon:"🏅", cat:"care", menu:"student", group:"stu",  short:"가산점", in:"advisor", name:"가산점 계산", old:"가산점 자동 입력", desc:"수상경력·창체 파일을 올리면 가산점 양식을 자동으로 채웁니다.", href:"apps/bonus/", ready:true, home:true, months:[10,11], season:["end"]},
  /* ── 학교 ── (업무판 묶음의 '주간·월간 업무판'은 연결한 학교 업무판 주소로 그립니다) */
  {id:"schoolhub", icon:"🏫", cat:"work", menu:"school", group:"board", short:"업무판", name:"학교 업무판", desc:"주간·월간 업무판 · 내선번호 · 자주 보는 문서(자료실에서 ★)를 한 화면에.", href:"apps/school/", ready:true},
  {id:"year",   icon:"📆", cat:"work", menu:"school", group:"board",  short:"연간 업무", name:"연간 업무", desc:"해마다 돌아오는 일 · 학사일정 붙여 넣기 → 첫 화면 달력.", href:"apps/year/", ready:true},
  {id:"lib",    icon:"🔎", cat:"work", menu:"school", group:"lib",  short:"자료실", name:"자료실", old:"학교 자료실", desc:"규정집·교육계획서·기재요령·서식을 누구나 올리고 내용까지 찾기 (몇 쪽인지).", href:"apps/lib/", ready:true},
  {id:"ai",     icon:"🤖", cat:"work", menu:"school", group:"lib",  short:"문서 도우미", name:"문서 도우미", old:"AI·문서 도우미", desc:"개인정보를 가린 AI 요청문 · 🧾 자동 채움(가정통신문·안내 문자·신청서·명단 표·공문 틀에 학교·날짜·담임·명단을 채움) · 보관함.", href:"apps/ai/", ready:true},
  {id:"train",  icon:"📜", cat:"work", menu:"school", group:"work",  short:"의무연수", name:"의무연수 취합", desc:"꾸러미 이수증·이수번호를 한 번 내면 연수 담당자들이 한 번에 모아 갑니다.", href:"apps/train/", ready:true},
  {id:"merge",  icon:"📎", cat:"work", menu:"school", group:"lib",  short:"파일 합치기", name:"파일 합치기·나누기", desc:"엑셀·한글(hwpx)·PDF를 이 기기 안에서 합치기 · PDF 쪽 정리·나누기·글자/그림 뽑기. 서식까지 그대로는 윈도우 프로그램.", href:"apps/merge/", ready:true},
  /* ── 설정 ── */
  {id:"setup",  icon:"🧳", cat:"work", menu:"settings", group:"set",  short:"학기초 세팅", name:"학기초 세팅", desc:"담당자가 학교 원본 파일(학생 명렬 엑셀 · 한글 교직원 명렬·내선번호·시간표·학사일정)을 한꺼번에 넣고 잠근 파일 하나로 → 선생님은 불러와 내 이름만 고르면 끝.", href:"apps/setup/", ready:true, months:[2,3], season:["start"]}
];

/* ── 도구 정보 꺼내 쓰기 (모든 화면 공통) ── 목록이 없거나 id 가 틀리면 fallback(지금 적힌 글자)을 그대로 씁니다. */
function ttTool(id){ if(typeof TT_TOOLS === "undefined") return null; for(var i = 0; i < TT_TOOLS.length; i++) if(TT_TOOLS[i].id === id) return TT_TOOLS[i]; return null; }
/* 받침에 맞는 조사: ttJosa("수업 기록장", "을") → "수업 기록장을", ttJosa("진학", "로") → "진학으로" */
function ttJosa(w, j){
  if(!j) return w;
  var P = {"을":["을","를"], "를":["을","를"], "이":["이","가"], "가":["이","가"], "은":["은","는"], "는":["은","는"], "과":["과","와"], "와":["과","와"], "으로":["으로","로"], "로":["으로","로"]};
  var p = P[j]; if(!p) return w + j;
  var c = String(w).replace(/[\s)\]』」"']+$/, "").slice(-1).charCodeAt(0), b = c >= 0xAC00 && c <= 0xD7A3 ? (c - 0xAC00) % 28 : 0;
  if(p[0] === "으로") return w + (b && b !== 8 ? "으로" : "로");   // ㄹ 받침은 '로'
  return w + (b ? p[0] : p[1]);
}
function ttName(id, josa, fallback){ var t = ttTool(id); return ttJosa(t ? t.name : (fallback || id), josa); }
function ttShort(id, fallback){ var t = ttTool(id); return t ? (t.short || t.name) : (fallback || id); }
function ttLabel(id, fallback){ var t = ttTool(id); return t ? t.icon + " " + t.name : (fallback || id); }
/* 메뉴를 보여 줄지: 우리 반(who:"homeroom")은 '교과만' 선생님에게 숨김 (tt_school_v1.role === "subject") */
function ttIsSubjectOnly(){ try{ var o = JSON.parse(localStorage.getItem("tt_school_v1") || "null"); return !!(o && o.role === "subject"); }catch(e){ return false; } }
function ttMenuShown(id){ var m = ttMenu(id); return !m || m.who !== "homeroom" || !ttIsSubjectOnly(); }
/* 도구를 보여 줄지 (메뉴가 숨겨졌으면 그 도구도) */
function ttToolShown(t){ if(typeof t === "string") t = ttTool(t); return !!t && ttMenuShown(t.menu) && (!t.subject || !ttPackOnly() || t.subject === ttPackId()); }
/* PLAN_다듬기 5단계: 교과 칸에 모든 교과 팩 도구를 보일지. 학교·선생님 설정의 '내 교과만 보기'(tt_school_v1.packOnly)를 켜면 고른 교과만 */
function ttPackOnly(){ return !!ttSchoolObj().packOnly; }
/* 교과 칸 묶음 목록: 내 교과 먼저 [{id:"subject"(내 교과)|"subject_<팩>", pack, name}] */
function ttPackGroups(){
  var my = ttPackId(), L = TT_PACKS.filter(function(p){ return !ttPackOnly() || p.id === my; }).slice().sort(function(a, b){ return (b.id === my) - (a.id === my); });
  return L.map(function(p){ return {id: p.id === my ? "subject" : "subject_" + p.id, pack: p.id, name: "교과 칸 · " + p.name}; });
}

/* ── 교과 팩 (개편 3단계) ── */
function ttSchoolObj(){ try{ return JSON.parse(localStorage.getItem("tt_school_v1") || "null") || {}; }catch(e){ return {}; } }
function ttPackInfo(id){ for(var i = 0; i < TT_PACKS.length; i++) if(TT_PACKS[i].id === id) return TT_PACKS[i]; return null; }
/* 고른 교과 팩 id, 팩을 쓰지 않으면 "none" */
function ttPackId(){
  var o = ttSchoolObj(), p = String(o.pack || "");
  if(p) return ttPackInfo(p) ? p : "none";
  var subj = String(o.subject || "").replace(/\s+/g, "");
  if(subj){ for(var i = 0; i < TT_PACKS.length; i++) if(subj.indexOf(TT_PACKS[i].name) >= 0) return TT_PACKS[i].id; return "none"; }
  return TT_PACKS.length ? TT_PACKS[0].id : "none";   // 아무것도 정하지 않았으면 수학(견본) — 예전처럼 보이게
}
/* 불러온(고른) 팩 자료: {id, name, icon, units:{1:[…]}, links:[{n,u}], tools:[…]} 또는 null */
function ttPack(){ var id = ttPackId(); return TT_PACK_DATA[id] || null; }
/* 팩 파일이 부르는 함수: 팩을 등록하고 도구를 TT_TOOLS 에 붙임 */
function ttAddPack(p){
  if(!p || !p.id) return; var info = ttPackInfo(p.id) || {};
  p.name = p.name || info.name || p.id; p.icon = p.icon || info.icon || "📚";
  TT_PACK_DATA[p.id] = p;
  (p.tools || []).forEach(function(t){
    t.menu = "class"; t.group = "subject"; t.subject = p.id; if(t.ready == null) t.ready = true;
    if(!ttTool(t.id)) TT_TOOLS.push(t);
  });
}
/* 첫 화면처럼 HTML 을 읽는 중에 바로 부를 때: 고른 팩 파일을 그 자리에 끼워 넣음(다음 스크립트보다 먼저 실행됨) */
function ttPackWrite(base){
  if(typeof document === "undefined" || document.readyState !== "loading") return;
  var my = ttPackInfo(ttPackId()), L = ttPackOnly() ? (my ? [my] : []) : TT_PACKS.slice().sort(function(a, b){ return (my && b.id === my.id) - (my && a.id === my.id); });   // 내 교과 팩을 먼저(ttPack 은 내 교과)
  L.forEach(function(info){ if(!TT_PACK_DATA[info.id]) document.write('<script src="' + (base || "") + info.file + '"><\/script>'); });
}
/* 화면이 다 열린 뒤에 부를 때: 고른 팩(all 이면 모든 팩)을 불러오고 cb() */
function ttPackLoad(base, cb, all){
  var L = (all ? TT_PACKS : [ttPackInfo(ttPackId())]).filter(function(x){ return x && !TT_PACK_DATA[x.id]; }), n = L.length;
  if(!n || typeof document === "undefined"){ if(cb) cb(); return; }
  L.forEach(function(x){
    var s = document.createElement("script"); s.src = (base || "") + x.file;
    s.onload = s.onerror = function(){ if(--n === 0 && cb) cb(); }; document.head.appendChild(s);
  });
}
function ttMenu(id){ if(typeof TT_MENUS === "undefined") return null; for(var i = 0; i < TT_MENUS.length; i++) if(TT_MENUS[i].id === id) return TT_MENUS[i]; return null; }
/* HTML 안의 <… data-tn="id" [data-tj="을"] [data-ti]> 글자를 이 목록의 이름으로 (data-ti 가 있으면 아이콘도) */
function ttFillNames(root){
  if(typeof document === "undefined") return;
  Array.prototype.forEach.call((root || document).querySelectorAll("[data-tn]"), function(e){
    var t = ttTool(e.getAttribute("data-tn")); if(!t) return;
    e.textContent = (e.hasAttribute("data-ti") ? t.icon + " " : "") + ttJosa(t.name, e.getAttribute("data-tj") || "");
  });
}
