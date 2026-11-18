/* 쌤 노트 · 교과 팩: 국어 (PLAN_국어.md) — subjects/math.js 와 같은 모양입니다.
   - units : 학년별 영역 (교과서마다 단원 이름이 달라 영역으로 적음. 교과서 띄우기 ⚙ 쪽-단원표에서 고쳐 씀)
   - links : 누구나 쓰는 공개 사이트만
   - tools : 국어 전용 도구 (apps/<id>/). id·href 는 바꾸지 않습니다.
   이 파일은 공개 저장소에 올라가므로 학생·교사 이름 같은 개인정보를 적지 않습니다. */
(function(){
  if(typeof ttAddPack !== "function") return;
  var AREA = ["듣기·말하기", "읽기", "쓰기", "문법", "문학", "매체"];
  ttAddPack({
    id: "korean", name: "국어", icon: "📖",
    units: {1: AREA.slice(), 2: AREA.slice(), 3: AREA.slice()},
    links: [
      {n: "표준국어대사전", u: "https://stdict.korean.go.kr"},
      {n: "EBS 중학", u: "https://mid.ebs.co.kr"},
      {n: "에듀넷·티-클리어", u: "https://www.edunet.net"}
    ],
    tools: [
      {id:"kreadt", icon:"🧑‍🏫", short:"국어 근육 교사용", name:"국어 근육 · 교사용", desc:"학생 주소 QR(인쇄용 16개) · 🖥️ 교실 화면 함께 읽기(큰 글씨·시간 재기·가리고 문제·정답 공개·구조도 하나씩 열기) · 📥 학생 결과 코드(번호+점수만) 모아 보기·CSV.", href:"apps/kread/teach.html", room:true}
    ]
  });
})();
