/* 쌤 노트 · 📘 쌤 노트 안내 목록 (PLAN_배포, v2.62.0)
   설명서·소개 발표·소개 영상은 저장소 apps/guide/ 에 함께 들어 있어 어느 학교든 설치하자마자 씁니다(학교 드라이브 필요 없음).
   쓰는 곳: 안내 모음(apps/guide/) · 자료실 왼쪽 '📘 쌤 노트 안내' · 설정 → 도움말.
   ready:false 는 아직 만드는 중(PLAN_배포 단계) — 목록에 '준비 중'으로 보입니다. */
var TT_GUIDES = [
  {id: "teacher", ic: "📗", who: "선생님", kind: "설명서", t: "선생님용 사용 설명서", d: "출근부터 퇴근까지, 보면 바로 쓰는 쌤 노트", href: "apps/guide/teacher.html", ready: true, kw: "매뉴얼 사용법 설명서 도움말 쓰는 법"},
  {id: "student", ic: "📒", who: "학생", kind: "설명서", t: "학생용 안내", d: "공부 Gym · 수학 놀이터 휴대폰으로 시작하기", href: "apps/guide/student.html", ready: true, kw: "학생 공부 gym 짐 안내"},
  {id: "admin", ic: "📕", who: "관리자", kind: "설명서", t: "관리자·담당자 설명서", d: "새 학교 세팅 · 학교 금고 · 교직원 · 의견함", href: "apps/guide/admin.html", ready: true, kw: "관리자 담당자 세팅 설치 배포 금고"},
  {id: "show-t", ic: "🎤", who: "선생님", kind: "소개 발표", t: "쌤 노트 소개 발표", d: "14장 · 연수·협의회에서 견본 화면을 띄워 소개", href: "apps/guide/intro-teacher.html", ready: true, kw: "ppt 발표 소개 연수 슬라이드"},
  {id: "show-s", ic: "🎤", who: "학생", kind: "소개 발표", t: "공부 Gym 소개 발표", d: "7장 · 학급·조회 시간에 공부 Gym 소개 + QR", href: "apps/guide/intro-student.html", ready: true, kw: "ppt 발표 소개 학생 공부 gym"},
  {id: "film-t", ic: "🎬", who: "선생님", kind: "소개 영상", t: "선생님용 소개 영상", d: "45초 · 쌤 노트로 보내는 하루", href: "apps/guide/media/teacher.mp4", ready: true, kw: "영상 숏츠 릴스 광고 소개 mp4"},
  {id: "film-s", ic: "🎬", who: "학생", kind: "소개 영상", t: "학생용 소개 영상", d: "25초 · 공부 Gym 레벨 업", href: "apps/guide/media/student.mp4", ready: true, kw: "영상 숏츠 릴스 광고 학생 mp4"},
  {id: "try", ic: "🎮", who: "누구나", kind: "체험", t: "견본으로 먼저 써 보기", d: "가짜 학교 자료로 모든 화면을 눌러 보기 (내 자료는 그대로)", href: "index.html?demo=1", ready: true, kw: "견본 체험 데모 미리 써 보기"}
];
