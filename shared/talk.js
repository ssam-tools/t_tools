/* 쌤 노트 v2.13.0 · 쌤비 이야기 (말풍선 한마디)
   쌤비가 한가할 때(수업 중·급한 일·퇴근 도장 안내가 없을 때) 하루 흐름에 맞춰 이야기를 하나씩 전합니다.
   - 출근: 힘이 되는 말 · 작은 실천 · 오늘은 무슨 날      - 조회 전·종례 전: 아이들에게 해 줄 이야기 [📣 종례 때 전하기]
   - 낮: 이달의 학교 일 · 알아 두면 좋은 것 · 쌤 노트 꿀팁 · 교육 소식 · 우리 반·나 기록
   - 퇴근 뒤·주말: 쉬어 가는 말          - 학교 소식(업무판에서 담당 선생님이 보낸 글)은 기간 동안 먼저
   말풍선을 누르면 다음 이야기. 같은 이야기는 3주 안에 되풀이하지 않습니다. 설정 → 쌤비 이야기에서 종류별로 끄고 켭니다.
   학교 소식·교육 소식은 학교 업무판(Apps Script, board/Talk.gs)에서 받아 옵니다. 학생 자료는 보내지 않습니다. */
(function(){
  "use strict";
  if(window.TT_TALK) return;

  /* ───────── 이야기 묶음 ───────── */
  var CHEER = [
    "오늘 교실에서 건넨 한마디가 누군가에겐 하루의 전부일 수 있어요.",
    "완벽한 수업보다 다시 일어서는 선생님이 아이들에게 더 큰 배움이에요.",
    "아이들은 선생님의 말보다 표정을 먼저 기억해요. 오늘은 미소 한 번 더!",
    "모든 아이를 오늘 다 바꿀 순 없어요. 한 아이에게 한 걸음이면 충분해요.",
    "지친 날엔 ‘오늘 잘한 일 하나’만 떠올려 보세요. 분명히 있어요.",
    "선생님도 배우는 중이에요. 서툰 날도 자라는 날이에요.",
    "씨앗은 심은 날 싹이 트지 않아요. 오늘 건넨 말도 그래요.",
    "아이를 믿어 주는 어른 한 명이 아이를 버티게 해요. 그 한 명이 선생님이에요.",
    "오늘 속상했다면, 그만큼 아이들을 진심으로 대했다는 뜻이에요.",
    "교실이 시끄러운 건 아이들이 살아 있다는 뜻이에요.",
    "가르친다는 건 두 번 배우는 일이래요.",
    "한 번 더 설명해 주는 인내가 한 아이의 길을 바꾸기도 해요.",
    "아이 이름을 불러 주는 것만으로도 교실이 따뜻해져요.",
    "오늘도 출근한 선생님, 그 자체로 대단해요.",
    "비교는 내려놓아요. 아이에게도, 선생님 자신에게도.",
    "아이들의 ‘왜요?’는 생각이 자라는 소리예요.",
    "칭찬은 구체적일수록 오래 남아요. “끝까지 풀어낸 게 멋졌어”처럼요.",
    "작은 성공을 자주 맛보게 해 주는 것, 그게 자존감을 키우는 길이래요.",
    "선생님의 기록 한 줄이 아이의 한 해를 말해 줘요.",
    "실수한 아이에게 “괜찮아, 다시 해 보자.” 오늘의 가장 좋은 수업이에요.",
    "오늘의 피곤함은 누군가의 성장에 쓰였어요.",
    "모른다고 말할 줄 아는 선생님이 아이들에게 정직을 가르쳐요.",
    "옆자리 선생님께 “고생 많으세요” 한마디, 오늘 건네 볼까요?",
    "아이들은 결국 사랑받은 기억으로 자라요.",
    "오늘이 엉망이었어도 내일 아침 교실은 새로 시작돼요.",
    "큰 소리보다 기다림이 더 멀리 가요.",
    "배움은 아이들의 속도로 자라요. 조급하지 않아도 괜찮아요.",
    "선생님이 즐거우면 교실도 즐거워요. 오늘 나를 위한 작은 즐거움 하나!",
    "배우고 때때로 익히면 또한 기쁘지 아니한가. — 『논어』",
    "아는 것을 안다 하고 모르는 것을 모른다 하는 것, 이것이 아는 것이다. — 『논어』",
    "천하의 인재를 얻어 가르치는 것이 군자의 세 번째 즐거움이다. — 『맹자』",
    "물방울이 바위를 뚫는 건 힘이 세서가 아니라 멈추지 않아서예요.",
    "아이 한 명의 변화는 느리지만, 분명히 오고 있어요.",
    "오늘 가장 힘들게 한 아이가 사실은 도움이 가장 필요한 아이일지도 몰라요.",
    "잘 쉬는 것도 실력이에요. 오늘은 제때 퇴근해요."
  ];
  var MON = ["월요일이에요. 이번 주도 천천히, 그러나 꾸준히!", "한 주의 시작, 오늘은 아이들 얼굴을 한 번씩 살펴보는 날로 해요.", "월요일 아침엔 할 일보다 할 수 있는 일부터.", "주말 동안 아이들도 자랐을 거예요. 반갑게 맞아 주세요."];
  var FRI = ["금요일이에요! 이번 주를 버텨 낸 나에게 박수 👏", "한 주 수고 많으셨어요. 주말엔 학교 일은 잠시 내려놓아요.", "이번 주 가장 고마웠던 아이 한 명을 떠올려 보세요.", "금요일 오후, 다음 주 할 일 하나만 적어 두고 가벼운 마음으로 퇴근해요."];
  var EXAM = ["시험 기간엔 아이들도 예민해요. 따뜻한 한마디가 큰 힘이 돼요.", "시험이 끝나면 점수보다 과정을 먼저 칭찬해 주세요.", "채점은 쌤 노트 빠른 채점으로 조금 가볍게!"];
  var REC = ["생기부 쓰는 손이 무거운 계절이에요. 한 줄 한 줄이 아이의 한 해가 돼요.", "행동특성 종합의견에 아이의 ‘변화’ 한 문장을 넣으면 살아 있는 기록이 돼요.", "세특은 ‘무엇을 했는지’보다 ‘어떻게 생각하고 자랐는지’가 보이게!", "수업 기록장에 적어 둔 메모가 빛을 발할 때예요."];
  var REST = ["오늘도 수고하셨어요. 푹 쉬어야 내일 또 웃을 수 있어요.", "퇴근 뒤엔 업무 알림 대신 좋아하는 일 하나!", "학교 일은 내일의 쌤 노트에게 맡겨 두세요.", "잘 자는 것도 내일 수업 준비예요.", "따뜻한 저녁 보내세요.", "오늘 하루, 충분히 잘하셨어요."];
  var WKEND = ["주말이에요. 학교 일은 월요일의 쌤 노트에게 맡겨요.", "주말엔 나를 위한 시간을 꼭 챙겨요.", "푹 쉬고 월요일에 반갑게 만나요.", "좋아하는 사람들과 맛있는 것 드세요."];
  var ACT = ["한 아이의 이름을 불러 구체적으로 칭찬하기", "물 한 컵 더 마시기", "쉬는 시간 5분, 창문 열고 깊게 숨쉬기", "고마운 동료에게 메시지 한 줄 보내기", "퇴근 전 책상 위 5분 정리", "아이 한 명에게 “요즘 어때?” 물어보기", "오늘 수업 기록 한 줄 남기기", "점심 먹고 10분 걷기", "어깨 크게 10번 돌리기", "오늘 잘한 일 세 가지 적어 보기", "미뤄 둔 메시지 하나 처리하기", "조용히 있는 아이에게 먼저 말 걸기", "학생 카드에 칭찬 기록 하나 남기기", "휴대폰 없이 점심 먹기", "계단으로 한 층 걸어 오르기", "내일 할 일 하나 미리 적어 두기", "웃으며 교실 문 열기", "학부모님께 좋은 소식 문자 하나 보내기", "오늘 새로 알게 된 것 하나 메모하기", "오늘은 일찍 자기!"];
  var KIDS = [
    "오늘 하루, 친구에게 ‘고마워’ 한 번 말해 보자.", "실수는 배우는 중이라는 뜻이야. 틀려도 괜찮아.", "어제보다 1% 나은 오늘이면 충분해.",
    "말 한마디가 친구의 하루를 바꿀 수 있어. 따뜻한 말 쓰기!", "모르는 건 부끄러운 게 아니야. 묻지 않는 게 아쉬운 거지.", "책상 정리가 마음 정리의 시작이야.",
    "친구의 좋은 점 하나를 찾아서 말해 주기, 오늘의 미션!", "잠은 최고의 공부 도우미야. 오늘은 휴대폰 내려놓고 일찍 자자.", "하기 싫은 일을 먼저 하면 남은 하루가 가벼워져.",
    "꿈은 크게, 실천은 작게. 오늘 할 수 있는 한 가지부터!", "혼자 있는 친구가 보이면 먼저 다가가 보자.", "인사는 내가 먼저! 인사 잘하는 사람이 사랑받아.",
    "기다릴 줄 아는 것도 힘이야. 줄 서기, 순서 지키기.", "오늘 들은 말 중 기분 좋았던 말을 친구에게 돌려주자.", "화가 날 땐 속으로 10까지 세고 말하기.",
    "온라인에 쓴 말은 지워지지 않아. 올리기 전에 한 번 더 생각하자.", "공부는 남과의 경쟁이 아니라 어제의 나와의 약속이야.", "포기하고 싶을 때가 실력이 느는 순간이야.",
    "아침밥 먹고 오기! 머리도 밥을 먹어야 일해.", "쉬는 시간엔 화장실, 물 마시기, 다음 시간 준비!", "집에 가면 오늘 있었던 일 하나를 가족에게 이야기해 보자.",
    "내 행동이 우리 반의 얼굴이야.", "친구의 실수를 웃음거리로 만들지 않기.", "작은 약속을 지키는 사람이 큰 믿음을 얻어.",
    "오늘 숙제는 오늘 끝내기! 내일의 나에게 주는 선물이야.", "남의 물건은 허락받고, 빌린 건 꼭 돌려주기.", "길을 걸을 땐 휴대폰 대신 앞을 보자.",
    "상대가 싫다고 하면 장난은 더 이상 장난이 아니야.", "고민이 있으면 언제든 선생님한테 와도 괜찮아.", "오늘도 학교에 와 줘서 고마워."
  ];
  var KIDS_M = {
    1: ["방학에도 일어나는 시간만큼은 지키자. 생활 리듬이 힘이야.", "새해 목표 하나, 작게 정해서 매일 해 보자."],
    2: ["한 해 동안 정말 수고했어. 새 학년에도 지금처럼만!", "졸업하는 선배들에게 축하의 박수를 보내자."],
    3: ["새 학년이야. 새 친구 이름 세 명 외워 보기!", "미세먼지 많은 날엔 마스크, 집에 가면 손 씻기."],
    4: ["황사와 미세먼지가 심한 날엔 바깥 활동을 줄이자.", "체험학습 날엔 선생님 말씀과 모이는 시간 꼭 지키기!"],
    5: ["가정의 달이야. 오늘 부모님께 ‘고맙습니다’ 한마디!", "날이 더워지기 시작해. 물 자주 마시기."],
    6: ["밥 먹기 전엔 비누로 30초 손 씻기! 식중독 예방의 시작이야.", "장마철엔 우산을 쓰고도 차를 잘 살피며 걷자.", "물놀이는 꼭 어른과 함께, 구명조끼 입고!"],
    7: ["물놀이 안전: 준비운동, 구명조끼, 혼자 들어가지 않기!", "폭염엔 낮 시간 바깥 활동을 줄이고 물을 자주 마시자.", "방학 계획은 거창하게보다 지킬 수 있게!"],
    8: ["개학이 다가와. 자는 시간부터 학교 시간에 맞춰 보자.", "더위에 지치지 않게 물 자주 마시기."],
    9: ["2학기 시작! 1학기의 나보다 한 뼘만 더 자라 보자.", "명절엔 가족에게 먼저 인사하고, 귀성길 안전 조심!"],
    10: ["책 읽기 좋은 계절이야. 하루 10쪽만 읽어 보자.", "한글날이 있는 달이야. 줄임말 말고 고운 우리말 써 보기!"],
    11: ["수능 보는 선배들을 마음으로 응원하자.", "감기 조심! 손 씻기와 기침 예절 지키기.", "날이 짧아졌어. 어두운 길은 밝은 옷, 친구와 함께."],
    12: ["빙판길에선 주머니에서 손 빼고 천천히 걷기!", "전기난로·전열기는 쓰고 나면 꼭 끄기.", "올해 나에게 칭찬 하나 해 주자. 정말 수고했어."]
  };
  var Q = ["요즘 가장 고마운 사람은 누구야?", "10년 뒤의 나에게 한마디 한다면?", "최근에 크게 웃었던 일은?", "우리 반이 더 좋아지려면 무엇이 필요할까?", "내가 잘하는 것 한 가지는?", "하루가 한 시간 더 있다면 무엇을 할래?", "요즘 새로 배우고 싶은 것은?", "가장 좋아하는 계절과 그 이유는?", "힘들 때 나를 위로해 주는 것은?", "친구에게 들었던 가장 기분 좋은 말은?", "올해 나에게 상을 준다면 무슨 상?", "우리 동네 자랑 하나!", "꼭 가 보고 싶은 곳은 어디야?", "요즘 나의 작은 목표는?", "어른이 되면 꼭 해 보고 싶은 일은?"];
  var STORY = [
    "대나무는 처음 몇 해 동안 땅 위로 거의 자라지 않는대. 그동안 땅속에 뿌리를 넓게 내리는 거야. 결과가 안 보여도 너희 뿌리는 자라고 있어.",
    "등대는 배를 쫓아다니지 않아. 그 자리에서 빛을 낼 뿐이지. 친구를 돕는 것도 그래. 늘 그 자리에서 따뜻하게 있어 주면 돼.",
    "마라톤 선수는 결승선 대신 ‘다음 전봇대’를 보고 달린대. 큰 목표가 막막하면 오늘의 전봇대 하나만 정하자.",
    "두 사람이 같은 창밖을 봤어. 한 사람은 진흙을, 한 사람은 별을 봤대. 같은 하루도 어디를 보느냐에 따라 달라져.",
    "거북이가 토끼를 이긴 건 빨라서가 아니라 멈추지 않아서야.",
    "연필은 깎일수록 짧아지지만 더 많은 글을 남겨. 힘든 시간도 우리에게 무언가를 남겨.",
    "젓가락 하나는 쉽게 부러지지만 열 개를 묶으면 안 부러져. 우리 반도 함께면 강해.",
    "물방울이 바위를 뚫는 건 힘이 세서가 아니라 계속 떨어져서야. 매일 조금씩이 제일 세.",
    "나무꾼은 도끼날을 가는 시간을 아까워하지 않아. 잘 쉬는 것도 준비야.",
    "씨앗은 자기가 어떤 꽃이 될지 몰라. 그래도 매일 물을 받아들여. 지금의 너도 그래."
  ];
  var MONTH = {
    1: ["생기부 마감 전 최종 점검(오탈자·기재 금지 사항)", "새 학년 준비: 업무 희망서·교육과정 협의 일정 확인"],
    2: ["졸업식·종업식 준비와 학년말 업무 인계", "새 학년 명렬·시간표를 받으면 쌤 노트 ‘새 학년 시작’"],
    3: ["학생 기초 조사·상담 계획 세우기", "학급 규칙과 1인 1역 정하기", "개인정보 수집·이용 동의서 확인"],
    4: ["1학기 첫 지필평가 출제·검토 일정 확인", "학부모 상담 주간 준비", "수행평가 계획 안내했는지 점검"],
    5: ["체험학습 안전 계획과 안전 교육 기록", "학생 상담 기록 정리", "수행평가 결과를 학생에게 확인받기"],
    6: ["1학기 두 번째 지필평가 준비", "출결 정리: 결석 증빙 서류 빠진 것 확인", "여름 물놀이·식중독 안전 교육"],
    7: ["1학기 성적 처리와 세특 입력", "방학 전 안전 교육과 생활 안내", "1학기 생기부 입력 점검"],
    8: ["2학기 시간표·수업 교체 확인", "개학 날 출결 확인과 방학 생활 점검"],
    9: ["2학기 학생 상담", "명절 연휴 안전 지도"],
    10: ["2학기 첫 지필평가", "진로·진학 상담(중3은 고입 준비)"],
    11: ["중3 고입 원서 접수 챙기기", "2학기 두 번째 지필평가", "생기부 입력 시작: 수업 기록장 메모 활용"],
    12: ["학기말 성적 처리", "행동특성·세특 마무리", "겨울방학 안전 교육"]
  };
  var KNOW = [
    "아동학대가 의심되면 교사는 신고 의무자예요. 확신이 없어도 ‘의심’만으로 신고할 수 있어요(112).",
    "학교폭력을 알게 되면 혼자 해결하려 하지 말고 바로 담당 선생님께 알려요.",
    "학생 사진·성적 같은 개인정보는 개인 메신저나 개인 클라우드에 올리지 않아요.",
    "교육활동 침해를 겪었다면 혼자 참지 말고 학교 교권 담당이나 교육청 교원 지원 창구와 상의해요.",
    "학부모 민원은 개인 휴대폰보다 학교 공식 창구로 받는 것이 나를 지키는 방법이에요.",
    "상담 기록은 판단보다 관찰을, 날짜와 사실 위주로 적어요.",
    "학부모 상담 첫마디는 아이의 좋은 점부터. 걱정은 그다음에, 함께 방법을 찾는 말로.",
    "화난 학부모와 통화할 땐: 끝까지 듣기 → 요점 다시 말하기 → 확인 후 연락드리겠다고 약속하기.",
    "학생과 1:1 상담은 문을 열어 두거나 보이는 곳에서 하면 서로를 지켜요.",
    "체험학습·외부 활동 전에는 안전 교육을 하고 기록을 남겨 두세요.",
    "결석 증빙 서류 기준은 학교 출결 규정으로 확인해요.",
    "생기부엔 교외 수상, 어학 시험 성적, 부모의 직업 등을 적지 않아요. 해마다 나오는 기재요령을 꼭 확인해요.",
    "생기부엔 특정 대학·기관·상호명을 쓰지 않아요.",
    "세특은 학생이 한 일과 드러난 역량을 구체적으로. ‘우수함’ 같은 말만으로는 부족해요.",
    "행동특성 및 종합의견은 한 해 동안의 변화와 성장이 보이게 써요.",
    "발문 팁: “답이 뭐야?” 대신 “어떻게 생각했어?”라고 물어보세요.",
    "발문 팁: 틀린 답에 “누구 생각과 비슷해?”로 이어 가면 오답도 배움이 돼요.",
    "수업 팁: 질문 뒤 3초만 기다려 보세요. 손드는 아이가 늘어요.",
    "수학 수업 팁: 풀기 전에 “어림하면 얼마쯤일까?”를 먼저 물어보기.",
    "수학 수업 팁: 다 푼 학생에게 “다른 방법도 있을까?” 질문 하나.",
    "수업 팁: 마지막 3분, ‘오늘 배운 것 한 줄 쓰기’로 마무리.",
    "상담 팁: “왜 그랬어?”보다 “무슨 일이 있었어?”가 아이의 입을 열어요.",
    "상담 팁: 아이가 말할 땐 해결책보다 공감이 먼저예요.",
    "칭찬 팁: 결과보다 노력과 방법을 칭찬하면 도전하는 아이가 돼요.",
    "공문 팁: 기한 있는 공문은 받자마자 쌤 노트 ‘할 일’에 적어 두기.",
    "업무 팁: 해마다 반복되는 서류는 쌤 노트 문서 도우미로 시간을 아껴요.",
    "연수 팁: 의무연수는 학기 초에 미리 챙겨 두면 연말이 편해요."
  ];
  var TIPS = [
    "맨 위 날짜를 누르면 학교 업무판, 시각을 누르면 시간표로 가요.",
    "학교 이름에 마우스를 올리면 연락처가 보여요. 누르면 내선번호!",
    "/ 키를 누르면 바로 찾기 칸으로 가요.",
    "찾기 칸에 ‘종례: 내일 체육복’처럼 적으면 종례 때 전할 말로 들어가요.",
    "찾기 칸에 ‘할 일: 금요일 회의 자료’처럼 적으면 날짜까지 알아서 넣어요.",
    "찾기 칸에 ‘소식: …’을 적으면 학교 소식을 모든 선생님 쌤비에게 보낼 수 있어요.",
    "학생 이름에 마우스를 올리면 그 학생 정보가 살짝 보여요.",
    "선생님 이름에 마우스를 올리면 지금 수업 중인지 보여요.",
    "날짜에 마우스를 올리면 오늘·다음 급식이 보여요.",
    "쌤비에 마우스를 올리면 다가오는 학사일정이 보여요.",
    "쌤비를 누르고 말하면 말로 기록할 수 있어요.",
    "한 달에 한 번, 설정 → 전체 백업 저장!",
    "설정 → 화면 꾸미기에서 계절 색과 글꼴을 바꿀 수 있어요.",
    "퇴근 도장을 모으면 숨은 배지가 열려요.",
    "말풍선을 누르면 다음 이야기가 나와요.",
    "? 키를 누르면 단축키 안내가 나와요.",
    "Alt+B로 쌤비를 바로 불러요."
  ];
  var DAYS = {"01-01": "새해 첫날이에요. 올해도 잘 부탁드려요!", "03-01": "오늘은 삼일절이에요.", "03-14": "오늘은 파이(π)데이! 3.14159…", "03-22": "오늘은 세계 물의 날이에요.", "04-05": "오늘은 식목일이에요.", "04-20": "오늘은 장애인의 날이에요.", "04-21": "오늘은 과학의 날이에요.", "04-22": "오늘은 지구의 날이에요.", "04-23": "오늘은 세계 책의 날이에요.", "05-05": "오늘은 어린이날이에요.", "05-08": "오늘은 어버이날이에요.", "05-15": "오늘은 스승의 날이에요. 선생님, 늘 고맙습니다!", "05-31": "오늘은 바다의 날이에요.", "06-05": "오늘은 환경의 날이에요.", "06-06": "오늘은 현충일이에요.", "06-25": "오늘은 6·25 전쟁이 일어난 날이에요.", "07-17": "오늘은 제헌절이에요.", "08-15": "오늘은 광복절이에요.", "10-01": "오늘은 국군의 날이에요.", "10-03": "오늘은 개천절이에요.", "10-09": "오늘은 한글날이에요. 고운 우리말 한마디!", "10-25": "오늘은 독도의 날이에요.", "11-09": "오늘은 소방의 날이에요. 불조심!", "11-11": "오늘은 농업인의 날이에요. 가래떡 한 조각 어떠세요?", "11-17": "오늘은 순국선열의 날이에요.", "12-10": "오늘은 세계 인권의 날이에요.", "12-25": "메리 크리스마스!"};
  var TERMS = [["01-05", "소한", "한 해 중 가장 춥다는 때"], ["01-20", "대한", "큰 추위라는 절기"], ["02-04", "입춘", "봄이 시작된다는 절기"], ["02-19", "우수", "눈이 녹아 비가 된다는 절기"], ["03-05", "경칩", "개구리가 깨어난다는 절기"], ["03-20", "춘분", "낮과 밤의 길이가 같아지는 날"], ["04-04", "청명", "하늘이 맑아진다는 절기"], ["04-20", "곡우", "곡식을 깨우는 봄비가 내린다는 절기"], ["05-05", "입하", "여름이 시작된다는 절기"], ["05-21", "소만", "만물이 자라 가득 찬다는 절기"], ["06-05", "망종", "씨 뿌리기 좋은 때"], ["06-21", "하지", "낮이 가장 긴 날"], ["07-07", "소서", "더위가 시작된다는 절기"], ["07-22", "대서", "가장 덥다는 절기"], ["08-07", "입추", "가을이 시작된다는 절기"], ["08-23", "처서", "더위가 물러간다는 절기"], ["09-07", "백로", "이슬이 맺히기 시작한다는 절기"], ["09-23", "추분", "다시 낮과 밤이 같아지는 날"], ["10-08", "한로", "찬 이슬이 맺힌다는 절기"], ["10-23", "상강", "서리가 내린다는 절기"], ["11-07", "입동", "겨울이 시작된다는 절기"], ["11-22", "소설", "첫눈이 내린다는 절기"], ["12-07", "대설", "큰 눈이 내린다는 절기"], ["12-21", "동지", "밤이 가장 긴 날, 팥죽 한 그릇!"]];

  var CATS = {cheer: "힘이 되는 말", act: "오늘의 작은 실천", kids: "아이들에게 해 줄 이야기", month: "이달의 학교 일", know: "알아 두면 좋아요", tips: "쌤 노트 꿀팁", day: "오늘은 무슨 날", stat: "우리 반·나 기록", news: "교육 소식", school: "학교 소식"};

  /* ───────── 도우미 ───────── */
  function pad(n){ return (n < 10 ? "0" : "") + n; }
  function ymd(d){ d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hash(s){ var h = 2166136261; for(var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function ls(k, v){ try{ if(v === undefined){ var x = localStorage.getItem(k); return x ? JSON.parse(x) : null; } localStorage.setItem(k, JSON.stringify(v)); }catch(e){ return null; } }
  function cfg(){ return ls("sn_talk_cfg") || {off: {}}; }
  function isOn(c){ var o = cfg(); return !(o.off && o.off[c]); }
  function board(){ var B = {}; try{ B = TT.store.get("tt_board_v1", null) || {}; }catch(e){} return B.url && B.pw && /^https:\/\/script\.google\.com\//.test(B.url) ? B : null; }
  function post(o){
    var B = board(); if(!B) return Promise.reject(new Error("NOBOARD"));
    return fetch(B.url, {method: "POST", redirect: "follow", credentials: "omit", cache: "no-store", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(Object.assign({pw: B.pw}, o))})
      .then(function(r){ return r.json(); }).then(function(j){ if(!j || !j.ok) throw new Error(j && j.error || "응답 없음"); return j; });
  }
  function closeMin(){ var w = new Date().getDay(); return ({1: 910, 2: 965, 3: 910, 4: 965, 5: 910})[w] || 910; }
  function it(cat, text, id, more){ var o = {cat: cat, text: text, id: id || cat + ":" + (hash(text) % 1e6)}; if(more) for(var k in more) o[k] = more[k]; return o; }

  /* ───────── 업무판에서 받은 학교 소식 · 교육 소식 ───────── */
  var SK = "sn_talk_srv_v1", busy = false;
  function srv(){ return ls(SK) || {}; }
  function refresh(force){
    if(busy || !board()) return;
    var S = srv(), age = Date.now() - (S.at || 0);
    if(!force && (S.unsup ? age < 864e5 : age < 3 * 36e5)) return;
    busy = true;
    post({action: "talk"}).then(function(j){
      busy = false; ls(SK, {at: Date.now(), notices: (j.notices || []).slice(0, 30), news: (j.news || []).slice(0, 12)});
      if(window.TT_SBHOME && TT_SBHOME.render) try{ TT_SBHOME.render(); }catch(e){}
    }, function(e){
      busy = false; var m = String(e && e.message || e);
      ls(SK, {at: Date.now(), notices: S.notices || [], news: S.news || [], unsup: /지원하지 않는|unknown|UNKNOWN/.test(m)});
    });
  }
  function notices(){ var t = ymd(); return (srv().notices || []).filter(function(n){ return n && n.text && (!n.from || n.from <= t) && (!n.to || n.to >= t); }); }

  /* ───────── 지금 어떤 이야기를 할까 ───────── */
  function slot(){
    var d = new Date(), w = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), cm = closeMin();
    if(w === 0 || w === 6) return "wkend";
    if(m >= 18 * 60 || m < 5 * 60) return "rest";
    if(m < 8 * 60 + 20) return "morning";
    if(m < 8 * 60 + 50) return "jo";
    if(m >= cm - 40 && m <= cm + 10) return "jong";
    if(m > cm + 10) return "after";
    return m < 12 * 60 ? "am" : "pm";
  }
  function stats(){
    var out = [], J = TT.joy && TT.joy.on && TT.joy.on() ? TT.joy : null; if(!J) return out;
    try{ var ws = J.weekSaved ? J.weekSaved() : 0; if(ws >= 10) out.push(it("stat", "이번 주 쌤 노트로 " + (ws >= 60 ? Math.floor(ws / 60) + "시간 " + (ws % 60 ? ws % 60 + "분" : "") : ws + "분") + "을 아꼈어요.", "stat:ws")); }catch(e){}
    try{ var ms = J.monthStamps ? J.monthStamps() : 0; if(ms >= 2) out.push(it("stat", "이번 달 퇴근 도장 " + ms + "개째! 꾸준함이 최고예요.", "stat:ms")); }catch(e){}
    try{ var dd = J.dday ? J.dday() : null; if(dd && dd.n > 0 && dd.n <= 60) out.push(it("stat", dd.t + "까지 D-" + dd.n + "이에요.", "stat:dd")); }catch(e){}
    return out;
  }
  function dayItems(){
    var d = new Date(), k = pad(d.getMonth() + 1) + "-" + pad(d.getDate()), out = [];
    if(DAYS[k]) out.push(it("day", DAYS[k], "day:" + k));
    TERMS.forEach(function(t){ var td = new Date(d.getFullYear(), +t[0].slice(0, 2) - 1, +t[0].slice(3)), df = Math.round((d - td) / 864e5); if(df >= -1 && df <= 2) out.push(it("day", "이맘때는 " + t[1] + ", " + t[2] + "예요.", "term:" + t[1])); });
    return out;
  }
  function pool(sl){
    var d = new Date(), mo = d.getMonth() + 1, w = d.getDay(), P = [];
    function add(cat, arr, mk){ if(!isOn(cat)) return; arr.forEach(function(x){ P.push(mk ? mk(x) : it(cat, x)); }); }
    var kidsMk = function(x){ return it("kids", x, null, {acts: [["bag", "📣 종례 때 전하기"]]}); };
    var qMk = function(x){ return it("kids", "오늘의 질문: " + x, "q:" + (hash(x) % 1e6), {acts: [["bag", "📣 종례 때 전하기"]]}); };
    var sMk = function(x){ return it("kids", x, "st:" + (hash(x) % 1e6), {tag: "1분 이야기", acts: [["bag", "📣 종례 때 전하기"]]}); };
    var exam = TT.joy && TT.joy.examNear && TT.joy.examNear();
    if(sl === "rest"){ add("cheer", REST); return P; }
    if(sl === "wkend"){ add("cheer", WKEND); return P; }
    if(sl === "jo" || sl === "jong"){
      add("kids", KIDS_M[mo] || [], kidsMk); add("kids", KIDS_M[mo] || [], kidsMk);   // 이달 이야기는 두 번 넣어 자주
      add("kids", KIDS, kidsMk); add("kids", Q, qMk); add("kids", STORY, sMk);
      return P;
    }
    if(sl === "morning"){
      add("cheer", w === 1 ? MON.concat(MON) : w === 5 ? FRI.concat(FRI) : []);
      add("cheer", exam ? EXAM.concat(EXAM) : []); add("cheer", mo === 11 || mo === 12 || mo === 7 ? REC : []);
      add("cheer", CHEER); add("act", ACT, function(x){ return it("act", "오늘의 작은 실천: " + x); });
      if(isOn("day")) P = P.concat(dayItems(), dayItems());
      return P;
    }
    if(sl === "after"){ add("cheer", w === 5 ? FRI.concat(FRI) : []); add("cheer", CHEER.slice(0, 20)); add("act", ACT.slice(0, 8), function(x){ return it("act", "오늘의 작은 실천: " + x); }); }
    else { add("know", KNOW); add("tips", TIPS); add("month", MONTH[mo] || [], function(x){ return it("month", x); }); add("month", MONTH[mo] || [], function(x){ return it("month", x); }); if(exam) add("cheer", EXAM); }
    if(isOn("stat")) P = P.concat(stats(), stats());
    if(isOn("day")) P = P.concat(dayItems());
    if(isOn("news")) (srv().news || []).slice(0, 6).forEach(function(n){ if(n && n.t) P.push(it("news", n.t, "news:" + (hash(n.t) % 1e6), {tag: "교육 소식" + (n.src ? " · " + n.src : ""), link: n.link || "", acts: n.link ? [["open", "기사 열기 ›"]] : null})); });
    return P;
  }
  function pickFrom(P, key, off){
    if(!P.length) return null;
    var seen = ls("sn_talk_seen") || {}, now = Date.now(), fresh = P.filter(function(x){ return !seen[x.id] || now - seen[x.id] > 21 * 864e5; });
    var L = fresh.length ? fresh : P, i = (hash(key) + (off || 0) * 7919) % L.length;
    return L[i];
  }
  function markSeen(id){
    var s = ls("sn_talk_seen") || {}, now = Date.now(); s[id] = now;
    var ks = Object.keys(s); if(ks.length > 400) ks.sort(function(a, b){ return s[a] - s[b]; }).slice(0, ks.length - 400).forEach(function(k){ delete s[k]; });
    ls("sn_talk_seen", s);
  }
  /* 지금 말풍선에 띄울 이야기 하나: {cat, tag, text, acts, link} — 없으면 null */
  var curItem = null;
  function current(){
    if(TT.classroom) return null;
    refresh(false);
    var sl = slot(), t = ymd(), key = t + "|" + sl, C = null; try{ C = JSON.parse(sessionStorage.getItem("sn_talk_cur") || "null"); }catch(e){}
    var N = isOn("school") && sl !== "rest" && sl !== "wkend" ? notices() : [];
    var shownN = ls("sn_talk_nseen") || {};
    if(!C || C.key !== key){
      var nn = N.filter(function(n){ return shownN[n.id] !== t; })[0];       // 오늘 아직 안 보여 준 학교 소식이 먼저
      C = {key: key, off: 0, nid: nn ? nn.id : ""};
    }
    var item = null;
    if(C.nid){ var n0 = N.filter(function(n){ return n.id === C.nid; })[0]; if(n0){ item = it("school", n0.text, "sch:" + n0.id, {tag: "📢 학교 소식" + (n0.by ? " · " + n0.by : "")}); shownN[n0.id] = t; ls("sn_talk_nseen", shownN); } }
    if(!item){
      var P = pool(sl); N.forEach(function(n){ P.push(it("school", n.text, "sch:" + n.id, {tag: "📢 학교 소식" + (n.by ? " · " + n.by : "")})); });
      if(C.id){ item = P.filter(function(x){ return x.id === C.id; })[0] || null; }
      if(!item){ item = pickFrom(P, key, C.off); if(item){ C.id = item.id; markSeen(item.id); } }
    }
    try{ sessionStorage.setItem("sn_talk_cur", JSON.stringify(C)); }catch(e){}
    curItem = item; return item;
  }
  function next(){
    var C = null; try{ C = JSON.parse(sessionStorage.getItem("sn_talk_cur") || "null"); }catch(e){}
    C = C || {key: "", off: 0}; C.off = (C.off || 0) + 1; C.id = ""; C.nid = "";
    try{ sessionStorage.setItem("sn_talk_cur", JSON.stringify(C)); }catch(e){}
    if(window.TT_SBHOME && TT_SBHOME.render) TT_SBHOME.render();
  }
  function act(k){
    var x = curItem; if(!x) return;
    if(k === "bag"){
      var txt = x.text.replace(/^오늘의 질문:\s*/, "오늘의 질문 — ");
      if(window.TT_TODAY && TT_TODAY.bag) TT_TODAY.bag(txt); else TT.ui.toast("종례 바구니를 쓸 수 없어요.");
    }else if(k === "open" && x.link){ window.open(x.link, "_blank", "noopener"); }
  }
  /* 말풍선 모양: line(굵은 글) · tag(작은 꼬리표) · acts(작은 단추) */
  function bubble(){
    var x = current(); if(!x) return null;
    return {line: x.text, tag: x.tag || CATS[x.cat] || "", acts: x.acts || null, talk: 1};
  }

  /* ───────── 설정 → 쌤비 이야기 (종류 켜고 끄기 · 학교 소식 보내기) ───────── */
  var dlg = null;
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]; }); }
  function addD(n){ var d = new Date(); d.setDate(d.getDate() + n); return d; }
  function friday(){ var d = new Date(), w = d.getDay(); d.setDate(d.getDate() + (w <= 5 ? 5 - w : 6)); return d; }
  function css(){
    if(document.getElementById("talkCss")) return;
    var s = document.createElement("style"); s.id = "talkCss";
    s.textContent = "#dlgTalk{max-width:min(560px,94vw);width:560px;border:1px solid var(--t-line,#ddd);border-radius:18px;padding:18px 20px;background:var(--t-card,#fff);color:var(--t-ink,#222)}"
      + "#dlgTalk::backdrop{background:rgba(20,30,40,.35)}#dlgTalk h2{margin:0;font-size:18px}#dlgTalk .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}"
      + "#dlgTalk .tkTabs{display:flex;gap:6px;margin:0 0 12px;padding:0;border:0;background:none}#dlgTalk .tkTabs button{font:inherit;font-size:14px;border:1px solid var(--t-line,#ddd);background:transparent;border-radius:999px;padding:6px 14px;cursor:pointer;color:var(--t-sub,#666)}#dlgTalk .tkTabs button.on{background:var(--t-accent,#2f6fb5);border-color:var(--t-accent,#2f6fb5);color:#fff}"
      + "#dlgTalk textarea{width:100%;height:68px!important;min-height:0!important;box-sizing:border-box;font:inherit;font-size:15px;border:1px solid var(--t-line,#ddd);border-radius:12px;padding:10px 12px;resize:none;background:var(--t-card,#fff);color:inherit}"
      + "#dlgTalk .chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}#dlgTalk .chips button{font:inherit;font-size:13.5px;border:1px solid var(--t-line,#ddd);background:transparent;border-radius:999px;padding:5px 12px;cursor:pointer;color:inherit}#dlgTalk .chips button.on{border-color:var(--t-accent,#2f6fb5);color:var(--t-accent,#2f6fb5);font-weight:700;background:var(--t-accent-soft,#eef4fb)}"
      + "#dlgTalk .row{display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:10px}#dlgTalk .btn{font:inherit;font-size:14px;border:1px solid var(--t-line,#ddd);background:var(--t-card,#fff);border-radius:10px;padding:7px 14px;cursor:pointer;color:inherit}#dlgTalk .btn.p{background:var(--t-accent,#2f6fb5);border-color:var(--t-accent,#2f6fb5);color:#fff}"
      + "#dlgTalk .m{font-size:13px;color:var(--t-sub,#666)}#dlgTalk .er{font-size:13px;color:#c0392b;margin-right:auto}#dlgTalk .ls{margin-top:12px;border-top:1px solid var(--t-line,#ddd);padding-top:8px;max-height:30vh;overflow:auto}"
      + "#dlgTalk .ls div{display:flex;gap:8px;align-items:center;padding:6px 0;font-size:14px;border-bottom:1px dashed var(--t-line,#eee)}#dlgTalk .ls div span{flex:1;min-width:0}#dlgTalk .ls small{color:var(--t-sub,#666);white-space:nowrap}#dlgTalk .ls button{border:0;background:transparent;cursor:pointer;font-size:15px;color:var(--t-sub,#666)}"
      + "#dlgTalk .cats{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}#dlgTalk .cats label{display:flex;gap:8px;align-items:center;font-size:14.5px;padding:6px 8px;border-radius:10px;cursor:pointer}#dlgTalk .cats label:hover{background:var(--t-chip,#f2f2f2)}"
      + "@media (max-width:560px){#dlgTalk .cats{grid-template-columns:1fr}}"
      /* 말풍선 꼬리표 · 단추 */
      + "#sbHero .bub .ttag{display:block;font-size:12.5px;font-weight:700;color:var(--t-accent,#2f6fb5);margin-bottom:2px;white-space:nowrap;background:none;border:0;padding:0}#sbHero .bub .acts{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}"
      + "#sbHero .bub .acts button{font:inherit;font-size:12.5px;font-weight:700;border:1px solid var(--t-line,#ddd);background:var(--t-card,#fff);color:var(--t-accent,#2f6fb5);border-radius:999px;padding:3px 10px;cursor:pointer}#sbHero .bub .acts button:hover{background:var(--t-accent-soft,#eef4fb)}"
      + "#sbHero .bub.talk .b0{cursor:pointer}#sbHero .bub.talk .b0 p{font-weight:600}";
    document.head.appendChild(s);
  }
  var sendDays = "today";
  function range(){ var t = ymd(); return sendDays === "today" ? [t, t] : sendDays === "tmr" ? [t, ymd(addD(1))] : sendDays === "week" ? [t, ymd(friday())] : [t, ymd(addD(14))]; }
  function open(tab, preset){
    css();
    if(!dlg){ dlg = document.createElement("dialog"); dlg.id = "dlgTalk"; document.body.appendChild(dlg);
      dlg.addEventListener("click", function(e){ if(e.target === dlg) dlg.close(); });
      dlg.addEventListener("cancel", function(){ dlg.close(); });
    }
    draw(tab || "send", preset || "");
    if(dlg.showModal && !dlg.open) dlg.showModal();
  }
  function draw(tab, preset){
    var B = board(), h = '<div class="hd"><h2>📣 쌤비 이야기</h2><button type="button" class="btn" data-x>닫기</button></div>'
      + '<div class="tkTabs"><button type="button" data-tab="send"' + (tab === "send" ? ' class="on"' : "") + '>📢 학교 소식 보내기</button><button type="button" data-tab="cats"' + (tab === "cats" ? ' class="on"' : "") + ">🦉 들을 이야기 고르기</button></div>";
    if(tab === "cats"){
      var o = cfg();
      h += '<p class="m" style="margin:0 0 8px">쌤비가 한가할 때 전해 줄 이야기 종류예요. 끄면 그 이야기는 나오지 않아요.</p><div class="cats">'
        + Object.keys(CATS).map(function(k){ return '<label><input type="checkbox" data-cat="' + k + '"' + (o.off && o.off[k] ? "" : " checked") + "> " + CATS[k] + "</label>"; }).join("") + "</div>"
        + '<div class="row"><span class="m" style="margin-right:auto">말풍선을 누르면 다음 이야기가 나와요.</span><button type="button" class="btn p" data-x>확인</button></div>';
    }else if(!B){
      h += '<p>학교 소식은 <b>학교 업무판</b>을 거쳐 모든 선생님 쌤 노트에 전해져요. 먼저 설정 → 학교 업무판 연결을 해 주세요.</p><div class="row"><button type="button" class="btn p" data-x>확인</button></div>';
    }else{
      var nm = ""; try{ nm = TT.school.load().teacher || ""; }catch(e){}
      h += '<textarea id="tkText" rows="2" maxlength="80" placeholder="예: 내일 3교시 소방 대피 훈련이 있어요">' + esc(preset) + "</textarea>"
        + '<div class="chips" id="tkDays">' + [["today", "오늘만"], ["tmr", "내일까지"], ["week", "이번 주"], ["2w", "2주"]].map(function(c){ return '<button type="button" data-d="' + c[0] + '"' + (sendDays === c[0] ? ' class="on"' : "") + ">" + c[1] + "</button>"; }).join("")
        + '<span class="m" style="align-self:center;margin-left:auto">보낸 이 <input id="tkBy" value="' + esc(nm) + '" maxlength="10" style="width:84px;font:inherit;font-size:13px;border:1px solid var(--t-line,#ddd);border-radius:8px;padding:3px 6px"></span></div>'
        + '<p class="m" style="margin:0">모든 선생님 쌤비 말풍선에 기간 동안 하루 한 번 먼저 보여요. 학생 이름 같은 개인정보는 적지 마세요.</p>'
        + '<div class="row"><span class="er" id="tkErr"></span><button type="button" class="btn p" data-send>보내기</button></div>'
        + '<div class="ls" id="tkList"><p class="m">보낸 소식을 불러오는 중…</p></div>';
    }
    dlg.innerHTML = h;
    dlg.onclick = function(e){
      var b = e.target.closest("button,input[type=checkbox]"); if(!b) return;
      if(b.hasAttribute("data-x")){ dlg.close(); if(window.TT_SBHOME) TT_SBHOME.render(); return; }
      if(b.dataset.tab){ draw(b.dataset.tab, ""); return; }
      if(b.dataset.d){ sendDays = b.dataset.d; Array.prototype.forEach.call(dlg.querySelectorAll("#tkDays button"), function(x){ x.classList.toggle("on", x === b); }); return; }
      if(b.dataset.cat){ var o = cfg(); o.off = o.off || {}; if(b.checked) delete o.off[b.dataset.cat]; else o.off[b.dataset.cat] = 1; ls("sn_talk_cfg", o); try{ sessionStorage.removeItem("sn_talk_cur"); }catch(x){} return; }
      if(b.hasAttribute("data-send")) send();
      if(b.dataset.del) del(b.dataset.del);
    };
    if(tab === "send" && B){ var ta = dlg.querySelector("#tkText"); setTimeout(function(){ ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 0);
      ta.addEventListener("keydown", function(e){ if(e.key === "Enter" && !e.shiftKey && !e.isComposing){ e.preventDefault(); send(); } });
      list(); }
  }
  function errMsg(e){ var m = String(e && e.message || e); return /지원하지 않는|unknown/i.test(m) ? "업무판 스크립트에 학교 소식 기능이 아직 없어요(Talk.gs 추가 필요)." : /AUTH/.test(m) ? "업무판 비밀번호가 바뀌었어요. 업무판 연결에서 다시 넣어 주세요." : "보내지 못했어요. 인터넷 연결을 확인해 주세요."; }
  function list(){
    var L = dlg && dlg.querySelector("#tkList"); if(!L) return;
    post({action: "talk"}).then(function(j){
      ls(SK, {at: Date.now(), notices: (j.notices || []).slice(0, 30), news: (j.news || []).slice(0, 12)});
      var N = j.notices || [];
      L.innerHTML = N.length ? '<p class="m" style="margin:0 0 4px">지금 전하고 있는 소식</p>' + N.map(function(n){ return "<div><span>" + esc(n.text) + "</span><small>" + esc((n.from || "").slice(5).replace("-", "/") + "~" + (n.to || "").slice(5).replace("-", "/") + (n.by ? " · " + n.by : "")) + '</small><button type="button" data-del="' + esc(n.id) + '" title="지우기" aria-label="지우기">🗑</button></div>'; }).join("") : '<p class="m">지금 전하고 있는 소식이 없어요.</p>';
    }, function(e){ L.innerHTML = '<p class="m">' + esc(errMsg(e)) + "</p>"; });
  }
  function send(){
    var ta = dlg.querySelector("#tkText"), er = dlg.querySelector("#tkErr"), v = ta.value.replace(/\s+/g, " ").trim(), r = range();
    if(v.length < 2){ er.textContent = "소식을 적어 주세요."; return; }
    er.textContent = "보내는 중…";
    post({action: "talkadd", text: v.slice(0, 80), from: r[0], to: r[1], by: (dlg.querySelector("#tkBy").value || "").trim().slice(0, 10)}).then(function(){
      ta.value = ""; er.textContent = ""; TT.ui.toast("📢 모든 선생님 쌤비에게 소식을 보냈어요."); try{ sessionStorage.removeItem("sn_talk_cur"); }catch(x){} list();
    }, function(e){ er.textContent = errMsg(e); });
  }
  function del(id){
    post({action: "talkdel", id: id}).then(function(){ TT.ui.toast("소식을 지웠어요."); list(); }, function(e){ var er = dlg.querySelector("#tkErr"); if(er) er.textContent = errMsg(e); });
  }

  css();
  window.TT_TALK = {bubble: bubble, next: next, act: act, open: open, refresh: refresh, slot: slot};
})();
