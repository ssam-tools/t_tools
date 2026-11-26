/* 공부 Gym — PT실 6개와 문항 자료 (PLAN_공부Gym)
   이 파일(과 앞으로 붙을 과목별 파일)만 늘리면 프로그램(index.html)은 그대로 씁니다.
   · 1단계: 공통 틀이 돌아가는지 보는 '견본 문항'입니다. 과목별 진짜 자료는 3~8단계에서 채웁니다.
   · 국어는 국어 근육(apps/kread/data.js)의 어휘를 그대로 빌려 씁니다.
   · id 는 바꾸지 않습니다(학생 기기의 복습 상자가 id 로 연결됨). 새 문항은 끝에 덧붙입니다.

   PT실 {name, vocab(어휘 줄, vocabDaily 하루 신규), passages(지문 속독), poolGroups(지문 문항으로 쌓아 판정하는 근섬유 묶음), setNames, deep(한 문제 깊게), intake(입소 진단), genRatio(오늘 단원에서 생성 문항 비율), set2(두 번째 세트 이름), unitOf(유형 → 마스터 맵 근섬유 id), genTags(생성기가 만드는 유형), part(근육), emo, col(색), bank:[문항], gen(lv, tag) → 문항, mix(만든 문항 비율 0~1), srsNew(새 문항을 맞혀도 복습 상자에 넣을지)}
   문항 {id, tag(유형), q(문제, [ ] 안은 밑줄), ask(작은 물음), c:[보기], a(정답 번호), e(해설 한 줄)}
        또는 숫자 입력 {id, tag, q, n(정답 수), e}
   보기 순서는 화면에서 섞습니다(OX는 그대로). */
var GYM_ROOMS = (function(){
  "use strict";
  function shuffle(a){ a = a.slice(); for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function rnd(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
  /* 낱말 목록 → '문장 속 뜻 고르기' 문항 (오답 보기는 다른 낱말의 뜻에서) */
  function vocab(pre, tag, list, ask){
    return list.map(function(v, i){
      return {id: pre + v.w, tag: v.t || tag, u: v.u, q: v.ex, ask: ask || "밑줄 친 말의 뜻으로 알맞은 것은?",
        mk: function(){ var others = shuffle(list.filter(function(x){ return x.m !== v.m; })).slice(0, 3).map(function(x){ return x.m; }); return {c: [v.m].concat(others), a: 0}; },
        e: v.w + (v.h ? "(" + v.h + ")" : "") + ": " + v.m};
    });
  }

  /* 🔥 준비운동 — 학습 도구어 (전 과목에 쓰이는 공부 언어) · 견본 */
  var TOOLW = [
    {w: "비교", m: "둘 이상을 견주어 같은 점과 다른 점을 살핌", ex: "두 실험 결과를 [비교]하니 온도가 높을수록 빨리 녹았다."},
    {w: "대조", m: "서로 다른 점을 맞대어 드러냄", ex: "글쓴이는 도시와 농촌의 생활을 [대조]하여 차이를 강조했다."},
    {w: "인과", m: "원인과 결과의 관계", ex: "이 문단은 기온 상승과 해수면 상승의 [인과]를 설명한다."},
    {w: "추론", m: "아는 것을 바탕으로 모르는 것을 미루어 생각함", ex: "그래프의 흐름으로 내년 인구를 [추론]해 보자."},
    {w: "전제", m: "어떤 결론에 앞서 먼저 내세우는 조건", ex: "모든 사람이 합리적이라는 [전제]가 틀리면 결론도 흔들린다."},
    {w: "가설", m: "실험으로 확인하기 전에 임시로 세운 설명", ex: "빛이 많을수록 식물이 잘 자란다는 [가설]을 세웠다."},
    {w: "변인", m: "실험 결과에 영향을 주는 요인", ex: "물의 양을 같게 한 것은 다른 [변인]을 통제하기 위해서다."},
    {w: "비율", m: "기준량에 대한 비교하는 양의 크기", ex: "전체 학생 중 안경 쓴 학생의 [비율]은 40%이다."},
    {w: "경향", m: "현상이나 행동이 한쪽으로 기울어지는 흐름", ex: "기온이 오를수록 아이스크림 판매가 늘어나는 [경향]이 있다."},
    {w: "상관", m: "한쪽이 변할 때 다른 쪽도 함께 변하는 관계", ex: "키와 몸무게 사이에는 양의 [상관]관계가 있다."},
    {w: "근거", m: "주장이나 판단을 뒷받침하는 까닭", ex: "주장만 말하지 말고 통계 자료를 [근거]로 들어라."},
    {w: "요약", m: "중요한 내용만 간추림", ex: "각 문단을 한 문장으로 [요약]하면 글의 구조가 보인다."},
    {w: "함수", m: "한 값이 정해지면 다른 값이 하나로 정해지는 관계", ex: "시간에 따라 거리가 하나씩 정해지므로 거리는 시간의 [함수]이다."},
    {w: "관점", m: "사물이나 현상을 바라보는 입장", ex: "같은 사건도 기자의 [관점]에 따라 다르게 쓰인다."}
  ];

  /* 📖 국어 — 국어 근육 어휘(KR_DATA.words) 빌려 쓰기 */
  var KW = (typeof KR_DATA !== "undefined" && KR_DATA.words) ? KR_DATA.words.map(function(w){ return {w: w.w, h: w.h, m: w.m, ex: w.ex}; }) : [
    {w: "형성", h: "形成", m: "어떤 모양이나 상태를 이룸", ex: "어릴 때 좋은 생활 습관을 [형성]해야 한다."},
    {w: "수용", h: "受容", m: "어떤 것을 받아들임", ex: "선생님은 학생들의 건의를 너그럽게 [수용]하셨다."},
    {w: "기인", h: "起因", m: "어떤 일이 일어나는 까닭이 됨", ex: "이번 사고는 운전자의 부주의에 [기인]한다."},
    {w: "지속", h: "持續", m: "어떤 상태가 오래 계속됨", ex: "운동 효과를 보려면 꾸준히 [지속]해야 한다."}
  ];

  /* 🔤 영어 — 중학 필수 어휘 · 견본 */
  var EW = [
    {w: "improve", m: "향상시키다, 나아지다", ex: "Reading every day will [improve] your English."},
    {w: "decide", m: "결정하다", ex: "We need to [decide] where to go this weekend."},
    {w: "explain", m: "설명하다", ex: "Can you [explain] how this machine works?"},
    {w: "protect", m: "보호하다", ex: "Trees [protect] the soil from heavy rain."},
    {w: "prepare", m: "준비하다", ex: "She stayed up late to [prepare] for the test."},
    {w: "borrow", m: "빌리다", ex: "May I [borrow] your pen for a minute?"},
    {w: "share", m: "나누다, 공유하다", ex: "Let's [share] our ideas with the class."},
    {w: "reduce", m: "줄이다", ex: "We should [reduce] the amount of plastic we use."},
    {w: "create", m: "만들어 내다, 창조하다", ex: "The students [create] a short movie every year."},
    {w: "allow", m: "허락하다", ex: "My parents [allow] me to use the phone after dinner."},
    {w: "avoid", m: "피하다", ex: "Try to [avoid] eating too much sugar."},
    {w: "remain", m: "남아 있다, 계속 ~이다", ex: "Please [remain] seated until the bus stops."},
    {w: "achieve", m: "이루다, 달성하다", ex: "Hard work helped him [achieve] his goal."},
    {w: "compare", m: "비교하다", ex: "[Compare] the two pictures and find the differences."}
  ];

  /* 🌏 통합사회 — 개념어 · 견본 */
  var SW = [
    {w: "희소성", u: "o.market", m: "원하는 것에 비해 자원이 부족한 상태", ex: "자원의 [희소성] 때문에 우리는 늘 선택을 해야 한다.", t: "시장 경제"},
    {w: "기회비용", u: "o.market", m: "어떤 것을 고를 때 포기한 것 중 가장 큰 가치", ex: "공부 대신 게임을 했다면 공부의 가치가 [기회비용]이다.", t: "시장 경제"},
    {w: "수요", u: "o.market", m: "물건을 사려고 하는 욕구와 양", ex: "더운 날씨로 선풍기 [수요]가 크게 늘었다.", t: "시장 경제"},
    {w: "공급", u: "o.market", m: "물건을 팔려고 시장에 내놓는 양", ex: "배추 농사가 잘되어 시장에 [공급]이 넘쳤다.", t: "시장 경제"},
    {w: "문화 상대주의", u: "o.culture", m: "각 문화를 그 사회의 맥락에서 이해하려는 태도", ex: "다른 나라 음식 문화를 [문화 상대주의]로 바라보자.", t: "문화"},
    {w: "인권", u: "o.right", m: "사람이라면 누구나 누려야 할 기본 권리", ex: "[인권]은 성별이나 국적과 상관없이 보장되어야 한다.", t: "인권"},
    {w: "기본권", u: "o.right", m: "헌법이 보장하는 국민의 기본적인 권리", ex: "표현의 자유는 헌법이 보장하는 [기본권]이다.", t: "인권"},
    {w: "삼권 분립", u: "o.state", m: "입법·행정·사법의 권력을 나누어 서로 견제하게 함", ex: "[삼권 분립]은 권력이 한곳에 몰리는 것을 막는다.", t: "정치"},
    {w: "도시화", u: "o.city", m: "도시에 사는 인구 비율이 높아지는 현상", ex: "산업이 발달하면서 [도시화]가 빠르게 진행되었다.", t: "지리"},
    {w: "지속 가능한 발전", u: "o.sustain", m: "미래 세대의 필요를 해치지 않으면서 지금의 필요를 채우는 발전", ex: "재생 에너지는 [지속 가능한 발전]을 위한 선택이다.", t: "지리"},
    {w: "정의", u: "o.justice", m: "사회 구성원 각자가 마땅히 받아야 할 몫을 받는 올바른 상태", ex: "공정한 규칙은 사회 [정의]를 세우는 바탕이다.", t: "윤리"},
    {w: "세계화", u: "o.world", m: "세계가 하나로 이어져 서로 영향을 주고받는 현상", ex: "[세계화]로 다른 나라 상품을 쉽게 살 수 있게 되었다.", t: "국제 사회"}
  ];

  /* 🔬 통합과학 — 개념 OX · 견본 */
  var SCI = [
    {id: "sci:ox1", tag: "힘", q: "물체에 작용하는 알짜힘이 0이면 물체는 반드시 멈춰 있다.", a: 1, e: "알짜힘이 0이면 멈춰 있거나 같은 속력으로 계속 움직여요(관성)."},
    {id: "sci:ox2", tag: "빛과 파동", q: "빛의 삼원색을 모두 합치면 흰색이 된다.", a: 0, e: "빨강·초록·파랑 빛을 모두 합치면 흰색으로 보여요."},
    {id: "sci:ox3", tag: "전기", q: "직렬연결된 전구는 하나를 빼면 나머지도 꺼진다.", a: 0, e: "직렬연결은 길이 하나라 한 곳이 끊기면 전류가 흐르지 않아요."},
    {id: "sci:ox4", tag: "물질의 상태", q: "물이 얼음이 될 때 주위의 열을 흡수한다.", a: 1, e: "응고할 때는 열을 내놓아요(방출)."},
    {id: "sci:ox5", tag: "기체", q: "온도가 일정할 때 기체의 압력을 높이면 부피는 줄어든다.", a: 0, e: "보일 법칙: 압력과 부피는 반비례해요."},
    {id: "sci:ox6", tag: "물질의 구성", q: "원자는 원자핵과 전자로 이루어져 있다.", a: 0, e: "원자 = (+)원자핵 + (−)전자."},
    {id: "sci:ox7", tag: "식물과 에너지", q: "광합성은 빛이 없는 밤에 가장 활발하다.", a: 1, e: "광합성은 빛 에너지가 필요해서 낮에 일어나요."},
    {id: "sci:ox8", tag: "자극과 반응", q: "뜨거운 물체에 손이 닿아 손을 떼는 것은 척수가 중추인 반사이다.", a: 0, e: "무조건 반사는 대뇌를 거치지 않고 척수 등이 중추예요."},
    {id: "sci:ox9", tag: "생식과 유전", q: "체세포 분열을 하면 염색체 수가 절반으로 줄어든다.", a: 1, e: "절반으로 줄어드는 것은 생식세포 분열(감수 분열)이에요."},
    {id: "sci:ox10", tag: "기권과 날씨", q: "공기가 상승하면 단열 팽창하여 기온이 내려간다.", a: 0, e: "올라가면 기압이 낮아져 팽창 → 기온이 내려가 구름이 생겨요."},
    {id: "sci:ox11", tag: "태양계", q: "달의 위상이 바뀌는 까닭은 지구의 그림자 때문이다.", a: 1, e: "위상 변화는 달이 지구 둘레를 돌며 햇빛 받는 면이 달리 보이기 때문이에요."},
    {id: "sci:ox12", tag: "에너지", q: "롤러코스터가 내려올 때 위치 에너지가 운동 에너지로 바뀐다.", a: 0, e: "높이가 줄며 위치 에너지 → 운동 에너지로 전환돼요."}
  ].map(function(x){ x.c = ["O", "X"]; x.ox = true; return x; });

  /* 🧮 계산 만들기 (수학·과학 공식) — 1단계 견본 생성기. 3단계(수학)·7단계(과학)에서 늘립니다. */
  function sgn(n){ return n < 0 ? "(" + n + ")" : String(n); }
  var MGEN = {
    "정수 덧셈·뺄셈": function(R){ var a = rnd(-R, R), b = rnd(-R, R), p = Math.random() < .5; return {q: sgn(a) + (p ? " + " : " − ") + sgn(b), n: p ? a + b : a - b, e: "부호가 같으면 더하고, 다르면 큰 수에서 작은 수를 빼요."}; },
    "정수 곱셈": function(R){ var a = rnd(-12, 12) || 3, b = rnd(-9, 9) || -4; return {q: sgn(a) + " × " + sgn(b), n: a * b, e: "음수가 짝수 개면 +, 홀수 개면 −."}; },
    "일차방정식": function(R){ var x = rnd(-9, 9), a = rnd(2, 6) * (Math.random() < .3 ? -1 : 1), b = rnd(-R, R); return {q: a + "x " + (b < 0 ? "− " + (-b) : "+ " + b) + " = " + (a * x + b) + "   x = ?", n: x, e: "상수항을 넘기고(이항) x의 계수로 나눠요."}; },
    "제곱근": function(R){ var k = rnd(2, R > 12 ? 15 : 12); return {q: "√" + (k * k), n: k, e: k + " × " + k + " = " + (k * k)}; },
    "지수법칙": function(R){
      var b = [2, 3, 5, 10][rnd(0, 3)];
      if(Math.random() < .6){ var m = rnd(2, 7), n = rnd(2, 7); return {q: b + "^" + m + " × " + b + "^" + n + " = " + b + "^□", n: m + n, e: "밑이 같은 거듭제곱의 곱 → 지수끼리 더해요."}; }
      var p = rnd(4, 9), k = rnd(1, p - 1); return {q: b + "^" + p + " ÷ " + b + "^" + k + " = " + b + "^□", n: p - k, e: "밑이 같은 거듭제곱의 나눗셈 → 지수끼리 빼요."};
    }
  };
  function mathGen(lv, tag){
    var keys = Object.keys(MGEN), k = MGEN[tag] ? tag : keys[rnd(0, keys.length - 1)];
    var R = Math.max(6, 6 + 4 * (lv == null ? 1 : lv)), o = MGEN[k](R);
    o.id = "math:g:" + k + ":" + o.q; o.tag = k; o.num = true;
    return o;
  }
  function sciGen(lv, tag){
    var t = rnd(2, 6), v = rnd(2, 9) * (lv > 2 ? 3 : 1), o;
    if(tag === "밀도" || (tag !== "속력" && Math.random() < .4)){ var d = rnd(2, 9), V = rnd(2, 8) * 5; o = {tag: "밀도", q: "질량 " + d * V + "g, 부피 " + V + "cm³인 물체의 밀도는? (g/cm³)", n: d, e: "밀도 = 질량 ÷ 부피"}; }
    else o = {tag: "속력", q: v * t + "m를 " + t + "초 동안 갔을 때 평균 속력은? (m/s)", n: v, e: "속력 = 이동 거리 ÷ 걸린 시간"};
    o.id = "sci:g:" + o.q; o.num = true; return o;
  }

  var SCIU = {"힘": "s.force", "빛과 파동": "s.light", "전기": "s.elec", "물질의 상태": "s.state", "기체": "s.gas", "물질의 구성": "s.matter", "식물과 에너지": "s.plant",
    "자극과 반응": "s.resp", "생식과 유전": "s.gene", "기권과 날씨": "s.air", "태양계": "s.solar", "에너지": "s.energy", "속력": "s.motion", "밀도": "s.prop"};
  return {
    order: ["warm", "kor", "math", "eng", "sci", "soc"].concat(typeof GYM_HIS !== "undefined" ? ["his"] : []),
    warm: typeof GYM_WARM !== "undefined"   // 6단계: 학습 도구어는 warm.js
      ? {name: "준비운동", part: "공부 체력", emo: "🔥", col: "#FF7A45", bank: [], vocab: GYM_WARM.vocab, vocabDaily: 999, srsNew: true}
      : {name: "준비운동", part: "공부 체력", emo: "🔥", col: "#FF7A45", bank: vocab("warm:", "학습 도구어", TOOLW, "밑줄 친 말의 뜻은?"), srsNew: true},
    kor: typeof GYM_KOR !== "undefined"   // 4단계: 국어 PT 자료는 kor.js (국어 근육 어휘·지문 이식 + 문법·문학 카드)
      ? {name: "국어", part: "팔", emo: "📖", col: "#E5484D", bank: GYM_KOR.cards.concat(GYM_KOR.pitems), vocab: GYM_KOR.vocab, vocabDaily: 6, passages: true,
         poolGroups: ["독서"], srsNew: true, intake: true, setNames: ["어휘 + 복습", "지문 속독"], set2: "문법·문학 카드"}
      : {name: "국어", part: "팔", emo: "📖", col: "#E5484D", bank: vocab("kor:", "어휘", KW), srsNew: true, shuffleBank: true},
    math: typeof GYM_MATH !== "undefined"   // 3단계: 수학 PT 자료는 math.js
      ? {name: "수학", part: "복근", emo: "🧮", col: "#7C5CFF", gen: GYM_MATH.gen, genTags: GYM_MATH.genTags, unitOf: GYM_MATH.unitOf, bank: GYM_MATH.concept, deep: GYM_MATH.deep,
         mix: .8, genRatio: .8, srsNew: true, intake: true, set2: "계산 반사 + 개념 연결"}
      : {name: "수학", part: "복근", emo: "🧮", col: "#7C5CFF", gen: mathGen, mix: 1, genTags: Object.keys(MGEN),
      unitOf: {"정수 덧셈·뺄셈": "m.int", "정수 곱셈": "m.int", "일차방정식": "m.lin", "제곱근": "m.root", "지수법칙": "m.expr"}},
    eng: typeof GYM_ENG !== "undefined"   // 5단계: 영어 PT 자료는 eng.js (단어 3단계 · 구문 끊어 읽기·동사 찾기·어법 · 듣기)
      ? {name: "영어", part: "다리", emo: "🔤", col: "#1F9D55", bank: GYM_ENG.gram.concat(GYM_ENG.ritems || []), vocab: GYM_ENG.vocab, vocabDaily: 10, listen: GYM_ENG.listen, dsets: GYM_ENG.D ? GYM_ENG : null,
         srsNew: true, intake: true, setNames: ["단어 + 복습", "구문 끊어 읽기"], set2: "끊어 읽기·동사 찾기·어법"}
      : {name: "영어", part: "다리", emo: "🔤", col: "#1F9D55", bank: vocab("eng:", "단어", EW, "밑줄 친 단어의 뜻은?"), srsNew: true},
    sci: typeof GYM_SCI !== "undefined"   // 7단계: 통합과학 PT 자료는 sci.js (개념 OX · 공식 생성기 · 자료 해석 세트)
      ? {name: "통합과학", part: "어깨", emo: "🔬", col: "#2F80ED", bank: SCI.concat(GYM_SCI.ox, GYM_SCI.ditems), gen: GYM_SCI.gen, genTags: GYM_SCI.genTags, mix: .35, genRatio: .4,
         unitOf: Object.assign({}, SCIU, GYM_SCI.unitOf), srsNew: true, intake: true, dsets: GYM_SCI, setNames: ["개념 OX + 공식", "자료 해석"]}
      : {name: "통합과학", part: "어깨", emo: "🔬", col: "#2F80ED", bank: SCI, gen: sciGen, mix: .35, srsNew: true, genTags: ["속력", "밀도"], unitOf: SCIU},
    soc: typeof GYM_SOC !== "undefined"   // 8단계: 통합사회 PT 자료는 soc.js (개념어 · 자료 해석 · 관점 비교)
      ? {name: "통합사회", part: "가슴", emo: "🌏", col: "#E05BA8", bank: vocab("soc:", "개념어", SW, "밑줄 친 말의 뜻으로 알맞은 것은?").concat(GYM_SOC.words, GYM_SOC.ditems),
         srsNew: true, intake: true, dsets: GYM_SOC, setNames: ["개념어", "자료 해석 + 관점 비교"]}
      : {name: "통합사회", part: "가슴", emo: "🌏", col: "#E05BA8", bank: vocab("soc:", "개념어", SW, "밑줄 친 말의 뜻으로 알맞은 것은?"), srsNew: true},
    his: typeof GYM_HIS !== "undefined"   // 22단계(3부): 한국사 PT 자료는 his.js (사실 카드 → 사료형·이름 찾기·OX + 순서 배열·〈보기〉 생성)
      ? {name: "한국사", part: "등", emo: "📜", col: "#A0612B", bank: GYM_HIS.bank, gen: GYM_HIS.gen, genTags: GYM_HIS.genTags, unitOf: GYM_HIS.unitOf, mix: .25, genRatio: .3,
         srsNew: true, intake: true, setNames: ["복습 + 오늘 시대", "사료형 · 순서 · 〈보기〉"]}
      : null
  };
})();
