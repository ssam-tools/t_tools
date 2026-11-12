/* 도구 목록 · 첫 화면과 오프라인 저장이 이 목록을 함께 씁니다.
   새 도구를 넣을 때: apps/<이름>/index.html 을 만들고 아래에 한 줄 추가합니다.
   scope: "home" = 담임용, "all" = 담임·교과 공통.  ready: 완성되면 true.
   short: 도구 화면 왼쪽 이동 메뉴에 쓰는 짧은 이름.  room: 교실 기기(전자칠판)에서도 쓰는 수업용 도구.
   href 대신 file 을 적으면 웹 도구가 아니라 내려받는 PC 프로그램입니다(downloads 폴더).
   cat: 갈래(TT_CATS). 첫 화면은 갈래 카드 5장, 도구는 그 안의 단추로 나옵니다. 왼쪽 메뉴는 갈래 → 도구로 펼쳐집니다.
   in: 다른 도구에 딸린 도구(예: 가산점 → 진학). 부모 단추 옆에 작은 단추로 붙습니다.
   home: true 이면 우리 반(★)이 있어야 쓰는 담임 도구 — 우리 반이 없으면 흐리게 보입니다(숨기지 않음). */
/* 갈래 아이콘: 📚 교과지도  🌱 생활지도  🤝 상담·생기부  💼 업무  🧮 수학 (모든 교과에 보임 — 다른 교과도 참고해 꾸러미를 만들 수 있게)
   아이콘 표 — 기능마다 하나씩, 같은 기능은 어느 화면에서나 같은 아이콘을 씁니다. 새 기능은 겹치지 않게 골라 여기에 적으세요.
   🍎 쌤 노트(첫 화면)  📌 학사일정  👥 학급 명렬표  📷 사진 이름  📇 학생 카드  ✍️ 학생 기록  🕘 내 시간표
   📒 수업 기록장  🧩 모둠 편성  🧰 수업 도구 (🖍️ 칠판 · 🎲 뽑기 · ⏱️ 타이머 · 🏆 모둠 점수 · 🚦 소음)
   🧭 생활지도  🗣️ 상담  📄 결석신고서  ✉️ 학부모 문자  🏅 가산점  🎓 진학 추천  📑 생기부 도우미  📎 파일 합치기
   📅 학교 업무판  📝 내 할 일  ☁️ 동기화(보관함)  🏫 교실 기기  🏷️ 학교·선생님 설정  💾 백업  🖼️ 그림 저장  🔒 개인정보 보호 안내  📖 지금 차시
   🗃️ 문장 은행  🧾 기록 마감 점검표  🗂️ 상담 카드  🖨 인쇄
   📊 수행평가  📦 제출물 체크  🧹 1인 1역·당번  🪑 자리 바꾸기
   📆 연간 업무  🤖 AI·문서 도우미 (📃 학습지·문항 📏 채점 기준 📨 가정통신문 🏛️ 공문 🗒️ 회의록 💬 민원 답변 ✒️ 세특 다듬기 ✨ 자유 요청 🗄️ 보관함) */
var TT_CATS = [
  {id:"teach", icon:"📚", name:"교과지도",   desc:"시간표 · 수업 기록 · 수업 도구 · 모둠 · 수행평가"},
  {id:"life",  icon:"🌱", name:"생활지도",   desc:"학급 명렬표 · 출결·결석계 · 학부모 문자 · 제출물 · 1인 1역"},
  {id:"care",  icon:"🤝", name:"상담·생기부", desc:"상담 · 생기부 도우미 · 진학(가산점)"},
  {id:"work",  icon:"💼", name:"업무",       desc:"연간 업무·학사일정 · AI·문서 도우미 · 파일 합치기"},
  {id:"math",  icon:"🧮", name:"수학",       desc:"수학 꾸러미 (9단계) — 다른 교과도 참고해 만들 수 있어요", soon:["🔢 문항 생성기·학습지","✅ 형성평가 빠른 채점","🔁 보충 루프","🧾 이원목적분류표","📅 진도·시수 계산","📈 그래프·📐 도형","📉 통계 실험","🏁 모둠 퀴즈","📚 고교 대비 자료실"]}
];
var TT_TOOLS = [
  {id:"timetable",icon:"🕘", cat:"teach", short:"내 시간표", name:"내 시간표", desc:"컴시간알리미 시간표를 붙여 넣으면 오늘 수업·수업 기록장에 자동으로 쓰입니다.", href:"apps/timetable/", ready:true, room:true},
  {id:"journal",icon:"📒", cat:"teach", short:"수업 기록장", name:"수업 기록장", desc:"수업 진도와 학생 활동을 반별로 기록합니다.", href:"apps/journal/", ready:true, room:true},
  {id:"class",  icon:"🧰", cat:"teach", short:"수업 도구", name:"수업 도구", desc:"칠판(모눈·좌표평면) · 뽑기 · 타이머 · 모둠 점수 · 소음 신호등.", href:"apps/class/", ready:true, room:true},
  {id:"group",  icon:"🧩", cat:"teach", short:"모둠 편성", name:"모둠 편성", desc:"조건에 맞게 모둠과 좌석을 편성합니다.", href:"apps/group/", ready:true, room:true},
  {id:"assess", icon:"📊", cat:"teach", short:"수행평가", name:"수행평가", desc:"채점 기준(점수형·수준형)을 만들고 반마다 채점, 관찰은 교과 세특 기록으로.", href:"apps/assess/", ready:true},
  {id:"roster", icon:"👥", cat:"life",  short:"명렬표", name:"학급 명렬표", desc:"나이스 명단 · 학생 사진과 메모 · 학생 카드(상담 카드).", href:"apps/roster/", ready:true, room:true},
  {id:"photo",  icon:"📷", cat:"life",  short:"사진 이름", in:"roster", name:"나이스 사진 이름", desc:"반 사진을 명렬표 순서대로 이름(번호)로 바꾸고 용량도 줄입니다.", href:"apps/photo/", ready:true, home:true},
  {id:"tardy",  icon:"🧭", cat:"life",  short:"출결", name:"출결·결석계", desc:"무단지각 확인, 결석 사유와 결석신고서(한글 파일·인쇄).", href:"apps/tardy/", ready:true, home:true},
  {id:"parent", icon:"✉️", cat:"life",  short:"학부모 문자", name:"학부모 문자", desc:"상황별 학부모 안내 문자를 빠르게 만듭니다.", href:"apps/parent/", ready:true},
  {id:"submit", icon:"📦", cat:"life",  short:"제출물", name:"제출물 체크", desc:"동의서·회신·신청서를 학생별로 체크하고 미제출자만 모아 봅니다.", href:"apps/submit/", ready:true},
  {id:"duty",   icon:"🧹", cat:"life",  short:"1인 1역", name:"1인 1역·당번", desc:"역할을 정하면 주마다 학생이 자동으로 돌아갑니다. 전자칠판에 띄워 씁니다.", href:"apps/duty/", ready:true, room:true, home:true},
  {id:"counsel",icon:"🗣️", cat:"care",  short:"상담", name:"상담", desc:"상담일지 · 후속 확인 · 행동특성 참고.", href:"apps/tardy/?tab=counsel", ready:true, home:true},
  {id:"record", icon:"📑", cat:"care",  short:"생기부", name:"생기부 도우미", desc:"모인 학생 기록을 영역별로 보며 초안 쓰기 · 나이스 글자 수 · 유의 낱말 점검.", href:"apps/record/", ready:true},
  {id:"advisor",icon:"🎓", cat:"care",  short:"진학", name:"진학", desc:"성적 분석 · 지원 가능 고교 살펴보기 · 가산점 자동 입력.", href:"apps/advisor/", ready:true, home:true},
  {id:"bonus",  icon:"🏅", cat:"care",  short:"가산점", in:"advisor", name:"가산점 자동 입력", desc:"수상경력·창체 파일을 올리면 가산점 양식을 자동으로 채웁니다.", href:"apps/bonus/", ready:true, home:true},
  {id:"year",   icon:"📆", cat:"work",  short:"연간 업무", name:"연간 업무", desc:"해마다 돌아오는 일 · 학사일정 붙여 넣기 → 첫 화면 달력.", href:"apps/year/", ready:true},
  {id:"ai",     icon:"🤖", cat:"work",  short:"AI·문서", name:"AI·문서 도우미", desc:"개인정보를 가린 AI 요청문, 가정통신문·공문 틀, 보관함.", href:"apps/ai/", ready:true},
  {id:"merge",  icon:"📎", cat:"work",  short:"파일 합치기", name:"파일 합치기", desc:"한글·엑셀 파일 여러 개를 하나로 합치는 윈도우 프로그램을 내려받습니다.", file:"downloads/FileMerge.exe", ready:true}
];
