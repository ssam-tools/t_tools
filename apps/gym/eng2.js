/* 공부 Gym — 🔤 영어 PT 보강: 글의 순서 · 문장 삽입 · 요약형 짧은 지문 (PLAN_공부Gym 3부 27단계, v2.43.0)
   26학년도 3월 고1 학평 영어 독해(36~40번 순서·삽입·요약 유형)를 중3 수준 길이로 새로 쓴 지문입니다.
   · 2단계(5~8주) 4편: 글의 순서 (A)(B)(C) + 주제 + 어휘
   · 3단계(9~12주) 4편: 문장 삽입 ①~④ + 요약문 빈칸 (A)(B) + 내용 일치
   eng.js 뒤에 읽혀 GYM_ENG.D · ritems 에 덧붙습니다. 모든 글은 새로 썼습니다. */
(function(){
  "use strict";
  if(typeof GYM_ENG === "undefined" || !GYM_ENG.D) return;
  var RD = [
    {id: "r6", lv: 2, title: "Why Bees Dance",
      p: "Honeybees cannot talk, but they can still share information.\n(A) For example, a round dance means the food is close to the hive, while a waggle dance means it is far away.\n(B) When a bee finds flowers full of nectar, it returns to the hive and starts to dance.\n(C) By watching these movements carefully, other bees learn where to fly and find the food quickly.",
      qs: [["순서", "주어진 첫 문장 다음에 이어질 글의 순서로 알맞은 것은?", ["(B) − (A) − (C)", "(A) − (B) − (C)", "(A) − (C) − (B)", "(C) − (B) − (A)"], "꽃을 찾아 춤을 춘다(B) → 춤의 예(A) → 다른 벌이 보고 배운다(C)"],
           ["주제", "What is the passage mainly about?", ["how bees share information by dancing", "why bees make honey", "the danger of bee stings", "how flowers grow"], "벌의 춤 = 의사소통"],
           ["어휘", "hive 의 뜻은?", ["벌집", "꽃잎", "날개", "들판"], "return to the hive = 벌집으로 돌아가다"]]},
    {id: "r7", lv: 2, title: "The Two-Minute Rule",
      p: "Many people put off small tasks until they pile up.\n(A) If a job takes less than two minutes, such as washing a cup or replying to a message, do it right away.\n(B) To solve this problem, some experts suggest a simple rule.\n(C) Following this rule keeps small tasks from growing into a big, stressful list.",
      qs: [["순서", "주어진 첫 문장 다음에 이어질 글의 순서로 알맞은 것은?", ["(B) − (A) − (C)", "(A) − (C) − (B)", "(C) − (A) − (B)", "(B) − (C) − (A)"], "문제(작은 일을 미룸) → 해결 규칙 제안(B) → 규칙 내용(A) → 효과(C)"],
           ["주제", "What is the best title for the passage?", ["Do Small Tasks Right Away", "Why We Need Big Lists", "How to Wash a Cup", "Messages Can Wait"], "2분 안에 끝나는 일은 바로 하기"],
           ["어휘", "put off 의 뜻은?", ["미루다", "끝내다", "버리다", "켜다"], "put off small tasks = 작은 일을 미루다"]]},
    {id: "r8", lv: 2, title: "A Forest Under the Sea",
      p: "Along some coasts, there are huge underwater forests made of kelp, a kind of seaweed.\n(A) These forests give food and shelter to many sea animals, including fish, crabs, and sea otters.\n(B) However, when the water becomes too warm, kelp cannot grow well and the forests start to disappear.\n(C) As a result, the animals that depend on kelp lose their homes, so scientists are working to protect these forests.",
      qs: [["순서", "주어진 첫 문장 다음에 이어질 글의 순서로 알맞은 것은?", ["(A) − (B) − (C)", "(B) − (A) − (C)", "(C) − (A) − (B)", "(A) − (C) − (B)"], "숲의 역할(A) → 그러나 수온 상승(B) → 그 결과(C)"],
           ["주제", "What is the passage mainly about?", ["kelp forests and the threat they face", "how to catch fish", "why sea otters are cute", "the history of the sea"], "켈프 숲의 가치와 위협"],
           ["어휘", "shelter 의 뜻은?", ["보금자리, 피난처", "먹이", "위험", "물결"], "food and shelter = 먹이와 보금자리"]]},
    {id: "r9", lv: 2, title: "Learning From Mistakes",
      p: "Most students feel bad when they get a question wrong on a test.\n(A) Instead, they look at each mistake and ask, \"Why did I choose this answer?\"\n(B) But students who improve quickly do not just feel bad and move on.\n(C) This habit turns mistakes into lessons, and the same mistake rarely happens again.",
      qs: [["순서", "주어진 첫 문장 다음에 이어질 글의 순서로 알맞은 것은?", ["(B) − (A) − (C)", "(A) − (B) − (C)", "(C) − (B) − (A)", "(B) − (C) − (A)"], "But(B)로 대조 → Instead(A) → This habit(C)"],
           ["주제", "What is the main idea of the passage?", ["Thinking about why you made mistakes helps you improve.", "Tests are not important.", "Feeling bad is the best way to learn.", "Students should avoid hard questions."], "오답의 이유를 묻는 습관"],
           ["어휘", "rarely 의 뜻은?", ["좀처럼 ~않는", "자주", "항상", "빨리"], "rarely happens again = 좀처럼 다시 일어나지 않는다"]]},
    {id: "r10", lv: 3, title: "Why Leaves Change Color",
      p: "In autumn, many leaves turn yellow, orange, or red. ( ① ) During spring and summer, leaves are green because they are full of chlorophyll, which helps plants make food from sunlight. ( ② ) As the days get shorter and colder, trees stop making chlorophyll. ( ③ ) Then the yellow and orange colors that were hidden all along finally appear. ( ④ ) Some trees also make new red colors in autumn, which may protect the leaves from strong sunlight.",
      qs: [["삽입", "글의 흐름으로 보아, 다음 문장이 들어가기에 가장 알맞은 곳은?\n\"The green color slowly breaks down and fades away.\"", ["③", "①", "②", "④"], "엽록소를 만들지 않음(②~③) → 초록이 사라짐 → 숨어 있던 색이 나타남"],
           ["요약형", "요약문: Leaves change color because trees stop making (A) ___, and hidden colors (B) ___.", ["(A) chlorophyll − (B) appear", "(A) sunlight − (B) disappear", "(A) food − (B) grow", "(A) water − (B) fall"], "엽록소 생산이 멈추고 숨어 있던 색이 드러나요."],
           ["내용 일치", "Which is true according to the passage?", ["Yellow colors are in the leaves even in summer.", "Trees make more chlorophyll in autumn.", "Red colors always come from chlorophyll.", "Leaves are green because of water."], "hidden all along = 여름에도 숨어 있었다"]]},
    {id: "r11", lv: 3, title: "The Power of Habit Stacking",
      p: "Starting a new habit is hard because we easily forget to do it. ( ① ) One useful method is called \"habit stacking.\" ( ② ) You connect the new habit to something you already do every day. ( ③ ) Since the old habit happens automatically, it reminds you of the new one. ( ④ ) Over time, the two actions become linked, and the new habit feels natural.",
      qs: [["삽입", "글의 흐름으로 보아, 다음 문장이 들어가기에 가장 알맞은 곳은?\n\"For example, after you brush your teeth at night, you read one page of a book.\"", ["③", "①", "②", "④"], "방법 설명(②~③) → 예시 → Since the old habit…"],
           ["요약형", "요약문: Habit stacking makes a new habit easier by (A) ___ it to an old one that you do (B) ___.", ["(A) linking − (B) automatically", "(A) comparing − (B) rarely", "(A) adding − (B) slowly", "(A) changing − (B) carefully"], "기존 습관에 연결 → 자동으로 떠오름"],
           ["내용 일치", "Which is NOT true according to the passage?", ["Habit stacking means doing two new habits at the same time.", "We often forget to do a new habit.", "The old habit reminds you of the new one.", "The new habit can feel natural over time."], "새 습관을 '이미 하는' 습관에 붙이는 것"]]},
    {id: "r12", lv: 3, title: "Sharing Bicycles",
      p: "Many cities now offer bike-sharing services. ( ① ) People can rent a bicycle with a smartphone app and return it at any station. ( ② ) This reduces traffic and air pollution, because fewer people drive short distances. ( ③ ) Some users leave bikes in the middle of sidewalks, which can be dangerous for walkers. ( ④ ) To solve this, cities are making clear parking zones and charging fines for bad parking.",
      qs: [["삽입", "글의 흐름으로 보아, 다음 문장이 들어가기에 가장 알맞은 곳은?\n\"However, the service also has a problem.\"", ["③", "①", "②", "④"], "장점(②) → However, 문제(③ 앞) → 인도에 방치"],
           ["요약형", "요약문: Bike-sharing helps the environment, but poor (A) ___ causes problems, so cities make (B) ___.", ["(A) parking − (B) rules", "(A) riding − (B) roads", "(A) weather − (B) parks", "(A) apps − (B) games"], "주차 문제 → 주차 구역·벌금"],
           ["내용 일치", "Which is true according to the passage?", ["Users can return bikes at any station.", "Bike-sharing makes air pollution worse.", "Cities allow parking anywhere.", "You need cash to rent a bike."], "return it at any station"]]},
    {id: "r13", lv: 3, title: "Why We Remember Stories",
      p: "Teachers often explain facts by telling stories. ( ① ) This is not just to make lessons fun. ( ② ) Our brains are better at remembering events with causes and results than lists of separate facts. ( ③ ) When facts are part of a story, each one gives a hint about the next. ( ④ ) That is why a story can help you remember a whole chapter long after the test.",
      qs: [["삽입", "글의 흐름으로 보아, 다음 문장이 들어가기에 가장 알맞은 곳은?\n\"It is also because stories match the way our memory works.\"", ["②", "①", "③", "④"], "This is not just to make lessons fun → It is also because… → 뇌의 기억 방식"],
           ["요약형", "요약문: Stories help memory because facts are (A) ___ by causes and results, so one fact (B) ___ the next.", ["(A) connected − (B) suggests", "(A) separated − (B) hides", "(A) forgotten − (B) blocks", "(A) listed − (B) repeats"], "인과로 연결 → 다음 내용의 힌트"],
           ["내용 일치", "Which is true according to the passage?", ["Lists of separate facts are harder to remember than stories.", "Teachers tell stories only to make lessons fun.", "Stories make tests unnecessary.", "Our brains remember lists best."], "brains are better at remembering events with causes and results"]]}
  ];
  RD.forEach(function(r){
    if(GYM_ENG.DX[r.id]) return;
    var d = {id: r.id, lv: r.lv, title: r.title, ch: [{t: "text", p: [["📄", r.p]]}]};
    d.items = r.qs.map(function(x, i){ return {id: "eng:r:" + r.id + ":" + i, tag: "독해 · " + x[0], ds: r.id, q: x[1], c: x[2], a: 0, e: x[3]}; });
    GYM_ENG.D.push(d); GYM_ENG.DX[r.id] = d; GYM_ENG.ritems = GYM_ENG.ritems.concat(d.items);
  });
})();
