/* 도구 목록 · 첫 화면과 오프라인 저장이 이 목록을 함께 씁니다.
   새 도구를 넣을 때: apps/<이름>/index.html 을 만들고 아래에 한 줄 추가합니다.
   scope: "home" = 담임용, "all" = 담임·교과 공통.  ready: 완성되면 true.
   short: 도구 화면 왼쪽 이동 메뉴에 쓰는 짧은 이름.  room: 교실 기기(전자칠판)에서도 쓰는 수업용 도구.
   href 대신 file 을 적으면 웹 도구가 아니라 내려받는 PC 프로그램입니다(downloads 폴더).
   in: 묶음. 첫 화면에는 묶음의 대표 카드만 나오고, 묶인 도구는 그 카드 안 작은 단추와 왼쪽 메뉴의 하위 항목으로 나옵니다.
   card: 첫 화면 카드에 쓰는 묶음 이름(없으면 name). sub: 묶음 안에서 쓰는 짧은 이름. */
/* 아이콘 표 — 기능마다 하나씩, 같은 기능은 어느 화면에서나 같은 아이콘을 씁니다. 새 기능은 겹치지 않게 골라 여기에 적으세요.
   🍎 쌤 노트(첫 화면)  👥 학급 명렬표  📷 사진 이름  📇 학생 카드  ✍️ 학생 기록  🕘 내 시간표
   📚 수업(묶음)  📒 수업 기록장  🧩 모둠 편성  🧰 수업 도구 (🖍️ 칠판 · 🎲 뽑기 · ⏱️ 타이머 · 🏆 모둠 점수 · 🚦 소음)
   🧭 생활지도  🗣️ 상담  📄 결석신고서  ✉️ 학부모 문자  🏅 가산점  🎓 진학 추천  📑 생기부 도우미  📎 파일 합치기
   📅 학교 업무판  📝 내 할 일  ☁️ 동기화(보관함)  🏫 교실 기기  🏷️ 학교·선생님 설정  💾 백업  🖼️ 그림 저장  🔒 개인정보 보호 안내  📖 지금 차시
   🗃️ 문장 은행  🧾 기록 마감 점검표  🗂️ 상담 카드  🖨 인쇄
   🎒 학급(묶음)  📊 수행평가  📦 제출물 체크  🧹 1인 1역·당번  🪑 자리 바꾸기
   💼 업무(묶음)  📆 연간 업무  🤖 AI·문서 도우미 (📃 학습지·문항 📏 채점 기준 📨 가정통신문 🏛️ 공문 🗒️ 회의록 💬 민원 답변 ✒️ 세특 다듬기 ✨ 자유 요청 🗄️ 보관함) */
var TT_TOOLS = [
  {id:"roster", icon:"👥", gicon:"🎒", short:"학급", sub:"명렬표", card:"학급", name:"학급 명렬표",     desc:"명렬표(사진·메모·학생 카드) · 제출물 체크 · 1인 1역·당번.",           scope:"all",  href:"apps/roster/", ready:true, room:true},
  {id:"photo",  icon:"📷", short:"사진 이름", sub:"사진 이름", in:"roster", name:"나이스 사진 이름", desc:"반 사진을 명렬표 순서대로 이름(번호)로 바꾸고 용량도 줄입니다.",                       scope:"home", href:"apps/photo/",  ready:true},
  {id:"submit", icon:"📦", short:"제출물", sub:"제출물 체크", in:"roster", name:"제출물 체크", desc:"동의서·회신·신청서를 학생별로 체크하고 미제출자만 모아 봅니다.", scope:"home", href:"apps/submit/", ready:true},
  {id:"duty",   icon:"🧹", short:"1인 1역", sub:"1인 1역·당번", in:"roster", name:"1인 1역·당번", desc:"역할을 정하면 주마다 학생이 자동으로 돌아갑니다. 전자칠판에 띄워 씁니다.", scope:"home", href:"apps/duty/", ready:true, room:true},
  {id:"timetable",icon:"🕘", short:"내 시간표", name:"내 시간표",     desc:"컴시간알리미 시간표를 붙여 넣으면 첫 화면 오늘 수업·수업 기록장에 자동으로 쓰입니다.", scope:"all", href:"apps/timetable/", ready:true, room:true},
  {id:"journal",icon:"📒", gicon:"📚", short:"수업", sub:"수업 기록장", card:"수업", name:"수업 기록장",     desc:"수업 기록장 · 모둠 편성 · 수업 도구(칠판·뽑기·타이머·모둠 점수·소음)를 한곳에.",                  scope:"all",  href:"apps/journal/", ready:true, room:true},
  {id:"group",  icon:"🧩", short:"모둠 편성", sub:"모둠 편성", in:"journal", name:"모둠 편성",       desc:"조건에 맞게 모둠과 좌석을 편성합니다.",                              scope:"all",  href:"apps/group/",  ready:true, room:true},
  {id:"class",  icon:"🧰", short:"수업 도구", sub:"수업 도구", in:"journal", name:"수업 도구", desc:"칠판(모눈·좌표평면) · 뽑기 · 타이머 · 모둠 점수 · 소음 신호등.",            scope:"all",  href:"apps/class/",  ready:true, room:true},
  {id:"assess", icon:"📊", short:"수행평가", sub:"수행평가", in:"journal", name:"수행평가", desc:"채점 기준(점수형·수준형)을 만들고 반마다 채점, 관찰은 교과 세특 기록으로.", scope:"all", href:"apps/assess/", ready:true},
  {id:"tardy",  icon:"🧭", short:"생활지도", sub:"출결·상담", name:"생활지도(결석계)", desc:"무단지각 확인, 상담일지, 결석 사유와 결석신고서(한글 파일·인쇄), 학부모 문자.", scope:"home", href:"apps/tardy/", ready:true},
  {id:"parent", icon:"✉️", short:"학부모 문자", sub:"학부모 문자", in:"tardy", name:"학부모 문자",     desc:"학부모께 보낼 안내 문자를 빠르게 만듭니다.",                  scope:"home", href:"apps/parent/", ready:true},
  {id:"record", icon:"📑", short:"생기부", name:"생기부 도우미", desc:"모인 학생 기록을 영역별로 보며 초안 쓰기 · 나이스 글자 수 · 유의 낱말 점검.", scope:"all", href:"apps/record/", ready:true},
  {id:"bonus",  icon:"🏅", short:"가산점", name:"가산점 자동 입력", desc:"수상경력·창체 파일을 올리면 가산점 양식을 자동으로 채웁니다.", scope:"home", href:"apps/bonus/",  ready:true},
  {id:"advisor",icon:"🎓", short:"진학 추천", name:"고교 진학 추천",   desc:"성적을 분석해 지원 가능한 고등학교를 살펴봅니다.",             scope:"home", href:"apps/advisor/", ready:true},
  {id:"year",   icon:"📆", gicon:"💼", short:"업무", sub:"연간 업무", card:"업무", name:"연간 업무", desc:"연간 업무 달력(해마다 돌아오는 일 → 첫 화면 달력) · AI·문서 도우미(학습지·채점 기준·가정통신문·공문·회의록·민원).", scope:"all", href:"apps/year/", ready:true},
  {id:"ai",     icon:"🤖", short:"AI·문서", sub:"AI·문서 도우미", in:"year", name:"AI·문서 도우미", desc:"개인정보를 가린 AI 요청문, 가정통신문·공문 틀, 보관함.", scope:"all", href:"apps/ai/", ready:true},
  {id:"merge",  icon:"📎", short:"파일 합치기", name:"파일 합치기",     desc:"한글·엑셀 파일 여러 개를 하나로 합치는 윈도우 프로그램을 내려받습니다.", scope:"all",  file:"downloads/FileMerge.exe", ready:true}
];
