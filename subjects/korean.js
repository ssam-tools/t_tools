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
      {id:"kread", icon:"📖", short:"국어 근육", name:"국어 근육 (읽기·어휘)", desc:"학생이 휴대폰으로 혼자 하는 하루 10분 훈련 — 비문학 지문 빨리·정확히 읽기(유효 속도) + 문학(시·소설) 표현·인물 관계 + 수능 어휘(한자 묶음·간격 반복). 기록은 학생 기기에만. ⓘ에서 학생에게 줄 주소 복사.", href:"apps/kread/", room:true}
    ]
  });
})();
