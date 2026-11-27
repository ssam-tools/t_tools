/* 수학 놀이터 v2.49 · 💡 생각 놀이 — 논리 추리 · 사고력 · 수학 퍼즐 · 창의성 (직접 만든 문제 30개)
   · 반 전체에 크게 띄워 모둠이 풀어요: [💡 힌트] → [⏱ 생각 시간] → [✅ 답과 풀이] → [🏆 맞힌 모둠] (기초 +1 · 보통 +2 · 심화 +3)
   · 창의성 문제는 답이 여러 개 — 새 아이디어를 낼 때마다 그 모둠 +1
   · 푼 문제는 이 기기에 표시(tt_play_v1.think) → 다음 시간엔 안 푼 문제부터. 학생 정보는 저장하지 않습니다. */
(function(){
  "use strict";
  var h = K.h, btn = K.btn;
  function grid(rows, opt){                                             // 숫자 표 그림
    return '<table class="tkGrid">' + rows.map(function(r){ return "<tr>" + r.map(function(c){ return "<td" + (c === "?" ? ' class="q"' : "") + ">" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</table>";
  }
  function squares(n){                                                  // n×n 격자 그림
    var s = 150, c = s / n, p = "";
    for(var i = 0; i <= n; i++){ p += '<line x1="' + (i * c + 5) + '" y1="5" x2="' + (i * c + 5) + '" y2="' + (s + 5) + '"/><line x1="5" y1="' + (i * c + 5) + '" x2="' + (s + 5) + '" y2="' + (i * c + 5) + '"/>'; }
    return '<svg class="tkSvg" viewBox="0 0 160 160" width="190" height="190"><g stroke="#1d2733" stroke-width="2.5">' + p + "</g></svg>";
  }
  function rects(cols, rows){
    var c = 42, W = cols * c, H = rows * c, p = "";
    for(var i = 0; i <= cols; i++) p += '<line x1="' + (i * c + 5) + '" y1="5" x2="' + (i * c + 5) + '" y2="' + (H + 5) + '"/>';
    for(var j = 0; j <= rows; j++) p += '<line x1="5" y1="' + (j * c + 5) + '" x2="' + (W + 5) + '" y2="' + (j * c + 5) + '"/>';
    return '<svg class="tkSvg" viewBox="0 0 ' + (W + 10) + " " + (H + 10) + '" width="' + (W + 10) * 1.4 + '" height="' + (H + 10) * 1.4 + '"><g stroke="#1d2733" stroke-width="2.5">' + p + "</g></svg>";
  }
  /* 문제 은행: t 종류 · lv 1기초 2보통 3심화 · tags 수학 요소 · q 문제 · fig 그림 · hint · a 답 · sol 풀이 · open 답이 여러 개 */
  var Q = [
    /* ── 🔎 논리 추리 ── */
    {id: "L1", t: "logic", lv: 1, tags: ["규칙성", "수열"], q: "규칙을 찾아 ? 에 알맞은 수를 쓰세요.", fig: '<div class="tkSeq">2, 6, 12, 20, 30, <b>?</b></div>',
      hint: "이웃한 두 수의 차이를 적어 보세요.", a: "42", sol: "차이가 4, 6, 8, 10으로 2씩 커지므로 다음 차이는 12 → 30 + 12 = 42. (n번째 수 = n × (n + 1))"},
    {id: "L2", t: "logic", lv: 1, tags: ["규칙성", "피보나치 수열"], q: "규칙을 찾아 ? 에 알맞은 수를 쓰세요.", fig: '<div class="tkSeq">1, 1, 2, 3, 5, 8, <b>?</b>, 21</div>',
      hint: "앞의 두 수와 그다음 수를 비교해 보세요.", a: "13", sol: "앞의 두 수를 더하면 다음 수가 됩니다. 5 + 8 = 13, 8 + 13 = 21 ✓ (피보나치 수열)"},
    {id: "L3", t: "logic", lv: 1, tags: ["순서 추리", "부등호"], q: "다섯 명 A, B, C, D, E의 키에 대한 단서입니다. 세 번째로 키가 큰 사람은?",
      fig: '<ul class="tkList"><li>E는 A보다 크다.</li><li>A는 B보다 크다.</li><li>B는 D보다 크다.</li><li>D는 C보다 크다.</li></ul>',
      hint: "부등호(>)로 한 줄로 이어 보세요.", a: "B", sol: "E > A > B > D > C 이므로 세 번째로 큰 사람은 B입니다."},
    {id: "L4", t: "logic", lv: 1, tags: ["논리", "말 바꾸기"], q: "'어제의 내일의 모레'가 금요일이라면 오늘은 무슨 요일일까요?",
      hint: "'어제의 내일'은 언제일까요?", a: "수요일", sol: "어제의 내일 = 오늘. 오늘의 모레가 금요일이므로 오늘은 수요일입니다."},
    {id: "L5", t: "logic", lv: 2, tags: ["논리 추론", "참과 거짓"], q: "A, B, C 세 사람은 늘 참말만 하거나 늘 거짓말만 합니다. 참말을 하는 사람은 누구일까요?",
      fig: '<ul class="tkList"><li>A: "B는 거짓말쟁이야."</li><li>B: "C는 거짓말쟁이야."</li><li>C: "A와 B 둘 다 거짓말쟁이야."</li></ul>',
      hint: "C가 참말을 한다고 가정해 보고, 어긋나는지 확인해 보세요.", a: "B만 참말", sol: "C가 참이면 A·B가 모두 거짓 → A의 말이 거짓이니 B는 참 → 모순. 그래서 C는 거짓 → B의 말 'C는 거짓말쟁이'는 참 → B는 참, A의 말은 거짓 → A는 거짓. C의 말(둘 다 거짓)도 거짓이 되어 딱 맞습니다."},
    {id: "L6", t: "logic", lv: 2, tags: ["논리 추론", "경우 나누기"], q: "세 상자에 '사과', '배', '사과와 배' 라벨이 붙어 있는데, 라벨이 모두 틀렸습니다. 한 상자에서 과일을 딱 하나만 꺼내 보고 모든 라벨을 바르게 고치려면 어느 상자에서 꺼내야 할까요?",
      hint: "'사과와 배' 라벨이 틀렸다면 그 상자에는 무엇이 들어 있을까요?", a: "'사과와 배' 라벨 상자", sol: "'사과와 배' 상자는 한 가지 과일만 들어 있어요. 꺼낸 것이 사과면 그 상자는 사과 상자. 그러면 '배' 라벨 상자는 배일 수 없고 사과도 아니니 '사과와 배', 남은 '사과' 라벨 상자가 배 상자입니다."},
    {id: "L7", t: "logic", lv: 2, tags: ["거듭제곱", "규칙성"], q: "표의 규칙을 찾아 ? 에 알맞은 수를 쓰세요.", fig: grid([[2, 4, 8], [3, 9, 27], [4, 16, "?"]]),
      hint: "가로줄마다 첫 수와 나머지 수의 관계를 보세요.", a: "64", sol: "각 줄은 a, a², a³ 입니다. 4³ = 64"},
    {id: "L8", t: "logic", lv: 3, tags: ["최적화", "전략"], q: "밤에 네 사람이 다리를 건너야 합니다. 손전등은 하나, 한 번에 최대 두 명만 건널 수 있고 손전등을 들고 가야 해요. 혼자 건너는 데 1분, 2분, 5분, 10분이 걸리고, 둘이 함께 가면 느린 사람의 시간이 걸립니다. 모두 건너는 가장 짧은 시간은?",
      hint: "가장 느린 두 사람을 함께 보내면 어떨까요?", a: "17분", sol: "① 1·2 건넘(2분) ② 1 돌아옴(1분) ③ 5·10 건넘(10분) ④ 2 돌아옴(2분) ⑤ 1·2 건넘(2분) → 2 + 1 + 10 + 2 + 2 = 17분"},
    /* ── 🧠 사고력 ── */
    {id: "T1", t: "think", lv: 1, tags: ["경우의 수"], q: "6명이 서로 한 번씩 빠짐없이 악수를 합니다. 악수는 모두 몇 번일까요?",
      hint: "첫 번째 사람은 몇 명과 악수할까요? 두 번째 사람은 새로 몇 명과?", a: "15번", sol: "5 + 4 + 3 + 2 + 1 = 15번. (또는 6 × 5 ÷ 2 = 15, 두 사람씩 짝을 짓는 경우의 수)"},
    {id: "T2", t: "think", lv: 1, tags: ["규칙성", "제곱수"], q: "1 + 3 + 5 + 7 + … + 19 를 빠르게 계산해 보세요.",
      hint: "1, 1+3, 1+3+5 … 를 계산해 보면 무엇이 보이나요?", a: "100", sol: "1 = 1², 1+3 = 2², 1+3+5 = 3² … 홀수 n개의 합은 n². 1부터 19까지 홀수는 10개 → 10² = 100"},
    {id: "T3", t: "think", lv: 2, tags: ["도형 세기", "규칙성"], q: "그림의 3×3 격자에는 크고 작은 정사각형이 모두 몇 개 있을까요?", fig: squares(3),
      hint: "1×1, 2×2, 3×3 크기별로 나누어 세어 보세요.", a: "14개", sol: "1×1: 9개, 2×2: 4개, 3×3: 1개 → 9 + 4 + 1 = 14개 (n×n이면 1² + 2² + … + n²)"},
    {id: "T4", t: "think", lv: 2, tags: ["입체도형", "공간 감각"], q: "겉면을 모두 빨갛게 칠한 정육면체를 3×3×3 = 27개의 작은 정육면체로 잘랐습니다. 두 면만 빨간 작은 정육면체는 몇 개일까요?",
      hint: "두 면이 칠해지려면 큰 정육면체의 어디에 있어야 할까요?", a: "12개", sol: "모서리 가운데에 있는 조각이 두 면만 칠해져요. 정육면체의 모서리는 12개, 모서리마다 1개 → 12개. (세 면 8개, 한 면 6개, 칠해지지 않은 것 1개 → 합 27)"},
    {id: "T5", t: "think", lv: 2, tags: ["각도", "시계"], q: "3시 30분일 때 시침과 분침이 이루는 작은 각은 몇 도일까요?",
      hint: "시침은 1시간에 30°, 30분 동안에는 몇 도 움직일까요?", a: "75°", sol: "분침은 6을 가리켜 180°. 시침은 3시(90°)에서 30분 동안 15° 더 가서 105°. 180° − 105° = 75°"},
    {id: "T6", t: "think", lv: 2, tags: ["경우의 수", "규칙성"], q: "계단을 한 번에 1칸 또는 2칸씩 오를 수 있습니다. 6칸을 오르는 방법은 모두 몇 가지일까요?",
      hint: "1칸, 2칸, 3칸 … 일 때 방법의 수를 차례로 구해 보세요.", a: "13가지", sol: "1칸 1, 2칸 2, 3칸 3, 4칸 5, 5칸 8, 6칸 13. 마지막에 1칸 오르는 경우 + 2칸 오르는 경우를 더하므로 앞의 두 수의 합(피보나치)."},
    {id: "T7", t: "think", lv: 3, tags: ["수 세기", "자릿값"], q: "1부터 100까지의 수를 모두 쓸 때 숫자 '1'은 모두 몇 번 쓸까요?",
      hint: "일의 자리, 십의 자리, 백의 자리로 나누어 세어 보세요.", a: "21번", sol: "일의 자리 1: 1, 11, 21, …, 91 → 10번. 십의 자리 1: 10~19 → 10번. 백의 자리: 100 → 1번. 10 + 10 + 1 = 21번"},
    {id: "T8", t: "think", lv: 3, tags: ["경우의 수", "조합"], q: "그림의 2×3 격자에서 찾을 수 있는 크고 작은 직사각형(정사각형 포함)은 모두 몇 개일까요?", fig: rects(3, 2),
      hint: "직사각형은 세로선 2개와 가로선 2개를 고르면 하나 생겨요.", a: "18개", sol: "세로선 4개 중 2개 고르기 6가지 × 가로선 3개 중 2개 고르기 3가지 = 18개"},
    /* ── 🧩 수학 퍼즐 ── */
    {id: "P1", t: "puzzle", lv: 1, tags: ["등식", "방정식 감각"], q: "같은 그림은 같은 수입니다. 🍇의 값은?",
      fig: '<div class="tkEq"><div>🍎 + 🍎 + 🍎 = 30</div><div>🍎 + 🍌 + 🍌 = 20</div><div>🍌 + 🍇 + 🍇 = 13</div></div>',
      hint: "첫 줄부터 차례로 하나씩 구해 보세요.", a: "4", sol: "🍎 = 10 → 🍌 + 🍌 = 10, 🍌 = 5 → 🍇 + 🍇 = 8, 🍇 = 4"},
    {id: "P2", t: "puzzle", lv: 2, tags: ["계산 순서", "등식"], q: "🍎 = 10, 🍌 = 5, 🍇 = 4 일 때 🍇 + 🍌 × 🍎 의 값은?",
      hint: "곱셈과 덧셈 중 무엇을 먼저 할까요?", a: "54", sol: "곱셈 먼저: 🍌 × 🍎 = 50 → 4 + 50 = 54. (왼쪽부터 계산해 90이라고 하면 함정!)"},
    {id: "P3", t: "puzzle", lv: 1, tags: ["수 배치", "합"], q: "1부터 6까지의 수를 삼각형의 꼭짓점과 변 가운데 ○에 한 번씩 넣어, 각 변의 세 수의 합이 모두 9가 되게 하세요.",
      fig: '<svg class="tkSvg" viewBox="0 0 200 180" width="230" height="200"><polygon points="100,20 20,160 180,160" fill="none" stroke="#1d2733" stroke-width="2.5"/>' + [[100, 20], [60, 90], [140, 90], [20, 160], [100, 160], [180, 160]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="16" fill="#fff" stroke="#1f5f99" stroke-width="2.5"/>'; }).join("") + "</svg>",
      hint: "작은 수 1, 2, 3을 꼭짓점에 놓아 보세요.", a: "꼭짓점 1·2·3, 변 6·4·5 (예)", sol: "꼭짓점이 1, 2, 3이면 변의 가운데는 1+?+2=9 → 6, 2+?+3=9 → 4, 3+?+1=9 → 5. 1~6을 한 번씩 썼어요."},
    {id: "P4", t: "puzzle", lv: 2, tags: ["사칙연산", "괄호"], q: "4를 네 번만 쓰고 +, −, ×, ÷와 괄호로 5를 만들어 보세요.",
      hint: "4 × 4 는 16, 16에 무엇을 더하면 4로 나누어떨어질까요?", a: "(4 × 4 + 4) ÷ 4 = 5", sol: "(4 × 4 + 4) ÷ 4 = 20 ÷ 4 = 5. 다른 방법도 있어요: 4 + 4⁴⁻⁴ = 4 + 1 = 5 (어떤 수의 0제곱은 1), 4 + (4 ÷ 4) × (4 ÷ 4)는 4가 다섯 개라 반칙! 몇 가지 찾았나요?", open: true},
    {id: "P5", t: "puzzle", lv: 2, tags: ["일차방정식"], q: "아버지의 나이는 아들 나이의 3배입니다. 12년 뒤에는 아버지의 나이가 아들 나이의 2배가 됩니다. 지금 아들은 몇 살일까요?",
      hint: "지금 아들 나이를 x로 놓고 12년 뒤 나이를 식으로 써 보세요.", a: "12살", sol: "3x + 12 = 2(x + 12) → 3x + 12 = 2x + 24 → x = 12. 아들 12살, 아버지 36살 (12년 뒤 24살과 48살 ✓)"},
    {id: "P6", t: "puzzle", lv: 2, tags: ["연립방정식", "자릿값"], q: "두 자리 수가 있습니다. 십의 자리 숫자와 일의 자리 숫자의 합은 9이고, 두 숫자의 자리를 바꾸면 처음 수보다 27이 커집니다. 처음 수는?",
      hint: "처음 수를 10a + b, 바꾼 수를 10b + a 로 써 보세요.", a: "36", sol: "a + b = 9, (10b + a) − (10a + b) = 27 → 9(b − a) = 27 → b − a = 3. a = 3, b = 6 → 36 (63 − 36 = 27 ✓)"},
    {id: "P7", t: "puzzle", lv: 2, tags: ["규칙성", "함정 찾기"], q: "깊이 10 m 우물 바닥의 달팽이가 낮에는 3 m 올라가고 밤에는 2 m 미끄러집니다. 달팽이가 우물 밖으로 나오는 것은 며칠째 낮일까요?",
      hint: "하루에 1 m씩이라고 10일이라 하면 함정! 마지막 날 낮에는 미끄러지지 않아요.", a: "8일째", sol: "7일째 밤이 끝나면 7 m. 8일째 낮에 3 m 올라 10 m → 밖으로! (하루 1 m × 10일 = 10일이 아니에요)"},
    {id: "P8", t: "puzzle", lv: 3, tags: ["거듭제곱", "나머지"], q: "7을 2026번 곱한 수(7²⁰²⁶)의 일의 자리 숫자는?",
      hint: "7¹, 7², 7³, 7⁴, 7⁵ 의 일의 자리를 차례로 적어 보세요.", a: "9", sol: "일의 자리는 7, 9, 3, 1이 4번마다 되풀이. 2026 ÷ 4 = 506 … 2 → 두 번째 = 9"},
    /* ── 🌈 창의성 (답이 여러 개) ── */
    {id: "C1", t: "idea", lv: 1, open: true, tags: ["사칙연산", "다양한 표현"], q: "계산 결과가 10이 되는 식을 1분 동안 모둠별로 최대한 많이, 서로 다른 방법으로 만들어 보세요.",
      hint: "덧셈만 쓰지 말고 곱셈·나눗셈·제곱·분수도 써 보세요.", a: "예: 2 × 5, 20 ÷ 2, 3² + 1, 15 − 5, ½ × 20, (−2) × (−5) …", sol: "다른 모둠과 겹치지 않는 식마다 +1점! 거듭제곱·음수·분수를 쓴 식은 칭찬해 주세요."},
    {id: "C2", t: "idea", lv: 1, open: true, tags: ["문제 만들기"], q: "답이 12인 수학 문제를 만들어 보세요. 다른 모둠이 풀 수 있어야 해요!",
      hint: "계산 문제, 도형 문제(넓이·둘레), 생활 속 문제 등 종류를 바꿔 보세요.", a: "예: 가로 3, 세로 4인 직사각형의 넓이 / 정십이각형의 꼭짓점 수 / 1년은 몇 달?", sol: "서로 다른 종류의 문제를 낸 모둠에 +1점. 다른 모둠이 실제로 풀어 보게 하면 더 좋아요."},
    {id: "C3", t: "idea", lv: 2, open: true, tags: ["도형 나누기", "넓이"], q: "정사각형 하나를 넓이가 같은 4조각으로 나누는 방법을 최대한 많이 찾아 보세요. (모양은 달라도 돼요)",
      fig: squares(1), hint: "가로·세로·대각선, 계단 모양, 가운데를 지나는 비스듬한 두 직선도 생각해 보세요.",
      a: "예: 십자(+), 대각선 X, 세로 4줄, 가로 4줄, 중심을 지나는 직각인 두 직선(어떤 각도든!) …", sol: "중심을 지나며 서로 수직인 두 직선은 어떤 각도로 그어도 넓이를 4등분해요 → 방법은 사실 무수히 많아요!"},
    {id: "C4", t: "idea", lv: 2, open: true, tags: ["넓이", "약수"], q: "넓이가 12 cm²인 서로 다른 도형을 최대한 많이 생각해 보세요. (변의 길이는 자연수)",
      hint: "직사각형은 (가로) × (세로) = 12, 삼각형은 (밑변) × (높이) = 24!", a: "직사각형 1×12, 2×6, 3×4 / 삼각형 밑변·높이 (3, 8), (4, 6), (6, 4), (2, 12) … / 사다리꼴 …", sol: "약수 짝을 찾는 것과 같아요. 삼각형·평행사변형·사다리꼴까지 넓히면 더 많아요."},
    {id: "C5", t: "idea", lv: 2, open: true, tags: ["수학사", "0의 의미"], q: "만약 세상에 숫자 0이 없다면 무엇이 불편할까요? 모둠별로 3가지 이상 찾아 보세요.",
      hint: "105와 15를 어떻게 구별할까요? 온도 0℃, 통장 잔고, 좌표의 원점은?", a: "예: 자릿값(105와 15 구별 불가), 영하·영상의 기준, 좌표의 원점, 컴퓨터의 0과 1(2진법) …", sol: "0은 인도에서 '빈자리'와 '수'로 함께 쓰이기 시작했어요. 0 덕분에 자릿값 표기와 음수, 좌표가 가능해졌어요."},
    {id: "C6", t: "idea", lv: 3, open: true, tags: ["규칙성", "수열 만들기"], q: "나만의 규칙으로 수 5개를 늘어놓고, 다른 모둠이 여섯 번째 수를 맞히게 해 보세요. 맞히기 어렵지만 알고 나면 '아하!' 하는 규칙일수록 좋아요.",
      hint: "더하기·곱하기를 번갈아 하거나, 제곱수·소수·자릿수의 합 등을 써 보세요.", a: "예: 1, 2, 4, 7, 11 (+1, +2, +3, +4) / 2, 3, 5, 7, 11 (소수) / 1, 4, 9, 16, 25 (제곱수)", sol: "규칙을 말로 설명할 수 있어야 정답! 다른 모둠이 맞히면 낸 모둠과 맞힌 모둠 모두 +1점."}
  ];
  var TYPES = {logic: ["🔎", "논리 추리", "단서로 하나뿐인 답 찾기"], think: ["🧠", "사고력", "세고 따지고 규칙 찾기"], puzzle: ["🧩", "수학 퍼즐", "식과 수로 푸는 퍼즐"], idea: ["🌈", "창의성", "답이 여러 개인 열린 문제"]};
  var LV = {1: "기초", 2: "보통", 3: "심화"};
  K.THINK = Q;
  (K.MATH || (K.MATH = {})).tk_logic = [["논리 추론", "규칙성"], "단서를 하나씩 따져 '왜 그런지' 말할 수 있나요?"];
  K.MATH.tk_think = [["경우의 수", "규칙성"], "빠짐없이, 겹치지 않게 세는 방법은?"];
  K.MATH.tk_puzzle = [["방정식", "거듭제곱"], "식으로 나타내면 더 쉬워지나요?"];
  K.MATH.tk_idea = [["다양한 표현", "문제 만들기"], "남들과 다른 답을 하나 더 찾을 수 있나요?"];

  Object.keys(TYPES).forEach(function(tp){
    var T = TYPES[tp];
    K.game({id: "tk_" + tp, icon: T[0], cat: "think", name: T[1], desc: T[2] + " · 기초·보통·심화 " + Q.filter(function(x){ return x.t === tp; }).length + "문제 · 힌트 → 생각 시간 → 답과 풀이", mount: function(el, ctl){
      var L = Q.filter(function(x){ return x.t === tp; }), lvf = K.pref("tkLv") || 0, idx = 0, stage = 0, tm = null;
      function done(){ return K.pref("think") || {}; }
      function list(){ return L.filter(function(x){ return !lvf || x.lv === lvf; }); }
      var lvSel = K.seg([[0, "전체"], [1, "기초"], [2, "보통"], [3, "심화"]], lvf, function(v){ lvf = +v; K.pref("tkLv", lvf); first(); });
      ctl.appendChild(lvSel);
      var wrap = h("div", "tk"), card = h("div", "tkCard"), side = h("div", "tkSide"); wrap.appendChild(card); wrap.appendChild(side); el.appendChild(wrap);
      function first(){ var A = list(), D = done(); idx = Math.max(0, A.findIndex(function(x){ return !D[x.id]; })); stage = 0; draw(); }
      function stopT(){ if(tm && tm.stop) tm.stop(); tm = null; }
      function draw(){
        stopT();
        var A = list(), x = A[idx], D = done();
        side.innerHTML = ""; card.innerHTML = "";
        if(!x){ card.appendChild(h("p", "tkNone", "이 단계 문제가 없어요.")); return; }
        /* 문제 번호 칩 */
        var chips = h("div", "tkChips");
        A.forEach(function(y, i){ var b = h("button", "tkChip" + (i === idx ? " on" : "") + (D[y.id] ? " ok" : "") + " l" + y.lv, String(i + 1)); b.type = "button"; b.title = LV[y.lv] + (D[y.id] ? " · 풀었어요" : ""); b.onclick = function(){ idx = i; stage = 0; K.S.click(); draw(); }; chips.appendChild(b); });
        side.appendChild(h("div", "tkSh", "문제 고르기")); side.appendChild(chips);
        var tbox = h("div", "tkTimer"); side.appendChild(h("div", "tkSh", "⏱ 생각 시간")); var trow = h("div", "tkTrow");
        [60, 180].forEach(function(sec){ trow.appendChild(btn(sec / 60 + "분", "", function(){ stopT(); tm = K.timer(tbox, sec, function(){ K.S.sad(); K.big("⏰ 시간 끝!", "답을 말해 볼까요?", "#d64545", 1400); }); })); });
        side.appendChild(trow); side.appendChild(tbox);
        /* 문제 카드 */
        var top = h("div", "tkTop"); top.appendChild(h("span", "tkLv l" + x.lv, LV[x.lv])); top.appendChild(h("span", "tkNo", (idx + 1) + " / " + A.length));
        var tg = h("span", "mtag"); x.tags.forEach(function(t){ tg.appendChild(h("i", "", t)); }); top.appendChild(tg);
        if(x.open) top.appendChild(h("span", "tkOpen", "🌈 답이 여러 개"));
        card.appendChild(top);
        card.appendChild(h("div", "tkQ", x.q));
        if(x.fig){ var f = h("div", "tkFig"); f.innerHTML = x.fig; card.appendChild(f); }
        if(stage >= 1) card.appendChild(h("div", "tkHint", "💡 " + x.hint));
        if(stage >= 2){ var an = h("div", "tkAns"); an.appendChild(h("b", "", (x.open ? "예시 답: " : "답: ") + x.a)); an.appendChild(h("p", "", x.sol)); card.appendChild(an); }
        var acts = h("div", "tkActs");
        if(stage < 1) acts.appendChild(btn("💡 힌트", "", function(){ stage = 1; K.S.pop(); draw(); }));
        if(stage < 2) acts.appendChild(btn(x.open ? "🌈 예시 답 보기" : "✅ 답과 풀이", "", function(){ stage = 2; K.S.whoosh(); var o = done(); o[x.id] = 1; K.pref("think", o); draw(); }));
        var pts = x.open ? 1 : x.lv;
        acts.appendChild(btn("🏆 " + (x.open ? "아이디어 낸 모둠 +1" : "맞힌 모둠 +" + pts), "primary", function(){
          K.askTeam(x.open ? "💡 새 아이디어를 낸 모둠은?" : "✅ 맞힌 모둠은?", function(i){ var t = K.teams()[i]; K.add(i, pts, "think"); K.S.good(); K.confetti(); K.big("+" + pts, t.name + (x.open ? " 좋은 생각!" : " 정답!"), t.color, 1200); });
        }));
        var nav = h("div", "tkNav");
        nav.appendChild(btn("◀ 이전", "", function(){ if(idx > 0){ idx--; stage = 0; draw(); } }));
        nav.appendChild(btn("다음 ▶", "", function(){ if(idx < A.length - 1){ idx++; stage = 0; draw(); } else { K.fireworks(3); K.big("🎉 이 단계 끝!", "다른 단계에도 도전해 봐요", "#2e9d5b", 1600); } }));
        acts.appendChild(nav); card.appendChild(acts);
      }
      first();
      return function(){ stopT(); };
    }});
  });

  K.css(""
    + ".tk{display:flex;gap:14px;height:100%;min-height:0}"
    + ".tkCard{flex:1;min-width:0;background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px 22px;display:flex;flex-direction:column;gap:12px;overflow:auto}"
    + ".tkTop{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.tkLv{font-size:13px;font-weight:800;border-radius:999px;padding:2px 11px;color:#fff}.tkLv.l1{background:#2e9d5b}.tkLv.l2{background:#2f6fb5}.tkLv.l3{background:#9b4dca}"
    + ".tkNo{font-size:13px;color:var(--sub);font-variant-numeric:tabular-nums}.tkOpen{font-size:12.5px;font-weight:700;color:#b4640a;background:#fff1d6;border-radius:999px;padding:1px 9px}"
    + ".tkQ{font-size:clamp(20px,2.7vw,30px);font-weight:700;line-height:1.5;word-break:keep-all}"
    + ".tkFig{display:flex;justify-content:center;padding:4px 0}.tkSvg{max-width:100%;height:auto}"
    + ".tkSeq{font-size:clamp(28px,4vw,46px);font-weight:800;letter-spacing:1px;font-variant-numeric:tabular-nums}.tkSeq b{color:#d64545}"
    + ".tkList{margin:0;padding-left:1.2em;font-size:clamp(18px,2.2vw,25px);line-height:1.7}"
    + ".tkEq{font-size:clamp(24px,3.2vw,36px);font-weight:700;line-height:1.6;text-align:center}"
    + ".tkGrid{border-collapse:collapse;font-size:clamp(24px,3vw,34px);font-weight:800}.tkGrid td{border:2.5px solid #1d2733;width:2.4em;height:1.8em;text-align:center}.tkGrid td.q{color:#d64545;background:#fff4f4}"
    + ".tkHint{font-size:clamp(16px,1.9vw,21px);background:#fff8e1;border-radius:12px;padding:10px 14px;line-height:1.55}"
    + ".tkAns{background:#eaf5ea;border-radius:12px;padding:12px 16px}.tkAns b{display:block;font-size:clamp(19px,2.3vw,26px);color:#1e6b3c}.tkAns p{margin:6px 0 0;font-size:clamp(14.5px,1.6vw,18px);line-height:1.6}"
    + ".tkActs{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:auto;padding-top:6px}.tkNav{margin-left:auto;display:flex;gap:6px}"
    + ".tkSide{width:200px;flex:none;display:flex;flex-direction:column;gap:6px}.tkSh{font-size:12.5px;font-weight:800;color:var(--sub);margin-top:6px}"
    + ".tkChips{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.tkChip{font:inherit;font-weight:800;border:2px solid var(--line);background:#fff;border-radius:10px;height:38px;cursor:pointer;position:relative}"
    + ".tkChip.l1{border-bottom-color:#2e9d5b}.tkChip.l2{border-bottom-color:#2f6fb5}.tkChip.l3{border-bottom-color:#9b4dca}.tkChip.on{background:var(--accent,#2f6fb5);color:#fff;border-color:var(--accent,#2f6fb5)}"
    + ".tkChip.ok::after{content:'✓';position:absolute;right:3px;top:0;font-size:11px;color:#2e9d5b}.tkChip.on.ok::after{color:#fff}"
    + ".tkTrow{display:flex;gap:6px}.tkTrow .btn{flex:1}.tkTimer{display:flex;justify-content:center;min-height:10px}.tkTimer svg{width:96px;height:96px}"
    + ".tkNone{color:var(--sub)}"
    + "@media (max-width:760px){.tk{flex-direction:column}.tkSide{width:100%}}");
})();
