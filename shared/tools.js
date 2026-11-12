/* 도구 목록 · 첫 화면과 오프라인 저장이 이 목록을 함께 씁니다.
   새 도구를 넣을 때: apps/<이름>/index.html 을 만들고 아래에 한 줄 추가합니다.
   scope: "home" = 담임용, "all" = 담임·교과 공통.  ready: 완성되면 true.
   short: 도구 화면 왼쪽 이동 메뉴에 쓰는 짧은 이름.  room: 교실 기기(전자칠판)에서도 쓰는 수업용 도구.
   href 대신 file 을 적으면 웹 도구가 아니라 내려받는 PC 프로그램입니다(downloads 폴더).
   in: 묶음. 첫 화면에는 묶음의 대표 카드만 나오고, 묶인 도구는 그 카드 안 작은 단추와 왼쪽 메뉴의 하위 항목으로 나옵니다.
   card: 첫 화면 카드에 쓰는 묶음 이름(없으면 name). sub: 묶음 안에서 쓰는 짧은 이름. */
var TT_TOOLS = [
  {id:"roster", icon:"👥", short:"명렬표", sub:"명렬표", name:"학급 명렬표",     desc:"나이스 명단 · 학생 사진과 메모 · 학생별 기록을 한곳에서 봅니다.",           scope:"all",  href:"apps/roster/", ready:true, room:true},
  {id:"photo",  icon:"📷", short:"사진 이름", sub:"사진 이름", in:"roster", name:"나이스 사진 이름", desc:"반 사진을 명렬표 순서대로 이름(번호)로 바꾸고 용량도 줄입니다.",                       scope:"home", href:"apps/photo/",  ready:true},
  {id:"timetable",icon:"🗓️", short:"내 시간표", name:"내 시간표",     desc:"컴시간알리미 시간표를 붙여 넣으면 첫 화면 오늘 수업·수업 기록장에 자동으로 쓰입니다.", scope:"all", href:"apps/timetable/", ready:true, room:true},
  {id:"journal",icon:"📒", short:"수업", sub:"수업 기록장", card:"수업", name:"수업 기록장",     desc:"수업 기록장 · 모둠 편성 · 수업 시간 도구(뽑기·타이머 등)를 한곳에.",                  scope:"all",  href:"apps/journal/", ready:true, room:true},
  {id:"group",  icon:"🧩", short:"모둠 편성", sub:"모둠 편성", in:"journal", name:"모둠 편성",       desc:"조건에 맞게 모둠과 좌석을 편성합니다.",                              scope:"all",  href:"apps/group/",  ready:true, room:true},
  {id:"class",  icon:"🎲", short:"수업 도구", sub:"수업 도구", in:"journal", name:"수업 시간 도구함", desc:"발표자 뽑기, 타이머 등 수업 중에 쓰는 도구입니다.",            scope:"all",  href:"apps/class/",  ready:true, room:true},
  {id:"tardy",  icon:"🧭", short:"생활지도", sub:"출결·상담", name:"생활지도(결석계)", desc:"무단지각 확인, 상담일지, 결석 사유와 결석신고서(한글 파일·인쇄), 학부모 문자.", scope:"home", href:"apps/tardy/", ready:true},
  {id:"parent", icon:"✉️", short:"학부모 문자", sub:"학부모 문자", in:"tardy", name:"학부모 문자",     desc:"학부모께 보낼 안내 문자를 빠르게 만듭니다.",                  scope:"home", href:"apps/parent/", ready:true},
  {id:"bonus",  icon:"🏅", short:"가산점", name:"가산점 자동 입력", desc:"수상경력·창체 파일을 올리면 가산점 양식을 자동으로 채웁니다.", scope:"home", href:"apps/bonus/",  ready:true},
  {id:"advisor",icon:"🎓", short:"진학 추천", name:"고교 진학 추천",   desc:"성적을 분석해 지원 가능한 고등학교를 살펴봅니다.",             scope:"home", href:"apps/advisor/", ready:true},
  {id:"merge",  icon:"📎", short:"파일 합치기", name:"파일 합치기",     desc:"한글·엑셀 파일 여러 개를 하나로 합치는 윈도우 프로그램을 내려받습니다.", scope:"all",  file:"downloads/FileMerge.exe", ready:true}
];
